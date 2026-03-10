import { useState } from "react";
import { Check, Copy } from "lucide-react";

import { cn } from "@/lib/utils";

type CopyCodeBlockVariant = "default" | "terminal";

interface CopyCodeBlockProps {
  code: string;
  copiedLabel: string;
  copyLabel: string;
  language?: string;
  title?: string;
  annotations?: string[];
  annotationsLabel?: string;
  className?: string;
  codeClassName?: string;
  variant?: CopyCodeBlockVariant;
}

export function CopyCodeBlock({
  code,
  copiedLabel,
  copyLabel,
  language,
  title,
  annotations,
  annotationsLabel,
  className,
  codeClassName,
  variant = "default",
}: CopyCodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lines = code.split("\n");
  const isTerminal = variant === "terminal";

  return (
    <div
      className={cn(
        "group/code overflow-hidden rounded-xl border",
        isTerminal
          ? "border-terminal-border bg-terminal-bg"
          : "border-border/50 bg-card",
        className
      )}
    >
      <div
        className={cn(
          "flex items-center justify-between border-b px-4 py-2",
          isTerminal
            ? "border-terminal-border/50 bg-terminal-header"
            : "border-border/50 bg-muted/50"
        )}
      >
        <div className="flex min-w-0 items-center gap-2">
          {isTerminal && (
            <div className="flex gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full bg-terminal-dot" />
              <div className="h-2.5 w-2.5 rounded-full bg-terminal-dot" />
              <div className="h-2.5 w-2.5 rounded-full bg-terminal-dot" />
            </div>
          )}

          {title ? (
            <span
              className={cn(
                "truncate text-xs font-semibold",
                isTerminal ? "text-terminal-text" : "text-foreground/70"
              )}
            >
              {title}
            </span>
          ) : language ? (
            <span
              className={cn(
                "text-xs font-mono",
                isTerminal ? "text-terminal-text" : "text-muted-foreground/60"
              )}
            >
              {language}
            </span>
          ) : null}
        </div>

        <div className="flex items-center gap-2">
          {title && language && (
            <span
              className={cn(
                "text-[10px] font-mono",
                isTerminal ? "text-terminal-text" : "text-muted-foreground/50"
              )}
            >
              {language}
            </span>
          )}

          <button
            onClick={handleCopy}
            tabIndex={-1}
            className={cn(
              "flex items-center gap-1.5 text-xs transition-[color,opacity]",
              copied
                ? "opacity-100"
                : "opacity-0 group-hover/code:opacity-100 group-focus-within/code:opacity-100",
              isTerminal
                ? "text-terminal-text hover:text-terminal-text-bright"
                : "text-muted-foreground/60 hover:text-foreground"
            )}
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-success" aria-hidden="true" />
            ) : (
              <Copy className="h-3.5 w-3.5" aria-hidden="true" />
            )}
            {copied ? copiedLabel : copyLabel}
          </button>
        </div>
      </div>

      {isTerminal ? (
        <div className="overflow-x-auto p-4 text-sm font-mono leading-relaxed">
          {lines.map((line, index) => {
            const isComment = line.trim().startsWith("#");
            const isEmpty = line.trim() === "";

            if (isEmpty) {
              return <div key={index} className="h-4" />;
            }

            return (
              <div
                key={index}
                className={cn(
                  "whitespace-pre",
                  isComment ? "text-terminal-comment" : "text-terminal-text-bright"
                )}
              >
                {line}
              </div>
            );
          })}
        </div>
      ) : (
        <pre className={cn("overflow-x-auto p-4 text-sm leading-relaxed", codeClassName)}>
          <code className="whitespace-pre text-foreground/85">{code}</code>
        </pre>
      )}

      {annotations && annotations.length > 0 && (
        <div className="space-y-2 border-t border-border/50 bg-muted/50 px-4 py-3">
          {annotationsLabel && (
            <div className="mb-2 text-xs font-medium text-muted-foreground/50">
              {annotationsLabel}
            </div>
          )}

          {annotations.map((note, index) => (
            <div key={index} className="flex items-start gap-2 text-xs">
              <span className="annotation-badge mt-0.5 flex-shrink-0">{index + 1}</span>
              <span className="leading-relaxed text-muted-foreground/80">{note}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
