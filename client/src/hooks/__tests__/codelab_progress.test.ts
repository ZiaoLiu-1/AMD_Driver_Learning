/* ============================================================
   Code Lab progress storage — schema validation tests.
   Review finding: writing `"null"` into localStorage crashed the
   Code Lab. sanitizeProgress must tolerate any user-writable shape.
   ============================================================ */
import { describe, it, expect } from "vitest";
import { sanitizeProgress, isKnownProblemId } from "../useCodeLabProgress";

describe("sanitizeProgress", () => {
  it("survives JSON.parse('null')", () => {
    expect(sanitizeProgress(JSON.parse("null"))).toEqual({});
  });

  it("rejects non-object roots", () => {
    expect(sanitizeProgress("solved")).toEqual({});
    expect(sanitizeProgress(42)).toEqual({});
    expect(sanitizeProgress([{ status: "solved" }])).toEqual({});
    expect(sanitizeProgress(undefined)).toEqual({});
  });

  it("drops malformed entries but keeps valid ones", () => {
    const out = sanitizeProgress({
      "c-01": { status: "solved", code: "int x;", updatedAt: "2026-07-16T00:00:00Z" },
      "c-02": null,
      "c-03": "attempted",
      "c-04": { status: "hacked" },
      "c-05": { status: "attempted", code: 123, updatedAt: 5 },
      "c-06": [1, 2],
    });
    expect(Object.keys(out).sort()).toEqual(["c-01", "c-05"]);
    expect(out["c-01"]).toEqual({
      status: "solved",
      code: "int x;",
      updatedAt: "2026-07-16T00:00:00Z",
    });
    // non-string code/updatedAt are normalized, not trusted
    expect(out["c-05"].status).toBe("attempted");
    expect(out["c-05"].code).toBeUndefined();
    expect(typeof out["c-05"].updatedAt).toBe("string");
  });

  it("keeps all three legal statuses", () => {
    const out = sanitizeProgress({
      "c-01": { status: "unsolved" },
      "cpp-01": { status: "attempted" },
      "k-01": { status: "solved" },
    });
    expect(Object.keys(out)).toHaveLength(3);
  });

  it("drops forged problem ids so progress can never exceed the bank", () => {
    const forged: Record<string, { status: string }> = {};
    for (let i = 1; i <= 99; i++) forged[`c-${String(i).padStart(2, "0")}`] = { status: "solved" };
    forged["cpp-13"] = { status: "solved" };
    forged["k-00"] = { status: "solved" };
    forged["x-01"] = { status: "solved" };
    forged["c-1"] = { status: "solved" };
    forged["evil"] = { status: "solved" };
    const out = sanitizeProgress(forged);
    // only c-01..c-16 survive
    expect(Object.keys(out)).toHaveLength(16);
    expect(out["c-16"]).toBeDefined();
    expect(out["c-17"]).toBeUndefined();
  });

  it("id ranges cover the full real bank", () => {
    expect(isKnownProblemId("c-01") && isKnownProblemId("c-16")).toBe(true);
    expect(isKnownProblemId("cpp-01") && isKnownProblemId("cpp-12")).toBe(true);
    expect(isKnownProblemId("k-01") && isKnownProblemId("k-12")).toBe(true);
    expect(isKnownProblemId("c-17") || isKnownProblemId("cpp-13") || isKnownProblemId("k-13")).toBe(
      false,
    );
  });
});
