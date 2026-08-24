import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";
import { ReviewsTable } from "@/components/admin/reviews-table";

export default async function ReviewsPage() {
  await requireAdmin();
  const reviews = await db.review.findMany({ include: { user: { select: { name: true, email: true } }, product: { select: { name: true } } }, orderBy: { createdAt: "desc" } });
  return <div><p className="text-xs font-semibold uppercase tracking-[.14em] text-[#71808c]">Community</p><h1 className="mt-2 text-3xl font-semibold">Reviews</h1><p className="mt-2 text-sm text-[#71808c]">Moderate real customer reviews before they appear on product pages.</p><ReviewsTable reviews={reviews.map((review) => ({ ...review, createdAt: review.createdAt.toISOString() }))} /></div>;
}
