"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import type { CartLine } from "@/lib/cart";

export type WishlistItem = { slug: string; name: string; category: string; price: number; compareAt?: number; image: string };

type CartContextValue = {
  items: CartLine[];
  count: number;
  subtotal: number;
  busy: boolean;
  add: (input: { slug: string; variantId?: string | null; quantity?: number }) => Promise<boolean>;
  update: (itemId: string, quantity: number) => Promise<void>;
  remove: (itemId: string) => Promise<void>;
  refresh: () => Promise<boolean>;
};

type WishlistContextValue = {
  items: WishlistItem[];
  has: (slug: string) => boolean;
  toggle: (item: WishlistItem) => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const WishlistContext = createContext<WishlistContextValue | null>(null);

/* Wishlist lives in localStorage and is exposed as an external store so
   server and client renders stay consistent without effects. */
const WISHLIST_KEY = "sharki_wishlist_v1";
const emptyWishlist: WishlistItem[] = [];
let wishlistItems: WishlistItem[] = emptyWishlist;
const wishlistListeners = new Set<() => void>();
let wishlistLoaded = false;

function loadWishlist() {
  if (wishlistLoaded || typeof window === "undefined") return;
  wishlistLoaded = true;
  try {
    const stored = window.localStorage.getItem(WISHLIST_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) wishlistItems = parsed.filter((item): item is WishlistItem => Boolean(item && typeof item.slug === "string"));
    }
  } catch {
    /* ignore malformed storage */
  }
}

function persistWishlist(items: WishlistItem[]) {
  wishlistItems = items;
  try {
    window.localStorage.setItem(WISHLIST_KEY, JSON.stringify(items));
  } catch {
    /* storage unavailable */
  }
  wishlistListeners.forEach((listener) => listener());
}

const wishlistStore = {
  subscribe(listener: () => void) {
    loadWishlist();
    wishlistListeners.add(listener);
    return () => wishlistListeners.delete(listener);
  },
  getSnapshot() {
    loadWishlist();
    return wishlistItems;
  },
  getServerSnapshot() {
    return emptyWishlist;
  },
};

export function StorefrontProviders({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartLine[]>([]);
  const [cartCount, setCartCount] = useState(0);
  const [cartSubtotal, setCartSubtotal] = useState(0);
  const [busy, setBusy] = useState(false);
  const wishlistItemsSnapshot = useSyncExternalStore(wishlistStore.subscribe, wishlistStore.getSnapshot, wishlistStore.getServerSnapshot);

  const applyCart = useCallback((data: { items?: CartLine[]; count?: number; subtotal?: number }) => {
    setCartItems(data.items ?? []);
    setCartCount(data.count ?? 0);
    setCartSubtotal(data.subtotal ?? 0);
  }, []);

  const requestCart = useCallback(async (init?: RequestInit) => {
    setBusy(true);
    try {
      const response = await fetch("/api/cart", { cache: "no-store", ...init });
      if (!response.ok) return false;
      applyCart(await response.json());
      return true;
    } catch {
      return false;
    } finally {
      setBusy(false);
    }
  }, [applyCart]);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/cart", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (!cancelled && data) applyCart(data);
      })
      .catch(() => {
        /* network hiccup: keep current state */
      });
    return () => {
      cancelled = true;
    };
  }, [applyCart]);

  const wishlistValue = useMemo<WishlistContextValue>(() => ({
    items: wishlistItemsSnapshot,
    has: (slug) => wishlistItemsSnapshot.some((item) => item.slug === slug),
    toggle: (item) => persistWishlist(wishlistItemsSnapshot.some((entry) => entry.slug === item.slug) ? wishlistItemsSnapshot.filter((entry) => entry.slug !== item.slug) : [...wishlistItemsSnapshot, item]),
  }), [wishlistItemsSnapshot]);

  const cartValue = useMemo<CartContextValue>(() => ({
    items: cartItems,
    count: cartCount,
    subtotal: cartSubtotal,
    busy,
    add: ({ slug, variantId, quantity }) => requestCart({ method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ slug, variantId: variantId ?? null, quantity }) }),
    update: async (itemId, quantity) => {
      await requestCart({ method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ itemId, quantity }) });
    },
    remove: async (itemId) => {
      await requestCart({ method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ itemId }) });
    },
    refresh: () => requestCart(),
  }), [cartItems, cartCount, cartSubtotal, busy, requestCart]);

  return (
    <WishlistContext.Provider value={wishlistValue}>
      <CartContext.Provider value={cartValue}>{children}</CartContext.Provider>
    </WishlistContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within StorefrontProviders");
  return context;
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) throw new Error("useWishlist must be used within StorefrontProviders");
  return context;
}
