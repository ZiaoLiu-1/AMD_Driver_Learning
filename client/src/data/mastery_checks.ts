/* ============================================================
   Mastery Checks — Interview-level self-assessment system
   Based on V4.0 audit report Section 2.3
   ============================================================ */

import type { Locale } from './curriculum_index';

export interface MasteryQuestion {
  id: string;
  phaseId: string;
  question: string;
  questionEn: string;
  difficulty: 'core' | 'advanced' | 'expert';
  hints: string[];
  hintsEn: string[];
  referenceAnswer: string;
  referenceAnswerEn: string;
  relatedModuleIds: string[];
  relatedLabId?: string;
}

export interface ChecklistItem {
  id: string;
  description: string;
  descriptionEn: string;
  category: 'theory' | 'code' | 'experiment' | 'debug';
}

export interface PhaseChecklist {
  phaseId: string;
  items: ChecklistItem[];
}

export const masteryQuestions: MasteryQuestion[] = [
  {
    id: 'mq-1-gpuvm',
    phaseId: 'phase-2',
    question:
      '请画出 AMDGPU 的 GPUVM 多级页表结构，并描述一个 Buffer Object (BO) 从创建到映射到 GPU 地址空间的过程。',
    questionEn:
      'Draw the AMDGPU GPUVM multi-level page table structure and describe the process of a Buffer Object (BO) from creation to mapping into the GPU address space.',
    difficulty: 'core',
    hints: [
      '从 4 级页表结构（PDB → PDE → PTE → Offset）出发',
      '关注 amdgpu_vm_bo_map 函数的作用',
      '说明 SDMA 更新页表和 TLB Flush 的必要性',
    ],
    hintsEn: [
      'Start with the 4-level page table structure (PDB → PDE → PTE → Offset)',
      'Focus on the amdgpu_vm_bo_map function',
      'Explain why SDMA page table updates and TLB Flush are necessary',
    ],
    referenceAnswer:
      'AMDGPU 为每个进程维护独立的 GPUVM 地址空间，使用 4 级页表：PDB（Page Directory Base）→ PDE（Page Directory）→ PTE（Page Table Entry）→ Offset。BO 创建流程：（1）用户空间通过 GEM ioctl 创建 BO，TTM 在 VRAM 或 GTT 中分配物理内存；（2）调用 amdgpu_vm_bo_map，驱动遍历 BO 对应的物理页面，在 PT 中填写 PTE 建立虚拟到物理映射；（3）使用 SDMA 引擎将更新后的页表从系统内存拷贝到 VRAM/GTT；（4）发送 TLB Flush 命令使旧的地址翻译缓存失效。每个进程的 GPUVM 相互隔离，GPU 通过 VMID 区分不同进程的地址空间。',
    referenceAnswerEn:
      'AMDGPU maintains an independent GPUVM address space per process using 4-level page tables: PDB → PDE → PTE → Offset. BO creation flow: (1) Userspace creates BO via GEM ioctl, TTM allocates physical memory in VRAM or GTT; (2) amdgpu_vm_bo_map traverses the BO\'s physical pages, filling PTEs to establish virtual-to-physical mappings; (3) SDMA engine copies updated page tables from system memory to VRAM/GTT; (4) TLB Flush command invalidates stale address translations. Each process\'s GPUVM is isolated; GPU uses VMID to distinguish address spaces.',
    relatedModuleIds: ['drm', 'amdgpu'],
  },
  {
    id: 'mq-2-dma-fence',
    phaseId: 'phase-3',
    question:
      'dma_fence 的工作原理是什么？当一个 GPU job 完成时，fence 是如何被 signal 的？CPU 端的等待者又是如何被唤醒的？',
    questionEn:
      'How does dma_fence work? When a GPU job completes, how is the fence signaled? How are CPU-side waiters woken up?',
    difficulty: 'core',
    hints: [
      '从 job 提交到 fence 创建开始',
      '关注 PM4 写 fence 值的包和中断触发',
      '说明 dma_fence_signal() 的唤醒机制',
    ],
    hintsEn: [
      'Start from job submission to fence creation',
      'Focus on PM4 fence-write packet and interrupt triggering',
      'Explain the dma_fence_signal() wakeup mechanism',
    ],
    referenceAnswer:
      '完整流程：（1）Job Submission：amdgpu_job 提交到 drm_gpu_scheduler 时，调度器创建 amdgpu_fence 并返回给用户空间（通过 drm_syncobj），fence 处于未触发状态；（2）Command Execution：GPU CP 执行命令流，驱动在末尾插入写 fence 值的 PM4 包；（3）Ring Signal：GPU 执行到写 fence 包时，将特定值写入 VRAM，触发中断；（4）Interrupt Handler：amdgpu_irq_handler 检测到 fence 中断，调用 dma_fence_signal() 标记 fence 为已触发；（5）Scheduler Wake-up：dma_fence_signal() 唤醒所有通过 wait_on_fence() 或 epoll 等待的线程。',
    referenceAnswerEn:
      'Full flow: (1) Job Submission: amdgpu_job submitted to drm_gpu_scheduler, which creates amdgpu_fence returned to userspace (via drm_syncobj), fence is unsignaled; (2) Command Execution: GPU CP executes command stream, driver inserts fence-write PM4 packet at end; (3) Ring Signal: GPU executes fence-write packet, writes specific value to VRAM, triggers interrupt; (4) Interrupt Handler: amdgpu_irq_handler detects fence interrupt, calls dma_fence_signal() marking fence as signaled; (5) Scheduler Wake-up: dma_fence_signal() wakes all threads waiting via wait_on_fence() or epoll.',
    relatedModuleIds: ['amdgpu', 'drm'],
    relatedLabId: 'lab-3-ftrace-fence',
  },
  {
    id: 'mq-3-user-queue',
    phaseId: 'phase-3',
    question:
      'GFX11 (RDNA3) 引入的 User Queue 相比传统的 Kernel Queue 有什么优势？它解决了什么问题？',
    questionEn:
      'What advantages does the User Queue introduced in GFX11 (RDNA3) have over traditional Kernel Queues? What problem does it solve?',
    difficulty: 'advanced',
    hints: [
      '对比传统 Kernel Queue 的命令提交路径（需要经过内核态）',
      '关注 MES (Micro Engine Scheduler) 的角色',
      '联系到 HSA/AQL 的零拷贝提交理念',
    ],
    hintsEn: [
      'Compare traditional Kernel Queue submission path (requires kernel transitions)',
      'Focus on MES (Micro Engine Scheduler) role',
      'Connect to HSA/AQL zero-copy submission philosophy',
    ],
    referenceAnswer:
      '传统 Kernel Queue：用户空间命令必须通过 amdgpu_cs_ioctl 进入内核态，由内核构建 PM4 包写入 Ring Buffer，再通过 doorbell 通知 GPU。每次提交都有系统调用开销（上下文切换、拷贝数据）。User Queue（GFX11+）：MES（Micro Engine Scheduler，GPU 上的微控制器）直接管理用户空间的命令队列。用户空间直接向 GPU 可见的队列内存写入命令（类似 HSA 的 AQL 包），无需内核参与，实现零拷贝提交。优势：（1）降低提交延迟——省去内核态往返；（2）减少 CPU 开销——无系统调用；（3）更好的并发——多线程可同时提交到不同队列。解决的问题：传统模式下 GPU 命令提交是串行化的瓶颈，User Queue 将调度逻辑下推到硬件层面。',
    referenceAnswerEn:
      'Traditional Kernel Queue: Userspace commands must enter kernel via amdgpu_cs_ioctl, where kernel builds PM4 packets into Ring Buffer and notifies GPU via doorbell. Each submission has syscall overhead (context switch, data copy). User Queue (GFX11+): MES (Micro Engine Scheduler, on-GPU microcontroller) directly manages userspace command queues. Userspace writes commands directly to GPU-visible queue memory (similar to HSA AQL packets) without kernel involvement—zero-copy submission. Advantages: (1) Lower submission latency; (2) Reduced CPU overhead; (3) Better concurrency. Solves: Traditional serialized GPU command submission bottleneck by pushing scheduling to hardware.',
    relatedModuleIds: ['amdgpu'],
  },
  {
    id: 'mq-4-psp-smu',
    phaseId: 'phase-4',
    question:
      'PSP (Platform Security Processor) 固件在 GPU 初始化过程中扮演了什么角色？它与 SMU 固件有什么区别？',
    questionEn:
      'What role does PSP (Platform Security Processor) firmware play during GPU initialization? How does it differ from SMU firmware?',
    difficulty: 'advanced',
    hints: [
      'PSP 是安全处理器，SMU 是电源管理处理器',
      'PSP 负责加载和验证其他固件',
      '描述初始化顺序：PSP → SMU → CP → RLC',
    ],
    hintsEn: [
      'PSP is the security processor, SMU is the power management processor',
      'PSP is responsible for loading and verifying other firmware',
      'Describe init order: PSP → SMU → CP → RLC',
    ],
    referenceAnswer:
      'PSP（Platform Security Processor）是 GPU 上的独立 ARM 微控制器，负责：（1）安全启动——验证所有固件的数字签名，防止恶意固件注入；（2）固件加载——PSP 是第一个被加载的固件，它负责加载和初始化其他所有固件（SMU、CP、RLC 等）；（3）IP Discovery——在 RDNA2+ 上，PSP 提供 IP Discovery Table 供驱动发现硬件 IP Block。SMU（System Management Unit）是另一个独立微控制器，专责动态电源管理：时钟频率调整（DPM）、电压调节、风扇控制、温度监控。区别：PSP 是安全核心（第一个启动，验证其他固件），SMU 是电源核心（由 PSP 加载后启动）。初始化顺序：PCI Probe → PSP FW → SMU FW → CP FW → RLC FW → IP Discovery → IP Block init。',
    referenceAnswerEn:
      'PSP (Platform Security Processor) is an independent ARM microcontroller on the GPU responsible for: (1) Secure boot—verifying digital signatures of all firmware; (2) Firmware loading—PSP loads first and initializes all other firmware (SMU, CP, RLC); (3) IP Discovery—on RDNA2+, PSP provides the IP Discovery Table. SMU (System Management Unit) is another independent microcontroller for dynamic power management: clock frequency (DPM), voltage, fan control, thermal monitoring. Difference: PSP is the security core (boots first, verifies others); SMU is the power core (loaded by PSP). Init order: PCI Probe → PSP FW → SMU FW → CP FW → RLC FW → IP Discovery → IP Block init.',
    relatedModuleIds: ['debugging', 'amdgpu'],
  },
  {
    id: 'mq-5-gpu-reset',
    phaseId: 'phase-4',
    question:
      '当发生 GPU Hang 时，amdgpu 驱动会尝试哪几种类型的 GPU Reset？它们的区别是什么？',
    questionEn:
      'When a GPU Hang occurs, what types of GPU Reset does the amdgpu driver attempt? What are the differences?',
    difficulty: 'core',
    hints: [
      '从最轻量到最重量排列',
      '关注 soft reset、mode1 reset、mode2 reset 的区别',
      '说明什么情况下会升级到更重的 reset 类型',
    ],
    hintsEn: [
      'Order from lightest to heaviest',
      'Focus on differences between soft reset, mode1 reset, mode2 reset',
      'Explain when the driver escalates to heavier reset types',
    ],
    referenceAnswer:
      'amdgpu 驱动按从轻到重的顺序尝试多种 Reset：（1）Soft Reset：仅重置发生 Hang 的 IP Block（如 GFX 引擎），不影响其他 IP。通过写 GRBM_SOFT_RESET 寄存器实现，最快但成功率最低；（2）Mode 1 Reset：通过 PSP 发送 reset 命令，重置整个 GPU 的 GFX/Compute 管线，但保持 PCIe 连接。需要重新初始化大部分 IP Block；（3）Mode 2 Reset：完整的 GPU Reset，通过 PCIe FLR（Function Level Reset）或 PSP 发送全局 reset。所有 GPU 状态丢失，需要完整重新初始化；（4）PCIe Bus Reset（fallback）：最后手段，重置整个 PCIe 链路。驱动通过 amdgpu_device_gpu_recover() 函数协调 reset 流程，先尝试 soft reset，失败则升级到 mode1，再失败升级到 mode2。每次 reset 都会生成 devcoredump 供调试。',
    referenceAnswerEn:
      'amdgpu driver attempts resets from lightest to heaviest: (1) Soft Reset: resets only the hung IP Block (e.g. GFX engine) without affecting others, via GRBM_SOFT_RESET register—fastest but lowest success rate; (2) Mode 1 Reset: PSP sends reset command to reset entire GFX/Compute pipeline while maintaining PCIe link, requires re-init of most IP Blocks; (3) Mode 2 Reset: full GPU reset via PCIe FLR or PSP global reset, all GPU state lost, complete re-initialization required; (4) PCIe Bus Reset (fallback): last resort, resets entire PCIe link. Driver coordinates via amdgpu_device_gpu_recover(), escalating from soft → mode1 → mode2. Each reset generates devcoredump for debugging.',
    relatedModuleIds: ['debugging'],
    relatedLabId: 'lab-2-gpu-hang',
  },
  {
    id: 'mq-6-ttm-eviction',
    phaseId: 'phase-2',
    question:
      'TTM 是如何决定将一个 BO 从 VRAM 中驱逐（evict）到 GTT 的？这个过程是如何触发的？',
    questionEn:
      'How does TTM decide to evict a BO from VRAM to GTT? How is this process triggered?',
    difficulty: 'core',
    hints: [
      '从 VRAM 内存压力触发说起',
      '关注 LRU（Least Recently Used）策略',
      '说明 DMA 数据搬运过程',
    ],
    hintsEn: [
      'Start with VRAM memory pressure as trigger',
      'Focus on LRU (Least Recently Used) strategy',
      'Explain the DMA data transfer process',
    ],
    referenceAnswer:
      '触发条件：当新的 BO 需要在 VRAM 中分配空间，但 VRAM 已满时，TTM 启动 eviction 流程。过程：（1）TTM 维护一个 per-domain 的 LRU（Least Recently Used）链表，记录所有 BO 的最近使用时间；（2）从 LRU 链表尾部选择最久未使用的 BO 作为 eviction 候选；（3）检查候选 BO 是否可迁移（未被 GPU 正在使用——通过 dma_fence 检查）；（4）调用 SDMA 引擎将 BO 的数据从 VRAM DMA 传输到 GTT（系统内存中 GPU 可访问的区域）；（5）更新 BO 的 placement 信息和 GPUVM 页表映射；（6）TLB Flush 使旧映射失效。整个过程对用户空间透明——BO 的 GEM handle 不变，只是底层存储位置改变了。当 GPU 再次需要这个 BO 时，TTM 会将其迁移回 VRAM（也可能触发其他 BO 的 eviction）。',
    referenceAnswerEn:
      'Trigger: When a new BO needs VRAM allocation but VRAM is full, TTM starts eviction. Process: (1) TTM maintains a per-domain LRU list tracking last-use time of all BOs; (2) Selects the least recently used BO from the LRU tail as eviction candidate; (3) Checks if candidate is migratable (not in use by GPU—verified via dma_fence); (4) SDMA engine DMA-transfers BO data from VRAM to GTT (GPU-accessible system memory); (5) Updates BO placement info and GPUVM page table mappings; (6) TLB Flush invalidates stale mappings. Transparent to userspace—GEM handle unchanged, only underlying storage location changes. When GPU needs the BO again, TTM migrates it back to VRAM (potentially triggering other evictions).',
    relatedModuleIds: ['drm'],
  },
];

export const phaseChecklists: PhaseChecklist[] = [
  {
    phaseId: 'phase-1',
    items: [
      { id: 'p1-c1', description: '能从 amdgpu_drv.c 追踪驱动注册和 PCI probe 流程', descriptionEn: 'Can trace driver registration and PCI probe flow from amdgpu_drv.c', category: 'code' },
      { id: 'p1-c2', description: '理解 amdgpu_device_init() 的完整初始化流程', descriptionEn: 'Understand the complete amdgpu_device_init() initialization flow', category: 'theory' },
      { id: 'p1-c3', description: '能解释 IP Block 的 sw_init/hw_init 生命周期', descriptionEn: 'Can explain IP Block sw_init/hw_init lifecycle', category: 'theory' },
      { id: 'p1-c4', description: '能编译自定义内核并在 virtme-ng 中测试', descriptionEn: 'Can compile a custom kernel and test in virtme-ng', category: 'experiment' },
      { id: 'p1-c5', description: '理解 IP Discovery 机制（RDNA2+）', descriptionEn: 'Understand IP Discovery mechanism (RDNA2+)', category: 'theory' },
      { id: 'p1-c6', description: '能在 IP Block 初始化代码中添加 printk 调试', descriptionEn: 'Can add printk debugging to IP Block init code', category: 'experiment' },
    ],
  },
  {
    phaseId: 'phase-2',
    items: [
      { id: 'p2-c1', description: '能画出 GPUVM 多级页表结构', descriptionEn: 'Can draw GPUVM multi-level page table structure', category: 'theory' },
      { id: 'p2-c2', description: '理解 GEM API 前端 + TTM 管理后端的双层架构', descriptionEn: 'Understand GEM API frontend + TTM management backend dual-layer architecture', category: 'theory' },
      { id: 'p2-c3', description: '能解释 BO 从创建到映射到 GPUVM 的完整过程', descriptionEn: 'Can explain complete BO creation to GPUVM mapping flow', category: 'theory' },
      { id: 'p2-c4', description: '理解 TTM 的 LRU eviction 机制', descriptionEn: 'Understand TTM LRU eviction mechanism', category: 'theory' },
      { id: 'p2-c5', description: '能阅读 amdgpu_vm.c 和 amdgpu_ttm.c 源码', descriptionEn: 'Can read amdgpu_vm.c and amdgpu_ttm.c source', category: 'code' },
    ],
  },
  {
    phaseId: 'phase-3',
    items: [
      { id: 'p3-c1', description: '能解释 Ring Buffer 的工作原理（WPTR/RPTR/doorbell）', descriptionEn: 'Can explain Ring Buffer mechanism (WPTR/RPTR/doorbell)', category: 'theory' },
      { id: 'p3-c2', description: '理解 drm_gpu_scheduler 的多队列调度', descriptionEn: 'Understand drm_gpu_scheduler multi-queue scheduling', category: 'theory' },
      { id: 'p3-c3', description: '能追踪 dma_fence 的完整生命周期', descriptionEn: 'Can trace complete dma_fence lifecycle', category: 'code' },
      { id: 'p3-c4', description: '使用 ftrace 追踪过 fence signal 事件', descriptionEn: 'Have traced fence signal events with ftrace', category: 'experiment' },
      { id: 'p3-c5', description: '理解 User Queue（GFX11+）与 Kernel Queue 的区别', descriptionEn: 'Understand User Queue (GFX11+) vs Kernel Queue differences', category: 'theory' },
    ],
  },
  {
    phaseId: 'phase-4',
    items: [
      { id: 'p4-c1', description: '能触发并分析 GPU Hang（使用 dmesg + devcoredump）', descriptionEn: 'Can trigger and analyze GPU Hang (dmesg + devcoredump)', category: 'debug' },
      { id: 'p4-c2', description: '理解 soft reset / mode1 / mode2 reset 的区别', descriptionEn: 'Understand soft/mode1/mode2 reset differences', category: 'theory' },
      { id: 'p4-c3', description: '能解释 PSP 和 SMU 固件的职责差异', descriptionEn: 'Can explain PSP vs SMU firmware responsibilities', category: 'theory' },
      { id: 'p4-c4', description: '能使用 umr 解析 devcoredump 数据', descriptionEn: 'Can use umr to parse devcoredump data', category: 'debug' },
      { id: 'p4-c5', description: '能描述固件加载的完整流程', descriptionEn: 'Can describe the complete firmware loading flow', category: 'theory' },
    ],
  },
  {
    phaseId: 'phase-5',
    items: [
      { id: 'p5-c1', description: '理解 LLVM 三段式编译架构（前端/中端/后端）', descriptionEn: 'Understand LLVM three-phase compilation (frontend/middle/backend)', category: 'theory' },
      { id: 'p5-c2', description: '能解释 VGPR 和 SGPR 的区别及 Uniformity Analysis', descriptionEn: 'Can explain VGPR vs SGPR differences and Uniformity Analysis', category: 'theory' },
      { id: 'p5-c3', description: '理解 RDNA3 ISA 指令格式（VOP/SOP/SMEM/VMEM）', descriptionEn: 'Understand RDNA3 ISA instruction formats (VOP/SOP/SMEM/VMEM)', category: 'theory' },
      { id: 'p5-c4', description: '能读懂 hipcc 编译输出的 AMDGPU 汇编', descriptionEn: 'Can read AMDGPU assembly from hipcc compilation output', category: 'code' },
      { id: 'p5-c5', description: '理解 Occupancy 与 VGPR 使用量的关系', descriptionEn: 'Understand Occupancy vs VGPR usage relationship', category: 'theory' },
    ],
  },
];

export function getMasteryQuestions(locale: Locale) {
  return masteryQuestions.map((q) => ({
    ...q,
    question: locale === 'en' ? q.questionEn : q.question,
    hints: locale === 'en' ? q.hintsEn : q.hints,
    referenceAnswer: locale === 'en' ? q.referenceAnswerEn : q.referenceAnswer,
  }));
}

export function getMasteryQuestionsByPhase(phaseId: string, locale: Locale) {
  return getMasteryQuestions(locale).filter((q) => q.phaseId === phaseId);
}

export function getPhaseChecklist(phaseId: string, locale: Locale) {
  const checklist = phaseChecklists.find((c) => c.phaseId === phaseId);
  if (!checklist) return [];
  return checklist.items.map((item) => ({
    ...item,
    description: locale === 'en' ? item.descriptionEn : item.description,
  }));
}

export function getAllChecklists(locale: Locale) {
  return phaseChecklists.map((c) => ({
    phaseId: c.phaseId,
    items: c.items.map((item) => ({
      ...item,
      description: locale === 'en' ? item.descriptionEn : item.description,
    })),
  }));
}
