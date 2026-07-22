import { InvitationDialog } from "@/components/dashboard/invitation-dialog";
import { MemberTable } from "@/components/dashboard/member-table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireActiveOrganization } from "@/lib/auth/session";
import { listRoles } from "@/services/rbac.service";
import { listInvitations, listMembers } from "@/services/team.service";

export const metadata = { title: "Team" };

export default async function TeamSettingsPage() {
  const { activeOrganization } = await requireActiveOrganization("/settings/team");
  const [members, invitations, roles] = await Promise.all([
    listMembers(activeOrganization.id),
    listInvitations(activeOrganization.id),
    listRoles(activeOrganization.id),
  ]);
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div><h1 className="text-2xl font-semibold">Team management</h1><p className="mt-1 text-sm text-muted-foreground">Invite, deactivate, and reactivate organization members.</p></div>
        <InvitationDialog organizationId={activeOrganization.id} roles={roles} />
      </div>
      <Card><CardHeader><CardTitle>Members</CardTitle></CardHeader><CardContent><MemberTable members={members} /></CardContent></Card>
      <Card><CardHeader><CardTitle>Pending invitations</CardTitle></CardHeader><CardContent className="space-y-2">{invitations.length === 0 ? <p className="text-sm text-muted-foreground">No invitations yet.</p> : invitations.map((invite) => <div className="flex items-center justify-between rounded-md border p-3 text-sm" key={invite.id}><span>{invite.email}</span><Badge variant="outline">{invite.status}</Badge></div>)}</CardContent></Card>
    </div>
  );
}
