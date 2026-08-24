import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getAdminSession } from "@/lib/admin-auth";
import { revalidateStorefront } from "@/lib/revalidate-storefront";

const productSchema = z.object({ name: z.string().trim().min(2).max(160), slug: z.string().trim().min(2).max(160).regex(/^[a-z0-9-]+$/), sku: z.string().trim().min(2).max(80), description: z.string().trim().min(2).max(3000), price: z.coerce.number().int().nonnegative(), salePrice: z.coerce.number().int().nonnegative().nullable().optional(), categoryId: z.string().min(1), image: z.string().url().optional().or(z.literal("")), sizes: z.array(z.string().trim().min(1)).default([]), colors: z.array(z.string().trim().min(1)).default([]), stock: z.coerce.number().int().nonnegative().default(0), status: z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]).default("ACTIVE"), featured: z.boolean().default(false) });

export async function GET() {
  if (!(await getAdminSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const products = await db.product.findMany({ include: { category: true, images: { orderBy: { sortOrder: "asc" } }, variants: true }, orderBy: { updatedAt: "desc" } });
  return NextResponse.json(products);
}

export async function POST(request: Request) {
  if (!(await getAdminSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const input = productSchema.parse(await request.json());
    const product = await db.product.create({ data: { name: input.name, slug: input.slug, sku: input.sku, description: input.description, price: input.price, salePrice: input.salePrice ?? null, categoryId: input.categoryId, status: input.status, featured: input.featured, images: input.image ? { create: { url: input.image, alt: input.name } } : undefined, variants: { create: [{ sku: `${input.sku}-DEFAULT`, stock: input.stock, size: input.sizes[0] ?? null, color: input.colors[0] ?? null }] } }, include: { category: true } });
    revalidateStorefront();
    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: "Please check the product fields." }, { status: 400 });
    return NextResponse.json({ error: "Unable to create product." }, { status: 500 });
  }
}
