import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
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
