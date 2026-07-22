"use server";

import { headers } from "next/headers";
import { hasSupabaseConfig } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { callRpc } from "@/services/rpc";

export async function enforceSameOrigin() {
  const headerStore = await headers();
  const origin = headerStore.get("origin");
  const host = headerStore.get("x-forwarded-host") ?? headerStore.get("host");
  if (origin && host && new URL(origin).host !== host) {
    throw new Error("Request origin is not allowed.");
  }
}

export async function enforceRateLimit(bucketKey: string, limit: number, windowSeconds: number) {
  if (!hasSupabaseConfig()) return;
  const supabase = await createClient();
  const { data, error } = await callRpc(supabase, "check_rate_limit", { p_bucket_key: bucketKey, p_limit: limit, p_window_seconds: windowSeconds });
  if (error) throw error;
  if (!data) throw new Error("Too many requests. Please wait and try again.");
}
