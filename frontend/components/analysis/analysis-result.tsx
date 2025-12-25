/**
 * Analysis Result Component
 * Menampilkan hasil analisis semantik error
 */

"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertTriangle, Lightbulb, BookOpen, Target } from "lucide-react";
import type { HasilAnalisis } from "@/lib/api-client";

interface HasilAnalisisPropsProps {
  hasil: HasilAnalisis;
}

export function TampilanHasilAnalisis({ hasil }: HasilAnalisisPropsProps) {
  return (
    <div className="space-y-4">
      {/* Peringatan Pola (jika ada) */}
      {hasil.peringatan_pola && (
        <Card className="border-orange-300 bg-orange-50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <CardTitle className="text-orange-900">
                Pola Kesalahan Terdeteksi
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-orange-800">{hasil.peringatan_pola}</p>
          </CardContent>
        </Card>
      )}

      {/* Tipe Error dan Level Bloom */}
      <Card>
        <CardHeader>
          <CardTitle>Tipe Error</CardTitle>
          <CardDescription>
            {hasil.tipe_error} • Level: {hasil.level_bloom}
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Penyebab Utama dan Kesenjangan Konsep */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-600" />
            <CardTitle>Penyebab Utama</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold text-sm text-gray-700 mb-2">
              Mengapa Error Ini Terjadi?
            </h4>
            <p className="text-gray-900">{hasil.penyebab_utama}</p>
          </div>
          <div>
            <h4 className="font-semibold text-sm text-gray-700 mb-2">
              Kesenjangan Konsep
            </h4>
            <p className="text-gray-600">{hasil.kesenjangan_konsep}</p>
          </div>
        </CardContent>
      </Card>

      {/* Penjelasan Detail */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-green-600" />
            <CardTitle>Penjelasan Lengkap</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-gray-900 whitespace-pre-line">
            {hasil.penjelasan}
          </p>
        </CardContent>
      </Card>

      {/* Saran Perbaikan */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-blue-900">Saran Perbaikan</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-blue-900 whitespace-pre-line">
            {hasil.saran_perbaikan}
          </p>
        </CardContent>
      </Card>

      {/* Topik Terkait */}
      <Card>
        <CardHeader>
          <CardTitle>Topik yang Perlu Dipelajari</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {hasil.topik_terkait.map((topik, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium"
              >
                {topik}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Saran Latihan */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="text-green-900">Saran Latihan</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-green-900 whitespace-pre-line">
            {hasil.saran_latihan}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
