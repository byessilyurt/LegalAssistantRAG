# Polish Law for Foreigners - Frontend

A React-based frontend for the Polish Law for Foreigners application. This application provides a chat interface for users to ask questions about Polish law, and receive informative answers with source references.

## Features

- **Source References**: Hover over the "Sources" label to see references for each answer
- **Conversation History**: Keep track of past conversations in the sidebar
- **Clean, Modern UI**: Easy to use interface for all users
- **Cloud Integration**: Connects to the Cloud Run backend.

## Getting Started

### Prerequisites

- Node.js 14+ installed
- Backend API running (see backend README) or deployed to Google Cloud Run

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

You can configure the backend API URL in several ways:

1. **Environment Variables**: Create a `.env.local` file with:
   ```
   REACT_APP_API_BASE_URL=https://your-cloud-run-url
   ```

2. **Update Backend URL Script**: Use the provided script to update the URL:
   ```bash
   node update-backend-url.js YOUR_CLOUD_RUN_URL
   ```

3. **Manual Edit**: Update the `API_BASE_URL` in `src/api/chatApi.js`

## Deployment

### Deploying to Vercel

1. Install the Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Update the backend URL to point to your Cloud Run instance:
   ```bash
   node update-backend-url.js YOUR_CLOUD_RUN_URL
   ```

3. Add environment variables in the Vercel dashboard:
   - Go to your project settings in Vercel
   - Add `REACT_APP_API_BASE_URL` with your Cloud Run URL
   - Add any other required environment variables (Auth0, etc.)

4. Deploy to Vercel:
   ```bash
   vercel --prod
   ```

## Backend Integration

The frontend integrates with two backend options:

1. **Cloud Run Backend**: The primary backend running the full RAG system

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in development mode at [http://localhost:3000](http://localhost:3000)

### `npm test`

Launches the test runner in interactive watch mode

### `npm run build`

Builds the app for production to the `build` folder

### `node update-backend-url.js URL`

Updates the Cloud Run backend URL in the code and creates a .env.local file

## Contact

For any questions or issues, please open an issue in the GitHub repository.

