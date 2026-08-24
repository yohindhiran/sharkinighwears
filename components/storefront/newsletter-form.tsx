"use client";

import { useState } from "react";
import { ArrowRight, Check } from "lucide-react";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setState("loading");
    setMessage("");
    try {
      const response = await fetch("/api/newsletter", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
      const data = await response.json().catch(() => ({}));
      if (response.ok) {
        setState("done");
        setEmail("");
      } else {
        setState("error");
        setMessage(typeof data.error === "string" ? data.error : "Unable to subscribe right now.");
      }
    } catch {
      setState("error");
      setMessage("Unable to subscribe right now.");
    }
  }

  if (state === "done") {
    return (
      <p className="mx-auto flex max-w-md items-center justify-center gap-3 border border-gold/40 bg-gold/10 px-6 py-4 text-sm text-ink">
        <Check size={16} className="text-gold" /> Welcome to the list. Watch your inbox for new drops.
      </p>
    );
  }

  return (
    <form onSubmit={submit} className="mx-auto max-w-md">
      <div className="flex items-center gap-3 border-b border-white/30 pb-3 focus-within:border-white/70">
        <input
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Your email address"
          aria-label="Email address"
          className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/45"
        />
        <button type="submit" disabled={state === "loading"} className="flex shrink-0 items-center gap-2 text-[11px] font-bold uppercase tracking-[.2em] text-white transition hover:text-gold disabled:opacity-50">
          {state === "loading" ? "Joining" : "Subscribe"} <ArrowRight size={14} />
        </button>
      </div>
      {state === "error" && <p className="mt-3 text-xs text-red-300">{message}</p>}
    </form>
  );
}
