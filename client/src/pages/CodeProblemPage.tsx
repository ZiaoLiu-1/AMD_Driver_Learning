/* ============================================================
   Code Lab — problem solving page (/code-lab/:problemId)
   Split view: statement left, editor + judge output right.
   Compiles remotely via lib/judge.ts (Godbolt with fallbacks).
   ============================================================ */
import { use, useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "wouter";
import { useTranslation } from "react-i18next";
import { useLocale } from "@/contexts/LocaleContext";
import { PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/button";
import { DifficultyBadge, codeLabDifficultyTones } from "@/components/ui/difficulty-badge";
import { CodeEditor } from "@/components/codelab/CodeEditor";
import { useCodeLabProgress } from "@/hooks/useCodeLabProgress";
import { loadAllProblems, cSystemsRecommendedOrder } from "@/data/code_problems_index";
import {
  runCode, assembleSource, parseTestOutput, isAccepted,
  type JudgeResult, type ParsedTests,
} from "@/lib/judge";
import {
  Play, RotateCcw, Lightbulb, CheckCircle2, XCircle, Loader2, ChevronRight,
  BookOpen, Eye, Clock, TerminalSquare, AlertTriangle,
} from "lucide-react";

/** Render `inline code` spans inside statement text. */
function InlineText({ text }: { text: string }) {
  const parts = text.split(/`([^`]+)`/g);
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <code
            key={i}
            className="rounded bg-muted px-1 py-0.5 font-mono text-[0.85em] text-foreground/90"
          >
            {part}
          </code>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
}

interface RunOutcome {
  judge: JudgeResult;
  tests: ParsedTests;
}

export default function CodeProblemPage() {
  const { t } = useTranslation();
  const { locale } = useLocale();
  const params = useParams<{ problemId: string }>();
  const problems = use(loadAllProblems());
  const { getStatus, getSavedCode, saveCode, setStatus } = useCodeLabProgress();

  const problem = problems.find((p) => p.id === params.problemId);
  // Primary CTA: the next problem in the current track's teaching
  // sequence (C Systems follows its recommended order; others by number).
  const next = useMemo(() => {
    if (!problem) return undefined;
    const sameTrack = problems.filter((p) => p.track === problem.track);
    if (problem.track === "c") {
      const rank = new Map(cSystemsRecommendedOrder.map((id, i) => [id, i]));
      sameTrack.sort((a, b) => (rank.get(a.id) ?? 99) - (rank.get(b.id) ?? 99));
    } else {
      sameTrack.sort((a, b) => a.number - b.number);
    }
    const i = sameTrack.findIndex((p) => p.id === problem.id);
    return i >= 0 && i + 1 < sameTrack.length ? sameTrack[i + 1] : undefined;
  }, [problems, problem]);

  // Starter code follows the UI language (identical code, translated comments).
  const isEn = locale === "en";
  const starterOf = (p: NonNullable<typeof problem>) =>
    isEn && p.starterCodeEn ? p.starterCodeEn : p.starterCode;
  // "Pristine" = still one of the two locale starters, i.e. the learner has
  // not actually edited. Pristine code follows the UI language on locale
  // switches; genuine edits are always preserved verbatim.
  const isPristine = (p: NonNullable<typeof problem>, c: string) =>
    c === p.starterCode || c === p.starterCodeEn;

  const [code, setCode] = useState<string>(() => {
    if (!problem) return "";
    const saved = getSavedCode(problem.id);
    // A saved pristine starter must not pin the wrong language.
    if (saved !== undefined && !isPristine(problem, saved)) return saved;
    return starterOf(problem);
  });
  const [running, setRunning] = useState(false);
  const [outcome, setOutcome] = useState<RunOutcome | null>(null);
  const [netError, setNetError] = useState<string | null>(null);
  const [hintsShown, setHintsShown] = useState(0);
  const [showSolution, setShowSolution] = useState(false);
  const [showHarness, setShowHarness] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Persistence bookkeeping. codeRef always mirrors the rendered code;
  // activeIdRef only advances inside the switch effect below, AFTER the
  // previous problem's edits have been flushed — so a flush can never
  // attribute one problem's code to another problem's id.
  const codeRef = useRef(code);
  codeRef.current = code;
  const activeIdRef = useRef<string | null>(problem?.id ?? null);

  // Problem switch: synchronously flush the outgoing problem's edits
  // (kills the "last 600ms lost on navigation" hole), then load the
  // incoming problem's saved code (empty string included) or starter.
  useEffect(() => {
    if (!problem) return;
    if (activeIdRef.current && activeIdRef.current !== problem.id)
      saveCode(activeIdRef.current, codeRef.current);
    activeIdRef.current = problem.id;
    const saved = getSavedCode(problem.id);
    setCode(saved !== undefined && !isPristine(problem, saved) ? saved : starterOf(problem));
    setOutcome(null);
    setNetError(null);
    setHintsShown(0);
    setShowSolution(false);
    setShowHarness(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [problem?.id]);

  // Locale switch: if the editor still holds a pristine starter, swap it to
  // the new language's starter so English users never see Chinese comments.
  useEffect(() => {
    if (!problem) return;
    setCode((cur) => (isPristine(problem, cur) ? starterOf(problem) : cur));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEn, problem?.id]);

  // Debounced persistence while typing. The activeIdRef guard means a
  // timer scheduled just before a route change can never write the old
  // buffer under the new problem's id.
  useEffect(() => {
    if (!problem) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    const id = problem.id;
    saveTimer.current = setTimeout(() => {
      if (activeIdRef.current === id) saveCode(id, code);
    }, 600);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [code, problem, saveCode]);

  // Flush on tab close/background and on unmount.
  useEffect(() => {
    const flush = () => {
      if (activeIdRef.current) saveCode(activeIdRef.current, codeRef.current);
    };
    window.addEventListener("pagehide", flush);
    return () => {
      window.removeEventListener("pagehide", flush);
      flush();
    };
  }, [saveCode]);

  const hints = useMemo(
    () => (locale === "en" ? problem?.hintsEn : problem?.hints) ?? [],
    [problem, locale],
  );

  if (!problem) {
    return (
      <PageShell backHref="/code-lab" backLabel={t("codelab.title")} currentLabel="404">
        <div className="mx-auto max-w-2xl px-4 py-20 text-center text-sm text-foreground/75">
          {t("codelab.notFound")}
          <div className="mt-4">
            <Link
              href="/code-lab"
              className="cl-link inline-flex min-h-[44px] items-center px-2 hover:underline"
            >
              {t("codelab.backToList")}
            </Link>
          </div>
        </div>
      </PageShell>
    );
  }

  const status = getStatus(problem.id);
  const passedAll = outcome != null && isAccepted(outcome.judge, outcome.tests);

  const handleRun = async () => {
    if (running) return;
    setRunning(true);
    setNetError(null);
    setOutcome(null);
    saveCode(problem.id, code);
    try {
      const { source, runToken } = assembleSource(problem.harness, code);
      const judge = await runCode(problem.language, source);
      const tests = parseTestOutput(judge.stdout, runToken);
      setOutcome({ judge, tests });
      setStatus(problem.id, isAccepted(judge, tests) ? "solved" : "attempted");
    } catch (err) {
      setNetError(err instanceof Error ? err.message : String(err));
      setStatus(problem.id, "attempted");
    } finally {
      setRunning(false);
    }
  };

  const handleReset = () => {
    setCode(starterOf(problem));
    setOutcome(null);
    setNetError(null);
  };

  const title = locale === "en" ? problem.titleEn : problem.title;
  const description = locale === "en" ? problem.descriptionEn : problem.description;
  const solutionNote = locale === "en" ? problem.solutionNoteEn : problem.solutionNote;

  return (
    <PageShell
      backHref="/code-lab"
      backLabel={t("codelab.title")}
      currentLabel={`${problem.id.toUpperCase()} ${title}`}
      containerWidthClassName="max-w-[1400px]"
    >
      <div className="mx-auto max-w-[1400px] px-4 py-8 md:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
          {/* ---------------- left: statement ---------------- */}
          <div className="min-w-0">
            <div className="mb-4 flex flex-wrap items-center gap-3 min-w-0">
              <span className="font-mono text-xs text-foreground/70">
                {problem.id.toUpperCase()}
              </span>
              <h1 className="min-w-0 break-words text-xl font-bold tracking-tight">{title}</h1>
              {status === "solved" && (
                <CheckCircle2 className="h-5 w-5 text-success" aria-label={t("codelab.solvedLabel")} />
              )}
            </div>

            <div className="mb-6 flex flex-wrap items-center gap-2.5 text-xs">
              <DifficultyBadge
                className={problem.difficulty !== "warmup" ? `cl-diff-${problem.difficulty}` : undefined}
                tone={codeLabDifficultyTones[problem.difficulty]}
              >
                {t(`codelab.difficulty.${problem.difficulty}`)}
              </DifficultyBadge>
              <span className="flex items-center gap-1 text-foreground/75">
                <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                ~{problem.minutes} min
              </span>
              <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[11px] text-foreground/80">
                {problem.language === "c" ? "C11 · gcc" : "C++17 · g++"}
              </span>
              {(isEn ? problem.tagsEn : problem.tags).map((tag) => (
                <span
                  key={tag}
                  className="rounded bg-muted px-1.5 py-0.5 font-mono text-[11px] text-foreground/75"
                >
                  {tag}
                </span>
              ))}
            </div>

            <div className="space-y-4">
              {description.map((para, i) => (
                <p key={i} className="text-sm leading-relaxed text-foreground/85">
                  <InlineText text={para} />
                </p>
              ))}
            </div>

            {problem.lessonId && (
              <Link
                href={`/module/c-cpp/lesson/${problem.lessonId}`}
                className="cl-link mt-3 inline-flex min-h-[44px] items-center gap-1.5 px-1 text-xs hover:underline"
              >
                <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
                {t("codelab.relatedLesson")}
                <ChevronRight className="h-3 w-3" aria-hidden="true" />
              </Link>
            )}

            {/* hints */}
            <div className="mt-8 space-y-2.5">
              {hints.slice(0, hintsShown).map((hint, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2.5 rounded-lg border border-warning/20 bg-warning/5 px-4 py-3"
                >
                  <Lightbulb className="mt-0.5 h-3.5 w-3.5 shrink-0 text-warning" aria-hidden="true" />
                  <p className="text-[13px] leading-relaxed text-foreground/80">
                    <InlineText text={hint} />
                  </p>
                </div>
              ))}
              {hintsShown < hints.length && (
                <button
                  onClick={() => setHintsShown((n) => n + 1)}
                  className="flex min-h-[44px] items-center gap-1.5 text-xs text-foreground/75 transition-colors hover:text-foreground"
                >
                  <Lightbulb className="h-3.5 w-3.5" aria-hidden="true" />
                  {t("codelab.showHint", { current: hintsShown + 1, total: hints.length })}
                </button>
              )}
            </div>

            {/* harness viewer */}
            <div className="mt-6">
              <button
                onClick={() => setShowHarness((v) => !v)}
                aria-expanded={showHarness}
                className="flex min-h-[44px] items-center gap-1.5 text-xs text-foreground/75 transition-colors hover:text-foreground"
              >
                <TerminalSquare className="h-3.5 w-3.5" aria-hidden="true" />
                {showHarness ? t("codelab.hideHarness") : t("codelab.showHarness")}
              </button>
              {showHarness && (
                <pre className="mt-2 max-h-80 overflow-auto rounded-xl border border-border/50 bg-card p-4 font-mono text-[12px] leading-relaxed text-foreground/75">
                  {problem.harness}
                </pre>
              )}
            </div>

            {/* solution */}
            <div className="mt-6 border-t border-border/40 pt-6">
              {!showSolution ? (
                <Button variant="outline" size="sm" className="min-h-[44px]" onClick={() => setShowSolution(true)}>
                  <Eye className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
                  {t("codelab.showSolution")}
                </Button>
              ) : (
                <div>
                  <div className="mb-2 text-xs font-semibold text-foreground/70">
                    {t("codelab.referenceSolution")}
                  </div>
                  <pre className="max-h-96 overflow-auto rounded-xl border border-border/50 bg-card p-4 font-mono text-[12px] leading-relaxed text-foreground/85">
                    {problem.solution}
                  </pre>
                  <p className="mt-3 text-[13px] leading-relaxed text-foreground/75">
                    <InlineText text={solutionNote} />
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* ---------------- right: editor + output ---------------- */}
          <div className="min-w-0 lg:sticky lg:top-16 lg:self-start">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div className="text-xs font-medium text-foreground/75">
                {t("codelab.yourCode")}
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" className="min-h-[44px]" onClick={handleReset} disabled={running}>
                  <RotateCcw className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
                  {t("codelab.reset")}
                </Button>
                <Button
                  size="sm"
                  onClick={handleRun}
                  disabled={running}
                  className="min-h-[44px] bg-[oklch(0.50_0.20_35)] text-white hover:bg-[oklch(0.44_0.20_35)]"
                >
                  {running ? (
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                  ) : (
                    <Play className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
                  )}
                  {running ? t("codelab.running") : t("codelab.run")}
                </Button>
              </div>
            </div>

            <div className="mb-2 flex min-h-[44px] flex-wrap items-center gap-x-1 text-[11px] leading-relaxed text-foreground/70">
              <span>{t("codelab.privacyNote")}</span>
              <a
                href="https://shop.compiler-explorer.com/privacy-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[44px] items-center px-1 underline decoration-foreground/40 underline-offset-2 hover:text-foreground"
              >
                {t("codelab.privacyPolicy")}
              </a>
            </div>
            <CodeEditor
              value={code}
              onChange={setCode}
              onRun={handleRun}
              ariaLabel={t("codelab.editorAria")}
              minHeightClassName="min-h-[380px] max-h-[560px] h-[46vh]"
            />
            <div className="mt-1.5 text-right text-[11px] text-foreground/70">
              {t("codelab.runShortcut")}
            </div>

            {/* output */}
            <div className="mt-4" aria-live="polite">
              {netError && (
                <div className="flex items-start gap-2.5 rounded-xl border border-destructive/25 bg-destructive/5 px-4 py-3">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" aria-hidden="true" />
                  <div className="text-[13px] leading-relaxed text-foreground/80">
                    <div className="font-medium text-foreground">{t("codelab.netErrorTitle")}</div>
                    <div className="mt-1 text-foreground/70">{t("codelab.netErrorBody")}</div>
                    <div className="mt-1 font-mono text-[11px] text-foreground/70">{netError}</div>
                  </div>
                </div>
              )}

              {outcome && !outcome.judge.compiled && (
                <div className="overflow-hidden rounded-xl border border-destructive/25">
                  <div className="flex items-center gap-2 border-b border-destructive/20 bg-destructive/10 px-4 py-2 text-xs font-semibold text-foreground">
                    <XCircle className="h-3.5 w-3.5 text-destructive" aria-hidden="true" />
                    {t("codelab.compileError")}
                  </div>
                  <pre className="cl-output max-h-72 overflow-auto bg-card p-4 font-mono text-[12px] leading-relaxed text-foreground/85 whitespace-pre-wrap">
                    {outcome.judge.stderr || "(no diagnostics)"}
                  </pre>
                </div>
              )}

              {outcome && outcome.judge.compiled && (
                <div className="overflow-hidden rounded-xl border border-border/50">
                  <div
                    className={`flex items-center justify-between gap-2 border-b px-4 py-2.5 ${
                      passedAll
                        ? "border-success/20 bg-success/10"
                        : "border-warning/20 bg-warning/10"
                    }`}
                  >
                    <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                      {passedAll ? (
                        <CheckCircle2 className="h-4 w-4 text-success" aria-hidden="true" />
                      ) : (
                        <XCircle className="h-4 w-4 text-warning" aria-hidden="true" />
                      )}
                      {passedAll
                        ? t("codelab.allPassed")
                        : /* not accepted: either regular failures (complete run,
                             some [FAIL]) or an aborted/abnormal run — the harness
                             itself exits 1 on failures, so "incomplete" means the
                             RESULT trailer is missing or a clean-looking run had a
                             non-zero exit. */
                          !outcome.tests.complete ||
                            outcome.tests.passed === outcome.tests.total
                          ? t("codelab.outputIncomplete", {
                              passed: outcome.tests.passed,
                              total: outcome.tests.total,
                            })
                          : t("codelab.someFailed", {
                              passed: outcome.tests.passed,
                              total: outcome.tests.total,
                            })}
                    </div>
                    <span className="shrink-0 font-mono text-[11px] text-foreground/70">
                      {outcome.judge.backend} · {Math.round(outcome.judge.durationMs)}ms
                    </span>
                  </div>

                  {outcome.tests.cases.length > 0 && (
                    <ul className="max-h-64 overflow-auto bg-card px-4 py-3 text-[13px]">
                      {outcome.tests.cases.map((c, i) => (
                        <li key={i} className="flex items-start gap-2 py-0.5 font-mono text-[12px]">
                          {c.ok ? (
                            <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" aria-hidden="true" />
                          ) : (
                            <XCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-destructive" aria-hidden="true" />
                          )}
                          <span className={c.ok ? "text-foreground/70" : "text-foreground/90"}>
                            {c.label}
                            {c.detail && (
                              <span className="ml-2 text-foreground/70">({c.detail})</span>
                            )}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {(outcome.tests.cases.length === 0 || outcome.judge.stderr) && (
                    <div className="border-t border-border/40 bg-card px-4 py-3">
                      {outcome.tests.cases.length === 0 && (
                        <>
                          <div className="mb-1 text-[11px] font-medium text-foreground/70">stdout</div>
                          <pre className="cl-output max-h-48 overflow-auto font-mono text-[12px] leading-relaxed text-foreground/80 whitespace-pre-wrap">
                            {outcome.judge.stdout || "(empty)"}
                          </pre>
                        </>
                      )}
                      {outcome.judge.stderr && (
                        <>
                          <div className="mb-1 mt-2 text-[11px] font-medium text-foreground/70">stderr</div>
                          <pre className="cl-output max-h-40 overflow-auto font-mono text-[12px] leading-relaxed text-warning whitespace-pre-wrap">
                            {outcome.judge.stderr}
                          </pre>
                        </>
                      )}
                    </div>
                  )}
                </div>
              )}

              {passedAll && (
                <div className="mt-4 rounded-xl border border-success/25 bg-success/5 px-4 py-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-sm text-foreground/80">{t("codelab.nicework")}</span>
                    {next && (
                      <Link
                        href={`/code-lab/${next.id}`}
                        className="cl-link -mr-2 inline-flex min-h-[44px] items-center gap-1 px-2 text-sm font-medium hover:underline"
                      >
                        {t("codelab.nextProblem")}
                        <ChevronRight className="h-4 w-4" aria-hidden="true" />
                      </Link>
                    )}
                  </div>
                  {problem.nextSteps && problem.nextSteps.length > 0 && (
                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-success/15 pt-2 text-xs">
                      <span className="text-foreground/70">{t("codelab.nextUp")}</span>
                      {problem.nextSteps.map((step, i) =>
                        step.kind === "problem" ? (
                          <Link
                            key={i}
                            href={`/code-lab/${step.id}`}
                            className="cl-link inline-flex min-h-[44px] items-center px-2 font-mono hover:underline"
                          >
                            {step.id.toUpperCase()}
                          </Link>
                        ) : (
                          <Link
                            key={i}
                            href={`/module/${step.moduleId}/lesson/${step.lessonId}`}
                            className="cl-link inline-flex min-h-[44px] items-center px-2 hover:underline"
                          >
                            {t("codelab.relatedLesson")}
                          </Link>
                        ),
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
