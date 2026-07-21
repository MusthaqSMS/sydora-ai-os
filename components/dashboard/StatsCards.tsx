import {
  Users,
  Search,
  Megaphone,
  Bot,
} from "lucide-react";

const stats = [
  {
    title: "Clients",
    value: "12",
    icon: Users,
    color: "text-blue-500",
  },
  {
    title: "SEO Projects",
    value: "28",
    icon: Search,
    color: "text-green-500",
  },
  {
    title: "Google Ads",
    value: "15",
    icon: Megaphone,
    color: "text-orange-500",
  },
  {
    title: "AI Tasks",
    value: "147",
    icon: Bot,
    color: "text-purple-500",
  },
];

export default function StatsCards() {
  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
      {stats.map((item) => {
        const Icon = item.icon;

        return (
          <div
            key={item.title}
            className="rounded-2xl border border-zinc-800 bg-[#111113] p-6 transition-all hover:border-blue-500 hover:shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-400">
                  {item.title}
                </p>

                <h2 className="mt-2 text-3xl font-bold text-white">
                  {item.value}
                </h2>
              </div>

              <div
                className={`rounded-xl bg-zinc-900 p-3 ${item.color}`}
              >
                <Icon size={28} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}