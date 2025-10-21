export const LANGUAGE_MAP: Record<string, string> = {
  'en': 'en-IN', 'hi': 'hi-IN', 'ta': 'ta-IN', 'te': 'te-IN', 'bn': 'bn-IN',
  'gu': 'gu-IN', 'kn': 'kn-IN', 'ml': 'ml-IN', 'mr': 'mr-IN', 'pa': 'pa-IN',
  'or': 'od-IN', 'as': 'as-IN', 'brx': 'brx-IN', 'doi': 'doi-IN', 'kok': 'kok-IN',
  'ks': 'ks-IN', 'mai': 'mai-IN', 'mni': 'mni-IN', 'ne': 'ne-IN', 'sa': 'sa-IN',
  'sat': 'sat-IN', 'sd': 'sd-IN', 'ur': 'ur-IN'
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