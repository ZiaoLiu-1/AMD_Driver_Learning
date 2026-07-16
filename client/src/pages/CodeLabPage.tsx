/* ============================================================
   Code Lab — problem list (/code-lab)
   LeetCode-style kernel-flavored C/C++ drills with an
   in-browser judge. Zero local setup required.
   ============================================================ */
import { use, useMemo, useState } from "react";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { useLocale } from "@/contexts/LocaleContext";
import { PageShell } from "@/components/layout/PageShell";
import { DifficultyBadge, interviewDifficultyTones } from "@/components/ui/difficulty-badge";
import { useCodeLabProgress } from "@/hooks/useCodeLabProgress";
import {
  loadAllProblems,
  problemTracks,
  type CodeProblem,
  type ProblemDifficulty,
} from "@/data/code_problems_index";
import {
  Terminal, Braces, Cpu, CheckCircle2, CircleDashed, Circle, Clock, Zap, FlaskConical,
} from "lucide-react";

const trackIcons = { c: Terminal, cpp: Braces, kernel: Cpu } as const;

const difficultyOrder: ProblemDifficulty[] = ["easy", "medium", "hard"];

function StatusIcon({ status }: { status: "unsolved" | "attempted" | "solved" }) {
  if (status === "solved")
    return <CheckCircle2 className="h-4 w-4 text-success" aria-label="solved" />;
  if (status === "attempted")
    return <CircleDashed className="h-4 w-4 text-warning" aria-label="attempted" />;
  return <Circle className="h-4 w-4 text-foreground/70" aria-label="unsolved" />;
}

export default function CodeLabPage() {
  const { t } = useTranslation();
  const { locale } = useLocale();
  const problems = use(loadAllProblems());
  const { getStatus, solvedCount } = useCodeLabProgress();
  const [difficulty, setDifficulty] = useState<ProblemDifficulty | "all">("all");

  const byTrack = useMemo(() => {
    const m: Record<string, CodeProblem[]> = { c: [], cpp: [], kernel: [] };
    for (const p of problems)
      if (difficulty === "all" || p.difficulty === difficulty) m[p.track].push(p);
    for (const k of Object.keys(m)) m[k].sort((a, b) => a.number - b.number);
    return m;
  }, [problems, difficulty]);

  const totalMinutes = useMemo(
    () => problems.reduce((s, p) => s + p.minutes, 0),
    [problems],
  );

  return (
    <PageShell
      backHref="/"
      backLabel={t("nav.home")}
      currentLabel={t("codelab.title")}
      containerWidthClassName="max-w-6xl"
    >
      <div className="mx-auto max-w-6xl px-4 py-10 md:px-8">
        {/* header */}
        <div className="mb-10">
          <div className="flex items-center gap-2.5 mb-3">
            <FlaskConical className="h-5 w-5 text-primary" aria-hidden="true" />
            <h1 className="text-2xl font-bold tracking-tight">{t("codelab.title")}</h1>
          </div>
          <p className="max-w-3xl text-sm leading-relaxed text-foreground/75">
            {t("codelab.subtitle")}
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-x-8 gap-y-3">
            <div className="flex items-center gap-2 text-sm">
              <span className="font-mono font-semibold text-foreground">
                {solvedCount}/{problems.length}
              </span>
              <span className="text-foreground/75">{t("codelab.solvedLabel")}</span>
            </div>
            <div
              className="h-1.5 w-48 overflow-hidden rounded-full bg-muted"
              role="progressbar"
              aria-valuenow={solvedCount}
              aria-valuemin={0}
              aria-valuemax={problems.length}
            >
              <div
                className="h-full rounded-full bg-primary transition-[width] duration-500"
                style={{ width: `${(solvedCount / Math.max(problems.length, 1)) * 100}%` }}
              />
            </div>
            <div className="flex items-center gap-1.5 text-xs text-foreground/75">
              <Clock className="h-3.5 w-3.5" aria-hidden="true" />
              {t("codelab.totalMinutes", { count: totalMinutes })}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-foreground/75">
              <Zap className="h-3.5 w-3.5" aria-hidden="true" />
              {t("codelab.zeroSetup")}
            </div>
          </div>
        </div>

        {/* difficulty filter */}
        <div className="mb-8 flex flex-wrap gap-2" role="group" aria-label={t("codelab.filterByDifficulty")}>
          {(["all", ...difficultyOrder] as const).map((d) => (
            <button
              key={d}
              onClick={() => setDifficulty(d)}
              aria-pressed={difficulty === d}
              className={`min-h-[36px] rounded-full border px-4 text-xs font-medium transition-colors ${
                difficulty === d
                  ? "cl-link border-primary/40 bg-primary/10 font-semibold"
                  : "border-border/60 text-foreground/75 hover:border-border hover:text-foreground"
              }`}
            >
              {d === "all" ? t("codelab.filterAll") : t(`codelab.difficulty.${d}`)}
            </button>
          ))}
        </div>

        {/* tracks */}
        <div className="space-y-12">
          {problemTracks.map((track) => {
            const list = byTrack[track.id] ?? [];
            const all = problems.filter((p) => p.track === track.id);
            const solved = all.filter((p) => getStatus(p.id) === "solved").length;
            const Icon = trackIcons[track.id];
            return (
              <section key={track.id} aria-labelledby={`track-${track.id}`}>
                <div className="mb-4 flex min-w-0 flex-wrap items-center justify-between gap-3">
                  <div className="flex min-w-0 flex-wrap items-center gap-2.5">
                    <Icon className="h-[18px] w-[18px] text-primary" aria-hidden="true" />
                    <h2 id={`track-${track.id}`} className="text-lg font-semibold tracking-tight">
                      {locale === "en" ? track.titleEn : track.title}
                    </h2>
                    <span className="font-mono text-xs text-foreground/75">
                      {solved}/{all.length}
                    </span>
                  </div>
                </div>
                <p className="mb-5 max-w-3xl text-[13px] leading-relaxed text-foreground/80">
                  {locale === "en" ? track.descriptionEn : track.description}
                </p>

                {list.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-border/60 px-5 py-8 text-center text-sm text-foreground/75">
                    {t("codelab.noMatch")}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    {list.map((p) => {
                      const status = getStatus(p.id);
                      return (
                        <Link key={p.id} href={`/code-lab/${p.id}`} className="min-w-0">
                          <div className="group flex h-full min-w-0 cursor-pointer flex-col overflow-hidden rounded-xl border border-border/50 bg-card p-4 transition-colors hover:border-primary/35">
                            <div className="mb-2 flex items-start justify-between gap-3">
                              <div className="flex min-w-0 items-center gap-2.5">
                                <StatusIcon status={status} />
                                <span className="shrink-0 font-mono text-[11px] text-foreground/70">
                                  {p.id.toUpperCase()}
                                </span>
                                <h3 className="min-w-0 truncate text-sm font-semibold text-foreground/90 group-hover:text-foreground">
                                  {locale === "en" ? p.titleEn : p.title}
                                </h3>
                              </div>
                              <DifficultyBadge className={`shrink-0 cl-diff-${p.difficulty}`} tone={interviewDifficultyTones[p.difficulty]}>
                                {t(`codelab.difficulty.${p.difficulty}`)}
                              </DifficultyBadge>
                            </div>
                            <p className="mb-3 line-clamp-2 flex-1 text-xs leading-relaxed text-foreground/80">
                              {locale === "en" ? p.briefEn : p.brief}
                            </p>
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-foreground/70">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" aria-hidden="true" />
                                ~{p.minutes} min
                              </span>
                              <span className="font-mono">{p.language === "c" ? "C11" : "C++17"}</span>
                              {(locale === "en" ? p.tagsEn : p.tags).slice(0, 2).map((tag) => (
                                <span key={tag} className="rounded bg-muted px-1.5 py-0.5 font-mono">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </section>
            );
          })}
        </div>

        <p className="mt-12 text-[11px] leading-relaxed text-foreground/70">
          {t("codelab.judgeDisclaimer")}
        </p>
      </div>
    </PageShell>
  );
}
