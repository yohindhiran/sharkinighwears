import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { db } from "@/lib/db";
import { getAdminSession } from "@/lib/admin-auth";
import { revalidateStorefront } from "@/lib/revalidate-storefront";

const contentSchema = z.record(z.string(), z.unknown());

export async function GET(_request: Request, { params }: { params: Promise<{ key: string }> }) {
  if (!(await getAdminSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const record = await db.siteContent.findUnique({ where: { key: (await params).key } });
  return NextResponse.json(record?.data ?? {});
}

export async function PUT(request: Request, { params }: { params: Promise<{ key: string }> }) {
  if (!(await getAdminSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const data = contentSchema.parse(await request.json());
    const jsonData = data as Prisma.InputJsonValue;
    const record = await db.siteContent.upsert({ where: { key: (await params).key }, update: { data: jsonData }, create: { key: (await params).key, data: jsonData } });
    revalidateStorefront();
    revalidatePathForContent((await params).key);
    return NextResponse.json(record.data);
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: "Invalid content payload." }, { status: 400 });
    return NextResponse.json({ error: "Unable to save content." }, { status: 500 });
  }
}

function revalidatePathForContent(key: string) {
  if (key === "header" || key === "footer" || key === "settings") revalidateStorefront();
}
