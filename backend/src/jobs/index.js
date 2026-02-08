const cron = require('node-cron');
const { refreshExpiringTokens, markExpiredTokens } = require('./tokenRefreshJob');
const { expireTrials, notifyExpiringTrials, notifyExpiringSubscriptions, expireSubscriptions } = require('./expirationJobs');
const { runAllCleanup } = require('./cleanupJob');

// =====================================================
// Orquestador de CRON Jobs
// Todas las tareas programadas del sistema
// =====================================================

const jobs = {};

/**
 * Inicializar todos los CRON jobs
 */
function initializeJobs() {
  console.log('⏰ Inicializando CRON Jobs...');

  // ─────────────────────────────────────────
  // CADA HORA
  // ─────────────────────────────────────────

  // Expirar trials vencidos - cada hora en el minuto 5
  jobs.expireTrials = cron.schedule('5 * * * *', async () => {
    try {
      await expireTrials();
    } catch (error) {
      console.error('[CRON ERROR] expireTrials:', error.message);
    }
  }, { scheduled: true, timezone: 'America/Guayaquil' });

  // Expirar suscripciones vencidas - cada hora en el minuto 10
  jobs.expireSubscriptions = cron.schedule('10 * * * *', async () => {
    try {
      await expireSubscriptions();
    } catch (error) {
      console.error('[CRON ERROR] expireSubscriptions:', error.message);
    }
  }, { scheduled: true, timezone: 'America/Guayaquil' });

  // ─────────────────────────────────────────
  // CADA 6 HORAS
  // ─────────────────────────────────────────

  // Notificar trials por expirar - cada 6 horas
  jobs.notifyExpiringTrials = cron.schedule('0 */6 * * *', async () => {
    try {
      await notifyExpiringTrials();
    } catch (error) {
      console.error('[CRON ERROR] notifyExpiringTrials:', error.message);
    }
  }, { scheduled: true, timezone: 'America/Guayaquil' });

  // Notificar suscripciones por vencer - cada 12 horas (8:00 AM y 8:00 PM)
  jobs.notifyExpiringSubscriptions = cron.schedule('0 8,20 * * *', async () => {
    try {
      await notifyExpiringSubscriptions();
    } catch (error) {
      console.error('[CRON ERROR] notifyExpiringSubscriptions:', error.message);
    }
  }, { scheduled: true, timezone: 'America/Guayaquil' });

  // ─────────────────────────────────────────
  // CADA 12 HORAS
  // ─────────────────────────────────────────

  // Renovar tokens de Meta - cada 12 horas (2:00 AM y 2:00 PM)
  jobs.refreshTokens = cron.schedule('0 2,14 * * *', async () => {
    try {
      await markExpiredTokens();
      await refreshExpiringTokens();
    } catch (error) {
      console.error('[CRON ERROR] refreshTokens:', error.message);
    }
  }, { scheduled: true, timezone: 'America/Guayaquil' });

  // ─────────────────────────────────────────
  // CADA 24 HORAS (MADRUGADA)
  // ─────────────────────────────────────────

  // Limpieza general - cada día a las 3:00 AM
  jobs.cleanup = cron.schedule('0 3 * * *', async () => {
    try {
      await runAllCleanup();
    } catch (error) {
      console.error('[CRON ERROR] cleanup:', error.message);
    }
  }, { scheduled: true, timezone: 'America/Guayaquil' });

  const jobCount = Object.keys(jobs).length;
  console.log(`✅ ${jobCount} CRON Jobs inicializados:`);
  console.log('   • expireTrials                → cada hora (:05)');
  console.log('   • expireSubscriptions         → cada hora (:10)');
  console.log('   • notifyExpiringTrials        → cada 6 horas');
  console.log('   • notifyExpiringSubscriptions → cada 12 horas (8:00 AM/PM)');
  console.log('   • refreshTokens               → cada 12 horas (2:00 AM/PM)');
  console.log('   • cleanup                     → diario (3:00 AM)');
}

/**
 * Detener todos los jobs (para shutdown graceful)
 */
function stopAllJobs() {
  console.log('⏹️  Deteniendo CRON Jobs...');
  for (const [name, job] of Object.entries(jobs)) {
    job.stop();
    console.log(`   ⏹️  ${name} detenido`);
  }
}

/**
 * Ejecutar un job manualmente (para admin/testing)
 * @param {string} jobName - Nombre del job
 */
async function runJobManually(jobName) {
  const jobMap = {
    expireTrials,
    expireSubscriptions,
    notifyExpiringTrials,
    notifyExpiringSubscriptions,
    refreshTokens: async () => {
      await markExpiredTokens();
      return await refreshExpiringTokens();
    },
    cleanup: runAllCleanup
  };

  if (!jobMap[jobName]) {
    throw new Error(`Job "${jobName}" no encontrado. Disponibles: ${Object.keys(jobMap).join(', ')}`);
  }

  console.log(`▶️  Ejecutando job manual: ${jobName}`);
  const result = await jobMap[jobName]();
  console.log(`✅ Job ${jobName} completado:`, result);
  return result;
}

module.exports = {
  initializeJobs,
  stopAllJobs,
  runJobManually
};
