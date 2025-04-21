import React from 'react';
import MessageItem from './MessageItem';

const MessageList = ({ messages, loading }) => {
  if (loading) {
    return <div>Loading messages...</div>;
  }

  if (!messages || messages.length === 0) {
    return <div>No messages available</div>;
  }

  return (
    <div className="messages-list">
      {messages.map(message => (
        <MessageItem key={message.id} message={message} />
      ))}
    </div>
  );
};

export default MessageList; 