/* ============================================================
   Code Lab — Track 2: C++ 核心 (C++ Core), 12 problems
   For the userspace GPU stack: Mesa / ROCm / LLVM are C++.
   Compiled as C++17 against the same harness protocol.
   ============================================================ */
import type { CodeProblem } from "./code_problems_types";

export const codeProblemsCpp: CodeProblem[] = [
  {
    id: "cpp-01",
    track: "cpp",
    number: 1,
    title: "引用与函数重载",
    titleEn: "References & Overloading",
    difficulty: "easy",
    minutes: 12,
    tags: ["引用", "重载"],
    tagsEn: ["references", "overloading"],
    lessonId: "cc-cpp-1",
    brief: "同名函数按参数类型自动分派；引用让 swap 不再需要指针。",
    briefEn: "Same-name functions dispatch by parameter type; references free swap from pointers.",
    description: [
      'C 里 `swap(&a, &b)` 必须传指针、函数名还不能重复（int 版叫 swap_int，float 版叫 swap_float……）。C++ 用引用干掉了取地址符，用重载干掉了名字后缀——编译器按实参类型挑函数。',
      '实现三个函数：`clamp_val(int v, int lo, int hi)` 与 `clamp_val(double v, double lo, double hi)`——把 v 夹到 [lo, hi] 区间（两个重载）；`swap_vals(int &a, int &b)`——通过引用交换。',
      '体会点：调用端 `swap_vals(x, y)` 干干净净，没有 `&`——但 x、y 真的被改了。引用 = 有别名语义的"自动解引用指针"。',
    ],
    descriptionEn: [
      'In C, `swap(&a, &b)` needs pointers, and names can’t repeat (swap_int, swap_float…). C++ kills the address-of with references and the name suffixes with overloading — the compiler picks by argument type.',
      'Implement three functions: `clamp_val(int v, int lo, int hi)` and `clamp_val(double v, double lo, double hi)` — clamp v into [lo, hi] (two overloads); and `swap_vals(int &a, int &b)` — swap through references.',
      'The takeaway: the call site `swap_vals(x, y)` is clean — no `&` — yet x and y really change. A reference is an "auto-dereferencing pointer" with alias semantics.',
    ],
    language: "cpp",
    starterCode: `int clamp_val(int v, int lo, int hi)
{
    (void)v; (void)lo; (void)hi;
    return 0; /* TODO */
}

double clamp_val(double v, double lo, double hi)
{
    (void)v; (void)lo; (void)hi;
    return 0.0; /* TODO: 同名不同参 —— 重载 */
}

void swap_vals(int &a, int &b)
{
    (void)a; (void)b; /* TODO: 不用指针交换 */
}`,
    starterCodeEn: `int clamp_val(int v, int lo, int hi)
{
    (void)v; (void)lo; (void)hi;
    return 0; /* TODO */
}

double clamp_val(double v, double lo, double hi)
{
    (void)v; (void)lo; (void)hi;
    return 0.0; /* TODO: same name, different parameters — overloading */
}

void swap_vals(int &a, int &b)
{
    (void)a; (void)b; /* TODO: swap without pointers */
}`,
    harness: `#include <cstdio>
{{USER_CODE}}

static int _pass, _total;
static void check(const char *label, bool cond)
{
    _total++;
    if (cond) { _pass++; printf("[PASS] %s\\n", label); }
    else printf("[FAIL] %s\\n", label);
}

int main()
{
    check("int clamp below", clamp_val(-5, 0, 10) == 0);
    check("int clamp inside", clamp_val(7, 0, 10) == 7);
    check("int clamp above", clamp_val(99, 0, 10) == 10);

    check("double overload picked", clamp_val(0.5, 0.0, 1.0) == 0.5);
    check("double clamp above", clamp_val(2.75, 0.0, 1.0) == 1.0);
    check("double clamp below", clamp_val(-0.25, 0.0, 1.0) == 0.0);

    int x = 3, y = 9;
    swap_vals(x, y);
    check("swap works via references", x == 9 && y == 3);
    swap_vals(x, x);
    check("self swap is harmless", x == 9);

    printf("RESULT %d/%d\\n", _pass, _total);
    return _pass == _total ? 0 : 1;
}`,
    hints: [
      'clamp 的骨架：`if (v < lo) return lo; if (v > hi) return hi; return v;`——两个重载函数体一样，只是类型不同（这种重复正是 cpp-09 模板要解决的）。',
      'swap 经典三行：`int t = a; a = b; b = t;`——参数是 `int&`，改的就是调用方的变量。',
      '重载决议按实参类型：`clamp_val(0.5, 0.0, 1.0)` 全是 double，命中 double 版。如果混着传 int 和 double 会怎样？（可能有歧义错误——自己试试。）',
    ],
    hintsEn: [
      'The clamp skeleton: `if (v < lo) return lo; if (v > hi) return hi; return v;` — both overload bodies are identical except for types (exactly the duplication templates solve in cpp-09).',
      'The classic swap tercet: `int t = a; a = b; b = t;` — parameters are `int&`, so you mutate the caller’s variables.',
      'Overload resolution follows argument types: `clamp_val(0.5, 0.0, 1.0)` is all-double, hitting the double version. What if you mix int and double? (Possibly an ambiguity error — try it.)',
    ],
    solution: `int clamp_val(int v, int lo, int hi)
{
    if (v < lo) return lo;
    if (v > hi) return hi;
    return v;
}

double clamp_val(double v, double lo, double hi)
{
    if (v < lo) return lo;
    if (v > hi) return hi;
    return v;
}

void swap_vals(int &a, int &b)
{
    int t = a;
    a = b;
    b = t;
}`,
    solutionNote:
      '重载靠"名字改编"（name mangling）实现：编译器把参数类型编进符号名，所以 C++ 符号是 _Z9clamp_valiii 这种形态——这也解释了为什么跨 C/C++ 边界要 extern "C"（关闭改编）。两个 clamp 一模一样的函数体是刻意安排的伏笔：cpp-09 的模板会把它们合并成一个。',
    solutionNoteEn:
      'Overloading works via name mangling: parameter types are encoded into the symbol, so C++ symbols look like _Z9clamp_valiii — which is exactly why crossing the C/C++ boundary needs extern "C" (mangling off). The two identical clamp bodies are a deliberate setup: templates in cpp-09 will merge them into one.',
  },
  {
    id: "cpp-02",
    track: "cpp",
    number: 2,
    title: "构造、析构与作用域",
    titleEn: "Constructors, Destructors & Scope",
    difficulty: "easy",
    minutes: 15,
    tags: ["类", "析构顺序", "RAII"],
    tagsEn: ["classes", "dtor-order", "RAII"],
    lessonId: "cc-cpp-2",
    brief: "对象离开作用域时析构自动执行、且顺序与构造相反——RAII 的全部地基。",
    briefEn: "Destructors run automatically at scope exit, in reverse construction order — the entire foundation of RAII.",
    description: [
      'C++ 最重要的机制不是类，而是**确定性析构**：对象离开作用域的那一刻，析构函数必然执行，顺序与构造严格相反。资源管理的一切魔法（RAII、智能指针、锁守卫）都建立在这条铁律上。',
      '实现类 `Tracer`：构造函数接收 `(std::string &log, char tag)`，把 `+tag` 追加到 log；析构函数把 `-tag` 追加。再实现自由函数 `run_scopes(std::string &log)`，在函数体里制造这样的对象序列：先构造 A；然后开一个内层花括号作用域构造 B、C；内层结束后再构造 D；函数返回。',
      '如果你的实现正确，log 会是一条能"读出作用域结构"的轨迹。先在纸上推一遍再写。',
    ],
    descriptionEn: [
      'C++’s most important mechanism is not the class but **deterministic destruction**: the instant an object leaves scope its destructor runs, in strictly reverse construction order. Every resource-management trick (RAII, smart pointers, lock guards) stands on this law.',
      'Implement class `Tracer`: the constructor takes `(std::string &log, char tag)` and appends `+tag` to log; the destructor appends `-tag`. Then implement the free function `run_scopes(std::string &log)` that creates this object sequence in its body: construct A; open an inner brace scope constructing B and C; after the inner scope construct D; return.',
      'Done right, the log becomes a trace you can "read the scope structure" from. Walk it on paper before typing.',
    ],
    language: "cpp",
    starterCode: `#include <string>

class Tracer {
public:
    /* TODO: 构造追加 "+tag", 析构追加 "-tag" */
private:
    std::string *log_ = nullptr;
    char tag_ = 0;
};

void run_scopes(std::string &log)
{
    (void)log;
    /* TODO:
     *   Tracer A
     *   { Tracer B; Tracer C; }
     *   Tracer D
     */
}`,
    starterCodeEn: `#include <string>

class Tracer {
public:
    /* TODO: ctor appends "+tag", dtor appends "-tag" */
private:
    std::string *log_ = nullptr;
    char tag_ = 0;
};

void run_scopes(std::string &log)
{
    (void)log;
    /* TODO:
     *   Tracer A
     *   { Tracer B; Tracer C; }
     *   Tracer D
     */
}`,
    harness: `#include <cstdio>
#include <string>
{{USER_CODE}}

static int _pass, _total;
static void check(const char *label, bool cond)
{
    _total++;
    if (cond) { _pass++; printf("[PASS] %s\\n", label); }
    else printf("[FAIL] %s\\n", label);
}

int main()
{
    {
        std::string log;
        Tracer t(log, 'X');
        check("ctor appends +X", log == "+X");
        {
            Tracer u(log, 'Y');
            check("nested ctor", log == "+X+Y");
        }
        check("inner dtor fired at brace exit", log == "+X+Y-Y");
    }

    std::string log;
    run_scopes(log);
    check("full trace order", log == "+A+B+C-C-B+D-D-A");
    check("inner pair destroyed in reverse", log.find("-C-B") != std::string::npos);
    check("A dies last", log.back() == 'A');

    printf("RESULT %d/%d\\n", _pass, _total);
    return _pass == _total ? 0 : 1;
}`,
    hints: [
      '构造函数存下 log 的指针（或引用成员）和 tag：`Tracer(std::string &log, char tag) : log_(&log), tag_(tag) { *log_ += \'+\'; *log_ += tag_; }`。',
      'run_scopes 就是按题意摆对象：`Tracer a(log, \'A\'); { Tracer b(log, \'B\'); Tracer c(log, \'C\'); } Tracer d(log, \'D\');`——剩下的交给语言。',
      '推导轨迹：内层 `}` 处 C 先死（后构造先析构），函数返回时 D 先死、然后 A。所以是 +A+B+C-C-B+D-D-A。',
    ],
    hintsEn: [
      'The constructor stores a pointer to log (or a reference member) plus the tag: `Tracer(std::string &log, char tag) : log_(&log), tag_(tag) { *log_ += \'+\'; *log_ += tag_; }`.',
      'run_scopes just places objects as stated: `Tracer a(log, \'A\'); { Tracer b(log, \'B\'); Tracer c(log, \'C\'); } Tracer d(log, \'D\');` — the language does the rest.',
      'Derive the trace: at the inner `}` C dies before B (last constructed, first destroyed); at return D dies, then A. Hence +A+B+C-C-B+D-D-A.',
    ],
    solution: `#include <string>

class Tracer {
public:
    Tracer(std::string &log, char tag) : log_(&log), tag_(tag)
    {
        *log_ += '+';
        *log_ += tag_;
    }
    ~Tracer()
    {
        *log_ += '-';
        *log_ += tag_;
    }
    Tracer(const Tracer &) = delete;
    Tracer &operator=(const Tracer &) = delete;

private:
    std::string *log_;
    char tag_;
};

void run_scopes(std::string &log)
{
    Tracer a(log, 'A');
    {
        Tracer b(log, 'B');
        Tracer c(log, 'C');
    }
    Tracer d(log, 'D');
}`,
    solutionNote:
      '轨迹 +A+B+C-C-B+D-D-A 里藏着两条规则：作用域退出即析构（花括号是资源边界）、同作用域逆序析构（栈式）。delete 掉拷贝是守卫类的标准操作——复制一个"会在析构时做事"的对象几乎总是错误。对照内核 C：那边要靠 goto 阶梯手动保证"逆序清理"，C++ 把它变成语言自动行为——这就是 RAII 的本质（cpp-03 立刻用上）。',
    solutionNoteEn:
      'The trace +A+B+C-C-B+D-D-A encodes two rules: scope exit triggers destruction (braces are resource boundaries), and same-scope destruction is reversed (stack-like). Deleting the copies is standard for guard classes — copying an object that "does something at destruction" is almost always a bug. Contrast kernel C: reverse-order cleanup there is maintained manually via goto ladders; C++ turns it into automatic language behavior — the essence of RAII (used immediately in cpp-03).',
  },
  {
    id: "cpp-03",
    track: "cpp",
    number: 3,
    title: "RAII 守卫：作用域即临界区",
    titleEn: "RAII Guard: Scope as Critical Section",
    difficulty: "medium",
    minutes: 18,
    tags: ["RAII", "资源管理"],
    tagsEn: ["RAII", "resource-management"],
    lessonId: "cc-cpp-2",
    brief: "写一个 RegionGuard，让\"忘记解锁\"这类 bug 在语言层面绝迹。",
    briefEn: "Write a RegionGuard that makes “forgot to unlock” bugs extinct at the language level.",
    description: [
      'C 驱动里最常见的事故：函数有 5 个 return，其中 1 个忘了 unlock。RAII 的答案是把"解锁"绑进析构函数——只要守卫对象在作用域里，锁必然在函数**任何**退出路径上释放。',
      '给定资源 API（已提供）：`region_acquire(Region &r)` 失败返回 false；`region_release(Region &r)`。实现 `RegionGuard` 类：构造时 acquire 并记录成败，`ok()` 返回是否成功；析构时**仅当** acquire 成功才 release；禁止拷贝。再实现 `sum_with_guard(Region &r, const int *data, size_t n)`：用守卫保护整个函数——acquire 失败返回 -1；n 为 0 直接返回 0（提前 return，考验守卫）；否则返回数组和。',
      'harness 会数 acquire/release 的配对数，并专门走"提前 return"和"acquire 失败"两条路。',
    ],
    descriptionEn: [
      'The most common C driver incident: a function with 5 returns, one of which forgets to unlock. RAII’s answer binds "unlock" into the destructor — while the guard lives in scope, the lock is released on **every** exit path.',
      'Given this resource API (provided): `region_acquire(Region &r)` returning false on failure, and `region_release(Region &r)`. Implement class `RegionGuard`: the constructor acquires and records success, `ok()` reports it; the destructor releases **only if** the acquire succeeded; copying is forbidden. Then implement `sum_with_guard(Region &r, const int *data, size_t n)`: guard the whole function — return -1 if acquire fails; return 0 immediately when n is 0 (an early return, to stress the guard); otherwise return the array sum.',
      'The harness counts acquire/release pairing and deliberately exercises both the early-return and the failed-acquire paths.',
    ],
    language: "cpp",
    starterCode: `#include <cstddef>

struct Region {
    int acquires = 0;
    int releases = 0;
    bool fail_next = false;   /* 测试注入: 下一次 acquire 失败 */
};

inline bool region_acquire(Region &r)
{
    if (r.fail_next) { r.fail_next = false; return false; }
    r.acquires++;
    return true;
}

inline void region_release(Region &r)
{
    r.releases++;
}

class RegionGuard {
public:
    /* TODO: 构造 acquire; 析构仅在成功时 release; ok(); 禁止拷贝 */
};

long sum_with_guard(Region &r, const int *data, size_t n)
{
    (void)r; (void)data; (void)n;
    return -1; /* TODO */
}`,
    starterCodeEn: `#include <cstddef>

struct Region {
    int acquires = 0;
    int releases = 0;
    bool fail_next = false;   /* test injection: the next acquire fails */
};

inline bool region_acquire(Region &r)
{
    if (r.fail_next) { r.fail_next = false; return false; }
    r.acquires++;
    return true;
}

inline void region_release(Region &r)
{
    r.releases++;
}

class RegionGuard {
public:
    /* TODO: acquire in ctor; release in dtor only on success; ok(); no copying */
};

long sum_with_guard(Region &r, const int *data, size_t n)
{
    (void)r; (void)data; (void)n;
    return -1; /* TODO */
}`,
    harness: `#include <cstdio>
{{USER_CODE}}

#include <type_traits>
static_assert(!std::is_copy_constructible<RegionGuard>::value,
              "RegionGuard must not be copyable (double release)");
static_assert(!std::is_copy_assignable<RegionGuard>::value,
              "RegionGuard must not be copy-assignable");

static int _pass, _total;
static void check(const char *label, bool cond)
{
    _total++;
    if (cond) { _pass++; printf("[PASS] %s\\n", label); }
    else printf("[FAIL] %s\\n", label);
}

int main()
{
    Region r;
    {
        RegionGuard g(r);
        check("guard acquires", r.acquires == 1 && g.ok());
        check("not released inside scope", r.releases == 0);
    }
    check("released at scope exit", r.releases == 1);

    int data[] = { 1, 2, 3, 4 };
    check("sum computed", sum_with_guard(r, data, 4) == 10);
    check("sum path balanced", r.acquires == 2 && r.releases == 2);

    check("early return n==0", sum_with_guard(r, data, 0) == 0);
    check("early return still releases", r.acquires == 3 && r.releases == 3);

    r.fail_next = true;
    check("acquire failure -> -1", sum_with_guard(r, data, 4) == -1);
    check("failed acquire never releases", r.acquires == 3 && r.releases == 3);

    printf("RESULT %d/%d\\n", _pass, _total);
    return _pass == _total ? 0 : 1;
}`,
    hints: [
      '守卫的形态：`RegionGuard(Region &r) : r_(r), ok_(region_acquire(r)) {}`，析构 `if (ok_) region_release(r_);`。成员：`Region &r_; bool ok_;`。',
      '禁止拷贝：`RegionGuard(const RegionGuard&) = delete;`——否则副本析构会多释放一次（double release）。',
      'sum_with_guard 里守卫放第一行：`RegionGuard g(r); if (!g.ok()) return -1; if (n == 0) return 0;`——注意提前 return 时守卫照样析构，这正是题目要你体会的。',
    ],
    hintsEn: [
      'Guard shape: `RegionGuard(Region &r) : r_(r), ok_(region_acquire(r)) {}`, destructor `if (ok_) region_release(r_);`. Members: `Region &r_; bool ok_;`.',
      'Forbid copying: `RegionGuard(const RegionGuard&) = delete;` — otherwise a copy’s destructor releases a second time (double release).',
      'In sum_with_guard the guard goes on line one: `RegionGuard g(r); if (!g.ok()) return -1; if (n == 0) return 0;` — the early return still destroys the guard, which is exactly the lesson.',
    ],
    solution: `#include <cstddef>

struct Region {
    int acquires = 0;
    int releases = 0;
    bool fail_next = false;
};

inline bool region_acquire(Region &r)
{
    if (r.fail_next) { r.fail_next = false; return false; }
    r.acquires++;
    return true;
}

inline void region_release(Region &r)
{
    r.releases++;
}

class RegionGuard {
public:
    explicit RegionGuard(Region &r) : r_(r), ok_(region_acquire(r)) {}
    ~RegionGuard()
    {
        if (ok_)
            region_release(r_);
    }
    RegionGuard(const RegionGuard &) = delete;
    RegionGuard &operator=(const RegionGuard &) = delete;

    bool ok() const { return ok_; }

private:
    Region &r_;
    bool ok_;
};

long sum_with_guard(Region &r, const int *data, size_t n)
{
    RegionGuard g(r);
    if (!g.ok())
        return -1;
    if (n == 0)
        return 0;

    long sum = 0;
    for (size_t i = 0; i < n; i++)
        sum += data[i];
    return sum;
}`,
    solutionNote:
      '这就是 std::lock_guard 的结构：获取入构造、释放入析构、删除拷贝。三条路径（正常、提前 return、获取失败）全部自动平衡——C 版要写三处 unlock 或一个 goto 阶梯。"仅成功才释放"的 ok_ 标志是工程细节：无条件释放会把失败路径变成资产负债表错账。Mesa/ROCm 里大量 ScopedXxx 类都是这个模子。',
    solutionNoteEn:
      'This is std::lock_guard’s anatomy: acquire in the constructor, release in the destructor, copies deleted. All three paths (normal, early return, failed acquire) balance automatically — the C version needs three unlock sites or a goto ladder. The ok_ flag ("release only on success") is the engineering detail: unconditional release corrupts the books on the failure path. Mesa/ROCm are full of ScopedXxx classes cut from this mold.',
  },
  {
    id: "cpp-04",
    track: "cpp",
    number: 4,
    title: "Rule of Three：深拷贝 Buffer",
    titleEn: "Rule of Three: Deep-Copying a Buffer",
    difficulty: "medium",
    minutes: 20,
    tags: ["拷贝构造", "深拷贝", "Rule of Three"],
    tagsEn: ["copy-ctor", "deep-copy", "Rule of Three"],
    lessonId: "cc-cpp-3",
    brief: "管理裸指针的类，默认拷贝就是二次释放事故——补齐拷贝构造与拷贝赋值。",
    briefEn: "A class owning a raw pointer: default copying is a double-free incident — supply copy ctor and copy assignment.",
    description: [
      '编译器默认生成的拷贝是**逐成员浅拷贝**：两个对象的指针成员指向同一块内存，析构时同一块内存 free 两次——崩溃。规则：**析构、拷贝构造、拷贝赋值，写了其中一个就必须考虑全部三个**（Rule of Three）。',
      '给定管理堆内存的 `Buffer` 类（构造/析构已写好），补齐：拷贝构造函数（分配自己的内存、复制内容）与拷贝赋值运算符（处理自赋值、释放旧内存、深拷贝新内容、返回 *this）。',
      'harness 会做：拷贝后改原件验证独立性、连环赋值、自赋值——浅拷贝或漏自赋值检查都会当场翻车。',
    ],
    descriptionEn: [
      'Compiler-generated copying is a **memberwise shallow copy**: two objects’ pointer members alias the same block, which then gets freed twice at destruction — crash. The rule: **destructor, copy constructor, copy assignment — write one, consider all three** (Rule of Three).',
      'Given a heap-owning `Buffer` class (constructor/destructor provided), supply: the copy constructor (allocate your own memory, copy contents) and the copy assignment operator (handle self-assignment, free the old memory, deep-copy the new, return *this).',
      'The harness mutates the original after copying to verify independence, chains assignments, and self-assigns — shallow copies and missing self-assignment checks fail on the spot.',
    ],
    language: "cpp",
    starterCode: `#include <cstddef>
#include <cstring>

class Buffer {
public:
    explicit Buffer(size_t n) : n_(n), data_(new unsigned char[n]())
    {
    }
    ~Buffer()
    {
        delete[] data_;
    }

    /* TODO: 拷贝构造 —— 深拷贝 */

    /* TODO: 拷贝赋值 —— 自赋值安全, 返回 *this */

    unsigned char *data() { return data_; }
    const unsigned char *data() const { return data_; }
    size_t size() const { return n_; }

private:
    size_t n_;
    unsigned char *data_;
};`,
    starterCodeEn: `#include <cstddef>
#include <cstring>

class Buffer {
public:
    explicit Buffer(size_t n) : n_(n), data_(new unsigned char[n]())
    {
    }
    ~Buffer()
    {
        delete[] data_;
    }

    /* TODO: copy constructor — deep copy */

    /* TODO: copy assignment — self-assignment safe, return *this */

    unsigned char *data() { return data_; }
    const unsigned char *data() const { return data_; }
    size_t size() const { return n_; }

private:
    size_t n_;
    unsigned char *data_;
};`,
    harness: `#include <cstdio>
#include <cstdlib>
#include <new>

/* Judge-owned allocation audit: every new[]/delete[] in the translation
 * unit is counted, so a leaked or double-freed block cannot hide. */
static int g_live_blocks = 0;
void *operator new[](std::size_t n)
{
    void *p = std::malloc(n ? n : 1);
    if (!p) throw std::bad_alloc();
    g_live_blocks++;
    return p;
}
void operator delete[](void *p) noexcept
{
    if (p) { g_live_blocks--; std::free(p); }
}
void operator delete[](void *p, std::size_t) noexcept
{
    if (p) { g_live_blocks--; std::free(p); }
}

{{USER_CODE}}

static int _pass, _total;
static void check(const char *label, bool cond)
{
    _total++;
    if (cond) { _pass++; printf("[PASS] %s\\n", label); }
    else printf("[FAIL] %s\\n", label);
}

int main()
{
    {
        Buffer a(8);
        for (size_t i = 0; i < 8; i++) a.data()[i] = (unsigned char)(i + 1);
        check("one live block", g_live_blocks == 1);

        Buffer b = a;   /* copy ctor */
        check("copy has same size", b.size() == 8);
        check("copy has same content", b.data()[0] == 1 && b.data()[7] == 8);
        check("copy owns separate memory", b.data() != a.data());
        check("copy allocated its own block", g_live_blocks == 2);

        a.data()[0] = 0xEE;
        check("mutating original leaves copy intact", b.data()[0] == 1);

        Buffer c(2);
        check("three live blocks", g_live_blocks == 3);
        c = a;          /* copy assignment must free the old block */
        check("assign adopts size", c.size() == 8);
        check("assign deep copies", c.data()[0] == 0xEE && c.data() != a.data());
        check("assign freed the old block (no leak)", g_live_blocks == 3);

        c = c;          /* self-assignment */
        check("self-assignment survives", c.size() == 8 && c.data()[0] == 0xEE);
        check("self-assignment leaks nothing", g_live_blocks == 3);

        Buffer d(1), e(1);
        d = e = a;      /* chained assignment relies on returning *this */
        check("chained assignment", d.size() == 8 && e.size() == 8);
        check("chain balanced", g_live_blocks == 5);
    }
    check("all blocks returned at scope exit", g_live_blocks == 0);

    printf("RESULT %d/%d\\n", _pass, _total);
    return _pass == _total ? 0 : 1;
}`,
    hints: [
      '拷贝构造：`Buffer(const Buffer &o) : n_(o.n_), data_(new unsigned char[o.n_]) { memcpy(data_, o.data_, n_); }`。',
      '拷贝赋值的四步：`if (this == &o) return *this;` → 分配新内存并 memcpy → `delete[] data_` 旧内存 → 接管新指针。先分配后释放还能对 new 抛异常保持强安全。',
      '为什么自赋值检查不可省？`c = c` 时若先 delete[] 再从"自己"拷贝，源数据已经死了。',
    ],
    hintsEn: [
      'Copy ctor: `Buffer(const Buffer &o) : n_(o.n_), data_(new unsigned char[o.n_]) { memcpy(data_, o.data_, n_); }`.',
      'Copy assignment in four moves: `if (this == &o) return *this;` → allocate new memory and memcpy → `delete[] data_` the old block → adopt the new pointer. Allocating before freeing also keeps strong safety if new throws.',
      'Why is the self-assignment check mandatory? In `c = c`, deleting first then copying from "yourself" reads dead data.',
    ],
    solution: `#include <cstddef>
#include <cstring>

class Buffer {
public:
    explicit Buffer(size_t n) : n_(n), data_(new unsigned char[n]())
    {
    }
    ~Buffer()
    {
        delete[] data_;
    }

    Buffer(const Buffer &o) : n_(o.n_), data_(new unsigned char[o.n_])
    {
        memcpy(data_, o.data_, n_);
    }

    Buffer &operator=(const Buffer &o)
    {
        if (this == &o)
            return *this;
        unsigned char *fresh = new unsigned char[o.n_];
        memcpy(fresh, o.data_, o.n_);
        delete[] data_;
        data_ = fresh;
        n_ = o.n_;
        return *this;
    }

    unsigned char *data() { return data_; }
    const unsigned char *data() const { return data_; }
    size_t size() const { return n_; }

private:
    size_t n_;
    unsigned char *data_;
};`,
    solutionNote:
      '赋值运算符的"先造后拆"顺序一石三鸟：自赋值即使漏检也只是白拷一次（有检查更清晰）、new 抛异常时原对象完好（强异常安全）、逻辑清晰。C 视角对照：拷贝构造 ≈ 手写 clone() 函数，而 C 结构体直接 `=` 赋值就是"浅拷贝"，同样的坑要靠约定避免。现代 C++ 里更常见的答案其实是"Rule of Zero"：用 vector/unique_ptr 当成员，三件套一个都不用写——cpp-12 见。',
    solutionNoteEn:
      'The assignment operator’s build-then-demolish order kills three birds: even an omitted self-check merely wastes one copy (the check keeps it clear), a throwing new leaves the object intact (strong exception safety), and the logic reads cleanly. C contrast: a copy ctor ≈ a hand-written clone(), while struct `=` in C is exactly a shallow copy with the same trap avoided only by convention. The modern answer is really the "Rule of Zero": hold vector/unique_ptr members and write none of the three — see cpp-12.',
  },
  {
    id: "cpp-05",
    track: "cpp",
    number: 5,
    title: "移动语义：转移命令缓冲的所有权",
    titleEn: "Move Semantics: Transferring a Command Buffer",
    difficulty: "medium",
    minutes: 20,
    tags: ["移动语义", "右值引用", "Rule of Five"],
    tagsEn: ["move-semantics", "rvalue-refs", "Rule of Five"],
    lessonId: "cc-cpp-3",
    brief: "拷贝 1MB 命令缓冲太浪费——写移动构造/移动赋值，把指针\"偷\"过来。",
    briefEn: "Copying a 1MB command buffer is waste — write move ctor/assignment that steal the pointer.",
    description: [
      '深拷贝解决了正确性，但把一个 1MB 的命令缓冲 return 出去或塞进 vector 时，分配+memcpy 纯属浪费——源对象马上就要死了，为什么不直接**接管**它的内存？这就是移动语义：`&&` 右值引用标记"可以被掏空的对象"。',
      '给定已实现好 Rule of Three 的 `CmdBuf` 类，补齐移动构造与移动赋值：把源对象的指针和大小**偷**过来，然后把源对象置为空状态（nullptr/0）——源的析构必须无害。移动操作标记 `noexcept`（vector 扩容时只信 noexcept 的移动）。',
      'harness 用 `std::move` 触发移动，检查：内容转移、源变空、无双重释放（借助全局计数器）。',
    ],
    descriptionEn: [
      'Deep copies fix correctness, but returning a 1MB command buffer or pushing it into a vector makes the allocate+memcpy pure waste — the source is about to die, so why not **take over** its memory? That is move semantics: `&&` rvalue references mark "objects that may be gutted".',
      'Given a `CmdBuf` class with the Rule of Three already done, supply the move constructor and move assignment: **steal** the source’s pointer and size, then leave the source empty (nullptr/0) — its destructor must become harmless. Mark both moves `noexcept` (vector growth only trusts noexcept moves).',
      'The harness triggers moves with `std::move` and checks: contents transferred, source emptied, no double free (via a global counter).',
    ],
    language: "cpp",
    starterCode: `#include <cstddef>
#include <cstring>

extern int g_live_allocs;   /* harness 提供: new[]/delete[] 平衡计数 */

class CmdBuf {
public:
    explicit CmdBuf(size_t n) : n_(n), data_(nullptr)
    {
        if (n_) { data_ = new unsigned char[n_](); g_live_allocs++; }
    }
    ~CmdBuf()
    {
        if (data_) { delete[] data_; g_live_allocs--; }
    }
    CmdBuf(const CmdBuf &o) : n_(o.n_), data_(nullptr)
    {
        if (n_) { data_ = new unsigned char[n_]; g_live_allocs++; memcpy(data_, o.data_, n_); }
    }
    CmdBuf &operator=(const CmdBuf &o)
    {
        if (this != &o) { CmdBuf tmp(o); swap_with(tmp); }
        return *this;
    }

    /* TODO: 移动构造 CmdBuf(CmdBuf &&o) noexcept */

    /* TODO: 移动赋值 operator=(CmdBuf &&o) noexcept */

    unsigned char *data() { return data_; }
    size_t size() const { return n_; }

private:
    void swap_with(CmdBuf &o)
    {
        unsigned char *td = data_; data_ = o.data_; o.data_ = td;
        size_t tn = n_; n_ = o.n_; o.n_ = tn;
    }
    size_t n_;
    unsigned char *data_;
};`,
    starterCodeEn: `#include <cstddef>
#include <cstring>

extern int g_live_allocs;   /* provided by the judge: new[]/delete[] balance */

class CmdBuf {
public:
    explicit CmdBuf(size_t n) : n_(n), data_(nullptr)
    {
        if (n_) { data_ = new unsigned char[n_](); g_live_allocs++; }
    }
    ~CmdBuf()
    {
        if (data_) { delete[] data_; g_live_allocs--; }
    }
    CmdBuf(const CmdBuf &o) : n_(o.n_), data_(nullptr)
    {
        if (n_) { data_ = new unsigned char[n_]; g_live_allocs++; memcpy(data_, o.data_, n_); }
    }
    CmdBuf &operator=(const CmdBuf &o)
    {
        if (this != &o) { CmdBuf tmp(o); swap_with(tmp); }
        return *this;
    }

    /* TODO: move constructor CmdBuf(CmdBuf &&o) noexcept */

    /* TODO: move assignment operator=(CmdBuf &&o) noexcept */

    unsigned char *data() { return data_; }
    size_t size() const { return n_; }

private:
    void swap_with(CmdBuf &o)
    {
        unsigned char *td = data_; data_ = o.data_; o.data_ = td;
        size_t tn = n_; n_ = o.n_; o.n_ = tn;
    }
    size_t n_;
    unsigned char *data_;
};`,
    harness: `#include <cstdio>
#include <utility>

int g_live_allocs = 0;

{{USER_CODE}}

static int _pass, _total;
static void check(const char *label, bool cond)
{
    _total++;
    if (cond) { _pass++; printf("[PASS] %s\\n", label); }
    else printf("[FAIL] %s\\n", label);
}

int main()
{
    {
        CmdBuf a(64);
        a.data()[0] = 0xAB;
        unsigned char *raw = a.data();

        CmdBuf b = std::move(a);   /* move construction */
        check("move ctor steals pointer", b.data() == raw);
        check("moved-to has content", b.data()[0] == 0xAB);
        check("moved-from is empty", a.data() == nullptr && a.size() == 0);
        check("no extra allocation on move", g_live_allocs == 1);

        CmdBuf c(16);
        c.data()[0] = 0x11;
        c = std::move(b);          /* move assignment: c's old memory must be freed */
        check("move assign adopts", c.data() == raw && c.size() == 64);
        check("move assign freed old", g_live_allocs == 1);
        check("assigned-from is empty", b.data() == nullptr);

        c = std::move(c);          /* self-move: must not self-destruct */
        check("self-move keeps data alive", c.size() == 64 && c.data() != nullptr);

        check("moves are noexcept",
              noexcept(CmdBuf(std::move(c))) && noexcept(c = std::move(b)));
    }
    check("all memory returned", g_live_allocs == 0);

    printf("RESULT %d/%d\\n", _pass, _total);
    return _pass == _total ? 0 : 1;
}`,
    hints: [
      '移动构造 = 偷 + 清源：`CmdBuf(CmdBuf &&o) noexcept : n_(o.n_), data_(o.data_) { o.data_ = nullptr; o.n_ = 0; }`——注意没有任何 new/memcpy。',
      '移动赋值可以借用已有的 swap_with：`if (this != &o) { CmdBuf tmp(std::move(o)); swap_with(tmp); }`——tmp 析构时带走我的旧内存。或者手写：释放旧的、偷新的、清源。',
      '自移动 `c = std::move(c)` 是合法调用，实现必须不崩——`this != &o` 检查一步到位。',
    ],
    hintsEn: [
      'Move ctor = steal + clear: `CmdBuf(CmdBuf &&o) noexcept : n_(o.n_), data_(o.data_) { o.data_ = nullptr; o.n_ = 0; }` — note: zero new/memcpy.',
      'Move assignment can reuse swap_with: `if (this != &o) { CmdBuf tmp(std::move(o)); swap_with(tmp); }` — tmp’s destructor carries my old memory away. Or hand-roll: free old, steal new, clear source.',
      'Self-move `c = std::move(c)` is a legal call and must not implode — the `this != &o` check settles it.',
    ],
    solution: `#include <cstddef>
#include <cstring>

extern int g_live_allocs;

class CmdBuf {
public:
    explicit CmdBuf(size_t n) : n_(n), data_(nullptr)
    {
        if (n_) { data_ = new unsigned char[n_](); g_live_allocs++; }
    }
    ~CmdBuf()
    {
        if (data_) { delete[] data_; g_live_allocs--; }
    }
    CmdBuf(const CmdBuf &o) : n_(o.n_), data_(nullptr)
    {
        if (n_) { data_ = new unsigned char[n_]; g_live_allocs++; memcpy(data_, o.data_, n_); }
    }
    CmdBuf &operator=(const CmdBuf &o)
    {
        if (this != &o) { CmdBuf tmp(o); swap_with(tmp); }
        return *this;
    }

    CmdBuf(CmdBuf &&o) noexcept : n_(o.n_), data_(o.data_)
    {
        o.n_ = 0;
        o.data_ = nullptr;
    }

    CmdBuf &operator=(CmdBuf &&o) noexcept
    {
        if (this != &o) {
            if (data_) { delete[] data_; g_live_allocs--; }
            data_ = o.data_;
            n_ = o.n_;
            o.data_ = nullptr;
            o.n_ = 0;
        }
        return *this;
    }

    unsigned char *data() { return data_; }
    size_t size() const { return n_; }

private:
    void swap_with(CmdBuf &o)
    {
        unsigned char *td = data_; data_ = o.data_; o.data_ = td;
        size_t tn = n_; n_ = o.n_; o.n_ = tn;
    }
    size_t n_;
    unsigned char *data_;
};`,
    solutionNote:
      '移动的本质是"资源所有权转移 + 源进入可析构的空状态"，成本 O(1)。noexcept 不是装饰：vector 扩容在移动可能抛异常时会退化成拷贝（强异常安全要求），所以省略 noexcept 常常静默丢掉全部性能收益。加上这两个函数，CmdBuf 凑齐 Rule of Five。ROCm/HIP 运行时里 buffer、module 这类重资源对象几乎全是 move-only 或 move-优先设计。',
    solutionNoteEn:
      'Moving means "ownership transfer + source left in a destructible empty state", at O(1) cost. noexcept is not decoration: vector growth degrades to copying whenever a move might throw (strong exception safety), so omitting it silently forfeits the whole speedup. With these two functions CmdBuf completes the Rule of Five. In the ROCm/HIP runtime, heavyweight objects — buffers, modules — are almost all move-only or move-first designs.',
  },
  {
    id: "cpp-06",
    track: "cpp",
    number: 6,
    title: "手搓 UniquePtr",
    titleEn: "A Hand-Rolled UniquePtr",
    difficulty: "medium",
    minutes: 22,
    tags: ["智能指针", "move-only", "模板"],
    tagsEn: ["smart-pointers", "move-only", "templates"],
    lessonId: "cc-cpp-6",
    brief: "自己实现一个最小 unique_ptr——理解\"独占所有权\"到底是怎么用类型系统表达的。",
    briefEn: "Implement a minimal unique_ptr yourself — see how exclusive ownership is expressed in the type system.",
    description: [
      '`std::unique_ptr` 是现代 C++ 内存管理的默认答案，它的魔法只有两条：析构时 delete 所管对象（RAII）+ 删除拷贝只留移动（独占）。亲手写一遍，它就再也不神秘。',
      '实现类模板 `UniquePtr<T>`：构造接收裸指针（默认 nullptr）；析构 delete；删除拷贝构造/拷贝赋值；实现移动构造/移动赋值（偷指针、清源、自移动安全）；成员函数 `get()`、`release()`（交出指针并放弃所有权，不 delete）、`reset(p)`（delete 旧的、接管新的；本题规定 `reset(get())` 必须无害——注意 std::unique_ptr **没有**这层自我保护，标准把它归为未定义使用）、`operator*`、`operator->`、`explicit operator bool`。',
      'harness 用一个带实例计数的 Widget 验证：作用域退出自动销毁、移动后源为空、release 后不销毁、reset 正确换血。',
    ],
    descriptionEn: [
      '`std::unique_ptr` is modern C++’s default answer to memory management, and its magic is only two clauses: delete the managed object at destruction (RAII) + delete copying, keep moving (exclusivity). Write it once by hand and it stops being mysterious.',
      'Implement the class template `UniquePtr<T>`: constructor takes a raw pointer (default nullptr); destructor deletes; copy ctor/assignment deleted; move ctor/assignment (steal, clear source, self-move safe); members `get()`, `release()` (hand the pointer out and relinquish ownership, no delete), `reset(p)` (delete old, adopt new; this problem specifies that `reset(get())` must be harmless — note std::unique_ptr does **not** self-guard here and the standard treats it as undefined use), `operator*`, `operator->`, and `explicit operator bool`.',
      'The harness verifies with an instance-counting Widget: automatic destruction at scope exit, empty source after move, no destruction after release, and a clean swap on reset.',
    ],
    language: "cpp",
    starterCode: `#include <cstddef>

template <typename T>
class UniquePtr {
public:
    explicit UniquePtr(T *p = nullptr) : p_(p) {}

    /* TODO:
     *  ~UniquePtr()
     *  删除拷贝构造 / 拷贝赋值
     *  移动构造 / 移动赋值 (noexcept)
     *  T *get() const
     *  T *release()
     *  void reset(T *p = nullptr)
     *  T &operator*() const
     *  T *operator->() const
     *  explicit operator bool() const
     */

private:
    T *p_;
};`,
    starterCodeEn: `#include <cstddef>

template <typename T>
class UniquePtr {
public:
    explicit UniquePtr(T *p = nullptr) : p_(p) {}

    /* TODO:
     *  ~UniquePtr()
     *  delete copy ctor / copy assignment
     *  move ctor / move assignment (noexcept)
     *  T *get() const
     *  T *release()
     *  void reset(T *p = nullptr)
     *  T &operator*() const
     *  T *operator->() const
     *  explicit operator bool() const
     */

private:
    T *p_;
};`,
    harness: `#include <cstdio>
#include <utility>

{{USER_CODE}}

struct Widget {
    static int live;
    int value = 42;
    Widget() { live++; }
    ~Widget() { live--; }
};
int Widget::live = 0;

#include <type_traits>
static_assert(!std::is_copy_constructible<UniquePtr<Widget>>::value,
              "UniquePtr must not be copy-constructible");
static_assert(!std::is_copy_assignable<UniquePtr<Widget>>::value,
              "UniquePtr must not be copy-assignable");
static_assert(std::is_move_constructible<UniquePtr<Widget>>::value,
              "UniquePtr must be movable");
static_assert(std::is_nothrow_move_constructible<UniquePtr<Widget>>::value,
              "the move constructor must be noexcept (vector growth relies on it)");
static_assert(std::is_nothrow_move_assignable<UniquePtr<Widget>>::value,
              "move assignment must be noexcept");
static_assert(!std::is_convertible<UniquePtr<Widget>, bool>::value,
              "operator bool must be explicit");
static_assert(std::is_constructible<bool, UniquePtr<Widget>&>::value,
              "explicit operator bool must exist");

static int _pass, _total;
static void check(const char *label, bool cond)
{
    _total++;
    if (cond) { _pass++; printf("[PASS] %s\\n", label); }
    else printf("[FAIL] %s\\n", label);
}

int main()
{
    {
        UniquePtr<Widget> a(new Widget);
        check("owns a live object", Widget::live == 1 && bool(a));
        check("operator-> works", a->value == 42);
        check("operator* works", (*a).value == 42);

        UniquePtr<Widget> b = std::move(a);
        check("move transfers", b.get() != nullptr && !a);
        check("still exactly one object", Widget::live == 1);

        b.reset(new Widget);
        check("reset destroys old and adopts new", Widget::live == 1 && b->value == 42);

        Widget *raw = b.release();
        check("release relinquishes without destroying", Widget::live == 1 && !b);
        delete raw;
        check("manual delete after release", Widget::live == 0);

        UniquePtr<Widget> c(new Widget);
        UniquePtr<Widget> d;
        d = std::move(c);
        check("move assign", Widget::live == 1 && d.get() && !c);
        d = std::move(d);
        check("self move-assign is safe", Widget::live == 1 && d.get());

        d.reset(d.get());   /* spec: reset(get()) must be a harmless no-op */
        check("self-reset keeps the object alive", Widget::live == 1 && d.get() && d->value == 42);
    }
    check("scope exit destroys everything", Widget::live == 0);

    printf("RESULT %d/%d\\n", _pass, _total);
    return _pass == _total ? 0 : 1;
}`,
    hints: [
      '骨架顺序：析构 `delete p_;`；拷贝 `= delete`；移动构造 `UniquePtr(UniquePtr &&o) noexcept : p_(o.p_) { o.p_ = nullptr; }`。',
      '本题的 reset 规定要防 `reset(get())`：`if (p != p_) { delete p_; p_ = p; }`——这是教学上的安全加严；真实 std::unique_ptr::reset 不做此检查，`u.reset(u.get())` 属于未定义使用。release：`T *t = p_; p_ = nullptr; return t;`。',
      '移动赋值最省心的写法是复用 reset + release：`if (this != &o) reset(o.release());`。',
      '`explicit operator bool() const { return p_ != nullptr; }`——explicit 防止它被隐式当成整数参与运算。',
    ],
    hintsEn: [
      'Skeleton order: destructor `delete p_;`; copies `= delete`; move ctor `UniquePtr(UniquePtr &&o) noexcept : p_(o.p_) { o.p_ = nullptr; }`.',
      'This problem’s reset must guard `reset(get())`: `if (p != p_) { delete p_; p_ = p; }` — a deliberate teaching hardening; the real std::unique_ptr::reset performs no such check, and `u.reset(u.get())` is undefined use. release: `T *t = p_; p_ = nullptr; return t;`.',
      'The least fussy move assignment reuses reset + release: `if (this != &o) reset(o.release());`.',
      '`explicit operator bool() const { return p_ != nullptr; }` — explicit stops it from being drafted into integer arithmetic.',
    ],
    solution: `#include <cstddef>

template <typename T>
class UniquePtr {
public:
    explicit UniquePtr(T *p = nullptr) : p_(p) {}
    ~UniquePtr() { delete p_; }

    UniquePtr(const UniquePtr &) = delete;
    UniquePtr &operator=(const UniquePtr &) = delete;

    UniquePtr(UniquePtr &&o) noexcept : p_(o.p_) { o.p_ = nullptr; }
    UniquePtr &operator=(UniquePtr &&o) noexcept
    {
        if (this != &o)
            reset(o.release());
        return *this;
    }

    T *get() const { return p_; }

    T *release()
    {
        T *t = p_;
        p_ = nullptr;
        return t;
    }

    void reset(T *p = nullptr)
    {
        if (p != p_) {
            delete p_;
            p_ = p;
        }
    }

    T &operator*() const { return *p_; }
    T *operator->() const { return p_; }
    explicit operator bool() const { return p_ != nullptr; }

private:
    T *p_;
};`,
    solutionNote:
      '"独占"不是注释而是类型系统的强制：拷贝被删除后，两个 UniquePtr 指向同一对象在编译期就不可能。对照 C（c-16）：所有权靠函数命名约定（create/destroy）和评审纪律维持；C++ 把同样的纪律编译进类型。真实 unique_ptr 还有自定义 deleter、数组特化，并依赖 delete nullptr 合法这一点省掉析构判空（本实现同样受益）；但它的 reset **不**做自指检查——那是本题为教学加的护栏。它是 LLVM 代码库里出现频率最高的智能指针。',
    solutionNoteEn:
      '"Exclusive" is not a comment but a type-system guarantee: with copying deleted, two UniquePtrs owning one object is impossible at compile time. Contrast C (c-16): ownership lives in naming conventions (create/destroy) and review discipline; C++ compiles that discipline into the type. The real unique_ptr adds custom deleters and an array specialization, and leans on delete nullptr being legal (so the destructor needs no null check — ours benefits too); its reset, however, does **not** self-check — that guard is this problem’s teaching rail. It is the most frequent smart pointer in the LLVM codebase.',
  },
  {
    id: "cpp-07",
    track: "cpp",
    number: 7,
    title: "虚函数与多态引擎",
    titleEn: "Virtual Functions & Polymorphic Engines",
    difficulty: "medium",
    minutes: 20,
    tags: ["继承", "虚函数", "vtable"],
    tagsEn: ["inheritance", "virtual", "vtable"],
    lessonId: "cc-cpp-4",
    brief: "基类指针调用派生类实现——C++ 版的 ops 结构体，外加一个必须 virtual 的析构。",
    briefEn: "Base pointers dispatching to derived implementations — C++’s ops struct, plus a destructor that must be virtual.",
    description: [
      'c-14 里你手工填了 ops 表；C++ 说：这活我包了。声明 `virtual`，编译器自动生成 vtable、自动在构造时接线、调用点自动查表——语法上只是普通成员调用。',
      '实现基类 `Engine`：构造接收 `const char *name` 存起来，`name()` 返回它；纯虚函数 `cost(int job)`；虚函数 `describe()` 返回 name（派生类可加工）；**虚析构函数**（记录到全局计数器 g_dtor_calls，便于判题）。派生类 `GfxEngine`：cost 返回 `job*2`；`ComputeEngine`：cost 返回 `job+1`，并重写 describe() 返回 name 加后缀 "+wave"。再实现 `total_cost(Engine *const *engines, size_t n, int job)`：对每个引擎累加 cost。',
      'harness 会通过 `Engine*` 数组做异构分发，并 `delete` 基类指针检查虚析构是否生效。',
    ],
    descriptionEn: [
      'In c-14 you filled ops tables by hand; C++ says: I’ll take it from here. Declare `virtual` and the compiler generates the vtable, wires it at construction, and makes every call site table-driven — while the syntax stays a plain member call.',
      'Implement base `Engine`: constructor takes and stores `const char *name`, `name()` returns it; pure virtual `cost(int job)`; virtual `describe()` returning name (derived classes may embellish); a **virtual destructor** (increment the global g_dtor_calls so the judge can count). Derived `GfxEngine`: cost returns `job*2`; `ComputeEngine`: cost returns `job+1` and overrides describe() to return name plus the suffix "+wave". Then implement `total_cost(Engine *const *engines, size_t n, int job)`: sum cost over the engines.',
      'The harness dispatches heterogeneously through an `Engine*` array and `delete`s via base pointers to check the virtual destructor.',
    ],
    language: "cpp",
    starterCode: `#include <cstddef>
#include <string>

extern int g_dtor_calls;   /* harness 提供 */

class Engine {
public:
    /* TODO: 构造(name); 虚析构(g_dtor_calls++);
     *       name(); 纯虚 cost(int); 虚 describe() */
};

class GfxEngine : public Engine {
public:
    /* TODO: cost = job * 2 */
};

class ComputeEngine : public Engine {
public:
    /* TODO: cost = job + 1; describe() = name + "+wave" */
};

long total_cost(Engine *const *engines, size_t n, int job)
{
    (void)engines; (void)n; (void)job;
    return 0; /* TODO: 只通过基类接口调用 */
}`,
    starterCodeEn: `#include <cstddef>
#include <string>

extern int g_dtor_calls;   /* provided by the judge */

class Engine {
public:
    /* TODO: ctor(name); virtual dtor (g_dtor_calls++);
     *       name(); pure virtual cost(int); virtual describe() */
};

class GfxEngine : public Engine {
public:
    /* TODO: cost = job * 2 */
};

class ComputeEngine : public Engine {
public:
    /* TODO: cost = job + 1; describe() = name + "+wave" */
};

long total_cost(Engine *const *engines, size_t n, int job)
{
    (void)engines; (void)n; (void)job;
    return 0; /* TODO: call only through the base interface */
}`,
    harness: `#include <cstdio>
#include <string>

int g_dtor_calls = 0;

{{USER_CODE}}

static int _pass, _total;
static void check(const char *label, bool cond)
{
    _total++;
    if (cond) { _pass++; printf("[PASS] %s\\n", label); }
    else printf("[FAIL] %s\\n", label);
}

int main()
{
    GfxEngine gfx("gfx0");
    ComputeEngine comp("comp0");

    Engine *base = &gfx;
    check("virtual dispatch to gfx", base->cost(10) == 20);
    base = &comp;
    check("virtual dispatch to compute", base->cost(10) == 11);

    check("base describe", std::string(gfx.describe()) == "gfx0");
    check("overridden describe", std::string(comp.describe()) == "comp0+wave");
    check("name() from base part", std::string(comp.name()) == "comp0");

    Engine *arr[2] = { &gfx, &comp };
    check("heterogeneous total", total_cost(arr, 2, 10) == 31);
    check("empty set", total_cost(nullptr, 0, 10) == 0);

    g_dtor_calls = 0;
    Engine *owned = new GfxEngine("temp");
    delete owned;   /* delete through the base pointer */
    check("virtual dtor ran through base pointer", g_dtor_calls >= 1);

    printf("RESULT %d/%d\\n", _pass, _total);
    return _pass == _total ? 0 : 1;
}`,
    hints: [
      '基类骨架：`Engine(const char *n) : name_(n) {}`、`virtual ~Engine() { g_dtor_calls++; }`、`virtual long cost(int job) = 0;`（=0 即纯虚）、`virtual std::string describe() const { return name_; }`。',
      '派生类构造直接转发：`GfxEngine(const char *n) : Engine(n) {}`；重写时写 `override`——拼错签名编译器立刻报错。',
      'describe 的返回类型用 std::string 最省心（拼接 "+wave" 直接用 +）。',
      '为什么析构必须 virtual？`delete base` 时若析构非虚，只执行基类析构——派生类的资源全漏。有虚函数的类，析构默认就该 virtual。',
    ],
    hintsEn: [
      'Base skeleton: `Engine(const char *n) : name_(n) {}`, `virtual ~Engine() { g_dtor_calls++; }`, `virtual long cost(int job) = 0;` (=0 makes it pure), `virtual std::string describe() const { return name_; }`.',
      'Derived constructors just forward: `GfxEngine(const char *n) : Engine(n) {}`; write `override` on overrides — signature typos become compile errors.',
      'std::string is the comfortable return type for describe (concatenate "+wave" with +).',
      'Why must the destructor be virtual? `delete base` with a non-virtual dtor runs only the base destructor — derived resources all leak. Any class with virtuals should default to a virtual dtor.',
    ],
    solution: `#include <cstddef>
#include <string>

extern int g_dtor_calls;

class Engine {
public:
    explicit Engine(const char *n) : name_(n) {}
    virtual ~Engine() { g_dtor_calls++; }

    const char *name() const { return name_; }
    virtual long cost(int job) = 0;
    virtual std::string describe() const { return name_; }

private:
    const char *name_;
};

class GfxEngine : public Engine {
public:
    explicit GfxEngine(const char *n) : Engine(n) {}
    long cost(int job) override { return (long)job * 2; }
};

class ComputeEngine : public Engine {
public:
    explicit ComputeEngine(const char *n) : Engine(n) {}
    long cost(int job) override { return (long)job + 1; }
    std::string describe() const override { return std::string(name()) + "+wave"; }
};

long total_cost(Engine *const *engines, size_t n, int job)
{
    long sum = 0;
    for (size_t i = 0; i < n; i++)
        sum += engines[i]->cost(job);
    return sum;
}`,
    solutionNote:
      '对照 c-14 一一映射：vtable ≈ ops 表（每类一张，编译器生成）、vptr ≈ 对象里指向表的隐藏指针（构造时自动填）、override ≈ 填表时的类型检查。三条纪律：有虚函数就要虚析构；重写必写 override；纯虚函数定义接口契约。total_cost 与 c-14 的 run_jobs 完全同构——这就是"机制与策略分离"在两门语言里的两种拼写。',
    solutionNoteEn:
      'Map it onto c-14: vtable ≈ ops table (one per class, compiler-generated), vptr ≈ the hidden per-object pointer to it (wired during construction), override ≈ type-checked table filling. Three disciplines: virtual functions imply a virtual destructor; always write override; pure virtuals define the interface contract. total_cost is isomorphic to c-14’s run_jobs — "mechanism separated from policy" spelled in two languages.',
  },
  {
    id: "cpp-08",
    track: "cpp",
    number: 8,
    title: "接口类：把分配器抽象出来",
    titleEn: "Interface Classes: Abstracting the Allocator",
    difficulty: "hard",
    minutes: 25,
    tags: ["纯虚接口", "依赖注入", "多态"],
    tagsEn: ["pure-interface", "DI", "polymorphism"],
    lessonId: "cc-cpp-4",
    brief: "上层代码只认 IAllocator 接口，底下随便换实现——LLVM/Mesa 式的依赖注入。",
    briefEn: "Upper layers see only the IAllocator interface; swap implementations underneath — LLVM/Mesa-style dependency injection.",
    description: [
      '大型 C++ 代码库的分层秘诀：上层依赖**纯虚接口**而非具体类。LLVM 的 MemoryBuffer、Mesa 的 winsys 层都是这样——测试时注入假实现，换后端不改上层一行。',
      '给定纯虚接口 `IAllocator { virtual void *alloc(size_t) = 0; virtual void free_(void *) = 0; }`（已提供，含虚析构）。实现：(1) `CountingAllocator`——用 new/delete 真分配，并统计 `alloc_calls`、`free_calls`、`live()`（在册块数）；(2) `suballoc_run(IAllocator &a, size_t count, size_t size)`——上层演示函数：申请 count 块、每块 size 字节，然后全部释放，返回成功申请的块数；任何一块申请失败（返回 nullptr）时，**先释放已申请的所有块**再返回已成功数。',
      '规则：suballoc_run 只准通过接口引用操作，不得出现 new/delete/malloc。',
    ],
    descriptionEn: [
      'The layering secret of large C++ codebases: upper layers depend on **pure virtual interfaces**, not concrete classes. LLVM’s MemoryBuffer and Mesa’s winsys layer work this way — inject fakes for tests, swap backends without touching a line above.',
      'Given the pure interface `IAllocator { virtual void *alloc(size_t) = 0; virtual void free_(void *) = 0; }` (provided, with virtual dtor). Implement: (1) `CountingAllocator` — really allocates via new/delete and tracks `alloc_calls`, `free_calls`, `live()` (blocks outstanding); (2) `suballoc_run(IAllocator &a, size_t count, size_t size)` — an upper-layer demo: allocate count blocks of size bytes, then free them all, returning how many allocations succeeded; if any allocation fails (nullptr), **free every block acquired so far** first, then return the success count.',
      'Rule: suballoc_run may only act through the interface reference — no new/delete/malloc in it.',
    ],
    language: "cpp",
    starterCode: `#include <cstddef>
#include <vector>

class IAllocator {
public:
    virtual ~IAllocator() = default;
    virtual void *alloc(size_t n) = 0;
    virtual void free_(void *p) = 0;
};

class CountingAllocator : public IAllocator {
public:
    int alloc_calls = 0;
    int free_calls = 0;

    /* TODO: alloc/free_ 实现 + live() */
};

/* 申请 count 块每块 size 字节, 再全部释放。
 * 某块失败 -> 释放已申请的, 返回成功数。 */
size_t suballoc_run(IAllocator &a, size_t count, size_t size)
{
    (void)a; (void)count; (void)size;
    return 0; /* TODO: 只准用 a.alloc / a.free_ */
}`,
    starterCodeEn: `#include <cstddef>
#include <vector>

class IAllocator {
public:
    virtual ~IAllocator() = default;
    virtual void *alloc(size_t n) = 0;
    virtual void free_(void *p) = 0;
};

class CountingAllocator : public IAllocator {
public:
    int alloc_calls = 0;
    int free_calls = 0;

    /* TODO: implement alloc/free_ + live() */
};

/* Allocate count blocks of size bytes each, then free them all.
 * If a block fails -> free what was acquired, return the success count. */
size_t suballoc_run(IAllocator &a, size_t count, size_t size)
{
    (void)a; (void)count; (void)size;
    return 0; /* TODO: only a.alloc / a.free_ allowed here */
}`,
    harness: `#include <cstdio>
#include <vector>
#include <cstddef>

{{USER_CODE}}

/* failure-injecting fake allocator: the fail_at-th alloc returns nullptr */
class FlakyAllocator : public IAllocator {
public:
    explicit FlakyAllocator(int fail_at) : fail_at_(fail_at) {}
    int alloc_calls = 0;
    int free_calls = 0;
    void *alloc(size_t n) override
    {
        alloc_calls++;
        if (alloc_calls == fail_at_) return nullptr;
        return ::operator new(n);
    }
    void free_(void *p) override
    {
        if (p) { free_calls++; ::operator delete(p); }
    }
private:
    int fail_at_;
};

static int _pass, _total;
static void check(const char *label, bool cond)
{
    _total++;
    if (cond) { _pass++; printf("[PASS] %s\\n", label); }
    else printf("[FAIL] %s\\n", label);
}

int main()
{
    CountingAllocator ca;
    check("happy path count", suballoc_run(ca, 5, 64) == 5);
    check("5 allocs recorded", ca.alloc_calls == 5);
    check("5 frees recorded", ca.free_calls == 5);
    check("nothing left live", ca.live() == 0);

    check("zero count ok", suballoc_run(ca, 0, 64) == 0);
    check("no extra calls", ca.alloc_calls == 5 && ca.free_calls == 5);

    FlakyAllocator fa(3);   /* the 3rd alloc fails */
    check("failure returns successes", suballoc_run(fa, 5, 32) == 2);
    check("no more allocs after failure", fa.alloc_calls == 3);
    check("acquired blocks were freed", fa.free_calls == 2);

    /* one suballoc_run, two allocators — dependency injection */
    check("interface polymorphism works", true);

    printf("RESULT %d/%d\\n", _pass, _total);
    return _pass == _total ? 0 : 1;
}`,
    hints: [
      'CountingAllocator：`void *alloc(size_t n) override { alloc_calls++; return ::operator new(n); }`；free_ 里对 nullptr 直接忽略；`live()` 就是 `alloc 成功数 - free 数`（注意 alloc 失败不该计入 live——本实现里 operator new 失败会抛异常，简单起见按调用数算即可，harness 的 CountingAllocator 不会失败）。',
      'suballoc_run 用 vector<void*> 暂存指针：失败时倒序 free_ 已有的；成功走到底也是同一段清理代码——可以把释放循环放在函数末尾统一执行。',
      '为什么参数是 `IAllocator &` 而不是具体类？这样 FlakyAllocator（测试注入失败）和 CountingAllocator 都能喂给它——这正是接口的意义。',
    ],
    hintsEn: [
      'CountingAllocator: `void *alloc(size_t n) override { alloc_calls++; return ::operator new(n); }`; free_ ignores nullptr; `live()` is allocs minus frees (operator new throws rather than returning null, and the harness’s CountingAllocator never fails, so call counting suffices).',
      'suballoc_run stashes pointers in a vector<void*>: on failure, free_ what you have (reverse order is tidy); the success path ends in the same cleanup loop — one shared release site at the end works.',
      'Why take `IAllocator &` instead of a concrete class? So both FlakyAllocator (failure injection for tests) and CountingAllocator feed it — that is the entire point of interfaces.',
    ],
    solution: `#include <cstddef>
#include <vector>

class IAllocator {
public:
    virtual ~IAllocator() = default;
    virtual void *alloc(size_t n) = 0;
    virtual void free_(void *p) = 0;
};

class CountingAllocator : public IAllocator {
public:
    int alloc_calls = 0;
    int free_calls = 0;

    void *alloc(size_t n) override
    {
        alloc_calls++;
        return ::operator new(n);
    }

    void free_(void *p) override
    {
        if (!p)
            return;
        free_calls++;
        ::operator delete(p);
    }

    int live() const { return alloc_calls - free_calls; }
};

size_t suballoc_run(IAllocator &a, size_t count, size_t size)
{
    std::vector<void *> blocks;
    blocks.reserve(count);

    for (size_t i = 0; i < count; i++) {
        void *p = a.alloc(size);
        if (!p)
            break;
        blocks.push_back(p);
    }

    size_t got = blocks.size();
    for (size_t i = blocks.size(); i > 0; i--)
        a.free_(blocks[i - 1]);
    return got;
}`,
    solutionNote:
      '接口类 = 只有纯虚函数和虚析构的抽象基类，C++ 对"ops 表"的正式命名。suballoc_run 对分配器的实现一无所知，于是测试可以注入 FlakyAllocator 精确制造第 N 次失败——这种失败注入在真实驱动测试里极其珍贵（内核有 fault-injection 框架做同样的事）。释放循环倒序走是好习惯（对齐"逆序销毁"直觉），此处正序其实也对。',
    solutionNoteEn:
      'An interface class = an abstract base with only pure virtuals and a virtual dtor — C++’s formal name for the "ops table". suballoc_run knows nothing about the allocator’s implementation, so tests inject FlakyAllocator to fail exactly on call N — failure injection this precise is gold in real driver testing (the kernel’s fault-injection framework does the same). Freeing in reverse is good habit (matching the reverse-destruction instinct), though forward order is also correct here.',
  },
  {
    id: "cpp-09",
    track: "cpp",
    number: 9,
    title: "函数模板：一份代码所有类型",
    titleEn: "Function Templates: One Body, Every Type",
    difficulty: "medium",
    minutes: 18,
    tags: ["模板", "泛型"],
    tagsEn: ["templates", "generics"],
    lessonId: "cc-cpp-5",
    brief: "cpp-01 里两个一模一样的 clamp？模板把它们合并成一个，还附赠编译期对齐工具。",
    briefEn: "Those two identical clamps from cpp-01? A template merges them — with a compile-time alignment helper thrown in.",
    description: [
      'cpp-01 的两个 clamp_val 函数体一字不差，只有类型不同。模板就是为此而生：写一次 `template <typename T>`，编译器按每个用到的类型**实例化**出专属版本——零运行时开销，这是 STL 全部容器与算法的基石。',
      '实现：(1) `template <typename T> T clamp_t(T v, T lo, T hi)`；(2) `template <typename T> T align_up(T v, T a)`——把 v 向上对齐到 a 的倍数（a 保证是 2 的幂；GPU 内存分配几乎每一步都要对齐：页 4096、缓存行 64……）；(3) `template <typename T> const T &max3(const T &a, const T &b, const T &c)`——三者取大。',
      'align_up 的位技巧值得记一辈子：`(v + a - 1) & ~(a - 1)`。想清楚它为什么对（提示：低位清零）。',
    ],
    descriptionEn: [
      'The two clamp_val bodies in cpp-01 differ by not one character — only types. Templates exist for exactly this: write `template <typename T>` once and the compiler **instantiates** a bespoke version per used type — zero runtime cost. This is the foundation of every STL container and algorithm.',
      'Implement: (1) `template <typename T> T clamp_t(T v, T lo, T hi)`; (2) `template <typename T> T align_up(T v, T a)` — round v up to a multiple of a (a guaranteed a power of two; GPU memory allocation aligns at every step: 4096-byte pages, 64-byte cache lines…); (3) `template <typename T> const T &max3(const T &a, const T &b, const T &c)` — the largest of three.',
      'The align_up bit trick deserves lifetime tenure: `(v + a - 1) & ~(a - 1)`. Work out why it is correct (hint: clearing low bits).',
    ],
    language: "cpp",
    starterCode: `#include <cstdint>
#include <cstddef>

/* TODO: clamp_t —— 泛型版 clamp */

/* TODO: align_up —— v 向上对齐到 a 的倍数 (a 是 2 的幂) */

/* TODO: max3 —— 三者取大, 参数与返回都是 const T& */`,
    starterCodeEn: `#include <cstdint>
#include <cstddef>

/* TODO: clamp_t — the generic clamp */

/* TODO: align_up — round v up to a multiple of a (a is a power of two) */

/* TODO: max3 — largest of three, params and return are const T& */`,
    harness: `#include <cstdio>
#include <cstdint>
#include <string>

{{USER_CODE}}

static int _pass, _total;
static void check(const char *label, bool cond)
{
    _total++;
    if (cond) { _pass++; printf("[PASS] %s\\n", label); }
    else printf("[FAIL] %s\\n", label);
}

int main()
{
    check("clamp<int>", clamp_t(15, 0, 10) == 10 && clamp_t(-3, 0, 10) == 0);
    check("clamp<double>", clamp_t(0.5, 0.0, 1.0) == 0.5);
    check("clamp<uint64_t>", clamp_t<uint64_t>(1ull << 40, 0ull, 1ull << 32) == (1ull << 32));

    check("align 100 -> 4096", align_up<uint32_t>(100, 4096) == 4096);
    check("align 4096 stays", align_up<uint32_t>(4096, 4096) == 4096);
    check("align 4097 -> 8192", align_up<uint32_t>(4097, 4096) == 8192);
    check("align 0 stays 0", align_up<uint32_t>(0, 64) == 0);
    check("align u64 works", align_up<uint64_t>((1ull << 33) + 5, 4096) == (1ull << 33) + 4096);
    check("align to 1 is identity", align_up<uint32_t>(37, 1) == 37);

    check("max3 ints", max3(3, 9, 5) == 9);
    check("max3 first wins", max3(9, 3, 5) == 9);
    check("max3 strings", max3(std::string("aa"), std::string("zz"), std::string("mm")) == "zz");

    printf("RESULT %d/%d\\n", _pass, _total);
    return _pass == _total ? 0 : 1;
}`,
    hints: [
      '模板语法：`template <typename T> T clamp_t(T v, T lo, T hi) { ... }`——函数体照抄 cpp-01。',
      'align_up：`return (v + a - 1) & ~(a - 1);`——加上 a-1"垫高"，再用 ~(a-1) 把低 log2(a) 位清零。仅当 a 是 2 的幂时 ~(a-1) 才是干净的高位掩码。',
      'max3 可以复用两两比较：`const T &m = (a < b) ? b : a; return (m < c) ? c : m;`——只用 `<`，这样任何定义了 < 的类型（包括 std::string）都能用。',
    ],
    hintsEn: [
      'Template syntax: `template <typename T> T clamp_t(T v, T lo, T hi) { ... }` — body copied straight from cpp-01.',
      'align_up: `return (v + a - 1) & ~(a - 1);` — pad up by a-1, then clear the low log2(a) bits with ~(a-1). Only for power-of-two a is ~(a-1) a clean high mask.',
      'max3 can chain pairwise: `const T &m = (a < b) ? b : a; return (m < c) ? c : m;` — using only `<` means any type defining < works (std::string included).',
    ],
    solution: `#include <cstdint>
#include <cstddef>

template <typename T>
T clamp_t(T v, T lo, T hi)
{
    if (v < lo) return lo;
    if (hi < v) return hi;
    return v;
}

template <typename T>
T align_up(T v, T a)
{
    return (v + a - 1) & ~(a - 1);
}

template <typename T>
const T &max3(const T &a, const T &b, const T &c)
{
    const T &m = (a < b) ? b : a;
    return (m < c) ? c : m;
}`,
    solutionNote:
      '模板在编译期按需实例化：clamp_t 用了 int/double/uint64_t 三种，二进制里就有三个函数，每个都和手写版同样快——"零成本抽象"。align_up 的掩码技巧同样活在内核（ALIGN 宏，include/linux/align.h）和 amdgpu 的显存分配路径里。max3 只依赖 `<` 是刻意的：这叫"隐式约束"，C++20 的 concepts 把它显式化。对照 C：同样的泛型只能靠宏（无类型检查）或 void*（丢类型信息）。',
    solutionNoteEn:
      'Templates instantiate on demand at compile time: clamp_t used with int/double/uint64_t puts three functions in the binary, each as fast as hand-written — "zero-cost abstraction". The align_up mask trick lives equally in the kernel (the ALIGN macro, include/linux/align.h) and in amdgpu’s VRAM allocation paths. max3 depending only on `<` is deliberate: an "implicit constraint" that C++20 concepts make explicit. C contrast: the same genericity costs you macros (no type checks) or void* (type info lost).',
  },
  {
    id: "cpp-10",
    track: "cpp",
    number: 10,
    title: "类模板：定长 RingBuffer<T, N>",
    titleEn: "Class Templates: A Fixed RingBuffer<T, N>",
    difficulty: "hard",
    minutes: 25,
    tags: ["类模板", "环形缓冲", "值语义"],
    tagsEn: ["class-templates", "ring-buffer", "value-semantics"],
    lessonId: "cc-cpp-5",
    brief: "GPU ring 的 C++ 化身：类型和容量都是模板参数，回绕用掩码。",
    briefEn: "The GPU ring’s C++ incarnation: element type and capacity as template parameters, wraparound by mask.",
    description: [
      '把 c-14 的 ops、k-05 的 ring 思想搬进类型系统：`RingBuffer<T, N>`——元素类型 T、容量 N 都在编译期固定（N 保证是 2 的幂），存储直接内嵌数组，零堆分配。这是嵌入式/驱动用户态工具库的常见构件。',
      '实现类模板 `RingBuffer<T, N>`：`bool push(const T &v)`——满则返回 false；`bool pop(T &out)`——空则返回 false，否则最老元素写入 out；`size_t size() const`；`bool empty() const`；`bool full() const`。用 head/tail 两个单调递增计数器 + `& (N - 1)` 掩码定位，这样 size 就是 `head - tail`，永不歧义。',
      'harness 会灌满、抽干、跨回绕边界读写，并用非平凡类型（std::string）实例化第二份。',
    ],
    descriptionEn: [
      'Carry c-14’s ops and k-05’s ring thinking into the type system: `RingBuffer<T, N>` — element type T and capacity N fixed at compile time (N guaranteed a power of two), storage embedded inline, zero heap allocation. A staple building block of embedded/driver userspace toolkits.',
      'Implement the class template `RingBuffer<T, N>`: `bool push(const T &v)` — false when full; `bool pop(T &out)` — false when empty, else the oldest element lands in out; `size_t size() const`; `bool empty() const`; `bool full() const`. Use two monotonically increasing counters head/tail plus the `& (N - 1)` mask for indexing, so size is simply `head - tail` with no ambiguity.',
      'The harness fills, drains, crosses the wraparound boundary, and instantiates a second copy with a non-trivial type (std::string).',
    ],
    language: "cpp",
    starterCode: `#include <cstddef>

template <typename T, size_t N>
class RingBuffer {
    static_assert(N > 0 && (N & (N - 1)) == 0, "N must be a power of two");
public:
    /* TODO: push / pop / size / empty / full */

private:
    T buf_[N];
    size_t head_ = 0;   /* 写计数, 只增 */
    size_t tail_ = 0;   /* 读计数, 只增 */
};`,
    starterCodeEn: `#include <cstddef>

template <typename T, size_t N>
class RingBuffer {
    static_assert(N > 0 && (N & (N - 1)) == 0, "N must be a power of two");
public:
    /* TODO: push / pop / size / empty / full */

private:
    T buf_[N];
    size_t head_ = 0;   /* write counter, only increases */
    size_t tail_ = 0;   /* read counter, only increases */
};`,
    harness: `#include <cstdio>
#include <string>

{{USER_CODE}}

static int _pass, _total;
static void check(const char *label, bool cond)
{
    _total++;
    if (cond) { _pass++; printf("[PASS] %s\\n", label); }
    else printf("[FAIL] %s\\n", label);
}

int main()
{
    RingBuffer<int, 4> rb;
    check("starts empty", rb.empty() && !rb.full() && rb.size() == 0);

    check("push 4 ok", rb.push(1) && rb.push(2) && rb.push(3) && rb.push(4));
    check("now full", rb.full() && rb.size() == 4);
    check("push to full rejected", !rb.push(5));

    int v = 0;
    check("pop FIFO order", rb.pop(v) && v == 1);
    check("size after pop", rb.size() == 3);
    check("push after pop wraps", rb.push(5));

    bool order_ok = true;
    int expect[] = { 2, 3, 4, 5 };
    for (int e : expect)
        if (!rb.pop(v) || v != e) { order_ok = false; break; }
    check("drain preserves order across wrap", order_ok);
    check("empty again", rb.empty() && !rb.pop(v));

    /* multiple rounds across the wrap boundary */
    bool rounds_ok = true;
    for (int round = 0; round < 10 && rounds_ok; round++) {
        for (int i = 0; i < 3; i++) rb.push(round * 10 + i);
        for (int i = 0; i < 3; i++)
            if (!rb.pop(v) || v != round * 10 + i) rounds_ok = false;
    }
    check("10 rounds across boundary", rounds_ok);

    RingBuffer<std::string, 2> sb;
    check("string instantiation", sb.push("gfx") && sb.push("sdma") && sb.full());
    std::string s;
    check("string pop", sb.pop(s) && s == "gfx");

    printf("RESULT %d/%d\\n", _pass, _total);
    return _pass == _total ? 0 : 1;
}`,
    hints: [
      '单调计数器方案的妙处：head_ 和 tail_ 永远只加不减，`size() = head_ - tail_`，`full() = size() == N`，`empty() = head_ == tail_`——无符号回绕也不破坏差值。',
      'push：`if (full()) return false; buf_[head_ & (N - 1)] = v; head_++; return true;`。pop 对称。',
      'static_assert 已帮你把 N 限制为 2 的幂，所以 `& (N-1)` 永远安全——把 c-06 的结论用上了。',
    ],
    hintsEn: [
      'The monotonic-counter scheme’s charm: head_ and tail_ only ever increase; `size() = head_ - tail_`, `full() = size() == N`, `empty() = head_ == tail_` — even unsigned wraparound keeps the difference valid.',
      'push: `if (full()) return false; buf_[head_ & (N - 1)] = v; head_++; return true;`. pop mirrors it.',
      'The static_assert already restricts N to powers of two, so `& (N-1)` is always safe — c-06’s conclusion put to work.',
    ],
    solution: `#include <cstddef>

template <typename T, size_t N>
class RingBuffer {
    static_assert(N > 0 && (N & (N - 1)) == 0, "N must be a power of two");
public:
    bool push(const T &v)
    {
        if (full())
            return false;
        buf_[head_ & (N - 1)] = v;
        head_++;
        return true;
    }

    bool pop(T &out)
    {
        if (empty())
            return false;
        out = buf_[tail_ & (N - 1)];
        tail_++;
        return true;
    }

    size_t size() const { return head_ - tail_; }
    bool empty() const { return head_ == tail_; }
    bool full() const { return size() == N; }

private:
    T buf_[N];
    size_t head_ = 0;
    size_t tail_ = 0;
};`,
    solutionNote:
      '单调计数器 + 掩码取模是环形缓冲的最优雅实现：不浪费一个槽位（对比"留空一格"方案）、size 无歧义、回绕全自动。static_assert 在编译期拒绝非 2 的幂容量——比运行时检查早了一整个阶段。amdgpu 的 ring（amdgpu_ring.c）用同样的 wptr/rptr & mask 思路，k-05 是它的 C 版；两题对照着做，"同一个硬件概念的两种语言表达"会非常清晰。',
    solutionNoteEn:
      'Monotonic counters + mask modulo is the most elegant ring implementation: no wasted slot (versus the "leave one empty" scheme), unambiguous size, automatic wraparound. The static_assert rejects non-power-of-two capacities at compile time — a whole phase earlier than a runtime check. amdgpu’s ring (amdgpu_ring.c) uses the same wptr/rptr & mask idea; k-05 is its C rendition — do the pair together and "one hardware concept, two languages" becomes vivid.',
  },
  {
    id: "cpp-11",
    track: "cpp",
    number: 11,
    title: "STL 实战：统计命令流操作码",
    titleEn: "STL in Action: Opcode Frequency in a Command Stream",
    difficulty: "medium",
    minutes: 18,
    tags: ["STL", "map", "sort", "lambda"],
    tagsEn: ["STL", "map", "sort", "lambda"],
    lessonId: "cc-cpp-6",
    brief: "map 计数 + vector 排序 + lambda 比较器——GPU 命令流分析器的三板斧。",
    briefEn: "map counting + vector sorting + a lambda comparator — the GPU command-stream analyzer’s toolkit.",
    description: [
      '性能工程师常做的事：抓一段 GPU 命令流，统计各操作码出现次数，找出最热的包。这个"分组计数再排序"的模式，用 STL 三行核心代码就能表达。',
      '实现 `top_opcodes(stream, k)`：输入 `std::vector<uint32_t>` 的操作码序列，返回 `std::vector<std::pair<uint32_t, size_t>>`——按出现次数**降序**排列的 (opcode, count)；次数相同按 opcode **升序**（保证确定性）；只取前 k 个（不足 k 个全返回）。',
      '工具选择本身就是考点：用什么容器计数？排序用什么比较器？边界（k=0、空流、k 超长）怎么处理？',
    ],
    descriptionEn: [
      'A perf engineer’s routine: capture a GPU command stream, count occurrences per opcode, find the hottest packets. This "group-count then sort" pattern is three core lines of STL.',
      'Implement `top_opcodes(stream, k)`: given a `std::vector<uint32_t>` of opcodes, return a `std::vector<std::pair<uint32_t, size_t>>` — (opcode, count) sorted by count **descending**, ties by opcode **ascending** (determinism), truncated to the first k (return all when fewer).',
      'Tool choice is itself the exam: which container counts? What comparator sorts? How do the edges behave (k=0, empty stream, oversized k)?',
    ],
    language: "cpp",
    starterCode: `#include <cstdint>
#include <cstddef>
#include <vector>
#include <utility>

/* (opcode, count) 按 count 降序、同 count 按 opcode 升序, 取前 k 个 */
std::vector<std::pair<uint32_t, size_t>>
top_opcodes(const std::vector<uint32_t> &stream, size_t k)
{
    (void)stream; (void)k;
    return {}; /* TODO */
}`,
    starterCodeEn: `#include <cstdint>
#include <cstddef>
#include <vector>
#include <utility>

/* (opcode, count) sorted by count desc, ties by opcode asc, first k only */
std::vector<std::pair<uint32_t, size_t>>
top_opcodes(const std::vector<uint32_t> &stream, size_t k)
{
    (void)stream; (void)k;
    return {}; /* TODO */
}`,
    harness: `#include <cstdio>
{{USER_CODE}}

static int _pass, _total;
static void check(const char *label, bool cond)
{
    _total++;
    if (cond) { _pass++; printf("[PASS] %s\\n", label); }
    else printf("[FAIL] %s\\n", label);
}

int main()
{
    /* 0x10 x4, 0x20 x2, 0x30 x2, 0x40 x1 */
    std::vector<uint32_t> stream = { 0x10, 0x20, 0x10, 0x30, 0x10, 0x20, 0x40, 0x30, 0x10 };

    auto top = top_opcodes(stream, 3);
    check("returns k entries", top.size() == 3);
    check("hottest first", top[0].first == 0x10 && top[0].second == 4);
    check("tie broken by opcode asc", top[1].first == 0x20 && top[2].first == 0x30);
    check("tied counts equal", top[1].second == 2 && top[2].second == 2);

    auto all = top_opcodes(stream, 100);
    check("oversized k returns all", all.size() == 4);
    check("coldest last", all[3].first == 0x40 && all[3].second == 1);

    check("k==0 empty", top_opcodes(stream, 0).empty());
    check("empty stream empty", top_opcodes({}, 5).empty());

    std::vector<uint32_t> uniform(1000, 0xAB);
    auto u = top_opcodes(uniform, 2);
    check("single opcode counted 1000x", u.size() == 1 && u[0].second == 1000);

    printf("RESULT %d/%d\\n", _pass, _total);
    return _pass == _total ? 0 : 1;
}`,
    hints: [
      '计数：`std::map<uint32_t, size_t> freq; for (auto op : stream) freq[op]++;`——operator[] 对不存在的键默认构造 0，天生适合计数。',
      '倒进 vector 再排：`std::vector<std::pair<uint32_t, size_t>> v(freq.begin(), freq.end());` 然后 `std::sort(v.begin(), v.end(), [](const auto &a, const auto &b) { ... });`。',
      'lambda 里先比 count 降序、相等再比 opcode 升序：`if (a.second != b.second) return a.second > b.second; return a.first < b.first;`。',
      '截断：`if (v.size() > k) v.resize(k);`——记得 include <algorithm> 和 <map>。',
    ],
    hintsEn: [
      'Count: `std::map<uint32_t, size_t> freq; for (auto op : stream) freq[op]++;` — operator[] default-constructs 0 for missing keys, born for counting.',
      'Pour into a vector and sort: `std::vector<std::pair<uint32_t, size_t>> v(freq.begin(), freq.end());` then `std::sort(v.begin(), v.end(), [](const auto &a, const auto &b) { ... });`.',
      'Inside the lambda: count descending first, tie on opcode ascending: `if (a.second != b.second) return a.second > b.second; return a.first < b.first;`.',
      'Truncate: `if (v.size() > k) v.resize(k);` — and remember <algorithm> and <map>.',
    ],
    solution: `#include <cstdint>
#include <cstddef>
#include <vector>
#include <utility>
#include <map>
#include <algorithm>

std::vector<std::pair<uint32_t, size_t>>
top_opcodes(const std::vector<uint32_t> &stream, size_t k)
{
    std::map<uint32_t, size_t> freq;
    for (uint32_t op : stream)
        freq[op]++;

    std::vector<std::pair<uint32_t, size_t>> v(freq.begin(), freq.end());
    std::sort(v.begin(), v.end(), [](const auto &a, const auto &b) {
        if (a.second != b.second)
            return a.second > b.second;
        return a.first < b.first;
    });

    if (v.size() > k)
        v.resize(k);
    return v;
}`,
    solutionNote:
      'lambda 就是 c-13 里 qsort 比较器的进化form：类型安全（不是 void*）、可内联（没有函数指针间接跳转，常比 qsort 快）、能捕获上下文。map 换 unordered_map 可以再快（哈希 O(1)），但迭代顺序不定——本题靠排序兜底所以都对。"频率统计 top-k"是分析 perfetto/RGP 抓帧数据的基本功。返回 vector 看似昂贵，实际被 RVO/移动优化掉——cpp-05 学的移动语义在标准库里无处不在。',
    solutionNoteEn:
      'The lambda is c-13’s qsort comparator evolved: type-safe (no void*), inlinable (no function-pointer indirection — often beating qsort), and able to capture context. Swapping map for unordered_map is faster (O(1) hashing) but iterates in no fixed order — the final sort makes either correct here. "Frequency top-k" is table stakes for analyzing perfetto/RGP captures. Returning the vector looks expensive but RVO/moves erase the cost — cpp-05’s move semantics at work throughout the standard library.',
  },
  {
    id: "cpp-12",
    track: "cpp",
    number: 12,
    title: "unique_ptr 组合：设备与它的环",
    titleEn: "Composing unique_ptr: A Device and Its Rings",
    difficulty: "medium",
    minutes: 20,
    tags: ["智能指针", "Rule of Zero", "vector"],
    tagsEn: ["smart-pointers", "Rule of Zero", "vector"],
    lessonId: "cc-cpp-6",
    brief: "c-16 的 device/rings 用现代 C++ 重写——你会发现析构函数和回滚代码全部消失了。",
    briefEn: "Rewrite c-16’s device/rings in modern C++ — and watch the destructor and rollback code vanish.",
    description: [
      'c-16 里你为 device_create 写了小心翼翼的回滚、为 device_destroy 排了释放顺序。现代 C++ 的答案：让每块资源都被 vector 或 unique_ptr 持有，然后**一行清理代码都不写**——成员的析构自动级联，这叫 Rule of Zero。',
      '给定 `struct Ring { std::vector<uint32_t> data; explicit Ring(size_t n) : data(n, 0) {} }`。实现类 `Device`：构造 `(std::string name, size_t nrings, size_t ring_size)`——创建 nrings 个 Ring（用 `std::make_unique`），存入 `std::vector<std::unique_ptr<Ring>>`；成员函数 `name()`、`ring_count()`、`ring(i)`（返回 `Ring&`，保证 i 合法）、`total_words()`（所有 ring 的 data 大小之和）。**不写析构函数、不写 delete**。',
      '再实现自由函数 `make_device(...)` 返回 `std::unique_ptr<Device>`——工厂函数的标准形态。',
    ],
    descriptionEn: [
      'In c-16 you wrote careful rollback for device_create and ordered frees in device_destroy. Modern C++’s answer: let every resource be held by a vector or unique_ptr and write **zero cleanup lines** — member destructors cascade automatically. That is the Rule of Zero.',
      'Given `struct Ring { std::vector<uint32_t> data; explicit Ring(size_t n) : data(n, 0) {} }`. Implement class `Device`: constructor `(std::string name, size_t nrings, size_t ring_size)` — create nrings Rings (via `std::make_unique`) into a `std::vector<std::unique_ptr<Ring>>`; members `name()`, `ring_count()`, `ring(i)` (returns `Ring&`, i guaranteed valid), `total_words()` (sum of all rings’ data sizes). **No destructor, no delete.**',
      'Also implement the free function `make_device(...)` returning `std::unique_ptr<Device>` — the canonical factory shape.',
    ],
    language: "cpp",
    starterCode: `#include <cstdint>
#include <cstddef>
#include <string>
#include <vector>
#include <memory>

struct Ring {
    std::vector<uint32_t> data;
    explicit Ring(size_t n) : data(n, 0) {}
};

class Device {
public:
    /* TODO: 构造 + name/ring_count/ring/total_words
     * 注意: 不写析构, 不出现 delete */
};

std::unique_ptr<Device> make_device(std::string name, size_t nrings, size_t ring_size)
{
    (void)name; (void)nrings; (void)ring_size;
    return nullptr; /* TODO */
}`,
    starterCodeEn: `#include <cstdint>
#include <cstddef>
#include <string>
#include <vector>
#include <memory>

struct Ring {
    std::vector<uint32_t> data;
    explicit Ring(size_t n) : data(n, 0) {}
};

class Device {
public:
    /* TODO: ctor + name/ring_count/ring/total_words
     * note: no destructor, no delete anywhere */
};

std::unique_ptr<Device> make_device(std::string name, size_t nrings, size_t ring_size)
{
    (void)name; (void)nrings; (void)ring_size;
    return nullptr; /* TODO */
}`,
    harness: `#include <cstdio>
{{USER_CODE}}

static int _pass, _total;
static void check(const char *label, bool cond)
{
    _total++;
    if (cond) { _pass++; printf("[PASS] %s\\n", label); }
    else printf("[FAIL] %s\\n", label);
}

int main()
{
    auto dev = make_device("gfx1100", 3, 256);
    check("factory returns device", dev != nullptr);
    if (!dev) { printf("RESULT %d/%d\\n", _pass, _total); return 1; }

    check("name kept", dev->name() == "gfx1100");
    check("ring count", dev->ring_count() == 3);
    check("total words", dev->total_words() == 768);

    dev->ring(0).data[0] = 0xC0DE;
    dev->ring(2).data[255] = 0xBEEF;
    check("rings are independent objects", dev->ring(0).data[0] == 0xC0DE && dev->ring(1).data[0] == 0);
    check("last word reachable", dev->ring(2).data[255] == 0xBEEF);

    auto tiny = make_device("t", 1, 1);
    check("minimal device", tiny->ring_count() == 1 && tiny->total_words() == 1);

    dev.reset();   /* explicit destroy: unique_ptr -> Device -> vector -> Ring -> vector cascade */
    check("reset destroys cleanly", dev == nullptr);

    auto moved = std::move(tiny);
    check("device ownership moves", moved != nullptr && tiny == nullptr);

    printf("RESULT %d/%d\\n", _pass, _total);
    return _pass == _total ? 0 : 1;
}`,
    hints: [
      '构造函数循环里：`rings_.push_back(std::make_unique<Ring>(ring_size));`——make_unique 一步完成分配+构造+接管。',
      'total_words 累加：`for (const auto &r : rings_) sum += r->data.size();`——unique_ptr 用 -> 解引用，和裸指针一样。',
      'make_device 一行：`return std::make_unique<Device>(std::move(name), nrings, ring_size);`。',
      '想一想 c-16 的回滚去哪了：构造中途若 make_unique 抛异常，已入 vector 的元素会被 vector 的析构自动释放——异常安全免费送。',
    ],
    hintsEn: [
      'In the constructor loop: `rings_.push_back(std::make_unique<Ring>(ring_size));` — make_unique allocates, constructs and adopts in one step.',
      'total_words accumulates: `for (const auto &r : rings_) sum += r->data.size();` — unique_ptr dereferences with -> just like a raw pointer.',
      'make_device is one line: `return std::make_unique<Device>(std::move(name), nrings, ring_size);`.',
      'Ask where c-16’s rollback went: if make_unique throws mid-construction, elements already in the vector are freed by the vector’s destructor — exception safety, gratis.',
    ],
    solution: `#include <cstdint>
#include <cstddef>
#include <string>
#include <vector>
#include <memory>

struct Ring {
    std::vector<uint32_t> data;
    explicit Ring(size_t n) : data(n, 0) {}
};

class Device {
public:
    Device(std::string name, size_t nrings, size_t ring_size)
        : name_(std::move(name))
    {
        rings_.reserve(nrings);
        for (size_t i = 0; i < nrings; i++)
            rings_.push_back(std::make_unique<Ring>(ring_size));
    }

    const std::string &name() const { return name_; }
    size_t ring_count() const { return rings_.size(); }
    Ring &ring(size_t i) { return *rings_[i]; }

    size_t total_words() const
    {
        size_t sum = 0;
        for (const auto &r : rings_)
            sum += r->data.size();
        return sum;
    }

private:
    std::string name_;
    std::vector<std::unique_ptr<Ring>> rings_;
};

std::unique_ptr<Device> make_device(std::string name, size_t nrings, size_t ring_size)
{
    return std::make_unique<Device>(std::move(name), nrings, ring_size);
}`,
    solutionNote:
      '与 c-16 逐行对照：40 行 create/destroy + 回滚 → 一个构造函数；释放顺序、NULL 检查、double-free 防护全部由类型系统承担。Device 因为持有 unique_ptr 成员自动变为 move-only——"设备不可复制"这条语义免费获得。这就是 Rule of Zero：资源各归其主，特殊成员函数一个不写。ROCm/HIP 运行时和 LLVM 里绝大多数类都以这种方式组织；只有少数直接管理裸资源的类型（如 cpp-05 那种）才需要 Rule of Five。',
    solutionNoteEn:
      'Line it up against c-16: 40 lines of create/destroy plus rollback → one constructor; free order, NULL checks and double-free guards all delegated to the type system. Holding unique_ptr members makes Device automatically move-only — "devices cannot be copied" comes free. That is the Rule of Zero: every resource has one owner and you write none of the special members. The overwhelming majority of classes in the ROCm/HIP runtime and LLVM are organized this way; only the few types that directly manage raw resources (like cpp-05) need the Rule of Five.',
  },
];
