import type { ReactNode } from "react";
import Link from "next/link";
import { ThemeToggle } from "@/components/common/theme-toggle";
import { OrganizationSwitcher } from "@/components/dashboard/organization-switcher";
import { UserMenu } from "@/components/dashboard/user-menu";
import { PermissionsProvider } from "@/contexts/permissions-context";
import { requireUser } from "@/lib/auth/session";
import { dashboardNavigation } from "@/lib/constants/navigation";
import { siteConfig } from "@/lib/constants/site";
import { listOrganizationsForUser } from "@/services/organization.service";
import { getPermissionSnapshot } from "@/services/rbac.service";

export async function DashboardLayout({ children }: { children: ReactNode }) {
  const context = await requireUser("/dashboard");
  const organizations = await listOrganizationsForUser(context.user.id);
  const snapshot = context.activeOrganization ? await getPermissionSnapshot(context.user.id, context.activeOrganization.id) : null;
  const displayName = context.profile?.full_name ?? context.user.email ?? "Account";

  return (
    <PermissionsProvider value={snapshot}>
      <div className="min-h-screen bg-muted/30">
        <header className="border-b bg-background">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
            <div className="flex items-center gap-4">
              <Link className="font-semibold" href="/dashboard">{siteConfig.name}</Link>
              {organizations.length > 0 ? <OrganizationSwitcher activeOrganizationId={context.activeOrganization?.id ?? null} organizations={organizations} /> : null}
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <UserMenu email={context.user.email} name={displayName} />
            </div>
          </div>
        </header>
        <div className="mx-auto grid max-w-7xl md:grid-cols-[13rem_1fr]">
          <aside className="border-r bg-background p-4">
            <nav aria-label="Dashboard navigation" className="space-y-1">
              {dashboardNavigation.map(({ href, title }) => <Link className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent" href={href} key={href}>{title}</Link>)}
            </nav>
          </aside>
          <main className="min-w-0 p-6 md:p-8">{children}</main>
        </div>
      </div>
    </PermissionsProvider>
  );
}
