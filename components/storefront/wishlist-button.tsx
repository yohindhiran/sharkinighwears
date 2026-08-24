"use client";

import { Heart } from "lucide-react";
import { useState } from "react";
import { useWishlist, type WishlistItem } from "@/components/storefront/providers";

export function WishlistButton({ product, className = "", iconSize = 16 }: { product: WishlistItem; className?: string; iconSize?: number }) {
  const wishlist = useWishlist();
  const saved = wishlist.has(product.slug);
  const [pulse, setPulse] = useState(false);

  return (
    <button
      aria-label={saved ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
      aria-pressed={saved}
      className={`flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur transition duration-300 hover:bg-white ${className} ${pulse ? "scale-110" : ""}`}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        wishlist.toggle(product);
        setPulse(true);
        window.setTimeout(() => setPulse(false), 250);
      }}
    >
      <Heart size={iconSize} strokeWidth={1.5} className={`transition duration-300 ${saved ? "fill-gold text-gold" : "text-ink"}`} />
    </button>
  );
}
