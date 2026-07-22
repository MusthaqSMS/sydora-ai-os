import { z } from "zod";
export const projectSchema = z.object({ organizationId: z.uuid(), clientId: z.uuid(), name: z.string().trim().min(2).max(160), status: z.enum(["planned", "active", "on_hold", "completed", "cancelled"]).default("planned"), startDate: z.iso.date().nullable().optional(), dueDate: z.iso.date().nullable().optional() }).refine((value) => !value.startDate || !value.dueDate || value.startDate <= value.dueDate, { message: "Due date must follow start date.", path: ["dueDate"] });
export type ProjectInput = z.infer<typeof projectSchema>;
