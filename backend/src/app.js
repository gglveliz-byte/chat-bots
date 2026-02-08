require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const http = require('http');
const { Server } = require('socket.io');

// Rutas
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const clientRoutes = require('./routes/client');
const serviceRoutes = require('./routes/service');
const webhookRoutes = require('./routes/webhook');
const oauthRoutes = require('./routes/oauth');

// Middleware
const { apiLimiter } = require('./middleware/rateLimiter');
const { captureRawBody } = require('./middleware/webhookSignature');

// Inicializar servicio de email (muestra estado al iniciar)
require('./services/emailService');

// Verificar conexión con OpenAI al iniciar
const { checkConnection: checkOpenAI } = require('./services/openaiService');
checkOpenAI().then(result => {
  if (result.success) {
    console.log('✅ OpenAI conectado correctamente');
  } else {
    console.log('⚠️  OpenAI no configurado:', result.error);
  }
});

// Setup Telegram bot global al iniciar
const { setupGlobalBot } = require('./services/telegramService');
setupGlobalBot();

// Crear app
const app = express();
const server = http.createServer(app);

// Socket.io con CORS flexible
const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      // Permitir frontend configurado
      const allowedOrigins = [
        process.env.FRONTEND_URL || 'http://localhost:3000',
        'http://localhost:3000',
        'http://localhost:3001'
      ];

      // Si no hay origin (llamadas desde servidor o Postman) o está en la lista, permitir
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        // Para el widget embebido, permitir cualquier origen
        callback(null, true);
      }
    },
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Inicializar WebSocket con autenticación y manejo de salas
const { initializeWebSocket } = require('./websocket/socketManager');
initializeWebSocket(io);

// Middleware global
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// CORS selectivo: Webchat widget necesita permitir CUALQUIER origen
app.use((req, res, next) => {
  // Rutas públicas del widget: permitir cualquier origen
  if (req.path.startsWith('/api/v1/webhook/webchat') || req.path.startsWith('/api/v1/widget')) {
    res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');

    // Manejar preflight OPTIONS
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    return next();
  }

  // Para el resto de rutas: solo permitir frontend configurado
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
  })(req, res, next);
});
// IMPORTANTE: verify callback captura el raw body ANTES del parse
// Necesario para verificar X-Hub-Signature-256 de Meta
app.use(express.json({ limit: '10mb', verify: captureRawBody }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting global
app.use('/api', apiLimiter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Servir archivos estáticos de uploads
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Rutas API
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/client', clientRoutes);
app.use('/api/v1/service', serviceRoutes);
app.use('/api/v1/webhook', webhookRoutes);
app.use('/api/v1/oauth', oauthRoutes);

// Ruta para servicios disponibles (pública)
const { query } = require('./config/database');
app.get('/api/v1/services', async (req, res) => {
  try {
    const result = await query('SELECT id, name, code, description, price_monthly, icon, color FROM services WHERE is_active = true ORDER BY price_monthly ASC');
    res.json({
      success: true,
      data: { services: result.rows }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// Webhooks legacy (redirigir a nuevas rutas)
app.use('/api/v1/webhooks', webhookRoutes);

// Widget - obtener configuración
app.get('/api/v1/widget/config/:clientId', async (req, res) => {
  try {
    const { clientId } = req.params;

    const result = await query(`
      SELECT bc.welcome_message, bc.personality, bc.language,
             b.name as business_name, b.logo_url,
             cs.config
      FROM client_services cs
      JOIN services s ON cs.service_id = s.id
      JOIN bot_configs bc ON cs.id = bc.client_service_id
      JOIN businesses b ON cs.client_id = b.client_id
      WHERE cs.client_id = $1 AND s.code = 'webchat' AND cs.status IN ('trial', 'active')
    `, [clientId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Widget no configurado o servicio inactivo'
      });
    }

    const config = result.rows[0];

    res.json({
      success: true,
      data: {
        welcomeMessage: config.welcome_message,
        businessName: config.business_name,
        logo: config.logo_url,
        personality: config.personality,
        language: config.language,
        widgetConfig: config.config || {}
      }
    });

  } catch (error) {
    console.error('Error en widget config:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno'
    });
  }
});

// Manejo de errores 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Ruta no encontrada'
  });
});

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'development' ? err.message : 'Error interno del servidor'
  });
});

// Exportar io para usar en otros módulos
app.set('io', io);

// Inicializar CRON Jobs
const { initializeJobs, stopAllJobs } = require('./jobs');
initializeJobs();

// Iniciar servidor
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║   🤖 ChatBot SaaS Backend                                  ║
║   ─────────────────────────────                            ║
║   Server running on port ${PORT}                             ║
║   Environment: ${process.env.NODE_ENV || 'development'}                           ║
║                                                            ║
║   Endpoints:                                               ║
║   • Health: http://localhost:${PORT}/health                   ║
║   • API: http://localhost:${PORT}/api/v1                      ║
║   • OAuth: http://localhost:${PORT}/api/v1/oauth              ║
║   • CRON Jobs: activos ✅                                   ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('📛 SIGTERM recibido. Cerrando servidor...');
  stopAllJobs();
  server.close(() => {
    console.log('✅ Servidor cerrado');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('📛 SIGINT recibido. Cerrando servidor...');
  stopAllJobs();
  server.close(() => {
    console.log('✅ Servidor cerrado');
    process.exit(0);
  });
});

module.exports = { app, server, io };
