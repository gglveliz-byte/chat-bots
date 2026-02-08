const { query, transaction } = require('../config/database');
const { SENDER_TYPES, MESSAGE_TYPES, MESSAGE_STATUS } = require('../config/constants');
const { generateResponse, detectIntent, analyzeSentiment } = require('../services/openaiService');
const metaService = require('../services/metaService');
const telegramService = require('../services/telegramService');
const { emitNewMessage, emitBotResponse, emitNewConversation } = require('../websocket/socketManager');
const { checkMessageLimit, incrementMessageCount, checkConversationLimit, incrementConversationCount } = require('../services/messageLimitService');
const { sendDailyLimitReachedEmail } = require('../services/emailService');

// =====================================================
// HELPER: Verificar horario de atención
// =====================================================
function isWithinBusinessHours(botConfig) {
  if (!botConfig?.business_hours) return true;

  let businessHours;
  try {
    businessHours = typeof botConfig.business_hours === 'string'
      ? JSON.parse(botConfig.business_hours)
      : botConfig.business_hours;
  } catch {
    return true; // Si no se puede parsear, asumir que está disponible
  }

  if (!businessHours.enabled) return true;

  const now = new Date();
  const timezone = businessHours.timezone || 'America/Bogota';

  // Obtener hora actual en la zona horaria del negocio
  let localTime;
  try {
    localTime = new Date(now.toLocaleString('en-US', { timeZone: timezone }));
  } catch {
    localTime = now;
  }

  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const currentDay = dayNames[localTime.getDay()];
  const schedule = businessHours.schedule?.[currentDay];

  if (!schedule || !schedule.enabled) return false;

  const currentMinutes = localTime.getHours() * 60 + localTime.getMinutes();
  const [openH, openM] = (schedule.open || '09:00').split(':').map(Number);
  const [closeH, closeM] = (schedule.close || '18:00').split(':').map(Number);
  const openMinutes = openH * 60 + openM;
  const closeMinutes = closeH * 60 + closeM;

  return currentMinutes >= openMinutes && currentMinutes <= closeMinutes;
}

// =====================================================
// HELPER: Verificar límite de mensajes (trial y pagados)
// =====================================================
// Usa el nuevo servicio de límites que maneja:
// - Trial: 100 mensajes/día
// - Pagados: 2000 mensajes/día
async function checkTrialLimit(clientServiceId) {
  // Usar el nuevo servicio de límites
  return await checkMessageLimit(clientServiceId);
}

// =====================================================
// HELPER: Buscar client_service por credenciales de plataforma
// =====================================================
async function findClientServiceByPlatformId(platform, platformAccountId) {
  if (!platformAccountId) return null;

  // Buscar en la columna config JSONB de client_services
  // Las credenciales se guardan en config.platform_credentials
  let searchQuery;

  switch (platform) {
    case 'whatsapp':
      // Buscar por phone_number_id
      searchQuery = `
        SELECT cs.id as client_service_id, cs.status, cs.config,
               s.code as service_code, s.name as service_name,
               b.id as business_id, b.name as business_name, b.industry, b.description,
               b.website, b.country, b.address, b.phone as business_phone, b.email as business_email,
               c.id as client_id, c.name as client_name
        FROM client_services cs
        JOIN services s ON cs.service_id = s.id
        JOIN clients c ON cs.client_id = c.id
        JOIN businesses b ON c.id = b.client_id
        WHERE s.code = 'whatsapp'
          AND cs.status IN ('active', 'trial')
          AND (
            cs.config->'platform_credentials'->>'phone_number_id' = $1
            OR cs.config->'api_credentials'->>'phone_number_id' = $1
          )
        LIMIT 1
      `;
      break;

    case 'messenger':
      searchQuery = `
        SELECT cs.id as client_service_id, cs.status, cs.config,
               s.code as service_code, s.name as service_name,
               b.id as business_id, b.name as business_name, b.industry, b.description,
               b.website, b.country, b.address, b.phone as business_phone, b.email as business_email,
               c.id as client_id, c.name as client_name
        FROM client_services cs
        JOIN services s ON cs.service_id = s.id
        JOIN clients c ON cs.client_id = c.id
        JOIN businesses b ON c.id = b.client_id
        WHERE s.code = 'messenger'
          AND cs.status IN ('active', 'trial')
          AND (
            cs.config->'platform_credentials'->>'page_id' = $1
            OR cs.config->'api_credentials'->>'page_id' = $1
          )
        LIMIT 1
      `;
      break;

    case 'instagram':
      searchQuery = `
        SELECT cs.id as client_service_id, cs.status, cs.config,
               s.code as service_code, s.name as service_name,
               b.id as business_id, b.name as business_name, b.industry, b.description,
               b.website, b.country, b.address, b.phone as business_phone, b.email as business_email,
               c.id as client_id, c.name as client_name
        FROM client_services cs
        JOIN services s ON cs.service_id = s.id
        JOIN clients c ON cs.client_id = c.id
        JOIN businesses b ON c.id = b.client_id
        WHERE s.code = 'instagram'
          AND cs.status IN ('active', 'trial')
          AND (
            cs.config->'platform_credentials'->>'instagram_account_id' = $1
            OR cs.config->'platform_credentials'->>'page_id' = $1
            OR cs.config->'api_credentials'->>'instagram_account_id' = $1
          )
        LIMIT 1
      `;
      break;

    default:
      return null;
  }

  const result = await query(searchQuery, [platformAccountId]);
  return result.rows.length > 0 ? result.rows[0] : null;
}

// =====================================================
// HELPER: Generar respuesta del bot y enviarla
// =====================================================
async function generateAndSendBotResponse({
  conversationId, clientServiceId, serviceData, platform,
  contactId, contactPhone, messageContent, messageId
}) {
  // Obtener configuración del bot
  const botConfigResult = await query(
    'SELECT * FROM bot_configs WHERE client_service_id = $1',
    [clientServiceId]
  );
  const botConfig = botConfigResult.rows[0] || {};

  // Verificar horario de atención
  if (!isWithinBusinessHours(botConfig)) {
    const awayMsg = botConfig.away_message || 'Estamos fuera del horario de atención. Te responderemos pronto.';
    const awayResult = await query(`
      INSERT INTO messages (conversation_id, sender_type, content, message_type, status)
      VALUES ($1, $2, $3, 'text', 'pending') RETURNING *
    `, [conversationId, SENDER_TYPES.BOT, awayMsg]);

    // Intentar enviar mensaje de ausencia
    await sendBotMessageToPlatform(platform, serviceData, contactId, contactPhone, awayMsg, messageId);

    return { response: awayMsg, isAway: true };
  }

  // 1. Verificar límite por conversación (anti-abuso de usuario final: 50 msg/día)
  const conversationLimitCheck = await checkConversationLimit(conversationId);
  if (!conversationLimitCheck.allowed) {
    const maintenanceMsg = 'El asistente virtual se encuentra en mantenimiento. Te pondremos en contacto con un agente personal.';
    await query(`
      INSERT INTO messages (conversation_id, sender_type, content, message_type, status)
      VALUES ($1, $2, $3, 'text', 'pending') RETURNING *
    `, [conversationId, SENDER_TYPES.BOT, maintenanceMsg]);

    await sendBotMessageToPlatform(platform, serviceData, contactId, contactPhone, maintenanceMsg, messageId);

    return { response: maintenanceMsg, isConversationLimit: true };
  }

  // 2. Verificar límite del servicio (trial: 100/día, pagados: 2000/día)
  const serviceLimitCheck = await checkTrialLimit(clientServiceId);
  if (!serviceLimitCheck.allowed) {
    const maintenanceMsg = 'El asistente virtual se encuentra en mantenimiento. Te pondremos en contacto con un agente personal.';
    await query(`
      INSERT INTO messages (conversation_id, sender_type, content, message_type, status)
      VALUES ($1, $2, $3, 'text', 'pending') RETURNING *
    `, [conversationId, SENDER_TYPES.BOT, maintenanceMsg]);

    await sendBotMessageToPlatform(platform, serviceData, contactId, contactPhone, maintenanceMsg, messageId);

    // Enviar email al cliente notificando que alcanzó su límite
    const clientInfo = await query(
      'SELECT c.email, c.name, s.name as service_name FROM clients c JOIN client_services cs ON c.id = cs.client_id JOIN services s ON cs.service_id = s.id WHERE cs.id = $1',
      [clientServiceId]
    );
    if (clientInfo.rows.length > 0) {
      const { email, name, service_name } = clientInfo.rows[0];
      sendDailyLimitReachedEmail(
        email,
        name,
        service_name,
        serviceLimitCheck.limit,
        serviceLimitCheck.status
      ).catch(err => console.error('Error enviando email de límite:', err));
    }

    return { response: maintenanceMsg, isServiceLimit: true };
  }

  // Incrementar contador de conversación
  await incrementConversationCount(conversationId);

  // Obtener historial de mensajes
  const historyResult = await query(`
    SELECT sender_type, content FROM messages
    WHERE conversation_id = $1
    ORDER BY created_at DESC LIMIT 10
  `, [conversationId]);
  const messageHistory = historyResult.rows.reverse();

  // Info del negocio
  const businessInfo = {
    name: serviceData.business_name,
    industry: serviceData.industry,
    description: serviceData.description,
    website: serviceData.website,
    address: serviceData.address,
    phone: serviceData.business_phone,
    email: serviceData.business_email
  };

  // Parsear config de IA
  let aiConfig = {};
  if (botConfig.ai_config) {
    try {
      aiConfig = typeof botConfig.ai_config === 'string'
        ? JSON.parse(botConfig.ai_config) : botConfig.ai_config;
    } catch { /* usar defaults */ }
  }

  // Obtener archivos de conocimiento (globales por cliente)
  let knowledgeFiles = [];
  try {
    const kfResult = await query(
      'SELECT filename, extracted_text FROM client_knowledge_files WHERE client_id = $1',
      [serviceData.client_id]
    );
    knowledgeFiles = kfResult.rows;
  } catch { /* ignorar si la tabla no existe aún */ }

  // Generar respuesta con IA
  const responseText = await generateResponse({
    userMessage: messageContent,
    messageHistory,
    botConfig: {
      personality: botConfig.personality || 'amable y profesional',
      language: botConfig.language || 'español',
      instructions: botConfig.knowledge_base || '',
      fallbackMessage: botConfig.fallback_message,
      model: aiConfig.model || 'gpt-4o-mini',
      temperature: aiConfig.temperature || 0.7,
      maxTokens: aiConfig.max_tokens || 500,
      knowledgeFiles
    },
    businessInfo
  });

  // Guardar respuesta del bot
  const botMsgResult = await query(`
    INSERT INTO messages (conversation_id, sender_type, content, message_type, status)
    VALUES ($1, $2, $3, 'text', 'pending') RETURNING *
  `, [conversationId, SENDER_TYPES.BOT, responseText]);

  const botMessage = botMsgResult.rows[0];

  // Enviar a la plataforma
  const sendResult = await sendBotMessageToPlatform(
    platform, serviceData, contactId, contactPhone, responseText, messageId
  );

  // Actualizar estado del mensaje
  if (sendResult?.success) {
    await query(
      `UPDATE messages SET status = 'sent', external_id = $1 WHERE id = $2`,
      [sendResult.messageId || null, botMessage.id]
    );

    // Incrementar contador de mensajes para límites diarios
    await incrementMessageCount(clientServiceId);
  } else {
    await query(
      `UPDATE messages SET status = 'failed' WHERE id = $1`,
      [botMessage.id]
    );
  }

  // Detectar intención (async, no bloqueante)
  detectIntent(messageContent).catch(() => {});

  // Emitir evento WebSocket de respuesta del bot
  emitBotResponse(serviceData.client_id, serviceData.service_code, {
    conversationId,
    message: botMessage,
    platform
  });

  return { response: responseText, botMessage, sendResult };
}

// =====================================================
// HELPER: Enviar mensaje del bot a la plataforma
// =====================================================
async function sendBotMessageToPlatform(platform, serviceData, contactId, contactPhone, message, originalMsgId) {
  try {
    const credentials = serviceData.config?.platform_credentials || serviceData.config?.api_credentials || {};

    switch (platform) {
      case 'whatsapp': {
        const phoneNumberId = credentials.phone_number_id;
        const accessToken = credentials.whatsapp_access_token;
        if (!phoneNumberId) {
          console.error('WhatsApp: phone_number_id no encontrado en config del cliente');
          return { success: false };
        }
        const result = await metaService.sendWhatsAppTextWithToken(
          phoneNumberId, contactPhone, message, accessToken
        );
        // Marcar como leído
        if (originalMsgId) {
          metaService.markWhatsAppAsReadWithToken(phoneNumberId, originalMsgId, accessToken).catch(() => {});
        }
        return result;
      }

      case 'messenger': {
        const pageAccessToken = credentials.page_access_token;
        if (!pageAccessToken) {
          console.error('Messenger: page_access_token no encontrado en config del cliente');
          return { success: false };
        }
        return await metaService.sendMessengerText(pageAccessToken, contactId, message);
      }

      case 'instagram': {
        const igAccessToken = credentials.instagram_access_token || credentials.page_access_token;
        if (!igAccessToken) {
          console.error('Instagram: access_token no encontrado en config del cliente');
          return { success: false };
        }
        return await metaService.sendInstagramText(igAccessToken, contactId, message);
      }

      default:
        return { success: false, error: 'Plataforma no soportada para envío' };
    }
  } catch (error) {
    console.error(`Error enviando mensaje a ${platform}:`, error.message);
    return { success: false, error: error.message };
  }
}

// =====================================================
// PRINCIPAL: Procesar mensaje desde webhook de Meta
// Esta función es llamada DESPUÉS de responder 200 a Meta
// =====================================================
const processWebhookMessage = async (data) => {
  const {
    platform, platformAccountId, contactId, contactName,
    contactPhone, message, messageType, messageId, timestamp
  } = data;

  // ─── DEDUPLICACIÓN: Evitar procesar webhooks duplicados (retries de Meta) ───
  if (messageId) {
    try {
      const existing = await query(
        'SELECT id FROM messages WHERE external_id = $1',
        [messageId]
      );
      if (existing.rows.length > 0) {
        console.log(`⏭️  [${platform}] Mensaje duplicado ignorado: ${messageId}`);
        return;
      }
    } catch (dedupError) {
      // Si falla la verificación (columna no existe aún), continuar
      if (!dedupError.message.includes('external_id')) {
        console.warn('Error en dedup check:', dedupError.message);
      }
    }
  }

  console.log(`📨 [${platform}] Mensaje de ${contactName || contactId}: "${message.substring(0, 50)}..."`);

  // 1. Buscar client_service por ID de plataforma
  const serviceData = await findClientServiceByPlatformId(platform, platformAccountId);

  if (!serviceData) {
    console.error(`❌ No se encontró servicio para ${platform} con ID: ${platformAccountId}`);
    return;
  }

  // 2. Verificar que el servicio esté activo
  if (serviceData.status !== 'active' && serviceData.status !== 'trial') {
    console.log(`⚠️  Servicio ${serviceData.service_code} no activo para cliente ${serviceData.client_id}`);
    return;
  }

  const clientServiceId = serviceData.client_service_id;

  // 3. Buscar o crear conversación
  let conversationResult = await query(`
    SELECT * FROM conversations
    WHERE client_service_id = $1 AND contact_id = $2
  `, [clientServiceId, contactId]);

  let conversationId;
  let isNewConversation = false;
  let isBotActive = true;

  if (conversationResult.rows.length === 0) {
    // Crear nueva conversación
    const newConv = await query(`
      INSERT INTO conversations (
        client_service_id, contact_id, contact_name, contact_phone, platform,
        is_bot_active, status, unread_count, last_message_at
      )
      VALUES ($1, $2, $3, $4, $5, true, 'active', 1, CURRENT_TIMESTAMP)
      RETURNING *
    `, [clientServiceId, contactId, contactName || 'Sin nombre', contactPhone || '',  platform ]);

    conversationId = newConv.rows[0].id;
    isNewConversation = true;
  } else {
    conversationId = conversationResult.rows[0].id;
    isBotActive = conversationResult.rows[0].is_bot_active;

    // Actualizar conversación
    await query(`
      UPDATE conversations
      SET unread_count = unread_count + 1,
          last_message_at = CURRENT_TIMESTAMP,
          contact_name = COALESCE($2, contact_name),
          contact_phone = COALESCE($3, contact_phone)
      WHERE id = $1
    `, [conversationId, contactName, contactPhone]);
  }

  // 4. Guardar mensaje del contacto
  const incomingMsg = await query(`
    INSERT INTO messages (
      conversation_id, sender_type, content, message_type, external_id, status
    )
    VALUES ($1, $2, $3, $4, $5, 'delivered')
    RETURNING *
  `, [conversationId, SENDER_TYPES.CONTACT, message, messageType || 'text', messageId]);

  console.log(`💾 Mensaje guardado en conversación ${conversationId}`);

  // Emitir evento WebSocket de mensaje entrante
  emitNewMessage(serviceData.client_id, serviceData.service_code, {
    conversationId,
    message: incomingMsg.rows[0],
    platform,
    contactName: contactName || contactId
  });

  // Si es nueva conversación, notificar
  if (isNewConversation) {
    emitNewConversation(serviceData.client_id, serviceData.service_code, {
      conversationId,
      contactId,
      contactName: contactName || 'Sin nombre',
      platform
    });
  }

  // 5. Si el bot está activo, generar y enviar respuesta
  if (isBotActive) {
    try {
      // Enviar mensaje de bienvenida si es nueva conversación
      if (isNewConversation) {
        const botConfigResult = await query(
          'SELECT welcome_message FROM bot_configs WHERE client_service_id = $1',
          [clientServiceId]
        );
        const welcomeMsg = botConfigResult.rows[0]?.welcome_message;
        if (welcomeMsg) {
          await query(`
            INSERT INTO messages (conversation_id, sender_type, content, message_type, status)
            VALUES ($1, $2, $3, 'text', 'pending')
          `, [conversationId, SENDER_TYPES.BOT, welcomeMsg]);

          await sendBotMessageToPlatform(platform, serviceData, contactId, contactPhone, welcomeMsg, null);
        }
      }

      // Generar respuesta IA
      await generateAndSendBotResponse({
        conversationId, clientServiceId, serviceData, platform,
        contactId, contactPhone, messageContent: message, messageId
      });

      console.log(`✅ [${platform}] Respuesta enviada a ${contactId}`);

    } catch (aiError) {
      console.error('Error generando respuesta IA:', aiError);

      // Enviar fallback
      const fallbackMsg = 'Lo siento, no puedo responder en este momento. Un agente te atenderá pronto.';
      await query(`
        INSERT INTO messages (conversation_id, sender_type, content, message_type, status)
        VALUES ($1, $2, $3, 'text', 'pending')
      `, [conversationId, SENDER_TYPES.BOT, fallbackMsg]);

      await sendBotMessageToPlatform(platform, serviceData, contactId, contactPhone, fallbackMsg, null);
    }
  } else {
    console.log(`🔇 Bot desactivado para conversación ${conversationId}`);
  }
};

// =====================================================
// Procesar status updates (delivered, read, failed)
// =====================================================
const processStatusUpdate = async (data) => {
  const { platform, messageId, status, timestamp, recipientId } = data;

  if (!messageId || !status) return;

  try {
    await query(`
      UPDATE messages SET status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE external_id = $2
    `, [status, messageId]);
  } catch (error) {
    console.error('Error actualizando status:', error);
  }
};

// =====================================================
// handleIncomingMessage (para llamadas manuales / n8n)
// Usa businessId (UUID) para buscar el servicio
// =====================================================
const handleIncomingMessage = async (req, res) => {
  try {
    const {
      platform, businessId, contactId, contactName,
      contactPhone, contactEmail, message,
      messageType = 'text', messageId, timestamp
    } = req.body;

    if (!platform || !businessId || !contactId || !message) {
      return res.status(400).json({
        success: false,
        error: 'Datos incompletos: platform, businessId, contactId y message son requeridos'
      });
    }

    // Buscar client_service por businessId
    const serviceResult = await query(`
      SELECT cs.id as client_service_id, cs.status, cs.config,
             s.code as service_code, s.name as service_name,
             b.id as business_id, b.name as business_name, b.industry, b.description,
             b.website, b.country, b.address, b.phone as business_phone, b.email as business_email,
             c.id as client_id, c.name as client_name
      FROM businesses b
      JOIN clients c ON b.client_id = c.id
      JOIN client_services cs ON c.id = cs.client_id
      JOIN services s ON cs.service_id = s.id
      WHERE b.id = $1 AND s.code = $2
    `, [businessId, platform]);

    if (serviceResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Negocio o servicio no encontrado' });
    }

    const serviceData = serviceResult.rows[0];

    if (serviceData.status !== 'active' && serviceData.status !== 'trial') {
      return res.status(403).json({ success: false, error: 'Servicio no activo' });
    }

    const clientServiceId = serviceData.client_service_id;

    // Buscar o crear conversación
    let conversationResult = await query(`
      SELECT * FROM conversations WHERE client_service_id = $1 AND contact_id = $2
    `, [clientServiceId, contactId]);

    let conversationId;
    let isNewConversation = false;
    let isBotActive = true;

    if (conversationResult.rows.length === 0) {
      const newConv = await query(`
        INSERT INTO conversations (
          client_service_id, contact_id, contact_name, contact_phone,  platform, 
          is_bot_active, status, unread_count
        )
        VALUES ($1, $2, $3, $4, $5, true, 'active', 1) RETURNING *
      `, [clientServiceId, contactId, contactName || 'Sin nombre', contactPhone || '', platform ]);

      conversationId = newConv.rows[0].id;
      isNewConversation = true;
    } else {
      conversationId = conversationResult.rows[0].id;
      isBotActive = conversationResult.rows[0].is_bot_active;

      await query(`
        UPDATE conversations
        SET unread_count = unread_count + 1, last_message_at = CURRENT_TIMESTAMP,
            contact_name = COALESCE($2, contact_name), contact_phone = COALESCE($3, contact_phone)
        WHERE id = $1
      `, [conversationId, contactName, contactPhone]);
    }

    // Guardar mensaje entrante
    const incomingMsg = await query(`
      INSERT INTO messages (
        conversation_id, sender_type, content, message_type, external_id, status
      )
      VALUES ($1, $2, $3, $4, $5, 'delivered') RETURNING *
    `, [conversationId, SENDER_TYPES.CONTACT, message, messageType, messageId]);

    // Si el bot está activo, generar respuesta
    if (isBotActive) {
      try {
        const result = await generateAndSendBotResponse({
          conversationId, clientServiceId, serviceData, platform,
          contactId, contactPhone, messageContent: message, messageId
        });

        return res.json({
          success: true,
          data: {
            conversationId,
            incomingMessage: incomingMsg.rows[0],
            botResponse: { content: result.response, shouldSend: true },
            isNewConversation
          }
        });

      } catch (aiError) {
        console.error('Error generando respuesta IA:', aiError);
        const fallbackMsg = 'Lo siento, no puedo responder en este momento. Un agente te atenderá pronto.';

        await query(`
          INSERT INTO messages (conversation_id, sender_type, content, message_type, status)
          VALUES ($1, $2, $3, 'text', 'pending')
        `, [conversationId, SENDER_TYPES.BOT, fallbackMsg]);

        return res.json({
          success: true,
          data: {
            conversationId, incomingMessage: incomingMsg.rows[0],
            botResponse: { content: fallbackMsg, shouldSend: true, isError: true },
            isNewConversation
          }
        });
      }
    }

    res.json({
      success: true,
      data: {
        conversationId, incomingMessage: incomingMsg.rows[0],
        botResponse: null, isBotActive: false, isNewConversation
      }
    });

  } catch (error) {
    console.error('Error en handleIncomingMessage:', error);
    res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
};

// =====================================================
// confirmMessageSent
// =====================================================
const confirmMessageSent = async (req, res) => {
  try {
    const { messageId, externalId, status = 'sent' } = req.body;
    if (!messageId) {
      return res.status(400).json({ success: false, error: 'messageId es requerido' });
    }

    await query(`
      UPDATE messages SET status = $1, external_id = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
    `, [status, externalId, messageId]);

    res.json({ success: true, message: 'Estado actualizado' });
  } catch (error) {
    console.error('Error en confirmMessageSent:', error);
    res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
};

// =====================================================
// updateMessageStatus
// =====================================================
const updateMessageStatus = async (req, res) => {
  try {
    const { externalId, status } = req.body;
    if (!externalId || !status) {
      return res.status(400).json({ success: false, error: 'externalId y status son requeridos' });
    }

    await query(`
      UPDATE messages SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE external_id = $2
    `, [status, externalId]);

    res.json({ success: true, message: 'Estado actualizado' });
  } catch (error) {
    console.error('Error en updateMessageStatus:', error);
    res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
};

// =====================================================
// verifyWebhook (Meta verification challenge)
// =====================================================
const verifyWebhook = async (req, res) => {
  try {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    // Obtener verify token desde env
    const verifyToken = process.env.META_VERIFY_TOKEN || process.env.WEBHOOK_VERIFY_TOKEN;

    if (!verifyToken) {
      console.error('❌ META_VERIFY_TOKEN no configurado en variables de entorno');
      return res.sendStatus(500);
    }

    if (mode === 'subscribe' && token === verifyToken) {
      console.log('✅ Webhook verificado correctamente');
      return res.status(200).send(challenge);
    }

    console.log('❌ Verificación de webhook fallida');
    res.sendStatus(403);
  } catch (error) {
    console.error('Error verificando webhook:', error);
    res.sendStatus(500);
  }
};

// =====================================================
// healthCheck
// =====================================================
const healthCheck = async (req, res) => {
  try {
    await query('SELECT 1');
    const { checkConnection } = require('../services/openaiService');
    const openaiStatus = await checkConnection();

    res.json({
      success: true, status: 'healthy',
      services: { database: true, openai: openaiStatus.success },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ success: false, status: 'unhealthy', error: error.message });
  }
};

// =====================================================
// initWebChat
// =====================================================
const initWebChat = async (req, res) => {
  try {
    const { clientServiceId } = req.body;

    if (!clientServiceId) {
      return res.status(400).json({ success: false, error: 'clientServiceId es requerido' });
    }

    const serviceResult = await query(`
      SELECT cs.*, s.code, bc.welcome_message
      FROM client_services cs
      JOIN services s ON cs.service_id = s.id
      LEFT JOIN bot_configs bc ON cs.id = bc.client_service_id
      WHERE cs.id = $1 AND s.code = 'webchat' AND cs.status IN ('active', 'trial')
    `, [clientServiceId]);

    if (serviceResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Servicio no encontrado o inactivo' });
    }

    const service = serviceResult.rows[0];
    const contactId = 'web_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

    const conversationResult = await query(`
      INSERT INTO conversations (
        client_service_id, contact_id, contact_name, platform, status, is_bot_active
      ) VALUES ($1, $2, $3, 'webchat', 'active', true) RETURNING *
    `, [clientServiceId, contactId, 'Visitante']);

    const newConversation = conversationResult.rows[0];

    // Emitir evento WebSocket de nueva conversación (para el panel del cliente)
    emitNewConversation(service.client_id, 'webchat', {
      conversationId: newConversation.id,
      contactId,
      contactName: 'Visitante',
      platform: 'webchat'
    });

    res.json({
      success: true,
      data: {
        conversationId: newConversation.id,
        contactId,
        welcomeMessage: service.welcome_message || '¡Hola! ¿En qué puedo ayudarte?'
      }
    });
  } catch (error) {
    console.error('Error en initWebChat:', error);
    res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
};

// =====================================================
// sendWebChatMessage
// =====================================================
const sendWebChatMessage = async (req, res) => {
  try {
    const { conversationId, message } = req.body;

    if (!conversationId || !message) {
      return res.status(400).json({ success: false, error: 'conversationId y message son requeridos' });
    }

    const convResult = await query(`
      SELECT c.*, cs.client_id, cs.status as service_status,
             bc.personality, bc.language, bc.ai_config, bc.knowledge_base,
             bc.fallback_message, bc.business_hours, bc.away_message,
             b.name as business_name, b.industry, b.description, b.website,
             b.phone as business_phone, b.email as business_email
      FROM conversations c
      JOIN client_services cs ON c.client_service_id = cs.id
      LEFT JOIN bot_configs bc ON cs.id = bc.client_service_id
      LEFT JOIN businesses b ON cs.client_id = b.client_id
      WHERE c.id = $1
    `, [conversationId]);

    if (convResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Conversación no encontrada' });
    }

    const conversation = convResult.rows[0];

    // Guardar mensaje del usuario
    const userMsgResult = await query(`
      INSERT INTO messages (conversation_id, sender_type, content, message_type, status)
      VALUES ($1, 'contact', $2, 'text', 'sent') RETURNING *
    `, [conversationId, message]);

    // Emitir evento WebSocket de mensaje entrante (para el panel del cliente)
    emitNewMessage(conversation.client_id, 'webchat', {
      conversationId,
      message: userMsgResult.rows[0],
      platform: 'webchat',
      contactName: 'Visitante'
    });

    if (conversation.is_bot_active) {
      try {
        // 1. Verificar límite por conversación (anti-abuso: 50 msg/día)
        const conversationLimitCheck = await checkConversationLimit(conversationId);
        if (!conversationLimitCheck.allowed) {
          const maintenanceMsg = 'El asistente virtual se encuentra en mantenimiento. Te pondremos en contacto con un agente personal.';
          await query(`
            INSERT INTO messages (conversation_id, sender_type, content, message_type, status)
            VALUES ($1, 'bot', $2, 'text', 'sent')
          `, [conversationId, maintenanceMsg]);

          return res.json({ success: true, data: { userMessage: userMsgResult.rows[0], reply: maintenanceMsg } });
        }

        // 2. Verificar límite del servicio
        const serviceLimitCheck = await checkTrialLimit(conversation.client_service_id);
        if (!serviceLimitCheck.allowed) {
          const maintenanceMsg = 'El asistente virtual se encuentra en mantenimiento. Te pondremos en contacto con un agente personal.';
          await query(`
            INSERT INTO messages (conversation_id, sender_type, content, message_type, status)
            VALUES ($1, 'bot', $2, 'text', 'sent')
          `, [conversationId, maintenanceMsg]);

          // Enviar email al cliente
          const clientInfo = await query(
            'SELECT c.email, c.name, s.name as service_name FROM clients c JOIN client_services cs ON c.id = cs.client_id JOIN services s ON cs.service_id = s.id WHERE cs.id = $1',
            [conversation.client_service_id]
          );
          if (clientInfo.rows.length > 0) {
            const { email, name, service_name } = clientInfo.rows[0];
            sendDailyLimitReachedEmail(email, name, service_name, serviceLimitCheck.limit, serviceLimitCheck.status).catch(err => console.error('Error enviando email:', err));
          }

          return res.json({ success: true, data: { userMessage: userMsgResult.rows[0], reply: maintenanceMsg } });
        }

        // Incrementar contador de conversación
        await incrementConversationCount(conversationId);

        // Obtener historial
        const historyResult = await query(`
          SELECT sender_type, content FROM messages
          WHERE conversation_id = $1 ORDER BY created_at DESC LIMIT 10
        `, [conversationId]);

        const messageHistory = historyResult.rows.reverse();

        // Parsear AI config
        let aiConfig = {};
        try {
          aiConfig = typeof conversation.ai_config === 'string'
            ? JSON.parse(conversation.ai_config) : (conversation.ai_config || {});
        } catch { /* defaults */ }

        // Obtener archivos de conocimiento (globales por cliente)
        let knowledgeFiles = [];
        try {
          const kfResult = await query(
            'SELECT filename, extracted_text FROM client_knowledge_files WHERE client_id = $1',
            [conversation.client_id]
          );
          knowledgeFiles = kfResult.rows;
        } catch { /* ignorar si la tabla no existe aún */ }

        const responseText = await generateResponse({
          userMessage: message,
          messageHistory,
          botConfig: {
            personality: conversation.personality || 'amable y profesional',
            language: conversation.language || 'español',
            instructions: conversation.knowledge_base || '',
            fallbackMessage: conversation.fallback_message,
            model: aiConfig.model || 'gpt-4o-mini',
            temperature: aiConfig.temperature || 0.7,
            maxTokens: aiConfig.max_tokens || 500,
            knowledgeFiles
          },
          businessInfo: {
            name: conversation.business_name,
            industry: conversation.industry,
            description: conversation.description,
            website: conversation.website,
            phone: conversation.business_phone,
            email: conversation.business_email
          }
        });

        const botMsgResult = await query(`
          INSERT INTO messages (conversation_id, sender_type, content, message_type, status)
          VALUES ($1, 'bot', $2, 'text', 'sent') RETURNING *
        `, [conversationId, responseText]);

        await query(`
          UPDATE conversations SET last_message_at = CURRENT_TIMESTAMP WHERE id = $1
        `, [conversationId]);

        // Incrementar contador de mensajes para límites diarios
        await incrementMessageCount(conversation.client_service_id);

        // Emitir evento WebSocket de respuesta del bot (para el panel del cliente)
        emitBotResponse(conversation.client_id, 'webchat', {
          conversationId,
          message: botMsgResult.rows[0],
          platform: 'webchat'
        });

        return res.json({
          success: true,
          data: { userMessage: userMsgResult.rows[0], reply: responseText }
        });

      } catch (aiError) {
        console.error('Error generando respuesta webchat:', aiError);
        const fallback = conversation.fallback_message || 'Disculpa, estoy teniendo problemas. Un agente te atenderá pronto.';
        const fallbackMsgResult = await query(`
          INSERT INTO messages (conversation_id, sender_type, content, message_type, status)
          VALUES ($1, 'bot', $2, 'text', 'sent') RETURNING *
        `, [conversationId, fallback]);

        // Emitir evento WebSocket del mensaje de fallback
        emitBotResponse(conversation.client_id, 'webchat', {
          conversationId,
          message: fallbackMsgResult.rows[0],
          platform: 'webchat'
        });

        return res.json({ success: true, data: { userMessage: userMsgResult.rows[0], reply: fallback } });
      }
    }

    res.json({
      success: true,
      data: { userMessage: userMsgResult.rows[0], reply: null, message: 'Un agente te responderá pronto.' }
    });

  } catch (error) {
    console.error('Error en sendWebChatMessage:', error);
    res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
};

// =====================================================
// HELPER: Procesar update de Telegram (single-bot architecture)
// El bot global del admin recibe todos los mensajes.
// Deep linking: t.me/Bot?start=CLIENT_SERVICE_ID asocia el chat con un cliente.
// =====================================================
async function processTelegramUpdate(update) {
  if (!update.message?.text) return;

  const msg = update.message;
  const chatId = msg.chat.id.toString();
  const userName = msg.from.first_name + (msg.from.last_name ? ' ' + msg.from.last_name : '');
  const botToken = telegramService.getGlobalBotToken();

  if (!botToken) {
    console.log('TELEGRAM_BOT_TOKEN no configurado, ignorando mensaje');
    return;
  }

  // ---- Deep linking: /start CLIENT_SERVICE_ID ----
  let deepLinkCsId = null;
  if (msg.text.startsWith('/start ')) {
    deepLinkCsId = msg.text.replace('/start ', '').trim();
  }

  let serviceData = null;

  // 1. Si viene un deep link /start con client_service_id
  if (deepLinkCsId) {
    const result = await query(`
      SELECT cs.id as client_service_id, cs.status, cs.config,
             s.code as service_code, s.name as service_name,
             b.id as business_id, b.name as business_name, b.industry, b.description,
             b.website, b.country, b.address, b.phone as business_phone, b.email as business_email,
             c.id as client_id, c.name as client_name
      FROM client_services cs
      JOIN services s ON cs.service_id = s.id
      JOIN clients c ON cs.client_id = c.id
      JOIN businesses b ON c.id = b.client_id
      WHERE cs.id = $1 AND s.code = 'telegram' AND cs.status IN ('active', 'trial')
    `, [deepLinkCsId]);

    serviceData = result.rows[0] || null;
  }

  // 2. Buscar por conversacion existente (este chatId ya hablo antes)
  if (!serviceData) {
    const existingConv = await query(`
      SELECT c.client_service_id
      FROM conversations c
      JOIN client_services cs ON c.client_service_id = cs.id
      JOIN services s ON cs.service_id = s.id
      WHERE c.contact_id = $1 AND s.code = 'telegram' AND cs.status IN ('active', 'trial')
      ORDER BY c.last_message_at DESC
      LIMIT 1
    `, [chatId]);

    if (existingConv.rows.length > 0) {
      const csId = existingConv.rows[0].client_service_id;
      const result = await query(`
        SELECT cs.id as client_service_id, cs.status, cs.config,
               s.code as service_code, s.name as service_name,
               b.id as business_id, b.name as business_name, b.industry, b.description,
               b.website, b.country, b.address, b.phone as business_phone, b.email as business_email,
               c.id as client_id, c.name as client_name
        FROM client_services cs
        JOIN services s ON cs.service_id = s.id
        JOIN clients c ON cs.client_id = c.id
        JOIN businesses b ON c.id = b.client_id
        WHERE cs.id = $1
      `, [csId]);

      serviceData = result.rows[0] || null;
    }
  }

  // 3. Si no encontramos nada, no podemos rutear el mensaje
  if (!serviceData) {
    // Si es /start sin payload valido, enviar mensaje generico
    if (msg.text === '/start') {
      await telegramService.sendTelegramText(botToken, chatId,
        'Bienvenido. Para conectarte con un negocio, usa el link que te compartieron.',
        {}
      );
    }
    console.log('Telegram: No se pudo asociar chatId', chatId, 'con ningun servicio');
    return;
  }

  const csId = serviceData.client_service_id;

  // Buscar o crear conversacion
  let convResult = await query(`
    SELECT * FROM conversations WHERE client_service_id = $1 AND contact_id = $2
  `, [csId, chatId]);

  let conversationId;
  let isNewConversation = false;

  if (convResult.rows.length === 0) {
    const newConv = await query(`
      INSERT INTO conversations (
        client_service_id, contact_id, contact_name, platform,
        is_bot_active, status, last_message_at
      )
      VALUES ($1, $2, $3, 'telegram', true, 'active', CURRENT_TIMESTAMP)
      RETURNING *
    `, [csId, chatId, userName]);

    conversationId = newConv.rows[0].id;
    isNewConversation = true;
  } else {
    conversationId = convResult.rows[0].id;
    await query(`
      UPDATE conversations SET last_message_at = CURRENT_TIMESTAMP, unread_count = unread_count + 1
      WHERE id = $1
    `, [conversationId]);
  }

  // Si es /start con deep link, no guardar el comando como mensaje, solo saludar
  if (deepLinkCsId && msg.text.startsWith('/start ')) {
    // Emitir nueva conversacion por WebSocket
    if (isNewConversation) {
      emitNewConversation(serviceData.client_id, 'telegram', {
        conversationId, contactId: chatId, contactName: userName, platform: 'telegram'
      });
    }

    // Generar respuesta de bienvenida del bot
    const botConfig = await query('SELECT * FROM bot_configs WHERE client_service_id = $1', [csId]);
    const welcomeMsg = botConfig.rows[0]?.welcome_message || `Hola ${userName}! Como puedo ayudarte?`;

    // Guardar y enviar saludo
    await query(`
      INSERT INTO messages (conversation_id, sender_type, content, message_type, status)
      VALUES ($1, 'bot', $2, 'text', 'sent')
    `, [conversationId, welcomeMsg]);

    await telegramService.sendTelegramText(botToken, chatId, welcomeMsg, {});
    return;
  }

  // Guardar mensaje del usuario
  const incomingMsg = await query(`
    INSERT INTO messages (conversation_id, sender_type, content, message_type, external_id, status)
    VALUES ($1, 'contact', $2, 'text', $3, 'received')
    RETURNING *
  `, [conversationId, msg.text, msg.message_id.toString()]);

  // Emitir WebSocket
  emitNewMessage(serviceData.client_id, 'telegram', {
    conversationId,
    message: incomingMsg.rows[0],
    platform: 'telegram',
    contactName: userName
  });

  if (isNewConversation) {
    emitNewConversation(serviceData.client_id, 'telegram', {
      conversationId, contactId: chatId, contactName: userName, platform: 'telegram'
    });
  }

  // Verificar si bot esta activo
  const isBotActive = convResult.rows[0]?.is_bot_active !== false;

  if (isBotActive) {
    try {
      await generateAndSendBotResponse({
        conversationId, clientServiceId: csId, serviceData, platform: 'telegram',
        contactId: chatId, contactPhone: null, messageContent: msg.text,
        messageId: msg.message_id.toString()
      });

      // Obtener ultimo mensaje del bot para enviarlo via Telegram
      const lastBotMsg = await query(`
        SELECT * FROM messages WHERE conversation_id = $1 AND sender_type = 'bot'
        ORDER BY created_at DESC LIMIT 1
      `, [conversationId]);

      if (lastBotMsg.rows.length > 0) {
        const sendResult = await telegramService.sendTelegramText(
          botToken, chatId, lastBotMsg.rows[0].content,
          { reply_to_message_id: msg.message_id }
        );
        if (sendResult?.success) {
          await query(`UPDATE messages SET status = 'sent', external_id = $1 WHERE id = $2`,
            [sendResult.messageId.toString(), lastBotMsg.rows[0].id]);
        }
      }

    } catch (aiError) {
      console.error('Error generando respuesta Telegram:', aiError);
    }
  }
}

// =====================================================
// handleTelegramWebhook (ruta unica /webhook/telegram)
// =====================================================
const handleTelegramWebhook = async (req, res) => {
  try {
    res.json({ success: true });
    await processTelegramUpdate(req.body);
  } catch (error) {
    console.error('Error en handleTelegramWebhook:', error);
    if (!res.headersSent) res.json({ success: true });
  }
};

// =====================================================
// handleTelegramWebhookByClient (legacy, redirige a la ruta principal)
// =====================================================
const handleTelegramWebhookByClient = async (req, res) => {
  try {
    res.json({ success: true });
    await processTelegramUpdate(req.body);
  } catch (error) {
    console.error('Error en handleTelegramWebhookByClient:', error);
    if (!res.headersSent) res.json({ success: true });
  }
};

// =====================================================
// EXPORTS
// =====================================================
module.exports = {
  processWebhookMessage,
  processStatusUpdate,
  handleIncomingMessage,
  confirmMessageSent,
  updateMessageStatus,
  verifyWebhook,
  healthCheck,
  initWebChat,
  sendWebChatMessage,
  handleTelegramWebhook,
  handleTelegramWebhookByClient
};
