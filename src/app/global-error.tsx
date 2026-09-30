"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html>
      <body className="flex min-h-screen flex-col items-center justify-center bg-cream px-4 text-center">
        <AlertTriangle className="mb-4 h-14 w-14 text-red-400" />
        <h1 className="font-display text-2xl font-bold text-espresso-900">
          Something went wrong
        </h1>
        <p className="mt-2 max-w-sm text-espresso-500">
          We hit an unexpected error. Please try again, or contact us if the problem continues.
        </p>
        <button onClick={reset} className="btn-gold mt-6">
          Try Again
        </button>
      </body>
    </html>
  );
}
