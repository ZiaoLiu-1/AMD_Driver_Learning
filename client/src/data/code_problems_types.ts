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

export type ProblemTrack = "c" | "cpp" | "kernel";
export type ProblemDifficulty = "easy" | "medium" | "hard";

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
    id: "c",
    title: "C 核心",
    titleEn: "C Core",
    description:
      "指针、位操作、结构体、函数指针、内存生命周期——读懂 amdgpu 内核代码必须过硬的 C 基本功。",
    descriptionEn:
      "Pointers, bit ops, structs, function pointers, memory lifetime — the C fundamentals you need to read amdgpu kernel code.",
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
