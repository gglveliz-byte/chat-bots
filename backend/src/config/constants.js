module.exports = {
  // Estados de cliente
  CLIENT_STATUS: {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    SUSPENDED: 'suspended'
  },

  // Estados de servicio
  SERVICE_STATUS: {
    TRIAL: 'trial',
    ACTIVE: 'active',
    EXPIRED: 'expired',
    CANCELLED: 'cancelled'
  },

  // Estados de pago
  PAYMENT_STATUS: {
    PENDING: 'pending',
    COMPLETED: 'completed',
    FAILED: 'failed',
    REFUNDED: 'refunded'
  },

  // Métodos de pago
  PAYMENT_METHODS: {
    PAYPAL: 'paypal',
    TRANSFER: 'transfer'
  },

  // Tipos de usuario
  USER_TYPES: {
    ADMIN: 'admin',
    CLIENT: 'client'
  },

  // Plataformas
  PLATFORMS: {
    WHATSAPP: 'whatsapp',
    MESSENGER: 'messenger',
    INSTAGRAM: 'instagram',
    TELEGRAM: 'telegram',
    WEBCHAT: 'webchat'
  },

  // Tipos de mensaje
  MESSAGE_TYPES: {
    TEXT: 'text',
    IMAGE: 'image',
    AUDIO: 'audio',
    VIDEO: 'video',
    DOCUMENT: 'document'
  },

  // Tipos de remitente
  SENDER_TYPES: {
    CONTACT: 'contact',
    BOT: 'bot',
    HUMAN: 'human'
  },

  // Estados de mensaje
  MESSAGE_STATUS: {
    PENDING: 'pending',
    SENT: 'sent',
    DELIVERED: 'delivered',
    READ: 'read',
    FAILED: 'failed'
  },

  // Configuración de trial
  TRIAL: {
    DURATION_DAYS: 5,
    MAX_MESSAGES_PER_DAY: 100
  },

  // Configuración de límites para planes pagados
  PAID: {
    MAX_MESSAGES_PER_DAY: 2000
  },

  // Límites por conversación (anti-abuso de usuarios finales)
  CONVERSATION_LIMITS: {
    MAX_MESSAGES_PER_DAY: 50  // Máximo de mensajes que un usuario final puede enviar por día
  },

  // Configuración de JWT
  JWT: {
    ACCESS_TOKEN_EXPIRES: '8h',
    REFRESH_TOKEN_EXPIRES: '30d'
  }
};
