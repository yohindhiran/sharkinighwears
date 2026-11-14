import Link from "next/link";
import { submitOrder } from "./actions";
import { getCartSummary } from "@/lib/cart";
import { getSession } from "@/app/actions/auth";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/catalog";
import { ShieldCheck, Truck } from "lucide-react";
import type { Address } from "@prisma/client";

export const metadata = {
  title: "Checkout | SHARKI NIGHTWEARS",
  description: "Complete your order with secure checkout.",
};

export default async function CheckoutPage() {
  const cart = await getCartSummary();
  const session = await getSession();

  let defaultAddress: Address | null = null;
  let savedAddresses: Address[] = [];

  if (session) {
    try {
      savedAddresses = await db.address.findMany({
        where: { userId: session.id },
        orderBy: { createdAt: "desc" },
      });
      defaultAddress = savedAddresses[0] || null;
    } catch (e) {
      console.error("Failed to load saved addresses:", e);
    }
  }

  if (cart.items.length === 0) {
    return (
      <div className="mx-auto max-w-md px-6 py-24 text-center">
        <p className="eyebrow text-gold">Your bag is empty</p>
        <h1 className="display mt-4 text-5xl">Nothing to checkout</h1>
        <p className="mt-4 text-sm text-ink/60">Add some pieces to your shopping bag before checking out.</p>
        <Link
          href="/shop"
          className="mt-8 inline-block bg-ink px-8 py-4 text-xs font-bold uppercase tracking-[.16em] text-white hover:bg-gold transition"
        >
          Explore collection
        </Link>
      </div>
    );
  }

  const freeShipping = cart.subtotal >= 1000;
  const shippingCharge = freeShipping ? 0 : 99;
  const grandTotal = cart.subtotal + shippingCharge;

  return (
    <div className="mx-auto max-w-[1180px] px-6 py-12 md:px-12 md:py-20">
      <p className="eyebrow text-gold">Almost yours</p>
      <h1 className="display mt-3 text-5xl sm:text-6xl">Checkout</h1>

      {!session && (
        <div className="mt-6 border border-ink/10 bg-sand/40 p-4 text-xs text-ink/75 flex justify-between items-center">
          <span>Already have an account with saved addresses?</span>
          <Link href="/login" className="font-bold underline hover:text-gold uppercase tracking-wider">
            Sign in
          </Link>
        </div>
      )}

      <div className="mt-10 grid gap-12 lg:grid-cols-[1.25fr_.75fr]">
        <form action={submitOrder} className="space-y-6">
          <div className="border border-ink/10 bg-white/70 p-6">
            <h2 className="text-xs font-bold uppercase tracking-[.16em] text-ink/70 mb-5">
              1. Delivery Information
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-ink/50 mb-1">
                  Recipient Name
                </label>
                <input
                  name="name"
                  required
                  defaultValue={defaultAddress?.recipient || session?.name || ""}
                  placeholder="Full name"
                  className="w-full border-b border-ink/20 bg-transparent py-2.5 text-sm outline-none focus:border-gold"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-ink/50 mb-1">
                  Mobile Number
                </label>
                <input
                  name="mobile"
                  required
                  type="tel"
                  defaultValue={session?.phone || ""}
                  placeholder="+91 98765 43210"
                  className="w-full border-b border-ink/20 bg-transparent py-2.5 text-sm outline-none focus:border-gold"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-ink/50 mb-1">
                Email Address
              </label>
              <input
                name="email"
                required
                type="email"
                defaultValue={session?.email || ""}
                placeholder="you@example.com"
                className="w-full border-b border-ink/20 bg-transparent py-2.5 text-sm outline-none focus:border-gold"
              />
            </div>

            <div className="mt-4">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-ink/50 mb-1">
                Street Address / House No.
              </label>
              <input
                name="address"
                required
                defaultValue={defaultAddress?.line1 || ""}
                placeholder="Flat / House No., Apartment, Street"
                className="w-full border-b border-ink/20 bg-transparent py-2.5 text-sm outline-none focus:border-gold"
              />
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-ink/50 mb-1">
                  City
                </label>
                <input
                  name="city"
                  required
                  defaultValue={defaultAddress?.city || ""}
                  placeholder="City"
                  className="w-full border-b border-ink/20 bg-transparent py-2.5 text-sm outline-none focus:border-gold"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-ink/50 mb-1">
                  State
                </label>
                <input
                  name="state"
                  required
                  defaultValue={defaultAddress?.state || ""}
                  placeholder="State"
                  className="w-full border-b border-ink/20 bg-transparent py-2.5 text-sm outline-none focus:border-gold"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-ink/50 mb-1">
                  PIN Code
                </label>
                <input
                  name="pincode"
                  required
                  defaultValue={defaultAddress?.pincode || ""}
                  placeholder="PIN code"
                  className="w-full border-b border-ink/20 bg-transparent py-2.5 text-sm outline-none focus:border-gold"
                />
              </div>
            </div>
          </div>

          <div className="border border-ink/10 bg-white/70 p-6">
            <h2 className="text-xs font-bold uppercase tracking-[.16em] text-ink/70 mb-4">
              2. Payment Method
            </h2>
            <div className="space-y-3">
              <label className="flex items-start gap-3 border border-ink/15 p-4 cursor-pointer hover:border-gold transition rounded">
                <input
                  type="radio"
                  name="payment"
                  value="cod"
                  defaultChecked
                  className="mt-1 accent-[#b08d57]"
                />
                <div>
                  <p className="text-sm font-semibold">Cash on Delivery (COD)</p>
                  <p className="text-xs text-ink/55 mt-0.5">Pay in cash or UPI upon delivery at your doorstep.</p>
                </div>
              </label>

              <label className="flex items-start gap-3 border border-ink/15 p-4 cursor-pointer hover:border-gold transition rounded">
                <input
                  type="radio"
                  name="payment"
                  value="online"
                  className="mt-1 accent-[#b08d57]"
                />
                <div>
                  <p className="text-sm font-semibold">Direct Order Placement (Prepaid / UPI)</p>
                  <p className="text-xs text-ink/55 mt-0.5">
                    Order is reserved; payment link / QR sent to your registered mobile and email.
                  </p>
                </div>
              </label>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-ink py-4 text-xs font-bold uppercase tracking-[.16em] text-white hover:bg-gold transition"
          >
            Place order · {formatPrice(grandTotal)}
          </button>
        </form>

        <aside className="h-fit border border-ink/10 bg-sand/50 p-6">
          <p className="text-xs font-bold uppercase tracking-[.16em] text-ink/70">Order Summary</p>
          
          <div className="mt-5 divide-y divide-ink/10 max-h-64 overflow-y-auto">
            {cart.items.map((item) => (
              <div key={item.id} className="py-3 flex justify-between text-xs">
                <div>
                  <p className="font-semibold text-ink">{item.name}</p>
                  <p className="text-ink/50 mt-0.5">
                    Qty: {item.quantity} {item.size ? `· Size: ${item.size}` : ""}
                  </p>
                </div>
                <span className="font-medium text-ink">
                  {formatPrice(item.unitPrice * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-6 border-t border-ink/15 pt-4 space-y-2 text-xs">
            <div className="flex justify-between text-ink/65">
              <span>Subtotal</span>
              <span>{formatPrice(cart.subtotal)}</span>
            </div>
            <div className="flex justify-between text-ink/65">
              <span>Shipping</span>
              <span>{freeShipping ? "FREE" : formatPrice(shippingCharge)}</span>
            </div>
            <div className="flex justify-between border-t border-ink/15 pt-3 text-sm font-bold text-ink">
              <span>Total</span>
              <span>{formatPrice(grandTotal)}</span>
            </div>
          </div>

          <div className="mt-6 border-t border-ink/10 pt-4 space-y-2 text-[11px] text-ink/60">
            <div className="flex items-center gap-2">
              <Truck size={14} className="text-gold" /> Fast all-India tracked delivery
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck size={14} className="text-gold" /> Direct from our own manufacturing house
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
