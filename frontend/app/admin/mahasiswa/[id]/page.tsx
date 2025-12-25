/**
 * Admin Mahasiswa Detail Page (Server Component)
 * Halaman detail mahasiswa dengan generateStaticParams untuk static export
 */

import { AdminMahasiswaDetailContent } from "./admin-mahasiswa-detail-content";

/**
 * Generate static params untuk Azure Static Web Apps
 * Return placeholder array dengan 1 dummy ID untuk satisfy Next.js static export
 * Actual data tetap di-fetch client-side dengan ID dari URL params
 *
 * PENTING: Function ini HARUS return minimal 1 item untuk Next.js static export
 */
export async function generateStaticParams() {
  // Return placeholder: Next.js butuh minimal 1 static page untuk build
  // Client-side routing akan handle actual dynamic IDs
  return [{ id: "placeholder" }];
}

/**
 * Server Component wrapper yang import Client Component
 * Ini memungkinkan generateStaticParams() bekerja dengan static export
 */
export default function AdminMahasiswaDetailPage() {
  return <AdminMahasiswaDetailContent />;
}
