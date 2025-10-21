import React, { useState, useRef, useEffect } from 'react';
import type { Message } from './types';
import type { AgentConfig } from './settings';
import { sendToLLM, sendToLLMFallback } from './api';
import { speak, stopSpeaking, setSpeechEndCallback } from './voice';
import { formatMessage, scrollIntoView } from './utils';
import { Send, Mic, Square } from 'lucide-react';

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
    scrollIntoView(messagesEndRef.current);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && lastMessage.role === 'assistant' && isVoiceMode && config.enableVoice) {
      setIsSpeaking(true);
    }
  }, [messages, isVoiceMode, config.enableVoice]);

  useEffect(() => {
    if (isListening && isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
      onStopSpeaking?.();
    }
  }, [isListening, isSpeaking, onStopSpeaking]);

  useEffect(() => {
    setSpeechEndCallback(() => {
      setIsSpeaking(false);
    });

    return () => {
      setSpeechEndCallback(null);
      stopSpeaking();
    };
  }, []);

  useEffect(() => {
    if (!isVoiceMode) {
      setIsSpeaking(false);
      stopSpeaking();
    }
  }, [isVoiceMode]);

  useEffect(() => {
    return () => {
      stopSpeaking();
      setIsSpeaking(false);
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
      
      try {
        response = await sendToLLM(newMessages);
      } catch (apiError) {
        response = await sendToLLMFallback(newMessages, currentLanguage);
      }
      
      const assistantMessage: Message = { role: 'assistant', content: response };
      setMessages(prev => [...prev, assistantMessage]);
      
      if (isVoiceMode && config.enableVoice) {
        setIsSpeaking(true);
        speak(assistantMessage.content, currentLanguage);
      }
    } catch (error) {
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
          padding: 12px;
          display: flex;
          flex-direction: column;
          gap: 20px;
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
          padding: 24px;
          border-top: 1px solid #e5e7eb;
          background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
          border-radius: 0 0 20px 20px;
        }
        
        .input-wrapper {
          display: flex;
          gap: 16px;
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
          color: #1f2937;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        
        .message-input:focus {
          border-color: var(--primary-color);
          box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
        }
        
        .message-input::placeholder {
          color: #9ca3af;
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
        
        
        /* Voice Interface Styles */
        .voice-interface {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 200px;
     
          text-align: center;
        
      
        
          overflow: hidden;
          position: relative;
        }
        
        
        .tap-to-speak {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
          padding: 20px;
        
        }
        
        .mic-icon-large {
          font-size: 48px;
          opacity: 0.9;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
          color: #4f46e5;
        }
        
        .tap-to-speak:hover .mic-icon-large {
          opacity: 1;
          transform: scale(1.1);
        }
        
        .tap-to-speak p {
          font-size: 16px;
          color: #4f46e5;
          margin: 0;
          font-weight: 600;
        }
        
        
        .speaking-indicator {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          margin-top: 12px;
          padding: 8px;
          background: rgba(79, 70, 229, 0.05);
          border-radius: 8px;
          border: 1px solid rgba(79, 70, 229, 0.1);
          position: relative;
          z-index: 10;
        }
        
        .stop-speaking-btn {
          padding: 8px 16px;
          border: 2px solid #ef4444;
          border-radius: 8px;
          background: transparent;
          color: #ef4444;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          box-shadow: 0 2px 4px rgba(239, 68, 68, 0.1);
          min-width: 80px;
        }
        
        .stop-speaking-btn:hover {
          background: linear-gradient(135deg, #ef4444, #dc2626);
          color: white;
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(239, 68, 68, 0.3);
        }
        
        .speaking-indicator p {
          color: #4f46e5;
          font-size: 15px;
          font-weight: 600;
          margin: 0;
          text-align: center;
        }
        
        
      `}</style>
      
      <div className="chat-container">
        <div className="messages-container">
          {isVoiceMode ? (
            // Voice mode - show voice interface
            <div className="voice-interface">
              {isListening && (
                <div className="tap-to-speak">
                  <div className="mic-icon-large">
                    <Mic size={42} />
                  </div>
                  {/* <p>Tap to speak</p> */}
                </div>
              )}
              
              {isSpeaking && (
                <div className="speaking-indicator">
                  <p>Agent is speaking...</p>
                  <button 
                    className="stop-speaking-btn"
                    onClick={() => {
                      stopSpeaking();
                      setIsSpeaking(false);
                      onStopSpeaking?.();
                    }}
                  >
                    <Square size={16} />
                    Stop
                  </button>
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
                  <Send size={18} />
                </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
