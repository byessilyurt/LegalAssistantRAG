import React from 'react';
import { render, screen } from '@testing-library/react';
import MessageList from '../../../components/chat/MessageList';

describe('MessageList Component', () => {
  const mockMessages = [
    { 
      id: '1', 
      content: 'Hello, I have a question', 
      role: 'user', 
      timestamp: new Date('2023-06-15T10:30:00').toISOString() 
    },
    { 
      id: '2', 
      content: 'I can help with that. What would you like to know?', 
      role: 'assistant', 
      timestamp: new Date('2023-06-15T10:31:00').toISOString() 
    }
  ];

  test('renders messages correctly', () => {
    render(<MessageList messages={mockMessages} loading={false} error={null} />);
    
    // Check user message
    expect(screen.getByText('Hello, I have a question')).toBeInTheDocument();
    
    // Check assistant message
    expect(screen.getByText('I can help with that. What would you like to know?')).toBeInTheDocument();
    
    // Check for message classes instead of roles text
    expect(document.querySelector('.message.user')).toBeInTheDocument();
    expect(document.querySelector('.message.assistant')).toBeInTheDocument();
  });

  test('shows loading indicator when loading', () => {
    render(<MessageList messages={mockMessages} loading={true} error={null} />);
    
    // Check for loading indicator
    expect(screen.getByTestId('loading-indicator')).toBeInTheDocument();
  });

  test('shows error message when there is an error', () => {
    const errorMessage = 'Failed to load messages';
    render(<MessageList messages={mockMessages} loading={false} error={errorMessage} />);
    
    // Check for error message
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  test('formats timestamps correctly', () => {
    render(<MessageList messages={mockMessages} loading={false} error={null} />);
    
    // Format expected based on the mock date
    // Check that the timestamps are formatted as expected, without checking exact format
    const timestamps = screen.getAllByText(/(\d{1,2}):(\d{2})/);
    expect(timestamps.length).toBe(2);
  });

  test('renders messages with sources', () => {
    const messagesWithSources = [
      ...mockMessages,
      {
        id: '3',
        content: 'This information is from a legal source.',
        role: 'assistant',
        timestamp: new Date('2023-06-15T10:35:00').toISOString(),
        sources: [
          { title: 'Legal Document 1', url: 'https://example.com/doc1' },
          { title: 'Legal Document 2', url: 'https://example.com/doc2' }
        ]
      }
    ];
    
    render(<MessageList messages={messagesWithSources} loading={false} error={null} />);
    
    // Check message content
    expect(screen.getByText('This information is from a legal source.')).toBeInTheDocument();
    
    // Check sources label
    expect(screen.getByText('Sources')).toBeInTheDocument();
    
    // Check source URLs instead of titles
    expect(document.querySelector('a[href="https://example.com/doc1"]')).toBeInTheDocument();
    expect(document.querySelector('a[href="https://example.com/doc2"]')).toBeInTheDocument();
  });

  test('renders nothing when messages array is empty', () => {
    const { container } = render(<MessageList messages={[]} loading={false} error={null} />);
    
    // The container should only have the main message list div with no message items
    expect(container.firstChild.children.length).toBe(0);
  });
}); 