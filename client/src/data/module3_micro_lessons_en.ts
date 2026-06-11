// ============================================================
// AMD Linux Driver Learning Platform - Module 3 Micro-Lessons (English)
// Module 3: Linux Kernel & Driver Development
// 5 lessons in 2 groups, ~15 min each, total ~75 min
// ============================================================
import type { MicroLessonModule } from './micro_lesson_types';

export const module3MicroLessonsEn: MicroLessonModule = {
  moduleId: 'kernel',
  groups: [
    // ════════════════════════════════════════════════════════════
    // Group 3.1: Kernel Module Development
    // ════════════════════════════════════════════════════════════
    {
      id: '3-1',
      number: '3.1',
      title: 'Kernel Module Development',
      titleEn: 'Kernel Module Development',
      icon: 'Puzzle',
      description: 'Write kernel modules from scratch and understand module lifecycle, the PCI driver framework, and kernel-specific error-handling patterns — the foundational skills you need to read and contribute to the amdgpu codebase.',
      lessons: [
        // ── Lesson 3.1.1 ──────────────────────────────────────
        {
          id: '3-1-1',
          number: '3.1.1',
          title: 'Kernel Module Lifecycle: From insmod to rmmod',
          titleEn: 'Kernel Module Lifecycle: From insmod to rmmod',
          duration: 15,
          difficulty: 'intermediate',
          tags: ['kernel-module', 'insmod', 'rmmod', 'module_init', 'printk'],
          concept: {
            summary: 'A kernel module is a dynamically loadable/unloadable unit of code in Linux. Every module requires module_init/module_exit entry points, a MODULE_LICENSE declaration, and adherence to the __init/__exit memory-optimization conventions. amdgpu itself is a large kernel module — understanding the module mechanism is the first step to making sense of amdgpu_drv.c.',
            explanation: [
              'Loadable Kernel Modules (LKMs) are one of Linux\'s most elegant design choices — they let you add or remove functionality from a running kernel without rebooting or recompiling. Your amdgpu driver is a kernel module: at boot, udev detects AMD GPU hardware and automatically calls modprobe amdgpu to load the driver.',
              'Every kernel module must define two functions: the init function specified by module_init() is called when the module loads (triggered by insmod/modprobe), and the cleanup function specified by module_exit() is called when the module unloads (triggered by rmmod). The init function returns 0 on success and a negative errno value on failure (in which case the module is not loaded). This convention runs throughout the entire Linux kernel — every init function follows the "return 0 on success" rule.',
              '__init and __exit are kernel memory-optimization macros. Functions and data marked __init are freed after module initialization completes — since initialization code only runs once, it is no longer needed afterward. Functions marked __exit are completely omitted when the module is compiled into the kernel (rather than built as a loadable module), because a built-in driver is never unloaded. This fine-grained memory management matters especially in embedded systems.',
              'MODULE_LICENSE("GPL") is not merely a legal declaration — it has real technical consequences. Modules tagged GPL can use any symbol exported via EXPORT_SYMBOL_GPL (including most of the DRM framework API), whereas non-GPL modules can only use symbols exported via EXPORT_SYMBOL. amdgpu must declare GPL to access the DRM framework. If you omit MODULE_LICENSE, the kernel prints "module license taints kernel" in dmesg, sets the taint flag, and makes certain functionality unavailable.',
              'printk is the kernel\'s equivalent of printf, but it writes to the kernel\'s ring log buffer (readable via dmesg). printk has 8 log levels: KERN_EMERG (0) through KERN_DEBUG (7). In the amdgpu driver you will commonly see DRM_INFO, DRM_WARN, and DRM_ERROR — these are printk wrappers that automatically prepend a [drm] prefix and module information. The module_param macro lets users pass parameters at load time, e.g. modprobe amdgpu gpu_recovery=1.',
            ],
            keyPoints: [
              'module_init(fn) / module_exit(fn) define the module\'s entry and exit functions',
              '__init-marked code is freed after initialization to save memory; __exit is ignored in built-in modules',
              'MODULE_LICENSE("GPL") is required — without it you cannot use EXPORT_SYMBOL_GPL symbols',
              'printk(KERN_INFO "msg") writes to the kernel ring buffer; read it with dmesg',
              'module_param(name, type, perm) lets users pass parameters via insmod/modprobe',
              'amdgpu\'s module_init calls pci_register_driver to register the PCI driver',
            ],
          },
          diagram: {
            title: 'Kernel Module Lifecycle and Memory Management',
            content: `Complete lifecycle of a kernel module from load to unload

User Space                                      Kernel Space
──────────                                      ────────────

  insmod hello.ko
  (or modprobe hello)
       │
       ▼
  sys_init_module()
       │
       ├─ Validate ELF format
       ├─ Check MODULE_LICENSE
       ├─ Parse module_param
       ├─ Symbol relocation
       │  (link against kernel symbol table)
       │
       ▼
  Call module_init function
  ┌─────────────────────────────┐
  │ static int __init hello_init(void)           │
  │ {                                            │
  │     printk(KERN_INFO "Hello!\\n");           │
  │     return 0;  // success                    │
  │ }                                            │
  └─────────────────────────────┘
       │
       ▼
  __init section freed  ← saves kernel memory
  Module enters normal running state
       │
       │  (module running ... handles irqs/ioctls/sysfs)
       │
  rmmod hello
       │
       ▼
  Call module_exit function
  ┌─────────────────────────────┐
  │ static void __exit hello_exit(void)          │
  │ {                                            │
  │     printk(KERN_INFO "Bye!\\n");             │
  │ }                                            │
  └─────────────────────────────┘
       │
       ▼
  All module memory freed, symbols removed

amdgpu example:
  module_init(amdgpu_init)
    └─ pci_register_driver(&amdgpu_kms_pci_driver)
       └─ Kernel calls amdgpu_pci_probe() for each matching GPU
  module_exit(amdgpu_exit)
    └─ pci_unregister_driver(&amdgpu_kms_pci_driver)
       └─ Kernel calls amdgpu_pci_remove() for each GPU`,
            caption: 'The complete lifecycle from insmod load to rmmod unload. Note that the __init section is freed as soon as initialization finishes — this is the kernel\'s precise memory management at work. amdgpu\'s module_init registers the PCI driver, which triggers the subsequent probe call chain.',
          },
          codeWalk: {
            title: "amdgpu's module_init — The Driver's True Entry Point",
            file: 'drivers/gpu/drm/amd/amdgpu/amdgpu_drv.c',
            language: 'c',
            code: `/* amdgpu_drv.c — amdgpu driver module entry point (simplified) */

#include <linux/module.h>
#include <linux/pci.h>
#include <drm/drm_drv.h>

/* Module parameter: users can override with modprobe amdgpu gpu_recovery=0 */
int amdgpu_gpu_recovery = -1;
module_param_named(gpu_recovery, amdgpu_gpu_recovery, int, 0444);
MODULE_PARM_DESC(gpu_recovery,
    "Enable GPU recovery mechanism (-1=auto, 0=off, 1=on)");

/* PCI driver structure */
static struct pci_driver amdgpu_kms_pci_driver = {
    .name      = "amdgpu",
    .id_table  = pciidlist,        /* table of supported device IDs */
    .probe     = amdgpu_pci_probe, /* callback when device is found */
    .remove    = amdgpu_pci_remove,/* callback when device is removed */
    .shutdown  = amdgpu_pci_shutdown,
    .driver.pm = &amdgpu_pm_ops,   /* power management (suspend/resume) */
};

/* Module init function — called by insmod/modprobe */
static int __init amdgpu_init(void)
{
    int r;

    /* Initialize the DRM debug subsystem */
    r = amdgpu_sync_init();
    if (r)
        return r;

    r = amdgpu_fence_slab_init();
    if (r)
        goto error_sync;

    /* Key call: register the PCI driver — this triggers probe */
    r = pci_register_driver(&amdgpu_kms_pci_driver);
    if (r)
        goto error_fence;

    return 0;   /* success */

error_fence:
    amdgpu_fence_slab_fini();
error_sync:
    amdgpu_sync_fini();
    return r;   /* return negative errno */
}

/* Module exit function — called by rmmod */
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
              'module_param_named allows passing gpu_recovery=1 via modprobe amdgpu; 0444 means read-only in sysfs',
              'struct pci_driver is the core PCI driver structure, containing probe/remove callbacks and the device ID table',
              'amdgpu_init uses the goto chain cleanup pattern — on init failure, previously allocated resources are released in reverse order',
              'pci_register_driver is the critical call: once registered, the kernel automatically invokes probe for each matching device',
              'amdgpu_exit cleans up in strict reverse order compared to init — this is the standard kernel pattern',
              'MODULE_LICENSE("GPL and additional rights") allows amdgpu to use all GPL-exported kernel symbols',
            ],
            explanation: 'This code is the true starting point of the amdgpu driver. When you run modprobe amdgpu, the kernel calls amdgpu_init(), which registers the PCI driver. The kernel\'s PCI subsystem then scans the bus and calls amdgpu_pci_probe() for each AMD GPU that matches pciidlist. Notice the goto cleanup pattern — it appears everywhere in kernel code. Lesson 3.1.3 dives deep into it.',
          },
          miniLab: {
            title: 'Write and Load Your First Kernel Module',
            objective: 'Write a Hello World kernel module from scratch, compile it, load it, verify the dmesg output, and then unload it. This is the "Hello World" ritual of kernel development.',
            steps: [
              'Create a working directory: mkdir -p ~/kernel-labs/hello && cd ~/kernel-labs/hello',
              'Create hello.c: write a minimal module with module_init/exit, printk, MODULE_LICENSE, and module_param',
              'Create a Makefile: obj-m := hello.o and KDIR := /lib/modules/$(shell uname -r)/build',
              'Build the module: make -C $(KDIR) M=$(pwd) modules',
              'Load the module: sudo insmod hello.ko myname="student" (passing a module parameter)',
              'Check dmesg: dmesg | tail -5 — you should see your Hello message and the parameter value',
              'Inspect module info: modinfo hello.ko — check the license, description, and parm fields',
              'Read the sysfs parameter: cat /sys/module/hello/parameters/myname',
              'Unload the module: sudo rmmod hello, then check dmesg again for the Goodbye message',
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
            title: 'Spot the Missing MODULE_LICENSE',
            language: 'c',
            description: 'The following kernel module compiles cleanly, but loading it produces a kernel taint warning and makes certain functionality unavailable. Find the problem.',
            question: 'What is wrong with this module? What happens when it is loaded?',
            buggyCode: `#include <linux/module.h>
#include <linux/kernel.h>
#include <linux/init.h>

static int __init tainted_init(void)
{
    printk(KERN_INFO "Module loaded\\n");
    /* Attempting to use a GPL-only DRM framework API */
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
/* Missing MODULE_LICENSE! */`,
            hint: 'Missing MODULE_LICENSE is not just a legal issue — the kernel marks the module as "tainted" and restricts the set of symbols it may use.',
            answer: 'Problem: missing MODULE_LICENSE declaration. The consequences operate on three levels: (1) Kernel taint — at load time dmesg prints "module: loading out-of-tree module taints kernel", the kernel taint flag is set (cat /proc/sys/kernel/tainted becomes non-zero), and subsequent bug reports will be ignored by kernel developers. (2) Symbol restrictions — the module cannot use any EXPORT_SYMBOL_GPL-exported symbols. The vast majority of the DRM framework API (drm_dev_alloc, drm_mode_config_init, etc.) is GPL-only, so the module will fail with "Unknown symbol" errors at link time or crash at runtime. (3) Security warnings — some kernel configurations will outright refuse to load a module with no license declaration. Fix: add MODULE_LICENSE("GPL"); For amdgpu-style drivers you must use "GPL" or "GPL and additional rights".',
          },
          interviewQ: {
            question: 'Describe the Linux kernel module lifecycle. What do module_init and module_exit do? What is the significance of the __init and __exit markers?',
            difficulty: 'easy',
            hint: 'Walk through the full flow: load (insmod/modprobe) → initialization → running → unload (rmmod). Focus on the memory-optimization role of __init and why __exit is ignored in built-in modules.',
            answer: 'Kernel module lifecycle: (1) Load phase — the user runs insmod/modprobe; the kernel calls sys_init_module(), loads the module\'s ELF binary into kernel address space, performs symbol relocation (linking against the kernel symbol table), and parses module_param arguments. (2) Init phase — the kernel calls the function specified by module_init(); this function allocates resources, registers drivers/devices, and initializes data structures. Returning 0 means success; returning a non-zero (negative errno) means failure, in which case the module is not loaded. (3) Running phase — the module code runs as part of the kernel, responding to interrupts, system calls, sysfs accesses, etc. At this point the __init section has already been freed. (4) Unload phase — the user runs rmmod; the kernel calls the function specified by module_exit(), which must release all resources in the reverse order of initialization (unregister drivers, free memory, remove sysfs entries), after which the kernel frees all kernel memory the module occupied. __init-marked functions and data live in special .init.text/.init.data sections; after initialization the kernel calls free_initmem() to reclaim them — for large drivers like amdgpu this can recover tens of kilobytes of kernel memory. __exit-marked functions are discarded by the compiler when a module is built in (obj-y rather than obj-m), because a built-in driver is never unloaded.',
            amdContext: 'This is a foundational but important question. AMD interviewers expect you to know not just the API names but also the memory-optimization and security implications behind them. Mentioning that amdgpu\'s module_init calls pci_register_driver shows that you understand how a real driver is implemented.',
          },
        },

        // ── Lesson 3.1.2 ──────────────────────────────────────
        {
          id: '3-1-2',
          number: '3.1.2',
          title: 'PCI Driver Framework: probe and remove',
          titleEn: 'PCI Driver Framework: probe and remove',
          duration: 15,
          difficulty: 'intermediate',
          tags: ['PCI', 'pci_driver', 'probe', 'remove', 'pci_enable_device'],
          concept: {
            summary: 'The PCI driver framework is the standard Linux interface for managing PCI devices. A driver registers itself via struct pci_driver, declares a table of supported device IDs, and the kernel calls the probe callback when a matching device is found. amdgpu_pci_probe is the true starting point of GPU driver initialization — every step in probe (enable, set_master, ioremap_bar) carries critical hardware configuration meaning.',
            explanation: [
              'struct pci_driver is the core PCI driver data structure. It contains: name (the driver name, shown under /sys/bus/pci/drivers/), id_table (the list of supported devices, an array of struct pci_device_id), probe (the callback invoked when a device is discovered), remove (the callback invoked when a device is removed), and optional suspend/resume power-management callbacks. The kernel\'s PCI subsystem matches Vendor:Device ID pairs from id_table to decide which driver handles which device.',
              'The probe function is the heart of driver initialization. When the PCI subsystem finds a matching device it calls probe(struct pci_dev *pdev, const struct pci_device_id *ent). probe receives two arguments: pdev is the kernel-created PCI device structure (containing all PCI information about the device), and ent is the matched ID table entry (whose driver_data field amdgpu uses to store the chip type).',
              'The probe function must execute initialization steps in strict order: (1) pci_enable_device(pdev) — enable the PCI device, configure I/O and memory access, enable the device\'s Bus Master bit; (2) pci_set_master(pdev) — allow the device to initiate DMA transfers (the GPU needs to read and write system memory); (3) pci_ioremap_bar(pdev, n) — map the device\'s BAR (Base Address Register) into kernel virtual address space so the driver can access GPU registers and VRAM via writel/readl; (4) device-specific initialization (amdgpu calls amdgpu_device_init here to initialize all IP blocks).',
              'The remove function is the inverse of probe — it must release all resources in the exact reverse order of probe. This "last in, first out" cleanup pattern is an iron rule in the kernel. If probe acquires resources A → B → C, remove must release C → B → A. Violating this order causes resource leaks, use-after-free, or kernel crashes.',
              'The driver_data field in the pci_device_id table holds driver-private data. amdgpu uses it to store the chip-type enumeration value (e.g. CHIP_NAVI33). The probe function reads this value via ent->driver_data, then selects the correct IP block implementation based on chip type. This design lets a single driver support dozens of different GPU models.',
            ],
            keyPoints: [
              'struct pci_driver contains four core fields: name, id_table, probe, and remove',
              'pci_enable_device() enables the PCI device; pci_set_master() allows DMA transfers',
              'pci_ioremap_bar() maps the GPU\'s BAR space into kernel virtual address space for MMIO access',
              'probe and remove must be strict mirror images — resource acquisition/release order is strictly reversed',
              'pci_device_id.driver_data stores driver-private data (amdgpu uses it for the chip type)',
              'A failing probe must clean up already-initialized resources and return a negative errno (goto cleanup pattern)',
            ],
          },
          diagram: {
            title: 'PCI Driver probe/remove Call Flow',
            content: `PCI device discovery → probe initialization → remove cleanup

Module load (insmod amdgpu.ko)
   │
   ▼
module_init: amdgpu_init()
   │
   └─ pci_register_driver(&amdgpu_kms_pci_driver)
       │
       ▼
PCI subsystem scans for matching devices
       │
       │  ┌─ pciidlist ─────────────────────────┐
       │  │ {0x1002, 0x7480, ..., CHIP_NAVI33}  │  ← match!
       │  └─────────────────────────────────────┘
       │
       ▼
amdgpu_pci_probe(pdev, ent)          │  amdgpu_pci_remove(pdev)
 ┌──────────────────────────┐        │   ┌──────────────────────────┐
 │ ① pci_enable_device()    │        │   │ ⑤ amdgpu_device_fini()   │
 │   Enable PCI I/O & mem   │        │   │   Release all IP blocks  │
 │                          │        │   │                          │
 │ ② pci_set_master()       │        │   │ ④ iounmap(rmmio)         │
 │   Allow GPU DMA          │        │   │   Unmap register BAR     │
 │                          │        │   │                          │
 │ ③ pci_ioremap_bar(0)     │        │   │ ③ pci_clear_master()     │
 │   Map VRAM BAR           │        │   │   Disable DMA            │
 │   pci_ioremap_bar(5)     │        │   │                          │
 │   Map register BAR       │        │   │ ② pci_release_regions()  │
 │                          │        │   │   Release PCI resources  │
 │ ④ amdgpu_device_init()   │        │   │                          │
 │   Initialize all IP      │        │   │ ① pci_disable_device()   │
 │   blocks (GFX, SDMA,     │        │   │   Disable PCI device     │
 │   DC, ...)               │        │   │                          │
 │                          │        │   │ (void function, no ret)  │
 │ return 0;  ← success     │        │   └──────────────────────────┘
 └──────────────────────────┘        │
                                     │
  ← init order ① ② ③ ④              │   cleanup order ⑤ ④ ③ ② ① →
                                     │   strict reverse!`,
            caption: 'probe and remove are strict mirror images — probe initializes in order 1 2 3 4, remove cleans up in order 4 3 2 1. This is an iron rule in kernel driver development.',
          },
          codeWalk: {
            title: 'amdgpu_pci_probe — The Starting Point of GPU Initialization (Simplified)',
            file: 'drivers/gpu/drm/amd/amdgpu/amdgpu_drv.c',
            language: 'c',
            code: `/* amdgpu_pci_probe — called when the kernel discovers a matching AMD GPU */
static int amdgpu_pci_probe(struct pci_dev *pdev,
                             const struct pci_device_id *ent)
{
    struct drm_device *ddev;
    struct amdgpu_device *adev;
    unsigned long flags = ent->driver_data;
    /* ent->driver_data = CHIP_NAVI33 (for your GPU) */
    int ret;

    /* Step 1: Enable the PCI device */
    ret = pci_enable_device(pdev);
    if (ret)
        return ret;

    /* Step 2: Allow the GPU to perform DMA transfers */
    pci_set_master(pdev);

    /* Step 3: Allocate the DRM device structure */
    ddev = drm_dev_alloc(&amdgpu_kms_driver, &pdev->dev);
    if (IS_ERR(ddev)) {
        ret = PTR_ERR(ddev);
        goto err_pci;
    }
    adev = drm_to_adev(ddev);

    /* Step 4: Map the GPU register BAR into kernel virtual address space */
    adev->rmmio_base = pci_resource_start(pdev, 5);
    adev->rmmio_size = pci_resource_len(pdev, 5);
    adev->rmmio = ioremap(adev->rmmio_base, adev->rmmio_size);
    if (!adev->rmmio) {
        ret = -ENOMEM;
        goto err_drm;
    }
    /* GPU registers are now accessible via WREG32/RREG32 */

    /* Step 5: Initialize all GPU IP blocks */
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
              'ent->driver_data carries the chip type (e.g. CHIP_NAVI33), passed to amdgpu_device_init to determine which IP blocks to load',
              'pci_enable_device configures the PCI command register, enabling I/O and memory space access',
              'pci_set_master sets the Bus Master Enable bit in the PCI command register — the GPU needs DMA to read/write system memory',
              'ioremap maps a physical address into kernel virtual address space — WREG32/RREG32 then use this mapping to access GPU registers',
              'IS_ERR/PTR_ERR macros handle functions that return ERR_PTR(-errno) (error codes encoded as pointers)',
              'goto err_xxx is the kernel\'s standard error cleanup pattern — each error label returns state to what it was before the corresponding step',
            ],
            explanation: 'amdgpu_pci_probe is the starting point of your GPU driver initialization. It executes 5 critical steps in strict order: enable PCI device → allow DMA → allocate DRM device → map GPU registers → initialize IP blocks. Any step that fails jumps via goto to the corresponding error label, cleaning up already-acquired resources in reverse order. This goto chain cleanup pattern is the core pattern you will encounter repeatedly throughout the amdgpu codebase.',
          },
          miniLab: {
            title: 'Write a Minimal PCI Driver That Matches AMD GPU Vendor ID',
            objective: 'Write a minimal PCI driver that registers AMD\'s Vendor ID (0x1002), prints device information in probe, and understand the core PCI driver framework flow.',
            steps: [
              'Create mini_pci.c: define a pci_device_id table matching Vendor=0x1002, Device=PCI_ANY_ID',
              'Implement the probe function: print pci_name(pdev), pdev->vendor, pdev->device',
              'Implement the remove function: print a message when the device is removed',
              'Define struct pci_driver and call pci_register_driver in module_init',
              'Create the Makefile and build',
              'Note: do not load this module on a system running the real amdgpu driver — the two drivers will conflict. Use a KVM VM, or just verify the build succeeds without warnings',
              'Inspect the build output to confirm no warnings; use modinfo to view module metadata',
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
alias:          pci:v00001002d*sv*sd*bc*sc*i*  ← matches AMD Vendor ID`,
          },
          debugExercise: {
            title: 'Spot the Wrong Cleanup Order in a probe Function',
            language: 'c',
            description: 'The error-handling paths in the following PCI probe function have a resource-cleanup ordering bug that could cause a kernel crash.',
            question: 'What is wrong with the error cleanup paths? What could go wrong at runtime?',
            buggyCode: `static int my_probe(struct pci_dev *pdev,
                    const struct pci_device_id *ent)
{
    void __iomem *regs;
    int ret;

    ret = pci_enable_device(pdev);
    if (ret)
        return ret;

    pci_set_master(pdev);

    regs = pci_ioremap_bar(pdev, 5);
    if (!regs) {
        ret = -ENOMEM;
        goto err_disable;  /* BUG: skips pci_clear_master! */
    }

    ret = init_hardware(regs);
    if (ret)
        goto err_disable;  /* BUG: no iounmap(regs)! */

    return 0;

err_disable:
    pci_disable_device(pdev);
    return ret;
}`,
            hint: 'Compare the initialization order in probe (enable → set_master → ioremap → init_hw) with the cleanup order in the error paths — is it strictly reversed?',
            answer: 'Two serious bugs: (1) When init_hardware fails, the code jumps directly to err_disable, skipping iounmap(regs) — this causes a kernel virtual address space leak. On a system that repeatedly loads and unloads the module over time, the vmalloc space will eventually be exhausted. (2) When ioremap fails, goto err_disable also skips pci_clear_master — while pci_disable_device may indirectly clear the Bus Master bit, explicit cleanup is the right practice. The correct fix is to add separate error labels and clean up in reverse order: err_ioremap: iounmap(regs); err_master: pci_clear_master(pdev); err_disable: pci_disable_device(pdev); and have init_hardware failure jump to err_ioremap and ioremap failure jump to err_master. This is exactly why kernel developers use the goto chain cleanup pattern — it ensures that every error path performs complete and correct resource reclamation.',
          },
          interviewQ: {
            question: 'Describe the probe and remove callbacks in a Linux PCI driver. What are the key operations in the amdgpu driver\'s probe function?',
            difficulty: 'medium',
            hint: 'Walk through probe steps in order: pci_enable_device → pci_set_master → ioremap BAR → amdgpu_device_init. Emphasize the hardware configuration meaning of each step and the mirror relationship between probe and remove.',
            answer: 'A PCI driver registers via struct pci_driver; probe is called when a device is discovered, remove is called when it is removed. Key steps in amdgpu\'s probe (amdgpu_pci_probe): (1) pci_enable_device — writes the PCI command register to enable the device\'s I/O and memory space access and allocates an IRQ. (2) pci_set_master — sets the Bus Master Enable bit in the PCI command register, allowing the GPU to initiate DMA transfers (the GPU reads command buffers and texture data from system memory via DMA). (3) ioremap BAR — maps the GPU\'s BAR register space (physical address) into kernel virtual address space, enabling the driver to access thousands of GPU control registers via writel/readl. (4) amdgpu_device_init — based on the chip type (from pci_device_id.driver_data), loads the corresponding IP block implementations (GFX, SDMA, DC, VCN, SMU), loads firmware, initializes the memory manager (TTM), the command scheduler (GPU scheduler), interrupt handling, and the display module (KMS). The remove function (amdgpu_pci_remove) executes in strict reverse order: shut down display → stop scheduler → release IP blocks → iounmap → pci_clear_master → pci_disable_device. The mirror relationship between probe and remove guarantees no resource leaks.',
            amdContext: 'This is a core question in AMD interviews. Beyond knowing the API names, what matters is understanding the hardware implications of each step: pci_set_master makes the GPU the PCI bus master, and ioremap establishes the CPU-to-GPU-register communication channel.',
          },
        },

        // ── Lesson 3.1.3 ──────────────────────────────────────
        {
          id: '3-1-3',
          number: '3.1.3',
          title: 'Kernel Error Handling: The goto Cleanup Chain Pattern',
          titleEn: 'Kernel Error Handling: The goto Cleanup Chain Pattern',
          duration: 15,
          difficulty: 'intermediate',
          tags: ['goto', 'error-handling', 'errno', 'IS_ERR', 'cleanup'],
          concept: {
            summary: 'In userspace code goto is taboo, but in the Linux kernel it is the most common error-handling pattern. When a function needs to acquire multiple resources in sequence, the goto chain cleanup pattern ensures that any step failure correctly releases all previously acquired resources. amdgpu_device_init has over 20 goto labels — understanding this pattern is the key to reading kernel code.',
            explanation: [
              'Why does the kernel favor goto? Consider a function that must acquire 5 resources: if step 3 fails, you need to release resources 2 and 1 (in reverse order); if step 5 fails, you need to release 4, 3, 2, 1. Implementing this logic with nested if-else leads to deeply nested, highly repetitive code, whereas goto lets you express the same logic in a linear, flat structure. Linus Torvalds himself explicitly endorses this pattern in the kernel coding style document.',
              'The standard pattern is simple: at the end of the function, define a series of error labels (from the last acquired resource back to the first), with each label releasing its resource and falling through to the next label. In the initialization code, when a step fails, jump via goto to that step\'s error label — all cleanup code after the label runs automatically in reverse order. This ensures that each resource is only released if it was successfully acquired.',
              'The kernel uses negative errno values as error codes (e.g. -ENOMEM, -EINVAL, -EIO). Success returns 0; failure returns a negative value. This convention runs throughout the entire kernel. IS_ERR(ptr) checks whether a pointer encodes an error code (the pointer value falls in the range [-1, -MAX_ERRNO]), PTR_ERR(ptr) extracts the errno value from an error-encoded pointer, and ERR_PTR(errno) encodes an errno value into a pointer. This "error pointer" mechanism lets a function simultaneously convey "success (return a valid pointer)" and "failure (return a fake pointer encoding an error code)" through a single return value.',
              'amdgpu_device_init is a canonical example of this pattern. It needs to initialize over a dozen subsystems: doorbell, VRAM, IP discovery, firmware loading, each IP block, and more. Each subsystem\'s initialization can fail, and later subsystems depend on earlier ones. The function ends with a long chain of goto labels that ensures any failure correctly rolls back all previously completed steps. This is not poor coding style — it is the most battle-tested, reliable kernel resource-management pattern developed over decades.',
              'The common anti-pattern is forgetting to release resources in error paths — this causes kernel memory leaks. Linux has dedicated tools (kmemleak, smatch, sparse) to statically detect such bugs. When submitting amdgpu patches, reviewers pay close attention to whether all error paths release their resources completely.',
              'Modern kernel development (5.x+) also uses dev_err_probe() for probe-time errors. This function combines dev_err() with returning the error code, and specially handles -EPROBE_DEFER (deferred probing — when a dependency isn\'t ready yet). In amdgpu, you\'ll see patterns like: return dev_err_probe(dev, ret, "failed to init GMC"); which prints the error AND returns the error code in one line. It\'s cleaner than the traditional if (ret) { dev_err(...); return ret; } pattern. Understanding dev_err_probe is essential because reviewers on amd-gfx will request you use it for new probe-path error handling.',
            ],
            keyPoints: [
              'goto is the recommended error-handling pattern in the kernel — Linus endorses it explicitly in CodingStyle',
              'Standard pattern: error labels arranged in reverse resource-acquisition order, each releasing one resource and falling through',
              'Negative errno values are the standard kernel error codes: -ENOMEM(12), -EINVAL(22), -EIO(5), etc.',
              'IS_ERR/PTR_ERR/ERR_PTR macros handle error codes encoded in pointers — common in functions that return pointers',
              'amdgpu_device_init has 20+ goto labels and is a large-scale instance of the goto chain cleanup pattern',
              'Forgetting to release resources in error paths = kernel memory leak → detectable with kmemleak/smatch',
              'dev_err_probe() is the modern (5.x+) pattern for probe-time errors — combines error logging and -EPROBE_DEFER handling',
            ],
          },
          diagram: {
            title: 'goto Chain Cleanup vs Nested if-else: A Comparison',
            content: `Comparing two error-handling styles: nested if-else vs goto chain cleanup

Style A: Nested if-else (userspace style, not recommended in the kernel)
┌──────────────────────────────────────────────┐
│ int init() {                                  │
│     a = alloc_a();                            │
│     if (a) {                                  │
│         b = alloc_b();                        │
│         if (b) {                              │
│             c = alloc_c();                    │
│             if (c) {                          │
│                 return 0;   /* success */     │
│             }                                 │
│             free_b(b);      // indentation    │
│         }                   // hell            │
│         free_a(a);                            │
│     }                                         │
│     return -ENOMEM;                           │
│ }                                             │
│  Problem: deep nesting, repetition, fragile   │
└──────────────────────────────────────────────┘

Style B: goto chain cleanup (kernel recommended pattern)
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
│     return 0;          /* success — flat */   │
│                                               │
│ err_c:                 // reverse-order labels│
│     free_b(b);                                │
│ err_b:                                        │
│     free_a(a);                                │
│ err_a:                                        │
│     return ret;                               │
│ }                                             │
│  Advantages: flat, clear, correct, maintainable│
└──────────────────────────────────────────────┘

In practice inside amdgpu_device_init:
init_doorbell → init_amdgpu_vram_mgr → ip_discovery →
fw_load → ip_init → ring_test → ...
       │                    │
       fail?                fail?
       goto err_doorbell    goto err_fw
                ↓                  ↓
         ... → free_fw → free_ip_disc → free_vram → free_doorbell`,
            caption: 'The goto chain cleanup pattern is the standard error-handling approach in the kernel. In large initialization functions like amdgpu_device_init, the goto label chain can have 20+ nodes, ensuring every failure path correctly reclaims all resources.',
          },
          codeWalk: {
            title: 'goto Cleanup Chain in amdgpu_device_init (Simplified)',
            file: 'drivers/gpu/drm/amd/amdgpu/amdgpu_device.c',
            language: 'c',
            code: `/* amdgpu_device_init — full GPU initialization (simplified to show goto pattern) */
int amdgpu_device_init(struct amdgpu_device *adev,
                        uint32_t flags)
{
    int r;

    /* Step 1: Initialize doorbell mapping */
    r = amdgpu_device_doorbell_init(adev);
    if (r) {
        dev_err(adev->dev, "doorbell init failed: %d\\n", r);
        return r;  /* no resources to clean up */
    }

    /* Step 2: IP Discovery — detect GPU hardware blocks */
    r = amdgpu_discovery_set_ip_blocks(adev);
    if (r) {
        dev_err(adev->dev, "ip discovery failed: %d\\n", r);
        goto failed_doorbell;
    }

    /* Step 3: Load GPU firmware */
    r = amdgpu_device_fw_loading(adev);
    if (r) {
        dev_err(adev->dev, "fw loading failed: %d\\n", r);
        goto failed_ip;
    }

    /* Step 4: Initialize all IP block hardware */
    r = amdgpu_device_ip_init(adev);
    if (r) {
        dev_err(adev->dev, "ip_init failed: %d\\n", r);
        goto failed_fw;
    }

    /* Step 5: Register GPU memory management and display */
    r = amdgpu_ttm_init(adev);
    if (r) {
        dev_err(adev->dev, "ttm init failed: %d\\n", r);
        goto failed_ip_init;
    }

    return 0;  /* all initialization successful */

/* === goto cleanup chain: strict reverse order === */
failed_ip_init:
    amdgpu_device_ip_fini(adev);      /* tear down IP blocks */
failed_fw:
    amdgpu_ucode_release(&adev->firmware);  /* release firmware */
failed_ip:
    /* IP discovery cleanup */
failed_doorbell:
    amdgpu_device_doorbell_fini(adev); /* release doorbell mapping */
    return r;
}

/* IS_ERR / PTR_ERR usage example */
struct amdgpu_bo *amdgpu_bo_create_example(void)
{
    struct amdgpu_bo *bo;
    bo = amdgpu_bo_create(adev, size, PAGE_SIZE, ...);
    if (IS_ERR(bo)) {
        /* bo is not a valid pointer — it encodes an error code */
        int err = PTR_ERR(bo);  /* extract -ENOMEM, etc. */
        pr_err("BO alloc failed: %d\\n", err);
        return ERR_PTR(err);    /* propagate the error */
    }
    /* bo is a valid pointer, safe to use */
    return bo;
}`,
            annotations: [
              'On each step failure, goto jumps to the corresponding label — label names conventionally start with failed_ or err_',
              'dev_err replaces printk and automatically prepends the device name, making it easy to distinguish sources in a multi-GPU system',
              'Each label in the cleanup chain falls through to the next — after releasing ip_init, cleanup continues automatically with fw, ip, and doorbell',
              'IS_ERR checks whether the pointer value is in the range (-1, -MAX_ERRNO) — addresses in that range can never be valid kernel pointers',
              'PTR_ERR converts an "error pointer" back to an int error code; ERR_PTR converts an int error code into an "error pointer"',
              'The real amdgpu_device_init has many more steps and labels — this shows only the core pattern',
            ],
            explanation: 'The goto chain cleanup keeps this complex initialization function flat and readable. Imagine implementing the same thing with nested if-else — just 5 steps would require 5 levels of indentation. The real amdgpu_device_init has a dozen steps; the nesting approach is simply unworkable. The IS_ERR/PTR_ERR macros solve a complementary problem: how to convey error information in a function that returns a pointer. Together, these two mechanisms are the cornerstones of kernel error handling.',
          },
          miniLab: {
            title: 'Refactor Nested if-else into a goto Cleanup Pattern',
            objective: 'Given a resource-initialization snippet using nested if-else, refactor it into the kernel-style goto chain cleanup pattern.',
            steps: [
              'Read the following nested if-else code (allocates 3 resources: buffer, lock, workqueue)',
              'Identify each resource\'s allocation/release pair (alloc/free, init/destroy, create/destroy)',
              'List resources in acquisition order: buffer → lock → workqueue',
              'Rewrite using the goto pattern: main path is linear, cleanup labels are defined at the end in reverse order',
              'Build and verify that at each failure point (deliberately return -ENOMEM) resources are correctly cleaned up',
              'Use kmemleak (if available) to confirm there are no memory leaks',
            ],
            expectedOutput: `Before refactor (nested if-else, 4 levels of indentation):
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

After refactor (goto chain cleanup, zero unnecessary indentation):
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
            title: 'Find the Missing Resource Release in an Error Path',
            language: 'c',
            description: 'The following function is missing a critical resource release in one of its error paths, causing a kernel memory leak.',
            question: 'Which error path is missing a resource release? What resource is leaked?',
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
        goto err_regs;  /* BUG! should be goto err_irq_data */

    return 0;

err_irq_data:
    kfree(dev->irq_data);
err_regs:
    iounmap(dev->regs);
    return ret;
}`,
            hint: 'Trace each failure path\'s cleanup: when request_irq fails, are both the ioremap mapping and the kzalloc memory freed?',
            answer: 'The bug is in the request_irq failure path: it does goto err_regs instead of goto err_irq_data. At that point, dev->irq_data has already been allocated by kzalloc, but goto err_regs skips the kfree(dev->irq_data) call and goes straight to iounmap. Result: the memory pointed to by dev->irq_data is never freed — this is a kernel memory leak. Fix: change goto err_regs to goto err_irq_data. This kind of bug is extremely common in code reviews — you add a new initialization step and forget to update the goto targets in existing error paths. Detection: smatch (static analyzer) can detect this class of resource leaks; at runtime use kmemleak (echo scan > /sys/kernel/debug/kmemleak). The amdgpu CI system runs these checks automatically.',
          },
          interviewQ: {
            question: 'Why does Linux kernel code use goto so heavily? Doesn\'t that violate structured programming principles? Explain the kernel\'s goto chain cleanup pattern.',
            difficulty: 'medium',
            hint: 'Start from the practical problem: functions that acquire multiple resources sequentially, where any step can fail and previously acquired resources must be released. Compare the readability of nested if-else with the flatness of goto.',
            answer: 'Linux\'s heavy use of goto is a deliberate engineering decision, not a coding style compromise. Reasons: (1) Kernel functions frequently need to acquire multiple resources in sequence (memory, mappings, locks, interrupts, etc.), any step can fail, and on failure all previously acquired resources must be released. Using nested if-else creates ever-deeper indentation ("triangle code"), poor readability, and easy-to-miss cleanup steps. The goto chain cleanup keeps the happy path linear and zero-indented, with all error handling concentrated at the end of the function. (2) goto is only used for "forward jumps to cleanup labels" within the same function — no cross-function jumps, no loops, no jumping over variable initializations. This restricted usage is entirely consistent with the spirit of structured programming. (3) Linus Torvalds explicitly recommends this pattern in Documentation/process/coding-style.rst. (4) Practical outcome: kernel code using goto does not have a higher bug rate than other languages — on the contrary, concentrating cleanup logic in one place makes it easier to spot missing resource releases during review. IS_ERR/PTR_ERR macros complement the goto pattern by letting pointer-returning functions propagate error codes gracefully.',
            amdContext: 'In an AMD interview, if you can clearly explain the justification for goto in the kernel and use amdgpu_device_init as a concrete example, you demonstrate a deep understanding of kernel coding philosophy — which is not just a technical skill, but a sign that you understand and embrace kernel culture.',
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
      title: 'Kernel Internals for Driver Development',
      titleEn: 'Kernel Internals for Driver Development',
      icon: '⚙️',
      description: 'Master the essential kernel mechanisms for driver development: concurrency synchronization primitives and memory management. amdgpu makes heavy use of spinlocks, mutexes, kmalloc, and slabs — understanding these mechanisms is necessary to make sense of the driver\'s resource management code.',
      lessons: [
        // ── Lesson 3.2.1 ──────────────────────────────────────
        {
          id: '3-2-1',
          number: '3.2.1',
          title: 'Kernel Synchronization Primitives: From Spinlock to RCU',
          titleEn: 'Kernel Synchronization Primitives: From Spinlock to RCU',
          duration: 15,
          difficulty: 'intermediate',
          tags: ['spinlock', 'mutex', 'semaphore', 'atomic', 'RCU', 'synchronization'],
          concept: {
            summary: 'Kernel code runs on multi-core CPUs and can be interrupted at any moment — without synchronization there will be data races and crashes. Linux provides multiple layers of synchronization primitives from lightweight spinlocks to advanced RCU, each suited to different scenarios. In the amdgpu driver, mutex protects the VRAM manager and spinlock protects data structures accessed from interrupt context — choosing the wrong primitive causes deadlocks or performance disasters.',
            explanation: [
              'A spinlock is the most basic kernel lock. When one CPU core holds a spinlock, other cores trying to acquire it spin in place (busy-wait), repeatedly checking whether the lock has been released. Key spinlock constraints: (1) You cannot sleep while holding a spinlock — because waiting cores are spinning at 100% CPU; if the holder sleeps, the spinners can never acquire the lock, causing a deadlock. (2) The critical section must be very short (typically < 1 µs). (3) In interrupt context you must use spin_lock_irqsave/spin_unlock_irqrestore (which disable interrupts), otherwise if an interrupt handler also tries to acquire the same lock on a single-core system, you get a self-deadlock.',
              'A mutex is appropriate for critical sections that may take a longer time. Unlike a spinlock, a thread waiting for a mutex is placed in a wait queue and put to sleep — not wasting CPU cycles. The cost is a context switch (about 1–10 µs), which is slower than spinning (about 10–100 ns). Key mutex constraints: (1) May only be used in process context — interrupt context cannot sleep, so it cannot use a mutex. (2) The same thread cannot recursively acquire the same mutex (deadlock). (3) The holder must release in the same thread.',
              'An RW semaphore (read-write semaphore) optimizes the "many readers, few writers" pattern. Multiple readers can hold the lock simultaneously (concurrent reads do not corrupt data), but a writer requires exclusive access (waits for all readers to release before it can acquire the lock). amdgpu\'s VM (virtual memory) subsystem uses rw_semaphore to protect page tables — GPU command submissions concurrently read the page tables, while page table updates (such as BO mapping changes) require the write lock.',
              'Atomic operations are the lightest-weight synchronization mechanism — they use CPU atomic instructions (such as the x86 LOCK prefix) to implement lock-free increment/decrement and compare-and-swap (cmpxchg). Suitable for simple counters and flag bits. amdgpu\'s reference counts (such as the reference count on amdgpu_bo) use atomic_t. atomic_inc, atomic_dec, and atomic_read are its core APIs.',
              'RCU (Read-Copy-Update) is the Linux kernel\'s most elegant synchronization mechanism. Readers are completely lock-free (no synchronization operations required at all); writers first copy the data, modify the copy, then atomically replace the pointer to the old data. The old data is freed only after all readers have exited (the "grace period" mechanism). RCU is suitable for scenarios where reads far outnumber writes, such as the kernel routing table. amdgpu\'s BO (Buffer Object) lookups use RCU to optimize read performance.',
            ],
            keyPoints: [
              'spinlock: busy-wait, cannot sleep, for interrupt context and short critical sections (< 1 µs)',
              'mutex: sleep-wait, process context only, suitable for long critical sections',
              'rw_semaphore: concurrent readers + exclusive writer, suitable for "many reads, few writes" scenarios',
              'atomic_t: atomic operations, lightest-weight, suitable for counters and flag bits',
              'RCU: lock-free readers, copy-and-replace writers, suitable when reads far outnumber writes',
              'Consequences of choosing the wrong primitive: mutex in interrupt context → BUG/deadlock; sleeping while holding spinlock → deadlock',
            ],
          },
          diagram: {
            title: 'Decision Tree for Choosing the Right Kernel Synchronization Primitive',
            content: `Choose the right synchronization primitive — decision tree

Need to protect shared data?
       │
       ▼
Are you in interrupt/softirq context?
       │
    ┌──┴──┐
    │ YES │                              │ NO  │
    ▼                                    ▼
Read-only?                          Does the critical section need to sleep?
│                                          │
├─YES──▶ rcu_read_lock()             ┌────┴────┐
│        (completely lock-free,      │  YES    │         │  NO  │
│         fastest)                   ▼                   ▼
│                                mutex_lock()       spin_lock()
├─NO──▶  spin_lock_irqsave()     (can sleep,        (busy-wait,
│        (disable irqs + spin)    may do I/O,        keep it short)
│        critical section         allocate memory,
│        must be very short!      etc.)
│
Simple counter or flag?
│
└─YES──▶ atomic_inc() / atomic_set()
         (lock-free, CPU atomic instruction)

Actual usage in amdgpu:
┌─────────────────────────────────────────────────────────┐
│ Data Structure        Primitive           Reason         │
│─────────────────────────────────────────────────────────│
│ VRAM manager          mutex              alloc may sleep │
│ Ring buffer write ptr spinlock           interrupt access│
│ IRQ source registry   spin_lock_irqsave  used in IRQ hdlr│
│ BO reference count    atomic_t           simple inc/dec  │
│ GPU VM page tables    rw_semaphore       many-read (CS)  │
│ Fence signaling       spinlock           signal in IRQ   │
└─────────────────────────────────────────────────────────┘`,
            caption: 'The core questions for picking a synchronization primitive: are you in interrupt context? Does the critical section need to sleep? Is it many-reads-few-writes? Answering these three questions leads you to the right choice.',
          },
          codeWalk: {
            title: 'mutex and spinlock in Real amdgpu Usage',
            file: 'drivers/gpu/drm/amd/amdgpu/amdgpu_vram_mgr.c',
            language: 'c',
            code: `/* === 1. Mutex: protecting the VRAM manager === */
/* amdgpu_vram_mgr.c — VRAM allocation may sleep, so use mutex */
struct amdgpu_vram_mgr {
    struct mutex lock;   /* protects VRAM allocation state */
    /* ... VRAM block list, stats ... */
};

int amdgpu_vram_mgr_alloc(struct amdgpu_vram_mgr *mgr, ...)
{
    mutex_lock(&mgr->lock);
    /* Allocate VRAM — may need to wait for other BOs to be evicted.
     * Sleeping is safe here because we are in process context. */
    node = drm_mm_insert_node(&mgr->mm, size, alignment);
    mutex_unlock(&mgr->lock);
    return ret;
}

/* === 2. Spinlock: protecting fence handling in interrupt context === */
/* amdgpu_fence.c — GPU completion notifications are handled in IRQs */
void amdgpu_fence_process(struct amdgpu_ring *ring)
{
    struct amdgpu_fence_driver *drv = &ring->fence_drv;
    unsigned long flags;

    /* spin_lock_irqsave: disable interrupts + acquire lock.
     * Interrupts must be disabled because this function may be
     * called from both process context and interrupt context. */
    spin_lock_irqsave(&drv->lock, flags);

    /* Check the fence sequence number completed by the GPU */
    last_seq = atomic64_read(&ring->fence_drv.last_seq);
    /* Wake up threads waiting for fence completion */
    /* ... signal completed fences ... */

    spin_unlock_irqrestore(&drv->lock, flags);
    /* ↑ restores the previously saved interrupt state */
}

/* === 3. Atomic: reference counting === */
/* amdgpu_bo.c — Buffer Object reference count */
static inline void amdgpu_bo_ref(struct amdgpu_bo *bo)
{
    /* Atomically increment reference count — no lock needed */
    drm_gem_object_get(&bo->tbo.base);
    /* Internally: kref_get → atomic_inc(&obj->refcount) */
}`,
            annotations: [
              'The critical section inside mutex_lock/unlock can safely call functions that may sleep (memory allocation, I/O waits, etc.)',
              'spin_lock_irqsave saves the interrupt state to the flags variable; spin_unlock_irqrestore restores it — supports nesting',
              'In interrupt context you must use the irqsave variant; without it, if you are already inside an interrupt handler, disabling interrupts again will lose the interrupt state',
              'atomic64_read uses the CPU\'s atomic read instruction — safe to call even inside a spinlock-protected region',
              'kref_get/kref_put are the kernel\'s reference-counting framework, implemented internally with atomic_t',
              'drm_mm_insert_node is the DRM memory manager API; it uses a red-black tree to manage address space allocations',
            ],
            explanation: 'In the amdgpu driver, the choice of synchronization primitive follows the decision tree exactly: VRAM allocation may need to wait for memory to be freed (sleep), so it uses mutex; fence handling executes in interrupt context, so it uses spin_lock_irqsave; BO reference counting is a simple increment/decrement, so it uses atomic. Choosing incorrectly is fatal — using mutex in interrupt context triggers "BUG: scheduling while atomic" and crashes the system.',
          },
          miniLab: {
            title: 'Implement a Simple Producer-Consumer Module Using mutex',
            objective: 'Write a kernel module that uses mutex to protect a shared buffer, with two kernel threads acting as producer and consumer. Verify that synchronization is correct.',
            steps: [
              'Create module prodcons.c, define a shared buffer (int buffer[BUFSIZE]) and a mutex',
              'Create a producer kernel thread (kthread_create): acquire mutex → write data → release mutex → msleep(100)',
              'Create a consumer kernel thread: acquire mutex → read data → release mutex → msleep(150)',
              'Use printk to log each read/write operation and the thread ID',
              'In module_init, start both threads; in module_exit, stop them with kthread_stop',
              'Build and load the module; observe dmesg output to confirm mutual exclusion is correct (no interleaved reads and writes)',
              'Try replacing mutex with spinlock + msleep, and observe whether the kernel reports "scheduling while atomic"',
            ],
            expectedOutput: `$ sudo insmod prodcons.ko
$ dmesg | tail -10
[  100.001] prodcons: producer wrote buffer[0] = 1
[  100.101] prodcons: producer wrote buffer[1] = 2
[  100.152] prodcons: consumer read  buffer[0] = 1
[  100.201] prodcons: producer wrote buffer[2] = 3
[  100.302] prodcons: consumer read  buffer[1] = 2
...
# Note: production and consumption alternate but never overlap (mutex protection)

$ sudo rmmod prodcons
$ dmesg | tail -1
[  110.000] prodcons: threads stopped, module unloaded`,
          },
          debugExercise: {
            title: 'Using mutex in Interrupt Context — A Fatal Error',
            language: 'c',
            description: 'The following interrupt handler uses a mutex to protect shared data. What will happen?',
            question: 'Why will this code cause a kernel crash? What is the correct fix?',
            buggyCode: `static DEFINE_MUTEX(irq_data_lock);
static int shared_counter;

/* Interrupt handler — runs in interrupt context */
static irqreturn_t my_irq_handler(int irq, void *dev_id)
{
    mutex_lock(&irq_data_lock);   /* BUG! */
    shared_counter++;
    mutex_unlock(&irq_data_lock);
    return IRQ_HANDLED;
}

/* Read the counter from process context */
static ssize_t read_counter(struct file *f, char __user *buf, ...)
{
    int val;
    mutex_lock(&irq_data_lock);
    val = shared_counter;
    mutex_unlock(&irq_data_lock);
    return simple_read_from_buffer(buf, count, ppos, &val, sizeof(val));
}`,
            hint: 'Interrupt handlers have one iron rule: they cannot sleep. mutex_lock puts the caller to sleep when the lock is held by someone else. So what happens if mutex_lock is called in an interrupt and the lock is already held?',
            answer: 'Fatal bug: calling mutex_lock in interrupt context. Interrupt context cannot sleep (cannot call schedule()), because interrupt handling preempts a running process — if the interrupt handler itself sleeps, the preempted process cannot resume and the system deadlocks. mutex_lock calls schedule() to yield the CPU and sleep when the lock is busy — doing this in interrupt context triggers the kernel BUG: "BUG: scheduling while atomic", followed by a Kernel Panic. Correct fix: replace the mutex with a spinlock_t and use spin_lock_irqsave/spin_unlock_irqrestore in both the interrupt handler and the process context reader (disabling interrupts in both paths prevents deadlock). If the critical section truly only increments a counter, an even better solution is to use atomic_t and atomic_inc, eliminating any need for locking. This is exactly what amdgpu does with fence handling — fence sequence numbers use atomic64_t, avoiding locks in interrupt context entirely.',
          },
          interviewQ: {
            question: 'Explain the difference between spinlock and mutex. When do you use which? Give examples from the amdgpu driver for each.',
            difficulty: 'medium',
            hint: 'Compare from the perspectives of waiting mechanism (spin vs sleep), usable context (interrupt vs process), critical section length, and performance characteristics.',
            answer: 'Spinlock vs Mutex — core differences: (1) Waiting mechanism: spinlock busy-waits (the CPU keeps polling the lock state); mutex sleeps (the waiter is placed in a wait queue and yields the CPU). (2) Usable context: spinlock can be used in both interrupt context and process context (in interrupt context you must use spin_lock_irqsave); mutex may only be used in process context (it calls schedule(), which is forbidden in interrupt context). (3) Critical section length: spinlock requires very short critical sections (< 1 µs) because spinning wastes CPU; mutex can protect long critical sections, including operations that may sleep (I/O, memory allocation). (4) Performance: at low contention spinlock is faster (no context switch overhead); at high contention mutex is better (does not waste CPU). amdgpu examples: spinlock — amdgpu_fence_process uses spin_lock_irqsave to protect fence sequence number updates because the function is called from interrupt context; amdgpu_irq_handler uses spinlock to protect the interrupt source registry. mutex — amdgpu_vram_mgr uses mutex to protect VRAM allocation/deallocation because allocation may need to wait for other BOs to be evicted (sleep); amdgpu_bo_reserve uses ww_mutex (wait/wound mutex) to protect BO state, with built-in deadlock avoidance.',
            amdContext: 'In AMD driver development, the choice of lock directly affects GPU performance. Showing in an interview that you know where amdgpu uses spinlock, where it uses mutex, and why — that is far more valuable than memorizing API names.',
          },
        },

        // ── Lesson 3.2.2 ──────────────────────────────────────
        {
          id: '3-2-2',
          number: '3.2.2',
          title: 'Kernel Memory Management: kmalloc, vmalloc, and Slab',
          titleEn: 'Kernel Memory Management: kmalloc, vmalloc, and Slab',
          duration: 15,
          difficulty: 'intermediate',
          tags: ['kmalloc', 'vmalloc', 'kzalloc', 'slab', 'GFP', 'DMA', 'memory'],
          concept: {
            summary: 'The kernel has no malloc — instead it provides multiple allocators optimized for different scenarios. kmalloc allocates physically contiguous memory (suitable for DMA); vmalloc allocates virtually contiguous but physically potentially non-contiguous memory (suitable for large buffers); the slab allocator (kmem_cache) provides a high-performance cache for fixed-size objects that are frequently created and destroyed. GFP flags tell the allocator "whether it may sleep" — in interrupt context only GFP_ATOMIC may be used.',
            explanation: [
              'kmalloc is the most commonly used kernel memory allocation function, similar to userspace malloc, but with two key differences: (1) the allocated memory is physically contiguous — critical for DMA transfers, because many hardware devices do not support scatter-gather DMA; (2) you must specify GFP flags to tell the allocator about the calling context. kmalloc\'s maximum allocation limit is typically 4 MB (PAGE_SIZE * 2^MAX_ORDER); requests larger than this will fail. kzalloc is kmalloc + memset(0) combined — in the kernel kzalloc is preferred because uninitialized kernel memory may contain sensitive data.',
              'vmalloc allocates memory that is virtually contiguous but whose physical page frames may be scattered. Its advantage is the ability to allocate much larger blocks than kmalloc (tens of MB or more), because physically contiguous pages are not required. The trade-offs: (1) Each access may require an additional TLB (Translation Lookaside Buffer) lookup, making it slightly slower than kmalloc. (2) vmalloc-allocated memory is unsuitable for DMA (physically non-contiguous). (3) vmalloc can always sleep and may not be used in interrupt context. In the amdgpu driver, large lookup tables (such as the VRAM bitmap manager) may use vmalloc.',
              'GFP (Get Free Pages) flags are a core concept in kernel memory allocation. The two most common: GFP_KERNEL — allows sleeping, allows I/O (can wait for swap space to free memory); only usable in process context. GFP_ATOMIC — no sleeping allowed; used in interrupt context and while holding spinlocks; allocation failure is more likely (because no waiting for memory reclaim is possible). GFP_DMA — allocates low-address memory usable for DMA (a legacy constraint from ISA DMA). In amdgpu, GFP_KERNEL is used during probe/init; GFP_ATOMIC is used inside interrupt handlers.',
              'The slab allocator (kmem_cache) is the kernel\'s high-performance cache designed for "fixed-size objects that are frequently created and destroyed". It pre-allocates a batch of same-sized memory blocks (a slab); on object creation it takes one from the cache, and on destruction it returns it to the cache rather than actually freeing it. Benefits: (1) avoids the overhead of frequent kmalloc/kfree; (2) reduces memory fragmentation (all objects are the same size); (3) supports optional constructor/destructor functions. amdgpu\'s fence subsystem uses kmem_cache_create to create a slab cache for fence objects, because every GPU command submission creates a fence, potentially hundreds per frame.',
              'DMA memory allocation (dma_alloc_coherent) is a special requirement for GPU drivers. The GPU reads and writes system memory via DMA, but the DMA address (the address the device sees) differs from the CPU virtual address. dma_alloc_coherent returns both the CPU virtual address and the DMA address (dma_addr_t), and guarantees a coherent memory view between the CPU and the device (cache coherent). The amdgpu Ring Buffer (GPU command queue) is allocated using dma_alloc_coherent.',
            ],
            keyPoints: [
              'kmalloc/kzalloc: physically contiguous, suitable for small memory (< 4 MB) and DMA, requires GFP flags',
              'vmalloc: physically non-contiguous, can allocate large memory, unsuitable for DMA, always may sleep',
              'GFP_KERNEL: allows sleeping (process context); GFP_ATOMIC: cannot sleep (interrupt context)',
              'kmem_cache_create/alloc/free: slab cache, ideal for frequent creation/destruction of fixed-size objects',
              'dma_alloc_coherent: allocates cache-coherent DMA-capable memory, returns both CPU and DMA address pair',
              '/proc/slabinfo shows the state of all slab caches — you can see the fence cache that amdgpu creates',
            ],
          },
          diagram: {
            title: 'Guide to Choosing the Right Kernel Memory Allocator',
            content: `Kernel memory allocator selection — decision flow

Need to allocate kernel memory
       │
       ▼
Physically contiguous or needed for DMA?
       │
    ┌──┴──────────────────────┐
    │ YES                      │ NO
    ▼                          ▼
  Size?                     vmalloc(size)
    │                       ├─ virtually contiguous, physically scattered
    ├─ < 4 MB               ├─ good for large buffers
    │  kmalloc(size, gfp)   ├─ cannot be used for DMA
    │  kzalloc(size, gfp)   └─ always may sleep
    │
    └─ Need a DMA address?
       │
       ├─ YES: dma_alloc_coherent(dev, size, &dma_addr, gfp)
       │       get both CPU virtual address + DMA address
       │
       └─ NO:  kmalloc(size, gfp) is sufficient

Frequently allocating/freeing objects of the same type?
       │
       └─ YES: kmem_cache_create() + kmem_cache_alloc()
              slab cache, avoids fragmentation, higher performance

GFP flag selection:
┌─────────────────────────────────────────────────┐
│  Context              Recommended GFP     Notes  │
│─────────────────────────────────────────────────│
│  Process context      GFP_KERNEL         can sleep │
│  Interrupt/softirq    GFP_ATOMIC         no sleep  │
│  Holding spinlock     GFP_ATOMIC         no sleep  │
│  Init (__init)        GFP_KERNEL         can sleep │
│  Need zero-init       add __GFP_ZERO               │
│  (or just use kzalloc)                            │
└─────────────────────────────────────────────────┘

amdgpu memory allocation examples:
┌───────────────────────────────────────────────────────┐
│ Use Case              Allocator               GFP      │
│───────────────────────────────────────────────────────│
│ fence objects         kmem_cache_alloc        KERNEL  │
│ Ring buffer           dma_alloc_coherent      KERNEL  │
│ Temp command bufs     kzalloc                 KERNEL  │
│ Interrupt data        kzalloc                 ATOMIC  │
│ Large lookup tables   vzalloc (vmalloc+zero)   —      │
└───────────────────────────────────────────────────────┘`,
            caption: 'Core questions for choosing a memory allocator: does it need to be physically contiguous? Is it used for DMA? Is this an interrupt context? Is it the same type of object being allocated frequently? Answering these determines the right API.',
          },
          codeWalk: {
            title: 'amdgpu fence Slab Cache — Efficient Allocation for High-Frequency Objects',
            file: 'drivers/gpu/drm/amd/amdgpu/amdgpu_fence.c',
            language: 'c',
            code: `/* amdgpu_fence.c — slab cache management for fence objects */

/* Global slab cache pointer */
static struct kmem_cache *amdgpu_fence_slab;

/* Initialization: create the slab cache during module_init */
int amdgpu_fence_slab_init(void)
{
    amdgpu_fence_slab = kmem_cache_create(
        "amdgpu_fence",                /* cache name, visible in /proc/slabinfo */
        sizeof(struct amdgpu_fence),    /* size of each object */
        0,                              /* alignment (0 = automatic) */
        SLAB_HWCACHE_ALIGN,            /* flag: align to CPU cache line */
        NULL);                          /* constructor (optional) */
    if (!amdgpu_fence_slab)
        return -ENOMEM;
    return 0;
}

/* Teardown: destroy the cache during module_exit */
void amdgpu_fence_slab_fini(void)
{
    kmem_cache_destroy(amdgpu_fence_slab);
    amdgpu_fence_slab = NULL;
}

/* Allocate a fence object — needed for every GPU command submission */
struct amdgpu_fence *amdgpu_fence_create(void)
{
    struct amdgpu_fence *fence;

    /* Fetch a pre-allocated object from the slab cache.
     * Much faster than kzalloc(sizeof(*fence), ...).
     * GFP_KERNEL: in process context, sleeping is allowed. */
    fence = kmem_cache_zalloc(amdgpu_fence_slab, GFP_KERNEL);
    if (!fence)
        return NULL;

    /* Initialize the fence */
    dma_fence_init(&fence->base, &amdgpu_fence_ops,
                   &ring->fence_drv.lock, ring->fence_context,
                   ++ring->fence_drv.sync_seq);
    return fence;
}

/* Free a fence — called after GPU command completion */
void amdgpu_fence_free(struct rcu_head *rcu)
{
    struct dma_fence *f = container_of(rcu, struct dma_fence, rcu);
    struct amdgpu_fence *fence = to_amdgpu_fence(f);

    /* Return to the slab cache, not a true free.
     * The next kmem_cache_alloc will reuse this memory. */
    kmem_cache_free(amdgpu_fence_slab, fence);
}

/* === DMA memory allocation example — Ring Buffer === */
/* amdgpu_ring.c */
int amdgpu_ring_init(struct amdgpu_ring *ring, unsigned int size)
{
    /* The ring buffer must be readable by the GPU via DMA,
     * so dma_alloc_coherent is required */
    ring->ring = dma_alloc_coherent(adev->dev,
                                     ring->ring_size,
                                     &ring->gpu_addr,  /* DMA address */
                                     GFP_KERNEL);
    if (!ring->ring)
        return -ENOMEM;
    /* ring->ring    = CPU virtual address (driver writes commands here)
     * ring->gpu_addr = DMA address (GPU reads commands from here) */
    return 0;
}`,
            annotations: [
              'The name argument to kmem_cache_create appears in /proc/slabinfo and /sys/kernel/slab/ for easy monitoring',
              'SLAB_HWCACHE_ALIGN ensures each fence object is aligned to the L1 cache line, avoiding false sharing',
              'kmem_cache_zalloc = kmem_cache_alloc + zero initialization; faster than kzalloc because the object size is already known',
              'Fence release goes through an RCU callback (rcu_head) — guarantees all CPU cores that may be reading the fence have finished before it is truly freed',
              'dma_alloc_coherent returns two addresses: CPU virtual address for the driver to write, DMA address for the GPU to read',
              'The ring buffer\'s DMA address (gpu_addr) is written into a GPU register, telling the GPU where to read commands from',
            ],
            explanation: 'A fence is the core object for GPU command synchronization — one is created per command submission and destroyed when the command completes. In a 60 fps game, hundreds of fences may be created per second. Using plain kmalloc/kfree would cause memory fragmentation and performance degradation. The slab cache solves this through pre-allocation and reuse — kmem_cache_alloc typically only needs to grab one object from the free list, a near-O(1) operation. dma_alloc_coherent solves a complementary problem: the GPU and CPU need to access the same block of memory, but their address spaces differ.',
          },
          miniLab: {
            title: 'Find amdgpu\'s Slab Caches in /proc/slabinfo',
            objective: 'Use /proc/slabinfo and /sys/kernel/slab/ to observe the slab caches created by the amdgpu driver, and understand the scale at which slabs are used in a real driver.',
            steps: [
              'Confirm the amdgpu module is loaded: lsmod | grep amdgpu',
              'View all amdgpu-related slab caches: sudo cat /proc/slabinfo | head -2 && sudo cat /proc/slabinfo | grep -i amdgpu',
              'Interpret the output fields: name (cache name), active_objs (active object count), num_objs (total objects), objsize (object size)',
              'View fence cache details: ls /sys/kernel/slab/amdgpu_fence/ 2>/dev/null || echo "check slabinfo instead"',
              'Run a GPU workload (e.g. glxgears) and re-check amdgpu_fence active_objs to see it change',
              'For comparison, look at slab caches from other subsystems (e.g. grep -i "ext4\\|btrfs\\|dentry" /proc/slabinfo) to appreciate how pervasive slabs are across the kernel',
            ],
            expectedOutput: `$ sudo cat /proc/slabinfo | grep -i amdgpu
# name            <active_objs> <num_objs> <objsize> ...
amdgpu_fence           128        256        192      ...
amdgpu_vm_bo            64        128         96      ...

# After running glxgears:
amdgpu_fence           512       1024        192      ...
                       ↑ active fence count increases sharply

# Interpretation:
# - amdgpu_fence: 192 bytes per object, 512 active fences currently
# - During GPU rendering, fence count correlates with command submission frequency`,
          },
          debugExercise: {
            title: 'Using GFP_KERNEL in Interrupt Context — Sleeping Is Forbidden',
            language: 'c',
            description: 'The following interrupt handler uses the wrong GFP flag to allocate memory. Find the problem.',
            question: 'Under what conditions will this code cause a kernel crash? How do you fix it?',
            buggyCode: `/* Interrupt handler */
static irqreturn_t gpu_irq_handler(int irq, void *data)
{
    struct gpu_device *gdev = data;
    struct irq_event *evt;

    /* Allocate an event structure to record interrupt information */
    evt = kzalloc(sizeof(*evt), GFP_KERNEL);  /* BUG! */
    if (!evt)
        return IRQ_HANDLED;

    evt->timestamp = ktime_get();
    evt->source = readl(gdev->regs + IRQ_SOURCE);

    /* Add to the event queue */
    list_add_tail(&evt->node, &gdev->event_list);

    return IRQ_HANDLED;
}`,
            hint: 'GFP_KERNEL allows the allocator to sleep waiting for page reclaim when memory is low. But interrupt handlers have one iron rule...',
            answer: 'Bug: using GFP_KERNEL inside an interrupt handler. GFP_KERNEL allows the allocator to call schedule() and sleep waiting for page reclaim/swapping when memory is tight — but interrupt context forbids sleeping. If memory is scarce and kzalloc tries to sleep, the kernel triggers "BUG: sleeping function called from invalid context", which usually leads to a Kernel Panic. Fix options: (1) Change GFP_KERNEL to GFP_ATOMIC — this tells the allocator "no sleeping, return success or failure immediately". GFP_ATOMIC allocates from a reserved emergency memory pool, so failure is more likely; you must handle allocation failure. (2) Better approach: use a slab cache to pre-allocate irq_event objects (similar to amdgpu_fence_slab); in the interrupt handler, just fetch one from the cache, avoiding the general allocator entirely. (3) What amdgpu actually does: avoid memory allocation in interrupt handlers as much as possible — record only the essential information (such as the fence sequence number) and defer complex processing to a tasklet or workqueue (which runs in process context, where GFP_KERNEL is safe).',
          },
          interviewQ: {
            question: 'Explain the differences between kmalloc, vmalloc, and the slab allocator. In GPU driver development, how do you choose between them for different scenarios?',
            difficulty: 'medium',
            hint: 'Compare the three allocators in terms of physical contiguity, size limits, GFP flags, DMA compatibility, and performance characteristics. Use amdgpu\'s fence slab and ring buffer DMA allocation as concrete examples.',
            answer: 'Core differences between the three allocators: (1) kmalloc — allocates physically contiguous memory; size limit is typically 4 MB. Advantages: best performance (no extra TLB overhead), suitable for DMA transfers (hardware requires contiguous physical addresses). Usage: kmalloc(size, GFP_KERNEL) or kzalloc (with zero-initialization). GPU driver scenarios: small-to-medium data structures, device register mapping info, temporary buffers. (2) vmalloc — allocates virtually contiguous but physically non-contiguous memory. Advantage: can allocate large blocks (> 4 MB), unaffected by physical memory fragmentation. Disadvantages: each access may require an extra TLB lookup (slightly slower); unsuitable for DMA (physically non-contiguous). GPU driver scenarios: large lookup tables (e.g. VRAM bitmap manager), large internal buffers. (3) slab (kmem_cache) — high-performance cache pool for fixed-size objects. Allocation/deallocation is O(1), reduces fragmentation, supports constructor functions. GPU driver scenarios: amdgpu fence objects (hundreds of allocations per frame), BO metadata objects. Additional DMA allocator: dma_alloc_coherent — allocates memory accessible by both CPU and device in a coherent manner, returning both a CPU virtual address and a DMA address. GPU driver scenarios: Ring Buffer (GPU command queue), doorbell pages — memory the CPU writes to and the GPU reads from. GFP flag selection: use GFP_KERNEL in process context, GFP_ATOMIC in interrupt context.',
            amdContext: 'In an AMD interview, showing that you know amdgpu uses slab for fences, dma_alloc_coherent for Ring Buffers, and why those choices were made — that proves you understand not just the APIs, but the actual memory requirements of a GPU driver.',
          },
        },
      ],
    },
  ],
  completionChecklist: [
    'Can independently write, compile, and load a kernel module (module_init/exit, MODULE_LICENSE, printk, module_param)',
    'Understands the PCI driver framework: struct pci_driver, probe/remove callbacks, pci_enable_device/set_master/ioremap_bar',
    'Can identify and explain the hardware configuration meaning of each step in amdgpu_pci_probe source code',
    'Has mastered the goto chain cleanup pattern, can refactor nested if-else into goto cleanup, and can spot missing resource releases in code review',
    'Understands how the IS_ERR/PTR_ERR/ERR_PTR macros work and when to use them',
    'Can correctly choose synchronization primitives: spinlock (interrupt context), mutex (process context / long critical sections), atomic (counters), RCU (many-reads-few-writes)',
    'Understands GFP flags: GFP_KERNEL vs GFP_ATOMIC, and can spot incorrect usage in code review',
    'Knows the differences between kmalloc/vmalloc/slab/dma_alloc_coherent and the appropriate scenario for each',
    'Can observe amdgpu\'s slab cache state through /proc/slabinfo',
    'Can read the goto cleanup chain in amdgpu_device_init and understand the meaning of each error label',
    'Can trace one resource from allocation to cleanup and verify the error path releases it in reverse order',
  ],
};
