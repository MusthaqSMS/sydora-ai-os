"use client";

import { Button } from "@/components/ui/button";

export default function DashboardError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="rounded-md border border-destructive/30 bg-destructive/5 p-6">
      <h1 className="text-xl font-semibold">Dashboard could not load</h1>
      <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
      <Button className="mt-4" onClick={reset} type="button">Retry</Button>
    </div>
  );
}
