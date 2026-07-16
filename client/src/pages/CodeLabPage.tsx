/* ============================================================
   Code Lab — problem list (/code-lab)
   Four tracks (c0 Preflight / C Systems / C++ / Kernel), all
   derived from problemTracks — nothing here hardcodes a track
   set. The c0 track renders as teaching stages (h2 track →
   h3 stage → h4 card) with per-stage progress and optional
   markers; C Systems renders as six visible teaching stages.
   ============================================================ */
import { use, useMemo, useState } from "react";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { useLocale } from "@/contexts/LocaleContext";
import { PageShell } from "@/components/layout/PageShell";
import { DifficultyBadge, codeLabDifficultyTones } from "@/components/ui/difficulty-badge";
import { useCodeLabProgress } from "@/hooks/useCodeLabProgress";
import {
  loadCatalog,
  problemTracks,
  warmupStages,
  cSystemsStages,
  cSystemsRecommendedOrder,
  type CatalogEntry,
  type ProblemDifficulty,
} from "@/data/code_problems_index";
import {
  Terminal, Braces, Cpu, ListChecks, CheckCircle2, CircleDashed, Circle, Clock, Zap,
  FlaskConical, type LucideIcon,
} from "lucide-react";

const trackIcons: Record<string, LucideIcon> = {
  c0: ListChecks,
  c: Terminal,
  cpp: Braces,
  kernel: Cpu,
};

const difficultyFilters: ProblemDifficulty[] = ["warmup", "easy", "medium", "hard"];

function StatusIcon({ status }: { status: "unsolved" | "attempted" | "solved" }) {
  const { t } = useTranslation();
  const label = t(`codelab.status.${status}`);
  if (status === "solved")
    return <CheckCircle2 className="h-4 w-4 shrink-0 text-success" aria-label={label} />;
  if (status === "attempted")
    return <CircleDashed className="h-4 w-4 shrink-0 text-warning" aria-label={label} />;
  return <Circle className="h-4 w-4 shrink-0 text-foreground/70" aria-label={label} />;
}

/** Order problems inside a track: C Systems follows the recommended
    lesson-flow order; everything else follows problem numbers. */
function orderTrack(trackId: string, list: CatalogEntry[]): CatalogEntry[] {
  if (trackId === "c") {
    const rank = new Map(cSystemsRecommendedOrder.map((id, i) => [id, i]));
    return [...list].sort(
      (a, b) => (rank.get(a.id) ?? 99) - (rank.get(b.id) ?? 99) || a.number - b.number,
    );
  }
  return [...list].sort((a, b) => a.number - b.number);
}

function ProblemCard({
  p,
  status,
  locale,
  headingLevel,
  difficultyLabel,
}: {
  p: CatalogEntry;
  status: "unsolved" | "attempted" | "solved";
  locale: "zh" | "en";
  headingLevel: "h3" | "h4";
  difficultyLabel: string;
}) {
  const Heading = headingLevel;
  return (
    <Link href={`/code-lab/${p.id}`} className="min-w-0">
      <div className="group flex h-full min-w-0 cursor-pointer flex-col overflow-hidden rounded-xl border border-border/50 bg-card p-4 transition-colors hover:border-primary/35">
        <div className="mb-2 flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <StatusIcon status={status} />
            <span className="shrink-0 font-mono text-[11px] text-foreground/70">
              {p.id.toUpperCase()}
            </span>
            <Heading className="min-w-0 truncate text-sm font-semibold text-foreground/90 group-hover:text-foreground">
              {locale === "en" ? p.titleEn : p.title}
            </Heading>
          </div>
          <DifficultyBadge
            className={`shrink-0 ${p.difficulty !== "warmup" ? `cl-diff-${p.difficulty}` : ""}`}
            tone={codeLabDifficultyTones[p.difficulty]}
          >
            {difficultyLabel}
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
}

export default function CodeLabPage() {
  const { t } = useTranslation();
  const { locale } = useLocale();
  const problems = use(loadCatalog());
  const { getStatus, solvedCount } = useCodeLabProgress();
  const [difficulty, setDifficulty] = useState<ProblemDifficulty | "all">("all");

  const byTrack = useMemo(() => {
    const m: Record<string, CatalogEntry[]> = Object.fromEntries(
      problemTracks.map((tr) => [tr.id, []]),
    );
    for (const p of problems)
      if (difficulty === "all" || p.difficulty === difficulty) m[p.track]?.push(p);
    for (const id of Object.keys(m)) m[id] = orderTrack(id, m[id]);
    return m;
  }, [problems, difficulty]);

  const totalMinutes = useMemo(() => problems.reduce((s, p) => s + p.minutes, 0), [problems]);

  const diffLabel = (d: ProblemDifficulty) => t(`codelab.difficulty.${d}`);

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
              aria-label={t("codelab.progressAria")}
              aria-valuenow={solvedCount}
              aria-valuemin={0}
              aria-valuemax={problems.length}
              aria-valuetext={`${solvedCount} / ${problems.length}`}
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
        <div
          className="mb-4 flex flex-wrap gap-2"
          role="group"
          aria-label={t("codelab.filterByDifficulty")}
        >
          {(["all", ...difficultyFilters] as const).map((d) => (
            <button
              key={d}
              onClick={() => setDifficulty(d)}
              aria-pressed={difficulty === d}
              className={`min-h-[44px] rounded-full border px-4 text-xs font-medium transition-colors ${
                difficulty === d
                  ? "cl-link border-primary/40 bg-primary/10 font-semibold"
                  : "border-border/60 text-foreground/75 hover:border-border hover:text-foreground"
              }`}
            >
              {d === "all" ? t("codelab.filterAll") : diffLabel(d)}
            </button>
          ))}
        </div>

        {/* in-page track jump — only tracks with matching problems under
            the active filter get a link, so no anchor points at a hidden section */}
        <nav aria-label={t("codelab.jumpToTracks")} className="mb-10 flex flex-wrap gap-x-4 gap-y-2">
          {problemTracks.map((track) => {
            const Icon = trackIcons[track.id] ?? Terminal;
            if ((byTrack[track.id]?.length ?? 0) === 0) return null;
            return (
              <a
                key={track.id}
                href={`#track-${track.id}`}
                className="flex min-h-[44px] items-center gap-1.5 px-1 text-xs text-foreground/75 underline-offset-4 hover:text-foreground hover:underline"
              >
                <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                {locale === "en" ? track.titleEn : track.title}
              </a>
            );
          })}
        </nav>

        {/* tracks */}
        <div className="space-y-14">
          {problemTracks.map((track) => {
            const list = byTrack[track.id] ?? [];
            // With an active difficulty filter, hide tracks that have no
            // matching problems instead of rendering empty shells.
            if (list.length === 0 && difficulty !== "all") return null;

            const all = problems.filter((p) => p.track === track.id);
            const solved = all.filter((p) => getStatus(p.id) === "solved").length;
            const Icon = trackIcons[track.id] ?? Terminal;

            return (
              <section key={track.id} id={`track-${track.id}`} aria-labelledby={`track-h-${track.id}`}>
                <div className="mb-4 flex min-w-0 flex-wrap items-center justify-between gap-3">
                  <div className="flex min-w-0 flex-wrap items-center gap-2.5">
                    <Icon className="h-[18px] w-[18px] text-primary" aria-hidden="true" />
                    <h2 id={`track-h-${track.id}`} className="text-lg font-semibold tracking-tight">
                      {locale === "en" ? track.titleEn : track.title}
                    </h2>
                    <span className="font-mono text-xs text-foreground/75">
                      {solved}/{all.length}
                    </span>
                  </div>
                </div>
                <p className="mb-5 max-w-3xl text-[13px] leading-relaxed text-foreground/80">
                  {locale === "en" ? track.descriptionEn : track.description}
                  {(track.id === "c0" || track.id === "c") && (
                    <span className="mt-1 block text-foreground/70">
                      {t(
                        track.id === "c0"
                          ? "codelab.suggestedOrder"
                          : "codelab.cSystemsSuggestedOrder",
                      )}
                    </span>
                  )}
                </p>

                {track.id === "c0" ? (
                  /* ---- c0: stage-grouped (h3 stage → h4 cards) ---- */
                  <div className="space-y-8">
                    {warmupStages.map((stage) => {
                      const stageAll = all.filter((p) => p.warmupStage === stage.id);
                      if (stageAll.length === 0) return null; // e.g. posix pending probe
                      const stageList = list.filter((p) => p.warmupStage === stage.id);
                      if (stageList.length === 0 && difficulty !== "all") return null;
                      const stageSolved = stageAll.filter(
                        (p) => getStatus(p.id) === "solved",
                      ).length;
                      return (
                        <div key={stage.id}>
                          <div className="mb-3 flex flex-wrap items-center gap-2.5">
                            <h3 className="text-sm font-semibold text-foreground/90">
                              {locale === "en" ? stage.titleEn : stage.title}
                            </h3>
                            <span className="font-mono text-[11px] text-foreground/70">
                              {stageSolved}/{stageAll.length}
                            </span>
                            {stage.optional && (
                              <span className="rounded-full border border-border bg-muted px-2 py-0.5 text-[10px] font-medium text-foreground/75">
                                {t("codelab.optional")}
                              </span>
                            )}
                          </div>
                          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                            {stageList.map((p) => (
                              <ProblemCard
                                key={p.id}
                                p={p}
                                status={getStatus(p.id)}
                                locale={locale}
                                headingLevel="h4"
                                difficultyLabel={diffLabel(p.difficulty)}
                              />
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : track.id === "c" ? (
                  /* ---- C Systems: six recommended stages (h3 → h4) ---- */
                  <div className="space-y-8">
                    {cSystemsStages.map((stage) => {
                      const stageAll = all.filter((p) => stage.problemIds.includes(p.id));
                      const stageList = list.filter((p) => stage.problemIds.includes(p.id));
                      if (stageList.length === 0 && difficulty !== "all") return null;
                      const stageSolved = stageAll.filter(
                        (p) => getStatus(p.id) === "solved",
                      ).length;
                      return (
                        <div key={stage.id}>
                          <div className="mb-3 flex min-w-0 flex-wrap items-center gap-2.5">
                            <h3 className="min-w-0 text-sm font-semibold text-foreground/90">
                              {locale === "en" ? stage.titleEn : stage.title}
                            </h3>
                            <span className="font-mono text-[11px] text-foreground/70">
                              {stageSolved}/{stageAll.length}
                            </span>
                          </div>
                          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                            {stageList.map((p) => (
                              <ProblemCard
                                key={p.id}
                                p={p}
                                status={getStatus(p.id)}
                                locale={locale}
                                headingLevel="h4"
                                difficultyLabel={diffLabel(p.difficulty)}
                              />
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  /* ---- C++ / Kernel: flat grid (h3 cards) ---- */
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    {list.map((p) => (
                      <ProblemCard
                        key={p.id}
                        p={p}
                        status={getStatus(p.id)}
                        locale={locale}
                        headingLevel="h3"
                        difficultyLabel={diffLabel(p.difficulty)}
                      />
                    ))}
                  </div>
                )}
              </section>
            );
          })}
        </div>

        <p className="mt-12 text-[11px] leading-relaxed text-foreground/75">
          {t("codelab.judgeDisclaimer")}
        </p>
      </div>
    </PageShell>
  );
}
