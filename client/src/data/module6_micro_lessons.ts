// ============================================================
// AMD Linux Driver Learning Platform - Module 6 Micro-Lessons
// Module 6: Debugging & Profiling (调试与性能分析)
// 5 lessons in 2 groups, ~15-20 min each, total ~50h curriculum
// ============================================================
import type { MicroLessonModule } from './micro_lesson_types';

export const module6MicroLessons: MicroLessonModule = {
  moduleId: 'debugging',
  groups: [
    // ════════════════════════════════════════════════════════════
    // Group 6.1: Kernel Debugging Tools (内核调试工具链)
    // ════════════════════════════════════════════════════════════
    {
      id: '6-1',
      number: '6.1',
      title: '内核调试工具链',
      titleEn: 'Kernel Debugging Tools',
      icon: 'Wrench',
      description: '掌握 Linux 内核和 amdgpu 驱动的核心调试手段：printk 日志系统、动态调试、ftrace 内核追踪、perf 和 rocprof 性能分析。这些工具是 AMD 驱动工程师每天使用的"武器库"。',
      lessons: [
        // ── Lesson 6.1.1 ──────────────────────────────────────
        {
          id: '6-1-1',
          number: '6.1.1',
          title: 'printk、动态调试与 debugfs',
          titleEn: 'printk, Dynamic Debug & debugfs',
          duration: 20,
          difficulty: 'advanced',
          tags: ['printk', 'dynamic-debug', 'debugfs', 'DRM_DEBUG', 'dmesg'],
          concept: {
            summary: 'printk 是内核中最基本的调试手段——它将消息写入内核环形缓冲区，通过 dmesg 可以读取。amdgpu 驱动使用 DRM_DEBUG 宏族和动态调试（dynamic debug）实现精细的日志控制，而 debugfs 提供了运行时检查 GPU 内部状态的文件系统接口。',
            explanation: [
              'printk 是内核的 printf，但它不输出到终端，而是写入一个固定大小的环形缓冲区（默认 128KB-1MB）。每条消息有一个日志级别（0-7）：KERN_EMERG(0) 最高优先级，KERN_DEBUG(7) 最低。内核的 console_loglevel 参数决定哪些级别的消息会输出到控制台。amdgpu 驱动使用 pr_info()、pr_err()、pr_debug() 等便捷宏，它们会自动添加模块名前缀。',
              'DRM 子系统有自己的日志体系：DRM_DEBUG_DRIVER()、DRM_DEBUG_KMS()、DRM_DEBUG_ATOMIC() 等宏。这些宏的输出受 drm.debug 模块参数控制——这是一个位掩码：bit 1 = CORE，bit 2 = DRIVER，bit 4 = KMS，bit 5 = PRIME，bit 6 = ATOMIC，bit 8 = LEASE。例如设置 drm.debug=0x1e 会开启 DRIVER + KMS + ATOMIC 的调试输出。在 amdgpu 代码中，DRM_DEBUG_DRIVER() 是最常用的调试宏，用于打印驱动内部逻辑信息。',
              '动态调试（dynamic debug）是 Linux 内核的强大特性，允许在运行时按模块、文件、函数或行号精确开关 pr_debug() 和 dev_dbg() 输出。通过写入 /sys/kernel/debug/dynamic_debug/control 来控制：echo "module amdgpu +p" 开启 amdgpu 所有 pr_debug 输出，echo "file amdgpu_device.c +p" 只开启特定文件。这比重新编译内核高效得多。',
              'debugfs 是一个内存文件系统（挂载在 /sys/kernel/debug/），amdgpu 驱动在其中注册了大量调试接口。路径 /sys/kernel/debug/dri/0/ 下有：amdgpu_fence_info（fence 状态——追踪 GPU 任务完成情况）、amdgpu_gpu_recover（手动触发 GPU reset）、amdgpu_ring_gfx（GFX ring buffer 内容）、amdgpu_pm_info（电源管理状态）等。这些文件是实时读取 GPU 内部状态的窗口，比 dmesg 日志更直接。',
            ],
            keyPoints: [
              'printk 日志级别 0-7：KERN_EMERG(0) > ERR(3) > WARN(4) > INFO(6) > DEBUG(7)',
              'pr_info/pr_err/pr_debug 是带模块前缀的 printk 便捷宏',
              'DRM_DEBUG_DRIVER() 输出受 drm.debug 位掩码控制，bit 2 = DRIVER',
              '动态调试：echo "module amdgpu +p" > /sys/kernel/debug/dynamic_debug/control',
              'debugfs 路径 /sys/kernel/debug/dri/0/ 提供 GPU 运行时状态接口',
              'amdgpu_fence_info 显示各 ring 的 fence 序列号——判断 GPU 是否卡住的关键',
            ],
          },
          diagram: {
            title: 'amdgpu 日志与调试接口全景',
            content: `amdgpu 调试信息流——从内核到用户空间

内核空间 (amdgpu 驱动)                    用户空间
─────────────────────                    ─────────

  pr_err("amdgpu: ...")          ──→  dmesg (级别 3, 始终输出)
  pr_warn("amdgpu: ...")         ──→  dmesg (级别 4, 始终输出)
  pr_info("amdgpu: ...")         ──→  dmesg (级别 6, 始终输出)
  pr_debug("amdgpu: ...")        ──→  dmesg (级别 7, 需要动态调试开启)
       │                                       │
       │  控制方式:                              │
       │  echo "module amdgpu +p"              │
       │  > /sys/kernel/debug/                 ▼
       │    dynamic_debug/control          dmesg -w | grep amdgpu
       │
  DRM_DEBUG_DRIVER(...)          ──→  dmesg (需要 drm.debug 位掩码)
  DRM_DEBUG_KMS(...)                   │
  DRM_DEBUG_ATOMIC(...)                │  控制方式:
       │                                │  echo 0x1e > /sys/module/drm/
       │                                │              parameters/debug
       │                                │
       │                                │  drm.debug 位掩码:
       │                                │  0x02 = DRIVER
       │                                │  0x04 = KMS
       │                                │  0x10 = ATOMIC
       │                                │  0x1e = 全部常用
       │
  debugfs 注册                   ──→  /sys/kernel/debug/dri/0/
       │                                ├── amdgpu_fence_info
       │                                │   emitted=1234 signaled=1233
       │                                │   → seq 差值 = 未完成任务数
       │                                ├── amdgpu_gpu_recover
       │                                │   echo 1 > 触发手动 reset
       │                                ├── amdgpu_ring_gfx
       │                                │   ring buffer 原始内容
       │                                ├── amdgpu_pm_info
       │                                │   频率/电压/温度
       │                                ├── amdgpu_sa_info
       │                                │   子分配器状态
       │                                └── amdgpu_vm_info
       │                                    虚拟内存映射信息

  sysfs 属性                     ──→  /sys/class/drm/card0/device/
                                       ├── pp_dpm_sclk  (GPU 频率)
                                       ├── gpu_busy_percent
                                       └── mem_info_vram_used`,
            caption: 'amdgpu 驱动的三条调试信息通道：printk/DRM_DEBUG → dmesg、debugfs → 运行时状态文件、sysfs → 硬件属性。掌握这三个通道是调试 GPU 问题的基础。',
          },
          codeWalk: {
            title: 'DRM_DEBUG_DRIVER 宏的内部实现',
            file: 'include/drm/drm_print.h + drivers/gpu/drm/amd/amdgpu/amdgpu_cs.c',
            language: 'c',
            code: `/* drm_print.h — DRM 调试宏定义 */

/* drm.debug 参数的位定义 */
#define DRM_UT_NONE   0x00
#define DRM_UT_CORE   0x01  /* DRM 核心 */
#define DRM_UT_DRIVER 0x02  /* 驱动特定 */
#define DRM_UT_KMS    0x04  /* KMS 模式设置 */
#define DRM_UT_PRIME  0x08  /* PRIME 缓冲区共享 */
#define DRM_UT_ATOMIC 0x10  /* Atomic 模式设置 */
#define DRM_UT_VBL    0x20  /* VBlank */
#define DRM_UT_STATE  0x40  /* 状态检查 */
#define DRM_UT_LEASE  0x80  /* DRM 租约 */

/* DRM_DEBUG_DRIVER 宏 — amdgpu 中最常用的调试输出 */
#define DRM_DEBUG_DRIVER(fmt, ...)                       \\
    drm_dbg(DRM_UT_DRIVER, fmt, ##__VA_ARGS__)

/* 展开后的最终调用路径:
 * DRM_DEBUG_DRIVER("ring %s timeout", ring->name)
 *   → drm_dbg(DRM_UT_DRIVER, "ring %s timeout", ring->name)
 *     → __drm_dbg(DRM_UT_DRIVER, ...)
 *       → if (__drm_debug & DRM_UT_DRIVER)
 *             printk(KERN_DEBUG "[drm:func_name] ring gfx timeout")
 *
 * 只有当 drm.debug 参数的 bit 1 (0x02) 被设置时才输出
 */

/* amdgpu_cs.c 中的实际使用示例 */
int amdgpu_cs_ioctl(struct drm_device *dev, void *data,
                     struct drm_file *filp)
{
    /* 这条日志只在 drm.debug & DRM_UT_DRIVER 时输出 */
    DRM_DEBUG_DRIVER("cs ioctl: num_chunks=%u",
                     cs->in.num_chunks);

    /* 错误用 DRM_ERROR — 始终输出，不受 drm.debug 控制 */
    if (r) {
        DRM_ERROR("Failed to initialize parser: %d", r);
        return r;
    }
}`,
            annotations: [
              'DRM_UT_DRIVER = 0x02: DRM_DEBUG_DRIVER 输出的控制位，需要 drm.debug 包含此位',
              'drm.debug 是运行时可调参数：echo 0x02 > /sys/module/drm/parameters/debug',
              'DRM_DEBUG_DRIVER 最终调用 printk(KERN_DEBUG ...) 但加了 [drm:函数名] 前缀',
              'DRM_ERROR 使用 KERN_ERR 级别，始终输出到 dmesg，不受 drm.debug 控制',
              '__drm_debug 是全局变量，存储当前的 drm.debug 位掩码值',
              'amdgpu 代码中有数千处 DRM_DEBUG_DRIVER 调用——全部开启会产生大量日志',
            ],
            explanation: '理解 DRM_DEBUG_DRIVER 的实现很重要：它不是简单的 printk，而是经过位掩码检查的条件输出。这意味着在生产环境中，这些调试语句的开销几乎为零（只是一个位与操作），但在调试时可以通过修改 drm.debug 参数按需开启。amdgpu 的大量调试信息就隐藏在这些宏后面——你只需要知道如何打开它们。',
          },
          miniLab: {
            title: '启用 amdgpu 动态调试并读取 debugfs',
            objective: '实际操作开启 amdgpu 的动态调试输出，设置 drm.debug 参数，并通过 debugfs 读取 GPU 运行状态。',
            steps: [
              '查看当前 drm.debug 级别：cat /sys/module/drm/parameters/debug（默认为 0）',
              '开启 DRIVER 级别调试：sudo sh -c \'echo 0x02 > /sys/module/drm/parameters/debug\'',
              '打开一个新终端实时监控：sudo dmesg -w | grep "\\[drm\\]"',
              '触发一些 GPU 活动（如移动窗口、运行 glxgears），观察 DRM_DEBUG_DRIVER 输出',
              '开启 amdgpu 动态调试：sudo sh -c \'echo "module amdgpu +p" > /sys/kernel/debug/dynamic_debug/control\'',
              '读取 fence 状态：sudo cat /sys/kernel/debug/dri/0/amdgpu_fence_info',
              '读取 GPU 电源信息：sudo cat /sys/kernel/debug/dri/0/amdgpu_pm_info',
              '完成后关闭调试输出：sudo sh -c \'echo 0 > /sys/module/drm/parameters/debug\' && sudo sh -c \'echo "module amdgpu -p" > /sys/kernel/debug/dynamic_debug/control\'',
            ],
            expectedOutput: `$ cat /sys/module/drm/parameters/debug
0x0

$ sudo sh -c 'echo 0x02 > /sys/module/drm/parameters/debug'
$ dmesg -w | grep "\\[drm\\]"
[12345.678] [drm:amdgpu_cs_ioctl] cs ioctl: num_chunks=2
[12345.679] [drm:amdgpu_cs_parser_init] parser init: ring=gfx
...大量调试输出...

$ sudo cat /sys/kernel/debug/dri/0/amdgpu_fence_info
--- ring gfx_0.0.0 ---
Last signaled fence          0x0000000000001a3f
Last emitted                 0x0000000000001a40
  ← emitted - signaled = 1，说明有 1 个任务在 GPU 上执行中`,
            hint: '如果 /sys/kernel/debug/ 为空，需要挂载 debugfs：sudo mount -t debugfs debugfs /sys/kernel/debug。如果权限不足，所有操作都需要 sudo。记得实验结束后关闭调试输出，否则会产生大量日志影响性能。',
          },
          debugExercise: {
            title: '调试输出消失之谜',
            language: 'bash',
            description: '一位开发者在 amdgpu 代码中添加了 DRM_DEBUG_DRIVER() 调试语句，但在 dmesg 中看不到任何输出。以下是他的操作步骤，找出为什么看不到调试信息。',
            question: '为什么 dmesg 中没有出现调试信息？需要修改什么？',
            buggyCode: `# 开发者在 amdgpu_fence.c 中添加了:
# DRM_DEBUG_DRIVER("fence signaled: seq=%llu", fence->seq);

# 重新编译并加载模块后:
$ sudo rmmod amdgpu && sudo modprobe amdgpu
$ dmesg | grep "fence signaled"
(无输出)

# 开发者检查了日志级别:
$ cat /proc/sys/kernel/printk
4    4    1    7
# (console_loglevel=4, 即只显示 WARN 及以上)

# 开发者认为是 console_loglevel 的问题，调高了:
$ sudo sysctl kernel.printk="8 4 1 7"
$ dmesg | grep "fence signaled"
(仍然无输出!)

# drm.debug 参数状态:
$ cat /sys/module/drm/parameters/debug
0x0`,
            hint: 'DRM_DEBUG_DRIVER 不只受 console_loglevel 控制——它还有自己的开关。',
            answer: '问题出在 drm.debug 参数为 0x0。DRM_DEBUG_DRIVER() 宏内部首先检查 __drm_debug & DRM_UT_DRIVER (0x02)，如果为 0 则直接返回，根本不会调用 printk。所以即使把 console_loglevel 调到最高也没用——printk 压根没被执行。修复方法：echo 0x02 > /sys/module/drm/parameters/debug 开启 DRIVER 级别的 DRM 调试。或者在启动参数中添加 drm.debug=0x02。这是新手常犯的错误——DRM 的调试输出有两层门控：第一层是 drm.debug 位掩码（DRM 层），第二层是 console_loglevel（printk 层），两层都必须通过才能看到输出。',
          },
          interviewQ: {
            question: '描述你在 amdgpu 驱动开发中的调试方法论。当遇到一个难以复现的 bug 时，你会使用哪些工具和策略？',
            difficulty: 'medium',
            hint: '按层次回答：首先 dmesg + printk（基本日志），然后动态调试（精细控制），然后 debugfs（运行时状态），然后 ftrace（函数追踪），最后硬件级工具（umr 寄存器读取）。',
            answer: '我的调试方法论分层递进：（1）第一层 — 日志分析：dmesg | grep -i "amdgpu\\|error\\|timeout\\|fault" 获取错误信息全貌。检查是否有 GPU hang/reset/fault 的明确提示。（2）第二层 — 增加日志粒度：echo 0x1e > /sys/module/drm/parameters/debug 开启所有 DRM 调试输出，echo "module amdgpu +p" 开启 amdgpu 的 pr_debug。在关键代码路径添加 DRM_DEBUG_DRIVER() 并重编译模块。（3）第三层 — debugfs 状态检查：cat amdgpu_fence_info 看 fence 是否停滞，cat amdgpu_ring_gfx 检查 ring buffer 状态。对于间歇性 bug，写脚本定期采样 debugfs 状态。（4）第四层 — ftrace 函数追踪：trace-cmd record -p function_graph -l "amdgpu_*" 追踪函数调用链和耗时，找出异常路径。（5）第五层 — 硬件诊断：使用 umr 读取 GRBM_STATUS 等关键寄存器，分析 GPU 硬件状态。对于难以复现的 bug，关键策略是：增加日志不降低性能（用 trace_printk 而非 printk），写自动化测试脚本循环触发，以及使用 kdump/crash 在崩溃时保存内核状态。',
            amdContext: 'AMD 面试非常看重系统化的调试能力。展示你能从最简单的工具（dmesg）逐步升级到最复杂的工具（umr/ftrace），而不是一上来就用最重的手段。',
          },
        },

        // ── Lesson 6.1.2 ──────────────────────────────────────
        {
          id: '6-1-2',
          number: '6.1.2',
          title: 'ftrace 与内核追踪点',
          titleEn: 'ftrace & Kernel Tracepoints',
          duration: 20,
          difficulty: 'advanced',
          tags: ['ftrace', 'tracepoints', 'TRACE_EVENT', 'trace-cmd', 'ring-buffer'],
          concept: {
            summary: 'ftrace 是 Linux 内核内建的追踪框架，通过在函数入口/出口插入探针来记录函数调用和耗时。结合 TRACE_EVENT 宏定义的追踪点（tracepoints），你可以精确追踪 amdgpu 命令提交、作业调度等关键路径的延迟和行为。',
            explanation: [
              'ftrace 的核心是一个高效的环形缓冲区（per-CPU ring buffer），内核中的探针将事件写入缓冲区，用户空间通过 tracefs（/sys/kernel/tracing/）或 trace-cmd 工具读取。ftrace 的开销极低——未激活的追踪点只是一条 NOP 指令（5 字节），在运行时通过 code patching 替换为跳转到追踪处理函数的指令。',
              'ftrace 提供多种追踪器（tracer）：function tracer 记录每次函数调用（函数名 + 调用者），function_graph tracer 记录函数的进入和退出（可以看到调用树和每个函数的耗时），irqsoff tracer 记录最长中断禁用时间，preemptoff tracer 记录最长抢占禁用时间。对于 amdgpu 调试，function_graph 最常用——它能直观展示命令提交的完整调用链和每步耗时。',
              'TRACE_EVENT 是定义内核追踪点的标准宏。amdgpu 在 amdgpu_trace.h 中定义了多个追踪点：amdgpu_cs_ioctl（命令提交入口）、amdgpu_sched_run_job（调度器运行作业）、amdgpu_vm_bo_map（虚拟内存映射）、amdgpu_bo_create（缓冲对象创建）等。这些追踪点记录了结构化数据（如 ring name、fence sequence、job size），比 printk 更高效且可以用 perf/trace-cmd 自动分析。',
              'trace-cmd 是 ftrace 的用户空间前端，极大简化了操作。trace-cmd record -e amdgpu -p function_graph 一条命令就能记录所有 amdgpu 追踪点事件和函数图追踪。trace-cmd report 解析二进制数据为可读输出。对于性能分析，trace-cmd 输出可以导入 KernelShark（GUI 工具）进行可视化时间线分析。',
            ],
            keyPoints: [
              'ftrace 使用 per-CPU ring buffer，未激活的追踪点只是 NOP 指令，开销极低',
              'function_graph tracer 显示函数调用树和耗时——诊断延迟问题的利器',
              'amdgpu 追踪点：amdgpu_cs_ioctl、amdgpu_sched_run_job、amdgpu_vm_bo_map',
              'TRACE_EVENT 宏在 amdgpu_trace.h 中定义，记录结构化数据',
              'trace-cmd record/report 是 ftrace 的简便前端，推荐日常使用',
              'KernelShark 可可视化 trace-cmd 输出，直观展示时间线上的事件',
            ],
          },
          diagram: {
            title: 'ftrace 架构与 amdgpu 追踪点',
            content: `ftrace 架构——从追踪点到用户空间分析

                      内核空间
    ┌──────────────────────────────────────────────┐
    │                                              │
    │  amdgpu 代码中的追踪点                        │
    │                                              │
    │  amdgpu_cs_ioctl() {                         │
    │      trace_amdgpu_cs_ioctl(job);  ──────┐    │
    │      ...                                │    │
    │  }                                      │    │
    │                                         │    │
    │  amdgpu_job_run() {                     │    │
    │      trace_amdgpu_sched_run_job(job); ──┤    │
    │      ...                                │    │
    │  }                                      │    │
    │                                         ▼    │
    │  ┌─────────── ftrace 框架 ───────────────┐   │
    │  │                                       │   │
    │  │  function tracer (mcount/fentry hook)  │   │
    │  │  ┌─ amdgpu_cs_ioctl                   │   │
    │  │  ├─ amdgpu_cs_parser_init             │   │
    │  │  ├─ amdgpu_cs_submit                  │   │
    │  │  └─ ...                               │   │
    │  │                                       │   │
    │  │  TRACE_EVENT 追踪点                    │   │
    │  │  ┌─ amdgpu:amdgpu_cs_ioctl           │   │
    │  │  ├─ amdgpu:amdgpu_sched_run_job      │   │
    │  │  ├─ amdgpu:amdgpu_vm_bo_map          │   │
    │  │  └─ amdgpu:amdgpu_bo_create          │   │
    │  │                                       │   │
    │  │          ▼                             │   │
    │  │  ┌── Per-CPU Ring Buffer ──┐          │   │
    │  │  │ CPU0: [event][event]... │          │   │
    │  │  │ CPU1: [event][event]... │          │   │
    │  │  │ CPU2: [event][event]... │          │   │
    │  │  │ CPU3: [event][event]... │          │   │
    │  │  └────────────────────────┘          │   │
    │  └───────────────┬───────────────────────┘   │
    └──────────────────┼───────────────────────────┘
                       │
    ┌──────────────────▼───────────────────────────┐
    │                用户空间                        │
    │                                              │
    │  tracefs: /sys/kernel/tracing/               │
    │  ├── trace              ← 直接读取文本       │
    │  ├── trace_pipe         ← 实时流式读取       │
    │  ├── current_tracer     ← 设置追踪器类型     │
    │  ├── set_ftrace_filter  ← 过滤函数           │
    │  └── events/amdgpu/     ← amdgpu 追踪点     │
    │      ├── amdgpu_cs_ioctl/enable              │
    │      └── amdgpu_sched_run_job/enable         │
    │                                              │
    │  trace-cmd record -e amdgpu → trace.dat      │
    │  trace-cmd report trace.dat → 文本输出        │
    │  kernelshark trace.dat      → GUI 时间线      │
    └──────────────────────────────────────────────┘`,
            caption: 'ftrace 的完整数据流：amdgpu 代码中的追踪点和函数探针将事件写入 per-CPU ring buffer，用户空间通过 tracefs 或 trace-cmd 读取分析。',
          },
          codeWalk: {
            title: 'amdgpu_trace.h 中的 TRACE_EVENT 定义',
            file: 'drivers/gpu/drm/amd/amdgpu/amdgpu_trace.h',
            language: 'c',
            code: `/* amdgpu_trace.h — amdgpu 追踪点定义 */

#include <linux/tracepoint.h>

/* 追踪 CS (Command Submission) ioctl 调用 */
TRACE_EVENT(amdgpu_cs_ioctl,
    /* 追踪点触发时传入的参数 */
    TP_PROTO(struct amdgpu_job *job),

    TP_ARGS(job),

    /* 记录到 ring buffer 中的字段 */
    TP_STRUCT__entry(
        __field(uint64_t, sched_job_id)
        __field(u32, ring)
        __field(u32, num_ibs)
        __string(timeline, AMDGPU_JOB_GET_TIMELINE_NAME(job))
    ),

    /* 如何从参数填充字段 */
    TP_fast_assign(
        __entry->sched_job_id = job->base.id;
        __entry->ring = job->ring->idx;
        __entry->num_ibs = job->num_ibs;
        __assign_str(timeline,
                     AMDGPU_JOB_GET_TIMELINE_NAME(job));
    ),

    /* 输出格式（trace-cmd report 和 /sys/kernel/tracing/trace 使用）*/
    TP_printk("sched_job=%llu, timeline=%s, ring=%u, num_ibs=%u",
              __entry->sched_job_id,
              __get_str(timeline),
              __entry->ring,
              __entry->num_ibs)
);

/* 追踪调度器执行作业 */
TRACE_EVENT(amdgpu_sched_run_job,
    TP_PROTO(struct amdgpu_job *job),
    TP_ARGS(job),
    TP_STRUCT__entry(
        __field(uint64_t, sched_job_id)
        __string(timeline, AMDGPU_JOB_GET_TIMELINE_NAME(job))
    ),
    TP_fast_assign(
        __entry->sched_job_id = job->base.id;
        __assign_str(timeline,
                     AMDGPU_JOB_GET_TIMELINE_NAME(job));
    ),
    TP_printk("sched_job=%llu, timeline=%s",
              __entry->sched_job_id,
              __get_str(timeline))
);

/* 在 amdgpu_cs.c 中的使用:
 * trace_amdgpu_cs_ioctl(job);       ← cs ioctl 入口
 * trace_amdgpu_sched_run_job(job);  ← 作业开始执行
 *
 * 追踪延迟 = sched_run_job.timestamp - cs_ioctl.timestamp
 * 这就是 command submission → GPU 执行的调度延迟
 */`,
            annotations: [
              'TRACE_EVENT 宏生成完整的追踪基础设施：注册/注销、格式化、过滤等',
              'TP_STRUCT__entry 定义了写入 ring buffer 的紧凑二进制格式，比 printk 高效',
              'TP_fast_assign 在追踪点触发时执行，必须尽量快——避免复杂计算',
              'TP_printk 定义人可读格式，只在用户空间读取时才执行格式化',
              '__string 和 __assign_str 处理变长字符串，在 ring buffer 中紧凑存储',
              'trace_amdgpu_cs_ioctl(job) 是由宏自动生成的调用函数',
            ],
            explanation: '这两个追踪点是 amdgpu 性能分析的核心。amdgpu_cs_ioctl 在用户空间提交命令时触发，amdgpu_sched_run_job 在 GPU 调度器实际执行作业时触发。两个事件的时间差就是调度延迟——如果这个延迟异常大，说明调度器有瓶颈或者 GPU 在处理其他任务。通过 trace-cmd 可以自动计算这个延迟。',
          },
          miniLab: {
            title: '使用 trace-cmd 追踪 amdgpu 命令提交延迟',
            objective: '使用 trace-cmd 记录 amdgpu 追踪点事件，分析命令提交到 GPU 执行的调度延迟。',
            setup: `# 安装 trace-cmd
sudo apt install trace-cmd

# 确认 amdgpu 追踪点可用
ls /sys/kernel/tracing/events/amdgpu/
# 应该看到 amdgpu_cs_ioctl/ amdgpu_sched_run_job/ 等目录`,
            steps: [
              '列出所有 amdgpu 追踪点：trace-cmd list -e amdgpu',
              '开始记录 amdgpu 追踪点：sudo trace-cmd record -e amdgpu -o /tmp/amdgpu_trace.dat',
              '在另一个终端运行 glxgears 或任意 GPU 程序约 5 秒',
              '回到 trace-cmd 终端按 Ctrl+C 停止记录',
              '查看报告：trace-cmd report /tmp/amdgpu_trace.dat | head -50',
              '追踪函数图：sudo trace-cmd record -p function_graph -l "amdgpu_cs_*" -o /tmp/amdgpu_cs.dat，运行 glxgears 5 秒后 Ctrl+C',
              '查看函数图：trace-cmd report /tmp/amdgpu_cs.dat | head -80',
            ],
            expectedOutput: `$ trace-cmd report /tmp/amdgpu_trace.dat | head -20
  glxgears-5234 [002] 12345.678: amdgpu_cs_ioctl:  sched_job=4567, timeline=gfx_0.0.0, ring=0, num_ibs=1
  kworker-58    [001] 12345.679: amdgpu_sched_run_job: sched_job=4567, timeline=gfx_0.0.0
                                                        ← 提交到执行的延迟约 1ms

$ trace-cmd report /tmp/amdgpu_cs.dat | head -20
  glxgears-5234 [002] 12345.678:
    | amdgpu_cs_ioctl() {
    |   amdgpu_cs_parser_init() {    0.854 us
    |   amdgpu_cs_parser_bos() {     2.341 us
    |   amdgpu_cs_submit() {         1.120 us
    | }                              5.234 us  ← 总耗时`,
            hint: '如果 trace-cmd list -e amdgpu 输出为空，确认内核编译时启用了 CONFIG_FTRACE 和 CONFIG_TRACEPOINTS。大多数发行版内核默认启用这些选项。',
          },
          debugExercise: {
            title: '从 ftrace 输出定位调度延迟',
            language: 'text',
            description: '以下是一段 trace-cmd 输出，显示 GPU 命令提交和执行的时间戳。有一次提交的调度延迟异常高。找出问题。',
            question: '哪次命令提交的调度延迟异常？可能的原因是什么？',
            buggyCode: `# trace-cmd report 输出 (简化)

# 正常的命令提交 (延迟 ~0.5ms)
glxgears-5234 [002] 10000.100: amdgpu_cs_ioctl: sched_job=100, ring=0
kworker-58    [001] 10000.100: amdgpu_sched_run_job: sched_job=100
  → 延迟: 0.5ms ✓

glxgears-5234 [002] 10000.117: amdgpu_cs_ioctl: sched_job=101, ring=0
kworker-58    [001] 10000.117: amdgpu_sched_run_job: sched_job=101
  → 延迟: 0.4ms ✓

# 异常的命令提交
glxgears-5234 [002] 10000.134: amdgpu_cs_ioctl: sched_job=102, ring=0
kworker-58    [001] 10000.284: amdgpu_sched_run_job: sched_job=102
  → 延迟: 150ms ✗ ← 比正常慢 300 倍!

glxgears-5234 [002] 10000.301: amdgpu_cs_ioctl: sched_job=103, ring=0
kworker-58    [001] 10000.301: amdgpu_sched_run_job: sched_job=103
  → 延迟: 0.6ms ✓  (恢复正常)

# 同一时间段的其他追踪:
blender-8901  [003] 10000.135: amdgpu_cs_ioctl: sched_job=5000, ring=0
blender-8901  [003] 10000.136: amdgpu_cs_ioctl: sched_job=5001, ring=0
...  (blender 连续提交了 ~200 个 job)
blender-8901  [003] 10000.280: amdgpu_sched_run_job: sched_job=5199`,
            hint: 'job 102 和 blender 的大量提交发生在同一时间窗口，它们使用同一个 ring...',
            answer: 'job 102 的调度延迟 150ms 异常高。原因：blender 进程在 10000.135-10000.280 之间向同一个 GFX ring (ring=0) 连续提交了约 200 个 job。amdgpu 的 GPU 调度器使用先进先出（FIFO）队列（drm_sched），glxgears 的 job 102 在 10000.134 提交，但排在了 blender 的 200 个 job 后面。GPU 需要先处理完 blender 的所有 job 后才能执行 job 102。这是典型的调度器队列饱和问题。解决方案：（1）使用不同的 ring/context 隔离不同应用的 GPU 工作负载；（2）调整 GPU 调度器的时间片（drm_sched 的 timeout 参数）；（3）使用优先级调度（如果驱动支持）让交互式应用获得更高优先级。',
          },
          interviewQ: {
            question: '解释 ftrace 的 function_graph tracer 工作原理。它如何在不修改源码的情况下追踪函数调用和返回？',
            difficulty: 'hard',
            hint: '关键词：mcount/fentry、return trampoline、gcc -pg、运行时 code patching、NOP 替换。',
            answer: 'function_graph tracer 的原理：（1）编译时：GCC 使用 -pg 参数编译内核，在每个函数入口插入一条对 mcount（或 __fentry__）的调用。初始时这些调用被 NOP 指令替换，不产生运行时开销。（2）激活追踪时：ftrace 使用运行时 code patching（通过 stop_machine 或 text_poke_bp）将 NOP 替换为跳转到 ftrace_caller 的指令。（3）函数入口处理：ftrace_caller 调用注册的回调函数（function_graph 的 trace_graph_entry），记录函数名、时间戳、CPU ID 到 per-CPU ring buffer。（4）返回追踪（关键技巧）：function_graph 修改栈上的返回地址——将原始返回地址保存到 task_struct 中的 ret_stack 数组中，用 return_to_handler 蹦床函数替换。函数返回时先执行 return_to_handler，记录返回时间戳（可以算出执行时间），然后跳转到真实返回地址。（5）性能影响：每个被追踪函数增加约 100-500ns 开销（保存/恢复上下文 + ring buffer 写入），全局开启时可能有 10-30% 的性能影响，所以通常用 set_ftrace_filter 只追踪感兴趣的函数。',
            amdContext: '这个问题考查你对内核底层机制的理解深度。如果你能解释 return trampoline 机制和 NOP patching，说明你对内核内部有深入的认识。',
          },
        },

        // ── Lesson 6.1.3 ──────────────────────────────────────
        {
          id: '6-1-3',
          number: '6.1.3',
          title: 'perf 与 rocprof 性能分析',
          titleEn: 'perf & rocprof Profiling',
          duration: 20,
          difficulty: 'advanced',
          tags: ['perf', 'rocprof', 'flame-graph', 'PMU', 'profiling'],
          concept: {
            summary: 'perf 是 Linux 内核的性能分析工具，通过硬件性能计数器（PMU）和软件事件采样 CPU 侧热点。rocprof 是 AMD 的 GPU 侧分析工具，能采集 GPU 硬件计数器、HSA 追踪和 kernel 时间线。两者结合可以全面分析 CPU+GPU 混合工作负载的性能瓶颈。',
            explanation: [
              'perf 利用 CPU 的 Performance Monitoring Unit（PMU）硬件计数器进行采样。PMU 可以计数事件如 CPU cycles、cache misses、branch mispredictions 等。perf 的工作原理：每 N 个事件发生一次中断（NMI），记录当时的指令指针（IP），统计后产生每个函数被采样到的次数——采样次数越多表示该函数消耗的 CPU 时间越多。',
              'perf 常用子命令：perf top（实时显示 CPU 热点函数，类似 top 但精确到函数），perf stat（统计程序执行的硬件事件总量，如 cycles/instructions/cache-misses），perf record（采样并保存到 perf.data 文件），perf report（交互式分析 perf.data）。对于 amdgpu 内核模块的分析，perf 可以直接看到内核函数的 CPU 消耗。',
              'rocprof 是 AMD ROCm 生态的 GPU 性能分析工具。它有三种主要模式：--stats 模式（统计每个 GPU kernel 的执行时间和调用次数），--hsa-trace 模式（追踪 HSA 运行时的 API 调用、内存拷贝、kernel dispatch 的完整时间线），硬件计数器模式（通过 input.txt 指定要采集的 GPU PMU 计数器，如 SQ_WAVES、SQ_INSTS_VALU、TA_BUFFER_WAVEFRONTS_SUM）。',
              'Flame Graph（火焰图）是 perf 数据的可视化方式——x 轴是函数调用栈（宽度表示采样百分比），y 轴是调用深度。Brendan Gregg 的 FlameGraph 脚本（github.com/brendangregg/FlameGraph）可以将 perf script 输出转换为交互式 SVG 火焰图。对于 amdgpu 调试，火焰图能直观展示内核中哪些函数消耗了最多的 CPU 时间——常见的热点包括 fence polling、register read/write、memory allocation。',
            ],
            keyPoints: [
              'perf top/stat/record/report: CPU 侧性能分析四件套',
              'perf 通过 PMU 硬件计数器采样，开销 < 5%，可用于生产环境',
              'rocprof --stats: GPU kernel 执行时间统计',
              'rocprof --hsa-trace: HSA API + 内存拷贝 + kernel dispatch 时间线',
              'rocprof 硬件计数器: SQ_WAVES, SQ_INSTS_VALU 等 GPU 微架构事件',
              'Flame Graph: perf 数据的可视化，x 轴宽度 = CPU 时间占比',
            ],
          },
          diagram: {
            title: 'CPU (perf) + GPU (rocprof) 联合分析架构',
            content: `CPU + GPU 联合性能分析工作流

┌─────────── 应用程序 (如 AI 训练) ──────────┐
│                                              │
│  CPU 代码         GPU 代码 (HIP kernel)      │
│  数据预处理        矩阵乘法                   │
│  内存分配          卷积运算                   │
│  GPU 调度          ...                        │
│       │                    │                  │
└───────┼────────────────────┼──────────────────┘
        │                    │
  ┌─────▼──────┐      ┌─────▼──────┐
  │   perf     │      │  rocprof   │
  │  (CPU 侧)  │      │  (GPU 侧)  │
  │            │      │            │
  │ perf stat  │      │ --stats    │
  │  cycles    │      │ kernel时间  │
  │  cache-miss│      │ 调用次数    │
  │  IPC       │      │            │
  │            │      │ --hsa-trace│
  │ perf record│      │ API调用     │
  │  采样      │      │ 内存拷贝    │
  │  调用栈    │      │ dispatch   │
  │            │      │            │
  │ perf report│      │ 硬件计数器  │
  │  热点函数  │      │ SQ_WAVES   │
  │            │      │ SQ_INSTS   │
  │  → 火焰图  │      │ L2 cache   │
  └─────┬──────┘      └─────┬──────┘
        │                    │
        ▼                    ▼
  ┌──────────────────────────────────────┐
  │         分析结果整合                   │
  │                                      │
  │  典型发现:                            │
  │  ├─ CPU 热点: amdgpu_fence_wait_any  │
  │  │   → fence polling 占 CPU 30%      │
  │  │   → 方案: 改用中断等待模式         │
  │  │                                    │
  │  ├─ GPU 热点: matmul_kernel          │
  │  │   → SQ_WAVES 利用率只有 40%       │
  │  │   → 方案: 增大 workgroup size     │
  │  │                                    │
  │  └─ CPU-GPU 交互:                    │
  │      → 数据拷贝占总时间 60%           │
  │      → 方案: 使用 pinned memory      │
  └──────────────────────────────────────┘`,
            caption: 'perf 分析 CPU 侧热点（驱动代码、调度、fence wait），rocprof 分析 GPU 侧热点（kernel 执行、内存带宽）。两者结合可以完整定位 CPU+GPU 工作负载的瓶颈。',
          },
          codeWalk: {
            title: '使用 perf 定位 amdgpu 内核热点函数',
            file: 'terminal',
            language: 'bash',
            code: `# === perf 分析 amdgpu 内核模块的 CPU 消耗 ===

# 1. perf top: 实时查看全系统 CPU 热点
sudo perf top -g
#  Overhead  Shared Object     Symbol
#  --------  ----------------  --------
#    12.34%  [amdgpu]          amdgpu_fence_process
#     8.21%  [amdgpu]          amdgpu_ring_commit
#     5.67%  [kernel.vmlinux]  _raw_spin_lock_irqsave
#     3.45%  [amdgpu]          amdgpu_bo_move

# 2. perf stat: 统计 GPU 程序的硬件事件
sudo perf stat -e cycles,instructions,cache-misses,\\
    context-switches -- glxgears -info

#  Performance counter stats for 'glxgears':
#    2,345,678,901  cycles
#    1,876,543,210  instructions  # IPC = 0.80
#       12,345,678  cache-misses
#            3,456  context-switches

# 3. perf record: 采样并生成火焰图
sudo perf record -g -a -- sleep 10
# (运行期间跑 GPU 工作负载)
sudo perf script > /tmp/perf_out.txt

# 生成火焰图 (需要 FlameGraph 工具)
# git clone https://github.com/brendangregg/FlameGraph
cat /tmp/perf_out.txt | \\
    FlameGraph/stackcollapse-perf.pl | \\
    FlameGraph/flamegraph.pl > /tmp/amdgpu_flamegraph.svg

# 4. perf 分析特定 amdgpu 函数
sudo perf probe -m amdgpu -a amdgpu_cs_ioctl
sudo perf record -e probe:amdgpu_cs_ioctl -aR -- sleep 5
sudo perf report

# === rocprof GPU 侧分析 ===

# 5. rocprof --stats: GPU kernel 执行时间
rocprof --stats ./my_hip_app
# kernel-name     calls  avg-time  total-time
# matmul_kernel     100   1.23ms    123.0ms
# relu_kernel       100   0.05ms      5.0ms

# 6. rocprof --hsa-trace: 完整时间线
rocprof --hsa-trace ./my_hip_app
# 生成 results.json，可用 chrome://tracing 查看

# 7. rocprof 硬件计数器
echo 'pmc: SQ_WAVES SQ_INSTS_VALU TA_BUSY_avr' > input.txt
rocprof -i input.txt ./my_hip_app`,
            annotations: [
              'perf top -g: -g 显示调用图（call graph），可以看到热点函数是被谁调用的',
              'IPC (Instructions Per Cycle) < 1.0 通常表示有内存瓶颈或分支预测失败',
              'perf record -g -a: -g 记录调用栈，-a 采样所有 CPU（包括内核态）',
              'perf probe 可以在内核函数上动态创建追踪点，无需重新编译',
              'rocprof --stats 的 avg-time 是 GPU kernel 的平均执行时间，不包括 dispatch 延迟',
              'rocprof 硬件计数器 SQ_WAVES 是发射到 CU 的 wave 数量，反映 GPU 利用率',
            ],
            explanation: '这段代码展示了 CPU+GPU 联合分析的完整工作流。在实际的 amdgpu 开发中，perf top 是最常用的"快速查看"工具——如果你看到 amdgpu_fence_process 占了大量 CPU，说明 fence polling 是瓶颈。rocprof 则用于分析 GPU kernel 本身的效率。火焰图是向团队展示分析结果的最佳方式。',
          },
          miniLab: {
            title: '使用 perf + rocprof 分析 GPU 应用性能',
            objective: '综合使用 perf 和 rocprof 分析一个 GPU 应用，找出 CPU 侧和 GPU 侧的性能瓶颈。',
            setup: `# 安装 perf 和 FlameGraph
sudo apt install linux-tools-$(uname -r) linux-tools-common
git clone https://github.com/brendangregg/FlameGraph ~/FlameGraph

# rocprof 需要 ROCm 环境
# sudo apt install rocprofiler`,
            steps: [
              '运行 perf top -g 观察 GPU 活动时的 CPU 热点（运行 glxgears 或任意 GPU 程序）',
              '使用 perf stat 采集 glxgears 的硬件计数器：sudo perf stat glxgears（运行 10 秒后 Ctrl+C）',
              '记录全系统采样：sudo perf record -g -a -- sleep 10（期间运行 GPU 程序）',
              '查看 perf 报告：sudo perf report（找到 [amdgpu] 开头的函数）',
              '生成火焰图：sudo perf script | ~/FlameGraph/stackcollapse-perf.pl | ~/FlameGraph/flamegraph.pl > /tmp/gpu_flame.svg',
              '用浏览器打开 /tmp/gpu_flame.svg，找到 amdgpu 相关的函数栈',
              '如果有 ROCm：运行 rocprof --stats ./your_hip_app 查看 GPU kernel 时间',
            ],
            expectedOutput: `$ sudo perf stat glxgears
# 运行 10 秒后 Ctrl+C

 Performance counter stats for 'glxgears':
     3,456,789,012      cycles
     2,678,901,234      instructions     #    0.77  insn per cycle
        23,456,789      cache-misses
             5,678      context-switches
         10.234567      seconds time elapsed

$ sudo perf report | head -20
# Overhead  Command   Shared Object      Symbol
    15.23%  glxgears  [amdgpu]           amdgpu_fence_process
     8.45%  glxgears  libc.so.6          __memcpy_avx2
     6.78%  glxgears  radeonsi_dri.so    si_draw_vbo
     4.56%  glxgears  [amdgpu]           amdgpu_ring_commit`,
            hint: '如果 perf record 报权限错误，可以临时放开限制：sudo sysctl kernel.perf_event_paranoid=-1。生成火焰图需要 root 权限采集的 perf.data，因为需要内核符号。',
          },
          debugExercise: {
            title: '从 perf 数据定位过度 fence polling',
            language: 'text',
            description: '以下 perf report 输出显示一个 GPU 应用的 CPU 使用率异常高（100% 单核）。分析数据找出原因。',
            question: '为什么这个 GPU 应用占满了一个 CPU 核心？提出优化方案。',
            buggyCode: `$ sudo perf report --stdio

# Overhead  Command     Shared Object    Symbol
# ........  ..........  ...............  ......
    42.31%  my_gpu_app  [amdgpu]         amdgpu_fence_wait_any
    18.67%  my_gpu_app  [amdgpu]         amdgpu_fence_process
    12.45%  my_gpu_app  [kernel]         _raw_spin_lock_irqsave
     8.23%  my_gpu_app  [amdgpu]         amdgpu_device_rreg
     5.11%  my_gpu_app  my_gpu_app       main
     3.89%  my_gpu_app  libdrm_amdgpu    amdgpu_cs_query_fence_status

# 调用栈 (amdgpu_fence_wait_any):
# amdgpu_fence_wait_any
#   └─ amdgpu_fence_process
#       └─ amdgpu_device_rreg
#           └─ readl  ← MMIO 寄存器读取

# top 输出:
# PID   %CPU  COMMAND
# 5678  99.8  my_gpu_app`,
            hint: '42% 的时间花在 fence_wait_any，而它的子函数 amdgpu_device_rreg (readl) 是 MMIO 寄存器读取...',
            answer: '问题：应用使用了忙等待（busy-wait / spin polling）来等待 GPU 完成。perf 数据显示 42% 的 CPU 时间在 amdgpu_fence_wait_any，调用链是 fence_wait → fence_process → rreg → readl。这说明驱动在不断轮询 GPU 的 fence 寄存器来检查任务是否完成，而不是使用中断等待。每次 readl() 是一次 MMIO 读取，跨 PCIe 总线延迟约 500ns-1μs，连续轮询会占满 CPU 核心。优化方案：（1）使用 DRM_IOCTL_AMDGPU_WAIT_CS 带超时参数的等待——它会让进程睡眠并通过 GPU 中断唤醒，CPU 使用率接近 0；（2）如果是驱动代码内部的等待，使用 dma_fence_wait_timeout() 替代 busy-wait，它利用 GPU 中断（由 amdgpu_fence_driver_irq_type 产生）来通知 fence 完成；（3）如果需要低延迟，可以先 spin 一小段时间再切换到中断等待（hybrid polling）。这是 GPU 应用开发中最常见的性能问题之一。',
          },
          interviewQ: {
            question: '你如何分析一个 GPU 计算应用的端到端性能？描述你使用的工具和方法论。',
            difficulty: 'hard',
            hint: '分层分析：先宏观（总时间分解为 CPU/GPU/数据传输），再微观（CPU 侧用 perf，GPU 侧用 rocprof，数据传输用 HSA trace）。',
            answer: '端到端性能分析方法论：（1）宏观时间分解：首先用 rocprof --hsa-trace 获取完整时间线，将总时间分解为三部分——CPU 计算、GPU kernel 执行、CPU↔GPU 数据传输。这一步确定瓶颈在哪一侧。（2）CPU 侧分析：perf stat 获取 IPC、cache-miss 等硬件指标。perf record -g 采样生成火焰图，找到 CPU 热点函数。常见问题：fence polling 占 CPU（改用中断等待）、内存分配频繁（使用 buffer pool）、锁竞争（减小临界区）。（3）GPU 侧分析：rocprof --stats 找到最耗时的 kernel。对热点 kernel 使用 rocprof 硬件计数器分析：SQ_WAVES（wave 利用率）、SQ_INSTS_VALU（ALU 利用率）、TCP_TCC_READ_REQ（L2 cache 请求）。常见问题：occupancy 不足（增大 workgroup size）、内存带宽瓶颈（优化访存模式）。（4）数据传输分析：HSA trace 显示每次 H2D/D2H 拷贝的大小和时间。优化：使用 pinned memory 避免额外拷贝，使用 hipMemcpyAsync 与 kernel 重叠，使用 unified memory 减少显式拷贝。（5）整合优化：根据 Amdahl 定律，先优化占比最大的部分。使用 chrome://tracing 可视化 HSA trace JSON，确认优化效果。',
            amdContext: 'AMD 特别看重你是否能从全系统视角分析性能——不只是"GPU kernel 慢"，而是理解 CPU、GPU、PCIe 总线三者之间的交互如何影响整体性能。',
          },
        },
      ],
    },

    // ════════════════════════════════════════════════════════════
    // Group 6.2: GPU Issue Analysis (GPU 问题分析)
    // ════════════════════════════════════════════════════════════
    {
      id: '6-2',
      number: '6.2',
      title: 'GPU 问题分析',
      titleEn: 'GPU Issue Analysis',
      icon: 'Flame',
      description: '深入 GPU hang 分析方法论和 AMD 专用调试工具 umr。学习从 dmesg 日志、寄存器状态、ring buffer 内容三个维度诊断 GPU 硬件问题——这是 AMD 驱动工程师的核心技能。',
      lessons: [
        // ── Lesson 6.2.1 ──────────────────────────────────────
        {
          id: '6-2-1',
          number: '6.2.1',
          title: 'GPU Hang 分析方法论',
          titleEn: 'GPU Hang Analysis Methodology',
          duration: 20,
          difficulty: 'advanced',
          tags: ['GPU-hang', 'GRBM_STATUS', 'CP_RB_RPTR', 'gpu-recover', 'timeout'],
          concept: {
            summary: 'GPU Hang 是驱动开发中最常见也最棘手的问题——GPU 停止响应，ring buffer 中的命令不再被执行。amdgpu 通过 job timeout 检测 hang，通过 GRBM_STATUS/CP_RB_RPTR/WPTR 寄存器诊断原因，通过 GPU reset 恢复。系统化的 hang 分析方法论是 AMD 驱动工程师的核心技能。',
            explanation: [
              'GPU Hang 的定义：GPU 的命令处理器（CP）停止从 ring buffer 中取出和执行命令。从驱动的视角，表现为提交给 GPU 的 job 超过了 timeout 时间仍未完成（fence 没有被 signal）。amdgpu 的默认 timeout 是 10 秒（可通过 amdgpu.lockup_timeout 模块参数调整）。当 timeout 发生时，drm_sched 调用 amdgpu_job_timedout() 开始诊断和恢复流程。',
              'amdgpu_job_timedout() 是 hang 处理的入口函数。它的流程：（1）读取 GRBM_STATUS 寄存器——这是 GPU 全局状态寄存器，其中的位指示哪个引擎正在忙碌（GUI_ACTIVE、CP_BUSY、SPI_BUSY 等）。（2）读取 CP_RB_RPTR（Ring Buffer Read Pointer）和 CP_RB_WPTR（Write Pointer）——如果 RPTR == WPTR，ring 是空的（GPU 已处理完所有命令）；如果 RPTR < WPTR 且不变化，CP 卡在某条命令上。（3）尝试 IB test（向 ring 写入一个简单的 NOP 命令并等待完成）——如果 IB test 通过，说明 ring 本身没有 hang，问题可能在特定的命令上。',
              'GRBM_STATUS（Graphics Register Bus Manager Status）是诊断 hang 的最重要寄存器。关键位：bit 31 GUI_ACTIVE（图形引擎是否活跃），bit 30 CP_BUSY（命令处理器是否忙碌），bit 22-23 SPI_BUSY（着色器处理器是否忙碌），bit 17 TA_BUSY（纹理地址单元），bit 14 DB_BUSY（深度缓冲），bit 12 CB_BUSY（颜色缓冲）。如果 CP_BUSY=1 且 RPTR 不变化，说明 CP 在执行当前命令时卡住了——可能是着色器死循环、内存访问违规、或硬件缺陷。',
              'GPU Reset 是 hang 的最后恢复手段。amdgpu_device_gpu_recover() 的流程：（1）通知所有客户端（DRM、KFD、display）GPU 即将 reset；（2）停止所有 ring 的调度；（3）执行 Mode 1 Reset（写入 GRBM_SOFT_RST 寄存器）或 Mode 2 Reset（通过 PSP 执行完整的 GPU reset）；（4）重新初始化所有 IP Block（GFX、SDMA、VCN 等）；（5）恢复 ring buffer 和重新提交排队中的 job。整个过程约需 1-5 秒，期间屏幕可能会闪烁。',
            ],
            keyPoints: [
              'GPU Hang = CP 停止从 ring buffer 取命令，表现为 job timeout（默认 10 秒）',
              'amdgpu_job_timedout(): hang 处理入口，读取 GRBM_STATUS 和 CP_RB_RPTR/WPTR',
              'GRBM_STATUS 关键位：GUI_ACTIVE(31), CP_BUSY(30), SPI_BUSY(22-23)',
              'CP_RB_RPTR == WPTR → ring 空（已处理完）；RPTR < WPTR 且不变 → CP 卡住',
              'IB test: 向 ring 发 NOP 命令测试——通过说明 ring 本身没问题',
              'GPU Reset: soft reset (GRBM_SOFT_RST) 或 full reset (PSP mode2)',
            ],
          },
          diagram: {
            title: 'GPU Hang 检测与恢复流程',
            content: `GPU Hang 从检测到恢复的完整流程

┌─────────── 正常运行 ───────────┐
│                                │
│  应用提交 job → ring buffer    │
│  CP 执行命令 → fence signal    │
│  drm_sched 标记 job 完成       │
│                                │
└──────────────┬─────────────────┘
               │ fence 未在 10s 内 signal
               ▼
┌─────────── Timeout 检测 ───────┐
│                                │
│  drm_sched_job_timedout()      │
│       │                        │
│       ▼                        │
│  amdgpu_job_timedout()         │
│                                │
└──────────────┬─────────────────┘
               │
               ▼
┌─────────── 状态采集 ───────────┐
│                                │
│  1. GRBM_STATUS = 0xEE008002  │
│     解析:                      │
│     bit 31: GUI_ACTIVE = 1     │
│     bit 30: CP_BUSY    = 1     │
│     bit 23: SPI_BUSY   = 1     │
│     → 图形引擎+CP+SPI 全忙!    │
│                                │
│  2. CP_RB_RPTR = 0x00001200   │
│     CP_RB_WPTR = 0x00001234   │
│     → RPTR < WPTR, ring 不空   │
│     → CP 卡在 offset 0x1200   │
│                                │
│  3. IB test: TIMEOUT           │
│     → ring 确认 hang           │
│                                │
└──────────────┬─────────────────┘
               │
               ▼
┌─────────── dmesg 输出 ─────────┐
│                                │
│  [drm:amdgpu_job_timedout]     │
│  *ERROR* ring gfx_0.0.0       │
│  timeout, signaled fence=1233  │
│  emitted fence=1234            │
│                                │
│  GRBM_STATUS=0xEE008002       │
│  CP_RB_RPTR=0x00001200        │
│  CP_RB_WPTR=0x00001234        │
│                                │
└──────────────┬─────────────────┘
               │
               ▼
┌─────────── GPU Reset ──────────┐
│                                │
│  amdgpu_device_gpu_recover()   │
│  ├─ 通知所有客户端              │
│  ├─ 停止所有 ring 调度          │
│  ├─ Mode 1: GRBM_SOFT_RST     │
│  │  └─ 如果失败 →              │
│  │     Mode 2: PSP full reset  │
│  ├─ 重新初始化 IP Blocks       │
│  ├─ 恢复 ring buffers          │
│  └─ 重新调度排队的 jobs         │
│                                │
│  [drm] GPU reset succeeded     │
│                                │
└────────────────────────────────┘`,
            caption: 'GPU Hang 的完整处理流程：timeout 检测 → 状态采集（GRBM_STATUS, RPTR/WPTR）→ dmesg 记录 → GPU reset 恢复。每个阶段的信息都对诊断 hang 原因至关重要。',
          },
          codeWalk: {
            title: 'amdgpu_job_timedout 函数分析',
            file: 'drivers/gpu/drm/amd/amdgpu/amdgpu_job.c',
            language: 'c',
            code: `/* amdgpu_job.c — GPU job timeout 处理 */

static enum drm_gpu_sched_stat
amdgpu_job_timedout(struct drm_sched_job *s_job)
{
    struct amdgpu_ring *ring = to_amdgpu_ring(s_job->sched);
    struct amdgpu_job *job = to_amdgpu_job(s_job);
    struct amdgpu_device *adev = ring->adev;
    uint32_t grbm_status, rptr, wptr;

    /* 1. 读取 GPU 状态寄存器 */
    grbm_status = RREG32(mmGRBM_STATUS);
    DRM_ERROR("GRBM_STATUS=0x%08X\n", grbm_status);

    /* 解析 GRBM_STATUS 的关键位 */
    if (grbm_status & GRBM_STATUS__GUI_ACTIVE_MASK)
        DRM_ERROR("  GUI_ACTIVE: graphics engine active\n");
    if (grbm_status & GRBM_STATUS__CP_BUSY_MASK)
        DRM_ERROR("  CP_BUSY: command processor busy\n");

    /* 2. 读取 Ring Buffer 指针 */
    rptr = RREG32(ring->rptr_reg);
    wptr = RREG32(ring->wptr_reg);
    DRM_ERROR("ring %s: rptr=0x%08X wptr=0x%08X\n",
              ring->name, rptr, wptr);

    if (rptr == wptr)
        DRM_ERROR("  ring is empty — job may have completed"
                  " but fence not signaled\n");

    /* 3. 尝试 IB test (发送 NOP 到 ring) */
    if (amdgpu_ring_test_ib(ring, 1000) == 0) {
        DRM_INFO("ring %s IB test passed — soft hang\n",
                 ring->name);
        /* IB test 通过: 可能是 fence 丢失，不需要 reset */
        return DRM_GPU_SCHED_STAT_NOMINAL;
    }

    /* 4. IB test 失败: 真正的 GPU hang，触发 reset */
    DRM_ERROR("ring %s IB test failed — hard hang!\n",
              ring->name);

    /* 记录 fence 状态 */
    DRM_ERROR("signaled fence=%llu, emitted fence=%llu\n",
              atomic64_read(&ring->fence_drv.last_seq),
              ring->fence_drv.sync_seq);

    /* 触发 GPU 恢复 */
    amdgpu_device_gpu_recover(adev, job, false);

    return DRM_GPU_SCHED_STAT_NOMINAL;
}

/* GPU 恢复核心函数 */
int amdgpu_device_gpu_recover(struct amdgpu_device *adev,
                               struct amdgpu_job *job,
                               bool force)
{
    /* 第一步: 尝试 soft reset */
    r = amdgpu_asic_reset(adev);
    if (r) {
        /* soft reset 失败, 尝试 mode2 (PSP) reset */
        r = amdgpu_dpm_mode2_reset(adev);
    }

    /* 重新初始化所有 IP block */
    amdgpu_device_ip_reinit_early(adev);
    amdgpu_device_ip_reinit_late(adev);

    /* 恢复所有 ring 的状态 */
    amdgpu_fence_driver_hw_init(adev);

    return r;
}`,
            annotations: [
              'RREG32(mmGRBM_STATUS): 读取 GPU 全局状态，判断哪些引擎在忙',
              'rptr == wptr: ring 空但 fence 没 signal——可能是中断丢失或 fence 处理 bug',
              'amdgpu_ring_test_ib(): 向 ring 写 NOP 命令测试——区分 soft hang 和 hard hang',
              'soft hang: IB test 通过，GPU 能执行新命令，问题是特定 job 超时或 fence 丢失',
              'hard hang: IB test 失败，GPU 完全停止响应，需要 reset',
              'amdgpu_device_gpu_recover: 先 soft reset → 失败再 mode2 reset → 重初始化 IP',
            ],
            explanation: 'amdgpu_job_timedout 是你在 dmesg 中看到 "ring gfx_0.0.0 timeout" 时被调用的函数。理解它的逻辑对于分析 GPU hang 至关重要——它告诉你 GPU 当时的精确状态（哪些引擎在忙、ring pointer 在哪里、IB test 是否通过）。当你提交 GPU hang 相关的 bug report 时，这些信息是开发者定位问题的关键线索。',
          },
          miniLab: {
            title: '分析一段真实的 GPU hang dmesg dump',
            objective: '练习从 dmesg 输出中提取 GPU hang 的关键信息，判断 hang 的类型和可能原因。',
            steps: [
              '阅读以下模拟的 GPU hang dmesg 输出（基于真实 amdgpu hang 日志格式）',
              '识别关键字段：ring 名称、GRBM_STATUS 值、RPTR/WPTR、fence 状态',
              '解析 GRBM_STATUS 的位字段，判断哪些 GPU 引擎在忙',
              '根据 RPTR 和 WPTR 的关系判断 ring 状态',
              '根据 signaled/emitted fence 差值判断丢失的 job 数量',
              '判断这是 soft hang 还是 hard hang',
            ],
            expectedOutput: `练习用的模拟 dmesg 输出:

[  345.678] [drm:amdgpu_job_timedout [amdgpu]] *ERROR*
  ring gfx_0.0.0 timeout, signaled seq=5678, emitted seq=5680
[  345.678] [drm:amdgpu_job_timedout [amdgpu]] *ERROR*
  GRBM_STATUS=0xEE008002
[  345.679] [drm:amdgpu_job_timedout [amdgpu]] *ERROR*
  CP_RB_RPTR=0x0000A100 CP_RB_WPTR=0x0000A180
[  345.680] [drm] ring gfx_0.0.0 IB test timed out
[  345.681] [drm] GPU reset initiated

分析要点:
1. emitted - signaled = 5680 - 5678 = 2 → 2 个 job 未完成
2. GRBM_STATUS=0xEE008002:
   bit 31 (GUI_ACTIVE) = 1, bit 30 (CP_BUSY) = 1
   bit 23 (SPI_BUSY) = 1 → 着色器在执行
3. RPTR(0xA100) < WPTR(0xA180) → ring 有未处理命令
4. IB test 超时 → hard hang，需要 reset`,
            hint: '把 GRBM_STATUS 的十六进制值转成二进制来看各个位。0xEE008002 = 1110_1110_0000_0000_1000_0000_0000_0010。bit 31=1(GUI), bit 30=1(CP), bit 29=1(某引擎), bit 23=1(SPI)。',
          },
          debugExercise: {
            title: '从寄存器值判断 GPU hang 原因',
            language: 'text',
            description: '以下是两个不同的 GPU hang 场景的寄存器状态。判断每个场景的 hang 原因。',
            question: '分析两个场景的寄存器状态，判断各自的 hang 原因和推荐修复方向。',
            buggyCode: `场景 A:
  GRBM_STATUS    = 0x00000000
  CP_RB_RPTR     = 0x0000F000
  CP_RB_WPTR     = 0x0000F000
  signaled fence = 1234
  emitted fence  = 1235
  IB test        = PASSED

场景 B:
  GRBM_STATUS    = 0xEE00FFFF
  CP_RB_RPTR     = 0x00003400
  CP_RB_WPTR     = 0x00003480
  signaled fence = 8900
  emitted fence  = 8901
  IB test        = TIMED OUT
  最近提交的命令: 一个包含 compute shader 的 job
  dmesg 额外信息: amdgpu: GPU fault detected: src_id:146
                  vmid:3 pasid:32772`,
            hint: '场景 A 的 GRBM_STATUS 全 0 意味着 GPU 并不忙。场景 B 有 GPU fault (src_id:146 = VMC page fault)。',
            answer: '场景 A 分析：GRBM_STATUS=0x00000000（GPU 完全空闲），RPTR==WPTR（ring 空），IB test 通过——GPU 硬件没有问题。但 signaled(1234) < emitted(1235)，有 1 个 job 的 fence 没有被 signal。这是一个 soft hang/fence 丢失问题，最可能的原因是中断丢失（GPU 完成了任务但 fence 中断没有到达 CPU）或者 fence 处理代码的 bug（fence_process 没有检查到新完成的 seq）。修复方向：检查中断处理代码、添加 fence polling fallback。场景 B 分析：GRBM_STATUS=0xEE00FFFF（几乎所有引擎都在忙），IB test 超时——hard hang。关键线索是 "GPU fault detected: src_id:146"，src_id 146 是 VMC (Virtual Memory Controller) page fault，说明 compute shader 访问了未映射的 GPU 虚拟地址。GPU 在处理 page fault 时陷入死锁（GRBM 全忙）。修复方向：检查应用程序的 buffer mapping 是否正确，是否有 use-after-free（buffer 已被释放但 shader 还在访问）。',
          },
          interviewQ: {
            question: '描述你分析一个 GPU hang 的完整方法论。从用户报告 "屏幕冻结" 到定位根因的过程。',
            difficulty: 'hard',
            hint: '按层次：收集信息（dmesg）→ 分类 hang 类型（soft/hard）→ 分析寄存器（GRBM_STATUS）→ 分析 ring（RPTR/WPTR）→ 分析命令流（ring content）→ 定位根因。',
            answer: '我的 GPU hang 分析方法论：（1）信息收集：首先获取完整 dmesg（dmesg > hang_log.txt），搜索 "timeout\\|hang\\|reset\\|fault\\|ERROR"。同时收集 /sys/kernel/debug/dri/0/amdgpu_fence_info 和 GPU 状态（pp_dpm_sclk, gpu_busy_percent）。（2）Hang 分类：根据 IB test 结果区分 soft hang（IB test 通过，通常是 fence 丢失或特定 job 异常）和 hard hang（IB test 失败，GPU 完全停止响应）。（3）GRBM_STATUS 分析：解析哪些引擎在忙——如果 SPI_BUSY=1 可能是 shader 死循环；如果 DB_BUSY/CB_BUSY=1 可能是渲染管线阻塞；如果只有 CP_BUSY=1 可能是 CP 的微码 bug。（4）Ring Pointer 分析：RPTR 和 WPTR 的差值告诉你 ring 中有多少未处理命令。如果 RPTR 在多次采样中不变，CP 确实卡住了。计算 RPTR 指向的 ring offset，找到卡住的命令。（5）Ring Content 分析：用 umr --ring-stream 或 debugfs 读取 ring buffer 内容，找到 RPTR 位置的 PM4 命令包——这就是导致 hang 的命令。分析命令类型（draw/dispatch/DMA）和参数。（6）根因定位：结合命令类型、GRBM_STATUS、是否有 GPU fault（VMC page fault 的 src_id:146）、是否可复现，判断是应用 bug（错误的 buffer 映射）、驱动 bug（命令构造错误）还是硬件 bug（特定条件触发的硬件缺陷）。（7）验证修复：提出修复后，用同样的 workload 验证 hang 不再发生，同时运行 IGT gpu-hang 测试确保没有回归。',
            amdContext: '这是 AMD GPU 驱动团队面试中的高频题。展示你有系统化的分析流程，而不是"看到 hang 就 reset"。特别要提到 GRBM_STATUS 位解析和 ring content 分析——这说明你理解 GPU 硬件层面的调试。',
          },
        },

        // ── Lesson 6.2.2 ──────────────────────────────────────
        {
          id: '6-2-2',
          number: '6.2.2',
          title: 'umr：AMD GPU 寄存器调试工具',
          titleEn: 'umr: AMD GPU Register Debug Tool',
          duration: 20,
          difficulty: 'advanced',
          tags: ['umr', 'register', 'GRBM_STATUS', 'ring-stream', 'VRAM', 'wave-status'],
          concept: {
            summary: 'umr（User Mode Register reader）是 AMD 官方的 GPU 寄存器调试工具，可以在用户空间读写 GPU 寄存器、解码寄存器位字段、分析 ring buffer 命令流、读取 VRAM 内容、查看 wave（线程组）状态。它是 AMD 驱动工程师最常用的硬件级调试工具。',
            explanation: [
              'umr 通过 debugfs 接口（/sys/kernel/debug/dri/0/）和 MMIO 映射访问 GPU 寄存器。它内置了完整的 AMD GPU 寄存器数据库——从 GCN 到 RDNA4 的每一代 GPU 的每个寄存器名称、偏移地址、位字段定义都被包含在内。这意味着你不需要查阅硬件手册就能解读寄存器含义。',
              '寄存器读取是 umr 最基本的功能。umr -O bits -r 命令读取一个寄存器并解码每个位字段的含义。例如 umr -O bits -r gfx1100.grbm.mmGRBM_STATUS 会输出 GRBM_STATUS 的值以及每个位的名称和状态（GUI_ACTIVE=1, CP_BUSY=0 等）。-O bits 选项让 umr 显示位级别的详细解码。',
              'ring stream 分析是 umr 在 GPU hang 调试中最有价值的功能。umr --ring-stream gfx[0] 读取 GFX ring buffer 的内容并将原始的 PM4 命令包解码为人可读格式。你可以看到 ring 中的每条命令——SET_SH_REG（设置着色器寄存器）、DRAW_INDEX（绘制命令）、DMA_COPY（数据传输）等。结合 RPTR 位置，你可以精确定位导致 hang 的命令。',
              'umr 的其他高级功能：读写 VRAM 内容（umr --read-vram 0x0 4096 导出 VRAM 数据），查看 wave 状态（umr --waves 显示所有活跃的 shader wave 的 PC、EXEC mask、VGPR/SGPR 状态），查看 VM（虚拟内存）页表映射（umr --vm-decode 解析 GPU 页表）。这些功能在分析复杂的 GPU hang 和着色器 bug 时非常有用。',
            ],
            keyPoints: [
              'umr 通过 debugfs/MMIO 访问 GPU 寄存器，内置完整的 AMD 寄存器数据库',
              'umr -O bits -r: 读取寄存器并解码位字段（最常用命令）',
              'umr --ring-stream gfx[0]: 解码 ring buffer 中的 PM4 命令包',
              'umr --waves: 查看活跃 shader wave 的 PC 和寄存器状态',
              'umr --read-vram: 读取 GPU VRAM 内容（调试帧缓冲/纹理数据）',
              'umr --vm-decode: 解析 GPU 虚拟内存页表映射',
            ],
          },
          diagram: {
            title: 'umr 工具能力全景图',
            content: `umr — AMD GPU 寄存器调试工具能力图

                    umr (User Mode Register reader)
                    ──────────────────────────────
                              │
        ┌─────────┬───────────┼───────────┬──────────┐
        │         │           │           │          │
        ▼         ▼           ▼           ▼          ▼
   ┌─────────┐ ┌─────────┐ ┌──────────┐ ┌────────┐ ┌────────┐
   │寄存器读写│ │Ring 分析│ │VRAM 读写 │ │Wave    │ │VM 页表 │
   │         │ │         │ │          │ │状态    │ │解析    │
   └────┬────┘ └────┬────┘ └────┬─────┘ └───┬────┘ └───┬────┘
        │         │         │          │         │
        ▼         ▼         ▼          ▼         ▼

  umr -O bits   umr --ring  umr --read  umr      umr
  -r gfx1100.   -stream     -vram addr  --waves  --vm
  grbm.mmGRBM   gfx[0]     size                 -decode
  _STATUS                                vmid

  输出示例:    输出示例:    输出示例:  输出示例:  输出示例:
  ┌──────────┐ ┌──────────┐ ┌────────┐ ┌────────┐ ┌────────┐
  │GRBM_STAT │ │PKT3_SET_ │ │00: FF  │ │wave[0] │ │PDE[0]: │
  │=0xEE0080 │ │SH_REG    │ │01: 00  │ │ PC=0x80│ │VA=0x0  │
  │GUI_ACT =1│ │ reg=0x2C │ │02: A5  │ │ EXEC=  │ │PA=0x1M │
  │CP_BUSY =1│ │ val=0x01 │ │03: 5A  │ │ 0xFFFF │ │Valid=1 │
  │SPI_BUSY=1│ │PKT3_DRAW │ │...     │ │ VGPR0= │ │PTE[0]: │
  │TA_BUSY =0│ │_INDEX    │ │        │ │ 3.14   │ │...     │
  │DB_BUSY =0│ │ count=36 │ │        │ │        │ │        │
  │CB_BUSY =1│ │PKT3_NOP  │ │        │ │        │ │        │
  └──────────┘ └──────────┘ └────────┘ └────────┘ └────────┘
  → 诊断哪些   → 找到导致   → 调试帧   → 找到卡  → 诊断 GPU
    引擎卡住     hang的命令   缓冲内容   住的shader  page fault

常用 5 个关键寄存器:
┌────────────────────────────────────────────────────────┐
│  1. GRBM_STATUS    — GPU 全局引擎忙碌状态              │
│  2. CP_RB_RPTR     — Ring Buffer 读指针（CP 当前位置）  │
│  3. CP_RB_WPTR     — Ring Buffer 写指针（最新命令位置）  │
│  4. SRBM_STATUS    — System Register Bus Manager 状态  │
│  5. CP_STALLED_STAT— CP 阻塞原因详情                   │
└────────────────────────────────────────────────────────┘`,
            caption: 'umr 提供五种核心调试能力：寄存器读写、ring buffer 命令流分析、VRAM 内容访问、shader wave 状态查看、GPU 虚拟内存页表解析。这些覆盖了 GPU 硬件调试的所有维度。',
          },
          codeWalk: {
            title: '使用 umr 读取 GRBM_STATUS 并解码',
            file: 'terminal (umr commands)',
            language: 'bash',
            code: `# === umr 基本用法：读取和解码 GPU 寄存器 ===

# 1. 列出当前 GPU 支持的 ASIC
umr --enumerate
# Output: --- amdgpu device 0 ---
#         pci: 0000:03:00.0
#         asic: gfx1100    ← RDNA3 (你的 GPU 代号)

# 2. 读取 GRBM_STATUS 并解码每个位字段
umr -O bits -r gfx1100.grbm.mmGRBM_STATUS
# Output:
# gfx1100.grbm.mmGRBM_STATUS == 0x00000200
#   GUI_ACTIVE           [31] = 0  ← 图形引擎空闲
#   CP_BUSY              [30] = 0  ← 命令处理器空闲
#   CP_COHERENCY_BUSY    [28] = 0
#   SPI_BUSY          [23:22] = 0  ← 着色器处理器空闲
#   TA_BUSY              [17] = 0  ← 纹理单元空闲
#   DB_BUSY              [14] = 0  ← 深度缓冲空闲
#   CB_BUSY              [12] = 0  ← 颜色缓冲空闲
#   GDS_BUSY              [9] = 1  ← Global Data Share 活跃

# 3. 读取 Ring Buffer 指针
umr -O bits -r gfx1100.gfx.mmCP_RB0_RPTR
umr -O bits -r gfx1100.gfx.mmCP_RB0_WPTR

# 4. 读取 SRBM_STATUS (系统层面状态)
umr -O bits -r gfx1100.grbm.mmSRBM_STATUS

# 5. 分析 GFX ring stream (解码 PM4 命令)
umr --ring-stream gfx[0]
# Output:
# Ring[gfx0]: wptr: 0x00001234 rptr: 0x00001200
# --- ring content from rptr ---
# [0x00001200] PKT3_SET_SH_REG:
#     reg: SPI_SHADER_PGM_LO_PS (0x2C08)
#     val: 0x00010000
# [0x00001208] PKT3_SET_CONTEXT_REG:
#     reg: DB_RENDER_CONTROL (0x0000)
#     val: 0x00000001
# [0x00001210] PKT3_DRAW_INDEX_AUTO:
#     count: 36
#     draw_initiator: 0x00000002
# ...

# 6. 查看活跃的 shader waves
umr --waves
# Output:
# se0.sh0.cu0:
#   wave[0]: status=ACTIVE pc=0x800100A8
#     exec_mask=0xFFFFFFFFFFFFFFFF
#     hw_id: queue=0, pipe=0, me=0
#   wave[1]: status=ACTIVE pc=0x800100B0

# 7. 读取 VRAM 数据 (前 256 字节)
umr --read-vram 0x0 256`,
            annotations: [
              'umr --enumerate: 检测系统中的 AMD GPU 并显示 ASIC 代号（gfx1100=RDNA3）',
              '-O bits: 关键选项——让 umr 显示每个位字段的名称和值，而不只是原始十六进制',
              'ring-stream gfx[0]: 解码 GFX ring 0 的 PM4 命令，hang 时这是定位卡住命令的关键',
              '--waves: 显示所有活跃的 shader wave——如果 PC 指针不变化，shader 可能死循环',
              'PKT3 是 PM4 命令格式的标识——PKT3_DRAW_INDEX_AUTO 是绘制命令',
              'GRBM_STATUS 全 0（除 GDS_BUSY）表示 GPU 正常空闲状态',
            ],
            explanation: 'umr 是 AMD 驱动团队内部日常使用的调试工具。-O bits -r 是你用得最多的命令——在 GPU hang 时快速读取 GRBM_STATUS 判断哪些引擎卡住，然后用 --ring-stream 分析卡在哪条命令上。掌握这个工具链能让你的 hang 分析效率提升 10 倍以上。',
          },
          miniLab: {
            title: '安装 umr 并读取 5 个关键寄存器',
            objective: '安装 umr 工具，读取你的 GPU 的 5 个关键寄存器并解读它们的含义。',
            setup: `# 从 AMD 官方仓库安装 umr
# 方法 1: 通过包管理器（如果有）
sudo apt install umr

# 方法 2: 从源码编译
git clone https://gitlab.freedesktop.org/tomstdenis/umr.git
cd umr
mkdir build && cd build
cmake .. && make -j$(nproc)
sudo make install`,
            steps: [
              '确认 umr 已安装并检测到 GPU：sudo umr --enumerate',
              '读取 GRBM_STATUS（全局状态）：sudo umr -O bits -r <asic>.grbm.mmGRBM_STATUS（用 enumerate 输出的 asic 名称替换 <asic>）',
              '读取 SRBM_STATUS（系统状态）：sudo umr -O bits -r <asic>.grbm.mmSRBM_STATUS',
              '读取 GFX ring 的 RPTR 和 WPTR：sudo umr -O bits -r <asic>.gfx.mmCP_RB0_RPTR && sudo umr -O bits -r <asic>.gfx.mmCP_RB0_WPTR',
              '读取 GPU 时钟状态：sudo umr -O bits -r <asic>.smu.mmSMC_IND_DATA（或等效寄存器）',
              '运行 glxgears 后再次读取 GRBM_STATUS，对比空闲和负载时的差异',
              '尝试 ring stream 分析：sudo umr --ring-stream gfx[0] | head -30',
            ],
            expectedOutput: `$ sudo umr --enumerate
--- amdgpu device 0 ---
  pci: 0000:03:00.0
  asic: gfx1100
  instance: 0

$ sudo umr -O bits -r gfx1100.grbm.mmGRBM_STATUS
gfx1100.grbm.mmGRBM_STATUS == 0x00000200
  GUI_ACTIVE           [31] = 0
  CP_BUSY              [30] = 0
  ...                             ← GPU 空闲状态

(运行 glxgears 后)
gfx1100.grbm.mmGRBM_STATUS == 0xC6008002
  GUI_ACTIVE           [31] = 1   ← 图形引擎活跃!
  CP_BUSY              [30] = 1   ← CP 在处理命令!
  SPI_BUSY          [23:22] = 1   ← 着色器在工作!`,
            hint: 'umr 需要 root 权限（通过 debugfs 访问 GPU）。如果报 "cannot find ASIC"，确认 amdgpu 驱动已加载。ASIC 名称（如 gfx1100）取决于你的 GPU 型号——RX 7600 XT 可能是 gfx1100 或 gfx1102。',
          },
          debugExercise: {
            title: '从 umr 输出诊断 GPU hang 状态',
            language: 'text',
            description: '以下是 GPU hang 时通过 umr 采集的寄存器和 ring stream 输出。分析数据找出 hang 的原因。',
            question: '根据 umr 输出判断：(1) GPU 的哪个引擎卡住了？(2) 卡在什么命令上？(3) 最可能的根因是什么？',
            buggyCode: `# umr 在 GPU hang 时的采集数据

$ sudo umr -O bits -r gfx1100.grbm.mmGRBM_STATUS
gfx1100.grbm.mmGRBM_STATUS == 0xEC008002
  GUI_ACTIVE           [31] = 1
  CP_BUSY              [30] = 1
  CP_COHERENCY_BUSY    [28] = 1
  SPI_BUSY          [23:22] = 3  ← 两个 SPI 都忙!
  TA_BUSY              [17] = 0
  DB_BUSY              [14] = 0
  CB_BUSY              [12] = 0

$ sudo umr --ring-stream gfx[0] | grep -A5 "rptr"
Ring[gfx0]: wptr: 0x00002100 rptr: 0x00002080
[0x00002080] PKT3_SET_SH_REG:
    reg: COMPUTE_PGM_LO (0x2E0C)
    val: 0x00020000
[0x00002088] PKT3_DISPATCH_DIRECT:
    dim_x: 65536
    dim_y: 65536
    dim_z: 1
    dispatch_initiator: 0x00000001

$ sudo umr --waves | head -10
se0.sh0.cu0:
  wave[0]: status=ACTIVE pc=0x800200A0
  wave[1]: status=ACTIVE pc=0x800200A0
  wave[2]: status=ACTIVE pc=0x800200A0
  wave[3]: status=ACTIVE pc=0x800200A0
  ← 所有 wave 的 PC 指向同一地址!`,
            hint: '所有 wave 的 PC (Program Counter) 都指向同一地址 0x800200A0，SPI_BUSY=3（两个 SPI 都忙），ring 停在 DISPATCH_DIRECT（compute shader dispatch）...',
            answer: '分析：（1）卡住的引擎：SPI_BUSY=3（两个 Shader Processor Input 都忙）+ GUI_ACTIVE=1 + CP_BUSY=1，但 TA/DB/CB 都空闲。这说明是着色器引擎（Shader Engine）本身卡住了，不是纹理、深度或颜色操作的问题。（2）卡在的命令：ring stream 在 RPTR=0x2080 处是 PKT3_DISPATCH_DIRECT，这是一个 compute shader dispatch 命令，dim_x=65536, dim_y=65536，总共 65536×65536=4,294,967,296 个线程组——这是一个极大的 dispatch。（3）最可能的根因：所有 wave 的 PC 都指向同一地址 0x800200A0，说明 compute shader 在该地址处死循环（如 while(true) 或等待一个永远不满足的条件）。这可能是着色器代码的 bug（无限循环）或者是着色器等待的全局内存地址包含了错误的值（导致 spin-wait 永远不退出）。修复方向：（1）检查 0x800200A0 地址处的 shader ISA 指令（用 umr --waves --decode 解码）；（2）检查 shader 是否有 barrier/spin-lock 逻辑，确认终止条件是否可达；（3）减小 dispatch 维度测试是否还会 hang。',
          },
          interviewQ: {
            question: '你有一个在特定 GPU workload 下可以 100% 复现的 hang。描述你如何使用 umr 工具一步步定位根因。',
            difficulty: 'hard',
            hint: '利用可复现的优势：先正常状态采集基线，再 hang 状态采集对比。使用 umr 的寄存器读取、ring stream、wave status 三个维度逐步缩小范围。',
            answer: '利用 100% 可复现的优势，我会按以下步骤使用 umr：（1）基线采集：在触发 hang 的 workload 运行前，采集 GRBM_STATUS、SRBM_STATUS、CP_RB_RPTR/WPTR 作为正常状态基线。（2）触发 hang：运行 workload，当 dmesg 出现 timeout 警告时（但在 GPU reset 之前），使用脚本快速采集：umr -O bits -r gfx1100.grbm.mmGRBM_STATUS > hang_regs.txt，umr --ring-stream gfx[0] > hang_ring.txt，umr --waves > hang_waves.txt。（3）寄存器对比：对比基线和 hang 时的 GRBM_STATUS，找出哪些引擎从空闲变为忙碌——这定位了问题所在的硬件模块（GFX? SPI? TA? DB?）。（4）Ring Stream 分析：在 hang_ring.txt 中找到 RPTR 位置的命令——这是 CP 卡住的精确位置。解码 PM4 命令类型和参数，确定是 draw call、compute dispatch 还是 DMA 操作。（5）Wave 分析：如果是 shader hang，检查 --waves 输出中所有活跃 wave 的 PC。如果 PC 聚集在同一地址——shader 死循环。如果 PC 分散但 EXEC mask 异常——可能是 divergence bug。用 umr --waves --decode 解码 PC 处的 ISA 指令。（6）VM 分析：如果 dmesg 有 GPU fault，用 umr --vm-decode 检查 fault 地址的页表映射——确认是页表缺失（unmapped）还是权限错误。（7）二分定位：利用可复现性，修改 workload 逐步缩小触发条件（减少 dispatch 大小、禁用特定 shader feature），直到找到最小复现案例。整个过程通常需要 2-4 小时。',
            amdContext: '这个问题测试你的硬件级调试能力。AMD 面试中如果你能流畅描述 umr 的使用场景和具体命令，说明你有实际的 GPU 调试经验——这是区分理论学习和实战经验的关键。',
          },
        },
      ],
    },
  ],
  completionChecklist: [
    '理解 printk 日志级别体系和 DRM_DEBUG 宏的位掩码控制机制',
    '能使用动态调试 (echo "module amdgpu +p") 按需开启/关闭调试输出',
    '能通过 debugfs (/sys/kernel/debug/dri/0/) 读取 GPU 运行时状态',
    '理解 ftrace 架构（ring buffer、function/function_graph tracer、TRACE_EVENT）',
    '能使用 trace-cmd 追踪 amdgpu 追踪点并分析命令提交延迟',
    '能使用 perf top/stat/record 分析 CPU 侧热点并生成火焰图',
    '了解 rocprof --stats/--hsa-trace 和 GPU 硬件计数器的使用方法',
    '掌握 GPU hang 分析方法论：GRBM_STATUS 解析 + RPTR/WPTR 分析 + IB test',
    '理解 amdgpu_job_timedout 和 amdgpu_device_gpu_recover 的流程',
    '能安装和使用 umr 读取 GPU 寄存器、分析 ring stream、查看 wave 状态',
  ],
};
