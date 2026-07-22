import { acceptInvitationAction } from "@/app/actions/workspace";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = { title: "Accept invitation" };
export const dynamic = "force-dynamic";

export default async function AcceptInvitationPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token = "" } = await searchParams;
  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/30 p-6">
      <Card className="w-full max-w-md">
        <CardHeader><CardTitle>Accept organization invitation</CardTitle></CardHeader>
        <CardContent>
          <form action={acceptInvitationAction} className="space-y-4">
            <input name="token" type="hidden" value={token} />
            <p className="text-sm text-muted-foreground">Join the organization linked to this invitation with your signed-in account.</p>
            <Button className="w-full" disabled={!token} type="submit">Accept invitation</Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
