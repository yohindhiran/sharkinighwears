import { requireAdmin } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import {
  CollectionsClient,
  type AdminCollection,
  type SimpleProduct,
} from "@/components/admin/collections-client";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminCollectionsPage() {
  await requireAdmin();

  let collections: AdminCollection[] = [];
  let products: SimpleProduct[] = [];

  try {
    const [collectionsData, productsData] = await Promise.all([
      db.collection.findMany({
        orderBy: { sortOrder: "asc" },
        include: {
          products: {
            select: {
              product: { select: { id: true, name: true } },
            },
          },
        },
      }),
      db.product.findMany({
        select: { id: true, name: true },
        orderBy: { name: "asc" },
      }),
    ]);
    collections = collectionsData;
    products = productsData;
  } catch (error) {
    console.error("Error loading collections for admin:", error);
  }

  return <CollectionsClient initialCollections={collections} products={products} />;
}
