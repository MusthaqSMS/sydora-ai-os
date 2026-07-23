import { z } from "zod";

export const leadSchema = z.object({
  organizationId: z.uuid(),
  clientId: z.string().uuid().nullable().optional(),
  name: z.string().trim().min(2).max(160),
  email: z.string().trim().email().nullable().optional(),
  company: z.string().trim().max(160).nullable().optional(),
  sourceId: z.string().uuid().nullable().optional(),
  statusId: z.string().uuid().nullable().optional(),
  estimatedValue: z.number().nonnegative().nullable().optional(),
});

export const leadNoteSchema = z.object({
  leadId: z.string().uuid(),
  note: z.string().trim().min(1).max(1000),
});

export const leadActivitySchema = z.object({
  leadId: z.string().uuid(),
  activityType: z.string().trim().min(2).max(100),
  occurredAt: z.string().datetime(),
  metadataNote: z.string().trim().max(1000).nullable().optional(),
});

export type LeadInput = z.infer<typeof leadSchema>;
export type LeadNoteInput = z.infer<typeof leadNoteSchema>;
export type LeadActivityInput = z.infer<typeof leadActivitySchema>;
