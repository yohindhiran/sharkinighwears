import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminSession } from "@/lib/admin-auth";

const loginSchema = z.object({ email: z.string().email(), password: z.string().min(1).max(200) });

export async function POST(request: Request) {
  try {
    const { email, password } = loginSchema.parse(await request.json());
    const authenticated = await createAdminSession(email, password);
    if (!authenticated) return NextResponse.json({ error: "Invalid administrator credentials." }, { status: 401 });
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: "Enter a valid email and password." }, { status: 400 });
    console.error("Admin login failed:", error);
    if (!process.env.DATABASE_URL || !process.env.AUTH_SECRET) return NextResponse.json({ error: "Admin authentication is not configured. Set DATABASE_URL and AUTH_SECRET, then seed the admin account." }, { status: 503 });
    return NextResponse.json({ error: "Unable to sign in." }, { status: 500 });
  }
}
