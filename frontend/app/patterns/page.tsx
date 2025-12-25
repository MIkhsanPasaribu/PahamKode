/**
 * Patterns Page - Halaman pola error mahasiswa
 * Menampilkan pola kesalahan berulang dengan visualisasi
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
  BookOpen,
} from "lucide-react";

// Interface sesuai dengan backend response
interface PolaError {
  id: number;
  id_mahasiswa: string;
  jenis_pola: string;
  frekuensi: number;
  kejadian_pertama: string | null;
  kejadian_terakhir: string | null;
  deskripsi_miskonsepsi: string | null;
  sumber_daya_rekomendasi: string[];
  dibuat_pada: string;
  diperbarui_pada: string;
}

export default function PatternsPage() {
  const router = useRouter();
  const { pengguna, sedangMemuat: sedangMemuatAuth, keluar } = gunakanAuth();
  const [polaPola, setPolaPola] = useState<PolaError[]>([]);
  const [sedangMemuat, setSedangMemuat] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Redirect ke login jika belum login
  useEffect(() => {
    if (!sedangMemuatAuth && !pengguna) {
      router.push("/login");
    }
  }, [pengguna, sedangMemuatAuth, router]);

  // Fetch patterns saat komponen dimount
  useEffect(() => {
    if (pengguna?.id) {
      ambilPolaPola();
    }
  }, [pengguna?.id]);

  const ambilPolaPola = async () => {
    if (!pengguna?.id) return;

    setSedangMemuat(true);
    setError(null);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/patterns/${pengguna.id}`,
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
      // Sort by frequency (descending)
      const sortedData = data.sort(
        (a: PolaError, b: PolaError) => b.frekuensi - a.frekuensi
      );
      setPolaPola(sortedData);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Gagal memuat pola error. Silakan coba lagi."
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

  const getWarnaBerdasarkanFrekuensi = (frekuensi: number): string => {
    if (frekuensi >= 10) return "bg-red-500";
    if (frekuensi >= 5) return "bg-orange-500";
    if (frekuensi >= 3) return "bg-yellow-500";
    return "bg-blue-500";
  };

  const getKategoriRisiko = (frekuensi: number): string => {
    if (frekuensi >= 10) return "Sangat Tinggi";
    if (frekuensi >= 5) return "Tinggi";
    if (frekuensi >= 3) return "Sedang";
    return "Rendah";
  };

  const getWarnaKategori = (frekuensi: number): string => {
    if (frekuensi >= 10) return "border-red-500 bg-red-50 text-red-800";
    if (frekuensi >= 5) return "border-orange-500 bg-orange-50 text-orange-800";
    if (frekuensi >= 3) return "border-yellow-500 bg-yellow-50 text-yellow-800";
    return "border-blue-500 bg-blue-50 text-blue-800";
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

  const maxFrekuensi = Math.max(...polaPola.map((p) => p.frekuensi), 1);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Pola Error
            </h1>
            <p className="text-gray-600">
              Identifikasi kesalahan berulang dan rekomendasi pembelajaran
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
                onClick={ambilPolaPola}
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
              <p className="text-gray-600">Memuat pola error...</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!sedangMemuat && !error && polaPola.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Belum Ada Pola Terdeteksi
              </h3>
              <p className="text-gray-600 mb-4">
                Pola error akan muncul setelah kamu melakukan minimal 3 analisis
                dengan error serupa
              </p>
              <Button onClick={() => router.push("/analyze")}>
                Mulai Analisis
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Patterns Visualization & List */}
        {!sedangMemuat && !error && polaPola.length > 0 && (
          <div className="space-y-6">
            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Total Pola Terdeteksi
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-gray-900">
                    {polaPola.length}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Error Terbanyak
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-gray-900">
                    {polaPola[0]?.frekuensi || 0}x
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {polaPola[0]?.jenis_pola || "-"}
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
                  <p className="text-3xl font-bold text-gray-900">
                    {polaPola.filter((p) => p.frekuensi >= 5).length}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Pola dengan frekuensi tinggi
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Bar Chart Visualization */}
            <Card>
              <CardHeader>
                <CardTitle>Visualisasi Frekuensi Error</CardTitle>
                <CardDescription>
                  Error terurut dari yang paling sering terjadi
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {polaPola.slice(0, 10).map((pola) => (
                    <div key={pola.id} className="space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <span className="font-medium text-gray-700 truncate max-w-md">
                          {pola.jenis_pola}
                        </span>
                        <span className="font-bold text-gray-900">
                          {pola.frekuensi}x
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                        <div
                          className={`h-full ${getWarnaBerdasarkanFrekuensi(
                            pola.frekuensi
                          )} transition-all duration-500 ease-out rounded-full`}
                          style={{
                            width: `${(pola.frekuensi / maxFrekuensi) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Pattern Cards */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900">
                Detail Pola Error
              </h2>
              {polaPola.map((pola) => (
                <Card
                  key={pola.id}
                  className={`border-2 ${getWarnaKategori(pola.frekuensi)}`}
                >
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge
                            variant="outline"
                            className={getWarnaKategori(pola.frekuensi)}
                          >
                            Risiko: {getKategoriRisiko(pola.frekuensi)}
                          </Badge>
                          <Badge variant="secondary">
                            {pola.frekuensi}x kejadian
                          </Badge>
                        </div>
                        <CardTitle className="text-xl">
                          {pola.jenis_pola}
                        </CardTitle>
                        {pola.deskripsi_miskonsepsi && (
                          <CardDescription className="mt-2">
                            {pola.deskripsi_miskonsepsi}
                          </CardDescription>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Timeline */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600 font-medium mb-1">
                          Kejadian Pertama:
                        </p>
                        <p className="text-gray-900">
                          {formatTanggal(pola.kejadian_pertama)}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600 font-medium mb-1">
                          Kejadian Terakhir:
                        </p>
                        <p className="text-gray-900">
                          {formatTanggal(pola.kejadian_terakhir)}
                        </p>
                      </div>
                    </div>

                    {/* Rekomendasi */}
                    {pola.sumber_daya_rekomendasi &&
                      pola.sumber_daya_rekomendasi.length > 0 && (
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <BookOpen className="h-4 w-4 text-gray-600" />
                            <h4 className="font-semibold text-gray-700">
                              Rekomendasi Pembelajaran:
                            </h4>
                          </div>
                          <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                            {pola.sumber_daya_rekomendasi.map((topik, idx) => (
                              <li key={idx}>{topik}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                    {/* Call to Action untuk high-frequency errors */}
                    {pola.frekuensi >= 5 && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <p className="text-sm text-yellow-800 font-medium">
                          ⚠️ Perhatian: Error ini sering terjadi! Disarankan
                          untuk fokus mempelajari topik terkait.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
