/**
 * Learning Resources Page - Mahasiswa
 * Sumber daya pembelajaran yang direkomendasikan
 */

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { gunakanAuth } from "@/contexts/auth-context";
import { dapatkanLearningResources } from "@/lib/api-client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { SumberDaya } from "@/types";
import {
  Loader2,
  AlertCircle,
  Video,
  FileText,
  BookOpen,
  PenTool,
  HelpCircle,
  ExternalLink,
  Clock,
} from "lucide-react";

export default function LearningResourcesPage() {
  const router = useRouter();
  const {
    pengguna,
    sedangMemuat: sedangMemuatAuth,
    apakahAdmin,
  } = gunakanAuth();

  const [resources, setResources] = useState<SumberDaya[]>([]);
  const [sedangMemuat, setSedangMemuat] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Redirect jika admin atau belum login
  useEffect(() => {
    if (!sedangMemuatAuth) {
      if (!pengguna) {
        router.push("/login");
      } else if (apakahAdmin) {
        router.push("/admin");
      }
    }
  }, [pengguna, sedangMemuatAuth, apakahAdmin, router]);

  // Fetch resources
  useEffect(() => {
    if (pengguna && !apakahAdmin) {
      ambilResources();
    }
  }, [pengguna, apakahAdmin]);

  const ambilResources = async () => {
    setSedangMemuat(true);
    setError(null);

    try {
      const data = await dapatkanLearningResources(20);
      setResources(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Gagal mengambil learning resources"
      );
    } finally {
      setSedangMemuat(false);
    }
  };

  // Get icon for resource type
  const getTipeIcon = (tipe: string) => {
    switch (tipe) {
      case "video":
        return <Video className="h-5 w-5" />;
      case "artikel":
        return <FileText className="h-5 w-5" />;
      case "tutorial":
        return <BookOpen className="h-5 w-5" />;
      case "exercise":
        return <PenTool className="h-5 w-5" />;
      case "quiz":
        return <HelpCircle className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  // Get badge color for difficulty
  const getTingkatColor = (tingkat: string) => {
    switch (tingkat) {
      case "pemula":
        return "bg-green-500";
      case "menengah":
        return "bg-yellow-500";
      case "mahir":
        return "bg-red-500";
      default:
        return "bg-gray-500";
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
        <Button onClick={ambilResources}>Coba Lagi</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Learning Resources</h1>
          <p className="text-muted-foreground mt-2">
            Sumber daya pembelajaran yang direkomendasikan berdasarkan analisis
            error Anda
          </p>
        </div>

        {/* Resources Grid */}
        {resources.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg font-medium mb-2">Belum Ada Rekomendasi</p>
              <p className="text-muted-foreground mb-4">
                Submit beberapa error terlebih dahulu untuk mendapatkan
                rekomendasi learning resources.
              </p>
              <Button onClick={() => router.push("/analyze")}>
                Analisis Error Sekarang
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resources.map((resource) => (
              <Card key={resource.id} className="flex flex-col">
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getTipeIcon(resource.tipe)}
                      <Badge variant="secondary">{resource.tipe}</Badge>
                    </div>
                    <Badge
                      className={getTingkatColor(resource.tingkat_kesulitan)}
                    >
                      {resource.tingkat_kesulitan}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg">{resource.judul}</CardTitle>
                  {resource.deskripsi && (
                    <CardDescription className="line-clamp-2">
                      {resource.deskripsi}
                    </CardDescription>
                  )}
                </CardHeader>

                <CardContent className="flex-1 flex flex-col justify-between">
                  <div className="space-y-3 mb-4">
                    {/* Durasi */}
                    {resource.durasi && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>{resource.durasi} menit</span>
                      </div>
                    )}

                    {/* Topik Terkait */}
                    {resource.topik_terkait.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {resource.topik_terkait
                          .slice(0, 3)
                          .map((topik, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="text-xs"
                            >
                              {topik}
                            </Badge>
                          ))}
                        {resource.topik_terkait.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{resource.topik_terkait.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Action Button */}
                  {resource.url ? (
                    <a
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full"
                    >
                      <Button className="w-full" size="sm">
                        Buka Resource
                        <ExternalLink className="h-4 w-4 ml-2" />
                      </Button>
                    </a>
                  ) : (
                    <Button className="w-full" size="sm" disabled>
                      Tidak Tersedia
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
