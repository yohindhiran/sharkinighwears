import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getAdminSession } from "@/lib/admin-auth";
import { revalidateStorefront } from "@/lib/revalidate-storefront";

const updateSchema = z.object({ name: z.string().trim().min(2).max(160), description: z.string().trim().min(2).max(3000), price: z.coerce.number().int().nonnegative(), salePrice: z.coerce.number().int().nonnegative().nullable().optional(), categoryId: z.string().min(1), status: z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]), featured: z.boolean(), stock: z.coerce.number().int().nonnegative(), image: z.string().url().optional().or(z.literal("")) });

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await getAdminSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const input = updateSchema.parse(await request.json());
    const { id } = await params;
    const product = await db.product.update({ where: { id }, data: { name: input.name, description: input.description, price: input.price, salePrice: input.salePrice ?? null, categoryId: input.categoryId, status: input.status, featured: input.featured, variants: { updateMany: { where: { productId: id }, data: { stock: input.stock } } } }, include: { category: true } });
    if (input.image) await db.productImage.upsert({ where: { id: `${id}-primary` }, update: { url: input.image }, create: { id: `${id}-primary`, productId: id, url: input.image, alt: input.name } });
    revalidateStorefront();
    return NextResponse.json(product);
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: "Please check the product fields." }, { status: 400 });
    return NextResponse.json({ error: "Unable to update product." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await getAdminSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await db.product.delete({ where: { id: (await params).id } });
  revalidateStorefront();
  return NextResponse.json({ ok: true });
}
