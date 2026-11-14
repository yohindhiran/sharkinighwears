"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";

export default function ContactPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const payload = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      message: formData.get("message") as string,
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send message.");

      setSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-[1000px] px-6 py-16 md:px-12 md:py-24">
      <p className="eyebrow text-gold">We are here</p>
      <h1 className="display mt-4 text-6xl md:text-7xl">Let’s talk.</h1>

      <div className="mt-14 grid gap-12 md:grid-cols-2">
        <div>
          <p className="max-w-sm text-sm leading-7 text-ink/65">
            Questions about a piece, sizing, custom requests or an existing order? Leave us a note and our house team will be delighted to help.
          </p>
          <div className="mt-10 space-y-4 text-sm text-ink/80">
            <p><strong>Email:</strong> sharkinightwears@gmail.com</p>
            <p><strong>Support:</strong> Monday–Saturday, 10am–6pm IST</p>
            <p><strong>House:</strong> Direct Manufacturing Unit, Tamil Nadu, India</p>
          </div>
        </div>

        <div>
          {success ? (
            <div className="border border-emerald-200 bg-emerald-50 p-8 text-center rounded">
              <CheckCircle2 size={36} className="mx-auto text-emerald-600 mb-3" />
              <h2 className="display text-2xl text-emerald-900">Message Delivered</h2>
              <p className="mt-2 text-sm text-emerald-700 leading-6">
                Thank you for getting in touch. We have received your note and will reply to your email shortly.
              </p>
              <button
                onClick={() => setSuccess(false)}
                className="mt-5 text-xs font-bold uppercase tracking-wider underline text-emerald-900"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-xs text-red-700 rounded">
                  {error}
                </div>
              )}
              <input
                name="name"
                required
                placeholder="Your name"
                className="w-full border-b border-ink/20 bg-transparent py-3 text-sm outline-none focus:border-gold transition"
              />
              <input
                name="email"
                required
                type="email"
                placeholder="Email address"
                className="w-full border-b border-ink/20 bg-transparent py-3 text-sm outline-none focus:border-gold transition"
              />
              <textarea
                name="message"
                required
                rows={5}
                placeholder="How can we help?"
                className="w-full resize-none border-b border-ink/20 bg-transparent py-3 text-sm outline-none focus:border-gold transition"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-ink py-4 text-xs font-bold uppercase tracking-[.16em] text-white hover:bg-gold transition disabled:opacity-60"
              >
                {loading ? "Sending..." : "Send message"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
