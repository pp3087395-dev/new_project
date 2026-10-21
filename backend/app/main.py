from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.analysis import router as analysis_router

app = FastAPI(
    title="TruthLens Forensics API",
    description="Backend API for TruthLens — Genuine 2D-FFT and Metadata Media Forensics Engine",
    version="1.0.0"
)

# Configure CORS specifically for local frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes
app.include_router(analysis_router)

@app.get("/")
def root():
    return {
        "message": "Welcome to TruthLens Media Forensics Engine",
        "documentation": "/docs",
        "health": "/api/health",
        "status": "operational"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
