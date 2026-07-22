"use server";

import { createClient } from "@/lib/supabase/server";
import type { ActivityTimelineItem } from "@/types/dashboard";
import type { Json } from "@/types/database";
import { unwrap } from "./service-error";

type ActivityRow = {
  id: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  created_at: string;
  metadata: Json;
};

function metadata(value: Json): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

export async function getRecentActivity(organizationId: string): Promise<ActivityTimelineItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("activity_logs")
    .select("id,action,entity_type,entity_id,created_at,metadata")
    .eq("organization_id", organizationId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(20);
  return (unwrap(data, error) as unknown as ActivityRow[]).map((row) => ({
    id: row.id,
    action: row.action,
    entityType: row.entity_type,
    entityId: row.entity_id,
    createdAt: row.created_at,
    metadata: metadata(row.metadata),
  }));
}
