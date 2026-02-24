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

---
---

# UI Spec: Lab / Experiment System (Feature 2)

> **Branch**: `feature/v4-lab-system`
> **Data layer**: `client/src/data/labs.ts` — 5 labs, bilingual, step-by-step structure
> **Routes**: `/labs` (list), `/labs/:labId` (detail)
> **Pages**: `LabsListPage.tsx`, `LabDetailPage.tsx` (placeholder implementations provided)
> **i18n**: `labs.*` keys in `zh.json` / `en.json`

---

## 1. Lab List Page (`/labs`)

### Current State
A basic card list is already implemented in `LabsListPage.tsx`. Needs design upgrade.

### Requirements
- **Hero section**: Title, subtitle, total lab count, estimated total time.
- **Lab cards** in a grid (1-col mobile, 2-col desktop):
  - Lab title with phase badge (e.g. "Phase 1")
  - Description (2-line clamp)
  - Difficulty badge (color-coded: green/yellow/red)
  - Estimated time with clock icon
  - Tags as small chips
  - Completion status indicator (from localStorage or ProgressContext extension)
  - Hover: subtle lift + border highlight
- **Filter bar**: Filter by phase, difficulty, or completion status.
- **Nav link**: Add "Labs" to the top nav bar in `Home.tsx` header alongside Practice/Glossary/Setup.

### Data Access
```tsx
import { getLabs } from '@/data/labs';
const labs = getLabs(locale);
```

---

## 2. Lab Detail Page (`/labs/:labId`)

### Current State
A basic step wizard is already implemented in `LabDetailPage.tsx`. Needs design upgrade.

### Requirements

#### 2a. Lab Header
- Lab title, description, phase badge, difficulty, estimated time.
- Prerequisites list as checklist items.
- "Start Lab" CTA button.

#### 2b. Step Wizard (core interaction)
- **Left sidebar** (desktop) / **top stepper** (mobile):
  - Numbered step list with completion checkmarks
  - Active step highlighted with AMD gradient accent
  - Progress bar at top showing overall step completion
- **Main content area**:
  - Step title and instruction text (rendered as markdown if needed)
  - **Terminal-style code block** for commands:
    - Dark background (`#0a0a0a`), monospace font (JetBrains Mono)
    - "Copy" button at top-right corner
    - Line numbers optional
    - Multi-line commands with syntax-highlighted `#` comments
  - **Code snippet block** for source code modifications:
    - Syntax-highlighted C code
    - Copy button
  - **Checkpoint card**: Green-bordered callout with check icon
    - Text describing what to verify before proceeding
    - Optional "I've verified this" checkbox
  - **Hint card**: Orange-bordered callout (collapsed by default, click to expand)
  - **Navigation**: Previous/Next step buttons at bottom
  - **Mark complete** button per step

#### 2c. Lab Completion Summary
When all steps are marked complete:
- Celebration animation (confetti or checkmark burst)
- Summary: completion time, steps completed
- "Expected Output" section highlighted
- "Tips" section with practical advice
- Navigation to next lab or back to list

### Responsive
- **Desktop**: 2-column (step nav + content), ~800px max content width
- **Mobile**: Full-width, step nav collapses to horizontal stepper or dropdown

---

## 3. Terminal Code Block Component

A reusable component for displaying terminal commands.

### Props
| Prop | Type | Description |
|------|------|-------------|
| `command` | `string` | Multi-line shell command |
| `title` | `string?` | Optional title (e.g. "Ubuntu/Debian") |

### Behavior
- Dark background, monospace font
- Copy-to-clipboard button (top-right)
- Lines starting with `#` rendered as comments (dimmer color)
- Lines starting with `$` or no prefix rendered as commands
- Animate the copy button: show checkmark for 2 seconds after copy

---

## 4. Checkpoint Component

### Props
| Prop | Type | Description |
|------|------|-------------|
| `text` | `string` | What to verify |
| `verified` | `boolean` | Whether user has verified |
| `onToggle` | `() => void` | Toggle handler |

### Styling
- `bg-green-500/5` background, `border-green-500/20` border
- Check icon, text, and optional "I've verified" checkbox

---

## 5. Progress Tracking

Extend `ProgressContext` or use a separate `labProgress` localStorage key:

```typescript
interface LabProgressState {
  [labId: string]: {
    completedSteps: number[];
    startedAt?: string;
    completedAt?: string;
  };
}
```

---

## 6. Navigation Integration

Add a "Labs" link to the home page header nav (alongside Practice, Glossary, Setup):
```tsx
<Link href="/labs">
  <FlaskConical className="w-3.5 h-3.5" />
  {t("nav.labs")}
</Link>
```

---

## 7. Styling Tokens

- Terminal background: `#0a0a0a` or `bg-zinc-950`
- Terminal text: `text-zinc-100`
- Comment color: `text-zinc-500`
- Checkpoint: green accent
- Hint: orange accent
- Step active: AMD gradient border-left or background
- Difficulty badges: beginner=green, intermediate=yellow, advanced=red

---
---

# UI Spec: Mastery Assessment (Feature 3)

> **Branch**: `feature/v4-mastery-assessment`
> **Data layer**: `client/src/data/mastery_checks.ts` — 6 questions, 5 phase checklists
> **Route**: `/assessment`
> **Page**: `AssessmentPage.tsx` (placeholder provided)
> **i18n**: `assessment.*` keys in `zh.json` / `en.json`

---

## 1. Assessment Dashboard Page (`/assessment`)

### Current State
A basic card list with reveal/hide answer is implemented. Needs full design treatment.

### Requirements

#### 1a. Hero Section
- Page title + subtitle
- **Overall mastery score** visualization:
  - Large circular progress ring showing percentage of completed checklist items
  - "X / Y items completed" text
- Phase progress mini-rings in a row (one per phase)

#### 1b. Radar / Spider Chart
- **Recharts RadarChart** showing mastery across 5 phases
- Each axis = one phase
- Value = percentage of completed checklist items for that phase
- Filled area with AMD gradient color (`#E8441A` → `#FF6B35`)
- Tooltip on hover showing phase name and completion count

```tsx
import { RadarChart, PolarGrid, PolarAngleAxis, Radar } from 'recharts';
// data = [{ phase: 'Architecture', score: 85 }, { phase: 'Memory', score: 30 }, ...]
```

---

## 2. Mastery Question Cards

### Requirements
- Cards grouped by phase (Phase 1, Phase 2, etc.)
- Each card:
  - Question text (prominent, bold)
  - Difficulty badge: core (green), advanced (yellow), expert (red)
  - Phase badge
  - **Hints** section: collapsed by default, show first hint, click to reveal more
  - **"Reveal Answer" button**: click triggers **blur-to-clear animation**
    - Answer text initially rendered with `filter: blur(8px)` + `user-select: none`
    - On click: animate to `filter: blur(0)` over 500ms with easeOut
    - Second click: re-blur
  - Related modules: small clickable badges linking to `/${locale}/module/:id`
  - Related lab: link to `/${locale}/labs/:labId` (if present)

### Flip Card Alternative (optional, more engaging)
- Front: Question text + difficulty + hints
- Back: Reference answer + related resources
- Click or keyboard Enter to flip (3D CSS transform)
- Mobile: tap to flip

---

## 3. Phase Checklists

### Requirements
- One collapsible section per phase
- Each section header shows:
  - Phase number + title
  - **Progress ring** (small, inline) showing checked/total
  - Category breakdown badges (theory: X, code: Y, experiment: Z, debug: W)
- Each checklist item:
  - Checkbox (persisted to localStorage)
  - Description text
  - Category badge (color-coded): theory=blue, code=purple, experiment=green, debug=red
- Checking/unchecking an item updates the radar chart and progress rings in real-time

### Data Persistence
Use `localStorage` key `amd-driver-platform-mastery`:
```typescript
interface MasteryState {
  completedChecks: string[];  // ChecklistItem IDs
  revealedQuestions: string[]; // MasteryQuestion IDs user has reviewed
}
```

---

## 4. Component Specifications

### `MasteryRadarChart`
| Prop | Type | Description |
|------|------|-------------|
| `data` | `{ phase: string; score: number }[]` | Per-phase completion % |

### `MasteryQuestionCard`
| Prop | Type | Description |
|------|------|-------------|
| `question` | `MasteryQuestion` | Question data |
| `revealed` | `boolean` | Whether answer is revealed |
| `onToggle` | `() => void` | Toggle reveal |
| `locale` | `Locale` | For linking |

### `PhaseChecklistSection`
| Prop | Type | Description |
|------|------|-------------|
| `phaseId` | `string` | Phase ID |
| `items` | `ChecklistItem[]` | Checklist items |
| `completedIds` | `Set<string>` | Completed item IDs |
| `onToggle` | `(id: string) => void` | Toggle check |

---

## 5. Animations

- **Blur-to-clear** answer reveal: CSS `filter: blur()` transition, 500ms easeOut
- **Progress ring** fill animation: 800ms easeOut on mount/update
- **Radar chart** area fill: animate data change with Recharts `isAnimationActive`
- **Checkbox** check: scale bounce (0.9 → 1.1 → 1.0)

---

## 6. Responsive

- **Desktop**: Radar chart centered at top, 2-column question grid, checklist below
- **Tablet**: Radar chart at 60% width, 1-column questions
- **Mobile**: Radar chart full-width (compact), stacked layout

---

## 7. Navigation

Add "Assessment" link to Home page header:
```tsx
<Link href="/assessment">
  <ClipboardCheck className="w-3.5 h-3.5" />
  {t("nav.assessment")}
</Link>
```
# UI Spec: Source Code Navigator (Feature 4)

> **Branch**: `feature/v4-source-navigator`
> **Data layer**: `client/src/data/source_roadmap.ts` — 4 stages, 12+ source files
> **Route**: `/source-guide`
> **Page**: `SourceGuidePage.tsx` (placeholder with accordion layout provided)
> **i18n**: `sourceGuide.*` keys in `zh.json` / `en.json`

---

## 1. Source Guide Page (`/source-guide`)

### Current State
A basic accordion-based layout is implemented. Needs design enhancement.

### Requirements

#### 1a. Hero Section
- Page title + subtitle
- Visual: stylized source tree or file hierarchy graphic
- Stats: "4 stages · 12+ files · kernel v6.8"

#### 1b. Stage Timeline / Flow
- **Vertical timeline** connecting the 4 stages with connector lines
- Each stage node:
  - Stage number badge with AMD gradient
  - Title and description
  - File count badge
  - Phase badges (links to engineering phases)
  - Expand/collapse toggle
- Timeline connector: dashed line between stages, solid for completed stages

#### 1c. Source File Cards (inside expanded stages)
Each file card should display:
- **File path** in monospace, color: orange
- **Description** text
- **Key functions** as code badges (`functionName()`)
- **Reading notes** as a bordered callout/tip section
- **Related concepts** as small colored tags
- **External link** button: "View on Bootlin" or "View on GitHub"
  - Open in new tab
  - Bootlin icon for kernel files, GitHub icon for LLVM
- **Reading progress** checkbox: "I've read this file" (persisted to localStorage)

### Data Access
```tsx
import { getSourceStages } from '@/data/source_roadmap';
const stages = getSourceStages(locale);
```

---

## 2. Interactive Features

### 2a. Reading Progress Tracking
- Checkbox per file, persisted to `localStorage` key `amd-driver-platform-source-progress`
- Stage progress: X/Y files read
- Overall progress bar at the top

### 2b. File Dependency Graph (stretch goal)
- Optional: Mermaid or custom SVG graph showing how files depend on each other
- e.g. `amdgpu_drv.c → amdgpu_device.c → amdgpu_vm.c`
- Highlight the current reading position

### 2c. Quick Search
- Filter files by keyword (path, function name, concept)
- Highlight matching text in results

---

## 3. Component Specifications

### `SourceStageTimeline`
| Prop | Type | Description |
|------|------|-------------|
| `stages` | `SourceStage[]` | Stage data |
| `expandedId` | `string \| null` | Currently expanded stage |
| `onToggle` | `(id: string) => void` | Toggle expand |

### `SourceFileCard`
| Prop | Type | Description |
|------|------|-------------|
| `file` | `SourceFile` | File data |
| `read` | `boolean` | Whether user has read |
| `onToggleRead` | `() => void` | Toggle read status |

---

## 4. Responsive Layout

- **Desktop (>1024px)**: Timeline on left (200px), content on right. File cards in 1-column.
- **Tablet (768–1024px)**: Full-width timeline, content below.
- **Mobile (<768px)**: Compact timeline, stacked file cards.

---

## 5. Styling

- File path text: `font-mono text-orange-500`
- Function badges: `bg-muted font-mono text-xs`
- Concept tags: `bg-orange-500/10 text-orange-600`
- External link buttons: outlined, small, with icon
- Reading notes callout: left border orange, light background
- Stage connectors: `border-dashed border-2 border-border`
- Completed stage connector: `border-solid border-orange-500`

---

## 6. Navigation

Add "Source Guide" to home page header nav:
```tsx
<Link href="/source-guide">
  <FileCode className="w-3.5 h-3.5" />
  {t("nav.sourceGuide")}
</Link>
```
---
