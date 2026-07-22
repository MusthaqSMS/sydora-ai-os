"use server";

import { createClient } from "@/lib/supabase/server";
import type { SeoProject } from "@/types/database";
import { z } from "zod";
import { unwrap } from "./service-error";

const seoProjectSchema = z.object({ organizationId: z.uuid(), clientId: z.uuid(), projectId: z.uuid().nullable().optional(), websiteUrl: z.url(), status: z.enum(["planned", "active", "on_hold", "completed", "cancelled"]).default("planned") });
export type SeoProjectInput = z.infer<typeof seoProjectSchema>;

export async function createSeoProject(input: SeoProjectInput): Promise<SeoProject> {
  const value = seoProjectSchema.parse(input);
  const supabase = await createClient();
  const { data, error } = await supabase.from("seo_projects").insert({ organization_id: value.organizationId, client_id: value.clientId, project_id: value.projectId ?? null, website_url: value.websiteUrl, status: value.status }).select().single();
  return unwrap(data, error);
}
