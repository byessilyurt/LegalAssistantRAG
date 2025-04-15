from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import sys
import os
from pathlib import Path
from typing import List, Optional
from datetime import datetime
import uuid

# Add the query directory to the path so we can import from it
sys.path.append(str(Path(__file__).parent.parent.parent / "query"))

try:
    from prepare_rag import LegalRAG
except ImportError as e:
    print(f"Error importing LegalRAG: {e}")
    sys.exit(1)

# Initialize the FastAPI app
app = FastAPI(
    title="Polish Law for Foreigners Chat API",
    description="Chat API for the Polish Law RAG system",
    version="1.0.0"
)

# Add CORS middleware to allow requests from the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize the RAG system
rag = LegalRAG()

# In-memory storage for conversations
# In a production app, you would use a database
conversations = {}

# Models
class Message(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    role: str  # "user" or "assistant"
    content: str
    timestamp: datetime = Field(default_factory=datetime.now)

class Conversation(BaseModel):
    id: str
    messages: List[Message] = []
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)

class MessageRequest(BaseModel):
    conversation_id: Optional[str] = None
    message: str

class MessageResponse(BaseModel):
    conversation_id: str
    message: Message
    sources: List[str] = []

@app.get("/")
async def read_root():
    return {"message": "Polish Law for Foreigners Chat API is running"}

@app.get("/api/conversations", response_model=List[Conversation])
async def get_conversations():
    """Get all conversations"""
    return list(conversations.values())

@app.get("/api/conversations/{conversation_id}", response_model=Conversation)
async def get_conversation(conversation_id: str):
    """Get a specific conversation by ID"""
    if conversation_id not in conversations:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return conversations[conversation_id]

@app.post("/api/chat", response_model=MessageResponse)
async def send_message(request: MessageRequest):
    """Send a message and get a response"""
    try:
        # Get or create conversation
        conversation_id = request.conversation_id
        if not conversation_id or conversation_id not in conversations:
            conversation_id = str(uuid.uuid4())
            conversations[conversation_id] = Conversation(id=conversation_id)
        
        conversation = conversations[conversation_id]
        
        # Add user message to conversation
        user_message = Message(role="user", content=request.message)
        conversation.messages.append(user_message)
        
        # Build conversation history for context
        conversation_history = "\n".join([
            f"{msg.role}: {msg.content}" 
            for msg in conversation.messages[-10:]  # Get last 10 messages for context
        ])
        
        # Generate response using RAG with conversation context
        result = rag.generate_response(
            f"Conversation history:\n{conversation_history}\n\nCurrent question: {request.message}"
        )
        
        # Create assistant message
        assistant_message = Message(
            role="assistant", 
            content=result["answer"]
        )
        
        # Add to conversation
        conversation.messages.append(assistant_message)
        
        # Update conversation timestamp
        conversation.updated_at = datetime.now()
        
        return {
            "conversation_id": conversation_id,
            "message": assistant_message,
            "sources": result["sources"]
        }
        
    except Exception as e:
        print(f"Error processing message: {e}")
        raise HTTPException(status_code=500, detail=f"Error processing your message: {str(e)}")

@app.delete("/api/conversations/{conversation_id}")
async def delete_conversation(conversation_id: str):
    """Delete a conversation"""
    if conversation_id not in conversations:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    del conversations[conversation_id]
    return {"status": "success", "message": "Conversation deleted"} 