import { EngineeringPhase } from '@/data/engineering_phases';
import { Link } from 'wouter';
import { ChevronDown, ChevronUp, ChevronRight, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { difficultyColors } from '@/data/curriculum';
import { getCurriculum, getDifficultyLabels, type Locale } from '@/data/curriculum_index';
import { DynamicIcon } from '@/components/DynamicIcon';

interface PhaseCardGridProps {
    phases: EngineeringPhase[];
    getPhaseProgress: (id: string) => any;
    getModuleStatus: (id: string) => any;
    locale: string;
}

export function PhaseCardGrid({ phases, getPhaseProgress, getModuleStatus, locale }: PhaseCardGridProps) {
    const curriculum = getCurriculum(locale as Locale);
    const difficultyLabels = getDifficultyLabels(locale as Locale);

    // By default, the first incomplete phase is expanded
    const firstIncompleteIdx = phases.findIndex(p => {
        const prog = getPhaseProgress(p.id);
        return prog.status !== 'completed';
    });
    const defaultExpandedId = firstIncompleteIdx !== -1 ? phases[firstIncompleteIdx].id : phases[phases.length - 1].id;

    const [expandedPhaseId, setExpandedPhaseId] = useState<string | null>(defaultExpandedId);

    return (
        <div className="flex flex-col gap-6 w-full">
            {phases.map((phase) => {
                const isExpanded = expandedPhaseId === phase.id;
                const phaseProgress = getPhaseProgress(phase.id);
                const stageModules = phase.moduleIds.map(id => curriculum.find(m => m.id === id)).filter(Boolean) as typeof curriculum;

                return (
                    <motion.div
                        key={phase.id}
                        layoutId={`phase-card-${phase.id}`}
                        className={`rounded-2xl border overflow-hidden glass-panel hover-lift transition-shadow ${phaseProgress.status === 'completed' ? 'bg-card border-green-500/30' : 'bg-orange-500/5 border-border/40'
                            }`}
                    >
                        {/* Phase Card Header */}
                        <div
                            className="px-6 py-4 flex items-center justify-between cursor-pointer border-b border-transparent hover:bg-muted/30 transition-colors"
                            onClick={() => setExpandedPhaseId(isExpanded ? null : phase.id)}
                        >
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 w-full">
                                <div className="flex items-center gap-3">
                                    <span className="text-xs font-mono px-2 py-0.5 rounded font-bold bg-orange-500/10 text-orange-600">
                                        Phase {phase.number}
                                    </span>
                                    <span className="text-base font-semibold text-foreground">{phase.title}</span>
                                </div>

                                <div className="flex flex-row items-center gap-4 sm:ml-auto">
                                    <div className="hidden sm:flex shrink-0 w-32 items-center gap-2 text-xs text-muted-foreground mr-4">
                                        <div className="w-full h-1.5 rounded-full overflow-hidden bg-muted">
                                            <div className="h-full bg-orange-500 rounded-full transition-all" style={{ width: `${phaseProgress.percentage}%` }} />
                                        </div>
                                        <span>{phaseProgress.percentage}%</span>
                                    </div>

                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <span className="px-2 py-0.5 bg-muted rounded">{phase.estimatedHours}h</span>
                                        <span className={`px-2 py-0.5 rounded capitalize ${difficultyColors[phase.difficulty]}`}>{phase.difficulty}</span>
                                    </div>
                                    {isExpanded ? <ChevronUp className="w-5 h-5 ml-2 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 ml-2 text-muted-foreground" />}
                                </div>
                            </div>
                        </div>

                        {/* Expanded Modules */}
                        <AnimatePresence>
                            {isExpanded && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="px-6 py-4 border-t border-border/40 overflow-hidden"
                                >
                                    <div className="mb-4">
                                        <div className="flex flex-wrap gap-2 text-[11px]">
                                            {phase.coreConcepts.map((concept, i) => (
                                                <span key={i} className="px-2 py-1 rounded-sm bg-muted/60 text-muted-foreground font-mono">{concept}</span>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {stageModules.map((module) => {
                                            const status = getModuleStatus(module.id);
                                            return (
                                                <Link key={module.id} href={`/module/${module.id}`}>
                                                    <div className="flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all hover:border-opacity-100 hover:scale-[1.02] bg-card/50 hover:bg-card">
                                                        <div className="flex-shrink-0">
                                                            {status === 'completed' ? (
                                                                <CheckCircle2 className="w-5 h-5 text-green-500" />
                                                            ) : status === 'in-progress' ? (
                                                                <div className="w-5 h-5 rounded-full border-2 border-orange-500 flex items-center justify-center">
                                                                    <div className="w-2 h-2 rounded-full bg-orange-500" />
                                                                </div>
                                                            ) : (
                                                                <div className="w-5 h-5 rounded-full border-2 border-border/40" />
                                                            )}
                                                        </div>

                                                        <div className="min-w-0 flex-1">
                                                            <div className="flex items-center gap-1.5 mb-1.5">
                                                                <DynamicIcon name={module.icon} className="w-4 h-4 text-foreground/70" />
                                                                <span className="text-sm font-medium text-foreground/90 truncate">
                                                                    {module.title}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-2 text-[10px] text-muted-foreground/60 focus:outline-none">
                                                                <span className={difficultyColors[module.difficulty]}>{difficultyLabels[module.difficulty]}</span>
                                                                <span>· {module.estimatedHours}h</span>
                                                            </div>
                                                        </div>

                                                        <ChevronRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors" />
                                                    </div>
                                                </Link>
                                            );
                                        })}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                );
            })}
        </div>
    );
}
