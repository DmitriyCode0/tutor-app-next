import { Student } from "@/lib/types/student";
import { storageService } from "./storageService";
import { apiService } from "./apiService";

const USE_API = process.env.NEXT_PUBLIC_USE_API === "true";

/**
 * Student service for CRUD operations
 * Abstracts storage implementation to allow easy swap between localStorage and API
 */
class StudentService {
  private get storage() {
    return USE_API ? apiService : storageService;
  }

  /**
   * Get all students
   * @returns Promise resolving to array of all students
   */
  async getAllStudents(): Promise<Student[]> {
    if (USE_API) {
      return this.storage.fetchStudents();
    }
    return this.storage.loadStudents();
  }

  /**
   * Get student by ID
   * @param id Student ID
   * @returns Promise resolving to student or null if not found
   */
  async getStudentById(id: number): Promise<Student | null> {
    const students = await this.getAllStudents();
    return students.find((student) => student.id === id) || null;
  }

  /**
   * Get student by name (case-insensitive)
   * @param name Student name to search for
   * @returns Promise resolving to student or null if not found
   */
  async getStudentByName(name: string): Promise<Student | null> {
    const students = await this.getAllStudents();
    const normalizedName = name.trim().toLowerCase();
    return (
      students.find(
        (student) => student.name.toLowerCase() === normalizedName
      ) || null
    );
  }

  /**
   * Search students by name (case-insensitive partial match)
   * @param query Search query
   * @returns Promise resolving to array of matching students
   */
  async searchStudents(query: string): Promise<Student[]> {
    const students = await this.getAllStudents();
    const normalizedQuery = query.trim().toLowerCase();
    
    if (!normalizedQuery) {
      return students;
    }

    return students.filter((student) =>
      student.name.toLowerCase().includes(normalizedQuery)
    );
  }

  /**
   * Add a new student
   * @param studentData Student data without id, createdAt, and updatedAt
   * @returns Promise resolving to the created student with generated id and timestamps
   */
  async addStudent(
    studentData: Omit<Student, "id" | "createdAt" | "updatedAt">
  ): Promise<Student> {
    if (USE_API) {
      return this.storage.createStudent(studentData);
    }

    const students = await this.getAllStudents();
    
    // Check if student with same name already exists
    const existing = await this.getStudentByName(studentData.name);
    if (existing) {
      throw new Error(`Student with name "${studentData.name}" already exists`);
    }

    const now = new Date().toISOString();
    const newStudent: Student = {
      ...studentData,
      id: Date.now(), // Simple ID generation (can be improved with UUID)
      createdAt: now,
      updatedAt: now,
    };

    students.push(newStudent);
    await this.storage.saveStudents(students);

    return newStudent;
  }

  /**
   * Update an existing student
   * @param id Student ID to update
   * @param updates Partial student data to update
   * @returns Promise resolving to the updated student
   * @throws Error if student not found
   */
  async updateStudent(
    id: number,
    updates: Partial<Omit<Student, "id" | "createdAt">>
  ): Promise<Student> {
    if (USE_API) {
      return this.storage.updateStudent(id, updates);
    }

    const students = await this.getAllStudents();
    const index = students.findIndex((student) => student.id === id);

    if (index === -1) {
      throw new Error(`Student with id ${id} not found`);
    }

    // If name is being updated, check for duplicates
    if (updates.name && updates.name !== students[index].name) {
      const existing = await this.getStudentByName(updates.name);
      if (existing && existing.id !== id) {
        throw new Error(`Student with name "${updates.name}" already exists`);
      }
    }

    students[index] = {
      ...students[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    await this.storage.saveStudents(students);
    return students[index];
  }

  /**
   * Delete a student
   * @param id Student ID to delete
   * @throws Error if student not found
   */
  async deleteStudent(id: number): Promise<void> {
    if (USE_API) {
      return this.storage.deleteStudent(id);
    }

    const students = await this.getAllStudents();
    const filtered = students.filter((student) => student.id !== id);

    if (filtered.length === students.length) {
      throw new Error(`Student with id ${id} not found`);
    }

    await this.storage.saveStudents(filtered);
  }

  /**
   * Clear all students
   */
  async clearAllStudents(): Promise<void> {
    await this.storage.clearStudents();
  }
}

// Export singleton instance
export const studentService = new StudentService();
