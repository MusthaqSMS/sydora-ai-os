import { createRoleAction } from "@/app/actions/workspace";
import { PermissionMatrix } from "@/components/dashboard/permission-matrix";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { requireActiveOrganization } from "@/lib/auth/session";
import { listRoles } from "@/services/rbac.service";

export const metadata = { title: "Roles" };

export default async function RoleSettingsPage() {
  const { activeOrganization } = await requireActiveOrganization("/settings/roles");
  const roles = await listRoles(activeOrganization.id);
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-semibold">Roles and permissions</h1><p className="mt-1 text-sm text-muted-foreground">System roles are provisioned per organization; custom roles can be added with granular permissions.</p></div>
      <Card><CardHeader><CardTitle>Available roles</CardTitle></CardHeader><CardContent className="grid gap-3 md:grid-cols-2">{roles.map((role) => <div className="rounded-md border p-3" key={role.id}><div className="flex items-center justify-between gap-2"><span className="font-medium">{role.name}</span><Badge variant={role.is_system ? "secondary" : "outline"}>{role.is_system ? "System" : "Custom"}</Badge></div><p className="mt-1 text-sm text-muted-foreground">{role.description}</p></div>)}</CardContent></Card>
      <Card><CardHeader><CardTitle>Create custom role</CardTitle></CardHeader><CardContent><form action={createRoleAction} className="space-y-4"><div className="grid gap-4 md:grid-cols-2"><label className="grid gap-2 text-sm font-medium">Name<Input name="name" required /></label><label className="grid gap-2 text-sm font-medium">Description<Input name="description" /></label></div><PermissionMatrix /><Button type="submit">Create role</Button></form></CardContent></Card>
    </div>
  );
}
