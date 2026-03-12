import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = FastAPI(title="Kred API", version="2.0.0", redirect_slashes=False)

# Configure CORS — reads additional origins from ALLOWED_ORIGINS env var (comma-separated)
_extra_origins = [o.strip() for o in os.environ.get("ALLOWED_ORIGINS", "").split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"] + _extra_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from routers import ingest, research, recommendation, ancillary, report

@app.on_event("startup")
async def startup_event():
    """Pre-warm the ML model on startup to eliminate first-request latency."""
    try:
        from services.ml_model import credit_model
        _ = credit_model.predict_credit_score({})
        print("[STARTUP] ML model pre-warmed successfully")
    except Exception as e:
        print(f"[STARTUP] ML model pre-warm failed (non-fatal): {e}")

app.include_router(ingest.router)
app.include_router(research.router)
app.include_router(recommendation.router)
app.include_router(ancillary.router)
app.include_router(report.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to Kred API"}

@app.get("/api/health")
def health_check():
    has_token = bool(os.environ.get("GITHUB_TOKEN"))
    return {
        "status": "healthy",
        "llm_token_configured": has_token,
        "models": {
            "reasoning": "microsoft/Phi-4-mini-reasoning",
            "analysis": "mistral-ai/Ministral-3B"
        }
    }
