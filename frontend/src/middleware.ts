import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {auth0} from "./lib/auth0";

export async function middleware(request: NextRequest) {
  const authRes = await auth0.middleware(request);

  // Let Auth0 handle all auth routes
  if (request.nextUrl.pathname.startsWith("/auth")) {
    return authRes;
  }

  // Allow access to public routes (landing page)
  if (request.nextUrl.pathname === "/" || request.nextUrl.pathname === "/landing") {
    return authRes;
  }

  // Check if user is authenticated for protected routes
  const session = await auth0.getSession(request);
  
  if (!session) {
    // For API routes, return 401 instead of redirect
    if (request.nextUrl.pathname.startsWith("/api")) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }
    
    // For page routes, redirect to login with returnTo parameter
    const loginUrl = new URL("/auth/login", request.nextUrl.origin);
    loginUrl.searchParams.set("returnTo", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // User is authenticated, continue with the response
  return authRes;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};