import { Lesson, MonthlyIncome, WeeklyIncome } from "@/lib/types/lesson";
import {
  getWeekRange,
  getMonthRange,
  isDateInRange,
  parseDateString,
  getMonthName,
  getMonthKey,
} from "./dateUtils";

/**
 * Calculate income for a single lesson
 * @param lesson Lesson object
 * @returns Income amount (hourlyRate × duration)
 */
export function calculateLessonIncome(lesson: Lesson): number {
  return lesson.hourlyRate * lesson.duration;
}

/**
 * Calculate total income for lessons within a date range
 * @param lessons Array of lessons
 * @param start Start date of range
 * @param end End date of range
 * @returns Total income amount
 */
export function calculatePeriodIncome(
  lessons: Lesson[],
  start: Date,
  end: Date
): number {
  return lessons
    .filter((lesson) => {
      const lessonDate = parseDateString(lesson.date);
      return isDateInRange(lessonDate, start, end);
    })
    .reduce((total, lesson) => total + calculateLessonIncome(lesson), 0);
}

/**
 * Calculate income for a specific month
 * @param lessons Array of lessons
 * @param month Date within the target month
 * @returns Total income for the month
 */
export function calculateMonthlyIncome(lessons: Lesson[], month: Date): number {
  const { start, end } = getMonthRange(month);
  return calculatePeriodIncome(lessons, start, end);
}

/**
 * Calculate income for a specific week
 * @param lessons Array of lessons
 * @param weekStart Date within the target week
 * @returns Total income for the week
 */
export function calculateWeeklyIncome(lessons: Lesson[], weekStart: Date): number {
  const { start, end } = getWeekRange(weekStart);
  return calculatePeriodIncome(lessons, start, end);
}

/**
 * Group lessons by month
 * @param lessons Array of lessons
 * @returns Map with month keys (YYYY-MM) and arrays of lessons
 */
export function groupLessonsByMonth(
  lessons: Lesson[]
): Map<string, Lesson[]> {
  const grouped = new Map<string, Lesson[]>();

  lessons.forEach((lesson) => {
    const lessonDate = parseDateString(lesson.date);
    const monthKey = getMonthKey(lessonDate);

    if (!grouped.has(monthKey)) {
      grouped.set(monthKey, []);
    }
    grouped.get(monthKey)!.push(lesson);
  });

  return grouped;
}

/**
 * Get monthly income breakdowns for all months with lessons
 * @param lessons Array of lessons
 * @returns Array of monthly income objects sorted by month
 */
export function getMonthlyIncomeBreakdown(lessons: Lesson[]): MonthlyIncome[] {
  const grouped = groupLessonsByMonth(lessons);
  const monthlyIncomes: MonthlyIncome[] = [];

  grouped.forEach((monthLessons, monthKey) => {
    const [year, month] = monthKey.split("-").map(Number);
    const monthDate = new Date(year, month - 1, 1);
    const income = monthLessons.reduce(
      (sum, lesson) => sum + calculateLessonIncome(lesson),
      0
    );

    monthlyIncomes.push({
      month: monthKey,
      year,
      monthName: getMonthName(monthDate),
      income,
      lessonCount: monthLessons.length,
      lessons: monthLessons.sort(
        (a, b) => parseDateString(a.date).getTime() - parseDateString(b.date).getTime()
      ),
    });
  });

  // Sort by month (most recent first)
  return monthlyIncomes.sort(
    (a, b) => b.month.localeCompare(a.month)
  );
}

/**
 * Get weekly income breakdown for a specific week
 * @param lessons Array of lessons
 * @param weekStart Date within the target week
 * @returns Weekly income object
 */
export function getWeeklyIncomeBreakdown(
  lessons: Lesson[],
  weekStart: Date
): WeeklyIncome {
  const { start, end } = getWeekRange(weekStart);
  const weekLessons = lessons.filter((lesson) => {
    const lessonDate = parseDateString(lesson.date);
    return isDateInRange(lessonDate, start, end);
  });

  const income = weekLessons.reduce(
    (sum, lesson) => sum + calculateLessonIncome(lesson),
    0
  );

  return {
    weekStart: start,
    weekEnd: end,
    income,
    lessonCount: weekLessons.length,
    lessons: weekLessons.sort(
      (a, b) => parseDateString(a.date).getTime() - parseDateString(b.date).getTime()
    ),
  };
}

/**
 * Calculate total income across all lessons
 * @param lessons Array of lessons
 * @returns Total income amount
 */
export function calculateTotalIncome(lessons: Lesson[]): number {
  return lessons.reduce(
    (total, lesson) => total + calculateLessonIncome(lesson),
    0
  );
}

/**
 * Get current month income
 * @param lessons Array of lessons
 * @returns Total income for current month
 */
export function getCurrentMonthIncome(lessons: Lesson[]): number {
  return calculateMonthlyIncome(lessons, new Date());
}

/**
 * Get current week income
 * @param lessons Array of lessons
 * @returns Total income for current week
 */
export function getCurrentWeekIncome(lessons: Lesson[]): number {
  return calculateWeeklyIncome(lessons, new Date());
}

/**
 * Get current week income breakdown
 * @param lessons Array of lessons
 * @returns Weekly income breakdown for current week
 */
export function getCurrentWeekIncomeBreakdown(lessons: Lesson[]): WeeklyIncome {
  return getWeeklyIncomeBreakdown(lessons, new Date());
}

/**
 * Get current month income breakdown
 * @param lessons Array of lessons
 * @returns Monthly income breakdown for current month
 */
export function getCurrentMonthIncomeBreakdown(lessons: Lesson[]): MonthlyIncome | null {
  const breakdowns = getMonthlyIncomeBreakdown(lessons);
  const currentMonthKey = new Date().toISOString().slice(0, 7); // YYYY-MM format
  return breakdowns.find((m) => m.month === currentMonthKey) || null;
}
