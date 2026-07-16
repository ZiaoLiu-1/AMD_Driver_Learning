/* ============================================================
   Code Lab — lightweight catalog
   ------------------------------------------------------------
   The list page (/code-lab) only needs card metadata, NOT the
   heavy harness/solution/description strings (~120KB per track).
   This module derives a compact catalog from the full banks but
   is imported by a dedicated chunk so the list view stays small;
   the full problem is fetched on demand by the detail page.

   Keep CatalogEntry a strict subset of CodeProblem so a single
   render path can consume either shape.
   ============================================================ */
import type {
  CodeProblem,
  ProblemTrack,
  ProblemDifficulty,
  WarmupStage,
} from "./code_problems_types";

export interface CatalogEntry {
  id: string;
  track: ProblemTrack;
  number: number;
  title: string;
  titleEn: string;
  difficulty: ProblemDifficulty;
  minutes: number;
  tags: string[];
  tagsEn: string[];
  brief: string;
  briefEn: string;
  language: "c" | "cpp";
  warmupStage?: WarmupStage;
}

export function toCatalogEntry(p: CodeProblem): CatalogEntry {
  return {
    id: p.id,
    track: p.track,
    number: p.number,
    title: p.title,
    titleEn: p.titleEn,
    difficulty: p.difficulty,
    minutes: p.minutes,
    tags: p.tags,
    tagsEn: p.tagsEn,
    brief: p.brief,
    briefEn: p.briefEn,
    language: p.language,
    warmupStage: p.warmupStage,
  };
}
