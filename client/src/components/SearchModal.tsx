// ============================================================
// Global Search Modal — opens on Cmd+K / Ctrl+K
// ============================================================
import { useState, useEffect, useRef, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "wouter";
import { Search, X, ArrowRight, BookOpen, MessageSquare, Layers } from "lucide-react";
import { useLocale } from "@/contexts/LocaleContext";
import { searchContentBilingual, type SearchResult } from "@/lib/searchIndex";
import { highlightText } from "@/lib/highlight";

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
    const r = searchContentBilingual(query, 16);
    setResults(r);
    setActiveIdx(0);
  }, [query]);

  const go = useCallback((result: SearchResult) => {
    const href = result.href;
    const targetLocale = result.locale;
    const sep = href.includes("?") ? "&" : "?";
    const fullHref = `${href}${query.trim() ? `${sep}highlight=${encodeURIComponent(query.trim())}` : ""}`;
    // Navigate to target locale path (may need full path if switching locales)
    const currentLocale = locale;
    if (targetLocale === currentLocale) {
      navigate(fullHref);
    } else {
      // Cross-locale: full navigation to switch locale
      window.location.href = `${window.location.origin}/${targetLocale}${fullHref}`;
    }
    onClose();
  }, [navigate, onClose, query, locale]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!open) return;
      if (e.key === "Escape") { onClose(); return; }
      if (e.key === "ArrowDown") { setActiveIdx(i => Math.min(i + 1, results.length - 1)); e.preventDefault(); }
      if (e.key === "ArrowUp") { setActiveIdx(i => Math.max(i - 1, 0)); e.preventDefault(); }
      if (e.key === "Enter" && results[activeIdx]) { go(results[activeIdx]); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, results, activeIdx, go, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-start justify-center pt-[10vh] px-4"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="relative w-full max-w-2xl rounded-2xl border border-border shadow-2xl overflow-hidden bg-background"
        style={{ maxHeight: "70vh" }}>

        {/* Input */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border/60">
          <Search className="w-4 h-4 text-muted-foreground/60 flex-shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder={t("search.placeholder")}
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/40 outline-none"
          />
          {query && (
            <button onClick={() => setQuery("")} className="text-muted-foreground/40 hover:text-muted-foreground transition-colors">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex text-[10px] font-mono px-1.5 py-0.5 rounded border border-border/60 text-muted-foreground/40">Esc</kbd>
        </div>

        {/* Results */}
        <div className="overflow-y-auto" style={{ maxHeight: "calc(70vh - 56px)" }}>
          {!query && (
            <div className="py-12 text-center text-sm text-muted-foreground/40">
              <Search className="w-8 h-8 mx-auto mb-3 opacity-20" />
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
            <div className="py-1">
              {results.map((r, i) => {
                const KindIcon = kindIcon[r.kind];
                const isActive = i === activeIdx;
                return (
                  <button
                    key={`${r.href}-${i}`}
                    onMouseEnter={() => setActiveIdx(i)}
                    onClick={() => go(r)}
                    className={`w-full text-left flex items-center gap-3 px-4 py-3 transition-colors ${
                      isActive ? "bg-primary/8" : "hover:bg-muted/50"
                    }`}>
                    {/* Kind icon */}
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-base
                      ${r.kind === 'module' ? 'bg-primary/10' : r.kind === 'glossary' ? 'bg-purple-500/10' : 'bg-muted'}`}>
                      {r.icon.length <= 2 && r.icon !== r.icon.charCodeAt(0).toString() ? (
                        <span>{r.icon}</span>
                      ) : (
                        <KindIcon className={`w-4 h-4 ${
                          r.kind === 'module' ? 'text-primary' : r.kind === 'glossary' ? 'text-purple-500' : 'text-muted-foreground/60'
                        }`} />
                      )}
                    </div>

                    {/* Text */}
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

                    {/* Kind badge + arrow */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                        r.kind === 'module' ? 'bg-primary/10 text-primary' :
                        r.kind === 'glossary' ? 'bg-purple-500/10 text-purple-500' :
                        'bg-muted text-muted-foreground/60'
                      }`}>{kindLabel[r.kind]}</span>
                      {isActive && <ArrowRight className="w-3 h-3 text-muted-foreground/40" />}
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
      </div>
    </div>
  );
}

// Hook that opens search on Cmd+K
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
