import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";
import { InventoryTable } from "@/components/admin/inventory-table";

export default async function InventoryPage() {
  await requireAdmin();
  const variants = await db.productVariant.findMany({ include: { product: { select: { name: true } } }, orderBy: { stock: "asc" } });
  return <div><p className="text-xs font-semibold uppercase tracking-[.14em] text-[#71808c]">Operations</p><h1 className="mt-2 text-3xl font-semibold">Inventory</h1><p className="mt-2 text-sm text-[#71808c]">Stock quantities are read and updated against product variants in the database.</p><InventoryTable variants={variants} /></div>;
}
