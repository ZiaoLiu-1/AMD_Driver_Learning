import { Link } from 'wouter';
import { useLocale } from '@/contexts/LocaleContext';
import { useTranslation } from 'react-i18next';
import { getLabs } from '@/data/labs';
import { ArrowLeft, Clock, FlaskConical, CheckCircle2 } from 'lucide-react';
import { useLabProgress } from '@/hooks/useLabProgress';
import type { Locale } from '@/data/curriculum_index';
import { DifficultyBadge, moduleDifficultyTones } from '@/components/ui/difficulty-badge';

export default function LabsListPage() {
  const { locale } = useLocale();
  const { t } = useTranslation();
  const labs = getLabs(locale as Locale);
  const { getLabProgress } = useLabProgress();

  const totalTime = labs.reduce((acc, lab) => acc + lab.estimatedMinutes, 0);

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

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="mb-12 border-b border-border/50 pb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-primary/10 border border-primary/20">
              <FlaskConical className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">{t('labs.pageTitle') || 'Engineering Labs'}</h1>
          </div>
          <p className="text-lg text-muted-foreground mb-6 max-w-2xl leading-relaxed">
            {t('labs.pageSubtitle') || 'Hands-on experiments to master the AMD Linux driver stack.'}
          </p>
          <div className="flex items-center gap-6 text-sm font-medium">
            <div className="flex items-center gap-2">
              <span className="text-3xl tracking-tighter">{labs.length}</span>
              <span className="text-muted-foreground uppercase text-[10px] tracking-wider leading-none" dangerouslySetInnerHTML={{ __html: t('labs.totalLabsHtml') || 'Total<br />Labs' }} />
            </div>
            <div className="w-px h-8 bg-border/50" />
            <div className="flex items-center gap-2">
              <span className="text-3xl tracking-tighter">{Math.round(totalTime / 60)}h</span>
              <span className="text-muted-foreground uppercase text-[10px] tracking-wider leading-none" dangerouslySetInnerHTML={{ __html: t('labs.estTimeHtml') || 'Estimated<br />Time' }} />
            </div>
          </div>
        </div>

        {/* Labs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {labs.map((lab) => {
            const progress = getLabProgress(lab.id);
            const isCompleted = progress.completedSteps.length === lab.steps.length;

            return (
              <Link key={lab.id} href={`/labs/${lab.id}`}>
                <div
                  className={`relative flex flex-col h-full rounded-2xl p-6 border transition-[transform,border-color,background-color] cursor-pointer group hover:-translate-y-1 ${isCompleted
                    ? 'bg-card border-success/30'
                    : 'bg-card/40 border-border/50 hover:border-primary/50 hover:bg-card/80'
                    }`}
                >
                  {isCompleted && (
                    <div className="absolute top-4 right-4">
                      <CheckCircle2 className="w-6 h-6 text-success" />
                    </div>
                  )}

                  <div className="flex items-start justify-between mb-4">
                    <div>
                      {lab.phaseId && (
                        <div className="mb-2 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                          Phase {lab.phaseId.replace('phase-', '')}
                        </div>
                      )}
                      <h2 className="text-lg font-semibold group-hover:text-primary transition-colors pr-8 leading-tight">
                        {lab.title}
                      </h2>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground mb-6 line-clamp-2 leading-relaxed flex-1">
                    {lab.description}
                  </p>

                  <div className="mt-auto pt-4 border-t border-border/50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <DifficultyBadge tone={moduleDifficultyTones[lab.difficulty]} uppercase>
                        {lab.difficulty}
                      </DifficultyBadge>
                      <span className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded">
                        <Clock className="w-3 h-3" />
                        {lab.estimatedMinutes}m
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1.5 justify-end">
                      {lab.tags.slice(0, 2).map((tag) => (
                        <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-muted/60 text-muted-foreground font-mono">
                          {tag}
                        </span>
                      ))}
                      {lab.tags.length > 2 && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted/60 text-muted-foreground font-mono">
                          +{lab.tags.length - 2}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </main>
    </div>
  );
}
