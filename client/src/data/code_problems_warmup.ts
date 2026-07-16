/* ============================================================
   Code Lab — Track c0: C 基础热身 (C Preflight), 32 problems
   The on-ramp between "never wrote a C function" and the
   C Systems Core track. One new concept per problem; stages
   follow K.N. King / K&R / CS50 teaching order.
   w-32 (POSIX mmap) ships after the Phase-0 probe passed on
   both Godbolt and Wandbox (scripts/probe-mmap-backends.mjs).
   ============================================================ */
import type { CodeProblem } from "./code_problems_types";

export const codeProblemsWarmup: CodeProblem[] = [
  {
    id: "w-01",
    track: "c0",
    number: 1,
    title: "三数之和",
    titleEn: "Sum of Three",
    difficulty: "warmup",
    minutes: 5,
    tags: ["函数", "return"],
    tagsEn: ["functions", "return"],
    lessonId: "cc-c0-1",
    warmupStage: "function-io",
    brief: "你的第一个 C 函数：接收三个整数，返回它们的和。",
    briefEn: "Your first C function: take three integers, return their sum.",
    description: [
      "一个 C 函数由四部分组成：返回类型、函数名、参数列表、函数体。`int add3(int a, int b, int c)` 的意思是：这个函数叫 add3，接收三个 int（整数），算完后交回一个 int。",
      "实现 `add3`：返回 `a`、`b`、`c` 三个数的和。函数体里用 `return 表达式;` 把结果交回给调用者——`return` 一执行，函数立即结束。",
      '题目保证三数之和、以及任意两数的部分和都在 int 能表示的范围内，所以现在不用担心"溢出"——那是后面课程的话题。',
    ],
    descriptionEn: [
      "A C function has four parts: a return type, a name, a parameter list, and a body. `int add3(int a, int b, int c)` reads: this function is called add3, it takes three ints (integers), and it hands back an int when done.",
      "Implement `add3`: return the sum of `a`, `b` and `c`. Inside the body, `return expression;` delivers the result to the caller — the moment `return` runs, the function ends.",
      "The total and every partial sum of two of the numbers are guaranteed to fit in an int, so overflow is not your problem today — that is a topic for a later lesson.",
    ],
    language: "c",
    starterCode: `/* 你的第一个 C 函数: 返回 a + b + c */
int add3(int a, int b, int c)
{
    return 0; /* TODO: 把 0 换成正确的表达式 */
}`,
    starterCodeEn: `/* Your first C function: return a + b + c */
int add3(int a, int b, int c)
{
    return 0; /* TODO: replace 0 with the right expression */
}`,
    harness: `#include <stdio.h>
{{USER_CODE}}

static int _pass, _total;
static void check_int(const char *label, int expect, int got)
{
    _total++;
    if (expect == got) { _pass++; printf("[PASS] %s\\n", label); }
    else printf("[FAIL] %s (expected=%d got=%d)\\n", label, expect, got);
}

int main(void)
{
    check_int("1+2+3", 6, add3(1, 2, 3));
    check_int("all zeros", 0, add3(0, 0, 0));
    check_int("negatives cancel", 0, add3(-5, 2, 3));
    check_int("all negative", -6, add3(-1, -2, -3));
    check_int("bigger numbers", 6000000, add3(1000000, 2000000, 3000000));
    check_int("order does not matter", 6, add3(3, 2, 1));

    printf("RESULT %d/%d\\n", _pass, _total);
    return _pass == _total ? 0 : 1;
}`,
    hints: [
      "加法运算符就是 +：表达式 a + b + c 会先算出一个值。",
      "把那个表达式直接放进 return：`return a + b + c;`——不需要中间变量（想用也完全可以：`int sum = a + b + c; return sum;`）。",
      "常见笔误：忘了分号，或者把函数名写错。编译器报错时，先看它指出的行号。",
    ],
    hintsEn: [
      "The addition operator is +: the expression a + b + c evaluates to a single value.",
      "Put that expression straight into the return: `return a + b + c;` — no intermediate variable needed (though `int sum = a + b + c; return sum;` is fine too).",
      "Classic typos: a missing semicolon, or a misspelled function name. When the compiler complains, start from the line number it points at.",
    ],
    solution: `int add3(int a, int b, int c)
{
    return a + b + c;
}`,
    solutionNote:
      '一行 return 就够。值得记住的三件事：函数从 return 处立即结束；参数 a/b/c 是调用方传来的"副本"（下一阶段会体会到这一点的含义）；表达式先求值、再交回。这个"签名即契约"的读法——看返回类型和参数就知道函数怎么用——会贯穿整个 Code Lab。',
    solutionNoteEn:
      "One return line is enough. Three things worth keeping: a function ends the instant return runs; the parameters a/b/c are copies handed in by the caller (the next stages make the meaning of that vivid); the expression is evaluated first, then delivered. Reading a signature as a contract — return type plus parameters tell you how to use a function — will carry through the whole Code Lab.",
  },
  {
    id: "w-23",
    track: "c0",
    number: 23,
    title: "只练安全 realloc",
    titleEn: "Safe realloc, Nothing Else",
    difficulty: "warmup",
    minutes: 12,
    tags: ["realloc", "临时指针"],
    tagsEn: ["realloc", "temp-pointer"],
    lessonId: "cc-c0-6",
    warmupStage: "heap",
    nextSteps: [{ kind: "problem", id: "c-15" }],
    brief:
      "把一块 int 数组扩大——失败时原数据必须毫发无损。判题会注入一次失败。",
    briefEn:
      "Grow an int array — on failure the old data must survive untouched. The judge injects one failure.",
    description: [
      "realloc 可以把一块已分配的内存变大：`realloc(p, 新字节数)`。成功时返回新地址（内容自动搬过去，可能和原地址不同）；失败时返回 NULL，而**原来那块内存原封不动、仍然有效**。",
      "实现 `grow_to(arr, old_n, new_n)`：把 `*arr` 指向的数组从 `old_n` 个 int 扩到 `new_n` 个。成功：新增的 `[old_n, new_n)` 区域全部清 0，更新 `*arr`，返回 0。失败：返回 -ENOMEM，`*arr` 和原有内容必须保持原样——所以 realloc 的返回值要先接在一个**临时指针**里，确认不是 NULL 再覆盖 `*arr`。",
      "保证：`arr` 与 `*arr` 非 NULL，`0 <= old_n < new_n <= 2048`。判题器会让某一次 realloc 定点失败，专门检查你的失败路径。（参数是 `int **arr`——指向指针的指针：函数要修改调用方手里的那个指针，就得拿到它的地址，正如修改一个 int 要传 int*。）",
    ],
    descriptionEn: [
      "realloc can grow an allocated block: `realloc(p, new_byte_count)`. On success it returns the new address (contents are carried over; the address may differ). On failure it returns NULL — and **the original block stays untouched and valid**.",
      "Implement `grow_to(arr, old_n, new_n)`: grow the array at `*arr` from `old_n` ints to `new_n`. Success: zero the new region `[old_n, new_n)`, update `*arr`, return 0. Failure: return -ENOMEM with `*arr` and its contents exactly as they were — so catch realloc’s result in a **temporary pointer** first, and only overwrite `*arr` once it is not NULL.",
      "Guaranteed: `arr` and `*arr` are non-NULL, `0 <= old_n < new_n <= 2048`. The judge makes one realloc fail on purpose, specifically to inspect your failure path. (The parameter is `int **arr` — a pointer to a pointer: to modify the pointer the caller holds, the function needs its address, just like modifying an int takes an int*.)",
    ],
    language: "c",
    starterCode: `#include <stdlib.h>

#define ENOMEM 12

/* 把 *arr 从 old_n 个 int 扩到 new_n 个。
 * 成功: 新增区域清 0, 更新 *arr, 返回 0
 * 失败: 返回 -ENOMEM, *arr 与原内容保持原样
 * 保证: arr 与 *arr 非 NULL, 0 <= old_n < new_n <= 2048 */
int grow_to(int **arr, int old_n, int new_n)
{
    (void)arr; (void)old_n; (void)new_n;
    return -ENOMEM; /* TODO: realloc 接进临时指针; 失败不碰 *arr */
}`,
    starterCodeEn: `#include <stdlib.h>

#define ENOMEM 12

/* Grow *arr from old_n ints to new_n ints.
 * Success: zero the new region, update *arr, return 0
 * Failure: return -ENOMEM, leave *arr and its contents as they were
 * Guaranteed: arr and *arr non-NULL, 0 <= old_n < new_n <= 2048 */
int grow_to(int **arr, int old_n, int new_n)
{
    (void)arr; (void)old_n; (void)new_n;
    return -ENOMEM; /* TODO: catch realloc in a temp pointer; never touch *arr on failure */
}`,
    harness: `#include <stdio.h>
#include <stdlib.h>
#include <string.h>

/* Tracked allocator: learners write plain malloc/realloc/free, the
 * macros below intercept every call (defined after system headers,
 * so they cannot be bypassed by the user code). */
static int g_outstanding, g_reallocs, g_fail_next_realloc;
static void *tracked_malloc(size_t n)
{
    void *p = malloc(n);
    if (p) g_outstanding++;
    return p;
}
static void *tracked_calloc(size_t a, size_t b)
{
    void *p = calloc(a, b);
    if (p) g_outstanding++;
    return p;
}
static void *tracked_realloc(void *p, size_t n)
{
    if (g_fail_next_realloc) { g_fail_next_realloc = 0; return NULL; }
    void *q = realloc(p, n);
    if (q) { g_reallocs++; if (!p) g_outstanding++; }
    return q;
}
static void tracked_free(void *p)
{
    if (p) g_outstanding--;
    free(p);
}
#define malloc(n) tracked_malloc(n)
#define calloc(a, b) tracked_calloc((a), (b))
#define realloc(p, n) tracked_realloc((p), (n))
#define free(p) tracked_free(p)

{{USER_CODE}}

static int _pass, _total;
static void check(const char *label, int cond)
{
    _total++;
    if (cond) { _pass++; printf("[PASS] %s\\n", label); }
    else printf("[FAIL] %s\\n", label);
}

static int is_zero_range(const int *p, int from, int to)
{
    for (int i = from; i < to; i++)
        if (p[i] != 0) return 0;
    return 1;
}

int main(void)
{
    (void)tracked_calloc;

    int *a = malloc(4 * sizeof *a);
    for (int i = 0; i < 4; i++) a[i] = i + 1;

    int grew1 = grow_to(&a, 4, 8) == 0;
    check("grow 4 -> 8 succeeds", grew1);
    check("old values kept", grew1 && a[0] == 1 && a[1] == 2 && a[2] == 3 && a[3] == 4);
    check("new region zeroed", grew1 && is_zero_range(a, 4, 8));

    /* injected failure: EVERY byte of the old state must survive.
       All reads below stay within the old (guaranteed-live) range. */
    int snapshot[8];
    int fail_checked = 0, ptr_ok = 0, content_ok = 0;
    if (grew1) {
        a[7] = 42;
        memcpy(snapshot, a, sizeof snapshot);
        int *saved = a;
        g_fail_next_realloc = 1;
        fail_checked = grow_to(&a, 8, 16) == -12;
        ptr_ok = (a == saved);
        content_ok = ptr_ok && memcmp(a, snapshot, sizeof snapshot) == 0;
    }
    check("injected failure -> -ENOMEM", fail_checked);
    check("pointer untouched on failure", ptr_ok);
    check("EVERY old element untouched on failure", content_ok);

    int grew2 = grew1 && grow_to(&a, 8, 12) == 0;
    check("recovers after failure", grew2);
    check("recovery zeroes new region", grew2 && is_zero_range(a, 8, 12) && a[7] == 42);
    free(a);
    check("no leak in main path", g_outstanding == 0);

    int *b = malloc(1 * sizeof *b);
    b[0] = 7;
    int grew3 = grow_to(&b, 1, 2048) == 0;
    check("grow 1 -> 2048 (upper bound)", grew3);
    check("bound case values", grew3 && b[0] == 7 && is_zero_range(b, 1, 2048));
    free(b);
    check("allocator fully balanced", g_outstanding == 0);
    check("solution actually used realloc", g_reallocs >= 2);

    printf("RESULT %d/%d\\n", _pass, _total);
    return _pass == _total ? 0 : 1;
}`,
    hints: [
      "三行安全套路：`int *tmp = realloc(*arr, new_n * sizeof(int)); if (!tmp) return -ENOMEM; *arr = tmp;`——失败时 tmp 是 NULL，但 *arr 没被碰过。",
      "清零新增区用循环：`for (int i = old_n; i < new_n; i++) (*arr)[i] = 0;`——注意 `(*arr)[i]` 的括号：先解引用拿到数组指针，再下标。",
      "为什么不能写 `*arr = realloc(*arr, ...)`？失败时 realloc 返回 NULL，这一句会把调用方的指针覆盖成 NULL——旧内存地址从此丢失，既泄漏又让数据无法再访问。判题的注入失败测试就是冲着这一行来的。",
    ],
    hintsEn: [
      "The three-line safety pattern: `int *tmp = realloc(*arr, new_n * sizeof(int)); if (!tmp) return -ENOMEM; *arr = tmp;` — on failure tmp is NULL, but *arr was never touched.",
      "Zero the new region with a loop: `for (int i = old_n; i < new_n; i++) (*arr)[i] = 0;` — mind the parentheses in `(*arr)[i]`: dereference first to get the array pointer, then index.",
      "Why not `*arr = realloc(*arr, ...)`? On failure realloc returns NULL and that line overwrites the caller’s pointer with NULL — the old address is lost forever: a leak, and the data becomes unreachable. The judge’s injected failure aims squarely at this line.",
    ],
    solution: `#include <stdlib.h>

#define ENOMEM 12

int grow_to(int **arr, int old_n, int new_n)
{
    int *tmp = realloc(*arr, (size_t)new_n * sizeof(int));
    if (!tmp)
        return -ENOMEM;

    for (int i = old_n; i < new_n; i++)
        tmp[i] = 0;
    *arr = tmp;
    return 0;
}`,
    solutionNote:
      '这题只练一个纪律：realloc 的结果先进临时指针。失败路径三连——tmp 为 NULL、*arr 原样、返回 -ENOMEM——正是 c-15 动态数组和内核 krealloc 评审的同一条红线。另一个细节：清零写在 tmp 上、确认成功后才发布到 *arr，调用方视角里状态要么"全旧"要么"全新"，没有中间态。下一站 c-15：把这套动作放进倍增扩容的完整 vector。',
    solutionNoteEn:
      "One discipline, drilled in isolation: realloc’s result lands in a temporary first. The failure triple — tmp is NULL, *arr intact, return -ENOMEM — is the exact red line of c-15’s dynamic array and of kernel krealloc reviews. One more detail: the zeroing happens on tmp, published to *arr only after success, so the caller sees either fully-old or fully-new state, never a hybrid. Next stop c-15: the same moves inside a full doubling vector.",
  },
  {
    id: "w-02",
    track: "c0",
    number: 2,
    title: "摄氏转华氏",
    titleEn: "Celsius to Fahrenheit",
    difficulty: "warmup",
    minutes: 7,
    tags: ["浮点", "整型除法"],
    tagsEn: ["floating-point", "integer-division"],
    lessonId: "cc-c0-2",
    warmupStage: "function-io",
    brief: "一个换算公式，藏着 C 最著名的新手陷阱：整数除法。",
    briefEn:
      "One conversion formula hiding C’s most famous beginner trap: integer division.",
    description: [
      "把摄氏温度换算成华氏温度的公式是：F = C × 9/5 + 32。实现 `double c2f(double c)`，返回换算结果。",
      "这题的真正考点是一个陷阱：如果你把公式写成 `c * (9 / 5) + 32`，括号里的 `9 / 5` 是两个 int 相除——按整数除法规则结果是 1（0.8 被扔掉），整个函数就悄悄错了。写成 `c * 9 / 5`（从左到右，double 逐步参与）或 `c * (9.0 / 5.0)`（浮点字面量）都正确。",
      "判题用容差（±0.000001）比较浮点结果，不做精确相等——这是比较浮点数的通用纪律，因为浮点运算有微小的表示误差。",
    ],
    descriptionEn: [
      "Celsius converts to Fahrenheit via F = C × 9/5 + 32. Implement `double c2f(double c)` returning the converted value.",
      "The real point is a trap: written as `c * (9 / 5) + 32`, the parenthesized `9 / 5` divides two ints — integer-division rules make it 1 (the 0.8 is discarded) and the whole function is silently wrong. Both `c * 9 / 5` (left to right, the double joins every step) and `c * (9.0 / 5.0)` (floating literals) are correct.",
      "The judge compares with a tolerance (±0.000001) rather than exact equality — the universal discipline for floating point, whose arithmetic carries tiny representation errors.",
    ],
    language: "c",
    starterCode: `/* F = C x 9/5 + 32
 * 小心: 9 / 5 两个整数相除会发生什么? */
double c2f(double c)
{
    (void)c;
    return 0; /* TODO */
}`,
    starterCodeEn: `/* F = C x 9/5 + 32
 * Careful: what happens when the two integers 9 / 5 divide? */
double c2f(double c)
{
    (void)c;
    return 0; /* TODO */
}`,
    harness: `#include <stdio.h>
#include <math.h>
{{USER_CODE}}

static int _pass, _total;
static void check_close(const char *label, double expect, double got)
{
    _total++;
    if (fabs(expect - got) < 1e-6) { _pass++; printf("[PASS] %s\\n", label); }
    else printf("[FAIL] %s (expected=%.6f got=%.6f)\\n", label, expect, got);
}

int main(void)
{
    check_close("freezing point 0C", 32.0, c2f(0.0));
    check_close("boiling point 100C", 212.0, c2f(100.0));
    check_close("-40 is the same in both", -40.0, c2f(-40.0));
    check_close("body temperature 37C", 98.6, c2f(37.0));
    check_close("fractional input 21.5C", 70.7, c2f(21.5));

    printf("RESULT %d/%d\\n", _pass, _total);
    return _pass == _total ? 0 : 1;
}`,
    hints: [
      '先按直觉写一版跑跑看：如果 0 和 100 都过了、37 却挂了，说明你的公式只有"整数部分"是对的——回头找整数除法。',
      "正确写法一：`return c * 9 / 5 + 32;`——c 是 double，c*9 先变成 double，再除 5 仍是 double。",
      "正确写法二：`return c * (9.0 / 5.0) + 32;`——加上小数点，9.0 和 5.0 就是 double 字面量，括号里算出 1.8。",
    ],
    hintsEn: [
      "Write the intuitive version and run it: if 0 and 100 pass but 37 fails, only the integer part of your formula is right — go find the integer division.",
      "Correct spelling one: `return c * 9 / 5 + 32;` — c is double, so c*9 is double, and dividing by 5 stays double.",
      "Correct spelling two: `return c * (9.0 / 5.0) + 32;` — the decimal points make 9.0 and 5.0 double literals, so the parentheses hold 1.8.",
    ],
    solution: `double c2f(double c)
{
    return c * 9 / 5 + 32;
}`,
    solutionNote:
      "关键不是公式而是求值顺序：`c * 9 / 5` 从左到右，每一步都有 double 参与，整型除法根本没机会发生；`c * (9 / 5)` 则先在括号里做了一次纯 int 除法。-40 这个测试点有个好玩的背景：摄氏和华氏在 -40 度相遇。判题用 fabs(差) < 1e-6 的容差比较——记住浮点几乎永远不要用 == 精确比较。",
    solutionNoteEn:
      "The key is evaluation order, not the formula: `c * 9 / 5` goes left to right with a double in every step, so integer division never gets a chance; `c * (9 / 5)` performs a pure int division inside the parentheses first. The -40 test point has a fun backstory: Celsius and Fahrenheit meet at -40. The judge compares with fabs(diff) < 1e-6 — remember, floating point is almost never compared with exact ==.",
  },
  {
    id: "w-03",
    track: "c0",
    number: 3,
    title: "判断偶数",
    titleEn: "Even or Not",
    difficulty: "warmup",
    minutes: 5,
    tags: ["%", "bool"],
    tagsEn: ["%", "bool"],
    lessonId: "cc-c0-2",
    warmupStage: "function-io",
    brief: "用取余运算符 % 和 bool 类型回答一个是否问题——负数也要对。",
    briefEn:
      "Answer a yes/no question with the remainder operator % and bool — negatives included.",
    description: [
      '`%` 取的是除法的余数：`17 % 5` 是 2，`6 % 2` 是 0。偶数的定义正是"除以 2 余 0"。',
      "实现 `bool is_even(int n)`：n 是偶数返回 true，否则返回 false。`bool`、`true`、`false` 来自 `<stdbool.h>`（起始代码已包含）。",
      '别忘了负数：-4 也是偶数。C11 里负数取余的符号跟着被除数走（-3 % 2 是 -1），所以判断"余数是否为 0"天然对负数成立——但如果你写的是 `n % 2 == 1`，负奇数会漏判（题解细说）。',
    ],
    descriptionEn: [
      '`%` yields the remainder of a division: `17 % 5` is 2, `6 % 2` is 0. Evenness is exactly "remainder 0 when divided by 2".',
      "Implement `bool is_even(int n)`: return true when n is even, false otherwise. `bool`, `true`, `false` come from `<stdbool.h>` (already included in the starter).",
      'Do not forget negatives: -4 is even too. In C11 the remainder takes the dividend’s sign (-3 % 2 is -1), so testing "remainder equals 0" naturally covers negatives — but `n % 2 == 1` misses negative odds (the solution notes explain).',
    ],
    language: "c",
    starterCode: `#include <stdbool.h>

/* n 是偶数吗? 负偶数 (-4) 也要返回 true */
bool is_even(int n)
{
    (void)n;
    return false; /* TODO */
}`,
    starterCodeEn: `#include <stdbool.h>

/* Is n even? Negative evens (-4) must return true as well */
bool is_even(int n)
{
    (void)n;
    return false; /* TODO */
}`,
    harness: `#include <stdio.h>
#include <stdbool.h>
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
    check("4 is even", is_even(4) == true);
    check("7 is odd", is_even(7) == false);
    check("0 is even", is_even(0) == true);
    check("-4 is even", is_even(-4) == true);
    check("-3 is odd", is_even(-3) == false);
    check("1 is odd", is_even(1) == false);

    printf("RESULT %d/%d\\n", _pass, _total);
    return _pass == _total ? 0 : 1;
}`,
    hints: [
      "偶数 = 除以 2 的余数为 0：`n % 2 == 0`。",
      "比较表达式本身就是结果：`return n % 2 == 0;`——不需要 if/else 再包一层。",
      "如果你想反着判奇数，用 `n % 2 != 0` 而不是 `n % 2 == 1`——想想 -3 % 2 是多少。",
    ],
    hintsEn: [
      "Even = remainder 0 when divided by 2: `n % 2 == 0`.",
      "The comparison IS the result: `return n % 2 == 0;` — no need to wrap it in if/else.",
      "Testing oddness instead? Use `n % 2 != 0`, not `n % 2 == 1` — work out what -3 % 2 is.",
    ],
    solution: `#include <stdbool.h>

bool is_even(int n)
{
    return n % 2 == 0;
}`,
    solutionNote:
      '一行搞定，两个要点值得带走：(1) 比较表达式的值就是 1/0，可以直接 return——`if (n % 2 == 0) return true; else return false;` 是绕远路；(2) C11 的负数取余跟随被除数符号（-3 % 2 == -1），所以"== 0 判偶"对负数天然正确，而"== 1 判奇"是隐藏 bug。这也是 cc-c0-2 面试自查题的实战版。',
    solutionNoteEn:
      'One line, two takeaways: (1) a comparison already evaluates to 1/0, so return it directly — `if (n % 2 == 0) return true; else return false;` is the scenic route; (2) C11’s remainder follows the dividend’s sign (-3 % 2 == -1), so "== 0 for even" is naturally negative-safe while "== 1 for odd" is a hidden bug. This is the hands-on twin of cc-c0-2’s self-check question.',
  },
  {
    id: "w-04",
    track: "c0",
    number: 4,
    title: "打印一行加法",
    titleEn: "Print One Addition Line",
    difficulty: "warmup",
    minutes: 7,
    tags: ["printf", "格式串"],
    tagsEn: ["printf", "format-string"],
    lessonId: "cc-c0-1",
    warmupStage: "function-io",
    brief: "让 printf 输出一行一字不差的算式——空格和换行都算数。",
    briefEn:
      "Make printf produce one exact line of arithmetic — spaces and the newline all count.",
    description: [
      "实现 `void print_sum(int a, int b)`：向标准输出打印一行 `a + b = 和`，然后换行。格式必须一字不差：数字之间的 ` + ` 和 ` = ` 各带一个空格，行尾是 `\\n`。例如 `print_sum(2, 3)` 输出 `2 + 3 = 5`（后跟换行）。",
      "负数按 %d 的自然形式出现：`print_sum(10, -4)` 输出 `10 + -4 = 6`。",
      "这题判题器会把你的 printf 输出整个捕获下来逐字符比对——空函数、多打一个空格、漏掉换行都过不了。这正是格式串的纪律：输出格式是接口的一部分。",
    ],
    descriptionEn: [
      "Implement `void print_sum(int a, int b)`: print one line `a + b = sum` to standard output, then a newline. The format is exact: ` + ` and ` = ` each carry single spaces, and the line ends with `\\n`. E.g. `print_sum(2, 3)` prints `2 + 3 = 5` (newline after).",
      "Negatives appear in %d’s natural form: `print_sum(10, -4)` prints `10 + -4 = 6`.",
      "The judge captures your printf output and compares it character by character — an empty function, one extra space, or a missing newline all fail. That is format-string discipline: output format is part of the interface.",
    ],
    language: "c",
    starterCode: `#include <stdio.h>

/* 打印一行: a + b = 和 (行尾换行)
 * 例: print_sum(2, 3) -> "2 + 3 = 5\n" */
void print_sum(int a, int b)
{
    (void)a; (void)b;
    /* TODO: 一条 printf 就够 */
}`,
    starterCodeEn: `#include <stdio.h>

/* Print one line: a + b = sum (newline at the end)
 * e.g. print_sum(2, 3) -> "2 + 3 = 5\n" */
void print_sum(int a, int b)
{
    (void)a; (void)b;
    /* TODO: one printf is enough */
}`,
    harness: `#include <stdio.h>
#include <string.h>
#include <stdarg.h>

/* The judge captures printf output into a buffer while USER_CODE runs,
 * then restores the real printf for the protocol lines below. */
static char g_out[512];
static size_t g_len;
static int lab_printf(const char *fmt, ...)
{
    va_list ap;
    va_start(ap, fmt);
    int n = vsnprintf(g_out + g_len, sizeof(g_out) - g_len, fmt, ap);
    va_end(ap);
    if (n > 0) {
        g_len += (size_t)n;
        if (g_len >= sizeof(g_out)) g_len = sizeof(g_out) - 1;
    }
    return n;
}
#define printf lab_printf

{{USER_CODE}}

#undef printf

static int _pass, _total;
static void reset_capture(void)
{
    g_len = 0;
    g_out[0] = '\\0';
}
static void check_output(const char *label, const char *expect)
{
    _total++;
    if (strcmp(expect, g_out) == 0) { _pass++; printf("[PASS] %s\\n", label); }
    else printf("[FAIL] %s (expected=%s| got=%s|)\\n", label, expect, g_out);
}

int main(void)
{
    reset_capture();
    print_sum(2, 3);
    check_output("2 + 3 = 5", "2 + 3 = 5\\n");

    reset_capture();
    print_sum(0, 0);
    check_output("0 + 0 = 0", "0 + 0 = 0\\n");

    reset_capture();
    print_sum(10, -4);
    check_output("negative operand", "10 + -4 = 6\\n");

    reset_capture();
    print_sum(123, 877);
    check_output("bigger numbers", "123 + 877 = 1000\\n");

    reset_capture();
    print_sum(7, 8);
    print_sum(1, 1);
    check_output("two calls, two lines", "7 + 8 = 15\\n1 + 1 = 2\\n");

    printf("RESULT %d/%d\\n", _pass, _total);
    return _pass == _total ? 0 : 1;
}`,
    hints: [
      '格式串照着期望输出写，数字的位置换成 %d：`"%d + %d = %d\\n"`。',
      '三个坑位对应三个参数：`printf("%d + %d = %d\\n", a, b, a + b);`——第三个坑直接填表达式。',
      "挂了就对照失败信息里 expected= 和 got= 之间的差异——多半是空格数量或行尾 \\n。",
    ],
    hintsEn: [
      'Write the format string by copying the expected output, swapping numbers for %d: `"%d + %d = %d\\n"`.',
      'Three slots, three arguments: `printf("%d + %d = %d\\n", a, b, a + b);` — the third slot takes an expression directly.',
      "On failure, diff expected= against got= in the message — usually a space count or the trailing \\n.",
    ],
    solution: `#include <stdio.h>

void print_sum(int a, int b)
{
    printf("%d + %d = %d\\n", a, b, a + b);
}`,
    solutionNote:
      '一条 printf、三个 %d、一个换行。两件事值得记住：(1) 格式串里除占位符外的每个字符（空格、+、=）都会原样输出——所以"照着期望输出抄"是写格式串最稳的方法；(2) 占位符可以直接填表达式（a + b），printf 先求值再排版。判题捕获输出的手法（把 printf 换成写进缓冲区的版本）你以后会在内核日志、单元测试里反复见到同类思路。',
    solutionNoteEn:
      'One printf, three %d, one newline. Two keepers: (1) every character outside the placeholders (spaces, +, =) prints verbatim — so "copy the expected output" is the most reliable way to write a format string; (2) a slot can take an expression (a + b): printf evaluates first, typesets after. The judge’s capture trick (swapping printf for a buffer-writing version) is an idea you will meet again in kernel logging and unit tests.',
  },
  {
    id: "w-05",
    track: "c0",
    number: 5,
    title: "两数取大",
    titleEn: "Max of Two",
    difficulty: "warmup",
    minutes: 5,
    tags: ["if", "比较"],
    tagsEn: ["if", "comparison"],
    lessonId: "cc-c0-3",
    warmupStage: "branch",
    brief: "第一个分支：两个数里挑大的那个。",
    briefEn: "Your first branch: pick the larger of two numbers.",
    description: [
      "实现 `int max2(int a, int b)`：返回两者中较大的一个；相等时返回哪个都一样（值相同）。",
      "这是 if/else 的最小用武之地。C 还有一种单行写法叫条件运算符（三目）：`条件 ? 值1 : 值2`——条件为真取值1，否则取值2。两种写法都接受，先把 if/else 写顺再见识三目。",
    ],
    descriptionEn: [
      "Implement `int max2(int a, int b)`: return the larger of the two; when equal, either is fine (same value).",
      "This is the smallest home for if/else. C also offers a one-line form, the conditional (ternary) operator: `condition ? v1 : v2` — v1 when true, v2 otherwise. Both spellings are accepted; get if/else fluent first, then meet the ternary.",
    ],
    language: "c",
    starterCode: `/* 返回 a 与 b 中较大者 */
int max2(int a, int b)
{
    (void)a; (void)b;
    return 0; /* TODO */
}`,
    starterCodeEn: `/* Return the larger of a and b */
int max2(int a, int b)
{
    (void)a; (void)b;
    return 0; /* TODO */
}`,
    harness: `#include <stdio.h>
{{USER_CODE}}

static int _pass, _total;
static void check_int(const char *label, int expect, int got)
{
    _total++;
    if (expect == got) { _pass++; printf("[PASS] %s\\n", label); }
    else printf("[FAIL] %s (expected=%d got=%d)\\n", label, expect, got);
}

int main(void)
{
    check_int("a bigger", 9, max2(9, 3));
    check_int("b bigger", 9, max2(3, 9));
    check_int("equal", 5, max2(5, 5));
    check_int("both negative", -3, max2(-3, -9));
    check_int("negative vs zero", 0, max2(-7, 0));

    printf("RESULT %d/%d\\n", _pass, _total);
    return _pass == _total ? 0 : 1;
}`,
    hints: [
      "if/else 版：`if (a > b) return a; else return b;`——第一个 return 执行了就不会到第二个，所以 else 其实可以省。",
      "三目版：`return a > b ? a : b;`。",
      "两个负数比大小容易想反：-3 比 -9 大。",
    ],
    hintsEn: [
      "The if/else version: `if (a > b) return a; else return b;` — once the first return fires the second is unreachable, so the else is optional.",
      "The ternary version: `return a > b ? a : b;`.",
      "Comparing negatives flips intuition: -3 is greater than -9.",
    ],
    solution: `int max2(int a, int b)
{
    if (a > b)
        return a;
    return b;
}`,
    solutionNote:
      '两个细节：(1) "return 即出口"让 else 变多余——这种"提前返回"风格在真实代码里非常普遍，能减少嵌套层级；(2) a > b 还是 a >= b 在这题里结果相同（相等时返回谁都是同一个值），但在别的题里可能是稳定性问题——比较条件永远值得多看一眼。三目版 `a > b ? a : b` 正是 c-13 里 qsort 比较器和 cpp-09 里 max3 模板的雏形。',
    solutionNoteEn:
      'Two details: (1) "return is an exit" makes the else redundant — this early-return style is everywhere in real code and flattens nesting; (2) a > b versus a >= b happens to be equivalent here (equal values return the same thing), but elsewhere it becomes a stability question — comparison conditions always deserve a second look. The ternary `a > b ? a : b` is the embryo of c-13’s qsort comparator and cpp-09’s max3 template.',
  },
  {
    id: "w-06",
    track: "c0",
    number: 6,
    title: "区间夹取",
    titleEn: "Clamp to a Range",
    difficulty: "warmup",
    minutes: 5,
    tags: ["if", "边界"],
    tagsEn: ["if", "boundaries"],
    lessonId: "cc-c0-3",
    warmupStage: "branch",
    nextSteps: [{ kind: "problem", id: "cpp-01" }],
    brief: "把一个值按进 [lo, hi] 区间：低了抬到 lo，高了压到 hi。",
    briefEn:
      "Press a value into [lo, hi]: lift it to lo when below, cap it at hi when above.",
    description: [
      "实现 `int clamp_int(int v, int lo, int hi)`：v 小于 lo 返回 lo；v 大于 hi 返回 hi；否则返回 v 本身。保证 `lo <= hi`。",
      '"夹取"（clamp）在真实代码里无处不在——音量、亮度、坐标、寄存器字段值，任何"必须落在合法范围内"的量都要过这一道。恰好等于边界的值属于区间内，原样返回。',
    ],
    descriptionEn: [
      "Implement `int clamp_int(int v, int lo, int hi)`: return lo when v is below lo; hi when v is above hi; otherwise v itself. `lo <= hi` is guaranteed.",
      "Clamping is everywhere in real code — volume, brightness, coordinates, register field values: anything that must land inside a legal range passes through this gate. Values exactly on a boundary are inside the range and return unchanged.",
    ],
    language: "c",
    starterCode: `/* 把 v 夹进 [lo, hi] (保证 lo <= hi) */
int clamp_int(int v, int lo, int hi)
{
    (void)v; (void)lo; (void)hi;
    return 0; /* TODO */
}`,
    starterCodeEn: `/* Press v into [lo, hi] (lo <= hi guaranteed) */
int clamp_int(int v, int lo, int hi)
{
    (void)v; (void)lo; (void)hi;
    return 0; /* TODO */
}`,
    harness: `#include <stdio.h>
{{USER_CODE}}

static int _pass, _total;
static void check_int(const char *label, int expect, int got)
{
    _total++;
    if (expect == got) { _pass++; printf("[PASS] %s\\n", label); }
    else printf("[FAIL] %s (expected=%d got=%d)\\n", label, expect, got);
}

int main(void)
{
    check_int("below range", 0, clamp_int(-5, 0, 10));
    check_int("inside range", 7, clamp_int(7, 0, 10));
    check_int("above range", 10, clamp_int(99, 0, 10));
    check_int("exactly lo", 0, clamp_int(0, 0, 10));
    check_int("exactly hi", 10, clamp_int(10, 0, 10));
    check_int("negative range", -3, clamp_int(-2, -8, -3));
    check_int("single-point range", 5, clamp_int(42, 5, 5));

    printf("RESULT %d/%d\\n", _pass, _total);
    return _pass == _total ? 0 : 1;
}`,
    hints: [
      "两个 if 一个兜底：`if (v < lo) return lo; if (v > hi) return hi; return v;`。",
      "边界值（恰好等于 lo 或 hi）不满足任何一个 if 条件，自然落到最后的 return v——这正是 < 而不是 <= 的原因。",
      'lo == hi 的"单点区间"是合法输入：任何 v 都会被夹成那个点。',
    ],
    hintsEn: [
      "Two ifs and a fallthrough: `if (v < lo) return lo; if (v > hi) return hi; return v;`.",
      "Boundary values (exactly lo or hi) satisfy neither if, falling naturally to the final return v — exactly why the conditions use < rather than <=.",
      "A single-point range with lo == hi is legal input: every v clamps to that point.",
    ],
    solution: `int clamp_int(int v, int lo, int hi)
{
    if (v < lo)
        return lo;
    if (v > hi)
        return hi;
    return v;
}`,
    solutionNote:
      '三条路互斥完整：低于、高于、其余。用严格小于/大于让边界值走"原样返回"的路径，语义最干净。这份三行逻辑会在 cpp-01 原样重现两遍（int 与 double 重载），再到 cpp-09 合并成一个模板——同一个函数的三次进化，正好看清 C++ 泛型解决的是什么问题。',
    solutionNoteEn:
      'Three mutually exclusive, exhaustive paths: below, above, everything else. Strict < and > let boundary values take the "return unchanged" path — the cleanest semantics. These three lines reappear verbatim twice in cpp-01 (int and double overloads) and then merge into one template in cpp-09 — three evolutions of one function that show precisely which problem C++ generics solve.',
  },
  {
    id: "w-07",
    track: "c0",
    number: 7,
    title: "符号函数",
    titleEn: "The Sign Function",
    difficulty: "warmup",
    minutes: 5,
    tags: ["if-else-if", "三分支"],
    tagsEn: ["if-else-if", "three-way"],
    lessonId: "cc-c0-3",
    warmupStage: "branch",
    brief: "负数、零、正数——一个输入，三条互斥的路。",
    briefEn:
      "Negative, zero, positive — one input, three mutually exclusive paths.",
    description: [
      "实现 `int sign(int n)`：n 为负返回 -1，n 为 0 返回 0，n 为正返回 1。数学里这叫符号函数（signum）。",
      "三分支是 if / else if / else 的标准舞台：三个条件必须**互斥**（不会同时成立）且**完整**（任何输入都有归宿）。写完后自查：0 走的是哪条路？有没有输入会漏网？",
    ],
    descriptionEn: [
      "Implement `int sign(int n)`: return -1 for negative n, 0 for zero, 1 for positive. Mathematics calls this the signum function.",
      "A three-way split is the natural stage for if / else if / else: the branches must be **exclusive** (never simultaneously true) and **exhaustive** (every input has a home). Self-check afterwards: which path does 0 take? Can any input slip through?",
    ],
    language: "c",
    starterCode: `/* 负 -> -1, 零 -> 0, 正 -> 1 */
int sign(int n)
{
    (void)n;
    return 0; /* TODO */
}`,
    starterCodeEn: `/* negative -> -1, zero -> 0, positive -> 1 */
int sign(int n)
{
    (void)n;
    return 0; /* TODO */
}`,
    harness: `#include <stdio.h>
{{USER_CODE}}

static int _pass, _total;
static void check_int(const char *label, int expect, int got)
{
    _total++;
    if (expect == got) { _pass++; printf("[PASS] %s\\n", label); }
    else printf("[FAIL] %s (expected=%d got=%d)\\n", label, expect, got);
}

int main(void)
{
    check_int("negative", -1, sign(-42));
    check_int("zero", 0, sign(0));
    check_int("positive", 1, sign(7));
    check_int("minus one", -1, sign(-1));
    check_int("plus one", 1, sign(1));
    check_int("large negative", -1, sign(-1000000));
    check_int("large positive", 1, sign(1000000));

    printf("RESULT %d/%d\\n", _pass, _total);
    return _pass == _total ? 0 : 1;
}`,
    hints: [
      "骨架：`if (n < 0) return -1; else if (n > 0) return 1; else return 0;`——顺序可以换，逻辑不变。",
      '因为 return 即出口，else 都可以省：三个并列 if 也对，但 else if 更能表达"三选一"的意图。',
      "别写成 if (n < 0) ... if (n > 0) ... return 0; 之外还漏了什么吗？——没有，这三条已经覆盖整数全集。自查的习惯比这题本身重要。",
    ],
    hintsEn: [
      "Skeleton: `if (n < 0) return -1; else if (n > 0) return 1; else return 0;` — the order can vary, the logic cannot.",
      'Since return is an exit, every else is optional: three parallel ifs also work, but else-if better expresses "exactly one of three".',
      "Does `if (n < 0) ... if (n > 0) ... return 0;` leak any input? — No: those three cover all integers. The self-check habit matters more than this problem.",
    ],
    solution: `int sign(int n)
{
    if (n < 0)
        return -1;
    if (n > 0)
        return 1;
    return 0;
}`,
    solutionNote:
      '互斥 + 完整是多路分支的两条军规——三条路径把整数轴切成负/零/正，无重叠无缝隙。这个"把输入空间切干净"的思维在 w-09 的 0 特判、c-03 的空数组、k-06 的三段返回里反复出现。顺带认识一个惯用表达：sign 也能写成 `(n > 0) - (n < 0)`——两个比较各是 1/0，相减恰好得 -1/0/1。读懂它，但日常请写清晰的分支版。',
    solutionNoteEn:
      'Exclusive + exhaustive are the two martial laws of multi-way branching — the three paths cut the integer axis into negative/zero/positive with no overlap and no gap. This "partition the input space cleanly" mindset recurs in w-09’s zero case, c-03’s empty array, and k-06’s three-way return. Bonus idiom: sign can be written `(n > 0) - (n < 0)` — each comparison is 1/0 and the difference lands on -1/0/1. Understand it; write the clear branch version day to day.',
  },
  {
    id: "w-08",
    track: "c0",
    number: 8,
    title: "1 加到 n",
    titleEn: "Sum 1 through n",
    difficulty: "warmup",
    minutes: 5,
    tags: ["for", "累加"],
    tagsEn: ["for", "accumulator"],
    lessonId: "cc-c0-3",
    warmupStage: "loop",
    brief: "第一个循环：把 1 到 n 累加起来，n=0 也要对。",
    briefEn: "Your first loop: accumulate 1 through n — and n=0 must work too.",
    description: [
      "实现 `long sum_to(int n)`：返回 1 + 2 + ... + n。保证 `n >= 0` 且结果能装进 long。约定 `sum_to(0)` 返回 0（一个数都不加）。",
      '这是"累计变量 + 循环"的最小完整形态：先把累计变量初始化为 0，循环里逐个加上去。判题会拿 n=0 检验你的循环是否天然支持"零次执行"，拿高斯公式 n*(n+1)/2 对照大 n 的结果。',
    ],
    descriptionEn: [
      "Implement `long sum_to(int n)`: return 1 + 2 + ... + n. Guaranteed `n >= 0` and the result fits a long. By convention `sum_to(0)` returns 0 (nothing to add).",
      "This is the minimal complete form of accumulator-plus-loop: initialize the accumulator to 0, add one term per pass. The judge probes n=0 to see whether your loop naturally supports zero iterations, and checks large n against Gauss’s formula n*(n+1)/2.",
    ],
    language: "c",
    starterCode: `/* 1 + 2 + ... + n  (n >= 0; sum_to(0) == 0) */
long sum_to(int n)
{
    (void)n;
    return 0; /* TODO: 累计变量 + for 循环 */
}`,
    starterCodeEn: `/* 1 + 2 + ... + n  (n >= 0; sum_to(0) == 0) */
long sum_to(int n)
{
    (void)n;
    return 0; /* TODO: accumulator + for loop */
}`,
    harness: `#include <stdio.h>
{{USER_CODE}}

static int _pass, _total;
static void check_long(const char *label, long expect, long got)
{
    _total++;
    if (expect == got) { _pass++; printf("[PASS] %s\\n", label); }
    else printf("[FAIL] %s (expected=%ld got=%ld)\\n", label, expect, got);
}

int main(void)
{
    check_long("n=0 (zero-trip loop)", 0, sum_to(0));
    check_long("n=1", 1, sum_to(1));
    check_long("n=3", 6, sum_to(3));
    check_long("n=10", 55, sum_to(10));
    check_long("n=100 (Gauss)", 5050, sum_to(100));
    check_long("n=10000", 50005000L, sum_to(10000));

    printf("RESULT %d/%d\\n", _pass, _total);
    return _pass == _total ? 0 : 1;
}`,
    hints: [
      "骨架：`long sum = 0; for (int i = 1; i <= n; i++) sum += i; return sum;`。",
      '这题要从 1 数到 n **含两端**，所以是 `i <= n`——对照口诀"i < n 执行 n 次"适用的是从 0 开始的场景（cc-c0-3 的 debug 练习正是这个坑）。',
      "n=0 时 `i=1, 1<=0` 为假，循环零次，返回初始值 0——不需要任何特判。",
    ],
    hintsEn: [
      "Skeleton: `long sum = 0; for (int i = 1; i <= n; i++) sum += i; return sum;`.",
      'This counts 1 through n **inclusive**, hence `i <= n` — the chant "i < n runs n times" applies to zero-based counting (cc-c0-3’s debug exercise is exactly this pit).',
      "For n=0: `i=1, 1<=0` is false, the loop runs zero times, and the initial 0 is returned — no special case needed.",
    ],
    solution: `long sum_to(int n)
{
    long sum = 0;
    for (int i = 1; i <= n; i++)
        sum += i;
    return sum;
}`,
    solutionNote:
      '三个部件各就各位：累计变量初始化为"加法单位元"0；循环从 1 到 n 含两端（i <= n）；n=0 自然零次。`sum += i` 是 `sum = sum + i` 的缩写，读作"把 i 累进 sum"。顺带一提：这题存在 O(1) 公式解 n*(n+1)/2——判题两种都接受，但此刻循环写法才是练习目标；公式版里 n*(n+1) 的溢出问题会在 0.7.1.2 变成正经话题。',
    solutionNoteEn:
      'Each part in its place: the accumulator starts at addition’s identity 0; the loop runs 1 through n inclusive (i <= n); n=0 naturally takes zero trips. `sum += i` abbreviates `sum = sum + i` — read it as "fold i into sum". Aside: an O(1) formula n*(n+1)/2 exists — the judge accepts both, but the loop is today’s exercise; the overflow lurking in n*(n+1) becomes a serious topic in 0.7.1.2.',
  },
  {
    id: "w-09",
    track: "c0",
    number: 9,
    title: "数位个数",
    titleEn: "Counting Digits",
    difficulty: "warmup",
    minutes: 7,
    tags: ["while", "/10"],
    tagsEn: ["while", "/10"],
    lessonId: "cc-c0-3",
    warmupStage: "loop",
    brief: "一个数有几位？每轮除以 10 砍掉一位——但 0 是个陷阱。",
    briefEn:
      "How many digits does a number have? Divide by 10 to shave one per pass — but 0 is a trap.",
    description: [
      "实现 `int count_digits(int n)`：返回 n 的十进制位数。保证 `n >= 0`。注意约定：**0 有 1 位**。",
      "思路是整型除法的直接应用：`n / 10` 会把最后一位砍掉（12345 → 1234）。数一数砍几次能砍到 0，就是位数。先在纸上对 n=7 和 n=305 各走一遍，再写代码。",
      '为什么 0 是陷阱？如果你的循环条件是 `while (n > 0)`，n=0 会零次执行——返回 0 位。可 0 明明要打印一个字符"0"。这类"归零输入需要单独想一步"的情形，以后会不断遇到。',
    ],
    descriptionEn: [
      "Implement `int count_digits(int n)`: return the number of decimal digits of n. Guaranteed `n >= 0`. Mind the convention: **0 has 1 digit**.",
      "The idea applies integer division directly: `n / 10` shaves the last digit (12345 → 1234). Count how many shaves reach 0 — that is the digit count. Walk n=7 and n=305 on paper before typing.",
      'Why is 0 a trap? With a `while (n > 0)` condition, n=0 takes zero passes — reporting 0 digits. Yet 0 clearly prints as one character, "0". Inputs that need one extra thought at zero will keep appearing from here on.',
    ],
    language: "c",
    starterCode: `/* n 的十进制位数 (n >= 0; 约定 0 有 1 位) */
int count_digits(int n)
{
    (void)n;
    return 0; /* TODO: 想想 n == 0 */
}`,
    starterCodeEn: `/* Decimal digit count of n (n >= 0; 0 has 1 digit by convention) */
int count_digits(int n)
{
    (void)n;
    return 0; /* TODO: think about n == 0 */
}`,
    harness: `#include <stdio.h>
{{USER_CODE}}

static int _pass, _total;
static void check_int(const char *label, int expect, int got)
{
    _total++;
    if (expect == got) { _pass++; printf("[PASS] %s\\n", label); }
    else printf("[FAIL] %s (expected=%d got=%d)\\n", label, expect, got);
}

int main(void)
{
    check_int("zero has one digit", 1, count_digits(0));
    check_int("single digit", 1, count_digits(7));
    check_int("two digits", 2, count_digits(10));
    check_int("boundary 9 -> 1", 1, count_digits(9));
    check_int("boundary 100 -> 3", 3, count_digits(100));
    check_int("five digits", 5, count_digits(99999));
    check_int("large", 10, count_digits(2000000000));

    printf("RESULT %d/%d\\n", _pass, _total);
    return _pass == _total ? 0 : 1;
}`,
    hints: [
      "主体：`int count = 0; while (n > 0) { n /= 10; count++; } return count;`——先确认它对 7、305 是对的。",
      "然后处理 0：开头 `if (n == 0) return 1;` 一行搞定。",
      "另一种等价思路是 do-while（先做后判，0 也会数一次）——cc-c0-3 面试题刚讲过它的适用场景，可以两种都试。",
    ],
    hintsEn: [
      "Main body: `int count = 0; while (n > 0) { n /= 10; count++; } return count;` — confirm it on 7 and 305 first.",
      "Then handle 0: a single `if (n == 0) return 1;` up front.",
      "An equivalent take is do-while (run first, test after — 0 gets counted once too) — cc-c0-3’s interview question just covered when it fits; try both.",
    ],
    solution: `int count_digits(int n)
{
    if (n == 0)
        return 1;

    int count = 0;
    while (n > 0) {
        n /= 10;
        count++;
    }
    return count;
}`,
    solutionNote:
      '两个要点：(1) 归零输入的约定要先于代码存在——"0 有 1 位"是题意定的，不是循环推出来的，所以特判是对题意的忠实而非补丁；(2) 循环体里 n /= 10 严格递减保证终止，count++ 与之同步——"每轮砍一位、数一位"。边界测试 9→1、10→2、100→3 专打"该进位时是否多数/少数一位"。这个逐位剥离的手感在 c-10（十六进制解析）里会升级成逐字符累积。',
    solutionNoteEn:
      'Two points: (1) the zero convention exists before the code — "0 has 1 digit" comes from the problem statement, not from the loop, so the special case is fidelity to intent, not a patch; (2) inside the loop n /= 10 strictly decreases (guaranteeing termination) while count++ keeps pace — shave a digit, count a digit. The boundary tests 9→1, 10→2, 100→3 specifically attack off-by-one at digit rollover. This digit-peeling feel upgrades to per-character accumulation in c-10 (hex parsing).',
  },
  {
    id: "w-10",
    track: "c0",
    number: 10,
    title: "整数幂",
    titleEn: "Integer Power",
    difficulty: "warmup",
    minutes: 7,
    tags: ["循环", "累乘"],
    tagsEn: ["loops", "product"],
    lessonId: "cc-c0-3",
    warmupStage: "loop",
    nextSteps: [{ kind: "problem", id: "c-06" }],
    brief: 'base 的 exp 次方：累乘版的循环——乘法的"零次"是 1 不是 0。',
    briefEn:
      "base to the power exp: the loop, multiplication edition — and zero passes yield 1, not 0.",
    description: [
      "实现 `long power_int(int base, int exp)`：返回 base 的 exp 次方。保证 `exp >= 0` 且结果能装进 long。约定 `power_int(x, 0)` 对任何 x（包括 0）都返回 1。",
      "结构和 w-08 完全同构，只有一处本质不同：累加的初始值是 0（加法单位元），累乘的初始值必须是 **1**（乘法单位元）——初始化成 0 的话乘什么都是 0。",
      "负的 base 完全合法：(-3)³ = -27。exp 才被保证非负。",
    ],
    descriptionEn: [
      "Implement `long power_int(int base, int exp)`: return base raised to exp. Guaranteed `exp >= 0` with the result fitting a long. Convention: `power_int(x, 0)` returns 1 for every x (0 included).",
      "The structure mirrors w-08 exactly, with one essential difference: addition starts its accumulator at 0 (the additive identity), but a product must start at **1** (the multiplicative identity) — start at 0 and everything you multiply stays 0.",
      "Negative bases are perfectly legal: (-3)³ = -27. Only exp is guaranteed non-negative.",
    ],
    language: "c",
    starterCode: `/* base 的 exp 次方 (exp >= 0; x^0 == 1, 包括 0^0) */
long power_int(int base, int exp)
{
    (void)base; (void)exp;
    return 0; /* TODO: 累乘的初始值是多少? */
}`,
    starterCodeEn: `/* base to the exp (exp >= 0; x^0 == 1, including 0^0) */
long power_int(int base, int exp)
{
    (void)base; (void)exp;
    return 0; /* TODO: what does a running product start at? */
}`,
    harness: `#include <stdio.h>
{{USER_CODE}}

static int _pass, _total;
static void check_long(const char *label, long expect, long got)
{
    _total++;
    if (expect == got) { _pass++; printf("[PASS] %s\\n", label); }
    else printf("[FAIL] %s (expected=%ld got=%ld)\\n", label, expect, got);
}

int main(void)
{
    check_long("2^10", 1024, power_int(2, 10));
    check_long("(-3)^3", -27, power_int(-3, 3));
    check_long("(-2)^4 (even exp)", 16, power_int(-2, 4));
    check_long("x^0 == 1", 1, power_int(7, 0));
    check_long("0^0 == 1 (by convention)", 1, power_int(0, 0));
    check_long("0^5 == 0", 0, power_int(0, 5));
    check_long("1^100", 1, power_int(1, 100));
    check_long("10^9", 1000000000L, power_int(10, 9));

    printf("RESULT %d/%d\\n", _pass, _total);
    return _pass == _total ? 0 : 1;
}`,
    hints: [
      "骨架：`long result = 1; for (int i = 0; i < exp; i++) result *= base; return result;`。",
      "exp==0 时循环零次，返回初始值——所以初始值必须是 1：这一个数字同时满足了 x^0==1 的约定。",
      "负 base 不需要任何特殊处理：乘法自己会处理符号（负×负=正）。",
    ],
    hintsEn: [
      "Skeleton: `long result = 1; for (int i = 0; i < exp; i++) result *= base; return result;`.",
      "With exp==0 the loop takes zero trips and returns the initial value — which is exactly why it must be 1: that single digit also fulfills the x^0==1 convention.",
      "Negative bases need no special handling: multiplication manages signs on its own (negative × negative = positive).",
    ],
    solution: `long power_int(int base, int exp)
{
    long result = 1;
    for (int i = 0; i < exp; i++)
        result *= base;
    return result;
}`,
    solutionNote:
      '把 w-08 和这题并排看：同一副循环骨架，唯一的分歧是单位元——加法 0、乘法 1。选对初始值，"零次循环"就自动实现了 x^0==1 的数学约定，一行特判都不用。这种"让边界从结构里自然长出来"是好循环的标志。进阶方向（可选桥）：c-06 用位移在 O(1) 内得到 2 的幂——同一个数学对象，位运算的世界里另有一条路。',
    solutionNoteEn:
      "Put w-08 beside this one: the same loop skeleton, diverging only at the identity element — 0 for addition, 1 for multiplication. Choose the right initial value and the zero-trip loop implements the x^0==1 convention automatically, with not a single special case. Boundaries growing naturally out of structure is the signature of a good loop. Optional bridge: c-06 reaches powers of two in O(1) via shifts — the same mathematical object down a different road in bit-land.",
  },
  {
    id: "w-11",
    track: "c0",
    number: 11,
    title: "数组求和",
    titleEn: "Array Sum",
    difficulty: "warmup",
    minutes: 5,
    tags: ["数组", "遍历"],
    tagsEn: ["arrays", "traversal"],
    lessonId: "cc-c0-4",
    warmupStage: "array",
    brief: "第一次数组遍历：把 n 个元素加起来，空数组返回 0。",
    briefEn:
      "Your first array traversal: add up n elements; an empty array sums to 0.",
    description: [
      "实现 `long array_sum(const int a[], int n)`：返回 `a[0] + a[1] + ... + a[n-1]`。保证 `n >= 0`；`n == 0` 时返回 0。",
      '这是"指针 + 长度"约定的第一次亮相：数组自己不记得多长，长度 n 由调用方一起递进来。循环骨架就是 cc-c0-3 学的那副，条件 `i < n` 在这里同时是安全线——`a[n]` 是越界。',
      "签名里的 `const` 是函数对调用方的承诺：只读，不改你的数组。",
    ],
    descriptionEn: [
      "Implement `long array_sum(const int a[], int n)`: return `a[0] + a[1] + ... + a[n-1]`. Guaranteed `n >= 0`; return 0 when `n == 0`.",
      "This is the debut of the pointer-plus-length convention: arrays do not know their length, so the caller passes n alongside. The loop skeleton is exactly cc-c0-3’s, and the condition `i < n` doubles as the safety line — `a[n]` is out of bounds.",
      "The `const` in the signature is the function’s promise to the caller: read-only, your array stays untouched.",
    ],
    language: "c",
    starterCode: `/* a[0] + ... + a[n-1]; n == 0 -> 0 */
long array_sum(const int a[], int n)
{
    (void)a; (void)n;
    return 0; /* TODO */
}`,
    starterCodeEn: `/* a[0] + ... + a[n-1]; n == 0 -> 0 */
long array_sum(const int a[], int n)
{
    (void)a; (void)n;
    return 0; /* TODO */
}`,
    harness: `#include <stdio.h>
{{USER_CODE}}

static int _pass, _total;
static void check_long(const char *label, long expect, long got)
{
    _total++;
    if (expect == got) { _pass++; printf("[PASS] %s\\n", label); }
    else printf("[FAIL] %s (expected=%ld got=%ld)\\n", label, expect, got);
}

int main(void)
{
    int a[] = { 3, 1, 4, 1, 5 };
    check_long("five elements", 14, array_sum(a, 5));
    check_long("single element", 3, array_sum(a, 1));
    check_long("empty array", 0, array_sum(a, 0));

    int b[] = { -2, 7, -5 };
    check_long("with negatives", 0, array_sum(b, 3));

    int c[] = { 1000000, 1000000, 1000000 };
    check_long("larger values", 3000000, array_sum(c, 3));

    printf("RESULT %d/%d\\n", _pass, _total);
    return _pass == _total ? 0 : 1;
}`,
    hints: [
      "骨架：`long sum = 0; for (int i = 0; i < n; i++) sum += a[i]; return sum;`。",
      '和 w-08 唯一的区别：加的不再是 i 本身，而是 a[i]——下标 i 是"第几个"，a[i] 才是"值"。',
      'n==0 时循环零次返回 0，无需特判——这就是上一课说的"零次循环自然正确"。',
    ],
    hintsEn: [
      "Skeleton: `long sum = 0; for (int i = 0; i < n; i++) sum += a[i]; return sum;`.",
      'The only change from w-08: you add a[i], not i itself — i is "which one", a[i] is "the value".',
      'n==0 takes zero trips and returns 0, no special case — the "zero-trip loops are naturally correct" principle from last lesson.',
    ],
    solution: `long array_sum(const int a[], int n)
{
    long sum = 0;
    for (int i = 0; i < n; i++)
        sum += a[i];
    return sum;
}`,
    solutionNote:
      '模板确立：初始化累计变量 → for (i < n) → 逐个并入 → 返回。之后一整族题（计数、找最大、查找）都在这副骨架上换零件。两个习惯从这题带走：写数组函数先想 n==0；能 const 就 const。这份签名向上直连 c-03——同一道题加上 size_t、NULL 检查和 errno 之后的"系统核心版"。',
    solutionNoteEn:
      "The template is established: seed the accumulator → for (i < n) → fold elements in → return. A whole family of problems (count, max, search) swaps parts on this same skeleton. Two habits to take away: think n==0 first for every array function; write const whenever true. This exact signature connects straight up to c-03 — the systems-core edition of the same problem once size_t, NULL checks and errno arrive.",
  },
  {
    id: "w-12",
    track: "c0",
    number: 12,
    title: "数组最大值",
    titleEn: "Array Maximum",
    difficulty: "warmup",
    minutes: 7,
    tags: ["数组", "擂台变量"],
    tagsEn: ["arrays", "champion-variable"],
    lessonId: "cc-c0-4",
    warmupStage: "array",
    brief: "打擂台找最大——初始擂主选错，全负数组会当场揭穿你。",
    briefEn:
      "Crown the maximum by tournament — seed the wrong champion and an all-negative array exposes you instantly.",
    description: [
      '实现 `int array_max(const int a[], int n)`：返回数组中的最大值。保证 `n >= 1`（至少一个元素，所以"最大值"总是存在）。',
      '思路是"擂台"：先立一个擂主，然后每个元素上台比一次，更强就换人。这题的全部考点在第一步——**擂主初始化成谁**。初始化成 0 的版本在 `{-5, -2, -9}` 上会返回 0：一个根本不在数组里的数。',
    ],
    descriptionEn: [
      "Implement `int array_max(const int a[], int n)`: return the largest element. Guaranteed `n >= 1` (at least one element, so a maximum always exists).",
      "Think tournament: seat an initial champion, then every element challenges once; a stronger one takes the throne. The whole point of this problem is step one — **who is the initial champion**. The version seeded with 0 returns 0 on `{-5, -2, -9}`: a number that is not even in the array.",
    ],
    language: "c",
    starterCode: `/* 最大元素 (保证 n >= 1) */
int array_max(const int a[], int n)
{
    (void)a; (void)n;
    return 0; /* TODO: 擂主初始化成谁? */
}`,
    starterCodeEn: `/* Largest element (n >= 1 guaranteed) */
int array_max(const int a[], int n)
{
    (void)a; (void)n;
    return 0; /* TODO: who seeds the championship? */
}`,
    harness: `#include <stdio.h>
{{USER_CODE}}

static int _pass, _total;
static void check_int(const char *label, int expect, int got)
{
    _total++;
    if (expect == got) { _pass++; printf("[PASS] %s\\n", label); }
    else printf("[FAIL] %s (expected=%d got=%d)\\n", label, expect, got);
}

int main(void)
{
    int a[] = { 3, 9, 1, 7 };
    check_int("max in middle-ish", 9, array_max(a, 4));

    int b[] = { -5, -2, -9 };
    check_int("all negative (the trap)", -2, array_max(b, 3));

    int c[] = { 42 };
    check_int("single element", 42, array_max(c, 1));

    int d[] = { 1, 2, 3, 4, 5 };
    check_int("max at the end", 5, array_max(d, 5));

    int e[] = { 5, 4, 3, 2, 1 };
    check_int("max at the front", 5, array_max(e, 5));

    int f[] = { 7, 7, 7 };
    check_int("all equal", 7, array_max(f, 3));

    printf("RESULT %d/%d\\n", _pass, _total);
    return _pass == _total ? 0 : 1;
}`,
    hints: [
      '擂主 = 第一个元素：`int best = a[0];`——它一定"在数组里"，这是 0 做不到的。',
      "循环从 i = 1 开始（a[0] 已经是擂主），逐个挑战：`if (a[i] > best) best = a[i];`。",
      '为什么题目保证 n >= 1？因为空数组没有最大值可言——"约定先于代码"，接口设计把无意义的输入挡在门外。',
    ],
    hintsEn: [
      'The champion is the first element: `int best = a[0];` — it is guaranteed to be "in the array", which 0 cannot claim.',
      "Loop from i = 1 (a[0] already reigns), challenging one by one: `if (a[i] > best) best = a[i];`.",
      "Why does the problem guarantee n >= 1? An empty array has no maximum to speak of — contracts precede code, and interface design keeps meaningless inputs at the door.",
    ],
    solution: `int array_max(const int a[], int n)
{
    int best = a[0];
    for (int i = 1; i < n; i++) {
        if (a[i] > best)
            best = a[i];
    }
    return best;
}`,
    solutionNote:
      '擂台模式三要素：擂主必须来自数据本身（a[0]），挑战从第二个开始（i=1），换人条件用 >（用 >= 也对，只是相等时多换几次）。“初始值必须是合法候选”这条原则的反例遍地都是：用 0 找最大、用 0 找最小、用空串找最长……全都会被"极端但合法"的输入揭穿。测试里全负数组、单元素、全相等三个用例正是冲着这些初始化错误来的。',
    solutionNoteEn:
      'The tournament pattern has three parts: the seed must come from the data itself (a[0]), challenges start from the second element (i=1), and the throne changes on > (>= also works, with extra swaps on ties). Violations of "the seed must be a legal candidate" are everywhere: 0 for max, 0 for min, empty string for longest… all unmasked by extreme-but-legal inputs. The all-negative, single-element and all-equal cases exist precisely to catch those seeds.',
  },
  {
    id: "w-13",
    track: "c0",
    number: 13,
    title: "统计正数",
    titleEn: "Count the Positives",
    difficulty: "warmup",
    minutes: 5,
    tags: ["数组", "条件计数"],
    tagsEn: ["arrays", "conditional-count"],
    lessonId: "cc-c0-4",
    warmupStage: "array",
    nextSteps: [{ kind: "problem", id: "c-03" }],
    brief: "遍历 + 条件 + 计数：数组题三件套的合体。",
    briefEn: "Traversal + condition + counter: the array trio combined.",
    description: [
      "实现 `int count_positive(const int a[], int n)`：统计数组中**严格大于 0** 的元素个数。保证 `n >= 0`；空数组返回 0。",
      '把 w-11 的"无条件并入"改成"符合条件才计数"：循环体里加一个 if。注意 0 本身不算正数。',
    ],
    descriptionEn: [
      "Implement `int count_positive(const int a[], int n)`: count elements **strictly greater than 0**. Guaranteed `n >= 0`; an empty array counts 0.",
      "Turn w-11’s unconditional fold into count-only-when-qualified: one if inside the loop body. Note that 0 itself is not positive.",
    ],
    language: "c",
    starterCode: `/* 严格大于 0 的元素个数; n == 0 -> 0 */
int count_positive(const int a[], int n)
{
    (void)a; (void)n;
    return 0; /* TODO */
}`,
    starterCodeEn: `/* Count of elements strictly greater than 0; n == 0 -> 0 */
int count_positive(const int a[], int n)
{
    (void)a; (void)n;
    return 0; /* TODO */
}`,
    harness: `#include <stdio.h>
{{USER_CODE}}

static int _pass, _total;
static void check_int(const char *label, int expect, int got)
{
    _total++;
    if (expect == got) { _pass++; printf("[PASS] %s\\n", label); }
    else printf("[FAIL] %s (expected=%d got=%d)\\n", label, expect, got);
}

int main(void)
{
    int a[] = { 3, -1, 0, 7, -5, 2 };
    check_int("mixed signs", 3, count_positive(a, 6));

    int b[] = { -4, -2, -9 };
    check_int("all negative", 0, count_positive(b, 3));

    int c[] = { 1, 2, 3 };
    check_int("all positive", 3, count_positive(c, 3));

    int d[] = { 0, 0, 0 };
    check_int("zeros are not positive", 0, count_positive(d, 3));

    check_int("empty array", 0, count_positive(a, 0));

    printf("RESULT %d/%d\\n", _pass, _total);
    return _pass == _total ? 0 : 1;
}`,
    hints: [
      "骨架：`int count = 0; for (int i = 0; i < n; i++) if (a[i] > 0) count++; return count;`。",
      '"严格大于"意味着条件是 `> 0` 而不是 `>= 0`——全零用例专门验证这一点。',
      "计数器和累加器是同一个概念：只是每次 +1 而不是 +a[i]。",
    ],
    hintsEn: [
      "Skeleton: `int count = 0; for (int i = 0; i < n; i++) if (a[i] > 0) count++; return count;`.",
      '"Strictly greater" means the condition is `> 0`, not `>= 0` — the all-zero case exists to verify exactly that.',
      "A counter is just an accumulator that adds 1 instead of a[i].",
    ],
    solution: `int count_positive(const int a[], int n)
{
    int count = 0;
    for (int i = 0; i < n; i++) {
        if (a[i] > 0)
            count++;
    }
    return count;
}`,
    solutionNote:
      '条件计数 = 遍历骨架 + 谓词（predicate，"是否符合条件"的判断）。谓词换成 a[i] % 2 == 0 就是数偶数。做完这题你已拥有 c-03 的全部前置——同一骨架升级成 size_t 长度、NULL 检查与系统错误码，强烈建议立刻去试。边界上"0 算不算"这类严格/非严格之分，正是题意与实现之间最容易滑走的一毫米——测试用全零数组把它钉死。下一站 c-03：同一道题的内核纪律版（size_t、NULL、-EINVAL）。',
    solutionNoteEn:
      'Conditional counting = the traversal skeleton + a predicate (the "does it qualify" test). Swap the predicate to a[i] % 2 == 0 and you count evens. This problem also hands you every prerequisite of c-03 — the same skeleton upgraded with size_t lengths, NULL checks and system error codes; trying it next is strongly encouraged. The strict-versus-inclusive question ("does 0 count?") is precisely the millimeter where intent and implementation slip apart — the all-zeros test nails it down. Next stop c-03: the kernel-discipline edition (size_t, NULL, -EINVAL).',
  },
  {
    id: "w-14",
    track: "c0",
    number: 14,
    title: "原地反转",
    titleEn: "Reverse In Place",
    difficulty: "warmup",
    minutes: 8,
    tags: ["数组", "双下标"],
    tagsEn: ["arrays", "two-indices"],
    lessonId: "cc-c0-4",
    warmupStage: "array",
    brief: "第一次修改数组：首尾两个下标相向而行，逐对交换。",
    briefEn:
      "Your first array mutation: two indices march toward each other, swapping pairs.",
    description: [
      "实现 `void reverse_ints(int a[], int n)`：把数组元素原地倒序。`{1,2,3,4}` 变成 `{4,3,2,1}`。保证 `n >= 0`；n 为 0 或 1 时什么都不用做。",
      '"原地"（in place）指不借助第二个数组：用两个下标，一个从头（0）一个从尾（n-1），交换它们指向的元素后相向各走一步，相遇或交错就停。交换两个变量需要一个临时变量：`int t = a[i]; a[i] = a[j]; a[j] = t;`。',
      "奇数长度时中间那个元素谁也不用碰——想清楚循环条件是 `i < j` 而不是 `i <= j` 的原因。",
    ],
    descriptionEn: [
      "Implement `void reverse_ints(int a[], int n)`: reverse the array in place. `{1,2,3,4}` becomes `{4,3,2,1}`. Guaranteed `n >= 0`; nothing to do when n is 0 or 1.",
      '"In place" means no second array: two indices, one from the front (0), one from the back (n-1), swap the elements they point at, then each steps inward; stop when they meet or cross. Swapping two variables takes a temporary: `int t = a[i]; a[i] = a[j]; a[j] = t;`.',
      "With odd lengths the middle element needs no touch — work out why the loop condition is `i < j`, not `i <= j`.",
    ],
    language: "c",
    starterCode: `/* 原地倒序; n 为 0 或 1 时无操作 */
void reverse_ints(int a[], int n)
{
    (void)a; (void)n;
    /* TODO: 双下标相向而行, 逐对交换 */
}`,
    starterCodeEn: `/* Reverse in place; nothing to do for n of 0 or 1 */
void reverse_ints(int a[], int n)
{
    (void)a; (void)n;
    /* TODO: two indices marching inward, swapping pairs */
}`,
    harness: `#include <stdio.h>
#include <string.h>
{{USER_CODE}}

static int _pass, _total;
static void check_arrays(const char *label, const int *expect, const int *got, int n)
{
    _total++;
    if (memcmp(expect, got, (size_t)n * sizeof(int)) == 0) {
        _pass++;
        printf("[PASS] %s\\n", label);
    } else {
        printf("[FAIL] %s (index-by-index mismatch)\\n", label);
    }
}

int main(void)
{
    int a[] = { 1, 2, 3, 4 };
    int ea[] = { 4, 3, 2, 1 };
    reverse_ints(a, 4);
    check_arrays("even length", ea, a, 4);

    int b[] = { 1, 2, 3, 4, 5 };
    int eb[] = { 5, 4, 3, 2, 1 };
    reverse_ints(b, 5);
    check_arrays("odd length (middle stays)", eb, b, 5);

    int c[] = { 42 };
    int ec[] = { 42 };
    reverse_ints(c, 1);
    check_arrays("single element", ec, c, 1);

    int d[] = { 7, 7 };
    reverse_ints(d, 0);
    int ed[] = { 7, 7 };
    check_arrays("n == 0 is a no-op", ed, d, 2);

    int e[] = { -1, 0, 1 };
    int ee[] = { 1, 0, -1 };
    reverse_ints(e, 3);
    check_arrays("negatives too", ee, e, 3);

    int f[] = { 1, 2, 3, 4, 5, 6 };
    reverse_ints(f, 6);
    reverse_ints(f, 6);
    int ef[] = { 1, 2, 3, 4, 5, 6 };
    check_arrays("reversing twice restores", ef, f, 6);

    printf("RESULT %d/%d\\n", _pass, _total);
    return _pass == _total ? 0 : 1;
}`,
    hints: [
      "骨架：`int i = 0, j = n - 1; while (i < j) { 交换 a[i] 和 a[j]; i++; j--; }`。",
      "交换三步曲必须有临时变量：`int t = a[i]; a[i] = a[j]; a[j] = t;`——直接 a[i]=a[j] 会先把 a[i] 的旧值弄丢。",
      'n=0 时 j = -1，条件 0 < -1 为假，循环零次——又一次"零次循环自然正确"。条件用 i < j：相遇（奇数长中点）就该停，i <= j 会让中点和自己交换（无害但多余），交错则说明走过头。',
    ],
    hintsEn: [
      "Skeleton: `int i = 0, j = n - 1; while (i < j) { swap a[i] and a[j]; i++; j--; }`.",
      "The swap waltz needs a temporary: `int t = a[i]; a[i] = a[j]; a[j] = t;` — assigning a[i]=a[j] directly loses a[i]’s old value first.",
      "At n=0, j = -1 and 0 < -1 is false — zero trips, naturally correct again. The condition is i < j: stop on meeting (the odd-length midpoint); i <= j would swap the midpoint with itself (harmless but pointless), and crossing means you went too far.",
    ],
    solution: `void reverse_ints(int a[], int n)
{
    int i = 0;
    int j = n - 1;
    while (i < j) {
        int t = a[i];
        a[i] = a[j];
        a[j] = t;
        i++;
        j--;
    }
}`,
    solutionNote:
      '三个初次见面：(1) 函数真正修改了调用方的数组——数组参数传"位置"的直接后果；(2) 双下标相向模式——它在 w-28 回文判断里原样复用，在快排分区、缓冲区处理里是常客；(3) 交换三步曲——w-16 会把它升级成通用的指针版 swap。"反转两次应还原"这个测试是**性质测试**（不对答案对性质），一种很值得学的测试思路。',
    solutionNoteEn:
      "Three first encounters: (1) the function genuinely mutates the caller’s array — the direct consequence of array parameters carrying a location; (2) the two-indices-inward pattern — reused verbatim in w-28’s palindrome check and a regular at quicksort partitions and buffer processing; (3) the swap waltz — upgraded to the general pointer swap in w-16. The reverse-twice-restores test is a **property test** (checking an invariant rather than an answer) — a testing idea worth stealing.",
  },
  {
    id: "w-15",
    track: "c0",
    number: 15,
    title: "线性查找",
    titleEn: "Linear Search",
    difficulty: "warmup",
    minutes: 5,
    tags: ["数组", "提前返回"],
    tagsEn: ["arrays", "early-return"],
    lessonId: "cc-c0-4",
    warmupStage: "array",
    brief: "从头找到尾：命中就立刻返回下标，找不到返回 -1。",
    briefEn:
      "Scan front to back: return the index the moment you hit, or -1 if you never do.",
    description: [
      "实现 `int find_first(const int a[], int n, int target)`：返回 target **第一次**出现的下标；不存在返回 -1。保证 `n >= 0`。",
      '两个新点：(1) 提前返回——找到就 `return i`，不用把剩下的看完；(2) "没找到"这个结果需要一个**不可能是合法下标**的值来表达，约定是 -1（合法下标从 0 开始）。',
      "想一想控制流：`return -1` 应该写在循环的哪里？循环体内还是循环结束后？",
    ],
    descriptionEn: [
      "Implement `int find_first(const int a[], int n, int target)`: return the index of the **first** occurrence of target, or -1 when absent. Guaranteed `n >= 0`.",
      'Two new ideas: (1) early return — `return i` the moment you find it, no need to scan the rest; (2) "not found" needs a value that **cannot be a legal index**, and the convention is -1 (legal indices start at 0).',
      "Think about control flow: where does `return -1` belong — inside the loop body, or after the loop ends?",
    ],
    language: "c",
    starterCode: `/* target 首次出现的下标; 不存在 -> -1 */
int find_first(const int a[], int n, int target)
{
    (void)a; (void)n; (void)target;
    return -1; /* TODO: return -1 该放在哪? */
}`,
    starterCodeEn: `/* Index of target's first occurrence; absent -> -1 */
int find_first(const int a[], int n, int target)
{
    (void)a; (void)n; (void)target;
    return -1; /* TODO: where does return -1 belong? */
}`,
    harness: `#include <stdio.h>
{{USER_CODE}}

static int _pass, _total;
static void check_int(const char *label, int expect, int got)
{
    _total++;
    if (expect == got) { _pass++; printf("[PASS] %s\\n", label); }
    else printf("[FAIL] %s (expected=%d got=%d)\\n", label, expect, got);
}

int main(void)
{
    int a[] = { 5, 3, 8, 3, 9 };
    check_int("hit at front", 0, find_first(a, 5, 5));
    check_int("hit at back", 4, find_first(a, 5, 9));
    check_int("duplicate -> first index", 1, find_first(a, 5, 3));
    check_int("miss -> -1", -1, find_first(a, 5, 7));
    check_int("empty array -> -1", -1, find_first(a, 0, 5));

    int b[] = { -4 };
    check_int("single hit", 0, find_first(b, 1, -4));
    check_int("single miss", -1, find_first(b, 1, 4));

    printf("RESULT %d/%d\\n", _pass, _total);
    return _pass == _total ? 0 : 1;
}`,
    hints: [
      "骨架：`for (int i = 0; i < n; i++) if (a[i] == target) return i; return -1;`。",
      "return -1 必须在**循环结束后**——放进循环体的 else 里，第一个不匹配的元素就会让函数提前放弃。这是本题最经典的错误。",
      "重复元素自动返回最先的那个：因为从左到右扫，第一次命中就 return 了。",
    ],
    hintsEn: [
      "Skeleton: `for (int i = 0; i < n; i++) if (a[i] == target) return i; return -1;`.",
      "return -1 belongs **after the loop** — put it in an else inside the body and the very first non-match makes the function give up early. The single most classic mistake here.",
      "Duplicates return the first occurrence automatically: scanning left to right, the first hit returns.",
    ],
    solution: `int find_first(const int a[], int n, int target)
{
    for (int i = 0; i < n; i++) {
        if (a[i] == target)
            return i;
    }
    return -1;
}`,
    solutionNote:
      '控制流的一课："在循环里返回"表达找到，"走完循环才返回"表达找遍了都没有——return -1 的位置就是这句话的语法形式。"-1 表示不存在"之所以可行，是因为它在合法下标值域（0..n-1）之外——这种"用值域外的值编码特殊状态"的思路，向上延伸就是 c-07 的负 errno 和 k-06 的 ERR_PTR。w-27 的二分查找会在有序数组上把这套接口做到 O(log n)。',
    solutionNoteEn:
      'A lesson in control flow: returning inside the loop says "found", returning only after the loop says "scanned everything, nothing there" — the position of return -1 is the syntax of that sentence. Using -1 for "absent" works because it lies outside the legal index range (0..n-1) — encoding special states in out-of-range values is the idea that grows into c-07’s negative errno and k-06’s ERR_PTR. w-27’s binary search rebuilds this exact interface at O(log n) on sorted arrays.',
  },
  {
    id: "w-16",
    track: "c0",
    number: 16,
    title: "指针交换",
    titleEn: "Pointer Swap",
    difficulty: "warmup",
    minutes: 5,
    tags: ["指针", "解引用"],
    tagsEn: ["pointers", "dereference"],
    lessonId: "cc-c0-5",
    warmupStage: "pointer-string",
    nextSteps: [{ kind: "problem", id: "cpp-01" }],
    brief: "第一次通过地址写内存：交换两个 int 的值——包括自己和自己交换。",
    briefEn:
      "Your first write through an address: exchange two ints — including a variable with itself.",
    description: [
      "实现 `void swap_ints(int *a, int *b)`：交换 a 和 b 指向的两个 int 的值。保证两个指针都非 NULL。调用方写 `swap_ints(&x, &y)` 后，x 和 y 的值互换。",
      '这是值传递补completion的时刻：w-05 的 max2 只能"读"参数，这里通过地址真正"写"到调用方的变量。函数体内 `*a` 就是调用方的那个变量本身。',
      "边界：`swap_ints(&x, &x)`（两个指针指向同一个变量）必须无害——x 保持原值。想想你的三步交换在这种情况下发生了什么。",
    ],
    descriptionEn: [
      "Implement `void swap_ints(int *a, int *b)`: exchange the values of the two ints a and b point at. Both pointers are guaranteed non-NULL. After the caller writes `swap_ints(&x, &y)`, x and y have traded values.",
      "This is the moment pass-by-value gets its missing half: w-05’s max2 could only read its parameters; here you genuinely write into the caller’s variables through their addresses. Inside the body, `*a` IS the caller’s variable.",
      "Boundary: `swap_ints(&x, &x)` (both pointers at the same variable) must be harmless — x keeps its value. Trace what your three-step swap does in that case.",
    ],
    language: "c",
    starterCode: `/* 交换 *a 与 *b (a、b 保证非 NULL; a == b 时必须无害) */
void swap_ints(int *a, int *b)
{
    (void)a; (void)b;
    /* TODO: 三步交换, 用 * 读写 */
}`,
    starterCodeEn: `/* Exchange *a and *b (both non-NULL; a == b must be harmless) */
void swap_ints(int *a, int *b)
{
    (void)a; (void)b;
    /* TODO: the three-step swap, reading and writing through * */
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
    int x = 3, y = 9;
    swap_ints(&x, &y);
    check("basic swap", x == 9 && y == 3);

    int a = -5, b = 0;
    swap_ints(&a, &b);
    check("negative and zero", a == 0 && b == -5);

    int s = 42;
    swap_ints(&s, &s);
    check("self swap is harmless", s == 42);

    int arr[2] = { 1, 2 };
    swap_ints(&arr[0], &arr[1]);
    check("works on array elements", arr[0] == 2 && arr[1] == 1);

    printf("RESULT %d/%d\\n", _pass, _total);
    return _pass == _total ? 0 : 1;
}`,
    hints: [
      "三步曲的指针版：`int t = *a; *a = *b; *b = t;`。",
      '每个 * 都读作"顺着地址找到本体"：t 存的是值，不是地址。',
      "自交换为什么无害？t = *a 存下值，*a = *b 用同一个值覆盖自己，*b = t 再写一遍——绕了一圈回到原值。",
    ],
    hintsEn: [
      "The waltz, pointer edition: `int t = *a; *a = *b; *b = t;`.",
      'Read every * as "follow the address to the real thing": t holds a value, not an address.',
      "Why is self-swap harmless? t = *a saves the value, *a = *b overwrites it with the same value, *b = t writes it once more — a full circle back to the original.",
    ],
    solution: `void swap_ints(int *a, int *b)
{
    int t = *a;
    *a = *b;
    *b = t;
}`,
    solutionNote:
      '与 w-14 的数组交换对照：那里 a[i] 能直接改是因为数组参数天生传位置；这里普通 int 想被改，调用方必须显式交出地址（&x），函数必须显式跟随地址（*a）——C 把"谁允许改我"写在了语法上。这份 swap 是 c-07/c-08 一切输出参数的地基；到 cpp-01 你会看到 C++ 引用把 &/* 都藏进语言里之后的样子。',
    solutionNoteEn:
      'Contrast with w-14’s array swap: there a[i] was directly writable because array parameters inherently carry a location; here an ordinary int only changes if the caller explicitly surrenders the address (&x) and the function explicitly follows it (*a) — C writes "who may modify me" into the syntax. This swap is the foundation of every out-parameter in c-07/c-08; in cpp-01 you will see what it looks like once C++ references tuck the & and * inside the language.',
  },
  {
    id: "w-17",
    track: "c0",
    number: 17,
    title: "手写长度",
    titleEn: "strlen by Hand",
    difficulty: "warmup",
    minutes: 5,
    tags: ["字符串", "\\0"],
    tagsEn: ["strings", "\\0"],
    lessonId: "cc-c0-5",
    warmupStage: "pointer-string",
    nextSteps: [{ kind: "problem", id: "c-09" }],
    brief: "数到 \\0 为止：亲手发现 C 字符串的结尾哨兵。",
    briefEn:
      "Count until \\0: discover the C string sentinel with your own hands.",
    description: [
      '实现 `size_t my_strlen(const char *s)`：返回字符串的长度——**不含**结尾的 `\\0`。保证 s 非 NULL。空串 `""` 返回 0。',
      'C 字符串没有长度字段，只有结尾哨兵：内存里 `"gfx"` 是 `g f x \\0` 四个字节。数长度就是从头走到 `\\0` 停下，数了几步就是几。',
      '返回类型 `size_t` 是标准库的"长度类型"（无符号）——标准 `strlen` 用的正是它，从第一天就按标准签名练。',
    ],
    descriptionEn: [
      'Implement `size_t my_strlen(const char *s)`: return the string length — **excluding** the terminating `\\0`. s is guaranteed non-NULL. The empty string `""` returns 0.',
      'C strings have no length field, only the sentinel: `"gfx"` in memory is the four bytes `g f x \\0`. Measuring length means walking from the start until `\\0`, counting the steps.',
      "The return type `size_t` is the standard library’s length type (unsigned) — real `strlen` uses exactly it, so train on the standard signature from day one.",
    ],
    language: "c",
    starterCode: `#include <stddef.h>

/* 长度不含结尾 '\\0'; "" 返回 0 */
size_t my_strlen(const char *s)
{
    (void)s;
    return 0; /* TODO */
}`,
    starterCodeEn: `#include <stddef.h>

/* Length excludes the trailing '\\0'; "" returns 0 */
size_t my_strlen(const char *s)
{
    (void)s;
    return 0; /* TODO */
}`,
    harness: `#include <stdio.h>
#include <stddef.h>
{{USER_CODE}}

static int _pass, _total;
static void check_len(const char *label, size_t expect, size_t got)
{
    _total++;
    if (expect == got) { _pass++; printf("[PASS] %s\\n", label); }
    else printf("[FAIL] %s (expected=%zu got=%zu)\\n", label, expect, got);
}

int main(void)
{
    check_len("empty string", 0, my_strlen(""));
    check_len("single char", 1, my_strlen("x"));
    check_len("gfx", 3, my_strlen("gfx"));
    check_len("with spaces", 11, my_strlen("hello world"));
    check_len("longer", 26, my_strlen("abcdefghijklmnopqrstuvwxyz"));

    char buf[8] = { 'a', 'b', '\\0', 'z', 'z', 'z', 'z', 'z' };
    check_len("stops at first NUL", 2, my_strlen(buf));

    printf("RESULT %d/%d\\n", _pass, _total);
    return _pass == _total ? 0 : 1;
}`,
    hints: [
      "骨架：`size_t len = 0; while (s[len] != '\\0') len++; return len;`。",
      "'\\0' 的数值就是 0，条件可以简写成 `while (s[len])`——两种写法等价，先用显式版。",
      "空串的 s[0] 就是 \\0：循环零次、返回 0——零次循环再次自然正确。",
    ],
    hintsEn: [
      "Skeleton: `size_t len = 0; while (s[len] != '\\0') len++; return len;`.",
      "The value of '\\0' is 0, so the condition abbreviates to `while (s[len])` — equivalent; use the explicit form first.",
      "For the empty string, s[0] is already \\0: zero trips, return 0 — the zero-trip loop is naturally correct once again.",
    ],
    solution: `#include <stddef.h>

size_t my_strlen(const char *s)
{
    size_t len = 0;
    while (s[len] != '\\0')
        len++;
    return len;
}`,
    solutionNote:
      '"stops at first NUL" 那个用例道破本质：长度不是数组容量（8），而是到第一个 \\0 的距离（2）——字符串的边界由数据里的哨兵而非容器定义。这也解释了丢失 \\0 的灾难（cc-c0-5 面试题）与 c-09 strscpy 为什么把"永远补 \\0"当第一要务。指针步进的等价写法 `const char *p = s; while (*p) p++; return (size_t)(p - s);` 顺带演示了指针相减——见过即可，日常写清晰的下标版。',
    solutionNoteEn:
      'The "stops at first NUL" case reveals the essence: length is not the array capacity (8) but the distance to the first \\0 (2) — a string’s boundary is defined by the in-band sentinel, not the container. Which explains both the catastrophe of a lost \\0 (cc-c0-5’s interview question) and why c-09’s strscpy treats "always terminate" as job one. The pointer-stepping equivalent `const char *p = s; while (*p) p++; return (size_t)(p - s);` demonstrates pointer subtraction in passing — recognize it; write the clear indexed form daily.',
  },
  {
    id: "w-18",
    track: "c0",
    number: 18,
    title: "统计字符",
    titleEn: "Count a Character",
    difficulty: "warmup",
    minutes: 5,
    tags: ["字符串", "遍历"],
    tagsEn: ["strings", "traversal"],
    lessonId: "cc-c0-5",
    warmupStage: "pointer-string",
    brief: "在字符串里数一个字符出现了几次——字符串版的条件计数。",
    briefEn:
      "Count how many times one character appears in a string — conditional counting, string edition.",
    description: [
      "实现 `int count_char(const char *s, char c)`：返回字符 `c` 在字符串 `s` 中出现的次数。保证 s 非 NULL。",
      '结构 = w-13 的条件计数 + w-17 的"走到 \\0 停"。一个约定要注意：如果调用方传 `c == \'\\0\'`，返回 0——结尾哨兵是边界标记，不算"内容"。',
    ],
    descriptionEn: [
      "Implement `int count_char(const char *s, char c)`: return how many times character `c` occurs in string `s`. s is guaranteed non-NULL.",
      "Structure = w-13’s conditional counting + w-17’s walk-until-\\0. One convention to honor: when the caller passes `c == '\\0'`, return 0 — the sentinel is a boundary marker, not content.",
    ],
    language: "c",
    starterCode: `/* c 在 s 中出现的次数; c == '\\0' 时返回 0 */
int count_char(const char *s, char c)
{
    (void)s; (void)c;
    return 0; /* TODO */
}`,
    starterCodeEn: `/* Occurrences of c in s; return 0 when c == '\\0' */
int count_char(const char *s, char c)
{
    (void)s; (void)c;
    return 0; /* TODO */
}`,
    harness: `#include <stdio.h>
{{USER_CODE}}

static int _pass, _total;
static void check_int(const char *label, int expect, int got)
{
    _total++;
    if (expect == got) { _pass++; printf("[PASS] %s\\n", label); }
    else printf("[FAIL] %s (expected=%d got=%d)\\n", label, expect, got);
}

int main(void)
{
    check_int("three s in mississippi", 4, count_char("mississippi", 's'));
    check_int("no match", 0, count_char("gfx ring", 'z'));
    check_int("count spaces", 2, count_char("a b c", ' '));
    check_int("empty string", 0, count_char("", 'a'));
    check_int("first and last", 2, count_char("radar", 'r'));
    check_int("NUL never counts", 0, count_char("abc", '\\0'));

    printf("RESULT %d/%d\\n", _pass, _total);
    return _pass == _total ? 0 : 1;
}`,
    hints: [
      "骨架：`int count = 0; for (int i = 0; s[i] != '\\0'; i++) if (s[i] == c) count++; return count;`。",
      "循环条件已经保证 s[i] 不会是 \\0，所以循环体里 s[i] == c 在 c 为 \\0 时永远不成立——约定自动满足，想明白为什么。",
      "字符比较就是整数比较：char 本质是小整数，== 直接可用。",
    ],
    hintsEn: [
      "Skeleton: `int count = 0; for (int i = 0; s[i] != '\\0'; i++) if (s[i] == c) count++; return count;`.",
      "The loop condition already guarantees s[i] is never \\0, so s[i] == c can never hold when c is \\0 — the convention satisfies itself; see why.",
      "Character comparison IS integer comparison: char is a small integer, so == just works.",
    ],
    solution: `int count_char(const char *s, char c)
{
    int count = 0;
    for (int i = 0; s[i] != '\\0'; i++) {
        if (s[i] == c)
            count++;
    }
    return count;
}`,
    solutionNote:
      '值得回味的是那条"免费的约定"：循环只走到 \\0 之前，所以 c=\'\\0\' 自然数出 0——不需要任何特判。当边界条件被结构本身吞掉时，代码最干净；反过来，需要补丁式 if 的地方往往说明结构还能改进。这个"遍历 + 谓词"组合到 c-10 会变成"遍历 + 校验 + 累积"的解析器雏形。',
    solutionNoteEn:
      "Savor the free convention: the loop stops before \\0, so c='\\0' naturally counts 0 — zero special cases required. Code is cleanest when boundaries are swallowed by structure itself; conversely, patch-style ifs usually hint the structure could improve. This traverse-plus-predicate combo grows into c-10’s traverse-validate-accumulate parser embryo.",
  },
  {
    id: "w-19",
    track: "c0",
    number: 19,
    title: "字符串相等",
    titleEn: "String Equality",
    difficulty: "warmup",
    minutes: 7,
    tags: ["字符串", "双指针"],
    tagsEn: ["strings", "two-pointers"],
    lessonId: "cc-c0-5",
    warmupStage: "pointer-string",
    nextSteps: [
      { kind: "problem", id: "c-01" },
      { kind: "problem", id: "c-09" },
    ],
    brief: '两个字符串逐字符并排走——"abc" 和 "abcd" 为什么不等？',
    briefEn:
      'Walk two strings side by side — why are "abc" and "abcd" not equal?',
    description: [
      "实现 `bool str_equal(const char *a, const char *b)`：两个字符串内容完全相同返回 true，否则 false。保证两个指针都非 NULL。",
      '重要认知：`a == b` 比较的是两个**地址**，不是内容——两份一模一样的 "gfx" 住在不同地址上，`==` 会说它们"不等"。比较内容必须逐字符走。',
      '难点在结尾：`"abc"` 和 `"abcd"` 前三个字符全同——你的循环必须发现"一个到头了、另一个还没到"。相等的完整定义：每一位都相同，**并且**同时到达 `\\0`。',
    ],
    descriptionEn: [
      "Implement `bool str_equal(const char *a, const char *b)`: true when the contents match exactly, false otherwise. Both pointers are guaranteed non-NULL.",
      'Key realization: `a == b` compares two **addresses**, not contents — two identical "gfx" strings at different addresses compare "unequal" under `==`. Comparing contents requires walking character by character.',
      'The difficulty lives at the end: `"abc"` and `"abcd"` share their first three characters — your loop must notice that one string ended while the other did not. Full definition of equality: every position matches **and** both reach `\\0` together.',
    ],
    language: "c",
    starterCode: `#include <stdbool.h>

/* 内容完全相同 -> true (指针保证非 NULL) */
bool str_equal(const char *a, const char *b)
{
    (void)a; (void)b;
    return false; /* TODO: "abc" vs "abcd" 是难点 */
}`,
    starterCodeEn: `#include <stdbool.h>

/* Exactly equal contents -> true (pointers non-NULL) */
bool str_equal(const char *a, const char *b)
{
    (void)a; (void)b;
    return false; /* TODO: "abc" vs "abcd" is the crux */
}`,
    harness: `#include <stdio.h>
#include <stdbool.h>
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
    check("equal strings", str_equal("gfx", "gfx") == true);
    check("different contents", str_equal("gfx", "sdma") == false);
    check("prefix is not equal", str_equal("abc", "abcd") == false);
    check("prefix, other order", str_equal("abcd", "abc") == false);
    check("empty vs empty", str_equal("", "") == true);
    check("empty vs non-empty", str_equal("", "x") == false);
    check("differ at first char", str_equal("xbc", "abc") == false);
    check("differ at last char", str_equal("abx", "abc") == false);

    char buf1[] = { 'h', 'i', '\\0' };
    char buf2[] = { 'h', 'i', '\\0' };
    check("same content, different addresses", str_equal(buf1, buf2) == true);

    printf("RESULT %d/%d\\n", _pass, _total);
    return _pass == _total ? 0 : 1;
}`,
    hints: [
      "并排推进：`int i = 0; while (a[i] != '\\0' && b[i] != '\\0') { if (a[i] != b[i]) return false; i++; }`。",
      "循环结束只说明**至少一个**到头了——最后一步补一个判断：`return a[i] == b[i];`（都到头时两边都是 \\0，相等；只有一边到头时一边是 \\0 一边不是，不等）。",
      "更紧凑的写法是把 \\0 也当作\"要比较的一位\"：`while (a[i] == b[i]) { if (a[i] == '\\0') return true; i++; } return false;`——两种都对，选你能讲清楚的那种。",
    ],
    hintsEn: [
      "March in lock-step: `int i = 0; while (a[i] != '\\0' && b[i] != '\\0') { if (a[i] != b[i]) return false; i++; }`.",
      "Loop exit only means **at least one** string ended — finish with `return a[i] == b[i];` (both ended: both are \\0, equal; only one ended: one is \\0 and one is not, unequal).",
      "A tighter form treats \\0 as just another position to compare: `while (a[i] == b[i]) { if (a[i] == '\\0') return true; i++; } return false;` — both are correct; pick the one you can explain.",
    ],
    solution: `#include <stdbool.h>

bool str_equal(const char *a, const char *b)
{
    int i = 0;
    while (a[i] != '\\0' && b[i] != '\\0') {
        if (a[i] != b[i])
            return false;
        i++;
    }
    return a[i] == b[i];
}`,
    solutionNote:
      "收尾一行 `return a[i] == b[i]` 是全题的灵魂：它优雅地合并了三种终局——都到头（\\0==\\0，真）、a 先到头（\\0 != b[i]，假）、b 先到头（同理假）。“指针比地址、逐字符比内容”这一课在 c-01 的字符串判题、c-07 的 strcmp 匹配表里都是地基。顺带一提：标准库的 strcmp 返回三态（<0/0/>0）以支持排序，c-07 会用到它。",
    solutionNoteEn:
      "The closing `return a[i] == b[i]` is the soul of the problem: it elegantly merges all three endgames — both ended (\\0==\\0, true), a ended first (\\0 != b[i], false), b ended first (likewise false). The lesson that pointers compare addresses while contents need a walk underlies c-01’s string judging and c-07’s strcmp match table. Aside: the standard strcmp returns three states (<0/0/>0) to support ordering — c-07 uses it.",
  },
  {
    id: "w-20",
    track: "c0",
    number: 20,
    title: "造一个数组",
    titleEn: "Make an Array",
    difficulty: "warmup",
    minutes: 8,
    tags: ["malloc", "所有权"],
    tagsEn: ["malloc", "ownership"],
    lessonId: "cc-c0-6",
    warmupStage: "heap",
    brief: "第一次 malloc：造出 {0,1,...,n-1}，把所有权交给调用方。",
    briefEn:
      "Your first malloc: build {0,1,...,n-1} and hand ownership to the caller.",
    description: [
      '实现 `int *make_range(int n)`：分配一块能装 n 个 int 的堆内存，填入 0 到 n-1，返回指针。**调用方负责 free**——这就是"所有权移交"。保证 `0 <= n <= 1024`。',
      "两条失败路径都返回 NULL：约定 `n == 0` 直接返回 NULL（没有东西可造）；malloc 失败时把它的 NULL 透传出去。判题器会注入一次分配失败，专门检查后者。",
      "字节数怎么算：n 个 int 是 `n * sizeof(int)` 字节——让 sizeof 替你记住平台细节。",
    ],
    descriptionEn: [
      "Implement `int *make_range(int n)`: allocate heap memory for n ints, fill it with 0 through n-1, return the pointer. **The caller frees it** — that is an ownership transfer. Guaranteed `0 <= n <= 1024`.",
      "Both failure paths return NULL: by convention `n == 0` returns NULL directly (nothing to build); a malloc failure passes its NULL through. The judge injects one allocation failure specifically to check the latter.",
      "Byte math: n ints need `n * sizeof(int)` bytes — let sizeof remember the platform details for you.",
    ],
    language: "c",
    starterCode: `#include <stdlib.h>

/* 分配并填入 {0..n-1}; 调用方负责 free。
 * n == 0 或分配失败 -> NULL。保证 0 <= n <= 1024。 */
int *make_range(int n)
{
    (void)n;
    return 0; /* TODO: malloc -> 判 NULL -> 填数 -> 返回 */
}`,
    starterCodeEn: `#include <stdlib.h>

/* Allocate and fill {0..n-1}; the caller frees.
 * n == 0 or allocation failure -> NULL. Guaranteed 0 <= n <= 1024. */
int *make_range(int n)
{
    (void)n;
    return 0; /* TODO: malloc -> check NULL -> fill -> return */
}`,
    harness: `#include <stdio.h>
#include <stdlib.h>

/* Tracked allocator: learners write plain malloc/calloc/free; the macros
 * intercept every call (defined after system headers => not bypassable). */
static int g_outstanding, g_fail_next_alloc;
static void *tracked_malloc(size_t n)
{
    if (g_fail_next_alloc) { g_fail_next_alloc = 0; return NULL; }
    void *p = malloc(n);
    if (p) g_outstanding++;
    return p;
}
static void *tracked_calloc(size_t a, size_t b)
{
    if (g_fail_next_alloc) { g_fail_next_alloc = 0; return NULL; }
    void *p = calloc(a, b);
    if (p) g_outstanding++;
    return p;
}
static void tracked_free(void *p)
{
    if (p) g_outstanding--;
    free(p);
}
#define malloc(n) tracked_malloc(n)
#define calloc(a, b) tracked_calloc((a), (b))
#define free(p) tracked_free(p)

{{USER_CODE}}

static int _pass, _total;
static void check(const char *label, int cond)
{
    _total++;
    if (cond) { _pass++; printf("[PASS] %s\\n", label); }
    else printf("[FAIL] %s\\n", label);
}

/* every element verified, not just spot samples */
static int is_range(const int *p, int n)
{
    if (!p) return 0;
    for (int i = 0; i < n; i++)
        if (p[i] != i) return 0;
    return 1;
}

int main(void)
{
    (void)tracked_calloc;   /* keep -Wunused-function quiet on all backends */

    int *r = make_range(5);
    check("returns a block", r != NULL);
    check("every element equals its index", is_range(r, 5));
    free(r);
    check("caller freed it: balanced", g_outstanding == 0);

    int *one = make_range(1);
    check("single element {0}", is_range(one, 1));
    free(one);

    check("n == 0 -> NULL by convention", make_range(0) == NULL);
    check("no stray allocation for n == 0", g_outstanding == 0);

    g_fail_next_alloc = 1;
    check("allocation failure -> NULL", make_range(8) == NULL);
    check("failure leaks nothing", g_outstanding == 0);

    int *big = make_range(1024);
    check("upper bound: all 1024 verified", is_range(big, 1024));
    free(big);
    check("fully balanced at the end", g_outstanding == 0);

    printf("RESULT %d/%d\\n", _pass, _total);
    return _pass == _total ? 0 : 1;
}`,
    hints: [
      "骨架：`if (n == 0) return NULL; int *p = malloc((size_t)n * sizeof(int)); if (!p) return NULL; for (...) p[i] = i; return p;`。",
      '"租-查-用-还"里本函数只负责前三步——"还"是调用方的义务，这正是注释里写明所有权的原因。',
      "返回后不要 free：交出所有权意味着这块内存的生杀大权已经不在你手里。",
    ],
    hintsEn: [
      "Skeleton: `if (n == 0) return NULL; int *p = malloc((size_t)n * sizeof(int)); if (!p) return NULL; for (...) p[i] = i; return p;`.",
      "Of rent-check-use-return, this function owns only the first three — returning the memory is the caller’s duty, which is exactly why the comment spells out ownership.",
      "Do not free before returning: transferring ownership means life-and-death over this block is no longer yours.",
    ],
    solution: `#include <stdlib.h>

int *make_range(int n)
{
    if (n == 0)
        return NULL;

    int *p = malloc((size_t)n * sizeof(int));
    if (!p)
        return NULL;

    for (int i = 0; i < n; i++)
        p[i] = i;
    return p;
}`,
    solutionNote:
      '第一份"生产者"函数：造资源、交所有权。三个纪律各就其位——n==0 的约定返回写在最前（契约先行）；malloc 之后立刻判 NULL（失败路径与成功路径同等重要）；填充用 (size_t)n * sizeof(int) 计算字节（类型驱动的尺寸计算）。判题的配平计数就是把 cc-c0-6 里"谁负责 free"的问句变成了机器可验证的断言。下一题 w-21 把"填 0"这一步交给 calloc 原生完成。',
    solutionNoteEn:
      'Your first producer function: build a resource, transfer its ownership. Three disciplines in position — the n==0 convention leads (contract first); NULL is checked immediately after malloc (the failure path is as important as the success path); sizing uses (size_t)n * sizeof(int) (type-driven byte math). The judge’s balance counter turns cc-c0-6’s "who frees this?" question into a machine-checkable assertion. Next, w-21 hands the zero-filling step to calloc natively.',
  },
  {
    id: "w-21",
    track: "c0",
    number: 21,
    title: "一块清零内存",
    titleEn: "A Zeroed Block",
    difficulty: "warmup",
    minutes: 7,
    tags: ["calloc", "清零"],
    tagsEn: ["calloc", "zeroing"],
    lessonId: "cc-c0-6",
    warmupStage: "heap",
    brief:
      "malloc 的孪生兄弟 calloc：租 n 个元素并保证全零——判题会确认你真的用了它。",
    briefEn:
      "malloc’s twin calloc: rent n elements guaranteed all-zero — and the judge confirms you actually used it.",
    description: [
      "实现 `int *make_zeroes(int n)`：返回一块能装 n 个 int、**内容全为 0** 的堆内存。约定与 w-20 相同：`n == 0` 返回 NULL；分配失败透传 NULL；调用方负责 free。保证 `0 <= n <= 1024`。",
      '本题必须用 `calloc(n, sizeof(int))` 完成——它租内存并把每个字节清零，两个参数分别是"几个元素"和"每个多大"。判题器统计 calloc 调用次数：malloc + 手动清零虽然结果相同，但这题练的就是认识 calloc。',
      "为什么 calloc 值得单独一题？(1) malloc 租来的内容是垃圾值，忘记初始化是高频 bug，calloc 天生免疫；(2) calloc(n, size) 内部会检查 n*size 的乘法溢出，而 malloc(n * size) 不会——这个差别在安全审计里很重要（题解展开）。",
    ],
    descriptionEn: [
      "Implement `int *make_zeroes(int n)`: return a heap block holding n ints, **all zero**. Conventions match w-20: `n == 0` returns NULL; allocation failure passes NULL through; the caller frees. Guaranteed `0 <= n <= 1024`.",
      'This one must be done with `calloc(n, sizeof(int))` — it rents memory AND zeroes every byte; its two arguments are "how many elements" and "how big each is". The judge counts calloc calls: malloc plus manual zeroing gives the same result, but knowing calloc IS the exercise.',
      "Why does calloc deserve its own problem? (1) malloc’d contents are garbage, and forgotten initialization is a high-frequency bug calloc is born immune to; (2) calloc(n, size) checks the n*size multiplication for overflow internally, which malloc(n * size) does not — a distinction that matters in security review (solution notes expand).",
    ],
    language: "c",
    starterCode: `#include <stdlib.h>

/* 全零的 n 个 int; 用 calloc。n == 0 或失败 -> NULL。 */
int *make_zeroes(int n)
{
    (void)n;
    return 0; /* TODO: calloc(个数, 每个多大) */
}`,
    starterCodeEn: `#include <stdlib.h>

/* n ints, all zero; use calloc. n == 0 or failure -> NULL. */
int *make_zeroes(int n)
{
    (void)n;
    return 0; /* TODO: calloc(how many, how big each) */
}`,
    harness: `#include <stdio.h>
#include <stdlib.h>

/* Tracked allocator with a provenance registry: the judge remembers which
 * pointers calloc produced, so a decoy calloc + real malloc cannot pass. */
static int g_outstanding, g_fail_next_alloc;
#define REG_CAP 16
static void *g_calloc_ptrs[REG_CAP];

static void remember_calloc(void *p)
{
    for (int i = 0; i < REG_CAP; i++) {
        if (!g_calloc_ptrs[i]) {
            g_calloc_ptrs[i] = p;
            return;
        }
    }
}

static void forget_calloc(const void *p)
{
    for (int i = 0; i < REG_CAP; i++) {
        if (g_calloc_ptrs[i] == p) {
            g_calloc_ptrs[i] = NULL;
            return;
        }
    }
}

static void *tracked_malloc(size_t n)
{
    if (g_fail_next_alloc) { g_fail_next_alloc = 0; return NULL; }
    void *p = malloc(n);
    if (p) g_outstanding++;
    return p;
}
static void *tracked_calloc(size_t a, size_t b)
{
    if (g_fail_next_alloc) { g_fail_next_alloc = 0; return NULL; }
    void *p = calloc(a, b);
    if (p) {
        g_outstanding++;
        remember_calloc(p);
    }
    return p;
}
static void tracked_free(void *p)
{
    if (p) {
        forget_calloc(p);
        g_outstanding--;
    }
    free(p);
}
static int came_from_calloc(const void *p)
{
    for (int i = 0; i < REG_CAP; i++)
        if (g_calloc_ptrs[i] == p) return 1;
    return 0;
}
#define malloc(n) tracked_malloc(n)
#define calloc(a, b) tracked_calloc((a), (b))
#define free(p) tracked_free(p)

{{USER_CODE}}

static int _pass, _total;
static void check(const char *label, int cond)
{
    _total++;
    if (cond) { _pass++; printf("[PASS] %s\\n", label); }
    else printf("[FAIL] %s\\n", label);
}

static int all_zero(const int *p, int n)
{
    if (!p) return 0;
    for (int i = 0; i < n; i++)
        if (p[i] != 0) return 0;
    return 1;
}

int main(void)
{
    (void)tracked_malloc;

    int *z = make_zeroes(16);
    check("returns a block", z != NULL);
    check("every element is zero", all_zero(z, 16));
    check("THE returned block came from calloc", came_from_calloc(z));
    free(z);
    check("balanced after free", g_outstanding == 0);

    check("n == 0 -> NULL", make_zeroes(0) == NULL);

    g_fail_next_alloc = 1;
    check("allocation failure -> NULL", make_zeroes(4) == NULL);
    check("failure leaks nothing", g_outstanding == 0);

    int *big = make_zeroes(1024);
    check("upper bound: all 1024 zero", all_zero(big, 1024));
    check("upper bound also from calloc", came_from_calloc(big));
    free(big);
    check("fully balanced", g_outstanding == 0);

    printf("RESULT %d/%d\\n", _pass, _total);
    return _pass == _total ? 0 : 1;
}`,
    hints: [
      "主体两行：`if (n == 0) return NULL; return calloc((size_t)n, sizeof(int));`——calloc 失败本来就返回 NULL，透传是免费的。",
      "注意参数形态：calloc 是 (元素个数, 单个大小) 两个参数，不是像 malloc 那样一个总字节数。",
      "不需要循环清零——清零正是 calloc 的本职工作。",
    ],
    hintsEn: [
      "The body is two lines: `if (n == 0) return NULL; return calloc((size_t)n, sizeof(int));` — calloc already returns NULL on failure, so the pass-through is free.",
      "Mind the argument shape: calloc takes (element count, size of each), not a single total byte count like malloc.",
      "No zeroing loop needed — zeroing is precisely calloc’s job.",
    ],
    solution: `#include <stdlib.h>

int *make_zeroes(int n)
{
    if (n == 0)
        return NULL;
    return calloc((size_t)n, sizeof(int));
}`,
    solutionNote:
      '两行解的信息量：calloc 的 (n, size) 形态天生把"个数"与"单个大小"分开，因此它能在内部检查 n*size 是否溢出——而 malloc(n * sizeof(int)) 里那个乘法在极大 n 下会先回绕成小数字、租到远小于预期的内存（经典安全漏洞模式）。这也是 c-16 里"calloc(n, size) 优于 malloc(n*size)"评语的完整版。失败透传（return calloc(...) 直接把 NULL 交上去）是错误处理里最省力的正确姿势。',
    solutionNoteEn:
      'Two lines, much said: calloc’s (n, size) shape separates count from element size, letting it check the n*size multiplication for overflow internally — whereas the multiplication inside malloc(n * sizeof(int)) can wrap on huge n and rent far less memory than intended (a classic vulnerability pattern). This is the full version of the "calloc(n, size) beats malloc(n*size)" remark from c-16. Failure pass-through (return calloc(...) handing NULL straight up) is error handling at its laziest and most correct.',
  },
  {
    id: "w-22",
    track: "c0",
    number: 22,
    title: "复制数组",
    titleEn: "Duplicate an Array",
    difficulty: "warmup",
    minutes: 8,
    tags: ["malloc", "深拷贝"],
    tagsEn: ["malloc", "deep-copy"],
    lessonId: "cc-c0-6",
    warmupStage: "heap",
    nextSteps: [{ kind: "problem", id: "c-08" }],
    brief: "租一块新内存、逐个搬运——副本必须和原件彻底独立。",
    briefEn:
      "Rent fresh memory, carry the elements over — the copy must be fully independent of the original.",
    description: [
      "实现 `int *dup_ints(const int src[], int n)`：分配新内存，把 `src` 的 n 个元素复制进去，返回新块（调用方负责 free）。约定：`n == 0` 返回 NULL；分配失败透传 NULL。保证 `0 <= n <= 1024`，且 n > 0 时 src 有效。",
      '"深拷贝"的判定标准：复制完成后**改副本不动原件、改原件不动副本**——判题器会同时改两边来验证独立性。这只有"另租一块内存 + 逐元素搬运"才能做到；直接 `return src` 之类的"浅"做法会当场翻车（类型也不允许：src 是 const）。',
    ],
    descriptionEn: [
      "Implement `int *dup_ints(const int src[], int n)`: allocate fresh memory, copy src’s n elements into it, return the new block (caller frees). Conventions: `n == 0` returns NULL; allocation failure passes NULL through. Guaranteed `0 <= n <= 1024`, with src valid whenever n > 0.",
      'The test of a deep copy: afterwards, **mutating the copy leaves the original alone, and vice versa** — the judge mutates both sides to verify independence. Only rent-new-memory-plus-element-copy achieves that; a "shallow" move like `return src` fails on the spot (and the type forbids it: src is const).',
    ],
    language: "c",
    starterCode: `#include <stdlib.h>

/* 深拷贝 src 的 n 个 int; 调用方 free。
 * n == 0 或分配失败 -> NULL。 */
int *dup_ints(const int src[], int n)
{
    (void)src; (void)n;
    return 0; /* TODO: 租 -> 判 NULL -> 搬 -> 交 */
}`,
    starterCodeEn: `#include <stdlib.h>

/* Deep-copy n ints from src; the caller frees.
 * n == 0 or allocation failure -> NULL. */
int *dup_ints(const int src[], int n)
{
    (void)src; (void)n;
    return 0; /* TODO: rent -> check NULL -> carry -> hand over */
}`,
    harness: `#include <stdio.h>
#include <stdlib.h>

static int g_outstanding, g_fail_next_alloc;
static void *tracked_malloc(size_t n)
{
    if (g_fail_next_alloc) { g_fail_next_alloc = 0; return NULL; }
    void *p = malloc(n);
    if (p) g_outstanding++;
    return p;
}
static void *tracked_calloc(size_t a, size_t b)
{
    if (g_fail_next_alloc) { g_fail_next_alloc = 0; return NULL; }
    void *p = calloc(a, b);
    if (p) g_outstanding++;
    return p;
}
static void tracked_free(void *p)
{
    if (p) g_outstanding--;
    free(p);
}
#define malloc(n) tracked_malloc(n)
#define calloc(a, b) tracked_calloc((a), (b))
#define free(p) tracked_free(p)

{{USER_CODE}}

static int _pass, _total;
static void check(const char *label, int cond)
{
    _total++;
    if (cond) { _pass++; printf("[PASS] %s\\n", label); }
    else printf("[FAIL] %s\\n", label);
}

static int same_ints(const int *a, const int *b, int n)
{
    if (!a || !b) return 0;
    for (int i = 0; i < n; i++)
        if (a[i] != b[i]) return 0;
    return 1;
}

int main(void)
{
    (void)tracked_calloc;

    int src[] = { 10, 20, 30, 40, 50 };
    int *copy = dup_ints(src, 5);
    check("returns a block", copy != NULL);
    check("EVERY element matches", same_ints(copy, src, 5));
    check("separate memory", copy != src);

    if (copy) {
        copy[0] = 999;
        copy[2] = -1;
    }
    check("mutating copy leaves original", src[0] == 10 && src[2] == 30);

    src[1] = -777;
    check("mutating original leaves copy", copy && copy[1] == 20);
    free(copy);
    check("balanced after free", g_outstanding == 0);

    check("n == 0 -> NULL", dup_ints(src, 0) == NULL);

    g_fail_next_alloc = 1;
    check("allocation failure -> NULL", dup_ints(src, 5) == NULL);
    check("failure leaks nothing", g_outstanding == 0);

    printf("RESULT %d/%d\\n", _pass, _total);
    return _pass == _total ? 0 : 1;
}`,
    hints: [
      "骨架：`if (n == 0) return NULL; int *p = malloc((size_t)n * sizeof(int)); if (!p) return NULL; for (i < n) p[i] = src[i]; return p;`。",
      "搬运循环里两边角色分明：读 src[i]（const 保证只读），写 p[i]（新租的内存）。",
      "这就是 c-08 手写 memcpy 的 int 特化版——做完顺路去 c-08，把逐元素升级成逐字节。",
    ],
    hintsEn: [
      "Skeleton: `if (n == 0) return NULL; int *p = malloc((size_t)n * sizeof(int)); if (!p) return NULL; for (i < n) p[i] = src[i]; return p;`.",
      "Roles stay clean in the carry loop: read src[i] (const enforces read-only), write p[i] (the freshly rented block).",
      "This is c-08’s hand-written memcpy specialized to int — head to c-08 next and upgrade element-wise to byte-wise.",
    ],
    solution: `#include <stdlib.h>

int *dup_ints(const int src[], int n)
{
    if (n == 0)
        return NULL;

    int *p = malloc((size_t)n * sizeof(int));
    if (!p)
        return NULL;

    for (int i = 0; i < n; i++)
        p[i] = src[i];
    return p;
}`,
    solutionNote:
      '深拷贝 = 新地址 + 同内容。判题的交叉修改（改副本查原件、改原件查副本）是独立性的完备验证——只查一个方向会漏掉"部分共享"的花式错误。这个"复制以断开共享"的动机，正是 cpp-04（Rule of Three 深拷贝）整节课的 C 版预告：那边编译器会替你生成"浅"的版本，你必须亲手写出"深"的。',
    solutionNoteEn:
      "Deep copy = new address + same contents. The judge’s cross-mutation (edit the copy, inspect the original; edit the original, inspect the copy) is the complete independence check — testing one direction misses exotic partial-sharing mistakes. This copy-to-sever-sharing motive is the C-side preview of cpp-04’s entire Rule of Three lesson: there the compiler generates the shallow version for you, and the deep one must be written by hand.",
  },
  {
    id: "w-24",
    track: "c0",
    number: 24,
    title: "两数之和",
    titleEn: "Two-Sum",
    difficulty: "warmup",
    minutes: 12,
    tags: ["双层循环", "输出参数"],
    tagsEn: ["nested-loops", "out-params"],
    lessonId: "cc-c0-5",
    warmupStage: "practice",
    nextSteps: [{ kind: "problem", id: "c-07" }],
    brief:
      "综合练习：双层循环找一对下标，让两数之和等于目标——找不到就别碰输出。",
    briefEn:
      "Practice: nested loops hunting an index pair whose values sum to the target — and never touch the outputs when there is none.",
    description: [
      "实现 `bool two_sum(const int a[], int n, int target, int *i, int *j)`：在数组里找**任意**一对下标 `0 <= *i < *j < n`，使两数之和等于 target。注意：元素与 target 都在 int 范围内，但两数之和可能越出 int——比较前先把其中一个操作数宽化成 `long long`（判题器也是这样核对的）。找到：写入两个输出参数并返回 true；找不到：返回 false 且**不修改** `*i`、`*j`。保证 `0 <= n <= 100`，指针非 NULL。",
      '综合点：双层循环枚举所有下标对（外层 x 从 0 起，内层 y 从 x+1 起——天然保证 x < y 且不重复）+ 指针输出参数（w-16 的技能）+ "失败不碰输出"的纪律（cc-c0-6/w-23 的精神，这里是它最温和的形态）。暴力 O(n²) 完全合格，n 最多 100。',
      '判题是**验证式**的：有多组解时任何一组都算对——判题器检查你返回的下标对本身是否满足条件，而不是比对某个"标准答案"。',
    ],
    descriptionEn: [
      "Implement `bool two_sum(const int a[], int n, int target, int *i, int *j)`: find **any** index pair `0 <= *i < *j < n` whose values sum to target. Note: elements and target fit in int, yet the SUM of two may not — widen one operand to `long long` before comparing (the judge verifies the same way). Found: write both out-parameters, return true. Not found: return false and leave `*i`, `*j` **unmodified**. Guaranteed `0 <= n <= 100` and non-NULL pointers.",
      "What it combines: nested loops enumerating all pairs (outer x from 0, inner y from x+1 — guaranteeing x < y without duplicates) + pointer out-parameters (w-16’s skill) + the never-touch-outputs-on-failure discipline (the gentlest form of cc-c0-6/w-23’s spirit). Brute-force O(n²) fully qualifies at n ≤ 100.",
      "Judging is **verification-style**: with multiple valid pairs, any one counts — the judge checks that YOUR returned pair satisfies the condition rather than comparing against one blessed answer.",
    ],
    language: "c",
    starterCode: `#include <stdbool.h>

/* 任意一对 0 <= *i < *j < n 使 a[*i]+a[*j] == target。
 * 无解: 返回 false 且不碰 *i、*j。 */
bool two_sum(const int a[], int n, int target, int *i, int *j)
{
    (void)a; (void)n; (void)target; (void)i; (void)j;
    return false; /* TODO: 外层 x, 内层 y 从 x+1 起 */
}`,
    starterCodeEn: `#include <stdbool.h>

/* Any pair 0 <= *i < *j < n with a[*i]+a[*j] == target.
 * No solution: return false and leave *i, *j untouched. */
bool two_sum(const int a[], int n, int target, int *i, int *j)
{
    (void)a; (void)n; (void)target; (void)i; (void)j;
    return false; /* TODO: outer x, inner y starting at x+1 */
}`,
    harness: `#include <stdio.h>
#include <stdbool.h>
{{USER_CODE}}

static int _pass, _total;
static void check(const char *label, int cond)
{
    _total++;
    if (cond) { _pass++; printf("[PASS] %s\\n", label); }
    else printf("[FAIL] %s\\n", label);
}

/* verification-style: accept ANY valid pair */
static void expect_found(const char *label, const int a[], int n, int target)
{
    int i = -101, j = -202;                 /* canaries */
    bool ok = two_sum(a, n, target, &i, &j);
    check(label, ok && 0 <= i && i < j && j < n
                 && (long long)a[i] + a[j] == target);
}

static void expect_missing(const char *label, const int a[], int n, int target)
{
    int i = -101, j = -202;
    bool ok = two_sum(a, n, target, &i, &j);
    check(label, !ok && i == -101 && j == -202);   /* outputs untouched */
}

int main(void)
{
    int a[] = { 3, 8, 14, 6 };
    expect_found("14+6=20", a, 4, 20);
    expect_found("ends 3+6=9", a, 4, 9);
    expect_missing("no pair sums to 13", a, 4, 13);

    int b[] = { 4, 4 };
    expect_found("duplicate values", b, 2, 8);

    int c[] = { -6, 2, 5 };
    expect_found("negative + positive", c, 3, -1);
    /* scanning pairs whose sum exceeds int must not be UB (widening) */
    int big[] = { 2000000000, 2000000000, -2000000000 };
    expect_found("huge values, valid answer", big, 3, 0);
    expect_missing("huge values, no answer", big, 3, 7);

    int d[] = { 5 };
    expect_missing("single element has no pair", d, 1, 10);
    expect_missing("empty array", d, 0, 0);

    int e[] = { 0, 0, 0 };
    expect_found("zeros", e, 3, 0);

    printf("RESULT %d/%d\\n", _pass, _total);
    return _pass == _total ? 0 : 1;
}`,
    hints: [
      "双层枚举模板：`for (int x = 0; x < n; x++) for (int y = x + 1; y < n; y++) if ((long long)a[x] + a[y] == target) { ... }`——宽化那一步防的是有符号溢出 UB。",
      "找到时先写输出再返回：`*i = x; *j = y; return true;`——两个 return 路径，成功的这条写输出，失败的那条（双层循环走完后）什么都不写直接 `return false;`。",
      "内层从 x+1 起步一举三得：保证 i < j、不与自己配对、不重复检查同一对。",
    ],
    hintsEn: [
      "The pair-enumeration template: `for (int x = 0; x < n; x++) for (int y = x + 1; y < n; y++) if ((long long)a[x] + a[y] == target) { ... }` — the widening step wards off signed-overflow UB.",
      "On success, write outputs then return: `*i = x; *j = y; return true;` — two return paths: the successful one writes, the failing one (after both loops finish) writes nothing and just `return false;`.",
      "Starting the inner loop at x+1 wins three ways at once: i < j guaranteed, no self-pairing, no duplicate pairs checked.",
    ],
    solution: `#include <stdbool.h>

bool two_sum(const int a[], int n, int target, int *i, int *j)
{
    for (int x = 0; x < n; x++) {
        for (int y = x + 1; y < n; y++) {
            if ((long long)a[x] + a[y] == target) {
                *i = x;
                *j = y;
                return true;
            }
        }
    }
    return false;
}`,
    solutionNote:
      '三个已学概念的第一次合奏：双层循环的"从 x+1 起"消掉了半个搜索空间；输出参数只在确认成功后写入（判题的 canary 哨兵专查这一条）；找不到的 return false 落在所有循环之外（w-15 的控制流课）。验证式判题也值得留意：好的测试检查"性质"（下标对满足条件）而非"钦定答案"——你在 w-14 的"反转两次还原"里已经见过这个思想。下一站 c-07：同样的输出参数纪律，配上内核的负 errno。',
    solutionNoteEn:
      "Three learned concepts in first ensemble: the inner loop’s x+1 start eliminates half the search space; out-parameters are written only after success is confirmed (the judge’s canary sentinels audit exactly this); the not-found return false sits outside all loops (w-15’s control-flow lesson). The verification-style judging deserves note too: good tests check properties (the returned pair satisfies the condition) rather than one anointed answer — an idea you met in w-14’s reverse-twice-restores. Next stop c-07: the same out-parameter discipline, now with kernel negative errno.",
  },
  {
    id: "w-25",
    track: "c0",
    number: 25,
    title: "移零到尾",
    titleEn: "Zeroes to the Back",
    difficulty: "warmup",
    minutes: 12,
    tags: ["读写双游标", "原地"],
    tagsEn: ["read-write-cursors", "in-place"],
    lessonId: "cc-c0-4",
    warmupStage: "practice",
    brief: "综合练习：把所有 0 挪到数组尾部，非零元素保持原有顺序——原地完成。",
    briefEn:
      "Practice: move every 0 to the back while non-zeroes keep their relative order — in place.",
    description: [
      "实现 `void move_zeroes(int a[], int n)`：原地重排，使所有非零元素保持原相对顺序地排在前面，所有 0 排在后面。`{0,5,0,4,9}` 变成 `{5,4,9,0,0}`。保证 `n >= 0`。",
      '推荐思路是"读写双游标"：读游标 r 从头到尾看每个元素；写游标 w 指向"下一个非零元素该放的位置"。r 遇到非零就放到 a[w] 并让 w 前进；扫完后把 a[w..n-1] 全部填 0。两个游标永远满足 w <= r——写不会追上读，所以原地是安全的。',
    ],
    descriptionEn: [
      "Implement `void move_zeroes(int a[], int n)`: rearrange in place so all non-zero elements come first in their original relative order, followed by all the zeroes. `{0,5,0,4,9}` becomes `{5,4,9,0,0}`. Guaranteed `n >= 0`.",
      "The recommended shape is read/write cursors: a read cursor r visits every element; a write cursor w marks where the next non-zero belongs. Whenever r sees a non-zero, store it at a[w] and advance w; after the scan, fill a[w..n-1] with zeroes. The cursors always satisfy w <= r — the writer never overtakes the reader, which is what makes in-place safe.",
    ],
    language: "c",
    starterCode: `/* 非零保持相对顺序靠前, 0 全部靠后; 原地完成 */
void move_zeroes(int a[], int n)
{
    (void)a; (void)n;
    /* TODO: 读游标扫描, 写游标安放非零, 最后补零 */
}`,
    starterCodeEn: `/* Non-zeroes first in relative order, zeroes last; in place */
void move_zeroes(int a[], int n)
{
    (void)a; (void)n;
    /* TODO: read cursor scans, write cursor places non-zeroes, then backfill zeroes */
}`,
    harness: `#include <stdio.h>
#include <string.h>
{{USER_CODE}}

static int _pass, _total;
static void check_arrays(const char *label, const int *expect, const int *got, int n)
{
    _total++;
    if (memcmp(expect, got, (size_t)n * sizeof(int)) == 0) {
        _pass++;
        printf("[PASS] %s\\n", label);
    } else {
        printf("[FAIL] %s\\n", label);
    }
}

int main(void)
{
    /* guard cells around the working area catch out-of-bounds writes */
    int g1[7] = { 111, 0, 5, 0, 4, 9, 222 };
    int e1[] = { 5, 4, 9, 0, 0 };
    move_zeroes(g1 + 1, 5);
    check_arrays("classic case", e1, g1 + 1, 5);
    _total++;
    if (g1[0] == 111 && g1[6] == 222) { _pass++; printf("[PASS] guards intact\\n"); }
    else printf("[FAIL] guards intact\\n");

    int b[] = { 0, 0, 0 };
    int eb[] = { 0, 0, 0 };
    move_zeroes(b, 3);
    check_arrays("all zeroes", eb, b, 3);

    int c[] = { 4, 5, 6 };
    int ec[] = { 4, 5, 6 };
    move_zeroes(c, 3);
    check_arrays("no zeroes: untouched order", ec, c, 3);

    int d[] = { 0, -7 };
    int ed[] = { -7, 0 };
    move_zeroes(d, 2);
    check_arrays("negative values move too", ed, d, 2);

    int f[] = { 9 };
    int ef[] = { 9 };
    move_zeroes(f, 1);
    check_arrays("single element", ef, f, 1);
    move_zeroes(f, 0);
    check_arrays("n == 0 no-op", ef, f, 1);

    int h[] = { 1, 0, 2, 0, 3, 0, 4 };
    int eh[] = { 1, 2, 3, 4, 0, 0, 0 };
    move_zeroes(h, 7);
    check_arrays("alternating", eh, h, 7);

    printf("RESULT %d/%d\\n", _pass, _total);
    return _pass == _total ? 0 : 1;
}`,
    hints: [
      "第一阶段（压实）：`int w = 0; for (int r = 0; r < n; r++) if (a[r] != 0) a[w++] = a[r];`。",
      "第二阶段（补零）：`while (w < n) a[w++] = 0;`——w 此刻正好停在非零区的末尾。",
      "为什么顺序保得住？读游标从左到右，非零元素按遇到的次序放进 w 位置——先来先安家。",
    ],
    hintsEn: [
      "Phase one (compact): `int w = 0; for (int r = 0; r < n; r++) if (a[r] != 0) a[w++] = a[r];`.",
      "Phase two (backfill): `while (w < n) a[w++] = 0;` — w is parked exactly at the end of the non-zero zone.",
      "Why does order survive? The read cursor moves left to right, and non-zeroes settle into w slots in encounter order — first come, first housed.",
    ],
    solution: `void move_zeroes(int a[], int n)
{
    int w = 0;
    for (int r = 0; r < n; r++) {
        if (a[r] != 0)
            a[w++] = a[r];
    }
    while (w < n)
        a[w++] = 0;
}`,
    solutionNote:
      '读写双游标是"原地过滤"的标准解法：不变量 w <= r 保证写入永远落在已读区，数据不会自我践踏。这个不变量思维值得存档——它就是 k-05/k-12 里 GPU 环形缓冲 rptr/wptr 关系的单线程雏形（那边是"读不越过写"，这边是"写不越过读"，同一族约束）。两阶段结构（先压实、后补零）也比"逐个交换"更少写内存。',
    solutionNoteEn:
      'Read/write cursors are the standard in-place filter: the invariant w <= r guarantees every write lands in already-read territory, so the data never tramples itself. File that invariant away — it is the single-threaded embryo of the GPU ring rptr/wptr relationship in k-05/k-12 (there "reads never pass writes", here "writes never pass reads" — one family of constraints). The two-phase structure (compact, then backfill) also touches memory less than swap-by-swap approaches.',
  },
  {
    id: "w-26",
    track: "c0",
    number: 26,
    title: "合并有序数组",
    titleEn: "Merge Two Sorted Arrays",
    difficulty: "warmup",
    minutes: 12,
    tags: ["双索引", "归并"],
    tagsEn: ["two-indices", "merge"],
    lessonId: "cc-c0-4",
    warmupStage: "practice",
    brief: "综合练习：两列有序数据归并成一列——归并排序的心脏，一步到位写对。",
    briefEn:
      "Practice: merge two sorted columns into one — the heart of merge sort, written right in one go.",
    description: [
      "实现 `void merge_sorted(const int a[], int na, const int b[], int nb, int dest[])`：a 和 b 各自升序，把两者合并成一个升序序列写入 dest。保证 `na, nb >= 0`，dest 容量恰为 `na + nb`，三块内存互不重叠。",
      '经典"双索引"算法：i 指着 a 的下一个候选，j 指着 b 的下一个候选，每轮把较小者搬进 dest 并推进对应索引；一边耗尽后，把另一边剩余的整段搬完。相等时先取哪边都对（取 a 的可保持稳定性——题解细说）。',
      '空输入是一等公民：na 或 nb 为 0 时（甚至同时为 0），算法应自然退化成"整段搬运"或"什么都不做"。',
    ],
    descriptionEn: [
      "Implement `void merge_sorted(const int a[], int na, const int b[], int nb, int dest[])`: a and b are each ascending; merge them into one ascending sequence in dest. Guaranteed `na, nb >= 0`, dest has capacity exactly `na + nb`, and the three blocks do not overlap.",
      "The classic two-index algorithm: i marks a’s next candidate, j marks b’s; each round moves the smaller into dest and advances its index; once one side is exhausted, bulk-copy the remainder of the other. On ties, either side works (taking a’s preserves stability — solution notes elaborate).",
      "Empty inputs are first-class: with na or nb zero (or both), the algorithm should degrade naturally into a bulk copy or a no-op.",
    ],
    language: "c",
    starterCode: `/* 把升序的 a(na 个) 与 b(nb 个) 归并进 dest(容量 na+nb) */
void merge_sorted(const int a[], int na, const int b[], int nb, int dest[])
{
    (void)a; (void)na; (void)b; (void)nb; (void)dest;
    /* TODO: i/j 双索引比小取小; 一边耗尽后收尾 */
}`,
    starterCodeEn: `/* Merge ascending a (na items) and b (nb items) into dest (capacity na+nb) */
void merge_sorted(const int a[], int na, const int b[], int nb, int dest[])
{
    (void)a; (void)na; (void)b; (void)nb; (void)dest;
    /* TODO: two indices i/j taking the smaller; drain the leftover side */
}`,
    harness: `#include <stdio.h>
#include <string.h>
{{USER_CODE}}

static int _pass, _total;
static void check_merge(const char *label, const int a[], int na,
                        const int b[], int nb, const int expect[])
{
    int buf[18];
    for (int k = 0; k < 18; k++) buf[k] = 0x5EED;   /* canary fill */
    merge_sorted(a, na, b, nb, buf + 1);            /* guarded dest */
    _total++;
    int n = na + nb;
    if (memcmp(expect, buf + 1, (size_t)n * sizeof(int)) == 0
        && buf[0] == 0x5EED && buf[1 + n] == 0x5EED) {
        _pass++;
        printf("[PASS] %s\\n", label);
    } else {
        printf("[FAIL] %s\\n", label);
    }
}

int main(void)
{
    int dummy = 0;

    int a1[] = { 1, 3, 5 }, b1[] = { 2, 4, 6 };
    int e1[] = { 1, 2, 3, 4, 5, 6 };
    check_merge("interleaved", a1, 3, b1, 3, e1);

    int a2[] = { 1, 2 }, b2[] = { 8, 9, 10 };
    int e2[] = { 1, 2, 8, 9, 10 };
    check_merge("a exhausts first", a2, 2, b2, 3, e2);

    int a3[] = { 8, 9 }, b3[] = { 1, 2 };
    int e3[] = { 1, 2, 8, 9 };
    check_merge("b all smaller", a3, 2, b3, 2, e3);

    int b4[] = { 4, 5 };
    int e4[] = { 4, 5 };
    check_merge("a empty (dummy ptr)", &dummy, 0, b4, 2, e4);

    int a5[] = { 7 };
    int e5[] = { 7 };
    check_merge("b empty", a5, 1, &dummy, 0, e5);

    check_merge("both empty", &dummy, 0, &dummy, 0, e5);

    int a6[] = { 2, 2 }, b6[] = { 2 };
    int e6[] = { 2, 2, 2 };
    check_merge("duplicates across arrays", a6, 2, b6, 1, e6);

    int a7[] = { -5, 0 }, b7[] = { -9, 3 };
    int e7[] = { -9, -5, 0, 3 };
    check_merge("negatives", a7, 2, b7, 2, e7);

    printf("RESULT %d/%d\\n", _pass, _total);
    return _pass == _total ? 0 : 1;
}`,
    hints: [
      "主循环：`int i = 0, j = 0, k = 0; while (i < na && j < nb) dest[k++] = (a[i] <= b[j]) ? a[i++] : b[j++];`。",
      "收尾两段：`while (i < na) dest[k++] = a[i++]; while (j < nb) dest[k++] = b[j++];`——最多只有一段真正执行。",
      'i++ 写在表达式里表示"用完这个值后索引前进"——拆成多行写也完全可以，清晰优先。',
    ],
    hintsEn: [
      "Main loop: `int i = 0, j = 0, k = 0; while (i < na && j < nb) dest[k++] = (a[i] <= b[j]) ? a[i++] : b[j++];`.",
      "Two drains to finish: `while (i < na) dest[k++] = a[i++]; while (j < nb) dest[k++] = b[j++];` — at most one actually runs.",
      'i++ inside the expression means "advance after using this value" — spelling it across several lines is equally fine; clarity first.',
    ],
    solution: `void merge_sorted(const int a[], int na, const int b[], int nb, int dest[])
{
    int i = 0, j = 0, k = 0;

    while (i < na && j < nb) {
        if (a[i] <= b[j])
            dest[k++] = a[i++];
        else
            dest[k++] = b[j++];
    }
    while (i < na)
        dest[k++] = a[i++];
    while (j < nb)
        dest[k++] = b[j++];
}`,
    solutionNote:
      '归并的骨架三段论：比小取小、一边耗尽、整段收尾。相等时取 a（<= 而非 <）保证了"稳定性"——同值元素维持来源顺序，这在带附属数据的排序里是实打实的正确性问题（c-13 的多键比较正是为稳定输出服务）。空输入直接跳过主循环进入收尾——又一次零次循环的自然正确。这一小段代码是归并排序、外部排序、以及内核里多队列合并的公共心脏。',
    solutionNoteEn:
      "The merge skeleton in three movements: take the smaller, one side exhausts, drain the rest. Taking a on ties (<= rather than <) buys stability — equal keys keep their source order, a genuine correctness issue once records carry payloads (c-13’s multi-key comparison serves exactly stable output). Empty inputs skip the main loop straight into the drains — zero-trip correctness once more. These few lines are the shared heart of merge sort, external sorting, and multi-queue merging in kernels.",
  },
  {
    id: "w-27",
    track: "c0",
    number: 27,
    title: "二分查找",
    titleEn: "Binary Search",
    difficulty: "warmup",
    minutes: 12,
    tags: ["二分", "循环不变量"],
    tagsEn: ["binary-search", "loop-invariant"],
    lessonId: "cc-c0-4",
    warmupStage: "practice",
    brief: "综合练习：有序数组上的对半排除——著名地容易写错，用不变量把它写对。",
    briefEn:
      "Practice: halving the search space on a sorted array — famously easy to get wrong, so get it right with an invariant.",
    description: [
      "实现 `int bsearch_int(const int a[], int n, int target)`：a 升序（可含重复），返回 target 的**任一**真实出现位置的下标；不存在返回 -1。保证 `n >= 0`。",
      "思想：维护候选区间 [lo, hi]（闭区间）。每轮看中点：命中即返回；中点值偏小则答案只能在右半（lo = mid + 1）；偏大则在左半（hi = mid - 1）。区间为空（lo > hi）时宣告不存在。",
      '二分是出了名的"看着简单、边界易错"：区间会不会漏掉元素？每轮是否严格缩小（不缩小 = 死循环）？空数组是否直接返回 -1？判题的空/单元素/两端/重复用例逐一检验这些。中点写法请用 `lo + (hi - lo) / 2`——题解解释它相对 `(lo+hi)/2` 的工程意义。',
    ],
    descriptionEn: [
      "Implement `int bsearch_int(const int a[], int n, int target)`: a is ascending (duplicates allowed); return the index of **any** real occurrence of target, or -1 when absent. Guaranteed `n >= 0`.",
      "The idea: maintain a candidate interval [lo, hi] (inclusive). Each round inspect the midpoint: a hit returns; a too-small midpoint pushes the answer right (lo = mid + 1); too large pushes left (hi = mid - 1). An empty interval (lo > hi) declares absence.",
      "Binary search is famous for looking simple and breaking at the edges: can the interval drop an element? Does every round strictly shrink it (no shrink = infinite loop)? Does the empty array return -1 immediately? The judge’s empty/single/ends/duplicates cases probe each. Write the midpoint as `lo + (hi - lo) / 2` — the notes explain its engineering merit over `(lo+hi)/2`.",
    ],
    language: "c",
    starterCode: `/* 升序数组中 target 的任一下标; 不存在 -> -1 */
int bsearch_int(const int a[], int n, int target)
{
    (void)a; (void)n; (void)target;
    return -1; /* TODO: 闭区间 [lo, hi], 每轮必须缩小 */
}`,
    starterCodeEn: `/* Any index of target in the ascending array; absent -> -1 */
int bsearch_int(const int a[], int n, int target)
{
    (void)a; (void)n; (void)target;
    return -1; /* TODO: inclusive [lo, hi]; every round must shrink it */
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
    int a[] = { 1, 3, 5, 7, 9, 11 };
    check("hit middle-ish", bsearch_int(a, 6, 7) == 3);
    check("hit first", bsearch_int(a, 6, 1) == 0);
    check("hit last", bsearch_int(a, 6, 11) == 5);
    check("miss inside gap", bsearch_int(a, 6, 6) == -1);
    check("miss below all", bsearch_int(a, 6, 0) == -1);
    check("miss above all", bsearch_int(a, 6, 99) == -1);

    check("empty array", bsearch_int(a, 0, 5) == -1);

    int s[] = { 42 };
    check("single hit", bsearch_int(s, 1, 42) == 0);
    check("single miss", bsearch_int(s, 1, 7) == -1);

    int d[] = { 2, 5, 5, 5, 8 };
    int r = bsearch_int(d, 5, 5);
    check("duplicates: any true hit", r >= 1 && r <= 3 && d[r] == 5);

    int two[] = { 1, 2 };
    check("two elements, hit each", bsearch_int(two, 2, 1) == 0 && bsearch_int(two, 2, 2) == 1);
    check("two elements, miss", bsearch_int(two, 2, 3) == -1);

    printf("RESULT %d/%d\\n", _pass, _total);
    return _pass == _total ? 0 : 1;
}`,
    hints: [
      "骨架：`int lo = 0, hi = n - 1; while (lo <= hi) { int mid = lo + (hi - lo) / 2; if (a[mid] == target) return mid; if (a[mid] < target) lo = mid + 1; else hi = mid - 1; } return -1;`。",
      "不变量一句话：**若 target 在数组里，它一定在 [lo, hi] 内**。每个分支都要保持这句话为真——这就是 mid+1/mid-1 而非 mid 的原因（mid 已经查过，留下它就可能不缩小 → 死循环）。",
      "空数组时 hi = -1，循环条件 0 <= -1 直接为假——零次循环返回 -1，无需特判。",
    ],
    hintsEn: [
      "Skeleton: `int lo = 0, hi = n - 1; while (lo <= hi) { int mid = lo + (hi - lo) / 2; if (a[mid] == target) return mid; if (a[mid] < target) lo = mid + 1; else hi = mid - 1; } return -1;`.",
      "The invariant in one sentence: **if target is in the array, it lies within [lo, hi]**. Every branch must keep that sentence true — hence mid+1/mid-1 rather than mid (mid is already examined; keeping it can fail to shrink → infinite loop).",
      "For the empty array, hi = -1 and the condition 0 <= -1 is immediately false — zero trips, return -1, no special case.",
    ],
    solution: `int bsearch_int(const int a[], int n, int target)
{
    int lo = 0;
    int hi = n - 1;

    while (lo <= hi) {
        int mid = lo + (hi - lo) / 2;
        if (a[mid] == target)
            return mid;
        if (a[mid] < target)
            lo = mid + 1;
        else
            hi = mid - 1;
    }
    return -1;
}`,
    solutionNote:
      '把正确性拴在不变量上："target 若存在必在 [lo, hi]"。三个分支各自守护它：命中返回；两个排除分支用 mid±1 把已查过的中点扔出区间——顺带保证区间每轮严格缩小，杜绝死循环。`lo + (hi - lo) / 2` 与 `(lo + hi) / 2` 数学等价，但后者的 lo+hi 在极大下标（接近 INT_MAX 的数组）上会先溢出——本题的 n 不会触发它，写成安全形式是习惯养成：同一个"运算中途溢出"教训在 c-03/w-21 已两次出现。历史注脚：首个二分查找发表于 1946 年，而首个对所有 n 都正确的版本迟至 1962 年——边界之难，古已有之。',
    solutionNoteEn:
      'Tie correctness to the invariant: "if target exists, it lies in [lo, hi]". Each branch guards it: the hit returns; the two exclusion branches use mid±1 to expel the already-examined midpoint — simultaneously guaranteeing strict shrinkage per round, banishing infinite loops. `lo + (hi - lo) / 2` equals `(lo + hi) / 2` mathematically, but lo+hi can overflow first on huge indices (arrays near INT_MAX) — untriggerable at this problem’s sizes, yet writing the safe form builds the habit: the same mid-computation-overflow lesson already appeared twice in c-03/w-21. Historical footnote: the first binary search was published in 1946; the first version correct for every n arrived in 1962 — boundaries have been hard for a very long time.',
  },
  {
    id: "w-28",
    track: "c0",
    number: 28,
    title: "回文判断",
    titleEn: "Palindrome Check",
    difficulty: "warmup",
    minutes: 10,
    tags: ["字符串", "双指针"],
    tagsEn: ["strings", "two-pointers"],
    lessonId: "cc-c0-5",
    warmupStage: "practice",
    brief: "综合练习：首尾双指针相向比对——w-14 的相遇模式搬到字符串上。",
    briefEn:
      "Practice: two pointers compare from both ends inward — w-14’s meeting pattern transplanted onto strings.",
    description: [
      '实现 `bool is_palindrome(const char *s)`：字符串正读反读完全一致返回 true。**严格逐字符**比较——不忽略大小写、不跳过空格标点（"No lemon" 这类宽松版是后续进阶）。保证 s 非 NULL。',
      "约定：空串与单字符都是回文（没有可失配的字符对）。",
      '组合的技能：w-17 的"先量长度"+ w-14 的"双下标相向"。先拿到长度才能站上最后一个字符（下标 len-1），然后首尾配对比较、相向而行。',
    ],
    descriptionEn: [
      'Implement `bool is_palindrome(const char *s)`: true when the string reads identically forwards and backwards. **Strictly character by character** — no case folding, no skipping spaces or punctuation (the lenient "No lemon" variant is a later upgrade). s is guaranteed non-NULL.',
      "Conventions: the empty string and single characters are palindromes (no pair can mismatch).",
      "Skills combined: w-17’s measure-the-length-first + w-14’s two-indices-inward. Only with the length can you stand on the last character (index len-1); then compare end pairs marching toward the middle.",
    ],
    language: "c",
    starterCode: `#include <stdbool.h>
#include <string.h>

/* 严格逐字符回文; "" 与单字符为 true */
bool is_palindrome(const char *s)
{
    (void)s;
    return false; /* TODO: 先 strlen, 再首尾双指针 */
}`,
    starterCodeEn: `#include <stdbool.h>
#include <string.h>

/* Strict character palindrome; "" and single chars are true */
bool is_palindrome(const char *s)
{
    (void)s;
    return false; /* TODO: strlen first, then two ends inward */
}`,
    harness: `#include <stdio.h>
#include <stdbool.h>
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
    check("odd-length palindrome", is_palindrome("radar") == true);
    check("even-length palindrome", is_palindrome("abba") == true);
    check("not a palindrome", is_palindrome("gfx") == false);
    check("empty string", is_palindrome("") == true);
    check("single char", is_palindrome("x") == true);
    check("two same", is_palindrome("aa") == true);
    check("two different", is_palindrome("ab") == false);
    check("case matters (strict)", is_palindrome("Abba") == false);
    check("space matters (strict)", is_palindrome("a bba") == false);
    check("differs only in middle-ish", is_palindrome("abcba") == true);
    check("almost palindrome", is_palindrome("abcda") == false);

    printf("RESULT %d/%d\\n", _pass, _total);
    return _pass == _total ? 0 : 1;
}`,
    hints: [
      "骨架：`size_t len = strlen(s); size_t i = 0, j = len - 1; while (i < j) { if (s[i] != s[j]) return false; i++; j--; } return true;`——但小心：len 为 0 时 len - 1 是什么？",
      "size_t 是无符号的：0 - 1 会回绕成天文数字（c-03 的坑！）。最稳的做法是空串（len == 0）先行返回 true，或者用 while (i + 1 < len - i) 这类不做减法的形态。",
      '"a bba" 为 false 是严格模式的试金石：空格也是字符，参与逐位比较（宽松版会先剔除空格得到 "abba"）。',
    ],
    hintsEn: [
      "Skeleton: `size_t len = strlen(s); size_t i = 0, j = len - 1; while (i < j) { if (s[i] != s[j]) return false; i++; j--; } return true;` — but careful: what is len - 1 when len is 0?",
      "size_t is unsigned: 0 - 1 wraps to an astronomical number (the c-03 trap!). Safest is returning true for the empty string (len == 0) up front, or using a subtraction-free shape like while (i + 1 < len - i).",
      '"a bba" being false is the litmus of strict mode: the space is a character and joins the comparison (a lenient version would strip it and see "abba").',
    ],
    solution: `#include <stdbool.h>
#include <string.h>

bool is_palindrome(const char *s)
{
    size_t len = strlen(s);
    if (len == 0)
        return true;

    size_t i = 0;
    size_t j = len - 1;
    while (i < j) {
        if (s[i] != s[j])
            return false;
        i++;
        j--;
    }
    return true;
}`,
    solutionNote:
      '双指针相向 + 提前否决：任何一对失配立即 false，全部配对通过才 true——"证伪一票即否，证实需要全场"。空串特判不是美学而是必需：size_t 的 len - 1 在 len==0 时回绕成 SIZE_MAX（热身轨道第二次遇见无符号回绕，第一次在 c-03 的预告里）——凡是无符号减法，先问"够减吗"。单字符不需要特判：i=0, j=0，i < j 为假，循环零次返回 true。',
    solutionNoteEn:
      'Two pointers inward plus early veto: any mismatched pair returns false at once; only a full sweep of matches earns true — "one vote falsifies, verification needs the whole floor". The empty-string case is necessity, not taste: size_t’s len - 1 wraps to SIZE_MAX at len==0 (the warm-up track’s second encounter with unsigned wraparound, foreshadowed in c-03) — before any unsigned subtraction, ask "can it afford this?". Single characters need no case: i=0, j=0 makes i < j false, zero trips, true.',
  },
  {
    id: "w-29",
    track: "c0",
    number: 29,
    title: "有序去重",
    titleEn: "Dedup a Sorted Array",
    difficulty: "warmup",
    minutes: 12,
    tags: ["读写双游标", "前缀有效"],
    tagsEn: ["read-write-cursors", "valid-prefix"],
    lessonId: "cc-c0-4",
    warmupStage: "practice",
    brief: '综合练习：升序数组原地去重，返回新长度——"前缀有效"接口的第一课。',
    briefEn:
      "Practice: dedup an ascending array in place and return the new length — your first valid-prefix interface.",
    description: [
      "实现 `int dedup_sorted(int a[], int n)`：a 升序（可含重复）。原地把**每个不同值保留一份**，紧凑地排在数组前部，返回保留的个数 `new_n`。保证 `n >= 0`。",
      '接口契约值得细读：只有前缀 `a[0..new_n)` 有意义，`a[new_n..n)` 的内容**未定义**（unspecified）——判题不检查尾部。这种"前缀有效 + 返回有效长度"的接口形态在系统代码里非常普遍（读缓冲、过滤、压缩全用它）。',
      '因为数组有序，重复元素必然相邻——判断"是否新值"只需与**上一个保留的值**比较。这让 w-25 的读写双游标直接适用。',
    ],
    descriptionEn: [
      "Implement `int dedup_sorted(int a[], int n)`: a is ascending (duplicates allowed). In place, keep **one copy of each distinct value**, packed at the front, and return the kept count `new_n`. Guaranteed `n >= 0`.",
      "Read the contract closely: only the prefix `a[0..new_n)` is meaningful; the contents of `a[new_n..n)` are **unspecified** — the judge does not inspect the tail. This valid-prefix-plus-returned-length interface shape is everywhere in systems code (read buffers, filters, compaction).",
      'Because the array is sorted, duplicates are necessarily adjacent — deciding "is this a new value" only needs a comparison with the **last kept value**. Which makes w-25’s read/write cursors directly applicable.',
    ],
    language: "c",
    starterCode: `/* 原地去重(升序输入), 返回新长度; 尾部内容不作要求 */
int dedup_sorted(int a[], int n)
{
    (void)a; (void)n;
    return 0; /* TODO: 与上一个保留值比较, 不同才写入 */
}`,
    starterCodeEn: `/* Dedup in place (ascending input), return the new length; tail contents unconstrained */
int dedup_sorted(int a[], int n)
{
    (void)a; (void)n;
    return 0; /* TODO: compare with the last KEPT value; write only when different */
}`,
    harness: `#include <stdio.h>
#include <string.h>
{{USER_CODE}}

static int _pass, _total;
static void check_dedup(const char *label, int input[], int n,
                        const int expect[], int expect_n)
{
    int got_n = dedup_sorted(input, n);
    _total++;
    if (got_n == expect_n
        && memcmp(expect, input, (size_t)expect_n * sizeof(int)) == 0) {
        _pass++;
        printf("[PASS] %s\\n", label);
    } else {
        printf("[FAIL] %s (got_n=%d)\\n", label, got_n);
    }
}

int main(void)
{
    int a[] = { 1, 1, 2, 3, 3, 3, 4 };
    int ea[] = { 1, 2, 3, 4 };
    check_dedup("mixed duplicates", a, 7, ea, 4);

    int b[] = { 7, 7, 7, 7 };
    int eb[] = { 7 };
    check_dedup("all same", b, 4, eb, 1);

    int c[] = { 1, 2, 3 };
    int ec[] = { 1, 2, 3 };
    check_dedup("no duplicates", c, 3, ec, 3);

    int d[] = { 5 };
    int ed[] = { 5 };
    check_dedup("single element", d, 1, ed, 1);

    int e[] = { 9 };
    check_dedup("empty array", e, 0, ed, 0);

    int f[] = { -3, -3, -1, 0, 0 };
    int ef[] = { -3, -1, 0 };
    check_dedup("negatives and zero", f, 5, ef, 3);

    int g[] = { 2, 2, 5, 5, 5, 5, 5, 9, 9 };
    int eg[] = { 2, 5, 9 };
    check_dedup("long runs", g, 9, eg, 3);

    printf("RESULT %d/%d\\n", _pass, _total);
    return _pass == _total ? 0 : 1;
}`,
    hints: [
      "骨架：`if (n == 0) return 0; int w = 1; for (int r = 1; r < n; r++) if (a[r] != a[w - 1]) a[w++] = a[r]; return w;`。",
      '第一个元素永远保留（没有"上一个"可重复），所以 w 和 r 都从 1 起步——这也解释了为什么 n==0 要先返回。',
      "用 a[w-1]（上一个**保留**的值）最直接地表达“有效前缀”不变量，也能推广到更一般的原地过滤。仅对本题的升序输入，比较相邻原值 a[r-1] 也能得到正确答案；这里选择 a[w-1] 是为了让读写双游标的含义更清楚。",
    ],
    hintsEn: [
      "Skeleton: `if (n == 0) return 0; int w = 1; for (int r = 1; r < n; r++) if (a[r] != a[w - 1]) a[w++] = a[r]; return w;`.",
      'The first element is always kept (there is no "previous" to duplicate), so both w and r start at 1 — which also explains the early return for n==0.',
      "Using a[w-1] (the last KEPT value) states the valid-prefix invariant directly and generalizes to broader in-place filters. For this sorted-input problem alone, comparing adjacent original values with a[r-1] is also correct; a[w-1] is chosen because it makes the read/write-cursor meaning explicit.",
    ],
    solution: `int dedup_sorted(int a[], int n)
{
    if (n == 0)
        return 0;

    int w = 1;
    for (int r = 1; r < n; r++) {
        if (a[r] != a[w - 1])
            a[w++] = a[r];
    }
    return w;
}`,
    solutionNote:
      '读写双游标第二课：w-25 的谓词是"非零"，这里的谓词是"与上一个保留值不同"——谓词依赖已写入的数据（a[w-1]），这是过滤类算法的一次小升级。不变量依旧是 w <= r，原地安全同理。"前缀有效、尾部未定"的契约设计也值得体会：不承诺不需要的东西，实现就有自由度（这正是判题不查尾部的原因）。同一接口哲学在 read() 系统调用的返回值、k-05 环形缓冲的有效区间上反复出现。',
    solutionNoteEn:
      'Read/write cursors, lesson two: w-25’s predicate was "non-zero"; here it is "differs from the last kept value" — a predicate that depends on already-written data (a[w-1]), a small upgrade for filter-class algorithms. The invariant is still w <= r, and in-place safety follows as before. The contract design — valid prefix, unspecified tail — rewards attention: promising nothing you do not need buys the implementation freedom (exactly why the judge skips the tail). The same interface philosophy recurs in read()’s return value and k-05’s valid ring region.',
  },
  {
    id: "w-30",
    track: "c0",
    number: 30,
    title: "只出现一次的数",
    titleEn: "The Lonely Number",
    difficulty: "warmup",
    minutes: 10,
    tags: ["XOR", "位运算桥接"],
    tagsEn: ["XOR", "bit-ops-bridge"],
    lessonId: "cc-c0-2",
    warmupStage: "practice",
    nextSteps: [{ kind: "problem", id: "c-04" }],
    brief: "综合练习 + 位运算初见：成对的数互相抵消，落单的那个自己浮出来。",
    briefEn:
      "Practice plus your first bit op: paired numbers cancel each other, and the lonely one surfaces by itself.",
    description: [
      "实现 `int single_number(const int a[], int n)`：数组里**恰有一个值出现一次**，其余每个值都恰好出现两次。返回那个只出现一次的值。保证 n 为正奇数，元素可为负。",
      "这题是位运算的正式引荐（cc-c0-2 已给过三条最小规则）。`^` 是按位异或：两数相同的位得 0、不同的位得 1。三条规则推出魔法：`x ^ x == 0`（自我抵消）、`x ^ 0 == x`（零是单位元）、交换结合律（顺序无关）。把全数组异或起来：成对的都抵消成 0，剩下的就是答案——O(n) 时间、O(1) 空间、一个循环。",
      '诚实声明：这不是"无新概念"的纯综合——XOR 是新面孔。把它当作通往位操作轨道（c-04 起）的一座桥。',
    ],
    descriptionEn: [
      "Implement `int single_number(const int a[], int n)`: exactly **one value appears once**; every other value appears exactly twice. Return the lonely value. n is guaranteed a positive odd number; elements may be negative.",
      "This is bit operations’ formal introduction (cc-c0-2 already handed you the three minimal rules). `^` is bitwise XOR: equal bits give 0, differing bits give 1. The rules compose into magic: `x ^ x == 0` (self-cancellation), `x ^ 0 == x` (zero is the identity), commutativity/associativity (order irrelevant). XOR the whole array: pairs cancel to 0, and what remains is the answer — O(n) time, O(1) space, one loop.",
      "Honest note: this is not a no-new-concepts practice problem — XOR is a new face. Treat it as the bridge into the bit-ops lineage (starting at c-04).",
    ],
    language: "c",
    starterCode: `/* 恰有一个值出现一次, 其余各出现两次; 返回那个值 */
int single_number(const int a[], int n)
{
    (void)a; (void)n;
    return 0; /* TODO: 把所有元素异或起来 */
}`,
    starterCodeEn: `/* Exactly one value appears once; all others appear twice; return it */
int single_number(const int a[], int n)
{
    (void)a; (void)n;
    return 0; /* TODO: XOR everything together */
}`,
    harness: `#include <stdio.h>
{{USER_CODE}}

static int _pass, _total;
static void check_int(const char *label, int expect, int got)
{
    _total++;
    if (expect == got) { _pass++; printf("[PASS] %s\\n", label); }
    else printf("[FAIL] %s (expected=%d got=%d)\\n", label, expect, got);
}

int main(void)
{
    int a[] = { 6, 6, 9 };
    check_int("lonely at the end", 9, single_number(a, 3));

    int b[] = { 12, 5, 7, 5, 12 };
    check_int("pairs scattered", 7, single_number(b, 5));

    int c[] = { 7 };
    check_int("single element", 7, single_number(c, 1));

    int d[] = { -3, 5, -3 };
    check_int("negative pairs", 5, single_number(d, 3));

    int e[] = { 0, 9, 0 };
    check_int("zero pair, nonzero lonely", 9, single_number(e, 3));

    int f[] = { 6, 0, 6 };
    check_int("lonely zero", 0, single_number(f, 3));

    printf("RESULT %d/%d\\n", _pass, _total);
    return _pass == _total ? 0 : 1;
}`,
    hints: [
      "累计变量再登场，这次的运算是 ^、单位元是 0：`int acc = 0; for (int i = 0; i < n; i++) acc ^= a[i]; return acc;`。",
      '为什么成对抵消与顺序无关？交换结合律允许你把相同的数"挪到一起"：a^b^a == a^a^b == 0^b == b。',
      "先拿 {6,6,9} 在纸上按位算一遍：110 ^ 110 = 000，000 ^ 1001 = 1001。",
    ],
    hintsEn: [
      "The accumulator returns, now with ^ and identity 0: `int acc = 0; for (int i = 0; i < n; i++) acc ^= a[i]; return acc;`.",
      'Why does cancellation ignore order? Commutativity and associativity let you "move equal numbers together": a^b^a == a^a^b == 0^b == b.',
      "Walk {6,6,9} bitwise on paper first: 110 ^ 110 = 000, then 000 ^ 1001 = 1001.",
    ],
    solution: `int single_number(const int a[], int n)
{
    int acc = 0;
    for (int i = 0; i < n; i++)
        acc ^= a[i];
    return acc;
}`,
    solutionNote:
      '第三次遇见"累计变量 + 单位元"：加法从 0 起（w-08）、乘法从 1 起（w-10）、异或从 0 起——一套抽象三次实例化，这个模式在数学里叫幺半群（monoid），不必记名字但要认得形状。XOR 的抵消律不是杂技：它是校验和、RAID 奇偶盘、加密流的工作原理，也是 amdgpu 寄存器翻转位的日常工具。从这里走向 c-04（掩码 set/clear/test），位操作轨道正式开张。',
    solutionNoteEn:
      "Third encounter with accumulator-plus-identity: addition from 0 (w-08), multiplication from 1 (w-10), XOR from 0 — one abstraction, three instantiations; mathematics calls the pattern a monoid, and while the name is optional, the shape is not. XOR’s cancellation is no circus trick: it powers checksums, RAID parity and cipher streams, and it is amdgpu’s everyday tool for flipping register bits. From here, c-04 (mask set/clear/test) opens the bit-ops lineage properly.",
  },
  {
    id: "w-31",
    track: "c0",
    number: 31,
    title: "大数加一",
    titleEn: "Plus One",
    difficulty: "warmup",
    minutes: 15,
    tags: ["进位传播", "容量契约"],
    tagsEn: ["carry-propagation", "capacity-contract"],
    lessonId: "cc-c0-4",
    warmupStage: "practice",
    brief:
      "综合练习：按位存储的大数加 1——进位一路向前，容量不够要拒绝且不留痕。",
    briefEn:
      "Practice: add 1 to a digit-array big number — the carry marches forward, and insufficient capacity must refuse without a trace.",
    description: [
      "一个大数按十进制位存在数组里，**高位在前**：`{1,2,9}` 表示 129。实现 `int plus_one(int digits[], int n, int capacity)`：把这个数加 1，结果仍从 `digits[0]` 开始存放，返回结果的位数。保证 `n >= 1`、`capacity >= n`、每位是 0..9、无前导零（除了数 0 本身表示为 {0}）。",
      "进位是唯一的算法点：末位 +1，逢 10 归 0 并向前进位。多数情况位数不变（129 → 130）；全 9 时位数加一（99 → 100），需要数组里**多一个格子**。",
      '容量契约：位数要变长而 `capacity < n + 1` 时，返回 **-1** 且**整个数组保持原样**——"失败不留痕"（w-23/c-15 的纪律，这次在纯逻辑里练）。判题会同时验证成功的全 9 扩位和失败的原样保持。',
    ],
    descriptionEn: [
      "A big number lives in an array of decimal digits, **most significant first**: `{1,2,9}` means 129. Implement `int plus_one(int digits[], int n, int capacity)`: add 1, store the result starting at `digits[0]` again, return the result’s digit count. Guaranteed `n >= 1`, `capacity >= n`, each digit 0..9, no leading zeroes (except the number 0 itself as {0}).",
      "The carry is the sole algorithmic point: add 1 at the last digit; a 10 becomes 0 and carries forward. Usually the length is unchanged (129 → 130); all-nines grow by one digit (99 → 100), needing **one extra slot** in the array.",
      "The capacity contract: when the number must grow but `capacity < n + 1`, return **-1** with **the entire array unchanged** — failure leaves no trace (the w-23/c-15 discipline, drilled here in pure logic). The judge verifies both the successful all-nines growth and the untouched-on-failure case.",
    ],
    language: "c",
    starterCode: `/* 高位在前的十进制大数加 1; 返回新位数。
 * 需要扩位但 capacity < n+1 时: 返回 -1 且数组原样。 */
int plus_one(int digits[], int n, int capacity)
{
    (void)digits; (void)n; (void)capacity;
    return -1; /* TODO: 先想清楚什么时候才需要扩位 */
}`,
    starterCodeEn: `/* Add 1 to a most-significant-first decimal number; return the new digit count.
 * If growth is needed but capacity < n+1: return -1 with the array untouched. */
int plus_one(int digits[], int n, int capacity)
{
    (void)digits; (void)n; (void)capacity;
    return -1; /* TODO: first pin down exactly when growth is needed */
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

#define CAN 0x5EED

int main(void)
{
    /* every digits buffer sits between canary cells: front guard at [0],
       back guard right after the declared capacity */
    int a[10] = { CAN, 1, 2, 9, CAN, CAN, CAN, CAN, CAN, CAN };
    int ra = plus_one(a + 1, 3, 8);
    check("129 + 1 = 130", ra == 3 && a[1] == 1 && a[2] == 3 && a[3] == 0);
    check("129 guards intact", a[0] == CAN && a[9] == CAN);

    int b[10] = { CAN, 2, 4, 6, CAN, CAN, CAN, CAN, CAN, CAN };
    int rb = plus_one(b + 1, 3, 8);
    check("no carry at all", rb == 3 && b[1] == 2 && b[2] == 4 && b[3] == 7);

    int c[10] = { CAN, 9, 9, CAN, CAN, CAN, CAN, CAN, CAN, CAN };
    int rc = plus_one(c + 1, 2, 8);
    check("99 + 1 = 100 (grows)", rc == 3 && c[1] == 1 && c[2] == 0 && c[3] == 0);
    check("growth stays inside capacity guards", c[0] == CAN && c[9] == CAN);

    int d[4] = { CAN, 0, CAN, CAN };
    int rd = plus_one(d + 1, 1, 1);
    check("0 + 1 = 1", rd == 1 && d[1] == 1);
    check("tight capacity guards intact", d[0] == CAN && d[2] == CAN);

    int e[5] = { CAN, 9, CAN, CAN, CAN };
    /* capacity 2: room to grow 9 -> 10 */
    e[2] = 0;
    int re = plus_one(e + 1, 1, 2);
    check("9 + 1 = 10", re == 2 && e[1] == 1 && e[2] == 0);
    check("9->10 back guard intact", e[0] == CAN && e[3] == CAN);

    /* capacity exactly n: growth impossible, array must stay intact */
    int f[5] = { CAN, 9, 9, 9, CAN };
    int rf = plus_one(f + 1, 3, 3);
    check("all nines, no room -> -1", rf == -1);
    check("array untouched on failure", f[1] == 9 && f[2] == 9 && f[3] == 9);
    check("failure guards intact", f[0] == CAN && f[4] == CAN);

    /* capacity n+1: the same number grows fine */
    int g[6] = { CAN, 9, 9, 9, 0, CAN };
    int rg = plus_one(g + 1, 3, 4);
    check("all nines with room -> 1000", rg == 4 && g[1] == 1 && g[2] == 0 && g[3] == 0 && g[4] == 0);
    check("growth guards intact", g[0] == CAN && g[5] == CAN);

    int h[10] = { CAN, 3, 9, 9, CAN, CAN, CAN, CAN, CAN, CAN };
    int rh = plus_one(h + 1, 3, 8);
    check("carry stops mid-way", rh == 3 && h[1] == 4 && h[2] == 0 && h[3] == 0);

    printf("RESULT %d/%d\\n", _pass, _total);
    return _pass == _total ? 0 : 1;
}`,
    hints: [
      '什么时候才需要扩位？当且仅当**所有位都是 9**。先写一个检查循环回答这个问题，容量不够就立刻 return -1——此时一个字节都还没改，"原样"自动成立。',
      "主循环从末位往前：`for (int i = n - 1; i >= 0; i--) { if (digits[i] < 9) { digits[i]++; return n; } digits[i] = 0; }`——遇到非 9 就加一收工，遇到 9 就归零继续。",
      "扩位分支（全 9 且容量够）：走完主循环后所有位已归零，此时 digits[0] = 1、把 1..n 位补 0（其实已是 0）、返回 n + 1。更直接的写法：先右移再置 1，两种都对。",
    ],
    hintsEn: [
      'When exactly is growth needed? If and only if **every digit is 9**. Answer that with a checking loop first, and return -1 immediately when capacity falls short — nothing has been modified yet, so "untouched" holds automatically.',
      "The main loop walks from the last digit forward: `for (int i = n - 1; i >= 0; i--) { if (digits[i] < 9) { digits[i]++; return n; } digits[i] = 0; }` — a non-9 gets incremented and you are done; a 9 zeroes and continues.",
      "The growth branch (all nines with room): after the main loop every digit is zero; set digits[0] = 1, ensure 1..n are 0 (they already are), return n + 1. A shift-right-then-set approach works equally well.",
    ],
    solution: `#include <stdbool.h>

int plus_one(int digits[], int n, int capacity)
{
    bool all_nines = true;
    for (int i = 0; i < n; i++) {
        if (digits[i] != 9) {
            all_nines = false;
            break;
        }
    }
    if (all_nines && capacity < n + 1)
        return -1;

    for (int i = n - 1; i >= 0; i--) {
        if (digits[i] < 9) {
            digits[i]++;
            return n;
        }
        digits[i] = 0;
    }

    /* all nines, room confirmed: 99..9 + 1 = 100..0 */
    digits[0] = 1;
    for (int i = 1; i <= n; i++)
        digits[i] = 0;
    return n + 1;
}`,
    solutionNote:
      "结构里藏着一条重要纪律：**先判定、后动手**。“需要扩位吗”在改动任何字节之前就能回答（全 9 检查），于是失败路径天然零副作用——对比先加后悔的写法，回滚代码整个消失了。这与 w-23/c-15 的 realloc 临时指针、c-16 的先检查后分配是同一族思想：让失败发生在副作用之前。进位传播本身则是 k-09/c-11 逐字节思维的十进制近亲——那边按位打包，这边按位计算。",
    solutionNoteEn:
      'A vital discipline hides in the structure: **decide first, mutate after**. "Will it grow?" is answerable before touching any byte (the all-nines check), so the failure path has zero side effects by construction — compared with an add-then-regret version, the rollback code simply vanishes. This belongs to the same family as w-23/c-15’s realloc temporary and c-16’s check-before-allocate: let failures happen before side effects. Carry propagation itself is the decimal cousin of k-09/c-11’s byte-at-a-time thinking — packing bits there, computing digits here.',
  },
  {
    id: "w-32",
    track: "c0",
    number: 32,
    title: "一页匿名内存",
    titleEn: "One Anonymous Page",
    difficulty: "warmup",
    minutes: 15,
    tags: ["mmap", "页", "资源配平"],
    tagsEn: ["mmap", "pages", "resource-balance"],
    lessonId: "cc-c0-7",
    warmupStage: "posix",
    nextSteps: [{ kind: "lesson", moduleId: "4", lessonId: "4-2-1" }],
    brief: "查询真实页长，匿名映射一页、写满并校验，最后用 munmap 完整归还。",
    briefEn:
      "Query the real page size, map one anonymous page, fill and verify it, then return it with munmap.",
    description: [
      "实现 `int page_roundtrip(void)`。先用 `sysconf(_SC_PAGESIZE)` 查询当前系统的页大小：返回值类型是 long，只有 `raw > 0` 才能转成 size_t 使用，不能把 4096 硬编码成“一页”。",
      "用 `mmap(NULL, page, PROT_READ | PROT_WRITE, MAP_PRIVATE | MAP_ANONYMOUS, -1, 0)` 建立一页私有匿名映射。mmap 失败返回 **MAP_FAILED**（不是 NULL）；成功后把整页每个字节写成 `0xAB`，再逐字节确认写入结果。",
      "最后调用 `munmap(p, page)` 归还映射。查询、映射、校验或解除映射任一步失败都返回 -1；完整往返成功才返回 0。判题器会连续调用两次、核对 map/unmap 配平与整页图案，并注入一次 MAP_FAILED；匿名映射是普通虚拟内存，不是 GPU 的 PCI BAR/MMIO。",
    ],
    descriptionEn: [
      "Implement `int page_roundtrip(void)`. First query this system’s page size with `sysconf(_SC_PAGESIZE)`: its return type is long, and only a value with `raw > 0` may be converted to size_t. Never hardcode 4096 and call it “one page”.",
      "Create one private anonymous mapping with `mmap(NULL, page, PROT_READ | PROT_WRITE, MAP_PRIVATE | MAP_ANONYMOUS, -1, 0)`. mmap fails with **MAP_FAILED** (not NULL); on success, write `0xAB` into every byte of the page, then verify every byte.",
      "Finally return the mapping with `munmap(p, page)`. Return -1 if the query, mapping, verification or unmapping fails; return 0 only after the full round trip. The judge calls twice, audits map/unmap balance and the whole-page pattern, then injects one MAP_FAILED. Anonymous memory is ordinary virtual memory, not a GPU PCI BAR/MMIO mapping.",
    ],
    language: "c",
    starterCode: `/* 查询页长 -> 匿名映射一页 -> 写满并校验 0xAB -> munmap。
 * 任一步失败返回 -1，完整成功返回 0。 */
int page_roundtrip(void)
{
    return -1; /* TODO: 完成一次完整的页往返 */
}`,
    starterCodeEn: `/* Query page size -> map one anonymous page -> fill/verify 0xAB -> munmap.
 * Return -1 on any failure, 0 only after full success. */
int page_roundtrip(void)
{
    return -1; /* TODO: complete one full page round trip */
}`,
    harness: `#define _DEFAULT_SOURCE
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

static void *tracked_mmap(void *addr, size_t len, int prot, int flags,
                          int fd, off_t off)
{
    if (!g_expected_page || len != g_expected_page)
        g_map_len_ok = 0;
    if (g_fail_next) { g_fail_next = 0; return MAP_FAILED; }
    void *p = mmap(addr, len, prot, flags, fd, off);
    if (p != MAP_FAILED) {
        g_maps++;
        g_outstanding++;
        g_last_len = len;
    }
    return p;
}

static int tracked_munmap(void *p, size_t len)
{
    /* Audit only the recorded live extent. If the learner passes a wrong
       length, clean up safely with the recorded length and report failure. */
    if (!p || p == MAP_FAILED || !g_last_len) {
        g_unmap_len_ok = 0;
        return -1;
    }
    int contract_ok = len == g_last_len;
    if (!contract_ok) g_unmap_len_ok = 0;
    const unsigned char *b = p;
    for (size_t i = 0; i < g_last_len; i++) {
        if (b[i] != 0xAB) { g_pattern_ok = 0; break; }
    }
    int r = munmap(p, g_last_len);
    if (r == 0) {
        g_unmaps++;
        g_outstanding--;
        g_last_len = 0;
    }
    return contract_ok ? r : -1;
}

#define sysconf(n) tracked_sysconf(n)
#define mmap(a, l, p, f, fd, o) tracked_mmap((a), (l), (p), (f), (fd), (o))
#define munmap(p, l) tracked_munmap((p), (l))

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
    check("first roundtrip returns 0", page_roundtrip() == 0);
    check("second roundtrip is reusable", page_roundtrip() == 0);
    check("mmap used the queried page length", g_map_len_ok == 1);
    check("map/unmap balanced", g_maps == 2 && g_unmaps == 2 && g_outstanding == 0);
    check("munmap saw the full 0xAB pattern", g_pattern_ok == 1);
    check("munmap length matched mmap length", g_unmap_len_ok == 1);

    g_fail_next = 1;
    check("injected MAP_FAILED handled", page_roundtrip() == -1);
    check("injected failure leaked nothing", g_outstanding == 0);
    check("every call queried _SC_PAGESIZE", g_query_ok == 1 && g_sysconf_calls == 3);

    printf("RESULT %d/%d\\n", _pass, _total);
    return _pass == _total ? 0 : 1;
}`,
    hints: [
      "骨架顺序：查 `long raw` 并判 `raw > 0`；转成 `size_t page`；mmap；判 `p == MAP_FAILED`；写满；校验；munmap。不要把最后一步藏在成功路径之外。",
      "逐字节访问最直接：把返回值接成 `unsigned char *p`，两个 `for (size_t i = 0; i < page; i++)` 分别负责写入与校验。",
      "mmap 与 malloc 的失败哨兵不同：必须比较 MAP_FAILED。成功映射对应一次 munmap，就像成功 malloc 对应一次 free。",
    ],
    hintsEn: [
      "Skeleton order: query long raw and require raw > 0; convert to size_t page; mmap; test p == MAP_FAILED; fill; verify; munmap. Do not leave the final step outside the success path.",
      "Byte-wise access is simplest: receive the mapping as `unsigned char *p`, then use two `for (size_t i = 0; i < page; i++)` loops for filling and verification.",
      "mmap and malloc use different failure sentinels: compare with MAP_FAILED. One successful mapping needs one munmap, just as one successful malloc needs one free.",
    ],
    solution: `int page_roundtrip(void)
{
    long raw = sysconf(_SC_PAGESIZE);
    if (raw <= 0)
        return -1;
    size_t page = (size_t)raw;

    unsigned char *p = mmap(NULL, page, PROT_READ | PROT_WRITE,
                            MAP_PRIVATE | MAP_ANONYMOUS, -1, 0);
    if (p == MAP_FAILED)
        return -1;

    for (size_t i = 0; i < page; i++)
        p[i] = 0xAB;
    for (size_t i = 0; i < page; i++) {
        if (p[i] != 0xAB) {
            munmap(p, page);
            return -1;
        }
    }

    return munmap(p, page) == 0 ? 0 : -1;
}`,
    solutionNote:
      "这是第一次完整走系统层资源生命周期：查询运行时事实，而非猜页长；用 MAP_FAILED 识别映射失败；只有成功映射才拥有需要归还的资源；在资源仍有效时完成验证；最后用同一地址与长度 munmap。判题器在真实解除映射之前检查整页，因此“只写第一个字节”、长度不一致和漏 munmap 都无处藏。这里建立的是普通匿名虚拟内存；模块 4 的 GEM/TTM 会沿用 mmap 的接口形状，把背后的对象换成 GPU buffer object。",
    solutionNoteEn:
      "This is your first complete system-layer resource lifetime: query a runtime fact instead of guessing the page size; recognize mapping failure with MAP_FAILED; own a resource only after a successful mapping; verify while it is still live; then munmap with the matching address and length. The judge inspects the whole page before the real unmap, so writing one byte, mismatched lengths and leaked mappings have nowhere to hide. This is ordinary anonymous virtual memory; Module 4’s GEM/TTM keeps mmap’s interface shape while putting a GPU buffer object behind it.",
  },
];
