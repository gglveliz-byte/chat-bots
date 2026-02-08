const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const clientController = require('../controllers/clientController');
const { authenticate, clientOnly, emailVerified } = require('../middleware/auth');
const { validateUpdateProfile, validateUpdateBusiness, validateChangePassword } = require('../middleware/validation');

// Crear directorio de receipts si no existe
const receiptsDir = path.join(__dirname, '../../uploads/receipts');
fs.mkdirSync(receiptsDir, { recursive: true });

// Configuración de multer para subida de comprobantes
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, receiptsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB máximo
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Solo se permiten archivos JPG, PNG o PDF'));
  }
});

// Multer para archivos de conocimiento (PDF/TXT) - en memoria
const knowledgeUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB máximo
  fileFilter: (req, file, cb) => {
    const allowedTypes = /pdf|txt/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = file.mimetype === 'application/pdf' || file.mimetype === 'text/plain';
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Solo se permiten archivos PDF o TXT'));
  }
});

// Todas las rutas requieren autenticación de cliente
router.use(authenticate, clientOnly);

// Dashboard
router.get('/dashboard', clientController.getDashboard);

// Perfil
router.get('/profile', clientController.getProfile);
router.put('/profile', validateUpdateProfile, clientController.updateProfile);
router.put('/password', validateChangePassword, clientController.changePassword);

// Negocio
router.get('/business', clientController.getBusiness);
router.put('/business', validateUpdateBusiness, clientController.updateBusiness);

// Servicios
router.get('/services', clientController.getMyServices);
router.get('/services/:code', clientController.getServiceDetail);
router.post('/services/trial', emailVerified, clientController.activateTrial);

// Pagos - endpoints originales
router.get('/payments', clientController.getMyPayments);
router.post('/payments', emailVerified, clientController.createPayment);
router.put('/payments/:paymentId/receipt', clientController.uploadReceipt);

// Pagos - nuevos endpoints
router.get('/payments/services', clientController.getServicesToPay);
router.get('/payments/history', clientController.getPaymentHistory);
router.get('/payments/bank-details', clientController.getBankDetails);
router.post('/payments/paypal/create', emailVerified, clientController.createPayPalOrder);
router.post('/payments/paypal/capture', emailVerified, clientController.capturePayPalOrder);
router.post('/payments/transfer', emailVerified, upload.single('proof'), clientController.submitTransferProof);

// Suscripción
router.get('/subscription', clientController.getSubscriptionStatus);

// Knowledge Files (globales por cliente)
router.get('/business/knowledge-files', clientController.getKnowledgeFiles);
router.post('/business/knowledge-files', knowledgeUpload.single('file'), clientController.uploadKnowledgeFile);
router.delete('/business/knowledge-files/:fileId', clientController.deleteKnowledgeFile);

module.exports = router;
