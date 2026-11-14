import { revalidatePath } from "next/cache";
import { clearSiteContentCache } from "@/lib/site-content";
import { clearStorefrontCache } from "@/lib/storefront-data";

export function revalidateStorefront() {
  clearSiteContentCache();
  clearStorefrontCache();
  try {
    revalidatePath("/", "layout");
    revalidatePath("/shop");
    revalidatePath("/admin/products");
    revalidatePath("/admin/categories");
    revalidatePath("/admin/inventory");
    revalidatePath("/admin");
  } catch (e) {
    console.warn("revalidatePath notice:", e);
  }
}
