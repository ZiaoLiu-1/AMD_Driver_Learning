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
  /** true when a tokenized `RESULT p/t` trailer was found AS THE LAST LINE
      and its numbers agree with the tokenized [PASS]/[FAIL] lines. */
  complete: boolean;
}

export interface AssembledSource {
  source: string;
  /** Per-run capability used to authenticate the harness output protocol. */
  runToken: string;
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

export interface WandboxApiResponse {
  status?: string;
  compiler_error?: string;
  compiler_output?: string;
  program_output?: string;
  program_error?: string;
}

export interface WandboxExecutionResult {
  compiled: boolean;
  exitCode: number | null;
  stdout: string;
  stderr: string;
}

/**
 * Convert Wandbox's ambiguous response shape into build/runtime semantics.
 * Wandbox puts warnings and errors in `compiler_error`, while `status` is the
 * compiler's status when compilation fails and the program's status when it
 * runs. GCC diagnostic severity is therefore the discriminator.
 */
export function interpretWandboxResponse(data: WandboxApiResponse): WandboxExecutionResult {
  const diagnostics = [data.compiler_error, data.compiler_output].filter(Boolean).join("\n");
  const hasCompilerError = diagnostics
    .split("\n")
    .some((line) => /^(?:[^:\n]+:)+\s*(?:fatal\s+)?error:/i.test(line));

  if (hasCompilerError) {
    return {
      compiled: false,
      exitCode: null,
      stdout: "",
      stderr: diagnostics || "compile failed",
    };
  }

  const hasStatus = data.status != null && data.status !== "";
  if (!hasStatus) {
    return {
      compiled: false,
      exitCode: null,
      stdout: "",
      stderr: diagnostics || "compile failed",
    };
  }

  const parsedStatus = Number(data.status);
  return {
    compiled: true,
    exitCode: Number.isFinite(parsedStatus) ? parsedStatus : null,
    stdout: data.program_output ?? "",
    stderr: data.program_error ?? "",
  };
}

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
  const data = (await res.json()) as WandboxApiResponse;
  const durationMs = performance.now() - started;
  const execution = interpretWandboxResponse(data);
  return {
    ok: true,
    ...execution,
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

function createRunToken(): string {
  const bytes = new Uint8Array(16);
  globalThis.crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

/**
 * Authenticate harness protocol markers, then substitute the user's code.
 * Applying the token before substitution ensures user-authored marker strings
 * are never silently upgraded into trusted harness output.
 */
export function assembleSource(harness: string, userCode: string): AssembledSource {
  const runToken = createRunToken();
  const authenticatedHarness = harness
    .replaceAll("[PASS]", `[PASS ${runToken}]`)
    .replaceAll("[FAIL]", `[FAIL ${runToken}]`)
    .replaceAll("RESULT %d/%d", `RESULT ${runToken} %d/%d`);
  return {
    source: authenticatedHarness.replace("{{USER_CODE}}", userCode),
    runToken,
  };
}

/**
 * Parse the harness protocol from stdout:
 *   [PASS token] label          — one line per passing check
 *   [FAIL token] label (detail) — one line per failing check
 *   RESULT token passed/total   — trailer emitted by the harness
 */
export function parseTestOutput(stdout: string, runToken: string): ParsedTests {
  const cases: TestCaseResult[] = [];
  let passed = 0;
  let total = 0;
  let complete = false;

  if (!/^[0-9a-f]{32}$/.test(runToken)) return { cases, passed, total, complete };

  const passPrefix = `[PASS ${runToken}] `;
  const failPrefix = `[FAIL ${runToken}] `;
  const resultPrefix = `RESULT ${runToken} `;

  const lines = stdout.split("\n").map((l) => l.trimEnd());
  // The trailer must be the LAST non-empty line — a mid-stream RESULT
  // (e.g. printed by user code before more output, or an early exit)
  // does not count. This closes the `puts("RESULT 1/1"); exit(0)` forgery.
  let lastIdx = lines.length - 1;
  while (lastIdx >= 0 && lines[lastIdx] === "") lastIdx--;

  for (let i = 0; i <= lastIdx; i++) {
    const line = lines[i];
    if (line.startsWith(passPrefix)) {
      cases.push({ ok: true, label: line.slice(passPrefix.length) });
    } else if (line.startsWith(failPrefix)) {
      const rest = line.slice(failPrefix.length);
      const paren = rest.indexOf(" (");
      cases.push(
        paren > 0
          ? { ok: false, label: rest.slice(0, paren), detail: rest.slice(paren + 2, -1) }
          : { ok: false, label: rest },
      );
    } else if (i === lastIdx && line.startsWith(resultPrefix)) {
      const m = /^(\d+)\/(\d+)$/.exec(line.slice(resultPrefix.length));
      if (m) {
        passed = Number(m[1]);
        total = Number(m[2]);
        complete = true;
      }
    }
  }

  // Consistency audit: the trailer's numbers must match the case lines
  // actually seen. A forged trailer with no (or mismatched) [PASS]/[FAIL]
  // lines is downgraded to incomplete.
  if (complete) {
    const seenPassed = cases.filter((c) => c.ok).length;
    if (cases.length !== total || seenPassed !== passed) complete = false;
  }
  if (!complete && cases.length > 0) {
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
