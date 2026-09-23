import { db } from "@/lib/db";
import type { Product, StorefrontReview } from "@/lib/catalog";

function toProduct(product: { slug: string; name: string; description: string; price: number; salePrice: number | null; fabric: string | null; category: { name: string }; images: { url: string }[]; variants: { id: string; size: string | null; color: string | null; stock: number }[]; reviews?: { rating: number; title: string | null; body: string; user: { name: string | null } }[] }): Product {
  const images = product.images.map((image) => image.url).filter(Boolean);
  return { slug: product.slug, name: product.name, category: product.category.name, price: product.salePrice ?? product.price, compareAt: product.salePrice && product.salePrice < product.price ? product.price : undefined, image: images[0] ?? "", images, tone: "#ece5da", sizes: [...new Set(product.variants.map((variant) => variant.size).filter((size): size is string => Boolean(size)))], colors: [...new Set(product.variants.map((variant) => variant.color).filter((color): color is string => Boolean(color)))], description: product.description, fabric: product.fabric ?? "Cotton", stock: product.variants.reduce((total, variant) => total + variant.stock, 0), variants: product.variants.map((variant) => ({ id: variant.id, size: variant.size, color: variant.color, stock: variant.stock })), reviews: product.reviews };
}

export async function getStorefrontProducts(category?: string, collectionSlug?: string) {
  try {
    const records = await db.product.findMany({ where: { status: "ACTIVE", ...(category ? { category: { slug: category } } : {}), ...(collectionSlug ? { collections: { some: { collection: { slug: collectionSlug, active: true } } } } : {}) }, include: { category: true, images: { orderBy: { sortOrder: "asc" } }, variants: { where: { active: true } } }, orderBy: { createdAt: "desc" } });
    return records.map(toProduct);
  } catch (error) {
    console.error("Database error in getStorefrontProducts:", error);
    return [];
  }
}

export async function getStorefrontProduct(slug: string) {
  try {
    const record = await db.product.findFirst({ where: { slug, status: "ACTIVE" }, include: { category: true, images: { orderBy: { sortOrder: "asc" } }, variants: { where: { active: true } }, reviews: { where: { approved: true }, include: { user: { select: { name: true } } }, orderBy: { createdAt: "desc" } } } });
    return record ? toProduct(record) : undefined;
  } catch (error) {
    console.error("Database error in getStorefrontProduct:", error);
    return undefined;
  }
}

export async function getStorefrontCategories() {
  try {
    return await db.category.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } });
  } catch (error) {
    console.error("Database error in getStorefrontCategories:", error);
    return [];
  }
}

export async function getStorefrontCollections() {
  try {
    return await db.collection.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } });
  } catch (error) {
    console.error("Database error in getStorefrontCollections:", error);
    return [];
  }
}

export async function getStorefrontPromotions() {
  try {
    const record = await db.siteContent.findUnique({ where: { key: "promotions" } });
    const data = record?.data as { promotions?: unknown } | null;
    return data && Array.isArray(data.promotions)
      ? data.promotions.filter((promotion): promotion is Record<string, unknown> => Boolean(promotion) && typeof promotion === "object" && (promotion as Record<string, unknown>).enabled !== false && (promotion as Record<string, unknown>).active !== false)
      : [];
  } catch (error) {
    console.error("Database error in getStorefrontPromotions:", error);
    return [];
  }
}

export async function getStorefrontReviews(limit = 8) {
  try {
    const records = await db.review.findMany({
      where: { approved: true },
      include: { user: { select: { name: true } }, product: { select: { name: true, slug: true } } },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
    const reviews: StorefrontReview[] = records.map((review) => ({ id: review.id, rating: review.rating, title: review.title, body: review.body, createdAt: review.createdAt.toISOString(), userName: review.user.name, productName: review.product.name, productSlug: review.product.slug }));
    return reviews;
  } catch (error) {
    console.error("Database error in getStorefrontReviews:", error);
    return [];
  }
}
