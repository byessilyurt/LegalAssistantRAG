import { render, screen } from '@testing-library/react';
import App from './App';

test('renders main chat header', () => {
  render(<App />);
  const headerElement = screen.getByText(/Polish Law for Foreigners/i);
  expect(headerElement).toBeInTheDocument();
});

test('displays welcome message initially', () => {
  render(<App />);
  const welcomeElement = screen.getByText(/Welcome to Polish Law Assistant/i);
  expect(welcomeElement).toBeInTheDocument();
});

test('should have a form for sending messages', () => {
  render(<App />);
  const inputElement = screen.getByPlaceholderText(/Type your message/i);
  const sendButton = screen.getByText(/Send/i);
  expect(inputElement).toBeInTheDocument();
  expect(sendButton).toBeInTheDocument();
});
