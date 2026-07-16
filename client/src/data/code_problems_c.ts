/* ============================================================
   Code Lab — Track 1: C 核心 (C Core), 16 problems
   LeetCode-style drills with amdgpu/kernel flavor.
   All problems compile as C11 and run against the harness
   protocol described in code_problems_types.ts.
   ============================================================ */
import type { CodeProblem } from "./code_problems_types";

export const codeProblemsC: CodeProblem[] = [
  {
    id: "c-01",
    track: "c",
    number: 1,
    title: "寄存器转储行",
    titleEn: "Register Dump Line",
    difficulty: "easy",
    minutes: 10,
    tags: ["printf", "hex", "snprintf"],
    tagsEn: ["printf", "hex", "snprintf"],
    lessonId: "cc-c-4",
    brief: "用 snprintf 输出一行标准格式的寄存器转储——驱动调试的第一课。",
    briefEn: "Format one register-dump line with snprintf — debugging lesson zero.",
    description: [
      '驱动出问题时，工程师最先看的就是寄存器转储（register dump）。`dmesg` 里那些 `REG[0x0004] = 0x00C0FFEE` 的行，就是用内核版的 snprintf 打出来的。',
      '实现 `format_reg(buf, n, offset, value)`：把一行转储写入 `buf`（容量 `n` 字节），格式固定为 `REG[0x%04X] = 0x%08X`——偏移 4 位十六进制大写补零，值 8 位补零。返回值与 `snprintf` 的返回值一致（欲写入的字符数，不含结尾 `\\0`）。',
      '为什么用 snprintf 而不是 sprintf？缓冲区溢出是内核 CVE 的常客，带长度上限是硬性习惯。',
    ],
    descriptionEn: [
      'When a driver misbehaves, the first thing an engineer reads is a register dump. Those `REG[0x0004] = 0x00C0FFEE` lines in `dmesg` are produced by the kernel’s snprintf.',
      'Implement `format_reg(buf, n, offset, value)`: write one dump line into `buf` (capacity `n` bytes) with the exact format `REG[0x%04X] = 0x%08X` — offset as 4 uppercase hex digits, value as 8, both zero-padded. Return whatever `snprintf` returns (chars that would be written, excluding the trailing `\\0`).',
      'Why snprintf instead of sprintf? Buffer overflows are a recurring kernel CVE class; a hard length cap is non-negotiable habit.',
    ],
    language: "c",
    starterCode: `#include <stdio.h>
#include <stdint.h>
#include <stddef.h>

/* 写入一行寄存器转储，例如 offset=0x4, value=0xC0FFEE:
 *   REG[0x0004] = 0x00C0FFEE
 * 返回 snprintf 的返回值。 */
int format_reg(char *buf, size_t n, uint32_t offset, uint32_t value)
{
    (void)buf; (void)n; (void)offset; (void)value;
    return 0; /* TODO */
}`,
    starterCodeEn: `#include <stdio.h>
#include <stdint.h>
#include <stddef.h>

/* Write one register-dump line, e.g. offset=0x4, value=0xC0FFEE:
 *   REG[0x0004] = 0x00C0FFEE
 * Return whatever snprintf returns. */
int format_reg(char *buf, size_t n, uint32_t offset, uint32_t value)
{
    (void)buf; (void)n; (void)offset; (void)value;
    return 0; /* TODO */
}`,
    harness: `{{USER_CODE}}

#include <string.h>
static int _pass, _total;
#define CHECK_STR(label, expect, got) do { _total++; \\
    if (strcmp((expect), (got)) == 0) { _pass++; printf("[PASS] %s\\n", label); } \\
    else printf("[FAIL] %s (expected=%s got=%s)\\n", label, (expect), (got)); } while (0)
#define CHECK_INT(label, expect, got) do { _total++; long long _e=(expect), _g=(got); \\
    if (_e == _g) { _pass++; printf("[PASS] %s\\n", label); } \\
    else printf("[FAIL] %s (expected=%lld got=%lld)\\n", label, _e, _g); } while (0)

int main(void)
{
    char buf[64];
    int r = format_reg(buf, sizeof(buf), 0x4, 0xC0FFEEu);
    CHECK_STR("basic line", "REG[0x0004] = 0x00C0FFEE", buf);
    CHECK_INT("return length", (long long)strlen("REG[0x0004] = 0x00C0FFEE"), r);

    format_reg(buf, sizeof(buf), 0x2004, 0xDEADBEEFu);
    CHECK_STR("wide offset", "REG[0x2004] = 0xDEADBEEF", buf);

    format_reg(buf, sizeof(buf), 0x0, 0x0);
    CHECK_STR("all zero padding", "REG[0x0000] = 0x00000000", buf);

    /* truncation safety: capacity is only 8, must never overflow */
    char tiny[8];
    memset(tiny, 0x7f, sizeof(tiny));
    r = format_reg(tiny, sizeof(tiny), 0xABCD, 0x12345678u);
    CHECK_INT("truncated still reports full length", 24, r);
    CHECK_STR("truncated content", "REG[0xA", tiny);

    printf("RESULT %d/%d\\n", _pass, _total);
    return _pass == _total ? 0 : 1;
}`,
    hints: [
      '格式串就是题面给的 `REG[0x%04X] = 0x%08X`；`%04X` 表示大写十六进制、最小宽度 4、零填充。',
      'uint32_t 传给 %X 时最稳妥的写法是先转成 unsigned：`(unsigned)offset`。',
      'snprintf 的返回值是"如果空间无限会写多少字符"，所以截断时返回值大于容量——这正是判断截断的标准姿势。',
    ],
    hintsEn: [
      'The format string is exactly the one in the statement: `REG[0x%04X] = 0x%08X`; `%04X` means uppercase hex, min width 4, zero-padded.',
      'Passing uint32_t to %X is safest with an explicit cast: `(unsigned)offset`.',
      'snprintf returns the length it would have written given infinite space, so return > capacity signals truncation — the standard idiom.',
    ],
    solution: `#include <stdio.h>
#include <stdint.h>
#include <stddef.h>

int format_reg(char *buf, size_t n, uint32_t offset, uint32_t value)
{
    return snprintf(buf, n, "REG[0x%04X] = 0x%08X",
                    (unsigned)offset, (unsigned)value);
}`,
    solutionNote:
      '一行 snprintf 就够——考点在细节：%04X/%08X 的零填充宽度、返回值语义（欲写长度而非实写长度）、以及容量参数保证永不越界。内核里对应的是 scnprintf（返回实写长度），面试常问两者区别。',
    solutionNoteEn:
      'One snprintf line suffices — the points are the details: %04X/%08X zero-padded widths, the return-value semantics (intended length, not written length), and the capacity argument guaranteeing no overflow. The kernel twin is scnprintf (returns written length); the difference is a common interview question.',
  },
  {
    id: "c-02",
    track: "c",
    number: 2,
    title: "GPU 地址的高低 32 位",
    titleEn: "Upper/Lower 32 Bits of a GPU Address",
    difficulty: "easy",
    minutes: 12,
    tags: ["整数", "移位", "类型转换"],
    tagsEn: ["integers", "shifts", "casts"],
    lessonId: "cc-c-2",
    brief: "实现 amdgpu 里天天见的 lower_32_bits / upper_32_bits / 重组 64 位。",
    briefEn: "Implement amdgpu’s ubiquitous lower_32_bits / upper_32_bits / 64-bit recombine.",
    description: [
      'GPU 的 64 位地址塞不进 32 位的寄存器，所以 amdgpu 到处是这样的代码：把一个 64 位 VA 拆成 LO/HI 两半分别写进两个寄存器（搜索内核源码里的 `lower_32_bits` 能找到上千处）。',
      '实现三个函数：`lo32(v)` 取低 32 位；`hi32(v)` 取高 32 位；`make64(hi, lo)` 把两半拼回 64 位。',
      '陷阱预告：`hi << 32` 里如果 `hi` 是 32 位类型，移位 32 位是未定义行为（UB）——这是本题真正想让你踩一次的坑。',
    ],
    descriptionEn: [
      'A 64-bit GPU address doesn’t fit a 32-bit register, so amdgpu is full of code splitting a 64-bit VA into LO/HI halves written to two registers (grep the kernel for `lower_32_bits` — a thousand-plus hits).',
      'Implement three functions: `lo32(v)` returns the low 32 bits; `hi32(v)` the high 32; `make64(hi, lo)` recombines them.',
      'Trap preview: in `hi << 32`, if `hi` has a 32-bit type, shifting by 32 is undefined behavior (UB) — the exact pit this problem wants you to step in once.',
    ],
    language: "c",
    starterCode: `#include <stdint.h>

uint32_t lo32(uint64_t v)
{
    return 0; /* TODO */
}

uint32_t hi32(uint64_t v)
{
    return 0; /* TODO */
}

uint64_t make64(uint32_t hi, uint32_t lo)
{
    return 0; /* TODO: 小心 32 位值左移 32 位的 UB */
}`,
    starterCodeEn: `#include <stdint.h>

uint32_t lo32(uint64_t v)
{
    return 0; /* TODO */
}

uint32_t hi32(uint64_t v)
{
    return 0; /* TODO */
}

uint64_t make64(uint32_t hi, uint32_t lo)
{
    return 0; /* TODO: beware UB when shifting a 32-bit value by 32 */
}`,
    harness: `#include <stdio.h>
{{USER_CODE}}

static int _pass, _total;
#define CHECK_U64(label, expect, got) do { _total++; \\
    unsigned long long _e=(expect), _g=(got); \\
    if (_e == _g) { _pass++; printf("[PASS] %s\\n", label); } \\
    else printf("[FAIL] %s (expected=0x%llX got=0x%llX)\\n", label, _e, _g); } while (0)

int main(void)
{
    uint64_t va = 0x0000123456789ABCull;
    CHECK_U64("lo32(va)", 0x56789ABCull, lo32(va));
    CHECK_U64("hi32(va)", 0x00001234ull, hi32(va));
    CHECK_U64("make64 round-trip", va, make64(hi32(va), lo32(va)));

    uint64_t all = 0xFFFFFFFFFFFFFFFFull;
    CHECK_U64("lo32(all ones)", 0xFFFFFFFFull, lo32(all));
    CHECK_U64("hi32(all ones)", 0xFFFFFFFFull, hi32(all));
    CHECK_U64("make64(all ones)", all, make64(0xFFFFFFFFu, 0xFFFFFFFFu));

    CHECK_U64("make64(1, 0) — the UB trap", 0x100000000ull, make64(1u, 0u));
    CHECK_U64("hi32(zero)", 0ull, hi32(0));

    printf("RESULT %d/%d\\n", _pass, _total);
    return _pass == _total ? 0 : 1;
}`,
    hints: [
      '低 32 位：直接截断转换 `(uint32_t)v`，或者 `v & 0xFFFFFFFFu`。',
      '高 32 位：`(uint32_t)(v >> 32)`。对 uint64_t 右移 32 是完全合法的。',
      'make64 的关键：先把 hi 提升成 64 位再移位——`((uint64_t)hi << 32) | lo`。如果写成 `hi << 32`，uint32_t 移 32 位是 UB，编译器可能给你任何结果。',
    ],
    hintsEn: [
      'Low 32: a truncating cast `(uint32_t)v`, or `v & 0xFFFFFFFFu`.',
      'High 32: `(uint32_t)(v >> 32)`. Right-shifting a uint64_t by 32 is perfectly legal.',
      'The make64 key: promote hi to 64-bit before shifting — `((uint64_t)hi << 32) | lo`. Written as `hi << 32`, shifting a uint32_t by 32 is UB and the compiler may hand you anything.',
    ],
    solution: `#include <stdint.h>

uint32_t lo32(uint64_t v)
{
    return (uint32_t)(v & 0xFFFFFFFFu);
}

uint32_t hi32(uint64_t v)
{
    return (uint32_t)(v >> 32);
}

uint64_t make64(uint32_t hi, uint32_t lo)
{
    return ((uint64_t)hi << 32) | lo;
}`,
    solutionNote:
      '内核版就叫 lower_32_bits()/upper_32_bits()（include/linux/kernel.h）。核心考点是 make64 里的显式提升：C 的移位规则要求移位量小于左操作数的位宽，32 位值移 32 位是 UB。amdgpu 写寄存器时的固定套路：WREG32(ADDR_LO, lower_32_bits(va)); WREG32(ADDR_HI, upper_32_bits(va))。',
    solutionNoteEn:
      'The kernel versions are lower_32_bits()/upper_32_bits() (include/linux/kernel.h). The core point is the explicit promotion in make64: C requires the shift amount to be less than the width of the left operand, so shifting a 32-bit value by 32 is UB. The fixed amdgpu register idiom: WREG32(ADDR_LO, lower_32_bits(va)); WREG32(ADDR_HI, upper_32_bits(va)).',
  },
  {
    id: "c-03",
    track: "c",
    number: 3,
    title: "size_t 下溢陷阱",
    titleEn: "The size_t Underflow Trap",
    difficulty: "medium",
    minutes: 15,
    tags: ["无符号", "整数提升", "边界条件"],
    tagsEn: ["unsigned", "promotion", "edge-cases"],
    lessonId: "cc-c-2",
    brief: "n=0 时 `i <= n-1` 会发生什么？写一个对空数组也正确的统计函数。",
    briefEn: "What does `i <= n-1` do when n=0? Write a count that survives empty arrays.",
    description: [
      '一位新人写了这样的循环统计已署名的 fence：`for (size_t i = 0; i <= n - 1; i++)`。代码评审直接打回：当 `n == 0` 时，`n - 1` 是无符号运算，结果不是 -1 而是 `SIZE_MAX`（约 1.8 × 10¹⁹），循环会扫过整个地址空间然后崩溃。',
      '实现 `count_signaled(seqnos, n, threshold)`：统计数组里 **严格大于** `threshold` 的元素个数。要求：`n == 0` 时返回 0；`seqnos == NULL` 且 `n > 0` 时返回 -EINVAL（即 -22）；正常时返回个数（题目保证不超过 INT_MAX）。',
      '这是驱动代码里真实的事故模式：GPU 返回的 fence 数量为 0 是完全正常的路径，但很多 bug 只在这条"空路径"上爆炸。',
    ],
    descriptionEn: [
      'A new hire wrote this loop to count signaled fences: `for (size_t i = 0; i <= n - 1; i++)`. Code review bounced it: when `n == 0`, `n - 1` is unsigned arithmetic — the result is not -1 but `SIZE_MAX` (~1.8 × 10¹⁹), and the loop marches across the whole address space and crashes.',
      'Implement `count_signaled(seqnos, n, threshold)`: count elements **strictly greater than** `threshold`. Requirements: return 0 when `n == 0`; return -EINVAL (that is, -22) when `seqnos == NULL` with `n > 0`; otherwise the count (guaranteed to fit an int).',
      'This is a real incident pattern in driver code: zero fences returned by the GPU is a perfectly normal path, and many bugs only detonate on that empty path.',
    ],
    language: "c",
    starterCode: `#include <stddef.h>
#include <stdint.h>

#define EINVAL 22

/* 统计 seqnos[0..n) 中严格大于 threshold 的个数。
 * n==0 -> 0；seqnos==NULL 且 n>0 -> -EINVAL。 */
int count_signaled(const uint32_t *seqnos, size_t n, uint32_t threshold)
{
    (void)seqnos; (void)n; (void)threshold;
    return 0; /* TODO: 写一个 n==0 时也安全的循环 */
}`,
    starterCodeEn: `#include <stddef.h>
#include <stdint.h>

#define EINVAL 22

/* Count elements of seqnos[0..n) strictly greater than threshold.
 * n==0 -> 0; seqnos==NULL with n>0 -> -EINVAL. */
int count_signaled(const uint32_t *seqnos, size_t n, uint32_t threshold)
{
    (void)seqnos; (void)n; (void)threshold;
    return 0; /* TODO: write a loop that is safe when n==0 */
}`,
    harness: `#include <stdio.h>
{{USER_CODE}}

static int _pass, _total;
#define CHECK_INT(label, expect, got) do { _total++; long long _e=(expect), _g=(got); \\
    if (_e == _g) { _pass++; printf("[PASS] %s\\n", label); } \\
    else printf("[FAIL] %s (expected=%lld got=%lld)\\n", label, _e, _g); } while (0)

int main(void)
{
    uint32_t seq[] = { 10, 25, 3, 99, 25, 100 };
    CHECK_INT("normal count (strictly greater)", 2, count_signaled(seq, 6, 25));
    CHECK_INT("all above", 6, count_signaled(seq, 6, 0));
    CHECK_INT("none above", 0, count_signaled(seq, 6, 100));
    CHECK_INT("empty array (the trap)", 0, count_signaled(seq, 0, 0));
    CHECK_INT("NULL with n=0 is fine", 0, count_signaled(NULL, 0, 5));
    CHECK_INT("NULL with n>0 -> -EINVAL", -22, count_signaled(NULL, 3, 5));

    uint32_t edge[] = { 0xFFFFFFFFu };
    CHECK_INT("u32 max vs u32 max-1", 1, count_signaled(edge, 1, 0xFFFFFFFEu));

    printf("RESULT %d/%d\\n", _pass, _total);
    return _pass == _total ? 0 : 1;
}`,
    hints: [
      '循环条件用 `i < n` 而不是 `i <= n - 1`——前者在 n==0 时一次都不进循环，后者下溢。',
      '先处理参数校验：`if (n > 0 && !seqnos) return -EINVAL;`。注意 NULL 且 n==0 是合法的（内核约定：零长度时指针可以为空）。',
      '比较 `seqnos[i] > threshold` 两边都是 uint32_t，不会发生有符号/无符号混合比较——这是刻意的：类型一致时无符号比较是安全的。',
    ],
    hintsEn: [
      'Use `i < n` instead of `i <= n - 1` — the former never enters the loop at n==0, the latter underflows.',
      'Validate first: `if (n > 0 && !seqnos) return -EINVAL;`. Note NULL with n==0 is legal (kernel convention: pointer may be null for zero length).',
      'In `seqnos[i] > threshold` both sides are uint32_t, so no signed/unsigned mixing — deliberately: unsigned comparison is safe when types agree.',
    ],
    solution: `#include <stddef.h>
#include <stdint.h>

#define EINVAL 22

int count_signaled(const uint32_t *seqnos, size_t n, uint32_t threshold)
{
    if (n > 0 && !seqnos)
        return -EINVAL;

    int count = 0;
    for (size_t i = 0; i < n; i++) {
        if (seqnos[i] > threshold)
            count++;
    }
    return count;
}`,
    solutionNote:
      '两个要点：(1) 无符号循环边界永远写成 `i < n` 形态，任何 `n - 1`、`n - 2` 出现在无符号表达式里都要先想"n 够减吗"；(2) 内核错误码约定——负 errno 返回错误、非负返回结果，调用方用 `ret < 0` 判错。GCC 的 -Wsign-compare（含在 -Wextra 里）能抓混合比较，但抓不住本题的纯无符号下溢，只能靠脑子。',
    solutionNoteEn:
      'Two takeaways: (1) always shape unsigned loop bounds as `i < n`; whenever `n - 1` or `n - 2` appears in an unsigned expression, first ask "can n afford the subtraction"; (2) the kernel errno convention — negative errno for failure, non-negative for results, callers test `ret < 0`. GCC’s -Wsign-compare (in -Wextra) catches mixed comparisons but not this pure unsigned underflow; only your head does.',
  },
  {
    id: "c-04",
    track: "c",
    number: 4,
    title: "状态寄存器位操作",
    titleEn: "Status Register Bit Ops",
    difficulty: "easy",
    minutes: 12,
    tags: ["位操作", "掩码"],
    tagsEn: ["bit-ops", "masks"],
    lessonId: "cc-c-2",
    brief: "set / clear / test——对着一个假想的 GRBM_STATUS 练最基本的掩码功。",
    briefEn: "set / clear / test — basic mask work against an imaginary GRBM_STATUS.",
    description: [
      '读驱动代码时你会看到大量 `status |= BIT(5)`、`status &= ~BUSY_MASK`、`if (status & DONE_MASK)`。位操作是和硬件对话的母语——寄存器的每一位都是一盏独立的信号灯。',
      '实现四个纯函数（都不修改入参、返回新值或布尔）：`set_bits(reg, mask)` 把 mask 里的位置 1；`clear_bits(reg, mask)` 清 0；`test_all(reg, mask)` 判断 mask 的位是否**全部**为 1；`test_any(reg, mask)` 判断是否**至少一位**为 1。',
      '注意 `test_all` 的实现——`(reg & mask) != 0` 只能判断"有没有"，判断"是否全有"需要不同的写法。',
    ],
    descriptionEn: [
      'Reading driver code you constantly meet `status |= BIT(5)`, `status &= ~BUSY_MASK`, `if (status & DONE_MASK)`. Bit ops are the native tongue of hardware — every register bit is an independent signal lamp.',
      'Implement four pure functions (no argument mutation; return new values or booleans): `set_bits(reg, mask)` sets the mask bits; `clear_bits(reg, mask)` clears them; `test_all(reg, mask)` — are **all** mask bits set; `test_any(reg, mask)` — is **at least one** set.',
      'Mind `test_all` — `(reg & mask) != 0` only answers "any?"; answering "all?" needs a different shape.',
    ],
    language: "c",
    starterCode: `#include <stdint.h>
#include <stdbool.h>

uint32_t set_bits(uint32_t reg, uint32_t mask)
{
    return 0; /* TODO */
}

uint32_t clear_bits(uint32_t reg, uint32_t mask)
{
    return 0; /* TODO */
}

bool test_all(uint32_t reg, uint32_t mask)
{
    return false; /* TODO: mask 的位是否全部为 1 */
}

bool test_any(uint32_t reg, uint32_t mask)
{
    return false; /* TODO: 是否至少一位为 1 */
}`,
    starterCodeEn: `#include <stdint.h>
#include <stdbool.h>

uint32_t set_bits(uint32_t reg, uint32_t mask)
{
    return 0; /* TODO */
}

uint32_t clear_bits(uint32_t reg, uint32_t mask)
{
    return 0; /* TODO */
}

bool test_all(uint32_t reg, uint32_t mask)
{
    return false; /* TODO: are ALL mask bits set? */
}

bool test_any(uint32_t reg, uint32_t mask)
{
    return false; /* TODO: is at least one bit set? */
}`,
    harness: `#include <stdio.h>
{{USER_CODE}}

static int _pass, _total;
#define CHECK(label, cond) do { _total++; \\
    if (cond) { _pass++; printf("[PASS] %s\\n", label); } \\
    else printf("[FAIL] %s\\n", label); } while (0)

#define GFX_BUSY  (1u << 0)
#define SDMA_BUSY (1u << 5)
#define VCN_BUSY  (1u << 9)

int main(void)
{
    uint32_t reg = 0;
    reg = set_bits(reg, GFX_BUSY | VCN_BUSY);
    CHECK("set two bits", reg == ((1u << 0) | (1u << 9)));
    reg = set_bits(reg, GFX_BUSY);
    CHECK("set is idempotent", reg == ((1u << 0) | (1u << 9)));

    reg = clear_bits(reg, GFX_BUSY);
    CHECK("clear one bit", reg == (1u << 9));
    reg = clear_bits(reg, SDMA_BUSY);
    CHECK("clear absent bit is no-op", reg == (1u << 9));

    CHECK("test_any hit", test_any(reg, VCN_BUSY | GFX_BUSY));
    CHECK("test_any miss", !test_any(reg, GFX_BUSY | SDMA_BUSY));
    CHECK("test_all needs every bit", !test_all(reg, VCN_BUSY | GFX_BUSY));
    CHECK("test_all exact", test_all(reg, VCN_BUSY));
    CHECK("test_all on full mask", test_all(0xFFFFFFFFu, 0xFFFFFFFFu));
    CHECK("test_any on zero mask is false", !test_any(reg, 0));

    printf("RESULT %d/%d\\n", _pass, _total);
    return _pass == _total ? 0 : 1;
}`,
    hints: [
      '置位用按位或：`reg | mask`；清零用按位与取反：`reg & ~mask`。',
      'test_all 的标准写法：`(reg & mask) == mask`——先筛出 mask 覆盖的位，再和 mask 本身比较。',
      'test_any：`(reg & mask) != 0`。想想 mask 为 0 时两个函数各应返回什么（all 空集为真也说得通，但本题以 harness 为准：any(0) 为 false）。',
    ],
    hintsEn: [
      'Set with bitwise OR: `reg | mask`; clear with AND-NOT: `reg & ~mask`.',
      'The canonical test_all: `(reg & mask) == mask` — filter the masked bits, then compare with the mask itself.',
      'test_any: `(reg & mask) != 0`. Consider mask==0 (vacuous truth for "all" is defensible, but follow the harness here: any(0) is false).',
    ],
    solution: `#include <stdint.h>
#include <stdbool.h>

uint32_t set_bits(uint32_t reg, uint32_t mask)
{
    return reg | mask;
}

uint32_t clear_bits(uint32_t reg, uint32_t mask)
{
    return reg & ~mask;
}

bool test_all(uint32_t reg, uint32_t mask)
{
    return (reg & mask) == mask;
}

bool test_any(uint32_t reg, uint32_t mask)
{
    return (reg & mask) != 0;
}`,
    solutionNote:
      '四个一行函数，但 `(reg & mask) == mask` 与 `(reg & mask) != 0` 的区别是真实事故来源：等 GPU 空闲时用错判断，会把"部分引擎还忙"当成"全部空闲"。内核的 BIT(n) 宏就是 `(1UL << (n))`；amdgpu 等待空闲的代码（如 gfx_v10_0_wait_for_idle）正是在循环里做这种掩码判断。',
    solutionNoteEn:
      'Four one-liners, but the difference between `(reg & mask) == mask` and `(reg & mask) != 0` causes real incidents: use the wrong one while waiting for GPU idle and "some engines still busy" reads as "all idle". The kernel BIT(n) macro is `(1UL << (n))`; amdgpu idle-wait code (e.g. gfx_v10_0_wait_for_idle) does exactly this mask test in a loop.',
  },
  {
    id: "c-05",
    track: "c",
    number: 5,
    title: "寄存器位域：GET_FIELD / SET_FIELD",
    titleEn: "Register Fields: GET_FIELD / SET_FIELD",
    difficulty: "medium",
    minutes: 18,
    tags: ["位操作", "掩码", "寄存器"],
    tagsEn: ["bit-ops", "masks", "registers"],
    lessonId: "cc-c-2",
    brief: "复刻 amdgpu 的 REG_GET_FIELD / REG_SET_FIELD——按 shift+mask 读写寄存器里的多位字段。",
    briefEn: "Recreate amdgpu’s REG_GET_FIELD / REG_SET_FIELD — read/write multi-bit fields via shift+mask.",
    description: [
      '寄存器不只是 32 盏独立信号灯，更多时候是几段"字段"的拼盘。例如某个假想的 `SDMA_RB_CNTL`：bit0 是 RB_ENABLE，bit1..6 是 RB_SIZE（6 位），bit12..17 是 RPTR_SHIFT。AMD 的寄存器头文件为每个字段生成两个宏：`FIELD__SHIFT`（起始位）和 `FIELD_MASK`（**已就位**的掩码，如 RB_SIZE_MASK = 0x0000007E）。',
      '实现两个通用函数：`reg_get_field(reg, shift, mask)` 取出字段值（右对齐返回）；`reg_set_field(reg, shift, mask, val)` 返回把该字段替换为 `val` 的新寄存器值，**其他位保持不动**，且 `val` 超出字段宽度的高位要被掩掉。',
      '这就是 amdgpu 里 REG_GET_FIELD/REG_SET_FIELD 宏的展开逻辑，读 gfx/sdma 初始化代码时每屏都会遇到。',
    ],
    descriptionEn: [
      'A register is rarely 32 independent lamps; usually it is a platter of multi-bit fields. Take an imaginary `SDMA_RB_CNTL`: bit0 RB_ENABLE, bits1..6 RB_SIZE (6 bits), bits12..17 RPTR_SHIFT. AMD’s register headers generate two macros per field: `FIELD__SHIFT` (start bit) and `FIELD_MASK` (a mask **already in position**, e.g. RB_SIZE_MASK = 0x0000007E).',
      'Implement two generic helpers: `reg_get_field(reg, shift, mask)` extracts the field (right-aligned); `reg_set_field(reg, shift, mask, val)` returns the register with that field replaced by `val`, **all other bits untouched**, and any excess high bits of `val` masked off.',
      'This is exactly what amdgpu’s REG_GET_FIELD/REG_SET_FIELD macros expand to; you meet them on every screen of gfx/sdma init code.',
    ],
    language: "c",
    starterCode: `#include <stdint.h>

/* mask 是"已就位"的掩码（对准字段位置），shift 是字段起始位。
 * 例: RB_SIZE 在 bit1..6: shift=1, mask=0x0000007E */
uint32_t reg_get_field(uint32_t reg, uint32_t shift, uint32_t mask)
{
    return 0; /* TODO */
}

uint32_t reg_set_field(uint32_t reg, uint32_t shift, uint32_t mask, uint32_t val)
{
    return 0; /* TODO: 只替换字段位，其他位不动 */
}`,
    starterCodeEn: `#include <stdint.h>

/* mask is a POSITIONED mask (already aligned to the field), shift is the
 * field start bit. E.g. RB_SIZE at bits 1..6: shift=1, mask=0x0000007E */
uint32_t reg_get_field(uint32_t reg, uint32_t shift, uint32_t mask)
{
    return 0; /* TODO */
}

uint32_t reg_set_field(uint32_t reg, uint32_t shift, uint32_t mask, uint32_t val)
{
    return 0; /* TODO: replace only the field bits, leave the rest alone */
}`,
    harness: `#include <stdio.h>
{{USER_CODE}}

static int _pass, _total;
#define CHECK_HEX(label, expect, got) do { _total++; \\
    unsigned long long _e=(expect), _g=(got); \\
    if (_e == _g) { _pass++; printf("[PASS] %s\\n", label); } \\
    else printf("[FAIL] %s (expected=0x%llX got=0x%llX)\\n", label, _e, _g); } while (0)

/* imaginary SDMA_RB_CNTL field definitions (AMD header style) */
#define RB_ENABLE__SHIFT   0u
#define RB_ENABLE_MASK     0x00000001u
#define RB_SIZE__SHIFT     1u
#define RB_SIZE_MASK       0x0000007Eu
#define RPTR_SHIFT__SHIFT  12u
#define RPTR_SHIFT_MASK    0x0003F000u

int main(void)
{
    uint32_t reg = 0;
    reg = reg_set_field(reg, RB_ENABLE__SHIFT, RB_ENABLE_MASK, 1);
    reg = reg_set_field(reg, RB_SIZE__SHIFT, RB_SIZE_MASK, 24);
    reg = reg_set_field(reg, RPTR_SHIFT__SHIFT, RPTR_SHIFT_MASK, 6);
    CHECK_HEX("compose three fields", 0x00006031u, reg);

    CHECK_HEX("get RB_SIZE", 24u, reg_get_field(reg, RB_SIZE__SHIFT, RB_SIZE_MASK));
    CHECK_HEX("get RB_ENABLE", 1u, reg_get_field(reg, RB_ENABLE__SHIFT, RB_ENABLE_MASK));
    CHECK_HEX("get RPTR_SHIFT", 6u, reg_get_field(reg, RPTR_SHIFT__SHIFT, RPTR_SHIFT_MASK));

    uint32_t reg2 = reg_set_field(reg, RB_SIZE__SHIFT, RB_SIZE_MASK, 10);
    CHECK_HEX("replace keeps other fields", 0x00006015u, reg2);
    CHECK_HEX("old value replaced", 10u, reg_get_field(reg2, RB_SIZE__SHIFT, RB_SIZE_MASK));

    uint32_t reg3 = reg_set_field(0, RB_SIZE__SHIFT, RB_SIZE_MASK, 0xFFFFFFFFu);
    CHECK_HEX("oversize val is clipped to field", RB_SIZE_MASK, reg3);

    CHECK_HEX("get from all-ones", 0x3Fu,
              reg_get_field(0xFFFFFFFFu, RPTR_SHIFT__SHIFT, RPTR_SHIFT_MASK));

    printf("RESULT %d/%d\\n", _pass, _total);
    return _pass == _total ? 0 : 1;
}`,
    hints: [
      'GET：先用就位掩码筛位，再右移对齐——`(reg & mask) >> shift`。',
      'SET 三步走：清掉旧字段 `reg & ~mask`；把新值移到位并掩掉溢出 `(val << shift) & mask`；按位或合并。',
      '溢出裁剪那个测试的意义：如果不 `& mask`，`val=0xFFFFFFFF` 会把整个寄存器污染。amdgpu 的宏同样有这层保护。',
    ],
    hintsEn: [
      'GET: filter with the positioned mask, then right-align — `(reg & mask) >> shift`.',
      'SET in three steps: clear the old field `reg & ~mask`; position and clip the new value `(val << shift) & mask`; OR them together.',
      'The clipping test matters: without `& mask`, val=0xFFFFFFFF would pollute the whole register. The amdgpu macros carry the same guard.',
    ],
    solution: `#include <stdint.h>

uint32_t reg_get_field(uint32_t reg, uint32_t shift, uint32_t mask)
{
    return (reg & mask) >> shift;
}

uint32_t reg_set_field(uint32_t reg, uint32_t shift, uint32_t mask, uint32_t val)
{
    return (reg & ~mask) | ((val << shift) & mask);
}`,
    solutionNote:
      '就是 amdgpu 的 REG_GET_FIELD / REG_SET_FIELD（drivers/gpu/drm/amd/amdgpu/amdgpu.h）的函数化版本：读=筛+移，写=清+置+并。记住内核头文件的约定：MASK 是就位掩码而非右对齐掩码——这决定了表达式里 shift 和 mask 的配合方式。',
    solutionNoteEn:
      'This is the functional form of amdgpu’s REG_GET_FIELD / REG_SET_FIELD (drivers/gpu/drm/amd/amdgpu/amdgpu.h): read = filter+shift, write = clear+place+merge. Remember the header convention: MASK is positioned, not right-aligned — that dictates how shift and mask cooperate in the expressions.',
  },
  {
    id: "c-06",
    track: "c",
    number: 6,
    title: "fls：找最高置位位",
    titleEn: "fls: Find Last Set Bit",
    difficulty: "medium",
    minutes: 18,
    tags: ["位操作", "2 的幂"],
    tagsEn: ["bit-ops", "power-of-two"],
    lessonId: "cc-c-2",
    brief: "不用编译器内建，手写内核的 fls()、is_pow2、向上取整到 2 的幂。",
    briefEn: "No builtins: hand-write the kernel’s fls(), is_pow2, and round-up-to-power-of-two.",
    description: [
      '内核里分配页面按"阶"（order，2 的幂）进行，GPU 环形缓冲的大小也必须是 2 的幂（这样回绕才能用 & 掩码而不是 % 取模）。这些都依赖一个原语：`fls(x)`——find last set，返回最高置位位的编号（1 起数），`fls(0)==0`、`fls(1)==1`、`fls(0x80000000)==32`。',
      '实现三个函数（禁用 `__builtin_clz` 等内建，用循环或移位自己写）：`fls32(x)`；`is_pow2(x)`（0 不是 2 的幂）；`round_up_pow2(x)`——大于等于 x 的最小 2 的幂，规定 `x<=1` 时返回 1，输入保证不超过 2^31。',
      '经典位技巧提示：`x & (x - 1)` 会清掉最低的置位位——想想它和"是否 2 的幂"的关系。',
    ],
    descriptionEn: [
      'The kernel allocates pages by "order" (powers of two), and GPU ring buffers must be power-of-two sized (so wraparound is an & mask, not a % modulo). Both rest on one primitive: `fls(x)` — find last set — the index of the highest set bit (1-based), with `fls(0)==0`, `fls(1)==1`, `fls(0x80000000)==32`.',
      'Implement three functions (no `__builtin_clz` and friends — loop or shift it yourself): `fls32(x)`; `is_pow2(x)` (0 is not a power of two); `round_up_pow2(x)` — the smallest power of two ≥ x, defined to return 1 for `x<=1`; inputs never exceed 2^31.',
      'Classic trick to ponder: `x & (x - 1)` clears the lowest set bit — how does that relate to "is a power of two"?',
    ],
    language: "c",
    starterCode: `#include <stdint.h>
#include <stdbool.h>

/* 最高置位位的编号，1 起数；fls32(0)==0 */
int fls32(uint32_t x)
{
    return 0; /* TODO */
}

bool is_pow2(uint32_t x)
{
    return false; /* TODO: 注意 0 */
}

/* >= x 的最小 2 的幂；x<=1 时返回 1（输入保证 <= 2^31）*/
uint32_t round_up_pow2(uint32_t x)
{
    return 0; /* TODO */
}`,
    starterCodeEn: `#include <stdint.h>
#include <stdbool.h>

/* Index of the highest set bit, 1-based; fls32(0)==0 */
int fls32(uint32_t x)
{
    return 0; /* TODO */
}

bool is_pow2(uint32_t x)
{
    return false; /* TODO: mind zero */
}

/* Smallest power of two >= x; return 1 for x<=1 (input never exceeds 2^31) */
uint32_t round_up_pow2(uint32_t x)
{
    return 0; /* TODO */
}`,
    harness: `#include <stdio.h>
{{USER_CODE}}

static int _pass, _total;
#define CHECK_INT(label, expect, got) do { _total++; long long _e=(expect), _g=(got); \\
    if (_e == _g) { _pass++; printf("[PASS] %s\\n", label); } \\
    else printf("[FAIL] %s (expected=%lld got=%lld)\\n", label, _e, _g); } while (0)
#define CHECK(label, cond) do { _total++; \\
    if (cond) { _pass++; printf("[PASS] %s\\n", label); } \\
    else printf("[FAIL] %s\\n", label); } while (0)

int main(void)
{
    CHECK_INT("fls32(0)", 0, fls32(0));
    CHECK_INT("fls32(1)", 1, fls32(1));
    CHECK_INT("fls32(0x18)", 5, fls32(0x18));
    CHECK_INT("fls32(0x80000000)", 32, fls32(0x80000000u));
    CHECK_INT("fls32(0xFFFFFFFF)", 32, fls32(0xFFFFFFFFu));

    CHECK("is_pow2(0) false", !is_pow2(0));
    CHECK("is_pow2(1) true", is_pow2(1));
    CHECK("is_pow2(1024) true", is_pow2(1024));
    CHECK("is_pow2(1536) false", !is_pow2(1536));
    CHECK("is_pow2(0x80000000) true", is_pow2(0x80000000u));

    CHECK_INT("round_up(0)", 1, (long long)round_up_pow2(0));
    CHECK_INT("round_up(1)", 1, (long long)round_up_pow2(1));
    CHECK_INT("round_up(17)", 32, (long long)round_up_pow2(17));
    CHECK_INT("round_up(4096) stays", 4096, (long long)round_up_pow2(4096));
    CHECK_INT("round_up(4097)", 8192, (long long)round_up_pow2(4097));
    CHECK_INT("round_up(2^31) stays", 0x80000000ll, (long long)round_up_pow2(0x80000000u));

    printf("RESULT %d/%d\\n", _pass, _total);
    return _pass == _total ? 0 : 1;
}`,
    hints: [
      'fls32 最直白的写法：从 x 不为 0 开始，`while (x) { x >>= 1; n++; }`——右移到 0 为止，移了几次最高位就在第几位。',
      'is_pow2 的位技巧：`x != 0 && (x & (x - 1)) == 0`。2 的幂只有一个置位位，减 1 恰好翻转它以下所有位。',
      'round_up_pow2 可以搭 fls：已是 2 的幂直接返回；否则返回 `1u << fls32(x)`（最高位再进一位）。',
    ],
    hintsEn: [
      'The plainest fls32: `while (x) { x >>= 1; n++; }` — shift until zero; the count is the position of the highest bit.',
      'The is_pow2 trick: `x != 0 && (x & (x - 1)) == 0`. A power of two has exactly one set bit; subtracting 1 flips everything below it.',
      'round_up_pow2 composes with fls: return x if already a power of two, else `1u << fls32(x)` (one past the highest bit).',
    ],
    solution: `#include <stdint.h>
#include <stdbool.h>

int fls32(uint32_t x)
{
    int n = 0;
    while (x) {
        x >>= 1;
        n++;
    }
    return n;
}

bool is_pow2(uint32_t x)
{
    return x != 0 && (x & (x - 1)) == 0;
}

uint32_t round_up_pow2(uint32_t x)
{
    if (x <= 1)
        return 1;
    if (is_pow2(x))
        return x;
    return 1u << fls32(x);
}`,
    solutionNote:
      '内核的 fls()（include/asm-generic/bitops/fls.h）语义与此一致，真实实现会用 CPU 指令（bsr/clz）一条搞定，但语义层面就是这个循环。`x & (x-1)` 是必须秒懂的位技巧。环形缓冲为什么必须 2 的幂大小？`(wptr + 1) & (size - 1)` 的回绕只在 size 是 2 的幂时成立——k-05 题里你会亲手用上。',
    solutionNoteEn:
      'The kernel fls() (include/asm-generic/bitops/fls.h) matches these semantics; real implementations use one CPU instruction (bsr/clz), but semantically it is this loop. `x & (x-1)` is a must-recognize trick. Why must rings be power-of-two sized? `(wptr + 1) & (size - 1)` wraps correctly only then — you will use it hands-on in problem k-05.',
  },
  {
    id: "c-07",
    track: "c",
    number: 7,
    title: "输出参数与错误码",
    titleEn: "Out-Parameters & Error Codes",
    difficulty: "easy",
    minutes: 12,
    tags: ["指针", "errno", "内核约定"],
    tagsEn: ["pointers", "errno", "kernel-convention"],
    lessonId: "cc-c-3",
    brief: "内核函数怎么同时返回错误码和结果？负 errno + 指针输出参数。",
    briefEn: "How kernel functions return both an error and a result: negative errno + pointer out-param.",
    description: [
      'C 的函数只有一个返回值，而内核函数常常要同时交代"成没成功"和"结果是什么"。通行约定：返回值留给错误码（0 成功，负 errno 失败），真正的结果通过指针参数写出去。',
      '实现 `parse_ring_type(name, out)`：把环名映射为编号——"gfx"→0、"compute"→1、"sdma"→2、"vcn"→3。成功返回 0 并把编号写入 `*out`；`name` 或 `out` 为 NULL、或名字不认识时返回 -EINVAL（-22），**且此时绝不能碰 `*out`**。',
      '"失败时不写输出参数"是内核评审的硬要求：调用方可能拿着未初始化的变量传进来，失败路径写了它反而制造假象。',
    ],
    descriptionEn: [
      'A C function returns one value, yet kernel functions must report both "did it work" and "what is the result". The convention: the return value carries the error code (0 success, negative errno failure); the actual result goes out through a pointer parameter.',
      'Implement `parse_ring_type(name, out)`: map a ring name to an id — "gfx"→0, "compute"→1, "sdma"→2, "vcn"→3. On success return 0 and store the id into `*out`; when `name` or `out` is NULL, or the name is unknown, return -EINVAL (-22) and **never touch `*out`**.',
      '"Don’t write the out-param on failure" is a hard review rule: the caller may pass an uninitialized variable, and writing it on the failure path manufactures a lie.',
    ],
    language: "c",
    starterCode: `#include <stddef.h>
#include <string.h>

#define EINVAL 22

/* "gfx"->0 "compute"->1 "sdma"->2 "vcn"->3
 * 成功: 返回 0, *out = 编号
 * 失败: 返回 -EINVAL, 不修改 *out */
int parse_ring_type(const char *name, int *out)
{
    (void)name; (void)out;
    return -EINVAL; /* TODO */
}`,
    starterCodeEn: `#include <stddef.h>
#include <string.h>

#define EINVAL 22

/* "gfx"->0 "compute"->1 "sdma"->2 "vcn"->3
 * success: return 0, *out = id
 * failure: return -EINVAL, leave *out untouched */
int parse_ring_type(const char *name, int *out)
{
    (void)name; (void)out;
    return -EINVAL; /* TODO */
}`,
    harness: `#include <stdio.h>
{{USER_CODE}}

static int _pass, _total;
#define CHECK_INT(label, expect, got) do { _total++; long long _e=(expect), _g=(got); \\
    if (_e == _g) { _pass++; printf("[PASS] %s\\n", label); } \\
    else printf("[FAIL] %s (expected=%lld got=%lld)\\n", label, _e, _g); } while (0)

int main(void)
{
    int id = -99;
    CHECK_INT("gfx returns 0", 0, parse_ring_type("gfx", &id));
    CHECK_INT("gfx id", 0, id);

    CHECK_INT("vcn returns 0", 0, parse_ring_type("vcn", &id));
    CHECK_INT("vcn id", 3, id);

    CHECK_INT("compute id", 0, parse_ring_type("compute", &id) == 0 ? (long long)(id - 1) : -1);
    CHECK_INT("sdma id", 0, parse_ring_type("sdma", &id) == 0 ? (long long)(id - 2) : -1);

    id = 777;
    CHECK_INT("unknown -> -EINVAL", -22, parse_ring_type("uvd", &id));
    CHECK_INT("out untouched on error", 777, id);

    CHECK_INT("NULL name -> -EINVAL", -22, parse_ring_type(NULL, &id));
    CHECK_INT("NULL out -> -EINVAL", -22, parse_ring_type("gfx", NULL));
    CHECK_INT("out still untouched", 777, id);

    printf("RESULT %d/%d\\n", _pass, _total);
    return _pass == _total ? 0 : 1;
}`,
    hints: [
      '先做参数校验再做查表：`if (!name || !out) return -EINVAL;`。',
      '查表可以用一组 strcmp，也可以用一个 `{名字, 编号}` 的静态数组循环——后者更像内核里 match table 的写法。',
      '把结果写进 `*out` 的那行必须放在"确认匹配"之后——这就是"失败不碰输出"的自然实现。',
    ],
    hintsEn: [
      'Validate before lookup: `if (!name || !out) return -EINVAL;`.',
      'The lookup can be a chain of strcmp, or a static `{name, id}` array with a loop — the latter mirrors kernel match tables.',
      'The line writing `*out` must sit after the match is confirmed — that naturally implements "never touch the output on failure".',
    ],
    solution: `#include <stddef.h>
#include <string.h>

#define EINVAL 22

int parse_ring_type(const char *name, int *out)
{
    static const struct { const char *name; int id; } table[] = {
        { "gfx", 0 }, { "compute", 1 }, { "sdma", 2 }, { "vcn", 3 },
    };

    if (!name || !out)
        return -EINVAL;

    for (size_t i = 0; i < sizeof(table) / sizeof(table[0]); i++) {
        if (strcmp(table[i].name, name) == 0) {
            *out = table[i].id;
            return 0;
        }
    }
    return -EINVAL;
}`,
    solutionNote:
      '三个内核惯用法打包：负 errno 返回、指针输出参数、静态 match table（`sizeof(t)/sizeof(t[0])` 求元素数，内核里是 ARRAY_SIZE 宏）。调用方的标准姿势是 `ret = parse(...); if (ret < 0) return ret;`——链式向上传播错误码。',
    solutionNoteEn:
      'Three kernel idioms bundled: negative-errno returns, pointer out-params, and a static match table (`sizeof(t)/sizeof(t[0])` for the count — the kernel’s ARRAY_SIZE macro). The caller’s standard stance: `ret = parse(...); if (ret < 0) return ret;` — errors propagate up the chain.',
  },
  {
    id: "c-08",
    track: "c",
    number: 8,
    title: "手写 memset 与 memcpy",
    titleEn: "memset & memcpy by Hand",
    difficulty: "medium",
    minutes: 15,
    tags: ["指针", "void*", "字节操作"],
    tagsEn: ["pointers", "void*", "byte-ops"],
    lessonId: "cc-c-3",
    brief: "void* 不能解引用，那 memcpy 是怎么工作的？转成 unsigned char* 逐字节搬。",
    briefEn: "You can’t dereference void* — so how does memcpy work? Cast to unsigned char* and move bytes.",
    description: [
      '`void *` 是 C 的"通用指针"：任何对象指针都能转进转出，但它本身不能解引用、不能做算术。libc 的 memset/memcpy 接口都收 `void *`——内部第一步永远是转成 `unsigned char *`，因为标准规定任何对象都可以按 unsigned char 逐字节访问。',
      '实现 `my_memset(dst, c, n)` 和 `my_memcpy(dst, src, n)`（不得调用 libc 的 memset/memcpy）：语义与标准一致，返回 `dst`；`n==0` 时什么都不做。`c` 按 `(unsigned char)c` 截断后填充。',
      '驱动里到处是这两位的身影：清零一页 GART 表、把命令从 CPU 侧拷进 IB（indirect buffer）。理解"按字节看内存"是后面一切结构体布局问题的地基。',
    ],
    descriptionEn: [
      '`void *` is C’s universal pointer: any object pointer converts in and out, but it cannot be dereferenced and has no arithmetic. The libc memset/memcpy interfaces take `void *` — and internally the first step is always a cast to `unsigned char *`, because the standard guarantees any object may be accessed byte-wise as unsigned char.',
      'Implement `my_memset(dst, c, n)` and `my_memcpy(dst, src, n)` (no calling libc memset/memcpy): standard semantics, return `dst`; do nothing when `n==0`. Fill with `c` truncated as `(unsigned char)c`.',
      'Drivers lean on these two everywhere: zeroing a GART page table page, copying commands into an IB (indirect buffer). "Seeing memory as bytes" is the foundation for every struct-layout question later.',
    ],
    language: "c",
    starterCode: `#include <stddef.h>

void *my_memset(void *dst, int c, size_t n)
{
    (void)c; (void)n;
    return dst; /* TODO */
}

void *my_memcpy(void *dst, const void *src, size_t n)
{
    (void)src; (void)n;
    return dst; /* TODO */
}`,
    starterCodeEn: `#include <stddef.h>

void *my_memset(void *dst, int c, size_t n)
{
    (void)c; (void)n;
    return dst; /* TODO */
}

void *my_memcpy(void *dst, const void *src, size_t n)
{
    (void)src; (void)n;
    return dst; /* TODO */
}`,
    harness: `#include <stdio.h>
#include <string.h>
{{USER_CODE}}

static int _pass, _total;
static void check(const char *label, int cond)
{
    _total++;
    if (cond) { _pass++; printf("[PASS] %s\\n", label); }
    else printf("[FAIL] %s\\n", label);
}

int main(void)
{
    /* memset: exact region, every byte verified, guards on both sides */
    unsigned char buf[32];
    memset(buf, 0xAA, sizeof(buf));
    void *r = my_memset(buf + 8, 0x5A, 16);
    check("memset returns dst", r == buf + 8);
    int region_ok = 1, guard_ok = 1;
    for (int i = 0; i < 32; i++) {
        if (i >= 8 && i < 24) { if (buf[i] != 0x5A) region_ok = 0; }
        else if (buf[i] != 0xAA) guard_ok = 0;
    }
    check("memset fills every byte of region", region_ok);
    check("memset touches nothing outside region", guard_ok);

    my_memset(buf, 0x1FF, 4);
    check("value truncated to byte", buf[0] == 0xFF && buf[1] == 0xFF && buf[2] == 0xFF && buf[3] == 0xFF);

    int values_ok = 1;
    unsigned char vals[] = { 0x00, 0x01, 0x7F, 0x80, 0xFF };
    for (size_t v = 0; v < sizeof(vals) && values_ok; v++) {
        my_memset(buf, vals[v], 8);
        for (int i = 0; i < 8; i++)
            if (buf[i] != vals[v]) values_ok = 0;
    }
    check("memset across value range", values_ok);

    my_memset(buf, 0x11, 1);
    check("memset n==1", buf[0] == 0x11 && buf[1] == vals[4]);

    /* memcpy: 64-byte pattern, byte-for-byte, guards on both sides */
    unsigned char big_src[64], big_dst[66];
    for (int i = 0; i < 64; i++) big_src[i] = (unsigned char)(i * 7 + 3);
    memset(big_dst, 0xEE, sizeof(big_dst));
    r = my_memcpy(big_dst + 1, big_src, 64);
    check("memcpy returns dst", r == big_dst + 1);
    int copy_ok = 1;
    for (int i = 0; i < 64; i++)
        if (big_dst[1 + i] != big_src[i]) copy_ok = 0;
    check("memcpy copies every byte exactly", copy_ok);
    check("memcpy guards intact", big_dst[0] == 0xEE && big_dst[65] == 0xEE);
    check("memcpy matches libc result", memcmp(big_dst + 1, big_src, 64) == 0);

    unsigned char one_src = 0x42, one_dst = 0;
    my_memcpy(&one_dst, &one_src, 1);
    check("memcpy n==1", one_dst == 0x42);

    my_memset(buf, 0x77, 0);
    my_memcpy(big_dst, big_src, 0);
    check("n==0 is a no-op", buf[0] == 0x11 && big_dst[0] == 0xEE);

    printf("RESULT %d/%d\\n", _pass, _total);
    return _pass == _total ? 0 : 1;
}`,
    hints: [
      '第一步永远是：`unsigned char *d = dst;`（void* 到对象指针在 C 里隐式转换，不用 cast）。',
      'memset：`while (n--) *d++ = (unsigned char)c;`——注意保存原始 dst 用于返回。',
      'memcpy 的 src 侧要用 `const unsigned char *`。想一想：如果区间重叠该用什么？（那是 memmove 的活，本题不要求。）',
    ],
    hintsEn: [
      'Step one is always `unsigned char *d = dst;` (void* converts to object pointers implicitly in C, no cast needed).',
      'memset: `while (n--) *d++ = (unsigned char)c;` — keep the original dst for the return.',
      'The src side needs `const unsigned char *`. Ponder: what if the ranges overlap? (That is memmove’s job — not required here.)',
    ],
    solution: `#include <stddef.h>

void *my_memset(void *dst, int c, size_t n)
{
    unsigned char *d = dst;
    while (n--)
        *d++ = (unsigned char)c;
    return dst;
}

void *my_memcpy(void *dst, const void *src, size_t n)
{
    unsigned char *d = dst;
    const unsigned char *s = src;
    while (n--)
        *d++ = *s++;
    return dst;
}`,
    solutionNote:
      '要点：void* 只是"运输格式"，干活前必转 unsigned char*；`while (n--)` 在 n==0 时天然零次循环（对无符号 n 是安全的，因为判断发生在自减前）；返回原始 dst 支持链式调用。真实 libc/内核实现会按字长批量搬+处理对齐，但字节循环是语义标准。重叠区间要用 memmove——面试高频追问。',
    solutionNoteEn:
      'Points: void* is only a "transport format" — convert to unsigned char* before work; `while (n--)` naturally runs zero times at n==0 (safe for unsigned n because the test precedes the decrement); returning the original dst enables chaining. Real libc/kernel versions copy word-at-a-time with alignment handling, but the byte loop is the semantic standard. Overlapping ranges need memmove — a favorite interview follow-up.',
  },
  {
    id: "c-09",
    track: "c",
    number: 9,
    title: "实现内核的 strscpy",
    titleEn: "Implement the Kernel’s strscpy",
    difficulty: "medium",
    minutes: 18,
    tags: ["字符串", "缓冲区安全"],
    tagsEn: ["strings", "buffer-safety"],
    lessonId: "cc-c-4",
    brief: "strcpy 会溢出、strncpy 不保证结尾——所以内核发明了 strscpy。这次你来写。",
    briefEn: "strcpy overflows, strncpy may not terminate — so the kernel invented strscpy. Your turn.",
    description: [
      '拷贝字符串三代目：`strcpy` 完全不管容量（溢出重灾区）；`strncpy` 有容量但源太长时**不写结尾 `\\0`**，还会把剩余空间全部补零（又慢又危险）；于是内核造了 `strscpy`——2015 年起逐步替换前两者，checkpatch 现在见到 strcpy/strncpy 直接警告。',
      '实现 `my_strscpy(dst, src, size)`（本题保证 dst/src 非 NULL）：最多拷贝 `size-1` 个字符并**总是**写结尾 `\\0`；返回拷贝的字符数（不含 `\\0`）；源串放不下（发生截断）或 `size==0` 时返回 -E2BIG（-7）——截断时仍要保证 dst 是合法的 NUL 结尾串（size>0 前提下）。',
      '返回值设计是它的精髓：调用方一个 `if (ret < 0)` 就能同时发现截断，而 strncpy 的截断是静默的。',
    ],
    descriptionEn: [
      'Three generations of string copy: `strcpy` ignores capacity entirely (an overflow classic); `strncpy` takes a size but **omits the trailing `\\0`** when the source is too long, and zero-fills the remainder (slow and dangerous); so the kernel built `strscpy` — replacing both since 2015, and checkpatch now warns on sight of strcpy/strncpy.',
      'Implement `my_strscpy(dst, src, size)` (dst/src guaranteed non-NULL here): copy at most `size-1` chars and **always** NUL-terminate; return the number of chars copied (excluding `\\0`); on truncation, or when `size==0`, return -E2BIG (-7) — and on truncation dst must still be a valid NUL-terminated string (given size>0).',
      'The return-value design is the whole point: one `if (ret < 0)` lets callers detect truncation, which strncpy silently swallows.',
    ],
    language: "c",
    starterCode: `#include <stddef.h>

#define E2BIG 7

/* 最多拷 size-1 个字符, 总是补 '\\0'。
 * 返回拷贝的字符数; 截断或 size==0 时返回 -E2BIG。 */
long my_strscpy(char *dst, const char *src, size_t size)
{
    (void)dst; (void)src; (void)size;
    return -E2BIG; /* TODO */
}`,
    starterCodeEn: `#include <stddef.h>

#define E2BIG 7

/* Copy at most size-1 chars, always append '\\0'.
 * Return chars copied; -E2BIG on truncation or size==0. */
long my_strscpy(char *dst, const char *src, size_t size)
{
    (void)dst; (void)src; (void)size;
    return -E2BIG; /* TODO */
}`,
    harness: `#include <stdio.h>
#include <string.h>
{{USER_CODE}}

static int _pass, _total;
static void check(const char *label, int cond)
{
    _total++;
    if (cond) { _pass++; printf("[PASS] %s\\n", label); }
    else printf("[FAIL] %s\\n", label);
}

int main(void)
{
    char buf[8];

    memset(buf, 0x7f, sizeof(buf));
    long r = my_strscpy(buf, "gfx", sizeof(buf));
    check("fits: return value is 3", r == 3);
    check("fits: content", strcmp(buf, "gfx") == 0);

    memset(buf, 0x7f, sizeof(buf));
    r = my_strscpy(buf, "compute_ring_0", sizeof(buf));
    check("truncated: returns -E2BIG", r == -E2BIG);
    check("truncated: still NUL-terminated", buf[7] == '\\0');
    check("truncated: content is prefix", strcmp(buf, "compute") == 0);

    r = my_strscpy(buf, "", sizeof(buf));
    check("empty src: returns 0", r == 0);
    check("empty src: dst is empty string", buf[0] == '\\0');

    memset(buf, 0x7f, sizeof(buf));
    r = my_strscpy(buf, "x", 1);
    check("size==1: only room for NUL -> -E2BIG", r == -E2BIG);
    check("size==1: dst is empty string", buf[0] == '\\0');
    check("size==1: no overflow", buf[1] == 0x7f);

    r = my_strscpy(buf, "abc", 0);
    check("size==0: -E2BIG", r == -E2BIG);

    /* exact fit: 7 chars + NUL into 8 */
    r = my_strscpy(buf, "sdma_v5", 8);
    check("exact fit: returns 7", r == 7);
    check("exact fit: content", strcmp(buf, "sdma_v5") == 0);

    printf("RESULT %d/%d\\n", _pass, _total);
    return _pass == _total ? 0 : 1;
}`,
    hints: [
      '骨架：`size==0` 先返回 -E2BIG；然后 `for (i = 0; i < size - 1 && src[i]; i++) dst[i] = src[i];` 循环后补 `dst[i] = 0`。',
      '判断截断：循环结束后如果 `src[i]` 还不是 `\\0`，说明源串没拷完——返回 -E2BIG，否则返回 i。',
      '对照 c-03 的教训：`size - 1` 出现前必须排除 `size==0`，否则无符号下溢。',
    ],
    hintsEn: [
      'Skeleton: return -E2BIG first when `size==0`; then `for (i = 0; i < size - 1 && src[i]; i++) dst[i] = src[i];` and write `dst[i] = 0` after the loop.',
      'Truncation test: after the loop, if `src[i]` is still not `\\0`, the source didn’t fit — return -E2BIG; else return i.',
      'Recall c-03: `size - 1` must be guarded by the `size==0` check first, or unsigned arithmetic underflows.',
    ],
    solution: `#include <stddef.h>

#define E2BIG 7

long my_strscpy(char *dst, const char *src, size_t size)
{
    size_t i;

    if (size == 0)
        return -E2BIG;

    for (i = 0; i < size - 1 && src[i]; i++)
        dst[i] = src[i];
    dst[i] = '\\0';

    return src[i] ? -E2BIG : (long)i;
}`,
    solutionNote:
      '与内核 strscpy（lib/string.c，真实版为性能按字长批量读）语义一致。三件事必须同时成立：永不越界、总是 NUL 结尾、截断可检测——分别治了 strcpy、strncpy 的病。返回类型用 long 而不是 size_t，因为要装下负错误码；这正是内核里 ssize_t 存在的理由。',
    solutionNoteEn:
      'Semantically identical to the kernel strscpy (lib/string.c; the real one reads word-at-a-time for speed). Three properties must hold at once: never overflow, always NUL-terminate, truncation detectable — curing strcpy’s and strncpy’s diseases respectively. The return type is long rather than size_t because it must carry negative errno — precisely why ssize_t exists in the kernel.',
  },
  {
    id: "c-10",
    track: "c",
    number: 10,
    title: "解析十六进制寄存器地址",
    titleEn: "Parse a Hex Register Address",
    difficulty: "medium",
    minutes: 20,
    tags: ["字符串", "解析", "溢出"],
    tagsEn: ["strings", "parsing", "overflow"],
    lessonId: "cc-c-4",
    brief: "debugfs 收到字符串 \"0x1A0\"，你要把它变成 uint32_t——手写解析器，拒绝一切垃圾输入。",
    briefEn: "debugfs hands you the string \"0x1A0\"; turn it into a uint32_t — hand-rolled parser, zero tolerance for garbage.",
    description: [
      'amdgpu 的 debugfs 接口允许用户 `echo 0x1A0 > .../amdgpu_reg` 直接读写寄存器（调试利器）。字符串到整数的这一步，内核用 kstrtou32 系列完成——它对非法输入和溢出的处理比 atoi 严格得多（atoi 溢出是 UB、无法报错）。',
      '实现 `parse_hex_u32(s, out)`：接受可选的 `0x`/`0X` 前缀，后跟 1 个以上十六进制数字（大小写均可），解析成功返回 0 并写 `*out`。错误处理：`s`/`out` 为 NULL、空串、只有前缀、含任何非法字符 → -EINVAL（-22）；数值超出 uint32_t → -ERANGE（-34）。错误时不得修改 `*out`。',
      '注意溢出判断不能等溢出发生后再看——无符号回绕虽不是 UB，但会静默丢数据。要在累加前预判。',
    ],
    descriptionEn: [
      'amdgpu’s debugfs lets you `echo 0x1A0 > .../amdgpu_reg` to peek/poke registers directly (a debugging power tool). For the string-to-integer step the kernel uses the kstrtou32 family — far stricter than atoi about bad input and overflow (atoi overflow is UB and unreportable).',
      'Implement `parse_hex_u32(s, out)`: accept an optional `0x`/`0X` prefix followed by 1+ hex digits (either case); on success return 0 and write `*out`. Errors: NULL `s`/`out`, empty string, prefix only, any invalid character → -EINVAL (-22); value exceeding uint32_t → -ERANGE (-34). Never modify `*out` on error.',
      'Overflow must be detected before it happens — unsigned wraparound isn’t UB, but it silently destroys data. Predict before accumulating.',
    ],
    language: "c",
    starterCode: `#include <stdint.h>
#include <stddef.h>

#define EINVAL 22
#define ERANGE 34

/* "1A0" / "0x1a0" -> 0x1A0
 * 非法 -> -EINVAL, 超出 u32 -> -ERANGE, 错误时不碰 *out */
int parse_hex_u32(const char *s, uint32_t *out)
{
    (void)s; (void)out;
    return -EINVAL; /* TODO */
}`,
    starterCodeEn: `#include <stdint.h>
#include <stddef.h>

#define EINVAL 22
#define ERANGE 34

/* "1A0" / "0x1a0" -> 0x1A0
 * invalid -> -EINVAL, exceeds u32 -> -ERANGE, never touch *out on error */
int parse_hex_u32(const char *s, uint32_t *out)
{
    (void)s; (void)out;
    return -EINVAL; /* TODO */
}`,
    harness: `#include <stdio.h>
{{USER_CODE}}

static int _pass, _total;
static void check(const char *label, int cond)
{
    _total++;
    if (cond) { _pass++; printf("[PASS] %s\\n", label); }
    else printf("[FAIL] %s\\n", label);
}

int main(void)
{
    uint32_t v = 0xEE;

    check("plain hex", parse_hex_u32("1A0", &v) == 0 && v == 0x1A0);
    check("0x prefix", parse_hex_u32("0x1a0", &v) == 0 && v == 0x1A0);
    check("0X prefix upper", parse_hex_u32("0XDEADBEEF", &v) == 0 && v == 0xDEADBEEFu);
    check("zero", parse_hex_u32("0", &v) == 0 && v == 0);
    check("max u32", parse_hex_u32("0xFFFFFFFF", &v) == 0 && v == 0xFFFFFFFFu);
    check("leading zeros ok", parse_hex_u32("0x0000000000FF", &v) == 0 && v == 0xFF);

    v = 0x1234;
    check("empty -> -EINVAL", parse_hex_u32("", &v) == -EINVAL);
    check("prefix only -> -EINVAL", parse_hex_u32("0x", &v) == -EINVAL);
    check("bad char -> -EINVAL", parse_hex_u32("12G4", &v) == -EINVAL);
    check("trailing space -> -EINVAL", parse_hex_u32("1A0 ", &v) == -EINVAL);
    check("NULL s -> -EINVAL", parse_hex_u32(NULL, &v) == -EINVAL);
    check("NULL out -> -EINVAL", parse_hex_u32("1", NULL) == -EINVAL);
    check("overflow -> -ERANGE", parse_hex_u32("0x100000000", &v) == -ERANGE);
    check("big overflow -> -ERANGE", parse_hex_u32("FFFFFFFFFF", &v) == -ERANGE);
    check("out untouched on error", v == 0x1234);

    printf("RESULT %d/%d\\n", _pass, _total);
    return _pass == _total ? 0 : 1;
}`,
    hints: [
      '先剥前缀：`if (s[0]==\'0\' && (s[1]==\'x\'||s[1]==\'X\')) s += 2;`——剥完必须至少还剩一个字符。',
      '单字符转值写个小助手：0-9、a-f、A-F 各自减基准；其他返回 -1 表示非法。',
      '溢出预判：累加前检查 `if (v > 0xFFFFFFFFu >> 4) return -ERANGE;`——若 v 已超过 2^28-1，再乘 16 必然溢出。注意"前导零很多"不算溢出，看的是值不是位数。',
      '结果先攒在局部变量里，全部字符合法后再写 *out——自然满足"错误不碰输出"。',
    ],
    hintsEn: [
      'Strip the prefix first: `if (s[0]==\'0\' && (s[1]==\'x\'||s[1]==\'X\')) s += 2;` — at least one char must remain afterwards.',
      'Write a tiny digit helper: 0-9, a-f, A-F subtract their base; anything else returns -1 for invalid.',
      'Predict overflow: before accumulating, `if (v > 0xFFFFFFFFu >> 4) return -ERANGE;` — if v already exceeds 2^28-1, ×16 must overflow. Many leading zeros are not overflow; judge the value, not the digit count.',
      'Accumulate into a local first; write *out only after every char validates — "never touch output on error" falls out naturally.',
    ],
    solution: `#include <stdint.h>
#include <stddef.h>

#define EINVAL 22
#define ERANGE 34

static int hex_digit(char c)
{
    if (c >= '0' && c <= '9') return c - '0';
    if (c >= 'a' && c <= 'f') return c - 'a' + 10;
    if (c >= 'A' && c <= 'F') return c - 'A' + 10;
    return -1;
}

int parse_hex_u32(const char *s, uint32_t *out)
{
    uint32_t v = 0;

    if (!s || !out)
        return -EINVAL;
    if (s[0] == '0' && (s[1] == 'x' || s[1] == 'X'))
        s += 2;
    if (*s == '\\0')
        return -EINVAL;

    for (; *s; s++) {
        int d = hex_digit(*s);
        if (d < 0)
            return -EINVAL;
        if (v > (0xFFFFFFFFu >> 4))
            return -ERANGE;
        v = (v << 4) | (uint32_t)d;
    }

    *out = v;
    return 0;
}`,
    solutionNote:
      '这就是内核 kstrtou32 的骨架（lib/kstrtox.c）。四个工程点：前缀剥离后必须还有数字；逐字符校验（垃圾即拒，不学 atoi 静默停）；移位前预判溢出（v > UINT32_MAX/16）；累加与输出分离。安全解析用户输入是驱动 ABI 的第一道门。',
    solutionNoteEn:
      'This is the skeleton of the kernel’s kstrtou32 (lib/kstrtox.c). Four engineering points: digits must remain after prefix stripping; per-char validation (reject garbage — no atoi-style silent stop); predict overflow before shifting (v > UINT32_MAX/16); keep accumulation separate from output. Safely parsing user input is the first gate of any driver ABI.',
  },
  {
    id: "c-11",
    track: "c",
    number: 11,
    title: "命令包的小端序列化",
    titleEn: "Little-Endian Command Packet",
    difficulty: "medium",
    minutes: 18,
    tags: ["字节序", "序列化", "结构体布局"],
    tagsEn: ["endianness", "serialization", "struct-layout"],
    lessonId: "cc-c-5",
    brief: "为什么不能直接 memcpy 结构体给硬件？手动按小端把命令包写进字节缓冲。",
    briefEn: "Why can’t you just memcpy a struct to hardware? Serialize a command packet little-endian by hand.",
    description: [
      'CPU 要发命令给 GPU，格式由硬件文档规定精确到每个字节。直接把 C 结构体 memcpy 过去看似聪明，实则埋雷：结构体里有编译器插入的 padding，字段字节序跟着 CPU 走——换个平台布局就变。跨越"硬件边界"的数据必须手动序列化。',
      '按下面的线格式（wire format）实现 `emit_nop_packet(buf, n, opcode, flags, addr)`，所有多字节字段一律小端：字节 0-3 `opcode`(u32)、字节 4-5 `flags`(u16)、字节 6-7 保留必须写 0、字节 8-11 `addr`(u32)。共 12 字节，成功返回 12；`n < 12` 时返回 -ENOSPC（-28）且不写任何字节。',
      '小端 = 低位字节在前：`0x12345678` 序列化为 `78 56 34 12`。',
    ],
    descriptionEn: [
      'The CPU sends the GPU commands whose format the hardware doc pins down to the byte. memcpy-ing a C struct looks clever but plants mines: compilers insert padding, and field byte order follows the CPU — change platforms and the layout changes. Data crossing a hardware boundary must be serialized by hand.',
      'Implement `emit_nop_packet(buf, n, opcode, flags, addr)` against this wire format, all multi-byte fields little-endian: bytes 0-3 `opcode` (u32), bytes 4-5 `flags` (u16), bytes 6-7 reserved and must be written as 0, bytes 8-11 `addr` (u32). 12 bytes total; return 12 on success; return -ENOSPC (-28) and write nothing when `n < 12`.',
      'Little-endian = least significant byte first: `0x12345678` serializes as `78 56 34 12`.',
    ],
    language: "c",
    starterCode: `#include <stdint.h>
#include <stddef.h>

#define ENOSPC 28

/* 线格式 (12 字节, 全部小端):
 *   [0..3] opcode  [4..5] flags  [6..7] 保留=0  [8..11] addr
 * 成功返回 12; n<12 返回 -ENOSPC 且不写 buf */
int emit_nop_packet(uint8_t *buf, size_t n,
                    uint32_t opcode, uint16_t flags, uint32_t addr)
{
    (void)buf; (void)n; (void)opcode; (void)flags; (void)addr;
    return 0; /* TODO */
}`,
    starterCodeEn: `#include <stdint.h>
#include <stddef.h>

#define ENOSPC 28

/* Wire format (12 bytes, all little-endian):
 *   [0..3] opcode  [4..5] flags  [6..7] reserved=0  [8..11] addr
 * Return 12 on success; -ENOSPC without writing when n<12 */
int emit_nop_packet(uint8_t *buf, size_t n,
                    uint32_t opcode, uint16_t flags, uint32_t addr)
{
    (void)buf; (void)n; (void)opcode; (void)flags; (void)addr;
    return 0; /* TODO */
}`,
    harness: `#include <stdio.h>
#include <string.h>
{{USER_CODE}}

static int _pass, _total;
static void check(const char *label, int cond)
{
    _total++;
    if (cond) { _pass++; printf("[PASS] %s\\n", label); }
    else printf("[FAIL] %s\\n", label);
}

int main(void)
{
    uint8_t buf[16];
    memset(buf, 0xEE, sizeof(buf));

    int r = emit_nop_packet(buf, sizeof(buf), 0x12345678u, 0xBEEF, 0xA0B0C0D0u);
    check("returns 12", r == 12);
    check("opcode LE bytes", buf[0] == 0x78 && buf[1] == 0x56 && buf[2] == 0x34 && buf[3] == 0x12);
    check("flags LE bytes", buf[4] == 0xEF && buf[5] == 0xBE);
    check("reserved zeroed", buf[6] == 0 && buf[7] == 0);
    check("addr LE bytes", buf[8] == 0xD0 && buf[9] == 0xC0 && buf[10] == 0xB0 && buf[11] == 0xA0);
    check("does not write past 12", buf[12] == 0xEE);

    uint8_t small[11];
    memset(small, 0x55, sizeof(small));
    r = emit_nop_packet(small, sizeof(small), 1, 2, 3);
    check("n<12 -> -ENOSPC", r == -ENOSPC);
    check("nothing written on error", small[0] == 0x55 && small[10] == 0x55);

    r = emit_nop_packet(buf, 12, 0, 0, 0);
    check("exact capacity works", r == 12);
    check("zero fields serialize to zeros", buf[0] == 0 && buf[5] == 0 && buf[11] == 0);

    printf("RESULT %d/%d\\n", _pass, _total);
    return _pass == _total ? 0 : 1;
}`,
    hints: [
      '取某字节：右移再截断——第 k 字节是 `(uint8_t)(v >> (8 * k))`。',
      '容量检查放最前面，通过后按偏移一个字节一个字节写。写个 `put_le32(uint8_t *p, uint32_t v)` 助手能让代码非常整洁。',
      '为什么这种写法天生可移植？因为它根本不依赖 CPU 的字节序——移位是对"数值"的操作，不是对内存布局的操作。同样的代码在大端机上也输出小端字节流。',
    ],
    hintsEn: [
      'Extract a byte by shifting then truncating — byte k is `(uint8_t)(v >> (8 * k))`.',
      'Capacity check first; then write byte by byte at fixed offsets. A `put_le32(uint8_t *p, uint32_t v)` helper keeps it clean.',
      'Why is this inherently portable? It never depends on CPU endianness — shifts operate on values, not memory layout. The same code emits a little-endian stream even on a big-endian machine.',
    ],
    solution: `#include <stdint.h>
#include <stddef.h>

#define ENOSPC 28

static void put_le32(uint8_t *p, uint32_t v)
{
    p[0] = (uint8_t)(v);
    p[1] = (uint8_t)(v >> 8);
    p[2] = (uint8_t)(v >> 16);
    p[3] = (uint8_t)(v >> 24);
}

static void put_le16(uint8_t *p, uint16_t v)
{
    p[0] = (uint8_t)(v);
    p[1] = (uint8_t)(v >> 8);
}

int emit_nop_packet(uint8_t *buf, size_t n,
                    uint32_t opcode, uint16_t flags, uint32_t addr)
{
    if (n < 12)
        return -ENOSPC;

    put_le32(buf + 0, opcode);
    put_le16(buf + 4, flags);
    buf[6] = 0;
    buf[7] = 0;
    put_le32(buf + 8, addr);
    return 12;
}`,
    solutionNote:
      '移位取字节的序列化与 CPU 字节序无关，这是它优于"结构体 + memcpy"的根本原因（后者还受 padding 摆布）。GPU 命令流（PM4 包）、网络协议、文件格式都是同一套思路。内核里的 cpu_to_le32/le32_to_cpu 宏解决同类问题——但那要求你已经拿到一块布局精确的结构体，而手写序列化从源头绕开布局问题。保留字段必须显式写 0：硬件对"脏"保留位的反应是未定义的。',
    solutionNoteEn:
      'Shift-based serialization is independent of CPU endianness — the fundamental advantage over "struct + memcpy" (which padding also pushes around). GPU command streams (PM4 packets), network protocols and file formats all share this idea. The kernel’s cpu_to_le32/le32_to_cpu macros attack the same problem, but assume an exactly-laid-out struct; hand serialization sidesteps layout at the source. Reserved fields must be explicitly zeroed: hardware reaction to dirty reserved bits is undefined.',
  },
  {
    id: "c-12",
    track: "c",
    number: 12,
    title: "浮点数的位表示",
    titleEn: "The Bits of a Float",
    difficulty: "medium",
    minutes: 18,
    tags: ["union", "IEEE 754", "类型双关"],
    tagsEn: ["union", "IEEE 754", "type-punning"],
    lessonId: "cc-c-5",
    brief: "GPU 寄存器里存着 0x3F800000，文档说它是 1.0f——用 memcpy 拆开浮点数的三段位域。",
    briefEn: "A GPU register holds 0x3F800000 and the docs call it 1.0f — crack a float into its three bit fields with memcpy.",
    description: [
      '给 GPU 设置清屏颜色、深度边界时，驱动把 float 的**位模式**原样写进 u32 寄存器（如 `0x3F800000` 就是 1.0f）。这要求你能在"数值世界"和"位世界"之间自由穿梭。',
      '实现四个函数：`f32_bits(f)` 返回 float 的 32 位位模式（用 memcpy，别用指针强转——`*(uint32_t*)&f` 违反严格别名规则是 UB）；再按 IEEE 754 单精度布局拆出三段：`f32_sign(f)` 符号位（bit31）、`f32_exp(f)` 指数段（bit23..30，8 位，原始偏置值）、`f32_frac(f)` 尾数段（bit0..22，23 位）。',
      '自查素材：1.0f 的位模式是 0x3F800000（sign=0, exp=127, frac=0）；-2.5f 是 0xC0200000。',
    ],
    descriptionEn: [
      'When programming clear colors or depth bounds, the driver writes a float’s **bit pattern** verbatim into a u32 register (`0x3F800000` is 1.0f). You need to commute freely between the value world and the bit world.',
      'Implement four functions: `f32_bits(f)` returns the float’s 32-bit pattern (use memcpy — not a pointer cast: `*(uint32_t*)&f` violates strict aliasing and is UB); then slice the IEEE 754 single-precision layout: `f32_sign(f)` the sign bit (bit31), `f32_exp(f)` the exponent field (bits 23..30, 8 bits, raw biased value), `f32_frac(f)` the fraction (bits 0..22, 23 bits).',
      'Self-check material: 1.0f has pattern 0x3F800000 (sign=0, exp=127, frac=0); -2.5f is 0xC0200000.',
    ],
    language: "c",
    starterCode: `#include <stdint.h>
#include <string.h>

uint32_t f32_bits(float f)
{
    (void)f;
    return 0; /* TODO: memcpy 而不是指针强转 */
}

uint32_t f32_sign(float f)
{
    (void)f;
    return 0; /* TODO: bit31 */
}

uint32_t f32_exp(float f)
{
    (void)f;
    return 0; /* TODO: bit23..30 */
}

uint32_t f32_frac(float f)
{
    (void)f;
    return 0; /* TODO: bit0..22 */
}`,
    starterCodeEn: `#include <stdint.h>
#include <string.h>

uint32_t f32_bits(float f)
{
    (void)f;
    return 0; /* TODO: memcpy, not a pointer cast */
}

uint32_t f32_sign(float f)
{
    (void)f;
    return 0; /* TODO: bit31 */
}

uint32_t f32_exp(float f)
{
    (void)f;
    return 0; /* TODO: bits 23..30 */
}

uint32_t f32_frac(float f)
{
    (void)f;
    return 0; /* TODO: bits 0..22 */
}`,
    harness: `#include <stdio.h>
{{USER_CODE}}

static int _pass, _total;
static void check_hex(const char *label, uint32_t expect, uint32_t got)
{
    _total++;
    if (expect == got) { _pass++; printf("[PASS] %s\\n", label); }
    else printf("[FAIL] %s (expected=0x%X got=0x%X)\\n", label, expect, got);
}

int main(void)
{
    check_hex("bits(1.0f)", 0x3F800000u, f32_bits(1.0f));
    check_hex("bits(-2.5f)", 0xC0200000u, f32_bits(-2.5f));
    check_hex("bits(0.0f)", 0x00000000u, f32_bits(0.0f));

    check_hex("sign(1.0f)", 0u, f32_sign(1.0f));
    check_hex("sign(-2.5f)", 1u, f32_sign(-2.5f));

    check_hex("exp(1.0f) biased", 127u, f32_exp(1.0f));
    check_hex("exp(-2.5f) biased", 128u, f32_exp(-2.5f));
    check_hex("exp(0.0f)", 0u, f32_exp(0.0f));

    check_hex("frac(1.0f)", 0u, f32_frac(1.0f));
    check_hex("frac(-2.5f)", 0x200000u, f32_frac(-2.5f));
    check_hex("frac(0.375f)", 0x400000u, f32_frac(0.375f));

    check_hex("exp(inf) all ones", 255u, f32_exp(1.0f / 0.0f));

    printf("RESULT %d/%d\\n", _pass, _total);
    return _pass == _total ? 0 : 1;
}`,
    hints: [
      '标准姿势：`uint32_t u; memcpy(&u, &f, sizeof(u)); return u;`——编译器会把这个 memcpy 优化成一条寄存器搬运指令，零开销。',
      '三段切割都基于 f32_bits：sign 是 `bits >> 31`；exp 是 `(bits >> 23) & 0xFF`；frac 是 `bits & 0x7FFFFF`。',
      '0.375 = 0.25 + 0.125 = 1.5 × 2⁻²——归一化后尾数是 .5，对应 frac 的最高位。',
    ],
    hintsEn: [
      'The canonical move: `uint32_t u; memcpy(&u, &f, sizeof(u)); return u;` — compilers optimize this memcpy into a single register move, zero cost.',
      'All three slices build on f32_bits: sign is `bits >> 31`; exp is `(bits >> 23) & 0xFF`; frac is `bits & 0x7FFFFF`.',
      '0.375 = 0.25 + 0.125 = 1.5 × 2⁻² — normalized, the mantissa is .5, the top bit of frac.',
    ],
    solution: `#include <stdint.h>
#include <string.h>

uint32_t f32_bits(float f)
{
    uint32_t u;
    memcpy(&u, &f, sizeof(u));
    return u;
}

uint32_t f32_sign(float f)
{
    return f32_bits(f) >> 31;
}

uint32_t f32_exp(float f)
{
    return (f32_bits(f) >> 23) & 0xFFu;
}

uint32_t f32_frac(float f)
{
    return f32_bits(f) & 0x7FFFFFu;
}`,
    solutionNote:
      '类型双关的三种写法：指针强转（UB，禁）、union（C 合法、C++ 灰色）、memcpy（两门语言都合法且零开销）——记住 memcpy 这个唯一双保险。sign/exp/frac 的切法就是 c-05 的 GET_FIELD 在 IEEE 754 上的应用。Mesa 里 fui()/uif()（float↔uint 互转）做的就是这件事，着色器常量、清屏色都靠它进寄存器。',
    solutionNoteEn:
      'Three type-punning styles: pointer cast (UB — banned), union (legal C, gray C++), memcpy (legal in both and free) — remember memcpy as the only double-safe one. The sign/exp/frac slicing is problem c-05’s GET_FIELD applied to IEEE 754. Mesa’s fui()/uif() (float↔uint) do exactly this; shader constants and clear colors ride it into registers.',
  },
  {
    id: "c-13",
    track: "c",
    number: 13,
    title: "qsort 比较器：任务调度顺序",
    titleEn: "qsort Comparator: Job Scheduling Order",
    difficulty: "medium",
    minutes: 18,
    tags: ["函数指针", "qsort", "回调"],
    tagsEn: ["function-pointers", "qsort", "callbacks"],
    lessonId: "cc-c-7",
    brief: "把函数当参数传——为 GPU 任务写一个多键 qsort 比较器。",
    briefEn: "Pass a function as an argument — write a multi-key qsort comparator for GPU jobs.",
    description: [
      'libc 的 `qsort` 不知道你要排什么，它只负责搬运；"怎么比大小"由你用函数指针注入。这是 C 里最古老的回调模式，也是理解内核 ops 结构体的第一块踏板。',
      '给定 `struct gpu_job { int id; int prio; }`，实现比较器 `cmp_jobs(a, b)`（`const void *` 签名）与包装函数 `sort_jobs(jobs, n)`（内部调用 qsort）。排序规则：`prio` 大的在前（降序）；`prio` 相同时 `id` 小的在前（升序，保证结果确定）。',
      '经典坑：比较器返回 `a->prio - b->prio` 这种减法在极端值下会整型溢出。请用比较运算写。',
    ],
    descriptionEn: [
      'libc’s `qsort` doesn’t know what you’re sorting; it only moves bytes — you inject "how to compare" through a function pointer. This is C’s oldest callback pattern and the first stepping stone toward kernel ops structs.',
      'Given `struct gpu_job { int id; int prio; }`, implement the comparator `cmp_jobs(a, b)` (the `const void *` signature) and the wrapper `sort_jobs(jobs, n)` (calls qsort inside). Order: higher `prio` first (descending); ties broken by smaller `id` first (ascending — deterministic output).',
      'Classic pit: returning `a->prio - b->prio` overflows on extreme values. Use comparisons instead of subtraction.',
    ],
    language: "c",
    starterCode: `#include <stdlib.h>
#include <stddef.h>

struct gpu_job {
    int id;
    int prio;
};

/* prio 降序, 同 prio 按 id 升序。
 * 返回 <0 表示 a 排在 b 前, >0 表示 b 在前, 0 相等。 */
int cmp_jobs(const void *a, const void *b)
{
    (void)a; (void)b;
    return 0; /* TODO */
}

void sort_jobs(struct gpu_job *jobs, size_t n)
{
    (void)jobs; (void)n; /* TODO: 调 qsort, 把比较器作为参数传入 */
}`,
    starterCodeEn: `#include <stdlib.h>
#include <stddef.h>

struct gpu_job {
    int id;
    int prio;
};

/* prio descending; ties by ascending id.
 * Return <0 if a sorts before b, >0 if b sorts first, 0 if equal. */
int cmp_jobs(const void *a, const void *b)
{
    (void)a; (void)b;
    return 0; /* TODO */
}

void sort_jobs(struct gpu_job *jobs, size_t n)
{
    (void)jobs; (void)n; /* TODO: call qsort, passing the comparator */
}`,
    harness: `#include <stdio.h>
#include <limits.h>
{{USER_CODE}}

static int _pass, _total;
static void check(const char *label, int cond)
{
    _total++;
    if (cond) { _pass++; printf("[PASS] %s\\n", label); }
    else printf("[FAIL] %s\\n", label);
}

int main(void)
{
    struct gpu_job jobs[] = {
        { .id = 3, .prio = 1 },
        { .id = 1, .prio = 5 },
        { .id = 2, .prio = 5 },
        { .id = 4, .prio = 9 },
        { .id = 5, .prio = 1 },
    };
    sort_jobs(jobs, 5);

    check("highest prio first", jobs[0].id == 4);
    check("tie broken by id (1 before 2)", jobs[1].id == 1 && jobs[2].id == 2);
    check("lowest prio last, id asc", jobs[3].id == 3 && jobs[4].id == 5);

    /* overflow trap: subtraction-based comparators break here */
    struct gpu_job extreme[] = {
        { .id = 1, .prio = INT_MIN },
        { .id = 2, .prio = INT_MAX },
    };
    sort_jobs(extreme, 2);
    check("no subtraction overflow", extreme[0].prio == INT_MAX);

    struct gpu_job one[] = { { .id = 7, .prio = 0 } };
    sort_jobs(one, 1);
    check("single element untouched", one[0].id == 7);
    sort_jobs(one, 0);
    check("n==0 is safe", one[0].id == 7);

    check("comparator sign convention",
          cmp_jobs(&extreme[0], &extreme[1]) < 0 && cmp_jobs(&extreme[1], &extreme[0]) > 0);

    printf("RESULT %d/%d\\n", _pass, _total);
    return _pass == _total ? 0 : 1;
}`,
    hints: [
      '比较器第一步：把 `const void *` 转回真实类型——`const struct gpu_job *ja = a;`（C 里 void* 隐式转换）。',
      'prio 降序：`if (ja->prio != jb->prio) return (ja->prio > jb->prio) ? -1 : 1;`——想让谁在前，谁"更小"（返回负）。',
      'qsort 的调用：`qsort(jobs, n, sizeof(jobs[0]), cmp_jobs);`——函数名本身就是函数指针，不用取地址符（&cmp_jobs 也行，等价）。',
    ],
    hintsEn: [
      'Comparator step one: convert `const void *` back to the real type — `const struct gpu_job *ja = a;` (void* converts implicitly in C).',
      'Descending prio: `if (ja->prio != jb->prio) return (ja->prio > jb->prio) ? -1 : 1;` — whoever should come first must compare "smaller" (negative return).',
      'The qsort call: `qsort(jobs, n, sizeof(jobs[0]), cmp_jobs);` — a function name is already a function pointer; & is optional and equivalent.',
    ],
    solution: `#include <stdlib.h>
#include <stddef.h>

struct gpu_job {
    int id;
    int prio;
};

int cmp_jobs(const void *a, const void *b)
{
    const struct gpu_job *ja = a;
    const struct gpu_job *jb = b;

    if (ja->prio != jb->prio)
        return (ja->prio > jb->prio) ? -1 : 1;
    if (ja->id != jb->id)
        return (ja->id < jb->id) ? -1 : 1;
    return 0;
}

void sort_jobs(struct gpu_job *jobs, size_t n)
{
    qsort(jobs, n, sizeof(jobs[0]), cmp_jobs);
}`,
    solutionNote:
      '三个要点：void* 参数在比较器内部还原真实类型；多键比较逐级"先主键后次键"；用三目比较而非减法防溢出。函数指针作参数是 C 回调的原型——qsort 不认识 gpu_job，却能排好它，"机制与策略分离"。内核 sort()（lib/sort.c）接口几乎一样；GPU 调度器按优先级挑 ring 的逻辑就是这类比较的现实版。',
    solutionNoteEn:
      'Three points: restore the real type inside the comparator; multi-key comparison cascades primary-then-secondary; ternary comparisons instead of subtraction avoid overflow. Function-pointer parameters are C’s callback prototype — qsort has never heard of gpu_job yet sorts it: mechanism separated from policy. The kernel’s sort() (lib/sort.c) has a near-identical interface; the GPU scheduler picking rings by priority is this comparison in the wild.',
  },
  {
    id: "c-14",
    track: "c",
    number: 14,
    title: "ops 结构体：C 的手工多态",
    titleEn: "ops Structs: Hand-Rolled Polymorphism in C",
    difficulty: "hard",
    minutes: 25,
    tags: ["函数指针", "ops", "多态"],
    tagsEn: ["function-pointers", "ops", "polymorphism"],
    lessonId: "cc-c-7",
    brief: "amdgpu 的灵魂写法：一张函数指针表 + 一个 ctx 指针 = 没有类的面向对象。",
    briefEn: "The soul of amdgpu: a table of function pointers + a ctx pointer = OOP without classes.",
    description: [
      '内核是纯 C，却到处是"面向对象"：`struct amdgpu_ring_funcs` 里塞满函数指针，gfx 环、sdma 环各自填一张表，公共代码只管 `ring->funcs->emit_ib(...)`，不关心背后是谁。这就是 ops 结构体——本课程反复强调的核心惯用法，这次完全由你实现。',
      '给定 `struct engine_ops { const char *name; int (*submit)(void *ctx, int job); void (*reset)(void *ctx); }` 和上下文 `struct engine_ctx { int submitted; int total_cost; }`。实现：(1) gfx 引擎——submit 把 `job*2` 计入 total_cost；(2) sdma 引擎——submit 计入 `job` 本身；两者 submit 都自增 submitted、拒绝负数 job（返回 -EINVAL 且不改 ctx）；reset 把两个计数清零。(3) 通用驱动函数 `run_jobs(ops, ctx, jobs, n)`：依次 submit，遇到错误立即返回该错误，全部成功返回 0。',
      '注意 `run_jobs` 只能通过 `ops` 调函数——它必须对具体引擎一无所知。',
    ],
    descriptionEn: [
      'The kernel is pure C yet object-oriented everywhere: `struct amdgpu_ring_funcs` is stuffed with function pointers, gfx and sdma rings each fill in their own table, and common code just calls `ring->funcs->emit_ib(...)` without caring who is behind it. That is the ops struct — the core idiom this course keeps returning to, now implemented entirely by you.',
      'Given `struct engine_ops { const char *name; int (*submit)(void *ctx, int job); void (*reset)(void *ctx); }` and the context `struct engine_ctx { int submitted; int total_cost; }`. Implement: (1) the gfx engine — submit adds `job*2` to total_cost; (2) the sdma engine — submit adds `job` itself; both increment submitted and reject negative jobs (return -EINVAL, ctx untouched); reset zeroes both counters. (3) The generic driver `run_jobs(ops, ctx, jobs, n)`: submit each job in order, return the first error immediately, 0 if all succeed.',
      'Note: `run_jobs` may only call through `ops` — it must know nothing about concrete engines.',
    ],
    language: "c",
    starterCode: `#include <stddef.h>

#define EINVAL 22

struct engine_ctx {
    int submitted;
    int total_cost;
};

struct engine_ops {
    const char *name;
    int (*submit)(void *ctx, int job);
    void (*reset)(void *ctx);
};

/* TODO: 实现 gfx 的 submit/reset, 填好 ops 表 */
const struct engine_ops gfx_ops = {
    .name = "gfx",
    .submit = NULL,
    .reset = NULL,
};

/* TODO: 实现 sdma 的 submit/reset, 填好 ops 表 */
const struct engine_ops sdma_ops = {
    .name = "sdma",
    .submit = NULL,
    .reset = NULL,
};

/* 通用驱动: 只准通过 ops 调用, 不得直接引用上面的具体实现 */
int run_jobs(const struct engine_ops *ops, void *ctx, const int *jobs, size_t n)
{
    (void)ops; (void)ctx; (void)jobs; (void)n;
    return 0; /* TODO */
}`,
    starterCodeEn: `#include <stddef.h>

#define EINVAL 22

struct engine_ctx {
    int submitted;
    int total_cost;
};

struct engine_ops {
    const char *name;
    int (*submit)(void *ctx, int job);
    void (*reset)(void *ctx);
};

/* TODO: implement gfx submit/reset, fill in the ops table */
const struct engine_ops gfx_ops = {
    .name = "gfx",
    .submit = NULL,
    .reset = NULL,
};

/* TODO: implement sdma submit/reset, fill in the ops table */
const struct engine_ops sdma_ops = {
    .name = "sdma",
    .submit = NULL,
    .reset = NULL,
};

/* Generic driver: may only call through ops — no direct references
 * to the concrete implementations above. */
int run_jobs(const struct engine_ops *ops, void *ctx, const int *jobs, size_t n)
{
    (void)ops; (void)ctx; (void)jobs; (void)n;
    return 0; /* TODO */
}`,
    harness: `#include <stdio.h>
{{USER_CODE}}

static int _pass, _total;
static void check(const char *label, int cond)
{
    _total++;
    if (cond) { _pass++; printf("[PASS] %s\\n", label); }
    else printf("[FAIL] %s\\n", label);
}

/* A table only the judge knows about: run_jobs must dispatch generically. */
static int probe_submit(void *ctx, int job)
{
    struct engine_ctx *c = ctx;
    if (job < 0)
        return -EINVAL;
    c->submitted++;
    c->total_cost += job * 7;
    return 0;
}
static void probe_reset(void *ctx)
{
    struct engine_ctx *c = ctx;
    c->submitted = 0;
    c->total_cost = 0;
}
static const struct engine_ops probe_ops = {
    .name = "probe",
    .submit = probe_submit,
    .reset = probe_reset,
};

int main(void)
{
    struct engine_ctx gc = { 0, 0 }, sc = { 0, 0 };
    int jobs[] = { 3, 5, 2 };

    check("gfx run ok", run_jobs(&gfx_ops, &gc, jobs, 3) == 0);
    check("gfx submitted 3", gc.submitted == 3);
    check("gfx cost doubled", gc.total_cost == 20);

    check("sdma run ok", run_jobs(&sdma_ops, &sc, jobs, 3) == 0);
    check("sdma submitted 3", sc.submitted == 3);
    check("sdma cost raw", sc.total_cost == 10);

    /* one generic function, two different tables — polymorphism */
    check("ops names differ", gfx_ops.name[0] == 'g' && sdma_ops.name[0] == 's');

    int bad[] = { 1, -4, 9 };
    struct engine_ctx bc = { 0, 0 };
    check("error stops the pipeline", run_jobs(&gfx_ops, &bc, bad, 3) == -EINVAL);
    check("only first job landed", bc.submitted == 1 && bc.total_cost == 2);

    gfx_ops.reset(&gc);
    check("reset zeroes ctx", gc.submitted == 0 && gc.total_cost == 0);

    check("empty job list ok", run_jobs(&sdma_ops, &sc, NULL, 0) == 0);

    /* generic dispatch through a table the solution has never seen */
    struct engine_ctx pc = { 0, 0 };
    check("judge-private ops runs", run_jobs(&probe_ops, &pc, jobs, 3) == 0);
    check("judge-private ops accounted", pc.submitted == 3 && pc.total_cost == 70);
    probe_ops.reset(&pc);
    check("judge-private reset", pc.submitted == 0 && pc.total_cost == 0);

    printf("RESULT %d/%d\\n", _pass, _total);
    return _pass == _total ? 0 : 1;
}`,
    hints: [
      '具体实现是普通 static 函数：`static int gfx_submit(void *ctx, int job) { struct engine_ctx *c = ctx; ... }`——第一行把 void* 还原成真实上下文类型。',
      'ops 表用指定初始化器填：`.submit = gfx_submit, .reset = engine_reset`（两个引擎的 reset 行为一样，可以共用同一个函数——ops 表的自由度）。',
      'run_jobs 的循环体：`int ret = ops->submit(ctx, jobs[i]); if (ret < 0) return ret;`——通过指针调函数的语法和普通调用一样。',
    ],
    hintsEn: [
      'Concrete implementations are ordinary static functions: `static int gfx_submit(void *ctx, int job) { struct engine_ctx *c = ctx; ... }` — first line restores the real context type from void*.',
      'Fill the ops tables with designated initializers: `.submit = gfx_submit, .reset = engine_reset` (both engines reset identically, so they may share one function — that freedom is the point of ops tables).',
      'The run_jobs loop body: `int ret = ops->submit(ctx, jobs[i]); if (ret < 0) return ret;` — calling through a pointer looks exactly like a normal call.',
    ],
    solution: `#include <stddef.h>

#define EINVAL 22

struct engine_ctx {
    int submitted;
    int total_cost;
};

struct engine_ops {
    const char *name;
    int (*submit)(void *ctx, int job);
    void (*reset)(void *ctx);
};

static void engine_reset(void *ctx)
{
    struct engine_ctx *c = ctx;
    c->submitted = 0;
    c->total_cost = 0;
}

static int gfx_submit(void *ctx, int job)
{
    struct engine_ctx *c = ctx;
    if (job < 0)
        return -EINVAL;
    c->submitted++;
    c->total_cost += job * 2;
    return 0;
}

static int sdma_submit(void *ctx, int job)
{
    struct engine_ctx *c = ctx;
    if (job < 0)
        return -EINVAL;
    c->submitted++;
    c->total_cost += job;
    return 0;
}

const struct engine_ops gfx_ops = {
    .name = "gfx",
    .submit = gfx_submit,
    .reset = engine_reset,
};

const struct engine_ops sdma_ops = {
    .name = "sdma",
    .submit = sdma_submit,
    .reset = engine_reset,
};

int run_jobs(const struct engine_ops *ops, void *ctx, const int *jobs, size_t n)
{
    for (size_t i = 0; i < n; i++) {
        int ret = ops->submit(ctx, jobs[i]);
        if (ret < 0)
            return ret;
    }
    return 0;
}`,
    solutionNote:
      '这就是 C++ 虚函数表的手工版：ops 表 ≈ vtable，ctx ≈ this，静态函数 ≈ 成员函数。区别在 C 的表是显式的——你能在源码里直接看到、也能在运行时替换（内核热补丁的原理之一）。amdgpu 的 amdgpu_ring_funcs、DRM 的 drm_driver、文件系统的 file_operations 全是同一个模式。做完这题再看 cpp-08，你会看到同一设计在 C++ 里如何被语言原生化。',
    solutionNoteEn:
      'This is the hand-made C++ vtable: ops table ≈ vtable, ctx ≈ this, static functions ≈ methods. The difference: C’s table is explicit — visible in source and replaceable at runtime (one enabler of kernel live-patching). amdgpu’s amdgpu_ring_funcs, DRM’s drm_driver, filesystems’ file_operations are all the same pattern. After this, do cpp-08 to watch the same design become a native language feature in C++.',
  },
  {
    id: "c-15",
    track: "c",
    number: 15,
    title: "动态数组：倍增 realloc",
    titleEn: "Dynamic Array: Doubling with realloc",
    difficulty: "medium",
    minutes: 20,
    tags: ["malloc", "realloc", "所有权"],
    tagsEn: ["malloc", "realloc", "ownership"],
    lessonId: "cc-c-6",
    brief: "实现一个 push 时自动扩容的 u32 数组——判题会注入 realloc 失败，考验你的错误路径。",
    briefEn: "A u32 array that grows on push — the judge injects realloc failures to probe your error path.",
    description: [
      '驱动初始化时经常不知道最终要收多少个对象（探测到的显示器、解析出的固件段……），动态数组是标配。C 没有 vector，你要自己管理 `data/len/cap` 三元组。',
      '给定 `struct u32_vec { uint32_t *data; size_t len; size_t cap; }`，实现：`vec_init(v)` 三清零；`vec_push(v, val)`——容量不足时扩容（首扩 4，之后倍增），成功返回 0，内存不足返回 -ENOMEM（-12）；`vec_free(v)` 释放并**把三元组归零**（防悬垂指针，可安全重复调用）。扩容必须使用题面提供的 `mem_realloc`（语义与 realloc 完全一致）——判题会让它**定点失败**来检验你的失败路径。',
      'realloc 的招牌坑：`p = realloc(p, n)` 失败时返回 NULL 但旧块**仍然有效**——直接覆盖 p 就把旧内存漏了，而且 vec 从此报废。正确姿势是用临时变量接住，失败时返回 -ENOMEM 且 **vec 保持原样、继续可用**。',
    ],
    descriptionEn: [
      'Driver init often can’t know how many objects it will collect (probed monitors, parsed firmware sections…), so growable arrays are standard equipment. C has no vector; you manage the `data/len/cap` triple yourself.',
      'Given `struct u32_vec { uint32_t *data; size_t len; size_t cap; }`, implement: `vec_init(v)` zeroes all three; `vec_push(v, val)` — grow when full (first grow to 4, then double), return 0 on success or -ENOMEM (-12) on allocation failure; `vec_free(v)` frees and **re-zeroes the triple** (kills dangling pointers; safe to call twice). Growth must go through the provided `mem_realloc` (identical semantics to realloc) — the judge makes it **fail on cue** to probe your failure path.',
      'realloc’s signature trap: on failure `p = realloc(p, n)` returns NULL but the old block **remains valid** — overwriting p leaks it and bricks the vec. The correct stance: catch the result in a temporary; on failure return -ENOMEM with **the vec untouched and still usable**.',
    ],
    language: "c",
    starterCode: `#include <stdint.h>
#include <stdlib.h>

#define ENOMEM 12

/* ---- 判题提供: 可注入失败的 realloc (勿改) ---- */
extern int g_fail_next_realloc;
static void *mem_realloc(void *p, size_t size)
{
    if (g_fail_next_realloc) {
        g_fail_next_realloc = 0;
        return NULL;          /* 模拟内存不足: 旧块仍然有效 */
    }
    return realloc(p, size);
}
/* ---- 提供部分结束 ---- */

struct u32_vec {
    uint32_t *data;
    size_t len;
    size_t cap;
};

void vec_init(struct u32_vec *v)
{
    (void)v; /* TODO */
}

int vec_push(struct u32_vec *v, uint32_t val)
{
    (void)v; (void)val;
    return -ENOMEM; /* TODO: 用 mem_realloc 扩容(4 起步, 之后 x2);
                       失败时 vec 必须保持原样可用 */
}

void vec_free(struct u32_vec *v)
{
    (void)v; /* TODO: 释放后把 data/len/cap 全部归零 */
}`,
    starterCodeEn: `#include <stdint.h>
#include <stdlib.h>

#define ENOMEM 12

/* ---- Provided by the judge: realloc with failure injection (do not edit) ---- */
extern int g_fail_next_realloc;
static void *mem_realloc(void *p, size_t size)
{
    if (g_fail_next_realloc) {
        g_fail_next_realloc = 0;
        return NULL;          /* simulated OOM: the old block stays valid */
    }
    return realloc(p, size);
}
/* ---- end of provided section ---- */

struct u32_vec {
    uint32_t *data;
    size_t len;
    size_t cap;
};

void vec_init(struct u32_vec *v)
{
    (void)v; /* TODO */
}

int vec_push(struct u32_vec *v, uint32_t val)
{
    (void)v; (void)val;
    return -ENOMEM; /* TODO: grow via mem_realloc (start at 4, then double);
                       on failure the vec must stay intact and usable */
}

void vec_free(struct u32_vec *v)
{
    (void)v; /* TODO: free, then zero data/len/cap */
}`,
    harness: `#include <stdio.h>

int g_fail_next_realloc = 0;

{{USER_CODE}}

static int _pass, _total;
static void check(const char *label, int cond)
{
    _total++;
    if (cond) { _pass++; printf("[PASS] %s\\n", label); }
    else printf("[FAIL] %s\\n", label);
}

int main(void)
{
    struct u32_vec v;
    vec_init(&v);
    check("init: all zero", v.data == NULL && v.len == 0 && v.cap == 0);

    /* injected failure on the very first growth */
    g_fail_next_realloc = 1;
    check("first push under OOM -> -ENOMEM", vec_push(&v, 5) == -ENOMEM);
    check("vec still pristine", v.data == NULL && v.len == 0 && v.cap == 0);
    g_fail_next_realloc = 0;

    check("first push ok", vec_push(&v, 100) == 0);
    check("first grow to 4", v.cap == 4 && v.len == 1);

    for (uint32_t i = 1; i < 100; i++)
        if (vec_push(&v, 100 + i) != 0) { check("bulk push failed", 0); break; }
    check("len is 100", v.len == 100);
    check("cap doubled to 128", v.cap == 128);

    int content_ok = 1;
    for (uint32_t i = 0; i < 100; i++)
        if (v.data[i] != 100 + i) { content_ok = 0; break; }
    check("contents survive reallocs", content_ok);

    /* fill to the boundary, then fail exactly at the next growth */
    while (v.len < v.cap)
        vec_push(&v, 0xAB000000u + (uint32_t)v.len);
    check("filled to cap", v.len == 128 && v.cap == 128);

    g_fail_next_realloc = 1;
    check("growth OOM -> -ENOMEM", vec_push(&v, 7) == -ENOMEM);
    check("len/cap untouched on failure", v.len == 128 && v.cap == 128);
    check("old data intact after failed realloc",
          v.data != NULL && v.data[0] == 100 && v.data[99] == 199 && v.data[127] == 0xAB00007Fu);

    check("vec still usable after OOM", vec_push(&v, 777) == 0);
    check("recovered growth", v.cap == 256 && v.data[128] == 777);

    vec_free(&v);
    check("free re-zeroes", v.data == NULL && v.len == 0 && v.cap == 0);
    vec_free(&v);
    check("double free is safe", v.data == NULL);

    check("push after free restarts", vec_push(&v, 7) == 0 && v.data[0] == 7 && v.cap == 4);
    vec_free(&v);

    printf("RESULT %d/%d\\n", _pass, _total);
    return _pass == _total ? 0 : 1;
}`,
    hints: [
      '扩容判断：`if (v->len == v->cap)`。新容量 `v->cap ? v->cap * 2 : 4`。',
      '安全 realloc 三行诀：`uint32_t *tmp = mem_realloc(v->data, new_cap * sizeof(*tmp)); if (!tmp) return -ENOMEM; v->data = tmp;`——失败时旧数据原封不动，vec 依旧可用。判题会在首次扩容和 128→256 边界各注入一次失败。',
      'realloc(NULL, n) 等价于 malloc(n)，所以首次扩容不用特判。free(NULL) 也是合法空操作——这两条让代码少一半分支。',
    ],
    hintsEn: [
      'Growth test: `if (v->len == v->cap)`. New capacity: `v->cap ? v->cap * 2 : 4`.',
      'The safe-realloc tercet: `uint32_t *tmp = mem_realloc(v->data, new_cap * sizeof(*tmp)); if (!tmp) return -ENOMEM; v->data = tmp;` — on failure the old data is untouched and the vec stays usable. The judge injects one failure at the first growth and one at the 128→256 boundary.',
      'realloc(NULL, n) equals malloc(n), so the first growth needs no special case. free(NULL) is a legal no-op too — these two halve your branches.',
    ],
    solution: `#include <stdint.h>
#include <stdlib.h>

#define ENOMEM 12

extern int g_fail_next_realloc;
static void *mem_realloc(void *p, size_t size)
{
    if (g_fail_next_realloc) {
        g_fail_next_realloc = 0;
        return NULL;
    }
    return realloc(p, size);
}

struct u32_vec {
    uint32_t *data;
    size_t len;
    size_t cap;
};

void vec_init(struct u32_vec *v)
{
    v->data = NULL;
    v->len = 0;
    v->cap = 0;
}

int vec_push(struct u32_vec *v, uint32_t val)
{
    if (v->len == v->cap) {
        size_t new_cap = v->cap ? v->cap * 2 : 4;
        uint32_t *tmp = mem_realloc(v->data, new_cap * sizeof(*tmp));
        if (!tmp)
            return -ENOMEM;
        v->data = tmp;
        v->cap = new_cap;
    }
    v->data[v->len++] = val;
    return 0;
}

void vec_free(struct u32_vec *v)
{
    free(v->data);
    v->data = NULL;
    v->len = 0;
    v->cap = 0;
}`,
    solutionNote:
      '三条纪律：(1) realloc 结果必须用临时变量接，失败时旧块不漏、结构体状态不腐化——判题的两次失败注入专门打这里；(2) free 后立即置 NULL——free(NULL) 合法这一点让"重复释放安全"免费获得；(3) sizeof(*tmp) 而不是 sizeof(uint32_t)，类型改了表达式自动跟上。倍增摊还 O(1) 是所有 vector 的通用原理。内核的 krealloc 同套路，且内核评审同样把"失败路径不破坏原状态"当红线。',
    solutionNoteEn:
      'Three disciplines: (1) catch realloc in a temporary — on failure the old block isn’t leaked and the struct doesn’t rot (the judge’s two injected failures aim exactly here); (2) NULL the pointer right after free — free(NULL) being legal buys double-free safety for free; (3) sizeof(*tmp) rather than sizeof(uint32_t), so type changes propagate automatically. Amortized-O(1) doubling is the universal vector principle. The kernel’s krealloc plays the same game, and kernel review equally treats "failure paths leave state intact" as a red line.',
  },
  {
    id: "c-16",
    track: "c",
    number: 16,
    title: "创建与销毁：嵌套资源的生命周期",
    titleEn: "Create & Destroy: Nested Resource Lifetimes",
    difficulty: "hard",
    minutes: 25,
    tags: ["calloc", "生命周期", "错误回滚"],
    tagsEn: ["calloc", "lifetime", "error-rollback"],
    lessonId: "cc-c-6",
    brief: "device 里挂着 rings 数组——判题会让分配定点失败并核对每一次 free：回滚与销毁顺序无处可藏。",
    briefEn: "A device owns a rings array — the judge injects allocation failures and audits every free: rollback and destroy order have nowhere to hide.",
    description: [
      'amdgpu_device_init 要按顺序初始化几十个子系统，任何一步失败都必须把**已经成功的部分**按逆序拆掉再返回错误——这是驱动代码最容易出泄漏和 UAF 的地方。本题把这个结构缩小到两层给你练，且动真格：所有分配/释放必须走题面提供的 `mem_calloc`/`mem_free`（判题统计配平并注入定点失败）。',
      '给定 `struct ring { uint32_t *buf; size_t size; }` 和 `struct device { char name[16]; struct ring *rings; size_t nrings; }`。实现：`device_create(name, nrings, ring_size)`——用 mem_calloc 依次分配 device、拷贝名字（有界拷贝，超长截断）、分配 rings 数组、再为每个 ring 分配 `ring_size` 个 u32 的 buf；**任何一步失败都要用 mem_free 释放此前所有分配**并返回 NULL。`device_destroy(dev)`——逆序释放全部资源，`dev==NULL` 时安全无操作。',
      '判题会检查：结构完整性与清零、mem_calloc/mem_free 的次数**严格配平**（漏一次 free 或空转的 destroy 都会现形）、以及在第 1/2/4 次分配处注入失败后的回滚配平。本题保证 `nrings >= 1`、`ring_size >= 1`。',
    ],
    descriptionEn: [
      'amdgpu_device_init brings up dozens of subsystems in order, and any failure must tear down **exactly the parts that already succeeded**, in reverse, before returning the error — the single most leak- and UAF-prone territory in driver code. This problem shrinks that structure to two levels and plays it for real: all allocation/release must go through the provided `mem_calloc`/`mem_free` (the judge audits the balance and injects targeted failures).',
      'Given `struct ring { uint32_t *buf; size_t size; }` and `struct device { char name[16]; struct ring *rings; size_t nrings; }`. Implement `device_create(name, nrings, ring_size)`: mem_calloc the device, copy the name (bounded copy, truncate if long), mem_calloc the rings array, then a zeroed buf of `ring_size` u32s per ring; **on any failure mem_free everything allocated so far** and return NULL. And `device_destroy(dev)`: release everything in reverse; NULL is a safe no-op.',
      'The judge checks: structural integrity and zeroing, a **strict balance** of mem_calloc/mem_free calls (one missing free — or a destroy that does nothing — shows up immediately), and rollback balance with failures injected at allocations #1, #2 and #4. Guaranteed: `nrings >= 1`, `ring_size >= 1`.',
    ],
    language: "c",
    starterCode: `#include <stdint.h>
#include <stdlib.h>
#include <string.h>

/* ---- 判题提供: 计数 + 可注入失败的分配器 (勿改) ---- */
extern int g_allocs, g_frees, g_fail_countdown;
static void *mem_calloc(size_t n, size_t size)
{
    if (g_fail_countdown > 0 && --g_fail_countdown == 0)
        return NULL;                 /* 第 N 次分配注定失败 */
    void *p = calloc(n, size);
    if (p) g_allocs++;
    return p;
}
static void mem_free(void *p)
{
    if (p) { g_frees++; free(p); }
}
/* ---- 提供部分结束 ---- */

struct ring {
    uint32_t *buf;
    size_t size;
};

struct device {
    char name[16];
    struct ring *rings;
    size_t nrings;
};

struct device *device_create(const char *name, size_t nrings, size_t ring_size)
{
    (void)name; (void)nrings; (void)ring_size;
    return NULL; /* TODO: 全部用 mem_calloc/mem_free; 失败要回滚已分配资源 */
}

void device_destroy(struct device *dev)
{
    (void)dev; /* TODO: 逆序 mem_free, NULL 安全 */
}`,
    starterCodeEn: `#include <stdint.h>
#include <stdlib.h>
#include <string.h>

/* ---- Provided by the judge: counting allocator with failure injection (do not edit) ---- */
extern int g_allocs, g_frees, g_fail_countdown;
static void *mem_calloc(size_t n, size_t size)
{
    if (g_fail_countdown > 0 && --g_fail_countdown == 0)
        return NULL;                 /* the Nth allocation is doomed to fail */
    void *p = calloc(n, size);
    if (p) g_allocs++;
    return p;
}
static void mem_free(void *p)
{
    if (p) { g_frees++; free(p); }
}
/* ---- end of provided section ---- */

struct ring {
    uint32_t *buf;
    size_t size;
};

struct device {
    char name[16];
    struct ring *rings;
    size_t nrings;
};

struct device *device_create(const char *name, size_t nrings, size_t ring_size)
{
    (void)name; (void)nrings; (void)ring_size;
    return NULL; /* TODO: use mem_calloc/mem_free throughout; roll back on failure */
}

void device_destroy(struct device *dev)
{
    (void)dev; /* TODO: mem_free in reverse order, NULL-safe */
}`,
    harness: `#include <stdio.h>

int g_allocs = 0;
int g_frees = 0;
int g_fail_countdown = 0;

{{USER_CODE}}

static int _pass, _total;
static void check(const char *label, int cond)
{
    _total++;
    if (cond) { _pass++; printf("[PASS] %s\\n", label); }
    else printf("[FAIL] %s\\n", label);
}

int main(void)
{
    struct device *dev = device_create("gfx1100", 3, 64);
    check("create returns device", dev != NULL);
    if (!dev) { printf("RESULT %d/%d\\n", _pass, _total); return 1; }

    check("uses provided allocator (5 allocs)", g_allocs == 5);
    check("name copied", strcmp(dev->name, "gfx1100") == 0);
    check("nrings recorded", dev->nrings == 3);
    check("rings array allocated", dev->rings != NULL);

    int rings_ok = 1, zeroed = 1;
    for (size_t i = 0; i < 3; i++) {
        if (!dev->rings[i].buf || dev->rings[i].size != 64) rings_ok = 0;
        else for (size_t j = 0; j < 64; j++)
            if (dev->rings[i].buf[j] != 0) { zeroed = 0; break; }
    }
    check("each ring has a buf of right size", rings_ok);
    check("ring buffers zeroed", zeroed);

    dev->rings[0].buf[0] = 0xDEAD;
    dev->rings[2].buf[63] = 0xBEEF;
    device_destroy(dev);
    check("destroy frees exactly everything", g_allocs == 5 && g_frees == 5);

    device_destroy(NULL);
    check("destroy(NULL) is safe", g_frees == 5);

    struct device *d2 = device_create("this_name_is_way_too_long", 1, 8);
    check("long name truncated safely", d2 && strlen(d2->name) < 16);
    device_destroy(d2);
    check("second lifecycle balanced", g_allocs == g_frees);

    /* --- injected failures: rollback must free exactly what succeeded --- */
    int a0 = g_allocs, f0 = g_frees;

    g_fail_countdown = 1;   /* device itself fails */
    check("fail@1 -> NULL", device_create("x", 2, 8) == NULL);
    check("fail@1 balance", g_allocs == a0 && g_frees == f0);

    g_fail_countdown = 2;   /* rings array fails */
    check("fail@2 -> NULL", device_create("x", 2, 8) == NULL);
    check("fail@2 rolls back device", g_allocs == a0 + 1 && g_frees == f0 + 1);

    a0 = g_allocs; f0 = g_frees;
    g_fail_countdown = 4;   /* second ring buf fails */
    check("fail@4 -> NULL", device_create("x", 3, 8) == NULL);
    check("fail@4 rolls back dev+rings+buf0", g_allocs == a0 + 3 && g_frees == f0 + 3);

    struct device *d3 = device_create("a", 1, 1);
    check("still works after injections", d3 && d3->rings[0].size == 1);
    device_destroy(d3);
    check("final balance", g_allocs == g_frees);

    printf("RESULT %d/%d\\n", _pass, _total);
    return _pass == _total ? 0 : 1;
}`,
    hints: [
      '用 mem_calloc 起步的好处：结构体从诞生起就是全零——"哪些 ring 已分配"天然可判（buf 为 NULL 即未分配），回滚循环可以无脑 mem_free。',
      '中途失败的回滚可以直接复用 device_destroy(dev)——前提是结构体任何时刻都处于"可销毁"状态（calloc 起步 + 边分配边登记 nrings）。这是内核 goto err_xxx 阶梯的紧凑版。',
      '销毁顺序：先每个 ring 的 buf → 再 rings 数组 → 最后 device 本身。永远从叶子到根，反着创建顺序来。',
      '名字拷贝：`strncpy(dst, src, sizeof(dst) - 1);`——calloc 已保证末位是 0。',
    ],
    hintsEn: [
      'Starting with mem_calloc pays off: the struct is all-zero from birth — "which rings exist" is self-evident (NULL buf = not allocated) and the rollback loop can mem_free unconditionally.',
      'Mid-way failure can reuse device_destroy(dev) directly — provided the struct is destroyable at every instant (calloc start + register nrings as you go). This is the compact form of the kernel goto err_xxx ladder.',
      'Destroy order: each ring buf → the rings array → the device itself. Always leaves to root, reverse of creation.',
      'Name copy: `strncpy(dst, src, sizeof(dst) - 1);` — calloc already guaranteed the final NUL.',
    ],
    solution: `#include <stdint.h>
#include <stdlib.h>
#include <string.h>

extern int g_allocs, g_frees, g_fail_countdown;
static void *mem_calloc(size_t n, size_t size)
{
    if (g_fail_countdown > 0 && --g_fail_countdown == 0)
        return NULL;
    void *p = calloc(n, size);
    if (p) g_allocs++;
    return p;
}
static void mem_free(void *p)
{
    if (p) { g_frees++; free(p); }
}

struct ring {
    uint32_t *buf;
    size_t size;
};

struct device {
    char name[16];
    struct ring *rings;
    size_t nrings;
};

void device_destroy(struct device *dev)
{
    if (!dev)
        return;
    if (dev->rings) {
        for (size_t i = 0; i < dev->nrings; i++)
            mem_free(dev->rings[i].buf);
        mem_free(dev->rings);
    }
    mem_free(dev);
}

struct device *device_create(const char *name, size_t nrings, size_t ring_size)
{
    struct device *dev = mem_calloc(1, sizeof(*dev));
    if (!dev)
        return NULL;

    strncpy(dev->name, name, sizeof(dev->name) - 1);

    dev->rings = mem_calloc(nrings, sizeof(*dev->rings));
    if (!dev->rings)
        goto err_free_dev;
    dev->nrings = nrings;

    for (size_t i = 0; i < nrings; i++) {
        dev->rings[i].buf = mem_calloc(ring_size, sizeof(uint32_t));
        if (!dev->rings[i].buf)
            goto err_rollback;
        dev->rings[i].size = ring_size;
    }
    return dev;

err_rollback:
    device_destroy(dev);   /* calloc start guarantees un-allocated bufs are NULL */
    return NULL;

err_free_dev:
    mem_free(dev);
    return NULL;
}`,
    solutionNote:
      '核心设计：让结构体**任何时刻都处于可销毁状态**（calloc 起步 + 边分配边登记），失败路径就能收敛成一句 device_destroy——这是 goto 清理阶梯的高阶形态，内核里两种都常见。销毁永远逆序（叶→根），因为父结构里存着找到子资源的唯一线索。判题的三处失败注入分别打在"什么都没成功"、"只成功了根"、"成功了一半孩子"三种局面——真实驱动 review 也会拿这三种局面拷问你的 init 函数。calloc(n, size) 优于 malloc(n*size)：自带乘法溢出检查。',
    solutionNoteEn:
      'The core design: keep the struct **destroyable at every instant** (calloc start + register as you allocate) and the failure path collapses into one device_destroy call — the evolved goto ladder; kernels use both forms. Destruction is always reverse order (leaves→root): the parent holds the only map to its children. The judge’s three injection points hit three situations — "nothing succeeded", "only the root succeeded", "half the children succeeded" — exactly the situations real driver review interrogates your init function with. calloc(n, size) beats malloc(n*size): multiplication-overflow checking built in.',
  },
];
