export type DateRangeKey = "7d" | "30d" | "90d" | "12m";

export type DashboardKpiKey =
  | "totalClients"
  | "activeProjects"
  | "leads"
  | "qualifiedLeads"
  | "closedDeals"
  | "revenue"
  | "outstandingPayments"
  | "marketingCampaigns"
  | "websiteTraffic"
  | "seoScore"
  | "tasksDueToday"
  | "overdueTasks"
  | "aiCreditsUsed"
  | "organizationMembers";

export type DashboardKpi = {
  key: DashboardKpiKey;
  label: string;
  value: string;
  trend: string;
  tone: "neutral" | "good" | "warning" | "danger";
};

export type ChartPoint = {
  label: string;
  value: number;
  secondary?: number;
};

export type FunnelStage = {
  label: string;
  value: number;
};

export type ActivityTimelineItem = {
  id: string;
  action: string;
  entityType: string;
  entityId: string | null;
  createdAt: string;
  metadata: Record<string, unknown>;
};

export type DashboardTask = {
  id: string;
  title: string;
  status: "todo" | "in_progress" | "blocked" | "done";
  priority: "low" | "medium" | "high" | "urgent";
  dueAt: string | null;
  assigneeId: string | null;
};

export type DashboardNotification = {
  id: string;
  title: string;
  body: string | null;
  type: string;
  readAt: string | null;
  createdAt: string;
};

export type DashboardSearchItem = {
  id: string;
  type: "client" | "lead" | "project" | "task" | "invoice" | "seo" | "campaign";
  title: string;
  subtitle: string;
  href: string;
};

export type ClientInsight = {
  id: string;
  name: string;
  revenue: number;
  projectHealth: "healthy" | "watch" | "risk";
  pendingPayments: number;
};

export type SeoInsight = {
  label: string;
  value: string;
  trend: string;
};

export type AiInsight = {
  creditsUsed: number;
  recentGenerations: number;
  popularTools: string[];
  suggestedPrompts: string[];
};

export type MarketingInsight = {
  channel: string;
  campaigns: number;
  roi: number;
  ctr: number;
  cpc: number;
  cpa: number;
  roas: number;
};

export type TeamInsight = {
  label: string;
  value: number;
  detail: string;
};

export type DashboardCharts = {
  revenueTrend: ChartPoint[];
  leadGrowth: ChartPoint[];
  conversionFunnel: FunnelStage[];
  leadSources: ChartPoint[];
  campaignPerformance: ChartPoint[];
  monthlySales: ChartPoint[];
  taskCompletion: ChartPoint[];
  seoRankingTrend: ChartPoint[];
  organicTraffic: ChartPoint[];
  paidVsOrganic: ChartPoint[];
  clientGrowth: ChartPoint[];
  invoicesStatus: ChartPoint[];
};

export type ExecutiveDashboardData = {
  organizationId: string;
  generatedAt: string;
  kpis: DashboardKpi[];
  charts: DashboardCharts;
  activity: ActivityTimelineItem[];
  tasks: {
    today: DashboardTask[];
    upcoming: DashboardTask[];
    overdue: DashboardTask[];
    assignedToMe: DashboardTask[];
    priority: DashboardTask[];
  };
  notifications: DashboardNotification[];
  search: DashboardSearchItem[];
  clients: ClientInsight[];
  seo: SeoInsight[];
  ai: AiInsight;
  marketing: MarketingInsight[];
  team: TeamInsight[];
};
