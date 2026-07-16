/* The auto-generated list catalog must stay a faithful, harness-free subset
   of the full problem banks. If this fails, run `node scripts/gen-catalog.mjs`. */
import { describe, it, expect } from "vitest";
import { loadAllProblems } from "../code_problems_index";
import { toCatalogEntry } from "../code_problems_catalog";
import { problemCatalog } from "../code_problems_catalog_data";

describe("catalog sync", () => {
  it("matches the full banks entry-for-entry (regenerate if this fails)", async () => {
    const problems = await loadAllProblems();
    const expected = problems.map(toCatalogEntry);
    expect(problemCatalog).toEqual(expected);
  });

  it("carries no heavy fields", () => {
    for (const e of problemCatalog as unknown as Record<string, unknown>[]) {
      expect(e.harness).toBeUndefined();
      expect(e.solution).toBeUndefined();
      expect(e.description).toBeUndefined();
      expect(e.starterCode).toBeUndefined();
    }
  });
});
