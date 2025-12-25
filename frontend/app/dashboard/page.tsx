/**
 * Dashboard Page - Mahasiswa
 * Overview statistik dan aktivitas terbaru mahasiswa
 */

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { gunakanAuth } from "@/contexts/auth-context";
import {
  dapatkanDashboardMahasiswa,
  exportProgressCSV,
} from "@/lib/api-client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { DashboardMahasiswa } from "@/types";
import {
  Loader2,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Minus,
  BookOpen,
  Target,
  Calendar,
  Download,
} from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const router = useRouter();
  const {
    pengguna,
    sedangMemuat: sedangMemuatAuth,
    apakahAdmin,
  } = gunakanAuth();

  const [dashboard, setDashboard] = useState<DashboardMahasiswa | null>(null);
  const [sedangMemuat, setSedangMemuat] = useState(true);
  const [sedangExport, setSedangExport] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect jika admin
  useEffect(() => {
    if (!sedangMemuatAuth) {
      if (!pengguna) {
        router.push("/login");
      } else if (apakahAdmin) {
        router.push("/admin");
      }
    }
  }, [pengguna, sedangMemuatAuth, apakahAdmin, router]);

  // Fetch dashboard data
  useEffect(() => {
    if (pengguna && !apakahAdmin) {
      ambilDashboard();
    }
  }, [pengguna, apakahAdmin]);

  const ambilDashboard = async () => {
    setSedangMemuat(true);
    setError(null);

    try {
      const data = await dapatkanDashboardMahasiswa();
      setDashboard(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Gagal mengambil data dashboard"
      );
    } finally {
      setSedangMemuat(false);
    }
  };

  const handleExportCSV = async () => {
    setSedangExport(true);
    try {
      const blob = await exportProgressCSV("bulan_ini");
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `progress_report_${
        new Date().toISOString().split("T")[0]
      }.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal export CSV");
    } finally {
      setSedangExport(false);
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
        <Button onClick={ambilDashboard}>Coba Lagi</Button>
      </div>
    );
  }

  if (!dashboard) return null;

  // Tren icon
  const getTrenIcon = (tren: string) => {
    switch (tren) {
      case "membaik":
        return <TrendingUp className="h-5 w-5 text-green-600" />;
      case "menurun":
        return <TrendingDown className="h-5 w-5 text-red-600" />;
      default:
        return <Minus className="h-5 w-5 text-gray-600" />;
    }
  };

  const getTrenColor = (tren: string) => {
    switch (tren) {
      case "membaik":
        return "text-green-600";
      case "menurun":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Dashboard</h1>
              <p className="text-muted-foreground mt-2">
                Selamat datang kembali, {pengguna?.nama || pengguna?.email}!
              </p>
            </div>
            <Button
              onClick={handleExportCSV}
              disabled={sedangExport}
              variant="outline"
            >
              {sedangExport ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              Export CSV
            </Button>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Error</CardDescription>
              <CardTitle className="text-3xl">
                {dashboard.total_error}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {dashboard.error_minggu_ini} minggu ini
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Pola Kesalahan</CardDescription>
              <CardTitle className="text-3xl">
                {dashboard.total_pola_unik}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Pola unik teridentifikasi
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Rata-rata Penguasaan</CardDescription>
              <CardTitle className="text-3xl">
                {dashboard.rata_rata_penguasaan.toFixed(1)}%
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                {getTrenIcon(dashboard.tren_perbaikan)}
                <span
                  className={`text-sm font-medium ${getTrenColor(
                    dashboard.tren_perbaikan
                  )}`}
                >
                  {dashboard.tren_perbaikan}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Topik Dikuasai</CardDescription>
              <CardTitle className="text-3xl">
                {dashboard.topik_dikuasai}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Penguasaan &gt; 70%
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Aktivitas Terbaru */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Aktivitas Terbaru
              </CardTitle>
              <CardDescription>5 aktivitas terakhir Anda</CardDescription>
            </CardHeader>
            <CardContent>
              {dashboard.aktivitas_terbaru.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Belum ada aktivitas
                </p>
              ) : (
                <div className="space-y-4">
                  {dashboard.aktivitas_terbaru.map((aktivitas, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 pb-3 border-b last:border-0"
                    >
                      <div className="mt-0.5">
                        {aktivitas.tipe === "analisis_error" ? (
                          <AlertCircle className="h-4 w-4 text-blue-600" />
                        ) : (
                          <Target className="h-4 w-4 text-orange-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          {aktivitas.deskripsi}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(aktivitas.waktu).toLocaleString("id-ID")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-4">
                <Link href="/history">
                  <Button variant="outline" size="sm" className="w-full">
                    Lihat Semua Riwayat
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Topik Rekomendasi */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Topik untuk Dipelajari
              </CardTitle>
              <CardDescription>Berdasarkan analisis error Anda</CardDescription>
            </CardHeader>
            <CardContent>
              {dashboard.topik_rekomendasi.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Tidak ada rekomendasi saat ini. Lanjutkan belajar!
                </p>
              ) : (
                <div className="space-y-2">
                  {dashboard.topik_rekomendasi.map((topik, index) => (
                    <div key={index} className="p-3 bg-muted rounded-lg border">
                      <p className="text-sm font-medium">{topik}</p>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-4">
                <Link href="/learning">
                  <Button size="sm" className="w-full">
                    Lihat Learning Resources
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/analyze">
            <Card className="cursor-pointer hover:bg-accent transition-colors">
              <CardHeader>
                <CardTitle className="text-lg">Analisis Error Baru</CardTitle>
                <CardDescription>
                  Submit kode dan dapatkan analisis semantik
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/patterns">
            <Card className="cursor-pointer hover:bg-accent transition-colors">
              <CardHeader>
                <CardTitle className="text-lg">Pola Kesalahan</CardTitle>
                <CardDescription>
                  Lihat pola kesalahan yang sering terjadi
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/progress">
            <Card className="cursor-pointer hover:bg-accent transition-colors">
              <CardHeader>
                <CardTitle className="text-lg">Progress Belajar</CardTitle>
                <CardDescription>
                  Pantau perkembangan pembelajaran Anda
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}
