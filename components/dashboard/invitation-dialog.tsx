"use client";

import { inviteMemberAction } from "@/app/actions/workspace";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { RoleSelector } from "@/components/dashboard/role-selector";
import type { Role } from "@/types/rbac";

export function InvitationDialog({ organizationId, roles }: { organizationId: string; roles: Role[] }) {
  return (
    <Dialog>
      <DialogTrigger asChild><Button>Invite member</Button></DialogTrigger>
      <DialogContent>
        <DialogTitle className="text-lg font-semibold">Invite team member</DialogTitle>
        <DialogDescription className="mt-1 text-sm text-muted-foreground">Send a workspace invitation with the selected role.</DialogDescription>
        <form action={inviteMemberAction} className="mt-5 space-y-4">
          <input name="organizationId" type="hidden" value={organizationId} />
          <label className="grid gap-2 text-sm font-medium">Email<Input name="email" required type="email" /></label>
          <RoleSelector roles={roles} />
          <Button type="submit">Create invitation</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
