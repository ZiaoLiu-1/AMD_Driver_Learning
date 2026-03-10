import { Link, useParams } from 'wouter';
import { useLocale } from '@/contexts/LocaleContext';
import { useTranslation } from 'react-i18next';
import { getLabById } from '@/data/labs';
import { ArrowLeft, CheckCircle2, Circle, Clock, Play, Trophy, FlaskConical, ChevronRight, ChevronDown, Lightbulb } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useLabProgress } from '@/hooks/useLabProgress';
import { TerminalCodeBlock } from '@/components/labs/TerminalCodeBlock';
import { Checkpoint } from '@/components/labs/Checkpoint';
import type { Locale } from '@/data/curriculum_index';
import { DifficultyBadge, moduleDifficultyTones } from '@/components/ui/difficulty-badge';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

export default function LabDetailPage() {
  const { locale } = useLocale();
  const { t } = useTranslation();
  const params = useParams<{ labId: string }>();
  const lab = getLabById(params.labId ?? '', locale as Locale);

  const { progress, toggleStep } = useLabProgress();
  const labProgress = progress[lab?.id ?? ''] ?? { completedSteps: [] };
  const completedSteps = new Set(labProgress.completedSteps);

  const [currentStep, setCurrentStep] = useState(0);
  const [isStarted, setIsStarted] = useState(completedSteps.size > 0);
  const [showHint, setShowHint] = useState(false);

  // Auto-advance to nearest incomplete step
  useEffect(() => {
    if (lab && isStarted && completedSteps.size > 0 && completedSteps.size < lab.steps.length) {
      const firstIncomplete = lab.steps.findIndex((_, i) => !completedSteps.has(i));
      if (firstIncomplete !== -1) setCurrentStep(firstIncomplete);
    }
  }, [isStarted, lab?.id, completedSteps.size, lab?.steps.length]);

  if (!lab) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg mb-4">{t('labs.labNotFound') || 'Lab not found'}</p>
          <Link href="/labs">
            <span className="text-primary cursor-pointer">{t('labs.backToLabs') || 'Back to Labs'}</span>
          </Link>
        </div>
      </div>
    );
  }

  const step = lab.steps[currentStep];
  const isCompleted = completedSteps.size === lab.steps.length;

  const handleToggleStep = () => {
    toggleStep(lab.id, currentStep, lab.steps.length);
  };

  const handleNext = () => {
    if (currentStep < lab.steps.length - 1) {
      setCurrentStep(curr => curr + 1);
      setShowHint(false);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(curr => curr - 1);
      setShowHint(false);
    }
  };

  // 1. Lab Header View (Not Started)
  if (!isStarted && !isCompleted) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <header className="sticky top-0 z-50 border-b border-border/50 backdrop-blur-md bg-background/80">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-3">
            <Link href="/labs">
              <span className="min-h-[44px] flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                <ArrowLeft className="w-3.5 h-3.5" />
                {t('labs.backToLabs') || 'Back to Labs'}
              </span>
            </Link>
          </div>
        </header>

        <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <div className="mb-8 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-primary/10 text-primary">
            Phase {lab.phaseId.replace('phase-', '')}
          </div>
          <h1 className="text-3xl font-bold mb-4 tracking-tight">{lab.title}</h1>
          <p className="text-lg text-muted-foreground mb-8 leading-relaxed">{lab.description}</p>

          <div className="flex flex-wrap gap-4 mb-10">
            <div className="flex items-center gap-2">
              <DifficultyBadge tone={moduleDifficultyTones[lab.difficulty]} uppercase className="px-3 py-1 text-xs">
                {lab.difficulty}
              </DifficultyBadge>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-3 py-1 rounded">
              <Clock className="w-4 h-4" />
              {t('labs.estMinutes', { minutes: lab.estimatedMinutes }) || `~${lab.estimatedMinutes} min`}
            </div>
          </div>

          <div className="bg-card border border-border/50 p-6 rounded-2xl mb-10 shadow-sm">
            <h2 className="text-base font-semibold mb-4 flex items-center gap-2">
              <FlaskConical className="w-4 h-4 text-primary" />
              {t('labs.prerequisites') || 'Prerequisites'}
            </h2>
            <ul className="space-y-3">
              {lab.prerequisites.map((prereq, idx) => (
                <li key={idx} className="flex items-start gap-3 text-sm text-muted-foreground">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary/50 mt-1.5 shrink-0" />
                  {prereq}
                </li>
              ))}
            </ul>
          </div>

          <Button
            onClick={() => setIsStarted(true)}
            variant="brand"
            className="h-auto w-full rounded-xl px-8 py-4 font-semibold sm:w-auto"
          >
            <Play className="w-5 h-5" aria-hidden="true" />
            {t('labs.startLab') || 'Start Lab'}
          </Button>
        </main>
      </div>
    );
  }

  // 2. Wizard & Summary View
  const progressPct = Math.round((completedSteps.size / lab.steps.length) * 100);

  return (
    <div className="min-h-screen bg-background">
      {/* Wizard Header */}
      <header className="sticky top-0 z-50 border-b border-border/50 backdrop-blur-md bg-background/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-4">
            <Link href="/labs"
              className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded hover:bg-muted text-muted-foreground transition-colors inline-flex"
              aria-label={t('labs.backToLabs') || 'Back to Labs'}>
              <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            </Link>
            <h1 className="hidden sm:block text-sm font-semibold truncate max-w-xs">{lab.title}</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-xs text-muted-foreground hidden sm:block">
              {t('labs.stepsProgress', { completed: completedSteps.size, total: lab.steps.length }) || `${completedSteps.size} of ${lab.steps.length} steps`}
            </div>
            <div className="w-24 sm:w-32 h-1.5 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary transition-[width] duration-500" style={{ width: `${progressPct}%` }} />
            </div>
            <div className="text-xs font-mono font-medium text-primary w-8">{progressPct}%</div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {isCompleted && currentStep === lab.steps.length - 1 ? (
          /* Completion Summary */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto mt-8"
          >
            <div className="flex flex-col items-center text-center mb-12">
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", bounce: 0.6, duration: 0.8 }}
                className="w-20 h-20 bg-success/10 text-success rounded-full flex items-center justify-center mb-6 ring-8 ring-success/5"
              >
                <Trophy className="w-10 h-10" />
              </motion.div>
              <h1 className="text-4xl font-bold mb-4">{t('labs.labCompleted') || 'Lab Complete'}</h1>

              <p className="text-lg text-muted-foreground">{t('labs.labCompletedDesc') || 'All steps finished.'}</p>
            </div>

            <div className="grid gap-6">
              <div className="p-6 rounded-2xl border bg-card shadow-sm">
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">{t('labs.expectedOutput') || 'Expected Output'}</h2>
                <p className="text-foreground leading-relaxed">{lab.expectedOutput}</p>
              </div>

              <div className="p-6 rounded-2xl border border-primary/20 bg-primary/5">
                <h2 className="text-sm font-semibold text-primary mb-4 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4" />
                  {t('labs.keyTakeaways') || 'Key Takeaways'}
                </h2>
                <ul className="space-y-3">
                  {lab.tips.map((tip, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm text-foreground/80">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-12 flex justify-center">
              <Link href="/labs"
                className="px-6 py-3 bg-muted hover:bg-muted/80 text-foreground font-medium rounded-xl transition-colors inline-flex">
                {t('labs.returnToLabs') || 'Return to Labs'}
              </Link>
            </div>
          </motion.div>
        ) : (
          /* Active Step View */
          <div className="grid md:grid-cols-[260px_1fr] gap-10">
            {/* Sidebar Navigation */}
            <aside className="hidden md:flex flex-col gap-1.5 relative">
              <div className="absolute left-3 top-4 bottom-4 w-px bg-border/40 -z-10" />
              {lab.steps.map((s, i) => {
                const isActive = i === currentStep;
                const isDone = completedSteps.has(i);
                return (
                  <button
                    key={i}
                    onClick={() => setCurrentStep(i)}
                    className={`relative text-left text-sm py-2.5 px-3 rounded-lg flex items-center gap-3 transition-[background-color,color,box-shadow] ${isActive ? 'bg-primary/10 text-foreground font-medium shadow-sm'
                      : isDone ? 'text-muted-foreground hover:bg-muted/50'
                        : 'text-muted-foreground hover:bg-muted/30'
                      }`}
                  >
                    <div className={`w-6 h-6 shrink-0 rounded-full flex items-center justify-center border z-10 bg-background transition-colors ${isActive ? 'border-primary text-primary'
                      : isDone ? 'border-success bg-success/10 text-success'
                        : 'border-border/60 text-muted-foreground/50'
                      }`}>
                      {isDone ? <CheckCircle2 className="w-4 h-4" /> : <span className="text-[10px] font-mono">{i + 1}</span>}
                    </div>
                    <span className="truncate leading-none pt-0.5">{s.title}</span>
                  </button>
                );
              })}
            </aside>

            {/* Mobile Nav Dropdown equivalent (condensed for simplicty) */}
            <div className="md:hidden flex items-center text-sm font-medium mb-6 bg-muted/50 p-3 rounded-lg">
              <span className="text-primary min-w-16">{t('labs.stepLabel', { number: currentStep + 1 }) || `Step ${currentStep + 1}`}</span>
              <ChevronRight className="w-4 h-4 mx-2 text-muted-foreground" />
              <span className="truncate">{step.title}</span>
            </div>

            {/* Content Area */}
            <div className="min-w-0 max-w-3xl pb-20">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              >
                <div className="text-xs font-mono font-medium text-primary mb-3 uppercase tracking-wider">
                  {t('labs.step', { current: currentStep + 1, total: lab.steps.length }) || `Step ${currentStep + 1} / ${lab.steps.length}`}
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold mb-6 tracking-tight leading-snug text-foreground">
                  {step.title}
                </h2>
                <div className="text-base text-muted-foreground mb-8 leading-relaxed whitespace-pre-wrap">
                  {step.instruction}
                </div>

                {step.command && (
                  <TerminalCodeBlock command={step.command} title="Terminal" />
                )}

                {step.codeSnippet && (
                  <div className="mb-8 mt-6">
                    <div className="text-xs font-mono text-muted-foreground mb-2 px-1">{t('labs.code') || 'Code'}</div>
                    <pre className="bg-terminal-bg text-terminal-text text-[13px] p-5 rounded-xl overflow-x-auto font-mono border border-terminal-border leading-relaxed shadow-inner">
                      {step.codeSnippet}
                    </pre>
                  </div>
                )}

                {step.checkpoint && (
                  <div className="my-8">
                    <Checkpoint
                      text={step.checkpoint}
                      verified={completedSteps.has(currentStep)}
                      onToggle={handleToggleStep}
                    />
                  </div>
                )}

                {step.hint && (
                  <div className="mb-8 border border-primary/20 rounded-xl overflow-hidden bg-primary/5">
                    <button
                      onClick={() => setShowHint(!showHint)}
                      className="w-full flex items-center justify-between p-4 text-sm font-semibold text-primary hover:bg-primary/10 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Lightbulb className="w-4 h-4" />
                        {showHint ? (t('module.hideHint') || 'Hide Hints') : (t('module.showHint') || 'Show Hints')}
                      </div>
                      <ChevronDown className={`w-4 h-4 transition-transform ${showHint ? 'rotate-180' : ''}`} />
                    </button>
                    <AnimatePresence>
                      {showHint && (
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: 'auto' }}
                          exit={{ height: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="p-4 pt-0 text-sm text-foreground/80 leading-relaxed border-t border-primary/10">
                            {step.hint}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {/* Navigation Footer */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-8 mt-12 border-t border-border/50">
                  <button
                    onClick={handlePrev}
                    disabled={currentStep === 0}
                    className="min-h-[44px] px-4 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-30 disabled:cursor-not-allowed hover:bg-muted text-muted-foreground"
                  >
                    {t('labs.prevStep') || 'Previous'}
                  </button>

                  <div className="flex items-center gap-2 sm:gap-3">
                    {!step.checkpoint && (
                      <button
                        onClick={handleToggleStep}
                        className={`min-h-[44px] text-sm px-4 sm:px-5 py-2.5 rounded-lg border font-medium transition-colors flex-1 sm:flex-none ${completedSteps.has(currentStep)
                          ? 'border-success bg-success/10 text-success'
                          : 'border-border hover:bg-muted text-foreground'
                          }`}
                      >
                        {completedSteps.has(currentStep)
                          ? (t('labs.completed') || 'Completed')
                          : (t('labs.markComplete') || 'Mark Complete')}
                      </button>
                    )}

                    <button
                      onClick={handleNext}
                      disabled={currentStep === lab.steps.length - 1 && isCompleted}
                      className="min-h-[44px] flex items-center justify-center gap-2 text-sm px-4 sm:px-5 py-2.5 rounded-lg bg-foreground text-background font-medium hover:opacity-90 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed flex-1 sm:flex-none"
                    >
                      {currentStep === lab.steps.length - 1
                        ? (t('labs.finishLab') || 'Finish Lab')
                        : (t('labs.nextStep') || 'Next')}
                      {currentStep !== lab.steps.length - 1 && <ChevronRight className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
