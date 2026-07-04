/* ============================================================
   Engineering Phases — V4 restructure of the learning path
   Maps 12 existing modules into 5 engineering-oriented phases
   based on the comprehensive audit report (V4.0).
   ============================================================ */

import type { Locale } from './curriculum_index';

export interface EngineeringPhase {
  id: string;
  number: number;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  icon: string;
  moduleIds: string[];
  coreConcepts: string[];
  coreConceptsEn: string[];
  prerequisites: string[];
  estimatedHours: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
}

export const engineeringPhases: EngineeringPhase[] = [
  {
    id: 'phase-1',
    number: 1,
    title: 'DRM + amdgpu 驱动整体架构',
    titleEn: 'DRM + amdgpu Driver Architecture',
    description:
      '理解 GPU 驱动如何在 Linux 内核中作为一个 DRM 设备存在，并掌握 amdgpu 驱动的宏观代码结构和初始化流程。',
    descriptionEn:
      'Understand how GPU drivers exist as DRM devices in the Linux kernel. Master the macro code structure and initialization flow of the amdgpu driver.',
    icon: 'Layers',
    moduleIds: ['intro', 'ecosystem', 'c-cpp', 'prerequisites', 'gpu-arch', 'kernel', 'drm', 'amdgpu'],
    coreConcepts: [
      'amdgpu_driver 注册',
      'amdgpu_device 创建',
      'IP Block 的 sw_init / hw_init 流程',
      'IP Discovery 机制（RDNA2+）',
      'DRM 核心架构',
    ],
    coreConceptsEn: [
      'amdgpu_driver registration',
      'amdgpu_device creation',
      'IP Block sw_init / hw_init flow',
      'IP Discovery mechanism (RDNA2+)',
      'DRM core architecture',
    ],
    prerequisites: [],
    estimatedHours: 120,
    difficulty: 'intermediate',
  },
  {
    id: 'phase-2',
    number: 2,
    title: '核心内存管理 (GPUVM + TTM/BO)',
    titleEn: 'Core Memory Management (GPUVM + TTM/BO)',
    description:
      '深入理解 GPU 如何管理内存，包括虚拟内存（GPUVM 多级页表）和物理内存（TTM 对 VRAM/GTT 的管理）。',
    descriptionEn:
      'Deep dive into GPU memory management: virtual memory (GPUVM multi-level page tables) and physical memory (TTM management of VRAM/GTT).',
    icon: 'HardDrive',
    moduleIds: ['hardware', 'drm'],
    coreConcepts: [
      'GPUVM 多级页表结构',
      'TTM (Translation Table Manager) 架构',
      'amdgpu_bo (Buffer Object) 生命周期',
      'GEM API 前端 + TTM 管理后端',
      'VRAM/GTT 迁移与 Eviction',
    ],
    coreConceptsEn: [
      'GPUVM multi-level page table structure',
      'TTM (Translation Table Manager) architecture',
      'amdgpu_bo (Buffer Object) lifecycle',
      'GEM API frontend + TTM management backend',
      'VRAM/GTT migration and eviction',
    ],
    prerequisites: ['phase-1'],
    estimatedHours: 60,
    difficulty: 'advanced',
  },
  {
    id: 'phase-3',
    number: 3,
    title: '命令提交与调度 (Scheduling + Fence)',
    titleEn: 'Command Submission & Scheduling (Scheduling + Fence)',
    description:
      '掌握用户态的命令如何被提交到硬件执行，以及内核如何调度和同步这些命令。',
    descriptionEn:
      'Master how userspace commands are submitted to hardware for execution, and how the kernel schedules and synchronizes them.',
    icon: 'GitBranch',
    moduleIds: ['amdgpu', 'drm'],
    coreConcepts: [
      'Ring Buffer 机制',
      'drm_gpu_scheduler',
      'amdgpu_job 提交流程',
      'dma_fence 同步机制',
      'User Queue (GFX11+)',
    ],
    coreConceptsEn: [
      'Ring Buffer mechanism',
      'drm_gpu_scheduler',
      'amdgpu_job submission flow',
      'dma_fence synchronization',
      'User Queue (GFX11+)',
    ],
    prerequisites: ['phase-1', 'phase-2'],
    estimatedHours: 50,
    difficulty: 'advanced',
  },
  {
    id: 'phase-4',
    number: 4,
    title: '调试、重置与固件 (Debug, Reset, Firmware)',
    titleEn: 'Debugging, Reset & Firmware',
    description:
      '学习如何诊断和解决最常见的 GPU 问题，并理解固件在驱动中的关键作用。',
    descriptionEn:
      'Learn to diagnose and resolve common GPU issues. Understand the critical role of firmware in the driver.',
    icon: 'Bug',
    moduleIds: ['debugging'],
    coreConcepts: [
      'GPU Hang 调试',
      'devcoredump 分析',
      'GPU Reset 机制（soft/hard/mode1/mode2）',
      'Firmware 加载流程（PSP/SMU/CP/RLC）',
      'ftrace 与 dmesg 调试技术',
    ],
    coreConceptsEn: [
      'GPU Hang debugging',
      'devcoredump analysis',
      'GPU Reset mechanisms (soft/hard/mode1/mode2)',
      'Firmware loading flow (PSP/SMU/CP/RLC)',
      'ftrace and dmesg debugging techniques',
    ],
    prerequisites: ['phase-3'],
    estimatedHours: 40,
    difficulty: 'expert',
  },
  {
    id: 'phase-5',
    number: 5,
    title: '编译器与指令集 (Compiler + ISA)',
    titleEn: 'Compiler & ISA',
    description:
      '了解上层着色器代码或计算任务如何被编译成 GPU 可执行的指令，掌握 LLVM AMDGPU 后端和 RDNA3 ISA。',
    descriptionEn:
      'Understand how shaders and compute kernels are compiled to GPU-executable instructions. Master the LLVM AMDGPU backend and RDNA3 ISA.',
    icon: 'Cpu',
    moduleIds: ['llvm', 'rocm-compute', 'rocm-kernel'],
    coreConcepts: [
      'LLVM AMDGPU Backend',
      'Mesa ACO Compiler',
      'RDNA3 ISA 指令格式',
      'VGPR/SGPR 寄存器分配',
      'Occupancy 优化',
    ],
    coreConceptsEn: [
      'LLVM AMDGPU Backend',
      'Mesa ACO Compiler',
      'RDNA3 ISA instruction format',
      'VGPR/SGPR register allocation',
      'Occupancy optimization',
    ],
    prerequisites: ['phase-1'],
    estimatedHours: 60,
    difficulty: 'expert',
  },
];

export function getPhases(locale: Locale) {
  return engineeringPhases.map((p) => ({
    ...p,
    title: locale === 'en' ? p.titleEn : p.title,
    description: locale === 'en' ? p.descriptionEn : p.description,
    coreConcepts: locale === 'en' ? p.coreConceptsEn : p.coreConcepts,
  }));
}

export function getPhaseById(id: string) {
  return engineeringPhases.find((p) => p.id === id);
}

export function getPhaseForModule(moduleId: string) {
  return engineeringPhases.find((p) => p.moduleIds.includes(moduleId));
}
