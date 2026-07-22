"use server";

import { createClient } from "@/lib/supabase/server";
import { profileSchema, type ProfileInput } from "@/schemas/profile";
import type { Profile } from "@/types/database";
import { unwrap } from "./service-error";

export async function updateProfile(userId: string, input: ProfileInput): Promise<Profile> {
  const value = profileSchema.parse(input);
  const supabase = await createClient();
  const { data, error } = await supabase.from("profiles").update({
    full_name: value.fullName,
    avatar_url: value.avatarUrl ?? null,
    phone: value.phone ?? null,
    designation: value.designation ?? null,
    department: value.department ?? null,
    skills: value.skills,
    bio: value.bio ?? null,
    language: value.language,
    timezone: value.timezone,
    notification_preferences: {
      email: value.notificationPreferences.email,
      in_app: value.notificationPreferences.inApp,
      marketing: value.notificationPreferences.marketing,
    },
  }).eq("id", userId).select("*").single();
  return unwrap(data, error);
}
