/* ============================================================
   Curriculum index — resolves curriculum and glossary by locale
   ============================================================ */

import type { Module } from "./curriculum";
import type { GlossaryTerm } from "./curriculum";
import { curriculumZh } from "./curriculum";
import { curriculumEn } from "./curriculum_en";
import { glossaryByModule as glossaryZh } from "./glossary_data";
import { glossaryByModuleEn as glossaryEn } from "./glossary_data_en";

export type Locale = "zh" | "en";

export function getCurriculum(locale: Locale): Module[] {
  return locale === "en" ? curriculumEn : curriculumZh;
}

export function getGlossaryByModule(locale: Locale): Record<string, GlossaryTerm[]> {
  return locale === "en" ? glossaryEn : glossaryZh;
}

export function getTotalHours(locale: Locale): number {
  return getCurriculum(locale).reduce((sum, m) => sum + m.estimatedHours, 0);
}

export function getDifficultyLabels(locale: Locale): Record<string, string> {
  return locale === "en"
    ? {
        beginner: "Beginner",
        intermediate: "Intermediate",
        advanced: "Advanced",
        expert: "Expert",
      }
    : {
        beginner: "入门",
        intermediate: "进阶",
        advanced: "高级",
        expert: "专家",
      };
}
