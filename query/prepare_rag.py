import pandas as pd
import numpy as np
from openai import OpenAI
from sklearn.metrics.pairwise import cosine_similarity
import os
import tempfile
import json
from dotenv import load_dotenv
import logging

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger('legal_rag')

# Load environment variables from .env file if it exists
load_dotenv()

# Check for required environment variables
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
if not OPENAI_API_KEY:
    logger.warning("OPENAI_API_KEY not found in environment variables. RAG functionality will be limited.")

# Check if we're using Google Cloud Storage
USE_GCS = os.getenv('USE_GCS', 'true').lower() == 'true'
GCS_BUCKET_NAME = os.getenv('GCS_BUCKET_NAME', 'pl-foreigners-legal-advisor')

# Import Google Cloud Storage only if we're using it
if USE_GCS:
    try:
        from google.cloud import storage
        storage_client = storage.Client()
    except ImportError:
        logger.warning("google-cloud-storage package not installed. Using local storage only.")
        USE_GCS = False
    except Exception as e:
        logger.warning(f"Error initializing Google Cloud Storage: {e}. Using local storage only.")
        USE_GCS = False

class LegalRAG:
    def __init__(self):
        # Initialize OpenAI client
        if OPENAI_API_KEY:
            self.client = OpenAI(api_key=OPENAI_API_KEY)
        else:
            raise ValueError("OpenAI API key not found. Please set the OPENAI_API_KEY environment variable.")
        
        # Set the bucket name
        self.bucket_name = GCS_BUCKET_NAME
        self.use_gcs = USE_GCS
        
        # Initialize Storage client if using GCS
        if self.use_gcs:
            try:
                self.storage_client = storage_client
                logger.info(f"Using Google Cloud Storage bucket: {self.bucket_name}")
            except NameError:
                self.use_gcs = False
                logger.warning("Storage client not available. Using local storage only.")
        
        # Load and prepare the data
        self.df = self.load_data_from_storage()
        if self.df is None or len(self.df) == 0:
            logger.warning("No data loaded. The RAG system may not work properly.")
            
        self.documents = self.prepare_documents()
        
        # Cache for embeddings
        self.embeddings = {}
        
        # Try to load embeddings from storage
        if self.use_gcs:
            loaded_embeddings = self.load_embeddings_from_storage()
            if loaded_embeddings:
                self.embeddings = loaded_embeddings
                logger.info(f"Loaded {len(self.embeddings)} embeddings from storage")
    
    def load_data_from_storage(self):
        """Load data from Google Cloud Storage or local file as fallback."""
        if self.use_gcs:
            try:
                logger.info("Trying to load data from Google Cloud Storage...")
                bucket = self.storage_client.bucket(self.bucket_name)
                blob = bucket.blob('data/legal_questions_answers.xlsx')
                
                # Create a temporary file to download to
                with tempfile.NamedTemporaryFile(suffix='.xlsx', delete=False) as temp_file:
                    blob.download_to_filename(temp_file.name)
                    temp_filename = temp_file.name
                
                # Load data from temp file
                df = pd.read_excel(temp_filename)
                
                # Clean up temp file
                os.remove(temp_filename)
                logger.info(f"Successfully loaded {len(df)} rows from Cloud Storage")
                return df
                
            except Exception as e:
                logger.error(f"Failed to load from Cloud Storage: {e}")
                # Fall through to local file loading
        
        # Fallback to local file
        try:
            logger.info("Loading from local file...")
            base_dir = os.path.dirname(os.path.abspath(__file__))
            file_path = os.path.join(base_dir, 'legal_questions_answers.xlsx')
            
            # If in development, use local file
            if os.path.exists(file_path):
                logger.info(f"Loading from local file: {file_path}")
                return pd.read_excel(file_path)
            else:
                # Try English version as fallback
                english_file_path = os.path.join(base_dir, 'legal_questions_answers_english.xlsx')
                if os.path.exists(english_file_path):
                    logger.info(f"Loading from English local file: {english_file_path}")
                    return pd.read_excel(english_file_path)
                else:
                    logger.error("Could not find data file locally")
                    return pd.DataFrame()  # Return empty DataFrame instead of raising error
        except Exception as e:
            logger.error(f"Error loading local files: {e}")
            return pd.DataFrame()  # Return empty DataFrame
    
    def load_embeddings_from_storage(self):
        """Load embeddings from Google Cloud Storage if available."""
        if not self.use_gcs:
            return {}
            
        try:
            bucket = self.storage_client.bucket(self.bucket_name)
            blob = bucket.blob('data/embeddings.json')
            
            if blob.exists():
                # Download embeddings file
                with tempfile.NamedTemporaryFile(delete=False) as temp_file:
                    blob.download_to_filename(temp_file.name)
                    temp_filename = temp_file.name
                
                # Load embeddings
                with open(temp_filename, 'r') as f:
                    embeddings_data = json.load(f)
                
                # Clean up
                os.remove(temp_filename)
                
                # Convert keys to strings and values to lists
                return {str(k): list(v) for k, v in embeddings_data.items()}
            return {}
        except Exception as e:
            logger.error(f"Failed to load embeddings: {e}")
            return {}
    
    def save_embeddings_to_storage(self):
        """Save embeddings to Google Cloud Storage."""
        if not self.use_gcs:
            return
            
        try:
            # Convert to JSON serializable format
            embeddings_data = {k: list(v) for k, v in self.embeddings.items()}
            
            # Create a temporary file
            with tempfile.NamedTemporaryFile(mode='w', delete=False) as temp_file:
                json.dump(embeddings_data, temp_file)
                temp_filename = temp_file.name
            
            # Upload to Cloud Storage
            bucket = self.storage_client.bucket(self.bucket_name)
            blob = bucket.blob('data/embeddings.json')
            blob.upload_from_filename(temp_filename)
            
            # Clean up
            os.remove(temp_filename)
            logger.info("Embeddings saved to Cloud Storage")
        except Exception as e:
            logger.error(f"Failed to save embeddings: {e}")
        
    def prepare_documents(self):
        """Prepare documents from Excel file."""
        if self.df is None or self.df.empty:
            return []
            
        documents = []
        
        for idx, row in self.df.iterrows():
            # Get the question
            question = row['Question']
            
            # Combine answers from all sources
            for i in range(1, 4):
                try:
                    if pd.notna(row.get(f'Answer{i}')):
                        doc = {
                            'question': question,
                            'answer': row[f'Answer{i}'],
                            'source': row.get(f'Site{i}', 'Unknown'),
                            'combined_text': f"Question: {question}\nAnswer: {row[f'Answer{i}']}"
                        }
                        documents.append(doc)
                except (KeyError, TypeError) as e:
                    logger.warning(f"Error processing row {idx}, answer {i}: {e}")
        
        logger.info(f"Prepared {len(documents)} documents")
        return documents
    
    def get_embedding(self, text):
        """Get embedding for a text using OpenAI's embedding model."""
        if text in self.embeddings:
            return self.embeddings[text]
        
        try:
            response = self.client.embeddings.create(
                model="text-embedding-3-small",
                input=text
            )
            embedding = response.data[0].embedding
            self.embeddings[text] = embedding
            
            # Periodically save embeddings (every 10 new embeddings)
            if self.use_gcs and len(self.embeddings) % 10 == 0:
                self.save_embeddings_to_storage()
                
            return embedding
        except Exception as e:
            logger.error(f"Error getting embedding: {e}")
            # Return a random embedding for graceful degradation
            return [0.0] * 1536  # Default embedding dimension
    
    def find_relevant_documents(self, query, top_k=3):
        """Find most relevant documents for a query."""
        if not self.documents:
            logger.warning("No documents available for search")
            return []
            
        query_embedding = self.get_embedding(query)
        
        # Get embeddings for all documents
        doc_embeddings = [self.get_embedding(doc['combined_text']) 
                         for doc in self.documents]
        
        # Calculate similarities
        similarities = cosine_similarity(
            [query_embedding],
            doc_embeddings
        )[0]
        
        # Get top-k most similar documents
        top_indices = np.argsort(similarities)[-top_k:][::-1]
        return [self.documents[i] for i in top_indices]
    
    def generate_response(self, query):
        """Generate a response using RAG."""
        try:
            # Find relevant documents
            relevant_docs = self.find_relevant_documents(query)
            
            if not relevant_docs:
                return {
                    'answer': "I'm sorry, but I don't have enough information in my database to answer your question accurately. Please try a different question or contact a legal advisor for assistance.",
                    'sources': []
                }
            
            # Prepare context from relevant documents
            context = "\n\n".join([
                f"Source: {doc['source']}\n{doc['answer']}" 
                for doc in relevant_docs
            ])
            
            # Create prompt for GPT
            prompt = f"""Based on the following context, answer the question. 
            If the context doesn't contain relevant information, say so.
            
            Context:
            {context}
            
            Question: {query}
            
            Answer:"""
            
            # Generate response using GPT-3.5-turbo
            response = self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are a helpful legal assistant specializing in Polish law. Provide accurate, clear answers based on the given context."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7
            )
            
            return {
                'answer': response.choices[0].message.content,
                'sources': [doc['source'] for doc in relevant_docs]
            }
        except Exception as e:
            logger.error(f"Error generating response: {e}")
            return {
                'answer': "I'm sorry, I encountered an error while processing your request. Please try again later.",
                'sources': []
            }
