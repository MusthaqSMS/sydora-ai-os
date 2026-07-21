"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Bot,
  Search,
  Megaphone,
  Share2,
  Workflow,
  Users,
  BarChart3,
  Briefcase,
  Settings,
} from "lucide-react";

const menuItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "AI Agents",
    href: "/dashboard/ai",
    icon: Bot,
  },
  {
    title: "SEO",
    href: "/dashboard/seo",
    icon: Search,
  },
  {
    title: "Google Ads",
    href: "/dashboard/ads",
    icon: Megaphone,
  },
  {
    title: "Social Media",
    href: "/dashboard/social",
    icon: Share2,
  },
  {
    title: "Automation",
    href: "/dashboard/automation",
    icon: Workflow,
  },
  {
    title: "CRM",
    href: "/dashboard/crm",
    icon: Users,
  },
  {
    title: "Reports",
    href: "/dashboard/reports",
    icon: BarChart3,
  },
  {
    title: "Clients",
    href: "/dashboard/clients",
    icon: Briefcase,
  },
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-72 bg-[#111113] border-r border-zinc-800 flex flex-col">
      {/* Logo */}
      <div className="h-20 flex items-center px-6 border-b border-zinc-800">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Sydora
          </h1>

          <p className="text-xs text-zinc-400">
            AI Marketing OS
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-4 py-3 transition-all ${
                active
                  ? "bg-blue-600 text-white"
                  : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
              }`}
            >
              <Icon size={20} />
              <span>{item.title}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-zinc-800 p-5">
        <p className="text-xs text-zinc-500">
          Sydora AI OS v1.0
        </p>
      </div>
    </aside>
  );
}