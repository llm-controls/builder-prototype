"""Entry point script to run the backend server."""

import os
import sys
import uvicorn

# Get the directory of this script
script_dir = os.path.dirname(os.path.abspath(__file__))

# Add the project root to the Python path (go up one directory from backend)
project_root = os.path.abspath(os.path.join(script_dir, '..'))
sys.path.insert(0, project_root)

# Import the app
from backend.LLMcontrols.main import app

if __name__ == "__main__":
    # Get host and port from environment variables or use defaults
    host = os.getenv("BACKEND_HOST", "0.0.0.0")
    port = int(os.getenv("BACKEND_PORT", "8000"))
    
    print(f"Starting LLMcontrols API on {host}:{port}")
    print(f"API docs available at: http://{host if host != '0.0.0.0' else 'localhost'}:{port}/docs")
    uvicorn.run(app, host=host, port=port) 