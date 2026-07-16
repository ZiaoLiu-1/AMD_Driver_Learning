/* ============================================================
   w-32 (POSIX mmap) dual-backend probe — Phase 0 gate
   ------------------------------------------------------------
   Per references/c-preflight-plan-2026-07-16.md §5: w-32 ships
   ONLY if BOTH judge backends run the FINAL-shape harness
   (feature macro + sysconf + tracked wrappers + two calls) with
   full contract success. Run from a network-unrestricted machine:

       node scripts/probe-mmap-backends.mjs

   Prints per-backend compiler id, UTC time, exit code and
   stdout/stderr — paste the output into the plan appendix.
   Verdict rule: both backends must pass. The bank was frozen at
   32/72 after the recorded Phase-0 pass; reruns guard regressions.
   ============================================================ */

/* This is the FINAL w-32 harness shape (frozen spec §4): learners would
   write plain mmap/munmap, and the macros below intercept every call so the
   judge can (a) prove _SC_PAGESIZE was queried, (b) require mmap's length to
   equal that page size, (c) count map/unmap/outstanding, (d) inject one mmap
   failure, and (e) verify — inside tracked_munmap, BEFORE the real unmap —
   that the whole page carries 0xAB. Wrong unmap lengths are cleaned up with
   the recorded safe length and reported as failures. The shipped harness
   uses this same wrapper/check shape.
   _DEFAULT_SOURCE sits above every system header. */
const PROBE_SOURCE = `#define _DEFAULT_SOURCE
#include <sys/mman.h>
#include <unistd.h>
#include <stdio.h>
#include <stddef.h>

static int g_maps, g_unmaps, g_outstanding, g_fail_next, g_sysconf_calls;
static int g_query_ok = 1, g_map_len_ok = 1, g_unmap_len_ok = 1;
static int g_pattern_ok = 1;
static size_t g_expected_page, g_last_len;

static long tracked_sysconf(int name)
{
    g_sysconf_calls++;
    long raw = sysconf(name);
    if (name != _SC_PAGESIZE || raw <= 0) {
        g_query_ok = 0;
    } else {
        g_expected_page = (size_t)raw;
    }
    return raw;
}

static void *tracked_mmap(void *addr, size_t len, int prot, int flags, int fd, off_t off)
{
    if (!g_expected_page || len != g_expected_page)
        g_map_len_ok = 0;
    if (g_fail_next) { g_fail_next = 0; return MAP_FAILED; }
    void *p = mmap(addr, len, prot, flags, fd, off);
    if (p != MAP_FAILED) { g_maps++; g_outstanding++; g_last_len = len; }
    return p;
}
static int tracked_munmap(void *p, size_t len)
{
    if (!p || p == MAP_FAILED || !g_last_len) {
        g_unmap_len_ok = 0;
        return -1;
    }
    int contract_ok = len == g_last_len;
    if (!contract_ok) g_unmap_len_ok = 0;
    const unsigned char *b = p;
    for (size_t i = 0; i < g_last_len; i++)
        if (b[i] != 0xAB) { g_pattern_ok = 0; break; }
    int r = munmap(p, g_last_len);
    if (r == 0) { g_unmaps++; g_outstanding--; g_last_len = 0; }
    return contract_ok ? r : -1;
}
#define sysconf(n) tracked_sysconf(n)
#define mmap(a, l, p, f, fd, o) tracked_mmap((a), (l), (p), (f), (fd), (o))
#define munmap(p, l) tracked_munmap((p), (l))

/* ---- USER_CODE equivalent (what a learner would submit) ---- */
static int page_roundtrip(void)
{
    long raw = sysconf(_SC_PAGESIZE);
    if (raw <= 0) return -1;
    size_t page = (size_t)raw;

    unsigned char *p = mmap(NULL, page, PROT_READ | PROT_WRITE,
                            MAP_PRIVATE | MAP_ANONYMOUS, -1, 0);
    if (p == MAP_FAILED) return -1;

    for (size_t i = 0; i < page; i++) p[i] = 0xAB;
    for (size_t i = 0; i < page; i++)
        if (p[i] != 0xAB) { munmap(p, page); return -1; }

    return munmap(p, page) == 0 ? 0 : -1;
}
/* ---- end USER_CODE ---- */

int main(void)
{
    int pass = 0, total = 0;
    #define CHECK(label, cond) do { total++; if (cond) { pass++; \\
        printf("[PASS] %s\\n", label); } else printf("[FAIL] %s\\n", label); } while (0)

    CHECK("first roundtrip returns 0", page_roundtrip() == 0);
    CHECK("second roundtrip (reusable)", page_roundtrip() == 0);
    CHECK("mmap used queried page length", g_map_len_ok == 1);
    CHECK("map/unmap balanced", g_maps == 2 && g_unmaps == 2 && g_outstanding == 0);
    CHECK("munmap saw the 0xAB pattern", g_pattern_ok == 1);
    CHECK("munmap length matched map length", g_unmap_len_ok == 1);
    g_fail_next = 1;
    CHECK("injected MAP_FAILED handled", page_roundtrip() == -1);
    CHECK("no leak after injected failure", g_outstanding == 0);
    CHECK("every call queried _SC_PAGESIZE", g_query_ok == 1 && g_sysconf_calls == 3);
    printf("RESULT %d/%d\\n", pass, total);
    return pass == total ? 0 : 1;
}
`;

async function probeGodbolt() {
  const res = await fetch("https://godbolt.org/api/compiler/cg142/compile", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      source: PROBE_SOURCE,
      lang: "c",
      allowStoreCodeDebug: false,
      options: {
        userArguments: "-std=c11 -O1 -Wall -Wextra",
        executeParameters: { args: [], stdin: "" },
        compilerOptions: { executorRequest: true, skipAsm: true },
        filters: { execute: true },
        tools: [],
        libraries: [],
      },
    }),
  });
  const data = await res.json();
  const join = a => (a ?? []).map(l => l.text ?? "").join("\n");
  return {
    backend: "godbolt cg142 (x86-64 gcc 14.2, C)",
    httpStatus: res.status,
    buildCode: data.buildResult?.code ?? null,
    exitCode: data.code ?? null,
    stdout: join(data.stdout),
    stderr: join(data.stderr) || join(data.buildResult?.stderr),
  };
}

async function probeWandbox() {
  const res = await fetch("https://wandbox.org/api/compile.json", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      code: PROBE_SOURCE,
      compiler: "gcc-13.2.0-c",
      options: "warning,c11",
    }),
  });
  const data = await res.json();
  return {
    backend: "wandbox gcc-13.2.0-c",
    httpStatus: res.status,
    buildCode: data.compiler_error ? 1 : 0,
    exitCode: data.status != null ? Number(data.status) : null,
    stdout: data.program_output ?? "",
    stderr: data.program_error ?? data.compiler_error ?? "",
  };
}

const verdict = r =>
  r.buildCode === 0 && r.exitCode === 0 && /RESULT 9\/9/.test(r.stdout)
    ? "PASS"
    : "FAIL";

console.log(`w-32 mmap probe — ${new Date().toISOString()}`);
let allPass = true;
for (const probe of [probeGodbolt, probeWandbox]) {
  try {
    const r = await probe();
    const v = verdict(r);
    if (v !== "PASS") allPass = false;
    console.log(`\n== ${r.backend} — ${v} ==`);
    console.log(`http=${r.httpStatus} build=${r.buildCode} exit=${r.exitCode}`);
    console.log("stdout:\n" + r.stdout.trim());
    if (r.stderr.trim())
      console.log("stderr:\n" + r.stderr.trim().slice(0, 1200));
  } catch (err) {
    allPass = false;
    console.log(`\n== probe error — FAIL ==\n${err}`);
  }
}
console.log(
  allPass
    ? "\nVERDICT: BOTH PASS — w-32 backend contract confirmed (32 problems / 72 total). Record this output in the plan appendix."
    : "\nVERDICT: FAILED — w-32 backend regression; do not release."
);
process.exit(allPass ? 0 : 1);
