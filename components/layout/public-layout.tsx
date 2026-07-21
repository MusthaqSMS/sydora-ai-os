import type { ReactNode } from "react";
export function PublicLayout({ children }: { children: ReactNode }) { return <main className="mx-auto flex min-h-screen max-w-7xl items-center px-6 py-12">{children}</main>; }
