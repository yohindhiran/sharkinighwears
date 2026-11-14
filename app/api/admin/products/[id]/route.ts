import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getAdminSession } from "@/lib/admin-auth";
import { revalidateStorefront } from "@/lib/revalidate-storefront";

export const dynamic = "force-dynamic";

const updateSchema = z.object({
  name: z.string().trim().min(2).max(160),
  description: z.string().trim().min(2).max(3000),
  price: z.coerce.number().int().nonnegative(),
  salePrice: z.coerce.number().int().nonnegative().nullable().optional(),
  categoryId: z.string().min(1),
  status: z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]),
  featured: z.boolean(),
  stock: z.coerce.number().int().nonnegative(),
  image: z.string().url().optional().or(z.literal("")),
});

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await getAdminSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const input = updateSchema.parse(await request.json());
    const { id } = await params;

    // Update product fields
    const product = await db.product.update({
      where: { id },
      data: {
        name: input.name,
        description: input.description,
        price: input.price,
        salePrice: input.salePrice ?? null,
        categoryId: input.categoryId,
        status: input.status,
        featured: input.featured,
      },
      include: { category: true },
    });

    // Update variant stock (if variants exist, update default/first or all)
    const existingVariants = await db.productVariant.findMany({ where: { productId: id } });
    if (existingVariants.length > 0) {
      await db.productVariant.updateMany({
        where: { productId: id },
        data: { stock: input.stock },
      });
    } else {
      // Create default variant if none existed
      await db.productVariant.create({
        data: {
          productId: id,
          sku: `${product.sku}-DEFAULT`,
          stock: input.stock,
        },
      });
    }

    // Update primary image if provided
    if (input.image) {
      const existingImage = await db.productImage.findFirst({
        where: { productId: id },
        orderBy: { sortOrder: "asc" },
      });
      if (existingImage) {
        await db.productImage.update({
          where: { id: existingImage.id },
          data: { url: input.image, alt: input.name },
        });
      } else {
        await db.productImage.create({
          data: { productId: id, url: input.image, alt: input.name, sortOrder: 0 },
        });
      }
    }

    revalidateStorefront();
    return NextResponse.json(product);
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: "Please check the product fields." }, { status: 400 });
    console.error("Error updating product:", error);
    return NextResponse.json({ error: "Unable to update product." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await getAdminSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { id } = await params;
    await db.product.delete({ where: { id } });
    revalidateStorefront();
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json({ error: "Unable to delete product." }, { status: 500 });
  }
}
