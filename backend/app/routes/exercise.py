"""
Exercise Routes - Practice Exercises untuk Mahasiswa
"""

from fastapi import APIRouter, HTTPException, Depends, Query
from app.models.schemas import (
    RequestTambahExercise,
    ResponseExercise,
    RequestSubmitExercise,
    ResponseExerciseSubmission
)
from app.services.exercise_service import (
    dapatkan_exercises_by_topik,
    dapatkan_exercises_rekomendasi,
    submit_exercise_solution,
    dapatkan_submission_history
)
from app.utils.auth import dapatkan_user_sekarang, verifikasi_admin
from typing import Optional, List

router = APIRouter()


@router.get("/rekomendasi", response_model=List[ResponseExercise])
async def dapatkan_exercise_rekomendasi(
    user_id: str = Depends(dapatkan_user_sekarang),
    limit: int = Query(default=5, ge=1, le=20, description="Maksimal jumlah exercises")
):
    """
    Dapatkan exercises yang direkomendasikan berdasarkan topik lemah mahasiswa
    
    Returns:
        List recommended exercises
    """
    try:
        exercises = await dapatkan_exercises_rekomendasi(user_id, limit)
        return exercises
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Gagal mengambil exercises: {str(e)}"
        )


@router.get("/by-topik", response_model=List[ResponseExercise])
async def dapatkan_exercises_topik(
    topik: str = Query(..., description="Topik yang ingin dilatih"),
    limit: int = Query(default=10, ge=1, le=50),
    user_id: str = Depends(dapatkan_user_sekarang)
):
    """
    Dapatkan exercises berdasarkan topik tertentu
    
    Returns:
        List exercises
    """
    try:
        exercises = await dapatkan_exercises_by_topik(topik, limit)
        return exercises
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Gagal mengambil exercises: {str(e)}"
        )


@router.post("/submit", response_model=ResponseExerciseSubmission)
async def submit_exercise(
    request: RequestSubmitExercise,
    user_id: str = Depends(dapatkan_user_sekarang)
):
    """
    Submit solusi exercise
    
    Returns:
        Submission result dengan feedback
    """
    try:
        submission = await submit_exercise_solution(
            id_mahasiswa=user_id,
            id_exercise=request.id_exercise,
            kode_submisi=request.kode_submisi
        )
        return submission
    except ValueError as ve:
        raise HTTPException(status_code=404, detail=str(ve))
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Gagal submit exercise: {str(e)}"
        )


@router.get("/submissions", response_model=List[ResponseExerciseSubmission])
async def dapatkan_history_submissions(
    user_id: str = Depends(dapatkan_user_sekarang),
    limit: int = Query(default=20, ge=1, le=100)
):
    """
    Dapatkan history submissions mahasiswa
    
    Returns:
        List submission history
    """
    try:
        history = await dapatkan_submission_history(user_id, limit)
        return history
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Gagal mengambil history: {str(e)}"
        )


# ============================================================
# Admin Routes untuk Manage Exercises
# ============================================================

@router.post("/admin/create", response_model=ResponseExercise)
async def tambah_exercise(
    request: RequestTambahExercise,
    admin = Depends(verifikasi_admin)
):
    """
    Tambah exercise baru
    
    **Requires**: Admin role
    """
    from app.database import prisma
    
    try:
        exercise = await prisma.exercise.create(
            data={
                "judul": request.judul,
                "deskripsi": request.deskripsi,
                "topik": request.topik,
                "tingkatKesulitan": request.tingkat_kesulitan,
                "instruksi": request.instruksi,
                "kodePemula": request.kode_pemula,
                "solusiReferensi": request.solusi_referensi,
                "testCases": request.test_cases,
                "poinBelajar": request.poin_belajar,
                "estimasiWaktu": request.estimasi_waktu
            }
        )
        
        return ResponseExercise(
            id=exercise.id,
            judul=exercise.judul,
            deskripsi=exercise.deskripsi,
            topik=exercise.topik,
            tingkat_kesulitan=exercise.tingkatKesulitan,
            instruksi=exercise.instruksi,
            kode_pemula=exercise.kodePemula,
            solusi_referensi=exercise.solusiReferensi,
            test_cases=exercise.testCases,
            poin_belajar=exercise.poinBelajar,
            estimasi_waktu=exercise.estimasiWaktu,
            dibuat=exercise.dibuat,
            diperbarui=exercise.diperbarui
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Gagal tambah exercise: {str(e)}"
        )


@router.get("/admin/all", response_model=List[ResponseExercise])
async def dapatkan_semua_exercises_admin(
    limit: int = Query(default=50, ge=1, le=100),
    topik: Optional[str] = Query(default=None),
    admin = Depends(verifikasi_admin)
):
    """
    Dapatkan semua exercises (admin only)
    
    **Requires**: Admin role
    """
    from app.database import prisma
    from typing import Any, cast

    try:
        where_clause: Any = {}
        if topik:
            where_clause["topik"] = topik
        
        exercises = await prisma.exercise.find_many(
            where=cast(Any, where_clause) if where_clause else None,
            take=limit,
            order={"dibuat": "desc"}
        )
        
        return [
            ResponseExercise(
                id=ex.id,
                judul=ex.judul,
                deskripsi=ex.deskripsi,
                topik=ex.topik,
                tingkat_kesulitan=ex.tingkatKesulitan,
                instruksi=ex.instruksi,
                kode_pemula=ex.kodePemula,
                solusi_referensi=ex.solusiReferensi,
                test_cases=ex.testCases,
                poin_belajar=ex.poinBelajar,
                estimasi_waktu=ex.estimasiWaktu,
                dibuat=ex.dibuat,
                diperbarui=ex.diperbarui
            )
            for ex in exercises
        ]
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Gagal mengambil exercises: {str(e)}"
        )
