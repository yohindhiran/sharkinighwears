import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";

const editors = [
  ["Header", "/admin/header", "Branding, announcement bar, navigation and visibility controls."],
  ["Footer", "/admin/footer", "Footer copy, newsletter messaging and copyright."],
  ["Homepage content", "/admin/homepage", "Existing hero image URLs and slider timing."],
  ["Our Making", "/admin/our-making", "Manufacturing page content used by the storefront."],
  ["Media library", "/admin/media", "Existing external media assets used by the store."],
];

export default async function AppearancePage() {
  await requireAdmin();
  return <div><p className="text-xs font-semibold uppercase tracking-[.14em] text-[#71808c]">Storefront</p><h1 className="mt-2 text-3xl font-semibold">Appearance</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-[#71808c]">Manage the existing shared storefront content without creating a second content system.</p><div className="mt-8 grid gap-4 md:grid-cols-2">{editors.map(([label, href, description]) => <Link key={href} href={href} className="rounded-lg border border-[#e2e7eb] bg-white p-6 transition hover:border-[#a9c6b1]"><h2 className="font-semibold">{label}</h2><p className="mt-2 text-sm leading-6 text-[#71808c]">{description}</p><span className="mt-5 inline-block text-xs font-semibold uppercase tracking-[.14em] text-[#42624d]">Open editor</span></Link>)}</div></div>;
}
