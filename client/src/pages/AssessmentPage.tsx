import { Link } from 'wouter';
import { useLocale } from '@/contexts/LocaleContext';
import { useTranslation } from 'react-i18next';
import { getMasteryQuestions, getAllChecklists } from '@/data/mastery_checks';
import { ArrowLeft, ClipboardCheck, Play } from 'lucide-react';
import { useState } from 'react';
import { QuestionCard } from '@/components/assessment/QuestionCard';
import { AssessmentResult } from '@/components/assessment/AssessmentResult';
import type { Locale } from '@/data/curriculum_index';
import { motion, AnimatePresence } from 'framer-motion';

export default function AssessmentPage() {
  const { locale } = useLocale();
  const { t } = useTranslation();

  const questions = getMasteryQuestions(locale as Locale);
  const checklists = getAllChecklists(locale as Locale);

  const [state, setState] = useState<'intro' | 'active' | 'result'>('intro');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [scores, setScores] = useState<Record<string, 'pass' | 'fail'>>({});

  const startAssessment = () => {
    setState('active');
    setCurrentIdx(0);
    setIsRevealed(false);
    setScores({});
  };

  const handleScore = (score: 'pass' | 'fail') => {
    const qid = questions[currentIdx].id;
    setScores(prev => ({ ...prev, [qid]: score }));

    if (currentIdx < questions.length - 1) {
      setCurrentIdx(curr => curr + 1);
      setIsRevealed(false);
    } else {
      setState('result');
    }
  };

  // Intro Component
  if (state === 'intro') {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-50 border-b border-border/50 backdrop-blur-md bg-background/80">
          <div className="max-w-5xl mx-auto px-6 h-14 flex items-center gap-3">
            <Link href="/">
              <span className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer flex items-center gap-1">
                <ArrowLeft className="w-3.5 h-3.5" />
                {t('nav.home') || 'Home'}
              </span>
            </Link>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-6 py-12 pb-24">
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-orange-500/10 border border-orange-500/20">
                <ClipboardCheck className="w-6 h-6 text-orange-500" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight">{t('assessment.pageTitle') || 'Mastery Assessment'}</h1>
            </div>
            <p className="text-lg text-muted-foreground mb-8">
              {t('assessment.pageSubtitle') || 'Test your knowledge of the AMD linux driver stack with these interview-style questions.'}
            </p>

            <button
              onClick={startAssessment}
              className="w-full sm:w-auto px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 shadow-lg shadow-orange-500/20"
            >
              <Play className="w-5 h-5 fill-current" />
              Start Assessment
            </button>
          </div>

          <section>
            <h2 className="text-xl font-semibold mb-6">Capabilities Checklist</h2>
            <div className="grid gap-6 sm:grid-cols-2">
              {checklists.map((cl) => (
                <div key={cl.phaseId} className="border border-border/50 bg-card rounded-2xl p-6 shadow-sm">
                  <div className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-orange-500/10 text-orange-600 mb-4">
                    Phase {cl.phaseId.replace('phase-', '')}
                  </div>
                  <div className="space-y-3">
                    {cl.items.map((item) => (
                      <div key={item.id} className="flex items-start gap-3 text-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-orange-500/50 mt-1.5 shrink-0" />
                        <span className="text-muted-foreground">
                          {item.description}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>
    );
  }

  // Result Component
  if (state === 'result') {
    const total = questions.length;
    const passedCounts = Object.values(scores).filter(s => s === 'pass').length;

    // Calculate by phase
    const resultsByPhase: Record<string, { pass: number; total: number }> = {};
    questions.forEach(q => {
      if (!resultsByPhase[q.phaseId]) resultsByPhase[q.phaseId] = { pass: 0, total: 0 };
      resultsByPhase[q.phaseId].total++;
      if (scores[q.id] === 'pass') resultsByPhase[q.phaseId].pass++;
    });

    return (
      <div className="min-h-screen bg-background flex flex-col pt-12">
        <AssessmentResult
          score={passedCounts}
          total={total}
          resultsByPhase={resultsByPhase}
          onRetake={startAssessment}
        />
      </div>
    );
  }

  // Active Component
  const progressPct = ((currentIdx) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border/50 backdrop-blur-md bg-background/80">
        <div className="max-w-3xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => setState('intro')} className="p-1.5 rounded hover:bg-muted text-muted-foreground transition-colors hover:text-foreground">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-semibold truncate">Mastery Assessment</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-muted-foreground hidden sm:block">
              {currentIdx + 1} / {questions.length}
            </span>
            <div className="w-32 h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-orange-500 transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIdx}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            <QuestionCard
              question={questions[currentIdx]}
              isRevealed={isRevealed}
              onReveal={() => setIsRevealed(true)}
              onScore={handleScore}
            />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
