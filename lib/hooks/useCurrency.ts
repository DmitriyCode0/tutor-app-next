"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/providers/auth-provider";

/**
 * Custom hook to manage user's currency preference
 * Reads from user metadata or localStorage
 */
export function useCurrency() {
  const { user } = useAuth();
  const [currency, setCurrency] = useState<string>("UAH");

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

  return currency;
}
