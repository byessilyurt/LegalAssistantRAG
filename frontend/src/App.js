import { useState } from 'react';
import './App.css';

// API URL - change this to your FastAPI server address
const API_URL = 'http://localhost:8000';

function App() {
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState('');
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;

    setLoading(true);
    setResponse('');
    setSources([]);
    setError('');

    try {
      const res = await fetch(`${API_URL}/api/ask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question }),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || 'Failed to get answer');
      }
      
      const data = await res.json();
      setResponse(data.answer);
      setSources(data.sources || []);
    } catch (error) {
      console.error('Error:', error);
      setError(error.message || 'Sorry, there was an error processing your question.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Polish Law for Foreigners</h1>
        <p className="App-subtitle">Ask questions about Polish law in any language</p>
      </header>
      
      <main className="App-main">
        <form onSubmit={handleSubmit} className="question-form">
          <div className="input-container">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask a question about Polish law..."
              className="question-input"
              disabled={loading}
            />
            <button type="submit" className="submit-button" disabled={loading}>
              {loading ? 'Thinking...' : 'Ask'}
            </button>
          </div>
        </form>

        {loading && (
          <div className="loading-indicator">
            <p>Searching for an answer...</p>
          </div>
        )}

        {error && (
          <div className="error-container">
            <p className="error-text">{error}</p>
          </div>
        )}

        {response && (
          <div className="response-container">
            <h2>Answer:</h2>
            <p className="response-text">{response}</p>
            
            {sources.length > 0 && (
              <div className="sources-container">
                <h3>Sources:</h3>
                <ul className="sources-list">
                  {sources.map((source, index) => (
                    <li key={index}>
                      <a href={source} target="_blank" rel="noopener noreferrer">
                        {source}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
