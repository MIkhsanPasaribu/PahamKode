/**
 * Admin System Monitoring Page
 * Monitor kesehatan sistem, API metrics, dan topik sulit
 */

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { gunakanAuth } from "@/contexts/auth-context";
import {
  cekSystemHealth,
  dapatkanMetrikAI,
  dapatkanTopikSulit,
  dapatkanRekomendasiKurikulum,
} from "@/lib/api-client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type {
  SystemHealth,
  MetrikAI,
  TopikSulit,
  RekomendasiKurikulum,
} from "@/types";
import {
  Loader2,
  AlertCircle,
  Activity,
  Database,
  Zap,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  ArrowLeft,
} from "lucide-react";

export default function SystemMonitoringPage() {
  const router = useRouter();
  const {
    pengguna,
    sedangMemuat: sedangMemuatAuth,
    apakahAdmin,
  } = gunakanAuth();

  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [aiMetrics, setAiMetrics] = useState<MetrikAI | null>(null);
  const [topikSulit, setTopikSulit] = useState<TopikSulit[]>([]);
  const [rekomendasi, setRekomendasi] = useState<RekomendasiKurikulum | null>(
    null
  );
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

  // Fetch data
  useEffect(() => {
    if (pengguna && apakahAdmin) {
      ambilSemuaData();
    }
  }, [pengguna, apakahAdmin]);

  const ambilSemuaData = async () => {
    setSedangMemuat(true);
    setError(null);

    try {
      const [health, ai, topik, rek] = await Promise.all([
        cekSystemHealth(),
        dapatkanMetrikAI(),
        dapatkanTopikSulit(10),
        dapatkanRekomendasiKurikulum(),
      ]);

      setSystemHealth(health);
      setAiMetrics(ai);
      setTopikSulit(topik);
      setRekomendasi(rek);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Gagal mengambil data monitoring"
      );
    } finally {
      setSedangMemuat(false);
    }
  };

  // Status badge
  const getStatusBadge = (status: string) => {
    const variants = {
      healthy: {
        variant: "default" as const,
        icon: CheckCircle,
        color: "text-green-600",
      },
      degraded: {
        variant: "secondary" as const,
        icon: AlertTriangle,
        color: "text-yellow-600",
      },
      unhealthy: {
        variant: "destructive" as const,
        icon: AlertCircle,
        color: "text-red-600",
      },
    };
    const config =
      variants[status as keyof typeof variants] || variants.healthy;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className={`h-3 w-3 ${config.color}`} />
        {status}
      </Badge>
    );
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
        <Button onClick={ambilSemuaData}>Coba Lagi</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">System Monitoring</h1>
            <p className="text-muted-foreground mt-2">
              Monitor kesehatan sistem dan performa AI
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/admin")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali
          </Button>
        </div>

        {/* System Health */}
        {systemHealth && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>System Status</CardDescription>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  {getStatusBadge(systemHealth.status)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Uptime: {systemHealth.uptime}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Database</CardDescription>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  {getStatusBadge(systemHealth.database)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Avg Query Time:{" "}
                  {systemHealth.api_response_time_avg.toFixed(2)}ms
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription>API Performance</CardDescription>
                <CardTitle className="text-2xl">
                  {systemHealth.api_response_time_avg.toFixed(0)}ms
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Avg Response Time (24h)
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Error Rate (24h)</CardDescription>
                <CardTitle className="text-2xl">
                  {systemHealth.error_rate_24h.toFixed(2)}%
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {systemHealth.total_requests_24h} requests
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* AI Metrics */}
        {aiMetrics && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                AI Model Performance
              </CardTitle>
              <CardDescription>Statistik penggunaan AI model</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Total Requests
                  </p>
                  <p className="text-2xl font-bold">
                    {aiMetrics.total_requests.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Total Tokens
                  </p>
                  <p className="text-2xl font-bold">
                    {aiMetrics.total_token.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Total Biaya
                  </p>
                  <p className="text-2xl font-bold">
                    ${aiMetrics.total_biaya.toFixed(4)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Success Rate
                  </p>
                  <p className="text-2xl font-bold">
                    {aiMetrics.success_rate.toFixed(1)}%
                  </p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Avg Response Time
                  </p>
                  <p className="text-lg font-semibold">
                    {aiMetrics.rata_rata_waktu_respons.toFixed(2)}s
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Input/Output Ratio
                  </p>
                  <p className="text-lg font-semibold">
                    {(
                      aiMetrics.total_token_output / aiMetrics.total_token_input
                    ).toFixed(2)}
                    x
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Topik Sulit */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Topik Paling Sulit
              </CardTitle>
              <CardDescription>
                Berdasarkan jumlah error mahasiswa
              </CardDescription>
            </CardHeader>
            <CardContent>
              {topikSulit.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Belum ada data topik sulit
                </p>
              ) : (
                <div className="space-y-3">
                  {topikSulit.map((topik, index) => (
                    <div
                      key={index}
                      className="p-3 bg-muted rounded-lg border space-y-2"
                    >
                      <div className="flex items-start justify-between">
                        <p className="font-medium">{topik.topik}</p>
                        <Badge variant="destructive">
                          {topik.total_error} errors
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                        <div>
                          <span className="font-medium">
                            {topik.jumlah_mahasiswa_kesulitan}
                          </span>{" "}
                          mahasiswa ({topik.persentase_mahasiswa.toFixed(1)}%)
                        </div>
                        <div>
                          Penguasaan avg:{" "}
                          <span className="font-medium">
                            {topik.rata_rata_penguasaan.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Rekomendasi Kurikulum */}
          {rekomendasi && (
            <Card>
              <CardHeader>
                <CardTitle>Rekomendasi Kurikulum</CardTitle>
                <CardDescription>
                  Berdasarkan analisis kesulitan mahasiswa
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2 text-sm">
                    🔴 Topik Prioritas
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {rekomendasi.topik_prioritas.slice(0, 5).map((t, i) => (
                      <Badge key={i} variant="destructive">
                        {t}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2 text-sm">
                    ⚠️ Gap Pembelajaran
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {rekomendasi.gap_pembelajaran.slice(0, 5).map((t, i) => (
                      <Badge key={i} variant="secondary">
                        {t}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2 text-sm">✅ Topik Mudah</h4>
                  <div className="flex flex-wrap gap-1">
                    {rekomendasi.topik_mudah.slice(0, 5).map((t, i) => (
                      <Badge key={i} variant="outline">
                        {t}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <h4 className="font-semibold mb-2 text-sm">
                    📚 Saran Urutan Pembelajaran
                  </h4>
                  <ol className="list-decimal list-inside space-y-1 text-sm">
                    {rekomendasi.saran_urutan.slice(0, 5).map((t, i) => (
                      <li key={i}>{t}</li>
                    ))}
                  </ol>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="mt-8">
          <Button onClick={ambilSemuaData} variant="outline">
            <Activity className="h-4 w-4 mr-2" />
            Refresh Data
          </Button>
        </div>
      </div>
    </div>
  );
}
