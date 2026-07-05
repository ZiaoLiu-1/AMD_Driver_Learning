// ============================================================
// AMD Linux Driver Learning Platform - Module 0.5 Micro-Lessons (English)
// Module 0.5: AMD Ecosystem Overview
// 5 lessons in 2 groups, ~20 min each, total ~100 min
// ============================================================
import type { MicroLessonModule } from './micro_lesson_types';

export const module05MicroLessonsEn: MicroLessonModule = {
  moduleId: 'ecosystem',
  groups: [
    // ════════════════════════════════════════════════════════════
    // Group 0.5.1: AMD Products & Naming
    // ════════════════════════════════════════════════════════════
    {
      id: '05-1',
      number: '0.5.1',
      title: 'AMD Products & Naming',
      titleEn: 'AMD Products & Naming',
      icon: 'Building',
      description: 'Understand AMD\'s corporate structure, GPU product tiers, naming conventions, and how to map a model number to its chip codename and IP version in the kernel code.',
      lessons: [
        // ── Lesson 0.5.1.1 ────────────────────────────────────
        {
          id: '05-1-1',
          number: '0.5.1.1',
          title: 'AMD GPU Product Hierarchy: From Radeon RX to Instinct MI',
          titleEn: 'AMD GPU Product Hierarchy',
          duration: 20,
          difficulty: 'beginner',
          tags: ['AMD', 'Radeon', 'Instinct', 'product-line'],
          concept: {
            summary: 'AMD GPUs span three tiers: consumer Radeon RX (gaming), professional Radeon Pro (workstations), and data-center Instinct MI (AI/HPC). They all share the same amdgpu kernel driver, but differ in firmware and user-space configuration.',
            explanation: [
              'AMD\'s graphics and accelerator portfolio is commonly discussed in three product tiers. Understanding this tiering is useful for driver developers because the amdgpu stack must span consumer graphics, professional workstation use, and compute-focused accelerator deployments with different priorities.',
              'Consumer Radeon RX: the gaming-oriented Radeon product line used as the running example in this tutorial. Driver optimization focuses on graphics APIs such as OpenGL/Vulkan, display features, and media blocks such as VCN. In kernel code, RX series GPUs expose standard DRM device nodes such as /dev/dri/card* and /dev/dri/renderD*.',
              'Professional Radeon Pro: workstation-oriented GPUs for CAD, media, VFX, and visualization workloads. They often share architectural building blocks with consumer Radeon products, but differ in firmware, validation, certification, memory configuration, and product positioning. In the kernel they typically reuse the same major amdgpu framework rather than living in a separate driver.',
              'Data-center Instinct MI: AMD accelerator products for AI and HPC. AMD\'s Instinct MI300X specifications list 192 GB of HBM3 memory. These products emphasize compute and ROCm/HSA software paths; many accelerator configurations are displayless, so display-related paths are not the primary focus in the same way they are for Radeon graphics cards.',
              'What this means for driver developers: any line you change in the amdgpu codebase could affect all three product tiers. A GEM memory-allocation bug might cause game crashes on RX, CAD rendering errors on Pro, and AI training data corruption on Instinct. This is why amdgpu CI must test across multiple generations and multiple tiers of hardware.',
            ],
            keyPoints: [
              'Radeon RX (consumer): gaming and client graphics workloads, using the standard DRM graphics stack',
              'Radeon Pro (professional): workstation-oriented products with pro validation and workstation-focused configurations',
              'Instinct MI (data center): AI/HPC accelerator products, typically centered on ROCm and HBM-equipped compute deployments',
              'All three tiers share the same amdgpu kernel driver — differences are in firmware and user-space config',
              'Radeon Pro and Radeon RX often share substantial kernel infrastructure even when product configuration differs',
              'AMD lists Instinct MI300X with 192 GB HBM3 memory',
            ],
          },
          diagram: {
            title: 'AMD GPU Three-Tier Product Structure',
            content: `AMD GPU Product Tiers (2024-2025)

Performance/Price
    \u2191
    \u2502  \u250c\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510
    \u2502  \u2502  Instinct MI Series (Data Center)                       \u2502
    \u2502  \u2502                                                         \u2502
    \u2502  \u2502  MI300X  \u2502 192GB HBM3 \u2502 5.3TB/s  \u2502 Pure compute (no display) \u2502
    \u2502  \u2502  MI250X  \u2502 128GB HBM2e\u2502 3.2TB/s  \u2502 CDNA2 architecture       \u2502
    \u2502  \u2502  MI100   \u2502  32GB HBM2 \u2502 1.2TB/s  \u2502 CDNA1 architecture       \u2502
    \u2502  \u2502                                                         \u2502
    \u2502  \u2502  \u2192 ROCm / KFD interface                                 \u2502
    \u2502  \u2502  \u2192 Competitors: NVIDIA H100/A100, Intel Gaudi            \u2502
    \u2502  \u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518
    \u2502  \u250c\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510
    \u2502  \u2502  Radeon Pro Series (Professional Workstation)            \u2502
    \u2502  \u2502                                                         \u2502
    \u2502  \u2502  W7900  \u2502 Navi31 \u2502 48GB \u2502 Pro certified + ECC            \u2502
    \u2502  \u2502  W7800  \u2502 Navi31 \u2502 32GB \u2502 RDNA3 workstation GPU        \u2502
    \u2502  \u2502  W7600  \u2502 Navi33 \u2502 8GB  \u2502 Entry workstation option     \u2502
    \u2502  \u2502                                                         \u2502
    \u2502  \u2502  \u2192 OpenGL/Vulkan + pro app certification                \u2502
    \u2502  \u2502  \u2192 Competitors: NVIDIA RTX A series                     \u2502
    \u2502  \u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518
    \u2502  \u250c\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510
    \u2502  \u2502  Radeon RX Series (Consumer Gaming)                      \u2502
    \u2502  \u2502                                                         \u2502
    \u2502  \u2502  RX 9070 XT  \u2502 Navi48  \u2502 RDNA4 \u2502 Current gen │
    \u2502  \u2502  RX 7900 XTX \u2502 Navi31  \u2502 RDNA3 \u2502 Flagship    │
    \u2502  \u2502  RX 7800 XT  \u2502 Navi32  \u2502 RDNA3 \u2502 Higher tier  │
    \u2502  \u2502  RX 7600 XT  \u2502 Navi33  \u2502 RDNA3 \u2502 \u2190 Example   │
    \u2502  \u2502  RX 6800 XT  \u2502 Navi21  \u2502 RDNA2 \u2502 (prev gen)           \u2502
    \u2502  \u2502                                                         \u2502
    \u2502  \u2502  \u2192 Gaming / creative work / light compute                \u2502
    \u2502  \u2502  \u2192 Competitors: NVIDIA GeForce RTX series                \u2502
    \u2502  \u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518
    \u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2192 Time

Kernel driver perspective:
  All products \u2192 same amdgpu.ko \u2192 differentiated by Device ID
  RX/Pro   \u2192 loads DC (display) + GFX + SDMA + VCN
  Instinct \u2192 often uses compute-focused paths and displayless configs`,
            caption: 'AMD GPU three-tier product line. Consumer, workstation, and accelerator products are differentiated by PCI IDs, firmware, enabled IP blocks, and software stacks, while still sharing major parts of the amdgpu framework.',
          },
          codeWalk: {
            title: 'Differentiating Consumer and Data-Center GPUs in Kernel Code',
            file: 'drivers/gpu/drm/amd/amdgpu/amdgpu_device.c',
            language: 'c',
            code: `/* How amdgpu differentiates GPUs across product tiers */

/* 1. Identify GPU model via PCI Device ID */
/* amdgpu_drv.c \u2014 device ID table (excerpt) */
static const struct pci_device_id pciidlist[] = {
    /* Consumer RX 7600 XT (Navi33) */
    {0x1002, 0x7480, PCI_ANY_ID, PCI_ANY_ID, 0, 0, CHIP_NAVI33},

    /* Professional Pro W7600 (same Navi33 die!) */
    {0x1002, 0x7481, PCI_ANY_ID, PCI_ANY_ID, 0, 0, CHIP_NAVI33},

    /* Data center Instinct MI300X (different arch: CDNA3) */
    {0x1002, 0x740C, PCI_ANY_ID, PCI_ANY_ID, 0, 0, CHIP_AQUA_VANJARAM},
};

/* 2. Check for display output capability */
/* amdgpu_device.c \u2014 checked during initialization */
static int amdgpu_device_ip_early_init(struct amdgpu_device *adev)
{
    /* Instinct GPUs have no display engine */
    if (adev->flags & AMD_IS_APU) {
        /* APU: integrated CPU+GPU, has display */
    }

    /* Use IP discovery to check for DCN (Display) */
    if (!adev->ip_versions[DCE_HWIP][0]) {
        /* No DCN IP \u2192 pure compute card (Instinct) */
        /* Don't load DC module, don't create KMS interface on /dev/dri/card0 */
        adev->mode_info.num_crtc = 0;
    }
}

/* 3. KFD priority for different product tiers */
/* amdkfd/kfd_device.c */
/* Instinct GPUs get more compute queue resources from KFD
 * Consumer GPUs have limited KFD queue counts */`,
            annotations: [
              'RX 7600 XT (0x7480) and Pro W7600 (0x7481) have different Device IDs but the same CHIP type (CHIP_NAVI33)',
              'CHIP_AQUA_VANJARAM is MI300X\'s internal codename, using CDNA3 architecture (not RDNA3)',
              'AMD_IS_APU flag distinguishes APUs (integrated GPU) from discrete GPUs',
              'The IP discovery mechanism auto-detects which functional modules (IP Blocks) a GPU has \u2014 Instinct has no DCE_HWIP',
              'A single amdgpu.ko handles all product-tier differences through conditional logic',
              'KFD allocates more compute resources to Instinct GPUs \u2014 an optimization for pure-compute cards',
            ],
            explanation: 'This code shows how the amdgpu driver uses one codebase to support three completely different product tiers. Key insight: hardware differences are not hard-coded via if/else, but dynamically detected through the IP discovery mechanism \u2014 at boot time, the driver reads the GPU\'s internal IP description table and decides which modules to load based on which IP Blocks are present. This design makes it possible for a single driver to support dozens of different GPUs.',
          },
          miniLab: {
            title: 'Identify Your GPU\'s Product Tier',
            objective: 'Use system tools to confirm your GPU\'s product tier, chip codename, and supported functional modules.',
            steps: [
              'Check GPU model and Device ID: lspci -nn | grep -i "vga\\|3d\\|display"',
              'Determine consumer vs professional: if the output contains "Radeon RX" it\'s consumer; "Radeon Pro" is professional',
              'Check GPU-supported IP Blocks: cat /sys/class/drm/card0/device/ip_discovery/die/0/*/ip_discovery (if available)',
              'Verify display output: ls /sys/class/drm/card0-* (should list connectors like HDMI-A-1, DP-1)',
              'Check KFD availability: ls /dev/kfd (if present, ROCm compute interface is available)',
              'Cross-reference: search for your Device ID in amdgpu source: grep -n "0x7480" drivers/gpu/drm/amd/amdgpu/amdgpu_drv.c',
            ],
            expectedOutput: `$ lspci -nn | grep -i "vga"
03:00.0 VGA compatible controller [0300]: ... Navi33 [Radeon RX 7600/7600 XT] [1002:7480]
\u2192 Consumer RX series, Device ID 0x7480

$ ls /sys/class/drm/card0-*
/sys/class/drm/card0-DP-1
/sys/class/drm/card0-HDMI-A-1
\u2192 Has display output connectors (not an Instinct pure-compute card)

$ ls /dev/kfd
/dev/kfd
\u2192 KFD interface available, can run ROCm programs`,
            hint: 'If /dev/kfd doesn\'t exist, the KFD module may not be loaded. Try sudo modprobe amdkfd or check if HSA_AMD is enabled in kernel config. Note: /dev/kfd is created by the in-kernel amdgpu driver regardless of ROCm userspace support; gfx1102 / RX 7600 XT is NOT on AMD\'s official ROCm supported-GPU list, so running ROCm programs may require HSA_OVERRIDE_GFX_VERSION and is unofficial.',
          },
          debugExercise: {
            title: 'How GPU Type Affects Driver Behavior',
            language: 'c',
            description: 'The following code attempts to set a display mode on an Instinct MI300X GPU, but it will fail. Find out why.',
            question: 'Why would this code return an error on an Instinct GPU?',
            buggyCode: `/* Attempt to set 1920x1080 display mode on a GPU */
int setup_display(struct amdgpu_device *adev)
{
    struct drm_display_mode mode;

    mode.hdisplay = 1920;
    mode.vdisplay = 1080;
    mode.clock = 148500;  /* 148.5 MHz pixel clock */

    /* Call DC module to set display mode */
    return dc_commit_streams(adev->dm.dc, &mode);
    /* Returns -ENODEV on Instinct MI300X */
}`,
            hint: 'Instinct MI300X is a pure-compute card. Think about which IP Blocks it has and which it doesn\'t.',
            answer: 'Instinct MI300X is a pure-compute GPU with no display engine (DCN IP). During driver initialization, amdgpu detects via IP discovery that there is no DCE_HWIP, so the DC (Display Core) module is never loaded. adev->dm.dc is NULL, so calling dc_commit_streams returns -ENODEV (device not found). Instinct cards have no HDMI/DP ports \u2014 they physically cannot drive a display. This isn\'t a bug; it\'s by design \u2014 Instinct devotes all die area to compute units and HBM controllers rather than wasting it on display functionality. Correct approach: check adev->mode_info.num_crtc > 0 before calling any DC function.',
          },
          interviewQ: {
            question: 'What are the differences between AMD\'s three GPU product tiers (Radeon RX, Radeon Pro, Instinct MI)? How does the amdgpu driver handle their differences?',
            difficulty: 'easy',
            hint: 'Compare across three dimensions: hardware capabilities (display/compute), driver module loading (DC/KFD), and target user base.',
            answer: 'Three-tier differences: (1) Radeon RX (consumer): targets gamers/creative users, has full graphics and display capabilities. Driver loads GFX + DC + VCN + SDMA + KFD (if ROCm enabled); optimized for rendering performance and low latency. (2) Radeon Pro (professional): targets CAD/VFX professionals. Uses the same silicon as RX but with different firmware \u2014 certified for professional apps, ECC memory support, more conservative clocks. Driver code is completely shared; differences are at the firmware level. (3) Instinct MI (data center): targets AI/HPC. Pure-compute card with no display output, uses CDNA architecture (not RDNA). Driver does not load DC module; exposes HSA compute interface via KFD. Has HBM high-bandwidth memory and GPU-to-GPU direct links. How the driver handles differences: amdgpu uses the IP discovery mechanism \u2014 at boot, the driver reads the GPU\'s IP description table and dynamically decides which modules (DCN/GFX/SDMA/VCN/KFD) to load based on detected IP Blocks. This design enables a single .ko file to support all AMD GPUs.',
            amdContext: 'Understanding the product tiers is a foundational AMD interview question. Interviewers expect you to know the differences between RX, Pro, and Instinct, and how they share driver code.',
          },
        },

        // ── Lesson 0.5.1.2 ────────────────────────────────────
        {
          id: '05-1-2',
          number: '0.5.1.2',
          title: 'GPU Naming Decoded: From Model to Kernel Codename',
          titleEn: 'GPU Naming Decoded: From Model to Kernel Codename',
          duration: 20,
          difficulty: 'beginner',
          tags: ['naming', 'Navi', 'RDNA', 'gfx1102', 'device-id'],
          concept: {
            summary: 'Every AMD GPU has four naming layers: marketing name, chip codename, IP version, and PCI Device ID. Master the mapping between these four layers and you can instantly navigate from any layer to the other three in driver code. This section uses the RX 7600 XT (Navi33 / gfx1102 / 0x7480) as a running example; the method applies to all AMD GPUs.',
            explanation: [
              'When you see "gfx1102" in the amdgpu source, you need to immediately know it corresponds to the Navi33 chip on the RDNA3 architecture, marketed as the RX 7600 series. This rapid mapping ability is key to efficiently reading driver code. Let\'s break down AMD GPU\'s complete naming system.',
              'Layer 1: Marketing Name (RX 7600 XT). This is the product name users see on retail pages and driver control panels. Marketing names communicate product family and segment, but the exact numbering rules evolve between generations, so it is safer to use them as labels than as a strict decoding system.',
              'Layer 2: Chip Codename (Navi33). This is the engineering codename used throughout kernel enums and driver discussions. Within current RDNA-era naming, Navi31/Navi32/Navi33 refer to different dies in the same broad architecture family, and CHIP_NAVI33 is the kernel enum used for this example GPU.',
              'Layer 3: IP Version (gfx1102). This is the LLVM/ROCm-style GPU target name closest to the instruction-set level. In current tooling, gfx1102 corresponds to the RX 7600 XT example GPU, and flags such as -mcpu=gfx1102 or --offload-arch=gfx1102 select that target when compiling GPU code. In driver code, gfx_v11_0.c is the shared implementation file for the gfx11 family.',
              'Layer 4: PCI Device ID (0x7480). The unique identifier on the PCI bus. The kernel matches Vendor ID (0x1002) + Device ID (0x7480) to find the amdgpu driver. The same chip may have multiple Device IDs (different SKUs), but they all map to the same CHIP type. In amdgpu_drv.c\'s pciidlist, both 0x7480 and 0x7483 map to CHIP_NAVI33.',
            ],
            keyPoints: [
              'Marketing name RX 7600 XT \u2192 product-facing label used in retail and driver UX',
              'Chip codename Navi33 \u2192 engineering codename used in kernel enums and driver discussion',
              'IP version gfx1102 \u2192 LLVM/ROCm GPU target name used by compilers and tooling',
              'PCI Device ID 0x7480 \u2192 unique identifier for kernel driver matching',
              'Full mapping chain: RX 7600 XT \u2194 Navi33 \u2194 gfx1102 \u2194 0x7480 \u2194 CHIP_NAVI33',
              'In LLVM: -mcpu=gfx1102, in driver: gfx_v11_0.c, in PCI table: CHIP_NAVI33',
            ],
          },
          diagram: {
            title: 'AMD GPU Four-Layer Naming Map',
            content: `AMD GPU Four-Layer Naming (RDNA Series)

Marketing Name      Chip Codename  IP Version   Device ID    Kernel Enum
\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500  \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500  \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500  \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500  \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

RDNA4 (2025):
RX 9070 XT         Navi48       gfx1201     0x7550      CHIP_NAVI48

RDNA3 (2022):
RX 7900 XTX        Navi31       gfx1100     0x744C      CHIP_NAVI31
RX 7900 XT         Navi31       gfx1100     0x744C      CHIP_NAVI31
RX 7800 XT         Navi32       gfx1101     0x7470      CHIP_NAVI32
RX 7700 XT         Navi32       gfx1101     0x7470      CHIP_NAVI32
RX 7600 XT \u2190 You   Navi33       gfx1102     0x7480      CHIP_NAVI33
RX 7600            Navi33       gfx1102     0x7480      CHIP_NAVI33

RDNA2 (2020):
RX 6900 XT         Navi21       gfx1030     0x73BF      CHIP_NAVI21
RX 6800 XT         Navi21       gfx1030     0x73BF      CHIP_NAVI21
RX 6700 XT         Navi22       gfx1031     0x73DF      CHIP_NAVI22
RX 6600 XT         Navi23       gfx1032     0x73FF      CHIP_NAVI23

RDNA1 (2019):
RX 5700 XT         Navi10       gfx1010     0x731F      CHIP_NAVI10
RX 5600 XT         Navi10       gfx1010     0x7340      CHIP_NAVI10

Corresponding driver code:
  gfx1102 \u2192 gfx_v11_0.c (shared RDNA3 GFX implementation)
  gfx1030 \u2192 gfx_v10_3.c (RDNA2 GFX implementation)
  gfx1010 \u2192 gfx_v10_0.c (RDNA1 GFX implementation)`,
            caption: 'AMD GPU four-layer naming examples. Once you understand this mapping, you can instantly derive the other three layers from any AMD GPU model number (e.g., RX 7600 XT \u2194 Navi33 \u2194 gfx1102 \u2194 0x7480).',
          },
          codeWalk: {
            title: 'The Complete Mapping Chain: Device ID to IP Version',
            file: 'drivers/gpu/drm/amd/amdgpu/amdgpu_discovery.c',
            language: 'c',
            code: `/* How the driver derives the IP version from the PCI Device ID */

/* Step 1: PCI match \u2192 CHIP enum (amdgpu_drv.c) */
/* {0x1002, 0x7480, ..., CHIP_NAVI33} */

/* Step 2: CHIP enum \u2192 IP discovery (amdgpu_discovery.c) */
/* The GPU has an internal IP discovery table, baked into the hardware.
 * The driver reads this table at init time, getting all IP Block versions */
static int amdgpu_discovery_set_ip_blocks(struct amdgpu_device *adev)
{
    /* Read the GPU's internal IP discovery data */
    /* Returns something like:
     * GFX IP version: 11.0.2  \u2192 gfx1102 (your RX 7600 XT)
     * SDMA IP version: 6.0.2  \u2192 sdma_v6_0
     * DCN IP version: 3.2.1   \u2192 dcn32
     * VCN IP version: 4.0.2   \u2192 vcn_v4_0
     */

    switch (adev->ip_versions[GC_HWIP][0]) {
    case IP_VERSION(11, 0, 0):  /* gfx1100 = Navi31 */
    case IP_VERSION(11, 0, 2):  /* gfx1102 = Navi33 (yours!) */
        amdgpu_device_ip_block_add(adev, &gfx_v11_0_ip_block);
        amdgpu_device_ip_block_add(adev, &sdma_v6_0_ip_block);
        break;
    case IP_VERSION(10, 3, 0):  /* gfx1030 = Navi21 (RDNA2) */
        amdgpu_device_ip_block_add(adev, &gfx_v10_0_ip_block);
        break;
    }
}

/* Step 3: Use IP version to compile shaders (LLVM) */
/* hipcc --offload-arch=gfx1102 my_kernel.hip
 * LLVM selects the correct instruction set and register config based on gfx1102 */`,
            annotations: [
              'IP discovery is a hardware feature of AMD GPUs \u2014 the GPU stores a self-description table internally',
              'IP_VERSION(11, 0, 2) corresponds to gfx1102: 11=major, 0=minor, 2=revision',
              'Navi31 (gfx1100) and Navi33 (gfx1102) share gfx_v11_0_ip_block because they are the same architecture generation',
              'SDMA, DCN, VCN, and other IP Blocks each have their own version numbers, independent of the GFX IP version',
              'This dynamic discovery mechanism means the driver doesn\'t need to hard-code feature lists for each GPU',
            ],
            explanation: 'IP discovery is key to understanding the amdgpu driver architecture. The driver doesn\'t use if (chip == NAVI33) to determine behavior \u2014 instead, it reads the GPU\'s own IP description table. This way, even when AMD releases a new GPU, as long as the IP versions fall within the supported range (e.g., gfx11xx), existing driver code can support it directly \u2014 that\'s why sometimes new GPUs work with older kernels out of the box.',
          },
          miniLab: {
            title: 'Build Your GPU Naming Map Card',
            objective: 'Look up the four naming layers for your AMD GPU (using the RX 7600 XT as a reference example) and verify each mapping in the kernel source.',
            steps: [
              'Record marketing name: RX 7600 XT',
              'Find Device ID: lspci -nn | grep AMD (record the xxxx in [1002:xxxx])',
              'Find the mapping in kernel source: grep -n "0x7480" drivers/gpu/drm/amd/amdgpu/amdgpu_drv.c',
              'Confirm CHIP type: the matching line should contain CHIP_NAVI33',
              'Find IP version: dmesg | grep -i "gfx.*version\\|ip version" (should show 11.0.2 = gfx1102)',
              'Verify LLVM target name: llc --version 2>&1 | grep gfx1102 (if LLVM is installed)',
              'Record the full mapping in your study log: RX 7600 XT \u2194 Navi33 \u2194 gfx1102 \u2194 0x7480 \u2194 CHIP_NAVI33',
            ],
            expectedOutput: `Your GPU Naming Map Card:
\u250c\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u252c\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510
\u2502 Marketing   \u2502 RX 7600 XT                   \u2502
\u2502 Chip code   \u2502 Navi33                       \u2502
\u2502 IP version  \u2502 gfx1102 (GFX 11.0.2)        \u2502
\u2502 PCI ID      \u2502 1002:7480                    \u2502
\u2502 Kernel enum \u2502 CHIP_NAVI33                  \u2502
\u2502 GFX impl    \u2502 gfx_v11_0.c                  \u2502
\u2502 SDMA impl   \u2502 sdma_v6_0.c                  \u2502
\u2502 Display     \u2502 dcn32                        \u2502
\u2502 Architecture\u2502 RDNA3                        \u2502
\u2502 Process     \u2502 TSMC 6nm                     \u2502
\u2502 CU count    \u2502 32 CU                        \u2502
\u2502 VRAM        \u2502 16GB GDDR6                   \u2502
\u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2534\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518`,
            hint: 'If dmesg doesn\'t show IP version, try dmesg | grep -i "gfx\\|gc.*version" or cat /sys/class/drm/card0/device/gpu_metrics.',
          },
          debugExercise: {
            title: 'Identify an Incorrect LLVM Target Name',
            language: 'bash',
            description: 'You specified the wrong GPU target when compiling a HIP program. Analyze the error and find the correct target name.',
            question: 'Why would this compile command produce incorrect code on an RX 7600 XT (gfx1102)? (This applies generally when gfx targets don\'t match.)',
            buggyCode: `# Compile a HIP program, specifying GPU target
hipcc --offload-arch=gfx1100 my_kernel.hip -o my_kernel

# Runtime error:
# HSA Error: Incompatible device architecture
# Expected: gfx1102, Got: gfx1100`,
            hint: 'gfx1100 and gfx1102 are both RDNA3 (gfx11xx), but they are different chips. Think about the differences between Navi31 and Navi33.',
            answer: 'Error: specified gfx1100 (Navi31 = RX 7900 XTX) instead of gfx1102 (Navi33 = RX 7600 XT). Although gfx1100 and gfx1102 are both RDNA3, LLVM generates slightly different instructions for them (e.g., different available VGPR counts, CU configurations, cache sizes). The HSA Runtime checks the target architecture in the ELF header when loading GPU programs \u2014 if it doesn\'t match the current GPU, loading is rejected. Correct command: hipcc --offload-arch=gfx1102 my_kernel.hip -o my_kernel. You can use rocminfo | grep gfx to find your GPU\'s exact target name. To support multiple GPUs simultaneously: hipcc --offload-arch=gfx1100 --offload-arch=gfx1102 (generates a fat binary).',
          },
          interviewQ: {
            question: 'Explain AMD GPU\'s naming system. Given an IP version gfx1032, what information can you deduce?',
            difficulty: 'medium',
            hint: 'Derive the architecture generation, die size, and corresponding market product from the three parts of the IP version number (major.minor.revision).',
            answer: 'Parsing gfx1032: (1) Major version 10 = RDNA series (gfx9=GCN5/Vega, gfx10=RDNA1/2, gfx11=RDNA3). Specifically, gfx103x = RDNA2 (gfx101x=RDNA1, gfx110x=RDNA3). (2) Minor version 3 = third-generation revision of RDNA2. (3) Revision 2 = the third chip variant in this generation. Checking the mapping table: gfx1030=Navi21 (large die, RX 6900/6800 XT), gfx1031=Navi22 (RX 6700 XT), gfx1032=Navi23 (RX 6600 XT). So gfx1032 = Navi23 = RX 6600 XT = RDNA2 mid-range chip. In driver code: CHIP_NAVI23, GFX implementation file is gfx_v10_3.c. In LLVM: -mcpu=gfx1032. This deduction skill is extremely useful when reading amdgpu source \u2014 you can immediately identify which GPU and architecture any IP version number corresponds to.',
            amdContext: 'In AMD interviews, you\'ll often be given an IP version number or chip codename and tested on whether you can quickly reverse-engineer the full product information. This demonstrates your familiarity with the AMD product line.',
          },
        },
      ],
    },

    // ════════════════════════════════════════════════════════════
    // Group 0.5.2: Architecture Evolution & Driver Stack
    // ════════════════════════════════════════════════════════════
    {
      id: '05-2',
      number: '0.5.2',
      title: 'Architecture Evolution & Driver Stack',
      titleEn: 'Architecture Evolution & Driver Stack',
      icon: '\u2699\ufe0f',
      description: 'The history of AMD GPU architecture from GCN to RDNA, and the responsibilities and code locations of each layer in the AMD Linux driver stack.',
      lessons: [
        // ── Lesson 0.5.2.1 ────────────────────────────────────
        {
          id: '05-2-1',
          number: '0.5.2.1',
          title: 'GCN to RDNA: AMD GPU Architecture History',
          titleEn: 'GCN to RDNA: AMD GPU Architecture History',
          duration: 20,
          difficulty: 'beginner',
          tags: ['GCN', 'RDNA', 'architecture', 'history'],
          concept: {
            summary: 'AMD GPU architecture underwent a major transition from GCN (2012\u20132019) to RDNA (2019\u2013present). GCN focused on compute throughput; RDNA redesigned the shader engine for better gaming performance. Understanding this history helps explain the large amount of legacy code in the amdgpu codebase.',
            explanation: [
              'GCN (Graphics Core Next, 2012\u20132019) was AMD\'s first unified shader architecture, laying the foundation for modern AMD GPUs. GCN\'s design philosophy was "compute first" \u2014 its Compute Unit (CU) structure was excellent for GPGPU computing (this is why AMD is competitive in HPC), but less efficient for pure gaming rendering compared to NVIDIA\'s same-generation architectures. GCN spanned 5 generations from 1.0 to 5.0 (Vega), corresponding to gfx6 through gfx9 in the amdgpu driver.',
              'Key GCN design features: (1) 64-wide Wavefront \u2014 each Wavefront contains 64 threads, executing on 4 SIMD16 units over 4 cycles. This design is highly efficient for compute-intensive tasks but wastes resources in graphics rendering (which typically involves many small triangles and branches). (2) Unified CU structure \u2014 each CU has 4 SIMD16 units, 1 scalar unit, and 64 KB LDS. (3) Fixed L1/L2 cache hierarchy. In driver code, GCN implementations are in gfx_v6_0.c (GCN1) through gfx_v9_0.c (Vega).',
              'RDNA (Radeon DNA, 2019\u2013present) was a ground-up architectural revolution. Core changes: (1) Introduced Workgroup Processor (WGP) structure \u2014 two CUs form a WGP, sharing instruction cache and LDS bandwidth, reducing hardware redundancy. (2) Wave32 mode support \u2014 Wavefronts can be 32 or 64 threads; 32-thread mode is more efficient for graphics rendering (less branch waste). (3) Completely redesigned cache hierarchy \u2014 added L0 cache (16 KB per CU), L1 cache expanded from 16 KB to 128 KB, plus Infinity Cache (large L3 cache in RDNA2/3).',
              'Three RDNA generations: RDNA1 (2019, gfx10, RX 5700 XT) introduced WGP and Wave32; RDNA2 (2020, gfx103x, RX 6800 XT) added hardware ray tracing and Infinity Cache; RDNA3 (2022, gfx110x) added WMMA (Wave Matrix Multiply Accumulate) and other capabilities. The RDNA3 family includes both chiplet designs (Navi31/32) and monolithic dies (like your RX 7600 XT / Navi33).',
              'Impact on driver code: amdgpu must simultaneously support all GCN and RDNA architectures, resulting in extensive conditional compilation and IP version checks. gfx_v11_0.c (your GPU) and gfx_v9_0.c (Vega) have similar code structures but completely different register addresses, command formats, and interrupt handling. Understanding this history helps you know what "if (adev->ip_versions[GC_HWIP][0] >= IP_VERSION(10, 0, 0))" is doing \u2014 it\'s distinguishing GCN from RDNA.',
            ],
            keyPoints: [
              'GCN (2012\u20132019): gfx6\u2013gfx9, 64-wide Wavefront, compute-first design',
              'RDNA1 (2019): gfx10, introduced WGP and Wave32, major perf-per-watt improvement',
              'RDNA2 (2020): gfx103x, hardware ray tracing + Infinity Cache',
              'RDNA3 (2022): gfx110x, WMMA AI instructions (some models chiplet, Navi33 is monolithic)',
              'RDNA4 (2025): gfx120x, enhanced ray tracing + AI perf, RX 9070 XT',
              'GCN code still exists in amdgpu (legacy support) \u2014 understanding history helps understand code structure',
            ],
          },
          diagram: {
            title: 'AMD GPU Architecture Evolution Timeline',
            content: `AMD GPU Architecture Evolution (2012\u20132025)

2012 \u2500\u2500\u2500 GCN 1.0 (Southern Islands) \u2500\u2500\u2500 gfx6 \u2500\u2500 HD 7970
         \u2502 First unified shader arch, 64-wide Wavefront
         \u2502
2013 \u2500\u2500\u2500 GCN 2.0 (Sea Islands) \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 gfx7 \u2500\u2500 R9 290X
         \u2502 Improved compute, added ACE (Async Compute Engine)
         \u2502
2015 \u2500\u2500\u2500 GCN 3.0 (Volcanic Islands) \u2500\u2500\u2500 gfx8 \u2500\u2500 R9 Fury X
         \u2502 First HBM memory, improved geometry pipeline
         \u2502
2017 \u2500\u2500\u2500 GCN 5.0 (Vega) \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 gfx9 \u2500\u2500 Vega 64
         \u2502 HBM2, improved HBCC (High-BW Cache Controller)
         \u2502                                          \u2502
  \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u256a\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550 Architecture Revolution \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u256a\u2550\u2550\u2550
         \u2502                                          \u2502
2019 \u2500\u2500\u2500 RDNA 1.0 (Navi) \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 gfx10 \u2500\u2500 RX 5700 XT
         \u2502 WGP structure, Wave32 mode
         \u2502 50% perf-per-watt improvement over GCN5
         \u2502
2020 \u2500\u2500\u2500 RDNA 2.0 \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 gfx103x \u2500\u2500 RX 6800 XT
         \u2502 Hardware ray tracing (RA), Infinity Cache (128MB)
         \u2502 Also used in PS5 and Xbox Series X
         \u2502
2022 \u2500\u2500\u2500 RDNA 3.0 \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 gfx110x \u2500\u2500 RX 7600 XT \u2190 You
         \u2502 Navi31/32: Chiplet; Navi33: Monolithic die
         \u2502 WMMA AI acceleration instructions, AV1 hardware encode
         \u2502
2025 \u2500\u2500\u2500 RDNA 4.0 \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 gfx120x \u2500\u2500 RX 9070 XT
           Enhanced ray tracing, major AI performance uplift

Corresponding driver code:
  gfx6  \u2192 si_*.c (not in amdgpu; in the old radeon driver)
  gfx7  \u2192 cik_*.c
  gfx8  \u2192 vi_*.c
  gfx9  \u2192 gfx_v9_0.c, sdma_v4_0.c
  gfx10 \u2192 gfx_v10_0.c, sdma_v5_0.c
  gfx11 \u2192 gfx_v11_0.c, sdma_v6_0.c \u2190 Your GPU
  gfx12 \u2192 gfx_v12_0.c (latest)`,
            caption: 'AMD GPU evolution from GCN to RDNA. RDNA1 in 2019 was an architectural revolution, improving perf-per-watt by 50%. The RX 7600 XT (gfx1102 / Navi33) is marked as the example GPU; other AMD GPUs can locate themselves in this chart.',
          },
          codeWalk: {
            title: 'Architecture Differentiation in Driver Code',
            file: 'drivers/gpu/drm/amd/amdgpu/amdgpu_gfx.c',
            language: 'c',
            code: `/* How the driver selects different behavior based on architecture version */

/* 1. Select wave size based on IP version */
static unsigned int amdgpu_gfx_get_wave_size(struct amdgpu_device *adev)
{
    /* RDNA (gfx10+) supports both Wave32 and Wave64 */
    if (adev->ip_versions[GC_HWIP][0] >= IP_VERSION(10, 0, 0))
        return 32;  /* RDNA defaults to Wave32 (more efficient) */

    /* GCN (gfx6-gfx9) only supports Wave64 */
    return 64;  /* GCN uses fixed 64-wide Wavefront */
}

/* 2. RDNA3-specific WMMA (Wave Matrix Multiply) check */
bool amdgpu_gfx_has_wmma(struct amdgpu_device *adev)
{
    /* Only gfx11+ (RDNA3) supports WMMA AI acceleration instructions */
    return adev->ip_versions[GC_HWIP][0] >= IP_VERSION(11, 0, 0);
}

/* 3. Select register offsets based on architecture */
/* The same logical function (e.g., GRBM_STATUS) may have
 * different register addresses on different architectures:
 *   GCN:  mmGRBM_STATUS = 0x8010
 *   RDNA: mmGRBM_STATUS = 0xD040
 * Each gfx_vXX_0.c file defines its own register map */

/* 4. Implementation differences within the RDNA3 family */
/* RDNA3 has both chiplet implementations (Navi31/32)
 * and monolithic implementations (Navi33).
 * The driver handles per-IP/ASIC register and perf differences. */`,
            annotations: [
              'IP_VERSION(10, 0, 0) is the start of RDNA1 \u2014 this check distinguishes the GCN and RDNA generations',
              'Wave32 is RDNA\'s key innovation \u2014 reducing branch waste by 50% in graphics rendering',
              'WMMA instructions are RDNA3-exclusive \u2014 used for matrix multiplication acceleration in AI inference',
              'Register addresses are incompatible across architectures \u2014 each generation has its own register definition headers',
              'RDNA3 has different physical implementations across chips \u2014 Navi31/32 are chiplet, Navi33 is monolithic',
            ],
            explanation: 'This code shows how the amdgpu driver handles GPUs spanning 13 years and multiple architecture generations in a single codebase. IP version checks (the IP_VERSION macro) are the most common way to differentiate architecture behavior. When you see this type of check in the code, you can use the version number to determine which architecture generation the code targets.',
          },
          miniLab: {
            title: 'Compare Architecture Features Across Generations',
            objective: 'Examine your RDNA3 GPU\'s architecture features and understand how they differ from previous generations.',
            steps: [
              'View GPU architecture info: cat /sys/class/drm/card0/device/gpu_metrics (if available)',
              'Check CU count: dmesg | grep -i "compute unit\\|shader engine\\|cu per"',
              'Check cache info: dmesg | grep -i "cache\\|L1\\|L2"',
              'Check wave size support: dmesg | grep -i "wave"',
              'Check IP version list: dmesg | grep -i "ip block" (lists all loaded IP Blocks and versions)',
              'Record your GPU\'s architecture features in your study log: CU count, wave size, cache hierarchy',
            ],
            expectedOutput: `RDNA3 (RX 7600 XT) Architecture Features:
- 32 Compute Units (16 WGP)
- Wave32/Wave64 dual mode
- L0 Cache: 16KB per CU
- L1 Cache: 128KB per Shader Array
- L2 Cache: ~2MB
- Infinity Cache (last-level): 32MB
- VRAM: 16GB GDDR6 @ 288 GB/s
- Supports WMMA AI instructions
- Navi33 (RX 7600 XT) is a monolithic die (not chiplet)`,
            hint: 'If dmesg info isn\'t detailed enough, install rocminfo (ROCm tool): rocminfo outputs very detailed GPU architecture information.',
          },
          debugExercise: {
            title: 'Identify an Architecture-Related Code Error',
            language: 'c',
            description: 'The following code tries to use WMMA instructions on all AMD GPUs, but only RDNA3+ supports them.',
            question: 'What would happen on an RDNA2 GPU (RX 6800 XT)?',
            buggyCode: `/* Use WMMA instructions for matrix multiplication acceleration */
void setup_wmma_compute(struct amdgpu_device *adev)
{
    /* No check for GPU WMMA support! */
    WREG32(mmWMMA_CONFIG, WMMA_ENABLE);
    /* On RDNA2 GPU: mmWMMA_CONFIG register doesn't exist! */
}`,
            hint: 'WMMA is only available on RDNA3 (gfx11+). What happens when you access a non-existent register on an older architecture?',
            answer: 'On an RDNA2 GPU (gfx1030), the WMMA register doesn\'t exist. Writing to a non-existent MMIO address can result in: (1) The write is silently ignored by the PCIe bus (no-op), but subsequent code depending on WMMA will produce wrong results; (2) Triggers an illegal register access interrupt on the GPU, causing a GPU hang. Correct approach: check the architecture version before using WMMA: if (adev->ip_versions[GC_HWIP][0] >= IP_VERSION(11, 0, 0)) { WREG32(mmWMMA_CONFIG, WMMA_ENABLE); }. Even better: use a helper function like amdgpu_gfx_has_wmma(adev) to avoid repeating version checks at every call site. This "check capability before using feature" pattern is ubiquitous in driver code.',
          },
          interviewQ: {
            question: 'Explain the architectural transition from GCN to RDNA in AMD GPUs, and how it impacts the amdgpu driver code.',
            difficulty: 'medium',
            hint: 'Address the changes in wave size, CU/WGP structure, cache hierarchy, and the challenge of managing multiple architecture generations in the driver codebase.',
            answer: 'Core architectural changes: (1) Execution model: GCN used fixed 64-wide Wavefronts \u2192 RDNA supports dual Wave32/64 mode. Wave32 is more efficient for graphics rendering (less branch waste), while Wave64 maintains compute throughput. The driver must select the mode based on workload. (2) CU structure: GCN CUs were independent units \u2192 RDNA WGPs (two CUs sharing resources) improve hardware utilization. Driver scheduling logic must adapt to the WGP structure. (3) Cache hierarchy: GCN had simple L1/L2 \u2192 RDNA added L0, expanded L1, introduced Infinity Cache. Driver memory management strategies must account for different cache behaviors. Impact on driver code: amdgpu uses an IP Block architecture to manage multiple GPU generations \u2014 each generation has its own gfx_vXX_0.c implementation file while sharing a common framework (amdgpu_gfx.c). IP version checks (IP_VERSION macro) are the primary mechanism for differentiating architecture behavior. Challenge: GCN and RDNA have completely different register addresses, command formats, and interrupt handling \u2014 the driver must maintain hundreds of such difference points.',
            amdContext: 'This is one of AMD\'s core technical interview questions. Demonstrating that you understand not just the architecture names but the specific technical differences and their driver implications is key.',
          },
        },

        // ── Lesson 0.5.2.2 ────────────────────────────────────
        {
          id: '05-2-2',
          number: '0.5.2.2',
          title: 'AMD Linux Driver Stack Layer by Layer',
          titleEn: 'AMD Linux Driver Stack Layer by Layer',
          duration: 20,
          difficulty: 'beginner',
          tags: ['driver-stack', 'Mesa', 'libdrm', 'DRM', 'amdgpu', 'ROCm'],
          concept: {
            summary: 'The AMD Linux driver stack has 6 layers from top to bottom: Application API \u2192 Mesa/ROCm \u2192 libdrm \u2192 DRM Core \u2192 amdgpu \u2192 GPU hardware. Each layer is an independent code repository with different development teams, licenses, and release cadences.',
            explanation: [
              'Understanding each layer of the AMD driver stack is fundamental to driver development. When you encounter a GPU issue, the first step is determining which layer the problem is in \u2014 this determines which code repository to examine and which development team to contact. Let\'s analyze layer by layer from top to bottom.',
              'Layer 1: Graphics/Compute API. Graphics applications use OpenGL (legacy) or Vulkan (modern) APIs; AI/HPC applications use the HIP API. These are standardized interfaces that don\'t interact directly with AMD hardware. Developers don\'t need to worry about whether the underlying GPU is AMD or NVIDIA \u2014 the API guarantees portability.',
              'Layer 2: Mesa 3D / ROCm Runtime. Mesa (https://mesa3d.org/) is the open-source OpenGL/Vulkan implementation. AMD\'s Mesa drivers include radeonsi (OpenGL) and radv (Vulkan). Mesa\'s job is to compile shaders (GLSL/SPIR-V \u2192 AMD ISA), build GPU command buffers (PM4 format), and manage user-space buffer allocation. ROCm\'s HIP Runtime does similar work but for compute \u2014 it communicates with KFD via the HSA Runtime. Both Mesa and ROCm run in user space.',
              'Layer 3: libdrm. This is a user-space C library (https://gitlab.freedesktop.org/mesa/drm) that wraps DRM ioctl calls. libdrm\'s amdgpu sub-library (libdrm_amdgpu) provides APIs like amdgpu_bo_alloc (allocate GPU memory) and amdgpu_cs_submit (submit commands). Both Mesa and ROCm depend on libdrm.',
              'Layer 4: DRM Kernel Framework. Located in Linux kernel\'s drivers/gpu/drm/drm_*.c. DRM provides a generic GPU management framework: device files (/dev/dri/card0), ioctl interface, KMS (display mode setting), GEM/TTM (memory management). DRM is shared code used by all Linux GPU drivers \u2014 AMD, Intel, and NVIDIA all use the same DRM framework.',
              'Layer 5: amdgpu Kernel Driver. Located in drivers/gpu/drm/amd/, this is a very large AMD GPU-specific implementation containing GFX (graphics engine control), SDMA (DMA transfers), DC (Display Core), VCN (video codec), KFD (ROCm compute interface), PM/SMU (power management), and related support code. amdgpu is the core subject of your study.',
            ],
            keyPoints: [
              'OpenGL/Vulkan/HIP API \u2192 application-layer standard interface, cross-platform',
              'Mesa radeonsi/radv \u2192 user-space driver, compiles shaders and builds command packets',
              'libdrm (libdrm_amdgpu) \u2192 wraps ioctl calls, provides C API',
              'DRM Core \u2192 generic kernel GPU framework shared by all GPU drivers',
              'amdgpu \u2192 AMD-specific kernel driver, IP Block architecture, large multi-subsystem codebase',
              'Each layer has its own code repository, team, and release cycle',
            ],
          },
          diagram: {
            title: 'Complete AMD Linux Driver Stack Layers',
            content: `AMD Linux Driver Stack: Repositories \u00d7 Development Teams

Layer 6: Applications (Games / AI / Video)
   Code: Application developers
   \u2193 OpenGL / Vulkan / HIP / VA-API

Layer 5: User-Space Drivers
   \u250c\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u252c\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510
   \u2502     Mesa 3D            \u2502     ROCm            \u2502
   \u2502  radeonsi (GL)         \u2502  HIP Runtime        \u2502
   \u2502  radv (Vulkan)         \u2502  HSA Runtime        \u2502
   \u2502                        \u2502                     \u2502
   \u2502  Repo: mesa/mesa       \u2502  Repo: ROCm/*       \u2502
   \u2502  License: MIT          \u2502  License: MIT       \u2502
   \u2502  Team: AMD + community \u2502  Team: AMD Compute  \u2502
   \u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u252c\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2534\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u252c\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518
              \u2193 libdrm API                     \u2193 KFD ioctl

Layer 4: libdrm
   \u250c\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510
   \u2502  libdrm_amdgpu                                \u2502
   \u2502  amdgpu_bo_alloc / amdgpu_cs_submit / ...     \u2502
   \u2502                                               \u2502
   \u2502  Repo: mesa/drm                               \u2502
   \u2502  License: MIT                                 \u2502
   \u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u252c\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518
                      \u2193 ioctl() system call

Layer 3: DRM Core (kernel space)
   \u250c\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510
   \u2502  drm_ioctl.c / drm_gem.c / drm_atomic.c    \u2502
   \u2502  Generic GPU management framework            \u2502
   \u2502                                              \u2502
   \u2502  Repo: torvalds/linux (drivers/gpu/drm/)     \u2502
   \u2502  License: GPL-2.0                             \u2502
   \u2502  Team: DRM maintainers (Daniel Vetter et al) \u2502
   \u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u252c\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518
                      \u2193

Layer 2: amdgpu Driver (kernel space)
   \u250c\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510
   \u2502  drivers/gpu/drm/amd/                       \u2502
   \u2502  \u250c\u2500\u2500\u2500\u2500\u2500\u2510 \u250c\u2500\u2500\u2500\u2500\u2500\u2500\u2510 \u250c\u2500\u2500\u2500\u2500\u2510 \u250c\u2500\u2500\u2500\u2500\u2500\u2510 \u250c\u2500\u2500\u2500\u2500\u2500\u2510 \u2502
   \u2502  \u2502 GFX \u2502 \u2502 SDMA \u2502 \u2502 DC \u2502 \u2502 VCN \u2502 \u2502 KFD \u2502 \u2502
   \u2502  \u2514\u2500\u2500\u2500\u2500\u2500\u2518 \u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2518 \u2514\u2500\u2500\u2500\u2500\u2518 \u2514\u2500\u2500\u2500\u2500\u2500\u2518 \u2514\u2500\u2500\u2500\u2500\u2500\u2518 \u2502
   \u2502                                              \u2502
   \u2502  Repo: torvalds/linux + agd5f/linux          \u2502
   \u2502  License: GPL-2.0                             \u2502
   \u2502  Team: AMD Markham + Shanghai                 \u2502
   \u2502  Maintainer: Alex Deucher (agd5f)             \u2502
   \u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u252c\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518
                      \u2193 MMIO / DMA / Interrupt

Layer 1: GPU Hardware (RX 7600 XT / Navi33 / gfx1102)`,
            caption: 'Complete AMD Linux driver stack with each layer\'s code repository, license, and development team. When you submit an amdgpu patch, the path is: You \u2192 amd-gfx mailing list \u2192 Alex Deucher review \u2192 drm-next branch \u2192 Linus Torvalds\' Linux mainline.',
          },
          codeWalk: {
            title: 'Tracing a GPU Memory Allocation Through Every Layer',
            file: 'Multi-layer code trace',
            language: 'c',
            code: `/* Trace a BO (Buffer Object) allocation request through the driver stack */

/* Layer 5: Mesa (user space) */
/* mesa/src/gallium/winsys/amdgpu/drm/amdgpu_bo.c */
struct pb_buffer *amdgpu_bo_create(...)
{
    /* Mesa needs GPU memory to store vertex data */
    amdgpu_bo_alloc(ws->dev, &request, &buf_handle);
    /* \u2193 calls libdrm */
}

/* Layer 4: libdrm (user space) */
/* libdrm/amdgpu/amdgpu_bo.c */
int amdgpu_bo_alloc(amdgpu_device_handle dev,
                     struct amdgpu_bo_alloc_request *alloc,
                     amdgpu_bo_handle *buf_handle)
{
    struct drm_amdgpu_gem_create args = {0};
    args.in.bo_size = alloc->alloc_size;
    args.in.domains = alloc->preferred_heap;

    /* Call ioctl \u2014 crosses user/kernel boundary */
    r = drmIoctl(dev->fd, DRM_IOCTL_AMDGPU_GEM_CREATE, &args);
    /* \u2193 system call enters kernel */
}

/* Layer 3: DRM Core (kernel space) */
/* drivers/gpu/drm/drm_ioctl.c */
/* drm_ioctl() \u2192 looks up DRM_IOCTL_AMDGPU_GEM_CREATE
 * \u2192 calls amdgpu_gem_create_ioctl() */

/* Layer 2: amdgpu (kernel space) */
/* drivers/gpu/drm/amd/amdgpu/amdgpu_gem.c */
int amdgpu_gem_create_ioctl(struct drm_device *dev, void *data,
                             struct drm_file *filp)
{
    /* Eventually calls TTM to allocate VRAM or GTT memory */
    r = amdgpu_gem_object_create(adev, size, alignment,
                                  domain, flags, type, resv, &gobj);
    /* Layer 1: Hardware \u2192 TTM updates GPU page table, memory is usable */
}`,
            annotations: [
              'Mesa\'s amdgpu_bo_create is the user-space entry point \u2014 called when a game needs GPU memory',
              'libdrm\'s amdgpu_bo_alloc wraps the ioctl call details',
              'drmIoctl is libdrm\'s system call wrapper \u2014 the user/kernel boundary crossing point',
              'drm_ioctl.c\'s dispatch table routes AMDGPU_GEM_CREATE to amdgpu\'s handler function',
              'amdgpu_gem_object_create is the actual memory allocation \u2014 using TTM to manage VRAM/GTT',
              'Full path: Mesa \u2192 libdrm \u2192 ioctl \u2192 DRM \u2192 amdgpu \u2192 TTM \u2192 GPU page table',
            ],
            explanation: 'This example shows how a simple GPU memory allocation traverses all 5 layers of the driver stack. From user-space Mesa to the kernel\'s amdgpu, passing through libdrm\'s ioctl wrapper and DRM\'s dispatch mechanism. When you debug GPU memory problems, you need to determine which layer the issue is in \u2014 whether Mesa\'s request parameters are wrong, libdrm\'s ioctl wrapper has a bug, or amdgpu\'s memory management has a problem.',
          },
          miniLab: {
            title: 'Check Driver Stack Version Information for Each Layer',
            objective: 'View the version of every layer of the AMD driver stack on your system and build a complete version profile.',
            steps: [
              'Mesa version: glxinfo | grep "OpenGL version"',
              'Vulkan driver version: vulkaninfo | grep "driverInfo" | head -1 (if vulkan-tools is installed)',
              'libdrm version: pkg-config --modversion libdrm_amdgpu',
              'Kernel DRM version: cat /sys/module/drm/version',
              'amdgpu driver version: modinfo amdgpu | grep "^version"',
              'Kernel version: uname -r',
            ],
            expectedOutput: `Your driver stack version profile (example, actual will match your system):
\u250c\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u252c\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510
\u2502 Mesa         \u2502 <your-mesa-version>           \u2502
\u2502 Vulkan (radv)\u2502 <your-radv-driver-info>       \u2502
\u2502 libdrm       \u2502 <your-libdrm-version>         \u2502
\u2502 DRM Core     \u2502 <your-drm-core-version>       \u2502
\u2502 amdgpu       \u2502 (follows kernel version)       \u2502
\u2502 Kernel       \u2502 <your-kernel-version>          \u2502
\u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2534\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518`,
            hint: 'If vulkaninfo is not available, install vulkan-tools (sudo apt install vulkan-tools). If glxinfo is not available, install mesa-utils.',
          },
          debugExercise: {
            title: 'Determine Which Driver Stack Layer an Error Comes From',
            language: 'text',
            description: 'The following 3 error messages come from different layers of the driver stack. Match each error to the correct layer.',
            question: 'Match each error to its source layer: Mesa / libdrm / DRM Core / amdgpu',
            buggyCode: `Error 1:
"radv: Failed to create pipeline cache"

Error 2:
"[drm:amdgpu_cs_ioctl [amdgpu]] *ERROR* Failed to initialize parser"

Error 3:
"amdgpu_bo_alloc: Cannot allocate memory"`,
            hint: 'Look at each error message\'s prefix \u2014 radv is Mesa\'s Vulkan driver, [drm:amdgpu_cs_ioctl] is the kernel amdgpu log format, amdgpu_bo_alloc is a libdrm function.',
            answer: 'Error 1 \u2192 Mesa (radv is AMD\'s Vulkan driver in Mesa; pipeline cache creation failure is typically a user-space issue \u2014 insufficient disk space or shader cache directory permissions). Error 2 \u2192 amdgpu kernel driver ([drm:amdgpu_cs_ioctl [amdgpu]] format indicates kernel printk output; amdgpu_cs_ioctl is the kernel\'s command submission handler; parser initialization failure usually means malformed command buffer). Error 3 \u2192 libdrm (amdgpu_bo_alloc is a libdrm function name; "Cannot allocate memory" is the user-space error message for an ioctl returning -ENOMEM; caused by GPU VRAM or GTT memory being full). Quick layer identification tips: kernel-layer errors have [drm] or [drm:func] prefixes; Mesa-layer errors have radeonsi/radv prefixes; libdrm-layer errors have amdgpu_ function-name prefixes.',
          },
          interviewQ: {
            question: 'Describe each layer of the AMD Linux driver stack. When a GPU rendering bug appears, how do you determine which layer the problem is in?',
            difficulty: 'medium',
            hint: 'Start from each layer\'s responsibilities, then describe a layered debugging strategy: first use dmesg to rule out kernel layer, then use apitrace to rule out Mesa layer.',
            answer: 'Driver stack layers: (1) Application layer: OpenGL/Vulkan API calls. (2) Mesa (radeonsi/radv): shader compilation, command packet construction. (3) libdrm (libdrm_amdgpu): ioctl wrapper. (4) DRM Core: ioctl dispatch, GEM management. (5) amdgpu: GPU-specific operations, hardware control. (6) GPU hardware. Layered debugging strategy: (1) First check dmesg \u2014 "[drm] *ERROR*" indicates a kernel-layer problem (amdgpu/DRM). (2) Use apitrace to record GL/VK calls \u2014 if replay reproduces the issue, the problem is in Mesa or below; if not, it\'s in the application. (3) Run valgrind to check Mesa user-space memory errors. (4) Use RADV_DEBUG=info or AMD_DEBUG=info for detailed Mesa logs. (5) Use ftrace to trace kernel function call chains, confirming amdgpu ioctl return values. (6) Finally, use umr to read GPU register state to confirm hardware behavior. This top-down elimination approach is the most efficient debugging strategy.',
            amdContext: 'AMD interviews frequently use "how would you debug a rendering bug" as a question to test your understanding of the full stack and your systematic debugging approach.',
          },
        },

        // ── Lesson 0.5.2.3 ────────────────────────────────────
        {
          id: '05-2-3',
          number: '0.5.2.3',
          title: 'AMD Open Source Community & Competitive Landscape',
          titleEn: 'AMD Open Source Community & Competitive Landscape',
          duration: 15,
          difficulty: 'beginner',
          tags: ['open-source', 'community', 'amd-gfx', 'NVIDIA', 'Intel'],
          concept: {
            summary: 'The amd-gfx mailing list is the central collaboration platform for driver development, with 30\u201350 patches daily. Understanding the community workflow and competitive landscape is important background knowledge for career development.',
            explanation: [
              'AMD\'s GPU driver development revolves around the amd-gfx@lists.freedesktop.org mailing list. This list is public \u2014 anyone can subscribe and submit patches. There are 30\u201350 patch submissions daily, covering bug fixes, new hardware support, performance optimizations, code cleanups, and more. Alex Deucher (agd5f) is amdgpu\'s lead maintainer, and nearly every patch passes through his review.',
              'AMD\'s driver development workflow: a developer (AMD internal or external community member) sends a patch on the amd-gfx list \u2192 Alex Deucher and other maintainers review it \u2192 approved patches enter AMD\'s drm-next branch (agd5f/linux on gitlab.freedesktop.org) \u2192 drm-next periodically merges into Dave Airlie\'s drm-next \u2192 ultimately merges into Linus\' Linux mainline. From patch submission to mainline merge typically takes 1\u20133 kernel release cycles (3\u20139 months).',
              'AMD vs NVIDIA open-source strategy comparison: AMD\'s fully open-source approach lets the community freely contribute \u2014 hundreds of non-AMD employees have submitted patches to amdgpu. NVIDIA open-sourced the nvidia-open kernel module in 2022, but core firmware and user-space drivers remain closed-source. This means community influence on NVIDIA\'s core driver is extremely limited \u2014 you can\'t submit patches to NVIDIA\'s core driver. Intel\'s strategy is similar to AMD (fully open-source), but their discrete GPU market share is much smaller.',
              'AMD\'s development center in China: AMD\'s Shanghai office also has a GPU driver team that participates in amdgpu development. On the amd-gfx mailing list, you can regularly see patches from Chinese developers with @amd.com email addresses. If you\'re job hunting for AMD GPU driver positions in China, Shanghai is the primary location.',
            ],
            keyPoints: [
              'amd-gfx mailing list is public, 30\u201350 patches daily, anyone can participate',
              'Alex Deucher (agd5f) is amdgpu\'s lead maintainer, reviews nearly all patches',
              'Patch path: amd-gfx \u2192 drm-next (AMD) \u2192 drm-next (Dave Airlie) \u2192 Linux mainline',
              'AMD fully open-source vs NVIDIA core closed-source vs Intel fully open-source but smaller market share',
              'AMD Shanghai office has a GPU driver team collaborating with Markham',
              'Submitting an accepted patch is the most powerful resume credential for getting into AMD',
            ],
          },
          diagram: {
            title: 'Path of an AMD Driver Patch from Developer to Linux Mainline',
            content: `Lifecycle of an AMD Driver Patch

You (developer)
  \u2502
  \u2502 git send-email patch.mbox
  \u25bc
amd-gfx@lists.freedesktop.org       \u2190 Public mailing list
  \u2502
  \u2502 Alex Deucher Review
  \u2502 (typically 1\u20132 weeks)
  \u25bc
AMD drm-next branch                    \u2190 agd5f/linux on GitLab
  \u2502 (gitlab.freedesktop.org/agd5f/linux)
  \u2502
  \u2502 Pull request every 2\u20134 weeks
  \u25bc
DRM drm-next branch                    \u2190 Maintained by Dave Airlie
  \u2502 (drm/drm on GitLab)
  \u2502
  \u2502 Each merge window
  \u25bc
Linus Torvalds / Linux mainline        \u2190 torvalds/linux
  \u2502
  \u2502 Release rc1 \u2192 rc2 \u2192 ... \u2192 release
  \u25bc
Linux 6.X official release             \u2190 Your patch is here!

Timeline:
  Patch sent \u2500\u2192 Review (1\u20132 wk) \u2500\u2192 drm-next (2\u20134 wk)
  \u2500\u2192 Mainline merge window (2\u20133 mo) \u2500\u2192 Official release

Parallel path (AMD internal):
  AMD engineer \u2192 internal review \u2192 amd-gfx \u2192 same flow`,
            caption: 'The complete path of an amdgpu patch from developer\'s keyboard to Linux official release. The entire process is open and transparent \u2014 you can see every step in the mailing list.',
          },
          codeWalk: {
            title: 'Reading a Real amd-gfx Patch Review Conversation',
            file: 'amd-gfx mailing list (example)',
            language: 'text',
            code: `Subject: [PATCH v2] drm/amdgpu: fix use-after-free in amdgpu_ctx_fini
From: Developer <dev@company.com>

[v2: address Alex's review comments - add null check before kfree]

When a context is destroyed while a job is still pending,
amdgpu_ctx_fini() may access the context structure after
it has been freed by the job completion handler.

Add a reference count check before accessing the context
to prevent use-after-free.

Fixes: abc123 ("drm/amdgpu: add context reference counting")
Cc: stable@vger.kernel.org
Signed-off-by: Developer <dev@company.com>
---
 .../gpu/drm/amd/amdgpu/amdgpu_ctx.c | 5 ++++-
 1 file changed, 4 insertions(+), 1 deletion(-)

---
# Review conversation (reply below the patch):

> Alex Deucher <alexander.deucher@amd.com>:
> 
> On Mon, Jan 20, 2025, Developer wrote:
> > +  if (!kref_get_unless_zero(&ctx->refcount))
> > +      return;
>
> Reviewed-by: Alex Deucher <alexander.deucher@amd.com>
> 
> Thanks for fixing this. I'll pick this up for 6.9.

# Patch accepted! Entering drm-next.`,
            annotations: [
              '[PATCH v2] indicates this is version 2 \u2014 revised after receiving review feedback on v1',
              'Fixes: tag references the original commit that introduced the bug, enabling automatic backporting to stable branches',
              'Cc: stable@vger.kernel.org requests the fix to be backported to LTS kernels',
              'Reviewed-by: Alex Deucher means the lead maintainer has reviewed and approved',
              '"I\'ll pick this up for 6.9" means the patch will go into the next kernel version',
              'The entire conversation is public \u2014 anyone can view it in the mailing list archives',
            ],
            explanation: 'This is the real workflow of AMD driver development. Note several key points: (1) The commit message clearly explains the what and why; (2) v2 shows the developer seriously addressed review feedback; (3) Alex Deucher\'s Reviewed-by is the final confirmation that the patch is accepted. Reference this format when you\'re ready to submit your first patch.',
          },
          miniLab: {
            title: 'Explore the amd-gfx Mailing List',
            objective: 'Subscribe to the amd-gfx mailing list, browse recent patches, and get a feel for the AMD driver development community\'s activity level.',
            steps: [
              'Open https://lists.freedesktop.org/mailman/listinfo/amd-gfx',
              'Browse archives from the last month: https://lists.freedesktop.org/archives/amd-gfx/',
              'Find an email starting with [PATCH] and read the commit message',
              'Find a patch thread with review replies and observe the review process',
              'Count today\'s patches: browse today\'s archive and count how many [PATCH] emails there are',
              '(Optional) Subscribe to the mailing list using the link above',
            ],
            expectedOutput: `Observed activity level:
- About 30\u201350 emails per day (patches + review replies)
- Patch subject prefixes: drm/amd/display:, drm/amdgpu:, drm/amdkfd:
- Common reviewers: Alex Deucher, Harry Wentland, Mario Limonciello
- Patch sizes: most are 10\u2013100 line small changes`,
            hint: 'If you don\'t want to be overwhelmed with email, choose Digest mode (one summary email per day instead of each one individually).',
          },
          debugExercise: {
            title: 'Identify Open-Source vs Closed-Source GPU Driver Components',
            language: 'text',
            description: 'Below are 6 components from the AMD and NVIDIA driver stacks. Mark each as open-source or closed-source.',
            question: 'Mark the open-source status of each component',
            buggyCode: `AMD side:
1. amdgpu kernel driver                          \u2192 ???
2. Mesa radv (Vulkan driver)                     \u2192 ???
3. AMD GPU firmware (amdgpu firmware blobs)      \u2192 ???

NVIDIA side:
4. nvidia kernel driver (traditional closed)     \u2192 ???
5. nvidia-open kernel module                     \u2192 ???
6. NVIDIA user-space driver (libGL/libcuda)      \u2192 ???`,
            hint: 'AMD is almost entirely open-source (except firmware); NVIDIA\'s core remains closed-source.',
            answer: '1. amdgpu \u2192 Open-source (GPL-2.0), merged into Linux mainline. 2. Mesa radv \u2192 Open-source (MIT), in the Mesa repository. 3. AMD GPU firmware \u2192 Closed-source (distributed as binary blobs in linux-firmware, under AMD\'s license agreement). 4. nvidia traditional driver \u2192 Closed-source (NVIDIA-distributed .run installer). 5. nvidia-open \u2192 Partially open-source (kernel modules open-sourced in 2022, but only contain GPU System Processor code; core compute/graphics logic remains in closed-source GPU System Processor firmware). 6. NVIDIA user-space driver \u2192 Closed-source (libGL.so, libcuda.so are fully proprietary). Key difference: AMD\'s entire software stack (driver + Mesa + ROCm) is open-source; only firmware is a binary blob. NVIDIA\'s core drivers (both kernel-mode and user-mode) are closed-source; nvidia-open is just a thin shell.',
          },
          interviewQ: {
            question: 'How does AMD\'s amdgpu driver get merged into the Linux kernel mainline? Describe the complete flow from patch submission to final release.',
            difficulty: 'easy',
            hint: 'Describe the path: mailing list \u2192 review \u2192 drm-next \u2192 merge window \u2192 release.',
            answer: 'Complete flow: (1) Developer (AMD engineer or community contributor) develops and tests a patch locally. (2) Sends the patch to amd-gfx@lists.freedesktop.org via git send-email. (3) AMD maintainers and other community members review the patch, giving Reviewed-by or suggesting changes. (4) Accepted patches are typically collected in the relevant maintainer integration branch before reaching the DRM maintainer tree. (5) DRM maintainers then merge those changes into drm-next for an upcoming kernel cycle. (6) During the Linux kernel merge window, the DRM pull request is sent to Linus Torvalds. (7) Patches enter Linux mainline and go through the rc cycle before release. Urgent bug fixes can request backporting to stable kernels via the Cc: stable@vger.kernel.org tag.',
            amdContext: 'Understanding this workflow demonstrates your knowledge of how the Linux kernel community operates \u2014 this is a bonus point in AMD interviews.',
          },
        },
      ],
    },
  ],
  completionChecklist: [
    'Can distinguish AMD\'s three GPU product tiers (Radeon RX / Pro / Instinct) and their driver differences',
    'Can map from marketing name to chip codename, IP version, and Device ID (RX 7600 XT \u2194 Navi33 \u2194 gfx1102 \u2194 0x7480)',
    'Can explain the GCN to RDNA architecture transition and its impact on driver code',
    'Can describe each layer of the AMD driver stack and its code repository location',
    'Can quickly determine which layer of the driver stack an error message originates from',
    'Understand the amd-gfx mailing list workflow and patch merge path',
    'Can look at an AMD GPU model name and verbally derive the likely codename, IP version, and driver area to inspect first',
  ],
};

export default module05MicroLessonsEn;
