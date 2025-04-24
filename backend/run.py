import uvicorn
import os
import sys
from dotenv import load_dotenv
from pathlib import Path

# Load environment variables from .env file
load_dotenv()

# Run the file check script
try:
    script_dir = Path(__file__).parent
    ensure_files_script = script_dir / "ensure_files.py"
    
    if ensure_files_script.exists():
        print("Running file check script...")
        # Execute the script in the current process
        exec(open(ensure_files_script).read())
    else:
        print("Warning: ensure_files.py script not found")
except Exception as e:
    print(f"Error running file check script: {e}")

if __name__ == "__main__":
    # Get port from environment or use default
    port = int(os.getenv("PORT", 8000))
    
    # Run the server
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=port,
        reload=True
    )
    
    print(f"Server running at http://localhost:{port}") 