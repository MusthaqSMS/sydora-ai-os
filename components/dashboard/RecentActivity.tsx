const activities = [
  {
    title: "SEO audit completed",
    time: "5 mins ago",
  },
  {
    title: "Google Ads campaign created",
    time: "25 mins ago",
  },
  {
    title: "Instagram post generated",
    time: "1 hour ago",
  },
  {
    title: "Client report exported",
    time: "Yesterday",
  },
];

export default function RecentActivity() {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-[#111113] p-6">
      <h2 className="mb-6 text-xl font-semibold text-white">
        Recent Activity
      </h2>

      <div className="space-y-4">
        {activities.map((item) => (
          <div
            key={item.title}
            className="border-b border-zinc-800 pb-4 last:border-none"
          >
            <p className="text-white">
              {item.title}
            </p>

            <p className="text-sm text-zinc-500">
              {item.time}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}