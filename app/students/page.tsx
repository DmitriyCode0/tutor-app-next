"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { StudentForm } from "@/components/StudentForm";
import { StudentList } from "@/components/StudentList";
import { useStudents } from "@/lib/hooks/useStudents";
import { Student } from "@/lib/types/student";
import { ProtectedPage } from "@/components/ProtectedPage";

export default function StudentsPage() {
  const { students, loading, error, addStudent, updateStudent, deleteStudent } =
    useStudents();
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  const handleSubmit = async (
    studentData: Omit<Student, "id" | "createdAt" | "updatedAt">,
  ) => {
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
      <ProtectedPage>
        <main className="container mx-auto p-4 md:p-10">
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">Loading students...</p>
            </CardContent>
          </Card>
        </main>
      </ProtectedPage>
    );
  }

  return (
    <ProtectedPage>
      <main className="container mx-auto px-4 py-6 md:px-8 md:py-8 max-w-7xl">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 mb-8">
          <Card className="flex-1 max-w-2xl">
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl font-bold font-architects">
                Student Management
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-muted-foreground leading-relaxed">
                Manage your students and their default hourly rates.
              </p>
            </CardContent>
          </Card>
          <div className="flex items-center gap-2"></div>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <StudentForm
          onSubmit={handleSubmit}
          onCancel={editingStudent ? handleCancelEdit : undefined}
          initialData={editingStudent || undefined}
          submitLabel={editingStudent ? "Update Student" : "Add Student"}
        />

        <Separator className="my-10" />

        <StudentList
          students={students}
          onDelete={deleteStudent}
          onEdit={handleEdit}
        />
      </main>
    </ProtectedPage>
  );
}
