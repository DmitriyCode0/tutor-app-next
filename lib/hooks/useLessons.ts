"use client";

import { useState, useEffect, useCallback } from "react";
import { Lesson } from "@/lib/types/lesson";
import { loadLessons as loadFromStorage, saveLessons as saveToStorage } from "@/lib/utils/storage";

interface UseLessonsReturn {
  lessons: Lesson[];
  loading: boolean;
  error: string | null;
  addLesson: (lesson: Omit<Lesson, "id" | "createdAt">) => Promise<void>;
  updateLesson: (
    id: number,
    updates: Partial<Omit<Lesson, "id" | "createdAt">>,
  ) => Promise<void>;
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
      const loadedLessons = loadFromStorage();
      setLessons(loadedLessons);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load lessons";
      setError(errorMessage);
      console.error("Error loading lessons from storage:", err);
      setLessons([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const saveLessons = useCallback(async (lessonsToSave: Lesson[]) => {
    try {
      saveToStorage(lessonsToSave);
    } catch (error) {
      if (
        error instanceof DOMException &&
        error.name === "QuotaExceededError"
      ) {
        throw new Error(
          "Storage quota exceeded. Please delete some lessons or clear old data.",
        );
      }
      throw new Error("Failed to save lessons to storage");
    }
  }, []);

  useEffect(() => {
    loadLessons();
  }, [loadLessons]);

  const addLesson = useCallback(
    async (lessonData: Omit<Lesson, "id" | "createdAt">) => {
      try {
        setError(null);
        const newLesson: Lesson = {
          ...lessonData,
          id: Date.now(),
          createdAt: new Date().toISOString(),
        };

        const updatedLessons = [...lessons, newLesson];
        await saveLessons(updatedLessons);
        setLessons(updatedLessons);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to add lesson";
        setError(errorMessage);
        throw err;
      }
    },
    [lessons, saveLessons],
  );

  const updateLesson = useCallback(
    async (id: number, updates: Partial<Omit<Lesson, "id" | "createdAt">>) => {
      try {
        setError(null);
        const index = lessons.findIndex((lesson) => lesson.id === id);

        if (index === -1) {
          throw new Error(`Lesson with id ${id} not found`);
        }

        const updatedLesson = {
          ...lessons[index],
          ...updates,
        };

        const updatedLessons = [...lessons];
        updatedLessons[index] = updatedLesson;

        await saveLessons(updatedLessons);
        setLessons(updatedLessons);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to update lesson";
        setError(errorMessage);
        throw err;
      }
    },
    [lessons, saveLessons],
  );

  const deleteLesson = useCallback(
    async (id: number) => {
      try {
        setError(null);
        const filtered = lessons.filter((lesson) => lesson.id !== id);

        if (filtered.length === lessons.length) {
          throw new Error(`Lesson with id ${id} not found`);
        }

        await saveLessons(filtered);
        setLessons(filtered);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to delete lesson";
        setError(errorMessage);
        throw err;
      }
    },
    [lessons, saveLessons],
  );

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
