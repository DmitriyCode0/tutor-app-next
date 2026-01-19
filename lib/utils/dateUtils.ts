/**
 * Date utility functions for calendar and period calculations
 */

/**
 * Get the start and end dates of the week containing the given date
 * Week starts on Monday (ISO 8601 standard)
 * @param date Date within the week
 * @returns Object with start and end dates of the week
 */
export function getWeekRange(date: Date): { start: Date; end: Date } {
  const d = new Date(date);
  const day = d.getDay();
  // Convert Sunday (0) to 7 for easier calculation
  const dayOfWeek = day === 0 ? 7 : day;
  // Calculate days to subtract to get to Monday
  const diff = d.getDate() - dayOfWeek + 1;
  
  const start = new Date(d.setDate(diff));
  start.setHours(0, 0, 0, 0);
  
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  
  return { start, end };
}

/**
 * Get the start and end dates of the month containing the given date
 * @param date Date within the month
 * @returns Object with start and end dates of the month
 */
export function getMonthRange(date: Date): { start: Date; end: Date } {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  start.setHours(0, 0, 0, 0);
  
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  end.setHours(23, 59, 59, 999);
  
  return { start, end };
}

/**
 * Check if a date falls within a date range (inclusive)
 * @param date Date to check
 * @param start Start of range
 * @param end End of range
 * @returns True if date is within range
 */
export function isDateInRange(date: Date, start: Date, end: Date): boolean {
  const checkDate = new Date(date);
  checkDate.setHours(0, 0, 0, 0);
  
  const rangeStart = new Date(start);
  rangeStart.setHours(0, 0, 0, 0);
  
  const rangeEnd = new Date(end);
  rangeEnd.setHours(23, 59, 59, 999);
  
  return checkDate >= rangeStart && checkDate <= rangeEnd;
}

/**
 * Format a date range for display
 * @param start Start date
 * @param end End date
 * @returns Formatted string like "Jan 1 - Jan 7, 2024"
 */
export function formatDateRange(start: Date, end: Date): string {
  const startMonth = start.toLocaleDateString("en-US", { month: "short" });
  const startDay = start.getDate();
  const endMonth = end.toLocaleDateString("en-US", { month: "short" });
  const endDay = end.getDate();
  const year = start.getFullYear();
  
  if (startMonth === endMonth && start.getFullYear() === end.getFullYear()) {
    return `${startMonth} ${startDay} - ${endDay}, ${year}`;
  }
  
  if (start.getFullYear() === end.getFullYear()) {
    return `${startMonth} ${startDay} - ${endMonth} ${endDay}, ${year}`;
  }
  
  return `${startMonth} ${startDay}, ${start.getFullYear()} - ${endMonth} ${endDay}, ${end.getFullYear()}`;
}

/**
 * Parse a date string (YYYY-MM-DD) to a Date object
 * @param dateString Date string in YYYY-MM-DD format
 * @returns Date object
 */
export function parseDateString(dateString: string): Date {
  const date = new Date(dateString + "T00:00:00");
  if (isNaN(date.getTime())) {
    throw new Error(`Invalid date string: ${dateString}`);
  }
  return date;
}

/**
 * Format a date to YYYY-MM-DD string
 * @param date Date to format
 * @returns Date string in YYYY-MM-DD format
 */
export function formatDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Get month name from date
 * @param date Date within the month
 * @returns Full month name (e.g., "January")
 */
export function getMonthName(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "long" });
}

/**
 * Get month key in YYYY-MM format
 * @param date Date within the month
 * @returns Month key string
 */
export function getMonthKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}
