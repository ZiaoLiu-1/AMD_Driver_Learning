import { describe, it, expect } from "vitest";
import { loadCurriculum, loadGlossaryByModule, getTotalHours } from "../curriculum_index";
import {
  loadMicroLessonModule,
  loadAllMicroLessons,
  microLessonModuleIds,
} from "../micro_lessons_index";

describe("locale-aware content loaders", () => {
  it("loads curriculum for both locales with matching module ids", async () => {
    const [zh, en] = await Promise.all([loadCurriculum("zh"), loadCurriculum("en")]);
    expect(zh.map((m) => m.id)).toEqual(en.map((m) => m.id));
    expect(getTotalHours(zh)).toBeGreaterThan(0);
  });

  it("memoizes curriculum loads per locale", async () => {
    const a = await loadCurriculum("zh");
    const b = await loadCurriculum("zh");
    expect(a).toBe(b);
  });

  it("covers every curriculum module that has micro-lessons in the loader map", async () => {
    const zh = await loadCurriculum("zh");
    const curriculumIds = new Set(zh.map((m) => m.id));
    for (const id of microLessonModuleIds) {
      expect(curriculumIds.has(id), `loader id "${id}" missing from curriculum`).toBe(true);
    }
  });

  it("loads micro-lessons for every module id in both locales", async () => {
    for (const locale of ["zh", "en"] as const) {
      const all = await loadAllMicroLessons(locale);
      expect(Object.keys(all).sort()).toEqual([...microLessonModuleIds].sort());
      for (const id of microLessonModuleIds) {
        expect(all[id].groups?.length, `${locale}:${id} has no lesson groups`).toBeGreaterThan(0);
      }
    }
  });

  it("resolves undefined for unknown module ids", async () => {
    await expect(loadMicroLessonModule("not-a-module", "zh")).resolves.toBeUndefined();
  });

  it("loads glossary keyed by module id for both locales", async () => {
    const [zh, en] = await Promise.all([loadGlossaryByModule("zh"), loadGlossaryByModule("en")]);
    expect(Object.keys(zh).length).toBeGreaterThan(0);
    expect(Object.keys(en).length).toBeGreaterThan(0);
  });
});
