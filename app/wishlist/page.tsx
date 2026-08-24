"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingBag } from "lucide-react";
import { formatPrice, discountPercent } from "@/lib/catalog";
import { useWishlist } from "@/components/storefront/providers";

export default function WishlistPage() {
  const wishlist = useWishlist();

  return (
    <div className="mx-auto max-w-[1320px] px-5 py-16 md:px-10 md:py-24">
      <p className="eyebrow text-gold">Saved pieces</p>
      <h1 className="display mt-4 text-6xl leading-none md:text-7xl">Your Wishlist</h1>
      {wishlist.items.length === 0 ? (
        <div className="mt-14 flex flex-col items-center border border-dashed border-ink/20 px-8 py-20 text-center">
          <Heart size={30} strokeWidth={1} className="text-gold" />
          <p className="display mt-7 text-4xl">Nothing saved yet.</p>
          <p className="mt-4 max-w-sm text-sm leading-7 text-ink/55">Tap the heart on any piece you love and it will wait for you here.</p>
          <Link href="/shop" className="btn-primary mt-8">Explore the shop</Link>
        </div>
      ) : (
        <>
          <p className="mt-5 text-xs uppercase tracking-[.18em] text-ink/50">{wishlist.items.length} {wishlist.items.length === 1 ? "piece" : "pieces"} saved</p>
          <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-12 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
            {wishlist.items.map((item) => {
              const discount = discountPercent(item.price, item.compareAt);
              return (
                <article key={item.slug} className="group">
                  <div className="relative aspect-[3/4] overflow-hidden bg-[#ece5da]">
                    <Link href={`/product/${item.slug}`} aria-label={item.name} className="absolute inset-0 z-10" />
                    {item.image ? (
                      <Image src={item.image} alt={item.name} fill className="object-cover transition duration-700 ease-out group-hover:scale-105" sizes="(max-width: 640px) 50vw, 25vw" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center"><span className="display text-4xl text-ink/20">SHARKI</span></div>
                    )}
                    {discount && <span className="absolute left-3 top-3 bg-gold px-2.5 py-1 text-[9px] font-bold uppercase tracking-[.14em] text-white">-{discount}%</span>}
                    <button
                      aria-label={`Remove ${item.name} from wishlist`}
                      onClick={() => wishlist.toggle(item)}
                      className="absolute right-3 top-3 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur transition hover:bg-white"
                    >
                      <Heart size={16} strokeWidth={1.5} className="fill-gold text-gold" />
                    </button>
                    <div className="absolute inset-x-0 bottom-0 z-20 translate-y-full transition duration-300 ease-out group-hover:translate-y-0">
                      <Link href={`/product/${item.slug}`} className="block bg-white/95 py-3.5 text-center text-[10px] font-bold uppercase tracking-[.18em] transition hover:bg-gold hover:text-white">
                        <ShoppingBag size={13} className="mr-2 inline" /> View details
                      </Link>
                    </div>
                  </div>
                  <div className="pt-4 text-center">
                    <p className="text-[10px] uppercase tracking-[.18em] text-ink/45">{item.category}</p>
                    <Link href={`/product/${item.slug}`} className="mt-1.5 block text-sm font-semibold tracking-wide transition hover:text-gold">{item.name}</Link>
                    <div className="mt-1.5 flex items-center justify-center gap-2.5 text-sm">
                      <span className={item.compareAt ? "font-semibold text-gold" : ""}>{formatPrice(item.price)}</span>
                      {item.compareAt && <span className="text-xs text-ink/35 line-through">{formatPrice(item.compareAt)}</span>}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
