import type { MicroLessonGroup } from "./micro_lesson_types";

export const module2Group2En: MicroLessonGroup = {
  "id": "hardware-kernel-driver",
  "title": "Kernel PCI Driver Development",
  "description": "Write your first PCI driver and understand the driver lifecycle and memory management",
  "lessons": [
    {
      "id": "2-2-1",
      "title": "Your First PCI Driver Skeleton",
      "duration": 25,
      "difficulty": "intermediate",
      "concept": {
        "summary": "Write a complete Linux PCI driver skeleton and understand the full driver lifecycle: module load → device discovery (probe) → device use → device removal (remove) → module unload. This is foundational to understanding the amdgpu driver architecture.",
        "keyPoints": [
          "PCI drivers register with the kernel via the pci_driver structure",
          "probe() is called when a device is discovered; remove() is called when it is removed",
          "The module_pci_driver() macro simplifies module registration and deregistration",
          "The driver must release in remove() every resource allocated in probe()",
          "pci_set_drvdata()/pci_get_drvdata() pass private data between probe and remove"
        ]
      },
      "diagram": {
        "title": "PCI Driver Lifecycle",
        "content": "\ninsmod my_driver.ko\n        |\n        v\npci_register_driver(&my_pci_driver)\n        |\n        v\nKernel scans existing PCI devices\n        |\n        +-- Matching device found (vendor:device ID match)\n        |           |\n        |           v\n        |   my_pci_probe(pdev, id)\n        |       |\n        |       +-- pci_enable_device()\n        |       +-- pci_request_regions()\n        |       +-- ioremap(BAR)\n        |       +-- request_irq()\n        |       +-- Initialize hardware\n        |       +-- pci_set_drvdata(pdev, priv)\n        |\n        v\nDevice operating normally\n        |\n        v (device removed or rmmod)\nmy_pci_remove(pdev)\n        |\n        +-- free_irq()\n        +-- iounmap(BAR)\n        +-- pci_release_regions()\n        +-- pci_disable_device()\n        |\n        v\npci_unregister_driver(&my_pci_driver)\n        |\n        v\nrmmod complete\n",
        "caption": "PCI driver lifecycle: probe() initializes resources, remove() releases them — the two must be perfectly symmetric"
      },
      "codeWalk": {
        "title": "Complete PCI Driver Skeleton",
        "language": "c",
        "code": "/* my_pci_driver.c - Minimal PCI driver skeleton */\n#include <linux/module.h>\n#include <linux/pci.h>\n#include <linux/interrupt.h>\n\n/* Private data structure: one instance per device */\nstruct my_device {\n    struct pci_dev *pdev;\n    void __iomem *mmio;    /* Virtual address of BAR2 mapping */\n    int irq;               /* Assigned IRQ number */\n    /* ... other device state ... */\n};\n\n/* Supported device ID table */\nstatic const struct pci_device_id my_pci_ids[] = {\n    { PCI_DEVICE(0x1002, 0x7480) },  /* AMD RX 7600 XT */\n    { 0, }  /* Terminator */\n};\nMODULE_DEVICE_TABLE(pci, my_pci_ids);\n\n/* Interrupt handler */\nstatic irqreturn_t my_irq_handler(int irq, void *data)\n{\n    struct my_device *dev = data;\n    /* Read interrupt status register */\n    uint32_t status = readl(dev->mmio + 0x1000);\n    if (!(status & 0x1))\n        return IRQ_NONE;  /* Not our interrupt */\n    \n    /* Clear interrupt flag */\n    writel(0x1, dev->mmio + 0x1000);\n    return IRQ_HANDLED;\n}\n\n/* probe: called when a device is discovered */\nstatic int my_pci_probe(struct pci_dev *pdev,\n                         const struct pci_device_id *id)\n{\n    struct my_device *dev;\n    int ret;\n\n    /* Allocate private data */\n    dev = devm_kzalloc(&pdev->dev, sizeof(*dev), GFP_KERNEL);\n    /* devm_* functions: automatically freed on device removal — recommended */\n    if (!dev)\n        return -ENOMEM;\n    dev->pdev = pdev;\n\n    /* Enable the PCIe device */\n    ret = pcim_enable_device(pdev);  /* pcim_* = auto-managed variant */\n    if (ret)\n        return ret;\n\n    /* Request and map BAR2 (register space) */\n    ret = pcim_iomap_regions(pdev, BIT(2), \"my_driver\");\n    if (ret)\n        return ret;\n    dev->mmio = pcim_iomap_table(pdev)[2];\n\n    /* Set DMA mask */\n    ret = dma_set_mask_and_coherent(&pdev->dev, DMA_BIT_MASK(44));\n    if (ret)\n        return ret;\n\n    /* Enable MSI-X interrupts */\n    ret = pci_alloc_irq_vectors(pdev, 1, 4, PCI_IRQ_MSIX | PCI_IRQ_MSI);\n    if (ret < 0)\n        return ret;\n\n    /* Register interrupt handler */\n    ret = request_irq(pci_irq_vector(pdev, 0), my_irq_handler,\n                      0, \"my_driver\", dev);\n    if (ret)\n        goto err_free_irq_vectors;\n\n    /* Save private data for use in remove() */\n    pci_set_drvdata(pdev, dev);\n\n    dev_info(&pdev->dev, \"Device initialized successfully\\n\");\n    return 0;\n\nerr_free_irq_vectors:\n    pci_free_irq_vectors(pdev);\n    return ret;\n}\n\n/* remove: called when a device is removed */\nstatic void my_pci_remove(struct pci_dev *pdev)\n{\n    struct my_device *dev = pci_get_drvdata(pdev);\n\n    free_irq(pci_irq_vector(pdev, 0), dev);\n    pci_free_irq_vectors(pdev);\n    /* Resources allocated via devm_* are released automatically by the kernel */\n\n    dev_info(&pdev->dev, \"Device removed\\n\");\n}\n\n/* Driver structure */\nstatic struct pci_driver my_pci_driver = {\n    .name     = \"my_driver\",\n    .id_table = my_pci_ids,\n    .probe    = my_pci_probe,\n    .remove   = my_pci_remove,\n};\n\n/* Use the macro to auto-generate module_init/module_exit */\nmodule_pci_driver(my_pci_driver);\n\nMODULE_LICENSE(\"GPL\");\nMODULE_AUTHOR(\"AMD Driver Student\");\nMODULE_DESCRIPTION(\"Minimal PCI Driver Skeleton\");",
        "explanation": "This skeleton demonstrates all the key parts of a complete PCI driver. Using the `devm_*` and `pcim_*` families of functions simplifies resource management — the kernel automatically frees these resources when the device is removed, reducing the risk of memory leaks."
      },
      "miniLab": {
        "title": "Compile and Load Your First PCI Driver",
        "language": "bash",
        "code": "#!/bin/bash\n# Lab 2.2.1: Compile and test a PCI driver skeleton\n\n# Step 1: Create the driver directory\nmkdir -p ~/driver_lab/my_pci_driver\ncd ~/driver_lab/my_pci_driver\n\n# Step 2: Create the Makefile\ncat > Makefile << 'EOF'\nobj-m += my_pci_driver.o\n\nKDIR := /lib/modules/$(shell uname -r)/build\n\nall:\n\tmake -C $(KDIR) M=$(PWD) modules\n\nclean:\n\tmake -C $(KDIR) M=$(PWD) clean\nEOF\n\n# Step 3: Save the C code from the Code Walk section as my_pci_driver.c\n# (omitted here — paste the Code Walk source into the file)\n\n# Step 4: Compile the driver\necho \"=== Compiling the driver ===\"\nmake\n# On success: Building modules, stage 2.\n# Output file: my_pci_driver.ko\n\n# Step 5: Inspect the module\necho \"\"\necho \"=== Module info ===\"\nmodinfo my_pci_driver.ko\n\n# Step 6: Load the module (caution: this will attempt to bind to an AMD GPU!)\n# First unload the amdgpu driver (careful — display will go dark)\n# sudo rmmod amdgpu\n# sudo insmod my_pci_driver.ko\n# sudo dmesg | tail -20\n\n# Step 7: Safe testing approach — use a fake device ID\necho \"\"\necho \"=== Module compiled. Device ID table ===\"\nmodinfo my_pci_driver.ko | grep alias\n# alias: pci:v00001002d00007480sv*sd*bc*sc*i*",
        "expectedOutput": "=== Compiling the driver ===\nmake -C /lib/modules/6.8.0-52-generic/build M=/root/driver_lab/my_pci_driver modules\nmake[1]: Entering directory '/usr/src/linux-headers-6.8.0-52-generic'\n  CC [M]  /root/driver_lab/my_pci_driver/my_pci_driver.o\n  MODPOST /root/driver_lab/my_pci_driver/Module.symvers\n  CC [M]  /root/driver_lab/my_pci_driver/my_pci_driver.mod.o\n  LD [M]  /root/driver_lab/my_pci_driver/my_pci_driver.ko\nmake[1]: Leaving directory\n\n=== Module info ===\nfilename:       /root/driver_lab/my_pci_driver/my_pci_driver.ko\nlicense:        GPL\nauthor:         AMD Driver Student\nalias:          pci:v00001002d00007480sv*sd*bc*sc*i*"
      },
      "debugExercise": {
        "title": "Resource Leak: Failing to Clean Up in probe() Error Paths",
        "language": "c",
        "question": "Which resources does the following probe() function leak when request_irq() fails?",
        "buggyCode": "static int leaky_probe(struct pci_dev *pdev,\n                       const struct pci_device_id *id)\n{\n    void __iomem *mmio;\n    int ret;\n\n    ret = pci_enable_device(pdev);\n    if (ret) return ret;\n\n    ret = pci_request_regions(pdev, \"my_driver\");\n    if (ret) return ret;  /* Leak: missing pci_disable_device() */\n\n    mmio = ioremap(pci_resource_start(pdev, 2),\n                   pci_resource_len(pdev, 2));\n    if (!mmio) return -ENOMEM;  /* Leak: missing pci_release_regions() */\n\n    ret = request_irq(pci_irq_vector(pdev, 0), my_handler, 0, \"drv\", pdev);\n    if (ret) return ret;  /* Leak: missing iounmap() and pci_release_regions() */\n\n    return 0;\n}",
        "hint": "Every successful resource acquisition needs a matching release. Use goto labels to handle error paths cleanly.",
        "solution": "The correct approach uses goto labels: `err_iounmap: iounmap(mmio); err_release: pci_release_regions(pdev); err_disable: pci_disable_device(pdev); return ret;`. Alternatively, use the `devm_*` and `pcim_*` families — they automatically release resources when the device is removed, eliminating this class of bug entirely."
      },
      "interviewQuestion": {
        "question": "Explain the difference between devm_kzalloc() and kzalloc(), and why the devm_* family is preferred in driver development.",
        "difficulty": "medium",
        "hint": "Consider error-path handling and long-term code maintainability",
        "answer": "Memory allocated with kzalloc() must be manually freed with kfree(). In complex error paths this is easy to forget, leading to memory leaks. devm_kzalloc() binds the allocation to a struct device: when the device is removed (at device_release() time), the kernel automatically frees everything allocated through devm_*. Benefits: 1) eliminates resource-leak risk in error paths; 2) simplifies remove() — many resources no longer need explicit cleanup; 3) produces cleaner, more maintainable code. The same logic applies to pcim_enable_device() and pcim_iomap_regions() — the pcim_* variants are the auto-managed equivalents and should be preferred."
      },
      "completionChecklist": [
        "Can write a complete PCI driver skeleton from scratch",
        "Understand the symmetry requirement between probe() and remove()",
        "Know the advantages of the devm_* function family",
        "Can compile and load a kernel module",
        "Understand the purpose of pci_set_drvdata()/pci_get_drvdata()"
      ]
    },
    {
      "id": "2-2-2",
      "title": "GPU Memory Domains: VRAM vs GTT",
      "duration": 20,
      "difficulty": "intermediate",
      "concept": {
        "summary": "A GPU has multiple memory domains, each with different access speeds and use cases. Understanding these domains is essential for understanding GEM/TTM memory management. amdgpu primarily uses three domains: VRAM (GPU-local video memory), GTT (system memory mapped to the GPU via the IOMMU), and CPU (direct CPU access only).",
        "keyPoints": [
          "VRAM: GPU-local video memory, the fastest domain (>500 GB/s); CPU access is slow (must traverse PCIe)",
          "GTT (Graphics Translation Table): system RAM mapped for GPU use via the IOMMU",
          "GTT bandwidth is limited by PCIe (~32 GB/s), but capacity can be as large as system RAM",
          "The driver automatically migrates Buffer Objects between VRAM and GTT based on access patterns",
          "Under memory pressure, infrequently used VRAM contents are evicted to GTT or system memory"
        ]
      },
      "diagram": {
        "title": "GPU Memory Domain Architecture",
        "content": "\n┌─────────────────────────────────────────────────────┐\n│                    GPU (RX 7600 XT)                  │\n│                                                      │\n│  ┌──────────────────────────────────────────────┐   │\n│  │              VRAM (8 GB GDDR6)               │   │\n│  │  Bandwidth: ~288 GB/s (GPU-local access)     │   │\n│  │  CPU access: ~8 GB/s (via PCIe BAR0)         │   │\n│  │                                              │   │\n│  │  Use cases:                                  │   │\n│  │  • Render targets                            │   │\n│  │  • Textures                                  │   │\n│  │  • Vertex / index buffers                    │   │\n│  │  • GPU command buffers                       │   │\n│  └──────────────────────────────────────────────┘   │\n│                                                      │\n│  ┌──────────────────────────────────────────────┐   │\n│  │         GTT (Graphics Translation Table)     │   │\n│  │  = System RAM mapped via IOMMU               │   │\n│  │  Bandwidth: ~32 GB/s (PCIe 4.0 x8)          │   │\n│  │                                              │   │\n│  │  Use cases:                                  │   │\n│  │  • CPU-GPU shared buffers                    │   │\n│  │  • Command submission buffers (IB)           │   │\n│  │  • Overflow space when VRAM is full          │   │\n│  └──────────────────────────────────────────────┘   │\n└─────────────────────────────────────────────────────┘\n         |                    |\n         | PCIe 4.0 x8        | IOMMU\n         v                    v\n┌─────────────────────────────────────────────────────┐\n│             System Memory (System RAM, 32 GB)        │\n│  CPU access: ~50 GB/s                                │\n│  GPU access: ~32 GB/s (via PCIe + IOMMU)             │\n└─────────────────────────────────────────────────────┘\n",
        "caption": "GPU memory domains: VRAM is fastest but limited in size; GTT extends usable GPU memory by leveraging system RAM"
      },
      "codeWalk": {
        "title": "amdgpu Memory Domain Definitions and BO Allocation",
        "language": "c",
        "code": "/* include/uapi/drm/amdgpu_drm.h */\n/* Memory domain flag bits */\n#define AMDGPU_GEM_DOMAIN_CPU       0x1  /* Directly CPU-accessible */\n#define AMDGPU_GEM_DOMAIN_GTT       0x2  /* GPU accesses system memory via IOMMU */\n#define AMDGPU_GEM_DOMAIN_VRAM      0x4  /* GPU-local video memory */\n#define AMDGPU_GEM_DOMAIN_GDS       0x8  /* Global Data Store (compute) */\n#define AMDGPU_GEM_DOMAIN_GWS       0x10 /* Global Wave Sync */\n#define AMDGPU_GEM_DOMAIN_OA        0x20 /* Ordered Append */\n\n/* drivers/gpu/drm/amd/amdgpu/amdgpu_object.c */\nint amdgpu_bo_create(struct amdgpu_device *adev,\n                      struct amdgpu_bo_param *bp,\n                      struct amdgpu_bo **bo_ptr)\n{\n    struct ttm_place *places;\n    struct ttm_placement placement;\n\n    /* Set TTM placement policy based on the requested domain */\n    if (bp->domain & AMDGPU_GEM_DOMAIN_VRAM) {\n        /* Prefer VRAM; fall back to GTT */\n        places[0].fpfn = 0;\n        places[0].lpfn = 0;\n        places[0].mem_type = TTM_PL_VRAM;\n        places[0].flags = 0;\n        \n        places[1].fpfn = 0;\n        places[1].lpfn = 0;\n        places[1].mem_type = TTM_PL_TT;  /* GTT = TT in TTM */\n        places[1].flags = TTM_PL_FLAG_FALLBACK;\n        \n        placement.num_placement = 2;\n    } else if (bp->domain & AMDGPU_GEM_DOMAIN_GTT) {\n        /* GTT only */\n        places[0].mem_type = TTM_PL_TT;\n        placement.num_placement = 1;\n    }\n\n    /* Allocate the Buffer Object through TTM */\n    return ttm_bo_init_reserved(&adev->mman.bdev,\n                                 &bo->tbo,\n                                 bp->size,\n                                 ttm_bo_type_device,\n                                 &placement,\n                                 0, NULL, NULL, NULL,\n                                 &amdgpu_bo_destroy);\n}\n\n/* Query which memory domain a BO currently resides in */\nuint32_t amdgpu_bo_mem_domain(struct amdgpu_bo *bo)\n{\n    switch (bo->tbo.resource->mem_type) {\n    case TTM_PL_VRAM:\n        return AMDGPU_GEM_DOMAIN_VRAM;\n    case TTM_PL_TT:\n        return AMDGPU_GEM_DOMAIN_GTT;\n    case TTM_PL_SYSTEM:\n        return AMDGPU_GEM_DOMAIN_CPU;\n    default:\n        return 0;\n    }\n}",
        "explanation": "amdgpu manages memory domains through TTM (Translation Table Manager). When creating a Buffer Object, you specify a preferred domain (e.g., VRAM) and a fallback (e.g., GTT). TTM automatically migrates BOs between domains in response to memory pressure."
      },
      "miniLab": {
        "title": "Observe GPU Memory Domain Usage",
        "language": "bash",
        "code": "#!/bin/bash\n# Lab 2.2.2: Observe VRAM and GTT memory usage\n\n# Step 1: Read VRAM and GTT totals and current usage\necho \"=== GPU Memory Domain Usage ===\"\nGPU_CARD=$(ls /sys/class/drm/ | grep \"^card[0-9]$\" | head -1)\nCARD_PATH=\"/sys/class/drm/$GPU_CARD/device\"\n\necho \"VRAM total: $(( $(cat $CARD_PATH/mem_info_vram_total) / 1024 / 1024 )) MB\"\necho \"VRAM used:  $(( $(cat $CARD_PATH/mem_info_vram_used)  / 1024 / 1024 )) MB\"\necho \"GTT  total: $(( $(cat $CARD_PATH/mem_info_gtt_total)  / 1024 / 1024 )) MB\"\necho \"GTT  used:  $(( $(cat $CARD_PATH/mem_info_gtt_used)   / 1024 / 1024 )) MB\"\n\n# Step 2: Inspect detailed BO allocations via debugfs\necho \"\"\necho \"=== Buffer Object Allocation Details ===\"\nif [ -f /sys/kernel/debug/dri/0/amdgpu_gem_info ]; then\n    sudo cat /sys/kernel/debug/dri/0/amdgpu_gem_info | head -30\nfi\n\n# Step 3: Run a GPU workload and watch memory change\necho \"\"\necho \"=== Run glxgears and observe VRAM changes ===\"\n# Run glxgears in the background (requires mesa-utils)\nglxgears -fullscreen &\nGEARS_PID=$!\nsleep 2\n\necho \"VRAM used while running:\"\necho \"VRAM used: $(( $(cat $CARD_PATH/mem_info_vram_used) / 1024 / 1024 )) MB\"\n\nkill $GEARS_PID 2>/dev/null\nsleep 1\necho \"VRAM used after stopping:\"\necho \"VRAM used: $(( $(cat $CARD_PATH/mem_info_vram_used) / 1024 / 1024 )) MB\"\n\n# Step 4: Check eviction statistics\necho \"\"\necho \"=== Memory Eviction Statistics ===\"\nsudo cat /sys/kernel/debug/dri/0/amdgpu_eviction_stats 2>/dev/null || \\\n    echo \"Eviction stats unavailable (requires a newer kernel)\"\n\n# Step 5: Real-time monitoring with radeontop (install if needed)\necho \"\"\necho \"=== Real-Time GPU Memory Monitoring ===\"\necho \"Install: sudo apt install radeontop\"\necho \"Run:     radeontop -c -d - -l 1 | grep -E 'vram|gtt'\"\n",
        "expectedOutput": "=== GPU Memory Domain Usage ===\nVRAM total: 8192 MB\nVRAM used:   487 MB\nGTT  total: 8192 MB\nGTT  used:   156 MB\n\n=== Buffer Object Allocation Details ===\npid    1234 command Xorg:\n    0x00000001: 4096 kB VRAM (render target)\n    0x00000002: 1024 kB VRAM (texture)\n    0x00000003:  256 kB GTT  (command buffer)"
      },
      "debugExercise": {
        "title": "VRAM Overflow Causing a Sudden Performance Drop",
        "language": "bash",
        "question": "A user reports that GPU performance drops 50% suddenly while running a large game. How do you diagnose whether VRAM overflow is the cause?",
        "buggyCode": "# User symptoms:\n# - Game runs smoothly at the start (60 FPS)\n# - Frame rate drops to 30 FPS after loading a large map\n# - GPU utilization shows 100%, but frame rate is very low\n# - No error messages\n\n# How would you diagnose this?",
        "hint": "When VRAM is exhausted, the driver evicts some BOs to GTT (system memory). GPU access to those objects now travels over PCIe, dropping from ~500 GB/s to ~32 GB/s.",
        "solution": "Diagnostic steps: 1) `cat /sys/class/drm/card0/device/mem_info_vram_used` — check whether usage is approaching 8192 MB; 2) `sudo cat /sys/kernel/debug/dri/0/amdgpu_eviction_stats` — count eviction events; 3) use `radeontop` to watch VRAM and GTT usage in real time. If VRAM is full and GTT usage spikes simultaneously, large-scale eviction is occurring. Fix: lower the game's texture quality settings, or upgrade to a GPU with more VRAM."
      },
      "interviewQuestion": {
        "question": "Explain the difference between VRAM and GTT, and how the amdgpu driver decides whether to place a Buffer Object in VRAM or GTT.",
        "difficulty": "medium",
        "hint": "Analyze from four angles: bandwidth, latency, CPU access requirements, and memory pressure",
        "answer": "VRAM is GPU-local memory (GDDR6) with high bandwidth (~288 GB/s) but slow CPU access (must go through PCIe BAR). GTT is system RAM mapped via the IOMMU; GPU access speed is limited by PCIe (~32 GB/s), but the CPU can access it quickly. amdgpu placement policy: 1) render targets, textures, and other GPU-intensive BOs prefer VRAM; 2) CPU-GPU shared command buffers (IBs) prefer GTT; 3) under memory pressure, the least-recently-used (LRU) VRAM BOs are evicted to GTT; 4) users can express a preference via the domain flags passed at GEM object creation time."
      },
      "completionChecklist": [
        "Understand the bandwidth and latency differences between VRAM and GTT",
        "Know which types of data belong in VRAM and which belong in GTT",
        "Understand what triggers memory eviction",
        "Can read VRAM and GTT usage via sysfs",
        "Understand how TTM manages multiple memory domains"
      ]
    },
    {
      "id": "2-2-3",
      "title": "GPU Command Ring",
      "duration": 25,
      "difficulty": "intermediate",
      "concept": {
        "summary": "The Command Ring is the core mechanism by which the CPU submits work to the GPU. The CPU writes GPU commands into a ring buffer, then advances the Write Pointer (WPtr) to notify the GPU. The GPU reads and executes commands starting from the Read Pointer (RPtr), then advances RPtr when done. This producer-consumer model is at the heart of every GPU driver.",
        "keyPoints": [
          "A Ring Buffer is a fixed-size circular queue that stores GPU command packets",
          "The CPU is the producer: it writes commands and advances the Write Pointer (WPtr)",
          "The GPU is the consumer: it reads and executes commands starting from the Read Pointer (RPtr)",
          "A Doorbell is a special MMIO register the CPU writes to in order to notify the GPU of a new WPtr",
          "amdgpu maintains multiple rings: GFX Ring (graphics), SDMA Ring (data transfer), Compute Ring (compute)"
        ]
      },
      "diagram": {
        "title": "GPU Command Ring: How It Works",
        "content": "\nRing Buffer (located in GTT memory)\n┌─────────────────────────────────────────────────────────┐\n│  [0]  [1]  [2]  [3]  [4]  [5]  [6]  [7]  [8]  [9] ...  │\n│   ↑                   ↑                                  │\n│  RPtr               WPtr                                 │\n│  (GPU reads here)    (CPU writes here)                   │\n└─────────────────────────────────────────────────────────┘\n\nWorkflow:\n1. CPU writes commands starting at ring[WPtr]\n   ring[4] = PM4_DRAW_INDEX_2  <- draw call\n   ring[5] = vertex_count\n   ring[6] = index_addr_lo\n   ring[7] = index_addr_hi\n   WPtr = 8\n\n2. CPU writes the new WPtr to the Doorbell register\n   writel(8, doorbell_base + ring->doorbell_index * 4)\n   v  GPU is notified of new commands\n\n3. GPU reads ring[4..7] and executes the draw command\n   RPtr = 8\n\n4. GPU raises an interrupt when done\n   CPU receives the interrupt and wakes the waiting process\n\nWrap-around: when WPtr reaches the end of the buffer, it wraps to 0\nWPtr = (WPtr + cmd_size) & ring->buf_mask\n",
        "caption": "Command Ring: CPU writes commands and advances WPtr; GPU reads commands and advances RPtr; the Doorbell notifies the GPU of new work"
      },
      "codeWalk": {
        "title": "Core Ring Operations in amdgpu",
        "language": "c",
        "code": "/* drivers/gpu/drm/amd/amdgpu/amdgpu_ring.c */\n\n/* Ring data structure */\nstruct amdgpu_ring {\n    struct amdgpu_device *adev;\n    uint32_t *ring;          /* CPU virtual address of the ring buffer */\n    uint64_t gpu_addr;       /* GPU DMA address of the ring buffer */\n    unsigned ring_size;      /* Size of the ring in bytes */\n    unsigned buf_mask;       /* Wrap mask: wptr & buf_mask */\n    uint32_t wptr;           /* Write Pointer (maintained by the CPU) */\n    uint32_t rptr;           /* Read Pointer (updated by the GPU) */\n    unsigned doorbell_index; /* Index into the Doorbell register array */\n    /* ... */\n};\n\n/* Write one DWORD (4 bytes) command into the ring */\nvoid amdgpu_ring_write(struct amdgpu_ring *ring, uint32_t v)\n{\n    /* Verify the ring has space */\n    if (ring->count_dw <= 0)\n        DRM_ERROR(\"amdgpu: writing more dwords to the ring than expected!\\n\");\n    \n    ring->ring[ring->wptr++ & ring->buf_mask] = v;\n    ring->wptr &= ring->buf_mask;\n    ring->count_dw--;\n}\n\n/* Commit: advance WPtr and notify the GPU */\nvoid amdgpu_ring_commit(struct amdgpu_ring *ring)\n{\n    uint32_t count;\n    \n    /* Pad with NOPs to meet alignment requirements */\n    count = ring->align_mask + 1 - (ring->wptr & ring->align_mask);\n    ring->funcs->insert_nop(ring, count);\n    \n    mb();  /* Memory barrier: all command writes must complete before WPtr is updated */\n    \n    /* Notify the GPU of the new WPtr via the Doorbell */\n    amdgpu_ring_set_wptr(ring);\n}\n\n/* Write WPtr through the Doorbell */\nstatic void gfx_v11_ring_set_wptr_gfx(struct amdgpu_ring *ring)\n{\n    struct amdgpu_device *adev = ring->adev;\n    \n    if (ring->use_doorbell) {\n        /* Write to the Doorbell register (a special address within BAR4) */\n        *ring->wptr_cpu_addr = ring->wptr;\n        WDOORBELL64(ring->doorbell_index, ring->wptr);\n        /* WDOORBELL64 = write to the Doorbell address in BAR4 */\n    } else {\n        /* Fall back to a direct MMIO register write */\n        WREG32(mmCP_RB_WPTR, lower_32_bits(ring->wptr));\n    }\n}\n\n/* Example usage: submit a draw command */\nvoid submit_draw_command(struct amdgpu_ring *ring,\n                          uint32_t vertex_count,\n                          uint64_t index_addr)\n{\n    /* Reserve space in the ring */\n    amdgpu_ring_alloc(ring, 8);\n    \n    /* Write a PM4 draw-index packet */\n    amdgpu_ring_write(ring, PACKET3(PACKET3_DRAW_INDEX_2, 4));\n    amdgpu_ring_write(ring, 0xFFFFFFFF);        /* max_size */\n    amdgpu_ring_write(ring, lower_32_bits(index_addr));\n    amdgpu_ring_write(ring, upper_32_bits(index_addr));\n    amdgpu_ring_write(ring, vertex_count);\n    amdgpu_ring_write(ring, 0);                 /* draw_initiator */\n    \n    /* Commit: update WPtr and notify the GPU */\n    amdgpu_ring_commit(ring);\n}",
        "explanation": "The heart of the Command Ring is `amdgpu_ring_write()` and `amdgpu_ring_commit()`. After writing commands you must call commit() to update WPtr — otherwise the GPU has no idea new commands exist. The memory barrier (mb()) ensures command writes are ordered correctly with respect to the WPtr update."
      },
      "miniLab": {
        "title": "Inspect GPU Ring State",
        "language": "bash",
        "code": "#!/bin/bash\n# Lab 2.2.3: Observe GPU Command Ring state\n\n# Step 1: View the state of all rings\necho \"=== GPU Ring State ===\"\nif [ -d /sys/kernel/debug/dri/0 ]; then\n    sudo cat /sys/kernel/debug/dri/0/amdgpu_ring_gfx 2>/dev/null | head -20\n    echo \"---\"\n    sudo cat /sys/kernel/debug/dri/0/amdgpu_ring_sdma0 2>/dev/null | head -10\nfi\n\n# Step 2: Read WPtr and RPtr for each ring\necho \"\"\necho \"=== Ring Pointer State ===\"\nfor ring_file in /sys/kernel/debug/dri/0/amdgpu_ring_*; do\n    if [ -f \"$ring_file\" ]; then\n        ring_name=$(basename $ring_file)\n        echo \"Ring: $ring_name\"\n        sudo cat \"$ring_file\" 2>/dev/null | grep -E \"wptr|rptr|ready|status\" | head -5\n        echo \"---\"\n    fi\ndone\n\n# Step 3: View the GPU scheduler state\necho \"\"\necho \"=== GPU Scheduler State ===\"\nsudo cat /sys/kernel/debug/dri/0/amdgpu_sched 2>/dev/null | head -30\n\n# Step 4: Submit a simple GPU task and watch ring activity\necho \"\"\necho \"=== Submit a GPU task (using clinfo or rocm-smi) ===\"\nif command -v rocm-smi &> /dev/null; then\n    rocm-smi --showuse\nelse\n    echo \"Install rocm-smi: sudo apt install rocm-smi-lib\"\n    echo \"Or run glxgears to trigger GFX Ring activity\"\nfi",
        "expectedOutput": "=== GPU Ring State ===\nGFX ring 0 : rptr=0x00001234, wptr=0x00001234\n  ready=1\n  last_ptr=0x00001234\n  last_seq=12345\n  last_jiffies=4294967295\n\n=== GPU Scheduler State ===\nring=gfx_0.0.0, jobs: 0 in queue, 0 in flight\nring=sdma0, jobs: 0 in queue, 0 in flight"
      },
      "debugExercise": {
        "title": "GPU Hang: Ring Stops Responding",
        "language": "bash",
        "question": "A user reports a GPU hang. dmesg shows 'amdgpu: GPU reset begin'. How do you use Ring state to diagnose the problem?",
        "buggyCode": "# dmesg output:\n# [1234.567890] amdgpu 0000:01:00.0: amdgpu: GPU reset begin!\n# [1234.567891] amdgpu 0000:01:00.0: amdgpu: GPU HANG: 0x00000001\n# [1234.567892] amdgpu 0000:01:00.0: amdgpu: GRBM_STATUS=0x21003428\n# [1234.567893] amdgpu 0000:01:00.0: amdgpu: GRBM_STATUS2=0x00000000\n# [1234.567894] amdgpu 0000:01:00.0: amdgpu: CP_RB_RPTR=0x00001234\n# [1234.567895] amdgpu 0000:01:00.0: amdgpu: CP_RB_WPTR=0x00001240\n# [1234.567896] amdgpu 0000:01:00.0: amdgpu: CP_RB_RPTR is not advancing!",
        "hint": "When RPtr stops advancing while WPtr continues to grow, the GPU is stalled on a specific command. Inspecting individual bits of GRBM_STATUS reveals which engine is hung.",
        "solution": "Diagnostic steps: 1) CP_RB_RPTR not advancing means the Command Processor is stalled; 2) GRBM_STATUS=0x21003428 with bit 28 (GUI_ACTIVE) set means the GPU is still attempting to execute; 3) examine the command content at the address CP_RB_RPTR points to, to identify the specific command causing the hang; 4) common causes: invalid memory address, deadlocked semaphore, firmware bug. Recovery: amdgpu will trigger an automatic GPU reset, after which normal operation resumes."
      },
      "interviewQuestion": {
        "question": "Explain the roles of the Write Pointer and Read Pointer in the GPU Command Ring, and why a memory barrier is required before updating WPtr.",
        "difficulty": "hard",
        "hint": "Consider CPU out-of-order execution and the ordering guarantees of PCIe write transfers",
        "answer": "WPtr (Write Pointer) is maintained by the CPU and points to the next available slot for a command. RPtr (Read Pointer) is maintained by the GPU and points to the next command to execute. After the CPU writes commands, it must execute a memory barrier (mb()) before updating WPtr via the Doorbell. Why: 1) CPU out-of-order execution — modern CPUs may reorder writes, so without a barrier the GPU could see the new WPtr before the command data arrives and read uninitialized memory; 2) PCIe write ordering — PCIe does not guarantee write ordering, so the barrier ensures all command writes reach memory before the Doorbell write; 3) compiler reordering — mb() also acts as a compiler barrier, preventing the optimizer from reordering these stores."
      },
      "completionChecklist": [
        "Understand the ring buffer's circular structure and the WPtr/RPtr mechanism",
        "Know the role of the Doorbell and why it lives in BAR4",
        "Understand why a memory barrier is needed before updating WPtr",
        "Know the different ring types in amdgpu and their purposes",
        "Can inspect ring state via debugfs"
      ]
    },
    {
      "id": "2-2-4",
      "title": "GPU Firmware Loading",
      "duration": 20,
      "difficulty": "intermediate",
      "concept": {
        "summary": "A modern GPU contains multiple microcontrollers (CP, SDMA, SMU, PSP, etc.), each requiring dedicated firmware before it can function. The Linux kernel loads these firmware blobs from the filesystem via request_firmware() and then transfers them into specific GPU memory regions. Firmware load failures are one of the most common reasons GPU initialization fails.",
        "keyPoints": [
          "GPU firmware files are stored under /lib/firmware/amdgpu/",
          "Naming convention: {chip}_{component}.bin — e.g., navi33_pfp.bin (the PFP firmware for the RX 7600 XT)",
          "The PSP (Platform Security Processor) firmware loads first and handles secure boot",
          "CP (Command Processor) firmware includes PFP (Pre-Fetch Parser) and ME (Micro Engine)",
          "Firmware version must match the driver version; a mismatch causes GPU initialization failure"
        ]
      },
      "diagram": {
        "title": "GPU Firmware Load Sequence",
        "content": "\nGPU initialization begins\n        |\n        v\n1. PSP firmware (highest priority)\n   /lib/firmware/amdgpu/navi33_psp.bin\n   /lib/firmware/amdgpu/navi33_psp_14.0.0.bin\n        |\n        v\n2. SMU firmware (power management)\n   /lib/firmware/amdgpu/navi33_smu.bin\n        |\n        v\n3. GFX firmware (graphics engine)\n   navi33_pfp.bin  <- Pre-Fetch Parser\n   navi33_me.bin   <- Micro Engine\n   navi33_ce.bin   <- Constant Engine\n   navi33_rlc.bin  <- Run List Controller\n        |\n        v\n4. SDMA firmware (data transfer engine)\n   navi33_sdma.bin\n        |\n        v\n5. VCN firmware (video encode/decode)\n   navi33_vcn.bin\n        |\n        v\n6. DCN firmware (display controller)\n   (built into the amdgpu driver -- no external file needed)\n        |\n        v\nAll firmware loaded -- GPU ready\n",
        "caption": "GPU firmware loads in strict order: PSP first (secure boot), then each subsystem in sequence"
      },
      "codeWalk": {
        "title": "amdgpu Firmware Load Flow",
        "language": "c",
        "code": "/* drivers/gpu/drm/amd/amdgpu/gfx_v11_0.c */\n\n/* GFX firmware load function */\nstatic int gfx_v11_0_init_microcode(struct amdgpu_device *adev)\n{\n    char fw_name[40];\n    int err;\n    \n    /* Build the firmware filename */\n    /* chip_name = \"navi33\" (RX 7600 XT) */\n    snprintf(fw_name, sizeof(fw_name), \"amdgpu/%s_pfp.bin\",\n             adev->asic_name);\n    /* fw_name = \"amdgpu/navi33_pfp.bin\" */\n    \n    /* Request the firmware from the filesystem */\n    err = request_firmware(&adev->gfx.pfp_fw,\n                           fw_name,\n                           adev->dev);\n    if (err) {\n        dev_err(adev->dev,\n                \"Failed to load firmware \\\"%s\\\"\\n\", fw_name);\n        /* Common cause: firmware file not present.\n         * Fix: sudo apt install firmware-amd-graphics\n         * or download from https://git.kernel.org/firmware */\n        return err;\n    }\n    \n    /* Validate the firmware version */\n    const struct gfx_firmware_header_v1_0 *pfp_hdr =\n        (const void *)adev->gfx.pfp_fw->data;\n    \n    adev->gfx.pfp_fw_version = le32_to_cpu(pfp_hdr->header.ucode_version);\n    adev->gfx.pfp_feature_version = le32_to_cpu(pfp_hdr->ucode_feature_version);\n    \n    dev_info(adev->dev, \"PFP firmware version: %d.%d\\n\",\n             adev->gfx.pfp_fw_version >> 16,\n             adev->gfx.pfp_fw_version & 0xFFFF);\n    \n    /* Load ME, CE, RLC firmware similarly... */\n    return 0;\n}\n\n/* Upload firmware to the GPU */\nstatic int gfx_v11_0_cp_gfx_load_pfp_microcode(struct amdgpu_device *adev)\n{\n    const struct gfx_firmware_header_v1_0 *pfp_hdr;\n    const __le32 *fw_data;\n    unsigned fw_size;\n    int i;\n    \n    pfp_hdr = (const void *)adev->gfx.pfp_fw->data;\n    fw_data = (const __le32 *)(adev->gfx.pfp_fw->data +\n               le32_to_cpu(pfp_hdr->header.ucode_array_offset_bytes));\n    fw_size = le32_to_cpu(pfp_hdr->header.ucode_size_bytes) / 4;\n    \n    /* Stream firmware data into GPU internal SRAM via MMIO */\n    WREG32_SOC15(GC, 0, regCP_PFP_UCODE_ADDR, 0);\n    for (i = 0; i < fw_size; i++)\n        WREG32_SOC15(GC, 0, regCP_PFP_UCODE_DATA,\n                     le32_to_cpup(fw_data++));\n    WREG32_SOC15(GC, 0, regCP_PFP_UCODE_ADDR, adev->gfx.pfp_fw_version);\n    \n    return 0;\n}",
        "explanation": "Firmware loading has two stages: 1) request_firmware() reads the blob from /lib/firmware/amdgpu/ into memory; 2) the driver streams the data into GPU internal SRAM by writing through MMIO registers. Version validation ensures driver-firmware compatibility."
      },
      "miniLab": {
        "title": "Inspect and Manage GPU Firmware",
        "language": "bash",
        "code": "#!/bin/bash\n# Lab 2.2.4: Inspect AMD GPU firmware files and versions\n\n# Step 1: List installed AMD GPU firmware blobs\necho \"=== AMD GPU Firmware Files ===\"\nls /lib/firmware/amdgpu/ | grep \"navi33\\|navi31\\|navi32\" | head -20\n# navi33 = RX 7600 / 7600 XT\n# navi31 = RX 7900 XTX / XT\n# navi32 = RX 7700 / 7800 XT\n\n# Step 2: Check firmware load messages in dmesg\necho \"\"\necho \"=== Firmware Load Log ===\"\nsudo dmesg | grep -E \"amdgpu.*firmware|amdgpu.*ucode|amdgpu.*fw\" | head -20\n\n# Step 3: Read currently loaded firmware versions\necho \"\"\necho \"=== Current Firmware Versions ===\"\nGPU_CARD=$(ls /sys/class/drm/ | grep \"^card[0-9]$\" | head -1)\nif [ -f /sys/class/drm/$GPU_CARD/device/fw_version ]; then\n    cat /sys/class/drm/$GPU_CARD/device/fw_version\nfi\n\n# Read per-component firmware versions from sysfs\nfor fw_file in /sys/class/drm/$GPU_CARD/device/fw_*; do\n    if [ -f \"$fw_file\" ]; then\n        echo \"$(basename $fw_file): $(cat $fw_file)\"\n    fi\ndone\n\n# Step 4: Check firmware file sizes as a sanity check\necho \"\"\necho \"=== Firmware File Sizes ===\"\nls -lh /lib/firmware/amdgpu/navi33_*.bin 2>/dev/null | head -10\n\n# Step 5: Simulate a missing firmware scenario\necho \"\"\necho \"=== What dmesg looks like when firmware is missing ===\"\necho \"amdgpu: Failed to load firmware 'amdgpu/navi33_pfp.bin'\"\necho \"Fix: sudo apt install firmware-amd-graphics\"\necho \"Or:  sudo apt install linux-firmware\"\n",
        "expectedOutput": "=== AMD GPU Firmware Files ===\nnavi33_ce.bin\nnavi33_me.bin\nnavi33_mec.bin\nnavi33_pfp.bin\nnavi33_psp.bin\nnavi33_psp_14.0.0.bin\nnavi33_rlc.bin\nnavi33_sdma.bin\nnavi33_smu.bin\nnavi33_vcn.bin\n\n=== Firmware Load Log ===\n[    5.123456] amdgpu 0000:01:00.0: amdgpu: PSP firmware version: 14.0.0\n[    5.234567] amdgpu 0000:01:00.0: amdgpu: PFP firmware version: 3.0.0\n[    5.345678] amdgpu 0000:01:00.0: amdgpu: ME  firmware version: 3.0.0"
      },
      "debugExercise": {
        "title": "Firmware Version Mismatch Causes GPU Initialization Failure",
        "language": "bash",
        "question": "After a kernel upgrade, the GPU fails to initialize. dmesg shows 'firmware version mismatch'. How do you diagnose and fix this?",
        "buggyCode": "# dmesg error messages:\n# [    5.123] amdgpu 0000:01:00.0: amdgpu: Failed to load firmware \"amdgpu/navi33_pfp.bin\"\n# [    5.124] amdgpu 0000:01:00.0: amdgpu: Fatal error during GPU init\n# \n# Or:\n# [    5.125] amdgpu 0000:01:00.0: amdgpu: navi33_pfp.bin: firmware version 2.0\n#             but driver requires 3.0\n# [    5.126] amdgpu 0000:01:00.0: amdgpu: GPU init failed\n\n# How do you diagnose this?",
        "hint": "A newer kernel version may require newer firmware files. Check whether the firmware version in /lib/firmware/amdgpu/ satisfies what the new kernel requires.",
        "solution": "Diagnostic steps: 1) `sudo dmesg | grep 'firmware'` to see the exact version requirement; 2) `ls -la /lib/firmware/amdgpu/navi33_pfp.bin` to confirm the file exists; 3) `sudo apt update && sudo apt install --reinstall linux-firmware` to refresh the firmware package; 4) if the packaged firmware is too old, manually download the latest from https://git.kernel.org/pub/scm/linux/kernel/git/firmware/linux-firmware.git; 5) reboot after updating: `sudo reboot`."
      },
      "interviewQuestion": {
        "question": "Why does a GPU need firmware, and how are responsibilities divided between firmware and the kernel driver?",
        "difficulty": "medium",
        "hint": "Think about real-time requirements, security, and hardware complexity",
        "answer": "Firmware runs on the GPU's internal microcontrollers; the kernel driver runs on the CPU. Responsibility split — Firmware handles: 1) real-time control — GPU-internal scheduling and power-state transitions require microsecond-level response that the CPU cannot guarantee; 2) hardware abstraction — hiding differences between GPU silicon revisions behind a stable interface the driver talks to uniformly; 3) secure boot — the PSP firmware verifies signatures of all other firmware components, preventing malicious code from running on the GPU; 4) power management — the SMU firmware adjusts voltage and frequency in real time. The driver handles: 1) OS interface — implementing the DRM/KMS API; 2) memory management — allocating and managing VRAM and GTT; 3) command submission — packaging userspace commands and submitting them to the ring."
      },
      "completionChecklist": [
        "Know where AMD GPU firmware files live and how they are named",
        "Understand the roles of PSP, CP, and SMU firmware",
        "Know how request_firmware() works",
        "Can diagnose missing firmware or version mismatch problems",
        "Understand the division of responsibility between firmware and the driver"
      ]
    },
    {
      "id": "2-2-5",
      "title": "GPU Device Reset",
      "duration": 20,
      "difficulty": "advanced",
      "concept": {
        "summary": "A GPU hang is one of the most serious problems in driver development. When the GPU fails to complete a command within the timeout period, the driver must perform a GPU reset to restore normal operation. amdgpu implements a tiered reset strategy — from a soft reset up to a full Function Level Reset (FLR) — designed to recover the GPU with the smallest possible impact on other running applications.",
        "keyPoints": [
          "Hang detection: the driver periodically checks whether the ring's RPtr is advancing; a timeout triggers a reset",
          "Soft Reset: resets only the affected GPU engine without cutting power — fast, minimal user impact",
          "Hard Reset: a complete GPU reset including firmware reload — slower but more thorough",
          "FLR (Function Level Reset): resets the entire GPU function via the PCIe protocol",
          "After any reset, all GPU state must be reinitialized: rings, firmware, memory mappings, etc."
        ]
      },
      "diagram": {
        "title": "GPU Hang Detection and Reset Flow",
        "content": "\nNormal operation\n    |\n    v\namdgpu_job_timedout() is invoked\n(GPU command timed out, default threshold: 10 seconds)\n    |\n    v\nVerify it is a real hang\n    |\n    +-- Ring RPtr not advancing? --> Yes --> GPU hang confirmed\n    |\n    v\nSelect reset level\n    |\n    +-- Attempt 1: Soft Reset\n    |   Reset only the hung engine (GFX / SDMA / VCN)\n    |   Duration: ~100 ms\n    |   |\n    |   +-- Success? --> Resume normal operation\n    |   |\n    |   +-- Failure? --> Escalate to Hard Reset\n    |\n    +-- Attempt 2: Hard Reset\n    |   Reset the entire GPU and reload firmware\n    |   Duration: ~1-2 seconds\n    |   |\n    |   +-- Success? --> Resume normal operation\n    |   |\n    |   +-- Failure? --> Escalate to FLR\n    |\n    +-- Attempt 3: FLR (PCIe Function Level Reset)\n        Complete reset via the PCIe protocol\n        Duration: ~5 seconds\n        |\n        +-- Success? --> Resume normal operation\n        +-- Failure? --> Report fatal error -- system reboot required\n",
        "caption": "GPU reset uses a tiered strategy: try the least-disruptive soft reset first, escalating to progressively more thorough approaches"
      },
      "codeWalk": {
        "title": "amdgpu GPU Hang Detection and Reset",
        "language": "c",
        "code": "/* drivers/gpu/drm/amd/amdgpu/amdgpu_job.c */\n\n/* Command timeout callback (invoked by the DRM scheduler) */\nstatic enum drm_gpu_sched_stat amdgpu_job_timedout(struct drm_sched_job *s_job)\n{\n    struct amdgpu_job *job = to_amdgpu_job(s_job);\n    struct amdgpu_ring *ring = to_amdgpu_ring(s_job->sched);\n    struct amdgpu_device *adev = ring->adev;\n    \n    dev_err(adev->dev, \"GPU timeout on ring %s\\n\", ring->name);\n    \n    /* Dump GPU status registers for debugging */\n    amdgpu_device_gpu_recover(adev, job, &reset_context);\n    \n    return DRM_GPU_SCHED_STAT_TIMEOUT;\n}\n\n/* drivers/gpu/drm/amd/amdgpu/amdgpu_device.c */\n\nint amdgpu_device_gpu_recover(struct amdgpu_device *adev,\n                               struct amdgpu_job *job,\n                               struct amdgpu_reset_context *reset_context)\n{\n    int r;\n    \n    dev_info(adev->dev, \"GPU reset begin!\\n\");\n    \n    /* Step 1: Stop all ring submissions */\n    amdgpu_device_stop_pending_resets(adev);\n    \n    /* Step 2: Wait for in-flight commands to finish (or time out) */\n    amdgpu_fence_driver_force_completion(ring);\n    \n    /* Step 3: Perform the actual GPU reset */\n    r = amdgpu_device_pre_asic_reset(adev, reset_context);\n    if (r)\n        goto end;\n    \n    /* Step 4: Call the chip-specific reset function */\n    r = amdgpu_asic_reset(adev);\n    /* For RDNA3, this dispatches to gfx_v11_0_soft_reset() or\n     * amdgpu_device_pci_reset() */\n    \n    /* Step 5: Reinitialize the GPU */\n    if (!r) {\n        r = amdgpu_device_post_asic_reset(adev, reset_context);\n        /* Reloads firmware, rebuilds rings, restores memory mappings */\n    }\n    \nend:\n    if (r)\n        dev_err(adev->dev, \"GPU reset failed: %d\\n\", r);\n    else\n        dev_info(adev->dev, \"GPU reset succeeded!\\n\");\n    \n    return r;\n}\n\n/* Soft reset: reset only the GFX engine */\nstatic int gfx_v11_0_soft_reset(void *handle)\n{\n    struct amdgpu_device *adev = (struct amdgpu_device *)handle;\n    u32 grbm_soft_reset = 0;\n    \n    /* Determine which engines need resetting */\n    u32 tmp = RREG32_SOC15(GC, 0, regGRBM_STATUS);\n    if (tmp & GRBM_STATUS__CP_BUSY_MASK)\n        grbm_soft_reset |= GRBM_SOFT_RESET__SOFT_RESET_CP_MASK;\n    \n    if (grbm_soft_reset) {\n        /* Issue the soft reset */\n        WREG32_SOC15(GC, 0, regGRBM_SOFT_RESET, grbm_soft_reset);\n        tmp = RREG32_SOC15(GC, 0, regGRBM_SOFT_RESET);\n        udelay(50);  /* Wait for the reset to complete */\n        \n        /* Clear the reset bits */\n        WREG32_SOC15(GC, 0, regGRBM_SOFT_RESET, 0);\n    }\n    return 0;\n}",
        "explanation": "A GPU reset is a complex, multi-step procedure: stop submissions → wait for completion → reset hardware → reinitialize. A soft reset targets only the specific engine that hung and is fast; a hard reset resets the entire GPU and requires a firmware reload."
      },
      "miniLab": {
        "title": "Simulate and Observe GPU Hang Recovery",
        "language": "bash",
        "code": "#!/bin/bash\n# Lab 2.2.5: Observe GPU hang and reset behavior\n\n# Step 1: Check the historical GPU reset log\necho \"=== GPU Reset History ===\"\nsudo dmesg | grep -E \"GPU reset|GPU hang|GPU timeout\" | head -20\n\n# Step 2: Check the current GPU error state\necho \"\"\necho \"=== GPU Error State ===\"\nGPU_CARD=$(ls /sys/class/drm/ | grep \"^card[0-9]$\" | head -1)\ncat /sys/class/drm/$GPU_CARD/device/gpu_reset_count 2>/dev/null || \\\n    echo \"Reset count unavailable\"\n\n# Step 3: Check GPU health status\necho \"\"\necho \"=== GPU Health Status ===\"\nif command -v rocm-smi &> /dev/null; then\n    rocm-smi --showrasinfo all 2>/dev/null | head -20\nfi\n\n# Step 4: View the amdgpu error injection interface (for testing)\necho \"\"\necho \"=== Error Injection Interface ===\"\nls /sys/kernel/debug/dri/0/amdgpu_ras* 2>/dev/null | head -10\n# amdgpu_ras_ctrl:   controls RAS (Reliability, Availability, Serviceability)\n# amdgpu_ras_eeprom: records uncorrectable errors in EEPROM\n\n# Step 5: Check the GPU reset timeout setting\necho \"\"\necho \"=== GPU Timeout Setting ===\"\ncat /sys/module/amdgpu/parameters/gpu_recovery 2>/dev/null\ncat /sys/module/amdgpu/parameters/lockup_timeout 2>/dev/null || \\\n    echo \"Default timeout: 10000 ms (10 seconds)\"\n\n# Step 6: Manually trigger a GPU reset (for testing only -- use with caution)\necho \"\"\necho \"=== Manual GPU Reset (for testing only) ===\"\necho \"Method: echo 1 > /sys/kernel/debug/dri/0/amdgpu_reset_debug\"\necho \"Note: this will fail any in-flight GPU jobs, but will not destabilize the system\"\n",
        "expectedOutput": "=== GPU Reset History ===\n[12345.678] amdgpu 0000:01:00.0: amdgpu: GPU reset begin!\n[12345.679] amdgpu 0000:01:00.0: amdgpu: GPU HANG: 0x00000001\n[12347.123] amdgpu 0000:01:00.0: amdgpu: GPU reset succeeded!\n[12347.124] amdgpu 0000:01:00.0: amdgpu: GPU reset end!\n\n=== GPU Timeout Setting ===\n10000  <- default 10-second timeout"
      },
      "debugExercise": {
        "title": "Application Crashes After a GPU Reset",
        "language": "c",
        "question": "After a successful GPU reset, an OpenGL application that was running crashes with 'context lost'. Is this expected behavior? How should the driver handle it?",
        "buggyCode": "/* Errors reported by the application */\n// OpenGL error: GL_CONTEXT_LOST (0x0507)\n// Vulkan error: VK_ERROR_DEVICE_LOST\n// \n// User experience: game exits suddenly, no error dialog\n// \n// Root cause: a GPU reset invalidates all GPU contexts.\n// How should the driver notify applications?",
        "hint": "A GPU reset invalidates all GPU contexts. Modern APIs (Vulkan, OpenGL) provide a 'context lost' mechanism so applications can detect and handle this condition.",
        "solution": "This is expected behavior. After a GPU reset: 1) the driver signals an error (-ENODEV or -ECANCELED) on all pending fences; 2) the DRM scheduler notifies all affected jobs of failure; 3) the userspace driver (Mesa) receives the error and sets the GL_CONTEXT_LOST flag; 4) the application should call glGetGraphicsResetStatus() and recreate its OpenGL context. Well-engineered game engines (such as Unreal Engine) handle device lost automatically, transparently reinitializing GPU resources without a visible crash."
      },
      "interviewQuestion": {
        "question": "Describe the GPU hang detection mechanism in amdgpu, and explain why a tiered reset strategy (soft reset → hard reset → FLR) is necessary.",
        "difficulty": "hard",
        "hint": "Analyze from three angles: detection method, reset cost, and user experience",
        "answer": "Hang detection: amdgpu uses the DRM GPU scheduler's timeout mechanism. Each submitted job has a deadline (default 10 seconds). On expiry, amdgpu_job_timedout() is called, which checks whether the ring's RPtr has advanced — a genuinely busy GPU will be making progress. Tiered reset rationale: 1) minimize impact — a soft reset targets only the hung engine (e.g., GFX) while SDMA and VCN continue running, so only the affected workload is disrupted; 2) speed — soft reset ~100 ms, hard reset ~1-2 s, FLR ~5 s; prefer the fastest option; 3) recovery rate — a soft reset may be insufficient for a severe hang, requiring a more comprehensive approach; 4) compatibility — not all GPUs support FLR, so the driver must try each level in order."
      },
      "completionChecklist": [
        "Understand the GPU hang detection mechanism (RPtr not advancing)",
        "Know the differences between soft reset, hard reset, and FLR",
        "Understand why applications receive 'context lost' after a GPU reset",
        "Can identify GPU hang and reset events in dmesg",
        "Know how to check GPU reset history via sysfs"
      ]
    }
  ]
};
