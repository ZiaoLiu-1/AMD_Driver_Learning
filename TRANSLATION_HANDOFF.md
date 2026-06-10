# AMD Driver Learning Platform - English Translation Handoff

This document summarizes the ongoing effort to translate the AMD Driver Learning Platform's micro-lessons from Chinese to high-quality, idiomatic English. It provides the necessary context, guidelines, and current status for any contributor picking up the work.

## 🎯 Objective
Translate the existing Chinese `.ts` micro-lesson data files into dedicated English `_en.ts` files, ensuring technical accuracy, natural readability, and zero mixed Chinese/English content.

## 🛠️ Translation Strategy
We are using an **incremental, manual translation approach** rather than automated global translation, as the technical concepts (PCIe, DRM, GPU memory, etc.) require precise wording.

1. **Dedicated Files:** Each Chinese source file (e.g., `module2_group1.ts`) has a corresponding English file created (e.g., `module2_group1_en.ts`).
2. **Translation Rules:**
   - **Quality:** Produce natural, idiomatic English. Avoid literal, robotic translations.
   - **Completeness:** Translate *everything*—summaries, key points, diagram contents/captions, code explanations, lab comments, expected outputs, debug exercises, hints, and interview questions.
   - **Formatting:** Preserve all Markdown, structural JSON formatting, and code blocks perfectly.
   - **Zero Chinese:** The final `_en.ts` file must compile with 0 Chinese characters.
3. **Workflow for Each File:**
   - Read the original Chinese `.ts` file thoroughly.
   - Create/overwrite the `_en.ts` file with the translated content.
   - Run compilation check: `npx tsc --noEmit`
   - Run Chinese character check: `node -e "const c=require('fs').readFileSync('client/src/data/FILENAME_en.ts','utf8'); console.log(c.match(/[\u4e00-\u9fff]/g)?.length || 0)"`
   - Test build: `npm run build`
   - Route the new English file in `client/src/data/micro_lessons_index.ts` if not already done.

## 📊 Current Status (updated 2026-05-26)

**English translation is COMPLETE for all modules.** Every Chinese micro-lesson
data file now has a corresponding `_en.ts` file, all routed through
`client/src/data/micro_lessons_index.ts` / `MicroLessonPage.tsx`:

- ✅ Module 0 — `module0_micro_lessons_en.ts`
- ✅ Module 0.5 — `module05_micro_lessons_en.ts`
- ✅ Module 1 — `module1_micro_lessons_en.ts`
- ✅ Module 2 — `module2_group1_en.ts`, `module2_group2_en.ts`, `module2_group3_en.ts`
- ✅ Modules 3, 4, 6, 7, 8, 9, 10, 11 — `module{3,4,6,7,8,9,10,11}_micro_lessons_en.ts`
- ✅ Module 5 — `module5_micro_lessons_en.ts`
- ✅ Curriculum, ecosystem, and glossary all have `_en` counterparts.

This document is retained for the translation *guidelines* above (still the standard
for any new content). It is **no longer a work-in-progress handoff**.

## 🚀 Remaining work (maintenance, not initial translation)

- **Terminology consistency pass:** sweep all `_en.ts` files for consistent rendering
  of recurring terms (ring buffer, command submission, fence, doorbell, etc.).
- **zh ↔ en parity:** when either language is edited for technical correctness, mirror
  the change in the other. (A 2026-05 content-freshness audit found several places where
  English files were corrected/softened but the Chinese counterparts were not — see
  `references/content-freshness-verification-2026-05-26.md`.)
- **No Chinese in `_en.ts`:** keep verifying `_en.ts` files contain 0 CJK characters.

## 🌿 Git Strategy
- Initial translation landed via the `feature/micro-lessons-en-translation` branch (now merged).
- Commit logically per module/group; keep `client/src/data/micro_lessons_index.ts` routing in sync.

## 💡 Tips for Contributors
- Many modules are very large. For instance, Module 2 is split into `module2_group1`, `group2`, etc. Translate one group at a time.
- Pay special attention to the `diagram` fields block. Keep the ASCII art aligned when translating the text inside it.
- Ensure the `id`, `duration`, and `difficulty` fields are preserved exactly as they are in the source.
