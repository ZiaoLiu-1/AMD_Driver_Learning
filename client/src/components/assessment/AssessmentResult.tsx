import { Trophy, ArrowRight, BookOpen, RotateCcw, AlertTriangle } from 'lucide-react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';

interface AssessmentResultProps {
    score: number;
    total: number;
    resultsByPhase: Record<string, { pass: number; total: number }>;
    onRetake: () => void;
}

export function AssessmentResult({ score, total, resultsByPhase, onRetake }: AssessmentResultProps) {
    const percentage = Math.round((score / total) * 100);
    const isPassed = percentage >= 70; // 70% passing threshold

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-3xl mx-auto"
        >
            <div className="bg-card border border-border/50 rounded-3xl p-8 md:p-12 shadow-sm text-center mb-8 relative overflow-hidden">
                <div className={`absolute top-0 left-0 w-full h-2 ${isPassed ? 'bg-green-500' : 'bg-orange-500'}`} />

                <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-6 border-8 ${isPassed ? 'bg-green-500/10 border-green-500/5 text-green-500' : 'bg-orange-500/10 border-orange-500/5 text-orange-500'
                    }`}>
                    {isPassed ? <Trophy className="w-10 h-10" /> : <AlertTriangle className="w-10 h-10" />}
                </div>

                <h1 className="text-3xl md:text-4xl font-bold mb-4">
                    {isPassed ? 'Assessment Passed!' : 'Requires Review'}
                </h1>
                <p className="text-lg text-muted-foreground mb-8">
                    You scored <strong className="text-foreground">{score} out of {total}</strong> points ({percentage}%).
                </p>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 max-w-2xl mx-auto text-left mb-10">
                    {Object.entries(resultsByPhase).map(([phaseId, data]) => {
                        const phasePct = Math.round((data.pass / data.total) * 100);
                        return (
                            <div key={phaseId} className="bg-muted/40 rounded-xl p-4 border border-border/40">
                                <div className="text-xs font-mono uppercase text-muted-foreground mb-2">Phase {phaseId.replace('phase-', '')}</div>
                                <div className="flex items-end justify-between mb-2">
                                    <span className="text-lg font-bold">{data.pass}/{data.total}</span>
                                    <span className="text-sm font-medium">{phasePct}%</span>
                                </div>
                                <div className="h-1.5 rounded-full bg-background overflow-hidden">
                                    <div
                                        className={`h-full ${phasePct >= 70 ? 'bg-green-500' : 'bg-orange-500'}`}
                                        style={{ width: `${phasePct}%` }}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <button
                        onClick={onRetake}
                        className="w-full sm:w-auto px-6 py-3 rounded-xl border border-border font-medium hover:bg-muted transition-colors flex items-center justify-center gap-2 text-sm"
                    >
                        <RotateCcw className="w-4 h-4" />
                        Retake Assessment
                    </button>
                    {!isPassed && (
                        <Link href="/">
                            <button className="w-full sm:w-auto px-6 py-3 rounded-xl bg-orange-500 text-white font-medium hover:bg-orange-600 transition-colors flex items-center justify-center gap-2 text-sm">
                                <BookOpen className="w-4 h-4" />
                                Review Modules
                            </button>
                        </Link>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
