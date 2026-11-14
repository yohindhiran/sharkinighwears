"use client";

import { useState } from "react";
import { Check, Loader2 } from "lucide-react";

type Variant = {
  id: string;
  sku: string;
  stock: number;
  lowStockThreshold: number;
  product: { name: string };
};

export function InventoryTable({ variants }: { variants: Variant[] }) {
  const [items, setItems] = useState(variants);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);

  const filtered = items.filter((variant) =>
    `${variant.product.name} ${variant.sku}`.toLowerCase().includes(query.toLowerCase())
  );

  async function updateStock(id: string, newStockVal: string, currentStock: number) {
    const trimmed = newStockVal.trim();
    if (trimmed === "") return;
    const num = Number(trimmed);
    if (isNaN(num) || num < 0) {
      setError("Please enter a valid non-negative number.");
      return;
    }

    if (num === currentStock) {
      return; // No change needed
    }

    setError("");
    setSavingId(id);
    setSavedId(null);

    try {
      const response = await fetch(`/api/admin/inventory/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stock: num }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Unable to update stock. Please try again.");
        return;
      }

      setItems((current) =>
        current.map((item) => (item.id === id ? { ...item, stock: num } : item))
      );
      setSavedId(id);
      setTimeout(() => setSavedId(null), 2500);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Network error updating stock.";
      setError(message);
    } finally {
      setSavingId(null);
    }
  }

  return (
    <>
      <div className="mt-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search product or SKU..."
          className="admin-input max-w-sm"
        />
        <p className="text-xs text-[#71808c]">
          Showing {filtered.length} of {items.length} variants
        </p>
      </div>

      {error && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 text-sm text-[#b42318] rounded flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={() => setError("")}
            className="text-xs font-bold text-red-600 hover:underline ml-4"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="mt-4 overflow-x-auto rounded-lg border border-[#e2e7eb] bg-white shadow-sm">
        <table className="w-full min-w-[850px] text-left text-sm">
          <thead className="border-b border-[#e2e7eb] bg-[#f8fafb] text-xs uppercase tracking-wide text-[#71808c]">
            <tr>
              <th className="p-4">Product</th>
              <th>SKU</th>
              <th>Stock quantity</th>
              <th>Reserved</th>
              <th>Available</th>
              <th>Reorder at</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((variant) => {
              const isSaving = savingId === variant.id;
              const isSaved = savedId === variant.id;
              const statusText =
                variant.stock === 0
                  ? "Out of stock"
                  : variant.stock <= variant.lowStockThreshold
                  ? "Low stock"
                  : "In stock";
              const statusColor =
                variant.stock === 0
                  ? "text-[#b42318]"
                  : variant.stock <= variant.lowStockThreshold
                  ? "text-[#9a6b1c]"
                  : "text-[#287a3d]";

              return (
                <tr key={variant.id} className="border-b border-[#eef1f3] hover:bg-gray-50/50">
                  <td className="p-4 font-medium text-[#17212b]">{variant.product.name}</td>
                  <td className="font-mono text-xs text-[#71808c]">{variant.sku}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        defaultValue={variant.stock}
                        key={`${variant.id}-${variant.stock}`}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            updateStock(variant.id, e.currentTarget.value, variant.stock);
                            e.currentTarget.blur();
                          }
                        }}
                        onBlur={(event) =>
                          updateStock(variant.id, event.target.value, variant.stock)
                        }
                        disabled={isSaving}
                        className="w-20 rounded border border-[#e2e7eb] px-2.5 py-1 text-sm outline-none focus:border-[#42624d] transition disabled:bg-gray-100"
                      />
                      {isSaving && <Loader2 size={14} className="animate-spin text-gray-400" />}
                      {isSaved && (
                        <span className="flex items-center gap-0.5 text-xs text-emerald-600 font-medium">
                          <Check size={14} /> Saved
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="text-[#71808c]">0</td>
                  <td className="font-semibold text-[#17212b]">{variant.stock}</td>
                  <td className="text-[#71808c]">{variant.lowStockThreshold}</td>
                  <td className={`font-medium ${statusColor}`}>{statusText}</td>
                </tr>
              );
            })}
            {!filtered.length && (
              <tr>
                <td colSpan={7} className="p-8 text-center text-[#71808c]">
                  No inventory records match your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
