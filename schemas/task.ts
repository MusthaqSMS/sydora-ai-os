import { z } from "zod";
export const taskSchema = z.object({ organizationId: z.uuid(), title: z.string().trim().min(2).max(240), projectId: z.uuid().nullable().optional(), assigneeId: z.uuid().nullable().optional(), description: z.string().trim().max(5000).nullable().optional(), priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"), dueAt: z.iso.datetime().nullable().optional() });
export type TaskInput = z.infer<typeof taskSchema>;
