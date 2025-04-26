#!/bin/bash
# Script to deploy the backend to Google Cloud Run

# Set variables
PROJECT_ID=$(gcloud config get-value project)
REGION="us-central1"
SERVICE_NAME="pl-foreigners-legal-api"
BUCKET_NAME="pl-foreigners-legal-advisor"

# Check for OpenAI API key
if [ -z "$OPENAI_API_KEY" ]; then
    echo "Error: OPENAI_API_KEY environment variable is not set"
    echo "Please set it with: export OPENAI_API_KEY=your-key"
    exit 1
fi

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting deployment process for $SERVICE_NAME...${NC}"

# Check if Google Cloud SDK is installed
if ! command -v gcloud &> /dev/null; then
    echo -e "${RED}Error: Google Cloud SDK not found${NC}"
    echo "Please install it from: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Create Google Cloud Storage bucket if it doesn't exist
echo "Checking if bucket $BUCKET_NAME exists..."
if ! gsutil ls -b gs://$BUCKET_NAME &>/dev/null; then
    echo "Creating GCS bucket: $BUCKET_NAME"
    gsutil mb -l $REGION gs://$BUCKET_NAME
else
    echo "Bucket $BUCKET_NAME already exists"
fi

# Create data directory in bucket
echo "Creating data directory in bucket..."
gsutil mb -p gs://$BUCKET_NAME/data/ 2>/dev/null || true

# Copy data files to GCS bucket
echo "Uploading data files to GCS bucket..."
for file in ../query/*.xlsx; do
    if [ -f "$file" ]; then
        filename=$(basename -- "$file")
        echo "Uploading $filename..."
        gsutil cp "$file" gs://$BUCKET_NAME/data/
    fi
done

# Create a temporary build directory
echo "Creating temporary build directory..."
BUILD_DIR=$(mktemp -d)
echo "Build directory: $BUILD_DIR"

# Copy backend files to build directory
echo "Copying backend files..."
cp -r app/ $BUILD_DIR/app/
cp run.py $BUILD_DIR/
cp requirements.txt $BUILD_DIR/
cp Dockerfile $BUILD_DIR/
cp .dockerignore $BUILD_DIR/

# Create query directory in build directory
mkdir -p $BUILD_DIR/query
touch $BUILD_DIR/query/__init__.py

# Copy query files to build directory
echo "Copying query files..."
cp ../query/*.py $BUILD_DIR/query/

# Copy local Excel files to the image to use as fallback
echo "Copying Excel files as fallback..."
mkdir -p $BUILD_DIR/query/data
for file in ../query/*.xlsx; do
    if [ -f "$file" ]; then
        cp "$file" $BUILD_DIR/query/
    fi
done

# Move to build directory
cd $BUILD_DIR

# Build the Docker image
echo "Building Docker image..."
gcloud builds submit --tag gcr.io/$PROJECT_ID/$SERVICE_NAME

# Deploy to Cloud Run
echo "Deploying to Cloud Run..."
gcloud run deploy $SERVICE_NAME \
  --image gcr.io/$PROJECT_ID/$SERVICE_NAME \
  --platform managed \
  --region $REGION \
  --memory 1Gi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 10 \
  --concurrency 80 \
  --allow-unauthenticated \
  --set-env-vars="GCS_BUCKET_NAME=$BUCKET_NAME,OPENAI_API_KEY=$OPENAI_API_KEY,USE_GCS=true"

# Clean up build directory
echo "Cleaning up..."
cd - > /dev/null
rm -rf $BUILD_DIR

# Get the URL of the deployed service
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --platform managed --region $REGION --format 'value(status.url)')

echo -e "${GREEN}Deployment complete!${NC}"
echo -e "Your API is available at: ${GREEN}$SERVICE_URL${NC}"
echo -e "Use this URL in your frontend application by setting REACT_APP_API_BASE_URL in your frontend .env file"
echo -e "Test your API with: curl $SERVICE_URL" 