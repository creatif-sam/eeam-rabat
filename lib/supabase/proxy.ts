import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { hasEnvVars } from "../utils";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  // If the env vars are not set, skip proxy check. You can remove this
  // once you setup the project.
  if (!hasEnvVars) {
    return supabaseResponse;
  }

  // With Fluid compute, don't put this client in a global environment
  // variable. Always create a new one on each request.
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
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, {
              ...options,
              httpOnly: true,
              sameSite: "lax",
              secure: process.env.NODE_ENV === "production",
              maxAge: Math.min(options?.maxAge ?? Infinity, 8 * 60 * 60),
            }),
          );
        },
      },
    },
  );

  // Do not run code between createServerClient and
  // supabase.auth.getClaims(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  // IMPORTANT: If you remove getClaims() and you use server-side rendering
  // with the Supabase client, your users may be randomly logged out.
  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;

  // Paths reachable without being logged in: the public marketing site,
  // auth pages, static PWA/SEO assets, and the anonymous-but-password-gated
  // public form APIs (attendance, commission requests, access-code check).
  const PUBLIC_PATH_PREFIXES = [
    "/login",
    "/auth",
    "/politique-de-confidentialite",
    "/politique-cookies",
    "/entretien-pastoral",
    "/manifest.json",
    "/sw.js",
    "/robots.txt",
    "/sitemap.xml",
    "/api/attendance",
    "/api/commission-requests",
    "/api/verify-access-code",
  ];
  const isPublicPath =
    request.nextUrl.pathname === "/" ||
    PUBLIC_PATH_PREFIXES.some((p) => request.nextUrl.pathname.startsWith(p));

  if (!isPublicPath && !user) {
    // no user, potentially respond by redirecting the user to the login page
    const url = request.nextUrl.clone();
    const hadSessionCookie = request.cookies.getAll().some((c) => c.name.startsWith("sb-"));
    url.pathname = "/auth/login";
    url.search = "";
    if (hadSessionCookie) {
      url.searchParams.set("reason", "session_expired");
    }
    return NextResponse.redirect(url);
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is.
  // If you're creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely!

  return supabaseResponse;
}
