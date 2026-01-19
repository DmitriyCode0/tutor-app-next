"use client";

import { useState, useEffect, useCallback } from "react";
import { Student } from "@/lib/types/student";
import { studentService } from "@/lib/services/studentService";

interface UseStudentsReturn {
  students: Student[];
  loading: boolean;
  error: string | null;
  addStudent: (student: Omit<Student, "id" | "createdAt" | "updatedAt">) => Promise<void>;
  updateStudent: (id: number, updates: Partial<Omit<Student, "id" | "createdAt">>) => Promise<void>;
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
      const loadedStudents = await studentService.getAllStudents();
      setStudents(loadedStudents);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load students";
      setError(errorMessage);
      console.error("Error loading students:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  const addStudent = useCallback(async (studentData: Omit<Student, "id" | "createdAt" | "updatedAt">) => {
    try {
      setError(null);
      const newStudent = await studentService.addStudent(studentData);
      setStudents((prev) => [...prev, newStudent]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to add student";
      setError(errorMessage);
      throw err;
    }
  }, []);

  const updateStudent = useCallback(async (
    id: number,
    updates: Partial<Omit<Student, "id" | "createdAt">>
  ) => {
    try {
      setError(null);
      const updatedStudent = await studentService.updateStudent(id, updates);
      setStudents((prev) =>
        prev.map((student) => (student.id === id ? updatedStudent : student))
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update student";
      setError(errorMessage);
      throw err;
    }
  }, []);

  const deleteStudent = useCallback(async (id: number) => {
    try {
      setError(null);
      await studentService.deleteStudent(id);
      setStudents((prev) => prev.filter((student) => student.id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete student";
      setError(errorMessage);
      throw err;
    }
  }, []);

  const searchStudents = useCallback(async (query: string): Promise<Student[]> => {
    try {
      return await studentService.searchStudents(query);
    } catch (err) {
      console.error("Error searching students:", err);
      return [];
    }
  }, []);

  const getStudentByName = useCallback(async (name: string): Promise<Student | null> => {
    try {
      return await studentService.getStudentByName(name);
    } catch (err) {
      console.error("Error getting student by name:", err);
      return null;
    }
  }, []);

  return {
    students,
    loading,
    error,
    addStudent,
    updateStudent,
    deleteStudent,
    searchStudents,
    getStudentByName,
    refreshStudents: loadStudents,
  };
}
