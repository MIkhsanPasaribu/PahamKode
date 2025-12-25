/**
 * Mahasiswa Table Component
 * Tabel untuk menampilkan list mahasiswa dengan pagination & search
 */

"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { MahasiswaAdmin } from "@/types";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

interface MahasiswaTableProps {
  mahasiswa: MahasiswaAdmin[];
  total: number;
  halaman: number;
  totalHalaman: number;
  onPageChange: (halaman: number) => void;
  onSearch: (keyword: string) => void;
}

export function MahasiswaTable({
  mahasiswa,
  total,
  halaman,
  totalHalaman,
  onPageChange,
  onSearch,
}: MahasiswaTableProps) {
  const [pencarianInput, setPencarianInput] = useState("");

  const handleSearch = () => {
    onSearch(pencarianInput);
  };

  const formatTanggal = (tanggal: string) => {
    return new Date(tanggal).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getBadgeKemahiran = (kemahiran: string) => {
    if (kemahiran === "mahir") return "default";
    if (kemahiran === "menengah") return "secondary";
    return "outline";
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Daftar Mahasiswa ({total})</CardTitle>

          {/* Search */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Cari email atau nama..."
              value={pencarianInput}
              onChange={(e) => setPencarianInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="px-3 py-2 border rounded-md text-sm"
            />
            <Button onClick={handleSearch} variant="outline" size="sm">
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-3 font-medium">Email</th>
                <th className="text-left p-3 font-medium">Nama</th>
                <th className="text-left p-3 font-medium">Kemahiran</th>
                <th className="text-center p-3 font-medium">Submisi</th>
                <th className="text-center p-3 font-medium">Pola Error</th>
                <th className="text-left p-3 font-medium">Terdaftar</th>
                <th className="text-center p-3 font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {mahasiswa.map((mhs) => (
                <tr key={mhs.id} className="border-b hover:bg-muted/50">
                  <td className="p-3 text-sm">{mhs.email}</td>
                  <td className="p-3 text-sm">
                    {mhs.nama || (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </td>
                  <td className="p-3">
                    <Badge variant={getBadgeKemahiran(mhs.tingkat_kemahiran)}>
                      {mhs.tingkat_kemahiran}
                    </Badge>
                  </td>
                  <td className="p-3 text-center text-sm">
                    {mhs.total_submisi}
                  </td>
                  <td className="p-3 text-center text-sm">{mhs.total_pola}</td>
                  <td className="p-3 text-sm text-muted-foreground">
                    {formatTanggal(mhs.created_at)}
                  </td>
                  <td className="p-3 text-center">
                    <Link href={`/admin/mahasiswa/${mhs.id}`}>
                      <Button variant="outline" size="sm">
                        Detail
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t">
          <div className="text-sm text-muted-foreground">
            Halaman {halaman} dari {totalHalaman}
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(halaman - 1)}
              disabled={halaman === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Sebelumnya
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(halaman + 1)}
              disabled={halaman === totalHalaman}
            >
              Selanjutnya
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
