# Polish Law for Foreigners - FastAPI Backend

This is the backend API for the Polish Law for Foreigners application. It provides an endpoint for querying the RAG (Retrieval Augmented Generation) system to answer questions about Polish law.

## Setup

1. Make sure you have Python 3.8+ installed

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Ensure the `.env` file is set up with your OpenAI API key:
   ```
   OPENAI_API_KEY=your_openai_api_key
   ```

4. Make sure the `legal_questions_answers.xlsx` file exists in the correct location (query folder).

## Running the server

Start the FastAPI server:
```bash
python run.py
```

This will start the server on http://localhost:8000 by default.

## API Endpoints

### GET /

Returns a simple message to confirm the API is running.

### POST /api/ask

Endpoint to ask questions about Polish law.

**Request Body:**
```json
{
  "question": "What are the requirements for a temporary residence permit in Poland?"
}
```

**Response:**
```json
{
  "answer": "The answer to your question...",
  "sources": ["https://source1.com", "https://source2.com"]
}
```

## Development

- The server has auto-reload enabled, so any changes to the code will automatically restart the server.
- API documentation is available at http://localhost:8000/docs
- You can modify the CORS settings in `app/main.py` if you need to allow requests from different origins. 