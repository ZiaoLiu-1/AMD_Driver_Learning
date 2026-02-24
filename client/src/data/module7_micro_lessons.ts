// ============================================================
// AMD Linux Driver Learning Platform - Module 7 Micro-Lessons
// Module 7: ROCm Kernel Interface (ROCm 内核接口 KFD)
// 4 lessons in 2 groups, ~15-20 min each, total ~70 min
// ============================================================
import type { MicroLessonModule } from './micro_lesson_types';

export const module7MicroLessons: MicroLessonModule = {
  moduleId: 'rocm-kernel',
  groups: [
    // ════════════════════════════════════════════════════════════
    // Group 7.1: HSA 架构与 KFD 基础
    // ════════════════════════════════════════════════════════════
    {
      id: '7-1',
      number: '7.1',
      title: 'HSA 架构与 KFD 基础',
      titleEn: 'HSA Architecture & KFD Basics',
      icon: 'Zap',
      description: '理解 HSA 异构计算标准、KFD 在 amdgpu 中的角色、/dev/kfd 设备节点的运作机制，以及 KFD 与传统 DRM 接口的核心差异。',
      lessons: [
        // ── Lesson 7.1.1 ──────────────────────────────────────
        {
          id: '7-1-1',
          number: '7.1.1',
          title: 'HSA 架构与 KFD 概述',
          titleEn: 'HSA Architecture & KFD Overview',
          duration: 18,
          difficulty: 'advanced',
          tags: ['HSA', 'KFD', 'ROCm', '/dev/kfd', 'kfd_process', 'chardev'],
          concept: {
            summary: 'HSA（Heterogeneous System Architecture）是一种异构计算标准，定义了 CPU 和 GPU 如何共享内存和协作执行。KFD（Kernel Fusion Driver）是 amdgpu 驱动中实现 HSA 内核接口的子模块，通过 /dev/kfd 设备节点暴露计算能力，与传统的 DRM 渲染接口 /dev/dri/renderD128 形成互补。',
            explanation: [
              'HSA 由 HSA Foundation 制定（AMD 是创始成员），其核心理念是：CPU 和 GPU 不再是"主从关系"，而是平等的计算代理（Agent）。在 HSA 模型中，CPU 和 GPU 共享同一个虚拟地址空间（Shared Virtual Memory），GPU 可以直接访问 CPU 的内存页，反之亦然。这消除了传统 GPGPU 编程中显式 cudaMemcpy 的需求——数据不需要在 CPU 和 GPU 之间手动拷贝。',
              'KFD 是 HSA 在 Linux 内核中的实现，代码位于 drivers/gpu/drm/amd/amdkfd/ 目录。它不是一个独立的驱动，而是 amdgpu 驱动的子模块。KFD 通过 /dev/kfd 字符设备节点向用户空间暴露 HSA 功能。ROCm 运行时（libhsa-runtime64.so）通过 ioctl 调用 KFD 来创建计算队列、分配 GPU 内存、管理信号量等。',
              '理解 KFD 与 DRM 接口的区别至关重要。DRM 接口（/dev/dri/card0、renderD128）面向图形渲染和通用 GPU 访问——Mesa radeonsi/radv 通过它提交渲染命令。KFD 接口（/dev/kfd）专门面向 HSA 计算——ROCm/HIP 通过它提交计算任务。两者在内核中共用 amdgpu 驱动的底层硬件访问层，但使用不同的命令格式（DRM 用 PM4，KFD 用 AQL）、不同的队列类型（DRM 用 GFX Ring，KFD 用 Compute Queue）、不同的内存模型（DRM 用 GEM/TTM，KFD 还额外支持 SVM）。',
              'KFD 的生命周期管理围绕 kfd_process 结构体展开。当用户空间进程第一次通过 ioctl 访问 /dev/kfd 时，KFD 为该进程创建一个 kfd_process 实例，其中包含进程的 GPU 资源（队列、内存映射、事件）。这个结构体贯穿整个 KFD 子系统，是理解 KFD 代码的核心数据结构。kfd_process 持有该进程在所有 GPU 上的 kfd_process_device 列表——每个 GPU 对应一个 kfd_process_device，其中记录了该进程在这块 GPU 上的 doorbell 映射、队列列表和地址空间 ID（PASID）。',
            ],
            keyPoints: [
              'HSA 定义 CPU/GPU 为平等的计算代理（Agent），共享虚拟地址空间，消除显式数据拷贝',
              'KFD 代码位于 drivers/gpu/drm/amd/amdkfd/，是 amdgpu 的子模块而非独立驱动',
              '/dev/kfd 面向 HSA 计算（ROCm/HIP），/dev/dri/renderD128 面向图形渲染（Mesa）',
              'KFD 使用 AQL 命令包 + Compute Queue；DRM 使用 PM4 命令包 + GFX Ring',
              'kfd_process 是 KFD 的核心数据结构，管理一个进程在所有 GPU 上的计算资源',
              'kfd_process_device 关联进程与具体 GPU，持有 PASID、doorbell 映射和队列列表',
            ],
          },
          diagram: {
            title: 'KFD 与 DRM 双路径架构',
            content: `amdgpu 驱动的双接口架构：DRM（图形）vs KFD（计算）

用户空间
─────────────────────────────────────────────────────────────
  图形路径                              计算路径
  ────────                              ────────
  游戏 / Blender                        HIP 程序 / PyTorch
       │                                     │
       ▼                                     ▼
  Mesa radeonsi/radv                    ROCm Runtime
  (OpenGL / Vulkan)                     libhsa-runtime64.so
       │                                     │
       ▼                                     ▼
  libdrm (amdgpu)                       直接 ioctl
       │                                     │
       ▼                                     ▼
  /dev/dri/renderD128                   /dev/kfd
  (DRM render node)                     (HSA device node)
       │                                     │
═══════╪═════ 系统调用边界 ══════════════════╪═══════════════
       │                                     │
内核空间│                                     │
       ▼                                     ▼
  DRM ioctl 分发                        KFD ioctl 分发
  drm_ioctl()                           kfd_ioctl()
       │                                     │
       ▼                                     ▼
  amdgpu_cs_ioctl()                     kfd_ioctl_create_queue()
  ├─ PM4 命令包验证                     ├─ AQL 队列创建
  ├─ GFX Ring 提交                      ├─ Compute Queue 映射
  └─ fence 同步                         └─ doorbell 分配
       │                                     │
       └──────────┬──────────────────────────┘
                  │
                  ▼
          amdgpu 硬件抽象层
          ├─ MMIO 寄存器访问
          ├─ VRAM 管理 (TTM)
          ├─ 中断处理 (IH Ring)
          └─ 固件接口 (PSP/SMU)
                  │
                  ▼
            GPU 硬件 (Navi33)
            ┌─────────────────────────┐
            │ Shader Engines (32 CU)  │
            │ ┌─────┐ ┌─────┐        │
            │ │GFX  │ │Comp │        │
            │ │Rings│ │Queue│        │
            │ └─────┘ └─────┘        │
            └─────────────────────────┘`,
            caption: 'amdgpu 驱动同时为图形渲染和 GPU 计算提供内核接口。两条路径在用户空间分别通过 /dev/dri/renderD128 和 /dev/kfd 进入内核，在底层共享硬件访问层。Compute Queue 可以独立于 GFX Ring 被 GPU 直接调度。',
          },
          codeWalk: {
            title: 'kfd_open — 进程首次打开 /dev/kfd 的入口',
            file: 'drivers/gpu/drm/amd/amdkfd/kfd_chardev.c',
            language: 'c',
            code: `/* kfd_chardev.c — /dev/kfd 的文件操作实现 */

static const struct file_operations kfd_fops = {
    .owner   = THIS_MODULE,
    .unlocked_ioctl = kfd_ioctl,  /* 所有 KFD ioctl 的入口 */
    .compat_ioctl   = compat_ptr_ioctl,
    .open    = kfd_open,           /* 进程打开 /dev/kfd */
    .release = kfd_release,        /* 进程关闭 /dev/kfd */
    .mmap    = kfd_mmap,           /* mmap doorbell / events */
};

static int kfd_open(struct inode *inode, struct file *filep)
{
    struct kfd_process *process;
    bool is_32bit_user_mode;

    /* 检查当前进程是否是 32 位——KFD 不支持 32 位进程 */
    is_32bit_user_mode = in_compat_syscall();
    if (is_32bit_user_mode) {
        dev_warn(kfd_device,
            "Process %d (32-bit) rejected\\n", current->pid);
        return -EPERM;
    }

    /* 核心：获取或创建当前进程的 kfd_process
     * 如果进程已经打开过 /dev/kfd，返回已有的 kfd_process
     * 否则创建新的 kfd_process 并初始化：
     *   - 分配 PASID (Process Address Space ID)
     *   - 为每个 GPU 创建 kfd_process_device
     *   - 注册 MMU notifier（监控进程页表变化）
     */
    process = kfd_create_process(current);
    if (IS_ERR(process))
        return PTR_ERR(process);

    /* 将 kfd_process 保存到 file 的 private_data
     * 后续所有 ioctl 调用都通过它获取进程上下文
     */
    if (kfd_is_locked()) {
        kfd_unref_process(process);
        return -EAGAIN;
    }

    /* kfd_process 引用计数 +1 */
    filep->private_data = process;

    dev_dbg(kfd_device, "Opened /dev/kfd for pid %d\\n",
            process->lead_thread->pid);
    return 0;
}`,
            annotations: [
              'kfd_fops 是 /dev/kfd 设备节点的文件操作表，kfd_ioctl 处理所有 HSA ioctl 请求',
              'KFD 不支持 32 位进程——HSA 要求 64 位虚拟地址空间以实现 CPU-GPU 统一寻址',
              'kfd_create_process() 是核心函数：分配 PASID、创建 kfd_process_device、注册 MMU notifier',
              'PASID 是进程地址空间 ID，GPU 用它来区分不同进程的页表，实现进程隔离',
              'MMU notifier 让 KFD 感知进程页表变化（如 munmap），及时更新 GPU 页表保持一致',
              'filep->private_data 保存 kfd_process 指针，后续 ioctl 通过它找到进程的 GPU 资源',
            ],
            explanation: '这段代码是用户空间 ROCm 运行时访问 GPU 计算能力的第一步。当 libhsa-runtime64.so 调用 open("/dev/kfd", ...) 时，内核执行 kfd_open，为该进程创建完整的 HSA 执行环境。kfd_create_process 内部会遍历系统中所有 KFD 设备（GPU），为每个 GPU 创建 kfd_process_device，这意味着一个 ROCm 进程从一开始就能访问所有已注册的 GPU。理解这个入口点是阅读所有 KFD 代码的起点。',
          },
          miniLab: {
            title: '探索 /dev/kfd 设备节点和 KFD 源码结构',
            objective: '检查系统上的 KFD 设备节点、内核模块参数，并了解 KFD 源码目录结构。',
            steps: [
              '检查 /dev/kfd 是否存在：ls -la /dev/kfd（需要 amdgpu 内核模块和 ROCm 支持）',
              '查看 KFD 在 dmesg 中的初始化信息：dmesg | grep -i "kfd\\|hsa"',
              '如果安装了 ROCm：运行 /opt/rocm/bin/rocminfo 查看 HSA Agent 列表',
              '统计 KFD 源码规模：find drivers/gpu/drm/amd/amdkfd/ -name "*.c" -o -name "*.h" | xargs wc -l | tail -1',
              '查看 KFD ioctl 定义：grep -n "AMDKFD_IOC_" include/uapi/linux/kfd_ioctl.h | head -20',
              '检查内核是否启用了 KFD：zgrep HSA_AMD /proc/config.gz 或 grep HSA_AMD /boot/config-$(uname -r)',
            ],
            expectedOutput: `$ ls -la /dev/kfd
crw-rw---- 1 root render 234, 0  /dev/kfd   ← major 234 字符设备

$ dmesg | grep -i kfd
[  2.65] kfd kfd: Initialized module
[  2.66] kfd kfd: added device 1002:7480   ← 你的 Navi33

$ rocminfo | grep -A2 "Agent"
Agent 1: CPU (gfx000)
Agent 2: GPU (gfx1102)          ← 你的 GPU 作为 HSA Agent

$ grep HSA_AMD /boot/config-$(uname -r)
CONFIG_HSA_AMD=y                ← KFD 已编译进内核`,
            hint: '如果 /dev/kfd 不存在，检查内核配置中 CONFIG_HSA_AMD 是否启用。如果使用发行版内核，大多数现代发行版默认启用此选项。ROCm 安装不是必须的——/dev/kfd 由内核 amdgpu 模块创建。',
          },
          debugExercise: {
            title: '诊断 KFD 设备打开失败',
            language: 'c',
            description: '一个 ROCm 应用在调用 open("/dev/kfd", O_RDWR) 时返回错误。以下是相关的 strace 输出和 dmesg 日志。找出失败原因。',
            question: '为什么进程无法打开 /dev/kfd？给出根本原因和解决方法。',
            buggyCode: `/* strace 输出 */
openat(AT_FDCWD, "/dev/kfd", O_RDWR) = -1 EACCES (Permission denied)

/* dmesg 日志 */
[  2.65] kfd kfd: Initialized module
[  2.66] kfd kfd: added device 1002:7480

/* 设备节点权限 */
$ ls -la /dev/kfd
crw-rw---- 1 root render 234, 0 /dev/kfd

/* 当前用户的组 */
$ groups
myuser adm sudo audio

/* 另一种可能的失败场景 */
$ /opt/rocm/bin/rocminfo
HSA_STATUS_ERROR_OUT_OF_RESOURCES: PASID allocation failed`,
            hint: '第一个场景：检查用户是否属于 render 组。第二个场景：PASID 分配失败通常与 IOMMU 配置有关。',
            answer: '场景 1（EACCES）：/dev/kfd 的权限是 crw-rw---- root:render，只有 root 和 render 组的用户可以打开。当前用户不在 render 组中。解决：sudo usermod -aG render myuser，然后重新登录。场景 2（PASID 分配失败）：PASID（Process Address Space ID）由 IOMMU 子系统管理。如果内核启动时未启用 IOMMU（缺少 iommu=on 或 amd_iommu=on 内核参数），KFD 可能无法分配 PASID。解决：在 GRUB 配置中添加 amd_iommu=on iommu=pt 内核参数，重新启动。iommu=pt（passthrough）模式允许 KFD 使用 IOMMU 进行 PASID 管理而不影响 DMA 性能。这两个都是部署 ROCm 时最常见的问题。',
          },
          interviewQ: {
            question: '解释 KFD 在 amdgpu 驱动中的角色。它与传统的 DRM 渲染接口有什么区别？为什么需要两个独立的接口？',
            difficulty: 'medium',
            hint: '从设计目标（图形 vs 计算）、命令格式（PM4 vs AQL）、队列模型（内核调度 vs 用户态调度）和内存模型（GEM/TTM vs SVM）四个维度对比。',
            answer: 'KFD（Kernel Fusion Driver）是 amdgpu 驱动中实现 HSA 计算接口的子模块，通过 /dev/kfd 向 ROCm 运行时暴露 GPU 计算能力。它与 DRM 渲染接口的核心区别：（1）设计目标：DRM 面向图形渲染（Mesa 的 OpenGL/Vulkan），KFD 面向通用计算（ROCm 的 HIP/OpenCL）；（2）命令格式：DRM 使用 PM4 命令包（GPU 命令处理器原生格式），KFD 使用 AQL（Architected Queuing Language）包（HSA 标准定义的平台无关格式）；（3）队列模型：DRM 的命令提交需要经过内核验证（amdgpu_cs_ioctl），KFD 允许用户空间直接写入队列并通过 doorbell 通知 GPU，绕过内核热路径（减少延迟）；（4）内存模型：DRM 使用 GEM/TTM 显式管理 GPU 内存，KFD 还额外支持 SVM（Shared Virtual Memory），CPU 和 GPU 共享同一虚拟地址空间。需要两个接口的原因是计算工作负载有不同的性能要求——GPU 计算需要极低延迟的队列提交和统一内存访问，这些在传统图形 API 中不是优先考虑的。',
            amdContext: '这是 AMD ROCm 团队面试的经典问题。关键是展示你理解 KFD 不是 DRM 的替代品，而是针对计算场景的专用接口，两者在底层共享 amdgpu 的硬件抽象层。',
          },
        },

        // ── Lesson 7.1.2 ──────────────────────────────────────
        {
          id: '7-1-2',
          number: '7.1.2',
          title: 'KFD 队列管理与 AQL 命令包',
          titleEn: 'KFD Queue Management & AQL Packets',
          duration: 20,
          difficulty: 'advanced',
          tags: ['AQL', 'compute-queue', 'HQD', 'MQD', 'doorbell', 'user-mode-queue'],
          concept: {
            summary: '计算队列是 KFD 的核心抽象。与图形 Ring Buffer 不同，KFD 的计算队列允许用户空间直接写入 AQL 命令包并通过 doorbell 寄存器通知 GPU 执行，无需内核参与热路径。HQD（Hardware Queue Descriptor）和 MQD（Memory Queue Descriptor）是将软件队列映射到 GPU 硬件的关键数据结构。',
            explanation: [
              '在传统的图形渲染路径中，每次提交命令都要通过内核（ioctl → amdgpu_cs_ioctl → 验证 → 写入 Ring Buffer），这引入了系统调用开销。对于高吞吐量的 GPU 计算场景（如 AI 训练中每秒数千次 kernel launch），这个开销不可接受。KFD 的解决方案是用户态队列（User-Mode Queue）：队列的内存直接映射到用户空间，用户空间可以直接写入 AQL 包，然后写 doorbell 寄存器通知 GPU，整个过程不需要系统调用。',
              'AQL（Architected Queuing Language）是 HSA 标准定义的命令包格式。每个 AQL 包是固定的 64 字节，包含：类型（Kernel Dispatch、Barrier、Agent Dispatch）、维度信息（grid_size_x/y/z、workgroup_size_x/y/z）、内核代码入口地址（kernel_object）、内核参数地址（kernarg_address）、完成信号（completion_signal）。与 PM4 格式的关键区别是：AQL 是 HSA 标准化的，跨平台可移植；PM4 是 AMD GPU 硬件私有的，性能可能更高但不可移植。',
              'HQD（Hardware Queue Descriptor）是 GPU 硬件中固定数量的队列槽位，每个 HQD 对应一个硬件可以直接调度的队列。Navi33 的每个 Compute Engine 有多个 HQD，总数有限。MQD（Memory Queue Descriptor）是 KFD 在内存中创建的队列描述数据结构，包含队列的所有状态：基地址、大小、读写指针、doorbell offset 等。当队列被映射到 HQD 时，GPU 的 CP（Command Processor）从 MQD 中加载队列参数；当队列被抢占（preempt）时，CP 将当前状态保存回 MQD。这种 MQD-HQD 映射机制允许软件队列数量远超硬件 HQD 数量——通过队列调度器（HWS, Hardware Scheduler 或 SWS, Software Scheduler）动态映射。',
              '用户态队列提交的完整流程：（1）用户空间在队列内存中写入 AQL 包；（2）更新队列的 write_dispatch_id（写指针）；（3）写 doorbell 寄存器——这是一个内存映射的 MMIO 地址，一次 4 字节写入就能通知 GPU 的 CP 有新命令；（4）GPU 的 CP 检测到 doorbell 写入，从对应队列的 MQD 中获取读指针，读取 AQL 包；（5）CP 解析 AQL 包，启动计算着色器（dispatch）；（6）计算完成后，GPU 更新完成信号（completion_signal）。整个热路径——从写 AQL 包到 GPU 开始执行——只需要用户空间的内存写操作和一次 doorbell MMIO 写入，延迟在微秒级。',
            ],
            keyPoints: [
              '用户态队列允许直接写入 AQL 包 + doorbell MMIO，绕过内核热路径，延迟在微秒级',
              'AQL 包固定 64 字节，包含 dispatch 维度、kernel_object 地址、kernarg 地址和 completion_signal',
              'HQD 是 GPU 硬件队列槽位（数量有限），MQD 是内存中的队列描述符（可以很多）',
              'MQD ↔ HQD 动态映射由 HWS（Hardware Scheduler）或 KFD 软件调度器管理',
              'doorbell 是一个 4 字节 MMIO 写入，GPU CP 检测到后从对应队列读取新命令',
              '队列抢占：CP 将当前状态保存回 MQD，释放 HQD 给其他队列使用',
            ],
          },
          diagram: {
            title: 'AQL 用户态队列提交流程',
            content: `用户态 AQL 队列提交路径（零内核介入）

用户空间 (ROCm Runtime)
─────────────────────────────────────────────────────────
  1) 写入 AQL 包到队列内存
  ┌──────────────────────────────────────────────┐
  │  AQL Queue (mmap'd to userspace)             │
  │  ┌────────┬────────┬────────┬────────┐       │
  │  │AQL pkt │AQL pkt │AQL pkt │ (空)   │       │
  │  │dispatch│dispatch│barrier │        │       │
  │  │grid:   │grid:   │signal  │        │       │
  │  │256x1x1 │1024x1  │wait    │        │       │
  │  └────────┴────────┴────────┴────────┘       │
  │   read_ptr ──────────────▲  ▲── write_ptr    │
  └──────────────────────────┼──┼────────────────┘
                             │  │
  2) 更新 write_dispatch_id  │  │
  3) 写 doorbell 寄存器 ─────┼──┘
     *(uint32_t*)doorbell_mmap = new_wptr;
                             │
═══════════════ 无系统调用 ══╪════════════════════════
                             │
GPU 硬件                     │
─────────────────────────────┼───────────────────────
  4) Command Processor 检测 doorbell 写入
     ┌───────────────────────┐
     │    CP (MEC/HPD)       │
     │    检测 doorbell      │──→ 读取 MQD
     │    doorbell[queue_id] │      │
     └───────────────────────┘      ▼
                              ┌──────────┐
                              │   MQD    │
                              │ base_addr│
                              │ read_ptr │
                              │ write_ptr│
                              │ doorbell │
                              └────┬─────┘
                                   │
  5) 从队列内存读取 AQL 包         │
     ┌─────────────────────────────▼──┐
     │  AQL Packet (64 bytes)         │
     │  ┌───────────────────────────┐ │
     │  │ header:    DISPATCH       │ │
     │  │ dimensions: 3             │ │
     │  │ grid_size_x: 256         │ │
     │  │ workgroup_size_x: 64     │ │
     │  │ kernel_object: 0x7f...   │ │
     │  │ kernarg_address: 0x7f... │ │
     │  │ completion_signal: sig_1 │ │
     │  └───────────────────────────┘ │
     └────────────────┬───────────────┘
                      │
  6) 启动 Compute Shader
     Shader Engines 执行 kernel
     完成后更新 completion_signal`,
            caption: '用户态 AQL 队列的提交流程。整个热路径不涉及系统调用：用户空间直接在 mmap 的队列内存中写入 AQL 包，然后写 doorbell MMIO 通知 GPU。GPU 的 Command Processor（MEC）检测到 doorbell 后读取并执行命令。',
          },
          codeWalk: {
            title: 'kfd_ioctl_create_queue — 创建计算队列',
            file: 'drivers/gpu/drm/amd/amdkfd/kfd_chardev.c',
            language: 'c',
            code: `/* kfd_chardev.c — 创建 KFD 计算队列的 ioctl 处理函数 */

static int kfd_ioctl_create_queue(struct file *filep,
                struct kfd_process *p, void *data)
{
    struct kfd_ioctl_create_queue_args *args = data;
    struct kfd_dev *dev;
    struct kfd_process_device *pdd;
    struct queue_properties properties;
    int err;

    /* 查找目标 GPU 设备 */
    dev = kfd_device_by_id(args->gpu_id);
    if (!dev)
        return -EINVAL;

    /* 获取进程在该 GPU 上的 process_device */
    pdd = kfd_get_process_device_data(dev, p);
    if (!pdd)
        return -ENOMEM;

    /* 将用户空间参数转换为内核 queue_properties
     * 包括：队列类型、队列大小、优先级
     *       ring_base_address（队列内存基地址，用户态分配）
     *       write_ptr / read_ptr 地址
     *       doorbell_offset
     */
    memset(&properties, 0, sizeof(properties));
    properties.type = args->queue_type;
    properties.queue_address = args->ring_base_address;
    properties.queue_size = args->ring_size;
    properties.queue_percent = args->queue_percentage;
    properties.priority = args->queue_priority;

    /* 分配 doorbell 页面并设置偏移 */
    err = kfd_queue_acquire_buffers(pdd, &properties);
    if (err)
        return err;

    /* 核心：创建队列并映射到 GPU 硬件
     * 1. 分配 MQD（Memory Queue Descriptor）
     * 2. 初始化 MQD 中的队列参数
     * 3. 通过 HWS 或直接写 HQD 寄存器将队列激活
     */
    err = pqm_create_queue(&p->pqm, dev, filep, &properties,
                           &args->queue_id,
                           NULL, NULL, NULL, &args->doorbell_offset);
    if (err)
        goto err_create;

    /* 返回给用户空间：
     * args->queue_id     — 队列 ID（后续操作引用）
     * args->doorbell_offset — doorbell 在 mmap 区域中的偏移
     *   用户空间 mmap /dev/kfd 的 doorbell 页后
     *   对 (mmap_base + doorbell_offset) 做 32 位写入即可触发 GPU
     */
    return 0;

err_create:
    kfd_queue_release_buffers(pdd, &properties);
    return err;
}`,
            annotations: [
              'args->ring_base_address 是用户空间预先分配的队列环形缓冲区地址——AQL 包直接写入这里',
              'kfd_queue_acquire_buffers 分配 doorbell 页面——doorbell 是 GPU MMIO 空间的一小块区域',
              'pqm_create_queue 是核心调用链：分配 MQD → 初始化 → 映射到 HQD 或加入调度器',
              'args->doorbell_offset 返回给用户空间后，用户可以 mmap doorbell 页并直接写入触发 GPU',
              'queue_type 可以是 KFD_IOC_QUEUE_TYPE_COMPUTE（计算）或 KFD_IOC_QUEUE_TYPE_SDMA（DMA）',
              '队列创建后，用户空间对该队列的所有命令提交都不需要再经过内核（零 ioctl 热路径）',
            ],
            explanation: '这个函数是建立用户态 GPU 计算通道的关键步骤。用户空间通过此 ioctl 一次性设置好队列，之后的所有命令提交（写 AQL 包 + 写 doorbell）都直接在用户空间完成。pqm_create_queue 内部会调用 GPU 特定的 MQD 初始化函数（如 gfx_v11_0 的 MQD 初始化），设置 HQD 寄存器，最终使 GPU 的 MEC（Micro Engine Compute）开始轮询这个队列的 doorbell。',
          },
          miniLab: {
            title: '追踪 ROCm 队列创建的 ioctl 调用',
            objective: '使用 strace 观察 ROCm 运行时如何通过 /dev/kfd ioctl 创建计算队列和提交任务。',
            setup: `# 需要安装 ROCm 和一个简单的 HIP 程序
# 如果已安装 ROCm，可以使用 rocm-examples 中的 vectorAdd
sudo apt install rocm-hip-sdk  # 如果还没安装`,
            steps: [
              '编写或获取一个简单的 HIP 向量加法程序（vectorAdd）',
              '使用 strace 追踪 KFD ioctl：strace -e ioctl -f ./vectorAdd 2>&1 | grep kfd',
              '查找 AMDKFD_IOC_CREATE_QUEUE ioctl 调用，观察队列创建参数',
              '查找 AMDKFD_IOC_ALLOC_MEMORY_OF_GPU ioctl，观察 GPU 内存分配',
              '统计各类 KFD ioctl 的调用次数：strace -e ioctl -c -f ./vectorAdd 2>&1',
              '对比 DRM ioctl：strace -e ioctl -f glxgears 2>&1 | head -30（观察 DRM 路径的差异）',
            ],
            expectedOutput: `$ strace -e ioctl -f ./vectorAdd 2>&1 | grep -c CREATE_QUEUE
2        ← 创建了 2 个计算队列（一个 compute，一个 SDMA）

$ strace -e ioctl -f ./vectorAdd 2>&1 | grep ALLOC_MEMORY
ioctl(4, AMDKFD_IOC_ALLOC_MEMORY_OF_GPU, ...)   ← 分配 GPU 内存
ioctl(4, AMDKFD_IOC_ALLOC_MEMORY_OF_GPU, ...)   ← kernarg 内存

注意：命令提交（写 AQL + doorbell）不会出现在 strace 中，
因为它们直接通过 mmap 在用户空间完成，没有系统调用！`,
            hint: '如果没有安装 ROCm，可以使用 ftrace 从内核侧追踪 KFD 函数调用：echo kfd_ioctl_create_queue > /sys/kernel/debug/tracing/set_ftrace_filter。',
          },
          debugExercise: {
            title: '诊断队列创建失败',
            language: 'c',
            description: '一个 HIP 程序在 hipLaunchKernelGGL 时崩溃。strace 显示 AMDKFD_IOC_CREATE_QUEUE 返回 -ENOMEM。以下是可能的原因。',
            question: '队列创建返回 -ENOMEM 的可能原因是什么？如何诊断和解决？',
            buggyCode: `/* strace 输出 */
ioctl(4, AMDKFD_IOC_CREATE_QUEUE, {queue_type=COMPUTE,
    ring_size=0x400000,    /* 4MB 队列大小 */
    ring_base=0x0,         /* BUG! 用户空间没有预分配队列内存 */
    ...}) = -1 ENOMEM

/* 另一种情况：doorbell 资源耗尽 */
/* 进程创建了超过 1024 个队列后 */
ioctl(4, AMDKFD_IOC_CREATE_QUEUE, ...) = -1 ENOMEM

/* dmesg 日志 */
[  45.2] kfd: Failed to allocate MQD for queue
[  45.2] kfd: Can't create queue: doorbell allocation failed`,
            hint: '有两种常见原因：(1) 用户空间传入了无效的 ring_base_address；(2) GPU 的 doorbell 资源或 MQD 内存耗尽。',
            answer: '两种常见原因：（1）ring_base_address = 0x0：用户空间在调用 CREATE_QUEUE ioctl 之前必须先分配队列环形缓冲区内存（通常通过 AMDKFD_IOC_ALLOC_MEMORY_OF_GPU 分配）。ring_base 为 0 意味着 ROCm 运行时的内存分配步骤失败了，需要检查 GPU 内存是否充足（cat /sys/class/drm/card0/device/mem_info_vram_used）。（2）doorbell 资源耗尽：每个队列需要一个 doorbell slot，GPU 的 doorbell BAR 大小有限（通常 2MB），每个 slot 4 字节，最多约 512K 个 doorbell。但实际限制更小——KFD 为每个进程分配 doorbell 页面（4KB/页），每页可容纳 1024 个 32 位 doorbell。如果一个进程创建了过多队列，doorbell 页面会耗尽。解决方法：销毁不再使用的队列（DESTROY_QUEUE ioctl），或在应用设计中复用队列。生产环境中通常每个 GPU 只需要几个到几十个队列。',
          },
          interviewQ: {
            question: '解释 AQL 包和 PM4 包的区别。为什么 KFD 使用 AQL 而不是直接使用 PM4？用户态队列相比内核态命令提交有什么性能优势？',
            difficulty: 'hard',
            hint: '从标准化（HSA vs 硬件私有）、提交延迟（用户态 doorbell vs 内核 ioctl）、安全性（用户态队列隔离）三个方面回答。',
            answer: 'AQL vs PM4：（1）AQL 是 HSA 标准定义的格式（64 字节固定大小），跨平台可移植——同一个 AQL 包理论上可以在 AMD 和其他 HSA 兼容硬件上运行。PM4 是 AMD GPU 的私有命令格式，直接映射到 CP 微码指令，格式因 GPU 代次而异。（2）AQL 是面向计算的——包含 grid/workgroup 维度信息，适合 kernel dispatch。PM4 是面向图形/通用的——包含状态设置、draw call、DMA 操作等。（3）GPU 的 MEC（Micro Engine Compute）原生支持解析 AQL 包，不需要额外的命令转换。用户态队列的性能优势：传统 DRM 路径每次提交命令需要 ioctl 系统调用（~2μs 开销）+ 内核态命令验证 + 拷贝到 Ring Buffer。KFD 用户态队列只需要用户空间的内存写入 + 一次 doorbell MMIO 写入（~100ns），延迟降低一个数量级以上。对于 AI 训练中每秒数万次的小 kernel launch，这个差异直接影响 GPU 利用率。安全性：每个用户态队列有独立的 PASID 和 GPUVM 页表，GPU 硬件保证进程间内存隔离，即使用户空间直接操作队列也不会影响其他进程。',
            amdContext: 'AMD 面试中如果你能清楚解释 AQL 用户态队列的延迟优势和 PASID 隔离机制，说明你理解了 KFD 设计的核心动机——这比记住 API 参数有用得多。',
          },
        },
      ],
    },

    // ════════════════════════════════════════════════════════════
    // Group 7.2: GPU 内存与同步
    // ════════════════════════════════════════════════════════════
    {
      id: '7-2',
      number: '7.2',
      title: 'GPU 内存与同步',
      titleEn: 'GPU Memory & Synchronization',
      icon: 'Link',
      description: 'SVM 统一虚拟地址空间让 CPU 和 GPU 共享指针，GPU page fault 和页面迁移实现按需数据移动。HSA 信号量和 KFD 事件机制实现高效的 CPU-GPU 同步。',
      lessons: [
        // ── Lesson 7.2.1 ──────────────────────────────────────
        {
          id: '7-2-1',
          number: '7.2.1',
          title: 'SVM 统一虚拟地址空间',
          titleEn: 'SVM Unified Virtual Address Space',
          duration: 20,
          difficulty: 'advanced',
          tags: ['SVM', 'GPUVM', 'PASID', 'page-fault', 'page-migration', 'coherency'],
          concept: {
            summary: 'SVM（Shared Virtual Memory）让 CPU 和 GPU 共享同一个虚拟地址空间——CPU 上的指针可以直接在 GPU kernel 中使用，无需显式拷贝。KFD 通过 GPUVM 页表、PASID 进程隔离和 GPU page fault 处理实现这一机制，svm_migrate_to_vram/ram 函数负责页面在 CPU 和 GPU 内存之间的按需迁移。',
            explanation: [
              '传统 GPU 编程（CUDA 的早期模式）要求程序员显式管理数据传输：cudaMalloc 在 GPU 上分配内存，cudaMemcpy 在 CPU 和 GPU 之间拷贝数据。这不仅繁琐，还容易出错——忘记同步、重复拷贝、内存泄漏。SVM 的目标是消除这些手动步骤：在 CPU 上用 malloc 或 mmap 分配的内存，GPU 可以直接通过相同的虚拟地址访问；反之亦然。',
              'SVM 的实现依赖几个关键机制：（1）GPUVM 页表——每个进程在 GPU 上有独立的页表（类似 CPU 的 MMU 页表），将虚拟地址映射到物理页面（VRAM 或系统内存）。KFD 通过 amdgpu 的 VM 子系统管理这些页表。（2）PASID（Process Address Space ID）——每个进程分配一个唯一的 PASID，GPU 在发出内存访问时携带 PASID，IOMMU 和 GPUVM 用它来选择正确的页表。这实现了进程级的 GPU 内存隔离。（3）GPU page fault——当 GPU 访问的虚拟地址在 GPUVM 页表中没有有效映射时，GPU 生成 page fault 中断。KFD 的 fault handler 捕获这个中断，按需建立映射（可能触发页面迁移）。',
              '页面迁移是 SVM 的性能关键。当 GPU 频繁访问系统内存中的页面时，KFD 可以将页面迁移到 VRAM 以获得更高带宽。svm_migrate_to_vram() 执行 RAM → VRAM 迁移：（a）在 VRAM 中分配目标页面；（b）通过 SDMA 引擎复制数据；（c）更新 CPU 和 GPU 页表；（d）在 CPU 页表中安装一个 migration entry，如果 CPU 之后访问这个页面，触发 CPU page fault 把页面迁回 RAM。svm_migrate_to_ram() 是反方向的迁移。这种按需迁移机制类似于操作系统的 swap，但在 CPU 和 GPU 内存之间进行。',
              'CPU-GPU 内存一致性（coherency）是 SVM 最复杂的部分。RDNA3 的 Navi33 支持通过 PCIe 的 cache coherency 协议（如 CCIX 的前身或 CXL 相关机制），但在实践中，KFD 提供了不同级别的一致性保证：（a）Coarse-grained：GPU 在 kernel 执行期间看到一致的快照，但不保证实时一致性——适合大多数计算场景。（b）Fine-grained：CPU 和 GPU 对同一地址的读写遵循某种顺序保证——需要硬件级别的 cache snoop，性能开销更大。ROCm 用户可以通过 hsa_amd_memory_pool_allocate 的 flags 选择一致性级别。',
            ],
            keyPoints: [
              'SVM 让 CPU/GPU 共享虚拟地址空间——CPU 指针可在 GPU kernel 中直接使用，消除显式数据拷贝',
              'GPUVM 页表为每个进程维护独立的 GPU 地址映射，PASID 实现进程隔离',
              'GPU page fault 触发按需页面映射——类似 CPU 的 demand paging 机制',
              'svm_migrate_to_vram() 将热页面迁移到 VRAM 提升 GPU 访问带宽（SDMA 引擎执行实际拷贝）',
              'svm_migrate_to_ram() 在 CPU 需要访问已迁移页面时触发回迁',
              'KFD 通过 MMU notifier 监听进程页表变化，保持 GPUVM 页表与 CPU 页表同步',
            ],
          },
          diagram: {
            title: 'SVM 统一虚拟地址空间与页面迁移',
            content: `SVM 统一虚拟地址空间：CPU 和 GPU 共享指针

进程虚拟地址空间 (64-bit)
┌────────────────────────────────────────────────────────┐
│  0x0000'7f00'0000'0000   ← malloc 分配的缓冲区        │
│  0x0000'7f00'0001'0000   ← GPU kernel 的参数          │
│  0x0000'7f00'0002'0000   ← 计算结果                   │
│  ...                                                   │
│  CPU 和 GPU 使用相同的虚拟地址访问这些数据             │
└──────────┬────────────────────────────┬────────────────┘
           │                            │
     CPU MMU 页表                 GPUVM 页表
     (per-process)                (per-PASID)
           │                            │
           ▼                            ▼
┌──────────────────┐          ┌──────────────────┐
│  CPU 物理内存     │          │  GPU VRAM        │
│  (DDR5 RAM)      │          │  (GDDR6 8GB)     │
│                  │          │                  │
│  Page A [热数据] │ ──迁移──→│  Page A (副本)   │
│  (migration      │          │  高带宽 GPU 访问  │
│   entry 标记)    │          │                  │
│                  │          │                  │
│  Page B          │←──回迁── │  Page B          │
│  (CPU 访问触发)  │          │  (evicted)       │
└──────────────────┘          └──────────────────┘

页面迁移流程 (svm_migrate_to_vram):
──────────────────────────────────────
  1. GPU 频繁访问 Page A → 触发迁移决策
  2. VRAM 分配目标页面
  3. SDMA 引擎: memcpy(vram_page, ram_page)
  4. 更新 GPUVM 页表: VA → VRAM 物理地址
  5. 更新 CPU 页表: 安装 migration entry
     (CPU 再访问时触发 fault → svm_migrate_to_ram)

GPU Page Fault 处理:
──────────────────────────────────────
  GPU 访问虚拟地址 0x7f0000010000
       │
       ▼ (GPUVM 页表无映射)
  GPU 产生 page fault 中断
       │
       ▼
  KFD fault handler (kfd_svm_page_fault)
       │
       ├─ 地址属于已注册 SVM range？
       │   是 → 建立 GPUVM 映射（可能触发迁移）
       │   否 → 报告 GPU fault 错误
       │
       ▼
  恢复 GPU 执行`,
            caption: 'SVM 让 CPU 和 GPU 通过相同的虚拟地址访问数据。页面可以在系统内存和 VRAM 之间按需迁移——GPU 热数据自动迁入 VRAM 以获得高带宽，CPU 访问时自动迁回。这对应用程序透明，由 KFD 和硬件 page fault 机制自动管理。',
          },
          codeWalk: {
            title: 'svm_range_add — 注册 SVM 虚拟地址范围',
            file: 'drivers/gpu/drm/amd/amdkfd/kfd_svm.c',
            language: 'c',
            code: `/* kfd_svm.c — SVM 范围管理核心函数 */

/* svm_range 表示一段受 SVM 管理的虚拟地址区间 */
struct svm_range {
    struct interval_tree_node it_node; /* 区间树节点，按 VA 索引 */
    struct list_head list;             /* 进程的 SVM range 链表 */
    uint64_t start;                    /* 起始页面编号 (VA >> PAGE_SHIFT) */
    uint64_t last;                     /* 结束页面编号 */
    uint64_t npages;                   /* 页面数量 */
    uint32_t flags;                    /* 访问标志 */
    uint32_t preferred_loc;            /* 首选位置：CPU 或 GPU_ID */
    uint32_t actual_loc;               /* 当前实际位置 */
    uint32_t granularity;              /* 迁移粒度 */
    struct list_head deferred_list;    /* 延迟更新列表 */
    struct mutex migrate_mutex;        /* 迁移操作互斥锁 */
    atomic_t queue_refcount;           /* 引用此 range 的队列数 */
    /* ... 更多字段 */
};

/* 注册一段虚拟地址为 SVM 管理区域 */
int svm_range_add(struct kfd_process *p,
                  uint64_t start, uint64_t size,
                  uint32_t nattr,
                  struct kfd_ioctl_svm_attribute *attrs)
{
    struct svm_range_list *svms = &p->svms;
    struct svm_range *prange;
    uint64_t last = start + size - 1;
    int r;

    /* 锁定 SVM range 列表 */
    mutex_lock(&svms->lock);

    /* 检查是否与已有 SVM range 重叠
     * 使用 interval_tree 高效查找重叠区间
     */
    prange = svm_range_find(svms, start, last);
    if (prange) {
        /* 已有 range 覆盖此区域：更新属性 */
        r = svm_range_split_adjust(svms, prange,
                                   start, last, nattr, attrs);
        goto out;
    }

    /* 分配新的 svm_range 结构体 */
    prange = svm_range_new(svms, start, size, true);
    if (!prange) {
        r = -ENOMEM;
        goto out;
    }

    /* 设置 SVM 属性（preferred_loc, flags 等）
     * preferred_loc 决定页面首选存放位置：
     *   KFD_IOCTL_SVM_LOCATION_SYSMEM — 系统内存
     *   KFD_IOCTL_SVM_LOCATION_VRAM   — GPU 显存
     */
    svm_range_set_attr(p, start, size, nattr, attrs);

    /* 将新 range 加入区间树和链表 */
    svm_range_add_to_svms(prange);
    svm_range_add_notifier_locked(svms, prange);

    r = 0;
out:
    mutex_unlock(&svms->lock);
    return r;
}`,
            annotations: [
              'svm_range 是 SVM 的核心数据结构，每个实例代表一段受管理的虚拟地址区间',
              'interval_tree 允许高效查找与给定地址范围重叠的 SVM range（O(log n) 复杂度）',
              'preferred_loc 指示页面应优先放在 CPU 还是 GPU 内存——影响迁移策略',
              'actual_loc 记录页面当前实际位置，与 preferred_loc 不同时可能触发迁移',
              'migrate_mutex 保护迁移操作——同一时间只允许一个迁移操作进行',
              'svm_range_add_notifier_locked 注册 MMU notifier，当 CPU 页表变化时通知 KFD 更新 GPUVM',
            ],
            explanation: 'svm_range_add 是 ROCm 运行时向 KFD 注册 SVM 管理区域的入口。当用户空间调用 hsaKmtSetMemoryPolicy 或 hipMallocManaged 时，最终会通过 ioctl 调用此函数。它在 KFD 中创建一个 svm_range 结构体来跟踪这段虚拟地址，后续当 GPU 访问此范围内的地址时，KFD 的 page fault handler 可以查找到对应的 svm_range 并按需建立映射或触发迁移。这是 SVM "按需分配、按需迁移" 机制的起点。',
          },
          miniLab: {
            title: '观察 SVM 页面迁移和 GPU page fault',
            objective: '通过 ftrace 和 sysfs 观察 KFD 的 SVM 页面迁移行为，理解按需迁移的工作方式。',
            setup: `# 需要 root 权限来使用 ftrace
# 需要安装 ROCm 和一个使用 managed memory 的 HIP 程序
sudo su`,
            steps: [
              '启用 KFD SVM 相关的 ftrace 跟踪点：echo 1 > /sys/kernel/debug/tracing/events/amdgpu/svm_migrate_start/enable',
              '同时启用 GPU fault 事件：echo 1 > /sys/kernel/debug/tracing/events/amdgpu/amdgpu_vm_bo_cs/enable',
              '运行一个使用 hipMallocManaged 的 HIP 程序',
              '查看 ftrace 日志：cat /sys/kernel/debug/tracing/trace | grep svm',
              '观察迁移统计：cat /sys/class/drm/card0/device/kfd/proc/*/svm_stats（如果可用）',
              '清理 ftrace：echo 0 > /sys/kernel/debug/tracing/events/amdgpu/svm_migrate_start/enable',
            ],
            expectedOutput: `$ cat /sys/kernel/debug/tracing/trace | grep svm
vectorAdd-12345 [003]  svm_migrate_start: pid=12345
  src=RAM dst=VRAM start=0x7f0000010000 npages=64
vectorAdd-12345 [003]  svm_migrate_end: pid=12345
  src=RAM dst=VRAM migrated=64 failed=0

说明：64 个页面（256KB）从 RAM 迁移到 VRAM
这发生在 GPU kernel 首次访问 managed memory 时`,
            hint: '如果 ftrace 事件点不存在，可能是内核版本较旧。可以改用 dmesg 观察：echo 0x40 > /sys/module/amdgpu/parameters/debug_mask 启用 KFD 调试日志。',
          },
          debugExercise: {
            title: '诊断 GPU page fault 导致的 kernel 崩溃',
            language: 'c',
            description: '一个 HIP 程序在 GPU kernel 执行时崩溃，dmesg 显示 GPU VM fault。分析错误信息并确定根本原因。',
            question: 'GPU VM fault 的根本原因是什么？如何在 HIP 代码中避免这类问题？',
            buggyCode: `/* dmesg 输出 */
[  89.3] amdgpu 0000:03:00.0: [gfxhub0]
  GPU fault detected: src_id:0, ring:0, vmid:3, pasid:32769
[  89.3] amdgpu 0000:03:00.0:
  VM_L2_PROTECTION_FAULT_STATUS: 0x00301050
[  89.3] amdgpu 0000:03:00.0:
  addr: 0x00007f0000DEAD00  ← 被访问的虚拟地址
  status: read, protection fault
  client: TCP (Texture Cache Per Pipe)
[  89.3] kfd: Process 12345 GPU fault on gpu 1002:7480

/* 对应的有问题的 HIP 代码 */
__global__ void kernel(int *data, int n) {
    int idx = blockIdx.x * blockDim.x + threadIdx.x;
    /* BUG: 没有检查 idx < n 就访问 data[idx] */
    data[idx] = data[idx] * 2;  /* 越界访问! */
}

int main() {
    int *d_data;
    int n = 1024;
    hipMalloc(&d_data, n * sizeof(int));
    /* 启动了过多的线程：2048 > 1024 */
    kernel<<<4, 512>>>(d_data, n);
    hipDeviceSynchronize();
}`,
            hint: '注意 addr 中的 0xDEAD00 模式，以及线程数量（4 * 512 = 2048）和数据大小（1024 个 int）的不匹配。',
            answer: '根本原因：GPU kernel 越界内存访问。程序分配了 1024 个 int（4KB），但启动了 4 * 512 = 2048 个线程，线程 1024-2047 访问 data[1024]-data[2047]，超出了分配的内存范围。GPU 的 GPUVM 在这些越界地址上没有有效映射，导致 VM_L2_PROTECTION_FAULT。dmesg 中的关键信息：（1）pasid:32769 标识了出错进程；（2）addr: 0x7f0000DEAD00 是越界访问的虚拟地址（0xDEAD 模式表明这可能是未初始化或已释放的内存区域）；（3）client: TCP 表示是 Texture Cache 发起的读操作（计算 shader 的内存读取也通过 TCP）；（4）protection fault 表示页表中没有此地址的映射。修复方法：在 kernel 中添加边界检查 if (idx < n)，或者调整 grid 大小匹配数据量：kernel<<<(n+255)/256, 256>>>(d_data, n)。这是 GPU 编程中最常见的 bug 类型之一。',
          },
          interviewQ: {
            question: '解释 KFD 的 SVM（Shared Virtual Memory）是如何实现的。包括 GPUVM 页表、PASID、GPU page fault 和页面迁移的工作机制。',
            difficulty: 'hard',
            hint: '从数据结构（svm_range）→ 硬件机制（GPUVM、PASID、page fault）→ 迁移流程（svm_migrate_to_vram/ram）→ 一致性保证（MMU notifier）的顺序回答。',
            answer: 'KFD SVM 实现：（1）数据结构：每段受 SVM 管理的虚拟地址区间用 svm_range 表示，存储在 interval tree 中以高效查找。svm_range 记录了地址范围、首选位置（CPU/GPU）、实际位置和迁移状态。（2）GPUVM 页表：每个进程的 GPU 有独立的页表（类似 CPU 的 4 级页表），将虚拟地址映射到 VRAM 或系统内存的物理地址。PASID 是进程的地址空间标识，GPU 访问内存时携带 PASID，硬件用它选择正确的页表。（3）GPU page fault：当 GPU 访问未映射的虚拟地址时，GPU 产生 page fault 中断。KFD 的 kfd_svm_page_fault handler 查找对应的 svm_range，如果页面在系统内存且需要迁移到 VRAM，触发 svm_migrate_to_vram()：在 VRAM 分配页面 → SDMA 复制数据 → 更新 GPU 页表 → 在 CPU 页表安装 migration entry。（4）反向迁移：CPU 访问已迁移到 VRAM 的页面时，CPU page fault handler 触发 svm_migrate_to_ram() 将页面迁回。（5）一致性：KFD 注册 MMU notifier，当 CPU 侧页表变化（如 munmap、mremap）时，KFD 同步更新或 invalidate 对应的 GPUVM 映射，保证 CPU 和 GPU 看到一致的地址空间。整个机制对用户空间透明——hipMallocManaged 分配的内存自动在需要时迁移到正确的位置。',
            amdContext: '这是 AMD ROCm 面试中的高级问题。展示你理解 SVM 不只是"共享地址"那么简单，背后是 GPUVM 页表、PASID 硬件支持、page fault 处理和双向迁移的复杂系统。提到 MMU notifier 是加分项——它体现了你理解 CPU 和 GPU 页表同步的关键机制。',
          },
        },

        // ── Lesson 7.2.2 ──────────────────────────────────────
        {
          id: '7-2-2',
          number: '7.2.2',
          title: '信号量与事件：CPU-GPU 同步',
          titleEn: 'Signals & Events: CPU-GPU Synchronization',
          duration: 18,
          difficulty: 'advanced',
          tags: ['HSA-signal', 'KFD-event', 'doorbell', 'interrupt', 'polling', 'synchronization'],
          concept: {
            summary: 'CPU-GPU 同步是异构计算中的核心挑战。KFD 提供两种机制：HSA 信号量（64 位原子计数器，支持 GPU 直接更新）和 KFD 事件（中断驱动的唤醒机制）。信号量用于 GPU-GPU 和 CPU-GPU 之间的细粒度同步，事件用于 CPU 等待 GPU 完成的高效阻塞。',
            explanation: [
              'HSA 信号量（HSA Signal）是一个 64 位原子值，存储在 CPU 和 GPU 都能访问的内存位置。GPU 可以通过原子操作更新信号量的值（例如完成一个 kernel 后将其递减为 0），CPU 可以轮询或等待信号量达到特定值。信号量的本质是一个共享的原子计数器，但它的特殊之处在于：它关联了一个 KFD 事件，当信号量的值满足条件时，可以触发中断来唤醒等待的 CPU 线程，而不是浪费 CPU 周期轮询。',
              '在 AQL 包中，每个 kernel dispatch 包含一个 completion_signal 字段。当 GPU 完成此 dispatch 后，它会对 completion_signal 指向的 64 位值执行原子递减操作。如果递减后的值等于 0，GPU 还会向 CPU 发送一个中断（通过写入 IH Ring）。KFD 的中断处理程序收到中断后，查找对应的 KFD 事件，唤醒等待在该事件上的 CPU 线程。这就是 hipDeviceSynchronize() 或 hipStreamSynchronize() 的底层实现。',
              'KFD 事件（KFD Event）是内核侧的同步原语。用户空间通过 AMDKFD_IOC_CREATE_EVENT ioctl 创建事件，通过 AMDKFD_IOC_WAIT_EVENTS 等待事件触发。事件有多种类型：SIGNAL 事件（与 HSA 信号量关联，GPU 完成操作后触发）、HW_EXCEPTION（GPU 硬件异常，如 page fault）、DEBUG（调试事件）。kfd_wait_on_event 函数实现了等待逻辑：将当前线程加入等待队列，设置超时，当事件被触发时唤醒线程。',
              '同步模式有两种选择：轮询（polling）和中断（interrupt）。轮询模式下，CPU 持续读取信号量的值直到满足条件——延迟最低（~100ns 级别），但浪费 CPU 周期。中断模式下，CPU 线程休眠，GPU 完成后通过中断唤醒——不浪费 CPU，但中断处理有额外延迟（~1-10μs）。ROCm 运行时通常采用混合策略：先轮询一小段时间（~1000 次循环），如果信号量仍未就绪，切换到中断等待。这在短 kernel（微秒级完成）时获得轮询的低延迟，在长 kernel（毫秒级以上）时避免浪费 CPU。',
              'Doorbell 在同步机制中也扮演重要角色。除了用于通知 GPU 有新的 AQL 包（队列 doorbell），doorbell 还用于 HSA 信号量的快速路径——用户空间可以通过写 doorbell 来触发 GPU 检查信号量值。这种 doorbell-based signaling 机制让信号量操作的延迟降到最低。KFD 为每个进程分配 doorbell 页面，用户空间通过 mmap /dev/kfd 获得 doorbell 的虚拟地址。',
            ],
            keyPoints: [
              'HSA Signal 是 64 位原子计数器，GPU 通过原子操作更新，CPU 轮询或中断等待',
              'AQL 包的 completion_signal 字段——GPU 完成 dispatch 后递减，值为 0 时触发中断',
              'KFD Event 是内核同步原语——SIGNAL、HW_EXCEPTION、DEBUG 等类型',
              'kfd_wait_on_event 实现阻塞等待：线程休眠 → GPU 中断 → kfd_signal_event_handler 唤醒',
              '混合同步策略：先轮询（低延迟）→ 超时后切换到中断等待（节省 CPU）',
              'doorbell 用于队列通知和信号量快速路径——单次 4 字节 MMIO 写入',
            ],
          },
          diagram: {
            title: 'CPU-GPU 同步：信号量与事件机制',
            content: `CPU-GPU 同步的三条路径

路径 1: 轮询模式 (最低延迟, 消耗 CPU)
══════════════════════════════════════════════
  CPU                                GPU
  ────                               ────
  dispatch kernel (write AQL + doorbell)
                                     ──→ 执行 kernel
  while (*signal != 0)               ...
    pause();         ← CPU 忙等       ...
                                     完成
                                     atomic_dec(signal)
  *signal == 0  ✓                    ──→ signal = 0
  延迟: ~100ns (最快)

路径 2: 中断模式 (节省 CPU, 有延迟)
══════════════════════════════════════════════
  CPU                                GPU
  ────                               ────
  dispatch kernel
  kfd_wait_on_event()                ──→ 执行 kernel
    │                                ...
    ▼                                ...
  thread_sleep()    ← CPU 休眠       ...
    zzz...                           完成
                                     atomic_dec(signal)
                                     if signal == 0:
  ┌────────────────────────────────    write IH Ring ←─┐
  │                                   (中断)           │
  ▼                                                    │
  IH Ring 处理                                         │
  kfd_signal_event_handler()                           │
    │                                                  │
    ├─ 查找事件: event_id → kfd_event                  │
    ├─ 设置 event->signaled = true                     │
    └─ wake_up(&event->wq)  ← 唤醒等待线程            │
                                                       │
  thread 被唤醒 ✓                                      │
  延迟: ~1-10μs                                        │
                                                       │
路径 3: 混合模式 (ROCm 默认)                           │
══════════════════════════════════════════════          │
  CPU                                                  │
  ────                                                 │
  for (i = 0; i < 1000; i++)    ← 先轮询              │
    if (*signal == 0) goto done;                       │
  kfd_wait_on_event()           ← 然后中断等待         │
                                                       │
                                                       │
IH Ring (Interrupt Handler Ring):                      │
┌────────────────────────────────────────┐             │
│  GPU 产生的中断事件环形缓冲区          │             │
│  ┌──────┬──────┬──────┬──────┐         │             │
│  │ src  │ src  │ src  │      │         │             │
│  │ =146 │ =146 │ =0   │      │         │             │
│  │signal│signal│fault │      │         │             │
│  │event1│event2│      │      │  ←──────┘
│  └──────┴──────┴──────┴──────┘
│  kfd_interrupt_isr() 逐个处理
└────────────────────────────────────────┘`,
            caption: 'CPU-GPU 同步的三种模式。轮询延迟最低但浪费 CPU；中断等待节省 CPU 但有中断处理延迟；混合模式结合两者优点——ROCm 默认使用。GPU 通过 IH Ring（中断处理环形缓冲区）通知 CPU 信号量变化。',
          },
          codeWalk: {
            title: 'kfd_signal_event_handler — GPU 中断触发事件唤醒',
            file: 'drivers/gpu/drm/amd/amdkfd/kfd_events.c',
            language: 'c',
            code: `/* kfd_events.c — KFD 事件信号处理 */

/* 当 GPU 完成操作并产生中断时调用此函数
 * 由 IH Ring 处理程序 (kfd_interrupt_isr) 分发
 *
 * data: 中断源信息 (signal event ID)
 */
void kfd_signal_event_handler(unsigned int client_id,
                              uint32_t event_id,
                              void *data)
{
    struct kfd_process *p;
    struct kfd_event *ev;

    /* 通过 client_id (PASID) 查找对应的进程 */
    p = kfd_lookup_process_by_pasid(client_id);
    if (!p)
        return;

    rcu_read_lock();

    /* 在进程的事件表中查找事件
     * 事件表是 IDR (ID Radix tree)，O(1) 查找
     */
    ev = idr_find(&p->event_idr, event_id);
    if (!ev) {
        rcu_read_unlock();
        kfd_unref_process(p);
        return;
    }

    spin_lock(&ev->lock);

    /* 标记事件为已触发 */
    ev->signaled = true;
    ev->event_age++;

    /* 唤醒所有等待在此事件上的线程
     * kfd_wait_on_event() 中的 wait_event_interruptible_timeout
     * 会检查 ev->signaled 并返回
     */
    wake_up_all(&ev->wq);

    spin_unlock(&ev->lock);
    rcu_read_unlock();
    kfd_unref_process(p);
}

/* CPU 侧等待事件的核心函数 */
static int kfd_wait_on_event(struct kfd_process *p,
                             struct kfd_event *ev,
                             uint64_t timeout_ms)
{
    long timeout_jiffies;
    int ret;

    timeout_jiffies = msecs_to_jiffies(timeout_ms);

    /* 等待直到事件被触发或超时
     * wait_event_interruptible_timeout 内部：
     *   1. 将当前线程加入 ev->wq 等待队列
     *   2. 设置线程状态为 TASK_INTERRUPTIBLE
     *   3. 调用 schedule() 让出 CPU
     *   4. 被 wake_up_all 唤醒后检查条件
     */
    ret = wait_event_interruptible_timeout(
        ev->wq,
        ev->signaled,    /* 唤醒条件：事件已触发 */
        timeout_jiffies);

    if (ret == 0)
        return -ETIME;   /* 超时 */
    if (ret < 0)
        return ret;       /* 被信号打断 */

    /* 重置事件状态（one-shot 语义）*/
    spin_lock(&ev->lock);
    ev->signaled = false;
    spin_unlock(&ev->lock);

    return 0;
}`,
            annotations: [
              'kfd_signal_event_handler 由 IH Ring 处理程序分发调用——当 GPU 写入 IH Ring 表示操作完成时',
              'client_id 是 PASID——GPU 在中断数据中携带 PASID 来标识是哪个进程的事件',
              'idr_find 是 O(1) 的 ID 查找，事件表用 IDR（ID Radix tree）实现以支持快速查找',
              'wake_up_all 唤醒所有等待线程——多个 CPU 线程可以等待同一个事件',
              'wait_event_interruptible_timeout 是内核标准的条件等待原语——线程休眠直到条件满足',
              'one-shot 语义：事件触发后重置 signaled=false，下次等待需要新的 GPU 完成信号',
            ],
            explanation: 'GPU 完成 kernel 执行后的中断处理链：GPU 将中断信息写入 IH Ring → amdgpu 的 IH Ring 处理程序读取中断 → 识别出是 KFD 信号事件 → 调用 kfd_signal_event_handler → 查找进程和事件 → 唤醒等待线程。kfd_wait_on_event 对应用户空间的 hsaKmtWaitOnEvent 或 hipDeviceSynchronize 的底层实现。理解这个中断-唤醒路径是理解 CPU-GPU 同步延迟的关键。',
          },
          miniLab: {
            title: '测量 CPU-GPU 同步延迟',
            objective: '编写一个简单的 HIP 程序测量从 GPU kernel 完成到 CPU 被唤醒的延迟，对比轮询和中断模式。',
            setup: `# 需要 ROCm 和 HIP 编译器
# 如果没有 ROCm，可以通过 ftrace 观察 kfd_signal_event_handler`,
            steps: [
              '编写 HIP 程序：启动一个空 kernel，然后用 hipEventElapsedTime 测量同步延迟',
              '运行 100 次取平均：记录 hipDeviceSynchronize 的耗时',
              '使用 ftrace 追踪 kfd_signal_event_handler：echo kfd_signal_event_handler > /sys/kernel/debug/tracing/set_ftrace_filter',
              '启用函数跟踪：echo function > /sys/kernel/debug/tracing/current_tracer',
              '运行 HIP 程序后查看 trace：cat /sys/kernel/debug/tracing/trace | grep kfd_signal',
              '观察中断到唤醒的时间差（timestamp 列）',
            ],
            expectedOutput: `# HIP 同步延迟测量
hipDeviceSynchronize average latency: ~5-15 μs (中断模式)

# ftrace 输出
$ cat /sys/kernel/debug/tracing/trace | grep kfd_signal
 amdgpu-12345  [002] 89.123456: kfd_signal_event_handler
               ← 从中断发生到 handler 执行 ~2-5μs

对比 hipStreamQuery (轮询模式):
average latency: ~1-3 μs (更低延迟但消耗 CPU)`,
            hint: '如果无法安装 ROCm，可以通过阅读 kfd_events.c 源码中 wait_event_interruptible_timeout 的用法来理解同步机制。关注 ev->signaled 的设置和检查时机。',
          },
          debugExercise: {
            title: '诊断 CPU-GPU 同步死锁',
            language: 'c',
            description: '一个多流 HIP 程序挂起——hipDeviceSynchronize 永远不返回。分析以下场景找出原因。',
            question: '为什么 hipDeviceSynchronize 永远不返回？这是死锁吗？如何修复？',
            buggyCode: `/* 有问题的多流 HIP 程序 */
hipStream_t stream1, stream2;
hipStreamCreate(&stream1);
hipStreamCreate(&stream2);

/* 在 stream1 上启动 kernel A */
kernelA<<<grid, block, 0, stream1>>>(data);

/* 在 CPU 上等待 stream1 完成（阻塞!） */
hipStreamSynchronize(stream1);

/* BUG: kernelA 内部在等待 stream2 上的 kernelB 完成
 * 但 kernelB 还没有被启动！
 */

/* 这行代码永远不会执行到 */
kernelB<<<grid, block, 0, stream2>>>(data);
hipStreamSynchronize(stream2);

/* ----- dmesg 输出 ----- */
/* [120.5] [drm:amdgpu_job_timedout] *ERROR*
 *   ring comp_1.0.0 timeout,
 *   signaled seq=100, emitted seq=101
 * [120.5] amdgpu: GPU reset begin!
 */`,
            hint: 'kernelA 在等待一个永远不会触发的信号——因为产生该信号的 kernelB 被阻塞在 CPU 侧（CPU 在 hipStreamSynchronize 中等待 kernelA）。',
            answer: '这是一个经典的 CPU-GPU 死锁场景：（1）CPU 在 hipStreamSynchronize(stream1) 中等待 kernelA 完成；（2）kernelA 在 GPU 上执行时，内部通过 HSA 信号量等待 stream2 上的 kernelB 完成；（3）但 kernelB 的启动代码在 CPU 上，位于 hipStreamSynchronize 之后——CPU 被阻塞导致 kernelB 永远不会被提交到 GPU。形成环形等待：CPU 等 kernelA → kernelA 等 kernelB → kernelB 需要 CPU 提交。最终 GPU 的 amdgpu_job_timedout 检测到超时，触发 GPU reset。修复方法：（a）先提交所有 kernel 到各自的 stream，然后再同步：kernelA<<<...stream1>>>; kernelB<<<...stream2>>>; hipStreamSynchronize(stream1); hipStreamSynchronize(stream2);（b）使用 hipStreamWaitEvent 实现 GPU 侧的 stream 间依赖，而不是 CPU 侧的同步；（c）避免在 GPU kernel 内部等待其他 stream 的信号——这种模式容易导致死锁。',
          },
          interviewQ: {
            question: '描述 KFD 中 CPU-GPU 同步的完整路径：从 GPU 完成一个 kernel 到 CPU 线程被唤醒。包括 HSA 信号量、IH Ring、KFD 事件机制和唤醒过程。',
            difficulty: 'hard',
            hint: '按照事件链：GPU 原子写 signal → GPU 写 IH Ring → CPU 中断 → IH handler → kfd_signal_event_handler → wake_up_all → 用户线程返回。',
            answer: '完整同步路径：（1）GPU 的 Shader Engine 执行完 kernel 的最后一个 workgroup；（2）GPU 的 CP 对 AQL 包中的 completion_signal 地址执行 atomic_dec 操作（64 位原子递减），将信号量从 1 递减为 0；（3）如果递减后的值为 0 且该信号量关联了中断事件，GPU 向 IH Ring（Interrupt Handler Ring）写入一条中断条目，包含 source_id（146 = signal completion）、PASID（进程标识）和 event_id；（4）amdgpu 的 IH Ring 处理程序（amdgpu_irq_handler）在 IRQ 上下文中读取 IH Ring，识别出这是 KFD 信号事件，调用 kfd_interrupt_isr 将事件加入 KFD 的中断工作队列；（5）KFD 的中断工作线程调用 kfd_signal_event_handler，通过 PASID 找到进程的 kfd_process，通过 event_id 在 IDR 中找到 kfd_event；（6）设置 ev->signaled = true，调用 wake_up_all(&ev->wq) 唤醒等待队列上的所有线程；（7）用户线程从 wait_event_interruptible_timeout 返回，kfd_wait_on_event 返回 0 表示成功；（8）用户空间的 hipDeviceSynchronize 返回。整个路径延迟约 5-15μs，主要开销在中断处理和线程调度。对比轮询模式：CPU 直接读取信号量内存位置，延迟 ~100ns-1μs，但占用 CPU 核心。ROCm 默认使用混合策略——先短暂轮询，然后切换到中断等待。',
            amdContext: '能详细描述这条中断-唤醒路径说明你深入理解了 KFD 的实现细节。AMD 面试中提到 IH Ring、PASID 查找和 wake_up_all 这些具体机制会展示你不仅理解概念，还阅读过实际代码。额外加分项：提到 ROCm 的混合轮询/中断策略体现了工程实践意识。',
          },
        },
      ],
    },
  ],
  completionChecklist: [
    '理解 HSA 架构的核心理念——CPU/GPU 作为平等的计算代理共享虚拟地址空间',
    '能解释 KFD 与 DRM 接口的区别（命令格式、队列模型、内存模型）',
    '理解 AQL 包的 64 字节结构和用户态队列的零内核提交路径',
    '能描述 MQD/HQD 映射机制和 doorbell 驱动的队列通知',
    '理解 SVM 的实现：GPUVM 页表、PASID、GPU page fault、页面迁移',
    '能解释 svm_range 数据结构和 svm_migrate_to_vram/ram 的迁移流程',
    '理解 HSA 信号量（64 位原子计数器）和 KFD 事件（中断驱动唤醒）的工作机制',
    '能描述从 GPU kernel 完成到 CPU 线程唤醒的完整中断路径',
  ],
};
