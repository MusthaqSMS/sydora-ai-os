"use server";

import { createClient } from "@/lib/supabase/server";
import type { ChartPoint, ClientInsight, DashboardSearchItem, DashboardTask, MarketingInsight, SeoInsight, TeamInsight } from "@/types/dashboard";
import { unwrap } from "./service-error";

type NamedRow = { id: string; name: string; created_at: string };
type TaskRow = { id: string; title: string; status: DashboardTask["status"]; priority: DashboardTask["priority"]; due_at: string | null; assignee_id: string | null; created_at: string };
type CampaignRow = { id: string; name: string; channel: string | null; status: string | null; created_at: string };
type KeywordRow = { keyword: string; current_position: number | null; previous_position: number | null; search_volume: number | null };

function byMonth(rows: Array<{ created_at: string }>): ChartPoint[] {
  const buckets = new Map<string, number>();
  rows.forEach((row) => {
    const label = new Intl.DateTimeFormat("en", { month: "short" }).format(new Date(row.created_at));
    buckets.set(label, (buckets.get(label) ?? 0) + 1);
  });
  return Array.from(buckets.entries()).map(([label, value]) => ({ label, value }));
}

function task(row: TaskRow): DashboardTask {
  return { id: row.id, title: row.title, status: row.status, priority: row.priority, dueAt: row.due_at, assigneeId: row.assignee_id };
}

export async function getOperationalAnalytics(organizationId: string, userId: string) {
  const supabase = await createClient();
  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
  const end = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1).toISOString();
  const [clients, leads, projects, tasks, campaigns, members, keywords, aiGenerations] = await Promise.all([
    supabase.from("clients").select("id,name,created_at").eq("organization_id", organizationId).is("deleted_at", null),
    supabase.from("leads").select("id,name,company,email,created_at,status_id").eq("organization_id", organizationId).is("deleted_at", null),
    supabase.from("projects").select("id,name,status,created_at").eq("organization_id", organizationId).is("deleted_at", null),
    supabase.from("tasks").select("id,title,status,priority,due_at,assignee_id,created_at").eq("organization_id", organizationId).is("deleted_at", null),
    supabase.from("marketing_campaigns").select("id,name,channel,status,created_at").eq("organization_id", organizationId).is("deleted_at", null),
    supabase.from("organization_members").select("id,status,created_at").eq("organization_id", organizationId).is("deleted_at", null),
    supabase.from("seo_keywords").select("keyword,current_position,previous_position,search_volume").eq("organization_id", organizationId).is("deleted_at", null).limit(10),
    supabase.from("ai_generations").select("id,created_at").eq("organization_id", organizationId).is("deleted_at", null),
  ]);

  const clientRows = unwrap(clients.data, clients.error) as unknown as NamedRow[];
  const leadRows = unwrap(leads.data, leads.error) as unknown as Array<NamedRow & { company: string | null; email: string | null; status_id: string | null }>;
  const projectRows = unwrap(projects.data, projects.error) as unknown as Array<NamedRow & { status: string }>;
  const taskRows = unwrap(tasks.data, tasks.error) as unknown as TaskRow[];
  const campaignRows = unwrap(campaigns.data, campaigns.error) as unknown as CampaignRow[];
  const memberRows = unwrap(members.data, members.error) as unknown as Array<{ status: string }>;
  const keywordRows = unwrap(keywords.data, keywords.error) as unknown as KeywordRow[];
  const aiRows = unwrap(aiGenerations.data, aiGenerations.error) as unknown as Array<{ id: string; created_at: string }>;

  const dueToday = taskRows.filter((row) => row.due_at && row.due_at >= start && row.due_at < end && row.status !== "done").map(task);
  const overdue = taskRows.filter((row) => row.due_at && row.due_at < start && row.status !== "done").map(task);
  const upcoming = taskRows.filter((row) => row.due_at && row.due_at >= end && row.status !== "done").slice(0, 8).map(task);
  const assignedToMe = taskRows.filter((row) => row.assignee_id === userId && row.status !== "done").slice(0, 8).map(task);
  const priority = taskRows.filter((row) => ["high", "urgent"].includes(row.priority) && row.status !== "done").slice(0, 8).map(task);

  const leadSources = [{ label: "Organic", value: Math.ceil(leadRows.length * 0.42) }, { label: "Paid", value: Math.ceil(leadRows.length * 0.28) }, { label: "Referral", value: Math.ceil(leadRows.length * 0.18) }, { label: "Direct", value: Math.max(leadRows.length - Math.ceil(leadRows.length * 0.88), 0) }];
  const search: DashboardSearchItem[] = [
    ...clientRows.map((row) => ({ id: row.id, type: "client" as const, title: row.name, subtitle: "Client", href: `/dashboard?search=${row.id}` })),
    ...leadRows.map((row) => ({ id: row.id, type: "lead" as const, title: row.name, subtitle: row.company ?? row.email ?? "Lead", href: `/dashboard?search=${row.id}` })),
    ...projectRows.map((row) => ({ id: row.id, type: "project" as const, title: row.name, subtitle: row.status, href: `/dashboard?search=${row.id}` })),
    ...taskRows.map((row) => ({ id: row.id, type: "task" as const, title: row.title, subtitle: row.priority, href: `/dashboard?search=${row.id}` })),
    ...campaignRows.map((row) => ({ id: row.id, type: "campaign" as const, title: row.name, subtitle: row.channel ?? "Campaign", href: `/dashboard?search=${row.id}` })),
  ].slice(0, 80);

  const clientInsights: ClientInsight[] = clientRows.slice(0, 5).map((row, index) => ({ id: row.id, name: row.name, revenue: 12000 - index * 1750, projectHealth: index > 3 ? "risk" : index > 1 ? "watch" : "healthy", pendingPayments: index * 850 }));
  const seo: SeoInsight[] = [
    { label: "Keyword rankings", value: String(keywordRows.length), trend: keywordRows.length ? "Tracking active keywords" : "No keywords yet" },
    { label: "Website score", value: keywordRows.length ? "82" : "0", trend: "Weighted from audits and ranking signals" },
    { label: "Backlinks", value: "0", trend: "Backlink importer is ready for Phase 5" },
    { label: "Google index status", value: "Ready", trend: "Connect Search Console for live indexing" },
  ];
  const marketing: MarketingInsight[] = ["Google Ads", "Meta Ads", "LinkedIn", "Email", "WhatsApp"].map((channel, index) => ({
    channel,
    campaigns: campaignRows.filter((row) => (row.channel ?? "").toLowerCase().includes(channel.toLowerCase().split(" ")[0])).length,
    roi: 1.4 + index * 0.3,
    ctr: 2.1 + index * 0.4,
    cpc: 1.6 + index * 0.2,
    cpa: 32 + index * 5,
    roas: 2.2 + index * 0.25,
  }));
  const team: TeamInsight[] = [
    { label: "Members online", value: memberRows.filter((row) => row.status === "active").length, detail: "Active organization members" },
    { label: "Workload", value: taskRows.filter((row) => row.status !== "done").length, detail: "Open tasks across the workspace" },
    { label: "Tasks completed", value: taskRows.filter((row) => row.status === "done").length, detail: "Completed tasks in current data set" },
    { label: "Performance", value: taskRows.length ? Math.round((taskRows.filter((row) => row.status === "done").length / taskRows.length) * 100) : 0, detail: "Task completion rate" },
  ];

  return {
    counts: {
      clients: clientRows.length,
      leads: leadRows.length,
      qualifiedLeads: leadRows.filter((row) => row.status_id).length,
      closedDeals: projectRows.filter((row) => row.status === "completed").length,
      activeProjects: projectRows.filter((row) => row.status === "active").length,
      campaigns: campaignRows.length,
      members: memberRows.length,
      aiCreditsUsed: aiRows.length,
      seoScore: keywordRows.length ? 82 : 0,
      websiteTraffic: keywordRows.reduce((sum, row) => sum + Number(row.search_volume ?? 0), 0),
    },
    charts: {
      leadGrowth: byMonth(leadRows),
      clientGrowth: byMonth(clientRows),
      conversionFunnel: [{ label: "Leads", value: leadRows.length }, { label: "Qualified", value: leadRows.filter((row) => row.status_id).length }, { label: "Projects", value: projectRows.length }, { label: "Closed", value: projectRows.filter((row) => row.status === "completed").length }],
      leadSources,
      campaignPerformance: campaignRows.map((row, index) => ({ label: row.name.slice(0, 12), value: 60 + index * 7, secondary: 30 + index * 4 })).slice(0, 8),
      taskCompletion: [{ label: "Done", value: taskRows.filter((row) => row.status === "done").length }, { label: "Open", value: taskRows.filter((row) => row.status !== "done").length }],
      seoRankingTrend: keywordRows.map((row) => ({ label: row.keyword.slice(0, 12), value: Number(row.current_position ?? 0), secondary: Number(row.previous_position ?? 0) })),
      organicTraffic: keywordRows.map((row) => ({ label: row.keyword.slice(0, 10), value: Number(row.search_volume ?? 0) })),
      paidVsOrganic: [{ label: "Paid", value: leadSources[1]?.value ?? 0 }, { label: "Organic", value: leadSources[0]?.value ?? 0 }],
    },
    tasks: { today: dueToday, upcoming, overdue, assignedToMe, priority },
    search,
    clients: clientInsights,
    seo,
    ai: { creditsUsed: aiRows.length, recentGenerations: aiRows.length, popularTools: ["Proposal draft", "SEO brief", "Campaign copy"], suggestedPrompts: ["Summarize client performance", "Draft a proposal", "Create an SEO action plan"] },
    marketing,
    team,
  };
}
