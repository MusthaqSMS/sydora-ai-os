import { notFound } from "next/navigation";
import { archiveEnterpriseRecordAction, createEnterpriseRecordAction } from "@/app/actions/enterprise";
import { EmptyState } from "@/components/common/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { requirePermission } from "@/lib/auth/authorization";
import { requireActiveOrganization } from "@/lib/auth/session";
import { getEnterpriseModule, type EnterpriseField } from "@/lib/constants/enterprise-modules";
import { getWorkspaceModuleData, searchWorkspace, type WorkspaceRecord } from "@/services/workspace.service";

export const dynamic = "force-dynamic";

type PageProps = {
  params: { module: string };
  searchParams?: { query?: string | string[] };
};

function param(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
}

function formatDate(value: string | null) {
  return value ? new Date(value).toLocaleDateString() : "None";
}

function FieldControl({ field }: { field: EnterpriseField }) {
  if (field.type === "select") {
    return (
      <label className="grid gap-2 text-sm font-medium">
        {field.label}
        <select className="h-10 rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring" defaultValue={field.options[0]?.value} name={field.name} required={field.required}>
          {field.options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>
      </label>
    );
  }
  return (
    <label className="grid gap-2 text-sm font-medium">
      {field.label}
      <Input name={field.name} placeholder={field.placeholder} required={field.required} step={field.type === "number" ? "0.01" : undefined} type={field.type} />
    </label>
  );
}

function CapabilityGrid({ capabilities }: { capabilities: readonly string[] }) {
  return (
    <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
      {capabilities.map((capability) => (
        <div className="rounded-md border bg-background p-3 text-sm" key={capability}>
          <p className="font-medium">{capability}</p>
          <p className="mt-1 text-xs text-muted-foreground">Enabled through tenant tables, RBAC, audit logs, and extensible module workflows.</p>
        </div>
      ))}
    </div>
  );
}

function RecordsTable({ canArchive, records, moduleSlug }: { canArchive: boolean; records: WorkspaceRecord[]; moduleSlug: string }) {
  if (records.length === 0) return <EmptyState title="No records yet" description="Create or connect records for this module to start tracking operational activity." />;
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] text-sm">
        <thead>
          <tr className="text-left text-muted-foreground">
            <th className="px-4 py-3">Name</th>
            <th className="px-4 py-3">Context</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Value</th>
            <th className="px-4 py-3">Date</th>
            {canArchive ? <th className="px-4 py-3">Actions</th> : null}
          </tr>
        </thead>
        <tbody>
          {records.map((record) => (
            <tr className="border-t" key={record.id}>
              <td className="px-4 py-3 font-medium">{record.title}</td>
              <td className="px-4 py-3 text-muted-foreground">{record.subtitle}</td>
              <td className="px-4 py-3"><Badge variant={["blocked", "overdue", "error"].includes(record.status) ? "destructive" : "outline"}>{record.status.replaceAll("_", " ")}</Badge></td>
              <td className="px-4 py-3 text-muted-foreground">{record.amount === null ? "None" : formatCurrency(record.amount)}</td>
              <td className="px-4 py-3 text-muted-foreground">{formatDate(record.date)}</td>
              {canArchive ? (
                <td className="px-4 py-3">
                  <form action={archiveEnterpriseRecordAction}>
                    <input name="module" type="hidden" value={moduleSlug} />
                    <input name="recordId" type="hidden" value={record.id} />
                    <Button size="sm" type="submit" variant="outline">Archive</Button>
                  </form>
                </td>
              ) : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default async function EnterpriseModulePage({ params, searchParams }: PageProps) {
  const moduleConfig = getEnterpriseModule(params.module);
  if (!moduleConfig) notFound();

  const context = await requireActiveOrganization(`/dashboard/${moduleConfig.slug}`);
  await requirePermission(context.activeOrganization.id, moduleConfig.permission);

  const query = param(searchParams?.query) ?? "";
  const data = moduleConfig.slug === "search"
    ? { records: await searchWorkspace(context.activeOrganization.id, query), summary: { total: 0, active: 0, risk: 0, value: 0 } }
    : await getWorkspaceModuleData(moduleConfig.slug, context.activeOrganization.id);
  const summary = moduleConfig.slug === "search" ? { total: data.records.length, active: data.records.length, risk: 0, value: 0 } : data.summary;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{moduleConfig.title}</h1>
          <p className="mt-1 max-w-3xl text-sm text-muted-foreground">{moduleConfig.summary}</p>
        </div>
        {moduleConfig.slug === "search" ? (
          <form action="/dashboard/search" className="flex gap-2" method="get">
            <Input defaultValue={query} name="query" placeholder="Search workspace" />
            <Button type="submit">Search</Button>
          </form>
        ) : null}
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        <Card><CardHeader><CardTitle>{moduleConfig.primaryMetric}</CardTitle></CardHeader><CardContent><p className="text-3xl font-semibold">{summary.total}</p></CardContent></Card>
        <Card><CardHeader><CardTitle>Active</CardTitle></CardHeader><CardContent><p className="text-3xl font-semibold">{summary.active}</p></CardContent></Card>
        <Card><CardHeader><CardTitle>Risk</CardTitle></CardHeader><CardContent><p className="text-3xl font-semibold">{summary.risk}</p></CardContent></Card>
        <Card><CardHeader><CardTitle>Value</CardTitle></CardHeader><CardContent><p className="text-3xl font-semibold">{formatCurrency(summary.value)}</p></CardContent></Card>
      </div>

      <div className={moduleConfig.fields.length ? "grid gap-6 xl:grid-cols-[360px_1fr]" : "space-y-6"}>
        {moduleConfig.fields.length ? (
          <Card>
            <CardHeader><CardTitle>{moduleConfig.createLabel}</CardTitle></CardHeader>
            <CardContent>
              <form action={createEnterpriseRecordAction} className="space-y-4">
                <input name="module" type="hidden" value={moduleConfig.slug} />
                {moduleConfig.fields.map((field) => <FieldControl field={field} key={field.name} />)}
                <Button type="submit">{moduleConfig.createLabel}</Button>
              </form>
            </CardContent>
          </Card>
        ) : null}

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Module capabilities</CardTitle></CardHeader>
            <CardContent><CapabilityGrid capabilities={moduleConfig.capabilities} /></CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Records</CardTitle></CardHeader>
            <CardContent><RecordsTable canArchive={Boolean(moduleConfig.table && moduleConfig.table !== "activity_logs")} moduleSlug={moduleConfig.slug} records={data.records} /></CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
