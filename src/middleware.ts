import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

/**
 * Route protection for /admin/* (Phase 14A).
 *
 * - Public: everything except /admin/* (so / and /book stay open).
 * - /admin/login is always reachable.
 * - Any other /admin/* requires an authenticated session; otherwise the user is
 *   redirected to /admin/login?redirect=<intended-path>.
 *
 * This is authentication-only gating. It does NOT enable RLS and does NOT touch
 * the data layer (which still uses the anon client + 003 grants).
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only guard admin routes; let the login page through.
  if (!pathname.startsWith("/admin") || pathname.startsWith("/admin/login")) {
    return NextResponse.next();
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "",
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/admin/login";
    loginUrl.search = `?redirect=${encodeURIComponent(pathname)}`;
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  // Run on admin routes only; skip static assets.
  matcher: ["/admin/:path*"],
};
