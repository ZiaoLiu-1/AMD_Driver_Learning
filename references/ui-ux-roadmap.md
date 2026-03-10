# AMD Driver Learning Platform — UI/UX Roadmap

Date: 2026-03-10
Status: Active — Phase 13 (new cycle)
Reference: Final audit 2026-03-10, `CLAUDE.md`

---

## Completed: Phases 0–12 (2026-03-09)

All 12 phases of the initial UI/UX improvement cycle are complete. Below is the summary.

### Score Progression

| Metric | Before (Phase 0) | After (Phase 12) | Target |
|--------|-------------------|-------------------|--------|
| Audit score | 68/100 | **87/100** | 85+ |
| Critical issues | 1 | **0** | 0 |
| High issues | 6 | **1** | 0 |
| Medium issues | 5 | **10** | <=2 |
| Low issues | 2 | **8** | — |
| AI slop verdict | Fail | **Pass** | Pass |
| Mobile nav | Broken | **Home: Full / Other: Back-only** | Full |
| English locale trust | Broken | **Consistent (micro-lessons guarded)** | Consistent |
| Reduced motion | None | **Full (global CSS)** | Full |
| Token coverage | ~60% | **~92%** | 95%+ |

### What Was Fixed (Phases 1–12)

| Phase | Skill | Summary |
|-------|-------|---------|
| 1. Harden | `/harden` | Restored mobile nav, fixed English locale, removed nested interactives, added aria-labels, rebuilt SearchModal as Radix Dialog, added `<main>` landmarks, fixed source guide semantics. 13 files. |
| 2. Adapt | `/adapt` | Reworked MicroLessonPage mobile, tightened Home hero, normalized 44px touch targets across 10 files. 11 files. |
| 3. Normalize | `/normalize` | Replaced all hard-coded hex/Tailwind colors with semantic tokens, added terminal tokens, replaced `transition-all` globally. 28 files. |
| 4. Extract | `/extract` | Extracted PageShell, CopyCodeBlock, DifficultyBadge, brand button variant. 16 files. |
| 5. Quieter | `/quieter` | Removed blob background, glass/glow overuse, gradient text overuse, hero metric pattern, nested-card noise. |
| 6. Clarify | `/clarify` | Trimmed hero copy, reduced redundant labels, improved empty states, made assessment actionable, tightened button labels. 5 files. |
| 7. Animate | `/animate` | Added global `prefers-reduced-motion`, staggered reveals, lab step transitions, progress-ring animation, replaced height animations. 3 files. |
| 8. Colorize | `/colorize` | Audited OKLCH contrast, tinted neutrals to brand hue, restricted accent usage, verified colorblind safety. 1 file. |
| 9. Distill | `/distill` | Hid copy buttons behind hover/focus, simplified tab chrome, replaced rainbow section headers with monochrome, simplified glossary cards. 4 files. |
| 10. Delight | `/delight` | Added lab completion celebration, Practice keyboard shortcuts, "resume where you left off" prompt, hover reveals, snappier search. 5 files. |
| 11. Polish | `/polish` | Normalized spacing, fixed heading hierarchy, verified interactive states, confirmed light/dark parity, bilingual spot-check. 10 files. |
| 12. Onboard | `/onboard` | Added Home zero-state quick-start, orientation cards, improved Practice/Glossary empty states. 5 files. |

### Original Issues (All Resolved)

1. ~~Mobile home removes primary navigation~~ → Sheet drawer added
2. ~~English micro-lessons render Chinese~~ → `isMicroLessonLocalized()` guard + banner
3. ~~Nested interactive elements~~ → Fixed ~15 instances across 7 files
4. ~~Icon-only controls lack accessible names~~ → `aria-label` added everywhere
5. ~~Search modal not an accessible dialog~~ → Rebuilt on Radix Dialog
6. ~~MicroLessonPage mobile layout broken~~ → Sidebar breakpoint moved to `lg`
7. ~~Setup guide copy-button keyboard wall~~ → Hidden behind hover/focus, `tabIndex={-1}`
8. ~~No `prefers-reduced-motion`~~ → Global CSS handler
9. ~~Hard-coded colors bypass token system~~ → Semantic tokens across 28 files
10. ~~Home hero oversized on mobile~~ → Responsive `min-h` + tightened spacing
11. ~~Search modal generic styling~~ → Combobox/listbox pattern + instant highlighting
12. ~~Pages missing `<main>` landmark~~ → Added to 5 pages + PageShell
13. ~~Source guide "mark read" semantically weak~~ → `role="checkbox"`, `aria-checked`, `aria-label`
14. ~~404 page breaks design language~~ → Redesigned with AMD design system tokens

---

## Final Audit: 2026-03-10 — 87/100

**Anti-Patterns Verdict: Pass.**
The interface no longer triggers an immediate "AI made this" reaction. Gradient text is restricted to two intentional hero treatments. Glass/glow effects serve the AMD-lab atmosphere deliberately. The product reads as a designed educational platform.

### Remaining Issues: 19 total (0 critical, 1 high, 10 medium, 8 low)

---

## Phase 13: Harden — Accessibility & i18n Cleanup

**Goal:** Close the 1 remaining high-severity issue and resolve the medium-severity accessibility + i18n gaps. This is the "last 8 points" to push toward 95/100.

**Model:** Claude Opus
**Estimated scope:** 10–15 files
**Priority:** Immediate

### Tasks

```
/harden
```

- [ ] **13a.** Add accessible names to ModulePage icon-only book links — `aria-label={book.title}` on each `<a>`, `aria-hidden="true"` on `<ExternalLink>` icon
- [ ] **13b.** Add `aria-expanded` and `aria-controls` to QuestionCard hint toggle — link button to hint content via `id`; replace `height: auto` animation with `grid-template-rows` transition
- [ ] **13c.** Make Checkpoint row keyboard-accessible — wrap in `<label>` or add `role="button"` + `tabIndex={0}` + `onKeyDown` to the outer div; add `aria-label={text}` to the Radix Checkbox
- [ ] **13d.** Localize "Checkpoint" hardcoded string in Checkpoint.tsx — add `labs.checkpoint` key to both locale files
- [ ] **13e.** Add the 14 missing i18n keys to `en.json` and `zh.json` — `nav.mobileNav`, `nav.externalDocs`, `nav.switchToLight`, `nav.switchToDark`, `module.closeSidebar`, `module.closeNotes`, `microLesson.closeSidebar`, `microLesson.localeMismatchTitle`, `microLesson.localeMismatchDesc`, `practice.prevQuestion`, `practice.toggleAnswer`, `glossary.clearSearch`, `search.clear`, `search.results`
- [ ] **13f.** Sweep decorative icons for `aria-hidden="true"` across PracticePage, ModulePage, LabDetailPage, MicroLessonPage, GlossaryPage (~20 instances)
- [ ] **13g.** Internationalize "Phase", "Step", "Module" prefixes — create interpolated keys `common.phase`, `common.step`, `common.module` and replace hardcoded strings in QuestionCard, LabsListPage, LabDetailPage, AssessmentPage, ModulePage
- [ ] **13h.** Replace inline locale toggle ternaries with i18n keys — unify `locale === "zh" ? "Switch to English" : "切换到中文"` across PageShell, Home, ModulePage, MicroLessonPage into `common.switchLocale`

### Verification

Run `/audit`. All High issues should be 0. Medium issues should drop to <=3.

---

## Phase 14: Normalize — Remaining Token Gaps

**Goal:** Push token coverage from ~92% to 95%+ by replacing the last hard-coded values.

**Model:** Claude Opus
**Estimated scope:** 3–5 files
**Priority:** High

### Tasks

```
/normalize
```

- [ ] **14a.** Fix sidebar.tsx `hsl(var(--sidebar-border))` — remove the `hsl()` wrapper around OKLCH token values (~line 490)
- [ ] **14b.** Replace Home.tsx hard-coded `rgba(232,68,26,0.15)` shadow — use token-based shadow or `oklch(from var(--primary) l c h / 0.15)`
- [ ] **14c.** Replace ~20 hard-coded OKLCH values in index.css utility classes (`.ascii-diagram`, `.module-card`, `.nav-item`, `.content-tab`, `.hero-overlay`, `.interview-card`) with `var(--primary)` or relative color references
- [ ] **14d.** Remove unused `--transition-speed` token from index.css

### Verification

Search for raw `oklch(0.62` in index.css — should return 0 results. Toggle light/dark on every route.

---

## Phase 15: Adapt — Semantic Landmarks & Mobile Nav

**Goal:** Upgrade PageShell to proper landmarks and extend mobile navigation beyond Home.

**Model:** Claude Opus
**Estimated scope:** 3–5 files
**Priority:** Medium

### Tasks

```
/adapt
```

- [ ] **15a.** Upgrade PageShell top bar from `<div>` to `<header>` — add `<nav aria-label="Breadcrumb">` wrapper around breadcrumb links
- [ ] **15b.** Fix SetupGuide heading hierarchy — promote workflow cards and quick-nav from `h3` to `h2`
- [ ] **15c.** Fix LabDetailPage wizard h1 on mobile — change from `hidden sm:block` to `sr-only sm:not-sr-only` so heading remains accessible
- [ ] **15d.** Fix MicroLessonPage error state headings — promote "Module not found" / "Lesson not found" from `h2` to `h1`
- [ ] **15e.** Consider adding compact hamburger or bottom nav to PageShell for mobile cross-page navigation (Setup, Glossary, Practice currently rely on back-to-Home)

### Verification

Test with a screen reader (VoiceOver) — landmark navigation should identify header, nav, main on every route. Test mobile deep-links (e.g. `/en/glossary`) for reachability of other sections.

---

## Phase 16: Polish — Motion & Consistency

**Goal:** Fix the last anti-pattern and unify DifficultyBadge usage.

**Model:** Claude Opus or Gemini 3.1 Pro
**Estimated scope:** 3–5 files
**Priority:** Low

### Tasks

```
/polish
```

- [ ] **16a.** Replace LabDetailPage `bounce: 0.6` spring with smooth deceleration — use `type: "spring", bounce: 0, duration: 0.6` (matching PhaseRoadmap)
- [ ] **16b.** Consolidate DifficultyBadge to a single API — remove MicroLessonPage's local `DifficultyBadge` wrapper, migrate PhaseCardGrid/Home from raw `difficultyColors` to the shared component
- [ ] **16c.** ModulePage theme toggle `aria-label` — switch from hardcoded English to `t("nav.switchToLight")` / `t("nav.switchToDark")`
- [ ] **16d.** Move SetupGuide inline `locale === 'zh' ? ... : ...` branches to structured locale keys (long-term maintainability)

### Verification

Run final `/audit` + `/critique`. Target score: 93+/100.

---

## Execution Timeline

| Sprint | Phases | Focus |
|--------|--------|-------|
| **Sprint 1** | Phase 13 | Close all high/medium accessibility and i18n issues |
| **Sprint 2** | Phase 14 + 15 | Token coverage + landmark semantics |
| **Sprint 3** | Phase 16 | Final polish and consistency |

---

## Success Criteria

| Metric | Current (87/100) | Target |
|--------|-------------------|--------|
| Audit score | 87 | 93+ |
| Critical issues | 0 | 0 |
| High issues | 1 | 0 |
| Medium issues | 10 | 0 |
| Low issues | 8 | <=3 |
| Token coverage | ~92% | 97%+ |
| Global mobile nav | Home only | All pages |
| Missing i18n keys | 14 | 0 |

---

## Notes

- After each phase, commit with a conventional commit message: `fix(ui): phase 13 — harden accessibility & i18n cleanup`
- Re-run `/audit` after Phases 13 and 16 to track score progression
- Phases 13–15 are structural/semantic — safe for Claude Opus
- Phase 16 includes a motion change — Gemini 3.1 Pro is acceptable for 16a
