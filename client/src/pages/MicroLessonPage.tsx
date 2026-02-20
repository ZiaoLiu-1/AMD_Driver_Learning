/* ============================================================
   AMD Linux Driver Learning Platform - Micro Lesson Page
   Design: Deep Space Tech Aesthetic
   Layout: Fixed left sidebar + main content (6-section bootcamp)
   Supports three data formats across Module 1 and Module 2
   ============================================================ */
import { useState, useEffect } from "react";
import { Link, useParams, useLocation } from "wouter";
import { useTheme } from "@/contexts/ThemeContext";
import { module0MicroLessons } from "@/data/module0_micro_lessons";
import { module05MicroLessons } from "@/data/module05_micro_lessons";
import { module1MicroLessons } from "@/data/module1_micro_lessons";
import { module2MicroLessons } from "@/data/module2_micro_lessons";
import { module3MicroLessons } from "@/data/module3_micro_lessons";
import { module4MicroLessons } from "@/data/module4_micro_lessons";
import { module5MicroLessons } from "@/data/module5_micro_lessons";
import { module6MicroLessons } from "@/data/module6_micro_lessons";
import { module7MicroLessons } from "@/data/module7_micro_lessons";
import { module8MicroLessons } from "@/data/module8_micro_lessons";
import { module9MicroLessons } from "@/data/module9_micro_lessons";
import { module10MicroLessons } from "@/data/module10_micro_lessons";
import { module11MicroLessons } from "@/data/module11_micro_lessons";
import type { MicroLesson, MicroLessonGroup, MicroLessonModule } from "@/data/micro_lesson_types";
import { curriculum } from "@/data/curriculum";
import {
  BookOpen, Code2, Cpu, Target, ChevronLeft, ChevronRight,
  Clock, Copy, Check, Lightbulb, Wrench, FlaskConical,
  ArrowLeft, Bug, MessageSquare, X, Menu, CheckCircle2, Circle, ChevronDown,
  Sun, Moon
} from "lucide-react";

// Map moduleId -> MicroLessonModule
export const microLessonsByModule: Record<string, MicroLessonModule> = {
  intro: module0MicroLessons,
  ecosystem: module05MicroLessons,
  prerequisites: module1MicroLessons,
  hardware: module2MicroLessons,
  kernel: module3MicroLessons,
  drm: module4MicroLessons,
  amdgpu: module5MicroLessons,
  debugging: module6MicroLessons,
  'rocm-kernel': module7MicroLessons,
  'rocm-compute': module8MicroLessons,
  llvm: module9MicroLessons,
  testing: module10MicroLessons,
  career: module11MicroLessons,
};

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
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="relative group rounded-xl overflow-hidden border border-border/40"
      style={{ background: "var(--card)" }}>
      <div className="flex items-center justify-between px-4 py-2 border-b border-border/30"
        style={{ background: "var(--muted)" }}>
        <span className="text-xs font-mono text-muted-foreground/50">{language}</span>
        <button onClick={handleCopy}
          className="flex items-center gap-1.5 text-xs text-muted-foreground/40 hover:text-muted-foreground transition-colors">
          {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? "已复制" : "复制"}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto text-sm leading-relaxed"
        style={{ fontFamily: "'JetBrains Mono', 'Fira Code', monospace", color: "oklch(0.82 0.04 255)" }}>
        <code>{code}</code>
      </pre>
    </div>
  );
}

// ─── Collapsible Answer ──────────────────────────────────────
function CollapsibleAnswer({ hint, answer }: { hint?: string; answer?: string }) {
  const [open, setOpen] = useState(false);
  if (!hint && !answer) return null;
  return (
    <div className="space-y-2">
      <button onClick={() => setOpen(!open)}
        className="flex items-center gap-2 text-xs font-medium transition-colors"
        style={{ color: open ? "oklch(0.75 0.18 35)" : "oklch(0.55 0.18 200)" }}>
        <Lightbulb className="w-3.5 h-3.5" />
        {open ? "收起答案" : "查看提示"}
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
const sectionConfig = {
  concept: { label: "Concept", icon: BookOpen, color: "oklch(0.70 0.15 200)", bg: "oklch(0.55 0.18 200 / 0.12)" },
  diagram: { label: "Diagram", icon: Cpu, color: "oklch(0.72 0.18 290)", bg: "oklch(0.55 0.18 290 / 0.12)" },
  codeWalk: { label: "Code Walk", icon: Code2, color: "oklch(0.75 0.18 35)", bg: "oklch(0.62 0.22 35 / 0.12)" },
  miniLab: { label: "Mini Lab", icon: FlaskConical, color: "oklch(0.70 0.18 145)", bg: "oklch(0.55 0.18 145 / 0.12)" },
  debugExercise: { label: "Debug Exercise", icon: Bug, color: "oklch(0.70 0.15 60)", bg: "oklch(0.55 0.15 60 / 0.12)" },
  interviewQ: { label: "Interview Q", icon: MessageSquare, color: "oklch(0.65 0.01 240)", bg: "oklch(0.55 0.01 240 / 0.12)" },
};
function SectionHeader({ type }: { type: keyof typeof sectionConfig }) {
  const cfg = sectionConfig[type];
  const Icon = cfg.icon;
  return (
    <div className="flex items-center gap-3 pb-3 border-b border-border/30">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ background: cfg.bg }}>
        <Icon className="w-4 h-4" style={{ color: cfg.color }} />
      </div>
      <span className="text-sm font-bold tracking-wide" style={{ color: cfg.color }}>{cfg.label}</span>
    </div>
  );
}

// ─── Difficulty Badge ─────────────────────────────────────────
function DifficultyBadge({ difficulty }: { difficulty?: string }) {
  if (!difficulty) return null;
  const colorMap: Record<string, { bg: string; color: string; label: string }> = {
    easy: { bg: "oklch(0.55 0.18 145 / 0.12)", color: "oklch(0.70 0.18 145)", label: "简单" },
    beginner: { bg: "oklch(0.55 0.18 145 / 0.12)", color: "oklch(0.70 0.18 145)", label: "入门" },
    medium: { bg: "oklch(0.62 0.22 35 / 0.12)", color: "oklch(0.75 0.18 35)", label: "中等" },
    intermediate: { bg: "oklch(0.55 0.18 200 / 0.12)", color: "oklch(0.70 0.15 200)", label: "进阶" },
    hard: { bg: "oklch(0.55 0.18 0 / 0.12)", color: "oklch(0.70 0.18 0)", label: "困难" },
    advanced: { bg: "oklch(0.55 0.18 0 / 0.12)", color: "oklch(0.70 0.18 0)", label: "高级" },
  };
  const cfg = colorMap[difficulty] || colorMap.medium;
  return (
    <span className="text-[10px] px-2 py-0.5 rounded font-mono"
      style={{ background: cfg.bg, color: cfg.color }}>
      {cfg.label}
    </span>
  );
}

// ─── Lesson Sidebar ──────────────────────────────────────────
function LessonSidebar({
  moduleId, mod, currentLessonId, onClose
}: {
  moduleId: string;
  mod: MicroLessonModule;
  currentLessonId: string;
  onClose?: () => void;
}) {
  const [, navigate] = useLocation();
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
  return (
    <nav className="h-full flex flex-col overflow-hidden bg-sidebar">
      <div className="px-4 py-4 border-b border-border/50 flex items-center justify-between flex-shrink-0">
        <Link href={`/module/${moduleId}`} onClick={onClose}>
          <div className="flex items-center gap-2 cursor-pointer">
            <div className="w-7 h-7 rounded flex items-center justify-center flex-shrink-0"
              style={{ background: "linear-gradient(135deg, #E8441A, #FF6B35)" }}>
              <Cpu className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="text-xs font-semibold text-foreground leading-tight truncate max-w-[120px]">
                {curriculumModule?.title || "Module"}
              </div>
              <div className="text-[10px] text-muted-foreground/50">← 返回模块</div>
            </div>
          </div>
        </Link>
        {onClose && (
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
      <div className="px-4 py-2.5 border-b border-border/30 flex-shrink-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] text-muted-foreground/50">微章节</span>
          <span className="text-[10px] font-mono" style={{ color: "oklch(0.75 0.18 35)" }}>
            {totalLessons} 个章节
          </span>
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
                className={`w-full text-left px-4 py-2.5 flex items-center gap-2 transition-all ${
                  hasActive ? "text-foreground/90" : "text-muted-foreground/60 hover:text-muted-foreground/80"
                }`}
                style={hasActive ? { background: "oklch(0.62 0.22 35 / 0.05)" } : {}}>
                {group.icon && <span className="text-sm">{group.icon}</span>}
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold truncate">
                    {group.number ? `${group.number} ` : ""}{groupTitle}
                  </div>
                  <div className="text-[10px] text-muted-foreground/40">{group.lessons.length} 个章节</div>
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
                        className={`w-full text-left px-4 py-2 transition-all flex items-start gap-2 ${
                          isActive
                            ? "text-foreground"
                            : "text-muted-foreground/55 hover:text-muted-foreground/85 hover:bg-white/[0.02]"
                        }`}
                        style={isActive ? { background: "oklch(0.62 0.22 35 / 0.08)", borderRight: "2px solid oklch(0.75 0.18 35)" } : {}}>
                        <div className="flex-shrink-0 mt-0.5">
                          {isActive
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
  const { theme, toggleTheme } = useTheme();
  
  const moduleId = params.moduleId || "prerequisites";
  const lessonId = params.lessonId || "";
  const mod = microLessonsByModule[moduleId];
  const curriculumModule = curriculum.find(m => m.id === moduleId);

  // Scroll to top when lesson changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [lessonId]);

  if (!mod) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="text-4xl">🔍</div>
          <h2 className="text-xl font-bold text-foreground">模块未找到</h2>
          <Link href="/"><button className="text-sm text-muted-foreground/70 hover:text-foreground transition-colors flex items-center gap-2 mx-auto"><ArrowLeft className="w-4 h-4" /> 返回首页</button></Link>
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
          <div className="text-4xl">🔍</div>
          <h2 className="text-xl font-bold text-foreground">章节未找到</h2>
          <Link href={`/module/${moduleId}`}><button className="text-sm text-muted-foreground/70 hover:text-foreground transition-colors flex items-center gap-2 mx-auto"><ArrowLeft className="w-4 h-4" /> 返回模块</button></Link>
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
    <div className="min-h-screen flex bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 flex-shrink-0 border-r border-border/50 h-screen sticky top-0 overflow-hidden">
        <LessonSidebar moduleId={moduleId} mod={mod} currentLessonId={lesson.id} />
      </aside>
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-72">
            <LessonSidebar moduleId={moduleId} mod={mod} currentLessonId={lesson.id} onClose={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}
      {/* Main Content */}
      <main className="flex-1 min-w-0 flex flex-col">
        {/* Top Bar */}
        <div className="sticky top-0 z-30 border-b border-border/50 flex-shrink-0 backdrop-blur-md bg-background/95">
          <div className="px-4 md:px-8 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-muted-foreground/50 min-w-0">
              <button onClick={() => setSidebarOpen(true)} className="md:hidden text-muted-foreground/60 hover:text-foreground mr-1">
                <Menu className="w-4 h-4" />
              </button>
              <Link href="/"><span className="hover:text-muted-foreground transition-colors cursor-pointer">首页</span></Link>
              <ChevronRight className="w-3 h-3 flex-shrink-0" />
              <Link href={`/module/${moduleId}`}><span className="hover:text-muted-foreground transition-colors cursor-pointer truncate max-w-[80px]">{curriculumModule?.title}</span></Link>
              <ChevronRight className="w-3 h-3 flex-shrink-0" />
              {lesson.number && (
                <span className="text-foreground/70 font-mono truncate max-w-[120px]">{lesson.number}</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={toggleTheme}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                title="切换主题"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
              <div className="w-px h-4 bg-border mx-1" />
              <button onClick={() => prevLesson && navigate(`/module/${moduleId}/lesson/${prevLesson.id}`)} disabled={!prevLesson}
                className="p-1.5 rounded-lg text-muted-foreground/50 hover:text-foreground disabled:opacity-20 transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-mono text-muted-foreground/40 px-2">{currentIndex + 1} / {allLessons.length}</span>
              <button onClick={() => nextLesson && navigate(`/module/${moduleId}/lesson/${nextLesson.id}`)} disabled={!nextLesson}
                className="p-1.5 rounded-lg text-muted-foreground/50 hover:text-foreground disabled:opacity-20 transition-colors">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Lesson Content */}
        <div className="max-w-3xl mx-auto w-full px-4 md:px-8 py-8 space-y-10">
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
                <Clock className="w-3 h-3" />{getDurationDisplay(lesson)} 分钟
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
                  <div className="text-xs font-semibold text-foreground/70 mb-3">核心要点</div>
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
              <h3 className="text-sm font-semibold text-foreground/80">{lesson.diagram.title}</h3>
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
                <h3 className="text-sm font-semibold text-foreground/80">{lesson.codeWalk.title}</h3>
                {lesson.codeWalk.file && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-border/30 text-muted-foreground/40"
                    style={{ background: "var(--card)" }}>{lesson.codeWalk.file}</span>
                )}
              </div>
              <CodeBlock code={lesson.codeWalk.code} language={lesson.codeWalk.language} />
              {lesson.codeWalk.annotations && lesson.codeWalk.annotations.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-foreground/60 mb-2">代码注解</div>
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
                    🎯 实验目标
                  </div>
                  <p className="text-sm text-muted-foreground/80">{lesson.miniLab.objective}</p>
                </div>
              )}
              {lesson.miniLab.setup && (
                <div>
                  <div className="text-xs font-semibold text-foreground/60 mb-2">环境准备</div>
                  <CodeBlock code={lesson.miniLab.setup} language="bash" />
                </div>
              )}
              {lesson.miniLab.code && (
                <div>
                  <div className="text-xs font-semibold text-foreground/60 mb-2">实验代码</div>
                  <CodeBlock code={lesson.miniLab.code} language={lesson.miniLab.language || "bash"} />
                </div>
              )}
              {lesson.miniLab.steps && lesson.miniLab.steps.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-foreground/60">实验步骤</div>
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
                  <div className="text-xs font-semibold text-foreground/60 mb-2">预期输出</div>
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
                  🐛 {lesson.debugExercise.title}
                </div>
                {lesson.debugExercise.description && (
                  <p className="text-sm text-muted-foreground/80 mt-1">{lesson.debugExercise.description}</p>
                )}
              </div>
              <div>
                <div className="text-xs font-semibold text-foreground/60 mb-2">有问题的代码</div>
                <CodeBlock code={lesson.debugExercise.buggyCode} language={lesson.debugExercise.language} />
              </div>
              <div className="rounded-xl p-4 border border-border/40" style={{ background: "var(--card)" }}>
                <div className="text-xs font-semibold text-foreground/60 mb-2">❓ {lesson.debugExercise.question}</div>
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
                    <span className="text-xs font-semibold" style={{ color: "oklch(0.65 0.01 240)" }}>AMD 面试题</span>
                    {interviewQ.difficulty && <DifficultyBadge difficulty={interviewQ.difficulty} />}
                  </div>
                  <p className="text-sm font-medium text-foreground/90 leading-relaxed">{interviewQ.question}</p>
                </div>
                {"amdContext" in interviewQ && (interviewQ as { amdContext?: string }).amdContext && (
                  <div className="text-xs text-muted-foreground/55 italic border-t border-border/30 pt-3">
                    💼 {(interviewQ as { amdContext?: string }).amdContext}
                  </div>
                )}
                <CollapsibleAnswer hint={interviewQ.hint} answer={interviewQ.answer} />
              </div>
            </section>
          )}

          {/* Navigation Footer */}
          <div className="flex items-center justify-between pt-6 border-t border-border/30">
            <button
              onClick={() => prevLesson && navigate(`/module/${moduleId}/lesson/${prevLesson.id}`)}
              disabled={!prevLesson}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border/40 text-sm text-muted-foreground/70 hover:text-foreground hover:border-border/70 disabled:opacity-30 transition-all"
              style={{ background: "var(--card)" }}>
              <ChevronLeft className="w-4 h-4" />
              {prevLesson ? <span className="max-w-[120px] truncate">{prevLesson.title}</span> : "没有上一节"}
            </button>
            <button
              onClick={() => nextLesson && navigate(`/module/${moduleId}/lesson/${nextLesson.id}`)}
              disabled={!nextLesson}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border/40 text-sm text-muted-foreground/70 hover:text-foreground hover:border-border/70 disabled:opacity-30 transition-all"
              style={{ background: "var(--card)" }}>
              {nextLesson ? <span className="max-w-[120px] truncate">{nextLesson.title}</span> : "没有下一节"}
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Completion Checklist */}
          {showCompletionChecklist && (
            <div className="rounded-xl p-6 border border-border/40 space-y-4"
              style={{ background: "oklch(0.55 0.18 145 / 0.05)", borderColor: "oklch(0.55 0.18 145 / 0.25)" }}>
              <div className="flex items-center gap-2">
                <Wrench className="w-5 h-5" style={{ color: "oklch(0.70 0.18 145)" }} />
                <h3 className="text-sm font-bold" style={{ color: "oklch(0.70 0.18 145)" }}>AMD 工程师能力检查清单</h3>
              </div>
              <p className="text-xs text-muted-foreground/60">完成本模块后，你应该能够做到以下所有事项：</p>
              <div className="space-y-2">
                {completionChecklist.map((item: string, i: number) => (
                  <div key={i} className="flex items-start gap-2.5 text-sm text-muted-foreground/80">
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "oklch(0.70 0.18 145)" }} />
                    {item}
                  </div>
                ))}
              </div>
              <Link href={`/module/${moduleId}`}>
                <button className="mt-2 w-full py-2.5 rounded-xl text-sm font-semibold transition-all"
                  style={{ background: "linear-gradient(135deg, #E8441A, #FF6B35)", color: "white" }}>
                  🎉 完成本模块，返回概览
                </button>
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
