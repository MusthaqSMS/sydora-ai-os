"use client";

import Link from "next/link";
import {
  Search,
  FileText,
  Megaphone,
  Image,
  Bot,
  BarChart3,
} from "lucide-react";

const actions = [
  {
    title: "SEO Audit",
    description: "Analyze a website",
    icon: Search,
    href: "/dashboard/seo",
  },
  {
    title: "Generate Blog",
    description: "AI blog writer",
    icon: FileText,
    href: "/dashboard/ai",
  },
  {
    title: "Google Ads",
    description: "Create campaigns",
    icon: Megaphone,
    href: "/dashboard/ads",
  },
  {
    title: "Social Post",
    description: "Generate content",
    icon: Image,
    href: "/dashboard/social",
  },
  {
    title: "AI Automation",
    description: "Build workflows",
    icon: Bot,
    href: "/dashboard/automation",
  },
  {
    title: "Reports",
    description: "Generate reports",
    icon: BarChart3,
    href: "/dashboard/reports",
  },
];

export default function QuickActions() {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-[#111113] p-6">
      <h2 className="mb-6 text-xl font-semibold text-white">
        Quick Actions
      </h2>

      <div className="grid grid-cols-2 gap-4">
        {actions.map((action) => {
          const Icon = action.icon;

          return (
            <Link
              key={action.title}
              href={action.href}
              className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 transition hover:border-blue-500 hover:bg-zinc-800"
            >
              <Icon className="mb-3 text-blue-500" size={24} />

              <h3 className="font-medium text-white">
                {action.title}
              </h3>

              <p className="mt-1 text-sm text-zinc-400">
                {action.description}
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}