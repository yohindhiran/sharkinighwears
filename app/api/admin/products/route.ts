import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getAdminSession } from "@/lib/admin-auth";
import { revalidateStorefront } from "@/lib/revalidate-storefront";
import { optionalImageUrlSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const productSchema = z.object({
  name: z.string().trim().min(2, "Product name must be at least 2 characters").max(160),
  slug: z
    .string()
    .trim()
    .min(2, "URL slug must be at least 2 characters")
    .max(160)
    .transform((v) => v.toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/(^-|-$)+/g, ""))
    .refine((v) => /^[a-z0-9-]+$/.test(v), "URL slug may only contain letters, numbers, and hyphens"),
  sku: z.string().trim().min(2, "SKU must be at least 2 characters").max(80),
  description: z.string().trim().min(2, "Description must be at least 2 characters").max(3000),
  price: z.coerce.number().int().nonnegative(),
  salePrice: z.coerce.number().int().nonnegative().nullable().optional(),
  categoryId: z.string().min(1, "Please select a category"),
  image: optionalImageUrlSchema,
  sizes: z.array(z.string().trim().min(1)).default([]),
  colors: z.array(z.string().trim().min(1)).default([]),
  stock: z.coerce.number().int().nonnegative().default(0),
  status: z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]).default("ACTIVE"),
  featured: z.boolean().default(false),
});

export async function GET() {
  if (!(await getAdminSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const products = await db.product.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        sku: true,
        description: true,
        price: true,
        salePrice: true,
        status: true,
        featured: true,
        category: { select: { id: true, name: true } },
        variants: { select: { id: true, stock: true } },
        images: { select: { url: true }, take: 1, orderBy: { sortOrder: "asc" } },
      },
      orderBy: { updatedAt: "desc" },
    });
    return NextResponse.json(products);
  } catch (error) {
    console.error("Database error in products route:", error);
    return NextResponse.json({ error: "Database error fetching products" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!(await getAdminSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const input = productSchema.parse(await request.json());
    const product = await db.product.create({
      data: {
        name: input.name,
        slug: input.slug,
        sku: input.sku,
        description: input.description,
        price: input.price,
        salePrice: input.salePrice ?? null,
        categoryId: input.categoryId,
        status: input.status,
        featured: input.featured,
        images: input.image ? { create: { url: input.image, alt: input.name, sortOrder: 0 } } : undefined,
        variants: {
          create: [{ sku: `${input.sku}-DEFAULT`, stock: input.stock, size: input.sizes[0] ?? null, color: input.colors[0] ?? null }],
        },
      },
      include: { category: true },
    });
    revalidateStorefront();
    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0]?.message || "Please check the product fields." },
        { status: 400 }
      );
    }
    console.error("Error creating product:", error);
    return NextResponse.json({ error: "Unable to create product. Check if SKU or slug already exists." }, { status: 500 });
  }
}
