"use client";

import { FormEvent, useState } from "react";
import { ImageUpload } from "@/components/admin/image-upload";
import {
  Plus,
  Search,
  RotateCw,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Package,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

export type AdminCategory = {
  id: string;
  name: string;
};

export type AdminProduct = {
  id: string;
  name: string;
  slug: string;
  sku: string;
  description: string;
  price: number;
  salePrice: number | null;
  status: string;
  featured: boolean;
  category: { id: string; name: string };
  variants: { id: string; stock: number }[];
  images: { url: string }[];
};

type FormState = {
  name: string;
  slug: string;
  sku: string;
  description: string;
  price: string;
  salePrice: string;
  categoryId: string;
  image: string;
  stock: string;
  status: "DRAFT" | "ACTIVE" | "ARCHIVED";
  featured: boolean;
};

const emptyForm: FormState = {
  name: "",
  slug: "",
  sku: "",
  description: "",
  price: "",
  salePrice: "",
  categoryId: "",
  image: "",
  stock: "0",
  status: "ACTIVE",
  featured: false,
};

const PAGE_SIZE = 25;

export function ProductsClient({
  initialProducts,
  categories,
}: {
  initialProducts: AdminProduct[];
  categories: AdminCategory[];
}) {
  const [products, setProducts] = useState<AdminProduct[]>(initialProducts);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [page, setPage] = useState(1);

  const [form, setForm] = useState<FormState>(emptyForm);
  const [editing, setEditing] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
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
      const res = await fetch("/api/admin/products");
      if (!res.ok) throw new Error("Failed to load products");
      const data = await res.json();
      if (Array.isArray(data)) {
        setProducts(data);
        showMessage("Products refreshed from database.");
      }
    } catch (err) {
      showMessage(err instanceof Error ? err.message : "Error reloading products", true);
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

  function openEdit(product: AdminProduct) {
    setEditing(product.id);
    const totalStock = product.variants?.reduce((sum, v) => sum + v.stock, 0) ?? 0;
    setForm({
      name: product.name,
      slug: product.slug,
      sku: product.sku,
      description: product.description,
      price: String(product.price),
      salePrice: product.salePrice ? String(product.salePrice) : "",
      categoryId: product.category?.id ?? "",
      image: product.images?.[0]?.url ?? "",
      stock: String(totalStock),
      status: (product.status as FormState["status"]) || "ACTIVE",
      featured: product.featured,
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    const payload = {
      ...form,
      price: Number(form.price),
      salePrice: form.salePrice ? Number(form.salePrice) : null,
      stock: Number(form.stock),
      sizes: [],
      colors: [],
    };

    try {
      const response = await fetch(
        editing ? `/api/admin/products/${editing}` : "/api/admin/products",
        {
          method: editing ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        showMessage(data.error || "Unable to save product.", true);
        return;
      }

      showMessage(editing ? "Product updated successfully." : "Product created successfully.");
      setForm(emptyForm);
      setEditing(null);
      setShowForm(false);
      reload();
    } catch (err) {
      showMessage(err instanceof Error ? err.message : "Network error saving product", true);
    } finally {
      setSubmitting(false);
    }
  }

  async function remove(product: AdminProduct) {
    if (!window.confirm(`Are you sure you want to delete "${product.name}"?`)) return;
    try {
      const response = await fetch(`/api/admin/products/${product.id}`, { method: "DELETE" });
      if (!response.ok) {
        const data = await response.json();
        showMessage(data.error || "Unable to delete product.", true);
        return;
      }
      setProducts((cur) => cur.filter((p) => p.id !== product.id));
      showMessage(`Deleted "${product.name}".`);
    } catch (err) {
      showMessage(err instanceof Error ? err.message : "Error deleting product", true);
    }
  }

  // Filtered products
  const filtered = products.filter((p) => {
    const matchQuery =
      !query ||
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.sku.toLowerCase().includes(query.toLowerCase()) ||
      p.category?.name.toLowerCase().includes(query.toLowerCase());
    const matchStatus = statusFilter === "ALL" || p.status === statusFilter;
    const matchCat = categoryFilter === "ALL" || p.category?.id === categoryFilter;
    return matchQuery && matchStatus && matchCat;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pagedProducts = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <div>
      {/* Top Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[.14em] text-[#71808c]">Catalog</p>
          <h1 className="mt-2 text-3xl font-semibold text-[#17212b]">Products</h1>
          <p className="mt-1 text-sm text-[#71808c]">
            {products.length} total products loaded live from the database.
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
              setForm(emptyForm);
              setShowForm(true);
            }}
            className="flex items-center gap-1.5 rounded-md bg-[#2563eb] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 transition"
          >
            <Plus size={16} /> Add product
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

      {/* Product Form Modal / Section */}
      {showForm && (
        <form
          onSubmit={submit}
          className="mt-6 rounded-lg border border-[#e2e7eb] bg-white p-6 shadow-sm"
        >
          <div className="flex items-center justify-between border-b border-[#e2e7eb] pb-4 mb-6">
            <h2 className="text-lg font-semibold text-[#17212b]">
              {editing ? "Edit Product" : "New Product"}
            </h2>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="text-xs text-gray-500 hover:text-black"
            >
              Close
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-[#71808c] mb-1">Product Name *</label>
              <input
                required
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                placeholder="e.g. Classic Cotton Nightdress"
                className="admin-input"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#71808c] mb-1">URL Slug *</label>
              <input
                required
                value={form.slug}
                onChange={(e) => update("slug", e.target.value)}
                placeholder="classic-cotton-nightdress"
                className="admin-input"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#71808c] mb-1">SKU *</label>
              <input
                required
                value={form.sku}
                onChange={(e) => update("sku", e.target.value)}
                placeholder="SHR-COT-01"
                className="admin-input"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#71808c] mb-1">Category *</label>
              <select
                required
                value={form.categoryId}
                onChange={(e) => update("categoryId", e.target.value)}
                className="admin-input"
              >
                <option value="">Select category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#71808c] mb-1">Price (₹) *</label>
              <input
                required
                type="number"
                min="0"
                value={form.price}
                onChange={(e) => update("price", e.target.value)}
                placeholder="999"
                className="admin-input"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#71808c] mb-1">Sale Price (₹)</label>
              <input
                type="number"
                min="0"
                value={form.salePrice}
                onChange={(e) => update("salePrice", e.target.value)}
                placeholder="799 (optional)"
                className="admin-input"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#71808c] mb-1">Total Stock Quantity *</label>
              <input
                required
                type="number"
                min="0"
                value={form.stock}
                onChange={(e) => update("stock", e.target.value)}
                placeholder="50"
                className="admin-input"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#71808c] mb-1">Status</label>
              <select
                value={form.status}
                onChange={(e) => update("status", e.target.value as FormState["status"])}
                className="admin-input"
              >
                <option value="ACTIVE">Published (Active)</option>
                <option value="DRAFT">Draft</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-[#71808c] mb-1">Primary Product Image</label>
              <ImageUpload value={form.image} onChange={(url) => update("image", url)} />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-[#71808c] mb-1">Description *</label>
              <textarea
                required
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
                placeholder="Detailed description of fabric, design, and fit..."
                rows={4}
                className="admin-input"
              />
            </div>

            <div className="md:col-span-2 flex items-center gap-2">
              <input
                type="checkbox"
                id="featured"
                checked={form.featured}
                onChange={(e) => update("featured", e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="featured" className="text-sm font-medium text-gray-700">
                Feature on Homepage
              </label>
            </div>
          </div>

          <div className="mt-6 flex items-center gap-3 border-t border-[#e2e7eb] pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-md bg-[#2563eb] px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition"
            >
              {submitting ? "Saving..." : editing ? "Update Product" : "Create Product"}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-md border border-[#d5dde3] px-4 py-2.5 text-sm text-[#17212b] hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Filter & Search Bar */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-1 flex-wrap items-center gap-3 min-w-[280px]">
          <div className="relative flex-1 max-w-sm">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Search by name, SKU..."
              className="admin-input pl-9"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setPage(1);
            }}
            className="admin-input max-w-[180px]"
          >
            <option value="ALL">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="admin-input max-w-[150px]"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Published</option>
            <option value="DRAFT">Draft</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>
        <p className="text-xs text-[#71808c]">
          Showing {filtered.length} of {products.length} products
        </p>
      </div>

      {/* Products Table */}
      <div className="mt-4 overflow-x-auto rounded-lg border border-[#e2e7eb] bg-white shadow-sm">
        <table className="w-full min-w-[800px] text-left text-sm">
          <thead className="border-b border-[#e2e7eb] bg-[#f8fafb] text-xs uppercase tracking-wide text-[#71808c]">
            <tr>
              <th className="p-4">Product</th>
              <th>SKU</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {pagedProducts.map((product) => {
              const totalStock = product.variants?.reduce((sum, v) => sum + v.stock, 0) ?? 0;
              const img = product.images?.[0]?.url;

              return (
                <tr key={product.id} className="border-b border-[#eef1f3] hover:bg-gray-50/50">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      {img ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={img}
                          alt={product.name}
                          className="h-10 w-10 rounded object-cover border border-gray-200"
                        />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded bg-gray-100 text-gray-400">
                          <Package size={18} />
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-[#17212b] line-clamp-1">{product.name}</p>
                        <p className="text-xs text-[#71808c] font-mono">/{product.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="font-mono text-xs text-[#71808c]">{product.sku}</td>
                  <td>
                    <span className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-700">
                      {product.category?.name ?? "Uncategorized"}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-[#17212b]">
                        ₹{product.salePrice ?? product.price}
                      </span>
                      {product.salePrice && product.salePrice < product.price && (
                        <span className="text-xs text-gray-400 line-through">₹{product.price}</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <span
                      className={`font-semibold ${
                        totalStock === 0
                          ? "text-red-600"
                          : totalStock <= 5
                          ? "text-amber-600"
                          : "text-emerald-700"
                      }`}
                    >
                      {totalStock}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        product.status === "ACTIVE"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : product.status === "DRAFT"
                          ? "bg-amber-50 text-amber-700 border border-amber-200"
                          : "bg-gray-100 text-gray-600 border border-gray-200"
                      }`}
                    >
                      {product.status === "ACTIVE"
                        ? "Published"
                        : product.status === "DRAFT"
                        ? "Draft"
                        : "Archived"}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEdit(product)}
                        className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50"
                      >
                        <Edit2 size={13} /> Edit
                      </button>
                      <button
                        onClick={() => remove(product)}
                        className="flex items-center gap-1 text-xs font-medium text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50 ml-2"
                      >
                        <Trash2 size={13} /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}

            {!pagedProducts.length && (
              <tr>
                <td colSpan={7} className="p-10 text-center text-[#71808c]">
                  <Package size={32} className="mx-auto mb-2 text-gray-300" />
                  <p className="font-medium text-gray-600">No products match your search.</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Try clearing your search query or filters.
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
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
    </div>
  );
}
