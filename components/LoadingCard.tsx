"use client";

import { Card, CardContent } from "@/components/ui/card";

interface LoadingCardProps {
  message?: string;
}

export function LoadingCard({ message = "Loading..." }: LoadingCardProps) {
  return (
    <Card>
      <CardContent className="py-8 text-center">
        <p className="text-muted-foreground">{message}</p>
      </CardContent>
    </Card>
  );
}
