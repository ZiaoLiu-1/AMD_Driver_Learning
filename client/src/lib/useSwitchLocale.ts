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
    setLocale(newLocale);
    const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");
    const currentPath = window.location.pathname;
    const pathAfterBase = currentPath.startsWith(basePath)
      ? currentPath.slice(basePath.length)
      : currentPath;
    const withoutPrefix = pathAfterBase.replace(/^\/(zh|en)(\/|$)/, "/");
    const newPath = `${basePath}/${newLocale}${withoutPrefix === "/" ? "" : withoutPrefix}`;
    window.location.href = window.location.origin + newPath;
  };

  return { switchLocale, locale };
}
