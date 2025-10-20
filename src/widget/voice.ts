// src/widget/voice.ts
import { synthesizeSpeech } from './api';

// Type declarations for Web Speech API
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognitionResult {
  [index: number]: SpeechRecognitionAlternative;
  length: number;
  isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionResultList {
  [index: number]: SpeechRecognitionResult;
  length: number;
}

interface SpeechRecognition extends EventTarget {
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

declare const SpeechRecognition: {
  prototype: SpeechRecognition;
  new(): SpeechRecognition;
} | undefined;

// declare const webkitSpeechRecognition: {
//   prototype: SpeechRecognition;
//   new(): SpeechRecognition;
// } | undefined;

export function startRecognition(lang: string, onResult: (text: string)=>void) {
    const globalWindow = window as unknown as {
      SpeechRecognition?: typeof SpeechRecognition;
      webkitSpeechRecognition?: typeof SpeechRecognition;
    };
    const SpeechRecognitionClass = globalWindow.SpeechRecognition;
    if (!SpeechRecognitionClass) return { error: 'not-supported' };
    const r = new SpeechRecognitionClass();
    r.lang = lang;
    r.interimResults = false;
    r.continuous = false;
    r.maxAlternatives = 1;
    
    r.onresult = (e: SpeechRecognitionEvent) => {
      const text = Array.from(e.results).map((r: SpeechRecognitionResult)=>r[0].transcript).join('');
      onResult(text);
    };
    
    r.onerror = (e: SpeechRecognitionErrorEvent) => { 
      console.error('Speech recognition error:', e);
      onResult(''); // Return empty string on error
    };
    
    r.onend = () => {
      // Recognition ended
    };
    
    r.start();
    return { stop: ()=>r.stop() };
  }
  
// Global speech control variables
let currentAudio: HTMLAudioElement | null = null;
let currentUtterance: SpeechSynthesisUtterance | null = null;
let onSpeechEndCallback: (() => void) | null = null;

export function setSpeechEndCallback(callback: (() => void) | null) {
  onSpeechEndCallback = callback;
}

export function stopSpeaking() {
  console.log('🔇 Stopping speech...');
  
  // Stop Sarvam TTS audio
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }
  
  // Stop browser TTS
  if (currentUtterance) {
    speechSynthesis.cancel();
    currentUtterance = null;
  }
}

export function pauseSpeaking() {
  console.log('⏸️ Pausing speech...');
  
  // Pause Sarvam TTS audio
  if (currentAudio && !currentAudio.paused) {
    currentAudio.pause();
  }
  
  // Pause browser TTS
  if (currentUtterance) {
    speechSynthesis.pause();
  }
}

export function resumeSpeaking() {
  console.log('▶️ Resuming speech...');
  
  // Resume Sarvam TTS audio
  if (currentAudio && currentAudio.paused) {
    currentAudio.play();
  }
  
  // Resume browser TTS
  if (currentUtterance) {
    speechSynthesis.resume();
  }
}

export async function speak(text: string, lang: string) {
  console.log('🎤 Speaking:', text, 'in language:', lang);
  console.log('🎤 Voice function called with:', { text: text.substring(0, 50) + '...', lang });
    
    // Try Sarvam TTS first if API key is available
    const globalWindow = window as unknown as {
      AgentWidgetConfig?: {
        sarvamApiKey?: string;
        apiKey?: string;
      };
    };
    const apiKey = globalWindow.AgentWidgetConfig?.sarvamApiKey || 
                     globalWindow.AgentWidgetConfig?.apiKey;
      
      if (apiKey) {
        try {
          console.log('🎵 Trying Sarvam TTS...');
          const audioUrl = await synthesizeSpeech(text, lang);
          if (audioUrl) {
            console.log('🎵 Playing Sarvam TTS audio...');
            currentAudio = new Audio(audioUrl);
            currentAudio.onended = () => {
              console.log('🎵 Sarvam TTS audio ended');
              currentAudio = null;
              onSpeechEndCallback?.();
            };
            currentAudio.onerror = (e) => {
              console.error('🎵 Sarvam TTS audio error:', e);
              currentAudio = null;
            };
            currentAudio.play();
            return;
          }
        } catch (error) {
          console.warn('Sarvam TTS failed, falling back to browser TTS:', error);
        }
      }
    
    // Fallback to browser speech synthesis
    if (!('speechSynthesis' in window)) {
      console.warn('❌ Speech synthesis not supported');
      return;
    }
    
    console.log('🎵 Using browser TTS...');
    currentUtterance = new SpeechSynthesisUtterance(text);
    currentUtterance.lang = lang;
    currentUtterance.rate = 1;
    currentUtterance.pitch = 1;
    currentUtterance.volume = 1;
    
    console.log('🎵 Browser TTS utterance created:', {
      text: text.substring(0, 50) + '...',
      lang: currentUtterance.lang,
      rate: currentUtterance.rate,
      pitch: currentUtterance.pitch,
      volume: currentUtterance.volume
    });
    
    // Pick a voice matching the language
    const voices = speechSynthesis.getVoices();
    const voice = voices.find(v => v.lang.startsWith(lang)) || 
                  voices.find(v => v.lang.startsWith('en')) || 
                  voices[0];
    
    if (voice) {
      currentUtterance.voice = voice;
      console.log('🎵 Using voice:', voice.name, 'for language:', voice.lang);
    }
    
    // Handle speech synthesis events
    currentUtterance.onstart = () => console.log('🎵 Speech started');
    currentUtterance.onend = () => {
      console.log('🎵 Speech ended');
      currentUtterance = null;
      onSpeechEndCallback?.();
    };
    currentUtterance.onerror = (e) => {
      console.error('🎵 Speech error:', e);
      currentUtterance = null;
    };
    
    speechSynthesis.speak(currentUtterance);
  }

  // Enhanced voice recognition with better error handling
  export function startRecognitionEnhanced(lang: string, onResult: (text: string)=>void, onError?: (error: string)=>void) {
    const globalWindow = window as unknown as {
      SpeechRecognition?: typeof SpeechRecognition;
      webkitSpeechRecognition?: typeof SpeechRecognition;
    };
    const SpeechRecognitionClass = globalWindow.SpeechRecognition;
    if (!SpeechRecognitionClass) {
      onError?.('Speech recognition not supported in this browser');
      return { error: 'not-supported' };
    }
    
    const r = new SpeechRecognitionClass();
    r.lang = lang;
    r.interimResults = true;
    r.continuous = false;
    r.maxAlternatives = 1;
    
    let finalTranscript = '';
    
    r.onresult = (e: SpeechRecognitionEvent) => {
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const transcript = e.results[i][0].transcript;
        if (e.results[i].isFinal) {
          finalTranscript += transcript;
        }
      }
      
      // Only call onResult with final transcript
      if (finalTranscript) {
        onResult(finalTranscript);
        finalTranscript = '';
      }
    };
    
    r.onerror = (e: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', e);
      let errorMessage = 'Speech recognition error';
      
      switch (e.error) {
        case 'no-speech':
          errorMessage = 'No speech detected';
          break;
        case 'audio-capture':
          errorMessage = 'No microphone found';
          break;
        case 'not-allowed':
          errorMessage = 'Microphone permission denied';
          break;
        case 'network':
          errorMessage = 'Network error';
          break;
        default:
          errorMessage = `Speech recognition error: ${e.error}`;
      }
      
      onError?.(errorMessage);
    };
    
    r.onstart = () => {
      console.log('Speech recognition started');
    };
    
    r.onend = () => {
      console.log('Speech recognition ended');
    };
    
    r.start();
    return { stop: ()=>r.stop() };
  }
  