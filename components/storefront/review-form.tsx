"use client";

import { useState } from "react";
import { Star, CheckCircle2 } from "lucide-react";

export function ReviewForm({ productId, productName }: { productId: string; productName: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    const formData = new FormData(e.currentTarget);
    const payload = {
      productId,
      rating,
      title: formData.get("title") as string,
      body: formData.get("body") as string,
      guestName: formData.get("name") as string,
      guestEmail: formData.get("email") as string,
    };

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit review.");

      setSuccessMessage(data.message || "Thank you! Your review has been submitted for moderation.");
      setIsOpen(false);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-8">
      {successMessage && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm rounded flex items-center gap-3">
          <CheckCircle2 size={18} />
          <span>{successMessage}</span>
        </div>
      )}

      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="border border-ink/20 px-6 py-3 text-xs font-bold uppercase tracking-[.16em] hover:bg-ink hover:text-white transition"
        >
          Write a Review
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="border border-ink/15 bg-white/80 p-6 max-w-xl space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-ink/10">
            <h3 className="font-semibold text-sm">Review {productName}</h3>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-xs text-ink/50 hover:text-ink uppercase tracking-wider"
            >
              Cancel
            </button>
          </div>

          {errorMessage && (
            <div className="p-2.5 bg-red-50 text-red-700 text-xs rounded border border-red-200">
              {errorMessage}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-ink/60 mb-1.5">
              Rating
            </label>
            <div className="flex gap-1.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 focus:outline-none transition-transform hover:scale-110"
                >
                  <Star
                    size={20}
                    className={
                      star <= (hoverRating || rating)
                        ? "fill-[#b08d57] text-[#b08d57]"
                        : "text-ink/25"
                    }
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <input
              name="name"
              required
              placeholder="Your name"
              className="border-b border-ink/20 bg-transparent py-2 text-sm outline-none focus:border-gold"
            />
            <input
              name="email"
              required
              type="email"
              placeholder="Your email (kept private)"
              className="border-b border-ink/20 bg-transparent py-2 text-sm outline-none focus:border-gold"
            />
          </div>

          <input
            name="title"
            placeholder="Review headline (e.g. Incredibly soft, perfect fit)"
            className="w-full border-b border-ink/20 bg-transparent py-2 text-sm outline-none focus:border-gold"
          />

          <textarea
            name="body"
            required
            rows={3}
            placeholder="Share your experience with the fabric, comfort, and craftsmanship..."
            className="w-full resize-none border-b border-ink/20 bg-transparent py-2 text-sm outline-none focus:border-gold"
          />

          <button
            type="submit"
            disabled={loading}
            className="bg-ink text-white px-6 py-3 text-xs font-bold uppercase tracking-[.16em] hover:bg-gold transition disabled:opacity-50"
          >
            {loading ? "Submitting..." : "Submit Review"}
          </button>
        </form>
      )}
    </div>
  );
}
