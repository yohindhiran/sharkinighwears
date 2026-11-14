"use client";

import { useState } from "react";
import { PageIntro } from "@/components/storefront/page-intro";
import { CheckCircle2 } from "lucide-react";

export default function WholesalePage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const payload = {
      businessName: formData.get("businessName") as string,
      contactName: formData.get("contactName") as string,
      phone: formData.get("phone") as string,
      email: formData.get("email") as string,
      location: formData.get("location") as string,
      gstNumber: (formData.get("gstNumber") as string) || undefined,
      expectedQuantity: Number(formData.get("expectedQuantity")) || undefined,
      message: (formData.get("message") as string) || undefined,
    };

    try {
      const res = await fetch("/api/wholesale", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit enquiry.");
      }

      setSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <PageIntro
        title="Wholesale"
        description="Partner with SHARKI Nightwears to bring thoughtfully crafted nightwear to your customers. Discover our collections, quality, and flexible wholesale opportunities."
      />
      <div className="mx-auto max-w-[1100px] px-6 py-16 md:px-12 md:py-24">
        <div className="mt-0 grid gap-12 md:grid-cols-[1fr_1.1fr]">
          <div className="bg-sand p-8 md:p-10">
            <p className="eyebrow text-gold">The SHARKI difference</p>
            <div className="mt-8 space-y-7">
              {[
                ["Own manufacturing", "A close eye on fabric, fit and finishing from our own house."],
                ["Flexible bulk supply", "Thoughtful assortments for boutiques, resellers and growing stores."],
                ["A partner in comfort", "Dedicated support from first conversation to repeat order."],
              ].map(([title, text]) => (
                <div key={title}>
                  <h2 className="text-sm font-bold uppercase tracking-[.12em]">{title}</h2>
                  <p className="mt-2 text-sm leading-6 text-ink/60">{text}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            {success ? (
              <div className="border border-emerald-200 bg-emerald-50 p-8 text-center rounded">
                <CheckCircle2 size={40} className="mx-auto text-emerald-600 mb-4" />
                <h2 className="display text-3xl text-emerald-900">Enquiry Received!</h2>
                <p className="mt-3 text-sm text-emerald-700 leading-6">
                  Thank you for your interest in SHARKI Nightwears. Our wholesale partnership team will review
                  your requirements and get in touch within 24 hours.
                </p>
                <button
                  onClick={() => setSuccess(false)}
                  className="mt-6 text-xs font-bold uppercase tracking-wider underline text-emerald-900"
                >
                  Send another enquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <p className="eyebrow text-gold">Become a wholesale partner</p>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 text-xs text-red-700 rounded">
                    {error}
                  </div>
                )}

                <input
                  name="businessName"
                  required
                  placeholder="Business name"
                  className="w-full border-b border-ink/20 bg-transparent px-0 py-3 text-sm outline-none placeholder:text-ink/45 focus:border-gold"
                />
                <input
                  name="contactName"
                  required
                  placeholder="Contact person"
                  className="w-full border-b border-ink/20 bg-transparent px-0 py-3 text-sm outline-none placeholder:text-ink/45 focus:border-gold"
                />
                <input
                  name="phone"
                  required
                  type="tel"
                  placeholder="Mobile number"
                  className="w-full border-b border-ink/20 bg-transparent px-0 py-3 text-sm outline-none placeholder:text-ink/45 focus:border-gold"
                />
                <input
                  name="email"
                  required
                  type="email"
                  placeholder="Email address"
                  className="w-full border-b border-ink/20 bg-transparent px-0 py-3 text-sm outline-none placeholder:text-ink/45 focus:border-gold"
                />
                <input
                  name="location"
                  required
                  placeholder="City / Location"
                  className="w-full border-b border-ink/20 bg-transparent px-0 py-3 text-sm outline-none placeholder:text-ink/45 focus:border-gold"
                />
                <input
                  name="gstNumber"
                  placeholder="GST number (optional)"
                  className="w-full border-b border-ink/20 bg-transparent px-0 py-3 text-sm outline-none placeholder:text-ink/45 focus:border-gold"
                />
                <input
                  name="expectedQuantity"
                  required
                  type="number"
                  min="1"
                  placeholder="Approximate quantity required (units)"
                  className="w-full border-b border-ink/20 bg-transparent px-0 py-3 text-sm outline-none placeholder:text-ink/45 focus:border-gold"
                />
                <textarea
                  name="message"
                  required
                  placeholder="Tell us about your requirements (fabrics, sizes, target market)"
                  rows={4}
                  className="w-full resize-none border-b border-ink/20 bg-transparent px-0 py-3 text-sm outline-none placeholder:text-ink/45 focus:border-gold"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-ink py-4 text-xs font-bold uppercase tracking-[.16em] text-white hover:bg-gold transition disabled:opacity-60"
                >
                  {loading ? "Sending..." : "Send enquiry"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
