import { db } from "@/lib/db";

export const defaultHomepageContent = {
  heroImages: [
    "https://images.unsplash.com/photo-1618932260643-eee4a2f652a6?auto=format&fit=crop&w=1800&q=85",
    "https://images.unsplash.com/photo-1571513722275-4b41940f54b8?auto=format&fit=crop&w=1800&q=85",
    "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1800&q=85",
  ],
  heroInterval: 6000,
};

export type HomepageContent = typeof defaultHomepageContent & {
  heading?: string;
  description?: string;
  buttonText?: string;
  buttonLink?: string;
  active?: boolean;
};

// High-speed in-memory cache to eliminate repetitive round-trips on every page hit
const memoryCache = new Map<string, { data: unknown; expiresAt: number }>();
const CACHE_TTL_MS = 60 * 1000; // 60 seconds

export function clearSiteContentCache() {
  memoryCache.clear();
}

export async function getSiteContent<T extends object>(key: string, fallback: T): Promise<T> {
  const cached = memoryCache.get(key);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.data as T;
  }

  try {
    const record = await db.siteContent.findUnique({ where: { key } });
    const result =
      record?.data && typeof record.data === "object"
        ? { ...fallback, ...(record.data as T) }
        : fallback;

    memoryCache.set(key, { data: result, expiresAt: Date.now() + CACHE_TTL_MS });
    return result;
  } catch {
    return fallback;
  }
}
