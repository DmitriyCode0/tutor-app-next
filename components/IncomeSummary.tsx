"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
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

  // Set a monthly income goal (can be made configurable later)
  const monthlyGoal = 2000; // ₴2000 per month
  const monthlyProgress = Math.min(
    (currentMonthIncome / monthlyGoal) * 100,
    100,
  );

  const formatCurrency = (amount: number): string => {
    return `₴${amount.toFixed(2)}`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="transition-shadow hover:shadow-md">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold">This Week</CardTitle>
            <Badge variant="secondary" className="text-xs font-medium">
              {weekBreakdown.lessonCount} lesson
              {weekBreakdown.lessonCount !== 1 ? "s" : ""}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-0 space-y-3">
          <div className="text-3xl font-bold text-primary">
            {formatCurrency(currentWeekIncome)}
          </div>
          <Separator />
          <div className="text-sm text-muted-foreground">
            {formatDateRange(weekBreakdown.weekStart, weekBreakdown.weekEnd)}
          </div>
        </CardContent>
      </Card>

      <Card className="transition-shadow hover:shadow-md">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold">
              This Month
            </CardTitle>
            <Badge variant="outline" className="text-xs font-medium">
              {currentMonthData?.lessonCount || 0} lesson
              {(currentMonthData?.lessonCount || 0) !== 1 ? "s" : ""}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-0 space-y-3">
          <div className="text-3xl font-bold text-primary">
            {formatCurrency(currentMonthIncome)}
          </div>
          <div className="text-sm text-muted-foreground">
            Goal: {formatCurrency(monthlyGoal)}
          </div>
          <Progress value={monthlyProgress} className="h-3" />
          <div className="text-sm text-muted-foreground">
            {monthlyProgress.toFixed(0)}% of monthly goal •{" "}
            {currentMonthData?.monthName ||
              new Date().toLocaleDateString("en-US", { month: "long" })}
          </div>
        </CardContent>
      </Card>

      <Card className="transition-shadow hover:shadow-md">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold">
              Total Income
            </CardTitle>
            <Badge variant="default" className="text-xs font-medium">
              {lessons.length} total
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-0 space-y-3">
          <div className="text-3xl font-bold text-primary">
            {formatCurrency(totalIncome)}
          </div>
          <Separator />
          <div className="text-sm text-muted-foreground">All time earnings</div>
        </CardContent>
      </Card>
    </div>
  );
}
