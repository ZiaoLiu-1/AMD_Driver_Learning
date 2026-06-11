// ============================================================
// AMD Linux Driver Learning Platform - Module 5 Micro-Lessons (English)
// Module 5: AMDGPU Deep Dive
// 9 lessons in 4 groups, ~15-20 min each, total ~160 min
// ============================================================
import type { MicroLessonModule } from './micro_lesson_types';

export const module5MicroLessonsEn: MicroLessonModule = {
  moduleId: 'amdgpu',
  groups: [
    // ════════════════════════════════════════════════════════════
    // Group 5.1: Code Navigation & Architecture
    // ════════════════════════════════════════════════════════════
    {
      id: '5-1',
      number: '5.1',
      title: 'Code navigation and architecture',
      titleEn: 'Code Navigation & Architecture',
      icon: '🗺️',
      description: 'Learn to efficiently navigate the large amdgpu driver codebase and understand the IP Block modular architecture - the foundation for reading and contributing to amdgpu code.',
      lessons: [
        // ── Lesson 5.1.1 ──────────────────────────────────────
        {
          id: '5-1-1',
          number: '5.1.1',
          title: 'AMDGPU Code Navigation Guide',
          titleEn: 'Navigating the AMDGPU Source Tree',
          duration: 20,
          difficulty: 'expert',
          tags: ['amdgpu', 'source-tree', 'cscope', 'ctags', 'code-navigation'],
          concept: {
            summary: 'The amdgpu driver is located under drivers/gpu/drm/amd/ and spans a large multi-directory codebase. Mastering the directory structure, naming conventions and code navigation tools (cscope/ctags/clangd) is a prerequisite for efficient source code reading - otherwise you will get lost in the ocean of code.',
            explanation: [
              'drivers/gpu/drm/amd/ is the top-level directory of the amdgpu driver. It is divided into multiple subdirectories according to functions. The core ones are amdgpu/ (GPU device management, command submission, memory management, etc.), display/dc/ (Display Core display engine, accounting for about 40% of the entire driver code), amdkfd/ (KFD, Kernel Fusion Driver, kernel interface for ROCm calculation) and pm/ (power management, including SMU and powerplay). Understanding the responsibilities of each directory is the first step in navigation.',
              'The amdgpu driver has strict file naming conventions. Files suffixed with the IP Block version (such as gfx_v11_0.c, sdma_v6_0.c, vcn_v4_0.c) are the specific implementation of the hardware generation - v11_0 corresponds to the GFX engine of RDNA3, and v6_0 corresponds to the SDMA engine of RDNA3. Files prefixed with amdgpu_ (such as amdgpu_device.c, amdgpu_cs.c, amdgpu_vm.c) are common logic across generations. This specification allows you to quickly determine whether a file is general code or a hardware-specific implementation.',
              'amdgpu_device.c is the core hub of the entire driver - it contains amdgpu_device_init() (device initialization entry), amdgpu_device_ip_init() (IP Block initialization loop) and GPU reset logic. amdgpu_drv.c is the PCI driver entry, including module_init, pciidlist and probe functions. Understanding the calling relationship between these two files is the basis for understanding the entire driver startup process.',
              'For code navigation, cscope and ctags are classic tools for kernel development. Run make cscope tags in the kernel source code root directory to generate an index database. The core capabilities of cscope are "finding all locations where a function is called" (:cs find c function_name) and "finding function definition" (:cs find g function_name), which are extremely efficient when tracing the call chain. For modern IDE users, clangd can provide a better experience with compile_commands.json - after running scripts/clang-tools/gen_compile_commands.py to generate the database, VS Code\'s clangd extension can provide precise jumps and completions.',
              'CRITICAL SAFETY WARNING: Writing to incorrect MMIO register offsets will instantly hard-lock your entire system — no Ctrl+C, no SSH, only a power cycle recovers. This is not a software crash that the kernel can catch; it\'s a hardware-level hang caused by the GPU entering an unrecoverable state. In AMD\'s offices, engineers are told on day one: never touch MMIO registers without the hardware specification (which AMD provides under NDA). When learning, always use umr (read-only by default) to inspect registers, and test any register writes in a VM or spare machine. The amdgpu driver\'s WREG32/RREG32 macros are safe because they write to registers that AMD engineers have validated, but adding new register accesses requires hardware spec verification.',
            ],
            keyPoints: [
              'amdgpu/ — GPU core: device management, command submission (CS), virtual memory (VM), Buffer object (BO)',
              'display/dc/ — display engine: about 40% code volume, hardware-independent layer + DCN hardware layer',
              'amdkfd/ — Computing kernel interface: kernel side of ROCm/HIP, KFD doorbell, queue management',
              'pm/ — Power management: SMU firmware communication, DVFS, power limiting, fan control',
              'Naming convention: *_v11_0 = RDNA3 GFX, *_v6_0 = RDNA3 SDMA, dcn32 = RDNA3 Display',
              'amdgpu_device.c is the driver core hub, amdgpu_drv.c is the PCI entry point',
            ],
          },
          diagram: {
            title: 'amdgpu driver source code directory structure',
            content: `drivers/gpu/drm/amd/ — amdgpu driver source code top-level structure
├── amdgpu/                     ←GPU core subsystem (~1.2M lines)
│   ├── amdgpu_drv.c            ←PCI driver entry, module_init, pciidlist
│   ├── amdgpu_device.c         ←★ Core hub: device_init, ip_init, GPU reset
│   ├── amdgpu_cs.c             ←Command submission: amdgpu_cs_ioctl
│   ├── amdgpu_vm.c             ←GPU virtual memory management
│   ├── amdgpu_object.c         ←Buffer Object (BO) management
│   ├── amdgpu_ring.c           ←Ring Buffer abstraction layer
│   ├── amdgpu_fence.c          ←Fence synchronization mechanism
│   ├── amdgpu_irq.c            ←Interrupt handling framework
│   ├── amdgpu_gmc.c            ←GPU Memory Controller Common Layer
│   │
│   ├── gfx_v11_0.c             ←GFX IP: RDNA3 graphics/computing engine
│   ├── gfx_v10_0.c             ← GFX IP: RDNA2
│   ├── gfx_v9_0.c              ← GFX IP: GCN5 (Vega)
│   ├── sdma_v6_0.c             ←SDMA IP: RDNA3 DMA engine
│   ├── vcn_v4_0.c              ←VCN IP: RDNA3 video codec
│   ├── psp_v13_0.c             ←PSP IP: Security Processor
│   └── nbio_v7_7.c             ←NBIO: Northbridge I/O
│
├── display/dc/                  ←Display Core (~1.6M lines, largest subsystem)
│   ├── core/dc.c               ←DC core: dc_commit_streams, etc.
│   ├── dc_stream.h             ←display flow abstraction
│   ├── dcn32/                  ←RDNA3 DCN 3.2 hardware layer
│   ├── dcn321/                 ←RDNA3 DCN 3.2.1 variant
│   ├── dml/                    ←Display Mode Library (bandwidth calculation)
│   └── link/                   ←DP/HDMI link layer
│
├── amdkfd/                      ←Kernel Fusion Driver (~100K lines)
│   ├── kfd_device.c            ←KFD device management
│   ├── kfd_process.c           ←Process queue management
│   ├── kfd_doorbell.c          ←Doorbell mapping (direct submission from user mode)
│   └── kfd_chardev.c           ←/dev/kfd character device
│
├── pm/                          ←Power management (~300K lines)
│   ├── swsmu/                  ←Software SMU interface
│   │   ├── smu13/              ← SMU v13（RDNA3）
│   │   └── amdgpu_smu.c       ←SMU common abstraction layer
│   └── powerplay/              ←Legacy power management (GCN era)
│
└── include/                     ←Shared header files
    ├── amdgpu_ring.h           ←Ring Buffer data structure
    ├── amdgpu_vm.h             ←VM data structure
    └── asic_reg/               ←GPU register definitions (automatically generated)
        └── gc/gc_11_0_0_offset.h  ←RDNA3 GFX register address`,
            caption: 'Complete directory structure of amdgpu driver. display/dc/ is the largest subsystem (about 40% of the code), and amdgpu/ is the core subsystem. The version numbers (v11_0, v6_0) in the file name directly correspond to the GPU hardware generation.',
          },
          codeWalk: {
            title: 'amdgpu_device_init — core call chain for driver initialization',
            file: 'drivers/gpu/drm/amd/amdgpu/amdgpu_device.c',
            language: 'c',
            code: `/*amdgpu_device_init() — Called from the PCI probe to initialize the entire GPU device
 *This is one of the core functions in the amdgpu driver. Understand its call chain.
 *You can understand the entire driver startup process.
 */
int amdgpu_device_init(struct amdgpu_device *adev,
                        uint32_t flags)
{
    /*Phase 1: Basic setup */
    adev->flags = flags;
    adev->asic_type = flags & AMD_ASIC_MASK;

    /*Map GPU register space (BAR 5) to kernel virtual address */
    adev->rmmio_size = pci_resource_len(adev->pdev, 5);
    adev->rmmio = ioremap(pci_resource_start(adev->pdev, 5),
                           adev->rmmio_size);
    /*The GPU registers can then be accessed using WREG32/RREG32 */

    /*Phase 2: IP Discovery — Determine what IP Blocks this GPU has */
    r = amdgpu_discovery_set_ip_blocks(adev);
    /*Register all IP Blocks according to the GPU's IP Discovery table:
     *   gfx_v11_0_ip_block (RDNA3 GFX)
     *   sdma_v6_0_ip_block (RDNA3 SDMA)
     *   psp_v13_0_ip_block (PSP)
     *   smu_v13_0_ip_block (SMU)
     *   dcn32_ip_block     (Display)
     *... etc
     */

    /*Stage 3: Firmware loading */
    r = amdgpu_device_fw_loading(adev);

    /*Phase 4: Initialize all IP Blocks */
    r = amdgpu_device_ip_init(adev);
    /*Traverse all registered IP Blocks and call them in sequence:
     *ip_block->funcs->early_init(adev) — early initialization
     *ip_block->funcs->sw_init(adev) — software layer initialization
     *ip_block->funcs->hw_init(adev) — Hardware initialization
     */

    /*Stage 5: Register DRM device */
    r = amdgpu_device_register(adev);
    /*The GPU can now accept userspace requests */

    return 0;
}`,
            annotations: [
              'adev (struct amdgpu_device) is the core data structure of the entire driver, including all GPU status',
              'ioremap() maps the physical address of the PCI BAR to the kernel virtual address before using WREG32/RREG32',
              'amdgpu_discovery_set_ip_blocks() is a dynamic IP discovery mechanism introduced by RDNA2+, replacing hard coding',
              'amdgpu_device_ip_init() initializes all IP Blocks in dependency order (PSP → GMC → GFX → ...)',
              'early_init → sw_init → hw_init The three-phase initialization ensures the correct handling of dependencies',
              'Returning a non-zero value at any stage will cause the probe to fail, corresponding to "hw_init of IP block <xxx> failed" in dmesg',
            ],
            explanation: 'This function is the "map" for understanding the entire amdgpu driver. When you see driver loading failure in dmesg, it can almost always be traced back to some stage of this function. Using cscope to trace the call chain of amdgpu_device_init (:cs find c amdgpu_device_init) is the best starting point for learning the driver architecture.',
          },
          miniLab: {
            title: 'Use cscope to find all callers of amdgpu_bo_create',
            objective: 'Use cscope in the kernel source code to trace the call chain of amdgpu_bo_create and understand the scenarios in which Buffer Objects are created.',
            setup: `cd ~/kernel-src
make cscope tags  #If the index has not been generated yet`,
            steps: [
              'Use cscope to find the definition of amdgpu_bo_create: cscope -d -L -1 amdgpu_bo_create',
              'Find all calls to amdgpu_bo_create: cscope -d -L -3 amdgpu_bo_create',
              'Save the results to a file: cscope -d -L -3 amdgpu_bo_create > /tmp/bo_create_callers.txt',
              'Count the number of callers: wc -l /tmp/bo_create_callers.txt',
              'Check out the most common calling scenarios: cat /tmp/bo_create_callers.txt | awk -F: \'{print $1}\' | sort | uniq -c | sort -rn',
              'Select a caller (such as amdgpu_gem_create_ioctl) and trace its upper-level calls: cscope -d -L -3 amdgpu_gem_create_ioctl',
            ],
            expectedOutput: `$ cscope -d -L -3 amdgpu_bo_create | head -5
drivers/gpu/drm/amd/amdgpu/amdgpu_gem.c 120 amdgpu_gem_create_ioctl ...
drivers/gpu/drm/amd/amdgpu/amdgpu_vram_mgr.c 85 ...
drivers/gpu/drm/amd/amdgpu/amdgpu_ttm.c 200 ...
drivers/gpu/drm/amd/amdgpu/amdgpu_amdkfd_gpuvm.c 340 ...

$ wc -l /tmp/bo_create_callers.txt
25     ←amdgpu_bo_create is called at about 25 places`,
            hint: 'The -L parameter of cscope indicates line mode (non-interactive), -1 searches for definitions, -3 searches for callers, and -0 searches for symbols. If the cscope database is out of date, rerun make cscope to update.',
          },
          debugExercise: {
            title: 'Quickly locate problems in unfamiliar code',
            language: 'c',
            description: 'You see the following error message in dmesg. Use code navigation skills to locate problem source files and functions.',
            question: 'How to locate the specific source code location through this dmesg error message? Describe your search steps.',
            buggyCode: `[drm:amdgpu_device_ip_init [amdgpu]] *ERROR*
  hw_init of IP block <gfx_v11_0> failed -22

/*You need to answer:
 *1. Which file contains the hw_init implementation for gfx_v11_0?
 *2. What does error code -22 mean?
 *3. How to find the exact failure point using cscope/grep?
 */`,
            hint: '"gfx_v11_0" in the error message directly corresponds to the file name naming convention. -22 is a standard Linux error code.',
            answer: 'Positioning steps: (1) The file name is directly derived from the IP Block name: gfx_v11_0 → gfx_v11_0.c, the full path is drivers/gpu/drm/amd/amdgpu/gfx_v11_0.c. (2) Error code -22 = -EINVAL (Invalid argument), search method: grep -r "define EINVAL" include/uapi/asm-generic/errno-base.h. (3) Use cscope to find hw_init implementation: first search for gfx_v11_0_hw_init (the naming specification is IP name_operation name), cscope -d -L -1 gfx_v11_0_hw_init will directly locate the definition. (4) Search the function for return -EINVAL or return r (where r may be an error code propagated from a sub-function). (5) A more precise method: enable dynamic debugging (echo "file gfx_v11_0.c +p" > /sys/kernel/debug/dynamic_debug/control) and then reproduce the problem, dmesg will display the detailed execution path within the function. This ability to reversely locate source code from dmesg is a core skill for GPU driver debugging.',
          },
          interviewQ: {
            question: 'Describe the source code directory structure of the amdgpu driver. If you were asked to fix a display flickering problem on an RDNA3 GPU, which files would you start with?',
            difficulty: 'medium',
            hint: 'First describe the top-level directories (amdgpu/, display/dc/, pm/, amdkfd/), and then locate display/dc/ and dcn32/ for display problems.',
            answer: 'The amdgpu driver top-level directory drivers/gpu/drm/amd/ contains four core subdirectories: (1) amdgpu/ — GPU core subsystem: device management (amdgpu_device.c), command submission (amdgpu_cs.c), virtual memory (amdgpu_vm.c), interrupt (amdgpu_irq.c), each IP Block hardware implementation (gfx_v11_0.c etc.); (2) display/dc/ — Display Core: accounts for about 40% of the code, including hardware-independent core layer (core/dc.c) and hardware-related layers (dcn32/, etc.); (3) amdkfd/ — ROCm computing kernel interface; (4) pm/ — power management (SMU communication, DVFS). For RDNA3 display flickering issues, I would start with these files: (a) display/dc/dcn32/ — DCN 3.2 hardware layer of RDNA3, checking timing and watermark calculations; (b) display/dc/core/dc.c — dc_commit_streams() function checking state commit logic; (c) display/dc/dml/ — Display Mode Library Whether the bandwidth calculation is correct; (d) Search "dc_commit" and "underflow" keywords in dmesg to locate the specific stage. At the same time, use git log -- display/dc/dcn32/ to check whether recent modifications have introduced regressions.',
            amdContext: 'This question tests your familiarity with the code base and debugging ideas. AMD interviewers will assess your ability to quickly narrow your search from problem description to specific documents.',
          },
        },

        // ── Lesson 5.1.2 ──────────────────────────────────────
        {
          id: '5-1-2',
          number: '5.1.2',
          title: 'IP Block Architecture: GPU Function Modular Design',
          titleEn: 'IP Block Architecture: Modular GPU Design',
          duration: 20,
          difficulty: 'expert',
          tags: ['IP-block', 'amdgpu_ip_block', 'modular', 'hw_init', 'callbacks'],
          concept: {
            summary: 'The amdgpu driver abstracts each hardware functional unit of the GPU (GFX, SDMA, DC, VCN, PSP, SMU, etc.) into an IP Block, and each IP Block implements a unified callback interface (early_init/sw_init/hw_init/suspend/resume, etc.). This modular design allows the driver to support all AMD GPUs from GCN to RDNA4 using the same framework.',
            explanation: [
              'IP Block (Intellectual Property Block) is a software mapping of the modular design concept of AMD GPU hardware. At the hardware level, a GPU chip is composed of multiple independent functional units: GFX (graphics/computing engine), SDMA (System DMA engine), VCN (Video Core Next video codec), DCN (Display Controller Next), PSP (Platform Security Processor), SMU (System Management Unit power management), etc. Each functional unit corresponds to an IP Block in the software.',
              'struct amdgpu_ip_block_version defines the metadata (type, version number) of an IP Block, and struct amd_ip_funcs defines a unified callback interface. Each IP Block must implement the following core callbacks: name (IP Block name), early_init (early initialization, check hardware capabilities), sw_init (software resource allocation, such as memory/queue), hw_init (hardware initialization, write registers/load firmware), hw_fini (hardware de-initialization), sw_fini (release software resources), suspend/resume (power management). This set of interfaces allows amdgpu_device_ip_init() to initialize all IP Blocks in a unified loop without knowing the specific implementation of each IP.',
              'Taking the GFX engine of RDNA3 as an example, gfx_v11_0.c implements the gfx_v11_0_ip_funcs structure, and its hw_init callback (gfx_v11_0_hw_init) will: load the GFX firmware to the GPU, configure the number of shader engines (Shader Engine), initialize the Ring Buffer (GFX Ring, Compute Ring), and start the Command Processor (CP). If AMD releases a new generation of GPUs (such as RDNA4), it only needs to add a new gfx_v12_0.c file to implement the same interface, and the core framework code does not need to be modified.',
              'The order in which IP Blocks are initialized is important - there are dependencies. PSP must be initialized first (because the firmware of other IP Blocks requires PSP to verify the signature), GMC (Graphics Memory Controller) must be initialized before GFX (because GFX requires GPU virtual memory support), and SMU must be initialized before GFX (because GFX requires clock and voltage). This order is determined by the registration order in amdgpu_discovery_set_ip_blocks().',
            ],
            keyPoints: [
              'IP Block = software abstraction of GPU hardware functional units (GFX, SDMA, VCN, DCN, PSP, SMU)',
              'struct amd_ip_funcs defines unified callback interface: early_init/sw_init/hw_init/suspend/resume, etc.',
              'amdgpu_device_ip_init() uses a unified loop to initialize all IP Blocks and does not care about the specific implementation.',
              'The initialization sequence depends on: PSP → GMC → SMU → GFX → SDMA → VCN → DC',
              'Naming convention: gfx_v11_0 (RDNA3), gfx_v10_0 (RDNA2), gfx_v9_0 (Vega/GCN5)',
              'The IP Discovery table (RDNA2+) allows the GPU to self-describe its IP Block composition, replacing the hard-coded list',
            ],
          },
          diagram: {
            title: 'IP Block Architecture and Initialization Process',
            content: `amdgpu IP Block Architecture

┌─────────────────────────────────────────────────────────────────┐
│ struct amd_ip_funcs (unified callback interface) │
│  ┌──────────┬──────────┬──────────┬──────────┬──────────┐      │
│  │early_init│ sw_init  │ hw_init  │ suspend  │ resume   │      │
│ │Check capabilities │Allocate resources │Write registers │Save state │Restore state │ │
│ │ │(Memory/Queue)│Loading firmware │Preparing for power failure │Reinitialization│ │
│  └──────────┴──────────┴──────────┴──────────┴──────────┘      │
└──────────────────────────┬──────────────────────────────────────┘
│ Each IP Block implements this set of interfaces
    ┌──────────────────────┼──────────────────────────────┐
    ▼                      ▼                              ▼
┌──────────┐     ┌──────────────┐     ┌──────────────────────┐
│ PSP      │     │ GFX          │     │ DC (Display Core)    │
│ v13_0    │     │ v11_0 (RDNA3)│     │ DCN 3.2 (RDNA3)     │
│          │     │              │     │                      │
│ hw_init: │     │ hw_init:     │     │ hw_init:             │
│ ·Load PSP │ │ ·Load GFX FW │ │ ·Initialize display pipeline │
│ Firmware │ │ ·Configuring SE/CU │ │ ·Detecting connected monitors │
│ ·Verify security│ │ ·Initialize Ring │ │ ·Set default resolution │
│ Signature │ │ ·Start CP │ │ │
└────┬─────┘     └──────┬───────┘     └──────────┬───────────┘
     │                  │                         │
     ▼                  ▼                         ▼
┌──────────┐     ┌──────────────┐     ┌──────────────────────┐
│ SMU      │     │ SDMA         │     │ VCN                  │
│ v13_0    │     │ v6_0 (RDNA3) │     │ v4_0 (RDNA3)        │
│          │     │              │     │                      │
│ hw_init: │     │ hw_init:     │     │ hw_init:             │
│ ·Initialization │ │ ·Load SDMA FW│ │ ·Load VCN firmware │
│ SMU communication │ │ ·Initialize SDMA │ │ ·Initialize codec engine │
│ ·Set Default │ │ Ring Buffer │ │ ·Configure DPG Mode │
│Power consumption limit│ │ │ │ │
└──────────┘     └──────────────┘     └──────────────────────┘

Initialization sequence (traversal sequence in amdgpu_device_ip_init):

  PSP ──→ GMC ──→ IH ──→ SMU ──→ GFX ──→ SDMA ──→ VCN ──→ DC
Security Memory Interrupt Power Graphics DMA Video Display
  │                                │
└── GFX firmware signing requires PSP └── GFX requires GMC (virtual memory)
and SMU (clock/voltage)`,
            caption: 'The core idea of ​​the IP Block architecture: Each hardware functional unit implements a unified callback interface, and the driver framework initializes all IP Blocks through cyclic calls. The initialization order is determined by dependencies.',
          },
          codeWalk: {
            title: 'gfx_v11_0_ip_block — RDNA3 GFX IP Block definition',
            file: 'drivers/gpu/drm/amd/amdgpu/gfx_v11_0.c',
            language: 'c',
            code: `/*gfx_v11_0.c — callback implementation of RDNA3 GFX IP Block */

/*Callback function table: each function handles a life cycle stage */
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

/*IP Block version information */
const struct amdgpu_ip_block_version gfx_v11_0_ip_block = {
    .type = AMD_IP_BLOCK_TYPE_GFX,
    .major = 11,
    .minor = 0,
    .rev = 0,
    .funcs = &gfx_v11_0_ip_funcs,
};

/*hw_init example (significantly simplified)*/
static int gfx_v11_0_hw_init(void *handle)
{
    struct amdgpu_device *adev = (struct amdgpu_device *)handle;
    int r;

    /*1. Load GFX engine microcode to GPU */
    r = gfx_v11_0_cp_resume(adev);
    if (r)
        return r;

    /*2. Initialize GFX Ring Buffer */
    r = amdgpu_ring_test_helper(&adev->gfx.gfx_ring[0]);
    if (r)
        return r;

    /*3. Initialize Compute Ring Buffers */
    for (i = 0; i < adev->gfx.num_compute_rings; i++) {
        r = amdgpu_ring_test_helper(
            &adev->gfx.compute_ring[i]);
        if (r)
            return r;
    }
    return 0;
}

/*Unified initialization loop in amdgpu_device_ip_init (simplified) */
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
              'The gfx_v11_0_ip_funcs table aggregates all callbacks into a structure that is called by the framework through a function pointer',
              'AMD_IP_BLOCK_TYPE_GFX is an enumeration value that distinguishes different types of IP such as GFX/SDMA/VCN/DC',
              'major=11, minor=0 corresponds to IP version 11.0 and matches in the IP Discovery table',
              'cp_resume in hw_init loads the Command Processor microcode - CP is the entry point for GPU command execution',
              'amdgpu_ring_test_helper writes test commands to the Ring Buffer and verifies GPU response',
              'The loop of amdgpu_device_ip_init shows how the framework handles the initialization of all IP Blocks uniformly',
            ],
            explanation: 'This code shows the essence of IP Block mode: gfx_v11_0.c only needs to implement the amd_ip_funcs interface, and the framework code amdgpu_device_ip_init() can automatically initialize it. When RDNA4 is released, you only need to add gfx_v12_0.c to implement the same interface, and there is no need to modify the framework code. This design allows amdgpu to support all AMD GPU generations with a single driver.',
          },
          miniLab: {
            title: 'List all IP Blocks and their versions for your GPU',
            objective: 'Use debugfs to view all IP Blocks actually running on your AMD GPU (the example uses RX 7600 XT / gfx1102 as a reference) and verify the IP Block registration in the code.',
            setup: '# Make sure debugfs is mounted\nsudo mount -t debugfs none /sys/kernel/debug 2>/dev/null',
            steps: [
              'View IP Block information: sudo cat /sys/kernel/debug/dri/0/amdgpu_firmware_info',
              'View the IP discovery table: sudo cat /sys/kernel/debug/dri/0/amdgpu_ip_discovery 2>/dev/null || echo "Newer kernel version required"',
              'Extract IP Block initialization sequence from dmesg: dmesg | grep -i "ip block\\|hw_init\\|sw_init"',
              'Check GFX IP version: dmesg | grep -i "gfx.*v[0-9]"',
              'Verify in the source code: grep -rn "gfx_v11_0_ip_block" drivers/gpu/drm/amd/amdgpu/',
              'Compare other IP Block versions: dmesg | grep -iE "(sdma|vcn|psp|smu|dcn).*v[0-9]"',
            ],
            expectedOutput: `$ sudo cat /sys/kernel/debug/dri/0/amdgpu_firmware_info
GFX ME feature version: 86, firmware version: 0x...
GFX PFP feature version: 86, firmware version: 0x...
SDMA0 feature version: 60, firmware version: 0x...
VCN feature version: 0, firmware version: 0x...
...

The IP Block composition of Navi33 (RDNA3):
  GFX 11.0, SDMA 6.0, VCN 4.0, DCN 3.2, PSP 13.0, SMU 13.0`,
            hint: 'If the debugfs path does not exist or has insufficient permissions, use dmesg information instead. The debugfs path may be /sys/kernel/debug/dri/0/ or /sys/kernel/debug/dri/1/, depending on whether your GPU is card0 or card1.',
          },
          debugExercise: {
            title: 'IP Block initialization sequence dependency failed',
            language: 'c',
            description: 'The following code attempts to register and initialize the DC (Display Core) before the GFX IP Block, but causes startup failure.',
            question: 'Why does switching the initialization order of DC and GFX cause failure? What is the error message?',
            buggyCode: `/*Wrong IP Block registration sequence */
int amdgpu_discovery_set_ip_blocks(struct amdgpu_device *adev)
{
    /*... PSP, GMC, SMU normal registration ... */

    /*BUG: DC is registered before GFX */
    amdgpu_device_ip_block_add(adev, &dcn32_ip_block);
    amdgpu_device_ip_block_add(adev, &gfx_v11_0_ip_block);

    /*The original correct order should be:
     * amdgpu_device_ip_block_add(adev, &gfx_v11_0_ip_block);
     * amdgpu_device_ip_block_add(adev, &dcn32_ip_block);
     */
    return 0;
}`,
            hint: 'DC initialization relies on the GFX Ring Buffer to send display-related GPU commands (such as cursor updates).',
            answer: 'The initialization of DC (Display Core) relies on the GFX engine being ready for the following reasons: (1) DC needs to submit GPU commands for certain display operations (such as hardware cursor update, 3D LUT loading) through the GFX Ring Buffer; (2) GPU-accessible memory (such as framebuffer) needs to be allocated during the DC initialization process, which requires that the virtual address mapping of GMC and GFX has worked; (3) DC will try to do mode setting in hw_init and lights up the display, which requires submitting commands to the GPU. If GFX has not been initialized and the Ring Buffer does not exist, the DC command submission will fail, and you will see something like "[drm:dc_commit_streams_no_check] *ERROR* dc_commit_streams_no_check failed" or "hw_init of IP block <dm> failed -22" in dmesg. The correct order is PSP → GMC → IH → SMU → GFX → SDMA → VCN → DC/DM, DC is always after GFX.',
          },
          interviewQ: {
            question: 'Explain the IP Block architecture of amdgpu driver. What are the pros and cons of this design pattern?',
            difficulty: 'hard',
            hint: 'Analysis from the perspective of software design patterns (strategy pattern/interface abstraction), maintainability (support for multiple generations of GPUs), and potential problems (inter-IP dependencies, error propagation).',
            answer: 'The IP Block architecture is the core design pattern of the amdgpu driver. It is essentially the application of the Strategy Pattern in the kernel driver. Each IP Block defines a unified interface through struct amd_ip_funcs, and the framework code is implemented specifically through function pointer calls. Advantages: (1) Supports multiple generations of GPUs - new GPUs only need to add IP implementation files, and the framework remains unchanged; (2) Independent development and testing - DC team and GFX team can work independently; (3) Clear life cycle management - init/fini/suspend/resume are all unified; (4) Convenient error isolation - failure to initialize a certain IP Block can be accurately located. Disadvantages: (1) Implicit dependencies between IP Blocks - the initialization order is determined by the registration order, and dependencies are not reflected in the type system; (2) Over-abstraction - some IP Blocks have unique requirements, and being forced to adapt to a unified interface will lead to workaround; (3) Error propagation is not fine-grained enough - hw_init fails and only returns an error code, losing context; (4) Code bloat - each IP version has its own file, and a lot of code is repeated between different versions. AMD is mitigating these issues through IP Discovery mechanisms and common code extraction.',
            amdContext: 'This question tests your deep understanding of driver architecture. AMD interviewers will pay special attention to whether you can objectively analyze the advantages and disadvantages, rather than just praise the design. Mentioning inter-IP dependency issues and code duplication is a plus.',
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
      title: 'Command submission and synchronization',
      titleEn: 'Command Submission & Synchronization',
      icon: 'Radio',
      description: 'Dive into the complete path of GPU command submission - from userspace ioctl to Ring Buffer to GPU execution, and how the Fence synchronization mechanism coordinates the CPU and GPU.',
      lessons: [
        // ── Lesson 5.2.1 ──────────────────────────────────────
        {
          id: '5-2-1',
          number: '5.2.1',
          title: 'GPU command submission: from ioctl to Ring Buffer',
          titleEn: 'GPU Command Submission: From ioctl to Ring Buffer',
          duration: 20,
          difficulty: 'expert',
          tags: ['command-submission', 'ioctl', 'ring-buffer', 'PM4', 'IB', 'doorbell'],
          concept: {
            summary: 'GPU command submission is the core data path of the driver: the user space submits the command through DRM_IOCTL_AMDGPU_CS, the driver verifies and parses the command package (IB), writes it to the Ring Buffer, and finally writes it to the Doorbell register to notify the GPU\'s Command Processor (CP) to start execution. Understanding this path is key to understanding how GPUs work.',
            explanation: [
              'Command Submission (CS) is the starting point for any work performed by the GPU. Whether rendering a frame of a game or running an AI inference task, GPU commands need to be submitted from the CPU to the GPU. In amdgpu, this path starts from ioctl(fd, DRM_IOCTL_AMDGPU_CS, &cs) in user space and ends with the GPU\'s Command Processor reading the command in the Ring Buffer.',
              'GPU commands are encoded in PM4 (Packet Manager 4) format - the command packet format used by AMD GPUs since R600. Each PM4 packet consists of a header (type, opcode, count) and a data body. The user-space Mesa driver (radeonsi/radv) is responsible for compiling OpenGL/Vulkan API calls into PM4 command packet sequences, which are stored in IB (Indirect Buffer). The IB is a block of GPU-accessible memory that contains a contiguous set of PM4 commands.',
              'amdgpu_cs_ioctl() is the entry function in the kernel that handles command submission. Its workflow: (1) amdgpu_cs_parser_init() parses the ioctl parameters and verifies the IB address and size passed in by the user; (2) amdgpu_cs_parser_bos() verifies and maps all Buffer Objects referenced by the command (ensuring that the GPU can access them); (3) amdgpu_cs_submit() writes the IB reference to the Ring Buffer - Ring Buffer It does not directly contain the complete command, but contains a pointer to the IB (INDIRECT_BUFFER PM4 package). The GPU\'s CP will follow this pointer to read the actual command in the IB.',
              'Ring Buffer is the core communication mechanism between CPU and GPU. It is a ring-shaped memory area. The CPU writes new commands through WPTR (Write Pointer), and the GPU\'s CP reads commands through RPTR (Read Pointer). When the CPU writes a new command, it updates WPTR and writes to the Doorbell register - this MMIO write nudges the hardware or firmware path that observes the new pointer value so the CP knows there is more work to fetch. CP compares RPTR and WPTR. If WPTR > RPTR, there is a new command pending. Each IP Block has its own Ring: GFX Ring (graphics/computing command), SDMA Ring (DMA transfer command), VCN Ring (video codec command).',
            ],
            keyPoints: [
              'CS path: ioctl → amdgpu_cs_ioctl → parser → Verify BO → Write Ring Buffer → Doorbell',
              'PM4 command package: standard command format for AMD GPUs, built by Mesa (user mode)',
              'IB (Indirect Buffer): GPU-accessible memory, which stores the actual PM4 command sequence',
              'Ring Buffer is a ring FIFO for CPU-GPU communication, WPTR (CPU write) / RPTR (GPU read)',
              'Doorbell is a MMIO register write that notifies the GPU Command Processor of new commands.',
              'Each IP Block has an independent Ring: GFX Ring, SDMA Ring, VCN Enc/Dec Ring',
            ],
          },
          diagram: {
            title: 'Command submission full path',
            content: `Complete data path submitted by GPU commands

User space (Mesa radeonsi/radv)
┌─────────────────────────────────────────────────────────────┐
│ 1. Mesa builds PM4 command package and writes to IB (Indirect Buffer) │
│                                                              │
│IB (GPU accessible memory): │
│  ┌────────────────────────────────────────────────────┐     │
│ │ [PKT3_SET_SH_REG: Set shader register] │ │
│ │ [PKT3_SET_CONTEXT_REG: Set pipeline status] │ │
│ │ [PKT3_DRAW_INDEX_AUTO: Execute drawing, count=36] │ │
│ │ [PKT3_EVENT_WRITE: Refresh cache] │ │
│  └────────────────────────────────────────────────────┘     │
│                                                              │
│ 2. libdrm calls ioctl(fd, DRM_IOCTL_AMDGPU_CS, &cs) │
└───────────────────────────────┬─────────────────────────────┘
│ ioctl system call
═══════════════════════════════════════════════════════════════
                                │
Kernel space (amdgpu driver) ▼
┌─────────────────────────────────────────────────────────────┐
│  3. amdgpu_cs_ioctl()                                       │
│ ├─ amdgpu_cs_parser_init() → Parse ioctl parameters │
│ ├─ amdgpu_cs_parser_bos() → Verify/map all BOs │
│ ├─ amdgpu_cs_dependencies() → handle fence dependencies │
│ └─ amdgpu_cs_submit() → Submit to scheduler │
│                                                              │
│  4. GPU Scheduler (drm_sched)                               │
│ └─ amdgpu_job_run() → Write IB to Ring │
│                                                              │
│ 5. Write to Ring Buffer: │
│     ┌──────────────────────────────────────────────────┐    │
│     │ Ring Buffer (GFX Ring):                          │    │
│     │                                                   │    │
│ │ RPTR ──→ [Executed command...] │ │
│ │ [Executed command...] │ │
│     │            [PKT3_INDIRECT_BUFFER: addr=IB, sz=64] │ ← WPTR
│ │ [empty...] │ │
│ │ [empty...] │ │
│     └──────────────────────────────────────────────────┘    │
│                                                              │
│  6. writel(wptr, adev->wb.wb[ring->wptr_offs])              │
│     writel(wptr, ring->doorbell_ptr)                        │
│ ↑ Doorbell Write Notification GPU Command Processor │
└───────────────────────────────┬─────────────────────────────┘
                                │
GPU Hardware ▼
┌─────────────────────────────────────────────────────────────┐
│ 7. Command Processor (CP) detects WPTR > RPTR │
│ ├─ Read PKT3_INDIRECT_BUFFER from Ring │
│ ├─ Follow pointer to IB address │
│ ├─ Parsing PM4 commands in IB │
│ └─ Drive Shader Engine execution │
│                                                              │
│ 8. After execution: │
│ ├─ Update RPTR │
│ ├─ Write fence value to memory (notify CPU of completion) │
│ └─ Trigger interrupt (optional) │
└─────────────────────────────────────────────────────────────┘`,
            caption: 'Complete datapath submitted by GPU commands. The key is that the Ring Buffer does not directly contain the entire command - it is pointed to the IB via the INDIRECT_BUFFER packet, and the CP follows the pointer to read the actual command. This indirection allows submission of command sequences of arbitrary sizes.',
          },
          codeWalk: {
            title: 'amdgpu_cs_ioctl — command submission entry (simplified)',
            file: 'drivers/gpu/drm/amd/amdgpu/amdgpu_cs.c',
            language: 'c',
            code: `/*amdgpu_cs_ioctl() — Core function for handling DRM_IOCTL_AMDGPU_CS
 *This is the starting point for any work performed by the GPU
 */
int amdgpu_cs_ioctl(struct drm_device *dev, void *data,
                     struct drm_file *filp)
{
    struct amdgpu_device *adev = drm_to_adev(dev);
    union drm_amdgpu_cs *cs = data;
    struct amdgpu_cs_parser parser = {};
    int r;

    /*Stage 1: Parse the command submission request passed in by the user */
    r = amdgpu_cs_parser_init(&parser, adev, filp, cs);
    /*Verify parameters such as IB quantity, Ring type, priority, etc.
     *Parse chunk array: IB chunk, dependency chunk,
     *syncobj chunk etc. */

    /*Phase 2: Processing Buffer Object list */
    r = amdgpu_cs_parser_bos(&parser, data);
    /*For each BO referenced by the command:
     *- Verify that the user has access to the BO
     *- Make sure the BO is in a location accessible to the GPU (VRAM/GTT)
     *- Migrate BO if necessary (e.g. from GTT to VRAM)
     *- Update GPU page table mapping */

    /*Phase 3: Dealing with fence dependencies */
    r = amdgpu_cs_dependencies(adev, &parser);
    /*If this command relies on a previous command to complete,
     *Add the dependent fence to the scheduler dependency list */

    /*Stage 4: Submit to GPU scheduler */
    r = amdgpu_cs_submit(&parser, cs);
    /*Create amdgpu_job and submit to drm_gpu_scheduler
     *The scheduler finally calls amdgpu_job_run():
     *- Write INDIRECT_BUFFER PM4 packet to Ring
     *- Write Doorbell notification GPU */

    return r;
}

/*Core operation of Ring Buffer writing (simplified)*/
void amdgpu_ring_commit(struct amdgpu_ring *ring)
{
    /*Update WPTR (write pointer) */
    uint64_t wptr = ring->wptr;

    /*Write to the Doorbell register - this step triggers the GPU to start executing */
    if (ring->use_doorbell) {
        atomic64_set((atomic64_t *)ring->doorbell_ptr, wptr);
        WDOORBELL64(ring->doorbell_index, wptr);
    } else {
        /*Old GPU uses MMIO to write WPTR register */
        WREG32(ring->wptr_reg, lower_32_bits(wptr));
    }
}`,
            annotations: [
              'amdgpu_cs_parser_init parses user space ioctl parameters into structures that can be processed by the kernel',
              'amdgpu_cs_parser_bos is the most time-consuming stage - involves BO verification and possible memory migration',
              'The fence dependency ensures that the GPU executes commands in the correct order (such as completing data upload before starting rendering)',
              'drm_gpu_scheduler is DRM\'s general GPU scheduler, which handles fair scheduling of multiple processes.',
              'Doorbell is the main CP notification mechanism of the RDNA series and is more efficient than traditional MMIO for writing WPTR.',
              'atomic64_set + WDOORBELL64 ensures atomic writes to 64-bit WPTR',
            ],
            explanation: 'This is the most frequently executed code path in the amdgpu driver - potentially hundreds to thousands of times per second. Understanding this path is fundamental to understanding how the GPU performs its work. The performance of each stage is critical: the BO verification overhead in the parser stage is the reason why the user mode driver (Mesa) tries to submit commands in batches.',
          },
          miniLab: {
            title: 'Use ftrace to trace the command submission path',
            objective: 'Use ftrace to track the execution of amdgpu_cs_ioctl and observe the actual command submission time and call chain.',
            setup: `#Make sure ftrace is available
sudo mount -t tracefs nodev /sys/kernel/tracing 2>/dev/null
#Prepare a GPU workload
sudo apt install -y mesa-utils`,
            steps: [
              'Set ftrace tracing amdgpu_cs_ioctl: echo amdgpu_cs_ioctl > /sys/kernel/tracing/set_ftrace_filter',
              'Enable function graph tracing: echo function_graph > /sys/kernel/tracing/current_tracer',
              'Start tracing: echo 1 > /sys/kernel/tracing/tracing_on',
              'Running GPU load: glxgears & sleep 2 && kill %1',
              'Stop tracing: echo 0 > /sys/kernel/tracing/tracing_on',
              'View the results: head -100 /sys/kernel/tracing/trace',
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
            hint: 'Root privileges are required to operate ftrace. If the set_ftrace_filter write fails, check if the kernel is compiled with CONFIG_FUNCTION_TRACER. Remember to turn off ftrace after tracing to avoid performance impact.',
          },
          debugExercise: {
            title: 'Ring Buffer overflow',
            language: 'c',
            description: 'In the following scenario, GPU command submissions start returning -ENOMEM errors, but there is still a lot of free space in VRAM.',
            question: 'Why does command submission still fail despite VRAM having space? How to diagnose and resolve?',
            buggyCode: `/*Error messages reported by users */
dmesg:
[drm:amdgpu_ring_alloc [amdgpu]] *ERROR*
  ring gfx_0.0.0 is full (wptr=0x1FFF0, rptr=0x00010)
amdgpu_cs_ioctl returned -12   /* -ENOMEM */

/*GPU status */
VRAM: 2048MB / 16368MB used (lots of free space!)
GTT: 512MB / 8192MB used (lots of free time!)

/*Application behavior */
App submits commands in a fast loop without waiting for previous commands to complete
while (rendering) {
    submit_gpu_command();  /*No fence wait!*/
}`,
            hint: 'The size of the Ring Buffer is fixed (usually 256KB-1MB) rather than dynamically growing. What does it mean for WPTR to catch up with RPTR?',
            answer: 'The problem is Ring Buffer overflow (ring full), not insufficient VRAM. The Ring Buffer is a fixed-size ring FIFO - when WPTR catches up with RPTR (i.e. the CPU writes commands faster than the GPU can execute them), the ring is full. "wptr=0x1FFF0, rptr=0x00010" in dmesg indicates that WPTR has almost gone around in a circle to catch up with RPTR. Root cause: The application submits commands in a fast loop but never waits (fence wait), causing Ring backlog. Solution: (1) Application level - perform fence wait appropriately after submitting the command, or use fence callback to wait asynchronously; (2) Driver level - amdgpu_ring_alloc() should wait (spin/sleep) until RPTR advances when the ring is full, instead of returning an error immediately; the actual driver does have the timeout waiting logic of amdgpu_ring_test_helper. (3) Tuning level - increasing the Ring Buffer size (amdgpu.gfx_ring_size module parameter) can increase the buffer. Key understanding: VRAM space and Ring Buffer space are completely different resources - a full Ring does not mean insufficient memory.',
          },
          interviewQ: {
            question: 'Describes the complete path from user space submission to GPU execution completion for a GPU command in amdgpu.',
            difficulty: 'hard',
            hint: 'Described in order: ioctl → parser → BO verification → scheduler → Ring writing → Doorbell → CP execution → fence completion notification.',
            answer: 'Full path: (1) User space Mesa calls ioctl(fd, DRM_IOCTL_AMDGPU_CS, &cs) through libdrm, the parameters include IB address, BO list, fence dependency; (2) Kernel amdgpu_cs_ioctl() entry, amdgpu_cs_parser_init() parses the parameters, verifies the number of IBs and Ring Type; (3) amdgpu_cs_parser_bos() performs TTM reservation for all BOs referenced by the command, verifies GPU mapping, and performs BO migration (GTT→VRAM) and page table updates if necessary; (4) amdgpu_cs_dependencies() converts syncobj/timeline dependencies to dma_fence dependencies; (5) Create amdgpu_job and submit to drm_gpu_scheduler, the scheduler queues according to Ring type and priority; (6) When the scheduler selects job execution, it calls amdgpu_job_run() - it writes the INDIRECT_BUFFER PM4 packet (including IB address and size) into the GFX Ring Buffer; (7) Calls amdgpu_ring_commit() to update WPTR and writes to the Doorbell register; (8) GPU Command Processor (CP) detects WPTR > RPTR, read the INDIRECT_BUFFER package from Ring, follow the pointer to the IB address, parse the PM4 command to drive Shader Engine execution; (9) After the execution is completed, the GPU writes the fence serial number to the specific memory address (writeback buffer), triggering an interrupt; (10) The interrupt processing function amdgpu_fence_process() checks the fence serial number, signal-related dma_fence, and wakes up the waiting CPU thread.',
            amdContext: 'This is a high frequency technical depth question in an AMD interview. Completely describing the entire path from ioctl to fence signal, and being able to point out the function name corresponding to each stage, is the key to distinguishing "understanding the concept" from "understanding the code in depth".',
          },
        },

        // ── Lesson 5.2.2 ──────────────────────────────────────
        {
          id: '5-2-2',
          number: '5.2.2',
          title: 'Fence synchronization mechanism: CPU-GPU coordination',
          titleEn: 'Fence Synchronization: CPU-GPU Coordination',
          duration: 20,
          difficulty: 'expert',
          tags: ['fence', 'dma_fence', 'synchronization', 'interrupt', 'gpu-hang'],
          concept: {
            summary: 'Fence is a synchronization primitive between CPU and GPU. Every time the GPU completes a batch of commands, it writes an incrementing sequence number (fence value) into the memory, and the CPU compares this value to determine the progress of the GPU. amdgpu\'s fence mechanism is built on the kernel\'s dma_fence framework and supports blocking wait, callback notification and timeout detection (GPU Hang detection).',
            explanation: [
              'The CPU and GPU execute asynchronously - the GPU may not start execution after the CPU submits the command, and the CPU may be doing other things when the GPU execution is completed. Fence is the bridge between these two asynchronous worlds. The most basic fence mechanism is simple: every time the GPU completes a set of commands, it writes an increasing sequence number to an agreed memory address. The CPU wants to know if the GPU has completed a certain command, it just needs to read the address and compare the sequence number.',
              'amdgpu\'s fence implementation is built on top of the kernel\'s dma_fence framework. amdgpu_fence_emit() writes a FENCE PM4 packet to the Ring Buffer when the command is submitted - when the GPU executes this packet, a pre-allocated sequence number will be written to the memory pointed to by adev->fence_drv[ring_id].gpu_addr. The amdgpu_fence_process() on the CPU side reads this address, compares the sequence number, and if the value written by the GPU >= the expected value, the corresponding dma_fence is signaled.',
              'There are two ways to wait for Fence: (1) Blocking wait (dma_fence_wait) - the CPU thread sleeps until the fence is signaled, suitable for scenarios that must wait for the GPU to complete (such as glFinish); (2) Callback notification (dma_fence_add_callback) - the registered callback function is executed asynchronously when the fence is signaled, without blocking the CPU, suitable for pipeline scenarios. After the GPU completes the command, it notifies the CPU through an interrupt - the interrupt handler calls amdgpu_fence_process() in the tasklet context, which traverses all unsignaled fences of the Ring and signals the completed ones.',
              'Fence timeout is the core mechanism of GPU Hang detection. drm_gpu_scheduler sets a timeout for each submitted job (default 10 seconds). If there is still no signal from the fence after the timeout, the scheduler considers that the GPU has hanged, triggers amdgpu_job_timedout(), and starts the GPU reset process. "[drm] ring gfx_0.0.0 timeout" in dmesg is reported by this mechanism. Understanding the fence timeout and GPU reset process is critical to debugging GPU hang issues.',
            ],
            keyPoints: [
              'The essence of Fence: the GPU writes the incremental sequence number to the memory, and the CPU reads and compares it to determine the progress.',
              'amdgpu_fence_emit(): Insert the FENCE PM4 package in the Ring, and write the sequence number when the GPU executes',
              'amdgpu_fence_process(): interrupt trigger → read the sequence number written by the GPU → signal dma_fence',
              'Waiting method: blocking (dma_fence_wait) vs callback (dma_fence_add_callback)',
              'GPU Hang detection: fence timeout (default 10s) → amdgpu_job_timedout → GPU reset',
              'Timeline Semaphore: ordered sequence numbers, supporting fine-grained synchronization across processes and rings',
            ],
          },
          diagram: {
            title: 'The life cycle of the Fence synchronization mechanism',
            content: `Fence life cycle: from emit to signal

Time──────────────────────────────────────────────────────→

CPU side GPU side
──────                          ──────

1. Command submission
   amdgpu_cs_submit()
   │
   ├─ amdgpu_fence_emit()
│ Insert at the end of Ring:
│[PM4 FENCE PACK:
   │   addr=fence_gpu_addr,        Ring Buffer:
   │   seq=42]                     ┌──────────────────┐
│ │ ...other PM4 commands │
│ Create dma_fence │ [INDIRECT_BUFFER] │
   │  (seq=42, unsignaled)         │ [FENCE addr seq=42]│ ← WPTR
   │                               └──────────────────┘
   ├─ ring_commit()
│Write Doorbell │
│ │ GPU CP starts execution
   ▼                                  ▼
2. GPU executing
The CPU can do other things and the GPU executes commands in the IB.
or dma_fence_wait() ├─ execute drawing command
(sleep waiting) ├─ Execute calculation command
│ └─ Execute to FENCE PM4 package
   │                                │
   │                                ▼
3. GPU completes GPU writing seq=42
fence_gpu_addr memory
   fence_gpu_addr:               │
[Before: 41] → [Now: 42] └─ Trigger hardware interrupt
                                       │
4. Interrupt handling │
   amdgpu_irq_handler()    ◄──────────┘
   └─ tasklet_schedule()
      └─ amdgpu_fence_process()
         │
├─ Read *fence_gpu_addr → 42
├─ 42 >= expected 42 ✓
         └─ dma_fence_signal(fence_42)
            │
├─ Wake up the blocked thread (dma_fence_wait returns)
└─ Execute registered callback (dma_fence_add_callback)

5. Fence timeout (GPU Hang scenario)
If fence does not signal after 10 seconds:
   drm_sched_job_timedout()
   └─ amdgpu_job_timedout()
      ├─ DRM_ERROR("ring gfx_0.0.0 timeout")
├─ dump GPU registers (GRBM_STATUS, etc.)
      └─ amdgpu_device_gpu_recover()
└─ GPU reset → Reinitialize all IP Blocks`,
            caption: 'The complete life cycle of Fence. Normal path: emit → GPU execution → write sequence number → interrupt → signal. Abnormal path: timeout → GPU hang detection → reset. The memory pointed to by fence_gpu_addr is the shared "mailbox" between the CPU and GPU.',
          },
          codeWalk: {
            title: 'amdgpu_fence_emit and amdgpu_fence_process',
            file: 'drivers/gpu/drm/amd/amdgpu/amdgpu_fence.c',
            language: 'c',
            code: `/*amdgpu_fence_emit() — Insert fence command in Ring
 *Called every time a command is submitted
 */
int amdgpu_fence_emit(struct amdgpu_ring *ring,
                       struct dma_fence **f,
                       struct amdgpu_job *job,
                       unsigned int flags)
{
    struct amdgpu_device *adev = ring->adev;
    struct amdgpu_fence *fence;
    uint32_t seq;

    /*Assign increasing sequence number */
    seq = ++ring->fence_drv.sync_seq;

    /*Initialize dma_fence structure */
    dma_fence_init(&fence->base, &amdgpu_fence_ops,
                   &ring->fence_drv.lock,
                   adev->fence_context + ring->idx, seq);

    /*Write FENCE PM4 packet to Ring Buffer
     *When the GPU executes this package:
     *   MEM_WRITE(fence_gpu_addr, seq)
     *→ Write seq to the memory pointed to by fence_gpu_addr
     */
    amdgpu_ring_emit_fence(ring,
        ring->fence_drv.gpu_addr,   /*Target address for GPU writes*/
        seq,                         /*Serial number to write*/
        flags);

    *f = &fence->base;
    return 0;
}

/*amdgpu_fence_process() — Process a completed fence in interrupt context
 *Called by the interrupt handler's tasklet
 */
bool amdgpu_fence_process(struct amdgpu_ring *ring)
{
    struct amdgpu_fence_driver *drv = &ring->fence_drv;
    uint32_t last_seq, seq;

    /*Read the latest sequence number written by the GPU
     *This memory address is shared by CPU and GPU (writeback buffer)
     */
    last_seq = atomic_read(&drv->last_seq);
    seq = le32_to_cpu(*drv->cpu_addr);
    /*↑ drv->cpu_addr and drv->gpu_addr point to the same physical memory
     *The GPU writes through gpu_addr and the CPU reads through cpu_addr */

    if (seq == last_seq)
        return false;  /*No newly completed commands*/

    atomic_set(&drv->last_seq, seq);

    /*Signal All sequence numbers <= fence of seq */
    while (last_seq != seq) {
        struct dma_fence *fence;
        fence = /*Find fence with seq=last_seq+1*/;
        if (fence) {
            /*Wake up the thread of dma_fence_wait
             *Execute the callback of dma_fence_add_callback */
            dma_fence_signal(fence);
        }
        ++last_seq;
    }
    return true;
}`,
            annotations: [
              'sync_seq is an incrementing counter for each Ring - incremented by 1 for each emit, ensuring global uniqueness',
              'dma_fence_init uses fence_context + ring_idx as context identifier',
              'amdgpu_ring_emit_fence is Ring specific operation - GFX/SDMA/VCN Ring has different PM4 formats',
              'fence_gpu_addr and cpu_addr are the GPU virtual address and CPU virtual address of the same physical memory',
              'le32_to_cpu handles endianness - GPU writes little-endian data',
              'dma_fence_signal is a function of the kernel DMA fence framework that handles waiting for wake-up and callback execution',
            ],
            explanation: 'emit and process are two ends of the fence mechanism: emit "places an order" to the GPU on submission (inserts the fence command in the Ring), and process "checks the order completion status" on interruption (reads the sequence number written by the GPU and signals fence). Efficient implementation of these two functions is key to GPU performance - potentially executing thousands of times per second.',
          },
          miniLab: {
            title: 'Observe the creation and completion of the GPU fence',
            objective: 'Observe real-life fence activity with debugfs and ftrace and understand the role of fences in GPU workflows.',
            steps: [
              'Check the current fence status: sudo cat /sys/kernel/debug/dri/0/amdgpu_fence_info',
              'Observe fence serial number changes: watch -n 0.5 "sudo cat /sys/kernel/debug/dri/0/amdgpu_fence_info | head -20"',
              'Run GPU load in another terminal: glxgears',
              'Watch the fence sequence number increase rapidly (at least +1 per frame)',
              'Use ftrace to trace the fence signal: echo amdgpu_fence_process > /sys/kernel/tracing/set_ftrace_filter && echo function > /sys/kernel/tracing/current_tracer && echo 1 > /sys/kernel/tracing/tracing_on',
              'View tracing results: cat /sys/kernel/tracing/trace | head -30',
            ],
            expectedOutput: `$ sudo cat /sys/kernel/debug/dri/0/amdgpu_fence_info
--- ring gfx_0.0.0 ---
Last signaled fence          0x00003a42
Last emitted                 0x00003a45
  ←A difference of 3 means there are 3 commands being executed in the GPU

--- ring sdma0 ---
Last signaled fence          0x00000128
Last emitted                 0x00000128
  ←A difference of 0 means SDMA idle`,
            hint: 'If the difference between "Last signaled" and "Last emitted" is large (> 100) and remains unchanged for a long time, it may mean that the GPU hangs. Normally the difference should fluctuate between 0-10.',
          },
          debugExercise: {
            title: 'Fence timeout causes GPU Hang',
            language: 'text',
            description: 'The following dmesg output shows a GPU hang event. Analyze the fence information to determine the ring and cause of the hang.',
            question: 'Infer from fence information: Which Ring has the hang occurred? What type of operations is the GPU performing? What are the possible reasons for hang?',
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
            hint: 'signaled seq=1024, emitted seq=1028 indicates that 4 jobs are not completed. What is the interrupt source of SRC_ID:146? addr looks like an invalid address.',
            answer: 'Analysis: (1) The hang occurs in the GFX Ring (gfx_0.0.0), which is the main Ring for graphics/computation commands. signaled=1024, emitted=1028 indicates that 4 jobs were submitted but not completed. (2) SRC_ID:146 is a VMC (Virtual Memory Controller) page fault interrupt, indicating that the GPU attempts to access an invalid virtual address. addr=0xDEAD0000BEEF0000 is a typical poison pattern for debugging, indicating that freed or unmapped memory is accessed. VMID=3 indicates the GPU virtual address space of the user space process. (3) GRBM_STATUS displays GUI_ACTIVE and GFX_BUSY, CP_BUSY=1 confirms that the GPU is executing but is stuck - CP attempts to access an invalid address causing a VMC fault, and the GFX engine stalls. (4) The root cause is probably that the user space program released the BO (Buffer Object) but still referenced it in subsequent commands, causing the GPU to access the unmap address. This is typical use-after-free behavior on the GPU side. Fix direction: Check the application\'s BO life cycle management to ensure that the referenced BO is not released before the command is completed.',
          },
          interviewQ: {
            question: 'Explain how fence works in amdgpu. How does the fence mechanism detect problems when the GPU hangs?',
            difficulty: 'hard',
            hint: 'First explain the normal fence process (emit → GPU writes serial number → interrupt → signal), and then explain the timeout detection and reset process.',
            answer: 'Fence working principle: (1) Each time a command is submitted (amdgpu_fence_emit), the driver inserts a FENCE PM4 command packet at the end of the Ring Buffer, including the target memory address and the incremented sequence number N; (2) When the GPU Command Processor executes the FENCE packet, it writes the sequence number N to the specified memory address (writeback buffer), and the completion is then observed through the normal interrupt or polling path; (3) The interrupt handling path calls amdgpu_fence_process() to read the latest sequence number written by the GPU and signal all dma_fences with seq <= N; (4) The signaled fence wakes the CPU thread waiting through dma_fence_wait(), or triggers the callback function registered through dma_fence_add_callback(). GPU Hang detection: drm_gpu_scheduler starts a timer for each job (default 10 seconds). If the corresponding fence is still not signaled when the timer expires, the GPU did not complete within the expected time - the scheduler calls amdgpu_job_timedout(). This function: (a) records errors to dmesg (ring timeout, signaled/emitted seq); (b) dumps key GPU registers (GRBM_STATUS, CP status); (c) calls amdgpu_device_gpu_recover() to perform a GPU reset - save all Ring states, reinitialize all IP Blocks, and resubmit unfinished jobs. GPU reset is a "nuclear" operation - it interrupts all GPU work, but restores the GPU to a usable state. In an SR-IOV virtualized environment, only GPU capabilities assigned to the current VM can be reset. Key gotchas that distinguish senior engineers: (1) Fence signals use spinlock (not workqueue) because they execute in interrupt/softirq context where sleeping is forbidden — but the callback chain can be long, so the kernel moved to irq_work for deferred processing in recent versions. (2) Ring buffers use Write-Combine (WC) MMIO mapping instead of cached mapping because WC provides much better sequential write performance, but the driver still relies on proper status and pointer paths rather than reading the ring back as a normal synchronization mechanism. (3) Fence timeout != GPU hang: a fence can timeout because the interrupt was lost (common with MSI-X configuration bugs), even though the GPU actually completed the work. The recovery path must check the actual fence sequence number before declaring a hang.',
            amdContext: 'Fence and GPU hang processing are deep technical topics in AMD interviews. Show that you understand the complete chain from fence emit to GPU reset, and the impact of reset on other GPU users.',
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
      title: 'Display and power management',
      titleEn: 'Display & Power Management',
      icon: '🖥️',
      description: 'Deep dive into the AMD Display Core (DC) display engine architecture and SMU power management mechanism - these two subsystems directly affect the user\'s visual experience and power consumption/performance balance.',
      lessons: [
        // ── Lesson 5.3.1 ──────────────────────────────────────
        {
          id: '5-3-1',
          number: '5.3.1',
          title: 'Display Core (DC): AMD\'s display engine',
          titleEn: 'Display Core (DC): AMD Display Engine',
          duration: 20,
          difficulty: 'expert',
          tags: ['display-core', 'DC', 'DCN', 'KMS', 'FreeSync', 'display-pipeline'],
          concept: {
            summary: 'Display Core (DC) is the largest subsystem in the amdgpu driver (approximately 1.6 million lines of code) and is responsible for all display output. DC uses a hardware-independent core layer + hardware-related DCN (Display Controller Next) layer design to implement a complete display pipeline from the framebuffer to the display (HUBP → DPP → OPP → OPTC → DIO), and supports advanced features such as FreeSync/VRR.',
            explanation: [
              'DC (Display Core) is AMD\'s display engine ported from Windows driver to Linux - which is why its code style is significantly different from other parts of the kernel (closer to the C style of Windows driver, using a lot of object-oriented patterns). DC was initially controversial when it was merged into the kernel in 2017 (because of the large code size and unique style), but it is a necessary component to support AMD\'s modern display features.',
              'The DC architecture is divided into two major layers: the hardware-independent core layer (display/dc/core/) and the hardware-related DCN layer (display/dc/dcn32/, etc.). The core layer defines the abstract model of the display pipeline - stream (display stream, corresponding to a display output), plane (display plane, corresponding to a layer), and timing (timing parameters, resolution/refresh rate). The DCN layer implements hardware-specific register programming. This layering allows supporting the new generation of DCN by simply adding hardware layer code, and the core logic can be reused.',
              'The display pipeline of DCN (Display Controller Next) consists of the following hardware units. The data passes from the framebuffer to the display in sequence: HUBP (Hub Pipe, reading pixel data from memory) → DPP (Display Pipe and Plane, color transformation, scaling, mixing) → OPP (Output Pixel Processor, gamma correction, dithering) → OPTC (Output Pipe Timing Combiner, generating display timing signals) → DIO (Display I/O, encoded as DP/HDMI/DVI signal output). Each unit corresponds to a submodule in the DCN hardware, and the driver needs to accurately configure their registers to achieve correct display output.',
              'The relationship between DC and DRM KMS (Kernel Mode Setting): DRM KMS is the general display management framework of the Linux kernel (drm_atomic_commit, drm_crtc, drm_connector, etc.), amdgpu\'s amdgpu_dm.c (Display Manager) is the adapter layer between KMS and DC. When user space (such as GNOME/KDE) calls a DRM atomic commit request to set the resolution, amdgpu_dm converts the DRM data structure into the DC\'s data structure and then calls dc_commit_streams() to perform the actual hardware configuration. FreeSync/VRR (Variable Refresh Rate) is also implemented through DC - DC can dynamically adjust the VBlank interval of OPTC to match the rendering frame rate of the GPU.',
            ],
            keyPoints: [
              'DC is the largest subsystem of amdgpu (~1.6M lines of code), ported from Windows driver',
              'Two-layer architecture: core layer (hardware-independent) + DCN layer (hardware-dependent, such as dcn32 = RDNA3)',
              'Display pipeline: HUBP → DPP → OPP → OPTC → DIO → display',
              'DRM KMS ←→ amdgpu_dm.c (adaptation layer) ←→ DC Core ←→ DCN Hardware',
              'dc_commit_streams() is the core display-state submission function (the v6.12 interface name; older kernels used dc_commit_state — the API evolves across versions)',
              'FreeSync/VRR dynamically adjusts OPTC\'s VBlank cycle through DC',
            ],
          },
          diagram: {
            title: 'DCN display pipeline architecture',
            content: `DCN (Display Controller Next) display pipeline — RDNA3 DCN 3.2

Framebuffer (VRAM)
Pixel data is stored in GPU memory
       │
       ▼
┌──────────────┐
│ HUBP │ Hub Pipe — Read pixel data from memory
│ │ · Configure framebuffer address and format
│ │ · Support tiling mode decoding
│ │ · Request the memory controller to read data
└──────┬───────┘
│ Pixel data stream
       ▼
┌──────────────┐
│ DPP │ Display Pipe and Plane — Pixel Processing
│ │ · Color space conversion (sRGB → HDR)
│ │ · Scaling (supports integer and decimal scaling)
│ │ · Multi-layer blending (cursor, overlay, video)
│ │ · 3D LUT Color Mapping
└──────┬───────┘
│ Processed pixels
       ▼
┌──────────────┐
│ OPP │ Output Pixel Processor — Output pixel processing
│ │ · Gamma correction (regamma)
│ │ · Dithering (reduces color banding effect)
│ │ · Bit depth conversion (10bit → 8bit)
│ │ · Format to output encoding
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ OPTC │ Output Pipe Timing Combiner — timing generation
│ │ · Generate HSync / VSync signal
│ │ · VBlank Control (FreeSync/VRR adjusted here)
│ │ · Multi-monitor timing synchronization
│ │ · CRC (Cyclic Redundancy Check, used for verification)
└──────┬───────┘
│ Timing + Pixel
       ▼
┌──────────────┐
│ DIO │ Display I/O — Physical Output
│ │ · DP (DisplayPort) encoding: 8b/10b, 128b/132b
│ │ · HDMI encoding: TMDS / FRL
│ │ · Link training (negotiate link speed)
│ │ · HDCP Encryption (Content Protection)
└──────┬───────┘
│ DP/HDMI signal
       ▼
Monitor 🖥️

The relationship between DRM KMS and DC:

Userspace (GNOME/KDE)
       │ drmModeAtomicCommit()
       ▼
DRM Atomic KMS Framework
       │ drm_atomic_helper_commit()
       ▼
  amdgpu_dm.c (adapter layer)  ←Convert DRM structures to DC structures
       │ dc_commit_streams()
       ▼
  DC Core (display/dc/core/)   ←Hardware-independent display logic
│ Call DCN hardware function
       ▼
  DCN 3.2 (display/dc/dcn32/)  ←RDNA3 hardware register programming`,
            caption: 'DCN 3.2 shows the pipeline and call hierarchy of DRM KMS to DC. Each pipeline stage (HUBP→DPP→OPP→OPTC→DIO) corresponds to a submodule in the hardware, and the driver needs to configure a large number of registers to allow data to flow correctly through the entire pipeline.',
          },
          codeWalk: {
            title: 'dc_commit_streams — shows the core process of state submission',
            file: 'drivers/gpu/drm/amd/display/dc/core/dc.c',
            language: 'c',
            code: `/*dc_commit_streams() — Commits the new display state to the hardware
 *Called when user space requests a change in resolution, refresh rate, HDR mode, etc.
 *This is the core function in the DC subsystem
 */
enum dc_status dc_commit_streams(struct dc *dc,
                                struct dc_state *context)
{
    enum dc_status result;

    /*Phase 1: Verify that the new state is feasible
     *Check whether the bandwidth is sufficient, whether the timing is compatible, and whether the pipeline resources are sufficient
     */
    result = dc_validate_global_state(dc, context);
    if (result != DC_OK) {
        /*If the new state is not feasible (such as insufficient bandwidth), return an error
         *User space needs to reduce requirements (such as reducing resolution)
         */
        return result;
    }

    /*Stage 2: Calculate all pipeline parameters
     *DML (Display Mode Library) calculates the watermark value for each pipeline stage
     *The watermark determines when to prefetch data from memory to avoid underflow
     */
    dc->res_pool->funcs->calculate_wm_and_dlg(dc, context);

    /*Stage 3: Compare the old and new status to determine the pipeline stages that need to be updated */
    dc_resource_state_copy_construct(dc->current_state,
                                      context);

    /*Stage 4: Programming the Hardware
     *Configure registers for each pipeline stage sequentially
     */
    for (i = 0; i < context->stream_count; i++) {
        struct dc_stream_state *stream = context->streams[i];

        /*Configure OPTC - set timing (resolution, refresh rate) */
        dc->hwss.setup_stream_encoder(stream);

        /*Configure DIO - Set up output link (DP/HDMI)*/
        dc->hwss.enable_stream(stream);
    }

    for (i = 0; i < context->plane_count; i++) {
        /*Configure HUBP — set framebuffer address and format */
        dc->hwss.update_plane_addr(dc, context->planes[i]);

        /*Configure DPP - set scaling, color transformation */
        dc->hwss.program_pipe(dc, context->planes[i]);
    }

    /*Stage 5: Wait for VBlank and then switch - avoid screen tearing */
    dc->hwss.wait_for_mpcc_disconnect(dc, context);

    dc->current_state = context;
    return DC_OK;
}`,
            annotations: [
              'dc_validate_global_state calls DML to verify bandwidth - ensuring that the data volume of all displays does not exceed the memory bandwidth',
              'DML (Display Mode Library) is AMD\'s bandwidth calculation library. The watermark value prevents underflow (black screen/flash) from being displayed.',
              'dc->hwss is the hardware serialization layer (Hardware Sequencer), which encapsulates hardware-related register programming',
              'stream corresponds to a display output (such as DP-1), plane corresponds to a display layer (such as desktop, video overlay)',
              'wait_for_mpcc_disconnect switches pipeline configuration during VBlank to avoid visible screen tearing',
              'Return values ​​other than DC_OK (such as DC_FAIL_BANDWIDTH) require user space processing (reducing requirements or reporting an error)',
            ],
            explanation: 'This function is executed behind the scenes every time you drag the window, change the resolution, or enable HDR. It coordinates the register configuration of all hardware units in the DCN pipeline. The bandwidth calculation of DML is the most complex part - it needs to consider dozens of parameters such as VRAM bandwidth, memory timing, pipeline delay, etc. to ensure that the display does not appear underflow.',
          },
          miniLab: {
            title: 'View your monitor connection information and DC status',
            objective: 'Observe DC-managed monitor connection status, current timing, and pipeline configuration via sysfs and debugfs.',
            steps: [
              'View all connector status: for c in /sys/class/drm/card0-*; do echo "$(basename $c): $(cat $c/status 2>/dev/null)"; done',
              'View the current display mode (resolution and refresh rate): cat /sys/class/drm/card0-DP-1/modes | head -5',
              'View EDID information: sudo cat /sys/class/drm/card0-DP-1/edid | edid-decode 2>/dev/null || echo "Install edid-decode: sudo apt install edid-decode"',
              'Check the DC status: sudo cat /sys/kernel/debug/dri/0/amdgpu_dm_dtn_log 2>/dev/null | head -50',
              'Check FreeSync status: cat /sys/class/drm/card0-DP-1/vrr_capable 2>/dev/null',
              'View GPU display related dmesg: dmesg | grep -i "connector\\|display\\|dc\\|hdmi\\|dp-\\|freesync"',
            ],
            expectedOutput: `$ for c in /sys/class/drm/card0-*; do echo "$(basename $c): $(cat $c/status)"; done
card0-DP-1: connected         ←DisplayPort connected
card0-DP-2: disconnected
card0-HDMI-A-1: disconnected

$ cat /sys/class/drm/card0-DP-1/modes | head -3
2560x1440     ←The preferred resolution of the current monitor
1920x1080
1280x720

$ cat /sys/class/drm/card0-DP-1/vrr_capable
1             ←Monitor supports FreeSync/VRR`,
            hint: 'The connector name (DP-1, HDMI-A-1) depends on your physical connection. If using an HDMI connection, replace DP-1 in the command with HDMI-A-1. amdgpu_dm_dtn_log requires kernel compilation with CONFIG_DEBUG_FS enabled.',
          },
          debugExercise: {
            title: 'Display flickering: Wrong timing configuration',
            language: 'c',
            description: 'Users report that the monitor flickers intermittently (black screen for 1 second then back up). Below is the dmesg output and key status of the DC.',
            question: 'Determine the root cause of flickering based on log information. Is it a timing issue, a bandwidth issue, or a link issue?',
            buggyCode: `/*Key information in dmesg */
[  120.456] [drm] DC: pipe 0 underflow detected!
[  120.456] [drm] DC: HUBP0 urgent watermark exceeded
[  120.457] [drm] DC: stream 0: 2560x1440@165Hz
[  120.457] [drm] DC: active plane count: 3
            (desktop + video overlay + cursor)
[  120.458] [drm] DC: DRAM bandwidth: 38.4 GB/s required,
            36.8 GB/s available

/*debugfs amdgpu_dm_dtn_log fragment */
HUBP0: req_per_sec=4200000  prefetch_bw=37.2 GB/s
DPP0: scl_enable=1  ratio_h=2.0  ratio_v=2.0
OPTC0: vtotal=1500  vactive=1440  hsync=60`,
            hint: 'Underflow means that HUBP cannot read pixel data from memory as fast as the monitor consumes it. Note required vs available bandwidth.',
            answer: 'The root cause is display underflow caused by insufficient memory bandwidth. Analysis: (1) "HUBP0 urgent watermark exceeded" + "pipe 0 underflow detected" directly indicates that HUBP cannot read pixel data from memory fast enough. (2) Bandwidth data confirmation: 38.4 GB/s required but only 36.8 GB/s available - a difference of 1.6 GB/s causing intermittent underflow. (3) Exacerbating factors: 2560x1440@165Hz is a high bandwidth requirement (about 2560*1440*4*165 = 2.27 GB/s single stream), plus 3 active planes (desktop + video overlay + cursor) and 2x scaling of DPP (ratio_h=2.0 doubles the bandwidth requirement), the total requirement exceeds the available bandwidth. Solutions: (a) Reduce the refresh rate to 144Hz or 120Hz to reduce bandwidth requirements; (b) Turn off video overlay (one less active plane); (c) Check the DML watermark calculation for bugs - DML should reject this configuration during the validate phase rather than letting underflow occur; (d) Increase the memory clock (if pp_dpm_mclk is not shown in top gear). This is a typical DML watermark calculation bug - the correct fix is ​​to fix DML\'s bandwidth estimate so that it returns DC_FAIL_BANDWIDTH during the validate phase.',
          },
          interviewQ: {
            question: 'Explaining the architecture of AMD Display Core (DC). Why did AMD choose to port DC from Windows instead of using a generic implementation of DRM KMS?',
            difficulty: 'hard',
            hint: 'Analysis from the perspective of architectural layering (DC Core + DCN HW), functional requirements (FreeSync, HDR, multi-monitor) and code reuse (Windows/Linux sharing).',
            answer: 'The DC architecture is divided into three layers: (1) DRM KMS adaptation layer (amdgpu_dm.c): translates DRM\'s atomic commit API into DC\'s internal API; (2) DC core layer (display/dc/core/): hardware-independent display logic, including status verification, bandwidth calculation (DML), and pipeline resource allocation; (3) DCN hardware layer (display/dc/dcn32/ etc.): Register programming for specific hardware, each generation of DCN has its own directory. The reasons why AMD chose to port DC instead of using pure DRM KMS: (1) Functional complexity - AMD\'s display hardware supports a large number of advanced features such as FreeSync/VRR, HDR, PSR (Panel Self Refresh), DSC (Display Stream Compression), MST (Multi-Stream Transport), etc., which are not supported by the general implementation of DRM KMS; (2) Code reuse - the DC core layer is shared between Windows and Linux drivers, AMD Only one display logic needs to be maintained instead of maintaining two different sets of implementations; (3) Hardware verification - DC has been verified by a large number of Windows tests within AMD, and porting to Linux is less risky than implementing it from scratch; (4) DML complexity - the bandwidth calculation of the Display Mode Library involves hundreds of parameters and complex mathematical models. This part of the code cannot be implemented in the general framework of DRM KMS. The price is that the coding style of DC is inconsistent with the kernel and the maintenance cost is higher.',
            amdContext: 'DC is the core work of AMD\'s display team. Showing in the interview that you understand why DC exists (functional requirements + code reuse) and how it relates to DRM KMS is more valuable than just reciting the pipeline stages.',
          },
        },

        // ── Lesson 5.3.2 ──────────────────────────────────────
        {
          id: '5-3-2',
          number: '5.3.2',
          title: 'Power Management: SMU vs. DVFS',
          titleEn: 'Power Management: SMU & DVFS',
          duration: 20,
          difficulty: 'expert',
          tags: ['power-management', 'SMU', 'DVFS', 'pp_dpm_sclk', 'thermal', 'sysfs'],
          concept: {
            summary: 'GPU power management implements DVFS (Dynamic Voltage Frequency Scaling) through SMU (System Management Unit) firmware - dynamically adjusting the clock frequency and voltage of the GPU based on the workload. The amdgpu driver communicates with the SMU firmware through the message interface, and user space views and controls the power consumption/performance configuration of the GPU through the sysfs interface (pp_dpm_sclk/mclk).',
            explanation: [
              'The SMU (System Management Unit) is an independent processor inside the GPU that runs AMD\'s closed-source firmware. Its core responsibility is power management - controlling the GPU\'s clock frequency, voltage, power limit and fan speed. The SMU makes these decisions without involving the main CPU—it monitors GPU temperature, power consumption, and workload in real time, automatically adjusting frequency and voltage to strike a balance between performance and power consumption.',
              'DVFS (Dynamic Voltage Frequency Scaling) is the core mechanism of SMU. GPUs have multiple DPM (Dynamic Power Management) levels, each corresponding to a set of frequency-voltage pairs. For example, the GPU core (SCLK) of the RX 7600 XT may be: 300MHz@0.7V (idle), 1200MHz@0.85V (light load), 2100MHz@1.0V (medium load), 2595MHz@1.15V (full load). The SMU switches between these levels depending on the current load - you turn on a game and the frequency jumps from 300MHz to 2595MHz in milliseconds; turn the game off and it drops back to 300MHz.',
              'The amdgpu driver communicates with the SMU via PPSMC (PowerPlay SMC) messages. The driver writes the message to a specific MMIO register (MP1_SMN_C2PMSG series), waits for SMU to process and returns the result. Key messages include: SetSoftMaxGfxClk (set the maximum GFX frequency), SetHardMinGfxClk (set the minimum GFX frequency), SetPowerLimit (set the power consumption limit), GetGfxClkFrequency (get the current frequency). The driver code is under pm/swsmu/, and smu_v13_0.c is the SMU implementation of RDNA3.',
              'Linux users interact with power management through the sysfs interface. pp_dpm_sclk displays/sets the GPU core frequency level, pp_dpm_mclk displays/sets the memory frequency level, and power_dpm_force_performance_level sets the performance mode (auto/high/low/manual). In manual mode, you can lock the GPU to a specific frequency by writing pp_dpm_sclk - this is useful when performance debugging. Thermal throttling is performed automatically by the SMU - when the GPU temperature exceeds a threshold (usually 100°C), the SMU reduces frequency to reduce heat generation.',
            ],
            keyPoints: [
              'SMU is an independent processor inside the GPU that runs closed-source firmware and manages power/frequency/temperature in real time',
              'DVFS core mechanism: multiple DPM levels, each level = frequency + voltage pair',
              'amdgpu communicates with SMU via PPSMC messages (MMIO registers)',
              'sysfs interface: pp_dpm_sclk (GPU frequency), pp_dpm_mclk (memory frequency)',
              'power_dpm_force_performance_level: four modes: auto/high/low/manual',
              'Thermal throttling: The SMU automatically reduces frequency when the temperature exceeds the threshold, and the driver monitors but does not directly control it.',
            ],
          },
          diagram: {
            title: 'GPU power management architecture and DVFS',
            content: `GPU power management architecture

Userspace sysfs interface
┌────────────────────────────────────────────────────────┐
│ /sys/class/drm/card0/device/                           │
│                                                        │
│ pp_dpm_sclk GPU core frequency grade │
│   0: 300Mhz                                            │
│   1: 800Mhz                                            │
│   2: 2100Mhz                                           │
│ 3: 2595Mhz * (* = current level) │
│                                                        │
│ pp_dpm_mclk memory frequency level │
│   0: 96Mhz                                             │
│   1: 1188Mhz *                                         │
│                                                        │
│ power_dpm_force_performance_level                      │
│   auto / high / low / manual                           │
│                                                        │
│ hwmon/hwmon*/                                          │
│ temp1_input GPU temperature (millidegrees) │
│ power1_average average power consumption (microwatts) │
│ fan1_input fan speed (RPM) │
└────────────────────────────┬───────────────────────────┘
                             │ sysfs read/write
═════════════════════════════│═══════════════════════════
                             │
Kernel space (amdgpu driver pm/swsmu/)
┌────────────────────────────▼───────────────────────────┐
│  smu_set_performance_level()                           │
│  smu_get_current_clocks()                              │
│  smu_set_fan_speed_rpm()                               │
│       │                                                │
│       ▼                                                │
│  smu_cmn_send_smc_msg()                               │
│  ┌─────────────────────────────────────────┐           │
│ │ Write PPSMC message to MMIO register: │ │
│  │ WREG32(MP1_SMN_C2PMSG_66, msg_id);     │           │
│  │ WREG32(MP1_SMN_C2PMSG_82, param);      │           │
│  │ WREG32(MP1_SMN_C2PMSG_90, 0x1); /*go*/ │           │
│  │                                          │           │
│ │ Waiting for SMU response: │ │
│  │ while (RREG32(MP1_SMN_C2PMSG_90) != 1)  │           │
│  │     usleep_range(10, 20);               │           │
│  └─────────────────────────────────────────┘           │
└────────────────────────────┬───────────────────────────┘
│ MMIO messages
GPU Hardware ▼
┌─────────────────────────────────────────────────────────┐
│  SMU (System Management Unit)                           │
│  ┌────────────────────────────────────────────┐        │
│ │ Standalone processor, running AMD closed source firmware │ │
│  │                                             │        │
│ │ Input: │ │
│ │ · GPU Temperature Sensor (Tdie, Tjunction) │ │
│ │ · Power Consumption Sensor (Telemetry) │ │
│ │ · Workload detection (activity %) │ │
│ │ · Driver Message (PPSMC) │ │
│  │                                             │        │
│ │ Decision: DVFS (Frequency-Voltage Scaling) │ │
│  │                                             │        │
│ │ Idle Light load Medium load Full load │ │
│  │   300MHz   800MHz   2100MHz   2595MHz       │        │
│  │   0.7V     0.85V    1.0V      1.15V         │        │
│  │   ~5W      ~30W     ~80W      ~150W         │        │
│  │   ▲                                 ▲       │        │
│  │   │  ←SMU automatic adjustment → │ │ │
│  │                                             │        │
│ │ Protection: Thermal protection frequency reduction (>100°C → forced frequency reduction) │ │
│  └────────────────────────────────────────────┘        │
│                                                         │
│ Output: │
│ · Set PLL frequency (GFX clock, Memory clock) │
│ · Set up the voltage regulator (Voltage Regulator) │
│ · Control fan PWM │
└─────────────────────────────────────────────────────────┘`,
            caption: 'Complete architecture for GPU power management. User space interacts through the sysfs interface, the driver communicates with the SMU through PPSMC messages, and the SMU executes DVFS decisions in real time. Although the SMU firmware is closed source, the driver-SMU message interface is completely open source.',
          },
          codeWalk: {
            title: 'smu_set_performance_level — Set GPU performance level',
            file: 'drivers/gpu/drm/amd/pm/swsmu/amdgpu_smu.c',
            language: 'c',
            code: `/*smu_set_performance_level() — Set GPU performance mode
 *Triggered by sysfs power_dpm_force_performance_level write
 */
int smu_set_performance_level(struct smu_context *smu,
    enum amd_dpm_forced_level level)
{
    int ret = 0;

    switch (level) {
    case AMD_DPM_FORCED_LEVEL_HIGH:
        /*Force the GPU to use the highest frequency
         *for benchmarking or debugging */
        ret = smu_force_clk_levels(smu, SMU_SCLK,
            1 << smu->smu_table.max_sclk_dpm_level);
        ret = smu_force_clk_levels(smu, SMU_MCLK,
            1 << smu->smu_table.max_mclk_dpm_level);
        break;

    case AMD_DPM_FORCED_LEVEL_LOW:
        /*Force the GPU to use a minimum frequency
         *For power saving or thermal debugging */
        ret = smu_force_clk_levels(smu, SMU_SCLK, 1 << 0);
        ret = smu_force_clk_levels(smu, SMU_MCLK, 1 << 0);
        break;

    case AMD_DPM_FORCED_LEVEL_AUTO:
        /*Restore SMU automatic management (default mode)
         *SMU determines frequency independently based on load */
        ret = smu_unforce_dpm_levels(smu);
        break;

    case AMD_DPM_FORCED_LEVEL_MANUAL:
        /*Manual mode: Allow users to pass pp_dpm_sclk
         *Select a specific DPM level */
        break;
    }

    smu->dpm_level = level;
    return ret;
}

/*smu_force_clk_levels — Lock frequency via PPSMC message */
static int smu_force_clk_levels(struct smu_context *smu,
    enum smu_clk_type clk_type, uint32_t mask)
{
    /*Call the implementation of a specific SMU version
     *For RDNA3 → smu_v13_0_force_clk_levels */
    return smu->ppt_funcs->force_clk_levels(smu,
                                              clk_type, mask);
}

/*smu_cmn_send_smc_msg — Low-level function to send messages to SMU */
int smu_cmn_send_smc_msg(struct smu_context *smu,
    enum smu_message_type msg, uint32_t *resp)
{
    struct amdgpu_device *adev = smu->adev;

    /*Write message parameters */
    WREG32(smu->msg_arg_reg, param);

    /*Write message ID - SMU starts processing */
    WREG32(smu->msg_reg, msg);

    /*Polling to wait for SMU response */
    ret = smu_cmn_wait_for_response(smu);
    /*SMU typically responds in <1ms */

    if (resp)
        *resp = RREG32(smu->resp_reg);

    return ret;
}`,
            annotations: [
              'AMD_DPM_FORCED_LEVEL_HIGH Use bitmask to select the highest DPM level, suitable for benchmarking',
              'AMD_DPM_FORCED_LEVEL_AUTO is the default mode - the SMU manages frequency/voltage completely autonomously',
              'smu->ppt_funcs is a SMU version-specific function table (Power Play Table), an interface abstraction similar to IP Block',
              'WREG32(msg_reg, msg) is key to trigger SMU processing - the SMU monitors writes to this register',
              'smu_cmn_wait_for_response polls the SMU response register, the timeout is usually 10ms',
              'The behavior of the closed-source SMU firmware is controlled indirectly through the message interface - the driver cannot directly operate the PLL or voltage regulator',
            ],
            explanation: 'This code shows how the driver controls the power/performance configuration of the GPU. When you execute echo high > /sys/class/drm/card0/device/power_dpm_force_performance_level in the terminal, this function is ultimately called. Understanding the SMU message interface is key to understanding GPU power management - although the SMU firmware is closed source, the semantics of the message interface are completely open source.',
          },
          miniLab: {
            title: 'Monitor and control GPU clock frequency',
            objective: 'Use the sysfs interface to monitor GPU frequency changes in real time and experience manual control of GPU performance levels.',
            setup: '# Make sure you have root permissions\n# Make sure you have the GPU workload tool\nsudo apt install -y mesa-utils glmark2',
            steps: [
              'Check the current GPU core frequency level: cat /sys/class/drm/card0/device/pp_dpm_sclk',
              'Check the current memory frequency level: cat /sys/class/drm/card0/device/pp_dpm_mclk',
              'Start real-time monitoring (in a new terminal): watch -n 0.5 cat /sys/class/drm/card0/device/pp_dpm_sclk (observe frequency gear changes, * marks the current frequency)',
              'Run the GPU load in another terminal: glmark2 (observe the frequency jumping from idle to high in the monitor)',
              'Test manual locking of high frequency: echo high | sudo tee /sys/class/drm/card0/device/power_dpm_force_performance_level',
              'Restore automatic mode: echo auto | sudo tee /sys/class/drm/card0/device/power_dpm_force_performance_level',
            ],
            expectedOutput: `$ cat /sys/class/drm/card0/device/pp_dpm_sclk
0: 300Mhz
1: 800Mhz
2: 2100Mhz
3: 2595Mhz *    ←Running GPU load will be in the highest gear

When free:
0: 300Mhz *     ←Return to lowest frequency
1: 800Mhz
2: 2100Mhz
3: 2595Mhz

Temperature and power consumption changes:
Idle: ~40°C, ~8W
Full load: ~75°C, ~130W`,
            hint: 'Modifying power_dpm_force_performance_level requires root privileges. Be careful that echo high will cause the GPU to continue running at full speed, increasing power consumption and temperature. Remember to return to auto mode after the experiment. If the hwmon path is incorrect, use ls /sys/class/drm/card0/device/hwmon/ to find the correct number.',
          },
          debugExercise: {
            title: 'GPU frequency locked at low range',
            language: 'text',
            description: 'Users are reporting unusually low frame rates in the game, with the GPU loaded at 100% but the frequency always stuck at the lowest setting.',
            question: 'Use the following diagnostic information to find the root cause of the GPU frequency failure.',
            buggyCode: `/*Phenomenon reported by users */
glxgears: ~60 FPS (normal should be 300+ FPS)
GPU utilization: 100%

/*sysfs output */
$ cat pp_dpm_sclk
0: 300Mhz *       ←Always on the lowest frequency!
1: 800Mhz
2: 2100Mhz
3: 2595Mhz

$ cat power_dpm_force_performance_level
manual             ←Pay attention here!

$ cat pp_dpm_mclk
0: 96Mhz *         ←Video memory is also at the lowest frequency
1: 1188Mhz

/*GPU temperature and power consumption */
temp1_input: 42000 (42°C — very cool)
power1_average: 8500000 (8.5W - almost idle power consumption)

/*dmesg no exception error */`,
            hint: 'Note the value of power_dpm_force_performance_level. In manual mode, the SMU will not automatically adjust the frequency.',
            answer: 'Root cause: power_dpm_force_performance_level is set to "manual" mode, and pp_dpm_sclk has the lowest level selected (0: 300MHz). In manual mode, the SMU does not perform automatic DVFS - it strictly adheres to the user-selected DPM level. Since only level 0 (300MHz) is selected, the GPU is locked at the lowest frequency. This is further confirmed by the unusually low temperatures (42°C) and power consumption (8.5W) - a fully loaded GPU should be at 75°C+ and 100W+. Solution: (1) The simplest fix: echo auto | sudo tee /sys/class/drm/card0/device/power_dpm_force_performance_level - restore SMU automatic management. (2) If you need to maintain manual mode, manually enable the high-frequency level: echo "0 1 2 3" | sudo tee /sys/class/drm/card0/device/pp_dpm_sclk - allows SMU to switch between all levels. This problem is usually caused by the user forgetting to restore the settings after previous performance tuning experiments, or a certain GPU tuning script setting manual mode. In bug reports, checking power_dpm_force_performance_level should be a standard step in diagnosing performance issues.',
          },
          interviewQ: {
            question: 'Describe amdgpu\'s power management architecture. How does the driver interact with the SMU firmware? How does DVFS work?',
            difficulty: 'hard',
            hint: 'Described from the perspective of three-layer architecture (sysfs → driver pm/swsmu → SMU firmware) and PPSMC message mechanism.',
            answer: 'The amdgpu power management architecture is divided into three layers: (1) User interface layer - exposing pp_dpm_sclk (GPU frequency), pp_dpm_mclk (memory frequency), power_dpm_force_performance_level (performance mode), hwmon (temperature/power consumption/fan) and other interfaces through sysfs; (2) Driver layer - the code under pm/swsmu/ implements the SMU communication framework, amdgpu_smu.c It is a general interface, and smu_v13_0.c is the specific implementation of RDNA3. The driver describes the DPM level table supported by the GPU through the Power Play Table (PPT) data structure, and abstracts the differences between different SMU versions through the smu->ppt_funcs interface; (3) SMU firmware layer - closed source firmware running on the independent processor inside the GPU, receives the driver\'s PPSMC message (through the MMIO register MP1_SMN_C2PMSG series), and executes DVFS decisions in real time. Message interaction process: The driver writes parameters to C2PMSG_82 → writes message ID to C2PMSG_66 → writes trigger to C2PMSG_90 → polls C2PMSG_90 and waits for response → reads the result. How DVFS works: SMU maintains a DPM level table (frequency-voltage pair) and dynamically selects the level based on three factors: GPU activity (workload percentage), temperature, and power consumption limit. The load increases → increase the frequency/voltage; the temperature exceeds the limit → forced frequency reduction (thermal throttling); the power consumption exceeds the limit → limits the frequency (power throttling). The decision-making cycle of SMU is about 1-10ms, which is much faster than driver intervention.',
            amdContext: 'SMU and power management are important topics in interviews at AMD, especially on the PM team. Demonstrate an understanding of the architecture in which closed-source SMU firmware is controlled by an open-source driver via a messaging interface, as well as the input factors to DVFS (load, temperature, power consumption).',
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
      title: 'Advanced subsystems in depth',
      titleEn: 'Advanced Subsystems',
      icon: 'Microscope',
      description: 'Go deep into three key subsystems: Display Core\'s independent kingdom architecture and DML bandwidth calculation, DRM GPU Scheduler\'s command scheduling mechanism, and the multi-level page table system of GPU virtual memory (GPUVM) - these are the core modules with the highest bug density and the highest interview frequency in the amdgpu driver.',
      lessons: [
        // ── Lesson 5.4.1 ──────────────────────────────────────
        {
          id: '5-4-1',
          number: '5.4.1',
          title: 'Display Core Deep Dive: dc_state, DML, and DC\'s independent kingdom',
          titleEn: 'Display Core Deep Dive: dc_state, DML and DC\'s Independent Kingdom',
          duration: 20,
          difficulty: 'expert',
          tags: ['display-core', 'dc_state', 'DML', 'dc_stream', 'dc_plane', 'bandwidth', 'amdgpu_dm'],
          concept: {
            summary: 'DC (Display Core) accounts for about 40% of amdgpu code and has the highest bug density among drivers. It is not just a display subsystem - it is an independent kingdom ported from the Windows driver, with its own type system (dc_stream, dc_plane), its own state validation (dc_validate_state), its own memory model and error handling, and it is almost a "translation" relationship rather than an "integration" relationship with the Linux DRM/KMS framework.',
            explanation: [
              'Historical roots of DC as a separate abstraction layer: DC was originally the display engine in the AMD Windows driver, written in the object-oriented style of C (lots of vtables, abstract interfaces, construction/destruction patterns). When porting to Linux in 2017, AMD chose to keep DC independent rather than rewrite it to a DRM/KMS native style - the reason was that the complexity of DC (1.6 million lines of code) made rewriting impractical, and AMD needed Windows and Linux to share the same display core code. This means that DC has its own memory allocation wrapper, its own logging system, and even its own math library (fixed-point arithmetic is used for DML), creating a stylistic contrast to other subsystems of the kernel.',
              'The dc_state commit process is the core working path of DC. When user space requests to change the display configuration (such as switching resolution, enabling HDR), the complete submission process is: dc_validate_state() (verify whether the new configuration is within the hardware capabilities - check the number of pipeline resources, bandwidth limits, timing compatibility) → DML bandwidth calculation (Display Mode Library calculates the watermark value of each pipeline stage to ensure that the data flow will not underflow) → dc_commit_streams() (program the verified configuration into the hardware register, in VBlank switch between to avoid tearing). Failure in any step will prevent the configuration from taking effect and return an error to user space.',
              'DML (Display Mode Library) is the most complex and bug-prone submodule in DC. DML is essentially a bandwidth/latency calculation framework - given a display configuration (resolution, refresh rate, pixel format, scaling, number of active planes), DML calculates the required memory bandwidth for all pipeline stages and compares it to the available bandwidth. If demand exceeds available bandwidth, DML rejects the configuration (returning DC_FAIL_BANDWIDTH). DML also calculates the "watermark" - how long HUBP must start prefetching data from memory before a pixel is consumed by the display. Watermark calculation errors can lead to display underflow (HUBP has no time to read the data, and the screen appears with black lines or flickers), which is the most common type of bug in DC.',
              'DC has a completely independent type system from DRM/KMS. DRM uses drm_crtc, drm_connector, and drm_plane; DC uses dc_stream (corresponding to a display output stream), dc_plane (corresponding to a display layer), and dc_sink (corresponding to a display device). amdgpu_dm.c is the "translation layer" that connects these two worlds - it converts drm_atomic_state to dc_state, maps drm_crtc_state to dc_stream_state, and drm_plane_state to dc_plane_state. This double abstraction adds complexity, but also makes the DC core completely independent of the Linux kernel API and can be shared between Windows and Linux.',
              'DC\'s error handling is independent of the kernel. DC internally uses its own error enumeration (enum dc_status: DC_OK, DC_FAIL_BANDWIDTH, DC_FAIL_RESOURCES, etc.) instead of the Linux standard errno (-EINVAL, -ENOMEM, etc.). amdgpu_dm.c is responsible for translating DC error codes into error codes expected by DRM/KMS. DC internal logging also uses custom DC_LOG_* macros instead of the kernel\'s pr_info/dev_err. Understanding this independence is critical for debugging DC issues - you need to look for information at both the DRM layer ([drm] prefix in dmesg) and the DC layer ([drm] DC: prefix).',
            ],
            keyPoints: [
              'DC is an independent abstraction layer ported from the Windows driver. It accounts for about 40% of amdgpu code and has the highest bug density.',
              'dc_state submission process: dc_validate_state → DML bandwidth calculation → dc_commit_streams → hardware programming',
              'DML (Display Mode Library): bandwidth/delay calculation framework, underflow caused by watermark errors is the most common bug',
              'DC independent type system: dc_stream/dc_plane/dc_sink, which is a translation relationship with DRM\'s drm_crtc/drm_plane',
              'amdgpu_dm.c is the adapter layer between DRM/KMS and DC, responsible for type conversion and error code translation',
              'DC independent error handling: enum dc_status (DC_OK/DC_FAIL_BANDWIDTH) instead of Linux errno',
            ],
          },
          diagram: {
            title: 'DC independent kingdom structure and dc_state submission process',
            content: `DC "Independent Kingdom" Architecture - Translation Relationship between DRM/KMS and DC

Userspace (GNOME/KDE/Wayland Compositor)
  │ drmModeAtomicCommit()
  ▼
┌──────────────────────────────────────────────────────────────┐
│ DRM Atomic KMS Framework (drivers/gpu/drm/drm_atomic.c) │
│                                                              │
│  drm_atomic_state  ─── drm_crtc_state                       │
│                    ─── drm_connector_state                   │
│                    ─── drm_plane_state                       │
└──────────────────────────────┬───────────────────────────────┘
                               │
▼ "Translation layer"
┌──────────────────────────────────────────────────────────────┐
│  amdgpu_dm.c — DRM ←→ DC Adapter Layer │
│                                                              │
│ drm_crtc_state ──────→ dc_stream_state (resolution/refresh rate/HDR) │
│ drm_plane_state ─────→ dc_plane_state (layer/framebuffer) │
│ drm_connector_state ─→ dc_sink (display device) │
│  errno (-EINVAL) ◄────── dc_status (DC_FAIL_BANDWIDTH)      │
│                                                              │
│  amdgpu_dm_atomic_commit() → dc_commit_streams()              │
└──────────────────────────────┬───────────────────────────────┘
                               │
▼ Inside DC (Independent Kingdom)
┌──────────────────────────────────────────────────────────────┐
│  DC Core (display/dc/core/)                                  │
│  ┌─────────────────────────────────────────────────────────┐ │
│ │ dc_state submission process: │ │
│  │                                                          │ │
│  │  1. dc_validate_state(dc, new_state)                    │ │
│ │ ├─ Check pipeline resources (is the number of pipes enough?) │ │
│ │ ├─ Check timing compatibility │ │
│ │ └─ Call DML bandwidth verification │ │
│  │         │                                                │ │
│  │  2. DML (Display Mode Library)                          │ │
│ │ ├─ Calculate the total bandwidth requirement (resolution × refresh rate × BPP × number of planes) │ │
│ │ ├─ Calculate watermark value (urgent/pstate/dram_clk_change) │ │
│ │ ├─ Bandwidth requirement > Available bandwidth? → DC_FAIL_BANDWIDTH │ │
│ │ └─ Watermark value → HUBP/DPP register configuration │ │
│  │         │                                                │ │
│  │  3. dc_commit_streams(dc, validated_state)                │ │
│ │ ├─ Wait for VBlank (avoid tearing) │ │
│ │ ├─ Programming HUBP register (framebuffer address) │ │
│ │ ├─ Programming DPP Register (Scale/Color) │ │
│ │ ├─ Programming OPTC Register (Timing/VRR) │ │
│ │ └─ Program DIO register (DP/HDMI output) │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                              │
│ Stand-alone facilities in DC: │
│ · Own types: dc_stream, dc_plane, dc_sink (≠ DRM type) │
│ · Own error code: enum dc_status (DC_OK, DC_FAIL_*) │
│ · Own logs: DC_LOG_WARNING, DC_LOG_DC (≠ pr_info/dev_err) │
│ · Own memory: dc_create_*() / dc_destroy_*() │
│ · Own math library: fixed-point arithmetic (for DML, avoid floating point) │
└──────────────────────────────────────────────────────────────┘`,
            caption: 'An architectural panorama of DC as an independent kingdom. amdgpu_dm.c is the only bridge between the DRM/KMS world and the DC world. DC has a completely independent type system, error handling, logging system and memory management internally - this comes from its Windows driver heritage.',
          },
          codeWalk: {
            title: 'dc_commit_streams — Verification → Bandwidth Check → Hardware Programming Sequence',
            file: 'drivers/gpu/drm/amd/display/dc/core/dc.c',
            language: 'c',
            code: `/*dc_commit_streams() — DC's core state commit function
 *Complete process: Verification → DML bandwidth calculation → Hardware programming
 *Called from amdgpu_dm_atomic_commit_tail() in amdgpu_dm.c
 */
enum dc_status dc_commit_streams(struct dc *dc,
                                struct dc_state *context)
{
    enum dc_status result;
    int i;

    /*Phase 1: Global state verification
     *Check: Are there sufficient pipeline resources? Are there timing conflicts?
     *Internally call DML for bandwidth verification */
    result = dc_validate_global_state(dc, context);
    if (result != DC_OK) {
        DC_LOG_WARNING("DC: validate failed: %d\\n", result);
        /*DC_FAIL_BANDWIDTH: Insufficient bandwidth
         *DC_FAIL_RESOURCES: Not enough pipelines
         *amdgpu_dm.c is translated as -EINVAL and returned to DRM */
        return result;
    }

    /*Stage 2: DML watermark calculation
     *Calculate the "latest prefetch time" for each pipeline stage
     *Watermark error → show underflow (the most common DC bug) */
    if (dc->res_pool->funcs->calculate_wm_and_dlg) {
        dc->res_pool->funcs->calculate_wm_and_dlg(
            dc, context, context->res_ctx.pipe_ctx);
        /*urgent_watermark: Urgent prefetch threshold
         *pstate_watermark: Threshold that allows DRAM to switch clocks
         *These values ​​are programmed directly into the HUBP register */
    }

    /*Phase 3: Apply pipeline splitting (if needed)
     *High resolution/high refresh rate may require 2 pipe merge processing */
    dc->hwss.apply_ctx_for_surface(dc, NULL, 0, context);

    /*Phase 4: Programming the hardware stream-by-stream
     *dc_stream = a display output (e.g. 2560x1440 on DP-1) */
    for (i = 0; i < context->stream_count; i++) {
        struct dc_stream_state *stream = context->streams[i];
        struct pipe_ctx *pipe = /*Find the pipe corresponding to stream*/;

        /*Configure OPTC: timing signals (HSync/VSync/VBlank) */
        dc->hwss.setup_stream_encoder(pipe);

        /*Configure DIO: DP/HDMI output encoding and link */
        dc->hwss.enable_stream(pipe);

        /*Configure FreeSync/VRR: dynamic VBlank adjustment */
        if (stream->adjust.v_total_min != 0)
            dc->hwss.set_drr(&pipe, 1,
                stream->adjust);
    }

    /*Phase 5: Programming the hardware plane-by-plane
     *dc_plane = a display layer (desktop/video overlay/cursor) */
    for (i = 0; i < context->res_ctx.pipe_count; i++) {
        struct pipe_ctx *pipe = &context->res_ctx.pipe_ctx[i];

        /*Configure HUBP: framebuffer address, tiling mode */
        dc->hwss.update_plane_addr(dc, pipe);

        /*Configure DPP: scaling, color space conversion */
        dc->hwss.program_pipe(dc, pipe, context);
    }

    /*Stage 6: Complete switchover during VBlank */
    dc->hwss.wait_for_mpcc_disconnect(dc, context);

    dc->current_state = context;
    return DC_OK;
}`,
            annotations: [
              'dc_validate_global_state internally calls DML\'s dml_validate() for complete bandwidth/latency calculations',
              'DC_FAIL_BANDWIDTH is the most common validation failure - easily triggered with multiple monitors + high refresh rates',
              'wm = watermark, dlg = display lag in calculate_wm_and_dlg——Control the prefetch timing of HUBP',
              'dc->hwss (Hardware Sequencer) is a vtable for hardware-related operations. Each generation of DCN has different implementations.',
              'The separation of stream and plane reflects DC\'s multi-layer architecture: a stream can have multiple planes',
              'Wait_for_mpcc_disconnect switches the configuration in the VBlank gap, which is the key to preventing screen tearing',
            ],
            explanation: 'This function shows the complete workflow of DC: first verify whether the configuration is feasible (to avoid hardware damage or underflow), then calculate the precise pipeline parameters (watermark value), and finally program the hardware registers in sequence. Failure in any step will abort and return DC\'s own error code - amdgpu_dm.c is responsible for translating it into the errno expected by DRM/KMS.',
          },
          miniLab: {
            title: 'Trace the execution path of dc_commit_streams',
            objective: 'Observe the real execution of dc_commit_streams using ftrace and debugfs, understand the sequence of DML verification and hardware programming.',
            setup: `sudo mount -t tracefs nodev /sys/kernel/tracing 2>/dev/null
#Confirm that DC debug output is enabled
sudo sh -c 'echo 0x1 > /sys/module/amdgpu/parameters/dc 2>/dev/null'`,
            steps: [
              'Set ftrace tracing dc_commit_streams: echo dc_commit_streams > /sys/kernel/tracing/set_ftrace_filter',
              'Enable function graph tracing: echo function_graph > /sys/kernel/tracing/current_tracer',
              'Start tracing: echo 1 > /sys/kernel/tracing/tracing_on',
              'Trigger dc_commit_streams execution - switch resolution: xrandr --output DP-1 --mode 1920x1080 && sleep 1 && xrandr --output DP-1 --mode 2560x1440',
              'Stop tracing: echo 0 > /sys/kernel/tracing/tracing_on',
              'View the execution sequence: cat /sys/kernel/tracing/trace | grep -E "dc_commit|validate|watermark|dml" | head -30',
              'Check the DC internal status: sudo cat /sys/kernel/debug/dri/0/amdgpu_dm_dtn_log 2>/dev/null | head -80',
            ],
            expectedOutput: `$ cat /sys/kernel/tracing/trace | grep -E "dc_commit|validate" | head -10
  kworker/0:2-345  =>  dc_commit_streams() {
  kworker/0:2-345      dc_validate_global_state() {
  kworker/0:2-345        dml_validate() {
kworker/0:2-345 ... (DML bandwidth calculation) ...
  kworker/0:2-345        } /* 2.345 ms */
  kworker/0:2-345      } /* 3.012 ms */
kworker/0:2-345 ... (hardware programming) ...
  kworker/0:2-345  } /* 8.567 ms */

Note: dc_validate_global_state takes a long time because DML calculation is complex`,
            hint: 'Requires root privileges. If xrandr is not available (pure Wayland), use wlr-randr or gnome-randr instead. amdgpu_dm_dtn_log requires kernel compilation with CONFIG_DEBUG_FS and CONFIG_DRM_AMD_DC_DEBUG enabled.',
          },
          debugExercise: {
            title: 'Show underflow: DML bandwidth calculation failed',
            language: 'c',
            description: 'After a user connects two 4K@60Hz monitors, the second monitor intermittently goes black for 0.5 seconds and then resumes. dmesg and debugfs display the following information.',
            question: 'Diagnose root causes and propose fixes based on DML calculation data and underflow reports.',
            buggyCode: `/*dmesg output */
[  234.567] [drm] DC: dc_validate_state passed  ←The verification actually passed!
[  234.890] [drm] DC: pipe 1 underflow detected!
[  234.890] [drm] DC: HUBP1 urgent watermark breached
[  234.891] [drm] DC: stream 1: 3840x2160@60Hz 10bpc HDR

/*DML calculation data (debugfs amdgpu_dm_dtn_log) */
Stream 0: 3840x2160@60Hz 8bpc → requires 15.9 GB/s
Stream 1: 3840x2160@60Hz 10bpc → Requires 19.9 GB/s
Total required: 35.8 GB/s
Available DRAM BW: 36.0 GB/s   ←Just 0.2 GB/s more headroom!

/*HUBP watermark (from dtn_log) */
HUBP1 urgent_watermark: 22.5 us
HUBP1 actual_prefetch:  23.1 us  ←Barely satisfied

/*Related conditions */
The GPU is running a 3D game (the GFX engine is active, occupying memory bandwidth)`,
            hint: 'dc_validate_state passes under static conditions, but when actually running the GFX engine shares memory bandwidth with the display engine. Do DML\'s bandwidth calculations take this competition into account?',
            answer: 'Root cause: DML\'s bandwidth calculation passed during the verification phase (36.0 > 35.8 GB/s), but the actual margin was only 0.2 GB/s (0.56%), leaving almost no room for error. When the GFX engine runs a 3D game, the GPU memory controller needs to service both display reads and rendering reads and writes - GFX\'s memory access competes with DC\'s display reads for bandwidth, causing the actual bandwidth available to HUBP to be lower than the statically calculated value of DML. Specific performance: There is only a 0.6us margin between HUBP1\'s urgent_watermark (22.5us) and actual_prefetch (23.1us). GFX\'s burst memory access is slightly delayed, and HUBP\'s prefetch triggers underflow. This is a classic DML bug pattern - DML assumes that the display engine gets all the bandwidth it needs, but doesn\'t take enough account of competing for bandwidth with the GFX engine. Fixes: (1) Short-term - reduce Stream 1 to 8bpc (reduces 4 GB/s bandwidth requirements) or reduce refresh rate; (2) Fundamental fix - DML should reserve a larger bandwidth margin (increase "bandwidth_margin" parameter), typical safety margin should be 10-15% instead of 0.56%; (3) Check kernel version - newer kernels may have fixed this DML Underestimation problem of watermark calculation (search git log --oneline display/dc/dml/ to view related patches).',
          },
          interviewQ: {
            question: 'Why does amdgpu have its own display abstraction layer (DC) instead of using DRM/KMS directly? What are the trade-offs?',
            difficulty: 'hard',
            hint: 'Analyze from three dimensions: historical reasons (Windows porting), technical reasons (functional complexity), and engineering reasons (code reuse), and discuss the costs.',
            answer: 'AMD chose to use an independent DC layer instead of directly using DRM/KMS for three reasons: (1) Historical reasons - DC was originally a Windows-driven display engine, and AMD maintained the original architecture when porting it to Linux in 2017 because the cost of rewriting 1.6 million lines of code was unacceptable; (2) Technical reasons - AMD display hardware supports a large number of advanced features that are not supported by the DRM/KMS common framework: FreeSync/VRR, HDR tone mapping, DSC (Display) Stream Compression), PSR (Panel Self Refresh), MST (Multi-Stream Transport), ABM (Adaptive Backlight Management), etc. These features require complex bandwidth calculations (DML) and precise pipeline resource management, which the DRM general framework cannot provide; (3) Engineering reasons - the DC core layer is shared between Windows and Linux, and AMD only needs to maintain one copy of the display logic. When a DML watermark bug is fixed on the Windows side, the Linux side can directly synchronize the fix. Trade-offs: (Advantages) Full functionality, Windows/Linux code sharing, independent verification; (Cost) The code style is inconsistent with the kernel, the amdgpu_dm.c adaptation layer increases complexity, DC\'s unique type system and error handling increase learning costs, the huge amount of DC code leads to long compilation time, DC\'s Windows style (such as avoiding floating point/using fixed point numbers) appears alien in the Linux kernel. Despite these costs, DC mode has proven successful - AMD is the only GPU vendor to offer full FreeSync/VRR/HDR support on Linux.',
            amdContext: 'This is a classic AMD Display team interview question. The interviewer wants to see that you both understand the technical necessity for DC and can objectively evaluate its cost. Special attention is paid to mentioning the complexity of DML - it is the core reason why DC cannot be replaced by a universal framework for DRM.',
          },
        },

        // ── Lesson 5.4.2 ──────────────────────────────────────
        {
          id: '5-4-2',
          number: '5.4.2',
          title: 'DRM GPU Scheduler: The heart of modern command submission',
          titleEn: 'DRM GPU Scheduler: Core of Modern Command Submission',
          duration: 20,
          difficulty: 'expert',
          tags: ['drm-scheduler', 'gpu-scheduler', 'drm_sched_job', 'amdgpu_job', 'timeout', 'preemption'],
          concept: {
            summary: 'DRM GPU Scheduler (drm_gpu_scheduler) is the core framework for GPU command scheduling in the Linux kernel - each Ring Buffer of amdgpu has an independent scheduler instance. It manages the job life cycle (init → arm → push → run → complete/timeout), implements fair scheduling of multiple processes, and provides timeout-based GPU hang detection. The amdgpu_job structure implements the drm_sched_job interface, and writes commands to the Ring Buffer in the run_job callback.',
            explanation: [
              'drm_gpu_scheduler is a general-purpose GPU scheduling framework provided by the DRM subsystem (code in drivers/gpu/drm/scheduler/), originally developed by AMD engineers and contributed to upstream. It provides a separate scheduler instance for each hardware queue (in amdgpu, each Ring Buffer). The core design goals of the scheduler are: fair scheduling among multiple processes (preventing one process from monopolizing the GPU), priority-based command sorting, and timeout-driven GPU hang detection. amdgpu creates a drm_gpu_scheduler instance for each Ring (GFX Ring, SDMA Ring, VCN Ring, etc.).',
              'The complete life cycle of Job includes five stages: (1) drm_sched_job_init() - initialize the job structure, associated to the corresponding scheduler entity (drm_sched_entity, representing a submission source/process); (2) drm_sched_job_arm() - "arm" the job: allocate fences, record timestamps, and the job is ready to be submitted; (3) drm_sched_entity_push_job() - push the job Push into the queue of the scheduling entity; (4) The scheduler thread (kthread) takes out the highest priority job from the queue, calls the run_job callback (amdgpu_job_run for amdgpu) and writes the command into the Ring Buffer; (5) The job is completed (fence signal) or times out (timeout callback). This life cycle ensures the orderliness and traceability of command submissions.',
              'amdgpu_job is amdgpu\'s extended implementation of drm_sched_job. amdgpu_job_run() is the most critical callback - it is executed in the scheduler thread context and writes the IB (Indirect Buffer) reference submitted by the user into the Ring Buffer. The specific steps are: amdgpu_ib_schedule() obtains the Ring Buffer space → writes the INDIRECT_BUFFER PM4 package (pointing to the GPU virtual address of the IB) → writes the FENCE PM4 package (fence sequence number) → amdgpu_ring_commit() updates the WPTR and writes a Doorbell notification to the GPU. There may be a delay between amdgpu_cs_submit() (user submission) and amdgpu_job_run() (actual writing to the Ring) - this depends on scheduler queue depth and priority.',
              'Timeout handling is the most important safety mechanism of the scheduler. The scheduler maintains a timer (via delayed_work) for each executing job, and the default timeout is set by amdgpu (usually 10 seconds for GFX ring). If the fence of the job has not been signaled when the timer expires, it means that the GPU may hang - the scheduler calls the timedout_job callback, and amdgpu implements amdgpu_job_timedout(). This function first checks whether the fence has just been completed (to avoid misjudgment), then dumps the GPU register status (GRBM_STATUS, CP status), and finally triggers amdgpu_device_gpu_recover() to perform a complete GPU reset. After the GPU is reset, all pending jobs will be resubmitted or marked as failed.',
              'Priority scheduling: drm_gpu_scheduler supports multiple priority queues (DRM_SCHED_PRIORITY_KERNEL > HIGH > NORMAL > LOW). High-priority jobs will be scheduled for execution before low-priority jobs. In amdgpu, kernel internal operations (such as page table updates, recovery commands after GPU reset) use KERNEL priority, and normal user space rendering uses NORMAL priority. At the hardware level, the RDNA series supports GFX Ring-level preemption—a high-priority GFX job can pause the currently executing low-priority job and then resume it after completion. This is especially important for VR scenarios (VR compositors need high priority to maintain low latency).',
            ],
            keyPoints: [
              'drm_gpu_scheduler: DRM general GPU scheduling framework, one instance per Ring Buffer',
              'Job life cycle: init → arm → push → (scheduler thread) → run_job → fence signal / timeout',
              'amdgpu_job_run(): Write the IB reference to the Ring Buffer and call amdgpu_ring_commit() to notify the GPU',
              'Timeout mechanism: default 10s timeout → amdgpu_job_timedout → GPU register dump → GPU reset',
              'Priority queue: KERNEL > HIGH > NORMAL > LOW, kernel operations take precedence over user rendering',
              'Scheduler thread (kthread): per-ring independent thread, takes job scheduling and execution from the entity queue',
            ],
          },
          diagram: {
            title: 'DRM GPU Scheduler architecture and job life cycle',
            content: `DRM GPU Scheduler — Job scheduling process

User space (Mesa / Vulkan)
  │ ioctl(DRM_IOCTL_AMDGPU_CS)
  ▼
┌──────────────────────────────────────────────────────────────┐
│ amdgpu_cs_ioctl() — command submission entry │
│ ├─ amdgpu_cs_parser_init() parses ioctl parameters │
│ ├─ amdgpu_cs_parser_bos() verification and mapping BO │
│ └─ amdgpu_cs_submit() creates amdgpu_job │
│      │                                                       │
│ ├─ drm_sched_job_init() initializes the job and associates the entity │
│ ├─ drm_sched_job_arm() arm job: assign fence │
│ └─ drm_sched_entity_push_job() Push into the entity queue ──────┐ │
│                                                          │   │
└──────────────────────────────────────────────────────────│───┘
                                                           │
         ┌─────────────────────────────────────────────────┘
         ▼
┌──────────────────────────────────────────────────────────────┐
│ drm_gpu_scheduler (per-ring scheduler instance) │
│                                                              │
│Priority Queue: │
│  ┌─────────┬──────────┬──────────┬──────────┐               │
│  │ KERNEL  │  HIGH    │ NORMAL   │  LOW     │               │
│ │ (Page table │ (VR Composition │ (Normal │ (Backend │ │
│ │ update) │ renderer) │ render) │ calculate) │ │
│  └────┬────┴────┬─────┴────┬─────┴────┬─────┘               │
│       │         │          │          │                      │
│       └────┬────┘          │          │                      │
│ │ Select priority from high to low │ │
│            ▼                          │                      │
│ Scheduler kthread (per-ring): │ │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ while (true) {                                         │  │
│ │ job = take job from the highest priority non-empty queue; │ │
│ │ if (available Ring space && dependent fence signaled) { │ │
│  │     fence = job->sched->ops->run_job(job);             │  │
│  │     /* → amdgpu_job_run():                             │  │
│  │      *   amdgpu_ib_schedule()                          │  │
│ │ * → Write INDIRECT_BUFFER PM4 to Ring │ │
│ │ * → Write FENCE PM4 to Ring │ │
│  │      *   → amdgpu_ring_commit() + Doorbell             │  │
│  │      */                                                │  │
│ │ Start timeout timer (default 10s); │ │
│  │   }                                                    │  │
│  │ }                                                      │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│ Timeout detection: │
│  ┌────────────────────────────────────────────────────────┐  │
│ │ timer expired && fence not signal? │ │
│  │   → drm_sched_job_timedout()                          │  │
│  │     → amdgpu_job_timedout()                           │  │
│ │ ├─ Check whether the fence has just been completed (to avoid misjudgment) │ │
│  │       ├─ DRM_ERROR("ring xxx timeout")                │  │
│ │ ├─ dump GPU registers (GRBM_STATUS, CP_*) │ │
│  │       └─ amdgpu_device_gpu_recover()                  │  │
│ │ └─ GPU reset → Reinitialize → Resubmit/Fail │ │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
         │
         ▼ Ring Buffer (amdgpu_ring_commit → Doorbell)
┌──────────────────────────────────────────────────────────────┐
│  GPU Command Processor (CP)                                  │
│ · Read INDIRECT_BUFFER PM4 in Ring Buffer │
│ · Follow the pointer to the IB address to execute the command │
│ · After completion, write the fence serial number → trigger interrupt → signal fence │
└──────────────────────────────────────────────────────────────┘`,
            caption: 'The complete workflow of DRM GPU Scheduler: the job is submitted from user space, sorted by the scheduler\'s priority queue, written to the Ring Buffer by the scheduler thread calling run_job, and finally executed by the GPU CP. The timeout mechanism is the core of GPU hang detection.',
          },
          codeWalk: {
            title: 'amdgpu_cs_submit → scheduler → amdgpu_job_run full path',
            file: 'drivers/gpu/drm/amd/amdgpu/amdgpu_job.c',
            language: 'c',
            code: `/*amdgpu_cs_submit() — Create a job and submit it to the scheduler
 *Called from the final stage of amdgpu_cs_ioctl()
 */
static int amdgpu_cs_submit(struct amdgpu_cs_parser *p,
                             union drm_amdgpu_cs *cs)
{
    struct amdgpu_job *job = p->job;

    /*Step 1: Initialize the scheduler job
     *Associate the job to the drm_sched_entity of the submitting process */
    r = drm_sched_job_init(&job->base,
                           entity,      /*Submit the scheduling entity of the process*/
                           owner);      /*Process ID*/

    /*Step 2: Arm the job — allocate fence, record timestamp
     *Thereafter the job can be relied upon by other jobs */
    drm_sched_job_arm(&job->base);

    /*Step 3: Push the scheduling entity to the queue
     *The scheduler thread will take out the job from the queue and execute it */
    drm_sched_entity_push_job(&job->base);

    /*cs->out.handle is returned to user space for querying completion status */
    cs->out.handle = amdgpu_ctx_add_fence(ctx, entity,
                                           &job->base.s_fence->finished);
    return 0;
}

/*amdgpu_job_run() — scheduler's run_job callback
 *Execute in scheduler kthread context
 *This is the key turning point for the job to change from "queuing" to "GPU execution"
 */
static struct dma_fence *amdgpu_job_run(struct drm_sched_job *sched_job)
{
    struct amdgpu_job *job = to_amdgpu_job(sched_job);
    struct amdgpu_ring *ring = to_amdgpu_ring(sched_job->sched);
    struct dma_fence *fence = NULL;
    int r;

    /*Write IB to Ring Buffer
     *Internal process of amdgpu_ib_schedule:
     *1. amdgpu_ring_alloc() — allocate space in Ring
     *2. Write INDIRECT_BUFFER PM4 packet (pointing to IB)
     *3. amdgpu_fence_emit() — Insert fence command in Ring
     *4. amdgpu_ring_commit() — Update WPTR + Doorbell
     */
    r = amdgpu_ib_schedule(ring,
                           job->num_ibs,    /*IB quantity*/
                           job->ibs,        /*IB array*/
                           job,
                           &fence);         /*returned fence*/
    if (r) {
        DRM_ERROR("Error scheduling IBs (%d)\\n", r);
        dma_fence_set_error(&job->base.s_fence->finished, r);
        return NULL;
    }

    return fence;
}

/*amdgpu_job_timedout() — timeout callback
 *Called when the job's fence does not signal within the timeout period
 */
static enum drm_gpu_sched_stat
amdgpu_job_timedout(struct drm_sched_job *s_job)
{
    struct amdgpu_job *job = to_amdgpu_job(s_job);
    struct amdgpu_ring *ring = to_amdgpu_ring(s_job->sched);
    struct amdgpu_device *adev = ring->adev;

    /*Check whether the fence has just been completed (race conditions avoid misjudgment) */
    if (amdgpu_ring_soft_recovery(ring, s_job->s_fence->parent))
        return DRM_GPU_SCHED_STAT_NOMINAL;

    /*Confirm that it is a real hang - record error information */
    DRM_ERROR("ring %s timeout, signaled seq=%u, emitted seq=%u\\n",
              ring->sched.name,
              atomic_read(&ring->fence_drv.last_seq),
              ring->fence_drv.sync_seq);

    /*dump GPU register status for debugging */
    amdgpu_debugfs_gpu_recover(adev);

    /*Trigger GPU reset */
    r = amdgpu_device_gpu_recover(adev, job, false);
    if (r)
        DRM_ERROR("GPU Recovery Failed: %d\\n", r);

    return DRM_GPU_SCHED_STAT_NOMINAL;
}`,
            annotations: [
              'drm_sched_job_init associates job with entity - entity represents a submitting process for fair scheduling',
              'drm_sched_job_arm allocates scheduled/finished two fences: scheduled signal when run_job is called, finished signal when GPU completes',
              'drm_sched_entity_push_job puts the job into the entity queue - the scheduler thread takes the job from the queue according to priority',
              'amdgpu_job_run runs in the scheduler kthread - not in the user process context and cannot access user space memory',
              'amdgpu_ib_schedule is the core of Ring Buffer writing: allocate space → write PM4 → emit fence → commit',
              'amdgpu_ring_soft_recovery attempts "soft recovery": if the CP is just stuck on a certain command, send a preempt signal',
            ],
            explanation: 'These three functions form the core path for amdgpu command submission: submit is responsible for job creation and enqueueing, run is responsible for actual Ring Buffer writing, and timedout is responsible for exception handling. After understanding this path, you can answer "What stages does a GPU command go through from submission to execution" - this is a high-frequency question in AMD interviews.',
          },
          miniLab: {
            title: 'Observe the running status of DRM GPU Scheduler',
            objective: 'Observe the scheduler\'s queue depth, job execution time, and timeout configuration through debugfs and ftrace.',
            setup: `#Make sure debugfs is mounted
sudo mount -t debugfs none /sys/kernel/debug 2>/dev/null
#Prepare GPU workloads
sudo apt install -y mesa-utils vulkan-tools`,
            steps: [
              'List the scheduler/ring debugfs files: ls /sys/kernel/debug/dri/0/   (WARNING: do NOT cat amdgpu_gpu_recover — reading it forces a full GPU reset and discards in-flight work; it is a reset trigger, not a status file)',
              'View the fence information of each Ring: sudo cat /sys/kernel/debug/dri/0/amdgpu_fence_info',
              'Set the ftrace tracing scheduler: echo amdgpu_job_run > /sys/kernel/tracing/set_ftrace_filter',
              'Enable tracing and run GPU load: echo function_graph > /sys/kernel/tracing/current_tracer && echo 1 > /sys/kernel/tracing/tracing_on && glxgears & sleep 3 && kill %1',
              'Stop tracing and view the results: echo 0 > /sys/kernel/tracing/tracing_on && cat /sys/kernel/tracing/trace | head -40',
              'View scheduler timeout configuration: dmesg | grep -i "timeout\\|scheduler" | head -10',
            ],
            expectedOutput: `$ sudo cat /sys/kernel/debug/dri/0/amdgpu_fence_info
--- ring gfx_0.0.0 ---
Last signaled fence          0x00008a31
Last emitted                 0x00008a34
  ←3 jobs are executing/queued

--- ring sdma0 ---
Last signaled fence          0x00000456
Last emitted                 0x00000456
  ←SDMA idle

$ cat /sys/kernel/tracing/trace | head -10
# tracer: function_graph
 sched-gfx_0-789  =>  amdgpu_job_run() {
 sched-gfx_0-789      amdgpu_ib_schedule() { ... }
 sched-gfx_0-789  } /* 5.234 us */   ←Single job scheduling takes about 5us`,
            hint: 'sched-gfx_0 in ftrace is the scheduler kthread of GFX Ring 0. Each call to amdgpu_job_run corresponds to a command submission from the queue to the Ring. If the difference between "Last signaled" and "Last emitted" is large and unchanged, it means the GPU hangs.',
          },
          debugExercise: {
            title: 'Understanding GPU hang timeout: scheduler timeout vs hardware hang',
            language: 'text',
            description: 'Users report frequent GPU "timeouts" but no system crashes. dmesg displays periodic ring timeout messages. It is necessary to determine whether it is a real hardware hang or a misjudgment by the scheduler.',
            question: 'Analyze the following two sets of timeout logs to determine which one is a real GPU hang and which one is a misjudgment by the scheduler. Explain your reasoning.',
            buggyCode: `/*Scene A */
[  100.123] ring gfx_0.0.0 timeout, signaled seq=5000, emitted seq=5001
[  100.123] GRBM_STATUS=0x00000000 (GFX IDLE!)
[  100.124] CP_RB_RPTR=0x0000A000
[  100.124] CP_RB_WPTR=0x0000A000  (RPTR == WPTR)
[  100.125] GPU reset succeeded

/*Scene B */
[  200.456] ring gfx_0.0.0 timeout, signaled seq=8000, emitted seq=8004
[  200.456] GRBM_STATUS=0x00030300 (GUI_ACTIVE | GFX_BUSY | CP_BUSY)
[  200.457] CP_RB_RPTR=0x0000F100
[200.457] CP_RB_WPTR=0x0000F200 (RPTR < WPTR, Ring has unprocessed command)
[  200.458] SRC_ID: 146, VMID: 3, addr: 0x0000DEAD0000
[  200.460] GPU reset succeeded`,
            hint: 'Compare the GRBM_STATUS (whether the GPU is busy) and the RPTR/WPTR relationship (whether the Ring has unprocessed commands) of the two scenarios. What does GFX_IDLE + RPTR==WPTR mean?',
            answer: 'Scenario A is a scheduler misjudgment (false timeout), and scenario B is a real GPU hang. Analysis: Scenario A - GRBM_STATUS=0 means that the GFX engine is completely idle (no activity), CP_RB_RPTR == CP_RB_WPTR means that the Ring Buffer is empty (GPU has processed all commands), signaled=5000, emitted=5001 means that there is only 1 fence missing. Putting it all together: the GPU has actually completed execution (Ring is empty, GFX is idle), but the fence value is not updating correctly - possibly a missing fence writeback interrupt (interrupt coalescing or IH ring overflow) or a writeback memory map issue. Repair direction: Check whether the IH (Interrupt Handler) ring overflows, or the GPU→CPU consistency of the fence writeback buffer. Scenario B - GRBM_STATUS shows GUI_ACTIVE, GFX_BUSY, CP_BUSY (GPU is executing but stuck), RPTR < WPTR (there are unprocessed commands in Ring), signaled=8000, emitted=8004 (4 jobs backlog), SRC_ID:146 is VMC page fault, addr=0x0000DEAD0000 is obvious poison address. This is a typical GPU hang: the GPU tries to access an invalid virtual address causing a VMC fault, and the GFX engine stalls on the fault. The root cause is userspace use-after-free (the BO is released but its address is still referenced in the shader).',
          },
          interviewQ: {
            question: 'Explain the DRM GPU scheduler\'s role in amdgpu command submission. How does it handle job scheduling and GPU hang detection?',
            difficulty: 'hard',
            hint: 'Describe the scheduler architecture (per-ring instances, priority queues, scheduler threads), job life cycle, and the complete chain of timeout→reset.',
            answer: 'DRM GPU Scheduler plays three core roles in amdgpu command submission: (1) Multi-process fair scheduling - each submission process (drm_sched_entity) has its own job queue, and the scheduler selects jobs from multiple entities for execution according to priority (KERNEL > HIGH > NORMAL > LOW) and fairness principles. Each Ring Buffer has an independent scheduler instance and kthread, so that the scheduling of GFX, SDMA, and VCN does not interfere with each other. (2) Job life cycle management - full path: User submits ioctl → call drm_sched_job_init()/arm()/push() in amdgpu_cs_submit() to enqueue job → scheduler kthread selects job → call amdgpu_job_run() callback → amdgpu_ib_schedule() writes INDIRECT_BUFFER PM4 package to Ring → amdgpu_ring_commit() notifies the GPU CP through Doorbell → writes the fence sequence number after the GPU execution is completed → interrupts the fence signal → the scheduler marks the job completion. (3) GPU hang detection - the scheduler starts a timer for each running job (amdgpu GFX ring defaults to 10 seconds). If the timer expires and the fence does not signal, call amdgpu_job_timedout(): first try soft recovery (send preempt signal), if it fails, dump GPU registers (GRBM_STATUS, CP_RB_RPTR/WPTR, GPU fault information), and finally call amdgpu_device_gpu_recover() performs GPU mode 1/2 reset - saves state, resets GPU hardware, reinitializes all IP Blocks, resubmits unfinished jobs or marks failure and returns -ECANCELED to user space.',
            amdContext: 'DRM GPU Scheduler was originally developed by AMD engineer (Christian König). Showing in the interview that you understand how the scheduler connects "user space submission" and "GPU execution", and how the timeout mechanism protects the system from GPU hangs, is the key to demonstrating in-depth understanding.',
          },
        },

        // ── Lesson 5.4.3 ──────────────────────────────────────
        {
          id: '5-4-3',
          number: '5.4.3',
          title: 'GPU virtual memory subsystem: amdgpu_vm detailed explanation',
          titleEn: 'GPU Virtual Memory Subsystem: amdgpu_vm In-Depth',
          duration: 20,
          difficulty: 'expert',
          tags: ['GPUVM', 'amdgpu_vm', 'page-table', 'PDB', 'PTE', 'VM-fault', 'VMID'],
          concept: {
            summary: 'GPUVM (GPU Virtual Memory) is the virtual memory subsystem of amdgpu, which provides an independent GPU virtual address space for each process. It uses multi-level page tables (PDB2→PDB1→PDB0→PD→PT→PTE, up to 6 levels, like x86 but customized for GPU) to translate GPU virtual addresses into VRAM/GTT physical addresses. amdgpu_vm_bo_update() is the core function - when a Buffer Object is bound to the VM, it creates/updates the GPU page table entry.',
            explanation: [
              'GPUVM page table hierarchy: AMD GPU uses up to 6 levels of page tables to translate virtual addresses, from high to low: PDB2 (Page Directory Base 2) → PDB1 → PDB0 → PD (Page Directory) → PT (Page Table) → PTE (Page Table Entry). Each level of the index uses a different bit field in the virtual address - for example, in a 48-bit virtual address space, PDB2 uses VA[47:39] (9 bits, 512 entries), PDB1 uses VA[38:30], PDB0 uses VA[29:21], PT uses VA[20:12], and the physical page frame number is stored in the PTE. This is similar to the x86 CPU\'s level 4/5 page table concept, but the GPUVM\'s page table is stored in VRAM (rather than system memory) and traversed by the GPU\'s UTCL2 (Unified Translation Cache Level 2) hardware.',
              'struct amdgpu_vm represents the GPU virtual address space of a process. Each process that opens /dev/dri/renderD128 creates an amdgpu_vm instance. The core fields include: root - the Buffer Object of the root page directory (PDB2), which is the entrance to the entire page table tree; va - the red-black tree, which records all mapped virtual address ranges (VA mapping); evicted - the evicted page table BO list (the page table itself may also be evicted to GTT when the VRAM pressure is high); last_update - the fence pointing to the latest page table update, used to track the GPU-side completion status of the page table update. Page table BO management is a major challenge for GPUVM - the page table itself is also a Buffer Object in GPU memory, which needs to be managed through TTM and needs to be updated synchronously during BO migration.',
              'amdgpu_vm_bo_update() is the core function of GPUVM - this function is called when a BO is mapped to the GPU virtual address space of a process, or when the mapping needs to be updated after the BO is migrated between VRAM and GTT. Its workflow: (1) Traverse all VA mappings associated with the BO (a BO may be mapped to multiple virtual addresses); (2) For each mapping, call amdgpu_vm_update_ptes() to update the corresponding page table entries - calculate which levels of page tables need to be modified, and update the physical address field of the PTE to the new location of the BO; (3) Page table updates are submitted through the SDMA Ring (SDMA is smaller than GFX perform memory filling operations more efficiently), the returned fence is used to track update completion.',
              'GPUVM fault (VM fault) handling is a key scenario for debugging GPU issues. When the GPU accesses an unmapped or invalid virtual address, UTCL2 (the GPU\'s TLB/page table walk hardware) generates a page fault interrupt. After receiving this interrupt, amdgpu\'s interrupt processing function: (1) Read fault information from the IH ring - including fault address (VA), VMID (address space that identifies which process), whether to read or write, fault source (GFX/SDMA/VCN, etc.); (2) Record "[drm] VM fault (src_id:146, ring:0, vmid:3, addr:0xDEAD0000)"; (3) For user space processes, this usually causes the GPU context of the process to be marked as having an error. Common VM fault causes: use-after-free (the BO is still referenced in the shader after releasing it), out-of-bounds access (the shader accesses an address beyond the BO range), the page table is not updated (the page table synchronization fails after BO migration).',
              'VM address space layout: The virtual address space of GPUVM is usually 48 bits (256 TB) and is divided into several regions: the low address region is allocated to the user space BO map (VA is allocated through amdgpu_vm_bo_map), and the high address region is reserved for the kernel (such as kernel BO, page table itself). VA allocation uses the drm_mm manager (interval tree/interval allocation), amdgpu_vm_bo_map() finds a large enough free interval in the VM\'s VA space, creates a mapping record (struct amdgpu_bo_va_mapping), but does not write the page table at this time - the actual update of the page table is delayed to amdgpu_vm_bo_update() (to ensure that the mapping is valid before the command is submitted). This "lazy mapping" design reduces unnecessary page table updates.',
            ],
            keyPoints: [
              'GPUVM multi-level page table: PDB2→PDB1→PDB0→PD→PT→PTE, up to 6 levels, stored in VRAM',
              'struct amdgpu_vm: per-process GPU address space, including root page directory BO and VA mapping red-black tree',
              'amdgpu_vm_bo_update(): core function, updates GPU page table entries during BO binding/migration',
              'VM fault: GPU access is invalid VA → UTCL2 generates an interrupt → dmesg records fault information (VMID + addr)',
              'Page table updates are committed through the SDMA Ring, and the page table BO itself is also managed by TTM (may be evicted to GTT)',
              'VA space layout: 48 bits (256TB), user area is at low address, kernel is reserved at high address',
            ],
          },
          diagram: {
            title: 'GPUVM multi-level page table structure and address translation',
            content: `GPUVM multi-level page table address translation - AMD GPU virtual memory

GPU virtual address (48 bit):
┌──────┬──────┬──────┬──────┬──────┬──────┐
│PDB2  │PDB1  │PDB0  │ PD   │ PT   │Offset│
│[47:39]│[38:30]│[29:21]│[20:18]│[17:12]│[11:0]│
│9 bit │9 bit │9 bit │3 bit │6 bit │12 bit│
└──┬───┴──┬───┴──┬───┴──┬───┴──┬───┴──────┘
   │      │      │      │      │
   ▼      ▼      ▼      ▼      ▼
┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐
│PDB2 │→│PDB1 │→│PDB0 │→│ PD │→│ PT │→ Physical page
│(root) │ │ │ │ │ │ │ │ │ (VRAM/GTT)
│512 items │ │512 items │ │512 items │ │8 items │ │64 items │
│      │  │      │  │      │  │      │  │      │
│[idx] │  │[idx] │  │[idx] │  │[idx] │  │[idx] │
│  ↓   │  │  ↓   │  │  ↓   │  │  ↓   │  │  ↓   │
│next→ │  │next→ │  │next→ │  │next→ │  │PFN   │
└──────┘  └──────┘  └──────┘  └──────┘  └──────┘

PTE (Page Table Entry) format:
┌──────────────────────────────────────────────────┐
│ [63:57] Reserved │
│ [56:12] Physical Page Frame Number (PFN) — VRAM or GTT physical address │
│ [11] P (Present) — Whether the page is valid │
│ [10]    S (System) — 0=VRAM, 1=System Memory(GTT) │
│ [9:7] MTYPE — Memory type (Cached/Uncached, etc.) │
│ [6]     W (Writeable)                             │
│ [5]     R (Readable)                              │
│ [4]     X (Executable)                            │
│ [3:0] Fragment — Hugepage support (similar to CPU hugepage) │
└──────────────────────────────────────────────────┘

struct amdgpu_vm (per-process GPU virtual address space):
┌──────────────────────────────────────────────────┐
│  root (BO)           ←PDB2 root page directory Buffer Object│
│  va (red-black tree) ←Index of all VA mappings │
│  evicted (linked list) ←Page-table BOs evicted to GTT │
│  invalidated (linked list) ←Mappings that need updates │
│  last_update (fence) ←Completion tracking of recent page table updates │
│  pasid               ← Process Address Space ID    │
└──────────────────────────────────────────────────┘
         │
▼ VM address space layout (48-bit, 256 TB)
┌──────────────────────────────────────────────────┐
│ 0x000000000000 ───────────────────── User Space │
│ BO mapping area (amdgpu_vm_bo_map allocation) │
│ shader code, vertex buffer, texture, │
│ framebuffer and other user BOs are mapped here │
│                                                   │
│ ~~~~~~~~~~~~~~~~~~~~~~~~ (huge free space) ~~~~~~~~│
│                                                   │
│ 0xFFFFF0000000 ──────────────────── Kernel reserved │
│ Kernel BO, page table itself, SVM reserved area │
│ 0xFFFFFFFFFFFF ─────────────────── Top of address space │
└──────────────────────────────────────────────────┘

VM fault handling process:
GPU access invalid VA → UTCL2 TLB miss → page table walk failed
→ VMC generates page fault interrupt (SRC_ID: 146)
→ IH ring record: {vmid, addr, rw, src}
      → amdgpu_vm_fault_handler()
        → dmesg: "VM fault (vmid:3, addr:0xDEAD0000)"
→ Mark process GPU context as error state`,
            caption: 'GPUVM\'s multi-level page table structure and address translation process. Similar concept to x86 CPU page tables, but page tables are stored in VRAM and traversed by the GPU\'s UTCL2 hardware. The S bit in the PTE differentiates whether the physical page is in VRAM or GTT (system memory).',
          },
          codeWalk: {
            title: 'amdgpu_vm_bo_update — Map BO into GPU virtual address space',
            file: 'drivers/gpu/drm/amd/amdgpu/amdgpu_vm.c',
            language: 'c',
            code: `/*amdgpu_vm_bo_update() — Update the mapping of BO in the GPU page table
 *Called when BO is bound to the VM for the first time, or after BO is migrated to VRAM↔GTT
 *This is the core function of GPUVM
 */
int amdgpu_vm_bo_update(struct amdgpu_device *adev,
                         struct amdgpu_bo_va *bo_va,
                         bool clear)
{
    struct amdgpu_bo *bo = bo_va->base.bo;
    struct amdgpu_vm *vm = bo_va->base.vm;
    struct list_head *head;
    int r;

    /*Get the physical address of BO
     *If BO is in VRAM: addr = VRAM offset
     *If BO is in GTT: addr = system memory DMA address
     *if clear=true: addr = 0 (unmap) */
    if (clear) {
        addr = 0;
        flags = 0;
    } else {
        addr = amdgpu_bo_gpu_offset(bo);
        flags = amdgpu_ttm_tt_pte_flags(adev, bo->tbo.ttm);
        /*flags include: readable, writeable, executable,
         * MTYPE (cached/uncached), system vs vram */
    }

    /*Traverse all VA mappings of this BO
     *A BO ​​may be mapped to multiple virtual addresses of the same VM */
    list_for_each_entry(mapping, &bo_va->invalids, list) {
        /*mapping->start: VA starting address (page alignment)
         *mapping->last: VA end address
         *addr: physical address
         *flags: PTE attributes (R/W/X, MTYPE, etc.) */

        r = amdgpu_vm_update_ptes(adev, vm,
                                   mapping->start,
                                   mapping->last + 1,
                                   addr, flags);
        if (r)
            return r;

        addr += (mapping->last - mapping->start + 1)
                * AMDGPU_GPU_PAGE_SIZE;
    }

    /*Move mapping from invalids to valids list */
    list_splice_init(&bo_va->invalids, &bo_va->valids);

    /*Commit page table updates to SDMA Ring
     *SDMA is better suited than GFX for large numbers of small writes (page table updates) */
    r = amdgpu_vm_update_pdes(adev, vm, false);

    /*Logging fence is used to track update completion */
    vm->last_update = fence;
    return r;
}

/*amdgpu_vm_update_ptes — Update page table entries for the specified VA range */
static int amdgpu_vm_update_ptes(struct amdgpu_device *adev,
                                  struct amdgpu_vm *vm,
                                  uint64_t start, uint64_t end,
                                  uint64_t dst, uint64_t flags)
{
    struct amdgpu_vm_update_params params;

    /*Calculate which page table levels need to be modified based on VA range
     *Hugepages can be used if map size >= 2MB and aligned
     *(Direct mapping at PD level, skipping PT level) */
    amdgpu_vm_update_flags(&params, start, end, flags);

    /*Traverse the multi-level page table to find the target PTE location
     *If the intermediate-level page directory does not exist, create it dynamically
     *(Allocate new BO as page directory) */
    while (start < end) {
        /*Calculate the page table BO corresponding to the current PTE */
        pt_bo = amdgpu_vm_get_pt(&params, start);

        /*Write PTE: Write dst (physical address) to page table entry
         *Executed through SDMA WRITE_DATA command */
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
              'The bo_va->invalids list stores the mappings that need to be updated - the mapping becomes invalid after BO migration',
              'amdgpu_bo_gpu_offset returns the physical offset address of BO in VRAM/GTT',
              'The S bit (System) in PTE flags determines whether the GPU accesses the physical page through VRAM or PCIe',
              'amdgpu_vm_update_pdes ensures the consistency of the page directory chain - the TLB needs to be refreshed after modifying the PTE',
              'Page table updates are committed via SDMA - SDMA\'s memset/memcpy operations are more efficient than GFX',
              'Large page support (PD level direct mapping) reduces the number of page table levels and improves TLB hit rate',
            ],
            explanation: 'This function is the core of GPU memory management - each time BO is used, it needs to ensure that its mapping is valid. In the command submission path (amdgpu_cs_parser_bos), the driver will check the mapping status of all BOs referenced by the command, and call amdgpu_vm_bo_update for invalid mappings to update the page table. The performance of page table updates directly affects command submission latency.',
          },
          miniLab: {
            title: 'View GPU virtual memory mapping and page table information',
            objective: 'Observe GPUVM\'s address mapping, page table hierarchy and VM fault handling mechanism through debugfs.',
            setup: `#Make sure debugfs is mounted
sudo mount -t debugfs none /sys/kernel/debug 2>/dev/null
#Preparing GPU workloads to trigger BO mapping
sudo apt install -y mesa-utils`,
            steps: [
              'View all VMID assignments: sudo cat /sys/kernel/debug/dri/0/amdgpu_vm_info 2>/dev/null',
              'Running a GPU application triggers VA mapping: glxgears & GLXPID=$!; sleep 2',
              'View the BO list of the GPU process: sudo cat /sys/kernel/debug/dri/0/amdgpu_gem_info | head -30',
              'View VM statistics: sudo cat /sys/kernel/debug/dri/0/amdgpu_vm_info 2>/dev/null',
              'Check whether there are recent VM faults: dmesg | grep -i "vm fault\\|page fault\\|vmid" | tail -10',
              'Cleanup: kill $GLXPID 2>/dev/null',
            ],
            expectedOutput: `$ sudo cat /sys/kernel/debug/dri/0/amdgpu_vm_info
VM info:
  num VMs: 3         ←The number of currently active GPU virtual address spaces
  num page tables: 128   ←Number of active page table BOs
  VMID usage:
    VMID 0: kernel reserved
    VMID 1: pid 1234 (Xorg)
    VMID 3: pid 5678 (glxgears)

$ sudo cat /sys/kernel/debug/dri/0/amdgpu_gem_info | head -10
pid   5678 command glxgears:
  BO: 0x00007F0000000000 size: 16MB  domain: VRAM  ←main framebuffer
  BO: 0x00007F0001000000 size: 4MB   domain: VRAM  ← texture/vertex
  BO: 0x00007F0002000000 size: 256KB domain: GTT   ← command buffer
  ...`,
            hint: 'The specific debugfs path and output format depend on the kernel version. amdgpu_gem_info displays the BO list of each process and its GPU virtual address, which is the most direct way to understand the VM mapping. If VM info is not available, try amdgpu_fence_info and dmesg combination.',
          },
          debugExercise: {
            title: 'Diagnosing VM faults: decoding fault address and VMID from dmesg output',
            language: 'text',
            description: 'A GPU computing task in the production environment periodically triggers VM fault. Below is the dmesg output and related system status. Need to decode fault information and locate the root cause.',
            question: 'Decode the following VM fault information: determine in which process the fault occurred, what address was accessed, what caused the fault, and how to fix it.',
            buggyCode: `/*dmesg VM fault output */
[  456.789] amdgpu 0000:03:00.0: amdgpu:
  [gfxhub0] VMC page fault
  src_id:146 ring:0 vmid:5 pasid:32773
  addr:0x0000800100004000
  [read, type:4, protections:0x0]

/*GPU process information */
$ cat /sys/kernel/debug/dri/0/amdgpu_gem_info | grep "pid.*32773"
pid 32773 command my_compute_app:
  BO: 0x0000800100000000 size: 16KB domain: VRAM  flags: r/w
  BO: 0x0000800200000000 size: 4MB  domain: VRAM  flags: r/w

/*Application code snippet (OpenCL kernel) */
__kernel void process(__global float* input, int N) {
    int idx = get_global_id(0);
    /*input buffer size: 16KB = 4096 float */
    float val = input[idx];  /*idx may > 4096!*/
    ...
}

/*Startup configuration */
global_work_size = 8192;  /*8192 threads*/
/*But input only has 4096 floats (16KB) */`,
            hint: 'Compare the fault address (0x0000800100004000) and the BO mapping address (0x0000800100000000, size: 16KB=0x4000). The fault address is exactly at the boundary where the BO ends.',
            answer: 'Decoding analysis: (1) VMID=5, PASID=32773 - PASID is the Process Address Space ID, and it is confirmed by amdgpu_gem_info that it is the "my_compute_app" process (pid 32773). VMID=5 is the virtual address space identifier assigned by the GPU hardware to the process. (2) Fault address = 0x0000800100004000 - the input BO of this process is mapped at 0x0000800100000000, with a size of 16KB (0x4000 bytes). The address range covered by BO is [0x800100000000, 0x800100004000). The fault address 0x800100004000 happens to be the end of BO (the first out-of-bounds address). (3) type:4 = "no valid PTE", protections:0x0 = "no permissions" - there is no valid mapping for this address in the page table. (4) Root cause: classic array out-of-bounds access. The OpenCL kernel starts 8192 threads (global_work_size=8192), and each thread reads input[get_global_id(0)], but the input buffer only has 4096 floats (16KB). When thread ID >= 4096, the access address exceeds the BO mapping range. The access address of thread 4096 = base + 4096*4 = base + 0x4000, which happens to trigger a VM fault. Repair plan: (a) Increase the input buffer to 32KB (8192 floats); (b) Add boundary check in the kernel: if (idx < N) val = input[idx]; (c) Adjust global_work_size to 4096 to match the actual data amount. This is the most common type of VM fault in GPU programming - the equivalent of a segfault/out-of-bounds access on the CPU side.',
          },
          interviewQ: {
            question: 'Describe the GPU virtual memory system in amdgpu and how it differs from CPU virtual memory.',
            difficulty: 'hard',
            hint: 'Comparison from four dimensions: page table structure (multi-level, VRAM storage), address space management (per-process VM), fault processing (non-recoverable vs CPU demand paging) and mapping update mechanism.',
            answer: 'Comparison between GPUVM and CPU virtual memory: (1) Page table structure - GPUVM uses a multi-level page-table hierarchy, while CPU x86_64 typically uses 4-5 levels. In amdgpu, the page tables are represented by GPU-managed BOs and the GPU performs address translation through its own MMU/TLB hardware rather than the CPU\'s page-walk machinery. (2) Address space management - both are per-process independent address spaces: CPU uses struct mm_struct, GPUVM uses struct amdgpu_vm. The GPU assigns a VMID per process (similar to the ASID/PCID concept on CPUs) for TLB tagging. GPUVM\'s VA allocation uses drm_mm-style range allocation, and mappings are established through amdgpu_vm_bo_map(). (3) Fault processing - this is the biggest difference. CPU page faults routinely support demand paging and retry. In traditional amdgpu graphics/compute execution, many GPU VM faults end up terminating or poisoning the context rather than transparently resuming it. ROCm managed-memory and page-migration flows can support retry-based behavior on supported XNACK-capable platforms, but that is hardware- and runtime-dependent rather than a universal property of all AMD GPUs. (4) Mapping update - CPU page table updates are performed directly by the CPU and synchronized with TLB invalidation, while GPUVM page-table updates are asynchronous driver-managed operations commonly emitted through GPU command paths and tracked with fences. That means mapping visibility has to be synchronized carefully before dependent work is submitted.',
            amdContext: 'GPUVM is a frequent and in-depth topic in interviews at AMD, especially on the Memory Management team. Showing that you understand the essential differences between GPU and CPU virtual memory (fault handling, page table storage locations, asynchronous updates), and not just the analogy of "GPUs have page tables too", is key to differentiating good candidates.',
          },
        },
      ],
    },
  ],
  completionChecklist: [
    'Able to draw the amdgpu driver source code directory structure and state the responsibilities of each subdirectory (amdgpu/, display/dc/, amdkfd/, pm/)',
    'Master cscope/ctags or clangd to navigate in the kernel source code and quickly locate the source code location from dmesg errors',
    'Understand IP Block architecture: unified amd_ip_funcs interface, initialization sequence dependency, IP Discovery mechanism',
    'Can fully describe the command submission path: ioctl → parser → BO verification → scheduler → Ring Buffer → Doorbell → CP execution',
    'Understand the Fence synchronization mechanism: emit/signal process, interrupt processing, GPU hang detection and reset',
    'Understand the DC display engine architecture: DRM KMS → amdgpu_dm → DC Core → DCN hardware layer',
    'Able to monitor and control GPU frequency/temperature/power consumption through the sysfs interface, and understand the working principles of SMU and DVFS',
    'Able to analyze GPU error information (ring timeout, underflow, VM fault) in dmesg and locate the root cause',
    'Understand DC architecture: dc_state commit flow, DML bandwidth validation, DC vs DRM adapter layer',
    'Can explain DRM GPU Scheduler: job lifecycle, timeout handling, priority-based scheduling',
    'Understand GPUVM: multi-level page tables, amdgpu_vm_bo_update, VM fault diagnosis',
    'Can take a single dmesg error line and decide which amdgpu subsystem to inspect first and which debugging tool to use next',
  ],
};
