"use server";

import { createClient } from "@/lib/supabase/server";
import { permissionModules, permissionActions, type PermissionKey } from "@/lib/constants/rbac";
import { roleSchema, type RoleInput } from "@/schemas/rbac";
import type { Permission, PermissionSnapshot, Role } from "@/types/rbac";
import { unwrap } from "./service-error";

function allPermissionKeys(): PermissionKey[] {
  return permissionModules.flatMap((moduleName) => permissionActions.map((action) => `${moduleName}.${action}` as PermissionKey));
}

export async function listPermissions(): Promise<Permission[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("permissions").select("id,key,description").is("deleted_at", null).order("key");
  return unwrap(data, error) as Permission[];
}

export async function listRoles(organizationId: string): Promise<Role[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("roles").select("*").eq("organization_id", organizationId).is("deleted_at", null).order("is_system", { ascending: false }).order("name");
  return unwrap(data, error) as Role[];
}

export async function getPermissionSnapshot(userId: string, organizationId: string): Promise<PermissionSnapshot> {
  const supabase = await createClient();
  const memberResult = await supabase.from("organization_members").select("role_id,member_role,status").eq("organization_id", organizationId).eq("user_id", userId).is("deleted_at", null).maybeSingle();
  const profileResult = await supabase.from("profiles").select("is_super_admin").eq("id", userId).maybeSingle();
  const isSuperAdmin = Boolean(profileResult.data?.is_super_admin);
  const roleId = String(memberResult.data?.role_id ?? "");
  const roleResult = roleId ? await supabase.from("roles").select("id,name,role_key,is_system").eq("id", roleId).maybeSingle() : { data: null, error: null };
  const permissionResult = roleId
    ? await supabase.from("role_permissions").select("permissions(key)").eq("role_id", roleId).is("deleted_at", null)
    : { data: [], error: null };
  if (memberResult.error) throw memberResult.error;
  if (profileResult.error) throw profileResult.error;
  if (roleResult.error) throw roleResult.error;
  if (permissionResult.error) throw permissionResult.error;
  const rows = (permissionResult.data ?? []) as unknown as Array<{ permissions: { key: PermissionKey } | null }>;
  return {
    organizationId,
    role: roleResult.data as PermissionSnapshot["role"],
    permissions: isSuperAdmin ? allPermissionKeys() : rows.map((row) => row.permissions?.key).filter((key): key is PermissionKey => Boolean(key)),
    isOwner: memberResult.data?.member_role === "owner",
    isSuperAdmin,
  };
}

export async function createCustomRole(organizationId: string, input: RoleInput): Promise<Role> {
  const value = roleSchema.parse(input);
  const supabase = await createClient();
  const { data: role, error } = await supabase.from("roles").insert({
    organization_id: organizationId,
    name: value.name,
    description: value.description ?? null,
    role_key: null,
    is_system: false,
  }).select("*").single();
  if (error) throw error;
  const permissions = await listPermissions();
  const permissionIds = permissions.filter((permission) => value.permissions.includes(permission.key)).map((permission) => permission.id);
  if (permissionIds.length > 0) {
    const insertResult = await supabase.from("role_permissions").insert(permissionIds.map((permissionId) => ({
      organization_id: organizationId,
      role_id: role.id,
      permission_id: permissionId,
    })));
    if (insertResult.error) throw insertResult.error;
  }
  return role as Role;
}
