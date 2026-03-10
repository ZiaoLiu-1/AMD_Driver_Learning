import type { MicroLessonGroup } from "./micro_lesson_types";

export const module2Group2En: MicroLessonGroup = {
  "id": "hardware-kernel-driver",
  "title": "kernel PCI driverdevelopment",
  "description": "write第a PCI driver, understanddriverlifecycleandmemory management",
  "lessons": [
    {
      "id": "2-2-1",
      "title": "第a PCI driver骨架",
      "duration": 25,
      "difficulty": "intermediate",
      "concept": {
        "summary": "writeacomplete Linux PCI driver骨架, understanddrivercompletelifecycle: moduleloading → device discovery(probe)→ deviceuse → device removed(remove)→ moduleunloading. 这isunderstand amdgpu driverarchitecturebasics. ",
        "keyPoints": [
          "PCI driverthrough pci_driver structure体registrationtokernel",
          "probe() indevice discovery时call, remove() indevice removed时call",
          "module_pci_driver() macro简化moduleregistrationandderegistration",
          "drivermustin remove() inreleaseallin probe() inallocationresource",
          "pci_set_drvdata()/pci_get_drvdata() used forin probe and remove betweenpassdata"
        ]
      },
      "diagram": {
        "title": "PCI driverlifecycle",
        "content": "\ninsmod my_driver.ko\n        |\n        v\npci_register_driver(&my_pci_driver)\n        |\n        v\nkernel扫描alreadyhas PCI device\n        |\n        +-- findmatchdevice (vendor:device match)\n        |           |\n        |           v\n        |   my_pci_probe(pdev, id)\n        |       |\n        |       +-- pci_enable_device()\n        |       +-- pci_request_regions()\n        |       +-- ioremap(BAR)\n        |       +-- request_irq()\n        |       +-- initializationhardware\n        |       +-- pci_set_drvdata(pdev, priv)\n        |\n        v\ndevice正常work\n        |\n        v (device removed or rmmod)\nmy_pci_remove(pdev)\n        |\n        +-- free_irq()\n        +-- iounmap(BAR)\n        +-- pci_release_regions()\n        +-- pci_disable_device()\n        |\n        v\npci_unregister_driver(&my_pci_driver)\n        |\n        v\nrmmod complete\n",
        "caption": "PCI driverlifecycle: probe() initializationresource, remove() releaseresource, mustcompletely对称"
      },
      "codeWalk": {
        "title": "complete PCI driver骨架code",
        "language": "c",
        "code": "/* my_pci_driver.c - 最小化 PCI driver骨架 */\n#include <linux/module.h>\n#include <linux/pci.h>\n#include <linux/interrupt.h>\n\n/* 私hasdata structure: eachdevice实例一份 */\nstruct my_device {\n    struct pci_dev *pdev;\n    void __iomem *mmio;    /* BAR2 mappingvirtual address */\n    int irq;               /* allocation IRQ 号 */\n    /* ... otherdevicestate ... */\n};\n\n/* supportdevice ID 表 */\nstatic const struct pci_device_id my_pci_ids[] = {\n    { PCI_DEVICE(0x1002, 0x7480) },  /* AMD RX 7600 XT */\n    { 0, }  /* 终止符 */\n};\nMODULE_DEVICE_TABLE(pci, my_pci_ids);\n\n/* interrupt handlingfunction */\nstatic irqreturn_t my_irq_handler(int irq, void *data)\n{\n    struct my_device *dev = data;\n    /* readinterruptstateregister */\n    uint32_t status = readl(dev->mmio + 0x1000);\n    if (!(status & 0x1))\n        return IRQ_NONE;  /* is notweinterrupt */\n    \n    /* 清除interruptflag */\n    writel(0x1, dev->mmio + 0x1000);\n    return IRQ_HANDLED;\n}\n\n/* probe: device discovery时call */\nstatic int my_pci_probe(struct pci_dev *pdev,\n                         const struct pci_device_id *id)\n{\n    struct my_device *dev;\n    int ret;\n\n    /* allocation私hasdata */\n    dev = devm_kzalloc(&pdev->dev, sizeof(*dev), GFP_KERNEL);\n    /* devm_* seriesfunction: device removed时automaticrelease, recommendeduse */\n    if (!dev)\n        return -ENOMEM;\n    dev->pdev = pdev;\n\n    /* enable PCIe device */\n    ret = pcim_enable_device(pdev);  /* pcim_* = automaticmanagementversion */\n    if (ret)\n        return ret;\n\n    /* request并mapping BAR2(register空between)*/\n    ret = pcim_iomap_regions(pdev, BIT(2), \"my_driver\");\n    if (ret)\n        return ret;\n    dev->mmio = pcim_iomap_table(pdev)[2];\n\n    /* set DMA mask */\n    ret = dma_set_mask_and_coherent(&pdev->dev, DMA_BIT_MASK(44));\n    if (ret)\n        return ret;\n\n    /* enable MSI-X interrupt */\n    ret = pci_alloc_irq_vectors(pdev, 1, 4, PCI_IRQ_MSIX | PCI_IRQ_MSI);\n    if (ret < 0)\n        return ret;\n\n    /* registrationinterrupt handlingfunction */\n    ret = request_irq(pci_irq_vector(pdev, 0), my_irq_handler,\n                      0, \"my_driver\", dev);\n    if (ret)\n        goto err_free_irq_vectors;\n\n    /* save私hasdata, 供 remove() use */\n    pci_set_drvdata(pdev, dev);\n\n    dev_info(&pdev->dev, \"Device initialized successfully\\n\");\n    return 0;\n\nerr_free_irq_vectors:\n    pci_free_irq_vectors(pdev);\n    return ret;\n}\n\n/* remove: device removed时call */\nstatic void my_pci_remove(struct pci_dev *pdev)\n{\n    struct my_device *dev = pci_get_drvdata(pdev);\n\n    free_irq(pci_irq_vector(pdev, 0), dev);\n    pci_free_irq_vectors(pdev);\n    /* devm_* allocationresource由kernelautomaticrelease */\n\n    dev_info(&pdev->dev, \"Device removed\\n\");\n}\n\n/* driverstructure体 */\nstatic struct pci_driver my_pci_driver = {\n    .name     = \"my_driver\",\n    .id_table = my_pci_ids,\n    .probe    = my_pci_probe,\n    .remove   = my_pci_remove,\n};\n\n/* usemacroautomaticgenerate module_init/module_exit */\nmodule_pci_driver(my_pci_driver);\n\nMODULE_LICENSE(\"GPL\");\nMODULE_AUTHOR(\"AMD Driver Student\");\nMODULE_DESCRIPTION(\"Minimal PCI Driver Skeleton\");",
        "explanation": "this骨架demonstrateacomplete PCI driverallkey部分. use `devm_*` and `pcim_*` seriesfunctioncan简化resourcemanagement — device removed时kernelautomaticreleasetheseresource, 减少memoryleak风险. "
      },
      "miniLab": {
        "title": "compilation并loading第a PCI driver",
        "language": "bash",
        "code": "#!/bin/bash\n# Lab 2.2.1: compilationandtesting PCI driver骨架\n\n# step 1: createdriverdirectory\nmkdir -p ~/driver_lab/my_pci_driver\ncd ~/driver_lab/my_pci_driver\n\n# step 2: create Makefile\ncat > Makefile << 'EOF'\nobj-m += my_pci_driver.o\n\nKDIR := /lib/modules/$(shell uname -r)/build\n\nall:\n\tmake -C $(KDIR) M=$(PWD) modules\n\nclean:\n\tmake -C $(KDIR) M=$(PWD) clean\nEOF\n\n# step 3: willthe above C codesaveas my_pci_driver.c\n# (此处省略, 请will Code Walk incodesavetofile)\n\n# step 4: compilationdriver\necho \"=== compilationdriver ===\"\nmake\n# success时output: Building modules, stage 2.\n# generate my_pci_driver.ko\n\n# step 5: viewmoduleinformation\necho \"\"\necho \"=== moduleinformation ===\"\nmodinfo my_pci_driver.ko\n\n# step 6: loadingmodule(note: 这willtry绑定to AMD GPU! )\n# 先unloading amdgpu driver(谨慎! willcausedisplay器黑屏)\n# sudo rmmod amdgpu\n# sudo insmod my_pci_driver.ko\n# sudo dmesg | tail -20\n\n# step 7: securitytestingapproach: use fake device ID\necho \"\"\necho \"=== modulealreadycompilation, device ID 表 ===\"\nmodinfo my_pci_driver.ko | grep alias\n# alias: pci:v00001002d00007480sv*sd*bc*sc*i*",
        "expectedOutput": "=== compilationdriver ===\nmake -C /lib/modules/6.8.0-52-generic/build M=/root/driver_lab/my_pci_driver modules\nmake[1]: Entering directory '/usr/src/linux-headers-6.8.0-52-generic'\n  CC [M]  /root/driver_lab/my_pci_driver/my_pci_driver.o\n  MODPOST /root/driver_lab/my_pci_driver/Module.symvers\n  CC [M]  /root/driver_lab/my_pci_driver/my_pci_driver.mod.o\n  LD [M]  /root/driver_lab/my_pci_driver/my_pci_driver.ko\nmake[1]: Leaving directory\n\n=== moduleinformation ===\nfilename:       /root/driver_lab/my_pci_driver/my_pci_driver.ko\nlicense:        GPL\nauthor:         AMD Driver Student\nalias:          pci:v00001002d00007480sv*sd*bc*sc*i*"
      },
      "debugExercise": {
        "title": "resourceleak: probe failure时not yetreleaseresource",
        "language": "c",
        "question": "below probe() functionin request_irq failure时willleakwhichresource? ",
        "buggyCode": "static int leaky_probe(struct pci_dev *pdev,\n                       const struct pci_device_id *id)\n{\n    void __iomem *mmio;\n    int ret;\n\n    ret = pci_enable_device(pdev);\n    if (ret) return ret;\n\n    ret = pci_request_regions(pdev, \"my_driver\");\n    if (ret) return ret;  /* leak: no pci_disable_device() */\n\n    mmio = ioremap(pci_resource_start(pdev, 2),\n                   pci_resource_len(pdev, 2));\n    if (!mmio) return -ENOMEM;  /* leak: no pci_release_regions() */\n\n    ret = request_irq(pci_irq_vector(pdev, 0), my_handler, 0, \"drv\", pdev);\n    if (ret) return ret;  /* leak: no iounmap() and pci_release_regions() */\n\n    return 0;\n}",
        "hint": "eachsuccessresourceallocationallneedcorrespondingreleaseoperate. use goto labelcan优雅地handleerrorpath. ",
        "solution": "correct做法isuse goto label: `err_iounmap: iounmap(mmio); err_release: pci_release_regions(pdev); err_disable: pci_disable_device(pdev); return ret;`. oruse `devm_*` and `pcim_*` seriesfunction, theyindevice removed时automaticreleaseresource, completelyavoid这类issue. "
      },
      "interviewQuestion": {
        "question": "explain devm_kzalloc() and kzalloc() difference, andindriverdevelopmentinwhyrecommendeduse devm_* seriesfunction? ",
        "difficulty": "medium",
        "hint": "考虑errorpathhandleandcode维护性",
        "answer": "kzalloc() allocationmemorymust手动call kfree() release, incomplexerrorpathin容易遗漏causememoryleak. devm_kzalloc() willallocationmemoryanddevice(struct device)绑定, whendevice removed时(device_release() call时), kernelautomaticreleaseallthrough devm_* allocationresource. 优点: 1) 消除errorpathinresourceleak风险; 2) 简化 remove() function(很多resourcenotneed手动release); 3) code更简洁, 更易维护. similar地, pcim_enable_device(), pcim_iomap_regions() 等 pcim_* functionis alsodevicemanagementversion, recommendedindriverdevelopmentin优先use. "
      },
      "completionChecklist": [
        "can写出acomplete PCI driver骨架",
        "understand probe() and remove() 对称性",
        "know devm_* seriesfunction优势",
        "cancompilation并loadingakernel module",
        "understand pci_set_drvdata()/pci_get_drvdata() 用途"
      ]
    },
    {
      "id": "2-2-2",
      "title": "GPU memory域: VRAM vs GTT",
      "duration": 20,
      "difficulty": "intermediate",
      "concept": {
        "summary": "GPU hasmultiplememory域(Memory Domain), each域hasdifferentaccess速度and用途. understandthesememory域isunderstand GEM/TTM memory managementbasics. amdgpu mainuse三个域: VRAM(GPU localVRAM), GTT(through PCIe accesssystem memory)and CPU(纯 CPU access). ",
        "keyPoints": [
          "VRAM: GPU localVRAM, 速度最快(>500 GB/s), CPU access慢(needthrough PCIe)",
          "GTT(Graphics Translation Table): system RAM through IOMMU mapping给 GPU use",
          "GTT 速度受 PCIe bandwidthlimit(~32 GB/s), 但capacity大(can达system RAM size)",
          "driveraccording toaccesspatternautomaticin VRAM and GTT 之betweenmigration Buffer Object",
          "memory压力时, not常用 VRAM 内容willbyeviction(evict)to GTT orsystem memory"
        ]
      },
      "diagram": {
        "title": "GPU memory域architecture",
        "content": "\n┌─────────────────────────────────────────────────────┐\n│                    GPU (RX 7600 XT)                  │\n│                                                      │\n│  ┌──────────────────────────────────────────────┐   │\n│  │              VRAM (8 GB GDDR6)               │   │\n│  │  bandwidth: ~288 GB/s (GPU localaccess)              │   │\n│  │  CPU access: ~8 GB/s (through PCIe BAR0)          │   │\n│  │                                              │   │\n│  │  用途:                                       │   │\n│  │  • renderinggoal (Render Target)                  │   │\n│  │  • 纹理 (Texture)                            │   │\n│  │  • 顶点/索引buffer                           │   │\n│  │  • GPU commandbuffer                            │   │\n│  └──────────────────────────────────────────────┘   │\n│                                                      │\n│  ┌──────────────────────────────────────────────┐   │\n│  │         GTT (Graphics Translation Table)     │   │\n│  │  = system RAM through IOMMU mapping                  │   │\n│  │  bandwidth: ~32 GB/s (PCIe 4.0 x8)               │   │\n│  │                                              │   │\n│  │  用途:                                       │   │\n│  │  • CPU-GPU sharedbuffer                        │   │\n│  │  • command submissionbuffer (IB)                       │   │\n│  │  • VRAM overflow时备用空between                     │   │\n│  └──────────────────────────────────────────────┘   │\n└─────────────────────────────────────────────────────┘\n         |                    |\n         | PCIe 4.0 x8        | IOMMU\n         v                    v\n┌─────────────────────────────────────────────────────┐\n│              system memory (System RAM, 32 GB)            │\n│  CPU access: ~50 GB/s                                  │\n│  GPU access: ~32 GB/s (through PCIe + IOMMU)              │\n└─────────────────────────────────────────────────────┘\n",
        "caption": "GPU memory域: VRAM 速度最快但capacityhas限, GTT 利用system RAM 扩展 GPU availablememory"
      },
      "codeWalk": {
        "title": "amdgpu memory域defineand BO allocation",
        "language": "c",
        "code": "/* include/uapi/drm/amdgpu_drm.h */\n/* memory域flag */\n#define AMDGPU_GEM_DOMAIN_CPU       0x1  /* CPU candirectlyaccess */\n#define AMDGPU_GEM_DOMAIN_GTT       0x2  /* GPU through IOMMU accesssystem memory */\n#define AMDGPU_GEM_DOMAIN_VRAM      0x4  /* GPU localVRAM */\n#define AMDGPU_GEM_DOMAIN_GDS       0x8  /* Global Data Store(compute用)*/\n#define AMDGPU_GEM_DOMAIN_GWS       0x10 /* Global Wave Sync */\n#define AMDGPU_GEM_DOMAIN_OA        0x20 /* Ordered Append */\n\n/* drivers/gpu/drm/amd/amdgpu/amdgpu_object.c */\nint amdgpu_bo_create(struct amdgpu_device *adev,\n                      struct amdgpu_bo_param *bp,\n                      struct amdgpu_bo **bo_ptr)\n{\n    struct ttm_place *places;\n    struct ttm_placement placement;\n\n    /* according torequestmemory域set TTM 放置strategy */\n    if (bp->domain & AMDGPU_GEM_DOMAIN_VRAM) {\n        /* 首选 VRAM, 备选 GTT */\n        places[0].fpfn = 0;\n        places[0].lpfn = 0;\n        places[0].mem_type = TTM_PL_VRAM;\n        places[0].flags = 0;\n        \n        places[1].fpfn = 0;\n        places[1].lpfn = 0;\n        places[1].mem_type = TTM_PL_TT;  /* GTT = TT in TTM */\n        places[1].flags = TTM_PL_FLAG_FALLBACK;\n        \n        placement.num_placement = 2;\n    } else if (bp->domain & AMDGPU_GEM_DOMAIN_GTT) {\n        /* 仅use GTT */\n        places[0].mem_type = TTM_PL_TT;\n        placement.num_placement = 1;\n    }\n\n    /* through TTM allocation Buffer Object */\n    return ttm_bo_init_reserved(&adev->mman.bdev,\n                                 &bo->tbo,\n                                 bp->size,\n                                 ttm_bo_type_device,\n                                 &placement,\n                                 0, NULL, NULL, NULL,\n                                 &amdgpu_bo_destroy);\n}\n\n/* 查询 BO currentin哪个memory域 */\nuint32_t amdgpu_bo_mem_domain(struct amdgpu_bo *bo)\n{\n    switch (bo->tbo.resource->mem_type) {\n    case TTM_PL_VRAM:\n        return AMDGPU_GEM_DOMAIN_VRAM;\n    case TTM_PL_TT:\n        return AMDGPU_GEM_DOMAIN_GTT;\n    case TTM_PL_SYSTEM:\n        return AMDGPU_GEM_DOMAIN_CPU;\n    default:\n        return 0;\n    }\n}",
        "explanation": "amdgpu through TTM(Translation Table Manager)managementmemory域. create Buffer Object 时can指定首选域(如 VRAM)and备选域(如 GTT), TTM according tomemory压力automaticin域之betweenmigration BO. "
      },
      "miniLab": {
        "title": "observe GPU memory域use情况",
        "language": "bash",
        "code": "#!/bin/bash\n# Lab 2.2.2: observe VRAM and GTT memoryuse情况\n\n# step 1: view VRAM and GTT 总量及use量\necho \"=== GPU memory域use情况 ===\"\nGPU_CARD=$(ls /sys/class/drm/ | grep \"^card[0-9]$\" | head -1)\nCARD_PATH=\"/sys/class/drm/$GPU_CARD/device\"\n\necho \"VRAM 总量: $(( $(cat $CARD_PATH/mem_info_vram_total) / 1024 / 1024 )) MB\"\necho \"VRAM already用: $(( $(cat $CARD_PATH/mem_info_vram_used) / 1024 / 1024 )) MB\"\necho \"GTT  总量: $(( $(cat $CARD_PATH/mem_info_gtt_total) / 1024 / 1024 )) MB\"\necho \"GTT  already用: $(( $(cat $CARD_PATH/mem_info_gtt_used) / 1024 / 1024 )) MB\"\n\n# step 2: through debugfs viewdetailed BO allocation\necho \"\"\necho \"=== Buffer Object allocation详情 ===\"\nif [ -f /sys/kernel/debug/dri/0/amdgpu_gem_info ]; then\n    sudo cat /sys/kernel/debug/dri/0/amdgpu_gem_info | head -30\nfi\n\n# step 3: run GPU 负载, observememory变化\necho \"\"\necho \"=== run glxgears 并observe VRAM 变化 ===\"\n# inafter台run glxgears(need mesa-utils)\nglxgears -fullscreen &\nGEARS_PID=$!\nsleep 2\n\necho \"runin VRAM use:\"\necho \"VRAM already用: $(( $(cat $CARD_PATH/mem_info_vram_used) / 1024 / 1024 )) MB\"\n\nkill $GEARS_PID 2>/dev/null\nsleep 1\necho \"stopafter VRAM use:\"\necho \"VRAM already用: $(( $(cat $CARD_PATH/mem_info_vram_used) / 1024 / 1024 )) MB\"\n\n# step 4: viewmemoryevictionstatistics\necho \"\"\necho \"=== memoryevictionstatistics ===\"\nsudo cat /sys/kernel/debug/dri/0/amdgpu_eviction_stats 2>/dev/null || \\\n    echo \"evictionstatisticsnotavailable(need较新kernel)\"\n\n# step 5: use radeontop real-time监控(needinstall)\necho \"\"\necho \"=== real-time GPU memory监控 ===\"\necho \"install: sudo apt install radeontop\"\necho \"run: radeontop -c -d - -l 1 | grep -E 'vram|gtt'\"\n",
        "expectedOutput": "=== GPU memory域use情况 ===\nVRAM 总量: 8192 MB\nVRAM already用: 487 MB\nGTT  总量: 8192 MB\nGTT  already用: 156 MB\n\n=== Buffer Object allocation详情 ===\npid    1234 command Xorg:\n    0x00000001: 4096 kB VRAM (renderinggoal)\n    0x00000002: 1024 kB VRAM (纹理)\n    0x00000003:  256 kB GTT  (commandbuffer)"
      },
      "debugExercise": {
        "title": "VRAM overflowcauseperformance骤降",
        "language": "bash",
        "question": "userreportinrun大型游戏时 GPU performance突然骤降 50%. howdiagnosewhetheris VRAM overflowcause? ",
        "buggyCode": "# user症状: \n# - 游戏start时流畅(60 FPS)\n# - loading大地图after帧率骤降to 30 FPS\n# - GPU use率display 100%, 但帧率很低\n# - no报错information\n\n# how would youdiagnose? ",
        "hint": "when VRAM not足时, driverwillwill部分 BO evictionto GTT(system memory), GPU accessthesedataneedthrough PCIe, 速度from 500 GB/s 降to 32 GB/s. ",
        "solution": "diagnosestep: 1) `cat /sys/class/drm/card0/device/mem_info_vram_used` view VRAM use量whether接近 8192 MB; 2) `sudo cat /sys/kernel/debug/dri/0/amdgpu_eviction_stats` vieweviction次数; 3) use `radeontop` observe VRAM and GTT use量变化. if VRAM 满且 GTT use量激增, indicate发生大量eviction. resolveplan: 降低游戏纹理质量set, or升级to更大 VRAM  GPU. "
      },
      "interviewQuestion": {
        "question": "explain VRAM and GTT difference, and amdgpu driverhow决定willa Buffer Object 放in VRAM stillis GTT? ",
        "difficulty": "medium",
        "hint": "frombandwidth, latency, CPU access需求andmemory压力四个角度analyze",
        "answer": "VRAM is GPU localVRAM(GDDR6), bandwidth高(~288 GB/s)但 CPU access慢(needthrough PCIe BAR). GTT isthrough IOMMU mappingsystem RAM, GPU access速度受 PCIe limit(~32 GB/s), 但 CPU can快速access. amdgpu 放置strategy: 1) renderinggoal, 纹理等 GPU 密集access BO 首选 VRAM; 2) CPU-GPU sharedcommandbuffer(IB)首选 GTT; 3) memory压力时, 最近最少use(LRU) VRAM BO byevictionto GTT; 4) usercanthrough GEM create时 domain flag指定偏好. "
      },
      "completionChecklist": [
        "understand VRAM and GTT bandwidthandlatency差异",
        "know哪类data适合放in VRAM, 哪类适合 GTT",
        "understandmemoryeviction(eviction)triggercondition",
        "canthrough sysfs view VRAM and GTT use量",
        "understand TTM howmanagementmultiplememory域"
      ]
    },
    {
      "id": "2-2-3",
      "title": "GPU command ring(Command Ring)",
      "duration": 25,
      "difficulty": "intermediate",
      "concept": {
        "summary": "Command Ring(command ring)is CPU 向 GPU commitworkcoremechanism. CPU will GPU commandwritearing buffer(Ring Buffer), thenupdate Write Pointer(写pointer)notify GPU. GPU from Read Pointer(读pointer)startexecutecommand, execute完afterupdate读pointer. this生产者-消费者模型isall GPU drivercore. ",
        "keyPoints": [
          "Ring Buffer isa固定size循环queue, storage GPU command(Packet)",
          "CPU is生产者: writecommand并update Write Pointer(WPtr)",
          "GPU is消费者: from Read Pointer(RPtr)read并executecommand",
          "Doorbell isa特殊 MMIO register, CPU write WPtr notify GPU",
          "amdgpu hasmultiple Ring: GFX Ring(graphics), SDMA Ring(datatransfer), Compute Ring(compute)"
        ]
      },
      "diagram": {
        "title": "GPU Command Ring workprinciple",
        "content": "\nRing Buffer (in GTT memoryin)\n┌─────────────────────────────────────────────────────────┐\n│  [0]  [1]  [2]  [3]  [4]  [5]  [6]  [7]  [8]  [9] ...  │\n│   ↑                   ↑                                  │\n│  RPtr               WPtr                                 │\n│  (GPU 读to这inside)      (CPU 写to这inside)                      │\n└─────────────────────────────────────────────────────────┘\n\nworkprocess:\n1. CPU writecommandto ring[WPtr]\n   ring[4] = PM4_DRAW_INDEX_2  ← 绘制command\n   ring[5] = vertex_count\n   ring[6] = index_addr_lo\n   ring[7] = index_addr_hi\n   WPtr = 8\n\n2. CPU write WPtr to Doorbell register\n   writel(8, doorbell_base + ring->doorbell_index * 4)\n   ↓ notify GPU has新command\n\n3. GPU read ring[4..7], execute绘制command\n   RPtr = 8\n\n4. GPU completeaftertriggerinterrupt\n   CPU 收tointerrupt, wakeupwaitprocess\n\nringstructure: when WPtr to达末尾时, 回绕to 0\nWPtr = (WPtr + cmd_size) & ring->buf_mask\n",
        "caption": "Command Ring: CPU 写commandupdate WPtr, GPU 读commandupdate RPtr, Doorbell notify GPU has新work"
      },
      "codeWalk": {
        "title": "amdgpu Ring coreoperate",
        "language": "c",
        "code": "/* drivers/gpu/drm/amd/amdgpu/amdgpu_ring.c */\n\n/* Ring data structure */\nstruct amdgpu_ring {\n    struct amdgpu_device *adev;\n    uint32_t *ring;         /* Ring Buffer  CPU virtual address */\n    uint64_t gpu_addr;      /* Ring Buffer  GPU DMA address */\n    unsigned ring_size;     /* Ring size(bytes)*/\n    unsigned buf_mask;      /* used for环绕: wptr & buf_mask */\n    uint32_t wptr;          /* Write Pointer(CPU 维护)*/\n    uint32_t rptr;          /* Read Pointer(GPU update)*/\n    unsigned doorbell_index; /* Doorbell register索引 */\n    /* ... */\n};\n\n/* 向 Ring writea DWORD(4bytes)command */\nvoid amdgpu_ring_write(struct amdgpu_ring *ring, uint32_t v)\n{\n    /* check Ring whetherhas空between */\n    if (ring->count_dw <= 0)\n        DRM_ERROR(\"amdgpu: writing more dwords to the ring than expected!\\n\");\n    \n    ring->ring[ring->wptr++ & ring->buf_mask] = v;\n    ring->wptr &= ring->buf_mask;\n    ring->count_dw--;\n}\n\n/* commitcommand: update WPtr 并notify GPU */\nvoid amdgpu_ring_commit(struct amdgpu_ring *ring)\n{\n    uint32_t count;\n    \n    /* 填充 NOP commandalignment */\n    count = ring->align_mask + 1 - (ring->wptr & ring->align_mask);\n    ring->funcs->insert_nop(ring, count);\n    \n    mb();  /* memory屏障: ensureallcommandwritecompleteafteragainupdate WPtr */\n    \n    /* through Doorbell notify GPU 新 WPtr */\n    amdgpu_ring_set_wptr(ring);\n}\n\n/* through Doorbell write WPtr */\nstatic void gfx_v11_ring_set_wptr_gfx(struct amdgpu_ring *ring)\n{\n    struct amdgpu_device *adev = ring->adev;\n    \n    if (ring->use_doorbell) {\n        /* write Doorbell register(BAR4 in特殊address)*/\n        *ring->wptr_cpu_addr = ring->wptr;\n        WDOORBELL64(ring->doorbell_index, ring->wptr);\n        /* WDOORBELL64 = write BAR4 in Doorbell address */\n    } else {\n        /* directlywrite MMIO register */\n        WREG32(mmCP_RB_WPTR, lower_32_bits(ring->wptr));\n    }\n}\n\n/* useexample: commita绘制command */\nvoid submit_draw_command(struct amdgpu_ring *ring,\n                          uint32_t vertex_count,\n                          uint64_t index_addr)\n{\n    /* reserve空between */\n    amdgpu_ring_alloc(ring, 8);\n    \n    /* write PM4 绘制command packet */\n    amdgpu_ring_write(ring, PACKET3(PACKET3_DRAW_INDEX_2, 4));\n    amdgpu_ring_write(ring, 0xFFFFFFFF);        /* max_size */\n    amdgpu_ring_write(ring, lower_32_bits(index_addr));\n    amdgpu_ring_write(ring, upper_32_bits(index_addr));\n    amdgpu_ring_write(ring, vertex_count);\n    amdgpu_ring_write(ring, 0);                 /* draw_initiator */\n    \n    /* commit: update WPtr, notify GPU */\n    amdgpu_ring_commit(ring);\n}",
        "explanation": "Command Ring coreis `amdgpu_ring_write()` and `amdgpu_ring_commit()`. writecommandaftermustcall commit() update WPtr, otherwise GPU notknowhas新command. memory屏障(mb())ensurecommandwriteordercorrect. "
      },
      "miniLab": {
        "title": "observe GPU Ring state",
        "language": "bash",
        "code": "#!/bin/bash\n# Lab 2.2.3: observe GPU Command Ring state\n\n# step 1: viewall Ring state\necho \"=== GPU Ring state ===\"\nif [ -d /sys/kernel/debug/dri/0 ]; then\n    sudo cat /sys/kernel/debug/dri/0/amdgpu_ring_gfx 2>/dev/null | head -20\n    echo \"---\"\n    sudo cat /sys/kernel/debug/dri/0/amdgpu_ring_sdma0 2>/dev/null | head -10\nfi\n\n# step 2: view Ring  WPtr and RPtr\necho \"\"\necho \"=== Ring pointerstate ===\"\nfor ring_file in /sys/kernel/debug/dri/0/amdgpu_ring_*; do\n    if [ -f \"$ring_file\" ]; then\n        ring_name=$(basename $ring_file)\n        echo \"Ring: $ring_name\"\n        sudo cat \"$ring_file\" 2>/dev/null | grep -E \"wptr|rptr|ready|status\" | head -5\n        echo \"---\"\n    fi\ndone\n\n# step 3: view GPU schedulerstate\necho \"\"\necho \"=== GPU schedulerstate ===\"\nsudo cat /sys/kernel/debug/dri/0/amdgpu_sched 2>/dev/null | head -30\n\n# step 4: commitasimple GPU compute任务并observe Ring 变化\necho \"\"\necho \"=== commit GPU 任务(use clinfo or rocm-smi)===\"\nif command -v rocm-smi &> /dev/null; then\n    rocm-smi --showuse\nelse\n    echo \"install rocm-smi: sudo apt install rocm-smi-lib\"\n    echo \"oruse glxgears trigger GFX Ring 活动\"\nfi",
        "expectedOutput": "=== GPU Ring state ===\nGFX ring 0 : rptr=0x00001234, wptr=0x00001234\n  ready=1\n  last_ptr=0x00001234\n  last_seq=12345\n  last_jiffies=4294967295\n\n=== GPU schedulerstate ===\nring=gfx_0.0.0, jobs: 0 in queue, 0 in flight\nring=sdma0, jobs: 0 in queue, 0 in flight"
      },
      "debugExercise": {
        "title": "GPU Hang: Ring stopresponse",
        "language": "bash",
        "question": "userreport GPU hang(GPU Hang), dmesg display 'amdgpu: GPU reset begin'. howthrough Ring statediagnoseissue? ",
        "buggyCode": "# dmesg output:\n# [1234.567890] amdgpu 0000:01:00.0: amdgpu: GPU reset begin!\n# [1234.567891] amdgpu 0000:01:00.0: amdgpu: GPU HANG: 0x00000001\n# [1234.567892] amdgpu 0000:01:00.0: amdgpu: GRBM_STATUS=0x21003428\n# [1234.567893] amdgpu 0000:01:00.0: amdgpu: GRBM_STATUS2=0x00000000\n# [1234.567894] amdgpu 0000:01:00.0: amdgpu: CP_RB_RPTR=0x00001234\n# [1234.567895] amdgpu 0000:01:00.0: amdgpu: CP_RB_WPTR=0x00001240\n# [1234.567896] amdgpu 0000:01:00.0: amdgpu: CP_RB_RPTR nobefore进! ",
        "hint": "when RPtr stopbefore进但 WPtr continue增加时, indicate GPU 卡in某个commandonunable tocontinueexecute. view GRBM_STATUS 各个位can确定is哪个enginehang. ",
        "solution": "diagnosestep: 1) CP_RB_RPTR nobefore进indicate Command Processor 卡住; 2) GRBM_STATUS=0x21003428 in bit 28 (GUI_ACTIVE) as 1 indicate GPU 仍intryexecute; 3) view CP_RB_RPTR 指向command内容, findcausehangspecificcommand; 4) commoncause: invalidmemoryaddress, deadlock semaphore, firmware bug. resolve: amdgpu willautomatictrigger GPU reset, resetafterrecover正常. "
      },
      "interviewQuestion": {
        "question": "explain GPU Command Ring in Write Pointer and Read Pointer 作用, andwhyinupdate WPtr beforeneedmemory屏障(memory barrier)? ",
        "difficulty": "hard",
        "hint": "考虑 CPU out of orderexecuteand PCIe 写transferorder保证",
        "answer": "WPtr(Write Pointer)由 CPU 维护, 指向belowacanwritecommandlocation. RPtr(Read Pointer)由 GPU 维护, 指向belowa待executecommandlocation. CPU writecommandaftermust先executememory屏障(mb()), againupdate WPtr(through Doorbell). cause: 1) CPU out of orderexecute: 现代 CPU may重排写operate, if WPtr 先于commanddatato达 GPU, GPU will读tonot yetinitializationcommand; 2) PCIe 写transfer: PCIe not保证写operateorder, memory屏障ensureallcommandwritein Doorbell writebeforecomplete; 3) compileroptimization: mb() meanwhile作ascompiler屏障, preventcompiler重排these写operate. "
      },
      "completionChecklist": [
        "understand Ring Buffer ringstructureand WPtr/RPtr mechanism",
        "know Doorbell 作用andwhyuse BAR4",
        "understandwhyupdate WPtr beforeneedmemory屏障",
        "know amdgpu has哪几种 Ring 及其用途",
        "canthrough debugfs view Ring currentstate"
      ]
    },
    {
      "id": "2-2-4",
      "title": "GPU Firmware loading",
      "duration": 20,
      "difficulty": "intermediate",
      "concept": {
        "summary": "现代 GPU containmultiple微controller(如 CP, SDMA, SMU, PSP 等), eachallneedloadingspecific Firmware(firmware/微码)only thencanwork. Linux kernelthrough request_firmware() fromfilesystemloadingthesefirmwarefile, thenwill其transferto GPU specificmemoryregion. firmware loadingfailureis GPU initializationfailurecommoncause. ",
        "keyPoints": [
          "GPU firmwarefile存放in /lib/firmware/amdgpu/ directorybelow",
          "file命名规则: {chip}_{component}.bin, 如 navi33_pfp.bin(RX 7600 XT  PFP firmware)",
          "PSP(Platform Security Processor)is最先loadingfirmware, responsible forsecuritystartup",
          "CP(Command Processor)firmwarecontain PFP(Pre-Fetch Parser)and ME(Micro Engine)",
          "firmwareversionmustanddriverversionmatch, versionnotmatchwillcause GPU initializationfailure"
        ]
      },
      "diagram": {
        "title": "GPU firmware loadingorder",
        "content": "\nGPU initializationstart\n        |\n        v\n1. PSP firmware loading(最高priority)\n   /lib/firmware/amdgpu/navi33_psp.bin\n   /lib/firmware/amdgpu/navi33_psp_14.0.0.bin\n        |\n        v\n2. SMU firmware loading(power management)\n   /lib/firmware/amdgpu/navi33_smu.bin\n        |\n        v\n3. GFX firmware loading(graphicsengine)\n   navi33_pfp.bin  ← Pre-Fetch Parser\n   navi33_me.bin   ← Micro Engine\n   navi33_ce.bin   ← Constant Engine\n   navi33_rlc.bin  ← Run List Controller\n        |\n        v\n4. SDMA firmware loading(datatransferengine)\n   navi33_sdma.bin\n        |\n        v\n5. VCN firmware loading(视频编解码)\n   navi33_vcn.bin\n        |\n        v\n6. DCN firmware loading(display control器)\n   (内置于 amdgpu driver, notneedoutside部file)\n        |\n        v\nallfirmware loadingcomplete, GPU ready\n",
        "caption": "GPU firmware按严格orderloading, PSP 最先(securitystartup), othercomponent依次initialization"
      },
      "codeWalk": {
        "title": "amdgpu firmware loadingprocess",
        "language": "c",
        "code": "/* drivers/gpu/drm/amd/amdgpu/gfx_v11_0.c */\n\n/* GFX firmware loadingfunction */\nstatic int gfx_v11_0_init_microcode(struct amdgpu_device *adev)\n{\n    char fw_name[40];\n    int err;\n    \n    /* 构造firmwarefile名 */\n    /* chip_name = \"navi33\" (RX 7600 XT) */\n    snprintf(fw_name, sizeof(fw_name), \"amdgpu/%s_pfp.bin\",\n             adev->asic_name);\n    /* fw_name = \"amdgpu/navi33_pfp.bin\" */\n    \n    /* fromfilesystemrequestfirmware */\n    err = request_firmware(&adev->gfx.pfp_fw,\n                           fw_name,\n                           adev->dev);\n    if (err) {\n        dev_err(adev->dev,\n                \"Failed to load firmware \\\"%s\\\"\\n\", fw_name);\n        /* commonerror: firmwarefilenotexist\n         * resolve: sudo apt install firmware-amd-graphics\n         * orfrom https://git.kernel.org/firmware below载 */\n        return err;\n    }\n    \n    /* verifyfirmwareversion */\n    const struct gfx_firmware_header_v1_0 *pfp_hdr =\n        (const void *)adev->gfx.pfp_fw->data;\n    \n    adev->gfx.pfp_fw_version = le32_to_cpu(pfp_hdr->header.ucode_version);\n    adev->gfx.pfp_feature_version = le32_to_cpu(pfp_hdr->ucode_feature_version);\n    \n    dev_info(adev->dev, \"PFP firmware version: %d.%d\\n\",\n             adev->gfx.pfp_fw_version >> 16,\n             adev->gfx.pfp_fw_version & 0xFFFF);\n    \n    /* 同样loading ME, CE, RLC firmware... */\n    return 0;\n}\n\n/* willfirmwareon传to GPU */\nstatic int gfx_v11_0_cp_gfx_load_pfp_microcode(struct amdgpu_device *adev)\n{\n    const struct gfx_firmware_header_v1_0 *pfp_hdr;\n    const __le32 *fw_data;\n    unsigned fw_size;\n    int i;\n    \n    pfp_hdr = (const void *)adev->gfx.pfp_fw->data;\n    fw_data = (const __le32 *)(adev->gfx.pfp_fw->data +\n               le32_to_cpu(pfp_hdr->header.ucode_array_offset_bytes));\n    fw_size = le32_to_cpu(pfp_hdr->header.ucode_size_bytes) / 4;\n    \n    /* through MMIO willfirmwarewrite GPU internal SRAM */\n    WREG32_SOC15(GC, 0, regCP_PFP_UCODE_ADDR, 0);\n    for (i = 0; i < fw_size; i++)\n        WREG32_SOC15(GC, 0, regCP_PFP_UCODE_DATA,\n                     le32_to_cpup(fw_data++));\n    WREG32_SOC15(GC, 0, regCP_PFP_UCODE_ADDR, adev->gfx.pfp_fw_version);\n    \n    return 0;\n}",
        "explanation": "firmware loading分两步: 1) `request_firmware()` from `/lib/firmware/amdgpu/` readfirmwarefiletomemory; 2) through MMIO registerwillfirmwaredatawrite GPU internal SRAM. firmwareversionverifyensuredriverandfirmware兼容性. "
      },
      "miniLab": {
        "title": "viewandmanagement GPU firmware",
        "language": "bash",
        "code": "#!/bin/bash\n# Lab 2.2.4: view AMD GPU firmwarefileandversion\n\n# step 1: viewalreadyinstall AMD GPU firmwarefile\necho \"=== AMD GPU firmwarefile ===\"\nls /lib/firmware/amdgpu/ | grep \"navi33\\|navi31\\|navi32\" | head -20\n# navi33 = RX 7600/7600 XT\n# navi31 = RX 7900 XTX/XT\n# navi32 = RX 7700/7800 XT\n\n# step 2: viewfirmwareversion(from dmesg)\necho \"\"\necho \"=== firmware loadinglog ===\"\nsudo dmesg | grep -E \"amdgpu.*firmware|amdgpu.*ucode|amdgpu.*fw\" | head -20\n\n# step 3: viewcurrentloadingfirmwareversion\necho \"\"\necho \"=== currentfirmwareversion ===\"\nGPU_CARD=$(ls /sys/class/drm/ | grep \"^card[0-9]$\" | head -1)\nif [ -f /sys/class/drm/$GPU_CARD/device/fw_version ]; then\n    cat /sys/class/drm/$GPU_CARD/device/fw_version\nfi\n\n# through sysfs view各componentfirmwareversion\nfor fw_file in /sys/class/drm/$GPU_CARD/device/fw_*; do\n    if [ -f \"$fw_file\" ]; then\n        echo \"$(basename $fw_file): $(cat $fw_file)\"\n    fi\ndone\n\n# step 4: checkfirmwarefilecomplete性\necho \"\"\necho \"=== firmwarefilesize ===\"\nls -lh /lib/firmware/amdgpu/navi33_*.bin 2>/dev/null | head -10\n\n# step 5: simulatefirmware缺失(解errorhandle)\necho \"\"\necho \"=== iffirmware缺失, dmesg willdisplay ===\"\necho \"amdgpu: Failed to load firmware 'amdgpu/navi33_pfp.bin'\"\necho \"resolvemethod: sudo apt install firmware-amd-graphics\"\necho \"or: sudo apt install linux-firmware\"\n",
        "expectedOutput": "=== AMD GPU firmwarefile ===\nnavi33_ce.bin\nnavi33_me.bin\nnavi33_mec.bin\nnavi33_pfp.bin\nnavi33_psp.bin\nnavi33_psp_14.0.0.bin\nnavi33_rlc.bin\nnavi33_sdma.bin\nnavi33_smu.bin\nnavi33_vcn.bin\n\n=== firmware loadinglog ===\n[    5.123456] amdgpu 0000:01:00.0: amdgpu: PSP firmware version: 14.0.0\n[    5.234567] amdgpu 0000:01:00.0: amdgpu: PFP firmware version: 3.0.0\n[    5.345678] amdgpu 0000:01:00.0: amdgpu: ME  firmware version: 3.0.0"
      },
      "debugExercise": {
        "title": "firmwareversionnotmatchcause GPU initializationfailure",
        "language": "bash",
        "question": "user升级kernelafter GPU unable toinitialization, dmesg display 'firmware version mismatch'. howdiagnoseandresolve? ",
        "buggyCode": "# dmesg errorinformation:\n# [    5.123] amdgpu 0000:01:00.0: amdgpu: Failed to load firmware \"amdgpu/navi33_pfp.bin\"\n# [    5.124] amdgpu 0000:01:00.0: amdgpu: Fatal error during GPU init\n# \n# or:\n# [    5.125] amdgpu 0000:01:00.0: amdgpu: navi33_pfp.bin: firmware version 2.0 \n#             but driver requires 3.0\n# [    5.126] amdgpu 0000:01:00.0: amdgpu: GPU init failed\n\n# howdiagnose? ",
        "hint": "新kernelversionmayneedupdatefirmwarefile. check /lib/firmware/amdgpu/ infirmwareversionwhetherand新kernelto求versionmatch. ",
        "solution": "diagnosestep: 1) `sudo dmesg | grep 'firmware'` viewspecificversionto求; 2) `ls -la /lib/firmware/amdgpu/navi33_pfp.bin` checkfirmwarefilewhetherexist; 3) `sudo apt update && sudo apt install --reinstall linux-firmware` updatefirmware包; 4) if包managerfirmware太旧, from https://git.kernel.org/pub/scm/linux/kernel/git/firmware/linux-firmware.git 手动below载latestfirmware; 5) updateafterrestart: `sudo reboot`. "
      },
      "interviewQuestion": {
        "question": "why GPU needfirmware(Firmware)? firmwareanddriver职责how划分? ",
        "difficulty": "medium",
        "hint": "考虑real-time性, security性andhardwarecomplex性",
        "answer": "GPU firmware(runin GPU internal微controlleron)anddriver(runin CPU on)职责划分: firmwareresponsible for: 1) real-timecontrol: GPU internalscheduling, 电源state切换等need微秒级response, CPU unable to及时handle; 2) hardwareabstraction: 隐藏different GPU versionhardware差异, driverthrough统一interfaceandfirmware通信; 3) securitystartup: PSP firmwareverifyotherfirmware签名, prevent恶意coderunin GPU on; 4) 功耗management: SMU firmwarereal-time调整电压andfrequency. driverresponsible for: 1) operatesysteminterface: implementation DRM/KMS API; 2) memory management: allocationandmanagement VRAM/GTT; 3) command submission: willuser-spacecommand打包committo Ring. "
      },
      "completionChecklist": [
        "know AMD GPU firmwarefile存放locationand命名规则",
        "understand PSP, CP, SMU 等firmware作用",
        "know request_firmware() workprinciple",
        "candiagnosefirmware缺失orversionnotmatchissue",
        "understandfirmwareanddriver职责划分"
      ]
    },
    {
      "id": "2-2-5",
      "title": "GPU device reset(Device Reset)",
      "duration": 20,
      "difficulty": "advanced",
      "concept": {
        "summary": "GPU Hang(GPU hang)isdriverdevelopmentin最common严重issue之一. when GPU unable tointimeout时between内completecommand时, drivermustexecute GPU Reset(device reset)recover正常work. amdgpu implementation多级resetstrategy, from软resettocomplete FLR(Function Level Reset), 尽量innotimpactotherapplication情况belowrecover GPU. ",
        "keyPoints": [
          "GPU Hang detect: driver定期check Ring  RPtr whetherbefore进, timeout则triggerreset",
          "软reset(Soft Reset): reset GPU engine但not断电, 速度快, 对userimpact小",
          "硬reset(Hard Reset): complete GPU reset, includere-loadingfirmware, 耗时较长",
          "FLR(Function Level Reset): through PCIe protocolresetentire GPU function",
          "resetafterneedre-initializationall GPU state: Ring, firmware, memory mapping等"
        ]
      },
      "diagram": {
        "title": "GPU Hang detectandresetprocess",
        "content": "\n正常work\n    |\n    v\namdgpu_job_timedout() bycall\n(GPU commandtimeout, default 10 秒)\n    |\n    v\ncheckwhether真 Hang\n    |\n    +-- Ring RPtr nobefore进?  → is → GPU Hang confirm\n    |\n    v\nselectresetlevel\n    |\n    +-- try 1: 软reset(Soft Reset)\n    |   reset单个engine(GFX/SDMA/VCN)\n    |   时between: ~100ms\n    |   |\n    |   +-- success?  → recover正常work\n    |   |\n    |   +-- failure?  → 升级to硬reset\n    |\n    +-- try 2: 硬reset(Hard Reset)\n    |   resetentire GPU, re-loadingfirmware\n    |   时between: ~1-2 秒\n    |   |\n    |   +-- success?  → recover正常work\n    |   |\n    |   +-- failure?  → 升级to FLR\n    |\n    +-- try 3: FLR(PCIe Function Level Reset)\n        through PCIe protocolcompletereset\n        时between: ~5 秒\n        |\n        +-- success?  → recover正常work\n        +-- failure?  → report致命error, needrestartsystem\n",
        "caption": "GPU reset采用多级strategy: 优先tryimpact最小软reset, 逐步升级to更彻底resetapproach"
      },
      "codeWalk": {
        "title": "amdgpu GPU Hang detectandreset",
        "language": "c",
        "code": "/* drivers/gpu/drm/amd/amdgpu/amdgpu_job.c */\n\n/* commandtimeoutcallback function(由 DRM schedulercall)*/\nstatic enum drm_gpu_sched_stat amdgpu_job_timedout(struct drm_sched_job *s_job)\n{\n    struct amdgpu_job *job = to_amdgpu_job(s_job);\n    struct amdgpu_ring *ring = to_amdgpu_ring(s_job->sched);\n    struct amdgpu_device *adev = ring->adev;\n    \n    dev_err(adev->dev, \"GPU timeout on ring %s\\n\", ring->name);\n    \n    /* 打印 GPU stateregister, used fordebugging */\n    amdgpu_device_gpu_recover(adev, job, &reset_context);\n    \n    return DRM_GPU_SCHED_STAT_TIMEOUT;\n}\n\n/* drivers/gpu/drm/amd/amdgpu/amdgpu_device.c */\n\nint amdgpu_device_gpu_recover(struct amdgpu_device *adev,\n                               struct amdgpu_job *job,\n                               struct amdgpu_reset_context *reset_context)\n{\n    int r;\n    \n    dev_info(adev->dev, \"GPU reset begin!\\n\");\n    \n    /* step 1: stopall Ring commit */\n    amdgpu_device_stop_pending_resets(adev);\n    \n    /* step 2: wait正inexecutecommandcomplete(ortimeout)*/\n    amdgpu_fence_driver_force_completion(ring);\n    \n    /* step 3: executeactual GPU reset */\n    r = amdgpu_device_pre_asic_reset(adev, reset_context);\n    if (r)\n        goto end;\n    \n    /* step 4: call芯片specificresetfunction */\n    r = amdgpu_asic_reset(adev);\n    /* for RDNA3, 这willcall gfx_v11_0_soft_reset() or\n     * amdgpu_device_pci_reset() */\n    \n    /* step 5: re-initialization GPU */\n    if (!r) {\n        r = amdgpu_device_post_asic_reset(adev, reset_context);\n        /* re-loadingfirmware, 重建 Ring, recovermemory mapping */\n    }\n    \nend:\n    if (r)\n        dev_err(adev->dev, \"GPU reset failed: %d\\n\", r);\n    else\n        dev_info(adev->dev, \"GPU reset succeeded!\\n\");\n    \n    return r;\n}\n\n/* 软reset: 只reset GFX engine */\nstatic int gfx_v11_0_soft_reset(void *handle)\n{\n    struct amdgpu_device *adev = (struct amdgpu_device *)handle;\n    u32 grbm_soft_reset = 0;\n    \n    /* checkwhichengineneedreset */\n    u32 tmp = RREG32_SOC15(GC, 0, regGRBM_STATUS);\n    if (tmp & GRBM_STATUS__CP_BUSY_MASK)\n        grbm_soft_reset |= GRBM_SOFT_RESET__SOFT_RESET_CP_MASK;\n    \n    if (grbm_soft_reset) {\n        /* execute软reset */\n        WREG32_SOC15(GC, 0, regGRBM_SOFT_RESET, grbm_soft_reset);\n        tmp = RREG32_SOC15(GC, 0, regGRBM_SOFT_RESET);\n        udelay(50);  /* waitresetcomplete */\n        \n        /* 清除reset位 */\n        WREG32_SOC15(GC, 0, regGRBM_SOFT_RESET, 0);\n    }\n    return 0;\n}",
        "explanation": "GPU resetisacomplex多stepprocess: stopcommit → waitcomplete → resethardware → re-initialization. 软reset只resetspecificengine, 速度快; 硬resetresetentire GPU, needre-loadingfirmware. "
      },
      "miniLab": {
        "title": "simulateandobserve GPU Hang recover",
        "language": "bash",
        "code": "#!/bin/bash\n# Lab 2.2.5: observe GPU Hang andresetprocess\n\n# step 1: view历史 GPU resetrecord\necho \"=== GPU reset历史 ===\"\nsudo dmesg | grep -E \"GPU reset|GPU hang|GPU timeout\" | head -20\n\n# step 2: viewcurrent GPU errorstate\necho \"\"\necho \"=== GPU errorstate ===\"\nGPU_CARD=$(ls /sys/class/drm/ | grep \"^card[0-9]$\" | head -1)\ncat /sys/class/drm/$GPU_CARD/device/gpu_reset_count 2>/dev/null || \\\n    echo \"resetcountnotavailable\"\n\n# step 3: view GPU 健康state\necho \"\"\necho \"=== GPU 健康state ===\"\nif command -v rocm-smi &> /dev/null; then\n    rocm-smi --showrasinfo all 2>/dev/null | head -20\nfi\n\n# step 4: view amdgpu error注入interface(used fortesting)\necho \"\"\necho \"=== error注入interface ===\"\nls /sys/kernel/debug/dri/0/amdgpu_ras* 2>/dev/null | head -10\n# amdgpu_ras_ctrl: control RAS(Reliability, Availability, Serviceability)\n# amdgpu_ras_eeprom: recordnotcan纠正error EEPROM\n\n# step 5: view GPU resettimeoutset\necho \"\"\necho \"=== GPU timeoutset ===\"\ncat /sys/module/amdgpu/parameters/gpu_recovery 2>/dev/null\ncat /sys/module/amdgpu/parameters/lockup_timeout 2>/dev/null || \\\n    echo \"defaulttimeout: 10000ms (10秒)\"\n\n# step 6: 手动trigger GPU reset(谨慎! )\necho \"\"\necho \"=== 手动trigger GPU reset(仅used fortesting)===\"\necho \"method: echo 1 > /sys/kernel/debug/dri/0/amdgpu_reset_debug\"\necho \"note: 这willcausecurrent GPU 任务failure, 但will notimpactsystem稳定性\"\n",
        "expectedOutput": "=== GPU reset历史 ===\n[12345.678] amdgpu 0000:01:00.0: amdgpu: GPU reset begin!\n[12345.679] amdgpu 0000:01:00.0: amdgpu: GPU HANG: 0x00000001\n[12347.123] amdgpu 0000:01:00.0: amdgpu: GPU reset succeeded!\n[12347.124] amdgpu 0000:01:00.0: amdgpu: GPU reset end!\n\n=== GPU timeoutset ===\n10000  ← default 10 秒timeout"
      },
      "debugExercise": {
        "title": "GPU resetafterapplicationprogramcrash",
        "language": "c",
        "question": "GPU resetsuccessafter, before正inrun OpenGL applicationprogramcrash, report 'context lost'. 这is预期行as吗? drivershouldhowhandle? ",
        "buggyCode": "/* applicationprogramreporterror */\n// OpenGL error: GL_CONTEXT_LOST (0x0507)\n// Vulkan error: VK_ERROR_DEVICE_LOST\n// \n// user看to: 游戏突然退出, noerror提示\n// \n// issue: GPU resetafter, all GPU context(Context)allinvalidate\n// drivershouldhownotifyapplicationprogram? ",
        "hint": "GPU resetwill使all GPU contextinvalidate. 现代 API(Vulkan, OpenGL)provide 'context lost' mechanismletapplicationprogramdetect并handle这种情况. ",
        "solution": "这is预期行as. GPU resetafter: 1) driver向allwait fence senderror信号(-ENODEV or -ECANCELED); 2) DRM schedulernotifyall受impact job failure; 3) user-spacedriver(Mesa)收toerrorafterset GL_CONTEXT_LOST flag; 4) applicationprogramshouldcheck glGetGraphicsResetStatus() 并re-create OpenGL context. 好游戏engine(如 Unreal Engine)willautomatichandle device lost, 透明地re-initialization GPU resource. "
      },
      "interviewQuestion": {
        "question": "describe amdgpu  GPU Hang detectmechanism, andwhyneed多级resetstrategy(软reset → 硬reset → FLR)? ",
        "difficulty": "hard",
        "hint": "fromdetectmethod, reset代价anduser体验三个角度analyze",
        "answer": "Hang detect: amdgpu use DRM GPU scheduler timeoutmechanism, each job hastimeout时between(default 10 秒). timeoutaftercall amdgpu_job_timedout(), check Ring  RPtr whetherbefore进 — if GPU 真inwork, RPtr shouldinbefore进. 多级resetstrategycause: 1) 最小化impact: 软reset只resethangengine(如 GFX), otherengine(SDMA, VCN)continuework, 对userimpact最小; 2) 速度: 软reset ~100ms, 硬reset ~1-2s, FLR ~5s, 优先use快速plan; 3) success率: 软resetmayunable torecover严重 hang, need更彻底reset; 4) 兼容性: is notall GPU allsupport FLR, need逐级try. "
      },
      "completionChecklist": [
        "understand GPU Hang detectmechanism(Ring RPtr notbefore进)",
        "know软reset, 硬resetand FLR difference",
        "understand GPU resetafterapplicationprogramwhywill收to context lost",
        "canin dmesg in识别 GPU Hang andresetlog",
        "knowhowthrough sysfs view GPU reset历史"
      ]
    }
  ]
};
