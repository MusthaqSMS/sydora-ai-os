import { notFound } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Breadcrumbs } from "@/components/ui/breadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/common/empty-state";
import { ClientContactsPanel } from "@/components/dashboard/client-contacts-panel";
import { ClientProfileEditor } from "@/components/dashboard/client-profile-editor";
import { ClientProfileRealtime } from "@/components/dashboard/client-profile-realtime";
import { requireActiveOrganization } from "@/lib/auth/session";
import { requirePermission } from "@/lib/auth/authorization";
import {
  getClient,
  getClientActivity,
  listClientCalendarEvents,
  listClientContacts,
  listClientDocuments,
  listClientInvoices,
  listClientMarketingCampaigns,
  listClientProjects,
  listClientSeoProjects,
  listClientTasks,
} from "@/services/client.service";

export const dynamic = "force-dynamic";

interface ClientProfilePageProps {
  params: {
    clientId: string;
  };
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
}

function compactDate(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString();
}

function formatActivityLabel(type: string) {
  return type.replaceAll("_", " ");
}

export default async function ClientProfilePage({ params: { clientId } }: ClientProfilePageProps) {
  const context = await requireActiveOrganization(`/dashboard/clients/${clientId}`);
  await requirePermission(context.activeOrganization.id, "clients.view");

  const [client, contacts, projects, campaigns, seoProjects, invoices, documents, calendarEvents, activity] = await Promise.all([
    getClient(clientId),
    listClientContacts(context.activeOrganization.id, clientId),
    listClientProjects(context.activeOrganization.id, clientId),
    listClientMarketingCampaigns(context.activeOrganization.id, clientId),
    listClientSeoProjects(context.activeOrganization.id, clientId),
    listClientInvoices(context.activeOrganization.id, clientId),
    listClientDocuments(context.activeOrganization.id, clientId),
    listClientCalendarEvents(context.activeOrganization.id, clientId),
    getClientActivity(context.activeOrganization.id, clientId),
  ]).catch(() => {
    notFound();
  });

  if (!client) notFound();

  const tasks = await listClientTasks(context.activeOrganization.id, projects.map((project) => project.id));
  const openTasks = tasks.filter((task) => task.status !== "done").length;
  const overdueTasks = tasks.filter((task) => task.status !== "done" && task.due_at && new Date(task.due_at) < new Date()).length;
  const overdueInvoices = invoices.filter((invoice) => invoice.status === "overdue").length;
  const totalInvoiceAmount = invoices.reduce((sum, invoice) => sum + Number(invoice.total_amount ?? 0), 0);
  const healthScore = Math.max(20, Math.min(100, 100 - openTasks * 4 - overdueTasks * 7 - overdueInvoices * 6));

  const timeline = activity.slice(0, 8);
  const notes = activity.filter((item) => item.entityType === "client_note");
  const communicationEvents = calendarEvents.slice(0, 5);
  const tagLabels = [client.lifecycle_status, client.industry ?? "Uncategorized", openTasks > 0 ? "Active engagements" : "Dormant", invoices.length > 0 ? "Billed client" : "New client"].filter(Boolean);

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Breadcrumbs
          items={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Clients", href: "/dashboard/clients" },
            { label: client.name },
          ]}
        />
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold">{client.name}</h1>
            <p className="text-sm text-muted-foreground">Complete 360° profile for client history, contacts, billing, campaigns, SEO work, and internal notes.</p>
          </div>
          <ClientProfileRealtime organizationId={context.activeOrganization.id} />
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[320px_1fr]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Client snapshot</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={client.lifecycle_status === "archived" ? "outline" : "secondary"}>{client.lifecycle_status}</Badge>
                  {client.website ? (
                    <Link className="text-sm text-primary hover:underline" href={client.website} target="_blank" rel="noreferrer">Visit website</Link>
                  ) : null}
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Industry</p>
                    <p>{client.industry ?? "—"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Created</p>
                    <p>{compactDate(client.created_at)}</p>
                  </div>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                <div className="rounded-lg border p-4">
                  <p className="text-sm text-muted-foreground">Contacts</p>
                  <p className="text-lg font-semibold">{contacts.length}</p>
                </div>
                <div className="rounded-lg border p-4">
                  <p className="text-sm text-muted-foreground">Projects</p>
                  <p className="text-lg font-semibold">{projects.length}</p>
                </div>
                <div className="rounded-lg border p-4">
                  <p className="text-sm text-muted-foreground">Open tasks</p>
                  <p className="text-lg font-semibold">{openTasks}</p>
                </div>
                <div className="rounded-lg border p-4">
                  <p className="text-sm text-muted-foreground">Client notes</p>
                  <p className="text-lg font-semibold">{notes.length}</p>
                </div>
                <div className="rounded-lg border p-4">
                  <p className="text-sm text-muted-foreground">Outstanding invoice total</p>
                  <p className="text-lg font-semibold">{formatCurrency(totalInvoiceAmount)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Health score</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-3xl font-semibold">{healthScore}%</div>
              <div className="rounded-full bg-muted h-2 overflow-hidden">
                <div className="h-2 bg-primary" style={{ width: `${healthScore}%` }} />
              </div>
              <p className="text-sm text-muted-foreground">Balanced score from open tasks, overdue work, and outstanding invoices.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tags</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {tagLabels.map((tag) => (
                <Badge key={tag} variant="outline">{tag}</Badge>
              ))}
            </CardContent>
          </Card>

          <ClientContactsPanel clientId={clientId} contacts={contacts} />
        </div>

        <div className="space-y-6">
          <ClientProfileEditor client={client} />

          <Card>
            <CardHeader>
              <CardTitle>Activity feed</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {timeline.length === 0 ? (
                <EmptyState title="No activity yet" description="Client activity and audit logs will appear here once actions are taken." />
              ) : (
                <div className="space-y-3">
                  {timeline.map((item) => (
                    <div key={item.id} className="rounded-lg border p-4">
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-medium">{formatActivityLabel(item.entityType)}</p>
                        <p className="text-xs text-muted-foreground">{new Date(item.createdAt).toLocaleString()}</p>
                      </div>
                      <p className="text-sm text-muted-foreground">{item.action}</p>
                      {item.metadata.note ? <p className="mt-2 rounded-lg bg-muted px-3 py-2 text-sm">{String(item.metadata.note)}</p> : null}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Communication history</CardTitle>
            </CardHeader>
            <CardContent>
              {communicationEvents.length === 0 ? (
                <EmptyState title="No communication events" description="Scheduled meetings and client conversations will appear here." />
              ) : (
                <div className="space-y-3">
                  {communicationEvents.map((event) => (
                    <div key={event.id} className="rounded-lg border p-4">
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-medium">{event.title}</p>
                        <p className="text-xs text-muted-foreground">{new Date(event.starts_at).toLocaleDateString()}</p>
                      </div>
                      <p className="text-sm text-muted-foreground">{new Date(event.starts_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} — {new Date(event.ends_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
                      <p className="text-sm text-muted-foreground">Attendees: {event.attendees.length}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Projects</CardTitle>
              </CardHeader>
              <CardContent>
                {projects.length === 0 ? (
                  <EmptyState title="No projects" description="Associate projects with this client to track delivery and tasks." />
                ) : (
                  <div className="space-y-3">
                    {projects.slice(0, 3).map((project) => (
                      <div key={project.id} className="rounded-lg border p-4">
                        <div className="flex items-center justify-between gap-3">
                          <p className="font-medium">{project.name}</p>
                          <Badge variant={project.status === "completed" ? "secondary" : "outline"}>{project.status.replaceAll("_", " ")}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">Due {project.due_date ? new Date(project.due_date).toLocaleDateString() : "TBD"}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Marketing campaigns</CardTitle>
              </CardHeader>
              <CardContent>
                {campaigns.length === 0 ? (
                  <EmptyState title="No campaigns" description="Track marketing campaigns and performance for this client." />
                ) : (
                  <div className="space-y-3">
                    {campaigns.slice(0, 3).map((campaign) => (
                      <div key={campaign.id} className="rounded-lg border p-4">
                        <div className="flex items-center justify-between gap-3">
                          <p className="font-medium">{campaign.name}</p>
                          <Badge variant={campaign.status === "active" ? "secondary" : "outline"}>{campaign.status}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">Channel: {campaign.channel}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>SEO projects</CardTitle>
              </CardHeader>
              <CardContent>
                {seoProjects.length === 0 ? (
                  <EmptyState title="No SEO work" description="Track SEO projects and site audits in one place." />
                ) : (
                  <div className="space-y-3">
                    {seoProjects.slice(0, 3).map((seo) => (
                      <div key={seo.id} className="rounded-lg border p-4">
                        <div className="flex items-center justify-between gap-3">
                          <p className="font-medium">{seo.website_url}</p>
                          <Badge variant={seo.status === "active" ? "secondary" : "outline"}>{seo.status.replaceAll("_", " ")}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">Website project ID: {seo.project_id ?? "—"}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Invoices</CardTitle>
              </CardHeader>
              <CardContent>
                {invoices.length === 0 ? (
                  <EmptyState title="No invoices" description="Invoices for this client will show billing status and totals." />
                ) : (
                  <div className="space-y-3">
                    {invoices.slice(0, 3).map((invoice) => (
                      <div key={invoice.id} className="rounded-lg border p-4">
                        <div className="flex items-center justify-between gap-3">
                          <p className="font-medium">{invoice.invoice_number}</p>
                          <Badge variant={invoice.status === "paid" ? "secondary" : invoice.status === "overdue" ? "destructive" : "outline"}>{invoice.status}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{formatCurrency(Number(invoice.total_amount ?? 0))} • Due {compactDate(invoice.due_date)}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Documents</CardTitle>
              </CardHeader>
              <CardContent>
                {documents.length === 0 ? (
                  <EmptyState title="No documents" description="Upload files and proposals to keep client assets organized." />
                ) : (
                  <div className="space-y-3">
                    {documents.slice(0, 3).map((document) => (
                      <div key={document.id} className="rounded-lg border p-4">
                        <p className="font-medium">{document.name}</p>
                        <p className="text-sm text-muted-foreground">{document.mime_type ?? "Document"} • {document.size_bytes !== null ? `${Math.round(document.size_bytes / 1024)} KB` : "Unknown size"}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
