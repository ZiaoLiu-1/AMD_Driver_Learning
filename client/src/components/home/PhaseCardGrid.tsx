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
    microLessonsByModule: Record<string, any>;
}

export function PhaseCardGrid({ phases, getPhaseProgress, getModuleStatus, locale, microLessonsByModule }: PhaseCardGridProps) {
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
        <motion.div
            className="flex flex-col gap-6 w-full"
            initial="hidden"
            animate="visible"
            variants={{
                visible: { transition: { staggerChildren: 0.1 } },
                hidden: {}
            }}
        >
            {phases.map((phase) => {
                const isExpanded = expandedPhaseId === phase.id;
                const phaseProgress = getPhaseProgress(phase.id);
                const stageModules = phase.moduleIds.map(id => curriculum.find(m => m.id === id)).filter(Boolean) as typeof curriculum;

                return (
                    <motion.div
                        key={phase.id}
                        layoutId={`phase-card-${phase.id}`}
                        variants={{
                            hidden: { opacity: 0, y: 20 },
                            visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
                        }}
                        className={`rounded-xl border overflow-hidden transition-colors ${phaseProgress.status === 'completed' ? 'bg-card border-success/30' : 'bg-background border-border/50'
                            }`}
                    >
                        {/* Phase Card Header */}
                        <div
                            className="px-6 py-4 flex items-center justify-between cursor-pointer border-b border-transparent hover:bg-muted/30 transition-colors"
                            onClick={() => setExpandedPhaseId(isExpanded ? null : phase.id)}
                        >
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 w-full">
                                <div className="flex items-center gap-3">
                                    <span className="text-xs font-mono px-2 py-0.5 rounded font-bold bg-primary/10 text-primary">
                                        Phase {phase.number}
                                    </span>
                                    <span className="text-base font-semibold text-foreground">{phase.title}</span>
                                </div>

                                <div className="flex flex-row items-center gap-4 sm:ml-auto">
                                    <div className="hidden sm:flex shrink-0 w-32 items-center gap-2 text-xs text-muted-foreground mr-4">
                                        <div className="w-full h-1.5 rounded-full overflow-hidden bg-muted">
                                            <div className="h-full bg-primary rounded-full transition-[width] duration-500" style={{ width: `${phaseProgress.percentage}%` }} />
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

                        {/* Expanded Modules CSS Grid Transition */}
                        <div
                            className="grid transition-[grid-template-rows] duration-500 ease-out"
                            style={{ gridTemplateRows: isExpanded ? '1fr' : '0fr' }}
                        >
                            <div className="overflow-hidden">
                                <div className="px-6 py-4 border-t border-border/40">
                                    <div className="mb-4">
                                        <div className="flex flex-wrap gap-2 text-[11px]">
                                            {phase.coreConcepts.map((concept, i) => (
                                                <span key={i} className="px-2 py-1 rounded-sm bg-muted/60 text-muted-foreground font-mono">{concept}</span>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-0 border-t border-border/30 mt-2">
                                        {stageModules.map((module, index) => {
                                            const status = getModuleStatus(module.id);
                                            return (
                                                <Link key={module.id} href={`/module/${module.id}`}>
                                                    <div className={`group flex items-center gap-3 py-3 px-2 sm:px-4 cursor-pointer hover:bg-muted/40 transition-colors ${index !== stageModules.length - 1 ? 'border-b border-border/20' : ''}`}>
                                                        <div className="flex-shrink-0">
                                                            {status === 'completed' ? (
                                                                <CheckCircle2 className="w-4 h-4 text-success" />
                                                            ) : status === 'in-progress' ? (
                                                                <div className="w-4 h-4 rounded-full border border-primary flex items-center justify-center">
                                                                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                                                </div>
                                                            ) : (
                                                                <div className="w-4 h-4 rounded-full border border-border/60" />
                                                            )}
                                                        </div>

                                                        <div className="min-w-0 flex-1 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                                                            <div className="flex items-center gap-2">
                                                                <DynamicIcon name={module.icon} className="w-3.5 h-3.5 text-muted-foreground" />
                                                                <span className="text-sm font-medium text-foreground/90 truncate">
                                                                    {module.title}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-2 text-[10px] text-muted-foreground/60 sm:ml-auto focus:outline-none">
                                                                <span className={difficultyColors[module.difficulty]}>{difficultyLabels[module.difficulty]}</span>
                                                                <span className="hidden sm:inline">·</span>
                                                                <span>{module.estimatedHours}h</span>
                                                                {microLessonsByModule[module.id] && (
                                                                    <>
                                                                        <span className="hidden sm:inline">·</span>
                                                                        <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 px-1.5 py-0.5 rounded-sm bg-muted/60 text-muted-foreground">
                                                                            {microLessonsByModule[module.id].groups?.reduce((acc: number, g: any) => acc + (g.lessons?.length || 0), 0) || 0} topics
                                                                        </span>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>

                                                        <ChevronRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-muted-foreground transition-colors ml-2 flex-shrink-0 group-hover:translate-x-0.5 duration-300" />
                                                    </div>
                                                </Link>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                );
            })}
        </motion.div>
    );
}
