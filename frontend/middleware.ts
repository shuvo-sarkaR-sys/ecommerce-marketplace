import { NextRequest, NextResponse } from "next/server";

const roleGuardedPrefixes: { prefix: string; roles: string[] }[] = [
  { prefix: "/account", roles: ["customer", "seller", "admin"] },
  { prefix: "/seller", roles: ["seller", "admin"] },
  { prefix: "/admin", roles: ["admin"] },
];

const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:5000";

export async function middleware(req: NextRequest) {
  if (req.nextUrl.pathname === "/admin/login" || req.nextUrl.pathname === "/admin/register") {
    return NextResponse.next();
  }
  if (req.nextUrl.pathname === "/seller/login") return NextResponse.next();

  const match = roleGuardedPrefixes.find((r) => req.nextUrl.pathname.startsWith(r.prefix));
  if (!match) return NextResponse.next();

  const cookieHeader = req.headers.get("cookie");
  if (!cookieHeader) {
    const loginPath = match.prefix === "/admin" ? "/admin/login" : "/seller/login";
    return NextResponse.redirect(new URL(`${loginPath}?next=${req.nextUrl.pathname}`, req.url));
  }

  // The frontend never holds the JWT signing secret -- that would defeat the
  // point of splitting frontend/backend into separately deployable apps.
  // Instead, forward the browser's cookies to the backend's own /me check and
  // trust its answer. This costs one extra round trip per protected
  // navigation in exchange for not sharing auth internals across the split.
  try {
    const res = await fetch(`${BACKEND_URL}/api/auth/me`, {
      headers: { cookie: cookieHeader },
    });

    if (!res.ok) {
      const loginPath = match.prefix === "/admin" ? "/admin/login" : "/seller/login";
      return NextResponse.redirect(new URL(`${loginPath}?next=${req.nextUrl.pathname}`, req.url));
    }

    const { data } = (await res.json()) as { data: { user: { role: string } } };
    if (!match.roles.includes(data.user.role)) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    return NextResponse.next();
  } catch {
    // Backend unreachable -- fail closed rather than let a protected page
    // through unauthenticated.
    return NextResponse.redirect(new URL(`/seller/login?next=${req.nextUrl.pathname}`, req.url));
  }
}

export const config = {
  matcher: ["/account/:path*", "/seller/:path*", "/admin/:path*"],
};
