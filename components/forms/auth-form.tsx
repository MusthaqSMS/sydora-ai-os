"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { forgotPasswordAction, resetPasswordAction, signInAction, signUpAction } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { AuthMode } from "@/types/auth";

const copy: Record<AuthMode, { title: string; submit: string; helper: string }> = {
  "sign-in": { title: "Sign in", submit: "Sign in", helper: "Use your workspace credentials to continue." },
  "sign-up": { title: "Create account", submit: "Create account", helper: "Verify your email before entering a workspace." },
  "forgot-password": { title: "Reset your password", submit: "Send reset link", helper: "A secure reset link will be sent if the account exists." },
  "reset-password": { title: "Choose a new password", submit: "Update password", helper: "Use 12+ characters with uppercase, lowercase, number, and symbol." },
};

export function AuthForm({ mode }: { mode: AuthMode }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const content = copy[mode];

  async function onSubmit(formData: FormData) {
    formData.set("next", searchParams.get("next") ?? "/dashboard");
    setIsSubmitting(true);
    try {
      const result = mode === "sign-in"
        ? await signInAction(formData)
        : mode === "sign-up"
          ? await signUpAction(formData)
          : mode === "forgot-password"
            ? await forgotPasswordAction(formData)
            : await resetPasswordAction(formData);

      if (!result.ok) throw new Error(result.message);
      toast.success(result.message);
      if (result.next) router.replace(result.next);
      else if (mode === "sign-up") router.replace("/login");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to complete this request.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>{content.title}</CardTitle>
        <p className="text-sm text-muted-foreground">{content.helper}</p>
      </CardHeader>
      <CardContent>
        <form action={onSubmit} className="space-y-4">
          {mode === "sign-up" ? (
            <label className="grid gap-2 text-sm font-medium">
              Full name
              <Input autoComplete="name" name="fullName" required />
            </label>
          ) : null}
          {mode !== "reset-password" ? (
            <label className="grid gap-2 text-sm font-medium">
              Email
              <Input autoComplete="email" name="email" required type="email" />
            </label>
          ) : null}
          {mode !== "forgot-password" ? (
            <label className="grid gap-2 text-sm font-medium">
              Password
              <Input autoComplete={mode === "sign-in" ? "current-password" : "new-password"} minLength={mode === "sign-in" ? 1 : 12} name="password" required type="password" />
            </label>
          ) : null}
          {mode === "sign-in" ? (
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <input className="size-4 rounded border-input" defaultChecked name="rememberMe" type="checkbox" value="true" />
              Remember this session
            </label>
          ) : null}
          <Button className="w-full" disabled={isSubmitting} type="submit">
            {isSubmitting ? "Please wait..." : content.submit}
          </Button>
        </form>
        <div className="mt-5 text-center text-sm text-muted-foreground">
          {mode === "sign-in" ? (
            <>
              New to Sydora? <Link className="text-primary hover:underline" href="/signup">Create an account</Link>
              <br />
              <Link className="text-primary hover:underline" href="/forgot-password">Forgot password?</Link>
            </>
          ) : mode === "sign-up" ? (
            <>Already have an account? <Link className="text-primary hover:underline" href="/login">Sign in</Link></>
          ) : (
            <Link className="text-primary hover:underline" href="/login">Back to sign in</Link>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
