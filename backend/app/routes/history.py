"""
API Routes untuk Riwayat Error
"""

from fastapi import APIRouter, HTTPException, Query
from app.models.schemas import ResponseRiwayat
from app.database import prisma
from typing import List

router = APIRouter()


@router.get("/{id_mahasiswa}", response_model=List[ResponseRiwayat])
async def dapatkan_riwayat(
    id_mahasiswa: str,
    limit: int = Query(default=20, le=100, description="Maksimal jumlah riwayat")
):
    """
    Dapatkan riwayat submisi error mahasiswa
    
    Args:
        id_mahasiswa: UUID mahasiswa
        limit: Maksimal jumlah riwayat (default 20, max 100)
    
    Returns:
        List riwayat submisi error, diurutkan dari yang terbaru
    """
    try:
        riwayat = await prisma.submisierror.find_many(
            where={"idMahasiswa": id_mahasiswa},
            order={"createdAt": "desc"},
            take=limit
        )
        
        return [
            ResponseRiwayat(
                id=item.id,
                kode=item.kode,
                pesan_error=item.pesanError,
                bahasa=item.bahasa,
                tipe_error=item.tipeError,
                level_bloom=item.levelBloom,
                created_at=item.createdAt
            )
            for item in riwayat
        ]
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Gagal mengambil riwayat: {str(e)}"
        )


@router.get("/{id_mahasiswa}/{id_submisi}")
async def dapatkan_detail_submisi(id_mahasiswa: str, id_submisi: int):
    """
    Dapatkan detail lengkap dari satu submisi error
    
    Args:
        id_mahasiswa: UUID mahasiswa
        id_submisi: ID submisi error
        
    Returns:
        Detail lengkap submisi termasuk analisis semantik
    """
    try:
        from typing import Any, cast
        
        submisi = await prisma.submisierror.find_first(
            where=cast(Any, {
                "id": id_submisi,
                "idMahasiswa": id_mahasiswa
            })
        )
        
        if not submisi:
            raise HTTPException(status_code=404, detail="Submisi tidak ditemukan")
        
        return submisi
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Gagal mengambil detail submisi: {str(e)}"
        )
