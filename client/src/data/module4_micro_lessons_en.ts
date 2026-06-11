// ============================================================
// AMD Linux Driver Learning Platform - Module 4 Micro-Lessons (English)
// Module 4: DRM Subsystem (Graphics Driver & DRM Subsystem)
// 5 lessons in 2 groups, ~15-20 min each, total ~60h curriculum
// ============================================================
import type { MicroLessonModule } from './micro_lesson_types';

export const module4MicroLessonsEn: MicroLessonModule = {
  moduleId: 'drm',
  groups: [
    // ════════════════════════════════════════════════════════════
    // Group 4.1: DRM Core & KMS (DRM Core & Display Pipeline)
    // ════════════════════════════════════════════════════════════
    {
      id: '4-1',
      number: '4.1',
      title: 'DRM Core & Display Pipeline',
      titleEn: 'DRM Core & KMS',
      icon: '🖥️',
      description: 'Dive deep into the core DRM framework objects drm_device and drm_driver, master the roles of CRTC, Encoder, Connector, and Plane in the KMS display pipeline, and understand how Atomic Mode Setting works.',
      lessons: [
        // ── Lesson 4.1.1 ──────────────────────────────────────
        {
          id: '4-1-1',
          number: '4.1.1',
          title: 'DRM Core Architecture: drm_device & drm_driver',
          titleEn: 'DRM Core Architecture: drm_device & drm_driver',
          duration: 20,
          difficulty: 'advanced',
          tags: ['DRM', 'drm_device', 'drm_driver', 'ioctl', 'dev-dri'],
          concept: {
            summary: 'DRM (Direct Rendering Manager) is the common framework for all GPU drivers in the Linux kernel. Each GPU is represented by a drm_device instance, while the drm_driver struct defines all callback functions for that GPU driver. User space opens the device via /dev/dri/card0, and the kernel DRM core dispatches requests to the specific driver\'s handler functions through drm_ioctl().',
            explanation: [
              'The DRM subsystem lives under drivers/gpu/drm/ and is the kernel-layer foundation of the Linux graphics stack. It provides uniform infrastructure for all GPU drivers: device file management (/dev/dri/card0, /dev/dri/renderD128), ioctl dispatch, GEM memory management interfaces, KMS display management, and sysfs/debugfs exposure. Different GPU drivers (amdgpu, i915, nouveau) all register with the DRM framework, leveraging the common functionality it provides and only implementing the hardware-specific parts.',
              'drm_device is the most central data structure in the DRM framework, representing a single GPU instance in the system. It is allocated by drm_dev_alloc() and contains: dev (pointer to the underlying struct device), driver (pointer to drm_driver), primary and render (drm_minor nodes pointing to /dev/dri/card0 and renderD128), mode_config (all KMS display objects: CRTC, Encoder, Connector, etc.), and vma_offset_manager (virtual address management for GEM objects). The amdgpu driver embeds drm_device inside its larger amdgpu_device struct and converts between the two using the container_of macro.',
              'The drm_driver struct is the interface through which a driver registers its capabilities with the DRM framework. It contains a series of callback function pointers: .load (deprecated; initialization is now managed via devm), .open / .postclose (callbacks when user space opens/closes the device file), .gem_create_object (callback for creating a GEM Buffer Object), .dumb_create / .dumb_map_offset (allocate "dumb" buffers for framebuffers), and .ioctls / .num_ioctls (driver-specific ioctl table). The amdgpu drm_driver instance is amdgpu_kms_driver, defined in amdgpu_drv.c.',
              'ioctl dispatch is the core mechanism of the DRM framework. When user space calls ioctl(fd, DRM_IOCTL_AMDGPU_CS, &args), the kernel VFS layer forwards the call to drm_ioctl() (drm_ioctl.c). drm_ioctl() first checks the ioctl number: if it is defined by the DRM core (such as DRM_IOCTL_VERSION or DRM_IOCTL_GEM_CLOSE), the DRM core handles it directly; if it is driver-specific (number >= DRM_COMMAND_BASE), it looks up the drm_driver.ioctls[] table and dispatches to the driver\'s handler. amdgpu defines approximately 20 driver-specific ioctls (AMDGPU_CS, AMDGPU_GEM_CREATE, AMDGPU_INFO, etc.).',
              'The device files under /dev/dri/ are the entry points through which user space accesses the GPU. card0 is the "master" node with KMS privileges (the ability to set display modes) and is typically opened by Xorg/Wayland compositors. renderD128 is the "render" node with only rendering and compute permissions (no KMS), which ordinary applications (such as games) use to access the GPU. This separation ensures that regular users can leverage GPU rendering without accidentally changing display settings.',
            ],
            keyPoints: [
              'drm_device represents a single GPU instance, created by drm_dev_alloc(), and contains device nodes, mode_config, etc.',
              'drm_driver defines driver callbacks: .open, .postclose, .gem_create_object, .dumb_create, .ioctls',
              'amdgpu embeds drm_device inside amdgpu_device and converts between them using the container_of macro',
              'drm_ioctl() dispatches to either DRM core handlers or driver-specific handlers based on the ioctl number',
              '/dev/dri/card0 (master) has KMS privileges; /dev/dri/renderD128 (render) has only rendering permissions',
              'amdgpu defines approximately 20 driver-specific ioctls (DRM_COMMAND_BASE + offset)',
            ],
          },
          diagram: {
            title: 'DRM Core Architecture & ioctl Dispatch Path',
            content: `DRM Core Architecture: ioctl Dispatch from User Space to Hardware Driver

User Space
─────────────────────────────────────────────────────────
  Mesa / libdrm / Wayland compositor
       │
       │  ioctl(fd, DRM_IOCTL_AMDGPU_CS, &args)
       │  fd = open("/dev/dri/renderD128")
       │
═══════╪═══════ Syscall boundary (Ring 3 → Ring 0) ══════
       │
Kernel Space
       ▼
  VFS: file_operations.unlocked_ioctl
       │
       ▼
  drm_ioctl()                        (drivers/gpu/drm/drm_ioctl.c)
  ├─ Parse ioctl number: cmd = _IOC_NR(nr)
  ├─ cmd < DRM_COMMAND_BASE ?
  │   ├─ YES → DRM core ioctl table        ┌──────────────────────┐
  │   │   drm_ioctls[cmd]                  │ DRM_IOCTL_VERSION    │
  │   │                                    │ DRM_IOCTL_GEM_CLOSE  │
  │   │                                    │ DRM_IOCTL_MODE_*     │
  │   │                                    └──────────────────────┘
  │   │
  │   └─ NO → Driver-specific ioctl table  ┌──────────────────────┐
  │       drm_driver.ioctls                │ AMDGPU_GEM_CREATE    │
  │       [cmd - DRM_COMMAND_BASE]         │ AMDGPU_CS            │
  │                                        │ AMDGPU_INFO          │
  │                                        │ AMDGPU_WAIT_CS       │
  │                                        │ AMDGPU_VM            │
  │                                        └──────────┬───────────┘
  │                                                   │
  └───────────────────────────────────────────────────┘
                      │
                      ▼
  amdgpu driver handlers (amdgpu_kms.c, amdgpu_gem.c, ...)
                      │
                      ▼
  amdgpu_device (embeds drm_device)
  ┌───────────────────────────────────────────────────┐
  │  struct amdgpu_device {                           │
  │      struct drm_device        ddev;  ← DRM core  │
  │      struct amdgpu_ring       gfx_ring[...];      │
  │      struct amdgpu_vm_manager vm_manager;         │
  │      struct amdgpu_gmc        gmc;   ← VRAM/GTT  │
  │      void __iomem            *rmmio; ← reg BAR   │
  │      ...                                          │
  │  };                                               │
  └───────────────────────────────────────────────────┘`,
            caption: 'The complete path of DRM ioctl dispatch. The DRM core handles generic operations (VERSION, GEM_CLOSE, MODE_*), while driver-specific operations (AMDGPU_CS, AMDGPU_GEM_CREATE) are completed by amdgpu\'s own handler functions.',
          },
          codeWalk: {
            title: 'amdgpu drm_driver Registration & ioctl Table',
            file: 'drivers/gpu/drm/amd/amdgpu/amdgpu_drv.c',
            language: 'c',
            code: `/* amdgpu_drv.c — amdgpu drm_driver definition */

static const struct drm_driver amdgpu_kms_driver = {
    .driver_features =
        DRIVER_ATOMIC |         /* Supports Atomic Mode Setting */
        DRIVER_GEM |            /* Supports GEM memory management */
        DRIVER_RENDER |         /* Supports renderD128 node */
        DRIVER_MODESET |        /* Supports KMS display pipeline */
        DRIVER_SYNCOBJ |        /* Supports sync object synchronization */
        DRIVER_SYNCOBJ_TIMELINE, /* Supports timeline syncobj */

    .open = amdgpu_driver_open_kms,
    .postclose = amdgpu_driver_postclose_kms,
    .lastclose = amdgpu_driver_lastclose_kms,

    /* GEM callbacks */
    .gem_prime_import = amdgpu_gem_prime_import,

    /* Framebuffer dumb buffer */
    .dumb_create = amdgpu_mode_dumb_create,
    .dumb_map_offset = amdgpu_mode_dumb_mmap,

    /* Driver-specific ioctl table */
    .ioctls = amdgpu_ioctls_kms,
    .num_ioctls = ARRAY_SIZE(amdgpu_ioctls_kms),

    .fops = &amdgpu_driver_kms_fops,
    .name = "amdgpu",
    .desc = "AMD GPU",
    .major = KMS_DRIVER_MAJOR,
    .minor = KMS_DRIVER_MINOR,
    .patchlevel = KMS_DRIVER_PATCHLEVEL,
};

/* amdgpu driver-specific ioctl dispatch table */
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
    /* ... approximately 20 ioctls total ... */
};

/* Register drm_device in the probe function */
static int amdgpu_pci_probe(struct pci_dev *pdev,
                             const struct pci_device_id *ent)
{
    struct drm_device *ddev;
    struct amdgpu_device *adev;

    /* Allocate drm_device + amdgpu_device */
    adev = devm_drm_dev_alloc(&pdev->dev,
                               &amdgpu_kms_driver,
                               struct amdgpu_device,
                               ddev);
    /* adev->ddev is initialized as drm_device
     * adev->ddev.dev = &pdev->dev
     * adev->ddev.driver = &amdgpu_kms_driver
     */

    ddev = &adev->ddev;

    /* Initialize GPU hardware */
    amdgpu_device_init(adev, flags);

    /* Register DRM device — creates /dev/dri/card0, renderD128 */
    drm_dev_register(ddev, ent->driver_data);
    return 0;
}`,
            annotations: [
              'DRIVER_ATOMIC | DRIVER_GEM | DRIVER_RENDER | DRIVER_MODESET declares the DRM feature subsets the driver supports',
              '.open / .postclose are called each time user space opens/closes /dev/dri/*, managing per-file context',
              '.ioctls = amdgpu_ioctls_kms registers the driver-specific ioctl table; the DRM core uses it to dispatch requests',
              'The DRM_RENDER_ALLOW flag indicates this ioctl can be called via the renderD128 node (no master privilege required)',
              'devm_drm_dev_alloc allocates both drm_device and the outer amdgpu_device simultaneously; lifetime is managed by devres',
              'drm_dev_register() creates device nodes and registers the drm_device with the DRM core subsystem',
            ],
            explanation: 'This code shows how amdgpu registers itself with the DRM framework. amdgpu_kms_driver acts like a "capability manifest" — it tells the DRM core "I support Atomic Mode Setting, GEM memory, render nodes, and KMS display," and provides handler functions for each capability. When user space issues an ioctl, the DRM core looks up the amdgpu_ioctls_kms[] table, finds the corresponding handler (e.g., amdgpu_cs_ioctl), and calls it. Understanding this registration mechanism is the key to understanding the entire DRM framework.',
          },
          miniLab: {
            title: 'Inspect DRM Device Nodes & Driver Info',
            objective: 'Use sysfs and libdrm tools to view DRM device information and understand how drm_device appears to user space.',
            steps: [
              'List all DRM device nodes: ls -la /dev/dri/ (you should see card0, renderD128, etc.)',
              'View DRM version info: cat /sys/class/drm/card0/device/driver/module/version, or run sudo drmdevice -v (if libdrm-tests is installed)',
              'Use libdrm to view driver name and version: write a small program or use python3 -c "import fcntl,struct,os; fd=os.open(\'/dev/dri/card0\',os.O_RDWR); print(fcntl.ioctl(fd,0xc0406400,b\'\\x00\'*64))" (DRM_IOCTL_VERSION)',
              'Inspect DRM device debugfs: ls /sys/kernel/debug/dri/0/ (requires root)',
              'Count how many ioctls amdgpu registers: grep -c "DRM_IOCTL_DEF_DRV" drivers/gpu/drm/amd/amdgpu/amdgpu_drv.c (in kernel source)',
              'View processes currently holding the DRM device open: sudo fuser /dev/dri/card0 /dev/dri/renderD128',
            ],
            expectedOutput: `$ ls -la /dev/dri/
crw-rw----+ 1 root video 226,   0 ... card0        ← master node
crw-rw----+ 1 root render 226, 128 ... renderD128   ← render node

$ ls /sys/kernel/debug/dri/0/
amdgpu_dm_visual_confirm  amdgpu_gpu_recover  amdgpu_ring_gfx
amdgpu_fence_info         amdgpu_pm_info      amdgpu_vram_mm
...  ← many amdgpu debugfs entries

$ sudo fuser /dev/dri/card0
/dev/dri/card0:     1234  5678  ← Xorg/Wayland and compositor`,
            hint: 'If /sys/kernel/debug/dri/ is empty, make sure debugfs is mounted: mount -t debugfs none /sys/kernel/debug. debugfs is an important kernel debugging interface; amdgpu exposes a large amount of internal state through it.',
          },
          debugExercise: {
            title: 'Find a Resource Leak Caused by Missing drm_dev_unregister',
            language: 'c',
            description: 'Below is a simplified DRM driver probe and remove function. After the driver is unloaded, /dev/dri/card0 still exists, and any user space program that opens it again causes a kernel oops.',
            question: 'Why does the device file persist after the driver is unloaded? How do you fix it?',
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
    /* BUG: forgot to call drm_dev_unregister(ddev) */
    /* Also forgot drm_dev_put(ddev) if not using devm */
}`,
            hint: 'Symmetry principle: drm_dev_register() and drm_dev_unregister() must be paired. Registration creates device nodes and sysfs entries; unregistration must remove them.',
            answer: 'The problem is the missing drm_dev_unregister(ddev) in the remove function. drm_dev_register() called in probe created the /dev/dri/card0 and /dev/dri/renderD128 device nodes, registered sysfs attributes, and added drm_device to the DRM core\'s global device list. Without calling drm_dev_unregister() in remove, none of these resources are cleaned up: (1) the device nodes remain in /dev/dri/ and user space can continue to open them; (2) but the underlying hardware has already been released by my_hw_fini(), so any ioctl through that device node accesses freed memory, causing use-after-free and a kernel oops. Fix: call drm_dev_unregister(ddev) before my_hw_fini() — first unregister from the DRM core (blocking new ioctls), then release hardware resources. This follows the "reverse registration order" principle: probe does init then register; remove does unregister then fini.',
          },
          interviewQ: {
            question: 'Explain the architectural design of the DRM subsystem: how do drm_device, drm_driver, and the ioctl dispatch mechanism work together? Why are there two types of device nodes — card and render?',
            difficulty: 'hard',
            hint: 'Answer from the perspective of layered design (DRM core vs. driver-specific code), ioctl dispatch tables (drm_ioctls[] vs. drm_driver.ioctls[]), and the security model (card master privilege vs. render ordinary privilege).',
            answer: 'DRM uses a framework-plus-plugin architecture: (1) drm_device is the core data structure representing a GPU instance; it holds mode_config (all KMS objects), file_list (all open file descriptors), and a driver pointer. It is allocated via devm_drm_dev_alloc() and embedded in the concrete driver\'s device struct (e.g., amdgpu_device.ddev). (2) drm_driver is the driver\'s "registry" — it declares supported feature subsets via .driver_features, provides hardware-specific implementations via callbacks (.open, .postclose, .gem_create_object, .dumb_create), and registers driver-specific ioctls via .ioctls[]. (3) ioctl dispatch: drm_ioctl() receives all DRM ioctl calls and routes them based on ioctl number — either to the DRM core table (drm_ioctls[], for generic operations like VERSION, GEM_CLOSE, MODE_*) or to the driver table (drm_driver.ioctls[], for driver-specific operations like AMDGPU_CS). (4) The card vs. render node split is the key to the security model: the card0 node has DRM master privilege (SET_MASTER) and can execute KMS operations (set resolution, switch displays); it is typically held only by the Xorg/Wayland compositor. The renderD128 node allows only rendering and compute ioctls (the DRM_RENDER_ALLOW flag), and ordinary apps can use GPU rendering without root. This design makes GPU sharing on multi-user systems both secure and efficient.',
            amdContext: 'This question tests your systematic understanding of the DRM framework. In an AMD interview you need to demonstrate not only knowledge of amdgpu specifics, but also an understanding of its place within the broader DRM framework and its design philosophy.',
          },
        },

        // ── Lesson 4.1.2 ──────────────────────────────────────
        {
          id: '4-1-2',
          number: '4.1.2',
          title: 'KMS Display Pipeline: CRTC → Encoder → Connector',
          titleEn: 'KMS Display Pipeline: CRTC → Encoder → Connector',
          duration: 20,
          difficulty: 'advanced',
          tags: ['KMS', 'CRTC', 'Encoder', 'Connector', 'Plane', 'Atomic'],
          concept: {
            summary: 'Kernel Mode Setting (KMS) abstracts display hardware as a pipeline: Plane (carries framebuffer data) → CRTC (scanout controller that outputs pixels according to timing) → Encoder (converts the CRTC\'s digital signal to a specific protocol) → Connector (physical output port). This abstraction lets user-space compositors control the display output of different GPUs through a unified API.',
            explanation: [
              'The design philosophy behind KMS is to map the physical structure of display hardware to software objects. A GPU typically has multiple display controllers, each capable of driving one monitor. In DRM/KMS, these hardware units are abstracted as four classes of objects that connect into a display pipeline.',
              'drm_plane is the starting point of the pipeline and represents a framebuffer layer. Each Plane is bound to a drm_framebuffer (pixel data in memory) and defines the display region on screen (src_x, src_y, src_w, src_h → crtc_x, crtc_y, crtc_w, crtc_h). Planes come in three types: Primary (main plane, carries the main image), Overlay (additional layer beyond cursor, used for video overlays), and Cursor (hardware-accelerated mouse pointer). Multiple Planes overlaid onto the same CRTC implement Hardware Compositing, which is more power-efficient than GPU rendering-based composition.',
              'drm_crtc (CRT Controller — the name comes from the CRT era) is the heart of the display pipeline and represents a scanout unit. The CRTC reads pixel data from Planes and outputs it line by line according to configured timing parameters (horizontal/vertical resolution, front/back porch, sync pulse width = drm_display_mode). The CRTC also generates VBlank interrupts (triggered at the end of each frame scan), which are the basis for page flipping and vertical sync (VSync). The amdgpu CRTC is implemented in amdgpu_dm_crtc.c in the DC (Display Core) module.',
              'drm_encoder represents a signal converter that transforms the CRTC\'s internal digital signal into a specific transport protocol (HDMI, DisplayPort, DVI, etc.). A single CRTC can be connected to multiple Encoders (though only one is active at a time), and each Encoder connects to exactly one Connector. On modern GPUs, Encoders are typically integrated inside the GPU die (Digital Encoder) and are no longer discrete hardware components.',
              'drm_connector represents a physical output port — the HDMI jack, DisplayPort jack, etc. on the back of your graphics card. A Connector is responsible for: (1) detecting whether a display is connected (via HPD — Hot Plug Detection); (2) reading the display\'s EDID (Extended Display Identification Data, which includes supported resolutions, refresh rates, etc.); (3) reporting connection status (connected/disconnected/unknown) to user space. The amdgpu Connector is implemented in amdgpu_dm_connector.c in the DC module and supports DP, HDMI, eDP, and other interface types.',
              'In amdgpu, KMS is implemented by the Display Core (DC) module. The DC module (drivers/gpu/drm/amd/display/) was originally ported from the Windows driver and contains roughly 500k lines of code. It translates the standard DRM/KMS interfaces into register operations for AMD DCN (Display Controller Next) hardware. DC has its own internal object model (dc_stream, dc_plane, dc_link), and amdgpu_dm.c acts as a "glue layer" mapping DRM objects to DC objects.',
            ],
            keyPoints: [
              'KMS display pipeline: Plane (pixel source) → CRTC (scan timing) → Encoder (signal conversion) → Connector (physical port)',
              'drm_plane has three types: Primary (main image), Overlay (additional layer), Cursor (mouse pointer)',
              'drm_crtc outputs pixels line by line according to the timing parameters in drm_display_mode and generates VBlank interrupts',
              'drm_connector detects HPD (hot plug), reads EDID, and reports connection status',
              'amdgpu\'s KMS is implemented by the DC (Display Core) module, code lives in drivers/gpu/drm/amd/display/',
              'amdgpu_dm.c is the glue layer: DRM objects (drm_crtc) ↔ DC objects (dc_stream)',
            ],
          },
          diagram: {
            title: 'KMS Display Pipeline: From Framebuffer to Screen',
            content: `KMS Display Pipeline (amdgpu dual-monitor output example)

Framebuffer (VRAM)         DRM/KMS Objects               Physical Hardware
──────────────────         ───────────────               ─────────────────

                           ┌──────────────┐
 FB0 (main image)          │   Plane 0    │
 1920x1080 XRGB ──────────│  (Primary)   │
                           └──────┬───────┘
                                  │
                           ┌──────┴───────┐
 FB1 (mouse cursor)        │   Plane 1    │
 64x64 ARGB ──────────────│  (Cursor)    │     HW Composite
                           └──────┬───────┘       │
                                  ├───────────────┘
                                  ▼
                           ┌──────────────┐     DCN Hardware
                           │   CRTC 0     │     ┌──────────┐
                           │ 1920x1080    │────▶│ OTG 0    │
                           │ @60Hz        │     │(scan eng) │
                           │ VBlank IRQ ──│──┐  └────┬─────┘
                           └──────────────┘  │       │
                                             │       ▼
                                             │  ┌──────────┐
                           ┌──────────────┐  │  │Encoder 0 │    ┌─────────┐
                           │ Connector 0  │──│──│ (DP PHY)  │───▶│ DP port │──▶ Monitor A
                           │ DP-1         │  │  └──────────┘    └─────────┘
                           │ (connected)  │  │
                           │ EDID: ...    │  │
                           └──────────────┘  │
                                             │
                           ┌──────────────┐  │
 FB2 (second screen)       │   Plane 2    │  │
 2560x1440 XRGB ──────────│  (Primary)   │  │
                           └──────┬───────┘  │
                                  ▼          │
                           ┌──────────────┐  │  ┌──────────┐
                           │   CRTC 1     │──┘  │Encoder 1 │    ┌─────────┐
                           │ 2560x1440    │────▶│(HDMI PHY) │───▶│HDMI port│──▶ Monitor B
                           │ @144Hz       │     └──────────┘    └─────────┘
                           └──────────────┘
                           ┌──────────────┐
                           │ Connector 1  │
                           │ HDMI-A-1     │
                           │ (connected)  │
                           └──────────────┘

VBlank timing (single frame):
┌─────────── Active Display ───────────┐┌── VBlank ──┐
│ Line-by-line scan: 1920x1080 pixels  ││ Front Porch │
│ CRTC reads FB data from Plane        ││ Sync Pulse  │
│                                      ││ Back Porch  │
└──────────────────────────────────────┘└─── IRQ! ───┘`,
            caption: 'A complete view of the KMS display pipeline. On the left is the Framebuffer in VRAM; in the middle are the DRM/KMS abstraction objects; on the right are the actual physical interfaces. The VBlank interrupt fires at the end of each frame scan and is the safe time window for updating display content.',
          },
          codeWalk: {
            title: 'amdgpu DC Connector Creation Flow',
            file: 'drivers/gpu/drm/amd/display/amdgpu_dm/amdgpu_dm.c',
            language: 'c',
            code: `/* amdgpu_dm.c — Create DRM connector and associate it with DC link */

static int amdgpu_dm_initialize_drm_device(
    struct amdgpu_device *adev)
{
    struct drm_device *ddev = adev_to_drm(adev);
    struct amdgpu_display_manager *dm = &adev->dm;
    int i;

    /* Iterate over all display links detected by DC */
    for (i = 0; i < dm->dc->caps.max_links; i++) {
        struct dc_link *link = dm->dc->links[i];
        struct amdgpu_dm_connector *aconnector;

        if (link->connector_signal == SIGNAL_TYPE_NONE)
            continue;

        /* Allocate amdgpu_dm_connector (embeds drm_connector) */
        aconnector = kzalloc(sizeof(*aconnector), GFP_KERNEL);

        /* Initialize DRM connector based on signal type */
        if (link->connector_signal == SIGNAL_TYPE_DISPLAY_PORT ||
            link->connector_signal == SIGNAL_TYPE_EDP) {

            drm_connector_init(ddev, &aconnector->base,
                &amdgpu_dm_dp_connector_funcs,
                DRM_MODE_CONNECTOR_DisplayPort);

            drm_connector_helper_add(&aconnector->base,
                &amdgpu_dm_dp_connector_helper_funcs);
            /* helper_funcs provides: .get_modes, .detect,
             * .best_encoder, .atomic_check */

        } else if (link->connector_signal == SIGNAL_TYPE_HDMI_TYPE_A) {

            drm_connector_init(ddev, &aconnector->base,
                &amdgpu_dm_connector_funcs,
                DRM_MODE_CONNECTOR_HDMIA);

            drm_connector_helper_add(&aconnector->base,
                &amdgpu_dm_connector_helper_funcs);
        }

        /* Associate the DC link with the DRM connector */
        aconnector->dc_link = link;

        /* Register connector with DRM mode_config */
        drm_connector_register(&aconnector->base);

        /* Attach supported encoders */
        drm_connector_attach_encoder(&aconnector->base,
                                      &aencoder->base);
    }
    return 0;
}

/* Connector helper callback: get modes supported by the display */
static int amdgpu_dm_connector_get_modes(
    struct drm_connector *connector)
{
    struct amdgpu_dm_connector *aconnector =
        to_amdgpu_dm_connector(connector);

    /* Read EDID from DC link */
    struct edid *edid = aconnector->edid;
    if (edid) {
        /* Parse EDID to get the list of supported resolutions */
        drm_add_edid_modes(connector, edid);
        /* → Adds 1920x1080@60, 2560x1440@144, etc.
         *   to the connector->modes linked list */
    }
    return connector->probed_modes;
}`,
            annotations: [
              'dm->dc->links[] is the array of display links detected by the DC hardware layer; each link corresponds to one physical output',
              'connector_signal distinguishes port types: DP, HDMI, eDP (laptop internal display), DVI, etc.',
              'drm_connector_init() initializes the DRM connector base structure; the fourth argument specifies the connector type',
              'drm_connector_helper_add() registers helper callbacks: .get_modes reads EDID, .detect checks connection state',
              'aconnector->dc_link links the DRM-world connector to the DC-world link',
              'drm_add_edid_modes() parses EDID data and adds the display\'s supported resolutions to the modes list',
            ],
            explanation: 'amdgpu creates KMS objects through the DC module. This code shows the core flow of Connector creation: iterate over DC-detected physical outputs → initialize DRM connector based on signal type (DP/HDMI) → associate DC link → register with DRM. When user space queries available resolutions, the get_modes callback reads the display\'s EDID to obtain the list of supported modes. This layered design (DRM connector ↔ DC link ↔ hardware PHY) lets amdgpu reuse large amounts of DRM infrastructure.',
          },
          miniLab: {
            title: 'Query Display Information Using libdrm',
            objective: 'Write a C program that uses the libdrm interface to query the status and supported resolutions of all Connectors in the system, to understand how KMS objects appear in user space.',
            setup: `# Install libdrm development library
sudo apt install libdrm-dev
# Create working directory
mkdir -p ~/drm-lab && cd ~/drm-lab`,
            steps: [
              'Create query_display.c using drmModeGetResources() to get the KMS resource list',
              'Iterate over the connectors array and use drmModeGetConnector() to get detailed info for each connector',
              'Print connector type (DP/HDMI), connection status, and the list of supported resolutions',
              'Compile: gcc -o query_display query_display.c -ldrm -I/usr/include/libdrm',
              'Run: sudo ./query_display (requires root or membership in the video group)',
              'Compare the output with dmesg | grep connector to verify consistency',
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

You can also use a ready-made tool to verify:
$ modetest -c    ← list all connectors
$ modetest -p    ← list all planes
$ modetest -e    ← list all encoders`,
            hint: 'If no monitor is connected, the connector status will be disconnected and no modes will be available. You can use modetest (from the libdrm-tests or drm-utils package) as a ready-made query tool. Run modetest -M amdgpu to target the amdgpu driver specifically.',
          },
          debugExercise: {
            title: 'Diagnose a Connector Type Configuration Mismatch',
            language: 'c',
            description: 'A custom DRM driver incorrectly uses the DisplayPort connector type for an HDMI port, causing the Wayland compositor to fail to correctly recognize the output.',
            question: 'Why does the Wayland compositor report "no DP link" and refuse to enable the output even though a display is connected?',
            buggyCode: `/* Creating an HDMI connector but using the wrong type */
static int create_hdmi_connector(struct drm_device *dev,
                                  struct my_connector *conn)
{
    int ret;

    /* BUG: HDMI port is using DisplayPort type! */
    ret = drm_connector_init(dev, &conn->base,
        &my_connector_funcs,
        DRM_MODE_CONNECTOR_DisplayPort);  /* Should be HDMIA */

    if (ret)
        return ret;

    drm_connector_helper_add(&conn->base,
        &my_dp_connector_helper_funcs);
    /* ↑ Also using DP helper funcs instead of HDMI ones */

    /* HPD and EDID reading actually go through HDMI channel... */
    conn->hpd_gpio = gpiod_get(dev->dev, "hdmi-hpd", ...);
    return 0;
}`,
            hint: 'Consider the impact of connector type on user space: Wayland/Xorg selects the signal protocol and link training strategy based on connector type. HDMI and DP link training are completely different.',
            answer: 'The problem is in the fourth argument of drm_connector_init(): DRM_MODE_CONNECTOR_DisplayPort should be DRM_MODE_CONNECTOR_HDMIA. This causes two serious consequences: (1) User space (Wayland compositor, Xorg) believes this is a DP port and attempts DP link training (DPCD read/write, lane negotiation), but the underlying hardware is actually HDMI — DPCD reads/writes fail, and the compositor reports "no DP link"; (2) DP helper funcs are attached to the HDMI connector, so .detect and .get_modes callbacks use the DP protocol to read EDID (AUX channel) instead of the HDMI protocol (DDC/I2C), making it impossible to retrieve display information. Fix: change DRM_MODE_CONNECTOR_DisplayPort to DRM_MODE_CONNECTOR_HDMIA and use HDMI helper_funcs. The connector type must match the actual physical interface — this is a prerequisite for the KMS abstraction to work correctly.',
          },
          interviewQ: {
            question: 'Describe the responsibilities of CRTC, Encoder, Connector, and Plane in the KMS display pipeline, and how they connect to each other.',
            difficulty: 'hard',
            hint: 'Describe the data flow direction: Framebuffer → Plane → CRTC → Encoder → Connector → Display. Emphasize the hardware counterpart of each object, and the N:M mapping relationships (multiple Planes can connect to one CRTC, but each Encoder typically connects to only one Connector).',
            answer: 'The KMS display pipeline is a data path from in-memory pixels to a physical display: (1) Plane is the pixel source — each Plane is bound to a Framebuffer (a pixel matrix in VRAM) and defines cropping and scaling parameters. Three types: Primary (required, carries the main image), Cursor (hardware-accelerated cursor, 64x64), Overlay (optional additional layer for video playback, etc.). Multiple Planes are composited onto the same CRTC in hardware, avoiding the overhead of GPU-based composition. (2) CRTC is the scanout engine — it outputs pixel data from Planes line by line according to the timing defined by drm_display_mode (hactive, vactive, hsync, vsync, clock). The CRTC generates VBlank interrupts, which are the time reference for page flipping and vertical sync. A GPU typically has 4–6 CRTCs, determining the maximum number of simultaneously active displays. (3) Encoder is the signal converter — it converts the CRTC\'s internal digital signal into HDMI TMDS, DP Main Link, or similar transport protocols. On modern GPUs the Encoder is typically an internal digital encoder. One CRTC can connect to multiple Encoders (though only one is active at a time) to support port multiplexing. (4) Connector is the physical interface — representing the HDMI jack, DP jack, etc. on the GPU. Responsible for HPD detection, EDID reading, and reporting connection status. User space discovers and selects display devices through Connectors. Connection relationships: N Planes → 1 CRTC → 1 Encoder → 1 Connector → Display. In amdgpu, the DC module maps these DRM objects to DCN hardware units (Plane→MPC/DPP, CRTC→OTG, Encoder→DIO, Connector→PHY+HPD).',
            amdContext: 'A high-frequency question in AMD Display team interviews. Beyond describing the generic KMS architecture, mention how the DC module maps DRM objects to DCN hardware — this demonstrates your concrete understanding of the amdgpu display subsystem.',
          },
        },

        // ── Lesson 4.1.3 ──────────────────────────────────────
        {
          id: '4-1-3',
          number: '4.1.3',
          title: 'Atomic Mode Setting: Atomic Display Updates',
          titleEn: 'Atomic Mode Setting: Atomic Display Updates',
          duration: 20,
          difficulty: 'advanced',
          tags: ['Atomic', 'KMS', 'page-flip', 'VBlank', 'drm_atomic_state'],
          concept: {
            summary: 'Atomic Mode Setting is the modern DRM/KMS API — it allows user space to bundle multiple display property changes (resolution, Plane position, gamma curve, etc.) into a single atomic operation that the kernel validates and commits all at once. Compared to Legacy Mode Setting\'s one-property-at-a-time approach (set CRTC → set cursor → set gamma), Atomic eliminates intermediate inconsistent states that cause screen flicker and tearing.',
            explanation: [
              'The problem with Legacy Mode Setting: in the old KMS API, each display property change was an independent ioctl call. For example, switching resolution required first calling drmModeSetCrtc() (set new mode), then drmModeSetPlane() (set overlay), then drmModeSetCursor() (set cursor position). If the first call succeeded but the second failed, the display would be in an inconsistent state — users would see jitter or partial updates. Worse, these operations could not all complete within the same VBlank interval, causing visible tearing.',
              'The core idea behind Atomic Mode Setting is "validate first, commit second." User space builds a drm_atomic_state object containing all the properties it wants to change (CRTC mode, Plane framebuffer, Connector state, etc.), then submits it to the kernel. The kernel processes it in two phases: (1) atomic_check phase: validate that the entire state is legal (is bandwidth sufficient? Is the clock frequency supported? Is the Plane format compatible?) without changing any hardware state; (2) atomic_commit phase: if the check passes, write all changes to hardware at once, ensuring completion within a single VBlank interval.',
              'drm_atomic_state is the core data structure of an Atomic commit. It contains three classes of state: drm_crtc_state (the CRTC\'s new mode, active/enable state, mode_changed flag), drm_plane_state (the Plane\'s bound FB, src/dst rectangles, rotation/blend properties), and drm_connector_state (the Connector\'s bound CRTC, DPMS state). On each atomic commit, the kernel creates a copy of the old state; the driver modifies the copy; the check phase validates the copy; the commit phase replaces the current state with the copy. If the check fails, the copy is discarded and hardware is unaffected.',
              'The DRM_MODE_ATOMIC_TEST_ONLY flag lets user space "probe" whether a configuration is legal without actually committing it. This is especially useful for Wayland compositors — they can test-only multiple layout candidates, select the optimal one that passes validation, and then actually commit it. This avoids the cost of "commit → fail → revert."',
              'Page Flip is the most common use of Atomic. After each frame is rendered, the compositor binds the new framebuffer to the Primary Plane and submits it via atomic commit. The DRM_MODE_PAGE_FLIP_EVENT flag requests an event notification when the flip completes. If DRM_MODE_ATOMIC_NONBLOCK is specified, the commit returns immediately without waiting for VBlank — the flip completes automatically at the next VBlank. This is the foundation for tear-free compositing on modern Linux desktops.',
              'In amdgpu, the core path for Atomic commit is amdgpu_dm_atomic_commit_tail(). This function receives a validated drm_atomic_state and translates the DRM-layer property changes into DC-layer operations: updating dc_stream (corresponding to CRTC mode changes), updating dc_plane (corresponding to Plane property changes), and calling dc_commit_streams() to submit all changes to DCN hardware at once (note: this is the v6.12 interface name; older kernels called it dc_commit_state — DC interfaces evolve, so in interviews explain the atomic-commit flow and defer exact function names to the kernel version you read). VBlank waiting and page flip completion events are also handled in this function.',
            ],
            keyPoints: [
              'Legacy Mode Setting: sets properties one by one, no atomicity guarantee, can lead to intermediate inconsistent states',
              'Atomic Mode Setting: bundles all changes into drm_atomic_state, check first then commit',
              'drm_atomic_state contains three sub-states: crtc_state, plane_state, connector_state',
              'TEST_ONLY flag: probe configuration legality without committing; compositors use it to find the optimal layout',
              'Page Flip + NONBLOCK: asynchronously submit a new framebuffer; it switches automatically at the next VBlank',
              'amdgpu_dm_atomic_commit_tail(): DRM atomic state → DC state → DCN hardware registers',
            ],
          },
          diagram: {
            title: 'Atomic Mode Setting Check → Commit Flow',
            content: `Atomic Mode Setting Complete Flow

User Space (Wayland compositor)
────────────────────────────
  1. Build atomic request
     drmModeAtomicReq *req = drmModeAtomicAlloc();
     drmModeAtomicAddProperty(req, plane_id, FB_ID, new_fb);
     drmModeAtomicAddProperty(req, crtc_id, MODE_ID, mode_blob);
     drmModeAtomicAddProperty(req, conn_id, CRTC_ID, crtc_id);

  2. Optional: validate with TEST_ONLY first
     drmModeAtomicCommit(fd, req, TEST_ONLY, NULL);
     → returns 0 if config is legal, -EINVAL if not

  3. Actual commit (non-blocking + request page flip event)
     drmModeAtomicCommit(fd, req, NONBLOCK | PAGE_FLIP_EVENT, NULL);
     │
═════╪═════════════════════════════════════════════════════
     │
Kernel Space (DRM → amdgpu)
     ▼
  drm_mode_atomic_ioctl()                  (drm_atomic_uapi.c)
     │
     ▼
  ┌─────────────────────────────────────────────────┐
  │  Phase 1: atomic_check (validation phase)        │
  │                                                  │
  │  drm_atomic_helper_check_modeset()               │
  │  ├─ Per CRTC: mode_changed? active_changed?     │
  │  ├─ Bandwidth check: total CRTC BW ≤ GPU limit  │
  │  └─ Clock check: pixel clock ≤ max HW supports  │
  │                                                  │
  │  drm_atomic_helper_check_planes()                │
  │  ├─ Per Plane: FB format supported? rect valid?  │
  │  ├─ Scale ratio: within hardware scaler limits   │
  │  └─ Bandwidth: active Planes BW ≤ available BW  │
  │                                                  │
  │  amdgpu_dm_atomic_check()  ← amdgpu-specific    │
  │  └─ DC validation: dc_validate_global_state()    │
  │                                                  │
  │  If TEST_ONLY → return here, no hardware change  │
  └──────────────────────┬──────────────────────────┘
                         │ check passed
                         ▼
  ┌─────────────────────────────────────────────────┐
  │  Phase 2: atomic_commit (commit phase)           │
  │                                                  │
  │  If NONBLOCK:                                    │
  │    enqueue to workqueue, return to user space    │
  │                                                  │
  │  amdgpu_dm_atomic_commit_tail()                  │
  │  ├─ Update dc_stream (CRTC mode changes)        │
  │  ├─ Update dc_plane (Plane property changes)    │
  │  ├─ dc_commit_streams() → write DCN registers     │
  │  ├─ Wait for VBlank (page flip)                 │
  │  └─ drm_crtc_send_vblank_event() → notify USpace│
  └─────────────────────────────────────────────────┘
                         │
                         ▼
  User space receives DRM_EVENT_FLIP_COMPLETE
  → safe to release the old framebuffer`,
            caption: 'The two-phase commit flow of Atomic Mode Setting. The check phase validates configuration legality (can be executed in isolation with TEST_ONLY); the commit phase updates all hardware state at once within a VBlank interval.',
          },
          codeWalk: {
            title: 'amdgpu_dm_atomic_commit_tail — The Core of Atomic Commit',
            file: 'drivers/gpu/drm/amd/display/amdgpu_dm/amdgpu_dm.c',
            language: 'c',
            code: `/* amdgpu_dm_atomic_commit_tail — handle the validated atomic state */
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

    /* Step 1: Handle CRTCs that need a mode change */
    for_each_oldnew_crtc_in_state(state, crtc,
            old_crtc_state, new_crtc_state, i) {
        struct amdgpu_crtc *acrtc = to_amdgpu_crtc(crtc);
        struct dm_crtc_state *dm_new =
            to_dm_crtc_state(new_crtc_state);

        if (drm_atomic_crtc_needs_modeset(new_crtc_state)) {
            if (!new_crtc_state->active) {
                /* CRTC is being disabled — remove DC stream */
                dc_remove_stream_from_ctx(dm->dc,
                    dc_state, dm_new->stream);
            } else {
                /* CRTC mode change — update DC stream */
                dc_add_stream_to_ctx(dm->dc,
                    dc_state, dm_new->stream);
            }
        }
    }

    /* Step 2: Commit the full DC state to hardware */
    WARN_ON(!dc_commit_streams(dm->dc, dc_state));
    /*
     * dc_commit_streams() internally:
     *   1. Programs OTG timing registers (resolution, refresh rate)
     *   2. Configures DPP/MPC (Plane blending, scaling)
     *   3. Updates surface address (key to page flip)
     *   4. Triggers DCN hardware double-buffer switch
     */

    /* Step 3: Wait for VBlank and send flip completion event */
    for_each_oldnew_crtc_in_state(state, crtc,
            old_crtc_state, new_crtc_state, i) {

        if (new_crtc_state->active &&
            new_crtc_state->event) {
            /* Wait for VBlank — ensure page flip has taken effect */
            drm_crtc_vblank_get(crtc);
            /* ... hardware switches surface address at VBlank ... */

            /* Notify user space that page flip is complete */
            drm_crtc_send_vblank_event(crtc,
                new_crtc_state->event);
            drm_crtc_vblank_put(crtc);
        }
    }
}`,
            annotations: [
              'for_each_oldnew_crtc_in_state() iterates over all CRTCs affected by the atomic_state',
              'drm_atomic_crtc_needs_modeset() checks whether the CRTC requires a full mode switch (rather than just a page flip)',
              'dc_commit_streams() is the core of the DC module — it programs the full DC state into DCN hardware registers',
              'DCN uses double-buffering: new values are written to shadow registers and latched into active registers at VBlank',
              'drm_crtc_send_vblank_event() sends the DRM_EVENT_FLIP_COMPLETE event to user space',
              'The entire function runs in the commit workqueue (if NONBLOCK), without blocking the user space ioctl return',
            ],
            explanation: 'This function is the heart of amdgpu display updates. When a Wayland compositor submits a new frame, after passing the check phase, commit_tail is responsible for actually writing the changes to hardware. The key is dc_commit_streams() — it translates the atomic state from the DRM world into DCN hardware register operations, using DCN\'s double-buffering mechanism to complete the switch within a VBlank interval, ensuring the user sees no flicker or tearing.',
          },
          miniLab: {
            title: 'Observe VBlank Synchronization in Atomic Mode Setting',
            objective: 'Use the drm_info and trace-cmd tools to observe the timing relationship between Atomic commits and VBlank events, to understand the underlying mechanism of tear-free display.',
            steps: [
              'Install tools: sudo apt install drm-info trace-cmd',
              'View current atomic state: drm_info (if available) or cat /sys/kernel/debug/dri/0/state',
              'Start VBlank event tracing: sudo trace-cmd record -e drm:drm_vblank_event -e amdgpu:amdgpu_flip_status',
              'During tracing, move the mouse or switch a window (to trigger a page flip), then wait 2–3 seconds and press Ctrl+C to stop',
              'View trace results: trace-cmd report | head -50, observe the timing relationship between vblank_event and flip',
              'Verify frame rate: count the number of vblank events within 1 second; it should be close to the monitor refresh rate (60/144)',
            ],
            expectedOutput: `$ sudo trace-cmd report | head -20
  kworker-1234 [002] 1000.001: drm_vblank_event: crtc=0, seq=51234
  kworker-1234 [002] 1000.001: amdgpu_flip_status: flip completed
  kworker-1234 [002] 1000.017: drm_vblank_event: crtc=0, seq=51235
  ...

Interval between two vblank events is ~16.67ms (60Hz) or ~6.94ms (144Hz)
Page flips always complete near vblank events — that is the tear-free guarantee`,
            hint: 'If trace-cmd reports a permission error, make sure you are running as root. If you do not see amdgpu-related tracepoints, check /sys/kernel/debug/tracing/available_events | grep amdgpu.',
          },
          debugExercise: {
            title: 'Diagnose Screen Tearing from Non-Atomic Updates',
            language: 'c',
            description: 'The following user-space code uses the Legacy Mode Setting API to update the display. Users report a noticeable horizontal tear line on screen.',
            question: 'Why does tearing occur? How do you fix it with the Atomic API?',
            buggyCode: `/* Legacy Mode Setting — non-atomic updates cause tearing */
void update_display(int fd, uint32_t crtc_id,
                     uint32_t plane_id, uint32_t new_fb)
{
    /* Step 1: Update the main Plane's framebuffer */
    drmModeSetPlane(fd, plane_id, crtc_id,
        new_fb, 0,
        0, 0, 1920, 1080,    /* dst */
        0, 0, 1920<<16, 1080<<16);  /* src */

    /* Step 2: Update overlay Plane */
    drmModeSetPlane(fd, overlay_id, crtc_id,
        overlay_fb, 0,
        100, 100, 320, 240,
        0, 0, 320<<16, 240<<16);

    /* BUG: a VBlank may occur between the two SetPlane calls,
     * causing users to see half old image + half new image */

    /* Step 3: Update cursor position */
    drmModeMoveCursor(fd, crtc_id, cursor_x, cursor_y);
    /* Cursor position update is yet another independent operation... */
}`,
            hint: 'There is no atomicity guarantee between three independent ioctl calls. If Step 1 completes before VBlank but Step 2 executes after VBlank, the frame the user sees has a new Plane 0 but an old overlay — that is the tear.',
            answer: 'The problem: three independent drmModeSetPlane/MoveCursor calls have no atomicity guarantee. If the CRTC enters the VBlank scan phase between two calls, the display will show a partially-updated frame within the same scan — the upper half shows new Plane 0 content while the lower half still shows the old version, creating a horizontal tear line. The fix is to use the Atomic Mode Setting API: drmModeAtomicReq *req = drmModeAtomicAlloc(); drmModeAtomicAddProperty(req, plane_id, "FB_ID", new_fb); drmModeAtomicAddProperty(req, overlay_id, "FB_ID", overlay_fb); drmModeAtomicAddProperty(req, crtc_id, "CURSOR_X", cursor_x); drmModeAtomicAddProperty(req, crtc_id, "CURSOR_Y", cursor_y); drmModeAtomicCommit(fd, req, DRM_MODE_ATOMIC_NONBLOCK | DRM_MODE_PAGE_FLIP_EVENT, NULL); This bundles all changes into one atomic operation; the kernel ensures all Planes are switched within the same VBlank interval, eliminating tearing.',
          },
          interviewQ: {
            question: 'Explain the advantages of Atomic Mode Setting over Legacy Mode Setting, and describe what the atomic_check and atomic_commit phases each do.',
            difficulty: 'hard',
            hint: 'Analyze from the perspective of atomicity guarantees (eliminating intermediate inconsistent states), test-only capability (probe without committing), and error rollback (check failure does not affect hardware). Describe the validation performed in the check phase (bandwidth, clock, format compatibility) and the hardware programming flow in the commit phase.',
            answer: 'Core advantages of Atomic Mode Setting: (1) Atomicity — all display property changes (Plane FB, CRTC mode, Connector state) are submitted as a transaction that either all succeeds or all fails, eliminating the intermediate inconsistent states and screen tearing of the Legacy per-ioctl API; (2) Test-only — DRM_MODE_ATOMIC_TEST_ONLY lets compositors validate configuration legality without committing, useful for finding the optimal display layout; (3) Safe rollback — the check phase validates on a copy of the old state; if it fails, the copy is discarded and hardware is completely unaffected. atomic_check phase: (a) drm_atomic_helper_check_modeset() validates the legality of CRTC mode changes (pixel clock ≤ hardware max, total bandwidth of all CRTCs ≤ memory bandwidth limit); (b) drm_atomic_helper_check_planes() validates Plane configuration (FB format supported, scale ratio within hardware scaler capability); (c) driver-specific checks (amdgpu_dm_atomic_check → dc_validate_global_state(), validating DCN hardware resource allocation, e.g. whether there are enough DPPs). atomic_commit phase: (a) if NONBLOCK flag is set, queue the actual commit to a workqueue and return immediately to user space; (b) amdgpu_dm_atomic_commit_tail() translates DRM state into DC operations and calls dc_commit_streams() to program DCN registers; (c) using DCN double-buffering, new values are written to shadow registers and latched into active registers at VBlank, achieving flicker-free switching; (d) notify user space of page flip completion via drm_crtc_send_vblank_event().',
            amdContext: 'Atomic Mode Setting is the foundation of the modern Linux display stack. In an AMD interview, demonstrating that you understand the complete path from user-space drmModeAtomicCommit() through kernel amdgpu_dm_atomic_commit_tail() to DC dc_commit_streams() will earn significant credit.',
          },
        },
      ],
    },

    // ════════════════════════════════════════════════════════════
    // Group 4.2: GPU Memory Management
    // ════════════════════════════════════════════════════════════
    {
      id: '4-2',
      number: '4.2',
      title: 'GPU Memory Management',
      titleEn: 'GPU Memory Management',
      icon: 'HardDrive',
      description: 'Master the two major GPU memory management frameworks in DRM — GEM and TTM — understand the lifecycle of Buffer Objects and memory domain migration, and learn the DMA-BUF cross-device zero-copy sharing protocol.',
      lessons: [
        // ── Lesson 4.2.1 ──────────────────────────────────────
        {
          id: '4-2-1',
          number: '4.2.1',
          title: 'GEM & TTM: The Dual GPU Memory Frameworks',
          titleEn: 'GEM & TTM: The Dual GPU Memory Frameworks',
          duration: 20,
          difficulty: 'advanced',
          tags: ['GEM', 'TTM', 'Buffer-Object', 'VRAM', 'GTT', 'memory-domain'],
          concept: {
            summary: 'The DRM framework provides two GPU memory management approaches: GEM (Graphics Execution Manager) offers a clean Buffer Object abstraction interface, while TTM (Translation Table Manager) builds on top of GEM to provide full memory domain management, object migration, and page eviction for discrete GPUs with their own dedicated video RAM (VRAM). amdgpu uses TTM as the backend and GEM as the user-space interface.',
            explanation: [
              'GPU memory management is one of the most complex subsystems in a GPU driver. The core challenge is: a GPU has its own dedicated video memory (VRAM), but also needs to access system memory (via the PCIe bus). Buffers created by applications (vertex data, textures, framebuffers) may migrate between VRAM and system memory — when VRAM is insufficient, inactive Buffers need to be "swapped out" to system memory (similar to CPU swap). The DRM framework manages this complexity through GEM and TTM.',
              'GEM (Graphics Execution Manager) was originally designed by Intel for the i915 driver and provides a basic abstraction for GPU Buffer Objects. The core GEM concept is drm_gem_object — a kernel object representing a chunk of GPU-accessible memory. User space references Buffer Objects via GEM handles (a per-process integer ID). GEM provides operations including: create (allocate memory), map (give the CPU access via mmap), reference counting (increment/decrement on open/close, release when zero), and naming/flink (for inter-process sharing, now superseded by DMA-BUF). GEM\'s design assumption is "the GPU only uses system memory," so it does not itself handle VRAM management or object migration.',
              'TTM (Translation Table Manager) is designed specifically for discrete GPUs with independent VRAM (such as AMD and NVIDIA). TTM adds key capabilities on top of GEM: (1) Memory domains (Memory Domain / Placement) — each Buffer Object can reside in VRAM, GTT (Graphics Translation Table — the portion of system memory accessible to the GPU), or System (ordinary system memory). (2) Object migration (BO Move) — when a Buffer needs to move from System to VRAM (the GPU is about to use it) or from VRAM to System (VRAM is full), TTM\'s ttm_bo_move_memcpy() or DMA engine performs the data copy. (3) Page eviction — when VRAM is full, TTM uses an LRU (Least Recently Used) strategy to select the least-recently-used Buffers to evict to GTT or System.',
              'Buffer Object lifecycle: Create → Place → Map → Use → Unmap → Migrate → Destroy. Specifically: (1) User space calls DRM_IOCTL_AMDGPU_GEM_CREATE; the kernel creates an amdgpu_bo (embedding ttm_buffer_object + drm_gem_object); (2) TTM allocates physical pages in the requested placement domain (VRAM/GTT); (3) User space mmaps to get a CPU virtual address (TTM\'s fault handler maps pages on demand); (4) the GPU accesses Buffer contents via the GART/VM page table; (5) when VRAM is insufficient, TTM migrates inactive BOs to GTT/System (eviction); (6) when the reference count reaches zero, TTM releases physical pages and destroys the BO.',
              'In amdgpu, the division of labor between GEM and TTM is as follows: the user-space API layer (ioctls) uses the GEM interface (DRM_IOCTL_AMDGPU_GEM_CREATE/GEM_MMAP/GEM_WAIT_IDLE, etc.), while the kernel implementation layer uses the TTM framework (ttm_bo_init_reserved, ttm_bo_validate, ttm_bo_move_memcpy, etc.). The amdgpu_bo struct embeds both drm_gem_object (GEM layer) and ttm_buffer_object (TTM layer). The two frameworks are connected through callback functions in amdgpu_ttm.c: TTM calls amdgpu_bo_move() to perform the actual DMA data transfer, and calls amdgpu_ttm_io_mem_reserve() to map the VRAM region.',
            ],
            keyPoints: [
              'GEM provides the user-space interface (handle, create, mmap); TTM provides memory domain management and migration (VRAM↔GTT↔System)',
              'TTM memory domains: VRAM (GPU-dedicated video memory, fastest), GTT (system memory accessible to the GPU via GART), System (ordinary memory)',
              'amdgpu_bo embeds both drm_gem_object (GEM) and ttm_buffer_object (TTM)',
              'BO lifecycle: Create → Place → Map → Use → Migrate (eviction) → Destroy',
              'TTM eviction: when VRAM is full, LRU policy migrates inactive BOs to GTT/System',
              'amdgpu_ttm.c is the glue layer connecting GEM ioctl interface with TTM backend memory management',
            ],
          },
          diagram: {
            title: 'GEM/TTM Memory Management Architecture & Buffer Object Migration',
            content: `GEM/TTM Dual-Framework Memory Management

User Space
──────────────────────────────────────────────────────────
  Mesa / ROCm application
  │
  │ DRM_IOCTL_AMDGPU_GEM_CREATE
  │   { size: 4MB, domains: VRAM|GTT }
  │
══╪═══════════════════════════════════════════════════════
  │
Kernel Space
  ▼
┌─────────────────────────────────────────────────────────┐
│  GEM layer (drm_gem.c)                                  │
│  ├─ drm_gem_object: handle management, refcount, mmap   │
│  └─ GEM ioctls: CREATE, MMAP, CLOSE, WAIT_IDLE         │
└─────────────────────┬───────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────┐
│  TTM layer (ttm_bo.c, ttm_resource.c)                   │
│  ├─ ttm_buffer_object: lifecycle, lock, LRU management  │
│  ├─ ttm_resource_manager: allocator per domain          │
│  ├─ ttm_bo_validate(): ensure BO is in specified domain │
│  └─ ttm_bo_move(): cross-domain data migration (DMA/cpy)│
└─────────────────────┬───────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────┐
│  amdgpu TTM backend (amdgpu_ttm.c)                      │
│  ├─ amdgpu_bo_move(): DMA transfer via SDMA engine     │
│  ├─ amdgpu_ttm_io_mem_reserve(): map VRAM BAR          │
│  └─ amdgpu_ttm_backend_bind(): bind GART page table    │
└─────────────────────────────────────────────────────────┘

Memory Domains & BO Migration:

  ┌──────────────┐      eviction      ┌──────────────┐
  │   VRAM       │ ──────────────────▶ │     GTT      │
  │ (16GB GDDR6) │ ◀────────────────── │(system mem,  │
  │ fastest,GPU- │      validation     │ GPU-visible  │
  │ dedicated    │                     │ via GART)    │
  │  BO_A (4MB)  │                     │  BO_C (2MB)  │
  │  BO_B (16MB) │                     │  evicted BO  │
  └──────────────┘                     └──────┬───────┘
        ▲                                     │
        │                                     ▼
        │                              ┌──────────────┐
        │           swap               │   System     │
        └──────────────────────────────│  (main RAM,  │
                                       │  CPU mmap)   │
                                       └──────────────┘

amdgpu_bo struct nesting:
  struct amdgpu_bo {
      struct ttm_buffer_object  tbo;   ← TTM layer
      //  └─ struct drm_gem_object base; ← GEM layer (nested in tbo)
      struct list_head          shadow_list;
      struct amdgpu_bo_va      *bo_va;    ← GPU virtual address mapping
      uint32_t                  preferred_domains;
      uint32_t                  allowed_domains;
  };`,
            caption: 'GEM provides the user-space API (handle, mmap); TTM provides underlying memory domain management. When VRAM is full, TTM migrates inactive BOs to GTT/System using an LRU policy (eviction) and migrates them back when needed (validation). amdgpu_bo contains data structures from both layers.',
          },
          codeWalk: {
            title: 'amdgpu_gem_object_create — Creating a GPU Buffer Object',
            file: 'drivers/gpu/drm/amd/amdgpu/amdgpu_gem.c',
            language: 'c',
            code: `/* amdgpu_gem.c — GEM ioctl handler: create a Buffer Object */

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

    /* Create amdgpu_bo (contains ttm_buffer_object + drm_gem_object) */
    r = amdgpu_bo_create(adev, size,
                          args->in.alignment,
                          domain,       /* VRAM, GTT, or both */
                          args->in.flags,
                          ttm_bo_type_device,
                          NULL, &bo);
    if (r)
        return r;

    /* Create GEM handle for user space */
    r = drm_gem_handle_create(filp, &bo->tbo.base,
                               &args->out.handle);
    /*
     * drm_gem_handle_create():
     *   1. Allocates an integer ID in filp->object_idr
     *   2. Increments the gem_object reference count
     *   3. Returns the handle to user space
     */

    /* Drop the creation reference; user space holds a ref via handle */
    drm_gem_object_put(&bo->tbo.base);

    return r;
}

/* Underlying: amdgpu_bo_create calls TTM to allocate actual memory */
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

    /* Set preferred and allowed memory domains */
    bo->preferred_domains = domain;
    bo->allowed_domains = domain;
    amdgpu_bo_placement_from_domain(bo, domain);
    /* → Translates AMDGPU_GEM_DOMAIN_VRAM etc. into
     *   TTM's ttm_place struct (specifying mem_type) */

    /* Call TTM to initialize BO and allocate physical pages */
    ttm_bo_init_reserved(&adev->mman.bdev,
                          &bo->tbo, type,
                          &placement,
                          align >> PAGE_SHIFT,
                          false, size, NULL,
                          resv, &amdgpu_bo_destroy);
    /*
     * ttm_bo_init_reserved():
     *   1. Initializes the ttm_buffer_object structure
     *   2. Calls ttm_bo_validate() to allocate physical pages in the domain
     *   3. Returns the BO in reserved (locked) state
     */

    *bo_ptr = bo;
    return 0;
}`,
            annotations: [
              'args->in.domains can be AMDGPU_GEM_DOMAIN_VRAM | AMDGPU_GEM_DOMAIN_GTT (multiple domains allowed)',
              'amdgpu_bo_create initializes both GEM and TTM layer data structures simultaneously',
              'amdgpu_bo_placement_from_domain() translates amdgpu domain flags into a TTM placement description',
              'ttm_bo_init_reserved() calls ttm_bo_validate() to allocate physical pages in the preferred domain',
              'drm_gem_handle_create() returns a per-process integer handle; user space uses it to reference the BO',
              'drm_gem_object_put() drops the creator\'s reference — the BO\'s lifetime is managed by the user-space handle',
            ],
            explanation: 'This code shows the complete path of GPU Buffer Object creation: user space ioctl → GEM handle creation → amdgpu_bo allocation → TTM placement setup → physical page allocation. Notice how the domain parameter is translated from the user-space AMDGPU_GEM_DOMAIN_VRAM into TTM\'s placement struct — this is the key interface between the GEM and TTM layers. Understanding this creation flow is the starting point for understanding the entire GPU memory management system.',
          },
          miniLab: {
            title: 'Monitor GPU Buffer Object Allocation & VRAM Usage',
            objective: 'Use sysfs and debugfs interfaces to observe VRAM/GTT usage and understand how Buffer Objects consume GPU memory.',
            steps: [
              'Check current VRAM usage: cat /sys/class/drm/card0/device/mem_info_vram_used',
              'Check total VRAM: cat /sys/class/drm/card0/device/mem_info_vram_total',
              'Check GTT usage: cat /sys/class/drm/card0/device/mem_info_gtt_used',
              'Launch a GPU memory-intensive program (e.g., glxgears), then check VRAM usage again to see the change',
              'View TTM BO statistics (if debugfs is available): cat /sys/kernel/debug/dri/0/amdgpu_vram_mm',
              'Compare: run a 4K video player and observe the significant increase in VRAM usage (4K framebuffer ≈ 33MB)',
            ],
            expectedOutput: `$ cat /sys/class/drm/card0/device/mem_info_vram_used
285212672    ← ~272MB (desktop idle)

$ # after launching glxgears
$ cat /sys/class/drm/card0/device/mem_info_vram_used
310378496    ← ~296MB (increased by ~24MB for framebuffer and vertex data)

$ cat /sys/class/drm/card0/device/mem_info_vram_total
17163091968  ← ~16GB total VRAM

$ cat /sys/class/drm/card0/device/mem_info_gtt_used
52428800     ← ~50MB GTT in use`,
            hint: 'If debugfs files are not visible, make sure you are running as root and that debugfs is mounted. VRAM usage will not exactly match framebuffer size — the driver also allocates command buffers, page tables, firmware buffers, etc.',
          },
          debugExercise: {
            title: 'Find a Buffer Object Leak (Missing Unreference)',
            language: 'c',
            description: 'The following driver code forgets to release the Buffer Object reference on error paths, causing a BO leak each time the operation fails and eventually exhausting VRAM.',
            question: 'Identify the locations of the BO leaks and fix them.',
            buggyCode: `int my_submit_work(struct amdgpu_device *adev,
                    uint64_t size)
{
    struct amdgpu_bo *cmd_bo = NULL;
    struct amdgpu_bo *data_bo = NULL;
    int r;

    /* Allocate command BO */
    r = amdgpu_bo_create(adev, 4096, PAGE_SIZE,
        AMDGPU_GEM_DOMAIN_GTT, 0,
        ttm_bo_type_kernel, NULL, &cmd_bo);
    if (r)
        return r;

    /* Allocate data BO */
    r = amdgpu_bo_create(adev, size, PAGE_SIZE,
        AMDGPU_GEM_DOMAIN_VRAM, 0,
        ttm_bo_type_kernel, NULL, &data_bo);
    if (r)
        return r;  /* BUG: cmd_bo is allocated but not freed! */

    /* Use both BOs ... */
    r = do_gpu_work(adev, cmd_bo, data_bo);
    if (r)
        goto err_work;  /* BUG: neither BO is freed! */

    /* Success path: release BOs */
    amdgpu_bo_unref(&data_bo);
    amdgpu_bo_unref(&cmd_bo);
    return 0;

err_work:
    /* forgot to free cmd_bo and data_bo */
    return r;
}`,
            hint: 'Every successful amdgpu_bo_create holds one reference. All exit paths (including error paths) must call amdgpu_bo_unref() to release the reference. Using goto for unified error handling is the standard pattern in kernel code.',
            answer: 'There are two leaks: (1) when the second amdgpu_bo_create fails (data_bo allocation fails), the code does "return r" directly without freeing the already-allocated cmd_bo; (2) when do_gpu_work fails and jumps to err_work, the err_work label has no code to free either BO. Fix: use the kernel-standard chained goto error handling: if (r) goto err_data_bo; when data_bo allocation fails. The err_work label frees data_bo and falls through to err_data_bo which frees cmd_bo. Correct code: err_work: amdgpu_bo_unref(&data_bo); err_data_bo: amdgpu_bo_unref(&cmd_bo); return r; This "reverse-order release" pattern ensures resources are freed in the reverse order of their allocation. BO leaks are among the most common bugs in GPU drivers — in stress tests, leaking even a few KB of BO per operation can exhaust all VRAM within hours, causing subsequent allocations to fail and the GPU to hang.',
          },
          interviewQ: {
            question: 'Explain the roles and differences of GEM and TTM in DRM memory management. Why does amdgpu need TTM instead of just GEM?',
            difficulty: 'hard',
            hint: 'The key difference lies in VRAM management: GEM assumes the GPU uses system memory (appropriate for integrated GPUs); TTM supports independent VRAM + object migration + eviction (appropriate for discrete GPUs). As a discrete GPU driver, amdgpu needs to manage data transfers between VRAM and GTT.',
            answer: 'GEM and TTM are two DRM memory management frameworks that solve problems at different levels. GEM (Graphics Execution Manager) provides the user-space API for Buffer Objects — referencing BOs via GEM handles, giving the CPU access via mmap, and managing lifecycles via reference counting. GEM was originally designed for Intel i915 (an integrated GPU that uses system memory) and assumes all memory is homogeneous. TTM (Translation Table Manager) adds three key capabilities on top of GEM for discrete GPUs: (1) Memory Domains (Placement) — a BO can reside in VRAM (GPU-dedicated, highest bandwidth), GTT (portion of system memory the GPU can access via GART), or System (ordinary system memory). (2) Object Migration — when a BO needs to move from System to VRAM (GPU is about to use it) or from VRAM to GTT (VRAM is insufficient), TTM coordinates the DMA data transfer. (3) Memory Pressure Handling (Eviction) — when VRAM is full, TTM selects BOs to migrate to GTT/System using an LRU policy, analogous to virtual memory page eviction. amdgpu must use TTM because AMD discrete GPUs have independent VRAM (e.g., the RX 7600 XT has 16GB GDDR6); the driver needs to efficiently transfer data between VRAM and system memory, handle VRAM pressure, and manage the GART page table. The GEM layer is still used to expose a unified API to user space — users do not need to know whether a BO is currently in VRAM or GTT; TTM manages that transparently.',
            amdContext: 'This is a common memory management fundamentals question in AMD interviews. When answering, emphasize the "GEM as facade, TTM as backend" architectural design in amdgpu, and demonstrate that you understand why discrete GPUs need more complex memory management than integrated GPUs.',
          },
        },

        // ── Lesson 4.2.2 ──────────────────────────────────────
        {
          id: '4-2-2',
          number: '4.2.2',
          title: 'DMA-BUF: Cross-Device Buffer Sharing',
          titleEn: 'DMA-BUF: Cross-Device Buffer Sharing',
          duration: 20,
          difficulty: 'advanced',
          tags: ['DMA-BUF', 'prime', 'zero-copy', 'exporter', 'importer', 'scatter-gather'],
          concept: {
            summary: 'DMA-BUF is the Linux kernel\'s cross-device Buffer sharing protocol. It allows one device (the exporter, e.g. a GPU) to export a memory Buffer as a file descriptor (fd), and another device (the importer, e.g. a video decoder or another GPU) to import and directly access the same physical memory via that fd — enabling zero-copy sharing. In DRM, prime_handle_to_fd exports a GEM BO, and prime_fd_to_handle imports it.',
            explanation: [
              'Imagine a typical scenario: you are playing a 4K video. The video decoder (VCN hardware) decodes a frame of YUV data into a VRAM Buffer, and the GPU then needs to use that frame as a texture to render to the desktop. Without DMA-BUF, you would need to: (1) copy data from VRAM to system memory; (2) have the GPU read data from system memory into VRAM. Two PCIe data transfers, with enormous latency and bandwidth waste. DMA-BUF lets the decoder share the VRAM Buffer directly with the GPU — zero copies; both hardware units access the same physical memory.',
              'The core of DMA-BUF is the exporter/importer model. The Exporter is the owner of the Buffer — it allocates memory, manages the lifecycle of physical pages, and provides a scatter-gather table (describing the physical page layout of the Buffer). The Importer is the consumer of the Buffer — it receives the scatter-gather table via the DMA-BUF fd and maps those physical pages into its own device address space. The Exporter must implement dma_buf_ops callbacks: .map_dma_buf (provide the scatter-gather table), .unmap_dma_buf (release mapping), .release (final Buffer release), and .begin_cpu_access / .end_cpu_access (cache coherency maintenance during CPU access).',
              'In DRM, DMA-BUF is exposed to user space through the PRIME (Portable Render Interface for Multi-device Extension) interface. Export: user space calls DRM_IOCTL_PRIME_HANDLE_TO_FD to convert a GEM handle into a DMA-BUF fd. Import: user space calls DRM_IOCTL_PRIME_FD_TO_HANDLE to convert a received DMA-BUF fd into a local device GEM handle. Once a GEM handle is obtained, the shared memory can be used just like a local BO.',
              'The scatter-gather table (sg_table) is the key data structure in DMA-BUF sharing. A GPU Buffer\'s physical pages are typically not contiguous — it may be composed of thousands of scattered 4KB pages. The sg_table lists the physical addresses and lengths of all these pages, letting the importer\'s DMA engine know how to access the complete Buffer. The IOMMU/GART hardware maps these scattered physical pages into a contiguous virtual address space for the device, so the Buffer appears contiguous to the GPU.',
              'Zero-copy is the core value of DMA-BUF. In a Wayland compositor, each window\'s framebuffer is rendered into a Buffer by that application\'s GPU context, then shared with the compositor\'s GPU context via DMA-BUF. The compositor composites multiple windows\' Buffers into the final scanout framebuffer. Throughout this entire process, pixel data remains in VRAM and never passes through the CPU or system memory — this is why modern Linux desktops are so efficient.',
              'In amdgpu, DMA-BUF export is handled by amdgpu_gem_prime_export() (which actually uses the DRM core\'s drm_gem_prime_export), which creates a dma_buf object and associates the amdgpu_dmabuf_ops callbacks. Import is handled by amdgpu_gem_prime_import(), which retrieves the sg_table from the DMA-BUF fd and creates a new amdgpu_bo wrapping the shared physical pages. If the imported DMA-BUF comes from the same amdgpu device, the driver reuses the original amdgpu_bo directly (self-import optimization), avoiding unnecessary sg_table creation.',
            ],
            keyPoints: [
              'DMA-BUF is Linux\'s cross-device zero-copy Buffer sharing protocol: exporter allocates memory, importer shares access',
              'DRM PRIME interface: prime_handle_to_fd (export GEM → fd), prime_fd_to_handle (import fd → GEM)',
              'scatter-gather table (sg_table) describes the scattered physical pages of a Buffer; the importer uses it to set up DMA mappings',
              'dma_buf_ops callbacks: .map_dma_buf, .unmap_dma_buf, .release, .begin/end_cpu_access',
              'Wayland compositor: each window shares its framebuffer with the compositor via DMA-BUF for zero-copy compositing',
              'amdgpu self-import optimization: same-device DMA-BUF reuses the original BO directly, skipping sg_table',
            ],
          },
          diagram: {
            title: 'DMA-BUF Cross-Device Sharing: From GPU to Video Decoder',
            content: `DMA-BUF Cross-Device Buffer Sharing Flow

Scenario: Wayland compositor + video player

Video Player Process                       Wayland Compositor Process
───────────────                            ──────────────────────────

1. VCN decodes video frame into BO
   amdgpu_bo (VRAM)
   Physical pages: [0x1000, 0x2000, ...]
        │
2. Export DMA-BUF fd
   ioctl(gpu_fd,
     PRIME_HANDLE_TO_FD, &args)
        │
        │  fd = 42 (DMA-BUF file descriptor)
        │
        │  ┌─────────────────────┐
        │  │  struct dma_buf     │
        │  │  ├─ ops: amdgpu_*  │
        │  │  ├─ size: 8294400  │ (1920×1080×4)
        │  │  ├─ file: fd=42    │
        │  │  └─ priv: amdgpu_bo│
        │  └─────────────────────┘
        │
3. Pass fd via Unix socket ────────────▶  4. Receive fd=42
   sendmsg(SCM_RIGHTS)                      │
                                            │
                                         5. Import DMA-BUF
                                            ioctl(gpu_fd,
                                              PRIME_FD_TO_HANDLE,
                                              &args)
                                            │
                                            ▼
                                         6. Get local GEM handle
                                            handle = 17
                                            │
                                            ▼
                                         7. Bind as texture for rendering
                                            GPU reads directly from the
                                            same physical pages [0x1000, ...]
                                            Zero copy!

Physical Memory Perspective:
┌──────────────────────────────────────────────────────┐
│  VRAM                                                 │
│                                                       │
│  ┌─────────┐                                          │
│  │ Video   │ ← VCN decoded output (exporter's BO)   │
│  │ frame   │ ← also compositor's texture (importer)  │
│  │ 1920x   │                                         │
│  │ 1080    │                                         │
│  │ NV12    │                                         │
│  └─────────┘                                          │
│  Same physical memory; two processes access via       │
│  different BOs — data was never copied                │
└──────────────────────────────────────────────────────┘

DMA-BUF sg_table (scatter-gather table):
  ┌────────────────────────────────────────┐
  │  entry[0]: phys=0x80001000, len=4096   │
  │  entry[1]: phys=0x80005000, len=4096   │
  │  entry[2]: phys=0x80002000, len=8192   │
  │  ...                                    │
  │  → Importer's IOMMU/GART maps these   │
  │    scattered pages into a contiguous   │
  │    device virtual address space        │
  └────────────────────────────────────────┘`,
            caption: 'The complete zero-copy flow with DMA-BUF. The video decoder (VCN) decodes frame data into VRAM and shares it with the compositor via a DMA-BUF fd; the compositor uses the same VRAM data directly as a texture — the data never leaves VRAM.',
          },
          codeWalk: {
            title: 'amdgpu PRIME Export — Exporting a DMA-BUF',
            file: 'drivers/gpu/drm/amd/amdgpu/amdgpu_dma_buf.c',
            language: 'c',
            code: `/* amdgpu_dma_buf.c — DMA-BUF export/import implementation */

/* dma_buf_ops callback: map the amdgpu BO's physical pages for importer */
static struct sg_table *
amdgpu_gem_map_dma_buf(struct dma_buf_attachment *attach,
                        enum dma_data_direction dir)
{
    struct drm_gem_object *obj = attach->dmabuf->priv;
    struct amdgpu_bo *bo = gem_to_amdgpu_bo(obj);
    struct sg_table *sgt;
    long r;

    /* Ensure BO is in GTT domain (importer needs PCIe access) */
    r = amdgpu_bo_pin(bo, AMDGPU_GEM_DOMAIN_GTT);
    /*
     * If the BO is currently in VRAM and the importer is another device,
     * it must be migrated to GTT (system memory) for PCIe access.
     * If the importer is the same GPU, VRAM is directly accessible.
     */

    /* Get the physical page scatter-gather table of the BO */
    sgt = drm_prime_pages_to_sg(obj->dev,
                                 bo->tbo.ttm->pages,
                                 bo->tbo.ttm->num_pages);

    /* Establish DMA mapping (set up IOMMU/GART mapping) */
    dma_map_sgtable(attach->dev, sgt, dir, 0);
    /*
     * dma_map_sgtable() does two things:
     *   1. If IOMMU is present: map physical pages into IOMMU address space
     *   2. CPU cache sync: ensure the device sees the latest data
     */

    return sgt;
}

/* Complete dma_buf_ops structure */
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

/* Import path: create a local BO from a DMA-BUF fd */
struct drm_gem_object *
amdgpu_gem_prime_import(struct drm_device *dev,
                         struct dma_buf *dma_buf)
{
    struct drm_gem_object *obj;

    /* Self-import optimization: if DMA-BUF is from the same amdgpu */
    if (dma_buf->ops == &amdgpu_dmabuf_ops) {
        obj = dma_buf->priv;
        if (obj->dev == dev) {
            /* Same device — reuse the original BO directly, just add a ref */
            drm_gem_object_get(obj);
            return obj;
        }
    }

    /* Different device — create an import BO wrapping the shared pages */
    return drm_gem_prime_import(dev, dma_buf);
}`,
            annotations: [
              'amdgpu_gem_map_dma_buf exposes the BO\'s physical pages to the importer via an sg_table',
              'amdgpu_bo_pin() ensures the BO is not evicted (migrated), guaranteeing stable addresses during importer access',
              'drm_prime_pages_to_sg() converts the TTM-managed physical page array into a scatter-gather table',
              'dma_map_sgtable() sets up IOMMU mapping and cache coherency — the key to cross-device sharing',
              'Self-import optimization: a DMA-BUF exported from the same device reuses the original BO, avoiding extra sg_table overhead',
              'begin/end_cpu_access callbacks ensure that CPU reads of the shared Buffer see the latest data written by the device',
            ],
            explanation: 'The core of DMA-BUF export is amdgpu_gem_map_dma_buf() — it packages the amdgpu BO\'s physical pages into an sg_table for the importer. Notice the amdgpu_bo_pin() call: during export, the BO must be pinned (migration not allowed); otherwise the physical pages being accessed by the importer could be moved away by a TTM eviction, corrupting data. The self-import optimization demonstrates kernel code\'s awareness of efficiency — same-device sharing does not need to go through the full DMA-BUF protocol.',
          },
          miniLab: {
            title: 'Inspect DMA-BUF References in /proc/pid/fdinfo',
            objective: 'Use the /proc filesystem to observe DMA-BUF usage in a live system and understand how pervasive zero-copy sharing is in a desktop environment.',
            steps: [
              'Find the PID of the Wayland compositor: pidof gnome-shell or pidof kwin_wayland or pidof sway',
              'View its open DMA-BUF file descriptors: ls -la /proc/<pid>/fd/ | grep dmabuf',
              'View detailed DMA-BUF info: cat /proc/<pid>/fdinfo/<fd_num> (look for entries containing "drm-driver")',
              'Count total size of all DMA-BUFs in the system: cat /sys/kernel/debug/dma_buf/bufinfo (requires root)',
              'Launch a video player (e.g., mpv), then check the DMA-BUF count again to see the increase',
              'Compare /sys/kernel/debug/dma_buf/bufinfo before and after playback to confirm video frames use DMA-BUF sharing',
            ],
            expectedOutput: `$ cat /proc/$(pidof gnome-shell)/fdinfo/14
pos:    0
flags:  02000002
mnt_id: 10
ino:    1234
drm-driver:     amdgpu
drm-pdev:       0000:03:00.0
drm-total-vram: 16368 MiB
drm-shared-vram:        48 MiB   ← VRAM shared with other processes
drm-total-gtt:  128 MiB

$ sudo cat /sys/kernel/debug/dma_buf/bufinfo
size    flags   mode    count   exp_name
8294400 000002  00000007 2      amdgpu  ← 8MB framebuffer, 2 holders
4194304 000002  00000007 3      amdgpu  ← 4MB buffer, 3 holders`,
            hint: 'If /proc/pid/fdinfo lacks drm-* fields, your kernel version may be old. Linux 5.15+ added DRM memory statistics to fdinfo. You can also use sudo cat /sys/kernel/debug/dma_buf/bufinfo to view global DMA-BUF information.',
          },
          debugExercise: {
            title: 'Diagnose DMA-BUF Import Failure: Size Mismatch',
            language: 'c',
            description: 'A video player shares decoded frames with the GPU renderer via DMA-BUF. The import succeeds but the rendered output shows garbage pixels. There are no obvious errors in dmesg.',
            question: 'What causes the garbage pixels? Hint: examine the assumptions that exporter and importer make about Buffer size.',
            buggyCode: `/* Video decoder (exporter) — allocate decode frame Buffer */
int alloc_decode_buffer(int gpu_fd, uint32_t *handle)
{
    struct drm_amdgpu_gem_create args = {
        .in = {
            /* 1920x1080 NV12 format: Y plane + UV plane */
            /* NV12: height * stride * 1.5 */
            .bo_size = 1920 * 1080 * 3 / 2,  /* 3110400 bytes */
            .domains = AMDGPU_GEM_DOMAIN_VRAM,
        }
    };
    ioctl(gpu_fd, DRM_IOCTL_AMDGPU_GEM_CREATE, &args);
    *handle = args.out.handle;

    /* Export as DMA-BUF */
    struct drm_prime_handle prime = {
        .handle = args.out.handle,
        .flags = DRM_RDWR,
    };
    ioctl(gpu_fd, DRM_IOCTL_PRIME_HANDLE_TO_FD, &prime);
    return prime.fd;
}

/* GPU renderer (importer) — use decoded frame as a texture */
void use_as_texture(int gpu_fd, int dmabuf_fd)
{
    struct drm_prime_handle prime = {
        .fd = dmabuf_fd,
    };
    ioctl(gpu_fd, DRM_IOCTL_PRIME_FD_TO_HANDLE, &prime);

    /* BUG: assumes Buffer is XRGB8888 format */
    /* XRGB8888: width * height * 4 = 8294400 bytes */
    /* but actual Buffer is only 3110400 bytes (NV12) */
    bind_texture(prime.handle, 1920, 1080,
                 DRM_FORMAT_XRGB8888);  /* format mismatch! */
    /* GPU reads beyond Buffer boundary → garbage pixels */
}`,
            hint: 'DMA-BUF transfers only a physical memory reference, not format metadata (width, height, pixel format, stride). The exporter and importer must agree on Buffer format parameters through another channel (e.g., the Wayland protocol).',
            answer: 'The problem: the exporter allocates an NV12-format Buffer (1920×1080×1.5 = 3,110,400 bytes), but the importer assumes it is XRGB8888 format (1920×1080×4 = 8,294,400 bytes). XRGB8888 is 4 bytes per pixel, NV12 is 1.5 bytes per pixel — the importer expects a Buffer 2.67× larger than the actual size. When the GPU reads it as a texture, it reads beyond the Buffer boundary into uninitialized VRAM content, which appears as garbage pixels. The DMA-BUF protocol itself does not carry pixel format information — it is just a shared handle for "raw memory." Format information must be negotiated through an out-of-band channel: in Wayland, the client declares format, width, height, and stride when creating a wl_buffer; in V4L2, VIDIOC_S_FMT sets the format. Fix: the importer should use the correct format DRM_FORMAT_NV12, or the exporter should allocate an XRGB8888 Buffer (if both sides agree on XRGB). Key lesson: DMA-BUF shares physical memory; metadata (format, dimensions) must be synchronized through another protocol.',
          },
          interviewQ: {
            question: 'Explain the exporter/importer model of the DMA-BUF protocol. In a Wayland desktop environment, how does DMA-BUF enable zero-copy window compositing?',
            difficulty: 'hard',
            hint: 'Describe the responsibilities of the exporter (allocate memory, provide sg_table, manage lifecycle) and the importer (establish DMA mapping via sg_table). In the Wayland scenario, explain how window content is passed from an application\'s GPU context to the compositor\'s GPU context with zero copies.',
            answer: 'The DMA-BUF exporter/importer model: the Exporter is the owner of the Buffer, responsible for (1) allocating physical memory; (2) implementing dma_buf_ops callbacks (.map_dma_buf provides the scatter-gather table, .release frees memory); (3) ensuring memory is valid while the importer accesses it (pinning the BO to prevent eviction). The Importer is the consumer of the Buffer; via the DMA-BUF fd it (1) attaches to the exporter\'s dma_buf; (2) calls .map_dma_buf to get the sg_table (list of physical pages); (3) maps the physical pages into its own device address space (via IOMMU/GART); (4) unmaps and detaches when done. In Wayland zero-copy compositing: (1) the application process\'s GPU context renders window content into a VRAM Buffer; (2) the application exports the BO as a DMA-BUF fd via DRM PRIME (prime_handle_to_fd); (3) the fd is passed to the compositor via the Wayland protocol (wl_drm or linux-dmabuf-v1) and a Unix socket (SCM_RIGHTS); (4) the compositor imports the DMA-BUF fd as a local GEM handle via prime_fd_to_handle; (5) the compositor binds the handle as a GPU texture, compositing all windows into the final scanout framebuffer; (6) throughout the entire process, pixel data remains in VRAM and never passes through the CPU or system memory — this is zero-copy. Key details: same-GPU self-import reuses the original BO directly (refcount+1), no sg_table needed; cross-device sharing requires the BO in GTT/System domain (PCIe-accessible), which has lower performance than same-VRAM sharing.',
            amdContext: 'DMA-BUF is one of the cornerstones of the Linux graphics stack. In an AMD interview, demonstrating that you understand the complete path from the Wayland protocol through DRM PRIME to the kernel\'s dma_buf_ops, and the importance of zero-copy for desktop performance, will convey that you have a system-level perspective.',
          },
        },
      ],
    },
  ],
  completionChecklist: [
    'Understand the DRM core architecture: drm_device / drm_driver / ioctl dispatch mechanism',
    'Describe the KMS display pipeline: Plane → CRTC → Encoder → Connector and the responsibility of each',
    'Understand the two-phase Atomic Mode Setting commit (check → commit) and test-only mode',
    'Master the role difference between GEM and TTM: GEM as the user-space interface, TTM for VRAM domain management and eviction',
    'Understand the Buffer Object lifecycle: create → place → map → use → migrate → destroy',
    'Explain the DMA-BUF exporter/importer model and zero-copy principles',
    'Know the corresponding amdgpu implementations: amdgpu_kms_driver, amdgpu_dm, amdgpu_ttm, amdgpu_dma_buf',
    'Use sysfs/debugfs/modetest/strace tools to observe the operating state of the DRM subsystem',
    'Can narrate one complete display or BO path from user-space request to DRM state change and hardware-visible result',
  ],
};
