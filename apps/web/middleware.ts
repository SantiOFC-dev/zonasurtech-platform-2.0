import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { updateSession } from "./lib/supabase/server";

const PUBLIC_PATHS = ["/login", "/api/health", "/api/auth/logout"];
const AUTH_REQUIRED_PREFIXES = ["/dashboard", "/modules", "/settings", "/select-tenant", "/api/module-token"];

function isPublicPath(pathname: string) {
  return PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

function requiresAuth(pathname: string) {
  return AUTH_REQUIRED_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const { response, user } = await updateSession(req);

  if (pathname === "/login" && user) {
    const hasTenantCookie = Boolean(req.cookies.get("zs_active_tenant")?.value);
    return NextResponse.redirect(new URL(hasTenantCookie ? "/dashboard" : "/select-tenant", req.url));
  }

  if (isPublicPath(pathname)) {
    return response;
  }

  if (!requiresAuth(pathname)) {
    return response;
  }

  if (!user) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const tenant = req.cookies.get("zs_active_tenant")?.value;
  const tenantRequired = pathname.startsWith("/dashboard") || pathname.startsWith("/modules") || pathname.startsWith("/settings");

  if (tenantRequired && !tenant) {
    const tenantUrl = new URL("/select-tenant", req.url);
    tenantUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(tenantUrl);
  }

  if (pathname === "/select-tenant" && tenant) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"]
};
