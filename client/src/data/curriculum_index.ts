/* ============================================================
   Curriculum index — resolves curriculum and glossary by locale
   Heavy data modules are loaded via dynamic import() so each
   locale's content is a separate chunk and never ships in the
   main bundle. Loads are memoized per locale.
   ============================================================ */

import type { Module, GlossaryTerm } from "./curriculum_types";

export type Locale = "zh" | "en";

function memoized<K, T>(cache: Map<K, Promise<T>>, key: K, load: () => Promise<T>): Promise<T> {
  let promise = cache.get(key);
  if (!promise) {
    promise = load().catch((err) => {
      // Drop failed loads (e.g. a chunk fetch that lost connectivity) so a retry can succeed
      cache.delete(key);
      throw err;
    });
    cache.set(key, promise);
  }
  return promise;
}

const curriculumCache = new Map<Locale, Promise<Module[]>>();
const glossaryCache = new Map<Locale, Promise<Record<string, GlossaryTerm[]>>>();

export function loadCurriculum(locale: Locale): Promise<Module[]> {
  return memoized(curriculumCache, locale, () =>
    locale === "en"
      ? import("./curriculum_en").then((m) => m.curriculumEn)
      : import("./curriculum").then((m) => m.curriculumZh),
  );
}

export function loadGlossaryByModule(locale: Locale): Promise<Record<string, GlossaryTerm[]>> {
  return memoized(glossaryCache, locale, () =>
    locale === "en"
      ? import("./glossary_data_en").then((m) => m.glossaryByModuleEn)
      : import("./glossary_data").then((m) => m.glossaryByModule),
  );
}

export function getTotalHours(curriculum: Module[]): number {
  return curriculum.reduce((sum, m) => sum + m.estimatedHours, 0);
}

export function getDifficultyLabels(locale: Locale): Record<string, string> {
  return locale === "en"
    ? {
        beginner: "Beginner",
        intermediate: "Intermediate",
        advanced: "Advanced",
        expert: "Expert",
      }
    : {
        beginner: "入门",
        intermediate: "进阶",
        advanced: "高级",
        expert: "专家",
      };
}
