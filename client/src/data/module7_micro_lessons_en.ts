// ============================================================
// AMD Linux Driver Learning Platform - Module 7 Micro-Lessons (English)
// Module 7: ROCm Kernel Interface (ROCm kernelinterface KFD)
// 4 lessons in 2 groups, ~15-20 min each, total ~70 min
// ============================================================
import type { MicroLessonModule } from './micro_lesson_types';

export const module7MicroLessonsEn: MicroLessonModule = {
  moduleId: 'rocm-kernel',
  groups: [
    // ════════════════════════════════════════════════════════════
    // Group 7.1: HSA architectureand KFD basics
    // ════════════════════════════════════════════════════════════
    {
      id: '7-1',
      number: '7.1',
      title: 'HSA architectureand KFD basics',
      titleEn: 'HSA Architecture & KFD Basics',
      icon: 'Zap',
      description: 'understand HSA 异构computestandard, KFD in amdgpu in角色, /dev/kfd devicenode运作mechanism, and KFD and传统 DRM interfacecore差异. ',
      lessons: [
        // ── Lesson 7.1.1 ──────────────────────────────────────
        {
          id: '7-1-1',
          number: '7.1.1',
          title: 'HSA architectureand KFD 概述',
          titleEn: 'HSA Architecture & KFD Overview',
          duration: 18,
          difficulty: 'advanced',
          tags: ['HSA', 'KFD', 'ROCm', '/dev/kfd', 'kfd_process', 'chardev'],
          concept: {
            summary: 'HSA(Heterogeneous System Architecture)is一种异构computestandard, define CPU and GPU howshared memoryand协作execute. KFD(Kernel Fusion Driver)is amdgpu driverinimplementation HSA kernelinterface子module, through /dev/kfd devicenode暴露computeability, and传统 DRM renderinginterface /dev/dri/renderD128 形成互补. ',
            explanation: [
              'HSA 由 HSA Foundation 制定(AMD is创始成员), 其core理念is: CPU and GPU notagainis"主fromrelationship", but rather平等compute代理(Agent). in HSA 模型in, CPU and GPU shared同avirtualaddress space(Shared Virtual Memory), GPU candirectlyaccess CPU memory页, 反之亦然. 这消除传统 GPGPU programminginexplicit cudaMemcpy 需求 — datanotneedin CPU and GPU 之between手动copy. ',
              'KFD is HSA in Linux kernelinimplementation, code位于 drivers/gpu/drm/amd/amdkfd/ directory. 它is notaindependentdriver, but rather amdgpu driver子module. KFD through /dev/kfd character devicenode向user space暴露 HSA function. ROCm run时(libhsa-runtime64.so)through ioctl call KFD createcomputequeue, allocation GPU memory, managementsemaphore等. ',
              'understand KFD and DRM interfacedifference至关important. DRM interface(/dev/dri/card0, renderD128)面向graphicsrenderingandgeneral GPU access — Mesa radeonsi/radv through它commitrenderingcommand. KFD interface(/dev/kfd)专门面向 HSA compute — ROCm/HIP through它commitcompute任务. 两者inkernelin共用 amdgpu driver底layerhardwareaccesslayer, 但usedifferentcommandformat(DRM 用 PM4, KFD 用 AQL), differentqueuetype(DRM 用 GFX Ring, KFD 用 Compute Queue), differentmemory模型(DRM 用 GEM/TTM, KFD still额outsidesupport SVM). ',
              'KFD lifecyclemanagement围绕 kfd_process structure体展开. whenuser spaceprocess第oncethrough ioctl access /dev/kfd 时, KFD as该processcreatea kfd_process 实例, wherecontainprocess GPU resource(queue, memory mapping, event). thisstructure体贯穿entire KFD subsystem, isunderstand KFD codecoredata structure. kfd_process 持has该processinall GPU on kfd_process_device list — each GPU correspondinga kfd_process_device, whererecord该processin这block GPU on doorbell mapping, queuelistandaddress space ID(PASID). ',
            ],
            keyPoints: [
              'HSA define CPU/GPU as平等compute代理(Agent), sharedvirtualaddress space, 消除explicitdatacopy',
              'KFD code位于 drivers/gpu/drm/amd/amdkfd/, is amdgpu 子modulerather thanindependentdriver',
              '/dev/kfd 面向 HSA compute(ROCm/HIP), /dev/dri/renderD128 面向graphicsrendering(Mesa)',
              'KFD use AQL command packet + Compute Queue; DRM use PM4 command packet + GFX Ring',
              'kfd_process is KFD coredata structure, managementaprocessinall GPU oncomputeresource',
              'kfd_process_device 关联processandspecific GPU, 持has PASID, doorbell mappingandqueuelist',
            ],
          },
          diagram: {
            title: 'KFD and DRM 双patharchitecture',
            content: `amdgpu driver双interfacearchitecture: DRM(graphics)vs KFD(compute)

user space
─────────────────────────────────────────────────────────────
  graphicspath                              computepath
  ────────                              ────────
  游戏 / Blender                        HIP program / PyTorch
       │                                     │
       ▼                                     ▼
  Mesa radeonsi/radv                    ROCm Runtime
  (OpenGL / Vulkan)                     libhsa-runtime64.so
       │                                     │
       ▼                                     ▼
  libdrm (amdgpu)                       directly ioctl
       │                                     │
       ▼                                     ▼
  /dev/dri/renderD128                   /dev/kfd
  (DRM render node)                     (HSA device node)
       │                                     │
═══════╪═════ system callboundary ══════════════════╪═══════════════
       │                                     │
kernel space│                                     │
       ▼                                     ▼
  DRM ioctl 分发                        KFD ioctl 分发
  drm_ioctl()                           kfd_ioctl()
       │                                     │
       ▼                                     ▼
  amdgpu_cs_ioctl()                     kfd_ioctl_create_queue()
  ├─ PM4 command packetverify                     ├─ AQL queuecreate
  ├─ GFX Ring commit                      ├─ Compute Queue mapping
  └─ fence synchronization                         └─ doorbell allocation
       │                                     │
       └──────────┬──────────────────────────┘
                  │
                  ▼
          amdgpu hardwareabstractionlayer
          ├─ MMIO registeraccess
          ├─ VRAM management (TTM)
          ├─ interrupt handling (IH Ring)
          └─ firmwareinterface (PSP/SMU)
                  │
                  ▼
            GPU hardware (Navi33)
            ┌─────────────────────────┐
            │ Shader Engines (32 CU)  │
            │ ┌─────┐ ┌─────┐        │
            │ │GFX  │ │Comp │        │
            │ │Rings│ │Queue│        │
            │ └─────┘ └─────┘        │
            └─────────────────────────┘`,
            caption: 'amdgpu drivermeanwhileasgraphicsrenderingand GPU computeprovidekernelinterface. 两条pathinuser space分别through /dev/dri/renderD128 and /dev/kfd 进入kernel, in底layersharedhardwareaccesslayer. Compute Queue canindependent于 GFX Ring by GPU directlyscheduling. ',
          },
          codeWalk: {
            title: 'kfd_open — process首次打开 /dev/kfd entry point',
            file: 'drivers/gpu/drm/amd/amdkfd/kfd_chardev.c',
            language: 'c',
            code: `/* kfd_chardev.c — /dev/kfd fileoperateimplementation */

static const struct file_operations kfd_fops = {
    .owner   = THIS_MODULE,
    .unlocked_ioctl = kfd_ioctl,  /* all KFD ioctl entry point */
    .compat_ioctl   = compat_ptr_ioctl,
    .open    = kfd_open,           /* process打开 /dev/kfd */
    .release = kfd_release,        /* process关闭 /dev/kfd */
    .mmap    = kfd_mmap,           /* mmap doorbell / events */
};

static int kfd_open(struct inode *inode, struct file *filep)
{
    struct kfd_process *process;
    bool is_32bit_user_mode;

    /* checkcurrentprocesswhetheris 32 位 — KFD notsupport 32 位process */
    is_32bit_user_mode = in_compat_syscall();
    if (is_32bit_user_mode) {
        dev_warn(kfd_device,
            "Process %d (32-bit) rejected\\n", current->pid);
        return -EPERM;
    }

    /* core: getorcreatecurrentprocess kfd_process
     * ifprocessalready打开过 /dev/kfd, returnalreadyhas kfd_process
     * otherwisecreate新 kfd_process 并initialization: 
     *   - allocation PASID (Process Address Space ID)
     *   - aseach GPU create kfd_process_device
     *   - registration MMU notifier(监控processpage table变化)
     */
    process = kfd_create_process(current);
    if (IS_ERR(process))
        return PTR_ERR(process);

    /* will kfd_process saveto file  private_data
     * after续all ioctl callallthrough它getprocesscontext
     */
    if (kfd_is_locked()) {
        kfd_unref_process(process);
        return -EAGAIN;
    }

    /* kfd_process reference counting +1 */
    filep->private_data = process;

    dev_dbg(kfd_device, "Opened /dev/kfd for pid %d\\n",
            process->lead_thread->pid);
    return 0;
}`,
            annotations: [
              'kfd_fops is /dev/kfd devicenodefileops table, kfd_ioctl handleall HSA ioctl request',
              'KFD notsupport 32 位process — HSA to求 64 位virtualaddress space以implementation CPU-GPU 统一寻址',
              'kfd_create_process() iscorefunction: allocation PASID, create kfd_process_device, registration MMU notifier',
              'PASID isprocessaddress space ID, GPU 用它区分differentprocesspage table, implementationprocess隔离',
              'MMU notifier let KFD 感知processpage table变化(如 munmap), 及时update GPU page table保持一致',
              'filep->private_data save kfd_process pointer, after续 ioctl through它findprocess GPU resource',
            ],
            explanation: 'thiscodeisuser space ROCm run时access GPU computeability第一步. when libhsa-runtime64.so call open("/dev/kfd", ...) 时, kernelexecute kfd_open, as该processcreatecomplete HSA executeenvironment. kfd_create_process internalwilltraversesysteminall KFD device(GPU), aseach GPU create kfd_process_device, this meansa ROCm processfrom一startcanaccessallalreadyregistration GPU. understandthisentry point点isreadall KFD code起点. ',
          },
          miniLab: {
            title: '探索 /dev/kfd devicenodeand KFD source codestructure',
            objective: 'checksystemon KFD devicenode, kernel moduleparameter, 并解 KFD source codedirectorystructure. ',
            steps: [
              'check /dev/kfd whetherexist: ls -la /dev/kfd(need amdgpu kernel moduleand ROCm support)',
              'view KFD in dmesg ininitializationinformation: dmesg | grep -i "kfd\\|hsa"',
              'ifinstall ROCm: run /opt/rocm/bin/rocminfo view HSA Agent list',
              'statistics KFD source codescale: find drivers/gpu/drm/amd/amdkfd/ -name "*.c" -o -name "*.h" | xargs wc -l | tail -1',
              'view KFD ioctl define: grep -n "AMDKFD_IOC_" include/uapi/linux/kfd_ioctl.h | head -20',
              'checkkernelwhetherenable KFD: zgrep HSA_AMD /proc/config.gz or grep HSA_AMD /boot/config-$(uname -r)',
            ],
            expectedOutput: `$ ls -la /dev/kfd
crw-rw---- 1 root render 234, 0  /dev/kfd   ← major 234 character device

$ dmesg | grep -i kfd
[  2.65] kfd kfd: Initialized module
[  2.66] kfd kfd: added device 1002:7480   ← your Navi33

$ rocminfo | grep -A2 "Agent"
Agent 1: CPU (gfx000)
Agent 2: GPU (gfx1102)          ← your GPU 作as HSA Agent

$ grep HSA_AMD /boot/config-$(uname -r)
CONFIG_HSA_AMD=y                ← KFD alreadycompilation进kernel`,
            hint: 'if /dev/kfd notexist, checkkernelconfigurationin CONFIG_HSA_AMD whetherenable. ifusedistributionkernel, 大多数现代distributiondefaultenable此选项. ROCm installis notmust — /dev/kfd 由kernel amdgpu modulecreate. ',
          },
          debugExercise: {
            title: 'diagnose KFD device打开failure',
            language: 'c',
            description: 'a ROCm applicationincall open("/dev/kfd", O_RDWR) 时returnerror. belowisrelated strace outputand dmesg log. findfailurecause. ',
            question: 'whyprocessunable to打开 /dev/kfd? 给出根本causeandresolvemethod. ',
            buggyCode: `/* strace output */
openat(AT_FDCWD, "/dev/kfd", O_RDWR) = -1 EACCES (Permission denied)

/* dmesg log */
[  2.65] kfd kfd: Initialized module
[  2.66] kfd kfd: added device 1002:7480

/* devicenodepermission */
$ ls -la /dev/kfd
crw-rw---- 1 root render 234, 0 /dev/kfd

/* currentuser组 */
$ groups
myuser adm sudo audio

/* 另一种mayfailurescenario */
$ /opt/rocm/bin/rocminfo
HSA_STATUS_ERROR_OUT_OF_RESOURCES: PASID allocation failed`,
            hint: '第ascenario: checkuserwhether属于 render 组. 第二个scenario: PASID allocationfailureusuallyand IOMMU configurationhas关. ',
            answer: 'scenario 1(EACCES): /dev/kfd permissionis crw-rw---- root:render, only root and render 组usercan打开. currentusernotin render 组in. resolve: sudo usermod -aG render myuser, thenre-登录. scenario 2(PASID allocationfailure): PASID(Process Address Space ID)由 IOMMU subsystemmanagement. ifkernelstartup时not yetenable IOMMU(缺少 iommu=on or amd_iommu=on kernelparameter), KFD mayunable toallocation PASID. resolve: in GRUB configurationinadd amd_iommu=on iommu=pt kernelparameter, re-startup. iommu=pt(passthrough)patternallow KFD use IOMMU 进行 PASID management而notimpact DMA performance. 这twoallis部署 ROCm 时最commonissue. ',
          },
          interviewQ: {
            question: 'explain KFD in amdgpu driverin角色. 它and传统 DRM renderinginterfacehaswhatdifference? whyneedtwoindependentinterface? ',
            difficulty: 'medium',
            hint: 'fromdesigngoal(graphics vs compute), commandformat(PM4 vs AQL), queue模型(kernelscheduling vs user-spacescheduling)andmemory模型(GEM/TTM vs SVM)四个维度compare. ',
            answer: 'KFD(Kernel Fusion Driver)is amdgpu driverinimplementation HSA computeinterface子module, through /dev/kfd 向 ROCm run时暴露 GPU computeability. 它and DRM renderinginterfacecoredifference: (1)designgoal: DRM 面向graphicsrendering(Mesa  OpenGL/Vulkan), KFD 面向generalcompute(ROCm  HIP/OpenCL); (2)commandformat: DRM use PM4 command packet(GPU commandhandle器原生format), KFD use AQL(Architected Queuing Language)包(HSA standarddefine平台无关format); (3)queue模型: DRM command submissionneed经过kernelverify(amdgpu_cs_ioctl), KFD allowuser spacedirectlywritequeue并through doorbell notify GPU, 绕过kernel热path(减少latency); (4)memory模型: DRM use GEM/TTM explicitmanagement GPU memory, KFD still额outsidesupport SVM(Shared Virtual Memory), CPU and GPU shared同一virtualaddress space. needtwointerfacecauseiscomputework负载hasdifferentperformanceto求 — GPU computeneed极低latencyqueuecommitand统一memoryaccess, thesein传统graphics API inis not优先考虑. ',
            amdContext: '这is AMD ROCm teaminterview经典issue. keyisdemonstrate你understand KFD is not DRM 替代品, but rather针对computescenario专用interface, 两者in底layershared amdgpu hardwareabstractionlayer. ',
          },
        },

        // ── Lesson 7.1.2 ──────────────────────────────────────
        {
          id: '7-1-2',
          number: '7.1.2',
          title: 'KFD queuemanagementand AQL command packet',
          titleEn: 'KFD Queue Management & AQL Packets',
          duration: 20,
          difficulty: 'advanced',
          tags: ['AQL', 'compute-queue', 'HQD', 'MQD', 'doorbell', 'user-mode-queue'],
          concept: {
            summary: 'computequeueis KFD coreabstraction. andgraphics Ring Buffer different, KFD computequeueallowuser spacedirectlywrite AQL command packet并through doorbell registernotify GPU execute, 无需kernel参and热path. HQD(Hardware Queue Descriptor)and MQD(Memory Queue Descriptor)iswill软件queuemappingto GPU hardwarekeydata structure. ',
            explanation: [
              'in传统graphicsrenderingpathin, each timecommitcommandalltothroughkernel(ioctl → amdgpu_cs_ioctl → verify → write Ring Buffer), 这引入system call开销. for高throughput GPU computescenario(如 AI 训练in每秒数千次 kernel launch), this开销notcan接受. KFD resolveplanisuser-spacequeue(User-Mode Queue): queuememorydirectlymappingtouser space, user spacecandirectlywrite AQL 包, then写 doorbell registernotify GPU, entireprocessnotneedsystem call. ',
              'AQL(Architected Queuing Language)is HSA standarddefinecommand packetformat. each AQL 包is固定 64 bytes, contain: type(Kernel Dispatch, Barrier, Agent Dispatch), 维度information(grid_size_x/y/z, workgroup_size_x/y/z), kernelcodeentry pointaddress(kernel_object), kernelparameteraddress(kernarg_address), complete信号(completion_signal). and PM4 formatkeydifferenceis: AQL is HSA standard化, 跨平台can移植; PM4 is AMD GPU hardware私has, performancemay更高但notcan移植. ',
              'HQD(Hardware Queue Descriptor)is GPU hardwarein固定countqueue槽位, each HQD correspondingahardwarecandirectlyschedulingqueue. Navi33 each Compute Engine hasmultiple HQD, 总数has限. MQD(Memory Queue Descriptor)is KFD inmemoryincreatequeuedescribedata structure, containqueueallstate: 基address, size, 读写pointer, doorbell offset 等. whenqueuebymappingto HQD 时, GPU  CP(Command Processor)from MQD inloadingqueueparameter; whenqueueby抢占(preempt)时, CP willcurrentstatesave回 MQD. 这种 MQD-HQD mappingmechanismallow软件queuecount远超hardware HQD count — throughqueuescheduler(HWS, Hardware Scheduler or SWS, Software Scheduler)dynamicmapping. ',
              'user-spacequeuecommitcompleteprocess: (1)user spaceinqueuememoryinwrite AQL 包; (2)updatequeue write_dispatch_id(写pointer); (3)写 doorbell register — 这isamemory mapping MMIO address, once 4 byteswritecannotify GPU  CP has新command; (4)GPU  CP detectto doorbell write, fromcorrespondingqueue MQD inget读pointer, read AQL 包; (5)CP parse AQL 包, startupcomputeshader(dispatch); (6)computecompleteafter, GPU updatecomplete信号(completion_signal). entire热path — from写 AQL 包to GPU startexecute — 只needuser spacememory写operateandonce doorbell MMIO write, latencyin微秒级. ',
            ],
            keyPoints: [
              'user-spacequeueallowdirectlywrite AQL 包 + doorbell MMIO, 绕过kernel热path, latencyin微秒级',
              'AQL 包固定 64 bytes, contain dispatch 维度, kernel_object address, kernarg addressand completion_signal',
              'HQD is GPU hardwarequeue槽位(counthas限), MQD ismemoryinqueuedescriptor(can很多)',
              'MQD ↔ HQD dynamicmapping由 HWS(Hardware Scheduler)or KFD 软件schedulermanagement',
              'doorbell isa 4 bytes MMIO write, GPU CP detecttoafterfromcorrespondingqueueread新command',
              'queue抢占: CP willcurrentstatesave回 MQD, release HQD 给otherqueueuse',
            ],
          },
          diagram: {
            title: 'AQL user-spacequeuecommitprocess',
            content: `user-space AQL queuecommitpath(零kernel介入)

user space (ROCm Runtime)
─────────────────────────────────────────────────────────
  1) write AQL 包toqueuememory
  ┌──────────────────────────────────────────────┐
  │  AQL Queue (mmap'd to userspace)             │
  │  ┌────────┬────────┬────────┬────────┐       │
  │  │AQL pkt │AQL pkt │AQL pkt │ (空)   │       │
  │  │dispatch│dispatch│barrier │        │       │
  │  │grid:   │grid:   │signal  │        │       │
  │  │256x1x1 │1024x1  │wait    │        │       │
  │  └────────┴────────┴────────┴────────┘       │
  │   read_ptr ──────────────▲  ▲── write_ptr    │
  └──────────────────────────┼──┼────────────────┘
                             │  │
  2) update write_dispatch_id  │  │
  3) 写 doorbell register ─────┼──┘
     *(uint32_t*)doorbell_mmap = new_wptr;
                             │
═══════════════ 无system call ══╪════════════════════════
                             │
GPU hardware                     │
─────────────────────────────┼───────────────────────
  4) Command Processor detect doorbell write
     ┌───────────────────────┐
     │    CP (MEC/HPD)       │
     │    detect doorbell      │──→ read MQD
     │    doorbell[queue_id] │      │
     └───────────────────────┘      ▼
                              ┌──────────┐
                              │   MQD    │
                              │ base_addr│
                              │ read_ptr │
                              │ write_ptr│
                              │ doorbell │
                              └────┬─────┘
                                   │
  5) fromqueuememoryread AQL 包         │
     ┌─────────────────────────────▼──┐
     │  AQL Packet (64 bytes)         │
     │  ┌───────────────────────────┐ │
     │  │ header:    DISPATCH       │ │
     │  │ dimensions: 3             │ │
     │  │ grid_size_x: 256         │ │
     │  │ workgroup_size_x: 64     │ │
     │  │ kernel_object: 0x7f...   │ │
     │  │ kernarg_address: 0x7f... │ │
     │  │ completion_signal: sig_1 │ │
     │  └───────────────────────────┘ │
     └────────────────┬───────────────┘
                      │
  6) startup Compute Shader
     Shader Engines execute kernel
     completeafterupdate completion_signal`,
            caption: 'user-space AQL queuecommitprocess. entire热pathnot涉及system call: user spacedirectlyin mmap queuememoryinwrite AQL 包, then写 doorbell MMIO notify GPU. GPU  Command Processor(MEC)detectto doorbell afterread并executecommand. ',
          },
          codeWalk: {
            title: 'kfd_ioctl_create_queue — createcomputequeue',
            file: 'drivers/gpu/drm/amd/amdkfd/kfd_chardev.c',
            language: 'c',
            code: `/* kfd_chardev.c — create KFD computequeue ioctl handlefunction */

static int kfd_ioctl_create_queue(struct file *filep,
                struct kfd_process *p, void *data)
{
    struct kfd_ioctl_create_queue_args *args = data;
    struct kfd_dev *dev;
    struct kfd_process_device *pdd;
    struct queue_properties properties;
    int err;

    /* lookupgoal GPU device */
    dev = kfd_device_by_id(args->gpu_id);
    if (!dev)
        return -EINVAL;

    /* getprocessin该 GPU on process_device */
    pdd = kfd_get_process_device_data(dev, p);
    if (!pdd)
        return -ENOMEM;

    /* willuser spaceparameterconvertaskernel queue_properties
     * include: queuetype, queuesize, priority
     *       ring_base_address(queuememory基address, user-spaceallocation)
     *       write_ptr / read_ptr address
     *       doorbell_offset
     */
    memset(&properties, 0, sizeof(properties));
    properties.type = args->queue_type;
    properties.queue_address = args->ring_base_address;
    properties.queue_size = args->ring_size;
    properties.queue_percent = args->queue_percentage;
    properties.priority = args->queue_priority;

    /* allocation doorbell page并setoffset */
    err = kfd_queue_acquire_buffers(pdd, &properties);
    if (err)
        return err;

    /* core: createqueue并mappingto GPU hardware
     * 1. allocation MQD(Memory Queue Descriptor)
     * 2. initialization MQD inqueueparameter
     * 3. through HWS ordirectly写 HQD registerwillqueue激活
     */
    err = pqm_create_queue(&p->pqm, dev, filep, &properties,
                           &args->queue_id,
                           NULL, NULL, NULL, &args->doorbell_offset);
    if (err)
        goto err_create;

    /* return给user space: 
     * args->queue_id     — queue ID(after续operate引用)
     * args->doorbell_offset — doorbell in mmap regioninoffset
     *   user space mmap /dev/kfd  doorbell 页after
     *   对 (mmap_base + doorbell_offset) 做 32 位writei.e.cantrigger GPU
     */
    return 0;

err_create:
    kfd_queue_release_buffers(pdd, &properties);
    return err;
}`,
            annotations: [
              'args->ring_base_address isuser space预先allocationqueuering bufferaddress — AQL 包directlywrite这inside',
              'kfd_queue_acquire_buffers allocation doorbell page — doorbell is GPU MMIO 空between一小blockregion',
              'pqm_create_queue iscorecall链: allocation MQD → initialization → mappingto HQD oraddscheduler',
              'args->doorbell_offset return给user spaceafter, usercan mmap doorbell 页并directlywritetrigger GPU',
              'queue_type canis KFD_IOC_QUEUE_TYPE_COMPUTE(compute)or KFD_IOC_QUEUE_TYPE_SDMA(DMA)',
              'queuecreateafter, user space对该queueallcommand submissionallnotneedagain经过kernel(零 ioctl 热path)',
            ],
            explanation: 'thisfunctionis建立user-space GPU computechannelkeystep. user spacethrough此 ioctl once性set好queue, afterallcommand submission(写 AQL 包 + 写 doorbell)alldirectlyinuser spacecomplete. pqm_create_queue internalwillcall GPU specific MQD initializationfunction(如 gfx_v11_0  MQD initialization), set HQD register, final使 GPU  MEC(Micro Engine Compute)startpollingthisqueue doorbell. ',
          },
          miniLab: {
            title: 'tracing ROCm queuecreate ioctl call',
            objective: 'use strace observe ROCm run时howthrough /dev/kfd ioctl createcomputequeueandcommit任务. ',
            setup: `# needinstall ROCm andasimple HIP program
# ifalreadyinstall ROCm, canuse rocm-examples in vectorAdd
sudo apt install rocm-hip-sdk  # ifstill没install`,
            steps: [
              'writeorgetasimple HIP 向量加法program(vectorAdd)',
              'use strace tracing KFD ioctl: strace -e ioctl -f ./vectorAdd 2>&1 | grep kfd',
              'lookup AMDKFD_IOC_CREATE_QUEUE ioctl call, observequeuecreateparameter',
              'lookup AMDKFD_IOC_ALLOC_MEMORY_OF_GPU ioctl, observe GPU memory allocation',
              'statistics各类 KFD ioctl call次数: strace -e ioctl -c -f ./vectorAdd 2>&1',
              'compare DRM ioctl: strace -e ioctl -f glxgears 2>&1 | head -30(observe DRM path差异)',
            ],
            expectedOutput: `$ strace -e ioctl -f ./vectorAdd 2>&1 | grep -c CREATE_QUEUE
2        ← create 2 个computequeue(a compute, a SDMA)

$ strace -e ioctl -f ./vectorAdd 2>&1 | grep ALLOC_MEMORY
ioctl(4, AMDKFD_IOC_ALLOC_MEMORY_OF_GPU, ...)   ← allocation GPU memory
ioctl(4, AMDKFD_IOC_ALLOC_MEMORY_OF_GPU, ...)   ← kernarg memory

note: command submission(写 AQL + doorbell)will not出现in strace in, 
becausetheydirectlythrough mmap inuser spacecomplete, nosystem call! `,
            hint: 'ifnoinstall ROCm, canuse ftrace fromkernel侧tracing KFD functioncall: echo kfd_ioctl_create_queue > /sys/kernel/debug/tracing/set_ftrace_filter. ',
          },
          debugExercise: {
            title: 'diagnosequeuecreatefailure',
            language: 'c',
            description: 'a HIP programin hipLaunchKernelGGL 时crash. strace display AMDKFD_IOC_CREATE_QUEUE return -ENOMEM. belowismaycause. ',
            question: 'queuecreatereturn -ENOMEM maycauseiswhat? howdiagnoseandresolve? ',
            buggyCode: `/* strace output */
ioctl(4, AMDKFD_IOC_CREATE_QUEUE, {queue_type=COMPUTE,
    ring_size=0x400000,    /* 4MB queuesize */
    ring_base=0x0,         /* BUG! user spaceno预allocationqueuememory */
    ...}) = -1 ENOMEM

/* 另一种情况: doorbell resource耗尽 */
/* processcreateexceed 1024 个queueafter */
ioctl(4, AMDKFD_IOC_CREATE_QUEUE, ...) = -1 ENOMEM

/* dmesg log */
[  45.2] kfd: Failed to allocate MQD for queue
[  45.2] kfd: Can't create queue: doorbell allocation failed`,
            hint: 'has两种commoncause: (1) user space传入invalid ring_base_address; (2) GPU  doorbell resourceor MQD memory耗尽. ',
            answer: '两种commoncause: (1)ring_base_address = 0x0: user spaceincall CREATE_QUEUE ioctl beforemust先allocationqueuering buffermemory(usuallythrough AMDKFD_IOC_ALLOC_MEMORY_OF_GPU allocation). ring_base as 0 意味着 ROCm run时memory allocationstepfailure, needcheck GPU memorywhether充足(cat /sys/class/drm/card0/device/mem_info_vram_used). (2)doorbell resource耗尽: eachqueueneeda doorbell slot, GPU  doorbell BAR sizehas限(usually 2MB), each slot 4 bytes, 最多约 512K 个 doorbell. 但actuallimit更小 — KFD aseachprocessallocation doorbell page(4KB/页), 每页can容纳 1024 个 32 位 doorbell. ifaprocesscreate过多queue, doorbell pagewill耗尽. resolvemethod: 销毁notagainusequeue(DESTROY_QUEUE ioctl), orinapplicationdesignin复用queue. 生产environmentinusuallyeach GPU 只needseveralto几十个queue. ',
          },
          interviewQ: {
            question: 'explain AQL 包and PM4 包difference. why KFD use AQL 而is notdirectlyuse PM4? user-spacequeue相比kernel态command submissionhaswhatperformance优势? ',
            difficulty: 'hard',
            hint: 'fromstandard化(HSA vs hardware私has), commitlatency(user-space doorbell vs kernel ioctl), security性(user-spacequeue隔离)三个方面answer. ',
            answer: 'AQL vs PM4: (1)AQL is HSA standarddefineformat(64 bytes固定size), 跨平台can移植 — 同a AQL 包理论oncanin AMD andother HSA 兼容hardwareonrun. PM4 is AMD GPU 私hascommandformat, directlymappingto CP 微码instruction, format因 GPU 代次而异. (2)AQL is面向compute — contain grid/workgroup 维度information, 适合 kernel dispatch. PM4 is面向graphics/general — containstateset, draw call, DMA operate等. (3)GPU  MEC(Micro Engine Compute)原生supportparse AQL 包, notneed额outsidecommandconvert. user-spacequeueperformance优势: 传统 DRM patheach timecommitcommandneed ioctl system call(~2μs 开销)+ kernel态commandverify + copyto Ring Buffer. KFD user-spacequeue只needuser spacememorywrite + once doorbell MMIO write(~100ns), latency降低acount级above. for AI 训练in每秒数万次小 kernel launch, this差异directlyimpact GPU 利用率. security性: eachuser-spacequeuehasindependent PASID and GPUVM page table, GPU hardware保证processbetweenmemory隔离, even ifuser spacedirectlyoperatequeuealsowill notimpactotherprocess. ',
            amdContext: 'AMD interviewinif你can清楚explain AQL user-spacequeuelatency优势and PASID 隔离mechanism, indicate你understand KFD designcore动机 — 这比记住 API parameterhas用得多. ',
          },
        },
      ],
    },

    // ════════════════════════════════════════════════════════════
    // Group 7.2: GPU memoryandsynchronization
    // ════════════════════════════════════════════════════════════
    {
      id: '7-2',
      number: '7.2',
      title: 'GPU memoryandsynchronization',
      titleEn: 'GPU Memory & Synchronization',
      icon: 'Link',
      description: 'SVM 统一virtualaddress spacelet CPU and GPU sharedpointer, GPU page fault andpagemigrationimplementation按需datamove. HSA semaphoreand KFD eventmechanismimplementation高效 CPU-GPU synchronization. ',
      lessons: [
        // ── Lesson 7.2.1 ──────────────────────────────────────
        {
          id: '7-2-1',
          number: '7.2.1',
          title: 'SVM 统一virtualaddress space',
          titleEn: 'SVM Unified Virtual Address Space',
          duration: 20,
          difficulty: 'advanced',
          tags: ['SVM', 'GPUVM', 'PASID', 'page-fault', 'page-migration', 'coherency'],
          concept: {
            summary: 'SVM(Shared Virtual Memory)let CPU and GPU shared同avirtualaddress space — CPU onpointercandirectlyin GPU kernel inuse, 无需explicitcopy. KFD through GPUVM page table, PASID process隔离and GPU page fault handleimplementation这一mechanism, svm_migrate_to_vram/ram functionresponsible forpagein CPU and GPU memory之between按需migration. ',
            explanation: [
              '传统 GPU programming(CUDA 早期pattern)to求program员explicitmanagementdatatransfer: cudaMalloc in GPU onallocationmemory, cudaMemcpy in CPU and GPU 之betweencopydata. 这not仅繁琐, still容易出错 — 忘记synchronization, 重复copy, memoryleak. SVM goalis消除these手动step: in CPU on用 malloc or mmap allocationmemory, GPU candirectlythroughsamevirtual addressaccess; 反之亦然. ',
              'SVM implementationdependencyseveralkeymechanism: (1)GPUVM page table — eachprocessin GPU onhasindependentpage table(similar CPU  MMU page table), willvirtual addressmappingtophysicalpage(VRAM orsystem memory). KFD through amdgpu  VM subsystemmanagementthesepage table. (2)PASID(Process Address Space ID) — eachprocessallocationaunique PASID, GPU in发出memoryaccess时携带 PASID, IOMMU and GPUVM 用它selectcorrectpage table. 这implementationprocess级 GPU memory隔离. (3)GPU page fault — when GPU accessvirtual addressin GPUVM page tableinnovalidmapping时, GPU generate page fault interrupt. KFD  fault handler 捕获thisinterrupt, 按需建立mapping(maytriggerpagemigration). ',
              'pagemigrationis SVM performancekey. when GPU 频繁accesssystem memoryinpage时, KFD canwillpagemigrationto VRAM 以获得更高bandwidth. svm_migrate_to_vram() execute RAM → VRAM migration: (a)in VRAM inallocationgoalpage; (b)through SDMA enginecopydata; (c)update CPU and GPU page table; (d)in CPU page tableininstalla migration entry, if CPU afteraccessthispage, trigger CPU page fault thepage迁回 RAM. svm_migrate_to_ram() is反方向migration. 这种按需migrationmechanismsimilar于operatesystem swap, 但in CPU and GPU memory之between进行. ',
              'CPU-GPU memorycoherence(coherency)is SVM 最complex部分. RDNA3  Navi33 supportthrough PCIe  cache coherency protocol(如 CCIX before身or CXL relatedmechanism), 但in实践in, KFD providedifferentlevelcoherence保证: (a)Coarse-grained: GPU in kernel execute期between看to一致快照, 但not保证real-timecoherence — 适合大多数computescenario. (b)Fine-grained: CPU and GPU 对同一address读写遵循某种order保证 — needhardwarelevel cache snoop, performance开销更大. ROCm usercanthrough hsa_amd_memory_pool_allocate  flags selectcoherencelevel. ',
            ],
            keyPoints: [
              'SVM let CPU/GPU sharedvirtualaddress space — CPU pointercanin GPU kernel indirectlyuse, 消除explicitdatacopy',
              'GPUVM page tableaseachprocess维护independent GPU addressmapping, PASID implementationprocess隔离',
              'GPU page fault trigger按需pagemapping — similar CPU  demand paging mechanism',
              'svm_migrate_to_vram() will热pagemigrationto VRAM 提升 GPU accessbandwidth(SDMA engineexecuteactualcopy)',
              'svm_migrate_to_ram() in CPU needaccessalreadymigrationpage时trigger回迁',
              'KFD through MMU notifier 监听processpage table变化, 保持 GPUVM page tableand CPU page tablesynchronization',
            ],
          },
          diagram: {
            title: 'SVM 统一virtualaddress spaceandpagemigration',
            content: `SVM 统一virtualaddress space: CPU and GPU sharedpointer

processvirtualaddress space (64-bit)
┌────────────────────────────────────────────────────────┐
│  0x0000'7f00'0000'0000   ← malloc allocationbuffer        │
│  0x0000'7f00'0001'0000   ← GPU kernel parameter          │
│  0x0000'7f00'0002'0000   ← computeresult                   │
│  ...                                                   │
│  CPU and GPU usesamevirtual addressaccessthesedata             │
└──────────┬────────────────────────────┬────────────────┘
           │                            │
     CPU MMU page table                 GPUVM page table
     (per-process)                (per-PASID)
           │                            │
           ▼                            ▼
┌──────────────────┐          ┌──────────────────┐
│  CPU physical memory     │          │  GPU VRAM        │
│  (DDR5 RAM)      │          │  (GDDR6 8GB)     │
│                  │          │                  │
│  Page A [热data] │ ──migration──→│  Page A (副本)   │
│  (migration      │          │  高bandwidth GPU access  │
│   entry mark)    │          │                  │
│                  │          │                  │
│  Page B          │←──回迁── │  Page B          │
│  (CPU accesstrigger)  │          │  (evicted)       │
└──────────────────┘          └──────────────────┘

pagemigrationprocess (svm_migrate_to_vram):
──────────────────────────────────────
  1. GPU 频繁access Page A → triggermigration决策
  2. VRAM allocationgoalpage
  3. SDMA engine: memcpy(vram_page, ram_page)
  4. update GPUVM page table: VA → VRAM physical address
  5. update CPU page table: install migration entry
     (CPU againaccess时trigger fault → svm_migrate_to_ram)

GPU Page Fault handle:
──────────────────────────────────────
  GPU accessvirtual address 0x7f0000010000
       │
       ▼ (GPUVM page table无mapping)
  GPU generate page fault interrupt
       │
       ▼
  KFD fault handler (kfd_svm_page_fault)
       │
       ├─ address属于alreadyregistration SVM range? 
       │   is → 建立 GPUVM mapping(maytriggermigration)
       │   否 → report GPU fault error
       │
       ▼
  recover GPU execute`,
            caption: 'SVM let CPU and GPU throughsamevirtual addressaccessdata. pagecaninsystem memoryand VRAM 之between按需migration — GPU 热dataautomatic迁入 VRAM 以获得高bandwidth, CPU access时automatic迁回. 这corresponding用program透明, 由 KFD andhardware page fault mechanismautomaticmanagement. ',
          },
          codeWalk: {
            title: 'svm_range_add — registration SVM virtual addressrange',
            file: 'drivers/gpu/drm/amd/amdkfd/kfd_svm.c',
            language: 'c',
            code: `/* kfd_svm.c — SVM rangemanagementcorefunction */

/* svm_range represent一段受 SVM managementvirtual address区between */
struct svm_range {
    struct interval_tree_node it_node; /* 区between树node, 按 VA 索引 */
    struct list_head list;             /* process SVM range linked list */
    uint64_t start;                    /* 起始page编号 (VA >> PAGE_SHIFT) */
    uint64_t last;                     /* endpage编号 */
    uint64_t npages;                   /* pagecount */
    uint32_t flags;                    /* accessflag */
    uint32_t preferred_loc;            /* 首选location: CPU or GPU_ID */
    uint32_t actual_loc;               /* currentactuallocation */
    uint32_t granularity;              /* migration粒度 */
    struct list_head deferred_list;    /* latencyupdatelist */
    struct mutex migrate_mutex;        /* migrationoperatemutex */
    atomic_t queue_refcount;           /* 引用此 range queue数 */
    /* ... 更多字段 */
};

/* registration一段virtual addressas SVM managementregion */
int svm_range_add(struct kfd_process *p,
                  uint64_t start, uint64_t size,
                  uint32_t nattr,
                  struct kfd_ioctl_svm_attribute *attrs)
{
    struct svm_range_list *svms = &p->svms;
    struct svm_range *prange;
    uint64_t last = start + size - 1;
    int r;

    /* 锁定 SVM range list */
    mutex_lock(&svms->lock);

    /* checkwhetherandalreadyhas SVM range 重叠
     * use interval_tree 高效lookup重叠区between
     */
    prange = svm_range_find(svms, start, last);
    if (prange) {
        /* alreadyhas range overwrite此region: updateproperty */
        r = svm_range_split_adjust(svms, prange,
                                   start, last, nattr, attrs);
        goto out;
    }

    /* allocation新 svm_range structure体 */
    prange = svm_range_new(svms, start, size, true);
    if (!prange) {
        r = -ENOMEM;
        goto out;
    }

    /* set SVM property(preferred_loc, flags 等)
     * preferred_loc 决定page首选存放location: 
     *   KFD_IOCTL_SVM_LOCATION_SYSMEM — system memory
     *   KFD_IOCTL_SVM_LOCATION_VRAM   — GPU VRAM
     */
    svm_range_set_attr(p, start, size, nattr, attrs);

    /* will新 range add区between树andlinked list */
    svm_range_add_to_svms(prange);
    svm_range_add_notifier_locked(svms, prange);

    r = 0;
out:
    mutex_unlock(&svms->lock);
    return r;
}`,
            annotations: [
              'svm_range is SVM coredata structure, each实例代表一段受managementvirtual address区between',
              'interval_tree allow高效lookupand给定addressrange重叠 SVM range(O(log n) complex度)',
              'preferred_loc 指示page应优先放in CPU stillis GPU memory — impactmigrationstrategy',
              'actual_loc recordpagecurrentactuallocation, and preferred_loc different时maytriggermigration',
              'migrate_mutex protectmigrationoperate — 同一时between只allowamigrationoperate进行',
              'svm_range_add_notifier_locked registration MMU notifier, when CPU page table变化时notify KFD update GPUVM',
            ],
            explanation: 'svm_range_add is ROCm run时向 KFD registration SVM managementregionentry point. whenuser spacecall hsaKmtSetMemoryPolicy or hipMallocManaged 时, finalwillthrough ioctl call此function. 它in KFD increatea svm_range structure体跟踪thisvirtual address, after续when GPU access此range内address时, KFD  page fault handler canlookuptocorresponding svm_range 并按需建立mappingortriggermigration. 这is SVM "按需allocation, 按需migration" mechanism起点. ',
          },
          miniLab: {
            title: 'observe SVM pagemigrationand GPU page fault',
            objective: 'through ftrace and sysfs observe KFD  SVM pagemigration行as, understand按需migrationworkapproach. ',
            setup: `# need root permissionuse ftrace
# needinstall ROCm andause managed memory  HIP program
sudo su`,
            steps: [
              'enable KFD SVM related ftrace 跟踪点: echo 1 > /sys/kernel/debug/tracing/events/amdgpu/svm_migrate_start/enable',
              'meanwhileenable GPU fault event: echo 1 > /sys/kernel/debug/tracing/events/amdgpu/amdgpu_vm_bo_cs/enable',
              'runause hipMallocManaged  HIP program',
              'view ftrace log: cat /sys/kernel/debug/tracing/trace | grep svm',
              'observemigrationstatistics: cat /sys/class/drm/card0/device/kfd/proc/*/svm_stats(ifavailable)',
              'cleanup ftrace: echo 0 > /sys/kernel/debug/tracing/events/amdgpu/svm_migrate_start/enable',
            ],
            expectedOutput: `$ cat /sys/kernel/debug/tracing/trace | grep svm
vectorAdd-12345 [003]  svm_migrate_start: pid=12345
  src=RAM dst=VRAM start=0x7f0000010000 npages=64
vectorAdd-12345 [003]  svm_migrate_end: pid=12345
  src=RAM dst=VRAM migrated=64 failed=0

indicate: 64 个page(256KB)from RAM migrationto VRAM
这发生in GPU kernel 首次access managed memory 时`,
            hint: 'if ftrace event点notexist, mayiskernelversion较旧. can改用 dmesg observe: echo 0x40 > /sys/module/amdgpu/parameters/debug_mask enable KFD debugginglog. ',
          },
          debugExercise: {
            title: 'diagnose GPU page fault cause kernel crash',
            language: 'c',
            description: 'a HIP programin GPU kernel execute时crash, dmesg display GPU VM fault. analyzeerrorinformation并确定根本cause. ',
            question: 'GPU VM fault 根本causeiswhat? howin HIP codeinavoid这类issue? ',
            buggyCode: `/* dmesg output */
[  89.3] amdgpu 0000:03:00.0: [gfxhub0]
  GPU fault detected: src_id:0, ring:0, vmid:3, pasid:32769
[  89.3] amdgpu 0000:03:00.0:
  VM_L2_PROTECTION_FAULT_STATUS: 0x00301050
[  89.3] amdgpu 0000:03:00.0:
  addr: 0x00007f0000DEAD00  ← byaccessvirtual address
  status: read, protection fault
  client: TCP (Texture Cache Per Pipe)
[  89.3] kfd: Process 12345 GPU fault on gpu 1002:7480

/* correspondinghasissue HIP code */
__global__ void kernel(int *data, int n) {
    int idx = blockIdx.x * blockDim.x + threadIdx.x;
    /* BUG: nocheck idx < n access data[idx] */
    data[idx] = data[idx] * 2;  /* out of boundsaccess! */
}

int main() {
    int *d_data;
    int n = 1024;
    hipMalloc(&d_data, n * sizeof(int));
    /* startup过多thread: 2048 > 1024 */
    kernel<<<4, 512>>>(d_data, n);
    hipDeviceSynchronize();
}`,
            hint: 'note addr in 0xDEAD00 pattern, andthreadcount(4 * 512 = 2048)anddatasize(1024 个 int)notmatch. ',
            answer: '根本cause: GPU kernel out of boundsmemoryaccess. programallocation 1024 个 int(4KB), 但startup 4 * 512 = 2048 个thread, thread 1024-2047 access data[1024]-data[2047], 超出allocationmemoryrange. GPU  GPUVM intheseout of boundsaddressonnovalidmapping, cause VM_L2_PROTECTION_FAULT. dmesg inkeyinformation: (1)pasid:32769 identifier出错process; (2)addr: 0x7f0000DEAD00 isout of boundsaccessvirtual address(0xDEAD pattern表明这mayisnot yetinitializationoralreadyreleasememoryregion); (3)client: TCP representis Texture Cache 发起读operate(compute shader memoryreadalsothrough TCP); (4)protection fault representpage tableinno此addressmapping. fixmethod: in kernel inaddboundarycheck if (idx < n), or调整 grid sizematchdata量: kernel<<<(n+255)/256, 256>>>(d_data, n). 这is GPU programmingin最common bug type之一. ',
          },
          interviewQ: {
            question: 'explain KFD  SVM(Shared Virtual Memory)ishowimplementation. include GPUVM page table, PASID, GPU page fault andpagemigrationworkmechanism. ',
            difficulty: 'hard',
            hint: 'fromdata structure(svm_range)→ hardwaremechanism(GPUVM, PASID, page fault)→ migrationprocess(svm_migrate_to_vram/ram)→ coherence保证(MMU notifier)orderanswer. ',
            answer: 'KFD SVM implementation: (1)data structure: 每段受 SVM managementvirtual address区between用 svm_range represent, storagein interval tree in以高效lookup. svm_range recordaddressrange, 首选location(CPU/GPU), actuallocationandmigrationstate. (2)GPUVM page table: eachprocess GPU hasindependentpage table(similar CPU  4 级page table), willvirtual addressmappingto VRAM orsystem memoryphysical address. PASID isprocessaddress spaceidentifier, GPU accessmemory时携带 PASID, hardware用它selectcorrectpage table. (3)GPU page fault: when GPU accessnot yetmappingvirtual address时, GPU generate page fault interrupt. KFD  kfd_svm_page_fault handler lookupcorresponding svm_range, ifpageinsystem memory且needmigrationto VRAM, trigger svm_migrate_to_vram(): in VRAM allocationpage → SDMA copydata → update GPU page table → in CPU page tableinstall migration entry. (4)反向migration: CPU accessalreadymigrationto VRAM page时, CPU page fault handler trigger svm_migrate_to_ram() willpage迁回. (5)coherence: KFD registration MMU notifier, when CPU 侧page table变化(如 munmap, mremap)时, KFD synchronizationupdateor invalidate corresponding GPUVM mapping, 保证 CPU and GPU 看to一致address space. entiremechanism对user space透明 — hipMallocManaged allocationmemoryautomaticinneed时migrationtocorrectlocation. ',
            amdContext: '这is AMD ROCm interviewinadvancedissue. demonstrate你understand SVM not只is"sharedaddress"那么simple, 背afteris GPUVM page table, PASID hardwaresupport, page fault handleand双向migrationcomplexsystem. 提to MMU notifier is加分项 — 它体现你understand CPU and GPU page tablesynchronizationkeymechanism. ',
          },
        },

        // ── Lesson 7.2.2 ──────────────────────────────────────
        {
          id: '7-2-2',
          number: '7.2.2',
          title: 'semaphoreandevent: CPU-GPU synchronization',
          titleEn: 'Signals & Events: CPU-GPU Synchronization',
          duration: 18,
          difficulty: 'advanced',
          tags: ['HSA-signal', 'KFD-event', 'doorbell', 'interrupt', 'polling', 'synchronization'],
          concept: {
            summary: 'CPU-GPU synchronizationis异构computeincorechallenge. KFD provide两种mechanism: HSA semaphore(64 位atomiccount器, support GPU directlyupdate)and KFD event(interruptdriverwakeupmechanism). semaphoreused for GPU-GPU and CPU-GPU 之between细粒度synchronization, eventused for CPU wait GPU complete高效block. ',
            explanation: [
              'HSA semaphore(HSA Signal)isa 64 位atomic值, storagein CPU and GPU allcanaccessmemorylocation. GPU canthroughatomic operationupdatesemaphore值(for examplecompletea kernel afterwill其递减as 0), CPU canpollingorwaitsemaphore达tospecific值. semaphore本质isasharedatomiccount器, 但它特殊之处in于: 它关联a KFD event, whensemaphore值满足condition时, cantriggerinterruptwakeupwait CPU thread, 而is not浪费 CPU 周期polling. ',
              'in AQL 包in, each kernel dispatch containa completion_signal 字段. when GPU complete此 dispatch after, 它will对 completion_signal 指向 64 位值executeatomic递减operate. if递减after值等于 0, GPU stillwill向 CPU sendainterrupt(throughwrite IH Ring). KFD interrupt handlingprogram收tointerruptafter, lookupcorresponding KFD event, wakeupwaitin该eventon CPU thread. 这is hipDeviceSynchronize() or hipStreamSynchronize() 底layerimplementation. ',
              'KFD event(KFD Event)iskernel侧synchronization原语. user spacethrough AMDKFD_IOC_CREATE_EVENT ioctl createevent, through AMDKFD_IOC_WAIT_EVENTS waiteventtrigger. eventhas多种type: SIGNAL event(and HSA semaphore关联, GPU completeoperateaftertrigger), HW_EXCEPTION(GPU hardware异常, 如 page fault), DEBUG(debuggingevent). kfd_wait_on_event functionimplementationwaitlogic: willcurrentthreadaddwait queue, settimeout, wheneventbytrigger时wakeupthread. ',
              'synchronizationpatternhas两种select: polling(polling)andinterrupt(interrupt). pollingpatternbelow, CPU 持续readsemaphore值直to满足condition — latency最低(~100ns level), 但浪费 CPU 周期. interruptpatternbelow, CPU thread休眠, GPU completeafterthroughinterruptwakeup — not浪费 CPU, 但interrupt handlinghas额outsidelatency(~1-10μs). ROCm run时usually采用blendingstrategy: 先polling一小段时between(~1000 次循环), ifsemaphore仍not yetready, 切换tointerruptwait. 这in短 kernel(微秒级complete)时获得polling低latency, in长 kernel(毫秒级above)时avoid浪费 CPU. ',
              'Doorbell insynchronizationmechanisminalso扮演important角色. 除used fornotify GPU has新 AQL 包(queue doorbell), doorbell stillused for HSA semaphore快速path — user spacecanthrough写 doorbell trigger GPU checksemaphore值. 这种 doorbell-based signaling mechanismletsemaphoreoperatelatency降to最低. KFD aseachprocessallocation doorbell page, user spacethrough mmap /dev/kfd 获得 doorbell virtual address. ',
            ],
            keyPoints: [
              'HSA Signal is 64 位atomiccount器, GPU throughatomic operationupdate, CPU pollingorinterruptwait',
              'AQL 包 completion_signal 字段 — GPU complete dispatch after递减, 值as 0 时triggerinterrupt',
              'KFD Event iskernelsynchronization原语 — SIGNAL, HW_EXCEPTION, DEBUG 等type',
              'kfd_wait_on_event implementationblockwait: thread休眠 → GPU interrupt → kfd_signal_event_handler wakeup',
              'blendingsynchronizationstrategy: 先polling(低latency)→ timeoutafter切换tointerruptwait(节省 CPU)',
              'doorbell used forqueuenotifyandsemaphore快速path — 单次 4 bytes MMIO write',
            ],
          },
          diagram: {
            title: 'CPU-GPU synchronization: semaphoreandeventmechanism',
            content: `CPU-GPU synchronization三条path

path 1: pollingpattern (最低latency, 消耗 CPU)
══════════════════════════════════════════════
  CPU                                GPU
  ────                               ────
  dispatch kernel (write AQL + doorbell)
                                     ──→ execute kernel
  while (*signal != 0)               ...
    pause();         ← CPU busy wait       ...
                                     complete
                                     atomic_dec(signal)
  *signal == 0  ✓                    ──→ signal = 0
  latency: ~100ns (最快)

path 2: interruptpattern (节省 CPU, haslatency)
══════════════════════════════════════════════
  CPU                                GPU
  ────                               ────
  dispatch kernel
  kfd_wait_on_event()                ──→ execute kernel
    │                                ...
    ▼                                ...
  thread_sleep()    ← CPU 休眠       ...
    zzz...                           complete
                                     atomic_dec(signal)
                                     if signal == 0:
  ┌────────────────────────────────    write IH Ring ←─┐
  │                                   (interrupt)           │
  ▼                                                    │
  IH Ring handle                                         │
  kfd_signal_event_handler()                           │
    │                                                  │
    ├─ lookupevent: event_id → kfd_event                  │
    ├─ set event->signaled = true                     │
    └─ wake_up(&event->wq)  ← wakeupwaitthread            │
                                                       │
  thread bywakeup ✓                                      │
  latency: ~1-10μs                                        │
                                                       │
path 3: blendingpattern (ROCm default)                           │
══════════════════════════════════════════════          │
  CPU                                                  │
  ────                                                 │
  for (i = 0; i < 1000; i++)    ← 先polling              │
    if (*signal == 0) goto done;                       │
  kfd_wait_on_event()           ← theninterruptwait         │
                                                       │
                                                       │
IH Ring (Interrupt Handler Ring):                      │
┌────────────────────────────────────────┐             │
│  GPU generateinterrupteventring buffer          │             │
│  ┌──────┬──────┬──────┬──────┐         │             │
│  │ src  │ src  │ src  │      │         │             │
│  │ =146 │ =146 │ =0   │      │         │             │
│  │signal│signal│fault │      │         │             │
│  │event1│event2│      │      │  ←──────┘
│  └──────┴──────┴──────┴──────┘
│  kfd_interrupt_isr() 逐个handle
└────────────────────────────────────────┘`,
            caption: 'CPU-GPU synchronization三种pattern. pollinglatency最低但浪费 CPU; interruptwait节省 CPU 但hasinterrupt handlinglatency; blendingpattern结合两者优点 — ROCm defaultuse. GPU through IH Ring(interrupt handlingring buffer)notify CPU semaphore变化. ',
          },
          codeWalk: {
            title: 'kfd_signal_event_handler — GPU interrupttriggereventwakeup',
            file: 'drivers/gpu/drm/amd/amdkfd/kfd_events.c',
            language: 'c',
            code: `/* kfd_events.c — KFD event信号handle */

/* when GPU completeoperate并generateinterrupt时call此function
 * 由 IH Ring handleprogram (kfd_interrupt_isr) 分发
 *
 * data: interrupt源information (signal event ID)
 */
void kfd_signal_event_handler(unsigned int client_id,
                              uint32_t event_id,
                              void *data)
{
    struct kfd_process *p;
    struct kfd_event *ev;

    /* through client_id (PASID) lookupcorrespondingprocess */
    p = kfd_lookup_process_by_pasid(client_id);
    if (!p)
        return;

    rcu_read_lock();

    /* inprocessevent表inlookupevent
     * event表is IDR (ID Radix tree), O(1) lookup
     */
    ev = idr_find(&p->event_idr, event_id);
    if (!ev) {
        rcu_read_unlock();
        kfd_unref_process(p);
        return;
    }

    spin_lock(&ev->lock);

    /* markeventasalreadytrigger */
    ev->signaled = true;
    ev->event_age++;

    /* wakeupallwaitin此eventonthread
     * kfd_wait_on_event() in wait_event_interruptible_timeout
     * willcheck ev->signaled 并return
     */
    wake_up_all(&ev->wq);

    spin_unlock(&ev->lock);
    rcu_read_unlock();
    kfd_unref_process(p);
}

/* CPU 侧waiteventcorefunction */
static int kfd_wait_on_event(struct kfd_process *p,
                             struct kfd_event *ev,
                             uint64_t timeout_ms)
{
    long timeout_jiffies;
    int ret;

    timeout_jiffies = msecs_to_jiffies(timeout_ms);

    /* wait直toeventbytriggerortimeout
     * wait_event_interruptible_timeout internal: 
     *   1. willcurrentthreadadd ev->wq wait queue
     *   2. setthreadstateas TASK_INTERRUPTIBLE
     *   3. call schedule() let出 CPU
     *   4. by wake_up_all wakeupaftercheckcondition
     */
    ret = wait_event_interruptible_timeout(
        ev->wq,
        ev->signaled,    /* wakeupcondition: eventalreadytrigger */
        timeout_jiffies);

    if (ret == 0)
        return -ETIME;   /* timeout */
    if (ret < 0)
        return ret;       /* by信号打断 */

    /* reseteventstate(one-shot 语义)*/
    spin_lock(&ev->lock);
    ev->signaled = false;
    spin_unlock(&ev->lock);

    return 0;
}`,
            annotations: [
              'kfd_signal_event_handler 由 IH Ring handleprogram分发call — when GPU write IH Ring representoperatecomplete时',
              'client_id is PASID — GPU ininterruptdatain携带 PASID identifieris哪个processevent',
              'idr_find is O(1)  ID lookup, event表用 IDR(ID Radix tree)implementation以support快速lookup',
              'wake_up_all wakeupallwaitthread — multiple CPU threadcanwait同aevent',
              'wait_event_interruptible_timeout iskernelstandardconditionwait原语 — thread休眠直tocondition满足',
              'one-shot 语义: eventtriggerafterreset signaled=false, below次waitneed新 GPU complete信号',
            ],
            explanation: 'GPU complete kernel executeafterinterrupt handling链: GPU willinterruptinformationwrite IH Ring → amdgpu  IH Ring handleprogramreadinterrupt → 识别出is KFD 信号event → call kfd_signal_event_handler → lookupprocessandevent → wakeupwaitthread. kfd_wait_on_event correspondinguser space hsaKmtWaitOnEvent or hipDeviceSynchronize 底layerimplementation. understandthisinterrupt-wakeuppathisunderstand CPU-GPU synchronizationlatencykey. ',
          },
          miniLab: {
            title: 'measure CPU-GPU synchronizationlatency',
            objective: 'writeasimple HIP programmeasurefrom GPU kernel completeto CPU bywakeuplatency, comparepollingandinterruptpattern. ',
            setup: `# need ROCm and HIP compiler
# ifno ROCm, canthrough ftrace observe kfd_signal_event_handler`,
            steps: [
              'write HIP program: startupa空 kernel, then用 hipEventElapsedTime measuresynchronizationlatency',
              'run 100 次取平均: record hipDeviceSynchronize 耗时',
              'use ftrace tracing kfd_signal_event_handler: echo kfd_signal_event_handler > /sys/kernel/debug/tracing/set_ftrace_filter',
              'enablefunction跟踪: echo function > /sys/kernel/debug/tracing/current_tracer',
              'run HIP programafterview trace: cat /sys/kernel/debug/tracing/trace | grep kfd_signal',
              'observeinterrupttowakeup时between差(timestamp 列)',
            ],
            expectedOutput: `# HIP synchronizationlatencymeasure
hipDeviceSynchronize average latency: ~5-15 μs (interruptpattern)

# ftrace output
$ cat /sys/kernel/debug/tracing/trace | grep kfd_signal
 amdgpu-12345  [002] 89.123456: kfd_signal_event_handler
               ← frominterrupt发生to handler execute ~2-5μs

compare hipStreamQuery (pollingpattern):
average latency: ~1-3 μs (更低latency但消耗 CPU)`,
            hint: 'ifunable toinstall ROCm, canthroughread kfd_events.c source codein wait_event_interruptible_timeout 用法understandsynchronizationmechanism. 关注 ev->signaled setandcheck时机. ',
          },
          debugExercise: {
            title: 'diagnose CPU-GPU synchronizationdeadlock',
            language: 'c',
            description: 'a多流 HIP programhang — hipDeviceSynchronize 永远notreturn. analyzebelowscenariofindcause. ',
            question: 'why hipDeviceSynchronize 永远notreturn? 这isdeadlock吗? howfix? ',
            buggyCode: `/* hasissue多流 HIP program */
hipStream_t stream1, stream2;
hipStreamCreate(&stream1);
hipStreamCreate(&stream2);

/* in stream1 onstartup kernel A */
kernelA<<<grid, block, 0, stream1>>>(data);

/* in CPU onwait stream1 complete(block!) */
hipStreamSynchronize(stream1);

/* BUG: kernelA internalinwait stream2 on kernelB complete
 * 但 kernelB stillnobystartup! 
 */

/* 这行code永远will notexecuteto */
kernelB<<<grid, block, 0, stream2>>>(data);
hipStreamSynchronize(stream2);

/* ----- dmesg output ----- */
/* [120.5] [drm:amdgpu_job_timedout] *ERROR*
 *   ring comp_1.0.0 timeout,
 *   signaled seq=100, emitted seq=101
 * [120.5] amdgpu: GPU reset begin!
 */`,
            hint: 'kernelA inwaita永远will nottrigger信号 — becausegenerate该信号 kernelB byblockin CPU 侧(CPU in hipStreamSynchronize inwait kernelA). ',
            answer: '这isa经典 CPU-GPU deadlockscenario: (1)CPU in hipStreamSynchronize(stream1) inwait kernelA complete; (2)kernelA in GPU onexecute时, internalthrough HSA semaphorewait stream2 on kernelB complete; (3)但 kernelB startupcodein CPU on, 位于 hipStreamSynchronize after — CPU byblockcause kernelB 永远will notbycommitto GPU. 形成ringwait: CPU 等 kernelA → kernelA 等 kernelB → kernelB need CPU commit. final GPU  amdgpu_job_timedout detecttotimeout, trigger GPU reset. fixmethod: (a)先commitall kernel to各自 stream, thenagainsynchronization: kernelA<<<...stream1>>>; kernelB<<<...stream2>>>; hipStreamSynchronize(stream1); hipStreamSynchronize(stream2);(b)use hipStreamWaitEvent implementation GPU 侧 stream betweendependency, 而is not CPU 侧synchronization; (c)avoidin GPU kernel internalwaitother stream 信号 — 这种pattern容易causedeadlock. ',
          },
          interviewQ: {
            question: 'describe KFD in CPU-GPU synchronizationcompletepath: from GPU completea kernel to CPU threadbywakeup. include HSA semaphore, IH Ring, KFD eventmechanismandwakeupprocess. ',
            difficulty: 'hard',
            hint: '按照event链: GPU atomic写 signal → GPU 写 IH Ring → CPU interrupt → IH handler → kfd_signal_event_handler → wake_up_all → userthreadreturn. ',
            answer: 'completesynchronizationpath: (1)GPU  Shader Engine execute完 kernel finallya workgroup; (2)GPU  CP 对 AQL 包in completion_signal addressexecute atomic_dec operate(64 位atomic递减), willsemaphorefrom 1 递减as 0; (3)if递减after值as 0 且该semaphore关联interruptevent, GPU 向 IH Ring(Interrupt Handler Ring)write一条interrupt条目, contain source_id(146 = signal completion), PASID(processidentifier)and event_id; (4)amdgpu  IH Ring handleprogram(amdgpu_irq_handler)in IRQ contextinread IH Ring, 识别出这is KFD 信号event, call kfd_interrupt_isr willeventadd KFD interruptwork queue; (5)KFD interruptworker threadcall kfd_signal_event_handler, through PASID findprocess kfd_process, through event_id in IDR infind kfd_event; (6)set ev->signaled = true, call wake_up_all(&ev->wq) wakeupwait queueonallthread; (7)userthreadfrom wait_event_interruptible_timeout return, kfd_wait_on_event return 0 representsuccess; (8)user space hipDeviceSynchronize return. entirepathlatency约 5-15μs, main开销ininterrupt handlingandthreadscheduling. comparepollingpattern: CPU directlyreadsemaphorememorylocation, latency ~100ns-1μs, 但占用 CPU core. ROCm defaultuseblendingstrategy — 先短暂polling, then切换tointerruptwait. ',
            amdContext: 'candetaileddescribe这条interrupt-wakeuppathindicate你深入understand KFD implementationdetail. AMD interviewin提to IH Ring, PASID lookupand wake_up_all thesespecificmechanismwilldemonstrate你not仅understand概念, stillread过actualcode. 额outside加分项: 提to ROCm blendingpolling/interruptstrategy体现工程实践意识. ',
          },
        },
      ],
    },
  ],
  completionChecklist: [
    'understand HSA architecturecore理念 — CPU/GPU 作as平等compute代理sharedvirtualaddress space',
    'canexplain KFD and DRM interfacedifference(commandformat, queue模型, memory模型)',
    'understand AQL 包 64 bytesstructureanduser-spacequeue零kernelcommitpath',
    'candescribe MQD/HQD mappingmechanismand doorbell driverqueuenotify',
    'understand SVM implementation: GPUVM page table, PASID, GPU page fault, pagemigration',
    'canexplain svm_range data structureand svm_migrate_to_vram/ram migrationprocess',
    'understand HSA semaphore(64 位atomiccount器)and KFD event(interruptdriverwakeup)workmechanism',
    'candescribefrom GPU kernel completeto CPU threadwakeupcompleteinterruptpath',
  ],
};
