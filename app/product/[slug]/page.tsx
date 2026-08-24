import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, RotateCcw, ShieldCheck, Star, Truck } from "lucide-react";
import { discountPercent, formatPrice } from "@/lib/catalog";
import { getStorefrontProduct } from "@/lib/storefront-data";
import { notFound } from "next/navigation";
import { ProductGallery } from "@/components/storefront/product-gallery";
import { ProductPurchase } from "@/components/storefront/product-purchase";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> { const product = await getStorefrontProduct((await params).slug); return { title: product?.name ?? "Product", description: product?.description }; }

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const product = await getStorefrontProduct((await params).slug);
  if (!product) notFound();
  const discount = discountPercent(product.price, product.compareAt);
  return (
    <div className="mx-auto max-w-[1320px] px-5 py-8 md:px-10 md:py-14">
      <Link href="/shop" className="mb-8 inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[.16em] text-ink/50 transition hover:text-gold"><ArrowLeft size={14} /> Back to shop</Link>
      <div className="grid gap-10 md:grid-cols-[1.1fr_.9fr] md:gap-16">
        <ProductGallery images={product.images} name={product.name} tone={product.tone} />
        <div className="md:pt-6">
          <p className="eyebrow text-gold">{product.category}</p>
          <h1 className="display mt-4 text-5xl leading-[1] md:text-6xl">{product.name}</h1>
          <div className="mt-5 flex items-center gap-3">
            <span className={`text-lg ${product.compareAt ? "font-semibold text-gold" : ""}`}>{formatPrice(product.price)}</span>
            {product.compareAt && <span className="text-sm text-ink/35 line-through">{formatPrice(product.compareAt)}</span>}
            {discount && <span className="bg-gold px-2 py-0.5 text-[9px] font-bold uppercase tracking-[.12em] text-white">-{discount}%</span>}
          </div>
          <p className="mt-7 text-sm leading-7 text-ink/65">{product.description}</p>
          {product.fabric && <p className="mt-4 text-xs uppercase tracking-[.14em] text-ink/45">Fabric · {product.fabric}</p>}
          <div className="mt-7"><ProductPurchase product={product} /></div>
          <div className="mt-8 grid gap-3 border-t border-ink/10 pt-6 text-xs text-ink/55 sm:grid-cols-3">
            <span className="flex items-center gap-2.5"><Truck size={15} className="text-gold" /> Free shipping over ₹1000</span>
            <span className="flex items-center gap-2.5"><RotateCcw size={15} className="text-gold" /> Easy 7-day returns</span>
            <span className="flex items-center gap-2.5"><ShieldCheck size={15} className="text-gold" /> Secure checkout</span>
          </div>
        </div>
      </div>
      {product.reviews?.length ? (
        <section className="mt-20 border-t border-ink/10 pt-12">
          <p className="eyebrow text-gold">Customer reviews</p>
          <div className="mt-8 grid gap-8 md:grid-cols-2">
            {product.reviews.map((review, index) => (
              <article key={index} className="border border-ink/10 bg-white/70 p-7">
                <div className="flex gap-1" aria-label={`${review.rating} out of 5 stars`}>
                  {Array.from({ length: 5 }).map((_, star) => (
                    <Star key={star} size={13} className={star < review.rating ? "fill-gold text-gold" : "text-ink/20"} />
                  ))}
                </div>
                <h2 className="mt-4 text-sm font-bold tracking-wide">{review.title ?? "Verified purchase"}</h2>
                <p className="mt-2 text-sm leading-7 text-ink/65">{review.body}</p>
                <p className="mt-4 text-xs uppercase tracking-[.14em] text-ink/45">{review.user.name ?? "Customer"}</p>
              </article>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
