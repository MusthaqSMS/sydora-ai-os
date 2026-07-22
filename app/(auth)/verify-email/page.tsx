import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = { title: "Verify email" };

export default function VerifyEmailPage() {
  return (
    <Card className="w-full max-w-md">
      <CardHeader><CardTitle>Verify your email</CardTitle></CardHeader>
      <CardContent className="text-sm text-muted-foreground">Open the confirmation link sent to your inbox to activate your Sydora account.</CardContent>
    </Card>
  );
}
