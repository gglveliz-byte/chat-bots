const nodemailer = require('nodemailer');

// Crear transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: false, // true para 465, false para otros puertos
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Verificar conexión al iniciar
transporter.verify((error, success) => {
  if (error) {
    console.log('⚠️  Email no configurado:', error.message);
  } else {
    console.log('✅ Email configurado correctamente');
  }
});

// Plantilla base de email
const getBaseTemplate = (content) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%);
      margin: 0;
      padding: 40px 20px;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background: #1e293b;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(99, 102, 241, 0.2);
    }
    .header {
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
      padding: 40px 30px;
      text-align: center;
      position: relative;
    }
    .header::after {
      content: '';
      position: absolute;
      bottom: -20px;
      left: 0;
      right: 0;
      height: 20px;
      background: inherit;
      clip-path: polygon(0 0, 100% 0, 100% 100%, 0 0);
    }
    .logo {
      max-width: 120px;
      height: auto;
      margin-bottom: 10px;
      filter: brightness(0) invert(1);
    }
    .header h1 {
      color: white;
      margin: 0;
      font-size: 28px;
      font-weight: 700;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }
    .content {
      padding: 50px 40px 40px;
      color: #cbd5e1;
      line-height: 1.7;
    }
    .content h2 {
      color: white;
      margin-top: 0;
      font-size: 24px;
      margin-bottom: 20px;
    }
    .content p {
      margin: 15px 0;
      font-size: 15px;
    }
    .content ul {
      margin: 20px 0;
      padding-left: 25px;
    }
    .content ul li {
      margin: 10px 0;
    }
    .button {
      display: inline-block;
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
      color: white !important;
      padding: 16px 32px;
      border-radius: 12px;
      text-decoration: none;
      font-weight: 600;
      margin: 25px 0;
      box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4);
      transition: all 0.3s ease;
    }
    .button:hover {
      box-shadow: 0 6px 20px rgba(99, 102, 241, 0.6);
      transform: translateY(-2px);
    }
    .code {
      background: linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%);
      border: 2px solid rgba(99, 102, 241, 0.4);
      border-radius: 12px;
      padding: 25px;
      text-align: center;
      font-size: 36px;
      font-weight: 800;
      letter-spacing: 12px;
      color: #a5b4fc;
      margin: 30px 0;
      box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);
    }
    .info-box {
      background: rgba(99, 102, 241, 0.1);
      border: 1px solid rgba(99, 102, 241, 0.3);
      border-radius: 12px;
      padding: 20px;
      margin: 20px 0;
    }
    .info-box p {
      margin: 8px 0;
    }
    .success-box {
      background: rgba(16, 185, 129, 0.1);
      border: 1px solid rgba(16, 185, 129, 0.3);
      border-radius: 12px;
      padding: 20px;
      margin: 20px 0;
    }
    .success-box p {
      margin: 8px 0;
    }
    .footer {
      background: #0f172a;
      padding: 30px;
      text-align: center;
      color: #64748b;
      font-size: 13px;
      border-top: 1px solid rgba(99, 102, 241, 0.1);
    }
    .footer p {
      margin: 8px 0;
    }
    .footer a {
      color: #8b5cf6;
      text-decoration: none;
    }
    .footer .contact-info {
      margin-top: 20px;
      padding-top: 20px;
      border-top: 1px solid rgba(100, 116, 139, 0.2);
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="${process.env.FRONTEND_URL || 'http://localhost:3000'}/neurochat-logo.png" alt="NeuroChat" class="logo">
      <h1>NeuroChat</h1>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <p><strong>NeuroChat</strong> by TCSS Programming</p>
      <p>© 2026 TCSS Programming. Todos los derechos reservados.</p>
      <div class="contact-info">
        <p>📧 <a href="mailto:lveliz213@hotmail.com">lveliz213@hotmail.com</a></p>
        <p>📱 <a href="https://wa.me/593987865420">+593 98 786 5420</a></p>
      </div>
      <p style="margin-top: 15px; font-size: 11px; color: #475569;">Este es un correo automático, por favor no respondas directamente.</p>
    </div>
  </div>
</body>
</html>
`;

// Enviar email de verificación
const sendVerificationEmail = async (to, name, code) => {
  const content = `
    <h2>¡Hola ${name}! 👋</h2>
    <p>Gracias por registrarte en <strong>NeuroChat</strong>. Para verificar tu cuenta y comenzar a disfrutar de nuestros servicios de chatbots con IA, usa el siguiente código:</p>
    <div class="code">${code}</div>
    <p><strong>⏰ Este código expira en 30 minutos.</strong></p>
    <p style="color: #94a3b8; font-size: 14px; margin-top: 25px;">Si no solicitaste esta cuenta, puedes ignorar este correo de forma segura.</p>
  `;

  try {
    await transporter.sendMail({
      from: `"NeuroChat - TCSS Programming" <${process.env.SMTP_USER}>`,
      to,
      subject: '🔐 Verifica tu cuenta - NeuroChat',
      html: getBaseTemplate(content),
    });
    console.log('Email de verificación enviado a:', to);
    return true;
  } catch (error) {
    console.error('Error enviando email de verificación:', error.message);
    return false;
  }
};

// Enviar email de recuperación de contraseña
const sendPasswordResetEmail = async (to, name, code) => {
  const content = `
    <h2>¡Hola ${name}! 🔑</h2>
    <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta en <strong>NeuroChat</strong>. Usa el siguiente código de seguridad:</p>
    <div class="code">${code}</div>
    <p><strong>⏰ Este código expira en 30 minutos.</strong></p>
    <p style="color: #94a3b8; font-size: 14px; margin-top: 25px;">🔒 Si no solicitaste restablecer tu contraseña, por favor ignora este correo. Tu cuenta permanece segura.</p>
  `;

  try {
    await transporter.sendMail({
      from: `"NeuroChat - TCSS Programming" <${process.env.SMTP_USER}>`,
      to,
      subject: '🔑 Restablecer contraseña - NeuroChat',
      html: getBaseTemplate(content),
    });
    console.log('Email de recuperación enviado a:', to);
    return true;
  } catch (error) {
    console.error('Error enviando email de recuperación:', error.message);
    return false;
  }
};

// Enviar email de bienvenida
const sendWelcomeEmail = async (to, name) => {
  const content = `
    <h2>¡Bienvenido a NeuroChat, ${name}! 🎉</h2>
    <p>Tu cuenta ha sido <strong>verificada exitosamente</strong>. Ya puedes comenzar a usar <strong>NeuroChat</strong> y transformar la forma en que te comunicas con tus clientes.</p>
    <p style="margin-top: 25px; margin-bottom: 15px; font-size: 16px;">Con nuestra plataforma podrás:</p>
    <ul style="background: rgba(99, 102, 241, 0.05); border-left: 3px solid #6366f1; padding: 20px 20px 20px 35px; border-radius: 8px;">
      <li>🤖 <strong>Automatizar conversaciones</strong> en WhatsApp, Messenger, Instagram, Telegram y WebChat</li>
      <li>🧠 <strong>Respuestas inteligentes con IA</strong> que aprenden de tu negocio</li>
      <li>⏰ <strong>Atención 24/7</strong> sin interrupciones</li>
      <li>📊 <strong>Métricas en tiempo real</strong> de todas tus conversaciones</li>
    </ul>
    <center>
      <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/client/dashboard" class="button">
        🚀 Ir a mi Dashboard
      </a>
    </center>
    <p style="margin-top: 30px; padding-top: 25px; border-top: 1px solid rgba(100, 116, 139, 0.2); color: #94a3b8; font-size: 14px;">¿Necesitas ayuda? Contáctanos en cualquier momento. ¡Estamos aquí para ayudarte!</p>
  `;

  try {
    await transporter.sendMail({
      from: `"NeuroChat - TCSS Programming" <${process.env.SMTP_USER}>`,
      to,
      subject: '🎉 ¡Bienvenido a NeuroChat!',
      html: getBaseTemplate(content),
    });
    console.log('Email de bienvenida enviado a:', to);
    return true;
  } catch (error) {
    console.error('Error enviando email de bienvenida:', error.message);
    return false;
  }
};

// Enviar email de trial por vencer
const sendTrialExpiringEmail = async (to, name, daysRemaining, serviceName) => {
  const content = `
    <h2>¡Hola ${name}! ⏰</h2>
    <p>Te recordamos que tu <strong>período de prueba</strong> de <strong>${serviceName}</strong> en <strong>NeuroChat</strong> está por finalizar.</p>
    <div class="info-box">
      <p style="margin: 0; font-size: 16px;">⏰ <strong>Tiempo restante:</strong> ${daysRemaining} día(s)</p>
    </div>
    <p>Para seguir disfrutando del servicio <strong>sin interrupciones</strong> y continuar automatizando tus conversaciones con IA, suscríbete ahora:</p>
    <center>
      <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/client/payments" class="button">
        💳 Suscribirme Ahora
      </a>
    </center>
    <p style="margin-top: 30px; padding-top: 25px; border-top: 1px solid rgba(100, 116, 139, 0.2); color: #94a3b8; font-size: 14px;">¿Tienes alguna pregunta? No dudes en contactarnos. ¡Estamos aquí para ayudarte!</p>
  `;

  try {
    await transporter.sendMail({
      from: `"NeuroChat - TCSS Programming" <${process.env.SMTP_USER}>`,
      to,
      subject: `⏰ Tu período de prueba de ${serviceName} vence pronto - NeuroChat`,
      html: getBaseTemplate(content),
    });
    console.log('Email de trial enviado a:', to);
    return true;
  } catch (error) {
    console.error('Error enviando email de trial:', error.message);
    return false;
  }
};

// Enviar email de pago confirmado
const sendPaymentConfirmedEmail = async (to, name, serviceName, amount) => {
  const content = `
    <h2>¡Gracias ${name}! ✅</h2>
    <p>Tu pago ha sido <strong>confirmado exitosamente</strong>. ¡Gracias por confiar en <strong>NeuroChat</strong>!</p>
    <div class="success-box">
      <p style="margin: 0; font-size: 16px;">📦 <strong>Servicio:</strong> ${serviceName}</p>
      <p style="margin: 10px 0 0 0; font-size: 18px; color: #10b981;">💵 <strong>Monto:</strong> $${amount} USD</p>
    </div>
    <p>Tu servicio ya está <strong>activo y listo para usar</strong>. Puedes comenzar a disfrutar de todas las funcionalidades de inmediato.</p>
    <center>
      <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/client/dashboard" class="button">
        🚀 Ir a mi Dashboard
      </a>
    </center>
    <p style="margin-top: 30px; padding-top: 25px; border-top: 1px solid rgba(100, 116, 139, 0.2); color: #94a3b8; font-size: 14px;">Gracias por ser parte de NeuroChat. ¡Estamos emocionados de ayudarte a crecer!</p>
  `;

  try {
    await transporter.sendMail({
      from: `"NeuroChat - TCSS Programming" <${process.env.SMTP_USER}>`,
      to,
      subject: '✅ Pago confirmado - NeuroChat',
      html: getBaseTemplate(content),
    });
    console.log('Email de pago confirmado enviado a:', to);
    return true;
  } catch (error) {
    console.error('Error enviando email de pago:', error.message);
    return false;
  }
};

// Enviar credenciales (cuando admin crea un cliente)
const sendCredentialsEmail = async (to, name, password) => {
  const content = `
    <h2>¡Hola ${name}! 🔐</h2>
    <p>Se ha creado una cuenta para ti en <strong>NeuroChat</strong>. Aquí están tus <strong>credenciales de acceso</strong>:</p>
    <div class="info-box">
      <p style="margin: 0; font-size: 15px;">📧 <strong>Email:</strong> ${to}</p>
      <p style="margin: 12px 0 0 0; font-size: 15px;">🔑 <strong>Contraseña:</strong> <code style="background: rgba(99, 102, 241, 0.2); padding: 4px 8px; border-radius: 4px; color: #c7d2fe;">${password}</code></p>
    </div>
    <p style="background: rgba(245, 158, 11, 0.1); border-left: 3px solid #f59e0b; padding: 15px; border-radius: 6px; color: #fbbf24;">
      <strong>⚠️ Importante:</strong> Te recomendamos cambiar tu contraseña después de iniciar sesión por primera vez para mantener tu cuenta segura.
    </p>
    <center>
      <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/login" class="button">
        🚀 Iniciar Sesión
      </a>
    </center>
    <p style="margin-top: 30px; padding-top: 25px; border-top: 1px solid rgba(100, 116, 139, 0.2); color: #94a3b8; font-size: 14px;">¿Necesitas ayuda para comenzar? Contáctanos en cualquier momento.</p>
  `;

  try {
    await transporter.sendMail({
      from: `"NeuroChat - TCSS Programming" <${process.env.SMTP_USER}>`,
      to,
      subject: '🔐 Tus credenciales de acceso - NeuroChat',
      html: getBaseTemplate(content),
    });
    console.log('Email de credenciales enviado a:', to);
    return true;
  } catch (error) {
    console.error('Error enviando email de credenciales:', error.message);
    return false;
  }
};

/**
 * Email cuando el cliente alcanza su límite diario de mensajes
 */
const sendDailyLimitReachedEmail = async (to, name, serviceName, limit, planType) => {
  try {
    const planText = planType === 'trial' ? 'plan de prueba' : 'plan premium';
    const content = `
      <div class="icon">⚠️</div>
      <h1>Límite de Mensajes Alcanzado</h1>
      <p class="subtitle">Tu servicio ha alcanzado su límite diario</p>
    </div>
    <div class="content">
      <p>Hola <strong>${name}</strong>,</p>
      <div class="alert-box">
        <p class="alert-title">📊 Información del Límite</p>
        <p>Has alcanzado el límite de <strong>${limit} mensajes diarios</strong> de tu ${planText} para <strong>${serviceName}</strong>.</p>
        <p>El límite se reiniciará automáticamente mañana a las 00:00.</p>
      </div>

      <h2>¿Qué significa esto?</h2>
      <p>Tu chatbot de IA ha dejado de responder automáticamente por hoy. Los nuevos mensajes aparecerán en tu panel para que puedas responderlos manualmente.</p>

      <div class="info-box">
        <h3>🚀 ¿Necesitas más mensajes?</h3>
        <p>Si tu negocio requiere un plan personalizado con más mensajes diarios, contáctanos directamente:</p>
        <ul style="list-style: none; padding: 0; margin: 20px 0;">
          <li style="margin: 10px 0;">
            <strong>📧 Email:</strong>
            <a href="mailto:lveliz213@hotmail.com" style="color: #6366f1; text-decoration: none;">lveliz213@hotmail.com</a>
          </li>
          <li style="margin: 10px 0;">
            <strong>📱 WhatsApp:</strong>
            <a href="https://wa.me/593987865420" style="color: #25D366; text-decoration: none;">+593 987 865 420</a>
          </li>
        </ul>
        <p style="font-size: 14px; color: #94a3b8;">Podemos crear un plan a medida que se ajuste a las necesidades de tu negocio.</p>
      </div>

      <div class="cta-section">
        <p style="text-align: center; margin: 30px 0 10px;">Mientras tanto, puedes seguir atendiendo mensajes manualmente desde tu panel:</p>
        <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/client/dashboard" class="button">
          Ir a Mi Panel
        </a>
      </div>
    `;

    const mailOptions = {
      from: `"NeuroChat" <${process.env.SMTP_USER}>`,
      to,
      subject: '⚠️ Límite de Mensajes Alcanzado - NeuroChat',
      html: getBaseTemplate(content),
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Email de límite alcanzado enviado a ${to}`);
    return true;
  } catch (error) {
    console.error('Error enviando email de límite alcanzado:', error.message);
    return false;
  }
};

// Email: Suscripción por vencer (se envía 3 días antes)
const sendSubscriptionExpiringEmail = async (to, name, daysRemaining, serviceName, price) => {
  const content = `
    <h2>¡Hola ${name}! 📢</h2>
    <p>Tu suscripción de <strong>${serviceName}</strong> en <strong>NeuroChat</strong> está por vencer.</p>
    <div class="info-box">
      <p style="margin: 0; font-size: 16px;">⏰ <strong>Tiempo restante:</strong> ${daysRemaining} día(s)</p>
      <p style="margin: 8px 0 0; font-size: 14px;">💰 <strong>Renovación:</strong> $${price}/mes</p>
    </div>
    <p>Para que tu bot siga respondiendo <strong>sin interrupciones</strong>, renueva tu suscripción antes de que expire:</p>
    <center>
      <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/client/payments" class="button">
        💳 Renovar Ahora
      </a>
    </center>
    <p style="margin-top: 20px; color: #94a3b8; font-size: 14px;">Si no renuevas, tu bot dejará de responder automáticamente al vencer la suscripción.</p>
  `;

  try {
    await transporter.sendMail({
      from: `"NeuroChat - TCSS Programming" <${process.env.SMTP_USER}>`,
      to,
      subject: `⚠️ Tu suscripción de ${serviceName} vence en ${daysRemaining} día(s) - NeuroChat`,
      html: getBaseTemplate(content),
    });
    console.log('Email de suscripción por vencer enviado a:', to);
    return true;
  } catch (error) {
    console.error('Error enviando email de suscripción por vencer:', error.message);
    return false;
  }
};

// Email: Suscripción expirada
const sendSubscriptionExpiredEmail = async (to, name, serviceName, price) => {
  const content = `
    <h2>¡Hola ${name}! 😔</h2>
    <p>Tu suscripción de <strong>${serviceName}</strong> en <strong>NeuroChat</strong> ha expirado.</p>
    <div class="info-box" style="border-color: #ef4444;">
      <p style="margin: 0; font-size: 16px;">❌ <strong>Estado:</strong> Servicio desactivado</p>
      <p style="margin: 8px 0 0; font-size: 14px;">Tu bot ya no está respondiendo a tus clientes.</p>
    </div>
    <p>¡No te preocupes! Puedes reactivar tu servicio en cualquier momento por solo <strong>$${price}/mes</strong>:</p>
    <center>
      <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/client/payments" class="button">
        🚀 Reactivar Servicio
      </a>
    </center>
    <p style="margin-top: 20px; color: #94a3b8; font-size: 14px;">Tus configuraciones y datos se mantienen guardados. Solo necesitas renovar para volver a activar.</p>
  `;

  try {
    await transporter.sendMail({
      from: `"NeuroChat - TCSS Programming" <${process.env.SMTP_USER}>`,
      to,
      subject: `❌ Tu suscripción de ${serviceName} ha expirado - NeuroChat`,
      html: getBaseTemplate(content),
    });
    console.log('Email de suscripción expirada enviado a:', to);
    return true;
  } catch (error) {
    console.error('Error enviando email de suscripción expirada:', error.message);
    return false;
  }
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail,
  sendTrialExpiringEmail,
  sendSubscriptionExpiringEmail,
  sendSubscriptionExpiredEmail,
  sendPaymentConfirmedEmail,
  sendCredentialsEmail,
  sendDailyLimitReachedEmail,
};
