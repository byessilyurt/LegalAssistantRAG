import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import MessageForm from '../../../components/chat/MessageForm';

describe('MessageForm Component', () => {
  test('renders input and submit button', () => {
    const mockSetInput = jest.fn();
    render(
      <MessageForm
        input=""
        setInput={mockSetInput}
        onSubmit={() => {}}
        loading={false}
      />
    );
    
    // Check input field exists
    const inputElement = screen.getByPlaceholderText('Type your message...');
    expect(inputElement).toBeInTheDocument();
    
    // Check submit button exists
    const submitButton = screen.getByText('Send');
    expect(submitButton).toBeInTheDocument();
  });
  
  test('handles input changes', () => {
    const mockSetInput = jest.fn();
    render(
      <MessageForm
        input=""
        setInput={mockSetInput}
        onSubmit={() => {}}
        loading={false}
      />
    );
    
    // Get input field
    const inputElement = screen.getByPlaceholderText('Type your message...');
    
    // Simulate typing
    fireEvent.change(inputElement, { target: { value: 'test message' } });
    
    // Check if setInput was called with the right value
    expect(mockSetInput).toHaveBeenCalledWith('test message');
  });
  
  test('submits form when submit button is clicked', () => {
    const mockSubmit = jest.fn(e => e.preventDefault());
    render(
      <MessageForm
        input="test message"
        setInput={() => {}}
        onSubmit={mockSubmit}
        loading={false}
      />
    );
    
    // Get submit button
    const submitButton = screen.getByText('Send');
    
    // Click submit button
    fireEvent.click(submitButton);
    
    // Check if onSubmit was called
    expect(mockSubmit).toHaveBeenCalled();
  });
  
  test('does not submit when input is empty', () => {
    const mockSubmit = jest.fn(e => e.preventDefault());
    render(
      <MessageForm
        input=""
        setInput={() => {}}
        onSubmit={mockSubmit}
        loading={false}
      />
    );
    
    // Get submit button
    const submitButton = screen.getByText('Send');
    
    // Click submit button
    fireEvent.click(submitButton);
    
    // Check if onSubmit was not called
    expect(mockSubmit).not.toHaveBeenCalled();
  });
  
  test('disables input and button when loading', () => {
    render(
      <MessageForm
        input="test message"
        setInput={() => {}}
        onSubmit={() => {}}
        loading={true}
      />
    );
    
    // Get input and button
    const inputElement = screen.getByPlaceholderText('Type your message...');
    const submitButton = screen.getByText('Send');
    
    // Check if they are disabled
    expect(inputElement).toBeDisabled();
    expect(submitButton).toBeDisabled();
  });
  
  test('focuses input field on mount', () => {
    render(
      <MessageForm
        input=""
        setInput={() => {}}
        onSubmit={() => {}}
        loading={false}
      />
    );
    
    // Get input field
    const inputElement = screen.getByPlaceholderText('Type your message...');
    
    // Check if it has focus
    expect(document.activeElement).toBe(inputElement);
  });
}); 