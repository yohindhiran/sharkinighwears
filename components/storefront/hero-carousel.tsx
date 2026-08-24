"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const defaultSlides = [
  {
    src: "https://images.unsplash.com/photo-1618932260643-eee4a2f652a6?auto=format&fit=crop&w=1800&q=85",
    alt: "Woman wearing a soft rose nightwear set",
  },
  {
    src: "https://images.unsplash.com/photo-1571513722275-4b41940f54b8?auto=format&fit=crop&w=1800&q=85",
    alt: "Textile and garment craftsmanship",
  },
  {
    src: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1800&q=85",
    alt: "Softly styled bedroom textiles",
  },
];

export function HeroCarousel({ images = defaultSlides.map((slide) => slide.src), interval = 6000, heading, description, buttonText, buttonLink }: { images?: string[]; interval?: number; heading?: string; description?: string; buttonText?: string; buttonLink?: string }) {
  const [active, setActive] = useState(0);
  const slides = (images.length ? images : defaultSlides.map((slide) => slide.src)).map((src) => ({ src, alt: "SHARKI NIGHTWEARS nightwear collection" }));
  const headline = heading || "Elevate Your Everyday Style";
  const copy = description || "Premium nightwear designed for comfort and confidence.";
  const ctaLabel = buttonText || "Shop Now";
  const ctaHref = buttonLink || "/shop";

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActive((current) => (current + 1) % slides.length);
    }, Math.max(3000, interval));
    return () => window.clearInterval(timer);
  }, [interval, slides.length]);

  return (
    <section className="relative h-[78vh] min-h-[520px] overflow-hidden bg-[#e3d5c8] md:h-[86vh] md:min-h-[640px]" aria-label="SHARKI NIGHTWEARS featured collection">
      {slides.map((slide, index) => (
        <Image
          key={slide.src}
          src={slide.src}
          alt={slide.alt}
          fill
          priority={index === 0}
          className={`object-cover object-center transition-opacity duration-[1200ms] ease-out ${index === active ? "opacity-100" : "opacity-0"}`}
          sizes="100vw"
        />
      ))}
      <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/25 to-transparent" />
      <div className="absolute inset-0 flex items-center">
        <div className="mx-auto w-full max-w-[1320px] px-6 md:px-10">
          <div className="max-w-xl text-white">
            <p className="eyebrow text-white/80">New Collection</p>
            <h1 className="display mt-5 text-5xl leading-[1.02] md:text-7xl lg:text-[84px]">{headline}</h1>
            <p className="mt-6 max-w-md text-sm leading-7 text-white/85 md:text-base">{copy}</p>
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <Link href={ctaHref} className="btn-primary !bg-white !text-ink hover:!bg-gold hover:!text-white">
                {ctaLabel} <ArrowRight size={14} />
              </Link>
              <Link href="/our-making" className="link-underline text-white">Our story</Link>
            </div>
          </div>
        </div>
      </div>
      {slides.length > 1 && (
        <>
          <div className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 items-center gap-3 md:left-auto md:right-12 md:translate-x-0">
            {slides.map((slide, index) => (
              <button
                key={slide.src}
                onClick={() => setActive(index)}
                aria-label={`Go to slide ${index + 1}`}
                className={`h-[3px] transition-all duration-500 ${index === active ? "w-10 bg-white" : "w-5 bg-white/45 hover:bg-white/70"}`}
              />
            ))}
          </div>
          <div className="absolute bottom-8 left-6 hidden items-center gap-2 md:left-10 lg:flex">
            <span className="text-xs font-semibold tracking-[.2em] text-white/85">{String(active + 1).padStart(2, "0")}</span>
            <span className="h-px w-8 bg-white/50" />
            <span className="text-xs tracking-[.2em] text-white/60">{String(slides.length).padStart(2, "0")}</span>
          </div>
        </>
      )}
    </section>
  );
}
