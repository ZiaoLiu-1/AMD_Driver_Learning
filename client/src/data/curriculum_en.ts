// ============================================================
// AMD Linux Driver Learning Platform - Curriculum Data (English)
// English translation of the curriculum
// ============================================================
import type { Module } from './curriculum';
import { ecosystemModuleEn } from './ecosystem_module_en';

export const curriculumEn: Module[] = [
  {
    id: 'intro',
    number: '0',
    title: 'Introduction & Learning Path',
    titleEn: 'Introduction & Learning Path',
    icon: 'Rocket',
    description:
      'Understand the goals, value, and structure of this learning path. Set your objective: become an engineer capable of submitting AMD GPU driver patches to the Linux kernel.',
    estimatedHours: 2,
    difficulty: 'beginner',
    subModules: [
      { id: 'intro-goal', title: 'Goals & Outcomes', titleEn: 'Goals & Outcomes' },
      { id: 'intro-overview', title: 'Path Overview', titleEn: 'Path Overview' },
      { id: 'intro-setup', title: 'Environment Setup', titleEn: 'Environment Setup' },
    ],
    theory: {
      overview:
        'This learning path aims to take you from a Linux user to a kernel engineer who can understand, debug, and contribute to the AMD GPU driver (amdgpu). Any AMD GPU (RDNA or GCN) in your hands is your best learning tool. The path is divided into 11 modules, with an estimated total learning time of 400–600 hours (6–12 months, depending on your background and commitment).',
      sections: [
        {
          title: 'Why Choose AMD GPU Driver Development?',
          content:
            'The AMD GPU driver stack (amdgpu) is one of the most complex and active subsystems in the Linux kernel. The entire stack is fully open source, from kernel driver to userspace ROCm compute framework, providing unmatched transparency for learning. AMD Markham (Canada) is one of AMD\'s primary GPU driver development centers, with many kernel engineer positions. Mastering the skills on this path will make you a highly competitive candidate. The amdgpu driver exceeds 4 million lines (drivers/gpu/drm/amd/), one of the largest single subsystems in the Linux kernel. It includes Display Core (DC), Graphics/Compute (GFX), DMA engine (SDMA), video codec (VCN/JPEG), power management (SMU), and more IP Blocks, each maintained by independent teams.',
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
            caption:
              'amdgpu is the largest single driver subsystem in the Linux kernel. Its fully open-source nature makes it the best choice for learning GPU driver development.',
          },
        },
        {
          title: 'Learning Path Overview',
          content:
            'Upon completing this path, you will be able to: (1) Read and understand amdgpu driver source code independently; (2) Use ftrace, perf, and similar tools to analyze GPU performance issues; (3) Analyze complex failures such as GPU Hang; (4) Write patches that conform to Linux kernel coding standards and submit them to LKML; (5) Write GPU compute programs using HIP; (6) Understand the LLVM AMDGPU backend compilation flow. The path is organized by dependencies: first build foundations (C, Linux, computer architecture), then dive into kernel frameworks (DRM), then tackle amdgpu core, and finally extend to ROCm compute and toolchain.',
          diagram: {
            type: 'ascii',
            content: `Learning Path Module Dependencies

Phase 1: Basics    Phase 2: Kernel    Phase 3: Driver    Phase 4: Advanced
(~80h)             (~90h)            (~100h)            (~200h)

┌──────────┐
│ M0: Intro│─────┐
│ (2h)     │     │
└──────────┘     │
                 ▼
┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
│ M0.5:    │  │M3:Kernel │  │ M5:AMDGPU│  │ M7: ROCm │
│Ecosystem │→ │ Dev      │→ │ Driver   │→ │Kernel IF │
│ (8h)     │  │ (30h)    │  │ (60h)    │  │ (40h)    │
└──────────┘  └────┬─────┘  └────┬─────┘  └────┬────┘
                   │             │              │
┌──────────┐  ┌────▼─────┐  ┌────▼─────┐  ┌────▼─────┐
│ M1: Prep │  │ M4: DRM │  │ M6: Debug│  │ M8: ROCm │
│ Prereqs  │→ │ Subsys   │→ │ (40h)    │  │ Compute  │
│ (40h)    │  │ (60h)    │  └──────────┘  │ (50h)    │
└──────────┘  └──────────┘                └────┬────┘
                                               │
┌──────────┐                              ┌────▼─────┐
│ M2: HW   │                              │ M9: LLVM │
│Interface │                              │Toolchain │
│ (40h)    │                              │ (60h)    │
└──────────┘                              └────┬────┘
                                               │
              ┌──────────┐  ┌──────────┐  ┌────▼─────┐
              │ M10:Test │  │M11:Career│← │ All Mods │
              │ (30h)    │  │ (30h)    │  │ Converge │
              └──────────┘  └──────────┘  └──────────┘`,
            caption:
              'Module dependencies of the learning path. Arrows indicate recommended order. M10 and M11 are hands-on modules throughout the path.',
          },
        },
        {
          title: 'Kernel Driver Stack Overview',
          content:
            'Before starting, build a key mental model: the layered structure of the Linux kernel driver stack. From userspace applications to GPU hardware, several software layers sit in between. Each layer has its own responsibility and interface. Userspace programs communicate with the kernel via system calls (ioctl); the kernel DRM subsystem provides a generic GPU management framework; the amdgpu driver is a concrete DRM implementation that translates abstract DRM operations into register writes and command packets the GPU hardware understands. Understanding this layering is the foundation for all subsequent modules.',
          diagram: {
            type: 'ascii',
            content: `Linux GPU Kernel Driver Stack

┌─────────────────────────────────────────────────────────────┐
│ User Space                                                   │
│  Applications (Games / AI Training / Video Editing)          │
│       │  Graphics API (OpenGL / Vulkan / HIP)                 │
│       │  Userspace Drivers (Mesa radeonsi / radv / ROCr)      │
│       │  libdrm (wraps ioctl calls)                           │
├───────┼──────────────────────────────────────────────────────┤
│       │  Syscall Boundary (ioctl / mmap / read / write)      │
├───────┼──────────────────────────────────────────────────────┤
│ Kernel Space                                                 │
│       ▼  DRM Core → amdgpu Driver                             │
├───────┼──────────────────────────────────────────────────────┤
│       │  MMIO / PCIe                                         │
├───────┼──────────────────────────────────────────────────────┤
│       ▼  GPU Hardware (RX 7600 XT / Navi33 / gfx1102)        │
└─────────────────────────────────────────────────────────────┘`,
            caption:
              'Linux GPU driver stack. Each layer maps to one or more modules in the learning path. This diagram is the "map" for your entire learning journey.',
          },
        },
        {
          title: 'Development Environment Setup',
          content:
            'You will need: a machine running Ubuntu 22.04 LTS or Arch Linux (any AMD GPU is suitable test hardware; RDNA2/3 preferred); development tools such as linux-headers, build-essential, git, clang, llvm; a Linux kernel source tree clone (~3GB); ROCm development kit. Consider using a KVM VM for risky kernel experiments to avoid damaging the host. Key toolchain: (1) kernel build: gcc/clang + make/kbuild; (2) code navigation: cscope + ctags or VS Code + clangd; (3) debugging: ftrace + perf + trace-cmd; (4) GPU monitoring: amdgpu_top + radeontop; (5) version control: git + git send-email (for kernel patch submission).',
        },
      ],
      keyBooks: [
        {
          title: 'Linux Kernel Development',
          author: 'Robert Love',
          isbn: '978-0672329463',
          relevance:
            'Best introduction to kernel development, covering architecture, process management, memory management, and core concepts.',
          url: 'https://www.amazon.com/Linux-Kernel-Development-Robert-Love/dp/0672329468',
        },
        {
          title: 'Linux Device Drivers, 3rd Edition',
          author: 'Jonathan Corbet, Alessandro Rubini, Greg Kroah-Hartman',
          isbn: '978-0596005900',
          relevance:
            'The classic driver development book; core concepts remain valid. Free to read on LWN.net.',
          url: 'https://docs.kernel.org/driver-api/index.html',
        },
        {
          title: 'Understanding the Linux Kernel',
          author: 'Daniel P. Bovet, Marco Cesati',
          isbn: '978-0596005658',
          relevance:
            'Deep dive into kernel internals, including memory management, process scheduling, and interrupt handling.',
        },
      ],
      onlineResources: [
        {
          title: 'The Linux Kernel Documentation',
          url: 'https://docs.kernel.org',
          type: 'doc',
          description: 'Official kernel documentation, including detailed AMDGPU driver material.',
        },
        {
          title: 'AMD GPU Driver Source Code',
          url: 'https://github.com/torvalds/linux/tree/master/drivers/gpu/drm/amd',
          type: 'repo',
          description: 'amdgpu driver location in the Linux kernel source.',
        },
        {
          title: 'LWN.net - Linux Weekly News',
          url: 'https://lwn.net',
          type: 'doc',
          description:
            'Authoritative Linux kernel community news and technical articles, including DRM/GPU driver analysis.',
        },
        {
          title: 'Phoronix - AMD Linux Coverage',
          url: 'https://www.phoronix.com/review/amd-linux-2024',
          type: 'doc',
          description:
            'Active Linux hardware news site with close coverage of AMD driver development.',
        },
      ],
    },
    codeReading: [
      {
        title: 'Check Your GPU Information',
        description:
          'Use system tools to verify RX 7600 XT is correctly detected and view driver load status.',
        file: 'terminal',
        language: 'bash',
        code: `# List PCI devices, find your AMD GPU
lspci -v | grep -A 10 "VGA\\|3D\\|Display"

# Check if amdgpu module is loaded
lsmod | grep amdgpu

# View amdgpu init messages in kernel log
dmesg | grep -i amdgpu | head -30

# View GPU details
cat /sys/class/drm/card0/device/vendor
cat /sys/class/drm/card0/device/device

# Install and run amdgpu_top to monitor GPU
# sudo apt install amdgpu-top  (or build from source)
# amdgpu_top`,
        annotations: [
          'lspci shows all PCI devices; GPU typically appears as VGA compatible or Display controller',
          'lsmod lists loaded kernel modules; amdgpu should be present',
          'dmesg contains amdgpu init logs at boot—this is the first debugging step',
          '/sys/class/drm/ exposes DRM subsystem interfaces to userspace',
        ],
      },
      {
        title: 'amdgpu Driver Initialization Entry',
        description:
          'Inspect the amdgpu driver entry amdgpu_pci_probe to understand how the driver initializes your GPU at boot.',
        file: 'drivers/gpu/drm/amd/amdgpu/amdgpu_drv.c',
        language: 'c',
        code: `/* amdgpu_drv.c — amdgpu PCI entry point
 * Kernel calls this when a matching PCI device is found
 * This is the starting point to trace driver initialization
 */

/* PCI device ID table: tells kernel which GPUs this driver supports */
static const struct pci_device_id pciidlist[] = {
    /* NAVI33 — Your RX 7600 XT */
    {0x1002, 0x7480, PCI_ANY_ID, PCI_ANY_ID, 0, 0, CHIP_NAVI33},
    /* 0x1002 = AMD Vendor ID, 0x7480 = Navi33 Device ID */

    /* NAVI31 — RX 7900 XTX */
    {0x1002, 0x744C, PCI_ANY_ID, PCI_ANY_ID, 0, 0, CHIP_NAVI31},
    {0, 0, 0}  /* terminator */
};
MODULE_DEVICE_TABLE(pci, pciidlist);

/* GPU init entry — called once per GPU */
static int amdgpu_pci_probe(struct pci_dev *pdev,
                             const struct pci_device_id *ent)
{
    /* 1. Enable PCI device */
    ret = pci_enable_device(pdev);
    if (ret)
        return ret;

    /* 2. Set DMA mask (GPU needs access to all physical memory) */
    pci_set_master(pdev);

    /* 3. Allocate DRM device structure */
    ddev = drm_dev_alloc(&amdgpu_kms_driver, &pdev->dev);

    /* 4. Init amdgpu device (core init) */
    adev = drm_to_adev(ddev);
    ret = amdgpu_device_init(adev, flags);
    /* → Initializes IP Blocks: GFX, SDMA, DC, VCN... */

    return 0;
}`,
        annotations: [
          '0x1002 is AMD PCI Vendor ID; 0x7480 is RX 7600 XT (Navi33) Device ID',
          'CHIP_NAVI33 selects the corresponding IP Block implementation (gfx_v11_0, sdma_v6_0, etc.)',
          'amdgpu_pci_probe is the driver init entry; trace from here to understand the boot flow',
          'amdgpu_device_init is the core init; it probes and initializes each IP Block',
          'The "amdgpu: initializing..." message in dmesg comes from this flow',
        ],
      },
    ],
    miniProject: {
      title: 'Set Up Your Learning Journal',
      description:
        'Create a GitHub repository to record your learning. This will become your core portfolio for AMD applications.',
      objectives: [
        'Create a public GitHub repo named amd-driver-journey',
        'Document your GPU info and system config',
        'Write down your learning goals and schedule',
      ],
      steps: [
        'Create a new public repo amd-driver-journey on GitHub',
        'Add README.md with your GPU model (e.g. RX 7600 XT / RX 7900 XTX) and goals',
        'Create journal/ and start daily notes',
        'Save lspci and dmesg output to hardware-info.txt',
      ],
      expectedOutput:
        'A public GitHub repository with your GPU info and study plan—the first step on your path to becoming an AMD engineer.',
      githubTemplate: 'https://github.com/torvalds/linux',
    },
    interviewQuestions: [
      {
        question: 'Tell us about your AMD GPU driver learning journey and motivation.',
        difficulty: 'easy',
        hint: 'Open-ended; emphasize enthusiasm, path, and concrete results (patches, projects).',
        answer:
          'Key points: (1) State your hardware (RX 7600 XT); (2) Describe modules you studied (DRM, AMDGPU, ROCm); (3) Show concrete work (GitHub, patches, bug analysis); (4) Express enthusiasm for AMD\'s open ecosystem.',
      },
      {
        question: 'What are the main differences between a Linux kernel driver and a userspace program?',
        difficulty: 'easy',
        hint: 'Consider memory space, privileges, error handling, and available libraries.',
        answer:
          'Kernel drivers run in kernel space (Ring 0) with full privileges and direct hardware access; no standard C library (no malloc/printf); errors can cause kernel panic; use kmalloc/kfree; output via printk. Userspace runs in Ring 3, accesses kernel via syscalls, and failures affect only the process.',
      },
      {
        question: 'Describe the layered GPU driver architecture from an OpenGL call in userspace to GPU hardware execution.',
        difficulty: 'medium',
        hint: 'Path: Mesa → libdrm → ioctl → DRM core → amdgpu → MMIO → GPU hardware.',
        answer:
          'Path: (1) App calls OpenGL/Vulkan; (2) Mesa (radeonsi/radv) converts to GPU commands and uses libdrm ioctls; (3) ioctl enters kernel, DRM core routes to handlers; (4) amdgpu ioctl handler validates and submits to Ring Buffer; (5) driver writes Doorbell via MMIO to signal GPU; (6) GPU CP reads PM4 packets from Ring; (7) GPU signals fence when done.',
      },
      {
        question: 'amdgpu is the largest single driver in the Linux kernel. How is its code organized?',
        difficulty: 'medium',
        hint: 'Consider IP Block layout, file naming, and key directories.',
        answer:
          'amdgpu uses IP Block organization. Each hardware module has its own file, named <ip>_v<maj>_<min>.c (e.g. gfx_v11_0.c for RDNA3). Key dirs: amdgpu/ (core), display/dc/ (Display Core), amdkfd/ (ROCm kernel interface), pm/ (power), include/ (registers). Each IP implements init/fini/suspend/resume callbacks managed by amdgpu_device.c.',
      },
      {
        question: 'What is PCIe BAR (Base Address Register)? How does the GPU driver use it to talk to the GPU?',
        difficulty: 'hard',
        hint: 'Focus on MMIO mapping and BAR types (VRAM BAR, Register BAR, Doorbell BAR).',
        answer:
          'PCIe BAR is a physical address window the GPU exposes. Driver uses: BAR 0 (VRAM), BAR 2 (Register/MMIO), BAR 4 (Doorbell). ioremap maps these into kernel virtual address; writel/readl control the GPU.',
      },
    ],
  },
  ecosystemModuleEn,
  {
    id: 'prerequisites',
    number: '1',
    title: 'Prerequisites',
    titleEn: 'Prerequisites',
    icon: '⚙️',
    description:
      'Build three foundations: C/C++ programming, Linux toolchain, and computer architecture. These are essential for understanding any driver code.',
    estimatedHours: 80,
    difficulty: 'beginner',
    subModules: [
      { id: 'prereq-c', title: '1.1 C/C++ Programming Core', titleEn: 'C/C++ Programming Core' },
      { id: 'prereq-tools', title: '1.2 Linux Toolchain', titleEn: 'Linux Toolchain' },
      { id: 'prereq-arch', title: '1.3 Computer Architecture', titleEn: 'Computer Architecture' },
    ],
    theory: {
      overview:
        'Driver development is primarily C; C++ appears in some userspace tools. You need solid understanding of pointers, memory model, and bit operations. Linux toolchain (Git, Make, GDB) and computer architecture (cache, virtual memory, interrupts) are core topics for AMD interviews.',
      sections: [
        {
          title: 'C: Pointers and Memory Model',
          content:
            'Kernel code makes heavy use of pointers—function pointers, void pointers, and struct pointers. You must understand: stack vs heap; pointer arithmetic; struct layout and alignment; bit fields and bit manipulation. For example, amdgpu register access looks like: WREG32(mmSRBM_GFX_CNTL, (vmid << SRBM_GFX_CNTL__VMID__SHIFT))—you need to understand shifts and masks.',
        },
      ],
      keyBooks: [
        {
          title: 'The C Programming Language (K&R)',
          author: 'Brian W. Kernighan, Dennis M. Ritchie',
          isbn: '978-0131103627',
          relevance: 'The authoritative C text; kernel style is influenced by it. Essential.',
        },
        {
          title: 'Computer Organization and Design RISC-V Edition',
          author: 'David A. Patterson, John L. Hennessy',
          isbn: '978-0128203316',
          relevance: 'Authoritative computer architecture; cache, pipeline, and memory hierarchy.',
        },
        {
          title: 'Understanding the Linux Kernel',
          author: 'Daniel P. Bovet, Marco Cesati',
          isbn: '978-0596005658',
          relevance: 'Deep dive into kernel memory management, scheduling, and filesystems.',
        },
      ],
      onlineResources: [
        {
          title: 'Linux Kernel Coding Style',
          url: 'https://docs.kernel.org/process/coding-style.html',
          type: 'doc',
          description: 'Linux kernel official coding style; must follow before submitting patches.',
        },
        {
          title: 'Git send-email Tutorial',
          url: 'https://git-send-email.io',
          type: 'doc',
          description: 'Learn how to send patches to the kernel mailing list with git send-email.',
        },
      ],
    },
    codeReading: [],
    miniProject: {
      title: 'Write a Kernel Module: Read CPU Info',
      description:
        'Write your first Linux kernel module that reads and prints CPU information on load. Your first step into kernel space.',
      objectives: [
        'Understand basic module structure (init/exit)',
        'Use printk for kernel log output',
        'Use insmod/rmmod and dmesg',
      ],
      steps: [
        'Create hello_kernel.c with module_init and module_exit',
        'Add a Makefile using the kernel build system',
        'Load with sudo insmod hello_kernel.ko',
        'Check output with dmesg | tail',
        'Unload with sudo rmmod hello_kernel',
      ],
      expectedOutput:
        'A loadable kernel module that prints "Hello, AMD Driver World!" and CPU model info in dmesg.',
    },
    interviewQuestions: [
      {
        question: 'Explain Cache Coherence and its impact on GPU drivers.',
        difficulty: 'hard',
        hint: 'Start from MESI and relate to DMA buffer management.',
        answer:
          'In multicore systems, each CPU has its own L1/L2 cache. CPU writes may stay in cache; if the GPU then DMA-reads that memory, it sees stale data. Solutions: dma_sync_single_for_device() after CPU write; dma_sync_single_for_cpu() after GPU write. MESI handles CPU–CPU coherence; CPU–GPU coherence must be handled explicitly by the driver.',
      },
    ],
  },
  // ═══════════════════════════════════════════════════════════════
  // Module 1.5 — Real-Time Graphics APIs & GPU Architecture
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'graphics-apis',
    number: '1.5',
    title: 'Real-Time Graphics APIs & GPU Architecture',
    titleEn: 'Real-Time Graphics APIs & GPU Architecture',
    icon: 'Monitor',
    description:
      'Understand how GPUs are actually used — from the application developer perspective. Real-time rendering pipeline, OpenGL, Vulkan, OpenCL, and DirectX 12 concepts. Knowing this layer makes you understand what the driver ultimately serves.',
    estimatedHours: 30,
    difficulty: 'intermediate',
    subModules: [
      { id: 'gfx-pipeline', title: '1.5.1 Real-Time Rendering Pipeline', titleEn: 'Real-Time Rendering Pipeline' },
      { id: 'gfx-opengl', title: '1.5.2 OpenGL State Machine', titleEn: 'OpenGL State Machine' },
      { id: 'gfx-vulkan', title: '1.5.3 Vulkan: Modern Explicit API', titleEn: 'Vulkan: Modern Explicit API' },
      { id: 'gfx-opencl', title: '1.5.4 OpenCL Compute Model', titleEn: 'OpenCL Compute Model' },
      { id: 'gfx-dx12', title: '1.5.5 DirectX 12 Concepts & Comparison', titleEn: 'DirectX 12 Concepts & Comparison' },
    ],
    theory: {
      overview: `This module approaches the GPU from the application developer's perspective — understanding how graphics and compute APIs drive the hardware. This is crucial for AMD engineers because the driver's entire purpose is to faithfully implement these APIs.

AMD Markham teams serve these APIs directly:
- Mesa radeonsi/radv implements OpenGL and Vulkan
- ROCm implements OpenCL and HIP
- The LLVM AMDGPU backend compiles all shaders and compute kernels

The goal is not to make you a graphics programmer, but to build the complete mental model of API → Driver → Hardware.`,
      sections: [
        {
          title: '1. The Real-Time Rendering Pipeline',
          content: `The GPU's primary task is executing the graphics rendering pipeline. Understanding this pipeline explains why GPUs have thousands of parallel execution units.

**The pipeline, end-to-end:**
CPU submits vertex data (Vertex Buffer) and draw commands → GPU runs the pipeline → result written to Framebuffer → Display Engine (DCN) scans out.

**Key stages:**
1. **Input Assembler**: Reads vertex data from vertex/index buffers and assembles geometric primitives (triangles).
2. **Vertex Shader**: Runs once per vertex — transforms coordinates from model space to clip space. Fully programmable.
3. **Rasterization**: Converts triangles into screen-space pixels (Fragments), interpolating vertex attributes. Executed by fixed-function hardware.
4. **Fragment Shader** (Pixel Shader): Runs once per pixel — computes final color, samples textures. Fully programmable. Usually the performance bottleneck.
5. **Output Merger**: Depth test (Z-buffer), stencil test, alpha blending. Result written to the Framebuffer.

**Driver implication**: Every programmable stage requires the driver to compile GLSL/HLSL/SPIR-V source into GPU ISA — that is exactly what the LLVM AMDGPU backend does.`,
          diagram: {
            type: 'ascii',
            content: `CPU Side                          GPU Side
─────────                         ──────────────────────────────────────
VBO/IBO ──► Command Buffer ──►  Input Assembler
SSBO/UBO         (Ring)          │
Textures                         ▼
                              Vertex Shader  ◄── GLSL/SPIR-V compiled
                              (per vertex)       to AMDGPU ISA
                                 │
                                 ▼
                              Tessellation (optional)
                                 │
                                 ▼
                              Geometry Shader (optional)
                                 │
                                 ▼
                              Rasterizer  (fixed-function HW)
                              (triangle → pixels)
                                 │
                                 ▼
                              Fragment Shader  ◄── Another compiled
                              (per pixel)          kernel runs here
                                 │
                                 ▼
                              Output Merger
                              (depth test, blend)
                                 │
                                 ▼
                              Framebuffer ──► Display Engine (DCN)`,
            caption: 'GPU rendering pipeline: from vertex data submitted by the CPU to pixels on screen. The driver manages resources, compiles shaders, and schedules execution at every stage.',
          },
        },
        {
          title: '2. OpenGL — The Classic Graphics API',
          content: `OpenGL (1992) is the oldest cross-platform graphics API and the historical foundation for AMD's Mesa radeonsi driver. Understanding OpenGL explains why the driver is complex.

**Core concepts:**
- **State Machine Model**: OpenGL is a massive global state machine. Every API call modifies global state (currently bound VAO, Shader Program, Framebuffer, etc.), and subsequent draw calls use that state. Simple to use, but drivers must track enormous state.
- **Objects**: VBO (Vertex Buffer), VAO (Vertex Array Object), Texture, FBO (Framebuffer Object), Shader Program — all referenced by integer IDs.
- **Shaders**: Written in GLSL (OpenGL Shading Language), compiled to GPU ISA by the driver.

**What happens on glDrawArrays():**
1. Mesa radeonsi collects all current GL state (shader, texture bindings, blend state, viewport...)
2. Generates corresponding GPU command packets (PM4 format)
3. Submits via libdrm ioctl to the amdgpu kernel driver
4. Kernel driver writes to Ring Buffer, GPU executes

This call chain means: you cannot understand the driver without understanding the API it serves.`,
        },
        {
          title: '3. Vulkan — Modern Explicit API',
          content: `Vulkan (2016) was designed to expose GPU hardware more directly, moving work previously hidden inside drivers to the application. AMD's Mesa radv driver implements Vulkan for all RDNA/GCN GPUs.

**Key design principles:**
- **Explicit Memory Management**: Apps allocate GPU memory (VkDeviceMemory) and choose memory types (Device Local, Host Visible, etc.). No driver magic.
- **Command Buffers**: Apps pre-record all GPU commands, then submit in bulk. Enables multi-threaded command recording and eliminates per-draw-call driver overhead.
- **Render Passes**: Explicitly describe attachment lifetimes (Load/Store ops), enabling tile-based GPU optimizations — AMD's RB+ can keep depth data in tile cache without writing to VRAM.
- **Descriptor Sets**: Explicit shader resource binding (textures, UBOs), more efficient than OpenGL's global state.
- **Pipeline State Objects (PSO)**: All fixed-function state (depth test, blend, rasterizer config) baked into an immutable object at creation time — no runtime state permutation overhead.

**Driver implication**: The Vulkan driver (radv) is dramatically simpler at draw time than OpenGL (radeonsi) — state has already been resolved. But Vulkan requires the driver to correctly implement every detail of the spec, since apps depend on explicit guarantees.`,
          diagram: {
            type: 'ascii',
            content: `OpenGL (fat driver)              Vulkan (thin driver)
──────────────────           ──────────────────────────────
App calls glDraw()           App records vkCmdDraw()
    │                            │
    ▼                            ▼
Driver work:                 Driver work:
• Track all global state      • Almost direct PM4 translation
• Validate state legality     • App guarantees correctness
• Compile/cache shader        • Shader compiled at PSO creation
• Decide memory placement     • App specified memory type
• Manage synchronization      • App uses VkFence/Semaphore
    │                            │
    ▼                            ▼
Submit PM4 to Ring           Submit PM4 to Ring
(through many layers)        (shorter path, lower latency)`,
            caption: 'OpenGL vs Vulkan driver workload. Vulkan moves driver complexity to the application, reducing CPU overhead at draw time by 5–10x in draw-call-heavy workloads.',
          },
        },
        {
          title: '4. OpenCL — General-Purpose GPU Compute',
          content: `OpenCL (Open Computing Language, 2008) is the first cross-platform GPU compute API. AMD provides OpenCL support via ROCm. Its programming model is the foundation that CUDA and HIP were designed around.

**Execution Model:**
- **Platform**: One or more OpenCL implementations (AMD ROCm, Intel OpenCL, etc.)
- **Device**: A compute device (CPU, GPU, FPGA)
- **Context**: Container managing devices, memory, command queues
- **Command Queue**: Submits commands (kernel execution, memory transfers) to a device
- **Kernel**: A function executing on the device, written in OpenCL C
- **Work-Item / Work-Group**: Maps directly to GPU Thread / Thread Block

**Mapping to AMD hardware:**
A Work-Group is scheduled to one CU (Compute Unit). The CU splits it into Wavefronts (64 Work-Items each). Each Wavefront executes on one SIMD unit in SIMT fashion — exactly the same hardware path as HIP.

**On AMD:** OpenCL kernels go through clang → LLVM AMDGPU backend → GPU ISA, then submitted via KFD (ROCm Kernel Fusion Driver) to the GPU. The low-level path is identical to HIP, just with a different API surface.`,
        },
        {
          title: '5. DirectX 12 — Concepts & Vulkan Comparison',
          content: `DirectX 12 (D3D12, 2015) is Microsoft's modern low-level graphics API for Windows, sharing the same design philosophy as Vulkan. While AMD's Linux driver doesn't implement D3D12, understanding it matters for AMD Markham engineers.

**Why it's relevant:**
1. AMD has a dedicated Windows driver team implementing D3D12 via WDDM
2. D3D12 and Vulkan share the same architecture — explicit memory, command recording, PSOs
3. Cross-platform engines (UE5, Unity) ship D3D12 and Vulkan backends — AMD optimizes both
4. Interview questions often compare the two

**D3D12 vs Vulkan concept mapping:**
| Concept | D3D12 | Vulkan |
|---------|-------|--------|
| Command submission | Command List + Queue | Command Buffer + Queue |
| Resource binding | Descriptor Heap | Descriptor Set |
| Memory | Heap (D3D12MA) | DeviceMemory (VMA) |
| Render state | Pipeline State Object | Pipeline |
| Synchronization | Fence + Event | VkFence + VkSemaphore |
| Shader language | HLSL → DXIL | GLSL/HLSL → SPIR-V |

**The compiler connection:** D3D12 shaders compile to DXIL (LLVM IR derivative). Vulkan shaders compile to SPIR-V (also LLVM-generable). AMD's LLVM AMDGPU backend ultimately compiles both to GPU ISA — the toolchain work is deeply related regardless of API.`,
        },
      ],
      keyBooks: [
        {
          title: 'Real-Time Rendering, 4th Edition',
          author: 'Tomas Akenine-Möller et al.',
          relevance: 'The definitive graphics textbook. Covers every pipeline stage in depth with hardware context. Essential preparation for any AMD graphics interview.',
          url: 'https://www.realtimerendering.com/',
        },
        {
          title: 'Vulkan Programming Guide',
          author: 'Graham Sellers & John Kessenich',
          relevance: 'Official Vulkan guide. Explains the API design philosophy in depth, directly applicable to understanding radv driver requirements.',
        },
        {
          title: 'OpenCL Programming Guide',
          author: 'Aaftab Munshi et al.',
          relevance: 'OpenCL reference covering execution model, memory model, and optimization strategies — maps directly to ROCm HIP concepts.',
        },
      ],
      onlineResources: [
        {
          title: 'Vulkan Tutorial (vulkan-tutorial.com)',
          url: 'https://vulkan-tutorial.com/',
          type: 'doc',
          description: 'Best Vulkan intro tutorial on the web. From a triangle to a full renderer with clear code. Highly recommended for understanding what radv must implement.',
        },
        {
          title: 'Mesa Radeonsi/RADV Source',
          url: 'https://gitlab.freedesktop.org/mesa/mesa',
          type: 'repo',
          description: "AMD's OpenGL (radeonsi) and Vulkan (radv) userspace driver implementations. The best code reference for API→driver mapping.",
        },
        {
          title: 'GPUOpen — AMD Developer Resources',
          url: 'https://gpuopen.com/',
          type: 'doc',
          description: 'AMD official dev resources: GPU architecture whitepapers, profiling tools, and graphics best practices.',
        },
        {
          title: 'Khronos Vulkan Specification',
          url: 'https://registry.khronos.org/vulkan/',
          type: 'doc',
          description: 'The authoritative Vulkan spec. radv must implement every mandatory feature in this document.',
        },
        {
          title: 'The Book of Shaders',
          url: 'https://thebookofshaders.com/',
          type: 'doc',
          description: 'Interactive, visual introduction to GLSL fragment shaders. Great for building intuition about programmable GPU stages.',
        },
      ],
    },
    codeReading: [
      {
        title: 'OpenGL Draw Call to PM4 Command',
        description: 'How a single glDrawArrays() call becomes a GPU PM4 command packet inside Mesa radeonsi',
        file: 'mesa/src/gallium/drivers/radeonsi/si_draw.c',
        language: 'c',
        code: `/* Mesa radeonsi: entry point for an OpenGL draw call */
/* Called when the app calls glDrawArrays(GL_TRIANGLES, 0, 3) */

static void si_draw_vbo(struct pipe_context *ctx,
                        const struct pipe_draw_info *info, ...)
{
    struct si_context *sctx = (struct si_context *)ctx;

    /* 1. Flush all dirty state bits */
    /*    OpenGL is a state machine — before drawing, sync everything */
    /*    that changed since the last draw call                        */
    if (sctx->dirty_atoms)
        si_emit_atoms(sctx);   /* write dirty state regs to cmd stream */

    /* 2. Ensure shaders are compiled and uploaded to GPU memory */
    if (!si_shader_cache_load_shader(sctx))
        si_update_shaders(sctx); /* may trigger LLVM AMDGPU JIT compile */

    /* 3. Bind vertex buffers */
    si_emit_vertex_buffers(sctx, info->index_size);

    /* 4. Write DRAW_INDEX_AUTO PM4 packet to command stream */
    /*    THIS is the instruction that tells the GPU to start rendering */
    si_emit_draw_packets(sctx, info, drawid_base, draws, num_draws,
                         indirect, dispatch_draw, min_index, max_index);
}

/* The final PM4 packet looks like (simplified):
 *
 * PACKET3_SET_SH_REG  VGT_PRIMITIVE_TYPE = TRILIST
 * PACKET3_DRAW_INDEX_AUTO
 *   vertex_count = 3
 *   flags = USE_OPAQUE
 *
 * The GPU's Command Processor (CP) reads this and
 * starts fetching vertices from the VBO, dispatching
 * them to Vertex Shader Wavefronts on idle CUs.
 */`,
        annotations: [
          'si_emit_atoms() iterates the dirty state bitmap and translates all changed GL state into GPU register write commands',
          'si_update_shaders() is called on first use or when the state combination changes — invokes LLVM AMDGPU backend to compile GLSL to GPU ISA',
          'si_emit_draw_packets() generates the actual PACKET3_DRAW_INDEX_AUTO or PACKET3_DRAW_INDEX_2 PM4 draw command',
          'The entire path goes through the Gallium abstraction layer (pipe_context) → libdrm → DRM ioctl → amdgpu kernel driver',
        ],
      },
      {
        title: 'Vulkan vs OpenGL Draw Path Comparison',
        description: 'Side-by-side comparison of radv (Vulkan) and radeonsi (OpenGL) draw call implementations',
        file: 'mesa/src/amd/vulkan/radv_cmd_buffer.c',
        language: 'c',
        code: `/* ─── Vulkan path (radv) ─── */
/* vkCmdDraw() is called during Command Buffer recording, not execution */

VKAPI_ATTR void VKAPI_CALL
radv_CmdDraw(VkCommandBuffer commandBuffer,
             uint32_t vertexCount, uint32_t instanceCount,
             uint32_t firstVertex, uint32_t firstInstance)
{
    RADV_FROM_HANDLE(radv_cmd_buffer, cmd_buffer, commandBuffer);

    /* Vulkan: state was set by vkCmdSetXxx() and vkCmdBindPipeline() */
    /* No global state to track — just read cmd_buffer->state          */

    /* Flush dynamic state if changed since last draw */
    radv_cmd_buffer_flush_dynamic_state(cmd_buffer,
                                        cmd_buffer->state.dirty);

    /* Directly write PM4 DRAW_INDEX_AUTO to the command buffer stream */
    radv_emit_draw_packets_indexed_multi_draw(cmd_buffer, draws, 1,
                                              draw_vertex_count);
}
/* Key: this function runs in microseconds — no global state parsing  */
/* PM4 commands are submitted to the GPU only at vkQueueSubmit()       */

/* ─── Comparison: OpenGL path (radeonsi) ─── */
/* glDrawArrays() submits immediately; driver must resolve state NOW   */

/* State dirty bits radeonsi checks before every draw (simplified):    */
/*   SI_STATE_BIT_FRAMEBUFFER    - bound FBO                           */
/*   SI_STATE_BIT_SCISSOR        - scissor rect                        */
/*   SI_STATE_BIT_VIEWPORT       - viewport transform                  */
/*   SI_STATE_BIT_BLEND          - alpha blending                      */
/*   SI_STATE_BIT_DEPTH_STENCIL  - depth/stencil test                  */
/*   SI_STATE_BIT_RASTERIZER     - rasterizer config                   */
/*   SI_STATE_BIT_VS/FS/GS/HS   - shader stages                       */
/*   ... 30+ bits total                                                 */
/* This explains why OpenGL has higher CPU overhead per draw call       */`,
        annotations: [
          'radv CmdDraw is a recording-time operation with near-zero state overhead — the key reason Vulkan wins on CPU-bound workloads',
          'radeonsi must check 30+ state dirty bits on every draw call — the tax of the OpenGL "fat driver" design',
          'Both radv (Vulkan) and radeonsi (OpenGL) ultimately generate the same PM4 command format, submitted to the same amdgpu kernel driver',
          'This comparison comes up frequently in AMD graphics driver interviews',
        ],
      },
    ],
    miniProject: {
      title: 'Draw Your First GPU Triangle and Trace It to the Driver',
      description: 'Render a colored triangle with OpenGL, then use apitrace to capture API calls and strace to observe kernel ioctls — building the complete API → Mesa → DRM → GPU mental model.',
      objectives: [
        'Render a color-interpolated triangle with GLFW + OpenGL 3.3 Core Profile (Gouraud shading via vertex colors)',
        'Use apitrace to record the GL call sequence and identify draw call state setup',
        'Use strace to capture DRM ioctls and find the DRM_IOCTL_AMDGPU_CS submission',
        'Compare API call count between OpenGL and Vulkan (vulkan-tutorial.com Chapter 1)',
      ],
      steps: [
        'Install: sudo apt install libglfw3-dev libglew-dev vulkan-tools libvulkan-dev apitrace',
        'Write OpenGL triangle: vertex shader passes through position/color, fragment shader outputs interpolated color',
        'Build and run: gcc triangle.c -lGL -lglfw -lGLEW -o triangle && ./triangle',
        'Trace with apitrace: apitrace trace --api gl ./triangle',
        'View trace: qapitrace trace.apitrace — find glDrawArrays and examine preceding state calls',
        'Trace ioctls: strace -e ioctl ./triangle 2>&1 | grep AMDGPU_CS',
        '(Optional) Run vulkan-tutorial.com Chapter 1 code — compare the ioctl volume between OpenGL and Vulkan',
      ],
      expectedOutput: `apitrace output should show:
glUseProgram(1)                    # bind compiled shader program
glBindVertexArray(1)               # bind vertex attribute config
glDrawArrays(GL_TRIANGLES, 0, 3)   # ← the actual draw trigger

strace output should include:
ioctl(3, DRM_IOCTL_AMDGPU_CS, ...) # Mesa submitting PM4 command
                                    # buffer to the kernel driver

Window displays: a triangle with red, green, and blue
corners — colors smoothly interpolated across the surface
(Gouraud shading via built-in rasterizer interpolation).`,
    },
    interviewQuestions: [
      {
        question: 'Describe the fundamental architectural difference between OpenGL and Vulkan drivers, and why Vulkan achieves lower CPU overhead per draw call.',
        difficulty: 'medium',
        hint: 'Cover "state machine vs explicit state" and "immediate vs deferred command recording."',
        answer: "OpenGL is a global state machine: at every draw call, the driver must check 30+ dirty state bits, validate state legality, and potentially compile/cache shaders — all on the application's thread. Vulkan is explicit: (1) State is baked into Pipeline State Objects at creation time, not resolved at draw time; (2) Command buffers decouple recording from submission, enabling multi-threaded recording; (3) Memory management and synchronization are fully app-controlled, eliminating driver guesswork. Result: Vulkan draw call CPU overhead is typically 5–10x lower than OpenGL, which matters enormously for draw-call-heavy game engines.",
      },
      {
        question: 'Explain the difference between a Vertex Shader and a Fragment Shader, and how each executes on AMD GPU hardware.',
        difficulty: 'easy',
        hint: 'Cover per-vertex vs per-pixel execution, input/output, and Wavefront granularity.',
        answer: 'Vertex Shader: executes once per vertex. Input: vertex attributes (position, normal, UV). Output: clip-space coordinates and interpolated attributes. Vertex count is typically small (thousands to millions). Fragment Shader: executes once per rasterized pixel (Fragment). Input: interpolated vertex attributes. Output: pixel color. A single frame may have millions of fragments — this is almost always the bottleneck. Both are "programmable shaders" — the driver compiles GLSL/SPIR-V to AMDGPU ISA. On hardware, both run on CU SIMD units in Wavefronts of 64 threads. The CU schedules vertex shader Wavefronts and fragment shader Wavefronts the same way — they are just different kernel functions dispatched at different pipeline stages.',
      },
      {
        question: 'How do OpenCL Work-Items and Work-Groups correspond to HIP Threads and Blocks, and how do they map to AMD GPU hardware?',
        difficulty: 'medium',
        hint: 'Cover the API-to-hardware mapping through Wavefronts and CUs.',
        answer: 'OpenCL Work-Item = HIP Thread: the smallest execution unit, each running the same kernel on different data. OpenCL Work-Group = HIP Block: a group that can synchronize (barrier) and share Local Memory (LDS). On AMD hardware: a Work-Group is dispatched to one CU; the CU splits it into Wavefronts (64 Work-Items); each Wavefront executes on one SIMD unit in SIMT mode. The max Work-Group size is 1024 (same as HIP Block). OpenCL barrier(CLK_LOCAL_MEM_FENCE) and HIP __syncthreads() compile to the same S_BARRIER hardware instruction. The low-level execution path through KFD and the amdgpu kernel driver is identical.',
      },
      {
        question: "What are Vulkan Render Passes and why do they matter for AMD GPU's RB+ (Render Backend Plus) architecture?",
        difficulty: 'hard',
        hint: 'Consider VRAM bandwidth savings when depth attachments are declared DONT_CARE.',
        answer: "A Render Pass describes the attachments (color, depth) used by a set of rendering operations and their Load/Store behavior at Pass boundaries. For AMD: (1) When depth is declared STORE_OP_DONT_CARE, the driver knows it doesn't need to be written back to VRAM — AMD's RB+ can complete depth testing entirely in tile cache, saving significant bandwidth on high-res targets. (2) Subpass dependencies tell the driver exactly when to insert memory barriers (cache flushes), avoiding both under-synchronization (data hazards) and over-synchronization (unnecessary stalls). (3) Versus OpenGL, where the driver must heuristically guess cache flush points — Vulkan's explicit information lets radv generate more optimal command sequences. This is a common topic in AMD Vulkan driver interviews.",
      },
      {
        question: 'Walk through the full path from OpenCL kernel source code to execution on AMD GPU hardware.',
        difficulty: 'hard',
        hint: 'Cover clang, LLVM AMDGPU backend, KFD, AQL queue, and Command Processor.',
        answer: 'Compilation phase: clBuildProgram() invokes clang to parse OpenCL C into LLVM IR. LLVM middle-end runs optimization passes (loop unrolling, vectorization). LLVM AMDGPU backend compiles optimized IR to target GPU ISA (e.g., gfx1102). Output is an ELF Code Object containing GPU machine code and metadata (register usage, LDS size). Runtime phase: clEnqueueNDRangeKernel() flows through ROCm OpenCL runtime → amdocl → HIP runtime layer. KFD ioctl (KFD_IOC_DISPATCH_QUEUE) queues an AQL (AMD Queue Language) dispatch packet into the GPU queue. The GPU Command Processor reads the AQL packet and dispatches Wavefronts to idle CUs. Synchronization: clWaitForEvents() calls KFD_IOC_WAIT_EVENTS, blocking until the GPU signals the completion fence.',
      },
    ],
  },
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'hardware',
    number: '2',
    title: 'Hardware Interface Basics',
    titleEn: 'Hardware Interface Basics',
    icon: 'Plug',
    description:
      'Understand the physical and protocol foundations of CPU–GPU communication: PCIe bus, DMA, and interrupts. The basis for all drivers.',
    estimatedHours: 40,
    difficulty: 'intermediate',
    subModules: [
      { id: 'hw-pcie', title: '2.1 PCIe Protocol', titleEn: 'PCIe Protocol' },
      { id: 'hw-dma', title: '2.2 DMA Engine', titleEn: 'DMA Engine' },
      { id: 'hw-irq', title: '2.3 Interrupt Mechanism', titleEn: 'Interrupt Mechanism' },
    ],
    theory: {
      overview:
        'PCIe is the standard interface for modern GPUs. AMD GPUs connect via PCIe (often 4.0 x8 or x16). Understanding enumeration, BAR mapping, DMA, and MSI interrupts is key to understanding how amdgpu initializes and controls the GPU.',
      sections: [
        {
          title: 'PCIe Enumeration and Configuration Space',
          content:
            'At boot, BIOS/UEFI enumerates PCIe devices. Each device has a 256-byte configuration space with Vendor ID (AMD = 0x1002), Device ID (RX 7600 XT = 0x7480), and BAR registers. The kernel runs enumeration and exposes devices in /sys/bus/pci/devices/. amdgpu registers via pci_driver; when the kernel finds a matching Device ID, it calls the driver probe function.',
        },
      ],
      keyBooks: [
        {
          title: 'PCI Express System Architecture',
          author: 'Mindshare Inc.',
          isbn: '978-0321156303',
          relevance: 'Reference for PCIe physical, link, and transaction layers.',
        },
        {
          title: 'Linux Device Drivers, 3rd Edition',
          author: 'Corbet, Rubini, Kroah-Hartman',
          relevance: 'Chapters 12–15 cover PCI, DMA, and interrupts.',
          url: 'https://docs.kernel.org/driver-api/index.html',
        },
      ],
      onlineResources: [
        {
          title: 'PCIe Explained',
          url: 'https://docs.kernel.org/PCI/pci.html',
          type: 'doc',
          description: 'Linux kernel PCI driver guide.',
        },
        {
          title: 'DMA API Guide',
          url: 'https://docs.kernel.org/core-api/dma-api.html',
          type: 'doc',
          description: 'Linux DMA API documentation.',
        },
      ],
    },
    codeReading: [],
    miniProject: {
      title: 'Write a Simple PCI Device Scanner',
      description:
        'Write a kernel module that scans AMD PCI devices and prints their BAR information.',
      objectives: [
        'Understand PCI driver registration and probe flow',
        'Learn to read PCI configuration space',
        'Understand BAR types and sizes',
      ],
      steps: [
        'Write a module that registers pci_driver for AMD vendor (0x1002)',
        'In probe, iterate BARs and print start, length, flags',
        'Use pci_resource_start, pci_resource_len, pci_resource_flags',
        'Compare with lspci -v output',
      ],
      expectedOutput:
        'Kernel log showing RX 7600 XT BARs, including MMIO (BAR0, ~256MB) and VRAM (BAR2, ~8GB).',
    },
    interviewQuestions: [
      {
        question: 'Explain how PCIe BAR works and how the GPU driver uses it.',
        difficulty: 'medium',
        hint: 'Consider BAR types (MMIO vs I/O), size, and ioremap.',
        answer:
          'BAR describes device memory regions. Driver uses pci_request_regions, then pci_iomap/ioremap to map BAR. After that it uses readl/writel or custom macros. On unload: iounmap, pci_release_regions.',
      },
    ],
  },
  {
    id: 'kernel',
    number: '3',
    title: 'Kernel & Driver Basics',
    titleEn: 'Kernel & Driver Basics',
    icon: 'Terminal',
    description:
      'Learn the general Linux device driver paradigm. From kernel modules to PCI drivers—your ticket into amdgpu source.',
    estimatedHours: 60,
    difficulty: 'intermediate',
    subModules: [
      { id: 'kernel-build', title: '3.1 Kernel Build & Modules', titleEn: 'Kernel Build & Modules' },
      { id: 'kernel-char', title: '3.2 Character Device Driver', titleEn: 'Character Device Driver' },
      { id: 'kernel-pci', title: '3.3 PCI Device Driver', titleEn: 'PCI Device Driver' },
    ],
    theory: {
      overview:
        'This module takes you from a simple hello-world kernel module to character devices and a full PCI driver skeleton. PCI drivers are the direct prerequisite for understanding amdgpu source.',
      sections: [
        {
          title: 'Kernel Module Basics',
          content:
            'A kernel module is dynamically loadable code. Each module implements module_init() (on load) and module_exit() (on unload). Use MODULE_LICENSE("GPL"), MODULE_AUTHOR, MODULE_DESCRIPTION. Modules cannot use libc; they use kernel APIs (printk instead of printf, kmalloc instead of malloc).',
        },
      ],
      keyBooks: [
        {
          title: 'Linux Device Drivers, 3rd Edition',
          author: 'Corbet, Rubini, Kroah-Hartman',
          relevance: 'Chapters 2–6 cover char devices; Ch. 12 covers PCI.',
          url: 'https://docs.kernel.org/driver-api/index.html',
        },
        {
          title: 'Linux Kernel Development, 3rd Edition',
          author: 'Robert Love',
          isbn: '978-0672329463',
          relevance: 'Ch. 5 syscalls, 7 interrupts, 8 bottom halves, 12 memory.',
        },
      ],
      onlineResources: [
        {
          title: 'The Linux Kernel Module Programming Guide',
          url: 'https://sysprog21.github.io/lkmpg/',
          type: 'doc',
          description: 'Up-to-date module programming guide with examples.',
        },
        {
          title: 'Kernel Newbies',
          url: 'https://kernelnewbies.org',
          type: 'doc',
          description: 'Tutorials and kernel changelogs for newcomers.',
        },
      ],
    },
    codeReading: [],
    miniProject: {
      title: 'Implement a PCI Device Info Driver',
      description:
        'Write a PCI driver that matches AMD GPUs and exposes device info via /proc/amd_gpu_info.',
      objectives: [
        'Implement a full pci_driver (probe/remove)',
        'Read GPU BAR and config space',
        'Expose info via /proc',
      ],
      steps: [
        'Create amd_pci_info.c and register pci_driver for AMD 0x1002',
        'In probe: pci_enable_device, pci_request_regions',
        'Read BAR info with pci_resource_start/len/flags',
        'Create /proc/amd_gpu_info with proc_create',
        'Implement proc_read to format and output BAR info',
      ],
      expectedOutput: '/proc/amd_gpu_info showing GPU BAR info matching lspci -v.',
    },
    interviewQuestions: [
      {
        question: 'What is the difference between spinlock and mutex in the kernel?',
        difficulty: 'medium',
        hint: 'Consider sleeping, context, and overhead.',
        answer:
          'Spinlock: busy-wait, no sleep; usable in IRQ context; for short critical sections. Mutex: sleeps while waiting; not in IRQ; for longer sections or when sleep is possible. Use mutex if you might sleep inside; use spinlock in IRQ or when holding IRQ disabled.',
      },
    ],
  },
  {
    id: 'drm',
    number: '4',
    title: 'Graphics Drivers & DRM',
    titleEn: 'Graphics Drivers & DRM',
    icon: '🖥️',
    description:
      'Dive into the DRM/KMS framework. Understand the display pipeline, GPU memory (GEM/TTM), and DMA-BUF—the direct foundation for amdgpu.',
    estimatedHours: 60,
    difficulty: 'advanced',
    subModules: [
      { id: 'drm-core', title: '4.1 DRM Core Architecture', titleEn: 'DRM Core Architecture' },
      { id: 'drm-kms', title: '4.2 KMS Display Pipeline', titleEn: 'KMS Display Pipeline' },
      { id: 'drm-mem', title: '4.3 GPU Memory Management', titleEn: 'GPU Memory Management' },
    ],
    theory: {
      overview:
        'DRM (Direct Rendering Manager) is the Linux kernel subsystem for GPU management. It provides a common framework so different drivers (amdgpu, i915, nouveau) expose GPU functionality in a consistent way. DRM covers KMS (display) and GEM/TTM (memory management).',
      sections: [
        {
          title: 'DRM Core Architecture',
          content:
            'The core is drm_device; each driver implements drm_driver. Userspace accesses via /dev/dri/card0 using DRM ioctls for rendering, memory, and display. DRM philosophy: the kernel does the minimum (memory, command submission, display); rendering logic stays in userspace (Mesa, ROCm).',
        },
      ],
      keyBooks: [
        {
          title: 'Linux Graphics Internals',
          author: 'Luc Verhaegen',
          relevance: 'DRM/KMS internals; concepts still applicable.',
          url: 'https://docs.kernel.org/gpu/drm-kms.html',
        },
      ],
      onlineResources: [
        {
          title: 'DRM Kernel Documentation',
          url: 'https://docs.kernel.org/gpu/drm-internals.html',
          type: 'doc',
          description: 'Kernel DRM internals: KMS, GEM, TTM.',
        },
        {
          title: "DRM Developer's Guide",
          url: 'https://docs.kernel.org/gpu/drm-uapi.html',
          type: 'doc',
          description: 'DRM userspace API.',
        },
      ],
    },
    codeReading: [],
    miniProject: {
      title: 'Query GPU Display Info with libdrm',
      description:
        'Write a userspace program using libdrm to query connectors, resolution, and framebuffer info.',
      objectives: [
        'Understand DRM userspace API',
        'Use the libdrm library',
        'Understand KMS objects (Connector, CRTC, Mode)',
      ],
      steps: [
        'Install libdrm-dev',
        'Write drm_info.c, open /dev/dri/card0',
        'Call drmModeGetResources() for KMS resources',
        'Iterate connectors and print status and resolutions',
        'Print current CRTC mode',
      ],
      expectedOutput:
        'Program output with connector type (HDMI/DP), current resolution (e.g. 1920x1080@60Hz), and supported modes.',
    },
    interviewQuestions: [
      {
        question: 'Explain GEM and TTM, and the difference between VRAM and GTT.',
        difficulty: 'medium',
        hint: 'Consider abstraction level and memory placement.',
        answer:
          'GEM is the high-level DRM memory API. TTM is a lower-level implementation for GPUs that move buffers between regions. VRAM: GPU local memory, fast access; limited size. GTT: system memory via GART; larger capacity; slower. TTM migrates BOs between them transparently.',
      },
    ],
  },
  {
    id: 'amdgpu',
    number: '5',
    title: 'Deep Dive into AMDGPU',
    titleEn: 'Deep Dive into AMDGPU',
    icon: 'Microscope',
    description:
      'Break down amdgpu internals. Includes a code-reading guide to navigate this large codebase.',
    estimatedHours: 100,
    difficulty: 'expert',
    subModules: [
      { id: 'amdgpu-guide', title: '5.1 Code Reading Guide', titleEn: 'Code Reading Guide' },
      { id: 'amdgpu-device', title: '5.2 amdgpu_device Core', titleEn: 'amdgpu_device Core' },
      { id: 'amdgpu-scheduler', title: '5.3 GPU Scheduler', titleEn: 'GPU Scheduler' },
      { id: 'amdgpu-ring', title: '5.4 Command Ring Buffer', titleEn: 'Command Ring Buffer' },
      { id: 'amdgpu-dc', title: '5.5 Display Core', titleEn: 'Display Core' },
      { id: 'amdgpu-pm', title: '5.6 Power Management', titleEn: 'Power Management' },
    ],
    theory: {
      overview:
        'amdgpu lives in drivers/gpu/drm/amd/ and is one of the largest drivers in the kernel (over a million lines). You need a good navigation strategy. This module starts with a reading guide, then walks through core components.',
      sections: [
        {
          title: '5.1 AMDGPU Code Reading Guide',
          content:
            'Recommended order: (1) amdgpu_drv.c for driver registration and PCI probe; (2) trace amdgpu_device_init() as the main init flow; (3) understand IP Block mechanism (amdgpu_ip_block_add); (4) use cscope/ctags for indexing; (5) use git log --follow for history.',
        },
      ],
      keyBooks: [],
      onlineResources: [
        {
          title: 'AMDGPU Driver Documentation',
          url: 'https://docs.kernel.org/gpu/amdgpu/index.html',
          type: 'doc',
          description: 'Kernel amdgpu docs.',
        },
      ],
    },
    codeReading: [],
    miniProject: {
      title: 'Trace amdgpu Initialization Flow',
      description: 'Use cscope/ctags to follow amdgpu_device_init and document the init sequence.',
      objectives: [
        'Navigate amdgpu source with cscope/ctags',
        'Trace device init from probe to fully initialized',
        'Document IP Block init order',
      ],
      steps: [
        'Clone kernel, configure for your GPU',
        'Build cscope index for drivers/gpu/drm/amd',
        'Start from amdgpu_pci_probe, follow to amdgpu_device_init',
        'Document which IP Blocks are initialized and in what order',
      ],
      expectedOutput:
        'A written flow of amdgpu init from probe to ready state, with IP Block order.',
    },
    interviewQuestions: [
      {
        question: 'Describe the amdgpu IP Block architecture and init flow.',
        difficulty: 'medium',
        hint: 'Refer to GFX, SDMA, DC, VCN, SMU and how they are registered.',
        answer:
          'Each IP Block implements callbacks (init, fini, suspend, resume). amdgpu_device_init adds blocks via amdgpu_ip_block_add. GFX, SDMA, DC, VCN, SMU are examples. Each has versioned files like gfx_v11_0.c.',
      },
    ],
  },
  {
    id: 'debugging',
    number: '6',
    title: 'Debugging & Profiling',
    titleEn: 'Debugging & Profiling',
    icon: 'Search',
    description:
      'Core tools AMD engineers use daily: from printk to ftrace, GPU hang analysis to ROCm profiling.',
    estimatedHours: 50,
    difficulty: 'advanced',
    subModules: [
      { id: 'debug-kernel', title: '6.1 Kernel Debugging Tools', titleEn: 'Kernel Debugging Tools' },
      { id: 'debug-gpu', title: '6.2 GPU Issue Analysis', titleEn: 'GPU Issue Analysis' },
      { id: 'debug-rocm', title: '6.3 ROCm Profiling', titleEn: 'ROCm Profiling' },
    ],
    theory: {
      overview:
        'Debugging is one of the most important skills. AMD interviews often ask "How would you debug a GPU hang?" This module covers the kernel debug toolchain and GPU-specific analysis.',
      sections: [
        {
          title: 'printk and Dynamic Debug',
          content:
            'printk is the basic kernel logging facility. Use dynamic debug for runtime enable/disable of pr_debug: echo "module amdgpu +p" > /sys/kernel/debug/dynamic_debug/control. amdgpu uses DRM_DEBUG_DRIVER controlled by drm.debug. Debugfs at /sys/kernel/debug/dri/0/ exposes GPU state and registers.',
        },
      ],
      keyBooks: [
        {
          title: 'Linux Kernel Debugging',
          author: 'Kaiwan N Billimoria',
          isbn: '978-1801075039',
          relevance: 'printk, dynamic debug, ftrace, kprobes.',
        },
      ],
      onlineResources: [
        {
          title: 'ftrace - Function Tracer',
          url: 'https://docs.kernel.org/trace/ftrace.html',
          type: 'doc',
          description: 'Official ftrace docs.',
        },
        {
          title: 'perf Examples',
          url: 'https://www.brendangregg.com/perf.html',
          type: 'doc',
          description: 'Brendan Gregg perf guide.',
        },
      ],
    },
    codeReading: [],
    miniProject: {
      title: 'Analyze amdgpu Command Submission Latency with ftrace',
      description:
        'Use ftrace to trace amdgpu command submission and measure latency from userspace submit to GPU execution.',
      objectives: [
        'Use ftrace/trace-cmd',
        'Understand full command submission flow',
        'Identify performance bottlenecks',
      ],
      steps: [
        'Install trace-cmd',
        'Enable amdgpu tracepoints',
        'Run trace-cmd record -e "amdgpu:*" glxgears -frames 100',
        'Analyze with trace-cmd report',
      ],
      expectedOutput: 'Trace report showing submit timestamps and typical scheduling delay (tens of µs to ms).',
    },
    interviewQuestions: [
      {
        question: 'How would you analyze a GPU hang using dmesg?',
        difficulty: 'hard',
        hint: 'GRBM_STATUS, CP_RB registers, engine state.',
        answer:
          'Search dmesg for "GPU hang", "ring timeout", "GPU reset". Inspect GRBM_STATUS to see which engine (GFX, SDMA, Compute) is stuck. Check CP_RB_RPTR vs WPTR. Use umr for deeper register inspection.',
      },
    ],
  },
  {
    id: 'rocm-kernel',
    number: '7',
    title: 'ROCm Kernel Interface',
    titleEn: 'ROCm Kernel Interface',
    icon: 'Zap',
    description:
      'Understand ROCm at the kernel level: KFD (Kernel Fusion Driver), HSA architecture, and GPU queue management.',
    estimatedHours: 40,
    difficulty: 'advanced',
    subModules: [
      { id: 'kfd-hsa', title: '7.1 HSA Architecture & KFD', titleEn: 'HSA Architecture & KFD' },
      { id: 'kfd-queue', title: '7.2 Queue & Signal Management', titleEn: 'Queue & Signal Management' },
    ],
    theory: {
      overview:
        'ROCm (Radeon Open Compute) is AMD\'s open GPU compute platform. At the kernel, ROCm talks to the GPU via KFD (Kernel Fusion Driver), which is part of amdgpu and implements the HSA (Heterogeneous System Architecture) interface for userspace.',
      sections: [
        {
          title: 'HSA Architecture Overview',
          content:
            'HSA defines a unified virtual address space for CPU and GPU, queue-based compute submission, and signals for sync. AMD APUs implement HSA fully; discrete GPUs (e.g. RX 7600 XT) implement parts over PCIe.',
        },
      ],
      keyBooks: [
        {
          title: 'HSA Platform System Architecture Specification',
          author: 'HSA Foundation',
          relevance: 'HSA spec that KFD implements.',
          url: 'http://www.hsafoundation.com/standards/',
        },
      ],
      onlineResources: [
        {
          title: 'ROCm Documentation',
          url: 'https://rocm.docs.amd.com',
          type: 'doc',
          description: 'AMD ROCm docs including KFD.',
        },
      ],
    },
    codeReading: [],
    miniProject: {
      title: 'Query GPU Info with HSA Runtime API',
      description: 'Write a C program using HSA Runtime to enumerate agents and query GPU compute and memory info.',
      objectives: [
        'Use HSA Runtime API',
        'Enumerate HSA agents (CPU and GPU)',
        'Query CU count and memory size',
      ],
      steps: [
        'Install ROCm',
        'Write hsa_info.c: hsa_init, hsa_iterate_agents',
        'Query HSA_AGENT_INFO_* for each GPU agent',
        'Build with -lhsa-runtime64',
      ],
      expectedOutput:
        'Output of RX 7600 XT name (gfx1102), CU count (32), max clock, and VRAM size.',
    },
    interviewQuestions: [
      {
        question: 'What is KFD and how does it relate to amdgpu?',
        difficulty: 'medium',
        hint: 'ROCm kernel interface, /dev/kfd, HSA.',
        answer:
          'KFD is the amdgpu submodule for ROCm compute. It exposes /dev/kfd implementing HSA. It manages compute queues, memory, and signals. It uses amdgpu for low-level hardware access.',
      },
    ],
  },
  {
    id: 'rocm-compute',
    number: '8',
    title: 'ROCm User Compute',
    titleEn: 'ROCm User Compute',
    icon: 'Calculator',
    description:
      'Master upper-layer GPU compute: HIP programming model, GPU memory model, and performance optimization. Connect driver knowledge to real compute apps.',
    estimatedHours: 50,
    difficulty: 'advanced',
    subModules: [
      { id: 'hip-model', title: '8.1 HIP Programming Model', titleEn: 'HIP Programming Model' },
      { id: 'hip-memory', title: '8.2 GPU Memory Model & Optimization', titleEn: 'GPU Memory Model & Optimization' },
    ],
    theory: {
      overview:
        'HIP (Heterogeneous-compute Interface for Portability) is AMD\'s GPU programming framework, CUDA-like in syntax and usable on AMD and NVIDIA. Understanding HIP deepens knowledge of GPU hardware and driver behavior.',
      sections: [
        {
          title: 'HIP Programming Model: Grid, Block, Wavefront',
          content:
            'HIP uses Grid (whole task), Block (thread group, max 1024 threads), Thread. AMD adds Wavefront (64 threads in RDNA) as the actual scheduling unit. Block size should be a multiple of Wavefront size for efficiency.',
        },
      ],
      keyBooks: [
        {
          title: 'HIP Programming Guide',
          author: 'AMD Inc.',
          relevance: 'Official HIP guide and best practices.',
          url: 'https://rocm.docs.amd.com/projects/HIP/en/latest/',
        },
      ],
      onlineResources: [
        {
          title: 'ROCm HIP Documentation',
          url: 'https://rocm.docs.amd.com/projects/HIP/en/latest/',
          type: 'doc',
          description: 'HIP API reference and guides.',
        },
      ],
    },
    codeReading: [],
    miniProject: {
      title: 'Implement GPU Matrix Multiply and Profile',
      description: 'Implement matrix multiplication in HIP and use rocprof to analyze utilization and memory bandwidth.',
      objectives: [
        'Write and optimize HIP kernels',
        'Use LDS (shared memory)',
        'Use rocprof for performance analysis',
      ],
      steps: [
        'Implement naive matrix multiply',
        'Profile with rocprof --stats',
        'Implement tiled version with LDS',
        'Compare performance',
      ],
      expectedOutput: 'Performance comparison showing LDS version typically 5–10× faster.',
    },
    interviewQuestions: [
      {
        question: 'What is a Wavefront and how does it affect HIP performance?',
        difficulty: 'hard',
        hint: 'SIMT, divergence, occupancy.',
        answer:
          'Wavefront is the smallest scheduling unit (64 threads). Branch divergence serializes execution. Block size should be a multiple of 64. Occupancy is limited by register and LDS usage.',
      },
    ],
  },
  {
    id: 'llvm',
    number: '9',
    title: 'GPU Toolchain & LLVM',
    titleEn: 'GPU Toolchain & LLVM',
    icon: 'Wrench',
    description:
      'Understand how HIP/OpenCL code becomes GPU instructions. The LLVM AMDGPU backend is central to AMD Markham\'s toolchain work.',
    estimatedHours: 60,
    difficulty: 'expert',
    subModules: [
      { id: 'llvm-basics', title: '9.1 LLVM Compiler Framework', titleEn: 'LLVM Compiler Framework' },
      { id: 'llvm-amdgpu', title: '9.2 AMDGPU LLVM Backend', titleEn: 'AMDGPU LLVM Backend' },
    ],
    theory: {
      overview:
        'LLVM provides the compiler infrastructure; the AMDGPU backend lowers IR to GCN/RDNA ISA. Understanding this flow is important for toolchain and compiler work at AMD.',
      sections: [
        {
          title: 'LLVM Compiler Framework',
          content:
            'LLVM uses IR (Intermediate Representation) as a common layer. Frontends (Clang, HIP) produce IR; the AMDGPU backend lowers IR to machine code for AMD GPUs. Pipeline: Source → Frontend → IR → AMDGPU Backend → ISA.',
        },
      ],
      keyBooks: [],
      onlineResources: [
        {
          title: 'LLVM AMDGPU Backend',
          url: 'https://llvm.org/docs/AMDGPUUsage.html',
          type: 'doc',
          description: 'LLVM AMDGPU backend docs.',
        },
      ],
    },
    codeReading: [],
    miniProject: {
      title: 'Build HIP with LLVM and Inspect Generated ISA',
      description: 'Compile a HIP kernel and use llvm-objdump to inspect the generated GCN/RDNA assembly.',
      objectives: [
        'Build ROCm with LLVM',
        'Compile a simple HIP kernel',
        'Inspect ISA output',
      ],
      steps: [
        'Install ROCm toolchain',
        'Compile vector_add.hip with hipcc',
        'Use llvm-objdump -d on the resulting binary',
        'Map ISA instructions to HIP source',
      ],
      expectedOutput: 'ISA dump annotated with corresponding HIP lines.',
    },
    interviewQuestions: [
      {
        question: 'How does the LLVM AMDGPU backend map IR to GCN/RDNA instructions?',
        difficulty: 'hard',
        hint: 'Lowering pipeline, instruction selection, VGPR/SGPR allocation.',
        answer:
          'IR is lowered through selection DAG, instruction selection, register allocation (VGPR/SGPR), and scheduling. The backend targets specific GPUs (e.g. gfx1102) and emits ISA for that target.',
      },
    ],
  },
  {
    id: 'testing',
    number: '10',
    title: 'Testing & CI',
    titleEn: 'Testing & CI',
    icon: 'CheckCircle2',
    description:
      'Learn how to write and run tests. IGT GPU tests, kernel selftests, and reproducible bug reports are part of AMD engineer daily work.',
    estimatedHours: 30,
    difficulty: 'advanced',
    subModules: [
      { id: 'test-igt', title: '10.1 IGT GPU Tests', titleEn: 'IGT GPU Tests' },
      { id: 'test-kernel', title: '10.2 Kernel Selftests', titleEn: 'Kernel Selftests' },
      { id: 'test-bug', title: '10.3 Bug Report Standards', titleEn: 'Bug Report Standards' },
      { id: 'test-ci', title: '10.4 CI & Test Pipeline', titleEn: 'CI & Test Pipeline' },
    ],
    theory: {
      overview:
        'GPU driver testing is critical. The community uses IGT (supports AMD), kernel selftests, and CI pipelines. AMD maintains CI on freedesktop.org; patches trigger IGT runs automatically.',
      sections: [
        {
          title: 'IGT GPU Test Architecture',
          content:
            'IGT contains 1500+ tests for DRM, KMS, GEM, etc. amdgpu tests live in tests/amdgpu/. Tests use igt_main, igt_subtest, igt_assert. lib/igt_amd.h provides AMD-specific helpers.',
        },
      ],
      keyBooks: [],
      onlineResources: [
        {
          title: 'IGT GPU Tools',
          url: 'https://gitlab.freedesktop.org/drm/igt-gpu-tools',
          type: 'repo',
          description: 'IGT source and docs.',
        },
      ],
    },
    codeReading: [],
    miniProject: {
      title: 'Run IGT Tests on Your AMD GPU',
      description: 'Build IGT and run amdgpu and KMS tests on your system.',
      objectives: [
        'Build IGT from source',
        'Run amdgpu and kms_* tests',
        'Interpret pass/fail and skip',
      ],
      steps: [
        'Clone igt-gpu-tools',
        'Build with meson',
        'Run igt_runner -t amdgpu',
        'Run igt_runner -t kms_atomic',
      ],
      expectedOutput: 'Test run results with pass/fail/skip counts.',
    },
    interviewQuestions: [
      {
        question: 'How would you debug an IGT test failure with ftrace?',
        difficulty: 'hard',
        hint: 'ftrace setup, function tracer, event tracing, log analysis.',
        answer:
          'Enable ftrace (function or events). Set filter to amdgpu_* or drm_ioctl. Run the failing test. Stop trace and capture output. Look for error returns, call-chain breaks, or deadlock patterns.',
      },
    ],
  },
  {
    id: 'career',
    number: '11',
    title: 'Contribution & Career',
    titleEn: 'Contribution & Career',
    icon: 'Target',
    description:
      'Turn learning into career advantage. Learn to submit patches to the Linux kernel, build a portfolio, and prepare for AMD interviews.',
    estimatedHours: 30,
    difficulty: 'intermediate',
    subModules: [
      { id: 'career-patch', title: '11.1 Kernel Patch Workflow', titleEn: 'Kernel Patch Workflow' },
      { id: 'career-portfolio', title: '11.2 Building Your Portfolio', titleEn: 'Building Your Portfolio' },
      { id: 'career-interview', title: '11.3 AMD Interview Prep', titleEn: 'AMD Interview Prep' },
    ],
    theory: {
      overview:
        'This is both the end of the learning path and the start of your career. A merged kernel patch is strong proof of your kernel skills. This module walks from finding a bug to getting a patch merged and turning that into interview advantage.',
      sections: [
        {
          title: 'Kernel Patch Workflow',
          content:
            'Flow: (1) Find a fixable issue (bug, cleanup, doc); (2) Fix and test locally; (3) git format-patch; (4) scripts/checkpatch.pl; (5) scripts/get_maintainer.pl; (6) git send-email to the right list (amd-gfx for amdgpu); (7) Respond to review; (8) Patch goes to drm-next, then mainline.',
        },
      ],
      keyBooks: [
        {
          title: 'Linux Kernel Development Process',
          author: 'Jonathan Corbet (LWN.net)',
          relevance: 'Patch submission, review, community process.',
          url: 'https://docs.kernel.org/process/development-process.html',
        },
      ],
      onlineResources: [
        {
          title: 'How to submit patches',
          url: 'https://docs.kernel.org/process/submitting-patches.html',
          type: 'doc',
          description: 'Official patch submission guide.',
        },
        {
          title: 'AMD GPU Driver Mailing List (amd-gfx)',
          url: 'https://lists.freedesktop.org/mailman/listinfo/amd-gfx',
          type: 'doc',
          description: 'Subscribe to see amdgpu patches and discussions.',
        },
        {
          title: 'AMD Careers',
          url: 'https://careers.amd.com',
          type: 'doc',
          description: 'Search for "Linux Driver" or "GPU Driver" roles.',
        },
      ],
    },
    codeReading: [],
    miniProject: {
      title: 'Submit Your First Kernel Patch',
      description:
        'Find a real issue in amdgpu (doc typo, cleanup, simple bug) and submit a patch to amd-gfx.',
      objectives: [
        'Complete the full patch workflow',
        'Receive Code Review from AMD engineers',
        'Get your name in kernel history',
      ],
      steps: [
        'Subscribe to amd-gfx and read recent patches',
        'Search amdgpu source for improvements',
        'Follow the workflow: fix, checkpatch, send',
        'Respond to review and send v2 if needed',
      ],
      expectedOutput:
        'A patch sent to amd-gfx and Review feedback. Even if not merged, the experience is valuable for your portfolio.',
    },
    interviewQuestions: [
      {
        question: 'Describe your kernel patch experience—challenges and how you solved them.',
        difficulty: 'medium',
        hint: 'STAR: Situation, Task, Action, Result. Show process understanding.',
        answer:
          'Describe the specific issue, your analysis, fix, tests, checkpatch, send-email, and how you handled review. If rejected, explain what you learned.',
      },
    ],
  },
];
