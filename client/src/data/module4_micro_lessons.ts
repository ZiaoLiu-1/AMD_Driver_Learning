// ============================================================
// AMD Linux Driver Learning Platform - Module 4 Micro-Lessons
// Module 4: DRM Subsystem (图形驱动与 DRM 子系统)
// 5 lessons in 2 groups, ~15-20 min each, total ~60h curriculum
// ============================================================
import type { MicroLessonModule } from './micro_lesson_types';

export const module4MicroLessons: MicroLessonModule = {
  moduleId: 'drm',
  groups: [
    // ════════════════════════════════════════════════════════════
    // Group 4.1: DRM Core & KMS (DRM 核心与显示管线)
    // ════════════════════════════════════════════════════════════
    {
      id: '4-1',
      number: '4.1',
      title: 'DRM 核心与显示管线',
      titleEn: 'DRM Core & KMS',
      icon: '🖥️',
      description: '深入理解 DRM 框架的核心对象 drm_device / drm_driver，掌握 KMS 显示管线中 CRTC、Encoder、Connector、Plane 的角色，以及 Atomic Mode Setting 的工作原理。',
      lessons: [
        // ── Lesson 4.1.1 ──────────────────────────────────────
        {
          id: '4-1-1',
          number: '4.1.1',
          title: 'DRM 核心架构：drm_device 与 drm_driver',
          titleEn: 'DRM Core Architecture: drm_device & drm_driver',
          duration: 20,
          difficulty: 'advanced',
          tags: ['DRM', 'drm_device', 'drm_driver', 'ioctl', 'dev-dri'],
          concept: {
            summary: 'DRM（Direct Rendering Manager）是 Linux 内核中所有 GPU 驱动的公共框架。每个 GPU 由一个 drm_device 实例代表，而 drm_driver 结构体定义了该 GPU 驱动的所有回调函数。用户空间通过 /dev/dri/card0 打开设备，内核 DRM 核心通过 drm_ioctl() 将请求分发到具体驱动的处理函数。',
            explanation: [
              'DRM 子系统位于 drivers/gpu/drm/，是 Linux 图形栈的内核层基石。它为所有 GPU 驱动提供统一的基础设施：设备文件管理（/dev/dri/card0、/dev/dri/renderD128）、ioctl 分发、GEM 内存管理接口、KMS 显示管理、以及 sysfs/debugfs 暴露。不同的 GPU 驱动（amdgpu、i915、nouveau）都注册到 DRM 框架，利用它提供的公共功能，只需实现硬件特定的部分。',
              'drm_device 是 DRM 框架中最核心的数据结构，代表系统中的一个 GPU 实例。它由 drm_dev_alloc() 分配，包含：dev（底层 struct device 指针）、driver（指向 drm_driver 的指针）、primary 和 render（指向 /dev/dri/card0 和 renderD128 的 drm_minor 节点）、mode_config（KMS 的所有显示对象：CRTC、Encoder、Connector 等）、vma_offset_manager（GEM 对象的虚拟地址管理）。amdgpu 驱动将 drm_device 嵌入到自己更大的 amdgpu_device 结构体中，通过 container_of 宏互相转换。',
              'drm_driver 结构体是驱动向 DRM 框架注册能力的接口。它包含一系列回调函数指针：.load（已废弃，现在使用 devm 管理的初始化）、.open / .postclose（用户空间打开/关闭设备文件时的回调）、.gem_create_object（创建 GEM Buffer Object 时的回调）、.dumb_create / .dumb_map_offset（为帧缓冲分配"哑"Buffer）、.ioctls 和 .num_ioctls（驱动特定的 ioctl 表）。amdgpu 的 drm_driver 实例是 amdgpu_kms_driver，定义在 amdgpu_drv.c 中。',
              'ioctl 分发是 DRM 框架的核心机制。当用户空间调用 ioctl(fd, DRM_IOCTL_AMDGPU_CS, &args) 时，内核的 VFS 层将调用传递给 drm_ioctl() 函数（drm_ioctl.c）。drm_ioctl() 首先检查 ioctl 编号：如果是 DRM 核心定义的（如 DRM_IOCTL_VERSION、DRM_IOCTL_GEM_CLOSE），由 DRM 核心直接处理；如果是驱动特定的（编号 >= DRM_COMMAND_BASE），则查找 drm_driver.ioctls[] 表分发到驱动处理函数。amdgpu 定义了约 20 个驱动特定的 ioctl（AMDGPU_CS、AMDGPU_GEM_CREATE、AMDGPU_INFO 等）。',
              '/dev/dri/ 目录下的设备文件是用户空间访问 GPU 的入口。card0 是"master"节点，拥有 KMS 权限（可以设置显示模式），通常由 Xorg/Wayland compositor 打开。renderD128 是"render"节点，只有渲染和计算权限（没有 KMS），普通应用程序（如游戏）通过它访问 GPU。这种分离确保了普通用户可以利用 GPU 渲染而不会意外改变显示设置。',
            ],
            keyPoints: [
              'drm_device 代表一个 GPU 实例，由 drm_dev_alloc() 创建，包含设备节点、mode_config 等',
              'drm_driver 定义驱动回调：.open, .postclose, .gem_create_object, .dumb_create, .ioctls',
              'amdgpu 将 drm_device 嵌入 amdgpu_device，通过 container_of 宏互相转换',
              'drm_ioctl() 根据 ioctl 编号分发到 DRM 核心处理或驱动特定处理函数',
              '/dev/dri/card0 (master) 拥有 KMS 权限，/dev/dri/renderD128 (render) 只有渲染权限',
              'amdgpu 定义约 20 个驱动特定 ioctl（DRM_COMMAND_BASE + offset）',
            ],
          },
          diagram: {
            title: 'DRM 核心架构与 ioctl 分发路径',
            content: `DRM 核心架构：从用户空间到硬件驱动的 ioctl 分发

用户空间
─────────────────────────────────────────────────────────
  Mesa / libdrm / Wayland compositor
       │
       │  ioctl(fd, DRM_IOCTL_AMDGPU_CS, &args)
       │  fd = open("/dev/dri/renderD128")
       │
═══════╪═══════ 系统调用边界 (Ring 3 → Ring 0) ═════════
       │
内核空间
       ▼
  VFS: file_operations.unlocked_ioctl
       │
       ▼
  drm_ioctl()                        (drivers/gpu/drm/drm_ioctl.c)
  ├─ 解析 ioctl 编号: cmd = _IOC_NR(nr)
  ├─ cmd < DRM_COMMAND_BASE ?
  │   ├─ YES → DRM 核心 ioctl 表        ┌──────────────────────┐
  │   │   drm_ioctls[cmd]               │ DRM_IOCTL_VERSION    │
  │   │                                  │ DRM_IOCTL_GEM_CLOSE  │
  │   │                                  │ DRM_IOCTL_MODE_*     │
  │   │                                  └──────────────────────┘
  │   │
  │   └─ NO → 驱动特定 ioctl 表         ┌──────────────────────┐
  │       drm_driver.ioctls              │ AMDGPU_GEM_CREATE    │
  │       [cmd - DRM_COMMAND_BASE]       │ AMDGPU_CS            │
  │                                      │ AMDGPU_INFO          │
  │                                      │ AMDGPU_WAIT_CS       │
  │                                      │ AMDGPU_VM            │
  │                                      └──────────┬───────────┘
  │                                                  │
  └──────────────────────────────────────────────────┘
                      │
                      ▼
  amdgpu 驱动处理函数 (amdgpu_kms.c, amdgpu_gem.c, ...)
                      │
                      ▼
  amdgpu_device (内嵌 drm_device)
  ┌───────────────────────────────────────────────────┐
  │  struct amdgpu_device {                           │
  │      struct drm_device        ddev;  ← DRM 核心  │
  │      struct amdgpu_ring       gfx_ring[...];      │
  │      struct amdgpu_vm_manager vm_manager;         │
  │      struct amdgpu_gmc        gmc;   ← VRAM/GTT  │
  │      void __iomem            *rmmio; ← 寄存器BAR │
  │      ...                                          │
  │  };                                               │
  └───────────────────────────────────────────────────┘`,
            caption: 'DRM ioctl 分发的完整路径。DRM 核心处理通用操作（VERSION、GEM_CLOSE、MODE_*），驱动特定操作（AMDGPU_CS、AMDGPU_GEM_CREATE）由 amdgpu 自己的处理函数完成。',
          },
          codeWalk: {
            title: 'amdgpu 的 drm_driver 注册与 ioctl 表',
            file: 'drivers/gpu/drm/amd/amdgpu/amdgpu_drv.c',
            language: 'c',
            code: `/* amdgpu_drv.c — amdgpu 的 drm_driver 定义 */

static const struct drm_driver amdgpu_kms_driver = {
    .driver_features =
        DRIVER_ATOMIC |         /* 支持 Atomic Mode Setting */
        DRIVER_GEM |            /* 支持 GEM 内存管理 */
        DRIVER_RENDER |         /* 支持 renderD128 节点 */
        DRIVER_MODESET |        /* 支持 KMS 显示管线 */
        DRIVER_SYNCOBJ |        /* 支持 sync object 同步 */
        DRIVER_SYNCOBJ_TIMELINE, /* 支持 timeline syncobj */

    .open = amdgpu_driver_open_kms,
    .postclose = amdgpu_driver_postclose_kms,
    .lastclose = amdgpu_driver_lastclose_kms,

    /* GEM 回调 */
    .gem_prime_import = amdgpu_gem_prime_import,

    /* 帧缓冲 dumb buffer */
    .dumb_create = amdgpu_mode_dumb_create,
    .dumb_map_offset = amdgpu_mode_dumb_mmap,

    /* 驱动特定的 ioctl 表 */
    .ioctls = amdgpu_ioctls_kms,
    .num_ioctls = ARRAY_SIZE(amdgpu_ioctls_kms),

    .fops = &amdgpu_driver_kms_fops,
    .name = "amdgpu",
    .desc = "AMD GPU",
    .major = KMS_DRIVER_MAJOR,
    .minor = KMS_DRIVER_MINOR,
    .patchlevel = KMS_DRIVER_PATCHLEVEL,
};

/* amdgpu 驱动特定的 ioctl 分发表 */
static const struct drm_ioctl_desc amdgpu_ioctls_kms[] = {
    DRM_IOCTL_DEF_DRV(AMDGPU_GEM_CREATE,
        amdgpu_gem_create_ioctl,
        DRM_AUTH | DRM_RENDER_ALLOW),
    DRM_IOCTL_DEF_DRV(AMDGPU_CS,
        amdgpu_cs_ioctl,
        DRM_AUTH | DRM_RENDER_ALLOW),
    DRM_IOCTL_DEF_DRV(AMDGPU_INFO,
        amdgpu_info_ioctl,
        DRM_AUTH | DRM_RENDER_ALLOW),
    DRM_IOCTL_DEF_DRV(AMDGPU_WAIT_CS,
        amdgpu_cs_wait_ioctl,
        DRM_AUTH | DRM_RENDER_ALLOW),
    DRM_IOCTL_DEF_DRV(AMDGPU_GEM_MMAP,
        amdgpu_gem_mmap_ioctl,
        DRM_AUTH | DRM_RENDER_ALLOW),
    DRM_IOCTL_DEF_DRV(AMDGPU_VM,
        amdgpu_vm_ioctl,
        DRM_AUTH | DRM_RENDER_ALLOW),
    /* ... 总共约 20 个 ioctl ... */
};

/* probe 函数中注册 drm_device */
static int amdgpu_pci_probe(struct pci_dev *pdev,
                             const struct pci_device_id *ent)
{
    struct drm_device *ddev;
    struct amdgpu_device *adev;

    /* 分配 drm_device + amdgpu_device */
    adev = devm_drm_dev_alloc(&pdev->dev,
                               &amdgpu_kms_driver,
                               struct amdgpu_device,
                               ddev);
    /* adev->ddev 已初始化为 drm_device
     * adev->ddev.dev = &pdev->dev
     * adev->ddev.driver = &amdgpu_kms_driver
     */

    ddev = &adev->ddev;

    /* 初始化 GPU 硬件 */
    amdgpu_device_init(adev, flags);

    /* 注册 DRM 设备 — 创建 /dev/dri/card0, renderD128 */
    drm_dev_register(ddev, ent->driver_data);
    return 0;
}`,
            annotations: [
              'DRIVER_ATOMIC | DRIVER_GEM | DRIVER_RENDER | DRIVER_MODESET 声明驱动支持的 DRM 功能子集',
              '.open / .postclose 在用户空间每次 open/close /dev/dri/* 时调用，管理 per-file 上下文',
              '.ioctls = amdgpu_ioctls_kms 注册驱动特定的 ioctl 表，DRM 核心据此分发请求',
              'DRM_RENDER_ALLOW 标志表示此 ioctl 可通过 renderD128 节点调用（不需要 master 权限）',
              'devm_drm_dev_alloc 同时分配 drm_device 和外层 amdgpu_device，生命周期由 devres 管理',
              'drm_dev_register() 创建设备节点并将 drm_device 注册到 DRM 核心子系统',
            ],
            explanation: '这段代码展示了 amdgpu 如何向 DRM 框架注册自己。amdgpu_kms_driver 就像一份"能力清单"——它告诉 DRM 核心"我支持 Atomic Mode Setting、GEM 内存、渲染节点、KMS 显示"，并提供了每个能力对应的处理函数。当用户空间发起 ioctl 时，DRM 核心查找 amdgpu_ioctls_kms[] 表，找到对应的处理函数（如 amdgpu_cs_ioctl）并调用它。理解这个注册机制是理解整个 DRM 框架的钥匙。',
          },
          miniLab: {
            title: '查看 DRM 设备节点与驱动信息',
            objective: '通过 sysfs 和 libdrm 工具查看 DRM 设备信息，理解 drm_device 在用户空间的可见形态。',
            steps: [
              '列出所有 DRM 设备节点：ls -la /dev/dri/（应该看到 card0、renderD128 等）',
              '查看 DRM 版本信息：cat /sys/class/drm/card0/device/driver/module/version 或运行 sudo drmdevice -v（如果安装了 libdrm-tests）',
              '使用 libdrm 查看驱动名称和版本：编写简单程序或使用 python3 -c "import fcntl,struct,os; fd=os.open(\'/dev/dri/card0\',os.O_RDWR); print(fcntl.ioctl(fd,0xc0406400,b\'\\x00\'*64))"（DRM_IOCTL_VERSION）',
              '查看 DRM 设备的 debugfs：ls /sys/kernel/debug/dri/0/（需要 root 权限）',
              '统计 amdgpu 注册了多少 ioctl：grep -c "DRM_IOCTL_DEF_DRV" drivers/gpu/drm/amd/amdgpu/amdgpu_drv.c（在内核源码中）',
              '查看当前打开 DRM 设备的进程：sudo fuser /dev/dri/card0 /dev/dri/renderD128',
            ],
            expectedOutput: `$ ls -la /dev/dri/
crw-rw----+ 1 root video 226,   0 ... card0        ← master 节点
crw-rw----+ 1 root render 226, 128 ... renderD128   ← render 节点

$ ls /sys/kernel/debug/dri/0/
amdgpu_dm_visual_confirm  amdgpu_gpu_recover  amdgpu_ring_gfx
amdgpu_fence_info         amdgpu_pm_info      amdgpu_vram_mm
...  ← 大量 amdgpu 的 debugfs 条目

$ sudo fuser /dev/dri/card0
/dev/dri/card0:     1234  5678  ← Xorg/Wayland 和 compositor`,
            hint: '如果 /sys/kernel/debug/dri/ 为空，确保已挂载 debugfs：mount -t debugfs none /sys/kernel/debug。debugfs 是内核调试的重要接口，amdgpu 在其中暴露了大量内部状态。',
          },
          debugExercise: {
            title: '找出缺失的 drm_dev_unregister 导致的资源泄漏',
            language: 'c',
            description: '以下是一个简化的 DRM 驱动的 probe 和 remove 函数。驱动卸载后，/dev/dri/card0 仍然存在且用户空间程序再次 open 会导致内核 oops。',
            question: '为什么驱动卸载后设备文件仍然存在？如何修复？',
            buggyCode: `static int my_gpu_probe(struct pci_dev *pdev,
                        const struct pci_device_id *ent)
{
    struct drm_device *ddev;

    ddev = devm_drm_dev_alloc(&pdev->dev, &my_driver,
                               struct my_device, ddev);
    if (IS_ERR(ddev))
        return PTR_ERR(ddev);

    my_hw_init(ddev);

    drm_dev_register(ddev, 0);
    return 0;
}

static void my_gpu_remove(struct pci_dev *pdev)
{
    struct drm_device *ddev = pci_get_drvdata(pdev);

    my_hw_fini(ddev);
    /* BUG: 忘记调用 drm_dev_unregister(ddev) */
    /* 也忘记了 drm_dev_put(ddev) 如果不用 devm */
}`,
            hint: '对称性原则：drm_dev_register() 与 drm_dev_unregister() 必须配对。注册时创建设备节点和 sysfs 条目，注销时必须移除它们。',
            answer: '问题：remove 函数中缺少 drm_dev_unregister(ddev)。drm_dev_register() 在 probe 中创建了 /dev/dri/card0 和 /dev/dri/renderD128 设备节点、注册了 sysfs 属性、并将 drm_device 加入 DRM 核心的全局设备列表。如果 remove 中不调用 drm_dev_unregister()，这些资源不会被清理：（1）设备节点仍然存在于 /dev/dri/，用户空间可以继续 open 它；（2）但底层硬件已经被 my_hw_fini() 释放了，任何通过该设备节点的 ioctl 都会访问已释放的内存，导致 use-after-free 和内核 oops。修复：在 my_hw_fini() 之前调用 drm_dev_unregister(ddev)——先从 DRM 核心注销（阻止新的 ioctl），再释放硬件资源。这遵循"注册顺序相反"的原则：probe 中先 init 后 register，remove 中先 unregister 后 fini。',
          },
          interviewQ: {
            question: '解释 DRM 子系统的架构设计：drm_device、drm_driver 和 ioctl 分发机制是如何协作的？为什么要设计 card 和 render 两种设备节点？',
            difficulty: 'hard',
            hint: '从分层设计（DRM 核心 vs 驱动特定代码）、ioctl 分发表（drm_ioctls[] vs drm_driver.ioctls[]）、以及安全模型（card master 权限 vs render 普通权限）的角度回答。',
            answer: 'DRM 采用框架+插件的架构：（1）drm_device 是核心数据结构，代表一个 GPU 实例，持有 mode_config（所有 KMS 对象）、file_list（所有打开的文件描述符）和 driver 指针。它通过 devm_drm_dev_alloc() 分配并嵌入到具体驱动的设备结构中（如 amdgpu_device.ddev）。（2）drm_driver 是驱动的"注册表"——通过 .driver_features 声明支持的功能子集，通过回调函数（.open, .postclose, .gem_create_object, .dumb_create）提供硬件特定实现，通过 .ioctls[] 注册驱动特定的 ioctl。（3）ioctl 分发：drm_ioctl() 接收所有 DRM ioctl 调用，根据 ioctl 编号判断走 DRM 核心表（drm_ioctls[]，处理 VERSION、GEM_CLOSE、MODE_* 等通用操作）还是驱动表（drm_driver.ioctls[]，处理 AMDGPU_CS 等驱动特有操作）。（4）card vs render 节点分离是安全模型的关键：card0 节点拥有 DRM master 权限（SET_MASTER），可以执行 KMS 操作（设置分辨率、切换显示器），通常只有 Xorg/Wayland compositor 持有；renderD128 节点只允许渲染和计算 ioctl（DRM_RENDER_ALLOW 标志），普通应用不需要 root 权限就能使用 GPU 渲染。这种设计让多用户系统中的 GPU 共享既安全又高效。',
            amdContext: '这个问题测试你对 DRM 框架的系统性理解。AMD 面试中你需要展示不仅知道 amdgpu 的细节，还理解它在 DRM 大框架中的位置和设计哲学。',
          },
        },

        // ── Lesson 4.1.2 ──────────────────────────────────────
        {
          id: '4-1-2',
          number: '4.1.2',
          title: 'KMS 显示管线：CRTC → Encoder → Connector',
          titleEn: 'KMS Display Pipeline: CRTC → Encoder → Connector',
          duration: 20,
          difficulty: 'advanced',
          tags: ['KMS', 'CRTC', 'Encoder', 'Connector', 'Plane', 'Atomic'],
          concept: {
            summary: 'Kernel Mode Setting (KMS) 将显示硬件抽象为一条管线：Plane（承载 framebuffer 数据）→ CRTC（扫描控制器，将像素按时序输出）→ Encoder（将 CRTC 的数字信号转换为特定协议）→ Connector（物理输出端口）。这种抽象让用户空间 compositor 可以用统一的 API 控制不同 GPU 的显示输出。',
            explanation: [
              'KMS 的设计思想是将显示硬件的物理结构映射为软件对象。一块 GPU 显卡上通常有多个显示控制器（Display Controller），每个控制器可以驱动一个显示器。在 DRM/KMS 中，这些硬件单元被抽象为四类对象，它们连成一条显示管线（Display Pipeline）。',
              'drm_plane 是管线的起点，代表一个 framebuffer 层。每个 Plane 绑定一个 drm_framebuffer（内存中的像素数据），并定义了在屏幕上的显示区域（src_x, src_y, src_w, src_h → crtc_x, crtc_y, crtc_w, crtc_h）。Plane 有三种类型：Primary（主平面，承载主画面）、Overlay（叠加平面，用于视频覆盖层、光标以外的额外层）和 Cursor（光标平面，硬件加速的鼠标指针）。多个 Plane 叠加到同一个 CRTC 上实现硬件合成（Hardware Compositing），比 GPU 渲染合成更省电。',
              'drm_crtc（CRT Controller，名字来源于 CRT 显示器时代）是显示管线的核心，代表一个扫描输出单元。CRTC 从 Plane 获取像素数据，按照配置的时序参数（水平/垂直分辨率、前/后消隐期、同步脉冲宽度 = drm_display_mode）逐行扫描输出。CRTC 还负责生成 VBlank 中断（在每帧扫描结束时触发），这是页面翻转（Page Flip）和垂直同步（VSync）的基础。amdgpu 的 CRTC 由 DC（Display Core）模块中的 amdgpu_dm_crtc.c 实现。',
              'drm_encoder 代表信号转换器，将 CRTC 输出的内部数字信号转换为特定的传输协议（HDMI、DisplayPort、DVI 等）。一个 CRTC 可以连接多个 Encoder（但同一时刻只有一个活跃），一个 Encoder 只能连接一个 Connector。在现代 GPU 上，Encoder 通常集成在 GPU 芯片内部（Digital Encoder），不再是独立的硬件。',
              'drm_connector 代表物理输出端口——你显卡背面的 HDMI 口、DisplayPort 口等。Connector 负责：（1）检测显示器是否连接（通过 HPD — Hot Plug Detection）；（2）读取显示器的 EDID（Extended Display Identification Data，包含支持的分辨率、刷新率等信息）；（3）向用户空间报告连接状态（connected/disconnected/unknown）。amdgpu 的 Connector 在 DC 模块的 amdgpu_dm_connector.c 中实现，支持 DP、HDMI、eDP 等接口类型。',
              '在 amdgpu 中，KMS 的实现由 Display Core (DC) 模块负责。DC 模块（drivers/gpu/drm/amd/display/）最初从 Windows 驱动移植而来，代码量约 50 万行。它将 DRM/KMS 的标准接口翻译为 AMD DCN（Display Controller Next）硬件的寄存器操作。DC 内部有自己的对象模型（dc_stream、dc_plane、dc_link），amdgpu_dm.c 作为"胶水层"将 DRM 对象映射到 DC 对象。',
            ],
            keyPoints: [
              'KMS 显示管线：Plane（像素源）→ CRTC（扫描时序）→ Encoder（信号转换）→ Connector（物理端口）',
              'drm_plane 三种类型：Primary（主画面）、Overlay（叠加层）、Cursor（光标）',
              'drm_crtc 按 drm_display_mode 定义的时序参数逐行输出像素，产生 VBlank 中断',
              'drm_connector 检测 HPD（热插拔）、读取 EDID、报告连接状态',
              'amdgpu 的 KMS 由 DC（Display Core）模块实现，代码在 drivers/gpu/drm/amd/display/',
              'amdgpu_dm.c 是胶水层：DRM 对象 (drm_crtc) ↔ DC 对象 (dc_stream)',
            ],
          },
          diagram: {
            title: 'KMS 显示管线：从 Framebuffer 到屏幕',
            content: `KMS 显示管线（以 amdgpu 双显示器输出为例）

Framebuffer (VRAM)         DRM/KMS 对象              物理硬件
──────────────────         ──────────────              ────────

                           ┌──────────────┐
 FB0 (主画面)              │   Plane 0    │
 1920x1080 XRGB ──────────│  (Primary)   │
                           └──────┬───────┘
                                  │
                           ┌──────┴───────┐
 FB1 (鼠标指针)            │   Plane 1    │
 64x64 ARGB ──────────────│  (Cursor)    │     硬件合成
                           └──────┬───────┘       │
                                  ├───────────────┘
                                  ▼
                           ┌──────────────┐     DCN 硬件
                           │   CRTC 0     │     ┌──────────┐
                           │ 1920x1080    │────▶│ OTG 0    │
                           │ @60Hz        │     │(扫描引擎) │
                           │ VBlank IRQ ──│──┐  └────┬─────┘
                           └──────────────┘  │       │
                                             │       ▼
                                             │  ┌──────────┐
                           ┌──────────────┐  │  │Encoder 0 │    ┌─────────┐
                           │ Connector 0  │──│──│ (DP PHY)  │───▶│ DP 口   │──▶ 显示器A
                           │ DP-1         │  │  └──────────┘    └─────────┘
                           │ (connected)  │  │
                           │ EDID: ...    │  │
                           └──────────────┘  │
                                             │
                           ┌──────────────┐  │
 FB2 (第二屏画面)          │   Plane 2    │  │
 2560x1440 XRGB ──────────│  (Primary)   │  │
                           └──────┬───────┘  │
                                  ▼          │
                           ┌──────────────┐  │  ┌──────────┐
                           │   CRTC 1     │──┘  │Encoder 1 │    ┌─────────┐
                           │ 2560x1440    │────▶│(HDMI PHY) │───▶│ HDMI 口 │──▶ 显示器B
                           │ @144Hz       │     └──────────┘    └─────────┘
                           └──────────────┘
                           ┌──────────────┐
                           │ Connector 1  │
                           │ HDMI-A-1     │
                           │ (connected)  │
                           └──────────────┘

VBlank 时序（单帧）：
┌─────────── Active Display ───────────┐┌── VBlank ──┐
│ 逐行扫描 1920x1080 像素              ││ Front Porch │
│ CRTC 从 Plane 读取 FB 数据           ││ Sync Pulse  │
│                                       ││ Back Porch  │
└───────────────────────────────────────┘└─── IRQ! ───┘`,
            caption: 'KMS 显示管线的完整视图。左侧是 VRAM 中的 Framebuffer，中间是 DRM/KMS 抽象对象，右侧是实际的物理接口。VBlank 中断在每帧扫描结束时触发，是安全更新显示内容的时间窗口。',
          },
          codeWalk: {
            title: 'amdgpu DC 的 Connector 创建流程',
            file: 'drivers/gpu/drm/amd/display/amdgpu_dm/amdgpu_dm.c',
            language: 'c',
            code: `/* amdgpu_dm.c — 创建 DRM connector 并关联到 DC link */

static int amdgpu_dm_initialize_drm_device(
    struct amdgpu_device *adev)
{
    struct drm_device *ddev = adev_to_drm(adev);
    struct amdgpu_display_manager *dm = &adev->dm;
    int i;

    /* 遍历 DC 检测到的所有 display link */
    for (i = 0; i < dm->dc->caps.max_links; i++) {
        struct dc_link *link = dm->dc->links[i];
        struct amdgpu_dm_connector *aconnector;

        if (link->connector_signal == SIGNAL_TYPE_NONE)
            continue;

        /* 分配 amdgpu_dm_connector（内嵌 drm_connector） */
        aconnector = kzalloc(sizeof(*aconnector), GFP_KERNEL);

        /* 根据信号类型初始化 DRM connector */
        if (link->connector_signal == SIGNAL_TYPE_DISPLAY_PORT ||
            link->connector_signal == SIGNAL_TYPE_EDP) {

            drm_connector_init(ddev, &aconnector->base,
                &amdgpu_dm_dp_connector_funcs,
                DRM_MODE_CONNECTOR_DisplayPort);

            drm_connector_helper_add(&aconnector->base,
                &amdgpu_dm_dp_connector_helper_funcs);
            /* helper_funcs 提供: .get_modes, .detect,
             * .best_encoder, .atomic_check */

        } else if (link->connector_signal == SIGNAL_TYPE_HDMI_TYPE_A) {

            drm_connector_init(ddev, &aconnector->base,
                &amdgpu_dm_connector_funcs,
                DRM_MODE_CONNECTOR_HDMIA);

            drm_connector_helper_add(&aconnector->base,
                &amdgpu_dm_connector_helper_funcs);
        }

        /* 将 DC link 关联到 DRM connector */
        aconnector->dc_link = link;

        /* 注册 connector 到 DRM mode_config */
        drm_connector_register(&aconnector->base);

        /* 设置支持的 encoder */
        drm_connector_attach_encoder(&aconnector->base,
                                      &aencoder->base);
    }
    return 0;
}

/* connector 的 helper 回调：获取显示器支持的模式 */
static int amdgpu_dm_connector_get_modes(
    struct drm_connector *connector)
{
    struct amdgpu_dm_connector *aconnector =
        to_amdgpu_dm_connector(connector);

    /* 从 DC link 读取 EDID */
    struct edid *edid = aconnector->edid;
    if (edid) {
        /* 解析 EDID 获取支持的分辨率列表 */
        drm_add_edid_modes(connector, edid);
        /* → 将 1920x1080@60, 2560x1440@144 等
         *   添加到 connector->modes 链表 */
    }
    return connector->probed_modes;
}`,
            annotations: [
              'dm->dc->links[] 是 DC 硬件层检测到的显示链路数组，每个 link 对应一个物理输出',
              'connector_signal 区分端口类型：DP、HDMI、eDP（笔记本内屏）、DVI 等',
              'drm_connector_init() 初始化 DRM connector 基础结构，第四个参数指定 connector type',
              'drm_connector_helper_add() 注册 helper 回调：.get_modes 读取 EDID，.detect 检测连接状态',
              'aconnector->dc_link 将 DRM 世界的 connector 与 DC 世界的 link 关联起来',
              'drm_add_edid_modes() 解析 EDID 数据，将显示器支持的分辨率加入 modes 链表',
            ],
            explanation: 'amdgpu 通过 DC 模块创建 KMS 对象。这段代码展示了 Connector 创建的核心流程：遍历 DC 检测到的物理输出 → 根据信号类型（DP/HDMI）初始化 DRM connector → 关联 DC link → 注册到 DRM。当用户空间查询可用分辨率时，get_modes 回调读取显示器的 EDID 来获取支持的模式列表。这种分层设计（DRM connector ↔ DC link ↔ 硬件 PHY）让 amdgpu 可以复用大量 DRM 基础设施。',
          },
          miniLab: {
            title: '使用 libdrm 查询显示器信息',
            objective: '编写一个 C 程序使用 libdrm 接口查询系统中所有 Connector 的状态和支持的分辨率，理解 KMS 对象在用户空间的表现形式。',
            setup: `# 安装 libdrm 开发库
sudo apt install libdrm-dev
# 创建工作目录
mkdir -p ~/drm-lab && cd ~/drm-lab`,
            steps: [
              '创建 query_display.c，使用 drmModeGetResources() 获取 KMS 资源列表',
              '遍历 connectors 数组，用 drmModeGetConnector() 获取每个 connector 的详细信息',
              '打印 connector 类型（DP/HDMI）、连接状态、支持的分辨率列表',
              '编译：gcc -o query_display query_display.c -ldrm -I/usr/include/libdrm',
              '运行：sudo ./query_display（需要 root 或在 video 组中）',
              '对比输出与 dmesg | grep connector 的信息是否一致',
            ],
            expectedOutput: `$ sudo ./query_display
Connector 0: DP-1 [connected]
  Modes:
    2560x1440@144Hz (preferred)
    2560x1440@120Hz
    1920x1080@60Hz
    ...
Connector 1: HDMI-A-1 [disconnected]
CRTC 0: active, 2560x1440@144Hz
CRTC 1: inactive

也可以使用现成工具验证:
$ modetest -c    ← 列出所有 connectors
$ modetest -p    ← 列出所有 planes
$ modetest -e    ← 列出所有 encoders`,
            hint: '如果没有显示器连接，connector 状态会是 disconnected 且没有可用模式。可以使用 modetest（来自 libdrm-tests 或 drm-utils 包）作为现成的查询工具。运行 modetest -M amdgpu 指定使用 amdgpu 驱动。',
          },
          debugExercise: {
            title: '诊断 Connector 类型配置错误',
            language: 'c',
            description: '一个自定义 DRM 驱动为 HDMI 端口错误地使用了 DisplayPort 的 connector type，导致 Wayland compositor 无法正确识别输出。',
            question: '为什么显示器已连接但 Wayland compositor 报告 "no DP link" 并拒绝启用该输出？',
            buggyCode: `/* 创建 HDMI connector 但使用了错误的类型 */
static int create_hdmi_connector(struct drm_device *dev,
                                  struct my_connector *conn)
{
    int ret;

    /* BUG: HDMI 端口却使用了 DisplayPort 类型！ */
    ret = drm_connector_init(dev, &conn->base,
        &my_connector_funcs,
        DRM_MODE_CONNECTOR_DisplayPort);  /* 应为 HDMIA */

    if (ret)
        return ret;

    drm_connector_helper_add(&conn->base,
        &my_dp_connector_helper_funcs);
    /* ↑ 也使用了 DP 的 helper funcs 而非 HDMI 的 */

    /* HPD 和 EDID 读取实际走的是 HDMI 通道... */
    conn->hpd_gpio = gpiod_get(dev->dev, "hdmi-hpd", ...);
    return 0;
}`,
            hint: '思考 connector type 对用户空间的影响：Wayland/Xorg 根据 connector type 选择信号协议和 link training 策略。HDMI 和 DP 的 link training 完全不同。',
            answer: '问题出在 drm_connector_init() 的第四个参数：DRM_MODE_CONNECTOR_DisplayPort 应该是 DRM_MODE_CONNECTOR_HDMIA。这导致两个严重后果：（1）用户空间（Wayland compositor、Xorg）认为这是一个 DP 端口，尝试执行 DP link training（DPCD 读写、lane 协商），但底层硬件实际是 HDMI，DPCD 读写会失败，compositor 报告 "no DP link"；（2）DP 的 helper funcs 被挂载到了 HDMI connector 上，.detect 和 .get_modes 回调使用 DP 协议读取 EDID（AUX channel），而不是 HDMI 协议（DDC/I2C），导致无法获取显示器信息。修复：将 DRM_MODE_CONNECTOR_DisplayPort 改为 DRM_MODE_CONNECTOR_HDMIA，并使用 HDMI 的 helper_funcs。connector type 必须与实际物理接口匹配——这是 KMS 抽象正确工作的前提。',
          },
          interviewQ: {
            question: '描述 KMS 显示管线中 CRTC、Encoder、Connector 和 Plane 各自的职责，以及它们之间的连接关系。',
            difficulty: 'hard',
            hint: '从数据流方向描述：Framebuffer → Plane → CRTC → Encoder → Connector → 显示器。强调每个对象的硬件对应物，以及 N:M 对应关系（多个 Plane 可以连接一个 CRTC，但每个 Encoder 通常只连接一个 Connector）。',
            answer: 'KMS 显示管线是一条从内存像素到物理显示的数据通路：（1）Plane 是像素源——每个 Plane 绑定一个 Framebuffer（VRAM 中的像素矩阵），并定义裁剪和缩放参数。三种类型：Primary（必须有，承载主画面）、Cursor（硬件加速光标，64x64）、Overlay（可选叠加层，用于视频播放等）。多个 Plane 通过硬件合成叠加到同一个 CRTC，避免 GPU 合成的开销。（2）CRTC 是扫描引擎——它按照 drm_display_mode 定义的时序（hactive, vactive, hsync, vsync, clock）将 Plane 的像素数据逐行输出。CRTC 产生 VBlank 中断，是页面翻转和垂直同步的时间基准。一块 GPU 通常有 4-6 个 CRTC，决定了最大同时输出的显示器数量。（3）Encoder 是信号转换器——将 CRTC 的内部数字信号转换为 HDMI TMDS、DP Main Link 等传输协议。在现代 GPU 上 Encoder 通常是内部的数字编码器。一个 CRTC 可以连接多个 Encoder（但同时只有一个活跃），用于支持端口复用。（4）Connector 是物理接口——代表显卡上的 HDMI 口、DP 口等。负责 HPD 检测、EDID 读取、连接状态报告。用户空间通过 Connector 发现和选择显示设备。连接关系：N Planes → 1 CRTC → 1 Encoder → 1 Connector → 显示器。在 amdgpu 中，DC 模块将这些 DRM 对象映射到 DCN 硬件单元（Plane→MPC/DPP, CRTC→OTG, Encoder→DIO, Connector→PHY+HPD）。',
            amdContext: 'AMD 显示团队面试的高频题。除了描述通用 KMS 架构，要提到 DC 模块如何将 DRM 对象映射到 DCN 硬件——这展示了你对 amdgpu 显示子系统的具体理解。',
          },
        },

        // ── Lesson 4.1.3 ──────────────────────────────────────
        {
          id: '4-1-3',
          number: '4.1.3',
          title: 'Atomic Mode Setting：原子显示更新',
          titleEn: 'Atomic Mode Setting: Atomic Display Updates',
          duration: 20,
          difficulty: 'advanced',
          tags: ['Atomic', 'KMS', 'page-flip', 'VBlank', 'drm_atomic_state'],
          concept: {
            summary: 'Atomic Mode Setting 是 DRM/KMS 的现代 API——它允许用户空间将多个显示属性的变更（分辨率、Plane 位置、Gamma 曲线等）打包为一个原子操作，由内核一次性验证和提交。相比 Legacy Mode Setting 的逐个设置（set CRTC → set cursor → set gamma），Atomic 避免了中间不一致状态导致的画面闪烁和撕裂。',
            explanation: [
              'Legacy Mode Setting 的问题：在旧的 KMS API 中，每个显示属性的变更是独立的 ioctl 调用。例如切换分辨率需要先 drmModeSetCrtc()（设置新模式），再 drmModeSetPlane()（设置叠加层），再 drmModeSetCursor()（设置光标位置）。如果第一个调用成功但第二个失败，显示就处于不一致状态——用户看到画面抖动或部分更新。更糟的是，这些操作无法在同一个 VBlank 间隔内完成，导致可见的撕裂。',
              'Atomic Mode Setting 的核心思想是"先验证，后提交"。用户空间构建一个 drm_atomic_state 对象，包含所有想要改变的属性（CRTC 的模式、Plane 的 framebuffer、Connector 的状态等），然后提交给内核。内核分两步处理：（1）atomic_check 阶段：验证整个状态是否合法（bandwidth 是否足够、时钟频率是否支持、Plane 格式是否兼容），不改变任何硬件状态；（2）atomic_commit 阶段：如果检查通过，一次性将所有变更写入硬件，确保在一个 VBlank 间隔内完成。',
              'drm_atomic_state 是 Atomic 提交的核心数据结构。它包含三类状态：drm_crtc_state（CRTC 的新模式、active/enable 状态、mode_changed 标志）、drm_plane_state（Plane 绑定的 FB、src/dst 矩形、rotation/blend 属性）、drm_connector_state（Connector 绑定的 CRTC、DPMS 状态）。每次 atomic commit 时，内核创建一份旧状态的副本，驱动在副本上做修改，check 阶段验证副本，commit 阶段用副本替换当前状态。如果 check 失败，副本被丢弃，硬件不受影响。',
              'DRM_MODE_ATOMIC_TEST_ONLY 标志让用户空间可以"试探"一个配置是否合法，而不实际提交。这对 Wayland compositor 特别有用——它可以先 test-only 多种布局方案，选择能通过验证的最优方案，再实际提交。这避免了"提交→失败→回退"的代价。',
              'Page Flip（页面翻转）是 Atomic 最常见的用途。每一帧渲染完成后，compositor 将新的 framebuffer 绑定到 Primary Plane，通过 atomic commit 提交。DRM_MODE_PAGE_FLIP_EVENT 标志请求在翻转完成时发送事件通知。如果指定了 DRM_MODE_ATOMIC_NONBLOCK，提交立即返回，不等待 VBlank——翻转在下一个 VBlank 自动完成。这是现代 Linux 桌面实现无撕裂合成的基础。',
              '在 amdgpu 中，Atomic commit 的核心路径是 amdgpu_dm_atomic_commit_tail()。这个函数接收验证通过的 drm_atomic_state，将 DRM 层的属性变更翻译为 DC 层的操作：更新 dc_stream（对应 CRTC 模式变更）、更新 dc_plane（对应 Plane 属性变更）、调用 dc_commit_state() 将所有变更一次性提交给 DCN 硬件。VBlank 等待和 page flip completion 事件也在这个函数中处理。',
            ],
            keyPoints: [
              'Legacy Mode Setting：逐个设置属性，无原子性保证，可能导致中间不一致状态',
              'Atomic Mode Setting：打包所有变更为 drm_atomic_state，先 check 后 commit',
              'drm_atomic_state 包含 crtc_state、plane_state、connector_state 三类子状态',
              'TEST_ONLY 标志：试探配置合法性而不提交，compositor 用它寻找最优布局',
              'Page Flip + NONBLOCK：异步提交新 framebuffer，下一个 VBlank 自动切换',
              'amdgpu_dm_atomic_commit_tail()：DRM atomic state → DC state → DCN 硬件寄存器',
            ],
          },
          diagram: {
            title: 'Atomic Mode Setting 的 Check → Commit 流程',
            content: `Atomic Mode Setting 完整流程

用户空间 (Wayland compositor)
────────────────────────────
  1. 构建原子请求
     drmModeAtomicReq *req = drmModeAtomicAlloc();
     drmModeAtomicAddProperty(req, plane_id, FB_ID, new_fb);
     drmModeAtomicAddProperty(req, crtc_id, MODE_ID, mode_blob);
     drmModeAtomicAddProperty(req, conn_id, CRTC_ID, crtc_id);

  2. 可选：先 TEST_ONLY 验证
     drmModeAtomicCommit(fd, req, TEST_ONLY, NULL);
     → 返回 0 表示配置合法，-EINVAL 表示不合法

  3. 正式提交（非阻塞 + 请求 page flip 事件）
     drmModeAtomicCommit(fd, req, NONBLOCK | PAGE_FLIP_EVENT, NULL);
     │
═════╪═════════════════════════════════════════════════════
     │
内核空间 (DRM → amdgpu)
     ▼
  drm_mode_atomic_ioctl()                  (drm_atomic_uapi.c)
     │
     ▼
  ┌─────────────────────────────────────────────────┐
  │  Phase 1: atomic_check （验证阶段）              │
  │                                                  │
  │  drm_atomic_helper_check_modeset()               │
  │  ├─ 每个 CRTC: mode_changed? active_changed?    │
  │  ├─ 带宽检查: 所有 CRTC 的总带宽 ≤ GPU 上限     │
  │  └─ 时钟检查: pixel clock ≤ 硬件支持的最大值     │
  │                                                  │
  │  drm_atomic_helper_check_planes()                │
  │  ├─ 每个 Plane: FB 格式支持? src/dst 矩形合法?  │
  │  ├─ 缩放比例: 不超过硬件 scaler 的能力           │
  │  └─ 带宽: 所有活跃 Plane 的带宽 ≤ 可用内存带宽  │
  │                                                  │
  │  amdgpu_dm_atomic_check()    ← amdgpu 特有检查   │
  │  └─ DC 验证: dc_validate_global_state()          │
  │                                                  │
  │  如果 TEST_ONLY → 到此返回，不修改硬件            │
  └──────────────────────┬──────────────────────────┘
                         │ check 通过
                         ▼
  ┌─────────────────────────────────────────────────┐
  │  Phase 2: atomic_commit （提交阶段）             │
  │                                                  │
  │  如果 NONBLOCK:                                  │
  │    排入工作队列，立即返回用户空间                 │
  │                                                  │
  │  amdgpu_dm_atomic_commit_tail()                  │
  │  ├─ 更新 dc_stream（CRTC 模式变更）             │
  │  ├─ 更新 dc_plane（Plane 属性变更）              │
  │  ├─ dc_commit_state() → 写入 DCN 寄存器         │
  │  ├─ 等待 VBlank（page flip）                     │
  │  └─ drm_crtc_send_vblank_event() → 通知用户空间 │
  └─────────────────────────────────────────────────┘
                         │
                         ▼
  用户空间收到 DRM_EVENT_FLIP_COMPLETE
  → 可以安全释放旧的 framebuffer`,
            caption: 'Atomic Mode Setting 的两阶段提交流程。check 阶段验证配置合法性（可以通过 TEST_ONLY 单独执行），commit 阶段在 VBlank 间隔内一次性更新所有硬件状态。',
          },
          codeWalk: {
            title: 'amdgpu_dm_atomic_commit_tail — 原子提交的核心',
            file: 'drivers/gpu/drm/amd/display/amdgpu_dm/amdgpu_dm.c',
            language: 'c',
            code: `/* amdgpu_dm_atomic_commit_tail — 处理验证通过的 atomic state */
static void amdgpu_dm_atomic_commit_tail(
    struct drm_atomic_state *state)
{
    struct drm_device *dev = state->dev;
    struct amdgpu_device *adev = drm_to_adev(dev);
    struct amdgpu_display_manager *dm = &adev->dm;
    struct dc_state *dc_state = dm_state->context;
    struct drm_crtc *crtc;
    struct drm_crtc_state *old_crtc_state, *new_crtc_state;
    int i;

    /* Step 1: 处理需要 mode change 的 CRTC */
    for_each_oldnew_crtc_in_state(state, crtc,
            old_crtc_state, new_crtc_state, i) {
        struct amdgpu_crtc *acrtc = to_amdgpu_crtc(crtc);
        struct dm_crtc_state *dm_new =
            to_dm_crtc_state(new_crtc_state);

        if (drm_atomic_crtc_needs_modeset(new_crtc_state)) {
            if (!new_crtc_state->active) {
                /* CRTC 被关闭 — 移除 DC stream */
                dc_remove_stream_from_ctx(dm->dc,
                    dc_state, dm_new->stream);
            } else {
                /* CRTC 模式变更 — 更新 DC stream */
                dc_add_stream_to_ctx(dm->dc,
                    dc_state, dm_new->stream);
            }
        }
    }

    /* Step 2: 提交完整的 DC state 到硬件 */
    WARN_ON(!dc_commit_state(dm->dc, dc_state));
    /*
     * dc_commit_state() 内部:
     *   1. 编程 OTG 时序寄存器（分辨率、刷新率）
     *   2. 配置 DPP/MPC（Plane blending、scaling）
     *   3. 更新 surface address（page flip 的关键）
     *   4. 触发 DCN 硬件 double-buffer 切换
     */

    /* Step 3: 等待 VBlank 并发送 flip 完成事件 */
    for_each_oldnew_crtc_in_state(state, crtc,
            old_crtc_state, new_crtc_state, i) {

        if (new_crtc_state->active &&
            new_crtc_state->event) {
            /* 等待 VBlank — 确保 page flip 已生效 */
            drm_crtc_vblank_get(crtc);
            /* ... 硬件在 VBlank 时切换 surface address ... */

            /* 通知用户空间 page flip 完成 */
            drm_crtc_send_vblank_event(crtc,
                new_crtc_state->event);
            drm_crtc_vblank_put(crtc);
        }
    }
}`,
            annotations: [
              'for_each_oldnew_crtc_in_state() 遍历 atomic_state 中所有受影响的 CRTC',
              'drm_atomic_crtc_needs_modeset() 检查 CRTC 是否需要完整的模式切换（而不仅是 page flip）',
              'dc_commit_state() 是 DC 模块的核心——将完整的 DC state 编程到 DCN 硬件寄存器',
              'DCN 使用 double-buffer：新值写入 shadow 寄存器，VBlank 时 latch 到 active 寄存器',
              'drm_crtc_send_vblank_event() 向用户空间发送 DRM_EVENT_FLIP_COMPLETE 事件',
              '整个函数在 commit 工作队列中运行（如果是 NONBLOCK），不阻塞用户空间 ioctl 返回',
            ],
            explanation: '这个函数是 amdgpu 显示更新的心脏。当 Wayland compositor 提交一个新帧时，经过 check 阶段验证后，commit_tail 负责实际将变更写入硬件。关键在于 dc_commit_state()——它将 DRM 世界的原子状态翻译为 DCN 硬件寄存器操作，利用 DCN 的 double-buffering 机制在 VBlank 间隔内完成切换，确保用户看不到任何闪烁或撕裂。',
          },
          miniLab: {
            title: '观察 Atomic Mode Setting 的 VBlank 同步',
            objective: '使用 drm_info 和 trace-cmd 工具观察 Atomic commit 和 VBlank 事件的时序关系，理解无撕裂显示的底层机制。',
            steps: [
              '安装工具：sudo apt install drm-info trace-cmd',
              '查看当前 atomic state：drm_info（如果可用）或 cat /sys/kernel/debug/dri/0/state',
              '启动 VBlank 事件追踪：sudo trace-cmd record -e drm:drm_vblank_event -e amdgpu:amdgpu_flip_status',
              '在追踪期间移动一下鼠标或切换窗口（触发 page flip），等待 2-3 秒后 Ctrl+C 停止',
              '查看追踪结果：trace-cmd report | head -50，观察 vblank_event 和 flip 的时序关系',
              '验证帧率：统计 1 秒内的 vblank 事件数量，应该接近显示器刷新率（60/144）',
            ],
            expectedOutput: `$ sudo trace-cmd report | head -20
  kworker-1234 [002] 1000.001: drm_vblank_event: crtc=0, seq=51234
  kworker-1234 [002] 1000.001: amdgpu_flip_status: flip completed
  kworker-1234 [002] 1000.017: drm_vblank_event: crtc=0, seq=51235
  ...

每两个 vblank 事件间隔约 16.67ms (60Hz) 或 6.94ms (144Hz)
page flip 总是在 vblank 事件附近完成 — 这就是无撕裂的保证`,
            hint: '如果 trace-cmd 报权限错误，确保以 root 运行。如果看不到 amdgpu 相关的 tracepoint，检查 /sys/kernel/debug/tracing/available_events | grep amdgpu。',
          },
          debugExercise: {
            title: '诊断非原子更新导致的画面撕裂',
            language: 'c',
            description: '以下用户空间代码使用 Legacy Mode Setting API 更新显示，用户报告画面有明显的水平撕裂线。',
            question: '为什么会出现撕裂？如何用 Atomic API 修复？',
            buggyCode: `/* Legacy Mode Setting — 非原子更新导致撕裂 */
void update_display(int fd, uint32_t crtc_id,
                     uint32_t plane_id, uint32_t new_fb)
{
    /* 第 1 步：更新主 Plane 的 framebuffer */
    drmModeSetPlane(fd, plane_id, crtc_id,
        new_fb, 0,
        0, 0, 1920, 1080,    /* dst */
        0, 0, 1920<<16, 1080<<16);  /* src */

    /* 第 2 步：更新 overlay Plane */
    drmModeSetPlane(fd, overlay_id, crtc_id,
        overlay_fb, 0,
        100, 100, 320, 240,
        0, 0, 320<<16, 240<<16);

    /* BUG: 两个 SetPlane 调用之间可能跨越 VBlank
     * 导致用户看到一半旧画面 + 一半新画面 */

    /* 第 3 步：更新光标位置 */
    drmModeMoveCursor(fd, crtc_id, cursor_x, cursor_y);
    /* 光标位置更新又是另一个独立的操作... */
}`,
            hint: '三个独立的 ioctl 调用之间不存在原子性保证。如果 Step 1 在 VBlank 前完成但 Step 2 在 VBlank 后才执行，用户看到的这一帧里主 Plane 是新的但 overlay 还是旧的。',
            answer: '问题：三个独立的 drmModeSetPlane/MoveCursor 调用没有原子性保证。如果 CRTC 在两个调用之间进入 VBlank 扫描阶段，显示器会在同一帧内看到部分更新的画面——上半部分显示新的 Plane 0 内容，下半部分显示旧的，这就是水平撕裂线的来源。修复方案是使用 Atomic Mode Setting API：drmModeAtomicReq *req = drmModeAtomicAlloc(); drmModeAtomicAddProperty(req, plane_id, "FB_ID", new_fb); drmModeAtomicAddProperty(req, overlay_id, "FB_ID", overlay_fb); drmModeAtomicAddProperty(req, crtc_id, "CURSOR_X", cursor_x); drmModeAtomicAddProperty(req, crtc_id, "CURSOR_Y", cursor_y); drmModeAtomicCommit(fd, req, DRM_MODE_ATOMIC_NONBLOCK | DRM_MODE_PAGE_FLIP_EVENT, NULL); 这样所有变更被打包为一个原子操作，内核确保在同一个 VBlank 间隔内一次性切换所有 Plane，消除撕裂。',
          },
          interviewQ: {
            question: '解释 Atomic Mode Setting 相对于 Legacy Mode Setting 的优势，以及 atomic_check 和 atomic_commit 两个阶段分别做了什么。',
            difficulty: 'hard',
            hint: '从原子性保证（消除中间不一致状态）、test-only 能力（试探不提交）、以及错误回滚（check 失败不影响硬件）的角度分析。描述 check 阶段的验证内容（带宽、时钟、格式兼容性）和 commit 阶段的硬件编程流程。',
            answer: 'Atomic Mode Setting 的核心优势：（1）原子性——所有显示属性变更（Plane FB、CRTC 模式、Connector 状态）作为一个事务提交，要么全部生效要么全部不生效，消除了 Legacy API 逐个 ioctl 的中间不一致状态和画面撕裂；（2）Test-only——DRM_MODE_ATOMIC_TEST_ONLY 标志让 compositor 可以验证配置是否合法而不实际提交，用于寻找最优显示布局；（3）安全回退——check 阶段在旧状态的副本上验证，失败时丢弃副本，硬件完全不受影响。atomic_check 阶段：（a）drm_atomic_helper_check_modeset() 验证 CRTC 模式变更的合法性（pixel clock ≤ 硬件上限、所有 CRTC 总带宽 ≤ 内存带宽上限）；（b）drm_atomic_helper_check_planes() 验证 Plane 配置（FB 格式是否支持、缩放比例是否在硬件 scaler 能力范围内）；（c）驱动特定检查（amdgpu_dm_atomic_check → dc_validate_global_state()，验证 DCN 硬件资源分配，如 DPP 数量是否足够）。atomic_commit 阶段：（a）如果 NONBLOCK 标志，将实际提交排入工作队列，立即返回用户空间；（b）amdgpu_dm_atomic_commit_tail() 将 DRM 状态翻译为 DC 操作，调用 dc_commit_state() 编程 DCN 寄存器；（c）利用 DCN 的 double-buffering，新值写入 shadow 寄存器，在 VBlank 时 latch 到 active 寄存器，实现无闪烁切换；（d）通过 drm_crtc_send_vblank_event() 通知用户空间 page flip 完成。',
            amdContext: 'Atomic Mode Setting 是现代 Linux 显示栈的基础。AMD 面试中展示你理解从用户空间 drmModeAtomicCommit() 到内核 amdgpu_dm_atomic_commit_tail() 再到 DC dc_commit_state() 的完整路径，会显著加分。',
          },
        },
      ],
    },

    // ════════════════════════════════════════════════════════════
    // Group 4.2: GPU Memory Management (GPU 内存管理)
    // ════════════════════════════════════════════════════════════
    {
      id: '4-2',
      number: '4.2',
      title: 'GPU 内存管理',
      titleEn: 'GPU Memory Management',
      icon: 'HardDrive',
      description: '掌握 DRM 的两大 GPU 内存管理框架 GEM 和 TTM，理解 Buffer Object 的生命周期和内存域迁移，以及 DMA-BUF 跨设备零拷贝共享协议。',
      lessons: [
        // ── Lesson 4.2.1 ──────────────────────────────────────
        {
          id: '4-2-1',
          number: '4.2.1',
          title: 'GEM 与 TTM：GPU 内存管理双框架',
          titleEn: 'GEM & TTM: The Dual GPU Memory Frameworks',
          duration: 20,
          difficulty: 'advanced',
          tags: ['GEM', 'TTM', 'Buffer-Object', 'VRAM', 'GTT', 'memory-domain'],
          concept: {
            summary: 'DRM 框架提供两种 GPU 内存管理方案：GEM（Graphics Execution Manager）提供简洁的 Buffer Object 抽象接口，而 TTM（Translation Table Manager）在 GEM 之上为具有独立显存（VRAM）的离散 GPU 提供完整的内存域管理、对象迁移和页面置换机制。amdgpu 使用 TTM 作为底层，GEM 作为用户空间接口。',
            explanation: [
              'GPU 内存管理是 GPU 驱动最复杂的子系统之一。核心挑战是：GPU 有自己的专用显存（VRAM），但也需要访问系统内存（通过 PCIe 总线）。应用程序创建的 Buffer（顶点数据、纹理、framebuffer）可能在 VRAM 和系统内存之间迁移——当 VRAM 不够时，不活跃的 Buffer 需要被"换出"到系统内存（类似 CPU 的 swap）。DRM 框架通过 GEM 和 TTM 来管理这些复杂性。',
              'GEM（Graphics Execution Manager）最初由 Intel 为 i915 驱动设计，提供了 GPU Buffer Object 的基本抽象。GEM 的核心概念是 drm_gem_object——一个内核对象，代表一块 GPU 可访问的内存。用户空间通过 GEM handle（一个 per-process 的整数 ID）引用 Buffer Object。GEM 提供的操作包括：创建（分配内存）、映射（通过 mmap 让 CPU 访问）、引用计数（open/close 时增减，归零时释放）、命名和 flink（进程间共享，已被 DMA-BUF 取代）。GEM 的设计假设是"GPU 只有系统内存"，所以它本身不处理 VRAM 管理和对象迁移。',
              'TTM（Translation Table Manager）专为具有独立 VRAM 的离散 GPU（如 AMD、NVIDIA）设计。TTM 在 GEM 之上增加了关键能力：（1）内存域（Memory Domain / Placement）——每个 Buffer Object 可以存在于 VRAM、GTT（Graphics Translation Table，系统内存中对 GPU 可见的部分）或 System（普通系统内存）域。（2）对象迁移（BO Move）——当一个 Buffer 需要从 System 移动到 VRAM（GPU 即将使用它）或从 VRAM 移动到 System（VRAM 空间不足）时，TTM 的 ttm_bo_move_memcpy() 或 DMA 引擎完成数据复制。（3）页面置换（Eviction）——当 VRAM 满时，TTM 使用 LRU（Least Recently Used）策略选择最久未使用的 Buffer 换出到 GTT 或 System。',
              'Buffer Object 的生命周期：Create → Place → Map → Use → Unmap → Migrate → Destroy。具体来说：（1）用户空间调用 DRM_IOCTL_AMDGPU_GEM_CREATE，内核创建 amdgpu_bo（内嵌 ttm_buffer_object + drm_gem_object）；（2）TTM 根据请求的 placement（VRAM/GTT）在对应域分配物理页面；（3）用户空间 mmap 获取 CPU 虚拟地址（通过 TTM 的 fault handler 按需映射页面）；（4）GPU 通过 GART/VM 页表访问 Buffer 内容；（5）当 VRAM 不足时，TTM 将不活跃的 BO 迁移到 GTT/System（eviction）；（6）当引用计数归零时，TTM 释放物理页面并销毁 BO。',
              '在 amdgpu 中，GEM 和 TTM 的分工如下：用户空间 API 层（ioctl）使用 GEM 接口（DRM_IOCTL_AMDGPU_GEM_CREATE/GEM_MMAP/GEM_WAIT_IDLE 等），内核实现层使用 TTM 框架（ttm_bo_init_reserved、ttm_bo_validate、ttm_bo_move_memcpy 等）。amdgpu_bo 结构体同时嵌入了 drm_gem_object（GEM 层）和 ttm_buffer_object（TTM 层）。两个框架通过 amdgpu_ttm.c 中的回调函数连接：TTM 调用 amdgpu_bo_move() 来执行实际的 DMA 数据搬运，调用 amdgpu_ttm_io_mem_reserve() 来映射 VRAM 区域。',
            ],
            keyPoints: [
              'GEM 提供用户空间接口（handle、create、mmap），TTM 提供内存域管理和迁移（VRAM↔GTT↔System）',
              'TTM 内存域：VRAM（GPU 专用显存，最快）、GTT（系统内存 GPU 可访问区）、System（普通内存）',
              'amdgpu_bo 同时嵌入 drm_gem_object（GEM）和 ttm_buffer_object（TTM）',
              'BO 生命周期：Create → Place → Map → Use → Migrate(eviction) → Destroy',
              'TTM eviction：VRAM 满时按 LRU 策略将不活跃 BO 迁移到 GTT/System',
              'amdgpu_ttm.c 是胶水层：连接 GEM ioctl 接口与 TTM 底层内存管理',
            ],
          },
          diagram: {
            title: 'GEM/TTM 内存管理架构与 Buffer Object 迁移',
            content: `GEM/TTM 双框架内存管理

用户空间
──────────────────────────────────────────────────────────
  Mesa / ROCm 应用
  │
  │ DRM_IOCTL_AMDGPU_GEM_CREATE
  │   { size: 4MB, domains: VRAM|GTT }
  │
══╪═══════════════════════════════════════════════════════
  │
内核空间
  ▼
┌─────────────────────────────────────────────────────────┐
│  GEM 层 (drm_gem.c)                                     │
│  ├─ drm_gem_object: handle 管理、引用计数、mmap         │
│  └─ GEM ioctl: CREATE, MMAP, CLOSE, WAIT_IDLE           │
└─────────────────────┬───────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────┐
│  TTM 层 (ttm_bo.c, ttm_resource.c)                      │
│  ├─ ttm_buffer_object: 生命周期、锁、LRU 管理           │
│  ├─ ttm_resource_manager: 每个域的分配器                 │
│  ├─ ttm_bo_validate(): 确保 BO 在指定域中               │
│  └─ ttm_bo_move(): 跨域数据迁移（DMA 或 memcpy）        │
└─────────────────────┬───────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────┐
│  amdgpu TTM 后端 (amdgpu_ttm.c)                         │
│  ├─ amdgpu_bo_move(): 使用 SDMA 引擎做 DMA 搬运        │
│  ├─ amdgpu_ttm_io_mem_reserve(): 映射 VRAM BAR          │
│  └─ amdgpu_ttm_backend_bind(): 绑定 GART 页表           │
└─────────────────────────────────────────────────────────┘

内存域与 BO 迁移：

  ┌──────────────┐      eviction      ┌──────────────┐
  │   VRAM       │ ──────────────────▶ │     GTT      │
  │  (8GB GDDR6) │ ◀────────────────── │(系统内存,可达│
  │  最快,GPU专用│      validation     │ GPU通过GART) │
  │              │                     │              │
  │  BO_A (4MB)  │                     │  BO_C (2MB)  │
  │  BO_B (16MB) │                     │  evicted BO  │
  └──────────────┘                     └──────┬───────┘
        ▲                                     │
        │                                     ▼
        │                              ┌──────────────┐
        │           swap               │   System     │
        └──────────────────────────────│  (主存,CPU用) │
                                       │  CPU mmap    │
                                       └──────────────┘

amdgpu_bo 结构体嵌套：
  struct amdgpu_bo {
      struct ttm_buffer_object  tbo;   ← TTM 层
      //  └─ struct drm_gem_object base; ← GEM 层 (嵌套在 tbo 中)
      struct list_head          shadow_list;
      struct amdgpu_bo_va      *bo_va;    ← GPU 虚拟地址映射
      uint32_t                  preferred_domains;
      uint32_t                  allowed_domains;
  };`,
            caption: 'GEM 提供用户空间 API（handle、mmap），TTM 提供底层内存域管理。当 VRAM 满时，TTM 按 LRU 策略将不活跃的 BO 迁移到 GTT/System（eviction），需要时再迁移回来（validation）。amdgpu_bo 同时包含两层的数据结构。',
          },
          codeWalk: {
            title: 'amdgpu_gem_object_create — 创建 GPU Buffer Object',
            file: 'drivers/gpu/drm/amd/amdgpu/amdgpu_gem.c',
            language: 'c',
            code: `/* amdgpu_gem.c — GEM ioctl 处理：创建 Buffer Object */

int amdgpu_gem_create_ioctl(struct drm_device *dev,
                             void *data,
                             struct drm_file *filp)
{
    struct amdgpu_device *adev = drm_to_adev(dev);
    union drm_amdgpu_gem_create *args = data;
    uint64_t size = args->in.bo_size;
    uint32_t domain = args->in.domains;
    struct amdgpu_bo *bo;
    int r;

    /* 创建 amdgpu_bo（包含 ttm_buffer_object + drm_gem_object） */
    r = amdgpu_bo_create(adev, size,
                          args->in.alignment,
                          domain,       /* VRAM, GTT, or both */
                          args->in.flags,
                          ttm_bo_type_device,
                          NULL, &bo);
    if (r)
        return r;

    /* 为用户空间创建 GEM handle */
    r = drm_gem_handle_create(filp, &bo->tbo.base,
                               &args->out.handle);
    /*
     * drm_gem_handle_create():
     *   1. 在 filp->object_idr 中分配整数 ID
     *   2. 增加 gem_object 的引用计数
     *   3. 返回 handle 给用户空间
     */

    /* drop 创建时的引用，用户空间通过 handle 持有引用 */
    drm_gem_object_put(&bo->tbo.base);

    return r;
}

/* 底层：amdgpu_bo_create 调用 TTM 分配实际内存 */
int amdgpu_bo_create(struct amdgpu_device *adev,
                      unsigned long size, int align,
                      u32 domain, u64 flags,
                      enum ttm_bo_type type,
                      struct dma_resv *resv,
                      struct amdgpu_bo **bo_ptr)
{
    struct amdgpu_bo *bo;
    struct ttm_placement placement;

    bo = kzalloc(sizeof(*bo), GFP_KERNEL);

    /* 设置 preferred 和 allowed 内存域 */
    bo->preferred_domains = domain;
    bo->allowed_domains = domain;
    amdgpu_bo_placement_from_domain(bo, domain);
    /* → 将 AMDGPU_GEM_DOMAIN_VRAM 等翻译为
     *   TTM 的 ttm_place 结构（指定 mem_type） */

    /* 调用 TTM 初始化 BO 并分配物理页面 */
    ttm_bo_init_reserved(&adev->mman.bdev,
                          &bo->tbo, type,
                          &placement,
                          align >> PAGE_SHIFT,
                          false, size, NULL,
                          resv, &amdgpu_bo_destroy);
    /*
     * ttm_bo_init_reserved():
     *   1. 初始化 ttm_buffer_object 结构
     *   2. 调用 ttm_bo_validate() 在指定域分配物理页面
     *   3. BO 以 reserved（锁定）状态返回
     */

    *bo_ptr = bo;
    return 0;
}`,
            annotations: [
              'args->in.domains 可以是 AMDGPU_GEM_DOMAIN_VRAM | AMDGPU_GEM_DOMAIN_GTT（允许多个域）',
              'amdgpu_bo_create 同时初始化 GEM 和 TTM 两层数据结构',
              'amdgpu_bo_placement_from_domain() 将 amdgpu 域标志翻译为 TTM placement 描述',
              'ttm_bo_init_reserved() 调用 ttm_bo_validate() 在 preferred domain 中分配物理页面',
              'drm_gem_handle_create() 返回 per-process 的整数 handle，用户空间据此引用 BO',
              'drm_gem_object_put() 释放创建者的引用——BO 的生命周期由用户空间 handle 管理',
            ],
            explanation: '这段代码展示了 GPU Buffer Object 创建的完整路径：用户空间 ioctl → GEM handle 创建 → amdgpu_bo 分配 → TTM placement 设置 → 物理页面分配。注意 domain 参数如何从用户空间的 AMDGPU_GEM_DOMAIN_VRAM 翻译为 TTM 的 placement 结构——这是 GEM 和 TTM 两层框架协作的关键接口。理解这个创建流程是理解整个 GPU 内存管理的起点。',
          },
          miniLab: {
            title: '监控 GPU Buffer Object 的分配与 VRAM 使用',
            objective: '使用 sysfs 和 debugfs 接口观察 VRAM/GTT 的使用情况，理解 Buffer Object 如何占用 GPU 内存。',
            steps: [
              '查看当前 VRAM 使用量：cat /sys/class/drm/card0/device/mem_info_vram_used',
              '查看 VRAM 总量：cat /sys/class/drm/card0/device/mem_info_vram_total',
              '查看 GTT 使用量：cat /sys/class/drm/card0/device/mem_info_gtt_used',
              '启动一个占用 GPU 内存的程序（如 glxgears），再次查看 VRAM 使用量的变化',
              '查看 TTM BO 统计（如果 debugfs 可用）：cat /sys/kernel/debug/dri/0/amdgpu_vram_mm',
              '对比：运行一个 4K 视频播放器，观察 VRAM 使用量的显著增加（4K framebuffer ≈ 33MB）',
            ],
            expectedOutput: `$ cat /sys/class/drm/card0/device/mem_info_vram_used
285212672    ← ~272MB（桌面环境空闲时）

$ # 启动 glxgears 后
$ cat /sys/class/drm/card0/device/mem_info_vram_used
310378496    ← ~296MB（增加了 ~24MB 用于 framebuffer 和顶点数据）

$ cat /sys/class/drm/card0/device/mem_info_vram_total
8573157376   ← ~8GB VRAM 总量

$ cat /sys/class/drm/card0/device/mem_info_gtt_used
52428800     ← ~50MB GTT 使用中`,
            hint: '如果看不到 debugfs 文件，确保以 root 运行且 debugfs 已挂载。VRAM 使用量不会精确匹配 framebuffer 大小——驱动还会分配命令缓冲区、页表、固件用的 Buffer 等。',
          },
          debugExercise: {
            title: '找出 Buffer Object 泄漏（missing unreference）',
            language: 'c',
            description: '以下驱动代码在错误路径上忘记释放 Buffer Object 的引用，导致每次操作失败时泄漏一个 BO，最终 VRAM 耗尽。',
            question: '找出 BO 泄漏的位置并修复。',
            buggyCode: `int my_submit_work(struct amdgpu_device *adev,
                    uint64_t size)
{
    struct amdgpu_bo *cmd_bo = NULL;
    struct amdgpu_bo *data_bo = NULL;
    int r;

    /* 分配命令 BO */
    r = amdgpu_bo_create(adev, 4096, PAGE_SIZE,
        AMDGPU_GEM_DOMAIN_GTT, 0,
        ttm_bo_type_kernel, NULL, &cmd_bo);
    if (r)
        return r;

    /* 分配数据 BO */
    r = amdgpu_bo_create(adev, size, PAGE_SIZE,
        AMDGPU_GEM_DOMAIN_VRAM, 0,
        ttm_bo_type_kernel, NULL, &data_bo);
    if (r)
        return r;  /* BUG: cmd_bo 已分配但未释放！ */

    /* 使用两个 BO ... */
    r = do_gpu_work(adev, cmd_bo, data_bo);
    if (r)
        goto err_work;  /* BUG: 两个 BO 都未释放！ */

    /* 成功路径：释放 BO */
    amdgpu_bo_unref(&data_bo);
    amdgpu_bo_unref(&cmd_bo);
    return 0;

err_work:
    /* 忘记释放 cmd_bo 和 data_bo */
    return r;
}`,
            hint: '每个 amdgpu_bo_create 成功后都持有一个引用。所有退出路径（包括错误路径）都必须调用 amdgpu_bo_unref() 释放引用。使用 goto 统一错误处理是内核代码的标准模式。',
            answer: '有两处泄漏：（1）第二个 amdgpu_bo_create 失败时（data_bo 分配失败），直接 return r 但没有释放已分配的 cmd_bo；（2）do_gpu_work 失败时跳转到 err_work，但 err_work 标签下没有释放任何 BO。修复方案：使用内核标准的 goto 链式错误处理：if (r) goto err_data_bo; 在 data_bo 分配失败时跳转，err_work 释放 data_bo 后 fall through 到 err_data_bo 释放 cmd_bo。正确代码：err_work: amdgpu_bo_unref(&data_bo); err_data_bo: amdgpu_bo_unref(&cmd_bo); return r; 这种"反向释放"模式确保资源按分配的逆序释放。BO 泄漏是 GPU 驱动中最常见的 Bug 之一——在压力测试中，每次操作泄漏几 KB 的 BO 会在几小时内耗尽所有 VRAM，导致后续分配失败和 GPU hang。',
          },
          interviewQ: {
            question: '解释 GEM 和 TTM 在 DRM 内存管理中的角色和区别。为什么 amdgpu 需要 TTM 而不是只用 GEM？',
            difficulty: 'hard',
            hint: '关键区别在于 VRAM 管理：GEM 假设 GPU 使用系统内存（适合集成 GPU），TTM 支持独立 VRAM + 对象迁移 + eviction（适合离散 GPU）。amdgpu 作为离散 GPU 驱动需要管理 VRAM↔GTT 的数据搬运。',
            answer: 'GEM 和 TTM 是 DRM 的两个内存管理框架，解决不同层次的问题：GEM（Graphics Execution Manager）提供 Buffer Object 的用户空间 API——通过 GEM handle 引用 BO、通过 mmap 让 CPU 访问、通过引用计数管理生命周期。GEM 最初为 Intel i915（集成 GPU，使用系统内存）设计，假设所有内存是同质的。TTM（Translation Table Manager）在 GEM 之上为离散 GPU 增加了三个关键能力：（1）内存域（Memory Placement）——BO 可以存在于 VRAM（GPU 专用，带宽最高）、GTT（系统内存中 GPU 可通过 GART 访问的部分）或 System（普通系统内存）。（2）对象迁移——当需要将 BO 从 System 移到 VRAM（GPU 即将使用）或从 VRAM 移到 GTT（VRAM 空间不足），TTM 协调 DMA 数据搬运。（3）内存压力处理（Eviction）——当 VRAM 满时，TTM 按 LRU 策略选择 BO 迁移到 GTT/System，类似虚拟内存的页面置换。amdgpu 必须使用 TTM 因为 AMD 离散 GPU 有独立 VRAM（8GB GDDR6），驱动需要在 VRAM 和系统内存之间高效搬运数据、处理 VRAM 压力、管理 GART 页表。GEM 层仍然用于向用户空间暴露统一的 API——用户不需要关心 BO 当前在 VRAM 还是 GTT，这由 TTM 透明管理。',
            amdContext: '这是 AMD 面试中常见的内存管理基础题。回答时强调 amdgpu 的 "GEM 做门面，TTM 做后端" 的架构设计，展示你理解为什么离散 GPU 需要比集成 GPU 更复杂的内存管理。',
          },
        },

        // ── Lesson 4.2.2 ──────────────────────────────────────
        {
          id: '4-2-2',
          number: '4.2.2',
          title: 'DMA-BUF：跨设备 Buffer 共享',
          titleEn: 'DMA-BUF: Cross-Device Buffer Sharing',
          duration: 20,
          difficulty: 'advanced',
          tags: ['DMA-BUF', 'prime', 'zero-copy', 'exporter', 'importer', 'scatter-gather'],
          concept: {
            summary: 'DMA-BUF 是 Linux 内核的跨设备 Buffer 共享协议。它允许一个设备（exporter，如 GPU）将内存 Buffer 导出为一个文件描述符（fd），另一个设备（importer，如视频解码器或另一个 GPU）通过该 fd 导入并直接访问同一块物理内存——实现零拷贝共享。在 DRM 中，prime_handle_to_fd 导出 GEM BO，prime_fd_to_handle 导入。',
            explanation: [
              '想象一个典型场景：你在播放 4K 视频。视频解码器（VCN 硬件）解码出一帧 YUV 数据到一块 VRAM Buffer 中，然后 GPU 需要将这帧数据作为纹理渲染到桌面上。如果没有 DMA-BUF，你需要：（1）解码器将数据从 VRAM 复制到系统内存；（2）GPU 从系统内存读取数据到 VRAM。两次 PCIe 数据传输，延迟和带宽浪费巨大。DMA-BUF 让解码器直接将 VRAM 中的 Buffer 共享给 GPU——零拷贝，两个硬件单元访问同一块物理内存。',
              'DMA-BUF 的核心是 exporter/importer 模型。Exporter 是 Buffer 的所有者——它分配内存、管理物理页面的生命周期、提供 scatter-gather table（描述 Buffer 的物理页面分布）。Importer 是 Buffer 的使用者——它通过 DMA-BUF fd 获取 scatter-gather table，将这些物理页面映射到自己的设备地址空间。Exporter 必须实现 dma_buf_ops 回调：.map_dma_buf（提供 scatter-gather table）、.unmap_dma_buf（释放映射）、.release（Buffer 最终释放）、.begin_cpu_access / .end_cpu_access（CPU 访问时的缓存一致性维护）。',
              '在 DRM 中，DMA-BUF 通过 PRIME（Portable Render Interface for Multi-device Extension）接口暴露给用户空间。导出：用户空间调用 DRM_IOCTL_PRIME_HANDLE_TO_FD，将一个 GEM handle 转换为 DMA-BUF fd。导入：用户空间调用 DRM_IOCTL_PRIME_FD_TO_HANDLE，将收到的 DMA-BUF fd 转换为本设备的 GEM handle。一旦有了 GEM handle，就可以像使用本地 BO 一样使用这块共享内存。',
              'scatter-gather table（sg_table）是 DMA-BUF 共享的关键数据结构。一个 GPU Buffer 的物理页面通常不是连续的——它可能由数千个分散的 4KB 页面组成。sg_table 列出了所有这些页面的物理地址和长度，让 importer 的 DMA 引擎知道如何访问完整的 Buffer。IOMMU/GART 硬件将这些分散的物理页面映射到设备的连续虚拟地址空间，对 GPU 来说 Buffer 看起来是连续的。',
              '零拷贝是 DMA-BUF 的核心价值。在 Wayland 合成器中，每个窗口的 framebuffer 由该应用的 GPU 上下文渲染到一块 Buffer 中，然后通过 DMA-BUF 共享给合成器的 GPU 上下文。合成器将多个窗口的 Buffer 合成到最终的 scanout framebuffer。整个过程中，像素数据始终留在 VRAM 中，从未经过 CPU 或系统内存——这就是现代 Linux 桌面高效的原因。',
              '在 amdgpu 中，DMA-BUF 导出由 amdgpu_gem_prime_export()（实际上使用 DRM 核心的 drm_gem_prime_export）处理，它创建 dma_buf 对象并关联 amdgpu_dmabuf_ops 回调。导入由 amdgpu_gem_prime_import() 处理，它从 DMA-BUF fd 获取 sg_table，创建一个新的 amdgpu_bo 包装这些共享的物理页面。如果导入的 DMA-BUF 来自同一个 amdgpu 设备，驱动会直接复用原来的 amdgpu_bo（self-import 优化），避免不必要的 sg_table 创建。',
            ],
            keyPoints: [
              'DMA-BUF 是 Linux 跨设备零拷贝 Buffer 共享协议：exporter 分配内存，importer 共享访问',
              'DRM PRIME 接口：prime_handle_to_fd（导出 GEM → fd）、prime_fd_to_handle（导入 fd → GEM）',
              'scatter-gather table (sg_table) 描述 Buffer 的分散物理页面，importer 据此设置 DMA 映射',
              'dma_buf_ops 回调：.map_dma_buf, .unmap_dma_buf, .release, .begin/end_cpu_access',
              'Wayland 合成器：每个窗口通过 DMA-BUF 共享 framebuffer 给 compositor，零拷贝合成',
              'amdgpu self-import 优化：同设备 DMA-BUF 直接复用原 BO，跳过 sg_table',
            ],
          },
          diagram: {
            title: 'DMA-BUF 跨设备共享：从 GPU 到视频解码器',
            content: `DMA-BUF 跨设备 Buffer 共享流程

场景：Wayland 合成器 + 视频播放器

视频播放器进程                           Wayland 合成器进程
───────────────                           ───────────────────

1. VCN 解码视频帧到 BO                   
   amdgpu_bo (VRAM)                       
   物理页面: [0x1000, 0x2000, ...]        
        │                                 
2. 导出 DMA-BUF fd                        
   ioctl(gpu_fd,                          
     PRIME_HANDLE_TO_FD, &args)           
        │                                 
        │  fd = 42 (DMA-BUF 文件描述符)   
        │                                 
        │  ┌─────────────────────┐        
        │  │  struct dma_buf     │        
        │  │  ├─ ops: amdgpu_*  │        
        │  │  ├─ size: 8294400  │ (1920×1080×4)
        │  │  ├─ file: fd=42    │        
        │  │  └─ priv: amdgpu_bo│        
        │  └─────────────────────┘        
        │                                 
3. 通过 Unix socket 传递 fd ──────────▶  4. 收到 fd=42
   sendmsg(SCM_RIGHTS)                      │
                                             │
                                          5. 导入 DMA-BUF
                                             ioctl(gpu_fd,
                                               PRIME_FD_TO_HANDLE,
                                               &args)
                                             │
                                             ▼
                                          6. 获得本地 GEM handle
                                             handle = 17
                                             │
                                             ▼
                                          7. 绑定为纹理渲染
                                             GPU 直接读取同一块
                                             物理页面 [0x1000, ...]
                                             零拷贝！

物理内存视角：
┌──────────────────────────────────────────────────────┐
│  VRAM                                                 │
│                                                       │
│  ┌─────────┐                                          │
│  │ 视频帧   │ ← VCN 解码输出 (exporter 的 BO)        │
│  │ 1920×1080│ ← 同时也是合成器的纹理 (importer 的 BO)│
│  │ NV12     │                                         │
│  └─────────┘                                          │
│  同一块物理内存，两个进程通过不同 BO 访问              │
│  数据从未被复制 — 这就是零拷贝                         │
└──────────────────────────────────────────────────────┘

DMA-BUF sg_table（scatter-gather 表）：
  ┌────────────────────────────────────────┐
  │  entry[0]: phys=0x80001000, len=4096   │
  │  entry[1]: phys=0x80005000, len=4096   │
  │  entry[2]: phys=0x80002000, len=8192   │
  │  ...                                    │
  │  → Importer 的 IOMMU/GART 将这些分散   │
  │    页面映射为设备连续地址空间            │
  └────────────────────────────────────────┘`,
            caption: 'DMA-BUF 实现零拷贝的完整流程。视频解码器（VCN）将帧数据解码到 VRAM，通过 DMA-BUF fd 共享给合成器，合成器直接将同一块 VRAM 数据作为纹理渲染——数据从未离开 VRAM。',
          },
          codeWalk: {
            title: 'amdgpu PRIME export — 导出 DMA-BUF',
            file: 'drivers/gpu/drm/amd/amdgpu/amdgpu_dma_buf.c',
            language: 'c',
            code: `/* amdgpu_dma_buf.c — DMA-BUF 导出/导入实现 */

/* dma_buf_ops 回调：将 amdgpu BO 的物理页面映射到 importer */
static struct sg_table *
amdgpu_gem_map_dma_buf(struct dma_buf_attachment *attach,
                        enum dma_data_direction dir)
{
    struct drm_gem_object *obj = attach->dmabuf->priv;
    struct amdgpu_bo *bo = gem_to_amdgpu_bo(obj);
    struct sg_table *sgt;
    long r;

    /* 确保 BO 在 GTT 域（importer 需要通过 PCIe 访问） */
    r = amdgpu_bo_pin(bo, AMDGPU_GEM_DOMAIN_GTT);
    /*
     * 如果 BO 当前在 VRAM 且 importer 是另一个设备，
     * 需要迁移到 GTT（系统内存）使其可通过 PCIe 访问。
     * 如果 importer 是同一个 GPU，VRAM 直接可访问。
     */

    /* 获取 BO 的物理页面散布表 */
    sgt = drm_prime_pages_to_sg(obj->dev,
                                 bo->tbo.ttm->pages,
                                 bo->tbo.ttm->num_pages);

    /* 建立 DMA 映射（设置 IOMMU/GART 映射） */
    dma_map_sgtable(attach->dev, sgt, dir, 0);
    /*
     * dma_map_sgtable() 做了两件事：
     *   1. 如果有 IOMMU：将物理页面映射到 IOMMU 地址空间
     *   2. CPU 缓存同步：确保设备能看到最新数据
     */

    return sgt;
}

/* 完整的 dma_buf_ops 结构 */
static const struct dma_buf_ops amdgpu_dmabuf_ops = {
    .attach         = amdgpu_gem_prime_attach,
    .map_dma_buf    = amdgpu_gem_map_dma_buf,
    .unmap_dma_buf  = amdgpu_gem_unmap_dma_buf,
    .release        = drm_gem_dmabuf_release,
    .begin_cpu_access = amdgpu_gem_begin_cpu_access,
    .end_cpu_access = amdgpu_gem_end_cpu_access,
    .mmap           = drm_gem_dmabuf_mmap,
    .vmap           = drm_gem_dmabuf_vmap,
    .vunmap         = drm_gem_dmabuf_vunmap,
};

/* 导入路径：从 DMA-BUF fd 创建本地 BO */
struct drm_gem_object *
amdgpu_gem_prime_import(struct drm_device *dev,
                         struct dma_buf *dma_buf)
{
    struct drm_gem_object *obj;

    /* self-import 优化：如果 DMA-BUF 来自同一个 amdgpu */
    if (dma_buf->ops == &amdgpu_dmabuf_ops) {
        obj = dma_buf->priv;
        if (obj->dev == dev) {
            /* 同一设备 — 直接复用原 BO，增加引用即可 */
            drm_gem_object_get(obj);
            return obj;
        }
    }

    /* 不同设备 — 创建 import BO 包装共享页面 */
    return drm_gem_prime_import(dev, dma_buf);
}`,
            annotations: [
              'amdgpu_gem_map_dma_buf 将 BO 的物理页面通过 sg_table 暴露给 importer',
              'amdgpu_bo_pin() 确保 BO 不会被 evict（迁移），保证 importer 访问期间地址稳定',
              'drm_prime_pages_to_sg() 将 TTM 管理的物理页面数组转为 scatter-gather table',
              'dma_map_sgtable() 设置 IOMMU 映射和缓存一致性——设备间共享的关键',
              'self-import 优化：同设备导出的 DMA-BUF 直接复用原 BO，避免额外 sg_table 开销',
              'begin/end_cpu_access 回调确保 CPU 读取共享 Buffer 时看到的是设备写入的最新数据',
            ],
            explanation: 'DMA-BUF 导出的核心是 amdgpu_gem_map_dma_buf()——它将 amdgpu BO 的物理页面打包为 sg_table 供 importer 使用。注意 amdgpu_bo_pin() 调用：导出期间 BO 必须被 pin 住（不允许迁移），否则 importer 正在访问的物理页面可能被 TTM eviction 移走，导致数据损坏。self-import 优化展示了内核代码的效率意识——同设备共享不需要走完整的 DMA-BUF 协议。',
          },
          miniLab: {
            title: '检查 /proc/pid/fdinfo 中的 DMA-BUF 引用',
            objective: '通过 /proc 文件系统观察 DMA-BUF 在实际运行中的使用情况，理解零拷贝共享在桌面系统中的普遍性。',
            steps: [
              '找到 Wayland compositor 的进程 ID：pidof gnome-shell 或 pidof kwin_wayland 或 pidof sway',
              '查看其打开的 DMA-BUF 文件描述符：ls -la /proc/<pid>/fd/ | grep dmabuf',
              '查看 DMA-BUF 详细信息：cat /proc/<pid>/fdinfo/<fd_num>（查找包含 "drm-driver" 的条目）',
              '统计系统中所有 DMA-BUF 的总大小：cat /sys/kernel/debug/dma_buf/bufinfo（需要 root）',
              '启动一个视频播放器（如 mpv），再次检查 DMA-BUF 数量的增加',
              '对比播放前后 /sys/kernel/debug/dma_buf/bufinfo 的变化，确认视频帧使用 DMA-BUF 共享',
            ],
            expectedOutput: `$ cat /proc/$(pidof gnome-shell)/fdinfo/14
pos:    0
flags:  02000002
mnt_id: 10
ino:    1234
drm-driver:     amdgpu
drm-pdev:       0000:03:00.0
drm-total-vram: 8176 MiB
drm-shared-vram:        48 MiB   ← 与其他进程共享的 VRAM
drm-total-gtt:  128 MiB

$ sudo cat /sys/kernel/debug/dma_buf/bufinfo
size    flags   mode    count   exp_name
8294400 000002  00000007 2      amdgpu  ← 8MB 帧缓冲，2个引用者
4194304 000002  00000007 3      amdgpu  ← 4MB buffer，3个引用者`,
            hint: '如果 /proc/pid/fdinfo 没有 drm-* 字段，你的内核版本可能较旧。Linux 5.15+ 在 fdinfo 中添加了 DRM 内存统计信息。也可以用 sudo cat /sys/kernel/debug/dma_buf/bufinfo 查看全局 DMA-BUF 信息。',
          },
          debugExercise: {
            title: '诊断 DMA-BUF import 失败：size mismatch',
            language: 'c',
            description: '一个视频播放器通过 DMA-BUF 将解码帧共享给 GPU 渲染。import 成功但渲染结果出现花屏（garbage pixels）。dmesg 中没有明显错误。',
            question: '什么导致了花屏？提示：检查 exporter 和 importer 对 Buffer 尺寸的假设。',
            buggyCode: `/* 视频解码器（exporter）— 分配解码帧 Buffer */
int alloc_decode_buffer(int gpu_fd, uint32_t *handle)
{
    struct drm_amdgpu_gem_create args = {
        .in = {
            /* 1920x1080 NV12 格式: Y plane + UV plane */
            /* NV12: height * stride * 1.5 */
            .bo_size = 1920 * 1080 * 3 / 2,  /* 3110400 bytes */
            .domains = AMDGPU_GEM_DOMAIN_VRAM,
        }
    };
    ioctl(gpu_fd, DRM_IOCTL_AMDGPU_GEM_CREATE, &args);
    *handle = args.out.handle;

    /* 导出为 DMA-BUF */
    struct drm_prime_handle prime = {
        .handle = args.out.handle,
        .flags = DRM_RDWR,
    };
    ioctl(gpu_fd, DRM_IOCTL_PRIME_HANDLE_TO_FD, &prime);
    return prime.fd;
}

/* GPU 渲染器（importer）— 使用解码帧作为纹理 */
void use_as_texture(int gpu_fd, int dmabuf_fd)
{
    struct drm_prime_handle prime = {
        .fd = dmabuf_fd,
    };
    ioctl(gpu_fd, DRM_IOCTL_PRIME_FD_TO_HANDLE, &prime);

    /* BUG: 假设 Buffer 是 XRGB8888 格式 */
    /* XRGB8888: width * height * 4 = 8294400 bytes */
    /* 但实际 Buffer 只有 3110400 bytes (NV12) */
    bind_texture(prime.handle, 1920, 1080,
                 DRM_FORMAT_XRGB8888);  /* 格式不匹配！ */
    /* GPU 会读取超出 Buffer 边界的内存 → 花屏 */
}`,
            hint: 'DMA-BUF 只传递物理内存引用，不传递格式信息（宽度、高度、像素格式、stride）。exporter 和 importer 必须通过其他途径（如 Wayland 协议）约定 Buffer 的格式参数。',
            answer: '问题：exporter 分配的是 NV12 格式的 Buffer（1920×1080×1.5 = 3,110,400 bytes），但 importer 假设它是 XRGB8888 格式（1920×1080×4 = 8,294,400 bytes）。XRGB8888 每像素 4 字节，NV12 每像素 1.5 字节——importer 期望的 Buffer 是实际大小的 2.67 倍。当 GPU 作为纹理读取时，它会超出 Buffer 边界读取未初始化的 VRAM 内容，显示为花屏。DMA-BUF 协议本身不传递像素格式信息——它只是一块"raw memory"的共享句柄。格式信息必须通过带外通道协商：在 Wayland 中，wl_buffer 创建时客户端声明 format、width、height、stride；在 V4L2 中，VIDIOC_S_FMT 设置格式。修复：importer 应该使用正确的格式 DRM_FORMAT_NV12，或者 exporter 应该分配 XRGB8888 格式的 Buffer（如果两端约定使用 XRGB）。关键教训：DMA-BUF 共享物理内存，元数据（格式、尺寸）必须通过其他协议同步。',
          },
          interviewQ: {
            question: '解释 DMA-BUF 协议的 exporter/importer 模型。在 Wayland 桌面环境中，DMA-BUF 如何实现零拷贝的窗口合成？',
            difficulty: 'hard',
            hint: '描述 exporter 的职责（分配内存、提供 sg_table、管理生命周期）和 importer 的职责（通过 sg_table 建立 DMA 映射）。在 Wayland 场景中，解释窗口内容如何从应用的 GPU 上下文零拷贝传递到合成器的 GPU 上下文。',
            answer: 'DMA-BUF exporter/importer 模型：Exporter 是 Buffer 的所有者，负责（1）分配物理内存；（2）实现 dma_buf_ops 回调（.map_dma_buf 提供 scatter-gather table，.release 释放内存）；（3）确保 importer 访问期间内存有效（pin 住 BO 防止 eviction）。Importer 是 Buffer 的使用者，通过 DMA-BUF fd（（1）attach 到 exporter 的 dma_buf；（2）调用 .map_dma_buf 获取 sg_table（物理页面列表）；（3）将物理页面映射到自己的设备地址空间（通过 IOMMU/GART）；（4）使用完毕后 unmap 并 detach。在 Wayland 零拷贝合成中：（1）应用进程的 GPU 上下文渲染窗口内容到一块 VRAM Buffer；（2）应用通过 DRM PRIME（prime_handle_to_fd）将 BO 导出为 DMA-BUF fd；（3）fd 通过 Wayland 协议（wl_drm 或 linux-dmabuf-v1）和 Unix socket（SCM_RIGHTS）传递给合成器；（4）合成器通过 prime_fd_to_handle 将 DMA-BUF fd 导入为本地 GEM handle；（5）合成器将 handle 绑定为 GPU 纹理，合成所有窗口到 scanout framebuffer；（6）整个过程中像素数据始终在 VRAM 中，从未经过 CPU 或系统内存——这就是零拷贝。关键细节：同 GPU 的 self-import 直接复用原 BO（引用计数+1），不需要 sg_table；不同设备间共享需要 BO 在 GTT/System 域（可通过 PCIe 访问），性能不如 VRAM 内共享。',
            amdContext: 'DMA-BUF 是 Linux 图形栈的基石之一。AMD 面试中展示你理解从 Wayland 协议到 DRM PRIME 到内核 dma_buf_ops 的完整路径，以及零拷贝对桌面性能的重要性，会让面试官认为你有系统级的视野。',
          },
        },
      ],
    },
  ],
  completionChecklist: [
    '理解 DRM 核心架构：drm_device / drm_driver / ioctl 分发机制',
    '能描述 KMS 显示管线：Plane → CRTC → Encoder → Connector 及各自职责',
    '理解 Atomic Mode Setting 的两阶段提交（check → commit）和 test-only 模式',
    '掌握 GEM 和 TTM 的角色区别：GEM 做用户空间接口，TTM 做 VRAM 域管理和 eviction',
    '理解 Buffer Object 生命周期：create → place → map → use → migrate → destroy',
    '能解释 DMA-BUF 的 exporter/importer 模型和零拷贝原理',
    '知道 amdgpu 中的对应实现：amdgpu_kms_driver, amdgpu_dm, amdgpu_ttm, amdgpu_dma_buf',
    '能使用 sysfs/debugfs/modetest/strace 工具观察 DRM 子系统的运行状态',
    '能够讲清一次完整的显示或 BO 路径：从用户态请求到 DRM 状态变化，再到硬件可见结果',
  ],
};
