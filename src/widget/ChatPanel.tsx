import React, { useState, useRef, useEffect } from 'react';
import type { Message } from './api';
import type { AgentConfig } from './settings';
import { sendToLLM, sendToLLMFallback } from './api';
import { speak } from './voice';

interface ChatPanelProps {
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  currentLanguage: string;
  isVoiceMode: boolean;
  config: AgentConfig;
}

export default function ChatPanel({
  messages,
  setMessages,
  isLoading,
  setIsLoading,
  currentLanguage,
  isVoiceMode,
  config
}: ChatPanelProps) {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
        response = await sendToLLM(newMessages, currentLanguage);
      } catch (apiError) {
        console.warn('Sarvam API not available, using fallback:', apiError);
        response = await sendToLLMFallback(newMessages, currentLanguage);
      }
      
      const assistantMessage: Message = { role: 'assistant', content: response };
      setMessages(prev => [...prev, assistantMessage]);

      // Auto-speak response in voice mode
      if (isVoiceMode && config.enableVoice) {
        speak(assistantMessage.content, currentLanguage);
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
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        
        .message {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          max-width: 85%;
        }
        
        .message.user {
          align-self: flex-end;
          flex-direction: row-reverse;
        }
        
        .message.assistant {
          align-self: flex-start;
        }
        
        .message-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          font-weight: bold;
        }
        
        .message.user .message-avatar {
          background: var(--primary-color);
          color: white;
        }
        
        .message.assistant .message-avatar {
          background: #f3f4f6;
          color: var(--text-color);
        }
        
        .message-content {
          background: #f8f9fa;
          padding: 12px 16px;
          border-radius: 18px;
          font-size: 14px;
          line-height: 1.4;
          word-wrap: break-word;
        }
        
        .message.user .message-content {
          background: var(--primary-color);
          color: white;
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
          padding: 16px;
          border-top: 1px solid #e5e7eb;
          background: var(--background-color);
        }
        
        .input-wrapper {
          display: flex;
          gap: 8px;
          align-items: flex-end;
        }
        
        .message-input {
          flex: 1;
          border: 1px solid #d1d5db;
          border-radius: 20px;
          padding: 12px 16px;
          font-size: 14px;
          font-family: var(--font-family);
          resize: none;
          outline: none;
          transition: border-color 0.2s ease;
          min-height: 20px;
          max-height: 100px;
        }
        
        .message-input:focus {
          border-color: var(--primary-color);
        }
        
        .send-button {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: var(--primary-color);
          border: none;
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
          flex-shrink: 0;
        }
        
        .send-button:hover:not(:disabled) {
          background: color-mix(in srgb, var(--primary-color) 85%, black);
          transform: scale(1.05);
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
      `}</style>
      
      <div className="chat-container">
        <div className="messages-container">
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
