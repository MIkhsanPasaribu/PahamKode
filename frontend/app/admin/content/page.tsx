/**
 * Admin Content Management Page
 * Manage learning resources dan topik pembelajaran
 */

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { gunakanAuth } from "@/contexts/auth-context";
import {
  dapatkanSemuaSumberDayaAdmin,
  dapatkanSemuaTopik,
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
import type { SumberDaya, TopikPembelajaran } from "@/types";
import {
  Loader2,
  AlertCircle,
  BookOpen,
  Plus,
  ArrowLeft,
  ExternalLink,
  Clock,
} from "lucide-react";

export default function ContentManagementPage() {
  const router = useRouter();
  const {
    pengguna,
    sedangMemuat: sedangMemuatAuth,
    apakahAdmin,
  } = gunakanAuth();

  const [resources, setResources] = useState<SumberDaya[]>([]);
  const [topik, setTopik] = useState<TopikPembelajaran[]>([]);
  const [sedangMemuat, setSedangMemuat] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<"resources" | "topik">("resources");

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
      const [res, top] = await Promise.all([
        dapatkanSemuaSumberDayaAdmin(100),
        dapatkanSemuaTopik(100),
      ]);

      setResources(res);
      setTopik(top);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Gagal mengambil data content"
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
            <h1 className="text-3xl font-bold">Content Management</h1>
            <p className="text-muted-foreground mt-2">
              Kelola learning resources dan topik pembelajaran
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

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={tab === "resources" ? "default" : "outline"}
            onClick={() => setTab("resources")}
          >
            Learning Resources ({resources.length})
          </Button>
          <Button
            variant={tab === "topik" ? "default" : "outline"}
            onClick={() => setTab("topik")}
          >
            Topik Pembelajaran ({topik.length})
          </Button>
        </div>

        {/* Resources Tab */}
        {tab === "resources" && (
          <div>
            <div className="mb-4 flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                Total {resources.length} learning resources
              </p>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Tambah Resource
              </Button>
            </div>

            {resources.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-lg font-medium mb-2">
                    Belum Ada Resources
                  </p>
                  <p className="text-muted-foreground mb-4">
                    Mulai tambahkan learning resources untuk mahasiswa
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {resources.map((resource) => (
                  <Card key={resource.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between mb-2">
                        <Badge variant="secondary">{resource.tipe}</Badge>
                        <Badge>{resource.tingkat_kesulitan}</Badge>
                      </div>
                      <CardTitle className="text-lg">
                        {resource.judul}
                      </CardTitle>
                      {resource.deskripsi && (
                        <CardDescription className="line-clamp-2">
                          {resource.deskripsi}
                        </CardDescription>
                      )}
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {resource.durasi && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>{resource.durasi} menit</span>
                        </div>
                      )}
                      {resource.topik_terkait.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {resource.topik_terkait.slice(0, 3).map((t, i) => (
                            <Badge
                              key={i}
                              variant="outline"
                              className="text-xs"
                            >
                              {t}
                            </Badge>
                          ))}
                        </div>
                      )}
                      <div className="pt-2 flex gap-2">
                        {resource.url && (
                          <a
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button variant="outline" size="sm">
                              <ExternalLink className="h-3 w-3 mr-1" />
                              Lihat
                            </Button>
                          </a>
                        )}
                        <Button variant="ghost" size="sm">
                          Edit
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Topik Tab */}
        {tab === "topik" && (
          <div>
            <div className="mb-4 flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                Total {topik.length} topik pembelajaran
              </p>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Tambah Topik
              </Button>
            </div>

            {topik.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-lg font-medium mb-2">Belum Ada Topik</p>
                  <p className="text-muted-foreground mb-4">
                    Mulai tambahkan topik pembelajaran
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {topik.map((t) => (
                  <Card key={t.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <CardTitle>{t.nama}</CardTitle>
                            <Badge variant="secondary">{t.kategori}</Badge>
                            <Badge>{t.tingkat_kesulitan}</Badge>
                          </div>
                          {t.deskripsi && (
                            <CardDescription>{t.deskripsi}</CardDescription>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground mb-1">
                            Total Error
                          </p>
                          <p className="font-semibold">{t.total_error}</p>
                        </div>
                        {t.estimasi_waktu && (
                          <div>
                            <p className="text-muted-foreground mb-1">
                              Estimasi Waktu
                            </p>
                            <p className="font-semibold">
                              {t.estimasi_waktu} menit
                            </p>
                          </div>
                        )}
                      </div>

                      {t.prerequisite.length > 0 && (
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">
                            Prerequisite:
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {t.prerequisite.map((p, i) => (
                              <Badge
                                key={i}
                                variant="outline"
                                className="text-xs"
                              >
                                {p}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {t.tujuan_pembelajaran.length > 0 && (
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">
                            Learning Objectives:
                          </p>
                          <ul className="list-disc list-inside text-sm space-y-1">
                            {t.tujuan_pembelajaran.slice(0, 3).map((obj, i) => (
                              <li key={i}>{obj}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div className="pt-2 flex gap-2">
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                        <Button variant="ghost" size="sm">
                          Hapus
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
