import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/30 p-6">
      <div className="max-w-md text-center">
        <p className="text-sm font-medium text-muted-foreground">401</p>
        <h1 className="mt-2 text-3xl font-semibold">Unauthorized</h1>
        <p className="mt-3 text-sm text-muted-foreground">Your account does not have permission to open this workspace area or perform that action.</p>
        <Link className="mt-6 inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90" href="/dashboard">Back to workspace</Link>
      </div>
    </main>
  );
}
