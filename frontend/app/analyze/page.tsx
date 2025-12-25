/**
 * Analyze Page - Halaman utama untuk analisis error
 * Core Feature: Semantic Error Analysis
 */

"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { EditorKode } from "@/components/editor/code-editor";
import { TampilanHasilAnalisis } from "@/components/analysis/analysis-result";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { analisisError, type HasilAnalisis } from "@/lib/api-client";
import { AlertCircle, Loader2, LogOut } from "lucide-react";
import { gunakanAuth } from "@/contexts/auth-context";

export default function AnalyzePage() {
  const router = useRouter();
  const { pengguna, sedangMemuat: sedangMemuatAuth, keluar } = gunakanAuth();
  const [kode, setKode] = useState("");
  const [pesanError, setPesanError] = useState("");
  const [bahasa, setBahasa] = useState("python");
  const [sedangMemuat, setSedangMemuat] = useState(false);
  const [hasil, setHasil] = useState<HasilAnalisis | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Redirect ke login jika belum login
  useEffect(() => {
    if (!sedangMemuatAuth && !pengguna) {
      router.push("/login");
    }
  }, [pengguna, sedangMemuatAuth, router]);

  const handleAnalisis = async () => {
    // Pastikan user sudah login
    if (!pengguna?.id) {
      setError("Anda harus login terlebih dahulu");
      router.push("/login");
      return;
    }

    // Validasi input
    if (!kode.trim()) {
      setError("Kode tidak boleh kosong");
      return;
    }
    if (!pesanError.trim()) {
      setError("Pesan error tidak boleh kosong");
      return;
    }

    setSedangMemuat(true);
    setError(null);
    setHasil(null);

    try {
      const hasilAnalisis = await analisisError({
        kode,
        pesan_error: pesanError,
        bahasa,
        id_mahasiswa: pengguna.id,
      });

      setHasil(hasilAnalisis);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Terjadi kesalahan saat analisis"
      );
    } finally {
      setSedangMemuat(false);
    }
  };

  const handleKeluar = async () => {
    await keluar();
    router.push("/login");
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

  // Jika tidak ada pengguna, jangan render apapun (akan di-redirect)
  if (!pengguna) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header dengan Logout */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Analisis Error
            </h1>
            <p className="text-gray-600">
              Masukkan kode dan pesan error untuk mendapatkan analisis semantik
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

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="space-y-6">
            {/* Language Selector */}
            <Card>
              <CardHeader>
                <CardTitle>Bahasa Pemrograman</CardTitle>
              </CardHeader>
              <CardContent>
                <select
                  value={bahasa}
                  onChange={(e) => setBahasa(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="python">Python</option>
                  <option value="javascript">JavaScript</option>
                  <option value="typescript">TypeScript</option>
                  <option value="java">Java</option>
                  <option value="cpp">C++</option>
                  <option value="c">C</option>
                </select>
              </CardContent>
            </Card>

            {/* Code Editor */}
            <Card>
              <CardHeader>
                <CardTitle>Kode Program</CardTitle>
                <CardDescription>
                  Masukkan kode yang mengalami error
                </CardDescription>
              </CardHeader>
              <CardContent>
                <EditorKode
                  nilai={kode}
                  onChange={setKode}
                  bahasa={bahasa}
                  tinggi="300px"
                />
              </CardContent>
            </Card>

            {/* Error Message */}
            <Card>
              <CardHeader>
                <CardTitle>Pesan Error</CardTitle>
                <CardDescription>
                  Copy-paste pesan error dari compiler/interpreter
                </CardDescription>
              </CardHeader>
              <CardContent>
                <textarea
                  value={pesanError}
                  onChange={(e) => setPesanError(e.target.value)}
                  placeholder="Masukkan pesan error di sini..."
                  className="w-full h-32 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                />
              </CardContent>
            </Card>

            {/* Analyze Button */}
            <Button
              onClick={handleAnalisis}
              disabled={sedangMemuat}
              size="lg"
              className="w-full"
            >
              {sedangMemuat ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Menganalisis...
                </>
              ) : (
                "Analisis Error"
              )}
            </Button>

            {/* Error Display */}
            {error && (
              <Card className="border-red-300 bg-red-50">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                    <p className="text-red-800">{error}</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Results Section */}
          <div>
            {hasil ? (
              <TampilanHasilAnalisis hasil={hasil} />
            ) : (
              <Card className="h-full flex items-center justify-center">
                <CardContent className="text-center py-16">
                  <p className="text-gray-500 text-lg">
                    Hasil analisis akan muncul di sini
                  </p>
                  <p className="text-gray-400 text-sm mt-2">
                    Masukkan kode dan pesan error, lalu klik &quot;Analisis
                    Error&quot;
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
