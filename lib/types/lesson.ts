/**
 * Lesson data model
 * Represents a single tutoring lesson with all relevant information
 */
export interface Lesson {
  id: number; // Unique identifier for the lesson
  studentName: string; // Name of the student
  hourlyRate: number; // Rate charged per hour
  duration: number; // Duration of lesson in hours
  date: string; // Date of lesson in YYYY-MM-DD format
  createdAt: string; // ISO timestamp when lesson was created
  updatedAt?: string; // ISO timestamp when lesson was last updated
  userId?: string; // Optional user ID for future backend integration
}

/**
 * Income period interface for period-based calculations
 */
export interface IncomePeriod {
  start: Date;
  end: Date;
  income: number;
  lessonCount: number;
}

/**
 * Monthly income breakdown
 */
export interface MonthlyIncome {
  month: string; // YYYY-MM format
  year: number;
  monthName: string; // Human-readable month name
  income: number;
  lessonCount: number;
  lessons: Lesson[];
}

/**
 * Weekly income breakdown
 */
export interface WeeklyIncome {
  weekStart: Date;
  weekEnd: Date;
  income: number;
  lessonCount: number;
  lessons: Lesson[];
}
