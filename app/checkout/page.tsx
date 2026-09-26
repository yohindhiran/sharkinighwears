import { submitOrder } from "./actions";
import { getCartSummary } from "@/lib/cart";

export default async function CheckoutPage() {
  const cart = await getCartSummary();

  return (
    <div className="mx-auto max-w-[1100px] px-6 py-14 md:px-12 md:py-20">
      <p className="eyebrow text-rose">Almost yours</p>
      <h1 className="display mt-4 text-6xl">Checkout</h1>
      <div className="mt-12 grid gap-12 md:grid-cols-[1.2fr_.8fr]">
        <form action={submitOrder} className="space-y-7">
          <div className="grid gap-5 sm:grid-cols-2">
            <input name="name" required placeholder="Full name" className="border-b border-ink/20 bg-transparent py-3 text-sm outline-none focus:border-rose" />
            <input name="mobile" required placeholder="Mobile number" className="border-b border-ink/20 bg-transparent py-3 text-sm outline-none focus:border-rose" />
          </div>
          <input name="email" required type="email" placeholder="Email address" className="w-full border-b border-ink/20 bg-transparent py-3 text-sm outline-none focus:border-rose" />
          <input name="address" required placeholder="Address" className="w-full border-b border-ink/20 bg-transparent py-3 text-sm outline-none focus:border-rose" />
          <div className="grid gap-5 sm:grid-cols-3">
            <input name="city" required placeholder="City" className="border-b border-ink/20 bg-transparent py-3 text-sm outline-none focus:border-rose" />
            <input name="state" required placeholder="State" className="border-b border-ink/20 bg-transparent py-3 text-sm outline-none focus:border-rose" />
            <input name="pincode" required placeholder="Pincode" className="border-b border-ink/20 bg-transparent py-3 text-sm outline-none focus:border-rose" />
          </div>
          <div>
            <p className="eyebrow mb-4">Payment method</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="border border-ink/20 p-4 text-sm">
                <input type="radio" name="payment" value="online" defaultChecked className="mr-3" /> Online payment
              </label>
              <label className="border border-ink/20 p-4 text-sm">
                <input type="radio" name="payment" value="cod" className="mr-3" /> Cash on delivery
              </label>
            </div>
          </div>
          <button type="submit" className="w-full bg-ink py-4 text-xs font-bold uppercase tracking-[.16em] text-white">Place order</button>
        </form>
        <aside className="h-fit bg-sand p-7">
          <p className="eyebrow">Order summary</p>
          <div className="mt-7 flex justify-between text-sm">
            <span>Subtotal</span>
            <span>₹{cart.subtotal}</span>
          </div>
          <div className="mt-4 flex justify-between text-sm">
            <span>Shipping</span>
            <span>Calculated at checkout</span>
          </div>
          <div className="mt-6 flex justify-between border-t border-ink/15 pt-5 font-bold">
            <span>Total</span>
            <span>₹{cart.subtotal}</span>
          </div>
        </aside>
      </div>
    </div>
  );
}
