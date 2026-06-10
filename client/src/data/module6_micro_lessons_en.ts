// ============================================================
// AMD Linux Driver Learning Platform - Module 6 Micro-Lessons (English)
// Module 6: Debugging & Profiling
// 5 lessons in 2 groups, ~15-20 min each, total ~50h curriculum
// ============================================================
import type { MicroLessonModule } from './micro_lesson_types';

export const module6MicroLessonsEn: MicroLessonModule = {
  moduleId: 'debugging',
  groups: [
    // ════════════════════════════════════════════════════════════
    // Group 6.1: Kernel Debugging Tools (kernel debugging tool chain)
    // ════════════════════════════════════════════════════════════
    {
      id: '6-1',
      number: '6.1',
      title: 'Kernel debugging toolchain',
      titleEn: 'Kernel Debugging Tools',
      icon: 'Wrench',
      description: 'Master the core debugging methods of the Linux kernel and amdgpu driver: printk logging system, dynamic debugging, ftrace kernel tracing, perf and rocprof performance analysis. These tools are the "arsenal" that AMD driver engineers use every day.',
      lessons: [
        // ── Lesson 6.1.1 ──────────────────────────────────────
        {
          id: '6-1-1',
          number: '6.1.1',
          title: 'printk, dynamic debugging and debugfs',
          titleEn: 'printk, Dynamic Debug & debugfs',
          duration: 20,
          difficulty: 'advanced',
          tags: ['printk', 'dynamic-debug', 'debugfs', 'DRM_DEBUG', 'dmesg'],
          concept: {
            summary: 'printk is the most basic debugging method in the kernel - it writes messages to the kernel ring buffer, which can be read through dmesg. The amdgpu driver uses the DRM_DEBUG macro family and dynamic debug to implement fine log control, while debugfs provides a file system interface for inspecting the internal state of the GPU at runtime.',
            explanation: [
              'printk is the kernel\'s printf, but instead of outputting to the terminal, it writes to a fixed-size ring buffer (default 128KB-1MB). Each message has a log level (0-7): KERN_EMERG(0) is the highest priority, KERN_DEBUG(7) is the lowest. The kernel\'s console_loglevel parameter determines which levels of messages will be output to the console. The amdgpu driver uses convenience macros such as pr_info(), pr_err(), pr_debug(), etc., which automatically add module name prefixes.',
              'The DRM subsystem has its own log system: DRM_DEBUG_DRIVER(), DRM_DEBUG_KMS(), DRM_DEBUG_ATOMIC() and other macros. The output of these macros is controlled by the drm.debug module parameters - which is a bitmask (hex flag values): CORE=0x01, DRIVER=0x02, KMS=0x04, PRIME=0x08, ATOMIC=0x10, LEASE=0x80. For example, setting drm.debug=0x1e (0x02|0x04|0x08|0x10) will enable the debug output of DRIVER + KMS + PRIME + ATOMIC. In amdgpu code, DRM_DEBUG_DRIVER() is the most commonly used debugging macro, used to print driver internal logic information.',
              'Dynamic debugging is a powerful feature of the Linux kernel that allows pr_debug() and dev_dbg() output to be precisely switched by module, file, function or line number at runtime. The official interface is /sys/kernel/debug/dynamic_debug/control: echo "module amdgpu +p" turns on all pr_debug output of amdgpu, echo "file amdgpu_device.c +p" turns on only specific files. This is much more efficient than recompiling the kernel.',
              'debugfs is a memory file system (mounted at /sys/kernel/debug/), in which the amdgpu driver registers a large number of debugging interfaces. The path /sys/kernel/debug/dri/0/ contains: amdgpu_fence_info (fence status - tracking GPU task completion), amdgpu_gpu_recover (manually triggering GPU reset), amdgpu_ring_gfx (GFX ring buffer content), amdgpu_pm_info (power management status), etc. These files are a real-time window into the internal state of the GPU and are more direct than dmesg logs.',
            ],
            keyPoints: [
              'printk log level 0-7: KERN_EMERG(0) > ERR(3) > WARN(4) > INFO(6) > DEBUG(7)',
              'pr_info/pr_err/pr_debug are printk convenience macros with module prefixes',
              'DRM_DEBUG_DRIVER() output is controlled by drm.debug bitmask, bit 2 = DRIVER',
              'Dynamic debugging: echo "module amdgpu +p" > /sys/kernel/debug/dynamic_debug/control',
              'debugfs path /sys/kernel/debug/dri/0/ provides GPU runtime status interface',
              'amdgpu_fence_info displays the fence serial number of each ring - the key to determining whether the GPU is stuck.',
            ],
          },
          diagram: {
            title: 'Panorama of amdgpu log and debugging interface',
            content: `amdgpu debug information flow - from kernel to user space

Kernel space (amdgpu driver) user space
─────────────────────                    ─────────

pr_err("amdgpu: ...") ──→ dmesg (level 3, always output)
pr_warn("amdgpu: ...") ──→ dmesg (level 4, always output)
pr_info("amdgpu: ...") ──→ dmesg (level 6, always output)
pr_debug("amdgpu: ...") ──→ dmesg (level 7, dynamic debugging needs to be enabled)
       │                                       │
│Control method: │
       │  echo "module amdgpu +p"              │
       │  > /sys/kernel/debug/                 ▼
       │    dynamic_debug/control          dmesg -w | grep amdgpu
       │
DRM_DEBUG_DRIVER(...) ──→ dmesg (requires drm.debug bitmask)
  DRM_DEBUG_KMS(...)                   │
DRM_DEBUG_ATOMIC(...) │ Control method:
       │                                │  echo 0x1e > /sys/module/drm/
       │                                │              parameters/debug
       │                                │
│ │ drm.debug bitmask:
       │                                │  0x02 = DRIVER
       │                                │  0x04 = KMS
       │                                │  0x10 = ATOMIC
│ │ 0x1e = All commonly used
       │
debugfs registration ──→ /sys/kernel/debug/dri/0/
       │                                ├── amdgpu_fence_info
       │                                │   emitted=1234 signaled=1233
│ │ → seq difference = number of unfinished tasks
       │                                ├── amdgpu_gpu_recover
│ │ echo 1 > trigger manual reset
       │                                ├── amdgpu_ring_gfx
│ │ ring buffer original content
       │                                ├── amdgpu_pm_info
│ │ Frequency/Voltage/Temperature
       │                                ├── amdgpu_sa_info
│ │ Sub-allocator status
       │                                └── amdgpu_vm_info
│Virtual memory mapping information

sysfs properties ──→ /sys/class/drm/card0/device/
├── pp_dpm_sclk (GPU frequency)
                                       ├── gpu_busy_percent
                                       └── mem_info_vram_used`,
            caption: 'Three debugging information channels of the amdgpu driver: printk/DRM_DEBUG → dmesg, debugfs → runtime status file, sysfs → hardware properties. Mastering these three channels is fundamental to debugging GPU issues.',
          },
          codeWalk: {
            title: 'Internal implementation of DRM_DEBUG_DRIVER macro',
            file: 'include/drm/drm_print.h + drivers/gpu/drm/amd/amdgpu/amdgpu_cs.c',
            language: 'c',
            code: `/*drm_print.h — DRM debugging macro definition */

/*Bit definition of drm.debug parameter */
#define DRM_UT_NONE   0x00
#define DRM_UT_CORE 0x01 /* DRM core */
#define DRM_UT_DRIVER 0x02 /* Driver specific */
#define DRM_UT_KMS 0x04 /* KMS mode setting */
#define DRM_UT_PRIME 0x08 /* PRIME buffer sharing */
#define DRM_UT_ATOMIC 0x10 /* Atomic mode setting */
#define DRM_UT_VBL    0x20  /* VBlank */
#define DRM_UT_STATE 0x40 /* status check */
#define DRM_UT_LEASE 0x80 /* DRM lease */

/*DRM_DEBUG_DRIVER macro — the most commonly used debug output in amdgpu */
#define DRM_DEBUG_DRIVER(fmt, ...)                       \\
    drm_dbg(DRM_UT_DRIVER, fmt, ##__VA_ARGS__)

/*The final call path after expansion:
 * DRM_DEBUG_DRIVER("ring %s timeout", ring->name)
 *   → drm_dbg(DRM_UT_DRIVER, "ring %s timeout", ring->name)
 *     → __drm_dbg(DRM_UT_DRIVER, ...)
 *       → if (__drm_debug & DRM_UT_DRIVER)
 *             printk(KERN_DEBUG "[drm:func_name] ring gfx timeout")
 *
 *Output only when bit 1 (0x02) of the drm.debug parameter is set
 */

/*Actual usage example in amdgpu_cs.c */
int amdgpu_cs_ioctl(struct drm_device *dev, void *data,
                     struct drm_file *filp)
{
    /*This log is only output when drm.debug & DRM_UT_DRIVER */
    DRM_DEBUG_DRIVER("cs ioctl: num_chunks=%u",
                     cs->in.num_chunks);

    /*DRM_ERROR for errors - always output, not controlled by drm.debug */
    if (r) {
        DRM_ERROR("Failed to initialize parser: %d", r);
        return r;
    }
}`,
            annotations: [
              'DRM_UT_DRIVER = 0x02: DRM_DEBUG_DRIVER output control bit, drm.debug needs to contain this bit',
              'drm.debug is a runtime tunable parameter: echo 0x02 > /sys/module/drm/parameters/debug',
              'DRM_DEBUG_DRIVER finally calls printk(KERN_DEBUG ...) but adds [drm: function name] prefix',
              'DRM_ERROR uses KERN_ERR level, always output to dmesg, not controlled by drm.debug',
              '__drm_debug is a global variable that stores the current drm.debug bitmask value',
              'There are thousands of DRM_DEBUG_DRIVER calls in amdgpu code - turning them all on will generate a lot of logs',
            ],
            explanation: 'It\'s important to understand the implementation of DRM_DEBUG_DRIVER: it\'s not a simple printk, but a conditional output checked by a bitmask. This means that in a production environment, the overhead of these debugging statements is almost zero (just a bit-AND operation), but they can be enabled on demand during debugging by modifying the drm.debug parameter. A lot of amdgpu\'s debugging information is hidden behind these macros - you just need to know how to turn them on.',
          },
          miniLab: {
            title: 'Enable amdgpu dynamic debugging and read debugfs',
            objective: 'The actual operation is to enable the dynamic debugging output of amdgpu, set the drm.debug parameters, and read the GPU running status through debugfs.',
            steps: [
              'View the current drm.debug level: cat /sys/module/drm/parameters/debug (default is 0)',
              'Enable DRIVER level debugging: sudo sh -c \'echo 0x02 > /sys/module/drm/parameters/debug\'',
              'Open a new terminal for real-time monitoring: sudo dmesg -w | grep "\\[drm\\]"',
              'Trigger some GPU activity (such as moving windows, running glxgears) and observe the DRM_DEBUG_DRIVER output',
              'Enable amdgpu dynamic debugging: sudo sh -c \'echo "module amdgpu +p" > /sys/kernel/debug/dynamic_debug/control\'',
              'Read fence status: sudo cat /sys/kernel/debug/dri/0/amdgpu_fence_info',
              'Read GPU power information: sudo cat /sys/kernel/debug/dri/0/amdgpu_pm_info',
              'Turn off debug output when finished: sudo sh -c \'echo 0 > /sys/module/drm/parameters/debug\' && sudo sh -c \'echo "module amdgpu -p" > /sys/kernel/debug/dynamic_debug/control\'',
            ],
            expectedOutput: `$ cat /sys/module/drm/parameters/debug
0x0

$ sudo sh -c 'echo 0x02 > /sys/module/drm/parameters/debug'
$ dmesg -w | grep "\\[drm\\]"
[12345.678] [drm:amdgpu_cs_ioctl] cs ioctl: num_chunks=2
[12345.679] [drm:amdgpu_cs_parser_init] parser init: ring=gfx
...Lots of debug output...

$ sudo cat /sys/kernel/debug/dri/0/amdgpu_fence_info
--- ring gfx_0.0.0 ---
Last signaled fence          0x0000000000001a3f
Last emitted                 0x0000000000001a40
  ←emitted - signaled = 1, indicating that there is 1 task being executed on the GPU`,
            hint: 'If /sys/kernel/debug/ is empty, debugfs needs to be mounted: sudo mount -t debugfs debugfs /sys/kernel/debug. Without sufficient permissions, all operations require sudo. Remember to turn off debugging output after the experiment, otherwise a large number of logs will be generated and affect performance.',
          },
          debugExercise: {
            title: 'The mystery of disappearing debug output',
            language: 'bash',
            description: 'A developer added a DRM_DEBUG_DRIVER() debug statement to the amdgpu code but saw no output in dmesg. Here are his steps to find out why you can\'t see debugging information.',
            question: 'Why doesn\'t debugging information appear in dmesg? What needs to be modified?',
            buggyCode: `#The developer added: to amdgpu_fence.c:
# DRM_DEBUG_DRIVER("fence signaled: seq=%llu", fence->seq);

#After recompiling and loading the module:
$ sudo rmmod amdgpu && sudo modprobe amdgpu
$ dmesg | grep "fence signaled"
(no output)

#The developer checked the log levels:
$ cat /proc/sys/kernel/printk
4    4    1    7
#(console_loglevel=4, that is, only WARN and above are displayed)

#The developer thought it was a problem with console_loglevel and raised it:
$ sudo sysctl kernel.printk="8 4 1 7"
$ dmesg | grep "fence signaled"
(Still no output!)

#drm.debug parameter status:
$ cat /sys/module/drm/parameters/debug
0x0`,
            hint: 'DRM_DEBUG_DRIVER is not only controlled by console_loglevel - it also has its own switch.',
            answer: 'The problem is that the drm.debug parameter is 0x0. The DRM_DEBUG_DRIVER() macro internally checks __drm_debug & DRM_UT_DRIVER (0x02) first. If it is 0, it returns directly and printk is not called at all. So even raising the console_loglevel to the highest level has no effect - printk is not executed at all. Fix: echo 0x02 > /sys/module/drm/parameters/debug Enable DRIVER-level DRM debugging. Or add drm.debug=0x02 in the startup parameters. This is a common mistake made by newbies - DRM\'s debug output has two layers of gating: the first layer is the drm.debug bitmask (DRM layer), and the second layer is console_loglevel (printk layer), both layers must be passed to see the output.',
          },
          interviewQ: {
            question: 'Describe your debugging methodology in amdgpu driver development. What tools and strategies do you use when you encounter a hard-to-reproduce bug?',
            difficulty: 'medium',
            hint: 'Hierarchical answer: first dmesg + printk (basic logging), then dynamic debugging (fine control), then debugfs (runtime status), then ftrace (function tracing), and finally hardware level tools (umr register reading).',
            answer: 'My debugging methodology is layered and progressive: (1) The first layer - log analysis: dmesg | grep -i "amdgpu\\|error\\|timeout\\|fault" to obtain the full picture of the error information. Check for explicit hints of GPU hang/reset/fault. (2) Second layer - increase log granularity: echo 0x1e > /sys/module/drm/parameters/debug turns on all DRM debug output, echo "module amdgpu +p" turns on pr_debug of amdgpu. Add DRM_DEBUG_DRIVER() to the critical code path and recompile the module. (3) The third layer - debugfs status check: cat amdgpu_fence_info to see if the fence is stagnant, cat amdgpu_ring_gfx to check the ring buffer status. For intermittent bugs, write a script to periodically sample the debugfs status. (4) The fourth layer - ftrace function tracing: trace-cmd record -p function_graph -l "amdgpu_*" traces the function call chain and time consumption, and finds out the abnormal path. (5) Layer 5 - Hardware diagnosis: Use umr to read key registers such as GRBM_STATUS and analyze the GPU hardware status. For bugs that are difficult to reproduce, the key strategies are: increase logging without reducing performance (use trace_printk instead of printk), write automated test scripts to trigger loops, and use kdump/crash to save the kernel state in the event of a crash.',
            amdContext: 'AMD interviews attach great importance to systematic debugging skills. Show that you can gradually upgrade from the simplest tool (dmesg) to the most complex tool (umr/ftrace), rather than using the heaviest method from the beginning.',
          },
        },

        // ── Lesson 6.1.2 ──────────────────────────────────────
        {
          id: '6-1-2',
          number: '6.1.2',
          title: 'ftrace and kernel tracepoints',
          titleEn: 'ftrace & Kernel Tracepoints',
          duration: 20,
          difficulty: 'advanced',
          tags: ['ftrace', 'tracepoints', 'TRACE_EVENT', 'trace-cmd', 'ring-buffer'],
          concept: {
            summary: 'ftrace is the built-in tracing framework of the Linux kernel. It records function calls and time consumption by inserting probes at function entry/exit. Combined with the tracepoints defined by the TRACE_EVENT macro, you can accurately track the delays and behaviors of key paths such as amdgpu command submission and job scheduling.',
            explanation: [
              'The core of ftrace is an efficient ring buffer (per-CPU ring buffer). The probe in the kernel writes events to the buffer, and the user space reads them through tracefs (/sys/kernel/tracing/) or the trace-cmd tool. ftrace has extremely low overhead - an inactive trace point is just a NOP instruction (5 bytes), which is replaced at runtime by code patching with a jump to the trace handler function.',
              'ftrace provides a variety of tracers: function tracer records each function call (function name + caller), function_graph tracer records function entry and exit (you can see the call tree and the time consumption of each function), irqsoff tracer records the longest interrupt disable time, and preemptoff tracer records the longest preemption disable time. For amdgpu debugging, function_graph is the most commonly used - it can visually display the complete call chain of command submission and the time taken for each step.',
              'TRACE_EVENT is a standard macro that defines kernel trace points. amdgpu defines multiple tracing points in amdgpu_trace.h: amdgpu_cs_ioctl (command submission entry), amdgpu_sched_run_job (scheduler running job), amdgpu_vm_bo_map (virtual memory mapping), amdgpu_bo_create (buffer object creation), etc. These trace points record structured data (such as ring name, fence sequence, job size), are more efficient than printk and can be automatically analyzed with perf/trace-cmd.',
              'trace-cmd is a userspace frontend for ftrace that greatly simplifies operation. trace-cmd record -e amdgpu -p function_graph can record all amdgpu trace point events and function graph traces with one command. trace-cmd report parses binary data into readable output. For performance analysis, trace-cmd output can be imported into KernelShark (GUI tool) for visual timeline analysis.',
            ],
            keyPoints: [
              'ftrace uses per-CPU ring buffer. Inactive trace points are just NOP instructions, which has extremely low overhead.',
              'function_graph tracer shows function call tree and time consumption - a powerful tool for diagnosing latency problems',
              'amdgpu trace points: amdgpu_cs_ioctl, amdgpu_sched_run_job, amdgpu_vm_bo_map',
              'The TRACE_EVENT macro is defined in amdgpu_trace.h and records structured data',
              'trace-cmd record/report is a simple front-end for ftrace, recommended for daily use',
              'KernelShark can visualize trace-cmd output and visually display events on the timeline',
            ],
          },
          diagram: {
            title: 'ftrace architecture and amdgpu tracepoints',
            content: `ftrace architecture - from trace points to user space analysis

kernel space
    ┌──────────────────────────────────────────────┐
    │                                              │
│ Trace points in amdgpu code │
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
│ ┌─────────── ftrace framework ────────────────┐ │
    │  │                                       │   │
    │  │  function tracer (mcount/fentry hook)  │   │
    │  │  ┌─ amdgpu_cs_ioctl                   │   │
    │  │  ├─ amdgpu_cs_parser_init             │   │
    │  │  ├─ amdgpu_cs_submit                  │   │
    │  │  └─ ...                               │   │
    │  │                                       │   │
│ │ TRACE_EVENT tracking point │ │
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
│ User Space │
    │                                              │
    │  tracefs: /sys/kernel/tracing/               │
    │  ├── trace              ←Read text directly │
    │  ├── trace_pipe         ←Live streaming reading │
    │  ├── current_tracer     ←Set tracker type │
    │  ├── set_ftrace_filter  ←Filter function │
    │  └── events/amdgpu/     ←amdgpu trace point │
    │      ├── amdgpu_cs_ioctl/enable              │
    │      └── amdgpu_sched_run_job/enable         │
    │                                              │
    │  trace-cmd record -e amdgpu → trace.dat      │
│ trace-cmd report trace.dat → text output │
│ kernelshark trace.dat → GUI timeline │
    └──────────────────────────────────────────────┘`,
            caption: 'The complete data flow of ftrace: trace points and function probes in amdgpu code write events to the per-CPU ring buffer, and user space reads and analyzes via tracefs or trace-cmd.',
          },
          codeWalk: {
            title: 'TRACE_EVENT definition in amdgpu_trace.h',
            file: 'drivers/gpu/drm/amd/amdgpu/amdgpu_trace.h',
            language: 'c',
            code: `/*amdgpu_trace.h — amdgpu trace point definition */

#include <linux/tracepoint.h>

/*Trace CS (Command Submission) ioctl calls */
TRACE_EVENT(amdgpu_cs_ioctl,
    /*Parameters passed in when the tracking point is triggered */
    TP_PROTO(struct amdgpu_job *job),

    TP_ARGS(job),

    /*Record fields in ring buffer */
    TP_STRUCT__entry(
        __field(uint64_t, sched_job_id)
        __field(u32, ring)
        __field(u32, num_ibs)
        __string(timeline, AMDGPU_JOB_GET_TIMELINE_NAME(job))
    ),

    /*How to populate fields from parameters */
    TP_fast_assign(
        __entry->sched_job_id = job->base.id;
        __entry->ring = job->ring->idx;
        __entry->num_ibs = job->num_ibs;
        __assign_str(timeline,
                     AMDGPU_JOB_GET_TIMELINE_NAME(job));
    ),

    /*Output format (used by trace-cmd report and /sys/kernel/tracing/trace)*/
    TP_printk("sched_job=%llu, timeline=%s, ring=%u, num_ibs=%u",
              __entry->sched_job_id,
              __get_str(timeline),
              __entry->ring,
              __entry->num_ibs)
);

/*Track scheduler execution jobs */
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

/*Usage in amdgpu_cs.c:
 *trace_amdgpu_cs_ioctl(job); ← cs ioctl entry
 *trace_amdgpu_sched_run_job(job); ← job starts execution
 *
 *Trace delay = sched_run_job.timestamp - cs_ioctl.timestamp
 *This is the scheduling delay of command submission → GPU execution
 */`,
            annotations: [
              'TRACE_EVENT macro generates complete tracing infrastructure: registration/logout, formatting, filtering, etc.',
              'TP_STRUCT__entry defines a compact binary format for writing to ring buffer, which is more efficient than printk',
              'TP_fast_assign is executed when the tracking point is triggered and must be as fast as possible - to avoid complex calculations',
              'TP_printk defines a human-readable format and only performs formatting when reading in user space',
              '__string and __assign_str handle variable-length strings and store them compactly in the ring buffer',
              'trace_amdgpu_cs_ioctl(job) is a calling function automatically generated by the macro',
            ],
            explanation: 'These two trace points are the core of amdgpu performance analysis. amdgpu_cs_ioctl is triggered when user space submits a command, and amdgpu_sched_run_job is triggered when the GPU scheduler actually executes the job. The time difference between the two events is the scheduling delay - if this delay is unusually large, it means there is a bottleneck in the scheduler or the GPU is processing other tasks. This delay can be automatically calculated through trace-cmd.',
          },
          miniLab: {
            title: 'Trace amdgpu command commit delays using trace-cmd',
            objective: 'Use trace-cmd to record amdgpu trace point events and analyze the scheduling delay of command submission to GPU execution.',
            setup: `#Install trace-cmd
sudo apt install trace-cmd

#Confirm that amdgpu tracepoints are available
ls /sys/kernel/tracing/events/amdgpu/
#You should see directories such as amdgpu_cs_ioctl/ amdgpu_sched_run_job/`,
            steps: [
              'List all amdgpu trace points: trace-cmd list -e amdgpu',
              'Start recording the amdgpu trace point: sudo trace-cmd record -e amdgpu -o /tmp/amdgpu_trace.dat',
              'Run glxgears or any GPU program in another terminal for about 5 seconds',
              'Return to the trace-cmd terminal and press Ctrl+C to stop recording.',
              'View the report: trace-cmd report /tmp/amdgpu_trace.dat | head -50',
              'Trace the function graph: sudo trace-cmd record -p function_graph -l "amdgpu_cs_*" -o /tmp/amdgpu_cs.dat, Ctrl+C after 5 seconds of running glxgears',
              'View the function graph: trace-cmd report /tmp/amdgpu_cs.dat | head -80',
            ],
            expectedOutput: `$ trace-cmd report /tmp/amdgpu_trace.dat | head -20
  glxgears-5234 [002] 12345.678: amdgpu_cs_ioctl:  sched_job=4567, timeline=gfx_0.0.0, ring=0, num_ibs=1
  kworker-58    [001] 12345.679: amdgpu_sched_run_job: sched_job=4567, timeline=gfx_0.0.0
                                                        ←The delay from submission to execution is about 1ms

$ trace-cmd report /tmp/amdgpu_cs.dat | head -20
  glxgears-5234 [002] 12345.678:
    | amdgpu_cs_ioctl() {
    |   amdgpu_cs_parser_init() {    0.854 us
    |   amdgpu_cs_parser_bos() {     2.341 us
    |   amdgpu_cs_submit() {         1.120 us
    | }                              5.234 us  ←Total time spent`,
            hint: 'If the trace-cmd list -e amdgpu output is empty, verify that the kernel was compiled with CONFIG_FTRACE and CONFIG_TRACEPOINTS enabled. Most distribution kernels enable these options by default.',
          },
          debugExercise: {
            title: 'Locating scheduling delays from ftrace output',
            language: 'text',
            description: 'The following is a piece of trace-cmd output showing the timestamps of GPU command submission and execution. One commit had unusually high scheduling latency. Find out the problem.',
            question: 'Which command submission resulted in an abnormal scheduling delay? What are the possible reasons?',
            buggyCode: `#trace-cmd report output (simplified)

#Normal command submission (delay ~0.5ms)
glxgears-5234 [002] 10000.100: amdgpu_cs_ioctl: sched_job=100, ring=0
kworker-58    [001] 10000.100: amdgpu_sched_run_job: sched_job=100
→ Delay: 0.5ms ✓

glxgears-5234 [002] 10000.117: amdgpu_cs_ioctl: sched_job=101, ring=0
kworker-58    [001] 10000.117: amdgpu_sched_run_job: sched_job=101
→ Delay: 0.4ms ✓

#Unusual command submission
glxgears-5234 [002] 10000.134: amdgpu_cs_ioctl: sched_job=102, ring=0
kworker-58    [001] 10000.284: amdgpu_sched_run_job: sched_job=102
  → Delay: 150ms ✗ ←300 times slower than normal!

glxgears-5234 [002] 10000.301: amdgpu_cs_ioctl: sched_job=103, ring=0
kworker-58    [001] 10000.301: amdgpu_sched_run_job: sched_job=103
→ Delay: 0.6ms ✓ (Return to normal)

#Other traces from the same time period:
blender-8901  [003] 10000.135: amdgpu_cs_ioctl: sched_job=5000, ring=0
blender-8901  [003] 10000.136: amdgpu_cs_ioctl: sched_job=5001, ring=0
... (blender submitted ~200 jobs continuously)
blender-8901  [003] 10000.280: amdgpu_sched_run_job: sched_job=5199`,
            hint: 'A large number of commits for job 102 and blender occur in the same time window, and they use the same ring...',
            answer: 'The scheduling delay of job 102 is unusually high at 150ms. Reason: The blender process continuously submitted about 200 jobs to the same GFX ring (ring=0) between 10000.135-10000.280. amdgpu\'s GPU scheduler uses a first-in-first-out (FIFO) queue (drm_sched), glxgears\' job 102 was submitted at 10000.134, but was queued behind blender\'s 200 jobs. The GPU needs to process all blender jobs before it can execute job 102. This is a typical scheduler queue saturation problem. Solutions: (1) Use different rings/contexts to isolate GPU workloads of different applications; (2) Adjust the time slice of the GPU scheduler (timeout parameter of drm_sched); (3) Use priority scheduling (if the driver supports it) to give interactive applications higher priority.',
          },
          interviewQ: {
            question: 'Explain how ftrace\'s function_graph tracer works. How does it trace function calls and returns without modifying the source code?',
            difficulty: 'hard',
            hint: 'Keywords: mcount/fentry, return trampoline, gcc -pg, runtime code patching, NOP replacement.',
            answer: 'The principle of function_graph tracer: (1) Compilation time: GCC uses the -pg parameter to compile the kernel and insert a call to mcount (or __fentry__) at each function entry. Initially these calls are replaced by NOP instructions, incurring no runtime overhead. (2) When tracing is activated: ftrace uses runtime code patching (via stop_machine or text_poke_bp) to replace NOPs with instructions to jump to ftrace_caller. (3) Function entry processing: ftrace_caller calls the registered callback function (trace_graph_entry of function_graph), and records the function name, timestamp, and CPU ID to the per-CPU ring buffer. (4) Return tracking (key skills): function_graph modifies the return address on the stack - save the original return address to the ret_stack array in task_struct and replace it with the return_to_handler trampoline function. When the function returns, it first executes return_to_handler, records the return timestamp (the execution time can be calculated), and then jumps to the real return address. (5) Performance impact: Each traced function adds about 100-500ns overhead (saving/restoring context + ring buffer writing), and may have a 10-30% performance impact when globally enabled, so set_ftrace_filter is usually used to only trace the functions of interest.',
            amdContext: 'This question tests your depth of understanding of the underlying mechanisms of the kernel. If you can explain the return trampoline mechanism and NOP patching, it shows that you have a deep understanding of the kernel internals.',
          },
        },

        // ── Lesson 6.1.3 ──────────────────────────────────────
        {
          id: '6-1-3',
          number: '6.1.3',
          title: 'perf and rocprof performance analysis',
          titleEn: 'perf & rocprof Profiling',
          duration: 20,
          difficulty: 'advanced',
          tags: ['perf', 'rocprof', 'flame-graph', 'PMU', 'profiling'],
          concept: {
            summary: 'perf is a performance analysis tool for the Linux kernel that samples CPU-side hotspots through hardware performance counters (PMU) and software events. rocprof is AMD\'s GPU-side profiling tool that collects GPU hardware counters, HSA traces, and kernel timelines. The combination of the two can comprehensively analyze the performance bottlenecks of CPU+GPU mixed workloads.',
            explanation: [
              'perf utilizes the CPU\'s Performance Monitoring Unit (PMU) hardware counters for sampling. The PMU can count events such as CPU cycles, cache misses, branch mispredictions, etc. The working principle of perf: An interrupt (NMI) occurs every N events, the instruction pointer (IP) at that time is recorded, and the number of times each function is sampled is generated after statistics - the greater the number of samples, the more CPU time the function consumes.',
              'Commonly used subcommands of perf: perf top (real-time display of CPU hotspot functions, similar to top but accurate to functions), perf stat (statistics of the total number of hardware events executed by the program, such as cycles/instructions/cache-misses), perf record (sampling and saving to the perf.data file), perf report (interactive analysis of perf.data). For the analysis of amdgpu kernel module, perf can directly see the CPU consumption of kernel functions.',
              'rocprof is a GPU performance analysis tool from the AMD ROCm ecosystem. It has three main modes: --stats mode (counts the execution time and number of calls of each GPU kernel), --hsa-trace mode (traces the complete timeline of API calls, memory copies, and kernel dispatch during HSA runtime), and hardware counter mode (specifies the GPU PMU counters to be collected through input.txt, such as SQ_WAVES, SQ_INSTS_VALU, TA_BUFFER_WAVEFRONTS_SUM).',
              'Flame Graph is a way to visualize perf data - the x-axis is the function call stack (width represents the sampling percentage), and the y-axis is the call depth. Brendan Gregg\'s FlameGraph script (github.com/brendangregg/FlameGraph) can convert perf script output into an interactive SVG flame graph. For amdgpu debugging, the flame graph can visually show which functions in the kernel consume the most CPU time - common hot spots include fence polling, register read/write, and memory allocation.',
            ],
            keyPoints: [
              'perf top/stat/record/report: CPU-side performance analysis four-piece set',
              'perf samples via PMU hardware counter, overhead < 5%, can be used in production environments',
              'rocprof --stats: GPU kernel execution time statistics',
              'rocprof --hsa-trace: HSA API + memory copy + kernel dispatch timeline',
              'rocprof hardware counters: SQ_WAVES, SQ_INSTS_VALU and other GPU microarchitecture events',
              'Flame Graph: Visualization of perf data, x-axis width = CPU time ratio',
            ],
          },
          diagram: {
            title: 'CPU (perf) + GPU (rocprof) joint analysis architecture',
            content: `CPU + GPU joint performance analysis workflow

┌────────── Applications (such as AI training) ──────────┐
│                                              │
│CPU code GPU code (HIP kernel) │
│ Data preprocessing matrix multiplication │
│ Memory allocation Convolution operation │
│GPU Scheduling... │
│       │                    │                  │
└───────┼────────────────────┼──────────────────┘
        │                    │
  ┌─────▼──────┐      ┌─────▼──────┐
  │   perf     │      │  rocprof   │
│ (CPU side) │ │ (GPU side) │
  │            │      │            │
  │ perf stat  │      │ --stats    │
│ cycles │ │ kernel time │
│ cache-miss│ │ Number of calls │
  │  IPC       │      │            │
  │            │      │ --hsa-trace│
│ perf record│ │ API call │
│ Sampling │ │ Memory Copy │
│ call stack │ │ dispatch │
  │            │      │            │
│ perf report│ │ Hardware counters │
│ Hotspot functions │ │ SQ_WAVES │
  │            │      │ SQ_INSTS   │
│ → Flame graph │ │ L2 cache │
  └─────┬──────┘      └─────┬──────┘
        │                    │
        ▼                    ▼
  ┌──────────────────────────────────────┐
│ Integration of analysis results │
  │                                      │
│ Typical findings: │
│ ├─ CPU Hotspot: amdgpu_fence_wait_any │
│ │ → fence polling accounts for 30% of CPU │
│ │ → Solution: Switch to interrupt waiting mode │
  │  │                                    │
│ ├─ GPU Hotspot: matmul_kernel │
│ │ → SQ_WAVES utilization is only 40% │
│ │ → Solution: Increase workgroup size │
  │  │                                    │
│ └─ CPU-GPU interaction: │
│ → Data copying accounts for 60% of the total time │
│ → Solution: Use pinned memory │
  └──────────────────────────────────────┘`,
            caption: 'perf analyzes CPU-side hot spots (driver code, scheduling, fence wait), and rocprof analyzes GPU-side hot spots (kernel execution, memory bandwidth). The combination of the two can completely locate the bottleneck of CPU+GPU workloads.',
          },
          codeWalk: {
            title: 'Use perf to locate amdgpu kernel hotspot functions',
            file: 'terminal',
            language: 'bash',
            code: `#=== perf analyzes the CPU consumption of amdgpu kernel module ===

#1. perf top: View system-wide CPU hot spots in real time
sudo perf top -g
#  Overhead  Shared Object     Symbol
#  --------  ----------------  --------
#    12.34%  [amdgpu]          amdgpu_fence_process
#     8.21%  [amdgpu]          amdgpu_ring_commit
#     5.67%  [kernel.vmlinux]  _raw_spin_lock_irqsave
#     3.45%  [amdgpu]          amdgpu_bo_move

#2. perf stat: Statistics of hardware events of GPU programs
sudo perf stat -e cycles,instructions,cache-misses,\\
    context-switches -- glxgears -info

#  Performance counter stats for 'glxgears':
#    2,345,678,901  cycles
#    1,876,543,210  instructions  # IPC = 0.80
#       12,345,678  cache-misses
#            3,456  context-switches

#3. perf record: Sampling and generating flame graph
sudo perf record -g -a -- sleep 10
#(running GPU workload during runtime)
sudo perf script > /tmp/perf_out.txt

#Generate flame graph (requires FlameGraph tool)
# git clone https://github.com/brendangregg/FlameGraph
cat /tmp/perf_out.txt | \\
    FlameGraph/stackcollapse-perf.pl | \\
    FlameGraph/flamegraph.pl > /tmp/amdgpu_flamegraph.svg

#4. perf analyzes specific amdgpu functions
sudo perf probe -m amdgpu -a amdgpu_cs_ioctl
sudo perf record -e probe:amdgpu_cs_ioctl -aR -- sleep 5
sudo perf report

#=== rocprof GPU side analysis ===

#5. rocprof --stats: GPU kernel execution time
rocprof --stats ./my_hip_app
# kernel-name     calls  avg-time  total-time
# matmul_kernel     100   1.23ms    123.0ms
# relu_kernel       100   0.05ms      5.0ms

#6. rocprof --hsa-trace: complete timeline
rocprof --hsa-trace ./my_hip_app
#Generate results.json, which can be viewed using chrome://tracing

#7. rocprof hardware counter
echo 'pmc: SQ_WAVES SQ_INSTS_VALU TA_BUSY_avr' > input.txt
rocprof -i input.txt ./my_hip_app`,
            annotations: [
              'perf top -g: -g displays the call graph (call graph), you can see who is calling the hot function',
              'IPC (Instructions Per Cycle) < 1.0 usually indicates a memory bottleneck or branch prediction failure',
              'perf record -g -a: -g records the call stack, -a samples all CPUs (including kernel mode)',
              'perf probe can dynamically create trace points on kernel functions without recompiling',
              'avg-time of rocprof --stats is the average execution time of GPU kernel, excluding dispatch delay',
              'The rocprof hardware counter SQ_WAVES is the number of waves emitted to the CU, reflecting GPU utilization',
            ],
            explanation: 'This code shows the complete workflow of CPU+GPU joint analysis. In actual amdgpu development, perf top is the most commonly used "quick view" tool - if you see amdgpu_fence_process taking up a lot of CPU, fence polling is the bottleneck. rocprof is used to analyze the efficiency of the GPU kernel itself. Flame graphs are the best way to present analysis results to your team.',
          },
          miniLab: {
            title: 'Use perf + rocprof to analyze GPU application performance',
            objective: 'Use perf and rocprof combined to analyze a GPU application and find performance bottlenecks on the CPU and GPU sides.',
            setup: `#Install perf and FlameGraph
sudo apt install linux-tools-$(uname -r) linux-tools-common
git clone https://github.com/brendangregg/FlameGraph ~/FlameGraph

#rocprof requires ROCm environment
# sudo apt install rocprofiler`,
            steps: [
              'Run perf top -g to observe CPU hotspots during GPU activity (running glxgears or any GPU program)',
              'Use perf stat to collect hardware counters of glxgears: sudo perf stat glxgears (Ctrl+C after running for 10 seconds)',
              'Record system-wide samples: sudo perf record -g -a -- sleep 10 (running GPU program during this period)',
              'View the perf report: sudo perf report (find the function starting with [amdgpu])',
              'Generate a flame graph: sudo perf script | ~/FlameGraph/stackcollapse-perf.pl | ~/FlameGraph/flamegraph.pl > /tmp/gpu_flame.svg',
              'Open /tmp/gpu_flame.svg with a browser and find the amdgpu related function stack',
              'If you have ROCm: run rocprof --stats ./your_hip_app to view GPU kernel time',
            ],
            expectedOutput: `$ sudo perf stat glxgears
#After running for 10 seconds Ctrl+C

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
            hint: 'If perf record reports a permission error, you can temporarily release the restrictions: sudo sysctl kernel.perf_event_paranoid=-1. Generating a flame graph requires perf.data collected with root permissions because kernel symbols are required.',
          },
          debugExercise: {
            title: 'Excessive fence polling from perf data location',
            language: 'text',
            description: 'The following perf report output shows a GPU application with unusually high CPU usage (100% single core). Analyze the data to find out why.',
            question: 'Why is this GPU application taking up one CPU core? Propose optimization plans.',
            buggyCode: `$ sudo perf report --stdio

# Overhead  Command     Shared Object    Symbol
# ........  ..........  ...............  ......
    42.31%  my_gpu_app  [amdgpu]         amdgpu_fence_wait_any
    18.67%  my_gpu_app  [amdgpu]         amdgpu_fence_process
    12.45%  my_gpu_app  [kernel]         _raw_spin_lock_irqsave
     8.23%  my_gpu_app  [amdgpu]         amdgpu_device_rreg
     5.11%  my_gpu_app  my_gpu_app       main
     3.89%  my_gpu_app  libdrm_amdgpu    amdgpu_cs_query_fence_status

#Call stack (amdgpu_fence_wait_any):
# amdgpu_fence_wait_any
#   └─ amdgpu_fence_process
#       └─ amdgpu_device_rreg
#└─ readl ← MMIO register reading

#top output:
# PID   %CPU  COMMAND
# 5678  99.8  my_gpu_app`,
            hint: '42% of the time is spent in fence_wait_any, while its subfunction amdgpu_device_rreg (readl) is the MMIO register read...',
            answer: 'Problem: The application uses busy-wait/spin polling to wait for the GPU to complete. The perf data shows that 42% of the CPU time is in amdgpu_fence_wait_any, and the call chain is fence_wait → fence_process → rreg → readl. This shows that the driver is constantly polling the GPU\'s fence register to check whether the task is completed, rather than waiting for an interrupt. Each readl() is an MMIO read, with a latency of about 500ns-1μs across the PCIe bus, and continuous polling will occupy the CPU core. Optimization solution: (1) Use DRM_IOCTL_AMDGPU_WAIT_CS to wait with timeout parameters - it will make the process sleep and wake up through GPU interrupt, and the CPU usage is close to 0; (2) If it is waiting inside the driver code, use dma_fence_wait_timeout() instead of busy-wait, which uses GPU interrupt (generated by amdgpu_fence_driver_irq_type) to notify fence Completed; (3) If low latency is required, you can spin for a short period of time and then switch to interrupt waiting (hybrid polling). This is one of the most common performance issues in GPU application development.',
          },
          interviewQ: {
            question: 'How do you analyze the end-to-end performance of a GPU computing application? Describe the tools and methodologies you used.',
            difficulty: 'hard',
            hint: 'Hierarchical analysis: first macroscopically (the total time is broken down into CPU/GPU/data transfer), then microscopically (use perf on the CPU side, rocprof on the GPU side, and HSA trace for data transfer).',
            answer: 'End-to-end performance analysis methodology: (1) Macro time decomposition: First use rocprof --hsa-trace to obtain the complete timeline, and decompose the total time into three parts - CPU calculation, GPU kernel execution, and CPU↔GPU data transmission. This step determines which side the bottleneck is on. (2) CPU side analysis: perf stat obtains hardware indicators such as IPC and cache-miss. perf record -g samples and generates flame graphs to find CPU hotspot functions. Common problems: fence polling occupies CPU (use interrupt waiting instead), frequent memory allocation (use buffer pool), lock competition (reduce critical section). (3) GPU side analysis: rocprof --stats finds the most time-consuming kernel. Use rocprof hardware counter analysis on the hot kernel: SQ_WAVES (wave utilization), SQ_INSTS_VALU (ALU utilization), TCP_TCC_READ_REQ (L2 cache request). Common problems: insufficient occupancy (increase workgroup size), memory bandwidth bottleneck (optimize memory access mode). (4) Data transmission analysis: HSA trace displays the size and time of each H2D/D2H copy. Optimization: Use pinned memory to avoid extra copies, use hipMemcpyAsync to overlap with the kernel, and use unified memory to reduce explicit copies. (5) Integrated optimization: According to Amdahl\'s law, optimize the part with the largest proportion first. Use chrome://tracing to visualize the HSA trace JSON to confirm the optimization effect.',
            amdContext: 'AMD particularly values ​​​​whether you can analyze performance from a system-wide perspective - not just "GPU kernel is slow", but understanding how the interaction between the CPU, GPU, and PCIe bus affects overall performance.',
          },
        },
      ],
    },

    // ════════════════════════════════════════════════════════════
    // Group 6.2: GPU Issue Analysis (GPU issue analysis)
    // ════════════════════════════════════════════════════════════
    {
      id: '6-2',
      number: '6.2',
      title: 'GPU problem analysis',
      titleEn: 'GPU Issue Analysis',
      icon: 'Flame',
      description: 'In-depth GPU hang analysis methodology and AMD-specific debugging tool umr. Learn to diagnose GPU hardware problems from the three dimensions of dmesg logs, register status, and ring buffer content - this is the core skill of AMD driver engineers.',
      lessons: [
        // ── Lesson 6.2.1 ──────────────────────────────────────
        {
          id: '6-2-1',
          number: '6.2.1',
          title: 'GPU Hang Analysis Methodology',
          titleEn: 'GPU Hang Analysis Methodology',
          duration: 20,
          difficulty: 'advanced',
          tags: ['GPU-hang', 'GRBM_STATUS', 'CP_RB_RPTR', 'gpu-recover', 'timeout'],
          concept: {
            summary: 'GPU Hang is the most common and thorny problem in driver development - the GPU stops responding and commands in the ring buffer are no longer executed. amdgpu detects hang through job timeout, diagnoses the cause through GRBM_STATUS/CP_RB_RPTR/WPTR register, and recovers through GPU reset. Systematic hang analysis methodology is the core skill of AMD driver engineers.',
            explanation: [
              'Definition of GPU Hang: The GPU\'s command processor (CP) stops fetching and executing commands from the ring buffer. From the driver\'s perspective, it appears that the job submitted to the GPU has exceeded the timeout and has not been completed (the fence has not been signaled). The default timeout for amdgpu is 10 seconds (adjustable via the amdgpu.lockup_timeout module parameter). When timeout occurs, drm_sched calls amdgpu_job_timedout() to start the diagnostic and recovery process.',
              'amdgpu_job_timedout() is the entry function for hang processing. Its flow: (1) Read the GRBM_STATUS register - this is the GPU global status register, the bits in it indicate which engine is busy (GUI_ACTIVE, CP_BUSY, SPI_BUSY, etc.). (2) Read CP_RB_RPTR (Ring Buffer Read Pointer) and CP_RB_WPTR (Write Pointer) - if RPTR == WPTR, the ring is empty (GPU has processed all commands); if RPTR < WPTR and does not change, CP is stuck on a certain command. (3) Try IB test (write a simple NOP command to the ring and wait for completion) - if the IB test passes, it means that the ring itself does not hang, and the problem may be with a specific command.',
              'GRBM_STATUS (Graphics Register Bus Manager Status) is the most important register for diagnosing hang. Key bits: bit 31 GUI_ACTIVE (whether the graphics engine is active), bit 30 CP_BUSY (whether the command processor is busy), bit 22-23 SPI_BUSY (whether the shader processor is busy), bit 17 TA_BUSY (texture address unit), bit 14 DB_BUSY (depth buffer), bit 12 CB_BUSY (color buffer). If CP_BUSY=1 and RPTR does not change, CP is stuck executing the current command - possibly a shader infinite loop, a memory access violation, or a hardware defect.',
              'GPU Reset is the last resort to recover from hang. The process of amdgpu_device_gpu_recover(): (1) Notify all clients (DRM, KFD, display) that the GPU is about to reset; (2) Stop the scheduling of all rings; (3) Execute Mode 1 Reset (write to the GRBM_SOFT_RST register) or Mode 2 Reset (perform a complete GPU reset through PSP); (4) Reinitialize all IP Blocks (GFX, SDMA, VCN etc.); (5) Restore the ring buffer and resubmit the queued job. The entire process takes about 1-5 seconds, and the screen may flicker during this time.',
            ],
            keyPoints: [
              'GPU Hang = CP stops taking commands from the ring buffer, expressed as job timeout (default 10 seconds)',
              'amdgpu_job_timedout(): hang processing entry, read GRBM_STATUS and CP_RB_RPTR/WPTR',
              'GRBM_STATUS key bits: GUI_ACTIVE(31), CP_BUSY(30), SPI_BUSY(22-23)',
              'CP_RB_RPTR == WPTR → ring empty (processed); RPTR < WPTR and unchanged → CP stuck',
              'IB test: Send NOP command to the ring to test - passing means there is no problem with the ring itself',
              'GPU Reset: soft reset (GRBM_SOFT_RST) or full reset (PSP mode2)',
            ],
          },
          diagram: {
            title: 'GPU Hang detection and recovery process',
            content: `The complete process of GPU Hang from detection to recovery

┌─────────── Normal operation ────────────┐
│                                │
│ Application submission job → ring buffer │
│ CP execution command → fence signal │
│ drm_sched marks job completion │
│                                │
└──────────────┬─────────────────┘
│ fence signal not sent within 10s
               ▼
┌─────────── Timeout detection ────────┐
│                                │
│  drm_sched_job_timedout()      │
│       │                        │
│       ▼                        │
│  amdgpu_job_timedout()         │
│                                │
└──────────────┬─────────────────┘
               │
               ▼
┌─────────── Status collection ────────────┐
│                                │
│  1. GRBM_STATUS = 0xEE008002  │
│ Analysis: │
│     bit 31: GUI_ACTIVE = 1     │
│     bit 30: CP_BUSY    = 1     │
│     bit 23: SPI_BUSY   = 1     │
│ → Graphics engine+CP+SPI are all busy! │
│                                │
│  2. CP_RB_RPTR = 0x00001200   │
│     CP_RB_WPTR = 0x00001234   │
│ → RPTR < WPTR, ring is not empty │
│ → CP stuck at offset 0x1200 │
│                                │
│  3. IB test: TIMEOUT           │
│ → ring confirm hang │
│                                │
└──────────────┬─────────────────┘
               │
               ▼
┌─────────── dmesg output ──────────┐
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
│ ├─ Notify all clients │
│ ├─ Stop all ring scheduling │
│  ├─ Mode 1: GRBM_SOFT_RST     │
│ │ └─ If failed → │
│  │     Mode 2: PSP full reset  │
│ ├─ Reinitialize IP Blocks │
│ ├─ Restore ring buffers │
│ └─ Rescheduling queued jobs │
│                                │
│  [drm] GPU reset succeeded     │
│                                │
└────────────────────────────────┘`,
            caption: 'The complete processing flow of GPU Hang: timeout detection → status collection (GRBM_STATUS, RPTR/WPTR) → dmesg recording → GPU reset recovery. Information at each stage is critical to diagnosing the cause of the hang.',
          },
          codeWalk: {
            title: 'amdgpu_job_timedout function analysis',
            file: 'drivers/gpu/drm/amd/amdgpu/amdgpu_job.c',
            language: 'c',
            code: `/*amdgpu_job.c — GPU job timeout processing */

static enum drm_gpu_sched_stat
amdgpu_job_timedout(struct drm_sched_job *s_job)
{
    struct amdgpu_ring *ring = to_amdgpu_ring(s_job->sched);
    struct amdgpu_job *job = to_amdgpu_job(s_job);
    struct amdgpu_device *adev = ring->adev;
    uint32_t grbm_status, rptr, wptr;

    /*1. Read GPU status register */
    grbm_status = RREG32(mmGRBM_STATUS);
    DRM_ERROR("GRBM_STATUS=0x%08X
", grbm_status);

    /*Parse the key bits of GRBM_STATUS */
    if (grbm_status & GRBM_STATUS__GUI_ACTIVE_MASK)
        DRM_ERROR("  GUI_ACTIVE: graphics engine active
");
    if (grbm_status & GRBM_STATUS__CP_BUSY_MASK)
        DRM_ERROR("  CP_BUSY: command processor busy
");

    /*2. Read the Ring Buffer pointer */
    rptr = RREG32(ring->rptr_reg);
    wptr = RREG32(ring->wptr_reg);
    DRM_ERROR("ring %s: rptr=0x%08X wptr=0x%08X
",
              ring->name, rptr, wptr);

    if (rptr == wptr)
        DRM_ERROR("  ring is empty — job may have completed"
                  " but fence not signaled
");

    /*3. Try IB test (send NOP to ring) */
    if (amdgpu_ring_test_ib(ring, 1000) == 0) {
        DRM_INFO("ring %s IB test passed — soft hang
",
                 ring->name);
        /*IB test passed: The fence may be missing and no reset is required */
        return DRM_GPU_SCHED_STAT_NOMINAL;
    }

    /*4. IB test failed: real GPU hang, triggering reset */
    DRM_ERROR("ring %s IB test failed — hard hang!
",
              ring->name);

    /*Record fence status */
    DRM_ERROR("signaled fence=%llu, emitted fence=%llu
",
              atomic64_read(&ring->fence_drv.last_seq),
              ring->fence_drv.sync_seq);

    /*Trigger GPU recovery */
    amdgpu_device_gpu_recover(adev, job, false);

    return DRM_GPU_SCHED_STAT_NOMINAL;
}

/*GPU recovery core function */
int amdgpu_device_gpu_recover(struct amdgpu_device *adev,
                               struct amdgpu_job *job,
                               bool force)
{
    /*Step 1: Try soft reset */
    r = amdgpu_asic_reset(adev);
    if (r) {
        /*soft reset failed, try mode2 (PSP) reset */
        r = amdgpu_dpm_mode2_reset(adev);
    }

    /*Reinitialize all IP blocks */
    amdgpu_device_ip_reinit_early(adev);
    amdgpu_device_ip_reinit_late(adev);

    /*Restore the status of all rings */
    amdgpu_fence_driver_hw_init(adev);

    return r;
}`,
            annotations: [
              'RREG32(mmGRBM_STATUS): Read the GPU global status and determine which engines are busy',
              'rptr == wptr: The ring is empty but the fence has no signal - possibly a missing interrupt or a fence processing bug',
              'amdgpu_ring_test_ib(): Write NOP command test to ring - distinguish between soft hang and hard hang',
              'soft hang: IB test passed, the GPU can execute new commands, the problem is that the specific job times out or the fence is lost',
              'hard hang: IB test failed, GPU stopped responding completely, need to reset',
              'amdgpu_device_gpu_recover: first soft reset → fail and then mode2 reset → reinitialize IP',
            ],
            explanation: 'amdgpu_job_timedout is the function that is called when you see "ring gfx_0.0.0 timeout" in dmesg. Understanding its logic is crucial to analyzing GPU hangs - it tells you the precise state of the GPU at that time (which engines are busy, where the ring pointer is, whether the IB test passed). When you submit a bug report related to GPU hang, this information is a key clue for developers to locate the problem.',
          },
          miniLab: {
            title: 'Analyze a real GPU hang dmesg dump',
            objective: 'Practice extracting key information of GPU hang from dmesg output and determine the type and possible causes of hang.',
            steps: [
              'Read the following simulated GPU hang dmesg output (based on real amdgpu hang log format)',
              'Identify key fields: ring name, GRBM_STATUS value, RPTR/WPTR, fence status',
              'Parse the bit field of GRBM_STATUS to determine which GPU engines are busy',
              'Determine the ring status based on the relationship between RPTR and WPTR',
              'Determine the number of lost jobs based on the signaled/emitted fence difference',
              'Determine whether this is a soft hang or a hard hang',
            ],
            expectedOutput: `Simulated dmesg output for practice:

[  345.678] [drm:amdgpu_job_timedout [amdgpu]] *ERROR*
  ring gfx_0.0.0 timeout, signaled seq=5678, emitted seq=5680
[  345.678] [drm:amdgpu_job_timedout [amdgpu]] *ERROR*
  GRBM_STATUS=0xEE008002
[  345.679] [drm:amdgpu_job_timedout [amdgpu]] *ERROR*
  CP_RB_RPTR=0x0000A100 CP_RB_WPTR=0x0000A180
[  345.680] [drm] ring gfx_0.0.0 IB test timed out
[  345.681] [drm] GPU reset initiated

Analysis points:
1. emitted - signaled = 5680 - 5678 = 2 → 2 jobs unfinished
2. GRBM_STATUS=0xEE008002:
   bit 31 (GUI_ACTIVE) = 1, bit 30 (CP_BUSY) = 1
bit 23 (SPI_BUSY) = 1 → shader is executing
3. RPTR(0xA100) < WPTR(0xA180) → ring has unprocessed commands
4. IB test times out → hard hang, requires reset`,
            hint: 'Convert the hexadecimal value of GRBM_STATUS to binary to look at each bit. 0xEE008002 = 1110_1110_0000_0000_1000_0000_0000_0010. bit 31=1(GUI), bit 30=1(CP), bit 29=1(an engine), bit 23=1(SPI).',
          },
          debugExercise: {
            title: 'Determining the cause of GPU hang based on register values',
            language: 'text',
            description: 'Below are the register states for two different GPU hang scenarios. Determine the hang reason for each scenario.',
            question: 'Analyze the register status of the two scenarios to determine the respective hang causes and recommended repair directions.',
            buggyCode: `Scenario A:
  GRBM_STATUS    = 0x00000000
  CP_RB_RPTR     = 0x0000F000
  CP_RB_WPTR     = 0x0000F000
  signaled fence = 1234
  emitted fence  = 1235
  IB test        = PASSED

Scenario B:
  GRBM_STATUS    = 0xEE00FFFF
  CP_RB_RPTR     = 0x00003400
  CP_RB_WPTR     = 0x00003480
  signaled fence = 8900
  emitted fence  = 8901
  IB test        = TIMED OUT
Most recently submitted command: a job containing a compute shader
dmesg additional information: amdgpu: GPU fault detected: src_id:146
                  vmid:3 pasid:32772`,
            hint: 'Scenario A\'s GRBM_STATUS is all 0\'s meaning the GPU is not busy. Scenario B has GPU fault (src_id:146 = VMC page fault).',
            answer: 'Scenario A analysis: GRBM_STATUS=0x00000000 (GPU is completely idle), RPTR==WPTR (ring is empty), IB test passed - there is no problem with the GPU hardware. But signaled(1234) < emitted(1235), there is 1 job of fence that is not signaled. This is a soft hang/fence loss problem, and the most likely cause is an interrupt loss (GPU completed the task but the fence interrupt did not reach the CPU) or a bug in the fence processing code (fence_process did not check the newly completed seq). Fix direction: Check interrupt handling code, add fence polling fallback. Scenario B analysis: GRBM_STATUS=0xEE00FFFF (almost all engines are busy), IB test times out - hard hang. The key clue is "GPU fault detected: src_id:146", src_id 146 is a VMC (Virtual Memory Controller) page fault, indicating that the compute shader accessed an unmapped GPU virtual address. GPU deadlocks (GRBM all busy) while processing page fault. Repair direction: Check whether the application\'s buffer mapping is correct and whether there is use-after-free (the buffer has been released but the shader is still accessing it).',
          },
          interviewQ: {
            question: 'Describe your complete methodology for analyzing a GPU hang. The journey from user reporting "screen freeze" to locating the root cause.',
            difficulty: 'hard',
            hint: 'By level: Collect information (dmesg) → Classify hang type (soft/hard) → Analyze register (GRBM_STATUS) → Analyze ring (RPTR/WPTR) → Analyze command flow (ring content) → Locate the root cause.',
            answer: 'My GPU hang analysis methodology: (1) Information collection: First obtain the complete dmesg (dmesg > hang_log.txt) and search for "timeout\\|hang\\|reset\\|fault\\|ERROR". Also collects /sys/kernel/debug/dri/0/amdgpu_fence_info and GPU status (pp_dpm_sclk, gpu_busy_percent). (2) Hang classification: According to the IB test results, soft hang (IB test passed, usually due to fence loss or specific job exception) and hard hang (IB test failed, GPU stopped responding completely). (3) GRBM_STATUS analysis: Analyze which engines are busy - if SPI_BUSY=1, it may be a shader infinite loop; if DB_BUSY/CB_BUSY=1, it may be rendering pipeline blocking; if only CP_BUSY=1, it may be a CP microcode bug. (4) Ring Pointer analysis: The difference between RPTR and WPTR tells you how many unprocessed commands there are in the ring. If RPTR does not change over multiple samples, CP is indeed stuck. Calculate the ring offset pointed by RPTR and find the stuck command. (5) Ring Content analysis: Use umr --ring-stream or debugfs to read the ring buffer content and find the PM4 command package at the RPTR location - this is the command that causes hang. Analyze command type (draw/dispatch/DMA) and parameters. (6) Root cause location: Combined with the command type, GRBM_STATUS, whether there is a GPU fault (VMC page fault\'s src_id: 146), and whether it is reproducible, determine whether it is an application bug (wrong buffer mapping), a driver bug (command construction error), or a hardware bug (hardware defect triggered by specific conditions). (7) Verify the fix: After proposing the fix, use the same workload to verify that the hang no longer occurs, and run the IGT gpu-hang test to ensure there is no regression.',
            amdContext: 'This is a frequently asked question in AMD GPU driver team interviews. Show that you have a systematic analysis process, rather than "reset when you see hang". Special mention goes to GRBM_STATUS bit parsing and ring content analysis - this shows that you understand GPU hardware level debugging.',
          },
        },

        // ── Lesson 6.2.2 ──────────────────────────────────────
        {
          id: '6-2-2',
          number: '6.2.2',
          title: 'umr: AMD GPU register debugging tool',
          titleEn: 'umr: AMD GPU Register Debug Tool',
          duration: 20,
          difficulty: 'advanced',
          tags: ['umr', 'register', 'GRBM_STATUS', 'ring-stream', 'VRAM', 'wave-status'],
          concept: {
            summary: 'umr (User Mode Register reader) is AMD\'s official GPU register debugging tool. It can read and write GPU registers in user space, decode register bit fields, analyze the ring buffer command stream, read VRAM content, and view wave (thread group) status. It is the most commonly used hardware-level debugging tool by AMD driver engineers.',
            explanation: [
              'umr accesses GPU registers through the debugfs interface (/sys/kernel/debug/dri/0/) and MMIO mapping. It has a complete AMD GPU register database built-in - every register name, offset address, bit field definition for every generation of GPU from GCN to RDNA4 is included. This means you don\'t need to consult the hardware manual to interpret the register meaning.',
              'Register reading is the most basic function of umr. The umr -O bits -r command reads a register and decodes the meaning of each bit field. For example, umr -O bits -r gfx1100.grbm.mmGRBM_STATUS will output the value of GRBM_STATUS and the name and status of each bit (GUI_ACTIVE=1, CP_BUSY=0, etc.). The -O bits option causes umr to display bit-level detailed decoding.',
              'Ring stream analysis is umr\'s most valuable feature in GPU hang debugging. umr --ring-stream gfx[0] Read the contents of the GFX ring buffer and decode the raw PM4 command packet into a human-readable format. You can see every command in the ring - SET_SH_REG (set shader registers), DRAW_INDEX (draw command), DMA_COPY (data transfer), etc. Combined with the RPTR location, you can pinpoint the command that caused the hang.',
              'Other advanced functions of umr: read and write VRAM content (umr --read-vram 0x0 4096 exports VRAM data), view wave status (umr --waves displays the PC, EXEC mask, VGPR/SGPR status of all active shader waves), view VM (virtual memory) page table mapping (umr --vm-decode parses GPU page table). These features are useful when analyzing complex GPU hangs and shader bugs.',
            ],
            keyPoints: [
              'umr accesses GPU registers through debugfs/MMIO and has a complete AMD register database built-in',
              'umr -O bits -r: read registers and decode bit fields (most commonly used commands)',
              'umr --ring-stream gfx[0]: Decode PM4 command packets in ring buffer',
              'umr --waves: View the PC and register status of active shader waves',
              'umr --read-vram: Read GPU VRAM contents (debug framebuffer/texture data)',
              'umr --vm-decode: Parse GPU virtual memory page table mapping',
            ],
          },
          diagram: {
            title: 'Panorama of umr tool capabilities',
            content: `umr — AMD GPU register debugging tool capability map

                    umr (User Mode Register reader)
                    ──────────────────────────────
                              │
        ┌─────────┬───────────┼───────────┬──────────┐
        │         │           │           │          │
        ▼         ▼           ▼           ▼          ▼
   ┌─────────┐ ┌─────────┐ ┌──────────┐ ┌────────┐ ┌────────┐
│Register reading and writing│ │Ring analysis│ │VRAM reading and writing │ │Wave │ │VM page table │
│ │ │ │ │ │ │Status │ │Analysis │
   └────┬────┘ └────┬────┘ └────┬─────┘ └───┬────┘ └───┬────┘
        │         │         │          │         │
        ▼         ▼         ▼          ▼         ▼

  umr -O bits   umr --ring  umr --read  umr      umr
  -r gfx1100.   -stream     -vram addr  --waves  --vm
  grbm.mmGRBM   gfx[0]     size                 -decode
  _STATUS                                vmid

Output example: Output example: Output example: Output example: Output example:
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
→ Diagnose which → Find the cause → Debug frames → Find the card → Diagnose the GPU
The engine is stuck, hang command, buffer content, shader page fault.

5 commonly used key registers:
┌────────────────────────────────────────────────────────┐
│ 1. GRBM_STATUS — GPU global engine busy status │
│ 2. CP_RB_RPTR — Ring Buffer read pointer (CP current position) │
│ 3. CP_RB_WPTR — Ring Buffer write pointer (latest command position) │
│ 4. SRBM_STATUS — System Register Bus Manager status │
│ 5. CP_STALLED_STAT—CP blocking reason details │
└────────────────────────────────────────────────────────┘`,
            caption: 'umr provides five core debugging capabilities: register reading and writing, ring buffer command flow analysis, VRAM content access, shader wave status viewing, and GPU virtual memory page table analysis. These cover all dimensions of GPU hardware debugging.',
          },
          codeWalk: {
            title: 'Use umr to read GRBM_STATUS and decode',
            file: 'terminal (umr commands)',
            language: 'bash',
            code: `#=== Basic usage of umr: reading and decoding GPU registers ===

#1. List the ASICs currently supported by the GPU
umr --enumerate
# Output: --- amdgpu device 0 ---
#         pci: 0000:03:00.0
#asic: gfx1100 ← RDNA3 (your GPU codename)

#2. Read GRBM_STATUS and decode each bit field
umr -O bits -r gfx1100.grbm.mmGRBM_STATUS
# Output:
# gfx1100.grbm.mmGRBM_STATUS == 0x00000200
#GUI_ACTIVE [31] = 0 ← Graphics engine idle
#CP_BUSY [30] = 0 ← Command processor idle
#   CP_COHERENCY_BUSY    [28] = 0
#SPI_BUSY [23:22] = 0 ← Shader processor idle
#TA_BUSY [17] = 0 ← Texture unit is idle
#DB_BUSY [14] = 0 ← depth buffer free
#CB_BUSY [12] = 0 ← color buffer free
#GDS_BUSY [9] = 1 ← Global Data Share active

#3. Read the Ring Buffer pointer
umr -O bits -r gfx1100.gfx.mmCP_RB0_RPTR
umr -O bits -r gfx1100.gfx.mmCP_RB0_WPTR

#4. Read SRBM_STATUS (system level status)
umr -O bits -r gfx1100.grbm.mmSRBM_STATUS

#5. Analyze GFX ring stream (decode PM4 commands)
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

#6. View active shader waves
umr --waves
# Output:
# se0.sh0.cu0:
#   wave[0]: status=ACTIVE pc=0x800100A8
#     exec_mask=0xFFFFFFFFFFFFFFFF
#     hw_id: queue=0, pipe=0, me=0
#   wave[1]: status=ACTIVE pc=0x800100B0

#7. Read VRAM data (first 256 bytes)
umr --read-vram 0x0 256`,
            annotations: [
              'umr --enumerate: Detect AMD GPU in the system and display ASIC codename (gfx1100=RDNA3)',
              '-O bits: Key option - makes umr display the name and value of each bit field, not just the raw hex',
              'ring-stream gfx[0]: Decode the PM4 command of GFX ring 0. This is the key to locating the stuck command when hanging.',
              '--waves: Display all active shader waves - if the PC pointer does not change, the shader may loop endlessly',
              'PKT3 is the identifier of the PM4 command format - PKT3_DRAW_INDEX_AUTO is the drawing command',
              'GRBM_STATUS all 0 (except GDS_BUSY) indicates the normal idle state of the GPU',
            ],
            explanation: 'umr is a debugging tool used daily within the AMD driver team. -O bits -r is the command you use most - quickly read GRBM_STATUS when the GPU hangs to determine which engines are stuck, and then use --ring-stream to analyze which command is stuck. Mastering this tool chain can increase your hang analysis efficiency by more than 10 times.',
          },
          miniLab: {
            title: 'Install umr and read 5 key registers',
            objective: 'Install the umr tool to read your GPU\'s 5 key registers and decipher their meaning.',
            setup: `#Install umr from AMD official repository
#Method 1: Through the package manager (if you have one)
sudo apt install umr

#Method 2: Compile from source
git clone https://gitlab.freedesktop.org/tomstdenis/umr.git
cd umr
mkdir build && cd build
cmake .. && make -j$(nproc)
sudo make install`,
            steps: [
              'Confirm that umr is installed and detects the GPU: sudo umr --enumerate',
              'Read GRBM_STATUS (global status): sudo umr -O bits -r <asic>.grbm.mmGRBM_STATUS (replace <asic> with the asic name output by enumerate)',
              'Read SRBM_STATUS (system status): sudo umr -O bits -r <asic>.grbm.mmSRBM_STATUS',
              'Read the RPTR and WPTR of the GFX ring: sudo umr -O bits -r <asic>.gfx.mmCP_RB0_RPTR && sudo umr -O bits -r <asic>.gfx.mmCP_RB0_WPTR',
              'Read GPU clock status: sudo umr -O bits -r <asic>.smu.mmSMC_IND_DATA (or equivalent register)',
              'Read GRBM_STATUS again after running glxgears and compare the difference between idle and load',
              'Try ring stream analysis: sudo umr --ring-stream gfx[0] | head -30',
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
  ...                             ←GPU idle state

(after running glxgears)
gfx1100.grbm.mmGRBM_STATUS == 0xC6008002
  GUI_ACTIVE           [31] = 1   ←Graphics engine active!
  CP_BUSY              [30] = 1   ←CP is processing the command!
  SPI_BUSY          [23:22] = 1   ←Shaders working!`,
            hint: 'umr requires root privileges (GPU access via debugfs). If "cannot find ASIC" is reported, confirm that the amdgpu driver has been loaded. The ASIC name (e.g. gfx1100) depends on your GPU model - for the RX 7600 XT it might be gfx1100 or gfx1102.',
          },
          debugExercise: {
            title: 'Diagnosing GPU hang status from umr output',
            language: 'text',
            description: 'The following are the registers and ring stream output collected through umr when the GPU hangs. Analyze the data to find the cause of the hang.',
            question: 'Judging based on umr output: (1) Which engine of the GPU is stuck? (2) What command is stuck on? (3) What is the most likely root cause?',
            buggyCode: `#umr collected data during GPU hang

$ sudo umr -O bits -r gfx1100.grbm.mmGRBM_STATUS
gfx1100.grbm.mmGRBM_STATUS == 0xEC008002
  GUI_ACTIVE           [31] = 1
  CP_BUSY              [30] = 1
  CP_COHERENCY_BUSY    [28] = 1
  SPI_BUSY          [23:22] = 3  ←Both SPIs are busy!
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
  ←All wave PCs point to the same address!`,
            hint: 'The PC (Program Counter) of all waves points to the same address 0x800200A0, SPI_BUSY=3 (both SPIs are busy), and the ring stops at DISPATCH_DIRECT (compute shader dispatch)...',
            answer: 'Analysis: (1) Stuck engine: SPI_BUSY=3 (both Shader Processor Input are busy) + GUI_ACTIVE=1 + CP_BUSY=1, but TA/DB/CB are all idle. This means that the shader engine itself is stuck, not the texture, depth or color operations. (2) The stuck command: ring stream is PKT3_DISPATCH_DIRECT at RPTR=0x2080, which is a compute shader dispatch command, dim_x=65536, dim_y=65536, a total of 65536×65536=4,294,967,296 thread groups - this is a huge dispatch. (3) The most likely root cause: The PCs of all waves point to the same address 0x800200A0, indicating that the compute shader loops endlessly at this address (such as while(true) or waiting for a condition that is never satisfied). This could be a bug in the shader code (infinite loop) or the global memory address the shader is waiting on contains the wrong value (causing spin-wait to never exit). Repair direction: (1) Check the shader ISA instruction at the address 0x800200A0 (decode with umr --waves --decode); (2) Check whether the shader has barrier/spin-lock logic and confirm whether the termination condition is reachable; (3) Reduce the dispatch dimension to test whether it still hangs.',
          },
          interviewQ: {
            question: 'You have a hang that is 100% reproducible under a specific GPU workload. Describe how you use the umr tool to locate the root cause step by step.',
            difficulty: 'hard',
            hint: 'Take advantage of reproducibility: first collect the baseline in the normal state, and then collect and compare in the hang state. Use the three dimensions of umr\'s register reading, ring stream, and wave status to gradually narrow the scope.',
            answer: 'Taking advantage of 100% reproducibility, I will use umr as follows: (1) Baseline collection: Before the workload that triggers the hang is run, collect GRBM_STATUS, SRBM_STATUS, CP_RB_RPTR/WPTR as the normal status baseline. (2) Trigger hang: Run workload, when dmesg displays a timeout warning (but before GPU reset), use the script to quickly collect: umr -O bits -r gfx1100.grbm.mmGRBM_STATUS > hang_regs.txt, umr --ring-stream gfx[0] > hang_ring.txt, umr --waves > hang_waves.txt. (3) Register comparison: Compare the baseline and GRBM_STATUS during hang to find out which engines changed from idle to busy - this locates the hardware module where the problem lies (GFX? SPI? TA? DB?). (4) Ring Stream analysis: Find the command for the RPTR location in hang_ring.txt - this is the precise location where the CP is stuck. Decode the PM4 command type and parameters to determine whether it is a draw call, compute dispatch, or DMA operation. (5) Wave analysis: If it is a shader hang, check all active wave PCs in the --waves output. If PCs gather at the same address - shader infinite loop. If the PC is diverged but the EXEC mask is abnormal - it may be a divergence bug. Use umr --waves --decode to decode ISA instructions at the PC. (6) VM analysis: If dmesg has a GPU fault, use umr --vm-decode to check the page table mapping of the fault address - confirm whether the page table is missing (unmapped) or a permission error. (7) Binary positioning: Take advantage of reproducibility and modify the workload to gradually narrow down the trigger conditions (reduce dispatch size, disable specific shader features) until the smallest reproducible case is found. The entire process usually takes 2-4 hours.',
            amdContext: 'This question tests your hardware-level debugging skills. If you can fluently describe the usage scenarios and specific commands of umr during the AMD interview, it means that you have actual GPU debugging experience - this is the key to distinguishing theoretical learning from practical experience.',
          },
        },
      ],
    },
  ],
  completionChecklist: [
    'Understand the printk log level system and the bit mask control mechanism of the DRM_DEBUG macro',
    'Ability to use dynamic debugging (echo "module amdgpu +p") to turn on/off debugging output as needed',
    'Ability to read GPU runtime status through debugfs (/sys/kernel/debug/dri/0/)',
    'Understand the ftrace architecture (ring buffer, function/function_graph tracer, TRACE_EVENT)',
    'Can use trace-cmd to trace amdgpu trace points and analyze command submission delays',
    'Can use perf top/stat/record to analyze CPU side hotspots and generate flame graphs',
    'Learn how to use rocprof --stats/--hsa-trace and GPU hardware counters',
    'Master GPU hang analysis methodology: GRBM_STATUS analysis + RPTR/WPTR analysis + IB test',
    'Understand the processes of amdgpu_job_timedout and amdgpu_device_gpu_recover',
    'Able to install and use umr to read GPU registers, analyze ring streams, and view wave status',
    'Can justify which observability tool to start with for a new bug instead of turning on every trace source at once',
  ],
};
