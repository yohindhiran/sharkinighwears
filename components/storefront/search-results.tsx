"use client";

import { useState } from "react";
import type { Product } from "@/lib/catalog";
import { ProductCard } from "@/components/storefront/product-card";

export function SearchResults({ products }: { products: Product[] }) {
  const [query, setQuery] = useState("");
  const matches = products.filter((product) => `${product.name} ${product.category}`.toLowerCase().includes(query.toLowerCase()));
  return (
    <div className="mx-auto max-w-[1320px] px-5 py-16 md:px-10 md:py-24">
      <p className="eyebrow text-gold">Find your comfort</p>
      <h1 className="display mt-4 text-6xl leading-none md:text-7xl">Search</h1>
      <input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search nightwear" aria-label="Search products" className="mt-12 w-full border-b border-ink/20 bg-transparent py-4 text-lg outline-none transition placeholder:text-ink/35 focus:border-gold" />
      <p className="mt-8 text-xs uppercase tracking-[.16em] text-ink/50">{matches.length} {matches.length === 1 ? "piece" : "pieces"}</p>
      {matches.length ? (
        <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-12 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
          {matches.map((product) => <ProductCard key={product.slug} product={product} />)}
        </div>
      ) : (
        <p className="mt-12 border border-dashed border-ink/20 px-8 py-16 text-center text-sm leading-7 text-ink/55">No pieces match “{query}”. Try a different word, or browse the full shop.</p>
      )}
    </div>
  );
}
