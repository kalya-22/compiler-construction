"""Helper script to run the FastAPI backend server."""
import sys
from pathlib import Path

# Add project root to sys.path
backend_dir = Path(__file__).resolve().parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

import uvicorn

if __name__ == "__main__":
    print("Starting FSM Compiler Preprocessor Backend on http://127.0.0.1:8000")
    print("API Documentation available at: http://127.0.0.1:8000/docs")
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
