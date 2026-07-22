import { completeOnboardingAction } from "@/app/actions/workspace";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { requireUser } from "@/lib/auth/session";

export const metadata = { title: "Onboarding" };
export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  const context = await requireUser("/onboarding");
  return (
    <main className="min-h-screen bg-muted/30 px-6 py-10">
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Set up your workspace</h1>
          <p className="mt-1 text-sm text-muted-foreground">Complete the account and organization details required before product modules are enabled.</p>
        </div>
        <form action={completeOnboardingAction} className="grid gap-4">
          <Card><CardHeader><CardTitle>Step 1: Personal details</CardTitle></CardHeader><CardContent className="grid gap-4 md:grid-cols-3"><label className="grid gap-2 text-sm font-medium">Full name<Input defaultValue={context.profile?.full_name ?? ""} name="fullName" required /></label><label className="grid gap-2 text-sm font-medium">Phone<Input name="phone" /></label><label className="grid gap-2 text-sm font-medium">Designation<Input name="designation" /></label></CardContent></Card>
          <Card><CardHeader><CardTitle>Step 2: Organization</CardTitle></CardHeader><CardContent className="grid gap-4 md:grid-cols-3"><label className="grid gap-2 text-sm font-medium">Company name<Input name="name" required /></label><label className="grid gap-2 text-sm font-medium">Slug<Input name="slug" pattern="[a-z0-9]+(-[a-z0-9]+)*" required /></label><label className="grid gap-2 text-sm font-medium">Industry<Input name="industry" /></label><label className="grid gap-2 text-sm font-medium">Website<Input name="website" type="url" /></label><label className="grid gap-2 text-sm font-medium">Timezone<Input defaultValue={context.profile?.timezone ?? "UTC"} name="timezone" required /></label><label className="grid gap-2 text-sm font-medium">Country<Input name="country" /></label><label className="grid gap-2 text-sm font-medium">Currency<Input defaultValue="USD" maxLength={3} name="currency" required /></label><label className="grid gap-2 text-sm font-medium">Primary color<Input defaultValue="#111827" name="primaryColor" type="color" /></label></CardContent></Card>
          <Card><CardHeader><CardTitle>Step 3: Business goals</CardTitle></CardHeader><CardContent><label className="grid gap-2 text-sm font-medium">Goals<Input name="businessGoals" placeholder="Lead generation, SEO growth, client retention" /></label></CardContent></Card>
          <Card><CardHeader><CardTitle>Step 4: Complete setup</CardTitle></CardHeader><CardContent className="flex items-center justify-between gap-4"><p className="text-sm text-muted-foreground">This creates your organization, provisions enterprise roles, and assigns you as owner.</p><Button type="submit">Complete setup</Button></CardContent></Card>
        </form>
      </div>
    </main>
  );
}
