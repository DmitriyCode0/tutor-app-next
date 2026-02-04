"use client";

import { useState, useEffect, useCallback } from "react";
import { Lesson } from "@/lib/types/lesson";
import {
  loadLessons as loadFromStorage,
  saveLessons as saveToStorage,
} from "@/lib/utils/storage";
import {
  fetchLessons as fetchLessonsRemote,
  createLesson as createLessonRemote,
  updateLesson as updateLessonRemote,
  removeLesson as removeLessonRemote,
} from "@/lib/services/lessonService";
import { useAuth } from "@/lib/providers/auth-provider";

interface UseLessonsReturn {
  lessons: Lesson[];
  loading: boolean;
  error: string | null;
  addLesson: (
    lesson: Omit<Lesson, "id" | "createdAt" | "updatedAt">,
  ) => Promise<void>;
  updateLesson: (
    id: number,
    updates: Partial<Omit<Lesson, "id" | "createdAt" | "updatedAt">>,
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
  const { supabase, user, isLoading: authLoading } = useAuth();

  const loadLessons = useCallback(async () => {
    if (authLoading) return;

    if (!user) {
      setLessons([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const remoteLessons = await fetchLessonsRemote(supabase, user.id);
      setLessons(remoteLessons);
      saveToStorage(remoteLessons);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load lessons";
      setError(errorMessage);
      const cached = loadFromStorage();
      setLessons(cached);
      console.error(
        "Error loading lessons from Supabase, fell back to cache:",
        err,
      );
    } finally {
      setLoading(false);
    }
  }, [authLoading, user, supabase]);

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
    async (lessonData: Omit<Lesson, "id" | "createdAt" | "updatedAt">) => {
      if (!user) {
        throw new Error("You must be logged in to add lessons");
      }

      try {
        setError(null);
        const now = new Date().toISOString();
        const createdLesson = await createLessonRemote(supabase, user.id, {
          ...lessonData,
          createdAt: now,
          updatedAt: now,
          userId: user.id,
        });

        const updatedLessons = [...lessons, createdLesson];
        await saveLessons(updatedLessons);
        setLessons(updatedLessons);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to add lesson";
        setError(errorMessage);
        throw err;
      }
    },
    [lessons, supabase, user, saveLessons],
  );

  const updateLesson = useCallback(
    async (
      id: number,
      updates: Partial<Omit<Lesson, "id" | "createdAt" | "updatedAt">>,
    ) => {
      if (!user) {
        throw new Error("You must be logged in to update lessons");
      }

      try {
        setError(null);
        const index = lessons.findIndex((lesson) => lesson.id === id);

        if (index === -1) {
          throw new Error(`Lesson with id ${id} not found`);
        }

        const updatedLesson = await updateLessonRemote(supabase, user.id, id, {
          ...updates,
          updatedAt: new Date().toISOString(),
          userId: user.id,
        });

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
    [lessons, supabase, user, saveLessons],
  );

  const deleteLesson = useCallback(
    async (id: number) => {
      if (!user) {
        throw new Error("You must be logged in to delete lessons");
      }

      try {
        setError(null);
        await removeLessonRemote(supabase, user.id, id);

        const filtered = lessons.filter((lesson) => lesson.id !== id);
        await saveLessons(filtered);
        setLessons(filtered);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to delete lesson";
        setError(errorMessage);
        throw err;
      }
    },
    [lessons, supabase, user, saveLessons],
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
