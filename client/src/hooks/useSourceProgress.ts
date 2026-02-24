import { useState, useEffect } from 'react';

export interface SourceProgressState {
    completedFiles: string[]; // file paths that have been marked as read
}

const STORAGE_KEY = 'amd-driver-platform-source-progress';

export function useSourceProgress() {
    const [progress, setProgress] = useState<SourceProgressState>(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            return stored ? JSON.parse(stored) : { completedFiles: [] };
        } catch {
            return { completedFiles: [] };
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
        } catch {
            // ignore storage errors
        }
    }, [progress]);

    const toggleFile = (filePath: string) => {
        setProgress(prev => {
            const set = new Set(prev.completedFiles);
            if (set.has(filePath)) {
                set.delete(filePath);
            } else {
                set.add(filePath);
            }
            return { completedFiles: Array.from(set) };
        });
    };

    const isFileCompleted = (filePath: string) => {
        return progress.completedFiles.includes(filePath);
    };

    const getStageProgress = (stageFiles: any[]) => {
        if (!stageFiles.length) return { completed: 0, total: 0, percentage: 0 };
        const completed = stageFiles.filter(f => isFileCompleted(f.path)).length;
        return {
            completed,
            total: stageFiles.length,
            percentage: Math.round((completed / stageFiles.length) * 100)
        };
    };

    return {
        progress,
        toggleFile,
        isFileCompleted,
        getStageProgress
    };
}
