// ============================================================
// Standalone Glossary Page — /glossary
// ============================================================
import { useState, useEffect, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Link, useSearch, useLocation } from "wouter";
import { useTheme } from "@/contexts/ThemeContext";
import { useLocale } from "@/contexts/LocaleContext";
import { getCurriculum, getGlossaryByModule } from "@/data/curriculum_index";
import type { GlossaryTerm } from "@/data/curriculum";
import { useSearchHighlight } from "@/lib/highlight";
import { ArrowLeft, Search, Sun, Moon, ChevronRight, X, Languages } from "lucide-react";

type Category = GlossaryTerm["category"];
const categoryKeys: Record<Category, string> = {
  kernel: "glossary.categoryKernel",
  hardware: "glossary.categoryHardware",
  graphics: "glossary.categoryGraphics",
  compute: "glossary.categoryCompute",
  toolchain: "glossary.categoryToolchain",
  general: "glossary.categoryGeneral",
};
const categoryColors: Record<Category, { color: string; bg: string }> = {
  kernel:    { color: "oklch(0.70 0.15 200)", bg: "oklch(0.55 0.18 200 / 0.12)" },
  hardware:  { color: "oklch(0.75 0.18 35)",  bg: "oklch(0.62 0.22 35 / 0.12)"  },
  graphics:  { color: "oklch(0.72 0.18 290)", bg: "oklch(0.55 0.18 290 / 0.12)" },
  compute:   { color: "oklch(0.70 0.18 145)", bg: "oklch(0.55 0.18 145 / 0.12)" },
  toolchain: { color: "oklch(0.72 0.15 60)",  bg: "oklch(0.55 0.15 60 / 0.12)"  },
  general:   { color: "oklch(0.65 0.01 240)", bg: "oklch(0.55 0.01 240 / 0.12)" },
};

interface FlatTerm extends GlossaryTerm {
  moduleId: string;
  moduleTitle: string;
  moduleIcon: string;
}

// Flatten all glossary terms across modules
function buildTermList(
  glossaryByModule: Record<string, GlossaryTerm[]>,
  curriculum: { id: string; title: string; icon?: string }[]
): FlatTerm[] {
  const terms: FlatTerm[] = [];
  for (const [moduleId, list] of Object.entries(glossaryByModule)) {
    const mod = curriculum.find(m => m.id === moduleId);
    for (const t of list) {
      terms.push({
        ...t,
        moduleId,
        moduleTitle: mod?.title ?? moduleId,
        moduleIcon: mod?.icon ?? "📖",
      });
    }
  }
  const seen = new Set<string>();
  return terms.filter(t => {
    if (seen.has(t.abbr)) return false;
    seen.add(t.abbr);
    return true;
  });
}

export default function GlossaryPage() {
  const { theme, toggleTheme } = useTheme();
  const { locale, setLocale } = useLocale();
  const [, navigate] = useLocation();
  const { t } = useTranslation();
  const searchString = useSearch();

  const curriculum = getCurriculum(locale);
  const glossaryByModule = getGlossaryByModule(locale);
  const allTerms = useMemo(
    () => buildTermList(glossaryByModule, curriculum),
    [glossaryByModule, curriculum]
  );
  const params = new URLSearchParams(searchString);
  const initialQ = params.get("q") ?? "";

  const [query, setQuery] = useState(initialQ);
  const [activeCategory, setActiveCategory] = useState<Category | "all">("all");
  const contentRef = useRef<HTMLDivElement>(null);
  useSearchHighlight(contentRef);

  const switchLocale = () => {
    const newLocale = locale === "zh" ? "en" : "zh";
    setLocale(newLocale);
    const path = window.location.pathname;
    const newPath = path.replace(/^\/(zh|en)/, `/${newLocale}`) || `/${newLocale}`;
    window.location.pathname = newPath;
  };

  const categoryConfig = useMemo(() => ({
    kernel:    { ...categoryColors.kernel, label: t("glossary.categoryKernel") },
    hardware:  { ...categoryColors.hardware, label: t("glossary.categoryHardware") },
    graphics:  { ...categoryColors.graphics, label: t("glossary.categoryGraphics") },
    compute:   { ...categoryColors.compute, label: t("glossary.categoryCompute") },
    toolchain: { ...categoryColors.toolchain, label: t("glossary.categoryToolchain") },
    general:   { ...categoryColors.general, label: t("glossary.categoryGeneral") },
  }), [t]);

  const filtered = allTerms.filter(t => {
    const catMatch = activeCategory === "all" || t.category === activeCategory;
    if (!catMatch) return false;
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      t.abbr.toLowerCase().includes(q) ||
      t.fullEn.toLowerCase().includes(q) ||
      t.zhName.includes(q) ||
      t.description.includes(q)
    );
  });

  // Auto-scroll if deep-linked
  useEffect(() => {
    if (initialQ) {
      setTimeout(() => {
        const el = document.getElementById(`term-${initialQ}`);
        el?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 100);
    }
  }, [initialQ]);

  const categoryCounts = Object.keys(categoryConfig).reduce<Record<string, number>>((acc, cat) => {
    acc[cat] = allTerms.filter(t => t.category === cat).length;
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-background">
      {/* Top Bar */}
      <div className="sticky top-0 z-30 border-b border-border/50 backdrop-blur-md bg-background/95">
        <div className="max-w-5xl mx-auto px-4 md:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-muted-foreground/60">
            <Link href="/"><span className="hover:text-foreground transition-colors cursor-pointer flex items-center gap-1"><ArrowLeft className="w-3 h-3" /> {t("nav.home")}</span></Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-foreground/80 font-medium">{t("glossary.title")}</span>
          </div>
          <button onClick={switchLocale} className="flex items-center gap-1 px-2 py-1 rounded text-xs border border-border/50 hover:border-border transition-colors" title={locale === "zh" ? "Switch to English" : "切换到中文"}>
            <Languages className="w-3.5 h-3.5" />
            {locale === "zh" ? "En" : "中"}
          </button>
          <button onClick={toggleTheme} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div ref={contentRef} className="max-w-5xl mx-auto px-4 md:px-8 py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">{t("glossary.pageTitle")}</h1>
          <p className="text-muted-foreground/75 text-sm">
            {t("glossary.pageSubtitle", { count: allTerms.length })}
          </p>
        </div>

        {/* Search + Filter bar */}
        <div className="sticky top-[52px] z-20 bg-background/95 backdrop-blur-sm pb-4 pt-1">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" />
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder={t("glossary.searchPlaceholder")}
                className="w-full pl-9 pr-9 py-2.5 text-sm rounded-xl border border-border/60 bg-card text-foreground placeholder:text-muted-foreground/40 outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all"
              />
              {query && (
                <button onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/40 hover:text-muted-foreground">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            {/* Category pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 flex-shrink-0">
              <button
                onClick={() => setActiveCategory("all")}
                className={`text-xs px-3 py-1.5 rounded-full font-medium whitespace-nowrap transition-all border ${
                  activeCategory === "all" ? "border-primary/50 bg-primary/10 text-primary" : "border-border/50 text-muted-foreground/60 hover:border-border"
                }`}>
                {t("glossary.all")} ({allTerms.length})
              </button>
              {(Object.entries(categoryConfig) as [Category, typeof categoryConfig[Category]][]).map(([cat, cfg]) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`text-xs px-3 py-1.5 rounded-full font-medium whitespace-nowrap transition-all border ${
                    activeCategory === cat ? "border-current" : "border-border/50 hover:border-border"
                  }`}
                  style={activeCategory === cat ? { color: cfg.color, background: cfg.bg, borderColor: cfg.color } : { color: "var(--muted-foreground)" }}>
                  {cfg.label} ({categoryCounts[cat] ?? 0})
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results count */}
        {query && (
          <p className="text-xs text-muted-foreground/50 mb-4">{t("glossary.foundCount", { count: filtered.length })}</p>
        )}

        {/* Terms grid */}
        {filtered.length === 0 ? (
          <div className="py-20 text-center text-muted-foreground/40">
            <p className="text-sm">{t("glossary.noResults", { query })}</p>
          </div>
        ) : (
          <div className="grid gap-2.5">
            {filtered.map((term) => {
              const cfg = categoryConfig[term.category];
              return (
                <div
                  key={term.abbr}
                  id={`term-${term.abbr}`}
                  className="flex items-start gap-4 p-4 rounded-xl border border-border/40 hover:border-border/70 transition-all bg-card/50 hover:bg-card group">
                  {/* Abbr badge */}
                  <div className="flex-shrink-0 w-16 text-center mt-0.5">
                    <span className="inline-block font-bold font-mono text-sm px-2 py-1 rounded-lg"
                      style={{ background: cfg.bg, color: cfg.color }}>
                      {term.abbr}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 flex-wrap mb-1">
                      <span className="font-semibold text-sm text-foreground/90">{term.fullEn}</span>
                      <span className="text-xs text-muted-foreground/50">·</span>
                      <span className="text-sm font-medium" style={{ color: cfg.color }}>{term.zhName}</span>
                    </div>
                    <p className="text-xs text-muted-foreground/70 leading-relaxed">{term.description}</p>
                  </div>

                  {/* Meta */}
                  <div className="flex-shrink-0 text-right hidden sm:block">
                    <Link href={`/module/${term.moduleId}`}>
                      <div className="text-[10px] text-muted-foreground/40 hover:text-primary transition-colors cursor-pointer flex items-center gap-1 justify-end">
                        <span>{term.moduleIcon}</span>
                        <span className="max-w-[80px] truncate">{term.moduleTitle}</span>
                      </div>
                    </Link>
                    <span className="text-[10px] px-1.5 py-0.5 rounded font-medium mt-1 inline-block"
                      style={{ background: cfg.bg, color: cfg.color }}>
                      {cfg.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
