import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const role = req.nextauth.token?.role;

    if (pathname.startsWith("/pages/dashboard/super-admin") && role !== "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/pages/login", req.url));
    }
    if (pathname.startsWith("/pages/dashboard/gym-admin") && role !== "GYM_ADMIN") {
      return NextResponse.redirect(new URL("/pages/login", req.url));
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: ["/dashboard/:path*"],
};