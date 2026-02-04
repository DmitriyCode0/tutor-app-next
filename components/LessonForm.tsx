"use client";

import { useState, FormEvent } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Lesson } from "@/lib/types/lesson";
import { StudentAutocomplete } from "@/components/StudentAutocomplete";
import { Student } from "@/lib/types/student";

interface LessonFormProps {
  onSubmit: (
    lesson: Omit<Lesson, "id" | "createdAt" | "updatedAt">,
  ) => Promise<void>;
  onCancel?: () => void;
  initialData?: Partial<Lesson>;
  submitLabel?: string;
}

export function LessonForm({
  onSubmit,
  onCancel,
  initialData,
  submitLabel = "Add Lesson",
}: LessonFormProps) {
  const [studentName, setStudentName] = useState(
    initialData?.studentName || "",
  );
  const [hourlyRate, setHourlyRate] = useState(
    initialData?.hourlyRate?.toString() || "",
  );
  const [duration, setDuration] = useState(
    initialData?.duration?.toString() || "1",
  );
  const [date, setDate] = useState(
    initialData?.date ||
      (() => {
        const today = new Date();
        return today.toISOString().split("T")[0]; // Format as YYYY-MM-DD
      })(),
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!studentName.trim()) {
      setError("Student name is required");
      return;
    }

    if (!hourlyRate || parseFloat(hourlyRate) <= 0) {
      setError("Hourly rate must be greater than 0");
      return;
    }

    if (!duration || parseFloat(duration) <= 0) {
      setError("Duration must be greater than 0");
      return;
    }

    if (!date) {
      setError("Date is required");
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit({
        studentName: studentName.trim(),
        hourlyRate: parseFloat(hourlyRate),
        duration: parseFloat(duration),
        date,
      });

      // Reset form if this is a new lesson (not editing)
      if (!initialData) {
        setStudentName("");
        setHourlyRate("");
        setDuration("1");
        setDate(() => {
          const today = new Date();
          return today.toISOString().split("T")[0]; // Format as YYYY-MM-DD
        });
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to save lesson";
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{initialData ? "Edit Lesson" : "Add New Lesson"}</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 text-sm text-destructive bg-destructive/10 rounded-lg border border-destructive/20">
              {error}
            </div>
          )}

          <div className="space-y-3">
            <label
              htmlFor="studentName"
              className="text-sm font-semibold text-foreground"
            >
              Student Name
            </label>
            <StudentAutocomplete
              value={studentName}
              onChange={(value) => {
                setStudentName(value);
                // Clear hourly rate if student name is cleared
                if (!value.trim()) {
                  setHourlyRate(initialData?.hourlyRate?.toString() || "");
                }
              }}
              onSelect={(student: Student) => {
                // Auto-fill hourly rate when student is selected
                setHourlyRate(student.hourlyRate.toString());
              }}
              placeholder="Enter student name"
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-3">
              <label
                htmlFor="hourlyRate"
                className="text-sm font-semibold text-foreground"
              >
                Hourly Rate (₴)
              </label>
              <Input
                id="hourlyRate"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(e.target.value)}
                required
                className="h-11"
              />
            </div>

            <div className="space-y-3">
              <label
                htmlFor="duration"
                className="text-sm font-semibold text-foreground"
              >
                Duration (hours)
              </label>
              <Input
                id="duration"
                type="number"
                step="0.25"
                min="0.25"
                placeholder="1.0"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                required
                className="h-11"
              />
            </div>
          </div>

          <div className="space-y-3">
            <label
              htmlFor="date"
              className="text-sm font-semibold text-foreground"
            >
              Date
            </label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="h-11"
            />
          </div>

          <div className="flex gap-4 pt-2">
            <Button type="submit" disabled={isSubmitting} className="h-11 px-6">
              {isSubmitting ? "Saving..." : submitLabel}
            </Button>
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="h-11 px-6"
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
