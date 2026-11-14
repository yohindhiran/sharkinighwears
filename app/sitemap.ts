import type { MetadataRoute } from "next";
import { getStorefrontProducts, getStorefrontCategories, getStorefrontCollections } from "@/lib/storefront-data";

export const dynamic = "force-dynamic";
export const revalidate = 3600; // Revalidate every hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://sharkinightwear.com";

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}`, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
    { url: `${base}/shop`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/categories`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/collections`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/our-making`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/wholesale`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/faq`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/shipping-policy`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.4 },
    { url: `${base}/return-policy`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.4 },
    { url: `${base}/privacy-policy`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.4 },
    { url: `${base}/terms`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.4 },
  ];

  try {
    const [products, categories, collections] = await Promise.all([
      getStorefrontProducts().catch(() => []),
      getStorefrontCategories().catch(() => []),
      getStorefrontCollections().catch(() => []),
    ]);

    const productRoutes: MetadataRoute.Sitemap = products.map((product) => ({
      url: `${base}/product/${product.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    }));

    const categoryRoutes: MetadataRoute.Sitemap = categories.map((cat) => ({
      url: `${base}/shop?category=${cat.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    }));

    const collectionRoutes: MetadataRoute.Sitemap = collections.map((col) => ({
      url: `${base}/shop?collection=${col.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    }));

    return [...staticRoutes, ...productRoutes, ...categoryRoutes, ...collectionRoutes];
  } catch (error) {
    console.warn("Failed to generate dynamic routes for sitemap:", error);
    return staticRoutes;
  }
}
