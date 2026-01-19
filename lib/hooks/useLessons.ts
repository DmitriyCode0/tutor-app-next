"use client";

import { useState, useEffect, useCallback } from "react";
import { Lesson } from "@/lib/types/lesson";
import { lessonService } from "@/lib/services/lessonService";

interface UseLessonsReturn {
  lessons: Lesson[];
  loading: boolean;
  error: string | null;
  addLesson: (lesson: Omit<Lesson, "id" | "createdAt">) => Promise<void>;
  updateLesson: (id: number, updates: Partial<Omit<Lesson, "id" | "createdAt">>) => Promise<void>;
  deleteLesson: (id: number) => Promise<void>;
  refreshLessons: () => Promise<void>;
}

/**
 * Custom hook for managing lessons state
 * Provides CRUD operations and loading/error states
 */
export function useLessons(): UseLessonsReturn {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadLessons = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const loadedLessons = await lessonService.getAllLessons();
      setLessons(loadedLessons);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load lessons";
      setError(errorMessage);
      console.error("Error loading lessons:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLessons();
  }, [loadLessons]);

  const addLesson = useCallback(async (lessonData: Omit<Lesson, "id" | "createdAt">) => {
    try {
      setError(null);
      const newLesson = await lessonService.addLesson(lessonData);
      setLessons((prev) => [...prev, newLesson]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to add lesson";
      setError(errorMessage);
      throw err;
    }
  }, []);

  const updateLesson = useCallback(async (
    id: number,
    updates: Partial<Omit<Lesson, "id" | "createdAt">>
  ) => {
    try {
      setError(null);
      const updatedLesson = await lessonService.updateLesson(id, updates);
      setLessons((prev) =>
        prev.map((lesson) => (lesson.id === id ? updatedLesson : lesson))
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update lesson";
      setError(errorMessage);
      throw err;
    }
  }, []);

  const deleteLesson = useCallback(async (id: number) => {
    try {
      setError(null);
      await lessonService.deleteLesson(id);
      setLessons((prev) => prev.filter((lesson) => lesson.id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete lesson";
      setError(errorMessage);
      throw err;
    }
  }, []);

  return {
    lessons,
    loading,
    error,
    addLesson,
    updateLesson,
    deleteLesson,
    refreshLessons: loadLessons,
  };
}
