"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lesson } from "@/lib/types/lesson";
import { calculateLessonIncome } from "@/lib/utils/incomeUtils";
import { parseDateString } from "@/lib/utils/dateUtils";

interface LessonListProps {
  lessons: Lesson[];
  onDelete: (id: number) => Promise<void>;
  onEdit?: (lesson: Lesson) => void;
}

export function LessonList({ lessons, onDelete, onEdit }: LessonListProps) {
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this lesson?")) {
      return;
    }

    try {
      setDeletingId(id);
      await onDelete(id);
    } catch (error) {
      console.error("Failed to delete lesson:", error);
      alert("Failed to delete lesson. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  const formatDisplayDate = (dateString: string): string => {
    try {
      const date = parseDateString(dateString);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  if (lessons.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          <p>No lessons yet. Add your first lesson above!</p>
        </CardContent>
      </Card>
    );
  }

  // Sort lessons by date (most recent first)
  const sortedLessons = [...lessons].sort((a, b) => {
    try {
      return parseDateString(b.date).getTime() - parseDateString(a.date).getTime();
    } catch {
      return 0;
    }
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lessons ({lessons.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {sortedLessons.map((lesson) => {
            const income = calculateLessonIncome(lesson);
            const isDeleting = deletingId === lesson.id;

            return (
              <div
                key={lesson.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex-1">
                  <div className="font-medium">{lesson.studentName}</div>
                  <div className="text-sm text-muted-foreground">
                    {formatDisplayDate(lesson.date)} • {lesson.duration}h @ ₴{lesson.hourlyRate}/hr
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="font-semibold">₴{income.toFixed(2)}</div>
                    <div className="text-xs text-muted-foreground">Income</div>
                  </div>
                  <div className="flex gap-2">
                    {onEdit && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEdit(lesson)}
                        disabled={isDeleting}
                      >
                        Edit
                      </Button>
                    )}
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(lesson.id)}
                      disabled={isDeleting}
                    >
                      {isDeleting ? "Deleting..." : "Delete"}
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
