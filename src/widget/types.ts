// src/widget/types.ts
// Centralized TypeScript type definitions

// Core Message Types
export type Role = 'user' | 'assistant' | 'system';

export interface Message {
  role: Role;
  content: string;
}

// Configuration Types
export interface ThemeConfig {
  primaryColor?: string;
  background?: string;
  text?: string;
  font?: string;
  borderRadius?: string;
  shadow?: string;
}

export interface AgentConfig {
  name?: string;
  avatar?: string;
  greeting?: string;
}

export interface WidgetConfig {
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  theme?: ThemeConfig;
  agent?: AgentConfig;
  enableVoice?: boolean;
  context?: string;
  languages?: string[];
  sarvamApiKey?: string;
  apiKey?: string;
  autoOpen?: boolean;
  showWelcomeMessage?: boolean;
  maxMessages?: number;
  placeholder?: string;
  enableAutoTranslation?: boolean;
  translationMode?: 'formal' | 'modern-colloquial' | 'classic-colloquial' | 'code-mixed';
  enablePreprocessing?: boolean;
}

// Language Types
export interface LanguageInfo {
  name: string;
  flag: string;
  native: string;
}

// API Types
export interface ChatCompletionRequest {
  model: string;
  messages: Message[];
  temperature?: number;
  max_tokens?: number;
}

export interface ChatCompletionResponse {
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
  }>;
}

export interface TTSRequest {
  text: string;
  voice: string;
  language: string;
  speed?: number;
  pitch?: number;
}

export interface TTSResponse {
  audio: string; // base64 encoded audio
}

export interface STTRequest {
  audio: string; // base64 encoded audio
  language: string;
}

export interface STTResponse {
  text: string;
  confidence: number;
}

export interface TranslationRequest {
  text: string;
  source_language_code: string;
  target_language_code: string;
  model?: string;
  mode?: string;
  outputScript?: string;
  numeralsFormat?: string;
  enablePreprocessing?: boolean;
  speakerGender?: string;
}

export interface TranslationResponse {
  translated_text: string;
}

// Component Props Types
export interface ChatPanelProps {
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  currentLanguage: string;
  isVoiceMode: boolean;
  isListening: boolean;
  config: WidgetConfig;
  onStopSpeaking?: () => void;
}

export interface VoiceControlsProps {
  isListening: boolean;
  onVoiceResult: (text: string) => void;
  onSendVoice?: () => void;
  currentLanguage: string;
  config: WidgetConfig;
}

export interface WidgetAppProps {
  config: WidgetConfig;
}

// Speech API Types
export interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

export interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

export interface SpeechRecognitionResult {
  [index: number]: SpeechRecognitionAlternative;
  length: number;
  isFinal: boolean;
}

export interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

export interface SpeechRecognitionResultList {
  [index: number]: SpeechRecognitionResult;
  length: number;
}

export interface SpeechRecognition extends EventTarget {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  maxAlternatives: number;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
}

// Global Window Interface
export interface AgentWidgetWindow extends Window {
  AgentWidgetConfig?: WidgetConfig;
}

// Error Types
export interface APIError {
  error: {
    message: string;
    code: string;
    request_id?: string;
  };
}

export interface ValidationError {
  error: {
    message: string;
    details?: string[];
  };
}

// Utility Types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type OptionalFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
