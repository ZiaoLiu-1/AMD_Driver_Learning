import type { MicroLessonGroup } from "./micro_lesson_types";

export const module2Group1: MicroLessonGroup = {
  "id": "hardware-pcie",
  "title": "PCIe 协议基础",
  "description": "理解 PCIe 总线协议、设备枚举和内存映射机制",
  "lessons": [
    {
      "id": "2-1-1",
      "title": "什么是 PCI 设备",
      "duration": 15,
      "difficulty": "beginner",
      "concept": {
        "summary": "PCIe（Peripheral Component Interconnect Express）是现代计算机中连接 GPU、NVMe SSD 等高速外设的总线标准。GPU 就是一个 PCIe 设备，Linux 内核通过 PCIe 总线与 GPU 通信。",
        "keyPoints": [
          "PCIe 是点对点串行总线，取代了旧的并行 PCI 总线",
          "每个 PCIe 设备有唯一的 BDF 地址：Bus:Device.Function",
          "PCIe 通过 Lane 传输数据，x16 表示 16 条 Lane",
          "AMD RX 7600 XT 使用 PCIe 4.0 x8 接口",
          "Linux 内核通过 /sys/bus/pci/devices/ 暴露所有 PCIe 设备"
        ]
      },
      "diagram": {
        "title": "PCIe 设备在系统中的位置",
        "content": "\nCPU\n |\n +-- PCIe Root Complex\n      |\n      +-- PCIe Switch\n      |    |\n      |    +-- GPU (Bus:01 Dev:00 Func:00)  ← AMD RX 7600 XT\n      |    |    BDF: 0000:01:00.0\n      |    |\n      |    +-- NVMe SSD (Bus:02 Dev:00 Func:00)\n      |         BDF: 0000:02:00.0\n      |\n      +-- PCIe Slot (x16)\n           |\n           +-- GPU BAR0: VRAM MMIO\n           +-- GPU BAR1: Doorbell\n           +-- GPU BAR2: Config Space\n",
        "caption": "PCIe 拓扑：CPU 通过 Root Complex 连接到 GPU，每个设备有唯一的 BDF 地址"
      },
      "codeWalk": {
        "title": "Linux 内核中的 PCI 设备结构",
        "language": "c",
        "code": "/* include/linux/pci.h */\nstruct pci_dev {\n    struct list_head bus_list;  /* 链表节点，连接同一总线上的设备 */\n    struct pci_bus  *bus;       /* 所在的 PCIe 总线 */\n    struct pci_bus  *subordinate; /* 下级总线（如果是 bridge） */\n\n    unsigned int    devfn;      /* Device:Function 编码 */\n    unsigned short  vendor;     /* 厂商 ID，AMD = 0x1002 */\n    unsigned short  device;     /* 设备 ID，RX 7600 XT = 0x7480 */\n    unsigned short  class;      /* 设备类型，GPU = 0x0300 */\n\n    u8 revision;                /* 硬件版本号 */\n    u8 hdr_type;                /* Header 类型 */\n\n    struct resource resource[DEVICE_COUNT_RESOURCE]; /* BAR 资源 */\n    /* BAR0-5: Base Address Registers，映射 GPU 寄存器空间 */\n};\n\n/* amdgpu_drv.c - AMD GPU 的 PCI 设备 ID 表 */\nstatic const struct pci_device_id pciidlist[] = {\n    {0x1002, 0x7480, PCI_ANY_ID, PCI_ANY_ID, 0, 0, CHIP_NAVI33}, /* RX 7600 XT */\n    {0x1002, 0x744C, PCI_ANY_ID, PCI_ANY_ID, 0, 0, CHIP_NAVI31}, /* RX 7900 XTX */\n    {0, 0, 0}  /* 终止符 */\n};\nMODULE_DEVICE_TABLE(pci, pciidlist);\n/* 当内核发现 vendor=0x1002 device=0x7480 的设备时，自动加载 amdgpu 模块 */",
        "explanation": "Linux 用 `pci_dev` 结构体表示每个 PCIe 设备。`pci_device_id` 表告诉内核：当发现 AMD（0x1002）的 RX 7600 XT（0x7480）时，应该加载 amdgpu 驱动。"
      },
      "miniLab": {
        "title": "探索你的 AMD GPU PCIe 信息",
        "language": "bash",
        "code": "#!/bin/bash\n# Lab 2.1.1: 查看 AMD GPU 的 PCIe 设备信息\n\n# 步骤 1: 找到 AMD GPU 的 BDF 地址\necho \"=== 查找 AMD GPU ===\"\nlspci | grep -i \"AMD\\|Radeon\\|ATI\"\n# 输出示例: 01:00.0 VGA compatible controller: Advanced Micro Devices...\n\n# 步骤 2: 查看详细信息（替换 01:00.0 为你的 BDF）\nGPU_BDF=$(lspci | grep -i \"VGA.*AMD\\|AMD.*VGA\" | awk '{print $1}' | head -1)\necho \"\"\necho \"=== GPU BDF: $GPU_BDF ===\"\nlspci -v -s $GPU_BDF\n\n# 步骤 3: 查看 PCIe 链路速度和宽度\necho \"\"\necho \"=== PCIe 链路信息 ===\"\nlspci -vv -s $GPU_BDF | grep -E \"LnkSta:|LnkCap:\"\n# LnkSta: Speed 16GT/s (ok), Width x8 (ok) ← 当前实际速度\n# LnkCap: Speed 16GT/s, Width x16 ← 最大支持速度\n\n# 步骤 4: 查看 BAR（Base Address Register）\necho \"\"\necho \"=== BAR 内存映射 ===\"\nlspci -v -s $GPU_BDF | grep \"Memory at\"\n# Memory at e0000000 (64-bit, prefetchable) [size=256M] ← BAR0: VRAM\n# Memory at f0000000 (64-bit, non-prefetchable) [size=2M]  ← BAR2: 寄存器\n\n# 步骤 5: 通过 sysfs 查看\necho \"\"\necho \"=== sysfs 设备信息 ===\"\nls /sys/bus/pci/devices/ | grep $GPU_BDF\ncat /sys/bus/pci/devices/0000:$GPU_BDF/vendor  # 应输出 0x1002\ncat /sys/bus/pci/devices/0000:$GPU_BDF/device  # 设备 ID",
        "expectedOutput": "=== 查找 AMD GPU ===\n01:00.0 VGA compatible controller: Advanced Micro Devices, Inc. [AMD/ATI] Navi33 [Radeon RX 7600/7600 XT/7600M XT/7600S/7700S / PRO W7600] (rev c7)\n01:00.1 Audio device: Advanced Micro Devices, Inc. [AMD/ATI] Navi31 HDMI/DP Audio\n\n=== PCIe 链路信息 ===\nLnkCap: Speed 16GT/s (PCIe 4.0), Width x8\nLnkSta: Speed 16GT/s (ok), Width x8 (ok)\n\n=== BAR 内存映射 ===\nMemory at e0000000 (64-bit, prefetchable) [size=256M]  ← VRAM\nMemory at f0000000 (64-bit, non-prefetchable) [size=2M] ← 寄存器"
      },
      "debugExercise": {
        "title": "为什么 GPU 只跑在 x8 而不是 x16？",
        "language": "bash",
        "question": "你的主板有 x16 插槽，但 `lspci` 显示 GPU 跑在 x8 速度。这会影响性能吗？如何判断是硬件限制还是配置问题？",
        "buggyCode": "# 检查 PCIe 链路状态\nlspci -vv -s 01:00.0 | grep LnkSta\n# 输出: LnkSta: Speed 16GT/s (ok), Width x8 (downgraded)\n#                                          ^^^^^^^^^^^^^^^^^^\n#                                          注意这里是 downgraded！",
        "hint": "查看 LnkCap（最大能力）和 LnkSta（当前状态）的区别。`downgraded` 表示实际速度低于最大能力。检查主板手册：有些主板在使用多个 PCIe 设备时会自动降速。",
        "solution": "对于 RX 7600 XT（Navi33），PCIe 4.0 x8 的带宽是 16 GB/s，已经超过了 GPU 的实际需求。只有在极端情况下（如 4K 纹理流式传输）才会成为瓶颈。检查 BIOS 设置中的 PCIe 配置，确认是否有 `Auto` 降速选项。"
      },
      "interviewQuestion": {
        "question": "解释 PCIe BDF 地址的含义，以及 Linux 内核如何通过 BDF 唯一标识一个 PCIe 设备？",
        "difficulty": "medium",
        "hint": "BDF = Bus:Device.Function，每个字段的位宽是多少？",
        "answer": "BDF（Bus:Device.Function）是 PCIe 设备的唯一地址。Bus 占 8 位（0-255，最多 256 条总线），Device 占 5 位（0-31，每条总线最多 32 个设备），Function 占 3 位（0-7，每个设备最多 8 个功能）。Linux 内核在 `/sys/bus/pci/devices/` 下用 `DDDD:BB:DD.F` 格式（域:总线:设备.功能）表示每个设备。AMD GPU 通常是 `0000:01:00.0`（域0，总线1，设备0，功能0）。GPU 的音频功能是 `0000:01:00.1`（同一设备的功能1）。"
      },
      "completionChecklist": [
        "能用 lspci 找到 AMD GPU 的 BDF 地址",
        "理解 PCIe BDF 地址的含义和位宽",
        "能查看 PCIe 链路速度和宽度",
        "理解 BAR（Base Address Register）的作用",
        "知道 AMD 的 vendor ID 是 0x1002"
      ]
    },
    {
      "id": "2-1-2",
      "title": "PCIe 枚举过程",
      "duration": 20,
      "difficulty": "intermediate",
      "concept": {
        "summary": "PCIe 枚举（Enumeration）是 Linux 内核启动时发现和配置所有 PCIe 设备的过程。内核从 Root Complex 开始，递归扫描所有总线，读取每个设备的配置空间，分配 BAR 地址，最后调用匹配的驱动的 probe() 函数。",
        "keyPoints": [
          "枚举在内核启动时由 PCI 子系统自动完成",
          "每个 PCIe 设备有 256 字节的配置空间（PCIe 扩展到 4KB）",
          "配置空间包含 Vendor ID、Device ID、BAR 寄存器等关键信息",
          "内核读取配置空间，根据 vendor:device 匹配驱动",
          "匹配成功后调用驱动的 probe() 函数，驱动在此初始化设备"
        ]
      },
      "diagram": {
        "title": "PCIe 枚举流程",
        "content": "\n内核启动\n    |\n    v\nPCI 子系统初始化\n    |\n    v\n扫描 Root Complex (Bus 0)\n    |\n    +-- 读取 Bus 0, Dev 0, Func 0 的配置空间\n    |       Vendor ID: 0x8086 (Intel Root Complex)\n    |\n    +-- 发现 PCIe Bridge → 递归扫描 Bus 1\n    |       |\n    |       +-- Bus 1, Dev 0, Func 0\n    |               Vendor ID: 0x1002  ← AMD!\n    |               Device ID: 0x7480  ← RX 7600 XT\n    |               |\n    |               v\n    |           分配 BAR 地址\n    |           BAR0 → 0xe0000000 (256MB VRAM)\n    |           BAR2 → 0xf0000000 (2MB 寄存器)\n    |               |\n    |               v\n    |           匹配驱动: amdgpu\n    |               |\n    |               v\n    |           调用 amdgpu_pci_probe()\n    |               |\n    |               v\n    |           驱动初始化完成 ✓\n    |\n    v\n枚举完成，所有设备就绪\n",
        "caption": "PCIe 枚举：内核递归扫描总线，发现 AMD GPU 后调用 amdgpu_pci_probe() 初始化驱动"
      },
      "codeWalk": {
        "title": "amdgpu_pci_probe() — 驱动入口点",
        "language": "c",
        "code": "/* drivers/gpu/drm/amd/amdgpu/amdgpu_drv.c */\n\n/* 当内核发现匹配的 PCIe 设备时，调用此函数 */\nstatic int amdgpu_pci_probe(struct pci_dev *pdev,\n                             const struct pci_device_id *ent)\n{\n    struct drm_device *ddev;\n    struct amdgpu_device *adev;\n    unsigned long flags = ent->driver_data;  /* 芯片类型标志 */\n    int ret;\n\n    /* 步骤 1: 启用 PCIe 设备 */\n    ret = pci_enable_device(pdev);\n    if (ret)\n        return ret;\n\n    /* 步骤 2: 请求 BAR 资源（MMIO 内存区域） */\n    ret = pci_request_regions(pdev, \"amdgpu\");\n    if (ret)\n        goto err_disable;\n\n    /* 步骤 3: 设置 DMA 掩码（GPU 能访问的物理内存范围） */\n    ret = dma_set_mask_and_coherent(&pdev->dev, DMA_BIT_MASK(44));\n    /* 44 位 = 16TB 地址空间，现代 GPU 的标准 */\n\n    /* 步骤 4: 创建 DRM 设备（图形驱动框架） */\n    ddev = drm_dev_alloc(&amdgpu_kms_driver, &pdev->dev);\n\n    /* 步骤 5: 创建 amdgpu_device（AMD GPU 的核心结构体） */\n    adev = drm_to_adev(ddev);\n    adev->dev = &pdev->dev;\n    adev->pdev = pdev;\n    adev->flags = flags;  /* 存储芯片类型（RDNA3 等） */\n\n    /* 步骤 6: 初始化 AMD GPU 硬件 */\n    ret = amdgpu_device_init(adev, flags);\n    /* 这是最关键的函数，初始化所有 IP 模块 */\n\n    return 0;\nerr_disable:\n    pci_disable_device(pdev);\n    return ret;\n}",
        "explanation": "`amdgpu_pci_probe()` 是整个 AMD GPU 驱动的入口点。它按顺序完成：启用设备 → 请求 BAR 资源 → 设置 DMA → 创建 DRM 设备 → 初始化 GPU 硬件。理解这个函数是理解整个 amdgpu 驱动的起点。"
      },
      "miniLab": {
        "title": "观察 PCIe 枚举过程",
        "language": "bash",
        "code": "#!/bin/bash\n# Lab 2.1.2: 观察 PCIe 枚举和驱动加载过程\n\n# 步骤 1: 查看内核启动时的 PCIe 枚举日志\necho \"=== PCIe 枚举日志 ===\"\nsudo dmesg | grep -E \"pci|PCI\" | grep -i \"amd\\|radeon\\|amdgpu\" | head -20\n\n# 步骤 2: 查看 amdgpu 驱动加载日志\necho \"\"\necho \"=== amdgpu 驱动加载日志 ===\"\nsudo dmesg | grep \"amdgpu\" | head -30\n\n# 步骤 3: 查看 PCIe 配置空间（原始数据）\nGPU_BDF=$(lspci | grep -i \"VGA.*AMD\" | awk '{print $1}' | head -1)\necho \"\"\necho \"=== PCIe 配置空间（前 64 字节）===\"\nsudo lspci -xxx -s $GPU_BDF | head -10\n# 偏移 0x00-0x01: Vendor ID (0x1002 = AMD)\n# 偏移 0x02-0x03: Device ID (0x7480 = RX 7600 XT)\n# 偏移 0x10-0x27: BAR0-BAR5 地址\n\n# 步骤 4: 查看驱动绑定状态\necho \"\"\necho \"=== 驱动绑定状态 ===\"\nls -la /sys/bus/pci/devices/0000:$GPU_BDF/driver\n# 应该指向 /sys/bus/pci/drivers/amdgpu\n\n# 步骤 5: 模拟驱动解绑和重新绑定（谨慎操作！）\necho \"\"\necho \"=== 驱动绑定信息 ===\"\ncat /sys/bus/pci/devices/0000:$GPU_BDF/driver/module/version 2>/dev/null || \\\n    echo \"驱动版本信息不可用\"\necho \"Driver: $(readlink /sys/bus/pci/devices/0000:$GPU_BDF/driver | xargs basename)\"\n",
        "expectedOutput": "=== amdgpu 驱动加载日志 ===\n[    4.123456] amdgpu: loading driver\n[    4.234567] amdgpu 0000:01:00.0: enabling device (0000 -> 0003)\n[    4.345678] amdgpu 0000:01:00.0: BAR 0: assigned [mem 0xe0000000-0xefffffff 64bit pref]\n[    4.456789] amdgpu 0000:01:00.0: amdgpu kernel modesetting enabled.\n\n=== 驱动绑定状态 ===\nlrwxrwxrwx 1 root root 0 /sys/bus/pci/devices/0000:01:00.0/driver -> ../../../../bus/pci/drivers/amdgpu"
      },
      "debugExercise": {
        "title": "probe() 失败：设备无法启用",
        "language": "c",
        "question": "你的驱动 probe() 函数返回 -ENODEV，内核日志显示 'pci_enable_device failed'。可能的原因是什么？",
        "buggyCode": "static int my_gpu_probe(struct pci_dev *pdev,\n                        const struct pci_device_id *ent)\n{\n    int ret;\n    \n    /* 问题：没有检查设备是否已被其他驱动占用 */\n    ret = pci_enable_device(pdev);  /* 返回 -EBUSY */\n    if (ret) {\n        dev_err(&pdev->dev, \"pci_enable_device failed: %d\\n\", ret);\n        return ret;\n    }\n    return 0;\n}",
        "hint": "检查 /sys/bus/pci/devices/BDF/driver 是否已经有驱动绑定。使用 `lspci -k` 查看当前使用的内核驱动。",
        "solution": "在调用 pci_enable_device() 之前，应该检查设备是否已经被其他驱动（如 vfio-pci 或 nouveau）占用。使用 `pci_is_enabled(pdev)` 检查状态。另外，如果是虚拟机环境，设备可能被 VFIO 直通给了虚拟机。"
      },
      "interviewQuestion": {
        "question": "描述 Linux 内核中 PCIe 设备驱动的 probe() 和 remove() 函数的作用，以及它们在设备生命周期中的位置。",
        "difficulty": "medium",
        "hint": "想想设备的完整生命周期：发现 → 初始化 → 使用 → 移除",
        "answer": "probe() 在内核发现匹配的 PCIe 设备时调用，负责：1) 启用设备（pci_enable_device）；2) 请求并映射 BAR 资源；3) 设置 DMA 掩码；4) 初始化硬件；5) 注册设备到上层子系统（如 DRM）。remove() 在设备移除或驱动卸载时调用，负责逆向操作：注销设备、释放资源、禁用设备。这两个函数构成了驱动的完整生命周期管理，是 Linux 驱动模型的核心。"
      },
      "completionChecklist": [
        "理解 PCIe 枚举的完整流程",
        "知道 probe() 函数何时被调用",
        "能在 dmesg 中找到 amdgpu 驱动加载日志",
        "理解 pci_enable_device() 的作用",
        "知道如何查看设备的驱动绑定状态"
      ]
    },
    {
      "id": "2-1-3",
      "title": "BAR 与 MMIO 寄存器访问",
      "duration": 20,
      "difficulty": "intermediate",
      "concept": {
        "summary": "BAR（Base Address Register）是 PCIe 设备暴露给 CPU 的内存窗口。GPU 通过 BAR 将其寄存器和 VRAM 映射到 CPU 的物理地址空间，CPU 通过读写这些地址来控制 GPU。这种机制称为 MMIO（Memory-Mapped I/O）。",
        "keyPoints": [
          "GPU 通常有 3 个 BAR：BAR0（VRAM）、BAR2（寄存器）、BAR4（Doorbell）",
          "CPU 通过 ioremap() 将 BAR 物理地址映射到内核虚拟地址",
          "使用 readl()/writel() 访问 MMIO 寄存器，而非直接指针解引用",
          "MMIO 访问会绕过 CPU 缓存，直接到达硬件",
          "amdgpu 使用 RREG32/WREG32 宏封装 MMIO 访问"
        ]
      },
      "diagram": {
        "title": "BAR 内存映射机制",
        "content": "\n物理地址空间\n┌─────────────────────────────────────┐\n│ 0x0000_0000 - 0x7FFF_FFFF: 系统 RAM │\n├─────────────────────────────────────┤\n│ 0xe000_0000 - 0xefff_ffff: BAR0     │ ← GPU VRAM (256MB)\n│   GPU 显存直接映射到此地址           │\n├─────────────────────────────────────┤\n│ 0xf000_0000 - 0xf01f_ffff: BAR2     │ ← GPU 寄存器 (2MB)\n│   GPU 控制寄存器                     │\n│   偏移 0x0000: GRBM_STATUS          │\n│   偏移 0x2000: SDMA0_STATUS         │\n│   偏移 0x8000: CP_RB_RPTR           │\n├─────────────────────────────────────┤\n│ 0xf020_0000 - 0xf02f_ffff: BAR4     │ ← Doorbell (1MB)\n│   用于通知 GPU 有新命令              │\n└─────────────────────────────────────┘\n\n驱动访问流程:\npci_resource_start(pdev, 2)  → 获取 BAR2 物理地址 0xf0000000\nioremap(0xf0000000, 0x200000) → 映射到内核虚拟地址 0xffff_8880_f000_0000\nRREG32(0x2000)               → 读取 SDMA0_STATUS 寄存器\n",
        "caption": "BAR 将 GPU 寄存器映射到 CPU 地址空间，驱动通过 ioremap() 获得可访问的虚拟地址"
      },
      "codeWalk": {
        "title": "amdgpu 中的 MMIO 初始化和访问",
        "language": "c",
        "code": "/* drivers/gpu/drm/amd/amdgpu/amdgpu_device.c */\n\nint amdgpu_device_init(struct amdgpu_device *adev, uint32_t flags)\n{\n    /* 步骤 1: 映射 BAR0（VRAM，用于 CPU 直接访问显存） */\n    adev->mman.aper_base_kaddr = ioremap_wc(\n        pci_resource_start(adev->pdev, 0),   /* BAR0 物理地址 */\n        pci_resource_len(adev->pdev, 0));     /* BAR0 大小（256MB）*/\n    /* ioremap_wc = Write-Combining 模式，适合大块内存传输 */\n\n    /* 步骤 2: 映射 BAR2（寄存器空间） */\n    adev->rmmio_base = pci_resource_start(adev->pdev, 2);\n    adev->rmmio_size = pci_resource_len(adev->pdev, 2);\n    adev->rmmio = ioremap(adev->rmmio_base, adev->rmmio_size);\n    /* ioremap = 普通映射，每次访问直接到达硬件 */\n\n    /* 步骤 3: 映射 BAR4（Doorbell，用于通知 GPU） */\n    adev->doorbell.base = pci_resource_start(adev->pdev, 4);\n    adev->doorbell.ptr = ioremap_wc(adev->doorbell.base,\n                                     adev->doorbell.size);\n    ...\n}\n\n/* 读取 GPU 寄存器的核心宏 */\n#define RREG32(reg) amdgpu_mm_rreg(adev, (reg), false)\n#define WREG32(reg, v) amdgpu_mm_wreg(adev, (reg), (v), false)\n\nstatic uint32_t amdgpu_mm_rreg(struct amdgpu_device *adev,\n                                 uint32_t reg, bool always_indirect)\n{\n    uint32_t ret;\n    if (!always_indirect && (reg * 4) < adev->rmmio_size)\n        /* 直接 MMIO 读取：寄存器在映射范围内 */\n        ret = readl(((void __iomem *)adev->rmmio) + (reg * 4));\n    else {\n        /* 间接访问：通过 MMIO 索引寄存器访问超出范围的寄存器 */\n        writel((reg), ((void __iomem *)adev->rmmio) + AMDGPU_MM_INDEX);\n        ret = readl(((void __iomem *)adev->rmmio) + AMDGPU_MM_DATA);\n    }\n    return ret;\n}\n\n/* 使用示例：检查 GPU 是否挂起 */\nuint32_t status = RREG32(mmGRBM_STATUS);\nif (status & GRBM_STATUS__GUI_ACTIVE_MASK)\n    dev_info(adev->dev, \"GPU is busy\\n\");",
        "explanation": "amdgpu 通过 ioremap() 将 BAR 物理地址映射到内核虚拟地址，然后用 RREG32/WREG32 宏封装 readl()/writel() 进行寄存器访问。寄存器地址是相对于 BAR2 基地址的偏移量，乘以 4 得到字节偏移。"
      },
      "miniLab": {
        "title": "读取 GPU 寄存器状态",
        "language": "bash",
        "code": "#!/bin/bash\n# Lab 2.1.3: 通过 sysfs/debugfs 访问 GPU 寄存器\n\n# 步骤 1: 查看 BAR 资源分配\nGPU_BDF=$(lspci | grep -i \"VGA.*AMD\" | awk '{print $1}' | head -1)\necho \"=== BAR 资源分配 ===\"\ncat /sys/bus/pci/devices/0000:$GPU_BDF/resource\n# 格式: start end flags\n# flags: 0x0000 = IO, 0x0200 = MEM, 0x0204 = MEM|PREFETCH\n\n# 步骤 2: 通过 debugfs 读取 GPU 寄存器（需要 amdgpu 驱动）\necho \"\"\necho \"=== GPU 状态寄存器 ===\"\nif [ -f /sys/kernel/debug/dri/0/amdgpu_regs ]; then\n    # 读取 GRBM_STATUS 寄存器（GPU 忙碌状态）\n    sudo cat /sys/kernel/debug/dri/0/amdgpu_regs | grep -i \"GRBM_STATUS\" | head -5\nelse\n    echo \"debugfs 不可用，尝试通过 sysfs 读取...\"\nfi\n\n# 步骤 3: 查看 GPU 内存信息（通过 amdgpu sysfs）\necho \"\"\necho \"=== GPU 内存信息 ===\"\nGPU_CARD=$(ls /sys/class/drm/ | grep \"^card[0-9]$\" | head -1)\nif [ -d /sys/class/drm/$GPU_CARD/device/mem_info_vram_total ]; then\n    VRAM_TOTAL=$(cat /sys/class/drm/$GPU_CARD/device/mem_info_vram_total)\n    VRAM_USED=$(cat /sys/class/drm/$GPU_CARD/device/mem_info_vram_used)\n    echo \"VRAM 总量: $((VRAM_TOTAL / 1024 / 1024)) MB\"\n    echo \"VRAM 已用: $((VRAM_USED / 1024 / 1024)) MB\"\nfi\n\n# 步骤 4: 使用 dd 直接读取 BAR 内存（仅用于学习，生产环境危险！）\necho \"\"\necho \"=== BAR2 前 16 字节（寄存器空间）===\"\nBAR2_START=$(cat /sys/bus/pci/devices/0000:$GPU_BDF/resource | \\\n    awk 'NR==3{printf \"0x%s\", $1}')\necho \"BAR2 起始地址: $BAR2_START\"\n# 注意：直接读取 BAR 需要 root 权限，且可能导致系统不稳定",
        "expectedOutput": "=== BAR 资源分配 ===\n0x00000000e0000000 0x00000000efffffff 0x000000000014220c  ← BAR0: 256MB VRAM\n0x0000000000000000 0x0000000000000000 0x0000000000000000\n0x00000000f0000000 0x00000000f01fffff 0x0000000000140204  ← BAR2: 2MB 寄存器\n0x0000000000000000 0x0000000000000000 0x0000000000000000\n0x00000000f0200000 0x00000000f02fffff 0x000000000014220c  ← BAR4: 1MB Doorbell\n\n=== GPU 内存信息 ===\nVRAM 总量: 8192 MB\nVRAM 已用: 512 MB"
      },
      "debugExercise": {
        "title": "MMIO 访问导致内核崩溃",
        "language": "c",
        "question": "以下代码在访问 GPU 寄存器时导致内核 Oops，原因是什么？",
        "buggyCode": "/* 错误的 MMIO 访问方式 */\nstatic int bad_read_register(struct pci_dev *pdev)\n{\n    void *bar2_phys = (void *)pci_resource_start(pdev, 2);\n    \n    /* 直接用物理地址读取寄存器 —— 这是错误的！ */\n    uint32_t val = *(uint32_t *)bar2_phys;\n    printk(\"Register value: 0x%x\\n\", val);\n    return 0;\n}",
        "hint": "在 x86_64 Linux 中，内核不能直接访问物理地址。物理地址必须先通过 ioremap() 映射到内核虚拟地址空间。",
        "solution": "正确做法：使用 ioremap() 将物理地址映射到虚拟地址，然后用 readl() 读取：`void __iomem *bar2 = ioremap(pci_resource_start(pdev, 2), pci_resource_len(pdev, 2)); uint32_t val = readl(bar2); iounmap(bar2);`。直接解引用物理地址会导致页错误（Page Fault），因为内核的页表中没有该物理地址的映射。"
      },
      "interviewQuestion": {
        "question": "为什么 MMIO 访问必须使用 readl()/writel() 而不是普通的指针解引用？",
        "difficulty": "hard",
        "hint": "考虑编译器优化、内存序（memory ordering）和缓存的影响",
        "answer": "有三个原因：1) 编译器屏障：readl()/writel() 包含内存屏障，防止编译器重排 MMIO 访问顺序（编译器可能认为对同一地址的多次写入是冗余的而优化掉）；2) CPU 内存序：MMIO 区域被标记为 UC（Uncacheable）或 WC（Write-Combining），readl()/writel() 确保访问不经过 CPU 缓存直接到达硬件；3) 可移植性：在某些架构（如 IA-64）上，MMIO 访问需要特殊指令，readl()/writel() 封装了这些差异。直接指针解引用可能被编译器优化掉或乱序执行，导致硬件行为不可预测。"
      },
      "completionChecklist": [
        "理解 BAR 的作用和 GPU 通常有哪些 BAR",
        "知道 ioremap() 的作用和使用时机",
        "理解 RREG32/WREG32 宏的实现原理",
        "知道为什么不能直接用指针访问 MMIO",
        "能通过 sysfs 查看 GPU 的 BAR 资源分配"
      ]
    },
    {
      "id": "2-1-4",
      "title": "DMA 基础与内存一致性",
      "duration": 25,
      "difficulty": "intermediate",
      "concept": {
        "summary": "DMA（Direct Memory Access）允许 GPU 直接读写系统内存，而无需 CPU 参与每次数据传输。这是 GPU 高性能的关键——CPU 只需设置好 DMA 描述符，GPU 就能自主完成大量数据传输。但 DMA 引入了缓存一致性问题：CPU 缓存中的数据可能与 GPU 看到的内存数据不同步。",
        "keyPoints": [
          "DMA 让 GPU 直接访问系统 RAM，无需 CPU 中转，带宽可达数十 GB/s",
          "Coherent DMA：CPU 和 GPU 看到的数据始终一致，但性能较低",
          "Streaming DMA：高性能，但需要手动同步（dma_sync_*）",
          "IOMMU 为 DMA 提供地址翻译和访问保护，防止恶意设备访问任意内存",
          "dma_alloc_coherent() 分配 CPU 和 GPU 都能访问的共享内存"
        ]
      },
      "diagram": {
        "title": "DMA 传输与缓存一致性",
        "content": "\n                    CPU\n                   /   \\\n              L1 Cache  L2 Cache\n                  |         |\n                  +----+----+\n                       |\n                  LLC (L3 Cache)\n                       |\n              ┌────────┴────────┐\n              │   系统内存 RAM   │\n              │  0x1000_0000    │ ← DMA Buffer (物理地址)\n              │  \"Hello GPU\"    │\n              └────────┬────────┘\n                       |\n                    IOMMU\n                    (地址翻译 + 保护)\n                       |\n                    PCIe Bus\n                       |\n                      GPU\n                   (DMA Engine)\n\nCoherent DMA 场景:\n  CPU 写入 → 自动刷新缓存 → GPU 读到最新数据 ✓\n  GPU 写入 → 自动失效缓存 → CPU 读到最新数据 ✓\n\nStreaming DMA 场景:\n  CPU 写入 → 数据在缓存中 → 需要 dma_sync_single_for_device() 刷新\n  GPU 写入 → 数据在内存中 → 需要 dma_sync_single_for_cpu() 失效缓存\n",
        "caption": "DMA 绕过 CPU 直接访问内存，IOMMU 提供地址翻译和保护，缓存一致性需要特别处理"
      },
      "codeWalk": {
        "title": "amdgpu 中的 DMA 内存分配",
        "language": "c",
        "code": "/* drivers/gpu/drm/amd/amdgpu/amdgpu_ib.c */\n/* IB = Indirect Buffer，GPU 命令缓冲区 */\n\nint amdgpu_ib_get(struct amdgpu_device *adev,\n                   struct amdgpu_vm *vm,\n                   unsigned size,\n                   struct amdgpu_ib *ib)\n{\n    /* 分配 Coherent DMA 内存：CPU 和 GPU 都能访问 */\n    /* dma_alloc_coherent 保证缓存一致性，适合命令缓冲区 */\n    ib->ptr = dma_alloc_coherent(adev->dev,\n                                  AMDGPU_GPU_PAGE_ALIGN(size),\n                                  &ib->gpu_addr,  /* GPU 可见的 DMA 地址 */\n                                  GFP_KERNEL);\n    /* ib->ptr     = CPU 虚拟地址，CPU 用这个写命令 */\n    /* ib->gpu_addr = GPU DMA 地址，GPU 用这个读命令 */\n    \n    if (!ib->ptr)\n        return -ENOMEM;\n    \n    ib->length_dw = 0;\n    return 0;\n}\n\n/* CPU 写入命令到 IB */\nvoid amdgpu_ring_write(struct amdgpu_ring *ring, uint32_t v)\n{\n    /* 直接写入 coherent 内存，GPU 立即可见 */\n    ring->ring[ring->wptr++ & ring->buf_mask] = v;\n}\n\n/* Streaming DMA 示例：传输纹理数据 */\nint transfer_texture(struct amdgpu_device *adev, void *data, size_t size)\n{\n    dma_addr_t dma_addr;\n    \n    /* 映射 CPU 内存为 DMA 地址 */\n    dma_addr = dma_map_single(adev->dev, data, size, DMA_TO_DEVICE);\n    if (dma_mapping_error(adev->dev, dma_addr))\n        return -ENOMEM;\n    \n    /* 同步：确保 CPU 缓存中的数据已刷新到内存 */\n    dma_sync_single_for_device(adev->dev, dma_addr, size, DMA_TO_DEVICE);\n    \n    /* 提交 DMA 传输命令给 GPU */\n    /* ... 写入 SDMA ring ... */\n    \n    /* 传输完成后解除映射 */\n    dma_unmap_single(adev->dev, dma_addr, size, DMA_TO_DEVICE);\n    return 0;\n}",
        "explanation": "amdgpu 对命令缓冲区（IB）使用 Coherent DMA，保证 CPU 写入的命令 GPU 立即可见。对大块数据传输（纹理、顶点缓冲区）使用 Streaming DMA，性能更高但需要手动同步。"
      },
      "miniLab": {
        "title": "观察 DMA 内存分配",
        "language": "bash",
        "code": "#!/bin/bash\n# Lab 2.1.4: 观察 DMA 内存分配和 IOMMU 状态\n\n# 步骤 1: 检查 IOMMU 是否启用\necho \"=== IOMMU 状态 ===\"\nsudo dmesg | grep -i \"iommu\\|IOMMU\" | head -10\n# 如果看到 \"IOMMU enabled\" 说明 IOMMU 已启用\n\n# 步骤 2: 查看 AMD IOMMU 信息\necho \"\"\necho \"=== AMD IOMMU 信息 ===\"\nif [ -d /sys/class/iommu ]; then\n    ls /sys/class/iommu/\n    cat /sys/class/iommu/*/name 2>/dev/null\nfi\n\n# 步骤 3: 查看 DMA 内存使用情况\necho \"\"\necho \"=== DMA 内存统计 ===\"\ncat /proc/meminfo | grep -E \"CmaTotal|CmaFree|Bounce\"\n\n# 步骤 4: 查看 amdgpu DMA 分配（通过 debugfs）\necho \"\"\necho \"=== amdgpu DMA 分配 ===\"\nif [ -d /sys/kernel/debug/dri/0 ]; then\n    sudo ls /sys/kernel/debug/dri/0/\n    sudo cat /sys/kernel/debug/dri/0/amdgpu_gem_info 2>/dev/null | head -20\nfi\n\n# 步骤 5: 检查 PCIe DMA 掩码\nGPU_BDF=$(lspci | grep -i \"VGA.*AMD\" | awk '{print $1}' | head -1)\necho \"\"\necho \"=== DMA 掩码 ===\"\ncat /sys/bus/pci/devices/0000:$GPU_BDF/dma_mask_bits 2>/dev/null || \\\n    echo \"DMA 掩码: 44 位 (16TB 地址空间)\"\n\n# 步骤 6: 查看 IOMMU 组（安全隔离单元）\necho \"\"\necho \"=== IOMMU 组 ===\"\nls /sys/bus/pci/devices/0000:$GPU_BDF/iommu_group/devices/ 2>/dev/null",
        "expectedOutput": "=== IOMMU 状态 ===\n[    0.123456] AMD-Vi: IOMMU performance counters supported\n[    0.234567] AMD-Vi: Found IOMMU at 0000:00:00.2 cap 0x40\n[    0.345678] AMD-Vi: Enabling IOMMU\n\n=== DMA 内存统计 ===\nCmaTotal:       524288 kB\nCmaFree:        512000 kB"
      },
      "debugExercise": {
        "title": "DMA 地址映射错误导致 GPU 访问错误内存",
        "language": "c",
        "question": "以下代码在某些系统上工作正常，但在启用 IOMMU 的系统上 GPU 无法读取数据。原因是什么？",
        "buggyCode": "int bad_dma_transfer(struct pci_dev *pdev, void *cpu_buf, size_t size)\n{\n    /* 错误：直接使用物理地址作为 DMA 地址 */\n    phys_addr_t phys = virt_to_phys(cpu_buf);\n    \n    /* 将物理地址写入 GPU 的 DMA 寄存器 */\n    writel(phys & 0xFFFFFFFF, gpu_reg_base + DMA_ADDR_LO);\n    writel(phys >> 32,        gpu_reg_base + DMA_ADDR_HI);\n    \n    /* 启动 DMA 传输 */\n    writel(size, gpu_reg_base + DMA_SIZE);\n    writel(1,    gpu_reg_base + DMA_START);\n    return 0;\n}",
        "hint": "IOMMU 在物理地址和 DMA 地址之间增加了一层翻译。GPU 看到的 DMA 地址（IOVA）不等于物理地址。",
        "solution": "必须使用 dma_map_single() 获取 IOMMU 翻译后的 DMA 地址（IOVA）：`dma_addr_t dma_addr = dma_map_single(&pdev->dev, cpu_buf, size, DMA_TO_DEVICE);`。然后将 dma_addr（不是物理地址）写入 GPU 寄存器。没有 IOMMU 时，IOVA 等于物理地址，所以代码碰巧工作；有 IOMMU 时，IOVA 是虚拟地址，GPU 用物理地址会访问错误内存。"
      },
      "interviewQuestion": {
        "question": "解释 Coherent DMA 和 Streaming DMA 的区别，以及 amdgpu 在什么场景下使用哪种方式？",
        "difficulty": "hard",
        "hint": "从性能、缓存一致性保证和使用场景三个角度分析",
        "answer": "Coherent DMA（一致性 DMA）：通过 dma_alloc_coherent() 分配，硬件保证 CPU 和设备看到的数据始终一致，无需手动同步。缺点是性能较低（通常标记为 UC 或 WC，绕过缓存）。amdgpu 用于命令缓冲区（IB/Ring）、页表、信号量等需要频繁 CPU-GPU 交互的小块内存。Streaming DMA（流式 DMA）：通过 dma_map_single()/dma_map_sg() 映射，性能高（可利用缓存），但需要在 CPU 写入后调用 dma_sync_single_for_device() 刷新缓存，GPU 写入后调用 dma_sync_single_for_cpu() 失效缓存。amdgpu 用于纹理、顶点缓冲区等大块单向传输数据。"
      },
      "completionChecklist": [
        "理解 DMA 的作用和为什么 GPU 需要 DMA",
        "区分 Coherent DMA 和 Streaming DMA",
        "知道 IOMMU 的作用和为什么不能直接用物理地址",
        "理解 dma_alloc_coherent() 和 dma_map_single() 的区别",
        "知道 amdgpu 在哪些场景使用 Coherent DMA"
      ]
    },
    {
      "id": "2-1-5",
      "title": "MSI/MSI-X 中断机制",
      "duration": 20,
      "difficulty": "intermediate",
      "concept": {
        "summary": "现代 GPU 使用 MSI-X（Message Signaled Interrupts Extended）来通知 CPU 任务完成、错误发生等事件。MSI-X 比传统的 INTx 中断更高效，支持多个独立中断向量，每个 GPU 引擎（GFX、SDMA、VCN 等）可以有自己的中断向量，避免中断共享导致的性能问题。",
        "keyPoints": [
          "传统 INTx 中断：共享中断线，所有设备共用，需要查询是哪个设备触发",
          "MSI：通过写内存触发中断，无需中断线，但只支持 32 个中断向量",
          "MSI-X：支持最多 2048 个独立中断向量，每个向量可路由到不同 CPU 核心",
          "AMD RX 7600 XT 使用 MSI-X，为 GFX、SDMA、VCN 等引擎分配独立中断",
          "中断亲和性（IRQ affinity）可以将不同引擎的中断绑定到不同 CPU 核心"
        ]
      },
      "diagram": {
        "title": "MSI-X 中断流程",
        "content": "\nGPU 引擎完成任务\n        |\n        v\nGPU 写入 MSI-X 消息到内存地址\n(地址和数据在初始化时由内核配置)\n        |\n        v\nPCIe 总线传输写请求\n        |\n        v\nCPU LAPIC (Local APIC) 接收中断\n        |\n        +-- 中断向量 0 → CPU 0 → amdgpu_irq_handler() → GFX 完成\n        +-- 中断向量 1 → CPU 1 → amdgpu_irq_handler() → SDMA 完成\n        +-- 中断向量 2 → CPU 2 → amdgpu_irq_handler() → VCN 完成\n        +-- 中断向量 3 → CPU 3 → amdgpu_irq_handler() → 错误/故障\n        |\n        v\namdgpu_irq_handler()\n    |\n    +-- 读取 IH Ring (Interrupt Handler Ring)\n    |   GPU 将中断源信息写入 IH Ring\n    |\n    +-- 分发到具体处理函数\n        +-- amdgpu_gfx_irq_handler()\n        +-- amdgpu_sdma_irq_handler()\n        +-- amdgpu_fault_handler()\n",
        "caption": "MSI-X 为每个 GPU 引擎分配独立中断向量，可路由到不同 CPU 核心，避免中断竞争"
      },
      "codeWalk": {
        "title": "amdgpu 中的 MSI-X 初始化",
        "language": "c",
        "code": "/* drivers/gpu/drm/amd/amdgpu/amdgpu_irq.c */\n\nint amdgpu_irq_init(struct amdgpu_device *adev)\n{\n    int r, num_irqs;\n\n    /* 步骤 1: 启用 MSI-X，请求所需的中断向量数量 */\n    num_irqs = adev->irq.num_irqs;  /* 通常 64-128 个 */\n    \n    r = pci_alloc_irq_vectors(adev->pdev,\n                               1,           /* 最少 1 个 */\n                               num_irqs,    /* 最多 num_irqs 个 */\n                               PCI_IRQ_MSIX | PCI_IRQ_MSI);\n    if (r < 0) {\n        /* 回退到传统中断 */\n        dev_warn(adev->dev, \"Failed to get MSI-X, falling back to MSI\\n\");\n        r = pci_alloc_irq_vectors(adev->pdev, 1, 1, PCI_IRQ_MSI);\n    }\n    adev->irq.num_irqs = r;  /* 实际分配到的中断数量 */\n\n    /* 步骤 2: 注册中断处理函数 */\n    r = request_irq(pci_irq_vector(adev->pdev, 0),  /* 向量 0 */\n                    amdgpu_irq_handler,               /* 处理函数 */\n                    IRQF_SHARED,                      /* 可共享 */\n                    adev->irqname,                    /* 中断名称 */\n                    adev);                            /* 传给处理函数的数据 */\n\n    return r;\n}\n\n/* 中断处理函数 */\nirqreturn_t amdgpu_irq_handler(int irq, void *arg)\n{\n    struct amdgpu_device *adev = (struct amdgpu_device *)arg;\n    \n    /* 读取 IH Ring（Interrupt Handler Ring）\n     * GPU 将中断源信息写入这个环形缓冲区 */\n    amdgpu_ih_process(adev, &adev->irq.ih);\n    \n    return IRQ_HANDLED;\n}\n\n/* IH Ring 处理：分发中断到具体处理函数 */\nstatic int amdgpu_ih_process(struct amdgpu_device *adev,\n                               struct amdgpu_ih_ring *ih)\n{\n    while (ih->rptr != ih->wptr) {  /* 还有未处理的中断 */\n        /* 读取中断源 ID */\n        uint32_t entry = ih->ring[ih->rptr & ih->ptr_mask];\n        uint32_t client_id = entry & 0xFF;\n        uint32_t src_id = (entry >> 8) & 0xFF;\n        \n        /* 分发到对应的处理函数 */\n        amdgpu_irq_dispatch(adev, client_id, src_id);\n        ih->rptr++;\n    }\n    return 0;\n}",
        "explanation": "amdgpu 优先使用 MSI-X，失败时回退到 MSI。中断处理的核心是 IH Ring（Interrupt Handler Ring）——GPU 将中断源信息写入这个环形缓冲区，CPU 从中读取并分发到对应的处理函数。"
      },
      "miniLab": {
        "title": "查看 GPU 中断配置",
        "language": "bash",
        "code": "#!/bin/bash\n# Lab 2.1.5: 查看 AMD GPU 的 MSI-X 中断配置\n\n# 步骤 1: 查看 GPU 使用的中断类型\nGPU_BDF=$(lspci | grep -i \"VGA.*AMD\" | awk '{print $1}' | head -1)\necho \"=== GPU 中断能力 ===\"\nlspci -vv -s $GPU_BDF | grep -E \"MSI-X|MSI|Interrupt\"\n\n# 步骤 2: 查看分配的 IRQ 号\necho \"\"\necho \"=== GPU IRQ 分配 ===\"\ncat /proc/interrupts | grep -i \"amdgpu\\|radeon\" | head -20\n# 格式: IRQ号 CPU0 CPU1 ... 类型 设备名\n\n# 步骤 3: 查看 MSI-X 向量数量\necho \"\"\necho \"=== MSI-X 向量信息 ===\"\nlspci -vv -s $GPU_BDF | grep -A5 \"MSI-X\"\n# MSI-X: Enable+ Count=64 Masked-\n# 表示启用了 64 个 MSI-X 向量\n\n# 步骤 4: 查看中断亲和性（哪个 CPU 处理哪个中断）\necho \"\"\necho \"=== 中断 CPU 亲和性 ===\"\nfor irq in $(cat /proc/interrupts | grep \"amdgpu\" | awk '{print $1}' | tr -d ':' | head -5); do\n    if [ -f /proc/irq/$irq/smp_affinity_list ]; then\n        echo \"IRQ $irq → CPU $(cat /proc/irq/$irq/smp_affinity_list)\"\n    fi\ndone\n\n# 步骤 5: 查看中断统计（每个 CPU 处理了多少次中断）\necho \"\"\necho \"=== 中断统计（最近 5 个 GPU 中断）===\"\ncat /proc/interrupts | grep \"amdgpu\" | head -5",
        "expectedOutput": "=== GPU 中断能力 ===\nCapabilities: [a0] MSI-X: Enable+ Count=64 Masked-\n        Vector table: BAR=4 offset=00000000\n        PBA: BAR=4 offset=00002000\n\n=== GPU IRQ 分配 ===\n 45:      12345       0       0       0  PCI-MSI 524288-edge  amdgpu\n 46:          0    5678       0       0  PCI-MSI 524289-edge  amdgpu\n 47:          0       0    9012       0  PCI-MSI 524290-edge  amdgpu"
      },
      "debugExercise": {
        "title": "中断处理函数中的死锁",
        "language": "c",
        "question": "以下中断处理函数在高负载时偶尔导致系统死锁。找出问题所在。",
        "buggyCode": "irqreturn_t bad_irq_handler(int irq, void *arg)\n{\n    struct my_gpu_dev *dev = arg;\n    \n    /* 问题：在中断上下文中尝试获取可睡眠的互斥锁 */\n    mutex_lock(&dev->big_lock);  /* 这可能导致睡眠！ */\n    \n    /* 处理中断 */\n    process_interrupt(dev);\n    \n    mutex_unlock(&dev->big_lock);\n    return IRQ_HANDLED;\n}",
        "hint": "中断处理函数运行在中断上下文（interrupt context）中，不能睡眠。mutex_lock() 在锁被占用时会睡眠等待。",
        "solution": "在中断上下文中必须使用自旋锁（spinlock）而非互斥锁（mutex）：将 `mutex_lock(&dev->big_lock)` 改为 `spin_lock(&dev->irq_lock)`。自旋锁不会睡眠，而是忙等待。如果需要在中断处理中做复杂工作，应该使用 tasklet 或 workqueue 将工作推迟到进程上下文执行。"
      },
      "interviewQuestion": {
        "question": "AMD GPU 为什么使用 MSI-X 而不是传统 INTx 中断？MSI-X 如何提升多引擎 GPU 的性能？",
        "difficulty": "medium",
        "hint": "从中断共享、多核扩展、延迟三个角度分析",
        "answer": "MSI-X 相比 INTx 的优势：1) 无中断共享：每个 GPU 引擎（GFX、SDMA0/1、VCN、DCN 等）有独立中断向量，不需要在处理函数中查询是哪个引擎触发，减少延迟；2) 多核扩展：不同引擎的中断可以路由到不同 CPU 核心（IRQ affinity），充分利用多核并行处理能力；3) 无需中断线：MSI-X 通过写内存触发中断，消除了共享中断线的竞争；4) 更多向量：MSI-X 支持最多 2048 个向量，足够为每个 GPU 队列分配独立中断。AMD RX 7600 XT 使用 64 个 MSI-X 向量，分别服务于 GFX 引擎、多个 SDMA 引擎、VCN 视频引擎等。"
      },
      "completionChecklist": [
        "理解 MSI-X 相比传统 INTx 中断的优势",
        "知道 amdgpu 如何初始化 MSI-X 中断",
        "理解 IH Ring 的作用和工作原理",
        "知道中断处理函数不能睡眠的原因",
        "能用 /proc/interrupts 查看 GPU 中断统计"
      ]
    }
  ]
};
