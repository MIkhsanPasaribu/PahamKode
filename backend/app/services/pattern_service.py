"""
Service untuk Pattern Mining
Core Objective #2: Pattern Mining - Identifikasi pola kesalahan berulang
"""

from app.database import prisma
from app.models.schemas import ResponsePolaError
from typing import List


async def dapatkan_pola_kesalahan(id_mahasiswa: str, limit: int = 10) -> List[ResponsePolaError]:
    """
    Dapatkan pola-pola kesalahan yang sering dialami mahasiswa
    
    Diurutkan berdasarkan frekuensi (paling sering di atas)
    
    Args:
        id_mahasiswa: UUID mahasiswa
        limit: Maksimal jumlah pola yang dikembalikan
        
    Returns:
        List pola kesalahan dengan miskonsepsi dan rekomendasi
    """
    
    pola_list = await prisma.polaerror.find_many(
        where={"idMahasiswa": id_mahasiswa},
        order={"frekuensi": "desc"},
        take=limit
    )
    
    return [
        ResponsePolaError(
            id=pola.id,
            jenis_kesalahan=pola.jenisKesalahan,
            frekuensi=pola.frekuensi,
            kejadian_pertama=pola.kejadianPertama,
            kejadian_terakhir=pola.kejadianTerakhir,
            deskripsi_miskonsepsi=pola.deskripsiMiskonsepsi,
            sumber_daya_direkomendasikan=pola.sumberDayaDirekomendasikan
        )
        for pola in pola_list
    ]


async def analisis_tren_kesalahan(id_mahasiswa: str) -> dict:
    """
    Analisis tren kesalahan mahasiswa dari waktu ke waktu
    
    Returns:
        Dictionary dengan statistik dan insight tren
    """
    
    # Total submisi
    total_submisi = await prisma.submisierror.count(
        where={"idMahasiswa": id_mahasiswa}
    )
    
    # Pola kesalahan unik
    pola_unik = await prisma.polaerror.count(
        where={"idMahasiswa": id_mahasiswa}
    )
    
    # Top 3 kesalahan paling sering
    top_kesalahan = await prisma.polaerror.find_many(
        where={"idMahasiswa": id_mahasiswa},
        order={"frekuensi": "desc"},
        take=3
    )
    
    return {
        "total_submisi": total_submisi,
        "pola_unik_teridentifikasi": pola_unik,
        "kesalahan_paling_sering": [
            {
                "jenis": pola.jenisKesalahan,
                "frekuensi": pola.frekuensi,
                "miskonsepsi": pola.deskripsiMiskonsepsi
            }
            for pola in top_kesalahan
        ]
    }
