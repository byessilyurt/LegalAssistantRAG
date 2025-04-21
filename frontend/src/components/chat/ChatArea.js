import React, { useRef, useEffect } from 'react';
import { useAuthentication } from '../../auth/auth-hooks';
import MessageList from './MessageList';
import MessageForm from './MessageForm';
import LoginButton from '../LoginButton';
import '../../styles/chat.css';

const ChatArea = ({ 
  messages, 
  loading, 
  error, 
  onSubmit,
  input,
  setInput
}) => {
  const { isAuthenticated } = useAuthentication();
  const messagesEndRef = useRef(null);
  
  // Scroll to bottom of messages when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="chat-area">
      <div className="messages-container">
        {messages.length === 0 ? (
          <div className="welcome-message">
            <h2>Welcome to Legal Assistant 🇵🇱</h2>
            <p>How can I help you with Polish legal questions today?</p>
            {!isAuthenticated && (
              <div className="welcome-auth-prompt">
                <p>Sign in to save your conversations</p>
                <LoginButton />
              </div>
            )}
          </div>
        ) : (
          <MessageList 
            messages={messages} 
            loading={loading} 
            error={error} 
          />
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      <MessageForm 
        input={input}
        setInput={setInput}
        onSubmit={onSubmit}
        loading={loading}
      />
    </div>
  );
};

export default ChatArea; 