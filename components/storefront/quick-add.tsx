"use client";

import Link from "next/link";
import { useState } from "react";
import { Plus } from "lucide-react";
import type { Product } from "@/lib/catalog";
import { useCart } from "@/components/storefront/providers";

export function QuickAdd({ product }: { product: Pick<Product, "slug" | "name" | "stock" | "variants"> }) {
  const cart = useCart();
  const [added, setAdded] = useState(false);
  const soldOut = product.stock < 1;
  const needsSelection = product.variants.filter((variant) => variant.stock > 0).length > 1;

  if (soldOut) {
    return <span className="pointer-events-none block bg-ink/70 py-3.5 text-center text-[10px] font-bold uppercase tracking-[.18em] text-white">Sold out</span>;
  }

  if (needsSelection) {
    return (
      <Link href={`/product/${product.slug}`} className="block bg-white/95 py-3.5 text-center text-[10px] font-bold uppercase tracking-[.18em] text-ink transition group-hover:bg-white">
        Select size
      </Link>
    );
  }

  return (
    <button
      aria-label={`Add ${product.name} to bag`}
      disabled={cart.busy}
      onClick={async (event) => {
        event.preventDefault();
        event.stopPropagation();
        const variant = product.variants.find((entry) => entry.stock > 0);
        const ok = await cart.add({ slug: product.slug, variantId: variant?.id ?? null });
        if (ok) {
          setAdded(true);
          window.setTimeout(() => setAdded(false), 2200);
        }
      }}
      className="block w-full bg-white/95 py-3.5 text-center text-[10px] font-bold uppercase tracking-[.18em] text-ink transition hover:bg-gold hover:text-white disabled:opacity-60"
    >
      {added ? "Added to bag" : "Add to bag"}
    </button>
  );
}

export function QuickAddIcon({ product }: { product: Pick<Product, "slug" | "name" | "stock" | "variants"> }) {
  const cart = useCart();
  const [added, setAdded] = useState(false);
  const soldOut = product.stock < 1;
  const needsSelection = product.variants.filter((variant) => variant.stock > 0).length > 1;

  if (soldOut || needsSelection) return null;

  return (
    <button
      aria-label={`Add ${product.name} to bag`}
      disabled={cart.busy}
      onClick={async (event) => {
        event.preventDefault();
        event.stopPropagation();
        const variant = product.variants.find((entry) => entry.stock > 0);
        const ok = await cart.add({ slug: product.slug, variantId: variant?.id ?? null });
        if (ok) {
          setAdded(true);
          window.setTimeout(() => setAdded(false), 2200);
        }
      }}
      className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur transition hover:bg-gold hover:text-white disabled:opacity-60"
    >
      {added ? <Plus size={16} strokeWidth={1.5} className="rotate-45" /> : <Plus size={16} strokeWidth={1.5} />}
    </button>
  );
}
