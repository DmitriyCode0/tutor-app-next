"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
import { Lesson } from "@/lib/types/lesson";
import { Student } from "@/lib/types/student";
import {
  getWeekRange,
  isDateInRange,
  formatDateRange,
} from "@/lib/utils/dateUtils";
import { EditLessonDialog } from "@/components/EditLessonDialog";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";

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
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Lesson | null>(null);

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

  const formatCurrency = (amount: number): string => {
    return `₴${amount.toFixed(2)}`;
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const promptDelete = (lesson: Lesson) => {
    setDeleteTarget(lesson);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteLesson(deleteTarget.id);
      setDeleteTarget(null);
    } catch (error) {
      console.error("Failed to delete lesson:", error);
      alert("Failed to delete lesson. Please try again.");
    }
  };

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
            const student = students.find((s) => s.name === lesson.studentName);
            const income = lesson.hourlyRate * lesson.duration;

            return (
              <Card
                key={lesson.id}
                className="transition-shadow hover:shadow-md"
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">
                          {lesson.studentName}
                        </h3>
                        <Badge variant="secondary">
                          {formatDate(lesson.date)}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>
                          {lesson.duration} hour
                          {lesson.duration !== 1 ? "s" : ""} ×{" "}
                          {formatCurrency(lesson.hourlyRate)}/hour
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-3">
                      <div className="text-right">
                        <div className="text-xl font-bold">
                          {formatCurrency(income)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {lesson.studentName}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingLesson(lesson)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => setDeleteTarget(lesson)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Delete confirmation dialog */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Lesson</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the lesson for{" "}
              {deleteTarget?.studentName} on{" "}
              {deleteTarget ? formatDate(deleteTarget.date) : ""}? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={confirmDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit dialog */}
      <EditLessonDialog
        open={!!editingLesson}
        onOpenChange={(open) => {
          if (!open) setEditingLesson(null);
        }}
        lesson={editingLesson}
        onSave={async (id, updates) => {
          await updateLesson(id, updates);
          setEditingLesson(null);
        }}
      />
    </main>
  );
}
