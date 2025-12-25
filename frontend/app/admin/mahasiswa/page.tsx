/**
 * Admin Mahasiswa List Page
 * Halaman untuk melihat semua mahasiswa dengan pagination & search
 */

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { gunakanAuth } from "@/contexts/auth-context";
import { dapatkanListMahasiswa } from "@/lib/api-client";
import { MahasiswaTable } from "@/components/admin/mahasiswa-table";
import { Button } from "@/components/ui/button";
import type { MahasiswaList } from "@/types";
import { Loader2, AlertCircle, ArrowLeft } from "lucide-react";

export default function AdminMahasiswaPage() {
  const router = useRouter();
  const {
    pengguna,
    sedangMemuat: sedangMemuatAuth,
    apakahAdmin,
  } = gunakanAuth();

  const [mahasiswaData, setMahasiswaData] = useState<MahasiswaList | null>(
    null
  );
  const [sedangMemuat, setSedangMemuat] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [halaman, setHalaman] = useState(1);
  const [pencarian, setPencarian] = useState("");

  // Redirect jika bukan admin
  useEffect(() => {
    if (!sedangMemuatAuth) {
      if (!pengguna) {
        router.push("/login");
      } else if (!apakahAdmin) {
        router.push("/analyze");
      }
    }
  }, [pengguna, sedangMemuatAuth, apakahAdmin, router]);

  // Fetch data mahasiswa
  useEffect(() => {
    if (pengguna && apakahAdmin) {
      ambilDataMahasiswa();
    }
  }, [pengguna, apakahAdmin, halaman, pencarian]);

  const ambilDataMahasiswa = async () => {
    setSedangMemuat(true);
    setError(null);

    try {
      const data = await dapatkanListMahasiswa(halaman, 20, pencarian);
      setMahasiswaData(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Gagal mengambil data mahasiswa"
      );
    } finally {
      setSedangMemuat(false);
    }
  };

  const handlePageChange = (halamanBaru: number) => {
    setHalaman(halamanBaru);
  };

  const handleSearch = (keyword: string) => {
    setPencarian(keyword);
    setHalaman(1); // Reset ke halaman 1 saat search
  };

  // Loading state
  if (sedangMemuatAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push("/admin")}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Daftar Mahasiswa</h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {error ? (
          <div className="flex flex-col items-center justify-center gap-4 py-12">
            <AlertCircle className="h-12 w-12 text-destructive" />
            <p className="text-lg font-medium">{error}</p>
            <Button onClick={ambilDataMahasiswa}>Coba Lagi</Button>
          </div>
        ) : sedangMemuat ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : mahasiswaData ? (
          <MahasiswaTable
            mahasiswa={mahasiswaData.mahasiswa}
            total={mahasiswaData.total}
            halaman={mahasiswaData.halaman}
            totalHalaman={mahasiswaData.total_halaman}
            onPageChange={handlePageChange}
            onSearch={handleSearch}
          />
        ) : (
          <div className="text-center py-12">
            <p>Tidak ada data mahasiswa</p>
          </div>
        )}
      </main>
    </div>
  );
}
