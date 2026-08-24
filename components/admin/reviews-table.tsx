"use client";

import { useState } from "react";

type Review = { id: string; rating: number; title: string | null; body: string; approved: boolean; createdAt: string; user: { name: string | null; email: string }; product: { name: string } };

export function ReviewsTable({ reviews }: { reviews: Review[] }) {
  const [items, setItems] = useState(reviews);
  const [error, setError] = useState("");
  async function moderate(id: string, approved: boolean) {
    const response = await fetch("/api/admin/reviews", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, approved }) });
    if (!response.ok) { setError("Unable to update review."); return; }
    setItems((current) => current.map((review) => review.id === id ? { ...review, approved } : review));
  }
  return <>{error && <p className="mt-4 text-sm text-[#b42318]">{error}</p>}<div className="mt-8 overflow-x-auto rounded-lg border border-[#e2e7eb] bg-white"><table className="w-full min-w-[950px] text-left text-sm"><thead className="border-b border-[#e2e7eb] bg-[#f8fafb] text-xs uppercase tracking-wide text-[#71808c]"><tr><th className="p-4">Rating</th><th>Customer</th><th>Product</th><th>Review</th><th>Date</th><th>Status</th><th>Action</th></tr></thead><tbody>{items.map((review) => <tr key={review.id} className="border-b border-[#eef1f3]"><td className="p-4">{"★".repeat(review.rating)}{"☆".repeat(Math.max(0, 5 - review.rating))}</td><td>{review.user.name ?? review.user.email}</td><td>{review.product.name}</td><td className="max-w-xs truncate">{review.title ?? review.body}</td><td>{new Date(review.createdAt).toLocaleDateString("en-IN")}</td><td>{review.approved ? "Approved" : "Pending"}</td><td><button onClick={() => moderate(review.id, !review.approved)} className="text-xs font-semibold text-[#42624d]">{review.approved ? "Hide" : "Approve"}</button></td></tr>)}{!items.length && <tr><td colSpan={7} className="p-8 text-center text-[#71808c]">No reviews in the database.</td></tr>}</tbody></table></div></>;
}
