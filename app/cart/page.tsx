"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Minus, Plus, ShoppingBag, Truck, X } from "lucide-react";
import { formatPrice } from "@/lib/catalog";
import { useCart } from "@/components/storefront/providers";

const FREE_SHIPPING_THRESHOLD = 1000;

export default function CartPage() {
  const cart = useCart();
  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - cart.subtotal);
  const progress = Math.min(100, Math.round((cart.subtotal / FREE_SHIPPING_THRESHOLD) * 100));

  return (
    <div className="mx-auto max-w-[1320px] px-5 py-16 md:px-10 md:py-24">
      <p className="eyebrow text-gold">Your bag</p>
      <h1 className="display mt-4 text-6xl leading-none md:text-7xl">Shopping Bag</h1>

      {cart.items.length === 0 ? (
        <div className="mt-14 flex flex-col items-center border border-dashed border-ink/20 px-8 py-20 text-center">
          <ShoppingBag size={30} strokeWidth={1} className="text-gold" />
          <p className="display mt-7 text-4xl">A little room for comfort.</p>
          <p className="mt-4 max-w-sm text-sm leading-7 text-ink/55">Your bag is waiting for something soft. Explore our latest pieces and find your easy.</p>
          <Link href="/shop" className="btn-primary mt-8">Continue shopping <ArrowRight size={14} /></Link>
        </div>
      ) : (
        <div className="mt-12 grid gap-14 lg:grid-cols-[1.7fr_1fr]">
          <div>
            <div className="border border-ink/10 bg-white/70">
              <div className="flex items-center gap-3 border-b border-ink/10 px-6 py-4">
                <Truck size={16} className="text-gold" />
                {remaining > 0 ? (
                  <p className="text-xs tracking-wide text-ink/65">You are <span className="font-bold text-ink">{formatPrice(remaining)}</span> away from free shipping</p>
                ) : (
                  <p className="text-xs font-bold uppercase tracking-[.14em] text-gold">You have unlocked free shipping</p>
                )}
              </div>
              <div className="h-[3px] bg-sand"><div className="h-full bg-gold transition-all duration-500" style={{ width: `${progress}%` }} /></div>
            </div>
            <ul className="mt-8 divide-y divide-ink/10 border-y border-ink/10">
              {cart.items.map((item) => (
                <li key={item.id} className="flex gap-5 py-6 sm:gap-8">
                  <Link href={`/product/${item.slug}`} className="relative block h-32 w-24 shrink-0 overflow-hidden bg-[#ece5da] sm:h-40 sm:w-32">
                    {item.image ? <Image src={item.image} alt={item.name} fill className="object-cover" sizes="128px" /> : null}
                  </Link>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <Link href={`/product/${item.slug}`} className="text-sm font-semibold tracking-wide transition hover:text-gold">{item.name}</Link>
                        <p className="mt-1.5 text-xs text-ink/50">{[item.size, item.color].filter(Boolean).join(" · ") || "One size"}</p>
                        <p className="mt-2 text-sm">{formatPrice(item.unitPrice)}</p>
                        {item.quantity >= item.stock && <p className="mt-1 text-[11px] text-gold">Only {item.stock} left</p>}
                      </div>
                      <button aria-label={`Remove ${item.name} from bag`} onClick={() => cart.remove(item.id)} disabled={cart.busy} className="flex h-8 w-8 items-center justify-center rounded-full text-ink/40 transition hover:bg-sand hover:text-ink disabled:opacity-40">
                        <X size={15} />
                      </button>
                    </div>
                    <div className="mt-auto flex items-center justify-between pt-4">
                      <div className="flex items-center border border-ink/15">
                        <button aria-label="Decrease quantity" onClick={() => cart.update(item.id, item.quantity - 1)} disabled={cart.busy} className="flex h-9 w-9 items-center justify-center transition hover:text-gold disabled:opacity-40"><Minus size={13} /></button>
                        <span className="w-9 text-center text-sm tabular-nums">{item.quantity}</span>
                        <button aria-label="Increase quantity" onClick={() => cart.update(item.id, item.quantity + 1)} disabled={cart.busy || item.quantity >= item.stock} className="flex h-9 w-9 items-center justify-center transition hover:text-gold disabled:opacity-30"><Plus size={13} /></button>
                      </div>
                      <span className="text-sm font-semibold tabular-nums">{formatPrice(item.unitPrice * item.quantity)}</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <aside className="h-fit border border-ink/10 bg-white/70 p-7 lg:sticky lg:top-32">
            <p className="eyebrow text-gold">Order summary</p>
            <dl className="mt-7 space-y-4 text-sm">
              <div className="flex justify-between"><dt className="text-ink/60">Subtotal</dt><dd className="tabular-nums">{formatPrice(cart.subtotal)}</dd></div>
              <div className="flex justify-between"><dt className="text-ink/60">Shipping</dt><dd>{remaining > 0 ? "Calculated at checkout" : "Free"}</dd></div>
            </dl>
            <div className="mt-6 flex justify-between border-t border-ink/10 pt-6 text-base font-semibold">
              <span>Total</span>
              <span className="tabular-nums">{formatPrice(cart.subtotal)}</span>
            </div>
            <Link href="/checkout" className="btn-primary mt-8 w-full">Proceed to checkout <ArrowRight size={14} /></Link>
            <Link href="/shop" className="link-underline mt-6 w-full justify-center">Continue shopping</Link>
            <p className="mt-7 text-center text-[11px] leading-5 text-ink/45">Secure checkout · Easy returns<br />Free shipping on orders over ₹1000</p>
          </aside>
        </div>
      )}
    </div>
  );
}
