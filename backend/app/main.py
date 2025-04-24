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

# Add the query directory to the path so we can import from it
# Try multiple potential locations for the query directory
query_paths = [
    Path(__file__).parent.parent.parent / "query",  # Original location: /project/query
    Path(__file__).parent.parent / "query",         # Deployment location: /project/backend/query
]

query_path_found = False
for query_path in query_paths:
    if query_path.exists():
        sys.path.append(str(query_path))
        print(f"Found query directory at: {query_path}")
        query_path_found = True
        break

if not query_path_found:
    print("Error: Could not find query directory")
    sys.exit(1)

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
        "https://polishlegalassistantfrontend.vercel.app/",
        ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["Content-Type", "Authorization", "Accept"],
)

# Initialize the RAG system
rag = LegalRAG()

# In-memory storage for conversations
# In a production app, you would use a database
conversations: Dict[str, Dict] = {}  # user_id -> conversation_id -> conversation

# Models
class Message(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    role: str  # "user" or "assistant"
    content: str
    timestamp: datetime = Field(default_factory=datetime.now)

class Conversation(BaseModel):
    id: str
    user_id: str  # Added user_id field
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
    user_conversations = conversations.get(user.id, {})
    return list(user_conversations.values())

@app.get("/api/conversations/{conversation_id}", response_model=Conversation)
async def get_conversation(conversation_id: str, user: User = Depends(get_current_user)):
    """Get a specific conversation by ID"""
    user_conversations = conversations.get(user.id, {})
    
    if conversation_id not in user_conversations:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    return user_conversations[conversation_id]

@app.post("/api/chat", response_model=MessageResponse)
async def send_message(request: MessageRequest, user: Optional[User] = Depends(get_optional_user)):
    """Send a message and get a response"""
    try:
        user_id = user.id if user else "anonymous"
        
        # Initialize user's conversations dict if it doesn't exist
        if user_id not in conversations:
            conversations[user_id] = {}
        
        # Get or create conversation
        conversation_id = request.conversation_id
        user_conversations = conversations[user_id]
        
        if not conversation_id or conversation_id not in user_conversations:
            conversation_id = str(uuid.uuid4())
            user_conversations[conversation_id] = Conversation(id=conversation_id, user_id=user_id)
        
        conversation = user_conversations[conversation_id]
        
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
            "sources": result.get("sources", [])
        }
        
    except Exception as e:
        print(f"Error processing message: {e}")
        raise HTTPException(status_code=500, detail=f"Error processing your message: {str(e)}")

@app.delete("/api/conversations/{conversation_id}")
async def delete_conversation(conversation_id: str, user: User = Depends(get_current_user)):
    """Delete a conversation"""
    user_conversations = conversations.get(user.id, {})
    
    if conversation_id not in user_conversations:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    del user_conversations[conversation_id]
    return {"status": "success", "message": "Conversation deleted"} 