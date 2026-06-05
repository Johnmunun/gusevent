import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth, isNeonAuthConfigured } from "@/lib/auth/server";

const neonMiddleware = isNeonAuthConfigured
  ? auth.middleware({ loginUrl: "/admin/login" })
  : null;

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith("/admin") && !pathname.startsWith("/api/admin")) {
    return NextResponse.next();
  }

  // Les routes API admin gèrent l'auth dans requireApiPermission (évite les
  // blocages PATCH/PUT par le middleware Neon en edge runtime).
  if (pathname.startsWith("/api/admin")) {
    return NextResponse.next();
  }

  if (
    pathname === "/admin/login" ||
    pathname === "/admin/unauthorized" ||
    pathname === "/api/admin/bootstrap-auth"
  ) {
    return NextResponse.next();
  }

  if (!isNeonAuthConfigured) {
    const login = new URL("/admin/login", request.url);
    login.searchParams.set("error", "neon_auth");
    return NextResponse.redirect(login);
  }

  return neonMiddleware!(request);
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
