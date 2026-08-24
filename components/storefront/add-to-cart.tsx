"use client";

import { useState } from "react";
import { ShoppingBag } from "lucide-react";
import type { Product } from "@/lib/catalog";
import { useCart } from "@/components/storefront/providers";

type AddToCartProps = {
  product: Product;
  variantId?: string | null;
  quantity?: number;
  className?: string;
  label?: string;
};

export function AddToCart({ product, variantId, quantity = 1, className = "", label }: AddToCartProps) {
  const cart = useCart();
  const [state, setState] = useState<"idle" | "added" | "error">("idle");

  const soldOut = product.stock < 1 || (variantId ? !(product.variants.find((variant) => variant.id === variantId)?.stock ?? 0) : false);

  async function handleAdd() {
    setState("idle");
    const ok = await cart.add({ slug: product.slug, variantId: variantId ?? null, quantity });
    setState(ok ? "added" : "error");
    if (ok) window.setTimeout(() => setState("idle"), 2200);
  }

  if (soldOut) {
    return (
      <button disabled className={`btn-primary cursor-not-allowed !bg-ink/25 ${className}`}>
        Out of stock
      </button>
    );
  }

  return (
    <button onClick={handleAdd} disabled={cart.busy} className={`btn-primary disabled:opacity-60 ${className}`}>
      <ShoppingBag size={14} />
      {state === "added" ? "Added to bag" : state === "error" ? "Please try again" : label ?? "Add to bag"}
    </button>
  );
}
