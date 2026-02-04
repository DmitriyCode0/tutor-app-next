"use client";

import { useState, useEffect, useCallback } from "react";
import { Student } from "@/lib/types/student";
import {
  loadStudents as loadFromStorage,
  saveStudents as saveToStorage,
} from "@/lib/utils/storage";
import {
  fetchStudents as fetchStudentsRemote,
  createStudent as createStudentRemote,
  updateStudent as updateStudentRemote,
  removeStudent as removeStudentRemote,
} from "@/lib/services/studentService";
import { useAuth } from "@/lib/providers/auth-provider";

interface UseStudentsReturn {
  students: Student[];
  loading: boolean;
  error: string | null;
  addStudent: (
    student: Omit<Student, "id" | "createdAt" | "updatedAt">,
  ) => Promise<void>;
  updateStudent: (
    id: number,
    updates: Partial<Omit<Student, "id" | "createdAt" | "updatedAt">>,
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
  const { supabase, user, isLoading: authLoading } = useAuth();

  const loadStudents = useCallback(async () => {
    if (authLoading) return;

    if (!user) {
      setStudents([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const remoteStudents = await fetchStudentsRemote(supabase, user.id);
      setStudents(remoteStudents);
      saveToStorage(remoteStudents);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load students";
      setError(errorMessage);
      const cached = loadFromStorage();
      setStudents(cached);
      console.error(
        "Error loading students from Supabase, fell back to cache:",
        err,
      );
    } finally {
      setLoading(false);
    }
  }, [authLoading, user, supabase]);

  const saveStudents = useCallback(async (studentsToSave: Student[]) => {
    try {
      saveToStorage(studentsToSave);
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
      if (!user) {
        throw new Error("You must be logged in to add students");
      }

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
        const createdStudent = await createStudentRemote(supabase, user.id, {
          ...studentData,
          createdAt: now,
          updatedAt: now,
          userId: user.id,
        });

        const updatedStudents = [...students, createdStudent];
        await saveStudents(updatedStudents);
        setStudents(updatedStudents);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to add student";
        setError(errorMessage);
        throw err;
      }
    },
    [students, supabase, user, saveStudents, getStudentByName],
  );

  const updateStudent = useCallback(
    async (
      id: number,
      updates: Partial<Omit<Student, "id" | "createdAt" | "updatedAt">>,
    ) => {
      if (!user) {
        throw new Error("You must be logged in to update students");
      }

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

        const updatedStudent = await updateStudentRemote(
          supabase,
          user.id,
          id,
          {
            ...updates,
            updatedAt: new Date().toISOString(),
            userId: user.id,
          },
        );

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
    [students, supabase, user, saveStudents, getStudentByName],
  );

  const deleteStudent = useCallback(
    async (id: number) => {
      if (!user) {
        throw new Error("You must be logged in to delete students");
      }

      try {
        setError(null);
        await removeStudentRemote(supabase, user.id, id);

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
    [students, supabase, user, saveStudents],
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
