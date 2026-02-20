# AMD Learning Platform — Quality Criteria

Each module is scored on 6 criteria (1–5 each, total 30). A module passes at ≥ 20/30.

## Scoring Rubric

### 1. Theory Depth (1–5)
| Score | Description |
|-------|-------------|
| 1 | Surface-level overview only, no source references |
| 2 | Mentions concepts but doesn't cite real kernel code or files |
| 3 | References actual source files (e.g., `gfx_v11_0.c`) but stays high-level |
| 4 | Cites specific functions, data structures, and code paths |
| 5 | Function-level detail with `file:line` references and data-flow explanations |

### 2. Code Examples (1–5)
| Score | Description |
|-------|-------------|
| 1 | No code or only bash commands |
| 2 | Bash-only code snippets |
| 3 | Real C/C++ kernel code with annotations |
| 4 | Annotated kernel code with file:line references from the actual kernel tree |
| 5 | Multiple annotated code walks through real kernel functions with inline diagrams |

### 3. Interview Coverage (1–5)
| Score | Description |
|-------|-------------|
| 1 | 0–1 questions |
| 2 | 2 questions, all easy/medium |
| 3 | 3–4 questions with at least 1 hard |
| 4 | 5+ questions spanning easy/medium/hard with detailed answers |
| 5 | 6+ questions, at least 2 hard, with model answers and follow-up prompts |

### 4. Completeness (1–5)
| Score | Description |
|-------|-------------|
| 1 | Multiple placeholder sections ("正在完善中" / "TODO") |
| 2 | 1–2 placeholders remaining |
| 3 | No placeholders but some sections are thin (< 2 sentences) |
| 4 | All sections have substantial content |
| 5 | Zero placeholders, all tabs (Theory/Code/Project/Interview) fully populated |

### 5. Diagrams (1–5)
| Score | Description |
|-------|-------------|
| 1 | No diagrams at all |
| 2 | 1 diagram, or diagrams that are just text lists |
| 3 | 2+ ASCII diagrams showing data flow or architecture |
| 4 | 3+ diagrams with captions, covering key concepts |
| 5 | Rich ASCII diagrams in most theory sections with captions explaining relevance |

### 6. Resources (1–5)
| Score | Description |
|-------|-------------|
| 1 | No external references |
| 2 | 1–2 links only |
| 3 | 3+ links (docs, repos) but no book references |
| 4 | 3+ links + at least 1 book reference with ISBN/URL |
| 5 | 4+ links + 2+ book references, covers docs, videos, repos, papers |

---

## Anti-Patterns to Avoid

1. **Generic hello_kernel.c** — Code examples should come from (or closely mirror) the actual Linux kernel tree, not toy examples
2. **Bash-only code tabs** — The Code Reading tab should have real C/kernel code, not just shell commands
3. **Placeholder text** — Any `"正在完善中"` or `"TODO"` is an automatic fail on Completeness
4. **Missing diagrams in advanced modules** — Debugging, architecture, and data-flow modules MUST have diagrams
5. **Too few interview questions** — Advanced modules (30+ hours) should have ≥ 5 interview questions
6. **No book references** — Every module should reference at least one authoritative book or specification
7. **Shallow theory** — Theory sections that don't cite actual source files or kernel paths are weak

---

## Pass Threshold (Surface Quality)

- **Pass**: ≥ 20/30 total, with no criterion below 2
- **Fail**: < 20/30, or any criterion at 1

---

## Textbook Depth Rubric (New — Feb 2026)

The surface quality rubric above checks "does content exist and is it good." This deeper rubric checks "is there ENOUGH content to teach the topic comprehensively."

### Content Depth (1–5)
| Score | Description |
|-------|-------------|
| 1 | Summary only — 2-6 paragraphs covering the topic at overview level (~15 min read) |
| 2 | Moderate overview — multiple sections with some diagrams and code, but only scratches surface (~30 min read) |
| 3 | Partial coverage — has micro-lessons but only covers 30-50% of the claimed study hours |
| 4 | Substantial coverage — micro-lessons cover 60-80% of the topic, approaching textbook quality |
| 5 | Textbook quality — reading the chapter gives 90% mastery. Only niche topics require external docs |

### Micro-Lesson Coverage (target ratio)
- **Rule of thumb**: ~3 micro-lessons per 10 hours of estimated study time
- Each micro-lesson = 6 sections (Concept → Diagram → Code Walk → Mini Lab → Debug Exercise → Interview Q)
- Each micro-lesson = ~15-20 minute focused reading unit
- A module claiming 60h should have ~18 micro-lessons in ~4-6 groups

### Depth Pass Threshold
- **Pass**: Depth ≥ 3/5 AND micro-lesson count ≥ 60% of target ratio
- **Gold**: Depth ≥ 4/5 AND micro-lesson count ≥ 80% of target ratio
