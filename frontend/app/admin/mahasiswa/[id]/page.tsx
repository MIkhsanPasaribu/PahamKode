/**
 * Admin Mahasiswa Detail Page
 * Halaman detail mahasiswa dengan statistik, pola kesalahan, dan riwayat
 */

"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { gunakanAuth } from "@/contexts/auth-context";
import { dapatkanDetailMahasiswaAdmin } from "@/lib/api-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { DetailMahasiswa } from "@/types";
import {
  Loader2,
  AlertCircle,
  ArrowLeft,
  User,
  BarChart3,
  AlertTriangle,
  TrendingDown,
  Calendar,
} from "lucide-react";

export default function AdminMahasiswaDetailPage() {
  const router = useRouter();
  const params = useParams();
  const idMahasiswa = params.id as string;

  const {
    pengguna,
    sedangMemuat: sedangMemuatAuth,
    apakahAdmin,
  } = gunakanAuth();

  const [detail, setDetail] = useState<DetailMahasiswa | null>(null);
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

  // Fetch detail mahasiswa
  useEffect(() => {
    if (pengguna && apakahAdmin && idMahasiswa) {
      ambilDetail();
    }
  }, [pengguna, apakahAdmin, idMahasiswa]);

  const ambilDetail = async () => {
    setSedangMemuat(true);
    setError(null);

    try {
      const data = await dapatkanDetailMahasiswaAdmin(idMahasiswa);
      setDetail(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Gagal mengambil detail mahasiswa"
      );
    } finally {
      setSedangMemuat(false);
    }
  };

  const formatTanggal = (tanggal: string | null) => {
    if (!tanggal) return "-";
    return new Date(tanggal).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
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
        <Button onClick={ambilDetail}>Coba Lagi</Button>
      </div>
    );
  }

  if (!detail) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/admin/mahasiswa")}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Detail Mahasiswa</h1>
              <p className="text-sm text-muted-foreground">
                {detail.user.email}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 space-y-6">
        {/* Info Mahasiswa */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Informasi Mahasiswa
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Nama</p>
                <p className="font-medium">
                  {detail.user.nama || "Tidak ada nama"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{detail.user.email}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Kemahiran</p>
                <Badge>{detail.user.tingkat_kemahiran}</Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Terdaftar</p>
                <p className="font-medium">
                  {formatTanggal(detail.user.created_at)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistik */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-1">
                  Total Submisi
                </p>
                <p className="text-3xl font-bold">
                  {detail.statistik.total_submisi}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-1">Pola Unik</p>
                <p className="text-3xl font-bold">
                  {detail.statistik.total_pola_unik}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-1">
                  Rata-rata Penguasaan
                </p>
                <p className="text-3xl font-bold">
                  {detail.statistik.rata_rata_penguasaan.toFixed(1)}%
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-1">Tren</p>
                <Badge
                  variant={
                    detail.statistik.tren_perbaikan === "membaik"
                      ? "default"
                      : detail.statistik.tren_perbaikan === "menurun"
                      ? "destructive"
                      : "secondary"
                  }
                >
                  {detail.statistik.tren_perbaikan}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pola Kesalahan Terbanyak */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Pola Kesalahan Terbanyak
            </CardTitle>
          </CardHeader>
          <CardContent>
            {detail.pola_kesalahan_terbanyak.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                Belum ada pola kesalahan
              </p>
            ) : (
              <div className="space-y-3">
                {detail.pola_kesalahan_terbanyak.map((pola) => (
                  <div key={pola.id} className="border rounded-lg p-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{pola.jenis_kesalahan}</h3>
                        {pola.deskripsi_miskonsepsi && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {pola.deskripsi_miskonsepsi}
                          </p>
                        )}
                      </div>
                      <Badge variant="secondary">{pola.frekuensi}x</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Topik Terlemah */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5" />
              Topik Terlemah
            </CardTitle>
          </CardHeader>
          <CardContent>
            {detail.topik_terlemah.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                Belum ada data topik
              </p>
            ) : (
              <div className="space-y-3">
                {detail.topik_terlemah.map((topik) => (
                  <div key={topik.id} className="border rounded-lg p-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium">{topik.topik}</h3>
                        <p className="text-sm text-muted-foreground">
                          {topik.jumlah_error_di_topik} errors
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold">
                          {topik.tingkat_penguasaan}%
                        </p>
                        {topik.tren_perbaikan && (
                          <Badge variant="outline" className="text-xs">
                            {topik.tren_perbaikan}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Riwayat Terbaru */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Riwayat Terbaru (10 Terakhir)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {detail.riwayat_terbaru.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                Belum ada riwayat submisi
              </p>
            ) : (
              <div className="space-y-2">
                {detail.riwayat_terbaru.map((riwayat) => (
                  <div
                    key={riwayat.id}
                    className="border rounded-lg p-3 text-sm"
                  >
                    <div className="flex justify-between">
                      <Badge variant="outline">{riwayat.bahasa}</Badge>
                      <span className="text-muted-foreground">
                        {formatTanggal(riwayat.created_at)}
                      </span>
                    </div>
                    {riwayat.tipe_error && (
                      <p className="font-medium mt-2">{riwayat.tipe_error}</p>
                    )}
                    <p className="text-muted-foreground text-xs mt-1 truncate">
                      {riwayat.pesan_error}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
