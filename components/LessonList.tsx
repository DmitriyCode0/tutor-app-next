"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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

  const isRecentLesson = (dateString: string): boolean => {
    try {
      const lessonDate = parseDateString(dateString);
      const today = new Date();
      const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      return lessonDate >= sevenDaysAgo;
    } catch {
      return false;
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
      return (
        parseDateString(b.date).getTime() - parseDateString(a.date).getTime()
      );
    } catch {
      return 0;
    }
  });

  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardHeader className="pb-6">
        <CardTitle className="flex items-center gap-3 text-xl">
          Lessons
          <Badge variant="outline" className="text-sm font-medium px-3 py-1">
            {lessons.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <TooltipProvider>
          <div className="space-y-4">
            {sortedLessons.map((lesson) => {
              const income = calculateLessonIncome(lesson);
              const isDeleting = deletingId === lesson.id;
              const isRecent = isRecentLesson(lesson.date);

              return (
                <div
                  key={lesson.id}
                  className="flex items-center justify-between p-6 border rounded-xl hover:bg-accent/30 hover:border-accent transition-all duration-200 hover:shadow-sm"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-semibold text-base truncate">
                        {lesson.studentName}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {formatDisplayDate(lesson.date)}
                    </div>
                  </div>
                  <div className="flex items-center gap-6 ml-4">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="text-right cursor-help group">
                          <div className="font-bold text-lg text-primary group-hover:scale-105 transition-transform">
                            ₴{income.toFixed(2)}
                          </div>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="left" className="font-medium">
                        <p>
                          ₴{lesson.hourlyRate} × {lesson.duration} hours
                        </p>
                      </TooltipContent>
                    </Tooltip>
                    <div className="flex gap-3">
                      {onEdit && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onEdit(lesson)}
                              disabled={isDeleting}
                              className="h-9 px-4 hover:bg-accent hover:border-accent-foreground/20"
                            >
                              Edit
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Edit this lesson</p>
                          </TooltipContent>
                        </Tooltip>
                      )}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(lesson.id)}
                            disabled={isDeleting}
                            className="h-9 px-4 hover:bg-destructive/90"
                          >
                            Delete
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Delete this lesson</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </TooltipProvider>
      </CardContent>
    </Card>
  );
}
