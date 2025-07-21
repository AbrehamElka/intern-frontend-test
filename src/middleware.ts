// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define the base paths that require protection
const PROTECTED_BASE_PATHS = ['/dashboard'];
const publicRoutes = ['/auth/signin', '/auth/signup', '/'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get('accessToken')?.value;

  console.log(`--- Middleware Triggered ---`);
  console.log(`Pathname: ${pathname}`);
  console.log(`AccessToken in cookie: ${accessToken ? 'PRESENT' : 'NOT PRESENT'}`); // Log if token exists
  if (accessToken) {
    console.log(`AccessToken value (partial): ${accessToken.substring(0, 10)}...`); // Log partial value if present
  }


  // Check if the current pathname starts with any of the protected base paths
  const isProtectedRoute = PROTECTED_BASE_PATHS.some(path => {
    const matches = pathname.startsWith(path);
    if (matches) {
      console.log(`Pathname '${pathname}' matches protected base path '${path}'.`);
    }
    return matches;
  });
  console.log(`Is Protected Route: ${isProtectedRoute}`);


  // Handle redirects for authenticated users from public routes
  if (accessToken && publicRoutes.includes(pathname)) {
    console.log(`Redirecting authenticated user from public route '${pathname}' to /dashboard.`);
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Handle protection for protected routes
  if (isProtectedRoute) {
    if (!accessToken) {
      // If protected route and no token, redirect to sign-in
      console.log(`Protected route '${pathname}' accessed without token. Redirecting to /auth/signin.`);
      return NextResponse.redirect(new URL('/auth/signin', request.url));
    } else {
      // If protected route AND has a token, allow access but set no-cache headers
      console.log(`Protected route '${pathname}' accessed WITH token. Setting no-cache headers.`);
      const response = NextResponse.next();
      response.headers.set(
        'Cache-Control',
        'no-store, no-cache, must-revalidate, proxy-revalidate'
      );
      return response;
    }
  }

  // For all other routes (public, or not explicitly protected by startsWith),
  // just proceed without specific cache headers
  console.log(`Pathname '${pathname}' is not a protected route. Proceeding.`);
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/auth/signin',
    '/auth/signup',
    '/',
  ],
};