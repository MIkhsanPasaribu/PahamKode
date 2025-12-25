/**
 * Admin Dashboard Page
 * Halaman utama dashboard admin dengan statistik overview
 */

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { gunakanAuth } from "@/contexts/auth-context";
import { dapatkanStatistikDashboard } from "@/lib/api-client";
import { DashboardStats } from "@/components/admin/dashboard-stats";
import { Button } from "@/components/ui/button";
import type { StatistikDashboard } from "@/types";
import { Loader2, AlertCircle, LogOut } from "lucide-react";

export default function AdminDashboardPage() {
  const router = useRouter();
  const {
    pengguna,
    sedangMemuat: sedangMemuatAuth,
    apakahAdmin,
    keluar,
  } = gunakanAuth();

  const [statistik, setStatistik] = useState<StatistikDashboard | null>(null);
  const [sedangMemuat, setSedangMemuat] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  // Fetch statistik dashboard
  useEffect(() => {
    if (pengguna && apakahAdmin) {
      ambilStatistik();
    }
  }, [pengguna, apakahAdmin]);

  const ambilStatistik = async () => {
    setSedangMemuat(true);
    setError(null);

    try {
      const data = await dapatkanStatistikDashboard();
      setStatistik(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Gagal mengambil statistik"
      );
    } finally {
      setSedangMemuat(false);
    }
  };

  // Loading state
  if (sedangMemuatAuth || sedangMemuat) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <p className="text-lg font-medium">{error}</p>
        <Button onClick={ambilStatistik}>Coba Lagi</Button>
      </div>
    );
  }

  // No data state
  if (!statistik) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Tidak ada data</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Dashboard Admin</h1>
              <p className="text-sm text-muted-foreground">
                Selamat datang, {pengguna?.nama || pengguna?.email}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => router.push("/admin/mahasiswa")}
              >
                Mahasiswa
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push("/admin/analytics")}
              >
                Analytics
              </Button>
              <Button variant="outline" onClick={keluar}>
                <LogOut className="h-4 w-4 mr-2" />
                Keluar
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <DashboardStats statistik={statistik} />
      </main>
    </div>
  );
}
