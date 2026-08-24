import { NextResponse } from "next/server";
import { z } from "zod";
import { addToCart, getCartSummary, removeCartItem, updateCartItem } from "@/lib/cart";

export async function GET() {
  return NextResponse.json(await getCartSummary());
}

export async function POST(request: Request) {
  try {
    const input = z.object({ slug: z.string().min(1), variantId: z.string().min(1).nullable().optional(), quantity: z.coerce.number().int().min(1).max(20).optional() }).parse(await request.json());
    const cart = await addToCart(input);
    return NextResponse.json(cart);
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: "Invalid cart request." }, { status: 400 });
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to add to bag." }, { status: 400 });
  }
}

export async function PATCH(request: Request) {
  try {
    const input = z.object({ itemId: z.string().min(1), quantity: z.coerce.number().int().min(0).max(20) }).parse(await request.json());
    return NextResponse.json(await updateCartItem(input));
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: "Invalid cart update." }, { status: 400 });
    return NextResponse.json({ error: "Unable to update the bag." }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  try {
    const input = z.object({ itemId: z.string().min(1) }).parse(await request.json());
    return NextResponse.json(await removeCartItem(input.itemId));
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: "Invalid cart request." }, { status: 400 });
    return NextResponse.json({ error: "Unable to remove the item." }, { status: 400 });
  }
}
