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
import { difficultyColors } from '@/data/curriculum';
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
  }, [isStarted, lab?.id, labProgress.completedSteps, lab?.steps.length]);

  if (!lab) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg mb-4">Lab not found</p>
          <Link href="/labs">
            <span className="text-orange-500 cursor-pointer">{t('labs.backToLabs') || 'Back to Labs'}</span>
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
          <div className="max-w-4xl mx-auto px-6 h-14 flex items-center gap-3">
            <Link href="/labs">
              <span className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer flex items-center gap-1">
                <ArrowLeft className="w-3.5 h-3.5" />
                {t('labs.backToLabs') || 'Back to Labs'}
              </span>
            </Link>
          </div>
        </header>

        <main className="max-w-3xl mx-auto px-6 py-12">
          <div className="mb-8 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-orange-500/10 text-orange-600">
            Phase {lab.phaseId.replace('phase-', '')}
          </div>
          <h1 className="text-3xl font-bold mb-4 tracking-tight">{lab.title}</h1>
          <p className="text-lg text-muted-foreground mb-8 leading-relaxed">{lab.description}</p>

          <div className="flex flex-wrap gap-4 mb-10">
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded border text-xs font-bold uppercase tracking-wider ${difficultyColors[lab.difficulty as keyof typeof difficultyColors]}`}>
                {lab.difficulty}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-3 py-1 rounded">
              <Clock className="w-4 h-4" />
              {lab.estimatedMinutes}m expected
            </div>
          </div>

          <div className="bg-card border border-border/50 p-6 rounded-2xl mb-10 shadow-sm">
            <h3 className="text-base font-semibold mb-4 flex items-center gap-2">
              <FlaskConical className="w-4 h-4 text-orange-500" />
              Prerequisites
            </h3>
            <ul className="space-y-3">
              {lab.prerequisites.map((prereq, idx) => (
                <li key={idx} className="flex items-start gap-3 text-sm text-muted-foreground">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500/50 mt-1.5 shrink-0" />
                  {prereq}
                </li>
              ))}
            </ul>
          </div>

          <button
            onClick={() => setIsStarted(true)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-semibold transition-all hover:-translate-y-0.5 shadow-lg shadow-orange-500/20"
          >
            <Play className="w-5 h-5" />
            Start Lab
          </button>
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
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/labs">
              <button className="p-1.5 rounded hover:bg-muted text-muted-foreground transition-colors mr-2">
                <ArrowLeft className="w-4 h-4" />
              </button>
            </Link>
            <div className="hidden sm:block text-sm font-semibold truncate max-w-xs">{lab.title}</div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-xs text-muted-foreground hidden sm:block">
              {completedSteps.size} of {lab.steps.length} steps
            </div>
            <div className="w-24 sm:w-32 h-1.5 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-orange-500 transition-all duration-500" style={{ width: `${progressPct}%` }} />
            </div>
            <div className="text-xs font-mono font-medium text-orange-500 w-8">{progressPct}%</div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {isCompleted && currentStep === lab.steps.length - 1 ? (
          /* Completion Summary */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto mt-8"
          >
            <div className="flex flex-col items-center text-center mb-12">
              <div className="w-20 h-20 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mb-6 ring-8 ring-green-500/5">
                <Trophy className="w-10 h-10" />
              </div>
              <h1 className="text-4xl font-bold mb-4">Lab Completed!</h1>
              <p className="text-lg text-muted-foreground">You have successfully finished all steps.</p>
            </div>

            <div className="grid gap-6">
              <div className="p-6 rounded-2xl border bg-card shadow-sm">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Expected Output</h3>
                <p className="text-foreground leading-relaxed">{lab.expectedOutput}</p>
              </div>

              <div className="p-6 rounded-2xl border border-orange-500/20 bg-orange-500/5">
                <h3 className="text-sm font-semibold text-orange-600 mb-4 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4" />
                  Key Takeaways & Tips
                </h3>
                <ul className="space-y-3">
                  {lab.tips.map((tip, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm text-foreground/80">
                      <span className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-1.5 shrink-0" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-12 flex justify-center">
              <Link href="/labs">
                <button className="px-6 py-3 bg-muted hover:bg-muted/80 text-foreground font-medium rounded-xl transition-colors">
                  Return to Labs
                </button>
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
                    className={`relative text-left text-sm py-2.5 px-3 rounded-lg flex items-center gap-3 transition-all ${isActive ? 'bg-orange-500/10 text-foreground font-medium shadow-sm'
                        : isDone ? 'text-muted-foreground hover:bg-muted/50'
                          : 'text-muted-foreground hover:bg-muted/30'
                      }`}
                  >
                    <div className={`w-6 h-6 shrink-0 rounded-full flex items-center justify-center border z-10 bg-background transition-colors ${isActive ? 'border-orange-500 text-orange-500'
                        : isDone ? 'border-green-500 bg-green-500/10 text-green-500'
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
              <span className="text-orange-500 min-w-16">Step {currentStep + 1}</span>
              <ChevronRight className="w-4 h-4 mx-2 text-muted-foreground" />
              <span className="truncate">{step.title}</span>
            </div>

            {/* Content Area */}
            <div className="min-w-0 max-w-3xl pb-20">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-xs font-mono font-medium text-orange-500 mb-3 uppercase tracking-wider">
                  Step {currentStep + 1} of {lab.steps.length}
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
                    <div className="text-xs font-mono text-muted-foreground mb-2 px-1">Source Code.c</div>
                    <pre className="bg-zinc-950 text-zinc-300 text-[13px] p-5 rounded-xl overflow-x-auto font-mono border border-zinc-800 leading-relaxed shadow-inner">
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
                  <div className="mb-8 border border-orange-500/20 rounded-xl overflow-hidden bg-orange-500/5">
                    <button
                      onClick={() => setShowHint(!showHint)}
                      className="w-full flex items-center justify-between p-4 text-sm font-semibold text-orange-600 hover:bg-orange-500/10 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Lightbulb className="w-4 h-4" />
                        Need a Hint?
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
                          <div className="p-4 pt-0 text-sm text-foreground/80 leading-relaxed border-t border-orange-500/10">
                            {step.hint}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {/* Navigation Footer */}
                <div className="flex items-center justify-between pt-8 mt-12 border-t border-border/50">
                  <button
                    onClick={handlePrev}
                    disabled={currentStep === 0}
                    className="px-4 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-30 disabled:cursor-not-allowed hover:bg-muted text-muted-foreground"
                  >
                    Previous
                  </button>

                  <div className="flex items-center gap-3">
                    {!step.checkpoint && (
                      <button
                        onClick={handleToggleStep}
                        className={`text-sm px-5 py-2.5 rounded-lg border font-medium transition-colors ${completedSteps.has(currentStep)
                            ? 'border-green-500 bg-green-500/10 text-green-600'
                            : 'border-border hover:bg-muted text-foreground'
                          }`}
                      >
                        {completedSteps.has(currentStep) ? '✓ Completed' : 'Mark as Complete'}
                      </button>
                    )}

                    <button
                      onClick={handleNext}
                      disabled={currentStep === lab.steps.length - 1 && isCompleted}
                      className="flex items-center gap-2 text-sm px-5 py-2.5 rounded-lg bg-foreground text-background font-medium hover:opacity-90 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      {currentStep === lab.steps.length - 1 ? 'Finish Lab' : 'Next Step'}
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
