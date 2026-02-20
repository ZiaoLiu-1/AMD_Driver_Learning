/* ============================================================
   LocaleContext — language preference and URL base path
   Used for /zh/ and /en/ routing
   ============================================================ */

import React, { createContext, useContext, useCallback } from "react";

export type Locale = "zh" | "en";

interface LocaleContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  /** Base path including locale, e.g. "/zh" or "/en" */
  basePath: string;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

interface LocaleProviderProps {
  children: React.ReactNode;
  locale: Locale;
  onLocaleChange?: (locale: Locale) => void;
}

export function LocaleProvider({
  children,
  locale,
  onLocaleChange,
}: LocaleProviderProps) {
  const setLocale = useCallback(
    (newLocale: Locale) => {
      onLocaleChange?.(newLocale);
      if (typeof localStorage !== "undefined") {
        localStorage.setItem("locale", newLocale);
      }
    },
    [onLocaleChange]
  );

  const basePath = locale === "en" ? "/en" : "/zh";

  return (
    <LocaleContext.Provider value={{ locale, setLocale, basePath }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error("useLocale must be used within LocaleProvider");
  }
  return context;
}
