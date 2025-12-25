/**
 * Form Register Component
 */

"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { gunakanAuth } from "@/contexts/auth-context";
import { AlertCircle, Loader2, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export function FormRegister() {
  const router = useRouter();
  const { daftar, sedangMasuk } = gunakanAuth();
  const [nama, setNama] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [berhasil, setBerhasil] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      await daftar(email, password, nama);
      setBerhasil(true);
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Pendaftaran gagal");
    }
  };

  if (berhasil) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <CheckCircle2 className="h-16 w-16 text-green-600" />
            <h3 className="text-xl font-semibold text-green-900">
              Pendaftaran Berhasil!
            </h3>
            <p className="text-center text-gray-600">
              Akun Anda telah dibuat. Silakan cek email untuk verifikasi.
            </p>
            <p className="text-sm text-gray-500">
              Mengalihkan ke halaman login...
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Daftar PahamKode</CardTitle>
        <CardDescription>
          Buat akun baru untuk mulai menganalisis error
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="nama" className="text-sm font-medium">
              Nama Lengkap
            </label>
            <input
              id="nama"
              type="text"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nama Anda"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="nama@contoh.com"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Minimal 6 karakter"
            />
            <p className="text-xs text-gray-500">
              Password harus minimal 6 karakter
            </p>
          </div>

          <Button type="submit" disabled={sedangMasuk} className="w-full">
            {sedangMasuk ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Mendaftar...
              </>
            ) : (
              "Daftar"
            )}
          </Button>

          <p className="text-sm text-center text-gray-600">
            Sudah punya akun?{" "}
            <Link href="/login" className="text-blue-600 hover:underline">
              Masuk di sini
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
