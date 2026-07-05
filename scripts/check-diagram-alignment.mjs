/* ============================================================
   check-diagram-alignment.mjs — font-independent CJK table check

   ASCII-art diagrams (template literals rendered in
   <pre class="ascii-diagram">) mix CJK and ASCII characters.
   CJK glyphs are NOT reliably 2x the ASCII advance width across
   browser font fallbacks, so a bordered table only aligns on
   every machine if, at each │ border, every row has the same
   COUNT of wide chars AND the same COUNT of narrow chars before
   it (then width = nW*W + nN*N holds for any font metrics).

   The script loads the real lesson data (run it via tsx), walks
   every diagram.content (micro-lessons + curriculum
   TheorySection diagrams, zh and en) and flags bordered tables
   whose (wide, narrow) prefix tuples mismatch across rows.

   Diagrams that are intentional multi-box art (several boxes of
   deliberately different widths sharing lines; detected when row
   right edges disagree by >= 3 half-cells under exact 2:1
   metrics) are reported as SKIPPED, not flagged: they have no
   shared border columns to align.

   Usage: pnpm diagrams:check   (exit 1 if any table is flagged)
   ============================================================ */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadAllMicroLessons } from "../client/src/data/micro_lessons_index";
import { curriculumZh } from "../client/src/data/curriculum";
import { curriculumEn } from "../client/src/data/curriculum_en";

const DATA_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../client/src/data");

// ---------- character classification ----------
// wide: Han, kana, CJK punctuation (incl. U+3000), fullwidth forms.
// Box drawing (U+2500-257F) and everything else (arrows, ticks,
// middle dots, ...) count as narrow.
export function isWide(cp) {
  return (
    (cp >= 0x3400 && cp <= 0x4dbf) || // CJK ext A
    (cp >= 0x4e00 && cp <= 0x9fff) || // CJK unified
    (cp >= 0x3040 && cp <= 0x30ff) || // kana
    (cp >= 0x3000 && cp <= 0x303f) || // CJK punctuation
    (cp >= 0xff00 && cp <= 0xff60) // fullwidth forms
  );
}

function width2(text) {
  let x = 0;
  for (const ch of text) x += isWide(ch.codePointAt(0)) ? 2 : 1;
  return x;
}

// (wide, narrow) prefix tuple before each │ in the line
function borderTuples(line) {
  const tuples = [];
  let w = 0;
  let n = 0;
  for (const ch of line) {
    if (ch === "│") tuples.push({ w, n });
    if (isWide(ch.codePointAt(0))) w++;
    else n++;
  }
  return tuples;
}

// ---------- table detection ----------
const BORDER_ONLY = /^[\s─━═┄┅┈┉┌┐└┘├┤┬┴┼╔╗╚╝╠╣╦╩╬║╭╮╰╯]+$/;

export function isBoxyRow(line) {
  const t = line.trim();
  return t.startsWith("│") && t.endsWith("│") && (t.match(/│/g) || []).length >= 2;
}

export function isBorderLine(line) {
  const t = line.trim();
  return t.length > 0 && BORDER_ONLY.test(t) && /[─━═┄┅┈┉]/.test(t);
}

// e.g. "└──────┘   │   └──────┘": bottoms of side-by-side boxes joined
// by a vertical flow line. Such art cannot be re-padded without
// disconnecting the flow column, so segments containing one are skipped.
const MIXED_BORDER = /^[\s│─━═┄┅┈┉┌┐└┘├┤┬┴┼╔╗╚╝╠╣╦╩╬║╭╮╰╯]+$/;
export function isMixedBorderLine(line) {
  const t = line.trim();
  return (
    t.length > 0 &&
    !isBoxyRow(line) &&
    !isBorderLine(line) &&
    MIXED_BORDER.test(t) &&
    /[─━═┄┅┈┉]/.test(t) &&
    t.includes("│")
  );
}

// Split a diagram into bordered-table segments: contiguous runs of
// boxy rows / border lines, additionally split at box boundaries
// (after a └...┘ bottom border, before a ┌...┐ top border) so that
// vertically stacked boxes are treated independently. Tree art and
// arrow art never produce boxy rows, so they are skipped by
// construction.
export function tableSegments(lines) {
  const runs = [];
  let cur = null;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (isBoxyRow(line) || isBorderLine(line) || isMixedBorderLine(line)) {
      if (!cur) cur = [];
      cur.push({ index: i, text: line, mixed: isMixedBorderLine(line) });
    } else {
      if (cur) runs.push(cur);
      cur = null;
    }
  }
  if (cur) runs.push(cur);

  const isBottom = (l) => /^\s*└.*┘\s*$/.test(l);
  const isTop = (l) => /^\s*┌.*┐\s*$/.test(l);
  const segments = [];
  for (const run of runs) {
    let seg = [];
    for (const item of run) {
      if (isTop(item.text) && seg.length) {
        segments.push(seg);
        seg = [];
      }
      seg.push(item);
      if (isBottom(item.text)) {
        segments.push(seg);
        seg = [];
      }
    }
    if (seg.length) segments.push(seg);
  }
  return segments.filter((s) => s.some((l) => isBoxyRow(l.text)));
}

// Intentional multi-box art: rows disagree about the right edge
// by >= 3 half-cells under exact 2:1 metrics.
export function isBoxArt(rows) {
  const xs = rows.map((r) => width2(r.text.trimEnd()));
  return Math.max(...xs) - Math.min(...xs) >= 3;
}

// Check one segment; returns array of mismatch descriptions.
function checkSegment(segment) {
  const rows = segment.filter((l) => isBoxyRow(l.text));
  if (rows.length < 2) return [];
  const problems = [];

  // group rows by │ count; tuples at every ordinal must agree
  const byCount = new Map();
  for (const r of rows) {
    const tuples = borderTuples(r.text);
    const key = tuples.length;
    if (!byCount.has(key)) byCount.set(key, []);
    byCount.get(key).push({ ...r, tuples });
  }
  for (const [count, group] of byCount) {
    if (group.length < 2) continue;
    const ref = group[0];
    for (const r of group.slice(1)) {
      for (let k = 0; k < count; k++) {
        const a = ref.tuples[k];
        const b = r.tuples[k];
        if (a.w !== b.w || a.n !== b.n) {
          problems.push(
            `border #${k + 1}: line ${ref.index + 1} (w=${a.w},n=${a.n}) vs line ${r.index + 1} (w=${b.w},n=${b.n})`,
          );
          break; // one report per row pair is enough
        }
      }
    }
  }

  // right edge must agree across ALL rows (also catches merged cells)
  const ref = rows[0];
  const refLast = borderTuples(ref.text).at(-1);
  for (const r of rows.slice(1)) {
    const last = borderTuples(r.text).at(-1);
    if (last.w !== refLast.w || last.n !== refLast.n) {
      problems.push(
        `right edge: line ${ref.index + 1} (w=${refLast.w},n=${refLast.n}) vs line ${r.index + 1} (w=${last.w},n=${last.n})`,
      );
    }
  }
  return problems;
}

// ---------- source-file lookup (for reporting) ----------
const fileCache = new Map();
function dataFiles() {
  if (!fileCache.size) {
    for (const f of fs.readdirSync(DATA_DIR)) {
      const full = path.join(DATA_DIR, f);
      if (fs.statSync(full).isFile() && /\.tsx?$/.test(f)) {
        fileCache.set(f, fs.readFileSync(full, "utf8"));
      }
    }
  }
  return fileCache;
}

function findSourceFile(diagramContent) {
  // most distinctive probe: the longest line that is not a border line
  const probe = diagramContent
    .split("\n")
    .filter((l) => l.trim().length > 8 && !isBorderLine(l))
    .sort((a, b) => b.length - a.length)[0];
  if (!probe) return "?";
  const hits = [];
  for (const [f, content] of dataFiles()) {
    // template literals keep the text verbatim; JSON-style strings escape it
    if (content.includes(probe) || content.includes(JSON.stringify(probe).slice(1, -1))) {
      hits.push(f);
    }
  }
  return hits.join(", ") || "?";
}

// ---------- walk all diagrams ----------
async function collectDiagrams() {
  const diagrams = [];
  for (const locale of ["zh", "en"]) {
    const map = await loadAllMicroLessons(locale);
    for (const [moduleKey, mod] of Object.entries(map)) {
      const lessons = [...(mod.lessons ?? []), ...(mod.groups ?? []).flatMap((g) => g.lessons)];
      for (const lesson of lessons) {
        if (lesson.diagram?.content) {
          diagrams.push({
            locale,
            module: moduleKey,
            lesson: lesson.id,
            title: lesson.diagram.title ?? "(untitled)",
            content: lesson.diagram.content,
          });
        }
      }
    }
    const curriculum = locale === "zh" ? curriculumZh : curriculumEn;
    for (const mod of curriculum) {
      for (const section of mod.theory?.sections ?? []) {
        if (section.diagram?.content) {
          diagrams.push({
            locale,
            module: mod.id,
            lesson: `theory:"${section.title}"`,
            title: section.diagram.caption?.slice(0, 40) ?? "(theory diagram)",
            content: section.diagram.content,
          });
        }
      }
    }
  }
  return diagrams;
}

// Run the check only when executed directly (the fixer imports the
// helpers above without triggering a full run).
const isEntry =
  process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href;
if (isEntry) await main();

async function main() {
const verbose = process.argv.includes("--verbose");
const diagrams = await collectDiagrams();
let flagged = 0;
let tablesChecked = 0;
let skippedArt = 0;

for (const d of diagrams) {
  const lines = d.content.split("\n");
  const problems = [];
  const skips = [];
  for (const seg of tableSegments(lines)) {
    const rows = seg.filter((l) => isBoxyRow(l.text));
    if (rows.length < 2) continue;
    if (seg.some((l) => l.mixed)) {
      skippedArt++;
      skips.push(
        `lines ${seg[0].index + 1}-${seg.at(-1).index + 1}: boxes joined by a vertical flow line, not a bordered table`,
      );
      continue;
    }
    if (isBoxArt(rows)) {
      skippedArt++;
      skips.push(
        `lines ${seg[0].index + 1}-${seg.at(-1).index + 1}: multi-box art (row widths differ by design), not a bordered table`,
      );
      continue;
    }
    tablesChecked++;
    problems.push(...checkSegment(seg));
  }
  if (problems.length) {
    flagged++;
    console.log(`\nFLAGGED  ${findSourceFile(d.content)}`);
    console.log(`  module=${d.module} locale=${d.locale} lesson=${d.lesson}`);
    console.log(`  diagram="${d.title}"`);
    for (const p of problems) console.log(`    ${p}`);
  }
  if (skips.length && verbose) {
    console.log(`\nSKIPPED  ${findSourceFile(d.content)}`);
    console.log(`  module=${d.module} locale=${d.locale} lesson=${d.lesson} diagram="${d.title}"`);
    for (const s of skips) console.log(`    ${s}`);
  }
}

console.log(
  `\n${diagrams.length} diagrams scanned, ${tablesChecked} bordered tables checked, ${skippedArt} multi-box art segments skipped, ${flagged} flagged.`,
);
process.exit(flagged ? 1 : 0);
}
