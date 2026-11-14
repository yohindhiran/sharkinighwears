import { requireAdmin } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import {
  CategoriesClient,
  type AdminCategory,
} from "@/components/admin/categories-client";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminCategoriesPage() {
  await requireAdmin();

  let categories: AdminCategory[] = [];
  try {
    categories = await db.category.findMany({
      orderBy: { sortOrder: "asc" },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });
  } catch (error) {
    console.error("Error loading categories for admin:", error);
  }

  return <CategoriesClient initialCategories={categories} />;
}
