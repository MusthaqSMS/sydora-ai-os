import { z } from "zod";
export const profileSchema = z.object({ fullName: z.string().trim().min(2).max(120), avatarUrl: z.url().nullable().optional(), timezone: z.string().trim().min(1).max(64).default("UTC") });
export type ProfileInput = z.infer<typeof profileSchema>;
