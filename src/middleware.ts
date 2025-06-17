/**
 * Next.js Middleware - Authentication & Route Protection
 *
 * Protects all routes except login/signup pages by checking authentication status.
 * Redirects unauthenticated users to login and authenticated users away from auth pages.
 *
 * @see https://nextjs.org/docs/app/building-your-application/routing/middleware
 */

import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getUserFromRequest, setUserInRequest } from "./lib/utils/request";

/**
 * Main middleware function - runs on every request before page rendering
 */
export async function middleware(request: NextRequest) {
  console.log("🚀 Middleware is running for:", request.nextUrl.pathname);

  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Check authentication status
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const organizationId = request.headers.get("x-organization-id");
    request = setUserInRequest(request, user, organizationId || user.id);
  }

  const { pathname } = request.nextUrl;

  // Define public routes (accessible without authentication)
  const publicRoutes = ["/login", "/signup"];
  const isPublicRoute = publicRoutes.includes(pathname);

  // If user is not authenticated and trying to access protected route
  if (!user && !isPublicRoute) {
    // Redirect to login page
    const redirectUrl = new URL("/login", request.url);
    return NextResponse.redirect(redirectUrl);
  }

  // If user is authenticated and trying to access auth pages
  if (user && isPublicRoute) {
    // Redirect to dashboard
    const redirectUrl = new URL("/", request.url);
    return NextResponse.redirect(redirectUrl);
  }

  console.log("🔐 SEC CONTEXT:", getUserFromRequest(request));
  return NextResponse.next({
    request,
  });
}

/**
 * Middleware configuration - defines which routes should trigger middleware
 * Excludes static files, images, and other assets for performance
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder assets (images, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
