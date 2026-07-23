import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { requireActiveOrganization } from "@/lib/auth/session";
import { requirePermission } from "@/lib/auth/authorization";
import { archiveClientAction, createClientAction, restoreClientAction } from "@/app/actions/crm";
import { listClients } from "@/services/client.service";

export const metadata = { title: "Clients" };
export const dynamic = "force-dynamic";

type SearchParams = {
  query?: string | string[];
  status?: string | string[];
};

function normalizeSearchParam(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

function labelForStatus(status: string) {
  switch (status) {
    case "active":
      return "Active";
    case "inactive":
      return "Inactive";
    case "archived":
      return "Archived";
    default:
      return "Unknown";
  }
}

export default async function ClientsPage({ searchParams }: { searchParams?: SearchParams }) {
  const status = normalizeSearchParam(searchParams?.status) as "active" | "inactive" | "archived" | undefined;
  const query = normalizeSearchParam(searchParams?.query);

  const context = await requireActiveOrganization("/dashboard/clients");
  await requirePermission(context.activeOrganization.id, "clients.view");
  const clients = await listClients(context.activeOrganization.id, { query: query || undefined, lifecycleStatus: status });

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Clients</h1>
            <p className="mt-1 text-sm text-muted-foreground">Manage organization clients, archive old accounts, and keep client details up to date.</p>
          </div>
          <form action="/dashboard/clients" method="get" className="grid gap-3 sm:auto-cols-fr sm:grid-flow-col">
            <label className="sr-only" htmlFor="client-search">Search clients</label>
            <Input defaultValue={query ?? ""} id="client-search" name="query" placeholder="Search clients" />
            <label className="sr-only" htmlFor="client-status">Status</label>
            <select defaultValue={status ?? ""} id="client-status" name="status" className="h-10 rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <option value="">All statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="archived">Archived</option>
            </select>
            <Button type="submit">Filter</Button>
          </form>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <Card>
            <CardHeader><CardTitle>Total clients</CardTitle></CardHeader>
            <CardContent><p className="text-3xl font-semibold">{clients.length}</p></CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Active clients</CardTitle></CardHeader>
            <CardContent><p className="text-3xl font-semibold">{clients.filter((client) => client.lifecycle_status === "active").length}</p></CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Archived clients</CardTitle></CardHeader>
            <CardContent><p className="text-3xl font-semibold">{clients.filter((client) => client.lifecycle_status === "archived").length}</p></CardContent>
          </Card>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(320px,360px)_1fr]">
        <Card className="order-2 xl:order-1">
          <CardHeader><CardTitle>New client</CardTitle></CardHeader>
          <CardContent>
            <form action={createClientAction} className="space-y-4">
              <input name="organizationId" type="hidden" value={context.activeOrganization.id} />
              <label className="grid gap-2 text-sm font-medium">
                Name
                <Input name="name" required placeholder="Client name" />
              </label>
              <label className="grid gap-2 text-sm font-medium">
                Website
                <Input name="website" placeholder="https://example.com" type="url" />
              </label>
              <label className="grid gap-2 text-sm font-medium">
                Industry
                <Input name="industry" placeholder="Industry" />
              </label>
              <Button type="submit">Create client</Button>
            </form>
          </CardContent>
        </Card>

        <Card className="order-1 xl:order-2">
          <CardHeader><CardTitle>Client directory</CardTitle></CardHeader>
          <CardContent className="overflow-x-auto">
            {clients.length === 0 ? (
              <p className="text-sm text-muted-foreground">No clients match the current filter.</p>
            ) : (
              <table className="w-full min-w-[640px] text-sm">
                <thead>
                  <tr className="text-left text-muted-foreground">
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Industry</th>
                    <th className="px-4 py-3">Website</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Created</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {clients.map((client) => (
                    <tr key={client.id} className="border-t">
                      <td className="px-4 py-3 font-medium text-foreground">
                        <Link className="text-primary hover:underline" href={`/dashboard/clients/${client.id}`}>{client.name}</Link>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{client.industry ?? "—"}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {client.website ? <a className="text-primary hover:underline" href={client.website} target="_blank" rel="noreferrer">Visit</a> : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={client.lifecycle_status === "archived" ? "outline" : "secondary"}>{labelForStatus(client.lifecycle_status)}</Badge>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{new Date(client.created_at).toLocaleDateString()}</td>
                      <td className="px-4 py-3">
                        {client.lifecycle_status === "archived" ? (
                          <form action={restoreClientAction} className="inline-block">
                            <input name="clientId" type="hidden" value={client.id} />
                            <Button size="sm" type="submit">Restore</Button>
                          </form>
                        ) : (
                          <form action={archiveClientAction} className="inline-block">
                            <input name="clientId" type="hidden" value={client.id} />
                            <Button size="sm" variant="outline" type="submit">Archive</Button>
                          </form>
                        )}
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
