import { z } from "zod";
export const organizationSchema = z.object({ name: z.string().trim().min(2).max(160), slug: z.string().trim().toLowerCase().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(80) });
export type OrganizationInput = z.infer<typeof organizationSchema>;
