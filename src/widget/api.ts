// src/widget/api.ts
import { API_CONFIG, LANGUAGE_MAP } from './constants';
import type { 
  Message, 
  AgentWidgetWindow
} from './types';

// Get API key from config or environment
const getApiKey = (): string => {
  const globalWindow = window as AgentWidgetWindow;
  return globalWindow.AgentWidgetConfig?.sarvamApiKey || 
         globalWindow.AgentWidgetConfig?.apiKey ||
         '';
};

// Language mapping is now imported from constants.ts

// Language names are now imported from constants.ts

export async function sendToLLM(messages: Message[]): Promise<string> {
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
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CHAT}`, {
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
  console.log('🎵 synthesizeSpeech called:', { text: text.substring(0, 50) + '...', language });
  
  const apiKey = getApiKey();
  
  if (!apiKey) {
    console.error('❌ No API key for TTS');
    throw new Error('Sarvam API key not found for TTS');
  }

  // Truncate text to 2500 characters as per Sarvam API limit
  const truncatedText = text.length > 2500 ? text.substring(0, 2500) + '...' : text;
  
  const body = {
    text: truncatedText,
    language_code: LANGUAGE_MAP[language] || language,
    voice: 'default', // Sarvam AI voice options
    speed: 1.0,
    pitch: 1.0,
    volume: 1.0
  };
  
  console.log('🎵 TTS request body:', body);

  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.TTS}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-subscription-key': apiKey,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      console.error('❌ TTS API error:', response.status);
      throw new Error(`TTS API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ TTS API success:', { audioUrl: data.audio_url || data.audio });
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
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.STT}`, {
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

// Enhanced Translation API using Sarvam AI with advanced features
export async function translateText(
  text: string, 
  targetLanguage: string, 
  sourceLanguage = 'auto',
  options: {
    model?: 'mayura:v1' | 'sarvam-translate:v1';
    mode?: 'formal' | 'modern-colloquial' | 'classic-colloquial' | 'code-mixed';
    outputScript?: 'roman' | 'fully-native' | 'spoken-form-in-native' | null;
    numeralsFormat?: 'international' | 'native';
    enablePreprocessing?: boolean;
    speakerGender?: 'Male' | 'Female';
  } = {}
): Promise<string> {
  const apiKey = getApiKey();
  
  if (!apiKey) {
    throw new Error('Sarvam API key not found for translation');
  }

  // Use sarvam-translate:v1 for better language support (22 languages)
  // Map source language to proper format
  const mappedSourceLanguage = sourceLanguage === 'auto' ? 'auto' : (LANGUAGE_MAP[sourceLanguage] || sourceLanguage);
  const mappedTargetLanguage = LANGUAGE_MAP[targetLanguage] || targetLanguage;
  
  console.log('🌐 Translation language mapping:', {
    originalSource: sourceLanguage,
    mappedSource: mappedSourceLanguage,
    originalTarget: targetLanguage,
    mappedTarget: mappedTargetLanguage
  });

  const body = {
    input: text,
    source_language_code: mappedSourceLanguage,
    target_language_code: mappedTargetLanguage,
    model: options.model || 'sarvam-translate:v1',
    mode: options.mode || 'formal',
    output_script: options.outputScript || null,
    numerals_format: options.numeralsFormat || 'international',
    enable_preprocessing: options.enablePreprocessing || false,
    ...(options.speakerGender && { speaker_gender: options.speakerGender })
  };

  try {
    console.log('🌐 Making translation API call:', {
      endpoint: `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.TRANSLATE}`,
      body: body,
      hasApiKey: !!apiKey
    });
    
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.TRANSLATE}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-subscription-key': apiKey,
      },
      body: JSON.stringify(body),
    });

    console.log('📡 Translation API response:', {
      status: response.status,
      ok: response.ok
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ Translation API error:', errorData);
      throw new Error(`Translation API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    console.log('✅ Translation API success:', data);
    return data.translated_text || data.output || text;
  } catch (error) {
    console.error('❌ Error with translation:', error);
    throw error;
  }
}

// Translate multiple messages at once
export async function translateMessages(
  messages: Message[], 
  targetLanguage: string, 
  sourceLanguage = 'auto'
): Promise<Message[]> {
  console.log('🔄 translateMessages called:', {
    messageCount: messages.length,
    targetLanguage,
    sourceLanguage,
    messages: messages.map(m => ({ role: m.role, content: m.content.substring(0, 50) + '...' }))
  });
  
  try {
    const translatedMessages = await Promise.all(
      messages.map(async (message, index) => {
        console.log(`🔄 Translating message ${index + 1}/${messages.length}:`, {
          role: message.role,
          content: message.content.substring(0, 50) + '...'
        });
        
        // Don't translate system messages
        if (message.role === 'system') {
          console.log('⏭️ Skipping system message');
          return message;
        }
        
        // Skip if already in target language
        if (sourceLanguage === targetLanguage) {
          console.log('⏭️ Skipping - same language');
          return message;
        }
        
        try {
          console.log('🌐 Calling translateText API...');
          const translatedContent = await translateText(
            message.content, 
            targetLanguage, 
            sourceLanguage,
            {
              model: 'sarvam-translate:v1',
              mode: 'formal',
              enablePreprocessing: true
            }
          );
          
          console.log('✅ Translation successful:', {
            original: message.content.substring(0, 30) + '...',
            translated: translatedContent.substring(0, 30) + '...'
          });
          
          return {
            ...message,
            content: translatedContent
          };
        } catch (error) {
          console.warn(`❌ Failed to translate message: ${error}`);
          return message; // Return original message if translation fails
        }
      })
    );
    
    console.log('✅ All messages translated successfully');
    return translatedMessages;
  } catch (error) {
    console.error('❌ Error translating messages:', error);
    return messages; // Return original messages if translation fails
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
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.LANGUAGE_ID}`, {
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
