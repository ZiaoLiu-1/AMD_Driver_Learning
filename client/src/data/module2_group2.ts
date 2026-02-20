import type { MicroLessonGroup } from "./micro_lesson_types";

export const module2Group2: MicroLessonGroup = {
  "id": "hardware-kernel-driver",
  "title": "内核 PCI 驱动开发",
  "description": "编写第一个 PCI 驱动，理解驱动生命周期和内存管理",
  "lessons": [
    {
      "id": "2-2-1",
      "title": "第一个 PCI 驱动骨架",
      "duration": 25,
      "difficulty": "intermediate",
      "concept": {
        "summary": "编写一个完整的 Linux PCI 驱动骨架，理解驱动的完整生命周期：模块加载 → 设备发现（probe）→ 设备使用 → 设备移除（remove）→ 模块卸载。这是理解 amdgpu 驱动架构的基础。",
        "keyPoints": [
          "PCI 驱动通过 pci_driver 结构体注册到内核",
          "probe() 在设备发现时调用，remove() 在设备移除时调用",
          "module_pci_driver() 宏简化了模块注册和注销",
          "驱动必须在 remove() 中释放所有在 probe() 中分配的资源",
          "pci_set_drvdata()/pci_get_drvdata() 用于在 probe 和 remove 间传递数据"
        ]
      },
      "diagram": {
        "title": "PCI 驱动生命周期",
        "content": "\ninsmod my_driver.ko\n        |\n        v\npci_register_driver(&my_pci_driver)\n        |\n        v\n内核扫描已有 PCI 设备\n        |\n        +-- 发现匹配设备 (vendor:device 匹配)\n        |           |\n        |           v\n        |   my_pci_probe(pdev, id)\n        |       |\n        |       +-- pci_enable_device()\n        |       +-- pci_request_regions()\n        |       +-- ioremap(BAR)\n        |       +-- request_irq()\n        |       +-- 初始化硬件\n        |       +-- pci_set_drvdata(pdev, priv)\n        |\n        v\n设备正常工作\n        |\n        v (设备移除 或 rmmod)\nmy_pci_remove(pdev)\n        |\n        +-- free_irq()\n        +-- iounmap(BAR)\n        +-- pci_release_regions()\n        +-- pci_disable_device()\n        |\n        v\npci_unregister_driver(&my_pci_driver)\n        |\n        v\nrmmod 完成\n",
        "caption": "PCI 驱动生命周期：probe() 初始化资源，remove() 释放资源，必须完全对称"
      },
      "codeWalk": {
        "title": "完整的 PCI 驱动骨架代码",
        "language": "c",
        "code": "/* my_pci_driver.c - 最小化 PCI 驱动骨架 */\n#include <linux/module.h>\n#include <linux/pci.h>\n#include <linux/interrupt.h>\n\n/* 私有数据结构：每个设备实例一份 */\nstruct my_device {\n    struct pci_dev *pdev;\n    void __iomem *mmio;    /* BAR2 映射的虚拟地址 */\n    int irq;               /* 分配的 IRQ 号 */\n    /* ... 其他设备状态 ... */\n};\n\n/* 支持的设备 ID 表 */\nstatic const struct pci_device_id my_pci_ids[] = {\n    { PCI_DEVICE(0x1002, 0x7480) },  /* AMD RX 7600 XT */\n    { 0, }  /* 终止符 */\n};\nMODULE_DEVICE_TABLE(pci, my_pci_ids);\n\n/* 中断处理函数 */\nstatic irqreturn_t my_irq_handler(int irq, void *data)\n{\n    struct my_device *dev = data;\n    /* 读取中断状态寄存器 */\n    uint32_t status = readl(dev->mmio + 0x1000);\n    if (!(status & 0x1))\n        return IRQ_NONE;  /* 不是我们的中断 */\n    \n    /* 清除中断标志 */\n    writel(0x1, dev->mmio + 0x1000);\n    return IRQ_HANDLED;\n}\n\n/* probe: 设备发现时调用 */\nstatic int my_pci_probe(struct pci_dev *pdev,\n                         const struct pci_device_id *id)\n{\n    struct my_device *dev;\n    int ret;\n\n    /* 分配私有数据 */\n    dev = devm_kzalloc(&pdev->dev, sizeof(*dev), GFP_KERNEL);\n    /* devm_* 系列函数：设备移除时自动释放，推荐使用 */\n    if (!dev)\n        return -ENOMEM;\n    dev->pdev = pdev;\n\n    /* 启用 PCIe 设备 */\n    ret = pcim_enable_device(pdev);  /* pcim_* = 自动管理版本 */\n    if (ret)\n        return ret;\n\n    /* 请求并映射 BAR2（寄存器空间）*/\n    ret = pcim_iomap_regions(pdev, BIT(2), \"my_driver\");\n    if (ret)\n        return ret;\n    dev->mmio = pcim_iomap_table(pdev)[2];\n\n    /* 设置 DMA 掩码 */\n    ret = dma_set_mask_and_coherent(&pdev->dev, DMA_BIT_MASK(44));\n    if (ret)\n        return ret;\n\n    /* 启用 MSI-X 中断 */\n    ret = pci_alloc_irq_vectors(pdev, 1, 4, PCI_IRQ_MSIX | PCI_IRQ_MSI);\n    if (ret < 0)\n        return ret;\n\n    /* 注册中断处理函数 */\n    ret = request_irq(pci_irq_vector(pdev, 0), my_irq_handler,\n                      0, \"my_driver\", dev);\n    if (ret)\n        goto err_free_irq_vectors;\n\n    /* 保存私有数据，供 remove() 使用 */\n    pci_set_drvdata(pdev, dev);\n\n    dev_info(&pdev->dev, \"Device initialized successfully\\n\");\n    return 0;\n\nerr_free_irq_vectors:\n    pci_free_irq_vectors(pdev);\n    return ret;\n}\n\n/* remove: 设备移除时调用 */\nstatic void my_pci_remove(struct pci_dev *pdev)\n{\n    struct my_device *dev = pci_get_drvdata(pdev);\n\n    free_irq(pci_irq_vector(pdev, 0), dev);\n    pci_free_irq_vectors(pdev);\n    /* devm_* 分配的资源由内核自动释放 */\n\n    dev_info(&pdev->dev, \"Device removed\\n\");\n}\n\n/* 驱动结构体 */\nstatic struct pci_driver my_pci_driver = {\n    .name     = \"my_driver\",\n    .id_table = my_pci_ids,\n    .probe    = my_pci_probe,\n    .remove   = my_pci_remove,\n};\n\n/* 使用宏自动生成 module_init/module_exit */\nmodule_pci_driver(my_pci_driver);\n\nMODULE_LICENSE(\"GPL\");\nMODULE_AUTHOR(\"AMD Driver Student\");\nMODULE_DESCRIPTION(\"Minimal PCI Driver Skeleton\");",
        "explanation": "这个骨架展示了一个完整的 PCI 驱动的所有关键部分。使用 `devm_*` 和 `pcim_*` 系列函数可以简化资源管理——设备移除时内核自动释放这些资源，减少内存泄漏风险。"
      },
      "miniLab": {
        "title": "编译并加载第一个 PCI 驱动",
        "language": "bash",
        "code": "#!/bin/bash\n# Lab 2.2.1: 编译和测试 PCI 驱动骨架\n\n# 步骤 1: 创建驱动目录\nmkdir -p ~/driver_lab/my_pci_driver\ncd ~/driver_lab/my_pci_driver\n\n# 步骤 2: 创建 Makefile\ncat > Makefile << 'EOF'\nobj-m += my_pci_driver.o\n\nKDIR := /lib/modules/$(shell uname -r)/build\n\nall:\n\tmake -C $(KDIR) M=$(PWD) modules\n\nclean:\n\tmake -C $(KDIR) M=$(PWD) clean\nEOF\n\n# 步骤 3: 将上面的 C 代码保存为 my_pci_driver.c\n# (此处省略，请将 Code Walk 中的代码保存到文件)\n\n# 步骤 4: 编译驱动\necho \"=== 编译驱动 ===\"\nmake\n# 成功时输出: Building modules, stage 2.\n# 生成 my_pci_driver.ko\n\n# 步骤 5: 查看模块信息\necho \"\"\necho \"=== 模块信息 ===\"\nmodinfo my_pci_driver.ko\n\n# 步骤 6: 加载模块（注意：这会尝试绑定到 AMD GPU！）\n# 先卸载 amdgpu 驱动（谨慎！会导致显示器黑屏）\n# sudo rmmod amdgpu\n# sudo insmod my_pci_driver.ko\n# sudo dmesg | tail -20\n\n# 步骤 7: 安全测试方式：使用 fake 设备 ID\necho \"\"\necho \"=== 模块已编译，设备 ID 表 ===\"\nmodinfo my_pci_driver.ko | grep alias\n# alias: pci:v00001002d00007480sv*sd*bc*sc*i*",
        "expectedOutput": "=== 编译驱动 ===\nmake -C /lib/modules/6.8.0-52-generic/build M=/root/driver_lab/my_pci_driver modules\nmake[1]: Entering directory '/usr/src/linux-headers-6.8.0-52-generic'\n  CC [M]  /root/driver_lab/my_pci_driver/my_pci_driver.o\n  MODPOST /root/driver_lab/my_pci_driver/Module.symvers\n  CC [M]  /root/driver_lab/my_pci_driver/my_pci_driver.mod.o\n  LD [M]  /root/driver_lab/my_pci_driver/my_pci_driver.ko\nmake[1]: Leaving directory\n\n=== 模块信息 ===\nfilename:       /root/driver_lab/my_pci_driver/my_pci_driver.ko\nlicense:        GPL\nauthor:         AMD Driver Student\nalias:          pci:v00001002d00007480sv*sd*bc*sc*i*"
      },
      "debugExercise": {
        "title": "资源泄漏：probe 失败时未释放资源",
        "language": "c",
        "question": "以下 probe() 函数在 request_irq 失败时会泄漏哪些资源？",
        "buggyCode": "static int leaky_probe(struct pci_dev *pdev,\n                       const struct pci_device_id *id)\n{\n    void __iomem *mmio;\n    int ret;\n\n    ret = pci_enable_device(pdev);\n    if (ret) return ret;\n\n    ret = pci_request_regions(pdev, \"my_driver\");\n    if (ret) return ret;  /* 泄漏：没有 pci_disable_device() */\n\n    mmio = ioremap(pci_resource_start(pdev, 2),\n                   pci_resource_len(pdev, 2));\n    if (!mmio) return -ENOMEM;  /* 泄漏：没有 pci_release_regions() */\n\n    ret = request_irq(pci_irq_vector(pdev, 0), my_handler, 0, \"drv\", pdev);\n    if (ret) return ret;  /* 泄漏：没有 iounmap() 和 pci_release_regions() */\n\n    return 0;\n}",
        "hint": "每个成功的资源分配都需要对应的释放操作。使用 goto 标签可以优雅地处理错误路径。",
        "solution": "正确做法是使用 goto 标签：`err_iounmap: iounmap(mmio); err_release: pci_release_regions(pdev); err_disable: pci_disable_device(pdev); return ret;`。或者使用 `devm_*` 和 `pcim_*` 系列函数，它们在设备移除时自动释放资源，完全避免了这类问题。"
      },
      "interviewQuestion": {
        "question": "解释 devm_kzalloc() 和 kzalloc() 的区别，以及在驱动开发中为什么推荐使用 devm_* 系列函数？",
        "difficulty": "medium",
        "hint": "考虑错误路径处理和代码维护性",
        "answer": "kzalloc() 分配的内存必须手动调用 kfree() 释放，在复杂的错误路径中容易遗漏导致内存泄漏。devm_kzalloc() 将分配的内存与设备（struct device）绑定，当设备移除时（device_release() 调用时），内核自动释放所有通过 devm_* 分配的资源。优点：1) 消除错误路径中的资源泄漏风险；2) 简化 remove() 函数（很多资源不需要手动释放）；3) 代码更简洁、更易维护。类似地，pcim_enable_device()、pcim_iomap_regions() 等 pcim_* 函数也是设备管理版本，推荐在驱动开发中优先使用。"
      },
      "completionChecklist": [
        "能写出一个完整的 PCI 驱动骨架",
        "理解 probe() 和 remove() 的对称性",
        "知道 devm_* 系列函数的优势",
        "能编译并加载一个内核模块",
        "理解 pci_set_drvdata()/pci_get_drvdata() 的用途"
      ]
    },
    {
      "id": "2-2-2",
      "title": "GPU 内存域：VRAM vs GTT",
      "duration": 20,
      "difficulty": "intermediate",
      "concept": {
        "summary": "GPU 有多个内存域（Memory Domain），每个域有不同的访问速度和用途。理解这些内存域是理解 GEM/TTM 内存管理的基础。amdgpu 主要使用三个域：VRAM（GPU 本地显存）、GTT（通过 PCIe 访问的系统内存）和 CPU（纯 CPU 访问）。",
        "keyPoints": [
          "VRAM：GPU 本地显存，速度最快（>500 GB/s），CPU 访问慢（需要通过 PCIe）",
          "GTT（Graphics Translation Table）：系统 RAM 通过 IOMMU 映射给 GPU 使用",
          "GTT 速度受 PCIe 带宽限制（~32 GB/s），但容量大（可达系统 RAM 大小）",
          "驱动根据访问模式自动在 VRAM 和 GTT 之间迁移 Buffer Object",
          "内存压力时，不常用的 VRAM 内容会被驱逐（evict）到 GTT 或系统内存"
        ]
      },
      "diagram": {
        "title": "GPU 内存域架构",
        "content": "\n┌─────────────────────────────────────────────────────┐\n│                    GPU (RX 7600 XT)                  │\n│                                                      │\n│  ┌──────────────────────────────────────────────┐   │\n│  │              VRAM (8 GB GDDR6)               │   │\n│  │  带宽: ~288 GB/s (GPU 本地访问)              │   │\n│  │  CPU 访问: ~8 GB/s (通过 PCIe BAR0)          │   │\n│  │                                              │   │\n│  │  用途:                                       │   │\n│  │  • 渲染目标 (Render Target)                  │   │\n│  │  • 纹理 (Texture)                            │   │\n│  │  • 顶点/索引缓冲区                           │   │\n│  │  • GPU 命令缓冲区                            │   │\n│  └──────────────────────────────────────────────┘   │\n│                                                      │\n│  ┌──────────────────────────────────────────────┐   │\n│  │         GTT (Graphics Translation Table)     │   │\n│  │  = 系统 RAM 通过 IOMMU 映射                  │   │\n│  │  带宽: ~32 GB/s (PCIe 4.0 x8)               │   │\n│  │                                              │   │\n│  │  用途:                                       │   │\n│  │  • CPU-GPU 共享缓冲区                        │   │\n│  │  • 命令提交缓冲区 (IB)                       │   │\n│  │  • VRAM 溢出时的备用空间                     │   │\n│  └──────────────────────────────────────────────┘   │\n└─────────────────────────────────────────────────────┘\n         |                    |\n         | PCIe 4.0 x8        | IOMMU\n         v                    v\n┌─────────────────────────────────────────────────────┐\n│              系统内存 (System RAM, 32 GB)            │\n│  CPU 访问: ~50 GB/s                                  │\n│  GPU 访问: ~32 GB/s (通过 PCIe + IOMMU)              │\n└─────────────────────────────────────────────────────┘\n",
        "caption": "GPU 内存域：VRAM 速度最快但容量有限，GTT 利用系统 RAM 扩展 GPU 可用内存"
      },
      "codeWalk": {
        "title": "amdgpu 内存域定义和 BO 分配",
        "language": "c",
        "code": "/* include/uapi/drm/amdgpu_drm.h */\n/* 内存域标志位 */\n#define AMDGPU_GEM_DOMAIN_CPU       0x1  /* CPU 可直接访问 */\n#define AMDGPU_GEM_DOMAIN_GTT       0x2  /* GPU 通过 IOMMU 访问系统内存 */\n#define AMDGPU_GEM_DOMAIN_VRAM      0x4  /* GPU 本地显存 */\n#define AMDGPU_GEM_DOMAIN_GDS       0x8  /* Global Data Store（计算用）*/\n#define AMDGPU_GEM_DOMAIN_GWS       0x10 /* Global Wave Sync */\n#define AMDGPU_GEM_DOMAIN_OA        0x20 /* Ordered Append */\n\n/* drivers/gpu/drm/amd/amdgpu/amdgpu_object.c */\nint amdgpu_bo_create(struct amdgpu_device *adev,\n                      struct amdgpu_bo_param *bp,\n                      struct amdgpu_bo **bo_ptr)\n{\n    struct ttm_place *places;\n    struct ttm_placement placement;\n\n    /* 根据请求的内存域设置 TTM 放置策略 */\n    if (bp->domain & AMDGPU_GEM_DOMAIN_VRAM) {\n        /* 首选 VRAM，备选 GTT */\n        places[0].fpfn = 0;\n        places[0].lpfn = 0;\n        places[0].mem_type = TTM_PL_VRAM;\n        places[0].flags = 0;\n        \n        places[1].fpfn = 0;\n        places[1].lpfn = 0;\n        places[1].mem_type = TTM_PL_TT;  /* GTT = TT in TTM */\n        places[1].flags = TTM_PL_FLAG_FALLBACK;\n        \n        placement.num_placement = 2;\n    } else if (bp->domain & AMDGPU_GEM_DOMAIN_GTT) {\n        /* 仅使用 GTT */\n        places[0].mem_type = TTM_PL_TT;\n        placement.num_placement = 1;\n    }\n\n    /* 通过 TTM 分配 Buffer Object */\n    return ttm_bo_init_reserved(&adev->mman.bdev,\n                                 &bo->tbo,\n                                 bp->size,\n                                 ttm_bo_type_device,\n                                 &placement,\n                                 0, NULL, NULL, NULL,\n                                 &amdgpu_bo_destroy);\n}\n\n/* 查询 BO 当前在哪个内存域 */\nuint32_t amdgpu_bo_mem_domain(struct amdgpu_bo *bo)\n{\n    switch (bo->tbo.resource->mem_type) {\n    case TTM_PL_VRAM:\n        return AMDGPU_GEM_DOMAIN_VRAM;\n    case TTM_PL_TT:\n        return AMDGPU_GEM_DOMAIN_GTT;\n    case TTM_PL_SYSTEM:\n        return AMDGPU_GEM_DOMAIN_CPU;\n    default:\n        return 0;\n    }\n}",
        "explanation": "amdgpu 通过 TTM（Translation Table Manager）管理内存域。创建 Buffer Object 时可以指定首选域（如 VRAM）和备选域（如 GTT），TTM 根据内存压力自动在域之间迁移 BO。"
      },
      "miniLab": {
        "title": "观察 GPU 内存域使用情况",
        "language": "bash",
        "code": "#!/bin/bash\n# Lab 2.2.2: 观察 VRAM 和 GTT 内存使用情况\n\n# 步骤 1: 查看 VRAM 和 GTT 总量及使用量\necho \"=== GPU 内存域使用情况 ===\"\nGPU_CARD=$(ls /sys/class/drm/ | grep \"^card[0-9]$\" | head -1)\nCARD_PATH=\"/sys/class/drm/$GPU_CARD/device\"\n\necho \"VRAM 总量: $(( $(cat $CARD_PATH/mem_info_vram_total) / 1024 / 1024 )) MB\"\necho \"VRAM 已用: $(( $(cat $CARD_PATH/mem_info_vram_used) / 1024 / 1024 )) MB\"\necho \"GTT  总量: $(( $(cat $CARD_PATH/mem_info_gtt_total) / 1024 / 1024 )) MB\"\necho \"GTT  已用: $(( $(cat $CARD_PATH/mem_info_gtt_used) / 1024 / 1024 )) MB\"\n\n# 步骤 2: 通过 debugfs 查看详细的 BO 分配\necho \"\"\necho \"=== Buffer Object 分配详情 ===\"\nif [ -f /sys/kernel/debug/dri/0/amdgpu_gem_info ]; then\n    sudo cat /sys/kernel/debug/dri/0/amdgpu_gem_info | head -30\nfi\n\n# 步骤 3: 运行 GPU 负载，观察内存变化\necho \"\"\necho \"=== 运行 glxgears 并观察 VRAM 变化 ===\"\n# 在后台运行 glxgears（需要 mesa-utils）\nglxgears -fullscreen &\nGEARS_PID=$!\nsleep 2\n\necho \"运行中的 VRAM 使用:\"\necho \"VRAM 已用: $(( $(cat $CARD_PATH/mem_info_vram_used) / 1024 / 1024 )) MB\"\n\nkill $GEARS_PID 2>/dev/null\nsleep 1\necho \"停止后的 VRAM 使用:\"\necho \"VRAM 已用: $(( $(cat $CARD_PATH/mem_info_vram_used) / 1024 / 1024 )) MB\"\n\n# 步骤 4: 查看内存驱逐统计\necho \"\"\necho \"=== 内存驱逐统计 ===\"\nsudo cat /sys/kernel/debug/dri/0/amdgpu_eviction_stats 2>/dev/null || \\\n    echo \"驱逐统计不可用（需要较新的内核）\"\n\n# 步骤 5: 使用 radeontop 实时监控（需要安装）\necho \"\"\necho \"=== 实时 GPU 内存监控 ===\"\necho \"安装: sudo apt install radeontop\"\necho \"运行: radeontop -c -d - -l 1 | grep -E 'vram|gtt'\"\n",
        "expectedOutput": "=== GPU 内存域使用情况 ===\nVRAM 总量: 8192 MB\nVRAM 已用: 487 MB\nGTT  总量: 8192 MB\nGTT  已用: 156 MB\n\n=== Buffer Object 分配详情 ===\npid    1234 command Xorg:\n    0x00000001: 4096 kB VRAM (渲染目标)\n    0x00000002: 1024 kB VRAM (纹理)\n    0x00000003:  256 kB GTT  (命令缓冲区)"
      },
      "debugExercise": {
        "title": "VRAM 溢出导致性能骤降",
        "language": "bash",
        "question": "用户报告在运行大型游戏时 GPU 性能突然骤降 50%。如何诊断是否是 VRAM 溢出导致的？",
        "buggyCode": "# 用户的症状：\n# - 游戏开始时流畅（60 FPS）\n# - 加载大地图后帧率骤降到 30 FPS\n# - GPU 使用率显示 100%，但帧率很低\n# - 没有报错信息\n\n# 你会如何诊断？",
        "hint": "当 VRAM 不足时，驱动会将部分 BO 驱逐到 GTT（系统内存），GPU 访问这些数据需要通过 PCIe，速度从 500 GB/s 降到 32 GB/s。",
        "solution": "诊断步骤：1) `cat /sys/class/drm/card0/device/mem_info_vram_used` 查看 VRAM 使用量是否接近 8192 MB；2) `sudo cat /sys/kernel/debug/dri/0/amdgpu_eviction_stats` 查看驱逐次数；3) 使用 `radeontop` 观察 VRAM 和 GTT 使用量的变化。如果 VRAM 满了且 GTT 使用量激增，说明发生了大量驱逐。解决方案：降低游戏纹理质量设置，或升级到更大 VRAM 的 GPU。"
      },
      "interviewQuestion": {
        "question": "解释 VRAM 和 GTT 的区别，以及 amdgpu 驱动如何决定将一个 Buffer Object 放在 VRAM 还是 GTT？",
        "difficulty": "medium",
        "hint": "从带宽、延迟、CPU 访问需求和内存压力四个角度分析",
        "answer": "VRAM 是 GPU 本地显存（GDDR6），带宽高（~288 GB/s）但 CPU 访问慢（需要通过 PCIe BAR）。GTT 是通过 IOMMU 映射的系统 RAM，GPU 访问速度受 PCIe 限制（~32 GB/s），但 CPU 可以快速访问。amdgpu 的放置策略：1) 渲染目标、纹理等 GPU 密集访问的 BO 首选 VRAM；2) CPU-GPU 共享的命令缓冲区（IB）首选 GTT；3) 内存压力时，最近最少使用（LRU）的 VRAM BO 被驱逐到 GTT；4) 用户可以通过 GEM 创建时的 domain 标志指定偏好。"
      },
      "completionChecklist": [
        "理解 VRAM 和 GTT 的带宽和延迟差异",
        "知道哪类数据适合放在 VRAM，哪类适合 GTT",
        "理解内存驱逐（eviction）的触发条件",
        "能通过 sysfs 查看 VRAM 和 GTT 使用量",
        "理解 TTM 如何管理多个内存域"
      ]
    },
    {
      "id": "2-2-3",
      "title": "GPU 命令环（Command Ring）",
      "duration": 25,
      "difficulty": "intermediate",
      "concept": {
        "summary": "Command Ring（命令环）是 CPU 向 GPU 提交工作的核心机制。CPU 将 GPU 命令写入一个环形缓冲区（Ring Buffer），然后更新 Write Pointer（写指针）通知 GPU。GPU 从 Read Pointer（读指针）开始执行命令，执行完后更新读指针。这个生产者-消费者模型是所有 GPU 驱动的核心。",
        "keyPoints": [
          "Ring Buffer 是一个固定大小的循环队列，存储 GPU 命令（Packet）",
          "CPU 是生产者：写入命令并更新 Write Pointer（WPtr）",
          "GPU 是消费者：从 Read Pointer（RPtr）读取并执行命令",
          "Doorbell 是一个特殊的 MMIO 寄存器，CPU 写入 WPtr 来通知 GPU",
          "amdgpu 有多个 Ring：GFX Ring（图形）、SDMA Ring（数据传输）、Compute Ring（计算）"
        ]
      },
      "diagram": {
        "title": "GPU Command Ring 工作原理",
        "content": "\nRing Buffer (在 GTT 内存中)\n┌─────────────────────────────────────────────────────────┐\n│  [0]  [1]  [2]  [3]  [4]  [5]  [6]  [7]  [8]  [9] ...  │\n│   ↑                   ↑                                  │\n│  RPtr               WPtr                                 │\n│  (GPU 读到这里)      (CPU 写到这里)                      │\n└─────────────────────────────────────────────────────────┘\n\n工作流程:\n1. CPU 写入命令到 ring[WPtr]\n   ring[4] = PM4_DRAW_INDEX_2  ← 绘制命令\n   ring[5] = vertex_count\n   ring[6] = index_addr_lo\n   ring[7] = index_addr_hi\n   WPtr = 8\n\n2. CPU 写入 WPtr 到 Doorbell 寄存器\n   writel(8, doorbell_base + ring->doorbell_index * 4)\n   ↓ 通知 GPU 有新命令\n\n3. GPU 读取 ring[4..7]，执行绘制命令\n   RPtr = 8\n\n4. GPU 完成后触发中断\n   CPU 收到中断，唤醒等待的进程\n\n环形结构: 当 WPtr 到达末尾时，回绕到 0\nWPtr = (WPtr + cmd_size) & ring->buf_mask\n",
        "caption": "Command Ring：CPU 写命令更新 WPtr，GPU 读命令更新 RPtr，Doorbell 通知 GPU 有新工作"
      },
      "codeWalk": {
        "title": "amdgpu Ring 的核心操作",
        "language": "c",
        "code": "/* drivers/gpu/drm/amd/amdgpu/amdgpu_ring.c */\n\n/* Ring 数据结构 */\nstruct amdgpu_ring {\n    struct amdgpu_device *adev;\n    uint32_t *ring;         /* Ring Buffer 的 CPU 虚拟地址 */\n    uint64_t gpu_addr;      /* Ring Buffer 的 GPU DMA 地址 */\n    unsigned ring_size;     /* Ring 大小（字节）*/\n    unsigned buf_mask;      /* 用于环绕：wptr & buf_mask */\n    uint32_t wptr;          /* Write Pointer（CPU 维护）*/\n    uint32_t rptr;          /* Read Pointer（GPU 更新）*/\n    unsigned doorbell_index; /* Doorbell 寄存器索引 */\n    /* ... */\n};\n\n/* 向 Ring 写入一个 DWORD（4字节）命令 */\nvoid amdgpu_ring_write(struct amdgpu_ring *ring, uint32_t v)\n{\n    /* 检查 Ring 是否有空间 */\n    if (ring->count_dw <= 0)\n        DRM_ERROR(\"amdgpu: writing more dwords to the ring than expected!\\n\");\n    \n    ring->ring[ring->wptr++ & ring->buf_mask] = v;\n    ring->wptr &= ring->buf_mask;\n    ring->count_dw--;\n}\n\n/* 提交命令：更新 WPtr 并通知 GPU */\nvoid amdgpu_ring_commit(struct amdgpu_ring *ring)\n{\n    uint32_t count;\n    \n    /* 填充 NOP 命令对齐 */\n    count = ring->align_mask + 1 - (ring->wptr & ring->align_mask);\n    ring->funcs->insert_nop(ring, count);\n    \n    mb();  /* 内存屏障：确保所有命令写入完成后再更新 WPtr */\n    \n    /* 通过 Doorbell 通知 GPU 新的 WPtr */\n    amdgpu_ring_set_wptr(ring);\n}\n\n/* 通过 Doorbell 写入 WPtr */\nstatic void gfx_v11_ring_set_wptr_gfx(struct amdgpu_ring *ring)\n{\n    struct amdgpu_device *adev = ring->adev;\n    \n    if (ring->use_doorbell) {\n        /* 写入 Doorbell 寄存器（BAR4 中的特殊地址）*/\n        *ring->wptr_cpu_addr = ring->wptr;\n        WDOORBELL64(ring->doorbell_index, ring->wptr);\n        /* WDOORBELL64 = 写入 BAR4 中的 Doorbell 地址 */\n    } else {\n        /* 直接写入 MMIO 寄存器 */\n        WREG32(mmCP_RB_WPTR, lower_32_bits(ring->wptr));\n    }\n}\n\n/* 使用示例：提交一个绘制命令 */\nvoid submit_draw_command(struct amdgpu_ring *ring,\n                          uint32_t vertex_count,\n                          uint64_t index_addr)\n{\n    /* 预留空间 */\n    amdgpu_ring_alloc(ring, 8);\n    \n    /* 写入 PM4 绘制命令包 */\n    amdgpu_ring_write(ring, PACKET3(PACKET3_DRAW_INDEX_2, 4));\n    amdgpu_ring_write(ring, 0xFFFFFFFF);        /* max_size */\n    amdgpu_ring_write(ring, lower_32_bits(index_addr));\n    amdgpu_ring_write(ring, upper_32_bits(index_addr));\n    amdgpu_ring_write(ring, vertex_count);\n    amdgpu_ring_write(ring, 0);                 /* draw_initiator */\n    \n    /* 提交：更新 WPtr，通知 GPU */\n    amdgpu_ring_commit(ring);\n}",
        "explanation": "Command Ring 的核心是 `amdgpu_ring_write()` 和 `amdgpu_ring_commit()`。写入命令后必须调用 commit() 更新 WPtr，否则 GPU 不知道有新命令。内存屏障（mb()）确保命令写入顺序正确。"
      },
      "miniLab": {
        "title": "观察 GPU Ring 状态",
        "language": "bash",
        "code": "#!/bin/bash\n# Lab 2.2.3: 观察 GPU Command Ring 状态\n\n# 步骤 1: 查看所有 Ring 的状态\necho \"=== GPU Ring 状态 ===\"\nif [ -d /sys/kernel/debug/dri/0 ]; then\n    sudo cat /sys/kernel/debug/dri/0/amdgpu_ring_gfx 2>/dev/null | head -20\n    echo \"---\"\n    sudo cat /sys/kernel/debug/dri/0/amdgpu_ring_sdma0 2>/dev/null | head -10\nfi\n\n# 步骤 2: 查看 Ring 的 WPtr 和 RPtr\necho \"\"\necho \"=== Ring 指针状态 ===\"\nfor ring_file in /sys/kernel/debug/dri/0/amdgpu_ring_*; do\n    if [ -f \"$ring_file\" ]; then\n        ring_name=$(basename $ring_file)\n        echo \"Ring: $ring_name\"\n        sudo cat \"$ring_file\" 2>/dev/null | grep -E \"wptr|rptr|ready|status\" | head -5\n        echo \"---\"\n    fi\ndone\n\n# 步骤 3: 查看 GPU 调度器状态\necho \"\"\necho \"=== GPU 调度器状态 ===\"\nsudo cat /sys/kernel/debug/dri/0/amdgpu_sched 2>/dev/null | head -30\n\n# 步骤 4: 提交一个简单的 GPU 计算任务并观察 Ring 变化\necho \"\"\necho \"=== 提交 GPU 任务（使用 clinfo 或 rocm-smi）===\"\nif command -v rocm-smi &> /dev/null; then\n    rocm-smi --showuse\nelse\n    echo \"安装 rocm-smi: sudo apt install rocm-smi-lib\"\n    echo \"或使用 glxgears 触发 GFX Ring 活动\"\nfi",
        "expectedOutput": "=== GPU Ring 状态 ===\nGFX ring 0 : rptr=0x00001234, wptr=0x00001234\n  ready=1\n  last_ptr=0x00001234\n  last_seq=12345\n  last_jiffies=4294967295\n\n=== GPU 调度器状态 ===\nring=gfx_0.0.0, jobs: 0 in queue, 0 in flight\nring=sdma0, jobs: 0 in queue, 0 in flight"
      },
      "debugExercise": {
        "title": "GPU Hang：Ring 停止响应",
        "language": "bash",
        "question": "用户报告 GPU 挂起（GPU Hang），dmesg 显示 'amdgpu: GPU reset begin'。如何通过 Ring 状态诊断问题？",
        "buggyCode": "# dmesg 输出:\n# [1234.567890] amdgpu 0000:01:00.0: amdgpu: GPU reset begin!\n# [1234.567891] amdgpu 0000:01:00.0: amdgpu: GPU HANG: 0x00000001\n# [1234.567892] amdgpu 0000:01:00.0: amdgpu: GRBM_STATUS=0x21003428\n# [1234.567893] amdgpu 0000:01:00.0: amdgpu: GRBM_STATUS2=0x00000000\n# [1234.567894] amdgpu 0000:01:00.0: amdgpu: CP_RB_RPTR=0x00001234\n# [1234.567895] amdgpu 0000:01:00.0: amdgpu: CP_RB_WPTR=0x00001240\n# [1234.567896] amdgpu 0000:01:00.0: amdgpu: CP_RB_RPTR 没有前进！",
        "hint": "当 RPtr 停止前进但 WPtr 继续增加时，说明 GPU 卡在某个命令上无法继续执行。查看 GRBM_STATUS 的各个位可以确定是哪个引擎挂起。",
        "solution": "诊断步骤：1) CP_RB_RPTR 没有前进说明 Command Processor 卡住了；2) GRBM_STATUS=0x21003428 中 bit 28 (GUI_ACTIVE) 为 1 说明 GPU 仍在尝试执行；3) 查看 CP_RB_RPTR 指向的命令内容，找到导致挂起的具体命令；4) 常见原因：无效的内存地址、死锁的 semaphore、firmware bug。解决：amdgpu 会自动触发 GPU reset，重置后恢复正常。"
      },
      "interviewQuestion": {
        "question": "解释 GPU Command Ring 中 Write Pointer 和 Read Pointer 的作用，以及为什么在更新 WPtr 前需要内存屏障（memory barrier）？",
        "difficulty": "hard",
        "hint": "考虑 CPU 乱序执行和 PCIe 写传输的顺序保证",
        "answer": "WPtr（Write Pointer）由 CPU 维护，指向下一个可写入命令的位置。RPtr（Read Pointer）由 GPU 维护，指向下一个待执行命令的位置。CPU 写入命令后必须先执行内存屏障（mb()），再更新 WPtr（通过 Doorbell）。原因：1) CPU 乱序执行：现代 CPU 可能重排写操作，如果 WPtr 先于命令数据到达 GPU，GPU 会读到未初始化的命令；2) PCIe 写传输：PCIe 不保证写操作的顺序，内存屏障确保所有命令写入在 Doorbell 写入之前完成；3) 编译器优化：mb() 同时作为编译器屏障，防止编译器重排这些写操作。"
      },
      "completionChecklist": [
        "理解 Ring Buffer 的环形结构和 WPtr/RPtr 机制",
        "知道 Doorbell 的作用和为什么使用 BAR4",
        "理解为什么更新 WPtr 前需要内存屏障",
        "知道 amdgpu 有哪几种 Ring 及其用途",
        "能通过 debugfs 查看 Ring 的当前状态"
      ]
    },
    {
      "id": "2-2-4",
      "title": "GPU Firmware 加载",
      "duration": 20,
      "difficulty": "intermediate",
      "concept": {
        "summary": "现代 GPU 包含多个微控制器（如 CP、SDMA、SMU、PSP 等），每个都需要加载特定的 Firmware（固件/微码）才能工作。Linux 内核通过 request_firmware() 从文件系统加载这些固件文件，然后将其传输到 GPU 的特定内存区域。固件加载失败是 GPU 初始化失败的常见原因。",
        "keyPoints": [
          "GPU 固件文件存放在 /lib/firmware/amdgpu/ 目录下",
          "文件命名规则：{chip}_{component}.bin，如 navi33_pfp.bin（RX 7600 XT 的 PFP 固件）",
          "PSP（Platform Security Processor）是最先加载的固件，负责安全启动",
          "CP（Command Processor）固件包含 PFP（Pre-Fetch Parser）和 ME（Micro Engine）",
          "固件版本必须与驱动版本匹配，版本不匹配会导致 GPU 初始化失败"
        ]
      },
      "diagram": {
        "title": "GPU 固件加载顺序",
        "content": "\nGPU 初始化开始\n        |\n        v\n1. PSP 固件加载（最高优先级）\n   /lib/firmware/amdgpu/navi33_psp.bin\n   /lib/firmware/amdgpu/navi33_psp_14.0.0.bin\n        |\n        v\n2. SMU 固件加载（电源管理）\n   /lib/firmware/amdgpu/navi33_smu.bin\n        |\n        v\n3. GFX 固件加载（图形引擎）\n   navi33_pfp.bin  ← Pre-Fetch Parser\n   navi33_me.bin   ← Micro Engine\n   navi33_ce.bin   ← Constant Engine\n   navi33_rlc.bin  ← Run List Controller\n        |\n        v\n4. SDMA 固件加载（数据传输引擎）\n   navi33_sdma.bin\n        |\n        v\n5. VCN 固件加载（视频编解码）\n   navi33_vcn.bin\n        |\n        v\n6. DCN 固件加载（显示控制器）\n   （内置于 amdgpu 驱动，不需要外部文件）\n        |\n        v\n所有固件加载完成，GPU 就绪\n",
        "caption": "GPU 固件按严格顺序加载，PSP 最先（安全启动），其他组件依次初始化"
      },
      "codeWalk": {
        "title": "amdgpu 固件加载流程",
        "language": "c",
        "code": "/* drivers/gpu/drm/amd/amdgpu/gfx_v11_0.c */\n\n/* GFX 固件加载函数 */\nstatic int gfx_v11_0_init_microcode(struct amdgpu_device *adev)\n{\n    char fw_name[40];\n    int err;\n    \n    /* 构造固件文件名 */\n    /* chip_name = \"navi33\" (RX 7600 XT) */\n    snprintf(fw_name, sizeof(fw_name), \"amdgpu/%s_pfp.bin\",\n             adev->asic_name);\n    /* fw_name = \"amdgpu/navi33_pfp.bin\" */\n    \n    /* 从文件系统请求固件 */\n    err = request_firmware(&adev->gfx.pfp_fw,\n                           fw_name,\n                           adev->dev);\n    if (err) {\n        dev_err(adev->dev,\n                \"Failed to load firmware \\\"%s\\\"\\n\", fw_name);\n        /* 常见错误：固件文件不存在\n         * 解决：sudo apt install firmware-amd-graphics\n         * 或从 https://git.kernel.org/firmware 下载 */\n        return err;\n    }\n    \n    /* 验证固件版本 */\n    const struct gfx_firmware_header_v1_0 *pfp_hdr =\n        (const void *)adev->gfx.pfp_fw->data;\n    \n    adev->gfx.pfp_fw_version = le32_to_cpu(pfp_hdr->header.ucode_version);\n    adev->gfx.pfp_feature_version = le32_to_cpu(pfp_hdr->ucode_feature_version);\n    \n    dev_info(adev->dev, \"PFP firmware version: %d.%d\\n\",\n             adev->gfx.pfp_fw_version >> 16,\n             adev->gfx.pfp_fw_version & 0xFFFF);\n    \n    /* 同样加载 ME、CE、RLC 固件... */\n    return 0;\n}\n\n/* 将固件上传到 GPU */\nstatic int gfx_v11_0_cp_gfx_load_pfp_microcode(struct amdgpu_device *adev)\n{\n    const struct gfx_firmware_header_v1_0 *pfp_hdr;\n    const __le32 *fw_data;\n    unsigned fw_size;\n    int i;\n    \n    pfp_hdr = (const void *)adev->gfx.pfp_fw->data;\n    fw_data = (const __le32 *)(adev->gfx.pfp_fw->data +\n               le32_to_cpu(pfp_hdr->header.ucode_array_offset_bytes));\n    fw_size = le32_to_cpu(pfp_hdr->header.ucode_size_bytes) / 4;\n    \n    /* 通过 MMIO 将固件写入 GPU 内部 SRAM */\n    WREG32_SOC15(GC, 0, regCP_PFP_UCODE_ADDR, 0);\n    for (i = 0; i < fw_size; i++)\n        WREG32_SOC15(GC, 0, regCP_PFP_UCODE_DATA,\n                     le32_to_cpup(fw_data++));\n    WREG32_SOC15(GC, 0, regCP_PFP_UCODE_ADDR, adev->gfx.pfp_fw_version);\n    \n    return 0;\n}",
        "explanation": "固件加载分两步：1) `request_firmware()` 从 `/lib/firmware/amdgpu/` 读取固件文件到内存；2) 通过 MMIO 寄存器将固件数据写入 GPU 内部 SRAM。固件版本验证确保驱动和固件的兼容性。"
      },
      "miniLab": {
        "title": "查看和管理 GPU 固件",
        "language": "bash",
        "code": "#!/bin/bash\n# Lab 2.2.4: 查看 AMD GPU 固件文件和版本\n\n# 步骤 1: 查看已安装的 AMD GPU 固件文件\necho \"=== AMD GPU 固件文件 ===\"\nls /lib/firmware/amdgpu/ | grep \"navi33\\|navi31\\|navi32\" | head -20\n# navi33 = RX 7600/7600 XT\n# navi31 = RX 7900 XTX/XT\n# navi32 = RX 7700/7800 XT\n\n# 步骤 2: 查看固件版本（从 dmesg）\necho \"\"\necho \"=== 固件加载日志 ===\"\nsudo dmesg | grep -E \"amdgpu.*firmware|amdgpu.*ucode|amdgpu.*fw\" | head -20\n\n# 步骤 3: 查看当前加载的固件版本\necho \"\"\necho \"=== 当前固件版本 ===\"\nGPU_CARD=$(ls /sys/class/drm/ | grep \"^card[0-9]$\" | head -1)\nif [ -f /sys/class/drm/$GPU_CARD/device/fw_version ]; then\n    cat /sys/class/drm/$GPU_CARD/device/fw_version\nfi\n\n# 通过 sysfs 查看各组件固件版本\nfor fw_file in /sys/class/drm/$GPU_CARD/device/fw_*; do\n    if [ -f \"$fw_file\" ]; then\n        echo \"$(basename $fw_file): $(cat $fw_file)\"\n    fi\ndone\n\n# 步骤 4: 检查固件文件完整性\necho \"\"\necho \"=== 固件文件大小 ===\"\nls -lh /lib/firmware/amdgpu/navi33_*.bin 2>/dev/null | head -10\n\n# 步骤 5: 模拟固件缺失（了解错误处理）\necho \"\"\necho \"=== 如果固件缺失，dmesg 会显示 ===\"\necho \"amdgpu: Failed to load firmware 'amdgpu/navi33_pfp.bin'\"\necho \"解决方法: sudo apt install firmware-amd-graphics\"\necho \"或: sudo apt install linux-firmware\"\n",
        "expectedOutput": "=== AMD GPU 固件文件 ===\nnavi33_ce.bin\nnavi33_me.bin\nnavi33_mec.bin\nnavi33_pfp.bin\nnavi33_psp.bin\nnavi33_psp_14.0.0.bin\nnavi33_rlc.bin\nnavi33_sdma.bin\nnavi33_smu.bin\nnavi33_vcn.bin\n\n=== 固件加载日志 ===\n[    5.123456] amdgpu 0000:01:00.0: amdgpu: PSP firmware version: 14.0.0\n[    5.234567] amdgpu 0000:01:00.0: amdgpu: PFP firmware version: 3.0.0\n[    5.345678] amdgpu 0000:01:00.0: amdgpu: ME  firmware version: 3.0.0"
      },
      "debugExercise": {
        "title": "固件版本不匹配导致 GPU 初始化失败",
        "language": "bash",
        "question": "用户升级了内核后 GPU 无法初始化，dmesg 显示 'firmware version mismatch'。如何诊断和解决？",
        "buggyCode": "# dmesg 错误信息:\n# [    5.123] amdgpu 0000:01:00.0: amdgpu: Failed to load firmware \"amdgpu/navi33_pfp.bin\"\n# [    5.124] amdgpu 0000:01:00.0: amdgpu: Fatal error during GPU init\n# \n# 或者:\n# [    5.125] amdgpu 0000:01:00.0: amdgpu: navi33_pfp.bin: firmware version 2.0 \n#             but driver requires 3.0\n# [    5.126] amdgpu 0000:01:00.0: amdgpu: GPU init failed\n\n# 如何诊断？",
        "hint": "新内核版本可能需要更新的固件文件。检查 /lib/firmware/amdgpu/ 中的固件版本是否与新内核要求的版本匹配。",
        "solution": "诊断步骤：1) `sudo dmesg | grep 'firmware'` 查看具体的版本要求；2) `ls -la /lib/firmware/amdgpu/navi33_pfp.bin` 检查固件文件是否存在；3) `sudo apt update && sudo apt install --reinstall linux-firmware` 更新固件包；4) 如果包管理器的固件太旧，从 https://git.kernel.org/pub/scm/linux/kernel/git/firmware/linux-firmware.git 手动下载最新固件；5) 更新后重启：`sudo reboot`。"
      },
      "interviewQuestion": {
        "question": "为什么 GPU 需要固件（Firmware）？固件和驱动的职责如何划分？",
        "difficulty": "medium",
        "hint": "考虑实时性、安全性和硬件复杂性",
        "answer": "GPU 固件（运行在 GPU 内部微控制器上）和驱动（运行在 CPU 上）的职责划分：固件负责：1) 实时控制：GPU 内部调度、电源状态切换等需要微秒级响应，CPU 无法及时处理；2) 硬件抽象：隐藏不同 GPU 版本的硬件差异，驱动通过统一接口与固件通信；3) 安全启动：PSP 固件验证其他固件的签名，防止恶意代码运行在 GPU 上；4) 功耗管理：SMU 固件实时调整电压和频率。驱动负责：1) 操作系统接口：实现 DRM/KMS API；2) 内存管理：分配和管理 VRAM/GTT；3) 命令提交：将用户态命令打包提交到 Ring。"
      },
      "completionChecklist": [
        "知道 AMD GPU 固件文件的存放位置和命名规则",
        "理解 PSP、CP、SMU 等固件的作用",
        "知道 request_firmware() 的工作原理",
        "能诊断固件缺失或版本不匹配的问题",
        "理解固件和驱动的职责划分"
      ]
    },
    {
      "id": "2-2-5",
      "title": "GPU 设备重置（Device Reset）",
      "duration": 20,
      "difficulty": "advanced",
      "concept": {
        "summary": "GPU Hang（GPU 挂起）是驱动开发中最常见的严重问题之一。当 GPU 无法在超时时间内完成命令时，驱动必须执行 GPU Reset（设备重置）来恢复正常工作。amdgpu 实现了多级重置策略，从软重置到完整的 FLR（Function Level Reset），尽量在不影响其他应用的情况下恢复 GPU。",
        "keyPoints": [
          "GPU Hang 检测：驱动定期检查 Ring 的 RPtr 是否前进，超时则触发重置",
          "软重置（Soft Reset）：重置 GPU 引擎但不断电，速度快，对用户影响小",
          "硬重置（Hard Reset）：完整的 GPU 重置，包括重新加载固件，耗时较长",
          "FLR（Function Level Reset）：通过 PCIe 协议重置整个 GPU 功能",
          "重置后需要重新初始化所有 GPU 状态：Ring、固件、内存映射等"
        ]
      },
      "diagram": {
        "title": "GPU Hang 检测和重置流程",
        "content": "\n正常工作\n    |\n    v\namdgpu_job_timedout() 被调用\n（GPU 命令超时，默认 10 秒）\n    |\n    v\n检查是否真的 Hang\n    |\n    +-- Ring RPtr 没有前进？ → 是 → GPU Hang 确认\n    |\n    v\n选择重置级别\n    |\n    +-- 尝试 1: 软重置（Soft Reset）\n    |   重置单个引擎（GFX/SDMA/VCN）\n    |   时间: ~100ms\n    |   |\n    |   +-- 成功？ → 恢复正常工作\n    |   |\n    |   +-- 失败？ → 升级到硬重置\n    |\n    +-- 尝试 2: 硬重置（Hard Reset）\n    |   重置整个 GPU，重新加载固件\n    |   时间: ~1-2 秒\n    |   |\n    |   +-- 成功？ → 恢复正常工作\n    |   |\n    |   +-- 失败？ → 升级到 FLR\n    |\n    +-- 尝试 3: FLR（PCIe Function Level Reset）\n        通过 PCIe 协议完整重置\n        时间: ~5 秒\n        |\n        +-- 成功？ → 恢复正常工作\n        +-- 失败？ → 报告致命错误，需要重启系统\n",
        "caption": "GPU 重置采用多级策略：优先尝试影响最小的软重置，逐步升级到更彻底的重置方式"
      },
      "codeWalk": {
        "title": "amdgpu GPU Hang 检测和重置",
        "language": "c",
        "code": "/* drivers/gpu/drm/amd/amdgpu/amdgpu_job.c */\n\n/* 命令超时回调函数（由 DRM 调度器调用）*/\nstatic enum drm_gpu_sched_stat amdgpu_job_timedout(struct drm_sched_job *s_job)\n{\n    struct amdgpu_job *job = to_amdgpu_job(s_job);\n    struct amdgpu_ring *ring = to_amdgpu_ring(s_job->sched);\n    struct amdgpu_device *adev = ring->adev;\n    \n    dev_err(adev->dev, \"GPU timeout on ring %s\\n\", ring->name);\n    \n    /* 打印 GPU 状态寄存器，用于调试 */\n    amdgpu_device_gpu_recover(adev, job, &reset_context);\n    \n    return DRM_GPU_SCHED_STAT_TIMEOUT;\n}\n\n/* drivers/gpu/drm/amd/amdgpu/amdgpu_device.c */\n\nint amdgpu_device_gpu_recover(struct amdgpu_device *adev,\n                               struct amdgpu_job *job,\n                               struct amdgpu_reset_context *reset_context)\n{\n    int r;\n    \n    dev_info(adev->dev, \"GPU reset begin!\\n\");\n    \n    /* 步骤 1: 停止所有 Ring 的提交 */\n    amdgpu_device_stop_pending_resets(adev);\n    \n    /* 步骤 2: 等待正在执行的命令完成（或超时）*/\n    amdgpu_fence_driver_force_completion(ring);\n    \n    /* 步骤 3: 执行实际的 GPU 重置 */\n    r = amdgpu_device_pre_asic_reset(adev, reset_context);\n    if (r)\n        goto end;\n    \n    /* 步骤 4: 调用芯片特定的重置函数 */\n    r = amdgpu_asic_reset(adev);\n    /* 对于 RDNA3，这会调用 gfx_v11_0_soft_reset() 或\n     * amdgpu_device_pci_reset() */\n    \n    /* 步骤 5: 重新初始化 GPU */\n    if (!r) {\n        r = amdgpu_device_post_asic_reset(adev, reset_context);\n        /* 重新加载固件、重建 Ring、恢复内存映射 */\n    }\n    \nend:\n    if (r)\n        dev_err(adev->dev, \"GPU reset failed: %d\\n\", r);\n    else\n        dev_info(adev->dev, \"GPU reset succeeded!\\n\");\n    \n    return r;\n}\n\n/* 软重置：只重置 GFX 引擎 */\nstatic int gfx_v11_0_soft_reset(void *handle)\n{\n    struct amdgpu_device *adev = (struct amdgpu_device *)handle;\n    u32 grbm_soft_reset = 0;\n    \n    /* 检查哪些引擎需要重置 */\n    u32 tmp = RREG32_SOC15(GC, 0, regGRBM_STATUS);\n    if (tmp & GRBM_STATUS__CP_BUSY_MASK)\n        grbm_soft_reset |= GRBM_SOFT_RESET__SOFT_RESET_CP_MASK;\n    \n    if (grbm_soft_reset) {\n        /* 执行软重置 */\n        WREG32_SOC15(GC, 0, regGRBM_SOFT_RESET, grbm_soft_reset);\n        tmp = RREG32_SOC15(GC, 0, regGRBM_SOFT_RESET);\n        udelay(50);  /* 等待重置完成 */\n        \n        /* 清除重置位 */\n        WREG32_SOC15(GC, 0, regGRBM_SOFT_RESET, 0);\n    }\n    return 0;\n}",
        "explanation": "GPU 重置是一个复杂的多步骤过程：停止提交 → 等待完成 → 重置硬件 → 重新初始化。软重置只重置特定引擎，速度快；硬重置重置整个 GPU，需要重新加载固件。"
      },
      "miniLab": {
        "title": "模拟和观察 GPU Hang 恢复",
        "language": "bash",
        "code": "#!/bin/bash\n# Lab 2.2.5: 观察 GPU Hang 和重置过程\n\n# 步骤 1: 查看历史 GPU 重置记录\necho \"=== GPU 重置历史 ===\"\nsudo dmesg | grep -E \"GPU reset|GPU hang|GPU timeout\" | head -20\n\n# 步骤 2: 查看当前 GPU 错误状态\necho \"\"\necho \"=== GPU 错误状态 ===\"\nGPU_CARD=$(ls /sys/class/drm/ | grep \"^card[0-9]$\" | head -1)\ncat /sys/class/drm/$GPU_CARD/device/gpu_reset_count 2>/dev/null || \\\n    echo \"重置计数不可用\"\n\n# 步骤 3: 查看 GPU 健康状态\necho \"\"\necho \"=== GPU 健康状态 ===\"\nif command -v rocm-smi &> /dev/null; then\n    rocm-smi --showrasinfo all 2>/dev/null | head -20\nfi\n\n# 步骤 4: 查看 amdgpu 错误注入接口（用于测试）\necho \"\"\necho \"=== 错误注入接口 ===\"\nls /sys/kernel/debug/dri/0/amdgpu_ras* 2>/dev/null | head -10\n# amdgpu_ras_ctrl: 控制 RAS（Reliability, Availability, Serviceability）\n# amdgpu_ras_eeprom: 记录不可纠正错误的 EEPROM\n\n# 步骤 5: 查看 GPU 重置超时设置\necho \"\"\necho \"=== GPU 超时设置 ===\"\ncat /sys/module/amdgpu/parameters/gpu_recovery 2>/dev/null\ncat /sys/module/amdgpu/parameters/lockup_timeout 2>/dev/null || \\\n    echo \"默认超时: 10000ms (10秒)\"\n\n# 步骤 6: 手动触发 GPU 重置（谨慎！）\necho \"\"\necho \"=== 手动触发 GPU 重置（仅用于测试）===\"\necho \"方法: echo 1 > /sys/kernel/debug/dri/0/amdgpu_reset_debug\"\necho \"注意: 这会导致当前 GPU 任务失败，但不会影响系统稳定性\"\n",
        "expectedOutput": "=== GPU 重置历史 ===\n[12345.678] amdgpu 0000:01:00.0: amdgpu: GPU reset begin!\n[12345.679] amdgpu 0000:01:00.0: amdgpu: GPU HANG: 0x00000001\n[12347.123] amdgpu 0000:01:00.0: amdgpu: GPU reset succeeded!\n[12347.124] amdgpu 0000:01:00.0: amdgpu: GPU reset end!\n\n=== GPU 超时设置 ===\n10000  ← 默认 10 秒超时"
      },
      "debugExercise": {
        "title": "GPU 重置后应用程序崩溃",
        "language": "c",
        "question": "GPU 重置成功后，之前正在运行的 OpenGL 应用程序崩溃了，报告 'context lost'。这是预期行为吗？驱动应该如何处理？",
        "buggyCode": "/* 应用程序报告的错误 */\n// OpenGL 错误: GL_CONTEXT_LOST (0x0507)\n// Vulkan 错误: VK_ERROR_DEVICE_LOST\n// \n// 用户看到: 游戏突然退出，没有错误提示\n// \n// 问题: GPU 重置后，所有 GPU 上下文（Context）都失效了\n// 驱动应该如何通知应用程序？",
        "hint": "GPU 重置会使所有 GPU 上下文失效。现代 API（Vulkan、OpenGL）提供了 'context lost' 机制让应用程序检测并处理这种情况。",
        "solution": "这是预期行为。GPU 重置后：1) 驱动向所有等待的 fence 发送错误信号（-ENODEV 或 -ECANCELED）；2) DRM 调度器通知所有受影响的 job 失败；3) 用户态驱动（Mesa）收到错误后设置 GL_CONTEXT_LOST 标志；4) 应用程序应该检查 glGetGraphicsResetStatus() 并重新创建 OpenGL 上下文。好的游戏引擎（如 Unreal Engine）会自动处理 device lost，透明地重新初始化 GPU 资源。"
      },
      "interviewQuestion": {
        "question": "描述 amdgpu 的 GPU Hang 检测机制，以及为什么需要多级重置策略（软重置 → 硬重置 → FLR）？",
        "difficulty": "hard",
        "hint": "从检测方法、重置代价和用户体验三个角度分析",
        "answer": "Hang 检测：amdgpu 使用 DRM GPU scheduler 的超时机制，每个 job 有超时时间（默认 10 秒）。超时后调用 amdgpu_job_timedout()，检查 Ring 的 RPtr 是否前进——如果 GPU 真的在工作，RPtr 应该在前进。多级重置策略的原因：1) 最小化影响：软重置只重置挂起的引擎（如 GFX），其他引擎（SDMA、VCN）继续工作，对用户影响最小；2) 速度：软重置 ~100ms，硬重置 ~1-2s，FLR ~5s，优先使用快速方案；3) 成功率：软重置可能无法恢复严重的 hang，需要更彻底的重置；4) 兼容性：不是所有 GPU 都支持 FLR，需要逐级尝试。"
      },
      "completionChecklist": [
        "理解 GPU Hang 的检测机制（Ring RPtr 不前进）",
        "知道软重置、硬重置和 FLR 的区别",
        "理解 GPU 重置后应用程序为什么会收到 context lost",
        "能在 dmesg 中识别 GPU Hang 和重置的日志",
        "知道如何通过 sysfs 查看 GPU 重置历史"
      ]
    }
  ]
};
