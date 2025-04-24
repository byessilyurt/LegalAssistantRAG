# Vercel Serverless Functions

This directory contains serverless functions that power the backend API for the PLforForeignerswithAI application.

## Available Endpoints

- `/api/hello` - Test endpoint that returns a simple greeting
- `/api/chat` - Main chat endpoint that processes user messages and returns responses
- `/api/conversations` - Manages user conversations (list, create, delete)
- `/api/chat-ai` - Example of OpenAI integration (requires API key)

## Local Development

To test these functions locally, use the Vercel CLI:

```bash
npm install -g vercel
vercel dev
```

## Environment Variables

For AI integration, set up the following environment variables in your Vercel project:

- `OPENAI_API_KEY` - Your OpenAI API key

## Adding Environment Variables to Vercel

1. Go to your Vercel dashboard
2. Select your project
3. Go to Settings > Environment Variables
4. Add your variables

## Limitations

- The in-memory conversation store in `conversations.js` will reset when the function is redeployed
- For production, use a proper database like Vercel KV, MongoDB, or Firebase

## Using Other AI Providers

The `chat-ai.js` file shows OpenAI integration, but you can swap it with other AI services like:
- Claude from Anthropic
- Google Vertex AI
- Cohere
- Azure OpenAI 