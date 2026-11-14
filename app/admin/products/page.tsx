import { requireAdmin } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import {
  ProductsClient,
  type AdminProduct,
  type AdminCategory,
} from "@/components/admin/products-client";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminProductsPage() {
  await requireAdmin();

  let products: AdminProduct[] = [];
  let categories: AdminCategory[] = [];

  try {
    const [productsData, categoriesData] = await Promise.all([
      db.product.findMany({
        select: {
          id: true,
          name: true,
          slug: true,
          sku: true,
          description: true,
          price: true,
          salePrice: true,
          status: true,
          featured: true,
          category: { select: { id: true, name: true } },
          variants: { select: { id: true, stock: true } },
          images: { select: { url: true }, take: 1, orderBy: { sortOrder: "asc" } },
        },
        orderBy: { updatedAt: "desc" },
      }),
      db.category.findMany({
        select: { id: true, name: true },
        orderBy: { sortOrder: "asc" },
      }),
    ]);
    products = productsData;
    categories = categoriesData;
  } catch (error) {
    console.error("Error loading admin products:", error);
  }

  return <ProductsClient initialProducts={products} categories={categories} />;
}
