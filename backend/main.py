from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from contextlib import asynccontextmanager
from scheduler import start_scheduler, stop_scheduler
from routers import scores, signalements, abonnements, auth, admin, feedbacks, villes
import os

load_dotenv()

@asynccontextmanager
async def lifespan(app: FastAPI):
    start_scheduler()
    yield
    stop_scheduler()

app = FastAPI(
    title="Vigil API",
    description="Système d'alerte précoce aux inondations — Douala",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://vigil-frontend-beige.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(scores.router, prefix="/api/scores", tags=["Scores"])
app.include_router(signalements.router, prefix="/api/signalements", tags=["Signalements"])
app.include_router(abonnements.router, prefix="/api/abonnements", tags=["Abonnements"])
app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])
app.include_router(admin.router, prefix="/api/admin", tags=["Admin"])
app.include_router(feedbacks.router, prefix="/api/feedbacks", tags=["Feedbacks"])
app.include_router(villes.router, prefix="/api/villes", tags=["Villes"])

@app.get("/")
async def root():
    return {
        "app": "Vigil API",
        "status": "online",
        "version": "1.0.0"
    }

@app.get("/health")
async def health():
    return {"status": "healthy"}
