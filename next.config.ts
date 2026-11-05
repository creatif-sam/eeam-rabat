import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  // Profile photos (≤ 2 MB) are uploaded through a server action
  experimental: {
    serverActions: { bodySizeLimit: "3mb" },
  },
  // The Turnstile site key is public by design; expose TURNSTILE_SITE_KEY to
  // the browser bundle (the secret key stays server-only).
  env: {
    NEXT_PUBLIC_TURNSTILE_SITE_KEY:
      process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || process.env.TURNSTILE_SITE_KEY || "",
  },
  async headers() {
    return [
      {
        // All pages and API routes (excludes /_next/static, which serves
        // content-hashed build assets that are safe and beneficial to cache):
        // never let the browser cache HTML/JSON responses, so logged-in/out
        // state is always re-validated.
        source: "/((?!_next/static|_next/image).*)",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
