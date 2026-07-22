"use server";

import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseConfig } from "@/lib/supabase/config";
import type { Database, Json } from "@/types/database";

type SecurityEventType = Database["public"]["Tables"]["security_events"]["Row"]["event_type"];

export async function logSecurityEvent(input: {
  organizationId?: string | null;
  userId?: string | null;
  email?: string | null;
  eventType: SecurityEventType;
  success?: boolean;
  metadata?: Json;
}) {
  if (!hasSupabaseConfig()) return;
  const headerStore = await headers();
  const supabase = await createClient();
  await supabase.from("security_events").insert({
    organization_id: input.organizationId ?? null,
    user_id: input.userId ?? null,
    email: input.email?.toLowerCase() ?? null,
    event_type: input.eventType,
    success: input.success ?? false,
    ip_address: null,
    user_agent: headerStore.get("user-agent"),
    metadata: input.metadata ?? {},
  });
}
