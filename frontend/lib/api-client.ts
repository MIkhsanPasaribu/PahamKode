/**
 * API Client untuk komunikasi dengan Backend FastAPI
 * Type-safe dengan Zod validation
 */

import { z } from "zod";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

/**
 * Schema untuk Level Bloom's Taxonomy
 */
export const LevelBloomSchema = z.enum([
  "Remember",
  "Understand",
  "Apply",
  "Analyze",
  "Evaluate",
  "Create",
]);

/**
 * Schema untuk Response Analisis Error
 */
export const HasilAnalisisSchema = z.object({
  tipe_error: z.string(),
  penyebab_utama: z.string(),
  kesenjangan_konsep: z.string(),
  level_bloom: LevelBloomSchema,
  penjelasan: z.string(),
  saran_perbaikan: z.string(),
  topik_terkait: z.array(z.string()),
  saran_latihan: z.string(),
  peringatan_pola: z.string().nullable().optional(),
  jumlah_error_serupa: z.number().default(0),
});

export type HasilAnalisis = z.infer<typeof HasilAnalisisSchema>;

/**
 * Schema untuk Request Analisis
 */
export const RequestAnalisisSchema = z.object({
  kode: z.string().min(1, "Kode tidak boleh kosong"),
  pesan_error: z.string().min(1, "Pesan error tidak boleh kosong"),
  bahasa: z.string().default("python"),
  id_mahasiswa: z.string().uuid(),
});

export type RequestAnalisis = z.infer<typeof RequestAnalisisSchema>;

/**
 * Schema untuk Riwayat Submisi
 */
export const RiwayatSubmisiSchema = z.object({
  id: z.number(),
  kode: z.string(),
  pesan_error: z.string(),
  bahasa: z.string(),
  tipe_error: z.string().nullable(),
  level_bloom: z.string().nullable(),
  created_at: z.string(),
});

export type RiwayatSubmisi = z.infer<typeof RiwayatSubmisiSchema>;

/**
 * Schema untuk Pola Error
 */
export const PolaErrorSchema = z.object({
  id: z.number(),
  jenis_kesalahan: z.string(),
  frekuensi: z.number(),
  kejadian_pertama: z.string().nullable(),
  kejadian_terakhir: z.string().nullable(),
  deskripsi_miskonsepsi: z.string().nullable(),
  sumber_daya_direkomendasikan: z.array(z.string()),
});

export type PolaError = z.infer<typeof PolaErrorSchema>;

/**
 * Schema untuk Progress Belajar
 */
export const ProgressBelajarSchema = z.object({
  id: z.number(),
  topik: z.string(),
  tingkat_penguasaan: z.number(),
  jumlah_error_di_topik: z.number(),
  tanggal_error_terakhir: z.string().nullable(),
  tren_perbaikan: z.string().nullable(),
});

export type ProgressBelajar = z.infer<typeof ProgressBelajarSchema>;

/**
 * Analisis error semantik
 */
export async function analisisError(
  data: RequestAnalisis
): Promise<HasilAnalisis> {
  const response = await fetch(`${BASE_URL}/api/analyze`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail?.pesan || "Analisis gagal");
  }

  const json = await response.json();
  return HasilAnalisisSchema.parse(json);
}

/**
 * Dapatkan riwayat submisi error
 */
export async function dapatkanRiwayat(
  idMahasiswa: string,
  limit: number = 20
): Promise<RiwayatSubmisi[]> {
  const response = await fetch(
    `${BASE_URL}/api/history/${idMahasiswa}?limit=${limit}`
  );

  if (!response.ok) {
    throw new Error("Gagal mengambil riwayat");
  }

  const json = await response.json();
  return z.array(RiwayatSubmisiSchema).parse(json);
}

/**
 * Dapatkan pola kesalahan mahasiswa
 */
export async function dapatkanPolaError(
  idMahasiswa: string
): Promise<PolaError[]> {
  const response = await fetch(`${BASE_URL}/api/patterns/${idMahasiswa}`);

  if (!response.ok) {
    throw new Error("Gagal mengambil pola kesalahan");
  }

  const json = await response.json();
  return z.array(PolaErrorSchema).parse(json);
}

/**
 * Dapatkan progress belajar
 */
export async function dapatkanProgressBelajar(
  idMahasiswa: string
): Promise<ProgressBelajar[]> {
  const response = await fetch(
    `${BASE_URL}/api/patterns/${idMahasiswa}/progress`
  );

  if (!response.ok) {
    throw new Error("Gagal mengambil progress belajar");
  }

  const json = await response.json();
  return z.array(ProgressBelajarSchema).parse(json);
}

// ============================================================
// Admin API Functions
// ============================================================

import type {
  StatistikDashboard,
  MahasiswaList,
  DetailMahasiswa,
  PolaGlobal,
  AnalyticsTren,
} from "@/types";

/**
 * Helper untuk get token dari localStorage
 */
function dapatkanTokenAuth(): string {
  const token = localStorage.getItem("auth_token");
  if (!token) {
    throw new Error("Token tidak ditemukan. Silakan login kembali.");
  }
  return token;
}

/**
 * Admin: Dapatkan statistik dashboard
 */
export async function dapatkanStatistikDashboard(): Promise<StatistikDashboard> {
  const token = dapatkanTokenAuth();

  const response = await fetch(`${BASE_URL}/api/admin/dashboard`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    if (response.status === 403) {
      throw new Error("Akses ditolak. Hanya admin yang dapat mengakses.");
    }
    throw new Error("Gagal mengambil statistik dashboard");
  }

  return await response.json();
}

/**
 * Admin: Dapatkan list mahasiswa dengan pagination
 */
export async function dapatkanListMahasiswa(
  halaman: number = 1,
  ukuranHalaman: number = 20,
  pencarian?: string
): Promise<MahasiswaList> {
  const token = dapatkanTokenAuth();

  let url = `${BASE_URL}/api/admin/mahasiswa?halaman=${halaman}&ukuran_halaman=${ukuranHalaman}`;
  if (pencarian) {
    url += `&pencarian=${encodeURIComponent(pencarian)}`;
  }

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Gagal mengambil list mahasiswa");
  }

  return await response.json();
}

/**
 * Admin: Dapatkan detail mahasiswa
 */
export async function dapatkanDetailMahasiswaAdmin(
  idMahasiswa: string
): Promise<DetailMahasiswa> {
  const token = dapatkanTokenAuth();

  const response = await fetch(
    `${BASE_URL}/api/admin/mahasiswa/${idMahasiswa}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error("Mahasiswa tidak ditemukan");
    }
    throw new Error("Gagal mengambil detail mahasiswa");
  }

  return await response.json();
}

/**
 * Admin: Dapatkan pola kesalahan global
 */
export async function dapatkanPolaGlobal(
  limit: number = 20
): Promise<PolaGlobal[]> {
  const token = dapatkanTokenAuth();

  const response = await fetch(
    `${BASE_URL}/api/admin/analytics/patterns-global?limit=${limit}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Gagal mengambil pola global");
  }

  return await response.json();
}

/**
 * Admin: Dapatkan tren analytics
 */
export async function dapatkanTrenAnalytics(
  jumlahHari: number = 7
): Promise<AnalyticsTren[]> {
  const token = dapatkanTokenAuth();

  const response = await fetch(
    `${BASE_URL}/api/admin/analytics/trends?jumlah_hari=${jumlahHari}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Gagal mengambil tren analytics");
  }

  return await response.json();
}

/**
 * Admin: Ubah status mahasiswa (suspend/activate)
 */
export async function ubahStatusMahasiswa(
  idMahasiswa: string,
  status: "aktif" | "suspended"
): Promise<void> {
  const token = dapatkanTokenAuth();

  const response = await fetch(
    `${BASE_URL}/api/admin/mahasiswa/${idMahasiswa}/status`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
    }
  );

  if (!response.ok) {
    throw new Error("Gagal mengubah status mahasiswa");
  }
}

/**
 * Admin: Bulk action untuk mahasiswa
 */
export async function bulkActionMahasiswa(
  idList: string[],
  action: "suspend" | "activate" | "delete"
): Promise<void> {
  const token = dapatkanTokenAuth();

  const response = await fetch(`${BASE_URL}/api/admin/mahasiswa/bulk-action`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id_mahasiswa_list: idList, action }),
  });

  if (!response.ok) {
    throw new Error("Gagal melakukan bulk action");
  }
}

/**
 * Admin: Dapatkan metrik AI
 */
export async function dapatkanMetrikAI() {
  const token = dapatkanTokenAuth();

  const response = await fetch(`${BASE_URL}/api/admin/ai-metrics`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Gagal mengambil metrik AI");
  }

  return await response.json();
}

/**
 * Admin: Tambah sumber daya pembelajaran
 */
export async function tambahSumberDaya(data: {
  judul: string;
  deskripsi?: string;
  tipe: "video" | "artikel" | "tutorial" | "exercise" | "quiz";
  url?: string;
  konten?: string;
  topik_terkait?: string[];
  tingkat_kesulitan?: "pemula" | "menengah" | "mahir";
  durasi?: number;
}) {
  const token = dapatkanTokenAuth();

  const response = await fetch(`${BASE_URL}/api/admin/resources`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Gagal menambah sumber daya");
  }

  return await response.json();
}

/**
 * Admin: Dapatkan semua sumber daya
 */
export async function dapatkanSemuaSumberDayaAdmin(
  limit: number = 50,
  tipe?: string
) {
  const token = dapatkanTokenAuth();

  let url = `${BASE_URL}/api/admin/resources?limit=${limit}`;
  if (tipe) {
    url += `&tipe=${tipe}`;
  }

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Gagal mengambil sumber daya");
  }

  return await response.json();
}

// ============================================================
// Mahasiswa API Functions
// ============================================================

import type { DashboardMahasiswa, SumberDaya } from "@/types";

/**
 * Mahasiswa: Dapatkan dashboard overview
 */
export async function dapatkanDashboardMahasiswa(): Promise<DashboardMahasiswa> {
  const token = dapatkanTokenAuth();

  const response = await fetch(`${BASE_URL}/api/mahasiswa/dashboard`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Gagal mengambil dashboard mahasiswa");
  }

  return await response.json();
}

/**
 * Mahasiswa: Dapatkan learning resources rekomendasi
 */
export async function dapatkanLearningResources(
  limit: number = 10
): Promise<SumberDaya[]> {
  const token = dapatkanTokenAuth();

  const response = await fetch(
    `${BASE_URL}/api/mahasiswa/learning-resources?limit=${limit}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Gagal mengambil learning resources");
  }

  return await response.json();
}

/**
 * Mahasiswa: Export progress report (CSV)
 */
export async function exportProgressCSV(
  periode: "minggu_ini" | "bulan_ini" | "semua" = "bulan_ini"
): Promise<Blob> {
  const token = dapatkanTokenAuth();

  const response = await fetch(
    `${BASE_URL}/api/mahasiswa/export/csv?periode=${periode}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Gagal export CSV");
  }

  return await response.blob();
}

/**
 * Mahasiswa: Export progress data (untuk PDF)
 */
export async function exportProgressData(
  periode: "minggu_ini" | "bulan_ini" | "semua" = "bulan_ini"
) {
  const token = dapatkanTokenAuth();

  const response = await fetch(
    `${BASE_URL}/api/mahasiswa/export/data?periode=${periode}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Gagal export data");
  }

  return await response.json();
}

// ============================================================
// Admin - Advanced Analytics API Functions
// ============================================================

import type {
  TopikSulit,
  RekomendasiKurikulum,
  SystemHealth,
  TopikPembelajaran,
} from "@/types";

/**
 * Admin: Dapatkan topik paling sulit
 */
export async function dapatkanTopikSulit(
  limit: number = 10
): Promise<TopikSulit[]> {
  const token = dapatkanTokenAuth();

  const response = await fetch(
    `${BASE_URL}/api/admin/analytics/topik-sulit?limit=${limit}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Gagal mengambil topik sulit");
  }

  return await response.json();
}

/**
 * Admin: Dapatkan rekomendasi kurikulum
 */
export async function dapatkanRekomendasiKurikulum(): Promise<RekomendasiKurikulum> {
  const token = dapatkanTokenAuth();

  const response = await fetch(
    `${BASE_URL}/api/admin/analytics/rekomendasi-kurikulum`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Gagal mengambil rekomendasi kurikulum");
  }

  return await response.json();
}

/**
 * Admin: Cek system health
 */
export async function cekSystemHealth(): Promise<SystemHealth> {
  const token = dapatkanTokenAuth();

  const response = await fetch(`${BASE_URL}/api/admin/system/health`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Gagal cek system health");
  }

  return await response.json();
}

/**
 * Admin: Tambah topik pembelajaran
 */
export async function tambahTopikPembelajaran(data: {
  nama: string;
  deskripsi?: string;
  kategori: "dasar" | "lanjutan" | "expert";
  tingkat_kesulitan?: "pemula" | "menengah" | "mahir";
  prerequisite?: string[];
  tujuan_pembelajaran?: string[];
  estimasi_waktu?: number;
}): Promise<TopikPembelajaran> {
  const token = dapatkanTokenAuth();

  const response = await fetch(`${BASE_URL}/api/admin/topik`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Gagal tambah topik");
  }

  return await response.json();
}

/**
 * Admin: Dapatkan semua topik pembelajaran
 */
export async function dapatkanSemuaTopik(
  limit: number = 50,
  kategori?: string
): Promise<TopikPembelajaran[]> {
  const token = dapatkanTokenAuth();

  let url = `${BASE_URL}/api/admin/topik?limit=${limit}`;
  if (kategori) {
    url += `&kategori=${kategori}`;
  }

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Gagal mengambil topik");
  }

  return await response.json();
}

/**
 * Admin: Update topik pembelajaran
 */
export async function updateTopikPembelajaran(
  idTopik: string,
  data: {
    nama: string;
    deskripsi?: string;
    kategori: "dasar" | "lanjutan" | "expert";
    tingkat_kesulitan?: "pemula" | "menengah" | "mahir";
    prerequisite?: string[];
    tujuan_pembelajaran?: string[];
    estimasi_waktu?: number;
  }
): Promise<TopikPembelajaran> {
  const token = dapatkanTokenAuth();

  const response = await fetch(`${BASE_URL}/api/admin/topik/${idTopik}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Gagal update topik");
  }

  return await response.json();
}

/**
 * Admin: Hapus topik pembelajaran
 */
export async function hapusTopikPembelajaran(idTopik: string): Promise<void> {
  const token = dapatkanTokenAuth();

  const response = await fetch(`${BASE_URL}/api/admin/topik/${idTopik}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Gagal hapus topik");
  }
}

// ============================================================
// Exercise API Functions
// ============================================================

import type { Exercise, ExerciseSubmission } from "@/types";

/**
 * Mahasiswa: Dapatkan exercise rekomendasi
 */
export async function dapatkanExerciseRekomendasi(
  limit: number = 5
): Promise<Exercise[]> {
  const token = dapatkanTokenAuth();

  const response = await fetch(
    `${BASE_URL}/api/exercises/rekomendasi?limit=${limit}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Gagal mengambil exercise rekomendasi");
  }

  return await response.json();
}

/**
 * Mahasiswa: Dapatkan exercises berdasarkan topik
 */
export async function dapatkanExercisesByTopik(
  topik: string,
  limit: number = 10
): Promise<Exercise[]> {
  const token = dapatkanTokenAuth();

  const response = await fetch(
    `${BASE_URL}/api/exercises/by-topik?topik=${encodeURIComponent(
      topik
    )}&limit=${limit}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Gagal mengambil exercises");
  }

  return await response.json();
}

/**
 * Mahasiswa: Submit exercise solution
 */
export async function submitExercise(
  idExercise: string,
  kodeSubmisi: string
): Promise<ExerciseSubmission> {
  const token = dapatkanTokenAuth();

  const response = await fetch(`${BASE_URL}/api/exercises/submit`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id_exercise: idExercise,
      kode_submisi: kodeSubmisi,
    }),
  });

  if (!response.ok) {
    throw new Error("Gagal submit exercise");
  }

  return await response.json();
}

/**
 * Mahasiswa: Dapatkan history submissions
 */
export async function dapatkanExerciseSubmissions(
  limit: number = 20
): Promise<ExerciseSubmission[]> {
  const token = dapatkanTokenAuth();

  const response = await fetch(
    `${BASE_URL}/api/exercises/submissions?limit=${limit}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Gagal mengambil submission history");
  }

  return await response.json();
}
