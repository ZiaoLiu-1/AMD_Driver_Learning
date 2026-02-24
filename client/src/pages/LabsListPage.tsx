/* ============================================================
   Labs List Page — Placeholder for Anti Gravity to implement
   See UI_SPEC.md for detailed component requirements
   ============================================================ */

import { Link } from 'wouter';
import { useLocale } from '@/contexts/LocaleContext';
import { useTranslation } from 'react-i18next';
import { getLabs } from '@/data/labs';
import { ArrowLeft, Clock, FlaskConical } from 'lucide-react';

export default function LabsListPage() {
  const { locale, basePath } = useLocale();
  const { t } = useTranslation();
  const labs = getLabs(locale);

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
            <FlaskConical className="w-7 h-7 text-orange-500" />
            <h1 className="text-3xl font-bold">{t('labs.pageTitle')}</h1>
          </div>
          <p className="text-muted-foreground">{t('labs.pageSubtitle')}</p>
        </div>

        <div className="grid gap-6">
          {labs.map((lab) => (
            <Link key={lab.id} href={`/labs/${lab.id}`}>
              <div className="border border-border rounded-lg p-6 hover:border-orange-500/50 transition-colors cursor-pointer group">
                <div className="flex items-start justify-between mb-3">
                  <h2 className="text-lg font-semibold group-hover:text-orange-500 transition-colors">
                    {lab.title}
                  </h2>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground shrink-0 ml-4">
                    <span className="px-2 py-0.5 rounded bg-muted">{lab.difficulty}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {lab.estimatedMinutes}m
                    </span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{lab.description}</p>
                <div className="flex flex-wrap gap-1.5">
                  {lab.tags.map((tag) => (
                    <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
