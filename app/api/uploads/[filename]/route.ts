import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

const MIME_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".avif": "image/avif",
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params;
    // Sanitize filename to prevent path traversal
    const safeName = path.basename(filename);
    if (!safeName || safeName !== filename || safeName.includes("..")) {
      return new NextResponse("Invalid filename", { status: 400 });
    }

    const filePath = path.join(process.cwd(), "public", "uploads", safeName);
    if (!fs.existsSync(filePath)) {
      return new NextResponse("Image not found", { status: 404 });
    }

    const ext = path.extname(safeName).toLowerCase();
    const contentType = MIME_TYPES[ext] || "application/octet-stream";
    const fileBuffer = fs.readFileSync(filePath);

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
        "Content-Length": String(fileBuffer.length),
      },
    });
  } catch (error) {
    console.error("Error serving uploaded image:", error);
    return new NextResponse("Error reading image", { status: 500 });
  }
}
