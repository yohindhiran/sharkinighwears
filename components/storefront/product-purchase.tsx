"use client";

import { useState } from "react";
import { Heart, Minus, Plus } from "lucide-react";
import type { Product } from "@/lib/catalog";
import { AddToCart } from "@/components/storefront/add-to-cart";
import { useWishlist } from "@/components/storefront/providers";

export function ProductPurchase({ product }: { product: Product }) {
  const inStockVariants = product.variants.filter((variant) => variant.stock > 0);
  const [variantId, setVariantId] = useState<string | null>(inStockVariants[0]?.id ?? null);
  const [quantity, setQuantity] = useState(1);
  const wishlist = useWishlist();
  const saved = wishlist.has(product.slug);
  const selectedVariant = product.variants.find((variant) => variant.id === variantId) ?? null;
  const maxQuantity = Math.min(selectedVariant?.stock ?? product.stock, 10);

  return (
    <div>
      {product.sizes.length > 0 && (
        <div className="border-y border-ink/10 py-6">
          <div className="flex items-center justify-between">
            <p className="eyebrow">Size</p>
            <p className="text-xs text-ink/50">{selectedVariant ? `${selectedVariant.stock} available` : product.stock > 0 ? `${product.stock} pieces available` : "Currently unavailable"}</p>
          </div>
          <div className="mt-4 flex flex-wrap gap-2.5">
            {product.variants.map((variant) => (
              <button
                key={variant.id}
                disabled={variant.stock < 1}
                onClick={() => { setVariantId(variant.id); setQuantity(1); }}
                aria-pressed={variantId === variant.id}
                className={`min-w-12 border px-4 py-2.5 text-xs font-bold uppercase tracking-[.12em] transition ${variantId === variant.id ? "border-ink bg-ink text-white" : "border-ink/20 hover:border-ink disabled:cursor-not-allowed disabled:border-ink/10 disabled:text-ink/25"}`}
              >
                {variant.size ?? variant.color ?? "One size"}
              </button>
            ))}
          </div>
        </div>
      )}
      <div className="mt-7 flex items-center gap-3">
        <div className="flex items-center border border-ink/15">
          <button aria-label="Decrease quantity" onClick={() => setQuantity((current) => Math.max(1, current - 1))} disabled={quantity <= 1} className="flex h-12 w-11 items-center justify-center transition hover:text-gold disabled:opacity-30"><Minus size={14} /></button>
          <span className="w-8 text-center text-sm tabular-nums">{quantity}</span>
          <button aria-label="Increase quantity" onClick={() => setQuantity((current) => Math.min(maxQuantity, current + 1))} disabled={quantity >= maxQuantity} className="flex h-12 w-11 items-center justify-center transition hover:text-gold disabled:opacity-30"><Plus size={14} /></button>
        </div>
        <AddToCart product={product} variantId={variantId} quantity={quantity} className="flex-1" />
        <button
          aria-label={saved ? "Remove from wishlist" : "Save to wishlist"}
          aria-pressed={saved}
          onClick={() => wishlist.toggle({ slug: product.slug, name: product.name, category: product.category, price: product.price, compareAt: product.compareAt, image: product.image })}
          className={`flex h-12 w-12 shrink-0 items-center justify-center border transition ${saved ? "border-gold text-gold" : "border-ink/20 hover:border-ink"}`}
        >
          <Heart size={18} strokeWidth={1.5} className={saved ? "fill-gold text-gold" : ""} />
        </button>
      </div>
    </div>
  );
}
