// ============================================================
// Interview Practice Mode — /practice
// Flash-card style practice across all interview questions
// ============================================================
import { useState, useMemo, useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useLocale } from "@/contexts/LocaleContext";
import { useCurriculum, useAllMicroLessons } from "@/lib/useContent";
import type { Module } from "@/data/curriculum";
import type { MicroLessonModule } from "@/data/micro_lesson_types";
import { PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/button";
import { DifficultyBadge, interviewDifficultyTones } from "@/components/ui/difficulty-badge";
import {
  ChevronLeft, Lightbulb, CheckCircle2, XCircle, RotateCcw, Filter,
  BookOpen, Target, Shuffle, PartyPopper, GraduationCap
} from "lucide-react";

// Fundamentals modules covered by intern/new-grad interview loops.
const INTERN_TRACK_MODULES = new Set([
  "intro", "ecosystem", "c-cpp", "prerequisites", "gpu-arch", "hardware", "kernel",
]);

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

export default function PracticePage() {
  const { locale } = useLocale();
  const { t } = useTranslation();
  const curriculum = useCurriculum(locale);
  const microLessonsByModule = useAllMicroLessons(locale);
  const allQs = useMemo(
    () => buildQuestionBank(curriculum, microLessonsByModule),
    [curriculum, microLessonsByModule]
  );

  const [filterDiff, setFilterDiff] = useState<"all" | "easy" | "medium" | "hard">("all");
  const [filterModule, setFilterModule] = useState<string>("all");
  const [internTrack, setInternTrack] = useState(false);
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
      // Intern/new-grad track: fundamentals modules only, no hard questions —
      // mirrors the actual scope of intern & new-grad interview loops.
      if (internTrack && (q.difficulty === "hard" || !INTERN_TRACK_MODULES.has(q.moduleId))) return false;
      return true;
    });
  }, [questions, filterDiff, filterModule, internTrack]);

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

  // Keyboard Shortcuts (10b)
  useEffect(() => {
    if (finished || !current) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in the search/filter inputs (just in case we add them later)
      if (document.activeElement?.tagName === "INPUT" || document.activeElement?.tagName === "TEXTAREA") return;

      switch (e.key) {
        case " ": // Space
        case "Enter":
          e.preventDefault();
          setShowAnswer(a => !a);
          break;
        case "ArrowLeft":
          e.preventDefault();
          prev();
          break;
        case "1":
          if (showAnswer) {
            e.preventDefault();
            next("skip");
          }
          break;
        case "2":
          if (showAnswer) {
            e.preventDefault();
            next("correct");
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [finished, current, showAnswer, next, prev]);

  const uniqueModules = useMemo(() => {
    const seen = new Set<string>();
    return allQs.map(q => ({ id: q.moduleId, title: curriculum.find(m => m.id === q.moduleId)?.title ?? q.moduleId }))
      .filter(m => { if (seen.has(m.id)) return false; seen.add(m.id); return true; });
  }, [allQs]);

  const clearFilters = useCallback(() => {
    setFilterDiff("all");
    setFilterModule("all");
    setQuestions(shuffle(allQs));
    setIdx(0);
    setShowHint(false);
    setShowAnswer(false);
    setCorrect(0);
    setSkipped(0);
    setFinished(false);
  }, [allQs]);

  return (
    <PageShell
      backHref="/"
      backLabel={t("nav.home")}
      currentLabel={t("nav.practice")}
      containerWidthClassName="max-w-3xl"
      mainClassName="py-8"
      headerMeta={
        <span className="mr-1 hidden text-xs text-muted-foreground/50 sm:block">
          {t("practice.totalBank", { count: allQs.length })}
        </span>
      }
    >
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
            className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-colors border ${filterDiff === d ? "border-primary/50 bg-primary/10 text-primary" : "border-border/40 text-muted-foreground/60 hover:border-border"
              }`}>
            {d === "all" ? t("practice.allDiff") : t(`module.${d}`)}
          </button>
        ))}
        <div className="w-px h-5 bg-border/40 mx-1 self-center" />
        {/* Intern/new-grad track toggle */}
        <button
          onClick={() => { setInternTrack(v => !v); applyFilter(); }}
          title={t("practice.internTrackHint")}
          className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg font-medium transition-colors border ${internTrack ? "border-primary/50 bg-primary/10 text-primary" : "border-border/40 text-muted-foreground/60 hover:border-border"}`}>
          <GraduationCap className="w-3.5 h-3.5" />
          {t("practice.internTrack")}
        </button>
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
        <span className="text-success flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" />{correct}</span>
        <span className="text-muted-foreground/50 flex items-center gap-1"><XCircle className="w-3.5 h-3.5" />{skipped}</span>
        <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden ml-auto">
          <div className="h-full rounded-full bg-primary transition-[width] duration-300" style={{ width: `${progress}%` }} />
        </div>
        <span className="text-muted-foreground/50 font-mono">{idx}/{total}</span>
      </div>

      {/* Card */}
      {finished ? (
        <div className="rounded-2xl border border-border/50 p-8 text-center bg-card/50">
          <PartyPopper className="w-12 h-12 mx-auto mb-4 text-primary opacity-80" />
          <h2 className="text-xl font-bold text-foreground mb-2">{t("practice.finished")}</h2>
          <p className="text-sm text-muted-foreground/70 mb-2">
            {t("practice.finishedStats", { total, correct, skipped })}
          </p>
          <div className="text-2xl font-bold text-primary mb-6">
            {t("practice.correctRate", { rate: total > 0 ? Math.round((correct / total) * 100) : 0 })}
          </div>
          <Button onClick={reset} variant="brand" className="mx-auto flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold">
            <RotateCcw className="w-4 h-4" aria-hidden="true" />
            {t("practice.retry")}
          </Button>
        </div>
      ) : total === 0 ? (
        <div className="rounded-2xl border border-border/50 bg-card/50 px-6 py-10 sm:px-8 sm:py-12">
          <div className="mx-auto flex max-w-xl flex-col items-center text-center">
            <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary">
              <Filter className="h-6 w-6" aria-hidden="true" />
            </div>
            <h2 className="mb-2 text-xl font-semibold text-foreground">
              {t("practice.emptyTitle")}
            </h2>
            <p className="mb-2 text-sm leading-relaxed text-muted-foreground/80">
              {t("practice.noQuestions")}
            </p>
            <p className="mb-6 text-xs leading-relaxed text-muted-foreground/60 sm:text-sm">
              {t("practice.emptyDesc")}
            </p>

            <div className="mb-4 flex flex-wrap items-center justify-center gap-2">
              {filterDiff !== "all" && (
                <span className="rounded-full border border-border/50 bg-background/70 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground/65">
                  {t("practice.emptyDifficultyLabel")}: {t(`module.${filterDiff}`)}
                </span>
              )}
              {filterModule !== "all" && (
                <span className="rounded-full border border-border/50 bg-background/70 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground/65">
                  {t("practice.emptyModuleLabel")}: {uniqueModules.find(m => m.id === filterModule)?.title ?? filterModule}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                onClick={clearFilters}
                className="inline-flex min-h-[44px] items-center justify-center rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
              >
                {t("practice.emptyReset")}
              </button>
              <button
                onClick={reset}
                className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-border/50 px-5 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted/50"
              >
                {t("practice.emptyShuffle")}
              </button>
            </div>
          </div>
        </div>
      ) : current ? (
        <div className="rounded-2xl border border-border/50 bg-card/50 overflow-hidden">
          {/* Card header */}
          <div className="px-6 py-4 border-b border-border/40 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DifficultyBadge
                tone={interviewDifficultyTones[current.difficulty]}
                className="px-2 py-0.5 text-xs font-medium tracking-normal"
                mono={false}
              >
                {t(`module.${current.difficulty}`)}
              </DifficultyBadge>
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
                  {current.hint}
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
              className="p-2 rounded-lg border border-border/50 text-muted-foreground/50 hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              aria-label={t("practice.prevQuestion") || "Previous question"}>
              <ChevronLeft className="w-4 h-4" aria-hidden="true" />
            </button>
            <button onClick={() => next("skip")}
              className="flex-1 py-2.5 rounded-xl border border-border/50 text-sm font-medium text-muted-foreground/70 hover:text-foreground hover:border-border transition-colors">
              {t("practice.skip")}
            </button>
            <button onClick={() => next("correct")}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-[filter] hover:brightness-110 flex items-center justify-center gap-2"
              style={{ background: "linear-gradient(135deg, var(--primary), var(--brand-end))" }}>
              <CheckCircle2 className="w-4 h-4" />
              {t("practice.correct")}
            </button>
          </div>
        </div>
      ) : null}

      {/* Keyboard hint */}
      {!finished && current && (
        <div className="text-center mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[11px] text-muted-foreground/40 font-medium">
          <span className="flex items-center gap-1.5"><kbd className="font-mono bg-muted/50 px-1.5 py-0.5 rounded border border-border/40 text-muted-foreground">Space</kbd> {t("practice.toggleAnswer") || "Show/Hide Answer"}</span>
          {showAnswer && (
            <>
              <span className="flex items-center gap-1.5"><kbd className="font-mono bg-muted/50 px-1.5 py-0.5 rounded border border-border/40 text-muted-foreground">1</kbd> {t("practice.skip") || "Skip"}</span>
              <span className="flex items-center gap-1.5"><kbd className="font-mono bg-muted/50 px-1.5 py-0.5 rounded border border-border/40 text-muted-foreground">2</kbd> {t("practice.correct") || "Correct"}</span>
            </>
          )}
          <span className="flex items-center gap-1.5"><kbd className="font-mono bg-muted/50 px-1.5 py-0.5 rounded border border-border/40 text-muted-foreground">←</kbd> {t("practice.prevQuestion") || "Previous"}</span>
        </div>
      )}
    </PageShell>
  );
}
