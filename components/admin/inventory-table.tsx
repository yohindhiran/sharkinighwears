"use client";

import { useState } from "react";

type Variant = { id: string; sku: string; stock: number; lowStockThreshold: number; product: { name: string } };

export function InventoryTable({ variants }: { variants: Variant[] }) {
  const [items, setItems] = useState(variants);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const filtered = items.filter((variant) => `${variant.product.name} ${variant.sku}`.toLowerCase().includes(query.toLowerCase()));
  async function updateStock(id: string, stock: string) {
    const response = await fetch(`/api/admin/inventory/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ stock }) });
    if (!response.ok) { setError("Unable to update stock."); return; }
    setItems((current) => current.map((item) => item.id === id ? { ...item, stock: Number(stock) } : item));
  }
  return <><div className="mt-8"><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search product or SKU" className="admin-input max-w-sm" /></div>{error && <p className="mt-3 text-sm text-[#b42318]">{error}</p>}<div className="mt-4 overflow-x-auto rounded-lg border border-[#e2e7eb] bg-white"><table className="w-full min-w-[850px] text-left text-sm"><thead className="border-b border-[#e2e7eb] bg-[#f8fafb] text-xs uppercase tracking-wide text-[#71808c]"><tr><th className="p-4">Product</th><th>SKU</th><th>Stock quantity</th><th>Reserved</th><th>Available</th><th>Reorder at</th><th>Status</th></tr></thead><tbody>{filtered.map((variant) => <tr key={variant.id} className="border-b border-[#eef1f3]"><td className="p-4 font-medium">{variant.product.name}</td><td>{variant.sku}</td><td><input type="number" min="0" defaultValue={variant.stock} onBlur={(event) => updateStock(variant.id, event.target.value)} className="w-24 rounded border border-[#e2e7eb] px-2 py-1" /></td><td>0</td><td>{variant.stock}</td><td>{variant.lowStockThreshold}</td><td className={variant.stock === 0 ? "text-[#b42318]" : variant.stock <= variant.lowStockThreshold ? "text-[#9a6b1c]" : "text-[#287a3d]"}>{variant.stock === 0 ? "Out of stock" : variant.stock <= variant.lowStockThreshold ? "Low stock" : "In stock"}</td></tr>)}{!filtered.length && <tr><td colSpan={7} className="p-8 text-center text-[#71808c]">No inventory records in the database.</td></tr>}</tbody></table></div></>;
}
