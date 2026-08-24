import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const COOKIE_NAME = "sharki_admin_session";

async function isValidSessionCookie(value: string | undefined) {
  if (!value || !process.env.AUTH_SECRET) return false;
  const [token, expiresAt, signature] = value.split(".");
  if (!token || !expiresAt || !signature || Number(expiresAt) <= Date.now()) return false;
  const payload = `${token}.${expiresAt}`;
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(process.env.AUTH_SECRET), { name: "HMAC", hash: "SHA-256" }, false, ["verify"]);
  const normalizedSignature = signature.replace(/-/g, "+").replace(/_/g, "/");
  const padding = "=".repeat((4 - (normalizedSignature.length % 4)) % 4);
  const bytes = Uint8Array.from(
    atob(normalizedSignature + padding),
    (character) => character.charCodeAt(0),
  );
  return crypto.subtle.verify("HMAC", key, bytes, new TextEncoder().encode(payload));
}

export async function middleware(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-sharki-admin-route", "1");
  if (request.nextUrl.pathname.startsWith("/admin") && !request.nextUrl.pathname.startsWith("/admin/login")) {
    if (!(await isValidSessionCookie(request.cookies.get(COOKIE_NAME)?.value))) return NextResponse.redirect(new URL("/admin/login", request.url));
  }
  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = { matcher: ["/admin/:path*"] };
