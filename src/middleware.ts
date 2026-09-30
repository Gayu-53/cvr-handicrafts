import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware() {
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/admin/login",
    },
  }
);

// Protects every /admin route EXCEPT /admin/login itself, and protects
// all admin write API routes. Public catalogue/order-creation APIs are
// intentionally excluded so customers can browse and check out.
export const config = {
  matcher: [
    "/admin/((?!login).*)",
    "/api/admin/:path*",
  ],
};
