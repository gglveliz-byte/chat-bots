(function() {
  'use strict';

  // Configuración del widget
  const WIDGET_CONFIG = {
    apiUrl: window.CHATBOT_SAAS_API || 'http://localhost:3001/api/v1',
    position: 'bottom-right', // bottom-right, bottom-left
    primaryColor: '#6366f1',
    secondaryColor: '#8b5cf6'
  };

  // Crear estilos del widget
  const styles = `
    #chatbot-saas-widget-container {
      position: fixed;
      z-index: 9999;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    }

    #chatbot-saas-widget-container.bottom-right {
      bottom: 20px;
      right: 20px;
    }

    #chatbot-saas-widget-container.bottom-left {
      bottom: 20px;
      left: 20px;
    }

    #chatbot-saas-widget-button {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: linear-gradient(135deg, ${WIDGET_CONFIG.primaryColor}, ${WIDGET_CONFIG.secondaryColor});
      border: none;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.2s, box-shadow 0.2s;
      position: relative;
    }

    #chatbot-saas-widget-button:hover {
      transform: scale(1.05);
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
    }

    #chatbot-saas-widget-button svg {
      width: 28px;
      height: 28px;
      fill: white;
    }

    #chatbot-saas-widget-badge {
      position: absolute;
      top: -5px;
      right: -5px;
      background: #ef4444;
      color: white;
      border-radius: 50%;
      width: 20px;
      height: 20px;
      display: none;
      align-items: center;
      justify-content: center;
      font-size: 11px;
      font-weight: bold;
    }

    #chatbot-saas-widget-badge.show {
      display: flex;
    }

    #chatbot-saas-widget-window {
      display: none;
      flex-direction: column;
      position: absolute;
      bottom: 80px;
      width: 380px;
      height: 600px;
      max-height: calc(100vh - 120px);
      background: white;
      border-radius: 16px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
      overflow: hidden;
    }

    #chatbot-saas-widget-container.bottom-right #chatbot-saas-widget-window {
      right: 0;
    }

    #chatbot-saas-widget-container.bottom-left #chatbot-saas-widget-window {
      left: 0;
    }

    #chatbot-saas-widget-window.open {
      display: flex;
      animation: slideUp 0.3s ease-out;
    }

    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    #chatbot-saas-widget-header {
      background: linear-gradient(135deg, ${WIDGET_CONFIG.primaryColor}, ${WIDGET_CONFIG.secondaryColor});
      color: white;
      padding: 16px 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    #chatbot-saas-widget-header-info {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    #chatbot-saas-widget-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
    }

    #chatbot-saas-widget-title h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
    }

    #chatbot-saas-widget-title p {
      margin: 2px 0 0;
      font-size: 12px;
      opacity: 0.9;
    }

    #chatbot-saas-widget-close {
      background: none;
      border: none;
      color: white;
      cursor: pointer;
      padding: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 8px;
      transition: background 0.2s;
    }

    #chatbot-saas-widget-close:hover {
      background: rgba(255, 255, 255, 0.1);
    }

    #chatbot-saas-widget-messages {
      flex: 1;
      overflow-y: auto;
      padding: 20px;
      background: #f9fafb;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .chatbot-saas-message {
      display: flex;
      align-items: flex-end;
      gap: 8px;
      max-width: 80%;
    }

    .chatbot-saas-message.bot {
      align-self: flex-start;
    }

    .chatbot-saas-message.user {
      align-self: flex-end;
      flex-direction: row-reverse;
    }

    .chatbot-saas-message-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: ${WIDGET_CONFIG.primaryColor};
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      flex-shrink: 0;
    }

    .chatbot-saas-message.user .chatbot-saas-message-avatar {
      background: #6b7280;
    }

    .chatbot-saas-message-bubble {
      padding: 10px 14px;
      border-radius: 16px;
      font-size: 14px;
      line-height: 1.4;
    }

    .chatbot-saas-message.bot .chatbot-saas-message-bubble {
      background: white;
      color: #1f2937;
      border-bottom-left-radius: 4px;
    }

    .chatbot-saas-message.user .chatbot-saas-message-bubble {
      background: ${WIDGET_CONFIG.primaryColor};
      color: white;
      border-bottom-right-radius: 4px;
    }

    .chatbot-saas-message-time {
      font-size: 11px;
      color: #9ca3af;
      margin-top: 4px;
    }

    #chatbot-saas-widget-typing {
      display: none;
      padding: 10px 14px;
      background: white;
      border-radius: 16px;
      width: fit-content;
      margin-left: 40px;
    }

    #chatbot-saas-widget-typing.show {
      display: block;
    }

    .chatbot-saas-typing-dots {
      display: flex;
      gap: 4px;
    }

    .chatbot-saas-typing-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #9ca3af;
      animation: typing 1.4s infinite;
    }

    .chatbot-saas-typing-dot:nth-child(2) {
      animation-delay: 0.2s;
    }

    .chatbot-saas-typing-dot:nth-child(3) {
      animation-delay: 0.4s;
    }

    @keyframes typing {
      0%, 60%, 100% {
        opacity: 0.3;
        transform: translateY(0);
      }
      30% {
        opacity: 1;
        transform: translateY(-4px);
      }
    }

    #chatbot-saas-widget-input-container {
      padding: 16px 20px;
      background: white;
      border-top: 1px solid #e5e7eb;
      display: flex;
      gap: 10px;
    }

    #chatbot-saas-widget-input {
      flex: 1;
      padding: 10px 14px;
      border: 1px solid #e5e7eb;
      border-radius: 20px;
      font-size: 14px;
      outline: none;
      transition: border-color 0.2s;
    }

    #chatbot-saas-widget-input:focus {
      border-color: ${WIDGET_CONFIG.primaryColor};
    }

    #chatbot-saas-widget-send {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: ${WIDGET_CONFIG.primaryColor};
      border: none;
      color: white;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: opacity 0.2s;
    }

    #chatbot-saas-widget-send:hover {
      opacity: 0.9;
    }

    #chatbot-saas-widget-send:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    @media (max-width: 480px) {
      #chatbot-saas-widget-window {
        width: calc(100vw - 40px);
        height: calc(100vh - 100px);
        bottom: 80px;
      }
    }
  `;

  // Inyectar estilos
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);

  // Crear estructura del widget
  const widgetHTML = `
    <div id="chatbot-saas-widget-container" class="${WIDGET_CONFIG.position}">
      <button id="chatbot-saas-widget-button" aria-label="Abrir chat">
        <svg viewBox="0 0 24 24">
          <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
        </svg>
        <span id="chatbot-saas-widget-badge">1</span>
      </button>

      <div id="chatbot-saas-widget-window">
        <div id="chatbot-saas-widget-header">
          <div id="chatbot-saas-widget-header-info">
            <div id="chatbot-saas-widget-avatar">🤖</div>
            <div id="chatbot-saas-widget-title">
              <h3>Asistente Virtual</h3>
              <p>En línea</p>
            </div>
          </div>
          <button id="chatbot-saas-widget-close" aria-label="Cerrar chat">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/>
            </svg>
          </button>
        </div>

        <div id="chatbot-saas-widget-messages"></div>

        <div id="chatbot-saas-widget-typing">
          <div class="chatbot-saas-typing-dots">
            <div class="chatbot-saas-typing-dot"></div>
            <div class="chatbot-saas-typing-dot"></div>
            <div class="chatbot-saas-typing-dot"></div>
          </div>
        </div>

        <div id="chatbot-saas-widget-input-container">
          <input
            type="text"
            id="chatbot-saas-widget-input"
            placeholder="Escribe un mensaje..."
            aria-label="Escribe un mensaje"
          />
          <button id="chatbot-saas-widget-send" aria-label="Enviar mensaje">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  `;

  // Insertar widget en el DOM
  const container = document.createElement('div');
  container.innerHTML = widgetHTML;
  document.body.appendChild(container.firstElementChild);

  // Variables globales
  let isOpen = false;
  let conversationId = null;
  let clientServiceId = null;

  // Elementos del DOM
  const widgetButton = document.getElementById('chatbot-saas-widget-button');
  const widgetWindow = document.getElementById('chatbot-saas-widget-window');
  const closeButton = document.getElementById('chatbot-saas-widget-close');
  const messagesContainer = document.getElementById('chatbot-saas-widget-messages');
  const inputField = document.getElementById('chatbot-saas-widget-input');
  const sendButton = document.getElementById('chatbot-saas-widget-send');
  const typingIndicator = document.getElementById('chatbot-saas-widget-typing');
  const badge = document.getElementById('chatbot-saas-widget-badge');

  // Obtener clientServiceId del script tag
  const scriptTag = document.querySelector('script[data-chatbot-id]');
  if (scriptTag) {
    clientServiceId = scriptTag.getAttribute('data-chatbot-id');
  }

  // Funciones
  function toggleWidget() {
    isOpen = !isOpen;
    if (isOpen) {
      widgetWindow.classList.add('open');
      inputField.focus();
      badge.classList.remove('show');
      if (!conversationId) {
        initConversation();
      }
    } else {
      widgetWindow.classList.remove('open');
    }
  }

  function addMessage(content, sender = 'bot') {
    const messageDiv = document.createElement('div');
    messageDiv.className = `chatbot-saas-message ${sender}`;

    const time = new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

    messageDiv.innerHTML = `
      <div class="chatbot-saas-message-avatar">${sender === 'bot' ? '🤖' : '👤'}</div>
      <div>
        <div class="chatbot-saas-message-bubble">${escapeHtml(content)}</div>
        <div class="chatbot-saas-message-time">${time}</div>
      </div>
    `;

    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function showTyping() {
    typingIndicator.classList.add('show');
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  function hideTyping() {
    typingIndicator.classList.remove('show');
  }

  async function initConversation() {
    try {
      showTyping();
      const response = await fetch(`${WIDGET_CONFIG.apiUrl}/webhook/webchat/init`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientServiceId })
      });

      const data = await response.json();
      hideTyping();

      if (data.success) {
        conversationId = data.data.conversationId;
        if (data.data.welcomeMessage) {
          addMessage(data.data.welcomeMessage, 'bot');
        }
      }
    } catch (error) {
      hideTyping();
      addMessage('Lo siento, hubo un error al conectar. Por favor intenta más tarde.', 'bot');
    }
  }

  async function sendMessage() {
    const message = inputField.value.trim();
    if (!message || !conversationId) return;

    addMessage(message, 'user');
    inputField.value = '';
    sendButton.disabled = true;

    try {
      showTyping();
      const response = await fetch(`${WIDGET_CONFIG.apiUrl}/webhook/webchat/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId,
          message,
          clientServiceId
        })
      });

      const data = await response.json();
      hideTyping();

      if (data.success && data.data.reply) {
        addMessage(data.data.reply, 'bot');
      }
    } catch (error) {
      hideTyping();
      addMessage('Lo siento, hubo un error. Por favor intenta de nuevo.', 'bot');
    } finally {
      sendButton.disabled = false;
    }
  }

  // Event listeners
  widgetButton.addEventListener('click', toggleWidget);
  closeButton.addEventListener('click', toggleWidget);

  sendButton.addEventListener('click', sendMessage);
  inputField.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  });

  // Auto-inicialización
  console.log('ChatBot SaaS Widget cargado');
})();
