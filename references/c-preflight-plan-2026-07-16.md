# C Preflight（C 基础热身）实施计划 — 2026-07-16

> 目标：在“第一次写普通 C 函数”和“内核风味 C（现 c-01～c-16）”之间补一段真正可走的坡道。
> 本稿已经完成开工前核算：**32 道题库规格（23 道建议先做 + 8 道可选综合 + 1 道条件上线的 POSIX 题）+ 7 节零基础微课 + 数据模型/UI 方案 + 分阶段实施与发布门禁**。
> 开工时不得自行扩大范围；若题目契约、后端能力或现有脏工作区与本文冲突，先停在对应 Phase 报告。

---

## 1. 定位与教学纪律

### 1.1 这不是第二套“内核 C”

- `c0` 只回答：“我能否独立写出普通 C 函数，遍历数组，处理字符串，并安全管理一块用户态内存？”
- 现有 `c` 轨道保留全部系统/驱动价值，改名为 **C 系统核心 / C Systems Core**。
- `w-01～w-23` 是进入 C 系统核心前的建议基础；`w-24～w-31` 是可选综合练习；`w-32` 是独立 POSIX/Linux Bridge。**不硬锁任何轨道，也不要求熟练用户重做基础题。**
- 前 19 题题面不出现 GPU、寄存器、fence、errno 等背景；桥接信息只放在题解后的“下一站”。

### 1.2 顺序参考（不是“教材数量证明了唯一教学法”）

本计划参考 K.N. King 2nd、K&R 2nd 与 CS50x 的常见先后关系，用作课程设计依据，不把它们表述为实验性证明：

| 阶段 | King | K&R | CS50x |
|---|---|---|---|
| 程序骨架、表达式与 I/O | ch2–4, ch7 | ch1–2 | Week 1 |
| 分支与循环 | ch5–6 | ch3 | Week 1 |
| 函数与数组 | ch8–9 | ch1.6–1.9, ch4 | Week 2 |
| 指针与字符串 | ch11–13 | ch5 | Week 4 |
| 动态内存 | ch17 | ch7.8.5 / ch8 allocator | Week 4–5 |
| POSIX/Linux 接口 | 独立系统层 | ch8 UNIX System Interface | 课程后段 |

硬规则：

1. **一题只新增一个主要 C 语言/库概念。** 综合题可以引入新的算法组织方式，但不得突然引入未教过的 C 语法或所有权契约。
2. **数组先用 `a[]` 语法建立“连续元素 + 下标”直觉，指针课再揭示参数中的数组会退化。**
3. **每个判题契约必须可观察。** 不能出现 `return 0` 空桩也能通过、调用两次却无法证明资源释放的题。
4. **空输入、失败路径和所有权约定必须确定且可移植。** 不依赖 `malloc(0)` 返回非 NULL、固定 4096 就是一页等平台偶然性。
5. **`malloc/free` 属于 C 标准库；`mmap/munmap` 属于 POSIX/Linux。** 二者分课、分阶段、分执行环境标记；某些 libc 分配器可能按策略使用 mmap，但这不是 ISO C 保证。

---

## 2. 产品与数据模型

### 2.1 规模与进度

- 题库最多 32 题：`w-01～w-32`。
- 建议基础：23 题（w-01～w-23），预计纯解题 4～5 小时；按初学者阅读、试错与笔记计算约 5～7 小时。
- 可选综合：8 题（w-24～w-31）；不作为进入 `c` 轨道的前置文案。
- POSIX Bridge：w-32，仅在 Phase 0 双后端探针与可观察 harness 都通过时上线。
- 已拍板：所有实际上线的题计入 **Code Lab 进度**。w-32 上线时总数 72，否则 71；总数必须从 `problems.length` 派生，禁止把它称为“全站进度”。
- 保留各轨/各阶段进度，让已有 40 题完成者仍能看到原轨道完成状态；新增题不得清空或改写旧 localStorage 数据。

### 2.2 轨道、阶段与难度

新增：

```ts
type ProblemTrack = "c0" | "c" | "cpp" | "kernel";
type ProblemDifficulty = "warmup" | "easy" | "medium" | "hard";

type WarmupStage =
  | "function-io"
  | "branch"
  | "loop"
  | "array"
  | "pointer-string"
  | "heap"
  | "practice"
  | "posix";

type ProblemNextStep =
  | { kind: "problem"; id: string }
  | { kind: "lesson"; moduleId: string; lessonId: string };
```

`CodeProblem` 新增：

```ts
warmupStage?: WarmupStage;       // c0 必填，其他轨道不得填写
nextSteps?: ProblemNextStep[];   // 允许多个、可区分题目与跨模块微课
```

约束：

- 所有 c0 题使用 `difficulty: "warmup"`，显示中性“热身 / Preflight”徽章，不伪装成 Easy。
- 列表/详情对 warmup 走独立 badge 分支，不能直接用 `interviewDifficultyTones[problem.difficulty]` 索引；现有 easy/medium/hard 映射保持原样。
- 难度筛选增加 Warmup；选择 Easy/Medium/Hard 时 c0 不出现空壳轨道。
- 阶段是数据字段和真实标题层级，不塞进 tags。列表结构为 `h2 轨道 → h3 阶段 → h4 题目`。
- c0 不得平铺 32 张卡；阶段必须显示阶段进度、建议顺序与“可选”标记。
- 难度筛选下方增加四轨可键盘访问的页内跳转；熟练用户能直接到 C Systems/C++/Kernel，不必在移动端滚过 32 张热身卡。跳转不隐藏轨道内容，也不承担进度状态。
- 主 CTA 仍是“下一道当前序列题”；`nextSteps` 是次级“进阶练习/相关微课”，避免出现两个同权“下一步”。
- 列表分组与图标不得继续硬编码 `{c, cpp, kernel}`：从 `problemTracks` 初始化分组；补 `c0` 图标（建议 `ListChecks`，避免玩具化 Sprout）。

### 2.3 现轨道重定位

- `C 核心` → **C 系统核心 / C Systems Core**。
- 门槛文案改成能力描述，而不是“一学期经验”：“建议先完成 C 基础热身 w-01～w-23，或已能独立写函数、循环、数组、字符串及 malloc/free。”
- 不改现有 problem id，避免破坏进度。正式 C 轨列表按微课阶段分组/推荐顺序呈现：

```text
c-02～06 → c-07～08 → c-01,c-09,c-10 → c-11～12 → c-15～16 → c-13～14
```

### 2.4 下一站与微课关联

- 每道 warmup 必须填写有效 `lessonId`（当前教学微课）。
- `nextSteps` 只能指向题库真实 id，或 `{moduleId, lessonId}` 都真实存在的微课。
- w-32 的正确进阶目标是 GPU 内存课 `moduleId: "4", lessonId: "4-2-1"`，不是位操作课 `cc-kernel-1`。

---

## 3. 新微课组：0.7.0「C 从零起步」（7 节）

置于 0.7.1 之前。0.7.1 描述改为“系统性复习：如果下列词第一次见，请先回到 0.7.0”。新增后本模块为 **26 节微课**，`estimatedHours: 56 → 64`。

| 课 | 标题 | 内容边界 | 配套题 |
|---|---|---|---|
| cc-c0-1 | 第一段 C：函数、变量、return 与 printf | `#include`、普通函数、参数/返回值、声明/初始化/赋值、`main` 只作运行入口；printf 的 `%d/%f/%s/%c`、换行与返回值直觉 | w-01, w-04 |
| cc-c0-2 | 表达式、类型与转换 | 算术/比较/逻辑/取余；整型除法；隐式/显式转换；`<stdbool.h>` 的 `bool/true/false`；位运算只在 w-30 前给最短桥接 | w-02～03 |
| cc-c0-3 | 分支与循环 | if/else、switch；for/while/do；break/continue；off-by-one 与 0 次循环 | w-05～10 |
| cc-c0-4 | 数组、值传递与长度参数 | 数组声明、下标、遍历、越界意识；值传递；参数写 `a[]` 的教学表象；为什么仍需显式 n | w-11～15 |
| cc-c0-5 | 指针与 C 字符串 | `&`/`*`、非 NULL 前置、通过指针修改；参数数组退化；`char[]` 与 `\0`；`size_t` 直觉；一小段 `T **` 为 w-23 铺垫 | w-16～19 |
| cc-c0-6 | 堆内存与所有权 | malloc/calloc/realloc/free；失败返回；`free(NULL)`；调用方/被调用方所有权；realloc 临时指针与失败原状态 | w-20～23 |
| cc-c0-7 | POSIX Bridge：页、mmap 与 munmap | 与 ISO C 分层；`sysconf(_SC_PAGESIZE)`、MAP_FAILED、映射长度/权限/flags、成功映射必须 munmap；禁止把匿名映射说成真实 MMIO | w-32（条件上线） |

每节沿用六段结构（Concept/Diagram/CodeWalk/MiniLab/Debug/InterviewQ），但按零基础语气：术语首次出现必须定义；MiniLab 深链到 Code Lab，不再要求用户先创建本地目录。中英文课的段落数、key points 和顺序必须严格一致。

---

## 4. 32 道题冻结规格

通用约束：C11；题面/提示/起始代码双语；starter 中英去注释后逐字一致；单概念题目标代码 3～20 行，综合题可到 35 行；所有未明确接收 NULL 的指针均保证非 NULL。

### 阶段 0 · 函数、表达式与 I/O（建议先做）

- **w-01 三数之和**｜`int add3(int a, int b, int c)`｜保证数学结果能装入 int；正/负/零组合｜5 min｜lesson cc-c0-1。
- **w-02 摄氏转华氏**｜`double c2f(double c)`｜使用 `c * (9.0 / 5.0) + 32`；明确陷阱是 `c * (9 / 5)` 中括号内先做整除，不错误暗示 `c*9/5` 也会整除｜用 epsilon 判 0、100、-40、37，不做 double 精确相等｜7 min｜lesson cc-c0-2。
- **w-03 判断偶数**｜`bool is_even(int n)`｜只练 `%` 与 `<stdbool.h>`，覆盖负偶数/负奇数/0｜5 min｜lesson cc-c0-2。
- **w-04 打印一行加法**｜`void print_sum(int a, int b)`｜精确输出 `2 + 3 = 5\n`，只练 printf 占位符和换行｜harness 在 USER_CODE 周围用可控 `lab_printf`/宏捕获，随后 `#undef printf` 再打印判题协议；空函数不能过｜7 min｜lesson cc-c0-1；此处不直接跳 c-01，先补完数组/字符串与缓冲区。

### 阶段 1 · 分支（建议先做）

- **w-05 两数取大**｜`int max2(int a, int b)`｜a>b/a<b/a==b/负数｜5 min｜lesson cc-c0-3。
- **w-06 区间夹取**｜`int clamp_int(int v, int lo, int hi)`，保证 lo<=hi｜低/中/高/边界｜5 min｜lesson cc-c0-3，下一站 cpp-01。
- **w-07 符号函数**｜`int sign(int n)` → -1/0/1｜完整三分支｜5 min｜lesson cc-c0-3。

### 阶段 2 · 循环（建议先做）

- **w-08 1 加到 n**｜`long sum_to(int n)`，保证 n>=0 且结果可装入 long｜0/1/10/10000｜5 min。
- **w-09 数位个数**｜`int count_digits(int n)`，保证 n>=0；0→1 位｜0/7/10/99999｜7 min。
- **w-10 整数幂**｜`long power_int(int base, int exp)`，exp>=0、结果不溢出；约定 0^0=1｜正负 base、exp0｜7 min｜后续 c-06 仅作可选桥，不声称同构。

### 阶段 3 · 数组（建议先做）

本阶段题面签名使用 `a[]`，避免在指针课前把显示语法变成障碍；题解再说明函数参数中的 `a[]` 与指针参数等价。n 均保证非负。

- **w-11 数组求和**｜`long array_sum(const int a[], int n)`｜n0→0；单元素/负数｜5 min。
- **w-12 数组最大值**｜`int array_max(const int a[], int n)`，n>=1｜首元素初始化；全负/递增/单元素｜7 min。
- **w-13 统计正数**｜`int count_positive(const int a[], int n)`｜混合/全负/n0｜5 min｜下一站 c-03。
- **w-14 原地反转**｜`void reverse_ints(int a[], int n)`｜奇/偶/单/空；完整逐字节数组比对｜8 min。
- **w-15 线性查找**｜`int find_first(const int a[], int n, int target)` → 首个下标或 -1｜头/尾/重复/未命中｜5 min。

### 阶段 4 · 指针与字符串（建议先做）

- **w-16 指针交换**｜`void swap_ints(int *a, int *b)`｜常规与自交换；参数保证非 NULL｜5 min｜下一站 cpp-01 引用版。
- **w-17 手写长度**｜`size_t my_strlen(const char *s)`｜空串/单字符/长串；明确标准 strlen 返回 size_t｜5 min｜下一站 c-09。
- **w-18 统计字符**｜`int count_char(const char *s, char c)`｜约定 c=='\0' 返回 0；空串/多匹配｜5 min。
- **w-19 字符串相等**｜`bool str_equal(const char *a, const char *b)`｜相等/前缀/空对空/空对非空｜7 min｜下一站 c-01、c-09；不错误桥到 c-07。

### 阶段 5 · 动态内存（建议先做）

本阶段 harness 在系统头加载后用 tracked allocator/宏让学员仍书写 `malloc/calloc/realloc/free`，同时支持定点失败与调用计数；不能靠真实 OOM 或 macOS LeakSanitizer 来证明失败路径。返回给调用方的成功分配由 harness 释放并核对配平。

- **w-20 造一个数组**｜`int *make_range(int n)`｜保证 0<=n<=1024；n==0 确定返回 NULL，n>0 分配 `{0..n-1}`；调用方 free｜8 min。
- **w-21 一块清零内存**｜`int *make_zeroes(int n)`｜保证 0<=n<=1024；n==0→NULL；n>0 必须调用 tracked calloc，harness 检查 calloc 调用、全零与最终 free｜7 min｜真正覆盖 calloc，不只在提示提及。
- **w-22 复制数组**｜`int *dup_ints(const int src[], int n)`｜保证 0<=n<=1024 且 n>0 时 src 有效；n0→NULL；内容独立、调用方 free；注入分配失败必须返回 NULL｜8 min｜下一站 c-08。
- **w-23 只练安全 realloc**｜`int grow_to(int **arr, int old_n, int new_n)`｜保证 `arr && *arr`、0<=old_n<new_n<=2048；成功返回0、更新 `*arr` 并把新增区清0；失败返回 -ENOMEM 且 `*arr` 与旧内容不变｜starter 提供不可绕过的 `mem_realloc` 失败注入；用临时指针｜12 min｜下一站 c-15。

### 阶段 6 · 可选综合练习（不作为进入 C Systems Core 的前置）

这些题不新增 C 语法/库；可以引入算法组织方式。列表和进度必须明确标“可选”。只采用通用算法概念，题面、示例、提示、测试与题解必须原创，不复制 LeetCode 或其他题库的表达与用例编排。

- **w-24 两数之和**｜`bool two_sum(const int a[], int n, int target, int *i, int *j)`，0<=n<=100｜暴力 O(n²)；有多解时接受任意满足 `0<=i<j<n` 且以 `long long` 宽化后和为 target 的一组；无解不改输出；canary 验证｜12 min｜下一站 c-07。
- **w-25 移零到尾**｜`void move_zeroes(int a[], int n)`，n>=0｜保持非零相对顺序；全零/无零/交错；完整数组与边界 canary 一并比较｜12 min。
- **w-26 合并有序数组**｜`void merge_sorted(const int a[], int na, const int b[], int nb, int dest[])`｜na/nb>=0，输入升序，dest 容量保证 na+nb，三者不重叠；空输入使用有效 dummy 指针；一边为空/交错；dest 外有 canary｜12 min。
- **w-27 二分查找**｜`int bsearch_int(const int a[], int n, int target)`｜n>=0、升序数组；重复值时任一真实命中均可，未命中返回 -1；空/单/两端/重复/未命中｜12 min｜题解讲 `lo+(hi-lo)/2`，但不设置现实数组无法触发的 `(lo+hi)/2` 溢出 mutant。
- **w-28 回文判断**｜`bool is_palindrome(const char *s)`｜严格逐字符；空/单字符 true｜10 min。
- **w-29 有序去重**｜`int dedup_sorted(int a[], int n)`，n>=0、输入升序｜返回新长度，仅 `[0,new_n)` 前缀有效，尾部内容 unspecified 且 harness 不检查；全同/无重复/空｜12 min。
- **w-30 只出现一次的数**｜`int single_number(const int a[], int n)`｜n 为正奇数；恰一个值出现一次，其余每个值各出现两次；覆盖负数｜在题面先给 XOR 三条最小规则，明确这是位操作桥接而非“无新概念”｜10 min｜下一站 c-04。
- **w-31 大数加一**｜`int plus_one(int digits[], int n, int capacity)`｜n>=1、capacity>=n、每位0..9；容量足够时从 index0 写结果并返回新长度；全9且 capacity<n+1 时返回 -1 且整个数组不变｜无进位/连续9/全9成功与失败；前后 canary｜15 min｜可选桥到 c-11，不声称同构。

### POSIX Bridge · w-32（条件上线、可选）

- **w-32 一页匿名内存**｜`int page_roundtrip(void)`。
- 获取页长：`long raw = sysconf(_SC_PAGESIZE)`，校验 `raw > 0` 后转 size_t；禁止硬编码 4096 并称其为“一页”。
- 调用匿名 `mmap` 获取一页可读写内存，检查 `MAP_FAILED`，写满 0xAB，逐字节校验，最后 `munmap`；任一步失败返回 -1，成功返回 0。
- harness 必须把真实 mmap/munmap 包在 `tracked_mmap/tracked_munmap` 中，并在 USER_CODE 生效范围内用宏拦截：统计 map/unmap/outstanding 次数；`tracked_munmap` 在真实解除映射前检查长度与 0xAB 图案；注入一次 mmap 失败验证 MAP_FAILED 分支。空桩、漏 munmap、只判 NULL 都必须失败或崩溃。
- `_DEFAULT_SOURCE` 必须位于整个组装源文件最顶部、任何系统头之前；harness 负责包含 `<sys/mman.h>` 与 `<unistd.h>`，避免用户 include 顺序破坏 feature macro。
- 桥接：`{ kind:"lesson", moduleId:"4", lessonId:"4-2-1" }`（GEM/TTM），并明确匿名映射不是 PCI BAR/MMIO。

---

## 5. w-32 双后端 Phase 0

**先探针、再冻结 71/72、ID 范围与文案；不能写完题库后再决定。**

1. 新增一次性/可复用脚本，分别直连 Godbolt `cg142` 与 Wandbox `gcc-13.2.0-c`；不能只调用当前 `runCode()`，因为它在 Godbolt 成功时不会走 fallback。
2. 探针使用 w-32 最终 feature macro、sysconf、tracked wrapper 与两次调用路径，而不只是裸 mmap 一次。
3. 保存编译器 id、UTC 时间、exit code、stdout/stderr 到本文档附录或验收报告；不要求截图。
4. 两个后端都通过：保留 w-32，冻结 32/72。
5. 任一后端失败：删除 w-32，冻结 31/71；保留 cc-c0-7 的概念与本地 MiniLab。不得做“在某些用户机器上随机失败”的线上题。

---

## 6. 分阶段实施（Fable5 开工顺序）

### Phase 0：决策冻结

- 执行 §5 双后端探针，冻结 w-32 与最终计数。
- `git status` 建立本轮文件白名单；明确排除 `.gitignore`、admin-portal、GPU Stack Explorer、showcase 及其他用户未提交内容。
- 从最新合适基线创建隔离分支；不得把本地分叉 main 的无关提交带入。

### Phase 1：两道样题打通全链路

- 完成数据模型、c0 轨元数据、warmup 徽章/筛选、阶段分组、nextSteps、进度白名单。
- 先只接入 w-01（最简单）与 w-23（失败注入最复杂）两题。
- 写结构、存储迁移、筛选、路由、nextSteps 与双语测试；浏览器验证后再批量铺题。

### Phase 2：建议基础题与 7 节微课

- 按阶段提交 w-01～w-23，逐阶段运行参考解与 ASan+UBSan（平台支持范围内），不积到最后一次排错。
- 插入 cc-c0-1～7 中英微课；0.7.1 改“复习”定位；模块文案更新为 26 节、71/72 题、64 小时。
- 所有题 lessonId、warmupStage、nextSteps 同步完成，不留“最后补链接”的债。

### Phase 3：可选综合与 POSIX

- 接入 w-24～w-31。
- Phase 0 通过才接入 w-32 最终 harness；新增 w-32 资源计数与失败路径 mutant。

### Phase 4：性能、可访问性与发布门禁

- 测量构建前后 Code Lab 路由及题库 chunks 的 raw/gzip 变化。若新增内容显著拖慢列表首屏，先拆轻量 catalog 与详情懒加载，不能把 32 份 harness/solution 无条件塞入初始 app chunk。
- 完成 §8 全部门禁后才允许 commit/push；遵循仓库 `BRANCH_STRATEGY.md`。

---

## 7. 实施文件清单

| 范围 | 事项 |
|---|---|
| 类型 | `ProblemTrack` 加 c0；`ProblemDifficulty` 加 warmup；增加 WarmupStage/ProblemNextStep/warmupStage/nextSteps |
| 题库 | 新建 `code_problems_warmup.ts`；index 懒加载；每题完整双语、lessonId、stage、nextSteps |
| 难度组件 | 改造 `difficulty-badge`（或等价集中组件），为 warmup 提供显式分支、双语标签与 AA 对比度；不得让页面各自临时拼样式 |
| 列表 UI | 动态初始化四轨与 icon；Warmup 筛选；四轨页内跳转；c0 阶段分组/进度/可选标记；无空轨道 |
| 详情 UI | Warmup 独立徽章（不索引现有 difficulty tone map）；相关微课；成功后的主“下一题”与次级 nextSteps；移动端不溢出 |
| 进度 | ID 规则加入 w-01～最终上限；保留 v1 key；旧 c/cpp/k 状态与空字符串代码恢复测试 |
| 微课/模块 | 中英加入 0.7.0 七课；0.7.1 改复习；更新 subModules、26 课、64h、71/72 题与首页文案 |
| i18n | warmup、阶段名、建议/可选、继续热身、进阶练习、筛选与本地化 aria-label |
| 验证脚本 | 动态文案不再写死 40；加载新题；所有参考解 plain + ASan/UBSan（平台支持范围内）；新增 mutants 与可选后端探针脚本 |
| 测试 | 四轨数量、唯一 id/number、stage、warmup 难度、双语、lesson/nextSteps 目标、存储范围、旧进度保留 |

特别注意：当前 `CodeLabPage.tsx` 的 `byTrack` 与 `trackIcons`、详情页难度徽章都是三轨/三难度硬编码，**不是“加数据自动生效”**，必须显式改造。

---

## 8. 验收门禁

### 8.1 数据与内容

- 最终数量严格为 72（含 w-32）或 71（砍 w-32）；轨道顺序为 c0/c/cpp/kernel。
- c0 每题必须：`difficulty=warmup`、合法 stage、合法 lessonId、双语字段完整、starter 中英结构一致。
- nextSteps 的题目与跨模块微课目标全部真实存在；w-32 只能桥到正确 GPU 内存内容。
- 中英新增课组：7/7 课程、段落/key point 顺序与数量一致；英文 starter/tags/harness/solution CJK 为零。
- 定向扫描并更新产品语境中的旧数字 19/40/56；不得机械替换 Radar、历史资料或代码常量。
- 教材/题解不得声称 malloc(0) 必然非 NULL、4096 永远是一页、malloc 必然由 mmap 实现。
- 通用算法题的题面、示例、提示、测试与题解均为原创表达；不得复制外部题库文本或其独特用例序列。

### 8.2 判题与变异

- 全部 71/72 参考解：本地普通 + ASan 双跑，并在可用平台增加 UBSan；全编译、全测试、exit 0、有效 RESULT。macOS 无 LeakSanitizer 的路径继续由 tracked allocator/canary 补齐。
- 现有 11 个 mutants 继续全部被击杀；新增至少：
  1. w-14 反转右下标 off-by-one（ASan 或全量比对击杀）；
  2. w-23 直接覆盖 `*arr` 的 realloc 失败腐化；
  3. w-27 错误边界/不推进导致漏判或死循环（不使用不可现实触发的 mid overflow）；
  4. w-32（若上线）漏 munmap 或只判 NULL。
- w-04 输出必须由 harness 捕获并精确比对；w-02 浮点使用容差；w-24 失败不改输出用 canary；w-32 空桩不可通过。
- 所有新题走真实 Godbolt GNU 路径；Wandbox 至少做代表性 smoke，w-32 必须双后端全契约通过。

### 8.3 工程与浏览器

- `pnpm install --frozen-lockfile`
- `pnpm check`
- `pnpm test`
- `pnpm build`
- `pnpm diagrams:check`
- `pnpm verify:problems`
- `git diff --check`
- 浏览器矩阵：中/英 × 深/浅 × 390px/桌面；列表和详情无横向溢出；44px 触控目标；焦点环、键盘筛选/轨道跳转、标题层级、读屏名称正确；徽章不只靠颜色表达。若实现阶段折叠，还必须满足 Esc/Tab 退出与 `aria-expanded`。
- 进度回归：旧 c/cpp/k 状态与保存代码不丢；空字符串仍可恢复；新增 stage/track 不允许伪造 id 注水。
- 报告 build 前后题库 chunk 大小；确认 warmup 内容仍在 Code Lab 懒加载边界内，未进入首页初始 chunk。

---

## 9. 冻结决策

1. **题库规模**：最多 32；建议基础 23 + 可选综合 8 + 条件 POSIX 1。
2. **进入正式 C 的建议口径**：w-01～w-23，不再写“先做完 w-01～w-32”。
3. **进度**：实际上线题全部计入 Code Lab 进度，但各轨/阶段完成度必须保留，避免旧用户只看到比例下降。
4. **难度**：c0 使用独立 `warmup` level/徽章/筛选，不参与 Easy/Medium/Hard。
5. **mmap**：Phase 0 双后端最终 harness 任一失败即砍 w-32；不降级成不稳定线上题。
6. **现有题**：不改 id、不降内容；只改轨道名称、门槛文案、推荐分组/顺序。
7. **提交**：本计划不授权夹带无关工作区文件；所有发布动作等待完整门禁与用户下一步指令。

## 10. Fable5 开工交付格式

每个 Phase 完成时必须报告：

- 实际改动文件白名单；
- 已完成题/课 id；
- 本阶段命令与精确通过数量；
- 尚未执行或被环境阻塞的门禁；
- 是否产生产品计数、数据模型或题目契约偏差。

最终交付必须逐条对应 §8，不接受只写“测试通过”。

---

## 附录 A：Phase 0 双后端探针记录

执行命令：`node scripts/probe-mmap-backends.mjs`
UTC 时间：`2026-07-16T22:12:47.281Z`

| 后端 / 编译器 | HTTP | build code | exit code | stderr | 结果 |
|---|---:|---:|---:|---|---|
| Godbolt `cg142`（x86-64 GCC 14.2，C） | 200 | 0 | 0 | 空 | PASS |
| Wandbox `gcc-13.2.0-c` | 200 | 0 | 0 | 空 | PASS |

两端 stdout 相同：

```text
[PASS] first roundtrip returns 0
[PASS] second roundtrip (reusable)
[PASS] mmap used queried page length
[PASS] map/unmap balanced
[PASS] munmap saw the 0xAB pattern
[PASS] munmap length matched map length
[PASS] injected MAP_FAILED handled
[PASS] no leak after injected failure
[PASS] every call queried _SC_PAGESIZE
RESULT 9/9
```

冻结结论：**双后端均通过，保留 w-32；C Preflight 冻结为 32 题，Code Lab 总数冻结为 72 题。** w-32 使用与探针同形的 feature macro、tracked sysconf/mmap/munmap、真实页长约束、安全错误长度清理、整页图案检查、失败注入与资源配平 harness，并加入对应 mutation regression。
