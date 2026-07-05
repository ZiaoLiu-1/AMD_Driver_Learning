// ============================================================
// AMD Linux Driver Learning Platform - Module 1.5 Micro-Lessons (English)
// Module 1.5: GPU Architecture Fundamentals
// 12 lessons in 4 groups, ~20 min each
// Fact base: AMD RDNA3/RDNA4 ISA Guide, ROCm gpu-arch-specs,
// GPUOpen "Occupancy explained", Linux kernel amdgpu docs.
// Figures: diagram.svgId → components/shared/LessonFigure.tsx
// ============================================================
import type { MicroLessonModule } from './micro_lesson_types';

export const gpuArchMicroLessonsEn: MicroLessonModule = {
  moduleId: 'gpu-arch',
  groups: [
    // ════════════════════════════════════════════════════════════
    // Group 1.5.1: What a GPU Really Is
    // ════════════════════════════════════════════════════════════
    {
      id: '15-1',
      number: '1.5.1',
      title: 'What a GPU Really Is',
      titleEn: 'What a GPU Really Is',
      icon: 'Cpu',
      description: "Don't rush to memorize terminology. First understand the fundamental division of labor between GPU and CPU — latency machine vs throughput machine — then take a real AMD GPU apart into what the driver sees: a set of IP blocks, each with its own job.",
      lessons: [
        // ── Lesson 1.5.1.1 ────────────────────────────────────
        {
          id: '15-1-1',
          number: '1.5.1.1',
          title: 'CPU vs GPU: Latency Machines and Throughput Machines',
          titleEn: 'CPU vs GPU: Latency vs Throughput Machines',
          duration: 20,
          difficulty: 'beginner',
          tags: ['GPU', 'throughput', 'latency-hiding', 'SIMT'],
          concept: {
            summary:
              'A CPU uses big caches, out-of-order execution, and branch prediction to make a single thread finish as fast as possible (latency-optimized); a GPU strips those mechanisms out, trades the die area for thousands of ALU lanes, and hides memory latency by "switching wavefronts at any time" (throughput-optimized). Understand this one trade-off, and every GPU concept that follows has a cause and effect.',
            explanation: [
              'Imagine two ways of delivering packages: the CPU is like an F1 race car — one package at a time, but extremely fast. To buy that speed, it spends heavily on caches (avoid long trips), out-of-order execution, and branch prediction (never wait idle). The GPU is like a ten-thousand-rider bicycle brigade: no single rider is fast, but each departure carries tens of thousands of packages, and total throughput crushes the race car.',
              "But the bicycle brigade has a fatal problem: accessing VRAM takes hundreds of clock cycles, and if every rider stopped to wait, the whole brigade would grind to a halt. The GPU's solution is not bigger caches but oversubscription: each execution unit hosts far more wavefronts than it can compute at once, and when one wave waits on memory, the hardware switches to another ready wave on the very next cycle. The switch costs nothing, because every wave's registers stay resident in an enormous register file — which also explains why a GPU's register file is bigger than its caches (RDNA3 has 768 KiB of VGPRs per WGP, an order of magnitude larger than its L0 cache).",
              'This design imposes two requirements on software: first, there must be massive parallel work available to switch between — a few thousand threads is just the entry ticket, which is why GPU programs always "process a whole array at once"; second, work must be submitted in batches — feeding instructions one by one from the CPU is too slow, so the CPU only writes commands into a ring buffer in memory and the GPU fetches them itself (the command front-end lessons later in this module expand on this).',
              "From the driver developer's perspective: many of the \"performance problems\" you will debug later are, at their root, latency hiding gone wrong — not enough waves (low occupancy), bad access patterns (failed coalescing), or the CPU submission side becoming the bottleneck. Weld this causal chain into your head now; every following lesson adds detail to it.",
            ],
            keyPoints: [
              'CPU optimizes "how fast one thread runs" (latency); GPU optimizes "total volume per unit time" (throughput) — not a faster/slower relationship, but a different division of labor.',
              'The GPU hides memory latency by switching wavefronts, not with big caches; register residency makes the switch free.',
              "A GPU's register file being larger than its cache is a design outcome, not a design mistake.",
              'A GPU needs far more threads than ALUs to stay fed: the RX 7600 XT has 2048 lanes but needs tens of thousands of work-items to hide latency.',
              'Driver-side foreshadowing: batched command submission (the ring buffer) is the "throughput machine" philosophy extended to the CPU↔GPU interface.',
            ],
          },
          diagram: {
            title: 'Two Design Philosophies + Latency Hiding',
            svgId: 'cpu-vs-gpu',
            content: `CPU (latency-optimized)     GPU (throughput-optimized)
┌──────────────────┐        ┌──────────────────┐
│ 4-16 large cores │        │ 1000s of ALU lanes│
│ big cache/OoO/BP │        │ small cache + big │
│                  │        │ register file     │
└──────────────────┘        └──────────────────┘
Latency hiding:
wave A ─run─┤ wait VRAM ~600 cyc ├─run─
wave B ─────┘ hw switches instantly ┘`,
            caption: 'Left: the CPU spends area on "keeping one thread from waiting"; right: the GPU spends area on ALUs and "pretends not to wait" by switching waves. The timeline at the bottom is the most important figure in the whole module.',
          },
          codeWalk: {
            title: 'The Same Task Written Two Ways: Serial Loop vs Data Parallel',
            language: 'cpp',
            file: 'saxpy comparison (user-space example)',
            code: `/* CPU thinking: one thread, process in order, rely on cache & pipeline */
void saxpy_cpu(int n, float a, const float *x, float *y)
{
    for (int i = 0; i < n; i++)     /* one i at a time */
        y[i] = a * x[i] + y[i];
}

/* GPU thinking: spawn one work-item per i, unroll them all at once */
__global__ void saxpy_gpu(int n, float a,
                          const float *x, float *y)
{
    int i = blockIdx.x * blockDim.x + threadIdx.x;
    if (i < n)
        y[i] = a * x[i] + y[i];     /* tens of thousands of i in parallel */
}
/* Launch: saxpy_gpu<<<(n+255)/256, 256>>>(n, a, x, y);
 * with n=1M → 4096 workgroups → 30k+ wave32s,
 * the 128 SIMDs of an RX 7600 XT digest them in turns */`,
            explanation:
              'Notice the GPU version has no loop — the loop has been "unrolled" into tens of thousands of work-items, and the hardware takes care of packing them into wavefronts and stuffing them into SIMDs. The CPU version\'s performance depends on cache hits and single-core frequency; the GPU version\'s depends on whether enough waves are in flight and whether memory accesses coalesce. This "turn the loop into an index" transformation is the opening move of all GPU programming.',
          },
          miniLab: {
            title: 'Do the Math: How Many Orders of Magnitude Between Your CPU and a GPU',
            objective: 'Build an intuition for "throughput vs latency" with real numbers.',
            steps: [
              'On any Linux machine run lscpu and note the core count, thread count, and L3 cache size',
              'Open the official ROCm spec table (rocm.docs.amd.com → GPU hardware specifications), find the RX 7600 XT row, and note the CU count (32)',
              'Compute the ALU lane count: 32 CU × 64 lanes/CU = 2048 lanes; take the ratio against your CPU thread count',
              "Now compare caches: your CPU's L3 (typically 16-64 MiB) vs the RX 7600 XT's L2 (2 MiB) — the GPU cache is smaller, but its total VGPR = 16 WGP × 512 KiB = 8 MiB, larger than the L2",
              'Write four numbers into your study log: the lane ratio, the cache ratio, and your one-sentence answer to "why can a GPU get away with small caches"',
            ],
            expectedOutput:
              'Typical result: an 8-core/16-thread CPU vs a 2048-lane GPU ≈ 128× parallelism gap; CPU L3 32 MiB vs GPU L2 2 MiB. One-sentence conclusion: the GPU replaces the latency-fighting role of big caches with "register residency + wave switching".',
            hint: "Can't find the spec table? Use lspci -nn first to confirm whether your machine has an AMD GPU; not having one doesn't matter for this lesson — every number can be looked up in the official table.",
          },
          debugExercise: {
            title: 'Why Is This GPU Program Slower Than the CPU?',
            language: 'cpp',
            question: 'A colleague "ported" CPU code to the GPU and it ended up 10x slower than single-threaded CPU. Point out the two fatal problems.',
            buggyCode: `/* Goal: compute y[i] = a*x[i] + y[i] for 1 million elements */
__global__ void saxpy_slow(int n, float a,
                           const float *x, float *y)
{
    /* "The GPU has 32 CUs, so let's launch 32 threads!" */
    int tid = threadIdx.x;            /* 0..31 */
    int chunk = n / 32;
    for (int i = tid * chunk; i < (tid + 1) * chunk; i++)
        y[i] = a * x[i] + y[i];
}
/* Launch config: saxpy_slow<<<1, 32>>>(n, a, x, y); */`,
            hint: 'Count how many wavefronts this launch configuration produces in total. How many CUs can they spread across? Is each thread\'s access pattern contiguous?',
            answer:
              'Problem one: a parallelism disaster. <<<1, 32>>> creates only 1 workgroup with 32 work-items total = 1 wave32. A workgroup can only land on one WGP, so of the 32 CUs on the whole GPU only half of one is working — and with only 1 wave, no memory wait can ever be hidden by switching; the latency is fully exposed. Problem two: memory accesses cannot coalesce. Each thread processes a contiguous chunk (thread 0 touches [0, 31250), thread 1 touches [31250, ...)), so in any given beat the 32 lanes of the wave access addresses 31250×4 bytes apart — the hardware cannot merge them into one wide load, and every lane becomes an independent memory transaction. The correct form: i = blockIdx.x*blockDim.x + threadIdx.x, so adjacent lanes touch adjacent addresses, and launch (n+255)/256 ≈ 4096 workgroups to feed all CUs. Lesson: the first instinct of GPU programming is "threads in overabundance, and adjacent threads touching adjacent data".',
          },
          interviewQ: {
            question: 'Why can a GPU have much smaller caches than a CPU without hurting its role? What does a GPU rely on to fight memory latency?',
            difficulty: 'easy',
            hint: 'The answer is the title of this lesson: latency hiding on a throughput machine.',
            answer:
              'A CPU uses caches to bring latency down; a GPU uses parallelism to hide it. The GPU hosts multiple wavefronts on each SIMD (RDNA3 has 16 wave slots per SIMD32); when one wave waits on memory, the hardware switches to a ready wave at zero cost. As long as enough waves are in flight, the ALUs always have work and memory latency never shows up in total throughput. The mechanism is backed by an enormous register file (each wave\'s context stays resident — never swapped in and out). So the goal of GPU caches is not "avoid memory accesses" but "save bandwidth" (coalescing, filtering duplicate requests) — which is exactly why Infinity Cache exists: bandwidth is more expensive than latency.',
            amdContext: 'In AMD interviews this question often appears as "why does occupancy matter" or "what happens if you use too many registers" — probing the same causal chain: register pressure → fewer resident waves → latency hiding fails → throughput collapses.',
          },
        },
        // ── Lesson 1.5.1.2 ────────────────────────────────────
        {
          id: '15-1-2',
          number: '1.5.1.2',
          title: 'Anatomy of an AMD GPU: IP Blocks as the Driver Sees Them',
          titleEn: 'Anatomy of an AMD GPU: IP Blocks',
          duration: 20,
          difficulty: 'beginner',
          tags: ['IP-block', 'GC', 'SDMA', 'VCN', 'amdgpu'],
          concept: {
            summary:
              'An AMD GPU is not a monolithic slab but a set of versioned, mix-and-match functional modules (IP blocks): GC does graphics and compute, SDMA does data movement, VCN does video encode/decode, DCN does display, PSP does firmware security, SMU does power and clocks. The amdgpu driver source is organized along exactly this structure — understand IP blocks and you hold the map for reading the driver code.',
            explanation: [
              'Open drivers/gpu/drm/amd/amdgpu/ and you will see hundreds of files, but the naming is extremely regular: gfx_v11_0.c, sdma_v6_0.c, vcn_v4_0.c, psp_v13_0.c... each file corresponds to "some version of some IP block". IP (Intellectual Property) block is chip-design industry parlance: a reusable functional unit design. AMD splits the GPU into a dozen or so IPs, each evolving its version independently; a concrete chip is "a combination of specific IP versions".',
              'Meet the main members once: GC (Graphics & Compute — contains all the CUs, the command processors, and the caches; 80% of this course lives here); SDMA (System DMA — the dedicated engine for moving data and updating GPU page tables; the driver relies on it for paging and migration); VCN (video encode/decode); DCN (the display controller driving DP/HDMI; the enormous display/ directory belongs to it); GMC/VM hub (memory controller and address translation); IH (interrupt hub); PSP (the security processor that verifies and loads the firmware of all other IPs — PSP wakes first at power-on); SMU (the housekeeper of clocks, voltages, and fans).',
              'A modern AMD GPU carries an IP discovery table in its VBIOS listing which IPs this chip has and at which versions. At init the driver reads the table and mounts the matching implementation for each version number (amdgpu_discovery.c). This is the mechanism that lets a single amdgpu driver support a dozen generations from Vega to RDNA4: when a new chip arrives, code for the many IPs whose versions did not change is reused directly.',
              'Memorize one conversion rule: what LLVM/ROCm calls gfx1102 equals what the kernel calls GC 11.0.2 (IP_VERSION(11, 0, 2)) equals what marketing calls the RX 7600 XT (Navi33). Three naming systems point at the same thing, all three are used interchangeably on the driver mailing lists, and you must react to any of them instantly.',
            ],
            keyPoints: [
              'GPU = a set of versioned IP blocks; amdgpu source file name = IP name + version number.',
              "GC is the graphics+compute body; SDMA is the driver's mover; PSP boots before everything else (firmware trust chain).",
              'IP discovery: the VBIOS ships its own "configuration manifest" and the driver assembles from the table — the secret of one driver swallowing a dozen GPU generations.',
              'gfx1102 = GC 11.0.2 = Navi33 = RX 7600 XT — you must be able to translate among the three naming systems.',
              'Before reading driver code, first ask "which IP does this belong to" — an order of magnitude more efficient than rummaging through folders.',
            ],
          },
          diagram: {
            title: 'IP Blocks Inside an ASIC and Their Driver Files',
            svgId: 'amd-gpu-ip-blocks',
            content: `┌─────────────── AMD GPU ASIC ───────────────┐
│ ┌────────────────────┐ ┌─────────────────┐ │
│ │ GC graphics+compute│ │ GMC/VM memory   │ │
│ │ (CU/CP/caches)     │ │ controller      │ │──VRAM
│ ├─────────┬──────────┤ ├────────┬────────┤  │
│ │ SDMA    │ VCN video│ │ IH irq │ SMU pwr │ │
│ ├─────────┼──────────┤ └────────┴────────┘  │
│ │ DCN disp│ PSP sec  │                      │
│ └─────────┴──────────┘                      │
└────────────────┬────────────────────────────┘
              PCIe ↔ CPU
Driver mapping: gfx_v11_0.c / sdma_v6_0.c / vcn_v4_0.c ...`,
            caption: 'Every block on the left has a matching <ip>_v<version>.c file family in amdgpu. GC is the protagonist of this course; SDMA/GMC return in the memory lessons; DCN is a world of its own.',
          },
          codeWalk: {
            title: 'IP Discovery: How the Driver Knows What Is in the Chip',
            language: 'c',
            file: 'drivers/gpu/drm/amd/amdgpu/amdgpu_discovery.c (excerpt, simplified)',
            code: `/* Each IP block version registers an ip_block_version:
 * the whole GC 11.0.x family shares the gfx_v11_0 implementation */
static int amdgpu_discovery_set_gc_ip_blocks(
        struct amdgpu_device *adev)
{
	switch (amdgpu_ip_version(adev, GC_HWIP, 0)) {
	case IP_VERSION(11, 0, 0):   /* Navi31 */
	case IP_VERSION(11, 0, 1):
	case IP_VERSION(11, 0, 2):   /* Navi33 = gfx1102 */
	case IP_VERSION(11, 0, 3):
		amdgpu_device_ip_block_add(adev,
				&gfx_v11_0_ip_block);
		break;
	case IP_VERSION(12, 0, 0):   /* RDNA4 */
	case IP_VERSION(12, 0, 1):
		amdgpu_device_ip_block_add(adev,
				&gfx_v12_0_ip_block);
		break;
	}
	return 0;
}
/* All IP version numbers come from the VBIOS discovery table;
 * boot log: dmesg | grep "amdgpu.*HWIP" shows them */`,
            explanation:
              'Notice the switch keys on the IP version, not the chip name — the three chips Navi31/32/33 share one gfx_v11_0 codebase, with only a few cases tweaking by minor version. This is amdgpu\'s most important code-organization convention: branch on IP version whenever possible, never on chip name. The C/C++ reinforcement lessons will return to this function to see how ops structs implement "one interface, many hardware generations".',
          },
          miniLab: {
            title: 'Without Installing Anything, Draw the IP List of Your (or the Example) GPU',
            objective: "Learn both paths — dmesg or source code — for reading out a GPU's IP composition.",
            steps: [
              'On a machine with an AMD GPU: run sudo dmesg | grep -iE "amdgpu.*(hwip|ip block|fw)" and find the version lines for GC/SDMA/VCN/PSP/SMU',
              'No hardware: open elixir.bootlin.com, go to drivers/gpu/drm/amd/amdgpu/, and reverse-engineer from file names — ls which versions of gfx_v*.c, sdma_v*.c, vcn_v*.c exist',
              'Search amdgpu_discovery.c for IP_VERSION(11, 0, 2) and count how many set_xxx_ip_blocks functions Navi33 appears in',
              'Draw an IP table for your GPU: IP name | version | source file | one-sentence responsibility',
              'Write the thought question into your log: why must PSP initialize first? (Hint: who verifies and loads the firmware of the other IPs?)',
            ],
            expectedOutput:
              "Typical list for the RX 7600 XT: GC 11.0.2 (gfx_v11_0.c), SDMA 6.0.2 (sdma_v6_0.c), VCN 4.0.4, DCN 3.1.4, PSP 13.0.8, SMU 13.0.8, GMC 11.0.2, IH 6.0.2. Thought-question answer: every IP's firmware is verified and loaded by PSP, so PSP is the root of the trust chain and must come up first.",
            hint: 'Not sure which dmesg lines carry IP versions? Look for lines like "detected ip block number ..." or the firmware version printouts of each IP.',
          },
          debugExercise: {
            title: 'Why Does the Driver Collapse Across the Board When a New GPU Is Plugged In?',
            language: 'c',
            question: 'Someone added new-chip support to the driver like this. Upstream review would reject it outright — why?',
            buggyCode: `/* Trying to enable GFX11 for a new Navi3x variant */
static int broken_set_gc_ip(struct amdgpu_device *adev)
{
	/* "They're all Navi3x anyway, keying on chip name is intuitive" */
	if (adev->asic_type == CHIP_NAVI33 ||
	    adev->flags & AMD_IS_APU) {
		amdgpu_device_ip_block_add(adev,
				&gfx_v11_0_ip_block);
	} else {
		/* treat everything else as the old architecture */
		amdgpu_device_ip_block_add(adev,
				&gfx_v10_0_ip_block);
	}
	return 0;
}`,
            hint: 'Are all APUs GFX11? What happens to this code when the next Navi3x variant ships? Compare against the switch predicate in the correct version.',
            answer:
              'Two fundamental errors. First, the predicate uses the wrong dimension: asic_type (chip name) and IP version are not one-to-one — machines flagged AMD_IS_APU include both old GFX9 APUs and GFX11.5 Strix; shoving them all into gfx_v11_0 will hit illegal registers on the old APUs. Second, the else fallback is a time bomb: any unlisted new chip (say, the later RDNA4) gets silently initialized as GFX10, showing up as a cascade of firmware load failures at boot or outright page faults — extremely hard to trace. The correct approach is exactly the previous codeWalk: switch (amdgpu_ip_version(adev, GC_HWIP, 0)), enumerate by IP version, and for unknown versions explicitly return -EINVAL so probing fails with a log message. Lesson: in the amdgpu world, "which chip is this" is almost always the wrong question; "which version of which IP is this" is the right one.',
          },
          interviewQ: {
            question: 'Why can a single amdgpu driver support every GPU from Vega to RDNA4? Explain the IP discovery mechanism.',
            difficulty: 'medium',
            hint: 'Keywords: versioned IP blocks, the discovery table in VBIOS, selecting implementations by version.',
            answer:
              'AMD designs its GPUs as a set of independently versioned IP blocks (GC, SDMA, VCN, DCN, PSP, SMU, ...); a chip = a combination of IP versions. The VBIOS embeds an IP discovery table; at init the driver reads each IP\'s version number for this chip, and amdgpu_discovery.c registers the matching implementation (e.g., gfx_v11_0) into the device\'s ip_block list by version, after which all blocks are driven through the uniform sw_init→hw_init→late_init lifecycle. If most IP versions are unchanged on a new chip, only the changed IPs need new cases or new files and everything else is reused — far cheaper to maintain than "one driver per GPU generation". Bonus points: this mechanism also explains the IP version printouts in the kernel log, and why upstream review rejects behavior branches keyed on chip names.',
            amdContext: 'A high-frequency interview question for amdgpu new hires, usually followed by "what happens if one IP\'s hw_init fails" (roll back the already-initialized IPs in order) — note that Module 5 works through this hands-on.',
          },
        },
      ],
    },
    // ════════════════════════════════════════════════════════════
    // Group 1.5.2: Execution Model
    // ════════════════════════════════════════════════════════════
    {
      id: '15-2',
      number: '1.5.2',
      title: 'Execution Model: Waves, CUs & WGPs',
      titleEn: 'Execution Model: Waves, CUs & WGPs',
      icon: 'Layers',
      description: 'The core zone of AMD GPU terminology. Four lessons build the complete execution model: the software hierarchy (work-item→grid), the hardware hierarchy (SIMD→WGP), the relationship between resources and parallelism (occupancy), and finally one HIP kernel that strings all the concepts together.',
      lessons: [
        // ── Lesson 1.5.2.1 ────────────────────────────────────
        {
          id: '15-2-1',
          number: '1.5.2.1',
          title: 'work-item, wavefront, workgroup, grid',
          titleEn: 'Work-items, Wavefronts, Workgroups, Grids',
          duration: 20,
          difficulty: 'beginner',
          tags: ['wavefront', 'wave32', 'workgroup', 'EXEC-mask'],
          concept: {
            summary:
              "The software hierarchy's big four: a work-item is one logical thread; a wavefront is the hardware's real scheduling unit — 32 or 64 work-items executing one shared instruction stream in lockstep; a workgroup is a set of waves that can share LDS and synchronize at barriers; a grid is everything launched by one kernel. AMD's wavefront is NVIDIA's warp.",
            explanation: [
              'When you write a kernel you take the viewpoint of a single work-item ("my thread computes c[i]"), but the hardware never executes one work-item alone. It bundles 32 (RDNA) or 64 (GCN/CDNA) work-items into a wavefront sharing one program counter: in a given beat, all lanes of the wave execute the same instruction, just on their own data — this is SIMT (Single Instruction, Multiple Threads).',
              'What about branches? When some lanes of a wave take the if and others take the else, the hardware executes each path in turn using the EXEC mask: it first disables the else-group lanes and runs the if branch, then inverts the mask and runs the else branch. The times of the two branches add up — this is branch divergence. GPU code should keep threads within the same wave on the same path as much as possible. The EXEC mask is one of the most important registers in the RDNA ISA; you will run into it in any piece of AMD assembly.',
              'Wave size is the watershed between AMD\'s two product lines: the GCN era was fixed wave64 (issued over a SIMD16 in 4 beats); RDNA widened the SIMD to 32 lanes, running native wave32 at one instruction per beat while keeping a wave64 mode (one instruction automatically split into two beats). Note this is "choose one per shader", not "choose one per product generation" — on RDNA the compiler picks the mode by shader type and register pressure; pixel shaders often use wave64, compute often uses wave32. CDNA is always wave64. If you write toolchain or kernel trap-handling code, you must support both.',
              'The essence of a workgroup is "the boundary of shared resources": waves in the same group can exchange data through LDS and align progress with s_barrier, so the whole workgroup must land on the same WGP (where the LDS lives — next lesson takes it apart). The cap is 1024 work-items. The grid carries no sharing semantics — between workgroups there is no ordering guarantee and no concurrency guarantee. That is the root of the GPU programming model\'s scalability: the hardware scatters groups however it likes.',
            ],
            keyPoints: [
              "wavefront = AMD's warp: 32/64 work-items sharing an instruction stream in lockstep.",
              'RDNA: native wave32 plus a two-beat wave64 mode, chosen per shader; GCN/CDNA: fixed wave64 — "RDNA=wave32" is an incomplete statement.',
              'Branch divergence is implemented via the EXEC mask, at the cost of the two branches executing serially.',
              'workgroup = the LDS + barrier sharing boundary, ≤1024 work-items, scheduled whole into one WGP.',
              'No ordering guarantees between workgroups — the root of GPU scalability, and the source of many concurrency bugs.',
            ],
          },
          diagram: {
            title: 'The Four-Level Hierarchy and the EXEC Mask',
            svgId: 'thread-hierarchy',
            content: `grid ─▶ workgroup(≤1024) ─▶ wavefront(32/64) ─▶ work-item
                │                  │
        shares LDS+barrier   shares instr stream (lockstep)
EXEC mask: [11111111 11110000 00001111 11111111]
            ↑ some lanes disabled during divergence`,
            caption: 'Zooming in level by level, left→right. The bottom row is the 32 lanes of a wave32: lanes whose EXEC bit is 0 "run along" this beat without writing results. The table maps the AMD/HIP/hardware naming systems onto each other.',
          },
          codeWalk: {
            title: 'A Piece of Real RDNA3 Assembly: Seeing Waves and EXEC',
            language: 'asm',
            file: 'vecAdd compiler output (RDNA3, simplified comments)',
            code: `; core of c[i] = a[i] + b[i] (hipcc --offload-arch=gfx1102)
; s_ prefix = scalar instr (one per wave), v_ = vector (one per lane)
        s_load_b128  s[0:3], s[4:5], 0x0   ; load a,b pointers (shared by whole wave)
        s_load_b64   s[6:7], s[4:5], 0x10  ; load c pointer
        v_lshlrev_b32 v1, 2, v0            ; per lane: offset = i*4
        s_waitcnt    lgkmcnt(0)            ; wait for scalar loads
        global_load_b32 v2, v1, s[0:1]     ; 32 lanes issue one coalesced load
        global_load_b32 v3, v1, s[2:3]
        s_waitcnt    vmcnt(0)              ; wait for VRAM data to return
        v_add_f32    v2, v2, v3            ; 32 adds complete simultaneously
        global_store_b32 v1, v2, s[6:7]
        s_endpgm
; if(i<n) compiles to: v_cmp_lt → s_and_saveexec_b32
;   = write the comparison into EXEC, out-of-range lanes get disabled`,
            explanation:
              'The s_/v_ division of labor is the first visual signature of the AMD ISA: values identical across the whole wave — pointers, loop counters — go in scalar registers (one copy), while per-lane values go in vector registers (32 copies). s_waitcnt exposes another truth: memory access is asynchronous, and the compiler inserts waits before data is used — this is what "latency hiding" looks like at the instruction level. Want to see it live? Pick the HIP language on Compiler Explorer and reproduce it.',
          },
          miniLab: {
            title: 'Compile Your First Piece of GPU Assembly in the Browser',
            objective: 'Without installing any tools, see the wave32/wave64 compilation difference with your own eyes.',
            steps: [
              'Open godbolt.org, choose HIP as the language and a recent clang (HIP/AMDGPU) as the compiler',
              'Paste a minimal kernel: __global__ void k(float*a){ int i=threadIdx.x+blockIdx.x*blockDim.x; a[i]*=2.f; }',
              'Set the compile flags to --offload-arch=gfx1102 -O3 and find v_, s_, global_load/store, and s_endpgm in the output',
              'Add -mwavefrontsize64 and compile again; compare: notice EXEC-related instructions change from _b32 to _b64 (e.g., s_and_saveexec_b64)',
              'Screenshot/copy the line that reveals the wave mode from both outputs into your study log',
            ],
            expectedOutput:
              'The two versions are nearly identical in body, but the wave64 build uses 64-bit forms for EXEC/mask operations (s_..._b64, v_cmp results occupying an SGPR pair). Write one sentence: wave mode is a compile-time choice; the same hardware runs both.',
            hint: "Can't find the HIP language entry? Choose C++ with clang trunk and add -x hip --offload-arch=gfx1102 -nogpulib -S — that produces the assembly too.",
          },
          debugExercise: {
            title: 'This Kernel Computes Wrong on the MI300 but Right on the RX 7600 XT',
            language: 'cpp',
            question: 'The same reduction code gives correct results on a consumer card but wrong results on an Instinct. Find the hidden assumption.',
            buggyCode: `__global__ void reduce_sum(float *data, float *out)
{
    __shared__ float buf[256];
    int t = threadIdx.x;
    buf[t] = data[blockIdx.x * 256 + t];
    __syncthreads();
    for (int s = 128; s > 32; s >>= 1) {
        if (t < s) buf[t] += buf[t + s];
        __syncthreads();
    }
    /* "The last 32 threads are in the same wave,
        naturally synchronized, no barrier needed" */
    if (t < 32) {
        buf[t] += buf[t + 32];
        buf[t] += buf[t + 16];
        buf[t] += buf[t + 8];
        buf[t] += buf[t + 4];
        buf[t] += buf[t + 2];
        buf[t] += buf[t + 1];
    }
    if (t == 0) *out = buf[0];
}`,
            hint: 'On which hardware does "32 threads are naturally synchronized" hold? How big is a wave on the MI300?',
            answer:
              'The code assumes the wave size is 32: once s<=32 it drops __syncthreads(), betting that "these 32 threads belong to one wave and run in lockstep, so no synchronization is needed". On an RDNA consumer card the kernel compiles as wave32 and the bet pays off; the MI300 is CDNA with fixed wave64 — the threads with t<32 and those with t in 32..63 are indeed in the same wave, but in the previous loop iteration with s=64, the writes under if(t<64) are spread across the whole wave64, and the mask-batched write/read ordering carries no cross-iteration guarantee; the barrier-dropping reasoning only holds for "lockstep within a wave", and the boundary sits at 64, not 32 — threads read stale data and the result is wrong. Correct approaches: never hard-code 32; use the compiler builtin warpSize (32 or 64 at runtime in HIP), or simply keep __syncthreads() throughout; where performance matters use __builtin_amdgcn_wave_barrier/wave-level reduction intrinsics. Lesson: any hard-coded 32/64 wave assumption is a portability bomb — this is exactly the discipline the RDNA/CDNA dual-line reality imposes on all AMD software.',
          },
          interviewQ: {
            question: 'What is branch divergence? What role does the EXEC mask play in it? Give one practical technique for reducing divergence cost.',
            difficulty: 'medium',
            hint: 'From "a wave shares one PC" derive "two branches can only run serially"; EXEC decides who writes results.',
            answer:
              'A wavefront has only one program counter. When threads inside a wave branch different ways on a condition, the hardware can only execute both paths in sequence: first set the EXEC mask to "lanes taking the if" and run the if path (disabled lanes do not write results), then invert the mask and run the else path, finally rejoin and restore the mask. Total time ≈ the sum of both paths — that is the divergence cost. Example mitigations: reorder data/threads by condition (so threads in the same wave share the condition, e.g., bucket by material before dispatch), rewrite branches as branchless select/mask operations (v_cndmask), or align work partitioning to wave boundaries (homogeneous tasks in groups of 32/64). Bonus point: divergence only affects the inside of a wave; different waves taking different branches costs nothing — so the granularity of "divergence optimization" is always the wave size.',
            amdContext: 'Both the AMD shader compiler team and the performance team love this question; the driver-team variant is "why must the trap handler save/restore EXEC" — because it is part of the wave execution state.',
          },
        },
        // ── Lesson 1.5.2.2 ────────────────────────────────────
        {
          id: '15-2-2',
          number: '1.5.2.2',
          title: 'CU & WGP: SIMD32, the Scalar Unit, and Registers',
          titleEn: 'CU & WGP: SIMD32, Scalar Unit, Registers',
          duration: 20,
          difficulty: 'intermediate',
          tags: ['CU', 'WGP', 'SIMD32', 'SGPR', 'VGPR'],
          concept: {
            summary:
              'The CU (Compute Unit) is the "core" of an AMD GPU: 2 SIMD32 vector units + a scalar unit + L0 caches. RDNA groups two CUs into a WGP sharing 128 KiB of LDS and the instruction cache. SGPRs hold "one per wave" values, VGPRs hold "one per lane" values — this division of labor is the soul of the AMD ISA.',
            explanation: [
              'Walk the hardware hierarchy top-down once more: the whole GPU divides into several Shader Engines (SE, carrying geometry/rasterization and other graphics hardware), each SE contains 2 Shader Arrays (SA, called SH in kernel code), and WGPs line up inside the SA. RX 7600 XT: 2 SE × 2 SA × 4 WGP = 16 WGP = 32 CU. The flagship Navi31 is 6 SE × 2 SA × 4 WGP = 96 CU. The "2048 stream processors" on the marketing page is just 32 CU × 64 lanes — when counting "cores", count CUs.',
              'Drill into one CU: two SIMD32s, each with a large VGPR file (on Navi33, 1024 32-bit×32-lane registers per SIMD = 128 KiB; Navi31/32 enlarge that to 1536); one scalar unit (SALU) with SGPRs handling work shared by the whole wave — address computation, loop control, condition masks; and one L0 vector data cache (32 KiB). A wave is assigned to a wave slot on some SIMD and stays resident there (RDNA2/3: 16 slots per SIMD); its VGPR/SGPR allocation is likewise pinned to that SIMD until retirement.',
              'The WGP (Workgroup Processor) is RDNA\'s new organization: 2 CUs bundled together, sharing 128 KiB of LDS, the L0 instruction cache, and the scalar cache. Why design it this way? Because the workgroup\'s sharing semantics (LDS + barrier) need a hardware "home", and building that home on top of 2 CUs means one workgroup\'s waves can spread across 4 SIMD32s and advance in parallel. CDNA has no WGP — it keeps the GCN layout: 4 SIMD16s per CU + that CU\'s own 64 KiB LDS (CDNA4 mentions 160 KiB). So a question like "how big is the LDS" must always start with "which architecture line".',
              'One more high-frequency trap at this level: kernel code uses GCN-era names throughout. SH = Shader Array; active_cu_number counts CUs; TCP (Texture Cache per Pipe) actually refers to the L0 data cache path; even the LLVM triple is called amdgcn. Code running on RDNA4 speaks a 2012 dialect — when reading the driver, do not try to map these names one-to-one onto marketing diagrams; check the kernel\'s own amdgpu-glossary first.',
            ],
            keyPoints: [
              'Hierarchy: GPU → SE → SA (SH in the kernel) → WGP → CU → SIMD32 → lane; RX 7600 XT = 2/2/4 = 32 CU.',
              'CU = 2×SIMD32 + SALU + L0; waves reside in SIMD wave slots (16 per SIMD on RDNA2/3).',
              'SGPR: one copy per wave (pointers/conditions/loops); VGPR: one copy per lane (data) — hence the s_/v_ instruction prefixes.',
              'WGP = 2 CUs sharing 128 KiB LDS + instruction cache, the hardware "home" of a workgroup; CDNA has no WGP (each CU carries 64 KiB LDS).',
              'Kernel code speaks the GCN dialect: SH, TCP, active_cu_number, amdgcn — old names, new hardware.',
            ],
          },
          diagram: {
            title: 'Drilling from the Whole Chip into a WGP',
            svgId: 'wgp-cu-internals',
            content: `GPU → SE ×2 → SA ×2 → WGP ×4        (RX 7600 XT)
┌──────────────── WGP ────────────────┐
│ ┌── CU0 ──────────┐ ┌── CU1 ───────┐ │
│ │ SIMD32 + VGPR   │ │ SIMD32 + VGPR ││
│ │ SIMD32 + VGPR   │ │ SIMD32 + VGPR ││
│ │ SALU + SGPR     │ │ SALU + SGPR   ││
│ │ L0 data $ 32K   │ │ L0 data $     ││
│ └─────────────────┘ └───────────────┘│
│   shared: LDS 128 KiB + L0 I-cache   │
└──────────────────────────────────────┘`,
            caption: 'Breadcrumb at the top: this figure zooms into one WGP. The 8 waves of one workgroup can spread across these 4 SIMD32s; LDS being shared at WGP level explains why "a workgroup cannot straddle WGPs".',
          },
          codeWalk: {
            title: 'How the Driver Counts CUs: gfx_config and sysfs',
            language: 'c',
            file: 'drivers/gpu/drm/amd/amdgpu/amdgpu_gfx.c (excerpt, simplified)',
            code: `/* At init the driver reads the CU topology from registers and caches it: */
struct amdgpu_gfx_config {
	unsigned max_shader_engines;      /* SE count: Navi33=2  */
	unsigned max_sh_per_se;           /* SAs per SE: 2       */
	unsigned max_cu_per_sh;           /* CUs per SA: 8       */
	/* bitmap of CUs actually usable after harvest: */
	uint32_t cu_bitmap[4][4];
};

/* The CU count user space sees comes from here: */
static ssize_t amdgpu_get_cu_number(...)
{
	return sysfs_emit(buf, "%d\\n",
		adev->gfx.cu_info.number);
	/* $ cat /sys/class/drm/card0/device/... */
}
/* Note: the word "WGP" never appears ——
 * the kernel counts CUs in GCN terms; for RDNA, WGP=CU/2, do the math yourself */`,
            explanation:
              'cu_bitmap exposes an industrial fact: the same die may have some CUs fused off for yield (harvest) — that is exactly how the RX 7600 and 7600 XT are split apart. The driver must read the bitmap instead of hard-coding a table. Another observation: the struct field name max_sh_per_se — SH is Shader Array; the GCN dialect, confirmed.',
          },
          miniLab: {
            title: 'Topology Mental Math for Three GPUs + a Measured Cross-Check',
            objective: 'Turn the SE/SA/WGP/CU hierarchy into muscle memory.',
            steps: [
              'Open the ROCm gpu-arch-specs table and copy the CU counts of three cards: RX 7600 XT (32), RX 7900 XTX (96), MI300X (304)',
              'Mental-math the WGP counts: divide the two RDNA cards by 2 (16, 48); the MI300X is CDNA — write "no WGP" and explain why',
              'On a machine with an AMD GPU: cat /sys/class/drm/card*/device/current_compute_partition 2>/dev/null; grep . /sys/class/drm/card*/device/*cu* 2>/dev/null, or measure the CU count with rocminfo | grep -i "compute unit"',
              'Cross-check whether dmesg | grep -i "se.*sh\\|cu_info" shows the SE/SA structure printouts',
              'Draw the full tree of your card (or the RX 7600 XT) in your log: SE→SA→WGP→CU→SIMD, labeling the count at every level',
            ],
            expectedOutput:
              'RX 7600 XT tree: 2 SE × 2 SA × 4 WGP × 2 CU × 2 SIMD32 = 128 SIMD32s. One line for the MI300X: CDNA3 has no WGP; 304 CUs spread across 8 XCD chiplets (38 CU/XCD).',
            hint: 'rocminfo requires ROCm; without it just use the tables — the training goal is the conversion, not the command.',
          },
          debugExercise: {
            title: 'Why Does This Workgroup Always Fail to Launch?',
            language: 'cpp',
            question: 'This kernel makes hipLaunchKernel error out immediately on RDNA3. Which resource is over budget?',
            buggyCode: `__global__ void big_tile(float *out)
{
    /* one workgroup wants to cache a 48KB×4 = 192KB tile */
    __shared__ float tileA[48 * 1024 / 4];
    __shared__ float tileB[48 * 1024 / 4];
    __shared__ float tileC[48 * 1024 / 4];
    __shared__ float tileD[48 * 1024 / 4];
    int t = threadIdx.x;
    /* ... 1024 threads cooperatively fill and compute ... */
    out[t] = tileA[t] + tileB[t] + tileC[t] + tileD[t];
}
/* Launch: big_tile<<<1024, 1024>>>(d_out); */`,
            hint: 'Which piece of hardware does __shared__ land on? Does that hardware belong to the CU or the WGP? How big is it in total?',
            answer:
              '__shared__ is LDS, and LDS is a WGP-level resource — a whole RDNA WGP has only 128 KiB. This kernel asks for 4 × 48 KiB = 192 KiB, more than any WGP can provide, so the hardware cannot schedule the workgroup and the launch fails outright (hipErrorLaunchOutOfResources or similar). Even squeezed under 128 KiB — say 96 KiB — there is a price: a WGP can host only 1 such workgroup at a time and occupancy drops to the floor (next lesson expands on this). Fixes: cut the tile smaller and process in batches (tiling + loop), or reassess which arrays truly need sharing — if tileC/tileD are only used by the local thread, make them registers/local variables. And remember the accounting difference: the same code is under a tighter limit on the MI300 (CDNA, 64 KiB per CU), so the LDS budget must be redone when porting across lines.',
          },
          interviewQ: {
            question: 'Why does the AMD ISA split registers into SGPRs and VGPRs? What does each hold? What does the design save?',
            difficulty: 'medium',
            hint: 'Think: within one wave, how much data is actually identical across the 32 lanes?',
            answer:
              'Many values inside a wave are identical for all lanes: base pointers, loop counters, uniform constants, aggregated branch conditions. If those also lived in vector registers, they would be replicated 32/64 times, wasting the most expensive on-chip resource. AMD puts them in SGPRs (one copy per wave, handled by the SALU) and keeps only genuinely per-lane data in VGPRs (one copy per lane, handled by the VALU). The payoff: VGPR pressure drops significantly (which converts directly into higher occupancy), scalar loads can go through a separate scalar cache, and shared work like address computation is done once. The cost is that the compiler must run a "scalarization analysis" to prove which values are wave-uniform. Bonus point: on RDNA the SGPRs are a fixed allocation and never limit occupancy — the real battlefield is VGPRs, which is why performance tuning looks at VGPR usage first.',
            amdContext: 'A must-ask for the compiler team (LLVM AMDGPU backend): the s_ vs v_ instruction choice is precisely the output of the backend\'s uniformity analysis. The driver team asks the operational version: how much wave state must be saved on a trap/exception.',
          },
        },
        // ── Lesson 1.5.2.3 ────────────────────────────────────
        {
          id: '15-2-3',
          number: '1.5.2.3',
          title: 'LDS & Occupancy: The Budget Sheet of Latency Hiding',
          titleEn: 'LDS & Occupancy: The Latency-Hiding Budget',
          duration: 20,
          difficulty: 'intermediate',
          tags: ['LDS', 'occupancy', 'VGPR', 'wave-slot'],
          concept: {
            summary:
              'occupancy = resident waves ÷ the wave slot cap; it is the direct measure of latency-hiding capability. Every wave occupies VGPRs and LDS — the more it uses, the fewer waves can be resident at once. On RDNA, SGPRs are a fixed allocation outside the competition; the deciding factors are VGPRs, LDS, and workgroup size.',
            explanation: [
              'Picture a SIMD32 as a dormitory with 16 beds (RDNA2/3 have 16 wave slots per SIMD; RDNA1 had 20). With the beds full, whenever one wave goes off to wait on VRAM the scheduler instantly finds another wave to issue for; with only two or three occupants, everyone waits together — ALUs idle, throughput collapses. Occupancy is the occupancy rate of the dorm.',
              "What sets the rate? Each wave checks in with three pieces of luggage: VGPRs (the big one), LDS (shared with its whole workgroup), and the wave slot itself. Work through GPUOpen's official example: a big RDNA3 core has 1536 VGPRs per SIMD; a shader using 128 VGPRs per wave → ⌊1536/128⌋ = 12 waves, an occupancy of 12/16 = 75%. Optimize register usage down to 96 → 16 waves, full house. LDS works the same in reverse: with a workgroup using 32 KiB of LDS, a WGP's 128 KiB only hosts 4 workgroups, and the waves they carry become the cap.",
              'Two misconceptions to break. Misconception one: "higher occupancy is always better" — wrong; it is a budget, not a score. A kernel with few memory accesses and dense ALU work can run flat-out at low occupancy; some kernels come out ahead by taking more registers (lower occupancy) in exchange for avoiding spills (scratch spilled to VRAM). Misconception two: "running out of registers gives an error" — it does not; the compiler silently spills variables to scratch memory and performance quietly sags. So step one of any performance analysis is always to make the compiler hand over its resource ledger (-Rpass-analysis=kernel-resource-usage).',
              'Connection points for your future driver work: the max_waves_per_cu reported by KFD/ROCm, the CU masks the driver programs into firmware, and the "which waves are stuck at which instruction" printouts from umr during GPU hang debugging are all built on this wave slot model. Lay the foundation now; Modules 8/9 use it directly.',
            ],
            keyPoints: [
              'occupancy = resident waves / slot cap (16 per SIMD on RDNA2/3); it measures the latency-hiding budget.',
              'Three limiting factors: VGPR usage, LDS usage, workgroup size; RDNA SGPRs are fixed-allocated and never limit occupancy.',
              'Official worked example: 1536 VGPR ÷ 128/wave = 12 waves = 75% (Navi33 has 1024 VGPRs per SIMD; same method).',
              'High occupancy ≠ high performance: it only matters when latency is the bottleneck; avoiding spills sometimes pays more than hosting extra waves.',
              'Register overuse never errors — it spills (scratch). Making the compiler print the resource report is diagnostic step one.',
            ],
          },
          diagram: {
            title: 'The Wave Slot Dormitory and the VGPR Budget',
            svgId: 'occupancy-waves',
            content: `16 wave slots of a SIMD32:
[w0][w1][w2][w3][w4][w5][w6][w7][w8][w9][w10][w11][··][··][··][··]
 └── 12 checked in (75%) ──┘          └── empty beds ──┘
Reason: VGPR budget 1536 ÷ 128 per wave = 12
Cut each wave to 96 → 16 waves → 100%`,
            caption: 'Left: the wave slot check-in chart. Right: VGPRs are the rent. Below: the timeline contrasting many waves (waits are switchable) vs few waves (collective standstill).',
          },
          codeWalk: {
            title: 'Making the Compiler Hand Over the Resource Ledger',
            language: 'bash',
            file: 'kernel-resource-usage report (hipcc output example)',
            code: `$ hipcc -O3 --offload-arch=gfx1102 \\
       -Rpass-analysis=kernel-resource-usage saxpy.cpp

saxpy.cpp:12:1: remark: Function Name: _Z5saxpyifPfS_
    SGPRs: 18                 # scalar registers (fixed quota, no worry)
    VGPRs: 10                 # ← the key number
    AGPRs: 0                  # CDNA matrix-accumulate registers
    ScratchSize [bytes/lane]: 0   # ← 0 = no spill, healthy
    Occupancy [waves/SIMD]: 16    # ← full house!
    LDS Size [bytes/block]: 0

# Cautionary example: report from some complex kernel
#   VGPRs: 196  → 1536/196 = 7 waves (44%)
#   ScratchSize: 288 → 288B per lane spilled to VRAM, danger sign`,
            explanation:
              'This report is the medical checkup sheet of GPU performance work: VGPRs set the occupancy ceiling, a non-zero ScratchSize means register spilling (a hidden 10x latency), and LDS Size feeds into the WGP-level budget. Build the habit: the moment a kernel is written, read its ledger before talking optimization. This output format comes from the ROCm official blog post "Register pressure".',
          },
          miniLab: {
            title: 'Hand-Compute + Machine-Verify the Occupancy of Three Kernels',
            objective: 'Independently perform an occupancy computation under the dual VGPR/LDS constraints.',
            steps: [
              'Hand computation (big RDNA3 core: 1536 VGPR/SIMD, 16 slots, 128 KiB LDS/WGP): A) 64 VGPR, 0 LDS; B) 200 VGPR, 0 LDS; C) 80 VGPR, workgroup of 256 threads using 64 KiB LDS',
              'A/B divide directly; C needs both lines: VGPR line ⌊1536/80⌋=19→capped at 16; LDS line 128/64=2 workgroups/WGP = 2×(256/32)=16 waves/WGP = 4 waves per SIMD — take the smaller',
              'On godbolt or local hipcc, add -Rpass-analysis=kernel-resource-usage to any kernel and check that your hand method matches the compiler report',
              'Halve the LDS in problem C (32 KiB) and redo it, to feel that "LDS is workgroup-level rent"',
              'Write your occupancy computation template into the log (two lines, take the min)',
            ],
            expectedOutput:
              'A: 16/16 full. B: ⌊1536/200⌋=7 waves ≈44%. C: VGPR line 16, LDS line 4 waves/SIMD — pinned by LDS at 25%; halving LDS doubles it to 8 waves/SIMD (50%). Template: occupancy = min(slot cap, VGPR budget line, LDS budget line, workgroup-size line).',
            hint: 'The conversion in C gets muddy easily: LDS limits "how many workgroups fit on the WGP"; multiply by waves per group (256/32=8), then divide by the 4 SIMDs in the WGP.',
          },
          debugExercise: {
            title: 'Adding a Cache Made It Three Times Slower',
            language: 'cpp',
            question: 'Someone added a "performance optimization" to a matrix kernel and throughput dropped to 1/3. The resource ledger is below — trace the causal chain.',
            buggyCode: `/* Before: simple version, report shows
 *   VGPRs: 48, LDS: 0, Occupancy: 16 waves/SIMD */

/* After the "optimization": each thread caches a whole row in a private array */
__global__ void matmul_opt(const float *A,
                           const float *B, float *C, int N)
{
    float rowA[128];               /* 512 bytes per thread */
    int r = blockIdx.y * blockDim.y + threadIdx.y;
    for (int k = 0; k < 128; k++)
        rowA[k] = A[r * N + k];    /* read it all in first */
    /* ... accumulate using rowA ... */
}
/* New report:
 *   VGPRs: 256, ScratchSize: 512,
 *   Occupancy: 4 waves/SIMD  */`,
            hint: 'Where do 128 floats want to live? How many VGPRs are there in total? Where does the part that does not fit go, and how slow is that place?',
            answer:
              'The causal chain: rowA[128] is per-lane private data, so the compiler can only place it in VGPRs — 128 floats require 128 VGPRs, which together with the existing overhead slams into the 256 cap, and still is not enough, so 512 bytes/lane spill to scratch (a private region in VRAM; the report\'s ScratchSize:512 is the evidence). Two punches land at once: occupancy falls from 16 to 4 (1536/256=6, pushed down to 4 by other factors) and the latency-hiding budget is gone; meanwhile every "cache hit" is actually a VRAM scratch access, slower than the global loads it was meant to replace. Fix: large private arrays are a GPU anti-pattern — use LDS so the whole workgroup shares one tile (4 bytes amortized per thread), or simply rely on L0/L2 for the repeated loads. Rule of thumb: ScratchSize > 0 in the report is almost always a bug-level signal.',
          },
          interviewQ: {
            question: 'What is occupancy? What factors determine it? Why is "100% occupancy" not an optimization goal?',
            difficulty: 'hard',
            hint: 'Definition (waves/slots) → the three limiting factors → it only matters when the kernel is latency-bound.',
            answer:
              'Occupancy is the ratio of waves actually resident per SIMD to the slot cap (16 on RDNA2/3), measuring the pool of candidate waves the scheduler can use to hide latency. Limiting factors: VGPR usage per wave (register file ÷ per-wave usage), workgroup LDS usage (the WGP\'s 128 KiB ÷ per-group usage, converted to waves), and the divisibility relationship between workgroup size and slot count; on RDNA the SGPRs are fixed-allocated and do not participate. It is a means, not a goal: if a kernel is arithmetic-dense or already saturating bandwidth, 4 waves and 16 waves give the same throughput; and squeezing registers to raise occupancy can cause spills — a net loss. The right posture: read the resource report and the profiler\'s stall reasons first (waiting on memory? on ALU?), and only optimize occupancy when "latency-bound + low occupancy" are simultaneously true.',
            amdContext: 'GPUOpen\'s "Occupancy explained" is AMD\'s official full-marks answer sheet for this question; citing its 1536/128=12 example in an interview scores serious points.',
          },
        },
        // ── Lesson 1.5.2.4 ────────────────────────────────────
        {
          id: '15-2-4',
          number: '1.5.2.4',
          title: 'Hands-on: The Complete Journey of a HIP Kernel',
          titleEn: 'Hands-on: A HIP Kernel End to End',
          duration: 25,
          difficulty: 'intermediate',
          tags: ['HIP', 'kernel-launch', 'coalescing', 'hands-on'],
          concept: {
            summary:
              'Assemble the previous three lessons into one causal chain: how the numbers in <<<grid, block>>> become waves on WGPs, how index math decides memory coalescing, and where all of it leaves observable traces in rocminfo/resource reports. This lesson is primarily hands-on.',
            explanation: [
              'Replay the full journey of vecAdd<<<4096, 256>>>. Compile time: hipcc compiles the kernel to gfx1102 ISA, picks wave32, and emits the resource ledger (VGPR/LDS usage). Launch time: the runtime writes "4096 workgroups, 256 threads each" into a dispatch command packet and submits it to the GPU (how the submission travels is the main thread of the next lesson group). Hardware scheduling time: each workgroup is assigned whole to some WGP with free capacity — 256 threads are cut into 8 wave32s, spread over the WGP\'s 4 SIMDs at 2 waves each; the 4096 groups rotate through all 16 WGPs of the card, first-finished first-replaced.',
              'The key to the execution phase is memory coalescing: i = blockIdx.x*blockDim.x + threadIdx.x guarantees the 32 lanes of one wave get consecutive i, so at global_load_b32 the 32 addresses form exactly one contiguous 128-byte span — the hardware merges them into one wide transaction. Write the index backwards (i = threadIdx.x*gridDim.x + blockIdx.x) and each lane\'s address sits 4096×4 bytes apart; one beat becomes 32 independent transactions and bandwidth utilization collapses to 1/32. This is the number-one class of GPU performance bugs.',
              'Boundary handling deserves a look too: when n is not a multiple of 256, some lanes in the last workgroup have i ≥ n, and if (i < n) compiles into EXEC-mask operations that switch them off. Without that if you get out-of-bounds writes — on a GPU these do not necessarily crash immediately; they may silently trample the neighboring buffer, and by the time it surfaces the scene is unrecognizable (a regular guest of the Module 6 debugging lessons).',
              'Finally, build the observability habit: rocminfo tells you the hardware parameters (CU count, wave size, LDS caps), the resource report tells you the kernel\'s resource footprint, and tools like rocprofv3 tell you the runtime behavior. A driver engineer needs this chain even more than an application engineer, because what you will have to explain someday is "why this dispatch never ran".',
            ],
            keyPoints: [
              '<<<4096, 256>>> → 8 wave32s per group → 2 per SIMD across the 4 SIMDs of one WGP.',
              'The workgroup is the scheduling atom: the whole group enters one WGP; no ordering between groups.',
              'Adjacent lanes touching adjacent addresses = coalesced access; a transposed index is the number-one performance killer.',
              'Tail overrun is fenced by if(i<n)→EXEC mask; omitting it may not crash but always plants a landmine.',
              'Three observability tools: rocminfo (hardware), resource report (compile time), profiler (runtime).',
            ],
          },
          diagram: {
            title: 'The Full Map from Launch Config to SIMDs',
            svgId: 'hip-kernel-mapping',
            content: `vecAdd<<<dim3(4096), dim3(256)>>>(a,b,c)
   grid: 4096 groups ──hw scatters──▶ 16 WGPs in rotation
   one group (256 threads) = 8 × wave32
        └──▶ 4 SIMD32s of the WGP, 2 waves each
Index: i = blockIdx.x*256 + threadIdx.x
   32 lanes in a wave → consecutive i → one coalesced 128B load`,
            caption: 'Code at top-left → hardware at the right, the complete mapping. The index formula at the bottom is the root of "coalesced access" — a figure worth revisiting again and again.',
          },
          codeWalk: {
            title: 'A Complete Runnable Program (with Timing and Verification)',
            language: 'cpp',
            file: 'vecadd_full.hip.cpp',
            code: `#include <hip/hip_runtime.h>
#include <cstdio>
#define CHECK(x) do { hipError_t e = (x); if (e) { \\
    printf("HIP err %s @%d\\n", hipGetErrorName(e), \\
           __LINE__); return 1; } } while (0)

__global__ void vecAdd(const float *a, const float *b,
                       float *c, int n)
{
    int i = blockIdx.x * blockDim.x + threadIdx.x;
    if (i < n) c[i] = a[i] + b[i];
}

int main()
{
    const int n = 1 << 24;                 /* 16M elements */
    float *a, *b, *c;
    CHECK(hipMallocManaged(&a, n * 4));
    CHECK(hipMallocManaged(&b, n * 4));
    CHECK(hipMallocManaged(&c, n * 4));
    for (int i = 0; i < n; i++) { a[i] = 1.f; b[i] = 2.f; }

    dim3 block(256), grid((n + 255) / 256);
    vecAdd<<<grid, block>>>(a, b, c, n);   /* async! */
    CHECK(hipGetLastError());              /* launch errors */
    CHECK(hipDeviceSynchronize());         /* wait for completion */

    for (int i = 0; i < n; i += n / 7)
        if (c[i] != 3.f) { printf("BAD @%d\\n", i); return 1; }
    printf("OK: %d elements, grid=%d block=%d\\n",
           n, grid.x, block.x);
}`,
            explanation:
              'Three details from the driver\'s viewpoint: kernel launches are asynchronous (<<<>>> returns immediately; catch errors with hipGetLastError); hipDeviceSynchronize is, underneath, waiting on a fence — the next lesson group watches it travel through the ioctl into the kernel; and hipMallocManaged\'s page-migration behavior foreshadows the KFD content of Module 8.',
          },
          miniLab: {
            title: 'Run It + Break It + Fix It',
            objective: 'Personally trigger the three problem classes covered in this lesson group and confirm the symptoms.',
            steps: [
              'With a supported ROCm environment: save the program above, hipcc vecadd_full.hip.cpp -o vecadd && ./vecadd, confirm it prints OK (note: the RX 7600 XT/gfx1102 is not on the official ROCm support list — see the compatibility notes on the Setup page); without an environment do the compile-time parts on godbolt (steps 3 and 4 as written)',
              'Experiment one (parallelism): change grid to dim3(1), rerun and time it (time ./vecadd) — feel the slowness of "using only one WGP"',
              'Experiment two (coalescing): change the index to int i = threadIdx.x * gridDim.x + blockIdx.x; observe the result is still "correct" but the time rises — the transposed index covers the same set yet destroys coalescing',
              'Experiment three (resources): recompile with -Rpass-analysis=kernel-resource-usage and record the VGPR count and the Occupancy line',
              'Write the comparison numbers of all three experiments into your log, each with a one-sentence explanation of the cause',
            ],
            expectedOutput:
              'Experiment one: tens of times slower (4096 groups queueing on one WGP); experiment two: several times slower (transaction count ×32); experiment three: typical values VGPR≈8-12, occupancy 16/16. The three sentences point to: insufficient parallelism, failed coalescing, no resource pressure.',
            hint: 'The result stays correct in experiment two because the threadIdx/blockIdx combination still covers [0,n) — performance bugs are so scary precisely because they are often "correct".',
          },
          debugExercise: {
            title: 'Why Is the Tail of the Array Always Garbage?',
            language: 'cpp',
            question: 'With n = 1000000 the program occasionally crashes, and when it does not, the last few dozen elements of c are garbage. Find the two bugs.',
            buggyCode: `__global__ void scale(float *c, const float *a, int n)
{
    int i = blockIdx.x * blockDim.x + threadIdx.x;
    c[i] = a[i] * 2.0f;          /* bug 1: no bounds check */
}

int main()
{
    int n = 1000000;
    /* ... allocate and initialize a, c ... */
    dim3 block(256);
    dim3 grid(n / 256);          /* bug 2: integer-division truncation */
    scale<<<grid, block>>>(c, a, n);
    hipDeviceSynchronize();
}`,
            hint: '1000000 / 256 = 3906 remainder 64. Where did the remainder go? And with no if(i<n), where do the overrunning lanes write?',
            answer:
              'Bug 2: grid = n/256 = 3906 (integer division truncates), covering only 3906×256 = 999936 elements — nobody ever computes the last 64 elements, so of course they read as garbage. The correct form rounds up: grid = (n+255)/256. Bug 1: after fixing bug 2, grid becomes 3907 and total threads 1000192 > n; without if (i < n) the extra 192 lanes write c[1000000..1000191] — an out-of-bounds write. On a GPU the consequences are random: allocator slack may swallow it ("occasionally does not crash"), or it may trample a neighboring BO and trigger a VM fault (the page fault in dmesg — Module 6 teaches you to recognize it). Together the two bugs are the classic GPU beginner combo: round-up division and the boundary if always come as a pair.',
          },
          interviewQ: {
            question: 'Explain memory coalescing. Why is i = blockIdx.x*blockDim.x + threadIdx.x the "correct" way to write the index?',
            difficulty: 'medium',
            hint: 'The protagonists are the 32 addresses issued in one beat by the 32 lanes of a wave.',
            answer:
              'When a memory instruction executes, each of the wave\'s 32 lanes supplies an address. If those 32 addresses fall in one contiguous, aligned span (e.g., 32 × 4B = 128B), the hardware merges them into a very small number of wide transactions; if they scatter, the access degenerates into up to 32 independent transactions and effective bandwidth divides by 32. The standard index gives lanes adjacent in threadIdx.x (i.e., adjacent lanes in the wave) adjacent i, hence adjacent addresses — naturally coalesced. The transposed form (threadIdx.x times a large stride) covers the same index set and is "correct", but each beat\'s 32 addresses sit thousands of bytes apart and performance collapses. Extension: arrays of structures (AoS) create inherent strided access, so GPU code often switches to structure of arrays (SoA); this is also the underlying reason for buffer layout design on the Vulkan/graphics side.',
            amdContext: 'An evergreen of AMD performance/driver interviews, usually with a code snippet for you to judge coalescing on the spot; proactively drawing the "lane → address" mapping diagram scores visibly.',
          },
        },
      ],
    },
    // ════════════════════════════════════════════════════════════
    // Group 1.5.3: Memory & Command Front-End
    // ════════════════════════════════════════════════════════════
    {
      id: '15-3',
      number: '1.5.3',
      title: 'Memory System & Command Front-End',
      titleEn: 'Memory System & Command Front-End',
      icon: 'Database',
      description: "The main battlefield of driver work. Two memory lessons (on-chip hierarchy; VRAM/GTT/GPUVM) + two command lessons (ring/PM4/IB; doorbell/queue scheduling) — finish these and you understand half of the amdgpu driver's reason to exist.",
      lessons: [
        // ── Lesson 1.5.3.1 ────────────────────────────────────
        {
          id: '15-3-1',
          number: '1.5.3.1',
          title: 'The Memory Hierarchy: From VGPR to Infinity Cache',
          titleEn: 'Memory Hierarchy: VGPR to Infinity Cache',
          duration: 20,
          difficulty: 'intermediate',
          tags: ['cache', 'Infinity-Cache', 'GDDR', 'HBM'],
          concept: {
            summary:
              'A memory request leaving a CU may hit, in order: L0 (per CU) → graphics L1 (per SA, removed in RDNA4) → L2 (chip-wide) → Infinity Cache (the large last-level cache) → VRAM. The mission of GPU caches is not to lower latency like on a CPU, but to save bandwidth — grasp that, and the appearance of Infinity Cache follows naturally.',
            explanation: [
              "Line up the RX 7600 XT's numbers and walk down the column: each SIMD's VGPRs (128 KiB×4 per WGP) are the fastest \"memory\" — zero latency, because they are the registers; LDS at 128 KiB/WGP is the programmer-managed shared scratchpad (~20-40 cycles); the L0 vector cache at 32 KiB/CU is the first true cache; L2 is the chip-wide shared 2 MiB (6 MiB on the flagship Navi31); below that sits the Infinity Cache introduced with RDNA2 — 32 MiB on Navi33, 96 MiB on Navi31, called MALL (Memory Attached Last Level) in AMD documents; and only then GDDR6 VRAM (Navi33: 128-bit @ 18 Gbps ≈ 288 GB/s).",
              'Infinity Cache solves an economics problem: VRAM bandwidth is expensive (a wider bus = more pins = costlier boards and power), and GPUs are bandwidth gluttons. Add a several-dozen-MiB on-chip last-level cache so hot data like framebuffers and frequently used textures stays on chip, effective bandwidth multiplies, and the bus width can be cut — Navi33 punches far above its raw bandwidth with a 128-bit bus precisely because of it. The data-center MI300X likewise carries 256 MiB of Infinity Cache alongside 5.3 TB/s of HBM3.',
              'GDDR vs HBM in one sentence: GDDR is "high-clock narrow lanes" — cheap, right for consumer cards; HBM is "stacked wide lanes" — several times the bandwidth at the same capacity but with expensive packaging, standard on the Instinct line. Bandwidth (not capacity) is usually what feeds a GPU — remembering that conclusion beats memorizing spec numbers.',
              'For the driver, the real subject is not capacity figures but coherence: which caches see CPU writes? When can the CPU read what the GPU wrote? The answers vary by generation and access path, which is why PM4 has a whole family of cache flush/invalidate packets (ACQUIRE_MEM, RELEASE_MEM) that the driver inserts at key points in the command stream. One classic class of bugs you will debug — "the data was definitely written but the other side reads a stale value" — is rooted here. Also note that RDNA4 removed the per-SA graphics L1: cache topology moves — never hard-code hierarchy assumptions.',
            ],
            keyPoints: [
              'The hierarchy chain: VGPR → LDS → L0 (per CU) → [L1 per SA, deleted in RDNA4] → L2 (chip-wide) → Infinity Cache → VRAM.',
              'GPU caches exist to save bandwidth, not to cut latency — latency is handled by wave switching.',
              'Infinity Cache = the large on-chip last-level cache (Navi33 32 MiB / Navi31 96 MiB / MI300X 256 MiB), buying a narrower, cheaper memory bus.',
              'GDDR = high-clock narrow lanes (consumer); HBM = stacked wide lanes (Instinct); bandwidth is what feeds a GPU.',
              "The driver's real exam topic is coherence: PM4's ACQUIRE_MEM/RELEASE_MEM manage cache flushes inside the command stream.",
            ],
          },
          diagram: {
            title: 'Capacity vs Distance: The Seven-Step Ladder',
            svgId: 'memory-hierarchy',
            content: `VGPR    per SIMD  ~1 cy    128-192 KiB
LDS     per WGP   ~30 cy   128 KiB
L0      per CU    ~30 cy   32 KiB
L1      per SA    ~60 cy   256 KiB (removed in RDNA4)
L2      chip      ~100 cy  2-8 MiB
Inf$    chip      ~150 cy  32-96 MiB (MALL)
VRAM    on-board  ~500 cy  16-24 GB GDDR6`,
            caption: 'Bigger and slower as you go down. Figures shown are flagship Navi31 examples; your RX 7600 XT has L2 2 MiB and Infinity Cache 32 MiB. Latencies are order-of-magnitude illustrations, not exact values.',
          },
          codeWalk: {
            title: 'What Coherence Looks Like: Cache-Control Packets in PM4',
            language: 'c',
            file: 'drivers/gpu/drm/amd/amdgpu/gfx_v11_0.c (excerpt, simplified)',
            code: `/* Before each fence write-back, the driver emits RELEASE_MEM in the ring:
 * make the GPU flush dirty data out to memory and invalidate the
 * relevant caches, so the CPU can read fresh results */
static void gfx_v11_0_ring_emit_fence(
        struct amdgpu_ring *ring, u64 addr,
        u64 seq, unsigned flags)
{
	amdgpu_ring_write(ring,
		PACKET3(PACKET3_RELEASE_MEM, 6));
	amdgpu_ring_write(ring,
		PACKET3_RELEASE_MEM_GCR_GLM_INV |  /* invalidate GL2 metadata */
		PACKET3_RELEASE_MEM_GCR_GL2_WB  |  /* write back dirty L2     */
		PACKET3_RELEASE_MEM_GCR_GLV_INV |  /* invalidate L0 vector    */
		PACKET3_RELEASE_MEM_CACHE_POLICY(3) |
		PACKET3_RELEASE_MEM_EVENT_TYPE(
			CACHE_FLUSH_AND_INV_TS_EVENT));
	/* ... then write the fence address and sequence number ... */
}`,
            explanation:
              'Each GCR_ flag maps to one level of the hierarchy diagram: GL2_WB writes back L2, GLV_INV invalidates the L0 vector cache. This code answers "how does the CPU know the GPU finished and the data is visible" — a fence is not just a number; it comes bundled with a whole set of cache-flush actions. Remember this function name: you will meet it a third time when Module 5 covers fences.',
          },
          miniLab: {
            title: 'Draw Cache Business Cards for Two Cards',
            objective: 'Independently complete a cache-topology comparison from official data sources.',
            steps: [
              'Open the ROCm gpu-arch-specs table and find the RX 7600 XT and MI300X rows',
              'Copy a side-by-side table: L0/LDS/L1/L2/Infinity Cache/memory type and bandwidth (for the MI300X mind the per-XCD accounting: 4 MiB L2 × 8)',
              'With a supported ROCm machine, run rocminfo | grep -iA2 cache to cross-check (the RX 7600 XT is not on the official support list — skip or complete this step from the specs table)',
              'Mark the two structural differences: MI300X has no graphics L1, and LDS is 64 KiB per CU (CDNA layout)',
              'Write one sentence in your log: why can Navi33 dare to use a 128-bit memory bus?',
            ],
            expectedOutput:
              'Side-by-side card done; the two structural differences marked; the one-sentence answer: the 32 MiB Infinity Cache intercepts most VRAM traffic, so effective bandwidth far exceeds the raw 288 GB/s and the bus could be narrowed to cut cost.',
            hint: 'In the specs table Infinity Cache sits in the "L3" column — AMD documents record MALL as L3.',
          },
          debugExercise: {
            title: 'The GPU Definitely Wrote It, Yet the CPU Reads a Stale Value',
            language: 'c',
            question: 'A kernel developer wrote a test: have the GPU write a marker into a BO while the CPU polls for it. It occasionally times out, yet a dump shows the memory already holds the new value. What went wrong?',
            buggyCode: `/* Simplified kernel test logic */
u32 *cpu_ptr = amdgpu_bo_kptr(bo);   /* CPU mapping */
*cpu_ptr = 0;

/* Submit an IB containing just a WRITE_DATA packet:
 * make the GPU write 0xCAFE to the bo's GPU address */
submit_ib_write_data(ring, gpu_addr, 0xCAFE);
amdgpu_ring_commit(ring);

/* CPU side spins waiting for the GPU write */
while (READ_ONCE(*cpu_ptr) != 0xCAFE)
        cpu_relax();                 /* occasionally stuck here */`,
            hint: "At which level of the GPU does the data written by a WRITE_DATA packet stop by default? Whose job is it to push it somewhere CPU-visible? Compare the previous lesson's codeWalk.",
            answer:
              'The GPU\'s write may legally linger in its cache hierarchy (e.g., L2); the WRITE_DATA packet by itself does not guarantee a push to memory — the CPU reads from DRAM, so it can see the old value for a long time; the "occasional success" is just the cache line happening to get evicted. The correct approach is what the real fence path does: give the write cache-writeback semantics (RELEASE_MEM with GL2_WB, or a WRITE_DATA packet targeting memory with the coherence policy bits), or emit an explicit cache-flush packet after the write, and only then let the CPU wait. The more engineering-grade answer: do not hand-roll polling protocols; use the driver\'s existing fence machinery (amdgpu_fence_emit + wait), which packages "write + cache flush + interrupt wakeup" into a correct whole. Lesson: every CPU/GPU "shared-memory handshake" must explicitly answer the cache-coherence question.',
          },
          interviewQ: {
            question: 'What is Infinity Cache? What problem does it solve? How does it differ from a regular L2?',
            difficulty: 'medium',
            hint: 'Start from "the cost of bandwidth": bus width, power, hit rate.',
            answer:
              'Infinity Cache is the on-chip last-level cache AMD added starting with RDNA2 (official term MALL, Memory Attached Last Level), with capacities from tens to hundreds of MiB (Navi33 32, Navi31 96, MI300X 256), sitting after L2 and before the memory controllers, shared chip-wide. It solves a bandwidth-economics problem: GPU throughput explodes each generation, but widening the GDDR bus scales cost (pins/power/board routing) disproportionately, so a large on-chip cache intercepts repeated accesses to framebuffers and hot data, multiplying effective bandwidth while the memory bus actually narrows (Navi33 is only 128-bit). Difference from L2: L2 is the traditional coherent cache — small, serving all clients under the regular cache protocol; Infinity Cache sits closer to the memory side and targets hit bandwidth. The two are in series (L2 miss → IC → DRAM), not substitutes. Note that cache geometry shifts by generation (RDNA4 deleted the per-SA graphics L1); saying "as per that generation\'s ISA manual" makes the answer look more professional.',
            amdContext: 'A hardware-knowledge staple; driver roles often follow with: "what does the driver need to do for Infinity Cache?" — largely transparent, but topology reporting, partial-flush semantics, and debug counter access all need driver support to expose.',
          },
        },
        // ── Lesson 1.5.3.2 ────────────────────────────────────
        {
          id: '15-3-2',
          number: '1.5.3.2',
          title: 'VRAM, GTT & GPUVM: Memory as the Driver Sees It',
          titleEn: 'VRAM, GTT & GPUVM: Memory as the Driver Sees It',
          duration: 25,
          difficulty: 'intermediate',
          tags: ['VRAM', 'GTT', 'GART', 'GPUVM', 'TTM'],
          concept: {
            summary:
              'Memory available to the GPU comes in two kinds: VRAM (on-board memory) and GTT (borrowed system memory, mapped to the GPU through GART page tables). GPUVM then gives every process its own GPU page tables, so a buffer keeps a stable GPU virtual address no matter where it physically lives. amdgpu uses TTM to manage BO placement and eviction — the most central, and most bug-prone, territory of the driver.',
            explanation: [
              'Establish three terms first. VRAM: the GDDR/HBM soldered on the card, accessed locally by the GPU at full bandwidth (RX 7600 XT: 16 GB, reported by the driver as about 16368 MB). GTT (Graphics Translation Table domain): a stretch of ordinary system memory mapped GPU-accessible through GART page tables; the GPU reaches it over PCIe — large capacity (by default about half of system RAM) but an order of magnitude less bandwidth. An APU has no discrete VRAM: its "VRAM" is a carve-out the BIOS takes from system memory, and the rest is still reached via GTT.',
              "GPUVM is the third key player: the GPU's own MMU. Every process using the GPU owns its own GPU page tables (the tables themselves usually live in VRAM); addresses issued by shaders are GPU virtual addresses, translated level by level to land on a VRAM page or a GTT page. The value is exactly that of CPU virtual memory: process isolation (your shader cannot touch someone else's buffer) and address stability (a buffer physically moves, its GPU VA stays put, and addresses embedded in commands never go stale). The dirty work of updating page tables is delegated to the SDMA engine.",
              'The basic management unit of memory is the BO (buffer object, a GEM object). When user space creates a BO it declares a preferred placement domain: a scanout framebuffer must be VRAM; an upload buffer the CPU writes frequently suits GTT. When VRAM runs tight, TTM (the kernel\'s memory-management framework for GPUs) starts evicting: it picks victim BOs, moves them to GTT with SDMA, and frees up VRAM — an evicted BO gets moved back the next time the GPU needs it. The whole process is invisible to user space, except in performance.',
              'Why is this a bug hotspot? Eviction means "moving a block of memory that is being referenced": you must wait on its fences (who is still using it?), update GPUVM page tables (leave no stale mapping dangling), and dodge deadlocks with new allocations (making room for A requires first making room for B...). The amdgpu mailing list carries eviction patches year-round. The other thread is the CPU\'s path into VRAM: BAR0 exposes VRAM for direct CPU reads/writes, and without Resizable BAR the window is only 256 MB, so the driver must manage paging things in and out of that small window. The code behind all these mechanisms is covered fully in Module 5 (amdgpu memory management) — this lesson just draws the map correctly.',
            ],
            keyPoints: [
              'VRAM = local, full speed; GTT = GART-mapped system memory over PCIe, an order of magnitude slower; APU "VRAM" is a carve-out.',
              "GPUVM = the GPU's MMU: per-process page tables, isolation + stable addresses; page-table updates are executed by SDMA.",
              'The BO is the management unit: pick a domain at creation; under pressure TTM evicts (VRAM→GTT) with SDMA doing the moves.',
              'Eviction = wait on fences + rewrite page tables + avoid deadlocks — a rich vein of driver bugs.',
              'CPU reads VRAM directly through the BAR0 window (size set by Resizable BAR); doorbells live on BAR2, registers on BAR5.',
            ],
          },
          diagram: {
            title: 'Two Kinds of Physical Memory + One Virtual Address Space',
            svgId: 'vram-gtt-gpuvm',
            content: `CPU side                     GPU side
┌─system memory──┐           ┌─VRAM 16GB────┐
│ GTT pages (GPU │◀─PCIe────▶│ BOs / page    │
│ visible)       │           │ tables        │
│ normal process │           └──────────────┘
│ memory         │                 ▲
└────────────────┘                 │
        ▲                          │
        └────── GPUVM page tables ─┘
   GPU VA ──▶ translate ──▶ VRAM page or GTT page
TTM: under pressure BOs evict VRAM→GTT (moved by SDMA)`,
            caption: 'GPUVM in the middle is the key: shaders see only virtual addresses; physical pages migrating between VRAM/GTT are transparent to them. The BAR0 window for direct CPU writes into VRAM is at the lower left.',
          },
          codeWalk: {
            title: 'BO Placement: How a Domain Becomes a TTM Placement',
            language: 'c',
            file: 'drivers/gpu/drm/amd/amdgpu/amdgpu_object.c (excerpt, simplified)',
            code: `void amdgpu_bo_placement_from_domain(
        struct amdgpu_bo *abo, u32 domain)
{
	struct ttm_placement *p = &abo->placement;
	unsigned int c = 0;

	if (domain & AMDGPU_GEM_DOMAIN_VRAM) {
		p->places[c].mem_type = TTM_PL_VRAM;
		/* BOs needing CPU access are constrained to the BAR-visible segment */
		if (abo->flags &
		    AMDGPU_GEM_CREATE_CPU_ACCESS_REQUIRED)
			p->places[c].lpfn =
				visible_pfn_limit(adev);
		c++;
	}
	if (domain & AMDGPU_GEM_DOMAIN_GTT) {
		p->places[c].mem_type = TTM_PL_TT;
		c++;
	}
	/* Order is priority: VRAM first = preferred;
	 * on eviction TTM walks this list for a fallback */
	p->num_placement = c;
}`,
            explanation:
              'A BO\'s domain may contain VRAM|GTT at the same time — meaning "VRAM preferred, GTT acceptable"; TTM tries the list in order, which is exactly what lets eviction work automatically. The CPU_ACCESS_REQUIRED lines are the entrance to BAR-window management: a VRAM BO the CPU must touch has to land in the physical segment BAR0 can illuminate.',
          },
          miniLab: {
            title: 'Measure Your VRAM/GTT Estate and Its Tenants',
            objective: 'Ground the three abstract terms in real sysfs/debugfs numbers.',
            steps: [
              'Read totals: cat /sys/class/drm/card0/device/mem_info_vram_total mem_info_gtt_total (divide by 1024³ for GB)',
              'Read usage: cat mem_info_vram_used mem_info_gtt_used; start a game/video and read again, watching the change',
              'Inspect the tenants: sudo cat /sys/kernel/debug/dri/0/amdgpu_gem_info | head -40 — each line is one BO: size, current domain (VRAM/GTT/CPU), flags',
              'Find evidence: locate one BO living in VRAM and one in GTT and guess their purposes (hint: huge VRAM BOs are often framebuffers or texture heaps)',
              'No-AMD-hardware alternative: read amdgpu_bo_create in amdgpu_object.c on elixir plus this lesson\'s codeWalk function, and write a 100-word flow summary',
            ],
            expectedOutput:
              'Typical output: vram_total ≈ on the order of 17163091968 bytes (a 16 GB card), gtt_total ≈ half of system memory; gem_info shows tens to hundreds of BOs, with scanout BOs pinned in VRAM. Log entries: VRAM/GTT totals plus one typical BO line copied and interpreted for each domain.',
            hint: 'debugfs needs root; the card number may not be 0 — check with ls /sys/kernel/debug/dri/ first.',
          },
          debugExercise: {
            title: 'Performance Avalanche: Frame Rate Drops from 120 to 9',
            language: 'text',
            question: 'A user reports: on a 16 GB card, after a game loads a new level the frame rate collapses from 120 to 9, with nothing in dmesg. Below is the collected evidence — write the diagnosis and its justification.',
            buggyCode: `# Sample 1: memory watermarks
mem_info_vram_used : 16.1 GB / 16.0 GB   (over the top)
mem_info_gtt_used  :  6.8 GB

# Sample 2: amdgpu_gem_info summary
- texture BOs total 13.9 GB, of which 4.2 GB show domain GTT
- several large BOs flip domains VRAM ↔ GTT between two samples

# Sample 3: GPU utilization high, but the SDMA engine is
#           abnormally at a sustained > 60%`,
            hint: 'How busy should SDMA normally be while a game runs? What does a BO domain flip-flopping back and forth mean?',
            answer:
              'Diagnosis: VRAM oversubscription causing eviction thrashing. Evidence chain: VRAM usage pegged at the top + 4.2 GB of textures pushed to GTT — the working set exceeds the 16 GB of physical VRAM; BO domains flip-flopping VRAM↔GTT between samples means "a just-evicted BO is immediately needed by the GPU again, gets moved back, and squeezes someone else out" — a migration loop; SDMA sustained above 60% is the direct signature of that loop (in a normal game SDMA is busy only during loading). Every frame waits on PCIe texture copies, so the frame rate naturally collapses to single digits. This is not a driver bug but a resource condition — yet a driver engineer must read this set of vitals at a glance. Mitigation paths: lower the texture quality tier in the game; longer-term driver work is smarter eviction policy (LRU improvements, priorities, leaving read-only textures in GTT for direct reads). Every observation technique in this case came from the previous miniLab — that is why you learn to read the tables first.',
          },
          interviewQ: {
            question: 'For a BO going from "in VRAM, in use by the GPU" to "evicted to GTT", what must the driver guarantee, in what order?',
            difficulty: 'hard',
            hint: 'Think of three questions: who is still using it? who does the moving? how do addresses stay valid?',
            answer:
              'The order is roughly: (1) after picking the victim, first wait on its fences — the GPU may still have in-flight commands referencing this memory, and moving early is the GPU version of use-after-free; (2) allocate and pin the destination pages on the GTT side, and copy the contents with SDMA (CPU memcpy is too slow and would occupy the BAR window); (3) update the GPUVM page tables so the BO\'s GPU virtual address points at the new physical pages — note the page-table update is itself a command submitted to SDMA with its own fence; (4) only after the page-table switch takes effect (TLB invalidation) can the old VRAM pages actually be handed to new allocations. Throughout, the GPU VA never changes and the addresses embedded in user-space commands stay valid — precisely the point of GPUVM. Bonus: the eviction path must avoid deadlock (while evicting to make room, you must not recursively wait on operations that themselves need room); TTM handles it with the reservation (dma-resv) lock-ordering protocol — a highlight of Module 5.',
            amdContext: 'The core interview question for amdgpu memory-management roles; every element in the answer (fence, SDMA, page tables, dma-resv) corresponds to a real source file. Recounting the sequence cleanly essentially clears the hard gate.',
          },
        },
        // ── Lesson 1.5.3.3 ────────────────────────────────────
        {
          id: '15-3-3',
          number: '1.5.3.3',
          title: 'The Command Processor: Rings, PM4 & IBs',
          titleEn: 'The Command Processor: Rings, PM4 & IBs',
          duration: 25,
          difficulty: 'intermediate',
          tags: ['ring-buffer', 'PM4', 'IB', 'CP'],
          concept: {
            summary:
              'The CPU never "calls" the GPU; it writes commands into a ring buffer in memory, and the GPU\'s command processor (CP) fetches, parses, and executes them asynchronously. Commands use the PM4 packet format, and bulk commands live in IBs (indirect buffers) referenced from the ring. This producer-consumer model is the whole truth of the CPU↔GPU interface.',
            explanation: [
              "A ring buffer is a stretch of shared memory plus two pointers: WPTR (write pointer, advanced by the producer = the driver) and RPTR (read pointer, advanced by the consumer = the GPU). The driver writes commands at WPTR and advances it; the GPU chases from RPTR. \"Ring\" means writes wrap from the tail back to the head, and as long as WPTR never laps RPTR (full), the flow never stops. The structure perfectly embodies Lesson 1's throughput philosophy: the CPU dumps work in batches, the GPU digests at its own pace, and the two are decoupled.",
              'What do commands look like? PM4 packets: a 32-bit header (packet type + opcode + length) followed by data words. The workhorse is the type-3 packet, whose opcode tells the CP what to do: WRITE_DATA (write memory), DISPATCH_DIRECT (start compute), DRAW_INDEX (draw), INDIRECT_BUFFER (jump to execute an IB), RELEASE_MEM (flush caches + write a fence). The SDMA engine has its own separate packet format — PM4 is the GC dialect.',
              'The IB (Indirect Buffer) solves the "ring is too small" problem: a real frame carries hundreds of KB of commands, which would instantly burst the ring. So user space (Mesa/ROCm) writes commands into its own BO, and the kernel puts just one INDIRECT_BUFFER packet into the ring (holding the IB\'s GPU address and length); when the CP parses it, it jumps there, executes, and returns. What flows through the ring is mostly these "jump instructions" plus the driver\'s own management packets — and the division has a security meaning: user commands never enter the ring directly, so the kernel gets a chance to validate.',
              "On the consuming side, the CP is not one lump of iron but several firmware-running microcontrollers: graphics queues are handled by the PFP (prefetch parser) + ME (micro engine) pipeline; compute queues belong to the MEC (each MEC provides several pipes, each pipe several queue slots — ACE is the name of these compute queue engines). After parsing a dispatch/draw, the work is handed to the SPI to create wavefronts and stuff them into the CUs' wave slots — connecting back to the execution model of lesson group two. On an RX 7600 XT, dmesg shows these rings' names: gfx_0.0.0, comp_1.0.0..., sdma_0.0.0 — behind every ring is a hardware queue.",
            ],
            keyPoints: [
              'ring = shared memory + WPTR (driver writes) + RPTR (GPU reads), a producer-consumer loop.',
              'PM4 packet = header (type/opcode/length) + data; type-3 is the workhorse (DISPATCH/DRAW/WRITE_DATA/INDIRECT_BUFFER/RELEASE_MEM).',
              'IBs carry the bulk user commands; the ring holds only jump references — a win for both capacity and security.',
              'Inside the CP: PFP+ME run graphics, the MEC (= the ACEs) runs compute — all firmware-running microcontrollers; the SPI spawns waves.',
              'Every gfx_0.0.0 / comp_* / sdma_* line in dmesg corresponds to one hardware queue.',
            ],
          },
          diagram: {
            title: 'A Submission End to End: User Space → Ring → CP → CU',
            svgId: 'command-submission',
            content: `User space: Mesa/ROCm ──write PM4──▶ IB (its own BO)
                └── ioctl(CS) ──▶ kernel
Kernel: validate+schedule ──▶ ring[WPTR++] = INDIRECT_BUFFER(ib)
                └──▶ write doorbell (next lesson)
GPU:   CP: PFP→ME (gfx) / MEC (compute)
        └─parse PM4─▶ SPI spawns waves ─▶ CUs execute
Done:  RELEASE_MEM ─▶ fence value+interrupt ─▶ wake waiters`,
            caption: 'Three swim lanes top to bottom. Note the INDIRECT_BUFFER cell in the ring — user commands live in the IB; the ring holds only the reference. The fence back-edge closes the loop.',
          },
          codeWalk: {
            title: 'Writing Packets into the Ring: The Three Core Steps of amdgpu_ring',
            language: 'c',
            file: 'drivers/gpu/drm/amd/amdgpu/amdgpu_ring.c (excerpt, simplified)',
            code: `/* Step 1: reserve ring space (make sure not to lap RPTR) */
int amdgpu_ring_alloc(struct amdgpu_ring *ring,
                      unsigned int ndw)
{
	if (WARN_ON_ONCE(ndw > ring->max_dw))
		return -ENOMEM;
	ring->count_dw = ndw;
	ring->wptr_old = ring->wptr;
	return 0;
}

/* Step 2: write the PM4 word by word (wraparound via mask) */
static inline void amdgpu_ring_write(
        struct amdgpu_ring *ring, uint32_t v)
{
	ring->ring[ring->wptr++ & ring->buf_mask] = v;
	ring->count_dw--;
}

/* Step 3: commit = tell the hardware the new WPTR */
void amdgpu_ring_commit(struct amdgpu_ring *ring)
{
	/* pad with NOPs to the alignment the hardware requires */
	while (ring->wptr & ring->funcs->align_mask)
		amdgpu_ring_write(ring, ring->funcs->nop);
	ring->funcs->set_wptr(ring);  /* ← writes the doorbell! */
}`,
            explanation:
              'wptr & buf_mask is the ring wraparound (ring sizes are powers of two, so a mask replaces the modulo). What actually sets the GPU in motion is the last line, set_wptr — it writes the doorbell register, the protagonist of the next lesson. These three functions are among the hottest paths in amdgpu; they are worth memorizing.',
          },
          miniLab: {
            title: 'Count How Many Rings Your GPU Has',
            objective: 'Ground "abstract queues" in entities you can enumerate in dmesg and debugfs.',
            steps: [
              'Run sudo dmesg | grep -iE "ring .* uses|ring .* test" and copy down all the ring names',
              'Classify and count: gfx_* (graphics), comp_* (compute — note the MEC.pipe.queue structure in the numbering), sdma_*, vcn_*, jpeg_*',
              'Cross-check: ls /sys/kernel/debug/dri/0/ | grep ring — each ring has a dumpable file in debugfs',
              'Advanced observation: sudo cat /sys/kernel/debug/dri/0/amdgpu_fence_info | head -30 — each ring\'s fence sequence advances independently, direct evidence that "each ring is its own ordered world"',
              'No-hardware path: search gfx_v11_0.c in the kernel source for num_compute_rings and the ring init code, and count the theoretical values',
            ],
            expectedOutput:
              'Typical RX 7600 XT list: 1 gfx, several comp_1.x.y (multiple pipes/queues of MEC1), 2 sdma, several vcn/jpeg each. In fence_info every ring has independent signaled/emitted sequence numbers. One-sentence conclusion: a GPU is not one queue, it is a fistful of queues.',
            hint: 'The three-part numbering of comp_1.2.0 = MEC.pipe.queue — hold it against the HQD concept in the next lesson and the numbering suddenly makes sense.',
          },
          debugExercise: {
            title: 'The GPU Received Half a Command?',
            language: 'c',
            question: 'Someone bypassed amdgpu_ring_commit and hand-wrote the submission logic (teaching sketch). The GPU occasionally executes half a packet and hangs. Point out the two ordering errors.',
            buggyCode: `/* Teaching sketch: manually submit a 3-word packet to the ring */
void broken_submit(struct amdgpu_ring *ring,
                   u32 w0, u32 w1, u32 w2)
{
	u32 *r = ring->ring;

	/* first tell the hardware "there are 3 new words" */
	ring->wptr += 3;
	ring->funcs->set_wptr(ring);      /* doorbell */

	/* then write the packet contents */
	r[(ring->wptr - 3) & ring->buf_mask] = w0;
	r[(ring->wptr - 2) & ring->buf_mask] = w1;
	r[(ring->wptr - 1) & ring->buf_mask] = w2;
	/* (also: who guarantees these writes are visible
	    to the GPU before the doorbell?) */
}`,
            hint: 'What does the GPU do the moment it sees the new WPTR? What is sitting in the ring at that moment? A subtler problem hides in the parenthetical — think of the CPU write buffer.',
            answer:
              'Error one (inverted order): pushing WPTR / ringing the doorbell first, writing contents second. The GPU may start fetching the instant the doorbell lands, and at that moment those 3 slots in the ring still hold old data/garbage — the CP parsing an illegal packet header is undefined behavior, and a hang is the gentlest outcome. You must write the contents first, then publish the WPTR. Error two (missing memory barrier): even with the order fixed, CPU write buffering/reordering can let the doorbell MMIO write arrive before the ordinary memory writes of the ring contents. The real code path has a write barrier before set_wptr (wmb() or writel\'s barrier semantics) guaranteeing "contents visible before publication". This is the classic publish-subscribe memory-ordering problem: write data → barrier → publish pointer. The C/C++ reinforcement track generalizes this pattern — for now memorize the chant: data first, barrier next, publish last.',
          },
          interviewQ: {
            question: 'Why does CPU→GPU use a ring buffer instead of "the CPU writing registers to issue commands directly"? And what problem does the IB solve?',
            difficulty: 'medium',
            hint: 'Return to the throughput philosophy: decoupling, batching, asynchrony; for the IB think capacity and security.',
            answer:
              'Register-write-per-command means CPU and GPU in lockstep: one MMIO round trip per command (microsecond-scale, uncacheable); when the GPU is fast the CPU cannot feed it, when the CPU is busy the GPU starves — each drags the other down. The ring buffer turns the interface into a producer-consumer queue in memory: the CPU batch-writes then notifies once via doorbell, the GPU consumes asynchronously at its own pace, pipelining and batching come naturally, and MMIO drops from "once per command" to "once per batch". The IB then solves two problems: capacity — hundreds of KB of per-frame commands live in the user\'s own BO while the ring stores only a jump reference, so a small ring references vast work; security and separation — user-generated commands never enter the kernel ring directly, and the kernel validates/patches at the submission point (relocations, permission checks). Bonus: this model is also the premise for "when the GPU hangs, how does the driver locate the stuck packet" — wherever RPTR stopped is the crime scene.',
            amdContext: 'A must-ask for driver roles. Common follow-ups: "what if the ring is full" (wait/resize strategies) and "why one or more rings per engine" (parallelism and priorities) — both derivable straight from the producer-consumer model.',
          },
        },
        // ── Lesson 1.5.3.4 ────────────────────────────────────
        {
          id: '15-3-4',
          number: '1.5.3.4',
          title: 'Doorbells, MQD/HQD & MES: Scheduling the Queues',
          titleEn: 'Doorbells, MQD/HQD & MES: Queue Scheduling',
          duration: 25,
          difficulty: 'advanced',
          tags: ['doorbell', 'MQD', 'HQD', 'MES', 'ACE'],
          concept: {
            summary:
              'A doorbell is a special MMIO page: write a value into it and the GPU knows "some queue has new work". The hardware can keep only a limited number of queues active at once (HQD slots), but the system may want hundreds of queues (MQDs resident in memory) — the MES/HWS scheduling firmware dynamically loads MQDs into HQDs. This mechanism is the foundation of user-mode queues (submissions that bypass the kernel).',
            explanation: [
              'First, close the loose end from the previous lesson: what does set_wptr actually write? It writes the doorbell — a whole stretch of MMIO pages the GPU exposes on BAR2. Each queue gets its own doorbell offset, and the value written is the new WPTR. The elegance is that the single act of "writing a memory address" carries two pieces of information: which queue (the address) and how far the work extends (the value). GPU-side hardware watches this address range and wakes up with no interrupt and no polling. That is all of it — many people are intimidated by the name, but it really is just a page of MMIO that triggers hardware action.',
              "Now the lesson's core tension: hardware queue slots (HQD, Hardware Queue Descriptor — a register set describing an \"active queue\": ring base, RPTR/WPTR, doorbell offset, etc.) are few — the GFX11 graphics front-end has 2 pipes × 2 queues, and each MEC only has a few dozen slots; but a system running dozens of processes wants far more queues — especially in the ROCm era where every process wants its own compute queue. The solution is the classic virtualization move: keep a queue's complete state in a memory structure called the MQD (Memory Queue Descriptor); to run a queue, load its MQD into an HQD slot (map), and to switch it out, unload it (unmap) back to memory. HQD:MQD is as CPU core:thread.",
              'Who makes the load/unload decisions? Scheduling firmware. On GFX11+ it is MES (MicroEngine Scheduler, replacing the old KIQ — the kernel-only management queue); the counterpart on the Instinct/KFD side is called HWS (running in MEC firmware). MES supports oversubscription: when queues outnumber slots it time-slices, and it also owns queue priorities and preemption. The kernel driver itself talks to MES over a ring too (the mes ring) — sending packets that say "please map this MQD onto some pipe".',
              "The strategic meaning of all this is user-mode queues: after creating a queue, a process holds a mapping of its own ring and its own doorbell page; submitting work = writing its own ring + ringing its own doorbell — never entering the kernel! The ioctl happens exactly once, at queue creation. ROCm/KFD has worked this way for years; on the graphics side, amdgpu user-mode queues landed as experimental support in Linux 6.16 (GFX11/GFX12; see the kernel's amdgpu/userq documentation page), with Mesa 25.2 adding graphics user-queue support — the default path today is still kernel queues. The price is a more complex debugging and security story (the kernel no longer sees each submission) — which is why MES firmware quality directly determines the bring-up experience of new hardware, and MES-related errors in dmesg are a high-frequency keyword when troubleshooting GFX11+.",
            ],
            keyPoints: [
              'doorbell = an MMIO page on BAR2: write the new WPTR; the address itself identifies the queue — the GPU wake-up mechanism is that simple.',
              'MQD = the full queue state in memory; HQD = the hardware slot registers; map/unmap is like thread-scheduling context switches.',
              'MES (GFX11+, replacing KIQ) / HWS (KFD/MEC) is the scheduling firmware making map decisions, with oversubscription, priorities, preemption.',
              'User-mode queue = own ring + own doorbell, zero-ioctl submission — long-standing reality in KFD/ROCm; landed as experimental in Linux 6.16 for graphics (GFX11+).',
              'ACE = the asynchronous compute queue engines provided by the MEC; each MI300 XCD carries 4 ACEs.',
            ],
          },
          diagram: {
            title: 'Many Queues vs Few Slots: The Job of MES',
            svgId: 'doorbell-queues',
            content: `In memory: MQD0 MQD1 MQD2 ... MQD99   (as many queues as you like)
                 │  MES/HWS selects and loads
                 ▼
HW slots: [HQD gfx p0][HQD gfx p1][HQD ace0]...(only this many)
Submission path (user-mode queue):
  process writes its own ring → writes its own doorbell page (BAR2)
  → GPU sees queue N ready → CP fetches and executes   (no ioctl anywhere)`,
            caption: 'The MQD army in memory on the left, the scarce HQD slots on the right, MES making load decisions in between. In the flow below note "no ioctl" — the entire point of user-mode queues.',
          },
          codeWalk: {
            title: "What's Inside an MQD + How the Driver Asks MES to Map It",
            language: 'c',
            file: 'drivers/gpu/drm/amd/amdgpu/amdgpu_mes.c (excerpt, simplified)',
            code: `/* Core fields of an MQD (v11 compute queue, heavily excerpted):
 * only a fully described queue can be loaded/unloaded at any time */
struct v11_compute_mqd {
	uint32_t cp_hqd_pq_base_lo;      /* ring base   */
	uint32_t cp_hqd_pq_base_hi;
	uint32_t cp_hqd_pq_rptr;         /* read ptr    */
	uint32_t cp_hqd_pq_wptr_poll_addr_lo;
	uint32_t cp_hqd_pq_doorbell_control; /* doorbell offset */
	uint32_t cp_hqd_pq_control;      /* size/format */
	/* ... 100+ fields: priority/preemption state/protection bits ... */
};

/* The kernel asks MES to load a queue into hardware: also by sending a packet! */
static int mes_v11_0_add_hw_queue(
        struct amdgpu_mes *mes,
        struct mes_add_queue_input *in)
{
	union MESAPI__ADD_QUEUE q = {0};
	q.header.opcode   = MES_SCH_API_ADD_QUEUE;
	q.mqd_addr        = in->mqd_addr;   /* where the MQD is */
	q.page_table_base_addr = in->page_table_base_addr;
	q.doorbell_offset = in->doorbell_offset;
	/* submitted to the scheduling firmware via the mes ring */
	return mes_v11_0_submit_pkt_and_poll_completion(
			mes, &q, sizeof(q));
}`,
            explanation:
              'Two observations: every MQD field name carries the cp_hqd_ prefix — it is the memory image of the HQD register set, and loading = pouring these values into the registers; and the driver talks to MES by, once again, "putting packets on a ring" — the whole system is self-similar: even the scheduler itself is queue-driven.',
          },
          miniLab: {
            title: 'Find the Physical Evidence for Doorbells and MES',
            objective: "Empirically verify this lesson's three abstractions (doorbell/BAR2, MES firmware, queues) one by one.",
            steps: [
              'Look at the BARs: sudo lspci -v -d 1002: | grep -A8 VGA — find the three lines Region 0 (VRAM, large), Region 2 (doorbell), Region 5 (registers), and note their sizes',
              'Look at the MES firmware: sudo dmesg | grep -iE "mes" — find the MES firmware version load line (GFX11+ only); then ls /lib/firmware/amdgpu/ | grep mes to see the firmware files themselves',
              'See who is using queues: sudo cat /sys/kernel/debug/dri/0/amdgpu_fence_info | grep -iA2 mes; run a ROCm/Vulkan program and compare the comp ring fences before and after',
              'Copy the doorbell size and BAR0 size into your log: the doorbell is typically 2 MB, allocated in isolated 4 KB pages — estimate how many queue families it can serve',
              'No-hardware path: read the kernel doc docs.kernel.org/gpu/amdgpu/gc/mes.html (the factual source of this lesson) and excerpt the three responsibilities of MES',
            ],
            expectedOutput:
              'Typical lspci: Region 0 = 16 GB (Resizable BAR on) or 256 MB; Region 2 = 2 MB doorbell; Region 5 = 1 MB registers. dmesg shows an MES firmware version line. The log holds the three Region sizes + the three MES responsibilities (map/unmap, oversubscription rotation, priority preemption).',
            hint: 'lspci does not label the doorbell by name — recognize the combination Region 2 + 2MB size (the hardware lessons on this site revisit the BAR layout: 0=VRAM, 2=doorbell, 5=MMIO).',
          },
          debugExercise: {
            title: 'The New Queue Is Built, Yet the GPU Plays Deaf',
            language: 'c',
            question: 'Someone added a "fast queue creation" path to the driver (teaching sketch). The queue is created, the doorbell gets hammered, and the GPU never reacts. Which step is missing? There is also a subtler resource error.',
            buggyCode: `/* Teaching sketch: create a new compute queue */
int broken_create_queue(struct amdgpu_device *adev,
                        struct my_queue *q)
{
	/* 1. allocate the ring buffer BO */
	q->ring_bo = alloc_bo(adev, RING_SIZE);

	/* 2. fill in the MQD in memory */
	q->mqd = alloc_bo(adev, sizeof(struct v11_compute_mqd));
	fill_mqd(q->mqd, q->ring_bo, q->doorbell_off);

	/* 3. hand the doorbell offset to user space */
	q->doorbell_off = 0x40;   /* "just pick one that looks unused" */

	/* 4. done! user can write the ring + ring the doorbell */
	return 0;
}`,
            hint: 'After the MQD is filled it lies in memory — who knows it exists? Can a doorbell offset be "just picked" — what happens when two processes pick the same one?',
            answer:
              'The fatal omission: nobody loads the MQD into hardware. Filling the MQD merely writes the queue state into memory; the GPU knows nothing about it — the MQD must be mapped to an HQD slot via MES (an add_hw_queue packet) or KIQ before the doorbell has a listener. Ringing a doorbell nobody listens to is ringing the bell of an empty house. The subtle error: doorbell offsets are a scarce global resource that must go through a central allocator (the kernel has a dedicated doorbell allocation layer); hard-coding 0x40 will sooner or later collide with another queue, and two queues sharing one doorbell = WPTRs trampling each other = random hangs that barely reproduce. And there is an ordering bug on top: step 2\'s fill_mqd uses q->doorbell_off, which is only assigned in step 3 — garbage goes into the MQD. The three mistakes together map exactly onto the queue-lifecycle checklist: allocate the doorbell → fill the MQD → ask the scheduling firmware to map → only then may the user knock.',
          },
          interviewQ: {
            question: 'What are user-mode queues? What are the pros and cons versus the per-submission-ioctl model? What must the kernel and the hardware each provide to support them?',
            difficulty: 'hard',
            hint: 'Fast because it saves what? Risky because the kernel loses what? Support: MQD/HQD, doorbell isolation, MES, GPUVM.',
            answer:
              'User-mode queues mean a process directly owns mappings of its own ring and doorbell: submission = write the ring + write the doorbell, no system call; the kernel steps in only at queue create/destroy. Advantages: submission latency drops from microsecond-scale syscalls to nanosecond-scale memory writes — a huge win for workloads with frequent small submissions (AI inference, fine-grained compute); CPU overhead and jitter drop with it. Costs: the kernel loses its per-submission checkpoint, so security must sink into the hardware layer (GPUVM page tables isolating process address spaces, per-page doorbell ownership isolation, queue-level permission bits), and debugging gets harder (the kernel log no longer shows each submission; GPU-side tracing is needed). The supporting cast is indispensable: the MQD/HQD mechanism makes queues virtualizable, MES/HWS does oversubscription scheduling and preemption, doorbell pages are mapped per process to prevent impersonation, and GPUVM ensures a wild address only faults its owner. KFD/ROCm already runs fully this way; on the graphics side, amdgpu userq landed as experimental support in Linux 6.16 (GFX11/GFX12; see the kernel amdgpu/userq doc page) with Mesa 25.2 following for graphics user queues, while the default submission path today remains kernel queues — tracking its road to non-experimental status on amd-gfx is excellent interview material.',
            amdContext: 'A frontier question aimed at core driver roles. Very few candidates proactively name the trade-off "kernel checkpoint disappears → security sinks into GPUVM/doorbell isolation" — prepare it.',
          },
        },
      ],
    },
    // ════════════════════════════════════════════════════════════
    // Group 1.5.4: Architecture Map & Pipeline Tour
    // ════════════════════════════════════════════════════════════
    {
      id: '15-4',
      number: '1.5.4',
      title: 'Architecture Map & Pipeline Tour',
      titleEn: 'Architecture Map & Pipeline Tour',
      icon: 'Map',
      description: 'Two closing lessons: a 2026 family portrait of AMD architectures (GCN→RDNA4/CDNA4 plus name decoding), and a quick pilgrimage through the fixed-function blocks of the graphics pipeline — sampled only as deep as driver development requires, plus a concentrated sweep of the ten most common misconceptions.',
      lessons: [
        // ── Lesson 1.5.4.1 ────────────────────────────────────
        {
          id: '15-4-1',
          number: '1.5.4.1',
          title: 'GCN, RDNA, CDNA: The Family Tree and Name Decoding',
          titleEn: 'GCN, RDNA, CDNA: Family Tree & Name Decoding',
          duration: 20,
          difficulty: 'beginner',
          tags: ['RDNA4', 'CDNA4', 'GCN', 'gfx-version'],
          concept: {
            summary:
              'In 2019 AMD split the single GCN into two lines: RDNA serves gaming (wave32, WGP, Infinity Cache), CDNA serves the data center (wave64, matrix cores, HBM). As of mid-2026: RDNA4 (RX 9000) and CDNA4 (MI350) are the current generations, MI400/CDNA5 is on the way, and "UDNA" is the announced re-unification direction. The hard skill for driver work is the four-layer name conversion.',
            explanation: [
              'The trunk of the family tree: GCN (2012-2019, gfx6 through gfx9) was one architecture serving both gaming and compute, with Vega (gfx900/906) as the last mainstream generation. The 2019 split: RDNA1 (Navi1x, gfx101x) introduced wave32 and the WGP; RDNA2 (Navi2x, gfx103x) added Infinity Cache and ray-tracing units; RDNA3 (Navi3x, gfx110x) brought the first consumer chiplets (GCD+MCD separation); RDNA3.5 (gfx115x) went into Strix APUs; RDNA4 (Navi4x, gfx120x, released March 2025) is the current generation — note that this generation AMD only goes up to upper-midrange (RX 9070 XT / Navi48 / 64 CU), with no flagship.',
              'The compute line: CDNA1 (MI100, gfx908) introduced the MFMA matrix instructions; CDNA2 (MI200, gfx90a) went dual-die GCD; CDNA3 (MI300, gfx942, 2023) moved to stacked XCD chiplets plus a unified-memory APU form (the MI300A is 6 XCDs + 3 Zen4 CCDs sharing 128 GB of HBM3); CDNA4 (MI350/MI355X, gfx950, released June 2025; 256 CU, 288 GB HBM3E). Looking ahead: the MI400 series (CDNA5, HBM4) is officially slated for 2H 2026, paired with the Helios rack-scale system; beyond that, AMD\'s announced "UDNA" is to re-unify the two lines — remember it is currently a strategic direction, not a shipping product; do not say "UDNA has launched" in an interview.',
              'The four-layer name conversion is a daily necessity — drill it to reflex level: marketing name ↔ chip codename ↔ LLVM target ↔ kernel GC IP version. Memorize three anchor examples: RX 7600 XT = Navi33 = gfx1102 = GC 11.0.2; RX 9070 XT = Navi48 = gfx1201 = GC 12.0.1; MI300X = Aqua Vanjaram = gfx942 = GC 9.4.3. The pattern: RDNA1-4 map to gfx10.1/10.3/11/12, while the CDNA family stays under the gfx9 major version (9.0.8/9.0.a/9.4.x/9.5.x) — so never guess age by number size: CDNA4\'s gfx950 is "smaller" than RDNA4\'s gfx1201 yet newer.',
              'One last mental preparation: kernel code is a hybrid of "GCN dialect + IP versions". The LLVM triple is forever amdgcn; driver files split by GC major version (gfx_v9_0.c serves Vega, gfx_v9_4_3.c serves MI300, gfx_v11_0.c serves Navi3x, gfx_v12_0.c serves Navi4x); within one function, RDNA and CDNA paths fork on IP-version switches. Upstream mailing-list discussions of new hardware use only gfx versions and codenames — marketing names barely appear — and that is exactly why the conversion must be drilled.',
            ],
            keyPoints: [
              'The 2019 split: RDNA gaming line (wave32/WGP/InfCache) vs CDNA compute line (wave64/MFMA/HBM/no display).',
              'Mid-2026 status: RDNA4 (RX 9000, gfx120x) + CDNA4 (MI350, gfx950) shipping; MI400/CDNA5 in 2026H2; UDNA = the announced direction.',
              'Three conversion anchors: RX 7600 XT=Navi33=gfx1102=GC 11.0.2; RX 9070 XT=Navi48=gfx1201; MI300X=gfx942=GC 9.4.3.',
              'CDNA hangs under the gfx9 lineage — gfx number size ≠ age.',
              'The kernel speaks the GCN dialect: amdgcn triple, gfx_v9/v11/v12 files, IP-version switches — marketing names do not exist upstream.',
            ],
          },
          diagram: {
            title: '2012→2026 Family Tree and Conversion Anchors',
            svgId: 'arch-timeline',
            content: `GCN(2012, gfx6-9) ──2019 split──┐
  ├─ RDNA1→2→3→3.5→4 (gaming)    │
  │   gfx101x→103x→110x→115x→120x
  └─ CDNA1→2→3→4 (compute)       │
      gfx908→90a→942→950 ─→ MI400/CDNA5(2H26)
            └───"UDNA" (unification direction, not shipping)───┘
Anchors: RX7600XT=Navi33=gfx1102=GC11.0.2
      MI300X=gfx942=GC9.4.3`,
            caption: 'Two swim lanes branch from the same GCN. The dashed MI400 and UDNA carry status labels — when citing the state of play, say "as of mid-2026".',
          },
          codeWalk: {
            title: 'Two Worlds in One Driver: Forking on IP Version',
            language: 'c',
            file: 'drivers/gpu/drm/amd/amdgpu/amdgpu_gfx.c (excerpt, simplified)',
            code: `/* One function serving both RDNA and CDNA:
 * forked by GC IP version, not by chip name */
bool amdgpu_gfx_is_high_priority_supported(
        struct amdgpu_device *adev)
{
	switch (amdgpu_ip_version(adev, GC_HWIP, 0)) {
	case IP_VERSION(9, 4, 3):   /* MI300 (CDNA3)  */
	case IP_VERSION(9, 5, 0):   /* MI350 (CDNA4)  */
		return true;        /* compute queue priority */
	case IP_VERSION(11, 0, 2):  /* Navi33 (RDNA3) */
	case IP_VERSION(12, 0, 1):  /* Navi48 (RDNA4) */
		return adev->gfx.mec_fw_version >= REQUIRED;
	default:
		return false;
	}
}
/* The same chip on the LLVM side:
 * $ clang -target amdgcn-amd-amdhsa -mcpu=gfx1102 ...
 *          ^^^^^^ the triple is always amdgcn, a 2012 name */`,
            explanation:
              'Notice 9.4.3 (MI300) and 11.0.2 (Navi33) in the same switch — direct evidence that CDNA hangs under the gfx9 lineage. The bottom comment is the other half of the story: on the compiler side, however new the card, the target is called amdgcn. Two numbering systems, one dialect — that is daily life in the AMD driver world.',
          },
          miniLab: {
            title: 'Conversion-Table Dictation + Upstream Mailing-List Field Trip',
            objective: 'Drill the four-layer conversion to reflex, and verify it against the real mailing list.',
            steps: [
              'Without looking anything up, write the three conversion rows from memory: codename/gfx/GC IP for RX 7600 XT, RX 9070 XT, MI300X',
              'Grade yourself against the ROCm gpu-arch-specs table (the LLVM-name column + the GFXIP column)',
              'Open lore.kernel.org/amd-gfx/, search "gfx12" and "gfx950", find one 2025-2026 patch email for each, and confirm upstream speaks only gfx language',
              'In the gfx950 email find one concept you have already learned (ring/MQD/doorbell/CU — any), and clip one sentence into your log',
              'Extra credit: run clang --print-supported-cpus --target=amdgcn-amd-amdhsa 2>/dev/null | grep gfx | tail -5 (with an LLVM environment) to see how far the newest gfx targets go',
            ],
            expectedOutput:
              'All three dictated rows correct (or corrected after grading); two email links + excerpts in the log. Gut-level conclusion: the upstream world has only gfx numbers and codenames; marketing names are retail-layer skins.',
            hint: 'On lore, the s:gfx950 syntax scopes the search to subject lines and is more precise.',
          },
          debugExercise: {
            title: 'Why Did This Patch Quietly Stop Working on the New Card?',
            language: 'c',
            question: 'Someone submitted this workaround in 2024; after RDNA4 shipped in 2025 the bug returned. Find the root cause at the level of how it is written, and give the fix upstream would accept.',
            buggyCode: `/* workaround: on some models SDMA needs an extra flush */
static bool sdma_needs_extra_flush(
        struct amdgpu_device *adev)
{
	/* "the whole Navi3x family has this problem" */
	if (adev->asic_type == CHIP_NAVI31 ||
	    adev->asic_type == CHIP_NAVI32 ||
	    adev->asic_type == CHIP_NAVI33)
		return true;
	return false;
}`,
            hint: 'Does the problem really belong to "these three chips"? Or to some IP version they share? Is RDNA4\'s SDMA a brand-new version or a continuation?',
            answer:
              'Root cause: an "IP problem" written as a "chip problem". The flush requirement belongs to some version of the SDMA IP (say, an erratum of SDMA 6.x); the Navi3x chips merely happen to all carry that IP. Enumerating chip names rots in both directions: if a new chip keeps the same SDMA version (e.g., certain RDNA3.5 APUs), the list misses it → the bug returns (this very case); conversely, if some new chip is named Navi but ships a fixed SDMA, the list saddles it with an unnecessary slow path. The fix upstream accepts: switch (amdgpu_ip_version(adev, SDMA0_HWIP, 0)) returning by IP version range, combined where needed with a firmware version floor (adev->sdma.instance[0].fw_version). This is also the review pushback verbatim: "do not check asic_type, check the IP version". The principle from Lesson 2 of this module appears here for the third time — it truly is the first commandment of amdgpu.',
          },
          interviewQ: {
            question: 'What are the core differences between RDNA and CDNA? Why does AMD maintain two architecture lines? What is the latest status of each (as of 2026)?',
            difficulty: 'medium',
            hint: 'Workload character drives design: gaming = branchy/latency-sensitive/needs display; HPC/AI = dense matrices/bandwidth-hungry.',
            answer:
              'Positioning: RDNA targets graphics/gaming — native wave32 (lower branch-divergence cost), WGP organization, the full graphics fixed-function set (geometry/rasterization/RB/display), Infinity Cache to supplement bandwidth, GDDR to control cost. CDNA targets HPC/AI — wave64, GCN-style CUs retained, graphics and display hardware removed, MFMA matrix cores and AccVGPRs added, HBM for big bandwidth, XCD chiplets to stack compute, strengthened FP64 and ECC. The lines split because the workloads diverged beyond what one design could serve: gaming wants frames per dollar, AI wants TFLOPS per watt, and their optima on wave width, cache policy, and memory type point in opposite directions. As of mid-2026: RDNA4 (RX 9000 series, gfx120x, no-flagship strategy) and CDNA4 (MI350 series, gfx950, 288 GB HBM3E) are current; MI400/CDNA5 is officially planned for 2H 2026; AMD has announced the UDNA unification direction but sells no such product yet. Bonus: the software cost of the split is exactly that drivers/compilers must serve two ISAs at once — the cost UDNA wants to reclaim.',
            amdContext: 'A high-frequency opener used to sound out your real familiarity with the product lines. Answering with gfx numbers and an "as of when" timestamp instantly separates you from candidates who memorized marketing pages.',
          },
        },
        // ── Lesson 1.5.4.2 ────────────────────────────────────
        {
          id: '15-4-2',
          number: '1.5.4.2',
          title: 'Graphics Pipeline Tour & Sweeping Away the Top-10 Misconceptions',
          titleEn: 'Graphics Pipeline Tour & Top-10 Misconceptions',
          duration: 20,
          difficulty: 'beginner',
          tags: ['graphics-pipeline', 'rasterizer', 'RB', 'misconceptions'],
          concept: {
            summary:
              'The fixed-function blocks of the graphics pipeline (geometry engine, rasterizer, RB) are neighbors the kernel driver must "know by name but need not know by their organs" — you initialize them and feed them commands; Mesa choreographs their work. This lesson takes a quick tour of the data flow, then dismantles the ten most common conceptual traps to close out the module.',
            explanation: [
              "The journey of a triangle (each Shader Engine carries one full set): the CP parses a DRAW packet → GE/PA (geometry engine / primitive assembly) fetches vertices and assembles triangles, with RDNA internally taking the NGG/primitive-shader path → the rasterizer (SC, Scan Converter) slices triangles into pixel quads on screen tiles → the SPI launches pixel-shader waves for those pixels in batches (back to the CU world you know) → computed colors enter the RB (Render Backend; in kernel code CB = color block / DB = depth block) for depth testing and blending → results flow through L2 back to the framebuffer in VRAM → DCN scans out to the display at the refresh rate. Note the middle is always CUs: the \"programmable\" part of the pipeline is dispatching waves onto CUs, while the fixed-function blocks do the manual labor before and after dispatch.",
              'The kernel driver\'s relationship to these blocks is "property management", not "resident": at init it configures their registers (counts/partitioning/clocks), on reset it pulls them back to a usable state, and on crashes it dumps their status registers to help locate the fault — but what gets drawn each frame and how pipeline state is set is entirely written by Mesa in the IB as PM4. So the driver engineer\'s knowledge boundary is drawn at: recognize every block\'s name abbreviation (GE/PA/SC/SPI/CB/DB), know the data-flow order, and be able to spot "stuck in rasterization" or "stuck in RB" in a hang dump — the internal organs are left to Mesa engineers.',
              'The ten misconceptions, swept in one pass (all foreshadowed across the previous nine lessons; here is the bound volume): ① "GPU cores = CPU cores" — stream processors are lanes; the CU is the core. ② "RDNA only has wave32" — wave64 mode remains; the compiler chooses. ③ "CU and WGP are the same thing" — WGP = 2 CUs sharing LDS; the counting unit is the CU. ④ "The kernel driver does the drawing" — the driver manages memory and scheduling; Mesa does rendering. ⑤ "GPU memory means VRAM" — GTT/GART is the other half of the kingdom. ⑥ "Infinity Cache is a bigger L2" — it is the MALL behind L2. ⑦ "Higher occupancy is always better" — it is a budget, not a score. ⑧ "Doorbells are mysterious" — just a page of MMIO. ⑨ "Bigger gfx number = newer" — CDNA hangs under gfx9. ⑩ "UDNA has already replaced RDNA/CDNA" — as of mid-2026 it is a direction, not a product.',
              'Module wrap-up: the mental model you now own — a throughput machine (Lesson 1) assembled from IP blocks (Lesson 2), executing via wave/CU/WGP (Lessons 3-6), fed by a layered memory system (Lessons 7-8), commanded through ring/doorbell/CP (Lessons 9-10), with a family split into RDNA/CDNA (Lesson 11), and the graphics pipeline as the CUs\' fixed-function neighborhood (this lesson). The next module (1.7 Graphics APIs) walks this pipeline again from the OpenGL/Vulkan viewpoint — this time you will recognize every station.',
            ],
            keyPoints: [
              "The triangle's journey: CP→GE/PA→rasterizer(SC)→pixel waves (CU)→RB(CB/DB)→L2→VRAM→DCN scanout.",
              'The programmable segment of the pipeline = dispatching waves onto CUs; fixed-function blocks do the manual labor around dispatch.',
              'The kernel driver is the property manager (init/reset/dump); Mesa is the resident (per-frame rendering choreography) — the knowledge boundary sits at block names and data flow.',
              'The bound volume of ten misconceptions — the ten sentences most likely to expose you in interviews and reviews, each now refutable.',
              'The mental model is now closed; Module 1.7 rewalks the pipeline from the API viewpoint.',
            ],
          },
          diagram: {
            title: 'Fixed-Function Tour + the Division of Labor',
            svgId: 'graphics-pipeline',
            content: `CP ─▶ GE/PA ─▶ rasterizer(SC) ─▶ CUs run pixel shaders ─▶ RB(CB/DB)
 │    assemble triangles  cut into quads  (programmable part)  depth/blend
 └── PM4 written by Mesa, kernel only delivers it              │
                                              L2 ─▶ VRAM
                                                     │
                                          DCN scans out to the display
Split: Mesa = choreographs each frame | kernel = init/memory/scheduling/reset`,
            caption: 'Horizontal data flow + division-of-labor notes at the bottom. Memorizing block names and order is enough — things like the depth-compression algorithms inside the RB belong to a Mesa course (out of scope for this site).',
          },
          codeWalk: {
            title: "The Property Manager's Day: What Driver Init of the RB Looks Like",
            language: 'c',
            file: 'drivers/gpu/drm/amd/amdgpu/gfx_v11_0.c (excerpt, simplified)',
            code: `/* At init the driver configures the fixed-function blocks' "floor plan";
 * every frame's use afterwards is directed by Mesa's PM4 */
static void gfx_v11_0_setup_rb(struct amdgpu_device *adev)
{
	u32 active_rb_bitmap = 0;

	/* read harvest fuse info: which RBs are yield-masked */
	active_rb_bitmap = gfx_v11_0_get_rb_active_bitmap(adev);

	adev->gfx.config.backend_enable_mask =
			active_rb_bitmap;
	adev->gfx.config.num_rbs =
			hweight32(active_rb_bitmap);
	/* afterwards: write the PA_SC/CB registers to finish partitioning
	 * (how each SE's rasterizer divides the screen tiles) */
}

/* The property manager's other duty, at hang-debug time: report who is stuck
 * $ sudo cat /sys/kernel/debug/dri/0/amdgpu_gpu_recover
 * in the dump, GRBM_STATUS bits PA_BUSY/SC_BUSY/CB_BUSY
 * tell you directly which pipeline stage is clogged */`,
            explanation:
              'Set up once, dump countless times — that is the entire acquaintance between the kernel and the fixed-function blocks. The GRBM_STATUS comment line deserves a highlight: it previews the Module 6 debugging lessons, where bits like PA_BUSY/SC_BUSY/CB_BUSY refine "the GPU hung" into "the rasterizer is stuck" — and you now recognize those abbreviations.',
          },
          miniLab: {
            title: 'Watch the Official Pipeline Movie + Misconception Self-Test',
            objective: 'Fix the pipeline data flow with the official AMD video, and verify the ten misconceptions are truly dismantled.',
            steps: [
              'Watch the GPUOpen video "All the Pipelines – Journey through the GPU" (gpuopen.com/videos/graphics-pipeline/, ~30 minutes)',
              'While watching, draw the data flow on paper, ticking a check each time a block from this lesson appears (GE/SC/SPI/CB/DB)',
              'List the terms the video mentions that this lesson did not detail (e.g., HiZ, DCC) as a "Mesa-side concepts" list — knowing they exist is enough',
              'Self-test: cover the "correct answer" half of the ten misconceptions and explain to yourself, one by one, why each is wrong; where you stall, go back to the matching lesson',
              'Closing ritual: write a one-page summary of Module 1.5 in your study log (the seven-sentence mental model + the three facts that surprised you most)',
            ],
            expectedOutput:
              'Your hand-drawn pipeline matches the video (order correct is enough); all ten misconceptions independently refutable; the one-page summary done — that page is your carry-along map for the modules ahead.',
            hint: "Can't watch the video? Use Part 6 (rasterization) of the Fabian Giesen series as replacement reading, matching block names against this lesson's keyPoints.",
          },
          debugExercise: {
            title: 'User Space Waits for a Value That Never Comes',
            language: 'cpp',
            question: 'This user-space code tries to wait "high-performantly" for the GPU to finish a frame. It commits three errors covered in this module, combined. Find them all.',
            buggyCode: `/* User space: wait for the GPU to finish rendering (pseudo-code) */
volatile uint32_t *reg =
    mmap_bar5_register(GRBM_STATUS);   /* map a register */

void wait_frame_done(void)
{
    /* "registers are faster than fences, poll them!" */
    while (*reg & GUI_ACTIVE_BIT)
        ;   /* spin until the GPU is idle */

    /* "it's idle, the framebuffer must be readable now" */
    read_framebuffer();
}`,
            hint: 'Error one is about "who may touch registers"; error two about "GPU idle ≠ ?"; error three about the theme of the memory lessons in this group.',
            answer:
              'Error one (permission/architecture): user space directly mapping and polling BAR5 registers should never happen in the first place — registers are kernel territory, and the correct completion notification is the fence (obtained at submission, waited on via ioctl/syncobj); that is exactly why the fence back-edge in Lesson 9 exists. Even if the mapping worked, spin-polling burns an entire CPU core. Error two (semantic mismatch): GRBM\'s "GUI_ACTIVE clear" means the engine has no work at this instant, not "your frame finished" — the GPU may have gone briefly idle before your frame even started (still queued), producing the race "waited successfully but the image is the previous frame"; completion semantics must bind to the fence sequence number of your specific submission. Error three (coherence): even with perfect timing, the data the GPU wrote to the framebuffer may still sit in L2/unflushed (Lesson 7), so a direct CPU read returns stale bytes — on the proper path, the fence\'s RELEASE_MEM comes bundled with the cache writeback, a guarantee register polling never enjoys. The common root of all three: bypassing the synchronization primitives the driver designed. Module 4 (DRM) formally introduces the user-space interfaces to fence/syncobj.',
          },
          interviewQ: {
            question: 'Where is the boundary between the kernel amdgpu driver and the Mesa user-space driver? Why do we say "the kernel driver does not draw triangles"?',
            difficulty: 'medium',
            hint: 'Walk a frame\'s lifecycle: who compiles shaders? who writes PM4? who owns memory and queues? who touches registers?',
            answer:
              'The split follows "policy vs mechanism". Mesa (RadeonSI/RADV) owns rendering policy: implementing the OpenGL/Vulkan APIs, compiling shaders (through LLVM to ISA), setting pipeline state, encoding each frame\'s draws as PM4 into IBs — "what to draw and how" is decided entirely in user space. Kernel amdgpu provides mechanism: memory management (BO/VRAM/GTT/GPUVM), command delivery (validate the IB, enqueue on the ring, ring the doorbell), synchronization (fence/syncobj), hardware lifecycle (IP init, clocks and power, reset and recovery), and multi-process isolation and arbitration. The literal evidence for "does not draw triangles": kernel code contains no triangle/vertex/texture-sampling logic whatsoever; the DRAW packet is written by Mesa, and the kernel only guarantees its safe arrival at the CP. The boundary is also the security model: user space uses the hardware only indirectly through ioctl semantics and GPUVM isolation, while registers and firmware interfaces are kernel-exclusive. Bonus: display (KMS/DCN) is the one exception where the kernel participates deeply in the rendered result — scanout configuration really does live in the kernel.',
            amdContext: 'Used to judge whether a candidate understands which layer of the stack they are applying to. People who cannot state the boundary tend to hold forth on shader optimization in a kernel-role interview — a classic way to lose points.',
          },
        },
      ],
    },
  ],
  completionChecklist: [
    'Can draw the CPU vs GPU design trade-off and explain the latency-hiding mechanism',
    'Can state the responsibilities of GC/SDMA/VCN/DCN/PSP/SMU and do the three-way gfx↔GC IP↔marketing-name conversion',
    'Can recite the work-item → wavefront → workgroup → grid hierarchy and its mapping onto SIMDs/WGPs',
    'Can hand-compute the occupancy of a kernel from its VGPR/LDS numbers',
    'Can explain the difference between VRAM/GTT/GPUVM and the cost of BO eviction',
    'Can narrate the full command journey: ring buffer → doorbell → CP → wave dispatch → fence',
    'Can distinguish RDNA vs CDNA positioning, wave modes, and product lines (as of 2026)',
    'Knows the names of the graphics pipeline fixed-function blocks, and the division of labor between the kernel driver and Mesa',
  ],
};
