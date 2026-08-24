import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";
import { CustomersTable } from "@/components/admin/customers-table";

export default async function CustomersPage() {
  await requireAdmin();
  const customers = await db.user.findMany({ where: { role: "CUSTOMER" }, select: { id: true, name: true, email: true, phone: true, createdAt: true, orders: { select: { total: true } } }, orderBy: { createdAt: "desc" } });
  return <div><p className="text-xs font-semibold uppercase tracking-[.14em] text-[#71808c]">Relationships</p><h1 className="mt-2 text-3xl font-semibold">Customers</h1><p className="mt-2 text-sm text-[#71808c]">Real customer records and order value from the shared database.</p><CustomersTable customers={customers.map((customer) => ({ id: customer.id, name: customer.name, email: customer.email, phone: customer.phone, createdAt: customer.createdAt.toISOString(), orders: customer.orders.length, lifetimeSpend: customer.orders.reduce((sum, order) => sum + order.total, 0) }))} /></div>;
}
