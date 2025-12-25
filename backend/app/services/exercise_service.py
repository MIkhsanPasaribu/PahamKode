"""
Exercise Service - Business logic untuk Practice Exercises
"""

from app.database import prisma
from typing import List, Dict, Any
from datetime import datetime


async def dapatkan_exercises_by_topik(topik: str, limit: int = 10) -> List[Dict[str, Any]]:
    """
    Dapatkan exercises berdasarkan topik
    
    Args:
        topik: Topik yang ingin dilatih
        limit: Maksimal jumlah exercises
        
    Returns:
        List exercises
    """
    exercises = await prisma.exercise.find_many(
        where={"topik": topik},
        take=limit,
        order={"dibuat": "desc"}
    )
    
    return [
        {
            "id": ex.id,
            "judul": ex.judul,
            "deskripsi": ex.deskripsi,
            "topik": ex.topik,
            "tingkat_kesulitan": ex.tingkatKesulitan,
            "instruksi": ex.instruksi,
            "kode_pemula": ex.kodePemula,
            "solusi_referensi": ex.solusiReferensi,
            "test_cases": ex.testCases,
            "poin_belajar": ex.poinBelajar,
            "estimasi_waktu": ex.estimasiWaktu,
            "dibuat": ex.dibuat,
            "diperbarui": ex.diperbarui
        }
        for ex in exercises
    ]


async def dapatkan_exercises_rekomendasi(id_mahasiswa: str, limit: int = 5) -> List[Dict[str, Any]]:
    """
    Dapatkan exercises yang direkomendasikan berdasarkan topik lemah mahasiswa
    
    Args:
        id_mahasiswa: ID mahasiswa
        limit: Maksimal jumlah exercises
        
    Returns:
        List recommended exercises
    """
    # Ambil topik-topik terlemah mahasiswa
    progress = await prisma.progressbelajar.find_many(
        where={"idMahasiswa": id_mahasiswa},
        order={"tingkatPenguasaan": "asc"},
        take=3  # Top 3 topik terlemah
    )
    
    if not progress:
        # Jika belum ada progress, ambil exercise pemula
        exercises = await prisma.exercise.find_many(
            where={"tingkatKesulitan": "pemula"},
            take=limit,
            order={"dibuat": "desc"}
        )
    else:
        # Ambil exercises dari topik-topik terlemah
        topik_lemah = [p.topik for p in progress]
        exercises = await prisma.exercise.find_many(
            where={
                "topik": {"in": topik_lemah}
            },
            take=limit,
            order={"dibuat": "desc"}
        )
    
    return [
        {
            "id": ex.id,
            "judul": ex.judul,
            "deskripsi": ex.deskripsi,
            "topik": ex.topik,
            "tingkat_kesulitan": ex.tingkatKesulitan,
            "instruksi": ex.instruksi,
            "kode_pemula": ex.kodePemula,
            "solusi_referensi": ex.solusiReferensi,
            "test_cases": ex.testCases,
            "poin_belajar": ex.poinBelajar,
            "estimasi_waktu": ex.estimasiWaktu,
            "dibuat": ex.dibuat,
            "diperbarui": ex.diperbarui
        }
        for ex in exercises
    ]


async def submit_exercise_solution(
    id_mahasiswa: str,
    id_exercise: str,
    kode_submisi: str
) -> Dict[str, Any]:
    """
    Submit solusi exercise dan berikan feedback sederhana
    
    Args:
        id_mahasiswa: ID mahasiswa
        id_exercise: ID exercise
        kode_submisi: Kode solusi mahasiswa
        
    Returns:
        Submission data dengan feedback
    """
    # Ambil exercise untuk compare dengan solusi referensi
    exercise = await prisma.exercise.find_unique(where={"id": id_exercise})
    
    if not exercise:
        raise ValueError("Exercise tidak ditemukan")
    
    # Feedback sederhana (bisa di-enhance dengan AI nanti)
    status_selesai = len(kode_submisi.strip()) > 0
    nilai_score = None
    feedback = None
    
    if status_selesai:
        # Simple scoring: Check if solution has similar length to reference
        # (ini hanya placeholder, bisa di-improve dengan proper code evaluation)
        similarity_ratio = min(len(kode_submisi), len(exercise.solusiReferensi)) / max(len(kode_submisi), len(exercise.solusiReferensi))
        nilai_score = int(similarity_ratio * 100)
        
        if nilai_score >= 80:
            feedback = "✅ Solusi Anda sangat baik! Kode mirip dengan solusi referensi."
        elif nilai_score >= 60:
            feedback = "👍 Solusi Anda cukup baik, tapi bisa ditingkatkan lagi."
        else:
            feedback = "💡 Solusi Anda perlu perbaikan. Coba bandingkan dengan solusi referensi."
    else:
        feedback = "⚠️ Solusi kosong. Silakan tulis kode Anda."
    
    # Simpan submission
    submission = await prisma.exercisesubmission.create(
        data={
            "idMahasiswa": id_mahasiswa,
            "idExercise": id_exercise,
            "kodeSubmisi": kode_submisi,
            "statusSelesai": status_selesai,
            "nilaiScore": nilai_score,
            "feedback": feedback
        }
    )
    
    return {
        "id": submission.id,
        "id_mahasiswa": submission.idMahasiswa,
        "id_exercise": submission.idExercise,
        "kode_submisi": submission.kodeSubmisi,
        "status_selesai": submission.statusSelesai,
        "nilai_score": submission.nilaiScore,
        "feedback": submission.feedback,
        "created_at": submission.createdAt
    }


async def dapatkan_submission_history(id_mahasiswa: str, limit: int = 20) -> List[Dict[str, Any]]:
    """
    Dapatkan history submissions mahasiswa
    
    Args:
        id_mahasiswa: ID mahasiswa
        limit: Maksimal jumlah submissions
        
    Returns:
        List submission history
    """
    # Fetch submissions (tanpa include karena relation di-comment)
    submissions = await prisma.exercisesubmission.find_many(
        where={"idMahasiswa": id_mahasiswa},
        take=limit,
        order={"createdAt": "desc"}
    )
    
    # Build response dengan manual fetch exercise
    result = []
    for sub in submissions:
        # Fetch exercise data manually jika perlu
        exercise = await prisma.exercise.find_unique(
            where={"id": sub.idExercise}
        ) if sub.idExercise else None
        
        result.append({
            "id": sub.id,
            "id_exercise": sub.idExercise,
            "exercise_judul": exercise.judul if exercise else "Unknown",
            "exercise_topik": exercise.topik if exercise else "Unknown",
            "status_selesai": sub.statusSelesai,
            "nilai_score": sub.nilaiScore,
            "feedback": sub.feedback,
            "created_at": sub.createdAt
        })
    
    return result
