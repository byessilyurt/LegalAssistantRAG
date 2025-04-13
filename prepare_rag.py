import pandas as pd
import numpy as np
from openai import OpenAI
from sklearn.metrics.pairwise import cosine_similarity
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class LegalRAG:
    def __init__(self):
        # Initialize OpenAI client
        self.client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))
        
        # Load and prepare the data
        self.df = pd.read_excel('legal_questions_answers.xlsx')
        self.documents = self.prepare_documents()
        self.embeddings = {}  # Cache for embeddings
        
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
