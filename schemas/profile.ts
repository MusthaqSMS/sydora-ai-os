import { z } from "zod";

export const profileSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  avatarUrl: z.url().nullable().optional(),
  phone: z.string().trim().max(32).nullable().optional(),
  designation: z.string().trim().max(120).nullable().optional(),
  department: z.string().trim().max(120).nullable().optional(),
  skills: z.array(z.string().trim().min(1).max(40)).max(20).default([]),
  bio: z.string().trim().max(800).nullable().optional(),
  language: z.string().trim().min(2).max(12).default("en"),
  timezone: z.string().trim().min(1).max(64).default("UTC"),
  notificationPreferences: z.object({
    email: z.boolean().default(true),
    inApp: z.boolean().default(true),
    marketing: z.boolean().default(false),
  }).default({ email: true, inApp: true, marketing: false }),
});

export type ProfileInput = z.infer<typeof profileSchema>;
