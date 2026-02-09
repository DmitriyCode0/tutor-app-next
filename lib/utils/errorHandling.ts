/**
 * Error handling utilities
 */

/**
 * Extracts a user-friendly error message from various error types
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === "string") {
    return error;
  }
  return "An unexpected error occurred";
}

/**
 * Logs error to console and returns user-friendly message
 */
export function handleError(error: unknown, context: string): string {
  const message = getErrorMessage(error);
  console.error(`${context}:`, error);
  return message;
}

/**
 * Creates a standardized error message for failed operations
 */
export function createErrorMessage(
  operation: string,
  entityType: string,
): string {
  return `Failed to ${operation} ${entityType}. Please try again.`;
}
