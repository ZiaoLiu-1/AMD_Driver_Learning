/* ============================================================
   Code Lab — lightweight C/C++ code editor
   A transparent <textarea> overlaid on a syntax-highlighted
   <pre>. No external editor dependency: highlighting is a
   small hand-rolled tokenizer that only affects colors, never
   the text itself. Scroll position is mirrored from the
   textarea (the real scroller) to the highlight layer.
   ============================================================ */
import { useMemo, useRef } from "react";

interface CodeEditorProps {
  value: string;
  onChange: (next: string) => void;
  /** Fired on Ctrl/Cmd+Enter. */
  onRun?: () => void;
  ariaLabel: string;
  readOnly?: boolean;
  minHeightClassName?: string;
}

const KEYWORDS = new Set([
  "if", "else", "for", "while", "do", "switch", "case", "default", "break",
  "continue", "return", "goto", "sizeof", "typedef", "static", "extern",
  "const", "volatile", "inline", "register", "restrict", "enum", "union",
  "struct", "class", "public", "private", "protected", "virtual", "override",
  "final", "new", "delete", "this", "template", "typename", "namespace",
  "using", "operator", "friend", "explicit", "constexpr", "noexcept",
  "static_assert", "static_cast", "reinterpret_cast", "const_cast",
  "dynamic_cast", "try", "catch", "throw", "true", "false", "nullptr",
  "NULL", "auto", "decltype", "mutable",
]);

const TYPES = new Set([
  "void", "char", "short", "int", "long", "float", "double", "signed",
  "unsigned", "bool", "size_t", "ssize_t", "ptrdiff_t", "intptr_t",
  "uintptr_t", "int8_t", "int16_t", "int32_t", "int64_t", "uint8_t",
  "uint16_t", "uint32_t", "uint64_t", "u8", "u16", "u32", "u64", "s8",
  "s16", "s32", "s64", "wchar_t", "FILE",
]);

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

const TOKEN_RE =
  /(\/\*[\s\S]*?(?:\*\/|$))|(\/\/[^\n]*)|(^[ \t]*#[^\n]*)|("(?:[^"\\\n]|\\.)*"?|'(?:[^'\\\n]|\\.)*'?)|(\b0[xX][0-9a-fA-F]+\b|\b\d+(?:\.\d+)?(?:[uUlLfF]*)\b)|([A-Za-z_][A-Za-z0-9_]*)/gm;

/** Tokenize C/C++ source into HTML with color classes. Purely cosmetic. */
export function highlightC(source: string): string {
  let out = "";
  let last = 0;
  TOKEN_RE.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = TOKEN_RE.exec(source)) !== null) {
    out += escapeHtml(source.slice(last, m.index));
    const [full, block, line, pre, str, num, ident] = m;
    if (block || line) out += `<span class="tok-c">${escapeHtml(full)}</span>`;
    else if (pre) out += `<span class="tok-p">${escapeHtml(full)}</span>`;
    else if (str) out += `<span class="tok-s">${escapeHtml(full)}</span>`;
    else if (num) out += `<span class="tok-n">${escapeHtml(full)}</span>`;
    else if (ident) {
      if (KEYWORDS.has(ident)) out += `<span class="tok-k">${escapeHtml(full)}</span>`;
      else if (TYPES.has(ident)) out += `<span class="tok-t">${escapeHtml(full)}</span>`;
      else out += escapeHtml(full);
    } else out += escapeHtml(full);
    last = m.index + full.length;
  }
  out += escapeHtml(source.slice(last));
  return out;
}

export function CodeEditor({
  value,
  onChange,
  onRun,
  ariaLabel,
  readOnly = false,
  minHeightClassName = "min-h-[360px]",
}: CodeEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const highlightRef = useRef<HTMLPreElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);
  /** WCAG 2.1.2 escape hatch: after Escape, the next Tab moves focus
   *  instead of indenting. Shift+Tab always moves focus backwards. */
  const tabEscapedRef = useRef(false);

  const highlighted = useMemo(() => highlightC(value) + "\n", [value]);
  const lineCount = useMemo(() => value.split("\n").length, [value]);

  const syncScroll = () => {
    const ta = textareaRef.current;
    if (!ta) return;
    if (highlightRef.current) {
      highlightRef.current.scrollTop = ta.scrollTop;
      highlightRef.current.scrollLeft = ta.scrollLeft;
    }
    if (gutterRef.current) gutterRef.current.scrollTop = ta.scrollTop;
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      onRun?.();
      return;
    }
    if (e.key === "Escape") {
      // Arm the keyboard escape hatch: the next Tab leaves the editor.
      tabEscapedRef.current = true;
      return;
    }
    if (e.key === "Tab") {
      // Never trap keyboard users (WCAG 2.1.2): Shift+Tab always moves
      // focus backwards, and Tab right after Escape moves focus forward.
      if (e.shiftKey || tabEscapedRef.current) {
        tabEscapedRef.current = false;
        return; // let the browser move focus
      }
      e.preventDefault();
      const ta = e.currentTarget;
      const { selectionStart, selectionEnd } = ta;
      const next = value.slice(0, selectionStart) + "    " + value.slice(selectionEnd);
      onChange(next);
      requestAnimationFrame(() => {
        ta.selectionStart = ta.selectionEnd = selectionStart + 4;
      });
      return;
    }
    tabEscapedRef.current = false;
  };

  return (
    <div
      className={`cl-editor relative flex overflow-hidden rounded-xl border border-border/60 bg-card font-mono text-[13px] leading-[1.6] transition-shadow focus-within:border-primary/70 focus-within:ring-2 focus-within:ring-primary/60 ${minHeightClassName}`}
    >
      {/* line-number gutter */}
      <div
        ref={gutterRef}
        aria-hidden="true"
        className="w-10 shrink-0 select-none overflow-hidden border-r border-border/40 bg-muted/40 py-3 text-right"
      >
        {Array.from({ length: lineCount }, (_, i) => (
          <div key={i} className="pr-2 text-[11px] leading-[20.8px] text-foreground/70">
            {i + 1}
          </div>
        ))}
        <div className="h-16" />
      </div>

      {/* highlight layer + input layer */}
      <div className="relative min-w-0 flex-1">
        <pre
          ref={highlightRef}
          aria-hidden="true"
          className="cl-code pointer-events-none absolute inset-0 overflow-hidden whitespace-pre p-3 font-mono text-[13px] leading-[20.8px] text-foreground/90"
          dangerouslySetInnerHTML={{ __html: highlighted }}
        />
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onScroll={syncScroll}
          onKeyDown={handleKeyDown}
          onBlur={() => {
            tabEscapedRef.current = false;
          }}
          readOnly={readOnly}
          aria-label={ariaLabel}
          spellCheck={false}
          autoCapitalize="off"
          autoComplete="off"
          autoCorrect="off"
          wrap="off"
          className="absolute inset-0 h-full w-full resize-none overflow-auto whitespace-pre bg-transparent p-3 font-mono text-[13px] leading-[20.8px] text-transparent caret-primary outline-none selection:bg-primary/25"
        />
      </div>
    </div>
  );
}
