"use server";

import { createClient as createSupabaseClient } from "@/lib/supabase/server";
import { clientSchema, type ClientInput } from "@/schemas/client";
import type { ActivityTimelineItem } from "@/types/dashboard";
import type { Client, ClientContact, EntityId, Json, Project, Task, MarketingCampaign, SeoProject } from "@/types/database";
import { unwrap } from "./service-error";
import { callRpc } from "./rpc";

export interface ListClientsOptions {
  lifecycleStatus?: "active" | "inactive" | "archived";
  query?: string;
}

export async function listClients(organizationId: string, options?: ListClientsOptions): Promise<Client[]> {
  const supabase = await createSupabaseClient();
  let query = supabase.from("clients").select("*").eq("organization_id", organizationId).is("deleted_at", null).order("created_at", { ascending: false });
  if (options?.lifecycleStatus) query = query.eq("lifecycle_status", options.lifecycleStatus);
  if (options?.query) query = query.ilike("name", `%${options.query}%`);
  const { data, error } = await query;
  return unwrap(data, error);
}

export async function getClient(clientId: EntityId): Promise<Client> {
  const supabase = await createSupabaseClient();
  const { data, error } = await supabase.from("clients").select("*").eq("id", clientId).is("deleted_at", null).single();
  return unwrap(data, error);
}

export async function createClient(input: ClientInput): Promise<Client> {
  const value = clientSchema.omit({ lifecycleStatus: true }).parse(input);
  const supabase = await createSupabaseClient();
  const { data, error } = await callRpc(supabase, "create_client", {
    p_organization_id: value.organizationId,
    p_name: value.name,
    p_website: value.website ?? null,
    p_industry: value.industry ?? null,
  });
  return unwrap(data, error);
}

export async function updateClient(clientId: EntityId, input: Partial<Omit<ClientInput, "organizationId">>): Promise<Client> {
  const value = clientSchema.omit({ organizationId: true }).partial().parse(input);
  const supabase = await createSupabaseClient();
  const { data, error } = await callRpc(supabase, "update_client", {
    p_client_id: clientId,
    p_name: value.name ?? null,
    p_website: value.website ?? null,
    p_industry: value.industry ?? null,
    p_lifecycle_status: value.lifecycleStatus ?? null,
  });
  return unwrap(data, error);
}

export async function archiveClient(clientId: EntityId): Promise<Client> {
  return updateClient(clientId, { lifecycleStatus: "archived" });
}

export async function restoreClient(clientId: EntityId): Promise<Client> {
  return updateClient(clientId, { lifecycleStatus: "active" });
}

export async function deleteClient(clientId: EntityId): Promise<void> {
  const supabase = await createSupabaseClient();
  const { error } = await callRpc(supabase, "delete_client", { p_client_id: clientId });
  if (error) throw new Error(error.message);
}

type InvoiceRow = {
  id: string;
  client_id: string;
  invoice_number: string;
  status: string;
  total_amount: number | string;
  due_date: string | null;
  created_at: string;
};

type DocumentRow = {
  id: string;
  client_id: string | null;
  project_id: string | null;
  name: string;
  storage_path: string;
  mime_type: string | null;
  size_bytes: number | null;
  created_at: string;
};

type CalendarEventRow = {
  id: string;
  client_id: string | null;
  title: string;
  starts_at: string;
  ends_at: string;
  attendees: string[];
  created_at: string;
};

type ActivityLogRow = {
  id: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  metadata: Json;
  created_at: string;
};

function normalizeMetadata(value: Json): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

export async function listClientContacts(organizationId: string, clientId: EntityId): Promise<ClientContact[]> {
  const supabase = await createSupabaseClient();
  const { data, error } = await supabase
    .from("client_contacts")
    .select("*")
    .eq("organization_id", organizationId)
    .eq("client_id", clientId)
    .is("deleted_at", null)
    .order("is_primary", { ascending: false })
    .order("full_name", { ascending: true });
  return unwrap(data as ClientContact[] | null, error);
}

export async function createClientContact(
  organizationId: string,
  clientId: EntityId,
  input: {
    fullName: string;
    email: string | null;
    phone: string | null;
    jobTitle: string | null;
    contactType: "primary" | "billing" | "marketing" | "technical" | "decision_maker" | "other";
    isPrimary: boolean;
  }
): Promise<ClientContact> {
  const value = {
    full_name: input.fullName,
    email: input.email,
    phone: input.phone,
    job_title: input.jobTitle,
    contact_type: input.contactType,
    is_primary: input.isPrimary,
  };
  const supabase = await createSupabaseClient();
  const { data, error } = await supabase
    .from("client_contacts")
    .insert([{ organization_id: organizationId, client_id: clientId, ...value }])
    .select()
    .single();
  return unwrap(data as ClientContact | null, error);
}

export async function updateClientContact(
  organizationId: string,
  contactId: EntityId,
  input: {
    fullName: string;
    email: string | null;
    phone: string | null;
    jobTitle: string | null;
    contactType: "primary" | "billing" | "marketing" | "technical" | "decision_maker" | "other";
    isPrimary: boolean;
  }
): Promise<ClientContact> {
  const updatePayload = {
    full_name: input.fullName,
    email: input.email,
    phone: input.phone,
    job_title: input.jobTitle,
    contact_type: input.contactType,
    is_primary: input.isPrimary,
  };
  const supabase = await createSupabaseClient();
  const { data, error } = await supabase
    .from("client_contacts")
    .update(updatePayload)
    .eq("organization_id", organizationId)
    .eq("id", contactId)
    .is("deleted_at", null)
    .select()
    .single();
  return unwrap(data as ClientContact | null, error);
}

export async function deleteClientContact(organizationId: string, contactId: EntityId): Promise<void> {
  const supabase = await createSupabaseClient();
  const { error } = await supabase
    .from("client_contacts")
    .update({ deleted_at: new Date().toISOString() })
    .eq("organization_id", organizationId)
    .eq("id", contactId)
    .is("deleted_at", null);
  if (error) throw new Error(error.message);
}

export async function restoreClientContact(organizationId: string, contactId: EntityId): Promise<ClientContact> {
  const supabase = await createSupabaseClient();
  const { data, error } = await supabase
    .from("client_contacts")
    .update({ deleted_at: null })
    .eq("organization_id", organizationId)
    .eq("id", contactId)
    .select()
    .single();
  return unwrap(data as ClientContact | null, error);
}

export async function listClientProjects(organizationId: string, clientId: EntityId): Promise<Project[]> {
  const supabase = await createSupabaseClient();
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("organization_id", organizationId)
    .eq("client_id", clientId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });
  return unwrap(data as Project[] | null, error);
}

export async function listClientMarketingCampaigns(organizationId: string, clientId: EntityId): Promise<MarketingCampaign[]> {
  const supabase = await createSupabaseClient();
  const { data, error } = await supabase
    .from("marketing_campaigns")
    .select("*")
    .eq("organization_id", organizationId)
    .eq("client_id", clientId)
    .is("deleted_at", null)
    .order("starts_at", { ascending: false });
  return unwrap(data as MarketingCampaign[] | null, error);
}

export async function listClientSeoProjects(organizationId: string, clientId: EntityId): Promise<SeoProject[]> {
  const supabase = await createSupabaseClient();
  const { data, error } = await supabase
    .from("seo_projects")
    .select("*")
    .eq("organization_id", organizationId)
    .eq("client_id", clientId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });
  return unwrap(data as SeoProject[] | null, error);
}

export async function listClientInvoices(organizationId: string, clientId: EntityId): Promise<InvoiceRow[]> {
  const supabase = await createSupabaseClient();
  const { data, error } = await supabase
    .from("invoices")
    .select("*")
    .eq("organization_id", organizationId)
    .eq("client_id", clientId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });
  return unwrap(data as InvoiceRow[] | null, error);
}

export async function listClientDocuments(organizationId: string, clientId: EntityId): Promise<DocumentRow[]> {
  const supabase = await createSupabaseClient();
  const { data, error } = await supabase
    .from("documents")
    .select("*")
    .eq("organization_id", organizationId)
    .eq("client_id", clientId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });
  return unwrap(data as DocumentRow[] | null, error);
}

export async function listClientCalendarEvents(organizationId: string, clientId: EntityId): Promise<CalendarEventRow[]> {
  const supabase = await createSupabaseClient();
  const { data, error } = await supabase
    .from("calendar_events")
    .select("*")
    .eq("organization_id", organizationId)
    .eq("client_id", clientId)
    .is("deleted_at", null)
    .order("starts_at", { ascending: false });
  return unwrap(data as CalendarEventRow[] | null, error);
}

export async function listClientTasks(organizationId: string, projectIds: EntityId[]): Promise<Task[]> {
  if (projectIds.length === 0) return [];
  const supabase = await createSupabaseClient();
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("organization_id", organizationId)
    .in("project_id", projectIds)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });
  return unwrap(data as Task[] | null, error);
}

export async function getClientActivity(organizationId: string, clientId: EntityId): Promise<ActivityTimelineItem[]> {
  const supabase = await createSupabaseClient();
  const { data, error } = await supabase
    .from("activity_logs")
    .select("id,action,entity_type,entity_id,metadata,created_at")
    .eq("organization_id", organizationId)
    .eq("entity_id", clientId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(50);
  return (unwrap(data, error) as unknown as ActivityLogRow[]).map((row) => ({
    id: row.id,
    action: row.action,
    entityType: row.entity_type,
    entityId: row.entity_id,
    metadata: normalizeMetadata(row.metadata),
    createdAt: row.created_at,
  }));
}

export async function addClientNote(organizationId: string, clientId: EntityId, note: string): Promise<string> {
  const value = note.trim();
  if (!value) throw new Error("Note body is required.");

  const supabase = await createSupabaseClient();
  const { data, error } = await callRpc(supabase, "log_activity", {
    p_organization_id: organizationId,
    p_action: "added note",
    p_entity_type: "client_note",
    p_entity_id: clientId,
    p_metadata: { note: value },
  });
  return unwrap(data, error);
}
