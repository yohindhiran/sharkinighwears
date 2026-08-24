import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getAdminSession } from "@/lib/admin-auth";
import { revalidateStorefront } from "@/lib/revalidate-storefront";

const schema = z.object({ name: z.string().trim().min(2).max(120), slug: z.string().trim().min(2).max(120).regex(/^[a-z0-9-]+$/), description: z.string().trim().max(1000).optional(), imageUrl: z.string().url().optional().or(z.literal("")), active: z.boolean(), sortOrder: z.coerce.number().int() });
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) { if (!(await getAdminSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 }); try { const input = schema.parse(await request.json()); const category = await db.category.update({ where: { id: (await params).id }, data: { ...input, imageUrl: input.imageUrl || null } }); revalidateStorefront(); return NextResponse.json(category); } catch (error) { if (error instanceof z.ZodError) return NextResponse.json({ error: "Please check the category fields." }, { status: 400 }); return NextResponse.json({ error: "Unable to update category." }, { status: 500 }); } }
export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) { if (!(await getAdminSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 }); const id = (await params).id; if (await db.product.count({ where: { categoryId: id } })) return NextResponse.json({ error: "Move products before deleting this category." }, { status: 409 }); await db.category.delete({ where: { id } }); revalidateStorefront(); return NextResponse.json({ ok: true }); }
