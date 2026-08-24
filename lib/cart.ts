import { randomUUID } from "crypto";
import { cookies } from "next/headers";
import { db } from "@/lib/db";

const CART_COOKIE = "sharki_cart_sid";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 180;

export type CartLine = { id: string; productId: string; variantId: string | null; slug: string; name: string; image: string; tone: string; size: string | null; color: string | null; unitPrice: number; quantity: number; stock: number };
export type CartSummary = { items: CartLine[]; count: number; subtotal: number };

export const emptyCart: CartSummary = { items: [], count: 0, subtotal: 0 };

export async function readCartId() {
  return (await cookies()).get(CART_COOKIE)?.value;
}

export async function ensureCartId() {
  const store = await cookies();
  const existing = store.get(CART_COOKIE)?.value;
  if (existing) return existing;
  const sessionId = randomUUID();
  store.set(CART_COOKIE, sessionId, { httpOnly: true, sameSite: "lax", path: "/", maxAge: COOKIE_MAX_AGE });
  return sessionId;
}

async function findCart(sessionId: string) {
  return db.cart.upsert({ where: { sessionId }, update: {}, create: { sessionId } });
}

export function lineUnitPrice(product: { price: number; salePrice: number | null }, variantPrice: number | null) {
  return variantPrice ?? product.salePrice ?? product.price;
}

export async function getCartSummary(): Promise<CartSummary> {
  const sessionId = await readCartId();
  if (!sessionId) return emptyCart;
  const cart = await db.cart.findUnique({
    where: { sessionId },
    include: {
      items: {
        include: {
          product: { include: { images: { orderBy: { sortOrder: "asc" } }, variants: { where: { active: true } } } },
          variant: true,
        },
      },
    },
  });
  if (!cart) return emptyCart;
  const items: CartLine[] = [];
  for (const item of cart.items) {
    const product = item.product;
    if (product.status !== "ACTIVE") continue;
    const variant = item.variant;
    const stock = variant ? variant.stock : product.variants.reduce((total, entry) => total + entry.stock, 0);
    const quantity = Math.min(item.quantity, Math.max(stock, 0));
    if (quantity < 1) continue;
    items.push({ id: item.id, productId: product.id, variantId: item.variantId, slug: product.slug, name: product.name, image: product.images[0]?.url ?? "", tone: "#ece5da", size: variant?.size ?? null, color: variant?.color ?? null, unitPrice: lineUnitPrice(product, variant?.price ?? null), quantity, stock });
  }
  return { items, count: items.reduce((total, item) => total + item.quantity, 0), subtotal: items.reduce((total, item) => total + item.quantity * item.unitPrice, 0) };
}

export async function addToCart(input: { slug: string; variantId?: string | null; quantity?: number }) {
  const quantity = Math.max(1, Math.min(input.quantity ?? 1, 20));
  const product = await db.product.findFirst({ where: { slug: input.slug, status: "ACTIVE" }, include: { variants: { where: { active: true } } } });
  if (!product) throw new Error("Product unavailable");
  let variant = null;
  if (input.variantId) {
    variant = product.variants.find((entry) => entry.id === input.variantId) ?? null;
    if (!variant) throw new Error("Option unavailable");
  }
  const stock = variant ? variant.stock : product.variants.reduce((total, entry) => total + entry.stock, 0);
  if (stock < 1) throw new Error("Out of stock");
  const cart = await findCart(await ensureCartId());
  const existing = await db.cartItem.findFirst({ where: { cartId: cart.id, productId: product.id, variantId: variant?.id ?? null } });
  const nextQuantity = Math.min((existing?.quantity ?? 0) + quantity, stock, 20);
  if (existing) await db.cartItem.update({ where: { id: existing.id }, data: { quantity: nextQuantity } });
  else await db.cartItem.create({ data: { cartId: cart.id, productId: product.id, variantId: variant?.id ?? null, quantity: Math.min(quantity, stock, 20) } });
  return getCartSummary();
}

export async function updateCartItem(input: { itemId: string; quantity: number }) {
  const sessionId = await readCartId();
  if (!sessionId) throw new Error("Cart not found");
  const cart = await db.cart.findUnique({ where: { sessionId } });
  if (!cart) throw new Error("Cart not found");
  const item = await db.cartItem.findFirst({ where: { id: input.itemId, cartId: cart.id }, include: { product: { include: { variants: { where: { active: true } } } }, variant: true } });
  if (!item) throw new Error("Item not found");
  if (input.quantity < 1) {
    await db.cartItem.delete({ where: { id: item.id } });
    return getCartSummary();
  }
  const stock = item.variant ? item.variant.stock : item.product.variants.reduce((total, entry) => total + entry.stock, 0);
  await db.cartItem.update({ where: { id: item.id }, data: { quantity: Math.min(input.quantity, Math.max(stock, 1), 20) } });
  return getCartSummary();
}

export async function removeCartItem(itemId: string) {
  const sessionId = await readCartId();
  if (!sessionId) throw new Error("Cart not found");
  const cart = await db.cart.findUnique({ where: { sessionId } });
  if (!cart) throw new Error("Cart not found");
  await db.cartItem.deleteMany({ where: { id: itemId, cartId: cart.id } });
  return getCartSummary();
}
