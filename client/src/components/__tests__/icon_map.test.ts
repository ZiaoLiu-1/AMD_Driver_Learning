import { describe, it, expect } from "vitest";
import { resolveIcon } from "../DynamicIcon";
import { loadCurriculum } from "@/data/curriculum_index";
import { loadAllMicroLessons } from "@/data/micro_lessons_index";

// DynamicIcon uses an explicit icon map so the full lucide-react set is
// tree-shaken out of the bundle. Every lucide-style icon name referenced by
// content data must be registered there; emoji icons intentionally fall back.
const lucideStyleName = /^[A-Za-z][A-Za-z0-9-_]*$/;

describe("content icon names resolve in DynamicIcon's map", () => {
  it("covers every module and lesson-group icon in both locales", async () => {
    for (const locale of ["zh", "en"] as const) {
      const curriculum = await loadCurriculum(locale);
      for (const m of curriculum) {
        if (lucideStyleName.test(m.icon)) {
          expect(resolveIcon(m.icon), `module ${locale}:${m.id} icon "${m.icon}"`).toBeDefined();
        }
      }

      const all = await loadAllMicroLessons(locale);
      for (const [moduleId, mod] of Object.entries(all)) {
        for (const group of mod.groups ?? []) {
          if (group.icon && lucideStyleName.test(group.icon)) {
            expect(
              resolveIcon(group.icon),
              `group ${locale}:${moduleId}:${group.title ?? group.id} icon "${group.icon}"`,
            ).toBeDefined();
          }
        }
      }
    }
  });
});
