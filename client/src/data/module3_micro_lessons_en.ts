// ============================================================
// AMD Linux Driver Learning Platform - Module 3 Micro-Lessons (English)
// Module 3: Linux Kernel & Driver Development (Linux kernelanddriver入门)
// 5 lessons in 2 groups, ~15 min each, total ~75 min
// ============================================================
import type { MicroLessonModule } from './micro_lesson_types';

export const module3MicroLessonsEn: MicroLessonModule = {
  moduleId: 'kernel',
  groups: [
    // ════════════════════════════════════════════════════════════
    // Group 3.1: Kernel Module Development (kernel moduledevelopment)
    // ════════════════════════════════════════════════════════════
    {
      id: '3-1',
      number: '3.1',
      title: 'kernel moduledevelopment',
      titleEn: 'Kernel Module Development',
      icon: 'Puzzle',
      description: 'from零writekernel module, understandmodulelifecycle, PCI driverframeworkandkernel特haserrorhandlepattern — theseisreadandcontribution amdgpu codebasicsskill. ',
      lessons: [
        // ── Lesson 3.1.1 ──────────────────────────────────────
        {
          id: '3-1-1',
          number: '3.1.1',
          title: 'kernel modulelifecycle: from insmod to rmmod',
          titleEn: 'Kernel Module Lifecycle: From insmod to rmmod',
          duration: 15,
          difficulty: 'intermediate',
          tags: ['kernel-module', 'insmod', 'rmmod', 'module_init', 'printk'],
          concept: {
            summary: 'kernel moduleis Linux candynamicloading/unloadingcode单元. eachmoduleneed module_init/module_exit entry point点, MODULE_LICENSE 声明, and遵循 __init/__exit memoryoptimization约定. amdgpu 本身isa庞大kernel module — understandmodulemechanismis读懂 amdgpu_drv.c 第一步. ',
            explanation: [
              'kernel module(Loadable Kernel Module, LKM)is Linux 最优雅design之一 — 它allowinnotrestartsystem, notre-compilationkernel情况below, dynamic地向runinkerneladdor移除function. your amdgpu driverisakernel module: systemstartup时 udev detectto AMD GPU hardware, automaticcall modprobe amdgpu loadingdrivermodule. ',
              'eachkernel modulemustdefinetwofunction: module_init() 指定initializationfunctioninmoduleloading时bycall(insmod/modprobe trigger), module_exit() 指定cleanupfunctioninmoduleunloading时bycall(rmmod trigger). initializationfunctionreturn 0 representsuccess, return负 errno 值representfailure(此时modulewill notbyloading). this约定贯穿entire Linux kernel — allinitializationfunctionall遵循"successreturn 0"规则. ',
              '__init and __exit iskernelmemoryoptimizationmacro. markas __init functionanddatainmoduleinitializationcompleteafterwillbyrelease — becauseinitializationcode只runonce, afternotagainneed. __exit markfunctioninmodulecompilation进kernel(rather than作ascanloadingmodule)时willbycompletely忽略, because内建driver永远will notbyunloading. 这种精细memory managementin嵌入式systemin尤asimportant. ',
              'MODULE_LICENSE("GPL") not仅is法律声明, 更hasactualtechnologyimpact. markas GPL modulecanusekernelinall EXPORT_SYMBOL_GPL 符号(如 DRM framework大部分 API), rather than GPL module只canuse EXPORT_SYMBOL 导出符号. amdgpu must声明 GPL only thencanuse DRM framework. if忘记声明 LICENSE, kernelwillin dmesg in打印 "module license taints kernel" 警告, and部分functionwillnotavailable. ',
              'printk iskernelin printf 等价物, 但它outputtokernelringlogbuffer(through dmesg read). printk has 8 个loglevel: KERN_EMERG(0) to KERN_DEBUG(7). in amdgpu driverin, 常用 DRM_INFO, DRM_WARN, DRM_ERROR 等macro — theyis printk encapsulation, willautomaticadd [drm] before缀andmoduleinformation. module_param macroallowuserinloadingmodule时passparameter, 如 modprobe amdgpu gpu_recovery=1. ',
            ],
            keyPoints: [
              'module_init(fn) / module_exit(fn) definemoduleentry pointandexit pointfunction',
              '__init markcodeininitializationafterbyrelease节省memory, __exit in内建moduleinby忽略',
              'MODULE_LICENSE("GPL") ismust — otherwiseunable touse EXPORT_SYMBOL_GPL 符号',
              'printk(KERN_INFO "msg") outputtokernelring buffer, 用 dmesg view',
              'module_param(name, type, perm) allowuserthrough insmod/modprobe 传参',
              'amdgpu  module_init call pci_register_driver registration PCI driver',
            ],
          },
          diagram: {
            title: 'kernel modulelifecycleandmemory management',
            content: `kernel modulefromloadingtounloadingcompletelifecycle

user space                                        kernel space
─────────                                       ─────────

  insmod hello.ko                               
  (or modprobe hello)                            
       │                                         
       ▼                                         
  sys_init_module()                              
       │                                         
       ├─ verify ELF format                          
       ├─ check MODULE_LICENSE                     
       ├─ parse module_param                       
       ├─ 符号重locate                              
       │  (linkingtokernel符号表)                       
       │                                         
       ▼                                         
  call module_init function                           
  ┌─────────────────────────────┐                
  │ static int __init hello_init(void)           │
  │ {                                            │
  │     printk(KERN_INFO "Hello!\\n");           │
  │     return 0;  ← success                        │
  │ }                                            │
  └─────────────────────────────┘                
       │                                         
       ▼                                         
  __init 段memorybyrelease ← 节省kernelmemory              
  module进入正常runstate                            
       │                                         
       │  (modulerunin...responseinterrupt/ioctl/sysfs)   
       │                                         
  rmmod hello                                    
       │                                         
       ▼                                         
  call module_exit function                           
  ┌─────────────────────────────┐                
  │ static void __exit hello_exit(void)          │
  │ {                                            │
  │     printk(KERN_INFO "Bye!\\n");             │
  │ }                                            │
  └─────────────────────────────┘                
       │                                         
       ▼                                         
  releasemoduleallmemory, 移除符号                      

amdgpu 实例: 
  module_init(amdgpu_init)                       
    └─ pci_register_driver(&amdgpu_kms_pci_driver)
       └─ kernelaseachmatch GPU call amdgpu_pci_probe()
  module_exit(amdgpu_exit)                       
    └─ pci_unregister_driver(&amdgpu_kms_pci_driver)
       └─ kernelaseach GPU call amdgpu_pci_remove()`,
            caption: 'modulefrom insmod loadingto rmmod unloadingcompletelifecycle. note __init 段ininitializationcompleteafteri.e.byrelease — 这iskernel对memory精细management. amdgpu  module_init registration PCI driver, triggerafter续 probe call链. ',
          },
          codeWalk: {
            title: 'amdgpu  module_init — driver真正entry point',
            file: 'drivers/gpu/drm/amd/amdgpu/amdgpu_drv.c',
            language: 'c',
            code: `/* amdgpu_drv.c — amdgpu drivermoduleentry point(简化版) */

#include <linux/module.h>
#include <linux/pci.h>
#include <drm/drm_drv.h>

/* moduleparameter: usercanthrough modprobe amdgpu gpu_recovery=0 modify */
int amdgpu_gpu_recovery = -1;
module_param_named(gpu_recovery, amdgpu_gpu_recovery, int, 0444);
MODULE_PARM_DESC(gpu_recovery,
    "Enable GPU recovery mechanism (-1=auto, 0=off, 1=on)");

/* PCI driverstructure体 */
static struct pci_driver amdgpu_kms_pci_driver = {
    .name      = "amdgpu",
    .id_table  = pciidlist,        /* supportdevice ID 表 */
    .probe     = amdgpu_pci_probe, /* device discovery时callback */
    .remove    = amdgpu_pci_remove,/* device removed时callback */
    .shutdown  = amdgpu_pci_shutdown,
    .driver.pm = &amdgpu_pm_ops,   /* power management(休眠/wakeup) */
};

/* moduleinitializationfunction — insmod/modprobe 时call */
static int __init amdgpu_init(void)
{
    int r;

    /* initialization DRM debuggingsystem */
    r = amdgpu_sync_init();
    if (r)
        return r;

    r = amdgpu_fence_slab_init();
    if (r)
        goto error_sync;

    /* core: registration PCI driver — 这willtrigger probe */
    r = pci_register_driver(&amdgpu_kms_pci_driver);
    if (r)
        goto error_fence;

    return 0;   /* success */

error_fence:
    amdgpu_fence_slab_fini();
error_sync:
    amdgpu_sync_fini();
    return r;   /* return负 errno */
}

/* module退出function — rmmod 时call */
static void __exit amdgpu_exit(void)
{
    pci_unregister_driver(&amdgpu_kms_pci_driver);
    amdgpu_fence_slab_fini();
    amdgpu_sync_fini();
}

module_init(amdgpu_init);
module_exit(amdgpu_exit);

MODULE_AUTHOR("AMD linux driver team");
MODULE_DESCRIPTION("AMD GPU kernel driver");
MODULE_LICENSE("GPL and additional rights");`,
            annotations: [
              'module_param_named allow modprobe amdgpu gpu_recovery=1 传参, 0444 represent sysfs in只读',
              'struct pci_driver is PCI drivercorestructure体, contain probe/remove callbackanddevice ID 表',
              'amdgpu_init use goto 链式cleanuppattern — initializationfailure时反向releasealreadyallocationresource',
              'pci_register_driver iskeycall: registrationafterkernelautomaticasmatchdevicecall probe',
              'amdgpu_exit cleanuporderand init initializationorder严格相反 — 这iskernelstandardpattern',
              'MODULE_LICENSE("GPL and additional rights") allow amdgpu useall GPL 导出kernel符号',
            ],
            explanation: 'thiscodeis amdgpu driver真正起点. when你run modprobe amdgpu 时, kernelcall amdgpu_init(), 它registration PCI driver. thenkernel PCI subsystem扫描总线, aseachmatch pciidlist  AMD GPU call amdgpu_pci_probe(). note goto cleanuppattern — 这inkernelcodein无处notin, Lesson 3.1.3 will深入讲解. ',
          },
          miniLab: {
            title: 'write并loadingyour第akernel module',
            objective: 'from零writea Hello World kernel module, compilation, loading, verify dmesg output, thenunloading. 这iskerneldevelopment"Hello World"仪式. ',
            steps: [
              'createworkdirectory: mkdir -p ~/kernel-labs/hello && cd ~/kernel-labs/hello',
              'create hello.c: 写acontain module_init/exit, printk, MODULE_LICENSE, module_param 最小module',
              'create Makefile: obj-m := hello.o, 指定 KDIR := /lib/modules/$(shell uname -r)/build',
              'compilationmodule: make -C $(KDIR) M=$(pwd) modules',
              'loadingmodule: sudo insmod hello.ko myname="student"(passmoduleparameter)',
              'check dmesg: dmesg | tail -5, should看toyour Hello messageandparameter值',
              'checkmoduleinformation: modinfo hello.ko, view license, description, parm 字段',
              'view sysfs parameter: cat /sys/module/hello/parameters/myname',
              'unloadingmodule: sudo rmmod hello, again次check dmesg 看to Goodbye message',
            ],
            expectedOutput: `$ sudo insmod hello.ko myname="student"
$ dmesg | tail -3
[12345.678] hello: Hello from kernel module! name=student
[12345.678] hello: Module loaded successfully

$ cat /sys/module/hello/parameters/myname
student

$ sudo rmmod hello
$ dmesg | tail -1
[12350.123] hello: Goodbye from kernel module!`,
          },
          debugExercise: {
            title: 'find缺失 MODULE_LICENSE',
            language: 'c',
            description: 'belowkernel modulecancompilation, 但loading时willgeneratekernel污染警告, 且certainfunctionnotavailable. findissue. ',
            question: 'thismodulehaswhatissue? loadingafterwill发生what? ',
            buggyCode: `#include <linux/module.h>
#include <linux/kernel.h>
#include <linux/init.h>

static int __init tainted_init(void)
{
    printk(KERN_INFO "Module loaded\\n");
    /* tryuse GPL-only  DRM framework API */
    /* drm_dev_alloc(...); */
    return 0;
}

static void __exit tainted_exit(void)
{
    printk(KERN_INFO "Module unloaded\\n");
}

module_init(tainted_init);
module_exit(tainted_exit);

MODULE_AUTHOR("Student");
MODULE_DESCRIPTION("A buggy module");
/* 缺少 MODULE_LICENSE! */`,
            hint: '缺少 MODULE_LICENSE not仅仅is法律issue — kernelwillwill该modulemarkas"tainted", 并limit其canuse符号集合. ',
            answer: 'issue: 缺少 MODULE_LICENSE 声明. after果has三个layer面: (1)kernel污染(Taint): loading时 dmesg 打印 "module: loading out-of-tree module taints kernel", kernel taint flagbyset(cat /proc/sys/kernel/tainted 变as非零), 这willcauseafter续 Bug reportbykerneldevelopment者忽略; (2)符号limit: unable touse EXPORT_SYMBOL_GPL 导出符号. DRM framework绝大部分 API(drm_dev_alloc, drm_mode_config_init 等)allis GPL-only , somodulewillinlinkingstage报 "Unknown symbol" errororrun时crash; (3)security告警: 部分kernelconfigurationwilldirectly拒绝loading无许can证声明module. fix: add MODULE_LICENSE("GPL"); i.e.can. for amdgpu typedriver, mustuse "GPL" or "GPL and additional rights". ',
          },
          interviewQ: {
            question: 'describe Linux kernel modulelifecycle. module_init and module_exit 作用iswhat? __init and __exit markhaswhat意义? ',
            difficulty: 'easy',
            hint: 'fromloading(insmod/modprobe)→ initialization → run → unloading(rmmod)completeprocessdescribe, 重点explain __init memoryoptimization作用and __exit in内建moduleinby忽略cause. ',
            answer: 'kernel modulelifecycle: (1)loadingstage: userexecute insmod/modprobe, kernelcall sys_init_module(), willmodule ELF 二进制loadingtokerneladdress space, 进行符号重locate(linkingtokernel符号表), parse module_param parameter; (2)initializationstage: kernelcall module_init() 指定function, 该functionallocationresource, registrationdriver/device, initializationdata structure. return 0 representsuccess, 非零(负 errno)representfailure, 此时modulewill notbyloading; (3)runstage: modulecode作askernel一部分run, responseinterrupt, system call, sysfs access等. 此时 __init 段alreadybyrelease; (4)unloadingstage: userexecute rmmod, kernelcall module_exit() 指定function, 该functionmust按initialization逆序releaseallresource(deregistrationdriver, releasememory, delete sysfs 条目), thenkernelreleasemodule占用allkernelmemory. __init markfunction/data放in特殊 .init.text/.init.data 段, initializationcompleteafterkernelcall free_initmem() releasethese段 — for amdgpu 这样大driver, 这canrelease数十 KB kernelmemory. __exit markfunctioninmodulecompilationas内建(obj-y rather than obj-m)时bycompilerdiscard, because内建driver永远will notbyunloading. ',
            amdContext: '这isbasics但importantissue. AMD interviewin期望你not仅know API, stillunderstand背aftermemoryoptimizationandsecurity考量. 提to amdgpu  module_init call pci_register_driver demonstrate你understandactualdriverimplementationapproach. ',
          },
        },

        // ── Lesson 3.1.2 ──────────────────────────────────────
        {
          id: '3-1-2',
          number: '3.1.2',
          title: 'PCI driverframework: probe and remove',
          titleEn: 'PCI Driver Framework: probe and remove',
          duration: 15,
          difficulty: 'intermediate',
          tags: ['PCI', 'pci_driver', 'probe', 'remove', 'pci_enable_device'],
          concept: {
            summary: 'PCI driverframeworkis Linux management PCI devicestandardinterface. driverthrough struct pci_driver registrationself, 声明supportdevice ID 表, kernelinfindmatchdevice时call probe callbackinitializationhardware. amdgpu_pci_probe is GPU driverinitialization真正起点 — probe in每一步(enable, set_master, ioremap_bar)allhaskeyhardwareconfiguration含义. ',
            explanation: [
              'struct pci_driver is PCI drivercoredata structure. 它contain: name(driver名称, displayin /sys/bus/pci/drivers/ below), id_table(supportdevicelist, struct pci_device_id 数组), probe(device discovery时callback function), remove(device removed时callback function), andcan选 suspend/resume(power managementcallback). kernel PCI subsystemthroughmatch id_table in Vendor:Device ID 决定哪个drivercanhandle哪个device. ',
              'probe functionisdriverinitializationcore. when PCI subsystemfindmatchdevice时, 它call probe(struct pci_dev *pdev, const struct pci_device_id *ent). probe functionreceivetwoparameter: pdev iskernelcreate PCI devicestructure体(containdeviceall PCI information), ent ismatchto ID 表条目(contain driver_data 字段, amdgpu 用它storage CHIP type). ',
              'probe functionmust按严格orderexecuteinitializationstep: (1)pci_enable_device(pdev) — enable PCI device, configuration I/O andmemoryaccess, enabledevice Bus Master 位; (2)pci_set_master(pdev) — allowdevice发起 DMA transfer(GPU needfromsystem memory读写data); (3)pci_ioremap_bar(pdev, n) — willdevice BAR(Base Address Register)mappingtokernelvirtualaddress space, 使drivercanthrough writel/readl access GPU registerand VRAM; (4)devicespecificinitialization(amdgpu herecall amdgpu_device_init initializationall IP Block). ',
              'remove functionis probe 逆operate — 它must按 probe 相反orderreleaseallresource. this"after进先出"cleanuppatterninkernelinis铁律. if probe allocationresource A → B → C, 那么 remove mustrelease C → B → A. 违反thisorderwillcauseresourceleak, use-after-free, orkernelcrash. ',
              'pci_device_id 表in driver_data 字段isdriver私hasdata. amdgpu 用它storage CHIP type枚举值(如 CHIP_NAVI33), probe functionthrough ent->driver_data getthis值, thenaccording to芯片typeselectcorrect IP Block implementation. 这种designletadrivercansupport数十种different型号 GPU. ',
            ],
            keyPoints: [
              'struct pci_driver contain name, id_table, probe, remove 四个core字段',
              'pci_enable_device() enable PCI device, pci_set_master() allow DMA transfer',
              'pci_ioremap_bar() will GPU  BAR 空betweenmappingtokernelvirtual addressused for MMIO access',
              'probe and remove must互as逆operate — resourceallocation/releaseorder严格相反',
              'pci_device_id.driver_data storagedriver私hasdata(amdgpu 用它storage CHIP type)',
              'probe failuremustcleanupalreadyinitializationresource并return负 errno(goto cleanuppattern)',
            ],
          },
          diagram: {
            title: 'PCI driver probe/remove callprocess',
            content: `PCI device discovery → probe initialization → remove cleanup

moduleloading (insmod amdgpu.ko)
   │
   ▼
module_init: amdgpu_init()
   │
   └─ pci_register_driver(&amdgpu_kms_pci_driver)
       │
       ▼
PCI subsystem扫描matchdevice
       │
       │  ┌─ pciidlist ─────────────────────────┐
       │  │ {0x1002, 0x7480, ..., CHIP_NAVI33}  │  ← match!
       │  └─────────────────────────────────────┘
       │
       ▼
amdgpu_pci_probe(pdev, ent)          │  amdgpu_pci_remove(pdev)
 ┌──────────────────────────┐        │   ┌──────────────────────────┐
 │ ① pci_enable_device()    │        │   │ ⑤ amdgpu_device_fini()   │
 │   enable PCI I/O andmemory    │        │   │   releaseall IP Block      │
 │                          │        │   │                          │
 │ ② pci_set_master()       │        │   │ ④ iounmap(rmmio)         │
 │   allow GPU 做 DMA        │        │   │   取消registermapping         │
 │                          │        │   │                          │
 │ ③ pci_ioremap_bar(0)     │        │   │ ③ pci_clear_master()     │
 │   mapping VRAM BAR          │        │   │   prohibit DMA              │
 │   pci_ioremap_bar(2)     │        │   │                          │
 │   mappingregister BAR         │        │   │ ② pci_release_regions()  │
 │                          │        │   │   release PCI resource          │
 │ ④ amdgpu_device_init()   │        │   │                          │
 │   initializationall IP Block     │        │   │ ① pci_disable_device()   │
 │   (GFX, SDMA, DC, ...)  │        │   │   disable PCI device          │
 │                          │        │   │                          │
 │ return 0;  ← success        │        │   │ (无return value, void function)    │
 └──────────────────────────┘        │   └──────────────────────────┘
                                     │
  ← initializationorder ① ② ③ ④              │   cleanuporder ⑤ ④ ③ ② ① →
                                     │   严格逆序! `,
            caption: 'probe and remove is严格镜像relationship — probe 按 1234 orderinitialization, remove 按 4321 逆序cleanup. 这iskerneldriverdevelopment铁律. ',
          },
          codeWalk: {
            title: 'amdgpu_pci_probe — GPU initialization起点(简化版)',
            file: 'drivers/gpu/drm/amd/amdgpu/amdgpu_drv.c',
            language: 'c',
            code: `/* amdgpu_pci_probe — whenkernelfindmatch AMD GPU 时call */
static int amdgpu_pci_probe(struct pci_dev *pdev,
                             const struct pci_device_id *ent)
{
    struct drm_device *ddev;
    struct amdgpu_device *adev;
    unsigned long flags = ent->driver_data;
    /* ent->driver_data = CHIP_NAVI33(your GPU)*/
    int ret;

    /* Step 1: enable PCI device */
    ret = pci_enable_device(pdev);
    if (ret)
        return ret;

    /* Step 2: allow GPU 做 DMA transfer */
    pci_set_master(pdev);

    /* Step 3: allocation DRM devicestructure体 */
    ddev = drm_dev_alloc(&amdgpu_kms_driver, &pdev->dev);
    if (IS_ERR(ddev)) {
        ret = PTR_ERR(ddev);
        goto err_pci;
    }
    adev = drm_to_adev(ddev);

    /* Step 4: mapping GPU register BAR tokernelvirtual address */
    adev->rmmio_base = pci_resource_start(pdev, 5);
    adev->rmmio_size = pci_resource_len(pdev, 5);
    adev->rmmio = ioremap(adev->rmmio_base, adev->rmmio_size);
    if (!adev->rmmio) {
        ret = -ENOMEM;
        goto err_drm;
    }
    /* 现incanthrough WREG32/RREG32 access GPU register */

    /* Step 5: initialization GPU all IP Block */
    ret = amdgpu_device_init(adev, flags);
    if (ret)
        goto err_ioremap;

    return 0;

err_ioremap:
    iounmap(adev->rmmio);
err_drm:
    drm_dev_put(ddev);
err_pci:
    pci_disable_device(pdev);
    return ret;
}`,
            annotations: [
              'ent->driver_data contain CHIP type(如 CHIP_NAVI33), pass给 amdgpu_device_init 决定loadingwhich IP Block',
              'pci_enable_device configuration PCI commandregister, enable I/O andmemory空betweenaccess',
              'pci_set_master set PCI commandregister Bus Master 位 — GPU needthrough DMA 读写system memory',
              'ioremap willphysical addressmappingtokernelvirtual address — after WREG32/RREG32 throughthismappingaccess GPU register',
              'IS_ERR/PTR_ERR macroused forhandlereturn ERR_PTR(-errno) kernelfunction(pointer编码error code)',
              'goto err_xxx iskernelstandarderrorcleanuppattern — eacherrorlabelrecovertocorrespondingstepbeforestate',
            ],
            explanation: 'amdgpu_pci_probe isyour GPU driverinitialization起点. 它按严格orderexecute 5 个keystep: enable PCI device → allow DMA → allocation DRM device → mapping GPU register → initialization IP Block. 任何stepfailureallthrough goto 跳转to相应errorlabel, 按逆序cleanupalreadyallocationresource. 这种 goto 链式cleanuppatternis你inentire amdgpu code库inwill反复看tocorepattern. ',
          },
          miniLab: {
            title: 'writeamatch AMD GPU Vendor ID 最小 PCI driver',
            objective: 'writea最小 PCI driver, registration AMD  Vendor ID (0x1002), in probe 时打印deviceinformation. understand PCI driverframeworkcoreprocess. ',
            steps: [
              'create mini_pci.c: define pci_device_id 表(match Vendor=0x1002, Device=PCI_ANY_ID)',
              'implementation probe function: 打印 pci_name(pdev), pdev->vendor, pdev->device',
              'implementation remove function: 打印deviceby移除message',
              'define struct pci_driver 并in module_init incall pci_register_driver',
              'create Makefile 并compilation',
              'note: nottoinhasreal amdgpu driverrunsystemonloading此module — twodriverwill冲突. use KVM virtual machineor仅checkcompilationwhetherthrough',
              'viewcompilationoutputconfirm无警告, 用 modinfo viewmoduleinformation',
            ],
            expectedOutput: `$ make
make -C /lib/modules/$(uname -r)/build M=$(pwd) modules
  CC [M]  mini_pci.o
  MODPOST
  CC [M]  mini_pci.mod.o
  LD [M]  mini_pci.ko

$ modinfo mini_pci.ko
filename:       mini_pci.ko
license:        GPL
description:    Minimal AMD PCI driver for learning
alias:          pci:v00001002d*sv*sd*bc*sc*i*  ← match AMD Vendor ID`,
          },
          debugExercise: {
            title: 'find probe functioninerrorcleanuporderissue',
            language: 'c',
            description: 'below PCI probe functionerrorhandlepathhasaresourcecleanupordererror, maycausekernelcrash. ',
            question: 'errorcleanuppathhaswhatissue? maycausewhatafter果? ',
            buggyCode: `static int my_probe(struct pci_dev *pdev,
                    const struct pci_device_id *ent)
{
    void __iomem *regs;
    int ret;

    ret = pci_enable_device(pdev);
    if (ret)
        return ret;

    pci_set_master(pdev);

    regs = pci_ioremap_bar(pdev, 0);
    if (!regs) {
        ret = -ENOMEM;
        goto err_disable;  /* BUG: 跳过 pci_clear_master! */
    }

    ret = init_hardware(regs);
    if (ret)
        goto err_disable;  /* BUG: no iounmap(regs)! */

    return 0;

err_disable:
    pci_disable_device(pdev);
    return ret;
}`,
            hint: 'compare probe initializationorder(enable → set_master → ioremap → init_hw)anderrorpathcleanuporder — whether严格逆序? ',
            answer: 'two严重 Bug: (1)init_hardware failure时directly goto err_disable, 跳过 iounmap(regs) — 这causekernelvirtualaddress spaceleak. in长时betweenrunsystemin, 反复loading/unloadingmodulewill耗尽kernel vmalloc 空between. (2)ioremap failure时 goto err_disable also跳过 pci_clear_master — although pci_disable_device willbetween接cleanup Bus Master 位, 但最佳实践isexplicitcall. correctfix: addtwoerrorlabel, 按逆序cleanup: err_ioremap: iounmap(regs); err_master: pci_clear_master(pdev); err_disable: pci_disable_device(pdev); 并let init_hardware failure跳to err_ioremap, ioremap failure跳to err_master. this is whykerneldevelopment者use goto 链式cleanup — 它canensureeacherrorpathallhascorrect, completeresourcereclaim. ',
          },
          interviewQ: {
            question: 'describe Linux PCI driver probe and remove callback. in amdgpu driverin, probe function做whichkeyoperate? ',
            difficulty: 'medium',
            hint: '按orderdescribe probe step: pci_enable_device → pci_set_master → ioremap BAR → amdgpu_device_init. 强调每一步hardwareconfiguration含义and probe/remove 镜像relationship. ',
            answer: 'PCI driverthrough struct pci_driver registration, where probe indevicebyfind时call, remove indevice removed时call. amdgpu  probe(amdgpu_pci_probe)keystep: (1)pci_enable_device — 向 PCI configuration spacewritecommandregister, enabledevice I/O andmemory空betweenaccess, 并allocation IRQ; (2)pci_set_master — set PCI commandregister Bus Master Enable 位, allow GPU 发起 DMA transfer(GPU through DMA fromsystem memoryreadcommandbufferand纹理data); (3)ioremap BAR — will GPU  BAR register空between(physical address)mappingtokernelvirtual address, 使drivercanthrough writel/readl access GPU 数千个controlregister; (4)amdgpu_device_init — according to CHIP type(from pci_device_id.driver_data get)loadingcorresponding IP Block implementation(GFX, SDMA, DC, VCN, SMU), loadingfirmware, initializationmemory management器(TTM), command scheduling器(GPU scheduler), interrupt handling, displaymodule(KMS). remove function(amdgpu_pci_remove)按严格逆序execute: 关闭display → stopscheduler → release IP Block → iounmap → pci_clear_master → pci_disable_device. probe and remove 镜像relationshipensureresourcewill notleak. ',
            amdContext: 'AMD interviewin这iscoreissue. 除know API 名称, 更importantisunderstand每步hardware含义: pci_set_master let GPU 成as PCI 总线主控device, ioremap 建立 CPU to GPU register通信channel. ',
          },
        },

        // ── Lesson 3.1.3 ──────────────────────────────────────
        {
          id: '3-1-3',
          number: '3.1.3',
          title: 'kernelerrorhandle: goto 链式cleanuppattern',
          titleEn: 'Kernel Error Handling: The goto Cleanup Chain Pattern',
          duration: 15,
          difficulty: 'intermediate',
          tags: ['goto', 'error-handling', 'errno', 'IS_ERR', 'cleanup'],
          concept: {
            summary: 'inuser spacecodein goto is禁忌, 但in Linux kernelin goto is最常用errorhandlepattern. whenafunctionneed按ordergetmultipleresource时, goto 链式cleanupensure任何stepfailureallcancorrectreleasebeforegetresource. amdgpu_device_init hasexceed 20 个 goto label — understandthispatternis读懂kernelcodekey. ',
            explanation: [
              'whykernel偏爱 goto? 考虑aneedget 5 个resourcefunction: ifstep 3 failure, needreleaseresource 2 and 1(按逆序); ifstep 5 failure, needrelease 4, 3, 2, 1. 用嵌套 if-else implementationthislogicwillcause深度嵌套and大量重复code, 而 goto can用线性, 扁平codestructure优雅地resolve. Linus Torvalds 本人inkernel编码风格文档in明确recommended这种pattern. ',
              'standardpattern很simple: infunction末尾define一serieserrorlabel(fromfinallygetresourceto最先getresource), eachlabelreleasecorrespondingresource并 fall through tobelowalabel. initializationcodeinif某步failure, goto to该stepcorrespondingerrorlabel — labelafterallcleanupcodewill按逆序automaticexecute. 这ensureeachresource只insuccessgetafteronly thenneedrelease. ',
              'kerneluse负 errno 值作aserror code(如 -ENOMEM, -EINVAL, -EIO). successreturn 0, failurereturn负值. this约定贯穿entirekernel. IS_ERR(ptr) macrocheckapointerwhether编码error code(pointer值in -1 to -MAX_ERRNO range内), PTR_ERR(ptr) from编码errorpointerinextract errno 值, ERR_PTR(errno) will errno 编码aspointer. 这种"errorpointer"mechanismletfunctioncaninareturn valueinmeanwhile表达"success(returnvalidpointer)"and"failure(return编码error code假pointer)". ',
              'amdgpu_device_init is这种patterntypical案例. 它needinitialization十severalsubsystem: doorbell, VRAM, IP discovery, firmware loading, 各个 IP Block 等. eachsubsysteminitializationallmayfailure, moreoverafter面subsystemdependencybefore面. function末尾hasa长长 goto label链, ensure任何stepfailureallcancorrect回滚. 这is not糟糕编码风格 — 这is经过数十年verify, 最can靠kernelresourcemanagementpattern. ',
              'common反patternis忘记inerrorpathinreleaseresource — 这willcausekernelmemoryleak. Linux has专门tool(kmemleak, smatch, sparse)staticdetect这类 Bug. incommit amdgpu patch时, reviewerwill特别关注errorpathresourcereleasewhethercomplete. ',
              'Modern kernel development (5.x+) also uses dev_err_probe() for probe-time errors. This function combines dev_err() with returning the error code, and specially handles -EPROBE_DEFER (deferred probing — when a dependency isn\'t ready yet). In amdgpu, you\'ll see patterns like: return dev_err_probe(dev, ret, "failed to init GMC"); which prints the error AND returns the error code in one line. It\'s cleaner than the traditional if (ret) { dev_err(...); return ret; } pattern. Understanding dev_err_probe is essential because reviewers on amd-gfx will request you use it for new probe-path error handling.',
            ],
            keyPoints: [
              'goto inkernelinisrecommendederrorhandlepattern — Linus in CodingStyle in明确support',
              'standardpattern: errorlabel按resourceget逆序排列, eachlabelreleasearesource并 fall through',
              '负 errno 值iskernelstandarderror code: -ENOMEM(12), -EINVAL(22), -EIO(5) 等',
              'IS_ERR/PTR_ERR/ERR_PTR macroused forpointer编码error code — common于returnpointerfunction',
              'amdgpu_device_init has 20+ 个 goto label, is goto 链式cleanup大型实例',
              '忘记inerrorpathreleaseresource = kernelmemoryleak → kmemleak/smatch candetect',
              'dev_err_probe() is the modern (5.x+) pattern for probe-time errors — combines error logging and -EPROBE_DEFER handling',
            ],
          },
          diagram: {
            title: 'goto 链式cleanup vs 嵌套 if-else compare',
            content: `两种errorhandle风格compare: 嵌套 if-else vs goto 链式cleanup

approach A: 嵌套 if-else(user space风格, kernelinnotrecommended)
┌──────────────────────────────────────────────┐
│ int init() {                                  │
│     a = alloc_a();                            │
│     if (a) {                                  │
│         b = alloc_b();                        │
│         if (b) {                              │
│             c = alloc_c();                    │
│             if (c) {                          │
│                 return 0;   /* success */        │
│             }                                 │
│             free_b(b);      ← 缩进地狱       │
│         }                                     │
│         free_a(a);                            │
│     }                                         │
│     return -ENOMEM;                           │
│ }                                             │
│  issue: 嵌套深, 重复多, 难维护                  │
└──────────────────────────────────────────────┘

approach B: goto 链式cleanup(kernelrecommendedpattern)
┌──────────────────────────────────────────────┐
│ int init() {                                  │
│     a = alloc_a();                            │
│     if (!a) { ret = -ENOMEM; goto err_a; }   │
│                                               │
│     b = alloc_b();                            │
│     if (!b) { ret = -ENOMEM; goto err_b; }   │
│                                               │
│     c = alloc_c();                            │
│     if (!c) { ret = -ENOMEM; goto err_c; }   │
│                                               │
│     return 0;          /* success — 扁平structure */  │
│                                               │
│ err_c:                 ← 逆序cleanuplabel         │
│     free_b(b);                                │
│ err_b:                                        │
│     free_a(a);                                │
│ err_a:                                        │
│     return ret;                               │
│ }                                             │
│  优点: 扁平, 清晰, correct, can维护               │
└──────────────────────────────────────────────┘

in amdgpu_device_init inactualapplication: 
init_doorbell → init_amdgpu_vram_mgr → ip_discovery →
fw_load → ip_init → ring_test → ...
       │                    │
       failure?                failure?
       goto err_doorbell    goto err_fw
                ↓                  ↓
         ... → free_fw → free_ip_disc → free_vram → free_doorbell`,
            caption: 'goto 链式cleanupiskernelstandarderrorhandlepattern. amdgpu_device_init 等大型initializationfunctionin, goto label链canhas 20+ 个node, ensureeachfailurepathallcorrectreclaimresource. ',
          },
          codeWalk: {
            title: 'amdgpu_device_init in goto cleanup链(简化)',
            file: 'drivers/gpu/drm/amd/amdgpu/amdgpu_device.c',
            language: 'c',
            code: `/* amdgpu_device_init — GPU completeinitialization(简化demonstrate goto pattern) */
int amdgpu_device_init(struct amdgpu_device *adev,
                        uint32_t flags)
{
    int r;

    /* Step 1: initialization Doorbell mapping */
    r = amdgpu_device_doorbell_init(adev);
    if (r) {
        dev_err(adev->dev, "doorbell init failed: %d\\n", r);
        return r;  /* 无resourceneedcleanup */
    }

    /* Step 2: IP Discovery — detect GPU hardwaremodule */
    r = amdgpu_discovery_set_ip_blocks(adev);
    if (r) {
        dev_err(adev->dev, "ip discovery failed: %d\\n", r);
        goto failed_doorbell;
    }

    /* Step 3: loading GPU firmware */
    r = amdgpu_device_fw_loading(adev);
    if (r) {
        dev_err(adev->dev, "fw loading failed: %d\\n", r);
        goto failed_ip;
    }

    /* Step 4: initializationall IP Block hardware */
    r = amdgpu_device_ip_init(adev);
    if (r) {
        dev_err(adev->dev, "ip_init failed: %d\\n", r);
        goto failed_fw;
    }

    /* Step 5: registration GPU memory managementanddisplay */
    r = amdgpu_ttm_init(adev);
    if (r) {
        dev_err(adev->dev, "ttm init failed: %d\\n", r);
        goto failed_ip_init;
    }

    return 0;  /* allinitializationsuccess */

/* === goto cleanup链: 严格逆序 === */
failed_ip_init:
    amdgpu_device_ip_fini(adev);      /* 反initialization IP Block */
failed_fw:
    amdgpu_ucode_release(&adev->firmware);  /* releasefirmware */
failed_ip:
    /* IP discovery cleanup */
failed_doorbell:
    amdgpu_device_doorbell_fini(adev); /* release doorbell mapping */
    return r;
}

/* IS_ERR / PTR_ERR 用法example */
struct amdgpu_bo *amdgpu_bo_create_example(void)
{
    struct amdgpu_bo *bo;
    bo = amdgpu_bo_create(adev, size, PAGE_SIZE, ...);
    if (IS_ERR(bo)) {
        /* bo is notvalidpointer, but rather编码error code */
        int err = PTR_ERR(bo);  /* extract -ENOMEM 等 */
        pr_err("BO alloc failed: %d\\n", err);
        return ERR_PTR(err);    /* 传播error */
    }
    /* bo isvalidpointer, canuse */
    return bo;
}`,
            annotations: [
              'eachstepfailureafter goto tocorrespondinglabel — label名usually以 failed_ or err_ 开头',
              'dev_err 替代 printk, automaticadddevice名before缀, 方便in多 GPU systemin区分源',
              'cleanup链ineachlabel fall through tobelowa — release ip_init afterautomaticcontinuerelease fw, ip, doorbell',
              'IS_ERR checkpointerwhetherin (-1, -MAX_ERRNO) range内 — theseaddressinkernelinnotmayisvalid',
              'PTR_ERR will"errorpointer"convert回 int error code, ERR_PTR will int error codeconvertas"errorpointer"',
              'actual amdgpu_device_init has更多stepandlabel — 这inside只demonstratecorepattern',
            ],
            explanation: 'goto 链式cleanupletthiscomplexinitializationfunction保持扁平andcan读. 想象if用嵌套 if-else — 5 个stepneed 5 layer缩进. actual amdgpu_device_init has十severalstep, 嵌套approach根本notcan行. IS_ERR/PTR_ERR macro则resolve另aissue: howinreturnpointerfunctioninmeanwhile传达errorinformation. 这两种mechanismiskernelerrorhandle基石. ',
          },
          miniLab: {
            title: 'will嵌套 if-else 重构as goto cleanuppattern',
            objective: '给定一段use嵌套 if-else resourceinitializationcode, will其重构askernel风格 goto 链式cleanuppattern. ',
            steps: [
              'readbelow嵌套 if-else code(allocation 3 个resource: buffer, lock, workqueue)',
              '识别eachresourceallocation/release对(alloc↔free, init↔destroy, create↔destroy)',
              '按getorder列出resource: buffer → lock → workqueue',
              '重写as goto pattern: 主path线性排列, 末尾按逆序definecleanuplabel',
              'compilation并verifyineachfailure点(故意return -ENOMEM)allcancorrectcleanup',
              'use kmemleak(ifavailable)verifynomemoryleak',
            ],
            expectedOutput: `重构before(嵌套 if-else, 4 layer缩进): 
int init() {
    buf = kmalloc(...);
    if (buf) {
        mutex_init(&lock);
        wq = alloc_workqueue("my_wq", WQ_UNBOUND, 0);
        if (wq) {
            return 0;
        }
        mutex_destroy(&lock);
        kfree(buf);
    }
    return -ENOMEM;
}

重构after(goto 链式cleanup, 0 layer多余缩进): 
int init() {
    buf = kmalloc(...);
    if (!buf) { ret = -ENOMEM; goto err_buf; }
    mutex_init(&lock);
    wq = alloc_workqueue("my_wq", WQ_UNBOUND, 0);
    if (!wq) { ret = -ENOMEM; goto err_wq; }
    return 0;
err_wq:
    mutex_destroy(&lock);
    kfree(buf);
err_buf:
    return ret;
}`,
          },
          debugExercise: {
            title: 'finderrorpathin遗漏resourcerelease',
            language: 'c',
            description: 'belowfunctionerrorpathin遗漏akeyresourcerelease, willcausekernelmemoryleak. ',
            question: '哪个errorpath遗漏resourcerelease? leakiswhatresource? ',
            buggyCode: `static int my_device_init(struct my_device *dev)
{
    int ret;

    dev->regs = ioremap(dev->phys_addr, dev->size);
    if (!dev->regs)
        return -ENOMEM;

    dev->irq_data = kzalloc(sizeof(*dev->irq_data), GFP_KERNEL);
    if (!dev->irq_data) {
        ret = -ENOMEM;
        goto err_regs;
    }

    ret = request_irq(dev->irq, my_irq_handler, 0, "mydev", dev);
    if (ret)
        goto err_regs;  /* BUG! should goto err_irq_data */

    return 0;

err_irq_data:
    kfree(dev->irq_data);
err_regs:
    iounmap(dev->regs);
    return ret;
}`,
            hint: '逐步checkeachfailurepathcleanup: request_irq failure时, ioremap mappingand kzalloc memorywhetherallbyrelease? ',
            answer: 'Bug in request_irq failure时 goto err_regs 而is not goto err_irq_data. 此时 dev->irq_data alreadythrough kzalloc allocationmemory, 但 goto err_regs 跳过 kfree(dev->irq_data), directlyexecute iounmap. result: dev->irq_data 指向memory永远will notbyrelease — 这isakernelmemoryleak(kernel memory leak). fix: will goto err_regs 改as goto err_irq_data. 这类 Bug incode reviewin非常common — 新增ainitializationstepafter忘记updatealreadyhaserrorpath goto goal. tooldetect: smatch(staticanalyze器)candetect这类resourceleak; run时available kmemleak detect(echo scan > /sys/kernel/debug/kmemleak). amdgpu  CI systemwillautomaticrunthesecheck. ',
          },
          interviewQ: {
            question: 'why Linux kernelcodein大量use goto? 这not违反structure化programming原则吗? explainkernel goto 链式cleanuppattern. ',
            difficulty: 'medium',
            hint: 'fromactualissue出发: 多resourcegetfunctionin, eachstepallmayfailure, needreleasealreadygetresource. compare嵌套 if-else can读性and goto 扁平性. ',
            answer: 'Linux kernel大量use goto is经过深思熟虑工程决策, is not编码风格妥协. cause: (1)kernelfunction经常need按序getmultipleresource(memory, mapping, 锁, interrupt等), 任何stepallmayfailure, failure时mustreleasealreadygetresource. 用嵌套 if-else implementationwillcausecode缩进越越深("三角形code"), can读性差且容易遗漏cleanupstep. goto 链式cleanuplet主path(happy path)保持线性, 零缩进, allerrorhandle集ininfunction末尾. (2)goto 只used forfunction内"向before跳转tocleanuplabel" — will not跨function, will not形成循环, will not跳过variableinitialization. 这种受限useapproachcompletely符合structure化programming精神. (3)Linus Torvalds in Documentation/process/coding-style.rst in明确recommended此pattern. (4)actual效果: use goto kernelcode Bug 率并not高于other语言 — 相反, becausecleanuplogic集inin一处, 审查时更容易find遗漏resourcerelease. IS_ERR/PTR_ERR macro补充 goto pattern, letreturnpointerfunctionalsocan优雅地传播error code. ',
            amdContext: 'AMD interviewinif你canexplain清楚 goto inkernelin正when性, 并用 amdgpu_device_init 作as例子, willdemonstrate出你对kernel编码哲学深入understand — 这not仅仅istechnologyability, 更is对kernel文化认同. ',
          },
        },
      ],
    },

    // ════════════════════════════════════════════════════════════
    // Group 3.2: Kernel Internals for Driver Development
    // ════════════════════════════════════════════════════════════
    {
      id: '3-2',
      number: '3.2',
      title: 'driverdevelopmentessentialkernel知识',
      titleEn: 'Kernel Internals for Driver Development',
      icon: '⚙️',
      description: 'masterdriverdevelopment所需kernelcoremechanism: 并发synchronization原语andmemory management. amdgpu in大量use spinlock, mutex, kmalloc and slab — understandthesemechanismonly thencan读懂driverresourcemanagementcode. ',
      lessons: [
        // ── Lesson 3.2.1 ──────────────────────────────────────
        {
          id: '3-2-1',
          number: '3.2.1',
          title: 'kernelsynchronization原语: from spinlock to RCU',
          titleEn: 'Kernel Synchronization Primitives: From Spinlock to RCU',
          duration: 15,
          difficulty: 'intermediate',
          tags: ['spinlock', 'mutex', 'semaphore', 'atomic', 'RCU', 'synchronization'],
          concept: {
            summary: 'kernelcoderunin多核 CPU on且随时maybyinterrupt打断 — nosynchronizationmechanism意味着data竞争andcrash. Linux providefrom轻量级 spinlock toadvanced RCU 多layersynchronization原语, 每种适used fordifferentscenario. amdgpu driverin mutex protect VRAM manager, spinlock protectinterruptcontextdata structure — 选错synchronization原语willcausedeadlockorperformance灾难. ',
            explanation: [
              'Spinlock(spinlock)is最basickernel锁. whena CPU core持has spinlock 时, other试图get该锁corewill原地"自旋"(busy-wait), not断check锁whetherrelease. Spinlock key约束: (1)持has spinlock 期betweencannot sleep(sleep) — becausespin wait者占用 CPU 100%, if持has者sleep, 自旋者永远unable toget锁, 造成deadlock; (2)critical sectionmust很短(usually < 1μs); (3)ininterruptcontextinmustuse spin_lock_irqsave/spin_unlock_irqrestore(disableinterrupt), otherwiseifinterrupt handlingprogramalsotryget同a锁, will发生单核自deadlock. ',
              'Mutex(mutex)适used formayneed较长时betweencritical section. and spinlock different, wait mutex threadwillby放入wait queue并进入sleepstate, not浪费 CPU 时between. 代价iscontext切换(约 1-10μs)比自旋(约 10-100ns)慢. Mutex key约束: (1)只caninprocesscontext(process context)inuse — interruptcontextcannot sleep, thereforenotcanuse mutex; (2)同一threadnotcan递归get同a mutex(deadlock); (3)持has者mustin同一threadinrelease. ',
              'RW Semaphore(读写semaphore)optimization"多读少写"scenario. multiple读者canmeanwhileholding lock(并发readwill not破坏data), 但写者need独占(waitall读者releaseafteronly thencanget). amdgpu  VM(virtual memory)subsystemuse rw_semaphore protectpage table — GPU command submission时并发readpage table, 但page tableupdate(如 BO mapping变化)need写锁. ',
              'Atomic operateis最轻量synchronizationmechanism — use CPU atomicinstruction(如 x86  LOCK before缀)implementation无锁加减, compare交换(cmpxchg). 适used forsimplecount器andflag. amdgpu reference counting(如 amdgpu_bo reference counting)use atomic_t. atomic_inc/atomic_dec/atomic_read is其core API. ',
              'RCU(Read-Copy-Update)is Linux kernel最巧妙synchronizationmechanism. 读者completely无锁(notneed任何synchronizationoperate), 写者先copydata, modify副本, thenatomic地替换旧datapointer. 旧datainall读者退出afteronly thenbyrelease("宽限期"mechanism). RCU 适used for读远多于写scenario, 如kernel路由表. amdgpu  BO(Buffer Object)lookupuse RCU optimizationreadperformance. ',
            ],
            keyPoints: [
              'spinlock: spin wait, cannot sleep, used forinterruptcontextand短critical section(<1μs)',
              'mutex: sleepwait, 只caninprocesscontextuse, 适合长critical section',
              'rw_semaphore: 多读者并发 + 独占写者, 适合"多读少写"scenario',
              'atomic_t: atomic operation, 最轻量, 适合count器andflag',
              'RCU: 读者无锁, 写者copy替换, 适合读远多于写scenario',
              '选错synchronization原语after果: mutex ininterruptcontext → BUG/deadlock, spinlock 持has时sleep → deadlock',
            ],
          },
          diagram: {
            title: 'kernelsynchronization原语select决策树',
            content: `selectcorrectsynchronization原语 — 决策树

needprotectshareddata?
       │
       ▼
whetherininterrupt/软interruptcontext?
       │
    ┌──┴──┐
    │ YES │                              │ NO │
    ▼     │                              ▼
只读?    │                           critical sectionwhetherneedsleep?
│        │                              │
├─YES──▶ rcu_read_lock()             ┌──┴──┐
│        (completely无锁, 最快)             │ YES │         │ NO │
│                                     ▼               ▼
├─NO──▶  spin_lock_irqsave()      mutex_lock()    spin_lock()
│        (禁interrupt+自旋)             (cansleepwait)   (spin wait)
│        critical sectionmust极短!            can做 I/O,      critical section应短
│                                  allocationmemory等
│
issimplecount器/flag?
│
└─YES──▶ atomic_inc() / atomic_set()
         (无锁, CPU atomicinstruction)

amdgpu inactualuse: 
┌─────────────────────────────────────────────────────────┐
│ data structure            synchronization原语           cause              │
│─────────────────────────────────────────────────────────│
│ VRAM manager         mutex              allocationmaysleep     │
│ Ring Buffer 写pointer   spinlock           interruptcontextaccess   │
│ IRQ 源registration          spin_lock_irqsave  interrupt handlinginuse   │
│ BO reference counting         atomic_t           simple递增递减     │
│ GPU VM page table         rw_semaphore       多读(CS)少写   │
│ fence 信号          spinlock           interruptin signal    │
└─────────────────────────────────────────────────────────┘`,
            caption: 'selectsynchronization原语core判断: whetherininterruptcontext? critical sectionwhetherneedsleep? whether多读少写? answer这三个issuecan选对原语. ',
          },
          codeWalk: {
            title: 'amdgpu in mutex and spinlock actualuse',
            file: 'drivers/gpu/drm/amd/amdgpu/amdgpu_vram_mgr.c',
            language: 'c',
            code: `/* === 1. Mutex: protect VRAM manager === */
/* amdgpu_vram_mgr.c — VRAM allocationneedsleepwait, use mutex */
struct amdgpu_vram_mgr {
    struct mutex lock;   /* protect VRAM allocationstate */
    /* ... VRAM block list, stats ... */
};

int amdgpu_vram_mgr_alloc(struct amdgpu_vram_mgr *mgr, ...)
{
    mutex_lock(&mgr->lock);
    /* allocation VRAM — mayneedwaitother BO byrelease
     * 这insidecansecurity地sleepwait, becauseweinprocesscontext */
    node = drm_mm_insert_node(&mgr->mm, size, alignment);
    mutex_unlock(&mgr->lock);
    return ret;
}

/* === 2. Spinlock: protectinterruptcontext fence handle === */
/* amdgpu_fence.c — GPU completenotifyininterruptinhandle */
void amdgpu_fence_process(struct amdgpu_ring *ring)
{
    struct amdgpu_fence_driver *drv = &ring->fence_drv;
    unsigned long flags;

    /* spin_lock_irqsave: disableinterrupt + get锁
     * mustdisableinterrupt, because此functionmaymeanwhilefrom
     * processcontextandinterruptcontextcall */
    spin_lock_irqsave(&drv->lock, flags);

    /* check GPU complete fence 序列号 */
    last_seq = atomic64_read(&ring->fence_drv.last_seq);
    /* wakeupwait fence completethread */
    /* ... signal completed fences ... */

    spin_unlock_irqrestore(&drv->lock, flags);
    /* ↑ recoverbeforeinterruptstate */
}

/* === 3. Atomic: reference counting === */
/* amdgpu_bo.c — Buffer Object reference counting */
static inline void amdgpu_bo_ref(struct amdgpu_bo *bo)
{
    /* atomic递增reference counting — 无需任何锁 */
    drm_gem_object_get(&bo->tbo.base);
    /* internaluse kref_get → atomic_inc(&obj->refcount) */
}`,
            annotations: [
              'mutex_lock/unlock 包围critical sectionincancallmaysleepfunction(如memory allocation, I/O wait)',
              'spin_lock_irqsave saveinterruptstateto flags variable, spin_unlock_irqrestore recover — support嵌套',
              'interruptcontextinmustuse irqsave 变体, otherwiseifalreadyininterrupt handlingin, again次disableinterruptwill丢失interruptstate',
              'atomic64_read use CPU atomicreadinstruction, even ifinspinlockprotect区内alsocansecurityread',
              'kref_get/kref_put iskernelreference countingframework, 底layeruse atomic_t implementation',
              'drm_mm_insert_node is DRM memory management器 API, 用red-black treemanagementaddress spaceallocation',
            ],
            explanation: 'amdgpu driverinsynchronization原语selectcompletely遵循决策树: VRAM allocationmayneedwaitmemoryrelease(sleep), so用 mutex; fence handleininterruptcontextinexecute, so用 spin_lock_irqsave; BO reference countingissimple递增递减, so用 atomic. 选错after果is致命 — ininterruptcontext用 mutex willtrigger "BUG: scheduling while atomic" 并crash. ',
          },
          miniLab: {
            title: '用 mutex implementationasimple生产者-消费者module',
            objective: 'writeakernel module, use mutex protectasharedbuffer, twokernelthread分别作as生产者and消费者. verifysynchronizationcorrect性. ',
            steps: [
              'createmodule prodcons.c, definesharedbuffer(int buffer[BUFSIZE])anda mutex',
              'create生产者kernelthread(kthread_create): get mutex → writedata → release mutex → msleep(100)',
              'create消费者kernelthread: get mutex → readdata → release mutex → msleep(150)',
              'use printk recordeach time读写operateandthread ID',
              'in module_init instartuptwothread, module_exit in用 kthread_stop stop',
              'compilation并loadingmodule, observe dmesg outputverify互斥correct(will not出现读写交错)',
              'trywill mutex 改as spinlock + msleep, observekernelwhether报 "scheduling while atomic" error',
            ],
            expectedOutput: `$ sudo insmod prodcons.ko
$ dmesg | tail -10
[  100.001] prodcons: producer wrote buffer[0] = 1
[  100.101] prodcons: producer wrote buffer[1] = 2
[  100.152] prodcons: consumer read  buffer[0] = 1
[  100.201] prodcons: producer wrote buffer[2] = 3
[  100.302] prodcons: consumer read  buffer[1] = 2
...
# note: 生产and消费交替进行, 但fromdifferent时发生(mutex protect)

$ sudo rmmod prodcons
$ dmesg | tail -1
[  110.000] prodcons: threads stopped, module unloaded`,
          },
          debugExercise: {
            title: 'ininterruptcontextinuse mutex — 致命error',
            language: 'c',
            description: 'belowinterrupt handlingprograminuse mutex protectshareddata. 这willcausewhatafter果? ',
            question: 'whythiscodewillcausekernelcrash? correctfixapproachiswhat? ',
            buggyCode: `static DEFINE_MUTEX(irq_data_lock);
static int shared_counter;

/* interrupt handlingfunction — ininterruptcontextinrun */
static irqreturn_t my_irq_handler(int irq, void *dev_id)
{
    mutex_lock(&irq_data_lock);   /* BUG! */
    shared_counter++;
    mutex_unlock(&irq_data_lock);
    return IRQ_HANDLED;
}

/* processcontextinreadcount器 */
static ssize_t read_counter(struct file *f, char __user *buf, ...)
{
    int val;
    mutex_lock(&irq_data_lock);
    val = shared_counter;
    mutex_unlock(&irq_data_lock);
    return simple_read_from_buffer(buf, count, ppos, &val, sizeof(val));
}`,
            hint: 'interrupt handlingprogramhasa铁律: cannot sleep. mutex_lock in锁by占用时willletcall者进入sleepwait. 那ifininterruptincall mutex_lock, 锁恰好by占用......',
            answer: '致命 Bug: ininterruptcontextincall mutex_lock. interruptcontextcannot sleep(notcancall schedule()), becauseinterrupt handling打断正inrunprocess — ifinterrupt handling自身sleep, by打断processunable torecover, systemwilldeadlock. mutex_lock in锁by占用时willcall schedule() let出 CPU 并进入sleepwait — 这ininterruptcontextinwilltriggerkernel BUG: "BUG: scheduling while atomic", 随afteris Kernel Panic. correctfix: will mutex 替换as spinlock_t and spin_lock_irqsave/spin_unlock_irqrestore. processcontextinalsouse spin_lock_irqsave(disableinterruptpreventdeadlock). ifcritical section确实只is递增count器, 更好planisuse atomic_t and atomic_inc, completelynotneed任何锁. amdgpu  fence handleis这样 — fence 序列号use atomic64_t, avoidininterruptcontextinuse锁. ',
          },
          interviewQ: {
            question: 'explain spinlock and mutex difference. inwhatscenariobelowuse哪种? in amdgpu driverin各haswhat实例? ',
            difficulty: 'medium',
            hint: 'fromwaitapproach(自旋 vs sleep), availablecontext(interrupt vs process), critical section长度, andperformancefeature角度compare. ',
            answer: 'Spinlock vs Mutex coredifference: (1)waitapproach: spinlock 自旋(busy-wait, CPU 一直check锁state), mutex sleep(wait者进入wait queue, let出 CPU). (2)availablecontext: spinlock canininterruptcontextandprocesscontextuse(interruptinmust用 spin_lock_irqsave), mutex 只caninprocesscontextuse(willcall schedule(), interruptcontextinnotcansleep). (3)critical section长度: spinlock to求极短critical section(<1μs), because自旋浪费 CPU; mutex canprotect长critical section, includemaysleepoperate(如 I/O, memory allocation). (4)performance: 低争用时 spinlock 更快(无context切换开销), 高争用时 mutex 更好(not浪费 CPU). amdgpu 实例: spinlock — amdgpu_fence_process in用 spin_lock_irqsave protect fence 序列号update, because此functionfrominterruptcontextcall; amdgpu_irq_handler in用 spinlock protectinterrupt源registration表. mutex — amdgpu_vram_mgr 用 mutex protect VRAM allocation/release, becauseallocationmayneedwaitother BO byeviction(sleep); amdgpu_bo_reserve use ww_mutex(wait/伤害 mutex)protect BO state, supportdeadlockavoid. ',
            amdContext: 'AMD driverdevelopmentin锁selectdirectlyimpact GPU performance. interviewindemonstratedo you know amdgpu in哪inside用 spinlock, 哪inside用 mutex, andwhy — 这比背 API 名称has价值得多. ',
          },
        },

        // ── Lesson 3.2.2 ──────────────────────────────────────
        {
          id: '3-2-2',
          number: '3.2.2',
          title: 'kernelmemory management: kmalloc, vmalloc and slab',
          titleEn: 'Kernel Memory Management: kmalloc, vmalloc, and Slab',
          duration: 15,
          difficulty: 'intermediate',
          tags: ['kmalloc', 'vmalloc', 'kzalloc', 'slab', 'GFP', 'DMA', 'memory'],
          concept: {
            summary: 'kernelno malloc — 取而代之is多种针对differentscenariooptimizationmemory allocation器. kmalloc allocationphysicalcontiguousmemory(适合 DMA), vmalloc allocationvirtualcontiguous但physicalmaynotcontiguousmemory(适合大buffer), slab allocation器(kmem_cache)as频繁create/销毁固定sizeobjectprovide高performancecache. GFP flag告诉allocation器"whethercansleep" — ininterruptcontextin只canuse GFP_ATOMIC. ',
            explanation: [
              'kmalloc iskernelin最常用memory allocationfunction, similaruser space malloc, 但hastwokeydifference: (1)allocationmemoryisphysicalcontiguous — 这for DMA transfer至关important, because很多hardwaredevicenotsupport散列-gather(scatter-gather)DMA; (2)need指定 GFP flag告诉allocation器runcontext. kmalloc 最大allocationlimitusuallyis 4MB(PAGE_SIZE * 2^MAX_ORDER), exceedthissizewillfailure. kzalloc is kmalloc + memset(0) 组合 — inkernelin更recommendeduse kzalloc, becausenot yetinitializationkernelmemorymaycontain敏感data. ',
              'vmalloc allocationvirtual addresscontiguous但physical页帧mayscattermemory. 它优势iscanallocation比 kmalloc 更大memoryblock(几十 MB 甚至更多), becausenotneedcontiguousphysical页帧. 代价: (1)each timeaccessmayneed额outside TLB(Translation Lookaside Buffer)lookup, performance略低于 kmalloc; (2)vmalloc allocationmemorynot适合 DMA(physicalnotcontiguous); (3)vmalloc 总iscansleep, notcanininterruptcontextuse. amdgpu driverin, 大lookup表(如 VRAM  bitmap manager)mayuse vmalloc. ',
              'GFP(Get Free Pages)flagiskernelmemory allocationcore概念. 最常用two: GFP_KERNEL — allowsleep, allow I/O(canwait交换空betweenreleasememory), 只caninprocesscontextuse; GFP_ATOMIC — notallowsleep, ininterruptcontextand持has spinlock 时use, allocationfailure概率更高(becausenotcanwaitmemoryreclaim). GFP_DMA — allocation DMA available低addressmemory(ISA DMA 遗留limit). in amdgpu in, probe/init stageuse GFP_KERNEL, interrupt handlinginuse GFP_ATOMIC. ',
              'Slab allocation器(kmem_cache)iskernelas"频繁create/销毁固定sizeobject"design高performancecache. 它预先allocation一批同样sizememoryblock(slab), createobject时fromcachein取, 销毁时returncache而is not真正release. 好处: (1)avoid频繁 kmalloc/kfree 开销; (2)减少memoryfragment(allobjectsizesame); (3)can指定构造/析构function. amdgpu  fence subsystemuse kmem_cache_create create fence object slab cache, becauseeach time GPU command submissionallneedcreate fence, 每帧may数百次. ',
              'DMA memory allocation(dma_alloc_coherent)is GPU driver特殊需求. GPU through DMA fromsystem memory读写data, 但 DMA address(device看toaddress)and CPU virtual addressdifferent. dma_alloc_coherent meanwhilereturn CPU virtual addressand DMA address(dma_addr_t), 并ensure CPU anddevice看tomemory视图一致(cache coherent). amdgpu  Ring Buffer(GPU commandqueue)use dma_alloc_coherent allocation. ',
            ],
            keyPoints: [
              'kmalloc/kzalloc: physicalcontiguous, 适合小memory(<4MB)and DMA, need GFP flag',
              'vmalloc: physicalnotcontiguous, canallocation大memory, not适合 DMA, 总ismaysleep',
              'GFP_KERNEL: allowsleep(processcontext), GFP_ATOMIC: cannot sleep(interruptcontext)',
              'kmem_cache_create/alloc/free: slab cache, 适合频繁create/销毁固定sizeobject',
              'dma_alloc_coherent: allocation DMA available cache-coherent memory, return CPU and DMA address对',
              '/proc/slabinfo displayall slab cachestate — can看to amdgpu create fence cache',
            ],
          },
          diagram: {
            title: 'kernelmemory allocation器select指南',
            content: `kernelmemory allocation器select — 决策process

needallocationkernelmemory
       │
       ▼
needphysicalcontiguous or used for DMA?
       │
    ┌──┴──────────────────────┐
    │ YES                      │ NO
    ▼                          ▼
  size?                     vmalloc(size)
    │                       ├─ virtualcontiguous, physicalcan散
    ├─ < 4MB               ├─ 适合大buffer
    │  kmalloc(size, gfp)   ├─ notcanused for DMA
    │  kzalloc(size, gfp)   └─ 总ismaysleep
    │
    └─ need DMA address?
       │
       ├─ YES: dma_alloc_coherent(dev, size, &dma_addr, gfp)
       │       meanwhileget CPU virtual address + DMA address
       │
       └─ NO:  kmalloc(size, gfp) i.e.can

whether频繁allocation/release同种object?
       │
       └─ YES: kmem_cache_create() + kmem_cache_alloc()
              slab cache, avoidfragment, performance更高

GFP flagselect: 
┌─────────────────────────────────────────────────┐
│  context              recommended GFP               indicate │
│─────────────────────────────────────────────────│
│  processcontext          GFP_KERNEL         cansleep │
│  interrupt/softirq        GFP_ATOMIC       cannot sleep │
│  持has spinlock       GFP_ATOMIC       cannot sleep │
│  initialization(__init)    GFP_KERNEL         cansleep │
│  need零initialization        加 __GFP_ZERO             │
│  (ordirectly用 kzalloc)                          │
└─────────────────────────────────────────────────┘

amdgpu memory allocation实例: 
┌───────────────────────────────────────────────────────┐
│ 用途               allocationapproach                  GFP      │
│───────────────────────────────────────────────────────│
│ fence object         kmem_cache_alloc           KERNEL  │
│ Ring Buffer        dma_alloc_coherent         KERNEL  │
│ 临时commandbuffer     kzalloc                    KERNEL  │
│ interruptdata           kzalloc                    ATOMIC  │
│ 大型lookup表         vzalloc (vmalloc+零initialization)  —      │
└───────────────────────────────────────────────────────┘`,
            caption: 'selectmemory allocation器core判断: whetherneedphysicalcontiguous? whetherused for DMA? whetherininterruptcontext? whether频繁allocation同种object? answertheseissuecan选对 API. ',
          },
          codeWalk: {
            title: 'amdgpu fence slab cache — 高频object高效allocation',
            file: 'drivers/gpu/drm/amd/amdgpu/amdgpu_fence.c',
            language: 'c',
            code: `/* amdgpu_fence.c — fence object slab cachemanagement */

/* global slab cachepointer */
static struct kmem_cache *amdgpu_fence_slab;

/* initialization: in module_init stagecreate slab cache */
int amdgpu_fence_slab_init(void)
{
    amdgpu_fence_slab = kmem_cache_create(
        "amdgpu_fence",                /* cache名, /proc/slabinfo incan见 */
        sizeof(struct amdgpu_fence),    /* eachobjectsize */
        0,                              /* alignmentto求(0=automatic) */
        SLAB_HWCACHE_ALIGN,            /* flag: 按 CPU cache行alignment */
        NULL);                          /* 构造function(can选) */
    if (!amdgpu_fence_slab)
        return -ENOMEM;
    return 0;
}

/* 销毁: in module_exit stage销毁cache */
void amdgpu_fence_slab_fini(void)
{
    kmem_cache_destroy(amdgpu_fence_slab);
    amdgpu_fence_slab = NULL;
}

/* allocation fence object — each time GPU command submissionallneed */
struct amdgpu_fence *amdgpu_fence_create(void)
{
    struct amdgpu_fence *fence;

    /* from slab cacheingeta预allocationobject
     * 比 kzalloc(sizeof(*fence), ...) 快得多
     * GFP_KERNEL: inprocesscontextin, allowsleepwait */
    fence = kmem_cache_zalloc(amdgpu_fence_slab, GFP_KERNEL);
    if (!fence)
        return NULL;

    /* initialization fence */
    dma_fence_init(&fence->base, &amdgpu_fence_ops,
                   &ring->fence_drv.lock, ring->fence_context,
                   ++ring->fence_drv.sync_seq);
    return fence;
}

/* release fence — GPU commandcompleteaftercall */
void amdgpu_fence_free(struct rcu_head *rcu)
{
    struct dma_fence *f = container_of(rcu, struct dma_fence, rcu);
    struct amdgpu_fence *fence = to_amdgpu_fence(f);

    /* returnto slab cache, is not真正release
     * below次 kmem_cache_alloc will重用这blockmemory */
    kmem_cache_free(amdgpu_fence_slab, fence);
}

/* === DMA memory allocationexample — Ring Buffer === */
/* amdgpu_ring.c */
int amdgpu_ring_init(struct amdgpu_ring *ring, unsigned int size)
{
    /* Ring Buffer need GPU through DMA read, 
     * somustuse dma_alloc_coherent */
    ring->ring = dma_alloc_coherent(adev->dev,
                                     ring->ring_size,
                                     &ring->gpu_addr,  /* DMA address */
                                     GFP_KERNEL);
    if (!ring->ring)
        return -ENOMEM;
    /* ring->ring = CPU virtual address(driverwritecommand用)
     * ring->gpu_addr = DMA address(GPU readcommand用) */
    return 0;
}`,
            annotations: [
              'kmem_cache_create  name parameter出现in /proc/slabinfo and /sys/kernel/slab/ below, 方便监控',
              'SLAB_HWCACHE_ALIGN ensureeach fence object按 L1 cache行alignment, avoid false sharing',
              'kmem_cache_zalloc = kmem_cache_alloc + 零initialization, 比 kzalloc 更快(objectsizeknown)',
              'fence releasethrough RCU callback(rcu_head) — ensureallread fence  CPU coreallcompleteafteronly then真正release',
              'dma_alloc_coherent returntwoaddress: CPU virtual addressused fordriverwrite, DMA addressused for GPU read',
              'Ring Buffer  DMA address(gpu_addr)willbywrite GPU register, 告诉 GPU from哪insidereadcommand',
            ],
            explanation: 'fence is GPU commandsynchronizationcoreobject — each timecommitcommandallcreatea, commandcompleteafter销毁. in 60fps 游戏in, 每秒maycreate数百个 fence. if用 kmalloc/kfree, 频繁allocation/releasewillcausememoryfragmentandperformancebelow降. slab cachethrough预allocationand重用resolvethisissue — kmem_cache_alloc usually只needfromidlelinked list取aobject, 几乎is O(1) operate. dma_alloc_coherent 则resolve另aissue: GPU and CPU needaccess同一blockmemory, 但theyaddress spacedifferent. ',
          },
          miniLab: {
            title: 'in /proc/slabinfo inlookup amdgpu  slab cache',
            objective: 'through /proc/slabinfo and /sys/kernel/slab/ observe amdgpu drivercreate slab cache, understand slab inactualdriverinusescale. ',
            steps: [
              'confirm amdgpu modulealreadyloading: lsmod | grep amdgpu',
              'viewall amdgpu related slab cache: sudo cat /proc/slabinfo | head -2 && sudo cat /proc/slabinfo | grep -i amdgpu',
              '解读output字段: name(cache名), active_objs(activeobject数), num_objs(总object数), objsize(objectsize)',
              'view fence cache详情: ls /sys/kernel/slab/amdgpu_fence/ 2>/dev/null || echo "view slabinfo 替代"',
              'runa GPU program(如 glxgears)时again次check amdgpu_fence  active_objs 变化',
              'compare: viewotherdriver slab cache(如 grep -i "ext4\\|btrfs\\|dentry" /proc/slabinfo)感受 slab inkernelin普遍性',
            ],
            expectedOutput: `$ sudo cat /proc/slabinfo | grep -i amdgpu
# name            <active_objs> <num_objs> <objsize> ...
amdgpu_fence           128        256        192      ...
amdgpu_vm_bo            64        128         96      ...

# run glxgears after: 
amdgpu_fence           512       1024        192      ...
                       ↑ active fence count大幅增加

# 解读: 
# - amdgpu_fence: eachobject 192 bytes, currenthas 512 个active fence
# - GPU rendering期between fence countandcommand submissionfrequency正related`,
          },
          debugExercise: {
            title: 'ininterruptcontextinuse GFP_KERNEL — 休眠prohibit',
            language: 'c',
            description: 'belowinterrupt handlingcodeuseerror GFP flagallocationmemory. findissue. ',
            question: 'thiscodeinwhat情况belowwillcausekernelcrash? howfix? ',
            buggyCode: `/* interrupt handlingfunction */
static irqreturn_t gpu_irq_handler(int irq, void *data)
{
    struct gpu_device *gdev = data;
    struct irq_event *evt;

    /* allocationeventstructure体recordinterruptinformation */
    evt = kzalloc(sizeof(*evt), GFP_KERNEL);  /* BUG! */
    if (!evt)
        return IRQ_HANDLED;

    evt->timestamp = ktime_get();
    evt->source = readl(gdev->regs + IRQ_SOURCE);

    /* addtoeventqueue */
    list_add_tail(&evt->node, &gdev->event_list);

    return IRQ_HANDLED;
}`,
            hint: 'GFP_KERNEL allowallocation器inmemorynot足时sleepwaitpagereclaim. 但interrupt handlingfunctionhasa铁律......',
            answer: 'Bug: ininterrupt handlingfunctioninuse GFP_KERNEL. GFP_KERNEL allowallocation器inmemory紧张时call schedule() 进入sleepwaitpagereclaim/交换, 但interruptcontextprohibitsleep. ifmemory紧张且 kzalloc 试图sleep, kernelwilltrigger "BUG: sleeping function called from invalid context", usuallycause Kernel Panic. fixplan: (1)will GFP_KERNEL 改as GFP_ATOMIC — 这告诉allocation器"cannot sleep, 立i.e.returnsuccessorfailure". GFP_ATOMIC fromreserve紧急memory poolallocation, failure概率更高, somusthandleallocationfailure情况. (2)更好plan: use slab cache预allocation irq_event object(similar amdgpu_fence_slab), interruptinfromcacheget, avoideach timeallcallgeneralallocation器. (3)amdgpu actual做法: ininterrupt handlingin尽量avoidmemory allocation — 只record必toinformation(如 fence 序列号), willcomplexhandle推迟to tasklet or workqueue in(inprocesscontextinrun, canuse GFP_KERNEL). ',
          },
          interviewQ: {
            question: 'explain kmalloc, vmalloc and slab allocation器difference. in GPU driverdevelopmentin, 各种scenariobelowhowselect? ',
            difficulty: 'medium',
            hint: 'fromphysicalcontiguous性, sizelimit, GFP flag, DMA 兼容性andperformancefeature角度compare三种allocation器, 结合 amdgpu  fence slab and ring buffer DMA allocation作as实例. ',
            answer: '三种allocation器coredifference: (1)kmalloc — allocationphysicalcontiguousmemory, sizelimitusuallyas 4MB. 优点: performance最好(无额outside TLB 开销), 适合 DMA transfer(hardwareneedcontiguousphysical address). 用法: kmalloc(size, GFP_KERNEL) or kzalloc(+零initialization). GPU driverscenario: 小toin等data structure, deviceregistermappinginformation, 临时buffer. (2)vmalloc — allocationvirtualcontiguous但physicalnotcontiguousmemory. 优点: canallocation大blockmemory(>4MB), not受physical memoryfragmentimpact. 缺点: each timeaccessmayneed额outside TLB lookup, performance略低; not适合 DMA(physicalnotcontiguous). GPU driverscenario: 大型lookup表(如 VRAM bitmap manager), 大internalbuffer. (3)slab (kmem_cache) — as固定sizeobjectprovide高performancecache池. objectallocation/releaseas O(1), 减少fragment, can指定构造function. GPU driverscenario: amdgpu  fence object(每帧数百次allocation), BO 元dataobject. 额outsideneed DMA allocation器: dma_alloc_coherent — allocation CPU anddeviceallcanaccess coherent memory, meanwhilereturn CPU virtual addressand DMA address. GPU driverscenario: Ring Buffer(GPU commandqueue), Doorbell page — thesememoryneed CPU write, GPU read. GFP flagselect: processcontext用 GFP_KERNEL, interruptcontext用 GFP_ATOMIC. ',
            amdContext: 'in AMD interviewin, demonstratedo you know amdgpu  fence 用 slab, Ring Buffer 用 dma_alloc_coherent, andwhy这么选 — 这proof你not仅懂 API, stillunderstand GPU driveractualmemory需求. ',
          },
        },
      ],
    },
  ],
  completionChecklist: [
    'canindependentwrite, compilationandloadingkernel module(module_init/exit, MODULE_LICENSE, printk, module_param)',
    'understand PCI driverframework: struct pci_driver, probe/remove callback, pci_enable_device/set_master/ioremap_bar',
    'canin amdgpu_pci_probe source codein识别并explain每一步hardwareconfiguration含义',
    'master goto 链式cleanuppattern, canwill嵌套 if-else 重构as goto cleanup, canincode reviewinfind遗漏resourcerelease',
    'understand IS_ERR/PTR_ERR/ERR_PTR macroworkprincipleandusescenario',
    'cancorrectselectsynchronization原语: spinlock(interruptcontext), mutex(processcontext/长critical section), atomic(count器), RCU(多读少写)',
    'understand GFP flag: GFP_KERNEL vs GFP_ATOMIC, 并canincode reviewinfinderroruse',
    'know kmalloc/vmalloc/slab/dma_alloc_coherent differenceand适用scenario',
    'canthrough /proc/slabinfo observe amdgpu  slab cachestate',
    'canread amdgpu_device_init  goto cleanup链并understandeacherrorlabel含义',
  ],
};
