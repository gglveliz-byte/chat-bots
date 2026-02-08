const { query } = require('../config/database');
const metaOAuth = require('../services/metaOAuthService');

// =====================================================
// OAuth Controller - Flujo de Facebook Login
// Permite a los clientes conectar sus cuentas de
// WhatsApp Business, Messenger e Instagram
// =====================================================

/**
 * POST /api/v1/oauth/meta/start
 * Genera la URL de autorización para iniciar Facebook Login
 * Body: { serviceCode: 'whatsapp' | 'messenger' | 'instagram' }
 */
const startOAuth = async (req, res) => {
  try {
    const clientId = req.user.id;
    const { serviceCode } = req.body;

    if (!['whatsapp', 'messenger', 'instagram'].includes(serviceCode)) {
      return res.status(400).json({
        success: false,
        error: 'serviceCode debe ser: whatsapp, messenger o instagram'
      });
    }

    // Verificar que el cliente tiene ese servicio activo o en trial
    const serviceResult = await query(`
      SELECT cs.id, cs.status, s.code
      FROM client_services cs
      JOIN services s ON cs.service_id = s.id
      WHERE cs.client_id = $1 AND s.code = $2 AND cs.status IN ('active', 'trial')
    `, [clientId, serviceCode]);

    if (serviceResult.rows.length === 0) {
      return res.status(403).json({
        success: false,
        error: 'No tienes un servicio activo para esta plataforma'
      });
    }

    const redirectUri = `${process.env.BACKEND_URL}/api/v1/oauth/meta/callback`;

    const { authUrl, state } = await metaOAuth.generateAuthUrl({
      clientId,
      serviceCode,
      redirectUri
    });

    res.json({
      success: true,
      data: {
        authUrl,
        message: 'Redirige al usuario a authUrl para iniciar el flujo de Facebook Login'
      }
    });

  } catch (error) {
    console.error('Error iniciando OAuth:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error al iniciar la conexión con Meta'
    });
  }
};

/**
 * GET /api/v1/oauth/meta/callback
 * Facebook redirige aquí después de que el usuario autoriza
 * Query params: code, state (o error, error_reason si deniega)
 */
const handleCallback = async (req, res) => {
  try {
    const { code, state, error: oauthError, error_reason } = req.query;

    // Si el usuario denegó los permisos
    if (oauthError) {
      console.log('OAuth denegado:', oauthError, error_reason);
      return res.redirect(
        `${process.env.FRONTEND_URL}/client/services/connect?status=denied&reason=${encodeURIComponent(error_reason || oauthError)}`
      );
    }

    if (!code || !state) {
      return res.redirect(
        `${process.env.FRONTEND_URL}/client/services/connect?status=error&reason=missing_params`
      );
    }

    // 1. Validar state (CSRF protection)
    const stateData = await metaOAuth.validateOAuthState(state);
    if (!stateData) {
      return res.redirect(
        `${process.env.FRONTEND_URL}/client/services/connect?status=error&reason=invalid_state`
      );
    }

    const { clientId, serviceCode } = stateData;
    const redirectUri = `${process.env.BACKEND_URL}/api/v1/oauth/meta/callback`;

    // 2. Intercambiar code por short-lived token
    const shortLived = await metaOAuth.exchangeCodeForToken(code, redirectUri);

    // 3. Convertir a long-lived token
    const longLived = await metaOAuth.exchangeForLongLivedToken(shortLived.accessToken);

    // 4. Obtener client_service_id
    const csResult = await query(`
      SELECT cs.id FROM client_services cs
      JOIN services s ON cs.service_id = s.id
      WHERE cs.client_id = $1 AND s.code = $2
    `, [clientId, serviceCode]);

    if (csResult.rows.length === 0) {
      return res.redirect(
        `${process.env.FRONTEND_URL}/client/services/connect?status=error&reason=service_not_found`
      );
    }

    const clientServiceId = csResult.rows[0].id;
    let credentials = {};

    // 5. Según el servicio, obtener credenciales específicas
    if (serviceCode === 'whatsapp') {
      // Obtener WhatsApp Business Accounts
      const wabaAccounts = await metaOAuth.getWhatsAppBusinessAccounts(longLived.accessToken);

      if (wabaAccounts.length === 0) {
        return res.redirect(
          `${process.env.FRONTEND_URL}/client/services/connect?status=error&reason=no_waba_found`
        );
      }

      // Tomar el primer WABA y primer número (el cliente puede cambiar después)
      const firstWaba = wabaAccounts[0];
      const firstPhone = firstWaba.phoneNumbers[0];

      credentials = {
        user_access_token: longLived.accessToken,
        whatsapp_access_token: longLived.accessToken,
        waba_id: firstWaba.wabaId,
        waba_name: firstWaba.wabaName,
        business_id: firstWaba.businessId,
        phone_number_id: firstPhone?.phoneNumberId,
        display_phone: firstPhone?.displayPhone,
        verified_name: firstPhone?.verifiedName,
        available_accounts: wabaAccounts
      };

      // Suscribir webhooks automáticamente
      if (firstWaba.wabaId) {
        const subResult = await metaOAuth.subscribeWhatsAppWebhooks(
          firstWaba.wabaId, longLived.accessToken
        );
        credentials.webhook_subscribed = subResult.success;
      }

    } else if (serviceCode === 'messenger' || serviceCode === 'instagram') {
      // Obtener Pages y sus tokens
      const pages = await metaOAuth.getPageAccessTokens(longLived.accessToken);

      if (pages.length === 0) {
        return res.redirect(
          `${process.env.FRONTEND_URL}/client/services/connect?status=error&reason=no_pages_found`
        );
      }

      const firstPage = pages[0];

      credentials = {
        user_access_token: longLived.accessToken,
        page_access_token: firstPage.pageAccessToken, // Page tokens NO expiran
        page_id: firstPage.pageId,
        page_name: firstPage.pageName,
        available_pages: pages
      };

      // Para Instagram, incluir info de la cuenta IG
      if (serviceCode === 'instagram' && firstPage.instagramAccount) {
        credentials.instagram_account_id = firstPage.instagramAccount.id;
        credentials.instagram_username = firstPage.instagramAccount.username;
      }

      // Suscribir webhooks de la página
      const fields = serviceCode === 'messenger'
        ? ['messages', 'messaging_postbacks', 'messaging_optins']
        : ['messages', 'messaging_postbacks'];

      const subResult = await metaOAuth.subscribePageWebhooks(
        firstPage.pageId, firstPage.pageAccessToken, fields
      );
      credentials.webhook_subscribed = subResult.success;
    }

    // 6. Guardar credenciales encriptadas en DB
    await metaOAuth.saveClientCredentials(
      clientServiceId,
      credentials,
      longLived.expiresIn
    );

    // 7. Redirigir al frontend con éxito
    const successParams = new URLSearchParams({
      status: 'success',
      service: serviceCode,
      name: credentials.page_name || credentials.waba_name || credentials.verified_name || ''
    });

    res.redirect(`${process.env.FRONTEND_URL}/client/services/${serviceCode}/bot-config?${successParams.toString()}`);

  } catch (error) {
    console.error('Error en callback OAuth:', error);
    res.redirect(
      `${process.env.FRONTEND_URL}/client/services/connect?status=error&reason=${encodeURIComponent(error.message)}`
    );
  }
};

/**
 * GET /api/v1/oauth/meta/status
 * Verifica el estado de conexión OAuth del cliente
 * Query: ?serviceCode=whatsapp
 */
const getConnectionStatus = async (req, res) => {
  try {
    const clientId = req.user.id;
    const { serviceCode } = req.query;

    if (!serviceCode) {
      return res.status(400).json({ success: false, error: 'serviceCode requerido' });
    }

    const result = await query(`
      SELECT cs.id, cs.config, cs.token_expires_at, cs.token_status, cs.status,
             s.code as service_code, s.name as service_name
      FROM client_services cs
      JOIN services s ON cs.service_id = s.id
      WHERE cs.client_id = $1 AND s.code = $2
    `, [clientId, serviceCode]);

    if (result.rows.length === 0) {
      return res.json({
        success: true,
        data: { connected: false, reason: 'Servicio no encontrado' }
      });
    }

    const service = result.rows[0];
    const config = service.config || {};
    const isConnected = config.oauth_connected === true;

    // Verificar validez del token si está conectado
    let tokenValid = false;
    if (isConnected && service.token_expires_at) {
      tokenValid = new Date(service.token_expires_at) > new Date();
    }

    // Info segura para el frontend (sin tokens)
    const safeCredentials = {};
    if (config.platform_credentials) {
      const creds = config.platform_credentials;
      safeCredentials.page_name = creds.page_name;
      safeCredentials.waba_name = creds.waba_name;
      safeCredentials.display_phone = creds.display_phone;
      safeCredentials.verified_name = creds.verified_name;
      safeCredentials.instagram_username = creds.instagram_username;
      safeCredentials.webhook_subscribed = creds.webhook_subscribed;
    }

    res.json({
      success: true,
      data: {
        connected: isConnected,
        tokenStatus: service.token_status || (isConnected ? 'active' : 'disconnected'),
        tokenValid,
        tokenExpiresAt: service.token_expires_at,
        serviceStatus: service.status,
        credentials: safeCredentials,
        connectedAt: config.oauth_connected_at
      }
    });

  } catch (error) {
    console.error('Error verificando estado OAuth:', error);
    res.status(500).json({ success: false, error: 'Error interno' });
  }
};

/**
 * POST /api/v1/oauth/meta/disconnect
 * Desconecta OAuth y revoca permisos en Meta
 * Body: { serviceCode: 'whatsapp' }
 */
const disconnectOAuth = async (req, res) => {
  try {
    const clientId = req.user.id;
    const { serviceCode } = req.body;

    const csResult = await query(`
      SELECT cs.id FROM client_services cs
      JOIN services s ON cs.service_id = s.id
      WHERE cs.client_id = $1 AND s.code = $2
    `, [clientId, serviceCode]);

    if (csResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Servicio no encontrado' });
    }

    const result = await metaOAuth.revokeClientOAuth(csResult.rows[0].id);

    res.json({
      success: true,
      message: 'Cuenta desconectada exitosamente'
    });

  } catch (error) {
    console.error('Error desconectando OAuth:', error);
    res.status(500).json({ success: false, error: 'Error al desconectar' });
  }
};

/**
 * POST /api/v1/oauth/meta/select-account
 * Permite al cliente cambiar entre páginas/números disponibles
 * (Después de OAuth pueden tener múltiples)
 */
const selectAccount = async (req, res) => {
  try {
    const clientId = req.user.id;
    const { serviceCode, accountId } = req.body;

    const csResult = await query(`
      SELECT cs.id, cs.config FROM client_services cs
      JOIN services s ON cs.service_id = s.id
      WHERE cs.client_id = $1 AND s.code = $2
    `, [clientId, serviceCode]);

    if (csResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Servicio no encontrado' });
    }

    const config = csResult.rows[0].config || {};
    const creds = config.platform_credentials || {};

    if (serviceCode === 'whatsapp') {
      // Buscar en available_accounts
      const accounts = creds.available_accounts || [];
      let found = null;
      let foundPhone = null;

      for (const account of accounts) {
        for (const phone of account.phoneNumbers || []) {
          if (phone.phoneNumberId === accountId) {
            found = account;
            foundPhone = phone;
            break;
          }
        }
        if (found) break;
      }

      if (!found) {
        return res.status(404).json({ success: false, error: 'Cuenta no encontrada' });
      }

      creds.waba_id = found.wabaId;
      creds.waba_name = found.wabaName;
      creds.phone_number_id = foundPhone.phoneNumberId;
      creds.display_phone = foundPhone.displayPhone;
      creds.verified_name = foundPhone.verifiedName;

    } else {
      // Messenger/Instagram - buscar en available_pages
      const pages = creds.available_pages || [];
      const selectedPage = pages.find(p => p.pageId === accountId);

      if (!selectedPage) {
        return res.status(404).json({ success: false, error: 'Página no encontrada' });
      }

      creds.page_access_token = selectedPage.pageAccessToken;
      creds.page_id = selectedPage.pageId;
      creds.page_name = selectedPage.pageName;

      if (serviceCode === 'instagram' && selectedPage.instagramAccount) {
        creds.instagram_account_id = selectedPage.instagramAccount.id;
        creds.instagram_username = selectedPage.instagramAccount.username;
      }
    }

    config.platform_credentials = creds;

    await query(`
      UPDATE client_services SET config = $1::jsonb, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
    `, [JSON.stringify(config), csResult.rows[0].id]);

    res.json({
      success: true,
      message: 'Cuenta actualizada exitosamente'
    });

  } catch (error) {
    console.error('Error seleccionando cuenta:', error);
    res.status(500).json({ success: false, error: 'Error interno' });
  }
};

/**
 * GET /api/v1/oauth/meta/available-accounts
 * Lista las cuentas disponibles tras OAuth
 */
const getAvailableAccounts = async (req, res) => {
  try {
    const clientId = req.user.id;
    const { serviceCode } = req.query;

    const csResult = await query(`
      SELECT cs.config FROM client_services cs
      JOIN services s ON cs.service_id = s.id
      WHERE cs.client_id = $1 AND s.code = $2
    `, [clientId, serviceCode]);

    if (csResult.rows.length === 0) {
      return res.json({ success: true, data: { accounts: [] } });
    }

    const config = csResult.rows[0].config || {};
    const creds = config.platform_credentials || {};

    let accounts = [];
    if (serviceCode === 'whatsapp') {
      const wabaAccounts = creds.available_accounts || [];
      for (const account of wabaAccounts) {
        for (const phone of account.phoneNumbers || []) {
          accounts.push({
            id: phone.phoneNumberId,
            name: `${account.wabaName} - ${phone.displayPhone}`,
            verifiedName: phone.verifiedName,
            selected: phone.phoneNumberId === creds.phone_number_id
          });
        }
      }
    } else {
      const pages = creds.available_pages || [];
      accounts = pages.map(p => ({
        id: p.pageId,
        name: p.pageName,
        category: p.category,
        instagram: p.instagramAccount ? p.instagramAccount.username : null,
        selected: p.pageId === creds.page_id
      }));
    }

    res.json({ success: true, data: { accounts } });

  } catch (error) {
    console.error('Error obteniendo cuentas:', error);
    res.status(500).json({ success: false, error: 'Error interno' });
  }
};

module.exports = {
  startOAuth,
  handleCallback,
  getConnectionStatus,
  disconnectOAuth,
  selectAccount,
  getAvailableAccounts
};
