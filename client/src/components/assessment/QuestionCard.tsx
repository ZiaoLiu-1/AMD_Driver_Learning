import { MasteryQuestion } from '@/data/mastery_checks';
import { Lightbulb, ChevronDown, Check, X, ShieldAlert, Cpu, Zap } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface QuestionCardProps {
    question: MasteryQuestion;
    isRevealed: boolean;
    onReveal: () => void;
    onScore: (score: 'pass' | 'fail') => void;
}

export function QuestionCard({ question, isRevealed, onReveal, onScore }: QuestionCardProps) {
    const [showHint, setShowHint] = useState(false);

    return (
        <div className="bg-card border border-border/50 rounded-2xl p-6 md:p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
                <span className={`px-2.5 py-1 rounded-md text-[10px] uppercase font-bold tracking-wider
          ${question.difficulty === 'core' ? 'bg-green-500/10 text-green-600' :
                        question.difficulty === 'advanced' ? 'bg-yellow-500/10 text-yellow-600' :
                            'bg-red-500/10 text-red-600'
                    }`}
                >
                    {question.difficulty}
                </span>
                <div className="h-4 w-px bg-border/50" />
                <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                    Phase {question.phaseId.replace('phase-', '')}
                </span>
            </div>

            <h2 className="text-xl md:text-2xl font-bold leading-relaxed mb-8">
                {question.question}
            </h2>

            {!isRevealed ? (
                <div className="space-y-6">
                    <div className="bg-orange-500/5 border border-orange-500/20 rounded-xl overflow-hidden">
                        <button
                            onClick={() => setShowHint(!showHint)}
                            className="w-full flex items-center justify-between p-4 text-sm font-semibold text-orange-600 hover:bg-orange-500/10 transition-colors"
                        >
                            <div className="flex items-center gap-2">
                                <Lightbulb className="w-4 h-4" />
                                Need a hint?
                            </div>
                            <ChevronDown className={`w-4 h-4 transition-transform ${showHint ? 'rotate-180' : ''}`} />
                        </button>
                        <AnimatePresence>
                            {showHint && (
                                <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                                    <div className="p-4 pt-0 text-sm text-foreground/80 border-t border-orange-500/10">
                                        <ul className="space-y-2">
                                            {question.hints.map((hint, i) => (
                                                <li key={i} className="flex items-start gap-2">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500/50 mt-1.5 shrink-0" />
                                                    <span>{hint}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <button
                        onClick={onReveal}
                        className="w-full py-4 text-center border-2 border-border/60 hover:border-orange-500/50 hover:bg-orange-500/5 rounded-xl font-medium transition-all"
                    >
                        Reveal Reference Answer
                    </button>
                </div>
            ) : (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                    <div className="bg-muted/30 border border-border/50 rounded-xl p-6">
                        <h3 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-4">Reference Answer</h3>
                        <p className="text-sm md:text-base leading-relaxed text-foreground/90 whitespace-pre-wrap">
                            {question.referenceAnswer}
                        </p>
                    </div>

                    <div className="pt-6 border-t border-border/50">
                        <h3 className="text-center font-medium mb-6">How did you do?</h3>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button
                                onClick={() => onScore('pass')}
                                className="flex flex-1 items-center justify-center gap-2 px-6 py-4 bg-green-500/10 hover:bg-green-500/20 text-green-600 border border-green-500/20 rounded-xl font-bold transition-colors"
                            >
                                <Check className="w-5 h-5" />
                                I knew it
                            </button>
                            <button
                                onClick={() => onScore('fail')}
                                className="flex flex-1 items-center justify-center gap-2 px-6 py-4 bg-muted hover:bg-muted/80 text-foreground border border-border/50 rounded-xl font-bold transition-colors"
                            >
                                <X className="w-5 h-5" />
                                Need more review
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </div>
    );
}
