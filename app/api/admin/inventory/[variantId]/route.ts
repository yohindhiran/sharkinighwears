import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getAdminSession } from "@/lib/admin-auth";
import { revalidateStorefront } from "@/lib/revalidate-storefront";

export const dynamic = "force-dynamic";

const schema = z.object({
  stock: z.coerce.number().int().min(0, "Stock cannot be negative"),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ variantId: string }> }
) {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json(
      { error: "Admin session expired. Please refresh and log in again." },
      { status: 401 }
    );
  }

  const { variantId } = await params;

  try {
    const json = await request.json();
    const { stock } = schema.parse(json);

    const variant = await db.productVariant.update({
      where: { id: variantId },
      data: { stock },
    });

    // Upsert tracking record in Inventory table if it exists
    await db.inventory
      .upsert({
        where: { variantId },
        update: {},
        create: { variantId },
      })
      .catch((e) => console.warn("Optional inventory table tracking sync:", e));

    revalidateStorefront();
    return NextResponse.json(variant);
  } catch (error) {
    console.error("Inventory update error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid stock quantity. Please enter a positive whole number." },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Database error updating stock. Please try again." },
      { status: 500 }
    );
  }
}
