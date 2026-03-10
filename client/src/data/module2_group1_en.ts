import type { MicroLessonGroup } from "./micro_lesson_types";

export const module2Group1En: MicroLessonGroup = {
  "id": "hardware-pcie",
  "title": "PCIe protocolbasics",
  "description": "understand PCIe bus protocol, device枚举andmemory mappingmechanism",
  "lessons": [
    {
      "id": "2-1-1",
      "title": "whatis PCI device",
      "duration": 15,
      "difficulty": "beginner",
      "concept": {
        "summary": "PCIe(Peripheral Component Interconnect Express)is现代compute机in连接 GPU, NVMe SSD 等高速outside设总线standard. GPU isa PCIe device, Linux kernelthrough PCIe 总线and GPU 通信. ",
        "keyPoints": [
          "PCIe is点对点serial总线, 取代旧parallel PCI 总线",
          "each PCIe devicehasunique BDF address: Bus:Device.Function",
          "PCIe through Lane transferdata, x16 represent 16 条 Lane",
          "AMD RX 7600 XT use PCIe 4.0 x8 interface",
          "Linux kernelthrough /sys/bus/pci/devices/ 暴露all PCIe device"
        ]
      },
      "diagram": {
        "title": "PCIe deviceinsysteminlocation",
        "content": "\nCPU\n |\n +-- PCIe Root Complex\n      |\n      +-- PCIe Switch\n      |    |\n      |    +-- GPU (Bus:01 Dev:00 Func:00)  ← AMD RX 7600 XT\n      |    |    BDF: 0000:01:00.0\n      |    |\n      |    +-- NVMe SSD (Bus:02 Dev:00 Func:00)\n      |         BDF: 0000:02:00.0\n      |\n      +-- PCIe Slot (x16)\n           |\n           +-- GPU BAR0: VRAM MMIO\n           +-- GPU BAR1: Doorbell\n           +-- GPU BAR2: Config Space\n",
        "caption": "PCIe topology: CPU through Root Complex 连接to GPU, eachdevicehasunique BDF address"
      },
      "codeWalk": {
        "title": "Linux kernelin PCI devicestructure",
        "language": "c",
        "code": "/* include/linux/pci.h */\nstruct pci_dev {\n    struct list_head bus_list;  /* linked listnode, 连接同一总线ondevice */\n    struct pci_bus  *bus;       /* 所in PCIe 总线 */\n    struct pci_bus  *subordinate; /* below级总线(ifis bridge) */\n\n    unsigned int    devfn;      /* Device:Function 编码 */\n    unsigned short  vendor;     /* 厂商 ID, AMD = 0x1002 */\n    unsigned short  device;     /* device ID, RX 7600 XT = 0x7480 */\n    unsigned short  class;      /* devicetype, GPU = 0x0300 */\n\n    u8 revision;                /* hardwareversion号 */\n    u8 hdr_type;                /* Header type */\n\n    struct resource resource[DEVICE_COUNT_RESOURCE]; /* BAR resource */\n    /* BAR0-5: Base Address Registers, mapping GPU register空between */\n};\n\n/* amdgpu_drv.c - AMD GPU  PCI device ID 表 */\nstatic const struct pci_device_id pciidlist[] = {\n    {0x1002, 0x7480, PCI_ANY_ID, PCI_ANY_ID, 0, 0, CHIP_NAVI33}, /* RX 7600 XT */\n    {0x1002, 0x744C, PCI_ANY_ID, PCI_ANY_ID, 0, 0, CHIP_NAVI31}, /* RX 7900 XTX */\n    {0, 0, 0}  /* 终止符 */\n};\nMODULE_DEVICE_TABLE(pci, pciidlist);\n/* whenkernelfind vendor=0x1002 device=0x7480 device时, automaticloading amdgpu module */",
        "explanation": "Linux 用 `pci_dev` structure体representeach PCIe device. `pci_device_id` 表告诉kernel: whenfind AMD(0x1002) RX 7600 XT(0x7480)时, shouldloading amdgpu driver. "
      },
      "miniLab": {
        "title": "探索your AMD GPU PCIe information",
        "language": "bash",
        "code": "#!/bin/bash\n# Lab 2.1.1: view AMD GPU  PCIe deviceinformation\n\n# step 1: find AMD GPU  BDF address\necho \"=== lookup AMD GPU ===\"\nlspci | grep -i \"AMD\\|Radeon\\|ATI\"\n# outputexample: 01:00.0 VGA compatible controller: Advanced Micro Devices...\n\n# step 2: viewdetailedinformation(替换 01:00.0 asyour BDF)\nGPU_BDF=$(lspci | grep -i \"VGA.*AMD\\|AMD.*VGA\" | awk '{print $1}' | head -1)\necho \"\"\necho \"=== GPU BDF: $GPU_BDF ===\"\nlspci -v -s $GPU_BDF\n\n# step 3: view PCIe 链路速度and宽度\necho \"\"\necho \"=== PCIe 链路information ===\"\nlspci -vv -s $GPU_BDF | grep -E \"LnkSta:|LnkCap:\"\n# LnkSta: Speed 16GT/s (ok), Width x8 (ok) ← currentactual速度\n# LnkCap: Speed 16GT/s, Width x16 ← 最大support速度\n\n# step 4: view BAR(Base Address Register)\necho \"\"\necho \"=== BAR memory mapping ===\"\nlspci -v -s $GPU_BDF | grep \"Memory at\"\n# Memory at e0000000 (64-bit, prefetchable) [size=256M] ← BAR0: VRAM\n# Memory at f0000000 (64-bit, non-prefetchable) [size=2M]  ← BAR2: register\n\n# step 5: through sysfs view\necho \"\"\necho \"=== sysfs deviceinformation ===\"\nls /sys/bus/pci/devices/ | grep $GPU_BDF\ncat /sys/bus/pci/devices/0000:$GPU_BDF/vendor  # 应output 0x1002\ncat /sys/bus/pci/devices/0000:$GPU_BDF/device  # device ID",
        "expectedOutput": "=== lookup AMD GPU ===\n01:00.0 VGA compatible controller: Advanced Micro Devices, Inc. [AMD/ATI] Navi33 [Radeon RX 7600/7600 XT/7600M XT/7600S/7700S / PRO W7600] (rev c7)\n01:00.1 Audio device: Advanced Micro Devices, Inc. [AMD/ATI] Navi31 HDMI/DP Audio\n\n=== PCIe 链路information ===\nLnkCap: Speed 16GT/s (PCIe 4.0), Width x8\nLnkSta: Speed 16GT/s (ok), Width x8 (ok)\n\n=== BAR memory mapping ===\nMemory at e0000000 (64-bit, prefetchable) [size=256M]  ← VRAM\nMemory at f0000000 (64-bit, non-prefetchable) [size=2M] ← register"
      },
      "debugExercise": {
        "title": "why GPU 只跑in x8 而is not x16? ",
        "language": "bash",
        "question": "your主板has x16 插槽, 但 `lspci` display GPU 跑in x8 速度. 这willimpactperformance吗? how判断ishardwarelimitstillisconfigurationissue? ",
        "buggyCode": "# check PCIe 链路state\nlspci -vv -s 01:00.0 | grep LnkSta\n# output: LnkSta: Speed 16GT/s (ok), Width x8 (downgraded)\n#                                          ^^^^^^^^^^^^^^^^^^\n#                                          note这insideis downgraded! ",
        "hint": "view LnkCap(最大ability)and LnkSta(currentstate)difference. `downgraded` representactual速度低于最大ability. check主板手册: has些主板inusemultiple PCIe device时willautomatic降速. ",
        "solution": "for RX 7600 XT(Navi33), PCIe 4.0 x8 bandwidthis 16 GB/s, alreadyexceed GPU actual需求. onlyin极端情况below(如 4K 纹理流式transfer)only thenwill成asbottleneck. check BIOS setin PCIe configuration, confirmwhetherhas `Auto` 降速选项. "
      },
      "interviewQuestion": {
        "question": "explain PCIe BDF address含义, and Linux kernelhowthrough BDF uniqueidentifiera PCIe device? ",
        "difficulty": "medium",
        "hint": "BDF = Bus:Device.Function, each字段位宽ishow much? ",
        "answer": "BDF(Bus:Device.Function)is PCIe deviceuniqueaddress. Bus 占 8 位(0-255, 最多 256 条总线), Device 占 5 位(0-31, 每条总线最多 32 个device), Function 占 3 位(0-7, eachdevice最多 8 个function). Linux kernelin `/sys/bus/pci/devices/` below用 `DDDD:BB:DD.F` format(域:总线:device.function)representeachdevice. AMD GPU usuallyis `0000:01:00.0`(域0, 总线1, device0, function0). GPU 音频functionis `0000:01:00.1`(同一devicefunction1). "
      },
      "completionChecklist": [
        "can用 lspci find AMD GPU  BDF address",
        "understand PCIe BDF address含义and位宽",
        "canview PCIe 链路速度and宽度",
        "understand BAR(Base Address Register)作用",
        "know AMD  vendor ID is 0x1002"
      ]
    },
    {
      "id": "2-1-2",
      "title": "PCIe 枚举process",
      "duration": 20,
      "difficulty": "intermediate",
      "concept": {
        "summary": "PCIe 枚举(Enumeration)is Linux kernelstartup时findandconfigurationall PCIe deviceprocess. kernelfrom Root Complex start, 递归扫描all总线, readeachdeviceconfiguration space, allocation BAR address, finallycallmatchdriver probe() function. ",
        "keyPoints": [
          "枚举inkernelstartup时由 PCI subsystemautomaticcomplete",
          "each PCIe devicehas 256 bytesconfiguration space(PCIe 扩展to 4KB)",
          "configuration spacecontain Vendor ID, Device ID, BAR register等keyinformation",
          "kernelreadconfiguration space, according to vendor:device matchdriver",
          "matchsuccessaftercalldriver probe() function, driverin此initializationdevice"
        ]
      },
      "diagram": {
        "title": "PCIe 枚举process",
        "content": "\nkernelstartup\n    |\n    v\nPCI subsysteminitialization\n    |\n    v\n扫描 Root Complex (Bus 0)\n    |\n    +-- read Bus 0, Dev 0, Func 0 configuration space\n    |       Vendor ID: 0x8086 (Intel Root Complex)\n    |\n    +-- find PCIe Bridge → 递归扫描 Bus 1\n    |       |\n    |       +-- Bus 1, Dev 0, Func 0\n    |               Vendor ID: 0x1002  ← AMD!\n    |               Device ID: 0x7480  ← RX 7600 XT\n    |               |\n    |               v\n    |           allocation BAR address\n    |           BAR0 → 0xe0000000 (256MB VRAM)\n    |           BAR2 → 0xf0000000 (2MB register)\n    |               |\n    |               v\n    |           matchdriver: amdgpu\n    |               |\n    |               v\n    |           call amdgpu_pci_probe()\n    |               |\n    |               v\n    |           driverinitializationcomplete ✓\n    |\n    v\n枚举complete, alldeviceready\n",
        "caption": "PCIe 枚举: kernel递归扫描总线, find AMD GPU aftercall amdgpu_pci_probe() initializationdriver"
      },
      "codeWalk": {
        "title": "amdgpu_pci_probe() — driverentry point点",
        "language": "c",
        "code": "/* drivers/gpu/drm/amd/amdgpu/amdgpu_drv.c */\n\n/* whenkernelfindmatch PCIe device时, call此function */\nstatic int amdgpu_pci_probe(struct pci_dev *pdev,\n                             const struct pci_device_id *ent)\n{\n    struct drm_device *ddev;\n    struct amdgpu_device *adev;\n    unsigned long flags = ent->driver_data;  /* 芯片typeflag */\n    int ret;\n\n    /* step 1: enable PCIe device */\n    ret = pci_enable_device(pdev);\n    if (ret)\n        return ret;\n\n    /* step 2: request BAR resource(MMIO memoryregion) */\n    ret = pci_request_regions(pdev, \"amdgpu\");\n    if (ret)\n        goto err_disable;\n\n    /* step 3: set DMA mask(GPU canaccessphysical memoryrange) */\n    ret = dma_set_mask_and_coherent(&pdev->dev, DMA_BIT_MASK(44));\n    /* 44 位 = 16TB address space, 现代 GPU standard */\n\n    /* step 4: create DRM device(graphicsdriverframework) */\n    ddev = drm_dev_alloc(&amdgpu_kms_driver, &pdev->dev);\n\n    /* step 5: create amdgpu_device(AMD GPU corestructure体) */\n    adev = drm_to_adev(ddev);\n    adev->dev = &pdev->dev;\n    adev->pdev = pdev;\n    adev->flags = flags;  /* storage芯片type(RDNA3 等) */\n\n    /* step 6: initialization AMD GPU hardware */\n    ret = amdgpu_device_init(adev, flags);\n    /* 这is最keyfunction, initializationall IP module */\n\n    return 0;\nerr_disable:\n    pci_disable_device(pdev);\n    return ret;\n}",
        "explanation": "`amdgpu_pci_probe()` isentire AMD GPU driverentry point点. 它按ordercomplete: enabledevice → request BAR resource → set DMA → create DRM device → initialization GPU hardware. understandthisfunctionisunderstandentire amdgpu driver起点. "
      },
      "miniLab": {
        "title": "observe PCIe 枚举process",
        "language": "bash",
        "code": "#!/bin/bash\n# Lab 2.1.2: observe PCIe 枚举anddriverloadingprocess\n\n# step 1: viewkernelstartup时 PCIe 枚举log\necho \"=== PCIe 枚举log ===\"\nsudo dmesg | grep -E \"pci|PCI\" | grep -i \"amd\\|radeon\\|amdgpu\" | head -20\n\n# step 2: view amdgpu driverloadinglog\necho \"\"\necho \"=== amdgpu driverloadinglog ===\"\nsudo dmesg | grep \"amdgpu\" | head -30\n\n# step 3: view PCIe configuration space(rawdata)\nGPU_BDF=$(lspci | grep -i \"VGA.*AMD\" | awk '{print $1}' | head -1)\necho \"\"\necho \"=== PCIe configuration space(before 64 bytes)===\"\nsudo lspci -xxx -s $GPU_BDF | head -10\n# offset 0x00-0x01: Vendor ID (0x1002 = AMD)\n# offset 0x02-0x03: Device ID (0x7480 = RX 7600 XT)\n# offset 0x10-0x27: BAR0-BAR5 address\n\n# step 4: viewdriver绑定state\necho \"\"\necho \"=== driver绑定state ===\"\nls -la /sys/bus/pci/devices/0000:$GPU_BDF/driver\n# should指向 /sys/bus/pci/drivers/amdgpu\n\n# step 5: simulatedriver解绑andre-绑定(谨慎operate! )\necho \"\"\necho \"=== driver绑定information ===\"\ncat /sys/bus/pci/devices/0000:$GPU_BDF/driver/module/version 2>/dev/null || \\\n    echo \"driverversioninformationnotavailable\"\necho \"Driver: $(readlink /sys/bus/pci/devices/0000:$GPU_BDF/driver | xargs basename)\"\n",
        "expectedOutput": "=== amdgpu driverloadinglog ===\n[    4.123456] amdgpu: loading driver\n[    4.234567] amdgpu 0000:01:00.0: enabling device (0000 -> 0003)\n[    4.345678] amdgpu 0000:01:00.0: BAR 0: assigned [mem 0xe0000000-0xefffffff 64bit pref]\n[    4.456789] amdgpu 0000:01:00.0: amdgpu kernel modesetting enabled.\n\n=== driver绑定state ===\nlrwxrwxrwx 1 root root 0 /sys/bus/pci/devices/0000:01:00.0/driver -> ../../../../bus/pci/drivers/amdgpu"
      },
      "debugExercise": {
        "title": "probe() failure: deviceunable toenable",
        "language": "c",
        "question": "yourdriver probe() functionreturn -ENODEV, kernellogdisplay 'pci_enable_device failed'. maycauseiswhat? ",
        "buggyCode": "static int my_gpu_probe(struct pci_dev *pdev,\n                        const struct pci_device_id *ent)\n{\n    int ret;\n    \n    /* issue: nocheckdevicewhetheralreadybyotherdriver占用 */\n    ret = pci_enable_device(pdev);  /* return -EBUSY */\n    if (ret) {\n        dev_err(&pdev->dev, \"pci_enable_device failed: %d\\n\", ret);\n        return ret;\n    }\n    return 0;\n}",
        "hint": "check /sys/bus/pci/devices/BDF/driver whetheralreadyhasdriver绑定. use `lspci -k` viewcurrentusekerneldriver. ",
        "solution": "incall pci_enable_device() before, shouldcheckdevicewhetheralreadybyotherdriver(如 vfio-pci or nouveau)占用. use `pci_is_enabled(pdev)` checkstate. additionally, ifisvirtual machineenvironment, devicemayby VFIO 直通给virtual machine. "
      },
      "interviewQuestion": {
        "question": "describe Linux kernelin PCIe device driver probe() and remove() function作用, andtheyindevicelifecycleinlocation. ",
        "difficulty": "medium",
        "hint": "想想devicecompletelifecycle: find → initialization → use → 移除",
        "answer": "probe() inkernelfindmatch PCIe device时call, responsible for: 1) enabledevice(pci_enable_device); 2) request并mapping BAR resource; 3) set DMA mask; 4) initializationhardware; 5) registrationdevicetoonlayersubsystem(如 DRM). remove() indevice removedordriverunloading时call, responsible for逆向operate: deregistrationdevice, releaseresource, disabledevice. 这twofunction构成drivercompletelifecyclemanagement, is Linux driver模型core. "
      },
      "completionChecklist": [
        "understand PCIe 枚举completeprocess",
        "know probe() function何时bycall",
        "canin dmesg infind amdgpu driverloadinglog",
        "understand pci_enable_device() 作用",
        "knowhowviewdevicedriver绑定state"
      ]
    },
    {
      "id": "2-1-3",
      "title": "BAR and MMIO registeraccess",
      "duration": 20,
      "difficulty": "intermediate",
      "concept": {
        "summary": "BAR(Base Address Register)is PCIe device暴露给 CPU memory窗口. GPU through BAR will其registerand VRAM mappingto CPU physicaladdress space, CPU through读写theseaddresscontrol GPU. 这种mechanism称as MMIO(Memory-Mapped I/O). ",
        "keyPoints": [
          "GPU usuallyhas 3 个 BAR: BAR0(VRAM), BAR2(register), BAR4(Doorbell)",
          "CPU through ioremap() will BAR physical addressmappingtokernelvirtual address",
          "use readl()/writel() access MMIO register, rather thandirectlypointer解引用",
          "MMIO accesswill绕过 CPU cache, directlyto达hardware",
          "amdgpu use RREG32/WREG32 macroencapsulation MMIO access"
        ]
      },
      "diagram": {
        "title": "BAR memory mappingmechanism",
        "content": "\nphysicaladdress space\n┌─────────────────────────────────────┐\n│ 0x0000_0000 - 0x7FFF_FFFF: system RAM │\n├─────────────────────────────────────┤\n│ 0xe000_0000 - 0xefff_ffff: BAR0     │ ← GPU VRAM (256MB)\n│   GPU VRAMdirectlymappingto此address           │\n├─────────────────────────────────────┤\n│ 0xf000_0000 - 0xf01f_ffff: BAR2     │ ← GPU register (2MB)\n│   GPU controlregister                     │\n│   offset 0x0000: GRBM_STATUS          │\n│   offset 0x2000: SDMA0_STATUS         │\n│   offset 0x8000: CP_RB_RPTR           │\n├─────────────────────────────────────┤\n│ 0xf020_0000 - 0xf02f_ffff: BAR4     │ ← Doorbell (1MB)\n│   used fornotify GPU has新command              │\n└─────────────────────────────────────┘\n\ndriveraccessprocess:\npci_resource_start(pdev, 2)  → get BAR2 physical address 0xf0000000\nioremap(0xf0000000, 0x200000) → mappingtokernelvirtual address 0xffff_8880_f000_0000\nRREG32(0x2000)               → read SDMA0_STATUS register\n",
        "caption": "BAR will GPU registermappingto CPU address space, driverthrough ioremap() 获得canaccessvirtual address"
      },
      "codeWalk": {
        "title": "amdgpu in MMIO initializationandaccess",
        "language": "c",
        "code": "/* drivers/gpu/drm/amd/amdgpu/amdgpu_device.c */\n\nint amdgpu_device_init(struct amdgpu_device *adev, uint32_t flags)\n{\n    /* step 1: mapping BAR0(VRAM, used for CPU directlyaccessVRAM) */\n    adev->mman.aper_base_kaddr = ioremap_wc(\n        pci_resource_start(adev->pdev, 0),   /* BAR0 physical address */\n        pci_resource_len(adev->pdev, 0));     /* BAR0 size(256MB)*/\n    /* ioremap_wc = Write-Combining pattern, 适合大blockmemorytransfer */\n\n    /* step 2: mapping BAR2(register空between) */\n    adev->rmmio_base = pci_resource_start(adev->pdev, 2);\n    adev->rmmio_size = pci_resource_len(adev->pdev, 2);\n    adev->rmmio = ioremap(adev->rmmio_base, adev->rmmio_size);\n    /* ioremap = 普通mapping, each timeaccessdirectlyto达hardware */\n\n    /* step 3: mapping BAR4(Doorbell, used fornotify GPU) */\n    adev->doorbell.base = pci_resource_start(adev->pdev, 4);\n    adev->doorbell.ptr = ioremap_wc(adev->doorbell.base,\n                                     adev->doorbell.size);\n    ...\n}\n\n/* read GPU registercoremacro */\n#define RREG32(reg) amdgpu_mm_rreg(adev, (reg), false)\n#define WREG32(reg, v) amdgpu_mm_wreg(adev, (reg), (v), false)\n\nstatic uint32_t amdgpu_mm_rreg(struct amdgpu_device *adev,\n                                 uint32_t reg, bool always_indirect)\n{\n    uint32_t ret;\n    if (!always_indirect && (reg * 4) < adev->rmmio_size)\n        /* directly MMIO read: registerinmappingrange内 */\n        ret = readl(((void __iomem *)adev->rmmio) + (reg * 4));\n    else {\n        /* between接access: through MMIO 索引registeraccess超出rangeregister */\n        writel((reg), ((void __iomem *)adev->rmmio) + AMDGPU_MM_INDEX);\n        ret = readl(((void __iomem *)adev->rmmio) + AMDGPU_MM_DATA);\n    }\n    return ret;\n}\n\n/* useexample: check GPU whetherhang */\nuint32_t status = RREG32(mmGRBM_STATUS);\nif (status & GRBM_STATUS__GUI_ACTIVE_MASK)\n    dev_info(adev->dev, \"GPU is busy\\n\");",
        "explanation": "amdgpu through ioremap() will BAR physical addressmappingtokernelvirtual address, then用 RREG32/WREG32 macroencapsulation readl()/writel() 进行registeraccess. registeraddressis相for BAR2 基addressoffset量, 乘以 4 得tobytesoffset. "
      },
      "miniLab": {
        "title": "read GPU registerstate",
        "language": "bash",
        "code": "#!/bin/bash\n# Lab 2.1.3: through sysfs/debugfs access GPU register\n\n# step 1: view BAR resourceallocation\nGPU_BDF=$(lspci | grep -i \"VGA.*AMD\" | awk '{print $1}' | head -1)\necho \"=== BAR resourceallocation ===\"\ncat /sys/bus/pci/devices/0000:$GPU_BDF/resource\n# format: start end flags\n# flags: 0x0000 = IO, 0x0200 = MEM, 0x0204 = MEM|PREFETCH\n\n# step 2: through debugfs read GPU register(need amdgpu driver)\necho \"\"\necho \"=== GPU stateregister ===\"\nif [ -f /sys/kernel/debug/dri/0/amdgpu_regs ]; then\n    # read GRBM_STATUS register(GPU busystate)\n    sudo cat /sys/kernel/debug/dri/0/amdgpu_regs | grep -i \"GRBM_STATUS\" | head -5\nelse\n    echo \"debugfs notavailable, trythrough sysfs read...\"\nfi\n\n# step 3: view GPU memoryinformation(through amdgpu sysfs)\necho \"\"\necho \"=== GPU memoryinformation ===\"\nGPU_CARD=$(ls /sys/class/drm/ | grep \"^card[0-9]$\" | head -1)\nif [ -d /sys/class/drm/$GPU_CARD/device/mem_info_vram_total ]; then\n    VRAM_TOTAL=$(cat /sys/class/drm/$GPU_CARD/device/mem_info_vram_total)\n    VRAM_USED=$(cat /sys/class/drm/$GPU_CARD/device/mem_info_vram_used)\n    echo \"VRAM 总量: $((VRAM_TOTAL / 1024 / 1024)) MB\"\n    echo \"VRAM already用: $((VRAM_USED / 1024 / 1024)) MB\"\nfi\n\n# step 4: use dd directlyread BAR memory(仅used forlearn, 生产environment危险! )\necho \"\"\necho \"=== BAR2 before 16 bytes(register空between)===\"\nBAR2_START=$(cat /sys/bus/pci/devices/0000:$GPU_BDF/resource | \\\n    awk 'NR==3{printf \"0x%s\", $1}')\necho \"BAR2 起始address: $BAR2_START\"\n# note: directlyread BAR need root permission, 且maycausesystemnot稳定",
        "expectedOutput": "=== BAR resourceallocation ===\n0x00000000e0000000 0x00000000efffffff 0x000000000014220c  ← BAR0: 256MB VRAM\n0x0000000000000000 0x0000000000000000 0x0000000000000000\n0x00000000f0000000 0x00000000f01fffff 0x0000000000140204  ← BAR2: 2MB register\n0x0000000000000000 0x0000000000000000 0x0000000000000000\n0x00000000f0200000 0x00000000f02fffff 0x000000000014220c  ← BAR4: 1MB Doorbell\n\n=== GPU memoryinformation ===\nVRAM 总量: 8192 MB\nVRAM already用: 512 MB"
      },
      "debugExercise": {
        "title": "MMIO accesscausekernelcrash",
        "language": "c",
        "question": "belowcodeinaccess GPU register时causekernel Oops, causeiswhat? ",
        "buggyCode": "/* error MMIO accessapproach */\nstatic int bad_read_register(struct pci_dev *pdev)\n{\n    void *bar2_phys = (void *)pci_resource_start(pdev, 2);\n    \n    /* directly用physical addressreadregister  —  这iserror!  */\n    uint32_t val = *(uint32_t *)bar2_phys;\n    printk(\"Register value: 0x%x\\n\", val);\n    return 0;\n}",
        "hint": "in x86_64 Linux in, kernelnotcandirectlyaccessphysical address. physical addressmust先through ioremap() mappingtokernelvirtualaddress space. ",
        "solution": "correct做法: use ioremap() willphysical addressmappingtovirtual address, then用 readl() read: `void __iomem *bar2 = ioremap(pci_resource_start(pdev, 2), pci_resource_len(pdev, 2)); uint32_t val = readl(bar2); iounmap(bar2);`. directly解引用physical addresswillcause页error(Page Fault), becausekernelpage tableinno该physical addressmapping. "
      },
      "interviewQuestion": {
        "question": "why MMIO accessmustuse readl()/writel() 而is not普通pointer解引用? ",
        "difficulty": "hard",
        "hint": "考虑compileroptimization, memory序(memory ordering)andcacheimpact",
        "answer": "has三个cause: 1) compiler屏障: readl()/writel() containmemory屏障, preventcompiler重排 MMIO accessorder(compilermay认as对同一address多次writeis冗余而optimization掉); 2) CPU memory序: MMIO regionbymarkas UC(Uncacheable)or WC(Write-Combining), readl()/writel() ensureaccessnot经过 CPU cachedirectlyto达hardware; 3) can移植性: incertainarchitecture(如 IA-64)on, MMIO accessneed特殊instruction, readl()/writel() encapsulationthese差异. directlypointer解引用maybycompileroptimization掉orout of orderexecute, causehardware行asnotcanprediction. "
      },
      "completionChecklist": [
        "understand BAR 作用and GPU usuallyhaswhich BAR",
        "know ioremap() 作用anduse时机",
        "understand RREG32/WREG32 macroimplementationprinciple",
        "knowwhynotcandirectly用pointeraccess MMIO",
        "canthrough sysfs view GPU  BAR resourceallocation"
      ]
    },
    {
      "id": "2-1-4",
      "title": "DMA basicsandmemorycoherence",
      "duration": 25,
      "difficulty": "intermediate",
      "concept": {
        "summary": "DMA(Direct Memory Access)allow GPU directly读写system memory, 而无需 CPU 参andeach timedatatransfer. 这is GPU 高performancekey — CPU 只需set好 DMA descriptor, GPU can自主complete大量datatransfer. 但 DMA 引入cachecoherenceissue: CPU cacheindatamayand GPU 看tomemorydatanotsynchronization. ",
        "keyPoints": [
          "DMA let GPU directlyaccesssystem RAM, 无需 CPU in转, bandwidthcan达数十 GB/s",
          "Coherent DMA: CPU and GPU 看todata始终一致, 但performance较低",
          "Streaming DMA: 高performance, 但need手动synchronization(dma_sync_*)",
          "IOMMU as DMA provideaddress translationandaccessprotect, prevent恶意deviceaccess任意memory",
          "dma_alloc_coherent() allocation CPU and GPU allcanaccessshared memory"
        ]
      },
      "diagram": {
        "title": "DMA transferandcachecoherence",
        "content": "\n                    CPU\n                   /   \\\n              L1 Cache  L2 Cache\n                  |         |\n                  +----+----+\n                       |\n                  LLC (L3 Cache)\n                       |\n              ┌────────┴────────┐\n              │   system memory RAM   │\n              │  0x1000_0000    │ ← DMA Buffer (physical address)\n              │  \"Hello GPU\"    │\n              └────────┬────────┘\n                       |\n                    IOMMU\n                    (address translation + protect)\n                       |\n                    PCIe Bus\n                       |\n                      GPU\n                   (DMA Engine)\n\nCoherent DMA scenario:\n  CPU write → automaticflushcache → GPU 读tolatestdata ✓\n  GPU write → automaticinvalidatecache → CPU 读tolatestdata ✓\n\nStreaming DMA scenario:\n  CPU write → dataincachein → need dma_sync_single_for_device() flush\n  GPU write → datainmemoryin → need dma_sync_single_for_cpu() invalidatecache\n",
        "caption": "DMA 绕过 CPU directlyaccessmemory, IOMMU provideaddress translationandprotect, cachecoherenceneed特别handle"
      },
      "codeWalk": {
        "title": "amdgpu in DMA memory allocation",
        "language": "c",
        "code": "/* drivers/gpu/drm/amd/amdgpu/amdgpu_ib.c */\n/* IB = Indirect Buffer, GPU commandbuffer */\n\nint amdgpu_ib_get(struct amdgpu_device *adev,\n                   struct amdgpu_vm *vm,\n                   unsigned size,\n                   struct amdgpu_ib *ib)\n{\n    /* allocation Coherent DMA memory: CPU and GPU allcanaccess */\n    /* dma_alloc_coherent 保证cachecoherence, 适合commandbuffer */\n    ib->ptr = dma_alloc_coherent(adev->dev,\n                                  AMDGPU_GPU_PAGE_ALIGN(size),\n                                  &ib->gpu_addr,  /* GPU can见 DMA address */\n                                  GFP_KERNEL);\n    /* ib->ptr     = CPU virtual address, CPU 用this写command */\n    /* ib->gpu_addr = GPU DMA address, GPU 用this读command */\n    \n    if (!ib->ptr)\n        return -ENOMEM;\n    \n    ib->length_dw = 0;\n    return 0;\n}\n\n/* CPU writecommandto IB */\nvoid amdgpu_ring_write(struct amdgpu_ring *ring, uint32_t v)\n{\n    /* directlywrite coherent memory, GPU 立i.e.can见 */\n    ring->ring[ring->wptr++ & ring->buf_mask] = v;\n}\n\n/* Streaming DMA example: transfer纹理data */\nint transfer_texture(struct amdgpu_device *adev, void *data, size_t size)\n{\n    dma_addr_t dma_addr;\n    \n    /* mapping CPU memoryas DMA address */\n    dma_addr = dma_map_single(adev->dev, data, size, DMA_TO_DEVICE);\n    if (dma_mapping_error(adev->dev, dma_addr))\n        return -ENOMEM;\n    \n    /* synchronization: ensure CPU cacheindataalreadyflushtomemory */\n    dma_sync_single_for_device(adev->dev, dma_addr, size, DMA_TO_DEVICE);\n    \n    /* commit DMA transfercommand给 GPU */\n    /* ... write SDMA ring ... */\n    \n    /* transfercompleteafter解除mapping */\n    dma_unmap_single(adev->dev, dma_addr, size, DMA_TO_DEVICE);\n    return 0;\n}",
        "explanation": "amdgpu 对commandbuffer(IB)use Coherent DMA, 保证 CPU writecommand GPU 立i.e.can见. 对大blockdatatransfer(纹理, 顶点buffer)use Streaming DMA, performance更高但need手动synchronization. "
      },
      "miniLab": {
        "title": "observe DMA memory allocation",
        "language": "bash",
        "code": "#!/bin/bash\n# Lab 2.1.4: observe DMA memory allocationand IOMMU state\n\n# step 1: check IOMMU whetherenable\necho \"=== IOMMU state ===\"\nsudo dmesg | grep -i \"iommu\\|IOMMU\" | head -10\n# if看to \"IOMMU enabled\" indicate IOMMU alreadyenable\n\n# step 2: view AMD IOMMU information\necho \"\"\necho \"=== AMD IOMMU information ===\"\nif [ -d /sys/class/iommu ]; then\n    ls /sys/class/iommu/\n    cat /sys/class/iommu/*/name 2>/dev/null\nfi\n\n# step 3: view DMA memoryuse情况\necho \"\"\necho \"=== DMA memorystatistics ===\"\ncat /proc/meminfo | grep -E \"CmaTotal|CmaFree|Bounce\"\n\n# step 4: view amdgpu DMA allocation(through debugfs)\necho \"\"\necho \"=== amdgpu DMA allocation ===\"\nif [ -d /sys/kernel/debug/dri/0 ]; then\n    sudo ls /sys/kernel/debug/dri/0/\n    sudo cat /sys/kernel/debug/dri/0/amdgpu_gem_info 2>/dev/null | head -20\nfi\n\n# step 5: check PCIe DMA mask\nGPU_BDF=$(lspci | grep -i \"VGA.*AMD\" | awk '{print $1}' | head -1)\necho \"\"\necho \"=== DMA mask ===\"\ncat /sys/bus/pci/devices/0000:$GPU_BDF/dma_mask_bits 2>/dev/null || \\\n    echo \"DMA mask: 44 位 (16TB address space)\"\n\n# step 6: view IOMMU 组(security隔离单元)\necho \"\"\necho \"=== IOMMU 组 ===\"\nls /sys/bus/pci/devices/0000:$GPU_BDF/iommu_group/devices/ 2>/dev/null",
        "expectedOutput": "=== IOMMU state ===\n[    0.123456] AMD-Vi: IOMMU performance counters supported\n[    0.234567] AMD-Vi: Found IOMMU at 0000:00:00.2 cap 0x40\n[    0.345678] AMD-Vi: Enabling IOMMU\n\n=== DMA memorystatistics ===\nCmaTotal:       524288 kB\nCmaFree:        512000 kB"
      },
      "debugExercise": {
        "title": "DMA addressmappingerrorcause GPU accesserrormemory",
        "language": "c",
        "question": "belowcodeincertainsystemonwork正常, 但inenable IOMMU systemon GPU unable toreaddata. causeiswhat? ",
        "buggyCode": "int bad_dma_transfer(struct pci_dev *pdev, void *cpu_buf, size_t size)\n{\n    /* error: directlyusephysical address作as DMA address */\n    phys_addr_t phys = virt_to_phys(cpu_buf);\n    \n    /* willphysical addresswrite GPU  DMA register */\n    writel(phys & 0xFFFFFFFF, gpu_reg_base + DMA_ADDR_LO);\n    writel(phys >> 32,        gpu_reg_base + DMA_ADDR_HI);\n    \n    /* startup DMA transfer */\n    writel(size, gpu_reg_base + DMA_SIZE);\n    writel(1,    gpu_reg_base + DMA_START);\n    return 0;\n}",
        "hint": "IOMMU inphysical addressand DMA address之between增加一layer翻译. GPU 看to DMA address(IOVA)not等于physical address. ",
        "solution": "mustuse dma_map_single() get IOMMU 翻译after DMA address(IOVA): `dma_addr_t dma_addr = dma_map_single(&pdev->dev, cpu_buf, size, DMA_TO_DEVICE);`. thenwill dma_addr(is notphysical address)write GPU register. no IOMMU 时, IOVA 等于physical address, socode碰巧work; has IOMMU 时, IOVA isvirtual address, GPU 用physical addresswillaccesserrormemory. "
      },
      "interviewQuestion": {
        "question": "explain Coherent DMA and Streaming DMA difference, and amdgpu inwhatscenariobelowuse哪种approach? ",
        "difficulty": "hard",
        "hint": "fromperformance, cachecoherence保证andusescenario三个角度analyze",
        "answer": "Coherent DMA(coherence DMA): through dma_alloc_coherent() allocation, hardware保证 CPU anddevice看todata始终一致, 无需手动synchronization. 缺点isperformance较低(usuallymarkas UC or WC, 绕过cache). amdgpu used forcommandbuffer(IB/Ring), page table, semaphore等need频繁 CPU-GPU interaction小blockmemory. Streaming DMA(流式 DMA): through dma_map_single()/dma_map_sg() mapping, performance高(can利用cache), 但needin CPU writeaftercall dma_sync_single_for_device() flushcache, GPU writeaftercall dma_sync_single_for_cpu() invalidatecache. amdgpu used for纹理, 顶点buffer等大block单向transferdata. "
      },
      "completionChecklist": [
        "understand DMA 作用andwhy GPU need DMA",
        "区分 Coherent DMA and Streaming DMA",
        "know IOMMU 作用andwhynotcandirectly用physical address",
        "understand dma_alloc_coherent() and dma_map_single() difference",
        "know amdgpu inwhichscenariouse Coherent DMA"
      ]
    },
    {
      "id": "2-1-5",
      "title": "MSI/MSI-X interruptmechanism",
      "duration": 20,
      "difficulty": "intermediate",
      "concept": {
        "summary": "现代 GPU use MSI-X(Message Signaled Interrupts Extended)notify CPU 任务complete, error发生等event. MSI-X 比传统 INTx interrupt更高效, supportmultipleindependentinterrupt vector, each GPU engine(GFX, SDMA, VCN 等)canhasselfinterrupt vector, avoidinterruptsharedcauseperformanceissue. ",
        "keyPoints": [
          "传统 INTx interrupt: sharedinterrupt线, alldevice共用, need查询is哪个devicetrigger",
          "MSI: through写memorytriggerinterrupt, 无需interrupt线, 但只support 32 个interrupt vector",
          "MSI-X: support最多 2048 个independentinterrupt vector, each向量can路由todifferent CPU core",
          "AMD RX 7600 XT use MSI-X, as GFX, SDMA, VCN 等engineallocationindependentinterrupt",
          "interrupt亲and性(IRQ affinity)canwilldifferentengineinterrupt绑定todifferent CPU core"
        ]
      },
      "diagram": {
        "title": "MSI-X interruptprocess",
        "content": "\nGPU enginecomplete任务\n        |\n        v\nGPU write MSI-X messagetomemoryaddress\n(addressanddataininitialization时由kernelconfiguration)\n        |\n        v\nPCIe 总线transfer写request\n        |\n        v\nCPU LAPIC (Local APIC) receiveinterrupt\n        |\n        +-- interrupt vector 0 → CPU 0 → amdgpu_irq_handler() → GFX complete\n        +-- interrupt vector 1 → CPU 1 → amdgpu_irq_handler() → SDMA complete\n        +-- interrupt vector 2 → CPU 2 → amdgpu_irq_handler() → VCN complete\n        +-- interrupt vector 3 → CPU 3 → amdgpu_irq_handler() → error/故障\n        |\n        v\namdgpu_irq_handler()\n    |\n    +-- read IH Ring (Interrupt Handler Ring)\n    |   GPU willinterrupt源informationwrite IH Ring\n    |\n    +-- 分发tospecifichandlefunction\n        +-- amdgpu_gfx_irq_handler()\n        +-- amdgpu_sdma_irq_handler()\n        +-- amdgpu_fault_handler()\n",
        "caption": "MSI-X aseach GPU engineallocationindependentinterrupt vector, can路由todifferent CPU core, avoidinterrupt竞争"
      },
      "codeWalk": {
        "title": "amdgpu in MSI-X initialization",
        "language": "c",
        "code": "/* drivers/gpu/drm/amd/amdgpu/amdgpu_irq.c */\n\nint amdgpu_irq_init(struct amdgpu_device *adev)\n{\n    int r, num_irqs;\n\n    /* step 1: enable MSI-X, request所需interrupt vectorcount */\n    num_irqs = adev->irq.num_irqs;  /* usually 64-128 个 */\n    \n    r = pci_alloc_irq_vectors(adev->pdev,\n                               1,           /* 最少 1 个 */\n                               num_irqs,    /* 最多 num_irqs 个 */\n                               PCI_IRQ_MSIX | PCI_IRQ_MSI);\n    if (r < 0) {\n        /* 回退to传统interrupt */\n        dev_warn(adev->dev, \"Failed to get MSI-X, falling back to MSI\\n\");\n        r = pci_alloc_irq_vectors(adev->pdev, 1, 1, PCI_IRQ_MSI);\n    }\n    adev->irq.num_irqs = r;  /* actualallocationtointerruptcount */\n\n    /* step 2: registrationinterrupt handlingfunction */\n    r = request_irq(pci_irq_vector(adev->pdev, 0),  /* 向量 0 */\n                    amdgpu_irq_handler,               /* handlefunction */\n                    IRQF_SHARED,                      /* canshared */\n                    adev->irqname,                    /* interrupt名称 */\n                    adev);                            /* 传给handlefunctiondata */\n\n    return r;\n}\n\n/* interrupt handlingfunction */\nirqreturn_t amdgpu_irq_handler(int irq, void *arg)\n{\n    struct amdgpu_device *adev = (struct amdgpu_device *)arg;\n    \n    /* read IH Ring(Interrupt Handler Ring)\n     * GPU willinterrupt源informationwritethisring buffer */\n    amdgpu_ih_process(adev, &adev->irq.ih);\n    \n    return IRQ_HANDLED;\n}\n\n/* IH Ring handle: 分发interrupttospecifichandlefunction */\nstatic int amdgpu_ih_process(struct amdgpu_device *adev,\n                               struct amdgpu_ih_ring *ih)\n{\n    while (ih->rptr != ih->wptr) {  /* stillhasnot yethandleinterrupt */\n        /* readinterrupt源 ID */\n        uint32_t entry = ih->ring[ih->rptr & ih->ptr_mask];\n        uint32_t client_id = entry & 0xFF;\n        uint32_t src_id = (entry >> 8) & 0xFF;\n        \n        /* 分发tocorrespondinghandlefunction */\n        amdgpu_irq_dispatch(adev, client_id, src_id);\n        ih->rptr++;\n    }\n    return 0;\n}",
        "explanation": "amdgpu 优先use MSI-X, failure时回退to MSI. interrupt handlingcoreis IH Ring(Interrupt Handler Ring) — GPU willinterrupt源informationwritethisring buffer, CPU frominread并分发tocorrespondinghandlefunction. "
      },
      "miniLab": {
        "title": "view GPU interruptconfiguration",
        "language": "bash",
        "code": "#!/bin/bash\n# Lab 2.1.5: view AMD GPU  MSI-X interruptconfiguration\n\n# step 1: view GPU useinterrupttype\nGPU_BDF=$(lspci | grep -i \"VGA.*AMD\" | awk '{print $1}' | head -1)\necho \"=== GPU interruptability ===\"\nlspci -vv -s $GPU_BDF | grep -E \"MSI-X|MSI|Interrupt\"\n\n# step 2: viewallocation IRQ 号\necho \"\"\necho \"=== GPU IRQ allocation ===\"\ncat /proc/interrupts | grep -i \"amdgpu\\|radeon\" | head -20\n# format: IRQ号 CPU0 CPU1 ... type device名\n\n# step 3: view MSI-X 向量count\necho \"\"\necho \"=== MSI-X 向量information ===\"\nlspci -vv -s $GPU_BDF | grep -A5 \"MSI-X\"\n# MSI-X: Enable+ Count=64 Masked-\n# representenable 64 个 MSI-X 向量\n\n# step 4: viewinterrupt亲and性(哪个 CPU handle哪个interrupt)\necho \"\"\necho \"=== interrupt CPU 亲and性 ===\"\nfor irq in $(cat /proc/interrupts | grep \"amdgpu\" | awk '{print $1}' | tr -d ':' | head -5); do\n    if [ -f /proc/irq/$irq/smp_affinity_list ]; then\n        echo \"IRQ $irq → CPU $(cat /proc/irq/$irq/smp_affinity_list)\"\n    fi\ndone\n\n# step 5: viewinterruptstatistics(each CPU handlehow much次interrupt)\necho \"\"\necho \"=== interruptstatistics(最近 5 个 GPU interrupt)===\"\ncat /proc/interrupts | grep \"amdgpu\" | head -5",
        "expectedOutput": "=== GPU interruptability ===\nCapabilities: [a0] MSI-X: Enable+ Count=64 Masked-\n        Vector table: BAR=4 offset=00000000\n        PBA: BAR=4 offset=00002000\n\n=== GPU IRQ allocation ===\n 45:      12345       0       0       0  PCI-MSI 524288-edge  amdgpu\n 46:          0    5678       0       0  PCI-MSI 524289-edge  amdgpu\n 47:          0       0    9012       0  PCI-MSI 524290-edge  amdgpu"
      },
      "debugExercise": {
        "title": "interrupt handlingfunctionindeadlock",
        "language": "c",
        "question": "belowinterrupt handlingfunctionin高负载时偶尔causesystemdeadlock. findissue所in. ",
        "buggyCode": "irqreturn_t bad_irq_handler(int irq, void *arg)\n{\n    struct my_gpu_dev *dev = arg;\n    \n    /* issue: ininterruptcontextintrygetcansleepmutex */\n    mutex_lock(&dev->big_lock);  /* 这maycausesleep!  */\n    \n    /* handleinterrupt */\n    process_interrupt(dev);\n    \n    mutex_unlock(&dev->big_lock);\n    return IRQ_HANDLED;\n}",
        "hint": "interrupt handlingfunctionrunininterruptcontext(interrupt context)in, cannot sleep. mutex_lock() in锁by占用时willsleepwait. ",
        "solution": "ininterruptcontextinmustusespinlock(spinlock)rather thanmutex(mutex): will `mutex_lock(&dev->big_lock)` 改as `spin_lock(&dev->irq_lock)`. spinlockwill notsleep, but ratherbusy wait待. ifneedininterrupt handlingin做complexwork, shoulduse tasklet or workqueue willwork推迟toprocesscontextexecute. "
      },
      "interviewQuestion": {
        "question": "AMD GPU whyuse MSI-X 而is not传统 INTx interrupt? MSI-X how提升多engine GPU performance? ",
        "difficulty": "medium",
        "hint": "frominterruptshared, 多核扩展, latency三个角度analyze",
        "answer": "MSI-X 相比 INTx 优势: 1) 无interruptshared: each GPU engine(GFX, SDMA0/1, VCN, DCN 等)hasindependentinterrupt vector, notneedinhandlefunctionin查询is哪个enginetrigger, 减少latency; 2) 多核扩展: differentengineinterruptcan路由todifferent CPU core(IRQ affinity), 充分利用多核parallelhandleability; 3) 无需interrupt线: MSI-X through写memorytriggerinterrupt, 消除sharedinterrupt线竞争; 4) 更多向量: MSI-X support最多 2048 个向量, 足够aseach GPU queueallocationindependentinterrupt. AMD RX 7600 XT use 64 个 MSI-X 向量, 分别服务于 GFX engine, multiple SDMA engine, VCN 视频engine等. "
      },
      "completionChecklist": [
        "understand MSI-X 相比传统 INTx interrupt优势",
        "know amdgpu howinitialization MSI-X interrupt",
        "understand IH Ring 作用andworkprinciple",
        "knowinterrupt handlingfunctioncannot sleepcause",
        "can用 /proc/interrupts view GPU interruptstatistics"
      ]
    }
  ]
};
