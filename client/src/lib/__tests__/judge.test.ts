/* ============================================================
   Judge client unit tests — encodes the 2026-07-16 review gate:
   a program must build, exit 0, and print a complete RESULT
   trailer with zero failures before it can count as solved.
   ============================================================ */
import { describe, it, expect } from "vitest";
import {
  parseTestOutput,
  assembleSource,
  isAccepted,
  type JudgeResult,
  type ParsedTests,
} from "../judge";
import { highlightC } from "@/components/codelab/CodeEditor";

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
      "[PASS] alpha\n[FAIL] beta (expected=1 got=2)\n[PASS] gamma\nRESULT 2/3\n",
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
    const out = parseTestOutput("[PASS] alpha\n[PASS] beta\n");
    expect(out.complete).toBe(false);
    expect(out.passed).toBe(2);
    expect(out.total).toBe(2);
  });

  it("handles empty output", () => {
    const out = parseTestOutput("");
    expect(out.complete).toBe(false);
    expect(out.total).toBe(0);
  });

  it("ignores unrelated stdout noise", () => {
    const out = parseTestOutput("hello\n[PASS] a\ndebug: xyz\nRESULT 1/1\n");
    expect(out.complete).toBe(true);
    expect(out.passed).toBe(1);
    expect(out.cases).toHaveLength(1);
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
  it("substitutes user code into the harness placeholder", () => {
    expect(assembleSource("A\n{{USER_CODE}}\nB", "code")).toBe("A\ncode\nB");
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
