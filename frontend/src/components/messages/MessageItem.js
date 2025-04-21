import React from 'react';

const MessageItem = ({ message }) => {
  // Format timestamp for display
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`message-item ${message.sender}`} data-testid={`message-${message.id}`}>
      <div className="message-content">
        {message.content}
      </div>
      <div className="message-info">
        <span className="message-sender">{message.sender}</span>
        <span className="message-time">{formatTime(message.timestamp)}</span>
      </div>
    </div>
  );
};

export default MessageItem; 