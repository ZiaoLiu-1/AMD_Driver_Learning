/* ============================================================
   LocaleRedirect — redirects / to /zh or /en based on preference
   ============================================================ */

import { useEffect } from "react";
import { useLocation } from "wouter";

const STORAGE_KEY = "locale";

function getPreferredLocale(): "zh" | "en" {
  if (typeof localStorage !== "undefined") {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "en" || stored === "zh") return stored;
  }
  const browser = navigator.language?.toLowerCase() ?? "";
  if (browser.startsWith("zh")) return "zh";
  return "en";
}

export default function LocaleRedirect() {
  const [, navigate] = useLocation();
  useEffect(() => {
    const locale = getPreferredLocale();
    navigate(`/${locale}`, { replace: true });
  }, [navigate]);
  return null;
}
