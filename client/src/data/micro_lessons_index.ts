/* ============================================================
   Micro-lessons index — resolves micro-lessons by locale
   For now, English uses the same content (many modules have titleEn).
   Full English micro-lessons can be added to data/en/ later.
   ============================================================ */

import type { MicroLessonModule } from "./micro_lesson_types";
import { module0MicroLessons } from "./module0_micro_lessons";
import { module05MicroLessons } from "./module05_micro_lessons";
import { module1MicroLessons } from "./module1_micro_lessons";
import { module2MicroLessons } from "./module2_micro_lessons";
import { module3MicroLessons } from "./module3_micro_lessons";
import { module4MicroLessons } from "./module4_micro_lessons";
import { module5MicroLessons } from "./module5_micro_lessons";
import { module6MicroLessons } from "./module6_micro_lessons";
import { module7MicroLessons } from "./module7_micro_lessons";
import { module8MicroLessons } from "./module8_micro_lessons";
import { module9MicroLessons } from "./module9_micro_lessons";
import { module10MicroLessons } from "./module10_micro_lessons";
import { module11MicroLessons } from "./module11_micro_lessons";

const microLessonsZh: Record<string, MicroLessonModule> = {
  intro: module0MicroLessons,
  ecosystem: module05MicroLessons,
  prerequisites: module1MicroLessons,
  hardware: module2MicroLessons,
  kernel: module3MicroLessons,
  drm: module4MicroLessons,
  amdgpu: module5MicroLessons,
  debugging: module6MicroLessons,
  "rocm-kernel": module7MicroLessons,
  "rocm-compute": module8MicroLessons,
  llvm: module9MicroLessons,
  testing: module10MicroLessons,
  career: module11MicroLessons,
};

export type Locale = "zh" | "en";

/**
 * Returns micro-lessons for the given locale.
 * English uses the same content for now (lessons have titleEn for display).
 * Full English micro-lesson content can be added to data/en/ when ready.
 */
export function getMicroLessonsByModule(locale: Locale): Record<string, MicroLessonModule> {
  return microLessonsZh;
}
