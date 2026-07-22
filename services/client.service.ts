"use server";

import { createClient as createSupabaseClient } from "@/lib/supabase/server";
import { clientSchema, type ClientInput } from "@/schemas/client";
import type { Client, EntityId } from "@/types/database";
import { unwrap } from "./service-error";
import { callRpc } from "./rpc";

export async function createClient(input: ClientInput): Promise<Client> {
  const value = clientSchema.parse(input);
  const supabase = await createSupabaseClient();
  const { data, error } = await callRpc(supabase, "create_client", { p_organization_id: value.organizationId, p_name: value.name, p_website: value.website ?? null, p_industry: value.industry ?? null });
  return unwrap(data, error);
}

export async function updateClient(clientId: EntityId, input: Partial<Omit<ClientInput, "organizationId">>): Promise<Client> {
  const value = clientSchema.omit({ organizationId: true }).partial().parse(input);
  const supabase = await createSupabaseClient();
  const { data, error } = await callRpc(supabase, "update_client", { p_client_id: clientId, p_name: value.name ?? null, p_website: value.website ?? null, p_industry: value.industry ?? null, p_lifecycle_status: null });
  return unwrap(data, error);
}

export async function deleteClient(clientId: EntityId): Promise<void> {
  const supabase = await createSupabaseClient();
  const { error } = await callRpc(supabase, "delete_client", { p_client_id: clientId });
  if (error) throw new Error(error.message);
}
