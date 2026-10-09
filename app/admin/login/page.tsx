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

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f2f2f2] px-6">
      <div className="w-full max-w-[420px] bg-[#fafafa] border border-gray-200 p-10 pb-8">
        <p className="text-[11px] font-bold uppercase tracking-[.18em] text-gray-500 mb-2">SHARKI</p>
        <h1 className="font-display text-4xl mb-2 text-[#211d1a]">Admin sign-in</h1>
        <p className="text-[13px] text-gray-600 mb-8">Authorised staff only.</p>
        
        <form onSubmit={submit} className="space-y-6">
          <div>
            <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-widest mb-1.5">Email</label>
            <input required name="email" type="email" placeholder="admin@sharki.com" autoComplete="username" className="w-full border border-gray-300 bg-[#f9f9f9] px-3 py-2.5 text-sm outline-none focus:border-gray-400" />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-widest mb-1.5">Password</label>
            <input required name="password" type="password" autoComplete="current-password" className="w-full border border-gray-300 bg-[#f9f9f9] px-3 py-2.5 text-sm outline-none focus:border-gray-400" />
          </div>
          
          {error && <p role="alert" className="text-[13px] text-rose">{error}</p>}
          
          <button disabled={busy} className="w-full bg-[#382b22] py-3.5 text-[12px] font-bold uppercase tracking-widest text-white hover:bg-ink transition-colors disabled:opacity-50">
            {busy ? "Signing in..." : "Sign in"}
          </button>
        </form>
        
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-[12px] text-gray-500 leading-tight">Admin accounts are provisioned by a superadmin in the Supabase dashboard. If you&apos;ve lost your password, ask a superadmin to reset it.</p>
        </div>
      </div>
    </div>
  );
}
