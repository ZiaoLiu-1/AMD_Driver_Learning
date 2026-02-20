// ============================================================
// AMD Linux Driver Learning Platform - Module 5 Micro-Lessons
// Module 5: AMDGPU Deep Dive (AMDGPU 深度解析)
// 9 lessons in 4 groups, ~15-20 min each, total ~160 min
// ============================================================
import type { MicroLessonModule } from './micro_lesson_types';

export const module5MicroLessons: MicroLessonModule = {
  moduleId: 'amdgpu',
  groups: [
    // ════════════════════════════════════════════════════════════
    // Group 5.1: Code Navigation & Architecture
    // ════════════════════════════════════════════════════════════
    {
      id: '5-1',
      number: '5.1',
      title: '代码导航与架构',
      titleEn: 'Code Navigation & Architecture',
      icon: '🗺️',
      description: '学会在超过 400 万行的 amdgpu 驱动代码中高效导航，理解 IP Block 模块化架构——这是阅读和贡献 amdgpu 代码的基础。',
      lessons: [
        // ── Lesson 5.1.1 ──────────────────────────────────────
        {
          id: '5-1-1',
          number: '5.1.1',
          title: 'AMDGPU 代码导航指南',
          titleEn: 'Navigating the AMDGPU Source Tree',
          duration: 20,
          difficulty: 'expert',
          tags: ['amdgpu', 'source-tree', 'cscope', 'ctags', 'code-navigation'],
          concept: {
            summary: 'amdgpu 驱动位于 drivers/gpu/drm/amd/ 下，包含 3500+ 个源文件和 400 万+ 行代码。掌握目录结构、命名规范和代码导航工具（cscope/ctags/clangd）是高效阅读源码的前提——否则你会在代码海洋中迷失。',
            explanation: [
              'drivers/gpu/drm/amd/ 是 amdgpu 驱动的顶层目录，下面按功能划分了多个子目录。最核心的是 amdgpu/（GPU 设备管理、命令提交、内存管理等）、display/dc/（Display Core 显示引擎，约占整个驱动代码量的 40%）、amdkfd/（KFD，Kernel Fusion Driver，ROCm 计算的内核接口）和 pm/（电源管理，包含 SMU 和 powerplay）。理解每个目录的职责是导航的第一步。',
              'amdgpu 驱动有严格的文件命名规范。以 IP Block 版本为后缀的文件（如 gfx_v11_0.c、sdma_v6_0.c、vcn_v4_0.c）是硬件代世代的具体实现——v11_0 对应 RDNA3 的 GFX 引擎，v6_0 对应 RDNA3 的 SDMA 引擎。以 amdgpu_ 为前缀的文件（如 amdgpu_device.c、amdgpu_cs.c、amdgpu_vm.c）是跨代通用的逻辑。这个规范让你可以快速判断一个文件是通用代码还是特定硬件的实现。',
              'amdgpu_device.c 是整个驱动的核心枢纽——它包含 amdgpu_device_init()（设备初始化入口）、amdgpu_device_ip_init()（IP Block 初始化循环）和 GPU 复位逻辑。amdgpu_drv.c 是 PCI 驱动入口，包含 module_init、pciidlist 和 probe 函数。理解这两个文件的调用关系是理解整个驱动启动流程的基础。',
              '对于代码导航，cscope 和 ctags 是内核开发的经典工具。在内核源码根目录运行 make cscope tags 即可生成索引数据库。cscope 的核心能力是"查找所有调用某函数的位置"（:cs find c function_name）和"查找函数定义"（:cs find g function_name），这在追踪调用链时极其高效。对于现代 IDE 用户，clangd 配合 compile_commands.json 能提供更好的体验——运行 scripts/clang-tools/gen_compile_commands.py 生成数据库后，VS Code 的 clangd 扩展可以提供精确的跳转和补全。',
              'CRITICAL SAFETY WARNING: Writing to incorrect MMIO register offsets will instantly hard-lock your entire system — no Ctrl+C, no SSH, only a power cycle recovers. This is not a software crash that the kernel can catch; it\'s a hardware-level hang caused by the GPU entering an unrecoverable state. In AMD\'s offices, engineers are told on day one: never touch MMIO registers without the hardware specification (which AMD provides under NDA). When learning, always use umr (read-only by default) to inspect registers, and test any register writes in a VM or spare machine. The amdgpu driver\'s WREG32/RREG32 macros are safe because they write to registers that AMD engineers have validated, but adding new register accesses requires hardware spec verification.',
            ],
            keyPoints: [
              'amdgpu/ — GPU 核心：设备管理、命令提交（CS）、虚拟内存（VM）、Buffer 对象（BO）',
              'display/dc/ — 显示引擎：约 40% 代码量，硬件无关层 + DCN 硬件层',
              'amdkfd/ — 计算内核接口：ROCm/HIP 的内核端，KFD doorbell、队列管理',
              'pm/ — 电源管理：SMU 固件通信、DVFS、功耗限制、风扇控制',
              '命名规范：*_v11_0 = RDNA3 GFX，*_v6_0 = RDNA3 SDMA，dcn32 = RDNA3 显示',
              'amdgpu_device.c 是驱动核心枢纽，amdgpu_drv.c 是 PCI 入口点',
            ],
          },
          diagram: {
            title: 'amdgpu 驱动源码目录结构',
            content: `drivers/gpu/drm/amd/ — amdgpu 驱动源码顶层结构
├── amdgpu/                     ← GPU 核心子系统（~1.2M 行）
│   ├── amdgpu_drv.c            ← PCI 驱动入口、module_init、pciidlist
│   ├── amdgpu_device.c         ← ★ 核心枢纽：device_init、ip_init、GPU 复位
│   ├── amdgpu_cs.c             ← 命令提交：amdgpu_cs_ioctl
│   ├── amdgpu_vm.c             ← GPU 虚拟内存管理
│   ├── amdgpu_object.c         ← Buffer Object (BO) 管理
│   ├── amdgpu_ring.c           ← Ring Buffer 抽象层
│   ├── amdgpu_fence.c          ← Fence 同步机制
│   ├── amdgpu_irq.c            ← 中断处理框架
│   ├── amdgpu_gmc.c            ← GPU Memory Controller 通用层
│   │
│   ├── gfx_v11_0.c             ← GFX IP: RDNA3 图形/计算引擎
│   ├── gfx_v10_0.c             ← GFX IP: RDNA2
│   ├── gfx_v9_0.c              ← GFX IP: GCN5 (Vega)
│   ├── sdma_v6_0.c             ← SDMA IP: RDNA3 DMA 引擎
│   ├── vcn_v4_0.c              ← VCN IP: RDNA3 视频编解码
│   ├── psp_v13_0.c             ← PSP IP: 安全处理器
│   └── nbio_v7_7.c             ← NBIO: 北桥 I/O
│
├── display/dc/                  ← Display Core（~1.6M 行，最大子系统）
│   ├── core/dc.c               ← DC 核心：dc_commit_state 等
│   ├── dc_stream.h             ← 显示流抽象
│   ├── dcn32/                  ← RDNA3 DCN 3.2 硬件层
│   ├── dcn321/                 ← RDNA3 DCN 3.2.1 变体
│   ├── dml/                    ← Display Mode Library（带宽计算）
│   └── link/                   ← DP/HDMI 链路层
│
├── amdkfd/                      ← Kernel Fusion Driver（~100K 行）
│   ├── kfd_device.c            ← KFD 设备管理
│   ├── kfd_process.c           ← 进程队列管理
│   ├── kfd_doorbell.c          ← Doorbell 映射（用户态直接提交）
│   └── kfd_chardev.c           ← /dev/kfd 字符设备
│
├── pm/                          ← 电源管理（~300K 行）
│   ├── swsmu/                  ← Software SMU 接口
│   │   ├── smu13/              ← SMU v13（RDNA3）
│   │   └── amdgpu_smu.c       ← SMU 通用抽象层
│   └── powerplay/              ← 旧版电源管理（GCN 时代）
│
└── include/                     ← 共享头文件
    ├── amdgpu_ring.h           ← Ring Buffer 数据结构
    ├── amdgpu_vm.h             ← VM 数据结构
    └── asic_reg/               ← GPU 寄存器定义（自动生成）
        └── gc/gc_11_0_0_offset.h  ← RDNA3 GFX 寄存器地址`,
            caption: 'amdgpu 驱动的完整目录结构。display/dc/ 是最大的子系统（约 40% 代码量），amdgpu/ 是核心子系统。文件名中的版本号（v11_0、v6_0）直接对应 GPU 硬件代次。',
          },
          codeWalk: {
            title: 'amdgpu_device_init — 驱动初始化的核心调用链',
            file: 'drivers/gpu/drm/amd/amdgpu/amdgpu_device.c',
            language: 'c',
            code: `/* amdgpu_device_init() — 从 PCI probe 调用，初始化整个 GPU 设备
 * 这是 amdgpu 驱动中最核心的函数之一，理解它的调用链
 * 就能理解整个驱动的启动流程。
 */
int amdgpu_device_init(struct amdgpu_device *adev,
                        uint32_t flags)
{
    /* 阶段 1: 基础设置 */
    adev->flags = flags;
    adev->asic_type = flags & AMD_ASIC_MASK;

    /* 映射 GPU 寄存器空间（BAR 2）到内核虚拟地址 */
    adev->rmmio_size = pci_resource_len(adev->pdev, 2);
    adev->rmmio = ioremap(pci_resource_start(adev->pdev, 2),
                           adev->rmmio_size);
    /* 此后可以使用 WREG32/RREG32 访问 GPU 寄存器 */

    /* 阶段 2: IP 发现 — 确定这个 GPU 有哪些 IP Block */
    r = amdgpu_discovery_set_ip_blocks(adev);
    /* 根据 GPU 的 IP Discovery 表，注册所有 IP Block：
     *   gfx_v11_0_ip_block (RDNA3 GFX)
     *   sdma_v6_0_ip_block (RDNA3 SDMA)
     *   psp_v13_0_ip_block (PSP)
     *   smu_v13_0_ip_block (SMU)
     *   dcn32_ip_block     (Display)
     *   ... 等等
     */

    /* 阶段 3: 固件加载 */
    r = amdgpu_device_fw_loading(adev);

    /* 阶段 4: 初始化所有 IP Block */
    r = amdgpu_device_ip_init(adev);
    /* 遍历所有注册的 IP Block，依次调用：
     *   ip_block->funcs->early_init(adev)  — 早期初始化
     *   ip_block->funcs->sw_init(adev)     — 软件层初始化
     *   ip_block->funcs->hw_init(adev)     — 硬件初始化
     */

    /* 阶段 5: 注册 DRM 设备 */
    r = amdgpu_device_register(adev);
    /* GPU 现在可以接受用户空间请求 */

    return 0;
}`,
            annotations: [
              'adev (struct amdgpu_device) 是整个驱动最核心的数据结构，包含所有 GPU 状态',
              'ioremap() 将 PCI BAR 的物理地址映射到内核虚拟地址，之后才能用 WREG32/RREG32',
              'amdgpu_discovery_set_ip_blocks() 是 RDNA2+ 引入的动态 IP 发现机制，替代了硬编码',
              'amdgpu_device_ip_init() 按依赖顺序初始化所有 IP Block（PSP → GMC → GFX → ...）',
              'early_init → sw_init → hw_init 三阶段初始化保证了依赖关系的正确处理',
              '任何阶段返回非零值都会导致 probe 失败，对应 dmesg 中的 "hw_init of IP block <xxx> failed"',
            ],
            explanation: '这个函数是理解整个 amdgpu 驱动的"地图"。当你在 dmesg 中看到驱动加载失败时，几乎都能追溯到这个函数的某个阶段。用 cscope 追踪 amdgpu_device_init 的调用链（:cs find c amdgpu_device_init）是学习驱动架构最好的起点。',
          },
          miniLab: {
            title: '使用 cscope 查找 amdgpu_bo_create 的所有调用者',
            objective: '在内核源码中使用 cscope 追踪 amdgpu_bo_create 的调用链，理解 Buffer Object 在哪些场景下被创建。',
            setup: `cd ~/kernel-src
make cscope tags  # 如果还没生成索引`,
            steps: [
              '使用 cscope 查找 amdgpu_bo_create 的定义：cscope -d -L -1 amdgpu_bo_create',
              '查找所有调用 amdgpu_bo_create 的位置：cscope -d -L -3 amdgpu_bo_create',
              '将结果保存到文件：cscope -d -L -3 amdgpu_bo_create > /tmp/bo_create_callers.txt',
              '统计调用者数量：wc -l /tmp/bo_create_callers.txt',
              '查看最常见的调用场景：cat /tmp/bo_create_callers.txt | awk -F: \'{print $1}\' | sort | uniq -c | sort -rn',
              '选择一个调用者（如 amdgpu_gem_create_ioctl），追踪它的上层调用：cscope -d -L -3 amdgpu_gem_create_ioctl',
            ],
            expectedOutput: `$ cscope -d -L -3 amdgpu_bo_create | head -5
drivers/gpu/drm/amd/amdgpu/amdgpu_gem.c 120 amdgpu_gem_create_ioctl ...
drivers/gpu/drm/amd/amdgpu/amdgpu_vram_mgr.c 85 ...
drivers/gpu/drm/amd/amdgpu/amdgpu_ttm.c 200 ...
drivers/gpu/drm/amd/amdgpu/amdgpu_amdkfd_gpuvm.c 340 ...

$ wc -l /tmp/bo_create_callers.txt
25     ← amdgpu_bo_create 在约 25 个位置被调用`,
            hint: 'cscope 的 -L 参数表示 line mode（非交互），-1 查找定义，-3 查找调用者，-0 查找符号。如果 cscope 数据库过期，重新运行 make cscope 更新。',
          },
          debugExercise: {
            title: '在陌生代码中快速定位问题',
            language: 'c',
            description: '你在 dmesg 中看到以下错误信息。使用代码导航技巧定位问题源文件和函数。',
            question: '如何通过这条 dmesg 错误信息定位到具体的源码位置？描述你的搜索步骤。',
            buggyCode: `[drm:amdgpu_device_ip_init [amdgpu]] *ERROR*
  hw_init of IP block <gfx_v11_0> failed -22

/* 你需要回答：
 * 1. 哪个文件包含 gfx_v11_0 的 hw_init 实现？
 * 2. 错误码 -22 代表什么？
 * 3. 如何用 cscope/grep 找到确切的失败点？
 */`,
            hint: '错误信息中的 "gfx_v11_0" 直接对应文件名命名规范。-22 是标准 Linux 错误码。',
            answer: '定位步骤：（1）文件名直接从 IP Block 名推导：gfx_v11_0 → gfx_v11_0.c，完整路径 drivers/gpu/drm/amd/amdgpu/gfx_v11_0.c。（2）错误码 -22 = -EINVAL（Invalid argument），查找方式：grep -r "define EINVAL" include/uapi/asm-generic/errno-base.h。（3）用 cscope 找 hw_init 实现：先搜索 gfx_v11_0_hw_init（命名规范是 IP名_操作名），cscope -d -L -1 gfx_v11_0_hw_init 会直接定位到定义。（4）在该函数中搜索 return -EINVAL 或 return r（其中 r 可能是从子函数传播的错误码）。（5）更精确的方法：启用动态调试（echo "file gfx_v11_0.c +p" > /sys/kernel/debug/dynamic_debug/control）然后重现问题，dmesg 会显示函数内的详细执行路径。这种从 dmesg 反向定位源码的能力是 GPU 驱动调试的核心技能。',
          },
          interviewQ: {
            question: '描述 amdgpu 驱动的源码目录结构。如果让你修复一个 RDNA3 GPU 的显示闪烁问题，你会从哪些文件开始看？',
            difficulty: 'medium',
            hint: '先描述顶层目录（amdgpu/、display/dc/、pm/、amdkfd/），然后针对显示问题定位到 display/dc/ 和 dcn32/。',
            answer: 'amdgpu 驱动顶层目录 drivers/gpu/drm/amd/ 包含四个核心子目录：（1）amdgpu/ — GPU 核心子系统：设备管理（amdgpu_device.c）、命令提交（amdgpu_cs.c）、虚拟内存（amdgpu_vm.c）、中断（amdgpu_irq.c）、各 IP Block 硬件实现（gfx_v11_0.c 等）；（2）display/dc/ — Display Core：约占 40% 代码量，包含硬件无关核心层（core/dc.c）和硬件相关层（dcn32/ 等）；（3）amdkfd/ — ROCm 计算内核接口；（4）pm/ — 电源管理（SMU 通信、DVFS）。对于 RDNA3 显示闪烁问题，我会从这些文件开始：（a）display/dc/dcn32/ — RDNA3 的 DCN 3.2 硬件层，检查时序（timing）和水印（watermark）计算；（b）display/dc/core/dc.c — dc_commit_state() 函数检查状态提交逻辑；（c）display/dc/dml/ — Display Mode Library 的带宽计算是否正确；（d）dmesg 中搜索 "dc_commit" 和 "underflow" 关键词定位具体阶段。同时用 git log -- display/dc/dcn32/ 查看最近的修改是否引入了回归。',
            amdContext: '这个问题考察你对代码库的熟悉程度和调试思路。AMD 面试官会评估你能否从问题描述快速缩小搜索范围到具体文件。',
          },
        },

        // ── Lesson 5.1.2 ──────────────────────────────────────
        {
          id: '5-1-2',
          number: '5.1.2',
          title: 'IP Block 架构：GPU 功能模块化设计',
          titleEn: 'IP Block Architecture: Modular GPU Design',
          duration: 20,
          difficulty: 'expert',
          tags: ['IP-block', 'amdgpu_ip_block', 'modular', 'hw_init', 'callbacks'],
          concept: {
            summary: 'amdgpu 驱动将 GPU 的每个硬件功能单元（GFX、SDMA、DC、VCN、PSP、SMU 等）抽象为 IP Block，每个 IP Block 实现统一的回调接口（early_init/sw_init/hw_init/suspend/resume 等）。这种模块化设计使得驱动可以用同一套框架支持从 GCN 到 RDNA4 的所有 AMD GPU。',
            explanation: [
              'IP Block（Intellectual Property Block）是 AMD GPU 硬件的模块化设计理念的软件映射。在硬件层面，一个 GPU 芯片由多个独立的功能单元组成：GFX（图形/计算引擎）、SDMA（System DMA 引擎）、VCN（Video Core Next 视频编解码）、DCN（Display Controller Next 显示控制器）、PSP（Platform Security Processor 安全处理器）、SMU（System Management Unit 电源管理）等。每个功能单元在软件中对应一个 IP Block。',
              'struct amdgpu_ip_block_version 定义了一个 IP Block 的元数据（类型、版本号），struct amd_ip_funcs 定义了统一的回调接口。每个 IP Block 必须实现以下核心回调：name（IP Block 名称）、early_init（早期初始化，检查硬件能力）、sw_init（软件资源分配，如内存/队列）、hw_init（硬件初始化，写寄存器/加载固件）、hw_fini（硬件反初始化）、sw_fini（释放软件资源）、suspend/resume（电源管理）。这套接口使得 amdgpu_device_ip_init() 可以用一个统一的循环初始化所有 IP Block，而不需要知道每个 IP 的具体实现。',
              '以 RDNA3 的 GFX 引擎为例，gfx_v11_0.c 实现了 gfx_v11_0_ip_funcs 结构体，其 hw_init 回调（gfx_v11_0_hw_init）会：加载 GFX 固件到 GPU、配置着色器引擎（Shader Engine）数量、初始化 Ring Buffer（GFX Ring、Compute Ring）、启动 Command Processor（CP）。如果 AMD 发布新一代 GPU（如 RDNA4），只需要新增一个 gfx_v12_0.c 文件实现同样的接口，核心框架代码无需修改。',
              'IP Block 的初始化顺序很重要——存在依赖关系。PSP 必须先初始化（因为其他 IP Block 的固件需要 PSP 验证签名），GMC（Graphics Memory Controller）必须在 GFX 之前初始化（因为 GFX 需要 GPU 虚拟内存支持），SMU 必须在 GFX 之前初始化（因为 GFX 需要时钟和电压）。这个顺序由 amdgpu_discovery_set_ip_blocks() 中的注册顺序决定。',
            ],
            keyPoints: [
              'IP Block = GPU 硬件功能单元的软件抽象（GFX、SDMA、VCN、DCN、PSP、SMU）',
              'struct amd_ip_funcs 定义统一回调接口：early_init/sw_init/hw_init/suspend/resume 等',
              'amdgpu_device_ip_init() 用统一循环初始化所有 IP Block，不关心具体实现',
              '初始化顺序有依赖：PSP → GMC → SMU → GFX → SDMA → VCN → DC',
              '命名规范：gfx_v11_0 (RDNA3), gfx_v10_0 (RDNA2), gfx_v9_0 (Vega/GCN5)',
              'IP Discovery 表（RDNA2+）让 GPU 自描述其 IP Block 组成，替代硬编码列表',
            ],
          },
          diagram: {
            title: 'IP Block 架构与初始化流程',
            content: `amdgpu IP Block 架构

┌─────────────────────────────────────────────────────────────────┐
│  struct amd_ip_funcs （统一回调接口）                            │
│  ┌──────────┬──────────┬──────────┬──────────┬──────────┐      │
│  │early_init│ sw_init  │ hw_init  │ suspend  │ resume   │      │
│  │检查能力  │分配资源  │写寄存器  │保存状态  │恢复状态  │      │
│  │          │(内存/队列)│加载固件  │断电准备  │重新初始化│      │
│  └──────────┴──────────┴──────────┴──────────┴──────────┘      │
└──────────────────────────┬──────────────────────────────────────┘
                           │ 每个 IP Block 实现这套接口
    ┌──────────────────────┼──────────────────────────────┐
    ▼                      ▼                              ▼
┌──────────┐     ┌──────────────┐     ┌──────────────────────┐
│ PSP      │     │ GFX          │     │ DC (Display Core)    │
│ v13_0    │     │ v11_0 (RDNA3)│     │ DCN 3.2 (RDNA3)     │
│          │     │              │     │                      │
│ hw_init: │     │ hw_init:     │     │ hw_init:             │
│ ·加载 PSP│     │ ·加载 GFX FW │     │ ·初始化显示管线      │
│  固件    │     │ ·配置 SE/CU  │     │ ·检测连接的显示器    │
│ ·验证安全│     │ ·初始化 Ring │     │ ·设置默认分辨率      │
│  签名    │     │ ·启动 CP     │     │                      │
└────┬─────┘     └──────┬───────┘     └──────────┬───────────┘
     │                  │                         │
     ▼                  ▼                         ▼
┌──────────┐     ┌──────────────┐     ┌──────────────────────┐
│ SMU      │     │ SDMA         │     │ VCN                  │
│ v13_0    │     │ v6_0 (RDNA3) │     │ v4_0 (RDNA3)        │
│          │     │              │     │                      │
│ hw_init: │     │ hw_init:     │     │ hw_init:             │
│ ·初始化  │     │ ·加载 SDMA FW│     │ ·加载 VCN 固件       │
│  SMU通信 │     │ ·初始化 SDMA │     │ ·初始化编解码引擎    │
│ ·设置默认│     │  Ring Buffer │     │ ·配置 DPG 模式       │
│  功耗限制│     │              │     │                      │
└──────────┘     └──────────────┘     └──────────────────────┘

初始化顺序（amdgpu_device_ip_init 中的遍历顺序）：

  PSP ──→ GMC ──→ IH ──→ SMU ──→ GFX ──→ SDMA ──→ VCN ──→ DC
  安全     内存    中断    电源    图形     DMA     视频    显示
  │                                │
  └── GFX 固件签名需要 PSP        └── GFX 需要 GMC（虚拟内存）
                                      和 SMU（时钟/电压）`,
            caption: 'IP Block 架构的核心思想：每个硬件功能单元实现统一的回调接口，驱动框架通过循环调用初始化所有 IP Block。初始化顺序由依赖关系决定。',
          },
          codeWalk: {
            title: 'gfx_v11_0_ip_block — RDNA3 GFX IP Block 定义',
            file: 'drivers/gpu/drm/amd/amdgpu/gfx_v11_0.c',
            language: 'c',
            code: `/* gfx_v11_0.c — RDNA3 GFX IP Block 的回调实现 */

/* 回调函数表：每个函数处理一个生命周期阶段 */
static const struct amd_ip_funcs gfx_v11_0_ip_funcs = {
    .name = "gfx_v11_0",
    .early_init = gfx_v11_0_early_init,
    .sw_init = gfx_v11_0_sw_init,
    .hw_init = gfx_v11_0_hw_init,
    .hw_fini = gfx_v11_0_hw_fini,
    .sw_fini = gfx_v11_0_sw_fini,
    .suspend = gfx_v11_0_suspend,
    .resume = gfx_v11_0_resume,
    .is_idle = gfx_v11_0_is_idle,
    .wait_for_idle = gfx_v11_0_wait_for_idle,
    .set_clockgating_state = gfx_v11_0_set_clockgating_state,
    .set_powergating_state = gfx_v11_0_set_powergating_state,
};

/* IP Block 版本信息 */
const struct amdgpu_ip_block_version gfx_v11_0_ip_block = {
    .type = AMD_IP_BLOCK_TYPE_GFX,
    .major = 11,
    .minor = 0,
    .rev = 0,
    .funcs = &gfx_v11_0_ip_funcs,
};

/* hw_init 示例（大幅简化）*/
static int gfx_v11_0_hw_init(void *handle)
{
    struct amdgpu_device *adev = (struct amdgpu_device *)handle;
    int r;

    /* 1. 加载 GFX 引擎微码到 GPU */
    r = gfx_v11_0_cp_resume(adev);
    if (r)
        return r;

    /* 2. 初始化 GFX Ring Buffer */
    r = amdgpu_ring_test_helper(&adev->gfx.gfx_ring[0]);
    if (r)
        return r;

    /* 3. 初始化 Compute Ring Buffers */
    for (i = 0; i < adev->gfx.num_compute_rings; i++) {
        r = amdgpu_ring_test_helper(
            &adev->gfx.compute_ring[i]);
        if (r)
            return r;
    }
    return 0;
}

/* amdgpu_device_ip_init 中的统一初始化循环（简化）*/
int amdgpu_device_ip_init(struct amdgpu_device *adev)
{
    for (i = 0; i < adev->num_ip_blocks; i++) {
        r = adev->ip_blocks[i].version->funcs->hw_init(
            (void *)adev);
        if (r) {
            DRM_ERROR("hw_init of IP block <%s> failed %d\\n",
                adev->ip_blocks[i].version->funcs->name, r);
            return r;
        }
    }
    return 0;
}`,
            annotations: [
              'gfx_v11_0_ip_funcs 表将所有回调聚合为一个结构体，由框架通过函数指针调用',
              'AMD_IP_BLOCK_TYPE_GFX 是枚举值，区分 GFX/SDMA/VCN/DC 等不同类型的 IP',
              'major=11, minor=0 对应 IP 版本 11.0，在 IP Discovery 表中匹配',
              'hw_init 中 cp_resume 加载 Command Processor 微码——CP 是 GPU 命令执行的入口',
              'amdgpu_ring_test_helper 向 Ring Buffer 写入测试命令并验证 GPU 响应',
              'amdgpu_device_ip_init 的循环展示了框架如何统一处理所有 IP Block 的初始化',
            ],
            explanation: '这段代码展示了 IP Block 模式的精髓：gfx_v11_0.c 只需要实现 amd_ip_funcs 接口，框架代码 amdgpu_device_ip_init() 就能自动初始化它。当 RDNA4 发布时，只需新增 gfx_v12_0.c 实现同样的接口，不需要修改框架代码。这种设计使得 amdgpu 能用一个驱动支持所有 AMD GPU 代次。',
          },
          miniLab: {
            title: '列出你的 GPU 的所有 IP Block 及其版本',
            objective: '通过 debugfs 查看你手头 AMD GPU（示例以 RX 7600 XT / gfx1102 为参考）上实际运行的所有 IP Block，验证代码中的 IP Block 注册。',
            setup: '# 确保 debugfs 已挂载\nsudo mount -t debugfs none /sys/kernel/debug 2>/dev/null',
            steps: [
              '查看 IP Block 信息：sudo cat /sys/kernel/debug/dri/0/amdgpu_firmware_info',
              '查看 IP 发现表：sudo cat /sys/kernel/debug/dri/0/amdgpu_ip_discovery 2>/dev/null || echo "需要较新内核版本"',
              '从 dmesg 提取 IP Block 初始化顺序：dmesg | grep -i "ip block\\|hw_init\\|sw_init"',
              '查看 GFX IP 版本：dmesg | grep -i "gfx.*v[0-9]"',
              '在源码中验证：grep -rn "gfx_v11_0_ip_block" drivers/gpu/drm/amd/amdgpu/',
              '对比其他 IP Block 版本：dmesg | grep -iE "(sdma|vcn|psp|smu|dcn).*v[0-9]"',
            ],
            expectedOutput: `$ sudo cat /sys/kernel/debug/dri/0/amdgpu_firmware_info
GFX ME feature version: 86, firmware version: 0x...
GFX PFP feature version: 86, firmware version: 0x...
SDMA0 feature version: 60, firmware version: 0x...
VCN feature version: 0, firmware version: 0x...
...

Navi33 (RDNA3) 的 IP Block 组成：
  GFX 11.0, SDMA 6.0, VCN 4.0, DCN 3.2, PSP 13.0, SMU 13.0`,
            hint: '如果 debugfs 路径不存在或权限不够，用 dmesg 信息代替。debugfs 路径可能是 /sys/kernel/debug/dri/0/ 或 /sys/kernel/debug/dri/1/，取决于你的 GPU 是 card0 还是 card1。',
          },
          debugExercise: {
            title: 'IP Block 初始化顺序依赖失败',
            language: 'c',
            description: '以下代码尝试在 GFX IP Block 之前注册并初始化 DC（Display Core），但导致了启动失败。',
            question: '为什么调换 DC 和 GFX 的初始化顺序会导致失败？错误信息是什么？',
            buggyCode: `/* 错误的 IP Block 注册顺序 */
int amdgpu_discovery_set_ip_blocks(struct amdgpu_device *adev)
{
    /* ... PSP, GMC, SMU 正常注册 ... */

    /* BUG: DC 在 GFX 之前注册 */
    amdgpu_device_ip_block_add(adev, &dcn32_ip_block);
    amdgpu_device_ip_block_add(adev, &gfx_v11_0_ip_block);

    /* 原本的正确顺序应该是：
     * amdgpu_device_ip_block_add(adev, &gfx_v11_0_ip_block);
     * amdgpu_device_ip_block_add(adev, &dcn32_ip_block);
     */
    return 0;
}`,
            hint: 'DC 初始化依赖 GFX Ring Buffer 来发送显示相关的 GPU 命令（如 cursor 更新）。',
            answer: 'DC（Display Core）的初始化依赖 GFX 引擎已就绪，原因有：（1）DC 需要通过 GFX Ring Buffer 提交某些显示操作的 GPU 命令（如硬件光标更新、3D LUT 加载）；（2）DC 初始化过程中需要分配 GPU 可访问的内存（如 framebuffer），这要求 GMC 和 GFX 的虚拟地址映射已经工作；（3）DC 在 hw_init 中会尝试做 mode setting 并点亮显示器，这需要向 GPU 提交命令。如果 GFX 还没初始化，Ring Buffer 不存在，DC 的命令提交会失败，dmesg 中会看到类似 "[drm:dc_commit_state_no_check] *ERROR* dc_commit_state_no_check failed" 或直接 "hw_init of IP block <dm> failed -22"。正确的顺序是 PSP → GMC → IH → SMU → GFX → SDMA → VCN → DC/DM，DC 始终在 GFX 之后。',
          },
          interviewQ: {
            question: '解释 amdgpu 驱动的 IP Block 架构。这种设计模式有什么优缺点？',
            difficulty: 'hard',
            hint: '从软件设计模式（策略模式/接口抽象）、可维护性（支持多代 GPU）、以及潜在问题（IP 间依赖、错误传播）角度分析。',
            answer: 'IP Block 架构是 amdgpu 驱动的核心设计模式，本质上是策略模式（Strategy Pattern）在内核驱动中的应用。每个 IP Block 通过 struct amd_ip_funcs 定义统一接口，框架代码通过函数指针调用具体实现。优点：（1）支持多代 GPU——新 GPU 只需新增 IP 实现文件，框架不变；（2）可独立开发和测试——DC 团队和 GFX 团队可以独立工作；（3）清晰的生命周期管理——init/fini/suspend/resume 全部统一；（4）便于错误隔离——某个 IP Block 初始化失败可以精确定位。缺点：（1）IP Block 间的隐式依赖——初始化顺序由注册顺序决定，依赖关系不在类型系统中体现；（2）过度抽象——某些 IP Block 有独特需求，被迫适配统一接口会导致 workaround；（3）错误传播不够细粒度——hw_init 失败只返回一个错误码，丢失了上下文；（4）代码膨胀——每个 IP 版本都有自己的文件，很多代码在不同版本间重复。AMD 正在通过 IP Discovery 机制和公共代码提取来缓解这些问题。',
            amdContext: '这个问题考察你对驱动架构的深层理解。AMD 面试官会特别注意你能否客观分析优缺点，而不只是赞美这个设计。提到 IP 间依赖问题和代码重复是加分项。',
          },
        },
      ],
    },

    // ════════════════════════════════════════════════════════════
    // Group 5.2: Command Submission & Synchronization
    // ════════════════════════════════════════════════════════════
    {
      id: '5-2',
      number: '5.2',
      title: '命令提交与同步',
      titleEn: 'Command Submission & Synchronization',
      icon: '📡',
      description: '深入 GPU 命令提交的完整路径——从用户空间 ioctl 到 Ring Buffer 再到 GPU 执行，以及 Fence 同步机制如何协调 CPU 和 GPU。',
      lessons: [
        // ── Lesson 5.2.1 ──────────────────────────────────────
        {
          id: '5-2-1',
          number: '5.2.1',
          title: 'GPU 命令提交：从 ioctl 到 Ring Buffer',
          titleEn: 'GPU Command Submission: From ioctl to Ring Buffer',
          duration: 20,
          difficulty: 'expert',
          tags: ['command-submission', 'ioctl', 'ring-buffer', 'PM4', 'IB', 'doorbell'],
          concept: {
            summary: 'GPU 命令提交是驱动最核心的数据通路：用户空间通过 DRM_IOCTL_AMDGPU_CS 提交命令，驱动验证并解析命令包（IB），将其写入 Ring Buffer，最后写入 Doorbell 寄存器通知 GPU 的 Command Processor（CP）开始执行。理解这条路径是理解 GPU 工作原理的关键。',
            explanation: [
              '命令提交（Command Submission, CS）是 GPU 执行任何工作的起点。无论是渲染一帧游戏还是运行一个 AI 推理任务，都需要将 GPU 命令从 CPU 提交到 GPU。在 amdgpu 中，这条路径从用户空间的 ioctl(fd, DRM_IOCTL_AMDGPU_CS, &cs) 开始，到 GPU 的 Command Processor 读取 Ring Buffer 中的命令结束。',
              'GPU 命令以 PM4（Packet Manager 4）格式编码——这是 AMD GPU 自 R600 以来使用的命令包格式。每个 PM4 包由头部（type、opcode、count）和数据体组成。用户空间的 Mesa 驱动（radeonsi/radv）负责将 OpenGL/Vulkan API 调用编译为 PM4 命令包序列，存储在 IB（Indirect Buffer）中。IB 是一块 GPU 可访问的内存，包含一组连续的 PM4 命令。',
              'amdgpu_cs_ioctl() 是内核中处理命令提交的入口函数。它的工作流程：（1）amdgpu_cs_parser_init() 解析 ioctl 参数，验证用户传入的 IB 地址和大小；（2）amdgpu_cs_parser_bos() 验证和映射命令引用的所有 Buffer Object（确保 GPU 可以访问它们）；（3）amdgpu_cs_submit() 将 IB 引用写入 Ring Buffer——Ring Buffer 不直接包含完整的命令，而是包含指向 IB 的指针（INDIRECT_BUFFER PM4 包），GPU 的 CP 会跟随这个指针去 IB 中读取实际命令。',
              'Ring Buffer 是 CPU 和 GPU 之间的核心通信机制。它是一块环形内存区域，CPU 通过 WPTR（Write Pointer）写入新命令，GPU 的 CP 通过 RPTR（Read Pointer）读取命令。当 CPU 写入新命令后，更新 WPTR 并写入 Doorbell 寄存器——这个 MMIO 写入会产生一个硬件中断，通知 CP "有新命令了"。CP 比较 RPTR 和 WPTR，如果 WPTR > RPTR 说明有新命令待处理。每种 IP Block 有自己的 Ring：GFX Ring（图形/计算命令）、SDMA Ring（DMA 传输命令）、VCN Ring（视频编解码命令）。',
            ],
            keyPoints: [
              'CS 路径：ioctl → amdgpu_cs_ioctl → parser → 验证 BO → 写入 Ring Buffer → Doorbell',
              'PM4 命令包：AMD GPU 的标准命令格式，由 Mesa（用户态）构建',
              'IB（Indirect Buffer）：GPU 可访问的内存，存放实际 PM4 命令序列',
              'Ring Buffer 是 CPU-GPU 通信的环形 FIFO，WPTR（CPU 写）/ RPTR（GPU 读）',
              'Doorbell 是 MMIO 寄存器写入，通知 GPU Command Processor 有新命令',
              '每个 IP Block 有独立的 Ring：GFX Ring、SDMA Ring、VCN Enc/Dec Ring',
            ],
          },
          diagram: {
            title: '命令提交完整路径',
            content: `GPU 命令提交的完整数据通路

用户空间（Mesa radeonsi/radv）
┌─────────────────────────────────────────────────────────────┐
│  1. Mesa 构建 PM4 命令包，写入 IB（Indirect Buffer）        │
│                                                              │
│  IB (GPU 可访问内存):                                       │
│  ┌────────────────────────────────────────────────────┐     │
│  │ [PKT3_SET_SH_REG: 设置着色器寄存器]                 │     │
│  │ [PKT3_SET_CONTEXT_REG: 设置管线状态]                │     │
│  │ [PKT3_DRAW_INDEX_AUTO: 执行绘制, count=36]          │     │
│  │ [PKT3_EVENT_WRITE: 刷新缓存]                        │     │
│  └────────────────────────────────────────────────────┘     │
│                                                              │
│  2. libdrm 调用 ioctl(fd, DRM_IOCTL_AMDGPU_CS, &cs)       │
└───────────────────────────────┬─────────────────────────────┘
                                │ ioctl 系统调用
═══════════════════════════════════════════════════════════════
                                │
内核空间（amdgpu 驱动）         ▼
┌─────────────────────────────────────────────────────────────┐
│  3. amdgpu_cs_ioctl()                                       │
│     ├─ amdgpu_cs_parser_init()   → 解析 ioctl 参数         │
│     ├─ amdgpu_cs_parser_bos()    → 验证/映射所有 BO         │
│     ├─ amdgpu_cs_dependencies()  → 处理 fence 依赖         │
│     └─ amdgpu_cs_submit()        → 提交到调度器             │
│                                                              │
│  4. GPU Scheduler (drm_sched)                               │
│     └─ amdgpu_job_run()          → 将 IB 写入 Ring          │
│                                                              │
│  5. 写入 Ring Buffer:                                       │
│     ┌──────────────────────────────────────────────────┐    │
│     │ Ring Buffer (GFX Ring):                          │    │
│     │                                                   │    │
│     │  RPTR ──→ [已执行的命令...]                       │    │
│     │            [已执行的命令...]                       │    │
│     │            [PKT3_INDIRECT_BUFFER: addr=IB, sz=64] │ ← WPTR
│     │            [空...]                                │    │
│     │            [空...]                                │    │
│     └──────────────────────────────────────────────────┘    │
│                                                              │
│  6. writel(wptr, adev->wb.wb[ring->wptr_offs])              │
│     writel(wptr, ring->doorbell_ptr)                        │
│     ↑ Doorbell 写入通知 GPU Command Processor                │
└───────────────────────────────┬─────────────────────────────┘
                                │
GPU 硬件                        ▼
┌─────────────────────────────────────────────────────────────┐
│  7. Command Processor (CP) 检测到 WPTR > RPTR               │
│     ├─ 从 Ring 读取 PKT3_INDIRECT_BUFFER                    │
│     ├─ 跟随指针到 IB 地址                                    │
│     ├─ 解析 IB 中的 PM4 命令                                 │
│     └─ 驱动 Shader Engine 执行                               │
│                                                              │
│  8. 执行完成后：                                             │
│     ├─ 更新 RPTR                                             │
│     ├─ 写入 fence 值到内存（通知 CPU 完成）                  │
│     └─ 触发中断（可选）                                      │
└─────────────────────────────────────────────────────────────┘`,
            caption: 'GPU 命令提交的完整数据通路。关键是 Ring Buffer 不直接包含全部命令——它通过 INDIRECT_BUFFER 包指向 IB，CP 跟随指针读取实际命令。这种间接方式允许提交任意大小的命令序列。',
          },
          codeWalk: {
            title: 'amdgpu_cs_ioctl — 命令提交入口（简化）',
            file: 'drivers/gpu/drm/amd/amdgpu/amdgpu_cs.c',
            language: 'c',
            code: `/* amdgpu_cs_ioctl() — 处理 DRM_IOCTL_AMDGPU_CS 的核心函数
 * 这是 GPU 执行任何工作的起点
 */
int amdgpu_cs_ioctl(struct drm_device *dev, void *data,
                     struct drm_file *filp)
{
    struct amdgpu_device *adev = drm_to_adev(dev);
    union drm_amdgpu_cs *cs = data;
    struct amdgpu_cs_parser parser = {};
    int r;

    /* 阶段 1: 解析用户传入的命令提交请求 */
    r = amdgpu_cs_parser_init(&parser, adev, filp, cs);
    /* 验证 IB 数量、Ring 类型、优先级等参数
     * 解析 chunk 数组：IB chunk、dependency chunk、
     *                   syncobj chunk 等 */

    /* 阶段 2: 处理 Buffer Object 列表 */
    r = amdgpu_cs_parser_bos(&parser, data);
    /* 对于命令引用的每个 BO：
     *   - 验证用户有权访问该 BO
     *   - 确保 BO 在 GPU 可访问的位置（VRAM/GTT）
     *   - 必要时迁移 BO（如从 GTT 移到 VRAM）
     *   - 更新 GPU 页表映射 */

    /* 阶段 3: 处理 fence 依赖 */
    r = amdgpu_cs_dependencies(adev, &parser);
    /* 如果此命令依赖之前的命令完成，
     * 将依赖的 fence 添加到调度器依赖列表 */

    /* 阶段 4: 提交到 GPU 调度器 */
    r = amdgpu_cs_submit(&parser, cs);
    /* 创建 amdgpu_job，提交到 drm_gpu_scheduler
     * 调度器最终调用 amdgpu_job_run()：
     *   - 将 INDIRECT_BUFFER PM4 包写入 Ring
     *   - 写入 Doorbell 通知 GPU */

    return r;
}

/* Ring Buffer 写入的核心操作（简化）*/
void amdgpu_ring_commit(struct amdgpu_ring *ring)
{
    /* 更新 WPTR（写指针）*/
    uint64_t wptr = ring->wptr;

    /* 写入 Doorbell 寄存器 — 这一步触发 GPU 开始执行 */
    if (ring->use_doorbell) {
        atomic64_set((atomic64_t *)ring->doorbell_ptr, wptr);
        WDOORBELL64(ring->doorbell_index, wptr);
    } else {
        /* 老 GPU 使用 MMIO 写 WPTR 寄存器 */
        WREG32(ring->wptr_reg, lower_32_bits(wptr));
    }
}`,
            annotations: [
              'amdgpu_cs_parser_init 将用户空间的 ioctl 参数解析为内核可处理的结构体',
              'amdgpu_cs_parser_bos 是最耗时的阶段——涉及 BO 验证和可能的内存迁移',
              'fence 依赖确保 GPU 按正确顺序执行命令（如先完成数据上传再开始渲染）',
              'drm_gpu_scheduler 是 DRM 通用的 GPU 调度器，处理多进程的公平调度',
              'Doorbell 是 RDNA 系列的主要 CP 通知机制，比传统 MMIO 写 WPTR 更高效',
              'atomic64_set + WDOORBELL64 确保 64 位 WPTR 的原子写入',
            ],
            explanation: '这是 amdgpu 驱动中最频繁执行的代码路径——每秒可能执行数百到数千次。理解这个路径是理解 GPU 如何执行工作的基础。每个阶段的性能都很关键：parser 阶段的 BO 验证开销是用户态驱动（Mesa）尽量批量提交命令的原因。',
          },
          miniLab: {
            title: '使用 ftrace 追踪命令提交路径',
            objective: '使用 ftrace 追踪 amdgpu_cs_ioctl 的执行，观察真实的命令提交耗时和调用链。',
            setup: `# 确保 ftrace 可用
sudo mount -t tracefs nodev /sys/kernel/tracing 2>/dev/null
# 准备一个 GPU 工作负载
sudo apt install -y mesa-utils`,
            steps: [
              '设置 ftrace 追踪 amdgpu_cs_ioctl：echo amdgpu_cs_ioctl > /sys/kernel/tracing/set_ftrace_filter',
              '启用函数图追踪：echo function_graph > /sys/kernel/tracing/current_tracer',
              '开始追踪：echo 1 > /sys/kernel/tracing/tracing_on',
              '运行 GPU 负载：glxgears & sleep 2 && kill %1',
              '停止追踪：echo 0 > /sys/kernel/tracing/tracing_on',
              '查看结果：head -100 /sys/kernel/tracing/trace',
            ],
            expectedOutput: `$ head -50 /sys/kernel/tracing/trace
# tracer: function_graph
#
#  DURATION    |  FUNCTION CALLS
#              |  |  |  |
  12.345 us    |  amdgpu_cs_ioctl() {
   0.234 us    |    amdgpu_cs_parser_init();
   5.678 us    |    amdgpu_cs_parser_bos() {
   3.456 us    |      amdgpu_bo_list_get();
   1.234 us    |      ttm_eu_reserve_buffers();
               |    }
   2.345 us    |    amdgpu_cs_submit() {
   0.567 us    |      amdgpu_job_submit();
   0.890 us    |      amdgpu_ring_commit();
               |    }
               |  }`,
            hint: '需要 root 权限操作 ftrace。如果 set_ftrace_filter 写入失败，检查内核是否编译了 CONFIG_FUNCTION_TRACER。追踪完记得关闭 ftrace 以避免性能影响。',
          },
          debugExercise: {
            title: 'Ring Buffer 溢出',
            language: 'c',
            description: '以下场景中，GPU 命令提交开始返回 -ENOMEM 错误，但 VRAM 还有大量空闲空间。',
            question: '为什么 VRAM 有空间但命令提交仍然失败？如何诊断和解决？',
            buggyCode: `/* 用户报告的错误信息 */
dmesg:
[drm:amdgpu_ring_alloc [amdgpu]] *ERROR*
  ring gfx_0.0.0 is full (wptr=0x1FFF0, rptr=0x00010)
amdgpu_cs_ioctl returned -12   /* -ENOMEM */

/* GPU 状态 */
VRAM: 2048MB / 8192MB used     (大量空闲!)
GTT:  512MB / 8192MB used      (大量空闲!)

/* 应用行为 */
应用在快速循环中提交命令，没有等待之前的命令完成
while (rendering) {
    submit_gpu_command();  /* 没有任何 fence wait! */
}`,
            hint: 'Ring Buffer 的大小是固定的（通常 256KB-1MB），而不是动态增长的。WPTR 追上了 RPTR 意味着什么？',
            answer: '问题是 Ring Buffer 溢出（ring full），而非 VRAM 不足。Ring Buffer 是固定大小的环形 FIFO——当 WPTR 追上 RPTR（即 CPU 写入命令的速度超过 GPU 执行命令的速度），ring 就满了。dmesg 中 "wptr=0x1FFF0, rptr=0x00010" 说明 WPTR 几乎绕了一圈追上了 RPTR。根因：应用在快速循环中提交命令但从不等待（fence wait），导致 Ring 积压。解决方案：（1）应用层面——在提交命令后适当做 fence wait，或使用 fence 回调异步等待；（2）驱动层面——amdgpu_ring_alloc() 在 ring full 时应该等待（spin/sleep）直到 RPTR 前进，而非立即返回错误；实际驱动中确实有 amdgpu_ring_test_helper 的超时等待逻辑。（3）调优层面——增大 Ring Buffer 大小（amdgpu.gfx_ring_size 模块参数）可以增加缓冲。关键理解：VRAM 空间和 Ring Buffer 空间是完全不同的资源——Ring 满不代表内存不足。',
          },
          interviewQ: {
            question: '描述 amdgpu 中一个 GPU 命令从用户空间提交到 GPU 执行完成的完整路径。',
            difficulty: 'hard',
            hint: '按顺序描述：ioctl → parser → BO 验证 → scheduler → Ring 写入 → Doorbell → CP 执行 → fence 完成通知。',
            answer: '完整路径：（1）用户空间 Mesa 通过 libdrm 调用 ioctl(fd, DRM_IOCTL_AMDGPU_CS, &cs)，参数包含 IB 地址、BO 列表、fence 依赖；（2）内核 amdgpu_cs_ioctl() 入口，amdgpu_cs_parser_init() 解析参数，验证 IB 数量和 Ring 类型；（3）amdgpu_cs_parser_bos() 对命令引用的所有 BO 执行 TTM 预留（reservation），验证 GPU 映射，必要时执行 BO 迁移（GTT→VRAM）和页表更新；（4）amdgpu_cs_dependencies() 将 syncobj/timeline 依赖转换为 dma_fence 依赖；（5）创建 amdgpu_job 并提交到 drm_gpu_scheduler，调度器根据 Ring 类型和优先级排队；（6）调度器选择 job 执行时，调用 amdgpu_job_run()——它将 INDIRECT_BUFFER PM4 包（包含 IB 地址和大小）写入 GFX Ring Buffer；（7）调用 amdgpu_ring_commit() 更新 WPTR 并写入 Doorbell 寄存器；（8）GPU Command Processor（CP）检测到 WPTR > RPTR，从 Ring 读取 INDIRECT_BUFFER 包，跟随指针到 IB 地址，解析 PM4 命令驱动 Shader Engine 执行；（9）执行完成后 GPU 写入 fence 序列号到特定内存地址（writeback buffer），触发中断；（10）中断处理函数 amdgpu_fence_process() 检查 fence 序列号，signal 相关的 dma_fence，唤醒等待的 CPU 线程。',
            amdContext: '这是 AMD 面试中的高频技术深度问题。完整描述从 ioctl 到 fence signal 的全路径，并能指出每个阶段对应的函数名，是区分"了解概念"和"深入理解代码"的关键。',
          },
        },

        // ── Lesson 5.2.2 ──────────────────────────────────────
        {
          id: '5-2-2',
          number: '5.2.2',
          title: 'Fence 同步机制：CPU-GPU 协调',
          titleEn: 'Fence Synchronization: CPU-GPU Coordination',
          duration: 20,
          difficulty: 'expert',
          tags: ['fence', 'dma_fence', 'synchronization', 'interrupt', 'gpu-hang'],
          concept: {
            summary: 'Fence 是 CPU 和 GPU 之间的同步原语。GPU 每完成一批命令就向内存中写入一个递增的序列号（fence 值），CPU 通过比较这个值来判断 GPU 的进度。amdgpu 的 fence 机制建立在内核的 dma_fence 框架之上，支持阻塞等待、回调通知和超时检测（GPU Hang 检测）。',
            explanation: [
              'CPU 和 GPU 是异步执行的——CPU 提交命令后 GPU 可能还没开始执行，GPU 执行完成时 CPU 可能在做其他事。Fence 是连接这两个异步世界的桥梁。最基本的 fence 机制很简单：GPU 每完成一组命令后，向一个约定的内存地址写入一个递增的序列号（sequence number）。CPU 想知道 GPU 是否完成了某个命令，只需要读取这个地址并比较序列号。',
              'amdgpu 的 fence 实现建立在内核的 dma_fence 框架之上。amdgpu_fence_emit() 在命令提交时向 Ring Buffer 写入一个 FENCE PM4 包——当 GPU 执行到这个包时，会将一个预分配的序列号写入 adev->fence_drv[ring_id].gpu_addr 指向的内存。CPU 端的 amdgpu_fence_process() 读取这个地址，比较序列号，如果 GPU 写入的值 >= 期望的值，就 signal 对应的 dma_fence。',
              'Fence 的等待有两种方式：（1）阻塞等待（dma_fence_wait）——CPU 线程 sleep 直到 fence 被 signal，适用于必须等待 GPU 完成的场景（如 glFinish）；（2）回调通知（dma_fence_add_callback）——注册回调函数在 fence signal 时异步执行，不阻塞 CPU，适用于流水线场景。GPU 完成命令后通过中断通知 CPU——中断处理函数在 tasklet 上下文中调用 amdgpu_fence_process()，后者遍历该 Ring 的所有未 signal 的 fence 并 signal 已完成的。',
              'Fence 超时是 GPU Hang 检测的核心机制。drm_gpu_scheduler 为每个提交的 job 设置一个超时时间（默认 10 秒）。如果超时后 fence 仍未 signal，调度器认为 GPU 发生了 hang，触发 amdgpu_job_timedout()，开始 GPU 复位流程。dmesg 中的 "[drm] ring gfx_0.0.0 timeout" 就是这个机制报告的。理解 fence timeout 和 GPU 复位流程对于调试 GPU hang 问题至关重要。',
            ],
            keyPoints: [
              'Fence 本质：GPU 向内存写递增序列号，CPU 读取并比较来判断进度',
              'amdgpu_fence_emit()：在 Ring 中插入 FENCE PM4 包，GPU 执行时写入序列号',
              'amdgpu_fence_process()：中断触发 → 读取 GPU 写入的序列号 → signal dma_fence',
              '等待方式：阻塞（dma_fence_wait）vs 回调（dma_fence_add_callback）',
              'GPU Hang 检测：fence 超时（默认 10s）→ amdgpu_job_timedout → GPU 复位',
              'Timeline Semaphore：有序序列号，支持跨进程和跨 Ring 的细粒度同步',
            ],
          },
          diagram: {
            title: 'Fence 同步机制的生命周期',
            content: `Fence 生命周期：从 emit 到 signal

时间 ──────────────────────────────────────────────────────────→

CPU 端                          GPU 端
──────                          ──────

1. 命令提交
   amdgpu_cs_submit()
   │
   ├─ amdgpu_fence_emit()
   │  在 Ring 尾部插入:
   │  [PM4 FENCE 包:
   │   addr=fence_gpu_addr,        Ring Buffer:
   │   seq=42]                     ┌──────────────────┐
   │                               │ ...其他 PM4 命令   │
   │  创建 dma_fence              │ [INDIRECT_BUFFER] │
   │  (seq=42, unsignaled)         │ [FENCE addr seq=42]│ ← WPTR
   │                               └──────────────────┘
   ├─ ring_commit()
   │  写 Doorbell                     │
   │                                  │ GPU CP 开始执行
   ▼                                  ▼
2. GPU 执行中
   CPU 可以做其他事              GPU 执行 IB 中的命令
   或 dma_fence_wait()           ├─ 执行绘制命令
   (sleep 等待)                  ├─ 执行计算命令
   │                             └─ 执行到 FENCE PM4 包
   │                                │
   │                                ▼
3. GPU 完成                      GPU 将 seq=42 写入
                                 fence_gpu_addr 内存
   fence_gpu_addr:               │
   [之前: 41] → [现在: 42]       └─ 触发硬件中断
                                       │
4. 中断处理                            │
   amdgpu_irq_handler()    ◄──────────┘
   └─ tasklet_schedule()
      └─ amdgpu_fence_process()
         │
         ├─ 读取 *fence_gpu_addr → 42
         ├─ 42 >= 期望的 42 ✓
         └─ dma_fence_signal(fence_42)
            │
            ├─ 唤醒阻塞的线程 (dma_fence_wait 返回)
            └─ 执行注册的回调 (dma_fence_add_callback)

5. Fence 超时（GPU Hang 场景）
   如果 10 秒后 fence 仍未 signal:
   drm_sched_job_timedout()
   └─ amdgpu_job_timedout()
      ├─ DRM_ERROR("ring gfx_0.0.0 timeout")
      ├─ dump GPU 寄存器 (GRBM_STATUS 等)
      └─ amdgpu_device_gpu_recover()
         └─ GPU 复位 → 重新初始化所有 IP Block`,
            caption: 'Fence 的完整生命周期。正常路径：emit → GPU 执行 → 写序列号 → 中断 → signal。异常路径：超时 → GPU hang 检测 → 复位。fence_gpu_addr 指向的内存是 CPU 和 GPU 之间的共享"信箱"。',
          },
          codeWalk: {
            title: 'amdgpu_fence_emit 和 amdgpu_fence_process',
            file: 'drivers/gpu/drm/amd/amdgpu/amdgpu_fence.c',
            language: 'c',
            code: `/* amdgpu_fence_emit() — 在 Ring 中插入 fence 命令
 * 每次命令提交时调用
 */
int amdgpu_fence_emit(struct amdgpu_ring *ring,
                       struct dma_fence **f,
                       struct amdgpu_job *job,
                       unsigned int flags)
{
    struct amdgpu_device *adev = ring->adev;
    struct amdgpu_fence *fence;
    uint32_t seq;

    /* 分配递增的序列号 */
    seq = ++ring->fence_drv.sync_seq;

    /* 初始化 dma_fence 结构体 */
    dma_fence_init(&fence->base, &amdgpu_fence_ops,
                   &ring->fence_drv.lock,
                   adev->fence_context + ring->idx, seq);

    /* 向 Ring Buffer 写入 FENCE PM4 包
     * GPU 执行到此包时会：
     *   MEM_WRITE(fence_gpu_addr, seq)
     *   → 将 seq 写入 fence_gpu_addr 指向的内存
     */
    amdgpu_ring_emit_fence(ring,
        ring->fence_drv.gpu_addr,   /* GPU 写入的目标地址 */
        seq,                         /* 要写入的序列号 */
        flags);

    *f = &fence->base;
    return 0;
}

/* amdgpu_fence_process() — 在中断上下文中处理完成的 fence
 * 由中断 handler 的 tasklet 调用
 */
bool amdgpu_fence_process(struct amdgpu_ring *ring)
{
    struct amdgpu_fence_driver *drv = &ring->fence_drv;
    uint32_t last_seq, seq;

    /* 读取 GPU 写入的最新序列号
     * 这个内存地址由 CPU 和 GPU 共享（writeback buffer）
     */
    last_seq = atomic_read(&drv->last_seq);
    seq = le32_to_cpu(*drv->cpu_addr);
    /* ↑ drv->cpu_addr 和 drv->gpu_addr 指向同一块物理内存
     *   GPU 通过 gpu_addr 写入，CPU 通过 cpu_addr 读取 */

    if (seq == last_seq)
        return false;  /* 没有新完成的命令 */

    atomic_set(&drv->last_seq, seq);

    /* Signal 所有序列号 <= seq 的 fence */
    while (last_seq != seq) {
        struct dma_fence *fence;
        fence = /* 查找 seq=last_seq+1 的 fence */;
        if (fence) {
            /* 唤醒 dma_fence_wait 的线程
             * 执行 dma_fence_add_callback 的回调 */
            dma_fence_signal(fence);
        }
        ++last_seq;
    }
    return true;
}`,
            annotations: [
              'sync_seq 是每个 Ring 的递增计数器——每次 emit 加 1，保证全局唯一',
              'dma_fence_init 使用 fence_context + ring_idx 作为上下文标识符',
              'amdgpu_ring_emit_fence 是 Ring 特定的操作——GFX/SDMA/VCN Ring 有不同的 PM4 格式',
              'fence_gpu_addr 和 cpu_addr 是同一物理内存的 GPU 虚拟地址和 CPU 虚拟地址',
              'le32_to_cpu 处理字节序——GPU 写 little-endian 数据',
              'dma_fence_signal 是内核 DMA fence 框架的函数，处理等待唤醒和回调执行',
            ],
            explanation: 'emit 和 process 是 fence 机制的两端：emit 在提交时向 GPU "下订单"（在 Ring 中插入 fence 命令），process 在中断时"检查订单完成状态"（读取 GPU 写入的序列号并 signal fence）。这两个函数的高效实现是 GPU 性能的关键——每秒可能执行数千次。',
          },
          miniLab: {
            title: '观察 GPU fence 的创建和完成',
            objective: '通过 debugfs 和 ftrace 观察真实的 fence 活动，理解 fence 在 GPU 工作流中的角色。',
            steps: [
              '查看当前 fence 状态：sudo cat /sys/kernel/debug/dri/0/amdgpu_fence_info',
              '观察 fence 序列号变化：watch -n 0.5 "sudo cat /sys/kernel/debug/dri/0/amdgpu_fence_info | head -20"',
              '在另一个终端运行 GPU 负载：glxgears',
              '观察 fence 序列号快速递增（每帧至少 +1）',
              '用 ftrace 追踪 fence signal：echo amdgpu_fence_process > /sys/kernel/tracing/set_ftrace_filter && echo function > /sys/kernel/tracing/current_tracer && echo 1 > /sys/kernel/tracing/tracing_on',
              '查看追踪结果：cat /sys/kernel/tracing/trace | head -30',
            ],
            expectedOutput: `$ sudo cat /sys/kernel/debug/dri/0/amdgpu_fence_info
--- ring gfx_0.0.0 ---
Last signaled fence          0x00003a42
Last emitted                 0x00003a45
  ← 差值 3 表示有 3 个命令正在 GPU 中执行

--- ring sdma0 ---
Last signaled fence          0x00000128
Last emitted                 0x00000128
  ← 差值 0 表示 SDMA 空闲`,
            hint: '如果 "Last signaled" 和 "Last emitted" 差值很大（> 100）且长时间不变，可能意味着 GPU hang。正常情况下差值应该在 0-10 之间波动。',
          },
          debugExercise: {
            title: 'Fence 超时导致 GPU Hang',
            language: 'text',
            description: '以下 dmesg 输出显示了一个 GPU hang 事件。分析 fence 信息确定 hang 的 Ring 和原因。',
            question: '从 fence 信息中推断：哪个 Ring 发生了 hang？GPU 在执行什么类型的操作？hang 可能的原因是什么？',
            buggyCode: `[  345.678] [drm:amdgpu_job_timedout [amdgpu]] *ERROR*
  ring gfx_0.0.0 timeout, signaled seq=1024, emitted seq=1028
[  345.678] [drm:amdgpu_job_timedout [amdgpu]]
  GPU fault info:
  SRC_ID: 146, RING: 0, VMID: 3
  addr: 0xDEAD0000BEEF0000
[  345.679] [drm] GPU registers:
  GRBM_STATUS=0x00000300 (GUI_ACTIVE | GFX_BUSY)
  CP_RB_RPTR=0x0000F100
  CP_RB_WPTR=0x0000F180
  CP_BUSY=1 CP_COHERENCY_BUSY=1
[  345.680] amdgpu 0000:03:00.0: amdgpu:
  GPU reset begin!`,
            hint: 'signaled seq=1024, emitted seq=1028 说明 4 个 job 未完成。SRC_ID:146 是什么中断源？addr 看起来像无效地址。',
            answer: '分析：（1）hang 发生在 GFX Ring（gfx_0.0.0），这是图形/计算命令的主 Ring。signaled=1024, emitted=1028 说明有 4 个 job 提交但未完成。（2）SRC_ID:146 是 VMC（Virtual Memory Controller）页错误中断，说明 GPU 尝试访问无效的虚拟地址。addr=0xDEAD0000BEEF0000 是一个典型的调试用毒化地址（poison pattern），表示访问了已释放或未映射的内存。VMID=3 表示是用户空间进程的 GPU 虚拟地址空间。（3）GRBM_STATUS 显示 GUI_ACTIVE 和 GFX_BUSY，CP_BUSY=1 确认 GPU 正在执行但卡住了——CP 尝试访问无效地址导致 VMC fault，GFX 引擎因此停滞。（4）根因很可能是：用户空间程序释放了 BO（Buffer Object）但仍然在后续命令中引用了它，导致 GPU 访问已 unmap 的地址。这是典型的 use-after-free 在 GPU 端的表现。修复方向：检查应用程序的 BO 生命周期管理，确保命令完成前不释放引用的 BO。',
          },
          interviewQ: {
            question: '解释 amdgpu 中 fence 的工作原理。GPU hang 时 fence 机制如何检测到问题？',
            difficulty: 'hard',
            hint: '先解释正常的 fence 流程（emit → GPU 写序列号 → 中断 → signal），再解释超时检测和复位流程。',
            answer: 'Fence 工作原理：（1）每次命令提交（amdgpu_fence_emit），驱动在 Ring Buffer 尾部插入一个 FENCE PM4 命令包，包含目标内存地址和递增的序列号 N；（2）GPU Command Processor 执行到 FENCE 包时，将序列号 N 写入指定的内存地址（writeback buffer）并触发硬件中断；（3）中断处理函数调用 amdgpu_fence_process()，读取 GPU 写入的最新序列号，signal 所有 seq <= N 的 dma_fence；（4）被 signal 的 fence 唤醒通过 dma_fence_wait() 等待的 CPU 线程，或触发通过 dma_fence_add_callback() 注册的回调函数。GPU Hang 检测：drm_gpu_scheduler 为每个 job 启动一个定时器（默认 10 秒）。如果定时器到期时对应的 fence 仍未 signal，说明 GPU 在预期时间内没有完成——调度器调用 amdgpu_job_timedout()。该函数：（a）记录错误到 dmesg（ring timeout, signaled/emitted seq）；（b）dump 关键 GPU 寄存器（GRBM_STATUS、CP 状态）；（c）调用 amdgpu_device_gpu_recover() 执行 GPU 复位——保存所有 Ring 状态、重新初始化所有 IP Block、重新提交未完成的 job。GPU 复位是一个"核武器"操作——它会中断所有 GPU 工作，但能恢复 GPU 到可用状态。在 SR-IOV 虚拟化环境中，只能复位分配给当前 VM 的 GPU 功能。 Key gotchas that distinguish senior engineers: (1) Fence signals use spinlock (not workqueue) because they execute in interrupt/softirq context where sleeping is forbidden — but the callback chain can be long, so the kernel moved to irq_work for deferred processing in recent versions. (2) Ring buffers use Write-Combine (WC) MMIO mapping instead of cached mapping because WC provides much better sequential write performance (CPU writes are combined into full cache-line bursts), but reads from WC memory return garbage — the driver must never read back from the ring buffer, only write to it. (3) Fence timeout != GPU hang: a fence can timeout because the interrupt was lost (common with MSI-X configuration bugs), even though the GPU actually completed the work. The recovery path must check the actual fence sequence number before declaring a hang.',
            amdContext: 'Fence 和 GPU hang 处理是 AMD 面试中的深度技术话题。展示你理解从 fence emit 到 GPU 复位的完整链条，以及复位对其他 GPU 用户的影响。',
          },
        },
      ],
    },

    // ════════════════════════════════════════════════════════════
    // Group 5.3: Display & Power Management
    // ════════════════════════════════════════════════════════════
    {
      id: '5-3',
      number: '5.3',
      title: '显示与电源管理',
      titleEn: 'Display & Power Management',
      icon: '🖥️',
      description: '深入 AMD Display Core（DC）显示引擎架构和 SMU 电源管理机制——这两个子系统直接影响用户的视觉体验和功耗/性能平衡。',
      lessons: [
        // ── Lesson 5.3.1 ──────────────────────────────────────
        {
          id: '5-3-1',
          number: '5.3.1',
          title: 'Display Core (DC)：AMD 的显示引擎',
          titleEn: 'Display Core (DC): AMD Display Engine',
          duration: 20,
          difficulty: 'expert',
          tags: ['display-core', 'DC', 'DCN', 'KMS', 'FreeSync', 'display-pipeline'],
          concept: {
            summary: 'Display Core (DC) 是 amdgpu 驱动中最大的子系统（约 160 万行代码），负责所有显示输出。DC 采用硬件无关的核心层 + 硬件相关的 DCN（Display Controller Next）层设计，实现了从 framebuffer 到显示器的完整显示管线（HUBP → DPP → OPP → OPTC → DIO），并支持 FreeSync/VRR 等高级特性。',
            explanation: [
              'DC（Display Core）是 AMD 从 Windows 驱动移植到 Linux 的显示引擎——这也是为什么它的代码风格与内核其他部分有明显差异（更接近 Windows 驱动的 C 风格，使用大量面向对象模式）。DC 最初在 2017 年合并入内核时引发了争议（因为代码量巨大且风格独特），但它是支持 AMD 现代显示特性的必要组件。',
              'DC 的架构分为两大层：硬件无关的核心层（display/dc/core/）和硬件相关的 DCN 层（display/dc/dcn32/ 等）。核心层定义了显示管线的抽象模型——stream（显示流，对应一个显示器输出）、plane（显示平面，对应一个图层）、timing（时序参数，分辨率/刷新率）。DCN 层实现了具体硬件的寄存器编程。这种分层使得支持新一代 DCN 只需添加硬件层代码，核心逻辑可以复用。',
              'DCN（Display Controller Next）的显示管线由以下硬件单元组成，数据从 framebuffer 到显示器依次经过：HUBP（Hub Pipe，从内存读取像素数据）→ DPP（Display Pipe and Plane，色彩变换、缩放、混合）→ OPP（Output Pixel Processor，gamma 校正、dithering）→ OPTC（Output Pipe Timing Combiner，生成显示时序信号）→ DIO（Display I/O，编码为 DP/HDMI/DVI 信号输出）。每个单元对应 DCN 硬件中的一个子模块，驱动需要精确配置它们的寄存器来实现正确的显示输出。',
              'DC 与 DRM KMS（Kernel Mode Setting）的关系：DRM KMS 是 Linux 内核的通用显示管理框架（drm_atomic_commit、drm_crtc、drm_connector 等），amdgpu 的 amdgpu_dm.c（Display Manager）是 KMS 和 DC 之间的适配器层。当用户空间（如 GNOME/KDE）调用 DRM atomic commit 请求设置分辨率时，amdgpu_dm 将 DRM 数据结构转换为 DC 的数据结构，然后调用 dc_commit_state() 执行实际的硬件配置。FreeSync/VRR（Variable Refresh Rate）也是通过 DC 实现的——DC 可以动态调整 OPTC 的 VBlank 间隔来匹配 GPU 的渲染帧率。',
            ],
            keyPoints: [
              'DC 是 amdgpu 最大的子系统（~1.6M 行代码），从 Windows 驱动移植而来',
              '两层架构：核心层（硬件无关）+ DCN 层（硬件相关，如 dcn32 = RDNA3）',
              '显示管线：HUBP → DPP → OPP → OPTC → DIO → 显示器',
              'DRM KMS ←→ amdgpu_dm.c（适配层）←→ DC Core ←→ DCN Hardware',
              'dc_commit_state() 是显示状态提交的核心函数，执行 atomic mode setting',
              'FreeSync/VRR 通过 DC 动态调整 OPTC 的 VBlank 周期实现',
            ],
          },
          diagram: {
            title: 'DCN 显示管线架构',
            content: `DCN (Display Controller Next) 显示管线 — RDNA3 DCN 3.2

Framebuffer (VRAM)
  像素数据存储在 GPU 内存中
       │
       ▼
┌──────────────┐
│    HUBP      │  Hub Pipe — 从内存读取像素数据
│              │  · 配置 framebuffer 地址和格式
│              │  · 支持 tiling 模式解码
│              │  · 请求内存控制器读取数据
└──────┬───────┘
       │ 像素数据流
       ▼
┌──────────────┐
│    DPP       │  Display Pipe and Plane — 像素处理
│              │  · 色彩空间转换 (sRGB → HDR)
│              │  · 缩放 (scaling, 支持整数和小数缩放)
│              │  · 多图层混合 (cursor、overlay、video)
│              │  · 3D LUT 色彩映射
└──────┬───────┘
       │ 处理后的像素
       ▼
┌──────────────┐
│    OPP       │  Output Pixel Processor — 输出像素处理
│              │  · Gamma 校正 (regamma)
│              │  · Dithering (减少色带效应)
│              │  · 位深转换 (10bit → 8bit)
│              │  · 格式化为输出编码
└──────┬───────┘
       │
       ▼
┌──────────────┐
│    OPTC      │  Output Pipe Timing Combiner — 时序生成
│              │  · 生成 HSync / VSync 信号
│              │  · VBlank 控制 (FreeSync/VRR 在此调整)
│              │  · 多显示器时序同步
│              │  · CRC (循环冗余校验，用于验证)
└──────┬───────┘
       │ 时序 + 像素
       ▼
┌──────────────┐
│    DIO       │  Display I/O — 物理输出
│              │  · DP (DisplayPort) 编码: 8b/10b, 128b/132b
│              │  · HDMI 编码: TMDS / FRL
│              │  · Link training (协商链路速率)
│              │  · HDCP 加密 (内容保护)
└──────┬───────┘
       │ DP/HDMI 信号
       ▼
   显示器 🖥️

DRM KMS 与 DC 的关系：

  用户空间 (GNOME/KDE)
       │ drmModeAtomicCommit()
       ▼
  DRM Atomic KMS 框架
       │ drm_atomic_helper_commit()
       ▼
  amdgpu_dm.c (适配层)         ← 将 DRM 结构转为 DC 结构
       │ dc_commit_state()
       ▼
  DC Core (display/dc/core/)   ← 硬件无关的显示逻辑
       │ 调用 DCN 硬件函数
       ▼
  DCN 3.2 (display/dc/dcn32/)  ← RDNA3 硬件寄存器编程`,
            caption: 'DCN 3.2 显示管线和 DRM KMS 到 DC 的调用层次。每个管线阶段（HUBP→DPP→OPP→OPTC→DIO）对应硬件中的一个子模块，驱动需要配置大量寄存器来让数据正确流过整个管线。',
          },
          codeWalk: {
            title: 'dc_commit_state — 显示状态提交的核心流程',
            file: 'drivers/gpu/drm/amd/display/dc/core/dc.c',
            language: 'c',
            code: `/* dc_commit_state() — 将新的显示状态提交到硬件
 * 当用户空间请求改变分辨率、刷新率、HDR 模式等时调用
 * 这是 DC 子系统中最核心的函数
 */
enum dc_status dc_commit_state(struct dc *dc,
                                struct dc_state *context)
{
    enum dc_status result;

    /* 阶段 1: 验证新状态是否可行
     * 检查带宽是否足够、时序是否兼容、管线资源是否充足
     */
    result = dc_validate_global_state(dc, context);
    if (result != DC_OK) {
        /* 如果新状态不可行（如带宽不足），返回错误
         * 用户空间需要降低要求（如降低分辨率）
         */
        return result;
    }

    /* 阶段 2: 计算所有管线参数
     * DML (Display Mode Library) 计算每个管线阶段的水印值
     * 水印决定了何时从内存预取数据以避免 underflow
     */
    dc->res_pool->funcs->calculate_wm_and_dlg(dc, context);

    /* 阶段 3: 对比新旧状态，确定需要更新的管线阶段 */
    dc_resource_state_copy_construct(dc->current_state,
                                      context);

    /* 阶段 4: 编程硬件
     * 按顺序配置每个管线阶段的寄存器
     */
    for (i = 0; i < context->stream_count; i++) {
        struct dc_stream_state *stream = context->streams[i];

        /* 配置 OPTC — 设置时序（分辨率、刷新率）*/
        dc->hwss.setup_stream_encoder(stream);

        /* 配置 DIO — 设置输出链路（DP/HDMI）*/
        dc->hwss.enable_stream(stream);
    }

    for (i = 0; i < context->plane_count; i++) {
        /* 配置 HUBP — 设置 framebuffer 地址和格式 */
        dc->hwss.update_plane_addr(dc, context->planes[i]);

        /* 配置 DPP — 设置缩放、色彩变换 */
        dc->hwss.program_pipe(dc, context->planes[i]);
    }

    /* 阶段 5: 等待 VBlank 然后切换 —— 避免画面撕裂 */
    dc->hwss.wait_for_mpcc_disconnect(dc, context);

    dc->current_state = context;
    return DC_OK;
}`,
            annotations: [
              'dc_validate_global_state 调用 DML 验证带宽——确保所有显示器的数据量不超过内存带宽',
              'DML (Display Mode Library) 是 AMD 的带宽计算库，水印值防止显示 underflow（黑屏/闪烁）',
              'dc->hwss 是硬件序列化层（Hardware Sequencer），封装了硬件相关的寄存器编程',
              'stream 对应一个显示输出（如 DP-1），plane 对应一个显示图层（如桌面、视频叠加）',
              'wait_for_mpcc_disconnect 在 VBlank 期间切换管线配置，避免可见的画面撕裂',
              'DC_OK 以外的返回值（如 DC_FAIL_BANDWIDTH）需要用户空间处理（降低要求或报告错误）',
            ],
            explanation: '每次你拖动窗口、改变分辨率或启用 HDR 时，这个函数都在幕后执行。它协调了 DCN 管线中所有硬件单元的寄存器配置。DML 的带宽计算是最复杂的部分——它需要考虑 VRAM 带宽、内存时序、管线延迟等几十个参数来确保显示不会出现 underflow。',
          },
          miniLab: {
            title: '查看你的显示器连接信息和 DC 状态',
            objective: '通过 sysfs 和 debugfs 观察 DC 管理的显示器连接状态、当前时序和管线配置。',
            steps: [
              '查看所有连接器状态：for c in /sys/class/drm/card0-*; do echo "$(basename $c): $(cat $c/status 2>/dev/null)"; done',
              '查看当前显示模式（分辨率和刷新率）：cat /sys/class/drm/card0-DP-1/modes | head -5',
              '查看 EDID 信息：sudo cat /sys/class/drm/card0-DP-1/edid | edid-decode 2>/dev/null || echo "安装 edid-decode: sudo apt install edid-decode"',
              '查看 DC 状态：sudo cat /sys/kernel/debug/dri/0/amdgpu_dm_dtn_log 2>/dev/null | head -50',
              '检查 FreeSync 状态：cat /sys/class/drm/card0-DP-1/vrr_capable 2>/dev/null',
              '查看 GPU 显示相关 dmesg：dmesg | grep -i "connector\\|display\\|dc\\|hdmi\\|dp-\\|freesync"',
            ],
            expectedOutput: `$ for c in /sys/class/drm/card0-*; do echo "$(basename $c): $(cat $c/status)"; done
card0-DP-1: connected         ← DisplayPort 已连接
card0-DP-2: disconnected
card0-HDMI-A-1: disconnected

$ cat /sys/class/drm/card0-DP-1/modes | head -3
2560x1440     ← 当前显示器的首选分辨率
1920x1080
1280x720

$ cat /sys/class/drm/card0-DP-1/vrr_capable
1             ← 显示器支持 FreeSync/VRR`,
            hint: '连接器名称（DP-1、HDMI-A-1）取决于你的物理连接。如果使用 HDMI 连接，将命令中的 DP-1 替换为 HDMI-A-1。amdgpu_dm_dtn_log 需要内核编译时启用 CONFIG_DEBUG_FS。',
          },
          debugExercise: {
            title: '显示闪烁：错误的时序配置',
            language: 'c',
            description: '用户报告显示器间歇性闪烁（黑屏 1 秒然后恢复）。以下是 DC 的 dmesg 输出和关键状态。',
            question: '根据日志信息判断闪烁的根本原因。是时序问题、带宽问题还是链路问题？',
            buggyCode: `/* dmesg 中的关键信息 */
[  120.456] [drm] DC: pipe 0 underflow detected!
[  120.456] [drm] DC: HUBP0 urgent watermark exceeded
[  120.457] [drm] DC: stream 0: 2560x1440@165Hz
[  120.457] [drm] DC: active plane count: 3
            (desktop + video overlay + cursor)
[  120.458] [drm] DC: DRAM bandwidth: 38.4 GB/s required,
            36.8 GB/s available

/* debugfs amdgpu_dm_dtn_log 片段 */
HUBP0: req_per_sec=4200000  prefetch_bw=37.2 GB/s
DPP0: scl_enable=1  ratio_h=2.0  ratio_v=2.0
OPTC0: vtotal=1500  vactive=1440  hsync=60`,
            hint: 'underflow 意味着 HUBP 从内存读取像素数据的速度跟不上显示器消耗的速度。注意 required vs available 带宽。',
            answer: '根因是内存带宽不足导致的显示 underflow。分析：（1）"HUBP0 urgent watermark exceeded" + "pipe 0 underflow detected" 直接表明 HUBP 无法从内存中足够快地读取像素数据。（2）带宽数据确认：需要 38.4 GB/s 但只有 36.8 GB/s 可用——差值 1.6 GB/s 导致间歇性 underflow。（3）加剧因素：2560x1440@165Hz 是高带宽需求（约 2560*1440*4*165 = 2.27 GB/s 单流），加上 3 个活跃平面（桌面+视频叠加+光标）和 DPP 的 2x 缩放（ratio_h=2.0 使带宽需求翻倍），总需求超出可用带宽。解决方案：（a）降低刷新率到 144Hz 或 120Hz 减少带宽需求；（b）关闭视频叠加（减少一个活跃平面）；（c）检查 DML 水印计算是否有 bug——DML 应该在 validate 阶段就拒绝这个配置而不是让 underflow 发生；（d）提高内存时钟（如果 pp_dpm_mclk 显示不在最高档）。这是一个典型的 DML 水印计算 bug——correct fix 是修复 DML 的带宽估算，使其在 validate 阶段返回 DC_FAIL_BANDWIDTH。',
          },
          interviewQ: {
            question: '解释 AMD Display Core (DC) 的架构。为什么 AMD 选择从 Windows 移植 DC 而不是用 DRM KMS 的通用实现？',
            difficulty: 'hard',
            hint: '从架构分层（DC Core + DCN HW）、功能需求（FreeSync、HDR、多显示器）和代码复用（Windows/Linux 共享）的角度分析。',
            answer: 'DC 架构分为三层：（1）DRM KMS 适配层（amdgpu_dm.c）：将 DRM 的 atomic commit API 翻译为 DC 的内部 API；（2）DC 核心层（display/dc/core/）：硬件无关的显示逻辑，包括状态验证、带宽计算（DML）、管线资源分配；（3）DCN 硬件层（display/dc/dcn32/ 等）：具体硬件的寄存器编程，每代 DCN 有自己的目录。AMD 选择移植 DC 而非使用纯 DRM KMS 的原因：（1）功能复杂度——AMD 的显示硬件支持 FreeSync/VRR、HDR、PSR（Panel Self Refresh）、DSC（Display Stream Compression）、MST（Multi-Stream Transport）等大量高级特性，DRM KMS 的通用实现不支持这些；（2）代码复用——DC 核心层在 Windows 和 Linux 驱动之间共享，AMD 只需要维护一份显示逻辑，而不是维护两套不同的实现；（3）硬件验证——DC 经过了 AMD 内部的大量 Windows 测试验证，移植到 Linux 比从头实现风险更小；（4）DML 复杂度——Display Mode Library 的带宽计算涉及数百个参数和复杂的数学模型，这部分代码不可能在 DRM KMS 的通用框架中实现。代价是 DC 的代码风格与内核不一致，维护成本较高。',
            amdContext: 'DC 是 AMD 显示团队的核心工作。面试中展示你理解 DC 为什么存在（功能需求 + 代码复用）以及它与 DRM KMS 的关系，比只会背诵管线阶段更有价值。',
          },
        },

        // ── Lesson 5.3.2 ──────────────────────────────────────
        {
          id: '5-3-2',
          number: '5.3.2',
          title: '电源管理：SMU 与 DVFS',
          titleEn: 'Power Management: SMU & DVFS',
          duration: 20,
          difficulty: 'expert',
          tags: ['power-management', 'SMU', 'DVFS', 'pp_dpm_sclk', 'thermal', 'sysfs'],
          concept: {
            summary: 'GPU 电源管理通过 SMU（System Management Unit）固件实现 DVFS（Dynamic Voltage Frequency Scaling）——根据工作负载动态调整 GPU 的时钟频率和电压。amdgpu 驱动通过消息接口与 SMU 固件通信，用户空间通过 sysfs 接口（pp_dpm_sclk/mclk）查看和控制 GPU 的功耗/性能配置。',
            explanation: [
              'SMU（System Management Unit）是 GPU 内部的一个独立处理器，运行 AMD 的闭源固件。它的核心职责是电源管理——控制 GPU 的时钟频率（clock）、电压（voltage）、功耗限制（power limit）和风扇转速。SMU 做这些决策不需要主 CPU 参与——它实时监控 GPU 温度、功耗和工作负载，自动调整频率和电压以在性能和功耗之间取得平衡。',
              'DVFS（Dynamic Voltage Frequency Scaling）是 SMU 的核心机制。GPU 有多个 DPM（Dynamic Power Management）等级，每个等级对应一组频率-电压对。例如 RX 7600 XT 的 GPU 核心（SCLK）可能有：300MHz@0.7V（空闲）、1200MHz@0.85V（轻负载）、2100MHz@1.0V（中负载）、2595MHz@1.15V（满载）。SMU 根据当前负载在这些等级之间切换——你打开一个游戏，频率在几毫秒内从 300MHz 跳到 2595MHz；关闭游戏后又降回 300MHz。',
              'amdgpu 驱动通过 PPSMC（PowerPlay SMC）消息与 SMU 通信。驱动将消息写入特定的 MMIO 寄存器（MP1_SMN_C2PMSG 系列），等待 SMU 处理并返回结果。关键消息包括：SetSoftMaxGfxClk（设置最大 GFX 频率）、SetHardMinGfxClk（设置最低 GFX 频率）、SetPowerLimit（设置功耗限制）、GetGfxClkFrequency（获取当前频率）。驱动代码在 pm/swsmu/ 下，smu_v13_0.c 是 RDNA3 的 SMU 实现。',
              'Linux 用户通过 sysfs 接口与电源管理交互。pp_dpm_sclk 显示/设置 GPU 核心频率等级，pp_dpm_mclk 显示/设置内存频率等级，power_dpm_force_performance_level 设置性能模式（auto/high/low/manual）。在 manual 模式下，你可以通过写入 pp_dpm_sclk 来锁定 GPU 到特定频率——这在性能调试时很有用。thermal throttling（热保护降频）是 SMU 自动执行的——当 GPU 温度超过阈值（通常 100°C），SMU 会降低频率以减少发热。',
            ],
            keyPoints: [
              'SMU 是 GPU 内部独立处理器，运行闭源固件，实时管理电源/频率/温度',
              'DVFS 核心机制：多个 DPM 等级，每个等级 = 频率 + 电压对',
              'amdgpu 通过 PPSMC 消息（MMIO 寄存器）与 SMU 通信',
              'sysfs 接口：pp_dpm_sclk（GPU 频率）、pp_dpm_mclk（显存频率）',
              'power_dpm_force_performance_level：auto/high/low/manual 四种模式',
              'Thermal throttling：温度超过阈值时 SMU 自动降频，驱动监控但不直接控制',
            ],
          },
          diagram: {
            title: 'GPU 电源管理架构与 DVFS',
            content: `GPU 电源管理架构

用户空间 sysfs 接口
┌────────────────────────────────────────────────────────┐
│ /sys/class/drm/card0/device/                           │
│                                                        │
│ pp_dpm_sclk          GPU 核心频率等级                  │
│   0: 300Mhz                                            │
│   1: 800Mhz                                            │
│   2: 2100Mhz                                           │
│   3: 2595Mhz *      (* = 当前等级)                     │
│                                                        │
│ pp_dpm_mclk          显存频率等级                      │
│   0: 96Mhz                                             │
│   1: 1188Mhz *                                         │
│                                                        │
│ power_dpm_force_performance_level                      │
│   auto / high / low / manual                           │
│                                                        │
│ hwmon/hwmon*/                                          │
│   temp1_input        GPU 温度 (毫摄氏度)               │
│   power1_average     平均功耗 (微瓦)                   │
│   fan1_input         风扇转速 (RPM)                    │
└────────────────────────────┬───────────────────────────┘
                             │ sysfs read/write
═════════════════════════════│═══════════════════════════
                             │
内核空间（amdgpu 驱动 pm/swsmu/）
┌────────────────────────────▼───────────────────────────┐
│  smu_set_performance_level()                           │
│  smu_get_current_clocks()                              │
│  smu_set_fan_speed_rpm()                               │
│       │                                                │
│       ▼                                                │
│  smu_cmn_send_smc_msg()                               │
│  ┌─────────────────────────────────────────┐           │
│  │ 写入 PPSMC 消息到 MMIO 寄存器:          │           │
│  │ WREG32(MP1_SMN_C2PMSG_66, msg_id);     │           │
│  │ WREG32(MP1_SMN_C2PMSG_82, param);      │           │
│  │ WREG32(MP1_SMN_C2PMSG_90, 0x1); /*go*/ │           │
│  │                                          │           │
│  │ 等待 SMU 响应:                           │           │
│  │ while (RREG32(MP1_SMN_C2PMSG_90) != 1)  │           │
│  │     usleep_range(10, 20);               │           │
│  └─────────────────────────────────────────┘           │
└────────────────────────────┬───────────────────────────┘
                             │ MMIO 消息
GPU 硬件                     ▼
┌─────────────────────────────────────────────────────────┐
│  SMU (System Management Unit)                           │
│  ┌────────────────────────────────────────────┐        │
│  │ 独立处理器，运行 AMD 闭源固件               │        │
│  │                                             │        │
│  │ 输入:                                       │        │
│  │   · GPU 温度传感器 (Tdie, Tjunction)        │        │
│  │   · 功耗传感器 (Telemetry)                  │        │
│  │   · 工作负载检测 (activity %)               │        │
│  │   · 驱动消息 (PPSMC)                        │        │
│  │                                             │        │
│  │ 决策: DVFS (频率-电压调整)                  │        │
│  │                                             │        │
│  │   空闲     轻负载    中负载     满载         │        │
│  │   300MHz   800MHz   2100MHz   2595MHz       │        │
│  │   0.7V     0.85V    1.0V      1.15V         │        │
│  │   ~5W      ~30W     ~80W      ~150W         │        │
│  │   ▲                                 ▲       │        │
│  │   │  ← SMU 自动调整 →              │       │        │
│  │                                             │        │
│  │ 保护: 热保护降频 (>100°C → 强制降频)        │        │
│  └────────────────────────────────────────────┘        │
│                                                         │
│  输出:                                                  │
│  · 设置 PLL 频率 (GFX clock, Memory clock)              │
│  · 设置电压调节器 (Voltage Regulator)                    │
│  · 控制风扇 PWM                                         │
└─────────────────────────────────────────────────────────┘`,
            caption: 'GPU 电源管理的完整架构。用户空间通过 sysfs 接口交互，驱动通过 PPSMC 消息与 SMU 通信，SMU 实时执行 DVFS 决策。SMU 固件虽然闭源，但驱动-SMU 的消息接口是完全开源的。',
          },
          codeWalk: {
            title: 'smu_set_performance_level — 设置 GPU 性能级别',
            file: 'drivers/gpu/drm/amd/pm/swsmu/amdgpu_smu.c',
            language: 'c',
            code: `/* smu_set_performance_level() — 设置 GPU 性能模式
 * 由 sysfs power_dpm_force_performance_level 写入触发
 */
int smu_set_performance_level(struct smu_context *smu,
    enum amd_dpm_forced_level level)
{
    int ret = 0;

    switch (level) {
    case AMD_DPM_FORCED_LEVEL_HIGH:
        /* 强制 GPU 使用最高频率
         * 用于基准测试或调试 */
        ret = smu_force_clk_levels(smu, SMU_SCLK,
            1 << smu->smu_table.max_sclk_dpm_level);
        ret = smu_force_clk_levels(smu, SMU_MCLK,
            1 << smu->smu_table.max_mclk_dpm_level);
        break;

    case AMD_DPM_FORCED_LEVEL_LOW:
        /* 强制 GPU 使用最低频率
         * 用于省电或热调试 */
        ret = smu_force_clk_levels(smu, SMU_SCLK, 1 << 0);
        ret = smu_force_clk_levels(smu, SMU_MCLK, 1 << 0);
        break;

    case AMD_DPM_FORCED_LEVEL_AUTO:
        /* 恢复 SMU 自动管理（默认模式）
         * SMU 根据负载自主决定频率 */
        ret = smu_unforce_dpm_levels(smu);
        break;

    case AMD_DPM_FORCED_LEVEL_MANUAL:
        /* 手动模式：允许用户通过 pp_dpm_sclk
         * 选择特定的 DPM 等级 */
        break;
    }

    smu->dpm_level = level;
    return ret;
}

/* smu_force_clk_levels — 通过 PPSMC 消息锁定频率 */
static int smu_force_clk_levels(struct smu_context *smu,
    enum smu_clk_type clk_type, uint32_t mask)
{
    /* 调用具体 SMU 版本的实现
     * 对于 RDNA3 → smu_v13_0_force_clk_levels */
    return smu->ppt_funcs->force_clk_levels(smu,
                                              clk_type, mask);
}

/* smu_cmn_send_smc_msg — 向 SMU 发送消息的底层函数 */
int smu_cmn_send_smc_msg(struct smu_context *smu,
    enum smu_message_type msg, uint32_t *resp)
{
    struct amdgpu_device *adev = smu->adev;

    /* 写入消息参数 */
    WREG32(smu->msg_arg_reg, param);

    /* 写入消息 ID — SMU 开始处理 */
    WREG32(smu->msg_reg, msg);

    /* 轮询等待 SMU 响应 */
    ret = smu_cmn_wait_for_response(smu);
    /* SMU 通常在 <1ms 内响应 */

    if (resp)
        *resp = RREG32(smu->resp_reg);

    return ret;
}`,
            annotations: [
              'AMD_DPM_FORCED_LEVEL_HIGH 用 bitmask 选择最高 DPM 等级，适合基准测试',
              'AMD_DPM_FORCED_LEVEL_AUTO 是默认模式——SMU 完全自主管理频率/电压',
              'smu->ppt_funcs 是 SMU 版本特定的函数表（Power Play Table），类似 IP Block 的接口抽象',
              'WREG32(msg_reg, msg) 是触发 SMU 处理的关键——SMU 监控此寄存器的写入',
              'smu_cmn_wait_for_response 轮询 SMU 响应寄存器，超时时间通常为 10ms',
              '闭源 SMU 固件的行为通过消息接口间接控制——驱动不能直接操作 PLL 或电压调节器',
            ],
            explanation: '这段代码展示了驱动如何控制 GPU 的功耗/性能配置。当你在终端执行 echo high > /sys/class/drm/card0/device/power_dpm_force_performance_level 时，最终调用的就是这个函数。理解 SMU 消息接口是理解 GPU 电源管理的关键——虽然 SMU 固件闭源，但消息接口的语义是完全开源的。',
          },
          miniLab: {
            title: '监控和控制 GPU 时钟频率',
            objective: '使用 sysfs 接口实时监控 GPU 频率变化，并体验手动控制 GPU 性能级别。',
            setup: '# 确保你有 root 权限\n# 确保有 GPU 工作负载工具\nsudo apt install -y mesa-utils glmark2',
            steps: [
              '查看当前 GPU 核心频率等级：cat /sys/class/drm/card0/device/pp_dpm_sclk',
              '查看当前显存频率等级：cat /sys/class/drm/card0/device/pp_dpm_mclk',
              '启动实时监控（在新终端中）：watch -n 0.5 cat /sys/class/drm/card0/device/pp_dpm_sclk（观察频率档位变化，* 标记当前频率）',
              '在另一个终端运行 GPU 负载：glmark2（观察监控中频率从空闲跳到高档）',
              '测试手动锁定高频：echo high | sudo tee /sys/class/drm/card0/device/power_dpm_force_performance_level',
              '恢复自动模式：echo auto | sudo tee /sys/class/drm/card0/device/power_dpm_force_performance_level',
            ],
            expectedOutput: `$ cat /sys/class/drm/card0/device/pp_dpm_sclk
0: 300Mhz
1: 800Mhz
2: 2100Mhz
3: 2595Mhz *    ← 正在运行 GPU 负载时会在最高档

空闲时:
0: 300Mhz *     ← 回到最低频率
1: 800Mhz
2: 2100Mhz
3: 2595Mhz

温度和功耗变化:
  空闲: ~40°C, ~8W
  满载: ~75°C, ~130W`,
            hint: '修改 power_dpm_force_performance_level 需要 root 权限。小心 echo high 会让 GPU 持续全速运行增加功耗和温度，实验完记得恢复 auto 模式。如果 hwmon 路径不对，用 ls /sys/class/drm/card0/device/hwmon/ 找到正确编号。',
          },
          debugExercise: {
            title: 'GPU 频率锁定在低档',
            language: 'text',
            description: '用户报告游戏帧率异常低，GPU 负载 100% 但频率始终停留在最低档。',
            question: '根据以下诊断信息，找出 GPU 频率无法提升的根本原因。',
            buggyCode: `/* 用户报告的现象 */
glxgears: ~60 FPS (正常应该 300+ FPS)
GPU utilization: 100%

/* sysfs 输出 */
$ cat pp_dpm_sclk
0: 300Mhz *       ← 始终在最低频率!
1: 800Mhz
2: 2100Mhz
3: 2595Mhz

$ cat power_dpm_force_performance_level
manual             ← 注意这里!

$ cat pp_dpm_mclk
0: 96Mhz *         ← 显存也在最低频率
1: 1188Mhz

/* GPU 温度和功耗 */
temp1_input: 42000  (42°C — 很凉)
power1_average: 8500000  (8.5W — 几乎是空闲功耗)

/* dmesg 无异常错误 */`,
            hint: '注意 power_dpm_force_performance_level 的值。manual 模式下 SMU 不会自动调频。',
            answer: '根因：power_dpm_force_performance_level 被设置为 "manual" 模式，且 pp_dpm_sclk 选中了最低档（0: 300MHz）。在 manual 模式下，SMU 不执行自动 DVFS——它严格遵守用户选择的 DPM 等级。由于只选中了等级 0（300MHz），GPU 被锁定在最低频率。温度（42°C）和功耗（8.5W）异常低进一步确认了这一点——满载 GPU 应该在 75°C+ 和 100W+。解决方案：（1）最简单的修复：echo auto | sudo tee /sys/class/drm/card0/device/power_dpm_force_performance_level——恢复 SMU 自动管理。（2）如果需要保持 manual 模式，手动启用高频等级：echo "0 1 2 3" | sudo tee /sys/class/drm/card0/device/pp_dpm_sclk——允许 SMU 在所有等级间切换。这个问题通常是用户之前做了性能调优实验后忘记恢复设置，或者某个 GPU 调优脚本设置了 manual 模式。在 bug 报告中，检查 power_dpm_force_performance_level 应该是诊断性能问题的标准步骤。',
          },
          interviewQ: {
            question: '描述 amdgpu 的电源管理架构。驱动如何与 SMU 固件交互？DVFS 是如何工作的？',
            difficulty: 'hard',
            hint: '从三层架构（sysfs → 驱动 pm/swsmu → SMU 固件）和 PPSMC 消息机制的角度描述。',
            answer: 'amdgpu 电源管理架构分为三层：（1）用户接口层——通过 sysfs 暴露 pp_dpm_sclk（GPU 频率）、pp_dpm_mclk（内存频率）、power_dpm_force_performance_level（性能模式）、hwmon（温度/功耗/风扇）等接口；（2）驱动层——pm/swsmu/ 下的代码实现了 SMU 通信框架，amdgpu_smu.c 是通用接口，smu_v13_0.c 是 RDNA3 具体实现。驱动通过 Power Play Table（PPT）数据结构描述 GPU 支持的 DPM 等级表，并通过 smu->ppt_funcs 接口抽象不同 SMU 版本的差异；（3）SMU 固件层——运行在 GPU 内部独立处理器上的闭源固件，接收驱动的 PPSMC 消息（通过 MMIO 寄存器 MP1_SMN_C2PMSG 系列），实时执行 DVFS 决策。消息交互流程：驱动写入参数到 C2PMSG_82 → 写入消息 ID 到 C2PMSG_66 → 写入触发到 C2PMSG_90 → 轮询 C2PMSG_90 等待响应 → 读取结果。DVFS 工作原理：SMU 维护 DPM 等级表（频率-电压对），根据 GPU activity（工作负载百分比）、温度、功耗限制三个因素动态选择等级。负载增加 → 提升频率/电压；温度超限 → 强制降频（thermal throttling）；功耗超限 → 限制频率（power throttling）。SMU 的决策周期约 1-10ms，远快于驱动干预。',
            amdContext: 'SMU 和电源管理是 AMD 面试中的重要话题，尤其是 PM 团队。展示你理解闭源 SMU 固件通过消息接口被开源驱动控制的架构，以及 DVFS 的输入因素（负载、温度、功耗）。',
          },
        },
      ],
    },

    // ════════════════════════════════════════════════════════════
    // Group 5.4: Advanced Subsystems
    // ════════════════════════════════════════════════════════════
    {
      id: '5-4',
      number: '5.4',
      title: '高级子系统深入',
      titleEn: 'Advanced Subsystems',
      icon: '🔬',
      description: '深入三个关键子系统：Display Core 的独立王国架构与 DML 带宽计算、DRM GPU Scheduler 的命令调度机制、以及 GPU 虚拟内存（GPUVM）的多级页表系统——这些是 amdgpu 驱动中 bug 密度最高、面试频率最高的核心模块。',
      lessons: [
        // ── Lesson 5.4.1 ──────────────────────────────────────
        {
          id: '5-4-1',
          number: '5.4.1',
          title: 'Display Core 深入：dc_state、DML 与 DC 的独立王国',
          titleEn: 'Display Core Deep Dive: dc_state, DML and DC\'s Independent Kingdom',
          duration: 20,
          difficulty: 'expert',
          tags: ['display-core', 'dc_state', 'DML', 'dc_stream', 'dc_plane', 'bandwidth', 'amdgpu_dm'],
          concept: {
            summary: 'DC（Display Core）占 amdgpu 代码量的约 40%，拥有驱动中最高的 bug 密度。它不只是一个显示子系统——它是一个从 Windows 驱动移植过来的独立王国，拥有自己的类型系统（dc_stream、dc_plane）、自己的状态验证（dc_validate_state）、自己的内存模型和错误处理，与 Linux DRM/KMS 框架几乎是"翻译"关系而非"集成"关系。',
            explanation: [
              'DC 作为独立抽象层的历史根源：DC 最初是 AMD Windows 驱动中的显示引擎，使用 C 语言的面向对象风格编写（大量的 vtable、抽象接口、构造/析构模式）。2017 年移植到 Linux 时，AMD 选择保持 DC 的独立性而非重写为 DRM/KMS 原生风格——原因是 DC 的复杂度（160 万行代码）使得重写不现实，且 AMD 需要 Windows 和 Linux 共享同一份显示核心代码。这意味着 DC 有自己的内存分配包装、自己的日志系统、甚至自己的数学库（定点数运算用于 DML），与内核的其他子系统形成了风格上的鲜明对比。',
              'dc_state 提交流程是 DC 的核心工作路径。当用户空间请求改变显示配置时（如切换分辨率、启用 HDR），完整的提交流程为：dc_validate_state()（验证新配置是否在硬件能力范围内——检查管线资源数量、带宽限制、时序兼容性）→ DML 带宽计算（Display Mode Library 计算每个管线阶段的水印值，确保数据流不会 underflow）→ dc_commit_state()（将验证通过的配置编程到硬件寄存器，在 VBlank 期间切换以避免撕裂）。任何一步失败都会阻止配置生效，向用户空间返回错误。',
              'DML（Display Mode Library）是 DC 中最复杂、最容易出 bug 的子模块。DML 本质上是一个带宽/延迟计算框架——给定显示配置（分辨率、刷新率、像素格式、缩放比例、活跃平面数），DML 计算出所有管线阶段需要的内存带宽，并与可用带宽比较。如果需求超出可用带宽，DML 会拒绝该配置（返回 DC_FAIL_BANDWIDTH）。DML 还计算"水印值"（watermark）——HUBP 必须在像素被显示器消耗之前多久开始从内存预取数据。水印计算错误会导致显示 underflow（HUBP 来不及读取数据，屏幕出现黑线或闪烁），这是 DC 中最常见的 bug 类型。',
              'DC 拥有完全独立于 DRM/KMS 的类型系统。DRM 使用 drm_crtc、drm_connector、drm_plane；DC 使用 dc_stream（对应一个显示输出流）、dc_plane（对应一个显示图层）、dc_sink（对应一个显示设备）。amdgpu_dm.c 是连接这两个世界的"翻译层"——它将 drm_atomic_state 转换为 dc_state，将 drm_crtc_state 映射到 dc_stream_state，将 drm_plane_state 映射到 dc_plane_state。这种双重抽象增加了复杂性，但也使得 DC 核心完全不依赖 Linux 内核 API，可以在 Windows 和 Linux 之间共享。',
              'DC 的错误处理独立于内核。DC 内部使用自己的错误枚举（enum dc_status：DC_OK、DC_FAIL_BANDWIDTH、DC_FAIL_RESOURCES 等），而非 Linux 标准的 errno（-EINVAL、-ENOMEM 等）。amdgpu_dm.c 负责将 DC 错误码翻译为 DRM/KMS 期望的错误码。DC 内部的日志也使用自定义的 DC_LOG_* 宏而非内核的 pr_info/dev_err。理解这种独立性对于调试 DC 问题至关重要——你需要同时在 DRM 层（dmesg 中的 [drm] 前缀）和 DC 层（[drm] DC: 前缀）查找信息。',
            ],
            keyPoints: [
              'DC 是从 Windows 驱动移植的独立抽象层，占 amdgpu 约 40% 代码量，bug 密度最高',
              'dc_state 提交流程：dc_validate_state → DML 带宽计算 → dc_commit_state → 硬件编程',
              'DML（Display Mode Library）：带宽/延迟计算框架，水印错误导致 underflow 是最常见 bug',
              'DC 独立类型系统：dc_stream/dc_plane/dc_sink，与 DRM 的 drm_crtc/drm_plane 是翻译关系',
              'amdgpu_dm.c 是 DRM/KMS 和 DC 之间的适配器层，负责类型转换和错误码翻译',
              'DC 独立错误处理：enum dc_status（DC_OK/DC_FAIL_BANDWIDTH）而非 Linux errno',
            ],
          },
          diagram: {
            title: 'DC 独立王国架构与 dc_state 提交流程',
            content: `DC "独立王国" 架构 — DRM/KMS 与 DC 的翻译关系

用户空间 (GNOME/KDE/Wayland Compositor)
  │ drmModeAtomicCommit()
  ▼
┌──────────────────────────────────────────────────────────────┐
│  DRM Atomic KMS 框架 (drivers/gpu/drm/drm_atomic.c)         │
│                                                              │
│  drm_atomic_state  ─── drm_crtc_state                       │
│                    ─── drm_connector_state                   │
│                    ─── drm_plane_state                       │
└──────────────────────────────┬───────────────────────────────┘
                               │
                               ▼ "翻译层"
┌──────────────────────────────────────────────────────────────┐
│  amdgpu_dm.c — DRM ←→ DC 适配器层                           │
│                                                              │
│  drm_crtc_state ──────→ dc_stream_state (分辨率/刷新率/HDR) │
│  drm_plane_state ─────→ dc_plane_state  (图层/framebuffer)  │
│  drm_connector_state ─→ dc_sink         (显示设备)          │
│  errno (-EINVAL) ◄────── dc_status (DC_FAIL_BANDWIDTH)      │
│                                                              │
│  amdgpu_dm_atomic_commit() → dc_commit_state()              │
└──────────────────────────────┬───────────────────────────────┘
                               │
                               ▼ DC 内部（独立王国）
┌──────────────────────────────────────────────────────────────┐
│  DC Core (display/dc/core/)                                  │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  dc_state 提交流程:                                     │ │
│  │                                                          │ │
│  │  1. dc_validate_state(dc, new_state)                    │ │
│  │     ├─ 检查管线资源（pipe 数量够不够？）                │ │
│  │     ├─ 检查时序兼容性                                   │ │
│  │     └─ 调用 DML 带宽验证                                │ │
│  │         │                                                │ │
│  │  2. DML (Display Mode Library)                          │ │
│  │     ├─ 计算总带宽需求 (分辨率×刷新率×BPP×平面数)       │ │
│  │     ├─ 计算水印值 (urgent/pstate/dram_clk_change)       │ │
│  │     ├─ 带宽需求 > 可用带宽? → DC_FAIL_BANDWIDTH        │ │
│  │     └─ 水印值 → HUBP/DPP 寄存器配置                    │ │
│  │         │                                                │ │
│  │  3. dc_commit_state(dc, validated_state)                │ │
│  │     ├─ 等待 VBlank（避免撕裂）                          │ │
│  │     ├─ 编程 HUBP 寄存器（framebuffer 地址）             │ │
│  │     ├─ 编程 DPP 寄存器（缩放/色彩）                     │ │
│  │     ├─ 编程 OPTC 寄存器（时序/VRR）                     │ │
│  │     └─ 编程 DIO 寄存器（DP/HDMI 输出）                  │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                              │
│  DC 的独立设施:                                              │
│  · 自有类型: dc_stream, dc_plane, dc_sink (≠ DRM 类型)     │
│  · 自有错误码: enum dc_status (DC_OK, DC_FAIL_*)           │
│  · 自有日志: DC_LOG_WARNING, DC_LOG_DC (≠ pr_info/dev_err) │
│  · 自有内存: dc_create_*() / dc_destroy_*()               │
│  · 自有数学库: 定点数运算 (DML 用，避免浮点)               │
└──────────────────────────────────────────────────────────────┘`,
            caption: 'DC 作为独立王国的架构全景。amdgpu_dm.c 是唯一连接 DRM/KMS 世界和 DC 世界的桥梁。DC 内部拥有完全独立的类型系统、错误处理、日志系统和内存管理——这来自于其 Windows 驱动的历史遗产。',
          },
          codeWalk: {
            title: 'dc_commit_state — 验证 → 带宽检查 → 硬件编程序列',
            file: 'drivers/gpu/drm/amd/display/dc/core/dc.c',
            language: 'c',
            code: `/* dc_commit_state() — DC 的核心状态提交函数
 * 完整流程: 验证 → DML 带宽计算 → 硬件编程
 * 从 amdgpu_dm.c 的 amdgpu_dm_atomic_commit_tail() 调用
 */
enum dc_status dc_commit_state(struct dc *dc,
                                struct dc_state *context)
{
    enum dc_status result;
    int i;

    /* 阶段 1: 全局状态验证
     * 检查: 管线资源是否足够? 时序是否冲突?
     * 内部调用 DML 进行带宽验证 */
    result = dc_validate_global_state(dc, context);
    if (result != DC_OK) {
        DC_LOG_WARNING("DC: validate failed: %d\\n", result);
        /* DC_FAIL_BANDWIDTH: 带宽不足
         * DC_FAIL_RESOURCES: 管线不够
         * amdgpu_dm.c 翻译为 -EINVAL 返回给 DRM */
        return result;
    }

    /* 阶段 2: DML 水印计算
     * 为每个管线阶段计算 "最晚预取时间"
     * 水印错误 → 显示 underflow (最常见的 DC bug) */
    if (dc->res_pool->funcs->calculate_wm_and_dlg) {
        dc->res_pool->funcs->calculate_wm_and_dlg(
            dc, context, context->res_ctx.pipe_ctx);
        /* urgent_watermark: 紧急预取阈值
         * pstate_watermark: 允许 DRAM 切换时钟的阈值
         * 这些值直接编程到 HUBP 寄存器 */
    }

    /* 阶段 3: 应用管线拆分 (如果需要)
     * 高分辨率/高刷新率可能需要 2 个 pipe 合并处理 */
    dc->hwss.apply_ctx_for_surface(dc, NULL, 0, context);

    /* 阶段 4: 逐 stream 编程硬件
     * dc_stream = 一个显示输出 (如 DP-1 上的 2560x1440) */
    for (i = 0; i < context->stream_count; i++) {
        struct dc_stream_state *stream = context->streams[i];
        struct pipe_ctx *pipe = /* 找到 stream 对应的 pipe */;

        /* 配置 OPTC: 时序信号 (HSync/VSync/VBlank) */
        dc->hwss.setup_stream_encoder(pipe);

        /* 配置 DIO: DP/HDMI 输出编码和链路 */
        dc->hwss.enable_stream(pipe);

        /* 配置 FreeSync/VRR: 动态 VBlank 调整 */
        if (stream->adjust.v_total_min != 0)
            dc->hwss.set_drr(&pipe, 1,
                stream->adjust);
    }

    /* 阶段 5: 逐 plane 编程硬件
     * dc_plane = 一个显示图层 (桌面/视频叠加/光标) */
    for (i = 0; i < context->res_ctx.pipe_count; i++) {
        struct pipe_ctx *pipe = &context->res_ctx.pipe_ctx[i];

        /* 配置 HUBP: framebuffer 地址、tiling 模式 */
        dc->hwss.update_plane_addr(dc, pipe);

        /* 配置 DPP: 缩放比例、色彩空间转换 */
        dc->hwss.program_pipe(dc, pipe, context);
    }

    /* 阶段 6: 在 VBlank 期间完成切换 */
    dc->hwss.wait_for_mpcc_disconnect(dc, context);

    dc->current_state = context;
    return DC_OK;
}`,
            annotations: [
              'dc_validate_global_state 内部调用 DML 的 dml_validate() 进行完整的带宽/延迟计算',
              'DC_FAIL_BANDWIDTH 是最常见的验证失败——多显示器 + 高刷新率时容易触发',
              'calculate_wm_and_dlg 中的 wm = watermark, dlg = display lag——控制 HUBP 的预取时机',
              'dc->hwss (Hardware Sequencer) 是硬件相关操作的 vtable，每代 DCN 有不同实现',
              'stream 和 plane 的分离体现了 DC 的多图层架构：一个 stream 可以有多个 plane',
              'wait_for_mpcc_disconnect 在 VBlank 间隙切换配置，是防止画面撕裂的关键',
            ],
            explanation: '这个函数展示了 DC 的完整工作流：先验证配置是否可行（避免硬件损坏或 underflow），再计算精确的管线参数（水印值），最后按顺序编程硬件寄存器。任何一步失败都会中止并返回 DC 的自有错误码——amdgpu_dm.c 负责将其翻译为 DRM/KMS 期望的 errno。',
          },
          miniLab: {
            title: '追踪 dc_commit_state 的执行路径',
            objective: '使用 ftrace 和 debugfs 观察 dc_commit_state 的真实执行，理解 DML 验证和硬件编程的顺序。',
            setup: `sudo mount -t tracefs nodev /sys/kernel/tracing 2>/dev/null
# 确认 DC debug 输出已启用
sudo sh -c 'echo 0x1 > /sys/module/amdgpu/parameters/dc 2>/dev/null'`,
            steps: [
              '设置 ftrace 追踪 dc_commit_state：echo dc_commit_state > /sys/kernel/tracing/set_ftrace_filter',
              '启用函数图追踪：echo function_graph > /sys/kernel/tracing/current_tracer',
              '开始追踪：echo 1 > /sys/kernel/tracing/tracing_on',
              '触发 dc_commit_state 执行——切换分辨率：xrandr --output DP-1 --mode 1920x1080 && sleep 1 && xrandr --output DP-1 --mode 2560x1440',
              '停止追踪：echo 0 > /sys/kernel/tracing/tracing_on',
              '查看执行序列：cat /sys/kernel/tracing/trace | grep -E "dc_commit|validate|watermark|dml" | head -30',
              '查看 DC 内部状态：sudo cat /sys/kernel/debug/dri/0/amdgpu_dm_dtn_log 2>/dev/null | head -80',
            ],
            expectedOutput: `$ cat /sys/kernel/tracing/trace | grep -E "dc_commit|validate" | head -10
  kworker/0:2-345  =>  dc_commit_state() {
  kworker/0:2-345      dc_validate_global_state() {
  kworker/0:2-345        dml_validate() {
  kworker/0:2-345          ... (DML 带宽计算) ...
  kworker/0:2-345        } /* 2.345 ms */
  kworker/0:2-345      } /* 3.012 ms */
  kworker/0:2-345      ... (硬件编程) ...
  kworker/0:2-345  } /* 8.567 ms */

注意: dc_validate_global_state 耗时较长因为 DML 计算复杂`,
            hint: '需要 root 权限。如果 xrandr 不可用（纯 Wayland），用 wlr-randr 或 gnome-randr 代替。amdgpu_dm_dtn_log 需要内核编译时启用 CONFIG_DEBUG_FS 和 CONFIG_DRM_AMD_DC_DEBUG。',
          },
          debugExercise: {
            title: '显示 underflow：DML 带宽计算失败',
            language: 'c',
            description: '用户在连接两个 4K@60Hz 显示器后，第二个显示器间歇性黑屏 0.5 秒然后恢复。dmesg 和 debugfs 显示以下信息。',
            question: '根据 DML 计算数据和 underflow 报告，诊断根因并提出修复方案。',
            buggyCode: `/* dmesg 输出 */
[  234.567] [drm] DC: dc_validate_state passed  ← 验证居然通过了!
[  234.890] [drm] DC: pipe 1 underflow detected!
[  234.890] [drm] DC: HUBP1 urgent watermark breached
[  234.891] [drm] DC: stream 1: 3840x2160@60Hz 10bpc HDR

/* DML 计算数据 (debugfs amdgpu_dm_dtn_log) */
Stream 0: 3840x2160@60Hz 8bpc  → 需要 15.9 GB/s
Stream 1: 3840x2160@60Hz 10bpc → 需要 19.9 GB/s
Total required: 35.8 GB/s
Available DRAM BW: 36.0 GB/s   ← 仅多 0.2 GB/s 余量!

/* HUBP 水印 (从 dtn_log) */
HUBP1 urgent_watermark: 22.5 us
HUBP1 actual_prefetch:  23.1 us  ← 勉强满足

/* 相关条件 */
GPU 正在运行 3D 游戏（GFX 引擎活跃，抢占内存带宽）`,
            hint: 'dc_validate_state 在静态条件下通过了，但实际运行时 GFX 引擎与显示引擎共享内存带宽。DML 的带宽计算是否考虑了这种竞争？',
            answer: '根因：DML 的带宽计算在验证阶段通过了（36.0 > 35.8 GB/s），但实际余量仅 0.2 GB/s (0.56%)，几乎没有容错空间。当 GFX 引擎运行 3D 游戏时，GPU 内存控制器需要同时服务显示读取和渲染读写——GFX 的内存访问与 DC 的显示读取竞争带宽，导致 HUBP 实际可获得的带宽低于 DML 的静态计算值。具体表现：HUBP1 的 urgent_watermark (22.5us) 与 actual_prefetch (23.1us) 之间仅有 0.6us 余量，GFX 的突发内存访问轻微延迟 HUBP 的预取就触发了 underflow。这是 DML 的经典 bug 模式——DML 假设显示引擎能获得其需要的全部带宽，但未充分考虑与 GFX 引擎的带宽竞争。修复方案：（1）短期——降低 Stream 1 为 8bpc（减少 4 GB/s 带宽需求）或降低刷新率；（2）根本修复——DML 应该预留更大的带宽余量（增加 "bandwidth_margin" 参数），典型的安全余量应该是 10-15% 而非 0.56%；（3）检查内核版本——更新的内核可能已修复此 DML 水印计算的低估问题（搜索 git log --oneline display/dc/dml/ 查看相关补丁）。',
          },
          interviewQ: {
            question: 'Why does amdgpu have its own display abstraction layer (DC) instead of using DRM/KMS directly? What are the trade-offs?',
            difficulty: 'hard',
            hint: '从历史原因（Windows 移植）、技术原因（功能复杂度）、工程原因（代码复用）三个维度分析，并讨论代价。',
            answer: 'AMD 选择使用独立的 DC 层而非直接使用 DRM/KMS 有三方面原因：（1）历史原因——DC 最初是 Windows 驱动的显示引擎，AMD 在 2017 年将其移植到 Linux 时保持了原有架构，因为 160 万行代码的重写成本不可接受；（2）技术原因——AMD 显示硬件支持大量 DRM/KMS 通用框架不支持的高级特性：FreeSync/VRR、HDR tone mapping、DSC（Display Stream Compression）、PSR（Panel Self Refresh）、MST（Multi-Stream Transport）、ABM（Adaptive Backlight Management）等。这些特性需要复杂的带宽计算（DML）和精确的管线资源管理，DRM 通用框架无法提供；（3）工程原因——DC 核心层在 Windows 和 Linux 之间共享，AMD 只需维护一份显示逻辑。当 Windows 端修复了一个 DML 水印 bug，Linux 端可以直接同步这个修复。Trade-offs：（优势）功能完整、Windows/Linux 代码共享、独立验证；（代价）代码风格与内核不一致、amdgpu_dm.c 适配层增加复杂性、DC 独有的类型系统和错误处理增加学习成本、DC 代码量巨大导致编译时间长、DC 的 Windows 风格（如避免浮点/使用定点数）在 Linux 内核中显得异类。尽管有这些代价，DC 模式已被验证是成功的——AMD 是唯一在 Linux 上提供完整 FreeSync/VRR/HDR 支持的 GPU 厂商。',
            amdContext: '这是 AMD Display 团队面试中的经典问题。面试官希望看到你既理解 DC 存在的技术必要性，也能客观评价其代价。特别注意提到 DML 的复杂度——它是 DC 无法被 DRM 通用框架替代的核心原因。',
          },
        },

        // ── Lesson 5.4.2 ──────────────────────────────────────
        {
          id: '5-4-2',
          number: '5.4.2',
          title: 'DRM GPU Scheduler：现代命令提交的核心',
          titleEn: 'DRM GPU Scheduler: Core of Modern Command Submission',
          duration: 20,
          difficulty: 'expert',
          tags: ['drm-scheduler', 'gpu-scheduler', 'drm_sched_job', 'amdgpu_job', 'timeout', 'preemption'],
          concept: {
            summary: 'DRM GPU Scheduler（drm_gpu_scheduler）是 Linux 内核中 GPU 命令调度的核心框架——amdgpu 的每个 Ring Buffer 都有一个独立的调度器实例。它管理 job 的生命周期（init → arm → push → run → complete/timeout），实现多进程公平调度，并提供基于超时的 GPU hang 检测。amdgpu_job 结构体实现了 drm_sched_job 接口，在 run_job 回调中将命令写入 Ring Buffer。',
            explanation: [
              'drm_gpu_scheduler 是 DRM 子系统提供的通用 GPU 调度框架（代码在 drivers/gpu/drm/scheduler/），最初由 AMD 工程师开发并贡献给上游。它为每个硬件队列（在 amdgpu 中就是每个 Ring Buffer）提供一个独立的调度器实例。调度器的核心设计目标是：多进程之间的公平调度（防止一个进程垄断 GPU）、基于优先级的命令排序、以及超时驱动的 GPU hang 检测。amdgpu 为每个 Ring（GFX Ring、SDMA Ring、VCN Ring 等）创建一个 drm_gpu_scheduler 实例。',
              'Job 的完整生命周期包含五个阶段：（1）drm_sched_job_init() — 初始化 job 结构体，关联到对应的调度器实体（drm_sched_entity，代表一个提交源/进程）；（2）drm_sched_job_arm() — "武装" job：分配 fence、记录时间戳，job 准备好被提交；（3）drm_sched_entity_push_job() — 将 job 推入调度实体的队列；（4）调度器线程（kthread）从队列中取出最高优先级的 job，调用 run_job 回调（对 amdgpu 就是 amdgpu_job_run）将命令写入 Ring Buffer；（5）job 完成（fence signal）或超时（timeout 回调）。这个生命周期确保了命令提交的有序性和可追踪性。',
              'amdgpu_job 是 amdgpu 对 drm_sched_job 的扩展实现。amdgpu_job_run() 是最关键的回调——它在调度器线程上下文中执行，将用户提交的 IB（Indirect Buffer）引用写入 Ring Buffer，具体步骤为：amdgpu_ib_schedule() 获取 Ring Buffer 空间 → 写入 INDIRECT_BUFFER PM4 包（指向 IB 的 GPU 虚拟地址）→ 写入 FENCE PM4 包（fence 序列号）→ amdgpu_ring_commit() 更新 WPTR 并写入 Doorbell 通知 GPU。从 amdgpu_cs_submit()（用户提交）到 amdgpu_job_run()（实际写入 Ring）之间可能有延迟——这取决于调度器队列深度和优先级。',
              'Timeout 处理是调度器最重要的安全机制。调度器为每个正在执行的 job 维护一个定时器（通过 delayed_work），默认超时时间由 amdgpu 设置（GFX ring 通常为 10 秒）。如果定时器到期时 job 的 fence 仍未被 signal，说明 GPU 可能 hang 了——调度器调用 timedout_job 回调，amdgpu 实现为 amdgpu_job_timedout()。该函数首先检查 fence 是否刚刚完成（避免误判），然后 dump GPU 寄存器状态（GRBM_STATUS、CP 状态），最后触发 amdgpu_device_gpu_recover() 执行完整的 GPU 复位。GPU 复位后，所有挂起的 job 会被重新提交或标记为失败。',
              '优先级调度：drm_gpu_scheduler 支持多个优先级队列（DRM_SCHED_PRIORITY_KERNEL > HIGH > NORMAL > LOW）。高优先级的 job 会先于低优先级被调度执行。在 amdgpu 中，内核内部操作（如页表更新、GPU 复位后的恢复命令）使用 KERNEL 优先级，普通用户空间渲染使用 NORMAL 优先级。硬件层面，RDNA 系列支持 GFX Ring 级别的抢占（preemption）——高优先级的 GFX job 可以暂停当前正在执行的低优先级 job，完成后再恢复。这对于 VR 场景特别重要（VR 合成器需要高优先级以维持低延迟）。',
            ],
            keyPoints: [
              'drm_gpu_scheduler：DRM 通用 GPU 调度框架，每个 Ring Buffer 一个实例',
              'Job 生命周期：init → arm → push → (调度器线程) → run_job → fence signal / timeout',
              'amdgpu_job_run()：将 IB 引用写入 Ring Buffer，调用 amdgpu_ring_commit() 通知 GPU',
              'Timeout 机制：默认 10s 超时 → amdgpu_job_timedout → GPU 寄存器 dump → GPU 复位',
              '优先级队列：KERNEL > HIGH > NORMAL > LOW，内核操作优先于用户渲染',
              '调度器线程（kthread）：per-ring 独立线程，从实体队列取 job 调度执行',
            ],
          },
          diagram: {
            title: 'DRM GPU Scheduler 架构与 Job 生命周期',
            content: `DRM GPU Scheduler — Job 调度流程

用户空间 (Mesa / Vulkan)
  │ ioctl(DRM_IOCTL_AMDGPU_CS)
  ▼
┌──────────────────────────────────────────────────────────────┐
│  amdgpu_cs_ioctl() — 命令提交入口                           │
│  ├─ amdgpu_cs_parser_init()    解析 ioctl 参数              │
│  ├─ amdgpu_cs_parser_bos()     验证和映射 BO                │
│  └─ amdgpu_cs_submit()         创建 amdgpu_job              │
│      │                                                       │
│      ├─ drm_sched_job_init()   初始化 job，关联 entity       │
│      ├─ drm_sched_job_arm()    武装 job：分配 fence          │
│      └─ drm_sched_entity_push_job()  推入实体队列 ──────┐   │
│                                                          │   │
└──────────────────────────────────────────────────────────│───┘
                                                           │
         ┌─────────────────────────────────────────────────┘
         ▼
┌──────────────────────────────────────────────────────────────┐
│  drm_gpu_scheduler (per-ring 调度器实例)                     │
│                                                              │
│  优先级队列:                                                 │
│  ┌─────────┬──────────┬──────────┬──────────┐               │
│  │ KERNEL  │  HIGH    │ NORMAL   │  LOW     │               │
│  │ (页表   │ (VR 合成 │ (普通    │ (后台    │               │
│  │  更新)  │  器)     │  渲染)   │  计算)   │               │
│  └────┬────┴────┬─────┴────┬─────┴────┬─────┘               │
│       │         │          │          │                      │
│       └────┬────┘          │          │                      │
│            │   优先级从高到低选择     │                      │
│            ▼                          │                      │
│  调度器 kthread (per-ring):           │                      │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ while (true) {                                         │  │
│  │   job = 从最高优先级非空队列取 job;                    │  │
│  │   if (可用 Ring 空间 && 依赖的 fence 已 signal) {      │  │
│  │     fence = job->sched->ops->run_job(job);             │  │
│  │     /* → amdgpu_job_run():                             │  │
│  │      *   amdgpu_ib_schedule()                          │  │
│  │      *   → 写 INDIRECT_BUFFER PM4 到 Ring              │  │
│  │      *   → 写 FENCE PM4 到 Ring                        │  │
│  │      *   → amdgpu_ring_commit() + Doorbell             │  │
│  │      */                                                │  │
│  │     启动 timeout 定时器 (默认 10s);                    │  │
│  │   }                                                    │  │
│  │ }                                                      │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  Timeout 检测:                                               │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ 定时器到期 && fence 未 signal?                         │  │
│  │   → drm_sched_job_timedout()                          │  │
│  │     → amdgpu_job_timedout()                           │  │
│  │       ├─ 检查 fence 是否刚完成 (避免误判)             │  │
│  │       ├─ DRM_ERROR("ring xxx timeout")                │  │
│  │       ├─ dump GPU 寄存器 (GRBM_STATUS, CP_*)         │  │
│  │       └─ amdgpu_device_gpu_recover()                  │  │
│  │           └─ GPU 复位 → 重新初始化 → 重提交/失败      │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
         │
         ▼ Ring Buffer (amdgpu_ring_commit → Doorbell)
┌──────────────────────────────────────────────────────────────┐
│  GPU Command Processor (CP)                                  │
│  · 读取 Ring Buffer 中的 INDIRECT_BUFFER PM4               │
│  · 跟随指针到 IB 地址执行命令                               │
│  · 完成后写 fence 序列号 → 触发中断 → signal fence         │
└──────────────────────────────────────────────────────────────┘`,
            caption: 'DRM GPU Scheduler 的完整工作流：job 从用户空间提交，经过调度器的优先级队列排序，由调度器线程调用 run_job 写入 Ring Buffer，最终由 GPU CP 执行。timeout 机制是 GPU hang 检测的核心。',
          },
          codeWalk: {
            title: 'amdgpu_cs_submit → scheduler → amdgpu_job_run 完整路径',
            file: 'drivers/gpu/drm/amd/amdgpu/amdgpu_job.c',
            language: 'c',
            code: `/* amdgpu_cs_submit() — 创建 job 并提交到调度器
 * 从 amdgpu_cs_ioctl() 的最后阶段调用
 */
static int amdgpu_cs_submit(struct amdgpu_cs_parser *p,
                             union drm_amdgpu_cs *cs)
{
    struct amdgpu_job *job = p->job;

    /* 步骤 1: 初始化调度器 job
     * 关联 job 到提交进程的 drm_sched_entity */
    r = drm_sched_job_init(&job->base,
                           entity,      /* 提交进程的调度实体 */
                           owner);      /* 进程标识 */

    /* 步骤 2: 武装 job — 分配 fence，记录时间戳
     * 此后 job 可以被其他 job 依赖 */
    drm_sched_job_arm(&job->base);

    /* 步骤 3: 推入调度实体的队列
     * 调度器线程会从队列中取出 job 执行 */
    drm_sched_entity_push_job(&job->base);

    /* cs->out.handle 返回给用户空间，用于查询完成状态 */
    cs->out.handle = amdgpu_ctx_add_fence(ctx, entity,
                                           &job->base.s_fence->finished);
    return 0;
}

/* amdgpu_job_run() — 调度器的 run_job 回调
 * 在调度器 kthread 上下文中执行
 * 这是 job 从"排队"变为"GPU 执行"的关键转折点
 */
static struct dma_fence *amdgpu_job_run(struct drm_sched_job *sched_job)
{
    struct amdgpu_job *job = to_amdgpu_job(sched_job);
    struct amdgpu_ring *ring = to_amdgpu_ring(sched_job->sched);
    struct dma_fence *fence = NULL;
    int r;

    /* 将 IB 写入 Ring Buffer
     * amdgpu_ib_schedule 的内部流程:
     *   1. amdgpu_ring_alloc() — 在 Ring 中分配空间
     *   2. 写入 INDIRECT_BUFFER PM4 包 (指向 IB)
     *   3. amdgpu_fence_emit() — 在 Ring 中插入 fence 命令
     *   4. amdgpu_ring_commit() — 更新 WPTR + Doorbell
     */
    r = amdgpu_ib_schedule(ring,
                           job->num_ibs,    /* IB 数量 */
                           job->ibs,        /* IB 数组 */
                           job,
                           &fence);         /* 返回的 fence */
    if (r) {
        DRM_ERROR("Error scheduling IBs (%d)\\n", r);
        dma_fence_set_error(&job->base.s_fence->finished, r);
        return NULL;
    }

    return fence;
}

/* amdgpu_job_timedout() — 超时回调
 * 当 job 的 fence 在超时时间内未 signal 时调用
 */
static enum drm_gpu_sched_stat
amdgpu_job_timedout(struct drm_sched_job *s_job)
{
    struct amdgpu_job *job = to_amdgpu_job(s_job);
    struct amdgpu_ring *ring = to_amdgpu_ring(s_job->sched);
    struct amdgpu_device *adev = ring->adev;

    /* 检查 fence 是否刚刚完成（竞争条件避免误判）*/
    if (amdgpu_ring_soft_recovery(ring, s_job->s_fence->parent))
        return DRM_GPU_SCHED_STAT_NOMINAL;

    /* 确认是真正的 hang — 记录错误信息 */
    DRM_ERROR("ring %s timeout, signaled seq=%u, emitted seq=%u\\n",
              ring->sched.name,
              atomic_read(&ring->fence_drv.last_seq),
              ring->fence_drv.sync_seq);

    /* dump GPU 寄存器状态用于调试 */
    amdgpu_debugfs_gpu_recover(adev);

    /* 触发 GPU 复位 */
    r = amdgpu_device_gpu_recover(adev, job, false);
    if (r)
        DRM_ERROR("GPU Recovery Failed: %d\\n", r);

    return DRM_GPU_SCHED_STAT_NOMINAL;
}`,
            annotations: [
              'drm_sched_job_init 将 job 与 entity 关联——entity 代表一个提交进程，用于公平调度',
              'drm_sched_job_arm 分配 scheduled/finished 两个 fence：scheduled 在 run_job 被调用时 signal，finished 在 GPU 完成时 signal',
              'drm_sched_entity_push_job 将 job 放入 entity 队列——调度器线程按优先级从队列取 job',
              'amdgpu_job_run 在调度器 kthread 中运行——不在用户进程上下文，不能访问用户空间内存',
              'amdgpu_ib_schedule 是 Ring Buffer 写入的核心：分配空间 → 写 PM4 → emit fence → commit',
              'amdgpu_ring_soft_recovery 尝试"软恢复"：如果 CP 只是卡在某条命令上，发送 preempt 信号',
            ],
            explanation: '这三个函数构成了 amdgpu 命令提交的核心路径：submit 负责 job 创建和入队，run 负责实际的 Ring Buffer 写入，timedout 负责异常处理。理解这个路径后，你就能回答"一个 GPU 命令从提交到执行经历了哪些阶段"——这是 AMD 面试中的高频问题。',
          },
          miniLab: {
            title: '观察 DRM GPU Scheduler 的运行状态',
            objective: '通过 debugfs 和 ftrace 观察调度器的队列深度、job 执行时间和 timeout 配置。',
            setup: `# 确保 debugfs 已挂载
sudo mount -t debugfs none /sys/kernel/debug 2>/dev/null
# 准备 GPU 工作负载
sudo apt install -y mesa-utils vulkan-tools`,
            steps: [
              '查看调度器状态：sudo cat /sys/kernel/debug/dri/0/amdgpu_gpu_recover 2>/dev/null',
              '查看每个 Ring 的 fence 信息：sudo cat /sys/kernel/debug/dri/0/amdgpu_fence_info',
              '设置 ftrace 追踪调度器：echo amdgpu_job_run > /sys/kernel/tracing/set_ftrace_filter',
              '启用追踪并运行 GPU 负载：echo function_graph > /sys/kernel/tracing/current_tracer && echo 1 > /sys/kernel/tracing/tracing_on && glxgears & sleep 3 && kill %1',
              '停止追踪并查看结果：echo 0 > /sys/kernel/tracing/tracing_on && cat /sys/kernel/tracing/trace | head -40',
              '查看调度器超时配置：dmesg | grep -i "timeout\\|scheduler" | head -10',
            ],
            expectedOutput: `$ sudo cat /sys/kernel/debug/dri/0/amdgpu_fence_info
--- ring gfx_0.0.0 ---
Last signaled fence          0x00008a31
Last emitted                 0x00008a34
  ← 3 个 job 正在执行/排队

--- ring sdma0 ---
Last signaled fence          0x00000456
Last emitted                 0x00000456
  ← SDMA 空闲

$ cat /sys/kernel/tracing/trace | head -10
# tracer: function_graph
 sched-gfx_0-789  =>  amdgpu_job_run() {
 sched-gfx_0-789      amdgpu_ib_schedule() { ... }
 sched-gfx_0-789  } /* 5.234 us */   ← 单次 job 调度约 5us`,
            hint: 'ftrace 中的 sched-gfx_0 就是 GFX Ring 0 的调度器 kthread。每次调用 amdgpu_job_run 对应一次命令从队列到 Ring 的提交。如果 "Last signaled" 与 "Last emitted" 差值很大且不变，说明 GPU hang。',
          },
          debugExercise: {
            title: '理解 GPU hang timeout：调度器超时 vs 硬件 hang',
            language: 'text',
            description: '用户报告 GPU 频繁 "timeout" 但系统不崩溃。dmesg 显示周期性的 ring timeout 信息。需要判断是真正的硬件 hang 还是调度器误判。',
            question: '分析以下两组 timeout 日志，判断哪个是真正的 GPU hang，哪个是调度器误判。解释你的推理过程。',
            buggyCode: `/* 场景 A */
[  100.123] ring gfx_0.0.0 timeout, signaled seq=5000, emitted seq=5001
[  100.123] GRBM_STATUS=0x00000000 (GFX IDLE!)
[  100.124] CP_RB_RPTR=0x0000A000
[  100.124] CP_RB_WPTR=0x0000A000  (RPTR == WPTR)
[  100.125] GPU reset succeeded

/* 场景 B */
[  200.456] ring gfx_0.0.0 timeout, signaled seq=8000, emitted seq=8004
[  200.456] GRBM_STATUS=0x00030300 (GUI_ACTIVE | GFX_BUSY | CP_BUSY)
[  200.457] CP_RB_RPTR=0x0000F100
[  200.457] CP_RB_WPTR=0x0000F200  (RPTR < WPTR, Ring 有未处理命令)
[  200.458] SRC_ID: 146, VMID: 3, addr: 0x0000DEAD0000
[  200.460] GPU reset succeeded`,
            hint: '比较两个场景的 GRBM_STATUS（GPU 是否繁忙）和 RPTR/WPTR 关系（Ring 是否有未处理命令）。GFX_IDLE + RPTR==WPTR 意味着什么？',
            answer: '场景 A 是调度器误判（false timeout），场景 B 是真正的 GPU hang。分析：场景 A——GRBM_STATUS=0 表示 GFX 引擎完全空闲（没有任何活动），CP_RB_RPTR == CP_RB_WPTR 说明 Ring Buffer 为空（GPU 已处理所有命令），signaled=5000, emitted=5001 说明只差 1 个 fence 未 signal。组合起来：GPU 实际上已经完成了执行（Ring 为空，GFX 空闲），但 fence 值没有正确更新——可能是 fence 写回中断丢失（interrupt coalescing 或 IH ring overflow）或 writeback 内存映射问题。修复方向：检查 IH (Interrupt Handler) ring 是否溢出，或 fence writeback buffer 的 GPU→CPU 一致性。场景 B——GRBM_STATUS 显示 GUI_ACTIVE、GFX_BUSY、CP_BUSY（GPU 正在执行但卡住了），RPTR < WPTR（Ring 中有未处理命令），signaled=8000, emitted=8004（4 个 job 积压），SRC_ID:146 是 VMC page fault，addr=0x0000DEAD0000 是明显的 poison 地址。这是典型的 GPU hang：GPU 尝试访问无效虚拟地址导致 VMC fault，GFX 引擎因 fault 而停滞。根因是用户空间 use-after-free（释放了 BO 但仍在 shader 中引用其地址）。',
          },
          interviewQ: {
            question: 'Explain the DRM GPU scheduler\'s role in amdgpu command submission. How does it handle job scheduling and GPU hang detection?',
            difficulty: 'hard',
            hint: '描述调度器的架构（per-ring 实例、优先级队列、调度器线程），job 生命周期，以及 timeout→reset 的完整链条。',
            answer: 'DRM GPU Scheduler 在 amdgpu 命令提交中扮演三个核心角色：（1）多进程公平调度——每个提交进程（drm_sched_entity）有自己的 job 队列，调度器按照优先级（KERNEL > HIGH > NORMAL > LOW）和公平性原则从多个 entity 中选择 job 执行。每个 Ring Buffer 有独立的调度器实例和 kthread，使得 GFX、SDMA、VCN 的调度互不干扰。（2）Job 生命周期管理——完整路径：用户提交 ioctl → amdgpu_cs_submit() 中调用 drm_sched_job_init()/arm()/push() 将 job 入队 → 调度器 kthread 选择 job → 调用 amdgpu_job_run() 回调 → amdgpu_ib_schedule() 将 INDIRECT_BUFFER PM4 包写入 Ring → amdgpu_ring_commit() 通过 Doorbell 通知 GPU CP → GPU 执行完成后写入 fence 序列号 → 中断触发 fence signal → 调度器标记 job 完成。（3）GPU hang 检测——调度器为每个运行中的 job 启动定时器（amdgpu GFX ring 默认 10 秒），如果定时器到期而 fence 未 signal，调用 amdgpu_job_timedout()：首先尝试 soft recovery（发送 preempt 信号），如果失败则 dump GPU 寄存器（GRBM_STATUS、CP_RB_RPTR/WPTR、GPU fault 信息），最后调用 amdgpu_device_gpu_recover() 执行 GPU mode 1/2 reset——保存状态、复位 GPU 硬件、重新初始化所有 IP Block、重提交未完成的 job 或标记为失败返回 -ECANCELED 给用户空间。',
            amdContext: 'DRM GPU Scheduler 最初由 AMD 工程师（Christian König）开发。面试中展示你理解调度器如何连接"用户空间提交"和"GPU 执行"，以及 timeout 机制如何保护系统免受 GPU hang 影响，是体现深度理解的关键。',
          },
        },

        // ── Lesson 5.4.3 ──────────────────────────────────────
        {
          id: '5-4-3',
          number: '5.4.3',
          title: 'GPU 虚拟内存子系统：amdgpu_vm 详解',
          titleEn: 'GPU Virtual Memory Subsystem: amdgpu_vm In-Depth',
          duration: 20,
          difficulty: 'expert',
          tags: ['GPUVM', 'amdgpu_vm', 'page-table', 'PDB', 'PTE', 'VM-fault', 'VMID'],
          concept: {
            summary: 'GPUVM（GPU Virtual Memory）是 amdgpu 的虚拟内存子系统，为每个进程提供独立的 GPU 虚拟地址空间。它使用多级页表（PDB2→PDB1→PDB0→PD→PT→PTE，最多 6 级，类似 x86 但为 GPU 定制）将 GPU 虚拟地址翻译为 VRAM/GTT 物理地址。amdgpu_vm_bo_update() 是最核心的函数——当一个 Buffer Object 被绑定到 VM 时，它创建/更新 GPU 页表条目。',
            explanation: [
              'GPUVM 页表层次结构：AMD GPU 使用最多 6 级页表来翻译虚拟地址，从高位到低位为：PDB2（Page Directory Base 2）→ PDB1 → PDB0 → PD（Page Directory）→ PT（Page Table）→ PTE（Page Table Entry）。每级索引使用虚拟地址中的不同位域——例如 48 位虚拟地址空间中，PDB2 使用 VA[47:39]（9 位，512 个条目），PDB1 使用 VA[38:30]，PDB0 使用 VA[29:21]，PT 使用 VA[20:12]，PTE 中存储物理页帧号。这与 x86 CPU 的 4/5 级页表概念相似，但 GPUVM 的页表存储在 VRAM 中（而非系统内存），由 GPU 的 UTCL2（Unified Translation Cache Level 2）硬件遍历。',
              'struct amdgpu_vm 代表一个进程的 GPU 虚拟地址空间。每个打开 /dev/dri/renderD128 的进程都会创建一个 amdgpu_vm 实例。核心字段包括：root — 根页目录（PDB2）的 Buffer Object，是整个页表树的入口；va — 红黑树，记录所有已映射的虚拟地址区间（VA mapping）；evicted — 被驱逐的页表 BO 列表（当 VRAM 压力大时页表本身也可能被驱逐到 GTT）；last_update — 指向最近一次页表更新的 fence，用于跟踪页表更新的 GPU 端完成状态。页表 BO 管理是 GPUVM 的一大挑战——页表自身也是 GPU 内存中的 Buffer Object，需要通过 TTM 管理，且在 BO 迁移时需要同步更新。',
              'amdgpu_vm_bo_update() 是 GPUVM 最核心的函数——当一个 BO 被映射到某个进程的 GPU 虚拟地址空间时，或者当 BO 在 VRAM 和 GTT 之间迁移后需要更新映射时，都会调用这个函数。它的工作流程：（1）遍历 BO 关联的所有 VA mapping（一个 BO 可能映射到多个虚拟地址）；（2）对每个 mapping，调用 amdgpu_vm_update_ptes() 更新对应的页表条目——计算需要修改哪些级别的页表，将 PTE 的物理地址字段更新为 BO 的新位置；（3）页表更新通过 SDMA Ring 提交（SDMA 比 GFX 更高效地执行内存填充操作），返回的 fence 用于跟踪更新完成。',
              'GPUVM fault（VM fault）处理是调试 GPU 问题的关键场景。当 GPU 访问一个未映射或无效的虚拟地址时，UTCL2（GPU 的 TLB/页表遍历硬件）会产生一个 page fault 中断。amdgpu 的中断处理函数接收到这个中断后：（1）从 IH ring 中读取 fault 信息——包括 fault 地址（VA）、VMID（标识哪个进程的地址空间）、是读还是写、fault 来源（GFX/SDMA/VCN 等）；（2）在 dmesg 中记录 "[drm] VM fault (src_id:146, ring:0, vmid:3, addr:0xDEAD0000)"；（3）对用户空间进程，通常导致该进程的 GPU 上下文被标记为有错误。常见的 VM fault 原因：use-after-free（释放 BO 后仍在 shader 中引用）、越界访问（shader 访问超出 BO 范围的地址）、页表未更新（BO 迁移后页表同步失败）。',
              'VM 地址空间布局：GPUVM 的虚拟地址空间通常为 48 位（256 TB），分为几个区域：低地址区域分配给用户空间 BO 映射（通过 amdgpu_vm_bo_map 分配 VA），高地址区域保留给内核（如 kernel BO、页表自身）。VA 分配使用 drm_mm 管理器（间隔树/区间分配），amdgpu_vm_bo_map() 在 VM 的 VA 空间中找到一块足够大的空闲区间，创建映射记录（struct amdgpu_bo_va_mapping），但此时还不写页表——页表的实际更新延迟到 amdgpu_vm_bo_update() 中执行（在命令提交前确保映射有效）。这种"延迟映射"设计减少了不必要的页表更新。',
            ],
            keyPoints: [
              'GPUVM 多级页表：PDB2→PDB1→PDB0→PD→PT→PTE，最多 6 级，存储在 VRAM 中',
              'struct amdgpu_vm：per-process GPU 地址空间，包含根页目录 BO 和 VA 映射红黑树',
              'amdgpu_vm_bo_update()：核心函数，BO 绑定/迁移时更新 GPU 页表条目',
              'VM fault：GPU 访问无效 VA → UTCL2 产生中断 → dmesg 记录 fault 信息（VMID + addr）',
              '页表更新通过 SDMA Ring 提交，页表 BO 自身也由 TTM 管理（可能被驱逐到 GTT）',
              'VA 空间布局：48 位（256TB），用户区在低地址，内核保留在高地址',
            ],
          },
          diagram: {
            title: 'GPUVM 多级页表结构与地址翻译',
            content: `GPUVM 多级页表地址翻译 — AMD GPU 虚拟内存

GPU 虚拟地址 (48 bit):
┌──────┬──────┬──────┬──────┬──────┬──────┐
│PDB2  │PDB1  │PDB0  │ PD   │ PT   │Offset│
│[47:39]│[38:30]│[29:21]│[20:18]│[17:12]│[11:0]│
│9 bit │9 bit │9 bit │3 bit │6 bit │12 bit│
└──┬───┴──┬───┴──┬───┴──┬───┴──┬───┴──────┘
   │      │      │      │      │
   ▼      ▼      ▼      ▼      ▼
┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐
│PDB2  │→│PDB1  │→│PDB0  │→│ PD   │→│ PT   │→ 物理页
│(根)  │  │      │  │      │  │      │  │      │  (VRAM/GTT)
│512项 │  │512项 │  │512项 │  │8项   │  │64项  │
│      │  │      │  │      │  │      │  │      │
│[idx] │  │[idx] │  │[idx] │  │[idx] │  │[idx] │
│  ↓   │  │  ↓   │  │  ↓   │  │  ↓   │  │  ↓   │
│next→ │  │next→ │  │next→ │  │next→ │  │PFN   │
└──────┘  └──────┘  └──────┘  └──────┘  └──────┘

PTE (Page Table Entry) 格式:
┌──────────────────────────────────────────────────┐
│ [63:57] 保留                                      │
│ [56:12] 物理页帧号 (PFN) — VRAM 或 GTT 物理地址  │
│ [11]    P (Present) — 页是否有效                  │
│ [10]    S (System) — 0=VRAM, 1=System Memory(GTT) │
│ [9:7]   MTYPE — 内存类型 (Cached/Uncached 等)     │
│ [6]     W (Writeable)                             │
│ [5]     R (Readable)                              │
│ [4]     X (Executable)                            │
│ [3:0]   Fragment — 大页支持 (类似 CPU hugepage)    │
└──────────────────────────────────────────────────┘

struct amdgpu_vm (per-process GPU 虚拟地址空间):
┌──────────────────────────────────────────────────┐
│  root (BO)           ← PDB2 根页目录 Buffer Object│
│  va (红黑树)         ← 所有 VA mapping 的索引      │
│  evicted (链表)      ← 被驱逐到 GTT 的页表 BO     │
│  invalidated (链表)  ← 需要更新的映射              │
│  last_update (fence) ← 最近页表更新的完成跟踪      │
│  pasid               ← Process Address Space ID    │
└──────────────────────────────────────────────────┘
         │
         ▼ VM 地址空间布局 (48-bit, 256 TB)
┌──────────────────────────────────────────────────┐
│ 0x000000000000 ──────────────────── 用户空间      │
│   BO 映射区域 (amdgpu_vm_bo_map 分配)            │
│   shader 代码、vertex buffer、texture、           │
│   framebuffer 等用户 BO 映射到这里               │
│                                                   │
│ ~~~~~~~~~~~~~~~~~~~~~~~~ (巨大的空闲空间) ~~~~~~~~│
│                                                   │
│ 0xFFFFF0000000 ──────────────────── 内核保留      │
│   kernel BO、页表自身、SVM 保留区域              │
│ 0xFFFFFFFFFFFF ──────────────────── 地址空间顶部  │
└──────────────────────────────────────────────────┘

VM fault 处理流程:
GPU 访问无效 VA → UTCL2 TLB miss → 页表遍历失败
  → VMC 产生 page fault 中断 (SRC_ID: 146)
    → IH ring 记录: {vmid, addr, rw, src}
      → amdgpu_vm_fault_handler()
        → dmesg: "VM fault (vmid:3, addr:0xDEAD0000)"
          → 标记进程 GPU 上下文为错误状态`,
            caption: 'GPUVM 的多级页表结构和地址翻译过程。与 x86 CPU 页表概念相似，但页表存储在 VRAM 中，由 GPU 的 UTCL2 硬件遍历。PTE 中的 S 位区分物理页是在 VRAM 还是 GTT（系统内存）中。',
          },
          codeWalk: {
            title: 'amdgpu_vm_bo_update — 将 BO 映射到 GPU 虚拟地址空间',
            file: 'drivers/gpu/drm/amd/amdgpu/amdgpu_vm.c',
            language: 'c',
            code: `/* amdgpu_vm_bo_update() — 更新 BO 在 GPU 页表中的映射
 * 当 BO 首次绑定到 VM、或 BO 在 VRAM↔GTT 迁移后调用
 * 这是 GPUVM 最核心的函数
 */
int amdgpu_vm_bo_update(struct amdgpu_device *adev,
                         struct amdgpu_bo_va *bo_va,
                         bool clear)
{
    struct amdgpu_bo *bo = bo_va->base.bo;
    struct amdgpu_vm *vm = bo_va->base.vm;
    struct list_head *head;
    int r;

    /* 获取 BO 的物理地址
     * 如果 BO 在 VRAM: addr = VRAM 偏移
     * 如果 BO 在 GTT:  addr = 系统内存 DMA 地址
     * 如果 clear=true: addr = 0 (解除映射) */
    if (clear) {
        addr = 0;
        flags = 0;
    } else {
        addr = amdgpu_bo_gpu_offset(bo);
        flags = amdgpu_ttm_tt_pte_flags(adev, bo->tbo.ttm);
        /* flags 包含: readable, writeable, executable,
         * MTYPE (cached/uncached), system vs vram */
    }

    /* 遍历此 BO 的所有 VA mapping
     * 一个 BO 可能映射到同一个 VM 的多个虚拟地址 */
    list_for_each_entry(mapping, &bo_va->invalids, list) {
        /* mapping->start: VA 起始地址 (页对齐)
         * mapping->last:  VA 结束地址
         * addr:           物理地址
         * flags:          PTE 属性 (R/W/X, MTYPE 等) */

        r = amdgpu_vm_update_ptes(adev, vm,
                                   mapping->start,
                                   mapping->last + 1,
                                   addr, flags);
        if (r)
            return r;

        addr += (mapping->last - mapping->start + 1)
                * AMDGPU_GPU_PAGE_SIZE;
    }

    /* 将 mapping 从 invalids 移到 valids 列表 */
    list_splice_init(&bo_va->invalids, &bo_va->valids);

    /* 提交页表更新到 SDMA Ring
     * SDMA 比 GFX 更适合大量小写入 (页表更新) */
    r = amdgpu_vm_update_pdes(adev, vm, false);

    /* 记录 fence 用于跟踪更新完成 */
    vm->last_update = fence;
    return r;
}

/* amdgpu_vm_update_ptes — 更新指定 VA 范围的页表条目 */
static int amdgpu_vm_update_ptes(struct amdgpu_device *adev,
                                  struct amdgpu_vm *vm,
                                  uint64_t start, uint64_t end,
                                  uint64_t dst, uint64_t flags)
{
    struct amdgpu_vm_update_params params;

    /* 根据 VA 范围计算需要修改哪些页表级别
     * 如果映射大小 >= 2MB 且对齐，可以使用大页
     * (在 PD 级别直接映射，跳过 PT 级别) */
    amdgpu_vm_update_flags(&params, start, end, flags);

    /* 遍历多级页表，找到目标 PTE 位置
     * 如果中间级别的页目录不存在，动态创建
     * (分配新的 BO 作为页目录) */
    while (start < end) {
        /* 计算当前 PTE 对应的页表 BO */
        pt_bo = amdgpu_vm_get_pt(&params, start);

        /* 写入 PTE: 将 dst (物理地址) 写入页表条目
         * 通过 SDMA WRITE_DATA 命令执行 */
        amdgpu_vm_cpu_set_ptes(&params, pt_bo,
                                pe_start, dst, count,
                                AMDGPU_GPU_PAGE_SIZE,
                                flags);

        start += count * AMDGPU_GPU_PAGE_SIZE;
        dst += count * AMDGPU_GPU_PAGE_SIZE;
    }
    return 0;
}`,
            annotations: [
              'bo_va->invalids 列表存储需要更新的映射——BO 迁移后映射变为 invalid',
              'amdgpu_bo_gpu_offset 返回 BO 在 VRAM/GTT 中的物理偏移地址',
              'PTE flags 中的 S 位（System）决定 GPU 通过 VRAM 还是 PCIe 访问物理页',
              'amdgpu_vm_update_pdes 确保页目录链的一致性——修改 PTE 后需要刷新 TLB',
              '页表更新通过 SDMA 提交——SDMA 的 memset/memcpy 操作比 GFX 更高效',
              '大页支持（PD 级别直接映射）减少页表级数，提高 TLB 命中率',
            ],
            explanation: '这个函数是 GPU 内存管理的核心——每次 BO 被使用前都需要确保其映射有效。在命令提交路径中（amdgpu_cs_parser_bos），驱动会检查命令引用的所有 BO 的映射状态，对 invalid 的映射调用 amdgpu_vm_bo_update 更新页表。页表更新的性能直接影响命令提交延迟。',
          },
          miniLab: {
            title: '查看 GPU 虚拟内存映射和页表信息',
            objective: '通过 debugfs 观察 GPUVM 的地址映射、页表层级和 VM fault 处理机制。',
            setup: `# 确保 debugfs 已挂载
sudo mount -t debugfs none /sys/kernel/debug 2>/dev/null
# 准备 GPU 工作负载触发 BO 映射
sudo apt install -y mesa-utils`,
            steps: [
              '查看所有 VMID 分配：sudo cat /sys/kernel/debug/dri/0/amdgpu_vm_info 2>/dev/null',
              '运行 GPU 应用触发 VA 映射：glxgears & GLXPID=$!; sleep 2',
              '查看 GPU 进程的 BO 列表：sudo cat /sys/kernel/debug/dri/0/amdgpu_gem_info | head -30',
              '查看 VM 统计信息：sudo cat /sys/kernel/debug/dri/0/amdgpu_vm_info 2>/dev/null',
              '查看近期是否有 VM fault：dmesg | grep -i "vm fault\\|page fault\\|vmid" | tail -10',
              '清理：kill $GLXPID 2>/dev/null',
            ],
            expectedOutput: `$ sudo cat /sys/kernel/debug/dri/0/amdgpu_vm_info
VM info:
  num VMs: 3         ← 当前活跃的 GPU 虚拟地址空间数量
  num page tables: 128   ← 活跃的页表 BO 数量
  VMID usage:
    VMID 0: kernel reserved
    VMID 1: pid 1234 (Xorg)
    VMID 3: pid 5678 (glxgears)

$ sudo cat /sys/kernel/debug/dri/0/amdgpu_gem_info | head -10
pid   5678 command glxgears:
  BO: 0x00007F0000000000 size: 16MB  domain: VRAM  ← 主 framebuffer
  BO: 0x00007F0001000000 size: 4MB   domain: VRAM  ← texture/vertex
  BO: 0x00007F0002000000 size: 256KB domain: GTT   ← command buffer
  ...`,
            hint: '具体的 debugfs 路径和输出格式取决于内核版本。amdgpu_gem_info 显示每个进程的 BO 列表及其 GPU 虚拟地址，是理解 VM 映射的最直接方式。如果 VM info 不可用，尝试 amdgpu_fence_info 和 dmesg 组合。',
          },
          debugExercise: {
            title: '诊断 VM fault：从 dmesg 输出解码 fault 地址和 VMID',
            language: 'text',
            description: '生产环境中一个 GPU 计算任务周期性触发 VM fault。以下是 dmesg 输出和相关系统状态。需要解码 fault 信息并定位根因。',
            question: '解码以下 VM fault 信息：确定 fault 发生在哪个进程、访问了什么地址、fault 原因是什么、以及如何修复。',
            buggyCode: `/* dmesg VM fault 输出 */
[  456.789] amdgpu 0000:03:00.0: amdgpu:
  [gfxhub0] VMC page fault
  src_id:146 ring:0 vmid:5 pasid:32773
  addr:0x0000800100004000
  [read, type:4, protections:0x0]

/* GPU 进程信息 */
$ cat /sys/kernel/debug/dri/0/amdgpu_gem_info | grep "pid.*32773"
pid 32773 command my_compute_app:
  BO: 0x0000800100000000 size: 16KB domain: VRAM  flags: r/w
  BO: 0x0000800200000000 size: 4MB  domain: VRAM  flags: r/w

/* 应用代码片段 (OpenCL kernel) */
__kernel void process(__global float* input, int N) {
    int idx = get_global_id(0);
    /* input buffer 大小: 16KB = 4096 个 float */
    float val = input[idx];  /* idx 可能 > 4096! */
    ...
}

/* 启动配置 */
global_work_size = 8192;  /* 8192 个线程 */
/* 但 input 只有 4096 个 float (16KB) */`,
            hint: '比较 fault 地址 (0x0000800100004000) 和 BO 映射地址 (0x0000800100000000, size: 16KB=0x4000)。fault 地址恰好在 BO 结束的边界。',
            answer: '解码分析：（1）VMID=5, PASID=32773——PASID 是 Process Address Space ID，通过 amdgpu_gem_info 确认是 "my_compute_app" 进程（pid 32773）。VMID=5 是 GPU 硬件为该进程分配的虚拟地址空间标识符。（2）Fault 地址=0x0000800100004000——该进程的 input BO 映射在 0x0000800100000000，大小 16KB（0x4000 字节）。BO 覆盖的地址范围是 [0x800100000000, 0x800100004000)。fault 地址 0x800100004000 恰好是 BO 的末尾（第一个越界地址）。（3）type:4 = "no valid PTE"，protections:0x0 = "no permissions"——页表中该地址没有有效映射。（4）根因：经典的数组越界访问。OpenCL kernel 启动了 8192 个线程（global_work_size=8192），每个线程读取 input[get_global_id(0)]，但 input buffer 只有 4096 个 float（16KB）。当线程 ID >= 4096 时，访问地址超出 BO 映射范围。线程 4096 的访问地址 = base + 4096*4 = base + 0x4000，正好触发 VM fault。修复方案：（a）增大 input buffer 到 32KB（8192 个 float）；（b）在 kernel 中添加边界检查：if (idx < N) val = input[idx]；（c）调整 global_work_size 为 4096 以匹配实际数据量。这是 GPU 编程中最常见的 VM fault 类型——等同于 CPU 端的 segfault/越界访问。',
          },
          interviewQ: {
            question: 'Describe the GPU virtual memory system in amdgpu and how it differs from CPU virtual memory.',
            difficulty: 'hard',
            hint: '从页表结构（多级、VRAM 存储）、地址空间管理（per-process VM）、fault 处理（不可恢复 vs CPU 的 demand paging）和映射更新机制四个维度对比。',
            answer: 'GPUVM 与 CPU 虚拟内存的对比：（1）页表结构——GPUVM 使用最多 6 级页表（PDB2→PDB1→PDB0→PD→PT→PTE），CPU x86_64 使用 4-5 级（PML5→PML4→PDPT→PD→PT→PTE）。关键区别是 GPUVM 页表存储在 VRAM 中（而非系统内存），由 GPU 的 UTCL2 硬件单元遍历，且页表 BO 自身也由 TTM 内存管理器管理（可能在 VRAM 压力下被驱逐到 GTT）。（2）地址空间管理——两者都是 per-process 独立地址空间：CPU 使用 struct mm_struct，GPUVM 使用 struct amdgpu_vm。GPU 每个进程分配一个 VMID（类似 CPU 的 ASID/PCID），用于 TLB 标记。GPUVM 的 VA 分配使用 drm_mm 区间分配器，映射通过 amdgpu_vm_bo_map() 建立。（3）Fault 处理——这是最大的区别。CPU page fault 支持 demand paging（缺页时分配物理页并继续执行），GPU VM fault 通常是不可恢复的——fault 发生时 GPU 上下文被标记为错误，该进程后续的 GPU 操作会失败。这是因为 GPU 的 wavefront（类似 CPU 线程）一旦遇到 fault 就无法干净地暂停和恢复。RDNA 后期开始支持 "recoverable page fault"（通过 SVM/XNACK 机制），允许类似 CPU 的 demand paging，但需要特定硬件和软件支持。（4）映射更新——CPU 页表更新由 CPU 直接写内存完成（原子操作 + TLB flush），GPUVM 页表更新通过 SDMA Ring 提交 GPU 命令完成（异步操作，需要 fence 跟踪完成状态）。这意味着 GPU 页表更新有延迟，必须在命令提交前确保映射完成（通过 fence wait）。amdgpu_vm_bo_update() 是核心函数，在 amdgpu_cs_parser_bos() 中为每个引用的 BO 检查和更新映射。',
            amdContext: 'GPUVM 是 AMD 面试中的高频深度话题，尤其是 Memory Management 团队。展示你理解 GPU 和 CPU 虚拟内存的本质差异（fault 处理、页表存储位置、异步更新），而不仅仅是类比"GPU 也有页表"，是区分优秀候选人的关键。',
          },
        },
      ],
    },
  ],
  completionChecklist: [
    '能画出 amdgpu 驱动源码目录结构，说出每个子目录的职责（amdgpu/、display/dc/、amdkfd/、pm/）',
    '掌握 cscope/ctags 或 clangd 在内核源码中导航，能快速从 dmesg 错误定位到源码位置',
    '理解 IP Block 架构：统一的 amd_ip_funcs 接口、初始化顺序依赖、IP Discovery 机制',
    '能完整描述命令提交路径：ioctl → parser → BO 验证 → scheduler → Ring Buffer → Doorbell → CP 执行',
    '理解 Fence 同步机制：emit/signal 流程、中断处理、GPU hang 检测和复位',
    '理解 DC 显示引擎架构：DRM KMS → amdgpu_dm → DC Core → DCN 硬件层',
    '能通过 sysfs 接口监控和控制 GPU 频率/温度/功耗，理解 SMU 和 DVFS 的工作原理',
    '能分析 dmesg 中的 GPU 错误信息（ring timeout、underflow、VM fault）并定位根因',
    'Understand DC architecture: dc_state commit flow, DML bandwidth validation, DC vs DRM adapter layer',
    'Can explain DRM GPU Scheduler: job lifecycle, timeout handling, priority-based scheduling',
    'Understand GPUVM: multi-level page tables, amdgpu_vm_bo_update, VM fault diagnosis',
  ],
};
