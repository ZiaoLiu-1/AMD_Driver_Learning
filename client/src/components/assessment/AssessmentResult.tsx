import { Trophy, BookOpen, RotateCcw, AlertTriangle } from 'lucide-react';
import { Link } from 'wouter';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

interface AssessmentResultProps {
    score: number;
    total: number;
    resultsByPhase: Record<string, { pass: number; total: number }>;
    onRetake: () => void;
}

export function AssessmentResult({ score, total, resultsByPhase, onRetake }: AssessmentResultProps) {
    const { t } = useTranslation();
    const percentage = Math.round((score / total) * 100);
    const isPassed = percentage >= 70;

    const weakPhases = Object.entries(resultsByPhase)
        .filter(([, data]) => Math.round((data.pass / data.total) * 100) < 70)
        .map(([id]) => id.replace('phase-', ''));

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-3xl mx-auto"
        >
            <div className="bg-card border border-border/50 rounded-3xl p-8 md:p-12 shadow-sm text-center mb-8 relative overflow-hidden">
                <div className={`absolute top-0 left-0 w-full h-2 ${isPassed ? 'bg-success' : 'bg-primary'}`} />

                <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-6 border-8 ${isPassed ? 'bg-success/10 border-success/5 text-success' : 'bg-primary/10 border-primary/5 text-primary'
                    }`}>
                    {isPassed ? <Trophy className="w-10 h-10" /> : <AlertTriangle className="w-10 h-10" />}
                </div>

                <h1 className="text-3xl md:text-4xl font-bold mb-4">
                    {isPassed
                        ? t('assessment.passed') || 'Assessment Passed'
                        : t('assessment.needsReview') || 'Review Recommended'}
                </h1>
                <p className="text-lg text-muted-foreground mb-8">
                    {t('assessment.scoreMessage', { score, total, percentage })
                        || <>You scored <strong className="text-foreground">{score} of {total}</strong> ({percentage}%).</>}
                </p>

                <motion.div
                    className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 max-w-2xl mx-auto text-left mb-10"
                    variants={{
                        visible: { transition: { staggerChildren: 0.1 } },
                        hidden: {}
                    }}
                    initial="hidden"
                    animate="visible"
                >
                    {Object.entries(resultsByPhase).map(([phaseId, data]) => {
                        const phasePct = Math.round((data.pass / data.total) * 100);
                        const isStrong = phasePct >= 70;
                        return (
                            <motion.div
                                key={phaseId}
                                variants={{
                                    hidden: { opacity: 0, x: -20 },
                                    visible: { opacity: 1, x: 0 }
                                }}
                                className={`rounded-xl p-4 border ${isStrong ? 'bg-muted/40 border-border/40' : 'bg-primary/5 border-primary/20'}`}
                            >
                                <div className="text-xs font-mono uppercase text-muted-foreground mb-2">Phase {phaseId.replace('phase-', '')}</div>
                                <div className="flex items-end justify-between mb-2">
                                    <span className="text-lg font-bold">{data.pass}/{data.total}</span>
                                    <span className="text-sm font-medium">{phasePct}%</span>
                                </div>
                                <div className="h-1.5 rounded-full bg-background overflow-hidden mb-2 relative">
                                    <motion.div
                                        className={`absolute top-0 left-0 h-full ${isStrong ? 'bg-success' : 'bg-primary'}`}
                                        initial={{ width: 0 }}
                                        animate={{ width: `${phasePct}%` }}
                                        transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
                                    />
                                </div>
                                <div className={`text-xs font-medium ${isStrong ? 'text-success' : 'text-primary'}`}>
                                    {isStrong
                                        ? t('assessment.phaseStrong') || 'Strong — keep going'
                                        : t('assessment.phaseWeak') || 'Review this phase'}
                                </div>
                            </motion.div>
                        );
                    })}
                </motion.div>

                <motion.div
                    className="flex flex-col sm:flex-row items-center justify-center gap-4"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                >
                    <button
                        onClick={onRetake}
                        className="w-full sm:w-auto px-6 py-3 rounded-xl border border-border font-medium hover:bg-muted transition-colors flex items-center justify-center gap-2 text-sm"
                    >
                        <RotateCcw className="w-4 h-4" />
                        {t('assessment.retake') || 'Retake'}
                    </button>
                    {weakPhases.length > 0 && (
                        <Link href="/"
                            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-primary text-white font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 text-sm">
                            <BookOpen className="w-4 h-4" aria-hidden="true" />
                            {t('assessment.reviewModules') || 'Review Weak Phases'}
                        </Link>
                    )}
                </motion.div>
            </div>
        </motion.div>
    );
}
