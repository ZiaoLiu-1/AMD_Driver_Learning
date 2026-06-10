/* ============================================================
   Content hooks — Suspense-friendly access to lazy-loaded data
   Built on React 19 `use()`: loaders memoize their promise per
   locale/module, so identity is stable across renders and a
   resolved promise reads synchronously without re-suspending.
   Components using these must render under a <Suspense> boundary.
   ============================================================ */

import { use, useEffect, useReducer } from "react";
import type { Module, GlossaryTerm } from "@/data/curriculum_types";
import type { MicroLessonModule } from "@/data/micro_lesson_types";
import { loadCurriculum, loadGlossaryByModule, type Locale } from "@/data/curriculum_index";
import {
  loadAllMicroLessons,
  loadMicroLessonModule,
  peekAllMicroLessons,
} from "@/data/micro_lessons_index";

export function useCurriculum(locale: Locale): Module[] {
  return use(loadCurriculum(locale));
}

export function useGlossaryByModule(locale: Locale): Record<string, GlossaryTerm[]> {
  return use(loadGlossaryByModule(locale));
}

export function useMicroLessonModule(
  moduleId: string,
  locale: Locale,
): MicroLessonModule | undefined {
  return use(loadMicroLessonModule(moduleId, locale));
}

export function useAllMicroLessons(locale: Locale): Record<string, MicroLessonModule> {
  return use(loadAllMicroLessons(locale));
}

/**
 * Non-suspending variant: returns undefined until all modules for the
 * locale are loaded, then re-renders with the data. Use where lesson
 * data only enriches the view (e.g. topic counts on the home page)
 * and shouldn't block first paint.
 */
export function useAllMicroLessonsDeferred(
  locale: Locale,
): Record<string, MicroLessonModule> | undefined {
  const [, rerender] = useReducer((c: number) => c + 1, 0);
  useEffect(() => {
    let cancelled = false;
    loadAllMicroLessons(locale).then(
      () => {
        if (!cancelled) rerender();
      },
      (err) => {
        console.error("Failed to load micro-lessons", err);
      },
    );
    return () => {
      cancelled = true;
    };
  }, [locale]);
  return peekAllMicroLessons(locale);
}
