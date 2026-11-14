import Link from "next/link";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";
export const revalidate = 0;

let dashboardCache: { data: Awaited<ReturnType<typeof fetchDashboardData>>; expiresAt: number } | null = null;
const DASHBOARD_CACHE_TTL = 30 * 1000; // 30 seconds

export function clearDashboardCache() {
  dashboardCache = null;
}

export default async function AdminDashboard() {
  await requireAdmin();
  const data = await getDashboardData();

  return (
    <>
      <div className="flex items-end justify-between">
        <div>
          <p className="eyebrow text-rose">Overview</p>
          <h1 className="display mt-2 text-6xl">Good morning.</h1>
        </div>
        <p className="hidden text-xs text-ink/50 sm:block">Shared database · live data</p>
      </div>

      <div className="mt-10 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {data.summary.map(([label, value]) => (
          <div key={label} className="bg-white p-5 border border-[#e2e7eb] rounded-lg shadow-sm">
            <p className="text-xs text-ink/50 uppercase tracking-wider font-semibold">{label}</p>
            <p className="mt-4 text-3xl font-semibold text-[#17212b]">{value}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-[1.3fr_.7fr]">
        <section className="bg-white p-6 border border-[#e2e7eb] rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-[.12em]">Revenue Overview</h2>
            <span className="text-xs text-ink/50">Last 6 months</span>
          </div>
          <div className="mt-8 grid grid-cols-6 items-end gap-3">
            {data.revenue.map((month) => (
              <div key={month.label} className="text-center">
                <div
                  className="mx-auto h-32 max-w-8 rounded-t bg-[#42624d]/80 transition hover:bg-[#42624d]"
                  style={{
                    height: `${Math.max(
                      8,
                      month.amount ? (month.amount / data.maxRevenue) * 128 : 8
                    )}px`,
                  }}
                  title={`₹${month.amount.toLocaleString("en-IN")}`}
                />
                <p className="mt-2 text-[10px] font-semibold text-ink/50">{month.label}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-[#42624d] text-white p-6 rounded-lg shadow-sm flex flex-col justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-white/70">Orders Trend</p>
            <p className="display mt-4 text-5xl font-bold">{data.orderTrend}</p>
            <p className="mt-2 text-sm text-white/80">Orders recorded in the last 30 days</p>
          </div>
          <Link
            href="/admin/orders"
            className="mt-6 inline-block text-xs font-bold uppercase tracking-widest text-white underline underline-offset-8 hover:text-white/80"
          >
            View all orders &rarr;
          </Link>
        </section>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-[1.3fr_.7fr]">
        <section className="rounded-lg border border-[#e2e7eb] bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-[#e2e7eb] p-6">
            <h2 className="text-sm font-bold uppercase tracking-[.12em]">Recent Orders</h2>
            <Link href="/admin/orders" className="text-xs font-semibold text-[#42624d] hover:underline">
              View all
            </Link>
          </div>
          {data.recentOrders.map((order) => (
            <div
              key={order.id}
              className="flex items-center justify-between gap-4 border-b border-[#eef1f3] p-4 text-sm hover:bg-gray-50/50"
            >
              <div>
                <p className="font-medium text-[#17212b]">{order.orderNumber}</p>
                <p className="mt-1 text-xs text-[#71808c]">{order.email}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-[#17212b]">₹{order.total.toLocaleString("en-IN")}</p>
                <p className="mt-1 text-xs text-[#71808c]">{order.status}</p>
              </div>
            </div>
          ))}
          {!data.recentOrders.length && (
            <p className="p-6 text-sm text-[#71808c]">No orders recorded yet.</p>
          )}
        </section>

        <section className="rounded-lg border border-[#e2e7eb] bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-[#e2e7eb] p-6">
            <h2 className="text-sm font-bold uppercase tracking-[.12em]">Low Stock Alert</h2>
            <Link href="/admin/inventory" className="text-xs font-semibold text-[#42624d] hover:underline">
              Manage inventory
            </Link>
          </div>
          {data.lowStock.map((variant) => (
            <div
              key={variant.id}
              className="flex items-center justify-between gap-3 border-b border-[#eef1f3] p-4 text-sm hover:bg-gray-50/50"
            >
              <div>
                <p className="font-medium text-[#17212b]">{variant.product.name}</p>
                <p className="mt-1 text-xs text-[#71808c]">{variant.sku}</p>
              </div>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
                variant.stock === 0 ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700"
              }`}>
                {variant.stock === 0 ? "Out of stock" : `${variant.stock} left`}
              </span>
            </div>
          ))}
          {!data.lowStock.length && (
            <p className="p-6 text-sm text-[#71808c]">All items sufficiently stocked.</p>
          )}
        </section>
      </div>
    </>
  );
}

async function getDashboardData() {
  if (dashboardCache && dashboardCache.expiresAt > Date.now()) {
    return dashboardCache.data;
  }
  const data = await fetchDashboardData();
  dashboardCache = { data, expiresAt: Date.now() + DASHBOARD_CACHE_TTL };
  return data;
}

async function fetchDashboardData() {
  try {
    const [products, categories, orders, customers, recentOrders, lowStock, revenueOrders] =
      await Promise.all([
        db.product.count().catch(() => 0),
        db.category.count().catch(() => 0),
        db.order.count().catch(() => 0),
        db.user.count({ where: { role: "CUSTOMER" } }).catch(() => 0),
        db.order
          .findMany({
            select: { id: true, orderNumber: true, email: true, total: true, status: true },
            orderBy: { createdAt: "desc" },
            take: 5,
          })
          .catch(() => []),
        db.productVariant
          .findMany({
            where: { stock: { lte: 5 } },
            select: {
              id: true,
              sku: true,
              stock: true,
              product: { select: { name: true } },
            },
            orderBy: { stock: "asc" },
            take: 6,
          })
          .catch(() => []),
        db.order
          .findMany({
            select: { total: true, createdAt: true },
            where: {
              createdAt: {
                gte: new Date(new Date().setMonth(new Date().getMonth() - 6)),
              },
            },
            orderBy: { createdAt: "asc" },
          })
          .catch(() => []),
      ]);

    const now = new Date();
    const revenue = Array.from({ length: 6 }, (_, index) => {
      const date = new Date(now.getFullYear(), now.getMonth() - 5 + index, 1);
      return {
        label: date.toLocaleDateString("en-IN", { month: "short" }),
        amount: revenueOrders
          .filter(
            (order) =>
              order.createdAt.getFullYear() === date.getFullYear() &&
              order.createdAt.getMonth() === date.getMonth()
          )
          .reduce((sum, order) => sum + order.total, 0),
      };
    });

    return {
      summary: [
        ["Products", String(products)],
        ["Categories", String(categories)],
        ["Orders", String(orders)],
        ["Customers", String(customers)],
      ] as [string, string][],
      recentOrders,
      lowStock,
      revenue,
      maxRevenue: Math.max(1, ...revenue.map(({ amount }) => amount)),
      orderTrend: String(
        revenueOrders.filter(
          ({ createdAt }) => createdAt >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        ).length
      ),
    };
  } catch {
    return {
      summary: [
        ["Products", "0"],
        ["Categories", "0"],
        ["Orders", "0"],
        ["Customers", "0"],
      ] as [string, string][],
      recentOrders: [],
      lowStock: [],
      revenue: [],
      maxRevenue: 1,
      orderTrend: "0",
    };
  }
}
