/* ============================================================
   AMD Linux Driver Learning Platform - Micro Lesson Page
   Design: Deep Space Tech Aesthetic
   Layout: Fixed left sidebar + main content (6-section bootcamp)
   Supports three data formats across Module 1 and Module 2
   ============================================================ */
import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Link, useParams, useLocation } from "wouter";
import { useTheme } from "@/contexts/ThemeContext";
import { useProgress } from "@/contexts/ProgressContext";
import { useLocale } from "@/contexts/LocaleContext";
import { useSwitchLocale } from "@/lib/useSwitchLocale";
import { SearchModal } from "@/components/SearchModal";
import { DynamicIcon } from "@/components/DynamicIcon";
import { Button } from "@/components/ui/button";
import { CopyCodeBlock } from "@/components/shared/CopyCodeBlock";
import {
  DifficultyBadge as DifficultyPill,
  type DifficultyTone,
  interviewDifficultyTones,
  lessonDifficultyTones,
} from "@/components/ui/difficulty-badge";
import { useSearchHighlight } from "@/lib/highlight";
import { getCurriculum } from "@/data/curriculum_index";
import { getMicroLessonsByModule, isMicroLessonLocalized } from "@/data/micro_lessons_index";
import type { MicroLesson, MicroLessonGroup, MicroLessonModule } from "@/data/micro_lesson_types";
import {
  BookOpen, Code2, Cpu, Target, ChevronLeft, ChevronRight,
  Clock, Check, Lightbulb, Wrench, FlaskConical,
  ArrowLeft, Bug, MessageSquare, X, Menu, CheckCircle2, Circle, ChevronDown,
  Sun, Moon, Search, Languages
} from "lucide-react";

// ─── Helpers ─────────────────────────────────────────────────
function getGroupId(group: MicroLessonGroup): string {
  return group.id || group.groupId || group.title || "group";
}
function getGroupTitle(group: MicroLessonGroup): string {
  return group.title || group.groupTitle || "";
}
function getGroups(mod: MicroLessonModule): MicroLessonGroup[] {
  if (mod.groups && mod.groups.length > 0) return mod.groups;
  if (mod.lessons && mod.lessons.length > 0) {
    return [{ id: mod.moduleId, title: mod.groupTitle || mod.moduleId, lessons: mod.lessons }];
  }
  return [];
}
function flattenLessons(mod: MicroLessonModule): MicroLesson[] {
  return getGroups(mod).flatMap(g => g.lessons);
}
function findLesson(mod: MicroLessonModule, lessonId: string): MicroLesson | undefined {
  for (const group of getGroups(mod)) {
    const lesson = group.lessons.find(l => l.id === lessonId);
    if (lesson) return lesson;
  }
  return undefined;
}
function findGroup(mod: MicroLessonModule, lessonId: string): MicroLessonGroup | undefined {
  return getGroups(mod).find(g => g.lessons.some(l => l.id === lessonId));
}
function getLessonSummary(lesson: MicroLesson): string {
  return lesson.concept?.summary || lesson.summary || "";
}
function getLessonKeyPoints(lesson: MicroLesson): string[] {
  return lesson.concept?.keyPoints || lesson.keyPoints || [];
}
function getLessonExplanation(lesson: MicroLesson): string[] {
  return lesson.concept?.explanation || [];
}
function getInterviewQ(lesson: MicroLesson) {
  return lesson.interviewQ || lesson.interviewQuestion;
}
function getDebugAnswer(lesson: MicroLesson): string {
  return lesson.debugExercise?.answer || lesson.debugExercise?.solution || "";
}
function getDurationDisplay(lesson: MicroLesson): string {
  const d = lesson.duration;
  if (typeof d === "number") return `${d}`;
  if (typeof d === "string") return d.replace(" min", "").replace("min", "");
  return String(d);
}

// ─── Code Block ─────────────────────────────────────────────
function CodeBlock({ code, language = "c" }: { code: string; language?: string }) {
  const { t } = useTranslation();
  return (
    <CopyCodeBlock
      code={code}
      language={language}
      copyLabel={t("microLesson.copy")}
      copiedLabel={t("microLesson.copied")}
      className="border-border/40"
      codeClassName="text-sm"
    />
  );
}

// ─── Collapsible Answer ──────────────────────────────────────
function CollapsibleAnswer({ hint, answer }: { hint?: string; answer?: string }) {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation();
  if (!hint && !answer) return null;
  return (
    <div className="space-y-2">
      <button onClick={() => setOpen(!open)}
        className="flex items-center gap-2 text-xs font-medium transition-colors"
        style={{ color: open ? "oklch(0.75 0.18 35)" : "oklch(0.55 0.18 200)" }}>
        <Lightbulb className="w-3.5 h-3.5" />
        {open ? t("microLesson.collapseAnswer") : t("microLesson.showHint")}
        <ChevronRight className={`w-3 h-3 transition-transform ${open ? "rotate-90" : ""}`} />
      </button>
      {!open && hint && (
        <div className="text-xs text-muted-foreground/60 pl-5 italic">{hint}</div>
      )}
      {open && (
        <div className="rounded-lg p-4 border border-border/40 text-sm text-muted-foreground/85 leading-relaxed"
          style={{ background: "var(--card)" }}>
          {answer || hint}
        </div>
      )}
    </div>
  );
}

// ─── Section Header ──────────────────────────────────────────
const sectionLabelKeys = {
  concept: "microLesson.sectionConcept",
  diagram: "microLesson.sectionDiagram",
  codeWalk: "microLesson.sectionCodeWalk",
  miniLab: "microLesson.sectionMiniLab",
  debugExercise: "microLesson.sectionDebug",
  interviewQ: "microLesson.sectionInterview",
};
const sectionIcons: Record<keyof typeof sectionLabelKeys, typeof BookOpen> = {
  concept: BookOpen,
  diagram: Cpu,
  codeWalk: Code2,
  miniLab: FlaskConical,
  debugExercise: Bug,
  interviewQ: MessageSquare,
};
function SectionHeader({ type }: { type: keyof typeof sectionLabelKeys }) {
  const { t } = useTranslation();
  const Icon = sectionIcons[type];
  return (
    <div className="flex items-center gap-2.5 pb-3 border-b border-border/30">
      <Icon className="w-4 h-4 text-muted-foreground/60 flex-shrink-0" />
      <span className="text-sm font-bold text-foreground tracking-wide">{t(sectionLabelKeys[type])}</span>
    </div>
  );
}

// ─── Difficulty Badge ─────────────────────────────────────────
function DifficultyBadge({ difficulty }: { difficulty?: string }) {
  const { t } = useTranslation();
  if (!difficulty) return null;
  const tone =
    (interviewDifficultyTones as Record<string, DifficultyTone>)[difficulty] ??
    (lessonDifficultyTones as Record<string, DifficultyTone>)[difficulty] ??
    lessonDifficultyTones.beginner;
  const labelMap: Record<string, string> = {
    easy: t("module.easy"),
    beginner: t("common.beginner"),
    medium: t("module.medium"),
    intermediate: t("common.intermediate"),
    hard: t("module.hard"),
    advanced: t("common.advanced"),
    expert: t("common.expert"),
  };
  return (
    <DifficultyPill tone={tone}>
      {labelMap[difficulty] ?? difficulty}
    </DifficultyPill>
  );
}

// ─── Lesson Sidebar ──────────────────────────────────────────
function LessonSidebar({
  moduleId, mod, curriculum, currentLessonId, onClose
}: {
  moduleId: string;
  mod: MicroLessonModule;
  curriculum: { id: string; title: string; icon?: string }[];
  currentLessonId: string;
  onClose?: () => void;
}) {
  const { t } = useTranslation();
  const [, navigate] = useLocation();
  const { isLessonComplete, getCompletedLessons } = useProgress();
  const groups = getGroups(mod);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(() => {
    const currentGroup = findGroup(mod, currentLessonId);
    const firstGroupId = groups[0] ? getGroupId(groups[0]) : "";
    return new Set(currentGroup ? [getGroupId(currentGroup)] : [firstGroupId]);
  });
  const curriculumModule = curriculum.find(m => m.id === moduleId);
  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      if (next.has(groupId)) next.delete(groupId);
      else next.add(groupId);
      return next;
    });
  };
  const allLessons = flattenLessons(mod);
  const totalLessons = allLessons.length;
  const completedCount = getCompletedLessons(moduleId).length;
  return (
    <nav className="h-full flex flex-col overflow-hidden bg-sidebar">
      <div className="px-4 py-4 border-b border-border/50 flex items-center justify-between flex-shrink-0">
        <Link href={`/module/${moduleId}`} onClick={onClose}>
          <div className="flex items-center gap-2 cursor-pointer">
            <div className="w-7 h-7 rounded flex items-center justify-center flex-shrink-0"
              style={{ background: "linear-gradient(135deg, var(--primary), var(--brand-end))" }}>
              <Cpu className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="text-xs font-semibold text-foreground leading-tight truncate max-w-[120px]">
                {curriculumModule?.title || "Module"}
              </div>
              <div className="text-[10px] text-muted-foreground/50">{t("microLesson.backModule")}</div>
            </div>
          </div>
        </Link>
        {onClose && (
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors" aria-label={t("microLesson.closeSidebar") || "Close sidebar"}>
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        )}
      </div>
      <div className="px-4 py-2.5 border-b border-border/30 flex-shrink-0">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] text-muted-foreground/50">{t("microLesson.progress")}</span>
          <span className="text-[10px] font-mono" style={{ color: "oklch(0.75 0.18 35)" }}>
            {completedCount}/{totalLessons}
          </span>
        </div>
        <div className="h-1 rounded-full bg-muted overflow-hidden">
          <div className="h-full rounded-full transition-[width] duration-500"
            style={{ width: `${totalLessons > 0 ? (completedCount / totalLessons) * 100 : 0}%`, background: "linear-gradient(90deg, var(--primary), var(--brand-end))" }} />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto py-2">
        {groups.map((group) => {
          const groupId = getGroupId(group);
          const groupTitle = getGroupTitle(group);
          const isExpanded = expandedGroups.has(groupId);
          const hasActive = group.lessons.some(l => l.id === currentLessonId);
          return (
            <div key={groupId} className="mb-1">
              <button
                onClick={() => toggleGroup(groupId)}
                className={`w-full text-left px-4 py-2.5 flex items-center gap-2 transition-[color,background-color,border-color] ${hasActive ? "text-foreground/90" : "text-muted-foreground/60 hover:text-muted-foreground/80"
                  }`}
                style={hasActive ? { background: "oklch(0.62 0.22 35 / 0.05)" } : {}}>
                {group.icon && <DynamicIcon name={group.icon} className="w-4 h-4 text-foreground/70" />}
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold truncate">
                    {group.number ? `${group.number} ` : ""}{groupTitle}
                  </div>
                  <div className="text-[10px] text-muted-foreground/40">{t("microLesson.chaptersCount", { count: group.lessons.length })}</div>
                </div>
                <ChevronDown className={`w-3 h-3 flex-shrink-0 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
              </button>
              {isExpanded && (
                <div className="pl-2">
                  {group.lessons.map((l) => {
                    const isActive = l.id === currentLessonId;
                    return (
                      <button
                        key={l.id}
                        onClick={() => { navigate(`/module/${moduleId}/lesson/${l.id}`); onClose?.(); }}
                        className={`w-full text-left px-4 py-2 transition-[color,background-color,border-color] flex items-start gap-2 ${isActive
                          ? "text-foreground"
                          : "text-muted-foreground/55 hover:text-muted-foreground/85 hover:bg-white/[0.02]"
                          }`}
                        style={isActive ? { background: "oklch(0.62 0.22 35 / 0.08)", borderRight: "2px solid oklch(0.75 0.18 35)" } : {}}>
                        <div className="flex-shrink-0 mt-0.5">
                          {isLessonComplete(moduleId, l.id)
                            ? <CheckCircle2 className="w-3 h-3" style={{ color: "oklch(0.65 0.18 145)" }} />
                            : isActive
                              ? <div className="w-3 h-3 rounded-full animate-pulse" style={{ background: "oklch(0.75 0.18 35)" }} />
                              : <Circle className="w-3 h-3 opacity-25" />
                          }
                        </div>
                        <div className="min-w-0">
                          {l.number && (
                            <div className="text-[10px] font-mono text-muted-foreground/35 mb-0.5">{l.number}</div>
                          )}
                          <div className="text-xs font-medium leading-snug">{l.title}</div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] text-muted-foreground/35 flex items-center gap-1">
                              <Clock className="w-2.5 h-2.5" />{getDurationDisplay(l)}min
                            </span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </nav>
  );
}

// ─── Main Micro Lesson Page ──────────────────────────────────
export default function MicroLessonPage() {
  const params = useParams<{ moduleId: string; lessonId: string }>();
  const [, navigate] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  useSearchHighlight(contentRef);
  const { theme, toggleTheme } = useTheme();
  const { locale } = useLocale();
  const { switchLocale } = useSwitchLocale();
  const { t } = useTranslation();
  const { isLessonComplete, markLessonComplete, unmarkLessonComplete } = useProgress();

  const curriculum = getCurriculum(locale);
  const microLessonsByModule = getMicroLessonsByModule(locale);
  const moduleId = params.moduleId || "prerequisites";

  const lessonId = params.lessonId || "";
  const mod = microLessonsByModule[moduleId];
  const curriculumModule = curriculum.find(m => m.id === moduleId);

  // Scroll to top when lesson changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [lessonId]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); setSearchOpen(true); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  if (!mod) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="text-4xl"></div>
          <h2 className="text-xl font-bold text-foreground">{t("microLesson.moduleNotFound")}</h2>
          <Link href="/" className="text-sm text-muted-foreground/70 hover:text-foreground transition-colors flex items-center gap-2 mx-auto"><ArrowLeft className="w-4 h-4" aria-hidden="true" /> {t("microLesson.backHome")}</Link>
        </div>
      </div>
    );
  }
  const allLessons = flattenLessons(mod);
  const lesson = findLesson(mod, lessonId) || allLessons[0];
  const currentIndex = allLessons.findIndex(l => l.id === lesson?.id);
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;
  if (!lesson) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="text-4xl"></div>
          <h2 className="text-xl font-bold text-foreground">{t("microLesson.lessonNotFound")}</h2>
          <Link href={`/module/${moduleId}`} className="text-sm text-muted-foreground/70 hover:text-foreground transition-colors flex items-center gap-2 mx-auto"><ArrowLeft className="w-4 h-4" aria-hidden="true" /> {t("microLesson.backToModule")}</Link>
        </div>
      </div>
    );
  }

  const lessonSummary = getLessonSummary(lesson);
  const lessonKeyPoints = getLessonKeyPoints(lesson);
  const lessonExplanation = getLessonExplanation(lesson);
  const interviewQ = getInterviewQ(lesson);
  const debugAnswer = getDebugAnswer(lesson);
  const completionChecklist: string[] = lesson.completionChecklist || mod.completionChecklist || [];
  const showCompletionChecklist = !nextLesson && completionChecklist.length > 0;

  return (
    <>
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
      <div className="min-h-screen flex bg-background">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex flex-col w-64 flex-shrink-0 border-r border-border/50 h-screen sticky top-0 overflow-hidden">
          <LessonSidebar moduleId={moduleId} mod={mod} curriculum={curriculum} currentLessonId={lesson.id} />
        </aside>
        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
            <div className="absolute left-0 top-0 bottom-0 w-72">
              <LessonSidebar moduleId={moduleId} mod={mod} curriculum={curriculum} currentLessonId={lesson.id} onClose={() => setSidebarOpen(false)} />
            </div>
          </div>
        )}
        {/* Main Content */}
        <main className="flex-1 min-w-0 flex flex-col">
          {/* Top Bar */}
          <div className="sticky top-0 z-30 border-b border-border/50 flex-shrink-0 backdrop-blur-md bg-background/95">
            <div className="px-3 lg:px-8 py-2 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1 sm:gap-2 text-xs text-muted-foreground/50 min-w-0">
                <button onClick={() => setSidebarOpen(true)} className="lg:hidden min-w-[44px] min-h-[44px] flex items-center justify-center -ml-1 text-muted-foreground/60 hover:text-foreground" aria-label={t("microLesson.openNav") || "Open lesson navigation"}>
                  <Menu className="w-5 h-5" aria-hidden="true" />
                </button>
                <Link href="/" className="hidden sm:inline"><span className="hover:text-muted-foreground transition-colors cursor-pointer">{t("nav.home") || "Home"}</span></Link>
                <ChevronRight className="w-3 h-3 flex-shrink-0 hidden sm:block" />
                <Link href={`/module/${moduleId}`}><span className="hover:text-muted-foreground transition-colors cursor-pointer truncate max-w-[100px] sm:max-w-[140px]">{curriculumModule?.title}</span></Link>
                <ChevronRight className="w-3 h-3 flex-shrink-0" />
                {lesson.number && (
                  <span className="text-foreground/70 font-mono truncate max-w-[60px] sm:max-w-[120px]">{lesson.number}</span>
                )}
              </div>
              <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                <button
                  onClick={() => setSearchOpen(true)}
                  className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                  aria-label={t("microLesson.search") || "Search (⌘K)"}>
                  <Search className="w-4 h-4" aria-hidden="true" />
                </button>
                <button onClick={switchLocale} className="hidden sm:flex w-[52px] items-center justify-center gap-1 min-h-[44px] rounded text-xs border border-border/50 hover:border-border transition-colors" title={locale === "zh" ? "Switch to English" : "切换到中文"}>
                  <Languages className="w-3.5 h-3.5" />
                  {locale === "zh" ? "En" : "中"}
                </button>
                <button
                  onClick={toggleTheme}
                  className="hidden sm:flex min-w-[44px] min-h-[44px] items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                  aria-label={theme === 'dark' ? (t("nav.switchToLight") || "Switch to light theme") : (t("nav.switchToDark") || "Switch to dark theme")}
                >
                  {theme === 'dark' ? <Sun className="w-4 h-4" aria-hidden="true" /> : <Moon className="w-4 h-4" aria-hidden="true" />}
                </button>
                <div className="w-px h-4 bg-border mx-0.5 hidden sm:block" />
                <button onClick={() => prevLesson && navigate(`/module/${moduleId}/lesson/${prevLesson.id}`)} disabled={!prevLesson}
                  className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg text-muted-foreground/50 hover:text-foreground disabled:opacity-30 transition-colors"
                  aria-label={t("microLesson.prevLesson") || "Previous lesson"}>
                  <ChevronLeft className="w-4 h-4" aria-hidden="true" />
                </button>
                <span className="text-xs font-mono text-muted-foreground/40 hidden sm:block">{currentIndex + 1}/{allLessons.length}</span>
                <button onClick={() => nextLesson && navigate(`/module/${moduleId}/lesson/${nextLesson.id}`)} disabled={!nextLesson}
                  className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg text-muted-foreground/50 hover:text-foreground disabled:opacity-30 transition-colors"
                  aria-label={t("microLesson.nextLesson") || "Next lesson"}>
                  <ChevronRight className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>

          {/* Lesson Content */}
          <div ref={contentRef} className="max-w-3xl mx-auto w-full px-4 lg:px-8 py-6 sm:py-8 space-y-8 sm:space-y-10">
            {/* Locale mismatch notice */}
            {!isMicroLessonLocalized(locale as "zh" | "en") && (
              <div className="rounded-xl p-4 border border-warning/30 bg-warning/5 flex items-start gap-3" role="alert">
                <Languages className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <p className="text-xs font-semibold text-warning mb-0.5">
                    {t("microLesson.localeMismatchTitle") || "Content available in Chinese only"}
                  </p>
                  <p className="text-xs text-muted-foreground/70">
                    {t("microLesson.localeMismatchDesc") || "This micro-lesson has not been translated to English yet. The content below is displayed in Chinese."}
                  </p>
                </div>
              </div>
            )}

            {/* Lesson Header */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 flex-wrap">
                {lesson.number && (
                  <span className="text-xs font-mono px-2 py-1 rounded"
                    style={{ background: "oklch(0.62 0.22 35 / 0.12)", color: "oklch(0.75 0.18 35)" }}>
                    {lesson.number}
                  </span>
                )}
                <span className="text-xs text-muted-foreground/40 flex items-center gap-1">
                  <Clock className="w-3 h-3" />{getDurationDisplay(lesson)} {t("microLesson.minutes") || "min"}
                </span>
                {lesson.difficulty && <DifficultyBadge difficulty={lesson.difficulty} />}
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground leading-tight">{lesson.title}</h1>
              {lessonSummary && (
                <p className="text-sm text-muted-foreground/75 leading-relaxed max-w-2xl">{lessonSummary}</p>
              )}
              {lesson.tags && lesson.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {lesson.tags.map((tag: string) => (
                    <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full border border-border/40 text-muted-foreground/50"
                      style={{ background: "var(--card)" }}>{tag}</span>
                  ))}
                </div>
              )}
            </div>

            {/* Section 1: Concept */}
            <section className="space-y-4">
              <SectionHeader type="concept" />
              <div className="space-y-4">
                {lessonExplanation.map((para: string, i: number) => (
                  <p key={i} className="text-sm text-muted-foreground/85 leading-relaxed">{para}</p>
                ))}
                {lessonKeyPoints.length > 0 && (
                  <div className="rounded-xl p-4 border border-border/40 space-y-2" style={{ background: "var(--card)" }}>
                    <div className="text-xs font-semibold text-foreground/70 mb-3">{t("microLesson.keyPoints")}</div>
                    {lessonKeyPoints.map((pt: string, i: number) => (
                      <div key={i} className="flex items-start gap-2.5 text-sm text-muted-foreground/80">
                        <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "oklch(0.70 0.18 145)" }} />
                        {pt}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>

            {/* Section 2: Diagram */}
            <section className="space-y-4">
              <SectionHeader type="diagram" />
              <div className="space-y-3">
                <h2 className="text-sm font-semibold text-foreground/80">{lesson.diagram.title}</h2>
                <pre className="ascii-diagram">{lesson.diagram.content}</pre>
                {lesson.diagram.caption && (
                  <p className="text-xs text-muted-foreground/55 italic pl-1">{lesson.diagram.caption}</p>
                )}
              </div>
            </section>

            {/* Section 3: Code Walk */}
            <section className="space-y-4">
              <SectionHeader type="codeWalk" />
              <div className="space-y-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-sm font-semibold text-foreground/80">{lesson.codeWalk.title}</h2>
                  {lesson.codeWalk.file && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-border/30 text-muted-foreground/40"
                      style={{ background: "var(--card)" }}>{lesson.codeWalk.file}</span>
                  )}
                </div>
                <CodeBlock code={lesson.codeWalk.code} language={lesson.codeWalk.language} />
                {lesson.codeWalk.annotations && lesson.codeWalk.annotations.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-xs font-semibold text-foreground/60 mb-2">{t("microLesson.codeAnnotations")}</div>
                    {lesson.codeWalk.annotations.map((ann: string, i: number) => (
                      <div key={i} className="flex items-start gap-3 text-xs text-muted-foreground/75">
                        <span className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
                          style={{ background: "oklch(0.62 0.22 35 / 0.15)", color: "oklch(0.75 0.18 35)" }}>
                          {i + 1}
                        </span>
                        <span className="leading-relaxed pt-0.5">{ann}</span>
                      </div>
                    ))}
                  </div>
                )}
                <p className="text-sm text-muted-foreground/75 leading-relaxed">{lesson.codeWalk.explanation}</p>
              </div>
            </section>

            {/* Section 4: Mini Lab */}
            <section className="space-y-4">
              <SectionHeader type="miniLab" />
              <div className="space-y-4">
                {lesson.miniLab.objective && (
                  <div className="rounded-xl p-4 border border-border/40"
                    style={{ background: "oklch(0.55 0.18 145 / 0.05)", borderColor: "oklch(0.55 0.18 145 / 0.2)" }}>
                    <div className="text-xs font-semibold mb-1" style={{ color: "oklch(0.70 0.18 145)" }}>
                      {t("microLesson.labObjective")}
                    </div>
                    <p className="text-sm text-muted-foreground/80">{lesson.miniLab.objective}</p>
                  </div>
                )}
                {lesson.miniLab.setup && (
                  <div>
                    <div className="text-xs font-semibold text-foreground/60 mb-2">{t("microLesson.labSetup")}</div>
                    <CodeBlock code={lesson.miniLab.setup} language="bash" />
                  </div>
                )}
                {lesson.miniLab.code && (
                  <div>
                    <div className="text-xs font-semibold text-foreground/60 mb-2">{t("microLesson.labCode")}</div>
                    <CodeBlock code={lesson.miniLab.code} language={lesson.miniLab.language || "bash"} />
                  </div>
                )}
                {lesson.miniLab.steps && lesson.miniLab.steps.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-xs font-semibold text-foreground/60">{t("microLesson.labSteps")}</div>
                    {lesson.miniLab.steps.map((step: string, i: number) => (
                      <div key={i} className="flex items-start gap-3 text-sm text-muted-foreground/75">
                        <span className="flex-shrink-0 w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold"
                          style={{ background: "oklch(0.55 0.18 145 / 0.15)", color: "oklch(0.70 0.18 145)" }}>
                          {i + 1}
                        </span>
                        <span className="leading-relaxed pt-0.5">{step}</span>
                      </div>
                    ))}
                  </div>
                )}
                {lesson.miniLab.expectedOutput && (
                  <div>
                    <div className="text-xs font-semibold text-foreground/60 mb-2">{t("microLesson.labOutput")}</div>
                    <pre className="ascii-diagram text-xs">{lesson.miniLab.expectedOutput}</pre>
                  </div>
                )}
                {lesson.miniLab.hint && (
                  <CollapsibleAnswer hint={lesson.miniLab.hint} answer={lesson.miniLab.hint} />
                )}
              </div>
            </section>

            {/* Section 5: Debug Exercise */}
            <section className="space-y-4">
              <SectionHeader type="debugExercise" />
              <div className="space-y-4">
                <div className="rounded-xl p-4 border border-border/40"
                  style={{ background: "oklch(0.55 0.15 60 / 0.05)", borderColor: "oklch(0.55 0.15 60 / 0.2)" }}>
                  <div className="text-xs font-semibold mb-1" style={{ color: "oklch(0.70 0.15 60)" }}>
                    {lesson.debugExercise.title}
                  </div>
                  {lesson.debugExercise.description && (
                    <p className="text-sm text-muted-foreground/80 mt-1">{lesson.debugExercise.description}</p>
                  )}
                </div>
                <div>
                  <div className="text-xs font-semibold text-foreground/60 mb-2">{t("microLesson.buggyCode")}</div>
                  <CodeBlock code={lesson.debugExercise.buggyCode} language={lesson.debugExercise.language} />
                </div>
                <div className="rounded-xl p-4 border border-border/40" style={{ background: "var(--card)" }}>
                  <div className="text-xs font-semibold text-foreground/60 mb-2">{lesson.debugExercise.question}</div>
                  <CollapsibleAnswer hint={lesson.debugExercise.hint} answer={debugAnswer} />
                </div>
              </div>
            </section>

            {/* Section 6: Interview Q */}
            {interviewQ && (
              <section className="space-y-4">
                <SectionHeader type="interviewQ" />
                <div className="rounded-xl p-5 border border-border/40 space-y-4" style={{ background: "var(--card)" }}>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Target className="w-4 h-4" style={{ color: "oklch(0.65 0.01 240)" }} />
                      <span className="text-xs font-semibold" style={{ color: "oklch(0.65 0.01 240)" }}>{t("microLesson.amdInterview")}</span>
                      {interviewQ.difficulty && <DifficultyBadge difficulty={interviewQ.difficulty} />}
                    </div>
                    <p className="text-sm font-medium text-foreground/90 leading-relaxed">{interviewQ.question}</p>
                  </div>
                  {"amdContext" in interviewQ && (interviewQ as { amdContext?: string }).amdContext && (
                    <div className="text-xs text-muted-foreground/55 italic border-t border-border/30 pt-3">
                      {(interviewQ as { amdContext?: string }).amdContext}
                    </div>
                  )}
                  <CollapsibleAnswer hint={interviewQ.hint} answer={interviewQ.answer} />
                </div>
              </section>
            )}

            {/* Navigation Footer */}
            <div className="flex items-center justify-between gap-3 pt-6 border-t border-border/30">
              <button
                onClick={() => prevLesson && navigate(`/module/${moduleId}/lesson/${prevLesson.id}`)}
                disabled={!prevLesson}
                className="flex items-center gap-2 min-h-[44px] px-3 sm:px-4 py-2.5 rounded-xl border border-border/40 text-sm text-muted-foreground/70 hover:text-foreground hover:border-border/70 disabled:opacity-30 disabled:cursor-not-allowed transition-colors min-w-0"
                style={{ background: "var(--card)" }}>
                <ChevronLeft className="w-4 h-4 flex-shrink-0" />
                {prevLesson ? <span className="max-w-[80px] sm:max-w-[140px] truncate">{prevLesson.title}</span> : t("microLesson.prevLesson")}
              </button>
              <button
                onClick={() => nextLesson && navigate(`/module/${moduleId}/lesson/${nextLesson.id}`)}
                disabled={!nextLesson}
                className="flex items-center gap-2 min-h-[44px] px-3 sm:px-4 py-2.5 rounded-xl border border-border/40 text-sm text-muted-foreground/70 hover:text-foreground hover:border-border/70 disabled:opacity-30 disabled:cursor-not-allowed transition-colors min-w-0"
                style={{ background: "var(--card)" }}>
                {nextLesson ? <span className="max-w-[80px] sm:max-w-[140px] truncate">{nextLesson.title}</span> : t("microLesson.nextLesson")}
                <ChevronRight className="w-4 h-4 flex-shrink-0" />
              </button>
            </div>

            {/* Mark as Done button */}
            <div className="flex justify-center pt-2">
              {isLessonComplete(moduleId, lesson.id) ? (
                <button
                  onClick={() => unmarkLessonComplete(moduleId, lesson.id)}
                  className="flex items-center gap-2 text-xs text-success/80 hover:text-success transition-colors py-2 px-4 rounded-lg border border-success/30 bg-success/10"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {t("microLesson.completedClickCancel")}
                </button>
              ) : (
                <Button
                  onClick={() => markLessonComplete(moduleId, lesson.id)}
                  variant="brand"
                  className="h-auto rounded-xl px-6 py-2.5 text-sm font-semibold flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  {t("microLesson.markComplete")}
                </Button>
              )}
            </div>

            {/* Completion Checklist */}
            {showCompletionChecklist && (
              <div className="rounded-xl p-6 border border-border/40 space-y-4"
                style={{ background: "oklch(0.55 0.18 145 / 0.05)", borderColor: "oklch(0.55 0.18 145 / 0.25)" }}>
                <div className="flex items-center gap-2">
                  <Wrench className="w-5 h-5" style={{ color: "oklch(0.70 0.18 145)" }} />
                  <h2 className="text-sm font-bold" style={{ color: "oklch(0.70 0.18 145)" }}>{t("microLesson.checklistTitle")}</h2>
                </div>
                <p className="text-xs text-muted-foreground/60">{t("microLesson.checklistDesc")}</p>
                <div className="space-y-2">
                  {completionChecklist.map((item: string, i: number) => (
                    <div key={i} className="flex items-start gap-2.5 text-sm text-muted-foreground/80">
                      <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "oklch(0.70 0.18 145)" }} />
                      {item}
                    </div>
                  ))}
                </div>
                <Button asChild variant="brand" className="mt-2 h-auto w-full rounded-xl py-2.5 text-sm font-semibold">
                  <Link href={`/module/${moduleId}`}>{t("microLesson.finishModule")}</Link>
                </Button>
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
}
