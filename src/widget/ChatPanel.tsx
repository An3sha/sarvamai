import React, { useState, useRef, useEffect } from 'react';
import type { Message } from './api';
import type { AgentConfig } from './settings';
import { sendToLLM, sendToLLMFallback } from './api';
import { speak, stopSpeaking, setSpeechEndCallback } from './voice';

interface ChatPanelProps {
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  currentLanguage: string;
  isVoiceMode: boolean;
  isListening: boolean;
  config: AgentConfig;
  onStopSpeaking?: () => void;
}

export default function ChatPanel({
  messages,
  setMessages,
  isLoading,
  setIsLoading,
  currentLanguage,
  isVoiceMode,
  isListening,
  config,
  onStopSpeaking
}: ChatPanelProps) {
  const [inputValue, setInputValue] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Monitor for new assistant messages and set speaking state
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && lastMessage.role === 'assistant' && isVoiceMode && config.enableVoice) {
      console.log('🎤 New assistant message detected, setting speaking state');
      setIsSpeaking(true);
    }
  }, [messages, isVoiceMode, config.enableVoice]);

  // Stop speaking when user starts listening
  useEffect(() => {
    if (isListening && isSpeaking) {
      console.log('🔇 User started listening, stopping agent speech');
      stopSpeaking();
      setIsSpeaking(false);
      onStopSpeaking?.();
    }
  }, [isListening, isSpeaking, onStopSpeaking]);

  // Set up speech end callback and cleanup
  useEffect(() => {
    setSpeechEndCallback(() => {
      setIsSpeaking(false);
    });

    return () => {
      setSpeechEndCallback(null);
      stopSpeaking();
    };
  }, []);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: inputValue.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputValue('');
    setIsLoading(true);

    try {
      let response: string;
      
      // Try Sarvam API first, fallback to mock if no API key
      try {
        response = await sendToLLM(newMessages);
      } catch (apiError) {
        console.warn('Sarvam API not available, using fallback:', apiError);
        response = await sendToLLMFallback(newMessages, currentLanguage);
      }
      
      const assistantMessage: Message = { role: 'assistant', content: response };
      setMessages(prev => [...prev, assistantMessage]);

      // Auto-speak response in voice mode
      console.log('🔊 Voice check:', {
        isVoiceMode,
        enableVoice: config.enableVoice,
        shouldSpeak: isVoiceMode && config.enableVoice,
        content: assistantMessage.content.substring(0, 50) + '...',
        language: currentLanguage
      });
      
      if (isVoiceMode && config.enableVoice) {
      console.log('🔊 Speaking response in voice mode...');
      setIsSpeaking(true);
      speak(assistantMessage.content, currentLanguage);
      } else {
        console.log('🔇 Not speaking - voice mode or voice disabled');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error. Please try again.' 
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };



  const formatMessage = (content: string) => {
    // Simple markdown-like formatting
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code>$1</code>')
      .replace(/\n/g, '<br>');
  };

  return (
    <>
      <style>{`
        .chat-container {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        
        .messages-container {
          flex: 1;
          overflow-y: auto;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          background: linear-gradient(180deg, #fafbfc 0%, #ffffff 100%);
        }
        
        .message {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          max-width: 85%;
          animation: messageSlideIn 0.3s ease-out;
        }
        
        @keyframes messageSlideIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .message.user {
          align-self: flex-end;
          flex-direction: row-reverse;
        }
        
        .message.assistant {
          align-self: flex-start;
        }
        
        .message-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          font-weight: bold;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          border: 2px solid rgba(255, 255, 255, 0.8);
        }
        
        .message.user .message-avatar {
          background: linear-gradient(135deg, var(--primary-color), #6366f1);
          color: white;
        }
        
        .message.assistant .message-avatar {
          background: linear-gradient(135deg, #f3f4f6, #e5e7eb);
          color: var(--text-color);
        }
        
        .message-content {
          background: #f8f9fa;
          padding: 14px 18px;
          border-radius: 20px;
          font-size: 14px;
          line-height: 1.5;
          word-wrap: break-word;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          border: 1px solid rgba(0, 0, 0, 0.05);
        }
        
        .message.user .message-content {
          background: linear-gradient(135deg, var(--primary-color), #6366f1);
          color: white;
          box-shadow: 0 2px 8px rgba(79, 70, 229, 0.3);
        }
        
        .message-content strong {
          font-weight: 600;
        }
        
        .message-content em {
          font-style: italic;
        }
        
        .message-content code {
          background: rgba(0, 0, 0, 0.1);
          padding: 2px 4px;
          border-radius: 4px;
          font-family: 'Monaco', 'Menlo', monospace;
          font-size: 12px;
        }
        
        .message.user .message-content code {
          background: rgba(255, 255, 255, 0.2);
        }
        
        .input-container {
          padding: 20px;
          border-top: 1px solid #e5e7eb;
          background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
          border-radius: 0 0 20px 20px;
        }
        
        .input-wrapper {
          display: flex;
          gap: 12px;
          align-items: flex-end;
        }
        
        .message-input {
          flex: 1;
          border: 2px solid #e2e8f0;
          border-radius: 24px;
          padding: 14px 20px;
          font-size: 14px;
          font-family: var(--font-family);
          resize: none;
          outline: none;
          transition: all 0.2s ease;
          min-height: 48px;
          max-height: 120px;
          background: #ffffff;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        
        .message-input:focus {
          border-color: var(--primary-color);
          box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
        }
        
        .send-button {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--primary-color), #6366f1);
          border: none;
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
          flex-shrink: 0;
          box-shadow: 0 2px 8px rgba(79, 70, 229, 0.3);
        }
        
        .send-button:hover:not(:disabled) {
          background: linear-gradient(135deg, #5b21b6, #4f46e5);
          transform: scale(1.05);
          box-shadow: 0 4px 12px rgba(79, 70, 229, 0.4);
        }
        
        .send-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .loading-indicator {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 16px;
          color: #6b7280;
          font-size: 14px;
        }
        
        .loading-dots {
          display: flex;
          gap: 4px;
        }
        
        .loading-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #6b7280;
          animation: loading 1.4s infinite ease-in-out;
        }
        
        .loading-dot:nth-child(1) { animation-delay: -0.32s; }
        .loading-dot:nth-child(2) { animation-delay: -0.16s; }
        
        @keyframes loading {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1); }
        }
        
        .welcome-message {
          text-align: center;
          color: #6b7280;
          font-size: 14px;
          padding: 20px;
        }
        
        .welcome-message h4 {
          margin: 0 0 8px 0;
          color: var(--text-color);
          font-size: 16px;
        }
        
        .voice-controls {
          display: flex;
          gap: 8px;
          padding: 12px 16px;
          background: #f8f9fa;
          border-top: 1px solid #e5e7eb;
          justify-content: center;
        }
        
        .voice-control-btn {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          transition: all 0.2s ease;
        }
        
        .voice-control-btn.stop {
          background: #ef4444;
          color: white;
        }
        
        .voice-control-btn.pause {
          background: #f59e0b;
          color: white;
        }
        
        .voice-control-btn:hover {
          transform: scale(1.05);
        }
        
        .voice-control-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
        }
        
        /* Voice Interface Styles */
        .voice-interface {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 300px;
          padding: 40px 20px;
          text-align: center;
          background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%);
          border-radius: 20px;
          margin: 20px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
        }
        
        .voice-status {
          margin-bottom: 20px;
        }
        
        .tap-to-speak {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
        }
        
        .mic-icon-large {
          font-size: 64px;
          opacity: 0.8;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
        }
        
        .tap-to-speak:hover .mic-icon-large {
          opacity: 1;
          transform: scale(1.1);
        }
        
        .tap-to-speak p {
          font-size: 18px;
          color: #64748b;
          margin: 0;
          font-weight: 500;
        }
        
        .listening-indicator {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 80px;
          height: 80px;
        }
        
        .pulse-ring {
          position: absolute;
          border: 2px solid #4F46E5;
          border-radius: 50%;
          animation: pulse 1.5s ease-out infinite;
        }
        
        .pulse-ring:nth-child(1) {
          width: 40px;
          height: 40px;
          animation-delay: 0s;
        }
        
        .pulse-ring:nth-child(2) {
          width: 60px;
          height: 60px;
          animation-delay: 0.3s;
        }
        
        .pulse-ring:nth-child(3) {
          width: 80px;
          height: 80px;
          animation-delay: 0.6s;
        }
        
        .mic-icon {
          font-size: 24px;
          z-index: 1;
          background: #4F46E5;
          color: white;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        @keyframes pulse {
          0% {
            transform: scale(0.8);
            opacity: 1;
          }
          100% {
            transform: scale(1.2);
            opacity: 0;
          }
        }
        
        .speaking-indicator {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          margin-top: 20px;
        }
        
        .speaking-animation {
          display: flex;
          align-items: center;
          gap: 3px;
        }
        
        .sound-wave {
          width: 4px;
          background: #4F46E5;
          border-radius: 2px;
          animation: soundWave 1s ease-in-out infinite;
        }
        
        .sound-wave:nth-child(1) {
          height: 12px;
          animation-delay: 0s;
        }
        
        .sound-wave:nth-child(2) {
          height: 20px;
          animation-delay: 0.1s;
        }
        
        .sound-wave:nth-child(3) {
          height: 28px;
          animation-delay: 0.2s;
        }
        
        .sound-wave:nth-child(4) {
          height: 20px;
          animation-delay: 0.3s;
        }
        
        .sound-wave:nth-child(5) {
          height: 12px;
          animation-delay: 0.4s;
        }
        
        @keyframes soundWave {
          0%, 100% {
            transform: scaleY(0.5);
            opacity: 0.7;
          }
          50% {
            transform: scaleY(1);
            opacity: 1;
          }
        }
        
        .speaking-indicator p {
          font-size: 14px;
          color: #666;
          margin: 0;
        }
        
        .voice-conversation-summary {
          margin-top: 20px;
          padding: 12px 16px;
          background: #f8f9fa;
          border-radius: 8px;
          border: 1px solid #e9ecef;
        }
        
        .voice-conversation-summary p {
          margin: 0 0 4px 0;
          font-size: 14px;
          color: #495057;
        }
        
        .voice-conversation-summary small {
          color: #6c757d;
          font-size: 12px;
        }
      `}</style>
      
      <div className="chat-container">
        <div className="messages-container">
          {isVoiceMode ? (
            // Voice mode - show voice interface
            <div className="voice-interface">
              <div className="voice-status">
                {isListening ? (
                  <div className="listening-indicator">
                    <div className="pulse-ring"></div>
                    <div className="pulse-ring"></div>
                    <div className="pulse-ring"></div>
                    <div className="mic-icon">🎤</div>
                  </div>
                ) : (
                  <div className="tap-to-speak">
                    <div className="mic-icon-large">🎤</div>
                    <p>Tap to speak</p>
                  </div>
                )}
              </div>
              
              {/* {isSpeaking && (
                <div className="speaking-indicator">
                  <div className="speaking-animation">
                    <div className="sound-wave"></div>
                    <div className="sound-wave"></div>
                    <div className="sound-wave"></div>
                    <div className="sound-wave"></div>
                    <div className="sound-wave"></div>
                  </div>
                  <p>Agent is speaking...</p>
                </div>
              )} */}
              
              {messages.filter(m => m.role !== 'system').length > 0 && (
                <div className="voice-conversation-summary">
                  <p>Conversation started</p>
                  <small>{messages.filter(m => m.role !== 'system').length} exchanges</small>
                </div>
              )}
            </div>
          ) : (
            // Chat mode - show text messages
            <>
              {messages.filter(m => m.role !== 'system').length === 0 ? (
                <div className="welcome-message">
                  <h4>👋 Hello! I'm {config.agent?.name || 'HelperBot'}</h4>
                  <p>{config.agent?.greeting || 'How can I help you today?'}</p>
                </div>
              ) : (
                messages
                  .filter(m => m.role !== 'system')
                  .map((message, index) => (
                    <div key={index} className={`message ${message.role}`}>
                      <div className="message-avatar">
                        {message.role === 'user' ? 'U' : (config.agent?.name || 'A').charAt(0).toUpperCase()}
                      </div>
                      <div 
                        className="message-content"
                        dangerouslySetInnerHTML={{ __html: formatMessage(message.content) }}
                      />
                    </div>
                  ))
              )}
            </>
          )}
          
          {isLoading && (
            <div className="message assistant">
              <div className="message-avatar">
                {(config.agent?.name || 'A').charAt(0).toUpperCase()}
              </div>
              <div className="loading-indicator">
                <span>Thinking</span>
                <div className="loading-dots">
                  <div className="loading-dot"></div>
                  <div className="loading-dot"></div>
                  <div className="loading-dot"></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
        
        {!isVoiceMode && (
          <div className="input-container">
            <div className="input-wrapper">
              <input
                ref={inputRef}
                type="text"
                className="message-input"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={config.placeholder || "Type your message..."}
                disabled={isLoading}
              />
              <button
                className="send-button"
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading}
              >
                ➤
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
