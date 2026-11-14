import { db } from "@/lib/db";
import type { Product, StorefrontReview } from "@/lib/catalog";

function toProduct(product: {
  id?: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  salePrice: number | null;
  fabric: string | null;
  category: { name: string };
  images: { url: string }[];
  variants: { id: string; size: string | null; color: string | null; stock: number }[];
  reviews?: { rating: number; title: string | null; body: string; user: { name: string | null } }[];
}): Product & { id?: string } {
  const images = product.images.map((image) => image.url).filter(Boolean);
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    category: product.category.name,
    price: product.salePrice ?? product.price,
    compareAt: product.salePrice && product.salePrice < product.price ? product.price : undefined,
    image: images[0] ?? "",
    images,
    tone: "#ece5da",
    sizes: [
      ...new Set(
        product.variants
          .map((variant) => variant.size)
          .filter((size): size is string => Boolean(size))
      ),
    ],
    colors: [
      ...new Set(
        product.variants
          .map((variant) => variant.color)
          .filter((color): color is string => Boolean(color))
      ),
    ],
    description: product.description,
    fabric: product.fabric ?? "Cotton",
    stock: product.variants.reduce((total, variant) => total + variant.stock, 0),
    variants: product.variants.map((variant) => ({
      id: variant.id,
      size: variant.size,
      color: variant.color,
      stock: variant.stock,
    })),
    reviews: product.reviews,
  };
}

// In-memory cache structures with Stale-While-Revalidate support
const CACHE_TTL_MS = 60 * 1000; // 60 seconds

type CacheEntry<T> = {
  data: T;
  expiresAt: number;
};

const productsCache = new Map<string, CacheEntry<Product[]>>();
const productDetailCache = new Map<string, CacheEntry<Product | undefined>>();
let categoriesCache: CacheEntry<Awaited<ReturnType<typeof db.category.findMany>>> | null = null;
let collectionsCache: CacheEntry<Awaited<ReturnType<typeof db.collection.findMany>>> | null = null;
let reviewsCache: CacheEntry<StorefrontReview[]> | null = null;

export function clearStorefrontCache() {
  productsCache.clear();
  productDetailCache.clear();
  categoriesCache = null;
  collectionsCache = null;
  reviewsCache = null;
}

export async function getStorefrontProducts(
  category?: string,
  collectionSlug?: string,
  options?: { limit?: number; skip?: number }
) {
  const cacheKey = `${category || "all"}_${collectionSlug || "all"}_${options?.limit || 0}_${options?.skip || 0}`;
  const cached = productsCache.get(cacheKey);

  if (cached && cached.expiresAt > Date.now()) {
    return cached.data;
  }

  try {
    const records = await db.product.findMany({
      where: {
        status: "ACTIVE",
        ...(category ? { category: { slug: category } } : {}),
        ...(collectionSlug
          ? { collections: { some: { collection: { slug: collectionSlug, active: true } } } }
          : {}),
      },
      select: {
        id: true,
        slug: true,
        name: true,
        description: true,
        price: true,
        salePrice: true,
        fabric: true,
        category: { select: { name: true } },
        images: { select: { url: true }, orderBy: { sortOrder: "asc" } },
        variants: {
          where: { active: true },
          select: { id: true, size: true, color: true, stock: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: options?.limit,
      skip: options?.skip,
    });

    const products = records.map(toProduct);

    if (products.length > 0 || !cached) {
      productsCache.set(cacheKey, {
        data: products,
        expiresAt: Date.now() + CACHE_TTL_MS,
      });
      return products;
    }

    // Return cached data if new query returned empty unexpectedly
    return cached.data;
  } catch (error) {
    console.error("Database error in getStorefrontProducts:", error);
    // SWR fallback: if network error, return stale cache if available
    if (cached) return cached.data;
    return [];
  }
}

export async function getStorefrontProduct(slug: string) {
  const cached = productDetailCache.get(slug);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.data;
  }

  try {
    const record = await db.product.findFirst({
      where: { slug, status: "ACTIVE" },
      include: {
        category: true,
        images: { orderBy: { sortOrder: "asc" } },
        variants: { where: { active: true } },
        reviews: {
          where: { approved: true },
          include: { user: { select: { name: true } } },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    const product = record ? toProduct(record) : undefined;
    productDetailCache.set(slug, {
      data: product,
      expiresAt: Date.now() + CACHE_TTL_MS,
    });
    return product;
  } catch (error) {
    console.error("Database error in getStorefrontProduct:", error);
    if (cached) return cached.data;
    return undefined;
  }
}

export async function getStorefrontCategories() {
  if (categoriesCache && categoriesCache.expiresAt > Date.now()) {
    return categoriesCache.data;
  }

  try {
    const data = await db.category.findMany({
      where: { active: true },
      orderBy: { sortOrder: "asc" },
    });
    categoriesCache = { data, expiresAt: Date.now() + CACHE_TTL_MS };
    return data;
  } catch (error) {
    console.error("Database error in getStorefrontCategories:", error);
    if (categoriesCache) return categoriesCache.data;
    return [];
  }
}

export async function getStorefrontCollections() {
  if (collectionsCache && collectionsCache.expiresAt > Date.now()) {
    return collectionsCache.data;
  }

  try {
    const data = await db.collection.findMany({
      where: { active: true },
      orderBy: { sortOrder: "asc" },
    });
    collectionsCache = { data, expiresAt: Date.now() + CACHE_TTL_MS };
    return data;
  } catch (error) {
    console.error("Database error in getStorefrontCollections:", error);
    if (collectionsCache) return collectionsCache.data;
    return [];
  }
}

export async function getStorefrontPromotions() {
  try {
    const record = await db.siteContent.findUnique({ where: { key: "promotions" } });
    const data = record?.data as { promotions?: unknown } | null;
    return data && Array.isArray(data.promotions)
      ? data.promotions.filter(
          (promotion): promotion is Record<string, unknown> =>
            Boolean(promotion) &&
            typeof promotion === "object" &&
            (promotion as Record<string, unknown>).enabled !== false &&
            (promotion as Record<string, unknown>).active !== false
        )
      : [];
  } catch (error) {
    console.error("Database error in getStorefrontPromotions:", error);
    return [];
  }
}

export async function getStorefrontReviews(limit = 8) {
  if (reviewsCache && reviewsCache.expiresAt > Date.now()) {
    return reviewsCache.data;
  }

  try {
    const records = await db.review.findMany({
      where: { approved: true },
      include: {
        user: { select: { name: true } },
        product: { select: { name: true, slug: true } },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
    const reviews: StorefrontReview[] = records.map((review) => ({
      id: review.id,
      rating: review.rating,
      title: review.title,
      body: review.body,
      createdAt: review.createdAt.toISOString(),
      userName: review.user.name,
      productName: review.product.name,
      productSlug: review.product.slug,
    }));

    reviewsCache = { data: reviews, expiresAt: Date.now() + CACHE_TTL_MS };
    return reviews;
  } catch (error) {
    console.error("Database error in getStorefrontReviews:", error);
    if (reviewsCache) return reviewsCache.data;
    return [];
  }
}
