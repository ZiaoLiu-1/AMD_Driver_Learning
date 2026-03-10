// ============================================================
// AMD Linux Driver Learning Platform - Module 5 Micro-Lessons (English)
// Module 5: AMDGPU Deep Dive (AMDGPU 深度parse)
// 9 lessons in 4 groups, ~15-20 min each, total ~160 min
// ============================================================
import type { MicroLessonModule } from './micro_lesson_types';

export const module5MicroLessonsEn: MicroLessonModule = {
  moduleId: 'amdgpu',
  groups: [
    // ════════════════════════════════════════════════════════════
    // Group 5.1: Code Navigation & Architecture
    // ════════════════════════════════════════════════════════════
    {
      id: '5-1',
      number: '5.1',
      title: 'code导航andarchitecture',
      titleEn: 'Code Navigation & Architecture',
      icon: '🗺️',
      description: '学willinexceed 400 万行 amdgpu drivercodein高效导航, understand IP Block module化architecture — 这isreadandcontribution amdgpu codebasics. ',
      lessons: [
        // ── Lesson 5.1.1 ──────────────────────────────────────
        {
          id: '5-1-1',
          number: '5.1.1',
          title: 'AMDGPU code导航指南',
          titleEn: 'Navigating the AMDGPU Source Tree',
          duration: 20,
          difficulty: 'expert',
          tags: ['amdgpu', 'source-tree', 'cscope', 'ctags', 'code-navigation'],
          concept: {
            summary: 'amdgpu driver位于 drivers/gpu/drm/amd/ below, contain 3500+ 个源fileand 400 万+ 行code. masterdirectorystructure, 命名specificationandcode导航tool(cscope/ctags/clangd)is高效readsource codebefore提 — otherwise你willincode海洋in迷失. ',
            explanation: [
              'drivers/gpu/drm/amd/ is amdgpu driver顶layerdirectory, below面按function划分multiple子directory. 最coreis amdgpu/(GPU devicemanagement, command submission, memory management等), display/dc/(Display Core displayengine, 约占entiredrivercode量 40%), amdkfd/(KFD, Kernel Fusion Driver, ROCm computekernelinterface)and pm/(power management, contain SMU and powerplay). understandeachdirectory职责is导航第一步. ',
              'amdgpu driverhas严格file命名specification. 以 IP Block versionasafter缀file(如 gfx_v11_0.c, sdma_v6_0.c, vcn_v4_0.c)ishardware代世代specificimplementation — v11_0 corresponding RDNA3  GFX engine, v6_0 corresponding RDNA3  SDMA engine. 以 amdgpu_ asbefore缀file(如 amdgpu_device.c, amdgpu_cs.c, amdgpu_vm.c)is跨代generallogic. thisspecificationlet你can快速判断afileisgeneralcodestillisspecifichardwareimplementation. ',
              'amdgpu_device.c isentiredrivercore枢纽 — 它contain amdgpu_device_init()(device initializationentry point), amdgpu_device_ip_init()(IP Block initialization循环)and GPU 复位logic. amdgpu_drv.c is PCI driverentry point, contain module_init, pciidlist and probe function. understand这twofilecallrelationshipisunderstandentiredriverstartupprocessbasics. ',
              'forcode导航, cscope and ctags iskerneldevelopment经典tool. inkernelsource code根directoryrun make cscope tags i.e.cangenerate索引data库. cscope coreabilityis"lookupallcall某functionlocation"(:cs find c function_name)and"lookupfunctiondefine"(:cs find g function_name), 这intracingcall链时极其高效. for现代 IDE user, clangd 配合 compile_commands.json canprovide更好体验 — run scripts/clang-tools/gen_compile_commands.py generatedata库after, VS Code  clangd 扩展canprovide精确跳转and补全. ',
              'CRITICAL SAFETY WARNING: Writing to incorrect MMIO register offsets will instantly hard-lock your entire system — no Ctrl+C, no SSH, only a power cycle recovers. This is not a software crash that the kernel can catch; it\'s a hardware-level hang caused by the GPU entering an unrecoverable state. In AMD\'s offices, engineers are told on day one: never touch MMIO registers without the hardware specification (which AMD provides under NDA). When learning, always use umr (read-only by default) to inspect registers, and test any register writes in a VM or spare machine. The amdgpu driver\'s WREG32/RREG32 macros are safe because they write to registers that AMD engineers have validated, but adding new register accesses requires hardware spec verification.',
            ],
            keyPoints: [
              'amdgpu/ — GPU core: devicemanagement, command submission(CS), virtual memory(VM), Buffer object(BO)',
              'display/dc/ — displayengine: 约 40% code量, hardware无关layer + DCN hardwarelayer',
              'amdkfd/ — computekernelinterface: ROCm/HIP kernel端, KFD doorbell, queuemanagement',
              'pm/ — power management: SMU firmware通信, DVFS, 功耗limit, 风扇control',
              '命名specification: *_v11_0 = RDNA3 GFX, *_v6_0 = RDNA3 SDMA, dcn32 = RDNA3 display',
              'amdgpu_device.c isdrivercore枢纽, amdgpu_drv.c is PCI entry point点',
            ],
          },
          diagram: {
            title: 'amdgpu driversource codedirectorystructure',
            content: `drivers/gpu/drm/amd/ — amdgpu driversource code顶layerstructure
├── amdgpu/                     ← GPU coresubsystem(~1.2M 行)
│   ├── amdgpu_drv.c            ← PCI driverentry point, module_init, pciidlist
│   ├── amdgpu_device.c         ← ★ core枢纽: device_init, ip_init, GPU 复位
│   ├── amdgpu_cs.c             ← command submission: amdgpu_cs_ioctl
│   ├── amdgpu_vm.c             ← GPU virtualmemory management
│   ├── amdgpu_object.c         ← Buffer Object (BO) management
│   ├── amdgpu_ring.c           ← Ring Buffer abstractionlayer
│   ├── amdgpu_fence.c          ← Fence synchronizationmechanism
│   ├── amdgpu_irq.c            ← interrupt handlingframework
│   ├── amdgpu_gmc.c            ← GPU Memory Controller generallayer
│   │
│   ├── gfx_v11_0.c             ← GFX IP: RDNA3 graphics/computeengine
│   ├── gfx_v10_0.c             ← GFX IP: RDNA2
│   ├── gfx_v9_0.c              ← GFX IP: GCN5 (Vega)
│   ├── sdma_v6_0.c             ← SDMA IP: RDNA3 DMA engine
│   ├── vcn_v4_0.c              ← VCN IP: RDNA3 视频编解码
│   ├── psp_v13_0.c             ← PSP IP: securityhandle器
│   └── nbio_v7_7.c             ← NBIO: 北桥 I/O
│
├── display/dc/                  ← Display Core(~1.6M 行, 最大subsystem)
│   ├── core/dc.c               ← DC core: dc_commit_state 等
│   ├── dc_stream.h             ← display流abstraction
│   ├── dcn32/                  ← RDNA3 DCN 3.2 hardwarelayer
│   ├── dcn321/                 ← RDNA3 DCN 3.2.1 变体
│   ├── dml/                    ← Display Mode Library(bandwidthcompute)
│   └── link/                   ← DP/HDMI 链路layer
│
├── amdkfd/                      ← Kernel Fusion Driver(~100K 行)
│   ├── kfd_device.c            ← KFD devicemanagement
│   ├── kfd_process.c           ← processqueuemanagement
│   ├── kfd_doorbell.c          ← Doorbell mapping(user-spacedirectlycommit)
│   └── kfd_chardev.c           ← /dev/kfd character device
│
├── pm/                          ← power management(~300K 行)
│   ├── swsmu/                  ← Software SMU interface
│   │   ├── smu13/              ← SMU v13(RDNA3)
│   │   └── amdgpu_smu.c       ← SMU generalabstractionlayer
│   └── powerplay/              ← 旧版power management(GCN 时代)
│
└── include/                     ← sharedheader file
    ├── amdgpu_ring.h           ← Ring Buffer data structure
    ├── amdgpu_vm.h             ← VM data structure
    └── asic_reg/               ← GPU registerdefine(automaticgenerate)
        └── gc/gc_11_0_0_offset.h  ← RDNA3 GFX registeraddress`,
            caption: 'amdgpu drivercompletedirectorystructure. display/dc/ is最大subsystem(约 40% code量), amdgpu/ iscoresubsystem. file名inversion号(v11_0, v6_0)directlycorresponding GPU hardware代次. ',
          },
          codeWalk: {
            title: 'amdgpu_device_init — driverinitializationcorecall链',
            file: 'drivers/gpu/drm/amd/amdgpu/amdgpu_device.c',
            language: 'c',
            code: `/* amdgpu_device_init() — from PCI probe call, initializationentire GPU device
 * 这is amdgpu driverin最corefunction之一, understand它call链
 * canunderstandentiredriverstartupprocess. 
 */
int amdgpu_device_init(struct amdgpu_device *adev,
                        uint32_t flags)
{
    /* stage 1: basicsset */
    adev->flags = flags;
    adev->asic_type = flags & AMD_ASIC_MASK;

    /* mapping GPU register空between(BAR 2)tokernelvirtual address */
    adev->rmmio_size = pci_resource_len(adev->pdev, 2);
    adev->rmmio = ioremap(pci_resource_start(adev->pdev, 2),
                           adev->rmmio_size);
    /* 此aftercanuse WREG32/RREG32 access GPU register */

    /* stage 2: IP find — 确定this GPU haswhich IP Block */
    r = amdgpu_discovery_set_ip_blocks(adev);
    /* according to GPU  IP Discovery 表, registrationall IP Block: 
     *   gfx_v11_0_ip_block (RDNA3 GFX)
     *   sdma_v6_0_ip_block (RDNA3 SDMA)
     *   psp_v13_0_ip_block (PSP)
     *   smu_v13_0_ip_block (SMU)
     *   dcn32_ip_block     (Display)
     *   ... 等等
     */

    /* stage 3: firmware loading */
    r = amdgpu_device_fw_loading(adev);

    /* stage 4: initializationall IP Block */
    r = amdgpu_device_ip_init(adev);
    /* traverseallregistration IP Block, 依次call: 
     *   ip_block->funcs->early_init(adev)  — 早期initialization
     *   ip_block->funcs->sw_init(adev)     — 软件layerinitialization
     *   ip_block->funcs->hw_init(adev)     — hardwareinitialization
     */

    /* stage 5: registration DRM device */
    r = amdgpu_device_register(adev);
    /* GPU 现incan接受user spacerequest */

    return 0;
}`,
            annotations: [
              'adev (struct amdgpu_device) isentiredriver最coredata structure, containall GPU state',
              'ioremap() will PCI BAR physical addressmappingtokernelvirtual address, afteronly thencan用 WREG32/RREG32',
              'amdgpu_discovery_set_ip_blocks() is RDNA2+ 引入dynamic IP findmechanism, 替代硬编码',
              'amdgpu_device_ip_init() 按dependencyorderinitializationall IP Block(PSP → GMC → GFX → ...)',
              'early_init → sw_init → hw_init 三stageinitialization保证dependencyrelationshipcorrecthandle',
              '任何stagereturn非零值allwillcause probe failure, corresponding dmesg in "hw_init of IP block <xxx> failed"',
            ],
            explanation: 'thisfunctionisunderstandentire amdgpu driver"地图". when你in dmesg in看todriverloadingfailure时, 几乎allcan追溯tothisfunction某个stage. 用 cscope tracing amdgpu_device_init call链(:cs find c amdgpu_device_init)islearndriverarchitecture最好起点. ',
          },
          miniLab: {
            title: 'use cscope lookup amdgpu_bo_create allcall者',
            objective: 'inkernelsource codeinuse cscope tracing amdgpu_bo_create call链, understand Buffer Object inwhichscenariobelowbycreate. ',
            setup: `cd ~/kernel-src
make cscope tags  # ifstill没generate索引`,
            steps: [
              'use cscope lookup amdgpu_bo_create define: cscope -d -L -1 amdgpu_bo_create',
              'lookupallcall amdgpu_bo_create location: cscope -d -L -3 amdgpu_bo_create',
              'willresultsavetofile: cscope -d -L -3 amdgpu_bo_create > /tmp/bo_create_callers.txt',
              'statisticscall者count: wc -l /tmp/bo_create_callers.txt',
              'view最commoncallscenario: cat /tmp/bo_create_callers.txt | awk -F: \'{print $1}\' | sort | uniq -c | sort -rn',
              'selectacall者(如 amdgpu_gem_create_ioctl), tracing它onlayercall: cscope -d -L -3 amdgpu_gem_create_ioctl',
            ],
            expectedOutput: `$ cscope -d -L -3 amdgpu_bo_create | head -5
drivers/gpu/drm/amd/amdgpu/amdgpu_gem.c 120 amdgpu_gem_create_ioctl ...
drivers/gpu/drm/amd/amdgpu/amdgpu_vram_mgr.c 85 ...
drivers/gpu/drm/amd/amdgpu/amdgpu_ttm.c 200 ...
drivers/gpu/drm/amd/amdgpu/amdgpu_amdkfd_gpuvm.c 340 ...

$ wc -l /tmp/bo_create_callers.txt
25     ← amdgpu_bo_create in约 25 个locationbycall`,
            hint: 'cscope  -L parameterrepresent line mode(非interaction), -1 lookupdefine, -3 lookupcall者, -0 lookup符号. if cscope data库过期, re-run make cscope update. ',
          },
          debugExercise: {
            title: 'in陌生codein快速locateissue',
            language: 'c',
            description: '你in dmesg in看tobelowerrorinformation. usecode导航技巧locateissue源fileandfunction. ',
            question: 'howthrough这条 dmesg errorinformationlocatetospecificsource codelocation? describeyour搜索step. ',
            buggyCode: `[drm:amdgpu_device_ip_init [amdgpu]] *ERROR*
  hw_init of IP block <gfx_v11_0> failed -22

/* 你needanswer: 
 * 1. 哪个filecontain gfx_v11_0  hw_init implementation? 
 * 2. error code -22 代表what? 
 * 3. how用 cscope/grep find确切failure点? 
 */`,
            hint: 'errorinformationin "gfx_v11_0" directlycorrespondingfile名命名specification. -22 isstandard Linux error code. ',
            answer: 'locatestep: (1)file名directlyfrom IP Block 名推导: gfx_v11_0 → gfx_v11_0.c, completepath drivers/gpu/drm/amd/amdgpu/gfx_v11_0.c. (2)error code -22 = -EINVAL(Invalid argument), lookupapproach: grep -r "define EINVAL" include/uapi/asm-generic/errno-base.h. (3)用 cscope 找 hw_init implementation: 先搜索 gfx_v11_0_hw_init(命名specificationis IP名_operate名), cscope -d -L -1 gfx_v11_0_hw_init willdirectlylocatetodefine. (4)in该functionin搜索 return -EINVAL or return r(where r mayisfrom子function传播error code). (5)更精确method: enabledynamicdebugging(echo "file gfx_v11_0.c +p" > /sys/kernel/debug/dynamic_debug/control)then重现issue, dmesg willdisplayfunction内detailedexecutepath. 这种from dmesg 反向locatesource codeabilityis GPU driverdebuggingcoreskill. ',
          },
          interviewQ: {
            question: 'describe amdgpu driversource codedirectorystructure. iflet你fixa RDNA3 GPU display闪烁issue, 你willfromwhichfilestart看? ',
            difficulty: 'medium',
            hint: '先describe顶layerdirectory(amdgpu/, display/dc/, pm/, amdkfd/), then针对displayissuelocateto display/dc/ and dcn32/. ',
            answer: 'amdgpu driver顶layerdirectory drivers/gpu/drm/amd/ contain四个core子directory: (1)amdgpu/ — GPU coresubsystem: devicemanagement(amdgpu_device.c), command submission(amdgpu_cs.c), virtual memory(amdgpu_vm.c), interrupt(amdgpu_irq.c), 各 IP Block hardwareimplementation(gfx_v11_0.c 等); (2)display/dc/ — Display Core: 约占 40% code量, containhardware无关corelayer(core/dc.c)andhardwarerelatedlayer(dcn32/ 等); (3)amdkfd/ — ROCm computekernelinterface; (4)pm/ — power management(SMU 通信, DVFS). for RDNA3 display闪烁issue, 我willfromthesefilestart: (a)display/dc/dcn32/ — RDNA3  DCN 3.2 hardwarelayer, check时序(timing)and水印(watermark)compute; (b)display/dc/core/dc.c — dc_commit_state() functioncheckstatecommitlogic; (c)display/dc/dml/ — Display Mode Library bandwidthcomputewhethercorrect; (d)dmesg in搜索 "dc_commit" and "underflow" key词locatespecificstage. meanwhile用 git log -- display/dc/dcn32/ view最近modifywhether引入回归. ',
            amdContext: 'thisissue考察你对code库熟悉程度anddebugging思路. AMD interviewerwill评估你can否fromissuedescribe快速缩小搜索rangetospecificfile. ',
          },
        },

        // ── Lesson 5.1.2 ──────────────────────────────────────
        {
          id: '5-1-2',
          number: '5.1.2',
          title: 'IP Block architecture: GPU functionmodule化design',
          titleEn: 'IP Block Architecture: Modular GPU Design',
          duration: 20,
          difficulty: 'expert',
          tags: ['IP-block', 'amdgpu_ip_block', 'modular', 'hw_init', 'callbacks'],
          concept: {
            summary: 'amdgpu driverwill GPU eachhardwarefunction单元(GFX, SDMA, DC, VCN, PSP, SMU 等)abstractionas IP Block, each IP Block implementation统一callbackinterface(early_init/sw_init/hw_init/suspend/resume 等). 这种module化design使得drivercan用同一套frameworksupportfrom GCN to RDNA4 all AMD GPU. ',
            explanation: [
              'IP Block(Intellectual Property Block)is AMD GPU hardwaremodule化design理念软件mapping. inhardwarelayer面, a GPU 芯片由multipleindependentfunction单元组成: GFX(graphics/computeengine), SDMA(System DMA engine), VCN(Video Core Next 视频编解码), DCN(Display Controller Next display control器), PSP(Platform Security Processor securityhandle器), SMU(System Management Unit power management)等. eachfunction单元in软件incorrespondinga IP Block. ',
              'struct amdgpu_ip_block_version definea IP Block 元data(type, version号), struct amd_ip_funcs define统一callbackinterface. each IP Block mustimplementationbelowcorecallback: name(IP Block 名称), early_init(早期initialization, checkhardwareability), sw_init(软件resourceallocation, 如memory/queue), hw_init(hardwareinitialization, 写register/loadingfirmware), hw_fini(hardware反initialization), sw_fini(release软件resource), suspend/resume(power management). 这套interface使得 amdgpu_device_ip_init() can用a统一循环initializationall IP Block, 而notneedknoweach IP specificimplementation. ',
              '以 RDNA3  GFX engineas例, gfx_v11_0.c implementation gfx_v11_0_ip_funcs structure体, 其 hw_init callback(gfx_v11_0_hw_init)will: loading GFX firmwareto GPU, configurationshaderengine(Shader Engine)count, initialization Ring Buffer(GFX Ring, Compute Ring), startup Command Processor(CP). if AMD publish新一代 GPU(如 RDNA4), 只need新增a gfx_v12_0.c fileimplementation同样interface, coreframeworkcode无需modify. ',
              'IP Block initializationorder很important — existdependencyrelationship. PSP must先initialization(becauseother IP Block firmwareneed PSP verify签名), GMC(Graphics Memory Controller)mustin GFX beforeinitialization(because GFX need GPU virtual memorysupport), SMU mustin GFX beforeinitialization(because GFX need时钟and电压). thisorder由 amdgpu_discovery_set_ip_blocks() inregistrationorder决定. ',
            ],
            keyPoints: [
              'IP Block = GPU hardwarefunction单元软件abstraction(GFX, SDMA, VCN, DCN, PSP, SMU)',
              'struct amd_ip_funcs define统一callbackinterface: early_init/sw_init/hw_init/suspend/resume 等',
              'amdgpu_device_ip_init() 用统一循环initializationall IP Block, not关心specificimplementation',
              'initializationorderhasdependency: PSP → GMC → SMU → GFX → SDMA → VCN → DC',
              '命名specification: gfx_v11_0 (RDNA3), gfx_v10_0 (RDNA2), gfx_v9_0 (Vega/GCN5)',
              'IP Discovery 表(RDNA2+)let GPU 自describe其 IP Block 组成, 替代硬编码list',
            ],
          },
          diagram: {
            title: 'IP Block architectureandinitializationprocess',
            content: `amdgpu IP Block architecture

┌─────────────────────────────────────────────────────────────────┐
│  struct amd_ip_funcs (统一callbackinterface)                            │
│  ┌──────────┬──────────┬──────────┬──────────┬──────────┐      │
│  │early_init│ sw_init  │ hw_init  │ suspend  │ resume   │      │
│  │checkability  │allocationresource  │写register  │savestate  │recoverstate  │      │
│  │          │(memory/queue)│loadingfirmware  │断电准备  │re-initialization│      │
│  └──────────┴──────────┴──────────┴──────────┴──────────┘      │
└──────────────────────────┬──────────────────────────────────────┘
                           │ each IP Block implementation这套interface
    ┌──────────────────────┼──────────────────────────────┐
    ▼                      ▼                              ▼
┌──────────┐     ┌──────────────┐     ┌──────────────────────┐
│ PSP      │     │ GFX          │     │ DC (Display Core)    │
│ v13_0    │     │ v11_0 (RDNA3)│     │ DCN 3.2 (RDNA3)     │
│          │     │              │     │                      │
│ hw_init: │     │ hw_init:     │     │ hw_init:             │
│ ·loading PSP│     │ ·loading GFX FW │     │ ·initializationdisplaypipeline      │
│  firmware    │     │ ·configuration SE/CU  │     │ ·detect连接display器    │
│ ·verifysecurity│     │ ·initialization Ring │     │ ·setdefault分辨率      │
│  签名    │     │ ·startup CP     │     │                      │
└────┬─────┘     └──────┬───────┘     └──────────┬───────────┘
     │                  │                         │
     ▼                  ▼                         ▼
┌──────────┐     ┌──────────────┐     ┌──────────────────────┐
│ SMU      │     │ SDMA         │     │ VCN                  │
│ v13_0    │     │ v6_0 (RDNA3) │     │ v4_0 (RDNA3)        │
│          │     │              │     │                      │
│ hw_init: │     │ hw_init:     │     │ hw_init:             │
│ ·initialization  │     │ ·loading SDMA FW│     │ ·loading VCN firmware       │
│  SMU通信 │     │ ·initialization SDMA │     │ ·initialization编解码engine    │
│ ·setdefault│     │  Ring Buffer │     │ ·configuration DPG pattern       │
│  功耗limit│     │              │     │                      │
└──────────┘     └──────────────┘     └──────────────────────┘

initializationorder(amdgpu_device_ip_init intraverseorder): 

  PSP ──→ GMC ──→ IH ──→ SMU ──→ GFX ──→ SDMA ──→ VCN ──→ DC
  security     memory    interrupt    电源    graphics     DMA     视频    display
  │                                │
  └── GFX firmware签名need PSP        └── GFX need GMC(virtual memory)
                                      and SMU(时钟/电压)`,
            caption: 'IP Block architecturecore思想: eachhardwarefunction单元implementation统一callbackinterface, driverframeworkthrough循环callinitializationall IP Block. initializationorder由dependencyrelationship决定. ',
          },
          codeWalk: {
            title: 'gfx_v11_0_ip_block — RDNA3 GFX IP Block define',
            file: 'drivers/gpu/drm/amd/amdgpu/gfx_v11_0.c',
            language: 'c',
            code: `/* gfx_v11_0.c — RDNA3 GFX IP Block callbackimplementation */

/* callback function表: eachfunctionhandlealifecyclestage */
static const struct amd_ip_funcs gfx_v11_0_ip_funcs = {
    .name = "gfx_v11_0",
    .early_init = gfx_v11_0_early_init,
    .sw_init = gfx_v11_0_sw_init,
    .hw_init = gfx_v11_0_hw_init,
    .hw_fini = gfx_v11_0_hw_fini,
    .sw_fini = gfx_v11_0_sw_fini,
    .suspend = gfx_v11_0_suspend,
    .resume = gfx_v11_0_resume,
    .is_idle = gfx_v11_0_is_idle,
    .wait_for_idle = gfx_v11_0_wait_for_idle,
    .set_clockgating_state = gfx_v11_0_set_clockgating_state,
    .set_powergating_state = gfx_v11_0_set_powergating_state,
};

/* IP Block versioninformation */
const struct amdgpu_ip_block_version gfx_v11_0_ip_block = {
    .type = AMD_IP_BLOCK_TYPE_GFX,
    .major = 11,
    .minor = 0,
    .rev = 0,
    .funcs = &gfx_v11_0_ip_funcs,
};

/* hw_init example(大幅简化)*/
static int gfx_v11_0_hw_init(void *handle)
{
    struct amdgpu_device *adev = (struct amdgpu_device *)handle;
    int r;

    /* 1. loading GFX engine微码to GPU */
    r = gfx_v11_0_cp_resume(adev);
    if (r)
        return r;

    /* 2. initialization GFX Ring Buffer */
    r = amdgpu_ring_test_helper(&adev->gfx.gfx_ring[0]);
    if (r)
        return r;

    /* 3. initialization Compute Ring Buffers */
    for (i = 0; i < adev->gfx.num_compute_rings; i++) {
        r = amdgpu_ring_test_helper(
            &adev->gfx.compute_ring[i]);
        if (r)
            return r;
    }
    return 0;
}

/* amdgpu_device_ip_init in统一initialization循环(简化)*/
int amdgpu_device_ip_init(struct amdgpu_device *adev)
{
    for (i = 0; i < adev->num_ip_blocks; i++) {
        r = adev->ip_blocks[i].version->funcs->hw_init(
            (void *)adev);
        if (r) {
            DRM_ERROR("hw_init of IP block <%s> failed %d\\n",
                adev->ip_blocks[i].version->funcs->name, r);
            return r;
        }
    }
    return 0;
}`,
            annotations: [
              'gfx_v11_0_ip_funcs 表willallcallback聚合asastructure体, 由frameworkthroughfunction pointercall',
              'AMD_IP_BLOCK_TYPE_GFX is枚举值, 区分 GFX/SDMA/VCN/DC 等differenttype IP',
              'major=11, minor=0 corresponding IP version 11.0, in IP Discovery 表inmatch',
              'hw_init in cp_resume loading Command Processor 微码 — CP is GPU commandexecuteentry point',
              'amdgpu_ring_test_helper 向 Ring Buffer writetestingcommand并verify GPU response',
              'amdgpu_device_ip_init 循环demonstrateframeworkhow统一handleall IP Block initialization',
            ],
            explanation: 'thiscodedemonstrate IP Block pattern精髓: gfx_v11_0.c 只needimplementation amd_ip_funcs interface, frameworkcode amdgpu_device_ip_init() canautomaticinitialization它. when RDNA4 publish时, 只需新增 gfx_v12_0.c implementation同样interface, notneedmodifyframeworkcode. 这种design使得 amdgpu can用adriversupportall AMD GPU 代次. ',
          },
          miniLab: {
            title: '列出your GPU all IP Block 及其version',
            objective: 'through debugfs view你手头 AMD GPU(example以 RX 7600 XT / gfx1102 as参考)onactualrunall IP Block, verifycodein IP Block registration. ',
            setup: '# ensure debugfs already挂载\nsudo mount -t debugfs none /sys/kernel/debug 2>/dev/null',
            steps: [
              'view IP Block information: sudo cat /sys/kernel/debug/dri/0/amdgpu_firmware_info',
              'view IP find表: sudo cat /sys/kernel/debug/dri/0/amdgpu_ip_discovery 2>/dev/null || echo "need较新kernelversion"',
              'from dmesg extract IP Block initializationorder: dmesg | grep -i "ip block\\|hw_init\\|sw_init"',
              'view GFX IP version: dmesg | grep -i "gfx.*v[0-9]"',
              'insource codeinverify: grep -rn "gfx_v11_0_ip_block" drivers/gpu/drm/amd/amdgpu/',
              'compareother IP Block version: dmesg | grep -iE "(sdma|vcn|psp|smu|dcn).*v[0-9]"',
            ],
            expectedOutput: `$ sudo cat /sys/kernel/debug/dri/0/amdgpu_firmware_info
GFX ME feature version: 86, firmware version: 0x...
GFX PFP feature version: 86, firmware version: 0x...
SDMA0 feature version: 60, firmware version: 0x...
VCN feature version: 0, firmware version: 0x...
...

Navi33 (RDNA3)  IP Block 组成: 
  GFX 11.0, SDMA 6.0, VCN 4.0, DCN 3.2, PSP 13.0, SMU 13.0`,
            hint: 'if debugfs pathnotexistorpermissionnot够, 用 dmesg information代替. debugfs pathmayis /sys/kernel/debug/dri/0/ or /sys/kernel/debug/dri/1/, 取决于your GPU is card0 stillis card1. ',
          },
          debugExercise: {
            title: 'IP Block initializationorderdependencyfailure',
            language: 'c',
            description: 'belowcodetryin GFX IP Block beforeregistration并initialization DC(Display Core), 但causestartupfailure. ',
            question: 'why调换 DC and GFX initializationorderwillcausefailure? errorinformationiswhat? ',
            buggyCode: `/* error IP Block registrationorder */
int amdgpu_discovery_set_ip_blocks(struct amdgpu_device *adev)
{
    /* ... PSP, GMC, SMU 正常registration ... */

    /* BUG: DC in GFX beforeregistration */
    amdgpu_device_ip_block_add(adev, &dcn32_ip_block);
    amdgpu_device_ip_block_add(adev, &gfx_v11_0_ip_block);

    /* 原本correctordershouldis: 
     * amdgpu_device_ip_block_add(adev, &gfx_v11_0_ip_block);
     * amdgpu_device_ip_block_add(adev, &dcn32_ip_block);
     */
    return 0;
}`,
            hint: 'DC initializationdependency GFX Ring Buffer senddisplayrelated GPU command(如 cursor update). ',
            answer: 'DC(Display Core)initializationdependency GFX enginealreadyready, causehas: (1)DC needthrough GFX Ring Buffer commitcertaindisplayoperate GPU command(如hardware光标update, 3D LUT loading); (2)DC initializationprocessinneedallocation GPU canaccessmemory(如 framebuffer), 这to求 GMC and GFX virtual addressmappingalreadywork; (3)DC in hw_init inwilltry做 mode setting 并点亮display器, 这need向 GPU commitcommand. if GFX still没initialization, Ring Buffer notexist, DC command submissionwillfailure, dmesg inwill看tosimilar "[drm:dc_commit_state_no_check] *ERROR* dc_commit_state_no_check failed" ordirectly "hw_init of IP block <dm> failed -22". correctorderis PSP → GMC → IH → SMU → GFX → SDMA → VCN → DC/DM, DC 始终in GFX after. ',
          },
          interviewQ: {
            question: 'explain amdgpu driver IP Block architecture. 这种designpatternhaswhat优缺点? ',
            difficulty: 'hard',
            hint: 'from软件designpattern(strategypattern/interfaceabstraction), can维护性(support多代 GPU), and潜inissue(IP betweendependency, error传播)角度analyze. ',
            answer: 'IP Block architectureis amdgpu drivercoredesignpattern, 本质onisstrategypattern(Strategy Pattern)inkerneldriverinapplication. each IP Block through struct amd_ip_funcs define统一interface, frameworkcodethroughfunction pointercallspecificimplementation. 优点: (1)support多代 GPU — 新 GPU 只需新增 IP implementationfile, frameworknot变; (2)canindependentdevelopmentandtesting — DC teamand GFX teamcanindependentwork; (3)清晰lifecyclemanagement — init/fini/suspend/resume entire统一; (4)便于error隔离 — 某个 IP Block initializationfailurecan精确locate. 缺点: (1)IP Block betweenimplicitdependency — initializationorder由registrationorder决定, dependencyrelationshipnotintypesystemin体现; (2)过度abstraction — certain IP Block has独特需求, by迫适配统一interfacewillcause workaround; (3)error传播not够细粒度 — hw_init failure只returnaerror code, 丢失context; (4)code膨胀 — each IP versionallhasselffile, 很多codeindifferentversionbetween重复. AMD 正inthrough IP Discovery mechanismand公共codeextract缓解theseissue. ',
            amdContext: 'thisissue考察你对driverarchitecture深layerunderstand. AMD interviewerwill特别note你can否客观analyze优缺点, 而not只is赞美thisdesign. 提to IP betweendependencyissueandcode重复is加分项. ',
          },
        },
      ],
    },

    // ════════════════════════════════════════════════════════════
    // Group 5.2: Command Submission & Synchronization
    // ════════════════════════════════════════════════════════════
    {
      id: '5-2',
      number: '5.2',
      title: 'command submissionandsynchronization',
      titleEn: 'Command Submission & Synchronization',
      icon: 'Radio',
      description: '深入 GPU command submissioncompletepath — fromuser space ioctl to Ring Buffer againto GPU execute, and Fence synchronizationmechanismhow协调 CPU and GPU. ',
      lessons: [
        // ── Lesson 5.2.1 ──────────────────────────────────────
        {
          id: '5-2-1',
          number: '5.2.1',
          title: 'GPU command submission: from ioctl to Ring Buffer',
          titleEn: 'GPU Command Submission: From ioctl to Ring Buffer',
          duration: 20,
          difficulty: 'expert',
          tags: ['command-submission', 'ioctl', 'ring-buffer', 'PM4', 'IB', 'doorbell'],
          concept: {
            summary: 'GPU command submissionisdriver最coredata通路: user spacethrough DRM_IOCTL_AMDGPU_CS commitcommand, driververify并parsecommand packet(IB), will其write Ring Buffer, finallywrite Doorbell registernotify GPU  Command Processor(CP)startexecute. understand这条pathisunderstand GPU workprinciplekey. ',
            explanation: [
              'command submission(Command Submission, CS)is GPU execute任何work起点. regardless ofisrendering一帧游戏stillisruna AI 推理任务, allneedwill GPU commandfrom CPU committo GPU. in amdgpu in, 这条pathfromuser space ioctl(fd, DRM_IOCTL_AMDGPU_CS, &cs) start, to GPU  Command Processor read Ring Buffer incommandend. ',
              'GPU command以 PM4(Packet Manager 4)format编码 — 这is AMD GPU 自 R600 以usecommand packetformat. each PM4 包由头部(type, opcode, count)anddata体组成. user space Mesa driver(radeonsi/radv)responsible forwill OpenGL/Vulkan API callcompilationas PM4 command packet序列, storagein IB(Indirect Buffer)in. IB is一block GPU canaccessmemory, contain一组contiguous PM4 command. ',
              'amdgpu_cs_ioctl() iskernelinhandlecommand submissionentry pointfunction. 它workprocess: (1)amdgpu_cs_parser_init() parse ioctl parameter, verifyuser传入 IB addressandsize; (2)amdgpu_cs_parser_bos() verifyandmappingcommand引用all Buffer Object(ensure GPU canaccessthey); (3)amdgpu_cs_submit() will IB 引用write Ring Buffer — Ring Buffer notdirectlycontaincompletecommand, but rathercontain指向 IB pointer(INDIRECT_BUFFER PM4 包), GPU  CP will跟随thispointer IB inreadactualcommand. ',
              'Ring Buffer is CPU and GPU 之betweencore通信mechanism. 它is一blockringmemoryregion, CPU through WPTR(Write Pointer)write新command, GPU  CP through RPTR(Read Pointer)readcommand. when CPU write新commandafter, update WPTR 并write Doorbell register — this MMIO writewillgenerateahardwareinterrupt, notify CP "has新command". CP compare RPTR and WPTR, if WPTR > RPTR indicatehas新command待handle. 每种 IP Block hasself Ring: GFX Ring(graphics/computecommand), SDMA Ring(DMA transfercommand), VCN Ring(视频编解码command). ',
            ],
            keyPoints: [
              'CS path: ioctl → amdgpu_cs_ioctl → parser → verify BO → write Ring Buffer → Doorbell',
              'PM4 command packet: AMD GPU standardcommandformat, 由 Mesa(user-space)build',
              'IB(Indirect Buffer): GPU canaccessmemory, 存放actual PM4 command序列',
              'Ring Buffer is CPU-GPU 通信ring FIFO, WPTR(CPU 写)/ RPTR(GPU 读)',
              'Doorbell is MMIO registerwrite, notify GPU Command Processor has新command',
              'each IP Block hasindependent Ring: GFX Ring, SDMA Ring, VCN Enc/Dec Ring',
            ],
          },
          diagram: {
            title: 'command submissioncompletepath',
            content: `GPU command submissioncompletedata通路

user space(Mesa radeonsi/radv)
┌─────────────────────────────────────────────────────────────┐
│  1. Mesa build PM4 command packet, write IB(Indirect Buffer)        │
│                                                              │
│  IB (GPU canaccessmemory):                                       │
│  ┌────────────────────────────────────────────────────┐     │
│  │ [PKT3_SET_SH_REG: setshaderregister]                 │     │
│  │ [PKT3_SET_CONTEXT_REG: setpipelinestate]                │     │
│  │ [PKT3_DRAW_INDEX_AUTO: execute绘制, count=36]          │     │
│  │ [PKT3_EVENT_WRITE: flushcache]                        │     │
│  └────────────────────────────────────────────────────┘     │
│                                                              │
│  2. libdrm call ioctl(fd, DRM_IOCTL_AMDGPU_CS, &cs)       │
└───────────────────────────────┬─────────────────────────────┘
                                │ ioctl system call
═══════════════════════════════════════════════════════════════
                                │
kernel space(amdgpu driver)         ▼
┌─────────────────────────────────────────────────────────────┐
│  3. amdgpu_cs_ioctl()                                       │
│     ├─ amdgpu_cs_parser_init()   → parse ioctl parameter         │
│     ├─ amdgpu_cs_parser_bos()    → verify/mappingall BO         │
│     ├─ amdgpu_cs_dependencies()  → handle fence dependency         │
│     └─ amdgpu_cs_submit()        → committoscheduler             │
│                                                              │
│  4. GPU Scheduler (drm_sched)                               │
│     └─ amdgpu_job_run()          → will IB write Ring          │
│                                                              │
│  5. write Ring Buffer:                                       │
│     ┌──────────────────────────────────────────────────┐    │
│     │ Ring Buffer (GFX Ring):                          │    │
│     │                                                   │    │
│     │  RPTR ──→ [alreadyexecutecommand...]                       │    │
│     │            [alreadyexecutecommand...]                       │    │
│     │            [PKT3_INDIRECT_BUFFER: addr=IB, sz=64] │ ← WPTR
│     │            [空...]                                │    │
│     │            [空...]                                │    │
│     └──────────────────────────────────────────────────┘    │
│                                                              │
│  6. writel(wptr, adev->wb.wb[ring->wptr_offs])              │
│     writel(wptr, ring->doorbell_ptr)                        │
│     ↑ Doorbell writenotify GPU Command Processor                │
└───────────────────────────────┬─────────────────────────────┘
                                │
GPU hardware                        ▼
┌─────────────────────────────────────────────────────────────┐
│  7. Command Processor (CP) detectto WPTR > RPTR               │
│     ├─ from Ring read PKT3_INDIRECT_BUFFER                    │
│     ├─ 跟随pointerto IB address                                    │
│     ├─ parse IB in PM4 command                                 │
│     └─ driver Shader Engine execute                               │
│                                                              │
│  8. executecompleteafter:                                              │
│     ├─ update RPTR                                             │
│     ├─ write fence 值tomemory(notify CPU complete)                  │
│     └─ triggerinterrupt(can选)                                      │
└─────────────────────────────────────────────────────────────┘`,
            caption: 'GPU command submissioncompletedata通路. keyis Ring Buffer notdirectlycontainentirecommand — 它through INDIRECT_BUFFER 包指向 IB, CP 跟随pointerreadactualcommand. 这种between接approachallowcommit任意sizecommand序列. ',
          },
          codeWalk: {
            title: 'amdgpu_cs_ioctl — command submissionentry point(简化)',
            file: 'drivers/gpu/drm/amd/amdgpu/amdgpu_cs.c',
            language: 'c',
            code: `/* amdgpu_cs_ioctl() — handle DRM_IOCTL_AMDGPU_CS corefunction
 * 这is GPU execute任何work起点
 */
int amdgpu_cs_ioctl(struct drm_device *dev, void *data,
                     struct drm_file *filp)
{
    struct amdgpu_device *adev = drm_to_adev(dev);
    union drm_amdgpu_cs *cs = data;
    struct amdgpu_cs_parser parser = {};
    int r;

    /* stage 1: parseuser传入command submissionrequest */
    r = amdgpu_cs_parser_init(&parser, adev, filp, cs);
    /* verify IB count, Ring type, priority等parameter
     * parse chunk 数组: IB chunk, dependency chunk, 
     *                   syncobj chunk 等 */

    /* stage 2: handle Buffer Object list */
    r = amdgpu_cs_parser_bos(&parser, data);
    /* forcommand引用each BO: 
     *   - verifyuserhas权access该 BO
     *   - ensure BO in GPU canaccesslocation(VRAM/GTT)
     *   - 必to时migration BO(如from GTT 移to VRAM)
     *   - update GPU page tablemapping */

    /* stage 3: handle fence dependency */
    r = amdgpu_cs_dependencies(adev, &parser);
    /* if此commanddependencybeforecommandcomplete, 
     * willdependency fence addtoschedulerdependencylist */

    /* stage 4: committo GPU scheduler */
    r = amdgpu_cs_submit(&parser, cs);
    /* create amdgpu_job, committo drm_gpu_scheduler
     * schedulerfinalcall amdgpu_job_run(): 
     *   - will INDIRECT_BUFFER PM4 包write Ring
     *   - write Doorbell notify GPU */

    return r;
}

/* Ring Buffer writecoreoperate(简化)*/
void amdgpu_ring_commit(struct amdgpu_ring *ring)
{
    /* update WPTR(写pointer)*/
    uint64_t wptr = ring->wptr;

    /* write Doorbell register — 这一步trigger GPU startexecute */
    if (ring->use_doorbell) {
        atomic64_set((atomic64_t *)ring->doorbell_ptr, wptr);
        WDOORBELL64(ring->doorbell_index, wptr);
    } else {
        /* 老 GPU use MMIO 写 WPTR register */
        WREG32(ring->wptr_reg, lower_32_bits(wptr));
    }
}`,
            annotations: [
              'amdgpu_cs_parser_init willuser space ioctl parameterparseaskernelcanhandlestructure体',
              'amdgpu_cs_parser_bos is最耗时stage — 涉及 BO verifyandmaymemorymigration',
              'fence dependencyensure GPU 按correctorderexecutecommand(如先completedataon传againstartrendering)',
              'drm_gpu_scheduler is DRM general GPU scheduler, handle多process公平scheduling',
              'Doorbell is RDNA seriesmain CP notifymechanism, 比传统 MMIO 写 WPTR 更高效',
              'atomic64_set + WDOORBELL64 ensure 64 位 WPTR atomicwrite',
            ],
            explanation: '这is amdgpu driverin最频繁executecodepath — 每秒mayexecute数百to数千次. understandthispathisunderstand GPU howexecuteworkbasics. eachstageperformanceall很key: parser stage BO verify开销isuser-spacedriver(Mesa)尽量batchcommitcommandcause. ',
          },
          miniLab: {
            title: 'use ftrace tracingcommand submissionpath',
            objective: 'use ftrace tracing amdgpu_cs_ioctl execute, observerealcommand submission耗时andcall链. ',
            setup: `# ensure ftrace available
sudo mount -t tracefs nodev /sys/kernel/tracing 2>/dev/null
# 准备a GPU work负载
sudo apt install -y mesa-utils`,
            steps: [
              'set ftrace tracing amdgpu_cs_ioctl: echo amdgpu_cs_ioctl > /sys/kernel/tracing/set_ftrace_filter',
              'enablefunction图tracing: echo function_graph > /sys/kernel/tracing/current_tracer',
              'starttracing: echo 1 > /sys/kernel/tracing/tracing_on',
              'run GPU 负载: glxgears & sleep 2 && kill %1',
              'stoptracing: echo 0 > /sys/kernel/tracing/tracing_on',
              'viewresult: head -100 /sys/kernel/tracing/trace',
            ],
            expectedOutput: `$ head -50 /sys/kernel/tracing/trace
# tracer: function_graph
#
#  DURATION    |  FUNCTION CALLS
#              |  |  |  |
  12.345 us    |  amdgpu_cs_ioctl() {
   0.234 us    |    amdgpu_cs_parser_init();
   5.678 us    |    amdgpu_cs_parser_bos() {
   3.456 us    |      amdgpu_bo_list_get();
   1.234 us    |      ttm_eu_reserve_buffers();
               |    }
   2.345 us    |    amdgpu_cs_submit() {
   0.567 us    |      amdgpu_job_submit();
   0.890 us    |      amdgpu_ring_commit();
               |    }
               |  }`,
            hint: 'need root permissionoperate ftrace. if set_ftrace_filter writefailure, checkkernelwhethercompilation CONFIG_FUNCTION_TRACER. tracing完记得关闭 ftrace 以avoidperformanceimpact. ',
          },
          debugExercise: {
            title: 'Ring Buffer overflow',
            language: 'c',
            description: 'belowscenarioin, GPU command submissionstartreturn -ENOMEM error, 但 VRAM stillhas大量idle空between. ',
            question: 'why VRAM has空between但command submissionstillfailure? howdiagnoseandresolve? ',
            buggyCode: `/* userreporterrorinformation */
dmesg:
[drm:amdgpu_ring_alloc [amdgpu]] *ERROR*
  ring gfx_0.0.0 is full (wptr=0x1FFF0, rptr=0x00010)
amdgpu_cs_ioctl returned -12   /* -ENOMEM */

/* GPU state */
VRAM: 2048MB / 8192MB used     (大量idle!)
GTT:  512MB / 8192MB used      (大量idle!)

/* application行as */
applicationin快速循环incommitcommand, nowaitbeforecommandcomplete
while (rendering) {
    submit_gpu_command();  /* no任何 fence wait! */
}`,
            hint: 'Ring Buffer sizeis固定(usually 256KB-1MB), 而is notdynamic增长. WPTR 追on RPTR 意味着what? ',
            answer: 'issueis Ring Buffer overflow(ring full), rather than VRAM not足. Ring Buffer is固定sizering FIFO — when WPTR 追on RPTR(i.e. CPU writecommand速度exceed GPU executecommand速度), ring 满. dmesg in "wptr=0x1FFF0, rptr=0x00010" indicate WPTR 几乎绕一圈追on RPTR. 根因: applicationin快速循环incommitcommand但fromnotwait(fence wait), cause Ring 积压. resolveplan: (1)applicationlayer面 — incommitcommandafter适when做 fence wait, oruse fence callbackasynchronouswait; (2)driverlayer面 — amdgpu_ring_alloc() in ring full 时shouldwait(spin/sleep)直to RPTR before进, rather than立i.e.returnerror; actualdriverin确实has amdgpu_ring_test_helper timeoutwaitlogic. (3)调优layer面 — 增大 Ring Buffer size(amdgpu.gfx_ring_size moduleparameter)can增加缓冲. keyunderstand: VRAM 空betweenand Ring Buffer 空betweeniscompletelydifferentresource — Ring 满not代表memorynot足. ',
          },
          interviewQ: {
            question: 'describe amdgpu ina GPU commandfromuser spacecommitto GPU executecompletecompletepath. ',
            difficulty: 'hard',
            hint: '按orderdescribe: ioctl → parser → BO verify → scheduler → Ring write → Doorbell → CP execute → fence completenotify. ',
            answer: 'completepath: (1)user space Mesa through libdrm call ioctl(fd, DRM_IOCTL_AMDGPU_CS, &cs), parametercontain IB address, BO list, fence dependency; (2)kernel amdgpu_cs_ioctl() entry point, amdgpu_cs_parser_init() parseparameter, verify IB countand Ring type; (3)amdgpu_cs_parser_bos() 对command引用all BO execute TTM reserve(reservation), verify GPU mapping, 必to时execute BO migration(GTT→VRAM)andpage tableupdate; (4)amdgpu_cs_dependencies() will syncobj/timeline dependencyconvertas dma_fence dependency; (5)create amdgpu_job 并committo drm_gpu_scheduler, scheduleraccording to Ring typeandpriorityqueued; (6)schedulerselect job execute时, call amdgpu_job_run() — 它will INDIRECT_BUFFER PM4 包(contain IB addressandsize)write GFX Ring Buffer; (7)call amdgpu_ring_commit() update WPTR 并write Doorbell register; (8)GPU Command Processor(CP)detectto WPTR > RPTR, from Ring read INDIRECT_BUFFER 包, 跟随pointerto IB address, parse PM4 commanddriver Shader Engine execute; (9)executecompleteafter GPU write fence 序列号tospecificmemoryaddress(writeback buffer), triggerinterrupt; (10)interrupt handlingfunction amdgpu_fence_process() check fence 序列号, signal related dma_fence, wakeupwait CPU thread. ',
            amdContext: '这is AMD interviewin高频technology深度issue. completedescribefrom ioctl to fence signal 全path, 并can指出eachstagecorrespondingfunction名, is区分"解概念"and"深入understandcode"key. ',
          },
        },

        // ── Lesson 5.2.2 ──────────────────────────────────────
        {
          id: '5-2-2',
          number: '5.2.2',
          title: 'Fence synchronizationmechanism: CPU-GPU 协调',
          titleEn: 'Fence Synchronization: CPU-GPU Coordination',
          duration: 20,
          difficulty: 'expert',
          tags: ['fence', 'dma_fence', 'synchronization', 'interrupt', 'gpu-hang'],
          concept: {
            summary: 'Fence is CPU and GPU 之betweensynchronization原语. GPU 每complete一批command向memoryinwritea递增序列号(fence 值), CPU throughcomparethis值判断 GPU 进度. amdgpu  fence mechanism建立inkernel dma_fence framework之on, supportblockwait, callbacknotifyandtimeoutdetect(GPU Hang detect). ',
            explanation: [
              'CPU and GPU isasynchronousexecute — CPU commitcommandafter GPU maystill没startexecute, GPU executecomplete时 CPU mayin做other事. Fence is连接这twoasynchronous世界桥梁. 最basic fence mechanism很simple: GPU 每complete一组commandafter, 向a约定memoryaddresswritea递增序列号(sequence number). CPU 想know GPU whethercomplete某个command, 只needreadthisaddress并compare序列号. ',
              'amdgpu  fence implementation建立inkernel dma_fence framework之on. amdgpu_fence_emit() incommand submission时向 Ring Buffer writea FENCE PM4 包 — when GPU executetothis包时, willwilla预allocation序列号write adev->fence_drv[ring_id].gpu_addr 指向memory. CPU 端 amdgpu_fence_process() readthisaddress, compare序列号, if GPU write值 >= 期望值,  signal corresponding dma_fence. ',
              'Fence waithas两种approach: (1)blockwait(dma_fence_wait) — CPU thread sleep 直to fence by signal, 适used formustwait GPU completescenario(如 glFinish); (2)callbacknotify(dma_fence_add_callback) — registrationcallback functionin fence signal 时asynchronousexecute, notblock CPU, 适used forpipelinescenario. GPU completecommandafterthroughinterruptnotify CPU — interrupt handlingfunctionin tasklet contextincall amdgpu_fence_process(), after者traverse该 Ring allnot yet signal  fence 并 signal alreadycomplete. ',
              'Fence timeoutis GPU Hang detectcoremechanism. drm_gpu_scheduler aseachcommit job setatimeout时between(default 10 秒). iftimeoutafter fence 仍not yet signal, scheduler认as GPU 发生 hang, trigger amdgpu_job_timedout(), start GPU 复位process. dmesg in "[drm] ring gfx_0.0.0 timeout" isthismechanismreport. understand fence timeout and GPU 复位processfordebugging GPU hang issue至关important. ',
            ],
            keyPoints: [
              'Fence 本质: GPU 向memory写递增序列号, CPU read并compare判断进度',
              'amdgpu_fence_emit(): in Ring ininsert FENCE PM4 包, GPU execute时write序列号',
              'amdgpu_fence_process(): interrupttrigger → read GPU write序列号 → signal dma_fence',
              'waitapproach: block(dma_fence_wait)vs callback(dma_fence_add_callback)',
              'GPU Hang detect: fence timeout(default 10s)→ amdgpu_job_timedout → GPU 复位',
              'Timeline Semaphore: has序序列号, support跨processand跨 Ring 细粒度synchronization',
            ],
          },
          diagram: {
            title: 'Fence synchronizationmechanismlifecycle',
            content: `Fence lifecycle: from emit to signal

时between ──────────────────────────────────────────────────────────→

CPU 端                          GPU 端
──────                          ──────

1. command submission
   amdgpu_cs_submit()
   │
   ├─ amdgpu_fence_emit()
   │  in Ring 尾部insert:
   │  [PM4 FENCE 包:
   │   addr=fence_gpu_addr,        Ring Buffer:
   │   seq=42]                     ┌──────────────────┐
   │                               │ ...other PM4 command   │
   │  create dma_fence              │ [INDIRECT_BUFFER] │
   │  (seq=42, unsignaled)         │ [FENCE addr seq=42]│ ← WPTR
   │                               └──────────────────┘
   ├─ ring_commit()
   │  写 Doorbell                     │
   │                                  │ GPU CP startexecute
   ▼                                  ▼
2. GPU executein
   CPU can做other事              GPU execute IB incommand
   or dma_fence_wait()           ├─ execute绘制command
   (sleep wait)                  ├─ executecomputecommand
   │                             └─ executeto FENCE PM4 包
   │                                │
   │                                ▼
3. GPU complete                      GPU will seq=42 write
                                 fence_gpu_addr memory
   fence_gpu_addr:               │
   [before: 41] → [现in: 42]       └─ triggerhardwareinterrupt
                                       │
4. interrupt handling                            │
   amdgpu_irq_handler()    ◄──────────┘
   └─ tasklet_schedule()
      └─ amdgpu_fence_process()
         │
         ├─ read *fence_gpu_addr → 42
         ├─ 42 >= 期望 42 ✓
         └─ dma_fence_signal(fence_42)
            │
            ├─ wakeupblockthread (dma_fence_wait return)
            └─ executeregistrationcallback (dma_fence_add_callback)

5. Fence timeout(GPU Hang scenario)
   if 10 秒after fence 仍not yet signal:
   drm_sched_job_timedout()
   └─ amdgpu_job_timedout()
      ├─ DRM_ERROR("ring gfx_0.0.0 timeout")
      ├─ dump GPU register (GRBM_STATUS 等)
      └─ amdgpu_device_gpu_recover()
         └─ GPU 复位 → re-initializationall IP Block`,
            caption: 'Fence completelifecycle. 正常path: emit → GPU execute → 写序列号 → interrupt → signal. 异常path: timeout → GPU hang detect → 复位. fence_gpu_addr 指向memoryis CPU and GPU 之betweenshared"信箱". ',
          },
          codeWalk: {
            title: 'amdgpu_fence_emit and amdgpu_fence_process',
            file: 'drivers/gpu/drm/amd/amdgpu/amdgpu_fence.c',
            language: 'c',
            code: `/* amdgpu_fence_emit() — in Ring ininsert fence command
 * each timecommand submission时call
 */
int amdgpu_fence_emit(struct amdgpu_ring *ring,
                       struct dma_fence **f,
                       struct amdgpu_job *job,
                       unsigned int flags)
{
    struct amdgpu_device *adev = ring->adev;
    struct amdgpu_fence *fence;
    uint32_t seq;

    /* allocation递增序列号 */
    seq = ++ring->fence_drv.sync_seq;

    /* initialization dma_fence structure体 */
    dma_fence_init(&fence->base, &amdgpu_fence_ops,
                   &ring->fence_drv.lock,
                   adev->fence_context + ring->idx, seq);

    /* 向 Ring Buffer write FENCE PM4 包
     * GPU executeto此包时will: 
     *   MEM_WRITE(fence_gpu_addr, seq)
     *   → will seq write fence_gpu_addr 指向memory
     */
    amdgpu_ring_emit_fence(ring,
        ring->fence_drv.gpu_addr,   /* GPU writegoaladdress */
        seq,                         /* towrite序列号 */
        flags);

    *f = &fence->base;
    return 0;
}

/* amdgpu_fence_process() — ininterruptcontextinhandlecomplete fence
 * 由interrupt handler  tasklet call
 */
bool amdgpu_fence_process(struct amdgpu_ring *ring)
{
    struct amdgpu_fence_driver *drv = &ring->fence_drv;
    uint32_t last_seq, seq;

    /* read GPU writelatest序列号
     * thismemoryaddress由 CPU and GPU shared(writeback buffer)
     */
    last_seq = atomic_read(&drv->last_seq);
    seq = le32_to_cpu(*drv->cpu_addr);
    /* ↑ drv->cpu_addr and drv->gpu_addr 指向同一blockphysical memory
     *   GPU through gpu_addr write, CPU through cpu_addr read */

    if (seq == last_seq)
        return false;  /* no新completecommand */

    atomic_set(&drv->last_seq, seq);

    /* Signal all序列号 <= seq  fence */
    while (last_seq != seq) {
        struct dma_fence *fence;
        fence = /* lookup seq=last_seq+1  fence */;
        if (fence) {
            /* wakeup dma_fence_wait thread
             * execute dma_fence_add_callback callback */
            dma_fence_signal(fence);
        }
        ++last_seq;
    }
    return true;
}`,
            annotations: [
              'sync_seq iseach Ring 递增count器 — each time emit 加 1, 保证globalunique',
              'dma_fence_init use fence_context + ring_idx 作ascontextidentifier符',
              'amdgpu_ring_emit_fence is Ring specificoperate — GFX/SDMA/VCN Ring hasdifferent PM4 format',
              'fence_gpu_addr and cpu_addr is同一physical memory GPU virtual addressand CPU virtual address',
              'le32_to_cpu handlebytes序 — GPU 写 little-endian data',
              'dma_fence_signal iskernel DMA fence frameworkfunction, handlewaitwakeupandcallbackexecute',
            ],
            explanation: 'emit and process is fence mechanism两端: emit incommit时向 GPU "below订单"(in Ring ininsert fence command), process ininterrupt时"check订单completestate"(read GPU write序列号并 signal fence). 这twofunction高效implementationis GPU performancekey — 每秒mayexecute数千次. ',
          },
          miniLab: {
            title: 'observe GPU fence createandcomplete',
            objective: 'through debugfs and ftrace observereal fence 活动, understand fence in GPU work流in角色. ',
            steps: [
              'viewcurrent fence state: sudo cat /sys/kernel/debug/dri/0/amdgpu_fence_info',
              'observe fence 序列号变化: watch -n 0.5 "sudo cat /sys/kernel/debug/dri/0/amdgpu_fence_info | head -20"',
              'in另a终端run GPU 负载: glxgears',
              'observe fence 序列号快速递增(每帧at least +1)',
              '用 ftrace tracing fence signal: echo amdgpu_fence_process > /sys/kernel/tracing/set_ftrace_filter && echo function > /sys/kernel/tracing/current_tracer && echo 1 > /sys/kernel/tracing/tracing_on',
              'viewtracingresult: cat /sys/kernel/tracing/trace | head -30',
            ],
            expectedOutput: `$ sudo cat /sys/kernel/debug/dri/0/amdgpu_fence_info
--- ring gfx_0.0.0 ---
Last signaled fence          0x00003a42
Last emitted                 0x00003a45
  ← 差值 3 representhas 3 个command正in GPU inexecute

--- ring sdma0 ---
Last signaled fence          0x00000128
Last emitted                 0x00000128
  ← 差值 0 represent SDMA idle`,
            hint: 'if "Last signaled" and "Last emitted" 差值很大(> 100)且长时betweennot变, may意味着 GPU hang. 正常情况below差值shouldin 0-10 之between波动. ',
          },
          debugExercise: {
            title: 'Fence timeoutcause GPU Hang',
            language: 'text',
            description: 'below dmesg outputdisplaya GPU hang event. analyze fence information确定 hang  Ring andcause. ',
            question: 'from fence informationin推断: 哪个 Ring 发生 hang? GPU inexecutewhattypeoperate? hang maycauseiswhat? ',
            buggyCode: `[  345.678] [drm:amdgpu_job_timedout [amdgpu]] *ERROR*
  ring gfx_0.0.0 timeout, signaled seq=1024, emitted seq=1028
[  345.678] [drm:amdgpu_job_timedout [amdgpu]]
  GPU fault info:
  SRC_ID: 146, RING: 0, VMID: 3
  addr: 0xDEAD0000BEEF0000
[  345.679] [drm] GPU registers:
  GRBM_STATUS=0x00000300 (GUI_ACTIVE | GFX_BUSY)
  CP_RB_RPTR=0x0000F100
  CP_RB_WPTR=0x0000F180
  CP_BUSY=1 CP_COHERENCY_BUSY=1
[  345.680] amdgpu 0000:03:00.0: amdgpu:
  GPU reset begin!`,
            hint: 'signaled seq=1024, emitted seq=1028 indicate 4 个 job not yetcomplete. SRC_ID:146 iswhatinterrupt源? addr 看起像invalidaddress. ',
            answer: 'analyze: (1)hang 发生in GFX Ring(gfx_0.0.0), 这isgraphics/computecommand主 Ring. signaled=1024, emitted=1028 indicatehas 4 个 job commit但not yetcomplete. (2)SRC_ID:146 is VMC(Virtual Memory Controller)页errorinterrupt, indicate GPU tryaccessinvalidvirtual address. addr=0xDEAD0000BEEF0000 isatypicaldebugging用毒化address(poison pattern), representaccessalreadyreleaseornot yetmappingmemory. VMID=3 representisuser spaceprocess GPU virtualaddress space. (3)GRBM_STATUS display GUI_ACTIVE and GFX_BUSY, CP_BUSY=1 confirm GPU 正inexecute但卡住 — CP tryaccessinvalidaddresscause VMC fault, GFX enginetherefore停滞. (4)根因很mayis: user spaceprogramrelease BO(Buffer Object)但stillinafter续commandin引用它, cause GPU accessalready unmap address. 这istypical use-after-free in GPU 端表现. fix方向: checkapplicationprogram BO lifecyclemanagement, ensurecommandcompletebeforenotrelease引用 BO. ',
          },
          interviewQ: {
            question: 'explain amdgpu in fence workprinciple. GPU hang 时 fence mechanismhowdetecttoissue? ',
            difficulty: 'hard',
            hint: '先explain正常 fence process(emit → GPU 写序列号 → interrupt → signal), againexplaintimeoutdetectand复位process. ',
            answer: 'Fence workprinciple: (1)each timecommand submission(amdgpu_fence_emit), driverin Ring Buffer 尾部inserta FENCE PM4 command packet, containgoalmemoryaddressand递增序列号 N; (2)GPU Command Processor executeto FENCE 包时, will序列号 N write指定memoryaddress(writeback buffer)并triggerhardwareinterrupt; (3)interrupt handlingfunctioncall amdgpu_fence_process(), read GPU writelatest序列号, signal all seq <= N  dma_fence; (4)by signal  fence wakeupthrough dma_fence_wait() wait CPU thread, ortriggerthrough dma_fence_add_callback() registrationcallback function. GPU Hang detect: drm_gpu_scheduler aseach job startupa定时器(default 10 秒). if定时器to期时corresponding fence 仍not yet signal, indicate GPU in预期时between内nocomplete — schedulercall amdgpu_job_timedout(). 该function: (a)recorderrorto dmesg(ring timeout, signaled/emitted seq); (b)dump key GPU register(GRBM_STATUS, CP state); (c)call amdgpu_device_gpu_recover() execute GPU 复位 — saveall Ring state, re-initializationall IP Block, re-commitnot yetcomplete job. GPU 复位isa"核武器"operate — 它willinterruptall GPU work, 但canrecover GPU toavailablestate. in SR-IOV virtual化environmentin, 只can复位allocation给current VM  GPU function.  Key gotchas that distinguish senior engineers: (1) Fence signals use spinlock (not workqueue) because they execute in interrupt/softirq context where sleeping is forbidden — but the callback chain can be long, so the kernel moved to irq_work for deferred processing in recent versions. (2) Ring buffers use Write-Combine (WC) MMIO mapping instead of cached mapping because WC provides much better sequential write performance (CPU writes are combined into full cache-line bursts), but reads from WC memory return garbage — the driver must never read back from the ring buffer, only write to it. (3) Fence timeout != GPU hang: a fence can timeout because the interrupt was lost (common with MSI-X configuration bugs), even though the GPU actually completed the work. The recovery path must check the actual fence sequence number before declaring a hang.',
            amdContext: 'Fence and GPU hang handleis AMD interviewin深度technology话题. demonstrate你understandfrom fence emit to GPU 复位complete链条, and复位对other GPU userimpact. ',
          },
        },
      ],
    },

    // ════════════════════════════════════════════════════════════
    // Group 5.3: Display & Power Management
    // ════════════════════════════════════════════════════════════
    {
      id: '5-3',
      number: '5.3',
      title: 'displayandpower management',
      titleEn: 'Display & Power Management',
      icon: '🖥️',
      description: '深入 AMD Display Core(DC)displayenginearchitectureand SMU power managementmechanism — 这twosubsystemdirectlyimpactuser视觉体验and功耗/performance平衡. ',
      lessons: [
        // ── Lesson 5.3.1 ──────────────────────────────────────
        {
          id: '5-3-1',
          number: '5.3.1',
          title: 'Display Core (DC): AMD displayengine',
          titleEn: 'Display Core (DC): AMD Display Engine',
          duration: 20,
          difficulty: 'expert',
          tags: ['display-core', 'DC', 'DCN', 'KMS', 'FreeSync', 'display-pipeline'],
          concept: {
            summary: 'Display Core (DC) is amdgpu driverin最大subsystem(约 160 万行code), responsible foralldisplayoutput. DC 采用hardware无关corelayer + hardwarerelated DCN(Display Controller Next)layerdesign, implementationfrom framebuffer todisplay器completedisplaypipeline(HUBP → DPP → OPP → OPTC → DIO), 并support FreeSync/VRR 等advancedfeature. ',
            explanation: [
              'DC(Display Core)is AMD from Windows driver移植to Linux displayengine — 这is alsowhy它code风格andkernelother部分has明显差异(更接近 Windows driver C 风格, use大量面向objectpattern). DC 最初in 2017 年merge入kernel时引发争议(becausecode量巨大且风格独特), 但它issupport AMD 现代displayfeature必tocomponent. ',
              'DC architecture分as两大layer: hardware无关corelayer(display/dc/core/)andhardwarerelated DCN layer(display/dc/dcn32/ 等). corelayerdefinedisplaypipelineabstraction模型 — stream(display流, correspondingadisplay器output), plane(display平面, correspondinga图layer), timing(时序parameter, 分辨率/flush率). DCN layerimplementationspecifichardwareregisterprogramming. 这种分layer使得support新一代 DCN 只需addhardwarelayercode, corelogiccan复用. ',
              'DCN(Display Controller Next)displaypipeline由belowhardware单元组成, datafrom framebuffer todisplay器依次经过: HUBP(Hub Pipe, frommemoryread像素data)→ DPP(Display Pipe and Plane, 色彩变换, 缩放, blending)→ OPP(Output Pixel Processor, gamma 校正, dithering)→ OPTC(Output Pipe Timing Combiner, generatedisplay时序信号)→ DIO(Display I/O, 编码as DP/HDMI/DVI 信号output). each单元corresponding DCN hardwareina子module, driverneed精确configurationtheyregisterimplementationcorrectdisplayoutput. ',
              'DC and DRM KMS(Kernel Mode Setting)relationship: DRM KMS is Linux kernelgeneraldisplaymanagementframework(drm_atomic_commit, drm_crtc, drm_connector 等), amdgpu  amdgpu_dm.c(Display Manager)is KMS and DC 之betweenadapterlayer. whenuser space(如 GNOME/KDE)call DRM atomic commit requestset分辨率时, amdgpu_dm will DRM data structureconvertas DC data structure, thencall dc_commit_state() executeactualhardwareconfiguration. FreeSync/VRR(Variable Refresh Rate)is alsothrough DC implementation — DC candynamic调整 OPTC  VBlank between隔match GPU rendering帧率. ',
            ],
            keyPoints: [
              'DC is amdgpu 最大subsystem(~1.6M 行code), from Windows driver移植而',
              '两layerarchitecture: corelayer(hardware无关)+ DCN layer(hardwarerelated, 如 dcn32 = RDNA3)',
              'displaypipeline: HUBP → DPP → OPP → OPTC → DIO → display器',
              'DRM KMS ←→ amdgpu_dm.c(适配layer)←→ DC Core ←→ DCN Hardware',
              'dc_commit_state() isdisplaystatecommitcorefunction, execute atomic mode setting',
              'FreeSync/VRR through DC dynamic调整 OPTC  VBlank 周期implementation',
            ],
          },
          diagram: {
            title: 'DCN displaypipelinearchitecture',
            content: `DCN (Display Controller Next) displaypipeline — RDNA3 DCN 3.2

Framebuffer (VRAM)
  像素datastoragein GPU memoryin
       │
       ▼
┌──────────────┐
│    HUBP      │  Hub Pipe — frommemoryread像素data
│              │  · configuration framebuffer addressandformat
│              │  · support tiling pattern解码
│              │  · requestmemory controllerreaddata
└──────┬───────┘
       │ 像素data流
       ▼
┌──────────────┐
│    DPP       │  Display Pipe and Plane — 像素handle
│              │  · color spaceconvert (sRGB → HDR)
│              │  · 缩放 (scaling, support整数and小数缩放)
│              │  · 多图layerblending (cursor, overlay, video)
│              │  · 3D LUT 色彩mapping
└──────┬───────┘
       │ handleafter像素
       ▼
┌──────────────┐
│    OPP       │  Output Pixel Processor — output像素handle
│              │  · Gamma 校正 (regamma)
│              │  · Dithering (减少色带效应)
│              │  · 位深convert (10bit → 8bit)
│              │  · format化asoutput编码
└──────┬───────┘
       │
       ▼
┌──────────────┐
│    OPTC      │  Output Pipe Timing Combiner — 时序generate
│              │  · generate HSync / VSync 信号
│              │  · VBlank control (FreeSync/VRR in此调整)
│              │  · 多display器时序synchronization
│              │  · CRC (循环冗余校验, used forverify)
└──────┬───────┘
       │ 时序 + 像素
       ▼
┌──────────────┐
│    DIO       │  Display I/O — physicaloutput
│              │  · DP (DisplayPort) 编码: 8b/10b, 128b/132b
│              │  · HDMI 编码: TMDS / FRL
│              │  · Link training (协商链路速率)
│              │  · HDCP 加密 (内容protect)
└──────┬───────┘
       │ DP/HDMI 信号
       ▼
   display器 🖥️

DRM KMS and DC relationship: 

  user space (GNOME/KDE)
       │ drmModeAtomicCommit()
       ▼
  DRM Atomic KMS framework
       │ drm_atomic_helper_commit()
       ▼
  amdgpu_dm.c (适配layer)         ← will DRM structure转as DC structure
       │ dc_commit_state()
       ▼
  DC Core (display/dc/core/)   ← hardware无关displaylogic
       │ call DCN hardwarefunction
       ▼
  DCN 3.2 (display/dc/dcn32/)  ← RDNA3 hardwareregisterprogramming`,
            caption: 'DCN 3.2 displaypipelineand DRM KMS to DC calllayer次. eachpipelinestage(HUBP→DPP→OPP→OPTC→DIO)correspondinghardwareina子module, driverneedconfiguration大量registerletdatacorrect流过entirepipeline. ',
          },
          codeWalk: {
            title: 'dc_commit_state — displaystatecommitcoreprocess',
            file: 'drivers/gpu/drm/amd/display/dc/core/dc.c',
            language: 'c',
            code: `/* dc_commit_state() — will新displaystatecommittohardware
 * whenuser spacerequest改变分辨率, flush率, HDR pattern等时call
 * 这is DC subsystemin最corefunction
 */
enum dc_status dc_commit_state(struct dc *dc,
                                struct dc_state *context)
{
    enum dc_status result;

    /* stage 1: verify新statewhethercan行
     * checkbandwidthwhether足够, 时序whether兼容, pipelineresourcewhether充足
     */
    result = dc_validate_global_state(dc, context);
    if (result != DC_OK) {
        /* if新statenotcan行(如bandwidthnot足), returnerror
         * user spaceneed降低to求(如降低分辨率)
         */
        return result;
    }

    /* stage 2: computeallpipelineparameter
     * DML (Display Mode Library) computeeachpipelinestage水印值
     * 水印决定何时frommemoryprefetchdata以avoid underflow
     */
    dc->res_pool->funcs->calculate_wm_and_dlg(dc, context);

    /* stage 3: compare新旧state, 确定needupdatepipelinestage */
    dc_resource_state_copy_construct(dc->current_state,
                                      context);

    /* stage 4: programminghardware
     * 按orderconfigurationeachpipelinestageregister
     */
    for (i = 0; i < context->stream_count; i++) {
        struct dc_stream_state *stream = context->streams[i];

        /* configuration OPTC — set时序(分辨率, flush率)*/
        dc->hwss.setup_stream_encoder(stream);

        /* configuration DIO — setoutput链路(DP/HDMI)*/
        dc->hwss.enable_stream(stream);
    }

    for (i = 0; i < context->plane_count; i++) {
        /* configuration HUBP — set framebuffer addressandformat */
        dc->hwss.update_plane_addr(dc, context->planes[i]);

        /* configuration DPP — set缩放, 色彩变换 */
        dc->hwss.program_pipe(dc, context->planes[i]);
    }

    /* stage 5: wait VBlank then切换  —  avoid画面撕裂 */
    dc->hwss.wait_for_mpcc_disconnect(dc, context);

    dc->current_state = context;
    return DC_OK;
}`,
            annotations: [
              'dc_validate_global_state call DML verifybandwidth — ensurealldisplay器data量notexceedmemorybandwidth',
              'DML (Display Mode Library) is AMD bandwidthcompute库, 水印值preventdisplay underflow(黑屏/闪烁)',
              'dc->hwss ishardware序列化layer(Hardware Sequencer), encapsulationhardwarerelatedregisterprogramming',
              'stream correspondingadisplayoutput(如 DP-1), plane correspondingadisplay图layer(如桌面, 视频叠加)',
              'wait_for_mpcc_disconnect in VBlank 期between切换pipelineconfiguration, avoidcan见画面撕裂',
              'DC_OK 以outsidereturn value(如 DC_FAIL_BANDWIDTH)needuser spacehandle(降低to求orreporterror)',
            ],
            explanation: 'each time你拖动窗口, 改变分辨率orenable HDR 时, thisfunctionallin幕afterexecute. 它协调 DCN pipelineinallhardware单元registerconfiguration. DML bandwidthcomputeis最complex部分 — 它need考虑 VRAM bandwidth, memory时序, pipelinelatency等几十个parameterensuredisplaywill not出现 underflow. ',
          },
          miniLab: {
            title: 'viewyourdisplay器连接informationand DC state',
            objective: 'through sysfs and debugfs observe DC managementdisplay器连接state, current时序andpipelineconfiguration. ',
            steps: [
              'viewallconnectorstate: for c in /sys/class/drm/card0-*; do echo "$(basename $c): $(cat $c/status 2>/dev/null)"; done',
              'viewcurrentdisplaypattern(分辨率andflush率): cat /sys/class/drm/card0-DP-1/modes | head -5',
              'view EDID information: sudo cat /sys/class/drm/card0-DP-1/edid | edid-decode 2>/dev/null || echo "install edid-decode: sudo apt install edid-decode"',
              'view DC state: sudo cat /sys/kernel/debug/dri/0/amdgpu_dm_dtn_log 2>/dev/null | head -50',
              'check FreeSync state: cat /sys/class/drm/card0-DP-1/vrr_capable 2>/dev/null',
              'view GPU displayrelated dmesg: dmesg | grep -i "connector\\|display\\|dc\\|hdmi\\|dp-\\|freesync"',
            ],
            expectedOutput: `$ for c in /sys/class/drm/card0-*; do echo "$(basename $c): $(cat $c/status)"; done
card0-DP-1: connected         ← DisplayPort already连接
card0-DP-2: disconnected
card0-HDMI-A-1: disconnected

$ cat /sys/class/drm/card0-DP-1/modes | head -3
2560x1440     ← currentdisplay器首选分辨率
1920x1080
1280x720

$ cat /sys/class/drm/card0-DP-1/vrr_capable
1             ← display器support FreeSync/VRR`,
            hint: 'connector名称(DP-1, HDMI-A-1)取决于yourphysical连接. ifuse HDMI 连接, willcommandin DP-1 替换as HDMI-A-1. amdgpu_dm_dtn_log needkernelcompilation时enable CONFIG_DEBUG_FS. ',
          },
          debugExercise: {
            title: 'display闪烁: error时序configuration',
            language: 'c',
            description: 'userreportdisplay器between歇性闪烁(黑屏 1 秒thenrecover). belowis DC  dmesg outputandkeystate. ',
            question: 'according tologinformation判断闪烁根本cause. is时序issue, bandwidthissuestillis链路issue? ',
            buggyCode: `/* dmesg inkeyinformation */
[  120.456] [drm] DC: pipe 0 underflow detected!
[  120.456] [drm] DC: HUBP0 urgent watermark exceeded
[  120.457] [drm] DC: stream 0: 2560x1440@165Hz
[  120.457] [drm] DC: active plane count: 3
            (desktop + video overlay + cursor)
[  120.458] [drm] DC: DRAM bandwidth: 38.4 GB/s required,
            36.8 GB/s available

/* debugfs amdgpu_dm_dtn_log 片段 */
HUBP0: req_per_sec=4200000  prefetch_bw=37.2 GB/s
DPP0: scl_enable=1  ratio_h=2.0  ratio_v=2.0
OPTC0: vtotal=1500  vactive=1440  hsync=60`,
            hint: 'underflow 意味着 HUBP frommemoryread像素data速度跟notondisplay器消耗速度. note required vs available bandwidth. ',
            answer: '根因ismemorybandwidthnot足causedisplay underflow. analyze: (1)"HUBP0 urgent watermark exceeded" + "pipe 0 underflow detected" directly表明 HUBP unable tofrommemoryin足够快地read像素data. (2)bandwidthdataconfirm: need 38.4 GB/s 但only 36.8 GB/s available — 差值 1.6 GB/s causebetween歇性 underflow. (3)加剧因素: 2560x1440@165Hz is高bandwidth需求(约 2560*1440*4*165 = 2.27 GB/s 单流), 加on 3 个active平面(桌面+视频叠加+光标)and DPP  2x 缩放(ratio_h=2.0 使bandwidth需求翻倍), 总需求超出availablebandwidth. resolveplan: (a)降低flush率to 144Hz or 120Hz 减少bandwidth需求; (b)关闭视频叠加(减少aactive平面); (c)check DML 水印computewhetherhas bug — DML shouldin validate stage拒绝thisconfiguration而is notlet underflow 发生; (d)提高memory时钟(if pp_dpm_mclk displaynotin最高档). 这isatypical DML 水印compute bug — correct fix isfix DML bandwidth估算, 使其in validate stagereturn DC_FAIL_BANDWIDTH. ',
          },
          interviewQ: {
            question: 'explain AMD Display Core (DC) architecture. why AMD selectfrom Windows 移植 DC 而is not用 DRM KMS generalimplementation? ',
            difficulty: 'hard',
            hint: 'fromarchitecture分layer(DC Core + DCN HW), function需求(FreeSync, HDR, 多display器)andcode复用(Windows/Linux shared)角度analyze. ',
            answer: 'DC architecture分as三layer: (1)DRM KMS 适配layer(amdgpu_dm.c): will DRM  atomic commit API 翻译as DC internal API; (2)DC corelayer(display/dc/core/): hardware无关displaylogic, includestateverify, bandwidthcompute(DML), pipelineresourceallocation; (3)DCN hardwarelayer(display/dc/dcn32/ 等): specifichardwareregisterprogramming, 每代 DCN hasselfdirectory. AMD select移植 DC rather thanuse纯 DRM KMS cause: (1)functioncomplex度 — AMD displayhardwaresupport FreeSync/VRR, HDR, PSR(Panel Self Refresh), DSC(Display Stream Compression), MST(Multi-Stream Transport)等大量advancedfeature, DRM KMS generalimplementationnotsupportthese; (2)code复用 — DC corelayerin Windows and Linux driver之betweenshared, AMD 只need维护一份displaylogic, 而is not维护两套differentimplementation; (3)hardwareverify — DC 经过 AMD internal大量 Windows testingverify, 移植to Linux 比from头implementation风险更小; (4)DML complex度 — Display Mode Library bandwidthcompute涉及数百个parameterandcomplex数学模型, 这部分codenotmayin DRM KMS generalframeworkinimplementation. 代价is DC code风格andkernelnot一致, 维护成本较高. ',
            amdContext: 'DC is AMD displayteamcorework. interviewindemonstrate你understand DC whyexist(function需求 + code复用)and它and DRM KMS relationship, 比只will背诵pipelinestage更has价值. ',
          },
        },

        // ── Lesson 5.3.2 ──────────────────────────────────────
        {
          id: '5-3-2',
          number: '5.3.2',
          title: 'power management: SMU and DVFS',
          titleEn: 'Power Management: SMU & DVFS',
          duration: 20,
          difficulty: 'expert',
          tags: ['power-management', 'SMU', 'DVFS', 'pp_dpm_sclk', 'thermal', 'sysfs'],
          concept: {
            summary: 'GPU power managementthrough SMU(System Management Unit)firmwareimplementation DVFS(Dynamic Voltage Frequency Scaling) — according towork负载dynamic调整 GPU 时钟frequencyand电压. amdgpu driverthroughmessageinterfaceand SMU firmware通信, user spacethrough sysfs interface(pp_dpm_sclk/mclk)viewandcontrol GPU 功耗/performanceconfiguration. ',
            explanation: [
              'SMU(System Management Unit)is GPU internalaindependenthandle器, run AMD 闭源firmware. 它core职责ispower management — control GPU 时钟frequency(clock), 电压(voltage), 功耗limit(power limit)and风扇转速. SMU 做these决策notneed主 CPU 参and — 它real-time监控 GPU 温度, 功耗andwork负载, automatic调整frequencyand电压以inperformanceand功耗之between取得平衡. ',
              'DVFS(Dynamic Voltage Frequency Scaling)is SMU coremechanism. GPU hasmultiple DPM(Dynamic Power Management)等级, each等级corresponding一组frequency-电压对. for example RX 7600 XT  GPU core(SCLK)mayhas: 300MHz@0.7V(idle), 1200MHz@0.85V(轻负载), 2100MHz@1.0V(in负载), 2595MHz@1.15V(满载). SMU according tocurrent负载inthese等级之between切换 — 你打开a游戏, frequencyin几毫秒内from 300MHz 跳to 2595MHz; 关闭游戏afteragain降回 300MHz. ',
              'amdgpu driverthrough PPSMC(PowerPlay SMC)messageand SMU 通信. driverwillmessagewritespecific MMIO register(MP1_SMN_C2PMSG series), wait SMU handle并returnresult. keymessageinclude: SetSoftMaxGfxClk(set最大 GFX frequency), SetHardMinGfxClk(set最低 GFX frequency), SetPowerLimit(set功耗limit), GetGfxClkFrequency(getcurrentfrequency). drivercodein pm/swsmu/ below, smu_v13_0.c is RDNA3  SMU implementation. ',
              'Linux userthrough sysfs interfaceandpower managementinteraction. pp_dpm_sclk display/set GPU corefrequency等级, pp_dpm_mclk display/setmemoryfrequency等级, power_dpm_force_performance_level setperformancepattern(auto/high/low/manual). in manual patternbelow, 你canthroughwrite pp_dpm_sclk 锁定 GPU tospecificfrequency — 这inperformancedebugging时很has用. thermal throttling(热protect降频)is SMU automaticexecute — when GPU 温度exceed阈值(usually 100°C), SMU will降低frequency以减少发热. ',
            ],
            keyPoints: [
              'SMU is GPU internalindependenthandle器, run闭源firmware, real-timemanagement电源/frequency/温度',
              'DVFS coremechanism: multiple DPM 等级, each等级 = frequency + 电压对',
              'amdgpu through PPSMC message(MMIO register)and SMU 通信',
              'sysfs interface: pp_dpm_sclk(GPU frequency), pp_dpm_mclk(VRAMfrequency)',
              'power_dpm_force_performance_level: auto/high/low/manual 四种pattern',
              'Thermal throttling: 温度exceed阈值时 SMU automatic降频, driver监控但notdirectlycontrol',
            ],
          },
          diagram: {
            title: 'GPU power managementarchitectureand DVFS',
            content: `GPU power managementarchitecture

user space sysfs interface
┌────────────────────────────────────────────────────────┐
│ /sys/class/drm/card0/device/                           │
│                                                        │
│ pp_dpm_sclk          GPU corefrequency等级                  │
│   0: 300Mhz                                            │
│   1: 800Mhz                                            │
│   2: 2100Mhz                                           │
│   3: 2595Mhz *      (* = current等级)                     │
│                                                        │
│ pp_dpm_mclk          VRAMfrequency等级                      │
│   0: 96Mhz                                             │
│   1: 1188Mhz *                                         │
│                                                        │
│ power_dpm_force_performance_level                      │
│   auto / high / low / manual                           │
│                                                        │
│ hwmon/hwmon*/                                          │
│   temp1_input        GPU 温度 (毫摄氏度)               │
│   power1_average     平均功耗 (微瓦)                   │
│   fan1_input         风扇转速 (RPM)                    │
└────────────────────────────┬───────────────────────────┘
                             │ sysfs read/write
═════════════════════════════│═══════════════════════════
                             │
kernel space(amdgpu driver pm/swsmu/)
┌────────────────────────────▼───────────────────────────┐
│  smu_set_performance_level()                           │
│  smu_get_current_clocks()                              │
│  smu_set_fan_speed_rpm()                               │
│       │                                                │
│       ▼                                                │
│  smu_cmn_send_smc_msg()                               │
│  ┌─────────────────────────────────────────┐           │
│  │ write PPSMC messageto MMIO register:          │           │
│  │ WREG32(MP1_SMN_C2PMSG_66, msg_id);     │           │
│  │ WREG32(MP1_SMN_C2PMSG_82, param);      │           │
│  │ WREG32(MP1_SMN_C2PMSG_90, 0x1); /*go*/ │           │
│  │                                          │           │
│  │ wait SMU response:                           │           │
│  │ while (RREG32(MP1_SMN_C2PMSG_90) != 1)  │           │
│  │     usleep_range(10, 20);               │           │
│  └─────────────────────────────────────────┘           │
└────────────────────────────┬───────────────────────────┘
                             │ MMIO message
GPU hardware                     ▼
┌─────────────────────────────────────────────────────────┐
│  SMU (System Management Unit)                           │
│  ┌────────────────────────────────────────────┐        │
│  │ independenthandle器, run AMD 闭源firmware               │        │
│  │                                             │        │
│  │ input:                                       │        │
│  │   · GPU 温度传感器 (Tdie, Tjunction)        │        │
│  │   · 功耗传感器 (Telemetry)                  │        │
│  │   · work负载detect (activity %)               │        │
│  │   · drivermessage (PPSMC)                        │        │
│  │                                             │        │
│  │ 决策: DVFS (frequency-电压调整)                  │        │
│  │                                             │        │
│  │   idle     轻负载    in负载     满载         │        │
│  │   300MHz   800MHz   2100MHz   2595MHz       │        │
│  │   0.7V     0.85V    1.0V      1.15V         │        │
│  │   ~5W      ~30W     ~80W      ~150W         │        │
│  │   ▲                                 ▲       │        │
│  │   │  ← SMU automatic调整 →              │       │        │
│  │                                             │        │
│  │ protect: 热protect降频 (>100°C → 强制降频)        │        │
│  └────────────────────────────────────────────┘        │
│                                                         │
│  output:                                                  │
│  · set PLL frequency (GFX clock, Memory clock)              │
│  · set电压调节器 (Voltage Regulator)                    │
│  · control风扇 PWM                                         │
└─────────────────────────────────────────────────────────┘`,
            caption: 'GPU power managementcompletearchitecture. user spacethrough sysfs interfaceinteraction, driverthrough PPSMC messageand SMU 通信, SMU real-timeexecute DVFS 决策. SMU firmwarealthough闭源, 但driver-SMU messageinterfaceiscompletelyopen-source. ',
          },
          codeWalk: {
            title: 'smu_set_performance_level — set GPU performancelevel',
            file: 'drivers/gpu/drm/amd/pm/swsmu/amdgpu_smu.c',
            language: 'c',
            code: `/* smu_set_performance_level() — set GPU performancepattern
 * 由 sysfs power_dpm_force_performance_level writetrigger
 */
int smu_set_performance_level(struct smu_context *smu,
    enum amd_dpm_forced_level level)
{
    int ret = 0;

    switch (level) {
    case AMD_DPM_FORCED_LEVEL_HIGH:
        /* 强制 GPU use最高frequency
         * used for基准testingordebugging */
        ret = smu_force_clk_levels(smu, SMU_SCLK,
            1 << smu->smu_table.max_sclk_dpm_level);
        ret = smu_force_clk_levels(smu, SMU_MCLK,
            1 << smu->smu_table.max_mclk_dpm_level);
        break;

    case AMD_DPM_FORCED_LEVEL_LOW:
        /* 强制 GPU use最低frequency
         * used for省电or热debugging */
        ret = smu_force_clk_levels(smu, SMU_SCLK, 1 << 0);
        ret = smu_force_clk_levels(smu, SMU_MCLK, 1 << 0);
        break;

    case AMD_DPM_FORCED_LEVEL_AUTO:
        /* recover SMU automaticmanagement(defaultpattern)
         * SMU according to负载自主决定frequency */
        ret = smu_unforce_dpm_levels(smu);
        break;

    case AMD_DPM_FORCED_LEVEL_MANUAL:
        /* 手动pattern: allowuserthrough pp_dpm_sclk
         * selectspecific DPM 等级 */
        break;
    }

    smu->dpm_level = level;
    return ret;
}

/* smu_force_clk_levels — through PPSMC message锁定frequency */
static int smu_force_clk_levels(struct smu_context *smu,
    enum smu_clk_type clk_type, uint32_t mask)
{
    /* callspecific SMU versionimplementation
     * for RDNA3 → smu_v13_0_force_clk_levels */
    return smu->ppt_funcs->force_clk_levels(smu,
                                              clk_type, mask);
}

/* smu_cmn_send_smc_msg — 向 SMU sendmessage底layerfunction */
int smu_cmn_send_smc_msg(struct smu_context *smu,
    enum smu_message_type msg, uint32_t *resp)
{
    struct amdgpu_device *adev = smu->adev;

    /* writemessageparameter */
    WREG32(smu->msg_arg_reg, param);

    /* writemessage ID — SMU starthandle */
    WREG32(smu->msg_reg, msg);

    /* pollingwait SMU response */
    ret = smu_cmn_wait_for_response(smu);
    /* SMU usuallyin <1ms 内response */

    if (resp)
        *resp = RREG32(smu->resp_reg);

    return ret;
}`,
            annotations: [
              'AMD_DPM_FORCED_LEVEL_HIGH 用 bitmask select最高 DPM 等级, 适合基准testing',
              'AMD_DPM_FORCED_LEVEL_AUTO isdefaultpattern — SMU completely自主managementfrequency/电压',
              'smu->ppt_funcs is SMU versionspecificfunction表(Power Play Table), similar IP Block interfaceabstraction',
              'WREG32(msg_reg, msg) istrigger SMU handlekey — SMU 监控此registerwrite',
              'smu_cmn_wait_for_response polling SMU responseregister, timeout时betweenusuallyas 10ms',
              '闭源 SMU firmware行asthroughmessageinterfacebetween接control — drivernotcandirectlyoperate PLL or电压调节器',
            ],
            explanation: 'thiscodedemonstratedriverhowcontrol GPU 功耗/performanceconfiguration. when你in终端execute echo high > /sys/class/drm/card0/device/power_dpm_force_performance_level 时, finalcallisthisfunction. understand SMU messageinterfaceisunderstand GPU power managementkey — although SMU firmware闭源, 但messageinterface语义iscompletelyopen-source. ',
          },
          miniLab: {
            title: '监控andcontrol GPU 时钟frequency',
            objective: 'use sysfs interfacereal-time监控 GPU frequency变化, 并体验手动control GPU performancelevel. ',
            setup: '# ensure你has root permission\n# ensurehas GPU work负载tool\nsudo apt install -y mesa-utils glmark2',
            steps: [
              'viewcurrent GPU corefrequency等级: cat /sys/class/drm/card0/device/pp_dpm_sclk',
              'viewcurrentVRAMfrequency等级: cat /sys/class/drm/card0/device/pp_dpm_mclk',
              'startupreal-time监控(in新终端in): watch -n 0.5 cat /sys/class/drm/card0/device/pp_dpm_sclk(observefrequency档位变化, * markcurrentfrequency)',
              'in另a终端run GPU 负载: glmark2(observe监控infrequencyfromidle跳to高档)',
              'testing手动锁定高频: echo high | sudo tee /sys/class/drm/card0/device/power_dpm_force_performance_level',
              'recoverautomaticpattern: echo auto | sudo tee /sys/class/drm/card0/device/power_dpm_force_performance_level',
            ],
            expectedOutput: `$ cat /sys/class/drm/card0/device/pp_dpm_sclk
0: 300Mhz
1: 800Mhz
2: 2100Mhz
3: 2595Mhz *    ← 正inrun GPU 负载时willin最高档

idle时:
0: 300Mhz *     ← 回to最低frequency
1: 800Mhz
2: 2100Mhz
3: 2595Mhz

温度and功耗变化:
  idle: ~40°C, ~8W
  满载: ~75°C, ~130W`,
            hint: 'modify power_dpm_force_performance_level need root permission. 小心 echo high willlet GPU 持续全速run增加功耗and温度, experiment完记得recover auto pattern. if hwmon pathnot对, 用 ls /sys/class/drm/card0/device/hwmon/ findcorrect编号. ',
          },
          debugExercise: {
            title: 'GPU frequency锁定in低档',
            language: 'text',
            description: 'userreport游戏帧率异常低, GPU 负载 100% 但frequency始终停留in最低档. ',
            question: 'according tobelowdiagnoseinformation, find GPU frequencyunable to提升根本cause. ',
            buggyCode: `/* userreport现象 */
glxgears: ~60 FPS (正常should 300+ FPS)
GPU utilization: 100%

/* sysfs output */
$ cat pp_dpm_sclk
0: 300Mhz *       ← 始终in最低frequency!
1: 800Mhz
2: 2100Mhz
3: 2595Mhz

$ cat power_dpm_force_performance_level
manual             ← note这inside!

$ cat pp_dpm_mclk
0: 96Mhz *         ← VRAMalsoin最低frequency
1: 1188Mhz

/* GPU 温度and功耗 */
temp1_input: 42000  (42°C — 很凉)
power1_average: 8500000  (8.5W — 几乎isidle功耗)

/* dmesg 无异常error */`,
            hint: 'note power_dpm_force_performance_level 值. manual patternbelow SMU will notautomatic调频. ',
            answer: '根因: power_dpm_force_performance_level bysetas "manual" pattern, 且 pp_dpm_sclk 选in最低档(0: 300MHz). in manual patternbelow, SMU notexecuteautomatic DVFS — 它严格遵守userselect DPM 等级. due to只选in等级 0(300MHz), GPU by锁定in最低frequency. 温度(42°C)and功耗(8.5W)异常低进一步confirm这一点 — 满载 GPU shouldin 75°C+ and 100W+. resolveplan: (1)最simplefix: echo auto | sudo tee /sys/class/drm/card0/device/power_dpm_force_performance_level — recover SMU automaticmanagement. (2)ifneed保持 manual pattern, 手动enable高频等级: echo "0 1 2 3" | sudo tee /sys/class/drm/card0/device/pp_dpm_sclk — allow SMU inall等级between切换. thisissueusuallyisuserbefore做performance调优experimentafter忘记recoverset, or某个 GPU 调优脚本set manual pattern. in bug reportin, check power_dpm_force_performance_level shouldisdiagnoseperformanceissuestandardstep. ',
          },
          interviewQ: {
            question: 'describe amdgpu power managementarchitecture. driverhowand SMU firmwareinteraction? DVFS ishowwork? ',
            difficulty: 'hard',
            hint: 'from三layerarchitecture(sysfs → driver pm/swsmu → SMU firmware)and PPSMC messagemechanism角度describe. ',
            answer: 'amdgpu power managementarchitecture分as三layer: (1)userinterfacelayer — through sysfs 暴露 pp_dpm_sclk(GPU frequency), pp_dpm_mclk(memoryfrequency), power_dpm_force_performance_level(performancepattern), hwmon(温度/功耗/风扇)等interface; (2)driverlayer — pm/swsmu/ belowcodeimplementation SMU 通信framework, amdgpu_smu.c isgeneralinterface, smu_v13_0.c is RDNA3 specificimplementation. driverthrough Power Play Table(PPT)data structuredescribe GPU support DPM 等级表, 并through smu->ppt_funcs interfaceabstractiondifferent SMU version差异; (3)SMU firmwarelayer — runin GPU internalindependenthandle器on闭源firmware, receivedriver PPSMC message(through MMIO register MP1_SMN_C2PMSG series), real-timeexecute DVFS 决策. messageinteractionprocess: driverwriteparameterto C2PMSG_82 → writemessage ID to C2PMSG_66 → writetriggerto C2PMSG_90 → polling C2PMSG_90 waitresponse → readresult. DVFS workprinciple: SMU 维护 DPM 等级表(frequency-电压对), according to GPU activity(work负载百分比), 温度, 功耗limit三个因素dynamicselect等级. 负载增加 → 提升frequency/电压; 温度超限 → 强制降频(thermal throttling); 功耗超限 → limitfrequency(power throttling). SMU 决策周期约 1-10ms, 远快于driver干预. ',
            amdContext: 'SMU andpower managementis AMD interviewinimportant话题, 尤其is PM team. demonstrate你understand闭源 SMU firmwarethroughmessageinterfacebyopen-sourcedrivercontrolarchitecture, and DVFS input因素(负载, 温度, 功耗). ',
          },
        },
      ],
    },

    // ════════════════════════════════════════════════════════════
    // Group 5.4: Advanced Subsystems
    // ════════════════════════════════════════════════════════════
    {
      id: '5-4',
      number: '5.4',
      title: 'advancedsubsystem深入',
      titleEn: 'Advanced Subsystems',
      icon: 'Microscope',
      description: '深入三个keysubsystem: Display Core independent王国architectureand DML bandwidthcompute, DRM GPU Scheduler command schedulingmechanism, and GPU virtual memory(GPUVM)多级page tablesystem — theseis amdgpu driverin bug 密度最高, interviewfrequency最高coremodule. ',
      lessons: [
        // ── Lesson 5.4.1 ──────────────────────────────────────
        {
          id: '5-4-1',
          number: '5.4.1',
          title: 'Display Core 深入: dc_state, DML and DC independent王国',
          titleEn: 'Display Core Deep Dive: dc_state, DML and DC\'s Independent Kingdom',
          duration: 20,
          difficulty: 'expert',
          tags: ['display-core', 'dc_state', 'DML', 'dc_stream', 'dc_plane', 'bandwidth', 'amdgpu_dm'],
          concept: {
            summary: 'DC(Display Core)占 amdgpu code量约 40%, 拥hasdriverin最高 bug 密度. 它not只isadisplaysubsystem — 它isafrom Windows driver移植过independent王国, 拥hasselftypesystem(dc_stream, dc_plane), selfstateverify(dc_validate_state), selfmemory模型anderrorhandle, and Linux DRM/KMS framework几乎is"翻译"relationshiprather than"integration"relationship. ',
            explanation: [
              'DC 作asindependentabstractionlayer历史根源: DC 最初is AMD Windows driverindisplayengine, use C 语言面向object风格write(大量 vtable, abstractioninterface, 构造/析构pattern). 2017 年移植to Linux 时, AMD select保持 DC independent性rather than重写as DRM/KMS 原生风格 — causeis DC complex度(160 万行code)使得重写not现实, 且 AMD need Windows and Linux shared同一份displaycorecode. this means DC hasselfmemory allocationwrapper, selflogsystem, 甚至self数学库(定点数运算used for DML), andkernelothersubsystem形成风格on鲜明compare. ',
              'dc_state commitprocessis DC coreworkpath. whenuser spacerequest改变displayconfiguration时(如切换分辨率, enable HDR), completecommitprocessas: dc_validate_state()(verify新configurationwhetherinhardwareabilityrange内 — checkpipelineresourcecount, bandwidthlimit, 时序兼容性)→ DML bandwidthcompute(Display Mode Library computeeachpipelinestage水印值, ensuredata流will not underflow)→ dc_commit_state()(willverifythroughconfigurationprogrammingtohardwareregister, in VBlank 期between切换以avoid撕裂). 任何一步failureallwill阻止configuration生效, 向user spacereturnerror. ',
              'DML(Display Mode Library)is DC in最complex, 最容易出 bug 子module. DML 本质onisabandwidth/latencycomputeframework — 给定displayconfiguration(分辨率, flush率, 像素format, 缩放比例, active平面数), DML compute出allpipelinestageneedmemorybandwidth, 并andavailablebandwidthcompare. if需求超出availablebandwidth, DML will拒绝该configuration(return DC_FAIL_BANDWIDTH). DML stillcompute"水印值"(watermark) — HUBP mustin像素bydisplay器消耗before多久startfrommemoryprefetchdata. 水印computeerrorwillcausedisplay underflow(HUBP not及readdata, 屏幕出现黑线or闪烁), 这is DC in最common bug type. ',
              'DC 拥hascompletelyindependent于 DRM/KMS typesystem. DRM use drm_crtc, drm_connector, drm_plane; DC use dc_stream(correspondingadisplayoutput流), dc_plane(correspondingadisplay图layer), dc_sink(correspondingadisplaydevice). amdgpu_dm.c is连接这two世界"翻译layer" — 它will drm_atomic_state convertas dc_state, will drm_crtc_state mappingto dc_stream_state, will drm_plane_state mappingto dc_plane_state. 这种双重abstraction增加complex性, 但also使得 DC corecompletelynotdependency Linux kernel API, canin Windows and Linux 之betweenshared. ',
              'DC errorhandleindependent于kernel. DC internaluseselferror枚举(enum dc_status: DC_OK, DC_FAIL_BANDWIDTH, DC_FAIL_RESOURCES 等), rather than Linux standard errno(-EINVAL, -ENOMEM 等). amdgpu_dm.c responsible forwill DC error code翻译as DRM/KMS 期望error code. DC internallogalsouse自define DC_LOG_* macrorather thankernel pr_info/dev_err. understand这种independent性fordebugging DC issue至关important — 你needmeanwhilein DRM layer(dmesg in [drm] before缀)and DC layer([drm] DC: before缀)lookupinformation. ',
            ],
            keyPoints: [
              'DC isfrom Windows driver移植independentabstractionlayer, 占 amdgpu 约 40% code量, bug 密度最高',
              'dc_state commitprocess: dc_validate_state → DML bandwidthcompute → dc_commit_state → hardwareprogramming',
              'DML(Display Mode Library): bandwidth/latencycomputeframework, 水印errorcause underflow is最common bug',
              'DC independenttypesystem: dc_stream/dc_plane/dc_sink, and DRM  drm_crtc/drm_plane is翻译relationship',
              'amdgpu_dm.c is DRM/KMS and DC 之betweenadapterlayer, responsible fortypeconvertanderror code翻译',
              'DC independenterrorhandle: enum dc_status(DC_OK/DC_FAIL_BANDWIDTH)rather than Linux errno',
            ],
          },
          diagram: {
            title: 'DC independent王国architectureand dc_state commitprocess',
            content: `DC "independent王国" architecture — DRM/KMS and DC 翻译relationship

user space (GNOME/KDE/Wayland Compositor)
  │ drmModeAtomicCommit()
  ▼
┌──────────────────────────────────────────────────────────────┐
│  DRM Atomic KMS framework (drivers/gpu/drm/drm_atomic.c)         │
│                                                              │
│  drm_atomic_state  ─── drm_crtc_state                       │
│                    ─── drm_connector_state                   │
│                    ─── drm_plane_state                       │
└──────────────────────────────┬───────────────────────────────┘
                               │
                               ▼ "翻译layer"
┌──────────────────────────────────────────────────────────────┐
│  amdgpu_dm.c — DRM ←→ DC adapterlayer                           │
│                                                              │
│  drm_crtc_state ──────→ dc_stream_state (分辨率/flush率/HDR) │
│  drm_plane_state ─────→ dc_plane_state  (图layer/framebuffer)  │
│  drm_connector_state ─→ dc_sink         (displaydevice)          │
│  errno (-EINVAL) ◄────── dc_status (DC_FAIL_BANDWIDTH)      │
│                                                              │
│  amdgpu_dm_atomic_commit() → dc_commit_state()              │
└──────────────────────────────┬───────────────────────────────┘
                               │
                               ▼ DC internal(independent王国)
┌──────────────────────────────────────────────────────────────┐
│  DC Core (display/dc/core/)                                  │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  dc_state commitprocess:                                     │ │
│  │                                                          │ │
│  │  1. dc_validate_state(dc, new_state)                    │ │
│  │     ├─ checkpipelineresource(pipe count够not够? )                │ │
│  │     ├─ check时序兼容性                                   │ │
│  │     └─ call DML bandwidthverify                                │ │
│  │         │                                                │ │
│  │  2. DML (Display Mode Library)                          │ │
│  │     ├─ compute总bandwidth需求 (分辨率×flush率×BPP×平面数)       │ │
│  │     ├─ compute水印值 (urgent/pstate/dram_clk_change)       │ │
│  │     ├─ bandwidth需求 > availablebandwidth? → DC_FAIL_BANDWIDTH        │ │
│  │     └─ 水印值 → HUBP/DPP registerconfiguration                    │ │
│  │         │                                                │ │
│  │  3. dc_commit_state(dc, validated_state)                │ │
│  │     ├─ wait VBlank(avoid撕裂)                          │ │
│  │     ├─ programming HUBP register(framebuffer address)             │ │
│  │     ├─ programming DPP register(缩放/色彩)                     │ │
│  │     ├─ programming OPTC register(时序/VRR)                     │ │
│  │     └─ programming DIO register(DP/HDMI output)                  │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                              │
│  DC independent设施:                                              │
│  · 自hastype: dc_stream, dc_plane, dc_sink (≠ DRM type)     │
│  · 自haserror code: enum dc_status (DC_OK, DC_FAIL_*)           │
│  · 自haslog: DC_LOG_WARNING, DC_LOG_DC (≠ pr_info/dev_err) │
│  · 自hasmemory: dc_create_*() / dc_destroy_*()               │
│  · 自has数学库: 定点数运算 (DML 用, avoid浮点)               │
└──────────────────────────────────────────────────────────────┘`,
            caption: 'DC 作asindependent王国architecture全景. amdgpu_dm.c isunique连接 DRM/KMS 世界and DC 世界桥梁. DC internal拥hascompletelyindependenttypesystem, errorhandle, logsystemandmemory management — 这自于其 Windows driver历史遗产. ',
          },
          codeWalk: {
            title: 'dc_commit_state — verify → bandwidthcheck → hardware编program列',
            file: 'drivers/gpu/drm/amd/display/dc/core/dc.c',
            language: 'c',
            code: `/* dc_commit_state() — DC corestatecommitfunction
 * completeprocess: verify → DML bandwidthcompute → hardwareprogramming
 * from amdgpu_dm.c  amdgpu_dm_atomic_commit_tail() call
 */
enum dc_status dc_commit_state(struct dc *dc,
                                struct dc_state *context)
{
    enum dc_status result;
    int i;

    /* stage 1: globalstateverify
     * check: pipelineresourcewhether足够? 时序whether冲突?
     * internalcall DML 进行bandwidthverify */
    result = dc_validate_global_state(dc, context);
    if (result != DC_OK) {
        DC_LOG_WARNING("DC: validate failed: %d\\n", result);
        /* DC_FAIL_BANDWIDTH: bandwidthnot足
         * DC_FAIL_RESOURCES: pipelinenot够
         * amdgpu_dm.c 翻译as -EINVAL return给 DRM */
        return result;
    }

    /* stage 2: DML 水印compute
     * aseachpipelinestagecompute "最晚prefetch时between"
     * 水印error → display underflow (最common DC bug) */
    if (dc->res_pool->funcs->calculate_wm_and_dlg) {
        dc->res_pool->funcs->calculate_wm_and_dlg(
            dc, context, context->res_ctx.pipe_ctx);
        /* urgent_watermark: 紧急prefetch阈值
         * pstate_watermark: allow DRAM 切换时钟阈值
         * these值directlyprogrammingto HUBP register */
    }

    /* stage 3: applicationpipeline拆分 (ifneed)
     * 高分辨率/高flush率mayneed 2 个 pipe mergehandle */
    dc->hwss.apply_ctx_for_surface(dc, NULL, 0, context);

    /* stage 4: 逐 stream programminghardware
     * dc_stream = adisplayoutput (如 DP-1 on 2560x1440) */
    for (i = 0; i < context->stream_count; i++) {
        struct dc_stream_state *stream = context->streams[i];
        struct pipe_ctx *pipe = /* find stream corresponding pipe */;

        /* configuration OPTC: 时序信号 (HSync/VSync/VBlank) */
        dc->hwss.setup_stream_encoder(pipe);

        /* configuration DIO: DP/HDMI output编码and链路 */
        dc->hwss.enable_stream(pipe);

        /* configuration FreeSync/VRR: dynamic VBlank 调整 */
        if (stream->adjust.v_total_min != 0)
            dc->hwss.set_drr(&pipe, 1,
                stream->adjust);
    }

    /* stage 5: 逐 plane programminghardware
     * dc_plane = adisplay图layer (桌面/视频叠加/光标) */
    for (i = 0; i < context->res_ctx.pipe_count; i++) {
        struct pipe_ctx *pipe = &context->res_ctx.pipe_ctx[i];

        /* configuration HUBP: framebuffer address, tiling pattern */
        dc->hwss.update_plane_addr(dc, pipe);

        /* configuration DPP: 缩放比例, color spaceconvert */
        dc->hwss.program_pipe(dc, pipe, context);
    }

    /* stage 6: in VBlank 期betweencomplete切换 */
    dc->hwss.wait_for_mpcc_disconnect(dc, context);

    dc->current_state = context;
    return DC_OK;
}`,
            annotations: [
              'dc_validate_global_state internalcall DML  dml_validate() 进行completebandwidth/latencycompute',
              'DC_FAIL_BANDWIDTH is最commonverifyfailure — 多display器 + 高flush率时容易trigger',
              'calculate_wm_and_dlg in wm = watermark, dlg = display lag — control HUBP prefetch时机',
              'dc->hwss (Hardware Sequencer) ishardwarerelatedoperate vtable, 每代 DCN hasdifferentimplementation',
              'stream and plane 分离体现 DC 多图layerarchitecture: a stream canhasmultiple plane',
              'wait_for_mpcc_disconnect in VBlank between隙切换configuration, isprevent画面撕裂key',
            ],
            explanation: 'thisfunctiondemonstrate DC completework流: 先verifyconfigurationwhethercan行(avoidhardware损坏or underflow), againcompute精确pipelineparameter(水印值), finally按orderprogramminghardwareregister. 任何一步failureallwillin止并return DC 自haserror code — amdgpu_dm.c responsible forwill其翻译as DRM/KMS 期望 errno. ',
          },
          miniLab: {
            title: 'tracing dc_commit_state executepath',
            objective: 'use ftrace and debugfs observe dc_commit_state realexecute, understand DML verifyandhardwareprogrammingorder. ',
            setup: `sudo mount -t tracefs nodev /sys/kernel/tracing 2>/dev/null
# confirm DC debug outputalreadyenable
sudo sh -c 'echo 0x1 > /sys/module/amdgpu/parameters/dc 2>/dev/null'`,
            steps: [
              'set ftrace tracing dc_commit_state: echo dc_commit_state > /sys/kernel/tracing/set_ftrace_filter',
              'enablefunction图tracing: echo function_graph > /sys/kernel/tracing/current_tracer',
              'starttracing: echo 1 > /sys/kernel/tracing/tracing_on',
              'trigger dc_commit_state execute — 切换分辨率: xrandr --output DP-1 --mode 1920x1080 && sleep 1 && xrandr --output DP-1 --mode 2560x1440',
              'stoptracing: echo 0 > /sys/kernel/tracing/tracing_on',
              'viewexecute序列: cat /sys/kernel/tracing/trace | grep -E "dc_commit|validate|watermark|dml" | head -30',
              'view DC internalstate: sudo cat /sys/kernel/debug/dri/0/amdgpu_dm_dtn_log 2>/dev/null | head -80',
            ],
            expectedOutput: `$ cat /sys/kernel/tracing/trace | grep -E "dc_commit|validate" | head -10
  kworker/0:2-345  =>  dc_commit_state() {
  kworker/0:2-345      dc_validate_global_state() {
  kworker/0:2-345        dml_validate() {
  kworker/0:2-345          ... (DML bandwidthcompute) ...
  kworker/0:2-345        } /* 2.345 ms */
  kworker/0:2-345      } /* 3.012 ms */
  kworker/0:2-345      ... (hardwareprogramming) ...
  kworker/0:2-345  } /* 8.567 ms */

note: dc_validate_global_state 耗时较长because DML computecomplex`,
            hint: 'need root permission. if xrandr notavailable(纯 Wayland), 用 wlr-randr or gnome-randr 代替. amdgpu_dm_dtn_log needkernelcompilation时enable CONFIG_DEBUG_FS and CONFIG_DRM_AMD_DC_DEBUG. ',
          },
          debugExercise: {
            title: 'display underflow: DML bandwidthcomputefailure',
            language: 'c',
            description: 'userin连接two 4K@60Hz display器after, 第二个display器between歇性黑屏 0.5 秒thenrecover. dmesg and debugfs displaybelowinformation. ',
            question: 'according to DML computedataand underflow report, diagnose根因并提出fixplan. ',
            buggyCode: `/* dmesg output */
[  234.567] [drm] DC: dc_validate_state passed  ← verify居然through!
[  234.890] [drm] DC: pipe 1 underflow detected!
[  234.890] [drm] DC: HUBP1 urgent watermark breached
[  234.891] [drm] DC: stream 1: 3840x2160@60Hz 10bpc HDR

/* DML computedata (debugfs amdgpu_dm_dtn_log) */
Stream 0: 3840x2160@60Hz 8bpc  → need 15.9 GB/s
Stream 1: 3840x2160@60Hz 10bpc → need 19.9 GB/s
Total required: 35.8 GB/s
Available DRAM BW: 36.0 GB/s   ← 仅多 0.2 GB/s 余量!

/* HUBP 水印 (from dtn_log) */
HUBP1 urgent_watermark: 22.5 us
HUBP1 actual_prefetch:  23.1 us  ← 勉强满足

/* relatedcondition */
GPU 正inrun 3D 游戏(GFX engineactive, 抢占memorybandwidth)`,
            hint: 'dc_validate_state instaticconditionbelowthrough, 但actualrun时 GFX engineanddisplayengineshared memorybandwidth. DML bandwidthcomputewhether考虑这种竞争? ',
            answer: '根因: DML bandwidthcomputeinverifystagethrough(36.0 > 35.8 GB/s), 但actual余量仅 0.2 GB/s (0.56%), 几乎no容错空between. when GFX enginerun 3D 游戏时, GPU memory controllerneedmeanwhile服务displayreadandrendering读写 — GFX memoryaccessand DC displayread竞争bandwidth, cause HUBP actualcan获得bandwidth低于 DML staticcompute值. specific表现: HUBP1  urgent_watermark (22.5us) and actual_prefetch (23.1us) 之between仅has 0.6us 余量, GFX 突发memoryaccess轻微latency HUBP prefetchtrigger underflow. 这is DML 经典 bug pattern — DML 假设displayenginecan获得其needentirebandwidth, 但not yet充分考虑and GFX enginebandwidth竞争. fixplan: (1)短期 — 降低 Stream 1 as 8bpc(减少 4 GB/s bandwidth需求)or降低flush率; (2)根本fix — DML shouldreserve更大bandwidth余量(增加 "bandwidth_margin" parameter), typicalsecurity余量shouldis 10-15% rather than 0.56%; (3)checkkernelversion — updatekernelmayalreadyfix此 DML 水印compute低估issue(搜索 git log --oneline display/dc/dml/ viewrelatedpatch). ',
          },
          interviewQ: {
            question: 'Why does amdgpu have its own display abstraction layer (DC) instead of using DRM/KMS directly? What are the trade-offs?',
            difficulty: 'hard',
            hint: 'from历史cause(Windows 移植), technologycause(functioncomplex度), 工程cause(code复用)三个维度analyze, 并讨论代价. ',
            answer: 'AMD selectuseindependent DC layerrather thandirectlyuse DRM/KMS has三方面cause: (1)历史cause — DC 最初is Windows driverdisplayengine, AMD in 2017 年will其移植to Linux 时保持原hasarchitecture, because 160 万行code重写成本notcan接受; (2)technologycause — AMD displayhardwaresupport大量 DRM/KMS generalframeworknotsupportadvancedfeature: FreeSync/VRR, HDR tone mapping, DSC(Display Stream Compression), PSR(Panel Self Refresh), MST(Multi-Stream Transport), ABM(Adaptive Backlight Management)等. thesefeatureneedcomplexbandwidthcompute(DML)and精确pipelineresourcemanagement, DRM generalframeworkunable toprovide; (3)工程cause — DC corelayerin Windows and Linux 之betweenshared, AMD 只需维护一份displaylogic. when Windows 端fixa DML 水印 bug, Linux 端candirectlysynchronizationthisfix. Trade-offs: (优势)functioncomplete, Windows/Linux codeshared, independentverify; (代价)code风格andkernelnot一致, amdgpu_dm.c 适配layer增加complex性, DC 独hastypesystemanderrorhandle增加learn成本, DC code量巨大causecompilation时between长, DC  Windows 风格(如avoid浮点/use定点数)in Linux kernelin显得异类. 尽管hasthese代价, DC patternalreadybyverifyissuccess — AMD isuniquein Linux onprovidecomplete FreeSync/VRR/HDR support GPU 厂商. ',
            amdContext: '这is AMD Display teaminterviewin经典issue. interviewer希望看to你既understand DC existtechnology必to性, alsocan客观评价其代价. 特别note提to DML complex度 — 它is DC unable toby DRM generalframework替代corecause. ',
          },
        },

        // ── Lesson 5.4.2 ──────────────────────────────────────
        {
          id: '5-4-2',
          number: '5.4.2',
          title: 'DRM GPU Scheduler: 现代command submissioncore',
          titleEn: 'DRM GPU Scheduler: Core of Modern Command Submission',
          duration: 20,
          difficulty: 'expert',
          tags: ['drm-scheduler', 'gpu-scheduler', 'drm_sched_job', 'amdgpu_job', 'timeout', 'preemption'],
          concept: {
            summary: 'DRM GPU Scheduler(drm_gpu_scheduler)is Linux kernelin GPU command schedulingcoreframework — amdgpu each Ring Buffer allhasaindependentscheduler实例. 它management job lifecycle(init → arm → push → run → complete/timeout), implementation多process公平scheduling, 并providebased ontimeout GPU hang detect. amdgpu_job structure体implementation drm_sched_job interface, in run_job callbackinwillcommandwrite Ring Buffer. ',
            explanation: [
              'drm_gpu_scheduler is DRM subsystemprovidegeneral GPU schedulingframework(codein drivers/gpu/drm/scheduler/), 最初由 AMD engineerdevelopment并contribution给upstream. 它aseachhardwarequeue(in amdgpu iniseach Ring Buffer)provideaindependentscheduler实例. schedulercoredesigngoalis: 多process之between公平scheduling(preventaprocess垄断 GPU), based onprioritycommand排序, andtimeoutdriver GPU hang detect. amdgpu aseach Ring(GFX Ring, SDMA Ring, VCN Ring 等)createa drm_gpu_scheduler 实例. ',
              'Job completelifecyclecontain五个stage: (1)drm_sched_job_init() — initialization job structure体, 关联tocorrespondingscheduler实体(drm_sched_entity, 代表acommit源/process); (2)drm_sched_job_arm() — "武装" job: allocation fence, record时between戳, job 准备好bycommit; (3)drm_sched_entity_push_job() — will job 推入scheduling实体queue; (4)schedulerthread(kthread)fromqueuein取出最高priority job, call run_job callback(对 amdgpu is amdgpu_job_run)willcommandwrite Ring Buffer; (5)job complete(fence signal)ortimeout(timeout callback). thislifecycleensurecommand submissionhas序性andcantracing性. ',
              'amdgpu_job is amdgpu 对 drm_sched_job 扩展implementation. amdgpu_job_run() is最keycallback — 它inschedulerthreadcontextinexecute, willusercommit IB(Indirect Buffer)引用write Ring Buffer, specificstepas: amdgpu_ib_schedule() get Ring Buffer 空between → write INDIRECT_BUFFER PM4 包(指向 IB  GPU virtual address)→ write FENCE PM4 包(fence 序列号)→ amdgpu_ring_commit() update WPTR 并write Doorbell notify GPU. from amdgpu_cs_submit()(usercommit)to amdgpu_job_run()(actualwrite Ring)之betweenmayhaslatency — 这取决于schedulerqueue深度andpriority. ',
              'Timeout handleisscheduler最importantsecuritymechanism. scheduleraseach正inexecute job 维护a定时器(through delayed_work), defaulttimeout时between由 amdgpu set(GFX ring usuallyas 10 秒). if定时器to期时 job  fence 仍not yetby signal, indicate GPU may hang  — schedulercall timedout_job callback, amdgpu implementationas amdgpu_job_timedout(). 该functionfirstcheck fence whether刚刚complete(avoid误判), then dump GPU registerstate(GRBM_STATUS, CP state), finallytrigger amdgpu_device_gpu_recover() executecomplete GPU 复位. GPU 复位after, allhang job willbyre-commitormarkasfailure. ',
              'priorityscheduling: drm_gpu_scheduler supportmultiplepriorityqueue(DRM_SCHED_PRIORITY_KERNEL > HIGH > NORMAL > LOW). 高priority job will先于低prioritybyschedulingexecute. in amdgpu in, kernelinternaloperate(如page tableupdate, GPU 复位afterrecovercommand)use KERNEL priority, 普通user spacerenderinguse NORMAL priority. hardwarelayer面, RDNA seriessupport GFX Ring level抢占(preemption) — 高priority GFX job canpausecurrent正inexecute低priority job, completeafteragainrecover. 这for VR scenario特别important(VR 合成器need高priority以维持低latency). ',
            ],
            keyPoints: [
              'drm_gpu_scheduler: DRM general GPU schedulingframework, each Ring Buffer a实例',
              'Job lifecycle: init → arm → push → (schedulerthread) → run_job → fence signal / timeout',
              'amdgpu_job_run(): will IB 引用write Ring Buffer, call amdgpu_ring_commit() notify GPU',
              'Timeout mechanism: default 10s timeout → amdgpu_job_timedout → GPU register dump → GPU 复位',
              'priorityqueue: KERNEL > HIGH > NORMAL > LOW, kerneloperate优先于userrendering',
              'schedulerthread(kthread): per-ring independentthread, from实体queue取 job schedulingexecute',
            ],
          },
          diagram: {
            title: 'DRM GPU Scheduler architectureand Job lifecycle',
            content: `DRM GPU Scheduler — Job schedulingprocess

user space (Mesa / Vulkan)
  │ ioctl(DRM_IOCTL_AMDGPU_CS)
  ▼
┌──────────────────────────────────────────────────────────────┐
│  amdgpu_cs_ioctl() — command submissionentry point                           │
│  ├─ amdgpu_cs_parser_init()    parse ioctl parameter              │
│  ├─ amdgpu_cs_parser_bos()     verifyandmapping BO                │
│  └─ amdgpu_cs_submit()         create amdgpu_job              │
│      │                                                       │
│      ├─ drm_sched_job_init()   initialization job, 关联 entity       │
│      ├─ drm_sched_job_arm()    武装 job: allocation fence          │
│      └─ drm_sched_entity_push_job()  推入实体queue ──────┐   │
│                                                          │   │
└──────────────────────────────────────────────────────────│───┘
                                                           │
         ┌─────────────────────────────────────────────────┘
         ▼
┌──────────────────────────────────────────────────────────────┐
│  drm_gpu_scheduler (per-ring scheduler实例)                     │
│                                                              │
│  priorityqueue:                                                 │
│  ┌─────────┬──────────┬──────────┬──────────┐               │
│  │ KERNEL  │  HIGH    │ NORMAL   │  LOW     │               │
│  │ (page table   │ (VR 合成 │ (普通    │ (after台    │               │
│  │  update)  │  器)     │  rendering)   │  compute)   │               │
│  └────┬────┴────┬─────┴────┬─────┴────┬─────┘               │
│       │         │          │          │                      │
│       └────┬────┘          │          │                      │
│            │   priorityfrom高to低select     │                      │
│            ▼                          │                      │
│  scheduler kthread (per-ring):           │                      │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ while (true) {                                         │  │
│  │   job = from最高priority非空queue取 job;                    │  │
│  │   if (available Ring 空between && dependency fence already signal) {      │  │
│  │     fence = job->sched->ops->run_job(job);             │  │
│  │     /* → amdgpu_job_run():                             │  │
│  │      *   amdgpu_ib_schedule()                          │  │
│  │      *   → 写 INDIRECT_BUFFER PM4 to Ring              │  │
│  │      *   → 写 FENCE PM4 to Ring                        │  │
│  │      *   → amdgpu_ring_commit() + Doorbell             │  │
│  │      */                                                │  │
│  │     startup timeout 定时器 (default 10s);                    │  │
│  │   }                                                    │  │
│  │ }                                                      │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  Timeout detect:                                               │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ 定时器to期 && fence not yet signal?                         │  │
│  │   → drm_sched_job_timedout()                          │  │
│  │     → amdgpu_job_timedout()                           │  │
│  │       ├─ check fence whether刚complete (avoid误判)             │  │
│  │       ├─ DRM_ERROR("ring xxx timeout")                │  │
│  │       ├─ dump GPU register (GRBM_STATUS, CP_*)         │  │
│  │       └─ amdgpu_device_gpu_recover()                  │  │
│  │           └─ GPU 复位 → re-initialization → 重commit/failure      │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
         │
         ▼ Ring Buffer (amdgpu_ring_commit → Doorbell)
┌──────────────────────────────────────────────────────────────┐
│  GPU Command Processor (CP)                                  │
│  · read Ring Buffer in INDIRECT_BUFFER PM4               │
│  · 跟随pointerto IB addressexecutecommand                               │
│  · completeafter写 fence 序列号 → triggerinterrupt → signal fence         │
└──────────────────────────────────────────────────────────────┘`,
            caption: 'DRM GPU Scheduler completework流: job fromuser spacecommit, 经过schedulerpriorityqueue排序, 由schedulerthreadcall run_job write Ring Buffer, final由 GPU CP execute. timeout mechanismis GPU hang detectcore. ',
          },
          codeWalk: {
            title: 'amdgpu_cs_submit → scheduler → amdgpu_job_run completepath',
            file: 'drivers/gpu/drm/amd/amdgpu/amdgpu_job.c',
            language: 'c',
            code: `/* amdgpu_cs_submit() — create job 并committoscheduler
 * from amdgpu_cs_ioctl() finallystagecall
 */
static int amdgpu_cs_submit(struct amdgpu_cs_parser *p,
                             union drm_amdgpu_cs *cs)
{
    struct amdgpu_job *job = p->job;

    /* step 1: initializationscheduler job
     * 关联 job tocommitprocess drm_sched_entity */
    r = drm_sched_job_init(&job->base,
                           entity,      /* commitprocessscheduling实体 */
                           owner);      /* processidentifier */

    /* step 2: 武装 job — allocation fence, record时between戳
     * 此after job canbyother job dependency */
    drm_sched_job_arm(&job->base);

    /* step 3: 推入scheduling实体queue
     * schedulerthreadwillfromqueuein取出 job execute */
    drm_sched_entity_push_job(&job->base);

    /* cs->out.handle return给user space, used for查询completestate */
    cs->out.handle = amdgpu_ctx_add_fence(ctx, entity,
                                           &job->base.s_fence->finished);
    return 0;
}

/* amdgpu_job_run() — scheduler run_job callback
 * inscheduler kthread contextinexecute
 * 这is job from"queued"变as"GPU execute"key转折点
 */
static struct dma_fence *amdgpu_job_run(struct drm_sched_job *sched_job)
{
    struct amdgpu_job *job = to_amdgpu_job(sched_job);
    struct amdgpu_ring *ring = to_amdgpu_ring(sched_job->sched);
    struct dma_fence *fence = NULL;
    int r;

    /* will IB write Ring Buffer
     * amdgpu_ib_schedule internalprocess:
     *   1. amdgpu_ring_alloc() — in Ring inallocation空between
     *   2. write INDIRECT_BUFFER PM4 包 (指向 IB)
     *   3. amdgpu_fence_emit() — in Ring ininsert fence command
     *   4. amdgpu_ring_commit() — update WPTR + Doorbell
     */
    r = amdgpu_ib_schedule(ring,
                           job->num_ibs,    /* IB count */
                           job->ibs,        /* IB 数组 */
                           job,
                           &fence);         /* return fence */
    if (r) {
        DRM_ERROR("Error scheduling IBs (%d)\\n", r);
        dma_fence_set_error(&job->base.s_fence->finished, r);
        return NULL;
    }

    return fence;
}

/* amdgpu_job_timedout() — timeoutcallback
 * when job  fence intimeout时between内not yet signal 时call
 */
static enum drm_gpu_sched_stat
amdgpu_job_timedout(struct drm_sched_job *s_job)
{
    struct amdgpu_job *job = to_amdgpu_job(s_job);
    struct amdgpu_ring *ring = to_amdgpu_ring(s_job->sched);
    struct amdgpu_device *adev = ring->adev;

    /* check fence whether刚刚complete(竞争conditionavoid误判)*/
    if (amdgpu_ring_soft_recovery(ring, s_job->s_fence->parent))
        return DRM_GPU_SCHED_STAT_NOMINAL;

    /* confirmis真正 hang — recorderrorinformation */
    DRM_ERROR("ring %s timeout, signaled seq=%u, emitted seq=%u\\n",
              ring->sched.name,
              atomic_read(&ring->fence_drv.last_seq),
              ring->fence_drv.sync_seq);

    /* dump GPU registerstateused fordebugging */
    amdgpu_debugfs_gpu_recover(adev);

    /* trigger GPU 复位 */
    r = amdgpu_device_gpu_recover(adev, job, false);
    if (r)
        DRM_ERROR("GPU Recovery Failed: %d\\n", r);

    return DRM_GPU_SCHED_STAT_NOMINAL;
}`,
            annotations: [
              'drm_sched_job_init will job and entity 关联 — entity 代表acommitprocess, used for公平scheduling',
              'drm_sched_job_arm allocation scheduled/finished two fence: scheduled in run_job bycall时 signal, finished in GPU complete时 signal',
              'drm_sched_entity_push_job will job 放入 entity queue — schedulerthread按priorityfromqueue取 job',
              'amdgpu_job_run inscheduler kthread inrun — notinuserprocesscontext, notcanaccessuser spacememory',
              'amdgpu_ib_schedule is Ring Buffer writecore: allocation空between → 写 PM4 → emit fence → commit',
              'amdgpu_ring_soft_recovery try"软recover": if CP 只is卡in某条commandon, send preempt 信号',
            ],
            explanation: '这三个function构成 amdgpu command submissioncorepath: submit responsible for job createand入队, run responsible foractual Ring Buffer write, timedout responsible for异常handle. understandthispathafter, 你cananswer"a GPU commandfromcommittoexecute经历whichstage" — 这is AMD interviewin高频issue. ',
          },
          miniLab: {
            title: 'observe DRM GPU Scheduler runstate',
            objective: 'through debugfs and ftrace observeschedulerqueue深度, job execute时betweenand timeout configuration. ',
            setup: `# ensure debugfs already挂载
sudo mount -t debugfs none /sys/kernel/debug 2>/dev/null
# 准备 GPU work负载
sudo apt install -y mesa-utils vulkan-tools`,
            steps: [
              'viewschedulerstate: sudo cat /sys/kernel/debug/dri/0/amdgpu_gpu_recover 2>/dev/null',
              'vieweach Ring  fence information: sudo cat /sys/kernel/debug/dri/0/amdgpu_fence_info',
              'set ftrace tracingscheduler: echo amdgpu_job_run > /sys/kernel/tracing/set_ftrace_filter',
              'enabletracing并run GPU 负载: echo function_graph > /sys/kernel/tracing/current_tracer && echo 1 > /sys/kernel/tracing/tracing_on && glxgears & sleep 3 && kill %1',
              'stoptracing并viewresult: echo 0 > /sys/kernel/tracing/tracing_on && cat /sys/kernel/tracing/trace | head -40',
              'viewschedulertimeoutconfiguration: dmesg | grep -i "timeout\\|scheduler" | head -10',
            ],
            expectedOutput: `$ sudo cat /sys/kernel/debug/dri/0/amdgpu_fence_info
--- ring gfx_0.0.0 ---
Last signaled fence          0x00008a31
Last emitted                 0x00008a34
  ← 3 个 job 正inexecute/queued

--- ring sdma0 ---
Last signaled fence          0x00000456
Last emitted                 0x00000456
  ← SDMA idle

$ cat /sys/kernel/tracing/trace | head -10
# tracer: function_graph
 sched-gfx_0-789  =>  amdgpu_job_run() {
 sched-gfx_0-789      amdgpu_ib_schedule() { ... }
 sched-gfx_0-789  } /* 5.234 us */   ← 单次 job scheduling约 5us`,
            hint: 'ftrace in sched-gfx_0 is GFX Ring 0 scheduler kthread. each timecall amdgpu_job_run correspondingoncecommandfromqueueto Ring commit. if "Last signaled" and "Last emitted" 差值很大且not变, indicate GPU hang. ',
          },
          debugExercise: {
            title: 'understand GPU hang timeout: schedulertimeout vs hardware hang',
            language: 'text',
            description: 'userreport GPU 频繁 "timeout" 但systemnotcrash. dmesg display周期性 ring timeout information. need判断is真正hardware hang stillisscheduler误判. ',
            question: 'analyzebelow两组 timeout log, 判断哪个is真正 GPU hang, 哪个isscheduler误判. explainyour推理process. ',
            buggyCode: `/* scenario A */
[  100.123] ring gfx_0.0.0 timeout, signaled seq=5000, emitted seq=5001
[  100.123] GRBM_STATUS=0x00000000 (GFX IDLE!)
[  100.124] CP_RB_RPTR=0x0000A000
[  100.124] CP_RB_WPTR=0x0000A000  (RPTR == WPTR)
[  100.125] GPU reset succeeded

/* scenario B */
[  200.456] ring gfx_0.0.0 timeout, signaled seq=8000, emitted seq=8004
[  200.456] GRBM_STATUS=0x00030300 (GUI_ACTIVE | GFX_BUSY | CP_BUSY)
[  200.457] CP_RB_RPTR=0x0000F100
[  200.457] CP_RB_WPTR=0x0000F200  (RPTR < WPTR, Ring hasnot yethandlecommand)
[  200.458] SRC_ID: 146, VMID: 3, addr: 0x0000DEAD0000
[  200.460] GPU reset succeeded`,
            hint: 'comparetwoscenario GRBM_STATUS(GPU whether繁忙)and RPTR/WPTR relationship(Ring whetherhasnot yethandlecommand). GFX_IDLE + RPTR==WPTR 意味着what? ',
            answer: 'scenario A isscheduler误判(false timeout), scenario B is真正 GPU hang. analyze: scenario A — GRBM_STATUS=0 represent GFX enginecompletelyidle(no任何活动), CP_RB_RPTR == CP_RB_WPTR indicate Ring Buffer as空(GPU alreadyhandleallcommand), signaled=5000, emitted=5001 indicate只差 1 个 fence not yet signal. 组合起: GPU actualonalreadycompleteexecute(Ring as空, GFX idle), 但 fence 值nocorrectupdate — mayis fence 写回interrupt丢失(interrupt coalescing or IH ring overflow)or writeback memory mappingissue. fix方向: check IH (Interrupt Handler) ring whetheroverflow, or fence writeback buffer  GPU→CPU coherence. scenario B — GRBM_STATUS display GUI_ACTIVE, GFX_BUSY, CP_BUSY(GPU 正inexecute但卡住), RPTR < WPTR(Ring inhasnot yethandlecommand), signaled=8000, emitted=8004(4 个 job 积压), SRC_ID:146 is VMC page fault, addr=0x0000DEAD0000 is明显 poison address. 这istypical GPU hang: GPU tryaccessinvalidvirtual addresscause VMC fault, GFX engine因 fault 而停滞. 根因isuser space use-after-free(release BO 但仍in shader in引用其address). ',
          },
          interviewQ: {
            question: 'Explain the DRM GPU scheduler\'s role in amdgpu command submission. How does it handle job scheduling and GPU hang detection?',
            difficulty: 'hard',
            hint: 'describeschedulerarchitecture(per-ring 实例, priorityqueue, schedulerthread), job lifecycle, and timeout→reset complete链条. ',
            answer: 'DRM GPU Scheduler in amdgpu command submissionin扮演三个core角色: (1)多process公平scheduling — eachcommitprocess(drm_sched_entity)hasself job queue, scheduler按照priority(KERNEL > HIGH > NORMAL > LOW)and公平性原则frommultiple entity inselect job execute. each Ring Buffer hasindependentscheduler实例and kthread, 使得 GFX, SDMA, VCN scheduling互not干扰. (2)Job lifecyclemanagement — completepath: usercommit ioctl → amdgpu_cs_submit() incall drm_sched_job_init()/arm()/push() will job 入队 → scheduler kthread select job → call amdgpu_job_run() callback → amdgpu_ib_schedule() will INDIRECT_BUFFER PM4 包write Ring → amdgpu_ring_commit() through Doorbell notify GPU CP → GPU executecompleteafterwrite fence 序列号 → interrupttrigger fence signal → schedulermark job complete. (3)GPU hang detect — scheduleraseachrunin job startup定时器(amdgpu GFX ring default 10 秒), if定时器to期而 fence not yet signal, call amdgpu_job_timedout(): firsttry soft recovery(send preempt 信号), iffailure则 dump GPU register(GRBM_STATUS, CP_RB_RPTR/WPTR, GPU fault information), finallycall amdgpu_device_gpu_recover() execute GPU mode 1/2 reset — savestate, 复位 GPU hardware, re-initializationall IP Block, 重commitnot yetcomplete job ormarkasfailurereturn -ECANCELED 给user space. ',
            amdContext: 'DRM GPU Scheduler 最初由 AMD engineer(Christian König)development. interviewindemonstrate你understandschedulerhow连接"user spacecommit"and"GPU execute", and timeout mechanismhowprotectsystem免受 GPU hang impact, is体现深度understandkey. ',
          },
        },

        // ── Lesson 5.4.3 ──────────────────────────────────────
        {
          id: '5-4-3',
          number: '5.4.3',
          title: 'GPU virtual memorysubsystem: amdgpu_vm 详解',
          titleEn: 'GPU Virtual Memory Subsystem: amdgpu_vm In-Depth',
          duration: 20,
          difficulty: 'expert',
          tags: ['GPUVM', 'amdgpu_vm', 'page-table', 'PDB', 'PTE', 'VM-fault', 'VMID'],
          concept: {
            summary: 'GPUVM(GPU Virtual Memory)is amdgpu virtual memorysubsystem, aseachprocessprovideindependent GPU virtualaddress space. 它use多级page table(PDB2→PDB1→PDB0→PD→PT→PTE, 最多 6 级, similar x86 但as GPU 定制)will GPU virtual address翻译as VRAM/GTT physical address. amdgpu_vm_bo_update() is最corefunction — whena Buffer Object by绑定to VM 时, 它create/update GPU page table条目. ',
            explanation: [
              'GPUVM page tablelayer次structure: AMD GPU use最多 6 级page table翻译virtual address, from高位to低位as: PDB2(Page Directory Base 2)→ PDB1 → PDB0 → PD(Page Directory)→ PT(Page Table)→ PTE(Page Table Entry). 每级索引usevirtual addressindifferent位域 — for example 48 位virtualaddress spacein, PDB2 use VA[47:39](9 位, 512 个条目), PDB1 use VA[38:30], PDB0 use VA[29:21], PT use VA[20:12], PTE instoragephysical页帧号. 这and x86 CPU  4/5 级page table概念相似, 但 GPUVM page tablestoragein VRAM in(rather thansystem memory), 由 GPU  UTCL2(Unified Translation Cache Level 2)hardwaretraverse. ',
              'struct amdgpu_vm 代表aprocess GPU virtualaddress space. each打开 /dev/dri/renderD128 processallwillcreatea amdgpu_vm 实例. core字段include: root — 根页directory(PDB2) Buffer Object, isentirepage table树entry point; va — red-black tree, recordallalreadymappingvirtual address区between(VA mapping); evicted — byevictionpage table BO list(when VRAM 压力大时page table本身alsomaybyevictionto GTT); last_update — 指向最近oncepage tableupdate fence, used for跟踪page tableupdate GPU 端completestate. page table BO managementis GPUVM 一大challenge — page table自身is also GPU memoryin Buffer Object, needthrough TTM management, 且in BO migration时needsynchronizationupdate. ',
              'amdgpu_vm_bo_update() is GPUVM 最corefunction — whena BO bymappingto某个process GPU virtualaddress space时, orwhen BO in VRAM and GTT 之betweenmigrationafterneedupdatemapping时, allwillcallthisfunction. 它workprocess: (1)traverse BO 关联all VA mapping(a BO maymappingtomultiplevirtual address); (2)对each mapping, call amdgpu_vm_update_ptes() updatecorrespondingpage table条目 — computeneedmodifywhichlevelpage table, will PTE physical address字段updateas BO 新location; (3)page tableupdatethrough SDMA Ring commit(SDMA 比 GFX 更高效地executememory填充operate), return fence used for跟踪updatecomplete. ',
              'GPUVM fault(VM fault)handleisdebugging GPU issuekeyscenario. when GPU accessanot yetmappingorinvalidvirtual address时, UTCL2(GPU  TLB/page tabletraversehardware)willgeneratea page fault interrupt. amdgpu interrupt handlingfunctionreceivetothisinterruptafter: (1)from IH ring inread fault information — include fault address(VA), VMID(identifier哪个processaddress space), is读stillis写, fault 源(GFX/SDMA/VCN 等); (2)in dmesg inrecord "[drm] VM fault (src_id:146, ring:0, vmid:3, addr:0xDEAD0000)"; (3)对user spaceprocess, usuallycause该process GPU contextbymarkashaserror. common VM fault cause: use-after-free(release BO after仍in shader in引用), out of boundsaccess(shader access超出 BO rangeaddress), page tablenot yetupdate(BO migrationafterpage tablesynchronizationfailure). ',
              'VM address space布局: GPUVM virtualaddress spaceusuallyas 48 位(256 TB), 分asseveralregion: 低addressregionallocation给user space BO mapping(through amdgpu_vm_bo_map allocation VA), 高addressregionreserve给kernel(如 kernel BO, page table自身). VA allocationuse drm_mm manager(between隔树/区betweenallocation), amdgpu_vm_bo_map() in VM  VA 空betweeninfind一block足够大idle区between, createmappingrecord(struct amdgpu_bo_va_mapping), 但此时stillnot写page table — page tableactualupdatelatencyto amdgpu_vm_bo_update() inexecute(incommand submissionbeforeensuremappingvalid). 这种"latencymapping"design减少not必topage tableupdate. ',
            ],
            keyPoints: [
              'GPUVM 多级page table: PDB2→PDB1→PDB0→PD→PT→PTE, 最多 6 级, storagein VRAM in',
              'struct amdgpu_vm: per-process GPU address space, contain根页directory BO and VA mappingred-black tree',
              'amdgpu_vm_bo_update(): corefunction, BO 绑定/migration时update GPU page table条目',
              'VM fault: GPU accessinvalid VA → UTCL2 generateinterrupt → dmesg record fault information(VMID + addr)',
              'page tableupdatethrough SDMA Ring commit, page table BO 自身also由 TTM management(maybyevictionto GTT)',
              'VA 空between布局: 48 位(256TB), user区in低address, kernelreservein高address',
            ],
          },
          diagram: {
            title: 'GPUVM 多级page tablestructureandaddress translation',
            content: `GPUVM 多级page tableaddress translation — AMD GPU virtual memory

GPU virtual address (48 bit):
┌──────┬──────┬──────┬──────┬──────┬──────┐
│PDB2  │PDB1  │PDB0  │ PD   │ PT   │Offset│
│[47:39]│[38:30]│[29:21]│[20:18]│[17:12]│[11:0]│
│9 bit │9 bit │9 bit │3 bit │6 bit │12 bit│
└──┬───┴──┬───┴──┬───┴──┬───┴──┬───┴──────┘
   │      │      │      │      │
   ▼      ▼      ▼      ▼      ▼
┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐
│PDB2  │→│PDB1  │→│PDB0  │→│ PD   │→│ PT   │→ physical页
│(根)  │  │      │  │      │  │      │  │      │  (VRAM/GTT)
│512项 │  │512项 │  │512项 │  │8项   │  │64项  │
│      │  │      │  │      │  │      │  │      │
│[idx] │  │[idx] │  │[idx] │  │[idx] │  │[idx] │
│  ↓   │  │  ↓   │  │  ↓   │  │  ↓   │  │  ↓   │
│next→ │  │next→ │  │next→ │  │next→ │  │PFN   │
└──────┘  └──────┘  └──────┘  └──────┘  └──────┘

PTE (Page Table Entry) format:
┌──────────────────────────────────────────────────┐
│ [63:57] reserve                                      │
│ [56:12] physical页帧号 (PFN) — VRAM or GTT physical address  │
│ [11]    P (Present) — 页whethervalid                  │
│ [10]    S (System) — 0=VRAM, 1=System Memory(GTT) │
│ [9:7]   MTYPE — memorytype (Cached/Uncached 等)     │
│ [6]     W (Writeable)                             │
│ [5]     R (Readable)                              │
│ [4]     X (Executable)                            │
│ [3:0]   Fragment — 大页support (similar CPU hugepage)    │
└──────────────────────────────────────────────────┘

struct amdgpu_vm (per-process GPU virtualaddress space):
┌──────────────────────────────────────────────────┐
│  root (BO)           ← PDB2 根页directory Buffer Object│
│  va (red-black tree)         ← all VA mapping 索引      │
│  evicted (linked list)      ← byevictionto GTT page table BO     │
│  invalidated (linked list)  ← needupdatemapping              │
│  last_update (fence) ← 最近page tableupdatecomplete跟踪      │
│  pasid               ← Process Address Space ID    │
└──────────────────────────────────────────────────┘
         │
         ▼ VM address space布局 (48-bit, 256 TB)
┌──────────────────────────────────────────────────┐
│ 0x000000000000 ──────────────────── user space      │
│   BO mappingregion (amdgpu_vm_bo_map allocation)            │
│   shader code, vertex buffer, texture,            │
│   framebuffer 等user BO mappingto这inside               │
│                                                   │
│ ~~~~~~~~~~~~~~~~~~~~~~~~ (巨大idle空between) ~~~~~~~~│
│                                                   │
│ 0xFFFFF0000000 ──────────────────── kernelreserve      │
│   kernel BO, page table自身, SVM reserveregion              │
│ 0xFFFFFFFFFFFF ──────────────────── address space顶部  │
└──────────────────────────────────────────────────┘

VM fault handleprocess:
GPU accessinvalid VA → UTCL2 TLB miss → page tabletraversefailure
  → VMC generate page fault interrupt (SRC_ID: 146)
    → IH ring record: {vmid, addr, rw, src}
      → amdgpu_vm_fault_handler()
        → dmesg: "VM fault (vmid:3, addr:0xDEAD0000)"
          → markprocess GPU contextaserrorstate`,
            caption: 'GPUVM 多级page tablestructureandaddress translationprocess. and x86 CPU page table概念相似, 但page tablestoragein VRAM in, 由 GPU  UTCL2 hardwaretraverse. PTE in S 位区分physical页isin VRAM stillis GTT(system memory)in. ',
          },
          codeWalk: {
            title: 'amdgpu_vm_bo_update — will BO mappingto GPU virtualaddress space',
            file: 'drivers/gpu/drm/amd/amdgpu/amdgpu_vm.c',
            language: 'c',
            code: `/* amdgpu_vm_bo_update() — update BO in GPU page tableinmapping
 * when BO 首次绑定to VM, or BO in VRAM↔GTT migrationaftercall
 * 这is GPUVM 最corefunction
 */
int amdgpu_vm_bo_update(struct amdgpu_device *adev,
                         struct amdgpu_bo_va *bo_va,
                         bool clear)
{
    struct amdgpu_bo *bo = bo_va->base.bo;
    struct amdgpu_vm *vm = bo_va->base.vm;
    struct list_head *head;
    int r;

    /* get BO physical address
     * if BO in VRAM: addr = VRAM offset
     * if BO in GTT:  addr = system memory DMA address
     * if clear=true: addr = 0 (解除mapping) */
    if (clear) {
        addr = 0;
        flags = 0;
    } else {
        addr = amdgpu_bo_gpu_offset(bo);
        flags = amdgpu_ttm_tt_pte_flags(adev, bo->tbo.ttm);
        /* flags contain: readable, writeable, executable,
         * MTYPE (cached/uncached), system vs vram */
    }

    /* traverse此 BO all VA mapping
     * a BO maymappingto同a VM multiplevirtual address */
    list_for_each_entry(mapping, &bo_va->invalids, list) {
        /* mapping->start: VA 起始address (页alignment)
         * mapping->last:  VA endaddress
         * addr:           physical address
         * flags:          PTE property (R/W/X, MTYPE 等) */

        r = amdgpu_vm_update_ptes(adev, vm,
                                   mapping->start,
                                   mapping->last + 1,
                                   addr, flags);
        if (r)
            return r;

        addr += (mapping->last - mapping->start + 1)
                * AMDGPU_GPU_PAGE_SIZE;
    }

    /* will mapping from invalids 移to valids list */
    list_splice_init(&bo_va->invalids, &bo_va->valids);

    /* commitpage tableupdateto SDMA Ring
     * SDMA 比 GFX 更适合大量小write (page tableupdate) */
    r = amdgpu_vm_update_pdes(adev, vm, false);

    /* record fence used for跟踪updatecomplete */
    vm->last_update = fence;
    return r;
}

/* amdgpu_vm_update_ptes — update指定 VA rangepage table条目 */
static int amdgpu_vm_update_ptes(struct amdgpu_device *adev,
                                  struct amdgpu_vm *vm,
                                  uint64_t start, uint64_t end,
                                  uint64_t dst, uint64_t flags)
{
    struct amdgpu_vm_update_params params;

    /* according to VA rangecomputeneedmodifywhichpage tablelevel
     * ifmappingsize >= 2MB 且alignment, canuse大页
     * (in PD leveldirectlymapping, 跳过 PT level) */
    amdgpu_vm_update_flags(&params, start, end, flags);

    /* traverse多级page table, findgoal PTE location
     * ifinbetweenlevel页directorynotexist, dynamiccreate
     * (allocation新 BO 作as页directory) */
    while (start < end) {
        /* computecurrent PTE correspondingpage table BO */
        pt_bo = amdgpu_vm_get_pt(&params, start);

        /* write PTE: will dst (physical address) writepage table条目
         * through SDMA WRITE_DATA commandexecute */
        amdgpu_vm_cpu_set_ptes(&params, pt_bo,
                                pe_start, dst, count,
                                AMDGPU_GPU_PAGE_SIZE,
                                flags);

        start += count * AMDGPU_GPU_PAGE_SIZE;
        dst += count * AMDGPU_GPU_PAGE_SIZE;
    }
    return 0;
}`,
            annotations: [
              'bo_va->invalids liststorageneedupdatemapping — BO migrationaftermapping变as invalid',
              'amdgpu_bo_gpu_offset return BO in VRAM/GTT inphysicaloffsetaddress',
              'PTE flags in S 位(System)决定 GPU through VRAM stillis PCIe accessphysical页',
              'amdgpu_vm_update_pdes ensure页directory链coherence — modify PTE afterneedflush TLB',
              'page tableupdatethrough SDMA commit — SDMA  memset/memcpy operate比 GFX 更高效',
              '大页support(PD leveldirectlymapping)减少page table级数, 提高 TLB 命in率',
            ],
            explanation: 'thisfunctionis GPU memory managementcore — each time BO byusebeforeallneedensure其mappingvalid. incommand submissionpathin(amdgpu_cs_parser_bos), driverwillcheckcommand引用all BO mappingstate, 对 invalid mappingcall amdgpu_vm_bo_update updatepage table. page tableupdateperformancedirectlyimpactcommand submissionlatency. ',
          },
          miniLab: {
            title: 'view GPU virtualmemory mappingandpage tableinformation',
            objective: 'through debugfs observe GPUVM addressmapping, page tablelayer级and VM fault handlemechanism. ',
            setup: `# ensure debugfs already挂载
sudo mount -t debugfs none /sys/kernel/debug 2>/dev/null
# 准备 GPU work负载trigger BO mapping
sudo apt install -y mesa-utils`,
            steps: [
              'viewall VMID allocation: sudo cat /sys/kernel/debug/dri/0/amdgpu_vm_info 2>/dev/null',
              'run GPU applicationtrigger VA mapping: glxgears & GLXPID=$!; sleep 2',
              'view GPU process BO list: sudo cat /sys/kernel/debug/dri/0/amdgpu_gem_info | head -30',
              'view VM statisticsinformation: sudo cat /sys/kernel/debug/dri/0/amdgpu_vm_info 2>/dev/null',
              'view近期whetherhas VM fault: dmesg | grep -i "vm fault\\|page fault\\|vmid" | tail -10',
              'cleanup: kill $GLXPID 2>/dev/null',
            ],
            expectedOutput: `$ sudo cat /sys/kernel/debug/dri/0/amdgpu_vm_info
VM info:
  num VMs: 3         ← currentactive GPU virtualaddress spacecount
  num page tables: 128   ← activepage table BO count
  VMID usage:
    VMID 0: kernel reserved
    VMID 1: pid 1234 (Xorg)
    VMID 3: pid 5678 (glxgears)

$ sudo cat /sys/kernel/debug/dri/0/amdgpu_gem_info | head -10
pid   5678 command glxgears:
  BO: 0x00007F0000000000 size: 16MB  domain: VRAM  ← 主 framebuffer
  BO: 0x00007F0001000000 size: 4MB   domain: VRAM  ← texture/vertex
  BO: 0x00007F0002000000 size: 256KB domain: GTT   ← command buffer
  ...`,
            hint: 'specific debugfs pathandoutputformat取决于kernelversion. amdgpu_gem_info displayeachprocess BO list及其 GPU virtual address, isunderstand VM mapping最directlyapproach. if VM info notavailable, try amdgpu_fence_info and dmesg 组合. ',
          },
          debugExercise: {
            title: 'diagnose VM fault: from dmesg output解码 fault addressand VMID',
            language: 'text',
            description: '生产environmentina GPU compute任务周期性trigger VM fault. belowis dmesg outputand相relationship统state. need解码 fault information并locate根因. ',
            question: '解码below VM fault information: 确定 fault 发生in哪个process, accesswhataddress, fault causeiswhat, andhowfix. ',
            buggyCode: `/* dmesg VM fault output */
[  456.789] amdgpu 0000:03:00.0: amdgpu:
  [gfxhub0] VMC page fault
  src_id:146 ring:0 vmid:5 pasid:32773
  addr:0x0000800100004000
  [read, type:4, protections:0x0]

/* GPU processinformation */
$ cat /sys/kernel/debug/dri/0/amdgpu_gem_info | grep "pid.*32773"
pid 32773 command my_compute_app:
  BO: 0x0000800100000000 size: 16KB domain: VRAM  flags: r/w
  BO: 0x0000800200000000 size: 4MB  domain: VRAM  flags: r/w

/* applicationcode片段 (OpenCL kernel) */
__kernel void process(__global float* input, int N) {
    int idx = get_global_id(0);
    /* input buffer size: 16KB = 4096 个 float */
    float val = input[idx];  /* idx may > 4096! */
    ...
}

/* startupconfiguration */
global_work_size = 8192;  /* 8192 个thread */
/* 但 input only 4096 个 float (16KB) */`,
            hint: 'compare fault address (0x0000800100004000) and BO mappingaddress (0x0000800100000000, size: 16KB=0x4000). fault address恰好in BO endboundary. ',
            answer: '解码analyze: (1)VMID=5, PASID=32773 — PASID is Process Address Space ID, through amdgpu_gem_info confirmis "my_compute_app" process(pid 32773). VMID=5 is GPU hardwareas该processallocationvirtualaddress spaceidentifier符. (2)Fault address=0x0000800100004000 — 该process input BO mappingin 0x0000800100000000, size 16KB(0x4000 bytes). BO overwriteaddressrangeis [0x800100000000, 0x800100004000). fault address 0x800100004000 恰好is BO 末尾(第aout of boundsaddress). (3)type:4 = "no valid PTE", protections:0x0 = "no permissions" — page tablein该addressnovalidmapping. (4)根因: 经典数组out of boundsaccess. OpenCL kernel startup 8192 个thread(global_work_size=8192), eachthreadread input[get_global_id(0)], 但 input buffer only 4096 个 float(16KB). whenthread ID >= 4096 时, accessaddress超出 BO mappingrange. thread 4096 accessaddress = base + 4096*4 = base + 0x4000, 正好trigger VM fault. fixplan: (a)增大 input buffer to 32KB(8192 个 float); (b)in kernel inaddboundarycheck: if (idx < N) val = input[idx]; (c)调整 global_work_size as 4096 以matchactualdata量. 这is GPU programmingin最common VM fault type — 等同于 CPU 端 segfault/out of boundsaccess. ',
          },
          interviewQ: {
            question: 'Describe the GPU virtual memory system in amdgpu and how it differs from CPU virtual memory.',
            difficulty: 'hard',
            hint: 'frompage tablestructure(多级, VRAM storage), address spacemanagement(per-process VM), fault handle(notcanrecover vs CPU  demand paging)andmappingupdatemechanism四个维度compare. ',
            answer: 'GPUVM and CPU virtual memorycompare: (1)page tablestructure — GPUVM use最多 6 级page table(PDB2→PDB1→PDB0→PD→PT→PTE), CPU x86_64 use 4-5 级(PML5→PML4→PDPT→PD→PT→PTE). keydifferenceis GPUVM page tablestoragein VRAM in(rather thansystem memory), 由 GPU  UTCL2 hardware单元traverse, 且page table BO 自身also由 TTM memory management器management(mayin VRAM 压力belowbyevictionto GTT). (2)address spacemanagement — 两者allis per-process independentaddress space: CPU use struct mm_struct, GPUVM use struct amdgpu_vm. GPU eachprocessallocationa VMID(similar CPU  ASID/PCID), used for TLB mark. GPUVM  VA allocationuse drm_mm 区betweenallocation器, mappingthrough amdgpu_vm_bo_map() 建立. (3)Fault handle — 这is最大difference. CPU page fault support demand paging(缺页时allocationphysical页并continueexecute), GPU VM fault usuallyisnotcanrecover — fault 发生时 GPU contextbymarkaserror, 该processafter续 GPU operatewillfailure. this is because GPU  wavefront(similar CPU thread)一旦遇to fault unable to干净地pauseandrecover. RDNA after期startsupport "recoverable page fault"(through SVM/XNACK mechanism), allowsimilar CPU  demand paging, 但needspecifichardwareand软件support. (4)mappingupdate — CPU page tableupdate由 CPU directly写memorycomplete(atomic operation + TLB flush), GPUVM page tableupdatethrough SDMA Ring commit GPU commandcomplete(asynchronousoperate, need fence 跟踪completestate). this means GPU page tableupdatehaslatency, mustincommand submissionbeforeensuremappingcomplete(through fence wait). amdgpu_vm_bo_update() iscorefunction, in amdgpu_cs_parser_bos() inaseach引用 BO checkandupdatemapping. ',
            amdContext: 'GPUVM is AMD interviewin高频深度话题, 尤其is Memory Management team. demonstrate你understand GPU and CPU virtual memory本质差异(fault handle, page tablestoragelocation, asynchronousupdate), 而not仅仅is类比"GPU alsohaspage table", is区分优秀candidatekey. ',
          },
        },
      ],
    },
  ],
  completionChecklist: [
    'can画出 amdgpu driversource codedirectorystructure, 说出each子directory职责(amdgpu/, display/dc/, amdkfd/, pm/)',
    'master cscope/ctags or clangd inkernelsource codein导航, can快速from dmesg errorlocatetosource codelocation',
    'understand IP Block architecture: 统一 amd_ip_funcs interface, initializationorderdependency, IP Discovery mechanism',
    'cancompletedescribecommand submissionpath: ioctl → parser → BO verify → scheduler → Ring Buffer → Doorbell → CP execute',
    'understand Fence synchronizationmechanism: emit/signal process, interrupt handling, GPU hang detectand复位',
    'understand DC displayenginearchitecture: DRM KMS → amdgpu_dm → DC Core → DCN hardwarelayer',
    'canthrough sysfs interface监控andcontrol GPU frequency/温度/功耗, understand SMU and DVFS workprinciple',
    'cananalyze dmesg in GPU errorinformation(ring timeout, underflow, VM fault)并locate根因',
    'Understand DC architecture: dc_state commit flow, DML bandwidth validation, DC vs DRM adapter layer',
    'Can explain DRM GPU Scheduler: job lifecycle, timeout handling, priority-based scheduling',
    'Understand GPUVM: multi-level page tables, amdgpu_vm_bo_update, VM fault diagnosis',
  ],
};
