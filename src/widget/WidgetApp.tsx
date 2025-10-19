import React, { useState, useRef, useEffect } from 'react';
import type { AgentConfig } from './settings';
import { getLanguageInfo } from './settings';
import type { Message } from './api';
import ChatPanel from './ChatPanel';
import VoiceControls from './VoiceControls';

interface WidgetAppProps {
  config: AgentConfig;
}

export default function WidgetApp({ config }: WidgetAppProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState(config.languages?.[0] || 'en');
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<{ stop: () => void } | null>(null);

  // Initialize with system context
  useEffect(() => {
    if (config.context) {
      setMessages([{ role: 'system', content: config.context }]);
    }
  }, [config.context]);

  const toggleWidget = () => setIsOpen(!isOpen);

  const getPositionStyles = () => {
    const position = config.position || 'bottom-right';
    const baseStyles = {
      position: 'fixed' as const,
      zIndex: 999999,
    };

    switch (position) {
      case 'bottom-right':
        return { ...baseStyles, bottom: '20px', right: '20px' };
      case 'bottom-left':
        return { ...baseStyles, bottom: '20px', left: '20px' };
      case 'top-right':
        return { ...baseStyles, top: '20px', right: '20px' };
      case 'top-left':
        return { ...baseStyles, top: '20px', left: '20px' };
      default:
        return { ...baseStyles, bottom: '20px', right: '20px' };
    }
  };

  const getThemeStyles = () => {
    const theme = config.theme || {};
    return {
      '--primary-color': theme.primaryColor || '#4F46E5',
      '--background-color': theme.background || '#ffffff',
      '--text-color': theme.text || '#111827',
      '--font-family': theme.font || 'Inter, system-ui, sans-serif',
    } as React.CSSProperties;
  };

  return (
    <div style={getPositionStyles()}>
      <style>{`
        .widget-container {
          font-family: var(--font-family);
          color: var(--text-color);
        }
        
        .widget-toggle {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: var(--primary-color);
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }
        
        .widget-toggle:hover {
          transform: scale(1.05);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
        }
        
        .widget-toggle img {
          width: 32px;
          height: 32px;
          border-radius: 50%;
        }
        
        .widget-toggle .default-avatar {
          width: 32px;
          height: 32px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 18px;
        }
        
        .widget-panel {
          position: absolute;
          bottom: 70px;
          right: 0;
          width: 380px;
          height: 500px;
          background: var(--background-color);
          border-radius: 16px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
          border: 1px solid rgba(0, 0, 0, 0.08);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          transform: ${isOpen ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.95)'};
          opacity: ${isOpen ? 1 : 0};
          transition: all 0.3s ease;
          pointer-events: ${isOpen ? 'auto' : 'none'};
        }
        
        .widget-header {
          background: var(--primary-color);
          color: white;
          padding: 16px 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        
        .widget-header h3 {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
        }
        
        .language-selector {
          background: rgba(255, 255, 255, 0.2);
          border: none;
          color: white;
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 12px;
          cursor: pointer;
        }
        
        .close-btn {
          background: none;
          border: none;
          color: white;
          cursor: pointer;
          font-size: 18px;
          padding: 4px;
        }
        
        .widget-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        
        .mode-toggle {
          display: flex;
          background: #f3f4f6;
          margin: 12px;
          border-radius: 8px;
          padding: 4px;
        }
        
        .mode-btn {
          flex: 1;
          padding: 8px 12px;
          border: none;
          background: transparent;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.2s ease;
        }
        
        .mode-btn.active {
          background: white;
          color: var(--primary-color);
          font-weight: 600;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        @media (max-width: 480px) {
          .widget-panel {
            width: calc(100vw - 40px);
            right: -20px;
          }
        }
      `}</style>
      
      <div className="widget-container" style={getThemeStyles()}>
        <button className="widget-toggle" onClick={toggleWidget}>
          {config.agent?.avatar ? (
            <img src={config.agent.avatar} alt={config.agent.name || 'Agent'} />
          ) : (
            <div className="default-avatar">
              {(config.agent?.name || 'A').charAt(0).toUpperCase()}
            </div>
          )}
        </button>
        
        {isOpen && (
          <div className="widget-panel">
            <div className="widget-header">
              <div>
                <h3>{config.agent?.name || 'HelperBot'}</h3>
                <select 
                  className="language-selector"
                  value={currentLanguage}
                  onChange={(e) => setCurrentLanguage(e.target.value)}
                >
                  {config.languages?.map(lang => {
                    const langInfo = getLanguageInfo(lang);
                    return (
                      <option key={lang} value={lang}>
                        {langInfo.flag} {langInfo.native}
                      </option>
                    );
                  })}
                </select>
              </div>
              <button className="close-btn" onClick={() => setIsOpen(false)}>
                ×
              </button>
            </div>
            
            <div className="widget-content">
              {config.enableVoice && (
                <div className="mode-toggle">
                  <button 
                    className={`mode-btn ${!isVoiceMode ? 'active' : ''}`}
                    onClick={() => setIsVoiceMode(false)}
                  >
                    💬 Chat
                  </button>
                  <button 
                    className={`mode-btn ${isVoiceMode ? 'active' : ''}`}
                    onClick={() => setIsVoiceMode(true)}
                  >
                    🎤 Voice
                  </button>
                </div>
              )}
              
              <ChatPanel 
                messages={messages}
                setMessages={setMessages}
                isLoading={isLoading}
                setIsLoading={setIsLoading}
                currentLanguage={currentLanguage}
                isVoiceMode={isVoiceMode}
                config={config}
              />
              
              {config.enableVoice && isVoiceMode && (
                <VoiceControls
                  isListening={isListening}
                  setIsListening={setIsListening}
                  currentLanguage={currentLanguage}
                  onVoiceResult={(text) => {
                    if (text.trim()) {
                      setMessages(prev => [...prev, { role: 'user', content: text }]);
                    }
                  }}
                  recognitionRef={recognitionRef}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
