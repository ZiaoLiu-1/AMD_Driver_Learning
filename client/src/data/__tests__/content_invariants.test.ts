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
  // Each entry is an error class a verification pass fixed
  // (2026-05-26 pass + 2026-06-10 deep audit).
  // If one of these strings reappears in content, the old error is back.
  const FORBIDDEN: { pattern: string; reason: string }[] = [
    { pattern: "--run-subtest hang-ring-gfx", reason: "stale IGT subtest taught as runnable (H3)" },
    { pattern: "amdgpu_test --list-subtests", reason: "amdgpu_test is not a real IGT binary (H3)" },
    { pattern: ">500 GB/s", reason: "wrong VRAM bandwidth for RX 7600 XT (~288 GB/s) (§5.3)" },
    { pattern: "/proc/dynamic_debug", reason: "dynamic_debug lives in debugfs, not /proc (M8)" },
    { pattern: "showoccupancy", reason: "rocm-smi --showoccupancy does not exist (M1)" },
    { pattern: "8589934592", reason: "8 GiB byte count; RX 7600 XT has 16 GiB (H1)" },
    // ── 2026-06-10 deep audit (B-2): 8GB VRAM figures for the 16GB RX 7600 XT ──
    { pattern: "VRAM 总量: 8192", reason: "RX 7600 XT has 16GB (driver reports ~16368 MB) (B-2)" },
    { pattern: "VRAM Total: 8192", reason: "RX 7600 XT has 16GB (driver reports ~16368 MB) (B-2)" },
    { pattern: "VRAM: 2048MB / 8192MB", reason: "8GB VRAM figure for the 16GB RX 7600 XT (B-2)" },
    { pattern: "8176 MB", reason: "8GB-card driver-reported VRAM; 16GB card reports ~16368 (B-2)" },
    { pattern: "8176 MiB", reason: "8GB-card driver-reported VRAM; 16GB card reports ~16368 (B-2)" },
    { pattern: "8GB GDDR6", reason: "RX 7600 XT has 16GB GDDR6 (AMD product page) (B-2)" },
    // ── 2026-06-10 deep audit (B-1): BAR layout. Correct: BAR0=VRAM, BAR2=doorbell, BAR5=MMIO ──
    { pattern: "寄存器空间（BAR 2", reason: "registers are BAR5 on modern AMD GPUs; BAR2 is doorbell (B-1)" },
    { pattern: "寄存器空间（BAR2", reason: "registers are BAR5 on modern AMD GPUs; BAR2 is doorbell (B-1)" },
    { pattern: "BAR2（寄存器", reason: "registers are BAR5; BAR2 is doorbell (B-1)" },
    { pattern: "BAR2: 2MB 寄存器", reason: "registers are BAR5; BAR2 is doorbell (B-1)" },
    { pattern: "BAR2: 2MB Registers", reason: "registers are BAR5; BAR2 is doorbell (B-1)" },
    { pattern: "BAR0（MMIO 寄存器", reason: "BAR0 is the VRAM aperture; registers are BAR5 (B-1)" },
    { pattern: "BAR 2 (Register", reason: "registers are BAR5; BAR2 is doorbell (B-1)" },
    { pattern: "BAR2 (register", reason: "registers are BAR5; BAR2 is doorbell (B-1)" },
    // ── 2026-06-10 deep audit (A-7/A-8/B-5): commands verified against upstream sources ──
    { pattern: "--enroll-base", reason: "b4 prep has no such flag; use -e/--enroll (A-7)" },
    { pattern: "get_maintainer.pl -g ", reason: "get_maintainer.pl takes patch files, not commit ranges (A-8)" },
    { pattern: "get_maintainer.pl --git ", reason: "get_maintainer.pl --git is a boolean, not a range option (A-8)" },
    { pattern: "amd_basic@vm-tests", reason: "no such IGT subtest; vm tests live in amd_vm (B-5)" },
    // ── 2026-06-10 deep audit (B-8/B-9): hedging / unverifiable assertions ──
    { pattern: "持续招聘", reason: "hiring is cyclical; point to careers.amd.com instead (B-9)" },
    { pattern: "最重要的 GPU 软件开发中心", reason: "unverifiable superlative org claim (B-9)" },
    { pattern: "primary GPU software development center", reason: "unverifiable superlative org claim (B-9)" },
    { pattern: "Markham Toolchain 团队的核心工作", reason: "LLVM AMDGPU backend is multi-org maintained (B-9)" },
    { pattern: "core work of the AMD Markham Toolchain team", reason: "LLVM AMDGPU backend is multi-org maintained (B-9)" },
    { pattern: "4200000+", reason: "hard-coded line count goes stale; hedge it (B-8)" },
    { pattern: "超过 400 万行", reason: "hard-coded line count goes stale; hedge it (B-8)" },
    { pattern: "自动重试 2-3 次", reason: "retry policy is infrastructure-specific, not a fact (B-8)" },
    { pattern: "两轮 Review", reason: "review-round counts are not predictable facts (B-8)" },
  ];
  // Some strings may be mentioned only as history/context (e.g. "the old
  // hang-ring-gfx no longer exists", "older kernels called it
  // dc_commit_state") — never taught as current.
  const HISTORICAL_ONLY_PATTERNS = [
    {
      pattern: "hang-ring-gfx",
      allowedWhenLineMatches: /已不存在|不存在|no longer exists|removed/,
    },
    {
      pattern: "dc_commit_state",
      // Allowed only in API-evolution notes (B-3): v6.12 has dc_commit_streams.
      allowedWhenLineMatches: /老版本叫|older kernels (called|used)|API evolves|随版本演进/,
    },
  ];

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
        for (const { pattern, allowedWhenLineMatches } of HISTORICAL_ONLY_PATTERNS) {
          if (line.includes(pattern) && !allowedWhenLineMatches.test(line)) {
            violations.push(
              `${rel}:${i + 1} mentions "${pattern}" without marking it as historical`,
            );
          }
        }
      });
    }
    expect(violations).toEqual([]);
  });

  it("ROCm installer version strings are consistent across SetupGuide (T7)", () => {
    // B-4: the installer URL drifted because three copies were edited by hand.
    // All amdgpu-install_<ver> strings must be identical, so a future bump
    // either updates every copy or fails here.
    const setupGuide = fs.readFileSync(
      path.resolve(HERE, "../../pages/SetupGuide.tsx"),
      "utf8",
    );
    const versions = [...setupGuide.matchAll(/amdgpu-install[_-]([\d.]+-\d+)/g)].map(
      (m) => m[1],
    );
    expect(versions.length).toBeGreaterThanOrEqual(3);
    expect(new Set(versions).size, `installer versions diverge: ${versions.join(", ")}`).toBe(1);
  });

  it("libprocps-dev is always accompanied by libproc2-dev (T8)", () => {
    // B-7: Ubuntu 24.04 renamed the package; teaching only the old name
    // breaks noble installs. File-level pairing keeps both spellings present.
    const files = SCAN_DIRS.flatMap(collectFiles);
    const offenders = files.filter((f) => {
      const s = fs.readFileSync(f, "utf8");
      return s.includes("libprocps-dev") && !s.includes("libproc2-dev");
    });
    expect(
      offenders.map((f) => path.relative(path.resolve(HERE, "../../../.."), f)),
    ).toEqual([]);
  });

  it("no bare-branch checkout of amd-staging-drm-next without the remote qualifier (T9)", () => {
    // B-8: code blocks taught `git checkout -b <name> amd-staging-drm-next`,
    // which fails unless the agd5f remote is configured. Commands must use
    // the remote-qualified form (agd5f/amd-staging-drm-next) or a placeholder.
    const files = SCAN_DIRS.flatMap(collectFiles);
    const offenders: string[] = [];
    for (const file of files) {
      const rel = path.relative(path.resolve(HERE, "../../../.."), file);
      fs.readFileSync(file, "utf8")
        .split(/\r?\n/)
        .forEach((line, i) => {
          if (/checkout (-b \S+ )?amd-staging-drm-next/.test(line)) {
            offenders.push(`${rel}:${i + 1}`);
          }
        });
    }
    expect(offenders).toEqual([]);
  });
});

describe("lab portfolio artifact steps (T11)", () => {
  it("every lab's final step produces a linkable artifact", () => {
    // A-1: labs 1-5 used to end one step before producing anything a hiring
    // manager could click. Every lab must now end with a portfolio artifact.
    for (const lab of labs) {
      const last = lab.steps[lab.steps.length - 1];
      const text = `${last.title} ${last.titleEn} ${last.instruction} ${last.instructionEn}`;
      expect(
        /portfolio|产出物|报告|report|notes\/|analysis\/|lore/i.test(text),
        `lab "${lab.id}" final step "${last.title}" produces no linkable artifact`,
      ).toBe(true);
    }
  });
});

describe("curriculum zh/en parity", () => {
  it("zh and en have the same module count", () => {
    expect(curriculumZh.length).toBeGreaterThanOrEqual(12);
    expect(curriculumEn.length).toBe(curriculumZh.length);
  });
});
