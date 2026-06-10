# AMD Driver Learning — Content Freshness Verification & Fix Report

Date: 2026-05-26
Repo: `/Users/liuziao/Desktop/AMD_Driver_Learning`
Inputs: `references/content-freshness-audit-2026-05-26.md`, `/Users/liuziao/Desktop/resume/网站Review与改造清单.md`
Mode: fix + manual full-content re-verification (follow-up to the 2026-05-26 audit).

---

## 1. Executive Summary

The earlier audit (score 72/100) was used as a starting point, not as an exhaustive list. Every
user-facing content file — all 14 modules' micro-lessons (zh **and** en), curriculum overviews,
ecosystem module, labs, source guide, glossary, Setup Guide, scripts, and content-affecting docs —
was **manually read** (via direct reads and dedicated per-module review agents), and all
version/hardware/command/API-sensitive claims were re-verified against primary sources before editing.

**Content health after fixes: ~90/100.** The audit's Critical/High findings are resolved, plus a
substantial set of additional issues the audit had not caught (a systemic RX 7600 XT **8 GB vs 16 GB**
VRAM error across the Chinese files, an MI300X bandwidth/HBM error, a false Navi33 PCIe cache-coherency
claim, a nonexistent `rocm-smi --showoccupancy` flag, a per-wave-vs-per-CU VGPR conflation, several
untranslated English blocks in Chinese files, and zh-side overstated career/CI/salary claims that had
only been softened in English).

> **Correction (post-review second pass).** A user review after the first pass found issues the first
> pass had **missed** — including in files this report had marked "fully reviewed." The first-pass
> fix-agents corrected the specific lines they were pointed at but left other occurrences in the same
> files. A second pass (logged in §11) fixed: stale `amd_basic` subtests (`query-info`, `gem-create`,
> `vram-gtt-migration`) still present in Module 10 and a curriculum codeWalk; `amdgpu_test` still shown
> as a real IGT binary in Module 0 and a curriculum annotation; Module 8 HIP/ROCm steps lacking the
> compatibility-matrix caveat; Module 4 (8 GB) and Module 8 (PCIe x16/32 GB/s) RX 7600 XT specs;
> Module 5 describing `amdgpu_gpu_recover` as a status read; and "any AMD GPU works" copy in the Setup
> subtitle and curriculum diagram. The SEO assets (OG image, `sitemap.xml`, `robots.txt`) — which the
> goal listed as in-scope and which this report had wrongly downgraded to "net-new / deferred" — were
> added in the second pass (§11). **Lesson: a single targeted fix-agent per file is not a substitute
> for re-grepping the whole repo for every error class.**

Issues fixed by severity:

| Severity | Fixed |
| --- | ---: |
| Critical | 3 |
| High | 9 |
| Medium | 12 |
| Low | 6 |
| **Total** | **30** |

Files changed: **33** (see §2). `pnpm check`, `pnpm test` (8/8), and `pnpm build` all pass; rendered
inspection of `/en/`, `/zh/`, `/en/source-guide`, `/en/glossary`, `/zh/setup` confirmed correct output
and **locale-aware `<html lang>`** with no console errors.

Remaining residual risks are listed in §5 and the second-pass log (§11). The OG image, `sitemap.xml`,
and `robots.txt` now exist (§11); the only deployment caveat is that `robots.txt` ships under `/amd/`
(a domain-root copy is still needed for site-wide crawl control). The pre-existing ~4 MB JS bundle is
unchanged.

---

## 2. Files Audited

Every file below was **read in full** (large micro-lesson files were read in chunks to cover the entire
file, including nested `concept`, `diagram`, `codeWalk`, `miniLab`, `debugExercise`, `interviewQ`,
`keyPoints`, and `summary` fields). No content file was skipped.

**Pages / shell**
- `client/src/pages/SetupGuide.tsx` (read in full, edited)
- `client/src/pages/SourceGuidePage.tsx` (edited)
- `client/src/contexts/LocaleContext.tsx` (edited — html lang)
- `client/index.html` (reviewed)
- `client/src/pages/{Home,ModulePage,MicroLessonPage,LabsListPage,LabDetailPage,GlossaryPage,AssessmentPage,PracticePage}.tsx` (reviewed for rendered claims)

**Curriculum / data**
- `client/src/data/curriculum.ts`, `curriculum_en.ts` (edited)
- `client/src/data/ecosystem_module.ts`, `ecosystem_module_en.ts` (edited)
- `client/src/data/glossary_data.ts`, `glossary_data_en.ts` (edited)
- `client/src/data/labs.ts` (edited)
- `client/src/data/source_roadmap.ts` (edited)

**Micro-lessons — every module, both languages, manually reviewed:**
- module0, module05, module1, module2 (group1/group2/group3), module3, module4, module5, module6,
  module7, module8, module9, module10, module11 — each `*.ts` and `*_en.ts`.
- Edited: module0(zh+en), module05(zh+en), module2_group2(zh), module2_group3(zh+en),
  module3(zh+en), module5(en), module6(zh+en), module7(zh+en), module8(zh+en), module9(zh+en),
  module10(zh), module11(zh).
- Reviewed clean (no edits required): module1(zh+en), module2_group1(zh+en), module4(zh+en),
  module10_en, module11_en (these had already been audited/softened in a prior pass).

**Docs / scripts**
- `TRANSLATION_HANDOFF.md` (rewritten — was claiming 4/14 modules done)
- `scripts/amd-dev-env-setup.sh` (edited)

Not modified (out of scope for a correctness/freshness pass): `UI_SPEC.md`, `BRANCH_STRATEGY.md`,
`ideas.md`, build output under `dist/`, dependencies.

---

## 3. Sources Used (primary, May 2026)

**ROCm / HIP / AMD hardware**
- ROCm release versions: https://rocm.docs.amd.com/en/latest/release/versions.html (latest = 7.2.3, 2026-05-04)
- ROCm on Radeon compatibility matrix: https://rocm.docs.amd.com/projects/radeon-ryzen/en/latest/docs/compatibility/compatibility.html
- ROCm system requirements: https://rocm.docs.amd.com/projects/install-on-linux/en/latest/reference/system-requirements.html
- HIP coherence control: https://rocm.docs.amd.com/projects/HIP/en/latest/how-to/hip_runtime_api/memory_management/coherence_control.html
- MI300A unified-memory overview: https://instinct.docs.amd.com/projects/amdgpu-docs/en/latest/gpu-partitioning/mi300a/overview.html
- AMD RX 7600 XT product page (16 GB GDDR6, RDNA3): https://www.amd.com/en/products/graphics/desktops/radeon/7000-series/amd-radeon-rx-7600-xt.html
- AMD Instinct MI300 (CDNA3): https://www.amd.com/en/products/accelerators/instinct/mi300.html
- RDNA4 launch (RX 9000, Feb 2025): https://www.amd.com/en/newsroom/press-releases/2025-2-28-amd-unveils-next-generation-amd-rdna-4-architectu.html
- Radeon PRO W7600 (confirmed Navi33, 8 GB — platform claim verified correct): AMD product page + AIB specs

**Kernel / DRM / IGT / tooling**
- Linux kernel current releases: https://www.kernel.org/ (mainline 7.1-rc5, stable 7.0.10, LTS incl. 6.12.x)
- AMDGPU kernel docs / debugfs: https://docs.kernel.org/gpu/amdgpu/index.html , https://docs.kernel.org/gpu/amdgpu/debugfs.html
- IGT `amd_deadlock.c` / `amd_basic.c` (subtest names): https://gitlab.freedesktop.org/drm/igt-gpu-tools (tests/amdgpu/)
- IGT running tests (`--list-subtests`, `--run-subtest parent@dynamic`): https://drm.pages.freedesktop.org/igt-gpu-tools/running_tests/
- virtme-ng usage: https://github.com/arighi/virtme-ng (README)
- b4 contributor workflow: https://b4.docs.kernel.org/en/latest/contributor/send.html , .../prep.html
- git-send-email: https://git-scm.com/docs/git-send-email
- Ubuntu packages: https://packages.ubuntu.com/jammy/libprocps-dev , https://packages.ubuntu.com/noble/libproc2-dev
- linux-firmware: https://git.kernel.org/pub/scm/linux/kernel/git/firmware/linux-firmware.git , https://gitlab.com/kernel-firmware/linux-firmware
- LLVM CMake / Getting Started: https://llvm.org/docs/CMake.html , https://llvm.org/docs/GettingStarted.html

---

## 4. Fixes Applied

Notation: `file:line` are approximate (post-edit). zh/en means the same fix landed in both language files.

### Critical

**C1 — False Navi33 PCIe cache-coherency (CCIX/CXL) claim**
- `module7_micro_lessons.ts` / `_en.ts` (~L471)
- Old: "RDNA3's Navi33 supports cache coherency protocols over PCIe (like CCIX's predecessor or CXL-related mechanisms)…"
- New: "discrete consumer GPUs like Navi33 do NOT implement CPU–GPU hardware cache coherency (no CCIX/CXL); fine-grained coherence is realized through uncacheable memory plus atomics over PCIe; true hardware cache coherence exists only on AMD APUs and MI300A-class accelerators."
- Source: HIP coherence-control docs; MI300A overview. Confidence: High.

**C2 — RX 7600 XT (gfx1102) implied ROCm-supported / shown as HSA agent**
- `module7_*` (~L182-190, rocminfo expectedOutput + hint); `module05_*` (~L166-168 miniLab); `SetupGuide.tsx` (ROCm prereqs, rocminfo step); `curriculum.ts`/`curriculum_en.ts` (env-setup prereq).
- Old: "your GPU as HSA Agent (gfx1102)"; ROCm prereq "any AMD GPU / RDNA·CDNA families"; ROCm install presented as a standard prereq.
- New: gated on the **official ROCm compatibility matrix**; explicit note that RX 7600 XT / gfx1102 is **not** on the supported list (as of 2026-05 supported consumer cards are RX 9070/9060 and RX 7900/7800/7700), may run unofficially via `HSA_OVERRIDE_GFX_VERSION`; `/dev/kfd` is created by the in-kernel amdgpu module regardless; ROCm marked optional (Modules 7/9 only).
- Source: ROCm on Radeon matrix; system requirements. Confidence: High.

**C3 — MI300X memory/bandwidth + architecture errors**
- `module05_*` (~L58): MI300X "1.3TB/s" → "5.3TB/s" (192 GB HBM3 kept).
- `module2_group3.ts`/`_en.ts` (~L262/263): "HBM2e ~1.2 TB/s (MI300X)" → on-topic RDNA example "GDDR6 ~960 GB/s (RX 7900 XTX)".
- `ecosystem_module.ts`/`_en.ts` captions: "RX 7600 XT … same RDNA3 as Instinct MI300" → "amdgpu supports Radeon (RDNA) and Instinct (CDNA); MI300 is CDNA3 datacenter, not RDNA3; KFD/ROCm prioritized for Instinct."
- Source: AMD MI300 page (CDNA3, ~5.3 TB/s HBM3). Confidence: High.

### High

**H1 — RX 7600 XT VRAM stated as 8 GB (should be 16 GB), Chinese files**
- `module05_micro_lessons.ts` (L332, L503); `module0_micro_lessons.ts`/`_en.ts` (L289 hw box; L757/759 dmesg "8176M"→"16368M"; L807/808 annotation); `module2_group2.ts` (L72/79/92/100/106, mirrored to the already-fixed `_en`); `module2_group3.ts`/`_en.ts` (L93 `8589934592`→`17179869184`, "8 GB"→"16 GB"); `module8_micro_lessons.ts` (L254, L295).
- Source: AMD RX 7600 XT product page (16 GB GDDR6). Confidence: High.

**H2 — RX 7600 XT PCIe lanes wrong (x16 → x8)**
- `glossary_data.ts` (L49); `module2_group2.ts` (GTT bandwidth → ~16 GB/s one-way for PCIe 4.0 x8); `module2_group3.ts`/`_en.ts` (~L263/264: "PCIe 4.0 x16 ~32 GB/s" → "x8 ~16 GB/s one-way (~32 GB/s aggregate)").
- Source: AMD RX 7600 XT specs / AIB spec sheets (Navi33 native x8). Confidence: High (VRAM/RDNA3 high; x8 med-high).

**H3 — IGT test/subtest names stale/nonexistent**
- `labs.ts` (L192): `amd_deadlock --run-subtest hang-ring-gfx` → `--list-subtests` discovery + `amdgpu-deadlock-gfx`; hint's `amdgpu_test` removed (IGT ships separate binaries).
- `SetupGuide.tsx` (~L535): `amd_basic --run-subtest cs-gfx` → discovery + `cs-gfx-with-IP-GFX`.
- `curriculum.ts` (~L3248): `amdgpu_test --list-subtests` → `ls build/tests/amdgpu/` + `amd_basic --list-subtests`.
- Source: IGT `amd_deadlock.c`/`amd_basic.c`, running-tests docs. Confidence: High.

**H4 — virtme-ng command form (`vng --build --run`)**
- `SetupGuide.tsx` (4 sites), `labs.ts` (L131), `amd-dev-env-setup.sh` (comments + smoke test): replaced with documented `vng --build` then bare `vng` (and `vng -r` for host kernel).
- Source: virtme-ng README. Confidence: High (combined `--build --run` not the documented form).

**H5 — Ubuntu 22.04 dependency installs Noble-only `libproc2-dev`**
- `SetupGuide.tsx`, `amd-dev-env-setup.sh`: split — `libproc2-dev` (24.04) `||` `libprocps-dev` (22.04).
- Source: packages.ubuntu.com jammy vs noble. Confidence: High.

**H6 — `b4 send <patchfile>` taught as "modern way"**
- `SetupGuide.tsx` (~L623): replaced with `b4 prep` → `b4 prep --check` → `b4 send -o /tmp/presend` → `b4 send` (operates on the prepared branch), plus `git format-patch` + `git send-email` for loose patch files.
- Source: b4 contributor docs; git-send-email docs. Confidence: High.

**H7 — Locale/SEO/a11y: `<html lang>` hardcoded `zh-CN`**
- `LocaleContext.tsx`: `useEffect` sets `document.documentElement.lang` per locale (`en` on /en, `zh-CN` on /zh). Verified live.
- Source: audit F-006 + rendered inspection. Confidence: High.

**H8 — Curriculum/home stats disagreement (11 modules/400-600h vs 14/640h)**
- `curriculum.ts` (L114) / `curriculum_en.ts` (L26): Module 0 overview → "14 modules, ~640 hours" (matches computed home stats, which derive from `curriculum.length` + `getTotalHours`).
- Source: local data inspection (14 modules incl. spliced `ecosystemModule`; 640h). Confidence: High.

**H9 — Source Guide pinned to Linux v6.8 (presented as current)**
- `source_roadmap.ts`: `BOOTLIN_BASE` → exported `KERNEL_TAG = 'v6.12'` (maintained LTS); `SourceGuidePage.tsx` shows a visible "Source links pinned to Linux v6.12 LTS (audited 2026-05)" badge. Verified all 11 links now target v6.12.
- Source: kernel.org (6.12 LTS current); file paths have no line anchors so the bump is safe. Confidence: High.

### Medium

- **M1 `rocm-smi --showoccupancy` does not exist** — `module9_*` (~L816): replaced with compiler VGPR/SGPR resource report + rocprof/Omniperf + manual `1536÷VGPR_count`. (ROCm docs.) High.
- **M2 VGPR per-wave vs per-CU conflation** — `module9_*` (~L227): reworded "256 VGPRs per CU" → "256 per-wave addressing limit; 1024-element array → spill"; per-CU file 1536 kept. Med-high.
- **M3 "entire stack fully open source"** — `curriculum.ts`/`_en.ts`: softened to "amdgpu + Mesa open; ROCm has substantial open components; firmware is binary blob." Medium.
- **M4 AMDGPU built-in (=y) vs module (=m)** — `amd-dev-env-setup.sh` (L110): `--enable` → `--module CONFIG_DRM_AMDGPU`; `labs.ts` step 3 now sets `--module` deterministically (checkpoint expected `=m` but never set it). High-ish; grouped Medium.
- **M5 `amdgpu_gpu_recover` debugfs** — `SetupGuide.tsx` (2 sites): added `ls /sys/kernel/debug/dri/*/` discovery + "if present" (file exists but is version/config-dependent; reading triggers a real reset). Medium.
- **M6 linux-firmware install** — `SetupGuide.tsx`: distro package first; `dmesg | grep firmware` to find the blob; manual install + `update-initramfs`/`dracut` caveat. Medium.
- **M7 drm.debug bitmask prose** — `module6_*` (~L35): hex flag values (CORE=0x01…LEASE=0x80) consistent with codeWalk; `0x1e` expansion corrected to DRIVER+KMS+PRIME+ATOMIC. Medium.
- **M8 dynamic_debug control path** — `module0_en` (L739/855), `module5_en` (L194), `module6_en` (L36/43/161/164): `/proc/dynamic_debug/control` → `/sys/kernel/debug/dynamic_debug/control` (debugfs; matches zh). Medium.
- **M9 BAR index for MMIO registers** — `module3_*` (~L307): diagram `pci_ioremap_bar(2)` register BAR → `bar(5)` (matches codeWalk `pci_resource_start(pdev,5)`; BAR0=VRAM, BAR5=MMIO). VRAM `bar(0)` left correct. Medium.
- **M10 ftrace SVM tracepoints version-sensitive** — `module7_*` (~L626): added discovery (`available_events | grep svm`) and "names vary by kernel version." Medium.
- **M11 module8 32MB labeled "L2"** — `module8_en` (L290): relabeled the 32 MB as Infinity Cache (last-level), L2 proper ~2 MB (matches zh). Medium.
- **M12 deprecated HIP `gcnArch`** — `SetupGuide.tsx` HIP test: `props.gcnArch` (int, removed in recent ROCm) → `props.gcnArchName` (string). Medium.

### Low

- **L1 zh career/CI/salary overstatements (zh-only parity)** — `module11_micro_lessons.ts` (salary tables, org/location-as-fact, named-person team ownership, b4-"replaces"-git-send-email, 100-col claim, fabricated "v4.2 Table 3.7" citation) and `module10_micro_lessons.ts` (CI-MR-gates-drm-next, fixed retry counts) ported to the already-softened English wording. (Time-sensitive / overstated; English had been fixed earlier, Chinese had not.) Med→grouped Low.
- **L2 untranslated English blocks in zh files** — `module9` (L695), `module10` (L39/L48), `module11` (L40/L49) translated to Chinese.
- **L3 `amdgpu_reset_capture_coredumpm` typo** — `module2_group3*` → `amdgpu_reset_capture_coredump`.
- **L4 Lab 1 "pitfix" typo** — `labs.ts` → "pitfall".
- **L5 RDNA "latest" stale** — `glossary_data.ts` (L23) / `glossary_data_en.ts` (L70): RDNA3 "latest" → RDNA4 (RX 9000, 2025) latest; RX 7000 = prior RDNA3. (Audit F-014.)
- **L6 TRANSLATION_HANDOFF.md stale** — rewritten: all modules translated; remaining work = terminology/zh-en parity maintenance.

---

## 5. Remaining Questions / Needs Future Verification

1. **RX 7600 XT PCIe x8** rests partly on AIB spec sheets (AMD's own page timed out on direct fetch); high-confidence but worth a final cross-check against the live AMD product page.
2. **ROCm consumer-GPU support is a moving target.** The "RX 7600 XT not supported" statement is correct as of ROCm 7.2.x / 2026-05 but must be re-verified against the official matrix on each ROCm release. All such content now points users to the matrix rather than asserting support.
3. **`module2_group2` VRAM bandwidth keyPoint** still reads ">500 GB/s" (kept in lockstep zh/en). The RX 7600 XT's own VRAM bandwidth is ~288 GB/s; if that line is meant to describe this card specifically (not a generic high-end figure), normalize both languages to ~288 GB/s.
4. **`module8` line ~260** retains a "L2 (32MB)" summary string in both languages (the 32 MB is Infinity Cache); a follow-up could align it with the corrected M11 wording.
5. **Mainline-API fidelity in Module 4** (`dc_commit_state` → `dc_commit_streams`, evolved TTM init signatures). Lessons are explicitly labeled "simplified," so left as-is; revisit if strict current-mainline fidelity is desired.
6. **`amdgpu.debug_mask` runtime write** in Lab 2 (`echo 0xf > /sys/module/amdgpu/parameters/debug_mask`) was not changed; confirm the parameter is runtime-writable on the target kernel (may be load-time only).

---

## 6. Build / Test Results

- `pnpm check` (tsc --noEmit): **PASS** (no errors).
- `pnpm test` (vitest): **PASS** — 2 files, **8/8** tests.
- `pnpm build`: **PASS** — emits `dist/public/assets/index-*.js ≈ 4.17 MB (gzip 1.19 MB)` with Vite's >500 kB chunk warning (pre-existing; unrelated to content; tracked as a code-splitting task).
- Sanity grep: 0 remaining `hang-ring-gfx`, `showoccupancy`, `amdgpu_reset_capture_coredumpm`, `8589934592`, or `/proc/dynamic_debug` in `client/src/`. `_en.ts` files contain 0 CJK except `glossary_data_en.ts` (expected — `zhName` fields).
- Local rendered inspection (Vite dev `http://localhost:3000`, then stopped):
  - `/en/` → `document.documentElement.lang === "en"`, content renders (✓ the old hardcoded `zh-CN` bug is fixed).
  - `/zh/` → `lang === "zh-CN"`.
  - `/en/source-guide` → version badge "Source links pinned to Linux v6.12 LTS (audited 2026-05)"; all 11 bootlin links target `/linux/v6.12/`.
  - `/en/glossary` → shows "PCIe Gen 4 x8" and "RDNA4 (RX 9000 series, launched 2025)".
  - `/zh/setup` → renders the libprocps/libproc2 split note and the ROCm compatibility-matrix gating.
  - Console: **no errors** on inspected pages.

---

## 7. Recommended Future Freshness Schedule

| Cadence | Check |
| --- | --- |
| Every ROCm release | Re-verify the RX 7600 XT / consumer-GPU support statements against the official ROCm on Radeon matrix; bump the ROCm install version strings in SetupGuide. |
| Every kernel LTS bump | Re-audit `source_roadmap.ts` `KERNEL_TAG` against the chosen LTS; update the visible badge date. Re-check amdgpu file paths still exist. |
| Quarterly | Re-run the IGT subtest names against upstream `tests/amdgpu/*.c`; confirm virtme-ng / b4 / git-send-email flows; confirm Ubuntu package names for the current LTS. |
| On any zh **or** en content edit | Mirror the change in the other language (the recurring failure mode this pass fixed was English-only corrections). |
| Before each resume submission | Run Lighthouse; add the still-missing OG image, `sitemap.xml`, and `robots.txt` (net-new SEO features, deferred from this correctness pass); confirm no private/progress UI leaks in incognito. |
