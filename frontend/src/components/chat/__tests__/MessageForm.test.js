import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import MessageForm from '../MessageForm';

describe('MessageForm Component', () => {
  // Default props
  const defaultProps = {
    input: '',
    setInput: jest.fn(),
    onSubmit: jest.fn(),
    loading: false
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders form with input and submit button', () => {
    render(<MessageForm {...defaultProps} />);
    
    expect(screen.getByPlaceholderText('Type your message...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /send/i })).toBeInTheDocument();
  });

  it('displays the input value correctly', () => {
    render(<MessageForm {...defaultProps} input="test message" />);
    
    const inputElement = screen.getByPlaceholderText('Type your message...');
    expect(inputElement).toHaveValue('test message');
  });

  it('calls setInput when input changes', () => {
    render(<MessageForm {...defaultProps} />);
    
    const inputElement = screen.getByPlaceholderText('Type your message...');
    fireEvent.change(inputElement, { target: { value: 'new message' } });
    
    expect(defaultProps.setInput).toHaveBeenCalledWith('new message');
  });

  it('calls onSubmit when form is submitted', () => {
    render(<MessageForm {...defaultProps} input="test message" />);
    
    const form = screen.getByRole('form');
    fireEvent.submit(form);
    
    expect(defaultProps.onSubmit).toHaveBeenCalled();
  });

  it('does not call onSubmit when input is empty', () => {
    render(<MessageForm {...defaultProps} input="" />);
    
    const form = screen.getByRole('form');
    fireEvent.submit(form);
    
    expect(defaultProps.onSubmit).not.toHaveBeenCalled();
  });

  it('disables input and button when loading', () => {
    render(<MessageForm {...defaultProps} loading={true} />);
    
    const inputElement = screen.getByPlaceholderText('Type your message...');
    const buttonElement = screen.getByRole('button', { name: /send/i });
    
    expect(inputElement).toBeDisabled();
    expect(buttonElement).toBeDisabled();
  });

  it('disables button when input is empty', () => {
    render(<MessageForm {...defaultProps} input="" />);
    
    const buttonElement = screen.getByRole('button', { name: /send/i });
    expect(buttonElement).toBeDisabled();
  });

  it('enables button when input is not empty', () => {
    render(<MessageForm {...defaultProps} input="test message" />);
    
    const buttonElement = screen.getByRole('button', { name: /send/i });
    expect(buttonElement).not.toBeDisabled();
  });

  it('auto-focuses the input field on mount', () => {
    // Mock focus function
    const focusMock = jest.fn();
    
    // Mock useRef to return an object with current and focus method
    jest.spyOn(React, 'useRef').mockReturnValue({
      current: {
        focus: focusMock
      }
    });
    
    render(<MessageForm {...defaultProps} />);
    
    // Focus should be called when component mounts
    expect(focusMock).toHaveBeenCalled();
  });

  it('focuses input after submission', () => {
    // Mock focus function
    const focusMock = jest.fn();
    
    // Mock useRef to return an object with current and focus method
    jest.spyOn(React, 'useRef').mockReturnValue({
      current: {
        focus: focusMock
      }
    });
    
    // Set up fake timers
    jest.useFakeTimers();
    
    render(<MessageForm {...defaultProps} input="test message" />);
    
    // Clear the initial focus call count
    focusMock.mockClear();
    
    // Submit the form
    const form = screen.getByRole('form');
    fireEvent.submit(form);
    
    // Focus should not be called immediately
    expect(focusMock).not.toHaveBeenCalled();
    
    // Advance timers to trigger setTimeout callback
    jest.advanceTimersByTime(100);
    
    // Now focus should have been called
    expect(focusMock).toHaveBeenCalled();
    
    // Clean up
    jest.useRealTimers();
  });
}); 