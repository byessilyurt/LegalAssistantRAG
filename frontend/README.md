# Polish Law for Foreigners - Frontend

A React-based frontend for the Polish Law for Foreigners application. This application provides a chat interface for users to ask questions about Polish law, and receive informative answers with source references.

## Features

- **Source References**: Hover over the "Sources" label to see references for each answer
- **Conversation History**: Keep track of past conversations in the sidebar
- **Clean, Modern UI**: Easy to use interface for all users

## Getting Started

### Prerequisites

- Node.js 14+ installed
- Backend API running (see backend README)

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm start
   ```

3. The application will be available at [http://localhost:3000](http://localhost:3000)

## Usage

1. Type your question about Polish law in the input field at the bottom of the screen
2. Click "Send" or press Enter to submit your question
3. View the AI's response, which will include references to sources
4. Hover over the "Sources" label at the bottom of any response to see the source URLs

## Configuration

The API URL is set in the `App.js` file. By default, it points to `http://localhost:8000`. If your backend is running on a different URL, update the `API_URL` constant.

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in development mode at [http://localhost:3000](http://localhost:3000)

### `npm test`

Launches the test runner in interactive watch mode

### `npm run build`

Builds the app for production to the `build` folder

## Contact

For any questions or issues, please open an issue in the GitHub repository.

