import type { PostgrestError } from "@supabase/supabase-js";

export function unwrap<T>(data: T | null, error: PostgrestError | null): T {
  if (error) throw new Error(error.message);
  if (data === null) throw new Error("The database did not return a record.");
  return data;
}
