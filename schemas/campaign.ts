import { z } from "zod";
export const campaignSchema = z.object({ organizationId: z.uuid(), clientId: z.uuid(), name: z.string().trim().min(2).max(160), channel: z.enum(["email", "search", "social", "content", "other"]), startsAt: z.iso.datetime().nullable().optional(), endsAt: z.iso.datetime().nullable().optional() }).refine((value) => !value.startsAt || !value.endsAt || value.startsAt <= value.endsAt, { message: "End date must follow start date.", path: ["endsAt"] });
export type CampaignInput = z.infer<typeof campaignSchema>;
