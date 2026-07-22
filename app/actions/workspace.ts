"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireActiveOrganization, requireUser } from "@/lib/auth/session";
import { requirePermission } from "@/lib/auth/authorization";
import { enforceSameOrigin } from "@/lib/security/request";
import { onboardingSchema, organizationSchema } from "@/schemas/organization";
import { profileSchema } from "@/schemas/profile";
import { invitationSchema, memberStatusSchema, roleSchema } from "@/schemas/rbac";
import { createCustomRole } from "@/services/rbac.service";
import { acceptInvitation, createInvitation, updateMemberStatus } from "@/services/team.service";
import { createOrganization, softDeleteOrganization, switchOrganization, updateOrganization } from "@/services/organization.service";
import { updateProfile } from "@/services/profile.service";

function csv(value: FormDataEntryValue | null) {
  return String(value ?? "").split(",").map((item) => item.trim()).filter(Boolean);
}

export async function completeOnboardingAction(formData: FormData) {
  await enforceSameOrigin();
  const context = await requireUser("/onboarding");
  const parsed = onboardingSchema.parse({
    profile: {
      fullName: formData.get("fullName"),
      phone: formData.get("phone"),
      designation: formData.get("designation"),
    },
    organization: {
      name: formData.get("name"),
      slug: formData.get("slug"),
      industry: formData.get("industry"),
      website: formData.get("website"),
      timezone: formData.get("timezone") || "UTC",
      country: formData.get("country"),
      currency: formData.get("currency") || "USD",
      businessGoals: csv(formData.get("businessGoals")),
      primaryColor: formData.get("primaryColor") || "#111827",
    },
    businessGoals: csv(formData.get("businessGoals")),
  });
  await updateProfile(context.user.id, {
    fullName: parsed.profile.fullName,
    phone: parsed.profile.phone,
    designation: parsed.profile.designation,
    timezone: parsed.organization.timezone,
    skills: [],
    language: "en",
    notificationPreferences: { email: true, inApp: true, marketing: false },
  });
  const organization = await createOrganization({ ...parsed.organization, businessGoals: parsed.businessGoals });
  await updateOrganization(organization.id, { ...parsed.organization, businessGoals: parsed.businessGoals });
  revalidatePath("/dashboard");
  redirect("/dashboard");
}

export async function updateProfileAction(formData: FormData) {
  await enforceSameOrigin();
  const context = await requireUser("/settings/profile");
  const value = profileSchema.parse({
    fullName: formData.get("fullName"),
    avatarUrl: formData.get("avatarUrl") || null,
    phone: formData.get("phone") || null,
    designation: formData.get("designation") || null,
    department: formData.get("department") || null,
    skills: csv(formData.get("skills")),
    bio: formData.get("bio") || null,
    language: formData.get("language") || "en",
    timezone: formData.get("timezone") || "UTC",
    notificationPreferences: {
      email: formData.get("notifyEmail") === "on",
      inApp: formData.get("notifyInApp") === "on",
      marketing: formData.get("notifyMarketing") === "on",
    },
  });
  await updateProfile(context.user.id, value);
  revalidatePath("/settings/profile");
}

export async function updateOrganizationAction(formData: FormData) {
  await enforceSameOrigin();
  const context = await requireActiveOrganization("/settings/organization");
  await requirePermission(context.activeOrganization.id, "organizations.update");
  const value = organizationSchema.parse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    industry: formData.get("industry") || null,
    website: formData.get("website") || null,
    timezone: formData.get("timezone") || "UTC",
    country: formData.get("country") || null,
    currency: formData.get("currency") || "USD",
    businessGoals: csv(formData.get("businessGoals")),
    logoPath: formData.get("logoPath") || null,
    primaryColor: formData.get("primaryColor") || "#111827",
  });
  await updateOrganization(context.activeOrganization.id, value);
  revalidatePath("/settings/organization");
}

export async function deleteOrganizationAction() {
  await enforceSameOrigin();
  const context = await requireActiveOrganization("/settings/organization");
  await requirePermission(context.activeOrganization.id, "organizations.delete");
  await softDeleteOrganization(context.activeOrganization.id);
  revalidatePath("/dashboard");
  redirect("/onboarding");
}

export async function switchOrganizationAction(formData: FormData) {
  await enforceSameOrigin();
  const organizationId = String(formData.get("organizationId") ?? "");
  await switchOrganization(organizationId);
  revalidatePath("/dashboard");
}

export async function inviteMemberAction(formData: FormData) {
  await enforceSameOrigin();
  const parsed = invitationSchema.parse({
    organizationId: formData.get("organizationId"),
    email: formData.get("email"),
    roleId: formData.get("roleId"),
  });
  await requirePermission(parsed.organizationId, "users.invite");
  await createInvitation(parsed);
  revalidatePath("/settings/team");
}

export async function updateMemberStatusAction(formData: FormData) {
  await enforceSameOrigin();
  const parsed = memberStatusSchema.parse({
    memberId: formData.get("memberId"),
    status: formData.get("status"),
  });
  await updateMemberStatus(parsed);
  revalidatePath("/settings/team");
}

export async function createRoleAction(formData: FormData) {
  await enforceSameOrigin();
  const context = await requireActiveOrganization("/settings/roles");
  await requirePermission(context.activeOrganization.id, "roles.create");
  const parsed = roleSchema.parse({
    name: formData.get("name"),
    description: formData.get("description") || null,
    permissions: formData.getAll("permissions"),
  });
  await createCustomRole(context.activeOrganization.id, parsed);
  revalidatePath("/settings/roles");
}

export async function acceptInvitationAction(formData: FormData) {
  await enforceSameOrigin();
  await acceptInvitation({ token: String(formData.get("token") ?? "") });
  revalidatePath("/dashboard");
  redirect("/dashboard");
}
