"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StudentForm } from "@/components/StudentForm";
import { StudentList } from "@/components/StudentList";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AuthButton } from "@/components/AuthButton";
import { useStudents } from "@/lib/hooks/useStudents";
import { Student } from "@/lib/types/student";

export default function StudentsPage() {
  const { students, loading, error, addStudent, updateStudent, deleteStudent } = useStudents();
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  const handleSubmit = async (studentData: Omit<Student, "id" | "createdAt" | "updatedAt">) => {
    try {
      if (editingStudent) {
        await updateStudent(editingStudent.id, studentData);
        setEditingStudent(null);
      } else {
        await addStudent(studentData);
      }
    } catch (error) {
      console.error("Failed to save student:", error);
      throw error;
    }
  };

  const handleEdit = (student: Student) => {
    setEditingStudent(student);
    // Scroll to form
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setEditingStudent(null);
  };

  if (loading) {
    return (
      <main className="container mx-auto p-4 md:p-10">
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">Loading students...</p>
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
            <CardTitle className="text-2xl mb-4 mt-4 mr-4">Student Management</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Manage your students and their default hourly rates. When you add a lesson, you can quickly select a student and their rate will be auto-filled.
            </p>
          </CardContent>
        </Card>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {process.env.NEXT_PUBLIC_USE_API === "true" && <AuthButton />}
          <Link href="/">
            <Button variant="outline">Back to Dashboard</Button>
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

      <StudentForm
        onSubmit={handleSubmit}
        onCancel={editingStudent ? handleCancelEdit : undefined}
        initialData={editingStudent || undefined}
        submitLabel={editingStudent ? "Update Student" : "Add Student"}
      />

      <StudentList
        students={students}
        onDelete={deleteStudent}
        onEdit={handleEdit}
      />
    </main>
  );
}
