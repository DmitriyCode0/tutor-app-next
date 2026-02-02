import { Lesson } from "@/lib/types/lesson";
import { Student } from "@/lib/types/student";

const LESSONS_STORAGE_KEY = "tutor_lessons";
const STUDENTS_STORAGE_KEY = "tutor_students";

/**
 * Load lessons from localStorage
 * @returns Array of lessons
 */
export function loadLessons(): Lesson[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(LESSONS_STORAGE_KEY);
    if (!stored) return [];
    const lessons = JSON.parse(stored) as Lesson[];
    return Array.isArray(lessons) ? lessons : [];
  } catch (error) {
    console.error("Failed to load lessons:", error);
    return [];
  }
}

/**
 * Save lessons to localStorage
 * @param lessons Array of lessons to save
 */
export function saveLessons(lessons: Lesson[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LESSONS_STORAGE_KEY, JSON.stringify(lessons));
  } catch (error) {
    console.error("Failed to save lessons:", error);
  }
}

/**
 * Load students from localStorage
 * @returns Array of students
 */
export function loadStudents(): Student[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(STUDENTS_STORAGE_KEY);
    if (!stored) return [];
    const students = JSON.parse(stored) as Student[];
    return Array.isArray(students) ? students : [];
  } catch (error) {
    console.error("Failed to load students:", error);
    return [];
  }
}

/**
 * Save students to localStorage
 * @param students Array of students to save
 */
export function saveStudents(students: Student[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STUDENTS_STORAGE_KEY, JSON.stringify(students));
  } catch (error) {
    console.error("Failed to save students:", error);
  }
}