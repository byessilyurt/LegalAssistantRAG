import React from 'react';

const MessageList = ({ messages, loading, error }) => {
  // Format timestamp for display
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Extract sources from message content
  const extractSources = (content) => {
    // Simple regex to detect URLs in the message
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const urls = content.match(urlRegex);
    
    if (!urls) return null;
    
    // Remove duplicates and convert to source objects
    return [...new Set(urls)].map(url => ({
      title: url,
      url: url
    }));
  };

  return (
    <div className="message-list">
      {messages.map(msg => {
        // Get sources from the message object or extract from content if not available
        const sources = msg.sources && msg.sources.length > 0 
          ? msg.sources 
          : (msg.role === 'assistant' ? extractSources(msg.content) : null);
        
        return (
          <div key={msg.id} className={`message ${msg.role}`}>
            <div className="message-content">
              {msg.content}
            </div>
            <div className="message-footer">
              <div className="message-time">{formatTime(msg.timestamp)}</div>
              {sources && sources.length > 0 && (
                <div className="message-sources">
                  <span className="sources-label">Sources</span>
                  <div className="sources-list">
                    <ul>
                      {sources.map((source, index) => (
                        <li key={index}>
                          <a href={source.url} target="_blank" rel="noopener noreferrer">
                            {source.title}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
      
      {loading && (
        <div className="message assistant loading">
          <div className="loading-indicator" data-testid="loading-indicator">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      )}
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
    </div>
  );
};

export default MessageList; 