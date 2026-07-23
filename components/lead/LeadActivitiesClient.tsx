"use client";

import React, { useState } from "react";
import { createLeadActivityAction } from "@/app/actions/crm";

type Props = { leadId: string; organizationId: string };

export default function LeadActivitiesClient({ leadId, organizationId }: Props) {
  const [type, setType] = useState("");
  const [occurredAt, setOccurredAt] = useState(new Date().toISOString());

  return (
    <form action={createLeadActivityAction} className="space-y-2">
      <input type="hidden" name="organizationId" value={organizationId} />
      <input type="hidden" name="leadId" value={leadId} />
      <label className="block text-sm">Add Activity</label>
      <input name="activityType" value={type} onChange={(e) => setType(e.target.value)} className="w-full border rounded p-2" />
      <input name="occurredAt" type="datetime-local" value={new Date(occurredAt).toISOString().slice(0,16)} onChange={(e) => setOccurredAt(new Date(e.target.value).toISOString())} className="w-full border rounded p-2" />
      <div>
        <button type="submit" className="px-3 py-1 bg-green-600 text-white rounded">Add Activity</button>
      </div>
    </form>
  );
}
