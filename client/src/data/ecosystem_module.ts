// Module 0.5 - AMD Ecosystem Overview
// This file contains the complete data for the AMD Ecosystem module
// It will be imported and inserted into curriculum.ts

import type { Module } from './curriculum';

export const ecosystemModule: Module = {
  id: 'ecosystem',
  number: '0.5',
  title: 'AMD 生态系统概览',
  titleEn: 'AMD Ecosystem Overview',
  icon: 'Globe',
  description: '在深入驱动代码之前，先建立完整的"地图感"：AMD 产品线、GPU 命名规则、架构历史、驱动技术栈，以及 AMD vs NVIDIA 的竞争格局。',
  estimatedHours: 8,
  difficulty: 'beginner',
  subModules: [
    { id: 'eco-company', title: 'AMD 公司与业务结构', titleEn: 'AMD Company Structure' },
    { id: 'eco-gpu-lineup', title: 'GPU 产品线', titleEn: 'GPU Product Lines' },
    { id: 'eco-naming', title: 'GPU/CPU 命名规则', titleEn: 'Naming Conventions' },
    { id: 'eco-arch-history', title: 'GPU 架构历史', titleEn: 'GPU Architecture History' },
    { id: 'eco-driver-stack', title: '驱动技术栈全景', titleEn: 'Driver Stack Overview' },
    { id: 'eco-vs-nvidia', title: 'AMD vs NVIDIA vs Intel', titleEn: 'Competitive Landscape' },
  ],
  theory: {
    overview: '很多人拿到 AMD GPU 后直接跳进内核代码，结果看到 gfx1102、RDNA3、KFD、DC 这些词时完全迷失。这个模块的目标是给你一张完整的地图：以 RX 7600 XT（Navi33 / gfx1102）为贯穿示例，帮你理解任意 AMD GPU 在产品线中的位置、驱动代码在整个软件栈中的位置，以及为什么 AMD 的开源策略对学习驱动开发是一个巨大的优势。',
    sections: [
      {
        title: 'AMD 公司整体结构',
        content: 'AMD（Advanced Micro Devices）是一家专注于半导体的公司，主要业务分为四大块：CPU（Ryzen 消费级 / EPYC 服务器级）、GPU（Radeon 消费级 / Instinct 数据中心级）、APU（CPU+GPU 集成，如 Ryzen 7000 系列中的 Radeon 集显）、以及 2022 年收购的 Xilinx FPGA 业务。对于驱动开发者来说，最相关的是 GPU 部门，特别是 Radeon 和 Instinct 产品线。AMD Markham（加拿大安大略省）是 AMD 最重要的 GPU 软件开发中心，负责 Linux 内核 amdgpu 驱动、ROCm 计算框架和 Mesa 用户态驱动的开发。',
        diagram: {
          type: 'ascii',
          content: `AMD 公司业务结构

┌─────────────────────────────────────────────────────────┐
│                    AMD Inc.                              │
├──────────────┬──────────────┬──────────────┬────────────┤
│     CPU      │     GPU      │     APU      │    FPGA    │
│              │              │              │            │
│ Ryzen        │ Radeon RX    │ Ryzen 集显   │ Xilinx     │
│ (消费级)     │ (消费级)     │ (CPU+GPU)    │ (2022收购) │
│              │              │              │            │
│ EPYC         │ Instinct MI  │ EPYC 集成    │            │
│ (服务器级)   │ (数据中心)   │              │            │
└──────────────┴──────────────┴──────────────┴────────────┘
                      │
              驱动开发重点
                      │
         ┌────────────┴────────────┐
         │                         │
   Radeon RX (amdgpu)        Instinct MI (ROCm)
   消费级 GPU 驱动             AI/HPC 计算平台`,
          caption: 'AMD 业务结构。驱动开发主要集中在 GPU 部门，Radeon RX 系列对应 amdgpu 内核驱动，Instinct 系列对应 ROCm 计算框架。',
        },
      },
      {
        title: 'AMD GPU 产品线详解',
        content: 'AMD GPU 产品线分为三个层次：消费级（Radeon RX）、专业级（Radeon Pro）和数据中心级（Instinct MI）。本教程以 RX 7600 XT（消费级，RDNA3，Navi33，gfx1102）为贯穿示例，但所有概念对其他 AMD GPU 同样适用。消费级 GPU 主要用于游戏和创意工作，驱动开发重点是 OpenGL/Vulkan 渲染性能和显示输出。Instinct MI 系列（如 MI300X）主要用于 AI 训练和 HPC，是 ROCm 平台的主要支持目标，与 NVIDIA A100/H100 直接竞争。了解这个区别很重要：ROCm 的很多功能优先在 Instinct 上支持，消费级 GPU 的 ROCm 支持相对有限。',
        diagram: {
          type: 'ascii',
          content: `AMD GPU 产品线层次

性能/价格
    ↑
    │  ┌──────────────────────────────────────────┐
    │  │  Instinct MI 系列（数据中心）             │
    │  │  MI300X, MI250, MI100                    │
    │  │  → AI 训练 / HPC / 科学计算              │
    │  │  → ROCm 主要支持目标                     │
    │  └──────────────────────────────────────────┘
    │  ┌──────────────────────────────────────────┐
    │  │  Radeon Pro 系列（专业工作站）            │
    │  │  W7900, W7800                            │
    │  │  → CAD / 影视 / 科学可视化               │
    │  └──────────────────────────────────────────┘
    │  ┌──────────────────────────────────────────┐
    │  │  Radeon RX 系列（消费级）                 │
    │  │  RX 7900 XTX > RX 7800 XT > RX 7600 XT  │
    │  │  → 游戏 / 创意工作                       │
    │  │  ← 你的 RX 7600 XT 在这里               │
    │  └──────────────────────────────────────────┘
    └──────────────────────────────────────────────→ 时间`,
          caption: 'AMD GPU 三层产品线。消费级 RX（如 RX 7600 XT）与 Instinct MI300 同代 RDNA3 架构，共享同一套 amdgpu 内核代码。',
        },
      },
      {
        title: 'GPU 命名规则完全解析',
        content: '理解 AMD GPU 的命名规则，可以让你在看到任何型号时立刻知道它的架构代数、性能等级和特殊版本。以 RX 7600 XT 为例解析规则（其他 RX 系列 GPU 同样适用）：RX = Radeon eXperience（消费级标识）；7 = 第七代（对应 RDNA3 架构）；6 = 性能等级（6=中端，9=旗舰）；00 = 具体型号；XT = 增强版（更高频率或更多计算单元）。在内核代码中，GPU 通过 PCI Device ID 识别，RX 7600 XT 的 Device ID 是 0x7480，芯片代号是 Navi33，IP 版本是 gfx1102（GFX IP 11.0.2）。',
        diagram: {
          type: 'ascii',
          content: `AMD GPU 命名规则解析

        RX  7  6  00  XT
        │   │  │   │   └── 版本后缀
        │   │  │   │        XT  = 增强版（更高频率/CU）
        │   │  │   │        XTX = 旗舰增强版
        │   │  │   │        GRE = 特别版（区域限定）
        │   │  │   │        (无) = 标准版
        │   │  │   └────── 具体型号（00=整数档位）
        │   │  └────────── 性能等级
        │   │               9 = 旗舰（RX 7900 XTX）
        │   │               8 = 高端（RX 7800 XT）
        │   │               7 = 中高端（RX 7700 XT）
        │   │               6 = 中端（RX 7600 XT）← 你的卡
        │   │               5 = 入门（RX 7500 XT）
        │   └────────────── 架构代数
        │                    7 = RDNA3 (2022)
        │                    6 = RDNA2 (2020)
        │                    5 = RDNA1 (2019)
        └────────────────── 产品线
                             RX = Radeon eXperience（消费级）
                             Pro = 专业级

对应关系：
  RX 7600 XT → Navi33 → gfx1102 → RDNA3
  RX 7900 XTX → Navi31 → gfx1100 → RDNA3
  RX 6800 XT → Navi21 → gfx1030 → RDNA2`,
          caption: 'AMD GPU 命名规则。理解命名后，你就能从型号推断出内核代码中对应的 IP 版本（gfxXXXX），这在阅读驱动代码时非常有用。',
        },
      },
      {
        title: 'AMD GPU 架构历史时间线',
        content: 'AMD GPU 架构经历了几次重大转变。2012-2019 年的 GCN（Graphics Core Next）架构奠定了现代 AMD GPU 的基础，amdgpu 驱动中大量的 legacy code 都来自这个时代。2019 年的 RDNA 架构是一次彻底重新设计，大幅提升了每瓦性能。RDNA2（2020）引入了光线追踪硬件支持。RDNA3（2022）带来新的前端/指令与媒体能力；其中部分型号采用 Chiplet（如 Navi31/32），你的 RX 7600 XT（Navi33）是单晶粒实现。RDNA4（2025）进一步强化了光线追踪和 AI 加速能力。在内核代码中，每个架构对应一套 IP 实现文件，如 gfx_v11_0.c（RDNA3）、gfx_v10_3_0.c（RDNA2）等。',
        diagram: {
          type: 'ascii',
          content: `AMD GPU 架构历史时间线

2012  ──┬── GCN 1.0 (Southern Islands, SI)
        │   Radeon HD 7000 系列 / gfx6
        │   首个统一着色器架构
        │
2013  ──┼── GCN 2.0 (Sea Islands, CI)
        │   Radeon R9 290X / gfx7
        │
2015  ──┼── GCN 3.0 (Volcanic Islands, VI)
        │   Radeon R9 Fury X / gfx8
        │
2017  ──┼── GCN 5.0 / Vega (gfx9)
        │   Radeon RX Vega 64
        │   首个 HBM2 显存
        │
2019  ──┼── RDNA 1.0 (Navi, gfx10)
        │   RX 5700 XT
        │   全新架构，性能/瓦大幅提升
        │
2020  ──┼── RDNA 2.0 (gfx103x)
        │   RX 6800 XT / 6900 XT
        │   硬件光线追踪 + Infinity Cache
        │
2022  ──┼── RDNA 3.0 (gfx110x) ← 你的 RX 7600 XT (gfx1102)
        │   家族内并存：Navi31/32 为 Chiplet，Navi33 为单晶粒
        │   AI 加速器 + 硬件 AV1 编码
        │
2025  ──┴── RDNA 4.0 (gfx120x)
            RX 9070 XT
            增强光追 + AI 性能大幅提升

注：GCN 代码在 amdgpu 中仍然存在（legacy support）
    理解 GCN 有助于理解驱动的历史设计决策`,
          caption: 'AMD GPU 架构演进时间线。每个架构在内核代码中对应不同的 gfxXXXX IP 版本。RX 7600 XT 使用 gfx1102（RDNA3），本教程以此为示例，所有概念对 gfx9/gfx10/gfx12 同样成立。',
        },
      },
      {
        title: 'AMD Linux 驱动技术栈全景',
        content: '理解整个软件栈是学习驱动开发的关键。从用户应用程序到 GPU 硬件，中间经过多个软件层次。用户空间的图形应用（如游戏）通过 OpenGL/Vulkan API 调用 Mesa 3D 库，Mesa 通过 DRI（Direct Rendering Infrastructure）接口与内核通信。内核空间的 DRM（Direct Rendering Manager）子系统提供通用的 GPU 管理框架，amdgpu 驱动是 DRM 的一个具体实现。对于 GPU 计算（ROCm），用户程序通过 HIP API 调用 ROCr 运行时，ROCr 通过 /dev/kfd 设备节点与内核的 KFD（Kernel Fusion Driver）通信。KFD 是 amdgpu 驱动的一部分，专门为计算工作负载提供服务。',
        diagram: {
          type: 'ascii',
          content: `AMD Linux 驱动技术栈全景

┌─────────────────────────────────────────────────────────────┐
│                    用户空间 (User Space)                      │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │  游戏/应用   │  │  AI 训练     │  │  视频编解码      │  │
│  │  OpenGL/     │  │  PyTorch/    │  │  FFmpeg/         │  │
│  │  Vulkan      │  │  TensorFlow  │  │  VA-API          │  │
│  └──────┬───────┘  └──────┬───────┘  └────────┬─────────┘  │
│         │                  │                    │            │
│  ┌──────▼───────┐  ┌──────▼───────┐  ┌────────▼─────────┐  │
│  │  Mesa 3D     │  │  ROCm HIP    │  │  Mesa VA/VDPAU   │  │
│  │  radeonsi/   │  │  + ROCr      │  │                  │  │
│  │  radv        │  │  运行时      │  │                  │  │
│  └──────┬───────┘  └──────┬───────┘  └────────┬─────────┘  │
│         └──────────────────┴────────────────────┘            │
│                            │ libdrm / libkfd                 │
└────────────────────────────┼────────────────────────────────┘
                             │ 系统调用 (ioctl)
┌────────────────────────────┼────────────────────────────────┐
│                    内核空间 (Kernel Space)                    │
│                            │                                 │
│  ┌─────────────────────────▼──────────────────────────────┐  │
│  │                  DRM 子系统                              │  │
│  │  (drivers/gpu/drm/)                                     │  │
│  └─────────────────────────┬──────────────────────────────┘  │
│                            │                                 │
│  ┌─────────────────────────▼──────────────────────────────┐  │
│  │              amdgpu 驱动 (drivers/gpu/drm/amd/)         │  │
│  │                                                          │  │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────────┐  │  │
│  │  │  GFX IP │ │ SDMA IP │ │   DC    │ │  KFD        │  │  │
│  │  │(gfx1102)│ │(DMA引擎)│ │(显示核心)│ │(计算接口)   │  │  │
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────────┘  │  │
│  └─────────────────────────┬──────────────────────────────┘  │
└────────────────────────────┼────────────────────────────────┘
                             │ PCIe / MMIO
┌────────────────────────────┼────────────────────────────────┐
│                    硬件 (Hardware)                            │
│                    RX 7600 XT (Navi33 / gfx1102)             │
└──────────────────────────────────────────────────────────────┘`,
          caption: 'AMD Linux 驱动完整技术栈。这张图是整个学习路径的地图——每个模块对应栈中的一层。图中以 RX 7600 XT 为示例，任意 AMD GPU 均可替换到最底层。',
        },
      },
      {
        title: 'AMD vs NVIDIA vs Intel：竞争格局',
        content: 'AMD 在 GPU 领域的最大优势是开源策略。amdgpu 驱动完全开源并合并入 Linux 内核主线，Mesa 用户态驱动也完全开源，这与 NVIDIA 的闭源驱动形成鲜明对比。NVIDIA 在 2022 年才开始开源部分驱动代码（nouveau/nvidia-open），但核心固件仍然闭源。对于驱动开发者来说，AMD 的开源策略意味着：你可以阅读所有代码、提交补丁、参与社区讨论。Intel 的 GPU 驱动（i915/xe）也是完全开源的，但 Intel GPU 在高性能计算领域的影响力远不如 AMD 和 NVIDIA。在 AI 计算领域，NVIDIA CUDA 仍然是绝对主导，ROCm 是 AMD 的应对方案，但生态成熟度还有差距。',
        diagram: {
          type: 'ascii',
          content: `AMD vs NVIDIA vs Intel 驱动对比

┌──────────────┬──────────────────┬──────────────────┬──────────────────┐
│   特性       │      AMD         │     NVIDIA       │     Intel        │
├──────────────┼──────────────────┼──────────────────┼──────────────────┤
│ 内核驱动     │ amdgpu (开源)    │ nvidia (闭源)    │ i915/xe (开源)   │
│              │ 合并入主线       │ nvidia-open(部分)│ 合并入主线       │
├──────────────┼──────────────────┼──────────────────┼──────────────────┤
│ 用户态驱动   │ Mesa radeonsi    │ 闭源             │ Mesa iris        │
│              │ Mesa radv(Vulkan)│ (libGL/libcuda)  │ Mesa crocus      │
├──────────────┼──────────────────┼──────────────────┼──────────────────┤
│ 计算框架     │ ROCm (开源)      │ CUDA (闭源)      │ oneAPI (开源)    │
│              │ HIP API          │ 行业标准         │ SYCL             │
├──────────────┼──────────────────┼──────────────────┼──────────────────┤
│ 开源程度     │ 极高             │ 低               │ 极高             │
├──────────────┼──────────────────┼──────────────────┼──────────────────┤
│ AI 生态      │ 成长中           │ 行业标准         │ 较弱             │
├──────────────┼──────────────────┼──────────────────┼──────────────────┤
│ 驱动学习难度 │ 低（全开源）     │ 高（闭源）       │ 低（全开源）     │
├──────────────┼──────────────────┼──────────────────┼──────────────────┤
│ 内核贡献机会 │ 非常多           │ 几乎没有         │ 较多             │
└──────────────┴──────────────────┴──────────────────┴──────────────────┘

结论：AMD 是学习 GPU 驱动开发的最佳平台
  ✓ 完全开源 → 可以阅读所有代码
  ✓ 活跃社区 → amd-gfx 邮件列表每天数十个补丁
  ✓ 职业机会 → AMD Markham 持续招聘驱动工程师`,
          caption: 'AMD vs NVIDIA vs Intel 驱动生态对比。AMD 的全开源策略使其成为学习 GPU 驱动开发的最佳选择——你可以阅读所有代码，参与所有讨论，提交真实的补丁。',
        },
      },
    ],
    keyBooks: [
      {
        title: 'AMD RDNA Architecture Whitepapers',
        author: 'AMD Inc.',
        relevance: 'AMD 官方发布的 GPU 架构白皮书，包含 RDNA2/3 的详细硬件架构说明。',
        url: 'https://www.amd.com/en/technologies/rdna',
      },
      {
        title: 'Linux Graphics Subsystem Overview',
        author: 'Linux Kernel Community',
        relevance: '内核文档中关于 DRM/KMS 图形子系统的概述，是理解驱动栈的起点。',
        url: 'https://docs.kernel.org/gpu/index.html',
      },
    ],
    onlineResources: [
      {
        title: 'AMD RDNA Architecture',
        url: 'https://www.amd.com/en/technologies/rdna',
        type: 'doc',
        description: 'AMD 官方 RDNA 架构介绍页面，包含架构白皮书下载链接。',
      },
      {
        title: 'AMDGPU Driver Documentation',
        url: 'https://docs.kernel.org/gpu/amdgpu/index.html',
        type: 'doc',
        description: 'Linux 内核官方 amdgpu 驱动文档，包含架构概述和模块说明。',
      },
      {
        title: 'ROCm Documentation',
        url: 'https://rocm.docs.amd.com',
        type: 'doc',
        description: 'AMD ROCm 官方文档，包含支持的 GPU 列表和编程指南。',
      },
      {
        title: 'Mesa 3D Graphics Library',
        url: 'https://mesa3d.org',
        type: 'repo',
        description: 'Mesa 开源 3D 图形库，包含 AMD radeonsi（OpenGL）和 radv（Vulkan）驱动。',
      },
    ],
  },
  codeReading: [
    {
      title: '识别你的 GPU 硬件信息',
      description: '使用系统工具查看 RX 7600 XT 的完整硬件信息，将型号与内核代码中的 Device ID 对应起来。',
      file: 'terminal',
      language: 'bash',
      code: `# 查看 GPU 的 PCI Vendor/Device ID
lspci -nn | grep -i "VGA\\|Display\\|3D"
# 输出示例：
# 03:00.0 VGA compatible controller [0300]: Advanced Micro Devices [AMD/ATI]
#         Navi33 [Radeon RX 7600/7600 XT] [1002:7480] (rev c7)
#         ↑ Vendor ID  ↑ Device ID
#         1002 = AMD   7480 = Navi33 RX 7600 XT

# 在内核源码中查找这个 Device ID
# grep -r "0x7480" drivers/gpu/drm/amd/amdgpu/
# 会找到 amdgpu_drv.c 中的设备表

# 查看 GPU 固件版本
dmesg | grep -i "amdgpu.*firmware\\|amdgpu.*ucode" | head -20

# 查看 GPU 当前状态
cat /sys/class/drm/card0/device/uevent`,
      annotations: [
        'PCI Vendor ID 1002 是 AMD 的标识符，所有 AMD GPU 都使用这个 Vendor ID',
        'Device ID 7480 对应 Navi33 芯片，在 amdgpu_drv.c 的设备表中可以找到',
        '内核通过 PCI ID 匹配驱动，这是 amdgpu_drv.c 中 pci_device_id 表的作用',
        'amdgpu_gpu_info 是 debugfs 接口，提供 GPU 的详细硬件信息',
      ],
    },
    {
      title: '查看 amdgpu 驱动的设备 ID 表',
      description: '在内核源码中找到 RX 7600 XT 对应的设备 ID 条目，理解驱动如何识别 GPU。',
      file: 'drivers/gpu/drm/amd/amdgpu/amdgpu_drv.c',
      language: 'c',
      code: `/* amdgpu_drv.c - PCI 设备 ID 表（简化版）
 * 完整文件：drivers/gpu/drm/amd/amdgpu/amdgpu_drv.c
 */

/* PCI 设备 ID 表：告诉内核这个驱动支持哪些 GPU */
static const struct pci_device_id pciidlist[] = {
    /* 省略其他设备... */

    /* NAVI33 - 这就是你的 RX 7600 XT */
    {0x1002, 0x7480, PCI_ANY_ID, PCI_ANY_ID, 0, 0, CHIP_NAVI33},
    {0x1002, 0x7483, PCI_ANY_ID, PCI_ANY_ID, 0, 0, CHIP_NAVI33},
    /* ↑ Vendor  ↑ Device ID                        ↑ ASIC 类型 */

    /* NAVI31 - RX 7900 XTX */
    {0x1002, 0x744C, PCI_ANY_ID, PCI_ANY_ID, 0, 0, CHIP_NAVI31},

    {0, 0, 0}
};
MODULE_DEVICE_TABLE(pci, pciidlist);

/* 当内核发现匹配的 PCI 设备时，调用 amdgpu_pci_probe */
static struct pci_driver amdgpu_kms_pci_driver = {
    .name       = DRIVER_NAME,
    .id_table   = pciidlist,
    .probe      = amdgpu_pci_probe,   /* GPU 初始化入口 */
    .remove     = amdgpu_pci_remove,
    .shutdown   = amdgpu_pci_shutdown,
    .driver.pm  = &amdgpu_pm_ops,
};`,
      annotations: [
        '0x1002 是 AMD 的 PCI Vendor ID，所有 AMD GPU 都相同',
        '0x7480 是 Navi33（RX 7600 XT）的 Device ID，这是识别你的 GPU 的关键',
        'CHIP_NAVI33 是 amdgpu 内部的枚举值，用于选择对应的 IP Block 实现',
        'MODULE_DEVICE_TABLE 宏将这个表导出，让内核的模块自动加载机制能找到正确的驱动',
        'amdgpu_pci_probe 是整个驱动初始化的起点，从这里开始跟踪代码',
      ],
    },
  ],
  miniProject: {
    title: '建立 AMD GPU 知识地图',
    description: '通过实际操作，将你手头的 AMD GPU 与内核代码中的具体实现对应起来（以 RX 7600 XT / Navi33 为参考示例），建立你的第一张"地图"。',
    objectives: [
      '找到 RX 7600 XT 的 PCI Device ID 并在内核源码中定位',
      '绘制你理解的 AMD 驱动技术栈图',
      '列出 RDNA3 架构的主要特性',
    ],
    steps: [
      '运行 lspci -nn | grep AMD，记录你的 GPU 的 Vendor ID 和 Device ID',
      '克隆 Linux 内核源码：git clone --depth=1 https://github.com/torvalds/linux.git',
      '在 amdgpu_drv.c 中搜索你的 Device ID：grep -n "7480" drivers/gpu/drm/amd/amdgpu/amdgpu_drv.c',
      '找到 CHIP_NAVI33 的定义：grep -rn "CHIP_NAVI33" drivers/gpu/drm/amd/amdgpu/',
      '查看 gfx_v11_0.c 文件的开头注释，了解 RDNA3 GFX IP 的实现',
      '在你的学习日志中画出 AMD 驱动技术栈图，标注每一层对应的文件/目录',
    ],
    expectedOutput: '一张手绘或数字绘制的 AMD 驱动技术栈图，标注了从你的 AMD GPU（如 RX 7600 XT）硬件到用户态应用的完整路径，以及每一层对应的内核代码文件。',
    githubTemplate: 'https://github.com/torvalds/linux/blob/master/drivers/gpu/drm/amd/amdgpu/amdgpu_drv.c',
  },
  interviewQuestions: [
    {
      question: '请解释 AMD GPU 驱动栈的各个层次，从用户应用到 GPU 硬件。',
      difficulty: 'easy',
      hint: '从上到下：应用 → API（OpenGL/Vulkan/HIP）→ 用户态驱动（Mesa/ROCr）→ 内核 DRM → amdgpu → 硬件。',
      answer: '完整的 AMD GPU 驱动栈：（1）用户应用通过 OpenGL/Vulkan API 调用 Mesa 3D 库（radeonsi/radv）；（2）Mesa 通过 libdrm 库发送 ioctl 到内核；（3）内核 DRM 子系统接收请求，调用 amdgpu 驱动；（4）amdgpu 驱动将命令写入 GPU 的命令环形缓冲区（Ring Buffer）；（5）GPU 硬件执行命令并通过中断通知 CPU 完成。对于计算工作负载（ROCm），路径是：HIP 应用 → ROCr 运行时 → /dev/kfd → KFD 驱动 → amdgpu → GPU。',
    },
    {
      question: 'RDNA3 架构（以 RX 7600 XT / Navi33 / gfx1102 为例）与前代 RDNA2 的主要区别是什么？',
      difficulty: 'medium',
      hint: '重点：RDNA3 家族差异（是否 Chiplet）、双发射 SIMD、AI 加速器、硬件 AV1 编码。',
      answer: 'RDNA3（gfx110x）相比 RDNA2（gfx103x）的主要改进：（1）家族实现分化：RDNA3 中既有 Chiplet 设计（如 Navi31/32），也有单晶粒设计（如 Navi33 / RX 7600 XT）；（2）双发射 SIMD：每个 CU 的 SIMD32 可以同时执行两条指令，理论峰值算力提升；（3）AI 相关能力增强：引入 WMMA 等矩阵计算能力；（4）硬件 AV1 编码：支持 AV1 硬件编码；（5）产品级 I/O 配置差异：如 RX 7600 XT 常见为 PCIe 4.0 x8，而高端型号可为 x16。在内核代码中，RDNA3 对应 gfx_v11_0.c，而 RDNA2 对应 gfx_v10_3_0.c。',
    },
    {
      question: 'AMD 的 amdgpu 驱动和 NVIDIA 的专有驱动在架构上有什么本质区别？',
      difficulty: 'medium',
      hint: '从开源/闭源、内核集成、社区贡献、调试能力等角度分析。',
      answer: '核心区别：（1）开源 vs 闭源：amdgpu 完全开源并合并入 Linux 内核主线，任何人可以阅读、修改和贡献代码；NVIDIA 驱动核心仍然闭源，nvidia-open 只开放了部分代码；（2）内核集成：amdgpu 作为标准内核模块，遵循内核编码规范，使用标准内核 API；NVIDIA 驱动使用大量私有接口，经常与内核 API 变化产生冲突；（3）调试能力：amdgpu 可以使用所有标准内核调试工具（ftrace、perf、kgdb）；NVIDIA 驱动的内部状态对外不透明；（4）社区：amdgpu 有活跃的 amd-gfx 邮件列表，AMD 工程师公开讨论设计决策；NVIDIA 驱动开发完全内部进行。',
    },
    {
      question: '什么是 KFD（Kernel Fusion Driver）？它与 amdgpu 的关系是什么？',
      difficulty: 'medium',
      hint: 'KFD 是 ROCm 的内核接口，是 amdgpu 驱动的一部分，通过 /dev/kfd 暴露给用户空间。',
      answer: 'KFD（Kernel Fusion Driver）是 amdgpu 驱动中专门为 GPU 计算工作负载（ROCm/HSA）提供服务的组件。它的主要功能：（1）为用户空间的 ROCr 运行时提供 /dev/kfd 设备节点；（2）管理 GPU 计算队列（Compute Queue）的创建和调度；（3）处理 GPU 内存的用户态映射（支持统一内存架构 HSA）；（4）管理 GPU 信号量（Signal）用于 CPU-GPU 同步。KFD 是 amdgpu 驱动的一部分（drivers/gpu/drm/amd/amdkfd/），与 amdgpu 共享底层的内存管理和命令提交基础设施，但提供了一套独立的用户态接口，专门针对计算工作负载优化。',
    },
  ],
};
