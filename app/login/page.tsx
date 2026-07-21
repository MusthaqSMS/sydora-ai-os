"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <form
        onSubmit={handleLogin}
        className="w-[420px] bg-zinc-900 rounded-xl p-8 space-y-5"
      >
        <h1 className="text-4xl font-bold">Login</h1>

        <p className="text-zinc-400">
          Sign in to Sydora AI OS
        </p>

        <input
          className="w-full rounded-lg bg-zinc-800 p-3 outline-none"
          placeholder="Email"
          type="email"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="w-full rounded-lg bg-zinc-800 p-3 outline-none"
          placeholder="Password"
          type="password"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 rounded-lg py-3 font-semibold"
        >
          {loading ? "Signing In..." : "Login"}
        </button>
      </form>
    </div>
  );
}