import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

// Next.js 16 renamed the `middleware` file convention to `proxy`; this runs
// on the Node.js runtime by default, which is what Auth.js v5 expects here.
export default auth((req) => {
  if (!req.auth) {
    const loginUrl = new URL("/login", req.nextUrl);
    loginUrl.searchParams.set("callbackUrl", req.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }
});

export const config = {
  matcher: ["/dashboard/:path*"],
};
