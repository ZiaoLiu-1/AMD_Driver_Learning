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
