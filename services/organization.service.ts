"use server";

import { createClient } from "@/lib/supabase/server";
import { organizationSchema, type OrganizationInput } from "@/schemas/organization";
import type { Organization as OrganizationRecord } from "@/types/database";
import { unwrap } from "./service-error";
import { callRpc } from "./rpc";

export type Organization = OrganizationRecord;

export async function createOrganization(input: OrganizationInput): Promise<Organization> {
  const value = organizationSchema.parse(input);
  const supabase = await createClient();
  const { data, error } = await callRpc(supabase, "create_organization", { p_name: value.name, p_slug: value.slug });
  return unwrap(data, error);
}

export async function listOrganizationsForUser(userId: string): Promise<Organization[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("organization_members").select("organization_id").eq("user_id", userId).eq("status", "active").is("deleted_at", null);
  if (error) throw error;
  const ids = (data ?? []).map((member) => String(member.organization_id));
  if (ids.length === 0) return [];
  const result = await supabase.from("organizations").select("*").in("id", ids).is("deleted_at", null).order("name");
  return unwrap(result.data, result.error);
}

export async function updateOrganization(organizationId: string, input: OrganizationInput): Promise<Organization> {
  const value = organizationSchema.parse(input);
  const supabase = await createClient();
  const { data, error } = await supabase.from("organizations").update({
    name: value.name,
    slug: value.slug,
    industry: value.industry || null,
    website: value.website || null,
    timezone: value.timezone,
    country: value.country || null,
    currency: value.currency.toUpperCase(),
    business_goals: value.businessGoals,
    logo_path: value.logoPath || null,
    primary_color: value.primaryColor,
  }).eq("id", organizationId).select("*").single();
  return unwrap(data, error);
}

export async function switchOrganization(organizationId: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("profiles").update({ active_organization_id: organizationId }).eq("id", (await supabase.auth.getUser()).data.user?.id ?? "");
  if (error) throw error;
}

export async function softDeleteOrganization(organizationId: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("organizations").update({ deleted_at: new Date().toISOString() }).eq("id", organizationId);
  if (error) throw error;
}
