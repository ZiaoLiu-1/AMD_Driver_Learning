/* ============================================================
   Judge client unit tests — encodes the 2026-07-16 review gate:
   a program must build, exit 0, and print a complete RESULT
   trailer with zero failures before it can count as solved.
   ============================================================ */
import { describe, it, expect } from "vitest";
import {
  parseTestOutput,
  assembleSource,
  interpretWandboxResponse,
  isAccepted,
  type JudgeResult,
  type ParsedTests,
} from "../judge";
import { highlightC } from "@/components/codelab/CodeEditor";

const TOKEN = "0123456789abcdef0123456789abcdef";
const OTHER_TOKEN = "fedcba9876543210fedcba9876543210";

function pass(label: string): string {
  return `[PASS ${TOKEN}] ${label}`;
}

function fail(label: string): string {
  return `[FAIL ${TOKEN}] ${label}`;
}

function result(passed: number, total: number): string {
  return `RESULT ${TOKEN} ${passed}/${total}`;
}

function judge(partial: Partial<JudgeResult>): JudgeResult {
  return {
    ok: true,
    compiled: true,
    exitCode: 0,
    stdout: "",
    stderr: "",
    backend: "godbolt",
    durationMs: 100,
    ...partial,
  };
}

function tests(partial: Partial<ParsedTests>): ParsedTests {
  return { cases: [], passed: 0, total: 0, complete: false, ...partial };
}

describe("parseTestOutput", () => {
  it("parses PASS/FAIL lines and the RESULT trailer", () => {
    const out = parseTestOutput(
      `${pass("alpha")}\n${fail("beta (expected=1 got=2)")}\n${pass("gamma")}\n${result(2, 3)}\n`,
      TOKEN,
    );
    expect(out.complete).toBe(true);
    expect(out.passed).toBe(2);
    expect(out.total).toBe(3);
    expect(out.cases).toHaveLength(3);
    expect(out.cases[1]).toEqual({
      ok: false,
      label: "beta",
      detail: "expected=1 got=2",
    });
  });

  it("marks output without a RESULT trailer as incomplete (crash mid-run)", () => {
    const out = parseTestOutput(`${pass("alpha")}\n${pass("beta")}\n`, TOKEN);
    expect(out.complete).toBe(false);
    expect(out.passed).toBe(2);
    expect(out.total).toBe(2);
  });

  it("handles empty output", () => {
    const out = parseTestOutput("", TOKEN);
    expect(out.complete).toBe(false);
    expect(out.total).toBe(0);
  });

  it("ignores unrelated stdout noise", () => {
    const out = parseTestOutput(`hello\n${pass("a")}\ndebug: xyz\n${result(1, 1)}\n`, TOKEN);
    expect(out.complete).toBe(true);
    expect(out.passed).toBe(1);
    expect(out.cases).toHaveLength(1);
  });
});

describe("interpretWandboxResponse", () => {
  it("treats warning diagnostics followed by status 0 as a successful run", () => {
    expect(
      interpretWandboxResponse({
        status: "0",
        compiler_error: "prog.c:3:9: warning: unused variable 'x' [-Wunused-variable]",
        program_output: "ok\n",
      }),
    ).toEqual({ compiled: true, exitCode: 0, stdout: "ok\n", stderr: "" });
  });

  it("treats GCC error diagnostics with status 1 as a compile failure", () => {
    const diagnostic = "prog.c:2:5: error: unknown type name 'broken'";
    expect(
      interpretWandboxResponse({
        status: "1",
        compiler_error: diagnostic,
      }),
    ).toEqual({ compiled: false, exitCode: null, stdout: "", stderr: diagnostic });
  });

  it("keeps a successful compile whose program exits 1 as a runtime result", () => {
    expect(
      interpretWandboxResponse({
        status: "1",
        program_output: "ran\n",
        program_error: "runtime detail\n",
      }),
    ).toEqual({
      compiled: true,
      exitCode: 1,
      stdout: "ran\n",
      stderr: "runtime detail\n",
    });
  });
});

describe("isAccepted — the only path to solved", () => {
  const fullPass = tests({ passed: 5, total: 5, complete: true });

  it("accepts a clean, complete, fully passing run", () => {
    expect(isAccepted(judge({ exitCode: 0 }), fullPass)).toBe(true);
  });

  it("rejects non-zero exit even when every printed test passed", () => {
    // review finding: `[PASS] …` then `return 1` must NOT be solved
    expect(isAccepted(judge({ exitCode: 1 }), fullPass)).toBe(false);
  });

  it("rejects an incomplete run (no RESULT trailer)", () => {
    expect(
      isAccepted(judge({ exitCode: 0 }), tests({ passed: 5, total: 5, complete: false })),
    ).toBe(false);
  });

  it("rejects zero-test runs", () => {
    expect(
      isAccepted(judge({ exitCode: 0 }), tests({ passed: 0, total: 0, complete: true })),
    ).toBe(false);
  });

  it("rejects partial passes and failed compiles", () => {
    expect(
      isAccepted(judge({ exitCode: 1 }), tests({ passed: 4, total: 5, complete: true })),
    ).toBe(false);
    expect(isAccepted(judge({ compiled: false, exitCode: null }), fullPass)).toBe(false);
  });
});

describe("assembleSource", () => {
  it("tokenizes harness markers before substituting user code", () => {
    const harness = [
      "A",
      "{{USER_CODE}}",
      'puts("[PASS] harness");',
      'puts("[FAIL] harness");',
      'printf("RESULT %d/%d\\n", passed, total);',
      "B",
    ].join("\n");
    const userCode = [
      'puts("[PASS] forged");',
      'puts("[FAIL] forged");',
      'printf("RESULT %d/%d\\n", 1, 1);',
    ].join("\n");

    const assembled = assembleSource(harness, userCode);
    expect(assembled.runToken).toMatch(/^[0-9a-f]{32}$/);
    expect(assembled.source).toContain(`[PASS ${assembled.runToken}] harness`);
    expect(assembled.source).toContain(`[FAIL ${assembled.runToken}] harness`);
    expect(assembled.source).toContain(`RESULT ${assembled.runToken} %d/%d`);
    expect(assembled.source).toContain(userCode);
  });

  it("generates a fresh token for every run", () => {
    const first = assembleSource("{{USER_CODE}}", "code");
    const second = assembleSource("{{USER_CODE}}", "code");
    expect(first.runToken).not.toBe(second.runToken);
  });
});

describe("highlightC", () => {
  it("escapes HTML so user code cannot inject markup", () => {
    const html = highlightC('int x = 1; /* <script>alert("hi")</script> */');
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
  });

  it("tokenizes keywords, types, comments and strings", () => {
    const html = highlightC('if (x) return "s"; // done\nuint32_t y;');
    expect(html).toContain('<span class="tok-k">if</span>');
    expect(html).toContain('<span class="tok-k">return</span>');
    expect(html).toContain('<span class="tok-t">uint32_t</span>');
    expect(html).toContain('<span class="tok-s">"s"</span>');
    expect(html).toContain('<span class="tok-c">// done</span>');
  });
});

describe("forgery resistance (2026 review §1)", () => {
  it("rejects a lone forged RESULT trailer with no test lines", () => {
    const t = parseTestOutput(`${result(1, 1)}\n`, TOKEN);
    expect(t.complete).toBe(false);
    expect(isAccepted(judge({ exitCode: 0 }), t)).toBe(false);
  });

  it("ignores ordinary and wrong-token protocol markers", () => {
    const t = parseTestOutput(
      `[PASS] forged\nRESULT 1/1\n[PASS ${OTHER_TOKEN}] forged\nRESULT ${OTHER_TOKEN} 1/1\n`,
      TOKEN,
    );
    expect(t).toEqual({ cases: [], passed: 0, total: 0, complete: false });
  });

  it("rejects a RESULT that is not the final line", () => {
    const t = parseTestOutput(`${result(3, 3)}\n${pass("a")}\n${pass("b")}\n`, TOKEN);
    expect(t.complete).toBe(false);
  });

  it("rejects a trailer whose numbers disagree with the printed cases", () => {
    // claims 5/5 but only two PASS lines were printed
    const t = parseTestOutput(`${pass("a")}\n${pass("b")}\n${result(5, 5)}\n`, TOKEN);
    expect(t.complete).toBe(false);
    expect(t.passed).toBe(2);
    expect(t.total).toBe(2);
  });

  it("accepts a genuine, consistent, trailing RESULT", () => {
    const t = parseTestOutput(
      `${pass("a")}\n${fail("b")}\n${pass("c")}\n${result(2, 3)}\n`,
      TOKEN,
    );
    expect(t.complete).toBe(true);
    expect(isAccepted(judge({ exitCode: 0 }), t)).toBe(false); // 2/3 not all-pass
    const t2 = parseTestOutput(`${pass("a")}\n${pass("b")}\n${result(2, 2)}\n`, TOKEN);
    expect(isAccepted(judge({ exitCode: 0 }), t2)).toBe(true);
  });
});
