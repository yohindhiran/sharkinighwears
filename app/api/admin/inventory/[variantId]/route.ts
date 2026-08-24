import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getAdminSession } from "@/lib/admin-auth";
import { revalidateStorefront } from "@/lib/revalidate-storefront";
const schema = z.object({ stock: z.coerce.number().int().nonnegative() });
export async function PATCH(request: Request, { params }: { params: Promise<{ variantId: string }> }) { if (!(await getAdminSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 }); try { const { stock } = schema.parse(await request.json()); const variant = await db.productVariant.update({ where: { id: (await params).variantId }, data: { stock } }); revalidateStorefront(); return NextResponse.json(variant); } catch (error) { if (error instanceof z.ZodError) return NextResponse.json({ error: "Invalid stock quantity." }, { status: 400 }); return NextResponse.json({ error: "Unable to update inventory." }, { status: 500 }); } }
