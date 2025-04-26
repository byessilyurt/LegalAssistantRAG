# Polish Law for Foreigners - Backend

This is the backend API for the Polish Law for Foreigners application, built with FastAPI and designed to be deployed to Google Cloud Run.

## Environment Variables

The following environment variables are needed:

```
# Required: OpenAI API Key
OPENAI_API_KEY=your-openai-api-key-here

# Google Cloud Settings
GCS_BUCKET_NAME=pl-foreigners-legal-advisor
USE_GCS=true

# Authentication settings (if using Auth0)
AUTH0_DOMAIN=your-auth0-domain.auth0.com
AUTH0_AUDIENCE=your-auth0-audience
```

## Local Development

1. Create a virtual environment:
   ```
   python -m venv .venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   ```

2. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

3. Create a `.env` file with your environment variables

4. Run the development server:
   ```
   uvicorn app.main:app --reload
   ```

5. Access the API at http://localhost:8000

## Deployment to Google Cloud Run

1. Make sure you have the Google Cloud SDK installed:
   ```
   curl https://sdk.cloud.google.com | bash
   gcloud init
   ```

2. Set your OpenAI API key as an environment variable:
   ```
   export OPENAI_API_KEY=your-openai-api-key
   ```

3. Make the deployment script executable:
   ```
   chmod +x deploy.sh
   ```

4. Run the deployment script:
   ```
   ./deploy.sh
   ```

5. The script will:
   - Create a Google Cloud Storage bucket if it doesn't exist
   - Upload the data files to the bucket
   - Create a Docker image and deploy it to Cloud Run
   - Output the URL of your deployed API

## API Endpoints

- `GET /`: API health check
- `GET /api/me`: Get the current user's profile
- `GET /api/conversations`: Get all conversations for the current user
- `GET /api/conversations/{conversation_id}`: Get a specific conversation
- `POST /api/chat`: Send a message and get a response
- `DELETE /api/conversations/{conversation_id}`: Delete a conversation

## Troubleshooting

If the RAG system fails to initialize, check:

1. The OpenAI API key is correctly set
2. The Excel data files are accessible (either in the Cloud Storage bucket or locally)
3. Google Cloud authentication is working (if using Google Cloud Storage)

You can check the logs with:
```
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=pl-foreigners-legal-api" --limit 20
```

## Fallback Mechanisms

The system includes several fallback mechanisms:

1. If Google Cloud Storage is not available, it will use local files
2. If Firestore is not available, it will use in-memory storage
3. If the RAG system fails to initialize, the API will still run but return error messages for chat requests 