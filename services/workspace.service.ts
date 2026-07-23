"use server";

import { createClient } from "@/lib/supabase/server";
import type { EnterpriseModuleSlug } from "@/lib/constants/enterprise-modules";
import { unwrap } from "./service-error";

export type WorkspaceRecord = {
  id: string;
  title: string;
  subtitle: string;
  status: string;
  amount: number | null;
  date: string | null;
  href: string;
  metadata: Record<string, string | number | null>;
};

export type WorkspaceSummary = {
  total: number;
  active: number;
  risk: number;
  value: number;
};

type GenericRow = Record<string, unknown> & { id: string; created_at?: string; updated_at?: string; deleted_at?: string | null };

function text(value: unknown, fallback = "") {
  return typeof value === "string" && value.trim() ? value : fallback;
}

function money(value: unknown) {
  if (typeof value === "number") return value;
  if (typeof value === "string" && value.trim()) return Number(value);
  return null;
}

function dateValue(row: GenericRow) {
  return text(row.starts_at) || text(row.due_at) || text(row.due_date) || text(row.created_at) || null;
}

function hrefFor(slug: EnterpriseModuleSlug, row: GenericRow) {
  if (slug === "projects") return `/dashboard/projects?record=${row.id}`;
  if (slug === "tasks") return `/dashboard/tasks?record=${row.id}`;
  if (slug === "documents") return `/dashboard/documents?record=${row.id}`;
  if (slug === "marketing") return `/dashboard/marketing?record=${row.id}`;
  if (slug === "seo") return `/dashboard/seo?record=${row.id}`;
  if (slug === "finance") return `/dashboard/finance?record=${row.id}`;
  if (slug === "client-portal") return `/dashboard/clients/${row.id}`;
  return `/dashboard/${slug}?record=${row.id}`;
}

function normalize(slug: EnterpriseModuleSlug, row: GenericRow): WorkspaceRecord {
  const title = text(row.name) || text(row.title) || text(row.invoice_number) || text(row.provider) || text(row.key) || text(row.website_url) || text(row.action) || "Untitled record";
  const subtitle =
    text(row.channel) ||
    text(row.industry) ||
    text(row.entity_type) ||
    text(row.mime_type) ||
    text(row.category) ||
    text(row.storage_path) ||
    text(row.website_url) ||
    text(row.client_id) ||
    "Workspace record";
  const status = text(row.status) || text(row.lifecycle_status) || text(row.priority) || "active";
  return {
    id: row.id,
    title,
    subtitle,
    status,
    amount: money(row.total) ?? money(row.budget) ?? money(row.estimated_value),
    date: dateValue(row),
    href: hrefFor(slug, row),
    metadata: {
      clientId: text(row.client_id, "") || null,
      projectId: text(row.project_id, "") || null,
      assigneeId: text(row.assignee_id, "") || null,
    },
  };
}

function summarize(records: WorkspaceRecord[]): WorkspaceSummary {
  return {
    total: records.length,
    active: records.filter((record) => ["active", "in_progress", "todo", "draft", "connected"].includes(record.status)).length,
    risk: records.filter((record) => ["blocked", "overdue", "error", "cancelled"].includes(record.status)).length,
    value: records.reduce((sum, record) => sum + Number(record.amount ?? 0), 0),
  };
}

async function rowsFor(slug: EnterpriseModuleSlug, organizationId: string): Promise<GenericRow[]> {
  const supabase = await createClient();
  if (slug === "projects") {
    const { data, error } = await supabase.from("projects").select("*").eq("organization_id", organizationId).is("deleted_at", null).order("created_at", { ascending: false }).limit(50);
    return unwrap(data, error) as unknown as GenericRow[];
  }
  if (slug === "tasks") {
    const { data, error } = await supabase.from("tasks").select("*").eq("organization_id", organizationId).is("deleted_at", null).order("created_at", { ascending: false }).limit(50);
    return unwrap(data, error) as unknown as GenericRow[];
  }
  if (slug === "calendar") {
    const { data, error } = await supabase.from("calendar_events").select("*").eq("organization_id", organizationId).is("deleted_at", null).order("starts_at", { ascending: true }).limit(50);
    return unwrap(data, error) as unknown as GenericRow[];
  }
  if (slug === "documents") {
    const { data, error } = await supabase.from("documents").select("*").eq("organization_id", organizationId).is("deleted_at", null).order("created_at", { ascending: false }).limit(50);
    return unwrap(data, error) as unknown as GenericRow[];
  }
  if (slug === "marketing" || slug === "advertising") {
    const { data, error } = await supabase.from("marketing_campaigns").select("*").eq("organization_id", organizationId).is("deleted_at", null).order("created_at", { ascending: false }).limit(50);
    return unwrap(data, error) as unknown as GenericRow[];
  }
  if (slug === "seo") {
    const { data, error } = await supabase.from("seo_projects").select("*").eq("organization_id", organizationId).is("deleted_at", null).order("created_at", { ascending: false }).limit(50);
    return unwrap(data, error) as unknown as GenericRow[];
  }
  if (slug === "ai-studio") {
    const { data, error } = await supabase.from("prompt_library").select("*").eq("organization_id", organizationId).is("deleted_at", null).order("created_at", { ascending: false }).limit(50);
    return unwrap(data, error) as unknown as GenericRow[];
  }
  if (slug === "finance") {
    const { data, error } = await supabase.from("invoices").select("*").eq("organization_id", organizationId).is("deleted_at", null).order("created_at", { ascending: false }).limit(50);
    return unwrap(data, error) as unknown as GenericRow[];
  }
  if (slug === "client-portal") {
    const { data, error } = await supabase.from("clients").select("*").eq("organization_id", organizationId).is("deleted_at", null).order("created_at", { ascending: false }).limit(50);
    return unwrap(data, error) as unknown as GenericRow[];
  }
  if (slug === "agency-portal") {
    const { data, error } = await supabase.from("knowledge_base").select("*").eq("organization_id", organizationId).is("deleted_at", null).order("created_at", { ascending: false }).limit(50);
    return unwrap(data, error) as unknown as GenericRow[];
  }
  if (slug === "notifications") {
    const { data, error } = await supabase.from("notifications").select("*").eq("organization_id", organizationId).is("deleted_at", null).order("created_at", { ascending: false }).limit(50);
    return unwrap(data, error) as unknown as GenericRow[];
  }
  if (slug === "integrations") {
    const { data, error } = await supabase.from("integrations").select("*").eq("organization_id", organizationId).is("deleted_at", null).order("provider", { ascending: true }).limit(50);
    return unwrap(data, error) as unknown as GenericRow[];
  }
  if (slug === "platform-settings") {
    const { data, error } = await supabase.from("settings").select("*").eq("organization_id", organizationId).is("deleted_at", null).order("key", { ascending: true }).limit(50);
    return unwrap(data, error) as unknown as GenericRow[];
  }
  const { data, error } = await supabase.from("activity_logs").select("*").eq("organization_id", organizationId).is("deleted_at", null).order("created_at", { ascending: false }).limit(50);
  return unwrap(data, error) as unknown as GenericRow[];
}

export async function getWorkspaceModuleData(slug: EnterpriseModuleSlug, organizationId: string) {
  const rows = await rowsFor(slug, organizationId);
  const records = rows.map((row) => normalize(slug, row));
  return { records, summary: summarize(records) };
}

export async function searchWorkspace(organizationId: string, query: string) {
  const normalizedQuery = query.trim().toLowerCase();
  const searchable: EnterpriseModuleSlug[] = ["projects", "tasks", "documents", "marketing", "seo", "finance", "client-portal", "ai-studio"];
  const data = await Promise.all(searchable.map(async (slug) => (await getWorkspaceModuleData(slug, organizationId)).records));
  const records = data.flat();
  if (!normalizedQuery) return records.slice(0, 40);
  return records.filter((record) => `${record.title} ${record.subtitle} ${record.status}`.toLowerCase().includes(normalizedQuery)).slice(0, 40);
}
