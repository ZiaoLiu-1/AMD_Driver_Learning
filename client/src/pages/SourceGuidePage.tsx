/* ============================================================
   Source Guide Page — Placeholder for Anti Gravity to implement
   See UI_SPEC.md for detailed component requirements
   ============================================================ */

import { Link } from 'wouter';
import { useLocale } from '@/contexts/LocaleContext';
import { useTranslation } from 'react-i18next';
import { getSourceStages } from '@/data/source_roadmap';
import { ArrowLeft, FileCode, ExternalLink, ChevronDown } from 'lucide-react';
import { useState } from 'react';

export default function SourceGuidePage() {
  const { locale } = useLocale();
  const { t } = useTranslation();
  const stages = getSourceStages(locale);
  const [expandedStage, setExpandedStage] = useState<string | null>(stages[0]?.id ?? null);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border/50 backdrop-blur-md bg-background/80">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center gap-3">
          <Link href="/">
            <span className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" />
              {t('nav.home')}
            </span>
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <FileCode className="w-7 h-7 text-orange-500" />
            <h1 className="text-3xl font-bold">{t('sourceGuide.pageTitle')}</h1>
          </div>
          <p className="text-muted-foreground">{t('sourceGuide.pageSubtitle')}</p>
        </div>

        <div className="space-y-4">
          {stages.map((stage) => (
            <div key={stage.id} className="border border-border rounded-lg overflow-hidden">
              <button
                onClick={() => setExpandedStage(expandedStage === stage.id ? null : stage.id)}
                className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-muted/50 transition-colors cursor-pointer"
              >
                <div>
                  <div className="text-xs text-orange-500 font-medium mb-1">
                    {t('sourceGuide.stage', { number: stage.number })}
                  </div>
                  <h2 className="font-semibold">{stage.title}</h2>
                  <p className="text-sm text-muted-foreground mt-1">{stage.description}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0 ml-4">
                  <span className="text-xs text-muted-foreground">
                    {t('sourceGuide.files', { count: stage.files.length })}
                  </span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${expandedStage === stage.id ? 'rotate-180' : ''}`} />
                </div>
              </button>

              {expandedStage === stage.id && (
                <div className="px-6 pb-6 space-y-4 border-t border-border/50">
                  {stage.files.map((file) => (
                    <div key={file.path} className="mt-4 p-4 bg-muted/30 rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <code className="text-sm font-mono text-orange-500">{file.path}</code>
                        <a
                          href={file.externalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 shrink-0 ml-3"
                        >
                          <ExternalLink className="w-3 h-3" />
                          {file.externalUrl.includes('bootlin') ? t('sourceGuide.viewOnBootlin') : t('sourceGuide.viewOnGitHub')}
                        </a>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{file.description}</p>

                      <div className="mb-3">
                        <div className="text-xs font-medium mb-1.5">{t('sourceGuide.keyFunctions')}</div>
                        <div className="flex flex-wrap gap-1.5">
                          {file.keyFunctions.map((fn) => (
                            <code key={fn} className="text-xs px-1.5 py-0.5 rounded bg-muted font-mono">
                              {fn}()
                            </code>
                          ))}
                        </div>
                      </div>

                      <div className="mb-3">
                        <div className="text-xs font-medium mb-1.5">{t('sourceGuide.readingNotes')}</div>
                        <p className="text-sm text-muted-foreground">{file.readingNotes}</p>
                      </div>

                      <div>
                        <div className="text-xs font-medium mb-1.5">{t('sourceGuide.relatedConcepts')}</div>
                        <div className="flex flex-wrap gap-1.5">
                          {file.relatedConcepts.map((c) => (
                            <span key={c} className="text-[10px] px-1.5 py-0.5 rounded bg-orange-500/10 text-orange-600">
                              {c}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
