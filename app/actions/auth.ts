"use server";

import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/password";
import { sendWelcomeEmail } from "@/lib/email";

const COOKIE_NAME = "sharki_session";
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

function secret() {
  const value = process.env.AUTH_SECRET;
  if (!value) throw new Error("AUTH_SECRET is required.");
  return value;
}

function sign(value: string) {
  return createHmac("sha256", secret()).update(value).digest("base64url");
}

export async function register(formData: FormData) {
  const name = (formData.get("name") as string)?.trim();
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const password = formData.get("password") as string;
  const phone = (formData.get("phone") as string)?.trim() || null;

  if (!email || !password || !name) {
    return { error: "Please fill in all required fields." };
  }

  if (password.length < 6) {
    return { error: "Password must be at least 6 characters." };
  }

  try {
    const existingUser = await db.user.findUnique({ where: { email } });
    if (existingUser) {
      return { error: "An account with this email already exists." };
    }

    const hashedPassword = await hashPassword(password);

    const user = await db.user.create({
      data: {
        name,
        email,
        phone,
        passwordHash: hashedPassword,
        role: "CUSTOMER",
      },
    });

    // Send welcome email (async, non-blocking)
    sendWelcomeEmail({ name, email }).catch((err) =>
      console.error("Failed to send welcome email:", err)
    );

    await createSession(user.id);
  } catch (err: unknown) {
    console.error("Register error:", err);
    return { error: "Failed to create account. Please check database connection." };
  }

  redirect("/account");
}

export async function login(formData: FormData) {
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Please enter your email and password." };
  }

  let user;
  try {
    user = await db.user.findUnique({ where: { email } });
  } catch (err) {
    console.error("Login DB lookup error:", err);
    return { error: "Cannot connect to database. Please verify database status." };
  }

  if (!user || !user.passwordHash) {
    return { error: "Invalid email or password." };
  }

  const isValid = await verifyPassword(password, user.passwordHash);
  if (!isValid) {
    return { error: "Invalid email or password." };
  }

  await createSession(user.id);

  redirect("/account");
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
  redirect("/login");
}

async function createSession(userId: string) {
  const payload = `${userId}.${Date.now() + SESSION_TTL_MS}`;
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, `${payload}.${sign(payload)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: new Date(Date.now() + SESSION_TTL_MS),
    path: "/",
  });

  // Link anonymous cart to logged in user
  try {
    const cartSid = cookieStore.get("sharki_cart_sid")?.value;
    if (cartSid) {
      await db.cart.updateMany({
        where: { sessionId: cartSid },
        data: { userId },
      });
    }
  } catch (e) {
    console.error("Failed to associate cart with user:", e);
  }
}

export async function getSession() {
  const cookieStore = await cookies();
  const value = cookieStore.get(COOKIE_NAME)?.value;
  if (!value) return null;

  const [userId, expiresAtValue, signature] = value.split(".");
  if (!userId || !expiresAtValue || !signature || Number(expiresAtValue) <= Date.now()) return null;

  const payload = `${userId}.${expiresAtValue}`;
  const expected = Buffer.from(sign(payload));
  const received = Buffer.from(signature);

  if (expected.length !== received.length || !timingSafeEqual(expected, received)) return null;

  try {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
      },
    });
    return user;
  } catch {
    return null;
  }
}

export async function updateProfile(formData: FormData) {
  const user = await getSession();
  if (!user) return { error: "Not authenticated" };

  const name = (formData.get("name") as string)?.trim();
  const phone = (formData.get("phone") as string)?.trim() || null;

  if (!name) return { error: "Name is required" };

  try {
    await db.user.update({
      where: { id: user.id },
      data: { name, phone },
    });
    revalidatePath("/account");
    return { success: true };
  } catch (e) {
    console.error("Failed to update profile:", e);
    return { error: "Failed to update profile." };
  }
}

export async function addAddress(formData: FormData) {
  const user = await getSession();
  if (!user) return { error: "Not authenticated" };

  const label = (formData.get("label") as string)?.trim() || "Home";
  const recipient = (formData.get("recipient") as string)?.trim();
  const line1 = (formData.get("line1") as string)?.trim();
  const line2 = (formData.get("line2") as string)?.trim() || null;
  const city = (formData.get("city") as string)?.trim();
  const state = (formData.get("state") as string)?.trim();
  const pincode = (formData.get("pincode") as string)?.trim();

  if (!recipient || !line1 || !city || !state || !pincode) {
    return { error: "Please fill in all required address fields." };
  }

  try {
    await db.address.create({
      data: {
        userId: user.id,
        label,
        recipient,
        line1,
        line2,
        city,
        state,
        pincode,
        country: "India",
      },
    });
    revalidatePath("/account");
    revalidatePath("/checkout");
    return { success: true };
  } catch (e) {
    console.error("Failed to add address:", e);
    return { error: "Failed to save address." };
  }
}

export async function deleteAddress(addressId: string) {
  const user = await getSession();
  if (!user) return { error: "Not authenticated" };

  try {
    await db.address.deleteMany({
      where: {
        id: addressId,
        userId: user.id,
      },
    });
    revalidatePath("/account");
    revalidatePath("/checkout");
    return { success: true };
  } catch (e) {
    console.error("Failed to delete address:", e);
    return { error: "Failed to delete address." };
  }
}
