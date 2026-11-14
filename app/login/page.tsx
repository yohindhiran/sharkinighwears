"use client";

import { useState } from "react";
import Link from "next/link";
import { login } from "@/app/actions/auth";

export default function LoginPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setError("");
    setLoading(true);
    const result = await login(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-6 py-20 md:py-28">
      <p className="eyebrow text-gold">Welcome back</p>
      <h1 className="display mt-4 text-5xl sm:text-6xl">Sign in.</h1>
      
      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 text-sm text-red-700 rounded">
          {error}
        </div>
      )}
      
      <form action={handleSubmit} className="mt-10 space-y-5">
        <div>
          <label className="block text-xs uppercase tracking-wider font-semibold text-ink/60 mb-1">
            Email address
          </label>
          <input
            name="email"
            required
            type="email"
            placeholder="you@example.com"
            className="w-full border-b border-ink/20 bg-transparent py-3 text-sm outline-none focus:border-gold transition"
          />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-wider font-semibold text-ink/60 mb-1">
            Password
          </label>
          <input
            name="password"
            required
            type="password"
            placeholder="••••••••"
            className="w-full border-b border-ink/20 bg-transparent py-3 text-sm outline-none focus:border-gold transition"
          />
        </div>

        <button
          disabled={loading}
          className="w-full bg-ink py-4 text-xs font-bold uppercase tracking-[.16em] text-white hover:bg-gold transition disabled:opacity-60"
        >
          {loading ? "Signing in..." : "Continue"}
        </button>
      </form>

      <div className="mt-8 text-center text-xs text-ink/60">
        New to SHARKI NIGHTWEARS?{" "}
        <Link href="/register" className="font-semibold text-ink underline hover:text-gold">
          Create an account
        </Link>
      </div>
    </div>
  );
}
