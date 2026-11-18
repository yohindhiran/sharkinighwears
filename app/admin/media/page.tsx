"use client";

import { FormEvent, useEffect, useState } from "react";
import { ImageUpload } from "@/components/admin/image-upload";

/* eslint-disable @next/next/no-img-element */
type Asset = { id: string; url: string; alt: string | null; filename: string | null };

export default function AdminMediaPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [url, setUrl] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function load() {
    const response = await fetch("/api/admin/media");
    if (response.ok) setAssets(await response.json());
  }

  useEffect(() => {
    let active = true;
    fetch("/api/admin/media")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (active && Array.isArray(data)) setAssets(data);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  async function saveUrl(imageUrl: string) {
    setMessage("");
    setError("");
    const response = await fetch("/api/admin/media", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: imageUrl }),
    });
    if (response.ok) {
      setMessage("Image saved to Media Library.");
      setUrl("");
      load();
    } else {
      const data = await response.json().catch(() => ({}));
      setError(data.error || "Enter a valid image URL.");
    }
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!url.trim()) return;
    await saveUrl(url.trim());
  }

  async function remove(id: string) {
    if (window.confirm("Delete this media asset?")) {
      await fetch(`/api/admin/media/${id}`, { method: "DELETE" });
      load();
    }
  }

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[.14em] text-[#71808c]">Assets</p>
      <h1 className="mt-2 text-3xl font-semibold">Media Library</h1>
      <p className="mt-1 text-sm text-[#71808c]">
        Upload images directly from your device or paste an image URL.
      </p>

      <form
        onSubmit={submit}
        className="mt-6 max-w-2xl space-y-4 rounded-lg border border-[#e2e7eb] bg-white p-5"
      >
        <ImageUpload value={url} onChange={(nextUrl) => setUrl(nextUrl)} />
        <button
          disabled={!url.trim()}
          className="rounded-md bg-[#2563eb] px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          Save to Media Library
        </button>
      </form>

      {message && <p className="mt-3 text-sm text-[#287a3d]">{message}</p>}
      {error && <p className="mt-3 text-sm text-[#b42318]">{error}</p>}

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {assets.map((asset) => (
          <div
            key={asset.id}
            className="overflow-hidden rounded-lg border border-[#e2e7eb] bg-white shadow-sm"
          >
            <div className="relative aspect-square bg-[#f1f3f5]">
              <img src={asset.url} alt={asset.alt ?? ""} className="h-full w-full object-cover" />
            </div>
            <div className="flex justify-between gap-2 p-3">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(asset.url);
                  setMessage("Copied URL to clipboard.");
                }}
                className="text-sm font-medium text-[#2563eb] hover:underline"
              >
                Copy URL
              </button>
              <button
                onClick={() => remove(asset.id)}
                className="text-sm font-medium text-[#b42318] hover:underline"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
        {!assets.length && (
          <div className="rounded-lg border border-dashed border-[#cbd5dc] p-8 text-sm text-[#71808c] sm:col-span-2 lg:col-span-4 text-center">
            No media assets saved yet.
          </div>
        )}
      </div>
    </div>
  );
}
