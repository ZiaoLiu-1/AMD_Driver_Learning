# Exhaustive Runtime Audit

Date: 2026-03-09
Project: `amd-driver-learning-platform`
Requested scope: exhaustive runtime coverage audit, extending prior source audit
Audit mode: read-only, no fixes applied

---

## Coverage Matrix

### Browser-Verified Routes

- `http://localhost:3002/en`
- `http://localhost:3002/en/setup`
- `http://localhost:3002/en/glossary`
- `http://localhost:3002/en/practice`
- `http://localhost:3002/en/labs`
- `http://localhost:3002/en/labs/lab-1-custom-kernel`
- `http://localhost:3002/en/source-guide`
- `http://localhost:3002/en/assessment`
- `http://localhost:3002/en/module/intro`
- `http://localhost:3002/en/module/intro/lesson/0-1-1`
- `http://localhost:3002/en/404`
- `http://localhost:3002/zh`

### Browser-Verified Interactive States

- Home page on desktop
- Home page on mobile
- Setup guide on desktop
- Setup guide on mobile
- Labs list
- Lab detail intro state
- Lab detail active wizard state
- Source guide page
- Assessment intro state
- Assessment active question state
- Assessment revealed-answer state
- Assessment result state
- Module page
- Micro-lesson page
- Search modal open state
- Locale switch spot-check via direct zh route
- 404 route

### Source-Inspected Pages / Components

- `client/src/App.tsx`
- `client/src/index.css`
- `client/src/pages/Home.tsx`
- `client/src/pages/SetupGuide.tsx`
- `client/src/pages/GlossaryPage.tsx`
- `client/src/pages/PracticePage.tsx`
- `client/src/pages/LabsListPage.tsx`
- `client/src/pages/LabDetailPage.tsx`
- `client/src/pages/AssessmentPage.tsx`
- `client/src/pages/SourceGuidePage.tsx`
- `client/src/pages/ModulePage.tsx`
- `client/src/pages/MicroLessonPage.tsx`
- `client/src/pages/NotFound.tsx`
- `client/src/components/SearchModal.tsx`
- `client/src/components/home/PhaseRoadmap.tsx`
- `client/src/components/home/PhaseCardGrid.tsx`
- `client/src/components/home/PhaseProgressOverview.tsx`
- `client/src/components/home/ProgressRing.tsx`
- `client/src/components/assessment/QuestionCard.tsx`
- `client/src/components/assessment/AssessmentResult.tsx`
- `client/src/components/labs/TerminalCodeBlock.tsx`
- `client/src/components/labs/Checkpoint.tsx`
- `client/src/data/curriculum_index.ts`
- `client/src/data/micro_lessons_index.ts`

### Runtime Environment Notes

- No browser console errors were observed during route coverage.
- The app rendered all tested routes without crashing.
- Findings below prioritize UX, accessibility, theming, responsiveness, and product polish rather than JavaScript correctness alone.

---

## Anti-Patterns Verdict

Fail.

This does not read like a throwaway template because the content itself is unusually rich and domain-specific, but the interface still shows multiple AI-generation tells:

- gradient headline treatment in the hero
- repeated glass / glow / blur motifs
- hero plus stats plus card grid composition
- many rounded cards nested inside rounded cards
- decorative gradients used where structural hierarchy would be stronger
- repeated small badge patterns and low-opacity helper text for texture
- a visually disconnected 404 page that looks like a separate template

The current UI feels like strong technical content wrapped in a partially generic "AI-tech" shell.

---

## Executive Summary

- Total issues found: 14
- Critical: 1
- High: 6
- Medium: 5
- Low: 2
- Overall quality score: 68/100

### Most critical issues

1. Primary navigation is removed on mobile home.
2. English micro-lesson routes render Chinese content and labels.
3. Invalid nested interactive elements create duplicate focus targets across key flows.
4. Multiple icon-only controls and checkbox-like actions have no accessible names.
5. Search modal is not implemented as an accessible dialog and leaves background controls exposed.

### Recommended next steps

1. Fix navigation, locale correctness, and interactive semantics first.
2. Harden custom page-level controls and the search modal.
3. Normalize visual system tokens and reduce decorative effects.
4. Address mobile layout adaptation on deep content pages.

---

## Detailed Findings By Severity

## Critical Issues

### 1. Mobile home removes primary navigation entirely

- Location: `client/src/pages/Home.tsx`
- Severity: Critical
- Category: Responsive / Accessibility
- Verification: Browser-verified on `en` mobile home
- Description: The main route nav is hidden with `hidden xl:flex`, and the external-doc nav is hidden with `hidden lg:flex`, with no mobile menu or alternate routing surface.
- Impact: On the app's main entry point, mobile users cannot directly reach Labs, Assessment, Source Guide, Practice, Glossary, or Setup from the header. This is a core navigation failure, not just a layout issue.
- WCAG / Standard: violates the design rule that critical functionality must adapt on mobile rather than disappear.
- Recommendation: add a mobile nav sheet, compact route switcher, or bottom/overflow nav that preserves access to all core areas.
- Suggested command: `/adapt`

## High-Severity Issues

### 2. English micro-lesson routes render Chinese content and labels

- Location: `client/src/pages/MicroLessonPage.tsx`, `client/src/data/micro_lessons_index.ts`
- Severity: High
- Category: Accessibility / Product correctness / i18n
- Verification: Browser-verified on `http://localhost:3002/en/module/intro/lesson/0-1-1`; source-confirmed in `getMicroLessonsByModule()`
- Description: The English route displays Chinese lesson titles, body copy, and several controls. Source confirms that `getMicroLessonsByModule(locale)` always returns Chinese lesson data.
- Impact: This breaks locale trust for one of the deepest educational flows in the product. Users entering through English routes get mixed-language content in the core learning experience.
- WCAG / Standard: i18n quality and language consistency issue; also harms readability and user expectations.
- Recommendation: either supply real English micro-lesson content, or explicitly mark the route as Chinese-only until localized; do not expose `/en` deep-link routes with mixed-language output.
- Suggested command: `/harden`

### 3. Invalid nested interactive elements are widespread

- Location: `client/src/pages/Home.tsx`, `client/src/pages/ModulePage.tsx`, `client/src/pages/MicroLessonPage.tsx`, `client/src/pages/SetupGuide.tsx`, `client/src/components/assessment/AssessmentResult.tsx`
- Severity: High
- Category: Accessibility / Semantics
- Verification: Browser-verified from accessibility snapshots; source-confirmed
- Description: Several `Link` wrappers contain `button` or clickable child elements. Runtime snapshots showed duplicate interactive targets, for example both a link and a button named "Start Learning" or "Review Modules".
- Impact: Duplicate focus stops, invalid HTML semantics, inconsistent activation behavior, and confusing assistive-tech announcements.
- WCAG / Standard: WCAG 4.1.2; violates interactive content nesting rules.
- Recommendation: style links as buttons directly, or use a button with programmatic navigation, but never nest one interactive element inside another.
- Suggested command: `/harden`

### 4. Multiple icon-only controls and task controls lack accessible names

- Location: `client/src/pages/Home.tsx`, `client/src/pages/GlossaryPage.tsx`, `client/src/pages/PracticePage.tsx`, `client/src/pages/LabDetailPage.tsx`, `client/src/pages/SourceGuidePage.tsx`, `client/src/components/SearchModal.tsx`
- Severity: High
- Category: Accessibility
- Verification: Browser-verified on multiple routes
- Description: Unnamed buttons appeared repeatedly in runtime snapshots:
  - home theme toggle
  - glossary theme toggle
  - lab wizard back button
  - source guide "mark read" buttons
  - search clear button
  - several prev/next icon buttons on deep pages
- Impact: Screen-reader and voice-control users cannot reliably identify or invoke these controls.
- WCAG / Standard: WCAG 4.1.2, 2.5.3
- Recommendation: add `aria-label` for every icon-only or icon-dominant action, including check controls and mobile utility buttons.
- Suggested command: `/harden`

### 5. Search modal is not an accessible dialog and does not isolate background interaction

- Location: `client/src/components/SearchModal.tsx`
- Severity: High
- Category: Accessibility
- Verification: Browser-verified with modal open; source-confirmed
- Description: The modal is a custom `div` overlay without `role="dialog"`, `aria-modal`, a labelled title, or a focus trap. When open, the runtime accessibility snapshot still exposed many background controls together with the search box.
- Impact: Keyboard users can lose context, focus can escape, and assistive tech does not get a reliable modal boundary.
- WCAG / Standard: WCAG 2.4.3, 4.1.2
- Recommendation: rebuild on top of the existing dialog primitive or implement full modal semantics and focus management.
- Suggested command: `/harden`

### 6. Micro-lesson mobile layout does not adapt to small screens

- Location: `client/src/pages/MicroLessonPage.tsx`
- Severity: High
- Category: Responsive
- Verification: Browser-verified on 390px viewport
- Description: On mobile, the lesson page still renders a persistent sidebar plus main content side by side, leaving the article area cramped and visually compressed instead of switching to a true mobile-first flow.
- Impact: Deep-learning content becomes harder to read exactly where users need the best text layout. This directly harms the product's core use case: extended study.
- WCAG / Standard: responsive adaptation failure; violates the design principle to adapt rather than just shrink.
- Recommendation: collapse lesson navigation into a drawer, accordion, or top stepper on narrow screens and give content the full viewport width.
- Suggested command: `/adapt`

### 7. Setup guide creates a keyboard-heavy "copy button wall"

- Location: `client/src/pages/SetupGuide.tsx`
- Severity: High
- Category: Accessibility / UX
- Verification: Browser-verified
- Description: The runtime snapshot exposed 40+ separate "Copy" buttons on the page. The density is visually manageable, but keyboard navigation and screen-reader exploration become noisy and repetitive.
- Impact: Users relying on keyboard or assistive tech must tab through an excessive number of similar controls to move through a long-form document.
- WCAG / Standard: usability and sequential navigation burden
- Recommendation: consider progressive disclosure, grouping copy actions, sticky code actions only on focus/hover, or section-level copy affordances rather than one button for every block in the default tab order.
- Suggested command: `/distill`

## Medium-Severity Issues

### 8. Reduced-motion support is absent across ambient and interactive motion

- Location: `client/src/index.css`, `client/src/pages/Home.tsx`, `client/src/pages/LabDetailPage.tsx`, `client/src/components/assessment/QuestionCard.tsx`, `client/src/components/home/PhaseCardGrid.tsx`
- Severity: Medium
- Category: Accessibility / Performance
- Verification: Source-confirmed, browser-observed animations
- Description: No `prefers-reduced-motion` handling exists, despite ambient animated blobs, rotating icons, translated card hover states, and animated height transitions.
- Impact: Motion-sensitive users get no accommodation, and some animations are heavier than needed for a serious long-form reading product.
- WCAG / Standard: aligns with reduced-motion best practice and WCAG 2.3.3 intent
- Recommendation: add a motion-safe strategy and disable or simplify ambient effects under reduced motion.
- Suggested command: `/optimize`

### 9. Hard-coded colors and decorative styling bypass the token system

- Location: 19+ frontend files including `client/src/pages/Home.tsx`, `client/src/pages/LabDetailPage.tsx`, `client/src/pages/SourceGuidePage.tsx`, `client/src/components/labs/TerminalCodeBlock.tsx`
- Severity: Medium
- Category: Theming
- Verification: Source-confirmed
- Description: The app has a good OKLCH token base, but many pages still hard-code `#E8441A`, `#FF6B35`, `orange-500`, `green-500`, `purple-500`, `zinc-*`, and literal inline backgrounds.
- Impact: Theme consistency becomes fragile, light/dark parity is harder to maintain, and future design tuning becomes expensive.
- Recommendation: centralize brand accents, status colors, and special surfaces into semantic tokens or reusable utilities.
- Suggested command: `/normalize`

### 10. Home hero remains visually inefficient and oversized on mobile

- Location: `client/src/pages/Home.tsx`
- Severity: Medium
- Category: Responsive / Anti-pattern
- Verification: Browser-verified on 390px viewport
- Description: The mobile hero still uses oversized multi-line headline treatment and leaves substantial empty visual territory before the rest of the learning content becomes visible.
- Impact: The page feels visually dramatic but less efficient for study-oriented users, especially on smaller devices.
- Recommendation: tighten the mobile hero, reduce decorative vertical consumption, and surface learning navigation sooner.
- Suggested command: `/quieter`

### 11. Search modal remains exposed as a backdrop-plus-panel pattern rather than a product-grade search command surface

- Location: `client/src/components/SearchModal.tsx`
- Severity: Medium
- Category: Anti-pattern / UX
- Verification: Browser-verified and source-confirmed
- Description: Beyond accessibility, the search experience still feels like a generic overlay rather than an integrated command surface. It uses low-contrast helper text, generic badges, and a visually plain panel despite being a high-value feature.
- Impact: The feature works, but it undersells one of the product's strongest productivity surfaces.
- Recommendation: once semantics are fixed, redesign it as a tighter command palette with stronger information hierarchy and fewer low-opacity states.
- Suggested command: `/polish`

### 12. Several top-level pages still omit a `main` landmark

- Location: `client/src/pages/Home.tsx`, `client/src/pages/SetupGuide.tsx`, `client/src/pages/GlossaryPage.tsx`, `client/src/pages/PracticePage.tsx`, `client/src/pages/NotFound.tsx`
- Severity: Medium
- Category: Accessibility / Semantics
- Verification: Source-confirmed
- Description: Some routes use `header`/`main` correctly, but several other top-level pages still rely only on container `div`s and `section`s.
- Impact: Inconsistent screen-reader navigation and weaker semantic structure across a content-heavy product.
- WCAG / Standard: supports WCAG 1.3.1
- Recommendation: normalize every page shell to a consistent landmark structure.
- Suggested command: `/harden`

### 13. Source guide "mark read" actions are visually clear but semantically weak

- Location: `client/src/pages/SourceGuidePage.tsx`
- Severity: Medium
- Category: Accessibility
- Verification: Browser-verified and source-confirmed
- Description: The read-state buttons render as small icon boxes without readable names in runtime snapshots. They function more like checkboxes, but without checkbox semantics or labels.
- Impact: Users cannot reliably understand or announce which file is being toggled as read.
- Recommendation: expose them as labelled checkboxes or buttons with accessible names tied to the corresponding file path.
- Suggested command: `/harden`

### 14. The 404 page breaks the established design language

- Location: `client/src/pages/NotFound.tsx`
- Severity: Medium
- Category: Theming / Anti-pattern
- Verification: Browser-verified and source-confirmed
- Description: The 404 route uses a different visual vocabulary: blue gradient background, glass card, pulse circle, and a generic button treatment unrelated to the AMD-lab system.
- Impact: It feels like a borrowed template rather than part of the same product, which weakens overall design credibility.
- Recommendation: redesign the not-found state using the same tokens, typography, and spatial language as the main product.
- Suggested command: `/normalize`

## Low-Severity Issues

### 15. Type system documentation and implementation are out of sync

- Location: `client/src/index.css`
- Severity: Low
- Category: Theming / Documentation
- Verification: Source-confirmed
- Description: The comments still describe a heading system around Space Grotesk, while implementation uses `IBM Plex Sans` for the body and does not define a clearly separate heading face.
- Impact: The documented design system is harder to trust or extend.
- Recommendation: either implement the intended type pairing or update the comments to reflect the real system.
- Suggested command: `/polish`

### 16. Many utility controls are below ideal touch-target size

- Location: multiple page headers and small action rows
- Severity: Low
- Category: Responsive / Accessibility
- Verification: Browser-verified and source-confirmed
- Description: Language toggles, theme toggles, search clear buttons, and tiny mono badges often land below the 44x44 target-size guidance.
- Impact: Minor but recurring friction on touch devices.
- Recommendation: standardize compact controls with a minimum interactive box size.
- Suggested command: `/adapt`

---

## Patterns & Systemic Issues

- Hard-coded colors appear across 19+ files despite a solid token foundation.
- Nested interactive elements recur in multiple major flows.
- Unnamed icon-only controls recur in page-level custom UI.
- Mobile adaptation is strongest on some list/detail pages but weakest on home and micro-lesson shells.
- The design system is strongest in the data/content model and weakest in page-level shell consistency.
- Deep routes rely on custom components more than hardened shared primitives, and quality drops there.
- English locale coverage is strong on top-level pages but incomplete in deep micro-lesson content.

---

## Positive Findings

- All audited routes rendered without runtime crashes or console errors.
- The app has strong information architecture and unusually rich domain content.
- Light/dark theming already has a real token base in `client/src/index.css`.
- Several routes already use semantic headings and structured content effectively.
- The source guide, lab system, and assessment concepts are meaningful and differentiated product features, not filler pages.
- The bilingual routing model is structurally sound at the app-shell level.

---

## Recommendations By Priority

### 1. Immediate

- Restore mobile navigation on home.
- Fix English micro-lesson locale correctness.
- Remove nested interactive elements.
- Add accessible labels to all icon-only and checkbox-like controls.
- Replace or harden the search modal as a real dialog.

### 2. Short-term

- Rework micro-lesson mobile layout.
- Reduce the setup page's keyboard burden from excessive copy buttons.
- Normalize landmarks across all page shells.
- Add reduced-motion handling.

### 3. Medium-term

- Normalize hard-coded colors into semantic tokens.
- Reduce glass / glow / gradient overuse on home and setup.
- Refine search as a stronger command surface.
- Bring the 404 page into the same system.

### 4. Long-term

- Finish full English deep-content localization.
- Unify type system documentation with implementation.
- Build a reusable page-shell standard for all long-form educational views.

---

## Suggested Commands For Fixes

- Use `/adapt` to fix mobile home navigation, touch targets, and micro-lesson mobile layout.
- Use `/harden` to fix locale correctness, nested interactive semantics, dialog semantics, landmarks, and unlabeled controls.
- Use `/normalize` to centralize colors and pull the 404 page back into the system.
- Use `/optimize` to add reduced-motion handling and replace `transition-all` / heavy decorative motion.
- Use `/quieter` to remove AI-slop visual tells from home and setup.
- Use `/distill` to reduce tab-stop overload and repetitive control density in setup.
- Use `/polish` to refine search and align the typographic system.

---

## Summary Verdict

The product is much stronger in curriculum depth and conceptual differentiation than in shell execution. The runtime audit confirms that the biggest risks are not "the site is broken" but rather:

- core navigation disappears on mobile
- deep English study flows are not actually English
- semantics and labels break down in custom page-level components
- the visual system overuses decorative patterns that undercut the disciplined, elite tone defined in `CLAUDE.md`

If remediated in that order, the platform can move from "promising and content-rich" to "production-grade and convincingly designed."
