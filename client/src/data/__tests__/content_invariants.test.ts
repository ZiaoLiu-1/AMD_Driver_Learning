/* ============================================================
   Content invariants — permanently encodes the lessons from the
   2026-05-26 freshness audit + verification pass
   (references/content-freshness-verification-2026-05-26.md) and
   improvement-plan item P3-14.

   The May audit's core failure mode: a fix applied at one site
   regressed or survived elsewhere because nobody re-checked the
   whole repo for the same error class. These tests make each
   verified error class a permanent, mechanical check.
   ============================================================ */

import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadAllMicroLessons, microLessonModuleIds } from "../micro_lessons_index";
import type { MicroLesson, MicroLessonModule } from "../micro_lesson_types";
import { labs } from "../labs";
import { engineeringPhases } from "../engineering_phases";
import { curriculumZh } from "../curriculum";
import { curriculumEn } from "../curriculum_en";

// The index resolves micro-lessons through dynamic import() per
// module+locale; materialize both full maps once for all tests.
const microLessonsZh = await loadAllMicroLessons("zh");
const microLessonsEn = await loadAllMicroLessons("en");

function allLessons(mod: MicroLessonModule): MicroLesson[] {
  return [...(mod.lessons ?? []), ...(mod.groups ?? []).flatMap((g) => g.lessons)];
}

describe("micro-lesson id uniqueness", () => {
  it.each([
    ["zh", microLessonsZh],
    ["en", microLessonsEn],
  ] as const)("%s lesson ids are unique across all modules", (_locale, map) => {
    const owners = new Map<string, string[]>();
    for (const [moduleKey, mod] of Object.entries(map)) {
      for (const lesson of allLessons(mod)) {
        owners.set(lesson.id, [...(owners.get(lesson.id) ?? []), moduleKey]);
      }
    }
    // Guard against vacuity: if imports silently broke, this catches it
    // before the uniqueness assertion passes on an empty set.
    // (80 lessons per locale as of 2026-06; content only grows.)
    expect(owners.size).toBeGreaterThanOrEqual(60);

    const duplicates = [...owners.entries()]
      .filter(([, modules]) => modules.length > 1)
      .map(([id, modules]) => `${id} (in ${modules.join(", ")})`);
    expect(duplicates).toEqual([]);
  });
});

describe("zh/en micro-lesson parity", () => {
  it("zh and en expose the same module keys, covering every registered module", () => {
    expect(microLessonModuleIds.length).toBeGreaterThanOrEqual(13);
    // loadAllMicroLessons drops modules whose import resolves empty —
    // comparing against the registry catches that silently-missing case.
    expect(Object.keys(microLessonsZh).sort()).toEqual([...microLessonModuleIds].sort());
    expect(Object.keys(microLessonsEn).sort()).toEqual([...microLessonModuleIds].sort());
  });

  it("every module has the same group count in zh and en", () => {
    for (const key of Object.keys(microLessonsZh)) {
      const zhGroups = (microLessonsZh[key].groups ?? []).length;
      const enGroups = (microLessonsEn[key]?.groups ?? []).length;
      expect(enGroups, `module "${key}" group count diverges (zh=${zhGroups}, en=${enGroups})`).toBe(
        zhGroups,
      );
    }
  });

  it("every module has the same lesson ids, in the same order, in zh and en", () => {
    for (const key of Object.keys(microLessonsZh)) {
      const zhIds = allLessons(microLessonsZh[key]).map((l) => l.id);
      const enIds = allLessons(microLessonsEn[key] ?? {}).map((l) => l.id);
      expect(zhIds.length, `module "${key}" has no lessons`).toBeGreaterThan(0);
      expect(enIds, `module "${key}" lesson ids diverge between zh and en`).toEqual(zhIds);
    }
  });
});

describe("labs integrity", () => {
  it("lab ids are unique", () => {
    expect(labs.length).toBeGreaterThanOrEqual(5);
    const ids = labs.map((l) => l.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("every lab.phaseId references an existing engineering phase", () => {
    const phaseIds = new Set(engineeringPhases.map((p) => p.id));
    expect(phaseIds.size).toBeGreaterThanOrEqual(5);
    for (const lab of labs) {
      expect(phaseIds.has(lab.phaseId), `lab "${lab.id}" references unknown phase "${lab.phaseId}"`).toBe(
        true,
      );
    }
  });

  it("every lab step has non-empty zh and en title/instruction", () => {
    for (const lab of labs) {
      expect(lab.steps.length, `lab "${lab.id}" has no steps`).toBeGreaterThan(0);
      for (const step of lab.steps) {
        const where = `lab "${lab.id}" step ${step.order}`;
        expect(step.title?.trim(), `${where}: empty title`).toBeTruthy();
        expect(step.titleEn?.trim(), `${where}: empty titleEn`).toBeTruthy();
        expect(step.instruction?.trim(), `${where}: empty instruction`).toBeTruthy();
        expect(step.instructionEn?.trim(), `${where}: empty instructionEn`).toBeTruthy();
      }
    }
  });

  it("optional lab step fields are bilingual pairs (audit lesson: zh edits must mirror en)", () => {
    const asymmetric: string[] = [];
    for (const lab of labs) {
      for (const step of lab.steps) {
        const where = `lab "${lab.id}" step ${step.order}`;
        if (Boolean(step.hint?.trim()) !== Boolean(step.hintEn?.trim())) {
          asymmetric.push(`${where}: hint/hintEn`);
        }
        if (Boolean(step.checkpoint?.trim()) !== Boolean(step.checkpointEn?.trim())) {
          asymmetric.push(`${where}: checkpoint/checkpointEn`);
        }
      }
    }
    expect(asymmetric).toEqual([]);
  });
});

describe("forbidden stale-content sweep", () => {
  // Each entry is an error class the 2026-05-26 verification pass fixed.
  // If one of these strings reappears in content, the old error is back.
  const FORBIDDEN: { pattern: string; reason: string }[] = [
    { pattern: "--run-subtest hang-ring-gfx", reason: "stale IGT subtest taught as runnable (H3)" },
    { pattern: "amdgpu_test --list-subtests", reason: "amdgpu_test is not a real IGT binary (H3)" },
    { pattern: ">500 GB/s", reason: "wrong VRAM bandwidth for RX 7600 XT (~288 GB/s) (§5.3)" },
    { pattern: "/proc/dynamic_debug", reason: "dynamic_debug lives in debugfs, not /proc (M8)" },
    { pattern: "showoccupancy", reason: "rocm-smi --showoccupancy does not exist (M1)" },
    { pattern: "8589934592", reason: "8 GiB byte count; RX 7600 XT has 16 GiB (H1)" },
  ];
  // "hang-ring-gfx" may be mentioned only as history (e.g. "the old
  // hang-ring-gfx no longer exists") — never as a runnable subtest.
  const HISTORICAL_ONLY = {
    pattern: "hang-ring-gfx",
    allowedWhenLineMatches: /已不存在|不存在|no longer exists|removed/,
  };

  const HERE = path.dirname(fileURLToPath(import.meta.url));
  const SCAN_DIRS = [
    path.resolve(HERE, ".."), // client/src/data
    path.resolve(HERE, "../../pages"), // client/src/pages
  ];

  function collectFiles(dir: string): string[] {
    return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        // The tests themselves name the forbidden strings as literals.
        return entry.name === "__tests__" ? [] : collectFiles(full);
      }
      return /\.(ts|tsx)$/.test(entry.name) ? [full] : [];
    });
  }

  it("no known-stale string appears in client/src/data or client/src/pages", () => {
    const files = SCAN_DIRS.flatMap(collectFiles);
    // Guard against vacuity: a broken path would scan nothing and "pass".
    expect(files.length).toBeGreaterThanOrEqual(40);

    const violations: string[] = [];
    for (const file of files) {
      const rel = path.relative(path.resolve(HERE, "../../../.."), file);
      const lines = fs.readFileSync(file, "utf8").split(/\r?\n/);
      lines.forEach((line, i) => {
        for (const { pattern, reason } of FORBIDDEN) {
          if (line.includes(pattern)) {
            violations.push(`${rel}:${i + 1} contains "${pattern}" — ${reason}`);
          }
        }
        if (
          line.includes(HISTORICAL_ONLY.pattern) &&
          !HISTORICAL_ONLY.allowedWhenLineMatches.test(line)
        ) {
          violations.push(
            `${rel}:${i + 1} mentions "${HISTORICAL_ONLY.pattern}" without marking it as historical`,
          );
        }
      });
    }
    expect(violations).toEqual([]);
  });
});

describe("curriculum zh/en parity", () => {
  it("zh and en have the same module count", () => {
    expect(curriculumZh.length).toBeGreaterThanOrEqual(12);
    expect(curriculumEn.length).toBe(curriculumZh.length);
  });
});
