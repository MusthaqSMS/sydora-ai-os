"use client";

import React, { useState } from "react";
import { createLeadNoteAction } from "@/app/actions/crm";

type Props = { leadId: string; organizationId: string };

export default function LeadNotesClient({ leadId, organizationId }: Props) {
  const [body, setBody] = useState("");

  return (
    <form action={createLeadNoteAction} className="space-y-2">
      <input type="hidden" name="organizationId" value={organizationId} />
      <input type="hidden" name="leadId" value={leadId} />
      <label className="block text-sm">Add Note</label>
      <textarea name="body" value={body} onChange={(e) => setBody(e.target.value)} className="w-full border rounded p-2" />
      <div>
        <button type="submit" className="px-3 py-1 bg-blue-600 text-white rounded">Add Note</button>
      </div>
    </form>
  );
}
