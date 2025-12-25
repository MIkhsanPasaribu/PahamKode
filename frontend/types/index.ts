/**
 * Type definitions untuk aplikasi PahamKode
 */

export type LevelBloom =
  | "Remember"
  | "Understand"
  | "Apply"
  | "Analyze"
  | "Evaluate"
  | "Create";

export type TingkatKemahiran = "pemula" | "menengah" | "mahir";

export type RoleUser = "mahasiswa" | "admin" | "pengajar";

export type BahasaPemrograman =
  | "python"
  | "javascript"
  | "typescript"
  | "java"
  | "cpp"
  | "c";

export interface Mahasiswa {
  id: string;
  email: string;
  nama: string | null;
  role: RoleUser;
  tingkat_kemahiran: TingkatKemahiran;
  created_at: string;
}

export interface SubmisiError {
  id: number;
  id_mahasiswa: string;
  kode: string;
  pesan_error: string;
  bahasa: BahasaPemrograman;
  tipe_error: string | null;
  penyebab_utama: string | null;
  kesenjangan_konsep: string | null;
  level_bloom: LevelBloom | null;
  penjelasan: string | null;
  saran_perbaikan: string | null;
  topik_terkait: string[];
  saran_latihan: string | null;
  created_at: string;
}

export interface PolaError {
  id: number;
  id_mahasiswa: string;
  jenis_kesalahan: string;
  frekuensi: number;
  kejadian_pertama: string | null;
  kejadian_terakhir: string | null;
  deskripsi_miskonsepsi: string | null;
  sumber_daya_direkomendasikan: string[];
}

export interface ProgressBelajar {
  id: number;
  id_mahasiswa: string;
  topik: string;
  tingkat_penguasaan: number;
  jumlah_error_di_topik: number;
  tanggal_error_terakhir: string | null;
  tren_perbaikan: string | null;
}

// ============================================================
// Admin Types
// ============================================================

export interface TopErrorItem {
  tipe_error: string;
  jumlah: number;
}

export interface MahasiswaKesulitanItem {
  id: string;
  nama: string | null;
  email: string;
  jumlah_error: number;
}

export interface StatistikDashboard {
  total_mahasiswa: number;
  pertumbuhan_mahasiswa_bulan_ini: number;
  total_analisis: number;
  total_analisis_hari_ini: number;
  total_analisis_minggu_ini: number;
  total_analisis_bulan_ini: number;
  rata_rata_tingkat_penguasaan: number;
  top_errors: TopErrorItem[];
  mahasiswa_dengan_kesulitan: MahasiswaKesulitanItem[];
}

export interface MahasiswaAdmin {
  id: string;
  email: string;
  nama: string | null;
  role: RoleUser;
  tingkat_kemahiran: TingkatKemahiran;
  created_at: string;
  total_submisi: number;
  total_pola: number;
}

export interface MahasiswaList {
  mahasiswa: MahasiswaAdmin[];
  total: number;
  halaman: number;
  ukuran_halaman: number;
  total_halaman: number;
}

export interface StatistikMahasiswa {
  total_submisi: number;
  total_pola_unik: number;
  rata_rata_penguasaan: number;
  tren_perbaikan: string;
  error_pertama: string | null;
  error_terakhir: string | null;
}

export interface DetailMahasiswa {
  user: MahasiswaAdmin;
  statistik: StatistikMahasiswa;
  pola_kesalahan_terbanyak: PolaError[];
  topik_terlemah: ProgressBelajar[];
  riwayat_terbaru: SubmisiError[];
}

export interface PolaGlobal {
  jenis_kesalahan: string;
  total_kemunculan: number;
  jumlah_mahasiswa_terpengaruh: number;
  persentase_mahasiswa: number;
  miskonsepsi_umum: string[];
}

export interface AnalyticsTren {
  tanggal: string;
  jumlah_analisis: number;
  mahasiswa_aktif: number;
}

export interface MetrikAI {
  total_requests: number;
  total_token_input: number;
  total_token_output: number;
  total_token: number;
  total_biaya: number;
  rata_rata_waktu_respons: number;
  success_rate: number;
}

export interface SumberDaya {
  id: string;
  judul: string;
  deskripsi: string | null;
  tipe: "video" | "artikel" | "tutorial" | "exercise" | "quiz";
  url: string | null;
  konten: string | null;
  topik_terkait: string[];
  tingkat_kesulitan: TingkatKemahiran;
  durasi: number | null;
  dibuat: string;
  diperbarui: string;
}

// ============================================================
// Mahasiswa Dashboard Types
// ============================================================

export interface AktivitasItem {
  tipe: "analisis_error" | "pola_terdeteksi";
  deskripsi: string;
  waktu: string;
}

export interface DashboardMahasiswa {
  total_error: number;
  total_pola_unik: number;
  rata_rata_penguasaan: number;
  tren_perbaikan: "membaik" | "stabil" | "menurun";
  error_minggu_ini: number;
  topik_dikuasai: number;
  aktivitas_terbaru: AktivitasItem[];
  topik_rekomendasi: string[];
}

export interface TopikPembelajaran {
  id: string;
  nama: string;
  deskripsi: string | null;
  kategori: "dasar" | "lanjutan" | "expert";
  tingkat_kesulitan: TingkatKemahiran;
  prerequisite: string[];
  tujuan_pembelajaran: string[];
  estimasi_waktu: number | null;
  total_error: number;
  dibuat: string;
  diperbarui: string;
}

export interface TopikSulit {
  topik: string;
  total_error: number;
  jumlah_mahasiswa_kesulitan: number;
  persentase_mahasiswa: number;
  rata_rata_penguasaan: number;
}

export interface RekomendasiKurikulum {
  topik_prioritas: string[];
  topik_mudah: string[];
  gap_pembelajaran: string[];
  saran_urutan: string[];
}

export interface SystemHealth {
  status: "healthy" | "degraded" | "unhealthy";
  database: string;
  api_response_time_avg: number;
  error_rate_24h: number;
  total_requests_24h: number;
  uptime: string;
}

// ============================================================
// Exercise & Quiz Types
// ============================================================

export interface Exercise {
  id: string;
  judul: string;
  deskripsi: string;
  topik: string;
  tingkat_kesulitan: TingkatKemahiran;
  instruksi: string;
  kode_pemula: string | null;
  solusi_referensi: string;
  test_cases: string[];
  poin_belajar: string[];
  estimasi_waktu: number | null;
  dibuat: string;
  diperbarui: string;
}

export interface ExerciseSubmission {
  id: string;
  id_mahasiswa: string;
  id_exercise: string;
  kode_submisi: string;
  status_selesai: boolean;
  nilai_score: number | null;
  feedback: string | null;
  created_at: string;
  exercise_judul?: string;
  exercise_topik?: string;
}
