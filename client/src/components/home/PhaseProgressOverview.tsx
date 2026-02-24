import { EngineeringPhase } from '@/data/engineering_phases';

interface PhaseProgressOverviewProps {
    phases: EngineeringPhase[];
    getPhaseProgress: (id: string) => any;
    overall: { completed: number; total: number; percentage: number };
}

export function PhaseProgressOverview({ phases, getPhaseProgress, overall }: PhaseProgressOverviewProps) {
    // If no progress at all, maybe return null, but parent handles this.

    const currentPhase = phases.find(p => getPhaseProgress(p.id).status !== 'completed') || phases[phases.length - 1];

    return (
        <div className="flex flex-col md:flex-row items-center justify-between w-full max-w-7xl mx-auto px-6 py-4">
            <div className="mb-4 md:mb-0 text-sm font-medium text-muted-foreground">
                Currently on <span className="text-foreground tracking-wide font-bold">Phase {currentPhase.number} of {phases.length}</span> — {currentPhase.title}
            </div>

            <div className="flex items-center gap-6">
                {phases.map(phase => {
                    const prog = getPhaseProgress(phase.id);
                    const isCompleted = prog.status === 'completed';
                    const isActive = prog.status === 'in-progress' || prog.percentage > 0;
                    return (
                        <div key={phase.id} className="flex flex-col items-center gap-1.5" title={`${phase.title}: ${prog.percentage}%`}>
                            <svg width={24} height={24} className="transform -rotate-90">
                                <circle cx={12} cy={12} r={10} strokeWidth={3} className="stroke-muted" fill="none" />
                                <circle
                                    cx={12} cy={12} r={10} strokeWidth={3} fill="none" strokeLinecap="round"
                                    stroke={isCompleted ? '#22c55e' : isActive ? 'url(#phaseLine)' : 'transparent'}
                                    strokeDasharray={20 * Math.PI}
                                    strokeDashoffset={(20 * Math.PI) - (prog.percentage / 100) * (20 * Math.PI)}
                                    className="transition-all duration-700"
                                />
                                <defs>
                                    <linearGradient id="phaseLine" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor="#E8441A" />
                                        <stop offset="100%" stopColor="#FF6B35" />
                                    </linearGradient>
                                </defs>
                            </svg>
                            <span className="text-[9px] font-mono text-muted-foreground">P{phase.number}</span>
                        </div>
                    )
                })}
                <div className="ml-4 pl-4 border-l border-border/40 text-xs text-muted-foreground font-mono">
                    {overall.percentage}% Overall
                </div>
            </div>
        </div>
    );
}
