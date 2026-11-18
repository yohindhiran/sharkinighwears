import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getAdminSession } from "@/lib/admin-auth";
import { revalidateStorefront } from "@/lib/revalidate-storefront";
import { revalidatePath } from "next/cache";
import { optionalImageUrlSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

const schema = z.object({
  name: z.string().trim().min(2, "Category name must be at least 2 characters").max(120),
  slug: z
    .string()
    .trim()
    .min(2, "URL slug must be at least 2 characters")
    .max(120)
    .transform((v) => v.toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/(^-|-$)+/g, ""))
    .refine((v) => /^[a-z0-9-]+$/.test(v), "URL slug may only contain letters, numbers, and hyphens"),
  description: z.string().trim().max(1000).nullable().optional(),
  imageUrl: optionalImageUrlSchema,
  active: z.boolean(),
  sortOrder: z.coerce.number().int(),
});

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await getAdminSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const input = schema.parse(await request.json());
    const category = await db.category.update({
      where: { id: (await params).id },
      data: {
        name: input.name,
        slug: input.slug,
        description: input.description || null,
        imageUrl: input.imageUrl || null,
        active: input.active,
        sortOrder: input.sortOrder,
      },
    });
    revalidateStorefront();
    revalidatePath("/admin/categories");
    return NextResponse.json(category);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0]?.message || "Please check the category fields." },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to update category." },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await getAdminSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const id = (await params).id;
    if (await db.product.count({ where: { categoryId: id } })) {
      return NextResponse.json(
        { error: "Move products before deleting this category." },
        { status: 409 }
      );
    }
    await db.category.delete({ where: { id } });
    revalidateStorefront();
    revalidatePath("/admin/categories");
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to delete category." },
      { status: 500 }
    );
  }
}
