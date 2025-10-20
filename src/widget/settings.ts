// src/widget/settings.ts

export interface AgentConfig {
    position?: 'bottom-right'|'bottom-left'|'top-right'|'top-left';
    theme?: { 
      primaryColor?: string; 
      background?: string; 
      text?: string; 
      font?: string;
      borderRadius?: string;
      shadow?: string;
    };
    agent?: { 
      name?: string; 
      avatar?: string;
      greeting?: string;
    };
    enableVoice?: boolean;
    context?: string;
    languages?: string[]; // e.g. ['en','hi','ta'] - now supports all 22 Indian languages
    sarvamApiKey?: string;
    apiKey?: string; // Alternative key name
    autoOpen?: boolean;
    showWelcomeMessage?: boolean;
    maxMessages?: number;
    placeholder?: string;
    // New translation features
    enableAutoTranslation?: boolean; // Auto-translate when switching languages
    translationMode?: 'formal' | 'modern-colloquial' | 'classic-colloquial' | 'code-mixed';
    enablePreprocessing?: boolean; // Enable preprocessing for better translations
  }

  // Enhanced language configurations using Sarvam's supported languages
  export const LANGUAGE_CONFIG = {
    // Core Indian languages (most popular)
    'en': { name: 'English', flag: '🇺🇸', native: 'English' },
    'hi': { name: 'Hindi', flag: '🇮🇳', native: 'हिन्दी' },
    'ta': { name: 'Tamil', flag: '🇮🇳', native: 'தமிழ்' },
    'te': { name: 'Telugu', flag: '🇮🇳', native: 'తెలుగు' },
    'bn': { name: 'Bengali', flag: '🇮🇳', native: 'বাংলা' },
    'gu': { name: 'Gujarati', flag: '🇮🇳', native: 'ગુજરાતી' },
    'kn': { name: 'Kannada', flag: '🇮🇳', native: 'ಕನ್ನಡ' },
    'ml': { name: 'Malayalam', flag: '🇮🇳', native: 'മലയാളം' },
    'mr': { name: 'Marathi', flag: '🇮🇳', native: 'मराठी' },
    'pa': { name: 'Punjabi', flag: '🇮🇳', native: 'ਪੰਜਾਬੀ' },
    'or': { name: 'Odia', flag: '🇮🇳', native: 'ଓଡ଼ିଆ' },
    'as': { name: 'Assamese', flag: '🇮🇳', native: 'অসমীয়া' },
    
    // Additional Indian languages
    'brx': { name: 'Bodo', flag: '🇮🇳', native: 'बड़ो' },
    'doi': { name: 'Dogri', flag: '🇮🇳', native: 'डोगरी' },
    'kok': { name: 'Konkani', flag: '🇮🇳', native: 'कोंकणी' },
    'ks': { name: 'Kashmiri', flag: '🇮🇳', native: 'کٲشُر' },
    'mai': { name: 'Maithili', flag: '🇮🇳', native: 'मैथिली' },
    'mni': { name: 'Manipuri', flag: '🇮🇳', native: 'ꯃꯤꯇꯩꯂꯣꯟ' },
    'ne': { name: 'Nepali', flag: '🇮🇳', native: 'नेपाली' },
    'sa': { name: 'Sanskrit', flag: '🇮🇳', native: 'संस्कृतम्' },
    'sat': { name: 'Santali', flag: '🇮🇳', native: 'ᱥᱟᱱᱛᱟᱲᱤ' },
    'sd': { name: 'Sindhi', flag: '🇮🇳', native: 'سنڌي' },
    'ur': { name: 'Urdu', flag: '🇮🇳', native: 'اردو' }
  };
  
  export const defaultConfig: AgentConfig = {
    position: 'bottom-right',
    theme: { 
      primaryColor: '#4F46E5', 
      background: '#ffffff', 
      text: '#111827', 
      font: 'Inter, system-ui, sans-serif',
      borderRadius: '16px',
      shadow: '0 8px 32px rgba(0, 0, 0, 0.12)'
    },
    agent: { 
      name: 'HelperBot', 
      avatar: '',
      greeting: 'Hello! How can I help you today?'
    },
    enableVoice: true,
    context: 'You are a helpful AI assistant. Please provide clear, accurate, and helpful responses to user questions.',
    languages: ['en', 'hi', 'ta', 'te', 'bn'], // Popular Indian languages
    autoOpen: false,
    showWelcomeMessage: true,
    maxMessages: 50,
    placeholder: 'Type your message...',
    // New translation features
    enableAutoTranslation: true, // Auto-translate when switching languages
    translationMode: 'formal', // Use formal translation mode
    enablePreprocessing: true // Enable preprocessing for better translations
  };
  
  export function loadConfig(): AgentConfig {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cfg = (window as any).AgentWidgetConfig ?? {};
    const mergedConfig = { ...defaultConfig, ...cfg };
    
    // Deep merge theme and agent objects
    if (cfg.theme) {
      mergedConfig.theme = { ...defaultConfig.theme, ...cfg.theme };
    }
    if (cfg.agent) {
      mergedConfig.agent = { ...defaultConfig.agent, ...cfg.agent };
    }
    
    return mergedConfig;
  }

  // Validate configuration
  export function validateConfig(config: AgentConfig): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Validate position
    const validPositions = ['bottom-right', 'bottom-left', 'top-right', 'top-left'];
    if (config.position && !validPositions.includes(config.position)) {
      errors.push(`Invalid position: ${config.position}. Must be one of: ${validPositions.join(', ')}`);
    }
    
    // Validate theme colors (basic hex color validation)
    if (config.theme?.primaryColor && !/^#[0-9A-F]{6}$/i.test(config.theme.primaryColor)) {
      errors.push('Invalid primaryColor: must be a valid hex color (e.g., #4F46E5)');
    }
    
    if (config.theme?.background && !/^#[0-9A-F]{6}$/i.test(config.theme.background)) {
      errors.push('Invalid background: must be a valid hex color (e.g., #ffffff)');
    }
    
    if (config.theme?.text && !/^#[0-9A-F]{6}$/i.test(config.theme.text)) {
      errors.push('Invalid text: must be a valid hex color (e.g., #111827)');
    }
    
    // Validate languages
    if (config.languages) {
      const validLanguages = Object.keys(LANGUAGE_CONFIG);
      const invalidLanguages = config.languages.filter(lang => !validLanguages.includes(lang));
      if (invalidLanguages.length > 0) {
        errors.push(`Invalid languages: ${invalidLanguages.join(', ')}. Supported: ${validLanguages.join(', ')}`);
      }
    }
    
    // Validate maxMessages
    if (config.maxMessages && (config.maxMessages < 1 || config.maxMessages > 1000)) {
      errors.push('maxMessages must be between 1 and 1000');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  // Get language display info
  export function getLanguageInfo(languageCode: string) {
    return LANGUAGE_CONFIG[languageCode as keyof typeof LANGUAGE_CONFIG] || {
      name: languageCode,
      flag: '🌐',
      native: languageCode
    };
  }
  