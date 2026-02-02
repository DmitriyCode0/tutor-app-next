"use client";

import { useState, useEffect, useCallback } from "react";
import { Student } from "@/lib/types/student";

const STUDENTS_STORAGE_KEY = "tutor_students";

interface UseStudentsReturn {
  students: Student[];
  loading: boolean;
  error: string | null;
  addStudent: (
    student: Omit<Student, "id" | "createdAt" | "updatedAt">,
  ) => Promise<void>;
  updateStudent: (
    id: number,
    updates: Partial<Omit<Student, "id" | "createdAt">>,
  ) => Promise<void>;
  deleteStudent: (id: number) => Promise<void>;
  searchStudents: (query: string) => Promise<Student[]>;
  getStudentByName: (name: string) => Promise<Student | null>;
  refreshStudents: () => Promise<void>;
}

/**
 * Custom hook for managing students state
 * Provides CRUD operations and loading/error states
 */
export function useStudents(): UseStudentsReturn {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStudents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const stored = localStorage.getItem(STUDENTS_STORAGE_KEY);
      if (!stored) {
        setStudents([]);
        return;
      }
      const loadedStudents = JSON.parse(stored) as Student[];
      if (!Array.isArray(loadedStudents)) {
        console.warn("Invalid data in storage, returning empty array");
        setStudents([]);
        return;
      }
      setStudents(loadedStudents);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load students";
      setError(errorMessage);
      console.error("Error loading students from storage:", err);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const saveStudents = useCallback(async (studentsToSave: Student[]) => {
    try {
      const serialized = JSON.stringify(studentsToSave);
      localStorage.setItem(STUDENTS_STORAGE_KEY, serialized);
    } catch (error) {
      if (
        error instanceof DOMException &&
        error.name === "QuotaExceededError"
      ) {
        throw new Error(
          "Storage quota exceeded. Please delete some students or clear old data.",
        );
      }
      throw new Error("Failed to save students to storage");
    }
  }, []);

  const getStudentByName = useCallback(
    (name: string): Student | null => {
      const normalizedName = name.trim().toLowerCase();
      return (
        students.find(
          (student) => student.name.toLowerCase() === normalizedName,
        ) || null
      );
    },
    [students],
  );

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  const addStudent = useCallback(
    async (studentData: Omit<Student, "id" | "createdAt" | "updatedAt">) => {
      try {
        setError(null);

        // Check if student with same name already exists
        const existing = getStudentByName(studentData.name);
        if (existing) {
          throw new Error(
            `Student with name "${studentData.name}" already exists`,
          );
        }

        const now = new Date().toISOString();
        const newStudent: Student = {
          ...studentData,
          id: Date.now(),
          createdAt: now,
          updatedAt: now,
        };

        const updatedStudents = [...students, newStudent];
        await saveStudents(updatedStudents);
        setStudents(updatedStudents);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to add student";
        setError(errorMessage);
        throw err;
      }
    },
    [students, saveStudents, getStudentByName],
  );

  const updateStudent = useCallback(
    async (id: number, updates: Partial<Omit<Student, "id" | "createdAt">>) => {
      try {
        setError(null);
        const index = students.findIndex((student) => student.id === id);

        if (index === -1) {
          throw new Error(`Student with id ${id} not found`);
        }

        // If name is being updated, check for duplicates
        if (updates.name && updates.name !== students[index].name) {
          const existing = getStudentByName(updates.name);
          if (existing && existing.id !== id) {
            throw new Error(
              `Student with name "${updates.name}" already exists`,
            );
          }
        }

        const updatedStudent = {
          ...students[index],
          ...updates,
          updatedAt: new Date().toISOString(),
        };

        const updatedStudents = [...students];
        updatedStudents[index] = updatedStudent;

        await saveStudents(updatedStudents);
        setStudents(updatedStudents);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to update student";
        setError(errorMessage);
        throw err;
      }
    },
    [students, saveStudents, getStudentByName],
  );

  const deleteStudent = useCallback(
    async (id: number) => {
      try {
        setError(null);
        const filtered = students.filter((student) => student.id !== id);

        if (filtered.length === students.length) {
          throw new Error(`Student with id ${id} not found`);
        }

        await saveStudents(filtered);
        setStudents(filtered);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to delete student";
        setError(errorMessage);
        throw err;
      }
    },
    [students, saveStudents],
  );

  const searchStudents = useCallback(
    async (query: string): Promise<Student[]> => {
      try {
        const normalizedQuery = query.trim().toLowerCase();

        if (!normalizedQuery) {
          return students;
        }

        return students.filter((student) =>
          student.name.toLowerCase().includes(normalizedQuery),
        );
      } catch (err) {
        console.error("Error searching students:", err);
        return [];
      }
    },
    [students],
  );

  return {
    students,
    loading,
    error,
    addStudent,
    updateStudent,
    deleteStudent,
    searchStudents,
    getStudentByName: async (name: string) => getStudentByName(name),
    refreshStudents: loadStudents,
  };
}
