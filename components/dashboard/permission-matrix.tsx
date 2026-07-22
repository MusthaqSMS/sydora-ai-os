"use client";

import { permissionActions, permissionModules } from "@/lib/constants/rbac";
import type { PermissionKey } from "@/lib/constants/rbac";

export function PermissionMatrix({ defaultPermissions = [] }: { defaultPermissions?: string[] }) {
  const defaults = new Set(defaultPermissions);
  return (
    <div className="overflow-x-auto rounded-md border">
      <table className="w-full min-w-[760px] text-sm">
        <thead className="bg-muted text-muted-foreground">
          <tr>
            <th className="px-3 py-2 text-left font-medium">Module</th>
            {permissionActions.map((action) => <th className="px-3 py-2 text-left font-medium" key={action}>{action}</th>)}
          </tr>
        </thead>
        <tbody>
          {permissionModules.map((moduleName) => (
            <tr className="border-t" key={moduleName}>
              <td className="px-3 py-2 font-medium capitalize">{moduleName.replace("_", " ")}</td>
              {permissionActions.map((action) => {
                const key = `${moduleName}.${action}` as PermissionKey;
                return (
                  <td className="px-3 py-2" key={key}>
                    <input aria-label={key} className="size-4 rounded border-input" defaultChecked={defaults.has(key)} name="permissions" type="checkbox" value={key} />
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
