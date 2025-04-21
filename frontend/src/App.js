import React from 'react';
import './App.css';
import Layout from './components/layout/Layout';
import ChatArea from './components/chat/ChatArea';
import useChat from './hooks/useChat';

function App() {
  const {
    input,
    setInput,
    loading,
    error,
    conversations,
    activeConversation,
    messages,
    selectConversation,
    createNewConversation,
    deleteConversation,
    handleSubmit
  } = useChat();

  return (
    <Layout
      conversations={conversations}
      activeConversation={activeConversation}
      onSelectConversation={selectConversation}
      onCreateNewConversation={createNewConversation}
      onDeleteConversation={deleteConversation}
    >
      <ChatArea
        messages={messages}
        loading={loading}
        error={error}
        input={input}
        setInput={setInput}
        onSubmit={handleSubmit}
      />
    </Layout>
  );
}

export default App;
