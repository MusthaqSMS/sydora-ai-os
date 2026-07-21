"use client";
import { Button } from "@/components/ui/button";
export function ErrorState({ title = "Something went wrong", description = "Please try again." }: { title?: string; description?: string }) { return <div className="flex min-h-48 flex-col items-center justify-center gap-3 text-center"><h1 className="text-lg font-semibold">{title}</h1><p className="text-sm text-muted-foreground">{description}</p><Button onClick={() => window.location.reload()} variant="outline">Try again</Button></div>; }
