const express = require('express');
const router = express.Router();
const webhookController = require('../controllers/webhookController');
const { verifyMetaSignature, verifyTelegramSignature } = require('../middleware/webhookSignature');

// Middleware para verificar API key de webhooks
const verifyWebhookKey = (req, res, next) => {
  const apiKey = req.headers['x-webhook-key'] || req.query.key;
  const validKey = process.env.WEBHOOK_API_KEY;

  if (!validKey) {
    console.error('⚠️  WEBHOOK_API_KEY no configurada en variables de entorno');
    return res.status(500).json({
      success: false,
      error: 'Webhook no configurado correctamente'
    });
  }

  // Permitir verificación de Meta sin key (GET con hub.mode)
  if (req.method === 'GET' && req.query['hub.mode']) {
    return next();
  }

  if (!apiKey || apiKey !== validKey) {
    return res.status(401).json({
      success: false,
      error: 'API key inválida'
    });
  }

  next();
};

// Health check (público)
router.get('/health', webhookController.healthCheck);

// Verificación de Meta Webhooks (público - Meta necesita verificar)
router.get('/meta', webhookController.verifyWebhook);

// Recibir mensajes manualmente / desde n8n (protegido con API key)
router.post('/message', verifyWebhookKey, webhookController.handleIncomingMessage);

// Confirmar envío de mensaje
router.post('/message/confirm', verifyWebhookKey, webhookController.confirmMessageSent);

// Actualizar estado de mensaje
router.post('/message/status', verifyWebhookKey, webhookController.updateMessageStatus);

// =====================================================
// WEBHOOK DE META (WhatsApp, Messenger, Instagram)
// verifyMetaSignature valida X-Hub-Signature-256
// =====================================================
router.post('/meta', verifyMetaSignature, async (req, res) => {
  // IMPORTANTE: Responder 200 inmediatamente a Meta
  // Meta requiere respuesta en < 20 segundos o reintentará
  res.sendStatus(200);

  try {
    const { object, entry } = req.body;

    if (!entry || !Array.isArray(entry)) return;

    for (const e of entry) {
      try {
        // ===== WHATSAPP =====
        if (object === 'whatsapp_business_account') {
          const changes = e.changes || [];
          for (const change of changes) {
            const value = change.value;
            if (!value) continue;

            // Procesar status updates
            if (value.statuses) {
              for (const status of value.statuses) {
                await webhookController.processStatusUpdate({
                  platform: 'whatsapp',
                  messageId: status.id,
                  status: status.status,
                  timestamp: status.timestamp,
                  recipientId: status.recipient_id
                }).catch(err => console.error('Error procesando status WhatsApp:', err));
              }
            }

            // Procesar mensajes
            if (value.messages) {
              for (const msg of value.messages) {
                // Ignorar reacciones
                if (msg.type === 'reaction') continue;

                let messageContent = '';
                let msgType = msg.type || 'text';

                switch (msg.type) {
                  case 'text': messageContent = msg.text?.body || ''; break;
                  case 'image': messageContent = msg.image?.caption || '[Imagen]'; break;
                  case 'audio': messageContent = '[Audio]'; break;
                  case 'video': messageContent = msg.video?.caption || '[Video]'; break;
                  case 'document': messageContent = msg.document?.filename || '[Documento]'; break;
                  case 'sticker': messageContent = '[Sticker]'; break;
                  case 'location': messageContent = `[Ubicación: ${msg.location?.latitude}, ${msg.location?.longitude}]`; break;
                  case 'contacts': messageContent = '[Contacto compartido]'; break;
                  default: messageContent = `[${msg.type || 'Desconocido'}]`;
                }

                if (!messageContent) continue;

                await webhookController.processWebhookMessage({
                  platform: 'whatsapp',
                  platformAccountId: value.metadata?.phone_number_id,
                  contactId: msg.from,
                  contactName: value.contacts?.[0]?.profile?.name || 'Sin nombre',
                  contactPhone: msg.from,
                  message: messageContent,
                  messageType: msgType,
                  messageId: msg.id,
                  timestamp: msg.timestamp
                }).catch(err => console.error('Error procesando mensaje WhatsApp:', err));
              }
            }
          }
        }

        // ===== MESSENGER =====
        if (object === 'page') {
          const messagingEvents = e.messaging || [];
          for (const event of messagingEvents) {
            if (!event.message || event.message.is_echo) continue;

            await webhookController.processWebhookMessage({
              platform: 'messenger',
              platformAccountId: event.recipient?.id,
              contactId: event.sender?.id,
              message: event.message?.text || '[Media]',
              messageType: event.message?.attachments ? 'media' : 'text',
              messageId: event.message?.mid,
              timestamp: event.timestamp
            }).catch(err => console.error('Error procesando mensaje Messenger:', err));
          }
        }

        // ===== INSTAGRAM =====
        if (object === 'instagram') {
          const messagingEvents = e.messaging || [];
          for (const event of messagingEvents) {
            if (!event.message || event.message.is_echo) continue;

            await webhookController.processWebhookMessage({
              platform: 'instagram',
              platformAccountId: event.recipient?.id,
              contactId: event.sender?.id,
              message: event.message?.text || '[Media]',
              messageType: event.message?.attachments ? 'media' : 'text',
              messageId: event.message?.mid,
              timestamp: event.timestamp
            }).catch(err => console.error('Error procesando mensaje Instagram:', err));
          }
        }

      } catch (entryError) {
        console.error('Error procesando entry del webhook:', entryError);
      }
    }
  } catch (error) {
    console.error('Error procesando webhook de Meta:', error);
  }
});

// =====================================================
// WEBHOOK DE TELEGRAM
// Per-client webhook: /webhook/telegram/:clientServiceId
// =====================================================
router.post('/telegram/:clientServiceId', verifyTelegramSignature, webhookController.handleTelegramWebhookByClient);
router.post('/telegram', verifyTelegramSignature, webhookController.handleTelegramWebhook);

// =====================================================
// WEBCHAT (Widget embebido)
// =====================================================
router.post('/webchat', async (req, res) => {
  try {
    const { businessId, visitorId, visitorName, message, sessionId } = req.body;

    if (!businessId || !visitorId || !message) {
      return res.status(400).json({
        success: false,
        error: 'businessId, visitorId y message son requeridos'
      });
    }

    req.body = {
      platform: 'webchat',
      businessId,
      contactId: visitorId,
      contactName: visitorName || `Visitante ${visitorId.slice(-4)}`,
      message,
      messageType: 'text',
      messageId: `webchat_${Date.now()}`
    };

    return webhookController.handleIncomingMessage(req, res);
  } catch (error) {
    console.error('Error procesando webhook de WebChat:', error);
    res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
});

// Widget endpoints (públicos)
router.post('/webchat/init', webhookController.initWebChat);
router.post('/webchat/message', webhookController.sendWebChatMessage);

module.exports = router;
