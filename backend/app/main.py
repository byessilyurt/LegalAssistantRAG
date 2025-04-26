from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import sys
import os
from pathlib import Path
from typing import List, Optional, Dict
from datetime import datetime
import uuid
import jwt

# Auth imports
from .auth import get_current_user, get_optional_user, User, VerifyTokenError
from .auth_error import AuthError
from .storage import save_conversation, get_conversation, get_user_conversations, delete_conversation

# Import the query module - using absolute imports
try:
    from query.prepare_rag import LegalRAG
except ImportError as e:
    print(f"Error importing LegalRAG: {e}")
    # Try relative import if absolute fails
    try:
        sys.path.append(str(Path(__file__).parent.parent.parent))
        from query.prepare_rag import LegalRAG
    except ImportError as e:
        print(f"Error importing LegalRAG with relative path: {e}")
        sys.exit(1)

# Initialize the FastAPI app
app = FastAPI(
    title="Polish Law for Foreigners Chat API",
    description="Chat API for the Polish Law RAG system",
    version="1.0.0"
)

# Register exception handlers for Auth0 errors
app.add_exception_handler(jwt.exceptions.ExpiredSignatureError, AuthError.token_expired)
app.add_exception_handler(jwt.exceptions.InvalidSignatureError, AuthError.invalid_signature)
app.add_exception_handler(jwt.exceptions.InvalidTokenError, AuthError.invalid_token)
app.add_exception_handler(VerifyTokenError, AuthError.invalid_token)

# Add CORS middleware to allow requests from the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000", 
        "http://localhost:5173",
        "https://pl-for-foreigners-with-ai.vercel.app", # Add your Vercel deployed frontend URL
        "*"  # For development - remove in production
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["Content-Type", "Authorization", "Accept"],
)

# Initialize the RAG system with error handling
try:
    rag = LegalRAG()
    print("RAG system initialized successfully")
except Exception as e:
    print(f"Error initializing RAG system: {e}")
    rag = None

# Models
class Message(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    role: str  # "user" or "assistant"
    content: str
    timestamp: datetime = Field(default_factory=datetime.now)

class Conversation(BaseModel):
    id: str
    user_id: str
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

class UserProfile(BaseModel):
    id: str
    email: Optional[str] = None
    name: Optional[str] = None
    picture: Optional[str] = None

@app.get("/")
async def read_root():
    if rag is None:
        return {"message": "Polish Law for Foreigners Chat API is running, but RAG system failed to initialize"}
    return {"message": "Polish Law for Foreigners Chat API is running"}

@app.get("/api/me", response_model=UserProfile)
async def get_user_profile(user: User = Depends(get_current_user)):
    """Get the current user's profile"""
    return UserProfile(
        id=user.id,
        email=user.email,
        name=user.name,
        picture=user.picture
    )

@app.get("/api/conversations", response_model=List[Conversation])
async def get_conversations(user: User = Depends(get_current_user)):
    """Get all conversations for the current user"""
    return get_user_conversations(user.id)

@app.get("/api/conversations/{conversation_id}", response_model=Conversation)
async def get_conversation_endpoint(conversation_id: str, user: User = Depends(get_current_user)):
    """Get a specific conversation by ID"""
    conversation = get_conversation(user.id, conversation_id)
    
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    return conversation

@app.post("/api/chat", response_model=MessageResponse)
async def send_message(request: MessageRequest, user: Optional[User] = Depends(get_optional_user)):
    """Send a message and get a response"""
    try:
        if rag is None:
            raise HTTPException(status_code=500, detail="RAG system is not available. Please check server logs.")
            
        user_id = user.id if user else "anonymous"
        
        # Get or create conversation
        conversation_id = request.conversation_id
        conversation = None
        
        if conversation_id:
            conversation = get_conversation(user_id, conversation_id)
        
        if not conversation:
            # Create new conversation
            conversation_id = str(uuid.uuid4())
            conversation = Conversation(id=conversation_id, user_id=user_id)
        
        # Add user message to conversation
        user_message = Message(role="user", content=request.message)
        
        if not conversation.get('messages'):
            conversation['messages'] = []
            
        conversation['messages'].append(user_message.dict())
        
        # Build conversation history for context
        messages = conversation.get('messages', [])
        conversation_history = "\n".join([
            f"{msg['role']}: {msg['content']}" 
            for msg in messages[-10:]  # Get last 10 messages for context
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
        conversation['messages'].append(assistant_message.dict())
        
        # Update conversation timestamp
        conversation['updated_at'] = datetime.now().isoformat()
        
        # Save conversation
        save_conversation(user_id, conversation_id, conversation)
        
        return {
            "conversation_id": conversation_id,
            "message": assistant_message,
            "sources": result.get("sources", [])
        }
        
    except Exception as e:
        print(f"Error processing message: {e}")
        raise HTTPException(status_code=500, detail=f"Error processing your message: {str(e)}")

@app.delete("/api/conversations/{conversation_id}")
async def delete_conversation_endpoint(conversation_id: str, user: User = Depends(get_current_user)):
    """Delete a conversation"""
    conversation = get_conversation(user.id, conversation_id)
    
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    delete_conversation(user.id, conversation_id)
    return {"status": "success", "message": "Conversation deleted"} 