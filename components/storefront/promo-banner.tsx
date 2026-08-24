import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

type Promotion = Record<string, unknown>;

function promotionField(promotion: Promotion, ...keys: string[]) {
  for (const key of keys) {
    const value = promotion[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return undefined;
}

export function PromoBanner({ promotions }: { promotions: Promotion[] }) {
  if (!promotions.length) return null;
  const promotion = promotions[0];
  const eyebrow = promotionField(promotion, "eyebrow", "label") ?? "Special Offer";
  const title = promotionField(promotion, "title", "text", "heading") ?? "";
  const description = promotionField(promotion, "description", "subtitle");
  const ctaLabel = promotionField(promotion, "buttonText", "cta") ?? "Shop Now";
  const ctaHref = promotionField(promotion, "buttonLink", "link", "href") ?? "/shop";
  const image = promotionField(promotion, "image", "imageUrl");

  return (
    <section className="relative overflow-hidden bg-ink">
      {image && (
        <>
          <Image src={image} alt="" fill className="object-cover opacity-45" sizes="100vw" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-black/20" />
        </>
      )}
      <div className="relative mx-auto flex max-w-[1320px] flex-col items-center px-5 py-24 text-center md:px-10 md:py-32">
        <p className="eyebrow text-gold">{eyebrow}</p>
        <h2 className="display mt-5 max-w-3xl text-5xl leading-[1.02] text-white md:text-7xl">{title}</h2>
        {description && <p className="mt-6 max-w-md text-sm leading-7 text-white/75">{description}</p>}
        <Link href={ctaHref} className="btn-primary mt-9 !bg-white !text-ink hover:!bg-gold hover:!text-white">
          {ctaLabel} <ArrowRight size={14} />
        </Link>
      </div>
    </section>
  );
}
