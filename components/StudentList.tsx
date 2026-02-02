"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Student } from "@/lib/types/student";

interface StudentListProps {
  students: Student[];
  onDelete: (id: number) => Promise<void>;
  onEdit?: (student: Student) => void;
}

export function StudentList({ students, onDelete, onEdit }: StudentListProps) {
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this student?")) {
      return;
    }

    try {
      setDeletingId(id);
      await onDelete(id);
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
          <p>No students yet. Add your first student above!</p>
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
            Students ({students.length})
          </CardTitle>
          {students.length > 0 && (
            <div className="w-64">
              <Input
                type="text"
                placeholder="Search students..."
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
            <p>No students found matching "{searchQuery}"</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedStudents.map((student) => {
              const isDeleting = deletingId === student.id;

              return (
                <div
                  key={student.id}
                  className="flex items-center justify-between p-6 border rounded-xl hover:bg-accent/30 hover:border-accent transition-all duration-200 hover:shadow-sm"
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-base mb-2">
                      {student.name}
                    </div>
                    <div className="text-sm text-muted-foreground mb-1">
                      ₴{student.hourlyRate}/hr
                      {student.email && ` • ${student.email}`}
                      {student.phone && ` • ${student.phone}`}
                    </div>
                    {student.notes && (
                      <div className="text-sm text-muted-foreground">
                        {student.notes}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-3 ml-4">
                    {onEdit && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEdit(student)}
                        disabled={isDeleting}
                        className="h-9 px-4 hover:bg-accent hover:border-accent-foreground/20"
                      >
                        Edit
                      </Button>
                    )}
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(student.id)}
                      disabled={isDeleting}
                      className="h-9 px-4 hover:bg-destructive/90"
                    >
                      {isDeleting ? "Deleting..." : "Delete"}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
