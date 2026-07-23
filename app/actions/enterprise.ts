"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requirePermission } from "@/lib/auth/authorization";
import { requireActiveOrganization } from "@/lib/auth/session";
import { getEnterpriseModule, type EnterpriseModuleSlug } from "@/lib/constants/enterprise-modules";
import { enforceSameOrigin } from "@/lib/security/request";
import { createClient } from "@/lib/supabase/server";
import type { Json } from "@/types/database";

const uuid = z.string().uuid();
const nullableUuid = z.string().trim().transform((value) => value || null).pipe(z.string().uuid().nullable());

function optionalText(formData: FormData, key: string) {
  const value = String(formData.get(key) ?? "").trim();
  return value || null;
}

function optionalNumber(formData: FormData, key: string) {
  const value = String(formData.get(key) ?? "").trim();
  return value ? Number(value) : null;
}

function datetimeValue(formData: FormData, key: string) {
  const value = optionalText(formData, key);
  return value ? new Date(value).toISOString() : null;
}

function moduleSlug(formData: FormData): EnterpriseModuleSlug {
  const slug = String(formData.get("module") ?? "");
  const moduleConfig = getEnterpriseModule(slug);
  if (!moduleConfig) throw new Error("Unsupported enterprise module.");
  return moduleConfig.slug;
}

function toJsonNote(value: string | null): Json {
  return value ? { note: value } : {};
}

export async function createEnterpriseRecordAction(formData: FormData) {
  await enforceSameOrigin();
  const slug = moduleSlug(formData);
  const moduleConfig = getEnterpriseModule(slug);
  if (!moduleConfig) throw new Error("Unsupported enterprise module.");

  const context = await requireActiveOrganization(`/dashboard/${slug}`);
  await requirePermission(context.activeOrganization.id, moduleConfig.permission);

  const organizationId = context.activeOrganization.id;
  const supabase = await createClient();

  if (slug === "projects") {
    const payload = z.object({
      client_id: uuid,
      name: z.string().trim().min(2).max(160),
      status: z.enum(["planned", "active", "on_hold", "completed", "cancelled"]),
      start_date: z.string().nullable(),
      due_date: z.string().nullable(),
    }).parse({
      client_id: String(formData.get("clientId") ?? ""),
      name: String(formData.get("name") ?? ""),
      status: String(formData.get("status") ?? "planned"),
      start_date: optionalText(formData, "startDate"),
      due_date: optionalText(formData, "dueDate"),
    });
    const { error } = await supabase.from("projects").insert({ organization_id: organizationId, ...payload });
    if (error) throw error;
  }

  if (slug === "tasks") {
    const payload = z.object({
      title: z.string().trim().min(2).max(240),
      project_id: nullableUuid,
      description: z.string().nullable(),
      priority: z.enum(["low", "medium", "high", "urgent"]),
      due_at: z.string().nullable(),
    }).parse({
      title: String(formData.get("title") ?? ""),
      project_id: String(formData.get("projectId") ?? ""),
      description: optionalText(formData, "description"),
      priority: String(formData.get("priority") ?? "medium"),
      due_at: datetimeValue(formData, "dueAt"),
    });
    const { error } = await supabase.from("tasks").insert({ organization_id: organizationId, ...payload });
    const { error } = await supabase.from("tasks").insert({ organization_id: organizationId, status: "todo", assignee_id: null, ...payload });
    if (error) throw error;
  }

  if (slug === "calendar") {
    const payload = z.object({
      title: z.string().trim().min(2).max(240),
      client_id: nullableUuid,
      project_id: nullableUuid,
      starts_at: z.string().datetime(),
      ends_at: z.string().datetime(),
    }).parse({
      title: String(formData.get("title") ?? ""),
      client_id: String(formData.get("clientId") ?? ""),
      project_id: String(formData.get("projectId") ?? ""),
      starts_at: datetimeValue(formData, "startsAt"),
      ends_at: datetimeValue(formData, "endsAt"),
    });
    const { error } = await supabase.from("calendar_events").insert({ organization_id: organizationId, attendees: [], ...payload });
    if (error) throw error;
  }

  if (slug === "documents") {
    const payload = z.object({
      name: z.string().trim().min(2).max(240),
      storage_path: z.string().trim().min(2).max(500),
      client_id: nullableUuid,
      project_id: nullableUuid,
      mime_type: z.string().nullable(),
    }).parse({
      name: String(formData.get("name") ?? ""),
      storage_path: String(formData.get("storagePath") ?? ""),
      client_id: String(formData.get("clientId") ?? ""),
      project_id: String(formData.get("projectId") ?? ""),
      mime_type: optionalText(formData, "mimeType"),
    });
    const { error } = await supabase.from("documents").insert({ organization_id: organizationId, ...payload });
    if (error) throw error;
  }

  if (slug === "marketing") {
    const payload = z.object({
      client_id: uuid,
      name: z.string().trim().min(2).max(160),
      channel: z.enum(["email", "search", "social", "content", "other"]),
      status: z.enum(["draft", "active", "paused", "completed"]),
      budget: z.number().nullable(),
    }).parse({
      client_id: String(formData.get("clientId") ?? ""),
      name: String(formData.get("name") ?? ""),
      channel: String(formData.get("channel") ?? "email"),
      status: String(formData.get("status") ?? "draft"),
      budget: optionalNumber(formData, "budget"),
    });
    const { error } = await supabase.from("marketing_campaigns").insert({ organization_id: organizationId, ...payload });
    if (error) throw error;
  }

  if (slug === "seo") {
    const payload = z.object({
      client_id: uuid,
      website_url: z.string().url(),
      project_id: nullableUuid,
      status: z.enum(["planned", "active", "on_hold", "completed", "cancelled"]),
    }).parse({
      client_id: String(formData.get("clientId") ?? ""),
      website_url: String(formData.get("websiteUrl") ?? ""),
      project_id: String(formData.get("projectId") ?? ""),
      status: String(formData.get("status") ?? "planned"),
    });
    const { error } = await supabase.from("seo_projects").insert({ organization_id: organizationId, ...payload });
    if (error) throw error;
  }

  if (slug === "ai-studio") {
    const payload = z.object({
      name: z.string().trim().min(2).max(160),
      category: z.string().nullable(),
      template: z.string().trim().min(2),
    }).parse({
      name: String(formData.get("name") ?? ""),
      category: optionalText(formData, "category"),
      template: String(formData.get("template") ?? ""),
    });
    const { error } = await supabase.from("prompt_library").insert({ organization_id: organizationId, variables: [], ...payload });
    if (error) throw error;
  }

  if (slug === "finance") {
    const payload = z.object({
      client_id: uuid,
      invoice_number: z.string().trim().min(2).max(80),
      total: z.number().nonnegative().nullable(),
      due_date: z.string().nullable(),
    }).parse({
      client_id: String(formData.get("clientId") ?? ""),
      invoice_number: String(formData.get("invoiceNumber") ?? ""),
      total: optionalNumber(formData, "total"),
      due_date: optionalText(formData, "dueDate"),
    });
    const { error } = await supabase.from("invoices").insert({ organization_id: organizationId, status: "draft", total: payload.total ?? 0, client_id: payload.client_id, invoice_number: payload.invoice_number, due_date: payload.due_date });
    if (error) throw error;
  }

  if (slug === "agency-portal") {
    const payload = z.object({
      title: z.string().trim().min(2).max(240),
      content: z.string().trim().min(2),
      source_url: z.string().url().nullable(),
    }).parse({
      title: String(formData.get("title") ?? ""),
      content: String(formData.get("content") ?? ""),
      source_url: optionalText(formData, "sourceUrl"),
    });
    const { error } = await supabase.from("knowledge_base").insert({ organization_id: organizationId, ...payload });
    if (error) throw error;
  }

  if (slug === "notifications") {
    const payload = z.object({
      title: z.string().trim().min(2).max(160),
      body: z.string().nullable(),
      user_id: uuid,
    }).parse({
      title: String(formData.get("title") ?? ""),
      body: optionalText(formData, "body"),
      user_id: String(formData.get("userId") ?? ""),
    });
    const { error } = await supabase.from("notifications").insert({ organization_id: organizationId, ...payload });
    if (error) throw error;
  }

  if (slug === "integrations") {
    const payload = z.object({
      provider: z.string().trim().min(2).max(80),
      status: z.enum(["connected", "disconnected", "error"]),
      configuration: z.record(z.string(), z.unknown()),
    }).parse({
      provider: String(formData.get("provider") ?? ""),
      status: String(formData.get("status") ?? "disconnected"),
      configuration: toJsonNote(optionalText(formData, "configurationNote")),
    });
    const { error } = await supabase.from("integrations").upsert({ organization_id: organizationId, ...payload }, { onConflict: "organization_id,provider" });
    if (error) throw error;
  }

  if (slug === "platform-settings") {
    const key = z.string().trim().min(2).max(120).parse(String(formData.get("key") ?? ""));
    const value = z.string().trim().min(1).parse(String(formData.get("value") ?? ""));
    const { error } = await supabase.from("settings").upsert({ organization_id: organizationId, key, value: { value } }, { onConflict: "organization_id,key" });
    if (error) throw error;
  }

  revalidatePath(`/dashboard/${slug}`);
}

export async function archiveEnterpriseRecordAction(formData: FormData) {
  await enforceSameOrigin();
  const slug = moduleSlug(formData);
  const moduleConfig = getEnterpriseModule(slug);
  if (!moduleConfig?.table || moduleConfig.table === "activity_logs") throw new Error("This module does not support archiving.");

  const context = await requireActiveOrganization(`/dashboard/${slug}`);
  await requirePermission(context.activeOrganization.id, moduleConfig.permission);
  const id = uuid.parse(String(formData.get("recordId") ?? ""));
  const supabase = await createClient();
  const deleted_at = new Date().toISOString();

  if (slug === "projects") await supabase.from("projects").update({ deleted_at }).eq("id", id).eq("organization_id", context.activeOrganization.id);
  if (slug === "tasks") await supabase.from("tasks").update({ deleted_at }).eq("id", id).eq("organization_id", context.activeOrganization.id);
  if (slug === "calendar") await supabase.from("calendar_events").update({ deleted_at }).eq("id", id).eq("organization_id", context.activeOrganization.id);
  if (slug === "documents") await supabase.from("documents").update({ deleted_at }).eq("id", id).eq("organization_id", context.activeOrganization.id);
  if (slug === "marketing" || slug === "advertising") await supabase.from("marketing_campaigns").update({ deleted_at }).eq("id", id).eq("organization_id", context.activeOrganization.id);
  if (slug === "seo") await supabase.from("seo_projects").update({ deleted_at }).eq("id", id).eq("organization_id", context.activeOrganization.id);
  if (slug === "ai-studio") await supabase.from("prompt_library").update({ deleted_at }).eq("id", id).eq("organization_id", context.activeOrganization.id);
  if (slug === "finance") await supabase.from("invoices").update({ deleted_at }).eq("id", id).eq("organization_id", context.activeOrganization.id);
  if (slug === "agency-portal") await supabase.from("knowledge_base").update({ deleted_at }).eq("id", id).eq("organization_id", context.activeOrganization.id);
  if (slug === "notifications") await supabase.from("notifications").update({ deleted_at }).eq("id", id).eq("organization_id", context.activeOrganization.id);
  if (slug === "integrations") await supabase.from("integrations").update({ deleted_at }).eq("id", id).eq("organization_id", context.activeOrganization.id);
  if (slug === "platform-settings") await supabase.from("settings").update({ deleted_at }).eq("id", id).eq("organization_id", context.activeOrganization.id);

  revalidatePath(`/dashboard/${slug}`);
}
