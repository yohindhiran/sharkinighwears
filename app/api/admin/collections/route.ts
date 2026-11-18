import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getAdminSession } from "@/lib/admin-auth";
import { revalidateStorefront } from "@/lib/revalidate-storefront";
import { optionalImageUrlSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

const schema = z.object({
  name: z.string().trim().min(2, "Collection name must be at least 2 characters").max(120),
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
  productIds: z.array(z.string()).default([]),
});

export async function GET() {
  if (!(await getAdminSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const collections = await db.collection.findMany({
      orderBy: { sortOrder: "asc" },
      include: {
        products: {
          select: {
            product: { select: { id: true, name: true } },
          },
        },
      },
    });
    return NextResponse.json(collections);
  } catch (error) {
    console.error("Error fetching collections:", error);
    return NextResponse.json({ error: "Database error fetching collections" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!(await getAdminSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const input = schema.parse(await request.json());
    const collection = await db.collection.create({
      data: {
        name: input.name,
        slug: input.slug,
        description: input.description || null,
        imageUrl: input.imageUrl || null,
        active: input.active,
        sortOrder: input.sortOrder,
        products: {
          create: input.productIds.map((productId) => ({ productId })),
        },
      },
    });
    revalidateStorefront();
    return NextResponse.json(collection, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0]?.message || "Please check the collection fields." },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: "Unable to create collection." }, { status: 500 });
  }
}
