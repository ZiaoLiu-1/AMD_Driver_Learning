// ============================================================
// AMD Linux Driver Learning Platform - Module 3 Micro-Lessons
// Module 3: Linux Kernel & Driver Development (Linux 内核与驱动入门)
// 5 lessons in 2 groups, ~15 min each, total ~75 min
// ============================================================
import type { MicroLessonModule } from './micro_lesson_types';

export const module3MicroLessons: MicroLessonModule = {
  moduleId: 'kernel',
  groups: [
    // ════════════════════════════════════════════════════════════
    // Group 3.1: Kernel Module Development (内核模块开发)
    // ════════════════════════════════════════════════════════════
    {
      id: '3-1',
      number: '3.1',
      title: '内核模块开发',
      titleEn: 'Kernel Module Development',
      icon: '🧩',
      description: '从零编写内核模块，理解模块生命周期、PCI 驱动框架和内核特有的错误处理模式——这些是阅读和贡献 amdgpu 代码的基础技能。',
      lessons: [
        // ── Lesson 3.1.1 ──────────────────────────────────────
        {
          id: '3-1-1',
          number: '3.1.1',
          title: '内核模块生命周期：从 insmod 到 rmmod',
          titleEn: 'Kernel Module Lifecycle: From insmod to rmmod',
          duration: 15,
          difficulty: 'intermediate',
          tags: ['kernel-module', 'insmod', 'rmmod', 'module_init', 'printk'],
          concept: {
            summary: '内核模块是 Linux 可动态加载/卸载的代码单元。每个模块需要 module_init/module_exit 入口点、MODULE_LICENSE 声明、以及遵循 __init/__exit 内存优化约定。amdgpu 本身就是一个庞大的内核模块——理解模块机制是读懂 amdgpu_drv.c 的第一步。',
            explanation: [
              '内核模块（Loadable Kernel Module, LKM）是 Linux 最优雅的设计之一——它允许在不重启系统、不重新编译内核的情况下，动态地向运行中的内核添加或移除功能。你的 amdgpu 驱动就是一个内核模块：系统启动时 udev 检测到 AMD GPU 硬件，自动调用 modprobe amdgpu 加载驱动模块。',
              '每个内核模块必须定义两个函数：module_init() 指定的初始化函数在模块加载时被调用（insmod/modprobe 触发），module_exit() 指定的清理函数在模块卸载时被调用（rmmod 触发）。初始化函数返回 0 表示成功，返回负的 errno 值表示失败（此时模块不会被加载）。这个约定贯穿整个 Linux 内核——所有的初始化函数都遵循"成功返回 0"的规则。',
              '__init 和 __exit 是内核的内存优化宏。标记为 __init 的函数和数据在模块初始化完成后会被释放——因为初始化代码只运行一次，之后就不再需要了。__exit 标记的函数在模块编译进内核（而非作为可加载模块）时会被完全忽略，因为内建的驱动永远不会被卸载。这种精细的内存管理在嵌入式系统中尤为重要。',
              'MODULE_LICENSE("GPL") 不仅是法律声明，更有实际技术影响。标记为 GPL 的模块可以使用内核中所有的 EXPORT_SYMBOL_GPL 符号（如 DRM 框架的大部分 API），而非 GPL 模块只能使用 EXPORT_SYMBOL 导出的符号。amdgpu 必须声明 GPL 才能使用 DRM 框架。如果忘记声明 LICENSE，内核会在 dmesg 中打印 "module license taints kernel" 警告，并且部分功能将不可用。',
              'printk 是内核中的 printf 等价物，但它输出到内核的环形日志缓冲区（通过 dmesg 读取）。printk 有 8 个日志级别：KERN_EMERG(0) 到 KERN_DEBUG(7)。在 amdgpu 驱动中，常用 DRM_INFO、DRM_WARN、DRM_ERROR 等宏——它们是 printk 的封装，会自动添加 [drm] 前缀和模块信息。module_param 宏允许用户在加载模块时传递参数，如 modprobe amdgpu gpu_recovery=1。',
            ],
            keyPoints: [
              'module_init(fn) / module_exit(fn) 定义模块的入口和出口函数',
              '__init 标记的代码在初始化后被释放节省内存，__exit 在内建模块中被忽略',
              'MODULE_LICENSE("GPL") 是必须的——否则无法使用 EXPORT_SYMBOL_GPL 符号',
              'printk(KERN_INFO "msg") 输出到内核环形缓冲区，用 dmesg 查看',
              'module_param(name, type, perm) 允许用户通过 insmod/modprobe 传参',
              'amdgpu 的 module_init 调用 pci_register_driver 注册 PCI 驱动',
            ],
          },
          diagram: {
            title: '内核模块生命周期与内存管理',
            content: `内核模块从加载到卸载的完整生命周期

用户空间                                        内核空间
─────────                                       ─────────

  insmod hello.ko                               
  (或 modprobe hello)                            
       │                                         
       ▼                                         
  sys_init_module()                              
       │                                         
       ├─ 验证 ELF 格式                          
       ├─ 检查 MODULE_LICENSE                     
       ├─ 解析 module_param                       
       ├─ 符号重定位                              
       │  (链接到内核符号表)                       
       │                                         
       ▼                                         
  调用 module_init 函数                           
  ┌─────────────────────────────┐                
  │ static int __init hello_init(void)           │
  │ {                                            │
  │     printk(KERN_INFO "Hello!\\n");           │
  │     return 0;  ← 成功                        │
  │ }                                            │
  └─────────────────────────────┘                
       │                                         
       ▼                                         
  __init 段内存被释放 ← 节省内核内存              
  模块进入正常运行状态                            
       │                                         
       │  （模块运行中...响应中断/ioctl/sysfs）   
       │                                         
  rmmod hello                                    
       │                                         
       ▼                                         
  调用 module_exit 函数                           
  ┌─────────────────────────────┐                
  │ static void __exit hello_exit(void)          │
  │ {                                            │
  │     printk(KERN_INFO "Bye!\\n");             │
  │ }                                            │
  └─────────────────────────────┘                
       │                                         
       ▼                                         
  释放模块所有内存，移除符号                      

amdgpu 实例：
  module_init(amdgpu_init)                       
    └─ pci_register_driver(&amdgpu_kms_pci_driver)
       └─ 内核为每个匹配的 GPU 调用 amdgpu_pci_probe()
  module_exit(amdgpu_exit)                       
    └─ pci_unregister_driver(&amdgpu_kms_pci_driver)
       └─ 内核为每个 GPU 调用 amdgpu_pci_remove()`,
            caption: '模块从 insmod 加载到 rmmod 卸载的完整生命周期。注意 __init 段在初始化完成后即被释放——这是内核对内存的精细管理。amdgpu 的 module_init 注册 PCI 驱动，触发后续的 probe 调用链。',
          },
          codeWalk: {
            title: 'amdgpu 的 module_init — 驱动的真正入口',
            file: 'drivers/gpu/drm/amd/amdgpu/amdgpu_drv.c',
            language: 'c',
            code: `/* amdgpu_drv.c — amdgpu 驱动的模块入口（简化版） */

#include <linux/module.h>
#include <linux/pci.h>
#include <drm/drm_drv.h>

/* 模块参数：用户可通过 modprobe amdgpu gpu_recovery=0 修改 */
int amdgpu_gpu_recovery = -1;
module_param_named(gpu_recovery, amdgpu_gpu_recovery, int, 0444);
MODULE_PARM_DESC(gpu_recovery,
    "Enable GPU recovery mechanism (-1=auto, 0=off, 1=on)");

/* PCI 驱动结构体 */
static struct pci_driver amdgpu_kms_pci_driver = {
    .name      = "amdgpu",
    .id_table  = pciidlist,        /* 支持的设备 ID 表 */
    .probe     = amdgpu_pci_probe, /* 设备发现时的回调 */
    .remove    = amdgpu_pci_remove,/* 设备移除时的回调 */
    .shutdown  = amdgpu_pci_shutdown,
    .driver.pm = &amdgpu_pm_ops,   /* 电源管理（休眠/唤醒） */
};

/* 模块初始化函数 — insmod/modprobe 时调用 */
static int __init amdgpu_init(void)
{
    int r;

    /* 初始化 DRM 调试系统 */
    r = amdgpu_sync_init();
    if (r)
        return r;

    r = amdgpu_fence_slab_init();
    if (r)
        goto error_sync;

    /* 核心：注册 PCI 驱动 — 这会触发 probe */
    r = pci_register_driver(&amdgpu_kms_pci_driver);
    if (r)
        goto error_fence;

    return 0;   /* 成功 */

error_fence:
    amdgpu_fence_slab_fini();
error_sync:
    amdgpu_sync_fini();
    return r;   /* 返回负 errno */
}

/* 模块退出函数 — rmmod 时调用 */
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
              'module_param_named 允许 modprobe amdgpu gpu_recovery=1 传参，0444 表示 sysfs 中只读',
              'struct pci_driver 是 PCI 驱动的核心结构体，包含 probe/remove 回调和设备 ID 表',
              'amdgpu_init 使用 goto 链式清理模式——初始化失败时反向释放已分配的资源',
              'pci_register_driver 是关键调用：注册后内核自动为匹配的设备调用 probe',
              'amdgpu_exit 的清理顺序与 init 的初始化顺序严格相反——这是内核的标准模式',
              'MODULE_LICENSE("GPL and additional rights") 允许 amdgpu 使用所有 GPL 导出的内核符号',
            ],
            explanation: '这段代码是 amdgpu 驱动的真正起点。当你运行 modprobe amdgpu 时，内核调用 amdgpu_init()，它注册 PCI 驱动。然后内核的 PCI 子系统扫描总线，为每个匹配 pciidlist 的 AMD GPU 调用 amdgpu_pci_probe()。注意 goto 清理模式——这在内核代码中无处不在，Lesson 3.1.3 会深入讲解。',
          },
          miniLab: {
            title: '编写并加载你的第一个内核模块',
            objective: '从零编写一个 Hello World 内核模块，编译、加载、验证 dmesg 输出，然后卸载。这是内核开发的"Hello World"仪式。',
            steps: [
              '创建工作目录：mkdir -p ~/kernel-labs/hello && cd ~/kernel-labs/hello',
              '创建 hello.c：写一个包含 module_init/exit、printk、MODULE_LICENSE、module_param 的最小模块',
              '创建 Makefile：obj-m := hello.o，指定 KDIR := /lib/modules/$(shell uname -r)/build',
              '编译模块：make -C $(KDIR) M=$(pwd) modules',
              '加载模块：sudo insmod hello.ko myname="student"（传递模块参数）',
              '检查 dmesg：dmesg | tail -5，应该看到你的 Hello 消息和参数值',
              '检查模块信息：modinfo hello.ko，查看 license、description、parm 字段',
              '查看 sysfs 参数：cat /sys/module/hello/parameters/myname',
              '卸载模块：sudo rmmod hello，再次检查 dmesg 看到 Goodbye 消息',
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
            title: '找出缺失的 MODULE_LICENSE',
            language: 'c',
            description: '以下内核模块可以编译，但加载时会产生内核污染警告，且某些功能不可用。找出问题。',
            question: '这个模块有什么问题？加载后会发生什么？',
            buggyCode: `#include <linux/module.h>
#include <linux/kernel.h>
#include <linux/init.h>

static int __init tainted_init(void)
{
    printk(KERN_INFO "Module loaded\\n");
    /* 尝试使用 GPL-only 的 DRM 框架 API */
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
            hint: '缺少 MODULE_LICENSE 不仅仅是法律问题——内核会将该模块标记为"tainted"，并限制其可使用的符号集合。',
            answer: '问题：缺少 MODULE_LICENSE 声明。后果有三个层面：（1）内核污染（Taint）：加载时 dmesg 打印 "module: loading out-of-tree module taints kernel"，内核的 taint 标志被设置（cat /proc/sys/kernel/tainted 变为非零），这会导致后续的 Bug 报告被内核开发者忽略；（2）符号限制：无法使用 EXPORT_SYMBOL_GPL 导出的符号。DRM 框架的绝大部分 API（drm_dev_alloc、drm_mode_config_init 等）都是 GPL-only 的，所以模块会在链接阶段报 "Unknown symbol" 错误或运行时崩溃；（3）安全告警：部分内核配置会直接拒绝加载无许可证声明的模块。修复：添加 MODULE_LICENSE("GPL"); 即可。对于 amdgpu 类型的驱动，必须使用 "GPL" 或 "GPL and additional rights"。',
          },
          interviewQ: {
            question: '描述 Linux 内核模块的生命周期。module_init 和 module_exit 的作用是什么？__init 和 __exit 标记有什么意义？',
            difficulty: 'easy',
            hint: '从加载（insmod/modprobe）→ 初始化 → 运行 → 卸载（rmmod）的完整流程描述，重点解释 __init 的内存优化作用和 __exit 在内建模块中被忽略的原因。',
            answer: '内核模块的生命周期：（1）加载阶段：用户执行 insmod/modprobe，内核调用 sys_init_module()，将模块的 ELF 二进制加载到内核地址空间，进行符号重定位（链接到内核符号表），解析 module_param 参数；（2）初始化阶段：内核调用 module_init() 指定的函数，该函数分配资源、注册驱动/设备、初始化数据结构。返回 0 表示成功，非零（负 errno）表示失败，此时模块不会被加载；（3）运行阶段：模块代码作为内核的一部分运行，响应中断、系统调用、sysfs 访问等。此时 __init 段已被释放；（4）卸载阶段：用户执行 rmmod，内核调用 module_exit() 指定的函数，该函数必须按初始化的逆序释放所有资源（注销驱动、释放内存、删除 sysfs 条目），然后内核释放模块占用的所有内核内存。__init 标记的函数/数据放在特殊的 .init.text/.init.data 段，初始化完成后内核调用 free_initmem() 释放这些段——对于 amdgpu 这样的大驱动，这可以释放数十 KB 的内核内存。__exit 标记的函数在模块编译为内建（obj-y 而非 obj-m）时被编译器丢弃，因为内建驱动永远不会被卸载。',
            amdContext: '这是基础但重要的问题。AMD 面试中期望你不仅知道 API，还理解背后的内存优化和安全考量。提到 amdgpu 的 module_init 调用 pci_register_driver 来展示你理解实际驱动的实现方式。',
          },
        },

        // ── Lesson 3.1.2 ──────────────────────────────────────
        {
          id: '3-1-2',
          number: '3.1.2',
          title: 'PCI 驱动框架：probe 与 remove',
          titleEn: 'PCI Driver Framework: probe and remove',
          duration: 15,
          difficulty: 'intermediate',
          tags: ['PCI', 'pci_driver', 'probe', 'remove', 'pci_enable_device'],
          concept: {
            summary: 'PCI 驱动框架是 Linux 管理 PCI 设备的标准接口。驱动通过 struct pci_driver 注册自己，声明支持的设备 ID 表，内核在发现匹配设备时调用 probe 回调初始化硬件。amdgpu_pci_probe 是 GPU 驱动初始化的真正起点——probe 中的每一步（enable、set_master、ioremap_bar）都有关键的硬件配置含义。',
            explanation: [
              'struct pci_driver 是 PCI 驱动的核心数据结构。它包含：name（驱动名称，显示在 /sys/bus/pci/drivers/ 下）、id_table（支持的设备列表，struct pci_device_id 数组）、probe（设备发现时的回调函数）、remove（设备移除时的回调函数）、以及可选的 suspend/resume（电源管理回调）。内核的 PCI 子系统通过匹配 id_table 中的 Vendor:Device ID 来决定哪个驱动可以处理哪个设备。',
              'probe 函数是驱动初始化的核心。当 PCI 子系统找到匹配的设备时，它调用 probe(struct pci_dev *pdev, const struct pci_device_id *ent)。probe 函数接收两个参数：pdev 是内核创建的 PCI 设备结构体（包含设备的所有 PCI 信息），ent 是匹配到的 ID 表条目（包含 driver_data 字段，amdgpu 用它来存储 CHIP 类型）。',
              'probe 函数必须按严格的顺序执行初始化步骤：（1）pci_enable_device(pdev) — 启用 PCI 设备，配置 I/O 和内存访问，启用设备的 Bus Master 位；（2）pci_set_master(pdev) — 允许设备发起 DMA 传输（GPU 需要从系统内存读写数据）；（3）pci_ioremap_bar(pdev, n) — 将设备的 BAR（Base Address Register）映射到内核虚拟地址空间，使驱动可以通过 writel/readl 访问 GPU 寄存器和 VRAM；（4）设备特定的初始化（amdgpu 在这里调用 amdgpu_device_init 初始化所有 IP Block）。',
              'remove 函数是 probe 的逆操作——它必须按 probe 的相反顺序释放所有资源。这个"后进先出"的清理模式在内核中是铁律。如果 probe 分配了资源 A → B → C，那么 remove 必须释放 C → B → A。违反这个顺序会导致资源泄漏、use-after-free、或内核崩溃。',
              'pci_device_id 表中的 driver_data 字段是驱动私有数据。amdgpu 用它存储 CHIP 类型枚举值（如 CHIP_NAVI33），probe 函数通过 ent->driver_data 获取这个值，然后根据芯片类型选择正确的 IP Block 实现。这种设计让一个驱动可以支持数十种不同型号的 GPU。',
            ],
            keyPoints: [
              'struct pci_driver 包含 name、id_table、probe、remove 四个核心字段',
              'pci_enable_device() 启用 PCI 设备，pci_set_master() 允许 DMA 传输',
              'pci_ioremap_bar() 将 GPU 的 BAR 空间映射到内核虚拟地址用于 MMIO 访问',
              'probe 和 remove 必须互为逆操作——资源分配/释放顺序严格相反',
              'pci_device_id.driver_data 存储驱动私有数据（amdgpu 用它存储 CHIP 类型）',
              'probe 失败必须清理已初始化的资源并返回负 errno（goto 清理模式）',
            ],
          },
          diagram: {
            title: 'PCI 驱动 probe/remove 调用流程',
            content: `PCI 设备发现 → probe 初始化 → remove 清理

模块加载 (insmod amdgpu.ko)
   │
   ▼
module_init: amdgpu_init()
   │
   └─ pci_register_driver(&amdgpu_kms_pci_driver)
       │
       ▼
PCI 子系统扫描匹配设备
       │
       │  ┌─ pciidlist ─────────────────────────┐
       │  │ {0x1002, 0x7480, ..., CHIP_NAVI33}  │  ← 匹配!
       │  └─────────────────────────────────────┘
       │
       ▼
amdgpu_pci_probe(pdev, ent)          │  amdgpu_pci_remove(pdev)
 ┌──────────────────────────┐        │   ┌──────────────────────────┐
 │ ① pci_enable_device()    │        │   │ ⑤ amdgpu_device_fini()   │
 │   启用 PCI I/O 和内存    │        │   │   释放所有 IP Block      │
 │                          │        │   │                          │
 │ ② pci_set_master()       │        │   │ ④ iounmap(rmmio)         │
 │   允许 GPU 做 DMA        │        │   │   取消寄存器映射         │
 │                          │        │   │                          │
 │ ③ pci_ioremap_bar(0)     │        │   │ ③ pci_clear_master()     │
 │   映射 VRAM BAR          │        │   │   禁止 DMA              │
 │   pci_ioremap_bar(2)     │        │   │                          │
 │   映射寄存器 BAR         │        │   │ ② pci_release_regions()  │
 │                          │        │   │   释放 PCI 资源          │
 │ ④ amdgpu_device_init()   │        │   │                          │
 │   初始化所有 IP Block     │        │   │ ① pci_disable_device()   │
 │   (GFX, SDMA, DC, ...)  │        │   │   禁用 PCI 设备          │
 │                          │        │   │                          │
 │ return 0;  ← 成功        │        │   │ (无返回值，void 函数)    │
 └──────────────────────────┘        │   └──────────────────────────┘
                                     │
  ← 初始化顺序 ① ② ③ ④              │   清理顺序 ⑤ ④ ③ ② ① →
                                     │   严格逆序！`,
            caption: 'probe 和 remove 是严格的镜像关系——probe 按 1234 顺序初始化，remove 按 4321 逆序清理。这是内核驱动开发的铁律。',
          },
          codeWalk: {
            title: 'amdgpu_pci_probe — GPU 初始化的起点（简化版）',
            file: 'drivers/gpu/drm/amd/amdgpu/amdgpu_drv.c',
            language: 'c',
            code: `/* amdgpu_pci_probe — 当内核发现匹配的 AMD GPU 时调用 */
static int amdgpu_pci_probe(struct pci_dev *pdev,
                             const struct pci_device_id *ent)
{
    struct drm_device *ddev;
    struct amdgpu_device *adev;
    unsigned long flags = ent->driver_data;
    /* ent->driver_data = CHIP_NAVI33（你的 GPU）*/
    int ret;

    /* Step 1: 启用 PCI 设备 */
    ret = pci_enable_device(pdev);
    if (ret)
        return ret;

    /* Step 2: 允许 GPU 做 DMA 传输 */
    pci_set_master(pdev);

    /* Step 3: 分配 DRM 设备结构体 */
    ddev = drm_dev_alloc(&amdgpu_kms_driver, &pdev->dev);
    if (IS_ERR(ddev)) {
        ret = PTR_ERR(ddev);
        goto err_pci;
    }
    adev = drm_to_adev(ddev);

    /* Step 4: 映射 GPU 寄存器 BAR 到内核虚拟地址 */
    adev->rmmio_base = pci_resource_start(pdev, 5);
    adev->rmmio_size = pci_resource_len(pdev, 5);
    adev->rmmio = ioremap(adev->rmmio_base, adev->rmmio_size);
    if (!adev->rmmio) {
        ret = -ENOMEM;
        goto err_drm;
    }
    /* 现在可以通过 WREG32/RREG32 访问 GPU 寄存器了 */

    /* Step 5: 初始化 GPU 的所有 IP Block */
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
              'ent->driver_data 包含 CHIP 类型（如 CHIP_NAVI33），传递给 amdgpu_device_init 决定加载哪些 IP Block',
              'pci_enable_device 配置 PCI 命令寄存器，启用 I/O 和内存空间访问',
              'pci_set_master 设置 PCI 命令寄存器的 Bus Master 位——GPU 需要通过 DMA 读写系统内存',
              'ioremap 将物理地址映射到内核虚拟地址——之后 WREG32/RREG32 通过这个映射访问 GPU 寄存器',
              'IS_ERR/PTR_ERR 宏用于处理返回 ERR_PTR(-errno) 的内核函数（指针编码的错误码）',
              'goto err_xxx 是内核标准的错误清理模式——每个错误标签恢复到对应步骤之前的状态',
            ],
            explanation: 'amdgpu_pci_probe 是你的 GPU 驱动初始化的起点。它按严格顺序执行 5 个关键步骤：启用 PCI 设备 → 允许 DMA → 分配 DRM 设备 → 映射 GPU 寄存器 → 初始化 IP Block。任何步骤失败都通过 goto 跳转到相应的错误标签，按逆序清理已分配的资源。这种 goto 链式清理模式是你在整个 amdgpu 代码库中会反复看到的核心模式。',
          },
          miniLab: {
            title: '编写一个匹配 AMD GPU Vendor ID 的最小 PCI 驱动',
            objective: '编写一个最小的 PCI 驱动，注册 AMD 的 Vendor ID (0x1002)，在 probe 时打印设备信息。理解 PCI 驱动框架的核心流程。',
            steps: [
              '创建 mini_pci.c：定义 pci_device_id 表（匹配 Vendor=0x1002, Device=PCI_ANY_ID）',
              '实现 probe 函数：打印 pci_name(pdev)、pdev->vendor、pdev->device',
              '实现 remove 函数：打印设备被移除的消息',
              '定义 struct pci_driver 并在 module_init 中调用 pci_register_driver',
              '创建 Makefile 并编译',
              '注意：不要在有真实 amdgpu 驱动运行的系统上加载此模块——两个驱动会冲突。使用 KVM 虚拟机或仅检查编译是否通过',
              '查看编译输出确认无警告，用 modinfo 查看模块信息',
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
alias:          pci:v00001002d*sv*sd*bc*sc*i*  ← 匹配 AMD Vendor ID`,
          },
          debugExercise: {
            title: '找出 probe 函数中的错误清理顺序问题',
            language: 'c',
            description: '以下 PCI probe 函数的错误处理路径有一个资源清理顺序错误，可能导致内核崩溃。',
            question: '错误清理路径有什么问题？可能导致什么后果？',
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
        goto err_disable;  /* BUG: 跳过了 pci_clear_master! */
    }

    ret = init_hardware(regs);
    if (ret)
        goto err_disable;  /* BUG: 没有 iounmap(regs)! */

    return 0;

err_disable:
    pci_disable_device(pdev);
    return ret;
}`,
            hint: '对比 probe 的初始化顺序（enable → set_master → ioremap → init_hw）和错误路径的清理顺序——是否严格逆序？',
            answer: '两个严重 Bug：（1）init_hardware 失败时直接 goto err_disable，跳过了 iounmap(regs)——这导致内核虚拟地址空间泄漏。在长时间运行的系统中，反复加载/卸载模块会耗尽内核的 vmalloc 空间。（2）ioremap 失败时 goto err_disable 也跳过了 pci_clear_master——虽然 pci_disable_device 会间接清理 Bus Master 位，但最佳实践是显式调用。正确的修复：添加两个错误标签，按逆序清理：err_ioremap: iounmap(regs); err_master: pci_clear_master(pdev); err_disable: pci_disable_device(pdev); 并让 init_hardware 失败跳到 err_ioremap，ioremap 失败跳到 err_master。这就是为什么内核开发者使用 goto 链式清理——它能确保每个错误路径都有正确的、完整的资源回收。',
          },
          interviewQ: {
            question: '描述 Linux PCI 驱动的 probe 和 remove 回调。在 amdgpu 驱动中，probe 函数做了哪些关键操作？',
            difficulty: 'medium',
            hint: '按顺序描述 probe 的步骤：pci_enable_device → pci_set_master → ioremap BAR → amdgpu_device_init。强调每一步的硬件配置含义和 probe/remove 的镜像关系。',
            answer: 'PCI 驱动通过 struct pci_driver 注册，其中 probe 在设备被发现时调用，remove 在设备移除时调用。amdgpu 的 probe（amdgpu_pci_probe）关键步骤：（1）pci_enable_device — 向 PCI 配置空间写入命令寄存器，启用设备的 I/O 和内存空间访问，并分配 IRQ；（2）pci_set_master — 设置 PCI 命令寄存器的 Bus Master Enable 位，允许 GPU 发起 DMA 传输（GPU 通过 DMA 从系统内存读取命令缓冲区和纹理数据）；（3）ioremap BAR — 将 GPU 的 BAR 寄存器空间（物理地址）映射到内核虚拟地址，使驱动可以通过 writel/readl 访问 GPU 的数千个控制寄存器；（4）amdgpu_device_init — 根据 CHIP 类型（从 pci_device_id.driver_data 获取）加载对应的 IP Block 实现（GFX、SDMA、DC、VCN、SMU），加载固件，初始化内存管理器（TTM）、命令调度器（GPU scheduler）、中断处理、显示模块（KMS）。remove 函数（amdgpu_pci_remove）按严格逆序执行：关闭显示 → 停止调度器 → 释放 IP Block → iounmap → pci_clear_master → pci_disable_device。probe 和 remove 的镜像关系确保资源不会泄漏。',
            amdContext: 'AMD 面试中这是核心问题。除了知道 API 名称，更重要的是理解每步的硬件含义：pci_set_master 让 GPU 成为 PCI 总线主控设备，ioremap 建立 CPU 到 GPU 寄存器的通信通道。',
          },
        },

        // ── Lesson 3.1.3 ──────────────────────────────────────
        {
          id: '3-1-3',
          number: '3.1.3',
          title: '内核错误处理：goto 链式清理模式',
          titleEn: 'Kernel Error Handling: The goto Cleanup Chain Pattern',
          duration: 15,
          difficulty: 'intermediate',
          tags: ['goto', 'error-handling', 'errno', 'IS_ERR', 'cleanup'],
          concept: {
            summary: '在用户空间代码中 goto 是禁忌，但在 Linux 内核中 goto 是最常用的错误处理模式。当一个函数需要按顺序获取多个资源时，goto 链式清理确保任何步骤失败都能正确释放之前获取的资源。amdgpu_device_init 有超过 20 个 goto 标签——理解这个模式是读懂内核代码的关键。',
            explanation: [
              '为什么内核偏爱 goto？考虑一个需要获取 5 个资源的函数：如果步骤 3 失败，需要释放资源 2 和 1（按逆序）；如果步骤 5 失败，需要释放 4、3、2、1。用嵌套 if-else 实现这个逻辑会导致深度嵌套和大量重复代码，而 goto 可以用线性、扁平的代码结构优雅地解决。Linus Torvalds 本人在内核编码风格文档中明确推荐这种模式。',
              '标准模式很简单：在函数末尾定义一系列错误标签（从最后获取的资源到最先获取的资源），每个标签释放对应的资源并 fall through 到下一个标签。初始化代码中如果某步失败，goto 到该步骤对应的错误标签——标签之后的所有清理代码会按逆序自动执行。这确保了每个资源只在成功获取后才需要释放。',
              '内核使用负的 errno 值作为错误码（如 -ENOMEM、-EINVAL、-EIO）。成功返回 0，失败返回负值。这个约定贯穿整个内核。IS_ERR(ptr) 宏检查一个指针是否编码了错误码（指针值在 -1 到 -MAX_ERRNO 范围内），PTR_ERR(ptr) 从编码了错误的指针中提取 errno 值，ERR_PTR(errno) 将 errno 编码为指针。这种"错误指针"机制让函数可以在一个返回值中同时表达"成功（返回有效指针）"和"失败（返回编码了错误码的假指针）"。',
              'amdgpu_device_init 是这种模式的典型案例。它需要初始化十几个子系统：doorbell、VRAM、IP discovery、固件加载、各个 IP Block 等。每个子系统的初始化都可能失败，而且后面的子系统依赖前面的。函数末尾有一个长长的 goto 标签链，确保任何步骤失败都能正确回滚。这不是糟糕的编码风格——这是经过数十年验证的、最可靠的内核资源管理模式。',
              '常见的反模式是忘记在错误路径中释放资源——这会导致内核内存泄漏。Linux 有专门的工具（kmemleak、smatch、sparse）来静态检测这类 Bug。在提交 amdgpu 补丁时，审查者会特别关注错误路径的资源释放是否完整。',
              'Modern kernel development (5.x+) also uses dev_err_probe() for probe-time errors. This function combines dev_err() with returning the error code, and specially handles -EPROBE_DEFER (deferred probing — when a dependency isn\'t ready yet). In amdgpu, you\'ll see patterns like: return dev_err_probe(dev, ret, "failed to init GMC"); which prints the error AND returns the error code in one line. It\'s cleaner than the traditional if (ret) { dev_err(...); return ret; } pattern. Understanding dev_err_probe is essential because reviewers on amd-gfx will request you use it for new probe-path error handling.',
            ],
            keyPoints: [
              'goto 在内核中是推荐的错误处理模式——Linus 在 CodingStyle 中明确支持',
              '标准模式：错误标签按资源获取的逆序排列，每个标签释放一个资源并 fall through',
              '负 errno 值是内核的标准错误码：-ENOMEM(12)、-EINVAL(22)、-EIO(5) 等',
              'IS_ERR/PTR_ERR/ERR_PTR 宏用于指针编码的错误码——常见于返回指针的函数',
              'amdgpu_device_init 有 20+ 个 goto 标签，是 goto 链式清理的大型实例',
              '忘记在错误路径释放资源 = 内核内存泄漏 → kmemleak/smatch 可检测',
              'dev_err_probe() is the modern (5.x+) pattern for probe-time errors — combines error logging and -EPROBE_DEFER handling',
            ],
          },
          diagram: {
            title: 'goto 链式清理 vs 嵌套 if-else 对比',
            content: `两种错误处理风格对比：嵌套 if-else vs goto 链式清理

方式 A：嵌套 if-else（用户空间风格，内核中不推荐）
┌──────────────────────────────────────────────┐
│ int init() {                                  │
│     a = alloc_a();                            │
│     if (a) {                                  │
│         b = alloc_b();                        │
│         if (b) {                              │
│             c = alloc_c();                    │
│             if (c) {                          │
│                 return 0;   /* 成功 */        │
│             }                                 │
│             free_b(b);      ← 缩进地狱       │
│         }                                     │
│         free_a(a);                            │
│     }                                         │
│     return -ENOMEM;                           │
│ }                                             │
│  问题：嵌套深、重复多、难维护                  │
└──────────────────────────────────────────────┘

方式 B：goto 链式清理（内核推荐模式）
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
│     return 0;          /* 成功 — 扁平结构 */  │
│                                               │
│ err_c:                 ← 逆序清理标签         │
│     free_b(b);                                │
│ err_b:                                        │
│     free_a(a);                                │
│ err_a:                                        │
│     return ret;                               │
│ }                                             │
│  优点：扁平、清晰、正确、可维护               │
└──────────────────────────────────────────────┘

在 amdgpu_device_init 中的实际应用：
init_doorbell → init_amdgpu_vram_mgr → ip_discovery →
fw_load → ip_init → ring_test → ...
       │                    │
       失败?                失败?
       goto err_doorbell    goto err_fw
                ↓                  ↓
         ... → free_fw → free_ip_disc → free_vram → free_doorbell`,
            caption: 'goto 链式清理是内核的标准错误处理模式。amdgpu_device_init 等大型初始化函数中，goto 标签链可以有 20+ 个节点，确保每个失败路径都正确回收资源。',
          },
          codeWalk: {
            title: 'amdgpu_device_init 中的 goto 清理链（简化）',
            file: 'drivers/gpu/drm/amd/amdgpu/amdgpu_device.c',
            language: 'c',
            code: `/* amdgpu_device_init — GPU 完整初始化（简化展示 goto 模式） */
int amdgpu_device_init(struct amdgpu_device *adev,
                        uint32_t flags)
{
    int r;

    /* Step 1: 初始化 Doorbell 映射 */
    r = amdgpu_device_doorbell_init(adev);
    if (r) {
        dev_err(adev->dev, "doorbell init failed: %d\\n", r);
        return r;  /* 无资源需要清理 */
    }

    /* Step 2: IP Discovery — 检测 GPU 的硬件模块 */
    r = amdgpu_discovery_set_ip_blocks(adev);
    if (r) {
        dev_err(adev->dev, "ip discovery failed: %d\\n", r);
        goto failed_doorbell;
    }

    /* Step 3: 加载 GPU 固件 */
    r = amdgpu_device_fw_loading(adev);
    if (r) {
        dev_err(adev->dev, "fw loading failed: %d\\n", r);
        goto failed_ip;
    }

    /* Step 4: 初始化所有 IP Block 硬件 */
    r = amdgpu_device_ip_init(adev);
    if (r) {
        dev_err(adev->dev, "ip_init failed: %d\\n", r);
        goto failed_fw;
    }

    /* Step 5: 注册 GPU 内存管理和显示 */
    r = amdgpu_ttm_init(adev);
    if (r) {
        dev_err(adev->dev, "ttm init failed: %d\\n", r);
        goto failed_ip_init;
    }

    return 0;  /* 所有初始化成功 */

/* === goto 清理链：严格逆序 === */
failed_ip_init:
    amdgpu_device_ip_fini(adev);      /* 反初始化 IP Block */
failed_fw:
    amdgpu_ucode_release(&adev->firmware);  /* 释放固件 */
failed_ip:
    /* IP discovery 清理 */
failed_doorbell:
    amdgpu_device_doorbell_fini(adev); /* 释放 doorbell 映射 */
    return r;
}

/* IS_ERR / PTR_ERR 用法示例 */
struct amdgpu_bo *amdgpu_bo_create_example(void)
{
    struct amdgpu_bo *bo;
    bo = amdgpu_bo_create(adev, size, PAGE_SIZE, ...);
    if (IS_ERR(bo)) {
        /* bo 不是有效指针，而是编码了错误码 */
        int err = PTR_ERR(bo);  /* 提取 -ENOMEM 等 */
        pr_err("BO alloc failed: %d\\n", err);
        return ERR_PTR(err);    /* 传播错误 */
    }
    /* bo 是有效指针，可以使用 */
    return bo;
}`,
            annotations: [
              '每个步骤失败后 goto 到对应标签——标签名通常以 failed_ 或 err_ 开头',
              'dev_err 替代 printk，自动添加设备名前缀，方便在多 GPU 系统中区分来源',
              '清理链中每个标签 fall through 到下一个——释放 ip_init 后自动继续释放 fw、ip、doorbell',
              'IS_ERR 检查指针是否在 (-1, -MAX_ERRNO) 范围内——这些地址在内核中不可能是有效的',
              'PTR_ERR 将"错误指针"转换回 int 错误码，ERR_PTR 将 int 错误码转换为"错误指针"',
              '实际的 amdgpu_device_init 有更多步骤和标签——这里只展示了核心模式',
            ],
            explanation: 'goto 链式清理让这个复杂的初始化函数保持扁平和可读。想象如果用嵌套 if-else——5 个步骤就需要 5 层缩进。实际的 amdgpu_device_init 有十几个步骤，嵌套方式根本不可行。IS_ERR/PTR_ERR 宏则解决了另一个问题：如何在返回指针的函数中同时传达错误信息。这两种机制是内核错误处理的基石。',
          },
          miniLab: {
            title: '将嵌套 if-else 重构为 goto 清理模式',
            objective: '给定一段使用嵌套 if-else 的资源初始化代码，将其重构为内核风格的 goto 链式清理模式。',
            steps: [
              '阅读以下嵌套 if-else 代码（分配 3 个资源：buffer、lock、workqueue）',
              '识别每个资源的分配/释放对（alloc↔free, init↔destroy, create↔destroy）',
              '按获取顺序列出资源：buffer → lock → workqueue',
              '重写为 goto 模式：主路径线性排列，末尾按逆序定义清理标签',
              '编译并验证在每个失败点（故意返回 -ENOMEM）都能正确清理',
              '使用 kmemleak（如果可用）验证没有内存泄漏',
            ],
            expectedOutput: `重构前（嵌套 if-else，4 层缩进）：
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

重构后（goto 链式清理，0 层多余缩进）：
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
            title: '找出错误路径中遗漏的资源释放',
            language: 'c',
            description: '以下函数的错误路径中遗漏了一个关键的资源释放，会导致内核内存泄漏。',
            question: '哪个错误路径遗漏了资源释放？泄漏的是什么资源？',
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
        goto err_regs;  /* BUG! 应该 goto err_irq_data */

    return 0;

err_irq_data:
    kfree(dev->irq_data);
err_regs:
    iounmap(dev->regs);
    return ret;
}`,
            hint: '逐步检查每个失败路径的清理：request_irq 失败时，ioremap 的映射和 kzalloc 的内存是否都被释放了？',
            answer: 'Bug 在 request_irq 失败时 goto err_regs 而不是 goto err_irq_data。此时 dev->irq_data 已经通过 kzalloc 分配了内存，但 goto err_regs 跳过了 kfree(dev->irq_data)，直接执行 iounmap。结果：dev->irq_data 指向的内存永远不会被释放——这是一个内核内存泄漏（kernel memory leak）。修复：将 goto err_regs 改为 goto err_irq_data。这类 Bug 在代码审查中非常常见——新增一个初始化步骤后忘记更新已有错误路径的 goto 目标。工具检测：smatch（静态分析器）可以检测这类资源泄漏；运行时可用 kmemleak 检测（echo scan > /sys/kernel/debug/kmemleak）。amdgpu 的 CI 系统会自动运行这些检查。',
          },
          interviewQ: {
            question: '为什么 Linux 内核代码中大量使用 goto？这不违反结构化编程原则吗？解释内核的 goto 链式清理模式。',
            difficulty: 'medium',
            hint: '从实际问题出发：多资源获取的函数中，每个步骤都可能失败，需要释放已获取的资源。对比嵌套 if-else 的可读性和 goto 的扁平性。',
            answer: 'Linux 内核大量使用 goto 是经过深思熟虑的工程决策，不是编码风格的妥协。原因：（1）内核函数经常需要按序获取多个资源（内存、映射、锁、中断等），任何步骤都可能失败，失败时必须释放已获取的资源。用嵌套 if-else 实现会导致代码缩进越来越深（"三角形代码"），可读性差且容易遗漏清理步骤。goto 链式清理让主路径（happy path）保持线性、零缩进，所有错误处理集中在函数末尾。（2）goto 只用于函数内的"向前跳转到清理标签"——不会跨函数、不会形成循环、不会跳过变量初始化。这种受限的使用方式完全符合结构化编程的精神。（3）Linus Torvalds 在 Documentation/process/coding-style.rst 中明确推荐此模式。（4）实际效果：使用 goto 的内核代码 Bug 率并不高于其他语言——相反，因为清理逻辑集中在一处，审查时更容易发现遗漏的资源释放。IS_ERR/PTR_ERR 宏补充了 goto 模式，让返回指针的函数也能优雅地传播错误码。',
            amdContext: 'AMD 面试中如果你能解释清楚 goto 在内核中的正当性，并用 amdgpu_device_init 作为例子，会展示出你对内核编码哲学的深入理解——这不仅仅是技术能力，更是对内核文化的认同。',
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
      title: '驱动开发必备内核知识',
      titleEn: 'Kernel Internals for Driver Development',
      icon: '⚙️',
      description: '掌握驱动开发所需的内核核心机制：并发同步原语和内存管理。amdgpu 中大量使用 spinlock、mutex、kmalloc 和 slab——理解这些机制才能读懂驱动的资源管理代码。',
      lessons: [
        // ── Lesson 3.2.1 ──────────────────────────────────────
        {
          id: '3-2-1',
          number: '3.2.1',
          title: '内核同步原语：从 spinlock 到 RCU',
          titleEn: 'Kernel Synchronization Primitives: From Spinlock to RCU',
          duration: 15,
          difficulty: 'intermediate',
          tags: ['spinlock', 'mutex', 'semaphore', 'atomic', 'RCU', 'synchronization'],
          concept: {
            summary: '内核代码运行在多核 CPU 上且随时可能被中断打断——没有同步机制就意味着数据竞争和崩溃。Linux 提供了从轻量级 spinlock 到高级 RCU 的多层同步原语，每种适用于不同的场景。amdgpu 驱动中 mutex 保护 VRAM 管理器，spinlock 保护中断上下文的数据结构——选错同步原语会导致死锁或性能灾难。',
            explanation: [
              'Spinlock（自旋锁）是最基本的内核锁。当一个 CPU 核心持有 spinlock 时，其他试图获取该锁的核心会原地"自旋"（busy-wait），不断检查锁是否释放。Spinlock 的关键约束：（1）持有 spinlock 期间不能睡眠（sleep）——因为自旋等待者占用 CPU 100%，如果持有者睡眠，自旋者就永远无法获取锁，造成死锁；（2）临界区必须很短（通常 < 1μs）；（3）在中断上下文中必须使用 spin_lock_irqsave/spin_unlock_irqrestore（禁用中断），否则如果中断处理程序也尝试获取同一个锁，会发生单核自死锁。',
              'Mutex（互斥锁）适用于可能需要较长时间的临界区。与 spinlock 不同，等待 mutex 的线程会被放入等待队列并进入睡眠状态，不浪费 CPU 时间。代价是上下文切换（约 1-10μs）比自旋（约 10-100ns）慢。Mutex 的关键约束：（1）只能在进程上下文（process context）中使用——中断上下文不能睡眠，因此不能使用 mutex；（2）同一线程不能递归获取同一个 mutex（死锁）；（3）持有者必须在同一线程中释放。',
              'RW Semaphore（读写信号量）优化了"多读少写"的场景。多个读者可以同时持有锁（并发读取不会破坏数据），但写者需要独占（等待所有读者释放后才能获取）。amdgpu 的 VM（虚拟内存）子系统使用 rw_semaphore 保护页表——GPU 命令提交时并发读取页表，但页表更新（如 BO 映射变化）需要写锁。',
              'Atomic 操作是最轻量的同步机制——使用 CPU 的原子指令（如 x86 的 LOCK 前缀）实现无锁的加减、比较交换（cmpxchg）。适用于简单的计数器和标志位。amdgpu 的引用计数（如 amdgpu_bo 的引用计数）就使用 atomic_t。atomic_inc/atomic_dec/atomic_read 是其核心 API。',
              'RCU（Read-Copy-Update）是 Linux 内核最巧妙的同步机制。读者完全无锁（不需要任何同步操作），写者先复制数据、修改副本、然后原子地替换旧数据的指针。旧数据在所有读者退出后才被释放（"宽限期"机制）。RCU 适用于读远多于写的场景，如内核的路由表。amdgpu 的 BO（Buffer Object）查找使用 RCU 优化读取性能。',
            ],
            keyPoints: [
              'spinlock: 自旋等待，不能睡眠，用于中断上下文和短临界区（<1μs）',
              'mutex: 睡眠等待，只能在进程上下文使用，适合长临界区',
              'rw_semaphore: 多读者并发 + 独占写者，适合"多读少写"场景',
              'atomic_t: 原子操作，最轻量，适合计数器和标志位',
              'RCU: 读者无锁、写者复制替换，适合读远多于写的场景',
              '选错同步原语的后果：mutex 在中断上下文 → BUG/死锁，spinlock 持有时睡眠 → 死锁',
            ],
          },
          diagram: {
            title: '内核同步原语选择决策树',
            content: `选择正确的同步原语——决策树

需要保护共享数据?
       │
       ▼
是否在中断/软中断上下文?
       │
    ┌──┴──┐
    │ YES │                              │ NO │
    ▼     │                              ▼
只读?    │                           临界区是否需要睡眠?
│        │                              │
├─YES──▶ rcu_read_lock()             ┌──┴──┐
│        (完全无锁，最快)             │ YES │         │ NO │
│                                     ▼               ▼
├─NO──▶  spin_lock_irqsave()      mutex_lock()    spin_lock()
│        (禁中断+自旋)             (可以睡眠等待)   (自旋等待)
│        临界区必须极短!            可以做 I/O,      临界区应短
│                                  分配内存等
│
是简单计数器/标志?
│
└─YES──▶ atomic_inc() / atomic_set()
         (无锁，CPU 原子指令)

amdgpu 中的实际使用：
┌─────────────────────────────────────────────────────────┐
│ 数据结构            同步原语           原因              │
│─────────────────────────────────────────────────────────│
│ VRAM 管理器         mutex              分配可能睡眠     │
│ Ring Buffer 写指针   spinlock           中断上下文访问   │
│ IRQ 源注册          spin_lock_irqsave  中断处理中使用   │
│ BO 引用计数         atomic_t           简单递增递减     │
│ GPU VM 页表         rw_semaphore       多读（CS）少写   │
│ fence 信号          spinlock           中断中 signal    │
└─────────────────────────────────────────────────────────┘`,
            caption: '选择同步原语的核心判断：是否在中断上下文？临界区是否需要睡眠？是否多读少写？回答这三个问题就能选对原语。',
          },
          codeWalk: {
            title: 'amdgpu 中 mutex 和 spinlock 的实际使用',
            file: 'drivers/gpu/drm/amd/amdgpu/amdgpu_vram_mgr.c',
            language: 'c',
            code: `/* === 1. Mutex: 保护 VRAM 管理器 === */
/* amdgpu_vram_mgr.c — VRAM 分配需要睡眠等待，使用 mutex */
struct amdgpu_vram_mgr {
    struct mutex lock;   /* 保护 VRAM 分配状态 */
    /* ... VRAM block list, stats ... */
};

int amdgpu_vram_mgr_alloc(struct amdgpu_vram_mgr *mgr, ...)
{
    mutex_lock(&mgr->lock);
    /* 分配 VRAM — 可能需要等待其他 BO 被释放
     * 这里可以安全地睡眠等待，因为我们在进程上下文 */
    node = drm_mm_insert_node(&mgr->mm, size, alignment);
    mutex_unlock(&mgr->lock);
    return ret;
}

/* === 2. Spinlock: 保护中断上下文的 fence 处理 === */
/* amdgpu_fence.c — GPU 完成通知在中断中处理 */
void amdgpu_fence_process(struct amdgpu_ring *ring)
{
    struct amdgpu_fence_driver *drv = &ring->fence_drv;
    unsigned long flags;

    /* spin_lock_irqsave: 禁用中断 + 获取锁
     * 必须禁用中断，因为此函数可能同时从
     * 进程上下文和中断上下文调用 */
    spin_lock_irqsave(&drv->lock, flags);

    /* 检查 GPU 完成的 fence 序列号 */
    last_seq = atomic64_read(&ring->fence_drv.last_seq);
    /* 唤醒等待 fence 完成的线程 */
    /* ... signal completed fences ... */

    spin_unlock_irqrestore(&drv->lock, flags);
    /* ↑ 恢复之前的中断状态 */
}

/* === 3. Atomic: 引用计数 === */
/* amdgpu_bo.c — Buffer Object 引用计数 */
static inline void amdgpu_bo_ref(struct amdgpu_bo *bo)
{
    /* 原子递增引用计数 — 无需任何锁 */
    drm_gem_object_get(&bo->tbo.base);
    /* 内部使用 kref_get → atomic_inc(&obj->refcount) */
}`,
            annotations: [
              'mutex_lock/unlock 包围的临界区中可以调用可能睡眠的函数（如内存分配、I/O 等待）',
              'spin_lock_irqsave 保存中断状态到 flags 变量，spin_unlock_irqrestore 恢复——支持嵌套',
              '中断上下文中必须使用 irqsave 变体，否则如果已经在中断处理中，再次禁用中断会丢失中断状态',
              'atomic64_read 使用 CPU 的原子读取指令，即使在自旋锁保护区内也能安全读取',
              'kref_get/kref_put 是内核的引用计数框架，底层使用 atomic_t 实现',
              'drm_mm_insert_node 是 DRM 的内存管理器 API，用红黑树管理地址空间的分配',
            ],
            explanation: 'amdgpu 驱动中同步原语的选择完全遵循决策树：VRAM 分配可能需要等待内存释放（睡眠），所以用 mutex；fence 处理在中断上下文中执行，所以用 spin_lock_irqsave；BO 引用计数是简单的递增递减，所以用 atomic。选错的后果是致命的——在中断上下文用 mutex 会触发 "BUG: scheduling while atomic" 并崩溃。',
          },
          miniLab: {
            title: '用 mutex 实现一个简单的生产者-消费者模块',
            objective: '编写一个内核模块，使用 mutex 保护一个共享缓冲区，两个内核线程分别作为生产者和消费者。验证同步的正确性。',
            steps: [
              '创建模块 prodcons.c，定义共享缓冲区（int buffer[BUFSIZE]）和一个 mutex',
              '创建生产者内核线程（kthread_create）：获取 mutex → 写入数据 → 释放 mutex → msleep(100)',
              '创建消费者内核线程：获取 mutex → 读取数据 → 释放 mutex → msleep(150)',
              '使用 printk 记录每次读写操作和线程 ID',
              '在 module_init 中启动两个线程，module_exit 中用 kthread_stop 停止',
              '编译并加载模块，观察 dmesg 输出验证互斥正确（不会出现读写交错）',
              '尝试将 mutex 改为 spinlock + msleep，观察内核是否报 "scheduling while atomic" 错误',
            ],
            expectedOutput: `$ sudo insmod prodcons.ko
$ dmesg | tail -10
[  100.001] prodcons: producer wrote buffer[0] = 1
[  100.101] prodcons: producer wrote buffer[1] = 2
[  100.152] prodcons: consumer read  buffer[0] = 1
[  100.201] prodcons: producer wrote buffer[2] = 3
[  100.302] prodcons: consumer read  buffer[1] = 2
...
# 注意：生产和消费交替进行，但从不同时发生（mutex 保护）

$ sudo rmmod prodcons
$ dmesg | tail -1
[  110.000] prodcons: threads stopped, module unloaded`,
          },
          debugExercise: {
            title: '在中断上下文中使用 mutex — 致命错误',
            language: 'c',
            description: '以下中断处理程序中使用了 mutex 来保护共享数据。这会导致什么后果？',
            question: '为什么这段代码会导致内核崩溃？正确的修复方式是什么？',
            buggyCode: `static DEFINE_MUTEX(irq_data_lock);
static int shared_counter;

/* 中断处理函数 — 在中断上下文中运行 */
static irqreturn_t my_irq_handler(int irq, void *dev_id)
{
    mutex_lock(&irq_data_lock);   /* BUG! */
    shared_counter++;
    mutex_unlock(&irq_data_lock);
    return IRQ_HANDLED;
}

/* 进程上下文中读取计数器 */
static ssize_t read_counter(struct file *f, char __user *buf, ...)
{
    int val;
    mutex_lock(&irq_data_lock);
    val = shared_counter;
    mutex_unlock(&irq_data_lock);
    return simple_read_from_buffer(buf, count, ppos, &val, sizeof(val));
}`,
            hint: '中断处理程序有一个铁律：不能睡眠。mutex_lock 在锁被占用时会让调用者进入睡眠等待。那如果在中断中调用 mutex_lock，锁恰好被占用……',
            answer: '致命 Bug：在中断上下文中调用 mutex_lock。中断上下文不能睡眠（不能调用 schedule()），因为中断处理打断了正在运行的进程——如果中断处理自身睡眠，被打断的进程无法恢复，系统会死锁。mutex_lock 在锁被占用时会调用 schedule() 让出 CPU 并进入睡眠等待——这在中断上下文中会触发内核 BUG："BUG: scheduling while atomic"，随后是 Kernel Panic。正确修复：将 mutex 替换为 spinlock_t 和 spin_lock_irqsave/spin_unlock_irqrestore。进程上下文中也使用 spin_lock_irqsave（禁用中断防止死锁）。如果临界区确实只是递增计数器，更好的方案是使用 atomic_t 和 atomic_inc，完全不需要任何锁。amdgpu 的 fence 处理就是这样——fence 序列号使用 atomic64_t，避免了在中断上下文中使用锁。',
          },
          interviewQ: {
            question: '解释 spinlock 和 mutex 的区别。在什么场景下使用哪种？在 amdgpu 驱动中各有什么实例？',
            difficulty: 'medium',
            hint: '从等待方式（自旋 vs 睡眠）、可用上下文（中断 vs 进程）、临界区长度、和性能特性的角度对比。',
            answer: 'Spinlock vs Mutex 核心区别：（1）等待方式：spinlock 自旋（busy-wait，CPU 一直检查锁状态），mutex 睡眠（等待者进入等待队列，让出 CPU）。（2）可用上下文：spinlock 可以在中断上下文和进程上下文使用（中断中必须用 spin_lock_irqsave），mutex 只能在进程上下文使用（会调用 schedule()，中断上下文中不可睡眠）。（3）临界区长度：spinlock 要求极短的临界区（<1μs），因为自旋浪费 CPU；mutex 可以保护长临界区，包括可能睡眠的操作（如 I/O、内存分配）。（4）性能：低争用时 spinlock 更快（无上下文切换开销），高争用时 mutex 更好（不浪费 CPU）。amdgpu 实例：spinlock — amdgpu_fence_process 中用 spin_lock_irqsave 保护 fence 序列号更新，因为此函数从中断上下文调用；amdgpu_irq_handler 中用 spinlock 保护中断源注册表。mutex — amdgpu_vram_mgr 用 mutex 保护 VRAM 分配/释放，因为分配可能需要等待其他 BO 被驱逐（sleep）；amdgpu_bo_reserve 使用 ww_mutex（等待/伤害 mutex）保护 BO 状态，支持死锁避免。',
            amdContext: 'AMD 驱动开发中锁的选择直接影响 GPU 性能。面试中展示你知道 amdgpu 中哪里用 spinlock、哪里用 mutex、以及为什么——这比背 API 名称有价值得多。',
          },
        },

        // ── Lesson 3.2.2 ──────────────────────────────────────
        {
          id: '3-2-2',
          number: '3.2.2',
          title: '内核内存管理：kmalloc、vmalloc 与 slab',
          titleEn: 'Kernel Memory Management: kmalloc, vmalloc, and Slab',
          duration: 15,
          difficulty: 'intermediate',
          tags: ['kmalloc', 'vmalloc', 'kzalloc', 'slab', 'GFP', 'DMA', 'memory'],
          concept: {
            summary: '内核没有 malloc——取而代之的是多种针对不同场景优化的内存分配器。kmalloc 分配物理连续内存（适合 DMA），vmalloc 分配虚拟连续但物理可能不连续的内存（适合大缓冲区），slab 分配器（kmem_cache）为频繁创建/销毁的固定大小对象提供高性能缓存。GFP 标志告诉分配器"是否可以睡眠"——在中断上下文中只能使用 GFP_ATOMIC。',
            explanation: [
              'kmalloc 是内核中最常用的内存分配函数，类似用户空间的 malloc，但有两个关键区别：（1）分配的内存是物理连续的——这对于 DMA 传输至关重要，因为很多硬件设备不支持散列-聚集（scatter-gather）DMA；（2）需要指定 GFP 标志来告诉分配器运行上下文。kmalloc 的最大分配限制通常是 4MB（PAGE_SIZE * 2^MAX_ORDER），超过这个大小会失败。kzalloc 是 kmalloc + memset(0) 的组合——在内核中更推荐使用 kzalloc，因为未初始化的内核内存可能包含敏感数据。',
              'vmalloc 分配虚拟地址连续但物理页帧可能分散的内存。它的优势是可以分配比 kmalloc 更大的内存块（几十 MB 甚至更多），因为不需要连续的物理页帧。代价：（1）每次访问可能需要额外的 TLB（Translation Lookaside Buffer）查找，性能略低于 kmalloc；（2）vmalloc 分配的内存不适合 DMA（物理不连续）；（3）vmalloc 总是可以睡眠，不能在中断上下文使用。amdgpu 驱动中，大的查找表（如 VRAM 的 bitmap 管理器）可能使用 vmalloc。',
              'GFP（Get Free Pages）标志是内核内存分配的核心概念。最常用的两个：GFP_KERNEL — 允许睡眠、允许 I/O（可以等待交换空间释放内存），只能在进程上下文使用；GFP_ATOMIC — 不允许睡眠，在中断上下文和持有 spinlock 时使用，分配失败的概率更高（因为不能等待内存回收）。GFP_DMA — 分配 DMA 可用的低地址内存（ISA DMA 的遗留限制）。在 amdgpu 中，probe/init 阶段使用 GFP_KERNEL，中断处理中使用 GFP_ATOMIC。',
              'Slab 分配器（kmem_cache）是内核为"频繁创建/销毁的固定大小对象"设计的高性能缓存。它预先分配一批同样大小的内存块（slab），创建对象时从缓存中取，销毁时返回缓存而不是真正释放。好处：（1）避免频繁的 kmalloc/kfree 开销；（2）减少内存碎片（所有对象大小相同）；（3）可以指定构造/析构函数。amdgpu 的 fence 子系统使用 kmem_cache_create 创建 fence 对象的 slab 缓存，因为每次 GPU 命令提交都需要创建 fence，每帧可能数百次。',
              'DMA 内存分配（dma_alloc_coherent）是 GPU 驱动的特殊需求。GPU 通过 DMA 从系统内存读写数据，但 DMA 地址（设备看到的地址）和 CPU 虚拟地址不同。dma_alloc_coherent 同时返回 CPU 虚拟地址和 DMA 地址（dma_addr_t），并确保 CPU 和设备看到的内存视图一致（cache coherent）。amdgpu 的 Ring Buffer（GPU 命令队列）就使用 dma_alloc_coherent 分配。',
            ],
            keyPoints: [
              'kmalloc/kzalloc: 物理连续，适合小内存（<4MB）和 DMA，需要 GFP 标志',
              'vmalloc: 物理不连续，可分配大内存，不适合 DMA，总是可能睡眠',
              'GFP_KERNEL: 允许睡眠（进程上下文），GFP_ATOMIC: 不能睡眠（中断上下文）',
              'kmem_cache_create/alloc/free: slab 缓存，适合频繁创建/销毁的固定大小对象',
              'dma_alloc_coherent: 分配 DMA 可用的 cache-coherent 内存，返回 CPU 和 DMA 地址对',
              '/proc/slabinfo 显示所有 slab 缓存的状态——可以看到 amdgpu 创建的 fence 缓存',
            ],
          },
          diagram: {
            title: '内核内存分配器选择指南',
            content: `内核内存分配器选择——决策流程

需要分配内核内存
       │
       ▼
需要物理连续 或 用于 DMA?
       │
    ┌──┴──────────────────────┐
    │ YES                      │ NO
    ▼                          ▼
  大小?                     vmalloc(size)
    │                       ├─ 虚拟连续，物理可散
    ├─ < 4MB               ├─ 适合大缓冲区
    │  kmalloc(size, gfp)   ├─ 不能用于 DMA
    │  kzalloc(size, gfp)   └─ 总是可能睡眠
    │
    └─ 需要 DMA 地址?
       │
       ├─ YES: dma_alloc_coherent(dev, size, &dma_addr, gfp)
       │       同时获取 CPU 虚拟地址 + DMA 地址
       │
       └─ NO:  kmalloc(size, gfp) 即可

是否频繁分配/释放同种对象?
       │
       └─ YES: kmem_cache_create() + kmem_cache_alloc()
              slab 缓存，避免碎片，性能更高

GFP 标志选择：
┌─────────────────────────────────────────────────┐
│  上下文              推荐 GFP               说明 │
│─────────────────────────────────────────────────│
│  进程上下文          GFP_KERNEL         可以睡眠 │
│  中断/softirq        GFP_ATOMIC       不能睡眠 │
│  持有 spinlock       GFP_ATOMIC       不能睡眠 │
│  初始化（__init）    GFP_KERNEL         可以睡眠 │
│  需要零初始化        加 __GFP_ZERO             │
│  （或直接用 kzalloc）                          │
└─────────────────────────────────────────────────┘

amdgpu 内存分配实例：
┌───────────────────────────────────────────────────────┐
│ 用途               分配方式                  GFP      │
│───────────────────────────────────────────────────────│
│ fence 对象         kmem_cache_alloc           KERNEL  │
│ Ring Buffer        dma_alloc_coherent         KERNEL  │
│ 临时命令缓冲区     kzalloc                    KERNEL  │
│ 中断数据           kzalloc                    ATOMIC  │
│ 大型查找表         vzalloc (vmalloc+零初始化)  —      │
└───────────────────────────────────────────────────────┘`,
            caption: '选择内存分配器的核心判断：是否需要物理连续？是否用于 DMA？是否在中断上下文？是否频繁分配同种对象？回答这些问题就能选对 API。',
          },
          codeWalk: {
            title: 'amdgpu fence slab 缓存 — 高频对象的高效分配',
            file: 'drivers/gpu/drm/amd/amdgpu/amdgpu_fence.c',
            language: 'c',
            code: `/* amdgpu_fence.c — fence 对象的 slab 缓存管理 */

/* 全局 slab 缓存指针 */
static struct kmem_cache *amdgpu_fence_slab;

/* 初始化：在 module_init 阶段创建 slab 缓存 */
int amdgpu_fence_slab_init(void)
{
    amdgpu_fence_slab = kmem_cache_create(
        "amdgpu_fence",                /* 缓存名，/proc/slabinfo 中可见 */
        sizeof(struct amdgpu_fence),    /* 每个对象的大小 */
        0,                              /* 对齐要求（0=自动） */
        SLAB_HWCACHE_ALIGN,            /* 标志：按 CPU 缓存行对齐 */
        NULL);                          /* 构造函数（可选） */
    if (!amdgpu_fence_slab)
        return -ENOMEM;
    return 0;
}

/* 销毁：在 module_exit 阶段销毁缓存 */
void amdgpu_fence_slab_fini(void)
{
    kmem_cache_destroy(amdgpu_fence_slab);
    amdgpu_fence_slab = NULL;
}

/* 分配 fence 对象 — 每次 GPU 命令提交都需要 */
struct amdgpu_fence *amdgpu_fence_create(void)
{
    struct amdgpu_fence *fence;

    /* 从 slab 缓存中获取一个预分配的对象
     * 比 kzalloc(sizeof(*fence), ...) 快得多
     * GFP_KERNEL: 在进程上下文中，允许睡眠等待 */
    fence = kmem_cache_zalloc(amdgpu_fence_slab, GFP_KERNEL);
    if (!fence)
        return NULL;

    /* 初始化 fence */
    dma_fence_init(&fence->base, &amdgpu_fence_ops,
                   &ring->fence_drv.lock, ring->fence_context,
                   ++ring->fence_drv.sync_seq);
    return fence;
}

/* 释放 fence — GPU 命令完成后调用 */
void amdgpu_fence_free(struct rcu_head *rcu)
{
    struct dma_fence *f = container_of(rcu, struct dma_fence, rcu);
    struct amdgpu_fence *fence = to_amdgpu_fence(f);

    /* 返回到 slab 缓存，不是真正释放
     * 下次 kmem_cache_alloc 会重用这块内存 */
    kmem_cache_free(amdgpu_fence_slab, fence);
}

/* === DMA 内存分配示例 — Ring Buffer === */
/* amdgpu_ring.c */
int amdgpu_ring_init(struct amdgpu_ring *ring, unsigned int size)
{
    /* Ring Buffer 需要 GPU 通过 DMA 读取，
     * 所以必须使用 dma_alloc_coherent */
    ring->ring = dma_alloc_coherent(adev->dev,
                                     ring->ring_size,
                                     &ring->gpu_addr,  /* DMA 地址 */
                                     GFP_KERNEL);
    if (!ring->ring)
        return -ENOMEM;
    /* ring->ring = CPU 虚拟地址（驱动写入命令用）
     * ring->gpu_addr = DMA 地址（GPU 读取命令用） */
    return 0;
}`,
            annotations: [
              'kmem_cache_create 的 name 参数出现在 /proc/slabinfo 和 /sys/kernel/slab/ 下，方便监控',
              'SLAB_HWCACHE_ALIGN 确保每个 fence 对象按 L1 缓存行对齐，避免 false sharing',
              'kmem_cache_zalloc = kmem_cache_alloc + 零初始化，比 kzalloc 更快（对象大小已知）',
              'fence 释放通过 RCU 回调（rcu_head）——确保所有读取 fence 的 CPU 核心都完成后才真正释放',
              'dma_alloc_coherent 返回两个地址：CPU 虚拟地址用于驱动写入，DMA 地址用于 GPU 读取',
              'Ring Buffer 的 DMA 地址（gpu_addr）会被写入 GPU 的寄存器，告诉 GPU 从哪里读取命令',
            ],
            explanation: 'fence 是 GPU 命令同步的核心对象——每次提交命令都创建一个，命令完成后销毁。在 60fps 的游戏中，每秒可能创建数百个 fence。如果用 kmalloc/kfree，频繁的分配/释放会导致内存碎片和性能下降。slab 缓存通过预分配和重用解决了这个问题——kmem_cache_alloc 通常只需要从空闲链表取一个对象，几乎是 O(1) 操作。dma_alloc_coherent 则解决了另一个问题：GPU 和 CPU 需要访问同一块内存，但它们的地址空间不同。',
          },
          miniLab: {
            title: '在 /proc/slabinfo 中查找 amdgpu 的 slab 缓存',
            objective: '通过 /proc/slabinfo 和 /sys/kernel/slab/ 观察 amdgpu 驱动创建的 slab 缓存，理解 slab 在实际驱动中的使用规模。',
            steps: [
              '确认 amdgpu 模块已加载：lsmod | grep amdgpu',
              '查看所有 amdgpu 相关的 slab 缓存：sudo cat /proc/slabinfo | head -2 && sudo cat /proc/slabinfo | grep -i amdgpu',
              '解读输出字段：name（缓存名）、active_objs（活跃对象数）、num_objs（总对象数）、objsize（对象大小）',
              '查看 fence 缓存详情：ls /sys/kernel/slab/amdgpu_fence/ 2>/dev/null || echo "查看 slabinfo 替代"',
              '运行一个 GPU 程序（如 glxgears）时再次检查 amdgpu_fence 的 active_objs 变化',
              '对比：查看其他驱动的 slab 缓存（如 grep -i "ext4\\|btrfs\\|dentry" /proc/slabinfo）感受 slab 在内核中的普遍性',
            ],
            expectedOutput: `$ sudo cat /proc/slabinfo | grep -i amdgpu
# name            <active_objs> <num_objs> <objsize> ...
amdgpu_fence           128        256        192      ...
amdgpu_vm_bo            64        128         96      ...

# 运行 glxgears 后：
amdgpu_fence           512       1024        192      ...
                       ↑ 活跃 fence 数量大幅增加

# 解读：
# - amdgpu_fence: 每个对象 192 字节，当前有 512 个活跃 fence
# - GPU 渲染期间 fence 数量与命令提交频率正相关`,
          },
          debugExercise: {
            title: '在中断上下文中使用 GFP_KERNEL — 休眠禁止',
            language: 'c',
            description: '以下中断处理代码使用了错误的 GFP 标志分配内存。找出问题。',
            question: '这段代码在什么情况下会导致内核崩溃？如何修复？',
            buggyCode: `/* 中断处理函数 */
static irqreturn_t gpu_irq_handler(int irq, void *data)
{
    struct gpu_device *gdev = data;
    struct irq_event *evt;

    /* 分配事件结构体来记录中断信息 */
    evt = kzalloc(sizeof(*evt), GFP_KERNEL);  /* BUG! */
    if (!evt)
        return IRQ_HANDLED;

    evt->timestamp = ktime_get();
    evt->source = readl(gdev->regs + IRQ_SOURCE);

    /* 添加到事件队列 */
    list_add_tail(&evt->node, &gdev->event_list);

    return IRQ_HANDLED;
}`,
            hint: 'GFP_KERNEL 允许分配器在内存不足时睡眠等待页面回收。但中断处理函数有一个铁律……',
            answer: 'Bug：在中断处理函数中使用 GFP_KERNEL。GFP_KERNEL 允许分配器在内存紧张时调用 schedule() 进入睡眠等待页面回收/交换，但中断上下文禁止睡眠。如果内存紧张且 kzalloc 试图睡眠，内核会触发 "BUG: sleeping function called from invalid context"，通常导致 Kernel Panic。修复方案：（1）将 GFP_KERNEL 改为 GFP_ATOMIC——这告诉分配器"不能睡眠，立即返回成功或失败"。GFP_ATOMIC 从预留的紧急内存池分配，失败概率更高，所以必须处理分配失败的情况。（2）更好的方案：使用 slab 缓存预分配 irq_event 对象（类似 amdgpu_fence_slab），中断中从缓存获取，避免每次都调用通用分配器。（3）amdgpu 的实际做法：在中断处理中尽量避免内存分配——只记录必要信息（如 fence 序列号），将复杂处理推迟到 tasklet 或 workqueue 中（在进程上下文中运行，可以使用 GFP_KERNEL）。',
          },
          interviewQ: {
            question: '解释 kmalloc、vmalloc 和 slab 分配器的区别。在 GPU 驱动开发中，各种场景下如何选择？',
            difficulty: 'medium',
            hint: '从物理连续性、大小限制、GFP 标志、DMA 兼容性和性能特性的角度对比三种分配器，结合 amdgpu 的 fence slab 和 ring buffer DMA 分配作为实例。',
            answer: '三种分配器的核心区别：（1）kmalloc — 分配物理连续内存，大小限制通常为 4MB。优点：性能最好（无额外 TLB 开销）、适合 DMA 传输（硬件需要连续物理地址）。用法：kmalloc(size, GFP_KERNEL) 或 kzalloc（+零初始化）。GPU 驱动场景：小到中等的数据结构、设备寄存器映射信息、临时缓冲区。（2）vmalloc — 分配虚拟连续但物理不连续的内存。优点：可分配大块内存（>4MB），不受物理内存碎片影响。缺点：每次访问可能需要额外 TLB 查找，性能略低；不适合 DMA（物理不连续）。GPU 驱动场景：大型查找表（如 VRAM bitmap 管理器）、大的内部缓冲区。（3）slab (kmem_cache) — 为固定大小对象提供高性能缓存池。对象分配/释放为 O(1)，减少碎片，可指定构造函数。GPU 驱动场景：amdgpu 的 fence 对象（每帧数百次分配）、BO 元数据对象。额外需要的 DMA 分配器：dma_alloc_coherent — 分配 CPU 和设备都可访问的 coherent 内存，同时返回 CPU 虚拟地址和 DMA 地址。GPU 驱动场景：Ring Buffer（GPU 命令队列）、Doorbell 页面——这些内存需要 CPU 写入、GPU 读取。GFP 标志选择：进程上下文用 GFP_KERNEL，中断上下文用 GFP_ATOMIC。',
            amdContext: '在 AMD 面试中，展示你知道 amdgpu 的 fence 用 slab、Ring Buffer 用 dma_alloc_coherent、以及为什么这么选——这证明你不仅懂 API，还理解 GPU 驱动的实际内存需求。',
          },
        },
      ],
    },
  ],
  completionChecklist: [
    '能独立编写、编译和加载内核模块（module_init/exit, MODULE_LICENSE, printk, module_param）',
    '理解 PCI 驱动框架：struct pci_driver、probe/remove 回调、pci_enable_device/set_master/ioremap_bar',
    '能在 amdgpu_pci_probe 源码中识别并解释每一步的硬件配置含义',
    '掌握 goto 链式清理模式，能将嵌套 if-else 重构为 goto 清理，能在代码审查中发现遗漏的资源释放',
    '理解 IS_ERR/PTR_ERR/ERR_PTR 宏的工作原理和使用场景',
    '能正确选择同步原语：spinlock（中断上下文）、mutex（进程上下文/长临界区）、atomic（计数器）、RCU（多读少写）',
    '理解 GFP 标志：GFP_KERNEL vs GFP_ATOMIC，并能在代码审查中发现错误使用',
    '知道 kmalloc/vmalloc/slab/dma_alloc_coherent 的区别和适用场景',
    '能通过 /proc/slabinfo 观察 amdgpu 的 slab 缓存状态',
    '能阅读 amdgpu_device_init 的 goto 清理链并理解每个错误标签的含义',
  ],
};
