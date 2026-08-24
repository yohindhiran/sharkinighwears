import Link from "next/link";
import { Instagram, Facebook, Youtube } from "lucide-react";

export type FooterConfig = {
  brandName?: string;
  brandSubtitle?: string;
  description?: string;
  copyright?: string;
  newsletterText?: string;
  email?: string;
  phone?: string;
  address?: string;
  socials?: { label: string; href: string }[];
};

const socialIcons: Record<string, typeof Instagram> = { instagram: Instagram, facebook: Facebook, youtube: Youtube };

export function Footer({ config = {} }: { config?: FooterConfig }) {
  const brandName = config.brandName ?? "SHARKI";
  const quickLinks = [
    { label: "Home", href: "/" },
    { label: "Shop", href: "/shop" },
    { label: "Categories", href: "/categories" },
    { label: "Collections", href: "/collections" },
    { label: "About Us", href: "/our-making" },
    { label: "Wholesale", href: "/wholesale" },
  ];
  const serviceLinks = [
    { label: "Contact Us", href: "/contact" },
    { label: "Shipping Policy", href: "/shipping-policy" },
    { label: "Return Policy", href: "/return-policy" },
    { label: "Privacy Policy", href: "/privacy-policy" },
    { label: "Terms & Conditions", href: "/terms" },
    { label: "FAQ", href: "/faq" },
  ];
  const accountLinks = [
    { label: "My Account", href: "/account" },
    { label: "Wishlist", href: "/wishlist" },
    { label: "Shopping Bag", href: "/cart" },
    { label: "Sign in", href: "/login" },
  ];

  return (
    <footer className="border-t border-ink/10 bg-[#f4efe8] px-5 pb-8 pt-16 md:px-10 md:pt-20">
      <div className="mx-auto grid max-w-[1320px] gap-12 sm:grid-cols-2 lg:grid-cols-[1.7fr_1fr_1.2fr_1fr_1.3fr]">
        <div>
          <span className="display text-4xl tracking-[.1em]">{brandName}</span>
          <span className="mt-1 block text-[9px] font-bold uppercase tracking-[.42em] text-gold">{config.brandSubtitle ?? "NIGHTWEARS"}</span>
          <p className="mt-6 max-w-xs text-sm leading-7 text-ink/60">{config.description ?? "Nightwear made with the patience of a manufacturer and the eye of a modern Indian label."}</p>
          {config.socials && config.socials.length > 0 && (
            <div className="mt-7 flex gap-3">
              {config.socials.map((social) => {
                const Icon = socialIcons[social.label.toLowerCase()] ?? Instagram;
                return (
                  <a key={social.href} href={social.href} target="_blank" rel="noreferrer" aria-label={social.label} className="flex h-9 w-9 items-center justify-center rounded-full border border-ink/15 transition hover:border-gold hover:text-gold">
                    <Icon size={15} strokeWidth={1.5} />
                  </a>
                );
              })}
            </div>
          )}
        </div>
        <FooterColumn title="Quick Links" links={quickLinks} />
        <FooterColumn title="Customer Service" links={serviceLinks} />
        <FooterColumn title="Account" links={accountLinks} />
        <div>
          <p className="eyebrow mb-6 text-gold">Contact</p>
          <div className="flex flex-col gap-4 text-sm leading-6 text-ink/70">
            {config.email ? <a href={`mailto:${config.email}`} className="transition hover:text-gold">{config.email}</a> : <Link href="/contact" className="transition hover:text-gold">hello@sharkinightwear.com</Link>}
            {config.phone && <a href={`tel:${config.phone.replace(/\s/g, "")}`} className="transition hover:text-gold">{config.phone}</a>}
            <p>{config.address || "Monday–Saturday, 10am–6pm"}</p>
          </div>
        </div>
      </div>
      <div className="mx-auto mt-16 flex max-w-[1320px] flex-col items-center justify-between gap-3 border-t border-ink/10 pt-7 text-[10px] uppercase tracking-[.18em] text-ink/45 sm:flex-row">
        <span>{config.copyright ?? `© ${new Date().getFullYear()} ${brandName} ${config.brandSubtitle ?? "NIGHTWEARS"}`}</span>
        <span>Made with care in India</span>
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <div>
      <p className="eyebrow mb-6 text-gold">{title}</p>
      <div className="flex flex-col gap-3.5 text-sm text-ink/70">
        {links.map((link) => (
          <Link key={link.href} href={link.href} className="w-fit transition hover:text-gold">{link.label}</Link>
        ))}
      </div>
    </div>
  );
}
