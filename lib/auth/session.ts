import { redirect } from "next/navigation";
import { cache } from "react";
import { hasSupabaseConfig } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import type { Organization, Profile } from "@/types/database";

export type AuthenticatedUser = {
  id: string;
  email: string | null;
};

export type SessionContext = {
  user: AuthenticatedUser;
  profile: Profile | null;
  activeOrganization: Organization | null;
};

export const getSessionContext = cache(async (): Promise<SessionContext | null> => {
  if (!hasSupabaseConfig()) return null;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
  const activeOrganizationId = profile?.active_organization_id ?? null;
  const { data: activeOrganization } = activeOrganizationId
    ? await supabase.from("organizations").select("*").eq("id", activeOrganizationId).maybeSingle()
    : { data: null };

  return {
    user: { id: user.id, email: user.email ?? null },
    profile: profile ?? null,
    activeOrganization: activeOrganization ?? null,
  };
});

export async function requireUser(next = "/dashboard") {
  const context = await getSessionContext();
  if (!context) redirect(`/login?next=${encodeURIComponent(next)}`);
  return context;
}

export async function requireActiveOrganization(next = "/dashboard") {
  const context = await requireUser(next);
  if (!context.activeOrganization) redirect("/onboarding");
  return { ...context, activeOrganization: context.activeOrganization };
}
