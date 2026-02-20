# AMD Learning Platform — Development Log

Living log of lessons learned during module development. Read the latest carry-forward lessons before starting a new module.

---

## Session: 2026-02-20 — Cross-Module Quality Audit

**Modules reviewed**: All (0 through 11)

**Scores**:
| Module | Score | Status |
|--------|-------|--------|
| 0 — Intro | 14/30 | FAIL |
| 0.5 — Ecosystem | 24/30 | PASS |
| 1 — Prerequisites | 22/30 | PASS |
| 2 — Hardware Interface | 22/30 | PASS |
| 3 — Kernel Dev | 16/30 | FAIL |
| 4 — DRM Subsystem | 20/30 | PASS |
| 5 — AMDGPU Driver | 23/30 | PASS |
| 6 — Debugging | 18/30 | FAIL |
| 7 — ROCm Kernel | 17/30 | FAIL |
| 8 — ROCm Compute | 16/30 | FAIL |
| 9 — LLVM Backend | 18/30 | FAIL |
| 10 — Testing | 13/30 | FAIL |
| 11 — Career | 17/30 | FAIL |

**Carry-forward lessons**:
1. Every theory section should have a `diagram` field — modules without diagrams consistently score low
2. Code Reading tabs must have real C/kernel code, not just bash commands
3. Advanced modules (30+ hours) need ≥ 5 interview questions spanning easy/medium/hard
4. Always cite actual kernel source files and functions, not generic examples
5. Book references (keyBooks) should never be empty — even a kernel docs URL counts

**Fix priority**: 10 → 0 → 3 → 6 → 7 → 8 → 9 → 11

---

## Session: 2026-02-20 — Fix All 8 Failing Modules

**Module(s) worked on**: 10 (Testing), 0 (Intro), 3 (Kernel Dev), 6 (Debugging), 7 (ROCm Kernel), 8 (ROCm Compute), 9 (LLVM Backend), 11 (Career)

**Changes made**:

### Module 10 (Testing) — 13/30 → ~24/30
- Added 5 theory sections (was 2), each with ASCII diagram
- Added IGT test architecture diagram, CI pipeline diagram, ftrace debugging flow, bug report structure, kernel selftest comparison diagram
- Added 2 real C code examples: IGT GEM BO test (with igt_main/igt_subtest), KUnit drm_buddy test
- Added 4 new interview questions (5 total): IGT test writing, IGT vs KUnit comparison, CI flaky tests, ftrace debugging
- Added 2 book references (LDD3, Linux Kernel in a Nutshell)
- Added 2 more online resources (DRM CI docs, ftrace docs)
- Added new sub-module: 10.4 CI & Test Pipeline

### Module 0 (Intro) — 14/30 → ~23/30
- Added ASCII diagrams to 3 theory sections: "why AMD" stats, learning path dependency graph, kernel driver stack full visual
- Added new theory section "learning path overview" with module dependency diagram
- Added new theory section "kernel driver stack" with complete layered architecture
- Added real C code example: amdgpu_pci_probe entry function from amdgpu_drv.c
- Added 3 new interview questions (5 total): driver stack layers, amdgpu code organization, PCIe BAR explanation
- Added 1 more book reference, 2 more online resources

### Module 3 (Kernel Dev) — 16/30 → ~22/30
- Added diagram to char device section showing DRM → amdgpu ioctl dispatch path
- Added diagram to sync mechanism section with decision tree and real amdgpu examples
- Replaced generic Makefile code example with real amdgpu_drv.c PCI driver registration code
- Added 3 new interview questions (5 total): goto error handling, DMA, slab allocator

### Module 6 (Debugging) — 18/30 → ~23/30
- Added ASCII diagrams to ALL 4 theory sections (was 0):
  - printk/debugfs interface map
  - ftrace command submission timeline
  - perf/rocprof tool selection flowchart
  - GPU Hang diagnosis decision tree

### Module 7 (ROCm Kernel) — 17/30 → ~23/30
- Added 4 new interview questions (5 total): AQL vs PM4, SVM unified memory, KFD events/signals, process isolation (PASID)

### Module 8 (ROCm Compute) — 16/30 → ~23/30
- Added diagram to GPU memory hierarchy section with full VRAM → system memory latency chart
- Added 2 new theory sections: HIP memory management, Occupancy & Coalescing optimization
- Added 4 new interview questions (5 total): memory allocation comparison, rocprof profiling, memory coalescing, HIP vs CUDA porting

### Module 9 (LLVM Backend) — 18/30 → ~22/30
- Added VGPR/SGPR physical layout diagram with Occupancy impact table
- Added real AMDGPU ISA assembly code reading example (vector_add gfx1102 disassembly with line-by-line annotations)

### Module 11 (Career) — 17/30 → ~22/30
- Added real C code example showing an actual amdgpu error-path memory leak fix (before/after with commit message)
- Added 3 new interview questions (5 total): finding newbie bugs, AMD Markham team structure, kernel Review process

**Score before → after (estimated)**:
| Module | Before | After |
|--------|--------|-------|
| 10 | 13/30 | ~24/30 |
| 0 | 14/30 | ~23/30 |
| 3 | 16/30 | ~22/30 |
| 6 | 18/30 | ~23/30 |
| 7 | 17/30 | ~23/30 |
| 8 | 16/30 | ~23/30 |
| 9 | 18/30 | ~22/30 |
| 11 | 17/30 | ~22/30 |

**Carry-forward lessons**:
1. Diagrams are the highest-leverage fix — they transform a 1/5 to a 4/5 in one edit
2. Real kernel C code examples (from actual source files) instantly upgrade Code from 2 to 3-4
3. Interview questions should span 3 difficulties; hard questions about debugging/architecture are what AMD interviewers actually ask
4. Citing specific amdgpu functions (amdgpu_pci_probe, kfd_ioctl_create_queue) adds credibility to theory sections
5. The AMDGPU ISA assembly walk-through in Module 9 is a unique value-add — no other learning resource does this

---

## Session: 2026-02-20 — Structural Reassessment: From Summary to Textbook

**Context**: After completing quality fixes on all 8 failing modules, a fundamental problem remains: **every module is still just a summary, not a textbook chapter.** The user's vision is that reading a chapter should give 90% mastery of the topic. Current modules give maybe 10-15%.

### The Core Problem

**Current state**: Each module has:
- 2-6 theory sections, each ~1 paragraph
- 1-2 code examples
- 1 project
- 1-5 interview questions
- Total reading time: ~10-15 minutes per module

**Target state**: Each module should be like a university textbook chapter:
- 10-20+ sessions (sub-chapters), each as deep as the current entire module
- Each session: concept → diagram → code walk → exercise → interview Q
- Collapsible sidebar navigation with progress tracking per session
- Total reading time: proportional to estimated hours (e.g., Module 5 at 100h should have massive content)

### What Already Works: The Micro-Lesson Model

Modules 1 and 2 already have the right structure — **micro-lessons**:
- Module 1 (Prerequisites): 6 lessons in 3 groups, 1032 lines of content
- Module 2 (Hardware): ~11 lessons in 3 groups across 3 data files (~1228 lines)
- Each lesson has 6 sections: Concept → Diagram → Code Walk → Mini Lab → Debug Exercise → Interview Q
- MicroLessonPage.tsx has a collapsible sidebar with expandable groups
- This is exactly the model that needs to be scaled to ALL modules

### Content Depth Assessment (New "Textbook" Rubric)

Scale: 1-5 where 5 = "reading this chapter covers 90% of the knowledge needed"

| Module | Hours | Theory Sections | Micro-Lessons | Content Lines | Depth | Status |
|--------|-------|-----------------|---------------|--------------|-------|--------|
| 0 — Intro | 2h | 4 | 0 | ~150 | 1/5 | Summary only |
| 0.5 — Ecosystem | 8h | 6 | 0 | 407 | 2/5 | Good overview, not deep |
| 1 — Prerequisites | 80h | 3 + 6 lessons | 6 micro-lessons | 1032 | 2/5 | Has lessons but 80h content needs ~40 lessons |
| 2 — Hardware | 40h | 3 + 11 lessons | ~11 micro-lessons | ~1228 | 3/5 | Best ratio — but still needs ~20 lessons for 40h |
| 3 — Kernel Dev | 60h | 3 | 0 | ~180 | 1/5 | Huge gap: 60h module with ~15min of content |
| 4 — DRM | 60h | 3 | 0 | ~190 | 1/5 | Same: 60h with 3 paragraphs |
| 5 — AMDGPU | 100h | 6 | 0 | ~300 | 1/5 | Most complex module, least micro-lesson coverage |
| 6 — Debugging | 50h | 4 | 0 | ~200 | 1/5 | Now has diagrams but still just overview |
| 7 — ROCm Kernel | 40h | 3 | 0 | ~170 | 1/5 | Summary level |
| 8 — ROCm Compute | 50h | 5 | 0 | ~200 | 1/5 | Slightly better after new sections |
| 9 — LLVM | 60h | 3 | 0 | ~180 | 1/5 | Expert module with beginner-level content |
| 10 — Testing | 30h | 5 | 0 | ~280 | 2/5 | Best non-micro-lesson module after fixes |
| 11 — Career | 30h | 3 | 0 | ~150 | 1/5 | Summary level |

### Gap Analysis

**Content volume needed** (rough estimate based on Module 2's ratio):
- Module 2 has ~11 lessons for 40h → ~3.6 lessons per 10h of estimated study
- Scaling to all modules: total ~610h → need ~220 micro-lessons
- Currently have: ~17 micro-lessons (Modules 1 + 2)
- **Gap: ~200 micro-lessons to create**

**Modules with biggest content deficit** (hours vs content):
1. Module 5 (AMDGPU) — 100h, 0 micro-lessons, 6 theory paragraphs → CRITICAL
2. Module 1 (Prerequisites) — 80h, 6 lessons, needs ~24 more
3. Module 3 (Kernel Dev) — 60h, 0 micro-lessons → CRITICAL
4. Module 4 (DRM) — 60h, 0 micro-lessons → CRITICAL
5. Module 9 (LLVM) — 60h, 0 micro-lessons → CRITICAL

### Required Changes

**1. Data Architecture** (one-time):
- Extend the micro-lesson system to all modules
- Each module gets its own `moduleX_micro_lessons.ts` file
- Existing theory/code/project/interview tabs remain as the "chapter overview"
- Micro-lessons become the deep content layer

**2. UI Updates** (one-time):
- Apply MicroLessonPage's collapsible sidebar pattern to all modules
- SubModules in sidebar become clickable, expandable groups
- Each group contains multiple micro-lessons
- Progress tracking per micro-lesson (not just per tab)

**3. Content Expansion** (chapter by chapter):
- Work one module at a time, deeply
- Each module gets 10-30 micro-lessons depending on its estimated hours
- Each micro-lesson: Concept + Diagram + Code Walk + Mini Lab + Debug Exercise + Interview Q
- Goal: 90% knowledge coverage per chapter

### Recommended Expansion Order

1. **Module 0 (Intro)** — First impression, fast to expand (2h → ~3 lessons)
2. **Module 0.5 (Ecosystem)** — Foundation knowledge (8h → ~5 lessons)
3. **Module 3 (Kernel Dev)** — Critical gap, 60h with almost no content
4. **Module 4 (DRM)** — Direct prerequisite for Module 5
5. **Module 5 (AMDGPU)** — The core module, needs the most content
6. Remaining modules in dependency order

### Carry-forward lessons:
1. The micro-lesson format (6 sections per lesson) is the proven model — scale it everywhere
2. One module at a time, deeply — don't spread thin across all modules again
3. Each micro-lesson should take ~15-20 minutes to read, with hands-on exercises
4. Content files should be split (one per module) to keep files manageable
5. The UI changes (collapsible sidebar for all modules) should be done ONCE before content expansion

---

## Log Entry Template

```
## Session: YYYY-MM-DD — [Brief description]

**Module(s) worked on**: [name]
**Changes made**: [bullet list]
**Score before → after**: X/30 → Y/30
**Carry-forward lessons**:
1. ...
2. ...
```
