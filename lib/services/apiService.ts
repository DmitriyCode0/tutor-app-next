import { Lesson } from "@/lib/types/lesson";
import { Student } from "@/lib/types/student";

const API_BASE_URL = "/api";

/**
 * API Service for making requests to Next.js API routes
 * Handles authentication automatically via cookies
 */
class ApiService {
  private async fetchWithAuth<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      credentials: "include",
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: "An error occurred",
      }));
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Lessons API
  async fetchLessons(): Promise<Lesson[]> {
    return this.fetchWithAuth<Lesson[]>("/lessons");
  }

  async createLesson(
    lesson: Omit<Lesson, "id" | "createdAt">
  ): Promise<Lesson> {
    return this.fetchWithAuth<Lesson>("/lessons", {
      method: "POST",
      body: JSON.stringify(lesson),
    });
  }

  async updateLesson(
    id: number,
    updates: Partial<Omit<Lesson, "id" | "createdAt">>
  ): Promise<Lesson> {
    return this.fetchWithAuth<Lesson>(`/lessons/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });
  }

  async deleteLesson(id: number): Promise<void> {
    await this.fetchWithAuth(`/lessons/${id}`, {
      method: "DELETE",
    });
  }

  // Students API
  async fetchStudents(): Promise<Student[]> {
    return this.fetchWithAuth<Student[]>("/students");
  }

  async createStudent(
    student: Omit<Student, "id" | "createdAt" | "updatedAt">
  ): Promise<Student> {
    return this.fetchWithAuth<Student>("/students", {
      method: "POST",
      body: JSON.stringify(student),
    });
  }

  async updateStudent(
    id: number,
    updates: Partial<Omit<Student, "id" | "createdAt">>
  ): Promise<Student> {
    return this.fetchWithAuth<Student>(`/students/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });
  }

  async deleteStudent(id: number): Promise<void> {
    await this.fetchWithAuth(`/students/${id}`, {
      method: "DELETE",
    });
  }
}

export const apiService = new ApiService();
