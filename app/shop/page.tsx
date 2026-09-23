import Link from "next/link";
import { getStorefrontProducts, getStorefrontCategories } from "@/lib/storefront-data";
import { ProductCard } from "@/components/storefront/product-card";
import { PageIntro } from "@/components/storefront/page-intro";

export default async function ShopPage({ searchParams }: { searchParams: Promise<{ category?: string; collection?: string }> }) {
  let products: Awaited<ReturnType<typeof getStorefrontProducts>> = [];
  let categories: Awaited<ReturnType<typeof getStorefrontCategories>> = [];

  try {
    const params = await searchParams;
    const { category, collection } = params;
    const [productsData, categoriesData] = await Promise.all([
      getStorefrontProducts(category, collection).catch(() => []),
      getStorefrontCategories().catch(() => []),
    ]);
    products = productsData;
    categories = categoriesData;
  } catch (e) {
    console.warn("Error loading shop page:", e);
  }

  return (
    <>
      <PageIntro title="Shop" description="Explore thoughtfully designed nightwear made for comfort, ease, and the quiet moments that belong entirely to you." />
      <div className="mx-auto max-w-[1320px] px-5 py-14 md:px-10 md:py-20">
        <div className="flex flex-wrap items-center justify-between gap-4 border-y border-ink/10 py-4">
          <p className="text-xs uppercase tracking-[.16em] text-ink/50">{products.length} {products.length === 1 ? "piece" : "pieces"}</p>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-[11px] font-bold uppercase tracking-[.16em]">
            <Link href="/shop" className="text-ink/45 transition hover:text-ink">All</Link>
            {categories.map((item) => (
              <Link 
                key={item.id} 
                href={`/shop?category=${item.slug}`} 
                className="text-ink/45 transition hover:text-ink"
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
        {products.length ? (
          <div className="mt-12 grid grid-cols-2 gap-x-4 gap-y-12 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.slug} product={product} />
            ))}
          </div>
        ) : (
          <div className="mt-16 border border-dashed border-ink/20 px-8 py-20 text-center">
            <p className="display text-4xl">Nothing here yet.</p>
            <p className="mx-auto mt-4 max-w-sm text-sm leading-7 text-ink/55">This selection is empty for now. Try another category or browse everything in the shop.</p>
            <Link href="/shop" className="btn-primary mt-8">View all pieces</Link>
          </div>
        )}
      </div>
    </>
  );
}
