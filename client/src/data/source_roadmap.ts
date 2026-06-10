/* ============================================================
   Source Code Reading Roadmap — 4-stage guided reading plan
   Based on V4.0 audit report Section 4
   ============================================================ */

import type { Locale } from './curriculum_index';

export interface SourceFile {
  path: string;
  description: string;
  descriptionEn: string;
  keyFunctions: string[];
  externalUrl: string;
  readingNotes: string;
  readingNotesEn: string;
  relatedConcepts: string[];
}

export interface SourceStage {
  id: string;
  number: number;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  phaseIds: string[];
  files: SourceFile[];
}

// Source links are pinned to a maintained longterm (LTS) kernel so file paths and
// reading notes stay stable. Audited against Linux 6.12 LTS (2026-05). The amdgpu
// file layout below is also present in current stable/mainline; bump KERNEL_TAG when
// you re-audit against a newer release.
export const KERNEL_TAG = 'v6.12';
const BOOTLIN_BASE = `https://elixir.bootlin.com/linux/${KERNEL_TAG}/source`;

export const sourceStages: SourceStage[] = [
  {
    id: 'src-stage-1',
    number: 1,
    title: '第一阶段：驱动入口与设备管理',
    titleEn: 'Stage 1: Driver Entry & Device Management',
    description:
      '从 amdgpu 驱动的入口点开始，理解驱动注册、PCI probe 和设备初始化的完整流程。',
    descriptionEn:
      'Start from the amdgpu driver entry point. Understand driver registration, PCI probe, and the full device initialization flow.',
    phaseIds: ['phase-1'],
    files: [
      {
        path: 'drivers/gpu/drm/amd/amdgpu/amdgpu_drv.c',
        description: '驱动注册入口：PCI ID 表、file_operations 定义、module_init/exit。',
        descriptionEn: 'Driver registration entry: PCI ID table, file_operations, module_init/exit.',
        keyFunctions: ['amdgpu_pci_probe', 'amdgpu_pci_remove', 'amdgpu_init', 'amdgpu_exit'],
        externalUrl: `${BOOTLIN_BASE}/drivers/gpu/drm/amd/amdgpu/amdgpu_drv.c`,
        readingNotes:
          '从 MODULE_DEVICE_TABLE 和 pci_driver 结构体开始。追踪 amdgpu_pci_probe 如何调用 amdgpu_device_init。关注 pciidlist 中的设备 ID 如何映射到芯片类型。',
        readingNotesEn:
          'Start with MODULE_DEVICE_TABLE and pci_driver struct. Trace how amdgpu_pci_probe calls amdgpu_device_init. Note how pciidlist device IDs map to chip types.',
        relatedConcepts: ['PCI probe', 'driver registration', 'module_init'],
      },
      {
        path: 'drivers/gpu/drm/amd/amdgpu/amdgpu_device.c',
        description: 'amdgpu_device 结构体定义：设备初始化 (amdgpu_device_init) 和卸载流程。',
        descriptionEn: 'amdgpu_device struct: device initialization (amdgpu_device_init) and teardown.',
        keyFunctions: ['amdgpu_device_init', 'amdgpu_device_fini', 'amdgpu_device_ip_init', 'amdgpu_device_gpu_recover'],
        externalUrl: `${BOOTLIN_BASE}/drivers/gpu/drm/amd/amdgpu/amdgpu_device.c`,
        readingNotes:
          '这是最重要的文件。amdgpu_device_init 是整个驱动初始化的主线函数——追踪它调用的每个子函数即可理解完整的初始化流程。关注 IP Block 的注册和 early_init/sw_init/hw_init 调用链。',
        readingNotesEn:
          'The most important file. amdgpu_device_init is the main init function—tracing its sub-calls reveals the full init flow. Focus on IP Block registration and early_init/sw_init/hw_init call chain.',
        relatedConcepts: ['device init', 'IP Block', 'GPU recovery'],
      },
    ],
  },
  {
    id: 'src-stage-2',
    number: 2,
    title: '第二阶段：内存管理',
    titleEn: 'Stage 2: Memory Management',
    description:
      '深入 GPUVM 和 TTM 内存管理子系统的源码，理解 Buffer Object 的生命周期。',
    descriptionEn:
      'Deep dive into GPUVM and TTM memory management subsystem source code. Understand Buffer Object lifecycle.',
    phaseIds: ['phase-2'],
    files: [
      {
        path: 'drivers/gpu/drm/amd/amdgpu/amdgpu_vm.c',
        description: 'GPUVM 核心实现：页表操作、BO 映射、TLB flush。',
        descriptionEn: 'GPUVM core: page table operations, BO mapping, TLB flush.',
        keyFunctions: ['amdgpu_vm_init', 'amdgpu_vm_bo_map', 'amdgpu_vm_bo_update', 'amdgpu_vm_flush'],
        externalUrl: `${BOOTLIN_BASE}/drivers/gpu/drm/amd/amdgpu/amdgpu_vm.c`,
        readingNotes:
          '从 amdgpu_vm_bo_map 入手，理解虚拟地址到物理地址映射如何建立。关注页表 BO 的管理和 SDMA 更新路径。',
        readingNotesEn:
          'Start with amdgpu_vm_bo_map to understand how virtual-to-physical address mappings are established. Note page table BO management and SDMA update paths.',
        relatedConcepts: ['GPUVM', 'page table', 'TLB flush', 'SDMA'],
      },
      {
        path: 'drivers/gpu/drm/amd/amdgpu/amdgpu_ttm.c',
        description: 'TTM 后端实现：BO 分配、迁移（VRAM ↔ GTT）、eviction。',
        descriptionEn: 'TTM backend: BO allocation, migration (VRAM ↔ GTT), eviction.',
        keyFunctions: ['amdgpu_ttm_init', 'amdgpu_bo_move', 'amdgpu_ttm_tt_populate', 'amdgpu_bo_evict_vram'],
        externalUrl: `${BOOTLIN_BASE}/drivers/gpu/drm/amd/amdgpu/amdgpu_ttm.c`,
        readingNotes:
          '关注 amdgpu_bo_move 函数——它决定 BO 如何在 VRAM 和 GTT 之间迁移。理解 TTM 的 placement 概念和 LRU eviction 触发条件。',
        readingNotesEn:
          'Focus on amdgpu_bo_move—it decides how BOs migrate between VRAM and GTT. Understand TTM placement concept and LRU eviction triggers.',
        relatedConcepts: ['TTM', 'VRAM', 'GTT', 'eviction', 'migration'],
      },
      {
        path: 'drivers/gpu/drm/amd/amdgpu/amdgpu_object.c',
        description: 'amdgpu_bo 结构体和相关操作：创建、销毁、pin/unpin。',
        descriptionEn: 'amdgpu_bo struct and operations: create, destroy, pin/unpin.',
        keyFunctions: ['amdgpu_bo_create', 'amdgpu_bo_free', 'amdgpu_bo_pin', 'amdgpu_bo_unpin'],
        externalUrl: `${BOOTLIN_BASE}/drivers/gpu/drm/amd/amdgpu/amdgpu_object.c`,
        readingNotes:
          'BO 的完整生命周期：create → pin (固定在 VRAM) → map (映射到 GPUVM) → unmap → unpin → free。Pin 操作防止 TTM 将 BO 驱逐。',
        readingNotesEn:
          'Full BO lifecycle: create → pin (fix in VRAM) → map (GPUVM mapping) → unmap → unpin → free. Pin prevents TTM from evicting the BO.',
        relatedConcepts: ['Buffer Object', 'pin/unpin', 'GEM'],
      },
    ],
  },
  {
    id: 'src-stage-3',
    number: 3,
    title: '第三阶段：命令提交与调度',
    titleEn: 'Stage 3: Command Submission & Scheduling',
    description:
      '理解 GPU 命令从用户空间到硬件执行的完整路径。',
    descriptionEn:
      'Understand the complete path of GPU commands from userspace to hardware execution.',
    phaseIds: ['phase-3'],
    files: [
      {
        path: 'drivers/gpu/drm/amd/amdgpu/amdgpu_ring.c',
        description: 'Ring Buffer 实现：环形命令缓冲区的管理。',
        descriptionEn: 'Ring Buffer implementation: circular command buffer management.',
        keyFunctions: ['amdgpu_ring_init', 'amdgpu_ring_commit', 'amdgpu_ring_write'],
        externalUrl: `${BOOTLIN_BASE}/drivers/gpu/drm/amd/amdgpu/amdgpu_ring.c`,
        readingNotes:
          '理解 WPTR/RPTR 管理和 doorbell 通知机制。amdgpu_ring_commit 将命令提交给 GPU——追踪 doorbell 写入路径。',
        readingNotesEn:
          'Understand WPTR/RPTR management and doorbell notification. amdgpu_ring_commit submits commands to GPU—trace the doorbell write path.',
        relatedConcepts: ['Ring Buffer', 'WPTR', 'RPTR', 'doorbell'],
      },
      {
        path: 'drivers/gpu/drm/amd/amdgpu/amdgpu_job.c',
        description: 'amdgpu_job 结构体定义：GPU 作业的创建和提交。',
        descriptionEn: 'amdgpu_job struct: GPU job creation and submission.',
        keyFunctions: ['amdgpu_job_alloc', 'amdgpu_job_submit', 'amdgpu_job_free'],
        externalUrl: `${BOOTLIN_BASE}/drivers/gpu/drm/amd/amdgpu/amdgpu_job.c`,
        readingNotes:
          'Job 是 scheduler 的调度单位。追踪 amdgpu_job_submit 如何将 job 交给 drm_gpu_scheduler。',
        readingNotesEn:
          'Job is the scheduler\'s scheduling unit. Trace how amdgpu_job_submit hands jobs to drm_gpu_scheduler.',
        relatedConcepts: ['GPU job', 'scheduler', 'command submission'],
      },
      {
        path: 'drivers/gpu/drm/scheduler/sched_main.c',
        description: '通用 drm_gpu_scheduler 实现：多队列 GPU 调度器。',
        descriptionEn: 'Generic drm_gpu_scheduler: multi-queue GPU scheduler implementation.',
        keyFunctions: ['drm_sched_main', 'drm_sched_entity_push_job', 'drm_sched_job_done'],
        externalUrl: `${BOOTLIN_BASE}/drivers/gpu/drm/scheduler/sched_main.c`,
        readingNotes:
          '这不是 amdgpu 特有的——它是所有 DRM 驱动共享的通用调度器。理解调度线程（drm_sched_main）如何从队列中取出 job 并提交到硬件。',
        readingNotesEn:
          'Not amdgpu-specific—shared by all DRM drivers. Understand how the scheduler thread (drm_sched_main) dequeues jobs and submits to hardware.',
        relatedConcepts: ['drm_gpu_scheduler', 'scheduling', 'multi-queue'],
      },
      {
        path: 'drivers/gpu/drm/amd/amdgpu/amdgpu_fence.c',
        description: 'amdgpu_fence 实现：dma_fence 操作回调和信号机制。',
        descriptionEn: 'amdgpu_fence: dma_fence operation callbacks and signaling.',
        keyFunctions: ['amdgpu_fence_emit', 'amdgpu_fence_process', 'amdgpu_fence_driver_init'],
        externalUrl: `${BOOTLIN_BASE}/drivers/gpu/drm/amd/amdgpu/amdgpu_fence.c`,
        readingNotes:
          '理解 fence 的 emit（写入 Ring）和 process（中断处理中 signal）。这是 GPU 同步机制的核心。',
        readingNotesEn:
          'Understand fence emit (write to Ring) and process (signal in interrupt handler). This is the core of GPU synchronization.',
        relatedConcepts: ['dma_fence', 'synchronization', 'interrupt'],
      },
    ],
  },
  {
    id: 'src-stage-4',
    number: 4,
    title: '第四阶段：计算与显示',
    titleEn: 'Stage 4: Compute & Display',
    description:
      '探索 ROCm 内核接口（KFD）和 Display Core（DC）子系统的源码。',
    descriptionEn:
      'Explore the ROCm kernel interface (KFD) and Display Core (DC) subsystem source code.',
    phaseIds: ['phase-4', 'phase-5'],
    files: [
      {
        path: 'drivers/gpu/drm/amd/amdkfd/kfd_device.c',
        description: 'KFD（ROCm 内核接口）设备管理。',
        descriptionEn: 'KFD (ROCm kernel interface) device management.',
        keyFunctions: ['kfd_init', 'kgd2kfd_probe', 'kfd_process_create_wq'],
        externalUrl: `${BOOTLIN_BASE}/drivers/gpu/drm/amd/amdkfd/kfd_device.c`,
        readingNotes:
          'KFD 是 ROCm/HIP 用户空间与内核驱动的接口。关注它如何与 amdgpu 共享 GPU 资源（特别是 VMID 和队列）。',
        readingNotesEn:
          'KFD is the interface between ROCm/HIP userspace and kernel driver. Focus on how it shares GPU resources with amdgpu (especially VMIDs and queues).',
        relatedConcepts: ['KFD', 'ROCm', 'HSA', 'compute'],
      },
      {
        path: 'drivers/gpu/drm/amd/display/amdgpu_dm/amdgpu_dm.c',
        description: 'Display Core 与 DRM/KMS 的桥接层。',
        descriptionEn: 'Display Core to DRM/KMS bridge layer.',
        keyFunctions: ['amdgpu_dm_init', 'dm_atomic_commit_tail', 'amdgpu_dm_connector_init'],
        externalUrl: `${BOOTLIN_BASE}/drivers/gpu/drm/amd/display/amdgpu_dm/amdgpu_dm.c`,
        readingNotes:
          'amdgpu_dm.c 是"胶水层"，将 DRM/KMS 对象（CRTC、Connector、Plane）映射到 DC 的内部对象（dc_stream、dc_plane）。这是理解 AMD 显示栈的关键入口。',
        readingNotesEn:
          'amdgpu_dm.c is the "glue layer" mapping DRM/KMS objects (CRTC, Connector, Plane) to DC internal objects (dc_stream, dc_plane). Key entry point for AMD display stack.',
        relatedConcepts: ['Display Core', 'KMS', 'atomic commit'],
      },
      {
        path: 'llvm/lib/Target/AMDGPU/',
        description: 'LLVM AMDGPU 编译器后端（用户态源码）。',
        descriptionEn: 'LLVM AMDGPU compiler backend (userspace source).',
        keyFunctions: ['AMDGPUTargetMachine', 'SIISelLowering', 'AMDGPUISelDAGToDAG'],
        externalUrl: 'https://github.com/llvm/llvm-project/tree/main/llvm/lib/Target/AMDGPU',
        readingNotes:
          '用户态源码，不在内核中。从 AMDGPUTargetMachine.cpp 开始，理解后端 Pass 注册。关键文件：SIISelLowering.cpp（指令选择）、SIRegisterInfo.cpp（VGPR/SGPR 定义）。',
        readingNotesEn:
          'Userspace source, not in kernel. Start with AMDGPUTargetMachine.cpp for backend Pass registration. Key files: SIISelLowering.cpp (instruction selection), SIRegisterInfo.cpp (VGPR/SGPR definitions).',
        relatedConcepts: ['LLVM', 'AMDGPU backend', 'ISA', 'compiler'],
      },
    ],
  },
];

export function getSourceStages(locale: Locale) {
  return sourceStages.map((s) => ({
    ...s,
    title: locale === 'en' ? s.titleEn : s.title,
    description: locale === 'en' ? s.descriptionEn : s.description,
    files: s.files.map((f) => ({
      ...f,
      description: locale === 'en' ? f.descriptionEn : f.description,
      readingNotes: locale === 'en' ? f.readingNotesEn : f.readingNotes,
    })),
  }));
}

export function getSourceStageById(id: string, locale: Locale) {
  return getSourceStages(locale).find((s) => s.id === id);
}
