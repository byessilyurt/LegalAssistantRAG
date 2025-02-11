from prepare_rag import LegalRAG

def main():
    # Initialize the RAG system
    rag = LegalRAG()
    
    print("Polish Legal Assistant (type 'quit' to exit)")
    print("-" * 50)
    
    while True:
        # Get user query
        query = input("\nEnter your question: ")
        
        if query.lower() == 'quit':
            break
        
        # Generate response
        result = rag.generate_response(query)
        
        # Print response
        print("\nAnswer:")
        print(result['answer'])
        print("\nSources:")
        for source in result['sources']:
            print(f"- {source}")
        print("-" * 50)

if __name__ == "__main__":
    main()