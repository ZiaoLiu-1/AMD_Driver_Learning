// ============================================================
// Search Index — builds a flat, searchable list from all content
// ============================================================
import type { Locale } from "@/data/curriculum_index";
import { loadCurriculum, loadGlossaryByModule } from "@/data/curriculum_index";
import { loadAllMicroLessons } from "@/data/micro_lessons_index";

export type SearchResultKind = "lesson" | "module" | "glossary";

export interface SearchResult {
  kind: SearchResultKind;
  title: string;
  subtitle: string;
  body: string;           // used for matching, not displayed
  href: string;           // path without locale, e.g. /module/intro
  icon: string;
  moduleId: string;
  locale: Locale;         // which language this result is from
}

const _cache: Record<Locale, SearchResult[]> = { zh: [], en: [] };

export async function buildSearchIndex(locale: Locale = "zh"): Promise<SearchResult[]> {
  if (_cache[locale]?.length) return _cache[locale];

  const [curriculum, glossaryByModule, microLessonsByModule] = await Promise.all([
    loadCurriculum(locale),
    loadGlossaryByModule(locale),
    loadAllMicroLessons(locale),
  ]);

  const results: SearchResult[] = [];

  // ── Modules (overview) ────────────────────────────────────
  for (const m of curriculum) {
    results.push({
      kind: "module",
      title: m.title,
      subtitle: `Module ${m.number} · ${m.titleEn} · ${m.estimatedHours}h`,
      body: [m.title, m.titleEn, m.description, m.theory.overview].join(" ").toLowerCase(),
      href: `/module/${m.id}`,
      icon: m.icon,
      moduleId: m.id,
      locale,
    });

    // Interview questions from the module overview
    for (const q of m.interviewQuestions ?? []) {
      results.push({
        kind: "lesson",
        title: q.question,
        subtitle: `Module ${m.number} Interview · ${q.difficulty}`,
        body: [q.question, q.hint, q.answer].join(" ").toLowerCase(),
        href: `/module/${m.id}`,
        icon: "💬",
        moduleId: m.id,
        locale,
      });
    }
  }

  // ── Micro-lessons ─────────────────────────────────────────
  for (const [moduleId, mod] of Object.entries(microLessonsByModule)) {
    const currModule = curriculum.find(m => m.id === moduleId);
    const groups = mod.groups ?? [];
    for (const group of groups) {
      for (const lesson of group.lessons ?? []) {
        const summary = lesson.concept?.summary ?? lesson.summary ?? "";
        const keyPoints = (lesson.concept?.keyPoints ?? lesson.keyPoints ?? []).join(" ");
        const explanation = (lesson.concept?.explanation ?? []).join(" ");
        results.push({
          kind: "lesson",
          title: lesson.title,
          subtitle: `${currModule?.title ?? moduleId} › ${group.title ?? group.groupTitle ?? ""} · ${lesson.number}`,
          body: [lesson.title, lesson.titleEn ?? "", summary, keyPoints, explanation].join(" ").toLowerCase(),
          href: `/module/${moduleId}/lesson/${lesson.id}`,
          icon: group.icon ?? currModule?.icon ?? "BookOpen",
          moduleId,
          locale,
        });
      }
    }
  }

  // ── Glossary ──────────────────────────────────────────────
  for (const [moduleId, terms] of Object.entries(glossaryByModule)) {
    const currModule = curriculum.find(m => m.id === moduleId);
    for (const term of terms) {
      results.push({
        kind: "glossary",
        title: `${term.abbr} — ${term.fullEn}`,
        subtitle: `${term.zhName} · ${currModule?.title ?? moduleId}`,
        body: [term.abbr, term.fullEn, term.zhName, term.description].join(" ").toLowerCase(),
        href: `/glossary?q=${encodeURIComponent(term.abbr)}`,
        icon: "📚",
        moduleId,
        locale,
      });
    }
  }

  _cache[locale] = results;
  return results;
}

function scoreResult(r: SearchResult, q: string, words: string[]): number {
  let score = 0;
  if (r.title.toLowerCase().includes(q)) score += 10;
  for (const w of words) {
    if (r.title.toLowerCase().includes(w)) score += 3;
    if (r.subtitle.toLowerCase().includes(w)) score += 2;
    if (r.body.includes(w)) score += 1;
  }
  return score;
}

/** Search within a single locale */
export async function searchContent(
  query: string,
  limit = 12,
  locale: Locale = "zh",
): Promise<SearchResult[]> {
  if (!query.trim()) return [];
  const index = await buildSearchIndex(locale);
  const q = query.toLowerCase().trim();
  const words = q.split(/\s+/);

  return index
    .map(r => ({ result: r, score: scoreResult(r, q, words) }))
    .filter(x => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(x => x.result);
}

/** Search across both zh and en, returning merged results from both languages */
export async function searchContentBilingual(query: string, limit = 16): Promise<SearchResult[]> {
  if (!query.trim()) return [];
  const q = query.toLowerCase().trim();
  const words = q.split(/\s+/);

  const [zhIndex, enIndex] = await Promise.all([buildSearchIndex("zh"), buildSearchIndex("en")]);

  const scored: { result: SearchResult; score: number }[] = [];

  for (const r of zhIndex) {
    const score = scoreResult(r, q, words);
    if (score > 0) scored.push({ result: r, score });
  }
  for (const r of enIndex) {
    const score = scoreResult(r, q, words);
    if (score > 0) scored.push({ result: r, score });
  }

  // Deduplicate by href+locale (same content in both langs can appear - prefer higher score)
  const seen = new Map<string, number>();
  const deduped: { result: SearchResult; score: number }[] = [];
  for (const item of scored.sort((a, b) => b.score - a.score)) {
    const key = `${item.result.locale}:${item.result.href}`;
    if (seen.has(key)) continue;
    seen.set(key, item.score);
    deduped.push(item);
  }

  return deduped.slice(0, limit).map(x => x.result);
}
