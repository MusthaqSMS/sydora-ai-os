"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { markAllNotificationsReadAction, markNotificationReadAction, quickCompleteTaskAction } from "@/app/actions/dashboard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboardRealtime } from "@/hooks/use-dashboard-realtime";
import type { DashboardKpi, ExecutiveDashboardData } from "@/types/dashboard";

const DashboardCharts = dynamic(() => import("@/components/dashboard/dashboard-charts").then((mod) => mod.DashboardCharts), {
  loading: () => <div className="grid gap-4 xl:grid-cols-3">{Array.from({ length: 6 }, (_, index) => <Skeleton className="h-72" key={index} />)}</div>,
});

type WidgetId = "charts" | "activity" | "tasks" | "notifications" | "clients" | "seo" | "ai" | "marketing" | "team";

const defaultLayout: WidgetId[] = ["charts", "tasks", "notifications", "activity", "clients", "seo", "ai", "marketing", "team"];
const widgetLabels: Record<WidgetId, string> = {
  charts: "Charts",
  activity: "Recent activity",
  tasks: "Task center",
  notifications: "Notification center",
  clients: "Client insights",
  seo: "SEO insights",
  ai: "AI dashboard",
  marketing: "Marketing overview",
  team: "Team dashboard",
};

function toneClass(tone: DashboardKpi["tone"]) {
  if (tone === "good") return "border-emerald-200 bg-emerald-50 text-emerald-950 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-100";
  if (tone === "warning") return "border-amber-200 bg-amber-50 text-amber-950 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-100";
  if (tone === "danger") return "border-red-200 bg-red-50 text-red-950 dark:border-red-900 dark:bg-red-950/30 dark:text-red-100";
  return "border-border bg-card";
}

function useSavedLayout(organizationId: string) {
  const key = `sydora.dashboard.layout.${organizationId}`;
  const [layout, setLayout] = useState<WidgetId[]>(() => {
    if (typeof window === "undefined") return defaultLayout;
    const saved = window.localStorage.getItem(key);
    if (!saved) return defaultLayout;
    const parsed = JSON.parse(saved) as WidgetId[];
    return parsed.filter((item) => defaultLayout.includes(item));
  });
  function save(next: WidgetId[]) {
    setLayout(next);
    window.localStorage.setItem(key, JSON.stringify(next));
  }
  return { layout, save };
}

function move(layout: WidgetId[], id: WidgetId, direction: -1 | 1) {
  const index = layout.indexOf(id);
  const target = index + direction;
  if (index < 0 || target < 0 || target >= layout.length) return layout;
  const next = [...layout];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}

function KpiStrip({ kpis }: { kpis: DashboardKpi[] }) {
  return <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-7">{kpis.map((item) => <div className={`rounded-md border p-3 ${toneClass(item.tone)}`} key={item.key}><p className="text-xs font-medium uppercase text-muted-foreground">{item.label}</p><p className="mt-2 text-2xl font-semibold">{item.value}</p><p className="mt-1 text-xs text-muted-foreground">{item.trend}</p></div>)}</div>;
}

function SearchAndFilters({ data }: { data: ExecutiveDashboardData }) {
  const [query, setQuery] = useState("");
  const results = useMemo(() => data.search.filter((item) => `${item.title} ${item.subtitle} ${item.type}`.toLowerCase().includes(query.toLowerCase())).slice(0, 8), [data.search, query]);
  return (
    <Card>
      <CardContent className="grid gap-3 p-4 lg:grid-cols-[1fr_10rem_10rem_10rem]">
        <div className="relative">
          <Input onChange={(event) => setQuery(event.target.value)} placeholder="Search clients, projects, leads, tasks, invoices, SEO projects, campaigns" value={query} />
          {query ? <div className="absolute left-0 right-0 top-12 z-20 rounded-md border bg-popover p-2 shadow-lg">{results.length ? results.map((item) => <a className="block rounded-sm px-2 py-1.5 text-sm hover:bg-accent" href={item.href} key={`${item.type}-${item.id}`}><span className="font-medium">{item.title}</span><span className="ml-2 text-muted-foreground">{item.subtitle}</span></a>) : <p className="px-2 py-1.5 text-sm text-muted-foreground">No matching records.</p>}</div> : null}
        </div>
        <select className="h-10 rounded-md border bg-background px-3 text-sm"><option>Last 30 days</option><option>Last 7 days</option><option>Last 90 days</option><option>Last 12 months</option></select>
        <select className="h-10 rounded-md border bg-background px-3 text-sm"><option>All clients</option></select>
        <select className="h-10 rounded-md border bg-background px-3 text-sm"><option>All team members</option></select>
      </CardContent>
    </Card>
  );
}

function WidgetControls({ layout, save }: { layout: WidgetId[]; save: (layout: WidgetId[]) => void }) {
  return (
    <Card>
      <CardHeader><CardTitle>Customize dashboard</CardTitle></CardHeader>
      <CardContent className="grid gap-2 md:grid-cols-3">
        {defaultLayout.map((id) => {
          const visible = layout.includes(id);
          return <div className="flex items-center justify-between gap-2 rounded-md border p-2" key={id}><span className="text-sm font-medium">{widgetLabels[id]}</span><div className="flex gap-1"><Button onClick={() => save(move(layout, id, -1))} size="sm" type="button" variant="outline">Up</Button><Button onClick={() => save(move(layout, id, 1))} size="sm" type="button" variant="outline">Down</Button><Button onClick={() => save(visible ? layout.filter((item) => item !== id) : [...layout, id])} size="sm" type="button" variant={visible ? "secondary" : "outline"}>{visible ? "Hide" : "Show"}</Button></div></div>;
        })}
      </CardContent>
    </Card>
  );
}

function TaskCenter({ data }: { data: ExecutiveDashboardData }) {
  const rows = [...data.tasks.overdue, ...data.tasks.today, ...data.tasks.priority, ...data.tasks.assignedToMe, ...data.tasks.upcoming].filter((task, index, all) => all.findIndex((item) => item.id === task.id) === index).slice(0, 12);
  return <Card><CardHeader><CardTitle>Task center</CardTitle></CardHeader><CardContent className="space-y-2">{rows.length ? rows.map((task) => <div className="flex items-center justify-between gap-3 rounded-md border p-3" key={task.id}><div><p className="text-sm font-medium">{task.title}</p><p className="text-xs text-muted-foreground">{task.priority} priority {task.dueAt ? `- due ${new Date(task.dueAt).toLocaleDateString()}` : ""}</p></div><form action={quickCompleteTaskAction}><input name="taskId" type="hidden" value={task.id} /><Button size="sm" type="submit" variant="outline">Complete</Button></form></div>) : <p className="text-sm text-muted-foreground">No active tasks in the current filters.</p>}</CardContent></Card>;
}

function NotificationCenter({ data }: { data: ExecutiveDashboardData }) {
  const unread = data.notifications.filter((item) => !item.readAt).length;
  return <Card><CardHeader><div className="flex items-center justify-between gap-3"><CardTitle>Notification center</CardTitle><form action={markAllNotificationsReadAction}><Button disabled={!unread} size="sm" type="submit" variant="outline">Mark all read</Button></form></div></CardHeader><CardContent className="space-y-2">{data.notifications.length ? data.notifications.map((item) => <div className="flex items-start justify-between gap-3 rounded-md border p-3" key={item.id}><div><div className="flex items-center gap-2"><p className="text-sm font-medium">{item.title}</p>{item.readAt ? null : <Badge>Unread</Badge>}</div><p className="text-xs text-muted-foreground">{item.body ?? item.type}</p></div><form action={markNotificationReadAction}><input name="notificationId" type="hidden" value={item.id} /><Button disabled={Boolean(item.readAt)} size="sm" type="submit" variant="ghost">Read</Button></form></div>) : <p className="text-sm text-muted-foreground">No notifications yet.</p>}</CardContent></Card>;
}

function Activity({ data }: { data: ExecutiveDashboardData }) {
  return <Card><CardHeader><CardTitle>Recent activity</CardTitle></CardHeader><CardContent className="space-y-3">{data.activity.length ? data.activity.map((item) => <div className="border-l-2 border-primary pl-3" key={item.id}><p className="text-sm font-medium">{item.action.replace(".", " ")}</p><p className="text-xs text-muted-foreground">{item.entityType} - {new Date(item.createdAt).toLocaleString()}</p></div>) : <p className="text-sm text-muted-foreground">Activity logs will appear as workspace events occur.</p>}</CardContent></Card>;
}

function InsightPanels({ data, widget }: { data: ExecutiveDashboardData; widget: WidgetId }) {
  if (widget === "clients") return <Card><CardHeader><CardTitle>Client insights</CardTitle></CardHeader><CardContent className="space-y-2">{data.clients.map((client) => <div className="flex justify-between rounded-md border p-3 text-sm" key={client.id}><span>{client.name}</span><span>{client.projectHealth} - ${client.pendingPayments}</span></div>)}</CardContent></Card>;
  if (widget === "seo") return <Card><CardHeader><CardTitle>SEO insights</CardTitle></CardHeader><CardContent className="grid gap-3 md:grid-cols-2">{data.seo.map((item) => <div className="rounded-md border p-3" key={item.label}><p className="text-sm text-muted-foreground">{item.label}</p><p className="text-xl font-semibold">{item.value}</p><p className="text-xs text-muted-foreground">{item.trend}</p></div>)}</CardContent></Card>;
  if (widget === "ai") return <Card><CardHeader><CardTitle>AI dashboard</CardTitle></CardHeader><CardContent className="grid gap-4 md:grid-cols-3"><div><p className="text-2xl font-semibold">{data.ai.creditsUsed}</p><p className="text-sm text-muted-foreground">AI credits used</p></div><div><p className="text-sm font-medium">Popular tools</p><p className="text-sm text-muted-foreground">{data.ai.popularTools.join(", ")}</p></div><div><p className="text-sm font-medium">Suggested prompts</p><p className="text-sm text-muted-foreground">{data.ai.suggestedPrompts.join(", ")}</p></div></CardContent></Card>;
  if (widget === "marketing") return <Card><CardHeader><CardTitle>Marketing overview</CardTitle></CardHeader><CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">{data.marketing.map((item) => <div className="rounded-md border p-3" key={item.channel}><p className="font-medium">{item.channel}</p><p className="text-xs text-muted-foreground">ROI {item.roi.toFixed(1)}x - CTR {item.ctr.toFixed(1)}%</p><p className="text-xs text-muted-foreground">CPC ${item.cpc.toFixed(2)} - CPA ${item.cpa.toFixed(0)} - ROAS {item.roas.toFixed(1)}x</p></div>)}</CardContent></Card>;
  return <Card><CardHeader><CardTitle>Team dashboard</CardTitle></CardHeader><CardContent className="grid gap-3 md:grid-cols-4">{data.team.map((item) => <div className="rounded-md border p-3" key={item.label}><p className="text-sm text-muted-foreground">{item.label}</p><p className="text-2xl font-semibold">{item.value}</p><p className="text-xs text-muted-foreground">{item.detail}</p></div>)}</CardContent></Card>;
}

function QuickActions() {
  const actions = ["Create client", "Create lead", "Create project", "Create task", "Generate proposal", "Run website audit", "Generate AI content", "Create campaign", "Send invoice"];
  return <div className="fixed bottom-5 right-5 z-30 rounded-md border bg-background p-2 shadow-lg"><div className="grid gap-1">{actions.map((action) => <Button key={action} size="sm" type="button" variant="ghost">{action}</Button>)}</div></div>;
}

export function ExecutiveDashboard({ data }: { data: ExecutiveDashboardData }) {
  const { layout, save } = useSavedLayout(data.organizationId);
  const { lastEventAt } = useDashboardRealtime(data.organizationId);
  return (
    <div className="space-y-5 pb-24">
      <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-end">
        <div><h1 className="text-2xl font-semibold">Executive dashboard</h1><p className="mt-1 text-sm text-muted-foreground">Live business intelligence across revenue, delivery, marketing, SEO, AI, and team operations.</p></div>
        <div className="text-xs text-muted-foreground">Generated {new Date(data.generatedAt).toLocaleString()} {lastEventAt ? `- refreshed ${new Date(lastEventAt).toLocaleTimeString()}` : ""}</div>
      </div>
      <SearchAndFilters data={data} />
      <KpiStrip kpis={data.kpis} />
      <WidgetControls layout={layout} save={save} />
      {layout.map((widget) => {
        if (widget === "charts") return <DashboardCharts charts={data.charts} key={widget} />;
        if (widget === "tasks") return <TaskCenter data={data} key={widget} />;
        if (widget === "notifications") return <NotificationCenter data={data} key={widget} />;
        if (widget === "activity") return <Activity data={data} key={widget} />;
        return <InsightPanels data={data} key={widget} widget={widget} />;
      })}
      <QuickActions />
    </div>
  );
}
