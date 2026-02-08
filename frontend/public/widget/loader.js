/**
 * ChatBot SaaS - Widget Loader
 * Este es el script que los clientes copian en su sitio web
 */

(function() {
  // Evitar carga múltiple
  if (window.ChatBotSaasLoaded) return;
  window.ChatBotSaasLoaded = true;

  // Obtener el script tag actual para leer la configuración
  const currentScript = document.currentScript || document.querySelector('script[data-chatbot-id]');

  if (!currentScript) {
    console.error('ChatBot SaaS: No se encontró el script tag con data-chatbot-id');
    return;
  }

  const clientServiceId = currentScript.getAttribute('data-chatbot-id');
  const widgetUrl = currentScript.getAttribute('data-widget-url') || 'http://localhost:3000/widget/chat-widget.js';
  const apiUrl = currentScript.getAttribute('data-api-url') || 'http://localhost:3001/api/v1';

  if (!clientServiceId) {
    console.error('ChatBot SaaS: data-chatbot-id es requerido');
    return;
  }

  // Configurar variable global para el widget
  window.CHATBOT_SAAS_API = apiUrl;

  // Cargar el widget principal
  const script = document.createElement('script');
  script.src = widgetUrl;
  script.async = true;
  script.setAttribute('data-chatbot-id', clientServiceId);

  script.onerror = function() {
    console.error('ChatBot SaaS: Error al cargar el widget');
  };

  document.head.appendChild(script);
})();
