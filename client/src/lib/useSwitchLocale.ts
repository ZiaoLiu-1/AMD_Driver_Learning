import { useLocale } from "@/contexts/LocaleContext";

/**
 * Returns a switchLocale callback that:
 * 1. Saves the new locale to localStorage (persists preference)
 * 2. Navigates to the equivalent page in the other language
 *
 * Works regardless of whether the app is at the domain root (/en/...)
 * or a subpath (/amd/en/..., /learn/en/..., etc.).
 */
export function useSwitchLocale() {
  const { locale, setLocale } = useLocale();

  const switchLocale = () => {
    const newLocale = locale === "zh" ? "en" : "zh";
    // Persist before navigation so LocaleRedirect picks it up on reload
    setLocale(newLocale);

    const currentPath = window.location.pathname;

    // Match the current locale as a standalone path segment anywhere in the URL
    // e.g.  /en           → /zh
    //        /en/module    → /zh/module
    //        /amd/en       → /amd/zh          (subpath deploy)
    //        /amd/en/module → /amd/zh/module  (subpath + deep link)
    const localeSegment = new RegExp(`(^|/)${locale}(/|$)`);

    if (localeSegment.test(currentPath)) {
      const newPath = currentPath.replace(localeSegment, `$1${newLocale}$2`);
      window.location.href = window.location.origin + newPath;
    } else {
      // Locale not found in current path — fall back to new locale root
      window.location.href = `${window.location.origin}/${newLocale}`;
    }
  };

  return { switchLocale, locale };
}
