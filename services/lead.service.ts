"use server";

import type { PostgrestResponse } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { leadSchema, type LeadInput } from "@/schemas/lead";
import type { EntityId, Lead, LeadNote, LeadActivity, Document, Json } from "@/types/database";
import { unwrap } from "./service-error";
import { callRpc } from "./rpc";

export interface ListLeadsOptions {
  query?: string;
  statusId?: string;
  sourceId?: string;
}

export async function listLeads(organizationId: string, options?: ListLeadsOptions): Promise<Lead[]> {
  const supabase = await createClient();
  let query = supabase.from("leads").select("*").eq("organization_id", organizationId).is("deleted_at", null).order("created_at", { ascending: false });
  if (options?.statusId) query = query.eq("status_id", options.statusId);
  if (options?.sourceId) query = query.eq("source_id", options.sourceId);
  if (options?.query) query = query.or(`name.ilike.%${options.query}%,company.ilike.%${options.query}%`);
  const { data, error } = await query;
  return unwrap(data, error);
}

export async function listLeadsForClient(organizationId: string, clientId: EntityId): Promise<Lead[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .eq("organization_id", organizationId)
    .eq("client_id", clientId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });
  return unwrap(data, error);
}

export async function getLead(leadId: EntityId): Promise<Lead> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("leads").select("*").eq("id", leadId).is("deleted_at", null).single();
  return unwrap(data, error);
}

type LeadSource = { id: string; name: string };

type LeadStatus = { id: string; name: string };

export async function listLeadSources(organizationId: string): Promise<LeadSource[]> {
  const supabase = await createClient();
  const response = await supabase.from("lead_sources").select("id,name").eq("organization_id", organizationId).is("deleted_at", null).order("name") as PostgrestResponse<LeadSource>;
  const result = unwrap(response.data, response.error);
  return result.filter((item): item is LeadSource => item && typeof item.name === "string");
}

export async function listLeadStatuses(organizationId: string): Promise<LeadStatus[]> {
  const supabase = await createClient();
  const response = await supabase.from("lead_statuses").select("id,name").eq("organization_id", organizationId).is("deleted_at", null).order("position") as PostgrestResponse<LeadStatus>;
  const result = unwrap(response.data, response.error);
  return result.filter((item): item is LeadStatus => item && typeof item.name === "string");
}

export async function createLead(input: LeadInput): Promise<Lead> {
  const value = leadSchema.parse(input);
  const supabase = await createClient();
  const { data, error } = await callRpc(supabase, "create_lead", {
    p_organization_id: value.organizationId,
    p_name: value.name,
    p_email: value.email ?? null,
    p_company: value.company ?? null,
    p_source_id: value.sourceId ?? null,
    p_status_id: value.statusId ?? null,
    p_estimated_value: value.estimatedValue ?? null,
  });
  return unwrap(data, error);
}

export async function updateLead(leadId: EntityId, input: Partial<Omit<LeadInput, "organizationId">>): Promise<Lead> {
  const value = leadSchema.omit({ organizationId: true }).partial().parse(input);
  const supabase = await createClient();
  const { data, error } = await callRpc(supabase, "update_lead", {
    p_lead_id: leadId,
    p_name: value.name ?? null,
    p_email: value.email ?? null,
    p_company: value.company ?? null,
    p_source_id: value.sourceId ?? null,
    p_status_id: value.statusId ?? null,
    p_estimated_value: value.estimatedValue ?? null,
  });
  return unwrap(data, error);
}

export async function archiveLead(leadId: EntityId): Promise<Lead> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("leads")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", leadId)
    .select()
    .single();
  return unwrap(data as Lead | null, error);
}

export async function restoreLead(leadId: EntityId): Promise<Lead> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("leads")
    .update({ deleted_at: null })
    .eq("id", leadId)
    .select()
    .single();
  return unwrap(data as Lead | null, error);
}

export async function mergeLeads(primaryLeadId: EntityId, sourceLeadId: EntityId): Promise<Lead> {
  if (primaryLeadId === sourceLeadId) throw new Error("Cannot merge a lead into itself.");
  const supabase = await createClient();

  const updateNotes = await supabase
    .from("lead_notes")
    .update({ lead_id: primaryLeadId })
    .eq("lead_id", sourceLeadId)
    .is("deleted_at", null);
  if (updateNotes.error) throw updateNotes.error;

  const updateActivities = await supabase
    .from("lead_activities")
    .update({ lead_id: primaryLeadId })
    .eq("lead_id", sourceLeadId)
    .is("deleted_at", null);
  if (updateActivities.error) throw updateActivities.error;

  const { data, error } = await supabase
    .from("leads")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", sourceLeadId)
    .select()
    .single();
  unwrap(data as Lead | null, error);

  return getLead(primaryLeadId);
}

export async function listLeadDuplicates(organizationId: string, leadId: EntityId): Promise<Lead[]> {
  const lead = await getLead(leadId);
  const supabase = await createClient();
  const query = supabase.from("leads").select("*").eq("organization_id", organizationId).is("deleted_at", null).neq("id", leadId);

  const sameEmail = lead.email ? query.ilike("email", lead.email) : query;
  const { data, error } = await sameEmail;
  const duplicates = unwrap(data as Lead[] | null, error);
  const nameMatches = await supabase
    .from("leads")
    .select("*")
    .eq("organization_id", organizationId)
    .is("deleted_at", null)
    .neq("id", leadId)
    .ilike("name", `%${lead.name}%`);
  const nameResults = unwrap(nameMatches.data as Lead[] | null, nameMatches.error);

  const mergeMap = new Map<string, Lead>();
  duplicates.concat(nameResults).forEach((item) => mergeMap.set(item.id, item));
  return Array.from(mergeMap.values());
}

export async function listLeadDocuments(organizationId: string, leadId: EntityId): Promise<Document[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("documents")
    .select("*")
    .eq("organization_id", organizationId)
    .eq("lead_id", leadId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });
  return unwrap(data as Document[] | null, error);
}

export async function attachDocumentToLead(organizationId: string, leadId: EntityId, documentId: EntityId): Promise<Document> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("documents")
    .update({ lead_id: leadId })
    .eq("organization_id", organizationId)
    .eq("id", documentId)
    .select()
    .single();
  return unwrap(data as Document | null, error);
}

export async function listOrganizationDocuments(organizationId: string): Promise<Document[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("documents")
    .select("*")
    .eq("organization_id", organizationId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });
  return unwrap(data as Document[] | null, error);
}

export async function listLeadNotes(organizationId: string, leadId: EntityId): Promise<LeadNote[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("lead_notes")
    .select("*")
    .eq("organization_id", organizationId)
    .eq("lead_id", leadId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });
  return unwrap(data as LeadNote[] | null, error);
}

export async function createLeadNote(organizationId: string, leadId: EntityId, note: string): Promise<LeadNote> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("lead_notes")
    .insert([{ organization_id: organizationId, lead_id: leadId, body: note }])
    .select()
    .single();
  return unwrap(data as LeadNote | null, error);
}

export async function listLeadActivities(organizationId: string, leadId: EntityId): Promise<LeadActivity[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("lead_activities")
    .select("*")
    .eq("organization_id", organizationId)
    .eq("lead_id", leadId)
    .is("deleted_at", null)
    .order("occurred_at", { ascending: false });
  return unwrap(data as LeadActivity[] | null, error);
}

export async function createLeadActivity(
  organizationId: string,
  leadId: EntityId,
  input: {
    activityType: string;
    occurredAt: string;
    metadata: Json;
  }
): Promise<LeadActivity> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("lead_activities")
    .insert([{ organization_id: organizationId, lead_id: leadId, activity_type: input.activityType, occurred_at: input.occurredAt, metadata: input.metadata }])
    .select()
    .single();
  return unwrap(data as LeadActivity | null, error);
}
