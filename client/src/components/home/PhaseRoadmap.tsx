import { motion } from 'framer-motion';
import { EngineeringPhase } from '@/data/engineering_phases';
import { Link } from 'wouter';
import { CheckCircle2, Lock, Loader2, ArrowRight } from 'lucide-react';
import { ProgressRing } from './ProgressRing';

interface PhaseRoadmapProps {
    phases: EngineeringPhase[];
    getPhaseProgress: (id: string) => any;
    getModuleStatus: (id: string) => any;
    locale: string;
}

export function PhaseRoadmap({ phases, getPhaseProgress, getModuleStatus, locale }: PhaseRoadmapProps) {
    return (
        <div className="flex flex-col lg:flex-row items-center lg:items-start justify-between relative w-full gap-8 lg:gap-0 mt-8 mb-16">
            {/* Connector Lines Background (Desktop) */}
            <div className="hidden lg:block absolute top-[60px] left-[10%] right-[10%] h-0.5 bg-border/40 z-0">
                <motion.div
                    className="h-full"
                    style={{ background: 'linear-gradient(90deg, var(--primary), var(--brand-end))' }}
                    initial={{ width: 0 }}
                    animate={{ width: `${(phases.filter(p => getPhaseProgress(p.id).status === 'completed').length / (phases.length - 1)) * 100}%` }}
                    transition={{ duration: 1.2, ease: "easeInOut" }}
                />
            </div>

            <motion.div
                className="flex flex-col lg:flex-row items-center lg:items-start justify-between relative w-full gap-8 lg:gap-0"
                initial="hidden"
                animate="visible"
                variants={{
                    visible: { transition: { staggerChildren: 0.15 } },
                    hidden: {}
                }}
            >

                {phases.map((phase, idx) => {
                    const progress = getPhaseProgress(phase.id);

                    let isLocked = false;
                    if (phase.prerequisites && phase.prerequisites.length > 0) {
                        isLocked = phase.prerequisites.some(preReqId => getPhaseProgress(preReqId).status !== 'completed');
                    }

                    const isCompleted = progress.status === 'completed';
                    const isInProgress = progress.status === 'in-progress' || (!isLocked && progress.percentage === 0);

                    // Find first incomplete module to link to
                    const firstIncomplete = phase.moduleIds.find(m => getModuleStatus(m) !== 'completed') || phase.moduleIds[0];

                    return (
                        <motion.div
                            key={phase.id}
                            className="relative z-10 flex flex-col items-center w-full lg:w-1/5 group"
                            variants={{
                                hidden: { opacity: 0, scale: 0.9, y: 15 },
                                visible: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", bounce: 0, duration: 0.6 } }
                            }}
                        >
                            <Link href={isLocked ? "#" : `/module/${firstIncomplete}`}>
                                <div
                                    className={`flex flex-col items-center cursor-${isLocked ? 'not-allowed' : 'pointer'} transition-transform hover:-translate-y-1`}
                                    style={{ opacity: isLocked ? 0.4 : 1 }}
                                    title={isLocked ? 'Locked - Complete prerequisites first' : 'Click to continue'}
                                >
                                    <div className="relative mb-3 flex items-center justify-center">
                                        <ProgressRing
                                            percentage={progress.percentage}
                                            status={progress.status}
                                            size={80}
                                            strokeWidth={5}
                                        />
                                        {/* Phase Number Badge inside Ring */}
                                        {isCompleted ? (
                                            <div className="absolute inset-0 m-auto w-12 h-12 rounded-full flex items-center justify-center bg-success/20 text-success">
                                                <CheckCircle2 className="w-6 h-6" />
                                            </div>
                                        ) : isInProgress ? (
                                            <div className="absolute inset-0 m-auto w-12 h-12 rounded-full flex items-center justify-center text-primary">
                                                <Loader2 className="w-6 h-6 animate-spin-slow opacity-80" />
                                            </div>
                                        ) : isLocked ? (
                                            <div className="absolute inset-0 m-auto w-12 h-12 rounded-full flex items-center justify-center bg-muted text-muted-foreground/50">
                                                <Lock className="w-5 h-5" />
                                            </div>
                                        ) : null}
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
                        </motion.div>
                    );
                })}
            </motion.div>
        </div>
    );
}
