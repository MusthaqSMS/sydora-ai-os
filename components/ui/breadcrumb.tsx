import Link from "next/link";
export type BreadcrumbItem = { label: string; href?: string };
export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) { return <nav aria-label="Breadcrumb"><ol className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">{items.map((item, index) => <li className="flex items-center gap-1.5" key={item.label}>{index > 0 && <span aria-hidden="true">›</span>}{item.href ? <Link className="hover:text-foreground" href={item.href}>{item.label}</Link> : <span className="text-foreground">{item.label}</span>}</li>)}</ol></nav>; }
