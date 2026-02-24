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
