"use server";

import { redirect } from "next/navigation";
import { createHash } from "node:crypto";
import { createClient } from "@/lib/supabase/server";
import { enforceRateLimit, enforceSameOrigin } from "@/lib/security/request";
import { hasSupabaseConfig } from "@/lib/supabase/config";
import { changePasswordSchema, forgotPasswordSchema, resetPasswordSchema, signInSchema, signUpSchema, updateEmailSchema } from "@/schemas/auth";
import { logSecurityEvent } from "@/services/security.service";

export type ActionState = { ok: boolean; message: string; next?: string };

function originUrl() {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

function userBucket(prefix: string, email: string) {
  return `${prefix}:${createHash("sha256").update(email.toLowerCase()).digest("hex")}`;
}

export async function signInAction(formData: FormData): Promise<ActionState> {
  await enforceSameOrigin();
  const parsed = signInSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Check your sign in details." };
  await enforceRateLimit(userBucket("auth:signin", parsed.data.email), 8, 900);

  if (!hasSupabaseConfig()) return { ok: false, message: "Supabase is not configured." };
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email: parsed.data.email, password: parsed.data.password });
  await logSecurityEvent({ userId: data.user?.id ?? null, email: parsed.data.email, eventType: error ? "login_failed" : "login_succeeded", success: !error });
  if (error) return { ok: false, message: "Invalid email or password." };
  return { ok: true, message: "Signed in.", next: String(formData.get("next") ?? "/dashboard") };
}

export async function signUpAction(formData: FormData): Promise<ActionState> {
  await enforceSameOrigin();
  const parsed = signUpSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Check your account details." };
  await enforceRateLimit(userBucket("auth:signup", parsed.data.email), 4, 3600);

  if (!hasSupabaseConfig()) return { ok: false, message: "Supabase is not configured." };
  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { full_name: parsed.data.fullName },
      emailRedirectTo: `${originUrl()}/auth/callback?next=/onboarding`,
    },
  });
  if (error) return { ok: false, message: error.message };
  return { ok: true, message: "Check your email to verify your account." };
}

export async function forgotPasswordAction(formData: FormData): Promise<ActionState> {
  await enforceSameOrigin();
  const parsed = forgotPasswordSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Enter a valid email." };
  await enforceRateLimit(userBucket("auth:forgot", parsed.data.email), 4, 3600);

  if (hasSupabaseConfig()) {
    const supabase = await createClient();
    await supabase.auth.resetPasswordForEmail(parsed.data.email, { redirectTo: `${originUrl()}/reset-password` });
    await logSecurityEvent({ email: parsed.data.email, eventType: "password_reset_requested", success: true });
  }
  return { ok: true, message: "If an account exists, a reset link has been sent." };
}

export async function resetPasswordAction(formData: FormData): Promise<ActionState> {
  await enforceSameOrigin();
  const parsed = resetPasswordSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Choose a stronger password." };
  if (!hasSupabaseConfig()) return { ok: false, message: "Supabase is not configured." };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  await logSecurityEvent({ userId: user?.id ?? null, email: user?.email ?? null, eventType: "password_changed", success: !error });
  if (error) return { ok: false, message: error.message };
  return { ok: true, message: "Password updated.", next: "/dashboard" };
}

export async function changePasswordAction(formData: FormData): Promise<ActionState> {
  await enforceSameOrigin();
  const parsed = changePasswordSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Choose a stronger password." };
  if (!hasSupabaseConfig()) return { ok: false, message: "Supabase is not configured." };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return { ok: false, message: "Sign in again before changing your password." };
  const verification = await supabase.auth.signInWithPassword({ email: user.email, password: parsed.data.currentPassword });
  if (verification.error) return { ok: false, message: "Current password is incorrect." };
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  await logSecurityEvent({ userId: user.id, email: user.email, eventType: "password_changed", success: !error });
  if (error) return { ok: false, message: error.message };
  return { ok: true, message: "Password changed." };
}

export async function updateEmailAction(formData: FormData): Promise<ActionState> {
  await enforceSameOrigin();
  const parsed = updateEmailSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Enter a valid email." };
  if (!hasSupabaseConfig()) return { ok: false, message: "Supabase is not configured." };
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { error } = await supabase.auth.updateUser({ email: parsed.data.email }, { emailRedirectTo: `${originUrl()}/auth/callback?next=/settings/profile` });
  await logSecurityEvent({ userId: user?.id ?? null, email: parsed.data.email, eventType: "email_update_requested", success: !error });
  if (error) return { ok: false, message: error.message };
  return { ok: true, message: "Check your new email to confirm the change." };
}

export async function updateEmailFormAction(formData: FormData): Promise<void> {
  await updateEmailAction(formData);
}

export async function changePasswordFormAction(formData: FormData): Promise<void> {
  await changePasswordAction(formData);
}

export async function logoutAction() {
  await enforceSameOrigin();
  if (hasSupabaseConfig()) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.auth.signOut();
    await logSecurityEvent({ userId: user?.id ?? null, email: user?.email ?? null, eventType: "logout", success: true });
  }
  redirect("/login");
}
