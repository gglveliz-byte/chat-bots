const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceController');
const { authenticate, clientOnly } = require('../middleware/auth');

// Todas las rutas requieren autenticación de cliente
router.use(authenticate, clientOnly);

// Conversaciones
router.get('/:code/conversations', serviceController.getConversations);
router.get('/:code/conversations/:conversationId', serviceController.getConversation);
router.get('/:code/conversations/:conversationId/messages', serviceController.getMessages);
router.post('/:code/conversations/:conversationId/messages', serviceController.sendMessage);
router.put('/:code/conversations/:conversationId/bot', serviceController.toggleBot);

// Configuración del bot
router.get('/:code/config', serviceController.getBotConfig);
router.put('/:code/config', serviceController.updateBotConfig);

// Estadísticas
router.get('/:code/stats', serviceController.getStats);

// Telegram status (deep link)
router.get('/:code/telegram-status', serviceController.getTelegramStatus);

module.exports = router;
