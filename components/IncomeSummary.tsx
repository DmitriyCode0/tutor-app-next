"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lesson } from "@/lib/types/lesson";
import {
  getCurrentMonthIncome,
  getCurrentWeekIncome,
  calculateTotalIncome,
  getCurrentWeekIncomeBreakdown,
  getCurrentMonthIncomeBreakdown,
} from "@/lib/utils/incomeUtils";
import { formatDateRange } from "@/lib/utils/dateUtils";

interface IncomeSummaryProps {
  lessons: Lesson[];
}

export function IncomeSummary({ lessons }: IncomeSummaryProps) {
  const totalIncome = calculateTotalIncome(lessons);
  const currentMonthIncome = getCurrentMonthIncome(lessons);
  const currentWeekIncome = getCurrentWeekIncome(lessons);
  
  const weekBreakdown = getCurrentWeekIncomeBreakdown(lessons);
  const currentMonthData = getCurrentMonthIncomeBreakdown(lessons);

  const formatCurrency = (amount: number): string => {
    return `₴${amount.toFixed(2)}`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">This Week</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(currentWeekIncome)}</div>
          <div className="text-sm text-muted-foreground mt-1">
            {weekBreakdown.lessonCount} lesson{weekBreakdown.lessonCount !== 1 ? "s" : ""}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {formatDateRange(weekBreakdown.weekStart, weekBreakdown.weekEnd)}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">This Month</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(currentMonthIncome)}</div>
          <div className="text-sm text-muted-foreground mt-1">
            {currentMonthData?.lessonCount || 0} lesson{(currentMonthData?.lessonCount || 0) !== 1 ? "s" : ""}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {currentMonthData?.monthName || new Date().toLocaleDateString("en-US", { month: "long" })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">Total Income</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(totalIncome)}</div>
          <div className="text-sm text-muted-foreground mt-1">
            {lessons.length} lesson{lessons.length !== 1 ? "s" : ""} total
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            All time
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
