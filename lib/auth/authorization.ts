import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseConfig } from "@/lib/supabase/config";
import { callRpc } from "@/services/rpc";
import type { PermissionKey } from "@/lib/constants/rbac";

export async function hasPermission(organizationId: string, permission: PermissionKey) {
  if (!hasSupabaseConfig()) return false;
  const supabase = await createClient();
  const { data } = await callRpc(supabase, "has_permission", { p_organization_id: organizationId, p_permission_key: permission });
  return Boolean(data);
}

export async function requirePermission(organizationId: string, permission: PermissionKey) {
  const allowed = await hasPermission(organizationId, permission);
  if (!allowed) redirect("/unauthorized");
}
