import Link from "next/link";
import { CheckCircle2, ShoppingBag, ArrowRight } from "lucide-react";
import { db } from "@/lib/db";

export const metadata = {
  title: "Order Confirmed | SHARKI NIGHTWEARS",
};

export default async function OrderSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order: orderNumber } = await searchParams;

  let order = null;
  if (orderNumber) {
    try {
      order = await db.order.findUnique({
        where: { orderNumber },
        include: { items: true },
      });
    } catch (e) {
      console.error("Failed to load order:", e);
    }
  }

  return (
    <div className="mx-auto max-w-xl px-6 py-20 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-800">
        <CheckCircle2 size={36} />
      </div>

      <p className="eyebrow mt-6 text-gold">Thank you for choosing SHARKI</p>
      <h1 className="display mt-3 text-5xl sm:text-6xl">Order Confirmed!</h1>

      {orderNumber && (
        <div className="mt-6 inline-block bg-sand/60 border border-ink/10 px-5 py-2.5 rounded text-xs tracking-wider uppercase font-semibold">
          Order Number: <span className="font-bold text-ink">#{orderNumber}</span>
        </div>
      )}

      <p className="mt-5 text-sm leading-7 text-ink/65">
        Your nightwear is now being prepared in our manufacturing house. A confirmation receipt has been
        dispatched to {order?.email || "your registered email"}.
      </p>

      {order && (
        <div className="mt-8 border border-ink/10 bg-white/70 p-6 text-left text-xs text-ink/75 space-y-2">
          <p className="font-bold uppercase tracking-wider text-ink/50 text-[10px]">Delivery To</p>
          <p className="font-semibold text-ink">{order.recipient}</p>
          <p>
            {order.addressLine1}, {order.city}, {order.state} - {order.pincode}
          </p>
          <p className="pt-2 border-t border-ink/10 flex justify-between font-bold text-ink text-sm">
            <span>Total:</span>
            <span>₹{order.total.toLocaleString("en-IN")}</span>
          </p>
        </div>
      )}

      <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
        <Link
          href="/shop"
          className="bg-ink px-8 py-4 text-xs font-bold uppercase tracking-[.16em] text-white hover:bg-gold transition flex items-center justify-center gap-2"
        >
          <ShoppingBag size={14} /> Continue shopping
        </Link>
        <Link
          href="/account"
          className="border border-ink/20 px-8 py-4 text-xs font-bold uppercase tracking-[.16em] hover:bg-white transition flex items-center justify-center gap-2"
        >
          View your orders <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
}
