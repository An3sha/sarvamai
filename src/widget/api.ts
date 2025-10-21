import { LANGUAGE_MAP } from './constants';
import type { Message } from './types';

// Use the original Sarvam API approach that was working
const SARVAM_BASE_URL = 'https://api.sarvam.ai';

// Get API key from window config or environment
const getApiKey = (): string => {
  const config = (window as any).AgentWidgetConfig;
  return config?.sarvamApiKey || config?.apiKey || '';
};

// Check if we have a valid API key
const hasValidApiKey = (): boolean => {
  const apiKey = getApiKey();
  return !!apiKey && apiKey !== 'test-key' && apiKey !== 'debug-key';
};

export async function sendToLLM(messages: Message[]): Promise<string> {
  const apiKey = getApiKey();
  
  if (hasValidApiKey()) {
    try {
      const response = await fetch(`${SARVAM_BASE_URL}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-subscription-key': apiKey
        },
        body: JSON.stringify({
          model: 'sarvam-m',
          messages: messages.map(msg => ({ role: msg.role, content: msg.content })),
          max_tokens: 1000,
          temperature: 0.7,
          stream: false
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Sarvam API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      
      if (data.choices && data.choices[0]?.message?.content) {
        return data.choices[0].message.content;
      }
      
      if (data.content) {
        return data.content;
      }
      
      throw new Error('Unexpected response format from Sarvam API');
    } catch (error) {
      console.error('Sarvam API call failed, falling back to mock response:', error);
      return await sendToLLMFallback(messages);
    }
  } else {
    console.warn('No valid API key found, using fallback responses');
    return await sendToLLMFallback(messages);
  }
}

export async function synthesizeSpeech(text: string, language = 'en'): Promise<string> {
  const apiKey = getApiKey();
  
  if (hasValidApiKey()) {
    try {
      const truncatedText = text.length > 2500 ? text.substring(0, 2500) + '...' : text;
      
      const body = {
        text: truncatedText,
        language_code: LANGUAGE_MAP[language] || language,
        voice: 'default',
        speed: 1.0,
        pitch: 1.0,
        volume: 1.0
      };

      const response = await fetch(`${SARVAM_BASE_URL}/text-to-speech`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-subscription-key': apiKey
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error(`TTS API error: ${response.status}`);
      }

      const data = await response.json();
      return data.audio_url || data.audio;
    } catch (error) {
      console.error('Sarvam TTS API call failed:', error);
      throw error;
    }
  } else {
    throw new Error('No valid API key for TTS');
  }
}

export async function transcribeAudio(audioBlob: Blob, language = 'en'): Promise<string> {
  const apiKey = getApiKey();
  
  if (hasValidApiKey()) {
    try {
      const formData = new FormData();
      formData.append('file', audioBlob);
      formData.append('language_code', LANGUAGE_MAP[language] || language);

      const response = await fetch(`${SARVAM_BASE_URL}/speech-to-text`, {
        method: 'POST',
        headers: {
          'api-subscription-key': apiKey
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`STT API error: ${response.status}`);
      }

      const data = await response.json();
      return data.transcription || data.text || '';
    } catch (error) {
      console.error('Sarvam STT API call failed:', error);
      throw error;
    }
  } else {
    throw new Error('No valid API key for STT');
  }
}

export async function sendToLLMFallback(messages: Message[], language = 'en'): Promise<string> {
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
  
  if (hasValidApiKey()) {
    try {
      const mappedSourceLanguage = sourceLanguage === 'auto' ? 'auto' : (LANGUAGE_MAP[sourceLanguage] || sourceLanguage);
      const mappedTargetLanguage = LANGUAGE_MAP[targetLanguage] || targetLanguage;

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

      const response = await fetch(`${SARVAM_BASE_URL}/translate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-subscription-key': apiKey
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Translation API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      return data.translated_text || data.output || text;
    } catch (error) {
      console.error('Sarvam translation API call failed:', error);
      throw error;
    }
  } else {
    console.warn('No valid API key for translation, returning original text');
    return text;
  }
}

export async function translateMessages(
  messages: Message[], 
  targetLanguage: string, 
  sourceLanguage = 'auto'
): Promise<Message[]> {
  try {
    return await Promise.all(
      messages.map(async (message) => {
        if (message.role === 'system' || sourceLanguage === targetLanguage) {
          return message;
        }
        
        try {
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
          
          return { ...message, content: translatedContent };
        } catch (error) {
          console.warn(`Failed to translate message: ${error}`);
          return message;
        }
      })
    );
  } catch (error) {
    console.error('Error translating messages:', error);
    return messages;
  }
}

export async function identifyLanguage(text: string): Promise<string> {
  const apiKey = getApiKey();
  
  if (hasValidApiKey()) {
    try {
      const body = { input: text };

      const response = await fetch(`${SARVAM_BASE_URL}/language-identification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-subscription-key': apiKey
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error(`Language ID API error: ${response.status}`);
      }

      const data = await response.json();
      return data.language_code || data.language || 'en';
    } catch (error) {
      console.error('Sarvam language ID API call failed:', error);
      return 'en';
    }
  } else {
    return 'en';
  }
}
