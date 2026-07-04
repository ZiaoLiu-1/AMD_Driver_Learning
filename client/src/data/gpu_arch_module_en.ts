// ============================================================
// AMD Linux Driver Learning Platform - Module 1.5 (English)
// GPU Architecture Fundamentals
// English translation of gpu_arch_module.ts — truly understand
// what a GPU is before touching graphics APIs and driver code.
// Fact-checked against: AMD RDNA3/RDNA4 ISA Reference Guide, ROCm
// official docs (gpu-arch-specs / device-hardware glossary), and
// the Linux kernel amdgpu docs (driver-core / GC / MES).
// ============================================================
import type { Module } from './curriculum';

export const gpuArchModuleEn: Module = {
  id: 'gpu-arch',
  number: '1.5',
  title: 'GPU Architecture Fundamentals',
  titleEn: 'GPU Architecture Fundamentals',
  icon: 'Cpu',
  description:
    'Before writing any driver code, answer three questions first: how exactly does a GPU differ from a CPU? What do AMD terms like wavefront, CU, and WGP mean? How does the CPU hand work off to the GPU? This module uses 12 micro-lessons plus real architecture diagrams to explain the execution model, the memory system, and the command front-end in one pass — precisely the three areas the amdgpu driver deals with every day.',
  estimatedHours: 35,
  difficulty: 'beginner',
  subModules: [
    { id: 'ga-what', title: '1.5.1 What a GPU Really Is', titleEn: 'What a GPU Really Is' },
    { id: 'ga-exec', title: '1.5.2 Execution Model: Waves, CUs & WGPs', titleEn: 'Execution Model: Waves, CUs & WGPs' },
    { id: 'ga-mem-cmd', title: '1.5.3 Memory System & Command Front-End', titleEn: 'Memory System & Command Front-End' },
    { id: 'ga-map', title: '1.5.4 Architecture Map & Pipeline Tour', titleEn: 'Architecture Map & Pipeline Tour' },
  ],
  theory: {
    overview:
      'Many learners jump from "basic preparation" straight into graphics APIs or kernel code, and the first time they meet wavefront, SIMD32, or doorbell they have no mental picture at all. This module is the missing foundation: it starts from the design philosophy of "throughput machine vs latency machine", then takes apart a real AMD GPU (the running example is still the RX 7600 XT / Navi33 / gfx1102), building a complete mental model in the order "execution model → memory system → command front-end → architecture map". Depth is graded by importance to driver development: core driver concepts like the command submission path, VRAM/GTT, and IP block organization are covered to the point where you can read the code; things Mesa owns, like rasterization and texture sampling, get only a quick tour. Every number comes from AMD official ISA manuals and ROCm documentation, with source links provided.',
    sections: [
      {
        title: 'Why GPUs Look the Way They Do: Throughput vs Latency',
        content:
          'A CPU is a latency-optimized machine: big caches, out-of-order execution, and branch prediction all exist to let "one thread" finish as fast as possible. The GPU goes the opposite way: it strips out those expensive mechanisms, spends all the area on ALUs, and hides memory latency with "massive parallelism + switching wavefronts at any time" — while one wave waits on VRAM (hundreds of cycles), the SIMD immediately switches to another ready wave and keeps computing, so the hardware is never idle. This single design choice explains nearly every concept that follows: why register usage limits parallelism (occupancy), why a GPU needs tens of thousands of threads to stay fed, and why the driver submits commands in large batches instead of feeding them one by one.',
        diagram: {
          type: 'ascii',
          content: `CPU (latency-optimized)        GPU (throughput-optimized)
┌────────────────────┐        ┌────────────────────┐
│ Few large cores     │        │ Thousands of ALU    │
│ Big cache/OoO/pred  │        │ lanes; small cache  │
│ Goal: 1 thread fast │        │ + huge reg file     │
└────────────────────┘        │ Goal: max total     │
                              └────────────────────┘
Latency hiding:
wave A ──run──┐wait VRAM(~600 cyc)┌──run──
wave B ───────┘switch instantly ──┘        ALUs never idle`,
          caption: 'The GPU fights memory latency by "switching wavefronts" instead of "big caches" — this is the key to understanding everything a GPU does.',
        },
      },
      {
        title: "AMD's Terminology: From work-item to Shader Engine",
        content:
          "AMD's execution hierarchy from bottom to top is: work-item (one thread, mapping to one lane of a SIMD) → wavefront (32 or 64 work-items sharing one instruction stream; RDNA is natively wave32, CDNA is fixed wave64) → workgroup (several waves that share LDS and can synchronize with barriers, and must land on the same WGP) → grid (all the workgroups of one kernel launch). The hardware hierarchy is: SIMD32 (the 32-wide vector unit that actually executes instructions, with its own VGPR file) → CU (2 SIMD32s + scalar unit + L0 cache) → WGP (RDNA-specific, 2 CUs sharing 128 KiB of LDS) → Shader Array → Shader Engine → the whole GPU. The RX 7600 XT is 32 CUs = 16 WGPs, with 2 Shader Engines. Remember one correspondence: the CU is the \"core\"; the \"stream processor count\" on marketing pages is just the lane count (CU × 64).",
        diagram: {
          type: 'ascii',
          content: `Software view                Hardware view
grid (whole kernel)          GPU
 └─ workgroup (≤1024)         └─ Shader Engine ×2 (Navi33)
     └─ wavefront (32/64)         └─ Shader Array ×2
         └─ work-item                 └─ WGP ×4 (= 2 CU)
                                          └─ SIMD32 ×4/WGP
Mapping rules:
  1 workgroup → 1 WGP (LDS lives here)
  1 wavefront → one wave slot of one SIMD32`,
          caption: 'How the software hierarchy (left) lands on the hardware hierarchy (right). RDNA has 4 SIMD32s per WGP; CDNA has no WGP and keeps the GCN CU layout.',
        },
      },
      {
        title: "The Driver's Main Battlefield: Memory and the Command Front-End",
        content:
          'For a kernel driver, what matters most is not how shaders compute, but two things: memory and commands. On the memory side: the GPU can access two kinds of memory — VRAM (on-board memory) and GTT (system memory mapped to the GPU through GART page tables), and GPUVM additionally gives every process its own set of GPU page tables; amdgpu uses TTM to manage buffer placement and eviction between VRAM/GTT, which is a high-frequency source of real driver bugs. On the command side: the CPU does not directly control the GPU; it writes PM4 command packets into a ring buffer, taps a doorbell (one MMIO write), and the GPU command processor (CP: PFP/ME handles graphics queues, MEC/ACE handles compute queues) fetches, parses, and dispatches wavefronts on its own. From GFX11 onward, the MES firmware dynamically maps a large number of user queues (MQD) onto the limited hardware queue slots (HQD) — this is the foundation of user-mode queues.',
        diagram: {
          type: 'ascii',
          content: `Command submission path (simplified)
User space: app/Mesa ──build IB(PM4)──> ioctl(CS)
Kernel:     amdgpu ──write ring + WPTR──> write doorbell (MMIO)
GPU:        CP(PFP→ME / MEC) ──parse PM4──> dispatch waves to CUs
Done:       EOP event ──fence value──> interrupt ──> wake waiters

Memory domains: VRAM | GTT (GART-mapped system memory) | DOORBELL ...
        └── GPUVM: per-process GPU page tables`,
          caption: 'The two main threads the driver deals with daily: BO placement between VRAM/GTT, and the ring→doorbell→CP command flow.',
        },
      },
      {
        title: 'The Architecture Map: GCN, RDNA, CDNA & Kernel Codenames',
        content:
          'Starting in 2019, AMD split the single GCN line into two: RDNA for gaming (Radeon RX; native wave32, WGP, Infinity Cache) and CDNA for the data center (Instinct MI; wave64, matrix cores, HBM, no display output). As of mid-2026: the newest on the gaming side is RDNA4 (RX 9000, gfx120x, released 2025), the newest on the compute side is CDNA4 (MI350, gfx950, released 2025), with MI400/CDNA5 planned for 2H 2026; "UDNA" is the re-unification direction AMD has announced, not yet a product you can buy. To learn the driver you must be able to convert names: marketing name (RX 7600 XT) → chip codename (Navi33) → LLVM target (gfx1102) → kernel GC IP version (11.0.2, matching gfx_v11_0.c). Note that kernel code to this day still speaks the "GCN dialect": the amdgcn triple, SE/SH/CU counts, and old names like TCP are used unchanged on RDNA4.',
        diagram: {
          type: 'ascii',
          content: `            GCN (2012-2019, gfx6-9)
                    │ 2019 split
        ┌───────────┴───────────┐
      RDNA (gaming)           CDNA (compute)
  RDNA1/2/3/3.5/4          CDNA1/2/3/4 → MI400(2H26)
  gfx101x→gfx120x          gfx908→gfx950
  wave32·WGP·InfCache      wave64·matrix cores·HBM
        └───────"UDNA" (announced unification)───────┘
Name decoding: RX 7600 XT = Navi33 = gfx1102 = GC 11.0.2`,
          caption: 'Two architecture lines + one set of name conversions. Kernel file names follow the GC IP version: gfx_v11_0.c, gfx_v12_0.c.',
        },
      },
    ],
    keyBooks: [
      {
        title: 'Programming Massively Parallel Processors, 4th Edition',
        author: 'Wen-mei Hwu, David Kirk, Izzat El Hajj',
        relevance: 'The standard textbook for general-purpose GPU computing: a systematic treatment of thread hierarchy, memory coalescing, and occupancy. Although written in CUDA terms, the concepts map one-to-one to HIP/AMD (warp↔wavefront, SM↔CU) — just substitute terminology as you read.',
      },
      {
        title: 'General-Purpose Graphics Processor Architectures',
        author: 'Tor M. Aamodt, Wilson W. L. Fung, Timothy G. Rogers',
        relevance: 'A slim volume covering SIMT execution, branch divergence, and memory systems from the architecture-research perspective. Ideal for readers who want to know "why the hardware was designed this way" — the best conceptual complement to the ISA manuals.',
      },
    ],
    onlineResources: [
      {
        title: '"RDNA3" Instruction Set Architecture Reference Guide',
        url: 'https://www.amd.com/content/dam/amd/en/documents/radeon-tech-docs/instruction-set-architectures/rdna3-shader-instruction-set-architecture-feb-2023_0.pdf',
        type: 'doc',
        description: "AMD's official ISA manual: the final authoritative definition of waves, the EXEC mask, SGPR/VGPR, and LDS. The entire execution-model portion of this module defers to it.",
      },
      {
        title: '"RDNA4" Instruction Set Architecture Reference Guide',
        url: 'https://docs.amd.com/v/u/en-US/rdna4-instruction-set-architecture',
        type: 'doc',
        description: 'The ISA manual for the newest gaming-architecture generation, released in 2025. Read it side by side with the RDNA3 edition to see the architectural evolution (e.g., removal of the per-SA graphics L1).',
      },
      {
        title: 'AMD Instinct MI300/CDNA3 Instruction Set Architecture',
        url: 'https://www.amd.com/content/dam/amd/en/documents/instinct-tech-docs/instruction-set-architectures/amd-instinct-mi300-cdna3-instruction-set-architecture.pdf',
        type: 'doc',
        description: 'The compute-side counterpart manual: wave64, MFMA matrix instructions, AccVGPR. Reading it against the RDNA manual is how you truly understand where the two lines diverge.',
      },
      {
        title: 'ROCm: GPU hardware specifications master table',
        url: 'https://rocm.docs.amd.com/en/latest/reference/gpu-arch-specs.html',
        type: 'doc',
        description: 'One page to look up every AMD GPU: CU count, wave size, LDS, cache capacities at each level, LLVM target name, and GFXIP version. The source of every number in this module.',
      },
      {
        title: 'ROCm: device hardware glossary (official terminology)',
        url: 'https://rocm.docs.amd.com/en/latest/reference/glossary/device-hardware.html',
        type: 'doc',
        description: "AMD's official beginner-level definitions of WGP, wavefront, SALU/VALU, Infinity Cache, XCD, and more — the reference baseline for this site's bilingual glossary.",
      },
      {
        title: 'AMD Instinct MI300 microarchitecture (ROCm docs)',
        url: 'https://rocm.docs.amd.com/en/latest/conceptual/gpu-arch/mi300.html',
        type: 'doc',
        description: 'Official block diagrams and peak-throughput tables for XCD/ACE/HWS/HBM — the best entry point for understanding data-center GPUs in the chiplet era.',
      },
      {
        title: 'GPUOpen: Occupancy explained',
        url: 'https://gpuopen.com/learn/occupancy-explained/',
        type: 'doc',
        description: 'The single best article explaining wave slots, VGPR/LDS limits, and wave32 vs wave64 with real RDNA3 numbers — the primary reference for the occupancy lesson in this module.',
      },
      {
        title: 'Linux kernel amdgpu official docs (driver-core / GC / MES)',
        url: 'https://docs.kernel.org/gpu/amdgpu/driver-core.html',
        type: 'doc',
        description: 'IP blocks, ring/IB, MQD/HQD, doorbells, and memory domains explained first-hand by the driver maintainers — the mental model that every later driver module assumes you have comes from here.',
      },
      {
        title: 'AMD video: All the Pipelines — Journey through the GPU',
        url: 'https://gpuopen.com/videos/graphics-pipeline/',
        type: 'video',
        description: "AMD's official tour of the graphics pipeline: from API calls through the geometry/rasterization/RB fixed-function blocks. Best watched before the fourth group of lessons.",
      },
      {
        title: 'AMD video: Optimizing for the Radeon RDNA Architecture',
        url: 'https://gpuopen.com/videos/optimizing-for-the-radeon-rdna-architecture/',
        type: 'video',
        description: 'AMD engineer Lou Kramer explains RDNA vs GCN, WGPs, and wave modes with real shader examples — the "audio edition" of the ISA manual.',
      },
      {
        title: 'Branch Education: How do Graphics Cards Work?',
        url: 'https://www.youtube.com/watch?v=h9Z4oGN89MU',
        type: 'video',
        description: 'Widely regarded as the best GPU introduction video (28 minutes of photorealistic 3D animation). Note that it dissects an NVIDIA GA102 — use this module\'s terminology table to convert as you watch (SM↔CU, warp↔wave).',
      },
      {
        title: 'Fabian Giesen: A trip through the Graphics Pipeline 2011',
        url: 'https://fgiesen.wordpress.com/2011/07/09/a-trip-through-the-graphics-pipeline-2011-index/',
        type: 'doc',
        description: 'The classic community series of 13 long posts: from the API all the way to pixels. Its command-processor and rasterization chapters remain the best reading for understanding the AMD CP/PM4 world.',
      },
    ],
  },
  codeReading: [
    {
      title: "amdgpu's Worldview: A GPU = a Set of IP Blocks",
      description:
        'This real driver code shows the core conclusion of Lesson 2: amdgpu never treats the GPU as a monolith; it registers it IP block by IP block. soc21.c is the SoC layer for the GFX11 generation (including the RX 7600 XT); it hooks the ip_blocks for GC, SDMA, VCN, and other IPs into the device one by one. You can already read what this function is "assembling".',
      file: 'drivers/gpu/drm/amd/amdgpu/soc21.c',
      language: 'c',
      code: `/* GFX11 generation assembles the GPU by IP version (excerpt, v6.x kernel) */
static int soc21_common_early_init(struct amdgpu_ip_block *ip_block)
{
	/* ... determine chip family, harvest config ... */
}

/* Based on the IP discovery table in the VBIOS, amdgpu_discovery.c
 * picks the matching implementation for each IP version and registers it: */
int amdgpu_discovery_set_ip_blocks(struct amdgpu_device *adev)
{
	/* GC (graphics + compute) —— gfx1102 → GC 11.0.2 */
	amdgpu_discovery_set_gc_ip_blocks(adev);
	/* SDMA —— copy/paging engine */
	amdgpu_discovery_set_sdma_ip_blocks(adev);
	/* VCN/JPEG —— video encode/decode */
	amdgpu_discovery_set_mm_ip_blocks(adev);
	/* DCN —— display; PSP —— firmware security; SMU —— power ... */
	return 0;
}`,
      annotations: [
        'IP discovery: a modern AMD GPU carries a table in its VBIOS saying "these are the IP versions I am made of"; the driver reads the table and selects implementations by version number — this is why one amdgpu driver can drive a dozen GPU generations at once.',
        'GC 11.0.2 is gfx1102 (RX 7600 XT): the LLVM name gfxNNNN and the kernel GC IP version convert back and forth.',
        'Every IP block implements the same set of callbacks (sw_init/hw_init/suspend/resume...); Module 5 will cover this ops pattern in depth.',
      ],
    },
    {
      title: 'The Execution Hierarchy Through a HIP Kernel',
      description:
        'The hands-on subject of Lesson 6: a minimal HIP vector addition. The comments mark the hardware concept behind each line — once you have written these 20 lines, grid/workgroup/wavefront stop being memorized vocabulary.',
      file: 'vecadd.hip.cpp (user-space example)',
      language: 'cpp',
      code: `#include <hip/hip_runtime.h>

/* __global__ = a function that runs on the GPU (kernel) */
__global__ void vecAdd(const float *a, const float *b,
                       float *c, int n)
{
    /* Each work-item finds its own slice of data with index math */
    int i = blockIdx.x * blockDim.x + threadIdx.x;
    if (i < n)               /* in the tail wave, some lanes get masked off by EXEC */
        c[i] = a[i] + b[i];  /* adjacent lanes touch adjacent addresses → coalesced access */
}

int main() {
    /* ... hipMalloc / hipMemcpy omitted ... */
    int n = 1 << 20;
    dim3 block(256);                 /* workgroup: 256 work-items  */
    dim3 grid((n + 255) / 256);      /* grid: 4096 workgroups      */
    /* RDNA (wave32): each workgroup = 8 wavefronts,
       landing on the same WGP; hardware scatters the 4096 groups across all CUs */
    vecAdd<<<grid, block>>>(d_a, d_b, d_c, n);
    hipDeviceSynchronize();
}`,
      annotations: [
        'block(256) compiles to 8 wave32s on RDNA (or 4 wave64s — the compiler picks the mode per shader).',
        'A workgroup must land entirely on one WGP: the LDS and barrier hardware it needs both live in the WGP.',
        'if (i < n) is the minimal example of branch divergence: out-of-range lanes in the last wave are disabled via the EXEC mask, so the hardware never accesses out of bounds.',
      ],
    },
  ],
  miniProject: {
    title: 'Build an "Architecture Profile Card" for Your GPU',
    description:
      'Put every concept in this module to work: combine tool measurements with official tables to build a complete profile card for the AMD GPU you own (or any one you pick), and explain what every number means.',
    objectives: [
      'Master the four-layer conversion: marketing name → codename → gfx target → GC IP version',
      'Measure and explain CU/WGP count, wave size, LDS, each cache level, and the VRAM parameters',
      "Read the GPU's IP block list from the IP discovery output in dmesg",
    ],
    steps: [
      'Use lspci -nn and /sys/class/drm/card*/device/ to find the device id, then match it against the ROCm gpu-arch-specs table to determine the codename and gfx version (e.g., RX 7600 XT → Navi33 → gfx1102)',
      'If you have a ROCm environment, run rocminfo and extract four items: Compute Unit count, Wavefront Size, LDS size, and maximum workgroup size',
      'Read the IP discovery output from dmesg | grep -i "amdgpu.*ip" and list the version numbers for GC/SDMA/VCN/DCN/PSP/SMU',
      'Read mem_info_vram_total and mem_info_gtt_total from sysfs, explain which kind of memory each corresponds to, and why the GTT size is close to half of system memory',
      'Assemble all of the above into one profile card (CU/WGP, SE count, wave modes, LDS, L2/Infinity Cache, VRAM type and bandwidth, gfx and GC versions, IP list), annotating the data source for every entry',
    ],
    expectedOutput:
      'A shareable GPU profile card. Using the RX 7600 XT as the example it should include: 32 CU / 16 WGP / 2 SE; native wave32 (wave64 supported); LDS 128 KiB per WGP; L2 2 MiB + Infinity Cache 32 MiB; 16 GB GDDR6 (driver reports about 16368 MB); gfx1102 = GC 11.0.2; IP list including GC 11.0.2 / SDMA 6.0.2 / VCN 4.0.4 / DCN 3.1.4 / PSP 13.0.8 / SMU 13.0.8 (varies slightly by VBIOS).',
  },
  interviewQuestions: [
    {
      question: 'Explain what a wavefront is. What is the difference between RDNA wave32 and GCN/CDNA wave64? Why must the driver and compiler support both?',
      difficulty: 'medium',
      hint: 'Start from "a group of lanes sharing one instruction stream", then cover RDNA native 32, wave64 executing in two beats, and CDNA fixed at 64.',
      answer:
        'A wavefront is a group of work-items on an AMD GPU that share the same instruction stream and execute in lockstep (NVIDIA calls it a warp). GCN and CDNA waves are fixed at 64 lanes (GCN issues over a SIMD16 in 4 beats); RDNA widened the SIMD to 32 lanes, so wave32 issues one instruction per beat, while retaining a wave64 mode (one instruction executes over two beats). On RDNA, whether a given shader uses wave32 or wave64 is chosen by the compiler/driver based on shader type and register pressure, so the toolchain and the kernel code that manages wave state (e.g., debug/trap handling) must handle both modes correctly; CDNA only has wave64. Interview bonus points: wave size affects branch-divergence cost and occupancy math, and wave32 is the core trade-off RDNA made for gaming workloads (branchy, latency-sensitive).',
    },
    {
      question: 'What is the relationship between a CU and a WGP? Why must "a workgroup land on a single WGP"? Does kernel code count CUs or WGPs?',
      difficulty: 'medium',
      hint: 'WGP = 2 CUs + shared LDS/L0 instruction cache; think about where the LDS and barrier hardware live.',
      answer:
        'RDNA packs two CUs into one WGP (Workgroup Processor), with the LDS (128 KiB) and the L0 instruction/scalar caches shared at the WGP level; inside each CU are 2 SIMD32s + a scalar unit + an L0 vector cache. A workgroup is by definition "a set of waves that share LDS and can synchronize with barriers", and both of those pieces of hardware live in the WGP, so a workgroup must be scheduled entirely into one WGP (its waves can spread across its 4 SIMDs). As for counting conventions: the kernel, ROCm, and marketing all count CUs (RX 7600 XT: 32 CUs = 16 WGPs); in sysfs/debugfs it is active_cu_number. CDNA has no WGP at all — it keeps the GCN layout (4×SIMD16 + 64 KiB LDS per CU).',
    },
    {
      question: 'What is the difference between VRAM and GTT? How does the GPU use system memory? When does a buffer migrate between the two?',
      difficulty: 'hard',
      hint: 'Keywords: GART page table, GPUVM, TTM placement and eviction, the PCIe bandwidth gap.',
      answer:
        'VRAM is the GPU\'s on-board memory (RX 7600 XT: 16 GB GDDR6, ~288 GB/s local bandwidth); GTT is system memory mapped to the GPU through GART page tables — the GPU reaches it over PCIe, with an order of magnitude less bandwidth but much larger capacity. GPUVM gives every process its own GPU page tables; a single GPU virtual address can be backed by a VRAM page or a GTT page, transparently to shaders. amdgpu uses TTM to manage buffer object placement: when a BO is created, user space states a preferred domain (e.g., a scanout buffer must be in VRAM); under memory pressure TTM evicts rarely-used BOs to GTT and migrates them back when needed, with the SDMA engine doing the copies. The eviction path is a high-frequency source of real driver bugs (sudden performance drops, dangling references) and is the answer to the common interview question "what happens when VRAM is oversubscribed". Separately, the CPU writes VRAM directly through the BAR0 window (Resizable BAR determines the window size) — that is access in the other direction, distinct from GTT.',
    },
    {
      question: 'From an application issuing one draw/compute call to the GPU actually starting execution, what happens in between? Describe it in three stages: user space → kernel → GPU.',
      difficulty: 'hard',
      hint: 'Order: Mesa/ROCm builds IB(PM4) → ioctl(CS) → ring buffer + WPTR → doorbell → CP (PFP/ME or MEC/ACE) → wave dispatch → fence report.',
      answer:
        'User space: Mesa (or ROCm) encodes state setup and draw/dispatch commands into PM4 packets, writes them into a GPU-visible Indirect Buffer (IB), then calls the amdgpu CS ioctl to submit, attaching dependent fences. Kernel: amdgpu validates and schedules the submission (drm_sched), writes an INDIRECT_BUFFER packet pointing at the IB into the ring buffer of the target engine, updates WPTR, and finally writes that queue\'s doorbell (an MMIO page on BAR2) — the only "wake-up" action. GPU: the command processor fetches packets from the ring; graphics queues are parsed by the PFP→ME pipeline, compute queues by the MEC (ACE); on reaching a dispatch/draw, the SPI creates wavefronts and assigns them to wave slots on the SIMDs of the CUs. On completion the CP writes back the fence value and raises an EOP interrupt, and the kernel wakes processes waiting on that fence. On GFX11+ there is also MES: it dynamically loads the MQDs of many user queues into the limited HQD slots, allowing user space to skip per-submit ioctls and ring doorbells directly (user-mode queues).',
    },
  ],
};
