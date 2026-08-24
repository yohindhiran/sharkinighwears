import { getStorefrontProducts } from "@/lib/storefront-data";
import { SearchResults } from "@/components/storefront/search-results";

export default async function SearchPage() {
  const products = await getStorefrontProducts();
  return <SearchResults products={products} />;
}
