import { render, screen } from '@testing-library/react';
import App from './App';

test('renders main chat header', () => {
  render(<App />);
  const headerElements = screen.getAllByText(/Legal Assistant 🇵🇱/i);
  expect(headerElements[0]).toBeInTheDocument();
});

test('displays welcome message initially', () => {
  render(<App />);
  const welcomeElement = screen.getByText(/How can I help you with Polish legal questions/i);
  expect(welcomeElement).toBeInTheDocument();
});

test('should have a form for sending messages', () => {
  render(<App />);
  const inputElement = screen.getByPlaceholderText(/Type your message/i);
  const sendButton = screen.getByText(/Send/i);
  expect(inputElement).toBeInTheDocument();
  expect(sendButton).toBeInTheDocument();
});
