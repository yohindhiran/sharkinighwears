import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { email } = z.object({ email: z.string().trim().email().max(200) }).parse(await request.json());
    const normalized = email.toLowerCase();
    const record = await db.siteContent.findUnique({ where: { key: "newsletter_subscribers" } });
    const data = record?.data as { subscribers?: string[] } | null;
    const subscribers = Array.isArray(data?.subscribers) ? data!.subscribers.filter((entry): entry is string => typeof entry === "string") : [];
    if (!subscribers.includes(normalized)) {
      await db.siteContent.upsert({
        where: { key: "newsletter_subscribers" },
        update: { data: { subscribers: [...subscribers, normalized] } },
        create: { key: "newsletter_subscribers", data: { subscribers: [normalized] } },
      });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    return NextResponse.json({ error: "Unable to subscribe right now." }, { status: 500 });
  }
}
