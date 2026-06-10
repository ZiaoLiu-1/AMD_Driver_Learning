/* ============================================================
   i18n — react-i18next initialization
   ============================================================ */

import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import zh from "@/locales/zh.json";
import en from "@/locales/en.json";

const resources = {
  zh: { translation: zh },
  en: { translation: en },
};

/**
 * Resolve the language for the very first render, before React mounts:
 * URL prefix (/zh, /en) wins, then the stored preference, then zh.
 * Resolving here (instead of during LocaleRouter's render) keeps the first
 * paint localized without firing languageChanged while React is rendering.
 */
function detectInitialLocale(): "zh" | "en" {
  if (typeof window === "undefined") return "zh";
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  const pathname = window.location.pathname;
  const path = pathname.startsWith(base) ? pathname.slice(base.length) : pathname;
  if (path === "/en" || path.startsWith("/en/")) return "en";
  if (path === "/zh" || path.startsWith("/zh/")) return "zh";
  if (typeof localStorage !== "undefined") {
    const stored = localStorage.getItem("locale");
    if (stored === "en" || stored === "zh") return stored;
  }
  return "zh";
}

i18n.use(initReactI18next).init({
  resources,
  lng: detectInitialLocale(),
  fallbackLng: "zh",
  interpolation: {
    escapeValue: false,
  },
});

export function changeLanguage(locale: "zh" | "en") {
  // i18next emits languageChanged (re-rendering every useTranslation
  // subscriber) even when the language is unchanged — skip those no-ops.
  if (i18n.language === locale) return;
  i18n.changeLanguage(locale);
}

export default i18n;
