"use server";

import { createClient } from "@/lib/supabase/server";
import { taskSchema, type TaskInput } from "@/schemas/task";
import type { EntityId, Task } from "@/types/database";
import { unwrap } from "./service-error";
import { callRpc } from "./rpc";

export async function createTask(input: TaskInput): Promise<Task> {
  const value = taskSchema.parse(input);
  const supabase = await createClient();
  const { data, error } = await callRpc(supabase, "create_task", { p_organization_id: value.organizationId, p_title: value.title, p_project_id: value.projectId ?? null, p_assignee_id: value.assigneeId ?? null, p_description: value.description ?? null, p_priority: value.priority, p_due_at: value.dueAt ?? null });
  return unwrap(data, error);
}

export async function updateTask(taskId: EntityId, input: Partial<Omit<TaskInput, "organizationId">>): Promise<Task> {
  const value = taskSchema.omit({ organizationId: true }).partial().parse(input);
  const supabase = await createClient();
  const { data, error } = await supabase.from("tasks").update({ title: value.title, project_id: value.projectId, assignee_id: value.assigneeId, description: value.description, priority: value.priority, due_at: value.dueAt }).eq("id", taskId).select().single();
  return unwrap(data, error);
}

export async function deleteTask(taskId: EntityId): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("tasks").update({ deleted_at: new Date().toISOString() }).eq("id", taskId);
  if (error) throw new Error(error.message);
}

export async function completeTask(taskId: EntityId): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("tasks").update({ status: "done" }).eq("id", taskId);
  if (error) throw new Error(error.message);
}
