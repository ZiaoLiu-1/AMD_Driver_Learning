/* ============================================================
   Code Lab progress — localStorage-backed per-problem status
   and saved editor code, mirroring ProgressContext's approach.
   ============================================================ */
import { useCallback, useSyncExternalStore } from "react";

export type ProblemStatus = "unsolved" | "attempted" | "solved";

interface ProblemEntry {
  status: ProblemStatus;
  code?: string;
  updatedAt: string;
}

type ProgressMap = Record<string, ProblemEntry>;

const STORAGE_KEY = "amd-driver-learning-codelab-v1";

const VALID_STATUS = new Set<ProblemStatus>(["unsolved", "attempted", "solved"]);

/* Known problem-id space (c-01..c-16, cpp-01..cpp-12, k-01..k-12).
   Kept as a cheap static rule so this hook never has to import the
   (lazily chunked) problem bank; the data test asserts the ranges
   stay in sync with the actual bank. */
const ID_RE = /^(c|cpp|k)-(\d{2})$/;
const TRACK_MAX: Record<string, number> = { c: 16, cpp: 12, k: 12 };

export function isKnownProblemId(id: string): boolean {
  const m = ID_RE.exec(id);
  if (!m) return false;
  const n = Number(m[2]);
  return n >= 1 && n <= TRACK_MAX[m[1]];
}

/**
 * Defensive schema validation: localStorage is user-writable, so any
 * shape must be tolerated. `"null"`, arrays, or malformed entries are
 * dropped instead of crashing the Code Lab at module load.
 */
export function sanitizeProgress(raw: unknown): ProgressMap {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  const out: ProgressMap = {};
  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    if (!isKnownProblemId(key)) continue; // forged ids must not inflate progress
    if (!value || typeof value !== "object" || Array.isArray(value)) continue;
    const entry = value as Partial<ProblemEntry>;
    if (typeof entry.status !== "string" || !VALID_STATUS.has(entry.status as ProblemStatus))
      continue;
    out[key] = {
      status: entry.status as ProblemStatus,
      code: typeof entry.code === "string" ? entry.code : undefined,
      updatedAt: typeof entry.updatedAt === "string" ? entry.updatedAt : new Date().toISOString(),
    };
  }
  return out;
}

let snapshot: ProgressMap = readStorage();
const listeners = new Set<() => void>();

function readStorage(): ProgressMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? sanitizeProgress(JSON.parse(raw)) : {};
  } catch {
    return {};
  }
}

function write(next: ProgressMap) {
  snapshot = next;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* storage full/unavailable — keep in-memory state */
  }
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot(): ProgressMap {
  return snapshot;
}

export function useCodeLabProgress() {
  const progress = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  const getStatus = useCallback(
    (id: string): ProblemStatus => progress[id]?.status ?? "unsolved",
    [progress],
  );

  const getSavedCode = useCallback(
    (id: string): string | undefined => progress[id]?.code,
    [progress],
  );

  const saveCode = useCallback((id: string, code: string) => {
    const prev = snapshot[id];
    write({
      ...snapshot,
      [id]: {
        status: prev?.status ?? "unsolved",
        code,
        updatedAt: new Date().toISOString(),
      },
    });
  }, []);

  const setStatus = useCallback((id: string, status: ProblemStatus) => {
    const prev = snapshot[id];
    // never downgrade solved -> attempted
    const next = prev?.status === "solved" && status === "attempted" ? "solved" : status;
    write({
      ...snapshot,
      [id]: { status: next, code: prev?.code, updatedAt: new Date().toISOString() },
    });
  }, []);

  const resetProblem = useCallback((id: string) => {
    const next = { ...snapshot };
    delete next[id];
    write(next);
  }, []);

  const solvedCount = Object.values(progress).filter((e) => e.status === "solved").length;

  return { progress, getStatus, getSavedCode, saveCode, setStatus, resetProblem, solvedCount };
}
