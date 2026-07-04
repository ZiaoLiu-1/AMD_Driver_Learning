/* ============================================================
   Micro-lessons index — resolves micro-lessons by locale
   Each module's lessons are loaded via dynamic import() keyed
   by moduleId + locale, so a lesson page only fetches its own
   module's data in the active language. Loads are memoized.
   ============================================================ */

import type { MicroLessonModule } from "./micro_lesson_types";

export type Locale = "zh" | "en";

type ModuleLoader = () => Promise<MicroLessonModule>;

const lessonLoaders: Record<string, Record<Locale, ModuleLoader>> = {
  intro: {
    zh: () => import("./module0_micro_lessons").then((m) => m.module0MicroLessons),
    en: () => import("./module0_micro_lessons_en").then((m) => m.module0MicroLessonsEn),
  },
  ecosystem: {
    zh: () => import("./module05_micro_lessons").then((m) => m.module05MicroLessons),
    en: () => import("./module05_micro_lessons_en").then((m) => m.module05MicroLessonsEn),
  },
  "c-cpp": {
    zh: () => import("./c_cpp_micro_lessons").then((m) => m.cCppMicroLessons),
    en: () => import("./c_cpp_micro_lessons_en").then((m) => m.cCppMicroLessonsEn),
  },
  prerequisites: {
    zh: () => import("./module1_micro_lessons").then((m) => m.module1MicroLessons),
    en: () => import("./module1_micro_lessons_en").then((m) => m.module1MicroLessonsEn),
  },
  "gpu-arch": {
    zh: () => import("./gpu_arch_micro_lessons").then((m) => m.gpuArchMicroLessons),
    en: () => import("./gpu_arch_micro_lessons_en").then((m) => m.gpuArchMicroLessonsEn),
  },
  hardware: {
    zh: () => import("./module2_micro_lessons").then((m) => m.module2MicroLessons),
    en: () => import("./module2_micro_lessons_en").then((m) => m.module2MicroLessonsEn),
  },
  kernel: {
    zh: () => import("./module3_micro_lessons").then((m) => m.module3MicroLessons),
    en: () => import("./module3_micro_lessons_en").then((m) => m.module3MicroLessonsEn),
  },
  drm: {
    zh: () => import("./module4_micro_lessons").then((m) => m.module4MicroLessons),
    en: () => import("./module4_micro_lessons_en").then((m) => m.module4MicroLessonsEn),
  },
  amdgpu: {
    zh: () => import("./module5_micro_lessons").then((m) => m.module5MicroLessons),
    en: () => import("./module5_micro_lessons_en").then((m) => m.module5MicroLessonsEn),
  },
  debugging: {
    zh: () => import("./module6_micro_lessons").then((m) => m.module6MicroLessons),
    en: () => import("./module6_micro_lessons_en").then((m) => m.module6MicroLessonsEn),
  },
  "rocm-kernel": {
    zh: () => import("./module7_micro_lessons").then((m) => m.module7MicroLessons),
    en: () => import("./module7_micro_lessons_en").then((m) => m.module7MicroLessonsEn),
  },
  "rocm-compute": {
    zh: () => import("./module8_micro_lessons").then((m) => m.module8MicroLessons),
    en: () => import("./module8_micro_lessons_en").then((m) => m.module8MicroLessonsEn),
  },
  llvm: {
    zh: () => import("./module9_micro_lessons").then((m) => m.module9MicroLessons),
    en: () => import("./module9_micro_lessons_en").then((m) => m.module9MicroLessonsEn),
  },
  testing: {
    zh: () => import("./module10_micro_lessons").then((m) => m.module10MicroLessons),
    en: () => import("./module10_micro_lessons_en").then((m) => m.module10MicroLessonsEn),
  },
  career: {
    zh: () => import("./module11_micro_lessons").then((m) => m.module11MicroLessons),
    en: () => import("./module11_micro_lessons_en").then((m) => m.module11MicroLessonsEn),
  },
};

export const microLessonModuleIds: string[] = Object.keys(lessonLoaders);

const moduleCache = new Map<string, Promise<MicroLessonModule | undefined>>();
const allCache = new Map<Locale, Promise<Record<string, MicroLessonModule>>>();
const resolvedAll = new Map<Locale, Record<string, MicroLessonModule>>();

function memoized<K, T>(cache: Map<K, Promise<T>>, key: K, load: () => Promise<T>): Promise<T> {
  let promise = cache.get(key);
  if (!promise) {
    promise = load().catch((err) => {
      cache.delete(key);
      throw err;
    });
    cache.set(key, promise);
  }
  return promise;
}

/**
 * Loads one module's micro-lessons in the given locale.
 * Resolves to undefined for unknown module ids.
 */
export function loadMicroLessonModule(
  moduleId: string,
  locale: Locale,
): Promise<MicroLessonModule | undefined> {
  return memoized(moduleCache, `${locale}:${moduleId}`, () => {
    const loader = lessonLoaders[moduleId]?.[locale];
    return loader ? loader() : Promise.resolve(undefined);
  });
}

/** Loads every module's micro-lessons for the given locale. */
export function loadAllMicroLessons(locale: Locale): Promise<Record<string, MicroLessonModule>> {
  return memoized(allCache, locale, async () => {
    const entries = await Promise.all(
      microLessonModuleIds.map(
        async (id) => [id, await loadMicroLessonModule(id, locale)] as const,
      ),
    );
    const all: Record<string, MicroLessonModule> = {};
    for (const [id, mod] of entries) {
      if (mod) all[id] = mod;
    }
    resolvedAll.set(locale, all);
    return all;
  });
}

/** Synchronous view of already-loaded data; undefined until loadAllMicroLessons resolves. */
export function peekAllMicroLessons(locale: Locale): Record<string, MicroLessonModule> | undefined {
  return resolvedAll.get(locale);
}

export function isMicroLessonLocalized(locale: Locale): boolean {
  return true;
}
