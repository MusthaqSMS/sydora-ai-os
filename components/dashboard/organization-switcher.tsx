"use client";

import { switchOrganizationAction } from "@/app/actions/workspace";
import type { Organization } from "@/types/database";

export function OrganizationSwitcher({ organizations, activeOrganizationId }: { organizations: Organization[]; activeOrganizationId: string | null }) {
  return (
    <form action={switchOrganizationAction}>
      <select aria-label="Switch organization" className="h-9 max-w-48 rounded-md border border-input bg-background px-2 text-sm" defaultValue={activeOrganizationId ?? ""} name="organizationId" onChange={(event) => event.currentTarget.form?.requestSubmit()}>
        {organizations.map((organization) => (
          <option key={organization.id} value={organization.id}>{organization.name}</option>
        ))}
      </select>
    </form>
  );
}
