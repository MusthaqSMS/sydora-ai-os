"use client";

import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { ChartPoint, DashboardCharts as DashboardChartsData, FunnelStage } from "@/types/dashboard";

const palette = ["#111827", "#2563eb", "#059669", "#f59e0b", "#dc2626", "#7c3aed"];

function normalize(points: ChartPoint[], fallback: ChartPoint[]) {
  return points.length ? points : fallback;
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className="rounded-md border bg-card p-4"><h3 className="text-sm font-semibold">{title}</h3><div className="mt-3 h-56">{children}</div></div>;
}

function AreaPanel({ title, data }: { title: string; data: ChartPoint[] }) {
  return (
    <Panel title={title}>
      <ResponsiveContainer height="100%" width="100%">
        <AreaChart data={normalize(data, [{ label: "Now", value: 0 }])}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="label" tickLine={false} />
          <YAxis tickLine={false} width={34} />
          <Tooltip />
          <Area dataKey="value" fill="#2563eb" fillOpacity={0.16} stroke="#2563eb" strokeWidth={2} type="monotone" />
        </AreaChart>
      </ResponsiveContainer>
    </Panel>
  );
}

function BarPanel({ title, data }: { title: string; data: ChartPoint[] | FunnelStage[] }) {
  return (
    <Panel title={title}>
      <ResponsiveContainer height="100%" width="100%">
        <BarChart data={data.length ? data : [{ label: "No data", value: 0 }]}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="label" tickLine={false} />
          <YAxis tickLine={false} width={34} />
          <Tooltip />
          <Bar dataKey="value" fill="#111827" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Panel>
  );
}

function LinePanel({ title, data }: { title: string; data: ChartPoint[] }) {
  return (
    <Panel title={title}>
      <ResponsiveContainer height="100%" width="100%">
        <LineChart data={normalize(data, [{ label: "Now", value: 0, secondary: 0 }])}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="label" tickLine={false} />
          <YAxis tickLine={false} width={34} />
          <Tooltip />
          <Line dataKey="value" dot={false} stroke="#059669" strokeWidth={2} type="monotone" />
          <Line dataKey="secondary" dot={false} stroke="#f59e0b" strokeWidth={2} type="monotone" />
        </LineChart>
      </ResponsiveContainer>
    </Panel>
  );
}

function PiePanel({ title, data }: { title: string; data: ChartPoint[] }) {
  return (
    <Panel title={title}>
      <ResponsiveContainer height="100%" width="100%">
        <PieChart>
          <Tooltip />
          <Pie data={normalize(data, [{ label: "No data", value: 1 }])} dataKey="value" innerRadius={48} nameKey="label" outerRadius={82}>
            {normalize(data, [{ label: "No data", value: 1 }]).map((entry, index) => <Cell fill={palette[index % palette.length]} key={entry.label} />)}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </Panel>
  );
}

export function DashboardCharts({ charts }: { charts: DashboardChartsData }) {
  return (
    <div className="grid gap-4 xl:grid-cols-3">
      <AreaPanel data={charts.revenueTrend} title="Revenue trend" />
      <AreaPanel data={charts.leadGrowth} title="Lead growth" />
      <BarPanel data={charts.conversionFunnel} title="Conversion funnel" />
      <PiePanel data={charts.leadSources} title="Lead sources" />
      <BarPanel data={charts.campaignPerformance} title="Campaign performance" />
      <AreaPanel data={charts.monthlySales} title="Monthly sales" />
      <PiePanel data={charts.taskCompletion} title="Task completion" />
      <LinePanel data={charts.seoRankingTrend} title="SEO ranking trend" />
      <AreaPanel data={charts.organicTraffic} title="Organic traffic" />
      <PiePanel data={charts.paidVsOrganic} title="Paid vs organic" />
      <AreaPanel data={charts.clientGrowth} title="Client growth" />
      <PiePanel data={charts.invoicesStatus} title="Invoices status" />
    </div>
  );
}
