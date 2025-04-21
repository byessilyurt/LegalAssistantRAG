# Frontend Test Suite

This directory contains the test suite for the React application. Tests are organized to mirror the component structure of the application.

## Test Structure

- `components/` - Tests for React components
  - `layout/` - Tests for layout components
  - `chat/` - Tests for chat-related components
- `hooks/` - Tests for custom hooks

## Running Tests

To run all tests:

```bash
npm test
```

To run a specific test file:

```bash
npm test -- src/__tests__/components/chat/MessageForm.test.js
```

To run tests with coverage:

```bash
npm test -- --coverage
```

## Test Philosophy

- Each component is tested in isolation
- Dependencies are mocked
- Tests focus on behavior, not implementation details
- Each test should be independent and not rely on other tests

## Mocking Strategy

- External dependencies like Auth0 hooks are mocked
- Child components are mocked in parent component tests
- Browser APIs like localStorage are mocked in setupTests.js

## Test Utilities

The test suite uses:

- Jest as the test runner
- React Testing Library for rendering and interacting with components
- Jest mock functions for mocking dependencies
- Custom setup in setupTests.js for common browser APIs

## Adding New Tests

When adding a new component:

1. Create a corresponding test file in the appropriate directory
2. Mock any dependencies the component uses
3. Test the component's rendering and behavior
4. Consider edge cases and error states 