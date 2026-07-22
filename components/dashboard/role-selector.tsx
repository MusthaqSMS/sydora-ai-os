"use client";

import type { Role } from "@/types/rbac";

export function RoleSelector({ roles, name = "roleId", defaultValue }: { roles: Role[]; name?: string; defaultValue?: string }) {
  return (
    <label className="grid gap-2 text-sm font-medium">
      Role
      <select className="h-10 rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring" defaultValue={defaultValue ?? roles[0]?.id} name={name} required>
        {roles.map((role) => (
          <option key={role.id} value={role.id}>{role.name}</option>
        ))}
      </select>
    </label>
  );
}
