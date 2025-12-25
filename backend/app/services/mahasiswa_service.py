"""
Service untuk Mahasiswa Features
Dashboard, Learning Resources, Export
"""

from app.database import prisma
from app.models.schemas import (
    ResponseDashboardMahasiswa,
    AktivitasItem,
    ResponseSumberDaya
)
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta


async def dapatkan_dashboard_mahasiswa(id_mahasiswa: str) -> ResponseDashboardMahasiswa:
    """
    Dapatkan statistik dashboard untuk mahasiswa
    
    Args:
        id_mahasiswa: ID mahasiswa
    
    Returns:
        ResponseDashboardMahasiswa dengan semua metrics
    """
    
    # 1. Total error
    total_error = await prisma.submisierror.count(
        where={"idMahasiswa": id_mahasiswa}
    )
    
    # 2. Total pola unik
    total_pola_unik = await prisma.polaerror.count(
        where={"idMahasiswa": id_mahasiswa}
    )
    
    # 3. Rata-rata penguasaan
    progress_list = await prisma.progressbelajar.find_many(
        where={"idMahasiswa": id_mahasiswa}
    )
    
    if progress_list:
        rata_rata_penguasaan = sum(p.tingkatPenguasaan for p in progress_list) / len(progress_list)
    else:
        rata_rata_penguasaan = 0.0
    
    # 4. Tren perbaikan
    if rata_rata_penguasaan > 70:
        tren = "membaik"
    elif rata_rata_penguasaan < 40:
        tren = "menurun"
    else:
        tren = "stabil"
    
    # 5. Error minggu ini
    awal_minggu = datetime.now() - timedelta(days=datetime.now().weekday())
    awal_minggu = awal_minggu.replace(hour=0, minute=0, second=0, microsecond=0)
    
    error_minggu_ini = await prisma.submisierror.count(
        where={
            "idMahasiswa": id_mahasiswa,
            "createdAt": {"gte": awal_minggu}
        }
    )
    
    # 6. Topik dikuasai (penguasaan > 70)
    topik_dikuasai = await prisma.progressbelajar.count(
        where={
            "idMahasiswa": id_mahasiswa,
            "tingkatPenguasaan": {"gte": 70}
        }
    )
    
    # 7. Aktivitas terbaru (5 terakhir)
    submisi_terbaru = await prisma.submisierror.find_many(
        where={"idMahasiswa": id_mahasiswa},
        order={"createdAt": "desc"},
        take=5
    )
    
    aktivitas_terbaru = []
    for submisi in submisi_terbaru:
        aktivitas_terbaru.append(
            AktivitasItem(
                tipe="analisis_error",
                deskripsi=f"Analisis error: {submisi.tipeError or 'Unknown'}",
                waktu=submisi.createdAt
            )
        )
    
    # 8. Topik rekomendasi (topik dengan penguasaan rendah)
    topik_lemah = await prisma.progressbelajar.find_many(
        where={
            "idMahasiswa": id_mahasiswa,
            "tingkatPenguasaan": {"lt": 50}
        },
        order={"tingkatPenguasaan": "asc"},
        take=3
    )
    
    topik_rekomendasi = [p.topik for p in topik_lemah]
    
    return ResponseDashboardMahasiswa(
        total_error=total_error,
        total_pola_unik=total_pola_unik,
        rata_rata_penguasaan=rata_rata_penguasaan,
        tren_perbaikan=tren,
        error_minggu_ini=error_minggu_ini,
        topik_dikuasai=topik_dikuasai,
        aktivitas_terbaru=aktivitas_terbaru,
        topik_rekomendasi=topik_rekomendasi
    )


async def dapatkan_sumber_daya_rekomendasi(id_mahasiswa: str, limit: int = 10) -> List[ResponseSumberDaya]:
    """
    Dapatkan sumber daya pembelajaran yang direkomendasikan untuk mahasiswa
    berdasarkan topik yang lemah
    
    Args:
        id_mahasiswa: ID mahasiswa
        limit: Maksimal jumlah sumber daya
    
    Returns:
        List sumber daya yang direkomendasikan
    """
    
    # Ambil topik-topik lemah mahasiswa
    topik_lemah = await prisma.progressbelajar.find_many(
        where={
            "idMahasiswa": id_mahasiswa,
            "tingkatPenguasaan": {"lt": 70}
        },
        take=1000  # Ambil semua topik lemah
    )
    
    topik_list = [t.topik for t in topik_lemah]
    
    # Jika tidak ada topik lemah, ambil semua sumber daya untuk pemula
    from typing import Any, cast
    
    if not topik_list:
        sumber_daya_list = await prisma.sumberdaya.find_many(
            where=cast(Any, {"tingkatKesulitan": "pemula"}),
            take=limit,
            order={"dibuat": "desc"}
        )
    else:
        # Ambil sumber daya yang topiknya sesuai
        sumber_daya_list = await prisma.sumberdaya.find_many(
            where=cast(Any, {
                "topikTerkait": {"hasSome": topik_list}
            }),
            take=limit,
            order={"dibuat": "desc"}
        )
    
    return [
        ResponseSumberDaya(
            id=sd.id,
            judul=sd.judul,
            deskripsi=sd.deskripsi,
            tipe=sd.tipe,
            url=sd.url,
            konten=sd.konten,
            topik_terkait=sd.topikTerkait,
            tingkat_kesulitan=sd.tingkatKesulitan,
            durasi=sd.durasi,
            dibuat=sd.dibuat,
            diperbarui=sd.diperbarui
        )
        for sd in sumber_daya_list
    ]


async def generate_export_csv(id_mahasiswa: str, periode: str = "bulan_ini") -> str:
    """
    Generate CSV export untuk progress report mahasiswa
    
    Args:
        id_mahasiswa: ID mahasiswa
        periode: minggu_ini, bulan_ini, semua
    
    Returns:
        CSV content sebagai string
    """
    import csv
    import io
    from datetime import datetime, timedelta
    
    # Filter by periode
    if periode == "minggu_ini":
        awal = datetime.now() - timedelta(days=7)
    elif periode == "bulan_ini":
        awal = datetime.now() - timedelta(days=30)
    else:
        awal = None
    
    # Get data
    from typing import Any, cast
    
    where_clause: Dict[str, Any] = {"idMahasiswa": id_mahasiswa}
    if awal:
        where_clause["createdAt"] = {"gte": awal}
    
    submisi_list = await prisma.submisierror.find_many(
        where=cast(Any, where_clause),
        order={"createdAt": "desc"}
    )
    
    # Create CSV
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Header
    writer.writerow([
        "Tanggal",
        "Bahasa",
        "Tipe Error",
        "Penyebab Utama",
        "Kesenjangan Konsep",
        "Level Bloom",
        "Topik Terkait"
    ])
    
    # Data rows
    for submisi in submisi_list:
        writer.writerow([
            submisi.createdAt.strftime("%Y-%m-%d %H:%M:%S"),
            submisi.bahasa,
            submisi.tipeError or "-",
            submisi.penyebabUtama or "-",
            submisi.kesenjanganKonsep or "-",
            submisi.levelBloom or "-",
            ", ".join(submisi.topikTerkait) if submisi.topikTerkait else "-"
        ])
    
    return output.getvalue()


async def generate_export_data(id_mahasiswa: str, periode: str = "bulan_ini") -> Dict[str, Any]:
    """
    Generate data untuk PDF export
    
    Args:
        id_mahasiswa: ID mahasiswa
        periode: minggu_ini, bulan_ini, semua
    
    Returns:
        Dict dengan data lengkap untuk PDF
    """
    from datetime import datetime, timedelta
    
    # Filter by periode
    if periode == "minggu_ini":
        awal = datetime.now() - timedelta(days=7)
        periode_label = "Minggu Ini"
    elif periode == "bulan_ini":
        awal = datetime.now() - timedelta(days=30)
        periode_label = "Bulan Ini"
    else:
        awal = None
        periode_label = "Semua Waktu"
    
    # Get user data
    user = await prisma.user.find_unique(where={"id": id_mahasiswa})
    
    # Get statistics
    from typing import Any, cast
    
    where_clause: Dict[str, Any] = {"idMahasiswa": id_mahasiswa}
    if awal:
        where_clause["createdAt"] = {"gte": awal}
    
    total_submisi = await prisma.submisierror.count(where=cast(Any, where_clause))
    
    # Get pola error
    pola_list = await prisma.polaerror.find_many(
        where={"idMahasiswa": id_mahasiswa},
        order={"frekuensi": "desc"},
        take=5
    )
    
    # Get progress
    from typing import Any, cast
    
    progress_list = await prisma.progressbelajar.find_many(
        where={"idMahasiswa": id_mahasiswa},
        order={"tingkatPenguasaan": "desc"}
    )
    
    rata_penguasaan = 0
    if progress_list:
        rata_penguasaan = sum(p.tingkatPenguasaan for p in progress_list) / len(progress_list)
    
    return {
        "user": {
            "nama": user.nama or user.email if user else "Unknown",
            "email": user.email if user else "Unknown",
            "tingkat_kemahiran": user.tingkatKemahiran if user else "pemula"
        },
        "periode": periode_label,
        "tanggal_generate": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "statistik": {
            "total_submisi": total_submisi,
            "total_pola": len(pola_list),
            "rata_penguasaan": round(rata_penguasaan, 2)
        },
        "pola_teratas": [
            {
                "jenis": p.jenisKesalahan,
                "frekuensi": p.frekuensi
            }
            for p in pola_list
        ],
        "progress_topik": [
            {
                "topik": p.topik,
                "penguasaan": p.tingkatPenguasaan
            }
            for p in progress_list[:10]
        ]
    }
