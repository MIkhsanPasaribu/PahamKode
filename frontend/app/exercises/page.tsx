/**
 * Practice Exercises Page - Mahasiswa
 * Latihan pemrograman berdasarkan topik lemah
 */

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { gunakanAuth } from "@/contexts/auth-context";
import {
  dapatkanExerciseRekomendasi,
  submitExercise,
  dapatkanExerciseSubmissions,
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
import type { Exercise, ExerciseSubmission } from "@/types";
import {
  Loader2,
  AlertCircle,
  Code,
  CheckCircle2,
  Clock,
  Target,
  Play,
  History,
} from "lucide-react";
import { EditorKode } from "@/components/editor/code-editor";

export default function PracticeExercisesPage() {
  const router = useRouter();
  const {
    pengguna,
    sedangMemuat: sedangMemuatAuth,
    apakahAdmin,
  } = gunakanAuth();

  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [submissions, setSubmissions] = useState<ExerciseSubmission[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(
    null
  );
  const [kodeSubmisi, setKodeSubmisi] = useState("");
  const [sedangMemuat, setSedangMemuat] = useState(true);
  const [sedangSubmit, setSedangSubmit] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<ExerciseSubmission | null>(null);
  const [tab, setTab] = useState<"exercises" | "history">("exercises");

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

  // Fetch exercises
  useEffect(() => {
    if (pengguna && !apakahAdmin) {
      ambilData();
    }
  }, [pengguna, apakahAdmin]);

  const ambilData = async () => {
    setSedangMemuat(true);
    setError(null);

    try {
      const [exercisesData, submissionsData] = await Promise.all([
        dapatkanExerciseRekomendasi(10),
        dapatkanExerciseSubmissions(20),
      ]);

      setExercises(exercisesData);
      setSubmissions(submissionsData);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Gagal mengambil exercises"
      );
    } finally {
      setSedangMemuat(false);
    }
  };

  const handleSelectExercise = (exercise: Exercise) => {
    setSelectedExercise(exercise);
    setKodeSubmisi(exercise.kode_pemula || "");
    setFeedback(null);
    setTab("exercises");
  };

  const handleSubmit = async () => {
    if (!selectedExercise) return;

    setSedangSubmit(true);
    setError(null);

    try {
      const result = await submitExercise(selectedExercise.id, kodeSubmisi);
      setFeedback(result);

      // Refresh submissions
      const updatedSubmissions = await dapatkanExerciseSubmissions(20);
      setSubmissions(updatedSubmissions);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal submit exercise");
    } finally {
      setSedangSubmit(false);
    }
  };

  const getBadgeVariant = (tingkat: string) => {
    switch (tingkat) {
      case "pemula":
        return "default";
      case "menengah":
        return "secondary";
      case "mahir":
        return "destructive";
      default:
        return "outline";
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
  if (error && !selectedExercise) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <p className="text-lg font-medium">{error}</p>
        <Button onClick={ambilData}>Coba Lagi</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Practice Exercises</h1>
          <p className="text-muted-foreground mt-2">
            Latihan pemrograman untuk meningkatkan kemampuan Anda
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={tab === "exercises" ? "default" : "outline"}
            onClick={() => setTab("exercises")}
          >
            <Code className="h-4 w-4 mr-2" />
            Exercises
          </Button>
          <Button
            variant={tab === "history" ? "default" : "outline"}
            onClick={() => setTab("history")}
          >
            <History className="h-4 w-4 mr-2" />
            History ({submissions.length})
          </Button>
        </div>

        {/* Exercises Tab */}
        {tab === "exercises" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Exercise List */}
            <div className="lg:col-span-1 space-y-4">
              <h2 className="text-xl font-semibold mb-4">
                Rekomendasi untuk Anda
              </h2>
              {exercises.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center">
                    <Code className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-sm text-muted-foreground">
                      Belum ada exercises
                    </p>
                  </CardContent>
                </Card>
              ) : (
                exercises.map((ex) => (
                  <Card
                    key={ex.id}
                    className={`cursor-pointer hover:shadow-md transition-shadow ${
                      selectedExercise?.id === ex.id ? "border-primary" : ""
                    }`}
                    onClick={() => handleSelectExercise(ex)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between mb-2">
                        <Badge variant={getBadgeVariant(ex.tingkat_kesulitan)}>
                          {ex.tingkat_kesulitan}
                        </Badge>
                        {ex.estimasi_waktu && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {ex.estimasi_waktu}m
                          </div>
                        )}
                      </div>
                      <CardTitle className="text-base">{ex.judul}</CardTitle>
                      <CardDescription className="text-xs">
                        {ex.topik}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                ))
              )}
            </div>

            {/* Exercise Detail & Editor */}
            <div className="lg:col-span-2">
              {selectedExercise ? (
                <div className="space-y-4">
                  {/* Detail */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle>{selectedExercise.judul}</CardTitle>
                          <CardDescription className="mt-2">
                            {selectedExercise.deskripsi}
                          </CardDescription>
                        </div>
                        <Badge
                          variant={getBadgeVariant(
                            selectedExercise.tingkat_kesulitan
                          )}
                        >
                          {selectedExercise.tingkat_kesulitan}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h3 className="font-medium mb-2">📝 Instruksi:</h3>
                        <p className="text-sm whitespace-pre-line">
                          {selectedExercise.instruksi}
                        </p>
                      </div>

                      {selectedExercise.poin_belajar.length > 0 && (
                        <div>
                          <h3 className="font-medium mb-2 flex items-center gap-2">
                            <Target className="h-4 w-4" />
                            Learning Points:
                          </h3>
                          <ul className="list-disc list-inside text-sm space-y-1">
                            {selectedExercise.poin_belajar.map((point, idx) => (
                              <li key={idx}>{point}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {selectedExercise.test_cases.length > 0 && (
                        <div>
                          <h3 className="font-medium mb-2">✅ Test Cases:</h3>
                          <ul className="list-disc list-inside text-sm space-y-1">
                            {selectedExercise.test_cases.map((test, idx) => (
                              <li key={idx}>{test}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Code Editor */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Your Solution</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <EditorKode
                        nilai={kodeSubmisi}
                        onChange={(value) => setKodeSubmisi(value)}
                        bahasa="python"
                      />
                      <div className="mt-4 flex justify-end gap-2">
                        <Button
                          onClick={handleSubmit}
                          disabled={sedangSubmit || !kodeSubmisi.trim()}
                        >
                          {sedangSubmit ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <Play className="h-4 w-4 mr-2" />
                          )}
                          Submit
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Feedback */}
                  {feedback && (
                    <Card className="border-primary">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                          Feedback
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {feedback.nilai_score !== null && (
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">
                              Score:
                            </p>
                            <p className="text-2xl font-bold">
                              {feedback.nilai_score}/100
                            </p>
                          </div>
                        )}
                        {feedback.feedback && (
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">
                              Feedback:
                            </p>
                            <p className="text-sm">{feedback.feedback}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </div>
              ) : (
                <Card>
                  <CardContent className="py-20 text-center">
                    <Code className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                    <p className="text-lg font-medium mb-2">
                      Pilih Exercise untuk Mulai
                    </p>
                    <p className="text-muted-foreground">
                      Klik salah satu exercise di sebelah kiri
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}

        {/* History Tab */}
        {tab === "history" && (
          <div>
            {submissions.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <History className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-lg font-medium mb-2">Belum Ada History</p>
                  <p className="text-muted-foreground">
                    Mulai mengerjakan exercises untuk melihat history
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {submissions.map((sub) => (
                  <Card key={sub.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-base">
                            {sub.exercise_judul || "Exercise"}
                          </CardTitle>
                          <CardDescription>
                            {sub.exercise_topik || "Unknown Topic"} •{" "}
                            {new Date(sub.created_at).toLocaleString("id-ID")}
                          </CardDescription>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          {sub.status_selesai ? (
                            <Badge variant="default">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Selesai
                            </Badge>
                          ) : (
                            <Badge variant="outline">Draft</Badge>
                          )}
                          {sub.nilai_score !== null && (
                            <Badge variant="secondary">
                              Score: {sub.nilai_score}/100
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    {sub.feedback && (
                      <CardContent>
                        <p className="text-sm text-muted-foreground">
                          {sub.feedback}
                        </p>
                      </CardContent>
                    )}
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
