import React from "react";
import { getLead, listLeadNotes, listLeadActivities } from "@/services/lead.service";
import type { EntityId, LeadNote, LeadActivity } from "@/types/database";
import LeadNotesClient from "@/components/lead/LeadNotesClient";
import LeadActivitiesClient from "@/components/lead/LeadActivitiesClient";

type Props = { params: { leadId: string } };

export default async function LeadDetailPage({ params }: Props) {
  const leadId: EntityId = params.leadId;
  const lead = await getLead(leadId);
  const notes = await listLeadNotes(lead.organization_id, leadId);
  const activities = await listLeadActivities(lead.organization_id, leadId);

  return (
    <div className="max-w-7xl mx-auto p-4">
      <h1 className="text-2xl font-semibold">{lead.name}</h1>
      <div className="grid grid-cols-12 gap-4 mt-4">
        <div className="col-span-4 space-y-4">
          <section className="p-4 border rounded">
            <h2 className="font-medium">Details</h2>
            <p className="text-sm">Company: {lead.company ?? "—"}</p>
            <p className="text-sm">Email: {lead.email ?? "—"}</p>
          </section>
          <section className="p-4 border rounded">
            <h2 className="font-medium">Score</h2>
            <p className="text-4xl font-bold">—</p>
          </section>
        </div>

        <div className="col-span-5 space-y-4">
          <section className="p-4 border rounded">
            <h2 className="font-medium">Timeline</h2>
            <div className="space-y-2">
              {notes.map((n: LeadNote) => (
                <div key={n.id} className="p-2 border rounded">
                  <div className="text-sm text-gray-600">Note • {new Date(n.created_at).toLocaleString()}</div>
                  <div>{n.body}</div>
                </div>
              ))}
              {activities.map((a: LeadActivity) => (
                <div key={a.id} className="p-2 border rounded">
                  <div className="text-sm text-gray-600">{a.activity_type} • {new Date(a.occurred_at).toLocaleString()}</div>
                  <div className="text-xs text-gray-700">{JSON.stringify(a.metadata || {})}</div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="col-span-3 space-y-4">
          <section className="p-4 border rounded">
            <h2 className="font-medium">Actions</h2>
            <div className="space-y-2">
              <LeadNotesClient leadId={leadId} organizationId={lead.organization_id} />
              <LeadActivitiesClient leadId={leadId} organizationId={lead.organization_id} />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
