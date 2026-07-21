"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signUp } from "@/lib/auth";

export default function RegisterPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);

    const { error } = await signUp(
      form.name,
      form.email,
      form.password
    );

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Registration successful. Please verify your email.");

    router.push("/login");
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-zinc-950 text-white">
      <div className="w-full max-w-md rounded-xl border border-zinc-800 bg-zinc-900 p-8">

        <h1 className="text-3xl font-bold">
          Create Account
        </h1>

        <p className="mt-2 text-zinc-400">
          Register for Sydora AI OS
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-5"
        >
          <input
            placeholder="Full Name"
            className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3"
            value={form.name}
            onChange={(e) =>
              setForm({
                ...form,
                name: e.target.value,
              })
            }
          />

          <input
            type="email"
            placeholder="Email"
            className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3"
            value={form.email}
            onChange={(e) =>
              setForm({
                ...form,
                email: e.target.value,
              })
            }
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3"
            value={form.password}
            onChange={(e) =>
              setForm({
                ...form,
                password: e.target.value,
              })
            }
          />

          <button
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 py-3 font-semibold hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Creating..." : "Register"}
          </button>
        </form>

      </div>
    </main>
  );
}