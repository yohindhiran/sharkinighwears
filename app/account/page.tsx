import Link from "next/link";
import { getSession, logout } from "@/app/actions/auth";
import { db } from "@/lib/db";

export default async function AccountPage() {
  const user = await getSession();

  if (!user) {
    return (
      <div className="mx-auto max-w-md px-6 py-20 text-center">
        <p className="eyebrow text-rose">Your SHARKI account</p>
        <h1 className="display mt-4 text-6xl">Welcome in.</h1>
        <p className="mt-5 text-sm leading-7 text-ink/60">Sign in to view your orders, saved pieces and delivery details.</p>
        <div className="mt-8 grid gap-3">
          <Link href="/login" className="bg-ink py-4 text-xs font-bold uppercase tracking-[.16em] text-white">Sign in</Link>
          <Link href="/register" className="border border-ink/20 py-4 text-xs font-bold uppercase tracking-[.16em]">Create account</Link>
        </div>
      </div>
    );
  }

  const orders = await db.order.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-4xl px-6 py-20">
      <div className="flex items-end justify-between">
        <div>
          <p className="eyebrow text-rose">Welcome back</p>
          <h1 className="display mt-4 text-5xl">{user.name}</h1>
        </div>
        <form action={logout}>
          <button className="text-sm font-semibold text-ink/60 underline">Log out</button>
        </form>
      </div>

      <div className="mt-16">
        <h2 className="text-xl font-semibold">Your Orders</h2>
        {orders.length === 0 ? (
          <p className="mt-4 text-sm text-ink/60">You haven&apos;t placed any orders yet.</p>
        ) : (
          <div className="mt-6 space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="border border-ink/10 p-5 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-sm">Order {order.orderNumber}</p>
                  <p className="text-xs text-ink/60 mt-1">{order.createdAt.toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-sm">₹{order.total.toLocaleString("en-IN")}</p>
                  <p className="text-xs text-ink/60 mt-1 uppercase">{order.status}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
