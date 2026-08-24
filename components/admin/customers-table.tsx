"use client";

import { useState } from "react";

type Customer = { id: string; name: string | null; email: string; phone: string | null; createdAt: string; orders: number; lifetimeSpend: number };

export function CustomersTable({ customers }: { customers: Customer[] }) {
  const [query, setQuery] = useState("");
  const filtered = customers.filter((customer) => `${customer.name ?? ""} ${customer.email} ${customer.phone ?? ""}`.toLowerCase().includes(query.toLowerCase()));
  return <><div className="mt-8"><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search customer" className="admin-input max-w-sm" /></div><div className="mt-4 overflow-x-auto rounded-lg border border-[#e2e7eb] bg-white"><table className="w-full min-w-[900px] text-left text-sm"><thead className="border-b border-[#e2e7eb] bg-[#f8fafb] text-xs uppercase tracking-wide text-[#71808c]"><tr><th className="p-4">Customer</th><th>Email</th><th>Phone</th><th>Role</th><th>Status</th><th>Orders</th><th>Lifetime spend</th><th>Joined</th></tr></thead><tbody>{filtered.map((customer) => <tr key={customer.id} className="border-b border-[#eef1f3]"><td className="p-4 font-medium">{customer.name ?? "Unnamed customer"}</td><td>{customer.email}</td><td>{customer.phone ?? "—"}</td><td>CUSTOMER</td><td><span className="rounded-full bg-[#e5f2e8] px-2 py-1 text-xs text-[#287a3d]">Active</span></td><td>{customer.orders}</td><td>₹{customer.lifetimeSpend.toLocaleString("en-IN")}</td><td>{new Date(customer.createdAt).toLocaleDateString("en-IN")}</td></tr>)}{!filtered.length && <tr><td colSpan={8} className="p-8 text-center text-[#71808c]">No customers in the database.</td></tr>}</tbody></table></div></>;
}
