import type { MetadataRoute } from "next";
import { getStorefrontProducts } from "@/lib/storefront-data";

export const dynamic = "force-dynamic";
export const revalidate = 3600; // Revalidate every hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  
  try {
    const products = await getStorefrontProducts();
    return [
      {
        url: base,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 1,
      },
      ...products.map((product) => ({
        url: `${base}/products/${product.slug}`,
        lastModified: new Date(),
        changeFrequency: "monthly" as const,
        priority: 0.8,
      })),
    ];
  } catch (error) {
    // If database is not available, return minimal sitemap
    console.warn("Failed to generate full sitemap:", error);
    return [
      {
        url: base,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 1,
      },
    ];
  }
}
