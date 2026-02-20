/* ============================================================
   AMD Linux Driver Learning Platform - Module Detail Page
   Design: Deep Space Tech Aesthetic
   Layout: Fixed left sidebar + main content with 5 tabs
   Tabs: Theory | Diagrams | Code | Project | Interview
   ============================================================ */

import { useState, useEffect, useRef } from "react";
import { useProgress } from "@/contexts/ProgressContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useLocale } from "@/contexts/LocaleContext";
import { useTranslation } from "react-i18next";
import { Link, useParams, useLocation } from "wouter";
import { difficultyColors, type Module, type GlossaryTerm } from "@/data/curriculum";
import { getCurriculum, getDifficultyLabels, getGlossaryByModule } from "@/data/curriculum_index";
import { getMicroLessonsByModule } from "@/data/micro_lessons_index";
import {
  BookOpen, Code2, Cpu, Target, ChevronLeft, ChevronRight,
  Clock, ExternalLink, Copy, Check, ChevronDown, ChevronUp,
  Lightbulb, Wrench, FlaskConical, ArrowLeft, Menu, X, Sun, Moon,
  Search, PenLine
} from "lucide-react";
import { SearchModal, useSearchShortcut } from "@/components/SearchModal";
import { useSearchHighlight } from "@/lib/highlight";

// ─── Sidebar ────────────────────────────────────────────────
function Sidebar({ currentId, onClose, curriculum, difficultyLabels, t }: {
  currentId: string; onClose?: () => void;
  curriculum: Module[]; difficultyLabels: Record<string, string>;
  t: (key: string) => string;
}) {
  const [, navigate] = useLocation();
  const { getModuleStatus, getTotalCompleted } = useProgress();
  const totalCompleted = getTotalCompleted();
  return (
    <nav className="h-full flex flex-col bg-sidebar">
      {/* Logo */}
      <div className="px-4 py-4 border-b border-border/50 flex items-center justify-between">
        <Link href="/" onClick={onClose}>
          <div className="flex items-center gap-2 cursor-pointer">
            <div className="w-7 h-7 rounded flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #E8441A, #FF6B35)' }}>
              <Cpu className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="text-xs font-semibold text-foreground leading-tight">AMD Driver</div>
              <div className="text-[10px] text-muted-foreground/60">Learning Platform</div>
            </div>
          </div>
        </Link>
        {onClose && (
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Progress Summary */}
      <div className="px-4 py-2.5 border-b border-border/30">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] text-muted-foreground/50 font-medium">{t("module.progress")}</span>
          <span className="text-[10px] font-mono" style={{ color: 'oklch(0.75 0.18 35)' }}>{totalCompleted}/{curriculum.length}</span>
        </div>
        <div className="h-1 rounded-full overflow-hidden" style={{ background: 'var(--muted)' }}>
          <div className="h-full rounded-full transition-all duration-500"
            style={{ width: `${(totalCompleted / curriculum.length) * 100}%`, background: 'linear-gradient(90deg, #E8441A, #FF6B35)' }} />
        </div>
      </div>

      {/* Module List */}
      <div className="flex-1 overflow-y-auto py-2">
        {curriculum.map((module) => {
          const status = getModuleStatus(module.id);
          return (
          <Link key={module.id} href={`/module/${module.id}`} onClick={onClose}>
            <div className={`nav-item px-4 py-2.5 cursor-pointer ${currentId === module.id ? 'active' : ''}`}>
              <div className="flex items-center gap-2.5">
                <span className="text-base flex-shrink-0">{module.icon}</span>
                <div className="min-w-0 flex-1">
                  <div className={`text-xs font-medium leading-tight truncate ${currentId === module.id ? 'text-foreground' : 'text-foreground/70'}`}>
                    {module.title}
                  </div>
                  <div className="text-[10px] text-muted-foreground/50 mt-0.5">
                    {module.estimatedHours}h · <span className={difficultyColors[module.difficulty]}>{difficultyLabels[module.difficulty]}</span>
                  </div>
                </div>
                {status === 'completed' && (
                  <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: 'oklch(0.55 0.18 145 / 0.2)' }}>
                    <Check className="w-2.5 h-2.5" style={{ color: 'oklch(0.70 0.18 145)' }} />
                  </div>
                )}
                {status === 'in-progress' && (
                  <div className="w-2 h-2 rounded-full flex-shrink-0 animate-pulse"
                    style={{ background: 'oklch(0.75 0.18 35)' }} />
                )}
              </div>
            </div>
          </Link>
          );
        })}
      </div>

      {/* Bottom Links */}
      <div className="px-4 py-3 border-t border-border/50 space-y-1">
        <a href="https://docs.kernel.org/gpu/amdgpu/index.html" target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-2 text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors py-1">
          <ExternalLink className="w-3 h-3" />
          {t("module.amdGpuDocs")}
        </a>
        <a href="https://rocm.docs.amd.com" target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-2 text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors py-1">
          <ExternalLink className="w-3 h-3" />
          {t("module.rocmDocs")}
        </a>
      </div>
    </nav>
  );
}

// ─── Code Block with Copy ────────────────────────────────────
function CodeBlock({ code, language, annotations, t }: { code: string; language: string; annotations?: string[]; t: (k: string, opts?: Record<string, unknown>) => string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-xl overflow-hidden border border-border/50">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border/50"
        style={{ background: 'var(--muted)' }}>
        <span className="text-xs font-mono text-muted-foreground/60">{language}</span>
        <button onClick={handleCopy}
          className="flex items-center gap-1.5 text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors">
          {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? t("module.copied") : t("module.copy")}
        </button>
      </div>
      {/* Code */}
      <div className="code-block p-4 text-xs leading-relaxed overflow-x-auto"
        style={{ background: 'var(--card)' }}>
        <pre className="text-foreground/85 whitespace-pre">{code}</pre>
      </div>
      {/* Annotations */}
      {annotations && annotations.length > 0 && (
        <div className="px-4 py-3 border-t border-border/50 space-y-2"
          style={{ background: 'var(--muted)' }}>
          <div className="text-xs text-muted-foreground/50 font-medium mb-2">{t("module.annotations")}</div>
          {annotations.map((note, i) => (
            <div key={i} className="flex items-start gap-2 text-xs">
              <span className="annotation-badge flex-shrink-0 mt-0.5">{i + 1}</span>
              <span className="text-muted-foreground/80 leading-relaxed">{note}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Interview Card ──────────────────────────────────────────
function InterviewCard({ q, index, t }: { q: Module['interviewQuestions'][0]; index: number; t: (k: string, opts?: Record<string, unknown>) => string }) {
  const [showHint, setShowHint] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);

  const diffColor = q.difficulty === 'hard' ? 'text-red-400' : q.difficulty === 'medium' ? 'text-yellow-400' : 'text-green-400';
  const diffLabel = q.difficulty === 'hard' ? t("module.hard") : q.difficulty === 'medium' ? t("module.medium") : t("module.easy");

  return (
    <div className="interview-card rounded-xl p-5" style={{ background: 'var(--card)' }}>
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-start gap-3">
          <span className="text-xs font-mono text-muted-foreground/40 mt-0.5 flex-shrink-0">Q{index + 1}</span>
          <p className="text-sm text-foreground/90 leading-relaxed font-medium">{q.question}</p>
        </div>
        <span className={`text-xs font-medium flex-shrink-0 ${diffColor}`}>{diffLabel}</span>
      </div>

      <div className="space-y-2">
        <button
          onClick={() => setShowHint(!showHint)}
          className="flex items-center gap-2 text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors">
          <Lightbulb className="w-3.5 h-3.5" />
          {showHint ? t("module.hideHint") : t("module.showHint")}
          {showHint ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
        {showHint && (
          <div className="text-xs text-muted-foreground/70 leading-relaxed pl-5 border-l-2 py-1"
            style={{ borderColor: 'oklch(0.62 0.22 35 / 0.4)' }}>
            💡 {q.hint}
          </div>
        )}

        <button
          onClick={() => setShowAnswer(!showAnswer)}
          className="flex items-center gap-2 text-xs transition-colors"
          style={{ color: showAnswer ? 'oklch(0.75 0.18 35)' : 'oklch(0.55 0.015 240)' }}>
          <BookOpen className="w-3.5 h-3.5" />
          {showAnswer ? t("module.hideAnswer") : t("module.showAnswer")}
          {showAnswer ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
        {showAnswer && (
          <div className="text-xs text-muted-foreground/80 leading-relaxed pl-5 border-l-2 py-2 space-y-1"
            style={{ borderColor: 'oklch(0.62 0.22 35 / 0.6)', background: 'oklch(0.62 0.22 35 / 0.05)', borderRadius: '0 0.25rem 0.25rem 0', padding: '0.75rem 1rem' }}>
            {q.answer}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Tab: Theory ─────────────────────────────────────────────
function TheoryTab({ module, glossaryByModule, t }: { module: Module; glossaryByModule: Record<string, GlossaryTerm[]>; t: (k: string, opts?: Record<string, unknown>) => string }) {
  return (
    <div className="space-y-8">
      {/* Overview */}
      <div className="rounded-xl p-6 border border-border/50" style={{ background: 'var(--card)' }}>
        <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <BookOpen className="w-4 h-4" style={{ color: 'oklch(0.75 0.18 35)' }} />
          {t("module.overview")}
        </h3>
        <p className="text-sm text-muted-foreground/90 leading-relaxed">{module.theory.overview}</p>
      </div>

      {/* Sections */}
      {module.theory.sections.map((section, i) => (
        <div key={i} className="space-y-4">
          <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
            <span className="text-xs font-mono px-2 py-0.5 rounded"
              style={{ background: 'oklch(0.62 0.22 35 / 0.15)', color: 'oklch(0.75 0.18 35)' }}>
              {String(i + 1).padStart(2, '0')}
            </span>
            {section.title}
          </h3>
          <p className="text-sm text-muted-foreground/85 leading-relaxed">{section.content}</p>
          {section.diagram && (
            <div className="space-y-2">
              <pre className="ascii-diagram">{section.diagram.content}</pre>
              <p className="text-xs text-muted-foreground/60 italic pl-1">{section.diagram.caption}</p>
            </div>
          )}
        </div>
      ))}

      {/* Books */}
      {module.theory.keyBooks.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <BookOpen className="w-4 h-4" style={{ color: 'oklch(0.75 0.18 35)' }} />
            {t("module.books")}
          </h3>
          <div className="grid gap-3">
            {module.theory.keyBooks.map((book, i) => (
              <div key={i} className="rounded-xl p-4 border border-border/50" style={{ background: 'var(--card)' }}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-semibold text-sm text-foreground/90">{book.title}</div>
                    <div className="text-xs text-muted-foreground/60 mt-0.5">{book.author}</div>
                    {book.isbn && <div className="text-xs font-mono text-muted-foreground/40 mt-0.5">ISBN: {book.isbn}</div>}
                    <p className="text-xs text-muted-foreground/75 mt-2 leading-relaxed">{book.relevance}</p>
                  </div>
                  {book.url && (
                    <a href={book.url} target="_blank" rel="noopener noreferrer"
                      className="flex-shrink-0 text-muted-foreground/40 hover:text-muted-foreground transition-colors">
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Online Resources */}
      {module.theory.onlineResources.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <ExternalLink className="w-4 h-4" style={{ color: 'oklch(0.75 0.18 35)' }} />
            {t("module.resources")}
          </h3>
          <div className="grid gap-2">
            {module.theory.onlineResources.map((res, i) => (
              <a key={i} href={res.url} target="_blank" rel="noopener noreferrer">
                <div className="flex items-start gap-3 p-3 rounded-lg border border-border/40 hover:border-border/70 transition-all"
                  style={{ background: 'var(--card)' }}>
                  <span className="text-xs px-1.5 py-0.5 rounded font-mono flex-shrink-0 mt-0.5"
                    style={{ background: 'oklch(0.55 0.18 200 / 0.15)', color: 'oklch(0.70 0.15 200)' }}>
                    {res.type}
                  </span>
                  <div>
                    <div className="text-sm font-medium text-foreground/85 hover:text-foreground transition-colors">{res.title}</div>
                    <div className="text-xs text-muted-foreground/60 mt-0.5 leading-relaxed">{res.description}</div>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-muted-foreground/30 flex-shrink-0 mt-1 ml-auto" />
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Glossary — always at the end of theory */}
      <GlossarySection moduleId={module.id} glossaryByModule={glossaryByModule} t={t} />
    </div>
  );
}

function getCategoryConfig(t: (k: string, opts?: Record<string, unknown>) => string): Record<GlossaryTerm['category'], { label: string; color: string; bg: string }> {
  return {
    kernel:    { label: t("glossary.categoryKernel"), color: 'oklch(0.70 0.15 200)', bg: 'oklch(0.55 0.18 200 / 0.12)' },
    hardware:  { label: t("glossary.categoryHardware"), color: 'oklch(0.75 0.18 35)', bg: 'oklch(0.62 0.22 35 / 0.12)' },
    graphics:  { label: t("glossary.categoryGraphics"), color: 'oklch(0.72 0.18 290)', bg: 'oklch(0.55 0.18 290 / 0.12)' },
    compute:   { label: t("glossary.categoryCompute"), color: 'oklch(0.70 0.18 145)', bg: 'oklch(0.55 0.18 145 / 0.12)' },
    toolchain: { label: t("glossary.categoryToolchain"), color: 'oklch(0.72 0.15 60)', bg: 'oklch(0.55 0.15 60 / 0.12)' },
    general:   { label: t("glossary.categoryGeneral"), color: 'oklch(0.65 0.01 240)', bg: 'oklch(0.55 0.01 240 / 0.12)' },
  };
}

function GlossarySection({ moduleId, glossaryByModule, t }: { moduleId: string; glossaryByModule: Record<string, GlossaryTerm[]>; t: (k: string, opts?: Record<string, unknown>) => string }) {
  const terms = glossaryByModule[moduleId];
  if (!terms || terms.length === 0) return null;

  // Group by category
  const grouped = terms.reduce<Record<string, GlossaryTerm[]>>((acc, term) => {
    if (!acc[term.category]) acc[term.category] = [];
    acc[term.category].push(term);
    return acc;
  }, {});

  return (
    <div className="mt-10 pt-8 border-t border-border/40">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: 'oklch(0.62 0.22 35 / 0.15)' }}>
          <BookOpen className="w-4 h-4" style={{ color: 'oklch(0.75 0.18 35)' }} />
        </div>
        <div>
          <h3 className="text-base font-bold text-foreground">{t("module.glossaryTitle")}</h3>
          <p className="text-xs text-muted-foreground/60 mt-0.5">{t("module.glossarySubtitle")}</p>
        </div>
        <span className="ml-auto text-xs font-mono px-2 py-0.5 rounded-full"
          style={{ background: 'oklch(0.62 0.22 35 / 0.15)', color: 'oklch(0.75 0.18 35)' }}>
          {t("module.termsCount", { count: terms.length })}
        </span>
      </div>

      {/* Grouped Terms */}
      <div className="space-y-6">
        {Object.entries(grouped).map(([cat, catTerms]) => {
          const cfg = getCategoryConfig(t)[cat as GlossaryTerm['category']];
          return (
            <div key={cat}>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider"
                  style={{ background: cfg.bg, color: cfg.color }}>
                  {cfg.label}
                </span>
                <div className="flex-1 h-px" style={{ background: `${cfg.color}20` }} />
              </div>
              <div className="grid gap-2">
                {catTerms.map((term, i) => (
                  <div key={i}
                    className="flex items-start gap-4 p-3 rounded-lg border border-border/30 hover:border-border/60 transition-all"
                    style={{ background: 'var(--muted)' }}>
                    {/* Abbr Badge */}
                    <div className="flex-shrink-0 min-w-[3.5rem] text-center">
                      <span className="inline-block text-sm font-bold font-mono px-2 py-0.5 rounded"
                        style={{ background: cfg.bg, color: cfg.color }}>
                        {term.abbr}
                      </span>
                    </div>
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <span className="text-xs font-semibold text-foreground/90">{term.fullEn}</span>
                        <span className="text-xs text-muted-foreground/50">·</span>
                        <span className="text-xs font-medium" style={{ color: cfg.color }}>{term.zhName}</span>
                      </div>
                      <p className="text-xs text-muted-foreground/65 mt-0.5 leading-relaxed">{term.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Tab: Code Reading ───────────────────────────────────────
function CodeTab({ module, t }: { module: Module; t: (k: string, opts?: Record<string, unknown>) => string }) {
  return (
    <div className="space-y-8">
      {module.codeReading.map((code, i) => (
        <div key={i} className="space-y-3">
          <div>
            <h3 className="text-base font-semibold text-foreground">{code.title}</h3>
            <p className="text-sm text-muted-foreground/75 mt-1 leading-relaxed">{code.description}</p>
          </div>
          <CodeBlock code={code.code} language={code.language} annotations={code.annotations} t={t} />
        </div>
      ))}
      {module.codeReading.length === 0 && (
        <div className="text-center py-16 text-muted-foreground/40">
          <Code2 className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">{t("module.codeEmpty")}</p>
        </div>
      )}
    </div>
  );
}

// ─── Tab: Mini Project ───────────────────────────────────────
function ProjectTab({ module, t }: { module: Module; t: (k: string, opts?: Record<string, unknown>) => string }) {
  const { miniProject: p } = module;
  return (
    <div className="space-y-6">
      {/* Project Header */}
      <div className="rounded-xl p-6 amd-gradient-border" style={{ background: 'var(--card)' }}>
        <div className="flex items-start gap-3 mb-3">
          <Wrench className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'oklch(0.75 0.18 35)' }} />
          <div>
            <h3 className="font-bold text-foreground">{p.title}</h3>
            <p className="text-sm text-muted-foreground/80 mt-1 leading-relaxed">{p.description}</p>
          </div>
        </div>
      </div>

      {/* Objectives */}
      <div>
        <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <Target className="w-4 h-4" style={{ color: 'oklch(0.75 0.18 35)' }} />
          {t("module.objectives")}
        </h4>
        <div className="space-y-2">
          {p.objectives.map((obj, i) => (
            <div key={i} className="flex items-start gap-3 text-sm text-muted-foreground/85">
              <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs flex-shrink-0 mt-0.5 font-mono"
                style={{ background: 'oklch(0.62 0.22 35 / 0.15)', color: 'oklch(0.75 0.18 35)' }}>
                {i + 1}
              </span>
              {obj}
            </div>
          ))}
        </div>
      </div>

      {/* Steps */}
      <div>
        <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <FlaskConical className="w-4 h-4" style={{ color: 'oklch(0.75 0.18 35)' }} />
          {t("module.steps")}
        </h4>
        <div className="space-y-3">
          {p.steps.map((step, i) => (
            <div key={i} className="flex items-start gap-3 p-3 rounded-lg border border-border/40"
              style={{ background: 'var(--card)' }}>
              <span className="text-xs font-mono px-2 py-0.5 rounded flex-shrink-0 mt-0.5"
                style={{ background: 'oklch(0.62 0.22 35 / 0.12)', color: 'oklch(0.75 0.18 35)' }}>
                Step {i + 1}
              </span>
              <span className="text-sm text-muted-foreground/85 leading-relaxed">{step}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Expected Output */}
      <div className="rounded-xl p-4 border border-border/50"
        style={{ background: 'oklch(0.55 0.18 200 / 0.05)', borderColor: 'oklch(0.55 0.18 200 / 0.2)' }}>
        <h4 className="text-xs font-semibold mb-2" style={{ color: 'oklch(0.70 0.15 200)' }}>{t("module.expectedOutput")}</h4>
        <p className="text-sm text-muted-foreground/80 leading-relaxed">{p.expectedOutput}</p>
      </div>
    </div>
  );
}

// ─── Tab: Interview ──────────────────────────────────────────
function InterviewTab({ module, t }: { module: Module; t: (k: string, opts?: Record<string, unknown>) => string }) {
  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground/60 mb-6">
        {t("module.interviewIntro")}
      </div>
      {module.interviewQuestions.map((q, i) => (
        <InterviewCard key={i} q={q} index={i} t={t} />
      ))}
      {module.interviewQuestions.length === 0 && (
        <div className="text-center py-16 text-muted-foreground/40">
          <Target className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">{t("module.interviewEmpty")}</p>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────
export default function ModulePage() {
  const params = useParams<{ moduleId: string }>();
  const [, navigate] = useLocation();
  const { locale } = useLocale();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'theory' | 'code' | 'project' | 'interview'>('theory');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  useSearchHighlight(contentRef);
  const { markTabComplete, getCompletedTabs, getModuleStatus, setModuleStatus, saveNote, getNote } = useProgress();
  const { theme, toggleTheme } = useTheme();
  useSearchShortcut(setSearchOpen);

  const curriculum = getCurriculum(locale);
  const glossaryByModule = getGlossaryByModule(locale);
  const difficultyLabels = getDifficultyLabels(locale);
  const microLessonsByModule = getMicroLessonsByModule(locale);

  const moduleId = params.moduleId;
  const module = curriculum.find(m => m.id === moduleId);
  const moduleIndex = curriculum.findIndex(m => m.id === moduleId);
  const prevModule = moduleIndex > 0 ? curriculum[moduleIndex - 1] : null;
  const nextModule = moduleIndex < curriculum.length - 1 ? curriculum[moduleIndex + 1] : null;

  useEffect(() => {
    setActiveTab('theory');
    window.scrollTo(0, 0);
    // Mark module as in-progress when first visited
    if (moduleId) {
      const status = getModuleStatus(moduleId);
      if (status === 'not-started') {
        setModuleStatus(moduleId, 'in-progress');
      }
    }
  }, [moduleId]);

  if (!module) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">{t("module.notFound")}</p>
          <Link href="/"><button className="text-sm text-primary hover:underline">{t("module.backHome")}</button></Link>
        </div>
      </div>
    );
  }

  const completedTabs = moduleId ? getCompletedTabs(moduleId) : [];

  const handleTabChange = (tabId: 'theory' | 'code' | 'project' | 'interview') => {
    setActiveTab(tabId);
    // Mark previously viewed tab as complete when switching away
    if (moduleId) {
      markTabComplete(moduleId, activeTab);
    }
  };

  const tabs = [
    { id: 'theory' as const, label: t("module.tabTheory"), icon: BookOpen },
    { id: 'code' as const, label: t("module.tabCode"), icon: Code2 },
    { id: 'project' as const, label: t("module.tabProject"), icon: Wrench },
    { id: 'interview' as const, label: t("module.tabInterview"), icon: Target },
  ];

  return (
    <>
    <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 flex-shrink-0 fixed left-0 top-0 bottom-0 border-r border-border/50 overflow-hidden z-40">
        <Sidebar currentId={moduleId || ''} curriculum={curriculum} difficultyLabels={difficultyLabels} t={t} />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
          <aside className="relative w-72 flex flex-col border-r border-border/50 overflow-hidden z-10">
            <Sidebar currentId={moduleId || ''} onClose={() => setSidebarOpen(false)} curriculum={curriculum} difficultyLabels={difficultyLabels} t={t} />
          </aside>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 min-w-0">
        {/* Top Bar */}
        <div className="sticky top-0 z-30 border-b border-border/50 backdrop-blur-md bg-background/95">
          <div className="max-w-4xl mx-auto px-4 md:px-8">
            {/* Breadcrumb */}
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-2 text-xs text-muted-foreground/60">
                <button onClick={() => setSidebarOpen(true)} className="lg:hidden mr-1 text-muted-foreground hover:text-foreground transition-colors">
                  <Menu className="w-4 h-4" />
                </button>
                <Link href="/"><span className="hover:text-muted-foreground transition-colors cursor-pointer">{t("nav.home")}</span></Link>
                <ChevronRight className="w-3 h-3" />
                <span className="text-foreground/70">Module {module.number}</span>
                <ChevronRight className="w-3 h-3" />
                <span className="text-foreground/90 font-medium truncate">{module.title}</span>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => setSearchOpen(true)} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors" title={t("module.searchTitle")}>
                  <Search className="w-4 h-4" />
                </button>
                <button onClick={() => setNotesOpen(o => !o)} className={`p-1.5 rounded-lg transition-colors ${notesOpen ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"}`} title={t("module.notesTitle")}>
                  <PenLine className="w-4 h-4" />
                </button>
                <button onClick={toggleTheme} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors" title={t("module.themeTitle")}>
                  {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </button>
              </div>
            </div>
            {/* Tabs */}
            <div className="flex gap-0 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`content-tab flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium whitespace-nowrap transition-all ${activeTab === tab.id ? 'active text-foreground' : 'text-muted-foreground/60 hover:text-muted-foreground'}`}>
                  <tab.icon className="w-3.5 h-3.5" />
                  {tab.label}
                  {completedTabs.includes(tab.id) && (
                    <Check className="w-3 h-3 text-green-400 ml-0.5" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div ref={contentRef} className="max-w-4xl mx-auto px-4 md:px-8 py-8">
          {/* Module Header */}
          <div className="mb-8">
            <div className="flex items-start gap-4">
              <span className="text-4xl">{module.icon}</span>
              <div>
                <div className="text-xs font-mono text-muted-foreground/50 mb-1">
                  Module {module.number} · {module.titleEn}
                </div>
                <h1 className="text-2xl font-bold text-foreground">{module.title}</h1>
                <p className="text-sm text-muted-foreground/75 mt-2 leading-relaxed max-w-2xl">{module.description}</p>
                <div className="flex items-center gap-4 mt-3">
                  <span className={`text-xs font-medium ${difficultyColors[module.difficulty]}`}>
                    {difficultyLabels[module.difficulty]}
                  </span>
                  <span className="text-xs text-muted-foreground/50 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {t("module.estimatedHours", { hours: module.estimatedHours })}
                  </span>
                  <span className="text-xs text-muted-foreground/50">
                    {t("module.subModules", { count: module.subModules.length })}
                  </span>
                </div>
              </div>
            </div>

            {/* Sub-modules */}
            <div className="flex flex-wrap gap-2 mt-4">
              {module.subModules.map((sub) => (
                <span key={sub.id} className="text-xs px-2.5 py-1 rounded-full border border-border/50 text-muted-foreground/70"
                  style={{ background: 'var(--secondary)' }}>
                  {sub.title}
                </span>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div>
            {activeTab === 'theory' && <TheoryTab module={module} glossaryByModule={glossaryByModule} t={t} />}
            {activeTab === 'code' && <CodeTab module={module} t={t} />}
            {activeTab === 'project' && <ProjectTab module={module} t={t} />}
            {activeTab === 'interview' && <InterviewTab module={module} t={t} />}
          </div>

          {/* Deep Dive button for modules with micro-lessons */}
          {microLessonsByModule[module.id] && (
            <div className="mt-12 pt-8 border-t border-border/50">
              <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                {t("module.deepDive")}
              </h3>
              <div className="rounded-xl p-6 border border-border/50 bg-card/50">
                <p className="text-sm text-muted-foreground/80 mb-4">
                  {t("module.deepDiveDesc", { count: microLessonsByModule[module.id].groups?.reduce((sum, g) => sum + g.lessons.length, 0) || 0 })}
                </p>
                <Link href={`/module/${module.id}/lesson/${microLessonsByModule[module.id].groups?.[0]?.lessons?.[0]?.id || ''}`}>
                  <button className="w-full py-3 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 hover:brightness-110 shadow-lg shadow-primary/20"
                    style={{ background: 'linear-gradient(135deg, #E8441A, #FF6B35)', color: 'white' }}>
                    <BookOpen className="w-4 h-4" />
                    {t("module.enterDeepDive")}
                  </button>
                </Link>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-12 pt-8 border-t border-border/50">
            {prevModule ? (
              <Link href={`/module/${prevModule.id}`}>
                <button className="flex items-center gap-2 text-sm text-muted-foreground/70 hover:text-foreground transition-colors">
                  <ChevronLeft className="w-4 h-4" />
                  <div className="text-left">
                    <div className="text-xs text-muted-foreground/40">{t("module.prevChapter")}</div>
                    <div>{prevModule.title}</div>
                  </div>
                </button>
              </Link>
            ) : (
              <Link href="/">
                <button className="flex items-center gap-2 text-sm text-muted-foreground/70 hover:text-foreground transition-colors">
                  <ArrowLeft className="w-4 h-4" />
                  {t("module.backHome")}
                </button>
              </Link>
            )}

            {nextModule && (
              <Link href={`/module/${nextModule.id}`}>
                <button className="flex items-center gap-2 text-sm text-muted-foreground/70 hover:text-foreground transition-colors">
                  <div className="text-right">
                    <div className="text-xs text-muted-foreground/40">{t("module.nextChapter")}</div>
                    <div>{nextModule.title}</div>
                  </div>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </Link>
            )}
          </div>
        </div>
      </main>
    </div>

    {/* Notes panel — slides in from right */}
    {notesOpen && (
      <div className="fixed inset-0 z-40 flex justify-end" onClick={e => { if (e.target === e.currentTarget) setNotesOpen(false); }}>
        <div className="absolute inset-0 bg-black/20" onClick={() => setNotesOpen(false)} />
        <div className="relative w-full max-w-sm h-full flex flex-col border-l border-border shadow-2xl bg-background">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border/50">
            <div className="flex items-center gap-2">
              <PenLine className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-foreground">{t("module.notesTitle")}</span>
              <span className="text-[10px] text-muted-foreground/50 ml-1">{module?.title}</span>
            </div>
            <button onClick={() => setNotesOpen(false)} className="text-muted-foreground hover:text-foreground transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex-1 p-4">
            <textarea
              value={moduleId ? getNote(moduleId) : ''}
              onChange={e => moduleId && saveNote(moduleId, e.target.value)}
              placeholder={t("module.notesPlaceholder")}
              className="w-full h-full resize-none bg-transparent text-sm text-foreground/85 placeholder:text-muted-foreground/30 outline-none leading-relaxed"
            />
          </div>
          <div className="px-4 py-2 border-t border-border/30">
            <p className="text-[10px] text-muted-foreground/30">{t("module.notesFooter")}</p>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
