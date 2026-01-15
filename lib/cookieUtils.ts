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

export const DEFAULT_COOKIE_SETTINGS: CookieSettings = {
  necessary: true,
  analytics: false,
  marketing: false,
  preferences: false
};

export const cookieUtils = {
  set: (name: string, value: string, options: any = {}) => {
    if (typeof window === "undefined") return;

    const defaultOptions = {
      path: "/",
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      ...options
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

  get: (name: string): string | null => {
    if (typeof window === "undefined") return null;

    const nameEQ = name + "=";
    const cookies = document.cookie.split(";");

    for (let c of cookies) {
      while (c.charAt(0) === " ") c = c.substring(1);
      if (c.indexOf(nameEQ) === 0) {
        return decodeURIComponent(c.substring(nameEQ.length));
      }
    }
    return null;
  },

  remove: (name: string) => {
    cookieUtils.set(name, "", { maxAge: -1 });
  }
};

export const cookieConsent = {
  save: (settings: CookieSettings) => {
    const consent: CookieConsent = {
      accepted: true,
      settings: { ...settings, necessary: true },
      timestamp: Date.now()
    };

    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(consent));
    localStorage.setItem(COOKIE_SETTINGS_KEY, JSON.stringify(settings));
  },

  get: (): CookieConsent | null => {
    const raw = localStorage.getItem(COOKIE_CONSENT_KEY);
    return raw ? JSON.parse(raw) : null;
  },

  getSettings: (): CookieSettings => {
    const raw = localStorage.getItem(COOKIE_SETTINGS_KEY);
    return raw ? JSON.parse(raw) : DEFAULT_COOKIE_SETTINGS;
  },

  clear: () => {
    localStorage.removeItem(COOKIE_CONSENT_KEY);
    localStorage.removeItem(COOKIE_SETTINGS_KEY);
  }
};

export const useCookieConsent = () => {
  const [consent, setConsent] = useState<CookieConsent | null>(null);
  const [settings, setSettings] = useState<CookieSettings>(DEFAULT_COOKIE_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const existingConsent = cookieConsent.get();
    const existingSettings = cookieConsent.getSettings();

    setConsent(existingConsent);
    setSettings(existingSettings);
    setIsLoading(false);
  }, []);

  const acceptAll = () => {
    const all: CookieSettings = {
      necessary: true,
      analytics: true,
      marketing: true,
      preferences: true
    };

    cookieConsent.save(all);
    setConsent({
      accepted: true,
      settings: all,
      timestamp: Date.now()
    });
    setSettings(all);
  };

  const acceptNecessary = () => {
    const necessary: CookieSettings = {
      necessary: true,
      analytics: false,
      marketing: false,
      preferences: false
    };

    cookieConsent.save(necessary);
    setConsent({
      accepted: true,
      settings: necessary,
      timestamp: Date.now()
    });
    setSettings(necessary);
  };

  const saveSettings = (newSettings: CookieSettings) => {
    const normalized = { ...newSettings, necessary: true };

    cookieConsent.save(normalized);
    setConsent({
      accepted: true,
      settings: normalized,
      timestamp: Date.now()
    });
    setSettings(normalized);
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
    isAccepted: Boolean(consent?.accepted),
    acceptAll,
    acceptNecessary,
    saveSettings,
    rejectAll
  };
};

export const analyticsCookies = {
  enable: () => {
    if (typeof window === "undefined") return;

    const script = document.createElement("script");
    script.async = true;
    script.src = "https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID";
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    function gtag(...args: any[]) {
      window.dataLayer.push(args);
    }
    gtag("js", new Date());
    gtag("config", "GA_MEASUREMENT_ID");
  },

  disable: () => {
    document
      .querySelectorAll('script[src*="googletagmanager"]')
      .forEach(s => s.remove());
    window.dataLayer = [];
  }
};

export const marketingCookies = {
  enable: () => {},
  disable: () => {}
};

export const preferencesCookies = {
  save: (key: string, value: any, days = 365) => {
    const expires = new Date();
    expires.setDate(expires.getDate() + days);

    cookieUtils.set(`eeam_pref_${key}`, JSON.stringify(value), { expires });
  },

  get: <T = any>(key: string): T | null => {
    const raw = cookieUtils.get(`eeam_pref_${key}`);
    return raw ? JSON.parse(raw) : null;
  },

  remove: (key: string) => {
    cookieUtils.remove(`eeam_pref_${key}`);
  }
};

declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}
