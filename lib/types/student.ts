/**
 * Student data model
 * Represents a student with their information and default hourly rate
 */
export interface Student {
  id: number; // Unique identifier for the student
  name: string; // Student name (required)
  hourlyRate: number; // Default hourly rate (required)
  email?: string; // Optional email address
  phone?: string; // Optional phone number
  notes?: string; // Optional notes about the student
  createdAt: string; // ISO timestamp when student was created
  updatedAt: string; // ISO timestamp when student was last updated
  userId?: string; // Optional user ID for future backend integration
}
