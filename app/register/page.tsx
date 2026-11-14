"use client";

import { useState } from "react";
import Link from "next/link";
import { register } from "@/app/actions/auth";

export default function RegisterPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setError("");
    setLoading(true);
    const result = await register(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-6 py-20 md:py-28">
      <p className="eyebrow text-gold">Join SHARKI NIGHTWEARS</p>
      <h1 className="display mt-4 text-5xl sm:text-6xl">Create account.</h1>
      
      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 text-sm text-red-700 rounded">
          {error}
        </div>
      )}
      
      <form action={handleSubmit} className="mt-10 space-y-5">
        <div>
          <label className="block text-xs uppercase tracking-wider font-semibold text-ink/60 mb-1">
            Full name
          </label>
          <input
            name="name"
            required
            placeholder="Jane Doe"
            className="w-full border-b border-ink/20 bg-transparent py-3 text-sm outline-none focus:border-gold transition"
          />
        </div>
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
            Phone number (optional)
          </label>
          <input
            name="phone"
            type="tel"
            placeholder="+91 98765 43210"
            className="w-full border-b border-ink/20 bg-transparent py-3 text-sm outline-none focus:border-gold transition"
          />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-wider font-semibold text-ink/60 mb-1">
            Password (min. 6 characters)
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
          {loading ? "Creating..." : "Create account"}
        </button>
      </form>

      <div className="mt-8 text-center text-xs text-ink/60">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-ink underline hover:text-gold">
          Sign in
        </Link>
      </div>
    </div>
  );
}
