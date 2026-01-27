import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  const protectedPaths = [
    "/dashboard",
    "/organizations",
    "/attendance",
    "/employees",
    "/leaves",
    "/payroll",
  ];

  const authPaths = ["/login", "/register"];

  const isProtected = protectedPaths.some(p => pathname.startsWith(p));
  const isAuth = authPaths.some(p => pathname.startsWith(p));

  const access = request.cookies.get("access_token")?.value;
  const refresh = request.cookies.get("refresh_token")?.value;

  if (isProtected && !access) {
    if (refresh) {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}auth/token/refresh/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();
        const resp = NextResponse.next();

        if (data.access) {
          resp.cookies.set("access_token", data.access, { path: "/", httpOnly: true });
        }

        if (data.refresh) {
          resp.cookies.set("refresh_token", data.refresh, { path: "/", httpOnly: true });
        }

        return resp;
      }
    }

    const redirect = NextResponse.redirect(new URL("/login", request.url));
    redirect.cookies.delete("access_token");
    redirect.cookies.delete("refresh_token");
    return redirect;
  }

  if (isAuth && access) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}
