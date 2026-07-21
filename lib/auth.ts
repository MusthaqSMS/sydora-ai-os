import { createClient } from "@/lib/supabase/client";

export async function signUp(
  name: string,
  email: string,
  password: string
) {
  const supabase = createClient();

  return await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: name,
      },
    },
  });
}

export async function signIn(
  email: string,
  password: string
) {
  const supabase = createClient();

  return await supabase.auth.signInWithPassword({
    email,
    password,
  });
}

export async function signOut() {
  const supabase = createClient();

  return await supabase.auth.signOut();
}

export async function getCurrentUser() {
  const supabase = createClient();

  return await supabase.auth.getUser();
}