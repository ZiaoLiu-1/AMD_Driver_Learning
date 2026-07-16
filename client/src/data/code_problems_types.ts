/* ============================================================
   Code Lab — problem type definitions
   LeetCode-style exercises with a kernel/driver flavor.
   Bilingual inline (zh primary + *En fields), following the
   labs.ts convention.

   Harness protocol: the harness contains `{{USER_CODE}}` where
   the learner's code is substituted, plus a main() that prints
     [PASS] label / [FAIL] label (detail)
   lines and a final `RESULT passed/total` trailer, exiting
   non-zero when any check fails. See lib/judge.ts.
   ============================================================ */

export type ProblemTrack = "c0" | "c" | "cpp" | "kernel";
export type ProblemDifficulty = "warmup" | "easy" | "medium" | "hard";

/** Teaching stage for the c0 (C Preflight) track. Order matters. */
export type WarmupStage =
  | "function-io"
  | "branch"
  | "loop"
  | "array"
  | "pointer-string"
  | "heap"
  | "practice"
  | "posix";

/** Secondary "next step" pointers rendered after a problem is solved. */
export type ProblemNextStep =
  | { kind: "problem"; id: string }
  | { kind: "lesson"; moduleId: string; lessonId: string };

export interface CodeProblem {
  id: string;
  track: ProblemTrack;
  /** Display order within the track. */
  number: number;
  title: string;
  titleEn: string;
  difficulty: ProblemDifficulty;
  /** Estimated solve time in minutes. */
  minutes: number;
  tags: string[];
  /** English tag labels (same order as tags). */
  tagsEn: string[];
  /** Micro-lesson this problem drills, e.g. "cc-c-3" (deep-link target). */
  lessonId?: string;
  /** c0 problems MUST set this; other tracks must NOT. */
  warmupStage?: WarmupStage;
  /** Optional follow-up drills/lessons (secondary CTA, never the primary "next"). */
  nextSteps?: ProblemNextStep[];
  /** One-line teaser for list cards. */
  brief: string;
  briefEn: string;
  /** Problem statement paragraphs. `inline code` in backticks is rendered monospace. */
  description: string[];
  descriptionEn: string[];
  /** Language the judge compiles with. */
  language: "c" | "cpp";
  /** What the learner starts from (shown in the editor). */
  starterCode: string;
  /** English-locale starter (identical code, English comments). */
  starterCodeEn: string;
  /** Full compilable program with {{USER_CODE}} placeholder + checks. Viewable in the UI. */
  harness: string;
  hints: string[];
  hintsEn: string[];
  /** Reference solution (drop-in replacement for starterCode). */
  solution: string;
  solutionNote: string;
  solutionNoteEn: string;
}

export interface ProblemTrackMeta {
  id: ProblemTrack;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  icon: string;
  /** Accent tone used on track headers. */
  tone: "success" | "info" | "warning";
}

export const problemTracks: ProblemTrackMeta[] = [
  {
    id: "c0",
    title: "C 基础热身",
    titleEn: "C Preflight",
    description:
      "从第一个函数开始：表达式、分支循环、数组、指针字符串、堆内存——每题只练一个新概念，为进入 C 系统核心铺路。已有 C 经验可直接跳过。",
    descriptionEn:
      "Start from your first function: expressions, branches & loops, arrays, pointers & strings, heap memory — one new concept per problem, paving the way into C Systems Core. Skip freely if you already write C.",
    icon: "ListChecks",
    tone: "info",
  },
  {
    id: "c",
    title: "C 系统核心",
    titleEn: "C Systems Core",
    description:
      "指针、位操作、结构体、函数指针、内存生命周期——读懂 amdgpu 内核代码必须过硬的 C 基本功。建议先完成 C 基础热身 w-01~w-23，或已能独立写函数、循环、数组、字符串及 malloc/free。",
    descriptionEn:
      "Pointers, bit ops, structs, function pointers, memory lifetime — the C fundamentals you need to read amdgpu kernel code. Recommended after C Preflight w-01~w-23, or if you can already write functions, loops, arrays, strings and malloc/free on your own.",
    icon: "Terminal",
    tone: "success",
  },
  {
    id: "cpp",
    title: "C++ 核心",
    titleEn: "C++ Core",
    description:
      "RAII、拷贝/移动、虚函数、模板、STL——读懂 Mesa / ROCm / LLVM 用户态栈的 C++ 核心。",
    descriptionEn:
      "RAII, copy/move, virtual dispatch, templates, STL — the C++ core for reading the Mesa / ROCm / LLVM userspace stack.",
    icon: "Braces",
    tone: "info",
  },
  {
    id: "kernel",
    title: "内核惯用法",
    titleEn: "Kernel Idioms",
    description:
      "container_of、侵入式链表、kref、环形缓冲、goto 清理、ioctl 编码——把内核套路移植到用户态亲手实现。",
    descriptionEn:
      "container_of, intrusive lists, kref, ring buffers, goto cleanup, ioctl encoding — kernel patterns ported to userspace so you can implement them hands-on.",
    icon: "Cpu",
    tone: "warning",
  },
];

/** Visible teaching groups for the C Systems track. Their order is the
    recommended solve sequence; ids remain stable for saved progress. */
export interface CSystemsStageMeta {
  id: string;
  title: string;
  titleEn: string;
  problemIds: string[];
}

export const cSystemsStages: CSystemsStageMeta[] = [
  {
    id: "integers-bits",
    title: "阶段 1 · 整数与位操作",
    titleEn: "Stage 1 · Integers & Bit Operations",
    problemIds: ["c-02", "c-03", "c-04", "c-05", "c-06"],
  },
  {
    id: "pointers-structs",
    title: "阶段 2 · 指针与结构体",
    titleEn: "Stage 2 · Pointers & Structs",
    problemIds: ["c-07", "c-08"],
  },
  {
    id: "formatting-strings",
    title: "阶段 3 · 格式化与安全字符串",
    titleEn: "Stage 3 · Formatting & Safe Strings",
    problemIds: ["c-01", "c-09", "c-10"],
  },
  {
    id: "representation-serialization",
    title: "阶段 4 · 内存表示与序列化",
    titleEn: "Stage 4 · Memory Representation & Serialization",
    problemIds: ["c-11", "c-12"],
  },
  {
    id: "allocation-lifetime",
    title: "阶段 5 · 动态内存与生命周期",
    titleEn: "Stage 5 · Dynamic Memory & Lifetime",
    problemIds: ["c-15", "c-16"],
  },
  {
    id: "callbacks-polymorphism",
    title: "阶段 6 · 函数指针与多态",
    titleEn: "Stage 6 · Function Pointers & Polymorphism",
    problemIds: ["c-13", "c-14"],
  },
];

/** Flat form used by next-problem navigation and stable ordering helpers. */
export const cSystemsRecommendedOrder: string[] = cSystemsStages.flatMap(
  (stage) => stage.problemIds,
);

/** Stage metadata for the c0 track (titles double as section headings). */
export interface WarmupStageMeta {
  id: WarmupStage;
  title: string;
  titleEn: string;
  /** true = clearly marked optional (practice/posix). */
  optional?: boolean;
}

/** Lightweight c0 stage metadata. Keep this beside the shared types so the
    list route never has to import the full warmup problem bank. */
export const warmupStages: WarmupStageMeta[] = [
  {
    id: "function-io",
    title: "阶段 0 · 函数、表达式与输出",
    titleEn: "Stage 0 · Functions, Expressions & Output",
  },
  { id: "branch", title: "阶段 1 · 分支", titleEn: "Stage 1 · Branches" },
  { id: "loop", title: "阶段 2 · 循环", titleEn: "Stage 2 · Loops" },
  { id: "array", title: "阶段 3 · 数组", titleEn: "Stage 3 · Arrays" },
  {
    id: "pointer-string",
    title: "阶段 4 · 指针与字符串",
    titleEn: "Stage 4 · Pointers & Strings",
  },
  {
    id: "heap",
    title: "阶段 5 · 堆内存与所有权",
    titleEn: "Stage 5 · Heap Memory & Ownership",
  },
  {
    id: "practice",
    title: "阶段 6 · 综合练习（可选）",
    titleEn: "Stage 6 · Practice (Optional)",
    optional: true,
  },
  {
    id: "posix",
    title: "POSIX Bridge（可选）",
    titleEn: "POSIX Bridge (Optional)",
    optional: true,
  },
];
