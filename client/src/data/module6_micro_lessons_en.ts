// ============================================================
// AMD Linux Driver Learning Platform - Module 6 Micro-Lessons (English)
// Module 6: Debugging & Profiling (debuggingandperformanceanalyze)
// 5 lessons in 2 groups, ~15-20 min each, total ~50h curriculum
// ============================================================
import type { MicroLessonModule } from './micro_lesson_types';

export const module6MicroLessonsEn: MicroLessonModule = {
  moduleId: 'debugging',
  groups: [
    // ════════════════════════════════════════════════════════════
    // Group 6.1: Kernel Debugging Tools (kerneldebuggingtoolchain)
    // ════════════════════════════════════════════════════════════
    {
      id: '6-1',
      number: '6.1',
      title: 'kerneldebuggingtoolchain',
      titleEn: 'Kernel Debugging Tools',
      icon: 'Wrench',
      description: 'master Linux kerneland amdgpu drivercoredebugging手段: printk logsystem, dynamicdebugging, ftrace kerneltracing, perf and rocprof performanceanalyze. thesetoolis AMD driverengineer每天use"武器库". ',
      lessons: [
        // ── Lesson 6.1.1 ──────────────────────────────────────
        {
          id: '6-1-1',
          number: '6.1.1',
          title: 'printk, dynamicdebuggingand debugfs',
          titleEn: 'printk, Dynamic Debug & debugfs',
          duration: 20,
          difficulty: 'advanced',
          tags: ['printk', 'dynamic-debug', 'debugfs', 'DRM_DEBUG', 'dmesg'],
          concept: {
            summary: 'printk iskernelin最basicdebugging手段 — 它willmessagewritekernelring buffer, through dmesg canread. amdgpu driveruse DRM_DEBUG macro族anddynamicdebugging(dynamic debug)implementation精细logcontrol, 而 debugfs providerun时check GPU internalstatefilesysteminterface. ',
            explanation: [
              'printk iskernel printf, 但它notoutputto终端, but ratherwritea固定sizering buffer(default 128KB-1MB). 每条messagehasaloglevel(0-7): KERN_EMERG(0) 最高priority, KERN_DEBUG(7) 最低. kernel console_loglevel parameter决定whichlevelmessagewilloutputtocontrol台. amdgpu driveruse pr_info(), pr_err(), pr_debug() 等便捷macro, theywillautomaticaddmodule名before缀. ',
              'DRM subsystemhasselflog体系: DRM_DEBUG_DRIVER(), DRM_DEBUG_KMS(), DRM_DEBUG_ATOMIC() 等macro. thesemacrooutput受 drm.debug moduleparametercontrol — 这isa位mask: bit 1 = CORE, bit 2 = DRIVER, bit 4 = KMS, bit 5 = PRIME, bit 6 = ATOMIC, bit 8 = LEASE. for exampleset drm.debug=0x1e will开启 DRIVER + KMS + ATOMIC debuggingoutput. in amdgpu codein, DRM_DEBUG_DRIVER() is最常用debuggingmacro, used for打印driverinternallogicinformation. ',
              'dynamicdebugging(dynamic debug)is Linux kernel强大feature, allowinrun时按module, file, functionor行号精确开关 pr_debug() and dev_dbg() output. throughwrite /sys/kernel/debug/dynamic_debug/control control: echo "module amdgpu +p" 开启 amdgpu all pr_debug output, echo "file amdgpu_device.c +p" 只开启specificfile. 这比re-compilationkernel高效得多. ',
              'debugfs isamemoryfilesystem(挂载in /sys/kernel/debug/), amdgpu driverinwhereregistration大量debugginginterface. path /sys/kernel/debug/dri/0/ belowhas: amdgpu_fence_info(fence state — tracing GPU 任务complete情况), amdgpu_gpu_recover(手动trigger GPU reset), amdgpu_ring_gfx(GFX ring buffer 内容), amdgpu_pm_info(power managementstate)等. thesefileisreal-timeread GPU internalstate窗口, 比 dmesg log更directly. ',
            ],
            keyPoints: [
              'printk loglevel 0-7: KERN_EMERG(0) > ERR(3) > WARN(4) > INFO(6) > DEBUG(7)',
              'pr_info/pr_err/pr_debug is带modulebefore缀 printk 便捷macro',
              'DRM_DEBUG_DRIVER() output受 drm.debug 位maskcontrol, bit 2 = DRIVER',
              'dynamicdebugging: echo "module amdgpu +p" > /sys/kernel/debug/dynamic_debug/control',
              'debugfs path /sys/kernel/debug/dri/0/ provide GPU run时stateinterface',
              'amdgpu_fence_info display各 ring  fence 序列号 — 判断 GPU whether卡住key',
            ],
          },
          diagram: {
            title: 'amdgpu loganddebugginginterface全景',
            content: `amdgpu debugginginformation流 — fromkerneltouser space

kernel space (amdgpu driver)                    user space
─────────────────────                    ─────────

  pr_err("amdgpu: ...")          ──→  dmesg (level 3, 始终output)
  pr_warn("amdgpu: ...")         ──→  dmesg (level 4, 始终output)
  pr_info("amdgpu: ...")         ──→  dmesg (level 6, 始终output)
  pr_debug("amdgpu: ...")        ──→  dmesg (level 7, needdynamicdebugging开启)
       │                                       │
       │  controlapproach:                              │
       │  echo "module amdgpu +p"              │
       │  > /sys/kernel/debug/                 ▼
       │    dynamic_debug/control          dmesg -w | grep amdgpu
       │
  DRM_DEBUG_DRIVER(...)          ──→  dmesg (need drm.debug 位mask)
  DRM_DEBUG_KMS(...)                   │
  DRM_DEBUG_ATOMIC(...)                │  controlapproach:
       │                                │  echo 0x1e > /sys/module/drm/
       │                                │              parameters/debug
       │                                │
       │                                │  drm.debug 位mask:
       │                                │  0x02 = DRIVER
       │                                │  0x04 = KMS
       │                                │  0x10 = ATOMIC
       │                                │  0x1e = entire常用
       │
  debugfs registration                   ──→  /sys/kernel/debug/dri/0/
       │                                ├── amdgpu_fence_info
       │                                │   emitted=1234 signaled=1233
       │                                │   → seq 差值 = not yetcomplete任务数
       │                                ├── amdgpu_gpu_recover
       │                                │   echo 1 > trigger手动 reset
       │                                ├── amdgpu_ring_gfx
       │                                │   ring buffer raw内容
       │                                ├── amdgpu_pm_info
       │                                │   frequency/电压/温度
       │                                ├── amdgpu_sa_info
       │                                │   子allocation器state
       │                                └── amdgpu_vm_info
       │                                    virtualmemory mappinginformation

  sysfs property                     ──→  /sys/class/drm/card0/device/
                                       ├── pp_dpm_sclk  (GPU frequency)
                                       ├── gpu_busy_percent
                                       └── mem_info_vram_used`,
            caption: 'amdgpu driver三条debugginginformationchannel: printk/DRM_DEBUG → dmesg, debugfs → run时statefile, sysfs → hardwareproperty. master这三个channelisdebugging GPU issuebasics. ',
          },
          codeWalk: {
            title: 'DRM_DEBUG_DRIVER macrointernalimplementation',
            file: 'include/drm/drm_print.h + drivers/gpu/drm/amd/amdgpu/amdgpu_cs.c',
            language: 'c',
            code: `/* drm_print.h — DRM debuggingmacrodefine */

/* drm.debug parameter位define */
#define DRM_UT_NONE   0x00
#define DRM_UT_CORE   0x01  /* DRM core */
#define DRM_UT_DRIVER 0x02  /* driverspecific */
#define DRM_UT_KMS    0x04  /* KMS patternset */
#define DRM_UT_PRIME  0x08  /* PRIME buffershared */
#define DRM_UT_ATOMIC 0x10  /* Atomic patternset */
#define DRM_UT_VBL    0x20  /* VBlank */
#define DRM_UT_STATE  0x40  /* statecheck */
#define DRM_UT_LEASE  0x80  /* DRM 租约 */

/* DRM_DEBUG_DRIVER macro — amdgpu in最常用debuggingoutput */
#define DRM_DEBUG_DRIVER(fmt, ...)                       \\
    drm_dbg(DRM_UT_DRIVER, fmt, ##__VA_ARGS__)

/* 展开afterfinalcallpath:
 * DRM_DEBUG_DRIVER("ring %s timeout", ring->name)
 *   → drm_dbg(DRM_UT_DRIVER, "ring %s timeout", ring->name)
 *     → __drm_dbg(DRM_UT_DRIVER, ...)
 *       → if (__drm_debug & DRM_UT_DRIVER)
 *             printk(KERN_DEBUG "[drm:func_name] ring gfx timeout")
 *
 * onlywhen drm.debug parameter bit 1 (0x02) byset时only thenoutput
 */

/* amdgpu_cs.c inactualuseexample */
int amdgpu_cs_ioctl(struct drm_device *dev, void *data,
                     struct drm_file *filp)
{
    /* 这条log只in drm.debug & DRM_UT_DRIVER 时output */
    DRM_DEBUG_DRIVER("cs ioctl: num_chunks=%u",
                     cs->in.num_chunks);

    /* error用 DRM_ERROR — 始终output, not受 drm.debug control */
    if (r) {
        DRM_ERROR("Failed to initialize parser: %d", r);
        return r;
    }
}`,
            annotations: [
              'DRM_UT_DRIVER = 0x02: DRM_DEBUG_DRIVER outputcontrol位, need drm.debug contain此位',
              'drm.debug isrun时can调parameter: echo 0x02 > /sys/module/drm/parameters/debug',
              'DRM_DEBUG_DRIVER finalcall printk(KERN_DEBUG ...) 但加 [drm:function名] before缀',
              'DRM_ERROR use KERN_ERR level, 始终outputto dmesg, not受 drm.debug control',
              '__drm_debug isglobalvariable, storagecurrent drm.debug 位mask值',
              'amdgpu codeinhas数千处 DRM_DEBUG_DRIVER call — entire开启willgenerate大量log',
            ],
            explanation: 'understand DRM_DEBUG_DRIVER implementation很important: 它is notsimple printk, but rather经过位maskcheckconditionoutput. this meansin生产environmentin, thesedebugging语句开销几乎as零(只isa位andoperate), 但indebugging时canthroughmodify drm.debug parameter按需开启. amdgpu 大量debugginginformation隐藏inthesemacroafter面 — 你只needknowhow打开they. ',
          },
          miniLab: {
            title: 'enable amdgpu dynamicdebugging并read debugfs',
            objective: 'actualoperate开启 amdgpu dynamicdebuggingoutput, set drm.debug parameter, 并through debugfs read GPU runstate. ',
            steps: [
              'viewcurrent drm.debug level: cat /sys/module/drm/parameters/debug(defaultas 0)',
              '开启 DRIVER leveldebugging: sudo sh -c \'echo 0x02 > /sys/module/drm/parameters/debug\'',
              '打开a新终端real-time监控: sudo dmesg -w | grep "\\[drm\\]"',
              'triggersome GPU 活动(如move窗口, run glxgears), observe DRM_DEBUG_DRIVER output',
              '开启 amdgpu dynamicdebugging: sudo sh -c \'echo "module amdgpu +p" > /sys/kernel/debug/dynamic_debug/control\'',
              'read fence state: sudo cat /sys/kernel/debug/dri/0/amdgpu_fence_info',
              'read GPU 电源information: sudo cat /sys/kernel/debug/dri/0/amdgpu_pm_info',
              'completeafter关闭debuggingoutput: sudo sh -c \'echo 0 > /sys/module/drm/parameters/debug\' && sudo sh -c \'echo "module amdgpu -p" > /sys/kernel/debug/dynamic_debug/control\'',
            ],
            expectedOutput: `$ cat /sys/module/drm/parameters/debug
0x0

$ sudo sh -c 'echo 0x02 > /sys/module/drm/parameters/debug'
$ dmesg -w | grep "\\[drm\\]"
[12345.678] [drm:amdgpu_cs_ioctl] cs ioctl: num_chunks=2
[12345.679] [drm:amdgpu_cs_parser_init] parser init: ring=gfx
...大量debuggingoutput...

$ sudo cat /sys/kernel/debug/dri/0/amdgpu_fence_info
--- ring gfx_0.0.0 ---
Last signaled fence          0x0000000000001a3f
Last emitted                 0x0000000000001a40
  ← emitted - signaled = 1, indicatehas 1 个任务in GPU onexecutein`,
            hint: 'if /sys/kernel/debug/ as空, need挂载 debugfs: sudo mount -t debugfs debugfs /sys/kernel/debug. ifpermissionnot足, alloperateallneed sudo. 记得experimentendafter关闭debuggingoutput, otherwisewillgenerate大量logimpactperformance. ',
          },
          debugExercise: {
            title: 'debuggingoutput消失之谜',
            language: 'bash',
            description: '一位development者in amdgpu codeinadd DRM_DEBUG_DRIVER() debugging语句, 但in dmesg in看notto任何output. belowis他operatestep, findwhy看nottodebugginginformation. ',
            question: 'why dmesg inno出现debugginginformation? needmodifywhat? ',
            buggyCode: `# development者in amdgpu_fence.c inadd:
# DRM_DEBUG_DRIVER("fence signaled: seq=%llu", fence->seq);

# re-compilation并loadingmoduleafter:
$ sudo rmmod amdgpu && sudo modprobe amdgpu
$ dmesg | grep "fence signaled"
(无output)

# development者checkloglevel:
$ cat /proc/sys/kernel/printk
4    4    1    7
# (console_loglevel=4, i.e.只display WARN 及above)

# development者认asis console_loglevel issue, 调高:
$ sudo sysctl kernel.printk="8 4 1 7"
$ dmesg | grep "fence signaled"
(still无output!)

# drm.debug parameterstate:
$ cat /sys/module/drm/parameters/debug
0x0`,
            hint: 'DRM_DEBUG_DRIVER not只受 console_loglevel control — 它stillhasself开关. ',
            answer: 'issue出in drm.debug parameteras 0x0. DRM_DEBUG_DRIVER() macrointernalfirstcheck __drm_debug & DRM_UT_DRIVER (0x02), ifas 0 则directlyreturn, 根本will notcall printk. soeven ifthe console_loglevel 调to最高also没用 — printk 压根没byexecute. fixmethod: echo 0x02 > /sys/module/drm/parameters/debug 开启 DRIVER level DRM debugging. orinstartupparameterinadd drm.debug=0x02. 这is新手常犯error — DRM debuggingoutputhas两layer门控: 第一layeris drm.debug 位mask(DRM layer), 第二layeris console_loglevel(printk layer), 两layerallmustthroughonly thencan看tooutput. ',
          },
          interviewQ: {
            question: 'describe你in amdgpu driverdevelopmentindebuggingmethod论. when遇toa难以复现 bug 时, 你willusewhichtoolandstrategy? ',
            difficulty: 'medium',
            hint: '按layer次answer: first dmesg + printk(basiclog), thendynamicdebugging(精细control), then debugfs(run时state), then ftrace(functiontracing), finallyhardware级tool(umr registerread). ',
            answer: '我debuggingmethod论分layer递进: (1)第一layer — loganalyze: dmesg | grep -i "amdgpu\\|error\\|timeout\\|fault" geterrorinformation全貌. checkwhetherhas GPU hang/reset/fault 明确提示. (2)第二layer — 增加log粒度: echo 0x1e > /sys/module/drm/parameters/debug 开启all DRM debuggingoutput, echo "module amdgpu +p" 开启 amdgpu  pr_debug. inkeycodepathadd DRM_DEBUG_DRIVER() 并重compilationmodule. (3)第三layer — debugfs statecheck: cat amdgpu_fence_info 看 fence whether停滞, cat amdgpu_ring_gfx check ring buffer state. forbetween歇性 bug, 写脚本定期sampling debugfs state. (4)第四layer — ftrace functiontracing: trace-cmd record -p function_graph -l "amdgpu_*" tracingfunctioncall链and耗时, find异常path. (5)第五layer — hardwarediagnose: use umr read GRBM_STATUS 等keyregister, analyze GPU hardwarestate. for难以复现 bug, keystrategyis: 增加lognot降低performance(用 trace_printk rather than printk), 写automatic化testing脚本循环trigger, anduse kdump/crash incrash时savekernelstate. ',
            amdContext: 'AMD interview非常看重system化debuggingability. demonstrate你canfrom最simpletool(dmesg)逐步升级to最complextool(umr/ftrace), 而is not一on用最重手段. ',
          },
        },

        // ── Lesson 6.1.2 ──────────────────────────────────────
        {
          id: '6-1-2',
          number: '6.1.2',
          title: 'ftrace andkerneltracing点',
          titleEn: 'ftrace & Kernel Tracepoints',
          duration: 20,
          difficulty: 'advanced',
          tags: ['ftrace', 'tracepoints', 'TRACE_EVENT', 'trace-cmd', 'ring-buffer'],
          concept: {
            summary: 'ftrace is Linux kernel内建tracingframework, throughinfunctionentry point/exit pointinsert探针recordfunctioncalland耗时. 结合 TRACE_EVENT macrodefinetracing点(tracepoints), 你can精确tracing amdgpu command submission, 作业scheduling等keypathlatencyand行as. ',
            explanation: [
              'ftrace coreisa高效ring buffer(per-CPU ring buffer), kernelin探针willeventwritebuffer, user spacethrough tracefs(/sys/kernel/tracing/)or trace-cmd toolread. ftrace 开销极低 — not yet激活tracing点只is一条 NOP instruction(5 bytes), inrun时through code patching 替换as跳转totracinghandlefunctioninstruction. ',
              'ftrace provide多种tracing器(tracer): function tracer recordeach timefunctioncall(function名 + call者), function_graph tracer recordfunction进入and退出(can看tocall树andeachfunction耗时), irqsoff tracer record最长interruptdisable时between, preemptoff tracer record最长抢占disable时between. for amdgpu debugging, function_graph 最常用 — 它can直观demonstratecommand submissioncompletecall链and每步耗时. ',
              'TRACE_EVENT isdefinekerneltracing点standardmacro. amdgpu in amdgpu_trace.h indefinemultipletracing点: amdgpu_cs_ioctl(command submissionentry point), amdgpu_sched_run_job(schedulerrun作业), amdgpu_vm_bo_map(virtualmemory mapping), amdgpu_bo_create(buffer objectcreate)等. thesetracing点recordstructure化data(如 ring name, fence sequence, job size), 比 printk 更高效且can用 perf/trace-cmd automaticanalyze. ',
              'trace-cmd is ftrace user spacefrontend, 极大简化operate. trace-cmd record -e amdgpu -p function_graph 一条commandcanrecordall amdgpu tracing点eventandfunction图tracing. trace-cmd report parse二进制dataascan读output. forperformanceanalyze, trace-cmd outputcan导入 KernelShark(GUI tool)进行can视化时between线analyze. ',
            ],
            keyPoints: [
              'ftrace use per-CPU ring buffer, not yet激活tracing点只is NOP instruction, 开销极低',
              'function_graph tracer displayfunctioncall树and耗时 — diagnoselatencyissue利器',
              'amdgpu tracing点: amdgpu_cs_ioctl, amdgpu_sched_run_job, amdgpu_vm_bo_map',
              'TRACE_EVENT macroin amdgpu_trace.h indefine, recordstructure化data',
              'trace-cmd record/report is ftrace 简便frontend, recommended日常use',
              'KernelShark cancan视化 trace-cmd output, 直观demonstrate时between线onevent',
            ],
          },
          diagram: {
            title: 'ftrace architectureand amdgpu tracing点',
            content: `ftrace architecture — fromtracing点touser spaceanalyze

                      kernel space
    ┌──────────────────────────────────────────────┐
    │                                              │
    │  amdgpu codeintracing点                        │
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
    │  ┌─────────── ftrace framework ───────────────┐   │
    │  │                                       │   │
    │  │  function tracer (mcount/fentry hook)  │   │
    │  │  ┌─ amdgpu_cs_ioctl                   │   │
    │  │  ├─ amdgpu_cs_parser_init             │   │
    │  │  ├─ amdgpu_cs_submit                  │   │
    │  │  └─ ...                               │   │
    │  │                                       │   │
    │  │  TRACE_EVENT tracing点                    │   │
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
    │                user space                        │
    │                                              │
    │  tracefs: /sys/kernel/tracing/               │
    │  ├── trace              ← directlyread文本       │
    │  ├── trace_pipe         ← real-time流式read       │
    │  ├── current_tracer     ← settracing器type     │
    │  ├── set_ftrace_filter  ← 过滤function           │
    │  └── events/amdgpu/     ← amdgpu tracing点     │
    │      ├── amdgpu_cs_ioctl/enable              │
    │      └── amdgpu_sched_run_job/enable         │
    │                                              │
    │  trace-cmd record -e amdgpu → trace.dat      │
    │  trace-cmd report trace.dat → 文本output        │
    │  kernelshark trace.dat      → GUI 时between线      │
    └──────────────────────────────────────────────┘`,
            caption: 'ftrace completedata流: amdgpu codeintracing点andfunction探针willeventwrite per-CPU ring buffer, user spacethrough tracefs or trace-cmd readanalyze. ',
          },
          codeWalk: {
            title: 'amdgpu_trace.h in TRACE_EVENT define',
            file: 'drivers/gpu/drm/amd/amdgpu/amdgpu_trace.h',
            language: 'c',
            code: `/* amdgpu_trace.h — amdgpu tracing点define */

#include <linux/tracepoint.h>

/* tracing CS (Command Submission) ioctl call */
TRACE_EVENT(amdgpu_cs_ioctl,
    /* tracing点trigger时传入parameter */
    TP_PROTO(struct amdgpu_job *job),

    TP_ARGS(job),

    /* recordto ring buffer in字段 */
    TP_STRUCT__entry(
        __field(uint64_t, sched_job_id)
        __field(u32, ring)
        __field(u32, num_ibs)
        __string(timeline, AMDGPU_JOB_GET_TIMELINE_NAME(job))
    ),

    /* howfromparameter填充字段 */
    TP_fast_assign(
        __entry->sched_job_id = job->base.id;
        __entry->ring = job->ring->idx;
        __entry->num_ibs = job->num_ibs;
        __assign_str(timeline,
                     AMDGPU_JOB_GET_TIMELINE_NAME(job));
    ),

    /* outputformat(trace-cmd report and /sys/kernel/tracing/trace use)*/
    TP_printk("sched_job=%llu, timeline=%s, ring=%u, num_ibs=%u",
              __entry->sched_job_id,
              __get_str(timeline),
              __entry->ring,
              __entry->num_ibs)
);

/* tracingschedulerexecute作业 */
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

/* in amdgpu_cs.c inuse:
 * trace_amdgpu_cs_ioctl(job);       ← cs ioctl entry point
 * trace_amdgpu_sched_run_job(job);  ← 作业startexecute
 *
 * tracinglatency = sched_run_job.timestamp - cs_ioctl.timestamp
 * 这is command submission → GPU executeschedulinglatency
 */`,
            annotations: [
              'TRACE_EVENT macrogeneratecompletetracingbasics设施: registration/deregistration, format化, 过滤等',
              'TP_STRUCT__entry definewrite ring buffer compact二进制format, 比 printk 高效',
              'TP_fast_assign intracing点trigger时execute, must尽量快 — avoidcomplexcompute',
              'TP_printk define人can读format, 只inuser spaceread时only thenexecuteformat化',
              '__string and __assign_str handle变长字符串, in ring buffer incompactstorage',
              'trace_amdgpu_cs_ioctl(job) is由macroautomaticgeneratecallfunction',
            ],
            explanation: '这twotracing点is amdgpu performanceanalyzecore. amdgpu_cs_ioctl inuser spacecommitcommand时trigger, amdgpu_sched_run_job in GPU scheduleractualexecute作业时trigger. twoevent时between差isschedulinglatency — ifthislatency异常大, indicateschedulerhasbottleneckor GPU inhandleother任务. through trace-cmd canautomaticcomputethislatency. ',
          },
          miniLab: {
            title: 'use trace-cmd tracing amdgpu command submissionlatency',
            objective: 'use trace-cmd record amdgpu tracing点event, analyzecommand submissionto GPU executeschedulinglatency. ',
            setup: `# install trace-cmd
sudo apt install trace-cmd

# confirm amdgpu tracing点available
ls /sys/kernel/tracing/events/amdgpu/
# should看to amdgpu_cs_ioctl/ amdgpu_sched_run_job/ 等directory`,
            steps: [
              '列出all amdgpu tracing点: trace-cmd list -e amdgpu',
              'startrecord amdgpu tracing点: sudo trace-cmd record -e amdgpu -o /tmp/amdgpu_trace.dat',
              'in另a终端run glxgears or任意 GPU program约 5 秒',
              '回to trace-cmd 终端按 Ctrl+C stoprecord',
              'viewreport: trace-cmd report /tmp/amdgpu_trace.dat | head -50',
              'tracingfunction图: sudo trace-cmd record -p function_graph -l "amdgpu_cs_*" -o /tmp/amdgpu_cs.dat, run glxgears 5 秒after Ctrl+C',
              'viewfunction图: trace-cmd report /tmp/amdgpu_cs.dat | head -80',
            ],
            expectedOutput: `$ trace-cmd report /tmp/amdgpu_trace.dat | head -20
  glxgears-5234 [002] 12345.678: amdgpu_cs_ioctl:  sched_job=4567, timeline=gfx_0.0.0, ring=0, num_ibs=1
  kworker-58    [001] 12345.679: amdgpu_sched_run_job: sched_job=4567, timeline=gfx_0.0.0
                                                        ← committoexecutelatency约 1ms

$ trace-cmd report /tmp/amdgpu_cs.dat | head -20
  glxgears-5234 [002] 12345.678:
    | amdgpu_cs_ioctl() {
    |   amdgpu_cs_parser_init() {    0.854 us
    |   amdgpu_cs_parser_bos() {     2.341 us
    |   amdgpu_cs_submit() {         1.120 us
    | }                              5.234 us  ← 总耗时`,
            hint: 'if trace-cmd list -e amdgpu outputas空, confirmkernelcompilation时enable CONFIG_FTRACE and CONFIG_TRACEPOINTS. 大多数distributionkerneldefaultenablethese选项. ',
          },
          debugExercise: {
            title: 'from ftrace outputlocateschedulinglatency',
            language: 'text',
            description: 'belowis一段 trace-cmd output, display GPU command submissionandexecute时between戳. hasoncecommitschedulinglatency异常高. findissue. ',
            question: '哪次command submissionschedulinglatency异常? maycauseiswhat? ',
            buggyCode: `# trace-cmd report output (简化)

# 正常command submission (latency ~0.5ms)
glxgears-5234 [002] 10000.100: amdgpu_cs_ioctl: sched_job=100, ring=0
kworker-58    [001] 10000.100: amdgpu_sched_run_job: sched_job=100
  → latency: 0.5ms ✓

glxgears-5234 [002] 10000.117: amdgpu_cs_ioctl: sched_job=101, ring=0
kworker-58    [001] 10000.117: amdgpu_sched_run_job: sched_job=101
  → latency: 0.4ms ✓

# 异常command submission
glxgears-5234 [002] 10000.134: amdgpu_cs_ioctl: sched_job=102, ring=0
kworker-58    [001] 10000.284: amdgpu_sched_run_job: sched_job=102
  → latency: 150ms ✗ ← 比正常慢 300 倍!

glxgears-5234 [002] 10000.301: amdgpu_cs_ioctl: sched_job=103, ring=0
kworker-58    [001] 10000.301: amdgpu_sched_run_job: sched_job=103
  → latency: 0.6ms ✓  (recover正常)

# 同一时between段othertracing:
blender-8901  [003] 10000.135: amdgpu_cs_ioctl: sched_job=5000, ring=0
blender-8901  [003] 10000.136: amdgpu_cs_ioctl: sched_job=5001, ring=0
...  (blender contiguouscommit ~200 个 job)
blender-8901  [003] 10000.280: amdgpu_sched_run_job: sched_job=5199`,
            hint: 'job 102 and blender 大量commit发生in同一时between窗口, theyuse同a ring...',
            answer: 'job 102 schedulinglatency 150ms 异常高. cause: blender processin 10000.135-10000.280 之between向同a GFX ring (ring=0) contiguouscommit约 200 个 job. amdgpu  GPU scheduleruse先进先出(FIFO)queue(drm_sched), glxgears  job 102 in 10000.134 commit, 但排in blender  200 个 job after面. GPU need先handle完 blender all job afteronly thencanexecute job 102. 这istypicalschedulerqueue饱andissue. resolveplan: (1)usedifferent ring/context 隔离differentapplication GPU work负载; (2)调整 GPU scheduler时between片(drm_sched  timeout parameter); (3)usepriorityscheduling(ifdriversupport)letinteraction式application获得更高priority. ',
          },
          interviewQ: {
            question: 'explain ftrace  function_graph tracer workprinciple. 它howinnotmodifysource code情况belowtracingfunctioncallandreturn? ',
            difficulty: 'hard',
            hint: 'key词: mcount/fentry, return trampoline, gcc -pg, run时 code patching, NOP 替换. ',
            answer: 'function_graph tracer principle: (1)compilation时: GCC use -pg parametercompilationkernel, ineachfunctionentry pointinsert一条对 mcount(or __fentry__)call. 初始时thesecallby NOP instruction替换, notgeneraterun时开销. (2)激活tracing时: ftrace userun时 code patching(through stop_machine or text_poke_bp)will NOP 替换as跳转to ftrace_caller instruction. (3)functionentry pointhandle: ftrace_caller callregistrationcallback function(function_graph  trace_graph_entry), recordfunction名, 时between戳, CPU ID to per-CPU ring buffer. (4)returntracing(key技巧): function_graph modifystackonreturnaddress — willrawreturnaddresssaveto task_struct in ret_stack 数组in, 用 return_to_handler 蹦床function替换. functionreturn时先execute return_to_handler, recordreturn时between戳(can算出execute时between), then跳转torealreturnaddress. (5)performanceimpact: eachbytracingfunction增加约 100-500ns 开销(save/recovercontext + ring buffer write), global开启时mayhas 10-30% performanceimpact, sousually用 set_ftrace_filter 只tracing感兴趣function. ',
            amdContext: 'thisissue考查你对kernel底layermechanismunderstand深度. if你canexplain return trampoline mechanismand NOP patching, indicate你对kernelinternalhas深入认识. ',
          },
        },

        // ── Lesson 6.1.3 ──────────────────────────────────────
        {
          id: '6-1-3',
          number: '6.1.3',
          title: 'perf and rocprof performanceanalyze',
          titleEn: 'perf & rocprof Profiling',
          duration: 20,
          difficulty: 'advanced',
          tags: ['perf', 'rocprof', 'flame-graph', 'PMU', 'profiling'],
          concept: {
            summary: 'perf is Linux kernelperformanceanalyzetool, throughhardwareperformancecount器(PMU)and软件eventsampling CPU 侧hotspot. rocprof is AMD  GPU 侧analyzetool, cancollect GPU hardwarecount器, HSA tracingand kernel 时between线. 两者结合can全面analyze CPU+GPU blendingwork负载performancebottleneck. ',
            explanation: [
              'perf 利用 CPU  Performance Monitoring Unit(PMU)hardwarecount器进行sampling. PMU cancountevent如 CPU cycles, cache misses, branch mispredictions 等. perf workprinciple: 每 N 个event发生onceinterrupt(NMI), recordwhen时instructionpointer(IP), statisticsaftergenerateeachfunctionbysamplingto次数 — sampling次数越多represent该function消耗 CPU 时between越多. ',
              'perf 常用子command: perf top(real-timedisplay CPU hotspotfunction, similar top 但精确tofunction), perf stat(statisticsprogramexecutehardwareevent总量, 如 cycles/instructions/cache-misses), perf record(sampling并saveto perf.data file), perf report(interaction式analyze perf.data). for amdgpu kernel moduleanalyze, perf candirectly看tokernelfunction CPU 消耗. ',
              'rocprof is AMD ROCm 生态 GPU performanceanalyzetool. 它has三种mainpattern: --stats pattern(statisticseach GPU kernel execute时betweenandcall次数), --hsa-trace pattern(tracing HSA run时 API call, memorycopy, kernel dispatch complete时between线), hardwarecount器pattern(through input.txt 指定tocollect GPU PMU count器, 如 SQ_WAVES, SQ_INSTS_VALU, TA_BUFFER_WAVEFRONTS_SUM). ',
              'Flame Graph(火焰图)is perf datacan视化approach — x 轴isfunctioncallstack(宽度representsampling百分比), y 轴iscall深度. Brendan Gregg  FlameGraph 脚本(github.com/brendangregg/FlameGraph)canwill perf script outputconvertasinteraction式 SVG 火焰图. for amdgpu debugging, 火焰图can直观demonstratekernelinwhichfunction消耗最多 CPU 时between — commonhotspotinclude fence polling, register read/write, memory allocation. ',
            ],
            keyPoints: [
              'perf top/stat/record/report: CPU 侧performanceanalyze四件套',
              'perf through PMU hardwarecount器sampling, 开销 < 5%, canused for生产environment',
              'rocprof --stats: GPU kernel execute时betweenstatistics',
              'rocprof --hsa-trace: HSA API + memorycopy + kernel dispatch 时between线',
              'rocprof hardwarecount器: SQ_WAVES, SQ_INSTS_VALU 等 GPU 微architectureevent',
              'Flame Graph: perf datacan视化, x 轴宽度 = CPU 时between占比',
            ],
          },
          diagram: {
            title: 'CPU (perf) + GPU (rocprof) 联合analyzearchitecture',
            content: `CPU + GPU 联合performanceanalyzework流

┌─────────── applicationprogram (如 AI 训练) ──────────┐
│                                              │
│  CPU code         GPU code (HIP kernel)      │
│  data预handle        矩阵乘法                   │
│  memory allocation          卷积运算                   │
│  GPU scheduling          ...                        │
│       │                    │                  │
└───────┼────────────────────┼──────────────────┘
        │                    │
  ┌─────▼──────┐      ┌─────▼──────┐
  │   perf     │      │  rocprof   │
  │  (CPU 侧)  │      │  (GPU 侧)  │
  │            │      │            │
  │ perf stat  │      │ --stats    │
  │  cycles    │      │ kernel时between  │
  │  cache-miss│      │ call次数    │
  │  IPC       │      │            │
  │            │      │ --hsa-trace│
  │ perf record│      │ APIcall     │
  │  sampling      │      │ memorycopy    │
  │  callstack    │      │ dispatch   │
  │            │      │            │
  │ perf report│      │ hardwarecount器  │
  │  hotspotfunction  │      │ SQ_WAVES   │
  │            │      │ SQ_INSTS   │
  │  → 火焰图  │      │ L2 cache   │
  └─────┬──────┘      └─────┬──────┘
        │                    │
        ▼                    ▼
  ┌──────────────────────────────────────┐
  │         analyzeresult整合                   │
  │                                      │
  │  typicalfind:                            │
  │  ├─ CPU hotspot: amdgpu_fence_wait_any  │
  │  │   → fence polling 占 CPU 30%      │
  │  │   → plan: 改用interruptwaitpattern         │
  │  │                                    │
  │  ├─ GPU hotspot: matmul_kernel          │
  │  │   → SQ_WAVES 利用率only 40%       │
  │  │   → plan: 增大 workgroup size     │
  │  │                                    │
  │  └─ CPU-GPU interaction:                    │
  │      → datacopy占总时between 60%           │
  │      → plan: use pinned memory      │
  └──────────────────────────────────────┘`,
            caption: 'perf analyze CPU 侧hotspot(drivercode, scheduling, fence wait), rocprof analyze GPU 侧hotspot(kernel execute, memorybandwidth). 两者结合cancompletelocate CPU+GPU work负载bottleneck. ',
          },
          codeWalk: {
            title: 'use perf locate amdgpu kernelhotspotfunction',
            file: 'terminal',
            language: 'bash',
            code: `# === perf analyze amdgpu kernel module CPU 消耗 ===

# 1. perf top: real-timeview全system CPU hotspot
sudo perf top -g
#  Overhead  Shared Object     Symbol
#  --------  ----------------  --------
#    12.34%  [amdgpu]          amdgpu_fence_process
#     8.21%  [amdgpu]          amdgpu_ring_commit
#     5.67%  [kernel.vmlinux]  _raw_spin_lock_irqsave
#     3.45%  [amdgpu]          amdgpu_bo_move

# 2. perf stat: statistics GPU programhardwareevent
sudo perf stat -e cycles,instructions,cache-misses,\\
    context-switches -- glxgears -info

#  Performance counter stats for 'glxgears':
#    2,345,678,901  cycles
#    1,876,543,210  instructions  # IPC = 0.80
#       12,345,678  cache-misses
#            3,456  context-switches

# 3. perf record: sampling并generate火焰图
sudo perf record -g -a -- sleep 10
# (run期between跑 GPU work负载)
sudo perf script > /tmp/perf_out.txt

# generate火焰图 (need FlameGraph tool)
# git clone https://github.com/brendangregg/FlameGraph
cat /tmp/perf_out.txt | \\
    FlameGraph/stackcollapse-perf.pl | \\
    FlameGraph/flamegraph.pl > /tmp/amdgpu_flamegraph.svg

# 4. perf analyzespecific amdgpu function
sudo perf probe -m amdgpu -a amdgpu_cs_ioctl
sudo perf record -e probe:amdgpu_cs_ioctl -aR -- sleep 5
sudo perf report

# === rocprof GPU 侧analyze ===

# 5. rocprof --stats: GPU kernel execute时between
rocprof --stats ./my_hip_app
# kernel-name     calls  avg-time  total-time
# matmul_kernel     100   1.23ms    123.0ms
# relu_kernel       100   0.05ms      5.0ms

# 6. rocprof --hsa-trace: complete时between线
rocprof --hsa-trace ./my_hip_app
# generate results.json, available chrome://tracing view

# 7. rocprof hardwarecount器
echo 'pmc: SQ_WAVES SQ_INSTS_VALU TA_BUSY_avr' > input.txt
rocprof -i input.txt ./my_hip_app`,
            annotations: [
              'perf top -g: -g displaycall图(call graph), can看tohotspotfunctionisby谁call',
              'IPC (Instructions Per Cycle) < 1.0 usuallyrepresenthasmemorybottleneckorbranchpredictionfailure',
              'perf record -g -a: -g recordcallstack, -a samplingall CPU(includekernel态)',
              'perf probe caninkernelfunctionondynamiccreatetracing点, 无需re-compilation',
              'rocprof --stats  avg-time is GPU kernel 平均execute时between, notinclude dispatch latency',
              'rocprof hardwarecount器 SQ_WAVES isemitto CU  wave count, 反映 GPU 利用率',
            ],
            explanation: 'thiscodedemonstrate CPU+GPU 联合analyzecompletework流. inactual amdgpu developmentin, perf top is最常用"快速view"tool — if你看to amdgpu_fence_process 占大量 CPU, indicate fence polling isbottleneck. rocprof 则used foranalyze GPU kernel 本身效率. 火焰图is向teamdemonstrateanalyzeresult最佳approach. ',
          },
          miniLab: {
            title: 'use perf + rocprof analyze GPU applicationperformance',
            objective: '综合use perf and rocprof analyzea GPU application, find CPU 侧and GPU 侧performancebottleneck. ',
            setup: `# install perf and FlameGraph
sudo apt install linux-tools-$(uname -r) linux-tools-common
git clone https://github.com/brendangregg/FlameGraph ~/FlameGraph

# rocprof need ROCm environment
# sudo apt install rocprofiler`,
            steps: [
              'run perf top -g observe GPU 活动时 CPU hotspot(run glxgears or任意 GPU program)',
              'use perf stat collect glxgears hardwarecount器: sudo perf stat glxgears(run 10 秒after Ctrl+C)',
              'record全systemsampling: sudo perf record -g -a -- sleep 10(期betweenrun GPU program)',
              'view perf report: sudo perf report(find [amdgpu] 开头function)',
              'generate火焰图: sudo perf script | ~/FlameGraph/stackcollapse-perf.pl | ~/FlameGraph/flamegraph.pl > /tmp/gpu_flame.svg',
              '用浏览器打开 /tmp/gpu_flame.svg, find amdgpu relatedfunctionstack',
              'ifhas ROCm: run rocprof --stats ./your_hip_app view GPU kernel 时between',
            ],
            expectedOutput: `$ sudo perf stat glxgears
# run 10 秒after Ctrl+C

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
            hint: 'if perf record 报permissionerror, can临时放开limit: sudo sysctl kernel.perf_event_paranoid=-1. generate火焰图need root permissioncollect perf.data, becauseneedkernel符号. ',
          },
          debugExercise: {
            title: 'from perf datalocate过度 fence polling',
            language: 'text',
            description: 'below perf report outputdisplaya GPU application CPU use率异常高(100% 单核). analyzedatafindcause. ',
            question: 'whythis GPU application占满a CPU core? 提出optimizationplan. ',
            buggyCode: `$ sudo perf report --stdio

# Overhead  Command     Shared Object    Symbol
# ........  ..........  ...............  ......
    42.31%  my_gpu_app  [amdgpu]         amdgpu_fence_wait_any
    18.67%  my_gpu_app  [amdgpu]         amdgpu_fence_process
    12.45%  my_gpu_app  [kernel]         _raw_spin_lock_irqsave
     8.23%  my_gpu_app  [amdgpu]         amdgpu_device_rreg
     5.11%  my_gpu_app  my_gpu_app       main
     3.89%  my_gpu_app  libdrm_amdgpu    amdgpu_cs_query_fence_status

# callstack (amdgpu_fence_wait_any):
# amdgpu_fence_wait_any
#   └─ amdgpu_fence_process
#       └─ amdgpu_device_rreg
#           └─ readl  ← MMIO registerread

# top output:
# PID   %CPU  COMMAND
# 5678  99.8  my_gpu_app`,
            hint: '42% 时between花in fence_wait_any, 而它子function amdgpu_device_rreg (readl) is MMIO registerread...',
            answer: 'issue: applicationusebusy wait待(busy-wait / spin polling)wait GPU complete. perf datadisplay 42%  CPU 时betweenin amdgpu_fence_wait_any, call链is fence_wait → fence_process → rreg → readl. 这indicatedriverinnot断polling GPU  fence registercheck任务whethercomplete, 而is notuseinterruptwait. each time readl() isonce MMIO read, 跨 PCIe 总线latency约 500ns-1μs, contiguouspollingwill占满 CPU core. optimizationplan: (1)use DRM_IOCTL_AMDGPU_WAIT_CS 带timeoutparameterwait — 它willletprocesssleep并through GPU interruptwakeup, CPU use率接近 0; (2)ifisdrivercodeinternalwait, use dma_fence_wait_timeout() 替代 busy-wait, 它利用 GPU interrupt(由 amdgpu_fence_driver_irq_type generate)notify fence complete; (3)ifneed低latency, can先 spin 一小段时betweenagain切换tointerruptwait(hybrid polling). 这is GPU applicationdevelopmentin最commonperformanceissue之一. ',
          },
          interviewQ: {
            question: '你howanalyzea GPU computeapplication端to端performance? describe你usetoolandmethod论. ',
            difficulty: 'hard',
            hint: '分layeranalyze: 先macro观(总时between分解as CPU/GPU/datatransfer), again微观(CPU 侧用 perf, GPU 侧用 rocprof, datatransfer用 HSA trace). ',
            answer: '端to端performanceanalyzemethod论: (1)macro观时between分解: first用 rocprof --hsa-trace getcomplete时between线, will总时between分解as三部分 — CPU compute, GPU kernel execute, CPU↔GPU datatransfer. 这一步确定bottleneckin哪一侧. (2)CPU 侧analyze: perf stat get IPC, cache-miss 等hardware指标. perf record -g samplinggenerate火焰图, find CPU hotspotfunction. commonissue: fence polling 占 CPU(改用interruptwait), memory allocation频繁(use buffer pool), 锁竞争(减小critical section). (3)GPU 侧analyze: rocprof --stats find最耗时 kernel. 对hotspot kernel use rocprof hardwarecount器analyze: SQ_WAVES(wave 利用率), SQ_INSTS_VALU(ALU 利用率), TCP_TCC_READ_REQ(L2 cache request). commonissue: occupancy not足(增大 workgroup size), memorybandwidthbottleneck(optimization访存pattern). (4)datatransferanalyze: HSA trace displayeach time H2D/D2H copysizeand时between. optimization: use pinned memory avoid额outsidecopy, use hipMemcpyAsync and kernel 重叠, use unified memory 减少explicitcopy. (5)整合optimization: according to Amdahl 定律, 先optimization占比最大部分. use chrome://tracing can视化 HSA trace JSON, confirmoptimization效果. ',
            amdContext: 'AMD 特别看重你whethercanfrom全system视角analyzeperformance — not只is"GPU kernel 慢", but ratherunderstand CPU, GPU, PCIe 总线三者之betweeninteractionhowimpact整体performance. ',
          },
        },
      ],
    },

    // ════════════════════════════════════════════════════════════
    // Group 6.2: GPU Issue Analysis (GPU issueanalyze)
    // ════════════════════════════════════════════════════════════
    {
      id: '6-2',
      number: '6.2',
      title: 'GPU issueanalyze',
      titleEn: 'GPU Issue Analysis',
      icon: 'Flame',
      description: '深入 GPU hang analyzemethod论and AMD 专用debuggingtool umr. learnfrom dmesg log, registerstate, ring buffer 内容三个维度diagnose GPU hardwareissue — 这is AMD driverengineercoreskill. ',
      lessons: [
        // ── Lesson 6.2.1 ──────────────────────────────────────
        {
          id: '6-2-1',
          number: '6.2.1',
          title: 'GPU Hang analyzemethod论',
          titleEn: 'GPU Hang Analysis Methodology',
          duration: 20,
          difficulty: 'advanced',
          tags: ['GPU-hang', 'GRBM_STATUS', 'CP_RB_RPTR', 'gpu-recover', 'timeout'],
          concept: {
            summary: 'GPU Hang isdriverdevelopmentin最commonalso最棘手issue — GPU stopresponse, ring buffer incommandnotagainbyexecute. amdgpu through job timeout detect hang, through GRBM_STATUS/CP_RB_RPTR/WPTR registerdiagnosecause, through GPU reset recover. system化 hang analyzemethod论is AMD driverengineercoreskill. ',
            explanation: [
              'GPU Hang define: GPU commandhandle器(CP)stopfrom ring buffer in取出andexecutecommand. fromdriver视角, 表现ascommit给 GPU  job exceed timeout 时between仍not yetcomplete(fence noby signal). amdgpu default timeout is 10 秒(canthrough amdgpu.lockup_timeout moduleparameter调整). when timeout 发生时, drm_sched call amdgpu_job_timedout() startdiagnoseandrecoverprocess. ',
              'amdgpu_job_timedout() is hang handleentry pointfunction. 它process: (1)read GRBM_STATUS register — 这is GPU globalstateregister, 其in位指示哪个engine正inbusy(GUI_ACTIVE, CP_BUSY, SPI_BUSY 等). (2)read CP_RB_RPTR(Ring Buffer Read Pointer)and CP_RB_WPTR(Write Pointer) — if RPTR == WPTR, ring is空(GPU alreadyhandle完allcommand); if RPTR < WPTR 且not变化, CP 卡in某条commandon. (3)try IB test(向 ring writeasimple NOP command并waitcomplete) — if IB test through, indicate ring 本身no hang, issuemayinspecificcommandon. ',
              'GRBM_STATUS(Graphics Register Bus Manager Status)isdiagnose hang 最importantregister. key位: bit 31 GUI_ACTIVE(graphicsenginewhetheractive), bit 30 CP_BUSY(commandhandle器whetherbusy), bit 22-23 SPI_BUSY(shaderhandle器whetherbusy), bit 17 TA_BUSY(纹理address单元), bit 14 DB_BUSY(深度缓冲), bit 12 CB_BUSY(颜色缓冲). if CP_BUSY=1 且 RPTR not变化, indicate CP inexecutecurrentcommand时卡住 — mayisshader死循环, memoryaccess违规, orhardware缺陷. ',
              'GPU Reset is hang finallyrecover手段. amdgpu_device_gpu_recover() process: (1)notifyall客户端(DRM, KFD, display)GPU i.e.will reset; (2)stopall ring scheduling; (3)execute Mode 1 Reset(write GRBM_SOFT_RST register)or Mode 2 Reset(through PSP executecomplete GPU reset); (4)re-initializationall IP Block(GFX, SDMA, VCN 等); (5)recover ring buffer andre-commitqueuedin job. entireprocess约需 1-5 秒, 期between屏幕maywill闪烁. ',
            ],
            keyPoints: [
              'GPU Hang = CP stopfrom ring buffer 取command, 表现as job timeout(default 10 秒)',
              'amdgpu_job_timedout(): hang handleentry point, read GRBM_STATUS and CP_RB_RPTR/WPTR',
              'GRBM_STATUS key位: GUI_ACTIVE(31), CP_BUSY(30), SPI_BUSY(22-23)',
              'CP_RB_RPTR == WPTR → ring 空(alreadyhandle完); RPTR < WPTR 且not变 → CP 卡住',
              'IB test: 向 ring 发 NOP commandtesting — throughindicate ring 本身没issue',
              'GPU Reset: soft reset (GRBM_SOFT_RST) or full reset (PSP mode2)',
            ],
          },
          diagram: {
            title: 'GPU Hang detectandrecoverprocess',
            content: `GPU Hang fromdetecttorecovercompleteprocess

┌─────────── 正常run ───────────┐
│                                │
│  applicationcommit job → ring buffer    │
│  CP executecommand → fence signal    │
│  drm_sched mark job complete       │
│                                │
└──────────────┬─────────────────┘
               │ fence not yetin 10s 内 signal
               ▼
┌─────────── Timeout detect ───────┐
│                                │
│  drm_sched_job_timedout()      │
│       │                        │
│       ▼                        │
│  amdgpu_job_timedout()         │
│                                │
└──────────────┬─────────────────┘
               │
               ▼
┌─────────── statecollect ───────────┐
│                                │
│  1. GRBM_STATUS = 0xEE008002  │
│     parse:                      │
│     bit 31: GUI_ACTIVE = 1     │
│     bit 30: CP_BUSY    = 1     │
│     bit 23: SPI_BUSY   = 1     │
│     → graphicsengine+CP+SPI 全忙!    │
│                                │
│  2. CP_RB_RPTR = 0x00001200   │
│     CP_RB_WPTR = 0x00001234   │
│     → RPTR < WPTR, ring not空   │
│     → CP 卡in offset 0x1200   │
│                                │
│  3. IB test: TIMEOUT           │
│     → ring confirm hang           │
│                                │
└──────────────┬─────────────────┘
               │
               ▼
┌─────────── dmesg output ─────────┐
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
│  ├─ notifyall客户端              │
│  ├─ stopall ring scheduling          │
│  ├─ Mode 1: GRBM_SOFT_RST     │
│  │  └─ iffailure →              │
│  │     Mode 2: PSP full reset  │
│  ├─ re-initialization IP Blocks       │
│  ├─ recover ring buffers          │
│  └─ re-schedulingqueued jobs         │
│                                │
│  [drm] GPU reset succeeded     │
│                                │
└────────────────────────────────┘`,
            caption: 'GPU Hang completehandleprocess: timeout detect → statecollect(GRBM_STATUS, RPTR/WPTR)→ dmesg record → GPU reset recover. eachstageinformationall对diagnose hang cause至关important. ',
          },
          codeWalk: {
            title: 'amdgpu_job_timedout functionanalyze',
            file: 'drivers/gpu/drm/amd/amdgpu/amdgpu_job.c',
            language: 'c',
            code: `/* amdgpu_job.c — GPU job timeout handle */

static enum drm_gpu_sched_stat
amdgpu_job_timedout(struct drm_sched_job *s_job)
{
    struct amdgpu_ring *ring = to_amdgpu_ring(s_job->sched);
    struct amdgpu_job *job = to_amdgpu_job(s_job);
    struct amdgpu_device *adev = ring->adev;
    uint32_t grbm_status, rptr, wptr;

    /* 1. read GPU stateregister */
    grbm_status = RREG32(mmGRBM_STATUS);
    DRM_ERROR("GRBM_STATUS=0x%08X\n", grbm_status);

    /* parse GRBM_STATUS key位 */
    if (grbm_status & GRBM_STATUS__GUI_ACTIVE_MASK)
        DRM_ERROR("  GUI_ACTIVE: graphics engine active\n");
    if (grbm_status & GRBM_STATUS__CP_BUSY_MASK)
        DRM_ERROR("  CP_BUSY: command processor busy\n");

    /* 2. read Ring Buffer pointer */
    rptr = RREG32(ring->rptr_reg);
    wptr = RREG32(ring->wptr_reg);
    DRM_ERROR("ring %s: rptr=0x%08X wptr=0x%08X\n",
              ring->name, rptr, wptr);

    if (rptr == wptr)
        DRM_ERROR("  ring is empty — job may have completed"
                  " but fence not signaled\n");

    /* 3. try IB test (send NOP to ring) */
    if (amdgpu_ring_test_ib(ring, 1000) == 0) {
        DRM_INFO("ring %s IB test passed — soft hang\n",
                 ring->name);
        /* IB test through: mayis fence 丢失, notneed reset */
        return DRM_GPU_SCHED_STAT_NOMINAL;
    }

    /* 4. IB test failure: 真正 GPU hang, trigger reset */
    DRM_ERROR("ring %s IB test failed — hard hang!\n",
              ring->name);

    /* record fence state */
    DRM_ERROR("signaled fence=%llu, emitted fence=%llu\n",
              atomic64_read(&ring->fence_drv.last_seq),
              ring->fence_drv.sync_seq);

    /* trigger GPU recover */
    amdgpu_device_gpu_recover(adev, job, false);

    return DRM_GPU_SCHED_STAT_NOMINAL;
}

/* GPU recovercorefunction */
int amdgpu_device_gpu_recover(struct amdgpu_device *adev,
                               struct amdgpu_job *job,
                               bool force)
{
    /* 第一步: try soft reset */
    r = amdgpu_asic_reset(adev);
    if (r) {
        /* soft reset failure, try mode2 (PSP) reset */
        r = amdgpu_dpm_mode2_reset(adev);
    }

    /* re-initializationall IP block */
    amdgpu_device_ip_reinit_early(adev);
    amdgpu_device_ip_reinit_late(adev);

    /* recoverall ring state */
    amdgpu_fence_driver_hw_init(adev);

    return r;
}`,
            annotations: [
              'RREG32(mmGRBM_STATUS): read GPU globalstate, 判断whichenginein忙',
              'rptr == wptr: ring 空但 fence 没 signal — mayisinterrupt丢失or fence handle bug',
              'amdgpu_ring_test_ib(): 向 ring 写 NOP commandtesting — 区分 soft hang and hard hang',
              'soft hang: IB test through, GPU canexecute新command, issueisspecific job timeoutor fence 丢失',
              'hard hang: IB test failure, GPU completelystopresponse, need reset',
              'amdgpu_device_gpu_recover: 先 soft reset → failureagain mode2 reset → 重initialization IP',
            ],
            explanation: 'amdgpu_job_timedout is你in dmesg in看to "ring gfx_0.0.0 timeout" 时bycallfunction. understand它logicforanalyze GPU hang 至关important — 它告诉你 GPU when时精确state(whichenginein忙, ring pointer in哪inside, IB test whetherthrough). when你commit GPU hang related bug report 时, theseinformationisdevelopment者locateissuekey线索. ',
          },
          miniLab: {
            title: 'analyze一段real GPU hang dmesg dump',
            objective: 'practicefrom dmesg outputinextract GPU hang keyinformation, 判断 hang typeandmaycause. ',
            steps: [
              'readbelowsimulate GPU hang dmesg output(based onreal amdgpu hang logformat)',
              '识别key字段: ring 名称, GRBM_STATUS 值, RPTR/WPTR, fence state',
              'parse GRBM_STATUS 位字段, 判断which GPU enginein忙',
              'according to RPTR and WPTR relationship判断 ring state',
              'according to signaled/emitted fence 差值判断丢失 job count',
              '判断这is soft hang stillis hard hang',
            ],
            expectedOutput: `practice用simulate dmesg output:

[  345.678] [drm:amdgpu_job_timedout [amdgpu]] *ERROR*
  ring gfx_0.0.0 timeout, signaled seq=5678, emitted seq=5680
[  345.678] [drm:amdgpu_job_timedout [amdgpu]] *ERROR*
  GRBM_STATUS=0xEE008002
[  345.679] [drm:amdgpu_job_timedout [amdgpu]] *ERROR*
  CP_RB_RPTR=0x0000A100 CP_RB_WPTR=0x0000A180
[  345.680] [drm] ring gfx_0.0.0 IB test timed out
[  345.681] [drm] GPU reset initiated

analyzeto点:
1. emitted - signaled = 5680 - 5678 = 2 → 2 个 job not yetcomplete
2. GRBM_STATUS=0xEE008002:
   bit 31 (GUI_ACTIVE) = 1, bit 30 (CP_BUSY) = 1
   bit 23 (SPI_BUSY) = 1 → shaderinexecute
3. RPTR(0xA100) < WPTR(0xA180) → ring hasnot yethandlecommand
4. IB test timeout → hard hang, need reset`,
            hint: 'the GRBM_STATUS 十六进制值转成二进制看各个位. 0xEE008002 = 1110_1110_0000_0000_1000_0000_0000_0010. bit 31=1(GUI), bit 30=1(CP), bit 29=1(某engine), bit 23=1(SPI). ',
          },
          debugExercise: {
            title: 'fromregister值判断 GPU hang cause',
            language: 'text',
            description: 'belowistwodifferent GPU hang scenarioregisterstate. 判断eachscenario hang cause. ',
            question: 'analyzetwoscenarioregisterstate, 判断各自 hang causeandrecommendedfix方向. ',
            buggyCode: `scenario A:
  GRBM_STATUS    = 0x00000000
  CP_RB_RPTR     = 0x0000F000
  CP_RB_WPTR     = 0x0000F000
  signaled fence = 1234
  emitted fence  = 1235
  IB test        = PASSED

scenario B:
  GRBM_STATUS    = 0xEE00FFFF
  CP_RB_RPTR     = 0x00003400
  CP_RB_WPTR     = 0x00003480
  signaled fence = 8900
  emitted fence  = 8901
  IB test        = TIMED OUT
  最近commitcommand: acontain compute shader  job
  dmesg 额outsideinformation: amdgpu: GPU fault detected: src_id:146
                  vmid:3 pasid:32772`,
            hint: 'scenario A  GRBM_STATUS 全 0 意味着 GPU 并not忙. scenario B has GPU fault (src_id:146 = VMC page fault). ',
            answer: 'scenario A analyze: GRBM_STATUS=0x00000000(GPU completelyidle), RPTR==WPTR(ring 空), IB test through — GPU hardwarenoissue. 但 signaled(1234) < emitted(1235), has 1 个 job  fence noby signal. 这isa soft hang/fence 丢失issue, 最maycauseisinterrupt丢失(GPU complete任务但 fence interruptnoto达 CPU)or fence handlecode bug(fence_process nocheckto新complete seq). fix方向: checkinterrupt handlingcode, add fence polling fallback. scenario B analyze: GRBM_STATUS=0xEE00FFFF(几乎allengineallin忙), IB test timeout — hard hang. key线索is "GPU fault detected: src_id:146", src_id 146 is VMC (Virtual Memory Controller) page fault, indicate compute shader accessnot yetmapping GPU virtual address. GPU inhandle page fault 时陷入deadlock(GRBM 全忙). fix方向: checkapplicationprogram buffer mapping whethercorrect, whetherhas use-after-free(buffer alreadybyrelease但 shader stillinaccess). ',
          },
          interviewQ: {
            question: 'describe你analyzea GPU hang completemethod论. fromuserreport "屏幕freeze" tolocate根因process. ',
            difficulty: 'hard',
            hint: '按layer次: 收集information(dmesg)→ 分类 hang type(soft/hard)→ analyzeregister(GRBM_STATUS)→ analyze ring(RPTR/WPTR)→ analyzecommand流(ring content)→ locate根因. ',
            answer: '我 GPU hang analyzemethod论: (1)information收集: firstgetcomplete dmesg(dmesg > hang_log.txt), 搜索 "timeout\\|hang\\|reset\\|fault\\|ERROR". meanwhile收集 /sys/kernel/debug/dri/0/amdgpu_fence_info and GPU state(pp_dpm_sclk, gpu_busy_percent). (2)Hang 分类: according to IB test result区分 soft hang(IB test through, usuallyis fence 丢失orspecific job 异常)and hard hang(IB test failure, GPU completelystopresponse). (3)GRBM_STATUS analyze: parsewhichenginein忙 — if SPI_BUSY=1 mayis shader 死循环; if DB_BUSY/CB_BUSY=1 mayisrenderingpipelineblock; ifonly CP_BUSY=1 mayis CP 微码 bug. (4)Ring Pointer analyze: RPTR and WPTR 差值告诉你 ring inhashow muchnot yethandlecommand. if RPTR in多次samplinginnot变, CP 确实卡住. compute RPTR 指向 ring offset, find卡住command. (5)Ring Content analyze: 用 umr --ring-stream or debugfs read ring buffer 内容, find RPTR location PM4 command packet — 这iscause hang command. analyzecommandtype(draw/dispatch/DMA)andparameter. (6)根因locate: 结合commandtype, GRBM_STATUS, whetherhas GPU fault(VMC page fault  src_id:146), whethercan复现, 判断isapplication bug(error buffer mapping), driver bug(command构造error)stillishardware bug(specificconditiontriggerhardware缺陷). (7)verifyfix: 提出fixafter, 用同样 workload verify hang notagain发生, meanwhilerun IGT gpu-hang testingensureno回归. ',
            amdContext: '这is AMD GPU driverteaminterviewin高频题. demonstrate你hassystem化analyzeprocess, 而is not"看to hang  reset". 特别to提to GRBM_STATUS 位parseand ring content analyze — 这indicate你understand GPU hardwarelayer面debugging. ',
          },
        },

        // ── Lesson 6.2.2 ──────────────────────────────────────
        {
          id: '6-2-2',
          number: '6.2.2',
          title: 'umr: AMD GPU registerdebuggingtool',
          titleEn: 'umr: AMD GPU Register Debug Tool',
          duration: 20,
          difficulty: 'advanced',
          tags: ['umr', 'register', 'GRBM_STATUS', 'ring-stream', 'VRAM', 'wave-status'],
          concept: {
            summary: 'umr(User Mode Register reader)is AMD 官方 GPU registerdebuggingtool, caninuser space读写 GPU register, 解码register位字段, analyze ring buffer command流, read VRAM 内容, view wave(thread组)state. 它is AMD driverengineer最常用hardware级debuggingtool. ',
            explanation: [
              'umr through debugfs interface(/sys/kernel/debug/dri/0/)and MMIO mappingaccess GPU register. 它内置complete AMD GPU registerdata库 — from GCN to RDNA4 每一代 GPU eachregister名称, offsetaddress, 位字段defineallbycontainin内. this means你notneed查阅hardware手册can解读register含义. ',
              'registerreadis umr 最basicfunction. umr -O bits -r commandreadaregister并解码each位字段含义. for example umr -O bits -r gfx1100.grbm.mmGRBM_STATUS willoutput GRBM_STATUS 值andeach位名称andstate(GUI_ACTIVE=1, CP_BUSY=0 等). -O bits 选项let umr display位leveldetailed解码. ',
              'ring stream analyzeis umr in GPU hang debuggingin最has价值function. umr --ring-stream gfx[0] read GFX ring buffer 内容并willraw PM4 command packet解码as人can读format. 你can看to ring in每条command — SET_SH_REG(setshaderregister), DRAW_INDEX(绘制command), DMA_COPY(datatransfer)等. 结合 RPTR location, 你can精确locatecause hang command. ',
              'umr otheradvancedfunction: 读写 VRAM 内容(umr --read-vram 0x0 4096 导出 VRAM data), view wave state(umr --waves displayallactive shader wave  PC, EXEC mask, VGPR/SGPR state), view VM(virtual memory)page tablemapping(umr --vm-decode parse GPU page table). thesefunctioninanalyzecomplex GPU hang andshader bug 时非常has用. ',
            ],
            keyPoints: [
              'umr through debugfs/MMIO access GPU register, 内置complete AMD registerdata库',
              'umr -O bits -r: readregister并解码位字段(最常用command)',
              'umr --ring-stream gfx[0]: 解码 ring buffer in PM4 command packet',
              'umr --waves: viewactive shader wave  PC andregisterstate',
              'umr --read-vram: read GPU VRAM 内容(debuggingframebuffer/纹理data)',
              'umr --vm-decode: parse GPU virtual memorypage tablemapping',
            ],
          },
          diagram: {
            title: 'umr toolability全景图',
            content: `umr — AMD GPU registerdebuggingtoolability图

                    umr (User Mode Register reader)
                    ──────────────────────────────
                              │
        ┌─────────┬───────────┼───────────┬──────────┐
        │         │           │           │          │
        ▼         ▼           ▼           ▼          ▼
   ┌─────────┐ ┌─────────┐ ┌──────────┐ ┌────────┐ ┌────────┐
   │register读写│ │Ring analyze│ │VRAM 读写 │ │Wave    │ │VM page table │
   │         │ │         │ │          │ │state    │ │parse    │
   └────┬────┘ └────┬────┘ └────┬─────┘ └───┬────┘ └───┬────┘
        │         │         │          │         │
        ▼         ▼         ▼          ▼         ▼

  umr -O bits   umr --ring  umr --read  umr      umr
  -r gfx1100.   -stream     -vram addr  --waves  --vm
  grbm.mmGRBM   gfx[0]     size                 -decode
  _STATUS                                vmid

  outputexample:    outputexample:    outputexample:  outputexample:  outputexample:
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
  → diagnosewhich   → findcause   → debugging帧   → find卡  → diagnose GPU
    engine卡住     hangcommand   缓冲内容   住shader  page fault

常用 5 个keyregister:
┌────────────────────────────────────────────────────────┐
│  1. GRBM_STATUS    — GPU globalenginebusystate              │
│  2. CP_RB_RPTR     — Ring Buffer 读pointer(CP currentlocation)  │
│  3. CP_RB_WPTR     — Ring Buffer 写pointer(latestcommandlocation)  │
│  4. SRBM_STATUS    — System Register Bus Manager state  │
│  5. CP_STALLED_STAT— CP blockcause详情                   │
└────────────────────────────────────────────────────────┘`,
            caption: 'umr provide五种coredebuggingability: register读写, ring buffer command流analyze, VRAM 内容access, shader wave stateview, GPU virtual memorypage tableparse. theseoverwrite GPU hardwaredebuggingall维度. ',
          },
          codeWalk: {
            title: 'use umr read GRBM_STATUS 并解码',
            file: 'terminal (umr commands)',
            language: 'bash',
            code: `# === umr basic用法: readand解码 GPU register ===

# 1. 列出current GPU support ASIC
umr --enumerate
# Output: --- amdgpu device 0 ---
#         pci: 0000:03:00.0
#         asic: gfx1100    ← RDNA3 (your GPU 代号)

# 2. read GRBM_STATUS 并解码each位字段
umr -O bits -r gfx1100.grbm.mmGRBM_STATUS
# Output:
# gfx1100.grbm.mmGRBM_STATUS == 0x00000200
#   GUI_ACTIVE           [31] = 0  ← graphicsengineidle
#   CP_BUSY              [30] = 0  ← commandhandle器idle
#   CP_COHERENCY_BUSY    [28] = 0
#   SPI_BUSY          [23:22] = 0  ← shaderhandle器idle
#   TA_BUSY              [17] = 0  ← 纹理单元idle
#   DB_BUSY              [14] = 0  ← 深度缓冲idle
#   CB_BUSY              [12] = 0  ← 颜色缓冲idle
#   GDS_BUSY              [9] = 1  ← Global Data Share active

# 3. read Ring Buffer pointer
umr -O bits -r gfx1100.gfx.mmCP_RB0_RPTR
umr -O bits -r gfx1100.gfx.mmCP_RB0_WPTR

# 4. read SRBM_STATUS (systemlayer面state)
umr -O bits -r gfx1100.grbm.mmSRBM_STATUS

# 5. analyze GFX ring stream (解码 PM4 command)
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

# 6. viewactive shader waves
umr --waves
# Output:
# se0.sh0.cu0:
#   wave[0]: status=ACTIVE pc=0x800100A8
#     exec_mask=0xFFFFFFFFFFFFFFFF
#     hw_id: queue=0, pipe=0, me=0
#   wave[1]: status=ACTIVE pc=0x800100B0

# 7. read VRAM data (before 256 bytes)
umr --read-vram 0x0 256`,
            annotations: [
              'umr --enumerate: detectsystemin AMD GPU 并display ASIC 代号(gfx1100=RDNA3)',
              '-O bits: key选项 — let umr displayeach位字段名称and值, 而not只israw十六进制',
              'ring-stream gfx[0]: 解码 GFX ring 0  PM4 command, hang 时这islocate卡住commandkey',
              '--waves: displayallactive shader wave — if PC pointernot变化, shader may死循环',
              'PKT3 is PM4 commandformatidentifier — PKT3_DRAW_INDEX_AUTO is绘制command',
              'GRBM_STATUS 全 0(除 GDS_BUSY)represent GPU 正常idlestate',
            ],
            explanation: 'umr is AMD driverteaminternal日常usedebuggingtool. -O bits -r is你用得最多command — in GPU hang 时快速read GRBM_STATUS 判断whichengine卡住, then用 --ring-stream analyze卡in哪条commandon. masterthistoolchaincanletyour hang analyze效率提升 10 倍above. ',
          },
          miniLab: {
            title: 'install umr 并read 5 个keyregister',
            objective: 'install umr tool, readyour GPU  5 个keyregister并解读they含义. ',
            setup: `# from AMD 官方repositoryinstall umr
# method 1: through包manager(ifhas)
sudo apt install umr

# method 2: fromsource codecompilation
git clone https://gitlab.freedesktop.org/tomstdenis/umr.git
cd umr
mkdir build && cd build
cmake .. && make -j$(nproc)
sudo make install`,
            steps: [
              'confirm umr alreadyinstall并detectto GPU: sudo umr --enumerate',
              'read GRBM_STATUS(globalstate): sudo umr -O bits -r <asic>.grbm.mmGRBM_STATUS(用 enumerate output asic 名称替换 <asic>)',
              'read SRBM_STATUS(systemstate): sudo umr -O bits -r <asic>.grbm.mmSRBM_STATUS',
              'read GFX ring  RPTR and WPTR: sudo umr -O bits -r <asic>.gfx.mmCP_RB0_RPTR && sudo umr -O bits -r <asic>.gfx.mmCP_RB0_WPTR',
              'read GPU 时钟state: sudo umr -O bits -r <asic>.smu.mmSMC_IND_DATA(or等效register)',
              'run glxgears afteragain次read GRBM_STATUS, compareidleand负载时差异',
              'try ring stream analyze: sudo umr --ring-stream gfx[0] | head -30',
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
  ...                             ← GPU idlestate

(run glxgears after)
gfx1100.grbm.mmGRBM_STATUS == 0xC6008002
  GUI_ACTIVE           [31] = 1   ← graphicsengineactive!
  CP_BUSY              [30] = 1   ← CP inhandlecommand!
  SPI_BUSY          [23:22] = 1   ← shaderinwork!`,
            hint: 'umr need root permission(through debugfs access GPU). if报 "cannot find ASIC", confirm amdgpu driveralreadyloading. ASIC 名称(如 gfx1100)取决于your GPU 型号 — RX 7600 XT mayis gfx1100 or gfx1102. ',
          },
          debugExercise: {
            title: 'from umr outputdiagnose GPU hang state',
            language: 'text',
            description: 'belowis GPU hang 时through umr collectregisterand ring stream output. analyzedatafind hang cause. ',
            question: 'according to umr output判断: (1) GPU 哪个engine卡住? (2) 卡inwhatcommandon? (3) 最may根因iswhat? ',
            buggyCode: `# umr in GPU hang 时collectdata

$ sudo umr -O bits -r gfx1100.grbm.mmGRBM_STATUS
gfx1100.grbm.mmGRBM_STATUS == 0xEC008002
  GUI_ACTIVE           [31] = 1
  CP_BUSY              [30] = 1
  CP_COHERENCY_BUSY    [28] = 1
  SPI_BUSY          [23:22] = 3  ← two SPI all忙!
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
  ← all wave  PC 指向同一address!`,
            hint: 'all wave  PC (Program Counter) all指向同一address 0x800200A0, SPI_BUSY=3(two SPI all忙), ring 停in DISPATCH_DIRECT(compute shader dispatch)...',
            answer: 'analyze: (1)卡住engine: SPI_BUSY=3(two Shader Processor Input all忙)+ GUI_ACTIVE=1 + CP_BUSY=1, 但 TA/DB/CB allidle. 这indicateisshaderengine(Shader Engine)本身卡住, is not纹理, 深度or颜色operateissue. (2)卡incommand: ring stream in RPTR=0x2080 处is PKT3_DISPATCH_DIRECT, 这isa compute shader dispatch command, dim_x=65536, dim_y=65536, 总共 65536×65536=4,294,967,296 个thread组 — 这isa极大 dispatch. (3)最may根因: all wave  PC all指向同一address 0x800200A0, indicate compute shader in该address处死循环(如 while(true) orwaita永远not满足condition). 这mayisshadercode bug(无限循环)orisshaderwaitglobal memoryaddresscontainerror值(cause spin-wait 永远not退出). fix方向: (1)check 0x800200A0 address处 shader ISA instruction(用 umr --waves --decode 解码); (2)check shader whetherhas barrier/spin-lock logic, confirm终止conditionwhethercan达; (3)减小 dispatch 维度testingwhetherstillwill hang. ',
          },
          interviewQ: {
            question: '你hasainspecific GPU workload belowcan 100% 复现 hang. describe你howuse umr tool一步步locate根因. ',
            difficulty: 'hard',
            hint: '利用can复现优势: 先正常statecollect基线, again hang statecollectcompare. use umr registerread, ring stream, wave status 三个维度逐步缩小range. ',
            answer: '利用 100% can复现优势, 我will按belowstepuse umr: (1)基线collect: intrigger hang  workload runbefore, collect GRBM_STATUS, SRBM_STATUS, CP_RB_RPTR/WPTR 作as正常state基线. (2)trigger hang: run workload, when dmesg 出现 timeout 警告时(但in GPU reset before), use脚本快速collect: umr -O bits -r gfx1100.grbm.mmGRBM_STATUS > hang_regs.txt, umr --ring-stream gfx[0] > hang_ring.txt, umr --waves > hang_waves.txt. (3)registercompare: compare基线and hang 时 GRBM_STATUS, findwhichenginefromidle变asbusy — 这locateissue所inhardwaremodule(GFX? SPI? TA? DB?). (4)Ring Stream analyze: in hang_ring.txt infind RPTR locationcommand — 这is CP 卡住精确location. 解码 PM4 commandtypeandparameter, 确定is draw call, compute dispatch stillis DMA operate. (5)Wave analyze: ifis shader hang, check --waves outputinallactive wave  PC. if PC gatherin同一address — shader 死循环. if PC scatter但 EXEC mask 异常 — mayis divergence bug. 用 umr --waves --decode 解码 PC 处 ISA instruction. (6)VM analyze: if dmesg has GPU fault, 用 umr --vm-decode check fault addresspage tablemapping — confirmispage table缺失(unmapped)stillispermissionerror. (7)二分locate: 利用can复现性, modify workload 逐步缩小triggercondition(减少 dispatch size, disablespecific shader feature), 直tofind最小复现案例. entireprocessusuallyneed 2-4 小时. ',
            amdContext: 'thisissuetestingyourhardware级debuggingability. AMD interviewinif你can流畅describe umr usescenarioandspecificcommand, indicate你hasactual GPU debuggingexperience — 这is区分理论learnand实战experiencekey. ',
          },
        },
      ],
    },
  ],
  completionChecklist: [
    'understand printk loglevel体系and DRM_DEBUG macro位maskcontrolmechanism',
    'canusedynamicdebugging (echo "module amdgpu +p") 按需开启/关闭debuggingoutput',
    'canthrough debugfs (/sys/kernel/debug/dri/0/) read GPU run时state',
    'understand ftrace architecture(ring buffer, function/function_graph tracer, TRACE_EVENT)',
    'canuse trace-cmd tracing amdgpu tracing点并analyzecommand submissionlatency',
    'canuse perf top/stat/record analyze CPU 侧hotspot并generate火焰图',
    '解 rocprof --stats/--hsa-trace and GPU hardwarecount器usemethod',
    'master GPU hang analyzemethod论: GRBM_STATUS parse + RPTR/WPTR analyze + IB test',
    'understand amdgpu_job_timedout and amdgpu_device_gpu_recover process',
    'caninstallanduse umr read GPU register, analyze ring stream, view wave state',
  ],
};
