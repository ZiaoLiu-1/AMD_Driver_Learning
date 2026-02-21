import { useLocale } from "@/contexts/LocaleContext";

/**
 * Returns a switchLocale callback that:
 * 1. Saves the new locale to localStorage (persists preference)
 * 2. Navigates to the equivalent page in the other language
 *    e.g. /zh/module/intro → /en/module/intro
 *
 * Uses window.location.href for a full page reload so the
 * wouter nested-router context is rebuilt correctly for the
 * new locale prefix.
 */
export function useSwitchLocale() {
  const { locale, setLocale } = useLocale();

  const switchLocale = () => {
    const newLocale = locale === "zh" ? "en" : "zh";
    // Persist before navigation so LocaleRedirect picks it up
    setLocale(newLocale);
    const currentPath = window.location.pathname;
    // Replace /zh or /en prefix; fall back to /<newLocale> if not found
    const withoutPrefix = currentPath.replace(/^\/(zh|en)(\/|$)/, "/");
    const newPath = `/${newLocale}${withoutPrefix === "/" ? "" : withoutPrefix}`;
    window.location.href = window.location.origin + newPath;
  };

  return { switchLocale, locale };
}
