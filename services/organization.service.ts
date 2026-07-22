"use server";

import { createClient } from "@/lib/supabase/server";
import { organizationSchema, type OrganizationInput } from "@/schemas/organization";
import { unwrap } from "./service-error";
import { callRpc } from "./rpc";

export type Organization = { id: string; name: string; slug: string; created_at: string; updated_at: string; created_by: string; deleted_at: string | null };

export async function createOrganization(input: OrganizationInput): Promise<Organization> {
  const value = organizationSchema.parse(input);
  const supabase = await createClient();
  const { data, error } = await callRpc(supabase, "create_organization", { p_name: value.name, p_slug: value.slug });
  return unwrap(data, error);
}
