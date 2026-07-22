import { z } from "zod";
export const leadSchema = z.object({ organizationId: z.uuid(), name: z.string().trim().min(2).max(160), email: z.email().nullable().optional(), company: z.string().trim().max(160).nullable().optional(), sourceId: z.uuid().nullable().optional(), statusId: z.uuid().nullable().optional(), estimatedValue: z.number().nonnegative().nullable().optional() });
export type LeadInput = z.infer<typeof leadSchema>;
