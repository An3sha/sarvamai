
export type Role = 'user'|'assistant'|'system';
export interface Message { role: Role; content: string; }


const SARVAM_BASE_URL = 'https://api.sarvam.ai';
const SARVAM_CHAT_ENDPOINT = `${SARVAM_BASE_URL}/v1/chat/completions`;
const SARVAM_TTS_ENDPOINT = `${SARVAM_BASE_URL}/text-to-speech`;
const SARVAM_STT_ENDPOINT = `${SARVAM_BASE_URL}/speech-to-text`;
const SARVAM_TRANSLATE_ENDPOINT = `${SARVAM_BASE_URL}/translate`;
const SARVAM_LID_ENDPOINT = `${SARVAM_BASE_URL}/language-identification`;


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


const LANGUAGE_MAP: Record<string, string> = {

  'en': 'en-IN',    // English
  'hi': 'hi-IN',    // Hindi
  'ta': 'ta-IN',    // Tamil
  'te': 'te-IN',    // Telugu
  'bn': 'bn-IN',    // Bengali
  'gu': 'gu-IN',    // Gujarati
  'kn': 'kn-IN',    // Kannada
  'ml': 'ml-IN',    // Malayalam
  'mr': 'mr-IN',    // Marathi
  'pa': 'pa-IN',    // Punjabi
  'or': 'od-IN',    // Odia
  'as': 'as-IN',    // Assamese
  
  // Newly added languages (sarvam-translate:v1)
  'brx': 'brx-IN',  // Bodo
  'doi': 'doi-IN',  // Dogri
  'kok': 'kok-IN',  // Konkani
  'ks': 'ks-IN',    // Kashmiri
  'mai': 'mai-IN',  // Maithili
  'mni': 'mni-IN',  // Manipuri (Meiteilon)
  'ne': 'ne-IN',    // Nepali
  'sa': 'sa-IN',    // Sanskrit
  'sat': 'sat-IN',  // Santali
  'sd': 'sd-IN',    // Sindhi
  'ur': 'ur-IN'     // Urdu
};

export const LANGUAGE_NAMES: Record<string, { native: string; english: string; flag: string }> = {
  'en': { native: 'English', english: 'English', flag: '🇺🇸' },
  'hi': { native: 'हिन्दी', english: 'Hindi', flag: '🇮🇳' },
  'ta': { native: 'தமிழ்', english: 'Tamil', flag: '🇮🇳' },
  'te': { native: 'తెలుగు', english: 'Telugu', flag: '🇮🇳' },
  'bn': { native: 'বাংলা', english: 'Bengali', flag: '🇮🇳' },
  'gu': { native: 'ગુજરાતી', english: 'Gujarati', flag: '🇮🇳' },
  'kn': { native: 'ಕನ್ನಡ', english: 'Kannada', flag: '🇮🇳' },
  'ml': { native: 'മലയാളം', english: 'Malayalam', flag: '🇮🇳' },
  'mr': { native: 'मराठी', english: 'Marathi', flag: '🇮🇳' },
  'pa': { native: 'ਪੰਜਾਬੀ', english: 'Punjabi', flag: '🇮🇳' },
  'or': { native: 'ଓଡ଼ିଆ', english: 'Odia', flag: '🇮🇳' },
  'as': { native: 'অসমীয়া', english: 'Assamese', flag: '🇮🇳' },
  'brx': { native: 'बड़ो', english: 'Bodo', flag: '🇮🇳' },
  'doi': { native: 'डोगरी', english: 'Dogri', flag: '🇮🇳' },
  'kok': { native: 'कोंकणी', english: 'Konkani', flag: '🇮🇳' },
  'ks': { native: 'کٲشُر', english: 'Kashmiri', flag: '🇮🇳' },
  'mai': { native: 'मैथिली', english: 'Maithili', flag: '🇮🇳' },
  'mni': { native: 'ꯃꯤꯇꯩꯂꯣꯟ', english: 'Manipuri', flag: '🇮🇳' },
  'ne': { native: 'नेपाली', english: 'Nepali', flag: '🇮🇳' },
  'sa': { native: 'संस्कृतम्', english: 'Sanskrit', flag: '🇮🇳' },
  'sat': { native: 'ᱥᱟᱱᱛᱟᱲᱤ', english: 'Santali', flag: '🇮🇳' },
  'sd': { native: 'سنڌي', english: 'Sindhi', flag: '🇮🇳' },
  'ur': { native: 'اردو', english: 'Urdu', flag: '🇮🇳' }
};

export async function sendToLLM(messages: Message[]): Promise<string> {
  const apiKey = getApiKey();
  
  if (!apiKey) {
    throw new Error('Sarvam API key not found. Please configure AgentWidgetConfig.sarvamApiKey');
  }


  const formattedMessages = messages.map(msg => ({
    role: msg.role,
    content: msg.content
  }));

  const body = {
    model: 'sarvam-m', 
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
    voice: 'default',
    speed: 1.0,
    pitch: 1.0,
    volume: 1.0
  };
  
  console.log('🎵 TTS request body:', body);

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
      console.error('❌ TTS API error:', response.status);
      throw new Error(`TTS API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ TTS API success:', { audioUrl: data.audio_url || data.audio });
    return data.audio_url || data.audio; 
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
  
  if (!apiKey) {
    throw new Error('Sarvam API key not found for translation');
  }

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
      endpoint: SARVAM_TRANSLATE_ENDPOINT,
      body: body,
      hasApiKey: !!apiKey
    });
    
    const response = await fetch(SARVAM_TRANSLATE_ENDPOINT, {
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
        

        if (message.role === 'system') {
          console.log('⏭️ Skipping system message');
          return message;
        }
        

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
          return message; 
        }
      })
    );
    
    console.log('✅ All messages translated successfully');
    return translatedMessages;
  } catch (error) {
    console.error('❌ Error translating messages:', error);
    return messages; 
  }
}

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
