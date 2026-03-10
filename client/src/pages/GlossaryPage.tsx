// ============================================================
// Standalone Glossary Page — /glossary
// ============================================================
import { useState, useEffect, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useSearch } from "wouter";
import { useLocale } from "@/contexts/LocaleContext";
import { getCurriculum, getGlossaryByModule } from "@/data/curriculum_index";
import type { GlossaryTerm } from "@/data/curriculum";
import { useSearchHighlight } from "@/lib/highlight";
import { Search, X } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";

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
  kernel: { color: "oklch(0.70 0.15 200)", bg: "oklch(0.55 0.18 200 / 0.12)" },
  hardware: { color: "oklch(0.75 0.18 35)", bg: "oklch(0.62 0.22 35 / 0.12)" },
  graphics: { color: "oklch(0.72 0.18 290)", bg: "oklch(0.55 0.18 290 / 0.12)" },
  compute: { color: "oklch(0.70 0.18 145)", bg: "oklch(0.55 0.18 145 / 0.12)" },
  toolchain: { color: "oklch(0.72 0.15 60)", bg: "oklch(0.55 0.15 60 / 0.12)" },
  general: { color: "oklch(0.65 0.01 240)", bg: "oklch(0.55 0.01 240 / 0.12)" },
};

interface FlatTerm extends GlossaryTerm {
  moduleId: string;
}

// Flatten all glossary terms across modules
function buildTermList(
  glossaryByModule: Record<string, GlossaryTerm[]>,
  _curriculum: { id: string; title: string; icon?: string }[]
): FlatTerm[] {
  const terms: FlatTerm[] = [];
  for (const [moduleId, list] of Object.entries(glossaryByModule)) {
    for (const t of list) {
      terms.push({ ...t, moduleId });
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
  const { locale } = useLocale();
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
  const contentRef = useRef<HTMLElement>(null);
  useSearchHighlight(contentRef);

  const categoryConfig = useMemo(() => ({
    kernel: { ...categoryColors.kernel, label: t("glossary.categoryKernel") },
    hardware: { ...categoryColors.hardware, label: t("glossary.categoryHardware") },
    graphics: { ...categoryColors.graphics, label: t("glossary.categoryGraphics") },
    compute: { ...categoryColors.compute, label: t("glossary.categoryCompute") },
    toolchain: { ...categoryColors.toolchain, label: t("glossary.categoryToolchain") },
    general: { ...categoryColors.general, label: t("glossary.categoryGeneral") },
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
    <PageShell
      backHref="/"
      backLabel={t("nav.home")}
      currentLabel={t("glossary.title")}
      contentRef={contentRef}
      containerWidthClassName="max-w-5xl"
      mainClassName="py-10"
    >
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
                className="w-full pl-9 pr-12 py-2.5 text-sm rounded-xl border border-border/60 bg-card text-foreground placeholder:text-muted-foreground/40 outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-[border-color,box-shadow]"
              />
              {query && (
                <button onClick={() => setQuery("")} className="absolute right-1 top-1/2 -translate-y-1/2 min-w-[44px] min-h-[44px] flex items-center justify-center text-muted-foreground/40 hover:text-muted-foreground" aria-label={t("glossary.clearSearch") || "Clear search"}>
                  <X className="w-4 h-4" aria-hidden="true" />
                </button>
              )}
            </div>
            {/* Category pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 flex-shrink-0">
              <button
                onClick={() => setActiveCategory("all")}
                className={`text-xs px-3 py-1.5 rounded-full font-medium whitespace-nowrap transition-colors border ${activeCategory === "all" ? "border-primary/50 bg-primary/10 text-primary" : "border-border/50 text-muted-foreground/60 hover:border-border"
                  }`}>
                {t("glossary.all")} ({allTerms.length})
              </button>
              {(Object.entries(categoryConfig) as [Category, typeof categoryConfig[Category]][]).map(([cat, cfg]) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`text-xs px-3 py-1.5 rounded-full font-medium whitespace-nowrap transition-colors border ${activeCategory === cat ? "border-current" : "border-border/50 hover:border-border"
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
          <div className="rounded-2xl border border-border/50 bg-card/50 px-6 py-10 sm:px-8 sm:py-12">
            <div className="mx-auto flex max-w-xl flex-col items-center text-center">
              <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary">
                <Search className="h-6 w-6" aria-hidden="true" />
              </div>
              <h2 className="mb-2 text-xl font-semibold text-foreground">
                {t("glossary.emptyTitle")}
              </h2>
              <p className="mb-2 text-sm leading-relaxed text-muted-foreground/80">
                {t("glossary.noResults", { query })}
              </p>
              <p className="mb-6 text-xs leading-relaxed text-muted-foreground/60 sm:text-sm">
                {t("glossary.emptyDesc")}
              </p>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={() => {
                    setQuery("");
                    setActiveCategory("all");
                  }}
                  className="inline-flex min-h-[44px] items-center justify-center rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                >
                  {t("glossary.emptyReset")}
                </button>
                <button
                  onClick={() => {
                    setQuery("");
                    setActiveCategory("kernel");
                  }}
                  className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-border/50 px-5 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted/50"
                >
                  {t("glossary.emptyBrowseKernel")}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid gap-2">
            {filtered.map((term) => {
              const cfg = categoryConfig[term.category];
              return (
                <div
                  key={term.abbr}
                  id={`term-${term.abbr}`}
                  className="flex items-start gap-4 p-3.5 rounded-xl border border-border/40 hover:border-border/70 transition-colors bg-card/50 hover:bg-card">
                  <div className="flex-shrink-0 w-16 text-center mt-0.5">
                    <span className="inline-block font-bold font-mono text-sm px-2 py-1 rounded-lg"
                      style={{ background: cfg.bg, color: cfg.color }}>
                      {term.abbr}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 flex-wrap mb-0.5">
                      <span className="font-semibold text-sm text-foreground/90">{term.fullEn}</span>
                      <span className="text-xs text-muted-foreground/50">·</span>
                      <span className="text-sm font-medium" style={{ color: cfg.color }}>{term.zhName}</span>
                    </div>
                    <p className="text-xs text-muted-foreground/70 leading-relaxed">{term.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
    </PageShell>
  );
}
