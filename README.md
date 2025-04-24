# Polish Law for Foreigners with AI

An AI-powered application to help foreigners understand Polish legal procedures and requirements.

## Project Structure

- **Frontend**: React application deployed on Vercel
- **Backend**: FastAPI application deployed on Render
- **RAG System**: Retrieval Augmented Generation for answering legal questions

## Deployment Architecture

This project uses a split deployment architecture:

1. **Frontend**: Deployed on Vercel
   - Static site hosting for the React application
   - Environment variables configured in Vercel dashboard

2. **Backend**: Deployed on Render
   - FastAPI application
   - Handles the RAG system for answering legal questions
   - Manages conversations and authentication

## Development Setup

### Backend

```bash
cd backend
pip install -r requirements.txt
cp env.example .env  # Edit with your OpenAI API key
python run.py
```

The backend will be available at http://localhost:8000.

### Frontend

```bash
cd frontend
npm install
cp env.local.example .env.local  # Edit if necessary
npm run dev
```

The frontend will be available at http://localhost:3000.

## Deployment

### Automatic Deployment

The project is configured for automatic deployment using GitHub integration:

1. **Frontend**: Connected to Vercel for automatic deployment on push to the main branch
2. **Backend**: Connected to Render for automatic deployment using the render.yaml file

### Manual Deployment

See the respective README files in the frontend and backend directories for manual deployment instructions:

- [Frontend Deployment](./frontend/README.md)
- [Backend Deployment](./backend/README.md)

## Features

- Question answering about Polish legal system
- User authentication
- Conversation history
- Source citations for legal information
- Multi-language support (Polish/English)

## License

This project is licensed under the MIT License - see the LICENSE file for details.

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

### AI Integration
- AWS Transcribe for voice-to-text
- AWS Recognition for document processing
- OpenAI for text generation
- Custom embeddings for Polish legal context

### Cloud Deployment

## 🛠 Technology Stack

### Frontend
- React.js

### Backend
- FastAPI

### AI/ML
- AWS AI Services
- Custom RAG implementation


## 📋 Project Structure

## 🚧 Current Status

The project currently has:
- Implemented web scraping with content filtering
- Basic RAG system with Gemini Pro integration
- Data processing and translation via api

## 🔜 Roadmap

1. **Phase 1: Data Collection & Processing**
   - Enhance web scraping reliability
   - Improve content filtering
   - Expand data sources

2. **Phase 2: RAG System Enhancement**
   - Fine-tune embeddings for legal context
   - Implement better answer generation

3. **Phase 3: Web Interface**
   - Develop React frontend
   - Create Python backend

4. **Phase 4: AI Integration**
   - Add voice input/output
   - Enable image-based queries

5. **Phase 5: Cloud Deployment**
   - Set up cloud infrastructure
   - Deploy production system

