import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AppLayout from "@/components/layout/AppLayout";

import DashboardHero from "@/components/dashboard/DashboardHero";
import StatsCards from "@/components/dashboard/StatsCards";
import OverviewChart from "@/components/dashboard/OverviewChart";
import AIAssistant from "@/components/dashboard/AIAssistant";
import QuickActions from "@/components/dashboard/QuickActions";
import ActivityFeed from "@/components/dashboard/ActivityFeed";
import RecentClients from "@/components/dashboard/RecentClients";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <AppLayout>
      <div className="space-y-8">
        <DashboardHero />

        <StatsCards />

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <OverviewChart />
          </div>

          <AIAssistant />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <QuickActions />
          <ActivityFeed />
        </div>

        <RecentClients />
      </div>
    </AppLayout>
  );
}