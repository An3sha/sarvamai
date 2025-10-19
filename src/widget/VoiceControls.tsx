import React, { useEffect } from 'react';
import { startRecognition } from './voice';

// Type declarations for Web Speech API
interface SpeechRecognition extends EventTarget {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  maxAlternatives: number;
  onresult: ((event: Event) => void) | null;
  onerror: ((event: Event) => void) | null;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
}

declare const SpeechRecognition: {
  prototype: SpeechRecognition;
  new(): SpeechRecognition;
} | undefined;

declare const webkitSpeechRecognition: {
  prototype: SpeechRecognition;
  new(): SpeechRecognition;
} | undefined;

interface VoiceControlsProps {
  isListening: boolean;
  setIsListening: React.Dispatch<React.SetStateAction<boolean>>;
  currentLanguage: string;
  onVoiceResult: (text: string) => void;
  recognitionRef: React.MutableRefObject<{ stop: () => void } | null>;
}

export default function VoiceControls({
  isListening,
  setIsListening,
  currentLanguage,
  onVoiceResult,
  recognitionRef
}: VoiceControlsProps) {
  const [isSupported, setIsSupported] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  useEffect(() => {
    // Check if speech recognition is supported
    const globalWindow = window as unknown as {
      SpeechRecognition?: typeof SpeechRecognition;
      webkitSpeechRecognition?: typeof SpeechRecognition;
    };
    const SpeechRecognitionClass = globalWindow.SpeechRecognition || globalWindow.webkitSpeechRecognition;
    if (!SpeechRecognitionClass) {
      setIsSupported(false);
    }
  }, []);

  const startListening = () => {
    if (!isSupported) return;

    setError(null);
    const result = startRecognition(currentLanguage, (text) => {
      onVoiceResult(text);
      setIsListening(false);
    });

    if (result.error) {
      setError('Speech recognition not supported');
      return;
    }

    recognitionRef.current = result as { stop: () => void } | null;
    setIsListening(true);

    // Auto-stop after 10 seconds
    setTimeout(() => {
      if (isListening) {
        stopListening();
      }
    }, 10000);
  };

  const stopListening = () => {
    if (recognitionRef.current?.stop) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  if (!isSupported) {
    return (
      <div className="voice-controls">
        <div className="voice-error">
          <p>🎤 Voice input is not supported in this browser</p>
          <p>Please use Chrome, Safari, or Edge for voice features</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        .voice-controls {
          padding: 16px;
          border-top: 1px solid #e5e7eb;
          background: var(--background-color);
        }
        
        .voice-button {
          width: 100%;
          padding: 16px;
          border: 2px solid var(--primary-color);
          border-radius: 12px;
          background: ${isListening ? 'var(--primary-color)' : 'transparent'};
          color: ${isListening ? 'white' : 'var(--primary-color)'};
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          position: relative;
          overflow: hidden;
        }
        
        .voice-button:hover {
          background: var(--primary-color);
          color: white;
          transform: translateY(-1px);
        }
        
        .voice-button:active {
          transform: translateY(0);
        }
        
        .voice-icon {
          font-size: 20px;
          transition: transform 0.3s ease;
        }
        
        .voice-button.listening .voice-icon {
          animation: pulse 1.5s infinite;
        }
        
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
        
        .voice-status {
          text-align: center;
          margin-top: 8px;
          font-size: 12px;
          color: #6b7280;
        }
        
        .voice-error {
          text-align: center;
          padding: 16px;
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 8px;
          color: #dc2626;
        }
        
        .voice-error p {
          margin: 4px 0;
          font-size: 14px;
        }
        
        .listening-indicator {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%);
          animation: shimmer 2s infinite;
        }
        
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        .voice-instructions {
          margin-top: 12px;
          padding: 12px;
          background: #f8f9fa;
          border-radius: 8px;
          font-size: 13px;
          color: #6b7280;
          text-align: center;
        }
        
        .voice-instructions p {
          margin: 4px 0;
        }
      `}</style>
      
      <div className="voice-controls">
        {error ? (
          <div className="voice-error">
            <p>❌ {error}</p>
          </div>
        ) : (
          <>
            <button
              className={`voice-button ${isListening ? 'listening' : ''}`}
              onClick={toggleListening}
            >
              {isListening && <div className="listening-indicator"></div>}
              <span className="voice-icon">
                {isListening ? '🔴' : '🎤'}
              </span>
              {isListening ? 'Listening...' : 'Tap to speak'}
            </button>
            
            <div className="voice-status">
              {isListening ? (
                <p>Speak now... (auto-stops in 10s)</p>
              ) : (
                <p>Click the microphone to start voice input</p>
              )}
            </div>
            
            <div className="voice-instructions">
              <p><strong>💡 Tips:</strong></p>
              <p>• Speak clearly and at normal pace</p>
              <p>• The system will auto-stop after 10 seconds</p>
              <p>• Click again to stop manually</p>
            </div>
          </>
        )}
      </div>
    </>
  );
}
