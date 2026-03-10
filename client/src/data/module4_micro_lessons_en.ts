// ============================================================
// AMD Linux Driver Learning Platform - Module 4 Micro-Lessons (English)
// Module 4: DRM Subsystem (graphicsdriverand DRM subsystem)
// 5 lessons in 2 groups, ~15-20 min each, total ~60h curriculum
// ============================================================
import type { MicroLessonModule } from './micro_lesson_types';

export const module4MicroLessonsEn: MicroLessonModule = {
  moduleId: 'drm',
  groups: [
    // ════════════════════════════════════════════════════════════
    // Group 4.1: DRM Core & KMS (DRM coreanddisplaypipeline)
    // ════════════════════════════════════════════════════════════
    {
      id: '4-1',
      number: '4.1',
      title: 'DRM coreanddisplaypipeline',
      titleEn: 'DRM Core & KMS',
      icon: '🖥️',
      description: '深入understand DRM frameworkcoreobject drm_device / drm_driver, master KMS displaypipelinein CRTC, Encoder, Connector, Plane 角色, and Atomic Mode Setting workprinciple. ',
      lessons: [
        // ── Lesson 4.1.1 ──────────────────────────────────────
        {
          id: '4-1-1',
          number: '4.1.1',
          title: 'DRM corearchitecture: drm_device and drm_driver',
          titleEn: 'DRM Core Architecture: drm_device & drm_driver',
          duration: 20,
          difficulty: 'advanced',
          tags: ['DRM', 'drm_device', 'drm_driver', 'ioctl', 'dev-dri'],
          concept: {
            summary: 'DRM(Direct Rendering Manager)is Linux kernelinall GPU driver公共framework. each GPU 由a drm_device 实例代表, 而 drm_driver structure体define该 GPU driverallcallback function. user spacethrough /dev/dri/card0 打开device, kernel DRM corethrough drm_ioctl() willrequest分发tospecificdriverhandlefunction. ',
            explanation: [
              'DRM subsystem位于 drivers/gpu/drm/, is Linux graphicsstackkernellayer基石. 它asall GPU driverprovide统一basics设施: devicefilemanagement(/dev/dri/card0, /dev/dri/renderD128), ioctl 分发, GEM memory managementinterface, KMS displaymanagement, and sysfs/debugfs 暴露. different GPU driver(amdgpu, i915, nouveau)allregistrationto DRM framework, 利用它provide公共function, 只需implementationhardwarespecific部分. ',
              'drm_device is DRM frameworkin最coredata structure, 代表systemina GPU 实例. 它由 drm_dev_alloc() allocation, contain: dev(底layer struct device pointer), driver(指向 drm_driver pointer), primary and render(指向 /dev/dri/card0 and renderD128  drm_minor node), mode_config(KMS alldisplayobject: CRTC, Encoder, Connector 等), vma_offset_manager(GEM objectvirtual addressmanagement). amdgpu driverwill drm_device 嵌入toself更大 amdgpu_device structure体in, through container_of macro互相convert. ',
              'drm_driver structure体isdriver向 DRM frameworkregistrationabilityinterface. 它contain一seriescallback functionpointer: .load(already废弃, 现inuse devm managementinitialization), .open / .postclose(user space打开/关闭devicefile时callback), .gem_create_object(create GEM Buffer Object 时callback), .dumb_create / .dumb_map_offset(asframebufferallocation"哑"Buffer), .ioctls and .num_ioctls(driverspecific ioctl 表). amdgpu  drm_driver 实例is amdgpu_kms_driver, definein amdgpu_drv.c in. ',
              'ioctl 分发is DRM frameworkcoremechanism. whenuser spacecall ioctl(fd, DRM_IOCTL_AMDGPU_CS, &args) 时, kernel VFS layerwillcallpass给 drm_ioctl() function(drm_ioctl.c). drm_ioctl() firstcheck ioctl 编号: ifis DRM coredefine(如 DRM_IOCTL_VERSION, DRM_IOCTL_GEM_CLOSE), 由 DRM coredirectlyhandle; ifisdriverspecific(编号 >= DRM_COMMAND_BASE), 则lookup drm_driver.ioctls[] 表分发todriverhandlefunction. amdgpu define约 20 个driverspecific ioctl(AMDGPU_CS, AMDGPU_GEM_CREATE, AMDGPU_INFO 等). ',
              '/dev/dri/ directorybelowdevicefileisuser spaceaccess GPU entry point. card0 is"master"node, 拥has KMS permission(cansetdisplaypattern), usually由 Xorg/Wayland compositor 打开. renderD128 is"render"node, onlyrenderingandcomputepermission(no KMS), 普通applicationprogram(如游戏)through它access GPU. 这种分离ensure普general户can利用 GPU rendering而will not意outside改变displayset. ',
            ],
            keyPoints: [
              'drm_device 代表a GPU 实例, 由 drm_dev_alloc() create, containdevicenode, mode_config 等',
              'drm_driver definedrivercallback: .open, .postclose, .gem_create_object, .dumb_create, .ioctls',
              'amdgpu will drm_device 嵌入 amdgpu_device, through container_of macro互相convert',
              'drm_ioctl() according to ioctl 编号分发to DRM corehandleordriverspecifichandlefunction',
              '/dev/dri/card0 (master) 拥has KMS permission, /dev/dri/renderD128 (render) onlyrenderingpermission',
              'amdgpu define约 20 个driverspecific ioctl(DRM_COMMAND_BASE + offset)',
            ],
          },
          diagram: {
            title: 'DRM corearchitectureand ioctl 分发path',
            content: `DRM corearchitecture: fromuser spacetohardwaredriver ioctl 分发

user space
─────────────────────────────────────────────────────────
  Mesa / libdrm / Wayland compositor
       │
       │  ioctl(fd, DRM_IOCTL_AMDGPU_CS, &args)
       │  fd = open("/dev/dri/renderD128")
       │
═══════╪═══════ system callboundary (Ring 3 → Ring 0) ═════════
       │
kernel space
       ▼
  VFS: file_operations.unlocked_ioctl
       │
       ▼
  drm_ioctl()                        (drivers/gpu/drm/drm_ioctl.c)
  ├─ parse ioctl 编号: cmd = _IOC_NR(nr)
  ├─ cmd < DRM_COMMAND_BASE ?
  │   ├─ YES → DRM core ioctl 表        ┌──────────────────────┐
  │   │   drm_ioctls[cmd]               │ DRM_IOCTL_VERSION    │
  │   │                                  │ DRM_IOCTL_GEM_CLOSE  │
  │   │                                  │ DRM_IOCTL_MODE_*     │
  │   │                                  └──────────────────────┘
  │   │
  │   └─ NO → driverspecific ioctl 表         ┌──────────────────────┐
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
  amdgpu driverhandlefunction (amdgpu_kms.c, amdgpu_gem.c, ...)
                      │
                      ▼
  amdgpu_device (内嵌 drm_device)
  ┌───────────────────────────────────────────────────┐
  │  struct amdgpu_device {                           │
  │      struct drm_device        ddev;  ← DRM core  │
  │      struct amdgpu_ring       gfx_ring[...];      │
  │      struct amdgpu_vm_manager vm_manager;         │
  │      struct amdgpu_gmc        gmc;   ← VRAM/GTT  │
  │      void __iomem            *rmmio; ← registerBAR │
  │      ...                                          │
  │  };                                               │
  └───────────────────────────────────────────────────┘`,
            caption: 'DRM ioctl 分发completepath. DRM corehandlegeneraloperate(VERSION, GEM_CLOSE, MODE_*), driverspecificoperate(AMDGPU_CS, AMDGPU_GEM_CREATE)由 amdgpu selfhandlefunctioncomplete. ',
          },
          codeWalk: {
            title: 'amdgpu  drm_driver registrationand ioctl 表',
            file: 'drivers/gpu/drm/amd/amdgpu/amdgpu_drv.c',
            language: 'c',
            code: `/* amdgpu_drv.c — amdgpu  drm_driver define */

static const struct drm_driver amdgpu_kms_driver = {
    .driver_features =
        DRIVER_ATOMIC |         /* support Atomic Mode Setting */
        DRIVER_GEM |            /* support GEM memory management */
        DRIVER_RENDER |         /* support renderD128 node */
        DRIVER_MODESET |        /* support KMS displaypipeline */
        DRIVER_SYNCOBJ |        /* support sync object synchronization */
        DRIVER_SYNCOBJ_TIMELINE, /* support timeline syncobj */

    .open = amdgpu_driver_open_kms,
    .postclose = amdgpu_driver_postclose_kms,
    .lastclose = amdgpu_driver_lastclose_kms,

    /* GEM callback */
    .gem_prime_import = amdgpu_gem_prime_import,

    /* framebuffer dumb buffer */
    .dumb_create = amdgpu_mode_dumb_create,
    .dumb_map_offset = amdgpu_mode_dumb_mmap,

    /* driverspecific ioctl 表 */
    .ioctls = amdgpu_ioctls_kms,
    .num_ioctls = ARRAY_SIZE(amdgpu_ioctls_kms),

    .fops = &amdgpu_driver_kms_fops,
    .name = "amdgpu",
    .desc = "AMD GPU",
    .major = KMS_DRIVER_MAJOR,
    .minor = KMS_DRIVER_MINOR,
    .patchlevel = KMS_DRIVER_PATCHLEVEL,
};

/* amdgpu driverspecific ioctl 分发表 */
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

/* probe functioninregistration drm_device */
static int amdgpu_pci_probe(struct pci_dev *pdev,
                             const struct pci_device_id *ent)
{
    struct drm_device *ddev;
    struct amdgpu_device *adev;

    /* allocation drm_device + amdgpu_device */
    adev = devm_drm_dev_alloc(&pdev->dev,
                               &amdgpu_kms_driver,
                               struct amdgpu_device,
                               ddev);
    /* adev->ddev alreadyinitializationas drm_device
     * adev->ddev.dev = &pdev->dev
     * adev->ddev.driver = &amdgpu_kms_driver
     */

    ddev = &adev->ddev;

    /* initialization GPU hardware */
    amdgpu_device_init(adev, flags);

    /* registration DRM device — create /dev/dri/card0, renderD128 */
    drm_dev_register(ddev, ent->driver_data);
    return 0;
}`,
            annotations: [
              'DRIVER_ATOMIC | DRIVER_GEM | DRIVER_RENDER | DRIVER_MODESET 声明driversupport DRM function子集',
              '.open / .postclose inuser spaceeach time open/close /dev/dri/* 时call, management per-file context',
              '.ioctls = amdgpu_ioctls_kms registrationdriverspecific ioctl 表, DRM core据此分发request',
              'DRM_RENDER_ALLOW flagrepresent此 ioctl canthrough renderD128 nodecall(notneed master permission)',
              'devm_drm_dev_alloc meanwhileallocation drm_device andoutsidelayer amdgpu_device, lifecycle由 devres management',
              'drm_dev_register() createdevicenode并will drm_device registrationto DRM coresubsystem',
            ],
            explanation: 'thiscodedemonstrate amdgpu how向 DRM frameworkregistrationself. amdgpu_kms_driver 像一份"ability清单" — 它告诉 DRM core"我support Atomic Mode Setting, GEM memory, renderingnode, KMS display", 并provideeachabilitycorrespondinghandlefunction. whenuser space发起 ioctl 时, DRM corelookup amdgpu_ioctls_kms[] 表, findcorrespondinghandlefunction(如 amdgpu_cs_ioctl)并call它. understandthisregistrationmechanismisunderstandentire DRM framework钥匙. ',
          },
          miniLab: {
            title: 'view DRM devicenodeanddriverinformation',
            objective: 'through sysfs and libdrm toolview DRM deviceinformation, understand drm_device inuser spacecan见形态. ',
            steps: [
              '列出all DRM devicenode: ls -la /dev/dri/(should看to card0, renderD128 等)',
              'view DRM versioninformation: cat /sys/class/drm/card0/device/driver/module/version orrun sudo drmdevice -v(ifinstall libdrm-tests)',
              'use libdrm viewdriver名称andversion: writesimpleprogramoruse python3 -c "import fcntl,struct,os; fd=os.open(\'/dev/dri/card0\',os.O_RDWR); print(fcntl.ioctl(fd,0xc0406400,b\'\\x00\'*64))"(DRM_IOCTL_VERSION)',
              'view DRM device debugfs: ls /sys/kernel/debug/dri/0/(need root permission)',
              'statistics amdgpu registrationhow much ioctl: grep -c "DRM_IOCTL_DEF_DRV" drivers/gpu/drm/amd/amdgpu/amdgpu_drv.c(inkernelsource codein)',
              'viewcurrent打开 DRM deviceprocess: sudo fuser /dev/dri/card0 /dev/dri/renderD128',
            ],
            expectedOutput: `$ ls -la /dev/dri/
crw-rw----+ 1 root video 226,   0 ... card0        ← master node
crw-rw----+ 1 root render 226, 128 ... renderD128   ← render node

$ ls /sys/kernel/debug/dri/0/
amdgpu_dm_visual_confirm  amdgpu_gpu_recover  amdgpu_ring_gfx
amdgpu_fence_info         amdgpu_pm_info      amdgpu_vram_mm
...  ← 大量 amdgpu  debugfs 条目

$ sudo fuser /dev/dri/card0
/dev/dri/card0:     1234  5678  ← Xorg/Wayland and compositor`,
            hint: 'if /sys/kernel/debug/dri/ as空, ensurealready挂载 debugfs: mount -t debugfs none /sys/kernel/debug. debugfs iskerneldebuggingimportantinterface, amdgpu inwhere暴露大量internalstate. ',
          },
          debugExercise: {
            title: 'find缺失 drm_dev_unregister causeresourceleak',
            language: 'c',
            description: 'belowisa简化 DRM driver probe and remove function. driverunloadingafter, /dev/dri/card0 stillexist且user spaceprogramagain次 open willcausekernel oops. ',
            question: 'whydriverunloadingafterdevicefilestillexist? howfix? ',
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
    /* BUG: 忘记call drm_dev_unregister(ddev) */
    /* also忘记 drm_dev_put(ddev) ifnot用 devm */
}`,
            hint: '对称性原则: drm_dev_register() and drm_dev_unregister() must配对. registration时createdevicenodeand sysfs 条目, deregistration时must移除they. ',
            answer: 'issue: remove functionin缺少 drm_dev_unregister(ddev). drm_dev_register() in probe increate /dev/dri/card0 and /dev/dri/renderD128 devicenode, registration sysfs property, 并will drm_device add DRM coreglobaldevicelist. if remove innotcall drm_dev_unregister(), theseresourcewill notbycleanup: (1)devicenodestillexist于 /dev/dri/, user spacecancontinue open 它; (2)但底layerhardwarealreadyby my_hw_fini() release, 任何through该devicenode ioctl allwillaccessalreadyreleasememory, cause use-after-free andkernel oops. fix: in my_hw_fini() beforecall drm_dev_unregister(ddev) — 先from DRM corederegistration(阻止新 ioctl), againreleasehardwareresource. 这遵循"registrationorder相反"原则: probe in先 init after register, remove in先 unregister after fini. ',
          },
          interviewQ: {
            question: 'explain DRM subsystemarchitecturedesign: drm_device, drm_driver and ioctl 分发mechanismishow协作? why shoulddesign card and render 两种devicenode? ',
            difficulty: 'hard',
            hint: 'from分layerdesign(DRM core vs driverspecificcode), ioctl 分发表(drm_ioctls[] vs drm_driver.ioctls[]), andsecurity模型(card master permission vs render 普通permission)角度answer. ',
            answer: 'DRM 采用framework+插件architecture: (1)drm_device iscoredata structure, 代表a GPU 实例, 持has mode_config(all KMS object), file_list(all打开filedescriptor)and driver pointer. 它through devm_drm_dev_alloc() allocation并嵌入tospecificdriverdevicestructurein(如 amdgpu_device.ddev). (2)drm_driver isdriver"registration表" — through .driver_features 声明supportfunction子集, throughcallback function(.open, .postclose, .gem_create_object, .dumb_create)providehardwarespecificimplementation, through .ioctls[] registrationdriverspecific ioctl. (3)ioctl 分发: drm_ioctl() receiveall DRM ioctl call, according to ioctl 编号判断走 DRM core表(drm_ioctls[], handle VERSION, GEM_CLOSE, MODE_* 等generaloperate)stillisdriver表(drm_driver.ioctls[], handle AMDGPU_CS 等driver特hasoperate). (4)card vs render node分离issecurity模型key: card0 node拥has DRM master permission(SET_MASTER), canexecute KMS operate(set分辨率, 切换display器), usuallyonly Xorg/Wayland compositor 持has; renderD128 node只allowrenderingandcompute ioctl(DRM_RENDER_ALLOW flag), 普通applicationnotneed root permissioncanuse GPU rendering. 这种designlet多usersystemin GPU shared既securityagain高效. ',
            amdContext: 'thisissuetesting你对 DRM frameworksystem性understand. AMD interviewin你needdemonstratenot仅know amdgpu detail, stillunderstand它in DRM 大frameworkinlocationanddesign哲学. ',
          },
        },

        // ── Lesson 4.1.2 ──────────────────────────────────────
        {
          id: '4-1-2',
          number: '4.1.2',
          title: 'KMS displaypipeline: CRTC → Encoder → Connector',
          titleEn: 'KMS Display Pipeline: CRTC → Encoder → Connector',
          duration: 20,
          difficulty: 'advanced',
          tags: ['KMS', 'CRTC', 'Encoder', 'Connector', 'Plane', 'Atomic'],
          concept: {
            summary: 'Kernel Mode Setting (KMS) willdisplayhardwareabstractionas一条pipeline: Plane(承载 framebuffer data)→ CRTC(扫描controller, will像素按时序output)→ Encoder(will CRTC 数字信号convertasspecificprotocol)→ Connector(physicaloutput端口). 这种abstractionletuser space compositor can用统一 API controldifferent GPU displayoutput. ',
            explanation: [
              'KMS design思想iswilldisplayhardwarephysicalstructuremappingas软件object. 一block GPU graphics cardonusuallyhasmultipledisplay control器(Display Controller), eachcontrollercandriveradisplay器. in DRM/KMS in, thesehardware单元byabstractionas四类object, they连成一条displaypipeline(Display Pipeline). ',
              'drm_plane ispipeline起点, 代表a framebuffer layer. each Plane 绑定a drm_framebuffer(memoryin像素data), 并definein屏幕ondisplayregion(src_x, src_y, src_w, src_h → crtc_x, crtc_y, crtc_w, crtc_h). Plane has三种type: Primary(主平面, 承载主画面), Overlay(叠加平面, used for视频overwritelayer, 光标以outside额outsidelayer)and Cursor(光标平面, hardwareaccelerate鼠标pointer). multiple Plane 叠加to同a CRTC onimplementationhardware合成(Hardware Compositing), 比 GPU rendering合成更省电. ',
              'drm_crtc(CRT Controller, 名字源于 CRT display器时代)isdisplaypipelinecore, 代表a扫描output单元. CRTC from Plane get像素data, 按照configuration时序parameter(水平/垂直分辨率, before/afterblanking period, synchronization脉冲宽度 = drm_display_mode)逐行扫描output. CRTC stillresponsible forgenerate VBlank interrupt(in每帧扫描end时trigger), 这ispage翻转(Page Flip)and垂直synchronization(VSync)basics. amdgpu  CRTC 由 DC(Display Core)modulein amdgpu_dm_crtc.c implementation. ',
              'drm_encoder 代表信号convert器, will CRTC outputinternal数字信号convertasspecifictransferprotocol(HDMI, DisplayPort, DVI 等). a CRTC can连接multiple Encoder(但同一时刻onlyaactive), a Encoder 只can连接a Connector. in现代 GPU on, Encoder usuallyintegrationin GPU 芯片internal(Digital Encoder), notagainisindependenthardware. ',
              'drm_connector 代表physicaloutput端口 — 你graphics card背面 HDMI 口, DisplayPort 口等. Connector responsible for: (1)detectdisplay器whether连接(through HPD — Hot Plug Detection); (2)readdisplay器 EDID(Extended Display Identification Data, containsupport分辨率, flush率等information); (3)向user spacereport连接state(connected/disconnected/unknown). amdgpu  Connector in DC module amdgpu_dm_connector.c inimplementation, support DP, HDMI, eDP 等interfacetype. ',
              'in amdgpu in, KMS implementation由 Display Core (DC) moduleresponsible for. DC module(drivers/gpu/drm/amd/display/)最初from Windows driver移植而, code量约 50 万行. 它will DRM/KMS standardinterface翻译as AMD DCN(Display Controller Next)hardwareregisteroperate. DC internalhasselfobject模型(dc_stream, dc_plane, dc_link), amdgpu_dm.c 作as"胶水layer"will DRM objectmappingto DC object. ',
            ],
            keyPoints: [
              'KMS displaypipeline: Plane(像素源)→ CRTC(扫描时序)→ Encoder(信号convert)→ Connector(physical端口)',
              'drm_plane 三种type: Primary(主画面), Overlay(叠加layer), Cursor(光标)',
              'drm_crtc 按 drm_display_mode define时序parameter逐行output像素, generate VBlank interrupt',
              'drm_connector detect HPD(热插拔), read EDID, report连接state',
              'amdgpu  KMS 由 DC(Display Core)moduleimplementation, codein drivers/gpu/drm/amd/display/',
              'amdgpu_dm.c is胶水layer: DRM object (drm_crtc) ↔ DC object (dc_stream)',
            ],
          },
          diagram: {
            title: 'KMS displaypipeline: from Framebuffer to屏幕',
            content: `KMS displaypipeline(以 amdgpu 双display器outputas例)

Framebuffer (VRAM)         DRM/KMS object              physicalhardware
──────────────────         ──────────────              ────────

                           ┌──────────────┐
 FB0 (主画面)              │   Plane 0    │
 1920x1080 XRGB ──────────│  (Primary)   │
                           └──────┬───────┘
                                  │
                           ┌──────┴───────┐
 FB1 (鼠标pointer)            │   Plane 1    │
 64x64 ARGB ──────────────│  (Cursor)    │     hardware合成
                           └──────┬───────┘       │
                                  ├───────────────┘
                                  ▼
                           ┌──────────────┐     DCN hardware
                           │   CRTC 0     │     ┌──────────┐
                           │ 1920x1080    │────▶│ OTG 0    │
                           │ @60Hz        │     │(扫描engine) │
                           │ VBlank IRQ ──│──┐  └────┬─────┘
                           └──────────────┘  │       │
                                             │       ▼
                                             │  ┌──────────┐
                           ┌──────────────┐  │  │Encoder 0 │    ┌─────────┐
                           │ Connector 0  │──│──│ (DP PHY)  │───▶│ DP 口   │──▶ display器A
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
                           │ 2560x1440    │────▶│(HDMI PHY) │───▶│ HDMI 口 │──▶ display器B
                           │ @144Hz       │     └──────────┘    └─────────┘
                           └──────────────┘
                           ┌──────────────┐
                           │ Connector 1  │
                           │ HDMI-A-1     │
                           │ (connected)  │
                           └──────────────┘

VBlank 时序(单帧): 
┌─────────── Active Display ───────────┐┌── VBlank ──┐
│ 逐行扫描 1920x1080 像素              ││ Front Porch │
│ CRTC from Plane read FB data           ││ Sync Pulse  │
│                                       ││ Back Porch  │
└───────────────────────────────────────┘└─── IRQ! ───┘`,
            caption: 'KMS displaypipelinecomplete视图. 左侧is VRAM in Framebuffer, inbetweenis DRM/KMS abstractionobject, 右侧isactualphysicalinterface. VBlank interruptin每帧扫描end时trigger, issecurityupdatedisplay内容时between窗口. ',
          },
          codeWalk: {
            title: 'amdgpu DC  Connector createprocess',
            file: 'drivers/gpu/drm/amd/display/amdgpu_dm/amdgpu_dm.c',
            language: 'c',
            code: `/* amdgpu_dm.c — create DRM connector 并关联to DC link */

static int amdgpu_dm_initialize_drm_device(
    struct amdgpu_device *adev)
{
    struct drm_device *ddev = adev_to_drm(adev);
    struct amdgpu_display_manager *dm = &adev->dm;
    int i;

    /* traverse DC detecttoall display link */
    for (i = 0; i < dm->dc->caps.max_links; i++) {
        struct dc_link *link = dm->dc->links[i];
        struct amdgpu_dm_connector *aconnector;

        if (link->connector_signal == SIGNAL_TYPE_NONE)
            continue;

        /* allocation amdgpu_dm_connector(内嵌 drm_connector) */
        aconnector = kzalloc(sizeof(*aconnector), GFP_KERNEL);

        /* according to信号typeinitialization DRM connector */
        if (link->connector_signal == SIGNAL_TYPE_DISPLAY_PORT ||
            link->connector_signal == SIGNAL_TYPE_EDP) {

            drm_connector_init(ddev, &aconnector->base,
                &amdgpu_dm_dp_connector_funcs,
                DRM_MODE_CONNECTOR_DisplayPort);

            drm_connector_helper_add(&aconnector->base,
                &amdgpu_dm_dp_connector_helper_funcs);
            /* helper_funcs provide: .get_modes, .detect,
             * .best_encoder, .atomic_check */

        } else if (link->connector_signal == SIGNAL_TYPE_HDMI_TYPE_A) {

            drm_connector_init(ddev, &aconnector->base,
                &amdgpu_dm_connector_funcs,
                DRM_MODE_CONNECTOR_HDMIA);

            drm_connector_helper_add(&aconnector->base,
                &amdgpu_dm_connector_helper_funcs);
        }

        /* will DC link 关联to DRM connector */
        aconnector->dc_link = link;

        /* registration connector to DRM mode_config */
        drm_connector_register(&aconnector->base);

        /* setsupport encoder */
        drm_connector_attach_encoder(&aconnector->base,
                                      &aencoder->base);
    }
    return 0;
}

/* connector  helper callback: getdisplay器supportpattern */
static int amdgpu_dm_connector_get_modes(
    struct drm_connector *connector)
{
    struct amdgpu_dm_connector *aconnector =
        to_amdgpu_dm_connector(connector);

    /* from DC link read EDID */
    struct edid *edid = aconnector->edid;
    if (edid) {
        /* parse EDID getsupport分辨率list */
        drm_add_edid_modes(connector, edid);
        /* → will 1920x1080@60, 2560x1440@144 等
         *   addto connector->modes linked list */
    }
    return connector->probed_modes;
}`,
            annotations: [
              'dm->dc->links[] is DC hardwarelayerdetecttodisplay链路数组, each link correspondingaphysicaloutput',
              'connector_signal 区分端口type: DP, HDMI, eDP(笔记本内屏), DVI 等',
              'drm_connector_init() initialization DRM connector basicsstructure, 第四个parameter指定 connector type',
              'drm_connector_helper_add() registration helper callback: .get_modes read EDID, .detect detect连接state',
              'aconnector->dc_link will DRM 世界 connector and DC 世界 link 关联起',
              'drm_add_edid_modes() parse EDID data, willdisplay器support分辨率add modes linked list',
            ],
            explanation: 'amdgpu through DC modulecreate KMS object. thiscodedemonstrate Connector createcoreprocess: traverse DC detecttophysicaloutput → according to信号type(DP/HDMI)initialization DRM connector → 关联 DC link → registrationto DRM. whenuser space查询available分辨率时, get_modes callbackreaddisplay器 EDID getsupportpatternlist. 这种分layerdesign(DRM connector ↔ DC link ↔ hardware PHY)let amdgpu can复用大量 DRM basics设施. ',
          },
          miniLab: {
            title: 'use libdrm 查询display器information',
            objective: 'writea C programuse libdrm interface查询systeminall Connector stateandsupport分辨率, understand KMS objectinuser space表现形式. ',
            setup: `# install libdrm development库
sudo apt install libdrm-dev
# createworkdirectory
mkdir -p ~/drm-lab && cd ~/drm-lab`,
            steps: [
              'create query_display.c, use drmModeGetResources() get KMS resourcelist',
              'traverse connectors 数组, 用 drmModeGetConnector() geteach connector detailedinformation',
              '打印 connector type(DP/HDMI), 连接state, support分辨率list',
              'compilation: gcc -o query_display query_display.c -ldrm -I/usr/include/libdrm',
              'run: sudo ./query_display(need root orin video 组in)',
              'compareoutputand dmesg | grep connector informationwhether一致',
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

alsocanuse现成toolverify:
$ modetest -c    ← 列出all connectors
$ modetest -p    ← 列出all planes
$ modetest -e    ← 列出all encoders`,
            hint: 'ifnodisplay器连接, connector statewillis disconnected 且noavailablepattern. canuse modetest(自 libdrm-tests or drm-utils 包)作as现成查询tool. run modetest -M amdgpu 指定use amdgpu driver. ',
          },
          debugExercise: {
            title: 'diagnose Connector typeconfigurationerror',
            language: 'c',
            description: 'a自define DRM driveras HDMI 端口error地use DisplayPort  connector type, cause Wayland compositor unable tocorrect识别output. ',
            question: 'whydisplay器already连接但 Wayland compositor report "no DP link" 并拒绝enable该output? ',
            buggyCode: `/* create HDMI connector 但useerrortype */
static int create_hdmi_connector(struct drm_device *dev,
                                  struct my_connector *conn)
{
    int ret;

    /* BUG: HDMI 端口却use DisplayPort type!  */
    ret = drm_connector_init(dev, &conn->base,
        &my_connector_funcs,
        DRM_MODE_CONNECTOR_DisplayPort);  /* 应as HDMIA */

    if (ret)
        return ret;

    drm_connector_helper_add(&conn->base,
        &my_dp_connector_helper_funcs);
    /* ↑ alsouse DP  helper funcs rather than HDMI  */

    /* HPD and EDID readactual走is HDMI channel... */
    conn->hpd_gpio = gpiod_get(dev->dev, "hdmi-hpd", ...);
    return 0;
}`,
            hint: '思考 connector type 对user spaceimpact: Wayland/Xorg according to connector type select信号protocoland link training strategy. HDMI and DP  link training completelydifferent. ',
            answer: 'issue出in drm_connector_init() 第四个parameter: DRM_MODE_CONNECTOR_DisplayPort shouldis DRM_MODE_CONNECTOR_HDMIA. 这causetwo严重after果: (1)user space(Wayland compositor, Xorg)认as这isa DP 端口, tryexecute DP link training(DPCD 读写, lane 协商), 但底layerhardwareactualis HDMI, DPCD 读写willfailure, compositor report "no DP link"; (2)DP  helper funcs by挂载to HDMI connector on, .detect and .get_modes callbackuse DP protocolread EDID(AUX channel), 而is not HDMI protocol(DDC/I2C), causeunable togetdisplay器information. fix: will DRM_MODE_CONNECTOR_DisplayPort 改as DRM_MODE_CONNECTOR_HDMIA, 并use HDMI  helper_funcs. connector type mustandactualphysicalinterfacematch — 这is KMS abstractioncorrectworkbefore提. ',
          },
          interviewQ: {
            question: 'describe KMS displaypipelinein CRTC, Encoder, Connector and Plane 各自职责, andthey之between连接relationship. ',
            difficulty: 'hard',
            hint: 'fromdata流方向describe: Framebuffer → Plane → CRTC → Encoder → Connector → display器. 强调eachobjecthardwarecorresponding物, and N:M correspondingrelationship(multiple Plane can连接a CRTC, 但each Encoder usually只连接a Connector). ',
            answer: 'KMS displaypipelineis一条frommemory像素tophysicaldisplaydata通路: (1)Plane is像素源 — each Plane 绑定a Framebuffer(VRAM in像素矩阵), 并defineclippingand缩放parameter. 三种type: Primary(musthas, 承载主画面), Cursor(hardwareaccelerate光标, 64x64), Overlay(can选叠加layer, used for视频播放等). multiple Plane throughhardware合成叠加to同a CRTC, avoid GPU 合成开销. (2)CRTC is扫描engine — 它按照 drm_display_mode define时序(hactive, vactive, hsync, vsync, clock)will Plane 像素data逐行output. CRTC generate VBlank interrupt, ispage翻转and垂直synchronization时between基准. 一block GPU usuallyhas 4-6 个 CRTC, 决定最大meanwhileoutputdisplay器count. (3)Encoder is信号convert器 — will CRTC internal数字信号convertas HDMI TMDS, DP Main Link 等transferprotocol. in现代 GPU on Encoder usuallyisinternal数字encoder. a CRTC can连接multiple Encoder(但meanwhileonlyaactive), used forsupport端口复用. (4)Connector isphysicalinterface — 代表graphics cardon HDMI 口, DP 口等. responsible for HPD detect, EDID read, 连接statereport. user spacethrough Connector findandselectdisplaydevice. 连接relationship: N Planes → 1 CRTC → 1 Encoder → 1 Connector → display器. in amdgpu in, DC modulewillthese DRM objectmappingto DCN hardware单元(Plane→MPC/DPP, CRTC→OTG, Encoder→DIO, Connector→PHY+HPD). ',
            amdContext: 'AMD displayteaminterview高频题. 除describegeneral KMS architecture, to提to DC modulehowwill DRM objectmappingto DCN hardware — 这demonstrate你对 amdgpu displaysubsystemspecificunderstand. ',
          },
        },

        // ── Lesson 4.1.3 ──────────────────────────────────────
        {
          id: '4-1-3',
          number: '4.1.3',
          title: 'Atomic Mode Setting: atomicdisplayupdate',
          titleEn: 'Atomic Mode Setting: Atomic Display Updates',
          duration: 20,
          difficulty: 'advanced',
          tags: ['Atomic', 'KMS', 'page-flip', 'VBlank', 'drm_atomic_state'],
          concept: {
            summary: 'Atomic Mode Setting is DRM/KMS 现代 API — 它allowuser spacewillmultipledisplayproperty变更(分辨率, Plane location, Gamma 曲线等)打包asaatomic operation, 由kernelonce性verifyandcommit. 相比 Legacy Mode Setting 逐个set(set CRTC → set cursor → set gamma), Atomic avoidinbetweennot一致statecause画面闪烁and撕裂. ',
            explanation: [
              'Legacy Mode Setting issue: in旧 KMS API in, eachdisplayproperty变更isindependent ioctl call. for example切换分辨率need先 drmModeSetCrtc()(set新pattern), again drmModeSetPlane()(set叠加layer), again drmModeSetCursor()(set光标location). if第acallsuccess但第二个failure, display处于not一致state — user看to画面抖动or部分update. 更糟is, theseoperateunable toin同a VBlank between隔内complete, causecan见撕裂. ',
              'Atomic Mode Setting core思想is"先verify, aftercommit". user spacebuilda drm_atomic_state object, containall想to改变property(CRTC pattern, Plane  framebuffer, Connector state等), thencommit给kernel. kernel分两步handle: (1)atomic_check stage: verifyentirestatewhether合法(bandwidth whether足够, 时钟frequencywhethersupport, Plane formatwhether兼容), not改变任何hardwarestate; (2)atomic_commit stage: ifcheckthrough, once性willall变更writehardware, ensureina VBlank between隔内complete. ',
              'drm_atomic_state is Atomic commitcoredata structure. 它contain三类state: drm_crtc_state(CRTC 新pattern, active/enable state, mode_changed flag), drm_plane_state(Plane 绑定 FB, src/dst 矩形, rotation/blend property), drm_connector_state(Connector 绑定 CRTC, DPMS state). each time atomic commit 时, kernelcreate一份旧state副本, driverin副本on做modify, check stageverify副本, commit stage用副本替换currentstate. if check failure, 副本bydiscard, hardwarenot受impact. ',
              'DRM_MODE_ATOMIC_TEST_ONLY flagletuser spacecan"试探"aconfigurationwhether合法, 而notactualcommit. 这对 Wayland compositor 特别has用 — 它can先 test-only 多种布局plan, selectcanthroughverify最优plan, againactualcommit. 这avoid"commit→failure→回退"代价. ',
              'Page Flip(page翻转)is Atomic 最common用途. 每一帧renderingcompleteafter, compositor will新 framebuffer 绑定to Primary Plane, through atomic commit commit. DRM_MODE_PAGE_FLIP_EVENT flagrequestin翻转complete时sendeventnotify. if指定 DRM_MODE_ATOMIC_NONBLOCK, commit立i.e.return, notwait VBlank — 翻转inbelowa VBlank automaticcomplete. 这is现代 Linux 桌面implementation无撕裂合成basics. ',
              'in amdgpu in, Atomic commit corepathis amdgpu_dm_atomic_commit_tail(). thisfunctionreceiveverifythrough drm_atomic_state, will DRM layerproperty变更翻译as DC layeroperate: update dc_stream(corresponding CRTC pattern变更), update dc_plane(corresponding Plane property变更), call dc_commit_state() willall变更once性commit给 DCN hardware. VBlank waitand page flip completion eventalsointhisfunctioninhandle. ',
            ],
            keyPoints: [
              'Legacy Mode Setting: 逐个setproperty, 无atomic性保证, maycauseinbetweennot一致state',
              'Atomic Mode Setting: 打包all变更as drm_atomic_state, 先 check after commit',
              'drm_atomic_state contain crtc_state, plane_state, connector_state 三类子state',
              'TEST_ONLY flag: 试探configuration合法性而notcommit, compositor 用它寻找最优布局',
              'Page Flip + NONBLOCK: asynchronouscommit新 framebuffer, belowa VBlank automatic切换',
              'amdgpu_dm_atomic_commit_tail(): DRM atomic state → DC state → DCN hardwareregister',
            ],
          },
          diagram: {
            title: 'Atomic Mode Setting  Check → Commit process',
            content: `Atomic Mode Setting completeprocess

user space (Wayland compositor)
────────────────────────────
  1. buildatomicrequest
     drmModeAtomicReq *req = drmModeAtomicAlloc();
     drmModeAtomicAddProperty(req, plane_id, FB_ID, new_fb);
     drmModeAtomicAddProperty(req, crtc_id, MODE_ID, mode_blob);
     drmModeAtomicAddProperty(req, conn_id, CRTC_ID, crtc_id);

  2. can选: 先 TEST_ONLY verify
     drmModeAtomicCommit(fd, req, TEST_ONLY, NULL);
     → return 0 representconfiguration合法, -EINVAL representnot合法

  3. 正式commit(non-blocking + request page flip event)
     drmModeAtomicCommit(fd, req, NONBLOCK | PAGE_FLIP_EVENT, NULL);
     │
═════╪═════════════════════════════════════════════════════
     │
kernel space (DRM → amdgpu)
     ▼
  drm_mode_atomic_ioctl()                  (drm_atomic_uapi.c)
     │
     ▼
  ┌─────────────────────────────────────────────────┐
  │  Phase 1: atomic_check (verifystage)              │
  │                                                  │
  │  drm_atomic_helper_check_modeset()               │
  │  ├─ each CRTC: mode_changed? active_changed?    │
  │  ├─ bandwidthcheck: all CRTC 总bandwidth ≤ GPU on限     │
  │  └─ 时钟check: pixel clock ≤ hardwaresupport最大值     │
  │                                                  │
  │  drm_atomic_helper_check_planes()                │
  │  ├─ each Plane: FB formatsupport? src/dst 矩形合法?  │
  │  ├─ 缩放比例: notexceedhardware scaler ability           │
  │  └─ bandwidth: allactive Plane bandwidth ≤ availablememorybandwidth  │
  │                                                  │
  │  amdgpu_dm_atomic_check()    ← amdgpu 特hascheck   │
  │  └─ DC verify: dc_validate_global_state()          │
  │                                                  │
  │  if TEST_ONLY → to此return, notmodifyhardware            │
  └──────────────────────┬──────────────────────────┘
                         │ check through
                         ▼
  ┌─────────────────────────────────────────────────┐
  │  Phase 2: atomic_commit (commitstage)             │
  │                                                  │
  │  if NONBLOCK:                                  │
  │    排入work queue, 立i.e.returnuser space                 │
  │                                                  │
  │  amdgpu_dm_atomic_commit_tail()                  │
  │  ├─ update dc_stream(CRTC pattern变更)             │
  │  ├─ update dc_plane(Plane property变更)              │
  │  ├─ dc_commit_state() → write DCN register         │
  │  ├─ wait VBlank(page flip)                     │
  │  └─ drm_crtc_send_vblank_event() → notifyuser space │
  └─────────────────────────────────────────────────┘
                         │
                         ▼
  user space收to DRM_EVENT_FLIP_COMPLETE
  → cansecurityrelease旧 framebuffer`,
            caption: 'Atomic Mode Setting 两stagecommitprocess. check stageverifyconfiguration合法性(canthrough TEST_ONLY 单独execute), commit stagein VBlank between隔内once性updateallhardwarestate. ',
          },
          codeWalk: {
            title: 'amdgpu_dm_atomic_commit_tail — atomiccommitcore',
            file: 'drivers/gpu/drm/amd/display/amdgpu_dm/amdgpu_dm.c',
            language: 'c',
            code: `/* amdgpu_dm_atomic_commit_tail — handleverifythrough atomic state */
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

    /* Step 1: handleneed mode change  CRTC */
    for_each_oldnew_crtc_in_state(state, crtc,
            old_crtc_state, new_crtc_state, i) {
        struct amdgpu_crtc *acrtc = to_amdgpu_crtc(crtc);
        struct dm_crtc_state *dm_new =
            to_dm_crtc_state(new_crtc_state);

        if (drm_atomic_crtc_needs_modeset(new_crtc_state)) {
            if (!new_crtc_state->active) {
                /* CRTC by关闭 — 移除 DC stream */
                dc_remove_stream_from_ctx(dm->dc,
                    dc_state, dm_new->stream);
            } else {
                /* CRTC pattern变更 — update DC stream */
                dc_add_stream_to_ctx(dm->dc,
                    dc_state, dm_new->stream);
            }
        }
    }

    /* Step 2: commitcomplete DC state tohardware */
    WARN_ON(!dc_commit_state(dm->dc, dc_state));
    /*
     * dc_commit_state() internal:
     *   1. programming OTG 时序register(分辨率, flush率)
     *   2. configuration DPP/MPC(Plane blending, scaling)
     *   3. update surface address(page flip key)
     *   4. trigger DCN hardware double-buffer 切换
     */

    /* Step 3: wait VBlank 并send flip completeevent */
    for_each_oldnew_crtc_in_state(state, crtc,
            old_crtc_state, new_crtc_state, i) {

        if (new_crtc_state->active &&
            new_crtc_state->event) {
            /* wait VBlank — ensure page flip already生效 */
            drm_crtc_vblank_get(crtc);
            /* ... hardwarein VBlank 时切换 surface address ... */

            /* notifyuser space page flip complete */
            drm_crtc_send_vblank_event(crtc,
                new_crtc_state->event);
            drm_crtc_vblank_put(crtc);
        }
    }
}`,
            annotations: [
              'for_each_oldnew_crtc_in_state() traverse atomic_state inall受impact CRTC',
              'drm_atomic_crtc_needs_modeset() check CRTC whetherneedcompletepattern切换(而not仅is page flip)',
              'dc_commit_state() is DC modulecore — willcomplete DC state programmingto DCN hardwareregister',
              'DCN use double-buffer: 新值write shadow register, VBlank 时 latch to active register',
              'drm_crtc_send_vblank_event() 向user spacesend DRM_EVENT_FLIP_COMPLETE event',
              'entirefunctionin commit work queueinrun(ifis NONBLOCK), notblockuser space ioctl return',
            ],
            explanation: 'thisfunctionis amdgpu displayupdate心脏. when Wayland compositor commita新帧时, 经过 check stageverifyafter, commit_tail responsible foractualwill变更writehardware. keyin于 dc_commit_state() — 它will DRM 世界atomicstate翻译as DCN hardwareregisteroperate, 利用 DCN  double-buffering mechanismin VBlank between隔内complete切换, ensureuser看notto任何闪烁or撕裂. ',
          },
          miniLab: {
            title: 'observe Atomic Mode Setting  VBlank synchronization',
            objective: 'use drm_info and trace-cmd toolobserve Atomic commit and VBlank event时序relationship, understand无撕裂display底layermechanism. ',
            steps: [
              'installtool: sudo apt install drm-info trace-cmd',
              'viewcurrent atomic state: drm_info(ifavailable)or cat /sys/kernel/debug/dri/0/state',
              'startup VBlank eventtracing: sudo trace-cmd record -e drm:drm_vblank_event -e amdgpu:amdgpu_flip_status',
              'intracing期betweenmove一below鼠标or切换窗口(trigger page flip), wait 2-3 秒after Ctrl+C stop',
              'viewtracingresult: trace-cmd report | head -50, observe vblank_event and flip 时序relationship',
              'verify帧率: statistics 1 秒内 vblank eventcount, should接近display器flush率(60/144)',
            ],
            expectedOutput: `$ sudo trace-cmd report | head -20
  kworker-1234 [002] 1000.001: drm_vblank_event: crtc=0, seq=51234
  kworker-1234 [002] 1000.001: amdgpu_flip_status: flip completed
  kworker-1234 [002] 1000.017: drm_vblank_event: crtc=0, seq=51235
  ...

每two vblank eventbetween隔约 16.67ms (60Hz) or 6.94ms (144Hz)
page flip 总isin vblank event附近complete — 这is无撕裂保证`,
            hint: 'if trace-cmd 报permissionerror, ensure以 root run. if看notto amdgpu related tracepoint, check /sys/kernel/debug/tracing/available_events | grep amdgpu. ',
          },
          debugExercise: {
            title: 'diagnose非atomicupdatecause画面撕裂',
            language: 'c',
            description: 'belowuser spacecodeuse Legacy Mode Setting API updatedisplay, userreport画面has明显水平撕裂线. ',
            question: 'whywill出现撕裂? how用 Atomic API fix? ',
            buggyCode: `/* Legacy Mode Setting — 非atomicupdatecause撕裂 */
void update_display(int fd, uint32_t crtc_id,
                     uint32_t plane_id, uint32_t new_fb)
{
    /* 第 1 步: update主 Plane  framebuffer */
    drmModeSetPlane(fd, plane_id, crtc_id,
        new_fb, 0,
        0, 0, 1920, 1080,    /* dst */
        0, 0, 1920<<16, 1080<<16);  /* src */

    /* 第 2 步: update overlay Plane */
    drmModeSetPlane(fd, overlay_id, crtc_id,
        overlay_fb, 0,
        100, 100, 320, 240,
        0, 0, 320<<16, 240<<16);

    /* BUG: two SetPlane call之betweenmay跨越 VBlank
     * causeuser看to一半旧画面 + 一半新画面 */

    /* 第 3 步: update光标location */
    drmModeMoveCursor(fd, crtc_id, cursor_x, cursor_y);
    /* 光标locationupdateagainis另aindependentoperate... */
}`,
            hint: '三个independent ioctl call之betweennotexistatomic性保证. if Step 1 in VBlank beforecomplete但 Step 2 in VBlank afteronly thenexecute, user看to这一帧inside主 Plane is新但 overlay stillis旧. ',
            answer: 'issue: 三个independent drmModeSetPlane/MoveCursor callnoatomic性保证. if CRTC intwocall之between进入 VBlank 扫描stage, display器willin同一帧内看to部分update画面 — on半部分display新 Plane 0 内容, below半部分display旧, 这is水平撕裂线源. fixplanisuse Atomic Mode Setting API: drmModeAtomicReq *req = drmModeAtomicAlloc(); drmModeAtomicAddProperty(req, plane_id, "FB_ID", new_fb); drmModeAtomicAddProperty(req, overlay_id, "FB_ID", overlay_fb); drmModeAtomicAddProperty(req, crtc_id, "CURSOR_X", cursor_x); drmModeAtomicAddProperty(req, crtc_id, "CURSOR_Y", cursor_y); drmModeAtomicCommit(fd, req, DRM_MODE_ATOMIC_NONBLOCK | DRM_MODE_PAGE_FLIP_EVENT, NULL); 这样all变更by打包asaatomic operation, kernelensurein同a VBlank between隔内once性切换all Plane, 消除撕裂. ',
          },
          interviewQ: {
            question: 'explain Atomic Mode Setting 相for Legacy Mode Setting 优势, and atomic_check and atomic_commit twostage分别做what. ',
            difficulty: 'hard',
            hint: 'fromatomic性保证(消除inbetweennot一致state), test-only ability(试探notcommit), anderror回滚(check failurenotimpacthardware)角度analyze. describe check stageverify内容(bandwidth, 时钟, format兼容性)and commit stagehardwareprogrammingprocess. ',
            answer: 'Atomic Mode Setting core优势: (1)atomic性 — alldisplayproperty变更(Plane FB, CRTC pattern, Connector state)作asa事务commit, to么entire生效to么entirenot生效, 消除 Legacy API 逐个 ioctl inbetweennot一致stateand画面撕裂; (2)Test-only — DRM_MODE_ATOMIC_TEST_ONLY flaglet compositor canverifyconfigurationwhether合法而notactualcommit, used for寻找最优display布局; (3)security回退 — check stagein旧state副本onverify, failure时discard副本, hardwarecompletelynot受impact. atomic_check stage: (a)drm_atomic_helper_check_modeset() verify CRTC pattern变更合法性(pixel clock ≤ hardwareon限, all CRTC 总bandwidth ≤ memorybandwidthon限); (b)drm_atomic_helper_check_planes() verify Plane configuration(FB formatwhethersupport, 缩放比例whetherinhardware scaler abilityrange内); (c)driverspecificcheck(amdgpu_dm_atomic_check → dc_validate_global_state(), verify DCN hardwareresourceallocation, 如 DPP countwhether足够). atomic_commit stage: (a)if NONBLOCK flag, willactualcommit排入work queue, 立i.e.returnuser space; (b)amdgpu_dm_atomic_commit_tail() will DRM state翻译as DC operate, call dc_commit_state() programming DCN register; (c)利用 DCN  double-buffering, 新值write shadow register, in VBlank 时 latch to active register, implementation无闪烁切换; (d)through drm_crtc_send_vblank_event() notifyuser space page flip complete. ',
            amdContext: 'Atomic Mode Setting is现代 Linux displaystackbasics. AMD interviewindemonstrate你understandfromuser space drmModeAtomicCommit() tokernel amdgpu_dm_atomic_commit_tail() againto DC dc_commit_state() completepath, will显著加分. ',
          },
        },
      ],
    },

    // ════════════════════════════════════════════════════════════
    // Group 4.2: GPU Memory Management (GPU memory management)
    // ════════════════════════════════════════════════════════════
    {
      id: '4-2',
      number: '4.2',
      title: 'GPU memory management',
      titleEn: 'GPU Memory Management',
      icon: 'HardDrive',
      description: 'master DRM 两大 GPU memory managementframework GEM and TTM, understand Buffer Object lifecycleandmemory域migration, and DMA-BUF 跨device零copysharedprotocol. ',
      lessons: [
        // ── Lesson 4.2.1 ──────────────────────────────────────
        {
          id: '4-2-1',
          number: '4.2.1',
          title: 'GEM and TTM: GPU memory management双framework',
          titleEn: 'GEM & TTM: The Dual GPU Memory Frameworks',
          duration: 20,
          difficulty: 'advanced',
          tags: ['GEM', 'TTM', 'Buffer-Object', 'VRAM', 'GTT', 'memory-domain'],
          concept: {
            summary: 'DRM frameworkprovide两种 GPU memory managementplan: GEM(Graphics Execution Manager)provide简洁 Buffer Object abstractioninterface, 而 TTM(Translation Table Manager)in GEM 之onas具hasindependentVRAM(VRAM)离散 GPU providecompletememory域management, objectmigrationandpage置换mechanism. amdgpu use TTM 作as底layer, GEM 作asuser spaceinterface. ',
            explanation: [
              'GPU memory managementis GPU driver最complexsubsystem之一. corechallengeis: GPU hasself专用VRAM(VRAM), 但alsoneedaccesssystem memory(through PCIe 总线). applicationprogramcreate Buffer(顶点data, 纹理, framebuffer)mayin VRAM andsystem memory之betweenmigration — when VRAM not够时, notactive Buffer needby"换出"tosystem memory(similar CPU  swap). DRM frameworkthrough GEM and TTM managementthesecomplex性. ',
              'GEM(Graphics Execution Manager)最初由 Intel as i915 driverdesign, provide GPU Buffer Object basicabstraction. GEM core概念is drm_gem_object — akernelobject, 代表一block GPU canaccessmemory. user spacethrough GEM handle(a per-process 整数 ID)引用 Buffer Object. GEM provideoperateinclude: create(allocationmemory), mapping(through mmap let CPU access), reference counting(open/close 时增减, 归零时release), 命名and flink(processbetweenshared, alreadyby DMA-BUF 取代). GEM design假设is"GPU onlysystem memory", so它本身nothandle VRAM managementandobjectmigration. ',
              'TTM(Translation Table Manager)专as具hasindependent VRAM 离散 GPU(如 AMD, NVIDIA)design. TTM in GEM 之on增加keyability: (1)memory域(Memory Domain / Placement) — each Buffer Object canexist于 VRAM, GTT(Graphics Translation Table, system memoryin对 GPU can见部分)or System(普通system memory)域. (2)objectmigration(BO Move) — whena Buffer needfrom System moveto VRAM(GPU i.e.willuse它)orfrom VRAM moveto System(VRAM 空betweennot足)时, TTM  ttm_bo_move_memcpy() or DMA enginecompletedatacopy. (3)page置换(Eviction) — when VRAM 满时, TTM use LRU(Least Recently Used)strategyselect最久not yetuse Buffer 换出to GTT or System. ',
              'Buffer Object lifecycle: Create → Place → Map → Use → Unmap → Migrate → Destroy. specific说: (1)user spacecall DRM_IOCTL_AMDGPU_GEM_CREATE, kernelcreate amdgpu_bo(内嵌 ttm_buffer_object + drm_gem_object); (2)TTM according torequest placement(VRAM/GTT)incorresponding域allocationphysicalpage; (3)user space mmap get CPU virtual address(through TTM  fault handler 按需mappingpage); (4)GPU through GART/VM page tableaccess Buffer 内容; (5)when VRAM not足时, TTM willnotactive BO migrationto GTT/System(eviction); (6)whenreference counting归零时, TTM releasephysicalpage并销毁 BO. ',
              'in amdgpu in, GEM and TTM 分工如below: user space API layer(ioctl)use GEM interface(DRM_IOCTL_AMDGPU_GEM_CREATE/GEM_MMAP/GEM_WAIT_IDLE 等), kernelimplementationlayeruse TTM framework(ttm_bo_init_reserved, ttm_bo_validate, ttm_bo_move_memcpy 等). amdgpu_bo structure体meanwhile嵌入 drm_gem_object(GEM layer)and ttm_buffer_object(TTM layer). twoframeworkthrough amdgpu_ttm.c incallback function连接: TTM call amdgpu_bo_move() executeactual DMA data搬运, call amdgpu_ttm_io_mem_reserve() mapping VRAM region. ',
            ],
            keyPoints: [
              'GEM provideuser spaceinterface(handle, create, mmap), TTM providememory域managementandmigration(VRAM↔GTT↔System)',
              'TTM memory域: VRAM(GPU 专用VRAM, 最快), GTT(system memory GPU canaccess区), System(普通memory)',
              'amdgpu_bo meanwhile嵌入 drm_gem_object(GEM)and ttm_buffer_object(TTM)',
              'BO lifecycle: Create → Place → Map → Use → Migrate(eviction) → Destroy',
              'TTM eviction: VRAM 满时按 LRU strategywillnotactive BO migrationto GTT/System',
              'amdgpu_ttm.c is胶水layer: 连接 GEM ioctl interfaceand TTM 底layermemory management',
            ],
          },
          diagram: {
            title: 'GEM/TTM memory managementarchitectureand Buffer Object migration',
            content: `GEM/TTM 双frameworkmemory management

user space
──────────────────────────────────────────────────────────
  Mesa / ROCm application
  │
  │ DRM_IOCTL_AMDGPU_GEM_CREATE
  │   { size: 4MB, domains: VRAM|GTT }
  │
══╪═══════════════════════════════════════════════════════
  │
kernel space
  ▼
┌─────────────────────────────────────────────────────────┐
│  GEM layer (drm_gem.c)                                     │
│  ├─ drm_gem_object: handle management, reference counting, mmap         │
│  └─ GEM ioctl: CREATE, MMAP, CLOSE, WAIT_IDLE           │
└─────────────────────┬───────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────┐
│  TTM layer (ttm_bo.c, ttm_resource.c)                      │
│  ├─ ttm_buffer_object: lifecycle, 锁, LRU management           │
│  ├─ ttm_resource_manager: each域allocation器                 │
│  ├─ ttm_bo_validate(): ensure BO in指定域in               │
│  └─ ttm_bo_move(): 跨域datamigration(DMA or memcpy)        │
└─────────────────────┬───────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────┐
│  amdgpu TTM backend (amdgpu_ttm.c)                         │
│  ├─ amdgpu_bo_move(): use SDMA engine做 DMA 搬运        │
│  ├─ amdgpu_ttm_io_mem_reserve(): mapping VRAM BAR          │
│  └─ amdgpu_ttm_backend_bind(): 绑定 GART page table           │
└─────────────────────────────────────────────────────────┘

memory域and BO migration: 

  ┌──────────────┐      eviction      ┌──────────────┐
  │   VRAM       │ ──────────────────▶ │     GTT      │
  │  (8GB GDDR6) │ ◀────────────────── │(system memory,can达│
  │  最快,GPU专用│      validation     │ GPUthroughGART) │
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

amdgpu_bo structure体嵌套: 
  struct amdgpu_bo {
      struct ttm_buffer_object  tbo;   ← TTM layer
      //  └─ struct drm_gem_object base; ← GEM layer (嵌套in tbo in)
      struct list_head          shadow_list;
      struct amdgpu_bo_va      *bo_va;    ← GPU virtual addressmapping
      uint32_t                  preferred_domains;
      uint32_t                  allowed_domains;
  };`,
            caption: 'GEM provideuser space API(handle, mmap), TTM provide底layermemory域management. when VRAM 满时, TTM 按 LRU strategywillnotactive BO migrationto GTT/System(eviction), need时againmigration回(validation). amdgpu_bo meanwhilecontain两layerdata structure. ',
          },
          codeWalk: {
            title: 'amdgpu_gem_object_create — create GPU Buffer Object',
            file: 'drivers/gpu/drm/amd/amdgpu/amdgpu_gem.c',
            language: 'c',
            code: `/* amdgpu_gem.c — GEM ioctl handle: create Buffer Object */

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

    /* create amdgpu_bo(contain ttm_buffer_object + drm_gem_object) */
    r = amdgpu_bo_create(adev, size,
                          args->in.alignment,
                          domain,       /* VRAM, GTT, or both */
                          args->in.flags,
                          ttm_bo_type_device,
                          NULL, &bo);
    if (r)
        return r;

    /* asuser spacecreate GEM handle */
    r = drm_gem_handle_create(filp, &bo->tbo.base,
                               &args->out.handle);
    /*
     * drm_gem_handle_create():
     *   1. in filp->object_idr inallocation整数 ID
     *   2. 增加 gem_object reference counting
     *   3. return handle 给user space
     */

    /* drop create时引用, user spacethrough handle 持has引用 */
    drm_gem_object_put(&bo->tbo.base);

    return r;
}

/* 底layer: amdgpu_bo_create call TTM allocationactualmemory */
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

    /* set preferred and allowed memory域 */
    bo->preferred_domains = domain;
    bo->allowed_domains = domain;
    amdgpu_bo_placement_from_domain(bo, domain);
    /* → will AMDGPU_GEM_DOMAIN_VRAM 等翻译as
     *   TTM  ttm_place structure(指定 mem_type) */

    /* call TTM initialization BO 并allocationphysicalpage */
    ttm_bo_init_reserved(&adev->mman.bdev,
                          &bo->tbo, type,
                          &placement,
                          align >> PAGE_SHIFT,
                          false, size, NULL,
                          resv, &amdgpu_bo_destroy);
    /*
     * ttm_bo_init_reserved():
     *   1. initialization ttm_buffer_object structure
     *   2. call ttm_bo_validate() in指定域allocationphysicalpage
     *   3. BO 以 reserved(锁定)statereturn
     */

    *bo_ptr = bo;
    return 0;
}`,
            annotations: [
              'args->in.domains canis AMDGPU_GEM_DOMAIN_VRAM | AMDGPU_GEM_DOMAIN_GTT(allowmultiple域)',
              'amdgpu_bo_create meanwhileinitialization GEM and TTM 两layerdata structure',
              'amdgpu_bo_placement_from_domain() will amdgpu 域flag翻译as TTM placement describe',
              'ttm_bo_init_reserved() call ttm_bo_validate() in preferred domain inallocationphysicalpage',
              'drm_gem_handle_create() return per-process 整数 handle, user space据此引用 BO',
              'drm_gem_object_put() releasecreate者引用 — BO lifecycle由user space handle management',
            ],
            explanation: 'thiscodedemonstrate GPU Buffer Object createcompletepath: user space ioctl → GEM handle create → amdgpu_bo allocation → TTM placement set → physicalpageallocation. note domain parameterhowfromuser space AMDGPU_GEM_DOMAIN_VRAM 翻译as TTM  placement structure — 这is GEM and TTM 两layerframework协作keyinterface. understandthiscreateprocessisunderstandentire GPU memory management起点. ',
          },
          miniLab: {
            title: '监控 GPU Buffer Object allocationand VRAM use',
            objective: 'use sysfs and debugfs interfaceobserve VRAM/GTT use情况, understand Buffer Object how占用 GPU memory. ',
            steps: [
              'viewcurrent VRAM use量: cat /sys/class/drm/card0/device/mem_info_vram_used',
              'view VRAM 总量: cat /sys/class/drm/card0/device/mem_info_vram_total',
              'view GTT use量: cat /sys/class/drm/card0/device/mem_info_gtt_used',
              'startupa占用 GPU memoryprogram(如 glxgears), again次view VRAM use量变化',
              'view TTM BO statistics(if debugfs available): cat /sys/kernel/debug/dri/0/amdgpu_vram_mm',
              'compare: runa 4K 视频播放器, observe VRAM use量显著增加(4K framebuffer ≈ 33MB)',
            ],
            expectedOutput: `$ cat /sys/class/drm/card0/device/mem_info_vram_used
285212672    ← ~272MB(桌面environmentidle时)

$ # startup glxgears after
$ cat /sys/class/drm/card0/device/mem_info_vram_used
310378496    ← ~296MB(增加 ~24MB used for framebuffer and顶点data)

$ cat /sys/class/drm/card0/device/mem_info_vram_total
8573157376   ← ~8GB VRAM 总量

$ cat /sys/class/drm/card0/device/mem_info_gtt_used
52428800     ← ~50MB GTT usein`,
            hint: 'if看notto debugfs file, ensure以 root run且 debugfs already挂载. VRAM use量will not精确match framebuffer size — driverstillwillallocationcommandbuffer, page table, firmware用 Buffer 等. ',
          },
          debugExercise: {
            title: 'find Buffer Object leak(missing unreference)',
            language: 'c',
            description: 'belowdrivercodeinerrorpathon忘记release Buffer Object 引用, causeeach timeoperatefailure时leaka BO, final VRAM 耗尽. ',
            question: 'find BO leaklocation并fix. ',
            buggyCode: `int my_submit_work(struct amdgpu_device *adev,
                    uint64_t size)
{
    struct amdgpu_bo *cmd_bo = NULL;
    struct amdgpu_bo *data_bo = NULL;
    int r;

    /* allocationcommand BO */
    r = amdgpu_bo_create(adev, 4096, PAGE_SIZE,
        AMDGPU_GEM_DOMAIN_GTT, 0,
        ttm_bo_type_kernel, NULL, &cmd_bo);
    if (r)
        return r;

    /* allocationdata BO */
    r = amdgpu_bo_create(adev, size, PAGE_SIZE,
        AMDGPU_GEM_DOMAIN_VRAM, 0,
        ttm_bo_type_kernel, NULL, &data_bo);
    if (r)
        return r;  /* BUG: cmd_bo alreadyallocation但not yetrelease!  */

    /* usetwo BO ... */
    r = do_gpu_work(adev, cmd_bo, data_bo);
    if (r)
        goto err_work;  /* BUG: two BO allnot yetrelease!  */

    /* successpath: release BO */
    amdgpu_bo_unref(&data_bo);
    amdgpu_bo_unref(&cmd_bo);
    return 0;

err_work:
    /* 忘记release cmd_bo and data_bo */
    return r;
}`,
            hint: 'each amdgpu_bo_create successafterall持hasa引用. all退出path(includeerrorpath)allmustcall amdgpu_bo_unref() release引用. use goto 统一errorhandleiskernelcodestandardpattern. ',
            answer: 'has两处leak: (1)第二个 amdgpu_bo_create failure时(data_bo allocationfailure), directly return r 但noreleasealreadyallocation cmd_bo; (2)do_gpu_work failure时跳转to err_work, 但 err_work labelbelownorelease任何 BO. fixplan: usekernelstandard goto 链式errorhandle: if (r) goto err_data_bo; in data_bo allocationfailure时跳转, err_work release data_bo after fall through to err_data_bo release cmd_bo. correctcode: err_work: amdgpu_bo_unref(&data_bo); err_data_bo: amdgpu_bo_unref(&cmd_bo); return r; 这种"反向release"patternensureresource按allocation逆序release. BO leakis GPU driverin最common Bug 之一 — in压力testingin, each timeoperateleak几 KB  BO willin几小时内耗尽all VRAM, causeafter续allocationfailureand GPU hang. ',
          },
          interviewQ: {
            question: 'explain GEM and TTM in DRM memory managementin角色anddifference. why amdgpu need TTM 而is not只用 GEM? ',
            difficulty: 'hard',
            hint: 'keydifferencein于 VRAM management: GEM 假设 GPU usesystem memory(适合integration GPU), TTM supportindependent VRAM + objectmigration + eviction(适合离散 GPU). amdgpu 作as离散 GPU driverneedmanagement VRAM↔GTT data搬运. ',
            answer: 'GEM and TTM is DRM twomemory managementframework, resolvedifferentlayer次issue: GEM(Graphics Execution Manager)provide Buffer Object user space API — through GEM handle 引用 BO, through mmap let CPU access, throughreference countingmanagementlifecycle. GEM 最初as Intel i915(integration GPU, usesystem memory)design, 假设allmemoryis同质. TTM(Translation Table Manager)in GEM 之onas离散 GPU 增加三个keyability: (1)memory域(Memory Placement) — BO canexist于 VRAM(GPU 专用, bandwidth最高), GTT(system memoryin GPU canthrough GART access部分)or System(普通system memory). (2)objectmigration — whenneedwill BO from System 移to VRAM(GPU i.e.willuse)orfrom VRAM 移to GTT(VRAM 空betweennot足), TTM 协调 DMA data搬运. (3)memory压力handle(Eviction) — when VRAM 满时, TTM 按 LRU strategyselect BO migrationto GTT/System, similarvirtual memorypage置换. amdgpu mustuse TTM because AMD 离散 GPU hasindependent VRAM(8GB GDDR6), driverneedin VRAM andsystem memory之between高效搬运data, handle VRAM 压力, management GART page table. GEM layerstillused for向user space暴露统一 API — usernotneed关心 BO currentin VRAM stillis GTT, 这由 TTM 透明management. ',
            amdContext: '这is AMD interviewincommonmemory managementbasics题. answer时强调 amdgpu  "GEM 做门面, TTM 做backend" architecturedesign, demonstrate你understandwhy离散 GPU need比integration GPU 更complexmemory management. ',
          },
        },

        // ── Lesson 4.2.2 ──────────────────────────────────────
        {
          id: '4-2-2',
          number: '4.2.2',
          title: 'DMA-BUF: 跨device Buffer shared',
          titleEn: 'DMA-BUF: Cross-Device Buffer Sharing',
          duration: 20,
          difficulty: 'advanced',
          tags: ['DMA-BUF', 'prime', 'zero-copy', 'exporter', 'importer', 'scatter-gather'],
          concept: {
            summary: 'DMA-BUF is Linux kernel跨device Buffer sharedprotocol. 它allowadevice(exporter, 如 GPU)willmemory Buffer 导出asafiledescriptor(fd), 另adevice(importer, 如视频decoderor另a GPU)through该 fd 导入并directlyaccess同一blockphysical memory — implementation零copyshared. in DRM in, prime_handle_to_fd 导出 GEM BO, prime_fd_to_handle 导入. ',
            explanation: [
              '想象atypicalscenario: 你in播放 4K 视频. 视频decoder(VCN hardware)解码出一帧 YUV datato一block VRAM Buffer in, then GPU needwill这帧data作as纹理renderingto桌面on. ifno DMA-BUF, 你need: (1)decoderwilldatafrom VRAM copytosystem memory; (2)GPU fromsystem memoryreaddatato VRAM. 两次 PCIe datatransfer, latencyandbandwidth浪费巨大. DMA-BUF letdecoderdirectlywill VRAM in Buffer shared给 GPU — 零copy, twohardware单元access同一blockphysical memory. ',
              'DMA-BUF coreis exporter/importer 模型. Exporter is Buffer all者 — 它allocationmemory, managementphysicalpagelifecycle, provide scatter-gather table(describe Buffer physicalpage分布). Importer is Buffer use者 — 它through DMA-BUF fd get scatter-gather table, willthesephysicalpagemappingtoselfdeviceaddress space. Exporter mustimplementation dma_buf_ops callback: .map_dma_buf(provide scatter-gather table), .unmap_dma_buf(releasemapping), .release(Buffer finalrelease), .begin_cpu_access / .end_cpu_access(CPU access时cachecoherence维护). ',
              'in DRM in, DMA-BUF through PRIME(Portable Render Interface for Multi-device Extension)interface暴露给user space. 导出: user spacecall DRM_IOCTL_PRIME_HANDLE_TO_FD, willa GEM handle convertas DMA-BUF fd. 导入: user spacecall DRM_IOCTL_PRIME_FD_TO_HANDLE, will收to DMA-BUF fd convertas本device GEM handle. 一旦has GEM handle, can像uselocal BO 一样use这blockshared memory. ',
              'scatter-gather table(sg_table)is DMA-BUF sharedkeydata structure. a GPU Buffer physicalpageusuallyis notcontiguous — 它may由数千个scatter 4KB page组成. sg_table 列出allthesepagephysical addressand长度, let importer  DMA engineknowhowaccesscomplete Buffer. IOMMU/GART hardwarewillthesescatterphysicalpagemappingtodevicecontiguousvirtualaddress space, 对 GPU 说 Buffer 看起iscontiguous. ',
              '零copyis DMA-BUF core价值. in Wayland 合成器in, each窗口 framebuffer 由该application GPU contextrenderingto一block Buffer in, thenthrough DMA-BUF shared给合成器 GPU context. 合成器willmultiple窗口 Buffer 合成tofinal scanout framebuffer. entireprocessin, 像素data始终留in VRAM in, fromnot yet经过 CPU orsystem memory — 这is现代 Linux 桌面高效cause. ',
              'in amdgpu in, DMA-BUF 导出由 amdgpu_gem_prime_export()(actualonuse DRM core drm_gem_prime_export)handle, 它create dma_buf object并关联 amdgpu_dmabuf_ops callback. 导入由 amdgpu_gem_prime_import() handle, 它from DMA-BUF fd get sg_table, createa新 amdgpu_bo wrapperthesesharedphysicalpage. if导入 DMA-BUF 自同a amdgpu device, driverwilldirectly复用原 amdgpu_bo(self-import optimization), avoidnot必to sg_table create. ',
            ],
            keyPoints: [
              'DMA-BUF is Linux 跨device零copy Buffer sharedprotocol: exporter allocationmemory, importer sharedaccess',
              'DRM PRIME interface: prime_handle_to_fd(导出 GEM → fd), prime_fd_to_handle(导入 fd → GEM)',
              'scatter-gather table (sg_table) describe Buffer scatterphysicalpage, importer 据此set DMA mapping',
              'dma_buf_ops callback: .map_dma_buf, .unmap_dma_buf, .release, .begin/end_cpu_access',
              'Wayland 合成器: each窗口through DMA-BUF shared framebuffer 给 compositor, 零copy合成',
              'amdgpu self-import optimization: 同device DMA-BUF directly复用原 BO, 跳过 sg_table',
            ],
          },
          diagram: {
            title: 'DMA-BUF 跨deviceshared: from GPU to视频decoder',
            content: `DMA-BUF 跨device Buffer sharedprocess

scenario: Wayland 合成器 + 视频播放器

视频播放器process                           Wayland 合成器process
───────────────                           ───────────────────

1. VCN 解码视频帧to BO                   
   amdgpu_bo (VRAM)                       
   physicalpage: [0x1000, 0x2000, ...]        
        │                                 
2. 导出 DMA-BUF fd                        
   ioctl(gpu_fd,                          
     PRIME_HANDLE_TO_FD, &args)           
        │                                 
        │  fd = 42 (DMA-BUF filedescriptor)   
        │                                 
        │  ┌─────────────────────┐        
        │  │  struct dma_buf     │        
        │  │  ├─ ops: amdgpu_*  │        
        │  │  ├─ size: 8294400  │ (1920×1080×4)
        │  │  ├─ file: fd=42    │        
        │  │  └─ priv: amdgpu_bo│        
        │  └─────────────────────┘        
        │                                 
3. through Unix socket pass fd ──────────▶  4. 收to fd=42
   sendmsg(SCM_RIGHTS)                      │
                                             │
                                          5. 导入 DMA-BUF
                                             ioctl(gpu_fd,
                                               PRIME_FD_TO_HANDLE,
                                               &args)
                                             │
                                             ▼
                                          6. 获得local GEM handle
                                             handle = 17
                                             │
                                             ▼
                                          7. 绑定as纹理rendering
                                             GPU directlyread同一block
                                             physicalpage [0x1000, ...]
                                             零copy! 

physical memory视角: 
┌──────────────────────────────────────────────────────┐
│  VRAM                                                 │
│                                                       │
│  ┌─────────┐                                          │
│  │ 视频帧   │ ← VCN 解码output (exporter  BO)        │
│  │ 1920×1080│ ← meanwhileis also合成器纹理 (importer  BO)│
│  │ NV12     │                                         │
│  └─────────┘                                          │
│  同一blockphysical memory, twoprocessthroughdifferent BO access              │
│  datafromnot yetbycopy — 这is零copy                         │
└──────────────────────────────────────────────────────┘

DMA-BUF sg_table(scatter-gather 表): 
  ┌────────────────────────────────────────┐
  │  entry[0]: phys=0x80001000, len=4096   │
  │  entry[1]: phys=0x80005000, len=4096   │
  │  entry[2]: phys=0x80002000, len=8192   │
  │  ...                                    │
  │  → Importer  IOMMU/GART willthesescatter   │
  │    pagemappingasdevicecontiguousaddress space            │
  └────────────────────────────────────────┘`,
            caption: 'DMA-BUF implementation零copycompleteprocess. 视频decoder(VCN)will帧data解码to VRAM, through DMA-BUF fd shared给合成器, 合成器directlywill同一block VRAM data作as纹理rendering — datafromnot yet离开 VRAM. ',
          },
          codeWalk: {
            title: 'amdgpu PRIME export — 导出 DMA-BUF',
            file: 'drivers/gpu/drm/amd/amdgpu/amdgpu_dma_buf.c',
            language: 'c',
            code: `/* amdgpu_dma_buf.c — DMA-BUF 导出/导入implementation */

/* dma_buf_ops callback: will amdgpu BO physicalpagemappingto importer */
static struct sg_table *
amdgpu_gem_map_dma_buf(struct dma_buf_attachment *attach,
                        enum dma_data_direction dir)
{
    struct drm_gem_object *obj = attach->dmabuf->priv;
    struct amdgpu_bo *bo = gem_to_amdgpu_bo(obj);
    struct sg_table *sgt;
    long r;

    /* ensure BO in GTT 域(importer needthrough PCIe access) */
    r = amdgpu_bo_pin(bo, AMDGPU_GEM_DOMAIN_GTT);
    /*
     * if BO currentin VRAM 且 importer is另adevice, 
     * needmigrationto GTT(system memory)使其canthrough PCIe access. 
     * if importer is同a GPU, VRAM directlycanaccess. 
     */

    /* get BO physicalpage散布表 */
    sgt = drm_prime_pages_to_sg(obj->dev,
                                 bo->tbo.ttm->pages,
                                 bo->tbo.ttm->num_pages);

    /* 建立 DMA mapping(set IOMMU/GART mapping) */
    dma_map_sgtable(attach->dev, sgt, dir, 0);
    /*
     * dma_map_sgtable() 做两件事: 
     *   1. ifhas IOMMU: willphysicalpagemappingto IOMMU address space
     *   2. CPU cachesynchronization: ensuredevicecan看tolatestdata
     */

    return sgt;
}

/* complete dma_buf_ops structure */
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

/* 导入path: from DMA-BUF fd createlocal BO */
struct drm_gem_object *
amdgpu_gem_prime_import(struct drm_device *dev,
                         struct dma_buf *dma_buf)
{
    struct drm_gem_object *obj;

    /* self-import optimization: if DMA-BUF 自同a amdgpu */
    if (dma_buf->ops == &amdgpu_dmabuf_ops) {
        obj = dma_buf->priv;
        if (obj->dev == dev) {
            /* 同一device — directly复用原 BO, 增加引用i.e.can */
            drm_gem_object_get(obj);
            return obj;
        }
    }

    /* differentdevice — create import BO wrappersharedpage */
    return drm_gem_prime_import(dev, dma_buf);
}`,
            annotations: [
              'amdgpu_gem_map_dma_buf will BO physicalpagethrough sg_table 暴露给 importer',
              'amdgpu_bo_pin() ensure BO will notby evict(migration), 保证 importer access期betweenaddress稳定',
              'drm_prime_pages_to_sg() will TTM managementphysicalpage数组转as scatter-gather table',
              'dma_map_sgtable() set IOMMU mappingandcachecoherence — devicebetweensharedkey',
              'self-import optimization: 同device导出 DMA-BUF directly复用原 BO, avoid额outside sg_table 开销',
              'begin/end_cpu_access callbackensure CPU readshared Buffer 时看toisdevicewritelatestdata',
            ],
            explanation: 'DMA-BUF 导出coreis amdgpu_gem_map_dma_buf() — 它will amdgpu BO physicalpage打包as sg_table 供 importer use. note amdgpu_bo_pin() call: 导出期between BO mustby pin 住(notallowmigration), otherwise importer 正inaccessphysicalpagemayby TTM eviction 移走, causedata损坏. self-import optimizationdemonstratekernelcode效率意识 — 同devicesharednotneed走complete DMA-BUF protocol. ',
          },
          miniLab: {
            title: 'check /proc/pid/fdinfo in DMA-BUF 引用',
            objective: 'through /proc filesystemobserve DMA-BUF inactualruninuse情况, understand零copysharedin桌面systemin普遍性. ',
            steps: [
              'find Wayland compositor process ID: pidof gnome-shell or pidof kwin_wayland or pidof sway',
              'view其打开 DMA-BUF filedescriptor: ls -la /proc/<pid>/fd/ | grep dmabuf',
              'view DMA-BUF detailedinformation: cat /proc/<pid>/fdinfo/<fd_num>(lookupcontain "drm-driver" 条目)',
              'statisticssysteminall DMA-BUF 总size: cat /sys/kernel/debug/dma_buf/bufinfo(need root)',
              'startupa视频播放器(如 mpv), again次check DMA-BUF count增加',
              'compare播放beforeafter /sys/kernel/debug/dma_buf/bufinfo 变化, confirm视频帧use DMA-BUF shared',
            ],
            expectedOutput: `$ cat /proc/$(pidof gnome-shell)/fdinfo/14
pos:    0
flags:  02000002
mnt_id: 10
ino:    1234
drm-driver:     amdgpu
drm-pdev:       0000:03:00.0
drm-total-vram: 8176 MiB
drm-shared-vram:        48 MiB   ← andotherprocessshared VRAM
drm-total-gtt:  128 MiB

$ sudo cat /sys/kernel/debug/dma_buf/bufinfo
size    flags   mode    count   exp_name
8294400 000002  00000007 2      amdgpu  ← 8MB framebuffer, 2个引用者
4194304 000002  00000007 3      amdgpu  ← 4MB buffer, 3个引用者`,
            hint: 'if /proc/pid/fdinfo no drm-* 字段, yourkernelversionmay较旧. Linux 5.15+ in fdinfo inadd DRM memorystatisticsinformation. alsocan用 sudo cat /sys/kernel/debug/dma_buf/bufinfo viewglobal DMA-BUF information. ',
          },
          debugExercise: {
            title: 'diagnose DMA-BUF import failure: size mismatch',
            language: 'c',
            description: 'a视频播放器through DMA-BUF will解码帧shared给 GPU rendering. import success但renderingresult出现花屏(garbage pixels). dmesg inno明显error. ',
            question: 'whatcause花屏? 提示: check exporter and importer 对 Buffer 尺寸假设. ',
            buggyCode: `/* 视频decoder(exporter)— allocation解码帧 Buffer */
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

    /* 导出as DMA-BUF */
    struct drm_prime_handle prime = {
        .handle = args.out.handle,
        .flags = DRM_RDWR,
    };
    ioctl(gpu_fd, DRM_IOCTL_PRIME_HANDLE_TO_FD, &prime);
    return prime.fd;
}

/* GPU rendering器(importer)— use解码帧作as纹理 */
void use_as_texture(int gpu_fd, int dmabuf_fd)
{
    struct drm_prime_handle prime = {
        .fd = dmabuf_fd,
    };
    ioctl(gpu_fd, DRM_IOCTL_PRIME_FD_TO_HANDLE, &prime);

    /* BUG: 假设 Buffer is XRGB8888 format */
    /* XRGB8888: width * height * 4 = 8294400 bytes */
    /* 但actual Buffer only 3110400 bytes (NV12) */
    bind_texture(prime.handle, 1920, 1080,
                 DRM_FORMAT_XRGB8888);  /* formatnotmatch!  */
    /* GPU willread超出 Buffer boundarymemory → 花屏 */
}`,
            hint: 'DMA-BUF 只passphysical memory引用, notpassformatinformation(宽度, 高度, 像素format, stride). exporter and importer mustthroughother途径(如 Wayland protocol)约定 Buffer formatparameter. ',
            answer: 'issue: exporter allocationis NV12 format Buffer(1920×1080×1.5 = 3,110,400 bytes), 但 importer 假设它is XRGB8888 format(1920×1080×4 = 8,294,400 bytes). XRGB8888 每像素 4 bytes, NV12 每像素 1.5 bytes — importer 期望 Buffer isactualsize 2.67 倍. when GPU 作as纹理read时, 它will超出 Buffer boundaryreadnot yetinitialization VRAM 内容, displayas花屏. DMA-BUF protocol本身notpass像素formatinformation — 它只is一block"raw memory"sharedhandle. formatinformationmustthrough带outsidechannel协商: in Wayland in, wl_buffer create时客户端声明 format, width, height, stride; in V4L2 in, VIDIOC_S_FMT setformat. fix: importer shouldusecorrectformat DRM_FORMAT_NV12, or exporter shouldallocation XRGB8888 format Buffer(if两端约定use XRGB). key教训: DMA-BUF sharedphysical memory, 元data(format, 尺寸)mustthroughotherprotocolsynchronization. ',
          },
          interviewQ: {
            question: 'explain DMA-BUF protocol exporter/importer 模型. in Wayland 桌面environmentin, DMA-BUF howimplementation零copy窗口合成? ',
            difficulty: 'hard',
            hint: 'describe exporter 职责(allocationmemory, provide sg_table, managementlifecycle)and importer 职责(through sg_table 建立 DMA mapping). in Wayland scenarioin, explain窗口内容howfromapplication GPU context零copypassto合成器 GPU context. ',
            answer: 'DMA-BUF exporter/importer 模型: Exporter is Buffer all者, responsible for(1)allocationphysical memory; (2)implementation dma_buf_ops callback(.map_dma_buf provide scatter-gather table, .release releasememory); (3)ensure importer access期betweenmemoryvalid(pin 住 BO prevent eviction). Importer is Buffer use者, through DMA-BUF fd((1)attach to exporter  dma_buf; (2)call .map_dma_buf get sg_table(physicalpagelist); (3)willphysicalpagemappingtoselfdeviceaddress space(through IOMMU/GART); (4)use完毕after unmap 并 detach. in Wayland 零copy合成in: (1)applicationprocess GPU contextrendering窗口内容to一block VRAM Buffer; (2)applicationthrough DRM PRIME(prime_handle_to_fd)will BO 导出as DMA-BUF fd; (3)fd through Wayland protocol(wl_drm or linux-dmabuf-v1)and Unix socket(SCM_RIGHTS)pass给合成器; (4)合成器through prime_fd_to_handle will DMA-BUF fd 导入aslocal GEM handle; (5)合成器will handle 绑定as GPU 纹理, 合成all窗口to scanout framebuffer; (6)entireprocessin像素data始终in VRAM in, fromnot yet经过 CPU orsystem memory — 这is零copy. keydetail: 同 GPU  self-import directly复用原 BO(reference counting+1), notneed sg_table; differentdevicebetweensharedneed BO in GTT/System 域(canthrough PCIe access), performancenot如 VRAM 内shared. ',
            amdContext: 'DMA-BUF is Linux graphicsstack基石之一. AMD interviewindemonstrate你understandfrom Wayland protocolto DRM PRIME tokernel dma_buf_ops completepath, and零copy对桌面performanceimportant性, willletinterviewer认as你hassystem级视野. ',
          },
        },
      ],
    },
  ],
  completionChecklist: [
    'understand DRM corearchitecture: drm_device / drm_driver / ioctl 分发mechanism',
    'candescribe KMS displaypipeline: Plane → CRTC → Encoder → Connector 及各自职责',
    'understand Atomic Mode Setting 两stagecommit(check → commit)and test-only pattern',
    'master GEM and TTM 角色difference: GEM 做user spaceinterface, TTM 做 VRAM 域managementand eviction',
    'understand Buffer Object lifecycle: create → place → map → use → migrate → destroy',
    'canexplain DMA-BUF  exporter/importer 模型and零copyprinciple',
    'know amdgpu incorrespondingimplementation: amdgpu_kms_driver, amdgpu_dm, amdgpu_ttm, amdgpu_dma_buf',
    'canuse sysfs/debugfs/modetest/strace toolobserve DRM subsystemrunstate',
  ],
};
