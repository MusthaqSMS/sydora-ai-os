import type { PermissionKey, SystemRoleKey } from "@/lib/constants/rbac";

export type Role = {
  id: string;
  organization_id: string;
  name: string;
  description: string | null;
  role_key: SystemRoleKey | string | null;
  is_system: boolean;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  deleted_at: string | null;
};

export type Permission = {
  id: string;
  key: PermissionKey | string;
  description: string | null;
};

export type OrganizationMemberStatus = "active" | "inactive";

export type OrganizationMember = {
  id: string;
  organization_id: string;
  user_id: string;
  role_id: string | null;
  member_role: "owner" | "admin" | "member" | "viewer";
  status: OrganizationMemberStatus;
  invited_by: string | null;
  deactivated_at: string | null;
  deactivated_by: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  deleted_at: string | null;
  profiles?: { full_name: string | null; avatar_url: string | null; email?: string | null } | null;
  roles?: Pick<Role, "id" | "name" | "role_key" | "is_system"> | null;
};

export type InvitationStatus = "pending" | "accepted" | "cancelled" | "expired";

export type OrganizationInvitation = {
  id: string;
  organization_id: string;
  email: string;
  role_id: string;
  token_hash: string;
  status: InvitationStatus;
  expires_at: string;
  accepted_at: string | null;
  accepted_by: string | null;
  invited_by: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  deleted_at: string | null;
  roles?: Pick<Role, "id" | "name" | "role_key"> | null;
};

export type PermissionSnapshot = {
  organizationId: string;
  role: Pick<Role, "id" | "name" | "role_key" | "is_system"> | null;
  permissions: PermissionKey[];
  isOwner: boolean;
  isSuperAdmin: boolean;
};
