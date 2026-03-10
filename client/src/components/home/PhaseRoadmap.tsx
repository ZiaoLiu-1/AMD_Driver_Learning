import { motion } from 'framer-motion';
import { EngineeringPhase } from '@/data/engineering_phases';
import { Link } from 'wouter';
import { Check, Lock, ChevronRight } from 'lucide-react';
import { ProgressRing } from './ProgressRing';

interface PhaseRoadmapProps {
    phases: EngineeringPhase[];
    getPhaseProgress: (id: string) => any;
    getModuleStatus: (id: string) => any;
    locale: string;
}

function PhaseNode({ phase, progress, isLocked, isCompleted, isInProgress, firstIncomplete }: {
    phase: EngineeringPhase;
    progress: any;
    isLocked: boolean;
    isCompleted: boolean;
    isInProgress: boolean;
    firstIncomplete: string;
}) {
    return (
        <Link href={isLocked ? "#" : `/module/${firstIncomplete}`}>
            <div
                className={`flex flex-col items-center ${isLocked ? 'cursor-not-allowed' : 'cursor-pointer'} transition-transform hover:-translate-y-1`}
                style={{ opacity: isLocked ? 0.4 : 1 }}
                title={isLocked ? 'Locked - Complete prerequisites first' : 'Click to continue'}
            >
                <div className="relative mb-3 flex items-center justify-center">
                    <ProgressRing
                        percentage={progress.percentage}
                        status={progress.status}
                        size={72}
                        strokeWidth={4}
                    >
                        {isCompleted ? (
                            <div className="w-8 h-8 rounded-full bg-success/15 flex items-center justify-center">
                                <Check className="w-4 h-4 text-success" strokeWidth={3} />
                            </div>
                        ) : isLocked ? (
                            <Lock className="w-4 h-4 text-muted-foreground/40" aria-hidden="true" />
                        ) : progress.percentage > 0 ? (
                            <span className="text-xs font-mono font-semibold text-foreground tabular-nums">
                                {progress.percentage}
                                <span className="text-[9px] text-muted-foreground">%</span>
                            </span>
                        ) : (
                            <span className="text-xs font-mono font-medium text-muted-foreground/60">
                                {phase.number}
                            </span>
                        )}
                    </ProgressRing>
                </div>

                <div className="text-center px-2">
                    <div className="flex items-center justify-center gap-1.5 mb-1 text-xs font-mono font-bold tracking-widest text-muted-foreground uppercase">
                        Phase {phase.number}
                    </div>
                    <h3 className={`text-sm font-semibold leading-snug mb-1 ${isLocked ? 'text-muted-foreground' : 'text-foreground'}`}>
                        {phase.title}
                    </h3>
                    <div className="text-[11px] text-muted-foreground/70 flex items-center justify-center gap-1">
                        {phase.moduleIds.length} Modules
                    </div>
                </div>
            </div>
        </Link>
    );
}

export function PhaseRoadmap({ phases, getPhaseProgress, getModuleStatus, locale }: PhaseRoadmapProps) {
    return (
        <motion.div
            className="flex flex-col lg:flex-row items-center lg:items-start justify-center relative w-full gap-6 lg:gap-0 mt-8 mb-16"
            initial="hidden"
            animate="visible"
            variants={{
                visible: { transition: { staggerChildren: 0.1 } },
                hidden: {}
            }}
        >
            {phases.map((phase, idx) => {
                const progress = getPhaseProgress(phase.id);

                let isLocked = false;
                if (phase.prerequisites && phase.prerequisites.length > 0) {
                    isLocked = phase.prerequisites.some((preReqId: string) => getPhaseProgress(preReqId).status !== 'completed');
                }

                const isCompleted = progress.status === 'completed';
                const isInProgress = progress.status === 'in-progress' || (!isLocked && progress.percentage === 0);
                const firstIncomplete = phase.moduleIds.find((m: string) => getModuleStatus(m) !== 'completed') || phase.moduleIds[0];

                const prevCompleted = idx > 0 && getPhaseProgress(phases[idx - 1].id).status === 'completed';

                return (
                    <motion.div
                        key={phase.id}
                        className="flex flex-col lg:flex-row items-center flex-1 min-w-0"
                        variants={{
                            hidden: { opacity: 0, scale: 0.9, y: 15 },
                            visible: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", bounce: 0, duration: 0.6 } }
                        }}
                    >
                        {idx > 0 && (
                            <div className="hidden lg:flex items-center justify-center shrink-0 -mx-1 self-start mt-[30px]">
                                <ChevronRight
                                    className={`w-4 h-4 ${prevCompleted ? 'text-primary/50' : 'text-border'}`}
                                    strokeWidth={1.5}
                                    aria-hidden="true"
                                />
                            </div>
                        )}
                        <div className="flex flex-col items-center w-full group">
                            <PhaseNode
                                phase={phase}
                                progress={progress}
                                isLocked={isLocked}
                                isCompleted={isCompleted}
                                isInProgress={isInProgress}
                                firstIncomplete={firstIncomplete}
                            />
                        </div>
                    </motion.div>
                );
            })}
        </motion.div>
    );
}
