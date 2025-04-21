import React, { useState, useEffect } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import '../../styles/layout.css';

const Layout = ({ children, conversations, activeConversation, onSelectConversation, onCreateNewConversation, onDeleteConversation }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Close sidebar when window is resized to desktop size
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setSidebarOpen(false);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Add body class when sidebar is open to prevent scrolling
  useEffect(() => {
    if (sidebarOpen) {
      document.body.classList.add('sidebar-open');
    } else {
      document.body.classList.remove('sidebar-open');
    }
    
    return () => {
      document.body.classList.remove('sidebar-open');
    };
  }, [sidebarOpen]);
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="app-layout">
      <Header onSidebarToggle={toggleSidebar} />
      
      <div className="main-container">
        <Sidebar 
          isOpen={sidebarOpen}
          conversations={conversations}
          activeConversation={activeConversation}
          onSelectConversation={onSelectConversation}
          onCreateNewConversation={onCreateNewConversation}
          onDeleteConversation={onDeleteConversation}
          onClose={closeSidebar}
        />
        
        {/* Overlay for mobile sidebar */}
        <div 
          className="sidebar-overlay" 
          onClick={closeSidebar}
          aria-hidden="true"
        />
        
        <main className="content-area">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout; 