"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

const data = [
  { month: "Jan", leads: 45 },
  { month: "Feb", leads: 60 },
  { month: "Mar", leads: 82 },
  { month: "Apr", leads: 95 },
  { month: "May", leads: 110 },
  { month: "Jun", leads: 145 },
];

export default function OverviewChart() {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-[#111113] p-6 shadow-sm">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">
            Overview
          </h2>

          <p className="mt-1 text-sm text-zinc-400">
            Monthly lead performance
          </p>
        </div>

        <span className="rounded-full bg-blue-600/20 px-3 py-1 text-xs font-medium text-blue-400">
          Last 6 Months
        </span>
      </div>

      {/* Chart */}
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{
              top: 10,
              right: 20,
              left: 0,
              bottom: 0,
            }}
          >
            <CartesianGrid
              stroke="#27272a"
              strokeDasharray="3 3"
            />

            <XAxis
              dataKey="month"
              stroke="#a1a1aa"
              tickLine={false}
              axisLine={false}
            />

            <YAxis
              stroke="#a1a1aa"
              tickLine={false}
              axisLine={false}
            />

            <Tooltip
              contentStyle={{
                background: "#18181b",
                border: "1px solid #3f3f46",
                borderRadius: "12px",
                color: "#ffffff",
              }}
              labelStyle={{
                color: "#ffffff",
              }}
            />

            <Line
              type="monotone"
              dataKey="leads"
              stroke="#2563eb"
              strokeWidth={3}
              dot={{
                r: 5,
                fill: "#2563eb",
              }}
              activeDot={{
                r: 7,
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}