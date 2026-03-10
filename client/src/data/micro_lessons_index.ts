/* ============================================================
   Micro-lessons index — resolves micro-lessons by locale
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

// English micro-lesson imports
import { module0MicroLessonsEn } from "./module0_micro_lessons_en";
import { module05MicroLessonsEn } from "./module05_micro_lessons_en";
import { module1MicroLessonsEn } from "./module1_micro_lessons_en";
import { module2MicroLessonsEn } from "./module2_micro_lessons_en";
import { module3MicroLessonsEn } from "./module3_micro_lessons_en";
import { module4MicroLessonsEn } from "./module4_micro_lessons_en";
import { module5MicroLessonsEn } from "./module5_micro_lessons_en";
import { module6MicroLessonsEn } from "./module6_micro_lessons_en";
import { module7MicroLessonsEn } from "./module7_micro_lessons_en";
import { module8MicroLessonsEn } from "./module8_micro_lessons_en";
import { module9MicroLessonsEn } from "./module9_micro_lessons_en";
import { module10MicroLessonsEn } from "./module10_micro_lessons_en";
import { module11MicroLessonsEn } from "./module11_micro_lessons_en";

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

const microLessonsEn: Record<string, MicroLessonModule> = {
  intro: module0MicroLessonsEn,
  ecosystem: module05MicroLessonsEn,
  prerequisites: module1MicroLessonsEn,
  hardware: module2MicroLessonsEn,
  kernel: module3MicroLessonsEn,
  drm: module4MicroLessonsEn,
  amdgpu: module5MicroLessonsEn,
  debugging: module6MicroLessonsEn,
  "rocm-kernel": module7MicroLessonsEn,
  "rocm-compute": module8MicroLessonsEn,
  llvm: module9MicroLessonsEn,
  testing: module10MicroLessonsEn,
  career: module11MicroLessonsEn,
};

export type Locale = "zh" | "en";

/**
 * Returns micro-lessons for the given locale.
 */
export function getMicroLessonsByModule(locale: Locale): Record<string, MicroLessonModule> {
  return locale === "en" ? microLessonsEn : microLessonsZh;
}

export function isMicroLessonLocalized(locale: Locale): boolean {
  return true;
}
