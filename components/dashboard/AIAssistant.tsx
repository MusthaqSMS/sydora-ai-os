"use client";

import { Bot, Sparkles, Send } from "lucide-react";

export default function AIAssistant() {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-[#111113] p-6 h-full">
      <div className="flex items-center gap-3 mb-6">
        <div className="rounded-xl bg-blue-600 p-3">
          <Bot className="text-white" size={24} />
        </div>

        <div>
          <h2 className="text-xl font-semibold text-white">
            AI Marketing Assistant
          </h2>

          <p className="text-sm text-zinc-400">
            Powered by Sydora AI
          </p>
        </div>
      </div>

      <div className="rounded-xl bg-zinc-900 p-4 mb-6">
        <div className="flex gap-3">
          <Sparkles className="text-blue-500 mt-1" size={18} />

          <div>
            <p className="text-white">
              👋 Welcome back!
            </p>

            <p className="text-zinc-400 text-sm mt-2">
              I can help you with:
            </p>

            <ul className="mt-3 space-y-2 text-sm text-zinc-300">
              <li>• SEO Audit</li>
              <li>• Google Ads Campaigns</li>
              <li>• Social Media Posts</li>
              <li>• Landing Pages</li>
              <li>• AI Automation</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Ask Sydora AI..."
          className="flex-1 rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-white outline-none focus:border-blue-500"
        />

        <button className="rounded-xl bg-blue-600 px-4 hover:bg-blue-700 transition">
          <Send size={20} className="text-white" />
        </button>
      </div>
    </div>
  );
}