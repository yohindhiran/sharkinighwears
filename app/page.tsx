import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, MessageCircle, Sparkles, Feather, Truck, RotateCcw, ShieldCheck } from "lucide-react";
import { getStorefrontProducts, getStorefrontCategories, getStorefrontPromotions, getStorefrontReviews } from "@/lib/storefront-data";
import { ProductCard } from "@/components/storefront/product-card";
import { HeroCarousel } from "@/components/storefront/hero-carousel";
import { BenefitsBar } from "@/components/storefront/benefits-bar";
import { PromoBanner } from "@/components/storefront/promo-banner";
import { ReviewsCarousel } from "@/components/storefront/reviews-carousel";
import { NewsletterForm } from "@/components/storefront/newsletter-form";
import { defaultHomepageContent, getSiteContent, type HomepageContent } from "@/lib/site-content";

const categoryTones = ["#e9dfd2", "#dfe4dc", "#ece5da", "#e8ddd6", "#e4e0d5", "#efe7dd"];

const whyItems = [
  { icon: Sparkles, title: "Premium Quality", text: "Own manufacturing lets us keep every stitch, seam and fabric under careful watch." },
  { icon: Feather, title: "Comfort First", text: "Breathable fabrics and relaxed fits designed for real, restful nights." },
  { icon: Truck, title: "Fast Delivery", text: "Dispatched quickly from our own house, carefully packed to reach you in shape." },
  { icon: RotateCcw, title: "Easy Returns", text: "A simple, honest return policy because comfort should never be a gamble." },
  { icon: ShieldCheck, title: "Secure Payments", text: "Checkout is encrypted and safe, with trusted payment options." },
];

export default async function HomePage() {
  let products = [];
  let categories = [];
  let promotions = [];
  let reviews = [];
  let homepage = defaultHomepageContent;
  let footerContent = { newsletterText: "New drops, thoughtful stories and a softer way to start the day." };
  let error = false;

  try {
    const results = await Promise.all([
      getStorefrontProducts().catch(() => []),
      getStorefrontCategories().catch(() => []),
      getStorefrontPromotions().catch(() => []),
      getStorefrontReviews(8).catch(() => []),
      getSiteContent<HomepageContent>("homepage", defaultHomepageContent).catch(() => defaultHomepageContent),
      getSiteContent<{ newsletterText?: string }>("footer", {}).catch(() => ({})),
    ]);

    [products, categories, promotions, reviews, homepage, footerContent] = results;
  } catch (e) {
    console.warn("Error loading homepage data:", e);
    error = true;
  }

  const arrivals = products.slice(0, 8);

  return (
    <>
      {homepage.active !== false && (
        <HeroCarousel 
          images={homepage.heroImages} 
          interval={homepage.heroInterval} 
          heading={homepage.heading} 
          description={homepage.description} 
          buttonText={homepage.buttonText}
          buttonLink={homepage.buttonLink}
        />
      )}

      <BenefitsBar />

      {categories.length > 0 && (
        <section className="mx-auto max-w-[1320px] px-5 py-20 md:px-10 md:py-28">
          <SectionHeading eyebrow="Find your fit" title="Shop by Category" linkHref="/categories" linkLabel="View all" />
          <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {categories.slice(0, 6).map((category, index) => (
              <Link key={category.id} href={`/shop?category=${category.slug}`} className="group relative block aspect-[4/5] overflow-hidden" style={{ backgroundColor: categoryTones[index % categoryTones.length] }}>
                {category.imageUrl ? (
                  <Image src={category.imageUrl} alt={category.name} fill className="object-cover transition duration-700 ease-out group-hover:scale-105" sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="display text-5xl text-ink/15 md:text-6xl">{category.name}</span>
                  </div>
                )}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 to-transparent p-7 pt-16">
                  <h3 className="display text-3xl text-white">{category.name}</h3>
                  <span className="mt-3 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.2em] text-white/85 transition group-hover:gap-3.5 group-hover:text-gold">
                    Shop Now <ArrowUpRight size={13} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {arrivals.length > 0 && (
        <section className="border-t border-ink/10 bg-white/60 mx-auto max-w-[1320px] px-5 py-20 md:px-10 md:py-28">
          <SectionHeading eyebrow="Fresh from our house" title="New Arrivals" subtitle="The latest pieces, made for soft evenings and slow mornings." linkHref="/shop" linkLabel="View all" />
          <div className="mt-12 grid grid-cols-2 gap-x-4 gap-y-12 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
            {arrivals.map((product) => <ProductCard key={product.slug} product={product} />)}
          </div>
        </section>
      )}

      {arrivals.length === 0 && !error && (
        <section className="mx-auto max-w-[1320px] px-5 py-20 md:px-10 md:py-28 text-center">
          <p className="text-ink/50">No products available yet. Check back soon!</p>
        </section>
      )}

      <PromoBanner promotions={promotions} />

      <section className="bg-sand">
        <div className="mx-auto grid max-w-[1320px] items-center gap-12 px-5 py-20 md:grid-cols-2 md:px-10 md:py-28">
          <div className="relative aspect-[4/5] overflow-hidden">
            <Image src="https://images.unsplash.com/photo-1571513722275-4b41940f54b8?auto=format&fit=crop&w=1000&q=85" alt="Textile and garment craftsmanship" fill className="object-cover" sizes="(max-width: 640px) 100vw, 50vw" />
          </div>
          <div className="max-w-md">
            <p className="eyebrow text-gold">From our house to yours</p>
            <h2 className="display mt-4 text-5xl leading-[.98] md:text-6xl">Made by us.<br />Crafted for you.</h2>
            <p className="mt-7 text-sm leading-7 text-ink/65">Every SHARKI piece begins with a considered fabric and ends with a careful quality check. Our own manufacturing house lets us stay close to every detail.</p>
            <Link href="/our-making" className="link-underline mt-9">Our making story <ArrowUpRight size={14} /></Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1320px] px-5 py-20 md:px-10 md:py-28">
        <div className="text-center">
          <p className="eyebrow text-gold">Why SHARKI</p>
          <h2 className="display mt-4 text-5xl md:text-6xl">Why Choose Us?</h2>
        </div>
        <div className="mt-14 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-5">
          {whyItems.map((item) => (
            <div key={item.title} className="border-t border-ink/15 pt-6 text-center sm:text-left">
              <item.icon size={26} strokeWidth={1.2} className="mx-auto text-gold sm:mx-0" />
              <h3 className="mt-6 text-xs font-bold uppercase tracking-[.16em]">{item.title}</h3>
              <p className="mt-3 text-sm leading-6 text-ink/60">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      {reviews.length > 0 && (
        <section className="border-t border-ink/10 bg-sand/60">
          <div className="mx-auto max-w-[1320px] px-5 py-20 md:px-10 md:py-28">
            <div className="mb-12 text-center">
              <p className="eyebrow text-gold">Testimonials</p>
              <h2 className="display mt-4 text-5xl md:text-6xl">What Our Customers Say</h2>
            </div>
            <ReviewsCarousel reviews={reviews} />
          </div>
        </section>
      )}

      <section className="bg-ink px-5 py-20 text-white md:px-10 md:py-24">
        <div className="mx-auto max-w-[1100px]">
          <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-end">
            <div>
              <p className="eyebrow text-gold">For stores and resellers</p>
              <h2 className="display mt-4 max-w-lg text-5xl leading-[.98] md:text-6xl">A reliable supply of beautiful comfort.</h2>
            </div>
            <Link href="/wholesale" className="link-underline text-white">Explore wholesale <ArrowUpRight size={14} /></Link>
          </div>
        </div>
      </section>

      <section className="bg-[#26221f] px-5 py-20 text-center text-white md:px-10 md:py-24">
        <p className="eyebrow text-gold">Stay in the loop</p>
        <h2 className="display mx-auto mt-4 max-w-xl text-4xl leading-tight md:text-6xl">Subscribe to Our Newsletter</h2>
        <p className="mx-auto mt-5 max-w-md text-sm leading-7 text-white/65">{footerContent.newsletterText ?? "New drops, thoughtful stories and a softer way to start the day."}</p>
        <div className="mt-10">
          <NewsletterForm />
        </div>
      </section>

      <div className="fixed bottom-5 right-5 z-30">
        <Link href="/contact" aria-label="Contact SHARKI NIGHTWEARS" className="flex h-12 w-12 items-center justify-center rounded-full bg-gold text-white shadow-lg transition hover:scale-105">
          <MessageCircle size={20} />
        </Link>
      </div>
    </>
  );
}

function SectionHeading({ eyebrow, title, subtitle, linkHref, linkLabel }: { eyebrow: string; title: string; subtitle?: string; linkHref?: string; linkLabel?: string }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-6">
      <div>
        <p className="eyebrow text-gold">{eyebrow}</p>
        <h2 className="display mt-3 text-4xl md:text-6xl">{title}</h2>
        {subtitle && <p className="mt-4 max-w-md text-sm leading-7 text-ink/55">{subtitle}</p>}
      </div>
      {linkHref && linkLabel && <Link href={linkHref} className="link-underline mb-1 hidden sm:inline-flex">{linkLabel}</Link>}
    </div>
  );
}
