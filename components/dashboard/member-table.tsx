"use client";

import { updateMemberStatusAction } from "@/app/actions/workspace";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { OrganizationMember } from "@/types/rbac";

export function MemberTable({ members }: { members: OrganizationMember[] }) {
  return (
    <div className="overflow-x-auto rounded-md border">
      <table className="w-full min-w-[680px] text-sm">
        <thead className="bg-muted text-muted-foreground">
          <tr><th className="px-3 py-2 text-left">User</th><th className="px-3 py-2 text-left">Role</th><th className="px-3 py-2 text-left">Status</th><th className="px-3 py-2 text-right">Actions</th></tr>
        </thead>
        <tbody>
          {members.map((member) => (
            <tr className="border-t" key={member.id}>
              <td className="px-3 py-2 font-medium">{member.user_id}</td>
              <td className="px-3 py-2 capitalize">{member.member_role}</td>
              <td className="px-3 py-2"><Badge variant={member.status === "active" ? "secondary" : "outline"}>{member.status}</Badge></td>
              <td className="px-3 py-2 text-right">
                <form action={updateMemberStatusAction}>
                  <input name="memberId" type="hidden" value={member.id} />
                  <input name="status" type="hidden" value={member.status === "active" ? "inactive" : "active"} />
                  <Button size="sm" type="submit" variant="outline">{member.status === "active" ? "Deactivate" : "Reactivate"}</Button>
                </form>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
