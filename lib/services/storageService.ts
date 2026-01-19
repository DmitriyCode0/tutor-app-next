import { Lesson } from "@/lib/types/lesson";
import { Student } from "@/lib/types/student";

const LESSONS_STORAGE_KEY = "tutor_lessons";
const STUDENTS_STORAGE_KEY = "tutor_students";

/**
 * Storage service abstraction for localStorage
 * Uses async interface to match future API service implementation
 */
export const storageService = {
  /**
   * Save lessons to localStorage
   * @param lessons Array of lessons to save
   */
  async saveLessons(lessons: Lesson[]): Promise<void> {
    try {
      const serialized = JSON.stringify(lessons);
      localStorage.setItem(LESSONS_STORAGE_KEY, serialized);
    } catch (error) {
      if (error instanceof DOMException && error.name === "QuotaExceededError") {
        throw new Error("Storage quota exceeded. Please delete some lessons or clear old data.");
      }
      throw new Error("Failed to save lessons to storage");
    }
  },

  /**
   * Load lessons from localStorage
   * @returns Array of lessons or empty array if none exist
   */
  async loadLessons(): Promise<Lesson[]> {
    try {
      const stored = localStorage.getItem(LESSONS_STORAGE_KEY);
      if (!stored) {
        return [];
      }
      const lessons = JSON.parse(stored) as Lesson[];
      // Validate that we got an array
      if (!Array.isArray(lessons)) {
        console.warn("Invalid data in storage, returning empty array");
        return [];
      }
      return lessons;
    } catch (error) {
      console.error("Error loading lessons from storage:", error);
      // Return empty array on parse errors to prevent app crash
      return [];
    }
  },

  /**
   * Clear all lessons from localStorage
   */
  async clearLessons(): Promise<void> {
    try {
      localStorage.removeItem(LESSONS_STORAGE_KEY);
    } catch (error) {
      throw new Error("Failed to clear lessons from storage");
    }
  },

  /**
   * Save students to localStorage
   * @param students Array of students to save
   */
  async saveStudents(students: Student[]): Promise<void> {
    try {
      const serialized = JSON.stringify(students);
      localStorage.setItem(STUDENTS_STORAGE_KEY, serialized);
    } catch (error) {
      if (error instanceof DOMException && error.name === "QuotaExceededError") {
        throw new Error("Storage quota exceeded. Please delete some students or clear old data.");
      }
      throw new Error("Failed to save students to storage");
    }
  },

  /**
   * Load students from localStorage
   * @returns Array of students or empty array if none exist
   */
  async loadStudents(): Promise<Student[]> {
    try {
      const stored = localStorage.getItem(STUDENTS_STORAGE_KEY);
      if (!stored) {
        return [];
      }
      const students = JSON.parse(stored) as Student[];
      // Validate that we got an array
      if (!Array.isArray(students)) {
        console.warn("Invalid data in storage, returning empty array");
        return [];
      }
      return students;
    } catch (error) {
      console.error("Error loading students from storage:", error);
      // Return empty array on parse errors to prevent app crash
      return [];
    }
  },

  /**
   * Clear all students from localStorage
   */
  async clearStudents(): Promise<void> {
    try {
      localStorage.removeItem(STUDENTS_STORAGE_KEY);
    } catch (error) {
      throw new Error("Failed to clear students from storage");
    }
  },
};
