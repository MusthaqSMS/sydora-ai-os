"use server";

import { createClient } from "@/lib/supabase/server";
import { projectSchema, type ProjectInput } from "@/schemas/project";
import type { Project } from "@/types/database";
import { unwrap } from "./service-error";

export async function createProject(input: ProjectInput): Promise<Project> {
  const value = projectSchema.parse(input);
  const supabase = await createClient();
  const { data, error } = await supabase.from("projects").insert({ organization_id: value.organizationId, client_id: value.clientId, name: value.name, status: value.status, start_date: value.startDate ?? null, due_date: value.dueDate ?? null }).select().single();
  return unwrap(data, error);
}
