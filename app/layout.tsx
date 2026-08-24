import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";
import { Header } from "@/components/storefront/header";
import { Footer } from "@/components/storefront/footer";
import { StorefrontProviders } from "@/components/storefront/providers";
import { getSiteContent } from "@/lib/site-content";
import type { HeaderConfig } from "@/components/storefront/header";
import type { FooterConfig } from "@/components/storefront/footer";

export const metadata: Metadata = {
  title: { default: "SHARKI NIGHTWEARS", template: "%s | SHARKI NIGHTWEARS" },
  description: "Thoughtfully made women's nightwear from our own manufacturing house.",
  openGraph: { title: "SHARKI NIGHTWEARS", description: "Thoughtfully made nightwear from our own manufacturing house.", type: "website" },
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const isAdminRoute = (await headers()).get("x-sharki-admin-route") === "1";
  const [headerContent, footerContent, settings] = isAdminRoute ? [{}, {}, {}] : await Promise.all([getSiteContent<HeaderConfig>("header", {}), getSiteContent<FooterConfig>("footer", {}), getSiteContent<{ storeName?: string; email?: string; phone?: string; address?: string }>("settings", {})]);
  const headerConfig = { ...headerContent, ...(settings.storeName ? { brandName: settings.storeName } : {}) };
  const footerConfig: FooterConfig = {
    ...footerContent,
    ...(settings.storeName ? { brandName: settings.storeName } : {}),
    ...(settings.email ? { email: settings.email } : {}),
    ...(settings.phone ? { phone: settings.phone } : {}),
    ...(settings.address ? { address: settings.address } : {}),
  };
  return <html lang="en"><body>{/* Admin routes have their own private shell and must not inherit storefront chrome. */}{isAdminRoute ? <main>{children}</main> : <StorefrontProviders><Header config={headerConfig} /><main>{children}</main><Footer config={footerConfig} /></StorefrontProviders>}</body></html>;
}
