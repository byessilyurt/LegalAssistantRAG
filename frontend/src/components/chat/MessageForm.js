import React, { useRef, useEffect } from 'react';

const MessageForm = ({ input, setInput, onSubmit, loading }) => {
  const inputRef = useRef(null);
  
  // Focus input field when component mounts
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    onSubmit(e);
    
    // Re-focus the input after submission
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 100);
  };

  return (
    <form onSubmit={handleSubmit} className="message-form">
      <input
        ref={inputRef}
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type your message..."
        className="message-input"
        disabled={loading}
      />
      <button 
        type="submit" 
        className="send-button" 
        disabled={loading || !input.trim()}
      >
        Send
      </button>
    </form>
  );
};

export default MessageForm; 