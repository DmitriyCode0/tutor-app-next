"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lesson } from "@/lib/types/lesson";

type EditLessonDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lesson: Lesson | null;
  onSave: (
    id: number,
    updates: Partial<Omit<Lesson, "id" | "createdAt">>,
  ) => Promise<void>;
};

export function EditLessonDialog({
  open,
  onOpenChange,
  lesson,
  onSave,
}: EditLessonDialogProps) {
  const [date, setDate] = React.useState<string>("");
  const [hourlyRate, setHourlyRate] = React.useState<string>("");
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (lesson) {
      setDate(lesson.date);
      setHourlyRate(String(lesson.hourlyRate));
    } else {
      setDate("");
      setHourlyRate("");
    }
  }, [lesson]);

  const handleSave = async () => {
    if (!lesson) return;
    // Basic validation
    if (!date) {
      alert("Please enter a valid date.");
      return;
    }
    const rate = Number(hourlyRate);
    if (Number.isNaN(rate) || rate <= 0) {
      alert("Please enter a valid hourly rate.");
      return;
    }

    try {
      setSaving(true);
      await onSave(lesson.id, { date, hourlyRate: rate });
      onOpenChange(false);
    } catch (err) {
      console.error("Failed to update lesson:", err);
      alert("Failed to update lesson. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Lesson</DialogTitle>
        </DialogHeader>

        <div className="grid gap-2">
          <div>
            <Label>Date</Label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <div>
            <Label>Hourly Rate</Label>
            <Input
              type="number"
              value={hourlyRate}
              onChange={(e) => setHourlyRate(e.target.value)}
              min={0}
              step="0.01"
            />
          </div>
        </div>

        <DialogFooter>
          <div className="flex gap-2">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
