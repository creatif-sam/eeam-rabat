"use client";

import { useEffect } from "react";
import { useCookieConsent, analyticsCookies, marketingCookies } from "@/lib/cookieUtils";

export const useCookieManager = () => {
  const { settings, isAccepted } = useCookieConsent();

  useEffect(() => {
    if (!isAccepted) return;

    // Apply analytics cookies
    if (settings.analytics) {
      analyticsCookies.enable();
    } else {
      analyticsCookies.disable();
    }

    // Apply marketing cookies
    if (settings.marketing) {
      marketingCookies.enable();
    } else {
      marketingCookies.disable();
    }

    // Note: Necessary cookies are always enabled and preferences cookies
    // are handled by the preferencesCookies utility when needed

  }, [settings, isAccepted]);

  return {
    settings,
    isAccepted,
  };
};