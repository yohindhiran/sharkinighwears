import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/catalog";
import { discountPercent, formatPrice } from "@/lib/catalog";
import { WishlistButton } from "@/components/storefront/wishlist-button";
import { QuickAdd } from "@/components/storefront/quick-add";

export function ProductCard({ product }: { product: Product }) {
  const discount = discountPercent(product.price, product.compareAt);
  const hoverImage = product.images[1] ?? null;

  return (
    <article className="group">
      <div className="relative aspect-[3/4] overflow-hidden bg-[#ece5da]">
        <Link href={`/product/${product.slug}`} aria-label={product.name} className="absolute inset-0 z-10" />
        {product.image ? (
          <>
            <Image src={product.image} alt={product.name} fill className={`object-cover transition duration-700 ease-out ${hoverImage ? "group-hover:opacity-0" : "group-hover:scale-105"}`} sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw" />
            {hoverImage && (
              <Image src={hoverImage} alt="" fill className="object-cover opacity-0 transition duration-700 ease-out group-hover:scale-105 group-hover:opacity-100" sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw" />
            )}
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center"><span className="display text-4xl text-ink/20">SHARKI</span></div>
        )}
        <div className="absolute left-3 top-3 flex flex-col gap-2">
          {discount && <span className="bg-gold px-2.5 py-1 text-[9px] font-bold uppercase tracking-[.14em] text-white">-{discount}%</span>}
          {product.stock < 1 && <span className="bg-ink px-2.5 py-1 text-[9px] font-bold uppercase tracking-[.14em] text-white">Sold out</span>}
        </div>
        <div className="absolute right-3 top-3 z-20">
          <WishlistButton product={{ slug: product.slug, name: product.name, category: product.category, price: product.price, compareAt: product.compareAt, image: product.image }} />
        </div>
        <div className="absolute inset-x-0 bottom-0 z-20 translate-y-full transition duration-300 ease-out group-hover:translate-y-0">
          <QuickAdd product={product} />
        </div>
      </div>
      <div className="pt-4 text-center">
        <p className="text-[10px] uppercase tracking-[.18em] text-ink/45">{product.category}</p>
        <Link href={`/product/${product.slug}`} className="mt-1.5 block text-sm font-semibold tracking-wide transition hover:text-gold">{product.name}</Link>
        <div className="mt-1.5 flex items-center justify-center gap-2.5 text-sm">
          <span className={product.compareAt ? "font-semibold text-gold" : ""}>{formatPrice(product.price)}</span>
          {product.compareAt && <span className="text-xs text-ink/35 line-through">{formatPrice(product.compareAt)}</span>}
        </div>
      </div>
    </article>
  );
}
