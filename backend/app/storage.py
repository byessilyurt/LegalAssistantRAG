import os
import json
import uuid
import logging
from datetime import datetime
from typing import Dict, List, Optional, Any

# Setup logging
logger = logging.getLogger(__name__)

# Environment variables
USE_GCS = os.getenv('USE_GCS', 'true').lower() == 'true'
BUCKET_NAME = os.getenv("GCS_BUCKET_NAME", "pl-foreigners-legal-advisor")

# Initialize storage based on environment
if USE_GCS:
    try:
        from google.cloud import storage
        from google.cloud import firestore
        
        # Initialize clients
        try:
            db = firestore.Client()
            storage_client = storage.Client()
            logger.info("Google Cloud clients initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize Google Cloud clients: {e}")
            # Fall back to in-memory storage
            USE_GCS = False
    except ImportError:
        logger.warning("Google Cloud libraries not installed. Using in-memory storage.")
        USE_GCS = False

# In-memory fallback storage
if not USE_GCS:
    logger.warning("Using in-memory storage instead of Firestore")
    in_memory_conversations = {}

def get_or_create_bucket():
    """Get or create the Cloud Storage bucket"""
    if not USE_GCS:
        return None
        
    try:
        bucket = storage_client.get_bucket(BUCKET_NAME)
        return bucket
    except Exception as e:
        logger.error(f"Error accessing bucket: {e}")
        try:
            # Create bucket if it doesn't exist
            bucket = storage_client.create_bucket(BUCKET_NAME)
            return bucket
        except Exception as e:
            logger.error(f"Failed to create bucket: {e}")
            return None

# Conversation storage functions
def save_conversation(user_id: str, conversation_id: str, conversation_data: Dict[str, Any]) -> None:
    """Save a conversation to Firestore or memory"""
    # Update the timestamp
    conversation_data["updated_at"] = datetime.now()
    
    if USE_GCS:
        try:
            # Convert any non-serializable objects to strings
            serializable_data = json.loads(json.dumps(conversation_data, default=str))
            
            # Save to Firestore
            doc_ref = db.collection('conversations').document(f"{user_id}_{conversation_id}")
            doc_ref.set(serializable_data)
            logger.debug(f"Saved conversation {conversation_id} to Firestore")
        except Exception as e:
            logger.error(f"Error saving to Firestore: {e}")
            # Fallback to in-memory
            if user_id not in in_memory_conversations:
                in_memory_conversations[user_id] = {}
            in_memory_conversations[user_id][conversation_id] = conversation_data
    else:
        # Use in-memory storage
        if user_id not in in_memory_conversations:
            in_memory_conversations[user_id] = {}
        in_memory_conversations[user_id][conversation_id] = conversation_data
        logger.debug(f"Saved conversation {conversation_id} to memory")

def get_conversation(user_id: str, conversation_id: str) -> Optional[Dict[str, Any]]:
    """Get a conversation from Firestore or memory"""
    if USE_GCS:
        try:
            doc_ref = db.collection('conversations').document(f"{user_id}_{conversation_id}")
            doc = doc_ref.get()
            if doc.exists:
                return doc.to_dict()
            return None
        except Exception as e:
            logger.error(f"Error getting conversation from Firestore: {e}")
            # Fallback to in-memory
            return in_memory_conversations.get(user_id, {}).get(conversation_id)
    else:
        # Use in-memory storage
        return in_memory_conversations.get(user_id, {}).get(conversation_id)

def get_user_conversations(user_id: str) -> List[Dict[str, Any]]:
    """Get all conversations for a user"""
    if USE_GCS:
        try:
            conversations = []
            query = db.collection('conversations').where('user_id', '==', user_id)
            docs = query.get()
            
            for doc in docs:
                conversations.append(doc.to_dict())
            
            return conversations
        except Exception as e:
            logger.error(f"Error getting conversations from Firestore: {e}")
            # Fallback to in-memory
            return list(in_memory_conversations.get(user_id, {}).values())
    else:
        # Use in-memory storage
        return list(in_memory_conversations.get(user_id, {}).values())

def delete_conversation(user_id: str, conversation_id: str) -> None:
    """Delete a conversation"""
    if USE_GCS:
        try:
            doc_ref = db.collection('conversations').document(f"{user_id}_{conversation_id}")
            doc_ref.delete()
        except Exception as e:
            logger.error(f"Error deleting conversation from Firestore: {e}")
            # Also try to delete from in-memory if it exists
            if user_id in in_memory_conversations and conversation_id in in_memory_conversations[user_id]:
                del in_memory_conversations[user_id][conversation_id]
    else:
        # Use in-memory storage
        if user_id in in_memory_conversations and conversation_id in in_memory_conversations[user_id]:
            del in_memory_conversations[user_id][conversation_id]

# File storage functions
def upload_file(file_path: str, destination_blob_name: Optional[str] = None) -> str:
    """
    Upload a file to Google Cloud Storage
    Returns the public URL for the file
    """
    if not USE_GCS:
        logger.warning("Cloud Storage not available for file upload")
        return ""
        
    bucket = get_or_create_bucket()
    if not bucket:
        return ""
    
    try:
        if destination_blob_name is None:
            # Generate a unique name based on the file name
            file_name = os.path.basename(file_path)
            destination_blob_name = f"{uuid.uuid4()}_{file_name}"
        
        blob = bucket.blob(destination_blob_name)
        blob.upload_from_filename(file_path)
        
        # Make the blob publicly readable
        blob.make_public()
        
        return blob.public_url
    except Exception as e:
        logger.error(f"Error uploading file: {e}")
        return ""

def download_file(source_blob_name: str, destination_file_path: str) -> bool:
    """Download a file from Google Cloud Storage"""
    if not USE_GCS:
        logger.warning("Cloud Storage not available for file download")
        return False
        
    bucket = get_or_create_bucket()
    if not bucket:
        return False
        
    try:
        blob = bucket.blob(source_blob_name)
        blob.download_to_filename(destination_file_path)
        return True
    except Exception as e:
        logger.error(f"Error downloading file: {e}")
        return False

def delete_file(blob_name: str) -> bool:
    """Delete a file from Google Cloud Storage"""
    if not USE_GCS:
        logger.warning("Cloud Storage not available for file deletion")
        return False
        
    bucket = get_or_create_bucket()
    if not bucket:
        return False
        
    try:
        blob = bucket.blob(blob_name)
        blob.delete()
        return True
    except Exception as e:
        logger.error(f"Error deleting file: {e}")
        return False 