"use server";

import { createHash, randomBytes } from "node:crypto";
import { createClient } from "@/lib/supabase/server";
import { callRpc } from "@/services/rpc";
import { invitationSchema, invitationTokenSchema, memberStatusSchema, type InvitationInput, type InvitationTokenInput, type MemberStatusInput } from "@/schemas/rbac";
import type { OrganizationInvitation, OrganizationMember } from "@/types/rbac";
import { unwrap } from "./service-error";

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function createInvitation(input: InvitationInput): Promise<{ invitation: OrganizationInvitation; token: string }> {
  const value = invitationSchema.parse(input);
  const token = randomBytes(32).toString("base64url");
  const supabase = await createClient();
  const { data, error } = await callRpc(supabase, "create_invitation", {
    p_organization_id: value.organizationId,
    p_email: value.email,
    p_role_id: value.roleId,
    p_token_hash: hashToken(token),
  });
  return { invitation: unwrap(data, error) as OrganizationInvitation, token };
}

export async function acceptInvitation(input: InvitationTokenInput): Promise<OrganizationMember> {
  const value = invitationTokenSchema.parse(input);
  const supabase = await createClient();
  const { data, error } = await callRpc(supabase, "accept_invitation", { p_token_hash: hashToken(value.token) });
  return unwrap(data, error) as OrganizationMember;
}

export async function listMembers(organizationId: string): Promise<OrganizationMember[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("organization_members").select("*").eq("organization_id", organizationId).is("deleted_at", null).order("created_at");
  return unwrap(data, error) as OrganizationMember[];
}

export async function listInvitations(organizationId: string): Promise<OrganizationInvitation[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("organization_invitations").select("*").eq("organization_id", organizationId).is("deleted_at", null).order("created_at", { ascending: false });
  return unwrap(data, error) as OrganizationInvitation[];
}

export async function updateMemberStatus(input: MemberStatusInput): Promise<OrganizationMember> {
  const value = memberStatusSchema.parse(input);
  const supabase = await createClient();
  const { data, error } = await callRpc(supabase, "update_member_status", { p_member_id: value.memberId, p_status: value.status });
  return unwrap(data, error) as OrganizationMember;
}
