"use client";

import { useState } from "react";
import Image from "next/image";

export function ImageUpload({ value, onChange }: { value: string; onChange: (url: string) => void }) {
  const [uploading, setUploading] = useState(false);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      onChange(data.url);
    } catch (error) {
      console.error(error);
      alert("Failed to upload image.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {value ? (
        <div className="relative h-32 w-32 overflow-hidden rounded-md border border-[#e2e7eb]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="Uploaded" className="h-full w-full object-cover" />
          <button 
            type="button" 
            onClick={() => onChange("")}
            className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/50 text-xs text-white hover:bg-black/70"
          >
            ×
          </button>
        </div>
      ) : (
        <div className="flex h-32 w-32 items-center justify-center rounded-md border border-dashed border-[#e2e7eb] bg-[#f8fafb]">
          <span className="text-xs text-[#71808c]">{uploading ? "Uploading..." : "No image"}</span>
        </div>
      )}
      <div>
        <label className="cursor-pointer rounded-md border border-[#d5dde3] bg-white px-3 py-1.5 text-xs font-medium hover:bg-gray-50">
          {uploading ? "Uploading..." : "Upload Image"}
          <input type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={uploading} />
        </label>
      </div>
    </div>
  );
}
