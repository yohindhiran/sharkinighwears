import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getAdminSession } from "@/lib/admin-auth";
import { revalidateStorefront } from "@/lib/revalidate-storefront";
import { revalidatePath } from "next/cache";
import { optionalImageUrlSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const categorySchema = z.object({
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
  active: z.boolean().default(true),
  sortOrder: z.coerce.number().int().default(0),
});

export async function GET() {
  if (!(await getAdminSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    return NextResponse.json(
      await db.category.findMany({
        orderBy: { sortOrder: "asc" },
        include: { _count: { select: { products: true } } },
      })
    );
  } catch (error) {
    console.error("Failed to fetch categories from DB:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Database connection failed." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  if (!(await getAdminSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const input = categorySchema.parse(await request.json());
    try {
      const category = await db.category.create({
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
      return NextResponse.json(category, { status: 201 });
    } catch (dbError) {
      console.error("Database error creating category:", dbError);
      return NextResponse.json(
        { error: dbError instanceof Error ? dbError.message : "Database error while saving category." },
        { status: 500 }
      );
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0]?.message || "Please check the category fields." },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to create category." },
      { status: 500 }
    );
  }
}
