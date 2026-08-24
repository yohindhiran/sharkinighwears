import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";
import { OrdersTable } from "@/components/admin/orders-table";

export default async function OrdersPage() {
  await requireAdmin();
  const orders = await db.order.findMany({ include: { items: true }, orderBy: { createdAt: "desc" } });
  return <div><p className="text-xs font-semibold uppercase tracking-[.14em] text-[#71808c]">Operations</p><h1 className="mt-2 text-3xl font-semibold">Orders</h1><p className="mt-2 text-sm text-[#71808c]">Real orders from the shared database.</p><OrdersTable orders={orders.map((order) => ({ ...order, createdAt: order.createdAt.toISOString() }))} /></div>;
}
