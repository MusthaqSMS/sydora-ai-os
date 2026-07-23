import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { requireActiveOrganization } from "@/lib/auth/session";
import { requirePermission } from "@/lib/auth/authorization";
import { createLeadAction, updateLeadAction } from "@/app/actions/crm";
import { listLeadSources, listLeadStatuses, listLeads } from "@/services/lead.service";

export const metadata = { title: "Leads" };
export const dynamic = "force-dynamic";

type SearchParams = {
  query?: string | string[];
  status?: string | string[];
  source?: string | string[];
};

function normalizeSearchParam(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

export default async function LeadsPage({ searchParams }: { searchParams?: SearchParams }) {
  const status = normalizeSearchParam(searchParams?.status);
  const source = normalizeSearchParam(searchParams?.source);
  const query = normalizeSearchParam(searchParams?.query);

  const context = await requireActiveOrganization("/dashboard/leads");
  await requirePermission(context.activeOrganization.id, "leads.view");

  const [leadSources, leadStatuses, leads] = await Promise.all([
    listLeadSources(context.activeOrganization.id),
    listLeadStatuses(context.activeOrganization.id),
    listLeads(context.activeOrganization.id, { query: query || undefined, sourceId: source || undefined, statusId: status || undefined }),
  ]);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Leads</h1>
            <p className="mt-1 text-sm text-muted-foreground">Track lead pipeline progress, manage statuses, and nurture new business opportunities.</p>
          </div>
          <form action="/dashboard/leads" method="get" className="grid gap-3 sm:auto-cols-fr sm:grid-flow-col">
            <label className="sr-only" htmlFor="lead-search">Search leads</label>
            <Input defaultValue={query ?? ""} id="lead-search" name="query" placeholder="Search leads" />
            <label className="sr-only" htmlFor="lead-source">Source</label>
            <select defaultValue={source ?? ""} id="lead-source" name="source" className="h-10 rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <option value="">All sources</option>
              {leadSources.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
            <label className="sr-only" htmlFor="lead-status">Status</label>
            <select defaultValue={status ?? ""} id="lead-status" name="status" className="h-10 rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <option value="">All statuses</option>
              {leadStatuses.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
            <Button type="submit">Filter</Button>
          </form>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <Card>
            <CardHeader><CardTitle>Open leads</CardTitle></CardHeader>
            <CardContent><p className="text-3xl font-semibold">{leads.length}</p></CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Sources</CardTitle></CardHeader>
            <CardContent><p className="text-3xl font-semibold">{leadSources.length}</p></CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Statuses</CardTitle></CardHeader>
            <CardContent><p className="text-3xl font-semibold">{leadStatuses.length}</p></CardContent>
          </Card>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(320px,360px)_1fr]">
        <Card className="order-2 xl:order-1">
          <CardHeader><CardTitle>New lead</CardTitle></CardHeader>
          <CardContent>
            <form action={createLeadAction} className="space-y-4">
              <label className="grid gap-2 text-sm font-medium">
                Lead name
                <Input name="name" required placeholder="Lead name" />
              </label>
              <label className="grid gap-2 text-sm font-medium">
                Email
                <Input name="email" type="email" placeholder="name@example.com" />
              </label>
              <label className="grid gap-2 text-sm font-medium">
                Company
                <Input name="company" placeholder="Company" />
              </label>
              <label className="grid gap-2 text-sm font-medium">
                Source
                <select name="sourceId" className="h-10 rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <option value="">Select source</option>
                  {leadSources.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                </select>
              </label>
              <label className="grid gap-2 text-sm font-medium">
                Status
                <select name="statusId" className="h-10 rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <option value="">Select status</option>
                  {leadStatuses.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                </select>
              </label>
              <label className="grid gap-2 text-sm font-medium">
                Estimated value
                <Input name="estimatedValue" type="number" step="0.01" placeholder="0.00" />
              </label>
              <Button type="submit">Create lead</Button>
            </form>
          </CardContent>
        </Card>

        <Card className="order-1 xl:order-2">
          <CardHeader><CardTitle>Lead pipeline</CardTitle></CardHeader>
          <CardContent className="overflow-x-auto">
            {leads.length === 0 ? (
              <p className="text-sm text-muted-foreground">No leads match the current filter.</p>
            ) : (
              <table className="w-full min-w-[720px] text-sm">
                <thead>
                  <tr className="text-left text-muted-foreground">
                    <th className="px-4 py-3">Lead</th>
                    <th className="px-4 py-3">Company</th>
                    <th className="px-4 py-3">Source</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Value</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead) => (
                    <tr key={lead.id} className="border-t">
                      <td className="px-4 py-3 font-medium text-foreground">{lead.name}</td>
                      <td className="px-4 py-3 text-muted-foreground">{lead.company ?? "—"}</td>
                      <td className="px-4 py-3 text-muted-foreground">{lead.source_id ?? "—"}</td>
                      <td className="px-4 py-3 text-muted-foreground">{lead.status_id ?? "—"}</td>
                      <td className="px-4 py-3 text-muted-foreground">{lead.estimated_value != null ? `$${lead.estimated_value.toFixed(2)}` : "—"}</td>
                      <td className="px-4 py-3">
                        <form action={updateLeadAction} className="grid gap-2">
                          <input name="leadId" type="hidden" value={lead.id} />
                          <select name="statusId" defaultValue={lead.status_id ?? ""} className="h-10 rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring">
                            <option value="">Status</option>
                            {leadStatuses.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                          </select>
                          <select name="sourceId" defaultValue={lead.source_id ?? ""} className="h-10 rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring">
                            <option value="">Source</option>
                            {leadSources.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                          </select>
                          <Input name="estimatedValue" defaultValue={lead.estimated_value != null ? lead.estimated_value.toString() : ""} type="number" step="0.01" placeholder="Value" />
                          <Button size="sm" type="submit">Update</Button>
                        </form>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
