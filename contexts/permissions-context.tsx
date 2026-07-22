"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { PermissionKey } from "@/lib/constants/rbac";
import type { PermissionSnapshot } from "@/types/rbac";

const PermissionsContext = createContext<PermissionSnapshot | null>(null);

export function PermissionsProvider({ value, children }: { value: PermissionSnapshot | null; children: ReactNode }) {
  return <PermissionsContext.Provider value={value}>{children}</PermissionsContext.Provider>;
}

export function usePermissionsContext() {
  return useContext(PermissionsContext);
}

export function can(snapshot: PermissionSnapshot | null, permission: PermissionKey) {
  return Boolean(snapshot?.isSuperAdmin || snapshot?.isOwner || snapshot?.permissions.includes(permission));
}
