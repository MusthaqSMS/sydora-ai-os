"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { requestPasswordReset, resetPassword, signIn, signUp } from "@/services/auth.service";
import { forgotPasswordSchema, resetPasswordSchema, signInSchema, signUpSchema } from "@/schemas/auth";
import type { AuthMode } from "@/types/auth";

const copy: Record<AuthMode, { title: string; submit: string; helper: string }> = {
  "sign-in": { title: "Sign in", submit: "Sign in", helper: "Use your workspace credentials to continue." },
  "sign-up": { title: "Create account", submit: "Create account", helper: "Create your account to access Sydora." },
  "forgot-password": { title: "Reset your password", submit: "Send reset link", helper: "We will send a secure reset link to your email." },
  "reset-password": { title: "Choose a new password", submit: "Update password", helper: "Choose a password with at least 8 characters." },
};

export function AuthForm({ mode }: { mode: AuthMode }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const content = copy[mode];
  async function onSubmit(formData: FormData) {
    const data = Object.fromEntries(formData);
    setIsSubmitting(true);
    try {
      let result;
      if (mode === "sign-in") {
        const parsed = signInSchema.safeParse(data);
        if (!parsed.success) throw new Error(z.prettifyError(parsed.error));
        result = await signIn(parsed.data);
      } else if (mode === "sign-up") {
        const parsed = signUpSchema.safeParse(data);
        if (!parsed.success) throw new Error(z.prettifyError(parsed.error));
        result = await signUp(parsed.data);
      } else if (mode === "forgot-password") {
        const parsed = forgotPasswordSchema.safeParse(data);
        if (!parsed.success) throw new Error(z.prettifyError(parsed.error));
        result = await requestPasswordReset(parsed.data);
      } else {
        const parsed = resetPasswordSchema.safeParse(data);
        if (!parsed.success) throw new Error(z.prettifyError(parsed.error));
        result = await resetPassword(parsed.data);
      }
      if (result.error) throw result.error;
      if (mode === "sign-in") router.replace(searchParams.get("next") ?? "/dashboard");
      else if (mode === "sign-up") { toast.success("Check your email to confirm your account."); router.replace("/login"); }
      else if (mode === "forgot-password") toast.success("If an account exists, a reset link has been sent.");
      else { toast.success("Password updated."); router.replace("/dashboard"); }
    } catch (error) { toast.error(error instanceof Error ? error.message : "Unable to complete this request."); }
    finally { setIsSubmitting(false); }
  }

  return <Card className="w-full max-w-md"><CardHeader><CardTitle>{content.title}</CardTitle><p className="text-sm text-muted-foreground">{content.helper}</p></CardHeader><CardContent><form action={onSubmit} className="space-y-4">{mode === "sign-up" && <label className="grid gap-2 text-sm font-medium">Full name<Input autoComplete="name" name="fullName" required /></label>}{mode !== "reset-password" && <label className="grid gap-2 text-sm font-medium">Email<Input autoComplete="email" name="email" required type="email" /></label>}{mode !== "forgot-password" && <label className="grid gap-2 text-sm font-medium">Password<Input autoComplete={mode === "sign-in" ? "current-password" : "new-password"} minLength={8} name="password" required type="password" /></label>}<Button className="w-full" disabled={isSubmitting} type="submit">{isSubmitting ? "Please wait…" : content.submit}</Button></form><div className="mt-5 text-center text-sm text-muted-foreground">{mode === "sign-in" ? <>New to Sydora? <Link className="text-primary hover:underline" href="/signup">Create an account</Link><br /><Link className="text-primary hover:underline" href="/forgot-password">Forgot password?</Link></> : mode === "sign-up" ? <>Already have an account? <Link className="text-primary hover:underline" href="/login">Sign in</Link></> : <Link className="text-primary hover:underline" href="/login">Back to sign in</Link>}</div></CardContent></Card>;
}
