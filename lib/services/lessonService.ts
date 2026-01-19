import { Lesson } from "@/lib/types/lesson";
import { storageService } from "./storageService";

/**
 * Lesson service for CRUD operations
 * Abstracts storage implementation to allow easy swap between localStorage and API
 */
class LessonService {
  private storage = storageService;

  /**
   * Get all lessons
   * @returns Promise resolving to array of all lessons
   */
  async getAllLessons(): Promise<Lesson[]> {
    return this.storage.loadLessons();
  }

  /**
   * Add a new lesson
   * @param lessonData Lesson data without id and createdAt
   * @returns Promise resolving to the created lesson with generated id and timestamp
   */
  async addLesson(
    lessonData: Omit<Lesson, "id" | "createdAt">
  ): Promise<Lesson> {
    const lessons = await this.getAllLessons();
    
    const newLesson: Lesson = {
      ...lessonData,
      id: Date.now(), // Simple ID generation (can be improved with UUID)
      createdAt: new Date().toISOString(),
    };

    lessons.push(newLesson);
    await this.storage.saveLessons(lessons);

    return newLesson;
  }

  /**
   * Update an existing lesson
   * @param id Lesson ID to update
   * @param updates Partial lesson data to update
   * @returns Promise resolving to the updated lesson
   * @throws Error if lesson not found
   */
  async updateLesson(
    id: number,
    updates: Partial<Omit<Lesson, "id" | "createdAt">>
  ): Promise<Lesson> {
    const lessons = await this.getAllLessons();
    const index = lessons.findIndex((lesson) => lesson.id === id);

    if (index === -1) {
      throw new Error(`Lesson with id ${id} not found`);
    }

    lessons[index] = {
      ...lessons[index],
      ...updates,
    };

    await this.storage.saveLessons(lessons);
    return lessons[index];
  }

  /**
   * Delete a lesson
   * @param id Lesson ID to delete
   * @throws Error if lesson not found
   */
  async deleteLesson(id: number): Promise<void> {
    const lessons = await this.getAllLessons();
    const filtered = lessons.filter((lesson) => lesson.id !== id);

    if (filtered.length === lessons.length) {
      throw new Error(`Lesson with id ${id} not found`);
    }

    await this.storage.saveLessons(filtered);
  }

  /**
   * Clear all lessons
   */
  async clearAllLessons(): Promise<void> {
    await this.storage.clearLessons();
  }
}

// Export singleton instance
export const lessonService = new LessonService();
