"use server";

import { getRecentActivity } from "@/services/activity.service";
import { getOperationalAnalytics } from "@/services/analytics.service";
import { getNotifications } from "@/services/notification.service";
import { getRevenueAnalytics } from "@/services/revenue.service";
import type { DashboardKpi, ExecutiveDashboardData } from "@/types/dashboard";
import type { EntityId } from "@/types/database";

function money(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
}

function number(value: number) {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(value);
}

function kpi(key: DashboardKpi["key"], label: string, value: string, trend: string, tone: DashboardKpi["tone"] = "neutral"): DashboardKpi {
  return { key, label, value, trend, tone };
}

export async function getExecutiveDashboard(organizationId: EntityId, userId: EntityId): Promise<ExecutiveDashboardData> {
  const [operations, revenue, notifications, activity] = await Promise.all([
    getOperationalAnalytics(organizationId, userId),
    getRevenueAnalytics(organizationId),
    getNotifications(organizationId),
    getRecentActivity(organizationId),
  ]);

  return {
    organizationId,
    generatedAt: new Date().toISOString(),
    kpis: [
      kpi("totalClients", "Total clients", number(operations.counts.clients), "All active client records"),
      kpi("activeProjects", "Active projects", number(operations.counts.activeProjects), "Projects currently in flight", "good"),
      kpi("leads", "Leads", number(operations.counts.leads), "Total lead pipeline"),
      kpi("qualifiedLeads", "Qualified leads", number(operations.counts.qualifiedLeads), "Leads with a status path", "good"),
      kpi("closedDeals", "Closed deals", number(operations.counts.closedDeals), "Completed project wins", "good"),
      kpi("revenue", "Revenue", money(revenue.revenue), "Recognized from payments", "good"),
      kpi("outstandingPayments", "Outstanding payments", money(revenue.outstanding), "Invoices not marked paid", revenue.outstanding > 0 ? "warning" : "good"),
      kpi("marketingCampaigns", "Marketing campaigns", number(operations.counts.campaigns), "Active and historical campaigns"),
      kpi("websiteTraffic", "Website traffic", number(operations.counts.websiteTraffic), "Estimated SEO search volume"),
      kpi("seoScore", "SEO score", number(operations.counts.seoScore), "Composite readiness score", operations.counts.seoScore > 70 ? "good" : "warning"),
      kpi("tasksDueToday", "Tasks due today", number(operations.tasks.today.length), "Open work due today", operations.tasks.today.length ? "warning" : "good"),
      kpi("overdueTasks", "Overdue tasks", number(operations.tasks.overdue.length), "Needs attention", operations.tasks.overdue.length ? "danger" : "good"),
      kpi("aiCreditsUsed", "AI credits used", number(operations.counts.aiCreditsUsed), "Generation records this period"),
      kpi("organizationMembers", "Organization members", number(operations.counts.members), "Workspace users"),
    ],
    charts: {
      revenueTrend: revenue.trend,
      leadGrowth: operations.charts.leadGrowth,
      conversionFunnel: operations.charts.conversionFunnel,
      leadSources: operations.charts.leadSources,
      campaignPerformance: operations.charts.campaignPerformance,
      monthlySales: revenue.trend,
      taskCompletion: operations.charts.taskCompletion,
      seoRankingTrend: operations.charts.seoRankingTrend,
      organicTraffic: operations.charts.organicTraffic,
      paidVsOrganic: operations.charts.paidVsOrganic,
      clientGrowth: operations.charts.clientGrowth,
      invoicesStatus: revenue.invoicesStatus,
    },
    activity,
    tasks: operations.tasks,
    notifications,
    search: operations.search,
    clients: operations.clients,
    seo: operations.seo,
    ai: operations.ai,
    marketing: operations.marketing,
    team: operations.team,
  };
}
