#!/usr/bin/env python
"""
This script ensures that all necessary data files for the RAG system are present.
It's run during deployment to check and copy files if needed.
"""

import os
import sys
from pathlib import Path
import shutil

def main():
    print("Checking for necessary RAG data files...")
    
    # Define locations
    backend_dir = Path(__file__).parent
    project_root = backend_dir.parent
    
    # Original data locations
    original_query_dir = project_root / "query"
    
    # Deployment locations
    deployment_query_dir = backend_dir / "query"
    
    # Create query directory if it doesn't exist
    os.makedirs(deployment_query_dir, exist_ok=True)
    
    # List of required data files
    required_files = [
        "legal_questions_answers.xlsx",
        "legal_questions_answers_english.xlsx",
        "POL_legal_questions.xlsx",
        "dolnoslaskie_legal_questions_polish.xlsx",
        "prepare_rag.py",
        "query_rag.py",
        "retrieveAnswers.py",
        "utils.py"
    ]
    
    # Check and copy each required file
    for filename in required_files:
        source_file = original_query_dir / filename
        dest_file = deployment_query_dir / filename
        
        # Skip if file already exists at destination
        if dest_file.exists():
            print(f"✓ {filename} already exists in deployment location")
            continue
        
        # Try to copy from original location
        if source_file.exists():
            print(f"Copying {filename} to deployment location...")
            shutil.copy2(source_file, dest_file)
            print(f"✓ Copied {filename}")
        else:
            print(f"⚠ Warning: Could not find {filename} at {source_file}")
    
    print("File check and copy complete!")

if __name__ == "__main__":
    main() 