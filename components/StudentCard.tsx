"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2 } from "lucide-react";
import { Student } from "@/lib/types/student";
import { useRole } from "@/lib/providers/role-provider";
import { useCurrency } from "@/lib/hooks/useCurrency";
import { formatCurrency as formatCurrencyUtil } from "@/lib/utils/currency";

type StudentCardProps = {
  student: Student;
  lessonCount: number;
  onEdit?: (student: Student) => void;
  onDelete?: (student: Student) => void;
  isDeleting?: boolean;
};

export function StudentCard({
  student,
  lessonCount,
  onEdit,
  onDelete,
  isDeleting = false,
}: StudentCardProps) {
  const { t } = useRole();
  const currency = useCurrency();

  return (
    <Card>
      <CardContent>
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3">
              <h3 className="font-semibold text-lg truncate">{student.name}</h3>
              <Badge variant="secondary">
                {lessonCount} {lessonCount === 1 ? t.lesson : t.lessons}
              </Badge>
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              {formatCurrencyUtil(student.hourlyRate, currency)}/hr
              {student.email && ` • ${student.email}`}
              {student.phone && ` • ${student.phone}`}
            </div>
            {student.notes && (
              <div className="text-sm text-muted-foreground mt-1">
                {student.notes}
              </div>
            )}
          </div>

          <div className="flex gap-2">
            {onEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(student)}
                disabled={isDeleting}
              >
                <Edit2 className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onDelete?.(student)}
              disabled={isDeleting}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
