"""
Mahasiswa Routes - Dashboard, Learning Resources
"""

from fastapi import APIRouter, HTTPException, Depends, Query
from fastapi.responses import Response
from app.models.schemas import (
    ResponseDashboardMahasiswa,
    ResponseSumberDaya
)
from app.services.mahasiswa_service import (
    dapatkan_dashboard_mahasiswa,
    dapatkan_sumber_daya_rekomendasi,
    generate_export_csv,
    generate_export_data
)
from app.utils.auth import dapatkan_user_sekarang

router = APIRouter()


@router.get("/dashboard", response_model=ResponseDashboardMahasiswa)
async def dapatkan_dashboard(user_id: str = Depends(dapatkan_user_sekarang)):
    """
    Dapatkan dashboard overview mahasiswa
    
    Returns:
        - Total error & pola
        - Rata-rata penguasaan
        - Tren perbaikan
        - Aktivitas terbaru
        - Topik rekomendasi
    """
    try:
        dashboard = await dapatkan_dashboard_mahasiswa(user_id)
        return dashboard
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Gagal mengambil dashboard: {str(e)}"
        )


@router.get("/learning-resources", response_model=list[ResponseSumberDaya])
async def dapatkan_learning_resources(
    user_id: str = Depends(dapatkan_user_sekarang),
    limit: int = Query(default=10, ge=1, le=50, description="Maksimal jumlah resources")
):
    """
    Dapatkan learning resources yang direkomendasikan
    berdasarkan topik lemah mahasiswa
    
    Returns:
        List sumber daya pembelajaran (video, artikel, tutorial, dll)
    """
    try:
        resources = await dapatkan_sumber_daya_rekomendasi(user_id, limit)
        return resources
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Gagal mengambil learning resources: {str(e)}"
        )


@router.get("/export/csv")
async def export_progress_csv(
    user_id: str = Depends(dapatkan_user_sekarang),
    periode: str = Query(default="bulan_ini", description="minggu_ini, bulan_ini, semua")
):
    """
    Export progress report dalam format CSV
    
    Returns:
        CSV file download
    """
    try:
        csv_content = await generate_export_csv(user_id, periode)
        
        return Response(
            content=csv_content,
            media_type="text/csv",
            headers={
                "Content-Disposition": f"attachment; filename=progress_report_{periode}.csv"
            }
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Gagal generate CSV: {str(e)}"
        )


@router.get("/export/data")
async def export_progress_data(
    user_id: str = Depends(dapatkan_user_sekarang),
    periode: str = Query(default="bulan_ini", description="minggu_ini, bulan_ini, semua")
):
    """
    Export progress data (untuk PDF generation di frontend)
    
    Returns:
        JSON data untuk PDF
    """
    try:
        data = await generate_export_data(user_id, periode)
        return data
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Gagal generate export data: {str(e)}"
        )
