const clients = [
  {
    name: "Hotel Harish Inn",
    service: "SEO + Google Ads",
  },
  {
    name: "ASquare Developers",
    service: "Meta Ads",
  },
  {
    name: "Sydora Digital",
    service: "Internal Project",
  },
];

export default function RecentClients() {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-[#111113] p-6">
      <h2 className="mb-6 text-xl font-semibold text-white">
        Recent Clients
      </h2>

      <div className="space-y-4">
        {clients.map((client) => (
          <div
            key={client.name}
            className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900 p-4"
          >
            <div>
              <p className="font-medium text-white">
                {client.name}
              </p>

              <p className="text-sm text-zinc-400">
                {client.service}
              </p>
            </div>

            <span className="rounded-full bg-green-500/20 px-3 py-1 text-xs text-green-400">
              Active
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}