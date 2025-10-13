import { NextResponse } from "next/server";

export function middleware(request) {
  const path = request.nextUrl.pathname;

  // Log request details for debugging
  console.log(`Middleware triggered for path: ${path}`);
  console.log("All cookies:", request.cookies.getAll()); // Dump all cookies to check presence

  if (path.startsWith("/admin") && path !== "/admin/login") {
    const authCookie = request.cookies.get("auth")?.value; // Ensure this matches your login cookie name

    if (!authCookie) {
      console.warn("No 'auth' cookie found");
      return redirectToLogin(request, path);
    }

    try {
      const authData = JSON.parse(authCookie);
      const token = authData?.token;

      if (!token) {
        console.warn("No token found in 'auth' cookie");
        return redirectToLogin(request, path);
      }

      // If token exists, proceed (no further verification)
      return NextResponse.next();
    } catch (error) {
      console.error("Error parsing 'auth' cookie:", error);
      return redirectToLogin(request, path);
    }
  }

  console.log("Allowing request to proceed for path:", path);
  return NextResponse.next();
}

// Helper function for redirect to avoid caching and loops
function redirectToLogin(request, originalPath) {
  const loginUrl = new URL("/admin/login", request.url);
  loginUrl.searchParams.set("next", originalPath);
  return NextResponse.redirect(loginUrl, { status: 303 }); // 303 prevents caching
}

export const config = {
  matcher: ["/admin/:path*"], // This covers /admin/tests
};
