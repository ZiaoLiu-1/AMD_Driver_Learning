// ============================================================
// AMD Linux Driver Learning Platform - Curriculum Data
// Design: Deep Space Tech Theme
// All 12 modules with theory, diagrams, code, projects, interviews
// ============================================================
import { ecosystemModule } from './ecosystem_module';

export interface SubModule {
  id: string;
  title: string;
  titleEn: string;
}

export interface Module {
  id: string;
  number: string;
  title: string;
  titleEn: string;
  icon: string;
  description: string;
  estimatedHours: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  subModules: SubModule[];
  theory: TheoryContent;
  codeReading: CodeContent[];
  miniProject: ProjectContent;
  interviewQuestions: InterviewQuestion[];
  glossary?: GlossaryTerm[];
}

export interface TheoryContent {
  overview: string;
  sections: TheorySection[];
  keyBooks: BookReference[];
  onlineResources: OnlineResource[];
}

export interface TheorySection {
  title: string;
  content: string;
  diagram?: DiagramContent;
}

export interface DiagramContent {
  type: 'ascii' | 'description';
  content: string;
  caption: string;
}

export interface BookReference {
  title: string;
  author: string;
  isbn?: string;
  relevance: string;
  url?: string;
}

export interface OnlineResource {
  title: string;
  url: string;
  type: 'doc' | 'video' | 'repo' | 'paper';
  description: string;
}

export interface CodeContent {
  title: string;
  description: string;
  file: string;
  language: string;
  code: string;
  annotations: string[];
}

export interface ProjectContent {
  title: string;
  description: string;
  objectives: string[];
  steps: string[];
  expectedOutput: string;
  githubTemplate?: string;
}

export interface InterviewQuestion {
  question: string;
  difficulty: 'easy' | 'medium' | 'hard';
  hint: string;
  answer: string;
}

export interface GlossaryTerm {
  abbr: string;        // 缩写，如 "DRM"
  fullEn: string;      // 英文全称，如 "Direct Rendering Manager"
  zhName: string;      // 中文名称，如 "直接渲染管理器"
  description: string; // 用途说明（一句话）
  category: 'kernel' | 'hardware' | 'graphics' | 'compute' | 'toolchain' | 'general';
}

export const curriculumZh: Module[] = [
  {
    id: 'intro',
    number: '0',
    title: '引言与学习路径概览',
    titleEn: 'Introduction & Learning Path',
    icon: '🚀',
    description: '了解这条学习路径的终点、价值和结构。明确你的目标：成为一名能向 Linux 内核提交 AMD GPU 驱动补丁的工程师。',
    estimatedHours: 2,
    difficulty: 'beginner',
    subModules: [
      { id: 'intro-goal', title: '学习目标与成果', titleEn: 'Goals & Outcomes' },
      { id: 'intro-overview', title: '路径总览', titleEn: 'Path Overview' },
      { id: 'intro-setup', title: '环境搭建', titleEn: 'Environment Setup' },
    ],
    theory: {
      overview: '这条学习路径旨在将你从一个 Linux 用户，培养成一名能够理解、调试并为 AMD GPU 驱动（amdgpu）贡献代码的内核工程师。你手中任意一块 AMD GPU（RDNA/GCN 均可）都是你最好的学习工具。整个路径分为 11 个模块，预计总学习时间约为 400-600 小时（6-12 个月，取决于你的基础和投入程度）。',
      sections: [
        {
          title: '为什么选择 AMD GPU 驱动开发？',
          content: 'AMD 的 GPU 驱动栈（amdgpu）是目前 Linux 内核中最复杂、最活跃的子系统之一。整个驱动栈完全开源，从内核驱动到用户态 ROCm 计算框架，这为学习提供了无与伦比的透明度。AMD Markham（加拿大）是 AMD 最重要的 GPU 驱动开发中心之一，拥有大量内核工程师岗位。掌握这条路径上的技能，将使你成为一名极具竞争力的候选人。amdgpu 驱动代码量超过 400 万行（drivers/gpu/drm/amd/ 目录），是 Linux 内核中最大的单个子系统之一。它包含 Display Core（DC）、Graphics/Compute（GFX）、DMA 引擎（SDMA）、视频编解码（VCN/JPEG）、电源管理（SMU）等多个 IP Block，每个都有独立的团队在维护。',
          diagram: {
            type: 'ascii',
            content: `Why AMD GPU Driver Development?

  Linux Kernel Active Subsystems (by lines of code)
  ─────────────────────────────────────────────────

  drivers/gpu/drm/amd/   ████████████████████████  4M+ lines
  drivers/net/           ███████████████████       3M+ lines
  drivers/gpu/drm/i915/  ████████████              1.5M lines
  fs/                    ███████████               1.2M lines
  sound/                 ██████████                1M+ lines

  amdgpu is the LARGEST single driver in the kernel!

  ─────────────────────────────────────────────────

  Unique advantages of learning amdgpu:

  ✓ Fully open source  -- read every line of code
  ✓ Active community   -- amd-gfx: 30+ patches/day
  ✓ Career opportunity -- AMD Markham/Shanghai hiring
  ✓ Cross-domain       -- kernel, compiler, graphics, AI
  ✓ Accessible HW      -- any AMD consumer GPU works`,
            caption: 'amdgpu 是 Linux 内核中最大的单个驱动子系统。完全开源的特性使其成为学习 GPU 驱动开发的最佳选择。',
          },
        },
        {
          title: '学习路径总览',
          content: '完成此路径后，你将能够：（1）独立阅读并理解 amdgpu 驱动源码；（2）使用 ftrace、perf 等工具分析 GPU 性能问题；（3）分析 GPU Hang 等复杂故障；（4）编写符合 Linux 内核编码规范的补丁并提交至 LKML；（5）使用 HIP 编写 GPU 计算程序；（6）理解 LLVM AMDGPU 后端的编译流程。整个路径按照依赖关系组织：先建立基础（C、Linux、计算机体系结构），再深入内核框架（DRM），然后攻克 amdgpu 驱动核心，最后扩展到 ROCm 计算和工具链。',
          diagram: {
            type: 'ascii',
            content: `学习路径模块依赖图

Phase 1: 基础                Phase 2: 内核         Phase 3: 驱动        Phase 4: 进阶
(~80h)                       (~90h)                (~100h)              (~200h)

┌──────────┐
│ M0: Intro│─────┐
│ (2h)     │     │
└──────────┘     │
                 ▼
┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
│ M0.5:    │  │M3:Kernel │  │ M5:AMDGPU│  │ M7: ROCm │
│Ecosystem │→ │ Dev      │→ │ Driver   │→ │Kernel IF │
│ (8h)     │  │ (30h)    │  │ (60h)    │  │ (40h)    │
└──────────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘
                   │             │              │
┌──────────┐  ┌────▼─────┐  ┌────▼─────┐  ┌────▼─────┐
│ M1: Prep │  │ M4: DRM  │  │ M6: Debug│  │ M8: ROCm │
│ Prereqs  │→ │ Subsys   │→ │ (40h)    │  │ Compute  │
│ (40h)    │  │ (60h)    │  └──────────┘  │ (50h)    │
└──────────┘  └──────────┘                └────┬─────┘
                                               │
┌──────────┐                              ┌────▼─────┐
│ M2: HW   │                              │ M9: LLVM │
│Interface │                              │Toolchain │
│ (40h)    │                              │ (60h)    │
└──────────┘                              └────┬─────┘
                                               │
              ┌──────────┐  ┌──────────┐  ┌────▼─────┐
              │ M10:Test │  │M11:Career│← │ All Mods │
              │ (30h)    │  │ (30h)    │  │ Converge │
              └──────────┘  └──────────┘  └──────────┘`,
            caption: '学习路径的模块依赖关系。箭头表示推荐学习顺序。M10 和 M11 是贯穿整个路径的实践模块。',
          },
        },
        {
          title: '内核驱动栈全景',
          content: '在开始学习之前，你需要建立一个关键的心理模型：Linux 内核驱动栈的分层结构。从用户空间的应用程序到 GPU 硬件，中间经过多层软件抽象。每一层都有自己的职责和接口。用户空间程序通过系统调用（ioctl）与内核通信，内核 DRM 子系统提供通用的 GPU 管理框架，amdgpu 驱动是 DRM 的具体实现，负责将抽象的 DRM 操作翻译成 GPU 硬件能理解的寄存器写入和命令包。理解这个分层结构是后续所有模块的基础。',
          diagram: {
            type: 'ascii',
            content: `Linux GPU 内核驱动栈分层模型

┌─────────────────────────────────────────────────────────────┐
│ User Space                                                   │
│                                                              │
│  Applications (Games / AI Training / Video Editing)          │
│       │                                                      │
│  Graphics API (OpenGL / Vulkan / HIP)                        │
│       │                                                      │
│  Userspace Drivers (Mesa radeonsi / radv / ROCr)             │
│       │                                                      │
│  libdrm (Userspace DRM lib, wraps ioctl calls)               │
│       │                                                      │
├───────┼──────────────────────────────────────────────────────┤
│       │  Syscall Boundary (ioctl / mmap / read / write)      │
├───────┼──────────────────────────────────────────────────────┤
│ Kernel Space                                                 │
│       │                                                      │
│       ▼                                                      │
│  DRM Core (drivers/gpu/drm/drm_*.c)                         │
│  ├── Device Mgmt (drm_device, drm_driver)                   │
│  ├── File Ops (drm_file, drm_ioctl)                         │
│  ├── GEM Memory Mgmt Framework                              │
│  └── KMS Display Mgmt Framework                             │
│       │                                                      │
│       ▼                                                      │
│  amdgpu Driver (drivers/gpu/drm/amd/)                       │
│  ├── amdgpu_drv.c     → PCI Driver Entry                    │
│  ├── amdgpu_device.c  → GPU Device Init                     │
│  ├── gfx_v11_0.c      → GFX IP (Your RDNA3)                │
│  ├── sdma_v6_0.c      → DMA Engine                          │
│  ├── dc/              → Display Core                         │
│  └── amdkfd/          → Compute Interface (KFD/ROCm)        │
│       │                                                      │
├───────┼──────────────────────────────────────────────────────┤
│       │  MMIO / PCIe                                         │
├───────┼──────────────────────────────────────────────────────┤
│       ▼                                                      │
│  GPU Hardware (RX 7600 XT / Navi33 / gfx1102)               │
│  ├── GFX Engine (Shader Cores)                               │
│  ├── SDMA Engine (DMA Transfer)                              │
│  ├── Display Engine (DCN Display Controller)                 │
│  ├── VCN (Video Codec)                                       │
│  └── VRAM (8GB GDDR6)                                        │
└─────────────────────────────────────────────────────────────┘`,
            caption: 'Linux GPU 驱动栈完整分层图。每一层都对应学习路径中的一个或多个模块。这张图是你整个学习过程的"地图"。',
          },
        },
        {
          title: '开发环境搭建',
          content: '你需要准备：一台安装了 Ubuntu 22.04 LTS 或 Arch Linux 的机器（任意一块 AMD GPU 都是很好的测试硬件，RDNA2/3 尤佳）；安装 linux-headers、build-essential、git、clang、llvm 等开发工具；克隆 Linux 内核源码（约 3GB）；安装 ROCm 开发套件。建议使用 KVM 虚拟机进行危险的内核实验，避免破坏主机系统。关键工具链：（1）内核编译：gcc/clang + make/kbuild；（2）代码阅读：cscope + ctags 或 VS Code + clangd；（3）调试：ftrace + perf + trace-cmd；（4）GPU 监控：amdgpu_top + radeontop；（5）版本控制：git + git send-email（用于提交内核补丁）。',
        },
      ],
      keyBooks: [
        {
          title: 'Linux Kernel Development',
          author: 'Robert Love',
          isbn: '978-0672329463',
          relevance: '内核开发的最佳入门书籍，覆盖内核架构、进程管理、内存管理等核心概念。',
          url: 'https://www.amazon.com/Linux-Kernel-Development-Robert-Love/dp/0672329468',
        },
        {
          title: 'Linux Device Drivers, 3rd Edition',
          author: 'Jonathan Corbet, Alessandro Rubini, Greg Kroah-Hartman',
          isbn: '978-0596005900',
          relevance: '驱动开发的圣经，虽然版本较旧但核心概念依然适用。可在 LWN.net 免费阅读。',
          url: 'https://docs.kernel.org/driver-api/index.html',
        },
        {
          title: 'Understanding the Linux Kernel',
          author: 'Daniel P. Bovet, Marco Cesati',
          isbn: '978-0596005658',
          relevance: '深入内核内部实现，包含内存管理、进程调度、中断处理的详细分析。',
        },
      ],
      onlineResources: [
        {
          title: 'The Linux Kernel Documentation',
          url: 'https://docs.kernel.org',
          type: 'doc',
          description: '官方内核文档，包含 AMDGPU 驱动的详细说明。',
        },
        {
          title: 'AMD GPU Driver Source Code',
          url: 'https://github.com/torvalds/linux/tree/master/drivers/gpu/drm/amd',
          type: 'repo',
          description: 'amdgpu 驱动在 Linux 内核中的源码位置。',
        },
        {
          title: 'LWN.net - Linux Weekly News',
          url: 'https://lwn.net',
          type: 'doc',
          description: 'Linux 内核社区的权威新闻和技术文章网站，包含大量 DRM/GPU 驱动相关的深度分析。',
        },
        {
          title: 'Phoronix - AMD Linux Coverage',
          url: 'https://www.phoronix.com/review/amd-linux-2024',
          type: 'doc',
          description: '最活跃的 Linux 硬件新闻网站，密切跟踪 AMD 驱动开发动态。',
        },
      ],
    },
    codeReading: [
      {
        title: '查看你的 GPU 信息',
        description: '使用系统工具确认 RX 7600 XT 已被正确识别，并查看驱动加载情况。',
        file: 'terminal',
        language: 'bash',
        code: `# 查看 PCI 设备列表，找到你的 AMD GPU
lspci -v | grep -A 10 "VGA\\|3D\\|Display"

# 查看 amdgpu 模块是否已加载
lsmod | grep amdgpu

# 查看内核日志中的 amdgpu 初始化信息
dmesg | grep -i amdgpu | head -30

# 查看 GPU 的详细信息
cat /sys/class/drm/card0/device/vendor
cat /sys/class/drm/card0/device/device

# 安装并使用 amdgpu_top 监控 GPU 状态
# sudo apt install amdgpu-top  (或从源码编译)
# amdgpu_top`,
        annotations: [
          'lspci 显示所有 PCI 设备，GPU 通常以 VGA compatible controller 或 Display controller 出现',
          'lsmod 列出已加载的内核模块，amdgpu 应该在列表中',
          'dmesg 包含内核启动时 amdgpu 驱动初始化的详细日志，这是调试的第一步',
          '/sys/class/drm/ 是 DRM 子系统在 sysfs 中的接口，可以读取 GPU 的各种属性',
        ],
      },
      {
        title: 'amdgpu 驱动初始化入口',
        description: '查看 amdgpu 驱动在内核中的入口函数 amdgpu_pci_probe，理解驱动如何在系统启动时初始化你的 GPU。',
        file: 'drivers/gpu/drm/amd/amdgpu/amdgpu_drv.c',
        language: 'c',
        code: `/* amdgpu_drv.c — amdgpu 驱动的 PCI 入口点
 * 当内核发现匹配的 PCI 设备时，调用此函数
 * 这是理解整个驱动初始化流程的起点
 */

/* PCI 设备 ID 表：告诉内核这个驱动支持哪些 GPU */
static const struct pci_device_id pciidlist[] = {
    /* NAVI33 — 你的 RX 7600 XT */
    {0x1002, 0x7480, PCI_ANY_ID, PCI_ANY_ID, 0, 0, CHIP_NAVI33},
    /* 0x1002 = AMD Vendor ID, 0x7480 = Navi33 Device ID */

    /* NAVI31 — RX 7900 XTX */
    {0x1002, 0x744C, PCI_ANY_ID, PCI_ANY_ID, 0, 0, CHIP_NAVI31},
    {0, 0, 0}  /* 终止符 */
};
MODULE_DEVICE_TABLE(pci, pciidlist);

/* GPU 初始化入口 — 每张 GPU 调用一次 */
static int amdgpu_pci_probe(struct pci_dev *pdev,
                             const struct pci_device_id *ent)
{
    struct drm_device *ddev;
    struct amdgpu_device *adev;
    unsigned long flags = ent->driver_data;
    int ret;

    /* 1. 启用 PCI 设备 */
    ret = pci_enable_device(pdev);
    if (ret)
        return ret;

    /* 2. 设置 DMA 掩码（GPU 需要访问所有物理内存） */
    pci_set_master(pdev);

    /* 3. 分配 DRM 设备结构体 */
    ddev = drm_dev_alloc(&amdgpu_kms_driver, &pdev->dev);

    /* 4. 初始化 amdgpu 设备（核心初始化函数） */
    adev = drm_to_adev(ddev);
    ret = amdgpu_device_init(adev, flags);
    /* → 内部会初始化所有 IP Block：GFX、SDMA、DC、VCN... */

    return 0;
}`,
        annotations: [
          '0x1002 是 AMD 的 PCI Vendor ID，0x7480 是 RX 7600 XT (Navi33) 的 Device ID',
          'CHIP_NAVI33 是内部枚举值，用于选择对应的 IP Block 实现（gfx_v11_0、sdma_v6_0 等）',
          'amdgpu_pci_probe 是整个驱动初始化的起点，从这里开始跟踪代码可以理解完整的启动流程',
          'amdgpu_device_init 是核心初始化函数，负责探测 GPU 的 IP Block 并逐个初始化',
          'dmesg 中看到的 "amdgpu: initializing..." 日志就是这个函数的输出',
        ],
      },
    ],
    miniProject: {
      title: '建立你的学习日志',
      description: '创建一个 GitHub 仓库，记录你的学习过程。这将成为你申请 AMD 时的核心 Portfolio。',
      objectives: [
        '创建一个名为 amd-driver-journey 的 GitHub 仓库',
        '记录你的 GPU 信息和系统配置',
        '写下你的学习目标和时间计划',
      ],
      steps: [
        '在 GitHub 创建新仓库 amd-driver-journey，设为 Public',
        '创建 README.md，写入你的 GPU 型号（如 RX 7600 XT / RX 7900 XTX 等）和学习目标',
        '创建 journal/ 目录，开始记录每天的学习笔记',
        '将 lspci 和 dmesg 的输出保存到 hardware-info.txt',
      ],
      expectedOutput: '一个公开的 GitHub 仓库，包含你的 GPU 信息和学习计划，这是你 AMD 工程师之路的第一步。',
      githubTemplate: 'https://github.com/torvalds/linux',
    },
    interviewQuestions: [
      {
        question: '请介绍一下你的 AMD GPU 驱动学习经历和动机。',
        difficulty: 'easy',
        hint: '这是一个开放性问题，重点展示你的热情、学习路径和具体成果（补丁、项目）。',
        answer: '回答要点：（1）具体说明你使用的硬件（RX 7600 XT）；（2）描述你学习的具体模块（DRM、AMDGPU、ROCm 等）；（3）展示具体成果（GitHub 仓库、提交的补丁、分析的 Bug 报告）；（4）表达对 AMD 开源生态的热情。',
      },
      {
        question: 'Linux 内核驱动和用户空间程序的主要区别是什么？',
        difficulty: 'easy',
        hint: '从内存空间、权限、错误处理、可用库等角度思考。',
        answer: '内核驱动运行在内核空间（Ring 0），拥有最高权限，可以直接访问硬件寄存器；没有标准 C 库（libc），不能使用 malloc/printf 等函数；错误会导致整个系统崩溃（Kernel Panic）；使用 kmalloc/kfree 管理内存；通过 printk 输出日志。用户程序运行在用户空间（Ring 3），通过系统调用访问内核功能，错误只影响自身进程。',
      },
      {
        question: '描述 Linux 内核中 GPU 驱动的分层架构，从用户空间的 OpenGL 调用到 GPU 硬件执行。',
        difficulty: 'medium',
        hint: '从 Mesa → libdrm → ioctl → DRM core → amdgpu → MMIO → GPU Hardware 的路径描述。',
        answer: '完整路径：（1）用户空间应用调用 OpenGL/Vulkan API；（2）Mesa 3D 库（radeonsi/radv）将 API 调用转换为 GPU 命令，使用 libdrm 封装 ioctl 调用；（3）ioctl 系统调用进入内核，DRM 核心层（drm_ioctl.c）根据 ioctl 编号分发到对应的处理函数；（4）amdgpu 驱动的 ioctl 处理函数（如 amdgpu_cs_ioctl）将用户提交的命令缓冲区验证并提交到 GPU Ring Buffer；（5）驱动通过 MMIO 写入 GPU 的 Doorbell 寄存器，通知 GPU 有新命令需要执行；（6）GPU 的 Command Processor（CP）从 Ring Buffer 读取命令包（PM4 格式）并执行；（7）GPU 完成后通过中断通知 CPU，驱动更新 fence 状态。',
      },
      {
        question: 'amdgpu 驱动是 Linux 内核中最大的单个驱动，它的代码是如何组织的？',
        difficulty: 'medium',
        hint: '从 IP Block 架构、文件命名规则和关键目录结构来回答。',
        answer: 'amdgpu 驱动（drivers/gpu/drm/amd/）采用 IP Block 架构组织代码。每个硬件功能模块（IP Block）有独立的实现文件，文件命名遵循 <ip_name>_v<major>_<minor>.c 格式（如 gfx_v11_0.c 对应 RDNA3 的图形引擎）。关键目录：amdgpu/ — 驱动核心（设备管理、内存管理、命令提交）；display/dc/ — Display Core（显示输出，AMD 自己的抽象层）；amdkfd/ — KFD 计算驱动（ROCm 内核接口）；pm/ — 电源管理（SMU 固件接口）；include/ — 硬件寄存器定义和 IP 头文件。每个 IP Block 实现一组标准回调函数（init、fini、suspend、resume、hw_init、hw_fini），由 amdgpu_device.c 统一管理生命周期。',
      },
      {
        question: '什么是 PCIe BAR（Base Address Register）？GPU 驱动如何使用它与 GPU 硬件通信？',
        difficulty: 'hard',
        hint: '从 MMIO 映射、BAR 空间的类型（VRAM BAR、Register BAR、Doorbell BAR）角度回答。',
        answer: 'PCIe BAR 是 GPU 暴露给 CPU 的物理地址窗口，CPU 通过读写这些地址来与 GPU 通信。amdgpu 驱动使用三个关键 BAR：（1）BAR 0（VRAM BAR）：映射 GPU 的显存（VRAM），CPU 可以直接读写 VRAM 内容，大小取决于 Resizable BAR 是否启用（未启用时通常只有 256MB 窗口）；（2）BAR 2（Register BAR / MMIO）：映射 GPU 的控制寄存器，驱动通过 writel()/readl() 读写寄存器来控制 GPU；例如写入 GRBM_GFX_CNTL 寄存器可以选择当前操作的 Shader Engine；（3）BAR 4（Doorbell BAR）：映射 GPU 的 Doorbell 空间，驱动写入 Doorbell 寄存器来通知 GPU 有新的命令需要处理，这是命令提交的关键路径。在驱动初始化时，amdgpu_device_init() 调用 pci_resource_start/len 获取 BAR 的物理地址，然后通过 ioremap 映射到内核虚拟地址空间。',
      },
    ],
  },
  ecosystemModule,
  {
    id: 'prerequisites',
    number: '1',
    title: '基础准备',
    titleEn: 'Prerequisites',
    icon: '⚙️',
    description: '夯实三大基础：C/C++ 编程、Linux 工具链和计算机体系结构。这是理解一切驱动代码的前提。',
    estimatedHours: 80,
    difficulty: 'beginner',
    subModules: [
      { id: 'prereq-c', title: '1.1 C/C++ 编程核心', titleEn: 'C/C++ Programming Core' },
      { id: 'prereq-tools', title: '1.2 Linux 工具链', titleEn: 'Linux Toolchain' },
      { id: 'prereq-arch', title: '1.3 计算机体系结构', titleEn: 'Computer Architecture' },
    ],
    theory: {
      overview: '驱动开发以 C 语言为主，C++ 在部分用户态工具中使用。你需要对指针、内存模型、位操作有深刻理解。同时，Linux 工具链（Git、Make、GDB）和计算机体系结构知识（Cache、虚拟内存、中断）是 AMD 面试的必考内容。',
      sections: [
        {
          title: 'C 语言：指针与内存模型',
          content: '内核代码大量使用指针，包括函数指针、void 指针和指向结构体的指针。你必须深刻理解：栈（Stack）与堆（Heap）的区别；指针算术运算；结构体内存布局与对齐（alignment）；位字段（bit fields）的使用——内核中大量使用位操作来操控硬件寄存器。例如，amdgpu 驱动中读写 GPU 寄存器的代码如下：WREG32(mmSRBM_GFX_CNTL, (vmid << SRBM_GFX_CNTL__VMID__SHIFT))，这需要你理解位移和掩码操作。',
          diagram: {
            type: 'ascii',
            content: `
  内存布局示意图
  ┌─────────────────┐  高地址
  │  Kernel Space    │  (Ring 0, drivers run here)
  │  (3GB~4GB)       │
  ├─────────────────┤  0xC0000000
  │  User Stack      │  (grows down)
  │        ↓         │
  │  ...free...      │
  │        ↑         │
  │  User Heap       │  (grows up)
  ├─────────────────┤
  │  BSS Segment     │  (uninitialized globals)
  │  Data Segment    │  (initialized globals)
  │  Text Segment    │  (code)
  └─────────────────┘  低地址 0x00000000`,
            caption: '32位系统的虚拟内存布局（简化版）。内核驱动运行在内核空间，拥有访问所有物理内存的权限。',
          },
        },
        {
          title: 'Linux 工具链：Git 补丁流程',
          content: 'Git 在内核开发中的使用方式与普通项目不同。内核社区使用邮件列表（Mailing List）而非 GitHub Pull Request 来提交代码。你需要掌握：git format-patch 生成补丁文件；git send-email 通过邮件发送补丁；git am 应用收到的补丁；git log --oneline 查看提交历史；checkpatch.pl 检查代码风格。这套流程是进入 AMD 内核团队的必备技能。',
        },
        {
          title: '计算机体系结构：Cache 一致性',
          content: 'Cache 一致性（Cache Coherence）是 AMD 面试的高频考题。在多核系统中，每个 CPU 核心都有自己的 L1/L2 Cache。当多个核心同时访问同一块内存时，如何保证各核心 Cache 中的数据一致，就是 Cache 一致性问题。AMD 使用 MESI 协议（Modified, Exclusive, Shared, Invalid）来解决这个问题。在驱动开发中，当 CPU 和 GPU 共享内存（如 DMA Buffer）时，你需要显式地进行 Cache 刷新（cache flush）或失效（cache invalidate）操作，否则 GPU 可能读到过期的数据。',
          diagram: {
            type: 'ascii',
            content: `
  MESI Cache 一致性协议状态转换

  ┌──────────┐    Local Read Hit   ┌──────────┐
  │ Modified │ ◄──────────────── │ Exclusive│
  │  (M)     │                   │  (E)     │
  │ Dirty    │                   │ Clean    │
  └──────────┘                   └──────────┘
       │                              │
       │ Other Core Read              │ Other Core Read
       ▼                              ▼
  ┌──────────┐                   ┌──────────┐
  │  Shared  │                   │ Invalid  │
  │  (S)     │                   │  (I)     │
  │ ReadOnly │                   │ Stale    │
  └──────────┘                   └──────────┘`,
            caption: 'MESI 协议的四种状态。GPU 驱动在进行 DMA 传输前后，需要正确处理 Cache 状态以避免数据不一致。',
          },
        },
        {
          title: '虚拟内存与页表',
          content: '现代操作系统使用虚拟内存（Virtual Memory）机制，每个进程都有独立的虚拟地址空间。CPU 的 MMU（Memory Management Unit）负责将虚拟地址翻译成物理地址，这个翻译过程通过多级页表（Page Table）完成。在 GPU 驱动中，GPU 也有自己的 IOMMU（Input-Output Memory Management Unit），负责将 GPU 的虚拟地址翻译成系统物理地址。理解这个机制对于理解 AMDGPU 的 VRAM 管理和 DMA 操作至关重要。',
        },
      ],
      keyBooks: [
        {
          title: 'The C Programming Language (K&R)',
          author: 'Brian W. Kernighan, Dennis M. Ritchie',
          isbn: '978-0131103627',
          relevance: 'C 语言的权威教材，内核代码风格深受其影响。必读。',
        },
        {
          title: 'Computer Organization and Design RISC-V Edition',
          author: 'David A. Patterson, John L. Hennessy',
          isbn: '978-0128203316',
          relevance: '计算机体系结构的权威教材，Cache、流水线、内存层次结构的最佳参考。',
        },
        {
          title: 'Understanding the Linux Kernel',
          author: 'Daniel P. Bovet, Marco Cesati',
          isbn: '978-0596005658',
          relevance: '深入讲解 Linux 内核的内存管理、进程调度、文件系统等核心机制。',
        },
      ],
      onlineResources: [
        {
          title: 'Linux Kernel Coding Style',
          url: 'https://docs.kernel.org/process/coding-style.html',
          type: 'doc',
          description: 'Linux 内核官方编码规范，提交补丁前必须遵守。',
        },
        {
          title: 'Git send-email Tutorial',
          url: 'https://git-send-email.io',
          type: 'doc',
          description: '学习如何使用 git send-email 向内核邮件列表发送补丁。',
        },
      ],
    },
    codeReading: [
      {
        title: '内核中的位操作示例',
        description: '分析 amdgpu 驱动中典型的寄存器读写操作，理解位操作在驱动中的应用。',
        file: 'drivers/gpu/drm/amd/amdgpu/amdgpu_ring.h',
        language: 'c',
        code: `/* 来自 Linux 内核 amdgpu 驱动 */

/* 寄存器读写宏 - 这是驱动与硬件通信的基础 */
#define RREG32(reg)   amdgpu_device_rreg(adev, (reg), 0)
#define WREG32(reg, v) amdgpu_device_wreg(adev, (reg), (v), 0)

/* 位操作宏 - 用于操控寄存器中的特定位域 */
#define REG_GET_FIELD(value, reg, field)  \\
    (((value) & REG_FIELD_MASK(reg, field)) >> \\
     REG_FIELD_SHIFT(reg, field))

#define REG_SET_FIELD(orig_val, reg, field, field_val) \\
    (((orig_val) & ~REG_FIELD_MASK(reg, field)) | \\
     (REG_FIELD_MASK(reg, field) & ((field_val) << \\
     REG_FIELD_SHIFT(reg, field))))

/* 使用示例：设置 VMID 字段 */
/* tmp = RREG32(mmSRBM_GFX_CNTL);                    */
/* tmp = REG_SET_FIELD(tmp, SRBM_GFX_CNTL, VMID, 5); */
/* WREG32(mmSRBM_GFX_CNTL, tmp);                     */`,
        annotations: [
          'RREG32/WREG32 是读写 GPU MMIO 寄存器的核心宏，所有硬件控制都通过这两个宏完成',
          'REG_GET_FIELD 使用掩码（mask）和位移（shift）从寄存器值中提取特定字段',
          'REG_SET_FIELD 先清除目标位域（~mask），再设置新值（field_val << shift）',
          '这种位操作模式在整个 amdgpu 驱动中无处不在，必须熟练掌握',
        ],
      },
    ],
    miniProject: {
      title: '编写一个内核模块：读取 CPU 信息',
      description: '编写你的第一个 Linux 内核模块，在加载时读取并打印 CPU 信息。这是进入内核世界的第一步。',
      objectives: [
        '理解内核模块的基本结构（init/exit 函数）',
        '学会使用 printk 输出内核日志',
        '掌握 insmod/rmmod/dmesg 的使用',
      ],
      steps: [
        '创建 hello_kernel.c，实现 module_init 和 module_exit 函数',
        '创建 Makefile，使用内核构建系统编译模块',
        '使用 sudo insmod hello_kernel.ko 加载模块',
        '使用 dmesg | tail 查看输出',
        '使用 sudo rmmod hello_kernel 卸载模块',
      ],
      expectedOutput: '一个可以成功加载和卸载的内核模块，在 dmesg 中打印 "Hello, AMD Driver World!" 和 CPU 型号信息。',
    },
    interviewQuestions: [
      {
        question: '解释 Cache 一致性（Cache Coherence）问题，以及它在 GPU 驱动中的影响。',
        difficulty: 'hard',
        hint: '从 MESI 协议出发，联系到 DMA Buffer 的 Cache 管理。',
        answer: '在多核系统中，每个 CPU 核心有独立的 L1/L2 Cache。当 CPU 写入一块内存后，数据可能只在 Cache 中，尚未写回主内存（DRAM）。如果此时 GPU 通过 DMA 读取这块内存，它读到的是旧数据，导致错误。解决方案：（1）CPU 写完后调用 dma_sync_single_for_device() 将 Cache 数据刷新到内存；（2）GPU 写完后调用 dma_sync_single_for_cpu() 使 CPU Cache 失效，强制 CPU 从内存重新读取。MESI 协议（Modified/Exclusive/Shared/Invalid）是硬件层面的 CPU 间 Cache 一致性协议，但它不覆盖 CPU 与 GPU 之间的一致性，这需要软件（驱动）来保证。',
      },
      {
        question: '什么是虚拟内存？内核驱动如何将物理地址映射到虚拟地址？',
        difficulty: 'medium',
        hint: '提到 ioremap、mmap、page table 等概念。',
        answer: '虚拟内存是一种内存管理技术，让每个进程都以为自己拥有独立的、连续的大内存空间，而实际的物理内存可能是碎片化的。CPU 的 MMU 通过多级页表（Page Table）完成虚拟地址到物理地址的翻译。在内核驱动中：（1）ioremap() 将 GPU 的 MMIO（Memory-Mapped I/O）物理地址映射到内核虚拟地址空间，使驱动可以通过普通内存读写来操控 GPU 寄存器；（2）vmalloc() 分配虚拟地址连续但物理地址不连续的内存；（3）kmalloc() 分配物理地址连续的内存（适合 DMA）。',
      },
      {
        question: '解释 Linux 内核中的 GFP_KERNEL 和 GFP_ATOMIC 的区别。',
        difficulty: 'medium',
        hint: '从是否可以睡眠（sleep）的角度思考。',
        answer: 'GFP_KERNEL 是最常用的内存分配标志，允许分配过程睡眠（sleep），即如果当前没有空闲内存，内核可以等待内存回收。因此只能在可以睡眠的上下文中使用（如进程上下文）。GFP_ATOMIC 用于不能睡眠的上下文，如中断处理函数（interrupt handler）、持有自旋锁（spinlock）时。它从紧急内存池分配，不会睡眠，但可能失败（返回 NULL）。在 amdgpu 驱动中，中断处理函数中必须使用 GFP_ATOMIC，而正常的内存分配使用 GFP_KERNEL。',
      },
    ],
  },
  {
    id: 'hardware',
    number: '2',
    title: '硬件接口基础',
    titleEn: 'Hardware Interface Basics',
    icon: '🔌',
    description: '理解 CPU 与 GPU 通信的物理和协议基础：PCIe 总线、DMA 传输和中断机制。这是理解所有驱动的基石。',
    estimatedHours: 40,
    difficulty: 'intermediate',
    subModules: [
      { id: 'hw-pcie', title: '2.1 PCIe 协议', titleEn: 'PCIe Protocol' },
      { id: 'hw-dma', title: '2.2 DMA 传输', titleEn: 'DMA Engine' },
      { id: 'hw-irq', title: '2.3 中断机制', titleEn: 'Interrupt Mechanism' },
    ],
    theory: {
      overview: 'PCIe（Peripheral Component Interconnect Express）是现代 GPU 连接到 CPU 的标准接口。AMD GPU（如 RX 7600 XT / RX 7900 XTX 等）通过 PCIe 插槽与主板相连，常见为 PCIe 4.0 x8 或 x16。理解 PCIe 的枚举、BAR 内存映射、DMA 传输和 MSI 中断，是理解 amdgpu 驱动如何初始化和操控 GPU 硬件的关键。',
      sections: [
        {
          title: 'PCIe 枚举与配置空间',
          content: '系统启动时，BIOS/UEFI 会扫描所有 PCIe 总线，发现并配置每个设备，这个过程叫做 PCIe 枚举（Enumeration）。每个 PCIe 设备都有一个 256 字节的配置空间（Configuration Space），包含设备的 Vendor ID（AMD 是 0x1002）、Device ID（RX 7600 XT 是 0x7480）、BAR 寄存器等关键信息。Linux 内核在启动时会完成 PCIe 枚举，并通过 /sys/bus/pci/devices/ 暴露给用户空间。amdgpu 驱动通过 pci_driver 结构体注册，当内核发现匹配的设备 ID 时，自动调用驱动的 probe 函数。',
          diagram: {
            type: 'ascii',
            content: `
  PCIe 配置空间（前 64 字节，标准头部）

  偏移  31      16 15       0
  0x00 ┌──────────┬──────────┐
       │ Device ID│ Vendor ID│  AMD: VendorID=0x1002
  0x04 ├──────────┴──────────┤
       │      Status/Command  │
  0x08 ├─────────────────────┤
       │  Class Code / RevID  │  GPU: Class=0x030200
  0x0C ├─────────────────────┤
       │    Header Type etc.  │
  0x10 ├─────────────────────┤
       │        BAR 0         │  MMIO 寄存器基地址
  0x14 ├─────────────────────┤
       │        BAR 1         │  MMIO 高32位
  0x18 ├─────────────────────┤
       │        BAR 2         │  VRAM 基地址
  0x1C ├─────────────────────┤
       │        BAR 3         │  VRAM 高32位
  0x20 ├─────────────────────┤
       │        BAR 4         │  I/O 空间
  0x24 ├─────────────────────┤
       │        BAR 5         │  
  ...  └─────────────────────┘`,
            caption: 'PCIe 配置空间的标准头部结构。BAR（Base Address Register）定义了设备的内存区域，amdgpu 驱动通过 BAR0 访问 GPU 寄存器，通过 BAR2 访问 VRAM。',
          },
        },
        {
          title: 'BAR 内存映射与 MMIO',
          content: 'BAR（Base Address Register）是 PCIe 配置空间中的关键字段，它告诉操作系统这个设备需要多少内存空间，以及这些空间的类型（MMIO 或 I/O 端口）。对于 AMD GPU，BAR0 通常映射 GPU 的 MMIO 寄存器空间（256MB），BAR2 映射 VRAM（显存）。操作系统在枚举时会为这些 BAR 分配物理地址。驱动通过 pci_iomap() 或 ioremap() 将这些物理地址映射到内核虚拟地址空间，之后就可以像读写普通内存一样来读写 GPU 寄存器，这就是 MMIO（Memory-Mapped I/O）。',
        },
        {
          title: 'DMA 与 IOMMU',
          content: 'DMA（Direct Memory Access）允许 GPU 直接读写系统内存（RAM），而无需 CPU 介入，从而实现高效的数据传输。例如，当你上传纹理数据到 GPU 时，GPU 的 DMA 引擎直接从 RAM 读取数据写入 VRAM，CPU 只需发出命令即可。IOMMU（Input-Output Memory Management Unit）是 DMA 的"守门员"，它为每个 PCIe 设备提供独立的地址空间（IOVA），并将 IOVA 翻译成物理地址。IOMMU 的主要作用是安全隔离（防止恶意设备访问任意内存）和地址翻译（让设备可以访问非连续的物理内存）。在 AMD 平台上，这个功能叫做 AMD-Vi。',
        },
        {
          title: 'MSI/MSI-X 中断',
          content: '传统的 PCI 中断（Legacy INTx）通过共享中断线（IRQ）工作，效率低下。现代 PCIe 设备使用 MSI（Message Signaled Interrupts）或 MSI-X。MSI 允许设备通过向特定内存地址写入数据来触发中断，而无需物理中断线。MSI-X 是 MSI 的扩展，支持多达 2048 个独立中断向量，每个中断可以路由到不同的 CPU 核心，非常适合高性能设备如 GPU。amdgpu 驱动使用 MSI-X 来处理来自 GPU 的各种事件（命令完成、显示同步、错误等）。',
        },
      ],
      keyBooks: [
        {
          title: 'PCI Express System Architecture',
          author: 'Mindshare Inc.',
          isbn: '978-0321156303',
          relevance: 'PCIe 协议的权威参考书，深入讲解 PCIe 的物理层、数据链路层和事务层。',
        },
        {
          title: 'Linux Device Drivers, 3rd Edition',
          author: 'Corbet, Rubini, Kroah-Hartman',
          relevance: '第 12-15 章专门讲解 PCI 驱动、DMA 和中断处理，是必读章节。',
          url: 'https://docs.kernel.org/driver-api/index.html',
        },
      ],
      onlineResources: [
        {
          title: 'PCIe Explained - How PCIe Works',
          url: 'https://docs.kernel.org/PCI/pci.html',
          type: 'doc',
          description: 'Linux 内核官方 PCI 驱动编写指南。',
        },
        {
          title: 'DMA API Guide',
          url: 'https://docs.kernel.org/core-api/dma-api.html',
          type: 'doc',
          description: 'Linux 内核 DMA API 的完整文档，包含 coherent DMA 和 streaming DMA 的使用方法。',
        },
        {
          title: 'IOMMU Introduction',
          url: 'https://docs.kernel.org/arch/x86/iommu.html',
          type: 'doc',
          description: 'Linux 内核 IOMMU 子系统文档。',
        },
      ],
    },
    codeReading: [
      {
        title: 'amdgpu PCI 设备初始化',
        description: '分析 amdgpu 驱动如何注册为 PCI 驱动，以及 probe 函数的核心流程。',
        file: 'drivers/gpu/drm/amd/amdgpu/amdgpu_drv.c',
        language: 'c',
        code: `/* amdgpu 驱动的 PCI 设备 ID 表（部分） */
static const struct pci_device_id pciidlist[] = {
    /* Navi31 - RX 7900 XTX */
    {0x1002, 0x744C, PCI_ANY_ID, PCI_ANY_ID, 0, 0, CHIP_NAVI31},
    /* Navi33 - RX 7600 XT (你的显卡!) */
    {0x1002, 0x7480, PCI_ANY_ID, PCI_ANY_ID, 0, 0, CHIP_NAVI33},
    {0, 0, 0}  /* 终止符 */
};
MODULE_DEVICE_TABLE(pci, pciidlist);

/* PCI 驱动结构体 */
static struct pci_driver amdgpu_kms_pci_driver = {
    .name           = DRIVER_NAME,
    .id_table       = pciidlist,
    .probe          = amdgpu_pci_probe,    /* 设备发现时调用 */
    .remove         = amdgpu_pci_remove,   /* 设备移除时调用 */
    .shutdown       = amdgpu_pci_shutdown, /* 系统关机时调用 */
    .driver.pm      = &amdgpu_pm_ops,      /* 电源管理回调 */
};

/* probe 函数：当内核发现匹配的 PCI 设备时调用 */
static int amdgpu_pci_probe(struct pci_dev *pdev,
                             const struct pci_device_id *ent)
{
    /* 1. 启用 PCI 设备 */
    ret = pci_enable_device(pdev);
    
    /* 2. 请求 BAR 资源（MMIO 和 VRAM 地址空间） */
    ret = pci_request_regions(pdev, "amdgpu");
    
    /* 3. 设置 DMA 掩码（GPU 支持 44 位物理地址） */
    ret = dma_set_mask_and_coherent(&pdev->dev, DMA_BIT_MASK(44));
    
    /* 4. 启用 PCIe Bus Master（允许 GPU 发起 DMA） */
    pci_set_master(pdev);
    
    /* 5. 初始化 amdgpu 设备结构体 */
    return amdgpu_driver_load_kms(adev, ent->driver_data);
}`,
        annotations: [
          'pci_device_id 表定义了驱动支持的所有设备，0x1002 是 AMD 的 Vendor ID，0x7480 是 RX 7600 XT 的 Device ID',
          'MODULE_DEVICE_TABLE 宏让内核知道这个模块支持哪些设备，用于自动加载',
          'probe 函数是 PCI 驱动的核心，每当内核发现匹配的设备就会调用它',
          'pci_enable_device 激活设备，pci_request_regions 独占 BAR 资源，防止其他驱动访问',
          'dma_set_mask 告诉内核 GPU 的 DMA 能力（可以访问多少位的物理地址）',
          'pci_set_master 启用 Bus Master，这是 GPU 发起 DMA 传输的必要条件',
        ],
      },
    ],
    miniProject: {
      title: '编写一个简单的 PCI 设备扫描器',
      description: '编写一个内核模块，扫描系统中所有 AMD PCI 设备，打印它们的 BAR 信息。',
      objectives: [
        '理解 PCI 驱动的注册和 probe 流程',
        '学会读取 PCI 配置空间',
        '理解 BAR 的类型和大小',
      ],
      steps: [
        '编写内核模块，注册一个 pci_driver，device ID 匹配所有 AMD 设备（vendor=0x1002）',
        '在 probe 函数中，遍历所有 BAR，打印每个 BAR 的起始地址、大小和类型',
        '使用 pci_resource_start(), pci_resource_len(), pci_resource_flags() 读取 BAR 信息',
        '对比 lspci -v 的输出，验证你的结果',
      ],
      expectedOutput: '内核日志中显示 RX 7600 XT 的所有 BAR 信息，包括 MMIO 寄存器空间（BAR0，约 256MB）和 VRAM 空间（BAR2，约 8GB）。',
    },
    interviewQuestions: [
      {
        question: '解释 PCIe BAR（Base Address Register）的作用，以及 GPU 驱动如何使用它。',
        difficulty: 'medium',
        hint: '从 BAR 的类型（MMIO vs I/O）、大小、以及驱动如何通过 ioremap 访问它来回答。',
        answer: 'BAR 是 PCIe 配置空间中的寄存器，用于描述设备需要的内存区域。GPU 通常有多个 BAR：BAR0/1 映射 GPU 的 MMIO 寄存器空间（驱动通过这里读写 GPU 控制寄存器）；BAR2/3 映射 VRAM（显存，用于 CPU 直接访问显存）；BAR4 有时用于 I/O 端口。驱动使用流程：（1）pci_request_regions() 独占 BAR 资源；（2）pci_iomap() 或 ioremap() 将 BAR 的物理地址映射到内核虚拟地址；（3）之后通过 readl()/writel() 或自定义宏读写寄存器；（4）驱动卸载时调用 iounmap() 和 pci_release_regions() 释放资源。',
      },
      {
        question: '什么是 DMA？为什么 GPU 驱动需要 DMA？解释 coherent DMA 和 streaming DMA 的区别。',
        difficulty: 'hard',
        hint: '从 CPU 参与度、Cache 一致性、使用场景三个角度区分。',
        answer: 'DMA（Direct Memory Access）允许外设（如 GPU）直接读写系统内存，无需 CPU 参与数据传输，大幅提高效率。GPU 驱动需要 DMA 来上传纹理、顶点数据，以及传输命令缓冲区。Coherent DMA（一致性 DMA）：分配的内存对 CPU 和设备都是 Cache 一致的，任何一方的写入对另一方立即可见，无需手动同步；适合频繁双向交互的小块内存（如命令环形缓冲区 Command Ring）；使用 dma_alloc_coherent() 分配。Streaming DMA（流式 DMA）：用于大块数据的单向传输（如纹理上传）；需要手动调用 dma_sync_*() 函数来同步 Cache；使用 dma_map_single() 或 dma_map_sg() 映射。',
      },
      {
        question: '解释 MSI-X 中断的优势，以及 GPU 驱动如何使用它。',
        difficulty: 'medium',
        hint: '对比 Legacy INTx，强调多向量、CPU 亲和性。',
        answer: 'Legacy INTx 中断通过共享物理中断线工作，所有设备共享少量 IRQ，效率低，且需要中断处理函数轮询判断是哪个设备触发的。MSI-X 的优势：（1）每个中断向量独立，无需共享；（2）最多 2048 个向量，可以为不同功能分配不同中断（如 amdgpu 为 display、compute、sdma 分别分配中断）；（3）每个向量可以独立设置 CPU 亲和性（affinity），将中断路由到特定 CPU 核心，减少跨核通信；（4）通过写内存触发，比物理中断线更快。amdgpu 驱动使用 pci_alloc_irq_vectors() 申请 MSI-X 向量，然后为每个向量注册独立的中断处理函数。',
      },
    ],
  },
  {
    id: 'kernel',
    number: '3',
    title: 'Linux 内核与驱动入门',
    titleEn: 'Kernel & Driver Basics',
    icon: '🐧',
    description: '掌握通用 Linux 设备驱动的开发范式。从内核模块到 PCI 驱动，这是进入 amdgpu 源码的门票。',
    estimatedHours: 60,
    difficulty: 'intermediate',
    subModules: [
      { id: 'kernel-build', title: '3.1 内核编译与模块', titleEn: 'Kernel Build & Modules' },
      { id: 'kernel-char', title: '3.2 字符设备驱动', titleEn: 'Character Device Driver' },
      { id: 'kernel-pci', title: '3.3 PCI 设备驱动', titleEn: 'PCI Device Driver' },
    ],
    theory: {
      overview: '这个模块将带你从零开始编写真正的 Linux 内核驱动。我们从最简单的 Hello World 内核模块开始，逐步过渡到字符设备驱动，最终实现一个完整的 PCI 设备驱动框架。PCI 驱动是进入 amdgpu 源码的直接前置知识。',
      sections: [
        {
          title: '内核模块基础',
          content: '内核模块（Kernel Module）是可以动态加载和卸载的内核代码片段，无需重新编译整个内核。每个模块必须实现两个函数：module_init()（加载时调用）和 module_exit()（卸载时调用）。模块使用 MODULE_LICENSE("GPL") 声明许可证，使用 MODULE_AUTHOR 和 MODULE_DESCRIPTION 提供元信息。内核模块不能使用标准 C 库（libc），而是使用内核提供的函数（如 printk 代替 printf，kmalloc 代替 malloc）。',
          diagram: {
            type: 'ascii',
            content: `
  内核模块生命周期

  用户执行 insmod module.ko
         │
         ▼
  ┌─────────────────┐
  │  module_init()  │  ← Register device, alloc resources, init structs
  └────────┬────────┘
           │
           ▼
  ┌─────────────────┐
  │ Module Running  │  ← Handle syscalls, interrupts, HW interaction
  └────────┬────────┘
           │
  用户执行 rmmod module
           │
           ▼
  ┌─────────────────┐
  │  module_exit()  │  ← Unregister device, free resources, cleanup
  └─────────────────┘`,
            caption: '内核模块的生命周期。init 和 exit 函数必须成对实现，确保资源的正确申请和释放，避免内存泄漏。',
          },
        },
        {
          title: '字符设备驱动与 DRM 设备',
          content: '字符设备（Character Device）是 Linux 中最基本的设备类型，以字节流方式访问。字符设备驱动需要实现 file_operations 结构体中的回调函数：open、release、read、write、ioctl 等。DRM 设备（/dev/dri/card0）就是一种特殊的字符设备，它的 file_operations 在 drm_fops.c 中定义，核心操作是 ioctl（drm_ioctl）。amdgpu 驱动通过 DRM 框架注册 file_operations，不需要直接实现字符设备的底层细节，但理解这个框架有助于理解 DRM 如何将用户空间的 ioctl 调用分发到 amdgpu 驱动的各个处理函数。',
          diagram: {
            type: 'ascii',
            content: `字符设备 → DRM 设备 → amdgpu 驱动

用户空间:  open("/dev/dri/card0")
               │
               ▼
┌──────────────────────────────────────────────────┐
│  VFS (Virtual File System)                        │
│  → Find inode → Locate file_operations            │
└──────────────────────┬───────────────────────────┘
                       │
┌──────────────────────▼───────────────────────────┐
│  DRM file_operations (drm_fops.c)                 │
│                                                    │
│  .open    = drm_open      → Create drm_file       │
│  .release = drm_release   → Cleanup drm_file      │
│  .unlocked_ioctl = drm_ioctl → Dispatch DRM Cmd   │
│  .mmap    = drm_gem_mmap  → Map GEM BO            │
└──────────────────────┬───────────────────────────┘
                       │ drm_ioctl dispatch
┌──────────────────────▼───────────────────────────┐
│  amdgpu ioctl Table (amdgpu_ioctls.c)             │
│                                                    │
│  DRM_IOCTL_AMDGPU_GEM_CREATE → amdgpu_gem_create │
│  DRM_IOCTL_AMDGPU_CS         → amdgpu_cs_ioctl   │
│  DRM_IOCTL_AMDGPU_INFO       → amdgpu_info_ioctl │
└──────────────────────────────────────────────────┘`,
            caption: '从用户空间 open() 到 amdgpu 驱动的完整调用路径。DRM 框架提供通用的 file_operations，amdgpu 通过 ioctl 表注册驱动特定的操作。',
          },
        },
        {
          title: '内核同步机制',
          content: '内核驱动在多核环境下运行，必须正确处理并发访问。Linux 内核提供多种同步原语：自旋锁（Spinlock）：适用于短临界区，等待时不睡眠，可用于中断上下文；互斥锁（Mutex）：适用于长临界区，等待时可睡眠，不能用于中断上下文；读写锁（RW Lock）：允许多个读者并发，写者独占；原子操作（Atomic Operations）：对整数的原子读-改-写操作，无需加锁。amdgpu 驱动中大量使用这些同步机制，例如 VRAM 管理器使用 mutex 保护（amdgpu_vram_mgr.c 中的 mgr->lock），中断处理使用 spinlock（amdgpu_irq.c 中的 adev->irq.lock），fence 引用计数使用 atomic 操作。',
          diagram: {
            type: 'ascii',
            content: `内核同步机制选择决策树

需要同步？
    │
    ▼
可能睡眠？ ──── 否 ──→ 在中断上下文？
    │                        │
    是                       是 → Spinlock (spin_lock_irqsave)
    │                        │
    ▼                        否 → Spinlock (spin_lock)
只是整数操作？
    │
    是 → Atomic (atomic_inc, atomic_dec_and_test)
    │
    否
    │
    ▼
多读少写？ ─── 是 ──→ RW Semaphore (down_read / down_write)
    │
    否 → Mutex (mutex_lock / mutex_unlock)

amdgpu 中的实际使用：
┌───────────────────┬────────────────────────────────────┐
│ Spinlock          │ adev->irq.lock (IRQ handling)      │
│                   │ ring->fence_lock (fence update)    │
├───────────────────┼────────────────────────────────────┤
│ Mutex             │ adev->vram_mgr.lock (VRAM alloc)   │
│                   │ adev->pm.mutex (Power Mgmt)        │
├───────────────────┼────────────────────────────────────┤
│ RW Semaphore      │ adev->reset.sem (GPU reset guard)  │
├───────────────────┼────────────────────────────────────┤
│ Atomic            │ fence->refcount (Ref Counting)     │
│                   │ adev->in_gpu_reset (reset flag)    │
└───────────────────┴────────────────────────────────────┘`,
            caption: '内核同步机制选择指南及 amdgpu 驱动中的实际使用。选择错误的同步原语（如在中断上下文使用 mutex）会导致死锁或系统崩溃。',
          },
        },
      ],
      keyBooks: [
        {
          title: 'Linux Device Drivers, 3rd Edition',
          author: 'Corbet, Rubini, Kroah-Hartman',
          relevance: '驱动开发的圣经，第 2-6 章讲解字符设备，第 12 章讲解 PCI 驱动。',
          url: 'https://docs.kernel.org/driver-api/index.html',
        },
        {
          title: 'Linux Kernel Development, 3rd Edition',
          author: 'Robert Love',
          isbn: '978-0672329463',
          relevance: '第 5 章（系统调用）、第 7 章（中断）、第 8 章（下半部）、第 12 章（内存管理）是重点。',
        },
      ],
      onlineResources: [
        {
          title: 'The Linux Kernel Module Programming Guide',
          url: 'https://sysprog21.github.io/lkmpg/',
          type: 'doc',
          description: '最新版的内核模块编程指南，有大量实际代码示例。',
        },
        {
          title: 'Kernel Newbies',
          url: 'https://kernelnewbies.org',
          type: 'doc',
          description: '内核新手入门网站，有丰富的教程和每个内核版本的变更说明。',
        },
      ],
    },
    codeReading: [
      {
        title: '最简内核模块',
        description: '一个完整的、可编译的 Hello World 内核模块，展示模块的基本结构。',
        file: 'hello_kernel.c',
        language: 'c',
        code: `// SPDX-License-Identifier: GPL-2.0
/*
 * hello_kernel.c - 第一个内核模块
 * 展示内核模块的基本结构
 */
#include <linux/init.h>
#include <linux/module.h>
#include <linux/kernel.h>

MODULE_LICENSE("GPL");
MODULE_AUTHOR("Your Name <your@email.com>");
MODULE_DESCRIPTION("Hello World Kernel Module for AMD Driver Learning");
MODULE_VERSION("1.0");

/* 模块加载时调用 */
static int __init hello_init(void)
{
    /* printk 是内核版的 printf，KERN_INFO 是日志级别 */
    printk(KERN_INFO "AMD Driver Learning: Hello, Kernel World!\\n");
    printk(KERN_INFO "This module was loaded successfully.\\n");
    
    /* 返回 0 表示成功，非 0 表示失败（模块加载会被取消） */
    return 0;
}

/* 模块卸载时调用 */
static void __exit hello_exit(void)
{
    printk(KERN_INFO "AMD Driver Learning: Goodbye, Kernel World!\\n");
}

/* 注册 init 和 exit 函数 */
module_init(hello_init);
module_exit(hello_exit);`,
        annotations: [
          'MODULE_LICENSE("GPL") 是必须的，没有它内核会标记为"污染"（tainted），且无法使用 GPL-only 的内核符号',
          '__init 和 __exit 宏告诉内核这些函数在初始化/退出后可以释放，节省内存',
          'printk 的日志级别从 KERN_EMERG（最高）到 KERN_DEBUG（最低），KERN_INFO 是普通信息',
          '返回值：0 表示成功，负数（如 -ENOMEM）表示错误，内核会打印对应的错误信息',
        ],
      },
      {
        title: 'amdgpu PCI 驱动注册（来自内核树）',
        description: '分析 amdgpu 驱动的模块注册代码，理解真实的内核驱动如何使用 PCI 框架。',
        file: 'drivers/gpu/drm/amd/amdgpu/amdgpu_drv.c',
        language: 'c',
        code: `/* amdgpu_drv.c — amdgpu 驱动的模块注册代码
 * 对比 hello_kernel.c 的简单结构，真实的 PCI 驱动
 * 使用 pci_driver 框架替代直接的 module_init/exit
 */

#include <linux/module.h>
#include <linux/pci.h>
#include <drm/drm_drv.h>

MODULE_AUTHOR("AMD linux driver team");
MODULE_DESCRIPTION("AMD GPU");
MODULE_LICENSE("GPL and additional rights");

/* PCI 驱动结构体：注册 probe/remove 回调 */
static struct pci_driver amdgpu_kms_pci_driver = {
    .name      = DRIVER_NAME,       /* "amdgpu" */
    .id_table  = pciidlist,         /* 支持的 GPU 设备列表 */
    .probe     = amdgpu_pci_probe,  /* 设备发现时调用 */
    .remove    = amdgpu_pci_remove, /* 设备移除时调用 */
    .shutdown  = amdgpu_pci_shutdown,
    .driver.pm = &amdgpu_pm_ops,    /* 电源管理回调 */
};

/* 模块初始化：注册 PCI 驱动 */
static int __init amdgpu_init(void)
{
    int r;

    /* 初始化 DRM 核心 */
    r = amdgpu_sync_init();
    if (r)
        goto error_sync;

    r = amdgpu_fence_slab_init();
    if (r)
        goto error_fence;

    /* 注册 PCI 驱动 — 内核会遍历所有 PCI 设备，
     * 对匹配 pciidlist 的设备调用 probe */
    r = pci_register_driver(&amdgpu_kms_pci_driver);
    if (r)
        goto error_pci;

    return 0;

error_pci:
    amdgpu_fence_slab_fini();
error_fence:
    amdgpu_sync_fini();
error_sync:
    return r;
}

static void __exit amdgpu_exit(void)
{
    pci_unregister_driver(&amdgpu_kms_pci_driver);
    amdgpu_fence_slab_fini();
    amdgpu_sync_fini();
}

module_init(amdgpu_init);
module_exit(amdgpu_exit);`,
        annotations: [
          '对比 hello_kernel.c：真实驱动的 module_init 不是 printk，而是注册 PCI 驱动',
          'pci_register_driver 注册后，内核自动对匹配的 PCI 设备调用 probe — 无需手动遍历设备',
          'error 处理使用 goto 链式清理（内核编码风格），确保失败路径也能正确释放资源',
          'amdgpu_fence_slab_init 创建 slab 缓存用于高速分配 fence 对象（GPU 同步原语）',
          'module_exit 的清理顺序与 module_init 的初始化顺序相反（栈式 cleanup）',
          '这就是 insmod amdgpu.ko 或内核自动加载 amdgpu 时实际执行的代码',
        ],
      },
    ],
    miniProject: {
      title: '实现一个 PCI 设备信息读取驱动',
      description: '编写一个完整的 PCI 驱动，匹配 AMD GPU，读取并通过 /proc 接口暴露设备信息。',
      objectives: [
        '实现完整的 pci_driver 结构体（probe/remove）',
        '读取 GPU 的 BAR 信息和配置空间',
        '通过 /proc/amd_gpu_info 暴露信息给用户空间',
      ],
      steps: [
        '创建 amd_pci_info.c，注册 pci_driver，匹配 AMD Vendor ID 0x1002',
        '在 probe 函数中，调用 pci_enable_device 和 pci_request_regions',
        '使用 pci_resource_start/len/flags 读取所有 BAR 信息',
        '使用 proc_create 创建 /proc/amd_gpu_info 文件',
        '实现 proc_read 函数，格式化输出 BAR 信息',
        '验证：cat /proc/amd_gpu_info 应显示 GPU 的 BAR 信息',
      ],
      expectedOutput: '/proc/amd_gpu_info 文件包含 RX 7600 XT 的所有 BAR 信息，与 lspci -v 输出一致。',
    },
    interviewQuestions: [
      {
        question: '解释 Linux 内核中的上半部（Top Half）和下半部（Bottom Half）中断处理机制。',
        difficulty: 'hard',
        hint: '从中断延迟、上下文限制、softirq/tasklet/workqueue 的区别来回答。',
        answer: '中断处理分为两个阶段以平衡响应速度和处理时间。上半部（Top Half）：在中断上下文中执行，不能睡眠，必须尽快完成（通常只做最紧急的工作，如读取硬件寄存器、清除中断标志）；执行期间禁止同级中断。下半部（Bottom Half）：延迟执行耗时操作，有三种机制：（1）Softirq：在中断上下文中执行，不能睡眠，性能最高，但代码复杂；（2）Tasklet：基于 Softirq，同一 tasklet 不会并发执行，使用更简单；（3）Workqueue：在进程上下文中执行，可以睡眠，适合需要睡眠的操作（如内存分配、文件操作）。amdgpu 驱动使用 workqueue 处理 GPU Hang 恢复等复杂操作。',
      },
      {
        question: '内核中的 spinlock 和 mutex 有什么区别？在什么情况下应该使用哪个？',
        difficulty: 'medium',
        hint: '从是否可以睡眠、适用上下文、性能开销三个维度比较。',
        answer: 'Spinlock（自旋锁）：等待时 CPU 忙等（自旋），不睡眠；可以在中断上下文中使用；适合临界区极短（几条指令）的场景；在多核系统上等待时浪费 CPU；使用 spin_lock()/spin_unlock()。Mutex（互斥锁）：等待时进程睡眠，让出 CPU；不能在中断上下文中使用；适合临界区较长或可能睡眠的场景（如等待 I/O）；使用 mutex_lock()/mutex_unlock()。选择原则：如果临界区内可能睡眠（如 kmalloc with GFP_KERNEL、copy_to_user），必须用 mutex；如果在中断上下文或持有中断禁止，必须用 spinlock；如果临界区非常短且不睡眠，spinlock 性能更好。',
      },
      {
        question: '解释内核模块的错误处理模式，为什么内核代码中大量使用 goto 语句？',
        difficulty: 'medium',
        hint: '从资源清理、代码可读性和 Linux 内核编码规范的角度回答。',
        answer: '内核代码使用 goto 进行错误处理是一种被 Linux 编码规范（Documentation/process/coding-style.rst）明确推荐的模式。原因：（1）资源清理的对称性：初始化时按顺序申请资源（A → B → C），失败时需要按逆序释放（C → B → A），goto 链式跳转天然实现了这种逆序清理；（2）避免嵌套：如果用 if-else 嵌套，每多一个资源就多一层缩进，代码很快变得不可读；（3）单一出口：goto 实现了函数的单一出口点（single exit point），所有错误路径都经过统一的清理代码，避免遗漏。示例模式：alloc_a → alloc_b → alloc_c → 正常返回；如果 alloc_c 失败 → goto err_c（释放 b 和 a）；如果 alloc_b 失败 → goto err_b（释放 a）。amdgpu_device_init() 就是一个典型例子，它初始化数十个子系统，每个都可能失败。',
      },
      {
        question: '什么是 DMA（Direct Memory Access）？GPU 驱动如何使用 DMA？',
        difficulty: 'hard',
        hint: '从 DMA 的工作原理、DMA 映射 API（dma_map_single/sg）、IOMMU 的角色来回答。',
        answer: 'DMA 允许外设（如 GPU）直接读写系统内存，无需 CPU 参与数据传输。GPU 驱动中 DMA 的使用：（1）CPU → GPU 数据传输：驱动使用 dma_map_page/dma_map_sg 将 CPU 页面映射为 GPU 可访问的 DMA 地址，GPU 的 SDMA 引擎通过此地址直接读取数据；（2）GPU → CPU 数据传输：GPU 渲染结果写入 VRAM 后，CPU 通过映射的 BAR 或 DMA 传输读取；（3）命令缓冲区提交：用户空间的命令缓冲区通过 DMA 映射传递给 GPU 的 Command Processor。IOMMU 的角色：现代系统使用 IOMMU（AMD 的叫 AMD-Vi）将 GPU 发出的物理地址翻译为实际的内存地址，提供隔离性和安全性。amdgpu 驱动通过 DRM 的 TTM 框架管理 DMA 缓冲区，TTM 负责在 VRAM 和系统内存之间迁移数据。',
      },
      {
        question: '解释 Linux 内核中的 slab 分配器，以及 amdgpu 驱动为什么需要自定义 slab cache。',
        difficulty: 'hard',
        hint: '从频繁小对象分配的性能问题、kmem_cache_create 的用法来回答。',
        answer: 'Slab 分配器是 Linux 内核的对象缓存机制，专门优化频繁分配/释放的固定大小对象。原理：预先分配一块内存（slab），划分为固定大小的槽位（slot），分配时直接取一个空闲槽位（O(1)），释放时归还槽位（不真正释放内存）。amdgpu 驱动创建自定义 slab cache 的原因：（1）fence 对象：GPU fence 用于 CPU-GPU 同步，每次命令提交都需要分配一个，每秒可能分配数万个。使用 kmem_cache_create("amdgpu_fence",...) 创建专用缓存，避免每次调用 kmalloc 的开销；（2）内存对齐：slab cache 可以指定对齐要求，确保对象跨 cache line 对齐以避免 false sharing；（3）调试：每个 slab cache 有独立的统计信息（/proc/slabinfo），方便监控 fence 分配/释放是否平衡（检测内存泄漏）。',
      },
    ],
  },
  {
    id: 'drm',
    number: '4',
    title: '图形驱动与 DRM 子系统',
    titleEn: 'Graphics Drivers & DRM',
    icon: '🖥️',
    description: '深入 Linux 图形栈的核心框架 DRM/KMS。理解显示管线、GPU 内存管理（GEM/TTM）和 DMA-BUF，这是 amdgpu 驱动的直接基础。',
    estimatedHours: 60,
    difficulty: 'advanced',
    subModules: [
      { id: 'drm-core', title: '4.1 DRM 核心架构', titleEn: 'DRM Core Architecture' },
      { id: 'drm-kms', title: '4.2 KMS 显示管线', titleEn: 'KMS Display Pipeline' },
      { id: 'drm-mem', title: '4.3 GPU 内存管理', titleEn: 'GPU Memory Management' },
    ],
    theory: {
      overview: 'DRM（Direct Rendering Manager）是 Linux 内核中管理 GPU 的核心子系统。它提供了一个统一的框架，让不同的 GPU 驱动（amdgpu、i915、nouveau 等）以一致的方式暴露 GPU 功能给用户空间。DRM 包含两大核心功能：KMS（Kernel Mode Setting，内核模式设置）负责管理显示输出；GEM/TTM 负责 GPU 内存管理。',
      sections: [
        {
          title: 'DRM 核心架构',
          content: 'DRM 框架的核心是 drm_device 结构体，它代表一个 GPU 设备。每个 GPU 驱动实现 drm_driver 结构体来注册自己的回调函数。用户空间通过 /dev/dri/card0 等设备节点访问 DRM，使用 DRM ioctl 接口来提交渲染命令、管理内存、设置显示模式。DRM 的设计哲学是：内核只做最必要的事（内存管理、命令提交、显示设置），渲染逻辑留在用户空间（Mesa 3D、ROCm 等）。',
          diagram: {
            type: 'ascii',
            content: `
  Linux 图形栈架构

  ┌─────────────────────────────────────────┐
  │       User Space Applications          │
  │  (Games, Blender, ROCm programs)       │
  └────────────────┬────────────────────────┘
                   │ OpenGL/Vulkan/HIP API
  ┌────────────────▼────────────────────────┐
  │      Userspace Graphics Libraries       │
  │  Mesa 3D (radeonsi/radv) | ROCm/HIP     │
  └────────────────┬────────────────────────┘
                   │ DRM ioctl / libdrm
  ┌────────────────▼────────────────────────┐
  │        Kernel DRM Subsystem              │
  │  ┌──────────┐  ┌──────────────────────┐ │
  │  │  KMS     │  │  GEM/TTM Memory Mgmt │ │
  │  │(Display) │  │  (VRAM/GTT alloc)    │ │
  │  └──────────┘  └──────────────────────┘ │
  │        amdgpu Driver                     │
  └────────────────┬────────────────────────┘
                   │ PCIe / MMIO / DMA
  ┌────────────────▼────────────────────────┐
  │        AMD GPU Hardware                  │
  │  (RX 7600 XT - Navi33)                  │
  └─────────────────────────────────────────┘`,
            caption: 'Linux 图形栈的层次结构。DRM 是内核与用户空间图形库之间的桥梁，amdgpu 是 DRM 框架下的具体 GPU 驱动实现。',
          },
        },
        {
          title: 'KMS 显示管线',
          content: 'KMS（Kernel Mode Setting）将显示模式设置从用户空间移入内核，解决了早期 UMS（User Mode Setting）导致的显示闪烁、多用户冲突等问题。KMS 使用一套抽象的显示对象模型：Framebuffer（帧缓冲）是存储像素数据的内存对象；Plane（平面）将 Framebuffer 的内容合成到 CRTC；CRTC（Cathode Ray Tube Controller，尽管名字过时，但概念沿用）代表一个显示控制器，负责将像素数据扫描输出；Encoder 将数字信号转换为特定格式（HDMI、DisplayPort 等）；Connector 代表物理连接器（HDMI 接口、DP 接口等）。',
          diagram: {
            type: 'ascii',
            content: `
  KMS 显示管线（Atomic Mode Setting）

  ┌──────────┐    ┌──────────┐
  │Framebuffer│    │Framebuffer│  (像素数据，存在 VRAM 中)
  └─────┬────┘    └─────┬────┘
        │               │
  ┌─────▼────┐    ┌─────▼────┐
  │  Plane   │    │  Plane   │  (Primary/Overlay/Cursor)
  │ (Primary)│    │ (Overlay)│
  └─────┬────┘    └─────┬────┘
        └───────┬────────┘
                │ 合成 (Composition)
         ┌──────▼──────┐
         │    CRTC     │  (扫描控制器，产生时序信号)
         └──────┬──────┘
                │
         ┌──────▼──────┐
         │   Encoder   │  (信号编码：HDMI/DP/etc)
         └──────┬──────┘
                │
         ┌──────▼──────┐
         │  Connector  │  (物理接口：HDMI口/DP口)
         └──────┬──────┘
                │
         ┌──────▼──────┐
         │   Monitor   │  (你的显示器)
         └─────────────┘`,
            caption: 'KMS 显示管线的对象模型。Atomic Mode Setting 允许原子性地更新整个管线状态，避免画面撕裂。amdgpu 的 DC（Display Core）模块实现了这套管线。',
          },
        },
        {
          title: 'GEM 与 TTM 内存管理',
          content: 'GPU 内存管理是 DRM 中最复杂的部分。GEM（Graphics Execution Manager）是 DRM 提供的高层内存管理框架，它将 GPU 内存抽象为 GEM 对象（gem_object），用户空间通过文件描述符（handle）来引用这些对象。TTM（Translation Table Manager）是 GEM 的底层实现，负责在不同内存区域（VRAM、GTT/系统内存、CPU 可见区域）之间迁移 Buffer Object（BO）。当 VRAM 不足时，TTM 会将不常用的 BO 迁移到系统内存（GTT），需要时再迁回 VRAM，这个过程对上层透明。DMA-BUF 是跨设备共享内存的机制，允许 GPU 和 CPU 零拷贝地共享同一块内存。',
        },
      ],
      keyBooks: [
        {
          title: 'Linux Graphics Internals',
          author: 'Luc Verhaegen (Online Resource)',
          relevance: '深入讲解 DRM/KMS 内部实现，虽然较旧但核心概念仍然适用。',
          url: 'https://docs.kernel.org/gpu/drm-kms.html',
        },
        {
          title: 'The DRM/KMS subsystem from a newbie\'s point of view',
          author: 'Boris Brezillon',
          relevance: '从新手角度介绍 DRM/KMS，是入门 DRM 开发的最佳文章之一。',
          url: 'https://events.static.linuxfound.org/sites/events/files/slides/brezillon-drm-kms.pdf',
        },
      ],
      onlineResources: [
        {
          title: 'DRM Kernel Documentation',
          url: 'https://docs.kernel.org/gpu/drm-internals.html',
          type: 'doc',
          description: 'Linux 内核官方 DRM 内部文档，包含 KMS、GEM、TTM 的详细说明。',
        },
        {
          title: 'DRM Developer\'s Guide',
          url: 'https://docs.kernel.org/gpu/drm-uapi.html',
          type: 'doc',
          description: 'DRM 用户空间 API 文档，了解用户空间如何与 DRM 交互。',
        },
      ],
    },
    codeReading: [
      {
        title: 'amdgpu GEM 对象分配',
        description: '分析 amdgpu 如何实现 GEM 对象的分配，理解 VRAM 和 GTT 内存的管理。',
        file: 'drivers/gpu/drm/amd/amdgpu/amdgpu_gem.c',
        language: 'c',
        code: `/* amdgpu GEM 对象创建 */
int amdgpu_gem_object_create(struct amdgpu_device *adev,
                              unsigned long size,
                              int alignment,
                              u32 initial_domain,  /* VRAM 还是 GTT */
                              u64 flags,
                              enum ttm_bo_type type,
                              struct dma_resv *resv,
                              struct drm_gem_object **obj)
{
    struct amdgpu_bo *bo;
    struct amdgpu_bo_param bp;
    int r;

    /* 初始化 BO 参数 */
    memset(&bp, 0, sizeof(bp));
    bp.size = size;
    bp.byte_align = alignment;
    bp.domain = initial_domain;  /* AMDGPU_GEM_DOMAIN_VRAM 或 _GTT */
    bp.flags = flags;
    bp.type = type;
    bp.resv = resv;

    /* 创建 amdgpu_bo（Buffer Object） */
    r = amdgpu_bo_create(adev, &bp, &bo);
    if (r)
        return r;

    /* 将 amdgpu_bo 嵌入的 drm_gem_object 返回给 DRM 框架 */
    *obj = &bo->tbo.base;
    return 0;
}

/* 内存域定义 */
/* AMDGPU_GEM_DOMAIN_CPU   = 0x1  CPU 可访问内存 */
/* AMDGPU_GEM_DOMAIN_GTT   = 0x2  GTT（系统内存，GPU 可通过 GART 访问）*/
/* AMDGPU_GEM_DOMAIN_VRAM  = 0x4  VRAM（显存，GPU 直接访问，速度最快）*/
/* AMDGPU_GEM_DOMAIN_GDS   = 0x8  全局数据共享 */`,
        annotations: [
          'initial_domain 决定 BO 初始放在哪里：VRAM 速度最快但容量有限，GTT 使用系统内存但 GPU 访问较慢',
          'amdgpu_bo 是 amdgpu 对 TTM BO 的封装，包含 amdgpu 特有的属性',
          'tbo.base 是 TTM BO 中嵌入的 drm_gem_object，DRM 框架通过这个统一接口管理所有 GPU 内存',
          'TTM 会根据内存压力自动在 VRAM 和 GTT 之间迁移 BO，这个过程对上层透明',
        ],
      },
    ],
    miniProject: {
      title: '使用 libdrm 查询 GPU 显示信息',
      description: '编写一个用户空间程序，使用 libdrm 查询 GPU 的显示连接器、分辨率和帧缓冲信息。',
      objectives: [
        '理解 DRM 用户空间 API',
        '学会使用 libdrm 库',
        '理解 KMS 对象模型（Connector、CRTC、Mode）',
      ],
      steps: [
        '安装 libdrm-dev：sudo apt install libdrm-dev',
        '编写 drm_info.c，打开 /dev/dri/card0',
        '调用 drmModeGetResources() 获取所有 KMS 资源',
        '遍历 Connector，打印每个连接器的状态和支持的分辨率',
        '打印当前 CRTC 的模式（分辨率、刷新率）',
      ],
      expectedOutput: '程序输出你的显示器连接信息，包括连接器类型（HDMI/DP）、当前分辨率（如 1920x1080@60Hz）和所有支持的分辨率列表。',
    },
    interviewQuestions: [
      {
        question: '解释 KMS 中 Atomic Mode Setting 的作用和优势。',
        difficulty: 'hard',
        hint: '对比非原子设置，强调原子性、无撕裂、测试模式。',
        answer: 'Atomic Mode Setting 允许在一次原子操作中更新整个显示管线的状态（Framebuffer、Plane、CRTC、Encoder、Connector 的所有属性），要么全部成功，要么全部失败，不会出现中间状态。优势：（1）无撕裂：整个管线状态在一个 VBlank 内切换，避免画面撕裀；（2）测试模式（TEST_ONLY）：可以先测试一个配置是否合法，不实际应用，避免无效操作；（3）异步更新：可以在不阻塞的情况下提交更新，GPU 在 VBlank 时自动应用；（4）多平面合成：可以同时更新多个 Plane，实现硬件合成（Hardware Composition）。amdgpu 的 DC（Display Core）模块完整实现了 Atomic Mode Setting。',
      },
      {
        question: '解释 GEM 和 TTM 的关系，以及 VRAM 和 GTT 内存域的区别。',
        difficulty: 'medium',
        hint: '从抽象层次、内存位置、访问速度来区分。',
        answer: 'GEM（Graphics Execution Manager）是 DRM 提供的高层内存管理抽象，定义了统一的 API（创建、映射、共享 GPU 内存对象）。TTM（Translation Table Manager）是 GEM 的一种底层实现，专为需要在不同内存区域之间迁移 Buffer 的 GPU 设计。VRAM（Video RAM）：GPU 板载显存，GPU 访问速度最快（数百 GB/s），但容量有限（如 8GB）；CPU 访问需要通过 PCIe，速度较慢；适合频繁被 GPU 访问的资源（纹理、渲染目标）。GTT（Graphics Translation Table）：使用系统内存（RAM），通过 GART（Graphics Address Remapping Table）映射给 GPU 访问；GPU 访问速度受 PCIe 带宽限制（约 32 GB/s）；容量大（可以使用大量系统内存）；适合 CPU 频繁更新的数据（顶点缓冲、常量缓冲）。TTM 会根据访问模式自动在两者之间迁移 BO。',
      },
    ],
  },
  {
    id: 'amdgpu',
    number: '5',
    title: 'AMDGPU 深度解析',
    titleEn: 'Deep Dive into AMDGPU',
    icon: '🔬',
    description: '逐一拆解 amdgpu 驱动的内部模块。包含代码阅读指南，教你如何导航这个复杂的代码库。',
    estimatedHours: 100,
    difficulty: 'expert',
    subModules: [
      { id: 'amdgpu-guide', title: '5.1 代码阅读指南', titleEn: 'Code Reading Guide' },
      { id: 'amdgpu-device', title: '5.2 amdgpu_device 核心', titleEn: 'amdgpu_device Core' },
      { id: 'amdgpu-scheduler', title: '5.3 GPU 调度器', titleEn: 'GPU Scheduler' },
      { id: 'amdgpu-ring', title: '5.4 命令环形缓冲区', titleEn: 'Command Ring Buffer' },
      { id: 'amdgpu-dc', title: '5.5 Display Core (DC)', titleEn: 'Display Core' },
      { id: 'amdgpu-pm', title: '5.6 电源管理', titleEn: 'Power Management' },
    ],
    theory: {
      overview: 'amdgpu 驱动位于 drivers/gpu/drm/amd/，是 Linux 内核中代码量最大的驱动之一（超过 100 万行代码）。理解它需要一个好的导航策略。本模块首先提供代码阅读指南，然后逐一解析核心模块。',
      sections: [
        {
          title: '5.1 AMDGPU 代码阅读指南',
          content: '阅读 amdgpu 代码的关键是找到正确的入口点。推荐的阅读顺序：（1）从 amdgpu_drv.c 开始，理解驱动注册和 PCI probe 流程；（2）跟踪 amdgpu_device_init() 函数，这是整个驱动初始化的主线；（3）理解 IP Block 机制（amdgpu_ip_block_add），每个 IP（Intellectual Property，如 GFX、SDMA、DC）都是一个独立的子模块；（4）使用 cscope 或 ctags 建立代码索引，方便函数跳转；（5）使用 git log --follow 追踪特定文件的历史变更。',
          diagram: {
            type: 'ascii',
            content: `
  AMDGPU 驱动代码结构

  drivers/gpu/drm/amd/
  ├── amdgpu/              ← 核心驱动
  │   ├── amdgpu_drv.c     ← PCI 驱动入口，模块注册
  │   ├── amdgpu_device.c  ← 设备初始化主流程
  │   ├── amdgpu_ring.c    ← 命令环形缓冲区
  │   ├── amdgpu_vm.c      ← GPU 虚拟内存管理
  │   ├── amdgpu_gem.c     ← GEM 内存对象
  │   ├── amdgpu_cs.c      ← 命令提交（Command Submission）
  │   ├── amdgpu_fence.c   ← GPU 围栏（同步原语）
  │   ├── gfx_v11_0.c      ← GFX IP（图形/计算引擎）
  │   └── sdma_v6_0.c      ← SDMA IP（DMA 引擎）
  ├── display/             ← Display Core (DC)
  │   └── dc/              ← 显示子系统
  ├── pm/                  ← 电源管理
  │   └── swsmu/           ← SMU（System Management Unit）
  └── include/             ← 公共头文件`,
            caption: 'amdgpu 驱动的目录结构。每个 IP Block 对应一组文件，如 gfx_v11_0.c 对应 RDNA3 架构的图形引擎。',
          },
        },
        {
          title: 'IP Block 机制',
          content: 'amdgpu 使用 IP Block（Intellectual Property Block）机制来管理 GPU 内部的各个功能单元。每个 IP（如图形引擎 GFX、DMA 引擎 SDMA、显示控制器 DC、视频编解码 VCN 等）都实现了一套标准的回调函数接口（amdgpu_ip_funcs）：early_init、sw_init、hw_init、hw_fini、sw_fini、late_fini。驱动初始化时，按顺序调用每个 IP Block 的 hw_init，关机时反序调用 hw_fini。这种设计使得每个 IP 模块可以独立开发和测试，也方便支持不同代数的 GPU（只需替换对应的 IP 实现）。',
        },
        {
          title: 'GPU 调度器（DRM Scheduler）',
          content: 'GPU 调度器（drm_gpu_scheduler）是 amdgpu 中负责管理 GPU 工作负载的核心组件。它实现了一个多队列调度系统：每个 GPU 引擎（GFX、SDMA、Compute 等）有一个对应的调度器；用户进程提交的工作（Job）被放入调度队列；调度器负责将 Job 转换为 GPU 命令并提交到硬件环形缓冲区（Ring）；调度器还处理 GPU Hang 检测和恢复（通过 timeout 机制）。理解调度器对于分析 GPU 性能问题和 Hang 问题至关重要。',
        },
        {
          title: '命令环形缓冲区（Ring Buffer）',
          content: '命令环形缓冲区（Ring Buffer）是 CPU 向 GPU 发送命令的核心机制。Ring 是一块循环使用的内存区域，CPU 将 GPU 命令（PM4 数据包）写入 Ring，然后更新写指针（Write Pointer，WPTR）通知 GPU；GPU 从读指针（Read Pointer，RPTR）处读取命令执行，执行完后更新 RPTR。当 WPTR == RPTR 时，Ring 为空；当 WPTR 追上 RPTR 时，Ring 满，CPU 需要等待。amdgpu 中有多种 Ring：GFX Ring（图形命令）、Compute Ring（计算命令）、SDMA Ring（DMA 命令）、UVD/VCE Ring（视频命令）。',
          diagram: {
            type: 'ascii',
            content: `
  命令环形缓冲区（Ring Buffer）工作原理

  内存中的 Ring Buffer（循环使用）：

  ┌──────┬──────┬──────┬──────┬──────┬──────┐
  │ CMD1 │ CMD2 │ CMD3 │ CMD4 │ CMD5 │ CMD6 │
  └──────┴──────┴──────┴──────┴──────┴──────┘
              ↑                    ↑
             RPTR                 WPTR
          (GPU 读到这里)        (CPU 写到这里)

  CPU 写入新命令 → 更新 WPTR → 写入 doorbell 通知 GPU
  GPU 读取命令执行 → 更新 RPTR → 触发 fence 信号

  当 WPTR 追上 RPTR（Ring 满）：
  CPU 等待 GPU 消费命令（等待 RPTR 前进）`,
            caption: 'Ring Buffer 的工作原理。CPU 和 GPU 通过 WPTR/RPTR 协调，Doorbell 是 CPU 通知 GPU 有新命令的机制（写入特定内存地址触发 GPU 中断）。',
          },
        },
      ],
      keyBooks: [
        {
          title: 'AMDGPU Driver Documentation',
          author: 'Linux Kernel Community',
          relevance: '官方 amdgpu 驱动文档，包含架构概述、模块说明和 API 参考。',
          url: 'https://docs.kernel.org/gpu/amdgpu/index.html',
        },
        {
          title: 'AMD GPU ISA Documentation',
          author: 'AMD Inc.',
          relevance: 'AMD GPU 指令集架构文档，了解 GPU 执行的底层指令。',
          url: 'https://gpuopen.com/documentation/',
        },
      ],
      onlineResources: [
        {
          title: 'AMDGPU Source Code on GitHub',
          url: 'https://github.com/torvalds/linux/tree/master/drivers/gpu/drm/amd',
          type: 'repo',
          description: 'amdgpu 驱动在 Linux 内核主线的源码，建议配合 cscope 阅读。',
        },
        {
          title: 'AMD GPU Driver Mailing List',
          url: 'https://lists.freedesktop.org/mailman/listinfo/amd-gfx',
          type: 'doc',
          description: 'amd-gfx 邮件列表，所有 amdgpu 驱动的补丁和讨论都在这里。',
        },
      ],
    },
    codeReading: [
      {
        title: 'amdgpu 设备初始化主流程',
        description: '追踪 amdgpu_device_init() 函数，理解驱动初始化的完整流程。',
        file: 'drivers/gpu/drm/amd/amdgpu/amdgpu_device.c',
        language: 'c',
        code: `/**
 * amdgpu_device_init - 初始化 amdgpu 设备（简化版）
 * 这是整个驱动初始化的主线函数
 */
int amdgpu_device_init(struct amdgpu_device *adev,
                        uint32_t flags)
{
    int r;

    /* 1. 基本硬件初始化：映射 MMIO 寄存器 */
    r = amdgpu_device_get_job_timeout_settings(adev);
    
    /* 2. 映射 BAR0（MMIO 寄存器空间） */
    adev->rmmio = ioremap(pci_resource_start(adev->pdev, 0),
                          pci_resource_len(adev->pdev, 0));
    
    /* 3. 检测 GPU 型号，设置 IP Block 列表 */
    r = amdgpu_device_ip_early_init(adev);
    
    /* 4. 初始化 TTM 内存管理器（VRAM + GTT） */
    r = amdgpu_ttm_init(adev);
    
    /* 5. 按顺序初始化所有 IP Block */
    /* 顺序：GMC → IH → PSP → SMU → GFX → SDMA → DC → ... */
    r = amdgpu_device_ip_init(adev);
    
    /* 6. 初始化 DRM 调度器 */
    r = amdgpu_device_init_schedulers(adev);
    
    /* 7. 注册 DRM 设备，创建 /dev/dri/card0 */
    r = drm_dev_register(adev_to_drm(adev), 0);
    
    return r;
}

/* IP Block 初始化顺序（RDNA3/Navi33 为例） */
static int amdgpu_device_ip_init(struct amdgpu_device *adev)
{
    for (i = 0; i < adev->num_ip_blocks; i++) {
        if (!adev->ip_blocks[i].status.valid)
            continue;
        
        /* 调用每个 IP Block 的 hw_init 回调 */
        r = adev->ip_blocks[i].version->funcs->hw_init(adev);
        if (r)
            return r;
            
        adev->ip_blocks[i].status.hw = true;
    }
    return 0;
}`,
        annotations: [
          'ioremap 将 BAR0 的物理地址映射到内核虚拟地址，之后所有寄存器读写都通过 adev->rmmio',
          'amdgpu_device_ip_early_init 根据 PCI Device ID 确定 GPU 型号，并设置对应的 IP Block 列表',
          'amdgpu_ttm_init 初始化 TTM 内存管理器，建立 VRAM 和 GTT 内存池',
          'IP Block 的初始化顺序非常重要：GMC（内存控制器）必须在 GFX 之前初始化，PSP（安全处理器）必须在 SMU 之前初始化',
          'drm_dev_register 将设备注册到 DRM 框架，之后用户空间才能通过 /dev/dri/card0 访问 GPU',
        ],
      },
    ],
    miniProject: {
      title: '分析 amdgpu 驱动的 IP Block 列表',
      description: '通过内核调试接口，查看你手头 AMD GPU 的 IP Block 列表（本例以 RX 7600 XT / gfx1102 为参考），理解 GPU 的功能模块组成。',
      objectives: [
        '理解 IP Block 机制',
        '学会使用 debugfs 接口',
        '了解 RDNA3 架构的 IP 组成',
      ],
      steps: [
        '挂载 debugfs：sudo mount -t debugfs none /sys/kernel/debug',
        '查看 amdgpu debugfs 接口：ls /sys/kernel/debug/dri/0/',
        '读取 IP Block 信息：cat /sys/kernel/debug/dri/0/amdgpu_firmware_info',
        '读取 VRAM 信息：cat /sys/kernel/debug/dri/0/amdgpu_vram_mm',
        '读取调度器信息：cat /sys/kernel/debug/dri/0/amdgpu_sched',
      ],
      expectedOutput: '完整的 IP Block 列表（包含 GFX11、SDMA6、DCN3.2、VCN4 等），以及 VRAM 使用情况和调度器状态。',
    },
    interviewQuestions: [
      {
        question: '如何调试 GPU Hang？请描述你的分析流程。',
        difficulty: 'hard',
        hint: '这是 AMD 面试最常见的问题之一，要有系统性的分析方法。',
        answer: 'GPU Hang 分析流程：（1）收集信息：dmesg 中的 amdgpu 错误日志，通常包含 "GPU hung" 和寄存器 dump；（2）确认 Hang 类型：是 Compute Hang（GFX/Compute Ring 超时）还是 Display Hang（DC 相关）；（3）分析 Ring 状态：查看 RPTR 和 WPTR 是否卡住，确认是 GPU 停止执行还是 CPU 提交了错误命令；（4）检查 IB（Indirect Buffer）内容：如果是命令错误，分析最后提交的 PM4 命令包；（5）查看 GPU 寄存器 dump：amdgpu 在 Hang 时会自动 dump 关键寄存器，分析 GFX_STATUS、GRBM_STATUS 等；（6）尝试复现：使用最小化的测试用例复现 Hang；（7）查看 amd-gfx 邮件列表是否有类似报告。',
      },
      {
        question: '解释 amdgpu 中的 Fence 机制，它如何实现 CPU-GPU 同步？',
        difficulty: 'hard',
        hint: '从 Fence 的创建、信号、等待三个阶段来解释。',
        answer: 'Fence（围栏）是 GPU 同步的核心原语，用于 CPU 等待 GPU 完成特定工作。工作原理：（1）创建：CPU 提交 GPU 命令时，同时创建一个 Fence 对象，并在命令流末尾插入一条 WRITE_DATA 命令，让 GPU 在执行完后向特定内存地址写入一个序列号；（2）信号：GPU 执行到 WRITE_DATA 命令时，写入序列号，触发中断，内核中断处理函数检测到序列号更新，调用 dma_fence_signal() 标记 Fence 为已完成；（3）等待：CPU 调用 dma_fence_wait() 等待 Fence，如果 Fence 未完成，进程睡眠；Fence 完成后进程被唤醒。amdgpu 使用 amdgpu_fence 封装了 dma_fence，并通过 amdgpu_fence_process() 在中断处理中批量处理已完成的 Fence。',
      },
    ],
  },
  {
    id: 'debugging',
    number: '6',
    title: '调试与性能分析',
    titleEn: 'Debugging & Profiling',
    icon: '🔍',
    description: '掌握 AMD 工程师日常分析和解决问题的核心工具。从 printk 到 ftrace，从 GPU Hang 分析到 ROCm 性能分析。',
    estimatedHours: 50,
    difficulty: 'advanced',
    subModules: [
      { id: 'debug-kernel', title: '6.1 内核层调试工具', titleEn: 'Kernel Debugging Tools' },
      { id: 'debug-gpu', title: '6.2 GPU 问题分析', titleEn: 'GPU Issue Analysis' },
      { id: 'debug-rocm', title: '6.3 ROCm 性能分析', titleEn: 'ROCm Profiling' },
    ],
    theory: {
      overview: '调试是工程师最重要的技能之一。AMD 面试中经常会问"你如何调试 GPU Hang？"这类问题。本模块系统介绍内核调试工具链，以及 GPU 特有的调试和性能分析方法。',
      sections: [
        {
          title: 'printk 与动态调试',
          content: 'printk 是内核中最基本的调试工具，类似于用户空间的 printf。日志级别从 KERN_EMERG（0）到 KERN_DEBUG（7）。动态调试（Dynamic Debug）允许在运行时启用/禁用特定的 pr_debug() 输出，无需重新编译内核：echo "module amdgpu +p" > /sys/kernel/debug/dynamic_debug/control。amdgpu 驱动中大量使用 DRM_DEBUG_DRIVER() 宏，可以通过 drm.debug 模块参数控制输出级别。amdgpu 还提供 debugfs 接口（/sys/kernel/debug/dri/0/），可以读取 GPU 状态、寄存器值和性能计数器。',
          diagram: {
            type: 'ascii',
            content: `内核调试输出层次

┌─────────────────────────────────────────────────────────────┐
│  Log Level         │  Macro             │  Typical Use       │
├─────────────────────┼───────────────────┼───────────────────┤
│  0 KERN_EMERG       │  pr_emerg()       │  Crash imminent   │
│  1 KERN_ALERT       │  pr_alert()       │  Immediate action │
│  2 KERN_CRIT        │  pr_crit()        │  Critical error   │
│  3 KERN_ERR         │  pr_err()         │  GPU hang/reset   │
│  4 KERN_WARNING     │  pr_warn()        │  Resource warning │
│  5 KERN_NOTICE      │  pr_notice()      │  Notable info     │
│  6 KERN_INFO        │  pr_info()        │  Drv load/unload  │
│  7 KERN_DEBUG       │  pr_debug()       │  Debug (dflt off) │
└─────────────────────┴───────────────────┴───────────────────┘

amdgpu 特有的调试接口：
┌─────────────────────────────────────────────────────────────┐
│  DRM_DEBUG_DRIVER()    → drm.debug=0x1  (driver info)       │
│  DRM_DEBUG_KMS()       → drm.debug=0x4  (KMS/display info)  │
│  amdgpu debugfs         → /sys/kernel/debug/dri/0/           │
│  ├── amdgpu_gpu_recover → Manual GPU reset trigger           │
│  ├── amdgpu_fence_info → View fence status                   │
│  ├── amdgpu_sa_info    → View suballoc memory                │
│  └── amdgpu_vram_mm    → View VRAM usage                     │
└─────────────────────────────────────────────────────────────┘`,
            caption: 'Linux 内核日志级别和 amdgpu 特有的调试接口。日常调试首先查看 dmesg（级别 0-6），深入分析时使用 debugfs 和动态调试。',
          },
        },
        {
          title: 'ftrace 与 tracepoints',
          content: 'ftrace 是 Linux 内核内置的函数追踪框架，可以追踪内核函数调用、测量延迟、分析调用链。tracepoints 是内核代码中预定义的追踪点，amdgpu 驱动中有大量 tracepoints（如 amdgpu_cs_ioctl、amdgpu_sched_run_job 等）。使用 trace-cmd 或 perf 工具可以方便地收集和分析 ftrace 数据。例如，追踪 amdgpu 命令提交：trace-cmd record -e amdgpu:amdgpu_cs_ioctl <your_program>，然后 trace-cmd report 查看结果。',
          diagram: {
            type: 'ascii',
            content: `ftrace 追踪 amdgpu 命令提交时间线

时间 (μs)
│
│  用户空间                    内核空间                    GPU
│  ────────                    ────────                    ───
│
├─ 0     ioctl(CS) ──────→ amdgpu_cs_ioctl
│                            │
├─ 5                         ├─ amdgpu_cs_parser_init
│                            │  (解析命令缓冲区)
├─ 15                        ├─ amdgpu_cs_pass1
│                            │  (验证 BO 列表)
├─ 25                        ├─ amdgpu_cs_pass2
│                            │  (映射 BO 到 GPU)
├─ 35                        ├─ amdgpu_cs_submit
│                            │  (提交到调度器)
├─ 40                        └─ return ──────────→ 用户空间
│
│          ~~~~ 调度延迟 ~~~~
│
├─ 80     amdgpu_sched_run_job
│                            │
├─ 85                        ├─ amdgpu_ib_schedule
│                            │  (写入 Ring Buffer)
├─ 90                        └─ ring doorbell ──→ GPU 开始执行
│
├─ 500                                             GPU fence 信号
│                                                   │
├─ 505    fence callback ← ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘
│
│  总延迟 = 提交延迟(40μs) + 调度延迟(40μs) + GPU执行(410μs)
└─────────────────────────────────────────────────────────────`,
            caption: 'ftrace 追踪 amdgpu 命令提交的完整时间线。通过分析各阶段耗时，可以定位瓶颈在 CPU 端（驱动处理）还是 GPU 端（硬件执行）。',
          },
        },
        {
          title: 'perf 工具集',
          content: 'perf 是 Linux 的性能分析工具，支持 CPU 性能计数器、软件事件和内核追踪点。常用命令：perf top（实时显示热点函数）、perf record + perf report（采样分析）、perf stat（统计性能计数器）。对于 GPU 驱动分析，perf 可以帮助识别 CPU 侧的瓶颈（如驱动中哪个函数占用 CPU 最多）。rocprof 是 AMD 的 GPU 性能分析工具，可以读取 GPU 硬件性能计数器（如 GRBM_GUI_ACTIVE、SPI_CSN_BUSY 等），分析 GPU 各引擎的利用率。',
          diagram: {
            type: 'ascii',
            content: `性能分析工具链

┌─────────────────────────────────────────────────────────────┐
│                  Analysis Target Selection                    │
│                                                              │
│  CPU Bottleneck?           GPU Bottleneck?                   │
│  (Driver func latency)     (Shader/memory bandwidth)         │
│       │                          │                          │
│       ▼                          ▼                          │
│  ┌──────────┐              ┌──────────┐                     │
│  │   perf   │              │ rocprof  │                     │
│  └────┬─────┘              └────┬─────┘                     │
│       │                         │                           │
│  ┌────▼──────────┐        ┌────▼──────────┐                │
│  │ perf top      │        │ rocprof       │                │
│  │ Hot functions  │        │ --stats       │                │
│  │               │        │ GPU usage rate │                │
│  ├───────────────┤        ├───────────────┤                │
│  │ perf record   │        │ rocprof       │                │
│  │ + perf report │        │ -i metrics.txt│                │
│  │ Sampling       │        │ HW Counters    │                │
│  ├───────────────┤        ├───────────────┤                │
│  │ perf stat     │        │ rocprof       │                │
│  │ Stats summary  │        │ --hsa-trace   │                │
│  │               │        │ API tracing    │                │
│  └───────────────┘        └───────────────┘                │
│                                                              │
│  Combined: perf (CPU) + rocprof (GPU) → Full perf picture   │
└─────────────────────────────────────────────────────────────┘`,
            caption: 'CPU 和 GPU 性能分析工具链。perf 分析 CPU 侧的驱动开销，rocprof 分析 GPU 侧的硬件利用率，两者结合才能完整定位性能瓶颈。',
          },
        },
        {
          title: 'GPU Hang 分析方法论',
          content: 'GPU Hang 是 GPU 停止响应的状态，是 GPU 驱动中最严重的问题之一。分析步骤：（1）收集 dmesg 日志，找到 "amdgpu: GPU hang detected!" 和随后的寄存器 dump；（2）分析 GRBM_STATUS 寄存器，确认哪个 GPU 引擎（GFX、SDMA、Compute）卡住了；（3）查看 CP_RB_RPTR/WPTR，确认 Ring 状态；（4）如果有 IB dump，分析最后执行的 PM4 命令；（5）使用 umr（User Mode Register Access）工具读取 GPU 寄存器；（6）查看是否是已知 Bug（搜索 amd-gfx 邮件列表和 GitLab Issues）。',
          diagram: {
            type: 'ascii',
            content: `GPU Hang 诊断决策树

dmesg: "amdgpu: GPU hang detected!"
     │
     ▼
分析 GRBM_STATUS 寄存器
     │
     ├─ GFX 引擎忙 ──→ 着色器问题
     │   │              ├─ 死循环着色器 → 检查用户提交的 shader
     │   │              └─ 非法指令 → 检查 ISA 兼容性
     │   │
     ├─ SDMA 引擎忙 ──→ DMA 传输问题
     │   │              ├─ 源/目标地址无效 → 检查 BO 映射
     │   │              └─ SDMA fence 超时 → 检查 firmware
     │   │
     └─ CP 引擎忙 ────→ 命令处理器问题
         │              ├─ PM4 命令格式错误 → 检查 IB dump
         │              └─ Ring 溢出 → 检查 Ring 大小配置
         │
         ▼
检查 Ring 状态
┌────────────────────────────────────────────────┐
│  CP_RB_RPTR == CP_RB_WPTR                       │
│  → Ring empty, GPU idle but still Hang          │
│  → Possibly firmware Bug or HW issue            │
│                                                  │
│  CP_RB_RPTR != CP_RB_WPTR                       │
│  → Ring has pending commands                    │
│  → GPU stuck on a command                       │
│  → Analyze PM4 command at RPTR                  │
└────────────────────────────────────────────────┘
         │
         ▼
使用 umr 工具深入分析
$ umr -O bits -r gfx1102.gfx.GRBM_STATUS
$ umr --ring-stream gfx  # 打印 Ring 内容`,
            caption: 'GPU Hang 诊断决策树。从 dmesg 日志中的 GRBM_STATUS 开始，逐步缩小问题范围到具体的 GPU 引擎和命令。umr 工具用于深入读取 GPU 寄存器。',
          },
        },
      ],
      keyBooks: [
        {
          title: 'Linux Kernel Debugging',
          author: 'Kaiwan N Billimoria',
          isbn: '978-1801075039',
          relevance: '系统介绍 Linux 内核调试技术，包括 printk、动态调试、ftrace、kprobes 等。',
        },
      ],
      onlineResources: [
        {
          title: 'ftrace - Function Tracer',
          url: 'https://docs.kernel.org/trace/ftrace.html',
          type: 'doc',
          description: 'Linux 内核官方 ftrace 文档，包含所有 tracer 的使用说明。',
        },
        {
          title: 'perf Examples',
          url: 'https://www.brendangregg.com/perf.html',
          type: 'doc',
          description: 'Brendan Gregg 的 perf 使用指南，包含大量实用示例。',
        },
        {
          title: 'AMD GPU Debugger (umr)',
          url: 'https://gitlab.freedesktop.org/tomstdenis/umr',
          type: 'repo',
          description: 'AMD 官方的 GPU 寄存器读取工具，用于 GPU Hang 分析。',
        },
      ],
    },
    codeReading: [
      {
        title: 'amdgpu 中的 tracepoints',
        description: '查看 amdgpu 驱动中定义的 tracepoints，理解如何使用它们进行性能分析。',
        file: 'drivers/gpu/drm/amd/amdgpu/amdgpu_trace.h',
        language: 'c',
        code: `/* amdgpu tracepoints 定义（部分） */

/* 追踪命令提交（Command Submission）事件 */
TRACE_EVENT(amdgpu_cs_ioctl,
    TP_PROTO(struct amdgpu_job *job),
    TP_ARGS(job),
    TP_STRUCT__entry(
        __field(struct amdgpu_device *, adev)
        __field(int, ring)
        __field(uint64_t, seqno)
    ),
    TP_fast_assign(
        __entry->adev = job->adev;
        __entry->ring = job->ring->idx;
        __entry->seqno = job->base.s_fence->scheduled.seqno;
    ),
    TP_printk("adev=%p, ring=%d, seqno=%llu",
              __entry->adev, __entry->ring, __entry->seqno)
);

/* 追踪调度器运行 Job 事件 */
TRACE_EVENT(amdgpu_sched_run_job,
    TP_PROTO(struct amdgpu_job *job),
    TP_ARGS(job),
    ...
);

/* 使用方法（在终端中）：
 * # 启用 amdgpu 所有 tracepoints
 * echo 1 > /sys/kernel/debug/tracing/events/amdgpu/enable
 * 
 * # 运行你的 GPU 程序
 * ./your_gpu_program
 * 
 * # 查看追踪结果
 * cat /sys/kernel/debug/tracing/trace
 */`,
        annotations: [
          'TRACE_EVENT 宏定义一个 tracepoint，包含事件名称、参数、数据结构和打印格式',
          'TP_PROTO 定义 tracepoint 的参数类型',
          'TP_STRUCT__entry 定义存储在 ring buffer 中的数据结构',
          'TP_fast_assign 是在中断上下文中执行的数据收集代码，必须尽量简短',
          'tracepoints 的开销极低（未启用时几乎为零），是生产环境调试的理想工具',
        ],
      },
    ],
    miniProject: {
      title: '使用 ftrace 分析 amdgpu 命令提交延迟',
      description: '使用 ftrace 追踪 amdgpu 的命令提交流程，测量从用户空间提交到 GPU 开始执行的延迟。',
      objectives: [
        '掌握 ftrace/trace-cmd 的使用',
        '理解 amdgpu 命令提交的完整流程',
        '学会分析性能瓶颈',
      ],
      steps: [
        '安装 trace-cmd：sudo apt install trace-cmd',
        '启用 amdgpu 相关 tracepoints：sudo trace-cmd list -e | grep amdgpu',
        '运行追踪：sudo trace-cmd record -e "amdgpu:*" glxgears -frames 100',
        '分析结果：trace-cmd report | head -100',
        '计算 amdgpu_cs_ioctl 到 amdgpu_sched_run_job 的时间差',
      ],
      expectedOutput: '一份追踪报告，显示每次 GPU 命令提交的时间戳，以及调度延迟（通常在几十微秒到几毫秒之间）。',
    },
    interviewQuestions: [
      {
        question: '如何使用 ftrace 追踪内核函数调用？请给出一个具体的 amdgpu 调试示例。',
        difficulty: 'medium',
        hint: '从 function tracer 和 tracepoints 两个角度回答。',
        answer: 'ftrace 有两种主要使用方式：（1）Function Tracer：追踪内核函数调用，echo function > /sys/kernel/debug/tracing/current_tracer，然后 echo "amdgpu_*" > set_ftrace_filter，启用后所有匹配的函数调用都会被记录。（2）Tracepoints：使用预定义的追踪点，echo 1 > /sys/kernel/debug/tracing/events/amdgpu/enable 启用所有 amdgpu tracepoints。实际调试示例：当用户报告 GPU 渲染卡顿时，可以用 trace-cmd record -e "amdgpu:amdgpu_cs_ioctl" -e "amdgpu:amdgpu_sched_run_job" <program> 追踪命令提交，通过分析时间戳差值找到调度延迟过大的原因（可能是 Ring 满、Fence 等待超时等）。',
      },
      {
        question: '解释 GPU Hang 的常见原因，以及如何通过 dmesg 日志进行初步诊断。',
        difficulty: 'hard',
        hint: '列举几种常见原因，并说明如何从 dmesg 中提取关键信息。',
        answer: 'GPU Hang 的常见原因：（1）无限循环着色器：着色器代码中有死循环，GPU 永远不会完成任务；（2）非法内存访问：GPU 访问了未映射的地址，触发 Page Fault；（3）命令缓冲区错误：PM4 命令包格式错误，GPU 无法解析；（4）固件 Bug：GPU 固件（Microcode）中的 Bug 导致 GPU 状态机卡死；（5）硬件问题：过热、供电不稳定。dmesg 诊断：（1）搜索 "GPU hang"、"ring timeout"、"GPU reset" 关键词；（2）查看 GRBM_STATUS 寄存器 dump，如 "GRBM_STATUS=0x..." 中的位域指示哪个引擎卡住；（3）查看 CP_RB_RPTR 和 CP_RB_WPTR，如果两者相等说明 Ring 为空（GPU 没有工作要做但还是 Hang 了，可能是固件问题）；（4）查看 "IB test failed" 是否出现（表示驱动初始化时的基本测试失败）。',
      },
    ],
  },
  {
    id: 'rocm-kernel',
    number: '7',
    title: 'ROCm 内核接口 (KFD)',
    titleEn: 'ROCm Kernel Interface',
    icon: '⚡',
    description: '理解 ROCm 在内核层面的实现：KFD（Kernel Fusion Driver）、HSA 架构和 GPU 队列管理。',
    estimatedHours: 40,
    difficulty: 'advanced',
    subModules: [
      { id: 'kfd-hsa', title: '7.1 HSA 架构与 KFD', titleEn: 'HSA Architecture & KFD' },
      { id: 'kfd-queue', title: '7.2 队列与信号量管理', titleEn: 'Queue & Signal Management' },
    ],
    theory: {
      overview: 'ROCm（Radeon Open Compute）是 AMD 的开源 GPU 计算平台。在内核层面，ROCm 通过 KFD（Kernel Fusion Driver）与 GPU 交互。KFD 是 amdgpu 驱动的一个组件，实现了 HSA（Heterogeneous System Architecture）规范，为用户空间的 ROCm 运行时提供内核接口。',
      sections: [
        {
          title: 'HSA 架构概述',
          content: 'HSA（Heterogeneous System Architecture）是一个行业标准，旨在让 CPU 和 GPU 更紧密地协同工作。HSA 的核心理念是：CPU 和 GPU 共享统一的虚拟地址空间（Unified Virtual Address Space），GPU 可以直接访问 CPU 内存，无需显式的数据拷贝；GPU 计算任务（Kernel）通过队列（Queue）提交，而非传统的命令缓冲区；信号量（Signal）用于 CPU-GPU 和 GPU-GPU 之间的同步。AMD 的 APU（如 Ryzen 系列）完全实现了 HSA，独立 GPU（如 RX 7600 XT）通过 PCIe 实现了部分 HSA 功能。',
          diagram: {
            type: 'ascii',
            content: `
  HSA 软件栈架构

  ┌─────────────────────────────────────────┐
  │      User Space ROCm Applications       │
  │  (HIP, TensorFlow, PyTorch, etc.)       │
  └────────────────┬────────────────────────┘
                   │
  ┌────────────────▼────────────────────────┐
  │        ROCm Runtime                      │
  │  HSA Runtime (libhsa-runtime64.so)      │
  │  HIP Runtime (libamdhip64.so)           │
  └────────────────┬────────────────────────┘
                   │ ioctl
  ┌────────────────▼────────────────────────┐
  │        Kernel KFD Driver                 │
  │  /dev/kfd  (HSA Kernel Interface)       │
  │  Queue Mgmt | Memory Mgmt | Signals     │
  └────────────────┬────────────────────────┘
                   │
  ┌────────────────▼────────────────────────┐
  │        amdgpu Driver Core                │
  │  (KFD accesses GPU HW via amdgpu)       │
  └─────────────────────────────────────────┘`,
            caption: 'ROCm/KFD 软件栈。KFD 通过 /dev/kfd 设备节点向用户空间暴露 HSA 接口，ROCm 运行时通过 ioctl 调用 KFD 来管理 GPU 资源。',
          },
        },
        {
          title: 'KFD 队列管理',
          content: 'KFD 的核心功能是管理 GPU 计算队列（Compute Queue）。与图形渲染不同，计算队列使用 AQL（Architected Queuing Language）格式的命令包，而非 PM4 格式。每个用户进程可以创建多个计算队列，KFD 负责将这些队列映射到 GPU 的 Hardware Queue Descriptor（HQD）。KFD 实现了 MQD（Memory Queue Descriptor）管理，支持队列的创建、销毁、暂停和恢复。',
        },
        {
          title: 'GPU 内存管理（KFD 视角）',
          content: 'KFD 实现了 HSA 规范中的内存模型，支持多种内存类型：System Memory（系统内存，CPU 和 GPU 都可访问）；VRAM（显存，GPU 本地内存）；Doorbell Memory（用于触发 GPU 队列的特殊内存）；MMIO 映射（用于信号量的快速路径）。KFD 通过 amdgpu 的 GEM/TTM 机制管理 GPU 内存，并实现了 HSA 的内存迁移（Migration）功能，支持在系统内存和 VRAM 之间按需迁移数据。',
        },
      ],
      keyBooks: [
        {
          title: 'HSA Platform System Architecture Specification',
          author: 'HSA Foundation',
          relevance: 'HSA 规范文档，定义了 KFD 实现的接口和行为。',
          url: 'http://www.hsafoundation.com/standards/',
        },
      ],
      onlineResources: [
        {
          title: 'ROCm Documentation',
          url: 'https://rocm.docs.amd.com',
          type: 'doc',
          description: 'AMD 官方 ROCm 文档，包含 KFD、HIP、ROCm 工具的完整说明。',
        },
        {
          title: 'KFD Source Code',
          url: 'https://github.com/torvalds/linux/tree/master/drivers/gpu/drm/amd/amdkfd',
          type: 'repo',
          description: 'KFD 驱动在 Linux 内核中的源码位置。',
        },
      ],
    },
    codeReading: [
      {
        title: 'KFD 队列创建流程',
        description: '分析用户空间如何通过 KFD ioctl 创建 GPU 计算队列。',
        file: 'drivers/gpu/drm/amd/amdkfd/kfd_chardev.c',
        language: 'c',
        code: `/* KFD ioctl 处理函数：创建计算队列 */
static int kfd_ioctl_create_queue(struct file *filep,
                                   struct kfd_process *p,
                                   void *data)
{
    struct kfd_ioctl_create_queue_args *args = data;
    struct kfd_dev *dev;
    int err = 0;
    unsigned int queue_id;
    struct kfd_process_device *pdd;
    struct queue_properties q_properties;

    /* 1. 找到对应的 KFD 设备 */
    dev = kfd_device_by_id(args->gpu_id);
    if (!dev)
        return -EINVAL;

    /* 2. 设置队列属性 */
    memset(&q_properties, 0, sizeof(struct queue_properties));
    q_properties.queue_percent = args->queue_percentage;
    q_properties.priority = args->queue_priority;
    q_properties.queue_address = args->ring_base_address;
    q_properties.queue_size = args->ring_size;
    q_properties.read_ptr = (uint32_t __user *)args->read_pointer_address;
    q_properties.write_ptr = (uint32_t __user *)args->write_pointer_address;
    q_properties.type = (enum kfd_queue_type)args->queue_type;

    /* 3. 创建队列（分配 HQD，初始化 MQD） */
    err = pqm_create_queue(&p->pqm, dev, filep,
                            &q_properties, &queue_id);
    if (err != 0)
        goto err_create_queue;

    /* 4. 返回队列 ID 给用户空间 */
    args->queue_id = queue_id;
    
    return 0;
}`,
        annotations: [
          'kfd_ioctl_create_queue 是用户空间调用 ioctl(KFD_IOC_CREATE_QUEUE) 时的内核处理函数',
          'queue_address 是用户空间分配的 Ring Buffer 地址，GPU 将从这里读取 AQL 命令包',
          'read_ptr/write_ptr 是共享内存中的指针，CPU 通过 write_ptr 提交命令，GPU 通过 read_ptr 消费命令',
          'pqm_create_queue 负责实际的队列创建，包括分配 HQD（Hardware Queue Descriptor）和初始化 MQD',
          'queue_id 返回给用户空间，后续的队列操作（销毁、更新）都通过这个 ID 引用',
        ],
      },
    ],
    miniProject: {
      title: '使用 ROCm 运行时 API 查询 GPU 信息',
      description: '编写一个 C 程序，使用 HSA Runtime API 查询 GPU 的计算能力和内存信息。',
      objectives: [
        '理解 HSA Runtime API',
        '学会枚举 HSA Agent（CPU 和 GPU）',
        '查询 GPU 的计算单元数量和内存大小',
      ],
      steps: [
        '安装 ROCm：按照 https://rocm.docs.amd.com 的指南安装',
        '编写 hsa_info.c，调用 hsa_init() 初始化 HSA 运行时',
        '使用 hsa_iterate_agents() 枚举所有 HSA Agent',
        '对每个 GPU Agent，查询 HSA_AGENT_INFO_NAME、HSA_AGENT_INFO_COMPUTE_UNIT_COUNT 等属性',
        '编译：gcc hsa_info.c -o hsa_info -lhsa-runtime64',
      ],
      expectedOutput: '程序输出 RX 7600 XT 的 GPU 名称（gfx1102）、计算单元数量（32 CU）、最大时钟频率和 VRAM 大小。',
    },
    interviewQuestions: [
      {
        question: '解释 KFD 和 amdgpu 的关系，以及 KFD 在 ROCm 生态中的角色。',
        difficulty: 'medium',
        hint: '从架构层次、功能分工、接口暴露三个角度回答。',
        answer: 'KFD（Kernel Fusion Driver）是 amdgpu 驱动的一个子模块，专门为 ROCm 计算工作负载提供内核接口。关系：KFD 不是独立的驱动，它依赖 amdgpu 进行底层硬件访问（内存分配、命令提交等）；KFD 通过 amdgpu 的内部 API（如 amdgpu_amdkfd_*）调用 amdgpu 功能；KFD 向用户空间暴露 /dev/kfd 设备节点，实现 HSA 规范定义的接口。在 ROCm 生态中的角色：KFD 是 ROCm 运行时（HSA Runtime）与 GPU 硬件之间的桥梁；它管理计算队列（Compute Queue）的创建和调度，这与图形渲染使用的 Ring Buffer 机制不同；它实现了 HSA 内存模型，支持 CPU-GPU 统一虚拟地址空间；它提供信号量（Signal）机制，用于高效的 CPU-GPU 同步。',
      },
      {
        question: '解释 HSA 中的 AQL（Architected Queuing Language）包格式，以及它与 PM4 命令包的区别。',
        difficulty: 'hard',
        hint: '从命令格式、使用场景、硬件支持的角度对比。',
        answer: 'AQL 是 HSA 规范定义的 GPU 计算命令包格式，KFD 使用 AQL 来提交计算任务。AQL Dispatch Packet（64 字节）包含：setup（维度信息）、workgroup_size_x/y/z（工作组大小）、grid_size_x/y/z（网格大小）、kernel_object（Kernel 代码指针）、kernarg_address（Kernel 参数指针）、completion_signal（完成信号）。与 PM4 的区别：（1）PM4 是 AMD 私有的命令包格式，由 Command Processor（CP）的 ME（Micro Engine）解析，用于图形渲染和传统的 GPU 命令；AQL 是 HSA 标准格式，由 ACE（Asynchronous Compute Engine）直接解析，专为计算设计。（2）PM4 通过 Ring Buffer 提交，驱动负责构建命令包；AQL 通过 User Queue 提交，用户空间直接写入队列内存，无需内核参与（零拷贝提交）。（3）AQL 支持 Barrier 和 Agent Dispatch Packet，实现 GPU-GPU 和 CPU-GPU 的细粒度同步。',
      },
      {
        question: 'KFD 如何实现 CPU-GPU 统一虚拟地址空间？这对应用程序有什么好处？',
        difficulty: 'hard',
        hint: '从 SVM（Shared Virtual Memory）、GPU 页表、page fault 处理的角度回答。',
        answer: 'KFD 通过 SVM（Shared Virtual Memory）实现 CPU-GPU 统一虚拟地址空间。实现机制：（1）KFD 管理 GPU 的 GPUVM 页表（与 CPU 的 x86 页表独立），通过 kfd_process_device 为每个进程维护 GPU 页表映射；（2）当用户调用 hsaKmtMapMemoryToGPU 时，KFD 在 GPU 页表中创建映射，使 GPU 能通过与 CPU 相同的虚拟地址访问该内存；（3）对于 SVM 区域，KFD 支持 GPU Page Fault：如果 GPU 访问未映射的地址，硬件触发 retry fault，KFD 的 svm_migrate_to_vram/ram 函数负责按需迁移页面。好处：（1）指针可以直接在 CPU 和 GPU 之间传递，无需转换；（2）复杂数据结构（链表、树）可以直接在 GPU 上遍历；（3）减少了显式 memcpy 的需求，简化了编程模型。限制：独立 GPU（如 RX 7600 XT）通过 PCIe 访问系统内存，延迟比 APU 的统一内存高。',
      },
      {
        question: '描述 KFD 的 GPU 事件（Event）和信号量（Signal）机制，以及它们在 CPU-GPU 同步中的作用。',
        difficulty: 'medium',
        hint: '从 Doorbell、interrupt、wait/signal 的流程角度回答。',
        answer: 'KFD 提供两种同步机制：（1）Signal（信号量）：HSA 规范定义的轻量级同步原语，本质是一个 64 位的原子计数器。GPU 执行完 Kernel 后写入 Signal 值（在 AQL Completion Packet 中指定），CPU 通过 polling 或 interrupt 等待 Signal 值变化。Signal 存储在 KFD 管理的共享内存中，CPU 和 GPU 都可以直接访问。（2）Event（事件）：KFD 的内核态事件对象，支持进程间和 CPU-GPU 同步。当 GPU 完成任务时，KFD 的中断处理函数（kfd_interrupt_isr）收到 GPU 中断，唤醒等待该事件的 CPU 线程。同步流程：用户空间调用 hsaKmtWaitOnEvent → KFD 将进程放入等待队列 → GPU 触发中断 → KFD 中断处理唤醒进程。性能对比：Signal polling 延迟最低（~1μs），但浪费 CPU；Event interrupt 延迟较高（~10μs），但 CPU 友好。ROCm 默认使用 interrupt 模式，可通过环境变量切换到 polling 模式。',
      },
      {
        question: '解释 KFD 的进程隔离机制，如何防止一个 GPU 进程访问另一个进程的 GPU 内存？',
        difficulty: 'hard',
        hint: '从 GPUVM 页表隔离、PASID、进程 eviction 的角度回答。',
        answer: '进程隔离机制：（1）PASID（Process Address Space ID）：每个 KFD 进程分配唯一的 PASID，GPU 在每次内存访问时携带 PASID，IOMMU/GPUVM 通过 PASID 选择对应的页表，确保进程只能访问自己的内存映射。（2）独立 GPUVM 页表：KFD 为每个进程创建独立的 GPU 页表（kfd_process 中的 vm），即使两个进程使用相同的虚拟地址，GPU 通过 PASID 区分它们的页表，访问完全隔离。（3）BO（Buffer Object）权限控制：GEM BO 的导入/导出通过 DMA-BUF 机制，只有持有有效 fd 的进程才能访问。（4）进程 Eviction：当系统内存压力大时，KFD 可以 evict 一个进程的所有 GPU 资源（取消 GPU 页表映射、暂停该进程的所有队列），释放 VRAM 给其他进程使用。被 evict 的进程在下次调度时会 restore。这类似于 CPU 的进程换入换出（swap），但作用于 GPU 资源。',
      },
    ],
  },
  {
    id: 'rocm-compute',
    number: '8',
    title: 'ROCm 用户态计算',
    titleEn: 'ROCm User Compute',
    icon: '🧮',
    description: '掌握上层 GPU 计算编程：HIP 编程模型、GPU 内存模型和性能优化。连接驱动知识与实际计算应用。',
    estimatedHours: 50,
    difficulty: 'advanced',
    subModules: [
      { id: 'hip-model', title: '8.1 HIP 编程模型', titleEn: 'HIP Programming Model' },
      { id: 'hip-memory', title: '8.2 GPU 内存模型与优化', titleEn: 'GPU Memory Model & Optimization'
      },
    ],
    theory: {
      overview: 'HIP（Heterogeneous-compute Interface for Portability）是 AMD 的 GPU 编程框架，语法与 CUDA 高度相似，支持在 AMD 和 NVIDIA GPU 上运行。理解 HIP 编程模型不仅有助于开发 GPU 计算应用，也能加深对 GPU 硬件架构和驱动工作方式的理解。',
      sections: [
        {
          title: 'HIP 编程模型：Grid、Block 与 Wavefront',
          content: 'HIP 使用层次化的并行模型：Grid（网格）是整个计算任务，由多个 Block 组成；Block（线程块）是一组可以共享内存和同步的线程，在 AMD GPU 上最大为 1024 个线程；Thread（线程）是最小的执行单元，每个线程执行相同的 Kernel 代码但处理不同的数据。AMD GPU 特有的概念是 Wavefront（波前），这是 GPU 实际的最小调度单元，包含 64 个线程（RDNA 架构为 32 或 64）。理解 Wavefront 对于性能优化至关重要：如果 Block 大小不是 Wavefront 大小的整数倍，会导致资源浪费（部分 Wavefront 的线程是空闲的）。',
          diagram: {
            type: 'ascii',
            content: `
  HIP 并行层次结构

  Grid（整个计算任务）
  ┌─────────────────────────────────────┐
  │  Block(0,0)  │  Block(1,0)  │ ...  │
  │  ┌──────────┐│  ┌──────────┐│      │
  │  │Thread 0  ││  │Thread 0  ││      │
  │  │Thread 1  ││  │Thread 1  ││      │
  │  │  ...     ││  │  ...     ││      │
  │  │Thread N  ││  │Thread N  ││      │
  │  └──────────┘│  └──────────┘│      │
  ├─────────────────────────────────────┤
  │  Block(0,1)  │  Block(1,1)  │ ...  │
  └─────────────────────────────────────┘

  AMD GPU 执行单元：
  Block → 被拆分为多个 Wavefront（每个 64 线程）
  Wavefront → 在一个 SIMD 单元上执行（SIMT 模型）`,
            caption: 'HIP 的并行层次结构。Block 内的线程可以通过 __syncthreads() 同步，并共享 LDS（Local Data Share，即 Shared Memory）。Wavefront 是 AMD GPU 的实际调度单元。',
          },
        },
        {
          title: 'GPU 内存层次结构',
          content: 'AMD GPU 有多级内存层次，访问速度和容量各不相同：寄存器（Register）：每个线程私有，访问速度最快（单周期），但数量有限；LDS（Local Data Share）：Block 内所有线程共享，速度极快（约 1-2 周期），容量约 64KB per CU；L1 Cache：每个 CU 私有，约 32KB；L2/Infinity Cache：所有 CU 共享，容量因芯片而异（Navi33 约 32MB）；VRAM（HBM/GDDR6）：全局内存，所有线程可访问，容量最大但延迟最高（约 200-400 周期）。性能优化的关键是尽量使用 LDS 和 Cache，减少对 VRAM 的访问次数。',
          diagram: {
            type: 'ascii',
            content: `AMD GPU 内存层次结构（RX 7600 XT）

速度 ←──────────────────────────────────────────→ 容量

  ┌────────────────┐
  │  Register VGPR │  1 cycle      │  256 per lane × 32 CU
  │  (per thread)  │              │  ~2MB total
  └───────┬────────┘
          │
  ┌───────▼────────┐
  │     LDS        │  1-2 cycles   │  64KB per CU
  │ (Block shared) │              │  ~2MB total
  │ __shared__     │              │
  └───────┬────────┘
          │
  ┌───────▼────────┐
  │   L0/L1 Cache  │  ~10 cycles   │  16-32KB per CU
  │  (CU-private)  │              │
  └───────┬────────┘
          │
  ┌───────▼────────┐
  │   L2 Cache     │  ~100 cycles  │  32MB (shared)
  │   (shared)     │              │  Infinity Cache
  └───────┬────────┘
          │
  ┌───────▼────────┐
  │     VRAM       │  ~300 cycles  │  8GB GDDR6
  │ (Global mem)   │  288 GB/s    │
  │ hipMalloc()    │              │
  └───────┬────────┘
          │ PCIe 4.0
  ┌───────▼────────┐
  │  System RAM    │  ~800 cycles  │  Host memory
  │ (CPU memory)   │  ~32 GB/s    │
  └────────────────┘

优化策略：
  寄存器 > LDS > L1 > L2 > VRAM > 系统内存
  ↑ 优先使用                    尽量避免 ↑`,
            caption: 'GPU 内存层次结构与访问延迟。性能优化的核心策略：用 LDS 替代 VRAM 访问（可提升 100-300 倍），用 coalesced access 模式提高 VRAM 带宽利用率。',
          },
        },
        {
          title: 'HIP 内存管理与优化',
          content: 'HIP 提供多种内存分配方式，选择正确的方式对性能至关重要。hipMalloc：在 GPU VRAM 中分配内存，GPU 访问最快，CPU 不能直接访问。hipHostMalloc（pinned memory）：在 CPU 端分配锁页内存，GPU 可以通过 PCIe 直接访问（DMA），传输速度比普通内存快 2-3 倍。hipMallocManaged（Unified Memory）：分配由系统自动管理的统一内存，CPU 和 GPU 都可以直接访问，系统会根据访问模式自动在 CPU 和 GPU 之间迁移数据——底层由 KFD 的 SVM（Shared Virtual Memory）机制实现。对于大数据传输，使用 hipMemcpyAsync + hipStream 实现计算与传输的重叠（overlap），可以隐藏 PCIe 延迟。',
        },
        {
          title: 'GPU 性能优化：Occupancy 与 Coalescing',
          content: '两个最重要的 GPU 性能优化概念：（1）Occupancy（占用率）：CU 上活跃 Wavefront 数量与最大可调度 Wavefront 数量的比值。高 Occupancy 能隐藏内存延迟（当一个 Wavefront 等待数据时，GPU 切换到另一个 Wavefront 执行）。影响 Occupancy 的因素：VGPR 使用量（越多 → 每个 CU 能容纳的 Wavefront 越少）、LDS 使用量和 Block 大小。（2）Memory Coalescing（内存合并访问）：Wavefront 中相邻线程访问相邻内存地址时，GPU 可以将多个访问合并为一个内存事务（一次 256 字节的请求），极大提升内存带宽利用率。反之，如果线程访问不连续地址（stride access），每个线程需要单独的内存事务，浪费带宽。优化矩阵乘法时，使用 LDS 作为中转来实现 coalesced 的全局内存访问是标准技巧（Tiled Matrix Multiplication）。',
        },
      ],
      keyBooks: [
        {
          title: 'HIP Programming Guide',
          author: 'AMD Inc.',
          relevance: 'AMD 官方 HIP 编程指南，包含 HIP API 参考和最佳实践。',
          url: 'https://rocm.docs.amd.com/projects/HIP/en/latest/',
        },
        {
          title: 'Programming Massively Parallel Processors',
          author: 'David B. Kirk, Wen-mei W. Hwu',
          isbn: '978-0323912310',
          relevance: 'GPU 并行编程的权威教材，虽然以 CUDA 为例，但概念完全适用于 HIP。',
        },
      ],
      onlineResources: [
        {
          title: 'ROCm HIP Documentation',
          url: 'https://rocm.docs.amd.com/projects/HIP/en/latest/',
          type: 'doc',
          description: 'AMD 官方 HIP 文档，包含 API 参考、编程指南和示例代码。',
        },
        {
          title: 'HIP Examples on GitHub',
          url: 'https://github.com/ROCm/HIP-Examples',
          type: 'repo',
          description: 'AMD 官方 HIP 示例代码库，包含各种 GPU 计算算法的 HIP 实现。',
        },
      ],
    },
    codeReading: [
      {
        title: 'HIP 向量加法示例',
        description: '一个完整的 HIP 程序，实现 GPU 上的向量加法，展示 HIP 编程的基本模式。',
        file: 'vector_add.hip',
        language: 'cpp',
        code: `// HIP 向量加法示例
// 展示 HIP 编程的基本模式：Kernel 定义、内存管理、Kernel 启动

#include <hip/hip_runtime.h>
#include <stdio.h>

// GPU Kernel 函数：每个线程计算一个元素的加法
__global__ void vector_add(const float* a, const float* b,
                             float* c, int n)
{
    // 计算当前线程的全局索引
    int idx = blockIdx.x * blockDim.x + threadIdx.x;
    
    // 边界检查，避免越界访问
    if (idx < n) {
        c[idx] = a[idx] + b[idx];
    }
}

int main()
{
    const int N = 1024 * 1024;  // 1M 个元素
    const size_t size = N * sizeof(float);
    
    // 1. 在 CPU 分配内存
    float *h_a = (float*)malloc(size);
    float *h_b = (float*)malloc(size);
    float *h_c = (float*)malloc(size);
    
    // 初始化数据
    for (int i = 0; i < N; i++) {
        h_a[i] = i * 1.0f;
        h_b[i] = i * 2.0f;
    }
    
    // 2. 在 GPU 分配内存（VRAM）
    float *d_a, *d_b, *d_c;
    hipMalloc(&d_a, size);
    hipMalloc(&d_b, size);
    hipMalloc(&d_c, size);
    
    // 3. 将数据从 CPU 拷贝到 GPU（触发 DMA 传输）
    hipMemcpy(d_a, h_a, size, hipMemcpyHostToDevice);
    hipMemcpy(d_b, h_b, size, hipMemcpyHostToDevice);
    
    // 4. 启动 GPU Kernel
    // 每个 Block 256 个线程，总共 N/256 个 Block
    int blockSize = 256;
    int gridSize = (N + blockSize - 1) / blockSize;
    
    hipLaunchKernelGGL(vector_add,
                        dim3(gridSize), dim3(blockSize),
                        0, 0,  // shared memory size, stream
                        d_a, d_b, d_c, N);
    
    // 5. 等待 GPU 完成（CPU-GPU 同步）
    hipDeviceSynchronize();
    
    // 6. 将结果从 GPU 拷贝回 CPU
    hipMemcpy(h_c, d_c, size, hipMemcpyDeviceToHost);
    
    // 7. 释放 GPU 内存
    hipFree(d_a); hipFree(d_b); hipFree(d_c);
    
    printf("Result: c[0]=%f, c[1]=%f\\n", h_c[0], h_c[1]);
    return 0;
}`,
        annotations: [
          '__global__ 关键字声明这是一个 GPU Kernel 函数，从 CPU 调用，在 GPU 上执行',
          'blockIdx.x * blockDim.x + threadIdx.x 是计算线程全局索引的标准公式',
          'hipMalloc 在 GPU VRAM 中分配内存，对应 CUDA 的 cudaMalloc',
          'hipMemcpy 触发 DMA 传输，将数据在 CPU 内存和 GPU VRAM 之间传输',
          'hipLaunchKernelGGL 启动 Kernel，<<<gridSize, blockSize>>> 是 CUDA 语法，HIP 使用这个宏',
          'hipDeviceSynchronize 等待 GPU 完成所有工作，这是 CPU-GPU 同步的最简单方式（但效率不高）',
        ],
      },
    ],
    miniProject: {
      title: '实现 GPU 矩阵乘法并分析性能',
      description: '使用 HIP 实现矩阵乘法，并使用 rocprof 分析 GPU 利用率和内存带宽。',
      objectives: [
        '掌握 HIP Kernel 编写和优化',
        '理解 LDS（Shared Memory）的使用',
        '学会使用 rocprof 进行性能分析',
      ],
      steps: [
        '实现朴素版矩阵乘法（每个线程计算一个输出元素）',
        '使用 rocprof 分析性能：rocprof --stats ./matmul',
        '实现使用 LDS 的优化版本（Tiled Matrix Multiplication）',
        '对比两个版本的性能，分析内存带宽利用率',
      ],
      expectedOutput: '两个版本的性能对比报告，显示 LDS 优化版本的 GPU 利用率提升（通常可以提升 5-10 倍）。',
    },
    interviewQuestions: [
      {
        question: '解释 AMD GPU 中 Wavefront 的概念，以及它对 HIP 程序性能的影响。',
        difficulty: 'hard',
        hint: '从 SIMT 执行模型、Wavefront 分歧（Divergence）、占用率（Occupancy）三个角度回答。',
        answer: 'Wavefront 是 AMD GPU 的最小调度单元，包含 64 个线程（RDNA 架构支持 32 或 64）。这 64 个线程执行相同的指令但处理不同的数据（SIMT 模型）。对性能的影响：（1）Wavefront 分歧（Divergence）：如果 Wavefront 内的线程走了不同的分支（if/else），GPU 需要串行执行两个分支，效率减半。应尽量避免 Wavefront 内的分支分歧；（2）Block 大小：Block 大小应该是 Wavefront 大小（64）的整数倍，否则最后一个 Wavefront 会有空闲线程，浪费资源；（3）占用率（Occupancy）：每个 CU 可以同时调度多个 Wavefront（通常 8-16 个），高占用率可以隐藏内存延迟。影响占用率的因素包括寄存器使用量和 LDS 使用量。',
      },
      {
        question: 'hipMalloc、hipHostMalloc 和 hipMallocManaged 有什么区别？各自适用于什么场景？',
        difficulty: 'medium',
        hint: '从内存位置、CPU/GPU 可访问性、传输性能的角度比较。',
        answer: 'hipMalloc：在 GPU VRAM 中分配内存。GPU 访问速度最快（数百 GB/s），但 CPU 不能直接访问，必须通过 hipMemcpy 传输数据。适用场景：GPU 大量读写、CPU 很少访问的数据（纹理、大型矩阵）。hipHostMalloc（pinned memory）：在 CPU 端分配锁页内存，不会被操作系统换出到磁盘。GPU 可以通过 PCIe DMA 直接访问，传输速度是普通内存的 2-3 倍。适用场景：CPU-GPU 频繁传输的 staging buffer，hipMemcpyAsync 的源/目标缓冲区。hipMallocManaged（Unified/Managed Memory）：分配统一虚拟地址空间中的内存，CPU 和 GPU 都可以直接通过指针访问。底层由 KFD 的 SVM 机制管理页面迁移（GPU 访问时迁移到 VRAM，CPU 访问时迁回 RAM）。适用场景：快速原型开发、数据结构包含指针的复杂场景。性能注意：页面迁移有开销，频繁的 CPU-GPU 交替访问会导致"ping-pong"问题，性能远低于显式管理。',
      },
      {
        question: '如何使用 rocprof 分析 HIP 程序的 GPU 性能？描述关键的性能指标。',
        difficulty: 'medium',
        hint: '从硬件计数器、API 追踪和关键指标（Occupancy、Memory Bandwidth Utilization）的角度回答。',
        answer: 'rocprof 使用方法：（1）基本性能统计：rocprof --stats ./my_hip_program，输出 Kernel 名称、执行次数、平均耗时、GPU 利用率。（2）硬件计数器分析：创建 input.txt 文件指定要收集的计数器（如 SQ_WAVES、SQ_INSTS_VALU、TCC_HIT_sum），运行 rocprof -i input.txt ./my_program，分析 VALU 利用率、缓存命中率等。（3）API 追踪：rocprof --hsa-trace ./my_program，追踪所有 HSA/HIP API 调用的时间和参数。关键指标：（a）Occupancy = active_wavefronts / max_wavefronts_per_cu，低于 50% 需要优化（减少寄存器/LDS 使用）；（b）Memory Bandwidth Utilization = actual_bytes / peak_bandwidth，低于 50% 说明访问模式不佳（非 coalesced）；（c）VALU Utilization = VALU_busy_cycles / total_cycles，低说明计算密度不足（被内存延迟瓶颈）；（d）LDS Bank Conflict = lds_bank_conflict / lds_access，高于 10% 需要优化数据布局。',
      },
      {
        question: '什么是 Memory Coalescing？如何在 HIP 程序中实现合并内存访问？',
        difficulty: 'hard',
        hint: '从 Wavefront 的内存请求合并、数据布局（AoS vs SoA）和 stride 的角度回答。',
        answer: 'Memory Coalescing 是 GPU 将 Wavefront 中多个线程的内存访问合并为一个内存事务的机制。当 Wavefront 的 64 个线程访问连续的内存地址时（如 thread[i] 访问 addr[i]），GPU 可以将 64 × 4B = 256B 的请求合并为一个 256B 的内存事务，完全利用内存带宽。反之，如果线程访问不连续地址（stride access），每个线程需要单独的事务，浪费大量带宽。实现方法：（1）数据布局：使用 SoA（Structure of Arrays）而非 AoS（Array of Structures）。AoS 中 struct { float x, y, z; } arr[N]，连续线程访问 arr[i].x 时 stride=12B；SoA 中 float x[N], y[N], z[N]，连续线程访问 x[i] 时 stride=4B，完美合并。（2）矩阵乘法：使用 LDS 作为中转站——先用 coalesced access 从全局内存加载 tile 到 LDS，再从 LDS 以任意模式读取，避免非合并的全局内存访问。（3）间接索引：arr[index[i]] 无法合并，应预先排序 index 使其连续。',
      },
      {
        question: '对比 HIP 和 CUDA 的异同，以及如何将 CUDA 程序移植到 HIP。',
        difficulty: 'easy',
        hint: '从 API 对应关系、编译工具和 hipify 工具的角度回答。',
        answer: 'HIP 和 CUDA 的设计目标就是最大化兼容性。相同点：编程模型完全相同（Grid/Block/Thread 层次）、Kernel 定义语法相同（__global__、<<<>>>）、大部分 API 一一对应（cudaMalloc → hipMalloc、cudaMemcpy → hipMemcpy）。不同点：（1）Wavefront size：AMD GPU 默认 64 线程（CUDA 的 Warp 是 32），影响 Block 大小选择和 shuffle 操作；（2）LDS vs Shared Memory：语义相同但硬件特性不同（AMD LDS 有 32 Bank，NVIDIA Shared Memory 有 32 Bank）；（3）原子操作：部分原子操作的硬件支持级别不同。移植方法：AMD 提供 hipify 工具：hipify-perl（正则替换，快速但不完美）和 hipify-clang（基于 Clang AST 分析，更准确）。运行 hipify-perl cuda_program.cu > hip_program.hip，大部分简单的 CUDA 程序可以直接转换并编译运行。复杂程序需要手动处理 warp size 差异和平台特定 API。',
      },
    ],
  },
  {
    id: 'llvm',
    number: '9',
    title: 'GPU 工具链与 LLVM',
    titleEn: 'GPU Toolchain & LLVM',
    icon: '🔧',
    description: '理解代码如何从 HIP/OpenCL 编译到 GPU 指令。LLVM AMDGPU 后端是 AMD Markham Toolchain 团队的核心工作。',
    estimatedHours: 60,
    difficulty: 'expert',
    subModules: [
      { id: 'llvm-basics', title: '9.1 LLVM 编译器框架', titleEn: 'LLVM Compiler Framework' },
      { id: 'llvm-amdgpu', title: '9.2 AMDGPU LLVM 后端', titleEn: 'AMDGPU LLVM Backend' },
    ],
    theory: {
      overview: 'LLVM 是现代编译器基础设施的核心，AMD 的 GPU 编译器（包括 HIP、OpenCL、Vulkan 着色器编译）都基于 LLVM 构建。理解 LLVM 的架构和 AMDGPU 后端，对于进入 AMD Markham 的 Toolchain 团队至关重要。',
      sections: [
        {
          title: 'LLVM 编译器框架概述',
          content: 'LLVM 是一个模块化的编译器基础设施，其核心是 LLVM IR（Intermediate Representation，中间表示）。编译流程分为三个阶段：前端（Frontend）将源代码（C/C++/HIP/OpenCL）编译为 LLVM IR；中端（Middle-end）对 LLVM IR 进行优化（各种 Pass）；后端（Backend）将优化后的 LLVM IR 编译为目标机器码（x86、ARM、AMDGPU 等）。这种三段式设计使得不同语言和不同目标平台可以共享同一套优化框架。',
          diagram: {
            type: 'ascii',
            content: `
  LLVM 编译流程（以 HIP 程序为例）

  HIP 源码 (.hip)
       │
       ▼ Clang 前端
  LLVM IR (.ll / .bc)
       │
       ▼ LLVM 优化 Passes
       │  - mem2reg (将内存变量提升为寄存器)
       │  - instcombine (指令合并)
       │  - loop-unroll (循环展开)
       │  - amdgpu-promote-alloca (将 alloca 提升到 LDS)
       │  - ... 数百个优化 Pass
       ▼
  优化后的 LLVM IR
       │
       ▼ AMDGPU 后端
       │  - 指令选择 (Instruction Selection)
       │  - 寄存器分配 (Register Allocation)
       │  - 指令调度 (Instruction Scheduling)
       ▼
  AMDGPU 机器码 (GCN/RDNA ISA)
       │
       ▼
  .hsaco 文件（GPU 可执行文件）`,
            caption: 'LLVM 三段式编译流程。AMDGPU 后端负责将 LLVM IR 编译为 AMD GPU 的机器码（GCN/RDNA 指令集）。',
          },
        },
        {
          title: 'AMDGPU LLVM 后端',
          content: 'AMDGPU 后端是 LLVM 中最复杂的后端之一，支持 AMD 的所有 GPU 架构（GCN 1.0 到 RDNA3）。关键组件：AMDGPUTargetMachine：后端的入口点，注册所有 Pass；AMDGPUInstrInfo：定义所有 AMDGPU 指令；AMDGPURegisterInfo：定义寄存器文件（VGPR、SGPR、AGPR）；AMDGPUISelDAGToDAG：指令选择，将 LLVM IR 的 DAG 转换为 AMDGPU 指令；SIRegisterAllocator：GPU 专用的寄存器分配器，需要考虑 VGPR/SGPR 的区别。',
        },
        {
          title: 'VGPR 与 SGPR：GPU 寄存器的独特之处',
          content: 'AMD GPU 有两类寄存器：VGPR（Vector General Purpose Register）：每个线程有独立的 VGPR，用于存储线程私有数据（如坐标、颜色值）；每个 CU 有 256 个 VGPR，每个 Wavefront 最多使用 256 个 VGPR。SGPR（Scalar General Purpose Register）：整个 Wavefront 共享一组 SGPR，用于存储所有线程相同的数据（如常量、循环计数器、指针）；SGPR 操作比 VGPR 操作更节能。编译器需要智能地决定哪些变量放在 VGPR，哪些放在 SGPR，这直接影响程序的占用率（Occupancy）和性能。',
          diagram: {
            type: 'ascii',
            content: `VGPR 与 SGPR 的物理布局（每个 CU）

┌─────────────────────────────────────────────────────────────┐
│  Compute Unit (CU)                                           │
│                                                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  VGPR File (Vector GPR)                                  │  │
│  │  256 Registers × 64 lanes (per Wavefront)               │  │
│  │                                                        │  │
│  │  Wavefront 0: v0[0..63] v1[0..63] ... v255[0..63]    │  │
│  │  Wavefront 1: v0[0..63] v1[0..63] ... v255[0..63]    │  │
│  │  ...                                                   │  │
│  │                                                        │  │
│  │  ► Thread-private: coords, colors, threadIdx.x calcs  │  │
│  │  ► More VGPRs → fewer Wavefronts per CU               │  │
│  │    (256 VGPR → 1 Wavefront, 128 → 2, 64 → 4...)      │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  SGPR File (Scalar GPR)                               │  │
│  │  128 Registers (shared by entire Wavefront)           │  │
│  │                                                        │  │
│  │  s0-s1: Kernel param base addr (64-bit pointer)       │  │
│  │  s2-s3: Global offset                                 │  │
│  │  s4:    Loop counter (same for all threads)           │  │
│  │  s5-s6: Constant values                               │  │
│  │                                                        │  │
│  │  ► Data shared by all threads in a Wavefront          │  │
│  │  ► Scalar ops 64x more power-efficient than vector    │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                              │
│  Occupancy Impact:                                           │
│  ┌─────────────────────────────────────────┐                │
│  │ VGPR Usage  │ Max Wavefront/CU  │ Occup. │                │
│  ├─────────────┼──────────────────┼────────┤                │
│  │ 24 VGPR     │ 10 Wavefront     │ 100%   │                │
│  │ 48 VGPR     │ 5 Wavefront      │  50%   │                │
│  │ 128 VGPR    │ 2 Wavefront      │  20%   │                │
│  │ 256 VGPR    │ 1 Wavefront      │  10%   │                │
│  └─────────────┴──────────────────┴────────┘                │
└─────────────────────────────────────────────────────────────┘`,
            caption: 'VGPR 和 SGPR 在 CU 中的物理布局。LLVM AMDGPU 后端的寄存器分配器需要在最小化 VGPR 使用（提高 Occupancy）和避免 spill（寄存器溢出到内存）之间取得平衡。',
          },
        },
      ],
      keyBooks: [
        {
          title: 'LLVM Essentials',
          author: 'Suyog Sarda, Mayur Pandey',
          isbn: '978-1785280801',
          relevance: 'LLVM 入门书籍，介绍 LLVM 架构、IR、Pass 编写和后端开发。',
        },
        {
          title: 'Engineering a Compiler',
          author: 'Keith D. Cooper, Linda Torczon',
          isbn: '978-0120884780',
          relevance: '编译器理论的权威教材，为理解 LLVM 的设计决策提供理论基础。',
        },
      ],
      onlineResources: [
        {
          title: 'LLVM Documentation',
          url: 'https://llvm.org/docs/',
          type: 'doc',
          description: 'LLVM 官方文档，包含 LLVM IR 参考、Pass 编写指南和后端开发教程。',
        },
        {
          title: 'AMDGPU LLVM Backend Source',
          url: 'https://github.com/llvm/llvm-project/tree/main/llvm/lib/Target/AMDGPU',
          type: 'repo',
          description: 'AMDGPU LLVM 后端的源码，是理解 AMD GPU 编译器的第一手资料。',
        },
        {
          title: 'AMD GPU ISA Documentation',
          url: 'https://gpuopen.com/documentation/',
          type: 'doc',
          description: 'AMD GPU 指令集架构文档，了解 AMDGPU 后端生成的目标指令。',
        },
      ],
    },
    codeReading: [
      {
        title: '查看 HIP 程序的 LLVM IR 和 AMDGPU 汇编',
        description: '使用编译工具链将 HIP 程序编译到 LLVM IR 和 AMDGPU ISA，理解编译流程。',
        file: 'terminal',
        language: 'bash',
        code: `# 将 HIP 程序编译到 LLVM IR（人类可读格式）
hipcc -S -emit-llvm -O2 vector_add.hip -o vector_add.ll

# 查看生成的 LLVM IR
cat vector_add.ll | head -100

# 将 HIP 程序编译到 AMDGPU 汇编（GCN/RDNA 指令集）
hipcc -S -O2 vector_add.hip -o vector_add.s

# 使用 llvm-dis 反汇编 .bc 文件
hipcc -c -emit-llvm vector_add.hip -o vector_add.bc
llvm-dis vector_add.bc -o vector_add_readable.ll

# 查看 AMDGPU 后端支持的所有目标
llc --version | grep AMDGPU

# 将 LLVM IR 编译到 AMDGPU 机器码
llc -march=amdgcn -mcpu=gfx1102 vector_add.ll -o vector_add_gfx1102.s`,
        annotations: [
          '-emit-llvm 让 clang 输出 LLVM IR 而不是最终机器码，-S 输出文本格式（.ll）',
          'gfx1102 是 RX 7600 XT (Navi33) 的 LLVM 目标 CPU 名称，每代 GPU 有不同的 mcpu 值',
          'LLVM IR 是 SSA（Static Single Assignment）形式，每个变量只被赋值一次',
          'GPU Kernel 在 LLVM IR 中以 define amdgpu_kernel 函数出现，带有特殊的调用约定',
          'llc 是 LLVM 的静态编译器后端，可以将 LLVM IR 编译到任何支持的目标平台',
        ],
      },
      {
        title: 'AMDGPU ISA 汇编代码解析',
        description: '分析 vector_add Kernel 编译后的 AMDGPU 汇编代码，理解 VGPR/SGPR 的使用和指令格式。',
        file: 'vector_add_gfx1102.s (AMDGPU ISA)',
        language: 'asm',
        code: `; vector_add Kernel 的 AMDGPU ISA (gfx1102 / RDNA3)
; 编译命令: hipcc -S -O2 --offload-arch=gfx1102 vector_add.hip

; Kernel 元数据（寄存器使用量、LDS 等）
; .amdhsa_kernel vector_add
;   .amdhsa_group_segment_fixed_size 0    ; LDS 使用: 0 bytes
;   .amdhsa_next_free_vgpr 4              ; 使用 4 个 VGPR
;   .amdhsa_next_free_sgpr 10             ; 使用 10 个 SGPR

vector_add:
    ; 加载 Kernel 参数 (从 SGPR 中的参数指针读取)
    s_load_b64 s[0:1], s[4:5], 0x0    ; s[0:1] = &a (指针, 64-bit)
    s_load_b64 s[2:3], s[4:5], 0x8    ; s[2:3] = &b
    s_load_b64 s[6:7], s[4:5], 0x10   ; s[6:7] = &c
    s_load_b32 s8, s[4:5], 0x18       ; s8 = n (标量, 32-bit)

    ; 计算全局线程 ID: idx = blockIdx.x * blockDim.x + threadIdx.x
    v_mov_b32 v1, s12                  ; v1 = blockIdx.x (从 SGPR 加载)
    v_mad_u32_u24 v0, v1, s13, v0     ; v0 = blockIdx.x * blockDim.x + threadIdx.x
    ; ↑ v0 初始值就是 threadIdx.x (由硬件设置)

    ; 等待 SGPR 加载完成
    s_waitcnt lgkmcnt(0)

    ; 边界检查: if (idx < n)
    v_cmp_lt_u32 s[0:1], v0, s8       ; 比较 idx < n, 结果写入 EXEC mask
    s_and_saveexec_b64 s[0:1], s[0:1] ; 条件执行 mask
    s_cbranch_execz .L_exit            ; 如果所有线程都不满足条件, 跳过

    ; 计算地址偏移 (每个元素 4 bytes)
    v_lshlrev_b32 v0, 2, v0           ; v0 = idx * 4 (左移 2 位)

    ; 加载 a[idx] 和 b[idx] (全局内存 → VGPR)
    global_load_b32 v1, v0, s[0:1]    ; v1 = a[idx]
    global_load_b32 v2, v0, s[2:3]    ; v2 = b[idx]
    s_waitcnt vmcnt(0)                 ; 等待全局内存加载完成

    ; 执行加法 (VALU 指令, 64 线程并行)
    v_add_f32 v1, v1, v2              ; v1 = a[idx] + b[idx]

    ; 存储结果 c[idx] (VGPR → 全局内存)
    global_store_b32 v0, v1, s[6:7]   ; c[idx] = v1

.L_exit:
    s_endpgm                           ; Kernel 结束`,
        annotations: [
          's_load_b64 是标量加载指令（Scalar），从内存读取 Kernel 参数到 SGPR。参数对所有线程相同，所以用 SGPR',
          'v_mad_u32_u24 是向量乘加指令（Vector），64 个线程同时计算各自的线程 ID',
          's_waitcnt lgkmcnt(0) 等待 SGPR 加载完成。GPU 内存操作是异步的，必须显式等待',
          'v_cmp + s_and_saveexec 实现条件执行：不满足条件的线程被 EXEC mask 关闭',
          'global_load_b32 是全局内存加载，地址 = VGPR(偏移) + SGPR(基地址)，VGPR 部分对每个线程不同',
          'v_add_f32 是核心计算指令，64 个线程在一个周期内并行执行浮点加法',
          '整个 Kernel 只用 4 个 VGPR，Occupancy 可以达到接近 100%',
        ],
      },
    ],
    miniProject: {
      title: '编写一个简单的 LLVM Pass',
      description: '编写一个 LLVM 分析 Pass，统计 HIP Kernel 中 VGPR 相关指令的数量，理解 Pass 框架。',
      objectives: [
        '理解 LLVM Pass 框架',
        '学会遍历 LLVM IR 的函数、基本块和指令',
        '为后续理解 AMDGPU 后端的优化 Pass 打基础',
      ],
      steps: [
        '克隆 LLVM 源码：git clone https://github.com/llvm/llvm-project',
        '在 llvm/lib/Transforms/Utils/ 下创建 CountInstructions.cpp',
        '实现 FunctionPass，遍历所有指令并按类型统计',
        '在 CMakeLists.txt 中注册 Pass',
        '编译并测试：opt -load-pass-plugin=./CountInstructions.so -passes=count-instr vector_add.ll',
      ],
      expectedOutput: '一个可以统计 LLVM IR 中各类指令数量的 Pass，输出如 "Function vector_add: 45 instructions, 12 memory ops, 8 arithmetic ops"。',
    },
    interviewQuestions: [
      {
        question: '解释 LLVM IR 的 SSA（Static Single Assignment）形式，以及它对编译器优化的意义。',
        difficulty: 'hard',
        hint: '从 SSA 的定义、phi 节点、以及它如何简化数据流分析来回答。',
        answer: 'SSA（静态单赋值）形式要求每个变量只被赋值一次。如果原始代码中一个变量被多次赋值，SSA 会将其重命名为多个版本（x → x1, x2, x3...）。当控制流汇合时（如 if-else 后的合并点），使用 phi 节点选择正确的版本。SSA 对优化的意义：（1）简化数据流分析：每个使用点只有一个定义点，不需要复杂的到达定义分析（Reaching Definition Analysis）；（2）常量传播：如果 x1 = 5，所有使用 x1 的地方都可以直接替换为 5；（3）死代码消除：如果一个 SSA 变量没有使用者，其定义指令可以直接删除；（4）寄存器分配：SSA 变量的活跃区间（Live Range）更容易计算，有助于高效分配寄存器。AMDGPU 后端在指令选择后会将 SSA 形式转换为实际的 VGPR/SGPR 分配。',
      },
      {
        question: 'AMD GPU 中 VGPR 和 SGPR 的区别是什么？编译器如何决定使用哪种寄存器？',
        difficulty: 'hard',
        hint: '从数据的 Wavefront 内一致性（Uniformity）角度来区分。',
        answer: 'VGPR（Vector GPR）：每个 Wavefront 中的每个线程都有独立的 VGPR 副本；用于存储线程私有数据（如线程 ID、坐标、颜色值）；VGPR 操作在所有 64 个线程上并行执行（SIMD）；每个 CU 有 256 个 VGPR per lane，Wavefront 使用越多 VGPR，CU 能同时调度的 Wavefront 越少（影响占用率）。SGPR（Scalar GPR）：整个 Wavefront 共享一组 SGPR；用于存储所有线程相同的数据（Uniform Data），如常量、循环计数器、指针基地址；SGPR 操作只执行一次（标量执行），更节能；每个 Wavefront 有 128 个 SGPR。编译器决策（Uniformity Analysis）：LLVM AMDGPU 后端会进行 Uniformity Analysis，分析每个值在 Wavefront 内是否对所有线程相同（Uniform）；如果是 Uniform 值（如函数参数中的指针、循环不变量），分配到 SGPR；如果是 Divergent 值（如 threadIdx.x 衍生的值），分配到 VGPR。',
      },
    ],
  },
  {
    id: 'testing',
    number: '10',
    title: '测试与 CI',
    titleEn: 'Testing & CI',
    icon: '✅',
    description: '学习如何编写和运行测试，确保驱动质量。IGT GPU Tests、内核自测和可复现的 Bug 报告是 AMD 工程师的日常。',
    estimatedHours: 30,
    difficulty: 'advanced',
    subModules: [
      { id: 'test-igt', title: '10.1 IGT GPU Tests', titleEn: 'IGT GPU Tests' },
      { id: 'test-kernel', title: '10.2 内核自测', titleEn: 'Kernel Selftests' },
      { id: 'test-bug', title: '10.3 Bug 报告规范', titleEn: 'Bug Report Standards' },
      { id: 'test-ci', title: '10.4 CI 与测试管线', titleEn: 'CI & Test Pipeline' },
    ],
    theory: {
      overview: 'GPU 驱动测试是保证驱动质量的关键。Linux 内核社区有一套完整的测试基础设施：IGT（Intel GPU Tools，尽管名字如此，但也支持 AMD GPU）是 GPU 驱动的主要测试框架；内核自测（Kernel Selftests）是内核内置的单元测试；CI（Continuous Integration）系统自动运行这些测试，确保每个补丁不会引入回归。AMD 在 freedesktop.org 维护了自己的 CI 管线，每个提交到 amd-gfx 邮件列表的补丁都会自动触发 IGT 测试。',
      sections: [
        {
          title: 'IGT GPU Tests 架构与核心 API',
          content: 'IGT（Intel GPU Tools）是一个开源的 GPU 驱动测试框架，包含 1500+ 个测试用例，覆盖 DRM、KMS、GEM、性能等各个方面。对于 amdgpu 驱动，IGT 中有专门的 amdgpu 测试套件（tests/amdgpu/）。IGT 的核心架构：每个测试是一个独立的 C 程序，使用 IGT 提供的宏和辅助函数；igt_main 宏定义测试入口，igt_subtest 定义子测试，igt_fixture 定义 setup/teardown；igt_assert/igt_assert_eq 系列宏用于断言，失败时自动收集 GPU 状态；igt_require 用于条件跳过（如硬件不支持某功能）。关键文件：lib/igt_core.h（核心宏和生命周期管理）、lib/igt_kms.h（KMS 测试辅助函数）、lib/igt_amd.h（AMD 特定辅助函数，如读取 amdgpu debugfs 属性）。',
          diagram: {
            type: 'ascii',
            content: `IGT 测试架构

┌─────────────────────────────────────────────────────────────┐
│                    IGT Test Programs (tests/)                    │
│                                                              │
│  tests/amdgpu/        tests/kms_*        tests/gem_*        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ amdgpu_cs    │  │ kms_atomic   │  │ gem_create   │      │
│  │ amdgpu_bo    │  │ kms_flip     │  │ gem_exec     │      │
│  │ amdgpu_vm    │  │ kms_cursor   │  │ gem_mmap     │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         └──────────────────┴─────────────────┘               │
│                            │                                 │
├────────────────────────────┼─────────────────────────────────┤
│                    IGT Library (lib/)                            │
│                            │                                 │
│  ┌────────────┐  ┌────────┴────────┐  ┌──────────────┐     │
│  │ igt_core.h │  │ igt_kms.h      │  │ igt_amd.h    │     │
│  │ assertions  │  │ connector/crtc │  │ debugfs read  │     │
│  │ subtest mgr │  │ framebuffer    │  │ AMD-specific  │     │
│  └────────────┘  └────────┬────────┘  └──────────────┘     │
│                            │                                 │
├────────────────────────────┼─────────────────────────────────┤
│                     libdrm (userspace)                         │
│                            │ ioctl                           │
├────────────────────────────┼─────────────────────────────────┤
│                     DRM Subsystem (kernel)                     │
│                            │                                 │
│                     amdgpu Driver                             │
├────────────────────────────┼─────────────────────────────────┤
│                     GPU Hardware                              │
└─────────────────────────────────────────────────────────────┘`,
            caption: 'IGT 测试框架分层架构。测试程序通过 IGT 库调用 libdrm，最终通过 DRM ioctl 与内核 amdgpu 驱动交互。AMD 特定的辅助函数在 lib/igt_amd.h 中。',
          },
        },
        {
          title: '内核自测（Kernel Selftests）与 DRM 测试',
          content: 'Kernel Selftests 是 Linux 内核内置的测试框架，位于 tools/testing/selftests/。DRM 子系统的自测位于 tools/testing/selftests/drm/，包含对 DRM 核心功能的单元测试。与 IGT 不同，Kernel Selftests 运行在内核空间（通过 KUnit）或使用最小化的用户态程序，不需要 IGT 框架的完整安装。关键测试：drm_buddy_test.c 测试 DRM Buddy 内存分配器（amdgpu 的 VRAM 管理依赖此分配器）；drm_mm_test.c 测试 DRM 内存管理器；drm_cmdline_test.c 测试内核命令行参数解析。KUnit 测试可以直接编译进内核或作为模块加载，输出通过 dmesg 查看（TAP 格式）。对于 amdgpu，drivers/gpu/drm/amd/amdgpu/tests/ 下有驱动特定的 KUnit 测试。',
          diagram: {
            type: 'ascii',
            content: `内核测试框架对比

┌──────────────────────────────────────────────────────────────┐
│                       Test Layers                              │
│                                                               │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │   IGT Tests     │  │  Kernel         │  │  KUnit       │ │
│  │   (Userspace)    │  │  Selftests      │  │  (Kernel)    │ │
│  │                 │  │  (User+Kernel)  │  │              │ │
│  │ Runs in:        │  │ Runs in:        │  │ Runs in:     │ │
│  │   User space    │  │   User space    │  │ Kernel space │ │
│  │                 │  │                 │  │              │ │
│  │ Tests:          │  │ Tests:          │  │ Tests:       │ │
│  │   DRM ioctl     │  │   sysfs/ioctl   │  │ Kernel funcs │ │
│  │   Display/render│  │   Drv behavior  │  │ Data structs │ │
│  │                 │  │                 │  │              │ │
│  │ Deps:           │  │ Deps:           │  │ Deps:        │ │
│  │   libdrm        │  │   Minimal       │  │ N/A (kernel) │ │
│  │   cairo/pixman  │  │                 │  │              │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
│                                                               │
│  Scope:  Func/Integration    Regress/Smoke       Unit test      │
│  Phase:  Pre-patch submit    After kernel build   During dev     │
└──────────────────────────────────────────────────────────────┘`,
            caption: 'Linux GPU 驱动的三层测试体系。IGT 是最全面的功能测试，Kernel Selftests 用于快速冒烟测试，KUnit 用于内核内部数据结构的单元测试。',
          },
        },
        {
          title: 'CI 与 AMD 测试管线',
          content: 'AMD 在 freedesktop.org 的 GitLab 实例上维护了 CI（Continuous Integration）管线。每个提交到 drm/amd 仓库的补丁都会自动触发测试。CI 管线的关键阶段：（1）Build Stage：在多个架构上编译内核（x86_64、arm64），确保补丁没有编译错误；（2）Static Analysis：运行 sparse、smatch、coccinelle 等静态分析工具检查代码质量；（3）IGT Test Stage：在实际 AMD GPU 硬件上运行 IGT 测试套件，包括 RDNA2/3 设备；（4）Regression Check：对比测试结果与 baseline，标记任何新的 FAIL。AMD 内部还使用 0-Day Bot（Intel 维护的内核测试机器人）和 DRM CI（freedesktop.org 的公共 CI）来捕获跨驱动的回归。补丁被合并前必须通过 CI 的所有检查。',
          diagram: {
            type: 'ascii',
            content: `AMD GPU 驱动 CI 管线

开发者提交补丁
     │
     ▼
┌─────────────────────────────────────────────────────────────┐
│  Stage 1: Build & Compile                                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                  │
│  │ x86_64   │  │ arm64    │  │ allconfig │                  │
│  │ defconfig │  │ build    │  │ variants │                  │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘                  │
│       └──────────────┴─────────────┘                         │
│                      │ PASS?                                 │
└──────────────────────┼──────────────────────────────────────┘
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  Stage 2: Static Analysis                                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                  │
│  │ sparse   │  │ smatch   │  │checkpatch│                  │
│  │ TypeCheck │  │BugPattern│  │StyleCheck│                  │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘                  │
│       └──────────────┴─────────────┘                         │
│                      │ PASS?                                 │
└──────────────────────┼──────────────────────────────────────┘
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  Stage 3: Hardware Testing (IGT)                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ RDNA2 Farm   │  │ RDNA3 Farm   │  │ GCN Farm     │      │
│  │ (RX 6800)    │  │ (RX 7600)    │  │ (Vega 56)    │      │
│  │ IGT amdgpu   │  │ IGT amdgpu   │  │ IGT amdgpu   │      │
│  │ IGT kms_*    │  │ IGT kms_*    │  │ IGT kms_*    │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         └──────────────────┴─────────────────┘               │
│                      │ PASS?                                 │
└──────────────────────┼──────────────────────────────────────┘
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  Stage 4: Regression Analysis                                │
│  ┌──────────────────────────────────────────┐               │
│  │  vs baseline: new FAIL → mark regression │               │
│  │  new PASS → mark as fixed               │               │
│  │  SKIP change → check removed feature    │               │
│  └──────────────────────────────────────────┘               │
└──────────────────────┬──────────────────────────────────────┘
                       ▼
              ┌───────────────────┐
              │ All PASS          │
              │ → Merge ready     │
              │                   │
              │ Has FAIL          │
              │ → Needs fixing    │
              └───────────────────┘`,
            caption: 'AMD GPU 驱动的 CI 管线。补丁必须通过编译、静态分析和硬件测试三个阶段才能被合并。测试在多代 AMD GPU 硬件上并行运行。',
          },
        },
        {
          title: '如何提交高质量的 Bug 报告',
          content: '一个好的 Bug 报告应该包含：（1）系统信息：内核版本（uname -a）、发行版、GPU 型号（lspci）、驱动版本（modinfo amdgpu）；（2）复现步骤：最小化的复现程序或命令序列；（3）实际行为：错误信息、dmesg 输出、截图；（4）期望行为：正确的行为应该是什么；（5）回归信息：哪个内核版本开始出现问题（使用 git bisect 定位）。AMD 的 Bug 追踪系统：https://gitlab.freedesktop.org/drm/amd/-/issues。对于 GPU Hang 类 Bug，还应附加：/sys/class/drm/card0/device/gpu_metrics 的输出、debugfs 中 amdgpu_gpu_recover 的状态、以及完整的 dmesg ring dump（包含 GRBM_STATUS 和 CP_RB 寄存器值）。',
          diagram: {
            type: 'ascii',
            content: `高质量 Bug 报告结构

┌─────────────────────────────────────────────────────────────┐
│  Bug Title: [amdgpu] GPU hang on RX 7600 XT with KMS        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. System Info                                              │
│  ┌────────────────────────────────────────┐                 │
│  │ Kernel: 6.8.0-rc3                      │                 │
│  │ GPU:    AMD Navi33 [RX 7600 XT] (7480) │                 │
│  │ Driver: amdgpu (modinfo: version X)    │                 │
│  │ Distro: Ubuntu 24.04                   │                 │
│  └────────────────────────────────────────┘                 │
│                                                              │
│  2. Steps to Reproduce (minimal)                             │
│  ┌────────────────────────────────────────┐                 │
│  │ $ sudo igt_runner -t kms_atomic        │                 │
│  │ → Hangs at subtest atomic-setmode       │                 │
│  └────────────────────────────────────────┘                 │
│                                                              │
│  3. Actual Behavior + dmesg Output                           │
│  ┌────────────────────────────────────────┐                 │
│  │ [drm] GPU hang detected!               │                 │
│  │ [drm] GRBM_STATUS=0x00000300           │                 │
│  │ [drm] ring gfx timeout                 │                 │
│  └────────────────────────────────────────┘                 │
│                                                              │
│  4. Regression Info                                          │
│  ┌────────────────────────────────────────┐                 │
│  │ Good: v6.7   Bad: v6.8-rc1             │                 │
│  │ Bisect → commit abc123 caused issue    │                 │
│  └────────────────────────────────────────┘                 │
│                                                              │
│  5. Attachments: dmesg full, gpu_metrics, IGT log            │
└─────────────────────────────────────────────────────────────┘`,
            caption: '一个完整的 GPU 驱动 Bug 报告应包含这 5 个核心部分。回归信息（git bisect 结果）对维护者定位问题最有价值。',
          },
        },
        {
          title: '使用 ftrace 调试测试失败',
          content: '当 IGT 测试失败且错误原因不明时，ftrace 是深入分析内核行为的利器。ftrace 可以追踪内核函数调用、DRM ioctl 路径和 GPU 命令提交流程。关键用法：（1）追踪 DRM ioctl 调用：echo "drm_ioctl" > /sys/kernel/debug/tracing/set_ftrace_filter，然后运行失败的 IGT 测试，通过 trace 日志看到测试调用了哪些 ioctl 以及返回值；（2）追踪 amdgpu 函数：echo "amdgpu_*" > set_ftrace_filter 可以追踪所有 amdgpu 前缀的函数调用；（3）事件追踪：echo 1 > /sys/kernel/debug/tracing/events/drm/drm_vblank_event/enable 可以追踪 VBlank 事件，调试 KMS 测试失败。ftrace 的输出可以用 trace-cmd 工具可视化分析。在 AMD CI 管线中，失败的测试会自动收集 ftrace 日志作为调试信息。',
          diagram: {
            type: 'ascii',
            content: `ftrace 调试测试失败流程

IGT 测试失败
     │
     ▼
启用 ftrace 追踪
┌────────────────────────────────────────────────────────────┐
│  # Trace amdgpu related functions                           │
│  echo function > /sys/kernel/debug/tracing/current_tracer  │
│  echo "amdgpu_*" > /sys/kernel/debug/tracing/set_ftrace_filter │
│  echo 1 > /sys/kernel/debug/tracing/tracing_on             │
└────────────────────────────────────────┬───────────────────┘
                                         │
                                         ▼
                              重新运行失败的测试
                              sudo ./build/tests/kms_atomic
                                         │
                                         ▼
                              停止追踪并收集日志
┌────────────────────────────────────────────────────────────┐
│  echo 0 > tracing_on                                       │
│  cat /sys/kernel/debug/tracing/trace > igt_fail_trace.log  │
└────────────────────────────────────────┬───────────────────┘
                                         │
                                         ▼
                              分析 trace 日志
┌────────────────────────────────────────────────────────────┐
│  trace-cmd report igt_fail_trace.log                       │
│                                                             │
│  Output example:                                            │
│  kms_atomic-1234  [002] .... 10.123: amdgpu_dm_commit_planes │
│  kms_atomic-1234  [002] .... 10.124: amdgpu_dm_update_plane  │
│  kms_atomic-1234  [002] .... 10.125: dc_commit_state ← HANG│
│                                                             │
│  → Located dc_commit_state as the failure point             │
└────────────────────────────────────────────────────────────┘`,
            caption: 'ftrace 调试流程。通过追踪内核函数调用，可以精确定位 IGT 测试失败时内核中发生了什么，比单独看 dmesg 提供更细粒度的信息。',
          },
        },
      ],
      keyBooks: [
        {
          title: 'Linux Device Drivers, 3rd Edition',
          author: 'Jonathan Corbet, Alessandro Rubini, Greg Kroah-Hartman',
          isbn: '978-0596005900',
          relevance: '第 18 章（Debugging Techniques）详细介绍了内核调试和测试方法，包括 printk、oops 分析和测试策略。',
          url: 'https://docs.kernel.org/driver-api/index.html',
        },
        {
          title: 'Linux Kernel in a Nutshell',
          author: 'Greg Kroah-Hartman',
          isbn: '978-0596100797',
          relevance: '覆盖了内核配置和测试的最佳实践，包括如何使用 Kernel Selftests 和 CI 集成。',
          url: 'http://www.kroah.com/lkn/',
        },
      ],
      onlineResources: [
        {
          title: 'IGT GPU Tools',
          url: 'https://gitlab.freedesktop.org/drm/igt-gpu-tools',
          type: 'repo',
          description: 'IGT GPU 测试框架的源码和文档。',
        },
        {
          title: 'AMD GPU Bug Tracker',
          url: 'https://gitlab.freedesktop.org/drm/amd/-/issues',
          type: 'doc',
          description: 'AMD GPU 驱动的官方 Bug 追踪系统，可以查看已知问题和提交新 Bug。',
        },
        {
          title: 'Linux Kernel Selftests',
          url: 'https://docs.kernel.org/dev-tools/kselftest.html',
          type: 'doc',
          description: 'Linux 内核自测框架文档，包含如何编写和运行 DRM 相关的 Selftests。',
        },
        {
          title: 'DRM CI Documentation',
          url: 'https://docs.kernel.org/gpu/automated_testing.html',
          type: 'doc',
          description: 'DRM 子系统的 CI 自动化测试文档，描述了测试管线和回归检测流程。',
        },
        {
          title: 'ftrace Documentation',
          url: 'https://docs.kernel.org/trace/ftrace.html',
          type: 'doc',
          description: '内核 ftrace 追踪框架的官方文档，用于调试测试失败时追踪内核函数调用。',
        },
      ],
    },
    codeReading: [
      {
        title: '运行 IGT amdgpu 测试',
        description: '编译并运行 IGT 测试套件，验证 amdgpu 驱动的基本功能。',
        file: 'terminal',
        language: 'bash',
        code: `# 安装 IGT 依赖
sudo apt install libdrm-dev libkmod-dev libprocps-dev \\
                  libudev-dev libcairo2-dev libpixman-1-dev \\
                  libjson-c-dev

# 克隆 IGT 源码
git clone https://gitlab.freedesktop.org/drm/igt-gpu-tools.git
cd igt-gpu-tools

# 编译
meson setup build
ninja -C build

# 列出所有 amdgpu 相关测试
./build/tests/amdgpu/amdgpu_test --list-subtests

# 运行基本的 amdgpu 测试
sudo ./build/tests/amdgpu/amdgpu_test

# 运行 KMS 测试（测试显示功能）
sudo ./build/tests/kms_atomic --run-subtest atomic-setmode

# 使用 igt_runner 运行完整测试套件（耗时较长）
# sudo ./build/tools/igt_runner -t amdgpu

# 查看测试结果
# 结果：PASS / FAIL / SKIP / CRASH`,
        annotations: [
          'IGT 测试需要 root 权限，因为它直接通过 DRM ioctl 访问 GPU',
          'amdgpu_test 是专门针对 amdgpu 驱动的测试程序，测试 GEM、CS、VRAM 等功能',
          'kms_atomic 测试 KMS Atomic Mode Setting，验证显示功能是否正常',
          'SKIP 结果通常表示测试需要特定硬件功能，当前 GPU 不支持，这是正常的',
          '在提交 amdgpu 补丁前，应确保相关测试全部 PASS',
        ],
      },
      {
        title: 'IGT GEM Buffer Object 测试（C 源码）',
        description: '分析 IGT 框架中 amdgpu GEM BO 创建测试的真实 C 代码结构，理解 IGT 测试的编写模式。',
        file: 'tests/amdgpu/amdgpu_gem.c (IGT)',
        language: 'c',
        code: `/* IGT 测试示例：amdgpu GEM Buffer Object 创建与验证
 * 基于 igt-gpu-tools/tests/amdgpu/ 中的真实测试模式
 * 文件：tests/amdgpu/amdgpu_gem.c
 */

#include "igt.h"
#include "igt_amd.h"
#include <amdgpu.h>
#include <amdgpu_drm.h>

static amdgpu_device_handle device;
static uint32_t major_version, minor_version;

/* igt_fixture: 在所有子测试运行前/后执行 */
igt_main
{
    igt_fixture {
        int fd = drm_open_driver(DRIVER_AMDGPU);
        int r = amdgpu_device_initialize(fd, &major_version,
                                          &minor_version, &device);
        igt_require(r == 0);
        igt_info("AMDGPU version: %u.%u\\n",
                  major_version, minor_version);
    }

    igt_subtest("gem-create-valid") {
        struct amdgpu_bo_alloc_request req = {0};
        amdgpu_bo_handle bo;

        req.alloc_size = 4096;  /* 1 page */
        req.phys_alignment = 4096;
        req.preferred_heap = AMDGPU_GEM_DOMAIN_VRAM;

        /* 分配 BO，断言成功 */
        igt_assert_eq(amdgpu_bo_alloc(device, &req, &bo), 0);

        /* 验证 BO 句柄有效 */
        igt_assert(bo != NULL);

        /* 释放 BO */
        igt_assert_eq(amdgpu_bo_free(bo), 0);
    }

    igt_subtest("gem-create-invalid-size") {
        struct amdgpu_bo_alloc_request req = {0};
        amdgpu_bo_handle bo;

        req.alloc_size = 0;  /* 非法：大小为 0 */
        req.preferred_heap = AMDGPU_GEM_DOMAIN_VRAM;

        /* 应该返回错误 */
        igt_assert_neq(amdgpu_bo_alloc(device, &req, &bo), 0);
    }

    igt_subtest("gem-map-readwrite") {
        struct amdgpu_bo_alloc_request req = {0};
        amdgpu_bo_handle bo;
        void *cpu_ptr;
        uint32_t pattern = 0xDEADBEEF;

        req.alloc_size = 4096;
        req.phys_alignment = 4096;
        req.preferred_heap = AMDGPU_GEM_DOMAIN_GTT;
        req.flags = AMDGPU_GEM_CREATE_CPU_ACCESS_REQUIRED;

        igt_assert_eq(amdgpu_bo_alloc(device, &req, &bo), 0);

        /* CPU 映射 BO */
        igt_assert_eq(amdgpu_bo_cpu_map(bo, &cpu_ptr), 0);
        igt_assert(cpu_ptr != NULL);

        /* 写入测试数据 */
        memset(cpu_ptr, 0, 4096);
        *(uint32_t *)cpu_ptr = pattern;

        /* 读回验证数据一致性 */
        igt_assert_eq(*(uint32_t *)cpu_ptr, pattern);

        amdgpu_bo_cpu_unmap(bo);
        amdgpu_bo_free(bo);
    }

    igt_fixture {
        amdgpu_device_deinitialize(device);
    }
}`,
        annotations: [
          'igt_main 宏替代 main()，自动处理测试初始化、参数解析和结果报告',
          'igt_fixture 块在所有子测试运行前后执行，用于初始化/清理 GPU 设备句柄',
          'igt_subtest 定义独立的子测试，每个可以单独运行（--run-subtest 参数）',
          'igt_require(r == 0) 如果条件不满足则跳过（SKIP）整个测试，而不是标记为 FAIL',
          'igt_assert_eq 断言两个值相等，失败时打印期望值和实际值，并自动收集 GPU 状态',
          'AMDGPU_GEM_DOMAIN_VRAM 和 AMDGPU_GEM_DOMAIN_GTT 分别指定在显存和系统内存中分配',
          'AMDGPU_GEM_CREATE_CPU_ACCESS_REQUIRED 标志确保 BO 可以被 CPU 映射',
          '这种 alloc → map → write → read → verify → free 的模式是 GEM 测试的标准模板',
        ],
      },
      {
        title: '内核自测：DRM Buddy 分配器测试',
        description: '分析内核 DRM Buddy 分配器的 KUnit 单元测试，理解内核态测试的编写方法。',
        file: 'drivers/gpu/drm/tests/drm_buddy_test.c',
        language: 'c',
        code: `/* DRM Buddy Allocator KUnit 测试
 * 文件：drivers/gpu/drm/tests/drm_buddy_test.c
 * Buddy 分配器用于 amdgpu 的 VRAM 管理
 */
#include <kunit/test.h>
#include <drm/drm_buddy.h>

static void drm_test_buddy_alloc_range(struct kunit *test)
{
    struct drm_buddy mm;
    struct drm_buddy_block *block;
    struct list_head allocated;
    u64 size = SZ_4K;      /* 分配 4KB */
    u64 start = SZ_1M;     /* 从 1MB 偏移开始 */
    u64 end = SZ_2M;       /* 到 2MB 偏移结束 */

    INIT_LIST_HEAD(&allocated);

    /* 初始化 Buddy 分配器，管理 256MB 的空间 */
    KUNIT_ASSERT_EQ(test, 0,
        drm_buddy_init(&mm, SZ_256M, PAGE_SIZE));

    /* 在指定范围 [1MB, 2MB) 内分配 4KB */
    KUNIT_ASSERT_EQ(test, 0,
        drm_buddy_alloc_blocks(&mm, start, end,
                                size, PAGE_SIZE,
                                &allocated,
                                DRM_BUDDY_RANGE_ALLOCATION));

    /* 验证分配的块在请求的范围内 */
    block = list_first_entry(&allocated,
                              struct drm_buddy_block, link);
    KUNIT_EXPECT_GE(test,
        drm_buddy_block_offset(block), start);
    KUNIT_EXPECT_LT(test,
        drm_buddy_block_offset(block) + size, end);

    /* 释放并清理 */
    drm_buddy_free_list(&mm, &allocated);
    drm_buddy_fini(&mm);
}

static struct kunit_case drm_buddy_tests[] = {
    KUNIT_CASE(drm_test_buddy_alloc_range),
    /* 更多测试用例... */
    {}
};

static struct kunit_suite drm_buddy_test_suite = {
    .name = "drm_buddy",
    .test_cases = drm_buddy_tests,
};

kunit_test_suite(drm_buddy_test_suite);`,
        annotations: [
          'KUnit 是 Linux 内核的单元测试框架，测试在内核空间运行',
          'KUNIT_ASSERT_EQ 断言失败时立即终止当前测试，KUNIT_EXPECT_EQ 允许继续执行',
          'drm_buddy 是 DRM 的 Buddy 内存分配器，amdgpu 用它管理 VRAM 的物理地址空间',
          'DRM_BUDDY_RANGE_ALLOCATION 允许在指定地址范围内分配，用于 VRAM 的分区管理',
          'kunit_test_suite 宏注册测试套件，内核编译时自动包含；运行：modprobe drm_buddy_test',
          '输出格式是 TAP（Test Anything Protocol），通过 dmesg 查看结果',
        ],
      },
    ],
    miniProject: {
      title: '编写一个 IGT 测试用例',
      description: '为 amdgpu 驱动编写一个简单的 IGT 测试，测试 GEM Buffer Object 的分配和释放。',
      objectives: [
        '理解 IGT 测试框架的结构（igt_main/igt_subtest/igt_fixture）',
        '学会使用 libdrm/amdgpu API 编写测试',
        '掌握 igt_assert/igt_require 等测试宏的使用',
        '理解测试覆盖策略：正面测试 + 负面测试 + 边界条件',
      ],
      steps: [
        '阅读 IGT 文档：https://drm.pages.freedesktop.org/igt-gpu-tools/',
        '参考 tests/amdgpu/ 目录中的现有测试，特别是 amdgpu_bo.c 和 amdgpu_cs.c',
        '编写测试：分配一个 1MB 的 GEM BO，映射到 CPU，写入数据，读回验证',
        '添加负面测试：尝试分配 0 字节、超过 VRAM 大小的 BO，验证错误返回',
        '使用 igt_assert_eq 验证结果，igt_require 跳过不支持的硬件',
        '集成到 IGT 构建系统（修改 tests/amdgpu/meson.build）',
        '提交 PR 到 IGT 仓库（可选，但对 Portfolio 很有价值）',
      ],
      expectedOutput: '一个可以通过 IGT 框架运行的测试用例，包含正面和负面测试，验证 amdgpu GEM BO 的基本分配、映射和数据一致性。',
    },
    interviewQuestions: [
      {
        question: '如何使用 git bisect 定位引入 Bug 的提交？',
        difficulty: 'medium',
        hint: '描述二分查找的过程，以及如何自动化 bisect。',
        answer: 'git bisect 使用二分查找算法在提交历史中定位引入 Bug 的提交。步骤：（1）git bisect start 开始 bisect；（2）git bisect bad 标记当前版本有 Bug；（3）git bisect good <commit> 标记一个已知正常的提交；（4）git 自动 checkout 中间的提交，测试是否有 Bug；（5）根据测试结果执行 git bisect good 或 git bisect bad；（6）重复步骤 4-5，直到 git 找到第一个 bad 提交；（7）git bisect reset 结束 bisect。自动化：可以提供一个测试脚本给 git bisect run：git bisect run ./test.sh，脚本返回 0 表示 good，非 0 表示 bad，git 会自动完成整个 bisect 过程。对于内核 Bug，通常需要在每个 bisect 步骤重新编译内核，可能需要数小时。',
      },
      {
        question: '如何为一个新的 amdgpu 功能编写 IGT 测试？请描述完整的流程。',
        difficulty: 'hard',
        hint: '从测试设计、IGT 框架结构、amdgpu 特定 API 的使用角度回答。',
        answer: '编写 IGT 测试的完整流程：（1）测试设计：分析新功能的接口（ioctl、sysfs、debugfs），确定测试范围——正面测试（正常功能）、负面测试（非法参数）、边界条件、并发测试；（2）创建测试文件：在 tests/amdgpu/ 下创建新 .c 文件，使用 igt_main 宏定义入口；（3）初始化：在 igt_fixture 中打开 DRM 设备（drm_open_driver(DRIVER_AMDGPU)），初始化 amdgpu 设备句柄（amdgpu_device_initialize）；（4）使用 igt_require 检查硬件是否支持该功能（如检查 IP 版本：amdgpu_query_info → family_id/chip_external_rev）；（5）编写子测试：每个 igt_subtest 测试一个独立的场景，使用 igt_assert 系列宏验证；（6）集成：修改 tests/amdgpu/meson.build 添加新测试，运行 ninja -C build 编译；（7）验证：在至少两代 GPU 上运行测试（如 RDNA2 和 RDNA3），确保 PASS 或合理 SKIP。',
      },
      {
        question: 'IGT 测试和内核 Selftests/KUnit 测试有什么区别？各自适用于什么场景？',
        difficulty: 'medium',
        hint: '从运行环境、测试对象、依赖关系和覆盖范围的角度比较。',
        answer: 'IGT 测试：运行在用户空间，通过 libdrm/ioctl 与内核交互；测试整个驱动栈的端到端功能（从用户态 API 到硬件行为）；需要真实 GPU 硬件；依赖 IGT 框架和 libdrm；适用于功能测试、回归测试、性能测试。Kernel Selftests：运行在用户空间（也可内核态），使用最小化依赖；测试内核子系统的特定行为；适用于快速冒烟测试。KUnit：纯内核态运行，不需要用户空间程序；测试内核内部的数据结构和函数（如 drm_buddy 分配器）；不需要真实硬件（可以在 QEMU/UML 中运行）；适用于单元测试和 TDD（测试驱动开发）。选择原则：新增驱动功能 → IGT（端到端验证）；新增内核数据结构 → KUnit（单元测试）；CI 快速检查 → Selftests（冒烟测试）。最佳实践是三层测试结合使用。',
      },
      {
        question: '描述 GPU 驱动 CI 管线的主要阶段，以及如何处理 CI 中的 flaky test（不稳定测试）。',
        difficulty: 'hard',
        hint: '从 CI 架构、测试分类、flaky test 的识别和处理策略角度回答。',
        answer: 'CI 管线阶段：（1）Build Stage：在多个架构和配置上编译内核，检查编译警告/错误；（2）Static Analysis：sparse 类型检查、smatch bug 模式检测、checkpatch 代码风格；（3）Hardware Testing：在真实 GPU 上运行 IGT 测试套件，覆盖多代硬件；（4）Regression Analysis：与 baseline 对比，标记新增 FAIL 为回归。Flaky test 处理：（1）识别：统计测试在最近 N 次运行中的 PASS/FAIL 比例，PASS 率低于 95% 的为 flaky；（2）分类：硬件不稳定（如 GPU 温度导致的偶发 hang）→ 增加重试次数（igt_runner --retries）；时序敏感（如 VBlank 测试的竞态条件）→ 增加超时或使用 igt_wait_for_vblank()；资源竞争（如并发测试争用 GPU）→ 添加互斥锁或串行化执行；（3）策略：标记为 known-flaky（不阻塞合并），创建 issue 追踪修复；严重 flaky 则暂时 SKIP 并在下个 release cycle 修复。AMD CI 使用 expectation file（.expected-failures）列出已知失败，将其与新引入的回归区分。',
      },
      {
        question: '如何使用 ftrace 调试一个 IGT 测试失败？请给出具体步骤。',
        difficulty: 'hard',
        hint: '从 ftrace 配置、函数追踪、事件追踪和日志分析的角度回答。',
        answer: 'ftrace 调试步骤：（1）启用 ftrace：mount -t debugfs none /sys/kernel/debug（如果未挂载）；（2）选择追踪器：echo function > /sys/kernel/debug/tracing/current_tracer；（3）设置过滤器：echo "amdgpu_*" > set_ftrace_filter（只追踪 amdgpu 函数），或 echo "drm_ioctl" > set_ftrace_filter（追踪所有 DRM ioctl）；（4）启用事件追踪：echo 1 > events/drm/drm_vblank_event/enable（KMS 测试调试），echo 1 > events/amdgpu/amdgpu_cs_ioctl/enable（命令提交调试）；（5）清除旧 trace：echo > trace；（6）启动追踪：echo 1 > tracing_on；（7）运行失败的测试：sudo IGT_TEST=kms_atomic ./build/tests/kms_atomic；（8）停止并收集：echo 0 > tracing_on && cat trace > /tmp/debug.log；（9）分析日志：查找函数调用序列中的异常（如函数返回错误码 -EINVAL、调用链断裂、死锁模式）；（10）进阶：使用 trace-cmd record -e amdgpu -p function_graph 记录完整的函数调用图（包含子函数和耗时），trace-cmd report 输出可读结果。这种方法比 printk 调试高效得多，因为不需要重新编译内核。',
      },
    ],
  },
  {
    id: 'career',
    number: '11',
    title: '社区贡献与职业发展',
    titleEn: 'Contribution & Career',
    icon: '🎯',
    description: '将所学转化为职业优势。学习如何向 Linux 内核提交补丁，构建你的 Portfolio，并准备 AMD 面试。',
    estimatedHours: 30,
    difficulty: 'intermediate',
    subModules: [
      { id: 'career-patch', title: '11.1 内核补丁实战', titleEn: 'Kernel Patch Workflow' },
      { id: 'career-portfolio', title: '11.2 构建你的作品集', titleEn: 'Building Your Portfolio' },
      { id: 'career-interview', title: '11.3 AMD 面试准备', titleEn: 'AMD Interview Prep' },
    ],
    theory: {
      overview: '这是整个学习路径的终点，也是你职业生涯的起点。提交一个被接受的内核补丁，是证明你具备内核开发能力的最有力证明。本模块将指导你完成从发现 Bug 到补丁被合并的完整流程，并帮助你将这些经历转化为 AMD 面试的优势。',
      sections: [
        {
          title: '内核补丁工作流',
          content: '向 Linux 内核提交补丁的完整流程：（1）找到一个值得修复的问题（Bug、代码清理、文档改进）；（2）在本地修复并测试；（3）使用 git format-patch 生成补丁文件；（4）使用 scripts/checkpatch.pl 检查代码风格；（5）使用 scripts/get_maintainer.pl 找到负责该文件的维护者和邮件列表；（6）使用 git send-email 发送补丁到对应的邮件列表（amdgpu 补丁发到 amd-gfx@lists.freedesktop.org）；（7）回应维护者的 Review 意见，修改后重新发送（v2, v3...）；（8）补丁被接受后，会先进入 drm-next 分支，最终合并进 Linux 主线。',
          diagram: {
            type: 'ascii',
            content: `
  内核补丁提交流程

  发现问题
       │
       ▼
  本地修复 & 测试
  (make, insmod, IGT 测试)
       │
       ▼
  git format-patch HEAD~1
  (生成 0001-fix-xxx.patch)
       │
       ▼
  scripts/checkpatch.pl 0001-fix-xxx.patch
  (检查代码风格，必须 0 error)
       │
       ▼
  git send-email 0001-fix-xxx.patch
  (发送到 amd-gfx 邮件列表)
       │
       ▼
  等待 Review（1-2 周）
       │
  ┌────┴────┐
  │         │
  ▼         ▼
需要修改   Reviewed-by
  │         │
  ▼         ▼
发送 v2   等待合并
  │         │
  └────┬────┘
       ▼
  补丁进入 drm-next
       │
       ▼
  合并进 Linux 主线 🎉`,
            caption: '内核补丁从提交到合并的完整流程。第一个补丁通常需要多轮 Review，耐心和对 Review 意见的认真回应是关键。',
          },
        },
        {
          title: '如何写好 Commit Message',
          content: '内核补丁的 Commit Message 格式非常重要。标准格式：第一行是主题（Subject），格式为 "subsystem: short description"，如 "drm/amdgpu: fix memory leak in amdgpu_gem_object_create"；空一行；然后是详细描述，解释为什么需要这个修改（What & Why），而不仅仅是 How；最后是 Signed-off-by 行（必须有）。好的 Commit Message 示例：drm/amdgpu: fix null pointer dereference in amdgpu_cs_ioctl。When amdgpu_cs_ioctl is called with an invalid context handle, the function may dereference a null pointer before checking the return value of amdgpu_ctx_get(). Add a null check to fix this issue. Fixes: abc123 ("drm/amdgpu: add context support") Signed-off-by: Your Name <your@email.com>',
        },
        {
          title: '构建你的 AMD 工程师 Portfolio',
          content: '你的 Portfolio 是进入 AMD 的关键。理想的 Portfolio 应该包含：（1）GitHub 仓库：包含你的学习笔记、代码实验、分析报告；（2）内核补丁：即使是小的 Bug 修复或文档改进，也证明你了解内核开发流程；（3）技术博客：记录你分析 amdgpu 代码、调试问题的过程；（4）这个学习平台本身：展示你的系统性学习能力和技术写作能力。在简历中，可以这样描述："Designed and built AMD GPU Driver Learning Platform, a comprehensive self-study resource covering AMDGPU internals, ROCm, LLVM toolchain, and kernel patch workflow."',
        },
      ],
      keyBooks: [
        {
          title: 'Linux Kernel Development Process',
          author: 'Jonathan Corbet (LWN.net)',
          relevance: '内核开发流程的权威指南，包含补丁提交、Review 流程和社区规范。',
          url: 'https://docs.kernel.org/process/development-process.html',
        },
      ],
      onlineResources: [
        {
          title: 'How to submit patches to the Linux kernel',
          url: 'https://docs.kernel.org/process/submitting-patches.html',
          type: 'doc',
          description: 'Linux 内核官方补丁提交指南，必读。',
        },
        {
          title: 'AMD GPU Driver Mailing List (amd-gfx)',
          url: 'https://lists.freedesktop.org/mailman/listinfo/amd-gfx',
          type: 'doc',
          description: 'amdgpu 驱动的邮件列表，订阅后可以看到所有补丁和讨论。',
        },
        {
          title: 'AMD Careers',
          url: 'https://careers.amd.com',
          type: 'doc',
          description: 'AMD 官方招聘页面，搜索 "Linux Driver" 或 "GPU Driver" 查看相关职位。',
        },
      ],
    },
    codeReading: [
      {
        title: '一个真实的 amdgpu 补丁示例',
        description: '分析一个真实的 amdgpu 驱动 Bug 修复补丁，理解补丁的结构和 Commit Message 规范。',
        file: 'drm/amdgpu: fix error path memory leak',
        language: 'c',
        code: `/* 真实补丁示例：修复 amdgpu_gem_object_create 的错误路径内存泄漏
 * 来源：amd-gfx 邮件列表的典型 Bug 修复模式
 *
 * Commit Message 格式：
 * Subject: drm/amdgpu: fix memory leak in error path of gem_create
 *
 * When amdgpu_bo_create() fails after successfully allocating
 * the page array, the pages are not freed in the error path.
 * Add the missing cleanup to prevent memory leak.
 *
 * Fixes: abc123def456 ("drm/amdgpu: add page array allocation")
 * Signed-off-by: Your Name <your@email.com>
 */

/* 修复前（Bug 版本） */
int amdgpu_gem_object_create(struct amdgpu_device *adev,
                              unsigned long size, ...)
{
    struct amdgpu_bo *bo;
    struct page **pages;
    int r;

    pages = kvmalloc_array(npages, sizeof(*pages), GFP_KERNEL);
    if (!pages)
        return -ENOMEM;

    r = amdgpu_bo_create(adev, &bp, &bo);
    if (r)
        return r;  /* BUG: pages 泄漏! */

    return 0;
}

/* 修复后（正确版本） */
int amdgpu_gem_object_create(struct amdgpu_device *adev,
                              unsigned long size, ...)
{
    struct amdgpu_bo *bo;
    struct page **pages;
    int r;

    pages = kvmalloc_array(npages, sizeof(*pages), GFP_KERNEL);
    if (!pages)
        return -ENOMEM;

    r = amdgpu_bo_create(adev, &bp, &bo);
    if (r)
        goto err_free_pages;  /* 修复：跳到清理代码 */

    return 0;

err_free_pages:
    kvfree(pages);  /* 释放已分配的 pages */
    return r;
}`,
        annotations: [
          '这是内核中最常见的 Bug 类型之一：错误路径（error path）中遗漏资源释放',
          'Fixes: 标签引用引入 Bug 的原始提交，帮助维护者判断补丁应该被 backport 到哪些稳定分支',
          'Signed-off-by 是必须的法律声明，表示你有权提交这段代码并同意 GPL 许可',
          'Subject 格式严格遵循 "subsystem: short description" — drm/amdgpu 是子系统前缀',
          '使用 goto 进行错误清理是内核编码规范推荐的标准模式',
          '这种级别的 Bug 修复是新手第一个补丁的理想选择',
        ],
      },
      {
        title: '生成你的第一个内核补丁',
        description: '完整演示如何找到一个简单的问题，修复它，并生成符合内核规范的补丁。',
        file: 'terminal',
        language: 'bash',
        code: `# 1. 克隆 Linux 内核源码（使用 AMD 的 drm-next 分支）
git clone https://gitlab.freedesktop.org/agd5f/linux.git \\
          --branch amd-staging-drm-next \\
          --depth 1

cd linux

# 2. 创建你的工作分支
git checkout -b fix/amdgpu-doc-typo

# 3. 找到一个简单的问题（例如：文档中的拼写错误）
grep -r "typo" drivers/gpu/drm/amd/ --include="*.c" | head -5

# 4. 修复问题
# vim drivers/gpu/drm/amd/amdgpu/amdgpu_device.c

# 5. 提交修改
git add -p  # 交互式选择要提交的修改
git commit -s  # -s 自动添加 Signed-off-by

# Commit Message 格式：
# drm/amdgpu: fix typo in amdgpu_device_init comment
#
# "initializtion" should be "initialization" in the
# comment describing the device initialization flow.
#
# Signed-off-by: Your Name <your@email.com>

# 6. 检查代码风格
./scripts/checkpatch.pl HEAD~1..HEAD
# 必须输出: total: 0 errors, 0 warnings

# 7. 找到维护者
./scripts/get_maintainer.pl drivers/gpu/drm/amd/amdgpu/amdgpu_device.c

# 8. 生成补丁文件
git format-patch HEAD~1 -o /tmp/patches/

# 9. 发送补丁（需要配置 git send-email）
# git send-email --to=amd-gfx@lists.freedesktop.org \\
#               --cc=<maintainer@email.com> \\
#               /tmp/patches/0001-*.patch`,
        annotations: [
          'AMD 的 drm-next 分支是 amdgpu 补丁的主要开发分支，比 Linux 主线更新',
          'git add -p 允许你交互式地选择要提交的代码块，避免提交无关修改',
          'git commit -s 自动在 Commit Message 末尾添加 Signed-off-by，这是内核贡献的必要声明',
          'checkpatch.pl 是内核代码风格检查工具，0 errors 是提交补丁的最低要求',
          'get_maintainer.pl 根据文件路径找到对应的维护者，补丁必须抄送给他们',
          '第一个补丁建议选择简单的文档修复或代码清理，降低被拒绝的风险',
        ],
      },
    ],
    miniProject: {
      title: '提交你的第一个内核补丁',
      description: '在 amdgpu 驱动中找到一个真实的问题（文档错误、代码清理、简单 Bug），并提交补丁到 amd-gfx 邮件列表。',
      objectives: [
        '完成完整的内核补丁提交流程',
        '获得来自 AMD 工程师的 Code Review 反馈',
        '在 Linux 内核提交历史中留下你的名字',
      ],
      steps: [
        '订阅 amd-gfx 邮件列表，阅读最近的补丁和 Review 讨论',
        '在 amdgpu 源码中寻找可以改进的地方（文档、注释、简单 Bug）',
        '按照上面的流程编写、检查并发送补丁',
        '认真回应 Review 意见，发送修订版（v2）',
        '将整个过程记录在你的 GitHub 仓库中',
      ],
      expectedOutput: '一个已发送到 amd-gfx 邮件列表的补丁，以及来自 AMD 工程师的 Review 反馈。即使补丁最终没有被接受，这个经历本身就是宝贵的 Portfolio 素材。',
    },
    interviewQuestions: [
      {
        question: '请描述你提交内核补丁的经历，包括你遇到的挑战和如何解决的。',
        difficulty: 'medium',
        hint: '这是一个行为面试题，重点展示你的主动性、学习能力和对社区规范的理解。',
        answer: '回答框架（STAR 方法）：Situation（情境）：描述你在学习 amdgpu 驱动时发现的具体问题；Task（任务）：你决定修复这个问题并提交补丁；Action（行动）：描述你如何分析问题、编写修复、运行测试、检查代码风格、发送补丁，以及如何回应 Review 意见；Result（结果）：补丁被接受/修改后接受/仍在 Review 中，以及你从这个过程中学到了什么。关键点：展示你对内核开发流程的理解（checkpatch、get_maintainer、send-email）；展示你对 Review 反馈的积极态度；如果补丁被拒绝，展示你从中学到的经验。',
      },
      {
        question: '如果你发现 amdgpu 驱动中有一个内存泄漏，你会如何定位和修复它？',
        difficulty: 'hard',
        hint: '从检测工具（kmemleak）、定位方法（代码审查、ftrace）到修复和测试的完整流程。',
        answer: '定位内存泄漏的完整流程：（1）检测：使用 CONFIG_DEBUG_KMEMLEAK 启用内核内存泄漏检测器，运行测试后 cat /sys/kernel/debug/kmemleak 查看泄漏报告，报告会显示泄漏的内存地址和分配时的调用栈；（2）分析调用栈：根据 kmemleak 报告的调用栈，找到分配内存的代码位置（如 kmalloc、kzalloc、vmalloc）；（3）追踪释放路径：检查所有可能的代码路径，找到哪条错误路径没有调用对应的 kfree/vfree；（4）常见原因：错误处理路径（goto err_xxx）中忘记释放；引用计数（refcount）不平衡；（5）修复：在遗漏的路径上添加释放调用，确保所有错误路径都正确清理；（6）测试：重新运行 kmemleak 确认泄漏消失，运行 IGT 测试确认没有引入新问题；（7）提交补丁：按照标准流程提交，Commit Message 中引用 Fixes: 标签指向引入 Bug 的提交。',
      },
      {
        question: '你如何在 amdgpu 驱动代码中找到一个适合新手修复的 Bug？',
        difficulty: 'easy',
        hint: '从 TODO/FIXME 注释、静态分析工具、编码风格修复的角度回答。',
        answer: '寻找新手友好 Bug 的方法：（1）搜索 TODO/FIXME 注释：grep -rn "TODO\\|FIXME\\|HACK\\|XXX" drivers/gpu/drm/amd/，找到开发者标记为需要修复的地方。（2）运行 coccinelle 静态分析：make coccicheck MODE=report M=drivers/gpu/drm/amd/，自动检测代码模式问题（如缺失错误检查、API 误用）。（3）检查 checkpatch 警告：scripts/checkpatch.pl -f drivers/gpu/drm/amd/amdgpu/*.c，找到代码风格问题。（4）查看 GitLab Issues：https://gitlab.freedesktop.org/drm/amd/-/issues，筛选标记为 "good first issue" 的 Issue。（5）代码审查时发现的简单问题：定期阅读 amd-gfx 邮件列表的补丁，有时 Review 评论中会提到"顺便，这里还有一个类似的问题"。（6）编译器警告：用 W=1 make -C drivers/gpu/drm/amd/，修复编译器警告（未使用变量、隐式转换等）。推荐起点：文档拼写修复 → 代码风格修复 → 编译器警告修复 → 简单 Bug 修复。',
      },
      {
        question: '描述 AMD Markham 团队的组织结构，以及不同团队分别负责驱动栈的哪些部分。',
        difficulty: 'medium',
        hint: '从 Display、3D、Compute、Power、Toolchain 等团队的角度描述。',
        answer: 'AMD Markham（加拿大安大略省）是 AMD GPU 软件的主要开发中心。主要团队：（1）Display 团队：负责 DC（Display Core）模块，包括 KMS、HDMI/DP 输出、DCN 显示引擎、AMD FreeSync 技术。代码在 drivers/gpu/drm/amd/display/。（2）3D/Graphics 团队：负责 Mesa radeonsi（OpenGL）和 radv（Vulkan）用户态驱动，以及内核中的 GFX IP 模块。（3）Compute/ROCm 团队：负责 KFD 驱动、HIP 运行时、ROCm 工具链。在 Markham 和上海都有团队。（4）Power Management 团队：负责 SMU（System Management Unit）驱动接口、GPU 频率调节、ASPM 电源状态管理。（5）Toolchain 团队：负责 LLVM AMDGPU 后端、shader 编译器、Debug 工具（umr、rocgdb）。面试时，了解你申请的团队负责哪部分代码，并展示你对那部分代码的学习经历，会非常有说服力。',
      },
      {
        question: 'Linux 内核社区的 Review 流程是什么样的？如果 Reviewer 要求你修改补丁，你应该怎么做？',
        difficulty: 'medium',
        hint: '从 Review 的类型（ACK/NAK/Review）、v2 补丁的格式、回复礼仪角度回答。',
        answer: 'Review 流程：补丁发送到 amd-gfx 邮件列表后，维护者和社区成员会进行 Review。Review 类型：（1）Reviewed-by：审阅通过，同意合并；（2）Acked-by：维护者同意方向，但未详细审查代码；（3）Nacked-by：明确反对合并，需要根本性修改；（4）Review 评论：提出具体的代码问题，需要修改后重新发送。处理 Review 反馈：（1）回复感谢，逐条回应每个评论，说明你的修改方案；（2）修改代码后，使用 git format-patch 生成新补丁（v2）；（3）在 v2 补丁的 cover letter 或 commit message 下方添加 changelog（--- 后面），说明相比 v1 的修改内容；（4）使用 git send-email --in-reply-to=<v1的message-id> 将 v2 作为 v1 的回复发送，保持邮件线程连贯。关键原则：保持礼貌和专业，每个 Review 评论都值得认真对待；如果不同意某个建议，礼貌地解释你的理由而不是沉默忽略。',
      },
    ],
  },
];

export const curriculum = curriculumZh;

export const totalHours = curriculum.reduce((sum, m) => sum + m.estimatedHours, 0);

export const difficultyColors = {
  beginner: 'text-green-400',
  intermediate: 'text-blue-400',
  advanced: 'text-orange-400',
  expert: 'text-red-400',
};

export const difficultyLabels = {
  beginner: '入门',
  intermediate: '进阶',
  advanced: '高级',
  expert: '专家',
};
