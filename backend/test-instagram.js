// Script de diagnóstico para Instagram
// Ejecutar: node backend/test-instagram.js

const { query } = require('./src/config/database');

async function diagnoseInstagram() {
  console.log('\n🔍 DIAGNÓSTICO DE INSTAGRAM\n');

  try {
    // 1. Verificar servicios de Instagram
    const services = await query(`
      SELECT cs.id, cs.status, cs.config, c.email as client_email
      FROM client_services cs
      JOIN services s ON cs.service_id = s.id
      JOIN clients c ON cs.client_id = c.id
      WHERE s.code = 'instagram'
    `);

    if (services.rows.length === 0) {
      console.log('❌ No hay servicios de Instagram configurados');
      return;
    }

    for (const service of services.rows) {
      console.log(`\n📱 Cliente: ${service.client_email}`);
      console.log(`   Estado: ${service.status}`);

      const config = service.config || {};
      const creds = config.platform_credentials || {};

      console.log('\n   Credenciales OAuth:');
      console.log(`   ✓ OAuth conectado: ${config.oauth_connected ? 'SÍ' : 'NO'}`);
      console.log(`   ✓ Page ID: ${creds.page_id || 'NO CONFIGURADO'}`);
      console.log(`   ✓ Page Name: ${creds.page_name || 'NO CONFIGURADO'}`);
      console.log(`   ✓ Instagram Account ID: ${creds.instagram_account_id || 'NO CONFIGURADO ⚠️'}`);
      console.log(`   ✓ Instagram Username: ${creds.instagram_username || 'NO CONFIGURADO ⚠️'}`);
      console.log(`   ✓ Webhook subscribed: ${creds.webhook_subscribed ? 'SÍ' : 'NO'}`);

      if (!creds.instagram_account_id) {
        console.log('\n   ❌ PROBLEMA: No hay Instagram Account ID');
        console.log('   → La página de Facebook no tiene cuenta de Instagram vinculada');
        console.log('   → Ve a Meta Business Suite → Configuración → Cuentas de Instagram');
      }

      // Verificar conversaciones
      const convs = await query(`
        SELECT COUNT(*) as count FROM conversations WHERE client_service_id = $1
      `, [service.id]);

      console.log(`\n   Conversaciones: ${convs.rows[0].count}`);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }

  process.exit(0);
}

diagnoseInstagram();
