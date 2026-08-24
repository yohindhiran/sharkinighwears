"use client";

import { FormEvent, useEffect, useState } from "react";

type Promotion = { text: string; active: boolean };

export default function PromotionsPage() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Hydrate the editor from the shared promotions content record.
  useEffect(() => {
    fetch("/api/admin/content/promotions")
      .then((response) => response.json())
      .then((data) => {
        if (Array.isArray(data.promotions)) {
          setPromotions(data.promotions.map((item: Record<string, unknown>) => ({ text: typeof item.text === "string" ? item.text : typeof item.title === "string" ? item.title : "", active: item.active !== false && item.enabled !== false })));
        }
      });
  }, []);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    const response = await fetch("/api/admin/content/promotions", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ promotions: promotions.map((promotion) => ({ text: promotion.text.trim(), active: promotion.active, enabled: promotion.active })) }),
    });
    if (response.ok) { setMessage("Promotions saved. The storefront homepage now shows the current database state."); }
    else { setMessage(""); setError((await response.json()).error ?? "Unable to save promotions."); }
  }

  function update(index: number, patch: Partial<Promotion>) {
    setPromotions((current) => current.map((promotion, i) => (i === index ? { ...promotion, ...patch } : promotion)));
  }

  return <div><p className="text-xs font-semibold uppercase tracking-[.14em] text-[#71808c]">Marketing</p><h1 className="mt-2 text-3xl font-semibold">Promotions</h1><p className="mt-2 text-sm text-[#71808c]">Promotions are stored in the shared database record used by the storefront homepage banner.</p><form onSubmit={submit} className="mt-8 max-w-3xl space-y-4 rounded-lg border border-[#e2e7eb] bg-white p-6"><div className="space-y-3">{promotions.length ? promotions.map((promotion, index) => <div key={index} className="grid gap-2 rounded-md border border-[#e2e7eb] p-3 sm:grid-cols-[1fr_auto_auto]"><input value={promotion.text} onChange={(event) => update(index, { text: event.target.value })} placeholder="Promotion text" className="admin-input" /><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={promotion.active} onChange={(event) => update(index, { active: event.target.checked })} /> Enabled</label><button type="button" onClick={() => setPromotions((current) => current.filter((_, i) => i !== index))} className="text-xs font-semibold uppercase tracking-[.14em] text-[#b42318]">Remove</button></div>) : <p className="rounded-md border border-dashed border-[#cbd5dc] p-4 text-sm text-[#71808c]">No promotions yet. Add a promotion banner to show on the storefront homepage.</p>}</div><button type="button" onClick={() => setPromotions((current) => [...current, { text: "", active: true }])} className="rounded-md border border-[#e2e7eb] px-4 py-2.5 text-sm font-medium text-[#24313d]">Add promotion</button><div className="flex items-center gap-3"><button className="rounded-md bg-[#2563eb] px-4 py-2.5 text-sm font-medium text-white">Save promotions</button>{message && <p className="text-sm text-[#287a3d]">{message}</p>}{error && <p className="text-sm text-[#b42318]">{error}</p>}</div></form></div>;
}
