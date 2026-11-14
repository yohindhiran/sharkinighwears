"use client";

import { FormEvent, useState } from "react";
import { ImageUpload } from "@/components/admin/image-upload";
import {
  Plus,
  RotateCw,
  Edit2,
  Trash2,
  Layers,
  AlertCircle,
  CheckCircle2,
  Search,
} from "lucide-react";

export type AdminCollection = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  imageUrl?: string | null;
  active: boolean;
  sortOrder: number;
  products: { product: { id: string; name: string } }[];
};

export type SimpleProduct = {
  id: string;
  name: string;
};

type FormState = {
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  active: boolean;
  sortOrder: string;
  productIds: string[];
};

const blankForm: FormState = {
  name: "",
  slug: "",
  description: "",
  imageUrl: "",
  active: true,
  sortOrder: "0",
  productIds: [],
};

export function CollectionsClient({
  initialCollections,
  products,
}: {
  initialCollections: AdminCollection[];
  products: SimpleProduct[];
}) {
  const [collections, setCollections] = useState<AdminCollection[]>(initialCollections);
  const [form, setForm] = useState<FormState>(blankForm);
  const [editing, setEditing] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [productSearch, setProductSearch] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function showMessage(msg: string, isError = false) {
    if (isError) {
      setError(msg);
      setSuccess("");
    } else {
      setSuccess(msg);
      setError("");
      setTimeout(() => setSuccess(""), 4000);
    }
  }

  async function reload() {
    setRefreshing(true);
    try {
      const response = await fetch("/api/admin/collections");
      if (!response.ok) throw new Error("Failed to load collections");
      const data = await response.json();
      if (Array.isArray(data)) {
        setCollections(data);
        showMessage("Collections refreshed from database.");
      }
    } catch (err) {
      showMessage(err instanceof Error ? err.message : "Error reloading collections", true);
    } finally {
      setRefreshing(false);
    }
  }

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => {
      const next = { ...current, [key]: value };
      if (key === "name" && !editing) {
        next.slug = String(value)
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)+/g, "");
      }
      return next;
    });
  }

  function openEdit(collection: AdminCollection) {
    setEditing(collection.id);
    setForm({
      name: collection.name,
      slug: collection.slug,
      description: collection.description ?? "",
      imageUrl: collection.imageUrl ?? "",
      active: collection.active,
      sortOrder: String(collection.sortOrder),
      productIds: collection.products.map(({ product }) => product.id),
    });
    setOpen(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    const payload = {
      ...form,
      sortOrder: Number(form.sortOrder) || 0,
    };

    try {
      const response = await fetch(
        editing ? `/api/admin/collections/${editing}` : "/api/admin/collections",
        {
          method: editing ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        showMessage(data.error || "Unable to save collection.", true);
        return;
      }

      showMessage(editing ? "Collection updated successfully." : "Collection created successfully.");
      setOpen(false);
      setEditing(null);
      setForm(blankForm);
      reload();
    } catch (err) {
      showMessage(err instanceof Error ? err.message : "Network error saving collection", true);
    } finally {
      setSubmitting(false);
    }
  }

  async function remove(collection: AdminCollection) {
    if (!window.confirm(`Delete collection "${collection.name}"?`)) return;
    try {
      const response = await fetch(`/api/admin/collections/${collection.id}`, { method: "DELETE" });
      if (!response.ok) {
        const data = await response.json();
        showMessage(data.error || "Unable to delete collection.", true);
        return;
      }
      setCollections((cur) => cur.filter((c) => c.id !== collection.id));
      showMessage(`Deleted "${collection.name}".`);
    } catch (err) {
      showMessage(err instanceof Error ? err.message : "Error deleting collection", true);
    }
  }

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(productSearch.toLowerCase())
  );

  return (
    <div>
      {/* Top Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[.14em] text-[#71808c]">Catalog</p>
          <h1 className="mt-2 text-3xl font-semibold text-[#17212b]">Collections</h1>
          <p className="mt-1 text-sm text-[#71808c]">
            Curated product groupings for promotional campaigns and seasonal edits.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={reload}
            disabled={refreshing}
            className="flex items-center gap-1.5 rounded-md border border-[#d5dde3] bg-white px-3.5 py-2 text-sm font-medium text-[#17212b] shadow-sm hover:bg-gray-50 transition"
            title="Refresh from database"
          >
            <RotateCw size={14} className={refreshing ? "animate-spin text-blue-600" : ""} />
            {refreshing ? "Syncing..." : "Sync DB"}
          </button>
          <button
            onClick={() => {
              setEditing(null);
              setForm(blankForm);
              setOpen(true);
            }}
            className="flex items-center gap-1.5 rounded-md bg-[#2563eb] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 transition"
          >
            <Plus size={16} /> Add collection
          </button>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="mt-4 flex items-center justify-between rounded-md bg-red-50 p-3.5 text-sm text-red-800 border border-red-200">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} className="text-red-600" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError("")} className="text-xs font-bold text-red-600 hover:underline">
            Dismiss
          </button>
        </div>
      )}
      {success && (
        <div className="mt-4 flex items-center gap-2 rounded-md bg-emerald-50 p-3.5 text-sm text-emerald-800 border border-emerald-200">
          <CheckCircle2 size={16} className="text-emerald-600" />
          <span>{success}</span>
        </div>
      )}

      {/* Form Modal / Section */}
      {open && (
        <form
          onSubmit={submit}
          className="mt-6 rounded-lg border border-[#e2e7eb] bg-white p-6 shadow-sm"
        >
          <div className="flex items-center justify-between border-b border-[#e2e7eb] pb-4 mb-6">
            <h2 className="text-lg font-semibold text-[#17212b]">
              {editing ? "Edit Collection" : "New Collection"}
            </h2>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-xs text-gray-500 hover:text-black"
            >
              Close
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-[#71808c] mb-1">Collection Name *</label>
              <input
                required
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                placeholder="e.g. Summer Cotton Edit"
                className="admin-input"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#71808c] mb-1">URL Slug *</label>
              <input
                required
                value={form.slug}
                onChange={(e) => update("slug", e.target.value)}
                placeholder="summer-cotton-edit"
                className="admin-input"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-[#71808c] mb-1">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
                placeholder="Short description of this collection..."
                rows={3}
                className="admin-input"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-[#71808c] mb-1">Cover Image</label>
              <ImageUpload value={form.imageUrl} onChange={(url) => update("imageUrl", url)} />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#71808c] mb-1">Display Sort Order</label>
              <input
                type="number"
                value={form.sortOrder}
                onChange={(e) => update("sortOrder", e.target.value)}
                placeholder="0"
                className="admin-input"
              />
            </div>

            <div className="flex items-center gap-2 pt-6">
              <input
                type="checkbox"
                id="active"
                checked={form.active}
                onChange={(e) => update("active", e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="active" className="text-sm font-medium text-gray-700">
                Visible in storefront
              </label>
            </div>

            {/* Product Picker */}
            <div className="md:col-span-2 rounded-md border border-[#e2e7eb] p-4 bg-gray-50/50">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#71808c]">
                  Select Products ({form.productIds.length} selected)
                </p>
                <div className="relative w-48">
                  <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    placeholder="Filter products..."
                    className="w-full rounded border border-gray-300 bg-white py-1 pl-7 pr-2 text-xs outline-none focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="grid gap-2 max-h-56 overflow-y-auto sm:grid-cols-2 lg:grid-cols-3 pr-2">
                {filteredProducts.map((product) => {
                  const isChecked = form.productIds.includes(product.id);
                  return (
                    <label
                      key={product.id}
                      className={`flex items-center gap-2 p-2 rounded text-xs cursor-pointer border transition ${
                        isChecked
                          ? "bg-blue-50 border-blue-200 text-blue-900 font-medium"
                          : "bg-white border-gray-200 text-gray-700 hover:bg-gray-100/70"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          const next = e.target.checked
                            ? [...form.productIds, product.id]
                            : form.productIds.filter((id) => id !== product.id);
                          update("productIds", next);
                        }}
                        className="rounded border-gray-300 text-blue-600"
                      />
                      <span className="truncate">{product.name}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center gap-3 border-t border-[#e2e7eb] pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-md bg-[#2563eb] px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition"
            >
              {submitting ? "Saving..." : editing ? "Update Collection" : "Save Collection"}
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-md border border-[#d5dde3] px-4 py-2.5 text-sm text-[#17212b] hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Collections Table */}
      <div className="mt-6 overflow-x-auto rounded-lg border border-[#e2e7eb] bg-white shadow-sm">
        <table className="w-full min-w-[700px] text-left text-sm">
          <thead className="border-b border-[#e2e7eb] bg-[#f8fafb] text-xs uppercase tracking-wide text-[#71808c]">
            <tr>
              <th className="p-4">Collection</th>
              <th>Slug</th>
              <th>Products Linked</th>
              <th>Order</th>
              <th>Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {collections.map((collection) => (
              <tr key={collection.id} className="border-b border-[#eef1f3] hover:bg-gray-50/50">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    {collection.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={collection.imageUrl}
                        alt={collection.name}
                        className="h-10 w-10 rounded object-cover border border-gray-200"
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded bg-gray-100 text-gray-400">
                        <Layers size={18} />
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-[#17212b]">{collection.name}</p>
                      {collection.description && (
                        <p className="text-xs text-[#71808c] line-clamp-1">{collection.description}</p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="font-mono text-xs text-[#71808c]">/{collection.slug}</td>
                <td>
                  <span className="font-semibold text-[#17212b]">
                    {collection.products?.length ?? 0}
                  </span>{" "}
                  <span className="text-xs text-gray-500">products</span>
                </td>
                <td className="text-xs text-gray-600 font-mono">{collection.sortOrder}</td>
                <td>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      collection.active
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-gray-100 text-gray-600 border border-gray-200"
                    }`}
                  >
                    {collection.active ? "Enabled" : "Disabled"}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => openEdit(collection)}
                      className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50"
                    >
                      <Edit2 size={13} /> Edit
                    </button>
                    <button
                      onClick={() => remove(collection)}
                      className="flex items-center gap-1 text-xs font-medium text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50 ml-2"
                    >
                      <Trash2 size={13} /> Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {!collections.length && (
              <tr>
                <td colSpan={6} className="p-10 text-center text-[#71808c]">
                  <Layers size={32} className="mx-auto mb-2 text-gray-300" />
                  <p className="font-medium text-gray-600">No collections in database.</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Click &quot;Add collection&quot; above to create curated collections.
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
