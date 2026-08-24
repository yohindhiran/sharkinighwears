export type Product = {
  slug: string;
  name: string;
  category: string;
  price: number;
  compareAt?: number;
  image: string;
  images: string[];
  tone: string;
  sizes: string[];
  colors: string[];
  description: string;
  fabric: string;
  stock: number;
  variants: { id: string; size: string | null; color: string | null; stock: number }[];
  reviews?: { rating: number; title: string | null; body: string; user: { name: string | null } }[];
};

export type StorefrontReview = {
  id: string;
  rating: number;
  title: string | null;
  body: string;
  createdAt: string;
  userName: string | null;
  productName: string;
  productSlug: string;
};

export function formatPrice(value: number) { return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value); }

export function discountPercent(price: number, compareAt?: number) {
  if (!compareAt || compareAt <= price) return undefined;
  return Math.round(((compareAt - price) / compareAt) * 100);
}
