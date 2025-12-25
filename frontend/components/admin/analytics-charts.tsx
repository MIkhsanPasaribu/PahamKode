/**
 * Analytics Charts Component
 * Visualisasi data analytics untuk admin
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { PolaGlobal, AnalyticsTren } from "@/types";
import { TrendingUp, Users, AlertTriangle } from "lucide-react";

interface AnalyticsChartsProps {
  polaGlobal: PolaGlobal[];
  trenAnalytics: AnalyticsTren[];
}

export function AnalyticsCharts({
  polaGlobal,
  trenAnalytics,
}: AnalyticsChartsProps) {
  const maxAnalisis = Math.max(...trenAnalytics.map((t) => t.jumlah_analisis));

  return (
    <div className="space-y-6">
      {/* Tren Analytics - Simple Bar Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Tren Analisis 7 Hari Terakhir
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {trenAnalytics.map((tren) => {
              const barWidth = (tren.jumlah_analisis / maxAnalisis) * 100;

              return (
                <div key={tren.tanggal} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">
                      {new Date(tren.tanggal).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                      })}
                    </span>
                    <span className="text-muted-foreground">
                      {tren.jumlah_analisis} analisis • {tren.mahasiswa_aktif}{" "}
                      mahasiswa
                    </span>
                  </div>
                  <div className="h-8 bg-muted rounded-md overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Pola Kesalahan Global */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Pola Kesalahan Global
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {polaGlobal.map((pola, index) => (
              <div
                key={pola.jenis_kesalahan}
                className="p-4 border rounded-lg space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <Badge variant="outline">#{index + 1}</Badge>
                    <div>
                      <h3 className="font-semibold">{pola.jenis_kesalahan}</h3>
                      <div className="flex gap-3 mt-1 text-sm text-muted-foreground">
                        <span>{pola.total_kemunculan} kemunculan</span>
                        <span>•</span>
                        <span>
                          {pola.jumlah_mahasiswa_terpengaruh} mahasiswa
                        </span>
                        <span>•</span>
                        <span>{pola.persentase_mahasiswa.toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Miskonsepsi Umum */}
                {pola.miskonsepsi_umum.length > 0 && (
                  <div className="pl-9">
                    <p className="text-sm font-medium mb-2">
                      Miskonsepsi Umum:
                    </p>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      {pola.miskonsepsi_umum.map((miskonsepsi, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-primary">•</span>
                          <span>{miskonsepsi}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Progress Bar */}
                <div className="pl-9">
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-destructive"
                      style={{ width: `${pola.persentase_mahasiswa}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
