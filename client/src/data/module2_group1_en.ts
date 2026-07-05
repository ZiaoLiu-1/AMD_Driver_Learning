import type { MicroLessonGroup } from "./micro_lesson_types";

export const module2Group1En: MicroLessonGroup = {
  "id": "hardware-pcie",
  "title": "PCIe Protocol Basics",
  "description": "Understand the PCIe bus protocol, device enumeration, and memory mapping mechanisms",
  "lessons": [
    {
      "id": "2-1-1",
      "title": "What Is a PCI Device",
      "duration": 15,
      "difficulty": "beginner",
      "concept": {
        "summary": "PCIe (Peripheral Component Interconnect Express) is the bus standard that connects high-speed peripherals like GPUs and NVMe SSDs in modern computers. A GPU is a PCIe device, and the Linux kernel communicates with it over the PCIe bus.",
        "keyPoints": [
          "PCIe is a point-to-point serial bus that replaced the older parallel PCI bus",
          "Each PCIe device has a unique BDF address: Bus:Device.Function",
          "PCIe transfers data over Lanes; x16 means 16 Lanes",
          "AMD RX 7600 XT uses a PCIe 4.0 x8 interface",
          "The Linux kernel exposes all PCIe devices via /sys/bus/pci/devices/"
        ]
      },
      "diagram": {
        "title": "PCIe Device Position in the System",
        "content": "\nCPU\n |\n +-- PCIe Root Complex\n      |\n      +-- PCIe Switch\n      |    |\n      |    +-- GPU (Bus:01 Dev:00 Func:00)  \u2190 AMD RX 7600 XT\n      |    |    BDF: 0000:01:00.0\n      |    |\n      |    +-- NVMe SSD (Bus:02 Dev:00 Func:00)\n      |         BDF: 0000:02:00.0\n      |\n      +-- PCIe Slot (x16)\n           |\n           +-- GPU BAR0: VRAM aperture\n           +-- GPU BAR2: Doorbell\n           +-- GPU BAR5: MMIO registers\n",
        "caption": "PCIe topology: the CPU connects to the GPU via the Root Complex; each device has a unique BDF address"
      },
      "codeWalk": {
        "title": "PCI Device Structure in the Linux Kernel",
        "language": "c",
        "code": "/* include/linux/pci.h */\nstruct pci_dev {\n    struct list_head bus_list;  /* List node linking devices on the same bus */\n    struct pci_bus  *bus;       /* The PCIe bus this device is on */\n    struct pci_bus  *subordinate; /* Downstream bus (if this is a bridge) */\n\n    unsigned int    devfn;      /* Encoded Device:Function */\n    unsigned short  vendor;     /* Vendor ID, AMD = 0x1002 */\n    unsigned short  device;     /* Device ID, RX 7600 XT = 0x7480 */\n    unsigned short  class;      /* Device class, GPU = 0x0300 */\n\n    u8 revision;                /* Hardware revision */\n    u8 hdr_type;                /* Header type */\n\n    struct resource resource[DEVICE_COUNT_RESOURCE]; /* BAR resources */\n    /* BAR0-5: Base Address Registers, mapping GPU register spaces */\n};\n\n/* amdgpu_drv.c - AMD GPU PCI device ID table */\nstatic const struct pci_device_id pciidlist[] = {\n    {0x1002, 0x7480, PCI_ANY_ID, PCI_ANY_ID, 0, 0, CHIP_NAVI33}, /* RX 7600 XT */\n    {0x1002, 0x744C, PCI_ANY_ID, PCI_ANY_ID, 0, 0, CHIP_NAVI31}, /* RX 7900 XTX */\n    {0, 0, 0}  /* Terminator */\n};\nMODULE_DEVICE_TABLE(pci, pciidlist);\n/* When the kernel finds a device with vendor=0x1002 device=0x7480, it auto-loads the amdgpu module */",
        "explanation": "Linux represents each PCIe device with a `pci_dev` struct. The `pci_device_id` table tells the kernel: when an AMD (0x1002) RX 7600 XT (0x7480) device is found, load the amdgpu driver."
      },
      "miniLab": {
        "title": "Explore Your AMD GPU's PCIe Information",
        "language": "bash",
        "code": "#!/bin/bash\n# Lab 2.1.1: View AMD GPU PCIe device information\n\n# Step 1: Find the AMD GPU's BDF address\necho \"=== Finding AMD GPU ===\"\nlspci | grep -i \"AMD\\|Radeon\\|ATI\"\n# Example output: 01:00.0 VGA compatible controller: Advanced Micro Devices...\n\n# Step 2: View detailed information (replace 01:00.0 with your BDF)\nGPU_BDF=$(lspci | grep -i \"VGA.*AMD\\|AMD.*VGA\" | awk '{print $1}' | head -1)\necho \"\"\necho \"=== GPU BDF: $GPU_BDF ===\"\nlspci -v -s $GPU_BDF\n\n# Step 3: View PCIe link speed and width\necho \"\"\necho \"=== PCIe Link Info ===\"\nlspci -vv -s $GPU_BDF | grep -E \"LnkSta:|LnkCap:\"\n# LnkSta: Speed 16GT/s (ok), Width x8 (ok) \u2190 Current actual speed\n# LnkCap: Speed 16GT/s, Width x16 \u2190 Maximum supported speed\n\n# Step 4: View BAR (Base Address Register)\necho \"\"\necho \"=== BAR Memory Mappings ===\"\nlspci -v -s $GPU_BDF | grep \"Memory at\"\n# Memory at e0000000 (64-bit, prefetchable) [size=256M] \u2190 BAR0: VRAM aperture\n# Memory at f0000000 (64-bit, prefetchable) [size=2M]  \u2190 BAR2: Doorbell\n# Memory at f0200000 (32-bit, non-prefetchable) [size=512K] \u2190 BAR5: Registers\n\n# Step 5: View via sysfs\necho \"\"\necho \"=== sysfs Device Info ===\"\nls /sys/bus/pci/devices/ | grep $GPU_BDF\ncat /sys/bus/pci/devices/0000:$GPU_BDF/vendor  # Should output 0x1002\ncat /sys/bus/pci/devices/0000:$GPU_BDF/device  # Device ID",
        "expectedOutput": "=== Finding AMD GPU ===\n01:00.0 VGA compatible controller: Advanced Micro Devices, Inc. [AMD/ATI] Navi33 [Radeon RX 7600/7600 XT/7600M XT/7600S/7700S / PRO W7600] (rev c7)\n01:00.1 Audio device: Advanced Micro Devices, Inc. [AMD/ATI] Navi31 HDMI/DP Audio\n\n=== PCIe Link Info ===\nLnkCap: Speed 16GT/s (PCIe 4.0), Width x8\nLnkSta: Speed 16GT/s (ok), Width x8 (ok)\n\n=== BAR Memory Mappings ===\nMemory at e0000000 (64-bit, prefetchable) [size=256M]  \u2190 BAR0: VRAM aperture\nMemory at f0000000 (64-bit, prefetchable) [size=2M] \u2190 BAR2: Doorbell\nMemory at f0200000 (32-bit, non-prefetchable) [size=512K] \u2190 BAR5: Registers"
      },
      "debugExercise": {
        "title": "Why Is the GPU Running at x8 Instead of x16?",
        "language": "bash",
        "question": "Your motherboard has an x16 slot, but `lspci` shows the GPU running at x8 speed. Does this affect performance? How do you determine whether it's a hardware limitation or a configuration issue?",
        "buggyCode": "# Check PCIe link status\nlspci -vv -s 01:00.0 | grep LnkSta\n# Output: LnkSta: Speed 16GT/s (ok), Width x8 (downgraded)\n#                                          ^^^^^^^^^^^^^^^^^^^\n#                                          Notice: downgraded!",
        "hint": "Check the difference between LnkCap (maximum capability) and LnkSta (current status). `downgraded` means the actual speed is lower than maximum capability. Check your motherboard manual: some boards automatically reduce speed when multiple PCIe devices are installed.",
        "solution": "For the RX 7600 XT (Navi33), PCIe 4.0 x8 provides 16 GB/s bandwidth, which already exceeds the GPU's actual requirements. Only under extreme circumstances (like 4K texture streaming) would this become a bottleneck. Check the PCIe configuration in your BIOS settings to see if there's an `Auto` speed reduction option."
      },
      "interviewQuestion": {
        "question": "Explain the meaning of a PCIe BDF address, and how the Linux kernel uses BDF to uniquely identify a PCIe device.",
        "difficulty": "medium",
        "hint": "BDF = Bus:Device.Function \u2014 how many bits does each field use?",
        "answer": "BDF (Bus:Device.Function) is the unique address of a PCIe device. Bus uses 8 bits (0\u2013255, up to 256 buses), Device uses 5 bits (0\u201331, up to 32 devices per bus), Function uses 3 bits (0\u20137, up to 8 functions per device). The Linux kernel represents each device under `/sys/bus/pci/devices/` in `DDDD:BB:DD.F` format (domain:bus:device.function). An AMD GPU is typically `0000:01:00.0` (domain 0, bus 1, device 0, function 0). The GPU's audio function is `0000:01:00.1` (function 1 of the same device)."
      },
      "completionChecklist": [
        "Can find your AMD GPU's BDF address using lspci",
        "Understand PCIe BDF address meaning and field widths",
        "Can check PCIe link speed and width",
        "Understand what BAR (Base Address Register) is for",
        "Know that AMD's vendor ID is 0x1002"
      ]
    },
    {
      "id": "2-1-2",
      "title": "PCIe Enumeration Process",
      "duration": 20,
      "difficulty": "intermediate",
      "concept": {
        "summary": "PCIe enumeration is the process by which the Linux kernel discovers and configures all PCIe devices at boot time. The kernel starts from the Root Complex, recursively scans all buses, reads each device's configuration space, assigns BAR addresses, and finally calls the matching driver's probe() function.",
        "keyPoints": [
          "Enumeration is performed automatically by the PCI subsystem during kernel boot",
          "Each PCIe device has a 256-byte configuration space (extended to 4 KB for PCIe)",
          "Configuration space contains critical info: Vendor ID, Device ID, BAR registers, etc.",
          "The kernel reads config space and matches drivers by vendor:device",
          "Upon match, the driver's probe() function is called to initialize the device"
        ]
      },
      "diagram": {
        "title": "PCIe Enumeration Flow",
        "content": "\nKernel Boot\n    |\n    v\nPCI Subsystem Initialization\n    |\n    v\nScan Root Complex (Bus 0)\n    |\n    +-- Read config space at Bus 0, Dev 0, Func 0\n    |       Vendor ID: 0x8086 (Intel Root Complex)\n    |\n    +-- Discover PCIe Bridge \u2192 Recursively scan Bus 1\n    |       |\n    |       +-- Bus 1, Dev 0, Func 0\n    |               Vendor ID: 0x1002  \u2190 AMD!\n    |               Device ID: 0x7480  \u2190 RX 7600 XT\n    |               |\n    |               v\n    |           Assign BAR addresses\n    |           BAR0 \u2192 0xe0000000 (256MB VRAM aperture)\n    |           BAR2 \u2192 0xf0000000 (2MB Doorbell)\n    |           BAR5 \u2192 0xf0200000 (512KB Registers)\n    |               |\n    |               v\n    |           Match driver: amdgpu\n    |               |\n    |               v\n    |           Call amdgpu_pci_probe()\n    |               |\n    |               v\n    |           Driver initialization complete \u2713\n    |\n    v\nEnumeration complete, all devices ready\n",
        "caption": "PCIe enumeration: the kernel recursively scans buses, and upon finding the AMD GPU, calls amdgpu_pci_probe() to initialize the driver"
      },
      "codeWalk": {
        "title": "amdgpu_pci_probe() \u2014 The Driver Entry Point",
        "language": "c",
        "code": "/* drivers/gpu/drm/amd/amdgpu/amdgpu_drv.c */\n\n/* Called by the kernel when a matching PCIe device is found */\nstatic int amdgpu_pci_probe(struct pci_dev *pdev,\n                             const struct pci_device_id *ent)\n{\n    struct drm_device *ddev;\n    struct amdgpu_device *adev;\n    unsigned long flags = ent->driver_data;  /* Chip type flags */\n    int ret;\n\n    /* Step 1: Enable the PCIe device */\n    ret = pci_enable_device(pdev);\n    if (ret)\n        return ret;\n\n    /* Step 2: Request BAR resources (MMIO memory regions) */\n    ret = pci_request_regions(pdev, \"amdgpu\");\n    if (ret)\n        goto err_disable;\n\n    /* Step 3: Set DMA mask (physical memory range the GPU can access) */\n    ret = dma_set_mask_and_coherent(&pdev->dev, DMA_BIT_MASK(44));\n    /* 44 bits = 16 TB address space, standard for modern GPUs */\n\n    /* Step 4: Create DRM device (graphics driver framework) */\n    ddev = drm_dev_alloc(&amdgpu_kms_driver, &pdev->dev);\n\n    /* Step 5: Create amdgpu_device (AMD GPU core structure) */\n    adev = drm_to_adev(ddev);\n    adev->dev = &pdev->dev;\n    adev->pdev = pdev;\n    adev->flags = flags;  /* Store chip type (RDNA3, etc.) */\n\n    /* Step 6: Initialize AMD GPU hardware */\n    ret = amdgpu_device_init(adev, flags);\n    /* This is the most critical function \u2014 initializes all IP modules */\n\n    return 0;\nerr_disable:\n    pci_disable_device(pdev);\n    return ret;\n}",
        "explanation": "`amdgpu_pci_probe()` is the entry point of the entire AMD GPU driver. It completes in sequence: enable device \u2192 request BAR resources \u2192 set DMA \u2192 create DRM device \u2192 initialize GPU hardware. Understanding this function is the starting point for understanding the entire amdgpu driver."
      },
      "miniLab": {
        "title": "Observe the PCIe Enumeration Process",
        "language": "bash",
        "code": "#!/bin/bash\n# Lab 2.1.2: Observe PCIe enumeration and driver loading\n\n# Step 1: View kernel boot PCIe enumeration logs\necho \"=== PCIe Enumeration Logs ===\"\nsudo dmesg | grep -E \"pci|PCI\" | grep -i \"amd\\|radeon\\|amdgpu\" | head -20\n\n# Step 2: View amdgpu driver loading logs\necho \"\"\necho \"=== amdgpu Driver Loading Logs ===\"\nsudo dmesg | grep \"amdgpu\" | head -30\n\n# Step 3: View PCIe configuration space (raw data)\nGPU_BDF=$(lspci | grep -i \"VGA.*AMD\" | awk '{print $1}' | head -1)\necho \"\"\necho \"=== PCIe Config Space (first 64 bytes) ===\"\nsudo lspci -xxx -s $GPU_BDF | head -10\n# Offset 0x00-0x01: Vendor ID (0x1002 = AMD)\n# Offset 0x02-0x03: Device ID (0x7480 = RX 7600 XT)\n# Offset 0x10-0x27: BAR0-BAR5 addresses\n\n# Step 4: View driver binding status\necho \"\"\necho \"=== Driver Binding Status ===\"\nls -la /sys/bus/pci/devices/0000:$GPU_BDF/driver\n# Should point to /sys/bus/pci/drivers/amdgpu\n\n# Step 5: View driver binding info\necho \"\"\necho \"=== Driver Binding Info ===\"\ncat /sys/bus/pci/devices/0000:$GPU_BDF/driver/module/version 2>/dev/null || \\\n    echo \"Driver version info unavailable\"\necho \"Driver: $(readlink /sys/bus/pci/devices/0000:$GPU_BDF/driver | xargs basename)\"\n",
        "expectedOutput": "=== amdgpu Driver Loading Logs ===\n[    4.123456] amdgpu: loading driver\n[    4.234567] amdgpu 0000:01:00.0: enabling device (0000 -> 0003)\n[    4.345678] amdgpu 0000:01:00.0: BAR 0: assigned [mem 0xe0000000-0xefffffff 64bit pref]\n[    4.456789] amdgpu 0000:01:00.0: amdgpu kernel modesetting enabled.\n\n=== Driver Binding Status ===\nlrwxrwxrwx 1 root root 0 /sys/bus/pci/devices/0000:01:00.0/driver -> ../../../../bus/pci/drivers/amdgpu"
      },
      "debugExercise": {
        "title": "probe() Failure: Device Cannot Be Enabled",
        "language": "c",
        "question": "Your driver's probe() function returns -ENODEV, and the kernel log shows 'pci_enable_device failed'. What are the possible causes?",
        "buggyCode": "static int my_gpu_probe(struct pci_dev *pdev,\n                        const struct pci_device_id *ent)\n{\n    int ret;\n    \n    /* Problem: no check if device is already claimed by another driver */\n    ret = pci_enable_device(pdev);  /* Returns -EBUSY */\n    if (ret) {\n        dev_err(&pdev->dev, \"pci_enable_device failed: %d\\n\", ret);\n        return ret;\n    }\n    return 0;\n}",
        "hint": "Check /sys/bus/pci/devices/BDF/driver to see if a driver is already bound. Use `lspci -k` to view the current kernel driver in use.",
        "solution": "Before calling pci_enable_device(), check whether the device is already claimed by another driver (like vfio-pci or nouveau). Use `pci_is_enabled(pdev)` to check status. Also, in VM environments, the device may have been passed through to a VM via VFIO."
      },
      "interviewQuestion": {
        "question": "Describe the roles of probe() and remove() in a Linux PCIe device driver, and their position in the device lifecycle.",
        "difficulty": "medium",
        "hint": "Think about the complete device lifecycle: discovery \u2192 initialization \u2192 operation \u2192 removal",
        "answer": "probe() is called when the kernel discovers a matching PCIe device. It is responsible for: 1) Enabling the device (pci_enable_device); 2) Requesting and mapping BAR resources; 3) Setting the DMA mask; 4) Initializing hardware; 5) Registering the device with higher-level subsystems (like DRM). remove() is called when the device is removed or the driver is unloaded, performing the reverse: unregistering the device, releasing resources, disabling the device. These two functions form the complete lifecycle management of the driver and are core to the Linux driver model."
      },
      "completionChecklist": [
        "Understand the complete PCIe enumeration flow",
        "Know when probe() is called",
        "Can find amdgpu driver loading logs in dmesg",
        "Understand what pci_enable_device() does",
        "Know how to check a device's driver binding status"
      ]
    },
    {
      "id": "2-1-3",
      "title": "BAR & MMIO Register Access",
      "duration": 20,
      "difficulty": "intermediate",
      "concept": {
        "summary": "BAR (Base Address Register) is a memory window that a PCIe device exposes to the CPU. The GPU uses BARs to map its registers and VRAM into the CPU's physical address space. The CPU controls the GPU by reading and writing to these addresses. This mechanism is called MMIO (Memory-Mapped I/O).",
        "keyPoints": [
          "Modern AMD GPUs use 3 key BARs: BAR0 (VRAM aperture), BAR2 (Doorbell), BAR5 (MMIO registers)",
          "The CPU uses ioremap() to map BAR physical addresses to kernel virtual addresses",
          "Use readl()/writel() to access MMIO registers, not direct pointer dereference",
          "MMIO accesses bypass the CPU cache and go directly to hardware",
          "amdgpu uses RREG32/WREG32 macros to wrap MMIO access"
        ]
      },
      "diagram": {
        "title": "BAR Memory Mapping Mechanism",
        "content": "\nPhysical Address Space\n\u250c\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510\n\u2502 0x0000_0000 - 0x7FFF_FFFF: System RAM \u2502\n\u251c\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2524\n\u2502 0xe000_0000 - 0xefff_ffff: BAR0     \u2502 \u2190 GPU VRAM (256MB)\n\u2502   GPU video memory mapped here      \u2502\n\u251c\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2524\n\u2502 0xf000_0000 - 0xf01f_ffff: BAR2     \u2502 \u2190 Doorbell (2MB)\n\u2502   Used to notify GPU of new commands \u2502\n\u251c\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2524\n\u2502 0xf020_0000 - 0xf027_ffff: BAR5     \u2502 \u2190 GPU Registers (512KB)\n\u2502   GPU control registers              \u2502\n\u2502   Offset 0x0000: GRBM_STATUS         \u2502\n\u2502   Offset 0x2000: SDMA0_STATUS        \u2502\n\u2502   Offset 0x8000: CP_RB_RPTR          \u2502\n\u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518\n\nDriver access flow:\npci_resource_start(pdev, 5)  \u2192 Get BAR5 physical addr 0xf0200000\nioremap(0xf0200000, 0x80000)  \u2192 Map to kernel virtual addr 0xffff_8880_f020_0000\nRREG32(0x2000)               \u2192 Read SDMA0_STATUS register\n",
        "caption": "BAR maps GPU registers into the CPU address space; the driver obtains an accessible virtual address via ioremap()"
      },
      "codeWalk": {
        "title": "MMIO Initialization and Access in amdgpu",
        "language": "c",
        "code": "/* drivers/gpu/drm/amd/amdgpu/amdgpu_device.c */\n\nint amdgpu_device_init(struct amdgpu_device *adev, uint32_t flags)\n{\n    /* Step 1: Map BAR0 (VRAM, for CPU direct access to video memory) */\n    adev->mman.aper_base_kaddr = ioremap_wc(\n        pci_resource_start(adev->pdev, 0),   /* BAR0 physical address */\n        pci_resource_len(adev->pdev, 0));     /* BAR0 size (256MB) */\n    /* ioremap_wc = Write-Combining mode, good for bulk memory transfers */\n\n    /* Step 2: Map BAR5 (register space, Bonaire and later ASICs) */\n    adev->rmmio_base = pci_resource_start(adev->pdev, 5);\n    adev->rmmio_size = pci_resource_len(adev->pdev, 5);\n    adev->rmmio = ioremap(adev->rmmio_base, adev->rmmio_size);\n    /* ioremap = normal mapping, each access goes directly to hardware */\n\n    /* Step 3: Map BAR2 (Doorbell, for notifying GPU) */\n    adev->doorbell.base = pci_resource_start(adev->pdev, 2);\n    adev->doorbell.ptr = ioremap_wc(adev->doorbell.base,\n                                     adev->doorbell.size);\n    ...\n}\n\n/* Core macros for reading/writing GPU registers */\n#define RREG32(reg) amdgpu_mm_rreg(adev, (reg), false)\n#define WREG32(reg, v) amdgpu_mm_wreg(adev, (reg), (v), false)\n\nstatic uint32_t amdgpu_mm_rreg(struct amdgpu_device *adev,\n                                 uint32_t reg, bool always_indirect)\n{\n    uint32_t ret;\n    if (!always_indirect && (reg * 4) < adev->rmmio_size)\n        /* Direct MMIO read: register is within the mapped range */\n        ret = readl(((void __iomem *)adev->rmmio) + (reg * 4));\n    else {\n        /* Indirect access: use MMIO index register for out-of-range registers */\n        writel((reg), ((void __iomem *)adev->rmmio) + AMDGPU_MM_INDEX);\n        ret = readl(((void __iomem *)adev->rmmio) + AMDGPU_MM_DATA);\n    }\n    return ret;\n}\n\n/* Example: check if GPU is hung */\nuint32_t status = RREG32(mmGRBM_STATUS);\nif (status & GRBM_STATUS__GUI_ACTIVE_MASK)\n    dev_info(adev->dev, \"GPU is busy\\n\");",
        "explanation": "amdgpu maps BAR physical addresses to kernel virtual addresses via ioremap(), then wraps readl()/writel() with RREG32/WREG32 macros for register access. Register addresses are offsets from the BAR5 (rmmio) base address, multiplied by 4 to get byte offsets."
      },
      "miniLab": {
        "title": "Read GPU Register Status",
        "language": "bash",
        "code": "#!/bin/bash\n# Lab 2.1.3: Access GPU registers via sysfs/debugfs\n\n# Step 1: View BAR resource allocation\nGPU_BDF=$(lspci | grep -i \"VGA.*AMD\" | awk '{print $1}' | head -1)\necho \"=== BAR Resource Allocation ===\"\ncat /sys/bus/pci/devices/0000:$GPU_BDF/resource\n# Format: start end flags\n# flags: 0x0000 = IO, 0x0200 = MEM, 0x0204 = MEM|PREFETCH\n\n# Step 2: Read GPU registers via debugfs (requires amdgpu driver)\necho \"\"\necho \"=== GPU Status Registers ===\"\nif [ -f /sys/kernel/debug/dri/0/amdgpu_regs ]; then\n    sudo cat /sys/kernel/debug/dri/0/amdgpu_regs | grep -i \"GRBM_STATUS\" | head -5\nelse\n    echo \"debugfs unavailable, trying sysfs...\"\nfi\n\n# Step 3: View GPU memory info (via amdgpu sysfs)\necho \"\"\necho \"=== GPU Memory Info ===\"\nGPU_CARD=$(ls /sys/class/drm/ | grep \"^card[0-9]$\" | head -1)\nif [ -d /sys/class/drm/$GPU_CARD/device/mem_info_vram_total ]; then\n    VRAM_TOTAL=$(cat /sys/class/drm/$GPU_CARD/device/mem_info_vram_total)\n    VRAM_USED=$(cat /sys/class/drm/$GPU_CARD/device/mem_info_vram_used)\n    echo \"VRAM Total: $((VRAM_TOTAL / 1024 / 1024)) MB\"\n    echo \"VRAM Used: $((VRAM_USED / 1024 / 1024)) MB\"\nfi\n\n# Step 4: Read BAR memory directly with dd (for learning only, dangerous in production!)\necho \"\"\necho \"=== BAR5 First 16 Bytes (Register Space) ===\"\nBAR5_START=$(cat /sys/bus/pci/devices/0000:$GPU_BDF/resource | \\\n    awk 'NR==6{printf \"0x%s\", $1}')\necho \"BAR5 start address: $BAR5_START\"\n# Note: directly reading BAR requires root and may cause system instability",
        "expectedOutput": "=== BAR Resource Allocation ===\n0x00000000e0000000 0x00000000efffffff 0x000000000014220c  \u2190 BAR0: 256MB VRAM\n0x0000000000000000 0x0000000000000000 0x0000000000000000\n0x00000000f0000000 0x00000000f01fffff 0x000000000014220c  \u2190 BAR2: 2MB Doorbell\n0x0000000000000000 0x0000000000000000 0x0000000000000000\n0x00000000f0200000 0x00000000f0207fff 0x0000000000040200  \u2190 BAR5: 512KB Registers\n\n=== GPU Memory Info ===\nVRAM Total: 16368 MB\nVRAM Used: 512 MB"
      },
      "debugExercise": {
        "title": "MMIO Access Causing a Kernel Crash",
        "language": "c",
        "question": "The following code causes a kernel Oops when accessing GPU registers. What's wrong?",
        "buggyCode": "/* Incorrect MMIO access approach */\nstatic int bad_read_register(struct pci_dev *pdev)\n{\n    void *bar5_phys = (void *)pci_resource_start(pdev, 5);\n    \n    /* Directly using physical address to read register \u2014 this is wrong! */\n    uint32_t val = *(uint32_t *)bar5_phys;\n    printk(\"Register value: 0x%x\\n\", val);\n    return 0;\n}",
        "hint": "On x86_64 Linux, the kernel cannot directly access physical addresses. Physical addresses must first be mapped to the kernel virtual address space via ioremap().",
        "solution": "Correct approach: use ioremap() to map the physical address to a virtual address, then use readl() to read: `void __iomem *bar5 = ioremap(pci_resource_start(pdev, 5), pci_resource_len(pdev, 5)); uint32_t val = readl(bar5); iounmap(bar5);`. Directly dereferencing a physical address causes a page fault because the kernel's page table has no mapping for that physical address."
      },
      "interviewQuestion": {
        "question": "Why must MMIO access use readl()/writel() instead of regular pointer dereference?",
        "difficulty": "hard",
        "hint": "Consider the effects of compiler optimizations, memory ordering, and caching",
        "answer": "Three reasons: 1) Compiler barrier: readl()/writel() include memory barriers that prevent the compiler from reordering MMIO accesses (the compiler might think multiple writes to the same address are redundant and optimize them away); 2) CPU memory ordering: MMIO regions are marked UC (Uncacheable) or WC (Write-Combining); readl()/writel() ensure accesses bypass the CPU cache and reach hardware directly; 3) Portability: on some architectures (like IA-64), MMIO access requires special instructions; readl()/writel() encapsulate these differences. Direct pointer dereference may be optimized away by the compiler or executed out of order, causing unpredictable hardware behavior."
      },
      "completionChecklist": [
        "Understand what BARs are and which BARs a GPU typically has",
        "Know what ioremap() does and when to use it",
        "Understand the implementation of RREG32/WREG32 macros",
        "Know why you can't use pointers directly to access MMIO",
        "Can view GPU BAR resource allocation via sysfs"
      ]
    },
    {
      "id": "2-1-4",
      "title": "DMA Basics & Memory Coherency",
      "duration": 25,
      "difficulty": "intermediate",
      "concept": {
        "summary": "DMA (Direct Memory Access) allows the GPU to read and write system memory directly without CPU involvement for every data transfer. This is key to GPU high performance \u2014 the CPU only needs to set up DMA descriptors, and the GPU can autonomously complete large data transfers. However, DMA introduces cache coherency issues: data in the CPU cache may be out of sync with what the GPU sees in memory.",
        "keyPoints": [
          "DMA lets the GPU access system RAM directly without CPU mediation, at tens of GB/s bandwidth",
          "Coherent DMA: CPU and GPU always see consistent data, but lower performance",
          "Streaming DMA: higher performance, but requires manual synchronization (dma_sync_*)",
          "IOMMU provides address translation and access protection for DMA, preventing rogue devices from accessing arbitrary memory",
          "dma_alloc_coherent() allocates shared memory accessible by both CPU and GPU"
        ]
      },
      "diagram": {
        "title": "DMA Transfer & Cache Coherency",
        "content": "\n                    CPU\n                   /   \\\n              L1 Cache  L2 Cache\n                  |         |\n                  +----+----+\n                       |\n                  LLC (L3 Cache)\n                       |\n              \u250c\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2534\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510\n              \u2502   System RAM     \u2502\n              \u2502  0x1000_0000     \u2502 \u2190 DMA Buffer (physical address)\n              \u2502  \"Hello GPU\"     \u2502\n              \u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u252c\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518\n                       |\n                    IOMMU\n                    (address translation + protection)\n                       |\n                    PCIe Bus\n                       |\n                      GPU\n                   (DMA Engine)\n\nCoherent DMA scenario:\n  CPU writes \u2192 cache auto-flushed \u2192 GPU reads latest data \u2713\n  GPU writes \u2192 cache auto-invalidated \u2192 CPU reads latest data \u2713\n\nStreaming DMA scenario:\n  CPU writes \u2192 data is in cache \u2192 needs dma_sync_single_for_device() to flush\n  GPU writes \u2192 data is in memory \u2192 needs dma_sync_single_for_cpu() to invalidate cache\n",
        "caption": "DMA bypasses the CPU to access memory directly; IOMMU provides address translation and protection; cache coherency needs special handling"
      },
      "codeWalk": {
        "title": "DMA Memory Allocation in amdgpu",
        "language": "c",
        "code": "/* drivers/gpu/drm/amd/amdgpu/amdgpu_ib.c */\n/* IB = Indirect Buffer, GPU command buffer */\n\nint amdgpu_ib_get(struct amdgpu_device *adev,\n                   struct amdgpu_vm *vm,\n                   unsigned size,\n                   struct amdgpu_ib *ib)\n{\n    /* Allocate Coherent DMA memory: accessible by both CPU and GPU */\n    /* dma_alloc_coherent guarantees cache coherency, suitable for command buffers */\n    ib->ptr = dma_alloc_coherent(adev->dev,\n                                  AMDGPU_GPU_PAGE_ALIGN(size),\n                                  &ib->gpu_addr,  /* GPU-visible DMA address */\n                                  GFP_KERNEL);\n    /* ib->ptr     = CPU virtual address, CPU uses this to write commands */\n    /* ib->gpu_addr = GPU DMA address, GPU uses this to read commands */\n    \n    if (!ib->ptr)\n        return -ENOMEM;\n    \n    ib->length_dw = 0;\n    return 0;\n}\n\n/* CPU writes a command to the IB */\nvoid amdgpu_ring_write(struct amdgpu_ring *ring, uint32_t v)\n{\n    /* Directly write to coherent memory, GPU sees it immediately */\n    ring->ring[ring->wptr++ & ring->buf_mask] = v;\n}\n\n/* Streaming DMA example: transfer texture data */\nint transfer_texture(struct amdgpu_device *adev, void *data, size_t size)\n{\n    dma_addr_t dma_addr;\n    \n    /* Map CPU memory as a DMA address */\n    dma_addr = dma_map_single(adev->dev, data, size, DMA_TO_DEVICE);\n    if (dma_mapping_error(adev->dev, dma_addr))\n        return -ENOMEM;\n    \n    /* Sync: ensure CPU cache data is flushed to memory */\n    dma_sync_single_for_device(adev->dev, dma_addr, size, DMA_TO_DEVICE);\n    \n    /* Submit DMA transfer command to GPU */\n    /* ... write to SDMA ring ... */\n    \n    /* After transfer completes, unmap */\n    dma_unmap_single(adev->dev, dma_addr, size, DMA_TO_DEVICE);\n    return 0;\n}",
        "explanation": "amdgpu uses Coherent DMA for command buffers (IBs), ensuring that commands written by the CPU are immediately visible to the GPU. For large data transfers (textures, vertex buffers), it uses Streaming DMA for higher performance, but requires manual synchronization."
      },
      "miniLab": {
        "title": "Observe DMA Memory Allocation",
        "language": "bash",
        "code": "#!/bin/bash\n# Lab 2.1.4: Observe DMA memory allocation and IOMMU status\n\n# Step 1: Check if IOMMU is enabled\necho \"=== IOMMU Status ===\"\nsudo dmesg | grep -i \"iommu\\|IOMMU\" | head -10\n\n# Step 2: View AMD IOMMU info\necho \"\"\necho \"=== AMD IOMMU Info ===\"\nif [ -d /sys/class/iommu ]; then\n    ls /sys/class/iommu/\n    cat /sys/class/iommu/*/name 2>/dev/null\nfi\n\n# Step 3: View DMA memory usage\necho \"\"\necho \"=== DMA Memory Stats ===\"\ncat /proc/meminfo | grep -E \"CmaTotal|CmaFree|Bounce\"\n\n# Step 4: View amdgpu DMA allocations (via debugfs)\necho \"\"\necho \"=== amdgpu DMA Allocations ===\"\nif [ -d /sys/kernel/debug/dri/0 ]; then\n    sudo ls /sys/kernel/debug/dri/0/\n    sudo cat /sys/kernel/debug/dri/0/amdgpu_gem_info 2>/dev/null | head -20\nfi\n\n# Step 5: Check PCIe DMA mask\nGPU_BDF=$(lspci | grep -i \"VGA.*AMD\" | awk '{print $1}' | head -1)\necho \"\"\necho \"=== DMA Mask ===\"\ncat /sys/bus/pci/devices/0000:$GPU_BDF/dma_mask_bits 2>/dev/null || \\\n    echo \"DMA mask: 44 bits (16 TB address space)\"\n\n# Step 6: View IOMMU group (security isolation unit)\necho \"\"\necho \"=== IOMMU Group ===\"\nls /sys/bus/pci/devices/0000:$GPU_BDF/iommu_group/devices/ 2>/dev/null",
        "expectedOutput": "=== IOMMU Status ===\n[    0.123456] AMD-Vi: IOMMU performance counters supported\n[    0.234567] AMD-Vi: Found IOMMU at 0000:00:00.2 cap 0x40\n[    0.345678] AMD-Vi: Enabling IOMMU\n\n=== DMA Memory Stats ===\nCmaTotal:       524288 kB\nCmaFree:        512000 kB"
      },
      "debugExercise": {
        "title": "DMA Address Mapping Error Causes GPU to Access Wrong Memory",
        "language": "c",
        "question": "The following code works fine on some systems, but on IOMMU-enabled systems the GPU can't read the data. Why?",
        "buggyCode": "int bad_dma_transfer(struct pci_dev *pdev, void *cpu_buf, size_t size)\n{\n    /* Error: using physical address directly as DMA address */\n    phys_addr_t phys = virt_to_phys(cpu_buf);\n    \n    /* Write the physical address to GPU's DMA register */\n    writel(phys & 0xFFFFFFFF, gpu_reg_base + DMA_ADDR_LO);\n    writel(phys >> 32,        gpu_reg_base + DMA_ADDR_HI);\n    \n    /* Start DMA transfer */\n    writel(size, gpu_reg_base + DMA_SIZE);\n    writel(1,    gpu_reg_base + DMA_START);\n    return 0;\n}",
        "hint": "The IOMMU adds a translation layer between physical addresses and DMA addresses. The DMA address (IOVA) that the GPU sees is not the same as the physical address.",
        "solution": "You must use dma_map_single() to get the IOMMU-translated DMA address (IOVA): `dma_addr_t dma_addr = dma_map_single(&pdev->dev, cpu_buf, size, DMA_TO_DEVICE);`. Then write dma_addr (not the physical address) to the GPU register. Without an IOMMU, IOVA equals the physical address, so the code happens to work. With an IOMMU, IOVA is a virtual address, and the GPU using the physical address will access the wrong memory."
      },
      "interviewQuestion": {
        "question": "Explain the difference between Coherent DMA and Streaming DMA, and in which scenarios does amdgpu use each?",
        "difficulty": "hard",
        "hint": "Analyze from three angles: performance, cache coherency guarantees, and use cases",
        "answer": "Coherent DMA: allocated via dma_alloc_coherent(); hardware guarantees that CPU and device always see consistent data without manual synchronization. Downside: lower performance (typically marked UC or WC, bypassing cache). amdgpu uses this for command buffers (IB/Ring), page tables, semaphores, and other small buffers requiring frequent CPU-GPU interaction. Streaming DMA: mapped via dma_map_single()/dma_map_sg(); high performance (can use cache), but requires calling dma_sync_single_for_device() after CPU writes and dma_sync_single_for_cpu() after GPU writes. amdgpu uses this for textures, vertex buffers, and other large unidirectional data transfers."
      },
      "completionChecklist": [
        "Understand DMA's purpose and why GPUs need DMA",
        "Can distinguish Coherent DMA from Streaming DMA",
        "Know IOMMU's role and why you can't use physical addresses directly",
        "Understand the difference between dma_alloc_coherent() and dma_map_single()",
        "Know which scenarios amdgpu uses Coherent DMA for"
      ]
    },
    {
      "id": "2-1-5",
      "title": "MSI/MSI-X Interrupt Mechanism",
      "duration": 20,
      "difficulty": "intermediate",
      "concept": {
        "summary": "Modern GPUs use MSI-X (Message Signaled Interrupts Extended) to notify the CPU of events like task completion and errors. MSI-X is more efficient than legacy INTx interrupts, supporting multiple independent interrupt vectors so each GPU engine (GFX, SDMA, VCN, etc.) can have its own, avoiding performance issues from shared interrupts.",
        "keyPoints": [
          "Legacy INTx: shared interrupt lines, all devices compete, must query which device triggered",
          "MSI: triggers interrupts by writing to memory, no interrupt lines needed, but limited to 32 vectors",
          "MSI-X: supports up to 2048 independent interrupt vectors, each routable to a different CPU core",
          "AMD RX 7600 XT uses MSI-X, assigning independent interrupts to GFX, SDMA, VCN, etc.",
          "IRQ affinity can bind different engine interrupts to different CPU cores"
        ]
      },
      "diagram": {
        "title": "MSI-X Interrupt Flow",
        "content": "\nGPU engine completes a task\n        |\n        v\nGPU writes MSI-X message to memory address\n(address and data configured by kernel at init)\n        |\n        v\nPCIe bus transmits write request\n        |\n        v\nCPU LAPIC (Local APIC) receives interrupt\n        |\n        +-- Vector 0 \u2192 CPU 0 \u2192 amdgpu_irq_handler() \u2192 GFX done\n        +-- Vector 1 \u2192 CPU 1 \u2192 amdgpu_irq_handler() \u2192 SDMA done\n        +-- Vector 2 \u2192 CPU 2 \u2192 amdgpu_irq_handler() \u2192 VCN done\n        +-- Vector 3 \u2192 CPU 3 \u2192 amdgpu_irq_handler() \u2192 Error/fault\n        |\n        v\namdgpu_irq_handler()\n    |\n    +-- Read IH Ring (Interrupt Handler Ring)\n    |   GPU writes interrupt source info into the IH Ring\n    |\n    +-- Dispatch to specific handler\n        +-- amdgpu_gfx_irq_handler()\n        +-- amdgpu_sdma_irq_handler()\n        +-- amdgpu_fault_handler()\n",
        "caption": "MSI-X assigns independent interrupt vectors to each GPU engine, routable to different CPU cores to avoid interrupt contention"
      },
      "codeWalk": {
        "title": "MSI-X Initialization in amdgpu",
        "language": "c",
        "code": "/* drivers/gpu/drm/amd/amdgpu/amdgpu_irq.c */\n\nint amdgpu_irq_init(struct amdgpu_device *adev)\n{\n    int r, num_irqs;\n\n    /* Step 1: Enable MSI-X, request the needed number of interrupt vectors */\n    num_irqs = adev->irq.num_irqs;  /* Typically 64-128 */\n    \n    r = pci_alloc_irq_vectors(adev->pdev,\n                               1,           /* Minimum 1 */\n                               num_irqs,    /* Maximum num_irqs */\n                               PCI_IRQ_MSIX | PCI_IRQ_MSI);\n    if (r < 0) {\n        /* Fall back to legacy interrupt */\n        dev_warn(adev->dev, \"Failed to get MSI-X, falling back to MSI\\n\");\n        r = pci_alloc_irq_vectors(adev->pdev, 1, 1, PCI_IRQ_MSI);\n    }\n    adev->irq.num_irqs = r;  /* Actually allocated interrupt count */\n\n    /* Step 2: Register interrupt handler function */\n    r = request_irq(pci_irq_vector(adev->pdev, 0),  /* Vector 0 */\n                    amdgpu_irq_handler,               /* Handler function */\n                    IRQF_SHARED,                      /* Shareable */\n                    adev->irqname,                    /* Interrupt name */\n                    adev);                            /* Data passed to handler */\n\n    return r;\n}\n\n/* Interrupt handler function */\nirqreturn_t amdgpu_irq_handler(int irq, void *arg)\n{\n    struct amdgpu_device *adev = (struct amdgpu_device *)arg;\n    \n    /* Read IH Ring (Interrupt Handler Ring)\n     * GPU writes interrupt source info into this ring buffer */\n    amdgpu_ih_process(adev, &adev->irq.ih);\n    \n    return IRQ_HANDLED;\n}\n\n/* IH Ring processing: dispatch interrupts to specific handlers */\nstatic int amdgpu_ih_process(struct amdgpu_device *adev,\n                               struct amdgpu_ih_ring *ih)\n{\n    while (ih->rptr != ih->wptr) {  /* Unprocessed interrupts remain */\n        /* Read interrupt source ID */\n        uint32_t entry = ih->ring[ih->rptr & ih->ptr_mask];\n        uint32_t client_id = entry & 0xFF;\n        uint32_t src_id = (entry >> 8) & 0xFF;\n        \n        /* Dispatch to corresponding handler */\n        amdgpu_irq_dispatch(adev, client_id, src_id);\n        ih->rptr++;\n    }\n    return 0;\n}",
        "explanation": "amdgpu preferentially uses MSI-X, falling back to MSI on failure. The core of interrupt handling is the IH Ring (Interrupt Handler Ring) \u2014 the GPU writes interrupt source information into this ring buffer, and the CPU reads and dispatches to the appropriate handler function."
      },
      "miniLab": {
        "title": "View GPU Interrupt Configuration",
        "language": "bash",
        "code": "#!/bin/bash\n# Lab 2.1.5: View AMD GPU MSI-X interrupt configuration\n\n# Step 1: View GPU interrupt type\nGPU_BDF=$(lspci | grep -i \"VGA.*AMD\" | awk '{print $1}' | head -1)\necho \"=== GPU Interrupt Capabilities ===\"\nlspci -vv -s $GPU_BDF | grep -E \"MSI-X|MSI|Interrupt\"\n\n# Step 2: View assigned IRQ numbers\necho \"\"\necho \"=== GPU IRQ Assignments ===\"\ncat /proc/interrupts | grep -i \"amdgpu\\|radeon\" | head -20\n# Format: IRQ# CPU0 CPU1 ... Type DeviceName\n\n# Step 3: View MSI-X vector count\necho \"\"\necho \"=== MSI-X Vector Info ===\"\nlspci -vv -s $GPU_BDF | grep -A5 \"MSI-X\"\n# MSI-X: Enable+ Count=64 Masked-\n# Indicates 64 MSI-X vectors are enabled\n\n# Step 4: View interrupt affinity (which CPU handles which interrupt)\necho \"\"\necho \"=== Interrupt CPU Affinity ===\"\nfor irq in $(cat /proc/interrupts | grep \"amdgpu\" | awk '{print $1}' | tr -d ':' | head -5); do\n    if [ -f /proc/irq/$irq/smp_affinity_list ]; then\n        echo \"IRQ $irq \u2192 CPU $(cat /proc/irq/$irq/smp_affinity_list)\"\n    fi\ndone\n\n# Step 5: View interrupt statistics\necho \"\"\necho \"=== Interrupt Statistics (last 5 GPU interrupts) ===\"\ncat /proc/interrupts | grep \"amdgpu\" | head -5",
        "expectedOutput": "=== GPU Interrupt Capabilities ===\nCapabilities: [a0] MSI-X: Enable+ Count=64 Masked-\n        Vector table: BAR=4 offset=00000000\n        PBA: BAR=4 offset=00002000\n\n=== GPU IRQ Assignments ===\n 45:      12345       0       0       0  PCI-MSI 524288-edge  amdgpu\n 46:          0    5678       0       0  PCI-MSI 524289-edge  amdgpu\n 47:          0       0    9012       0  PCI-MSI 524290-edge  amdgpu"
      },
      "debugExercise": {
        "title": "Deadlock in an Interrupt Handler",
        "language": "c",
        "question": "The following interrupt handler occasionally causes system deadlocks under high load. Find the problem.",
        "buggyCode": "irqreturn_t bad_irq_handler(int irq, void *arg)\n{\n    struct my_gpu_dev *dev = arg;\n    \n    /* Problem: trying to acquire a sleepable mutex in interrupt context */\n    mutex_lock(&dev->big_lock);  /* This might sleep! */\n    \n    /* Process interrupt */\n    process_interrupt(dev);\n    \n    mutex_unlock(&dev->big_lock);\n    return IRQ_HANDLED;\n}",
        "hint": "Interrupt handlers run in interrupt context, which cannot sleep. mutex_lock() sleeps when the lock is contended.",
        "solution": "In interrupt context, you must use spinlocks instead of mutexes: change `mutex_lock(&dev->big_lock)` to `spin_lock(&dev->irq_lock)`. Spinlocks busy-wait instead of sleeping. If complex work is needed in interrupt handling, use a tasklet or workqueue to defer the work to process context."
      },
      "interviewQuestion": {
        "question": "Why does the AMD GPU use MSI-X instead of legacy INTx interrupts? How does MSI-X improve performance for a multi-engine GPU?",
        "difficulty": "medium",
        "hint": "Analyze from three angles: interrupt sharing, multi-core scaling, and latency",
        "answer": "MSI-X advantages over INTx: 1) No interrupt sharing: each GPU engine (GFX, SDMA0/1, VCN, DCN, etc.) gets an independent interrupt vector, no need to query which engine triggered in the handler, reducing latency; 2) Multi-core scaling: different engines' interrupts can be routed to different CPU cores (IRQ affinity), fully utilizing multi-core parallel processing; 3) No interrupt lines: MSI-X triggers interrupts via memory writes, eliminating shared interrupt line contention; 4) More vectors: MSI-X supports up to 2048 vectors, enough for per-queue independent interrupts. The AMD RX 7600 XT uses 64 MSI-X vectors, serving the GFX engine, multiple SDMA engines, VCN video engine, etc."
      },
      "completionChecklist": [
        "Understand MSI-X advantages over legacy INTx interrupts",
        "Know how amdgpu initializes MSI-X interrupts",
        "Understand the role and workings of the IH Ring",
        "Know why interrupt handlers cannot sleep",
        "Can use /proc/interrupts to view GPU interrupt statistics"
      ]
    }
  ]
};
