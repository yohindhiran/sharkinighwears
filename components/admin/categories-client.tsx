"use client";

import { FormEvent, useState } from "react";
import { ImageUpload } from "@/components/admin/image-upload";
import {
  Plus,
  RotateCw,
  Edit2,
  Trash2,
  FolderTree,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

export type AdminCategory = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  imageUrl?: string | null;
  active: boolean;
  sortOrder: number;
  _count?: { products: number };
};

type FormState = {
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  active: boolean;
  sortOrder: string;
};

const blankForm: FormState = {
  name: "",
  slug: "",
  description: "",
  imageUrl: "",
  active: true,
  sortOrder: "0",
};

export function CategoriesClient({
  initialCategories,
}: {
  initialCategories: AdminCategory[];
}) {
  const [categories, setCategories] = useState<AdminCategory[]>(initialCategories);
  const [form, setForm] = useState<FormState>(blankForm);
  const [editing, setEditing] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
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
      const response = await fetch("/api/admin/categories");
      if (!response.ok) throw new Error("Failed to load categories");
      const data = await response.json();
      if (Array.isArray(data)) {
        setCategories(data);
        showMessage("Categories refreshed from database.");
      }
    } catch (err) {
      showMessage(err instanceof Error ? err.message : "Error reloading categories", true);
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

  function openEdit(category: AdminCategory) {
    setEditing(category.id);
    setForm({
      name: category.name,
      slug: category.slug,
      description: category.description ?? "",
      imageUrl: category.imageUrl ?? "",
      active: category.active,
      sortOrder: String(category.sortOrder),
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
        editing ? `/api/admin/categories/${editing}` : "/api/admin/categories",
        {
          method: editing ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        showMessage(data.error || "Unable to save category.", true);
        return;
      }

      showMessage(editing ? "Category updated successfully." : "Category created successfully.");
      setOpen(false);
      setEditing(null);
      setForm(blankForm);
      reload();
    } catch (err) {
      showMessage(err instanceof Error ? err.message : "Network error saving category", true);
    } finally {
      setSubmitting(false);
    }
  }

  async function remove(category: AdminCategory) {
    if (!window.confirm(`Delete category "${category.name}"? Products will become uncategorized.`))
      return;
    try {
      const response = await fetch(`/api/admin/categories/${category.id}`, { method: "DELETE" });
      if (!response.ok) {
        const data = await response.json();
        showMessage(data.error || "Unable to delete category.", true);
        return;
      }
      setCategories((cur) => cur.filter((c) => c.id !== category.id));
      showMessage(`Deleted "${category.name}".`);
    } catch (err) {
      showMessage(err instanceof Error ? err.message : "Error deleting category", true);
    }
  }

  return (
    <div>
      {/* Top Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[.14em] text-[#71808c]">Catalog</p>
          <h1 className="mt-2 text-3xl font-semibold text-[#17212b]">Categories</h1>
          <p className="mt-1 text-sm text-[#71808c]">
            {categories.length} categories active in the store navigation and catalog.
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
            <Plus size={16} /> Add category
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
              {editing ? "Edit Category" : "New Category"}
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
              <label className="block text-xs font-semibold text-[#71808c] mb-1">Category Name *</label>
              <input
                required
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                placeholder="e.g. Nighties"
                className="admin-input"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#71808c] mb-1">URL Slug *</label>
              <input
                required
                value={form.slug}
                onChange={(e) => update("slug", e.target.value)}
                placeholder="nighties"
                className="admin-input"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-[#71808c] mb-1">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
                placeholder="Short description of this category..."
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
                Visible in storefront navigation
              </label>
            </div>
          </div>

          <div className="mt-6 flex items-center gap-3 border-t border-[#e2e7eb] pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-md bg-[#2563eb] px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition"
            >
              {submitting ? "Saving..." : editing ? "Update Category" : "Save Category"}
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

      {/* Categories Table */}
      <div className="mt-6 overflow-x-auto rounded-lg border border-[#e2e7eb] bg-white shadow-sm">
        <table className="w-full min-w-[700px] text-left text-sm">
          <thead className="border-b border-[#e2e7eb] bg-[#f8fafb] text-xs uppercase tracking-wide text-[#71808c]">
            <tr>
              <th className="p-4">Category</th>
              <th>Slug</th>
              <th>Products Linked</th>
              <th>Order</th>
              <th>Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => (
              <tr key={category.id} className="border-b border-[#eef1f3] hover:bg-gray-50/50">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    {category.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={category.imageUrl}
                        alt={category.name}
                        className="h-10 w-10 rounded object-cover border border-gray-200"
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded bg-gray-100 text-gray-400">
                        <FolderTree size={18} />
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-[#17212b]">{category.name}</p>
                      {category.description && (
                        <p className="text-xs text-[#71808c] line-clamp-1">{category.description}</p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="font-mono text-xs text-[#71808c]">/{category.slug}</td>
                <td>
                  <span className="font-semibold text-[#17212b]">
                    {category._count?.products ?? 0}
                  </span>{" "}
                  <span className="text-xs text-gray-500">items</span>
                </td>
                <td className="text-xs text-gray-600 font-mono">{category.sortOrder}</td>
                <td>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      category.active
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-gray-100 text-gray-600 border border-gray-200"
                    }`}
                  >
                    {category.active ? "Enabled" : "Disabled"}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => openEdit(category)}
                      className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50"
                    >
                      <Edit2 size={13} /> Edit
                    </button>
                    <button
                      onClick={() => remove(category)}
                      className="flex items-center gap-1 text-xs font-medium text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50 ml-2"
                    >
                      <Trash2 size={13} /> Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {!categories.length && (
              <tr>
                <td colSpan={6} className="p-10 text-center text-[#71808c]">
                  <FolderTree size={32} className="mx-auto mb-2 text-gray-300" />
                  <p className="font-medium text-gray-600">No categories in database.</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Click &quot;Add category&quot; above to create your first category.
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
