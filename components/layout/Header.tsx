"use client";

import { Bell, Search, Settings, Plus } from "lucide-react";

export default function Header() {
  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-zinc-800 bg-[#0B0B0D]/90 px-8 backdrop-blur">
      {/* Left */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
          />

          <input
            type="text"
            placeholder="Search projects, clients..."
            className="w-96 rounded-xl border border-zinc-800 bg-[#111113] py-3 pl-11 pr-4 text-white outline-none transition focus:border-blue-500"
          />
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-4">

        <button className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700">
          <Plus size={18} />
          New
        </button>

        <button className="rounded-xl border border-zinc-800 bg-[#111113] p-3 hover:bg-zinc-900">
          <Bell size={20} />
        </button>

        <button className="rounded-xl border border-zinc-800 bg-[#111113] p-3 hover:bg-zinc-900">
          <Settings size={20} />
        </button>

        <div className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-[#111113] px-4 py-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 font-bold">
            S
          </div>

          <div>
            <p className="text-sm font-semibold text-white">
              Sulaiman
            </p>

            <p className="text-xs text-zinc-400">
              Admin
            </p>
          </div>
        </div>

      </div>
    </header>
  );
}