import { Suspense } from "react";
import { getStorefrontProducts } from "@/lib/storefront-data";
import { SearchResults } from "@/components/storefront/search-results";

export const metadata = {
  title: "Search Nightwears",
  description: "Find the perfect nightwear piece from SHARKI collections.",
};

export default async function SearchPage() {
  const products = await getStorefrontProducts();
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-[1320px] px-5 py-24 text-center">
          <p className="eyebrow text-gold">Loading search...</p>
        </div>
      }
    >
      <SearchResults products={products} />
    </Suspense>
  );
}
