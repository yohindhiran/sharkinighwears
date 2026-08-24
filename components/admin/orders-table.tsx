"use client";

import { useState } from "react";

type Order = { id: string; orderNumber: string; email: string; total: number; status: string; paymentStatus: string; createdAt: string; items: { productName: string; quantity: number }[] };

export function OrdersTable({ orders }: { orders: Order[] }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("ALL");
  const [error, setError] = useState("");
  const filtered = orders.filter((order) => `${order.orderNumber} ${order.email}`.toLowerCase().includes(query.toLowerCase()) && (status === "ALL" || order.status === status));
  async function updateStatus(id: string, nextStatus: string) {
    const response = await fetch(`/api/admin/orders/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: nextStatus }) });
    if (!response.ok) setError("Unable to update order status.");
  }
  return <><div className="mt-8 flex flex-wrap gap-3"><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search order or customer" className="admin-input max-w-sm" /><select value={status} onChange={(event) => setStatus(event.target.value)} className="admin-input max-w-xs"><option value="ALL">All statuses</option>{["NEW", "CONFIRMED", "PROCESSING", "PACKED", "SHIPPED", "DELIVERED", "CANCELLED", "RETURNED"].map((value) => <option key={value}>{value}</option>)}</select></div>{error && <p className="mt-3 text-sm text-[#b42318]">{error}</p>}<div className="mt-4 overflow-x-auto rounded-lg border border-[#e2e7eb] bg-white"><table className="w-full min-w-[900px] text-left text-sm"><thead className="border-b border-[#e2e7eb] bg-[#f8fafb] text-xs uppercase tracking-wide text-[#71808c]"><tr><th className="p-4">Order</th><th>Customer</th><th>Items</th><th>Total</th><th>Payment</th><th>Status</th><th>Date</th></tr></thead><tbody>{filtered.map((order) => <tr key={order.id} className="border-b border-[#eef1f3]"><td className="p-4 font-medium">{order.orderNumber}</td><td>{order.email}</td><td>{order.items.reduce((sum, item) => sum + item.quantity, 0)}</td><td>₹{order.total.toLocaleString("en-IN")}</td><td>{order.paymentStatus}</td><td><select value={order.status} onChange={(event) => updateStatus(order.id, event.target.value)} className="rounded border border-[#e2e7eb] bg-white px-2 py-1 text-xs"><option>{order.status}</option>{["NEW", "CONFIRMED", "PROCESSING", "PACKED", "SHIPPED", "DELIVERED", "CANCELLED", "RETURNED"].filter((value) => value !== order.status).map((value) => <option key={value}>{value}</option>)}</select></td><td>{new Date(order.createdAt).toLocaleDateString("en-IN")}</td></tr>)}{!filtered.length && <tr><td colSpan={7} className="p-8 text-center text-[#71808c]">No matching orders in the database.</td></tr>}</tbody></table></div></>;
}
