import type { ReactNode } from "react";
import Link from "next/link";
import { ThemeToggle } from "@/components/common/theme-toggle";
import { Button } from "@/components/ui/button";
import { dashboardNavigation } from "@/lib/constants/navigation";
import { siteConfig } from "@/lib/constants/site";
export function DashboardLayout({ children }: { children: ReactNode }) { return <div className="min-h-screen bg-muted/30"><header className="border-b bg-background"><div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6"><Link className="font-semibold" href="/dashboard">{siteConfig.name}</Link><div className="flex items-center gap-2"><ThemeToggle /><form action="/auth/signout" method="post"><Button size="sm" type="submit" variant="ghost">Sign out</Button></form></div></div></header><div className="mx-auto grid max-w-7xl md:grid-cols-[13rem_1fr]"><aside className="border-r bg-background p-4"><nav aria-label="Dashboard navigation" className="space-y-1">{dashboardNavigation.map(({ href, title }) => <Link className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent" href={href} key={href}>{title}</Link>)}</nav></aside><main className="min-w-0 p-6 md:p-8">{children}</main></div></div>; }
