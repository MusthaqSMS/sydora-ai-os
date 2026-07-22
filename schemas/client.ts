import { z } from "zod";
export const clientSchema = z.object({ organizationId: z.uuid(), name: z.string().trim().min(2).max(160), website: z.url().nullable().optional(), industry: z.string().trim().max(100).nullable().optional() });
export type ClientInput = z.infer<typeof clientSchema>;
