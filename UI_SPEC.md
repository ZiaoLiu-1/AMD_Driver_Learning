# UI Spec: Engineering Phases (Feature 1)

> **Branch**: `feature/v4-engineering-phases`
> **Data layer**: `client/src/data/engineering_phases.ts` — 5 phases, types, locale helpers
> **Progress API**: `ProgressContext.getPhaseProgress(phaseId)`, `getOverallPhaseProgress()`
> **i18n**: Updated `home.stage1..stage5` labels and `home.pathTitle/pathSubtitle`

---

## 1. Home Page — Phase Roadmap Hero Section

**Replace** the existing "Five-Stage Learning Path" timeline section in `Home.tsx` with a horizontal/vertical phase roadmap visualization.

### Requirements

- **Layout**: Horizontal on desktop (>1024px), vertical on mobile.
- **Each phase node** shows:
  - Phase number badge (1–5) with AMD gradient for active/completed, muted for locked
  - Phase title (from `getPhases(locale)`)
  - Progress ring (arc chart, 0–100%) reading from `getPhaseProgress(phaseId).percentage`
  - Status indicator: checkmark (completed), spinner (in-progress), lock (prerequisites not met)
  - Module count: e.g. "6 modules"
- **Connector lines** between phases with animated dash pattern for the "current" phase.
- **Click** navigates to the phase's first incomplete module: `/${locale}/module/${firstModuleId}`.
- **Prerequisite lock**: If `phase.prerequisites` phases are not completed, show the phase as locked (greyed out, lock icon).

### Data Access

```tsx
import { getPhases } from '@/data/engineering_phases';
import { useProgress } from '@/contexts/ProgressContext';

const phases = getPhases(locale);
const { getPhaseProgress } = useProgress();
const p1 = getPhaseProgress('phase-1'); // { status, completedModules, totalModules, percentage }
```

### Visual Reference

```
[1]──────[2]──────[3]──────[4]──────[5]
 ●        ○        ○        🔒       🔒
DRM+     Memory   Cmd Sub  Debug    Compiler
amdgpu   Mgmt     & Sched  & FW     & ISA
━━━━━    ━━━━━    ━━━━━    ━━━━━    ━━━━━
85%      30%      0%       locked   locked
```

---

## 2. Phase Card Grid

**Replace or augment** the current module card grid (`curriculum.map(...)`) with phase-based grouping.

### Requirements

- Show phase cards as collapsible groups; each card header shows phase info.
- Inside each phase card, show the existing module cards belonging to that phase (`phase.moduleIds`).
- Phase card header:
  - Phase number + title
  - Overall progress bar
  - Estimated hours
  - Difficulty badge
  - Core concepts as small tags/chips
- Module cards inside: keep existing design but add a "Phase X" badge.
- Allow expanding/collapsing phase groups (default: first incomplete phase expanded).

### Data Access

```tsx
import { engineeringPhases } from '@/data/engineering_phases';
// For each phase, filter curriculum modules:
const phaseModules = phase.moduleIds
  .map(id => curriculum.find(m => m.id === id))
  .filter(Boolean);
```

---

## 3. Phase Progress Overview Bar

**Add** a compact phase progress overview below the hero section (or integrate into existing progress bar area).

### Requirements

- 5 small arc/ring indicators in a row, one per phase.
- Below each ring: phase number and short title.
- Click any ring to scroll to that phase's card group.
- Overall completion text: "Phase 2 of 5 — Core Memory Management".

---

## 4. Component Specifications

### `PhaseRoadmap` component

| Prop | Type | Description |
|------|------|-------------|
| `phases` | `Phase[]` | From `getPhases(locale)` |
| `getPhaseProgress` | `(id: string) => PhaseProgress` | From context |
| `locale` | `'zh' \| 'en'` | Current locale |
| `basePath` | `string` | Locale base path |

### `PhaseCard` component

| Prop | Type | Description |
|------|------|-------------|
| `phase` | `Phase` | Phase data |
| `progress` | `PhaseProgress` | Phase progress |
| `modules` | `Module[]` | Modules in this phase |
| `defaultExpanded` | `boolean` | Auto-expand if current |

### Animations

- Phase transition: use `framer-motion` `layoutId` for smooth card reordering.
- Progress ring: animate from 0 to actual percentage on mount (duration 800ms, easeOut).
- Phase unlock: scale+opacity animation when prerequisites are met.

### Responsive

- **Desktop (>1024px)**: Horizontal roadmap, 2-column module grid per phase.
- **Tablet (768–1024px)**: Horizontal roadmap (compact), 1-column modules.
- **Mobile (<768px)**: Vertical roadmap, full-width module cards.

---

## 5. Styling Tokens

Use existing design system variables:

- Phase active gradient: `linear-gradient(135deg, #E8441A, #FF6B35)` (AMD gradient)
- Phase completed: `var(--color-success)` / green
- Phase locked: `var(--muted-foreground)` with `opacity: 0.4`
- Progress ring stroke: AMD gradient for active, muted for empty
- Phase connector: `border-dashed` with `2px` stroke

---

## 6. i18n Keys Available

Already set in `zh.json` / `en.json`:
- `home.pathTitle` — "五阶段工程化学习路径" / "Five-Phase Engineering Path"
- `home.pathSubtitle` — description
- `home.stage1..stage5` — phase names

Phase data is bilingual via `getPhases(locale)` which returns localized `title`, `description`, `coreConcepts`.
