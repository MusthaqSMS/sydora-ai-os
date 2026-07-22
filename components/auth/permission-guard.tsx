"use client";

import type { ReactNode } from "react";
import { usePermission } from "@/hooks/use-permission";
import type { PermissionKey } from "@/lib/constants/rbac";

export function PermissionGuard({ permission, children, fallback = null }: { permission: PermissionKey; children: ReactNode; fallback?: ReactNode }) {
  return usePermission(permission) ? <>{children}</> : <>{fallback}</>;
}
