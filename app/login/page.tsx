"use client";

import { useState } from "react";
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
    <div className="mx-auto max-w-md px-6 py-20">
      <p className="eyebrow text-rose">Your account</p>
      <h1 className="display mt-4 text-6xl">Sign in.</h1>
      
      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
      
      <form action={handleSubmit} className="mt-10 space-y-5">
        <input name="email" required type="email" placeholder="Email address" className="w-full border-b border-ink/20 bg-transparent py-3 text-sm outline-none focus:border-rose" />
        <input name="password" required type="password" placeholder="Password" className="w-full border-b border-ink/20 bg-transparent py-3 text-sm outline-none focus:border-rose" />
        <button disabled={loading} className="w-full bg-ink py-4 text-xs font-bold uppercase tracking-[.16em] text-white disabled:opacity-70">
          {loading ? "Signing in..." : "Continue"}
        </button>
      </form>
    </div>
  );
}
