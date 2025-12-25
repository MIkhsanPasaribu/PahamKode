"""
Pydantic Schemas untuk Request/Response Models
Semua field menggunakan Bahasa Indonesia sesuai syarat pengembangan
"""

from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
from enum import Enum
from datetime import datetime


class LevelBloom(str, Enum):
    """Enum untuk Bloom's Taxonomy Level"""
    REMEMBER = "Remember"
    UNDERSTAND = "Understand"
    APPLY = "Apply"
    ANALYZE = "Analyze"
    EVALUATE = "Evaluate"
    CREATE = "Create"


class RoleUser(str, Enum):
    """Enum untuk Role User"""
    MAHASISWA = "mahasiswa"
    ADMIN = "admin"
    PENGAJAR = "pengajar"


# ============================================================
# Auth Schemas
# ============================================================

class RequestRegister(BaseModel):
    """Request untuk registrasi user baru"""
    email: EmailStr = Field(..., description="Email mahasiswa")
    password: str = Field(..., min_length=8, description="Password (minimal 8 karakter)")
    nama: Optional[str] = Field(None, description="Nama lengkap mahasiswa")


class RequestLogin(BaseModel):
    """Request untuk login"""
    email: EmailStr = Field(..., description="Email mahasiswa")
    password: str = Field(..., description="Password")


class ResponseAuth(BaseModel):
    """Response setelah login/register berhasil"""
    access_token: str = Field(..., description="JWT access token")
    token_type: str = Field(default="bearer", description="Tipe token")
    user: "ResponseUser" = Field(..., description="Data user")


class ResponseUser(BaseModel):
    """Response untuk data user"""
    id: str = Field(..., description="User ID")
    email: str = Field(..., description="Email mahasiswa")
    nama: Optional[str] = Field(None, description="Nama mahasiswa")
    role: str = Field(..., description="Role user: mahasiswa, admin, pengajar")
    tingkat_kemahiran: str = Field(..., description="Level kemahiran: pemula, menengah, mahir")
    created_at: datetime = Field(..., description="Tanggal registrasi")


# ============================================================
# Error Analysis Schemas
# ============================================================

class RequestAnalisis(BaseModel):
    """Request untuk analisis error semantik"""
    kode: str = Field(..., description="Kode program yang mengandung error")
    pesan_error: str = Field(..., description="Pesan error dari compiler/interpreter")
    bahasa: str = Field(default="python", description="Bahasa pemrograman")
    id_mahasiswa: str = Field(..., description="ObjectId mahasiswa")


class HasilAnalisis(BaseModel):
    """Response hasil analisis semantik error"""
    tipe_error: str = Field(..., description="Kategori tipe error")
    penyebab_utama: str = Field(..., description="Penyebab utama dari perspektif konseptual")
    kesenjangan_konsep: str = Field(..., description="Miskonsepsi atau gap pengetahuan spesifik")
    level_bloom: LevelBloom = Field(..., description="Level Bloom untuk kedalaman penjelasan")
    penjelasan: str = Field(..., description="Penjelasan mendalam MENGAPA error terjadi")
    saran_perbaikan: str = Field(..., description="Saran konkret untuk memperbaiki kode")
    topik_terkait: List[str] = Field(..., description="Topik-topik yang perlu dipelajari")
    saran_latihan: str = Field(..., description="Saran latihan untuk memperkuat pemahaman")
    peringatan_pola: Optional[str] = Field(None, description="Peringatan jika ada pola kesalahan berulang")
    jumlah_error_serupa: int = Field(default=0, description="Jumlah error serupa di masa lalu")


class ResponseRiwayat(BaseModel):
    """Response untuk riwayat submisi error"""
    id: str
    kode: str
    pesan_error: str
    bahasa: str
    tipe_error: Optional[str]
    level_bloom: Optional[str]
    created_at: datetime


class ResponsePolaError(BaseModel):
    """Response untuk pola kesalahan mahasiswa"""
    id: str
    jenis_kesalahan: str
    frekuensi: int
    kejadian_pertama: Optional[datetime]
    kejadian_terakhir: Optional[datetime]
    deskripsi_miskonsepsi: Optional[str]
    sumber_daya_direkomendasikan: List[str]


class ResponseProgressBelajar(BaseModel):
    """Response untuk progress belajar mahasiswa"""
    id: str
    topik: str
    tingkat_penguasaan: int
    jumlah_error_di_topik: int
    tanggal_error_terakhir: Optional[datetime]
    tren_perbaikan: Optional[str]


# ============================================================
# Admin Schemas
# ============================================================

class ResponseStatistikDashboard(BaseModel):
    """Response untuk statistik dashboard admin"""
    total_mahasiswa: int = Field(..., description="Total jumlah mahasiswa terdaftar")
    pertumbuhan_mahasiswa_bulan_ini: int = Field(..., description="Pertambahan mahasiswa bulan ini")
    total_analisis: int = Field(..., description="Total analisis yang dilakukan")
    total_analisis_hari_ini: int = Field(..., description="Total analisis hari ini")
    total_analisis_minggu_ini: int = Field(..., description="Total analisis minggu ini")
    total_analisis_bulan_ini: int = Field(..., description="Total analisis bulan ini")
    rata_rata_tingkat_penguasaan: float = Field(..., description="Rata-rata tingkat penguasaan global (0-100)")
    top_errors: List["TopErrorItem"] = Field(..., description="Top 5 error paling sering")
    mahasiswa_dengan_kesulitan: List["MahasiswaKesulitanItem"] = Field(..., description="Top 5 mahasiswa dengan banyak error")


class TopErrorItem(BaseModel):
    """Item untuk top error"""
    tipe_error: str = Field(..., description="Tipe error")
    jumlah: int = Field(..., description="Jumlah kemunculan")


class MahasiswaKesulitanItem(BaseModel):
    """Item untuk mahasiswa dengan kesulitan"""
    id: str = Field(..., description="ID mahasiswa")
    nama: Optional[str] = Field(..., description="Nama mahasiswa")
    email: str = Field(..., description="Email mahasiswa")
    jumlah_error: int = Field(..., description="Jumlah total error")


class ResponseMahasiswa(BaseModel):
    """Response untuk data mahasiswa (untuk admin)"""
    id: str
    email: str
    nama: Optional[str]
    role: str
    tingkat_kemahiran: str
    created_at: datetime
    total_submisi: int = Field(default=0, description="Total submisi error")
    total_pola: int = Field(default=0, description="Total pola kesalahan unik")


class ResponseMahasiswaList(BaseModel):
    """Response untuk list mahasiswa dengan pagination"""
    mahasiswa: List[ResponseMahasiswa]
    total: int
    halaman: int
    ukuran_halaman: int
    total_halaman: int


class ResponseDetailMahasiswa(BaseModel):
    """Response detail mahasiswa untuk admin"""
    user: ResponseMahasiswa
    statistik: "StatistikMahasiswa"
    pola_kesalahan_terbanyak: List[ResponsePolaError]
    topik_terlemah: List[ResponseProgressBelajar]
    riwayat_terbaru: List[ResponseRiwayat]


class StatistikMahasiswa(BaseModel):
    """Statistik detail mahasiswa"""
    total_submisi: int
    total_pola_unik: int
    rata_rata_penguasaan: float
    tren_perbaikan: str  # "membaik", "stabil", "menurun"
    error_pertama: Optional[datetime]
    error_terakhir: Optional[datetime]


class ResponsePolaGlobal(BaseModel):
    """Response untuk pola kesalahan global"""
    jenis_kesalahan: str
    total_kemunculan: int
    jumlah_mahasiswa_terpengaruh: int
    persentase_mahasiswa: float
    miskonsepsi_umum: List[str]


class ResponseAnalyticsTren(BaseModel):
    """Response untuk analytics trend"""
    tanggal: str
    jumlah_analisis: int
    mahasiswa_aktif: int


# ============================================================
# Admin - User Management Schemas
# ============================================================

class RequestUbahStatusMahasiswa(BaseModel):
    """Request untuk suspend/activate mahasiswa"""
    status: str = Field(..., description="Status baru: aktif atau suspended")


class RequestBulkAction(BaseModel):
    """Request untuk bulk operations"""
    id_mahasiswa_list: List[str] = Field(..., description="List ID mahasiswa")
    action: str = Field(..., description="Action: suspend, activate, delete")


# ============================================================
# Admin - AI Metrics Schemas
# ============================================================

class ResponseMetrikAI(BaseModel):
    """Response untuk metrik AI"""
    total_requests: int = Field(..., description="Total request ke AI")
    total_token_input: int = Field(..., description="Total token input")
    total_token_output: int = Field(..., description="Total token output")
    total_token: int = Field(..., description="Total semua token")
    total_biaya: float = Field(..., description="Total biaya dalam USD")
    rata_rata_waktu_respons: float = Field(..., description="Rata-rata waktu respons dalam detik")
    success_rate: float = Field(..., description="Persentase request berhasil")


# ============================================================
# Content Management Schemas
# ============================================================

class RequestTambahSumberDaya(BaseModel):
    """Request untuk tambah sumber daya pembelajaran"""
    judul: str = Field(..., description="Judul sumber daya")
    deskripsi: Optional[str] = Field(None, description="Deskripsi singkat")
    tipe: str = Field(..., description="Tipe: video, artikel, tutorial, exercise, quiz")
    url: Optional[str] = Field(None, description="URL eksternal")
    konten: Optional[str] = Field(None, description="Konten internal")
    topik_terkait: List[str] = Field(default=[], description="List topik terkait")
    tingkat_kesulitan: str = Field(default="pemula", description="pemula, menengah, mahir")
    durasi: Optional[int] = Field(None, description="Durasi dalam menit")


class ResponseSumberDaya(BaseModel):
    """Response untuk sumber daya pembelajaran"""
    id: str
    judul: str
    deskripsi: Optional[str]
    tipe: str
    url: Optional[str]
    konten: Optional[str]
    topik_terkait: List[str]
    tingkat_kesulitan: str
    durasi: Optional[int]
    dibuat: datetime
    diperbarui: datetime


# ============================================================
# Mahasiswa Dashboard Schemas
# ============================================================

class ResponseDashboardMahasiswa(BaseModel):
    """Response untuk dashboard mahasiswa"""
    total_error: int = Field(..., description="Total error yang pernah disubmit")
    total_pola_unik: int = Field(..., description="Total pola kesalahan unik")
    rata_rata_penguasaan: float = Field(..., description="Rata-rata tingkat penguasaan (0-100)")
    tren_perbaikan: str = Field(..., description="membaik, stabil, menurun")
    error_minggu_ini: int = Field(..., description="Jumlah error minggu ini")
    topik_dikuasai: int = Field(..., description="Jumlah topik dengan penguasaan >70")
    aktivitas_terbaru: List["AktivitasItem"] = Field(..., description="5 aktivitas terbaru")
    topik_rekomendasi: List[str] = Field(..., description="Topik yang direkomendasikan untuk dipelajari")


class AktivitasItem(BaseModel):
    """Item untuk aktivitas terbaru"""
    tipe: str = Field(..., description="Tipe aktivitas: analisis_error, pola_terdeteksi")
    deskripsi: str = Field(..., description="Deskripsi singkat")
    waktu: datetime = Field(..., description="Waktu aktivitas")


# ============================================================
# Export Schemas
# ============================================================

class RequestExportLaporan(BaseModel):
    """Request untuk export laporan"""
    format: str = Field(..., description="Format export: pdf atau csv")
    periode: str = Field(default="bulan_ini", description="Periode: minggu_ini, bulan_ini, semua")


# ============================================================
# Topik Pembelajaran Schemas
# ============================================================

class RequestTambahTopik(BaseModel):
    """Request untuk tambah topik pembelajaran"""
    nama: str = Field(..., description="Nama topik")
    deskripsi: Optional[str] = Field(None, description="Deskripsi topik")
    kategori: str = Field(..., description="Kategori: dasar, lanjutan, expert")
    tingkat_kesulitan: str = Field(default="pemula", description="pemula, menengah, mahir")
    prerequisite: List[str] = Field(default=[], description="Topik prerequisite")
    tujuan_pembelajaran: List[str] = Field(default=[], description="Learning objectives")
    estimasi_waktu: Optional[int] = Field(None, description="Estimasi waktu dalam menit")


class ResponseTopikPembelajaran(BaseModel):
    """Response untuk topik pembelajaran"""
    id: str
    nama: str
    deskripsi: Optional[str]
    kategori: str
    tingkat_kesulitan: str
    prerequisite: List[str]
    tujuan_pembelajaran: List[str]
    estimasi_waktu: Optional[int]
    total_error: int
    dibuat: datetime
    diperbarui: datetime


# ============================================================
# System Monitoring Schemas
# ============================================================

class ResponseSystemHealth(BaseModel):
    """Response untuk system health check"""
    status: str = Field(..., description="healthy, degraded, unhealthy")
    database: str = Field(..., description="Status database")
    api_response_time_avg: float = Field(..., description="Rata-rata response time (ms)")
    error_rate_24h: float = Field(..., description="Error rate 24 jam terakhir (%)")
    total_requests_24h: int = Field(..., description="Total requests 24 jam")
    uptime: str = Field(..., description="Uptime sistem")


class ResponseTopikSulit(BaseModel):
    """Response untuk topik paling sulit"""
    topik: str = Field(..., description="Nama topik")
    total_error: int = Field(..., description="Total error di topik ini")
    jumlah_mahasiswa_kesulitan: int = Field(..., description="Jumlah mahasiswa yang kesulitan")
    persentase_mahasiswa: float = Field(..., description="Persentase dari total mahasiswa")
    rata_rata_penguasaan: float = Field(..., description="Rata-rata tingkat penguasaan")


class ResponseRekomendasiKurikulum(BaseModel):
    """Response untuk rekomendasi kurikulum"""
    topik_prioritas: List[str] = Field(..., description="Topik yang perlu diprioritaskan")
    topik_mudah: List[str] = Field(..., description="Topik yang sudah dikuasai")
    gap_pembelajaran: List[str] = Field(..., description="Gap yang perlu diisi")
    saran_urutan: List[str] = Field(..., description="Urutan pembelajaran yang disarankan")


# ============================================================
# Exercise & Quiz Schemas
# ============================================================

class RequestTambahExercise(BaseModel):
    """Request untuk tambah exercise"""
    judul: str = Field(..., description="Judul exercise")
    deskripsi: str = Field(..., description="Deskripsi exercise")
    topik: str = Field(..., description="Topik yang dilatih")
    tingkat_kesulitan: str = Field(default="pemula", description="pemula, menengah, mahir")
    instruksi: str = Field(..., description="Instruksi lengkap")
    kode_pemula: Optional[str] = Field(None, description="Starter code")
    solusi_referensi: str = Field(..., description="Reference solution")
    test_cases: List[str] = Field(default=[], description="Test case descriptions")
    poin_belajar: List[str] = Field(default=[], description="Learning points")
    estimasi_waktu: Optional[int] = Field(None, description="Estimasi waktu (menit)")


class ResponseExercise(BaseModel):
    """Response untuk exercise"""
    id: str
    judul: str
    deskripsi: str
    topik: str
    tingkat_kesulitan: str
    instruksi: str
    kode_pemula: Optional[str]
    solusi_referensi: str
    test_cases: List[str]
    poin_belajar: List[str]
    estimasi_waktu: Optional[int]
    dibuat: datetime
    diperbarui: datetime


class RequestSubmitExercise(BaseModel):
    """Request untuk submit exercise solution"""
    id_exercise: str = Field(..., description="ID exercise")
    kode_submisi: str = Field(..., description="Kode solusi mahasiswa")


class ResponseExerciseSubmission(BaseModel):
    """Response untuk exercise submission"""
    id: str
    id_mahasiswa: str
    id_exercise: str
    kode_submisi: str
    status_selesai: bool
    nilai_score: Optional[int]
    feedback: Optional[str]
    created_at: datetime

