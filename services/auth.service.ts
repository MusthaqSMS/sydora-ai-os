"use client";

import { createClient } from "@/lib/supabase/client";
import type { ForgotPasswordInput, ResetPasswordInput, SignInInput, SignUpInput } from "@/schemas/auth";

export async function signIn({ email, password }: SignInInput) {
  return createClient().auth.signInWithPassword({ email, password });
}

export async function signUp({ fullName, email, password }: SignUpInput) {
  return createClient().auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  });
}

export async function requestPasswordReset({ email }: ForgotPasswordInput) {
  return createClient().auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });
}

export async function resetPassword({ password }: ResetPasswordInput) {
  return createClient().auth.updateUser({ password });
}

export async function signOut() {
  return createClient().auth.signOut();
}
