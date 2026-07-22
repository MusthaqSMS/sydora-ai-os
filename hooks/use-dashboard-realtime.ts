"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function useDashboardRealtime(organizationId: string) {
  const [lastEventAt, setLastEventAt] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`executive-dashboard:${organizationId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "notifications", filter: `organization_id=eq.${organizationId}` }, () => {
        setLastEventAt(new Date().toISOString());
        router.refresh();
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "activity_logs", filter: `organization_id=eq.${organizationId}` }, () => {
        setLastEventAt(new Date().toISOString());
        router.refresh();
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "tasks", filter: `organization_id=eq.${organizationId}` }, () => {
        setLastEventAt(new Date().toISOString());
        router.refresh();
      })
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [organizationId, router]);

  return { lastEventAt };
}
