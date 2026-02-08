const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticate, adminOnly } = require('../middleware/auth');

// Todas las rutas requieren autenticación de admin
router.use(authenticate, adminOnly);

// Dashboard
router.get('/dashboard', adminController.getDashboard);

// Gestión de clientes
router.get('/clients', adminController.getClients);
router.get('/clients/:id', adminController.getClient);
router.post('/clients', adminController.createClient);
router.put('/clients/:id', adminController.updateClient);
router.delete('/clients/:id', adminController.deleteClient);

// Servicios de cliente
router.post('/clients/:clientId/services', adminController.assignService);
router.put('/clients/:clientId/services/:serviceId', adminController.updateClientService);

// Pagos
router.get('/payments', adminController.getPayments);
router.put('/payments/:id/validate', adminController.validatePayment);

// Trials
router.get('/trials', adminController.getTrials);
router.put('/trials/:id/extend', adminController.extendTrial);

// Servicios (catálogo)
router.get('/services', adminController.getServices);
router.put('/services/:id', adminController.updateService);

// Configuración del sistema
router.get('/config', adminController.getSystemConfig);
router.get('/config/bank', adminController.getBankDetails);
router.put('/config/bank', adminController.updateBankDetails);

// Configuración de Meta API
router.get('/config/meta', adminController.getMetaConfig);
router.put('/config/meta', adminController.updateMetaConfig);
router.post('/config/meta/test', adminController.testMetaConnection);

// Configuración de Telegram
router.get('/config/telegram', adminController.getTelegramConfig);
router.put('/config/telegram', adminController.updateTelegramConfig);
router.post('/config/telegram/test', adminController.testTelegramConnection);

// CRON Jobs - Ejecución manual
// POST /api/v1/admin/jobs/:jobName
// jobNames: expireTrials, expireSubscriptions, notifyExpiringTrials, refreshTokens, cleanup
router.post('/jobs/:jobName', adminController.runCronJob);

module.exports = router;
