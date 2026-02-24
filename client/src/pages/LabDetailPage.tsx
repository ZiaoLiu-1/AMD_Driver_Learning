/* ============================================================
   Lab Detail Page — Placeholder for Anti Gravity to implement
   See UI_SPEC.md for step wizard, terminal blocks, checkpoint UI
   ============================================================ */

import { Link, useParams } from 'wouter';
import { useLocale } from '@/contexts/LocaleContext';
import { useTranslation } from 'react-i18next';
import { getLabById } from '@/data/labs';
import { ArrowLeft, CheckCircle2, Circle, Terminal } from 'lucide-react';
import { useState } from 'react';

export default function LabDetailPage() {
  const { locale } = useLocale();
  const { t } = useTranslation();
  const params = useParams<{ labId: string }>();
  const lab = getLabById(params.labId ?? '', locale);
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  if (!lab) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg mb-4">Lab not found</p>
          <Link href="/labs">
            <span className="text-orange-500 cursor-pointer">{t('labs.backToLabs')}</span>
          </Link>
        </div>
      </div>
    );
  }

  const step = lab.steps[currentStep];
  const toggleStep = (idx: number) => {
    setCompletedSteps((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border/50 backdrop-blur-md bg-background/80">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center gap-3">
          <Link href="/labs">
            <span className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" />
              {t('labs.backToLabs')}
            </span>
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold mb-2">{lab.title}</h1>
        <p className="text-muted-foreground mb-8">{lab.description}</p>

        {/* Step sidebar */}
        <div className="grid md:grid-cols-[240px_1fr] gap-8">
          <nav className="flex flex-col gap-1">
            {lab.steps.map((s, i) => (
              <button
                key={i}
                onClick={() => setCurrentStep(i)}
                className={`text-left text-sm px-3 py-2 rounded flex items-center gap-2 transition-colors ${
                  i === currentStep ? 'bg-orange-500/10 text-orange-500 font-medium' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {completedSteps.has(i) ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" />
                ) : (
                  <Circle className="w-3.5 h-3.5 shrink-0" />
                )}
                <span className="truncate">{s.title}</span>
              </button>
            ))}
          </nav>

          {/* Step content */}
          <div className="min-w-0">
            <div className="text-xs text-muted-foreground mb-4">
              {t('labs.step', { current: currentStep + 1, total: lab.steps.length })}
            </div>
            <h2 className="text-lg font-semibold mb-4">{step.title}</h2>
            <p className="text-sm text-muted-foreground mb-6">{step.instruction}</p>

            {step.command && (
              <div className="mb-6">
                <div className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
                  <Terminal className="w-3 h-3" />
                  {t('labs.command')}
                </div>
                <pre className="bg-zinc-950 text-zinc-100 text-sm p-4 rounded-lg overflow-x-auto font-mono">
                  {step.command}
                </pre>
              </div>
            )}

            {step.codeSnippet && (
              <div className="mb-6">
                <div className="text-xs font-medium text-muted-foreground mb-2">{t('labs.code')}</div>
                <pre className="bg-zinc-950 text-zinc-100 text-sm p-4 rounded-lg overflow-x-auto font-mono">
                  {step.codeSnippet}
                </pre>
              </div>
            )}

            {step.checkpoint && (
              <div className="bg-green-500/5 border border-green-500/20 rounded-lg p-4 mb-6">
                <div className="text-xs font-medium text-green-600 mb-1">{t('labs.checkpoint')}</div>
                <p className="text-sm">{step.checkpoint}</p>
              </div>
            )}

            {step.hint && (
              <div className="bg-orange-500/5 border border-orange-500/20 rounded-lg p-4 mb-6">
                <div className="text-xs font-medium text-orange-600 mb-1">{t('labs.hint')}</div>
                <p className="text-sm">{step.hint}</p>
              </div>
            )}

            <div className="flex items-center gap-3 mt-8">
              <button
                onClick={() => toggleStep(currentStep)}
                className="text-sm px-4 py-2 rounded border border-border hover:bg-muted transition-colors cursor-pointer"
              >
                {completedSteps.has(currentStep) ? '✓ Completed' : 'Mark complete'}
              </button>
              {currentStep < lab.steps.length - 1 && (
                <button
                  onClick={() => setCurrentStep((p) => p + 1)}
                  className="text-sm px-4 py-2 rounded bg-orange-500 text-white hover:bg-orange-600 transition-colors cursor-pointer"
                >
                  {t('labs.nextStep')}
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
