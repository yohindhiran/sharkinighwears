"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart, Menu, Search, ShoppingBag, UserRound, X } from "lucide-react";
import { useState } from "react";
import { useCart, useWishlist } from "@/components/storefront/providers";

export type HeaderConfig = { brandName?: string; brandSubtitle?: string; announcementText?: string; announcementVisible?: boolean; searchVisible?: boolean; profileVisible?: boolean; cartVisible?: boolean; navigation?: { label: string; href: string; enabled: boolean }[] };

const defaultNavigation = [
  { label: "Home", href: "/", enabled: true },
  { label: "Shop", href: "/shop", enabled: true },
  { label: "Categories", href: "/categories", enabled: true },
  { label: "About Us", href: "/our-making", enabled: true },
  { label: "Wholesale", href: "/wholesale", enabled: true },
  { label: "Contact", href: "/contact", enabled: true },
];

export function Header({ config = {} }: { config?: HeaderConfig }) {
  const [open, setOpen] = useState(false);
  const cart = useCart();
  const wishlist = useWishlist();

  const navigation = (config.navigation?.length ? config.navigation : defaultNavigation).filter((item) => item.enabled);
  const showAnnouncement = config.announcementVisible !== false;
  const announcement = config.announcementText || "Free Shipping on Orders Over ₹1000";

  return (
    <header className="sticky top-0 z-40 border-b border-ink/10 bg-cream/95 backdrop-blur">
      {/* Announcement banner removed as requested */}
      <div className="mx-auto flex h-[72px] max-w-[1320px] items-center justify-between gap-6 px-5 md:h-[84px] md:px-10">
        <button className="flex h-10 w-10 items-center justify-start lg:hidden" onClick={() => setOpen(!open)} aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open}>
          {open ? <X size={21} strokeWidth={1.5} /> : <Menu size={21} strokeWidth={1.5} />}
        </button>
        <Link href="/" aria-label="SHARKI NIGHTWEARS home" className="shrink-0 leading-none">
          <Image src="/logo.png" alt={config.brandName ?? "SHARKI NIGHTWEARS"} width={180} height={70} className="h-10 w-auto object-contain md:h-12" priority />
        </Link>
        <nav className="hidden items-center gap-8 lg:flex" aria-label="Primary">
          {navigation.map((item) => (
            <Link key={item.href} href={item.href} className="nav-link">{item.label}</Link>
          ))}
        </nav>
        <div className="flex items-center gap-1 sm:gap-2">
          {config.searchVisible !== false && (
            <Link href="/search" aria-label="Search" className="flex h-10 w-10 items-center justify-center transition hover:text-gold"><Search size={19} strokeWidth={1.5} /></Link>
          )}
          {config.profileVisible !== false && (
            <Link href="/account" aria-label="Account" className="hidden h-10 w-10 items-center justify-center transition hover:text-gold sm:flex"><UserRound size={19} strokeWidth={1.5} /></Link>
          )}
          <Link href="/wishlist" aria-label="Wishlist" className="relative flex h-10 w-10 items-center justify-center transition hover:text-gold">
            <Heart size={19} strokeWidth={1.5} />
            {wishlist.items.length > 0 && <Badge value={wishlist.items.length} />}
          </Link>
          {config.cartVisible !== false && (
            <Link href="/cart" aria-label="Shopping bag" className="relative flex h-10 w-10 items-center justify-center transition hover:text-gold">
              <ShoppingBag size={19} strokeWidth={1.5} />
              {cart.count > 0 && <Badge value={cart.count} />}
            </Link>
          )}
        </div>
      </div>
      {open && (
        <nav className="border-t border-ink/10 bg-cream px-6 py-8 lg:hidden" aria-label="Mobile">
          <div className="flex flex-col gap-6">
            {navigation.map((item) => (
              <Link key={item.href} href={item.href} onClick={() => setOpen(false)} className="text-xs font-bold uppercase tracking-[.2em]">{item.label}</Link>
            ))}
            <div className="flex gap-6 border-t border-ink/10 pt-6 text-xs font-bold uppercase tracking-[.2em] text-ink/60">
              {config.searchVisible !== false && <Link href="/search" onClick={() => setOpen(false)}>Search</Link>}
              {config.profileVisible !== false && <Link href="/account" onClick={() => setOpen(false)}>Account</Link>}
              <Link href="/wishlist" onClick={() => setOpen(false)}>Wishlist</Link>
              {config.cartVisible !== false && <Link href="/cart" onClick={() => setOpen(false)}>Bag</Link>}
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}

function Badge({ value }: { value: number }) {
  return <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold px-1 text-[9px] font-bold leading-none text-white">{value > 9 ? "9+" : value}</span>;
}
