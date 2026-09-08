from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import engine, Base
from app.routers import auth, patients, medications, patient_app, dashboard, audit, alerts

# Create database tables cleanly on startup (0 seed data)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="StayMeds - Hospital Medication Reminder and Tracking API"
)

# Configure CORS for Vercel production deployment and local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://staymeds-app.vercel.app",
        "https://localhost",
        "capacitor://localhost",
        "http://localhost",
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
    ],
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(patients.router, prefix=settings.API_V1_STR)
app.include_router(medications.router, prefix=settings.API_V1_STR)
app.include_router(patient_app.router, prefix=settings.API_V1_STR)
app.include_router(dashboard.router, prefix=settings.API_V1_STR)
app.include_router(audit.router, prefix=settings.API_V1_STR)
app.include_router(alerts.router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {
        "message": "Welcome to StayMeds Medication Tracking API",
        "docs": "/docs",
        "version": settings.VERSION
    }
