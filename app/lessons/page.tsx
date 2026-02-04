"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useLessons } from "@/lib/hooks/useLessons";
import { useStudents } from "@/lib/hooks/useStudents";
import { Lesson } from "@/lib/types/lesson";
import { Student } from "@/lib/types/student";

export default function LessonsPage() {
  const {
    lessons,
    loading: lessonsLoading,
    error: lessonsError,
  } = useLessons();
  const {
    students,
    loading: studentsLoading,
    error: studentsError,
  } = useStudents();

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

  const getStudentLessons = (studentName: string): Lesson[] => {
    return lessons.filter((lesson) => lesson.studentName === studentName);
  };

  const getStudentTotalIncome = (studentName: string): number => {
    return getStudentLessons(studentName).reduce(
      (total, lesson) => total + lesson.hourlyRate * lesson.duration,
      0,
    );
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-architects">
            Lessons by Student
          </h1>
          <p className="text-muted-foreground mt-2">
            View all lessons organized by student folders
          </p>
        </div>
        <div className="flex gap-2"></div>
      </div>

      {students.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground mb-4">No students found.</p>
            <Button>Add Your First Student</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {students.map((student) => {
            const studentLessons = getStudentLessons(student.name);
            const totalIncome = getStudentTotalIncome(student.name);

            return (
              <Card
                key={student.id}
                className="transition-shadow hover:shadow-md"
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl">{student.name}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {formatCurrency(student.hourlyRate)}/hour •{" "}
                        {studentLessons.length} lesson
                        {studentLessons.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                    <Badge
                      variant="secondary"
                      className="text-lg font-semibold"
                    >
                      {formatCurrency(totalIncome)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {studentLessons.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">
                      No lessons recorded for this student yet.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {studentLessons
                        .sort(
                          (a, b) =>
                            new Date(b.date).getTime() -
                            new Date(a.date).getTime(),
                        )
                        .map((lesson) => (
                          <div
                            key={lesson.id}
                            className="flex items-center justify-between p-3 border rounded-lg bg-muted/50"
                          >
                            <div className="flex-1">
                              <div className="font-medium">
                                {formatDate(lesson.date)}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {lesson.duration} hour
                                {lesson.duration !== 1 ? "s" : ""} ×{" "}
                                {formatCurrency(lesson.hourlyRate)}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-semibold">
                                {formatCurrency(
                                  lesson.hourlyRate * lesson.duration,
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </main>
  );
}
