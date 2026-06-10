import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Search } from "lucide-react";
import { SearchModal, useSearchShortcut } from "./SearchModal";

/**
 * Global search entry point: ⌘K shortcut plus the mobile floating button.
 * Loaded lazily from App so the search UI (dialog, framer-motion) stays out
 * of the entry chunk.
 */
export default function GlobalSearch() {
  const [searchOpen, setSearchOpen] = useState(false);
  useSearchShortcut(setSearchOpen);
  const { t } = useTranslation();

  return (
    <>
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
      <button
        onClick={() => setSearchOpen(true)}
        className="fixed bottom-5 right-5 z-50 flex items-center gap-2 px-3 py-2 rounded-full border border-border/60 bg-background shadow-lg text-xs text-muted-foreground/60 hover:text-foreground hover:border-border transition-colors sm:hidden"
        aria-label={t("search.button") || "Search"}>
        <Search className="w-3.5 h-3.5" aria-hidden="true" />
        {t("search.button")}
      </button>
    </>
  );
}
