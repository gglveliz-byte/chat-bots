const { query, transaction } = require('../config/database');
const { hashPassword, comparePassword, generateVerificationCode } = require('../utils/hash');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken, revokeRefreshToken, revokeAllUserTokens } = require('../utils/jwt');
const { USER_TYPES, CLIENT_STATUS, TRIAL } = require('../config/constants');
const { sendVerificationEmail, sendPasswordResetEmail, sendWelcomeEmail } = require('../services/emailService');

// Login (admin o cliente)
const login = async (req, res) => {
  try {
    const { email, password, userType = 'client' } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email y contraseña son requeridos'
      });
    }

    // Login de ADMIN desde variables de entorno
    if (userType === 'admin') {
      const adminEmail = process.env.ADMIN_EMAIL;
      const adminPassword = process.env.ADMIN_PASSWORD;
      const adminName = process.env.ADMIN_NAME || 'Admin';

      if (!adminEmail || !adminPassword) {
        return res.status(500).json({
          success: false,
          error: 'Credenciales de administrador no configuradas'
        });
      }

      // Validar email y contraseña
      if (email.toLowerCase() !== adminEmail.toLowerCase() || password !== adminPassword) {
        return res.status(401).json({
          success: false,
          error: 'Credenciales inválidas'
        });
      }

      // Crear objeto admin (sin guardar en BD)
      const adminUser = {
        id: 'admin-env',
        email: adminEmail,
        name: adminName,
        role: 'superadmin',
        type: 'admin',
        email_verified: true
      };

      // Generar tokens
      const accessToken = generateAccessToken(adminUser, 'admin');
      const refreshToken = await generateRefreshToken('admin-env', 'admin');

      return res.json({
        success: true,
        data: {
          user: adminUser,
          business: null,
          services: [],
          tokens: {
            accessToken,
            refreshToken
          }
        }
      });
    }

    // Login de CLIENTE desde base de datos
    const result = await query(
      'SELECT * FROM clients WHERE email = $1',
      [email.toLowerCase()]
    );

    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Credenciales inválidas'
      });
    }

    // Verificar contraseña
    const isValid = await comparePassword(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({
        success: false,
        error: 'Credenciales inválidas'
      });
    }

    // Verificar estado
    if (user.status !== CLIENT_STATUS.ACTIVE) {
      return res.status(403).json({
        success: false,
        error: 'Cuenta no activa'
      });
    }

    // Actualizar último login
    await query(
      'UPDATE clients SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
      [user.id]
    );

    // Generar tokens
    const accessToken = generateAccessToken(user, 'client');
    const refreshToken = await generateRefreshToken(user.id, 'client');

    // Obtener datos adicionales para cliente
    const businessResult = await query(
      'SELECT * FROM businesses WHERE client_id = $1',
      [user.id]
    );
    const business = businessResult.rows[0] || null;

    const servicesResult = await query(`
      SELECT cs.*, s.name, s.code, s.icon, s.color
      FROM client_services cs
      JOIN services s ON cs.service_id = s.id
      WHERE cs.client_id = $1
    `, [user.id]);
    const services = servicesResult.rows;

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          type: 'client',
          email_verified: user.email_verified
        },
        business,
        services,
        tokens: {
          accessToken,
          refreshToken
        }
      }
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

// Registro de cliente
const register = async (req, res) => {
  try {
    const { email, password, name, phone } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({
        success: false,
        error: 'Email, contraseña y nombre son requeridos'
      });
    }

    // Validar contraseña
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        error: 'La contraseña debe tener al menos 8 caracteres'
      });
    }

    // Verificar si el email ya existe
    const existingUser = await query(
      'SELECT id FROM clients WHERE email = $1',
      [email.toLowerCase()]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Este email ya está registrado'
      });
    }

    // Hashear contraseña
    const passwordHash = await hashPassword(password);

    // Crear cliente
    const result = await query(`
      INSERT INTO clients (email, password_hash, name, phone, status, email_verified)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, email, name, phone
    `, [email.toLowerCase(), passwordHash, name, phone, CLIENT_STATUS.ACTIVE, false]);

    const newClient = result.rows[0];

    // Generar código de verificación
    const verificationCode = generateVerificationCode();

    // Usar timestamp de PostgreSQL para evitar problemas de zona horaria
    await query(`
      INSERT INTO email_verifications (email, code, type, expires_at)
      VALUES ($1, $2, 'registration', CURRENT_TIMESTAMP + INTERVAL '30 minutes')
    `, [email.toLowerCase(), verificationCode]);

    console.log('📧 Código de verificación para', email.toLowerCase(), ':', verificationCode);

    // Enviar email con código de verificación (con await)
    await sendVerificationEmail(email.toLowerCase(), name, verificationCode);

    // Generar tokens
    const accessToken = generateAccessToken(newClient, 'client');
    const refreshToken = await generateRefreshToken(newClient.id, 'client');

    res.status(201).json({
      success: true,
      message: 'Cuenta creada exitosamente. Verifica tu email.',
      data: {
        user: {
          id: newClient.id,
          email: newClient.email,
          name: newClient.name,
          type: 'client',
          email_verified: false
        },
        tokens: {
          accessToken,
          refreshToken
        },
        verificationCode // Solo para desarrollo, quitar en producción
      }
    });

  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

// Verificar email
const verifyEmail = async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({
        success: false,
        error: 'Email y código son requeridos'
      });
    }

    console.log('🔍 Verificando código:', code, 'para email:', email.toLowerCase());

    // Buscar código de verificación
    const verificationResult = await query(`
      SELECT *,
             expires_at > CURRENT_TIMESTAMP as is_valid,
             CURRENT_TIMESTAMP as now
      FROM email_verifications
      WHERE email = $1 AND code = $2 AND type = 'registration'
      AND used_at IS NULL
      ORDER BY created_at DESC
      LIMIT 1
    `, [email.toLowerCase(), code]);

    console.log('🔍 Resultado búsqueda:', verificationResult.rows[0] || 'No encontrado');

    if (verificationResult.rows.length === 0) {
      // Buscar si existe algún código para este email para debug
      const debugResult = await query(`
        SELECT code, expires_at, used_at, created_at FROM email_verifications
        WHERE email = $1 AND type = 'registration'
        ORDER BY created_at DESC LIMIT 3
      `, [email.toLowerCase()]);
      console.log('🔍 Códigos existentes para este email:', debugResult.rows);

      return res.status(400).json({
        success: false,
        error: 'Código inválido o expirado'
      });
    }

    // Verificar si expiró
    if (!verificationResult.rows[0].is_valid) {
      return res.status(400).json({
        success: false,
        error: 'El código ha expirado. Solicita uno nuevo.'
      });
    }

    // Marcar código como usado
    await query(`
      UPDATE email_verifications
      SET used_at = CURRENT_TIMESTAMP
      WHERE id = $1
    `, [verificationResult.rows[0].id]);

    // Actualizar cliente como verificado
    await query(`
      UPDATE clients
      SET email_verified = true, email_verified_at = CURRENT_TIMESTAMP
      WHERE email = $1
    `, [email.toLowerCase()]);

    // Obtener nombre del cliente para el email de bienvenida
    const clientResult = await query('SELECT name FROM clients WHERE email = $1', [email.toLowerCase()]);
    if (clientResult.rows.length > 0) {
      sendWelcomeEmail(email.toLowerCase(), clientResult.rows[0].name);
    }

    res.json({
      success: true,
      message: 'Email verificado exitosamente'
    });

  } catch (error) {
    console.error('Error en verificación:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

// Refresh token
const refreshAccessToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        error: 'Refresh token requerido'
      });
    }

    const tokenData = await verifyRefreshToken(refreshToken);

    if (!tokenData) {
      return res.status(401).json({
        success: false,
        error: 'Refresh token inválido o expirado'
      });
    }

    let user;

    // Si es admin desde .env
    if (tokenData.user_type === 'admin' && tokenData.user_id === 'admin-env') {
      user = {
        id: 'admin-env',
        email: process.env.ADMIN_EMAIL,
        name: process.env.ADMIN_NAME || 'Admin',
        role: 'superadmin'
      };
    } else {
      // Obtener usuario desde BD
      const table = tokenData.user_type === 'admin' ? 'admins' : 'clients';
      const userResult = await query(
        `SELECT * FROM ${table} WHERE id = $1`,
        [tokenData.user_id]
      );

      if (userResult.rows.length === 0) {
        return res.status(401).json({
          success: false,
          error: 'Usuario no encontrado'
        });
      }

      user = userResult.rows[0];
    }

    // Revocar token actual
    await revokeRefreshToken(refreshToken);

    // Generar nuevos tokens
    const newAccessToken = generateAccessToken(user, tokenData.user_type);
    const newRefreshToken = await generateRefreshToken(user.id, tokenData.user_type);

    res.json({
      success: true,
      data: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken
      }
    });

  } catch (error) {
    console.error('Error en refresh token:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

// Logout
const logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      await revokeRefreshToken(refreshToken);
    }

    res.json({
      success: true,
      message: 'Sesión cerrada exitosamente'
    });

  } catch (error) {
    console.error('Error en logout:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

// Logout de todos los dispositivos
const logoutAll = async (req, res) => {
  try {
    await revokeAllUserTokens(req.user.id, req.user.type);

    res.json({
      success: true,
      message: 'Sesión cerrada en todos los dispositivos'
    });

  } catch (error) {
    console.error('Error en logout all:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

// Solicitar recuperación de contraseña
const forgotPassword = async (req, res) => {
  try {
    const { email, userType = 'client' } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email requerido'
      });
    }

    const table = userType === 'admin' ? 'admins' : 'clients';
    const userResult = await query(
      `SELECT id, email, name FROM ${table} WHERE email = $1`,
      [email.toLowerCase()]
    );

    // Siempre responder con éxito por seguridad
    if (userResult.rows.length === 0) {
      return res.json({
        success: true,
        message: 'Si el email existe, recibirás instrucciones para recuperar tu contraseña'
      });
    }

    // Generar código con timestamp de PostgreSQL
    const code = generateVerificationCode();

    await query(`
      INSERT INTO email_verifications (email, code, type, expires_at)
      VALUES ($1, $2, 'password_reset', CURRENT_TIMESTAMP + INTERVAL '30 minutes')
    `, [email.toLowerCase(), code]);

    console.log('📧 Código de recuperación para', email.toLowerCase(), ':', code);

    // Enviar email con código de recuperación (con await)
    const userName = userResult.rows[0].name;
    await sendPasswordResetEmail(email.toLowerCase(), userName, code);

    res.json({
      success: true,
      message: 'Si el email existe, recibirás instrucciones para recuperar tu contraseña'
    });

  } catch (error) {
    console.error('Error en forgot password:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

// Restablecer contraseña
const resetPassword = async (req, res) => {
  try {
    const { email, code, newPassword, userType = 'client' } = req.body;

    if (!email || !code || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Email, código y nueva contraseña son requeridos'
      });
    }

    // Validar contraseña
    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        error: 'La contraseña debe tener al menos 8 caracteres'
      });
    }

    // Verificar código
    const verificationResult = await query(`
      SELECT * FROM email_verifications
      WHERE email = $1 AND code = $2 AND type = 'password_reset'
      AND expires_at > CURRENT_TIMESTAMP AND used_at IS NULL
    `, [email.toLowerCase(), code]);

    if (verificationResult.rows.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Código inválido o expirado'
      });
    }

    // Hashear nueva contraseña
    const passwordHash = await hashPassword(newPassword);

    // Actualizar contraseña
    const table = userType === 'admin' ? 'admins' : 'clients';
    await query(`
      UPDATE ${table}
      SET password_hash = $1, updated_at = CURRENT_TIMESTAMP
      WHERE email = $2
    `, [passwordHash, email.toLowerCase()]);

    // Marcar código como usado
    await query(`
      UPDATE email_verifications
      SET used_at = CURRENT_TIMESTAMP
      WHERE id = $1
    `, [verificationResult.rows[0].id]);

    // Revocar todos los tokens del usuario
    const userResult = await query(
      `SELECT id FROM ${table} WHERE email = $1`,
      [email.toLowerCase()]
    );

    if (userResult.rows.length > 0) {
      await revokeAllUserTokens(userResult.rows[0].id, userType);
    }

    res.json({
      success: true,
      message: 'Contraseña actualizada exitosamente'
    });

  } catch (error) {
    console.error('Error en reset password:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

// Reenviar código de verificación
const resendVerification = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email requerido'
      });
    }

    // Verificar si el cliente existe
    const clientResult = await query(
      'SELECT id, name, email_verified FROM clients WHERE email = $1',
      [email.toLowerCase()]
    );

    if (clientResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No existe una cuenta con este email'
      });
    }

    const client = clientResult.rows[0];

    if (client.email_verified) {
      return res.status(400).json({
        success: false,
        error: 'Este email ya está verificado'
      });
    }

    // Invalidar códigos anteriores
    await query(`
      UPDATE email_verifications
      SET used_at = CURRENT_TIMESTAMP
      WHERE email = $1 AND type = 'registration' AND used_at IS NULL
    `, [email.toLowerCase()]);

    // Generar nuevo código con timestamp de PostgreSQL
    const verificationCode = generateVerificationCode();

    await query(`
      INSERT INTO email_verifications (email, code, type, expires_at)
      VALUES ($1, $2, 'registration', CURRENT_TIMESTAMP + INTERVAL '30 minutes')
    `, [email.toLowerCase(), verificationCode]);

    console.log('📧 Código de verificación reenviado para', email.toLowerCase(), ':', verificationCode);

    // Enviar email (con await)
    await sendVerificationEmail(email.toLowerCase(), client.name, verificationCode);

    res.json({
      success: true,
      message: 'Código de verificación reenviado'
    });

  } catch (error) {
    console.error('Error en resend verification:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

// Obtener usuario actual
const getMe = async (req, res) => {
  try {
    const { id, type } = req.user;

    let userData;
    if (type === 'admin') {
      // Admin desde variables de entorno
      if (id === 'admin-env') {
        userData = {
          id: 'admin-env',
          email: process.env.ADMIN_EMAIL,
          name: process.env.ADMIN_NAME || 'Admin',
          role: 'superadmin',
          email_verified: true,
          created_at: null,
          last_login: null
        };
      } else {
        // Admin legacy desde BD (por si acaso)
        const result = await query(
          'SELECT id, email, name, role, created_at, last_login FROM admins WHERE id = $1',
          [id]
        );
        userData = result.rows[0];
      }
    } else {
      const result = await query(`
        SELECT c.id, c.email, c.name, c.phone, c.status, c.email_verified, c.created_at, c.last_login,
               b.name as business_name, b.industry, b.description as business_description,
               b.country, b.address as business_address, b.website, b.phone as business_phone,
               b.email as business_email, b.logo_url
        FROM clients c
        LEFT JOIN businesses b ON c.id = b.client_id
        WHERE c.id = $1
      `, [id]);
      userData = result.rows[0];

      // Obtener servicios
      const servicesResult = await query(`
        SELECT cs.*, s.name, s.code, s.icon, s.color, s.price_monthly
        FROM client_services cs
        JOIN services s ON cs.service_id = s.id
        WHERE cs.client_id = $1
      `, [id]);
      userData.services = servicesResult.rows;
    }

    res.json({
      success: true,
      data: {
        ...userData,
        type
      }
    });

  } catch (error) {
    console.error('Error en getMe:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

module.exports = {
  login,
  register,
  verifyEmail,
  resendVerification,
  refreshAccessToken,
  logout,
  logoutAll,
  forgotPassword,
  resetPassword,
  getMe
};
