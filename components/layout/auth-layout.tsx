import type { ReactNode } from "react";
import Link from "next/link";
import { ThemeToggle } from "@/components/common/theme-toggle";
import { siteConfig } from "@/lib/constants/site";
export function AuthLayout({ children }: { children: ReactNode }) { return <main className="grid min-h-screen place-items-center bg-muted/30 p-6"><div className="absolute left-6 top-6 flex items-center gap-3"><Link className="font-semibold" href="/">{siteConfig.name}</Link><ThemeToggle /></div>{children}</main>; }
