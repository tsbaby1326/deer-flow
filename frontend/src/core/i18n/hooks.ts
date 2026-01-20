"use client";

import { useEffect, useState } from "react";

import { enUS } from "./locales/en-US";
import { zhCN } from "./locales/zh-CN";

import { detectLocale, type Locale, type Translations } from "./index";

const translations: Record<Locale, Translations> = {
  "en-US": enUS,
  "zh-CN": zhCN,
};

export function useI18n() {
  const [locale, setLocale] = useState<Locale>(() => {
    if (typeof window === "undefined") {
      return "en-US";
    }

    // Try to get from localStorage first
    const saved = localStorage.getItem("locale") as Locale | null;
    if (saved && (saved === "en-US" || saved === "zh-CN")) {
      return saved;
    }

    // Otherwise detect from browser
    return detectLocale();
  });

  const t = translations[locale];

  const changeLocale = (newLocale: Locale) => {
    setLocale(newLocale);
    if (typeof window !== "undefined") {
      localStorage.setItem("locale", newLocale);
    }
  };

  // Initialize locale on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("locale") as Locale | null;
      if (!saved) {
        const detected = detectLocale();
        setLocale(detected);
        localStorage.setItem("locale", detected);
      }
    }
  }, []);

  return {
    locale,
    t,
    changeLocale,
  };
}
