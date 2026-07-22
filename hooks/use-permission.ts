"use client";

import { can, usePermissionsContext } from "@/contexts/permissions-context";
import type { PermissionKey } from "@/lib/constants/rbac";

export function usePermission(permission: PermissionKey) {
  return can(usePermissionsContext(), permission);
}
