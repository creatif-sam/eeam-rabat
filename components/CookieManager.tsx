"use client";

import { useCookieManager } from "@/lib/useCookieManager";

export function CookieManager() {
  // This component initializes the cookie manager hook
  // It doesn't render anything, just applies cookie settings
  useCookieManager();

  return null;
}