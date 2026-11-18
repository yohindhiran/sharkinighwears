"use client";

import { useState } from "react";
import { Upload, X, Loader2, AlertCircle } from "lucide-react";

async function compressImageIfNeeded(file: File): Promise<File> {
  // Keep SVGs, GIFs, and already-small files untouched
  if (
    file.type === "image/svg+xml" ||
    file.type === "image/gif" ||
    file.size <= 750 * 1024
  ) {
    return file;
  }

  return new Promise((resolve) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const maxDim = 1600;
      let { width, height } = img;

      if (width > maxDim || height > maxDim) {
        if (width >= height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(file);
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      const outputType = file.type === "image/png" ? "image/webp" : "image/jpeg";
      const outputExt = outputType === "image/webp" ? ".webp" : ".jpg";

      canvas.toBlob(
        (blob) => {
          if (!blob || blob.size >= file.size) {
            resolve(file);
            return;
          }
          const baseName = file.name.replace(/\.[^.]+$/, "") || "upload";
          resolve(new File([blob], `${baseName}${outputExt}`, { type: outputType }));
        },
        outputType,
        0.82
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(file);
    };

    img.src = objectUrl;
  });
}

export function ImageUpload({
  value,
  onChange,
}: {
  value: string;
  onChange: (url: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError("");

    try {
      const preparedFile = await compressImageIfNeeded(file);

      const formData = new FormData();
      formData.append("file", preparedFile);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      let data: { url?: string; error?: string } = {};
      try {
        data = await res.json();
      } catch {
        // Non-JSON response (e.g. Nginx 413 error)
        if (res.status === 413) {
          throw new Error("Image file is too large for the server. Please choose a smaller image.");
        }
        throw new Error(`Upload failed (HTTP ${res.status}).`);
      }

      if (!res.ok || !data.url) {
        throw new Error(data.error || "Upload failed. Please try again.");
      }

      onChange(data.url);
    } catch (err) {
      console.error("Image upload error:", err);
      setError(err instanceof Error ? err.message : "Failed to upload image.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-start gap-4">
        {value ? (
          <div className="relative h-32 w-32 shrink-0 overflow-hidden rounded-md border border-[#e2e7eb] bg-[#f8fafb]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={value}
              alt="Uploaded preview"
              className="h-full w-full object-cover"
              onError={() => setError("Image preview could not load. Please re-upload or check the URL.")}
            />
            <button
              type="button"
              onClick={() => {
                onChange("");
                setError("");
              }}
              title="Remove image"
              className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/65 text-white hover:bg-black/85 transition"
            >
              <X size={13} />
            </button>
          </div>
        ) : (
          <div className="flex h-32 w-32 shrink-0 flex-col items-center justify-center rounded-md border border-dashed border-[#cbd5dc] bg-[#f8fafb] text-[#71808c]">
            {uploading ? (
              <>
                <Loader2 size={20} className="animate-spin text-blue-600 mb-1" />
                <span className="text-xs">Uploading...</span>
              </>
            ) : (
              <span className="text-xs">No image</span>
            )}
          </div>
        )}

        <div className="flex flex-1 flex-col gap-2.5 min-w-[220px]">
          <div className="flex items-center gap-2">
            <label
              className={`inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-[#d5dde3] bg-white px-3.5 py-2 text-xs font-medium text-[#17212b] shadow-sm hover:bg-gray-50 transition ${
                uploading ? "opacity-60 pointer-events-none" : ""
              }`}
            >
              {uploading ? (
                <Loader2 size={14} className="animate-spin text-blue-600" />
              ) : (
                <Upload size={14} />
              )}
              {uploading ? "Uploading..." : value ? "Change Image" : "Upload Image"}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleUpload}
                disabled={uploading}
              />
            </label>
          </div>

          <input
            type="text"
            value={value}
            onChange={(e) => {
              setError("");
              onChange(e.target.value);
            }}
            placeholder="Or paste image URL (e.g. https://... or /api/uploads/...)"
            className="admin-input text-xs"
          />
          <p className="text-[11px] text-[#71808c]">
            Supports JPG, PNG, WebP, GIF. Large images are auto-optimized for fast loading.
          </p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          <AlertCircle size={14} className="shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
