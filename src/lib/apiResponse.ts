import { NextResponse } from "next/server";
import { ZodError } from "zod";

export function apiError(message: string, status = 400, details?: unknown) {
  return NextResponse.json({ success: false, error: message, details }, { status });
}

export function apiSuccess<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

/**
 * Wraps a route handler so unexpected errors never leak stack traces to the
 * client and always return a consistent JSON shape instead of crashing silently.
 */
export function withErrorHandling(
  handler: (req: Request, ctx: any) => Promise<NextResponse>
) {
  return async (req: Request, ctx: any) => {
    try {
      return await handler(req, ctx);
    } catch (err) {
      if (err instanceof ZodError) {
        return apiError("Validation failed", 422, err.flatten());
      }
      console.error("API error:", err);
      const message =
        err instanceof Error ? err.message : "Something went wrong. Please try again.";
      return apiError(message, 500);
    }
  };
}
