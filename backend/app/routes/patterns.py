"""
API Routes untuk Pattern Mining
"""

from fastapi import APIRouter, HTTPException
from app.models.schemas import ResponsePolaError, ResponseProgressBelajar
from app.services.pattern_service import dapatkan_pola_kesalahan, analisis_tren_kesalahan
from app.database import prisma
from typing import List

router = APIRouter()


@router.get("/{id_mahasiswa}", response_model=List[ResponsePolaError])
async def dapatkan_pola(id_mahasiswa: str):
    """
    Dapatkan pola-pola kesalahan mahasiswa
    
    Core Feature: Pattern Mining
    
    Returns:
        List pola kesalahan dengan frekuensi dan miskonsepsi
    """
    try:
        pola_list = await dapatkan_pola_kesalahan(id_mahasiswa)
        return pola_list
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Gagal mengambil pola kesalahan: {str(e)}"
        )


@router.get("/{id_mahasiswa}/tren")
async def dapatkan_tren(id_mahasiswa: str):
    """
    Analisis tren kesalahan mahasiswa
    
    Returns:
        Statistik dan insight tentang pola kesalahan
    """
    try:
        tren = await analisis_tren_kesalahan(id_mahasiswa)
        return tren
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Gagal menganalisis tren: {str(e)}"
        )


@router.get("/{id_mahasiswa}/progress", response_model=List[ResponseProgressBelajar])
async def dapatkan_progress(id_mahasiswa: str):
    """
    Dapatkan progress belajar mahasiswa per topik
    
    Core Feature: Personalized Learning
    
    Returns:
        List progress belajar dengan tingkat penguasaan per topik
    """
    try:
        progress_list = await prisma.progressbelajar.find_many(
            where={"idMahasiswa": id_mahasiswa},
            order={"tingkatPenguasaan": "asc"}  # Topik terlemah di atas
        )
        
        return [
            ResponseProgressBelajar(
                id=p.id,
                topik=p.topik,
                tingkat_penguasaan=p.tingkatPenguasaan,
                jumlah_error_di_topik=p.jumlahErrorDiTopik,
                tanggal_error_terakhir=p.tanggalErrorTerakhir,
                tren_perbaikan=p.trenPerbaikan
            )
            for p in progress_list
        ]
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Gagal mengambil progress belajar: {str(e)}"
        )
