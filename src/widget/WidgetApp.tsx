import React, { useState, useRef, useEffect } from 'react';
import type { AgentConfig } from './settings';
import { getLanguageInfo } from './settings';
import type { Message } from './types';
import ChatPanel from './ChatPanel';
import VoiceControls from './VoiceControls';
// import { MessageCircle, X, Mic, Globe } from 'lucide-react';

interface WidgetAppProps {
  config: AgentConfig;
}

export default function WidgetApp({ config }: WidgetAppProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [voiceMessages, setVoiceMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState(config.languages?.[0] || 'en');
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const recognitionRef = useRef<{ stop: () => void } | null>(null);


  const currentMessages = isVoiceMode ? voiceMessages : chatMessages;
  const setCurrentMessages = isVoiceMode ? setVoiceMessages : setChatMessages;

  // Initialize with system context for both chat and voice
  useEffect(() => {
    if (config.context) {
      const systemMessage = { role: 'system' as const, content: config.context };
      setChatMessages([systemMessage]);
      setVoiceMessages([systemMessage]);
    }
  }, [config.context]);

  const toggleWidget = () => setIsOpen(!isOpen);

 
  const handleLanguageChange = async (newLanguage: string) => {
    const previousLanguage = currentLanguage;
    setCurrentLanguage(newLanguage);
    
    // Auto-translate existing messages if enabled and there are messages to translate
    // Default to true if not specified
    const shouldAutoTranslate = config.enableAutoTranslation !== false;
    
    console.log('🔍 Translation check:', {
      enableAutoTranslation: config.enableAutoTranslation,
      shouldAutoTranslate: shouldAutoTranslate,
      chatMessagesLength: chatMessages.length,
      voiceMessagesLength: voiceMessages.length,
      shouldTranslate: shouldAutoTranslate && (chatMessages.length > 1 || voiceMessages.length > 1)
    });
    
    if (shouldAutoTranslate && (chatMessages.length > 1 || voiceMessages.length > 1)) {
      setIsTranslating(true);
      try {
        console.log(`🔄 Translating conversations from ${previousLanguage} to ${newLanguage}`);
        console.log(`📊 Chat messages: ${chatMessages.length}, Voice messages: ${voiceMessages.length}`);
        
        const { translateMessages } = await import('./api');
        
        // Translate both chat and voice messages if they have content beyond system message
        const chatToTranslate = chatMessages.length > 1 ? chatMessages : [];
        const voiceToTranslate = voiceMessages.length > 1 ? voiceMessages : [];
        
        const [translatedChatMessages, translatedVoiceMessages] = await Promise.all([
          chatToTranslate.length > 0 ? translateMessages(chatToTranslate, newLanguage, previousLanguage) : Promise.resolve(chatMessages),
          voiceToTranslate.length > 0 ? translateMessages(voiceToTranslate, newLanguage, previousLanguage) : Promise.resolve(voiceMessages)
        ]);
        
        setChatMessages(translatedChatMessages);
        setVoiceMessages(translatedVoiceMessages);
        console.log('✅ Conversations translated successfully');
      } catch (error) {
        console.warn('Translation failed, keeping original messages:', error);
        // Keep original messages if translation fails
      } finally {
        setIsTranslating(false);
      }
    } else {
      console.log('🔄 Language changed to', newLanguage, '- No translation needed (no messages or auto-translation disabled)');
      console.log('📊 Translation skipped:', {
        shouldAutoTranslate,
        chatMessagesLength: chatMessages.length,
        voiceMessagesLength: voiceMessages.length,
        hasMessages: chatMessages.length > 1 || voiceMessages.length > 1
      });
    }
  };

  const handleVoiceResponse = async (newMessages: Message[]) => {
    console.log('🎤 Handling voice response for messages:', newMessages);
    try {
      const { sendToLLM, sendToLLMFallback } = await import('./api');
      const { speak } = await import('./voice');
      
      let response: string;
      
      // Try Sarvam API first, fallback to mock if no API key
      try {
        console.log('🤖 Getting AI response...');
        response = await sendToLLM(newMessages);
        console.log('🤖 AI response received:', response);
      } catch (apiError) {
        console.warn('Sarvam API not available, using fallback:', apiError);
        response = await sendToLLMFallback(newMessages, currentLanguage);
      }
      
      const assistantMessage: Message = { role: 'assistant', content: response };
      setVoiceMessages(prev => [...prev, assistantMessage]);
      if (config.enableVoice) {
        console.log('🎤 Speaking AI response...');
        speak(assistantMessage.content, currentLanguage);
      }
    } catch (error) {
      console.error('Error handling voice response:', error);
      const errorMessage: Message = { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error. Please try again.' 
      };
      setVoiceMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

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
          line-height: 1.5;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
        
        .widget-toggle {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--primary-color), #6366f1);
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 8px 25px rgba(79, 70, 229, 0.3), 0 4px 12px rgba(0, 0, 0, 0.1);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }
        
        .widget-toggle:hover {
          transform: scale(1.05) translateY(-2px);
          box-shadow: 0 12px 35px rgba(79, 70, 229, 0.4), 0 8px 20px rgba(0, 0, 0, 0.15);
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
        
        .widget-toggle .default-avatar svg {
          width: 20px;
          height: 20px;
          color: white;
        }
        
        .widget-panel {
          position: absolute;
          bottom: 70px;
          right: 0;
          width: 380px;
          height: 500px;
          background: var(--background-color);
          border-radius: 20px;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.15), 0 8px 25px rgba(0, 0, 0, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(10px);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          transform: ${isOpen ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.95)'};
          opacity: ${isOpen ? 1 : 0};
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          pointer-events: ${isOpen ? 'auto' : 'none'};
        }
        
        .widget-header {
          background: linear-gradient(135deg, var(--primary-color), #6366f1);
          color: white;
          padding: 16px 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-radius: 20px 20px 0 0;
          position: relative;
          overflow: hidden;
          gap: 16px;
        }
        
        .widget-header::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.1), transparent);
          pointer-events: none;
        }
        
        .widget-header h3 {
          margin: 0;
          font-size: 18px;
          font-weight: 700;
          letter-spacing: -0.025em;
          position: relative;
          z-index: 1;
        }
        
        .language-selector {
        
          background: rgba(255, 255, 255, 0.15); !important
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: black;
          padding: 8px 12px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          backdrop-filter: blur(10px);
          position: relative;
          z-index: 1;
        }
        
        .language-selector option {
          background: #1f2937;
          color: white;
          padding: 8px;
        }
        
        .language-selector:hover {
          background: rgba(255, 255, 255, 0.25);
          border-color: rgba(255, 255, 255, 0.3);
        }
        
        .close-btn {
          background: rgba(255, 255, 255, 0.1);
          border: none;
          color: white;
          cursor: pointer;
          font-size: 18px;
          padding: 8px;
          border-radius: 8px;
          transition: all 0.2s ease;
          position: relative;
          z-index: 1;
        }
        
        .close-btn:hover {
          background: rgba(255, 255, 255, 0.2);
          transform: scale(1.1);
        }
        
        .widget-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        
        .mode-toggle {
          display: flex;
          background: #f8fafc;
          margin: 20px;
          border-radius: 16px;
          padding: 6px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
          gap: 8px;
        }
        
        .mode-btn {
          flex: 1;
          padding: 10px 14px;
          border: none;
          background: transparent;
          border-radius: 10px;
          cursor: pointer;
          font-size: 13px;
          font-weight: 500;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          color: #64748b;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }
        
        .mode-btn.active {
          background: white;
          color: var(--primary-color);
          font-weight: 600;
          box-shadow: 0 2px 8px rgba(79, 70, 229, 0.15), 0 1px 3px rgba(0, 0, 0, 0.1);
          transform: translateY(-1px);
        }
        
        .mode-btn:hover:not(.active) {
          background: rgba(79, 70, 229, 0.05);
          color: var(--primary-color);
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
              <span>💬</span>
            )}
        </button>
        
        {isOpen && (
          <div className="widget-panel">
              <div className="widget-header">
                <div className="header-content">
                  <h3>{config.agent?.name || 'HelperBot'}</h3>
                  <div className="language-selector-container">
                    <span>🌐</span>
                    <select 
                      className="language-selector"
                      value={currentLanguage}
                      onChange={(e) => handleLanguageChange(e.target.value)}
                      disabled={isTranslating}
                    >
                      {config.languages?.map(lang => {
                        const langInfo = getLanguageInfo(lang);
                        return (
                          <option key={lang} value={lang}>
                            {langInfo.flag} {langInfo.native} ({langInfo.name})
                          </option>
                        );
                      })}
                    </select>
                    {isTranslating && (
                      <div className="translation-indicator">
                        <span className="spinner">🔄</span>
                        <span>Translating...</span>
                      </div>
                    )}
                  </div>
                </div>
                <button className="close-btn" onClick={() => setIsOpen(false)}>
                  ✕
                </button>
              </div>
            
            <div className="widget-content">
              {config.enableVoice && (
                <div className="mode-toggle">
                  <button 
                    className={`mode-btn ${!isVoiceMode ? 'active' : ''}`}
                    onClick={() => setIsVoiceMode(false)}
                  >
                    <span>💬</span>
                    Chat
                  </button>
                  <button 
                    className={`mode-btn ${isVoiceMode ? 'active' : ''}`}
                    onClick={() => setIsVoiceMode(true)}
                  >
                    <span>🎤</span>
                    Voice
                  </button>
                </div>
              )}
              
              <ChatPanel 
                messages={currentMessages}
                setMessages={setCurrentMessages}
                isLoading={isLoading}
                setIsLoading={setIsLoading}
                currentLanguage={currentLanguage}
                isVoiceMode={isVoiceMode}
                isListening={isListening}
                config={config}
                onStopSpeaking={() => {
                  console.log('🔇 Agent speech stopped by user interaction');
                }}
              />
              
              {config.enableVoice && isVoiceMode && (
                <VoiceControls
                  isListening={isListening}
                  setIsListening={setIsListening}
                  currentLanguage={currentLanguage}
                  onVoiceResult={(text) => {
                    if (text.trim()) {
                      const userMessage = { role: 'user' as const, content: text };
                      const newMessages = [...voiceMessages, userMessage];
                      setVoiceMessages(newMessages);
                      
                      setIsLoading(true);
                      handleVoiceResponse(newMessages);
                    }
                  }}
                  recognitionRef={recognitionRef}
                  onSendVoice={() => {
                    console.log('📤 Voice message sent by user');
                    // The voice result will be handled by onVoiceResult
                  }}
                />
              )}
            </div>
          </div>
        )}
      </div>
      
      <style>{`
        .language-selector-container {
          position: relative;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        
        .header-content {
          display: flex;
          flex-direction: column;
          gap: 12px;
          flex: 1;
        }
        
        .language-icon {
          color: rgba(255, 255, 255, 0.8);
          flex-shrink: 0;
        }
        
        .language-selector {
          padding: 8px 12px;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          background: white;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .language-selector:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        
        .language-selector:hover:not(:disabled) {
          border-color: #4F46E5;
        }
        
        .translation-indicator {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: #6B7280;
          padding: 4px 8px;
          background: #F3F4F6;
          border-radius: 6px;
          animation: pulse 1.5s ease-in-out infinite;
        }
        
        .spinner {
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
      `}</style>
    </div>
  );
}
