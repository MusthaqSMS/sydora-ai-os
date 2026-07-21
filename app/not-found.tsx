import Link from "next/link";
import { Button } from "@/components/ui/button";
export default function NotFound() { return <main className="grid min-h-screen place-items-center p-6 text-center"><div><p className="text-sm text-muted-foreground">404</p><h1 className="mt-2 text-2xl font-semibold">Page not found</h1><p className="mt-2 text-muted-foreground">The page you requested does not exist.</p><Button className="mt-6"><Link href="/">Return home</Link></Button></div></main>; }
