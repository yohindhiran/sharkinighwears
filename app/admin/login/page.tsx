"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setBusy(true);
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: form.get("email"), password: form.get("password") }) });
      if (response.ok) router.push("/admin/dashboard");
      else setError((await response.json()).error ?? "Unable to sign in.");
    } catch {
      setError("Unable to reach the authentication server.");
    }
    setBusy(false);
  }

  return <div className="flex min-h-[70vh] items-center justify-center bg-[#fbfaf8] px-6"><div className="w-full max-w-sm"><p className="eyebrow text-rose">Private workspace</p><h1 className="display mt-4 text-6xl">Admin sign in.</h1><form onSubmit={submit} className="mt-10 space-y-5"><input required name="email" type="email" placeholder="Admin email" autoComplete="username" className="w-full border-b border-ink/20 bg-transparent py-3 text-sm outline-none focus:border-rose" /><input required name="password" type="password" placeholder="Password" autoComplete="current-password" className="w-full border-b border-ink/20 bg-transparent py-3 text-sm outline-none focus:border-rose" />{error && <p role="alert" className="text-sm text-rose">{error}</p>}<button disabled={busy} className="w-full bg-ink py-4 text-xs font-bold uppercase tracking-[.16em] text-white disabled:opacity-50">{busy ? "Signing in..." : "Enter workspace"}</button></form></div></div>;
}
