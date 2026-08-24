import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getAdminSession } from "@/lib/admin-auth";
import { revalidateStorefront } from "@/lib/revalidate-storefront";

const updateSchema = z.object({ approved: z.boolean() });

export async function GET() {
  if (!(await getAdminSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json(await db.review.findMany({ include: { user: { select: { name: true, email: true } }, product: { select: { name: true, slug: true } } }, orderBy: { createdAt: "desc" } }));
}

export async function PATCH(request: Request) {
  if (!(await getAdminSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { id, approved } = updateSchema.extend({ id: z.string().min(1) }).parse(await request.json());
    const review = await db.review.update({ where: { id }, data: { approved } }); revalidateStorefront(); return NextResponse.json(review);
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: "Invalid review update." }, { status: 400 });
    return NextResponse.json({ error: "Unable to update review." }, { status: 500 });
  }
}
