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
