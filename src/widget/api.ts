// src/widget/api.ts
export type Role = 'user'|'assistant'|'system';
export interface Message { role: Role; content: string; }

// Sarvam AI API endpoints (based on official documentation)
const SARVAM_BASE_URL = 'https://api.sarvam.ai';
const SARVAM_CHAT_ENDPOINT = `${SARVAM_BASE_URL}/v1/chat/completions`;
const SARVAM_TTS_ENDPOINT = `${SARVAM_BASE_URL}/text-to-speech`;
const SARVAM_STT_ENDPOINT = `${SARVAM_BASE_URL}/speech-to-text`;
const SARVAM_TRANSLATE_ENDPOINT = `${SARVAM_BASE_URL}/translate`;
const SARVAM_LID_ENDPOINT = `${SARVAM_BASE_URL}/language-identification`;

// Get API key from config or environment
const getApiKey = () => {
  const globalWindow = window as unknown as {
    AgentWidgetConfig?: {
      sarvamApiKey?: string;
      apiKey?: string;
    };
  };
  return globalWindow.AgentWidgetConfig?.sarvamApiKey || 
         globalWindow.AgentWidgetConfig?.apiKey ||
         '';
};

// Language mapping for Sarvam API (based on official documentation)
const LANGUAGE_MAP: Record<string, string> = {
  'en': 'en-IN',
  'hi': 'hi-IN',
  'ta': 'ta-IN',
  'te': 'te-IN',
  'bn': 'bn-IN',
  'gu': 'gu-IN',
  'kn': 'kn-IN',
  'ml': 'ml-IN',
  'mr': 'mr-IN',
  'pa': 'pa-IN',
  'or': 'or-IN',
  'as': 'as-IN'
};

export async function sendToLLM(messages: Message[], language = 'en'): Promise<string> {
  const apiKey = getApiKey();
  
  if (!apiKey) {
    throw new Error('Sarvam API key not found. Please configure AgentWidgetConfig.sarvamApiKey');
  }

  // Prepare messages for Sarvam API
  const formattedMessages = messages.map(msg => ({
    role: msg.role,
    content: msg.content
  }));

  const body = {
    model: 'sarvam-m', // Sarvam's supported model as per documentation
    messages: formattedMessages,
    max_tokens: 1000,
    temperature: 0.7,
    stream: false
  };

  try {
    const response = await fetch(SARVAM_CHAT_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-subscription-key': apiKey,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Sarvam API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    // Handle Sarvam API response format
    if (data.choices && data.choices[0]?.message?.content) {
      return data.choices[0].message.content;
    } else if (data.content) {
      return data.content;
    } else {
      throw new Error('Unexpected response format from Sarvam API');
    }
  } catch (error) {
    console.error('Error calling Sarvam API:', error);
    throw error;
  }
}

// Text-to-Speech using Sarvam API
export async function synthesizeSpeech(text: string, language = 'en'): Promise<string> {
  const apiKey = getApiKey();
  
  if (!apiKey) {
    throw new Error('Sarvam API key not found for TTS');
  }

  const body = {
    text: text,
    language_code: LANGUAGE_MAP[language] || language,
    voice: 'default', // Sarvam AI voice options
    speed: 1.0,
    pitch: 1.0,
    volume: 1.0
  };

  try {
    const response = await fetch(SARVAM_TTS_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-subscription-key': apiKey,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`TTS API error: ${response.status}`);
    }

    const data = await response.json();
    return data.audio_url || data.audio; // Return audio URL or base64 data
  } catch (error) {
    console.error('Error with TTS:', error);
    throw error;
  }
}

// Speech-to-Text using Sarvam API
export async function transcribeAudio(audioBlob: Blob, language = 'en'): Promise<string> {
  const apiKey = getApiKey();
  
  if (!apiKey) {
    throw new Error('Sarvam API key not found for STT');
  }

  const formData = new FormData();
  formData.append('file', audioBlob);
  formData.append('language_code', LANGUAGE_MAP[language] || language);

  try {
    const response = await fetch(SARVAM_STT_ENDPOINT, {
      method: 'POST',
      headers: {
        'api-subscription-key': apiKey,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`STT API error: ${response.status}`);
    }

    const data = await response.json();
    return data.transcription || data.text || '';
  } catch (error) {
    console.error('Error with STT:', error);
    throw error;
  }
}

// Fallback function for when Sarvam API is not available
export async function sendToLLMFallback(messages: Message[], language = 'en'): Promise<string> {
  // This is a mock implementation for development/testing
  console.warn('Using fallback LLM - configure Sarvam API key for production');
  
  const lastMessage = messages[messages.length - 1];
  if (!lastMessage || lastMessage.role !== 'user') {
    return 'Hello! How can I help you today?';
  }

  // Simple mock responses based on language
  const responses = {
    en: [
      "I understand you're asking about that. Let me help you with that.",
      "That's an interesting question. Here's what I think...",
      "I'd be happy to assist you with that. Let me provide some guidance.",
      "Great question! Here's my response to help you out."
    ],
    hi: [
      "मैं आपकी बात समझ गया हूं। मैं आपकी मदद कर सकता हूं।",
      "यह एक दिलचस्प सवाल है। मेरा जवाब यह है...",
      "मैं आपकी मदद करने में खुशी होगी।",
      "बहुत अच्छा सवाल! यहां मेरा जवाब है।"
    ],
    es: [
      "Entiendo tu pregunta. Te puedo ayudar con eso.",
      "Esa es una pregunta interesante. Aquí está mi respuesta...",
      "Estaré encantado de ayudarte con eso.",
      "¡Excelente pregunta! Aquí tienes mi respuesta."
    ]
  };

  const langResponses = responses[language as keyof typeof responses] || responses.en;
  const randomResponse = langResponses[Math.floor(Math.random() * langResponses.length)];
  
  return randomResponse;
}

// Translation API using Sarvam AI
export async function translateText(text: string, targetLanguage: string, sourceLanguage = 'auto'): Promise<string> {
  const apiKey = getApiKey();
  
  if (!apiKey) {
    throw new Error('Sarvam API key not found for translation');
  }

  const body = {
    input: text,
    source_language_code: sourceLanguage,
    target_language_code: LANGUAGE_MAP[targetLanguage] || targetLanguage
  };

  try {
    const response = await fetch(SARVAM_TRANSLATE_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-subscription-key': apiKey,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`Translation API error: ${response.status}`);
    }

    const data = await response.json();
    return data.translated_text || data.output || text;
  } catch (error) {
    console.error('Error with translation:', error);
    throw error;
  }
}

// Language Identification API using Sarvam AI
export async function identifyLanguage(text: string): Promise<string> {
  const apiKey = getApiKey();
  
  if (!apiKey) {
    throw new Error('Sarvam API key not found for language identification');
  }

  const body = {
    input: text
  };

  try {
    const response = await fetch(SARVAM_LID_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-subscription-key': apiKey,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`Language ID API error: ${response.status}`);
    }

    const data = await response.json();
    return data.language_code || data.language || 'en';
  } catch (error) {
    console.error('Error with language identification:', error);
    return 'en'; // Default to English on error
  }
}
