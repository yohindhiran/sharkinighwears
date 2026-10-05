"use server";

import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/password";

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
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password || !name) {
    return { error: "Missing required fields" };
  }

  const existingUser = await db.user.findUnique({ where: { email: email.toLowerCase() } });
  if (existingUser) {
    return { error: "Email already in use" };
  }

  const hashedPassword = await hashPassword(password);

  const user = await db.user.create({
    data: {
      name,
      email: email.toLowerCase(),
      passwordHash: hashedPassword,
      role: "CUSTOMER",
    },
  });

  await createSession(user.id);
  
  redirect("/account");
}

export async function login(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Missing email or password" };
  }

  const user = await db.user.findUnique({ where: { email: email.toLowerCase() } });
  if (!user || !user.passwordHash) {
    return { error: "Invalid credentials" };
  }

  const isValid = await verifyPassword(password, user.passwordHash);
  if (!isValid) {
    return { error: "Invalid credentials" };
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

  // Link cart to user
  const cartSid = cookieStore.get("sharki_cart_sid")?.value;
  if (cartSid) {
    await db.cart.updateMany({
      where: { sessionId: cartSid },
      data: { userId },
    });
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
    const user = await db.user.findUnique({ where: { id: userId } });
    if (user && user.role === "CUSTOMER") {
      return user;
    }
  } catch {
    return null;
  }
  return null;
}
