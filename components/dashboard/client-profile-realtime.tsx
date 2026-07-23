"use client";

import { useDashboardRealtime } from "@/hooks/use-dashboard-realtime";

export function ClientProfileRealtime({ organizationId }: { organizationId: string }) {
  const { lastEventAt } = useDashboardRealtime(organizationId);
  return (
    <div className="rounded-full border border-muted px-3 py-1 text-xs text-muted-foreground">
      Live updates{lastEventAt ? ` · refreshed ${new Date(lastEventAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}` : ""}
    </div>
  );
}
