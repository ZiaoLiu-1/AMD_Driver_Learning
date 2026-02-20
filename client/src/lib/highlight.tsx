// ============================================================
// Search highlight utility — wrap matching text and scroll to first match
// ============================================================
import { useEffect, useRef } from "react";

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Splits text by the search query (case-insensitive) and wraps matches in <mark>.
 * Returns React node(s) for rendering.
 */
export function highlightText(
  text: string,
  query: string | null | undefined
): React.ReactNode {
  if (!query || !query.trim()) return text;
  const parts = text.split(new RegExp(`(${escapeRegex(query)})`, "gi"));
  return parts.map((part, i) =>
    part.toLowerCase() === query.toLowerCase() ? (
      <mark key={i} className="search-highlight bg-yellow-300/60 dark:bg-yellow-500/40 rounded-sm px-0.5">
        {part}
      </mark>
    ) : (
      part
    )
  );
}

/**
 * Hook: reads ?highlight= from URL, applies DOM-based highlighting to contentRef,
 * and scrolls to first match. Use when content is complex (mixed React + dynamic).
 */
export function useSearchHighlight(contentRef: React.RefObject<HTMLElement | null>) {
  const searchString = typeof window !== "undefined" ? window.location.search : "";
  const params = new URLSearchParams(searchString);
  const highlight = params.get("highlight")?.trim() || null;

  useEffect(() => {
    if (!highlight || !contentRef.current) return;

    const container = contentRef.current;
    const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, null);

    const textNodes: { node: Text; text: string }[] = [];
    let n: Text | null;
    while ((n = walker.nextNode() as Text | null)) {
      if (n && n.textContent && n.textContent.toLowerCase().includes(highlight.toLowerCase())) {
        textNodes.push({ node: n, text: n.textContent });
      }
    }

    const replacements: { node: Text; replacement: HTMLElement }[] = [];
    for (const { node, text } of textNodes) {
      const regex = new RegExp(`(${escapeRegex(highlight)})`, "gi");
      const parts = text.split(regex);
      if (parts.length <= 1) continue;

      const span = document.createElement("span");
      span.setAttribute("data-highlight-wrapper", "true");
      for (let i = 0; i < parts.length; i++) {
        if (i % 2 === 1) {
          const mark = document.createElement("mark");
          mark.className = "search-highlight bg-yellow-300/60 dark:bg-yellow-500/40 rounded-sm px-0.5";
          mark.textContent = parts[i];
          span.appendChild(mark);
        } else {
          span.appendChild(document.createTextNode(parts[i]));
        }
      }
      replacements.push({ node, replacement: span });
    }

    for (const { node, replacement } of replacements) {
      node.parentNode?.replaceChild(replacement, node);
    }

    // Scroll to first highlight
    requestAnimationFrame(() => {
      const firstMark = container.querySelector(".search-highlight");
      firstMark?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }, [highlight, contentRef]);
}
