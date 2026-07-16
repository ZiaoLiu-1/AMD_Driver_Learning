/* ============================================================
   Code Lab problem verification + mutation regression
   ------------------------------------------------------------
   Requires a local C/C++ toolchain invokable as `gcc`/`g++`
   (on macOS these are typically Apple Clang, NOT GNU GCC 14 —
   close enough for -std=c11/-std=c++17 semantics, but the
   authoritative check remains the judge's real Godbolt path).
   Sanitizer coverage also varies by platform: LeakSanitizer is
   unavailable on macOS ASan, so leak detection there relies on
   the harness counters rather than ASan. Not wired into vitest
   because CI may lack a toolchain — run manually before
   releasing problem changes:

       pnpm verify:problems

   Two phases:
   1. Reference solutions: every problem in the bank must compile, run,
      print a full `RESULT n/n`, and exit 0 — once plain and once under
      combined AddressSanitizer + UndefinedBehaviorSanitizer (catches
      memory errors, bad shifts and signed overflow; leaks where the
      platform supports LeakSanitizer).
   2. Mutation regression: known-bad implementations (the exact
      failure modes found in the 2026-07-16 review) must be KILLED
      by the harnesses — either failing to compile or failing at
      runtime (mutants run under ASan+UBSan so memory/UB bugs die loudly).
   ============================================================ */
import { execFileSync } from "node:child_process";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const dataDir = join(root, "client", "src", "data");
const work = mkdtempSync(join(tmpdir(), "codelab-verify-"));

/* ---------- load the problem bank via esbuild ---------- */
async function loadProblems() {
  const out = join(work, "problems.mjs");
  await build({
    entryPoints: [join(dataDir, "code_problems_index.ts")],
    bundle: true,
    format: "esm",
    platform: "node",
    outfile: out,
    logLevel: "silent",
  });
  const mod = await import(out);
  return mod.loadAllProblems();
}

/* ---------- compile & run helpers ---------- */
function compileAndRun(problem, userCode, { asan = false, ubsan = false } = {}) {
  const ext = problem.language === "c" ? "c" : "cpp";
  const cc = problem.language === "c" ? "gcc" : "g++";
  const std = problem.language === "c" ? "-std=c11" : "-std=c++17";
  const srcPath = join(work, `case.${ext}`);
  const binPath = join(work, "case.bin");
  writeFileSync(srcPath, problem.harness.replace("{{USER_CODE}}", userCode));
  const flags = [std, "-O1", "-Wall", "-Wextra", "-o", binPath, srcPath];
  const san = [];
  if (asan) san.push("address");
  if (ubsan) san.push("undefined");
  // UBSan must abort (not just warn) so a signed-overflow etc. fails the run.
  const env = ubsan
    ? { ...process.env, UBSAN_OPTIONS: "halt_on_error=1:abort_on_error=1" }
    : process.env;
  if (san.length) flags.unshift(`-fsanitize=${san.join(",")}`, "-g");
  try {
    execFileSync(cc, flags, { stdio: ["ignore", "pipe", "pipe"] });
  } catch (e) {
    return { stage: "compile", ok: false, detail: String(e.stderr).slice(0, 800) };
  }
  try {
    const stdout = execFileSync(binPath, { encoding: "utf8", timeout: 10_000, env });
    const m = stdout.match(/RESULT (\d+)\/(\d+)/);
    const accepted = !!m && m[1] === m[2] && Number(m[2]) > 0;
    return { stage: "run", ok: accepted, detail: m ? m[0] : "(no RESULT trailer)", stdout };
  } catch (e) {
    return { stage: "run", ok: false, detail: `exit=${e.status}`, stdout: e.stdout ?? "" };
  }
}

/* ---------- mutation catalogue ----------
   Each mutant applies exact-string replacements to the reference
   solution. A missing anchor is an error (so refactors cannot
   silently retire a mutant). A mutant is KILLED when it fails to
   compile or fails the harness. */
const MUTANTS = [
  {
    id: "w-21",
    name: "frees a decoy calloc then returns a manually-zeroed malloc block at a reused address",
    patch: (s) =>
      s.replace(
        "return calloc((size_t)n, sizeof(int));",
        `int *decoy = calloc((size_t)n, sizeof(int));
    if (!decoy)
        return NULL;
    free(decoy);
    int *p = malloc((size_t)n * sizeof(int));
    if (!p)
        return NULL;
    for (int i = 0; i < n; i++)
        p[i] = 0;
    return p;`,
      ),
  },
  {
    id: "w-14",
    name: "reverse walks only half-heartedly (i <= j self-swap masks nothing, i < j-1 skips pairs)",
    patch: (s) => s.replace("while (i < j) {", "while (i < j - 1) {"),
  },
  {
    id: "w-23",
    name: "realloc overwrites *arr directly (caller pointer corrupted on failure)",
    patch: (s) =>
      s.replace(
        "int *tmp = realloc(*arr, (size_t)new_n * sizeof(int));\n    if (!tmp)\n        return -ENOMEM;",
        "*arr = realloc(*arr, (size_t)new_n * sizeof(int));\n    if (!*arr)\n        return -ENOMEM;\n    int *tmp = *arr;",
      ),
  },
  {
    id: "w-27",
    name: "binary search keeps mid in the interval (no shrink -> hangs; killed by timeout)",
    patch: (s) => s.replace("lo = mid + 1;", "lo = mid;"),
  },
  {
    id: "w-32",
    name: "checks mmap against NULL and skips munmap (failure path + resource leak)",
    patch: (s) =>
      s
        .replace("if (p == MAP_FAILED)", "if (p == NULL)")
        .replace("return munmap(p, page) == 0 ? 0 : -1;", "return 0;"),
  },
  {
    id: "w-32",
    name: "queries page size but maps, writes, verifies and unmaps only one byte",
    patch: (s) =>
      s
        .replace(
          "mmap(NULL, page, PROT_READ | PROT_WRITE,",
          "mmap(NULL, 1, PROT_READ | PROT_WRITE,",
        )
        .replaceAll("i < page", "i < 1")
        .replaceAll("munmap(p, page)", "munmap(p, 1)"),
  },
  {
    id: "k-12",
    name: "unmasked ring writes + no completeness check (original review finding)",
    patch: (s) =>
      s
        .replace("r->buf[r->wptr & (RING_WORDS - 1)] = mk_header(opcode, len);", "r->buf[r->wptr] = mk_header(opcode, len);")
        .replace("r->buf[r->wptr & (RING_WORDS - 1)] = payload[i];", "r->buf[r->wptr] = payload[i];")
        .replace("while (r->rptr != r->wptr) {", "while (r->rptr < r->wptr) {")
        .replace(/if \(len \+ 1 > used\)[\s\S]*?return -EINVAL;\n/, ""),
  },
  {
    id: "k-12",
    name: "consumes incomplete packets (rptr can pass wptr)",
    patch: (s) => s.replace(/if \(len \+ 1 > used\)[\s\S]*?return -EINVAL;\n/, ""),
  },
  {
    id: "c-16",
    name: "device_destroy is an empty stub",
    patch: (s) =>
      s.replace(/void device_destroy\(struct device \*dev\)\n\{[\s\S]*?\n\}/, "void device_destroy(struct device *dev)\n{\n    (void)dev;\n}"),
  },
  {
    id: "c-16",
    name: "no rollback on mid-way allocation failure",
    patch: (s) => s.replace("err_rollback:\n    device_destroy(dev);", "err_rollback:;\n"),
  },
  {
    id: "c-15",
    name: "realloc result overwrites data pointer directly (leak + bricked vec)",
    patch: (s) =>
      s.replace(
        "uint32_t *tmp = mem_realloc(v->data, new_cap * sizeof(*tmp));\n        if (!tmp)\n            return -ENOMEM;\n        v->data = tmp;",
        "v->data = mem_realloc(v->data, new_cap * sizeof(*v->data));\n        if (!v->data)\n            return -ENOMEM;",
      ),
  },
  {
    id: "c-14",
    name: "run_jobs hardcodes gfx instead of generic ops dispatch",
    patch: (s) => s.replace("int ret = ops->submit(ctx, jobs[i]);", "int ret = gfx_ops.submit(ctx, jobs[i]);"),
  },
  {
    id: "c-08",
    name: "memcpy copies only the first byte",
    patch: (s) =>
      s.replace(
        "const unsigned char *s = src;\n    while (n--)\n        *d++ = *s++;",
        "const unsigned char *s = src;\n    if (n)\n        *d = *s;",
      ),
  },
  {
    id: "cpp-04",
    name: "copy assignment leaks the old buffer",
    patch: (s) => s.replace("memcpy(fresh, o.data_, o.n_);\n        delete[] data_;", "memcpy(fresh, o.data_, o.n_);"),
  },
  {
    id: "cpp-03",
    name: "guard left copyable (killed at compile time by static_assert)",
    patch: (s) =>
      s
        .replace("RegionGuard(const RegionGuard &) = delete;\n", "")
        .replace("RegionGuard &operator=(const RegionGuard &) = delete;\n", ""),
  },
  {
    id: "cpp-06",
    name: "moves not marked noexcept (killed at compile time by nothrow asserts)",
    patch: (s) =>
      s
        .replace("UniquePtr(UniquePtr &&o) noexcept : p_(o.p_)", "UniquePtr(UniquePtr &&o) : p_(o.p_)")
        .replace("UniquePtr &operator=(UniquePtr &&o) noexcept", "UniquePtr &operator=(UniquePtr &&o)"),
  },
  {
    id: "cpp-06",
    name: "reset without the self-reset guard (UAF under ASan)",
    patch: (s) =>
      s.replace(
        "if (p != p_) {\n            delete p_;\n            p_ = p;\n        }",
        "delete p_;\n        p_ = p;",
      ),
  },
];

/* ---------- main ----------
   Env knobs for chunked runs on slow machines/CI:
     ONLY=<regex>   verify only matching problem ids (phase 1)
     SKIP_MUTANTS=1 skip phase 2 */
const problems = await loadProblems();
const only = process.env.ONLY ? new RegExp(process.env.ONLY) : null;
const phase1 = only ? problems.filter((p) => only.test(p.id)) : problems;
let failures = 0;

console.log("== Phase 1: reference solutions (plain + ASan + UBSan) ==");
for (const p of phase1) {
  const plain = compileAndRun(p, p.solution);
  // ASan + UBSan together: catches memory errors AND undefined behavior
  // (signed overflow, bad shifts) that the plain build silently tolerates.
  const san = compileAndRun(p, p.solution, { asan: true, ubsan: true });
  const ok = plain.ok && san.ok;
  if (!ok) {
    failures++;
    console.log(`  FAIL ${p.id}: plain=${plain.stage}:${plain.detail} san=${san.stage}:${san.detail}`);
    if (plain.stdout) console.log(String(plain.stdout).slice(0, 600));
    if (san.stdout) console.log(String(san.stdout).slice(0, 600));
  } else {
    console.log(`  ok ${p.id} ${plain.detail}`);
  }
}

console.log("== Phase 2: mutation regression (every mutant must be killed) ==");
for (const m of process.env.SKIP_MUTANTS ? [] : MUTANTS) {
  const p = problems.find((x) => x.id === m.id);
  const mutated = m.patch(p.solution);
  if (mutated === p.solution) {
    failures++;
    console.log(`  ERROR ${m.id}: mutant anchor not found — "${m.name}"`);
    continue;
  }
  const res = compileAndRun(p, mutated, { asan: true, ubsan: true });
  if (res.ok) {
    failures++;
    console.log(`  SURVIVED ${m.id}: "${m.name}" — harness must be strengthened`);
  } else {
    console.log(`  killed ${m.id} (${res.stage}) — ${m.name}`);
  }
}

rmSync(work, { recursive: true, force: true });
if (failures > 0) {
  console.error(`\n${failures} failure(s).`);
  process.exit(1);
}
console.log(
  `\nVerified ${phase1.length}/${problems.length} solutions` +
    (process.env.SKIP_MUTANTS ? " (mutants skipped)." : `; all ${MUTANTS.length} mutants killed.`),
);
