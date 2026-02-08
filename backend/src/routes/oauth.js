const express = require('express');
const router = express.Router();
const oauthController = require('../controllers/oauthController');
const { authenticate, clientOnly } = require('../middleware/auth');

// =====================================================
// RUTAS OAUTH - Meta (Facebook Login)
// =====================================================

// Iniciar flujo OAuth (requiere autenticación de cliente)
router.post('/meta/start', authenticate, clientOnly, oauthController.startOAuth);

// Callback de Facebook (público - Facebook redirige aquí)
router.get('/meta/callback', oauthController.handleCallback);

// Estado de conexión
router.get('/meta/status', authenticate, clientOnly, oauthController.getConnectionStatus);

// Desconectar OAuth
router.post('/meta/disconnect', authenticate, clientOnly, oauthController.disconnectOAuth);

// Seleccionar cuenta (cambiar página/número)
router.post('/meta/select-account', authenticate, clientOnly, oauthController.selectAccount);

// Listar cuentas disponibles
router.get('/meta/available-accounts', authenticate, clientOnly, oauthController.getAvailableAccounts);

module.exports = router;
