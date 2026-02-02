"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { LessonForm } from "@/components/LessonForm";
import { LessonList } from "@/components/LessonList";
import { IncomeSummary } from "@/components/IncomeSummary";
import { useLessons } from "@/lib/hooks/useLessons";
import { Lesson } from "@/lib/types/lesson";

export default function Home() {
  const { lessons, loading, error, addLesson, updateLesson, deleteLesson } =
    useLessons();
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);

  const handleSubmit = async (lessonData: Omit<Lesson, "id" | "createdAt">) => {
    try {
      if (editingLesson) {
        await updateLesson(editingLesson.id, lessonData);
        setEditingLesson(null);
      } else {
        await addLesson(lessonData);
      }
    } catch (error) {
      console.error("Failed to save lesson:", error);
      throw error;
    }
  };

  const handleEdit = (lesson: Lesson) => {
    setEditingLesson(lesson);
  };

  const handleCancelEdit = () => {
    setEditingLesson(null);
  };

  if (loading) {
    return (
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
    );
  }

  return (
    <main className="container mx-auto px-4 py-6 md:px-8 md:py-8 max-w-7xl">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 mb-8">
        <Card className="flex-1 max-w-2xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl font-bold">
              Tutor Income Calculator
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-muted-foreground leading-relaxed">
              Track your tutoring lessons and calculate your income by week and
              month.
            </p>
          </CardContent>
        </Card>
        <div className="flex-shrink-0">
          <Link href="/students">
            <Button variant="outline" size="lg" className="w-full lg:w-auto">
              Manage Students
            </Button>
          </Link>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <IncomeSummary lessons={lessons} />

      <Separator className="my-10" />

      <LessonForm
        onSubmit={handleSubmit}
        onCancel={editingLesson ? handleCancelEdit : undefined}
        initialData={editingLesson || undefined}
        submitLabel={editingLesson ? "Update Lesson" : "Add Lesson"}
      />

      <Separator className="my-10" />

      <LessonList
        lessons={lessons}
        onDelete={deleteLesson}
        onEdit={handleEdit}
      />
    </main>
  );
}
