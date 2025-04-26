# Polish Law for Foreigners with AI

An intelligent legal assistant that helps foreigners understand Polish law through natural language interactions, powered by advanced AI and RAG (Retrieval Augmented Generation) technology.

## 🎯 Project Goals

This project aims to make Polish legal information more accessible to foreigners by:
- Providing accurate legal information from verified sources
- Offering multi-modal interaction (text, voice, image)
- Creating a user-friendly interface for legal queries
- Ensuring responses are based on current Polish law

## 🚀 Features

### Data Collection & Processing
- Automated web scraping of legal resources
- Content filtering and validation
- Structured data storage in Excel/PDF formats
- Exclusion of unofficial or outdated sources

### RAG System
- Question-answer retrieval system
- Embeddings-based similarity search
- Context-aware response generation
- Source attribution for transparency

### Web Interface
- Real-time chat interface
- Mobile-responsive design
- Conversation history management
- Source reference display

### AI Integration
- OpenAI for text generation and embeddings
- Custom RAG implementation for legal contexts
- Fallback mechanisms for reliability

### Cloud Deployment
- Frontend hosted on Vercel
- Backend deployed on Google Cloud Run
- Firestore for conversation storage
- Google Cloud Storage for data files

## 🛠 Technology Stack

### Frontend
- React.js
- Vercel for hosting

### Backend
- FastAPI
- Google Cloud Run
- Firestore
- Google Cloud Storage

### AI/ML
- OpenAI API
- Custom RAG implementation
- Vector embeddings

## 📋 Project Structure

```
/
├── frontend/              # React frontend application (Vercel)
│   ├── src/               # React source code
│   ├── api/               # Serverless functions for Vercel
│   └── update-backend-url.js  # Script to update backend URL
│
├── backend/               # FastAPI backend application (Google Cloud Run)
│   ├── app/               # FastAPI application code
│   ├── Dockerfile         # Docker configuration for Cloud Run
│   └── deploy.sh          # Deployment script for Google Cloud
│
└── query/                 # RAG implementation
    ├── prepare_rag.py     # RAG system implementation
    └── *.xlsx             # Legal Q&A data files
```

## 🚀 Deployment

### Backend Deployment (Google Cloud Run)

1. Install the Google Cloud SDK:
   ```
   curl https://sdk.cloud.google.com | bash
   gcloud init
   ```

2. Set your OpenAI API key:
   ```
   export OPENAI_API_KEY=your-openai-api-key
   ```

3. Run the deployment script:
   ```
   cd backend
   chmod +x deploy.sh
   ./deploy.sh
   ```

4. Note the Cloud Run URL from the output.

### Frontend Deployment (Vercel)

1. Update the backend URL in the frontend:
   ```
   cd frontend
   node update-backend-url.js YOUR_CLOUD_RUN_URL
   ```

2. Deploy to Vercel:
   ```
   vercel --prod
   ```

For detailed deployment instructions, see the backend/README.md and DEPLOYMENT.md files.

## 🔜 Roadmap

1. **Phase 1: Data Collection & Processing** ✅
   - Enhance web scraping reliability
   - Improve content filtering
   - Expand data sources

2. **Phase 2: RAG System Enhancement** ✅
   - Fine-tune embeddings for legal context
   - Implement better answer generation

3. **Phase 3: Web Interface** ✅
   - Develop React frontend
   - Create Python backend

4. **Phase 4: Cloud Deployment** ✅
   - Frontend on Vercel
   - Backend on Google Cloud Run
   - Firestore for data storage

5. **Phase 5: Future Enhancements**
   - Add voice input/output
   - Enable image-based queries
   - Implement multi-language support

