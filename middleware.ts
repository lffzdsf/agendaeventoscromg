import { NextResponse } from "next/server";

import { auth } from "@/auth";

const publicPaths = ["/login", "/api/auth"];

export default auth((request) => {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", request.nextUrl.pathname);

  const isPublicPath = publicPaths.some((path) => request.nextUrl.pathname.startsWith(path));
  const isAuthenticated = Boolean(request.auth?.user?.email);

  if (!isAuthenticated && !isPublicPath) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthenticated && isPublicPath) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders
    }
  });
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"]
};
