import Link from "next/link";
import { PublicLayout } from "@/components/layout/public-layout";
import { siteConfig } from "@/lib/constants/site";
export default function HomePage() { return <PublicLayout><section className="max-w-2xl"><p className="text-sm font-medium text-muted-foreground">Platform foundation</p><h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">{siteConfig.name}</h1><p className="mt-5 text-lg text-muted-foreground">A secure, scalable foundation for the next generation of Sydora products.</p><div className="mt-8"><Link className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90" href="/login">Sign in</Link></div></section></PublicLayout>; }
