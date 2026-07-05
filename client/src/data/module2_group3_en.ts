import type { MicroLessonModule } from "./micro_lesson_types";

export const module2Group3En: MicroLessonModule = {
  moduleId: "hardware",
  groupId: "group3",
  groupTitle: "GPU Memory & Device Management",
  groupDescription: "A deep dive into GPU memory domains, the Command Ring, firmware loading, and device reset — the core runtime mechanisms of the AMDGPU driver",
  lessons: [
  {
    id: "2-11-1",
    title: "2.11 GPU Memory Domains",
    duration: "18 min",
    summary: "GPU drivers must manage multiple memory regions. AMDGPU defines three primary memory domains: VRAM (video memory), GTT (system memory mapped via GART), and System RAM. Understanding these domains is the foundation for studying GEM/TTM memory management.",
    keyPoints: [
          "VRAM: GPU-local video memory, fastest access, mapped through the PCIe BAR",
          "GTT (Graphics Translation Table): system memory mapped into the GPU address space via IOMMU/GART",
          "System RAM: directly accessible by the CPU; GPU access goes through PCIe (slowest)",
          "Domain migration: the driver migrates buffer objects between domains based on access frequency",
          "AMDGPU_GEM_DOMAIN_VRAM = 0x4, AMDGPU_GEM_DOMAIN_GTT = 0x2"
        ],
    diagram: {
      title: "AMDGPU Memory Domain Architecture",
      content: `
  ┌──────────────────────────────────────────────────────────┐
  │                    GPU Address Space                     │
  │  ┌─────────────────┐    ┌──────────────────────────┐     │
  │  │   VRAM Domain   │    │      GTT Domain           │    │
  │  │  (Local VRAM)   │    │  (System RAM via GART)    │    │
  │  │                 │    │                           │    │
  │  │  ● Fastest      │    │  ● CPU/GPU shared         │    │
  │  │  ● GPU-private  │    │  ● Mapped via IOMMU       │    │
  │  │  ● Via BAR0     │    │  ● DMA transfers          │    │
  │  │                 │    │                           │    │
  │  └────────┬────────┘    └──────────┬───────────────┘     │
  │           │                        │                     │
  └───────────┼────────────────────────┼─────────────────────┘
              │ PCIe BAR0              │ IOMMU/GART
  ┌───────────▼────────────────────────▼────────────────────┐
  │                    Physical Memory                       │
  │  ┌─────────────────┐    ┌──────────────────────────┐     │
  │  │  GPU VRAM       │    │    System RAM (DDR)       │    │
  │  │  (GDDR6/HBM)    │    │    (CPU main memory)      │    │
  │  └─────────────────┘    └──────────────────────────┘     │
  └──────────────────────────────────────────────────────────┘

  Domain priority in amdgpu_bo_create:
  VRAM > GTT > System RAM
  The driver automatically migrates BOs based on GPU access frequency
`,
      caption: "Physical mapping relationships among AMDGPU's three memory domains"
    },
    codeWalk: {
      title: "AMDGPU Memory Domain Definitions (include/uapi/drm/amdgpu_drm.h)",
      language: "c",
      code: `/* AMDGPU memory domain flag bit definitions */
#define AMDGPU_GEM_DOMAIN_CPU    0x1  /* System memory accessible by the CPU */
#define AMDGPU_GEM_DOMAIN_GTT    0x2  /* System memory accessed by the GPU via GART */
#define AMDGPU_GEM_DOMAIN_VRAM   0x4  /* GPU-local video memory (VRAM) */
#define AMDGPU_GEM_DOMAIN_GDS    0x8  /* Global Data Store */
#define AMDGPU_GEM_DOMAIN_GWS    0x10 /* Global Wave Sync */
#define AMDGPU_GEM_DOMAIN_OA     0x20 /* Ordered Append */

/* Specify the preferred and allowed domains when creating a Buffer Object */
struct drm_amdgpu_gem_create {
    __u64 bo_size;           /* Buffer size */
    __u64 alignment;         /* Alignment requirement */
    __u64 domains;           /* Preferred memory domain (VRAM/GTT/CPU) */
    __u64 domain_flags;      /* Domain flags */
};

/* Internal BO creation in the driver */
int amdgpu_bo_create(struct amdgpu_device *adev,
                     struct amdgpu_bo_param *bp,
                     struct amdgpu_bo **bo_ptr)
{
    /* Select memory domain based on bp->domain */
    /* Try VRAM first; fall back to GTT on failure */
    /* Final fallback is System RAM */
}`,
      explanation: "AMDGPU uses flag bits to define memory domains. When creating a BO, the driver tries allocation in VRAM > GTT > System order, falling back automatically on failure. This design ensures memory allocation is both flexible and reliable."
    },
    miniLab: {
      title: "Observe AMDGPU Memory Domain Allocation",
      objective: "Use sysfs to query GPU memory domain usage",
      steps: [
          "Check VRAM usage: cat /sys/class/drm/card0/device/mem_info_vram_used",
          "Check GTT usage: cat /sys/class/drm/card0/device/mem_info_gtt_used",
          "Check total VRAM: cat /sys/class/drm/card0/device/mem_info_vram_total",
          "Install radeontop: sudo apt install radeontop",
          "Run radeontop for real-time monitoring: sudo radeontop -d -",
          "Observe how VRAM usage changes while running a 3D application"
        ],
      expectedOutput: "mem_info_vram_used: 512000000 (~512 MB)\nmem_info_gtt_used: 128000000 (~128 MB)\nmem_info_vram_total: 17179869184 (16 GB for RX 7600 XT)"
    },
    debugExercise: {
      title: "Memory Domain Allocation Error",
      language: "c",
      question: "Identify and explain the problem in the following code",
      buggyCode: `/* Problem: what issue does this code cause? */
struct drm_amdgpu_gem_create args = {
    .bo_size = 1024 * 1024 * 1024,  /* 1 GB */
    .alignment = 4096,
    .domains = AMDGPU_GEM_DOMAIN_VRAM,  /* VRAM only */
    .domain_flags = 0,
};
/* Assume the GPU only has 512 MB of VRAM */
ret = ioctl(fd, DRM_IOCTL_AMDGPU_GEM_CREATE, &args);
if (ret == 0) {
    printf("Success!\n");
}`,
      hint: "When VRAM is insufficient, how does the driver handle it? How should the domains field be set to allow a fallback?",
      solution: "Set domains = AMDGPU_GEM_DOMAIN_VRAM | AMDGPU_GEM_DOMAIN_GTT. This allows the driver to fall back to the GTT domain when VRAM is insufficient, avoiding allocation failure."
    },
    interviewQuestion: {
      question: "Explain the difference between the VRAM and GTT memory domains in AMDGPU, and under what circumstances the driver migrates buffer objects between them.",
      hint: "Consider three factors: GPU access speed, CPU access requirements, and memory pressure",
      answer: "VRAM is GPU-local video memory (GDDR6/HBM), fastest to access, mapped through PCIe BAR0. GTT is system memory mapped into the GPU address space via GART/IOMMU — both the CPU and GPU can access it, but GPU access is slower. The driver migrates BOs in these situations: 1) when VRAM pressure is high, infrequently used BOs are moved to GTT; 2) when CPU access is frequent, BOs are moved to GTT or system memory; 3) when GPU access is frequent, BOs are moved back to VRAM. The TTM memory manager orchestrates this migration process."
    },
    completionChecklist: [
          "Can explain the differences among VRAM, GTT, and System RAM",
          "Know the values and meanings of AMDGPU_GEM_DOMAIN_* flags",
          "Understand why multiple domains should be specified to allow fallback",
          "Can query GPU memory usage via sysfs"
        ]
  },
  {
    id: "2-12-1",
    title: "2.12 Command Ring Buffer",
    duration: "20 min",
    summary: "The GPU cannot directly execute commands sent by the CPU. Instead, the CPU writes commands into a ring buffer, and the GPU's Command Processor (CP) reads and executes them from there. This is the core scheduling mechanism of the GPU driver and the foundation of the AMDGPU scheduler.",
    keyPoints: [
          "A Ring Buffer is a circular queue: the CPU writes (write pointer) and the GPU reads (read pointer)",
          "AMDGPU has several ring types: GFX ring (graphics), SDMA ring (memory copy), Compute ring (compute)",
          "Packet: a command unit in the ring, containing a packet type, opcode, and parameters",
          "Fence: a synchronization marker inserted into the ring; the CPU waits for the GPU to reach a specific position",
          "When the ring is full, the CPU must wait for the GPU to consume commands before writing more"
        ],
    diagram: {
      title: "GPU Command Ring Buffer: How It Works",
      content: `
  CPU Side                            GPU Side
  ┌──────────────┐                   ┌──────────────────┐
  │  User Space  │                   │  Command         │
  │  (Vulkan/GL) │                   │  Processor (CP)  │
  └──────┬───────┘                   └────────┬─────────┘
         │ ioctl                               │ reads commands
         ▼                                     │
  ┌──────────────┐  writes commands            │
  │  amdgpu      │──────────────────────────►  │
  │  scheduler   │                             │
  └──────────────┘                             │

  Ring Buffer (circular queue):
  ┌───┬───┬───┬───┬───┬───┬───┬───┐
  │PKT│PKT│PKT│PKT│   │   │   │   │
  └───┴───┴───┴───┴───┴───┴───┴───┘
        ▲               ▲
        │               │
     rptr (GPU reads)  wptr (CPU writes)
     GPU executed up   CPU has written
     to this point     up to this point

  Packet structure:
  ┌──────────────┬──────────┬─────────────────┐
  │  Header      │  Opcode  │  Data/Params    │
  │  (type/size) │          │                 │
  └──────────────┴──────────┴─────────────────┘

  Fence mechanism:
  Ring: [CMD1][CMD2][FENCE_VALUE=42][CMD3]
                         │
                         └── GPU writes 42 into the fence buffer
                             CPU polls until it reads 42
`,
      caption: "The rptr/wptr mechanism of the Ring Buffer and the Fence synchronization principle"
    },
    codeWalk: {
      title: "AMDGPU Ring Core Structures (drivers/gpu/drm/amd/amdgpu/amdgpu_ring.h)",
      language: "c",
      code: `/* AMDGPU Ring core data structure */
struct amdgpu_ring {
    struct amdgpu_device    *adev;
    const struct amdgpu_ring_funcs *funcs;

    /* Ring buffer */
    struct amdgpu_bo        *ring_obj;  /* Ring BO */
    volatile uint32_t       *ring;      /* Pointer to ring memory */
    unsigned                ring_size;  /* Ring size (bytes) */

    /* Read/write pointers */
    uint64_t                wptr;       /* CPU write pointer */
    uint64_t                wptr_old;
    uint32_t                rptr_offs;  /* GPU read pointer offset */

    /* Fence synchronization */
    struct amdgpu_fence_driver fence_drv;
    uint64_t                fence_gpu_addr;  /* GPU address of the fence */
    volatile uint32_t       *fence_cpu_addr; /* CPU address of the fence */
};

/* Write a DWORD into the ring */
static inline void amdgpu_ring_write(struct amdgpu_ring *ring,
                                      uint32_t v)
{
    ring->ring[ring->wptr++ & ring->buf_mask] = v;
}

/* Commit the ring (update the GPU's wptr register, triggering execution) */
void amdgpu_ring_commit(struct amdgpu_ring *ring)
{
    ring->funcs->set_wptr(ring);
}`,
      explanation: "The heart of the ring is wptr (CPU write position) and rptr (GPU read position). The CPU fills commands with amdgpu_ring_write(), then calls amdgpu_ring_commit() to update the GPU's wptr register. The GPU's CP detects the wptr change and begins executing the new commands."
    },
    miniLab: {
      title: "Observe AMDGPU Ring State",
      objective: "Use debugfs to inspect the real-time state of GPU rings",
      steps: [
          "Verify debugfs is mounted: mount | grep debugfs",
          "List all rings: sudo ls /sys/kernel/debug/dri/0/ | grep ring",
          "View GFX ring state: sudo cat /sys/kernel/debug/dri/0/amdgpu_ring_gfx_0.0.0",
          "View SDMA ring: sudo cat /sys/kernel/debug/dri/0/amdgpu_ring_sdma0.0.0",
          "Run glxgears, then re-read the ring state and observe wptr changes",
          "View fence state: sudo cat /sys/kernel/debug/dri/0/amdgpu_fence_info"
        ],
      expectedOutput: "GFX ring state output example:\nRing GFX_0.0.0:\n  use_doorbell = 1\n  wptr = 0x1234\n  rptr = 0x1234 (ring idle)\n  driver_hung = 0"
    },
    debugExercise: {
      title: "Ring Buffer Overflow",
      language: "c",
      question: "Identify and explain the potential problem in the following code",
      buggyCode: `/* Problem: what is the hidden risk in this code? */
void submit_commands(struct amdgpu_ring *ring, int count)
{
    int i;
    for (i = 0; i < count; i++) {
        /* Writing directly without checking available ring space */
        amdgpu_ring_write(ring, PACKET3(PACKET3_NOP, 0));
    }
    amdgpu_ring_commit(ring);
}`,
      hint: "A ring buffer has a fixed, finite size. What happens if the CPU writes faster than the GPU consumes? What function must be called before writing?",
      solution: "Call amdgpu_ring_alloc(ring, count) before writing to reserve space. That function waits until the GPU has consumed enough room. Writing directly without reserving space may overwrite commands the GPU has not yet executed, causing a GPU hang or rendering corruption."
    },
    interviewQuestion: {
      question: "Explain how the GPU Command Ring Buffer works, and how Fences achieve CPU-GPU synchronization.",
      hint: "Explain from the perspective of rptr/wptr roles, and the fence value write-and-poll mechanism",
      answer: "The Ring Buffer is a circular queue. The CPU writes commands via wptr; the GPU's CP reads and executes them via rptr. The CPU updates the wptr register to notify the GPU that new commands are waiting. A Fence is a special command inserted into the ring: when the GPU executes it, it writes a monotonically increasing value into a fence buffer in memory. The CPU polls (or waits on an interrupt) until the fence buffer reaches the expected value, confirming that all commands before the fence have completed."
    },
    completionChecklist: [
          "Can explain the roles of wptr and rptr",
          "Know the ring types available in AMDGPU",
          "Understand how Fences achieve CPU-GPU synchronization",
          "Know what the CPU should do when the ring is full"
        ]
  },
  {
    id: "2-13-1",
    title: "2.13 VRAM vs GTT: A Deep Comparison",
    duration: "15 min",
    summary: "In the AMDGPU driver, choosing the correct memory domain is critical for performance. VRAM is best for resources the GPU accesses frequently (textures, framebuffers); GTT is best for data shared between CPU and GPU (uniform buffers, staging buffers). This lesson analyzes the performance characteristics and appropriate use cases for each.",
    keyPoints: [
          "VRAM bandwidth: GDDR6 ~288 GB/s (RX 7600 XT), GDDR6 ~960 GB/s (RX 7900 XTX)",
          "GTT bandwidth: limited by PCIe, ~16 GB/s one-way on PCIe 4.0 x8 (~32 GB/s aggregate)",
          "VRAM is ideal for: textures, render targets, depth buffers, shader buffers with frequent read/write",
          "GTT is ideal for: uniform buffers (frequently updated by the CPU), staging buffers (CPU-to-GPU data transfer)",
          "Resizable BAR (ReBAR): lets the CPU access all VRAM directly, eliminating the GTT relay"
        ],
    diagram: {
      title: "VRAM vs GTT Performance Comparison",
      content: `
  Performance comparison (RX 7600 XT):

  VRAM (GDDR6):
  ┌──────────────────────────────────────────────────┐
  │  GPU Read/Write Bandwidth: ~288 GB/s             │
  │  GPU Latency: ~100 ns                            │
  │  CPU Access: via PCIe BAR (slow, ~32 GB/s)       │
  │  Use Case: textures, framebuffers, frequent GPU  │
  │            access                                │
  └──────────────────────────────────────────────────┘

  GTT (System RAM via GART):
  ┌──────────────────────────────────────────────────┐
  │  GPU Read/Write Bandwidth: ~32 GB/s (PCIe cap)   │
  │  CPU Access: ~50 GB/s (DDR5 bandwidth)           │
  │  GPU Latency: ~1000 ns (PCIe latency)            │
  │  Use Case: uniform buffers, staging, shared data │
  └──────────────────────────────────────────────────┘

  Resizable BAR (ReBAR):
  ┌─────────────────────────────────────────────────┐
  │  CPU can access all VRAM directly               │
  │  (no GTT relay required)                        │
  │  Reduces staging buffer overhead for CPU->GPU   │
  │  Requires UEFI + PCIe 4.0 support               │
  └─────────────────────────────────────────────────┘

  Data path comparison:
  Without ReBAR: CPU -> System RAM -> DMA -> VRAM  (two copies)
  With ReBAR:    CPU -> VRAM (direct write, one copy)
`,
      caption: "Bandwidth, latency, and use-case comparison between VRAM and GTT"
    },
    codeWalk: {
      title: "AMDGPU BO Domain Selection Logic (drivers/gpu/drm/amd/amdgpu/amdgpu_object.c)",
      language: "c",
      code: `/* AMDGPU BO domain selection at creation time */
int amdgpu_bo_create(struct amdgpu_device *adev,
                     struct amdgpu_bo_param *bp,
                     struct amdgpu_bo **bo_ptr)
{
    /* Translate domain flags into a TTM placement */
    amdgpu_bo_placement_from_domain(bo, bp->domain);

    /* TTM tries placement entries in order:
     * 1. VRAM first
     * 2. GTT if VRAM fails
     * 3. System if GTT fails */
    r = ttm_bo_init_reserved(&adev->mman.bdev, &bo->tbo,
                              bp->type, &bo->placement,
                              page_align, &ctx, NULL,
                              NULL, &amdgpu_bo_destroy);
    return r;
}

/* Build the TTM placement from AMDGPU domain flags */
void amdgpu_bo_placement_from_domain(struct amdgpu_bo *abo,
                                      u32 domain)
{
    struct ttm_placement *placement = &abo->placement;

    if (domain & AMDGPU_GEM_DOMAIN_VRAM) {
        places[c].mem_type = TTM_PL_VRAM;
        places[c].flags = 0;
        c++;
    }
    if (domain & AMDGPU_GEM_DOMAIN_GTT) {
        places[c].mem_type = TTM_PL_TT;
        places[c].flags = 0;
        c++;
    }
    placement->num_placement = c;
    placement->placement = places;
}`,
      explanation: "amdgpu_bo_placement_from_domain() converts user-specified AMDGPU domain flags into a TTM placement structure. TTM tries allocation in the order of the placement array, implementing the VRAM-preferred, GTT-fallback strategy."
    },
    miniLab: {
      title: "Measure the VRAM vs GTT Bandwidth Difference",
      objective: "Use tooling to measure the actual bandwidth of VRAM and GTT",
      steps: [
          "Install vulkan-tools: sudo apt install vulkan-tools",
          "View GPU memory heap info: vulkaninfo 2>/dev/null | grep -A5 heapIndex",
          "Install clinfo: sudo apt install clinfo",
          "View OpenCL memory info: clinfo | grep -i \"global mem\\|local mem\"",
          "Run glmark2 benchmark: sudo apt install glmark2 && glmark2",
          "Compare VRAM and GTT bandwidth figures (VRAM should be ~8-10x GTT)"
        ],
      expectedOutput: "Vulkan heap info example:\nheap[0]: size=16368 MiB, flags=DEVICE_LOCAL (VRAM)\nheap[1]: size=16384 MiB, flags=0 (System/GTT)\nVRAM bandwidth: ~288 GB/s\nGTT bandwidth: ~30-40 GB/s via PCIe"
    },
    debugExercise: {
      title: "Wrong Memory Domain Choice Causes Performance Bottleneck",
      language: "c",
      question: "Identify and explain the performance problem in the following code",
      buggyCode: `/* Problem: what performance issue does this texture allocation strategy create? */
struct drm_amdgpu_gem_create args = {
    .bo_size = 4096 * 4096 * 4,  /* 4K texture, 64 MB */
    .alignment = 4096,
    /* GTT only — VRAM not allowed */
    .domains = AMDGPU_GEM_DOMAIN_GTT,
    .domain_flags = 0,
};
/* This texture will be sampled by shaders millions of times per frame */`,
      hint: "Which memory domain should a texture that is frequently accessed by GPU shaders reside in? What does the PCIe bandwidth limit on GTT mean for sampling performance?",
      solution: "Set domains = AMDGPU_GEM_DOMAIN_VRAM | AMDGPU_GEM_DOMAIN_GTT. A texture sampled heavily by the GPU should prefer VRAM (288 GB/s), not GTT (32 GB/s PCIe cap). The wrong domain forces every texture sample to traverse PCIe, creating a severe performance bottleneck."
    },
    interviewQuestion: {
      question: "In the AMDGPU driver, when should you use the GTT memory domain instead of VRAM? How does Resizable BAR change this decision?",
      hint: "Consider three factors: CPU write frequency, GPU access frequency, and PCIe bandwidth",
      answer: "GTT is appropriate for data the CPU updates frequently (e.g., uniform buffers, per-frame constants), because the CPU accesses GTT at DDR bandwidth (~50 GB/s), which is faster than accessing VRAM through PCIe. VRAM is appropriate for data the GPU reads and writes intensively but the CPU rarely touches (textures, render targets). Resizable BAR allows the CPU to write directly to all of VRAM at full PCIe bandwidth, eliminating the need for staging buffers and allowing data that previously needed GTT to be placed directly in VRAM, saving one CPU-to-GPU data copy."
    },
    completionChecklist: [
          "Know the typical bandwidth figures for VRAM and GTT",
          "Can judge which resources should go in VRAM and which in GTT",
          "Understand how Resizable BAR works and its performance impact",
          "Can view GPU memory heap information with tooling"
        ]
  },
  {
    id: "2-14-1",
    title: "2.14 GPU Firmware Loading",
    duration: "18 min",
    summary: "A modern GPU contains multiple microcontrollers (CP, SDMA, SMU, PSP, etc.), each requiring firmware (microcode) to function. The AMDGPU driver loads these firmware files from /lib/firmware/amdgpu/ during initialization. A firmware load failure is one of the most common causes of GPU initialization failure.",
    keyPoints: [
          "GPU firmware types: CP microcode, SDMA firmware, SMU firmware, PSP firmware, VCN firmware",
          "Firmware file location: /lib/firmware/amdgpu/, naming format: {chip}_{ip}_{version}.bin",
          "Load sequence: request_firmware() -> validate header -> write to GPU registers",
          "PSP (Platform Security Processor): responsible for verifying and loading other firmware — the core of secure boot",
          "A firmware version mismatch is a common cause of GPU initialization failure; dmesg shows the specific error"
        ],
    diagram: {
      title: "AMDGPU Firmware Load Sequence",
      content: `
  Firmware loading order during system startup:

  amdgpu_device_init()
        │
        ▼
  amdgpu_firmware_load_multiple_fw()
        │
        ├──► PSP Firmware (loads first — handles security verification)
        │    /lib/firmware/amdgpu/navi33_psp.bin
        │
        ├──► SMU Firmware (power management)
        │    /lib/firmware/amdgpu/navi33_smu.bin
        │
        ├──► GFX CP Firmware (graphics command processor)
        │    /lib/firmware/amdgpu/navi33_pfp.bin  (Pre-Fetch Parser)
        │    /lib/firmware/amdgpu/navi33_me.bin   (Micro Engine)
        │    /lib/firmware/amdgpu/navi33_mec.bin  (MEC for compute)
        │
        ├──► SDMA Firmware (DMA engine)
        │    /lib/firmware/amdgpu/navi33_sdma.bin
        │
        └──► VCN Firmware (video encode/decode)
             /lib/firmware/amdgpu/navi33_vcn.bin

  Firmware file format:
  ┌──────────────────────────────────────────────────┐
  │  struct common_firmware_header                   │
  │  ├── size_bytes        (total file size)         │
  │  ├── header_size_bytes (header size)             │
  │  ├── ip_version_major  (IP major version)        │
  │  ├── ip_version_minor  (IP minor version)        │
  │  └── ucode_version    (microcode version)        │
  │  [firmware data...]                              │
  └──────────────────────────────────────────────────┘
`,
      caption: "AMDGPU firmware load order and firmware file format"
    },
    codeWalk: {
      title: "AMDGPU Firmware Loading Core Code (drivers/gpu/drm/amd/amdgpu/amdgpu_gfx.c)",
      language: "c",
      code: `/* GFX CP firmware loading example */
int amdgpu_gfx_cp_fw_load(struct amdgpu_device *adev,
                           const char *fw_name,
                           const struct firmware **fw)
{
    int err;
    const struct gfx_firmware_header_v1_0 *cp_hdr;

    /* 1. Request the firmware file (loaded from /lib/firmware/) */
    err = request_firmware(fw, fw_name, adev->dev);
    if (err) {
        dev_err(adev->dev, "Failed to load firmware %s\n", fw_name);
        return err;
    }

    /* 2. Validate the firmware header */
    err = amdgpu_ucode_validate(*fw);
    if (err) {
        dev_err(adev->dev, "Invalid firmware %s\n", fw_name);
        release_firmware(*fw);
        return err;
    }

    /* 3. Extract firmware version information */
    cp_hdr = (const struct gfx_firmware_header_v1_0 *)(*fw)->data;
    adev->gfx.pfp_fw_version =
        le32_to_cpu(cp_hdr->header.ucode_version);

    return 0;
}

/* Firmware path construction example (navi33 = GPU codename for RX 7600 XT) */
snprintf(fw_name, sizeof(fw_name),
         "amdgpu/%s_pfp.bin", adev->asic_name);
/* Result: "amdgpu/navi33_pfp.bin" */`,
      explanation: "request_firmware() is the standard Linux kernel firmware loading API; it loads a binary file from the /lib/firmware/ directory. After loading, AMDGPU validates the firmware header's magic number and version to ensure the firmware matches the current GPU hardware revision."
    },
    miniLab: {
      title: "Inspect RX 7600 XT Firmware Files",
      objective: "View the AMDGPU firmware files installed on the system and understand the firmware naming convention",
      steps: [
          "List all navi33 (RX 7600 XT) firmware files: ls /lib/firmware/amdgpu/navi33*",
          "Check firmware file sizes: ls -lh /lib/firmware/amdgpu/navi33*",
          "View firmware load log with dmesg: dmesg | grep -i \"amdgpu.*firmware\"",
          "Check firmware package version: dpkg -l firmware-amd-graphics 2>/dev/null || rpm -q linux-firmware",
          "Inspect the PSP firmware header: xxd /lib/firmware/amdgpu/navi33_psp.bin | head -4",
          "Compare file sizes of different IP firmwares to appreciate the complexity of each IP block"
        ],
      expectedOutput: "navi33 firmware file list:\n/lib/firmware/amdgpu/navi33_me.bin\n/lib/firmware/amdgpu/navi33_mec.bin\n/lib/firmware/amdgpu/navi33_pfp.bin\n/lib/firmware/amdgpu/navi33_psp.bin\n/lib/firmware/amdgpu/navi33_sdma.bin\n/lib/firmware/amdgpu/navi33_smc.bin\n/lib/firmware/amdgpu/navi33_vcn.bin"
    },
    debugExercise: {
      title: "Diagnosing a Firmware Load Failure",
      language: "bash",
      question: "The system dmesg shows the following errors. How do you diagnose and fix the issue?",
      buggyCode: `# dmesg shows the following errors:
[    5.234567] amdgpu 0000:03:00.0: amdgpu: Failed to load firmware "amdgpu/navi33_pfp.bin"
[    5.234568] amdgpu 0000:03:00.0: amdgpu: Fatal error during GPU init
[    5.234569] amdgpu: probe of 0000:03:00.0 failed with error -2

# Error code -2 is ENOENT (file not found)
# How do you fix this problem?`,
      hint: "Error code -2 is ENOENT, meaning the firmware file does not exist. Check the /lib/firmware/amdgpu/ directory, consider whether the firmware package is installed, and verify that the kernel version matches the firmware version.",
      solution: "Resolution steps: 1) Check firmware files: ls /lib/firmware/amdgpu/navi33*; 2) If missing, install the firmware package: sudo apt install firmware-amd-graphics or sudo dnf install linux-firmware; 3) If the kernel is too new for the packaged firmware, fetch the latest firmware from the linux-firmware git repository; 4) After updating, reload the module: sudo modprobe -r amdgpu && sudo modprobe amdgpu."
    },
    interviewQuestion: {
      question: "Which firmware components does the AMDGPU driver need to load during initialization? If firmware loading fails, how do you diagnose and fix it?",
      hint: "List the main firmware types, and explain how the error information in dmesg helps with diagnosis",
      answer: "AMDGPU must load: PSP (security processor, loads first), SMU (power management), GFX CP (PFP/ME/MEC, graphics command processing), SDMA (memory copy), VCN (video encode/decode), and others. Diagnostic steps: 1) dmesg | grep amdgpu to find the specific error; 2) error -2 (ENOENT) means the firmware file is absent — install or update the linux-firmware package; 3) error -22 (EINVAL) means a firmware version mismatch — update the kernel or firmware; 4) check the /lib/firmware/amdgpu/ directory to confirm files exist and have the correct version."
    },
    completionChecklist: [
          "Know which major firmware components AMDGPU needs to load",
          "Understand the firmware file naming convention (chip_ip_version.bin)",
          "Can diagnose firmware load failures using dmesg",
          "Know how to update AMDGPU firmware"
        ]
  },
  {
    id: "2-15-1",
    title: "2.15 GPU Device Reset",
    duration: "20 min",
    summary: "A GPU hang is one of the most troublesome problems in driver development. When the GPU stops responding, the driver must perform a device reset to restore the system. AMDGPU implements a tiered reset strategy from a soft reset to a full Function Level Reset (FLR). This is one of the most frequently asked topics in AMD driver interviews.",
    keyPoints: [
          "GPU Hang: the GPU stops processing commands, fences time out, the system may freeze",
          "Soft Reset: resets only specific IP modules in the GPU, does not affect the PCIe connection",
          "Hard Reset: full GPU reset with firmware reload, restores all state",
          "FLR (Function Level Reset): resets the entire GPU function via the PCIe FLR mechanism",
          "After a GPU Reset, all contexts are invalidated; Vulkan receives VK_ERROR_DEVICE_LOST"
        ],
    diagram: {
      title: "AMDGPU Device Reset Flow",
      content: `
  GPU Hang detection and reset flow:

  GPU timeout detection (amdgpu_job_timedout)
        │
        ▼
  ┌─────────────────────────────────────────────────┐
  │  1. Attempt Soft Reset                          │
  │     ├── Stop all rings                          │
  │     ├── Reset each IP module (GFX/SDMA/VCN)     │
  │     └── Reinitialize rings                      │
  └──────────────────┬──────────────────────────────┘
                     │ Failure
                     ▼
  ┌─────────────────────────────────────────────────┐
  │  2. Attempt Hard Reset                          │
  │     ├── Reset entire GPU ASIC                   │
  │     ├── Reload all firmware                     │
  │     └── Reinitialize all IP blocks              │
  └──────────────────┬──────────────────────────────┘
                     │ Failure
                     ▼
  ┌─────────────────────────────────────────────────┐
  │  3. PCIe FLR (Function Level Reset)             │
  │     ├── Trigger FLR via PCIe config space       │
  │     └── Full reset of PCIe function             │
  └──────────────────┬──────────────────────────────┘
                     │ Still failing
                     ▼
              System crash / reboot required

  Post-reset recovery:
  ┌─────────────────────────────────────────────────┐
  │  Notify all contexts: -ENODEV                   │
  │  Vulkan: VK_ERROR_DEVICE_LOST                   │
  │  OpenGL: GL_CONTEXT_LOST                        │
  │  Applications must recreate contexts/resources  │
  └─────────────────────────────────────────────────┘
`,
      caption: "AMDGPU tiered reset strategy and application recovery flow"
    },
    codeWalk: {
      title: "AMDGPU GPU Reset Core Code (drivers/gpu/drm/amd/amdgpu/amdgpu_device.c)",
      language: "c",
      code: `/* GPU hang timeout handler */
static enum drm_gpu_sched_stat
amdgpu_job_timedout(struct drm_sched_job *s_job)
{
    struct amdgpu_job *job = to_amdgpu_job(s_job);
    struct amdgpu_device *adev = job->adev;

    dev_err(adev->dev, "GPU job timed out, attempting reset\n");

    /* Trigger a GPU reset */
    amdgpu_device_gpu_recover(adev, job, &reset_context);
    return DRM_GPU_SCHED_STAT_RESET;
}

/* GPU reset main function */
int amdgpu_device_gpu_recover(struct amdgpu_device *adev,
                               struct amdgpu_job *job,
                               struct amdgpu_reset_context *reset_context)
{
    int r;

    /* 1. Notify all contexts that the GPU is resetting */
    amdgpu_device_set_mp1_state(adev);

    /* 2. Stop all schedulers */
    amdgpu_amdkfd_pre_reset(adev);

    /* 3. Perform the actual reset */
    r = amdgpu_do_asic_reset(adev, reset_context);

    /* 4. Post-reset recovery */
    amdgpu_reset_capture_coredump(adev);

    /* 5. Notify applications that the reset is complete */
    drm_sched_start(&ring->sched, true);

    return r;
}

/* Check whether the GPU is hung (reading a register returns 0xffffffff) */
bool amdgpu_device_is_hung(struct amdgpu_device *adev)
{
    uint32_t val = RREG32(mmMC_VM_FB_LOCATION_BASE);
    return (val == 0xffffffff);
}`,
      explanation: "amdgpu_job_timedout() is the DRM scheduler's timeout callback, invoked when a fence wait times out. It triggers amdgpu_device_gpu_recover(), which attempts recovery in the order: soft reset -> hard reset -> FLR. After the reset, all contexts receive an error notification and applications must recreate their GPU resources."
    },
    miniLab: {
      title: "Monitor GPU Reset Statistics",
      objective: "Monitor GPU reset events via sysfs and dmesg",
      steps: [
          "View the current GPU reset count: cat /sys/class/drm/card0/device/gpu_reset_count",
          "View the GPU hang detection setting: cat /sys/module/amdgpu/parameters/gpu_recovery",
          "Enable verbose logging: sudo sh -c \"echo 0x1ff > /sys/module/amdgpu/parameters/debug_mask\"",
          "Monitor reset log in dmesg: sudo dmesg -w | grep -i \"reset\\|hang\\|timeout\"",
          "Run a stress test: sudo apt install stress-ng && stress-ng --gpu 1 --timeout 30s",
          "Check how the reset count changed: cat /sys/class/drm/card0/device/gpu_reset_count"
        ],
      expectedOutput: "GPU reset log in dmesg (example):\n[  123.456] amdgpu 0000:03:00.0: amdgpu: GPU reset begin!\n[  123.789] amdgpu 0000:03:00.0: amdgpu: GPU reset succeeded\n[  123.790] amdgpu 0000:03:00.0: amdgpu: GPU reset end!\ngpu_reset_count: 1"
    },
    debugExercise: {
      title: "Application Crashes After a GPU Reset",
      language: "c",
      question: "What happens to the following Vulkan code after a GPU reset? Explain and fix the problem.",
      buggyCode: `/* Problem: what happens to this Vulkan code after a GPU reset? */
VkResult result = vkQueueSubmit(queue, 1, &submitInfo, fence);
if (result != VK_SUCCESS) {
    printf("Submit failed: %d\n", result);
    exit(1);  /* Exits immediately without attempting recovery */
}

result = vkWaitForFences(device, 1, &fence, VK_TRUE, UINT64_MAX);
/* When a GPU reset occurs, this returns VK_ERROR_DEVICE_LOST */
if (result != VK_SUCCESS) {
    printf("Wait failed\n");
    exit(1);  /* Also exits immediately */
}`,
      hint: "VK_ERROR_DEVICE_LOST is the standard Vulkan error code for a GPU reset. How should a robust application handle this error?",
      solution: "A robust application should: 1) catch VK_ERROR_DEVICE_LOST; 2) destroy all Vulkan objects; 3) destroy the VkDevice and VkInstance; 4) recreate the VkInstance and VkDevice; 5) recreate all resources; 6) resume rendering from the most recent checkpoint. This is Vulkan's device-lost recovery mechanism."
    },
    interviewQuestion: {
      question: "When the GPU hangs, how does the AMDGPU driver detect it and recover? Describe the complete reset flow and explain how applications learn about the GPU reset.",
      hint: "Start from fence timeout detection, describe the tiered reset strategy, and mention the Vulkan/OpenGL error codes",
      answer: "GPU hang detection: the DRM scheduler sets a timeout timer for each job; when a fence times out, amdgpu_job_timedout() is called. Reset flow: 1) Soft Reset — reset the specific IP module (fastest, does not affect PCIe); 2) Hard Reset — full GPU ASIC reset and firmware reload; 3) PCIe FLR — complete reset via the PCIe configuration space FLR bit. Applications learn about the reset: Vulkan receives VK_ERROR_DEVICE_LOST, OpenGL receives GL_CONTEXT_LOST, and applications must recreate all GPU resources."
    },
    completionChecklist: [
          "Can explain the GPU hang detection mechanism (fence timeout)",
          "Know AMDGPU's three-tier reset strategy (Soft/Hard/FLR)",
          "Understand the meaning of Vulkan's VK_ERROR_DEVICE_LOST",
          "Know how to monitor GPU resets using dmesg and sysfs"
        ]
  }
  ]
};

// Total lessons: 5
