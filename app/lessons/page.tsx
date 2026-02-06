"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LessonCard } from "@/components/LessonCard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, ChevronRight, Trash2, Edit2 } from "lucide-react";
import { useLessons } from "@/lib/hooks/useLessons";
import { useStudents } from "@/lib/hooks/useStudents";
import {
  getWeekRange,
  isDateInRange,
  formatDateRange,
} from "@/lib/utils/dateUtils";

export default function LessonsPage() {
  const {
    lessons,
    loading: lessonsLoading,
    error: lessonsError,
    deleteLesson,
    updateLesson,
  } = useLessons();
  const {
    students,
    loading: studentsLoading,
    error: studentsError,
  } = useStudents();

  const [weekOffset, setWeekOffset] = useState(0);
  const [sortBy, setSortBy] = useState<"date" | "student">("date");

  const currentDate = new Date();
  const baseDate = new Date(currentDate);
  baseDate.setDate(baseDate.getDate() + weekOffset * 7);
  const { start, end } = getWeekRange(baseDate);

  const filteredLessons = lessons
    .filter((lesson) => {
      const lessonDate = new Date(lesson.date);
      return isDateInRange(lessonDate, start, end);
    })
    .sort((a, b) => {
      if (sortBy === "date") {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      } else {
        return a.studentName.localeCompare(b.studentName);
      }
    });

  if (lessonsLoading || studentsLoading) {
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

  if (lessonsError || studentsError) {
    return (
      <main className="container mx-auto p-4 md:p-10">
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-destructive">
              Error: {lessonsError || studentsError}
            </p>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="container mx-auto p-4 md:p-10 space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-architects">Weekly Lessons</h1>
        <p className="text-muted-foreground mt-2">
          {formatDateRange(start, end)}
        </p>
      </div>

      {/* Week Navigation and Sort Controls */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            {/* Week Navigation */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setWeekOffset(weekOffset - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium min-w-fit">
                {formatDateRange(start, end)}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setWeekOffset(weekOffset + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setWeekOffset(0)}
              >
                Today
              </Button>
            </div>

            {/* Sort Dropdown */}
            <Select
              value={sortBy}
              onValueChange={(value) => setSortBy(value as "date" | "student")}
            >
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Sort by..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Sort by Date</SelectItem>
                <SelectItem value="student">Sort by Student</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Lessons List */}
      {filteredLessons.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">No lessons for this week.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredLessons.map((lesson) => {
            return (
              <LessonCard
                key={lesson.id}
                lesson={lesson}
                onUpdate={updateLesson}
                onDeleteConfirmed={deleteLesson}
              />
            );
          })}
        </div>
      )}
    </main>
  );
}
