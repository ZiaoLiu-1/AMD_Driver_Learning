#!/usr/bin/env node
/* ============================================================
   Upstream Radar feed generator

   Pulls, with no API keys:
   1. Open issues from the public drm/amd GitLab tracker
   2. Recent patch threads from the amd-gfx archive on
      lore.kernel.org (public-inbox Atom search)
   then cross-references issue titles against patch subjects to
   flag issues that look like someone is already working on them,
   and writes client/public/radar/feed.json for the /radar page.

   Run manually:  node scripts/update-radar-feed.mjs
   (also wired as `pnpm radar:update` and a daily GitHub Action)
   ============================================================ */

import { writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = path.join(ROOT, 'client', 'public', 'radar');
const OUT_FILE = path.join(OUT_DIR, 'feed.json');

const UA = 'AMD-Driver-Learning-Radar/1.0 (educational project; a few requests per source per run)';
// freedesktop GitLab sits behind Anubis anti-bot, which challenges browser
// user agents — so the web page cannot fetch the API directly. This script
// (curl-class UA, exempt) is the only data path: fetch several pages into
// the snapshot so the page can paginate locally.
const ISSUE_PAGES = 3;
const ISSUES_PER_PAGE = 50;
const PATCH_WINDOW_DAYS = 14;
const DESC_LIMIT = 1500;

const gitlabPageUrl = (page) =>
  'https://gitlab.freedesktop.org/api/v4/projects/drm%2Famd/issues' +
  `?state=opened&order_by=updated_at&sort=desc&per_page=${ISSUES_PER_PAGE}&page=${page}`;

function loreSearchUrl() {
  const d = new Date(Date.now() - PATCH_WINDOW_DAYS * 24 * 3600 * 1000);
  const ymd = `${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, '0')}${String(d.getUTCDate()).padStart(2, '0')}`;
  // public-inbox query: subject contains PATCH, received since <ymd>
  return `https://lore.kernel.org/amd-gfx/?q=${encodeURIComponent(`s:PATCH d:${ymd}..`)}&x=A`;
}

async function get(url, accept) {
  const res = await fetch(url, { headers: { 'user-agent': UA, accept } });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} for ${url}`);
  return res;
}

/* ---------- lore Atom parsing (no XML dependency needed) ---------- */

function decodeEntities(s) {
  return s
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&amp;/g, '&');
}

function parseAtom(xml) {
  const entries = [];
  const blocks = xml.split('<entry>').slice(1);
  for (const block of blocks) {
    const title = block.match(/<title[^>]*>([\s\S]*?)<\/title>/)?.[1] ?? '';
    const link = block.match(/<link[^>]*href="([^"]+)"/)?.[1] ?? '';
    const updated = block.match(/<updated>([^<]+)<\/updated>/)?.[1] ?? '';
    const author = block.match(/<name>([\s\S]*?)<\/name>/)?.[1] ?? '';
    if (title && link) {
      entries.push({
        subject: decodeEntities(title.trim()),
        url: link,
        date: updated,
        author: decodeEntities(author.trim()),
      });
    }
  }
  return entries;
}

/* ---------- token heuristics for "is someone working on this?" ---------- */

const STOPWORDS = new Set([
  'patch', 'drm', 'amd', 'amdgpu', 'amdkfd', 'display', 'driver', 'linux',
  'kernel', 'with', 'when', 'after', 'from', 'this', 'that', 'have', 'does',
  'not', 'the', 'and', 'for', 'fix', 'fixes', 'fixed', 'issue', 'issues',
  'bug', 'error', 'problem', 'support', 'using', 'enable', 'disable', 'gpu',
  'card', 'screen', 'since', 'causes', 'while', 'into', 'over', 'under',
]);

// Hardware/IP-ish tokens count extra because they identify the affected area.
const STRONG_TOKEN = /^(navi\d+|gfx\d+|dcn\d*|vcn\d*|sdma\d*|smu\d*|rdna\d?|vega\d*|polaris\d*|raphael|rembrandt|phoenix|strix|suspend|resume|hang|reset|flicker|vrr|freesync|psr|hdmi|edp|displayport|mclk|sclk|powerplay|oled|underrun|corruption|artifacts|stutter|regression|bisected|timeout|7\d{3}|9\d{3}|6\d{3})$/;

function tokenize(s) {
  return [...new Set(
    s.toLowerCase()
      .replace(/\[[^\]]*\]/g, ' ')          // strip [PATCH v2 3/7] etc.
      .replace(/\b(re|v\d+)\b/g, ' ')
      .split(/[^a-z0-9_.]+/)
      .map((t) => t.replace(/^[._]+|[._]+$/g, ''))
      .filter((t) => t.length >= 4 && !STOPWORDS.has(t)),
  )];
}

function matchScore(issueTokens, patchTokens) {
  let score = 0;
  const shared = [];
  for (const t of issueTokens) {
    if (patchTokens.has(t)) {
      shared.push(t);
      score += STRONG_TOKEN.test(t) ? 2 : 1;
    }
  }
  return { score, shared };
}

/* ---------- sources ---------- */

async function fetchGitlabIssues() {
  let totalOpen = null;
  const raw = [];
  for (let page = 1; page <= ISSUE_PAGES; page++) {
    const res = await get(gitlabPageUrl(page), 'application/json');
    if (page === 1) totalOpen = Number(res.headers.get('x-total')) || null;
    const batch = await res.json();
    raw.push(...batch);
    if (!res.headers.get('x-next-page')) break;
    await new Promise((r) => setTimeout(r, 500)); // be polite between pages
  }
  const issues = raw.map((i) => ({
    iid: i.iid,
    title: i.title,
    url: i.web_url,
    createdAt: i.created_at,
    updatedAt: i.updated_at,
    labels: i.labels ?? [],
    assigned: (i.assignees ?? []).length > 0,
    assignees: (i.assignees ?? []).map((a) => a.name || a.username),
    comments: i.user_notes_count ?? 0,
    author: i.author?.name || i.author?.username || '',
    description: (i.description || '').slice(0, DESC_LIMIT),
    descriptionTruncated: (i.description || '').length > DESC_LIMIT,
  }));
  return { issues, totalOpen };
}

async function fetchLorePatches() {
  const res = await get(loreSearchUrl(), 'application/atom+xml');
  const entries = parseAtom(await res.text());
  // Keep thread starters / patch mails, drop plain replies.
  const patches = entries.filter((e) => /^\s*(\[|\bpatch\b)/i.test(e.subject) && !/^re:/i.test(e.subject));
  // Dedup series by normalized subject (strip [PATCH n/m] numbering).
  const seen = new Set();
  const deduped = [];
  for (const p of patches) {
    const key = p.subject.replace(/\[[^\]]*\]/g, '').trim().toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      deduped.push(p);
    }
  }
  return deduped;
}

/* ---------- main ---------- */

async function main() {
  const sources = {
    gitlab: { ok: false, count: 0, totalOpen: null, error: null, url: 'https://gitlab.freedesktop.org/drm/amd/-/issues' },
    lore: { ok: false, count: 0, error: null, url: 'https://lore.kernel.org/amd-gfx/' },
  };
  let issues = [];
  let patches = [];

  try {
    const gl = await fetchGitlabIssues();
    issues = gl.issues;
    sources.gitlab.ok = true;
    sources.gitlab.count = issues.length;
    sources.gitlab.totalOpen = gl.totalOpen;
  } catch (e) {
    sources.gitlab.error = String(e.message || e);
    console.error('[radar] gitlab fetch failed:', sources.gitlab.error);
  }

  try {
    patches = await fetchLorePatches();
    sources.lore.ok = true;
    sources.lore.count = patches.length;
  } catch (e) {
    sources.lore.error = String(e.message || e);
    console.error('[radar] lore fetch failed:', sources.lore.error);
  }

  // Cross-reference: which issues look like someone already sent a patch?
  const patchTokenSets = patches.map((p) => ({ p, tokens: new Set(tokenize(p.subject)) }));
  for (const issue of issues) {
    const issueTokens = tokenize(issue.title);
    const matches = [];
    for (const { p, tokens } of patchTokenSets) {
      const { score, shared } = matchScore(issueTokens, tokens);
      if (score >= 3) matches.push({ subject: p.subject, url: p.url, date: p.date, shared, score });
    }
    matches.sort((a, b) => b.score - a.score);
    issue.patchMatches = matches.slice(0, 3).map(({ score, ...m }) => m);
  }

  const feed = {
    generatedAt: new Date().toISOString(),
    windowDays: PATCH_WINDOW_DAYS,
    sources,
    issues,
    patches: patches.slice(0, 40),
  };

  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(OUT_FILE, JSON.stringify(feed, null, 2) + '\n', 'utf8');

  const flagged = issues.filter((i) => i.patchMatches.length > 0).length;
  console.log(
    `[radar] wrote ${path.relative(ROOT, OUT_FILE)} — ` +
      `${issues.length} issues (${flagged} with possible in-flight patches), ` +
      `${feed.patches.length} patch threads (last ${PATCH_WINDOW_DAYS}d)`,
  );
  if (!sources.gitlab.ok && !sources.lore.ok) process.exitCode = 1;
}

main().catch((e) => {
  console.error('[radar] fatal:', e);
  process.exitCode = 1;
});
