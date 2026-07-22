"use server";

import { createClient } from "@/lib/supabase/server";
import type { EntityId } from "@/types/database";

export type DashboardSummary = { clientCount: number; leadCount: number; activeProjectCount: number; openTaskCount: number };

export async function getDashboardSummary(organizationId: EntityId): Promise<DashboardSummary> {
  const supabase = await createClient();
  const [clients, leads, projects, tasks] = await Promise.all([
    supabase.from("clients").select("id", { count: "exact", head: true }).eq("organization_id", organizationId).is("deleted_at", null),
    supabase.from("leads").select("id", { count: "exact", head: true }).eq("organization_id", organizationId).is("deleted_at", null),
    supabase.from("projects").select("id", { count: "exact", head: true }).eq("organization_id", organizationId).eq("status", "active").is("deleted_at", null),
    supabase.from("tasks").select("id", { count: "exact", head: true }).eq("organization_id", organizationId).neq("status", "done").is("deleted_at", null),
  ]);
  const error = clients.error ?? leads.error ?? projects.error ?? tasks.error;
  if (error) throw new Error(error.message);
  return { clientCount: clients.count ?? 0, leadCount: leads.count ?? 0, activeProjectCount: projects.count ?? 0, openTaskCount: tasks.count ?? 0 };
}
