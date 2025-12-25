/**
 * Home Page - Landing Page PahamKode
 */

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { gunakanAuth } from "@/contexts/auth-context";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Brain, Target, TrendingUp, BookOpen, Loader2 } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const { pengguna, sedangMemuat, apakahAdmin } = gunakanAuth();

  // Redirect based on role
  useEffect(() => {
    if (!sedangMemuat && pengguna) {
      if (apakahAdmin) {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
    }
  }, [pengguna, sedangMemuat, apakahAdmin, router]);

  // Show loading while checking auth
  if (sedangMemuat) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // If already logged in, show redirecting message
  if (pengguna) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Mengalihkan...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center space-y-6 mb-16">
          <h1 className="text-5xl font-bold text-gray-900">
            Paham<span className="text-blue-600">Kode</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Analisis Semantik Error Pemrograman dengan AI
          </p>
          <p className="text-lg text-gray-500 max-w-3xl mx-auto">
            Pahami <span className="font-semibold">MENGAPA</span> error terjadi,
            bukan hanya <span className="font-semibold">APA</span> errornya
          </p>
          <div className="pt-4 flex gap-4 justify-center">
            <Link href="/login">
              <Button size="lg" className="text-lg px-8">
                Login
              </Button>
            </Link>
            <Link href="/register">
              <Button size="lg" variant="outline" className="text-lg px-8">
                Daftar
              </Button>
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card>
            <CardHeader>
              <Brain className="h-10 w-10 text-blue-600 mb-2" />
              <CardTitle>Analisis Semantik</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Analisis error dari sudut pandang konseptual dan pemahaman
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Target className="h-10 w-10 text-green-600 mb-2" />
              <CardTitle>Pattern Mining</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Identifikasi pola kesalahan yang berulang
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <TrendingUp className="h-10 w-10 text-purple-600 mb-2" />
              <CardTitle>Adaptive Learning</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Penjelasan disesuaikan dengan level Bloom's Taxonomy
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <BookOpen className="h-10 w-10 text-orange-600 mb-2" />
              <CardTitle>Personalized</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Rekomendasi pembelajaran yang dipersonalisasi
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-2xl">
                Siap Memahami Error Anda?
              </CardTitle>
              <CardDescription className="text-base">
                Dapatkan analisis mendalam tentang MENGAPA error terjadi
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/analyze">
                <Button size="lg" variant="default">
                  Mulai Sekarang
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
