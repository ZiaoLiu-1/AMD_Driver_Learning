/* ============================================================
   Code Lab — remote compile & execute client
   Primary backend: Compiler Explorer (godbolt.org) public API.
   Fallback: Wandbox. Both are free public services; source
   code is sent to them for compilation. No accounts, no keys —
   this is what makes the in-browser lab work with zero setup.
   (Piston was removed 2026-07: its public API now requires
   allowlisted keys and returns 401.)
   ============================================================ */

export type JudgeLanguage = "c" | "cpp";

export interface JudgeResult {
  /** A backend accepted the request and returned a result. */
  ok: boolean;
  /** Compilation succeeded (link + build). */
  compiled: boolean;
  /** Program exit code (null if it never ran). */
  exitCode: number | null;
  stdout: string;
  /** Compiler diagnostics when compilation failed; runtime stderr otherwise. */
  stderr: string;
  backend: "godbolt" | "wandbox";
  durationMs: number;
}

export interface TestCaseResult {
  ok: boolean;
  label: string;
  detail?: string;
}

export interface ParsedTests {
  cases: TestCaseResult[];
  passed: number;
  total: number;
  /** true when a `RESULT p/t` trailer line was found. */
  complete: boolean;
}

const TIMEOUT_MS = 25_000;

const GODBOLT_COMPILER: Record<JudgeLanguage, string> = {
  c: "cg142", // x86-64 gcc 14.2 (C)
  cpp: "g142", // x86-64 gcc 14.2 (C++)
};

const FLAGS: Record<JudgeLanguage, string> = {
  c: "-std=c11 -O1 -Wall -Wextra",
  cpp: "-std=c++17 -O1 -Wall -Wextra",
};

function withTimeout(): AbortSignal | undefined {
  try {
    return AbortSignal.timeout(TIMEOUT_MS);
  } catch {
    return undefined;
  }
}

function joinTextLines(arr: unknown): string {
  if (!Array.isArray(arr)) return "";
  return arr
    .map((l) => (typeof l === "string" ? l : ((l as { text?: string })?.text ?? "")))
    .join("\n");
}

/* ---------------- Godbolt (Compiler Explorer) ---------------- */

async function runGodbolt(language: JudgeLanguage, source: string): Promise<JudgeResult> {
  const started = performance.now();
  const res = await fetch(
    `https://godbolt.org/api/compiler/${GODBOLT_COMPILER[language]}/compile`,
    {
      method: "POST",
      signal: withTimeout(),
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        source,
        lang: language === "c" ? "c" : "c++",
        allowStoreCodeDebug: false,
        options: {
          userArguments: FLAGS[language],
          executeParameters: { args: [], stdin: "" },
          compilerOptions: { executorRequest: true, skipAsm: true },
          filters: { execute: true },
          tools: [],
          libraries: [],
        },
      }),
    },
  );
  if (!res.ok) throw new Error(`godbolt HTTP ${res.status}`);
  const data = (await res.json()) as {
    code?: number;
    didExecute?: boolean;
    stdout?: unknown;
    stderr?: unknown;
    buildResult?: { code?: number; stderr?: unknown; stdout?: unknown };
  };
  const durationMs = performance.now() - started;
  const buildCode = data.buildResult?.code ?? 0;
  const compiled = buildCode === 0;
  if (!compiled) {
    return {
      ok: true,
      compiled: false,
      exitCode: null,
      stdout: "",
      stderr:
        joinTextLines(data.buildResult?.stderr) || joinTextLines(data.stderr) || "compile failed",
      backend: "godbolt",
      durationMs,
    };
  }
  return {
    ok: true,
    compiled: true,
    exitCode: typeof data.code === "number" ? data.code : data.didExecute ? 0 : null,
    stdout: joinTextLines(data.stdout),
    stderr: joinTextLines(data.stderr),
    backend: "godbolt",
    durationMs,
  };
}

/* ---------------- Wandbox ---------------- */

const WANDBOX_COMPILER: Record<JudgeLanguage, string> = {
  c: "gcc-13.2.0-c",
  cpp: "gcc-13.2.0",
};

async function runWandbox(language: JudgeLanguage, source: string): Promise<JudgeResult> {
  const started = performance.now();
  const res = await fetch("https://wandbox.org/api/compile.json", {
    method: "POST",
    signal: withTimeout(),
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      code: source,
      compiler: WANDBOX_COMPILER[language],
      options: language === "c" ? "warning,c11" : "warning,c++17",
    }),
  });
  if (!res.ok) throw new Error(`wandbox HTTP ${res.status}`);
  const data = (await res.json()) as {
    status?: string;
    compiler_error?: string;
    compiler_output?: string;
    program_output?: string;
    program_error?: string;
  };
  const durationMs = performance.now() - started;
  const compiled = !data.compiler_error;
  return {
    ok: true,
    compiled,
    exitCode: compiled && data.status != null ? Number(data.status) : null,
    stdout: data.program_output ?? "",
    stderr: compiled ? (data.program_error ?? "") : (data.compiler_error ?? ""),
    backend: "wandbox",
    durationMs,
  };
}

/* ---------------- Public API ---------------- */

/**
 * Compile & run `source` remotely. Tries Godbolt first, then falls back.
 * Throws only when every backend is unreachable.
 */
export async function runCode(language: JudgeLanguage, source: string): Promise<JudgeResult> {
  const backends = [runGodbolt, runWandbox];
  let lastError: unknown;
  for (const backend of backends) {
    try {
      return await backend(language, source);
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError instanceof Error ? lastError : new Error("all judge backends failed");
}

/** Substitute the user's code into a problem's test harness. */
export function assembleSource(harness: string, userCode: string): string {
  return harness.replace("{{USER_CODE}}", userCode);
}

/**
 * Parse the harness protocol from stdout:
 *   [PASS] label            — one line per passing check
 *   [FAIL] label (detail)   — one line per failing check
 *   RESULT passed/total     — trailer emitted by the harness
 */
export function parseTestOutput(stdout: string): ParsedTests {
  const cases: TestCaseResult[] = [];
  let passed = 0;
  let total = 0;
  let complete = false;
  for (const raw of stdout.split("\n")) {
    const line = raw.trimEnd();
    if (line.startsWith("[PASS] ")) {
      cases.push({ ok: true, label: line.slice(7) });
    } else if (line.startsWith("[FAIL] ")) {
      const rest = line.slice(7);
      const paren = rest.indexOf(" (");
      cases.push(
        paren > 0
          ? { ok: false, label: rest.slice(0, paren), detail: rest.slice(paren + 2, -1) }
          : { ok: false, label: rest },
      );
    } else {
      const m = /^RESULT (\d+)\/(\d+)$/.exec(line);
      if (m) {
        passed = Number(m[1]);
        total = Number(m[2]);
        complete = true;
      }
    }
  }
  if (!complete) {
    passed = cases.filter((c) => c.ok).length;
    total = cases.length;
  }
  return { cases, passed, total, complete };
}

/**
 * Strict accept condition — the ONLY path to "solved".
 * Requires: successful build, a clean exit (0), the harness's
 * `RESULT p/t` trailer actually printed (i.e. the test run was
 * not aborted mid-way), at least one check, and zero failures.
 * A program that prints a few [PASS] lines and then crashes or
 * `return 1`s is NOT accepted.
 */
export function isAccepted(judge: JudgeResult, tests: ParsedTests): boolean {
  return (
    judge.compiled &&
    judge.exitCode === 0 &&
    tests.complete &&
    tests.total > 0 &&
    tests.passed === tests.total
  );
}
