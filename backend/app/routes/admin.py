"""
Admin Routes - Dashboard, User Management, Analytics
Hanya dapat diakses oleh user dengan role "admin"
"""

from fastapi import APIRouter, HTTPException, Depends, Query
from app.models.schemas import (
    ResponseStatistikDashboard,
    ResponseMahasiswaList,
    ResponseDetailMahasiswa,
    ResponsePolaGlobal,
    ResponseAnalyticsTren,
    RequestUbahStatusMahasiswa,
    RequestBulkAction,
    ResponseMetrikAI,
    RequestTambahSumberDaya,
    ResponseSumberDaya,
    RequestTambahTopik,
    ResponseTopikPembelajaran,
    ResponseSystemHealth,
    ResponseTopikSulit,
    ResponseRekomendasiKurikulum
)
from app.services.admin_service import (
    dapatkan_statistik_dashboard,
    dapatkan_semua_mahasiswa,
    dapatkan_detail_mahasiswa,
    dapatkan_pola_kesalahan_global,
    dapatkan_analytics_tren,
    ubah_status_mahasiswa,
    bulk_action_mahasiswa,
    dapatkan_metrik_ai,
    dapatkan_topik_sulit,
    dapatkan_rekomendasi_kurikulum,
    dapatkan_system_health
)
from app.utils.auth import verifikasi_admin
from typing import Optional

router = APIRouter()


@router.get("/dashboard", response_model=ResponseStatistikDashboard)
async def dapatkan_dashboard_admin(admin = Depends(verifikasi_admin)):
    """
    Dapatkan statistik dashboard admin
    
    **Requires**: Admin role
    
    Returns:
        - Total mahasiswa & pertumbuhan
        - Total analisis (hari ini, minggu ini, bulan ini)
        - Rata-rata tingkat penguasaan global
        - Top 5 error paling sering
        - Top 5 mahasiswa dengan kesulitan terbanyak
    """
    try:
        statistik = await dapatkan_statistik_dashboard()
        return statistik
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Gagal mengambil statistik dashboard: {str(e)}"
        )


@router.get("/mahasiswa", response_model=ResponseMahasiswaList)
async def dapatkan_list_mahasiswa(
    halaman: int = Query(default=1, ge=1, description="Nomor halaman"),
    ukuran_halaman: int = Query(default=20, ge=1, le=100, description="Jumlah item per halaman"),
    pencarian: Optional[str] = Query(default=None, description="Keyword pencarian (email atau nama)"),
    admin = Depends(verifikasi_admin)
):
    """
    Dapatkan list semua mahasiswa dengan pagination dan search
    
    **Requires**: Admin role
    
    Query Parameters:
        - halaman: Nomor halaman (default: 1)
        - ukuran_halaman: Jumlah item per halaman (default: 20, max: 100)
        - pencarian: Keyword untuk search di email atau nama
    
    Returns:
        List mahasiswa dengan info pagination
    """
    try:
        mahasiswa_list = await dapatkan_semua_mahasiswa(
            halaman=halaman,
            ukuran_halaman=ukuran_halaman,
            pencarian=pencarian
        )
        return mahasiswa_list
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Gagal mengambil list mahasiswa: {str(e)}"
        )


@router.get("/mahasiswa/{id_mahasiswa}", response_model=ResponseDetailMahasiswa)
async def dapatkan_detail_mhs(
    id_mahasiswa: str,
    admin = Depends(verifikasi_admin)
):
    """
    Dapatkan detail lengkap mahasiswa
    
    **Requires**: Admin role
    
    Returns:
        - Data mahasiswa
        - Statistik (total submisi, pola, rata-rata penguasaan, tren)
        - Pola kesalahan terbanyak (top 5)
        - Topik terlemah (top 5)
        - Riwayat submisi terbaru (10 terakhir)
    """
    try:
        detail = await dapatkan_detail_mahasiswa(id_mahasiswa)
        return detail
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Gagal mengambil detail mahasiswa: {str(e)}"
        )


@router.get("/analytics/patterns-global", response_model=list[ResponsePolaGlobal])
async def dapatkan_pola_global(
    limit: int = Query(default=20, ge=1, le=50, description="Maksimal jumlah pola"),
    admin = Depends(verifikasi_admin)
):
    """
    Dapatkan pola kesalahan global di seluruh sistem
    
    **Requires**: Admin role
    
    Returns:
        List pola kesalahan dengan:
        - Jenis kesalahan
        - Total kemunculan
        - Jumlah & persentase mahasiswa terpengaruh
        - Miskonsepsi umum
    """
    try:
        pola_global = await dapatkan_pola_kesalahan_global(limit=limit)
        return pola_global
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Gagal mengambil pola global: {str(e)}"
        )


@router.get("/analytics/trends", response_model=list[ResponseAnalyticsTren])
async def dapatkan_tren_analytics(
    jumlah_hari: int = Query(default=7, ge=1, le=30, description="Jumlah hari yang ditampilkan"),
    admin = Depends(verifikasi_admin)
):
    """
    Dapatkan tren analytics untuk beberapa hari terakhir
    
    **Requires**: Admin role
    
    Returns:
        List tren per hari dengan:
        - Tanggal
        - Jumlah analisis
        - Jumlah mahasiswa aktif
    """
    try:
        tren = await dapatkan_analytics_tren(jumlah_hari=jumlah_hari)
        return tren
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Gagal mengambil tren analytics: {str(e)}"
        )


@router.patch("/mahasiswa/{id_mahasiswa}/status")
async def ubah_status_mhs(
    id_mahasiswa: str,
    request: RequestUbahStatusMahasiswa,
    admin = Depends(verifikasi_admin)
):
    """
    Suspend atau activate mahasiswa
    
    **Requires**: Admin role
    """
    try:
        user = await ubah_status_mahasiswa(id_mahasiswa, request.status)
        if not user:
            raise HTTPException(status_code=404, detail="Mahasiswa tidak ditemukan")
        return {"message": f"Status mahasiswa berhasil diubah ke {request.status}", "user_id": user.id}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Gagal mengubah status: {str(e)}"
        )


@router.post("/mahasiswa/bulk-action")
async def bulk_action_mhs(
    request: RequestBulkAction,
    admin = Depends(verifikasi_admin)
):
    """
    Bulk operations untuk banyak mahasiswa
    
    **Requires**: Admin role
    
    Actions:
        - suspend: Suspend banyak mahasiswa sekaligus
        - activate: Activate banyak mahasiswa sekaligus
        - delete: Hapus banyak mahasiswa sekaligus (HATI-HATI!)
    """
    try:
        result = await bulk_action_mahasiswa(request.id_mahasiswa_list, request.action)
        return {"message": f"Bulk action '{request.action}' berhasil", "affected": result}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Gagal melakukan bulk action: {str(e)}"
        )


@router.get("/ai-metrics", response_model=ResponseMetrikAI)
async def dapatkan_ai_metrics(admin = Depends(verifikasi_admin)):
    """
    Dapatkan statistik penggunaan AI (tokens, biaya, dll)
    
    **Requires**: Admin role
    """
    try:
        metrics = await dapatkan_metrik_ai()
        return ResponseMetrikAI(**metrics)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Gagal mengambil metrik AI: {str(e)}"
        )


@router.post("/resources", response_model=ResponseSumberDaya)
async def tambah_sumber_daya(
    request: RequestTambahSumberDaya,
    admin = Depends(verifikasi_admin)
):
    """
    Tambah sumber daya pembelajaran baru
    
    **Requires**: Admin role
    """
    from app.database import prisma
    
    try:
        sumber_daya = await prisma.sumberdaya.create(
            data={
                "judul": request.judul,
                "deskripsi": request.deskripsi,
                "tipe": request.tipe,
                "url": request.url,
                "konten": request.konten,
                "topikTerkait": request.topik_terkait,
                "tingkatKesulitan": request.tingkat_kesulitan,
                "durasi": request.durasi
            }
        )
        
        return ResponseSumberDaya(
            id=sumber_daya.id,
            judul=sumber_daya.judul,
            deskripsi=sumber_daya.deskripsi,
            tipe=sumber_daya.tipe,
            url=sumber_daya.url,
            konten=sumber_daya.konten,
            topik_terkait=sumber_daya.topikTerkait,
            tingkat_kesulitan=sumber_daya.tingkatKesulitan,
            durasi=sumber_daya.durasi,
            dibuat=sumber_daya.dibuat,
            diperbarui=sumber_daya.diperbarui
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Gagal menambah sumber daya: {str(e)}"
        )


@router.get("/resources", response_model=list[ResponseSumberDaya])
async def dapatkan_semua_sumber_daya(
    limit: int = Query(default=50, ge=1, le=100),
    tipe: Optional[str] = Query(default=None, description="Filter by tipe: video, artikel, dll"),
    admin = Depends(verifikasi_admin)
):
    """
    Dapatkan semua sumber daya pembelajaran
    
    **Requires**: Admin role
    """
    from app.database import prisma
    
    try:
        from typing import Any, cast
        
        where_clause: Any = {}
        if tipe:
            where_clause["tipe"] = tipe
        
        resources = await prisma.sumberdaya.find_many(
            where=cast(Any, where_clause) if where_clause else None,
            take=limit,
            order={"dibuat": "desc"}
        )
        
        return [
            ResponseSumberDaya(
                id=r.id,
                judul=r.judul,
                deskripsi=r.deskripsi,
                tipe=r.tipe,
                url=r.url,
                konten=r.konten,
                topik_terkait=r.topikTerkait,
                tingkat_kesulitan=r.tingkatKesulitan,
                durasi=r.durasi,
                dibuat=r.dibuat,
                diperbarui=r.diperbarui
            )
            for r in resources
        ]
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Gagal mengambil sumber daya: {str(e)}"
        )


@router.get("/analytics/topik-sulit", response_model=list[ResponseTopikSulit])
async def dapatkan_topik_paling_sulit(
    limit: int = Query(default=10, ge=1, le=50),
    admin = Depends(verifikasi_admin)
):
    """
    Dapatkan topik-topik paling sulit berdasarkan jumlah error
    
    **Requires**: Admin role
    """
    try:
        topik_sulit = await dapatkan_topik_sulit(limit)
        return [ResponseTopikSulit(**t) for t in topik_sulit]
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Gagal mengambil topik sulit: {str(e)}"
        )


@router.get("/analytics/rekomendasi-kurikulum", response_model=ResponseRekomendasiKurikulum)
async def dapatkan_rekomendasi_kurikulum_endpoint(
    admin = Depends(verifikasi_admin)
):
    """
    Dapatkan rekomendasi kurikulum berdasarkan data analytics
    
    **Requires**: Admin role
    """
    try:
        rekomendasi = await dapatkan_rekomendasi_kurikulum()
        return ResponseRekomendasiKurikulum(**rekomendasi)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Gagal membuat rekomendasi kurikulum: {str(e)}"
        )


@router.get("/system/health", response_model=ResponseSystemHealth)
async def cek_system_health(admin = Depends(verifikasi_admin)):
    """
    Cek kesehatan sistem (database, API, error rates)
    
    **Requires**: Admin role
    """
    try:
        health = await dapatkan_system_health()
        return ResponseSystemHealth(**health)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Gagal mengecek system health: {str(e)}"
        )


@router.post("/topik", response_model=ResponseTopikPembelajaran)
async def tambah_topik_pembelajaran(
    request: RequestTambahTopik,
    admin = Depends(verifikasi_admin)
):
    """
    Tambah topik pembelajaran baru
    
    **Requires**: Admin role
    """
    from app.database import prisma
    
    try:
        topik = await prisma.topikpembelajaran.create(
            data={
                "nama": request.nama,
                "deskripsi": request.deskripsi,
                "kategori": request.kategori,
                "tingkatKesulitan": request.tingkat_kesulitan,
                "prerequisite": request.prerequisite,
                "tujuanPembelajaran": request.tujuan_pembelajaran,
                "estimasiWaktu": request.estimasi_waktu
            }
        )
        
        return ResponseTopikPembelajaran(
            id=topik.id,
            nama=topik.nama,
            deskripsi=topik.deskripsi,
            kategori=topik.kategori,
            tingkat_kesulitan=topik.tingkatKesulitan,
            prerequisite=topik.prerequisite,
            tujuan_pembelajaran=topik.tujuanPembelajaran,
            estimasi_waktu=topik.estimasiWaktu,
            total_error=topik.totalError,
            dibuat=topik.dibuat,
            diperbarui=topik.diperbarui
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Gagal menambah topik: {str(e)}"
        )


@router.get("/topik", response_model=list[ResponseTopikPembelajaran])
async def dapatkan_semua_topik(
    limit: int = Query(default=50, ge=1, le=100),
    kategori: Optional[str] = Query(default=None),
    admin = Depends(verifikasi_admin)
):
    """
    Dapatkan semua topik pembelajaran
    
    **Requires**: Admin role
    """
    from app.database import prisma
    
    try:
        from typing import Any, cast
        
        where_clause: Any = {}
        if kategori:
            where_clause["kategori"] = kategori
        
        topik_list = await prisma.topikpembelajaran.find_many(
            where=cast(Any, where_clause) if where_clause else None,
            take=limit,
            order={"dibuat": "desc"}
        )
        
        return [
            ResponseTopikPembelajaran(
                id=t.id,
                nama=t.nama,
                deskripsi=t.deskripsi,
                kategori=t.kategori,
                tingkat_kesulitan=t.tingkatKesulitan,
                prerequisite=t.prerequisite,
                tujuan_pembelajaran=t.tujuanPembelajaran,
                estimasi_waktu=t.estimasiWaktu,
                total_error=t.totalError,
                dibuat=t.dibuat,
                diperbarui=t.diperbarui
            )
            for t in topik_list
        ]
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Gagal mengambil topik: {str(e)}"
        )


@router.put("/topik/{id_topik}", response_model=ResponseTopikPembelajaran)
async def update_topik_pembelajaran(
    id_topik: str,
    request: RequestTambahTopik,
    admin = Depends(verifikasi_admin)
):
    """
    Update topik pembelajaran
    
    **Requires**: Admin role
    """
    from app.database import prisma
    
    try:
        topik = await prisma.topikpembelajaran.update(
            where={"id": id_topik},
            data={
                "nama": request.nama,
                "deskripsi": request.deskripsi,
                "kategori": request.kategori,
                "tingkatKesulitan": request.tingkat_kesulitan,
                "prerequisite": request.prerequisite,
                "tujuanPembelajaran": request.tujuan_pembelajaran,
                "estimasiWaktu": request.estimasi_waktu
            }
        )
        
        if not topik:
            raise HTTPException(status_code=404, detail="Topik tidak ditemukan")
        
        return ResponseTopikPembelajaran(
            id=topik.id,
            nama=topik.nama,
            deskripsi=topik.deskripsi or "",
            kategori=topik.kategori,
            tingkat_kesulitan=topik.tingkatKesulitan,
            prerequisite=topik.prerequisite,
            tujuan_pembelajaran=topik.tujuanPembelajaran,
            estimasi_waktu=topik.estimasiWaktu,
            total_error=topik.totalError,
            dibuat=topik.dibuat,
            diperbarui=topik.diperbarui
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Gagal mengupdate topik: {str(e)}"
        )


@router.delete("/topik/{id_topik}")
async def hapus_topik_pembelajaran(
    id_topik: str,
    admin = Depends(verifikasi_admin)
):
    """
    Hapus topik pembelajaran
    
    **Requires**: Admin role
    """
    from app.database import prisma
    
    try:
        await prisma.topikpembelajaran.delete(where={"id": id_topik})
        return {"message": "Topik berhasil dihapus", "id": id_topik}
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Gagal menghapus topik: {str(e)}"
        )
