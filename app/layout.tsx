import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";
import { Header } from "@/components/storefront/header";
import { Footer } from "@/components/storefront/footer";
import { StorefrontProviders } from "@/components/storefront/providers";
import { getSiteContent } from "@/lib/site-content";
import type { HeaderConfig } from "@/components/storefront/header";
import type { FooterConfig } from "@/components/storefront/footer";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://sharkinightwear.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "SHARKI NIGHTWEARS | Pure Comfort Nightwear",
    template: "%s | SHARKI NIGHTWEARS",
  },
  description:
    "Thoughtfully made women's nightwear from our own manufacturing house. Premium cotton nighties, night suits, and loungewear crafted for unhurried comfort.",
  keywords: [
    "nightwear",
    "women nightwear",
    "cotton nighties",
    "night suits",
    "loungewear",
    "SHARKI",
    "comfortable sleepwear",
    "Indian nightwear brand",
  ],
  authors: [{ name: "SHARKI NIGHTWEARS" }],
  creator: "SHARKI NIGHTWEARS",
  openGraph: {
    title: "SHARKI NIGHTWEARS | Pure Comfort Nightwear",
    description: "Thoughtfully made women's nightwear from our own manufacturing house.",
    url: siteUrl,
    siteName: "SHARKI NIGHTWEARS",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SHARKI NIGHTWEARS",
    description: "Thoughtfully made nightwear from our own manufacturing house.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const isAdminRoute = (await headers()).get("x-sharki-admin-route") === "1";
  const [headerContent, footerContent, settings] = isAdminRoute
    ? [{}, {}, {}]
    : await Promise.all([
        getSiteContent<HeaderConfig>("header", {}),
        getSiteContent<FooterConfig>("footer", {}),
        getSiteContent<{ storeName?: string; email?: string; phone?: string; address?: string }>(
          "settings",
          {}
        ),
      ]);

  const headerConfig = {
    ...headerContent,
    ...(settings.storeName ? { brandName: settings.storeName } : {}),
  };
  const footerConfig: FooterConfig = {
    ...footerContent,
    ...(settings.storeName ? { brandName: settings.storeName } : {}),
    ...(settings.email ? { email: settings.email } : {}),
    ...(settings.phone ? { phone: settings.phone } : {}),
    ...(settings.address ? { address: settings.address } : {}),
  };

  const organizationLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "SHARKI NIGHTWEARS",
    url: siteUrl,
    logo: `${siteUrl}/logo.png`,
    description: "Manufacturer and retailer of premium women's nightwear and sleepwear.",
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      email: settings.email || "sharkinightwears@gmail.com",
    },
  };

  const webSiteLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "SHARKI NIGHTWEARS",
    url: siteUrl,
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteUrl}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteLd) }}
        />
      </head>
      <body>
        {isAdminRoute ? (
          <main>{children}</main>
        ) : (
          <StorefrontProviders>
            <Header config={headerConfig} />
            <main>{children}</main>
            <Footer config={footerConfig} />
          </StorefrontProviders>
        )}
      </body>
    </html>
  );
}
