import { describe, it, expect } from "vitest";
import { curriculumZh } from "../curriculum";
import { curriculumEn } from "../curriculum_en";

describe("curriculum data integrity", () => {
  it("zh and en have the same module count", () => {
    expect(curriculumZh.length).toBe(curriculumEn.length);
    expect(curriculumZh.length).toBeGreaterThanOrEqual(12);
  });

  it("zh and en have matching module IDs", () => {
    const zhIds = curriculumZh.map((m) => m.id);
    const enIds = curriculumEn.map((m) => m.id);
    expect(zhIds).toEqual(enIds);
  });

  it("every module has required fields", () => {
    for (const modules of [curriculumZh, curriculumEn]) {
      for (const m of modules) {
        expect(m.id).toBeTruthy();
        expect(m.number).toBeDefined();
        expect(m.title).toBeTruthy();
        expect(m.icon).toBeTruthy();
        expect(m.description).toBeTruthy();
        expect(m.estimatedHours).toBeGreaterThan(0);
        expect(["beginner", "intermediate", "advanced", "expert"]).toContain(
          m.difficulty,
        );
        expect(m.subModules.length).toBeGreaterThan(0);
        expect(m.theory).toBeDefined();
        expect(m.theory.overview).toBeTruthy();
        expect(m.theory.sections.length).toBeGreaterThan(0);
      }
    }
  });

  it("no duplicate module IDs", () => {
    for (const modules of [curriculumZh, curriculumEn]) {
      const ids = modules.map((m) => m.id);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });

  it("every sub-module has an id and title", () => {
    for (const modules of [curriculumZh, curriculumEn]) {
      for (const m of modules) {
        for (const sub of m.subModules) {
          expect(sub.id).toBeTruthy();
          expect(sub.title).toBeTruthy();
        }
      }
    }
  });
});
