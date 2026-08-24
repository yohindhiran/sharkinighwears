import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { getStorefrontCategories } from "@/lib/storefront-data";
import { PageIntro } from "@/components/storefront/page-intro";

const tones = ["#e9dfd2", "#dfe4dc", "#ece5da", "#e8ddd6", "#e4e0d5", "#efe7dd"];

export const metadata = { title: "Categories" };

export default async function CategoriesPage() {
  const categories = await getStorefrontCategories();
  return (
    <>
      <PageIntro title="Categories" description="Every collection begins with a fabric and a feeling. Browse by category to find the pieces made for your kind of evening." />
      <div className="mx-auto max-w-[1320px] px-5 py-16 md:px-10 md:py-24">
        {categories.length ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category, index) => (
              <Link key={category.id} href={`/shop?category=${category.slug}`} className="group relative block aspect-[4/5] overflow-hidden" style={{ backgroundColor: tones[index % tones.length] }}>
                {category.imageUrl ? (
                  <Image src={category.imageUrl} alt={category.name} fill className="object-cover transition duration-700 ease-out group-hover:scale-105" sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="display text-6xl text-ink/15">{category.name}</span>
                  </div>
                )}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 to-transparent p-8 pt-20">
                  <h2 className="display text-4xl text-white">{category.name}</h2>
                  {category.description && <p className="mt-2 max-w-xs text-sm leading-6 text-white/75">{category.description}</p>}
                  <span className="mt-4 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.2em] text-white/85 transition group-hover:gap-3.5 group-hover:text-gold">
                    Shop Now <ArrowUpRight size={13} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="border border-dashed border-ink/20 px-8 py-20 text-center">
            <p className="display text-4xl">Categories are on their way.</p>
            <p className="mx-auto mt-4 max-w-sm text-sm leading-7 text-ink/55">Our team is preparing the collection. In the meantime, explore everything in the shop.</p>
            <Link href="/shop" className="btn-primary mt-8">Browse the shop</Link>
          </div>
        )}
      </div>
    </>
  );
}
