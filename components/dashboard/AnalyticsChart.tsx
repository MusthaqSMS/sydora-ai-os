"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { month: "Jan", leads: 45 },
  { month: "Feb", leads: 60 },
  { month: "Mar", leads: 82 },
  { month: "Apr", leads: 95 },
  { month: "May", leads: 110 },
  { month: "Jun", leads: 145 },
];

export default function AnalyticsChart() {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-[#111113] p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-white">
          Lead Performance
        </h2>

        <p className="text-sm text-zinc-400">
          Monthly lead growth
        </p>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid stroke="#27272a" />

            <XAxis
              dataKey="month"
              stroke="#9ca3af"
            />

            <YAxis stroke="#9ca3af" />

            <Tooltip />

            <Line
              type="monotone"
              dataKey="leads"
              stroke="#2563eb"
              strokeWidth={3}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}