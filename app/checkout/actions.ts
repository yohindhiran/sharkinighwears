"use server";

import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCartSummary, readCartId } from "@/lib/cart";

export async function submitOrder(formData: FormData) {
  const cart = await getCartSummary();
  if (cart.items.length === 0) {
    throw new Error("Cart is empty");
  }

  const name = formData.get("name") as string;
  const mobile = formData.get("mobile") as string;
  const email = formData.get("email") as string;
  const address = formData.get("address") as string;
  const city = formData.get("city") as string;
  const state = formData.get("state") as string;
  const pincode = formData.get("pincode") as string;
  const payment = formData.get("payment") as string; 

  const orderNumber = "ORD-" + Date.now();

  const order = await db.order.create({
    data: {
      orderNumber,
      email,
      phone: mobile,
      recipient: name,
      addressLine1: address,
      city,
      state,
      pincode,
      subtotal: cart.subtotal,
      total: cart.subtotal,
      status: "NEW",
      paymentStatus: payment === "cod" ? "PENDING" : "PENDING", 
      items: {
        create: cart.items.map(item => ({
          productId: item.productId,
          variantId: item.variantId,
          productName: item.name,
          sku: `SKU-${item.productId}-${item.variantId || 'base'}`, // fallback SKU if missing
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        }))
      }
    }
  });

  // clear cart items
  const sessionId = await readCartId();
  if (sessionId) {
    const cartRecord = await db.cart.findUnique({ where: { sessionId } });
    if (cartRecord) {
      await db.cartItem.deleteMany({ where: { cartId: cartRecord.id } });
    }
  }

  redirect(`/`); // redirect to home or success
}
