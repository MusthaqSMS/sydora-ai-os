import { redirect } from "next/navigation";
import { ExecutiveDashboard } from "@/components/dashboard/executive-dashboard";
import { requireActiveOrganization } from "@/lib/auth/session";
import { requirePermission } from "@/lib/auth/authorization";
import { getExecutiveDashboard } from "@/services/dashboard.service";

export const metadata = { title: "Executive Dashboard" };
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const context = await requireActiveOrganization("/dashboard");
  await requirePermission(context.activeOrganization.id, "reports.view");
  if (!context.activeOrganization.onboarding_completed_at && context.activeOrganization.onboarding_step < 4) redirect("/onboarding");
  const data = await getExecutiveDashboard(context.activeOrganization.id, context.user.id);
  return <ExecutiveDashboard data={data} />;
}
