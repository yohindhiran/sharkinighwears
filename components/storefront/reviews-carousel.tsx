"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { useEffect, useState } from "react";
import type { StorefrontReview } from "@/lib/catalog";

function initials(name: string | null) {
  if (!name) return "S";
  return name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase() ?? "").join("") || "S";
}

export function ReviewsCarousel({ reviews }: { reviews: StorefrontReview[] }) {
  const [active, setActive] = useState(0);
  const [visible, setVisible] = useState(3);

  useEffect(() => {
    function update() {
      const width = window.innerWidth;
      setVisible(width < 640 ? 1 : width < 1024 ? 2 : 3);
    }
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const pages = Math.max(1, reviews.length - visible + 1);

  useEffect(() => {
    const timer = window.setInterval(() => setActive((current) => (current + 1) % pages), 7000);
    return () => window.clearInterval(timer);
  }, [pages]);

  return (
    <div>
      <div className="overflow-hidden">
        <div className="flex transition-transform duration-700 ease-out" style={{ transform: `translateX(-${active * (100 / Math.max(reviews.length, 1))}%)` }}>
          {reviews.map((review) => (
            <figure key={review.id} className="w-full shrink-0 border border-ink/10 bg-white px-8 py-10 sm:w-1/2 lg:w-1/3">
              <div className="flex gap-1" aria-label={`${review.rating} out of 5 stars`}>
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star key={index} size={13} className={index < review.rating ? "fill-gold text-gold" : "text-ink/20"} />
                ))}
              </div>
              {review.title && <p className="mt-5 text-sm font-bold tracking-wide">{review.title}</p>}
              <blockquote className="mt-3 min-h-[72px] text-sm leading-7 text-ink/65">“{review.body}”</blockquote>
              <figcaption className="mt-7 flex items-center gap-3 border-t border-ink/10 pt-6">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-sand text-[11px] font-bold tracking-wider text-gold">{initials(review.userName)}</span>
                <span>
                  <span className="block text-xs font-bold uppercase tracking-[.14em]">{review.userName ?? "Verified customer"}</span>
                  <Link href={`/product/${review.productSlug}`} className="mt-0.5 block text-[11px] text-ink/50 transition hover:text-gold">{review.productName}</Link>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
      {pages > 1 && (
        <div className="mt-9 flex items-center justify-center gap-5">
          <button aria-label="Previous reviews" onClick={() => setActive((current) => (current - 1 + pages) % pages)} className="flex h-10 w-10 items-center justify-center rounded-full border border-ink/15 transition hover:border-gold hover:text-gold"><ChevronLeft size={17} /></button>
          <div className="flex gap-2">
            {Array.from({ length: pages }).map((_, index) => (
              <button key={index} aria-label={`Go to reviews page ${index + 1}`} onClick={() => setActive(index)} className={`h-1.5 rounded-full transition-all duration-400 ${index === active ? "w-7 bg-gold" : "w-1.5 bg-ink/20 hover:bg-ink/40"}`} />
            ))}
          </div>
          <button aria-label="Next reviews" onClick={() => setActive((current) => (current + 1) % pages)} className="flex h-10 w-10 items-center justify-center rounded-full border border-ink/15 transition hover:border-gold hover:text-gold"><ChevronRight size={17} /></button>
        </div>
      )}
    </div>
  );
}
