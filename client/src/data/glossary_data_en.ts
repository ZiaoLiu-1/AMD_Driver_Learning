// AMD Linux Driver Learning Platform - Glossary Data (English)
// English glossary for each module

import type { GlossaryTerm } from './curriculum';

export const glossaryByModuleEn: Record<string, GlossaryTerm[]> = {
  intro: [
    { abbr: 'GPU', fullEn: 'Graphics Processing Unit', zhName: 'graphicsprocessor', description: 'Processor specialized for parallel graphics and compute; the core of AMD Radeon GPUs.', category: 'hardware' },
    { abbr: 'LKML', fullEn: 'Linux Kernel Mailing List', zhName: 'Linux kernel邮件list', description: 'Primary Linux kernel development collaboration platform for patches and discussion.', category: 'kernel' },
    { abbr: 'KMS', fullEn: 'Kernel Mode Setting', zhName: 'kernelmode setting', description: 'Mechanism for configuring display resolution and color depth in kernel space.', category: 'graphics' },
    { abbr: 'DRM', fullEn: 'Direct Rendering Manager', zhName: 'directlyrendermanager', description: 'Linux kernel subsystem for GPU resource management and multi-process coordination.', category: 'graphics' },
    { abbr: 'ROCm', fullEn: 'Radeon Open Compute platform', zhName: 'Radeon 开放compute平台', description: 'AMD open-source GPU compute platform for AI/HPC, analogous to NVIDIA CUDA.', category: 'compute' },
    { abbr: 'LLVM', fullEn: 'Low Level Virtual Machine', zhName: '底层virtual machine', description: 'Modular compiler infrastructure; core tool for AMD GPU shader compilation.', category: 'toolchain' },
    { abbr: 'API', fullEn: 'Application Programming Interface', zhName: 'applicationprogramprogramminginterface', description: 'Interface specification for software interaction, e.g. Vulkan, OpenGL.', category: 'general' },
    { abbr: 'KVM', fullEn: 'Kernel-based Virtual Machine', zhName: 'based onkernelvirtual machine', description: 'Linux in-kernel virtualization for safe kernel experimentation.', category: 'kernel' },
  ],
  ecosystem: [
    { abbr: 'RDNA', fullEn: 'Radeon DNA', zhName: 'Radeon DNA architecture', description: 'AMD modern graphics architecture for consumer GPUs since 2019; RDNA3 powers RX 7000 series.', category: 'hardware' },
    { abbr: 'GCN', fullEn: 'Graphics Core Next', zhName: 'graphicscorebelow一代', description: 'AMD GPU architecture 2012–2019; amdgpu legacy code originates here.', category: 'hardware' },
    { abbr: 'CDNA', fullEn: 'Compute DNA', zhName: 'compute DNA architecture', description: 'AMD datacenter AI/HPC GPU architecture for Instinct MI series.', category: 'hardware' },
    { abbr: 'APU', fullEn: 'Accelerated Processing Unit', zhName: 'accelerateprocessor', description: 'AMD product combining CPU and GPU on one chip, e.g. Ryzen 7000 iGPU.', category: 'hardware' },
    { abbr: 'HBM', fullEn: 'High Bandwidth Memory', zhName: '高带宽memory', description: 'Stacked DRAM with high bandwidth; used in Instinct MI datacenter GPUs.', category: 'hardware' },
    { abbr: 'GDDR', fullEn: 'Graphics Double Data Rate', zhName: 'graphics双倍data速率memory', description: 'GPU-oriented fast VRAM; RX 7600 XT uses GDDR6.', category: 'hardware' },
    { abbr: 'CU', fullEn: 'Compute Unit', zhName: 'compute unit', description: 'AMD GPU basic compute block; RX 7600 XT has 32 CUs.', category: 'hardware' },
    { abbr: 'IP', fullEn: 'Intellectual Property (block)', zhName: 'IP module', description: 'GPU functional block; amdgpu code is organized by IP (GFX, DCN, VCN).', category: 'hardware' },
    { abbr: 'gfx1102', fullEn: 'Graphics IP version 11.0.2', zhName: 'graphics IP 11.0.2 version', description: 'Kernel code identifier for RX 7600 XT (Navi33); selects firmware and init code.', category: 'hardware' },
    { abbr: 'Mesa', fullEn: 'Mesa 3D Graphics Library', zhName: 'Mesa 3D graphics库', description: 'Open-source userspace library for OpenGL/Vulkan; AMD uses radeonsi and radv.', category: 'graphics' },
  ],
  prerequisites: [
    { abbr: 'MMU', fullEn: 'Memory Management Unit', zhName: 'memorymanagement单元', description: 'CPU hardware that translates virtual to physical addresses.', category: 'hardware' },
    { abbr: 'TLB', fullEn: 'Translation Lookaside Buffer', zhName: '转译after备缓冲器', description: 'MMU cache for recent address translations.', category: 'hardware' },
    { abbr: 'MESI', fullEn: 'Modified Exclusive Shared Invalid', zhName: 'modify-独占-shared-invalidprotocol', description: 'CPU multicore cache coherence protocol.', category: 'hardware' },
    { abbr: 'ISA', fullEn: 'Instruction Set Architecture', zhName: 'instruction集architecture', description: 'Processor instruction set; e.g. x86-64, GCN/RDNA.', category: 'hardware' },
    { abbr: 'ABI', fullEn: 'Application Binary Interface', zhName: 'applicationprogram二进制interface', description: 'Convention for calls, types, alignment; kernel modules must match kernel ABI.', category: 'kernel' },
    { abbr: 'GFP', fullEn: 'Get Free Pages', zhName: 'getidle页', description: 'Flags for kernel allocation: GFP_KERNEL (may sleep), GFP_ATOMIC (may not).', category: 'kernel' },
  ],
  hardware: [
    { abbr: 'PCIe', fullEn: 'Peripheral Component Interconnect Express', zhName: '高速outside设互联总线', description: 'High-speed serial bus for GPU connection; RX 7600 XT uses PCIe 4.0 x16.', category: 'hardware' },
    { abbr: 'BAR', fullEn: 'Base Address Register', zhName: '基addressregister', description: 'PCIe config register defining MMIO and I/O address ranges.', category: 'hardware' },
    { abbr: 'MMIO', fullEn: 'Memory-Mapped I/O', zhName: 'memorymap I/O', description: 'Hardware registers mapped into memory address space for CPU access.', category: 'hardware' },
    { abbr: 'DMA', fullEn: 'Direct Memory Access', zhName: 'directlymemory访问', description: 'GPU access to system memory without CPU involvement.', category: 'hardware' },
    { abbr: 'IOMMU', fullEn: 'Input-Output Memory Management Unit', zhName: 'I/O memorymanagement单元', description: 'Translates device addresses; AMD variant is AMD-Vi.', category: 'hardware' },
    { abbr: 'MSI', fullEn: 'Message Signaled Interrupts', zhName: 'message信号in断', description: 'Interrupts triggered by memory writes; GPUs use MSI-X.', category: 'hardware' },
  ],
  kernel: [
    { abbr: 'VFS', fullEn: 'Virtual File System', zhName: 'virtualfilesystem', description: 'Kernel layer abstracting file systems.', category: 'kernel' },
    { abbr: 'LKM', fullEn: 'Loadable Kernel Module', zhName: 'canloadkernelmodule', description: 'Dynamically loadable kernel code; amdgpu is an LKM.', category: 'kernel' },
    { abbr: 'PCI', fullEn: 'Peripheral Component Interconnect', zhName: 'outside设互联总线', description: 'Predecessor of PCIe; pci_driver used for PCI/PCIe devices.', category: 'hardware' },
    { abbr: 'sysfs', fullEn: 'System Filesystem', zhName: 'systemfilesystem', description: 'Virtual filesystem exposing devices in /sys.', category: 'kernel' },
    { abbr: 'spinlock', fullEn: 'Spin Lock', zhName: '自旋锁', description: 'Busy-wait lock for short sections; cannot sleep while holding.', category: 'kernel' },
  ],
  drm: [
    { abbr: 'GEM', fullEn: 'Graphics Execution Manager', zhName: 'graphicsexecutemanager', description: 'DRM framework for GPU memory objects.', category: 'graphics' },
    { abbr: 'TTM', fullEn: 'Translation Table Manager', zhName: 'convert表manager', description: 'Lower-level DRM memory manager for migrating buffers between VRAM and GTT.', category: 'graphics' },
    { abbr: 'BO', fullEn: 'Buffer Object', zhName: 'bufferobject', description: 'Basic GPU memory allocation unit.', category: 'graphics' },
    { abbr: 'CRTC', fullEn: 'Cathode Ray Tube Controller', zhName: 'displaycontroller', description: 'KMS object for display scanout.', category: 'graphics' },
  ],
  amdgpu: [
    { abbr: 'IB', fullEn: 'Indirect Buffer', zhName: 'between接buffer', description: 'Storage for GPU command list; core of command submission.', category: 'graphics' },
    { abbr: 'CS', fullEn: 'Command Submission', zhName: 'commandsubmit', description: 'Process of submitting GPU commands via DRM_IOCTL_AMDGPU_CS.', category: 'graphics' },
    { abbr: 'VRAM', fullEn: 'Video Random Access Memory', zhName: '显存', description: 'GPU onboard fast memory; RX 7600 XT has 16GB GDDR6.', category: 'hardware' },
    { abbr: 'DC', fullEn: 'Display Core', zhName: 'displaycore', description: 'amdgpu submodule for display output; implements KMS.', category: 'graphics' },
    { abbr: 'SDMA', fullEn: 'System DMA', zhName: 'system DMA engine', description: 'AMD GPU DMA engine for VRAM–system memory transfers.', category: 'hardware' },
  ],
  debugging: [
    { abbr: 'ftrace', fullEn: 'Function Tracer', zhName: 'functiontrace器', description: 'Kernel tracing framework for calls, latency, events.', category: 'kernel' },
    { abbr: 'perf', fullEn: 'Performance Analysis Tools', zhName: 'performance analysistool', description: 'Linux performance profiling toolset.', category: 'toolchain' },
    { abbr: 'GPU Hang', fullEn: 'GPU Hang / GPU Reset', zhName: 'GPU hang/reset', description: 'GPU unresponsive state; amdgpu detects and resets; key debugging skill.', category: 'graphics' },
    { abbr: 'rocprof', fullEn: 'ROCm Profiler', zhName: 'ROCm performance analysis器', description: 'AMD ROCm GPU profiler for HIP programs.', category: 'compute' },
  ],
  'rocm-kernel': [
    { abbr: 'KFD', fullEn: 'Kernel Fusion Driver', zhName: 'kernel融合driver', description: 'amdgpu component for ROCm/HSA; exposes /dev/kfd.', category: 'compute' },
    { abbr: 'HSA', fullEn: 'Heterogeneous System Architecture', zhName: '异构system architecture', description: 'CPU–GPU unified memory and programming model; ROCm implements it.', category: 'compute' },
    { abbr: 'SVM', fullEn: 'Shared Virtual Memory', zhName: 'sharedvirtualmemory', description: 'CPU and GPU sharing the same virtual addresses.', category: 'compute' },
  ],
  'rocm-compute': [
    { abbr: 'HIP', fullEn: 'Heterogeneous-Compute Interface for Portability', zhName: '异构computecan移植interface', description: 'AMD GPU programming model; CUDA-like; runs on AMD and NVIDIA.', category: 'compute' },
    { abbr: 'wavefront', fullEn: 'Wavefront (AMD) / Warp (NVIDIA)', zhName: '波before/thread束', description: 'AMD GPU execution unit; 64 threads; execute same instruction together.', category: 'compute' },
    { abbr: 'LDS', fullEn: 'Local Data Share', zhName: 'localdatashared', description: 'Workgroup shared memory; analogous to CUDA shared memory.', category: 'compute' },
  ],
  llvm: [
    { abbr: 'IR', fullEn: 'Intermediate Representation', zhName: 'inbetweenindicate', description: 'LLVM intermediate language between source and machine code.', category: 'toolchain' },
    { abbr: 'ISA', fullEn: 'Instruction Set Architecture', zhName: 'instruction集architecture', description: 'GPU machine instruction set; GCN/RDNA ISA.', category: 'hardware' },
  ],
  testing: [
    { abbr: 'IGT', fullEn: 'Intel GPU Tools', zhName: 'Intel GPU testtool', description: 'GPU driver test suite; used by amdgpu development.', category: 'toolchain' },
    { abbr: 'CI', fullEn: 'Continuous Integration', zhName: '持续integration', description: 'Automated build and test for patches.', category: 'toolchain' },
  ],
  career: [
    { abbr: 'SoB', fullEn: 'Signed-off-by', zhName: '签署人', description: 'Required kernel patch tag for legal/code responsibility.', category: 'kernel' },
    { abbr: 'drm-next', fullEn: 'DRM Next Branch', zhName: 'DRM below一versionbranch', description: 'DRM staging branch for next kernel release.', category: 'kernel' },
    { abbr: 'amd-gfx', fullEn: 'AMD Graphics Mailing List', zhName: 'AMD graphics邮件list', description: 'Primary amdgpu list: amd-gfx@lists.freedesktop.org.', category: 'kernel' },
  ],
};
