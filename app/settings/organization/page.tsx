import { deleteOrganizationAction, updateOrganizationAction } from "@/app/actions/workspace";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { requireActiveOrganization } from "@/lib/auth/session";

export const metadata = { title: "Organization" };

export default async function OrganizationSettingsPage() {
  const { activeOrganization } = await requireActiveOrganization("/settings/organization");
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Organization settings</h1>
      <Card>
        <CardHeader><CardTitle>Company details and branding</CardTitle></CardHeader>
        <CardContent>
          <form action={updateOrganizationAction} className="grid gap-4 md:grid-cols-3">
            <label className="grid gap-2 text-sm font-medium">Company name<Input defaultValue={activeOrganization.name} name="name" required /></label>
            <label className="grid gap-2 text-sm font-medium">Slug<Input defaultValue={activeOrganization.slug} name="slug" required /></label>
            <label className="grid gap-2 text-sm font-medium">Industry<Input defaultValue={activeOrganization.industry ?? ""} name="industry" /></label>
            <label className="grid gap-2 text-sm font-medium">Website<Input defaultValue={activeOrganization.website ?? ""} name="website" type="url" /></label>
            <label className="grid gap-2 text-sm font-medium">Timezone<Input defaultValue={activeOrganization.timezone} name="timezone" /></label>
            <label className="grid gap-2 text-sm font-medium">Country<Input defaultValue={activeOrganization.country ?? ""} name="country" /></label>
            <label className="grid gap-2 text-sm font-medium">Currency<Input defaultValue={activeOrganization.currency} maxLength={3} name="currency" /></label>
            <label className="grid gap-2 text-sm font-medium">Logo path<Input defaultValue={activeOrganization.logo_path ?? ""} name="logoPath" /></label>
            <label className="grid gap-2 text-sm font-medium">Primary color<Input defaultValue={activeOrganization.primary_color} name="primaryColor" type="color" /></label>
            <label className="grid gap-2 text-sm font-medium md:col-span-3">Business goals<Input defaultValue={activeOrganization.business_goals.join(", ")} name="businessGoals" /></label>
            <Button className="md:col-span-3" type="submit">Save organization</Button>
          </form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Delete organization</CardTitle></CardHeader>
        <CardContent className="flex items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">Deletion is soft-deleted in the database so audit history remains recoverable.</p>
          <form action={deleteOrganizationAction}><Button type="submit" variant="destructive">Delete</Button></form>
        </CardContent>
      </Card>
    </div>
  );
}
