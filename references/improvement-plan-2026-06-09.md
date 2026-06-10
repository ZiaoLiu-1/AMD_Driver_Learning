# AMD Driver Learning — Improvement Plan

Date: 2026-06-09
Repo: `/Users/liuziao/Desktop/AMD_Driver_Learning`
Goal: make the platform **practical**, **resume-worthy**, and an actual vehicle into an AMD Linux GPU driver role.
Inputs: full site review (this session), `references/content-freshness-audit-2026-05-26.md`, `references/content-freshness-verification-2026-05-26.md`, live web verification (2026-06-09).

---

## 1. Where the site stands today

**Strengths (verified, not aspirational):**

- 14 modules, ~80 micro-lessons, now **7 hands-on labs**, glossary, mastery checks, source-reading guide — fully bilingual (zh/en), with locale-aware `<html lang>`, OG image, sitemap, robots.
- Content health ~**90/100** after the 2026-05-26 verification pass (30 fixes against primary sources). Build, typecheck, and tests all pass.
- The curriculum genuinely covers what AMD driver teams care about: kernel build loop, DRM/KMS, GPUVM/TTM, command submission/fences, GPU-hang debugging (devcoredump/umr), IGT, KFD/ROCm, LLVM backend, upstream patch workflow.

**Freshness re-check (2026-06-09, primary sources):**

| Claim in site | Current reality | Verdict |
| --- | --- | --- |
| Source Guide pinned to Linux v6.12 LTS | kernel.org: stable 7.0.12, mainline 7.1-rc7, LTS list includes **6.12.93** (and 6.18.35) | ✅ Still valid; consider 6.18 LTS bump at next quarterly audit |
| SetupGuide ROCm 7.2 instructions | Latest ROCm is **7.2.4** (2026-05-29) | ✅ Current |
| IGT subtest names, virtme-ng, b4 flows | Fixed in May pass | ✅ No drift observed |
| KUnit DRM tests exist in v6.12 (`drivers/gpu/drm/tests/`, `.kunitconfig`, `drm_buddy_test.c`) | Verified via kernel tree listing | ✅ (new Lab 6 depends on this) |

**Fixed this session (residuals from May audit §5 + new finds):**

- RX 7600 XT VRAM bandwidth keyPoint (">500 GB/s" → ~288 GB/s, with high-end context) — zh+en (`module2_group2`).
- "L2 32MB" mislabeling → L2 ~2MB + 32MB Infinity Cache (last level) in keyPoints, zh diagram, and interview answers — zh+en (`module8`).
- `amdgpu.debug_mask` taught as runtime-writable → corrected to load-time parameter (0444) with `drm.debug` as the runtime path — Labs 2 & 4.
- Labs page subtitle hardcoded "5 experiments" → count-free copy (stat box computes the real number).

**Added this session (content):**

- **Lab 6 — Run & Extend DRM KUnit Tests (no GPU required):** kunit.py over `drivers/gpu/drm/tests/`, focused on `drm_buddy` (the allocator behind `amdgpu_vram_mgr`), including break-a-test, write-your-own-case, and a portfolio report artifact.
- **Lab 7 — Find & Prepare Your First Upstream Patch:** kernel-doc/W=1 opportunity scan on `amd-staging-drm-next`, four validation gates, b4/`git send-email` rehearsal, real send + lore tracking.
- **Module 11.3 (two lessons, zh+en):** *Finding Your First Patch Opportunity & Life After Merge* (opportunity pyramid, four gates, merge path to stable, regression etiquette) and *The Resume Playbook* (bullet formula, lab→bullet mappings, role-family keywords, application channels, 12-week evidence plan, honesty red lines).

---

## 2. The strategic gap: knowledge site → proof-of-work engine

A hiring manager cannot verify "I studied 640 hours." They **can** verify:

1. patches in the lore.kernel.org/amd-gfx archive (and merged in `amd-staging-drm-next`),
2. public artifacts (hang-analysis reports, KUnit/IGT work, subsystem write-ups),
3. a deployed, polished platform with a public repo.

Everything below is ordered by how directly it produces verifiable evidence.

---

## 3. Prioritized roadmap

### P0 — Ship the proof (this week)

| # | Action | Why / acceptance |
| --- | --- | --- |
| 1 | **Send the first real patch** by executing Lab 7 end-to-end (kernel-doc fix in `drivers/gpu/drm/amd`) | The single highest-ROI resume line. Done when the patch is in the lore archive; track for "Applied, thanks". |
| 2 | **Deploy the site publicly** (GitHub Pages / Vercel / Cloudflare Pages) and make the repo public | "Shipped bilingual platform" is only citable with a URL. Verify domain-root `robots.txt` (current one ships under `/amd/`). |
| 3 | **Write the repo README** (EN): screenshots, feature list, architecture (React/TS/Vite, data-driven curriculum), stats, link to deployed site | The repo is itself a portfolio piece; README is its 30-second pitch. |
| 4 | **Create the portfolio repo** per lesson 11.2.1 and cross-link site ↔ portfolio ↔ lore | One URL a recruiter can walk. |

### P1 — Deepen the practical layer (2–6 weeks)

| # | Action | Notes |
| --- | --- | --- |
| 5 | **Lab 8 — Bug triage on gitlab.freedesktop.org/drm/amd**: pick an issue your RX 7600 XT can reproduce, triage methodically (dmesg, bisect if feasible), post findings, earn `Tested-by:` | Converts the issue tracker into an evidence stream; complements Lab 7. |
| 6 | **Artifact steps for Labs 1–5**: end each older lab with a "write the report → portfolio" step (Labs 6/7 already do this) | Uniform proof-of-work loop across all labs. |
| 7 | **Evidence/export page**: render localStorage progress + artifact links as a shareable markdown/JSON export ("resume mode") | Turns private progress into attachable proof. |
| 8 | **Timed mock-interview mode** on PracticePage (45-min set mixing per-phase questions, self-scoring rubric from 11.2.2) | The question bank already exists; packaging is the gap. |

### P2 — Content expansion (1–3 months)

| # | Action | Notes |
| --- | --- | --- |
| 9 | **KMS/display hands-on without AMD display hardware** via `vkms` in virtme-ng (atomic commit experiments, igt kms tests against vkms) | Closes the "display is theory-only" gap safely. |
| 10 | **Power-management observability lab** (read-only: `amdgpu_pm_info`, hwmon, `pp_dpm_sclk` under load) | Safe, runs on the user's hardware, covers the PM blind spot. |
| 11 | **Userspace bridge group** (one group in Module 4 or 5): how a GL/Vulkan call reaches the kernel (Mesa radeonsi/RADV → libdrm → ioctl) | Kernel-heavy curriculum benefits from one stack-walk group. |
| 12 | **Quarterly freshness loop** (per verification report §7): re-check ROCm matrix & version strings, IGT subtest names, virtme-ng/b4 flows, Ubuntu package names; consider Source Guide v6.12 → v6.18 LTS bump with badge update | Calendar it; staleness is the site's main credibility risk. |

### P3 — Engineering quality of the site itself (also resume material)

| # | Action | Notes |
| --- | --- | --- |
| 13 | **Code-split the ~4.16 MB bundle** (route-level dynamic imports for data modules) | Turns the standing Vite warning into a measurable perf win you can cite (before/after numbers). |
| 14 | **Content-invariant tests + CI**: lesson-id uniqueness, zh/en lesson-count parity, forbidden-string sweeps (e.g. `hang-ring-gfx`, `>500 GB/s`), then GitHub Actions on PR | Encodes the May audit's "re-grep every error class" lesson permanently; CI badge on README. **Done 2026-06-09**: `client/src/data/__tests__/content_invariants.test.ts` (11 tests, each mutation-tested); `ci.yml` push trigger extended to `main`. CI badge still pending. |
| 15 | **Lighthouse + a11y pass** per design principles (WCAG AA) | Quantified scores belong in the README. |

---

## 4. The 12-week path into AMD (operational summary)

Full version lives in lesson 11.3.2 (`/module/career/lesson/11-3-2`). The one rule: **one linkable artifact per week.**

- **Weeks 1–4 (foundation):** Labs 1–3 + Module 5 notes → portfolio repo live. *(Largely satisfiable already — backfill reports from completed labs.)*
- **Weeks 5–8 (upstream):** Lab 6 KUnit report → Lab 7 scan (`candidates.md`) → **first patch sent (lore link #1)** → review iteration / second patch.
- **Weeks 9–12 (packaging):** one deep subsystem write-up; resume + LinkedIn fully linkified (bullet formula from 11.3.2); applications via careers.amd.com (incl. University/Early-Career), community visibility on amd-gfx, adjacent employers (Igalia/Collabora/Red Hat/Canonical) as parallel track; mock interviews via 11.2.2.

**Honesty guardrails:** `submitted ≠ merged`; never "production SaaS"; never imply maintainer relationships; numbers only when truly countable. The community record is public — small and true wins.

---

## 5. Maintenance cadence

| Cadence | Check |
| --- | --- |
| Every ROCm release | RX 7600 XT / consumer support statements vs the official matrix; SetupGuide version strings (currently 7.2.x; 7.2.4 as of 2026-05-29) |
| Every kernel LTS bump | `source_roadmap.ts` `KERNEL_TAG` + badge date; amdgpu file paths still exist (6.18 LTS is the likely next pin) |
| Quarterly | IGT subtest names vs upstream `tests/amdgpu/*.c`; virtme-ng / b4 / git-send-email flows; Ubuntu package names; Lab 7 command paths (`kernel-doc -none`, `coccicheck M=`) |
| On any zh/en edit | Mirror the change in the other language (the recurring failure mode) |
| Before each application round | Re-click every resume link; Lighthouse; export fresh evidence page |
