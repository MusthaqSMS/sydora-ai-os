import type { PostgrestError, SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

type FunctionName = keyof Database["public"]["Functions"];
type FunctionArgs<Name extends FunctionName> = Database["public"]["Functions"][Name] extends { Args: infer Args } ? Args : never;
type FunctionReturn<Name extends FunctionName> = Database["public"]["Functions"][Name] extends { Returns: infer Returns } ? Returns : never;
type RpcResult<Value> = { data: Value | null; error: PostgrestError | null };

// Isolates Supabase's RPC overload from the generated database contract.
export async function callRpc<Name extends FunctionName>(client: SupabaseClient<Database>, name: Name, args: FunctionArgs<Name>): Promise<RpcResult<FunctionReturn<Name>>> {
  const execute = client.rpc as unknown as (functionName: Name, parameters: FunctionArgs<Name>) => Promise<RpcResult<FunctionReturn<Name>>>;
  return execute(name, args);
}
