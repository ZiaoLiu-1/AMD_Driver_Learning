/* ============================================================
   Code Lab problems index — lazy loads all three tracks as a
   separate chunk (they total ~120KB of source) and memoizes.
   ============================================================ */
import type { CodeProblem } from "./code_problems_types";

export {
  problemTracks,
  warmupStages,
  cSystemsStages,
  cSystemsRecommendedOrder,
} from "./code_problems_types";
export type {
  CodeProblem, ProblemTrack, ProblemDifficulty, WarmupStage, WarmupStageMeta,
  CSystemsStageMeta, ProblemNextStep,
} from "./code_problems_types";
export type { CatalogEntry } from "./code_problems_catalog";

let catalogCache: Promise<import("./code_problems_catalog").CatalogEntry[]> | null = null;

/** Lightweight, harness-free catalog for the list view — its own chunk,
    so /code-lab first paint does not download every harness/solution. */
export function loadCatalog() {
  if (!catalogCache) {
    catalogCache = import("./code_problems_catalog_data")
      .then((m) => m.problemCatalog)
      .catch((err) => {
        catalogCache = null;
        throw err;
      });
  }
  return catalogCache;
}

let cache: Promise<CodeProblem[]> | null = null;

export function loadAllProblems(): Promise<CodeProblem[]> {
  if (!cache) {
    cache = Promise.all([
      import("./code_problems_warmup"),
      import("./code_problems_c"),
      import("./code_problems_cpp"),
      import("./code_problems_kernel"),
    ])
      .then(([warmup, c, cpp, kernel]) => [
        ...warmup.codeProblemsWarmup,
        ...c.codeProblemsC,
        ...cpp.codeProblemsCpp,
        ...kernel.codeProblemsKernel,
      ])
      .catch((err) => {
        cache = null; // allow retry after a failed chunk fetch
        throw err;
      });
  }
  return cache;
}
