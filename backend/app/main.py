"""
PahamKode Backend API
FastAPI application untuk analisis semantik error pemrograman

Core Objectives:
1. Semantic Error Analysis - Analisis konseptual MENGAPA error terjadi
2. Pattern Mining - Identifikasi pola kesalahan berulang
3. Adaptive Explanation - Penjelasan sesuai Bloom's Taxonomy
4. Personalized Learning - Rekomendasi pembelajaran personal
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import sambungkan_database, putuskan_database
from app.routes import auth, analyze, history, patterns, admin, mahasiswa, exercise

# Inisialisasi FastAPI app
app = FastAPI(
    title="PahamKode API",
    description="API untuk analisis semantik error pemrograman",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware untuk frontend Next.js
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(
    auth.router,
    prefix="/api/auth",
    tags=["Autentikasi"]
)

app.include_router(
    analyze.router,
    prefix="/api/analyze",
    tags=["Analisis Error"]
)

app.include_router(
    history.router,
    prefix="/api/history",
    tags=["Riwayat"]
)

app.include_router(
    patterns.router,
    prefix="/api/patterns",
    tags=["Pola Kesalahan"]
)

app.include_router(
    admin.router,
    prefix="/api/admin",
    tags=["Admin"]
)

app.include_router(
    mahasiswa.router,
    prefix="/api/mahasiswa",
    tags=["Mahasiswa"]
)

app.include_router(
    exercise.router,
    prefix="/api/exercises",
    tags=["Practice Exercises"]
)


@app.on_event("startup")
async def startup():
    """Event handler saat aplikasi startup"""
    print("🚀 PahamKode Backend starting...")
    await sambungkan_database()
    print("✅ Backend siap!")


@app.on_event("shutdown")
async def shutdown():
    """Event handler saat aplikasi shutdown"""
    print("⏹️  PahamKode Backend shutting down...")
    await putuskan_database()


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "aplikasi": "PahamKode API",
        "versi": "1.0.0",
        "deskripsi": "API untuk analisis semantik error pemrograman",
        "dokumentasi": "/docs"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint untuk monitoring"""
    return {
        "status": "sehat",
        "database": "terhubung"
    }
