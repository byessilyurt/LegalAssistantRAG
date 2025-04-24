# Polish Law for Foreigners - Backend

This is the FastAPI backend for the Polish Law for Foreigners application. It implements a RAG (Retrieval-Augmented Generation) system to answer legal questions about Polish law.

## Deployment on Render

The backend is configured for automatic deployment on Render.com using the `render.yaml` file in the root directory of the project.

### Manual Deployment Steps

If you want to deploy manually:

1. Fork or clone this repository
2. Sign up for a [Render account](https://render.com)
3. Create a new Web Service and connect it to your GitHub repository
4. Configure the following settings:
   - Build Command: `pip install -r backend/requirements.txt`
   - Start Command: `cd backend && python run.py`
   - Environment Variables:
     - `OPENAI_API_KEY`: Your OpenAI API key
     - `PORT`: 10000 (or the port assigned by Render)
     - `PYTHON_VERSION`: 3.9.0

### Environment Variables

Create a copy of `env.example` and rename it to `.env` for local development:

```bash
cp env.example .env
```

Edit the `.env` file and add your OpenAI API key:

```
OPENAI_API_KEY=your_openai_api_key_here
PORT=8000
```

## Local Development

To run the backend locally:

```bash
# Install dependencies
pip install -r requirements.txt

# Run the server
python run.py
```

The server will be available at http://localhost:8000 by default.

## API Endpoints

- `GET /`: Root endpoint to check if the API is running
- `POST /api/chat`: Send a message and get a response
- `GET /api/conversations`: Get all conversations for the current user
- `GET /api/conversations/{conversation_id}`: Get a specific conversation
- `DELETE /api/conversations/{conversation_id}`: Delete a conversation

## Architecture

The backend implements a RAG (Retrieval-Augmented Generation) system using:

- FastAPI for the web framework
- OpenAI for embeddings and text generation
- Pandas for data handling
- Various Excel files containing legal Q&A data

When a user sends a message, the system:
1. Finds relevant documents using embeddings and cosine similarity
2. Creates a prompt with the relevant context
3. Generates a response using OpenAI's models
4. Returns the response with source citations 