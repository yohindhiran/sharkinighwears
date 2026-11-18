import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import fs from "fs";
import path from "path";
import crypto from "crypto";

export const dynamic = "force-dynamic";

const ALLOWED_EXTENSIONS: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/jpg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
  "image/avif": ".avif",
  "image/svg+xml": ".svg",
};

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

export async function POST(request: Request) {
  if (!(await getAdminSession())) {
    return NextResponse.json(
      { error: "Admin session expired. Please log in again." },
      { status: 401 }
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "No image file provided." }, { status: 400 });
    }

    if (file.size === 0) {
      return NextResponse.json({ error: "Uploaded file is empty." }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { error: "Image is too large. Maximum allowed size is 10MB." },
        { status: 400 }
      );
    }

    const mimeType = (file.type || "").toLowerCase();
    const rawExt = path.extname(file.name || "").toLowerCase();
    const extension =
      ALLOWED_EXTENSIONS[mimeType] ||
      ([".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif", ".svg"].includes(rawExt)
        ? rawExt === ".jpeg"
          ? ".jpg"
          : rawExt
        : ".jpg");

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const hash = crypto.randomBytes(10).toString("hex");
    const fileName = `${Date.now()}-${hash}${extension}`;

    const uploadDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, fileName);
    fs.writeFileSync(filePath, buffer);

    // Serve through the dynamic API route so Next.js production mode serves newly uploaded files immediately without restart
    const fileUrl = `/api/uploads/${fileName}`;

    return NextResponse.json({ url: fileUrl, filename: fileName }, { status: 201 });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to upload file." },
      { status: 500 }
    );
  }
}
