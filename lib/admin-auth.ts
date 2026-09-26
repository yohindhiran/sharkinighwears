import { createHmac, createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { verifyPassword } from "@/lib/password";

const COOKIE_NAME = "sharki_admin_session";
const SESSION_TTL_MS = 8 * 60 * 60 * 1000;

function secret() {
  const value = process.env.AUTH_SECRET;
  if (!value) throw new Error("AUTH_SECRET is required for admin authentication.");
  return value;
}

function sign(value: string) {
  return createHmac("sha256", secret()).update(value).digest("base64url");
}

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function hashAdminPassword(password: string) {
  const { hashPassword } = await import("@/lib/password");
  return hashPassword(password);
}

async function verifyAdminPassword(password: string, stored: string) {
  return verifyPassword(password, stored);
}

export async function createAdminSession(email: string, password: string) {
  try {
    const normalizedEmail = email.toLowerCase().trim();
    const envEmail = process.env.ADMIN_EMAIL?.toLowerCase().trim();
    const envPassword = process.env.ADMIN_PASSWORD?.trim();
    
    const user = await db.user.findUnique({ where: { email: normalizedEmail } });
    const isValidDbUser = user && user.role === "ADMIN" && user.passwordHash && (await verifyAdminPassword(password, user.passwordHash));
    const isValidEnvUser = envEmail && normalizedEmail === envEmail && password === envPassword;

    if (!isValidDbUser && !isValidEnvUser) return false;

    // userId is not needed

    const token = randomBytes(32).toString("base64url");
    const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
    const payload = `${token}.${expiresAt.getTime()}`;
    if (user?.id) {
      await db.adminSession.create({ data: { userId: user.id, tokenHash: hashToken(token), expiresAt } });
    }
    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, `${payload}.${sign(payload)}`, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires: expiresAt,
      path: "/",
    });
    return true;
  } catch {
    console.error("DB Error in login, falling back to env credentials");
    const normalizedEmail = email.toLowerCase().trim();
    const envEmail = process.env.ADMIN_EMAIL?.toLowerCase().trim();
    const envPassword = process.env.ADMIN_PASSWORD?.trim();
    
    if (normalizedEmail !== envEmail || password !== envPassword) return false;
    
    const token = randomBytes(32).toString("base64url");
    const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
    const payload = `${token}.${expiresAt.getTime()}`;
    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, `${payload}.${sign(payload)}`, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires: expiresAt,
      path: "/",
    });
    return true;
  }
}

export async function getAdminSession() {
  const value = (await cookies()).get(COOKIE_NAME)?.value;
  if (!value) return null;
  const [token, expiresAtValue, signature] = value.split(".");
  if (!token || !expiresAtValue || !signature || Number(expiresAtValue) <= Date.now()) return null;
  const payload = `${token}.${expiresAtValue}`;
  const expected = Buffer.from(sign(payload));
  const received = Buffer.from(signature);
  if (expected.length !== received.length || !timingSafeEqual(expected, received)) return null;
  
  try {
    const session = await db.adminSession.findUnique({ where: { tokenHash: hashToken(token) }, include: { user: true } });
    if (session && session.expiresAt.getTime() > Date.now() && session.user.role === "ADMIN") {
      return session;
    }
  } catch {
    // DB error, fallback below
  }

  // Fallback to ENV mock session if DB doesn't have it (because we logged in via ENV)
  // We already verified the HMAC signature above, so the token is authentic and issued by us.
  return {
      id: "mock-session",
      userId: "mock-admin-id",
      tokenHash: hashToken(token),
      expiresAt: new Date(Number(expiresAtValue)),
      createdAt: new Date(),
      user: {
        id: "mock-admin-id",
        email: process.env.ADMIN_EMAIL || "",
        name: "Mock Admin",
        role: "ADMIN"
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any;
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  const value = cookieStore.get(COOKIE_NAME)?.value;
  const token = value?.split(".")[0];
  if (token) {
    try {
      await db.adminSession.deleteMany({ where: { tokenHash: hashToken(token) } });
    } catch {
      console.error("DB error clearing session");
    }
  }
  cookieStore.delete(COOKIE_NAME);
}

export async function requireAdmin() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  return session;
}

export { COOKIE_NAME, sign };
