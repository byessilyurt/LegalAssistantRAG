# Deployment Instructions

This document explains how to deploy the Polish Law for Foreigners application with a Vercel frontend and Google Cloud Run backend.

## Architecture Overview

- **Frontend**: React application hosted on Vercel
- **Backend**: FastAPI application hosted on Google Cloud Run
- **Storage**: Google Cloud Storage for data files and embeddings
- **Database**: Google Cloud Firestore for conversations

## Prerequisites

- Google Cloud account with billing enabled
- Vercel account
- Node.js and npm installed
- Google Cloud CLI installed and configured
- OpenAI API key

## 1. Backend Deployment

The backend needs to be deployed to Google Cloud Run to provide the RAG functionality.

### Setup Google Cloud

1. Install the Google Cloud SDK if you haven't already:
   ```
   curl https://sdk.cloud.google.com | bash
   ```

2. Initialize the SDK and login:
   ```
   gcloud init
   gcloud auth login
   ```

3. Set your project:
   ```
   gcloud config set project YOUR_PROJECT_ID
   ```

4. Enable required APIs:
   ```
   gcloud services enable run.googleapis.com storage.googleapis.com firestore.googleapis.com
   ```

### Deploy the Backend

1. Make the deployment script executable:
   ```
   chmod +x backend/deploy.sh
   ```

2. Set your OpenAI API key as an environment variable:
   ```
   export OPENAI_API_KEY=your-openai-api-key
   ```

3. Run the deployment script:
   ```
   cd backend
   ./deploy.sh
   ```

4. The script will:
   - Create a Google Cloud Storage bucket if it doesn't exist
   - Upload the query data files to the bucket
   - Build and deploy the Docker container to Cloud Run
   - Output the URL of your deployed backend

5. Make note of the backend URL output from the deployment script. You'll need it for the frontend.

## 2. Frontend Deployment

The frontend is already deployed to Vercel, but you'll need to update it to use the new backend URL.

### Update Backend URL in Frontend

1. Use the provided script to update the backend URL:
   ```
   cd frontend
   node update-backend-url.js YOUR_CLOUD_RUN_URL
   ```

2. Commit the changes:
   ```
   git add src/api/chatApi.js
   git commit -m "Update backend URL to Cloud Run"
   ```

3. Push and deploy to Vercel:
   ```
   git push
   vercel --prod
   ```

## 3. Testing the Deployment

1. Visit your Vercel deployed frontend URL
2. Try sending a message - it should now be processed by your Cloud Run backend
3. If there are any issues, check the logs:
   ```
   gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=pl-foreigners-legal-api" --limit 20
   ```

## Troubleshooting

### Backend Issues

- Check Cloud Run logs as shown above
- Make sure the OpenAI API key is correctly set
- Verify the Google Cloud Storage bucket exists and contains the data files
- Check the Firestore database permissions

### Frontend Issues

- Check browser console for any network errors
- Verify the backend URL is correctly set in the frontend code
- Test the backend directly with curl:
  ```
  curl YOUR_CLOUD_RUN_URL
  ```

## Maintenance

### Updating the Backend

If you make changes to the backend code:

1. Run the deployment script again:
   ```
   cd backend
   ./deploy.sh
   ```

### Updating the Frontend

If you make changes to the frontend code:

1. Push the changes to your repository
2. Vercel will automatically deploy them

### Managing Data

To update the legal Q&A data:

1. Upload new Excel files to the Google Cloud Storage bucket:
   ```
   gsutil cp your_new_data.xlsx gs://pl-foreigners-legal-advisor/data/
   ```

2. Restart the backend service to load the new data:
   ```
   gcloud run services update pl-foreigners-legal-api --region us-central1 --clear-cpu
   ``` 