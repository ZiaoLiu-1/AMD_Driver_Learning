/* ============================================================
   Assessment Page — Placeholder for Anti Gravity to implement
   See UI_SPEC.md for detailed component requirements
   ============================================================ */

import { Link } from 'wouter';
import { useLocale } from '@/contexts/LocaleContext';
import { useTranslation } from 'react-i18next';
import { getMasteryQuestions, getAllChecklists } from '@/data/mastery_checks';
import { ArrowLeft, ClipboardCheck, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

export default function AssessmentPage() {
  const { locale } = useLocale();
  const { t } = useTranslation();
  const questions = getMasteryQuestions(locale);
  const checklists = getAllChecklists(locale);
  const [revealedAnswers, setRevealedAnswers] = useState<Set<string>>(new Set());

  const toggleAnswer = (id: string) => {
    setRevealedAnswers((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

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
            <ClipboardCheck className="w-7 h-7 text-orange-500" />
            <h1 className="text-3xl font-bold">{t('assessment.pageTitle')}</h1>
          </div>
          <p className="text-muted-foreground">{t('assessment.pageSubtitle')}</p>
        </div>

        {/* Mastery Questions */}
        <section className="mb-16">
          <h2 className="text-xl font-semibold mb-6">{t('assessment.masteryQuestions')}</h2>
          <div className="grid gap-6">
            {questions.map((q) => (
              <div key={q.id} className="border border-border rounded-lg p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-base font-medium flex-1 pr-4">{q.question}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded shrink-0 ${
                    q.difficulty === 'core' ? 'bg-green-500/10 text-green-600' :
                    q.difficulty === 'advanced' ? 'bg-yellow-500/10 text-yellow-600' :
                    'bg-red-500/10 text-red-600'
                  }`}>
                    {t(`assessment.${q.difficulty}`)}
                  </span>
                </div>

                <div className="text-xs text-muted-foreground mb-4">
                  {t('assessment.hint')}: {q.hints[0]}
                </div>

                <button
                  onClick={() => toggleAnswer(q.id)}
                  className="text-sm text-orange-500 hover:text-orange-600 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  {revealedAnswers.has(q.id) ? (
                    <>
                      <ChevronUp className="w-3.5 h-3.5" />
                      {t('assessment.hideAnswer')}
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-3.5 h-3.5" />
                      {t('assessment.revealAnswer')}
                    </>
                  )}
                </button>

                {revealedAnswers.has(q.id) && (
                  <div className="mt-4 p-4 bg-muted/50 rounded-lg text-sm leading-relaxed">
                    {q.referenceAnswer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Phase Checklists */}
        <section>
          <h2 className="text-xl font-semibold mb-6">{t('assessment.checklist')}</h2>
          <div className="grid gap-6">
            {checklists.map((cl) => (
              <div key={cl.phaseId} className="border border-border rounded-lg p-6">
                <h3 className="font-medium mb-4">{t('assessment.phase', { number: cl.phaseId.split('-')[1] })}</h3>
                <div className="space-y-2">
                  {cl.items.map((item) => (
                    <label key={item.id} className="flex items-start gap-3 text-sm cursor-pointer group">
                      <input type="checkbox" className="mt-0.5 rounded" />
                      <span className="group-hover:text-foreground transition-colors text-muted-foreground">
                        {item.description}
                      </span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded shrink-0 ml-auto ${
                        item.category === 'theory' ? 'bg-blue-500/10 text-blue-600' :
                        item.category === 'code' ? 'bg-purple-500/10 text-purple-600' :
                        item.category === 'experiment' ? 'bg-green-500/10 text-green-600' :
                        'bg-red-500/10 text-red-600'
                      }`}>
                        {t(`assessment.${item.category}`)}
                      </span>
                    </label>
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
