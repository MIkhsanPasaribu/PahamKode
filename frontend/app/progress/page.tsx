/**
 * Progress Page - Dashboard progress pembelajaran mahasiswa
 * Menampilkan tingkat penguasaan per topik dengan visualisasi
 */

"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { gunakanAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  LogOut,
  Loader2,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Minus,
  Award,
} from "lucide-react";

// Interface sesuai dengan backend response
interface ProgressBelajar {
  id: number;
  id_mahasiswa: string;
  topik: string;
  tingkat_penguasaan: number; // 0-100
  jumlah_error_di_topik: number;
  tanggal_error_terakhir: string | null;
  tren_perbaikan: string | null; // 'improving', 'stable', 'declining'
  dibuat_pada: string;
  diperbarui_pada: string;
}

export default function ProgressPage() {
  const router = useRouter();
  const { pengguna, sedangMemuat: sedangMemuatAuth, keluar } = gunakanAuth();
  const [progressList, setProgressList] = useState<ProgressBelajar[]>([]);
  const [sedangMemuat, setSedangMemuat] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Redirect ke login jika belum login
  useEffect(() => {
    if (!sedangMemuatAuth && !pengguna) {
      router.push("/login");
    }
  }, [pengguna, sedangMemuatAuth, router]);

  // Fetch progress saat komponen dimount
  useEffect(() => {
    if (pengguna?.id) {
      ambilProgress();
    }
  }, [pengguna?.id]);

  const ambilProgress = async () => {
    if (!pengguna?.id) return;

    setSedangMemuat(true);
    setError(null);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/patterns/${pengguna.id}/progress`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      // Sort by mastery level (descending) untuk highlight achievements
      const sortedData = data.sort(
        (a: ProgressBelajar, b: ProgressBelajar) =>
          b.tingkat_penguasaan - a.tingkat_penguasaan
      );
      setProgressList(sortedData);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Gagal memuat progress. Silakan coba lagi."
      );
    } finally {
      setSedangMemuat(false);
    }
  };

  const handleKeluar = async () => {
    await keluar();
    router.push("/login");
  };

  const formatTanggal = (isoString: string | null) => {
    if (!isoString) return "-";
    const date = new Date(isoString);
    return new Intl.DateTimeFormat("id-ID", {
      dateStyle: "medium",
    }).format(date);
  };

  const getWarnaTingkatPenguasaan = (tingkat: number): string => {
    if (tingkat >= 80) return "bg-green-500";
    if (tingkat >= 60) return "bg-blue-500";
    if (tingkat >= 40) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getKategoriPenguasaan = (tingkat: number): string => {
    if (tingkat >= 80) return "Mahir";
    if (tingkat >= 60) return "Kompeten";
    if (tingkat >= 40) return "Berkembang";
    return "Perlu Fokus";
  };

  const getWarnaKategori = (tingkat: number): string => {
    if (tingkat >= 80) return "border-green-500 bg-green-50 text-green-800";
    if (tingkat >= 60) return "border-blue-500 bg-blue-50 text-blue-800";
    if (tingkat >= 40) return "border-yellow-500 bg-yellow-50 text-yellow-800";
    return "border-red-500 bg-red-50 text-red-800";
  };

  const getIconTren = (tren: string | null) => {
    if (tren === "improving")
      return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (tren === "declining")
      return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <Minus className="h-4 w-4 text-gray-400" />;
  };

  const getLabelTren = (tren: string | null): string => {
    if (tren === "improving") return "Membaik";
    if (tren === "declining") return "Menurun";
    return "Stabil";
  };

  const getWarnaTren = (tren: string | null): string => {
    if (tren === "improving") return "text-green-600 bg-green-50";
    if (tren === "declining") return "text-red-600 bg-red-50";
    return "text-gray-600 bg-gray-50";
  };

  // Loading state saat check auth
  if (sedangMemuatAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Memuat...</p>
        </div>
      </div>
    );
  }

  // Jika tidak ada pengguna, jangan render apapun
  if (!pengguna) {
    return null;
  }

  // Calculate overall stats
  const rataRataPenguasaan =
    progressList.length > 0
      ? Math.round(
          progressList.reduce((sum, p) => sum + p.tingkat_penguasaan, 0) /
            progressList.length
        )
      : 0;

  const topikMahir = progressList.filter(
    (p) => p.tingkat_penguasaan >= 80
  ).length;

  const topikPerluFokus = progressList.filter(
    (p) => p.tingkat_penguasaan < 40
  ).length;

  const topikMembaik = progressList.filter(
    (p) => p.tren_perbaikan === "improving"
  ).length;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Dashboard Progress
            </h1>
            <p className="text-gray-600">
              Pantau perkembangan pembelajaran dan tingkat penguasaanmu
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-gray-600">Selamat datang,</p>
              <p className="font-semibold text-gray-900">{pengguna.email}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleKeluar}
              className="gap-2"
            >
              <LogOut className="h-4 w-4" />
              Keluar
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <div className="mb-6 flex gap-4">
          <Button variant="outline" onClick={() => router.push("/analyze")}>
            Analisis Baru
          </Button>
          <Button variant="ghost" onClick={() => router.push("/history")}>
            Riwayat
          </Button>
          <Button variant="ghost" onClick={() => router.push("/patterns")}>
            Pola Error
          </Button>
          <Button variant="ghost" onClick={() => router.push("/progress")}>
            Progress
          </Button>
        </div>

        {/* Error State */}
        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-red-800">
                <AlertCircle className="h-5 w-5" />
                <p>{error}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={ambilProgress}
                className="mt-4"
              >
                Coba Lagi
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Loading State */}
        {sedangMemuat && (
          <div className="flex justify-center py-12">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
              <p className="text-gray-600">Memuat progress...</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!sedangMemuat && !error && progressList.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Belum Ada Data Progress
              </h3>
              <p className="text-gray-600 mb-4">
                Mulai analisis error untuk melacak progress pembelajaranmu
              </p>
              <Button onClick={() => router.push("/analyze")}>
                Mulai Analisis
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Progress Dashboard */}
        {!sedangMemuat && !error && progressList.length > 0 && (
          <div className="space-y-6">
            {/* Overall Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Rata-rata Penguasaan
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-gray-900">
                    {rataRataPenguasaan}%
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div
                      className={`h-full ${getWarnaTingkatPenguasaan(
                        rataRataPenguasaan
                      )} rounded-full transition-all`}
                      style={{ width: `${rataRataPenguasaan}%` }}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Topik Mahir
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-green-600">
                    {topikMahir}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    dari {progressList.length} topik
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Perlu Fokus
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-red-600">
                    {topikPerluFokus}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">topik</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Tren Membaik
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-blue-600">
                    {topikMembaik}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">topik</p>
                </CardContent>
              </Card>
            </div>

            {/* Achievement Banner (jika ada topik mahir) */}
            {topikMahir > 0 && (
              <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <Award className="h-12 w-12 text-green-600" />
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                        🎉 Selamat! Kamu sudah mahir di {topikMahir} topik!
                      </h3>
                      <p className="text-gray-700">
                        Terus pertahankan dan tingkatkan kemampuanmu
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Progress Cards */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Progress per Topik
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {progressList.map((progress) => (
                  <Card
                    key={progress.id}
                    className={`border-2 ${getWarnaKategori(
                      progress.tingkat_penguasaan
                    )}`}
                  >
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge
                              variant="outline"
                              className={getWarnaKategori(
                                progress.tingkat_penguasaan
                              )}
                            >
                              {getKategoriPenguasaan(
                                progress.tingkat_penguasaan
                              )}
                            </Badge>
                            <Badge
                              variant="outline"
                              className={getWarnaTren(progress.tren_perbaikan)}
                            >
                              <span className="flex items-center gap-1">
                                {getIconTren(progress.tren_perbaikan)}
                                {getLabelTren(progress.tren_perbaikan)}
                              </span>
                            </Badge>
                          </div>
                          <CardTitle className="text-lg">
                            {progress.topik}
                          </CardTitle>
                        </div>
                        <div className="text-right">
                          <p className="text-3xl font-bold text-gray-900">
                            {progress.tingkat_penguasaan}%
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Progress Bar */}
                      <div>
                        <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                          <div
                            className={`h-full ${getWarnaTingkatPenguasaan(
                              progress.tingkat_penguasaan
                            )} transition-all duration-500 ease-out rounded-full`}
                            style={{
                              width: `${progress.tingkat_penguasaan}%`,
                            }}
                          />
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600 font-medium mb-1">
                            Jumlah Error:
                          </p>
                          <p className="text-gray-900 font-semibold">
                            {progress.jumlah_error_di_topik}x
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600 font-medium mb-1">
                            Error Terakhir:
                          </p>
                          <p className="text-gray-900 font-semibold">
                            {formatTanggal(progress.tanggal_error_terakhir)}
                          </p>
                        </div>
                      </div>

                      {/* Recommendations */}
                      {progress.tingkat_penguasaan < 60 && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                          <p className="text-xs text-yellow-800 font-medium">
                            💡 Rekomendasi: Pelajari lebih dalam tentang{" "}
                            {progress.topik} untuk meningkatkan penguasaan
                          </p>
                        </div>
                      )}

                      {progress.tren_perbaikan === "declining" && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                          <p className="text-xs text-red-800 font-medium">
                            ⚠️ Perhatian: Tren menurun. Pertimbangkan untuk
                            review kembali materi {progress.topik}
                          </p>
                        </div>
                      )}

                      {progress.tren_perbaikan === "improving" && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                          <p className="text-xs text-green-800 font-medium">
                            ✅ Bagus! Kamu menunjukkan perbaikan di{" "}
                            {progress.topik}. Terus pertahankan!
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
