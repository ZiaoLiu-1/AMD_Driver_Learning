/* ============================================================
   AMD Driver Learning Platform - Progress Tracking Context
   Stores learning progress in localStorage
   ============================================================ */
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type ModuleStatus = 'not-started' | 'in-progress' | 'completed';

interface ProgressState {
  [moduleId: string]: {
    status: ModuleStatus;
    completedTabs: string[];
    lastVisited: string;
    notes: string;
  };
}

interface ProgressContextType {
  progress: ProgressState;
  getModuleStatus: (moduleId: string) => ModuleStatus;
  markTabComplete: (moduleId: string, tab: string) => void;
  setModuleStatus: (moduleId: string, status: ModuleStatus) => void;
  saveNote: (moduleId: string, note: string) => void;
  getNote: (moduleId: string) => string;
  getTotalCompleted: () => number;
  getCompletedTabs: (moduleId: string) => string[];
  resetProgress: () => void;
}

const ProgressContext = createContext<ProgressContextType | null>(null);

const STORAGE_KEY = 'amd-driver-platform-progress';

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [progress, setProgress] = useState<ProgressState>(() => {
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

  const getModuleStatus = (moduleId: string): ModuleStatus => {
    return progress[moduleId]?.status ?? 'not-started';
  };

  const markTabComplete = (moduleId: string, tab: string) => {
    setProgress(prev => {
      const existing = prev[moduleId] ?? { status: 'not-started', completedTabs: [], lastVisited: '', notes: '' };
      const completedTabs = existing.completedTabs.includes(tab)
        ? existing.completedTabs
        : [...existing.completedTabs, tab];
      const allTabs = ['theory', 'code', 'project', 'interview'];
      const status: ModuleStatus = allTabs.every(t => completedTabs.includes(t))
        ? 'completed'
        : 'in-progress';
      return {
        ...prev,
        [moduleId]: {
          ...existing,
          completedTabs,
          status,
          lastVisited: new Date().toISOString(),
        },
      };
    });
  };

  const setModuleStatus = (moduleId: string, status: ModuleStatus) => {
    setProgress(prev => ({
      ...prev,
      [moduleId]: {
        ...(prev[moduleId] ?? { completedTabs: [], lastVisited: '', notes: '' }),
        status,
        lastVisited: new Date().toISOString(),
      },
    }));
  };

  const saveNote = (moduleId: string, note: string) => {
    setProgress(prev => ({
      ...prev,
      [moduleId]: {
        ...(prev[moduleId] ?? { status: 'not-started', completedTabs: [], lastVisited: '' }),
        notes: note,
      },
    }));
  };

  const getNote = (moduleId: string): string => {
    return progress[moduleId]?.notes ?? '';
  };

  const getTotalCompleted = (): number => {
    return Object.values(progress).filter(p => p.status === 'completed').length;
  };

  const getCompletedTabs = (moduleId: string): string[] => {
    return progress[moduleId]?.completedTabs ?? [];
  };

  const resetProgress = () => {
    setProgress({});
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <ProgressContext.Provider value={{
      progress,
      getModuleStatus,
      markTabComplete,
      setModuleStatus,
      saveNote,
      getNote,
      getTotalCompleted,
      getCompletedTabs,
      resetProgress,
    }}>
      {children}
    </ProgressContext.Provider>
  );
}

export function useProgress() {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error('useProgress must be used within ProgressProvider');
  return ctx;
}
