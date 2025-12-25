"""
Service untuk Admin Features
Menyediakan fungsi-fungsi untuk analytics, user management, dll
"""

from app.database import prisma
from app.models.schemas import (
    ResponseStatistikDashboard,
    TopErrorItem,
    MahasiswaKesulitanItem,
    ResponseMahasiswa,
    ResponseMahasiswaList,
    ResponseDetailMahasiswa,
    StatistikMahasiswa,
    ResponsePolaError,
    ResponseProgressBelajar,
    ResponseRiwayat,
    ResponsePolaGlobal,
    ResponseAnalyticsTren
)
from typing import List, Optional, Dict
from datetime import datetime, timedelta
from collections import Counter


async def dapatkan_statistik_dashboard() -> ResponseStatistikDashboard:
    """
    Dapatkan statistik untuk dashboard admin
    
    Returns:
        ResponseStatistikDashboard dengan semua metrics
    """
    
    # 1. Total mahasiswa
    total_mahasiswa = await prisma.user.count(
        where={"role": "mahasiswa"}
    )
    
    # 2. Pertumbuhan mahasiswa bulan ini
    awal_bulan = datetime.now().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    pertumbuhan_bulan_ini = await prisma.user.count(
        where={
            "role": "mahasiswa",
            "createdAt": {"gte": awal_bulan}
        }
    )
    
    # 3. Total analisis
    total_analisis = await prisma.submisierror.count()
    
    # 4. Analisis hari ini
    awal_hari = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
    total_analisis_hari_ini = await prisma.submisierror.count(
        where={"createdAt": {"gte": awal_hari}}
    )
    
    # 5. Analisis minggu ini
    awal_minggu = datetime.now() - timedelta(days=datetime.now().weekday())
    awal_minggu = awal_minggu.replace(hour=0, minute=0, second=0, microsecond=0)
    total_analisis_minggu_ini = await prisma.submisierror.count(
        where={"createdAt": {"gte": awal_minggu}}
    )
    
    # 6. Analisis bulan ini
    total_analisis_bulan_ini = await prisma.submisierror.count(
        where={"createdAt": {"gte": awal_bulan}}
    )
    
    # 7. Rata-rata tingkat penguasaan global
    progress_list = await prisma.progressbelajar.find_many()
    if progress_list:
        total_penguasaan = sum(p.tingkatPenguasaan for p in progress_list)
        rata_rata_penguasaan = total_penguasaan / len(progress_list)
    else:
        rata_rata_penguasaan = 0.0
    
    # 8. Top 5 errors paling sering
    from typing import Any, cast
    
    from typing import Any, cast
    
    submisi_list = await prisma.submisierror.find_many(
        where=cast(Any, {"tipeError": {"not": None}}),
        take=1000  # Ambil semua untuk di-process
    )
    
    error_counter = Counter(s.tipeError for s in submisi_list if s.tipeError)
    top_errors = [
        TopErrorItem(tipe_error=tipe, jumlah=jumlah)
        for tipe, jumlah in error_counter.most_common(5)
    ]
    
    # 9. Top 5 mahasiswa dengan kesulitan terbanyak
    # Group by mahasiswa dan hitung total error
    mahasiswa_error_count: Dict[str, int] = {}
    all_submisi = await prisma.submisierror.find_many(
        take=10000  # Ambil semua untuk di-process
    )
    
    for submisi in all_submisi:
        mahasiswa_error_count[submisi.idMahasiswa] = mahasiswa_error_count.get(submisi.idMahasiswa, 0) + 1
    
    # Sort dan ambil top 5
    top_mahasiswa_ids = sorted(mahasiswa_error_count.items(), key=lambda x: x[1], reverse=True)[:5]
    
    mahasiswa_kesulitan = []
    for mhs_id, jumlah_error in top_mahasiswa_ids:
        mhs = await prisma.user.find_unique(where={"id": mhs_id})
        if mhs:
            mahasiswa_kesulitan.append(
                MahasiswaKesulitanItem(
                    id=mhs.id,
                    nama=mhs.nama,
                    email=mhs.email,
                    jumlah_error=jumlah_error
                )
            )
    
    return ResponseStatistikDashboard(
        total_mahasiswa=total_mahasiswa,
        pertumbuhan_mahasiswa_bulan_ini=pertumbuhan_bulan_ini,
        total_analisis=total_analisis,
        total_analisis_hari_ini=total_analisis_hari_ini,
        total_analisis_minggu_ini=total_analisis_minggu_ini,
        total_analisis_bulan_ini=total_analisis_bulan_ini,
        rata_rata_tingkat_penguasaan=rata_rata_penguasaan,
        top_errors=top_errors,
        mahasiswa_dengan_kesulitan=mahasiswa_kesulitan
    )


async def dapatkan_semua_mahasiswa(
    halaman: int = 1,
    ukuran_halaman: int = 20,
    pencarian: Optional[str] = None
) -> ResponseMahasiswaList:
    """
    Dapatkan list semua mahasiswa dengan pagination dan search
    
    Args:
        halaman: Nomor halaman (mulai dari 1)
        ukuran_halaman: Jumlah item per halaman
        pencarian: Keyword untuk search (email atau nama)
    
    Returns:
        ResponseMahasiswaList dengan pagination info
    """
    
    # Build where clause
    where_clause: Dict = {"role": "mahasiswa"}
    
    if pencarian:
        where_clause["OR"] = [
            {"email": {"contains": pencarian, "mode": "insensitive"}},
            {"nama": {"contains": pencarian, "mode": "insensitive"}}
        ]
    
    # Total count - cast to Any untuk bypass type checking
    from typing import Any, cast
    total = await prisma.user.count(where=cast(Any, where_clause) if where_clause else None)
    
    # Calculate skip
    skip = (halaman - 1) * ukuran_halaman
    
    # Fetch users
    users = await prisma.user.find_many(
        where=cast(Any, where_clause) if where_clause else None,
        skip=skip,
        take=ukuran_halaman,
        order={"createdAt": "desc"}
    )
    
    # Build response dengan statistik tambahan
    mahasiswa_list = []
    for user in users:
        total_submisi = await prisma.submisierror.count(
            where=cast(Any, {"idMahasiswa": user.id})
        )
        
        total_pola = await prisma.polaerror.count(
            where={"idMahasiswa": user.id}
        )
        
        mahasiswa_list.append(
            ResponseMahasiswa(
                id=user.id,
                email=user.email,
                nama=user.nama,
                role=user.role,
                tingkat_kemahiran=user.tingkatKemahiran,
                created_at=user.createdAt,
                total_submisi=total_submisi,
                total_pola=total_pola
            )
        )
    
    # Calculate total pages
    total_halaman = (total + ukuran_halaman - 1) // ukuran_halaman
    
    return ResponseMahasiswaList(
        mahasiswa=mahasiswa_list,
        total=total,
        halaman=halaman,
        ukuran_halaman=ukuran_halaman,
        total_halaman=total_halaman
    )


async def dapatkan_detail_mahasiswa(id_mahasiswa: str) -> ResponseDetailMahasiswa:
    """
    Dapatkan detail lengkap mahasiswa untuk admin
    
    Args:
        id_mahasiswa: ID mahasiswa
    
    Returns:
        ResponseDetailMahasiswa dengan semua info
    """
    
    # Get user
    user = await prisma.user.find_unique(where={"id": id_mahasiswa})
    
    if not user:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Mahasiswa tidak ditemukan")
    
    # Statistik
    total_submisi = await prisma.submisierror.count(
        where={"idMahasiswa": id_mahasiswa}
    )
    
    total_pola_unik = await prisma.polaerror.count(
        where={"idMahasiswa": id_mahasiswa}
    )
    
    # Rata-rata penguasaan
    progress_list = await prisma.progressbelajar.find_many(
        where={"idMahasiswa": id_mahasiswa}
    )
    
    if progress_list:
        rata_rata = sum(p.tingkatPenguasaan for p in progress_list) / len(progress_list)
    else:
        rata_rata = 0.0
    
    # Error pertama dan terakhir
    submisi_pertama = await prisma.submisierror.find_first(
        where={"idMahasiswa": id_mahasiswa},
        order={"createdAt": "asc"}
    )
    
    submisi_terakhir = await prisma.submisierror.find_first(
        where={"idMahasiswa": id_mahasiswa},
        order={"createdAt": "desc"}
    )
    
    # Tren perbaikan (simplified)
    tren = "stabil"
    if progress_list:
        # Jika rata-rata > 70, tren membaik
        if rata_rata > 70:
            tren = "membaik"
        elif rata_rata < 40:
            tren = "menurun"
    
    statistik = StatistikMahasiswa(
        total_submisi=total_submisi,
        total_pola_unik=total_pola_unik,
        rata_rata_penguasaan=rata_rata,
        tren_perbaikan=tren,
        error_pertama=submisi_pertama.createdAt if submisi_pertama else None,
        error_terakhir=submisi_terakhir.createdAt if submisi_terakhir else None
    )
    
    # Pola kesalahan terbanyak (top 5)
    pola_list = await prisma.polaerror.find_many(
        where={"idMahasiswa": id_mahasiswa},
        order={"frekuensi": "desc"},
        take=5
    )
    
    pola_terbanyak = [
        ResponsePolaError(
            id=p.id,
            jenis_kesalahan=p.jenisKesalahan,
            frekuensi=p.frekuensi,
            kejadian_pertama=p.kejadianPertama,
            kejadian_terakhir=p.kejadianTerakhir,
            deskripsi_miskonsepsi=p.deskripsiMiskonsepsi,
            sumber_daya_direkomendasikan=p.sumberDayaDirekomendasikan
        )
        for p in pola_list
    ]
    
    # Topik terlemah (tingkat penguasaan rendah)
    topik_terlemah_list = await prisma.progressbelajar.find_many(
        where={"idMahasiswa": id_mahasiswa},
        order={"tingkatPenguasaan": "asc"},
        take=5
    )
    
    topik_terlemah = [
        ResponseProgressBelajar(
            id=p.id,
            topik=p.topik,
            tingkat_penguasaan=p.tingkatPenguasaan,
            jumlah_error_di_topik=p.jumlahErrorDiTopik,
            tanggal_error_terakhir=p.tanggalErrorTerakhir,
            tren_perbaikan=p.trenPerbaikan
        )
        for p in topik_terlemah_list
    ]
    
    # Riwayat terbaru (10 terakhir)
    riwayat_list = await prisma.submisierror.find_many(
        where={"idMahasiswa": id_mahasiswa},
        order={"createdAt": "desc"},
        take=10
    )
    
    riwayat = [
        ResponseRiwayat(
            id=r.id,
            kode=r.kode,
            pesan_error=r.pesanError,
            bahasa=r.bahasa,
            tipe_error=r.tipeError,
            level_bloom=r.levelBloom,
            created_at=r.createdAt
        )
        for r in riwayat_list
    ]
    
    return ResponseDetailMahasiswa(
        user=ResponseMahasiswa(
            id=user.id,
            email=user.email,
            nama=user.nama,
            role=user.role,
            tingkat_kemahiran=user.tingkatKemahiran,
            created_at=user.createdAt,
            total_submisi=total_submisi,
            total_pola=total_pola_unik
        ),
        statistik=statistik,
        pola_kesalahan_terbanyak=pola_terbanyak,
        topik_terlemah=topik_terlemah,
        riwayat_terbaru=riwayat
    )


async def dapatkan_pola_kesalahan_global(limit: int = 20) -> List[ResponsePolaGlobal]:
    """
    Dapatkan pola kesalahan global di seluruh sistem
    
    Args:
        limit: Maksimal jumlah pola yang dikembalikan
    
    Returns:
        List pola kesalahan global
    """
    
    # Get all submisi errors
    from typing import Any, cast
    
    all_submisi = await prisma.submisierror.find_many(
        where=cast(Any, {"tipeError": {"not": None}}),
        take=10000  # Ambil semua untuk di-process
    )
    
    # Group by tipe error
    error_data: Dict[str, Dict[str, Any]] = {}
    
    for submisi in all_submisi:
        tipe = submisi.tipeError
        if not tipe:
            continue
            
        if tipe not in error_data:
            error_data[tipe] = {
                "total": 0,
                "mahasiswa_ids": set(),
                "miskonsepsi": []
            }
        
        error_data[tipe]["total"] += 1
        error_data[tipe]["mahasiswa_ids"].add(submisi.idMahasiswa)
        
        if submisi.kesenjanganKonsep:
            error_data[tipe]["miskonsepsi"].append(submisi.kesenjanganKonsep)
    
    # Total mahasiswa
    total_mahasiswa = await prisma.user.count(where={"role": "mahasiswa"})
    if total_mahasiswa == 0:
        total_mahasiswa = 1  # Avoid division by zero
    
    # Build response
    pola_global = []
    for tipe_error, data in sorted(error_data.items(), key=lambda x: x[1]["total"], reverse=True)[:limit]:
        jumlah_mhs_terpengaruh = len(data["mahasiswa_ids"])
        persentase = (jumlah_mhs_terpengaruh / total_mahasiswa) * 100
        
        # Ambil miskonsepsi unik (top 3)
        miskonsepsi_unik = list(set(data["miskonsepsi"]))[:3]
        
        pola_global.append(
            ResponsePolaGlobal(
                jenis_kesalahan=tipe_error,
                total_kemunculan=data["total"],
                jumlah_mahasiswa_terpengaruh=jumlah_mhs_terpengaruh,
                persentase_mahasiswa=round(persentase, 2),
                miskonsepsi_umum=miskonsepsi_unik
            )
        )
    
    return pola_global


async def dapatkan_analytics_tren(jumlah_hari: int = 7) -> List[ResponseAnalyticsTren]:
    """
    Dapatkan tren analytics untuk beberapa hari terakhir
    
    Args:
        jumlah_hari: Jumlah hari yang akan ditampilkan
    
    Returns:
        List tren analytics per hari
    """
    
    tren_list = []
    
    for i in range(jumlah_hari - 1, -1, -1):
        tanggal = datetime.now() - timedelta(days=i)
        awal_hari = tanggal.replace(hour=0, minute=0, second=0, microsecond=0)
        akhir_hari = awal_hari + timedelta(days=1)
        
        # Jumlah analisis hari itu
        jumlah_analisis = await prisma.submisierror.count(
            where={
                "createdAt": {
                    "gte": awal_hari,
                    "lt": akhir_hari
                }
            }
        )
        
        # Mahasiswa aktif (yang submit error hari itu)
        submisi_hari_ini = await prisma.submisierror.find_many(
            where={
                "createdAt": {
                    "gte": awal_hari,
                    "lt": akhir_hari
                }
            }
        )
        
        mahasiswa_unik = len(set(s.idMahasiswa for s in submisi_hari_ini))
        
        tren_list.append(
            ResponseAnalyticsTren(
                tanggal=awal_hari.strftime("%Y-%m-%d"),
                jumlah_analisis=jumlah_analisis,
                mahasiswa_aktif=mahasiswa_unik
            )
        )
    
    return tren_list


async def ubah_status_mahasiswa(id_mahasiswa: str, status_baru: str):
    """
    Suspend atau activate mahasiswa
    
    Args:
        id_mahasiswa: ID mahasiswa
        status_baru: "aktif" atau "suspended"
    
    Returns:
        Updated user
    """
    from fastapi import HTTPException
    
    if status_baru not in ["aktif", "suspended"]:
        raise HTTPException(status_code=400, detail="Status harus 'aktif' atau 'suspended'")
    
    user = await prisma.user.find_unique(where={"id": id_mahasiswa})
    if not user:
        raise HTTPException(status_code=404, detail="Mahasiswa tidak ditemukan")
    
    updated_user = await prisma.user.update(
        where={"id": id_mahasiswa},
        data={"status": status_baru}
    )
    
    return updated_user


async def bulk_action_mahasiswa(id_list: List[str], action: str):
    """
    Bulk operations untuk banyak mahasiswa sekaligus
    
    Args:
        id_list: List ID mahasiswa
        action: "suspend", "activate", atau "delete"
    
    Returns:
        Jumlah mahasiswa yang terpengaruh
    """
    from fastapi import HTTPException
    
    if action == "suspend":
        result = await prisma.user.update_many(
            where={"id": {"in": id_list}},
            data={"status": "suspended"}
        )
        return result
    elif action == "activate":
        result = await prisma.user.update_many(
            where={"id": {"in": id_list}},
            data={"status": "aktif"}
        )
        return result
    elif action == "delete":
        result = await prisma.user.delete_many(
            where={"id": {"in": id_list}}
        )
        return result
    else:
        raise HTTPException(status_code=400, detail="Action tidak valid")


async def dapatkan_metrik_ai() -> Dict:
    """
    Dapatkan statistik penggunaan AI
    
    Returns:
        Dict dengan metrics AI
    """
    
    # Total requests
    total_requests = await prisma.metrikai.count()
    
    if total_requests == 0:
        return {
            "total_requests": 0,
            "total_token_input": 0,
            "total_token_output": 0,
            "total_token": 0,
            "total_biaya": 0.0,
            "rata_rata_waktu_respons": 0.0,
            "success_rate": 0.0
        }
    
    # Aggregate metrics
    all_metrics = await prisma.metrikai.find_many()
    
    total_token_input = sum(m.tokenInput for m in all_metrics)
    total_token_output = sum(m.tokenOutput for m in all_metrics)
    total_token = sum(m.totalToken for m in all_metrics)
    total_biaya = sum(m.biaya for m in all_metrics)
    
    total_waktu = sum(m.waktuRespons for m in all_metrics)
    rata_rata_waktu = total_waktu / total_requests
    
    success_count = sum(1 for m in all_metrics if m.statusBerhasil)
    success_rate = (success_count / total_requests) * 100
    
    return {
        "total_requests": total_requests,
        "total_token_input": total_token_input,
        "total_token_output": total_token_output,
        "total_token": total_token,
        "total_biaya": round(total_biaya, 4),
        "rata_rata_waktu_respons": round(rata_rata_waktu, 2),
        "success_rate": round(success_rate, 2)
    }


async def dapatkan_topik_sulit(limit: int = 10) -> List[Dict]:
    """
    Dapatkan topik-topik paling sulit berdasarkan jumlah error
    
    Args:
        limit: Maksimal jumlah topik
    
    Returns:
        List topik dengan statistik kesulitan
    """
    
    # Ambil semua progress belajar
    all_progress = await prisma.progressbelajar.find_many(
        include={"mahasiswa": True}
    )
    
    # Group by topik
    topik_stats: Dict[str, Dict] = {}
    
    for progress in all_progress:
        topik = progress.topik
        if topik not in topik_stats:
            topik_stats[topik] = {
                "total_error": 0,
                "mahasiswa_ids": set(),
                "total_penguasaan": 0,
                "count": 0
            }
        
        topik_stats[topik]["total_error"] += progress.jumlahErrorDiTopik
        topik_stats[topik]["mahasiswa_ids"].add(progress.idMahasiswa)
        topik_stats[topik]["total_penguasaan"] += progress.tingkatPenguasaan
        topik_stats[topik]["count"] += 1
    
    # Total mahasiswa
    total_mahasiswa = await prisma.user.count(where={"role": "mahasiswa"})
    if total_mahasiswa == 0:
        total_mahasiswa = 1
    
    # Build response
    result = []
    for topik, stats in sorted(topik_stats.items(), key=lambda x: x[1]["total_error"], reverse=True)[:limit]:
        jumlah_mhs = len(stats["mahasiswa_ids"])
        persentase = (jumlah_mhs / total_mahasiswa) * 100
        rata_penguasaan = stats["total_penguasaan"] / stats["count"] if stats["count"] > 0 else 0
        
        result.append({
            "topik": topik,
            "total_error": stats["total_error"],
            "jumlah_mahasiswa_kesulitan": jumlah_mhs,
            "persentase_mahasiswa": round(persentase, 2),
            "rata_rata_penguasaan": round(rata_penguasaan, 2)
        })
    
    return result


async def dapatkan_rekomendasi_kurikulum() -> Dict:
    """
    Generate rekomendasi kurikulum berdasarkan data analytics
    
    Returns:
        Dict dengan rekomendasi kurikulum
    """
    
    # Ambil topik sulit
    topik_sulit = await dapatkan_topik_sulit(20)
    
    # Ambil semua progress
    all_progress = await prisma.progressbelajar.find_many()
    
    # Topik dengan penguasaan rendah (prioritas)
    topik_prioritas = []
    topik_mudah = []
    
    topik_penguasaan: Dict[str, List[int]] = {}
    for progress in all_progress:
        if progress.topik not in topik_penguasaan:
            topik_penguasaan[progress.topik] = []
        topik_penguasaan[progress.topik].append(progress.tingkatPenguasaan)
    
    for topik, penguasaan_list in topik_penguasaan.items():
        rata = sum(penguasaan_list) / len(penguasaan_list)
        if rata < 50:
            topik_prioritas.append(topik)
        elif rata > 75:
            topik_mudah.append(topik)
    
    # Gap pembelajaran (topik dengan error tinggi tapi penguasaan rendah)
    gap_pembelajaran = []
    for ts in topik_sulit[:10]:
        if ts["rata_rata_penguasaan"] < 60:
            gap_pembelajaran.append(ts["topik"])
    
    # Saran urutan (dari dasar ke lanjutan)
    saran_urutan = topik_prioritas[:5] + gap_pembelajaran[:3]
    
    return {
        "topik_prioritas": topik_prioritas[:10],
        "topik_mudah": topik_mudah[:10],
        "gap_pembelajaran": gap_pembelajaran,
        "saran_urutan": saran_urutan
    }


async def dapatkan_system_health() -> Dict:
    """
    Dapatkan status kesehatan sistem
    
    Returns:
        Dict dengan system health metrics
    """
    import time
    
    # Test database connection
    db_start = time.time()
    try:
        await prisma.user.count()
        db_time = (time.time() - db_start) * 1000
        db_status = "healthy" if db_time < 100 else "slow"
    except Exception:
        db_status = "unhealthy"
        db_time = 0
    
    # API metrics (24 jam terakhir)
    awal = datetime.now() - timedelta(days=1)
    
    api_metrics = await prisma.metrikapi.find_many(
        where={"createdAt": {"gte": awal}}
    )
    
    if api_metrics:
        total_requests = len(api_metrics)
        avg_response = sum(m.waktuRespons for m in api_metrics) / total_requests
        error_count = sum(1 for m in api_metrics if m.statusCode >= 400)
        error_rate = (error_count / total_requests) * 100
    else:
        total_requests = 0
        avg_response = 0
        error_rate = 0
    
    # Overall status
    if db_status == "unhealthy" or error_rate > 10:
        status = "unhealthy"
    elif error_rate > 5 or avg_response > 1000:
        status = "degraded"
    else:
        status = "healthy"
    
    return {
        "status": status,
        "database": db_status,
        "api_response_time_avg": round(avg_response, 2),
        "error_rate_24h": round(error_rate, 2),
        "total_requests_24h": total_requests,
        "uptime": "99.9%"  # Placeholder - bisa diimplementasi dengan tracking
    }
