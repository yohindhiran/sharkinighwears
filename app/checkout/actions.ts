"use server";

import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCartSummary, readCartId } from "@/lib/cart";
import { getSession } from "@/app/actions/auth";
import { sendOrderConfirmationEmail, sendAdminNewOrderAlert } from "@/lib/email";

export async function submitOrder(formData: FormData) {
  const cart = await getCartSummary();
  if (cart.items.length === 0) {
    throw new Error("Cart is empty");
  }

  const session = await getSession();

  const name = (formData.get("name") as string)?.trim();
  const mobile = (formData.get("mobile") as string)?.trim();
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const address = (formData.get("address") as string)?.trim();
  const city = (formData.get("city") as string)?.trim();
  const state = (formData.get("state") as string)?.trim();
  const pincode = (formData.get("pincode") as string)?.trim();
  const payment = (formData.get("payment") as string) || "cod";

  if (!name || !mobile || !email || !address || !city || !state || !pincode) {
    throw new Error("All fields are required.");
  }

  const orderNumber = "SHR-" + Math.floor(100000 + Math.random() * 900000);

  const orderItemsData = cart.items.map((item) => ({
    productId: item.productId,
    variantId: item.variantId,
    productName: item.name,
    sku: `SKU-${item.productId.slice(-4)}-${item.variantId ? item.variantId.slice(-4) : "std"}`,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
  }));

  try {
    await db.order.create({
      data: {
        userId: session?.id || null,
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
          create: orderItemsData,
        },
      },
    });

    // Clear cart items
    const sessionId = await readCartId();
    if (sessionId) {
      const cartRecord = await db.cart.findUnique({ where: { sessionId } });
      if (cartRecord) {
        await db.cartItem.deleteMany({ where: { cartId: cartRecord.id } });
      }
    }

    // Deduct variant stock
    for (const item of cart.items) {
      let targetVariantId = item.variantId;
      if (!targetVariantId) {
        const defaultVariant = await db.productVariant.findFirst({
          where: { productId: item.productId },
        });
        if (defaultVariant) targetVariantId = defaultVariant.id;
      }

      if (targetVariantId) {
        await db.productVariant
          .update({
            where: { id: targetVariantId },
            data: { stock: { decrement: item.quantity } },
          })
          .catch((e) => console.error("Failed to update stock:", e));
      }
    }

    // Send notifications (asynchronous, non-blocking)
    sendOrderConfirmationEmail({
      orderNumber,
      recipient: name,
      email,
      items: cart.items.map((item) => ({
        productName: item.name,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        size: item.size,
        color: item.color,
      })),
      total: cart.subtotal,
      addressLine1: address,
      city,
      state,
      pincode,
      paymentMethod: payment === "cod" ? "Cash on Delivery" : "Online Payment",
    }).catch((err) => console.error("Email send error:", err));

    sendAdminNewOrderAlert({
      orderNumber,
      recipient: name,
      email,
      phone: mobile,
      items: cart.items.map((item) => ({
        productName: item.name,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      })),
      total: cart.subtotal,
      addressLine1: address,
      city,
      state,
      pincode,
    }).catch((err) => console.error("Admin order alert error:", err));
  } catch (error) {
    console.error("Order creation failed:", error);
    throw error;
  }

  redirect(`/order-success?order=${orderNumber}`);
}
