"""
Service untuk Analisis Error Semantik
Core Objective #1: Semantic Error Analysis
"""

from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import PydanticOutputParser
from app.services.ai_service import dapatkan_llm
from app.models.schemas import HasilAnalisis
from app.database import prisma
from typing import Optional


async def analisis_error_semantik(
    kode: str,
    pesan_error: str,
    bahasa: str,
    id_mahasiswa: str
) -> HasilAnalisis:
    """
    Analisis error secara SEMANTIK menggunakan LangChain + AI
    
    Fokus pada:
    - MENGAPA error terjadi (bukan hanya apa errornya)
    - Kesenjangan konsep dan miskonsepsi
    - Penjelasan adaptif berdasarkan Bloom's Taxonomy
    - Rekomendasi pembelajaran yang dipersonalisasi
    
    Args:
        kode: Kode program yang mengandung error
        pesan_error: Pesan error dari compiler/interpreter
        bahasa: Bahasa pemrograman (python, javascript, dll)
        id_mahasiswa: UUID mahasiswa
        
    Returns:
        HasilAnalisis dengan analisis semantik lengkap
    """
    
    # 1. Ambil konteks mahasiswa dari database
    mahasiswa = await prisma.user.find_unique(where={"id": id_mahasiswa})
    
    riwayat_error = await prisma.submisierror.find_many(
        where={"idMahasiswa": id_mahasiswa},
        order={"createdAt": "desc"},
        take=5
    )
    
    # 2. Bangun string konteks riwayat
    konteks_riwayat = "\n".join([
        f"- {err.tipeError}: {err.kesenjanganKonsep}"
        for err in riwayat_error
        if err.tipeError and err.kesenjanganKonsep
    ]) or "Belum ada riwayat error sebelumnya"
    
    # 3. Setup output parser untuk structured output
    parser = PydanticOutputParser(pydantic_object=HasilAnalisis)
    
    # 4. Buat prompt template untuk analisis semantik
    prompt = ChatPromptTemplate.from_messages([
        ("system", """Kamu adalah seorang ahli pendidikan pemrograman yang spesialis dalam analisis error semantik.

Tugasmu adalah menganalisis error pemrograman dari perspektif KONSEPTUAL, bukan hanya sintaksis.
Fokus pada MENGAPA error terjadi dari sudut pandang pemahaman/pembelajaran.

Identifikasi:
- Kesenjangan konsep (miskonsepsi) yang menyebabkan error ini
- Penyebab utama dari perspektif teori pembelajaran
- Level Bloom's Taxonomy untuk kedalaman penjelasan yang tepat
- Topik-topik terkait yang perlu diperkuat

PENTING: 
- Gunakan Bahasa Indonesia yang jelas dan mudah dipahami
- Jelaskan dengan analogi konkret jika perlu
- Fokus pada pemahaman konseptual, bukan hanya fix kode

{format_instructions}"""),
        ("user", """Analisis error ini secara SEMANTIK:

**Kode:**
```{bahasa}
{kode}
```

**Pesan Error:**
{pesan_error}

**Konteks Mahasiswa:**
- Tingkat Kemahiran: {tingkat_kemahiran}
- Riwayat Error Terakhir:
{konteks_riwayat}

Berikan analisis mendalam yang fokus pada MENGAPA error ini terjadi dari sudut pandang pemahaman konsep.""")
    ])
    
    # 5. Buat chain
    llm = dapatkan_llm()
    chain = prompt | llm | parser
    
    # 6. Invoke chain untuk mendapatkan hasil analisis
    hasil = await chain.ainvoke({
        "kode": kode,
        "pesan_error": pesan_error,
        "bahasa": bahasa,
        "tingkat_kemahiran": mahasiswa.tingkatKemahiran if mahasiswa else "pemula",
        "konteks_riwayat": konteks_riwayat,
        "format_instructions": parser.get_format_instructions()
    })
    
    # 7. Simpan hasil analisis ke database
    await prisma.submisierror.create(
        data={
            "idMahasiswa": id_mahasiswa,
            "kode": kode,
            "pesanError": pesan_error,
            "bahasa": bahasa,
            "tipeError": hasil.tipe_error,
            "penyebabUtama": hasil.penyebab_utama,
            "kesenjanganKonsep": hasil.kesenjangan_konsep,
            "levelBloom": hasil.level_bloom.value,
            "penjelasan": hasil.penjelasan,
            "saranPerbaikan": hasil.saran_perbaikan,
            "topikTerkait": hasil.topik_terkait,
            "saranLatihan": hasil.saran_latihan,
        }
    )
    
    # 8. Pattern Mining: Cek apakah ada pola kesalahan berulang (≥3 kali)
    jumlah_error_serupa = await prisma.submisierror.count(
        where={
            "idMahasiswa": id_mahasiswa,
            "tipeError": hasil.tipe_error
        }
    )
    
    if jumlah_error_serupa >= 3:
        # Ada pola kesalahan berulang!
        hasil.peringatan_pola = (
            f"⚠️ Pola terdeteksi: Kamu sudah mengalami '{hasil.tipe_error}' "
            f"sebanyak {jumlah_error_serupa} kali. "
            f"Pertimbangkan untuk mempelajari kembali: {', '.join(hasil.topik_terkait[:3])}"
        )
        hasil.jumlah_error_serupa = jumlah_error_serupa
        
        # Update atau buat record pola error
        from typing import Any, cast
        
        try:
            await prisma.polaerror.upsert(
                where=cast(Any, {
                    "id_mahasiswa_jenis_kesalahan": {
                        "idMahasiswa": id_mahasiswa,
                        "jenisKesalahan": hasil.tipe_error
                    }
                }),
                data={
                    "create": {
                        "idMahasiswa": id_mahasiswa,
                        "jenisKesalahan": hasil.tipe_error,
                        "frekuensi": jumlah_error_serupa,
                        "kejadianPertama": riwayat_error[-1].createdAt if riwayat_error else None,
                        "deskripsiMiskonsepsi": hasil.kesenjangan_konsep,
                        "sumberDayaDirekomendasikan": hasil.topik_terkait
                    },
                    "update": {
                        "frekuensi": jumlah_error_serupa,
                        "deskripsiMiskonsepsi": hasil.kesenjangan_konsep
                    }
                }
            )
        except Exception as e:
            print(f"Warning: Upsert pola error failed: {e}")
        
        # Update progress belajar untuk setiap topik terkait
        for topik in hasil.topik_terkait:
            await perbarui_progress_belajar(id_mahasiswa, topik)
    
    return hasil


async def perbarui_progress_belajar(id_mahasiswa: str, topik: str) -> None:
    """
    Perbarui progress belajar mahasiswa untuk topik tertentu
    Core Objective #4: Personalized Learning
    """
    from typing import Any, cast
    
    # Hitung jumlah error di topik ini
    jumlah_error = await prisma.submisierror.count(
        where=cast(Any, {
            "idMahasiswa": id_mahasiswa,
            "topikTerkait": {
                "array_contains": topik
            }
        })
    )
    
    # Tentukan tingkat penguasaan (inverse dari jumlah error)
    # Semakin banyak error, semakin rendah penguasaan
    tingkat_penguasaan = max(0, 100 - (jumlah_error * 10))
    
    # Update atau create progress
    try:
        await prisma.progressbelajar.upsert(
            where=cast(Any, {
                "idMahasiswa_topik": {
                    "idMahasiswa": id_mahasiswa,
                    "topik": topik
                }
            }),
            data={
                "create": {
                    "idMahasiswa": id_mahasiswa,
                    "topik": topik,
                    "tingkatPenguasaan": tingkat_penguasaan,
                    "jumlahErrorDiTopik": jumlah_error,
                },
                "update": {
                    "tingkatPenguasaan": tingkat_penguasaan,
                    "jumlahErrorDiTopik": jumlah_error,
                }
            }
        )
    except Exception as e:
        print(f"Warning: Upsert progress belajar failed: {e}")
