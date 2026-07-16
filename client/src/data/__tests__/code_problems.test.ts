/* ============================================================
   Code Lab problem-bank invariants — mechanizes the checks from
   the 2026-07-16 review gate so regressions cannot slip back in:
   counts, unique ids, harness protocol, bilingual completeness
   (including English starter code and tags), and lesson links.
   ============================================================ */
import { describe, it, expect } from "vitest";
import { loadAllProblems, problemTracks } from "../code_problems_index";
import { loadMicroLessonModule } from "../micro_lessons_index";
import { isKnownProblemId } from "@/hooks/useCodeLabProgress";

const CJK = /[一-鿿]/;

describe("code problem bank", async () => {
  const problems = await loadAllProblems();

  it("has exactly 40 problems in 16/12/12 tracks", () => {
    expect(problems).toHaveLength(40);
    const byTrack = (t: string) => problems.filter((p) => p.track === t).length;
    expect(byTrack("c")).toBe(16);
    expect(byTrack("cpp")).toBe(12);
    expect(byTrack("kernel")).toBe(12);
    expect(problemTracks.map((t) => t.id)).toEqual(["c", "cpp", "kernel"]);
  });

  it("keeps the storage hook's known-id space in sync with the bank", () => {
    for (const p of problems) expect(isKnownProblemId(p.id), p.id).toBe(true);
    // and the known-id space admits nothing beyond the bank
    expect(isKnownProblemId("c-17")).toBe(false);
    expect(isKnownProblemId("cpp-13")).toBe(false);
    expect(isKnownProblemId("k-13")).toBe(false);
  });

  it("has unique ids and per-track unique numbers", () => {
    expect(new Set(problems.map((p) => p.id)).size).toBe(40);
    for (const track of ["c", "cpp", "kernel"]) {
      const nums = problems.filter((p) => p.track === track).map((p) => p.number);
      expect(new Set(nums).size).toBe(nums.length);
    }
  });

  it("every harness follows the judge protocol", () => {
    for (const p of problems) {
      expect(p.harness, p.id).toContain("{{USER_CODE}}");
      expect(p.harness, p.id).toContain("RESULT %d/%d");
      expect(p.harness, p.id).toContain("return _pass == _total ? 0 : 1;");
      // solution must be a drop-in replacement, not the starter itself
      expect(p.solution, p.id).not.toBe(p.starterCode);
      expect(p.starterCode, p.id).toContain("TODO");
    }
  });

  it("is fully bilingual — including starter code and tags", () => {
    for (const p of problems) {
      for (const field of [
        "title", "titleEn", "brief", "briefEn", "solutionNote", "solutionNoteEn",
        "starterCode", "starterCodeEn",
      ] as const) {
        expect(p[field], `${p.id}.${field}`).toBeTruthy();
      }
      expect(p.description.length, p.id).toBeGreaterThan(0);
      expect(p.descriptionEn.length, p.id).toBe(p.description.length);
      expect(p.hints.length, p.id).toBeGreaterThan(0);
      expect(p.hintsEn.length, p.id).toBe(p.hints.length);
      expect(p.tagsEn.length, p.id).toBe(p.tags.length);
      // review finding: EN-locale code surfaces must not contain Chinese
      expect(CJK.test(p.starterCodeEn), `${p.id}.starterCodeEn has CJK`).toBe(false);
      expect(CJK.test(p.tagsEn.join(" ")), `${p.id}.tagsEn has CJK`).toBe(false);
      expect(CJK.test(p.harness), `${p.id}.harness has CJK`).toBe(false);
      expect(CJK.test(p.solution), `${p.id}.solution has CJK`).toBe(false);
    }
  });

  it("keeps starterCodeEn structurally identical to starterCode (comments aside)", () => {
    const strip = (code: string) =>
      code
        .replace(/\/\*[\s\S]*?\*\//g, "")
        .replace(/\/\/[^\n]*/g, "")
        .replace(/\s+/g, " ")
        .trim();
    for (const p of problems) {
      expect(strip(p.starterCodeEn), p.id).toBe(strip(p.starterCode));
    }
  });

  it("links every lessonId to a real c-cpp micro-lesson", async () => {
    const mod = await loadMicroLessonModule("c-cpp", "zh");
    const lessonIds = new Set(
      (mod?.groups ?? []).flatMap((g) => g.lessons.map((l) => l.id)),
    );
    expect(lessonIds.size).toBeGreaterThanOrEqual(19);
    for (const p of problems) {
      if (p.lessonId) expect(lessonIds.has(p.lessonId), `${p.id} -> ${p.lessonId}`).toBe(true);
    }
  });

  it("has sane metadata", () => {
    for (const p of problems) {
      expect(["easy", "medium", "hard"]).toContain(p.difficulty);
      expect(p.minutes, p.id).toBeGreaterThan(0);
      expect(["c", "cpp"]).toContain(p.language);
    }
  });
});
