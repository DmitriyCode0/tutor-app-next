"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuth } from "@/lib/providers/auth-provider";
import { formatCurrency as formatCurrencyUtil } from "@/lib/utils/currency";

import { Lesson } from "@/lib/types/lesson";
import { calculateLessonIncome } from "@/lib/utils/incomeUtils";
import { parseDateString } from "@/lib/utils/dateUtils";
import { LessonCard } from "@/components/LessonCard";

interface LessonListProps {
  lessons: Lesson[];
  onDelete: (id: number) => Promise<void>;
  onEdit?: (lesson: Lesson) => void;
  onUpdate?: (
    id: number,
    updates: Partial<Omit<Lesson, "id" | "createdAt" | "updatedAt">>,
  ) => Promise<void>;
  onDeleteConfirmed?: (id: number) => Promise<void>;
}

export function LessonList({
  lessons,
  onDelete,
  onEdit,
  onUpdate,
}: LessonListProps) {
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // currency preference: read from auth metadata or localStorage
  const { user } = useAuth();
  const [currency, setCurrency] = useState<string>("UAH");

  useEffect(() => {
    const meta = (user as any)?.user_metadata || {};
    const saved =
      meta.currency ||
      (() => {
        try {
          return localStorage.getItem("tutor_currency") ?? "UAH";
        } catch {
          return "UAH";
        }
      })();
    setCurrency(saved);
  }, [user]);

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
              const isDeleting = deletingId === lesson.id;

              return (
                <LessonCard
                  key={lesson.id}
                  lesson={lesson}
                  compact
                  className="border rounded-xl"
                  onEdit={(l) => onEdit && onEdit(l)}
                  onUpdate={onUpdate}
                  onDeleteConfirmed={onDelete}
                />
              );
            })}
          </div>
        </TooltipProvider>
      </CardContent>
    </Card>
  );
}
