from fastapi import FastAPI, Depends, HTTPException, status, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from datetime import datetime
import uuid
from app.auth import get_current_user
import os
from dotenv import load_dotenv
import json

# Load environment variables
load_dotenv()

app = FastAPI(title="Polish Law for Foreigners API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins in development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Models for the API
class Message(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    role: str
    content: str
    timestamp: str = Field(default_factory=lambda: datetime.now().isoformat())
    sources: List[str] = []

class Conversation(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    messages: List[Message] = []
    created_at: str = Field(default_factory=lambda: datetime.now().isoformat())
    updated_at: str = Field(default_factory=lambda: datetime.now().isoformat())

class ChatRequest(BaseModel):
    message: str
    conversation_id: Optional[str] = None

class ChatResponse(BaseModel):
    message: Message
    conversation_id: str
    sources: List[str] = []

# In-memory storage (replace with a database in production)
conversations: Dict[str, Conversation] = {}

# Helper function to get conversation by ID
def get_conversation(conversation_id: str, user_id: str) -> Conversation:
    if conversation_id not in conversations:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    conversation = conversations[conversation_id]
    
    # Check if the conversation belongs to the user
    if conversation.user_id != user_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    return conversation

# Function to generate response (replace with actual AI model call)
async def generate_response(message: str) -> dict:
    # This is a placeholder - in production you would call your actual AI model
    import time
    time.sleep(1)  # Simulate processing time
    
    # Example response - replace with actual AI model response
    response = {
        "content": f"This is a sample response to: {message}\n\nIn Poland, legal questions related to this topic would typically be addressed under the relevant statutes. For more information, you can check the official sources below.",
        "sources": [
            "https://isap.sejm.gov.pl/",
            "https://www.gov.pl/web/gov/uslugi-dla-obywatela"
        ]
    }
    
    return response

@app.get("/")
async def root():
    return {"message": "Welcome to the Polish Law for Foreigners API"}

@app.get("/api/conversations", response_model=List[Conversation])
async def list_conversations(user: Dict[str, Any] = Depends(get_current_user)):
    user_id = user["sub"]
    
    # Filter conversations for the current user
    user_conversations = [
        conv for conv in conversations.values() 
        if conv.user_id == user_id
    ]
    
    # Sort by updated_at in descending order (newest first)
    user_conversations.sort(
        key=lambda x: x.updated_at, 
        reverse=True
    )
    
    return user_conversations

@app.get("/api/conversations/{conversation_id}", response_model=Conversation)
async def get_conversation_by_id(
    conversation_id: str,
    user: Dict[str, Any] = Depends(get_current_user)
):
    user_id = user["sub"]
    return get_conversation(conversation_id, user_id)

@app.delete("/api/conversations/{conversation_id}")
async def delete_conversation(
    conversation_id: str,
    user: Dict[str, Any] = Depends(get_current_user)
):
    user_id = user["sub"]
    # Check if conversation exists and belongs to user
    get_conversation(conversation_id, user_id)
    
    # Delete the conversation
    del conversations[conversation_id]
    
    return {"message": "Conversation deleted successfully"}

@app.post("/api/chat", response_model=ChatResponse)
async def chat(
    request: ChatRequest,
    user: Dict[str, Any] = Depends(get_current_user)
):
    user_id = user["sub"]
    conversation_id = request.conversation_id
    
    # Get or create conversation
    if conversation_id:
        conversation = get_conversation(conversation_id, user_id)
    else:
        # Create a new conversation
        conversation = Conversation(user_id=user_id)
        conversation_id = conversation.id
        conversations[conversation_id] = conversation
    
    # Add user message to the conversation
    user_message = Message(
        role="user",
        content=request.message
    )
    conversation.messages.append(user_message)
    
    # Generate AI response
    ai_response = await generate_response(request.message)
    
    # Create assistant message
    assistant_message = Message(
        role="assistant",
        content=ai_response["content"],
        sources=ai_response["sources"]
    )
    
    # Add assistant message to the conversation
    conversation.messages.append(assistant_message)
    
    # Update conversation timestamp
    conversation.updated_at = datetime.now().isoformat()
    
    # Return the response
    return ChatResponse(
        message=assistant_message,
        conversation_id=conversation_id,
        sources=ai_response["sources"]
    )

# Load sample conversations for development (remove in production)
def load_sample_conversations():
    try:
        # Create a sample user conversation
        sample_conversation = Conversation(
            id="sample-conversation-id",
            user_id="auth0|123456789",
            messages=[
                Message(
                    id="msg1",
                    role="user",
                    content="What are the requirements for a work permit in Poland?",
                    timestamp="2023-06-01T10:00:00.000Z"
                ),
                Message(
                    id="msg2",
                    role="assistant",
                    content="To obtain a work permit in Poland, you generally need:\n\n1. An employer who wants to hire you\n2. A valid passport\n3. Completed application forms\n4. Proof of qualifications\n5. Medical insurance\n\nThe process involves both the employer and the foreign worker. The employer must first apply for a work permit at the local voivodeship office.",
                    timestamp="2023-06-01T10:00:05.000Z",
                    sources=["https://www.gov.pl/web/gov/work-permit-for-a-foreigner"]
                )
            ],
            created_at="2023-06-01T10:00:00.000Z",
            updated_at="2023-06-01T10:00:05.000Z"
        )
        conversations[sample_conversation.id] = sample_conversation
    except Exception as e:
        print(f"Error loading sample conversations: {e}")

# Uncomment for development with sample data
# load_sample_conversations()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True) 