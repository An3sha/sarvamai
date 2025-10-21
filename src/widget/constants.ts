// src/widget/constants.ts
// Centralized constants and configuration

// API Configuration
export const API_CONFIG = {
  BASE_URL: 'https://api.sarvam.ai',
  ENDPOINTS: {
    CHAT: '/v1/chat/completions',
    TTS: '/text-to-speech',
    STT: '/speech-to-text',
    TRANSLATE: '/translate',
    LANGUAGE_ID: '/language-identification'
  },
  HEADERS: {
    'Content-Type': 'application/json',
    'api-subscription-key': '' // Will be set dynamically
  }
} as const;

// Language Configuration
export const LANGUAGE_MAP: Record<string, string> = {
  // Core languages
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
  
  // Extended languages
  'brx': 'brx-IN',  // Bodo
  'doi': 'doi-IN',  // Dogri
  'kok': 'kok-IN',  // Konkani
  'ks': 'ks-IN',    // Kashmiri
  'mai': 'mai-IN',  // Maithili
  'mni': 'mni-IN',  // Manipuri
  'ne': 'ne-IN',    // Nepali
  'sa': 'sa-IN',    // Sanskrit
  'sat': 'sat-IN',  // Santali
  'sd': 'sd-IN',    // Sindhi
  'ur': 'ur-IN'     // Urdu
} as const;

export const LANGUAGE_NAMES: Record<string, { name: string; flag: string; native: string }> = {
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
} as const;

// UI Constants
export const UI_CONFIG = {
  ANIMATION_DURATION: 200,
  DEBOUNCE_DELAY: 300,
  SPEECH_SYNC_INTERVAL: 500,
  MAX_TTS_LENGTH: 2500,
  DEFAULT_POSITION: 'bottom-right' as const,
  DEFAULT_THEME: {
    primaryColor: '#4F46E5',
    backgroundColor: '#ffffff',
    textColor: '#1f2937'
  }
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  API_UNAVAILABLE: 'API service is currently unavailable. Please try again later.',
  VOICE_NOT_SUPPORTED: 'Voice features are not supported in this browser.',
  TRANSLATION_FAILED: 'Translation failed. Please try again.',
  SPEECH_ERROR: 'Speech synthesis failed. Please try again.',
  NETWORK_ERROR: 'Network error. Please check your connection.'
} as const;

// Default Configuration
export const DEFAULT_CONFIG = {
  position: 'bottom-right' as const,
  theme: {
    primaryColor: '#4F46E5',
    background: '#ffffff',
    text: '#1f2937',
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
  languages: ['en', 'hi', 'ta', 'te', 'bn'] as string[],
  autoOpen: false,
  showWelcomeMessage: true,
  maxMessages: 50,
  placeholder: 'Type your message...',
  enableAutoTranslation: true,
  translationMode: 'formal' as const,
  enablePreprocessing: true
} as const;
