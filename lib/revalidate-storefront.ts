import { revalidatePath } from "next/cache";

export function revalidateStorefront() {
  revalidatePath("/");
  revalidatePath("/shop");
  revalidatePath("/search");
  revalidatePath("/collections");
  revalidatePath("/product/[slug]", "page");
}
