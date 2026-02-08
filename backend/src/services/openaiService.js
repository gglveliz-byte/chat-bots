const OpenAI = require('openai');

// Inicializar cliente de OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Genera una respuesta usando OpenAI basada en el contexto del bot y el historial de mensajes
 * @param {Object} params - Parámetros para generar la respuesta
 * @param {string} params.userMessage - El mensaje del usuario
 * @param {Array} params.messageHistory - Historial de mensajes anteriores
 * @param {Object} params.botConfig - Configuración del bot (personalidad, instrucciones, etc.)
 * @param {Object} params.businessInfo - Información del negocio
 * @returns {Promise<string>} - La respuesta generada
 */
const generateResponse = async ({
  userMessage,
  messageHistory = [],
  botConfig = {},
  businessInfo = {}
}) => {
  try {
    // Construir el prompt del sistema basado en la configuración del bot
    const systemPrompt = buildSystemPrompt(botConfig, businessInfo);

    // Construir el historial de mensajes para contexto
    const messages = [
      { role: 'system', content: systemPrompt },
      ...formatMessageHistory(messageHistory),
      { role: 'user', content: userMessage }
    ];

    // Llamar a la API de OpenAI
    const completion = await openai.chat.completions.create({
      model: botConfig.model || 'gpt-4o-mini',
      messages,
      max_tokens: botConfig.maxTokens || 500,
      temperature: botConfig.temperature || 0.7,
      presence_penalty: 0.1,
      frequency_penalty: 0.1,
    });

    const response = completion.choices[0]?.message?.content;

    if (!response) {
      throw new Error('No se recibió respuesta de OpenAI');
    }

    return response.trim();

  } catch (error) {
    console.error('Error en OpenAI:', error.message);

    // Respuesta de fallback si hay error
    return botConfig.fallbackMessage ||
      'Lo siento, no puedo responder en este momento. Por favor, intenta de nuevo más tarde o contacta a un agente.';
  }
};

/**
 * Construye el prompt del sistema basado en la configuración del bot
 */
const buildSystemPrompt = (botConfig, businessInfo) => {
  const {
    personality = 'amable y profesional',
    language = 'español',
    tone = 'conversacional',
    instructions = '',
    welcomeMessage = '',
    faq = [],
    knowledgeBase = '',
    knowledgeFiles = []
  } = botConfig;

  const {
    name: businessName = 'el negocio',
    industry = '',
    description = '',
    website = '',
    address = '',
    phone = '',
    schedule = ''
  } = businessInfo;

  let prompt = `Eres un asistente virtual ${personality} que trabaja para ${businessName}.
Tu objetivo es ayudar a los clientes respondiendo sus preguntas de manera ${tone} en ${language}.
Hablas como alguien que atiende clientes por chat todos los días.
Usas frases cortas.
No repites información innecesaria.
No usas listas largas.
No suenas automático.

INFORMACIÓN DEL NEGOCIO:
- Nombre: ${businessName}
${industry ? `- Industria: ${industry}` : ''}
${description ? `- Descripción: ${description}` : ''}
${website ? `- Sitio web: ${website}` : ''}
${address ? `- Dirección: ${address}` : ''}
${phone ? `- Teléfono de contacto: ${phone}` : ''}
${schedule ? `- Horario de atención: ${schedule}` : ''}

REGLAS ESTRICTAS DE TEMA:
- SOLO responde sobre temas relacionados con ${businessName} y su ${industry || 'negocio'}.
- Si el usuario pregunta algo que NO tiene relación con el negocio, responde amablemente: "Solo puedo ayudarte con temas relacionados a ${businessName}. ¿Hay algo sobre nuestros productos o servicios en lo que pueda asistirte? 😊"
- Usa la información del negocio (descripción, industria, archivos de conocimiento) como tu ÚNICA fuente de verdad.
- NUNCA inventes información que no esté en tu contexto.

REGLAS DE COMUNICACIÓN:
1. Responde como una persona real, no como un robot
2. Usa un tono natural, cercano y educado
3. Usa emojis de forma natural y frecuente para hacer la conversación más dinámica y amigable. Usa 2-4 emojis por mensaje.
4. Adapta tu tono al cliente (formal o relajado)
5. Evita respuestas largas o técnicas
6. Si no sabes algo, sugiere hablar con un agente humano
7. Nunca menciones IA, OpenAI ni tecnología interna
8. Si el cliente está molesto, responde con empatía

REGLAS DE PROACTIVIDAD:
- Sé proactivo: ofrece información adicional relevante sobre el negocio
- Sugiere productos o servicios relacionados cuando sea pertinente
- Al final de tu respuesta, pregunta si necesitan algo más o si puedes ayudar en otra cosa
- Si detectas interés de compra, guía al cliente sobre cómo proceder`;

  if (instructions) {
    prompt += `\n\nINSTRUCCIONES ADICIONALES DEL NEGOCIO:\n${instructions}`;
  }

  if (faq && faq.length > 0) {
    prompt += '\n\nPREGUNTAS FRECUENTES:';
    faq.forEach((item, index) => {
      prompt += `\n${index + 1}. P: ${item.question}\n   R: ${item.answer}`;
    });
  }

  if (knowledgeBase) {
    prompt += `\n\nCONOCIMIENTO DEL NEGOCIO:\n${knowledgeBase}`;
  }

  // Agregar texto de archivos de knowledge_files
  if (knowledgeFiles && knowledgeFiles.length > 0) {
    prompt += '\n\nDOCUMENTACIÓN DEL NEGOCIO (archivos subidos):';
    knowledgeFiles.forEach((file) => {
      if (file.extracted_text) {
        prompt += `\n\n--- ${file.filename} ---\n${file.extracted_text}`;
      }
    });
  }

  return prompt;
};

/**
 * Formatea el historial de mensajes para la API de OpenAI
 */
const formatMessageHistory = (history) => {
  // Limitar el historial a los últimos 10 mensajes para no exceder el contexto
  const recentHistory = history.slice(-10);

  return recentHistory.map(msg => ({
    role: msg.sender_type === 'contact' ? 'user' : 'assistant',
    content: msg.content
  }));
};

/**
 * Analiza el sentimiento de un mensaje
 */
const analyzeSentiment = async (message) => {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'Analiza el sentimiento del mensaje y responde solo con: POSITIVO, NEGATIVO, o NEUTRAL'
        },
        { role: 'user', content: message }
      ],
      max_tokens: 10,
      temperature: 0,
    });

    const sentiment = completion.choices[0]?.message?.content?.trim().toUpperCase();

    if (['POSITIVO', 'NEGATIVO', 'NEUTRAL'].includes(sentiment)) {
      return sentiment;
    }
    return 'NEUTRAL';

  } catch (error) {
    console.error('Error analizando sentimiento:', error.message);
    return 'NEUTRAL';
  }
};

/**
 * Detecta la intención del mensaje del usuario
 */
const detectIntent = async (message) => {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `Clasifica la intención del mensaje en una de estas categorías:
- SALUDO: El usuario está saludando
- CONSULTA_PRODUCTO: Pregunta sobre productos o servicios
- CONSULTA_PRECIO: Pregunta sobre precios
- SOPORTE: Necesita ayuda técnica o soporte
- QUEJA: Está expresando una queja o insatisfacción
- COMPRA: Quiere realizar una compra o contratación
- HORARIO: Pregunta sobre horarios o disponibilidad
- UBICACION: Pregunta sobre ubicación o dirección
- CONTACTO_HUMANO: Quiere hablar con un agente humano
- DESPEDIDA: Se está despidiendo
- OTRO: No encaja en ninguna categoría

Responde SOLO con la categoría, sin explicación adicional.`
        },
        { role: 'user', content: message }
      ],
      max_tokens: 20,
      temperature: 0,
    });

    return completion.choices[0]?.message?.content?.trim().toUpperCase() || 'OTRO';

  } catch (error) {
    console.error('Error detectando intención:', error.message);
    return 'OTRO';
  }
};

/**
 * Genera sugerencias de respuesta rápida
 */
const generateQuickReplies = async (message, botConfig) => {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `Genera 3 posibles respuestas cortas que un usuario podría querer enviar como respuesta.
Formato: respuesta1|respuesta2|respuesta3
Las respuestas deben ser cortas (máximo 5 palabras cada una).`
        },
        { role: 'user', content: `Mensaje del bot: "${message}"` }
      ],
      max_tokens: 50,
      temperature: 0.7,
    });

    const replies = completion.choices[0]?.message?.content?.trim().split('|') || [];
    return replies.map(r => r.trim()).filter(r => r.length > 0);

  } catch (error) {
    console.error('Error generando quick replies:', error.message);
    return [];
  }
};

/**
 * Verifica si la API de OpenAI está configurada y funcionando
 */
const checkConnection = async () => {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return { success: false, error: 'API key no configurada' };
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: 'Test' }],
      max_tokens: 5,
    });

    return { success: true, model: 'gpt-4o-mini' };

  } catch (error) {
    return { success: false, error: error.message };
  }
};

module.exports = {
  generateResponse,
  analyzeSentiment,
  detectIntent,
  generateQuickReplies,
  checkConnection
};
