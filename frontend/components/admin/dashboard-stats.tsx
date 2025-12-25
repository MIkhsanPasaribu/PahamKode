/**
 * Dashboard Stats Component
 * Menampilkan statistik overview untuk admin
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { StatistikDashboard } from "@/types";
import {
  Users,
  TrendingUp,
  AlertCircle,
  BarChart3,
  Calendar,
  Clock,
} from "lucide-react";

interface DashboardStatsProps {
  statistik: StatistikDashboard;
}

export function DashboardStats({ statistik }: DashboardStatsProps) {
  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Mahasiswa
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statistik.total_mahasiswa}
            </div>
            <p className="text-xs text-muted-foreground">
              +{statistik.pertumbuhan_mahasiswa_bulan_ini} bulan ini
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Analisis
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistik.total_analisis}</div>
            <p className="text-xs text-muted-foreground">
              {statistik.total_analisis_hari_ini} hari ini
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Analisis Minggu Ini
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statistik.total_analisis_minggu_ini}
            </div>
            <p className="text-xs text-muted-foreground">
              {statistik.total_analisis_bulan_ini} bulan ini
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Rata-rata Penguasaan
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statistik.rata_rata_tingkat_penguasaan.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">Global average</p>
          </CardContent>
        </Card>
      </div>

      {/* Top Errors */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Top 5 Error Paling Sering
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {statistik.top_errors.map((error, index) => (
              <div
                key={error.tipe_error}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <Badge variant="outline">#{index + 1}</Badge>
                  <span className="font-medium">{error.tipe_error}</span>
                </div>
                <Badge variant="secondary">{error.jumlah} kali</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Mahasiswa dengan Kesulitan */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Mahasiswa dengan Kesulitan Terbanyak
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {statistik.mahasiswa_dengan_kesulitan.map((mhs, index) => (
              <div
                key={mhs.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <Badge variant="outline">#{index + 1}</Badge>
                  <div>
                    <div className="font-medium">
                      {mhs.nama || "Tanpa Nama"}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {mhs.email}
                    </div>
                  </div>
                </div>
                <Badge variant="destructive">{mhs.jumlah_error} errors</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
