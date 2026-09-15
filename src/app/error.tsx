"use client";

import { AlertTriangle, RotateCcw } from "lucide-react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

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
    <div className="app-background grid min-h-screen place-items-center px-4">
      <Card className="surface-card w-full max-w-lg p-8 text-center">
        <AlertTriangle className="mx-auto size-10 text-attention" />
        <h1 className="font-display mt-5 text-3xl font-semibold">
          Something interrupted the calculation
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted">
          No birth data was silently changed. Retry the current step, or return
          later if a provider is temporarily unavailable.
        </p>
        {error.digest && (
          <p className="mt-3 font-mono text-xs text-muted">
            Reference: {error.digest}
          </p>
        )}
        <Button className="mt-6" onClick={reset}>
          <RotateCcw className="size-4" />
          Retry
        </Button>
      </Card>
    </div>
  );
}