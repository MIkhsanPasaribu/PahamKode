/**
 * Admin Analytics Page
 * Halaman analytics dengan pola global dan tren
 */

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { gunakanAuth } from "@/contexts/auth-context";
import { dapatkanPolaGlobal, dapatkanTrenAnalytics } from "@/lib/api-client";
import { AnalyticsCharts } from "@/components/admin/analytics-charts";
import { Button } from "@/components/ui/button";
import type { PolaGlobal, AnalyticsTren } from "@/types";
import { Loader2, AlertCircle, ArrowLeft } from "lucide-react";

export default function AdminAnalyticsPage() {
  const router = useRouter();
  const {
    pengguna,
    sedangMemuat: sedangMemuatAuth,
    apakahAdmin,
  } = gunakanAuth();

  const [polaGlobal, setPolaGlobal] = useState<PolaGlobal[]>([]);
  const [trenAnalytics, setTrenAnalytics] = useState<AnalyticsTren[]>([]);
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

  // Fetch analytics data
  useEffect(() => {
    if (pengguna && apakahAdmin) {
      ambilAnalytics();
    }
  }, [pengguna, apakahAdmin]);

  const ambilAnalytics = async () => {
    setSedangMemuat(true);
    setError(null);

    try {
      const [pola, tren] = await Promise.all([
        dapatkanPolaGlobal(20),
        dapatkanTrenAnalytics(7),
      ]);

      setPolaGlobal(pola);
      setTrenAnalytics(tren);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Gagal mengambil data analytics"
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
        <Button onClick={ambilAnalytics}>Coba Lagi</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
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
              <h1 className="text-2xl font-bold">Analytics</h1>
              <p className="text-sm text-muted-foreground">
                Pola global dan tren analisis
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <AnalyticsCharts
          polaGlobal={polaGlobal}
          trenAnalytics={trenAnalytics}
        />
      </main>
    </div>
  );
}
