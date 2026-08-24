import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";

export default async function PaymentsPage() {
  await requireAdmin();
  const payments = await db.payment.findMany({ include: { order: { select: { orderNumber: true, email: true } } }, orderBy: { createdAt: "desc" } });
  const total = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const paid = payments.filter((payment) => payment.status === "PAID").length;
  const pending = payments.filter((payment) => payment.status === "PENDING").length;

  return <div><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[.14em] text-[#71808c]">Finance</p><h1 className="mt-2 text-3xl font-semibold">Payments</h1><p className="mt-2 text-sm text-[#71808c]">Real payment records linked to store orders.</p></div></div><div className="mt-8 grid gap-3 sm:grid-cols-3"><Summary label="Recorded payments" value={String(payments.length)} /><Summary label="Paid payments" value={String(paid)} /><Summary label="Recorded value" value={`₹${total.toLocaleString("en-IN")}`} /><Summary label="Pending" value={String(pending)} /></div><div className="mt-8 overflow-x-auto rounded-lg border border-[#e2e7eb] bg-white"><table className="w-full min-w-[800px] text-left text-sm"><thead className="border-b border-[#e2e7eb] bg-[#f8fafb] text-xs uppercase tracking-wide text-[#71808c]"><tr><th className="p-4">Order</th><th>Customer</th><th>Provider</th><th>Method ID</th><th>Status</th><th>Amount</th><th>Date</th></tr></thead><tbody>{payments.map((payment) => <tr key={payment.id} className="border-b border-[#eef1f3]"><td className="p-4 font-medium">{payment.order.orderNumber}</td><td>{payment.order.email}</td><td>{payment.provider}</td><td>{payment.providerPaymentId ?? "—"}</td><td><span className="rounded-full bg-[#f1f3f5] px-2 py-1 text-xs">{payment.status}</span></td><td>₹{payment.amount.toLocaleString("en-IN")}</td><td>{payment.createdAt.toLocaleDateString("en-IN")}</td></tr>)}{!payments.length && <tr><td colSpan={7} className="p-8 text-center text-[#71808c]">No payment records in the database.</td></tr>}</tbody></table></div></div>;
}

function Summary({ label, value }: { label: string; value: string }) {
  return <div className="rounded-lg border border-[#e2e7eb] bg-white p-5"><p className="text-xs text-[#71808c]">{label}</p><p className="mt-3 text-2xl font-semibold">{value}</p></div>;
}
