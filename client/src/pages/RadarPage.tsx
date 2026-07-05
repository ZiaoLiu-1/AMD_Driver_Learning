/* ============================================================
   Upstream Radar — daily snapshot of drm/amd GitLab issues and
   amd-gfx patch threads, with "is someone already working on
   this?" signals.

   Data path: scripts/update-radar-feed.mjs writes /radar/feed.json
   (150 issues across 3 GitLab pages + lore patch threads), refreshed
   by a daily GitHub Action or `pnpm radar:update`.

   Why no in-browser live fetch: freedesktop GitLab sits behind the
   Anubis anti-bot layer, which challenges browser user agents — a
   cross-origin fetch from the page gets the challenge instead of
   JSON (verified 2026-06). The generator script's UA is exempt, so
   the snapshot is the data path; "load more" paginates locally and
   is therefore instant. If live data is ever needed, route through
   a small proxy (e.g. Cloudflare Worker), not the browser.
   ============================================================ */

import { useEffect, useMemo, useState } from 'react';
import { Link } from 'wouter';
import { useLocale } from '@/contexts/LocaleContext';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  Radar,
  ExternalLink,
  MessageSquare,
  GitPullRequest,
  UserCheck,
  CircleDot,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Mail,
  Search,
  Settings2,
  X,
} from 'lucide-react';

interface RadarMatch {
  subject: string;
  url: string;
  date: string;
  shared: string[];
}

interface RadarIssue {
  iid: number;
  title: string;
  url: string;
  createdAt: string;
  updatedAt: string;
  labels: string[];
  assigned: boolean;
  assignees: string[];
  comments: number;
  author: string;
  description: string;
  descriptionTruncated: boolean;
  patchMatches: RadarMatch[];
}

interface RadarPatch {
  subject: string;
  url: string;
  date: string;
  author: string;
}

interface RadarFeed {
  generatedAt: string;
  windowDays: number;
  sources: {
    gitlab: { ok: boolean; count: number; totalOpen?: number | null; error: string | null; url: string };
    lore: { ok: boolean; count: number; error: string | null; url: string };
  };
  issues: RadarIssue[];
  patches: RadarPatch[];
}

type Filter = 'all' | 'unclaimed' | 'myHw' | 'hasPatch';
type SortKey = 'updated' | 'comments' | 'created';

const PAGE_SIZE = 50;
const STALE_MS = 48 * 3600 * 1000;
const TRACKER_URL = 'https://gitlab.freedesktop.org/drm/amd/-/issues';
const ARCHIVE_URL = 'https://lore.kernel.org/amd-gfx/';

/* ---------- hardware filter presets (multi-select, persisted) ---------- */

const HW_STORAGE_KEY = 'amd-radar-hw-v1';

const HW_PRESETS: { id: string; labelKey: string; keywords: string[] }[] = [
  { id: 'rdna4', labelKey: 'radar.presetRdna4', keywords: ['rdna4', 'rdna 4', 'navi4', 'navi 4', 'gfx12', '9070', '9060'] },
  { id: 'rdna3', labelKey: 'radar.presetRdna3', keywords: ['rdna3', 'rdna 3', 'navi3', 'navi 3', 'gfx11', '7900', '7800', '7700', '7600'] },
  { id: 'rdna2', labelKey: 'radar.presetRdna2', keywords: ['rdna2', 'rdna 2', 'navi2', 'navi 2', 'gfx103', '6950', '6900', '6800', '6750', '6700', '6650', '6600', '6500', '6400'] },
  { id: 'apu', labelKey: 'radar.presetApu', keywords: ['phoenix', 'strix', 'hawk point', 'rembrandt', 'renoir', 'cezanne', 'van gogh', 'steam deck', '890m', '880m', '780m', '760m', '680m', 'apu', '8845', '8840', '7840', '7735'] },
  { id: 'legacy', labelKey: 'radar.presetLegacy', keywords: ['vega', 'polaris', 'rx 580', 'rx 570', 'rx 480', 'gfx9', 'gfx8', 'raven'] },
  { id: 'instinct', labelKey: 'radar.presetInstinct', keywords: ['instinct', 'mi300', 'mi250', 'mi210', 'mi100', 'cdna'] },
];

interface HwConfig {
  presets: string[];
  custom: string[];
}

const DEFAULT_HW: HwConfig = { presets: ['rdna3'], custom: [] };

function loadHwConfig(): HwConfig {
  try {
    const raw = localStorage.getItem(HW_STORAGE_KEY);
    if (!raw) return DEFAULT_HW;
    const parsed = JSON.parse(raw);
    return {
      presets: Array.isArray(parsed.presets) ? parsed.presets : DEFAULT_HW.presets,
      custom: Array.isArray(parsed.custom) ? parsed.custom : [],
    };
  } catch {
    return DEFAULT_HW;
  }
}

function hwKeywords(cfg: HwConfig): string[] {
  const fromPresets = HW_PRESETS.filter((p) => cfg.presets.includes(p.id)).flatMap((p) => p.keywords);
  return Array.from(new Set([...fromPresets, ...cfg.custom.map((k) => k.toLowerCase().trim()).filter(Boolean)]));
}

/* ---------- formatting helpers ---------- */

function formatTime(iso: string, locale: string) {
  try {
    return new Date(iso).toLocaleString(locale === 'zh' ? 'zh-CN' : 'en-US', {
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

function formatDay(iso: string, locale: string) {
  try {
    return new Date(iso).toLocaleDateString(locale === 'zh' ? 'zh-CN' : 'en-US', { month: 'short', day: 'numeric' });
  } catch {
    return iso.slice(0, 10);
  }
}

/* ============================================================ */

export default function RadarPage() {
  const { locale } = useLocale();
  const { t } = useTranslation();

  const [snapshot, setSnapshot] = useState<RadarFeed | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'missing'>('loading');

  // View state
  const [filter, setFilter] = useState<Filter>('all');
  const [sortKey, setSortKey] = useState<SortKey>('updated');
  const [query, setQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});
  const [hwConfig, setHwConfig] = useState<HwConfig>(loadHwConfig);
  const [hwPanelOpen, setHwPanelOpen] = useState(false);
  const [customInput, setCustomInput] = useState('');

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}radar/feed.json`, { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((data: RadarFeed) => {
        setSnapshot(data);
        setStatus('ready');
      })
      .catch(() => setStatus('missing'));
  }, []);

  // Persist hardware config
  useEffect(() => {
    try {
      localStorage.setItem(HW_STORAGE_KEY, JSON.stringify(hwConfig));
    } catch {
      /* private mode etc. — non-fatal */
    }
  }, [hwConfig]);

  const issues = snapshot?.issues ?? [];
  const patches = snapshot?.patches ?? [];
  const activeHwKeywords = useMemo(() => hwKeywords(hwConfig), [hwConfig]);

  const filteredIssues = useMemo(() => {
    let list = issues;

    switch (filter) {
      case 'unclaimed':
        list = list.filter((i) => !i.assigned);
        break;
      case 'hasPatch':
        list = list.filter((i) => i.patchMatches.length > 0);
        break;
      case 'myHw':
        if (activeHwKeywords.length > 0) {
          list = list.filter((i) => {
            const text = `${i.title} ${i.description} ${i.labels.join(' ')}`.toLowerCase();
            return activeHwKeywords.some((k) => text.includes(k));
          });
        }
        break;
    }

    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter((i) => `${i.title} ${i.description} ${i.labels.join(' ')} #${i.iid}`.toLowerCase().includes(q));
    }

    const sorted = [...list];
    switch (sortKey) {
      case 'comments':
        sorted.sort((a, b) => b.comments - a.comments);
        break;
      case 'created':
        sorted.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
        break;
      default:
        sorted.sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt));
    }
    return sorted;
  }, [issues, filter, query, sortKey, activeHwKeywords]);

  const renderedIssues = filteredIssues.slice(0, visibleCount);
  const hasMoreLocal = filteredIssues.length > renderedIssues.length;

  const unclaimedCount = issues.filter((i) => !i.assigned).length;
  const hasPatchCount = issues.filter((i) => i.patchMatches.length > 0).length;
  const totalOpen = snapshot?.sources.gitlab.totalOpen ?? null;
  const isStale = snapshot ? Date.now() - new Date(snapshot.generatedAt).getTime() > STALE_MS : false;

  const filters: { key: Filter; label: string; count?: number }[] = [
    { key: 'all', label: t('radar.filterAll') || 'All' },
    { key: 'unclaimed', label: t('radar.filterUnclaimed') || 'Unclaimed', count: unclaimedCount },
    { key: 'myHw', label: t('radar.filterMyHw') || 'My hardware' },
    { key: 'hasPatch', label: t('radar.filterHasPatch') || 'Possible patch', count: hasPatchCount },
  ];

  const togglePreset = (id: string) =>
    setHwConfig((c) => ({
      ...c,
      presets: c.presets.includes(id) ? c.presets.filter((p) => p !== id) : [...c.presets, id],
    }));

  const addCustomKeywords = () => {
    const parts = customInput.split(/[,，;；]/).map((s) => s.trim().toLowerCase()).filter((s) => s.length >= 2);
    if (parts.length) {
      setHwConfig((c) => ({ ...c, custom: Array.from(new Set([...c.custom, ...parts])) }));
    }
    setCustomInput('');
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border/50 backdrop-blur-md bg-background/80">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center gap-3">
          <Link href="/">
            <span className="min-h-[44px] text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
              {t('nav.home') || 'Home'}
            </span>
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">
        {/* Hero */}
        <div className="mb-10 border-b border-border/50 pb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-primary/10 border border-primary/20">
              <Radar className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">{t('radar.pageTitle') || 'Upstream Radar'}</h1>
          </div>
          <p className="text-lg text-muted-foreground mb-6 max-w-3xl leading-relaxed">
            {t('radar.pageSubtitle') ||
              'A daily snapshot of open drm/amd issues and amd-gfx patch threads, with signals for what is already being worked on.'}
          </p>

          {status === 'ready' && (
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm font-medium">
              <div className="flex items-center gap-2">
                <span className="text-3xl tracking-tighter">
                  {issues.length}
                  {totalOpen != null && (
                    <span className="text-sm text-muted-foreground/60 font-normal"> / {totalOpen}</span>
                  )}
                </span>
                <span
                  className="text-muted-foreground uppercase text-[10px] tracking-wider leading-none"
                  dangerouslySetInnerHTML={{ __html: t('radar.statIssuesHtml') || 'Open<br />Issues' }}
                />
              </div>
              <div className="w-px h-8 bg-border/50" />
              <div className="flex items-center gap-2">
                <span className="text-3xl tracking-tighter">{unclaimedCount}</span>
                <span
                  className="text-muted-foreground uppercase text-[10px] tracking-wider leading-none"
                  dangerouslySetInnerHTML={{ __html: t('radar.statUnclaimedHtml') || 'Un-<br />claimed' }}
                />
              </div>
              <div className="w-px h-8 bg-border/50" />
              <div className="flex items-center gap-2">
                <span className="text-3xl tracking-tighter">{patches.length}</span>
                <span
                  className="text-muted-foreground uppercase text-[10px] tracking-wider leading-none"
                  dangerouslySetInnerHTML={{
                    __html: t('radar.statPatchesHtml', { days: snapshot?.windowDays ?? 14 }) || 'Patch<br />Threads',
                  }}
                />
              </div>
              <div className="w-px h-8 bg-border/50 hidden sm:block" />
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>
                  {snapshot &&
                    (t('radar.updatedAt', { time: formatTime(snapshot.generatedAt, locale) }) ||
                      `Updated ${formatTime(snapshot.generatedAt, locale)}`)}
                </span>
                {isStale && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-warning/10 text-warning border border-warning/30">
                    <AlertTriangle className="w-3 h-3" aria-hidden="true" />
                    {t('radar.stale') || 'Data is over 48h old — run pnpm radar:update'}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {status === 'loading' && (
          <div className="py-24 text-center text-sm text-muted-foreground">{t('radar.loading') || 'Loading radar data…'}</div>
        )}

        {status === 'missing' && (
          <div className="py-16 max-w-xl mx-auto text-center border border-dashed border-border rounded-2xl px-8">
            <Radar className="w-8 h-8 text-muted-foreground/50 mx-auto mb-4" aria-hidden="true" />
            <h2 className="text-lg font-semibold mb-2">{t('radar.emptyTitle') || 'No radar data yet'}</h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              {t('radar.emptyBody') ||
                'Run pnpm radar:update to generate client/public/radar/feed.json. Once the repo is on GitHub, a daily Action refreshes it automatically.'}
            </p>
            <code className="text-xs font-mono bg-muted px-3 py-1.5 rounded">pnpm radar:update</code>
          </div>
        )}

        {status === 'ready' && snapshot && (
          <>
            {(!snapshot.sources.gitlab.ok || !snapshot.sources.lore.ok) && (
              <div className="mb-6 flex items-start gap-2 text-xs text-warning bg-warning/10 border border-warning/30 rounded-lg px-4 py-3">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
                <span>
                  {t('radar.sourceError') || 'A data source failed during the last refresh:'}{' '}
                  {!snapshot.sources.gitlab.ok && <code className="font-mono">gitlab: {snapshot.sources.gitlab.error}</code>}{' '}
                  {!snapshot.sources.lore.ok && <code className="font-mono">lore: {snapshot.sources.lore.error}</code>}
                </span>
              </div>
            )}

            {/* Issues section */}
            <section aria-labelledby="radar-issues-heading" className="mb-14">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <h2 id="radar-issues-heading" className="text-xl font-semibold flex items-center gap-2">
                  <CircleDot className="w-4 h-4 text-primary" aria-hidden="true" />
                  {t('radar.issuesTitle') || 'Open issues (drm/amd)'}
                </h2>
                <a
                  href={TRACKER_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
                >
                  {t('radar.openTracker') || 'Open tracker'}
                  <ExternalLink className="w-3 h-3" aria-hidden="true" />
                </a>
              </div>

              {/* Lab-8 handoff: turn a spotted issue into a public contribution */}
              <Link
                href="/labs/lab-8-issue-triage"
                className="block mb-4 px-3 py-2 rounded-lg border border-primary/25 bg-primary/5 text-xs text-primary hover:bg-primary/10 transition-colors"
              >
                {t('radar.triageLabCta') || 'Found a reproducible issue? → Lab 8: claim & triage it into a public contribution'}
              </Link>

              {/* Toolbar: search + sort */}
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <div className="relative flex-1 min-w-[220px]">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60" aria-hidden="true" />
                  <input
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={t('radar.searchPlaceholder') || 'Search title / description / labels…'}
                    className="w-full pl-9 pr-3 py-2 rounded-full bg-card/40 border border-border/50 text-xs text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 transition-colors"
                    aria-label={t('radar.searchPlaceholder') || 'Search'}
                  />
                </div>
                <select
                  value={sortKey}
                  onChange={(e) => setSortKey(e.target.value as SortKey)}
                  className="px-3 py-2 rounded-full bg-card/40 border border-border/50 text-xs text-foreground/80 focus:outline-none focus:border-primary/50 transition-colors cursor-pointer"
                  aria-label={t('radar.sortLabel') || 'Sort'}
                >
                  <option value="updated">{t('radar.sortUpdated') || 'Recently updated'}</option>
                  <option value="comments">{t('radar.sortComments') || 'Most discussed'}</option>
                  <option value="created">{t('radar.sortCreated') || 'Newest created'}</option>
                </select>
              </div>

              {/* Status filters */}
              <div className="flex flex-wrap items-center gap-2 mb-3" role="group" aria-label={t('radar.filtersLabel') || 'Filters'}>
                {filters.map((f) => (
                  <button
                    key={f.key}
                    onClick={() => {
                      setFilter(f.key);
                      if (f.key === 'myHw') setHwPanelOpen(true);
                    }}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                      filter === f.key
                        ? 'bg-primary text-white border-primary'
                        : 'bg-card/40 text-muted-foreground border-border/50 hover:border-primary/50 hover:text-foreground'
                    }`}
                    aria-pressed={filter === f.key}
                  >
                    {f.label}
                    {typeof f.count === 'number' && ` · ${f.count}`}
                  </button>
                ))}
                {filter === 'myHw' && (
                  <button
                    onClick={() => setHwPanelOpen((o) => !o)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border border-border/50 bg-card/40 text-muted-foreground hover:border-primary/50 hover:text-foreground transition-colors"
                    aria-expanded={hwPanelOpen}
                  >
                    <Settings2 className="w-3.5 h-3.5" aria-hidden="true" />
                    {t('radar.hwConfigure') || 'Configure keywords'}
                  </button>
                )}
                <span className="ml-auto text-[11px] text-muted-foreground/70 font-mono">
                  {t('radar.resultCount', { shown: filteredIssues.length, total: issues.length }) ||
                    `${filteredIssues.length} / ${issues.length}`}
                </span>
              </div>

              {/* Hardware keyword configuration */}
              {filter === 'myHw' && hwPanelOpen && (
                <div className="mb-5 rounded-xl border border-border/50 bg-card/40 p-4 space-y-3">
                  <div>
                    <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                      {t('radar.hwPresets') || 'Quick picks (multi-select)'}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {HW_PRESETS.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => togglePreset(p.id)}
                          className={`px-2.5 py-1 rounded-md text-[11px] font-mono border transition-colors ${
                            hwConfig.presets.includes(p.id)
                              ? 'bg-primary/10 text-primary border-primary/40'
                              : 'bg-transparent text-muted-foreground border-border/50 hover:border-primary/40 hover:text-foreground'
                          }`}
                          aria-pressed={hwConfig.presets.includes(p.id)}
                        >
                          {t(p.labelKey)}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                      {t('radar.hwCustom') || 'Custom keywords'}
                    </p>
                    <div className="flex flex-wrap items-center gap-2">
                      <input
                        type="text"
                        value={customInput}
                        onChange={(e) => setCustomInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addCustomKeywords();
                          }
                        }}
                        placeholder={t('radar.hwCustomPlaceholder') || 'Type and press Enter, e.g. w7900, 8845hs'}
                        className="flex-1 min-w-[200px] px-3 py-1.5 rounded-md bg-background border border-border/50 text-xs focus:outline-none focus:border-primary/50 transition-colors"
                      />
                      {hwConfig.custom.map((k) => (
                        <span key={k} className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-muted/60 text-[11px] font-mono text-foreground/80">
                          {k}
                          <button
                            onClick={() => setHwConfig((c) => ({ ...c, custom: c.custom.filter((x) => x !== k) }))}
                            className="text-muted-foreground hover:text-destructive transition-colors"
                            aria-label={`remove ${k}`}
                          >
                            <X className="w-3 h-3" aria-hidden="true" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  <p className="text-[11px] text-muted-foreground/70 font-mono leading-relaxed">
                    {activeHwKeywords.length > 0
                      ? `${t('radar.hwActive') || 'Active keywords:'} ${activeHwKeywords.join(' / ')}`
                      : t('radar.hwNone') || 'No keywords selected — this filter shows everything'}
                  </p>
                </div>
              )}

              {renderedIssues.length === 0 && (
                <p className="text-sm text-muted-foreground py-8 text-center">{t('radar.noMatches') || 'Nothing matches this filter today.'}</p>
              )}

              <ul className="space-y-3">
                {renderedIssues.map((issue) => {
                  const isOpen = !!expanded[issue.iid];
                  return (
                    <li key={issue.iid} className="rounded-xl border border-border/50 bg-card/40 hover:border-border transition-colors">
                      <div className="p-4">
                        <div className="flex items-start gap-3">
                          <span className="font-mono text-[11px] text-muted-foreground/60 pt-1 shrink-0">#{issue.iid}</span>
                          <div className="min-w-0 flex-1">
                            <a
                              href={issue.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm font-semibold leading-snug hover:text-primary transition-colors inline-flex items-start gap-1.5"
                            >
                              <span>{issue.title}</span>
                              <ExternalLink className="w-3 h-3 mt-1 shrink-0 opacity-50" aria-hidden="true" />
                            </a>

                            <div className="mt-2 flex flex-wrap items-center gap-1.5">
                              {issue.assigned ? (
                                <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-warning/10 text-warning border border-warning/30">
                                  <UserCheck className="w-3 h-3" aria-hidden="true" />
                                  {t('radar.assigned') || 'Assigned'}
                                  {issue.assignees.length > 0 && `: ${issue.assignees.join(', ')}`}
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-success/10 text-success border border-success/30">
                                  {t('radar.unclaimed') || 'Unclaimed'}
                                </span>
                              )}
                              {issue.patchMatches.length > 0 && (
                                <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/30">
                                  <GitPullRequest className="w-3 h-3" aria-hidden="true" />
                                  {t('radar.possiblePatch') || 'Possible in-flight patch'} ×{issue.patchMatches.length}
                                </span>
                              )}
                              {issue.comments > 0 && (
                                <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-muted/60 text-muted-foreground">
                                  <MessageSquare className="w-3 h-3" aria-hidden="true" />
                                  {issue.comments}
                                </span>
                              )}
                              {issue.labels.slice(0, 3).map((l) => (
                                <span key={l} className="text-[10px] px-1.5 py-0.5 rounded bg-muted/60 text-muted-foreground font-mono">
                                  {l}
                                </span>
                              ))}
                              <span className="text-[10px] text-muted-foreground/60 ml-auto font-mono">
                                {formatDay(issue.updatedAt, locale)}
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() => setExpanded((e) => ({ ...e, [issue.iid]: !isOpen }))}
                            className="shrink-0 p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                            aria-expanded={isOpen}
                            aria-label={isOpen ? t('radar.collapse') || 'Collapse' : t('radar.expand') || 'Expand'}
                          >
                            {isOpen ? <ChevronUp className="w-4 h-4" aria-hidden="true" /> : <ChevronDown className="w-4 h-4" aria-hidden="true" />}
                          </button>
                        </div>

                        {isOpen && (
                          <div className="mt-4 pl-9 space-y-4">
                            {issue.patchMatches.length > 0 && (
                              <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
                                <p className="text-[11px] font-semibold text-primary mb-2 flex items-center gap-1.5">
                                  <GitPullRequest className="w-3.5 h-3.5" aria-hidden="true" />
                                  {t('radar.matchHeading') || 'Possibly related patch threads on amd-gfx'}
                                </p>
                                <ul className="space-y-1.5">
                                  {issue.patchMatches.map((m) => (
                                    <li key={m.url}>
                                      <a
                                        href={m.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs font-mono text-foreground/80 hover:text-primary transition-colors inline-flex items-start gap-1.5"
                                      >
                                        <span className="break-all">{m.subject}</span>
                                        <ExternalLink className="w-3 h-3 mt-0.5 shrink-0 opacity-50" aria-hidden="true" />
                                      </a>
                                      <span className="block text-[10px] text-muted-foreground/60 font-mono">
                                        {formatDay(m.date, locale)} · {t('radar.sharedTokens') || 'shared'}: {m.shared.join(', ')}
                                      </span>
                                    </li>
                                  ))}
                                </ul>
                                <p className="mt-2 text-[10px] text-muted-foreground/70">{t('radar.matchNote') || 'Heuristic title match — always dedup manually on lore before sending a patch.'}</p>
                              </div>
                            )}
                            {issue.description ? (
                              <pre className="whitespace-pre-wrap text-xs leading-relaxed text-muted-foreground font-mono bg-muted/30 rounded-lg p-3 max-h-80 overflow-y-auto">
                                {issue.description}
                                {issue.descriptionTruncated && '\n…'}
                              </pre>
                            ) : (
                              <p className="text-xs text-muted-foreground/60 italic">{t('radar.noDescription') || 'No description.'}</p>
                            )}
                            <a
                              href={issue.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
                            >
                              {t('radar.openIssue') || 'Open on GitLab'}
                              <ExternalLink className="w-3 h-3" aria-hidden="true" />
                            </a>
                          </div>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>

              {/* Local pagination */}
              <div className="mt-5 text-center">
                {hasMoreLocal ? (
                  <button
                    onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-border/50 bg-card/40 text-xs font-medium text-foreground/80 hover:border-primary/50 hover:text-foreground transition-colors"
                  >
                    <ChevronDown className="w-3.5 h-3.5" aria-hidden="true" />
                    {t('radar.loadMore') || 'Load more'}
                    <span className="text-muted-foreground/60 font-mono">
                      {renderedIssues.length} / {filteredIssues.length}
                    </span>
                  </button>
                ) : (
                  renderedIssues.length > 0 && (
                    <p className="text-xs text-muted-foreground/60">
                      {t('radar.snapshotEnd', { total: filteredIssues.length }) || `All ${filteredIssues.length} snapshot issues shown`}{' '}
                      <a
                        href={TRACKER_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline inline-flex items-center gap-0.5"
                      >
                        {t('radar.openTracker') || 'Open tracker'}
                        <ExternalLink className="w-3 h-3" aria-hidden="true" />
                      </a>
                    </p>
                  )
                )}
              </div>
            </section>

            {/* Patch threads section */}
            <section aria-labelledby="radar-patches-heading">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <h2 id="radar-patches-heading" className="text-xl font-semibold flex items-center gap-2">
                  <Mail className="w-4 h-4 text-primary" aria-hidden="true" />
                  {t('radar.patchesTitle') || 'Recent patch threads on amd-gfx'}
                </h2>
                <a
                  href={ARCHIVE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
                >
                  {t('radar.openArchive') || 'Open archive'}
                  <ExternalLink className="w-3 h-3" aria-hidden="true" />
                </a>
              </div>
              <p className="text-xs text-muted-foreground mb-4">
                {t('radar.patchesHint') || 'Skim what maintainers are merging right now — the fastest way to calibrate what kinds of patches are welcome.'}
              </p>
              {patches.length > 0 ? (
                <ul className="divide-y divide-border/40 rounded-xl border border-border/50 bg-card/40 overflow-hidden">
                  {patches.map((p) => (
                    <li key={p.url}>
                      <a
                        href={p.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-baseline gap-3 px-4 py-2.5 hover:bg-muted/40 transition-colors group"
                      >
                        <span className="font-mono text-[10px] text-muted-foreground/60 shrink-0 w-14">{formatDay(p.date, locale)}</span>
                        <span className="text-xs font-mono text-foreground/85 group-hover:text-primary transition-colors truncate">
                          {p.subject}
                        </span>
                        <span className="ml-auto text-[10px] text-muted-foreground/60 shrink-0 hidden sm:block">{p.author}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-muted-foreground/70 border border-dashed border-border rounded-xl px-4 py-6 text-center">
                  {t('radar.patchesMissing') || 'Patch-thread data comes from the daily snapshot — run pnpm radar:update to generate it.'}
                </p>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}
