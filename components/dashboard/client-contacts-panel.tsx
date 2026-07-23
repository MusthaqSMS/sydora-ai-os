"use client";

import { useEffect, useState, type FormEvent } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/common/empty-state";
import { clientContactSchema, clientContactUpdateSchema } from "@/schemas/contact";
import { createClientContactAction, updateClientContactAction, deleteClientContactAction } from "@/app/actions/crm";
import type { ClientContact } from "@/types/database";

type ClientContactsPanelProps = {
  clientId: string;
  contacts: ClientContact[];
};

export function ClientContactsPanel({ clientId, contacts }: ClientContactsPanelProps) {
  const [editingContactId, setEditingContactId] = useState<string | null>(null);
  const contactForm = useForm<z.infer<typeof clientContactSchema>>({
    resolver: zodResolver(clientContactSchema),
    defaultValues: {
      clientId,
      fullName: "",
      email: "",
      phone: "",
      jobTitle: "",
      isPrimary: false,
    },
  });

  const updateForm = useForm<z.infer<typeof clientContactUpdateSchema>>({
    resolver: zodResolver(clientContactUpdateSchema),
    defaultValues: {
      clientId,
      contactId: "",
      fullName: "",
      email: "",
      phone: "",
      jobTitle: "",
      isPrimary: false,
    },
  });

  useEffect(() => {
    const contact = contacts.find((item) => item.id === editingContactId);
    if (!contact) return;

    updateForm.reset({
      clientId,
      contactId: contact.id,
      fullName: contact.full_name,
      email: contact.email ?? "",
      phone: contact.phone ?? "",
      jobTitle: contact.job_title ?? "",
      isPrimary: contact.is_primary,
    });
  }, [editingContactId, contacts, clientId, updateForm]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    const isValid = await contactForm.trigger();
    if (!isValid) event.preventDefault();
  }

  async function handleUpdateSubmit(event: FormEvent<HTMLFormElement>) {
    const isValid = await updateForm.trigger();
    if (!isValid) event.preventDefault();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Contacts</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {contacts.length === 0 ? (
          <EmptyState title="No contacts yet" description="Add client stakeholders and billing or technical contacts to keep the team aligned." />
        ) : (
          <div className="space-y-3">
            {contacts.map((contact) => {
              const isEditing = editingContactId === contact.id;
              return (
                <div key={contact.id} className="rounded-lg border p-4">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="font-medium">{contact.full_name}</p>
                      <p className="text-sm text-muted-foreground">{contact.job_title ?? "Contact"}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button type="button" variant="outline" size="sm" onClick={() => setEditingContactId(isEditing ? null : contact.id)}>
                        {isEditing ? "Cancel" : "Edit"}
                      </Button>
                      <form action={deleteClientContactAction} method="post">
                        <input name="clientId" type="hidden" value={clientId} />
                        <input name="contactId" type="hidden" value={contact.id} />
                        <Button type="submit" variant="destructive" size="sm">Delete</Button>
                      </form>
                    </div>
                  </div>

                  {isEditing ? (
                    <form action={updateClientContactAction} onSubmit={handleUpdateSubmit} noValidate className="mt-4 space-y-4">
                      <input name="clientId" type="hidden" value={clientId} />
                      <input name="contactId" type="hidden" value={contact.id} />
                      <div className="grid gap-4 md:grid-cols-2">
                        <label className="grid gap-2 text-sm font-medium">
                          Full name
                          <Input {...updateForm.register("fullName")} />
                          {updateForm.formState.errors.fullName ? <span className="text-sm text-destructive">{updateForm.formState.errors.fullName.message}</span> : null}
                        </label>
                        <label className="grid gap-2 text-sm font-medium">
                          Email
                          <Input {...updateForm.register("email")} type="email" />
                          {updateForm.formState.errors.email ? <span className="text-sm text-destructive">{updateForm.formState.errors.email.message}</span> : null}
                        </label>
                      </div>
                      <div className="grid gap-4 md:grid-cols-2">
                        <label className="grid gap-2 text-sm font-medium">
                          Phone
                          <Input {...updateForm.register("phone")} />
                          {updateForm.formState.errors.phone ? <span className="text-sm text-destructive">{updateForm.formState.errors.phone.message}</span> : null}
                        </label>
                        <label className="grid gap-2 text-sm font-medium">
                          Job title
                          <Input {...updateForm.register("jobTitle")} />
                          {updateForm.formState.errors.jobTitle ? <span className="text-sm text-destructive">{updateForm.formState.errors.jobTitle.message}</span> : null}
                        </label>
                      </div>
                      <label className="inline-flex items-center gap-2 text-sm">
                        <input type="checkbox" {...updateForm.register("isPrimary")} className="h-4 w-4 rounded border-input text-primary focus:ring-ring" />
                        Primary contact
                      </label>
                      <Button type="submit">Save contact</Button>
                    </form>
                  ) : (
                    <div className="mt-3 grid gap-2 text-sm text-muted-foreground">
                      <p>{contact.email ?? "No email"}</p>
                      <p>{contact.phone ?? "No phone"}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div className="rounded-lg border p-4">
          <p className="mb-3 text-sm font-semibold">Add new contact</p>
          <form action={createClientContactAction} onSubmit={handleSubmit} className="space-y-4" noValidate>
            <input name="clientId" type="hidden" value={clientId} />
            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-2 text-sm font-medium">
                Full name
                <Input {...contactForm.register("fullName")} placeholder="Full name" />
                {contactForm.formState.errors.fullName ? <span className="text-sm text-destructive">{contactForm.formState.errors.fullName.message}</span> : null}
              </label>
              <label className="grid gap-2 text-sm font-medium">
                Email
                <Input {...contactForm.register("email")} placeholder="name@example.com" type="email" />
                {contactForm.formState.errors.email ? <span className="text-sm text-destructive">{contactForm.formState.errors.email.message}</span> : null}
              </label>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-2 text-sm font-medium">
                Phone
                <Input {...contactForm.register("phone")} placeholder="(123) 456-7890" />
                {contactForm.formState.errors.phone ? <span className="text-sm text-destructive">{contactForm.formState.errors.phone.message}</span> : null}
              </label>
              <label className="grid gap-2 text-sm font-medium">
                Job title
                <Input {...contactForm.register("jobTitle")} placeholder="Marketing lead" />
                {contactForm.formState.errors.jobTitle ? <span className="text-sm text-destructive">{contactForm.formState.errors.jobTitle.message}</span> : null}
              </label>
            </div>
            <label className="inline-flex items-center gap-2 text-sm">
              <input type="checkbox" {...contactForm.register("isPrimary")} className="h-4 w-4 rounded border-input text-primary focus:ring-ring" />
              Primary contact
            </label>
            <Button type="submit">Add contact</Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}
