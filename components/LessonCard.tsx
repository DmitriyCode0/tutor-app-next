"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2 } from "lucide-react";
import { Lesson } from "@/lib/types/lesson";
import { formatDisplayDate } from "@/lib/utils/dateUtils";
import { useAuth } from "@/lib/providers/auth-provider";
import { formatCurrency as formatCurrencyUtil } from "@/lib/utils/currency";
import { EditLessonDialog } from "@/components/EditLessonDialog";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";

type LessonCardProps = {
  lesson: Lesson;
  onEdit?: (lesson: Lesson) => void; // legacy: open parent editor
  onDelete?: (id: number) => void; // legacy: parent handles deletion
  onUpdate?: (
    id: number,
    updates: Partial<Omit<Lesson, "id" | "createdAt" | "updatedAt">>,
  ) => Promise<void>;
  onDeleteConfirmed?: (id: number) => Promise<void>;
  compact?: boolean; // compact layout used in lists
  className?: string;
};

export function LessonCard({
  lesson,
  onEdit,
  onDelete,
  onUpdate,
  onDeleteConfirmed,
  compact = false,
  className = "",
}: LessonCardProps) {
  const { user } = useAuth();
  const [currency, setCurrency] = useState<string>("UAH");
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const meta = (user as any)?.user_metadata || {};
    const saved =
      meta.currency ||
      (() => {
        try {
          return localStorage.getItem("tutor_currency") ?? "UAH";
        } catch {
          return "UAH";
        }
      })();
    setCurrency(saved);
  }, [user]);

  const income = lesson.hourlyRate * lesson.duration;

  return (
    <>
      <Card>
        <CardContent>
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h3 className="font-semibold text-lg">{lesson.studentName}</h3>
                <Badge variant="secondary">
                  {formatDisplayDate(lesson.date)}
                </Badge>
              </div>
            </div>

            <div className="flex flex-col items-end gap-2">
              <div className="text-right">
                <div className="text-xl font-bold">
                  {formatCurrencyUtil(income, currency)}
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (onEdit && !onUpdate) {
                      // legacy parent edit handler (opens parent editor)
                      onEdit(lesson);
                      return;
                    }
                    // open local edit dialog
                    setIsEditing(true);
                  }}
                >
                  <Edit2 className="h-4 w-4" />
                </Button>

                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setIsDeleteOpen(true)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Internal delete confirmation */}
      <AlertDialog
        open={isDeleteOpen}
        onOpenChange={(open) => {
          if (!open) setIsDeleteOpen(false);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Lesson</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the lesson for{" "}
              {lesson.studentName} on {formatDisplayDate(lesson.date)}? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsDeleteOpen(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={async () => {
                setIsDeleting(true);
                try {
                  if (typeof onDeleteConfirmed === "function") {
                    await onDeleteConfirmed(lesson.id);
                  } else if (typeof onDelete === "function") {
                    await Promise.resolve(onDelete(lesson.id));
                  }
                } catch (err) {
                  console.error("Failed to delete lesson:", err);
                  alert("Failed to delete lesson. Please try again.");
                } finally {
                  setIsDeleting(false);
                  setIsDeleteOpen(false);
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Internal edit dialog */}
      <EditLessonDialog
        open={isEditing}
        onOpenChange={(open) => {
          if (!open) setIsEditing(false);
        }}
        lesson={lesson}
        onSave={async (id, updates) => {
          setIsSaving(true);
          try {
            if (typeof onUpdate === "function") {
              await onUpdate(id, updates as any);
            } else if (typeof onEdit === "function") {
              // fallback: call parent onEdit to let it open its own editor
              onEdit(lesson);
            }
          } catch (err) {
            console.error("Failed to update lesson:", err);
            alert("Failed to update lesson. Please try again.");
          } finally {
            setIsSaving(false);
            setIsEditing(false);
          }
        }}
      />
    </>
  );
}
