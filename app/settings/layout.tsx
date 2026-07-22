import type { ReactNode } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";

export const dynamic = "force-dynamic";

export default function SettingsLayout({ children }: { children: ReactNode }) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
