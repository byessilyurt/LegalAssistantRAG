import React from 'react';
import { useAuthentication } from '../../auth/auth-hooks';
import '../../styles/layout.css';

const Sidebar = ({ 
  isOpen, 
  conversations, 
  activeConversation, 
  onSelectConversation, 
  onCreateNewConversation, 
  onDeleteConversation,
  onClose
}) => {
  const { isAuthenticated } = useAuthentication();

  const handleConversationClick = (conversationId) => {
    onSelectConversation(conversationId);
    if (window.innerWidth < 768) {
      onClose(); // Close sidebar on mobile after selecting
    }
  };

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <h2>Conversations</h2>
        <div className="sidebar-actions">
          {isAuthenticated && (
            <button className="new-chat-btn" onClick={onCreateNewConversation}>
              + New Chat
            </button>
          )}
          <button className="close-sidebar" onClick={onClose}>×</button>
        </div>
      </div>
      
      {isAuthenticated ? (
        <div className="conversation-list">
          {conversations.length === 0 ? (
            <div className="no-conversations">
              <p>No conversations yet</p>
              <p>Start a new chat to begin</p>
            </div>
          ) : (
            conversations.map(conv => (
              <div 
                key={conv.id} 
                className={`conversation-item ${activeConversation && activeConversation.id === conv.id ? 'active' : ''}`}
              >
                <div 
                  className="conversation-title"
                  onClick={() => handleConversationClick(conv.id)}
                >
                  {conv.messages.length > 0 
                    ? conv.messages[0].content.substring(0, 25) + '...' 
                    : 'New conversation'}
                  <span className="conversation-time">
                    {new Date(conv.updated_at).toLocaleDateString()}
                  </span>
                </div>
                <button 
                  className="delete-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteConversation(conv.id);
                  }}
                  title="Delete conversation"
                >
                  ×
                </button>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="sidebar-auth-message">
          <p>Sign in to save your conversations and access them later</p>
        </div>
      )}
    </aside>
  );
};

export default Sidebar; 