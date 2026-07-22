import { z } from "zod";
import { permissionActions, permissionModules } from "@/lib/constants/rbac";

export const permissionKeySchema = z.string().refine((value) => {
  const [moduleName, actionName] = value.split(".");
  return permissionModules.includes(moduleName as never) && permissionActions.includes(actionName as never);
}, "Invalid permission key.");

export const roleSchema = z.object({
  name: z.string().trim().min(2).max(80),
  description: z.string().trim().max(240).nullable().optional(),
  permissions: z.array(permissionKeySchema).default([]),
});

export const invitationSchema = z.object({
  organizationId: z.uuid(),
  email: z.email().transform((email) => email.toLowerCase()),
  roleId: z.uuid(),
});

export const invitationTokenSchema = z.object({
  token: z.string().min(24).max(256),
});

export const memberStatusSchema = z.object({
  memberId: z.uuid(),
  status: z.enum(["active", "inactive"]),
});

export type RoleInput = z.infer<typeof roleSchema>;
export type InvitationInput = z.infer<typeof invitationSchema>;
export type InvitationTokenInput = z.infer<typeof invitationTokenSchema>;
export type MemberStatusInput = z.infer<typeof memberStatusSchema>;
