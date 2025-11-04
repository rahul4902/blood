// middleware.js
import { NextResponse } from 'next/server';

/**
 * Helper: Unified logging for dev and prod (Vercel captures console.log in production)
 */
const log = (...args) => {
  const prefix = process.env.NODE_ENV === 'development' ? '[DEV MIDDLEWARE]' : '[PROD MIDDLEWARE]';
  console.log(prefix, ...args);
};

/**
 * Manual cookie parser fallback (in case request.cookies fails in Edge)
 */
const parseCookies = (header) => {
  const parsed = {};
  if (!header) return parsed;
  header.split(';').forEach((pair) => {
    const [key, ...rest] = pair.trim().split('=');
    if (key) {
      parsed[key] = decodeURIComponent(rest.join('='));
    }
  });
  return parsed;
};

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  const cookieHeader = request.headers.get('cookie') || '';

  // Parse cookies via Next.js + fallback
  const cookies = request.cookies;
  const manualCookies = parseCookies(cookieHeader);

  const accessToken = cookies.get('accessToken')?.value || manualCookies['accessToken'];
  const tokenExpiry = cookies.get('tokenExpiry')?.value || manualCookies['tokenExpiry'];

  // === LOGGING (Visible in Vercel Dashboard) ===
  log('Path:', pathname);
  log('Raw Cookie Header:', cookieHeader);
  log('accessToken exists:', !!accessToken);
  log('tokenExpiry exists:', !!tokenExpiry);

  // === ROUTE DEFINITIONS ===
  const protectedPaths = [
    '/delivery-address',
    '/checkout',
    '/time-slot',
    '/patient-details',
    '/profile',
    '/orders',
  ];

  const authPaths = ['/login', '/register'];

  const isProtectedPath = protectedPaths.some((path) => pathname.startsWith(path));
  const isAuthPath = authPaths.some((path) => pathname.startsWith(path));

  log('isProtectedPath:', isProtectedPath);
  log('isAuthPath:', isAuthPath);

  // === 1. Protected route without token → Login ===
  if (isProtectedPath && !accessToken) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    log('Redirecting to login (no token):', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // === 2. Logged in user on login/register → Home ===
  if (isAuthPath && accessToken) {
    log('Redirecting authenticated user from:', pathname, '→ /');
    return NextResponse.redirect(new URL('/', request.url));
  }

  // === 3. Token expiry check (only on protected paths) ===
  if (isProtectedPath && accessToken && tokenExpiry) {
    try {
      const expiryDate = new Date(tokenExpiry);
      const now = new Date();

      if (expiryDate <= now) {
        log('Token expired, clearing cookies and redirecting to login');
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('redirect', pathname);

        const response = NextResponse.redirect(loginUrl);

        // Clear cookies with explicit path
        response.cookies.delete('accessToken', { path: '/' });
        response.cookies.delete('tokenExpiry', { path: '/' });
        response.cookies.delete('user', { path: '/' });

        return response;
      }
    } catch (error) {
      console.error('[Middleware] Token expiry parse error:', error);
      // Let client handle malformed date
    }
  }

  // === 4. Allow request ===
  log('Request allowed:', pathname);
  return NextResponse.next();
}

// === CONFIG: Run on all pages except API, static, images, public files ===
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon\\.ico|.*\\.(?:png|jpg|jpeg|svg|gif|webp|ico)$).*)',
  ],
};