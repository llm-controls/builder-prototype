"""Main application module."""

import os
import logging
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Import routers - use absolute imports instead of relative
try:
    from src.backend.LLMcontrols.api.router import router as api_router
except ImportError:
    # Alternative import path if the above fails
    import sys
    sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))
    from backend.LLMcontrols.api.router import router as api_router

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

def create_app() -> FastAPI:
    """Create the FastAPI app and configure middleware and routers."""
    app = FastAPI(
        title="LLMcontrols",
        description="API for LLMcontrols - A visual workflow builder for LangChain",
        version="0.1.0"
    )

    # Configure CORS
    origins = [
        "http://localhost:3000",  # React frontend
        "http://127.0.0.1:3000",
        "*",  # For development
    ]

    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Include routers
    app.include_router(api_router, prefix="/api")

    @app.get("/")
    async def root():
        """Root endpoint."""
        return {
            "message": "Welcome to LLMcontrols API",
            "documentation": "/docs",
            "redoc": "/redoc"
        }

    return app

app = create_app()

if __name__ == "__main__":
    # Get host and port from environment variables or use defaults
    host = os.getenv("BACKEND_HOST", "0.0.0.0")
    port = int(os.getenv("BACKEND_PORT", "8000"))
    
    logger.info(f"Starting LLMcontrols API on {host}:{port}")
    uvicorn.run(app, host=host, port=port) 