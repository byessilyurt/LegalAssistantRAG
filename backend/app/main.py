from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import sys
import os
from pathlib import Path

# Add the query directory to the path so we can import from it
sys.path.append(str(Path(__file__).parent.parent.parent / "query"))

try:
    from prepare_rag import LegalRAG
except ImportError as e:
    print(f"Error importing LegalRAG: {e}")
    sys.exit(1)

# Initialize the FastAPI app
app = FastAPI(
    title="Polish Law for Foreigners API",
    description="API for querying the Polish Law RAG system",
    version="1.0.0"
)

# Add CORS middleware to allow requests from the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],  # React dev servers
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize the RAG system
rag = LegalRAG()

# Define request model
class QuestionRequest(BaseModel):
    question: str

# Define response model
class AnswerResponse(BaseModel):
    answer: str
    sources: list[str]

@app.get("/")
async def read_root():
    return {"message": "Polish Law for Foreigners API is running"}

@app.post("/api/ask", response_model=AnswerResponse)
async def ask_question(request: QuestionRequest):
    try:
        if not request.question.strip():
            raise HTTPException(status_code=400, detail="Question cannot be empty")
        
        # Call the RAG system to generate a response
        result = rag.generate_response(request.question)
        
        return result
    except Exception as e:
        print(f"Error processing question: {e}")
        raise HTTPException(status_code=500, detail=f"Error processing your question: {str(e)}") 