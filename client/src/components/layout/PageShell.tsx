import { ArrowLeft, ChevronRight, Languages, Moon, Sun } from "lucide-react";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";

import { useTheme } from "@/contexts/ThemeContext";
import { useLocale } from "@/contexts/LocaleContext";
import { useSwitchLocale } from "@/lib/useSwitchLocale";
import { cn } from "@/lib/utils";

interface PageShellProps {
  backHref: string;
  backLabel: string;
  currentLabel: string;
  children: React.ReactNode;
  contentRef?: React.RefObject<HTMLElement | null>;
  containerWidthClassName?: string;
  headerMeta?: React.ReactNode;
  mainClassName?: string;
}

export function PageShell({
  backHref,
  backLabel,
  currentLabel,
  children,
  contentRef,
  containerWidthClassName = "max-w-4xl",
  headerMeta,
  mainClassName,
}: PageShellProps) {
  const { t } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const { locale } = useLocale();
  const { switchLocale } = useSwitchLocale();

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-30 border-b border-border/50 bg-background/95 backdrop-blur-md">
        <div
          className={cn(
            "mx-auto flex items-center justify-between px-4 py-1 md:px-8",
            containerWidthClassName
          )}
        >
          <div className="flex items-center gap-2 text-xs text-muted-foreground/60">
            <Link href={backHref}>
              <span className="flex min-h-[44px] items-center gap-1 transition-colors hover:text-foreground cursor-pointer">
                <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
                {backLabel}
              </span>
            </Link>
            <ChevronRight className="h-3 w-3" aria-hidden="true" />
            <span className="font-medium text-foreground/80">{currentLabel}</span>
          </div>

          <div className="flex items-center gap-1">
            {headerMeta}

            <button
              onClick={switchLocale}
              className="flex min-h-[44px] items-center justify-center gap-1 rounded border border-border/50 px-3 text-xs transition-colors hover:border-border"
              title={locale === "zh" ? "Switch to English" : "切换到中文"}
            >
              <Languages className="h-3.5 w-3.5" aria-hidden="true" />
              {locale === "zh" ? "En" : "中"}
            </button>

            <button
              onClick={toggleTheme}
              className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
              aria-label={
                theme === "dark"
                  ? t("nav.switchToLight") || "Switch to light theme"
                  : t("nav.switchToDark") || "Switch to dark theme"
              }
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Moon className="h-4 w-4" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      <main
        ref={contentRef}
        className={cn(
          "mx-auto px-4 py-8 md:px-8",
          containerWidthClassName,
          mainClassName
        )}
      >
        {children}
      </main>
    </div>
  );
}
