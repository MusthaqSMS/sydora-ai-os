"use server";

import { createClient } from "@/lib/supabase/server";
import { leadSchema, type LeadInput } from "@/schemas/lead";
import type { EntityId, Lead } from "@/types/database";
import { unwrap } from "./service-error";
import { callRpc } from "./rpc";

export async function createLead(input: LeadInput): Promise<Lead> {
  const value = leadSchema.parse(input);
  const supabase = await createClient();
  const { data, error } = await callRpc(supabase, "create_lead", { p_organization_id: value.organizationId, p_name: value.name, p_email: value.email ?? null, p_company: value.company ?? null, p_source_id: value.sourceId ?? null, p_status_id: value.statusId ?? null, p_estimated_value: value.estimatedValue ?? null });
  return unwrap(data, error);
}

export async function updateLead(leadId: EntityId, input: Partial<Omit<LeadInput, "organizationId">>): Promise<Lead> {
  const value = leadSchema.omit({ organizationId: true }).partial().parse(input);
  const supabase = await createClient();
  const { data, error } = await callRpc(supabase, "update_lead", { p_lead_id: leadId, p_name: value.name ?? null, p_email: value.email ?? null, p_company: value.company ?? null, p_source_id: value.sourceId ?? null, p_status_id: value.statusId ?? null, p_estimated_value: value.estimatedValue ?? null });
  return unwrap(data, error);
}
