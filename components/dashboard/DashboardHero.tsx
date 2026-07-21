import Button from "@/components/ui/Button";

export default function DashboardHero() {
  return (
    <div className="rounded-3xl border border-zinc-800 bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-500 p-8 text-white">

      <p className="text-lg">
        👋 Welcome back,
      </p>

      <h1 className="mt-2 text-5xl font-bold">
        Sulaiman
      </h1>

      <p className="mt-4 max-w-2xl text-blue-100">
        Manage SEO, Google Ads, AI Automation, CRM and Reporting
        from one unified AI Marketing Operating System.
      </p>

      <div className="mt-8 flex gap-4">

        <Button>
          Start AI Assistant
        </Button>

        <button className="rounded-xl border border-white/30 px-5 py-2 hover:bg-white/10">
          View Reports
        </button>

      </div>

    </div>
  );
}