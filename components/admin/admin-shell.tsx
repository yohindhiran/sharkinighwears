"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bell, CreditCard, Image, LayoutDashboard, LogOut, Menu, Package, Palette, Plug, Search, Settings, ShoppingCart, Star, Tag, Users, Warehouse, X } from "lucide-react";
import { useState } from "react";

const navigation = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Orders", href: "/admin/orders", icon: ShoppingCart },
  { label: "Payments", href: "/admin/payments", icon: CreditCard },
  { label: "Customers", href: "/admin/customers", icon: Users },
  { label: "Products", href: "/admin/products", icon: Package },
  { label: "Categories", href: "/admin/categories", icon: Tag },
  { label: "Inventory", href: "/admin/inventory", icon: Warehouse },
  { label: "Promotions", href: "/admin/promotions", icon: Tag },
  { label: "Hero", href: "/admin/hero", icon: Image },
  { label: "Reviews", href: "/admin/reviews", icon: Star },
  { label: "Appearance", href: "/admin/appearance", icon: Palette },
  { label: "Integrations", href: "/admin/integrations", icon: Plug },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

const titles = Object.fromEntries(navigation.map(({ label, href }) => [href, label]));

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  if (pathname === "/admin/login") return children;
  const title = titles[pathname] ?? navigation.find(({ href }) => pathname.startsWith(`${href}/`))?.label ?? "Dashboard";

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  const sidebar = <aside className="flex w-full flex-col bg-[#17212b] text-white md:min-h-screen md:w-[260px] md:shrink-0"><div className="flex h-[76px] items-center justify-between border-b border-white/10 px-6"><Link href="/admin/dashboard" className="leading-tight"><span className="block text-sm font-bold tracking-[.18em]">SHARKI</span><span className="block text-[9px] font-medium tracking-[.3em] text-[#a9c6b1]">NIGHTWEARS</span><span className="mt-1 block text-[10px] text-white/45">Admin Panel</span></Link><button className="md:hidden" onClick={() => setMobileOpen(false)} aria-label="Close admin menu"><X size={18} /></button></div><nav className="flex-1 space-y-1 px-3 py-6">{navigation.map(({ label, href, icon: Icon }) => <Link key={href} href={href} onClick={() => setMobileOpen(false)} className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition ${pathname === href || pathname.startsWith(`${href}/`) ? "bg-white/10 text-white" : "text-white/60 hover:bg-white/5 hover:text-white"}`}><Icon size={17} strokeWidth={1.7} />{label}</Link>)}</nav><button onClick={logout} className="flex items-center gap-3 border-t border-white/10 px-6 py-5 text-sm text-white/55 hover:text-white"><LogOut size={17} />Logout</button></aside>;

  return <div className="min-h-screen bg-[#f5f7f9] text-[#24313d] md:flex">{mobileOpen && <div className="fixed inset-0 z-40 bg-[#17212b] md:hidden">{sidebar}</div>}<div className="hidden md:flex">{sidebar}</div><div className="min-w-0 flex-1"><header className="flex h-[76px] items-center justify-between border-b border-[#e2e7eb] bg-white px-5 md:px-8"><div className="flex items-center gap-3"><button className="md:hidden" onClick={() => setMobileOpen(true)} aria-label="Open admin menu"><Menu size={21} /></button><div><p className="text-lg font-semibold capitalize">{title}</p><p className="hidden text-xs text-[#8793a0] sm:block">SHARKI NIGHTWEARS control center</p></div></div><div className="flex items-center gap-4"><label className="hidden items-center gap-2 rounded-md border border-[#e2e7eb] px-3 py-2 text-sm text-[#8793a0] lg:flex"><Search size={16} /><input placeholder="Search admin" className="w-44 bg-transparent outline-none placeholder:text-[#aab4bd]" aria-label="Search admin" /></label><button aria-label="Notifications" className="text-[#71808c]"><Bell size={19} /></button><div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#dcebe0] text-xs font-semibold text-[#42624d]">A</div><button onClick={logout} className="hidden text-sm text-[#71808c] hover:text-[#24313d] sm:block">Logout</button></div></header><main className="p-5 md:p-8">{children}</main></div></div>;
}
