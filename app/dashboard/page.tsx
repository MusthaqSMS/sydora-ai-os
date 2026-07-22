import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireUser } from "@/lib/auth/session";
export const metadata = { title: "Workspace" };
export const dynamic = "force-dynamic";
export default async function DashboardPage() {
  const context = await requireUser("/dashboard");
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Workspace foundation</h1>
        <p className="mt-1 text-sm text-muted-foreground">Authentication, organization, and permission services are ready for Phase 4 business modules.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardHeader><CardTitle>Session</CardTitle></CardHeader><CardContent className="text-sm text-muted-foreground">{context.user.email ?? "Authenticated user"}</CardContent></Card>
        <Card><CardHeader><CardTitle>Organization</CardTitle></CardHeader><CardContent className="text-sm text-muted-foreground">{context.activeOrganization?.name ?? "Complete onboarding to create a workspace."}</CardContent></Card>
        <Card><CardHeader><CardTitle>Security</CardTitle></CardHeader><CardContent className="text-sm text-muted-foreground">Server authorization and audit hooks are active.</CardContent></Card>
      </div>
    </div>
  );
}
