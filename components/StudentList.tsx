"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import { Student } from "@/lib/types/student";
import { useRole } from "@/lib/providers/role-provider";
import { useLessons } from "@/lib/hooks/useLessons";
import { StudentCard } from "@/components/StudentCard";

interface StudentListProps {
  students: Student[];
  onDelete: (id: number) => Promise<void>;
  onEdit?: (student: Student) => void;
}

export function StudentList({ students, onDelete, onEdit }: StudentListProps) {
  const { t } = useRole();
  const { lessons } = useLessons();
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Student | null>(null);

  const lessonCounts = useMemo(() => {
    const counts = new Map<string, number>();
    lessons.forEach((lesson) => {
      const key = lesson.studentName.trim().toLowerCase();
      counts.set(key, (counts.get(key) ?? 0) + 1);
    });
    return counts;
  }, [lessons]);

  const promptDelete = (student: Student) => {
    setDeleteTarget(student);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeletingId(deleteTarget.id);
      await onDelete(deleteTarget.id);
      setDeleteTarget(null);
    } catch (error) {
      console.error("Failed to delete student:", error);
      alert("Failed to delete student. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  // Filter students based on search query
  const filteredStudents = students.filter((student) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      student.name.toLowerCase().includes(query) ||
      student.email?.toLowerCase().includes(query) ||
      student.phone?.toLowerCase().includes(query)
    );
  });

  if (students.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          <p>
            No {t.students} yet. Add your first {t.student} above!
          </p>
        </CardContent>
      </Card>
    );
  }

  // Sort students alphabetically by name
  const sortedStudents = [...filteredStudents].sort((a, b) =>
    a.name.localeCompare(b.name),
  );

  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardHeader className="pb-6">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">
            {t.Students} ({students.length})
          </CardTitle>
          {students.length > 0 && (
            <div className="w-64">
              <Input
                type="text"
                placeholder={`Search ${t.students}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-10"
              />
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {filteredStudents.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">
            <p>
              No {t.students} found matching "{searchQuery}"
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedStudents.map((student) => {
              const isDeleting = deletingId === student.id;
              const lessonCount =
                lessonCounts.get(student.name.trim().toLowerCase()) ?? 0;

              return (
                <StudentCard
                  key={student.id}
                  student={student}
                  lessonCount={lessonCount}
                  onEdit={onEdit}
                  onDelete={promptDelete}
                  isDeleting={isDeleting}
                />
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
              <AlertDialogTitle>Delete {t.Student}</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete {deleteTarget?.name}? This will
                remove all {t.lessons} tied to this {t.student}.
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
      </CardContent>
    </Card>
  );
}
