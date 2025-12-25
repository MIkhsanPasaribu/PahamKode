"""
API Routes untuk Analisis Error
"""

from fastapi import APIRouter, HTTPException
from app.models.schemas import RequestAnalisis, HasilAnalisis
from app.services.analysis_service import analisis_error_semantik

router = APIRouter()


@router.post("/", response_model=HasilAnalisis)
async def analisis_error(request: RequestAnalisis):
    """
    Endpoint untuk analisis error semantik
    
    Core Feature: Semantic Error Analysis
    
    Input:
    - kode: Kode program yang error
    - pesan_error: Pesan error dari compiler
    - bahasa: Bahasa pemrograman
    - id_mahasiswa: UUID mahasiswa
    
    Output:
    - Analisis semantik lengkap dengan penjelasan MENGAPA error terjadi
    - Saran perbaikan dan latihan
    - Peringatan jika ada pola kesalahan berulang
    """
    try:
        hasil = await analisis_error_semantik(
            kode=request.kode,
            pesan_error=request.pesan_error,
            bahasa=request.bahasa,
            id_mahasiswa=request.id_mahasiswa
        )
        return hasil
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={
                "error": "Analisis gagal",
                "pesan": str(e),
                "fallback": "Silakan coba lagi atau hubungi admin"
            }
        )
