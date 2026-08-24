import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getAdminSession } from "@/lib/admin-auth";
import { revalidateStorefront } from "@/lib/revalidate-storefront";

const schema = z.object({ name: z.string().trim().min(2).max(120), slug: z.string().trim().min(2).max(120).regex(/^[a-z0-9-]+$/), description: z.string().trim().max(1000).optional(), imageUrl: z.string().url().optional().or(z.literal("")), active: z.boolean().default(true), sortOrder: z.coerce.number().int().default(0), productIds: z.array(z.string()).default([]) });
export async function GET() { if (!(await getAdminSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 }); return NextResponse.json(await db.collection.findMany({ include: { products: { include: { product: true } } }, orderBy: { sortOrder: "asc" } })); }
export async function POST(request: Request) { if (!(await getAdminSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 }); try { const input = schema.parse(await request.json()); const collection = await db.collection.create({ data: { name: input.name, slug: input.slug, description: input.description, imageUrl: input.imageUrl || null, active: input.active, sortOrder: input.sortOrder, products: { create: input.productIds.map((productId) => ({ productId })) } } }); revalidateStorefront(); return NextResponse.json(collection, { status: 201 }); } catch (error) { if (error instanceof z.ZodError) return NextResponse.json({ error: "Please check the collection fields." }, { status: 400 }); return NextResponse.json({ error: "Unable to create collection." }, { status: 500 }); } }
