import React from 'react';
import { render, screen } from '@testing-library/react';
import MessageList from '../MessageList';

describe('MessageList Component', () => {
  // Sample messages
  const sampleMessages = [
    {
      id: '1',
      role: 'user',
      content: 'Hello there',
      timestamp: '2023-01-01T10:00:00Z'
    },
    {
      id: '2',
      role: 'assistant',
      content: 'Hi! How can I help you?',
      timestamp: '2023-01-01T10:01:00Z'
    },
    {
      id: '3',
      role: 'user',
      content: 'I have a legal question',
      timestamp: '2023-01-01T10:02:00Z'
    }
  ];

  // Sample messages with sources
  const messagesWithSources = [
    {
      id: '1',
      role: 'user',
      content: 'Tell me about Polish law',
      timestamp: '2023-01-01T10:00:00Z'
    },
    {
      id: '2',
      role: 'assistant',
      content: 'Polish law is based on the continental legal system. You can learn more at https://example.com/polish-law',
      timestamp: '2023-01-01T10:01:00Z',
      sources: ['https://example.com/polish-law', 'https://example.com/legal-systems']
    }
  ];

  it('renders all messages correctly', () => {
    render(<MessageList messages={sampleMessages} loading={false} error="" />);
    
    // Check all message contents are rendered
    expect(screen.getByText('Hello there')).toBeInTheDocument();
    expect(screen.getByText('Hi! How can I help you?')).toBeInTheDocument();
    expect(screen.getByText('I have a legal question')).toBeInTheDocument();
    
    // Check message classes
    const userMessages = screen.getAllByText(/Hello there|I have a legal question/);
    const assistantMessages = screen.getAllByText(/Hi! How can I help you?/);
    
    userMessages.forEach(msg => {
      expect(msg.closest('.message')).toHaveClass('user');
    });
    
    assistantMessages.forEach(msg => {
      expect(msg.closest('.message')).toHaveClass('assistant');
    });
  });

  it('formats timestamps correctly', () => {
    render(<MessageList messages={sampleMessages} loading={false} error="" />);
    
    // Format we expect based on the implementation (hour:minute in 12-hour format)
    // This may fail if timezone issues arise in testing environment
    const formattedTime = new Date('2023-01-01T10:00:00Z').toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    // Check if at least one time element with the expected format exists
    const timeElements = screen.getAllByText(formattedTime);
    expect(timeElements.length).toBeGreaterThan(0);
  });

  it('displays sources for assistant messages', () => {
    render(<MessageList messages={messagesWithSources} loading={false} error="" />);
    
    // Check if sources label is displayed
    expect(screen.getByText('Sources')).toBeInTheDocument();
    
    // Check if source links are in the document
    const sourceLinks = screen.getAllByRole('link');
    expect(sourceLinks.length).toBe(2);
    expect(sourceLinks[0]).toHaveAttribute('href', 'https://example.com/polish-law');
    expect(sourceLinks[1]).toHaveAttribute('href', 'https://example.com/legal-systems');
  });

  it('extracts sources from message content if sources not provided', () => {
    // Message with URL in content but no sources array
    const messagesWithUrlsInContent = [
      {
        id: '1',
        role: 'assistant',
        content: 'Check out this link https://example.com/info and also https://example.com/data',
        timestamp: '2023-01-01T10:00:00Z'
      }
    ];
    
    render(<MessageList messages={messagesWithUrlsInContent} loading={false} error="" />);
    
    // Check if sources were extracted from content
    expect(screen.getByText('Sources')).toBeInTheDocument();
    
    const sourceLinks = screen.getAllByRole('link');
    expect(sourceLinks.length).toBe(2);
    expect(sourceLinks[0]).toHaveAttribute('href', 'https://example.com/info');
    expect(sourceLinks[1]).toHaveAttribute('href', 'https://example.com/data');
  });

  it('does not show sources for user messages', () => {
    // User message with URL in content
    const userMessageWithUrl = [
      {
        id: '1',
        role: 'user',
        content: 'Check out this link https://example.com/user-link',
        timestamp: '2023-01-01T10:00:00Z'
      }
    ];
    
    render(<MessageList messages={userMessageWithUrl} loading={false} error="" />);
    
    // Sources should not be extracted for user messages
    expect(screen.queryByText('Sources')).not.toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('renders loading indicator when loading is true', () => {
    render(<MessageList messages={sampleMessages} loading={true} error="" />);
    
    // Check if loading indicator exists
    expect(screen.getByRole('div', { name: /loading/i })).toBeInTheDocument();
  });

  it('renders error message when error is provided', () => {
    const errorMessage = 'Failed to fetch messages';
    render(<MessageList messages={sampleMessages} loading={false} error={errorMessage} />);
    
    // Check if error message is displayed
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('deduplicates sources from message content', () => {
    // Message with duplicate URLs
    const messageWithDuplicateUrls = [
      {
        id: '1',
        role: 'assistant',
        content: 'Check these links https://example.com/info and again https://example.com/info',
        timestamp: '2023-01-01T10:00:00Z'
      }
    ];
    
    render(<MessageList messages={messageWithDuplicateUrls} loading={false} error="" />);
    
    // Only one unique link should be displayed
    const sourceLinks = screen.getAllByRole('link');
    expect(sourceLinks.length).toBe(1);
    expect(sourceLinks[0]).toHaveAttribute('href', 'https://example.com/info');
  });
}); 