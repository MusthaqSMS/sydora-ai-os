import { z } from "zod";
export const clientSchema = z.object({
  organizationId: z.uuid(),
  name: z.string().trim().min(2).max(160),
  website: z.url().nullable().optional(),
  industry: z.string().trim().max(100).nullable().optional(),
  lifecycleStatus: z.enum(["active", "inactive", "archived"]).optional(),
});

export const clientUpdateSchema = z.object({
  clientId: z.string().uuid(),
  name: z.string().trim().min(2).max(160),
  website: z.string().trim().optional().nullable(),
  industry: z.string().trim().max(100).nullable().optional(),
  lifecycleStatus: z.enum(["active", "inactive", "archived"]).optional(),
});

export const clientNoteSchema = z.object({
  clientId: z.string().uuid(),
  note: z.string().trim().min(1).max(1000),
});

export type ClientInput = z.infer<typeof clientSchema>;
