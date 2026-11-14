import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://sharkinightwear.com";
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/account", "/api/", "/checkout", "/order-success"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
