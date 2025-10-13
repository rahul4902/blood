import { NextResponse } from 'next/server';

export async function middleware(request) {
  const accessToken = request.cookies.get('accessToken')?.value;
  const { pathname } = request.nextUrl;

  // Define protected and public routes
  const protectedPaths = [
    '/delivery-address',
    '/checkout',
    '/time-slot',
    '/patient-details',
    '/profile',
    '/orders'
  ];

  const authPaths = ['/login', '/register'];

  // Check if current path matches protected routes
  const isProtectedPath = protectedPaths.some(path =>
    pathname.startsWith(path)
  );

  const isAuthPath = authPaths.some(path =>
    pathname.startsWith(path)
  );
  console.log('isProtectedPath', isProtectedPath, accessToken);
  // Redirect to login if accessing protected route without token
  if (isProtectedPath && !accessToken) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    console.log(`[Middleware] Redirecting to login. Original path: ${pathname}`);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect to home if authenticated user tries to access auth pages
  if (isAuthPath && accessToken) {
    console.log(`[Middleware] User authenticated, redirecting from ${pathname} to home`);
    return NextResponse.redirect(new URL('/', request.url));
  }

  // For protected routes with token, perform lightweight validation
  // Only check token expiry from cookie, don't make API calls for performance
  if (isProtectedPath && accessToken) {
    try {
      const tokenExpiry = request.cookies.get('tokenExpiry')?.value;

      if (tokenExpiry) {
        const expiryDate = new Date(tokenExpiry);
        const now = new Date();

        // If token is expired, redirect to login
        if (expiryDate <= now) {
          console.log(`[Middleware] Token expired, redirecting to login`);
          const loginUrl = new URL('/login', request.url);
          loginUrl.searchParams.set('redirect', pathname);
          const response = NextResponse.redirect(loginUrl);

          // Clear expired cookies
          response.cookies.delete('accessToken');
          response.cookies.delete('tokenExpiry');
          response.cookies.delete('user');

          return response;
        }
      }
    } catch (error) {
      console.error('[Middleware] Token validation error:', error);
      // On error, allow request to proceed - let client handle it
    }
  }

  // Allow the request to proceed
  return NextResponse.next();
}

// Configure which routes middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.svg$|.*\\.gif$).*)',
  ]
};
