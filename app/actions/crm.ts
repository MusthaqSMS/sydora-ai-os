"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireActiveOrganization } from "@/lib/auth/session";
import { requirePermission } from "@/lib/auth/authorization";
import { enforceSameOrigin } from "@/lib/security/request";
import { createClient, archiveClient, restoreClient, updateClient, addClientNote, createClientContact, updateClientContact, deleteClientContact, restoreClientContact } from "@/services/client.service";
import { createLead, updateLead, archiveLead, restoreLead, mergeLeads, createLeadNote, createLeadActivity } from "@/services/lead.service";
import { clientUpdateSchema, clientNoteSchema } from "@/schemas/client";
import { clientContactSchema, clientContactUpdateSchema } from "@/schemas/contact";
import { leadNoteSchema, leadActivitySchema } from "@/schemas/lead";

const clientFormSchema = z.object({
  organizationId: z.string().uuid(),
  name: z.string().trim().min(2).max(160),
  website: z.string().trim().optional().nullable(),
  industry: z.string().trim().max(100).optional().nullable(),
});

const leadFormSchema = z.object({
  name: z.string().trim().min(2).max(160),
  email: z.string().trim().email().nullable().optional(),
  company: z.string().trim().max(160).nullable().optional(),
  sourceId: z.string().uuid().nullable().optional(),
  statusId: z.string().uuid().nullable().optional(),
  estimatedValue: z.coerce.number().nonnegative().nullable().optional(),
});

function parseOptionalUuid(value: FormDataEntryValue | null): string | null {
  const raw = String(value ?? "").trim();
  return raw === "" ? null : raw;
}

export async function createClientAction(formData: FormData) {
  await enforceSameOrigin();
  const context = await requireActiveOrganization("/dashboard/clients");
  await requirePermission(context.activeOrganization.id, "clients.create");

  const organizationId = context.activeOrganization.id;
  const name = String(formData.get("name") ?? "").trim();
  const website = String(formData.get("website") ?? "").trim() || null;
  const industry = String(formData.get("industry") ?? "").trim() || null;

  clientFormSchema.parse({ organizationId, name, website, industry });
  await createClient({ organizationId, name, website, industry });
  revalidatePath("/dashboard/clients");
}

export async function archiveClientAction(formData: FormData) {
  await enforceSameOrigin();
  const context = await requireActiveOrganization("/dashboard/clients");
  await requirePermission(context.activeOrganization.id, "clients.update");

  const clientId = z.string().uuid().parse(String(formData.get("clientId") ?? ""));
  await archiveClient(clientId);
  revalidatePath("/dashboard/clients");
}

export async function restoreClientAction(formData: FormData) {
  await enforceSameOrigin();
  const context = await requireActiveOrganization("/dashboard/clients");
  await requirePermission(context.activeOrganization.id, "clients.update");

  const clientId = z.string().uuid().parse(String(formData.get("clientId") ?? ""));
  await restoreClient(clientId);
  revalidatePath("/dashboard/clients");
}

export async function updateClientAction(formData: FormData) {
  await enforceSameOrigin();
  const context = await requireActiveOrganization("/dashboard/clients");
  await requirePermission(context.activeOrganization.id, "clients.update");

  const clientId = z.string().uuid().parse(String(formData.get("clientId") ?? ""));
  const name = String(formData.get("name") ?? "").trim();
  const website = String(formData.get("website") ?? "").trim() || null;
  const industry = String(formData.get("industry") ?? "").trim() || null;
  const lifecycleStatusRaw = String(formData.get("lifecycleStatus") ?? "").trim();
  const lifecycleStatus = lifecycleStatusRaw === "" ? undefined : (lifecycleStatusRaw as "active" | "inactive" | "archived");

  clientUpdateSchema.parse({ clientId, name, website, industry, lifecycleStatus });
  await updateClient(clientId, { name, website, industry, lifecycleStatus });
  revalidatePath(`/dashboard/clients/${clientId}`);
}

export async function addClientNoteAction(formData: FormData) {
  await enforceSameOrigin();
  const context = await requireActiveOrganization("/dashboard/clients");
  await requirePermission(context.activeOrganization.id, "clients.update");

  const clientId = z.string().uuid().parse(String(formData.get("clientId") ?? ""));
  const note = String(formData.get("note") ?? "").trim();
  clientNoteSchema.parse({ clientId, note });

  await addClientNote(context.activeOrganization.id, clientId, note);
  revalidatePath(`/dashboard/clients/${clientId}`);
}

export async function createClientContactAction(formData: FormData) {
  await enforceSameOrigin();
  const context = await requireActiveOrganization("/dashboard/clients");
  await requirePermission(context.activeOrganization.id, "clients.update");

  const clientId = z.string().uuid().parse(String(formData.get("clientId") ?? ""));
  const fullName = String(formData.get("fullName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim() || null;
  const phone = String(formData.get("phone") ?? "").trim() || null;
  const jobTitle = String(formData.get("jobTitle") ?? "").trim() || null;
  const contactType = String(formData.get("contactType") ?? "other") as
    | "primary"
    | "billing"
    | "marketing"
    | "technical"
    | "decision_maker"
    | "other";
  const isPrimary = String(formData.get("isPrimary") ?? "") === "on";

  clientContactSchema.parse({ clientId, fullName, email, phone, jobTitle, contactType, isPrimary });
  await createClientContact(context.activeOrganization.id, clientId, { fullName, email, phone, jobTitle, contactType, isPrimary });
  revalidatePath(`/dashboard/clients/${clientId}`);
}

export async function updateClientContactAction(formData: FormData) {
  await enforceSameOrigin();
  const context = await requireActiveOrganization("/dashboard/clients");
  await requirePermission(context.activeOrganization.id, "clients.update");

  const contactId = z.string().uuid().parse(String(formData.get("contactId") ?? ""));
  const clientId = z.string().uuid().parse(String(formData.get("clientId") ?? ""));
  const fullName = String(formData.get("fullName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim() || null;
  const phone = String(formData.get("phone") ?? "").trim() || null;
  const jobTitle = String(formData.get("jobTitle") ?? "").trim() || null;
  const contactType = String(formData.get("contactType") ?? "other") as
    | "primary"
    | "billing"
    | "marketing"
    | "technical"
    | "decision_maker"
    | "other";
  const isPrimary = String(formData.get("isPrimary") ?? "") === "on";

  clientContactUpdateSchema.parse({ contactId, clientId, fullName, email, phone, jobTitle, contactType, isPrimary });
  await updateClientContact(context.activeOrganization.id, contactId, { fullName, email, phone, jobTitle, contactType, isPrimary });
  revalidatePath(`/dashboard/clients/${clientId}`);
}

export async function deleteClientContactAction(formData: FormData) {
  await enforceSameOrigin();
  const context = await requireActiveOrganization("/dashboard/clients");
  await requirePermission(context.activeOrganization.id, "clients.update");

  const contactId = z.string().uuid().parse(String(formData.get("contactId") ?? ""));
  const clientId = z.string().uuid().parse(String(formData.get("clientId") ?? ""));

  await deleteClientContact(context.activeOrganization.id, contactId);
  revalidatePath(`/dashboard/clients/${clientId}`);
}

export async function restoreClientContactAction(formData: FormData) {
  await enforceSameOrigin();
  const context = await requireActiveOrganization("/dashboard/clients");
  await requirePermission(context.activeOrganization.id, "clients.update");

  const contactId = z.string().uuid().parse(String(formData.get("contactId") ?? ""));
  const clientId = z.string().uuid().parse(String(formData.get("clientId") ?? ""));

  await restoreClientContact(context.activeOrganization.id, contactId);
  revalidatePath(`/dashboard/clients/${clientId}`);
}

export async function createLeadAction(formData: FormData) {
  await enforceSameOrigin();
  const context = await requireActiveOrganization("/dashboard/leads");
  await requirePermission(context.activeOrganization.id, "leads.create");

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim() || null;
  const company = String(formData.get("company") ?? "").trim() || null;
  const sourceId = parseOptionalUuid(formData.get("sourceId"));
  const statusId = parseOptionalUuid(formData.get("statusId"));
  const estimatedValueRaw = String(formData.get("estimatedValue") ?? "").trim();
  const estimatedValue = estimatedValueRaw === "" ? null : Number(estimatedValueRaw);

  leadFormSchema.parse({ name, email, company, sourceId, statusId, estimatedValue });
  await createLead({
    organizationId: context.activeOrganization.id,
    name,
    email,
    company,
    sourceId,
    statusId,
    estimatedValue,
  });

  revalidatePath("/dashboard/leads");
}

export async function updateLeadAction(formData: FormData) {
  await enforceSameOrigin();
  const context = await requireActiveOrganization("/dashboard/leads");
  await requirePermission(context.activeOrganization.id, "leads.update");

  const leadId = z.string().uuid().parse(String(formData.get("leadId") ?? ""));
  const sourceId = parseOptionalUuid(formData.get("sourceId"));
  const statusId = parseOptionalUuid(formData.get("statusId"));
  const estimatedValueRaw = String(formData.get("estimatedValue") ?? "").trim();
  const estimatedValue = estimatedValueRaw === "" ? null : Number(estimatedValueRaw);

  leadFormSchema.parse({ name: "Placeholder", email: null, company: null, sourceId, statusId, estimatedValue });
  await updateLead(leadId, { sourceId, statusId, estimatedValue });
  revalidatePath("/dashboard/leads");
}

export async function createLeadNoteAction(formData: FormData) {
  'use server';
  await enforceSameOrigin();
  const context = await requireActiveOrganization(`/dashboard/leads`);
  await requirePermission(context.activeOrganization.id, "leads.update");

  const organizationId = z.string().uuid().parse(String(formData.get("organizationId") ?? ""));
  const leadId = z.string().uuid().parse(String(formData.get("leadId") ?? ""));
  const body = String(formData.get("body") ?? "").trim();

  leadNoteSchema.parse({ leadId, note: body });
  await createLeadNote(organizationId, leadId, body);
  revalidatePath(`/dashboard/leads/${leadId}`);
}

export async function createLeadActivityAction(formData: FormData) {
  'use server';
  await enforceSameOrigin();
  const context = await requireActiveOrganization(`/dashboard/leads`);
  await requirePermission(context.activeOrganization.id, "leads.update");

  const organizationId = z.string().uuid().parse(String(formData.get("organizationId") ?? ""));
  const leadId = z.string().uuid().parse(String(formData.get("leadId") ?? ""));
  const activityType = String(formData.get("activityType") ?? "").trim();
  const occurredAt = String(formData.get("occurredAt") ?? "").trim();
  const metadata = {};

  leadActivitySchema.parse({ leadId, activityType, occurredAt, metadataNote: null });
  await createLeadActivity(organizationId, leadId, { activityType, occurredAt, metadata });
  revalidatePath(`/dashboard/leads/${leadId}`);
}

export async function archiveLeadAction(formData: FormData) {
  await enforceSameOrigin();
  const context = await requireActiveOrganization("/dashboard/leads");
  await requirePermission(context.activeOrganization.id, "leads.update");

  const leadId = z.string().uuid().parse(String(formData.get("leadId") ?? ""));
  await archiveLead(leadId);
  revalidatePath(`/dashboard/leads`);
}

export async function restoreLeadAction(formData: FormData) {
  await enforceSameOrigin();
  const context = await requireActiveOrganization("/dashboard/leads");
  await requirePermission(context.activeOrganization.id, "leads.update");

  const leadId = z.string().uuid().parse(String(formData.get("leadId") ?? ""));
  await restoreLead(leadId);
  revalidatePath(`/dashboard/leads/${leadId}`);
}

export async function mergeLeadAction(formData: FormData) {
  await enforceSameOrigin();
  const context = await requireActiveOrganization("/dashboard/leads");
  await requirePermission(context.activeOrganization.id, "leads.update");

  const primaryLeadId = z.string().uuid().parse(String(formData.get("primaryLeadId") ?? ""));
  const sourceLeadId = z.string().uuid().parse(String(formData.get("sourceLeadId") ?? ""));
  await mergeLeads(primaryLeadId, sourceLeadId);
  revalidatePath(`/dashboard/leads/${primaryLeadId}`);
}
