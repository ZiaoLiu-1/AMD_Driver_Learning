// Module 0.5 - AMD Ecosystem Overview (English)
// This file contains the complete English data for the AMD Ecosystem module
// Imported by curriculum_en.ts

import type { Module } from './curriculum';

export const ecosystemModuleEn: Module = {
  id: 'ecosystem',
  number: '0.5',
  title: 'AMD Ecosystem Overview',
  titleEn: 'AMD Ecosystem Overview',
  icon: 'Globe',
  description:
    'Before diving into driver code, build a complete "mental map": AMD product lines, GPU naming conventions, architecture history, driver stack, and the AMD vs NVIDIA competitive landscape.',
  estimatedHours: 8,
  difficulty: 'beginner',
  subModules: [
    { id: 'eco-company', title: 'AMD Company Structure', titleEn: 'AMD Company Structure' },
    { id: 'eco-gpu-lineup', title: 'GPU Product Lines', titleEn: 'GPU Product Lines' },
    { id: 'eco-naming', title: 'GPU/CPU Naming Conventions', titleEn: 'Naming Conventions' },
    { id: 'eco-arch-history', title: 'GPU Architecture History', titleEn: 'GPU Architecture History' },
    { id: 'eco-driver-stack', title: 'Driver Stack Overview', titleEn: 'Driver Stack Overview' },
    { id: 'eco-vs-nvidia', title: 'AMD vs NVIDIA vs Intel', titleEn: 'Competitive Landscape' },
  ],
  theory: {
    overview:
      'Many people jump straight into kernel code after getting an AMD GPU, only to get completely lost when they see terms like gfx1102, RDNA3, KFD, and DC. This module aims to give you a complete map: using the RX 7600 XT (Navi33 / gfx1102) as a running example, it helps you understand where any AMD GPU sits in the product line, where driver code sits in the software stack, and why AMD\'s open-source strategy is a huge advantage for learning driver development.',
    sections: [
      {
        title: 'AMD Company Structure',
        content:
          'AMD (Advanced Micro Devices) is a semiconductor company with four main business units: CPUs (Ryzen consumer / EPYC server), GPUs (Radeon consumer / Instinct datacenter), APUs (CPU+GPU integrated, e.g., Radeon iGPU in Ryzen 7000 series), and Xilinx FPGA (acquired in 2022). For driver developers, the GPU division—especially Radeon and Instinct product lines—is most relevant. AMD Markham (Ontario, Canada) is AMD\'s primary GPU software development center, responsible for the Linux kernel amdgpu driver, ROCm compute framework, and Mesa userspace drivers.',
        diagram: {
          type: 'ascii',
          content: `AMD Company Business Structure

┌─────────────────────────────────────────────────────────┐
│                    AMD Inc.                              │
├──────────────┬──────────────┬──────────────┬────────────┤
│     CPU      │     GPU      │     APU      │    FPGA    │
│              │              │              │            │
│ Ryzen        │ Radeon RX    │ Ryzen iGPU   │ Xilinx     │
│ (Consumer)   │ (Consumer)   │ (CPU+GPU)    │ (2022 acq) │
│              │              │              │            │
│ EPYC         │ Instinct MI  │ EPYC iGPU    │            │
│ (Server)     │ (Datacenter) │              │            │
└──────────────┴──────────────┴──────────────┴────────────┘
                      │
            Driver Dev Focus
                      │
         ┌────────────┴────────────┐
         │                         │
   Radeon RX (amdgpu)        Instinct MI (ROCm)
   Consumer GPU Driver       AI/HPC Compute Platform`,
          caption:
            'AMD business structure. Driver development is concentrated in the GPU division: Radeon RX maps to the amdgpu kernel driver, Instinct maps to the ROCm compute framework.',
        },
      },
      {
        title: 'AMD GPU Product Lines',
        content:
          'AMD GPU product lines have three tiers: consumer (Radeon RX), professional (Radeon Pro), and datacenter (Instinct MI). This tutorial uses the RX 7600 XT (consumer, RDNA3, Navi33, gfx1102) as the running example, but all concepts apply to other AMD GPUs. Consumer GPUs focus on gaming and creative work; driver development emphasizes OpenGL/Vulkan rendering and display output. Instinct MI series (e.g., MI300X) targets AI training and HPC and is the primary focus for ROCm—directly competing with NVIDIA A100/H100. ROCm features are often prioritized for Instinct; consumer GPU ROCm support is more limited.',
        diagram: {
          type: 'ascii',
          content: `AMD GPU Product Tier

Performance/Price
    ↑
    │  ┌──────────────────────────────────────────┐
    │  │  Instinct MI (Datacenter)                 │
    │  │  MI300X, MI250, MI100                     │
    │  │  → AI training / HPC / Scientific        │
    │  │  → ROCm primary target                   │
    │  └──────────────────────────────────────────┘
    │  ┌──────────────────────────────────────────┐
    │  │  Radeon Pro (Professional)                │
    │  │  W7900, W7800                            │
    │  │  → CAD / Video / Scientific Viz          │
    │  └──────────────────────────────────────────┘
    │  ┌──────────────────────────────────────────┐
    │  │  Radeon RX (Consumer)                    │
    │  │  RX 7900 XTX > RX 7800 XT > RX 7600 XT  │
    │  │  → Gaming / Creative                     │
    │  │  ← Your RX 7600 XT is here               │
    │  └──────────────────────────────────────────┘
    └──────────────────────────────────────────────→ Time`,
          caption:
            'AMD GPU three-tier product line. Consumer RX (e.g., RX 7600 XT) shares the same amdgpu kernel code as Instinct MI300 (RDNA3).',
        },
      },
      {
        title: 'GPU Naming Conventions',
        content:
          'Understanding AMD GPU naming lets you infer architecture generation, performance tier, and variant from any model. Example: RX 7600 XT. RX = Radeon eXperience (consumer). 7 = 7th gen (RDNA3). 6 = tier (6=mid, 9=flagship). 00 = model. XT = enhanced (higher clocks or more CUs). In kernel code, GPUs are identified by PCI Device ID; RX 7600 XT is 0x7480, codename Navi33, IP gfx1102 (GFX IP 11.0.2).',
        diagram: {
          type: 'ascii',
          content: `AMD GPU Naming

        RX  7  6  00  XT
        │   │  │   │   └── Suffix
        │   │  │   │        XT  = Enhanced
        │   │  │   │        XTX = Flagship enhanced
        │   │  │   │        GRE = Special edition
        │   │  │   └────── Model
        │   │  └────────── Tier
        │   │               9 = Flagship (RX 7900 XTX)
        │   │               6 = Mid (RX 7600 XT) ← Your card
        │   └────────────── Gen (7 = RDNA3)
        └────────────────── Line (RX = Consumer)

Mapping: RX 7600 XT → Navi33 → gfx1102 → RDNA3`,
          caption:
            'AMD GPU naming. Understanding this lets you infer the IP version (gfxXXXX) in kernel code from the model.',
        },
      },
      {
        title: 'AMD GPU Architecture History',
        content:
          'AMD GPU architecture has gone through major shifts. GCN (2012–2019) laid the foundation; amdgpu still has legacy code from that era. RDNA (2019) was a full redesign with better perf/watt. RDNA2 (2020) added hardware ray tracing. RDNA3 (2022) brought a new frontend, instructions, and media—some parts use Chiplets (Navi31/32); your RX 7600 XT (Navi33) is monolithic. RDNA4 (2025) improves ray tracing and AI. In kernel code, each architecture maps to IP files like gfx_v11_0.c (RDNA3) and gfx_v10_3_0.c (RDNA2).',
        diagram: {
          type: 'ascii',
          content: `AMD GPU Architecture Timeline

2019  ── RDNA 1.0 (Navi, gfx10) RX 5700 XT
2020  ── RDNA 2.0 (gfx103x) RX 6800 XT
2022  ── RDNA 3.0 (gfx110x) ← Your RX 7600 XT (gfx1102)
2025  ── RDNA 4.0 (gfx120x) RX 9070 XT`,
          caption:
            'AMD GPU architecture evolution. RX 7600 XT uses gfx1102 (RDNA3); this tutorial uses it as the example.',
        },
      },
      {
        title: 'AMD Linux Driver Stack',
        content:
          'Understanding the software stack is key. From user apps to GPU hardware, there are several layers. Graphics apps use OpenGL/Vulkan and call Mesa 3D; Mesa talks to the kernel via DRI (Direct Rendering Infrastructure). The DRM subsystem provides the generic GPU framework; amdgpu is the DRM implementation. For compute (ROCm), HIP apps call ROCr; ROCr uses /dev/kfd to talk to KFD (Kernel Fusion Driver) in the kernel. KFD is part of amdgpu and serves compute workloads.',
        diagram: {
          type: 'ascii',
          content: `AMD Linux Driver Stack

┌─────────────────────────────────────────────────────────────┐
│                    User Space                                 │
│  Apps → Mesa 3D / ROCm HIP → libdrm / libkfd                 │
└────────────────────────────┼────────────────────────────────┘
                             │ ioctl
┌────────────────────────────┼────────────────────────────────┐
│                    Kernel Space                               │
│  DRM → amdgpu (GFX, SDMA, DC, KFD)                           │
└────────────────────────────┼────────────────────────────────┘
                             │ PCIe / MMIO
┌────────────────────────────┼────────────────────────────────┐
│  RX 7600 XT (Navi33 / gfx1102)                               │
└──────────────────────────────────────────────────────────────┘`,
          caption:
            'AMD Linux driver stack. This is the roadmap for the learning path—each module maps to a layer.',
        },
      },
      {
        title: 'AMD vs NVIDIA vs Intel',
        content:
          'AMD\'s main GPU advantage is open source. The amdgpu driver is fully open and in the kernel mainline; Mesa userspace drivers are open too. NVIDIA began opening some driver code (nouveau/nvidia-open) in 2022, but core firmware stays closed. For driver developers, AMD\'s openness means you can read all code, submit patches, and participate in discussions. Intel GPU drivers (i915/xe) are also open, but Intel has less influence in HPC. In AI, NVIDIA CUDA dominates; ROCm is AMD\'s answer, with an ecosystem still catching up.',
        diagram: {
          type: 'ascii',
          content: `AMD vs NVIDIA vs Intel

AMD: Full open source → Best for learning
NVIDIA: Mostly closed → Industry standard for AI
Intel: Open source, limited HPC presence`,
          caption:
            'AMD\'s open-source approach makes it the best choice for learning GPU driver development.',
        },
      },
    ],
    keyBooks: [
      {
        title: 'AMD RDNA Architecture Whitepapers',
        author: 'AMD Inc.',
        relevance:
          'Official AMD GPU architecture whitepapers with detailed RDNA2/3 hardware descriptions.',
        url: 'https://www.amd.com/en/technologies/rdna',
      },
      {
        title: 'Linux Graphics Subsystem Overview',
        author: 'Linux Kernel Community',
        relevance:
          'Kernel documentation on the DRM/KMS graphics subsystem—the starting point for understanding the driver stack.',
        url: 'https://docs.kernel.org/gpu/index.html',
      },
    ],
    onlineResources: [
      {
        title: 'AMD RDNA Architecture',
        url: 'https://www.amd.com/en/technologies/rdna',
        type: 'doc',
        description:
          'AMD official RDNA architecture page with whitepaper links.',
      },
      {
        title: 'AMDGPU Driver Documentation',
        url: 'https://docs.kernel.org/gpu/amdgpu/index.html',
        type: 'doc',
        description:
          'Linux kernel official amdgpu driver docs with architecture overview and module descriptions.',
      },
      {
        title: 'ROCm Documentation',
        url: 'https://rocm.docs.amd.com',
        type: 'doc',
        description:
          'AMD ROCm official docs including supported GPU list and programming guides.',
      },
      {
        title: 'Mesa 3D Graphics Library',
        url: 'https://mesa3d.org',
        type: 'repo',
        description:
          'Mesa open-source 3D graphics library, including AMD radeonsi (OpenGL) and radv (Vulkan) drivers.',
      },
    ],
  },
  codeReading: [
    {
      title: 'Identify Your GPU Hardware Info',
      description:
        'Use system tools to view RX 7600 XT hardware info and map the model to Device ID in kernel code.',
      file: 'terminal',
      language: 'bash',
      code: `# View GPU PCI Vendor/Device ID
lspci -nn | grep -i "VGA\\|Display\\|3D"
# Example: 1002:7480 = Navi33 RX 7600 XT

# Find Device ID in kernel source
# grep -r "0x7480" drivers/gpu/drm/amd/amdgpu/`,
      annotations: [
        'PCI Vendor ID 1002 is AMD; all AMD GPUs use it.',
        'Device ID 7480 is Navi33; see amdgpu_drv.c pci_device_id table.',
        'Kernel matches driver via PCI ID.',
      ],
    },
    {
      title: 'amdgpu Device ID Table',
      description:
        'Find the RX 7600 XT entry in kernel source and see how the driver identifies the GPU.',
      file: 'drivers/gpu/drm/amd/amdgpu/amdgpu_drv.c',
      language: 'c',
      code: `/* amdgpu_drv.c - PCI device ID table */
static const struct pci_device_id pciidlist[] = {
    /* NAVI33 - RX 7600 XT */
    {0x1002, 0x7480, PCI_ANY_ID, PCI_ANY_ID, 0, 0, CHIP_NAVI33},
    /* Vendor 0x1002 = AMD, Device 0x7480 = Navi33 */
    {0, 0, 0}
};
MODULE_DEVICE_TABLE(pci, pciidlist);`,
      annotations: [
        '0x1002 = AMD Vendor ID; 0x7480 = Navi33 Device ID.',
        'CHIP_NAVI33 selects IP Block implementation.',
        'amdgpu_pci_probe is the driver init entry point.',
      ],
    },
  ],
  miniProject: {
    title: 'Build Your AMD GPU Knowledge Map',
    description:
      'Map your AMD GPU to specific kernel code (use RX 7600 XT / Navi33 as reference) and create your first "map".',
    objectives: [
      'Locate RX 7600 XT PCI Device ID in kernel source',
      'Draw the AMD driver stack as you understand it',
      'List main RDNA3 architecture features',
    ],
    steps: [
      'Run lspci -nn | grep AMD, note Vendor and Device ID',
      'Clone kernel: git clone --depth=1 https://github.com/torvalds/linux.git',
      'Search amdgpu_drv.c for your Device ID',
      'Find CHIP_NAVI33 definition',
      'Sketch the AMD driver stack with file/dir annotations',
    ],
    expectedOutput:
      'A hand-drawn or digital AMD driver stack diagram from your GPU to userspace, with kernel file/dir notes.',
    githubTemplate: 'https://github.com/torvalds/linux/blob/master/drivers/gpu/drm/amd/amdgpu/amdgpu_drv.c',
  },
  interviewQuestions: [
    {
      question:
        'Explain the layers of the AMD GPU driver stack, from user applications to GPU hardware.',
      difficulty: 'easy',
      hint:
        'Top to bottom: Apps → API (OpenGL/Vulkan/HIP) → userspace (Mesa/ROCr) → kernel DRM → amdgpu → hardware.',
      answer:
        'Full stack: (1) Apps call Mesa (radeonsi/radv) via OpenGL/Vulkan; (2) Mesa uses libdrm ioctl to talk to kernel; (3) DRM receives requests and calls amdgpu; (4) amdgpu writes commands to GPU ring buffer; (5) GPU executes and interrupts CPU when done. For ROCm: HIP app → ROCr → /dev/kfd → KFD → amdgpu → GPU.',
    },
    {
      question:
        'What are the main differences between RDNA3 (RX 7600 XT / Navi33 / gfx1102) and RDNA2?',
      difficulty: 'medium',
      hint:
        'Focus: RDNA3 family split (Chiplet vs monolithic), dual-issue SIMD, AI acceleration, hardware AV1 encode.',
      answer:
        'RDNA3 vs RDNA2: (1) Family split—RDNA3 has Chiplet (Navi31/32) and monolithic (Navi33); (2) dual-issue SIMD per CU; (3) improved matrix/AI ops; (4) hardware AV1 encode; (5) different I/O (e.g., RX 7600 XT often PCIe 4.0 x8). Code: RDNA3 = gfx_v11_0.c, RDNA2 = gfx_v10_3_0.c.',
    },
    {
      question:
        'What is KFD (Kernel Fusion Driver)? How does it relate to amdgpu?',
      difficulty: 'medium',
      hint:
        'KFD is the ROCm kernel interface, part of amdgpu, exposed via /dev/kfd.',
      answer:
        'KFD is the amdgpu component for compute (ROCm/HSA). It provides /dev/kfd for ROCr, manages compute queues, handles GPU memory mapping for unified memory, and GPU signals for sync. KFD lives in drivers/gpu/drm/amd/amdkfd/ and shares amdgpu memory and command submission infra.',
    },
  ],
};
