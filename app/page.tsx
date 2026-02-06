"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { LessonForm } from "@/components/LessonForm";
import { LessonCard } from "@/components/LessonCard";
import { IncomeSummary } from "@/components/IncomeSummary";
import { useLessons } from "@/lib/hooks/useLessons";
import { Lesson } from "@/lib/types/lesson";
import { formatDateString, formatDisplayDate } from "@/lib/utils/dateUtils";

import { ProtectedPage } from "@/components/ProtectedPage";

export default function Home() {
  const { lessons, loading, error, addLesson, updateLesson, deleteLesson } =
    useLessons();

  const handleSubmit = async (
    lessonData: Omit<Lesson, "id" | "createdAt" | "updatedAt">,
  ) => {
    try {
      // Creation via top form. Updates are handled by LessonCard's dialog.
      await addLesson(lessonData);
    } catch (error) {
      console.error("Failed to save lesson:", error);
      throw error;
    }
  };

  if (loading) {
    return (
      <ProtectedPage>
        <main className="container mx-auto px-4 py-6 md:px-8 md:py-8 max-w-7xl">
          {/* Header skeleton */}
          <div className="flex items-center justify-between">
            <Card className="flex-1 mr-4">
              <CardHeader>
                <Skeleton className="h-8 w-64" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-96" />
              </CardContent>
            </Card>
            <Skeleton className="h-10 w-32" />
          </div>

          {/* Income summary skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-5 w-24" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-20 mb-2" />
                  <Skeleton className="h-4 w-16" />
                </CardContent>
              </Card>
            ))}
          </div>

          <Separator />

          {/* Form skeleton */}
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
              <Skeleton className="h-10 w-full" />
              <div className="flex gap-2">
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-20" />
              </div>
            </CardContent>
          </Card>

          <Separator />

          {/* Lessons list skeleton */}
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-20" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex-1">
                      <Skeleton className="h-5 w-32 mb-2" />
                      <Skeleton className="h-4 w-48" />
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <Skeleton className="h-6 w-16 mb-1" />
                        <Skeleton className="h-3 w-12" />
                      </div>
                      <div className="flex gap-2">
                        <Skeleton className="h-8 w-16" />
                        <Skeleton className="h-8 w-18" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </main>
      </ProtectedPage>
    );
  }

  const todayKey = formatDateString(new Date());
  const todaysLessons = lessons.filter((l) => l.date === todayKey);

  return (
    <ProtectedPage>
      <main className="container mx-auto px-4 py-6 md:px-8 md:py-8 max-w-7xl">
        <LessonForm onSubmit={handleSubmit} submitLabel="Add Lesson" />

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Separator className="my-10" />

        <IncomeSummary lessons={lessons} />

        <Separator className="my-10" />

        <h2 className="text-lg font-medium mb-4">Today&apos;s lessons</h2>

        {todaysLessons.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">No lessons for today.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {todaysLessons.map((lesson) => (
              <LessonCard
                key={lesson.id}
                lesson={lesson}
                onUpdate={updateLesson}
                onDeleteConfirmed={deleteLesson}
              />
            ))}
          </div>
        )}
      </main>
    </ProtectedPage>
  );
}
