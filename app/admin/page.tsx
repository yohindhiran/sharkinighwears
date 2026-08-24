import Link from "next/link";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";

export default async function AdminDashboard() {
  await requireAdmin();
  const data = await getDashboardData();
  return <><div className="flex items-end justify-between"><div><p className="eyebrow text-rose">Overview</p><h1 className="display mt-2 text-6xl">Good morning.</h1></div><p className="hidden text-xs text-ink/50 sm:block">Shared database · live data</p></div><div className="mt-10 grid grid-cols-2 gap-3 lg:grid-cols-4">{data.summary.map(([label, value]) => <div key={label} className="bg-white p-5"><p className="text-xs text-ink/50">{label}</p><p className="mt-5 text-2xl font-semibold">{value}</p></div>)}</div><div className="mt-10 grid gap-6 lg:grid-cols-[1.3fr_.7fr]"><section className="bg-white p-6"><div className="flex items-center justify-between"><h2 className="text-sm font-bold uppercase tracking-[.12em]">Revenue Overview</h2><span className="text-xs text-ink/50">Last 6 months</span></div><div className="mt-8 grid grid-cols-6 items-end gap-3">{data.revenue.map((month) => <div key={month.label} className="text-center"><div className="mx-auto h-32 max-w-8 rounded-t bg-[#d9e0d4]" style={{ height: `${Math.max(8, month.amount ? (month.amount / data.maxRevenue) * 128 : 8)}px` }} title={`₹${month.amount.toLocaleString("en-IN")}`} /><p className="mt-2 text-[10px] text-ink/50">{month.label}</p></div>)}</div></section><section className="bg-[#d9e0d4] p-6"><p className="eyebrow">Orders Trend</p><p className="display mt-8 text-4xl">{data.orderTrend}</p><p className="mt-3 text-sm text-ink/60">Orders recorded in the last 30 days</p><Link href="/admin/orders" className="mt-8 inline-block text-xs font-bold uppercase tracking-widest underline underline-offset-8">View orders</Link></section></div><div className="mt-10 grid gap-6 lg:grid-cols-[1.3fr_.7fr]"><section className="rounded-lg border border-[#e2e7eb] bg-white"><div className="flex items-center justify-between border-b border-[#e2e7eb] p-6"><h2 className="text-sm font-bold uppercase tracking-[.12em]">Recent Orders</h2><Link href="/admin/orders" className="text-xs text-[#42624d]">View all</Link></div>{data.recentOrders.map((order) => <div key={order.id} className="flex items-center justify-between gap-4 border-b border-[#eef1f3] p-4 text-sm"><div><p className="font-medium">{order.orderNumber}</p><p className="mt-1 text-xs text-[#71808c]">{order.email}</p></div><div className="text-right"><p>₹{order.total.toLocaleString("en-IN")}</p><p className="mt-1 text-xs text-[#71808c]">{order.status}</p></div></div>)}{!data.recentOrders.length && <p className="p-6 text-sm text-[#71808c]">No orders in the database.</p>}</section><section className="rounded-lg border border-[#e2e7eb] bg-white"><div className="border-b border-[#e2e7eb] p-6"><h2 className="text-sm font-bold uppercase tracking-[.12em]">Low Stock</h2></div>{data.lowStock.map((variant) => <div key={variant.id} className="flex items-center justify-between gap-3 border-b border-[#eef1f3] p-4 text-sm"><div><p className="font-medium">{variant.product.name}</p><p className="mt-1 text-xs text-[#71808c]">{variant.sku}</p></div><span className="text-[#9a6b1c]">{variant.stock} left</span></div>)}{!data.lowStock.length && <p className="p-6 text-sm text-[#71808c]">No low-stock variants.</p>}</section></div></>;
}

async function getDashboardData() {
  try {
    const [products, categories, orders, customers, recentOrders, lowStock, revenueOrders] = await Promise.all([
      db.product.count(),
      db.category.count(),
      db.order.count(),
      db.user.count({ where: { role: "CUSTOMER" } }),
      db.order.findMany({ select: { id: true, orderNumber: true, email: true, total: true, status: true }, orderBy: { createdAt: "desc" }, take: 5 }),
      db.productVariant.findMany({ where: { stock: { lte: 5 } }, select: { id: true, sku: true, stock: true, product: { select: { name: true } } }, orderBy: { stock: "asc" }, take: 6 }),
      db.order.findMany({ select: { total: true, createdAt: true }, where: { createdAt: { gte: new Date(new Date().setMonth(new Date().getMonth() - 6)) } }, orderBy: { createdAt: "asc" } }),
    ]);
    const now = new Date();
    const revenue = Array.from({ length: 6 }, (_, index) => { const date = new Date(now.getFullYear(), now.getMonth() - 5 + index, 1); return { label: date.toLocaleDateString("en-IN", { month: "short" }), amount: revenueOrders.filter((order) => order.createdAt.getFullYear() === date.getFullYear() && order.createdAt.getMonth() === date.getMonth()).reduce((sum, order) => sum + order.total, 0) }; });
    return { summary: [["Products", String(products)], ["Categories", String(categories)], ["Orders", String(orders)], ["Customers", String(customers)]] as [string, string][], recentOrders, lowStock, revenue, maxRevenue: Math.max(1, ...revenue.map(({ amount }) => amount)), orderTrend: String(revenueOrders.filter(({ createdAt }) => createdAt >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length) };
  } catch {
    return { summary: [["Products", "—"], ["Categories", "—"], ["Orders", "—"], ["Customers", "—"]] as [string, string][], recentOrders: [], lowStock: [], revenue: [], maxRevenue: 1, orderTrend: "—" };
  }
}
