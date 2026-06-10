import { useState, useEffect, useRef, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "wouter";
import { Search, X, ArrowRight, BookOpen, MessageSquare, Layers } from "lucide-react";
import { useLocale } from "@/contexts/LocaleContext";
import { searchContentBilingual, type SearchResult } from "@/lib/searchIndex";
import { highlightText } from "@/lib/highlight";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";

const kindIcon = {
  module: Layers,
  lesson: BookOpen,
  glossary: MessageSquare,
};

export function SearchModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const { locale } = useLocale();
  const { t } = useTranslation();
  const [, navigate] = useLocation();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const kindLabel = {
    module: t("search.module"),
    lesson: t("search.lesson"),
    glossary: t("search.glossary"),
  };

  useEffect(() => {
    if (open) {
      setQuery("");
      setResults([]);
      setActiveIdx(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    let cancelled = false;
    searchContentBilingual(query, 16).then(r => {
      if (cancelled) return;
      setResults(r);
      setActiveIdx(0);
    });
    return () => { cancelled = true; };
  }, [query]);

  const go = useCallback((result: SearchResult) => {
    const href = result.href;
    const targetLocale = result.locale;
    const sep = href.includes("?") ? "&" : "?";
    const fullHref = `${href}${query.trim() ? `${sep}highlight=${encodeURIComponent(query.trim())}` : ""}`;
    const currentLocale = locale;
    if (targetLocale === currentLocale) {
      navigate(fullHref);
    } else {
      window.location.href = `${window.location.origin}/${targetLocale}${fullHref}`;
    }
    onClose();
  }, [navigate, onClose, query, locale]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      setActiveIdx(i => Math.min(i + 1, results.length - 1));
      e.preventDefault();
    }
    if (e.key === "ArrowUp") {
      setActiveIdx(i => Math.max(i - 1, 0));
      e.preventDefault();
    }
    if (e.key === "Enter" && results[activeIdx]) {
      go(results[activeIdx]);
    }
  }, [results, activeIdx, go]);

  useEffect(() => {
    const activeEl = listRef.current?.querySelector(`[data-idx="${activeIdx}"]`);
    activeEl?.scrollIntoView({ block: "nearest" });
  }, [activeIdx]);

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose(); }}>
      <DialogContent
        showCloseButton={false}
        className="p-0 gap-0 max-w-2xl top-[20%] translate-y-0 rounded-2xl overflow-hidden"
        onKeyDown={handleKeyDown}
      >
        <DialogTitle className="sr-only">{t("search.title") || "Search"}</DialogTitle>

        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border/60">
          <Search className="w-4 h-4 text-muted-foreground/60 flex-shrink-0" aria-hidden="true" />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder={t("search.placeholder")}
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/40 outline-none"
            aria-label={t("search.placeholder") || "Search"}
            aria-autocomplete="list"
            aria-controls="search-results"
            aria-activedescendant={results.length > 0 ? `search-result-${activeIdx}` : undefined}
            role="combobox"
            aria-expanded={results.length > 0}
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center -mr-2 text-muted-foreground/40 hover:text-muted-foreground transition-colors"
              aria-label={t("search.clear") || "Clear search"}
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex text-[10px] font-mono px-1.5 py-0.5 rounded border border-border/60 text-muted-foreground/40">Esc</kbd>
        </div>

        {/* Results */}
        <div ref={listRef} className="overflow-y-auto" style={{ maxHeight: "calc(70vh - 56px)" }}>
          {!query && (
            <div className="py-12 text-center text-sm text-muted-foreground/40">
              <Search className="w-8 h-8 mx-auto mb-3 opacity-20" aria-hidden="true" />
              <p>{t("search.hint1")}</p>
              <p className="text-xs mt-1 opacity-60">{t("search.hint2")}</p>
            </div>
          )}
          {query && results.length === 0 && (
            <div className="py-12 text-center text-sm text-muted-foreground/40">
              {t("search.noResults", { query })}
            </div>
          )}
          {results.length > 0 && (
            <div className="py-1 relative isolate" role="listbox" id="search-results" aria-label={t("search.results") || "Search results"}>
              {results.map((r, i) => {
                const KindIcon = kindIcon[r.kind];
                const isActive = i === activeIdx;
                return (
                  <button
                    key={`${r.href}-${i}`}
                    id={`search-result-${i}`}
                    data-idx={i}
                    role="option"
                    aria-selected={isActive}
                    onMouseEnter={() => setActiveIdx(i)}
                    onClick={() => go(r)}
                    className="w-full text-left flex items-center gap-3 px-4 py-3 relative group focus:outline-none"
                  >
                    {isActive && (
                      <motion.div
                        layoutId="search-active-highlight"
                        className="absolute inset-0 bg-primary/8 border-l-2 border-primary -z-10"
                        transition={{ type: "spring", stiffness: 500, damping: 40 }}
                      />
                    )}
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-base transition-colors
                      ${r.kind === 'module' ? 'bg-primary/10 group-hover:bg-primary/20' : r.kind === 'glossary' ? 'bg-chart-4/10 group-hover:bg-chart-4/20' : 'bg-muted group-hover:bg-muted/80'}`}>
                      {r.icon.length <= 2 && r.icon !== r.icon.charCodeAt(0).toString() ? (
                        <span>{r.icon}</span>
                      ) : (
                        <KindIcon className={`w-4 h-4 ${r.kind === 'module' ? 'text-primary' : r.kind === 'glossary' ? 'text-chart-4' : 'text-muted-foreground/60'
                          }`} />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-foreground/90 truncate">{highlightText(r.title, query.trim())}</div>
                      <div className="text-xs text-muted-foreground/55 truncate mt-0.5">
                        {highlightText(r.subtitle, query.trim())}
                        {r.locale !== locale && (
                          <span className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded bg-muted/60 text-muted-foreground/70">
                            {r.locale === "zh" ? "中" : "En"}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${r.kind === 'module' ? 'bg-primary/10 text-primary' :
                          r.kind === 'glossary' ? 'bg-chart-4/10 text-chart-4' :
                            'bg-muted text-muted-foreground/60'
                        }`}>{kindLabel[r.kind]}</span>
                      <ArrowRight className={`w-3 h-3 transition-colors ${isActive ? "text-primary/60" : "text-transparent"}`} aria-hidden="true" />
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Footer hint */}
          {results.length > 0 && (
            <div className="px-4 py-2 border-t border-border/40 flex items-center gap-4 text-[10px] text-muted-foreground/30">
              <span><kbd className="font-mono">↑↓</kbd> {t("search.navLabel")}</span>
              <span><kbd className="font-mono">Enter</kbd> {t("search.enterLabel")}</span>
              <span><kbd className="font-mono">Esc</kbd> {t("search.escapeLabel")}</span>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function useSearchShortcut(setOpen: (v: boolean) => void) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [setOpen]);
}
