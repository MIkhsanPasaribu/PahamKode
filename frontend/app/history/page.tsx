/**
 * History Page - Halaman riwayat analisis error
 * Menampilkan history submissions dari mahasiswa
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
import { LogOut, Loader2, Calendar, Code, AlertCircle } from "lucide-react";

// Interface sesuai dengan backend response
interface ItemRiwayat {
  id: number;
  kode: string;
  pesan_error: string;
  bahasa: string;
  tipe_error: string | null;
  penyebab_akar: string | null;
  kesenjangan_konseptual: string | null;
  level_bloom: string | null;
  penjelasan: string | null;
  saran_perbaikan: string | null;
  topik_terkait: string[];
  saran_latihan: string | null;
  dibuat_pada: string;
}

const BLOOM_COLORS: Record<string, string> = {
  Remember: "bg-gray-100 text-gray-800 border-gray-300",
  Understand: "bg-blue-100 text-blue-800 border-blue-300",
  Apply: "bg-green-100 text-green-800 border-green-300",
  Analyze: "bg-yellow-100 text-yellow-800 border-yellow-300",
  Evaluate: "bg-orange-100 text-orange-800 border-orange-300",
  Create: "bg-red-100 text-red-800 border-red-300",
};

export default function HistoryPage() {
  const router = useRouter();
  const { pengguna, sedangMemuat: sedangMemuatAuth, keluar } = gunakanAuth();
  const [riwayat, setRiwayat] = useState<ItemRiwayat[]>([]);
  const [sedangMemuat, setSedangMemuat] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [itemDipilih, setItemDipilih] = useState<ItemRiwayat | null>(null);

  // Redirect ke login jika belum login
  useEffect(() => {
    if (!sedangMemuatAuth && !pengguna) {
      router.push("/login");
    }
  }, [pengguna, sedangMemuatAuth, router]);

  // Fetch history saat komponen dimount
  useEffect(() => {
    if (pengguna?.id) {
      ambilRiwayat();
    }
  }, [pengguna?.id]);

  const ambilRiwayat = async () => {
    if (!pengguna?.id) return;

    setSedangMemuat(true);
    setError(null);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/history/${pengguna.id}`,
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
      setRiwayat(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Gagal memuat riwayat. Silakan coba lagi."
      );
    } finally {
      setSedangMemuat(false);
    }
  };

  const handleKeluar = async () => {
    await keluar();
    router.push("/login");
  };

  const formatTanggal = (isoString: string) => {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat("id-ID", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date);
  };

  const potongKode = (kode: string, maxLength: number = 100) => {
    if (kode.length <= maxLength) return kode;
    return kode.substring(0, maxLength) + "...";
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Riwayat Analisis
            </h1>
            <p className="text-gray-600">
              Lihat kembali error yang pernah kamu analisis
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
                onClick={ambilRiwayat}
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
              <p className="text-gray-600">Memuat riwayat...</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!sedangMemuat && !error && riwayat.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <Code className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Belum Ada Riwayat
              </h3>
              <p className="text-gray-600 mb-4">
                Mulai analisis error pertamamu untuk melihat riwayat di sini
              </p>
              <Button onClick={() => router.push("/analyze")}>
                Mulai Analisis
              </Button>
            </CardContent>
          </Card>
        )}

        {/* History List */}
        {!sedangMemuat && !error && riwayat.length > 0 && (
          <div className="space-y-4">
            {riwayat.map((item) => (
              <Card
                key={item.id}
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => setItemDipilih(item)}
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="font-mono text-xs">
                          {item.bahasa}
                        </Badge>
                        {item.tipe_error && (
                          <Badge variant="secondary">{item.tipe_error}</Badge>
                        )}
                        {item.level_bloom && (
                          <Badge
                            variant="outline"
                            className={
                              BLOOM_COLORS[item.level_bloom] ||
                              "bg-gray-100 text-gray-800"
                            }
                          >
                            {item.level_bloom}
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-lg">
                        {item.tipe_error || "Error Analysis"}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {item.kesenjangan_konseptual || item.penyebab_akar}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Calendar className="h-4 w-4" />
                      {formatTanggal(item.dibuat_pada)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs font-semibold text-gray-600 mb-1">
                        Kode:
                      </p>
                      <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
                        <code>{potongKode(item.kode)}</code>
                      </pre>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-600 mb-1">
                        Error Message:
                      </p>
                      <p className="text-sm text-red-600 bg-red-50 p-2 rounded">
                        {potongKode(item.pesan_error, 150)}
                      </p>
                    </div>
                    {item.topik_terkait && item.topik_terkait.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {item.topik_terkait.map((topik, idx) => (
                          <Badge
                            key={idx}
                            variant="outline"
                            className="text-xs"
                          >
                            {topik}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Detail Modal (Simple version - bisa diperluas) */}
        {itemDipilih && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setItemDipilih(null)}
          >
            <Card
              className="max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl">
                      {itemDipilih.tipe_error || "Detail Analisis"}
                    </CardTitle>
                    <CardDescription>
                      {formatTanggal(itemDipilih.dibuat_pada)}
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setItemDipilih(null)}
                  >
                    Tutup
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Kode */}
                <div>
                  <h3 className="font-semibold text-sm text-gray-700 mb-2">
                    Kode:
                  </h3>
                  <pre className="bg-gray-100 p-4 rounded overflow-x-auto">
                    <code>{itemDipilih.kode}</code>
                  </pre>
                </div>

                {/* Error Message */}
                <div>
                  <h3 className="font-semibold text-sm text-gray-700 mb-2">
                    Error Message:
                  </h3>
                  <p className="text-sm text-red-600 bg-red-50 p-3 rounded">
                    {itemDipilih.pesan_error}
                  </p>
                </div>

                {/* Penyebab Akar */}
                {itemDipilih.penyebab_akar && (
                  <div>
                    <h3 className="font-semibold text-sm text-gray-700 mb-2">
                      Penyebab Akar:
                    </h3>
                    <p className="text-sm">{itemDipilih.penyebab_akar}</p>
                  </div>
                )}

                {/* Kesenjangan Konseptual */}
                {itemDipilih.kesenjangan_konseptual && (
                  <div>
                    <h3 className="font-semibold text-sm text-gray-700 mb-2">
                      Kesenjangan Konseptual:
                    </h3>
                    <p className="text-sm">
                      {itemDipilih.kesenjangan_konseptual}
                    </p>
                  </div>
                )}

                {/* Penjelasan */}
                {itemDipilih.penjelasan && (
                  <div>
                    <h3 className="font-semibold text-sm text-gray-700 mb-2">
                      Penjelasan:
                    </h3>
                    <p className="text-sm">{itemDipilih.penjelasan}</p>
                  </div>
                )}

                {/* Saran Perbaikan */}
                {itemDipilih.saran_perbaikan && (
                  <div>
                    <h3 className="font-semibold text-sm text-gray-700 mb-2">
                      Saran Perbaikan:
                    </h3>
                    <p className="text-sm">{itemDipilih.saran_perbaikan}</p>
                  </div>
                )}

                {/* Saran Latihan */}
                {itemDipilih.saran_latihan && (
                  <div>
                    <h3 className="font-semibold text-sm text-gray-700 mb-2">
                      Saran Latihan:
                    </h3>
                    <p className="text-sm">{itemDipilih.saran_latihan}</p>
                  </div>
                )}

                {/* Topik Terkait */}
                {itemDipilih.topik_terkait &&
                  itemDipilih.topik_terkait.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-sm text-gray-700 mb-2">
                        Topik Terkait:
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {itemDipilih.topik_terkait.map((topik, idx) => (
                          <Badge key={idx} variant="secondary">
                            {topik}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Bloom Level */}
                {itemDipilih.level_bloom && (
                  <div>
                    <h3 className="font-semibold text-sm text-gray-700 mb-2">
                      Level Kognitif (Bloom):
                    </h3>
                    <Badge
                      variant="outline"
                      className={
                        BLOOM_COLORS[itemDipilih.level_bloom] || "bg-gray-100"
                      }
                    >
                      {itemDipilih.level_bloom}
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
