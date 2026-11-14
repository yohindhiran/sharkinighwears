"use client";

import { useState } from "react";
import { Check, Loader2, AlertCircle, ChevronLeft, ChevronRight, Search } from "lucide-react";

type Variant = {
  id: string;
  sku: string;
  stock: number;
  lowStockThreshold: number;
  product: { name: string };
};

const PAGE_SIZE = 30;

export function InventoryTable({ variants }: { variants: Variant[] }) {
  const [items, setItems] = useState<Variant[]>(variants);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"ALL" | "OUT" | "LOW" | "IN">("ALL");
  const [page, setPage] = useState(1);
  const [error, setError] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);

  // Filter items
  const filtered = items.filter((variant) => {
    const matchesQuery = `${variant.product.name} ${variant.sku}`
      .toLowerCase()
      .includes(query.toLowerCase());
    if (!matchesQuery) return false;

    if (filter === "OUT") return variant.stock === 0;
    if (filter === "LOW") return variant.stock > 0 && variant.stock <= variant.lowStockThreshold;
    if (filter === "IN") return variant.stock > variant.lowStockThreshold;
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pagedItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

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

    // Optimistic update
    const previousStock = currentStock;
    setItems((current) =>
      current.map((item) => (item.id === id ? { ...item, stock: num } : item))
    );

    try {
      const response = await fetch(`/api/admin/inventory/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stock: num }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Rollback
        setItems((current) =>
          current.map((item) => (item.id === id ? { ...item, stock: previousStock } : item))
        );
        setError(data.error || "Unable to update stock. Please try again.");
        return;
      }

      setSavedId(id);
      setTimeout(() => setSavedId(null), 2500);
    } catch (err: unknown) {
      // Rollback
      setItems((current) =>
        current.map((item) => (item.id === id ? { ...item, stock: previousStock } : item))
      );
      const message = err instanceof Error ? err.message : "Network error updating stock.";
      setError(message);
    } finally {
      setSavingId(null);
    }
  }

  const outOfStockCount = items.filter((i) => i.stock === 0).length;
  const lowStockCount = items.filter((i) => i.stock > 0 && i.stock <= i.lowStockThreshold).length;

  return (
    <>
      {/* Search & Status Filters */}
      <div className="mt-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-1 flex-wrap items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setPage(1);
              }}
              placeholder="Search product or SKU..."
              className="admin-input pl-9"
            />
          </div>

          <div className="flex items-center gap-1 rounded-lg border border-[#e2e7eb] bg-white p-1 text-xs">
            <button
              onClick={() => {
                setFilter("ALL");
                setPage(1);
              }}
              className={`rounded px-3 py-1 font-medium transition ${
                filter === "ALL" ? "bg-[#17212b] text-white" : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              All ({items.length})
            </button>
            <button
              onClick={() => {
                setFilter("OUT");
                setPage(1);
              }}
              className={`rounded px-3 py-1 font-medium transition ${
                filter === "OUT" ? "bg-red-600 text-white" : "text-red-700 hover:bg-red-50"
              }`}
            >
              Out of stock ({outOfStockCount})
            </button>
            <button
              onClick={() => {
                setFilter("LOW");
                setPage(1);
              }}
              className={`rounded px-3 py-1 font-medium transition ${
                filter === "LOW" ? "bg-amber-600 text-white" : "text-amber-700 hover:bg-amber-50"
              }`}
            >
              Low stock ({lowStockCount})
            </button>
            <button
              onClick={() => {
                setFilter("IN");
                setPage(1);
              }}
              className={`rounded px-3 py-1 font-medium transition ${
                filter === "IN" ? "bg-emerald-700 text-white" : "text-emerald-700 hover:bg-emerald-50"
              }`}
            >
              In stock
            </button>
          </div>
        </div>

        <p className="text-xs text-[#71808c]">
          Showing {filtered.length} of {items.length} variants
        </p>
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 text-sm text-[#b42318] rounded flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
          <button
            onClick={() => setError("")}
            className="text-xs font-bold text-red-600 hover:underline ml-4"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Inventory Table */}
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
            {pagedItems.map((variant) => {
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
                  ? "text-[#b42318] bg-red-50 border-red-200"
                  : variant.stock <= variant.lowStockThreshold
                  ? "text-[#9a6b1c] bg-amber-50 border-amber-200"
                  : "text-[#287a3d] bg-emerald-50 border-emerald-200";

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
                        className="w-20 rounded border border-[#e2e7eb] px-2.5 py-1 text-sm outline-none focus:border-[#42624d] transition disabled:bg-gray-100 font-medium"
                      />
                      {isSaving && <Loader2 size={14} className="animate-spin text-blue-600" />}
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
                  <td>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border ${statusColor}`}
                    >
                      {statusText}
                    </span>
                  </td>
                </tr>
              );
            })}
            {!pagedItems.length && (
              <tr>
                <td colSpan={7} className="p-8 text-center text-[#71808c]">
                  No inventory records match your search or filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-xs text-[#71808c]">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="flex items-center gap-1 rounded border border-[#d5dde3] bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40"
            >
              <ChevronLeft size={14} /> Previous
            </button>
            <span className="text-xs font-medium text-gray-600 px-2">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="flex items-center gap-1 rounded border border-[#d5dde3] bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40"
            >
              Next <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
