import React, { useEffect } from 'react';
import { startRecognition } from './voice';
import { stopSpeaking } from './voice';

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

// declare const webkitSpeechRecognition: {
//   prototype: SpeechRecognition;
//   new(): SpeechRecognition;
// } | undefined;

interface VoiceControlsProps {
  isListening: boolean;
  setIsListening: React.Dispatch<React.SetStateAction<boolean>>;
  currentLanguage: string;
  onVoiceResult: (text: string) => void;
  recognitionRef: React.MutableRefObject<{ stop: () => void } | null>;
  onSendVoice?: () => void;
}

export default function VoiceControls({
  isListening,
  setIsListening,
  currentLanguage,
  onVoiceResult,
  recognitionRef,
  onSendVoice
}: VoiceControlsProps) {
  const [isSupported, setIsSupported] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  useEffect(() => {
    // Check if speech recognition is supported
    const globalWindow = window as unknown as {
      SpeechRecognition?: typeof SpeechRecognition;
      webkitSpeechRecognition?: typeof SpeechRecognition;
    };
    const SpeechRecognitionClass = globalWindow.SpeechRecognition;
    if (!SpeechRecognitionClass) {
      setIsSupported(false);
    }
  }, []);

  const startListening = () => {
    if (!isSupported) return;

    // Stop agent speaking when user starts speaking
    console.log('🔇 Stopping agent speech to listen to user...');
    stopSpeaking();

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

  const sendVoiceMessage = () => {
    console.log('📤 Sending voice message...');
    stopListening();
    onSendVoice?.();
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
          padding: 20px;
          border-top: 1px solid #e5e7eb;
          background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
          border-radius: 0 0 20px 20px;
        }
        
        .voice-button {
          width: 100%;
          padding: 18px 24px;
          border: 2px solid var(--primary-color);
          border-radius: 16px;
          background: ${isListening ? 'linear-gradient(135deg, var(--primary-color), #6366f1)' : 'transparent'};
          color: ${isListening ? 'white' : 'var(--primary-color)'};
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          position: relative;
          overflow: hidden;
          box-shadow: ${isListening ? '0 4px 12px rgba(79, 70, 229, 0.3)' : '0 2px 4px rgba(0, 0, 0, 0.1)'};
        }
        
        .voice-button:hover {
          background: linear-gradient(135deg, var(--primary-color), #6366f1);
          color: white;
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(79, 70, 229, 0.4);
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
          margin-top: 12px;
          font-size: 13px;
          color: #64748b;
          font-weight: 500;
        }
        
        .voice-error {
          text-align: center;
          padding: 20px;
          background: linear-gradient(135deg, #fef2f2, #fee2e2);
          border: 1px solid #fecaca;
          border-radius: 12px;
          color: #dc2626;
          box-shadow: 0 2px 4px rgba(220, 38, 38, 0.1);
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
        
        .send-button {
          flex: 1;
          padding: 14px 20px;
          border: none;
          border-radius: 12px;
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          box-shadow: 0 2px 4px rgba(16, 185, 129, 0.3);
        }
        
        .send-button:hover {
          background: linear-gradient(135deg, #059669, #047857);
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(16, 185, 129, 0.4);
        }
        
        .send-button:active {
          transform: translateY(0);
        }
        
        .voice-actions {
          display: flex;
          gap: 16px;
          margin-top: 20px;
        }
        
        .stop-button {
          flex: 1;
          padding: 14px 20px;
          border: 2px solid #ef4444;
          border-radius: 12px;
          background: transparent;
          color: #ef4444;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          box-shadow: 0 2px 4px rgba(239, 68, 68, 0.1);
        }
        
        .stop-button:hover {
          background: linear-gradient(135deg, #ef4444, #dc2626);
          color: white;
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(239, 68, 68, 0.3);
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
            
         
            
            {isListening && (
              <div className="voice-actions">
               
                <button
                  className="send-button"
                  onClick={sendVoiceMessage}
                >
                  📤 Send
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
