# Beginning of the file - add error handling
import pandas as pd
import numpy as np
from openai import OpenAI
from sklearn.metrics.pairwise import cosine_similarity
import os
import tempfile
import json
import sys
from dotenv import load_dotenv
from google.cloud import storage

# Load environment variables
load_dotenv()

class LegalRAG:
    def __init__(self):
        # Initialize OpenAI client with fallback
        api_key = os.getenv('OPENAI_API_KEY')
        if not api_key:
            print("WARNING: No OpenAI API key found in environment variables")
            api_key = "dummy-key-for-initialization"
        
        self.client = OpenAI(api_key=api_key)
        
        # Initialize Storage client - with error handling
        try:
            self.storage_client = storage.Client()
        except Exception as e:
            print(f"Error initializing storage client: {e}")
            self.storage_client = None
        
        # Set bucket name
        self.bucket_name = os.getenv('GCS_BUCKET_NAME', 'pl-foreigners-legal-advisor')
        
        try:
            # Try to load data
            self.df = self.load_data_from_storage()
            self.documents = self.prepare_documents()
            
            # Cache for embeddings
            self.embeddings = self.load_embeddings_from_storage() or {}
        except Exception as e:
            print(f"Error initializing RAG system: {e}")
            # Create dummy data for initialization
            self.df = pd.DataFrame({
                'Question': ['Sample question'],
                'Answer1': ['Sample answer'],
                'Site1': ['example.com']
            })
            self.documents = []
            self.embeddings = {}
    
    def load_data_from_storage(self):
        """Load data from Google Cloud Storage or local file as fallback."""
        # First try local file as it's more reliable
        local_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'legal_questions_answers.xlsx')
        
        if os.path.exists(local_path):
            print(f"Loading from local file: {local_path}")
            return pd.read_excel(local_path)
            
        # If local file doesn't exist, try cloud storage
        if self.storage_client:
            try:
                print("Trying to load from Cloud Storage...")
                bucket = self.storage_client.bucket(self.bucket_name)
                blob = bucket.blob('data/legal_questions_answers.xlsx')
                
                if blob.exists():
                    # Create a temporary file to download to
                    with tempfile.NamedTemporaryFile(suffix='.xlsx', delete=False) as temp_file:
                        blob.download_to_filename(temp_file.name)
                        temp_filename = temp_file.name
                    
                    # Load data from temp file
                    df = pd.read_excel(temp_filename)
                    
                    # Clean up temp file
                    os.remove(temp_filename)
                    return df
                else:
                    print(f"Blob 'data/legal_questions_answers.xlsx' not found in bucket {self.bucket_name}")
            except Exception as e:
                print(f"Failed to load from Cloud Storage: {e}")
        
        # If we get here, create dummy data
        print("Creating dummy data for initialization")
        return pd.DataFrame({
            'Question': ['Sample question'],
            'Answer1': ['Sample answer'],
            'Site1': ['example.com']
        })

# Rest of your prepare_rag.py file here...
    def __init__(self):
        # Initialize OpenAI client  
        api_key = os.environ.get('OPENAI_API_KEY')
        if not api_key:
            print("WARNING: OPENAI_API_KEY not found in environment!")
        self.client = OpenAI(api_key=api_key)
        
        # Initialize Storage client
        self.storage_client = storage.Client()
        
        # Set bucket name
        self.bucket_name = os.environ.get('GCS_BUCKET_NAME', 'pl-foreigners-legal-advisor')
        
        # Load and prepare the data
        try:
            self.df = self.load_data_from_storage()
            self.documents = self.prepare_documents()
            self.embeddings = {}  # Cache for embeddings
            print(f"Successfully loaded {len(self.documents)} documents from data")
        except Exception as e:
            print(f"ERROR initializing RAG: {e}")
            # Create empty dataframe with expected structure
            self.df = pd.DataFrame({
                'Question': ['What is this?'],
                'Answer1': ['This is a sample answer.'],
                'Site1': ['example.com']
            })
            self.documents = []
            self.embeddings = {}
    
    def load_data_from_storage(self):
        """Load data from Google Cloud Storage or local file as fallback."""
        try:
            # Try to get from cloud storage
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
            print(f"Successfully loaded data from Cloud Storage with {len(df)} rows")
            return df
            
        except Exception as e:
            print(f"Failed to load from Cloud Storage: {e}")
            # Fallback to local file
            try:
                base_dir = os.path.dirname(os.path.abspath(__file__))
                file_path = os.path.join(base_dir, 'legal_questions_answers.xlsx')
                
                # If in development, use local file
                if os.path.exists(file_path):
                    print(f"Loading from local file: {file_path}")
                    return pd.read_excel(file_path)
            except Exception as local_e:
                print(f"Failed to load local file: {local_e}")
            
            # If everything fails, create a simple dataframe
            print("Creating dummy dataframe")
            return pd.DataFrame({
                'Question': ['What is this?'],
                'Answer1': ['This is a sample answer.'],
                'Site1': ['example.com']
            })
    
    def prepare_documents(self):
        """Prepare documents from Excel file."""
        documents = []
        
        for idx, row in self.df.iterrows():
            # Get the question
            question = row['Question']
            
            # Combine answers from all sources
            for i in range(1, 4):
                if pd.notna(row[f'Answer{i}']):
                    doc = {
                        'question': question,
                        'answer': row[f'Answer{i}'],
                        'source': row[f'Site{i}'],
                        'combined_text': f"Question: {question}\nAnswer: {row[f'Answer{i}']}"
                    }
                    documents.append(doc)
        
        return documents
    
    def get_embedding(self, text):
        """Get embedding for a text using OpenAI's embedding model."""
        if text in self.embeddings:
            return self.embeddings[text]
        
        response = self.client.embeddings.create(
            model="text-embedding-3-small",
            input=text
        )
        embedding = response.data[0].embedding
        self.embeddings[text] = embedding
        return embedding
    
    def find_relevant_documents(self, query, top_k=3):
        """Find most relevant documents for a query."""
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
        # Find relevant documents
        relevant_docs = self.find_relevant_documents(query)
        
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
        
        # Generate response using GPT-4
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
