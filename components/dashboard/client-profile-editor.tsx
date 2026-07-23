"use client";

import { z } from "zod";
import type { FormEvent } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { clientNoteSchema, clientUpdateSchema } from "@/schemas/client";
import type { Client } from "@/types/database";
import { addClientNoteAction, updateClientAction } from "@/app/actions/crm";

type ClientUpdateValues = z.infer<typeof clientUpdateSchema>;
type ClientNoteValues = z.infer<typeof clientNoteSchema>;

export function ClientProfileEditor({ client }: { client: Client }) {
  const updateForm = useForm<ClientUpdateValues>({
    resolver: zodResolver(clientUpdateSchema),
    defaultValues: {
      clientId: client.id,
      name: client.name,
      website: client.website ?? "",
      industry: client.industry ?? "",
      lifecycleStatus: client.lifecycle_status,
    },
  });

  const noteForm = useForm<ClientNoteValues>({
    resolver: zodResolver(clientNoteSchema),
    defaultValues: { clientId: client.id, note: "" },
  });

  async function handleUpdateSubmit(event: FormEvent<HTMLFormElement>) {
    const isValid = await updateForm.trigger();
    if (!isValid) event.preventDefault();
  }

  async function handleNoteSubmit(event: FormEvent<HTMLFormElement>) {
    const isValid = await noteForm.trigger();
    if (!isValid) event.preventDefault();
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Client details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form action={updateClientAction} onSubmit={handleUpdateSubmit} noValidate className="space-y-4">
            <input name="clientId" type="hidden" value={client.id} />
            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-2 text-sm font-medium">
                Name
                <Input {...updateForm.register("name")} />
                {updateForm.formState.errors.name ? <span className="text-sm text-destructive">{updateForm.formState.errors.name.message}</span> : null}
              </label>
              <label className="grid gap-2 text-sm font-medium">
                Website
                <Input {...updateForm.register("website")} placeholder="https://example.com" />
                {updateForm.formState.errors.website ? <span className="text-sm text-destructive">{updateForm.formState.errors.website.message}</span> : null}
              </label>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-2 text-sm font-medium">
                Industry
                <Input {...updateForm.register("industry")} placeholder="Industry" />
                {updateForm.formState.errors.industry ? <span className="text-sm text-destructive">{updateForm.formState.errors.industry.message}</span> : null}
              </label>
              <label className="grid gap-2 text-sm font-medium">
                Lifecycle status
                <select {...updateForm.register("lifecycleStatus")} className="h-10 rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="archived">Archived</option>
                </select>
                {updateForm.formState.errors.lifecycleStatus ? <span className="text-sm text-destructive">{updateForm.formState.errors.lifecycleStatus.message}</span> : null}
              </label>
            </div>
            <Button type="submit">Save updates</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Internal note</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form action={addClientNoteAction} onSubmit={handleNoteSubmit} noValidate className="space-y-4">
            <input name="clientId" type="hidden" value={client.id} />
            <label className="grid gap-2 text-sm font-medium">
              Note
              <textarea
                {...noteForm.register("note")}
                className="min-h-[140px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
              />
              {noteForm.formState.errors.note ? <span className="text-sm text-destructive">{noteForm.formState.errors.note.message}</span> : null}
            </label>
            <Button type="submit">Add note</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
