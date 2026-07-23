import { z } from "zod";

export const contactTypeSchema = z.enum(["primary", "billing", "marketing", "technical", "decision_maker", "other"]);

export const clientContactCreateSchema = z.object({
  fullName: z.string().trim().min(2).max(160),
  email: z.string().trim().email().nullable().optional(),
  phone: z.string().trim().max(50).nullable().optional(),
  jobTitle: z.string().trim().max(100).nullable().optional(),
  contactType: contactTypeSchema.default("other"),
  isPrimary: z.boolean().optional(),
});

export const clientContactSchema = clientContactCreateSchema.extend({
  clientId: z.string().uuid(),
});

export const clientContactUpdateSchema = clientContactSchema.extend({
  contactId: z.string().uuid(),
});

export type ClientContactInput = z.infer<typeof clientContactSchema>;
export type ClientContactCreateInput = z.infer<typeof clientContactCreateSchema>;
export type ClientContactUpdateInput = z.infer<typeof clientContactUpdateSchema>;
