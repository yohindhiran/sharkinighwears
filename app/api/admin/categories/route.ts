import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getAdminSession } from "@/lib/admin-auth";
import { revalidateStorefront } from "@/lib/revalidate-storefront";

const categorySchema = z.object({ name: z.string().trim().min(2).max(120), slug: z.string().trim().min(2).max(120).regex(/^[a-z0-9-]+$/), description: z.string().trim().max(1000).optional(), imageUrl: z.string().url().optional().or(z.literal("")), active: z.boolean().default(true), sortOrder: z.coerce.number().int().default(0) });

export async function GET() { if (!(await getAdminSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 }); return NextResponse.json(await db.category.findMany({ orderBy: { sortOrder: "asc" }, include: { _count: { select: { products: true } } } })); }
export async function POST(request: Request) { if (!(await getAdminSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 }); try { const input = categorySchema.parse(await request.json()); const category = await db.category.create({ data: { ...input, imageUrl: input.imageUrl || null } }); revalidateStorefront(); return NextResponse.json(category, { status: 201 }); } catch (error) { if (error instanceof z.ZodError) return NextResponse.json({ error: "Please check the category fields." }, { status: 400 }); return NextResponse.json({ error: "Unable to create category." }, { status: 500 }); } }
