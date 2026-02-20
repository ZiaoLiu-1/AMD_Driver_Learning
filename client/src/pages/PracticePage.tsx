// ============================================================
// Interview Practice Mode — /practice
// Flash-card style practice across all interview questions
// ============================================================
import { useState, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "wouter";
import { useTheme } from "@/contexts/ThemeContext";
import { useLocale } from "@/contexts/LocaleContext";
import { getCurriculum } from "@/data/curriculum_index";
import { getMicroLessonsByModule } from "@/data/micro_lessons_index";
import type { Module } from "@/data/curriculum";
import type { MicroLessonModule } from "@/data/micro_lesson_types";
import {
  ArrowLeft, Sun, Moon, ChevronRight, ChevronLeft,
  Lightbulb, CheckCircle2, XCircle, RotateCcw, Filter, Languages,
  BookOpen, Target, Shuffle
} from "lucide-react";

interface PracticeQuestion {
  question: string;
  hint: string;
  answer: string;
  difficulty: "easy" | "medium" | "hard";
  source: string;   // "Module X — title"
  moduleId: string;
}

function buildQuestionBank(curriculum: Module[], microLessonsByModule: Record<string, MicroLessonModule>): PracticeQuestion[] {
  const qs: PracticeQuestion[] = [];

  // From module overview interview questions
  for (const m of curriculum) {
    for (const q of m.interviewQuestions ?? []) {
      qs.push({
        question: q.question,
        hint: q.hint,
        answer: q.answer,
        difficulty: q.difficulty as "easy" | "medium" | "hard",
        source: `Module ${m.number} — ${m.title}`,
        moduleId: m.id,
      });
    }
  }

  // From micro-lesson interview questions
  for (const [moduleId, mod] of Object.entries(microLessonsByModule)) {
    const currModule = curriculum.find(m => m.id === moduleId);
    const groups = mod.groups ?? [];
    for (const group of groups) {
      for (const lesson of group.lessons ?? []) {
        const iq = lesson.interviewQ ?? lesson.interviewQuestion;
        if (!iq) continue;
        qs.push({
          question: iq.question,
          hint: iq.hint,
          answer: iq.answer,
          difficulty: (iq.difficulty ?? "medium") as "easy" | "medium" | "hard",
          source: `${currModule?.title ?? moduleId} › ${lesson.number} ${lesson.title}`,
          moduleId,
        });
      }
    }
  }

  return qs;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const diffStyles = {
  easy: { text: "text-green-600 dark:text-green-400", bg: "bg-green-500/10" },
  medium: { text: "text-yellow-600 dark:text-yellow-400", bg: "bg-yellow-500/10" },
  hard: { text: "text-red-600 dark:text-red-400", bg: "bg-red-500/10" },
};

export default function PracticePage() {
  const { theme, toggleTheme } = useTheme();
  const { locale, setLocale } = useLocale();
  const [, navigate] = useLocation();
  const { t } = useTranslation();
  const curriculum = getCurriculum(locale);
  const microLessonsByModule = getMicroLessonsByModule(locale);
  const allQs = useMemo(
    () => buildQuestionBank(curriculum, microLessonsByModule),
    [curriculum, microLessonsByModule]
  );

  const [filterDiff, setFilterDiff] = useState<"all" | "easy" | "medium" | "hard">("all");
  const [filterModule, setFilterModule] = useState<string>("all");
  const [questions, setQuestions] = useState<PracticeQuestion[]>(() => shuffle(allQs));
  const [idx, setIdx] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [correct, setCorrect] = useState(0);
  const [skipped, setSkipped] = useState(0);
  const [finished, setFinished] = useState(false);

  const filteredQs = useMemo(() => {
    return questions.filter(q => {
      if (filterDiff !== "all" && q.difficulty !== filterDiff) return false;
      if (filterModule !== "all" && q.moduleId !== filterModule) return false;
      return true;
    });
  }, [questions, filterDiff, filterModule]);

  const current = filteredQs[idx];
  const total = filteredQs.length;
  const progress = total > 0 ? ((idx) / total) * 100 : 0;

  const reset = useCallback(() => {
    setQuestions(shuffle(allQs));
    setIdx(0);
    setShowHint(false);
    setShowAnswer(false);
    setCorrect(0);
    setSkipped(0);
    setFinished(false);
  }, [allQs]);

  const switchLocale = () => {
    const newLocale = locale === "zh" ? "en" : "zh";
    setLocale(newLocale);
    const path = window.location.pathname;
    const newPath = path.replace(/^\/(zh|en)/, `/${newLocale}`) || `/${newLocale}`;
    navigate(newPath);
  };

  const applyFilter = useCallback(() => {
    setIdx(0);
    setShowHint(false);
    setShowAnswer(false);
    setCorrect(0);
    setSkipped(0);
    setFinished(false);
  }, []);

  const next = useCallback((result: "correct" | "skip") => {
    if (result === "correct") setCorrect(c => c + 1);
    else setSkipped(s => s + 1);
    if (idx + 1 >= total) {
      setFinished(true);
    } else {
      setIdx(i => i + 1);
      setShowHint(false);
      setShowAnswer(false);
    }
  }, [idx, total]);

  const prev = useCallback(() => {
    if (idx > 0) {
      setIdx(i => i - 1);
      setShowHint(false);
      setShowAnswer(false);
    }
  }, [idx]);

  const uniqueModules = useMemo(() => {
    const seen = new Set<string>();
    return allQs.map(q => ({ id: q.moduleId, title: curriculum.find(m => m.id === q.moduleId)?.title ?? q.moduleId }))
      .filter(m => { if (seen.has(m.id)) return false; seen.add(m.id); return true; });
  }, [allQs]);

  return (
    <div className="min-h-screen bg-background">
      {/* Top Bar */}
      <div className="sticky top-0 z-30 border-b border-border/50 backdrop-blur-md bg-background/95">
        <div className="max-w-3xl mx-auto px-4 md:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-muted-foreground/60">
            <Link href="/"><span className="hover:text-foreground transition-colors cursor-pointer flex items-center gap-1"><ArrowLeft className="w-3 h-3" /> {t("nav.home")}</span></Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-foreground/80 font-medium">{t("nav.practice")}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground/50">{t("practice.totalBank", { count: allQs.length })}</span>
            <button onClick={switchLocale} className="flex items-center gap-1 px-2 py-1 rounded text-xs border border-border/50 hover:border-border transition-colors" title={locale === "zh" ? "Switch to English" : "切换到中文"}>
              <Languages className="w-3.5 h-3.5" />
              {locale === "zh" ? "En" : "中"}
            </button>
            <button onClick={toggleTheme} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 md:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground mb-1">{t("practice.pageTitle")}</h1>
          <p className="text-sm text-muted-foreground/70">{t("practice.pageSubtitle")}</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-6 p-3 rounded-xl border border-border/40 bg-card/30">
          <div className="flex items-center gap-1.5 mr-2">
            <Filter className="w-3.5 h-3.5 text-muted-foreground/50" />
            <span className="text-xs text-muted-foreground/50 font-medium">{t("practice.filter")}</span>
          </div>
          {/* Difficulty filter */}
          {(["all", "easy", "medium", "hard"] as const).map(d => (
            <button key={d}
              onClick={() => { setFilterDiff(d); applyFilter(); }}
              className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-all border ${
                filterDiff === d ? "border-primary/50 bg-primary/10 text-primary" : "border-border/40 text-muted-foreground/60 hover:border-border"
              }`}>
              {d === "all" ? t("practice.allDiff") : t(`module.${d}`)}
            </button>
          ))}
          <div className="w-px h-5 bg-border/40 mx-1 self-center" />
          {/* Module filter */}
          <select
            value={filterModule}
            onChange={e => { setFilterModule(e.target.value); applyFilter(); }}
            className="text-xs px-2.5 py-1 rounded-lg border border-border/40 bg-background text-muted-foreground/70 outline-none focus:border-primary/50">
            <option value="all">{t("practice.allModules")}</option>
            {uniqueModules.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
          </select>
          <button onClick={() => { setQuestions(shuffle(filteredQs.concat())); applyFilter(); }}
            className="ml-auto flex items-center gap-1 text-xs text-muted-foreground/50 hover:text-muted-foreground transition-colors">
            <Shuffle className="w-3.5 h-3.5" />
            {t("practice.shuffle")}
          </button>
        </div>

        {/* Stats bar */}
        <div className="flex items-center gap-4 mb-4 text-xs">
          <span className="text-muted-foreground/50">{t("practice.totalQuestions", { count: total })}</span>
          <span className="text-green-600 dark:text-green-400 flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" />{correct}</span>
          <span className="text-muted-foreground/50 flex items-center gap-1"><XCircle className="w-3.5 h-3.5" />{skipped}</span>
          <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden ml-auto">
            <div className="h-full rounded-full bg-primary transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
          <span className="text-muted-foreground/50 font-mono">{idx}/{total}</span>
        </div>

        {/* Card */}
        {finished ? (
          <div className="rounded-2xl border border-border/50 p-8 text-center bg-card/50">
            <div className="text-4xl mb-4">🎉</div>
            <h2 className="text-xl font-bold text-foreground mb-2">{t("practice.finished")}</h2>
            <p className="text-sm text-muted-foreground/70 mb-2">
              {t("practice.finishedStats", { total, correct, skipped })}
            </p>
            <div className="text-2xl font-bold text-primary mb-6">
              {t("practice.correctRate", { rate: total > 0 ? Math.round((correct / total) * 100) : 0 })}
            </div>
            <button onClick={reset}
              className="flex items-center gap-2 mx-auto px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:brightness-110"
              style={{ background: "linear-gradient(135deg, #E8441A, #FF6B35)" }}>
              <RotateCcw className="w-4 h-4" />
              {t("practice.retry")}
            </button>
          </div>
        ) : total === 0 ? (
          <div className="rounded-2xl border border-border/50 p-8 text-center bg-card/50 text-muted-foreground/50">
            {t("practice.noQuestions")}
          </div>
        ) : current ? (
          <div className="rounded-2xl border border-border/50 bg-card/50 overflow-hidden">
            {/* Card header */}
            <div className="px-6 py-4 border-b border-border/40 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-0.5 rounded font-medium ${diffStyles[current.difficulty].bg} ${diffStyles[current.difficulty].text}`}>
                  {t(`module.${current.difficulty}`)}
                </span>
                <span className="text-xs text-muted-foreground/40 truncate max-w-xs">{current.source}</span>
              </div>
              <span className="text-xs font-mono text-muted-foreground/40">{idx + 1} / {total}</span>
            </div>

            {/* Question */}
            <div className="px-6 py-6">
              <div className="flex items-start gap-3 mb-6">
                <Target className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <p className="text-base font-semibold text-foreground leading-relaxed">{current.question}</p>
              </div>

              {/* Hint */}
              <div className="space-y-2">
                <button onClick={() => setShowHint(h => !h)}
                  className="flex items-center gap-2 text-sm text-primary/70 hover:text-primary transition-colors">
                  <Lightbulb className="w-4 h-4" />
                  {showHint ? t("practice.hideHint") : t("practice.showHint")}
                </button>
                {showHint && (
                  <div className="rounded-xl p-4 text-sm text-muted-foreground/80 border border-border/40 leading-relaxed"
                    style={{ background: "var(--muted)" }}>
                    💡 {current.hint}
                  </div>
                )}
              </div>

              {/* Answer */}
              <div className="space-y-2 mt-3">
                <button onClick={() => setShowAnswer(a => !a)}
                  className={`flex items-center gap-2 text-sm font-medium transition-colors ${showAnswer ? "text-primary" : "text-muted-foreground/60 hover:text-foreground"}`}>
                  <BookOpen className="w-4 h-4" />
                  {showAnswer ? t("practice.hideAnswer") : t("practice.showAnswer")}
                </button>
                {showAnswer && (
                  <div className="rounded-xl p-5 border border-primary/20 bg-primary/5 text-sm text-muted-foreground/85 leading-relaxed">
                    {current.answer}
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="px-6 pb-6 flex items-center gap-3">
              <button onClick={prev} disabled={idx === 0}
                className="p-2 rounded-lg border border-border/50 text-muted-foreground/50 hover:text-foreground disabled:opacity-30 transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button onClick={() => next("skip")}
                className="flex-1 py-2.5 rounded-xl border border-border/50 text-sm font-medium text-muted-foreground/70 hover:text-foreground hover:border-border transition-all">
                {t("practice.skip")}
              </button>
              <button onClick={() => next("correct")}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:brightness-110 flex items-center justify-center gap-2"
                style={{ background: "linear-gradient(135deg, #E8441A, #FF6B35)" }}>
                <CheckCircle2 className="w-4 h-4" />
                {t("practice.correct")}
              </button>
            </div>
          </div>
        ) : null}

        {/* Keyboard hint */}
        <p className="text-center text-[10px] text-muted-foreground/30 mt-4">
          {t("practice.hintShortcut")}
        </p>
      </div>
    </div>
  );
}
