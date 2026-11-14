import Link from "next/link";
import { getSession } from "@/app/actions/auth";
import { db } from "@/lib/db";
import { AccountDashboard } from "@/components/storefront/account-client";
import type { Prisma, Address } from "@prisma/client";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "My Account | SHARKI NIGHTWEARS",
  description: "Manage your SHARKI orders, saved addresses and account details.",
};

type OrderWithItems = Prisma.OrderGetPayload<{ include: { items: true } }>;

export default async function AccountPage() {
  let user = null;
  try {
    user = await getSession();
  } catch (e) {
    console.error("Failed to get session:", e);
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-md px-6 py-20 text-center">
        <p className="eyebrow text-gold">Your SHARKI account</p>
        <h1 className="display mt-4 text-5xl sm:text-6xl">Welcome in.</h1>
        <p className="mt-5 text-sm leading-7 text-ink/60">
          Sign in to view your orders, track deliveries, and manage saved addresses.
        </p>
        <div className="mt-8 grid gap-3">
          <Link
            href="/login"
            className="bg-ink py-4 text-xs font-bold uppercase tracking-[.16em] text-white hover:bg-gold transition"
          >
            Sign in
          </Link>
          <Link
            href="/register"
            className="border border-ink/20 py-4 text-xs font-bold uppercase tracking-[.16em] hover:bg-white transition"
          >
            Create account
          </Link>
        </div>
      </div>
    );
  }

  let orders: OrderWithItems[] = [];
  let addresses: Address[] = [];

  try {
    [orders, addresses] = await Promise.all([
      db.order.findMany({
        where: { userId: user.id },
        include: { items: true },
        orderBy: { createdAt: "desc" },
      }),
      db.address.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
      }),
    ]);
  } catch (e) {
    console.error("Database error loading user details:", e);
  }

  return <AccountDashboard user={user} orders={orders} addresses={addresses} />;
}
