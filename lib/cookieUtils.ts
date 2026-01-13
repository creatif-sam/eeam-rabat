"use client";

import { useState, useEffect } from "react";

export interface CookieSettings {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  preferences: boolean;
}

export interface CookieConsent {
  accepted: boolean;
  settings: CookieSettings;
  timestamp: number;
}

const COOKIE_CONSENT_KEY = "eeam_cookie_consent";
const COOKIE_SETTINGS_KEY = "eeam_cookie_settings";

// Default cookie settings
export const DEFAULT_COOKIE_SETTINGS: CookieSettings = {
  necessary: true, // Always true, cannot be disabled
  analytics: false,
  marketing: false,
  preferences: false,
};

// Cookie utilities
export const cookieUtils = {
  // Set a cookie
  set: (name: string, value: string, options: any = {}) => {
    if (typeof window === "undefined") return;

    const defaultOptions = {
      path: "/",
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      ...options,
    };

    let cookieString = `${name}=${encodeURIComponent(value)}`;

    if (defaultOptions.expires) {
      cookieString += `; expires=${defaultOptions.expires.toUTCString()}`;
    }

    if (defaultOptions.maxAge) {
      cookieString += `; max-age=${defaultOptions.maxAge}`;
    }

    if (defaultOptions.path) {
      cookieString += `; path=${defaultOptions.path}`;
    }

    if (defaultOptions.domain) {
      cookieString += `; domain=${defaultOptions.domain}`;
    }

    if (defaultOptions.secure) {
      cookieString += "; secure";
    }

    if (defaultOptions.sameSite) {
      cookieString += `; samesite=${defaultOptions.sameSite}`;
    }

    document.cookie = cookieString;
  },

  // Get a cookie
  get: (name: string): string | null => {
    if (typeof window === "undefined") return null;

    const nameEQ = name + "=";
    const ca = document.cookie.split(";");

    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === " ") c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) {
        return decodeURIComponent(c.substring(nameEQ.length, c.length));
      }
    }
    return null;
  },

  // Remove a cookie
  remove: (name: string, options: any = {}) => {
    if (typeof window === "undefined") return;

    const defaultOptions = {
      path: "/",
      ...options,
    };

    cookieUtils.set(name, "", { ...defaultOptions, maxAge: -1 });
  },

  // Check if cookies are enabled
  areEnabled: (): boolean => {
    if (typeof window === "undefined") return false;

    try {
      document.cookie = "testcookie=1";
      const result = document.cookie.indexOf("testcookie=") !== -1;
      document.cookie = "testcookie=; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      return result;
    } catch (e) {
      return false;
    }
  },
};

// Cookie consent management
export const cookieConsent = {
  // Save consent
  save: (settings: CookieSettings) => {
    const consent: CookieConsent = {
      accepted: true,
      settings: { ...settings, necessary: true }, // Necessary cookies are always enabled
      timestamp: Date.now(),
    };

    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(consent));
    localStorage.setItem(COOKIE_SETTINGS_KEY, JSON.stringify(settings));
  },

  // Get consent
  get: (): CookieConsent | null => {
    if (typeof window === "undefined") return null;

    try {
      const consentStr = localStorage.getItem(COOKIE_CONSENT_KEY);
      return consentStr ? JSON.parse(consentStr) : null;
    } catch {
      return null;
    }
  },

  // Get settings
  getSettings: (): CookieSettings => {
    if (typeof window === "undefined") return DEFAULT_COOKIE_SETTINGS;

    try {
      const settingsStr = localStorage.getItem(COOKIE_SETTINGS_KEY);
      return settingsStr ? JSON.parse(settingsStr) : DEFAULT_COOKIE_SETTINGS;
    } catch {
      return DEFAULT_COOKIE_SETTINGS;
    }
  },

  // Check if consent is given
  isAccepted: (): boolean => {
    const consent = cookieConsent.get();
    return consent?.accepted || false;
  },

  // Clear consent
  clear: () => {
    localStorage.removeItem(COOKIE_CONSENT_KEY);
    localStorage.removeItem(COOKIE_SETTINGS_KEY);
  },
};

// React hook for cookie consent
export const useCookieConsent = () => {
  const [consent, setConsent] = useState<CookieConsent | null>(null);
  const [settings, setSettings] = useState<CookieSettings>(DEFAULT_COOKIE_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadConsent = () => {
      const currentConsent = cookieConsent.get();
      const currentSettings = cookieConsent.getSettings();

      setConsent(currentConsent);
      setSettings(currentSettings);
      setIsLoading(false);
    };

    loadConsent();
  }, []);

  const acceptAll = () => {
    const allSettings: CookieSettings = {
      necessary: true,
      analytics: true,
      marketing: true,
      preferences: true,
    };

    cookieConsent.save(allSettings);
    setSettings(allSettings);
    setConsent(cookieConsent.get());
  };

  const acceptNecessary = () => {
    const necessarySettings: CookieSettings = {
      necessary: true,
      analytics: false,
      marketing: false,
      preferences: false,
    };

    cookieConsent.save(necessarySettings);
    setSettings(necessarySettings);
    setConsent(cookieConsent.get());
  };

  const saveSettings = (newSettings: CookieSettings) => {
    cookieConsent.save(newSettings);
    setSettings(newSettings);
    setConsent(cookieConsent.get());
  };

  const rejectAll = () => {
    cookieConsent.clear();
    setConsent(null);
    setSettings(DEFAULT_COOKIE_SETTINGS);
  };

  return {
    consent,
    settings,
    isLoading,
    isAccepted: cookieConsent.isAccepted(),
    acceptAll,
    acceptNecessary,
    saveSettings,
    rejectAll,
  };
};

// Analytics cookies (example implementation)
export const analyticsCookies = {
  // Enable Google Analytics
  enable: () => {
    if (typeof window === "undefined") return;

    // Load Google Analytics script
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID`;
    document.head.appendChild(script);

    // Initialize gtag
    window.dataLayer = window.dataLayer || [];
    function gtag(...args: any[]) {
      window.dataLayer.push(args);
    }
    gtag("js", new Date());
    gtag("config", "GA_MEASUREMENT_ID");
  },

  // Disable Google Analytics
  disable: () => {
    if (typeof window === "undefined") return;

    // Remove gtag script
    const scripts = document.querySelectorAll('script[src*="googletagmanager"]');
    scripts.forEach(script => script.remove());

    // Clear dataLayer
    window.dataLayer = [];
  },
};

// Marketing cookies (example implementation)
export const marketingCookies = {
  // Enable marketing cookies
  enable: () => {
    // Implement marketing cookie logic here
    console.log("Marketing cookies enabled");
  },

  // Disable marketing cookies
  disable: () => {
    // Implement marketing cookie cleanup here
    console.log("Marketing cookies disabled");
  },
};

// Preferences cookies
export const preferencesCookies = {
  // Save user preferences
  save: (key: string, value: any, expiryDays = 365) => {
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + expiryDays);

    cookieUtils.set(`eeam_pref_${key}`, JSON.stringify(value), {
      expires: expiry,
    });
  },

  // Get user preferences
  get: <T = any>(key: string): T | null => {
    const value = cookieUtils.get(`eeam_pref_${key}`);
    if (!value) return null;

    try {
      return JSON.parse(value);
    } catch {
      return null;
    }
  },

  // Remove user preferences
  remove: (key: string) => {
    cookieUtils.remove(`eeam_pref_${key}`);
  },
};

// Declare global gtag function
declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}