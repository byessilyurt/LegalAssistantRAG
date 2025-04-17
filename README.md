# Polish Law for Foreigners

An interactive web application that helps foreigners understand Polish law by answering questions in any language using AI.

## Project Structure

- **Frontend**: React application with Auth0 authentication
- **Backend**: FastAPI server that handles user authentication and chat functionality

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Create a virtual environment and activate it:
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install the dependencies:
   ```
   pip install -r requirements.txt
   ```

4. Create a `.env` file based on the example:
   ```
   cp .env.example .env
   ```

5. Update the `.env` file with your Auth0 credentials.

6. Run the server:
   ```
   python main.py
   ```
   The API will be available at http://localhost:8000

### Frontend Setup

1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install the dependencies:
   ```
   npm install
   ```

3. Update the Auth0 configuration in `src/auth0-config.js` with your Auth0 credentials.

4. Start the development server:
   ```
   npm start
   ```
   The application will be available at http://localhost:3000

## Auth0 Setup

1. Create an Auth0 account at https://auth0.com/

2. Create a new application of type "Single Page Application"

3. Configure the following settings:
   - Allowed Callback URLs: `http://localhost:3000`
   - Allowed Logout URLs: `http://localhost:3000`
   - Allowed Web Origins: `http://localhost:3000`

4. Create a new API in Auth0:
   - Name: Polish Law for Foreigners API
   - Identifier: `https://api.polishlawforeigner.com`

5. Update the frontend and backend configuration with your Auth0 credentials.

## Features

- User authentication with Auth0
- Multi-language support for questions and answers
- Conversation history
- Source citations for legal information
- Mobile-responsive design

## Tech Stack

- **Frontend**: React, Auth0 React SDK
- **Backend**: FastAPI, JWT authentication
- **Data Storage**: In-memory (Replace with a database in production)

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

