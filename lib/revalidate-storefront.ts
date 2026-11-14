import { revalidatePath } from "next/cache";
import { clearSiteContentCache } from "@/lib/site-content";

export function revalidateStorefront() {
  clearSiteContentCache();
  revalidatePath("/", "layout");
}
