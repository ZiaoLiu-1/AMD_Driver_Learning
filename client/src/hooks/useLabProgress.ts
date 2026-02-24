import { useState, useEffect } from 'react';

export interface LabProgressState {
    [labId: string]: {
        completedSteps: number[];
        startedAt?: string;
        completedAt?: string;
    };
}

const STORAGE_KEY = 'amd-driver-platform-lab-progress';

export function useLabProgress() {
    const [progress, setProgress] = useState<LabProgressState>(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            return stored ? JSON.parse(stored) : {};
        } catch {
            return {};
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
        } catch {
            // ignore storage errors
        }
    }, [progress]);

    const toggleStep = (labId: string, stepIndex: number, totalSteps: number) => {
        setProgress(prev => {
            const existing = prev[labId] ?? { completedSteps: [], startedAt: new Date().toISOString() };
            const set = new Set(existing.completedSteps);

            if (set.has(stepIndex)) {
                set.delete(stepIndex);
            } else {
                set.add(stepIndex);
            }

            const completedSteps = Array.from(set);
            const isCompleted = completedSteps.length === totalSteps;

            return {
                ...prev,
                [labId]: {
                    ...existing,
                    completedSteps,
                    completedAt: isCompleted ? new Date().toISOString() : undefined
                }
            };
        });
    };

    const getLabProgress = (labId: string) => {
        return progress[labId] ?? { completedSteps: [] };
    };

    return {
        progress,
        toggleStep,
        getLabProgress
    };
}
