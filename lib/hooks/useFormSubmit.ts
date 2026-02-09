"use client";

import { useState, FormEvent } from "react";

/**
 * Custom hook for form submission handling with loading and error states
 */
export function useFormSubmit<T>(
  submitFn: (data: T) => Promise<void>,
  onSuccess?: () => void,
) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: T) => {
    setError(null);
    setIsSubmitting(true);

    try {
      await submitFn(data);
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);
      throw err; // Re-throw to allow caller to handle if needed
    } finally {
      setIsSubmitting(false);
    }
  };

  const clearError = () => setError(null);

  return {
    isSubmitting,
    error,
    handleSubmit,
    clearError,
  };
}
