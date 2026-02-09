/**
 * Validation utility functions for form fields
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export function validateRequired(
  value: string,
  fieldName: string,
): ValidationResult {
  if (!value.trim()) {
    return {
      isValid: false,
      error: `${fieldName} is required`,
    };
  }
  return { isValid: true };
}

export function validatePositiveNumber(
  value: string,
  fieldName: string,
): ValidationResult {
  const num = parseFloat(value);
  if (!value || isNaN(num) || num <= 0) {
    return {
      isValid: false,
      error: `${fieldName} must be greater than 0`,
    };
  }
  return { isValid: true };
}

export function validateEmail(email: string): ValidationResult {
  if (!email) return { isValid: true }; // Optional field

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return {
      isValid: false,
      error: "Please enter a valid email address",
    };
  }
  return { isValid: true };
}

/**
 * Get today's date in YYYY-MM-DD format
 */
export function getTodayDateString(): string {
  return new Date().toISOString().split("T")[0];
}

/**
 * Format a date object to YYYY-MM-DD format
 */
export function formatDateToInputString(date: Date): string {
  return date.toISOString().split("T")[0];
}
