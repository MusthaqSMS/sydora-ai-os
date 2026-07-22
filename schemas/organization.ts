import { z } from "zod";

export const organizationSchema = z.object({
  name: z.string().trim().min(2).max(160),
  slug: z.string().trim().toLowerCase().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(80),
  industry: z.string().trim().max(120).nullable().optional(),
  website: z.url().nullable().optional().or(z.literal("")),
  timezone: z.string().trim().min(1).max(64).default("UTC"),
  country: z.string().trim().max(80).nullable().optional(),
  currency: z.string().trim().length(3).default("USD"),
  businessGoals: z.array(z.string().trim().min(1).max(120)).max(12).default([]),
  logoPath: z.string().trim().max(500).nullable().optional(),
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default("#111827"),
});

export const onboardingSchema = z.object({
  profile: z.object({
    fullName: z.string().trim().min(2).max(120),
    phone: z.string().trim().max(32).nullable().optional(),
    designation: z.string().trim().max(120).nullable().optional(),
  }),
  organization: organizationSchema,
  businessGoals: z.array(z.string().trim().min(1).max(120)).max(12),
});

export type OrganizationInput = z.infer<typeof organizationSchema>;
export type OnboardingInput = z.infer<typeof onboardingSchema>;
