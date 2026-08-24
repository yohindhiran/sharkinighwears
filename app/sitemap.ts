import type { MetadataRoute } from "next";
import { getStorefrontProducts } from "@/lib/storefront-data";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> { const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"; const products = await getStorefrontProducts(); return ["", "/shop", "/collections", "/manufacturing", "/wholesale", "/contact", ...products.map((product) => `/product/${product.slug}`)].map((path) => ({ url: `${base}${path}`, lastModified: new Date() })); }
