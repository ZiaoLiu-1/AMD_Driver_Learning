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

## 📊 Current Progress
All work is currently tracked on the `feature/micro-lessons-en-translation` branch.

**Completed Modules:**
- ✅ **Module 0:** `module0_micro_lessons_en.ts` (Introduction & Learning Path)
- ✅ **Module 0.5 (Module 5):** `module05_micro_lessons_en.ts` (AMD & Linux GPU Ecosystem)
- ✅ **Module 1:** `module1_micro_lessons_en.ts` (Prerequisites: C Memory Model, Linux Toolchain)
- ✅ **Module 2, Group 1:** `module2_group1_en.ts` (PCIe Protocol Basics)

*Note: All completed files have been verified to compile and contain 0 Chinese characters.*

## 🚀 Next Steps / Todo
The following files still need to be written with proper English translations. Scaffold files (empty or with Chinese placeholders) might exist, but they need the full translation treatment.

**High Priority (Next in sequence):**
1. 🔲 `module2_group2_en.ts` — Kernel PCI Driver Dev
2. 🔲 `module2_group3_en.ts` — GPU Memory & Device Mgmt
3. 🔲 `module2_micro_lessons_en.ts` — (Root index for Module 2 if needed)
4. 🔲 `module3_micro_lessons_en.ts` — GPU Execution Model
5. 🔲 `module4_micro_lessons_en.ts` — Display Architecture
6. 🔲 `module6_micro_lessons_en.ts` — (Follow sequential order...)

## 🌿 Git Strategy
- A dedicated branch `feature/micro-lessons-en-translation` has been created and pushed to the remote.
- Please commit logically as you finish each module or group.
- Keep the `client/src/data/micro_lessons_index.ts` routing updated as you add new English exports.

## 💡 Tips for Contributors
- Many modules are very large. For instance, Module 2 is split into `module2_group1`, `group2`, etc. Translate one group at a time.
- Pay special attention to the `diagram` fields block. Keep the ASCII art aligned when translating the text inside it.
- Ensure the `id`, `duration`, and `difficulty` fields are preserved exactly as they are in the source.
