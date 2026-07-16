/* ============================================================
   Code Lab problems index — lazy loads all three tracks as a
   separate chunk (they total ~120KB of source) and memoizes.
   ============================================================ */
import type { CodeProblem } from "./code_problems_types";

export { problemTracks } from "./code_problems_types";
export type { CodeProblem, ProblemTrack, ProblemDifficulty } from "./code_problems_types";

let cache: Promise<CodeProblem[]> | null = null;

export function loadAllProblems(): Promise<CodeProblem[]> {
  if (!cache) {
    cache = Promise.all([
      import("./code_problems_c"),
      import("./code_problems_cpp"),
      import("./code_problems_kernel"),
    ])
      .then(([c, cpp, kernel]) => [
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
