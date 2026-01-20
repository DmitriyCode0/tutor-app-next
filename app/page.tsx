"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LessonForm } from "@/components/LessonForm";
import { LessonList } from "@/components/LessonList";
import { IncomeSummary } from "@/components/IncomeSummary";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AuthButton } from "@/components/AuthButton";
import { useLessons } from "@/lib/hooks/useLessons";
import { Lesson } from "@/lib/types/lesson";

export default function Home() {
  const { lessons, loading, error, addLesson, updateLesson, deleteLesson } = useLessons();
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
      <main className="container mx-auto p-4 md:p-10">
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">Loading lessons...</p>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="container mx-auto p-4 md:p-10 space-y-6">
      <div className="flex items-center justify-between">
        <Card className="mb-4 mt-4 mr-4">
          <CardHeader>
            <CardTitle className="text-2xl">Tutor Income Calculator</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Track your tutoring lessons and calculate your income by week and month.
            </p>
          </CardContent>
        </Card>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {process.env.NEXT_PUBLIC_USE_API === "true" && <AuthButton />}
          <Link href="/students">
            <Button variant="outline">Manage Students</Button>
          </Link>
        </div>
      </div>

      {error && (
        <Card>
          <CardContent className="py-4">
            <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
              Error: {error}
            </div>
          </CardContent>
        </Card>
      )}

      <IncomeSummary lessons={lessons} />

      <LessonForm
        onSubmit={handleSubmit}
        onCancel={editingLesson ? handleCancelEdit : undefined}
        initialData={editingLesson || undefined}
        submitLabel={editingLesson ? "Update Lesson" : "Add Lesson"}
      />

      <LessonList
        lessons={lessons}
        onDelete={deleteLesson}
        onEdit={handleEdit}
      />
    </main>
  );
}
