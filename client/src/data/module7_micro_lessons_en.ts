// ============================================================
// AMD Linux Driver Learning Platform - Module 7 Micro-Lessons (English)
// Module 7: ROCm Kernel Interface
// 4 lessons in 2 groups, ~15-20 min each, total ~70 min
// ============================================================
import type { MicroLessonModule } from './micro_lesson_types';

export const module7MicroLessonsEn: MicroLessonModule = {
  moduleId: 'rocm-kernel',
  groups: [
    // ════════════════════════════════════════════════════════════
    // Group 7.1: HSA Architecture and KFD Basics
    // ════════════════════════════════════════════════════════════
    {
      id: '7-1',
      number: '7.1',
      title: 'HSA Architecture and KFD Basics',
      titleEn: 'HSA Architecture & KFD Basics',
      icon: 'Zap',
      description: 'Understand the HSA heterogeneous computing standard, the role of KFD in amdgpu, how the /dev/kfd device node operates, and the core differences between KFD and traditional DRM interfaces.',
      lessons: [
        // ── Lesson 7.1.1 ──────────────────────────────────────
        {
          id: '7-1-1',
          number: '7.1.1',
          title: 'HSA Architecture and KFD Overview',
          titleEn: 'HSA Architecture & KFD Overview',
          duration: 18,
          difficulty: 'advanced',
          tags: ['HSA', 'KFD', 'ROCm', '/dev/kfd', 'kfd_process', 'chardev'],
          concept: {
            summary: 'HSA (Heterogeneous System Architecture) is a heterogeneous computing standard that defines how CPUs and GPUs share memory and collaborate for execution. KFD (Kernel Fusion Driver) is a submodule in the amdgpu driver that implements the HSA kernel interface. It exposes computing capabilities through the /dev/kfd device node and complements the traditional DRM rendering interface /dev/dri/renderD128.',
            explanation: [
              'HSA was formulated by the HSA Foundation (AMD is a founding member). Its core concept is that the CPU and GPU are no longer a "master-slave relationship" but equal computing agents. In the HSA model, the CPU and GPU share the same virtual address space (Shared Virtual Memory), and the GPU can directly access the CPU\'s memory pages, and vice versa. This eliminates the need for explicit cudaMemcpy in traditional GPGPU programming - data does not need to be manually copied between CPU and GPU.',
              'KFD is the implementation of HSA in the Linux kernel, and the code is located in the drivers/gpu/drm/amd/amdkfd/ directory. It is not an independent driver, but a submodule of the amdgpu driver. KFD exposes HSA functionality to user space through the /dev/kfd character device node. The ROCm runtime (libhsa-runtime64.so) calls KFD through ioctl to create calculation queues, allocate GPU memory, manage semaphores, etc.',
              'It is important to understand the difference between KFD and DRM interfaces. The DRM interface (/dev/dri/card0, renderD128) is for graphics rendering and general GPU access - Mesa radeonsi/radv submits rendering commands through it. The KFD interface (/dev/kfd) is specifically for HSA calculations - ROCm/HIP submits calculation tasks through it. The two share the underlying hardware access layer of the amdgpu driver in the kernel, but use different command formats (DRM uses PM4, KFD uses AQL), ​​different queue types (DRM uses GFX Ring, KFD uses Compute Queue), and different memory models (DRM uses GEM/TTM, KFD additionally supports SVM).',
              'KFD\'s life cycle management revolves around the kfd_process structure. When a userspace process first accesses /dev/kfd via an ioctl, KFD creates a kfd_process instance for the process, which contains the process\'s GPU resources (queues, memory maps, events). This structure runs throughout the entire KFD subsystem and is the core data structure for understanding KFD code. kfd_process holds the kfd_process_device list of the process on all GPUs - each GPU corresponds to a kfd_process_device, which records the doorbell mapping, queue list and address space ID (PASID) of the process on this GPU.',
            ],
            keyPoints: [
              'HSA defines CPU/GPU as equal computing agents, sharing virtual address space and eliminating explicit data copying.',
              'The KFD code is located in drivers/gpu/drm/amd/amdkfd/ and is a submodule of amdgpu rather than an independent driver.',
              '/dev/kfd is for HSA calculations (ROCm/HIP), /dev/dri/renderD128 is for graphics rendering (Mesa)',
              'KFD uses AQL command package + Compute Queue; DRM uses PM4 command package + GFX Ring',
              'kfd_process is the core data structure of KFD, which manages the computing resources of a process on all GPUs.',
              'kfd_process_device associates a process with a specific GPU, holding PASID, doorbell mapping and queue list',
            ],
          },
          diagram: {
            title: 'KFD and DRM dual path architecture',
            content: `amdgpu driven dual interface architecture: DRM (graphics) vs KFD (computing)

user space
─────────────────────────────────────────────────────────────
graphics path calculation path
  ────────                              ────────
Games / Blender HIP Program / PyTorch
       │                                     │
       ▼                                     ▼
  Mesa radeonsi/radv                    ROCm Runtime
  (OpenGL / Vulkan)                     libhsa-runtime64.so
       │                                     │
       ▼                                     ▼
libdrm (amdgpu) direct ioctl
       │                                     │
       ▼                                     ▼
  /dev/dri/renderD128                   /dev/kfd
  (DRM render node)                     (HSA device node)
       │                                     │
═══════╪═════ system call boundary ══════════════════╪═══════════════
       │                                     │
Kernel space │ │
       ▼                                     ▼
DRM ioctl distribution KFD ioctl distribution
  drm_ioctl()                           kfd_ioctl()
       │                                     │
       ▼                                     ▼
  amdgpu_cs_ioctl()                     kfd_ioctl_create_queue()
├─ PM4 command package verification ├─ AQL queue creation
├─ GFX Ring submission ├─ Compute Queue mapping
└─ fence synchronization └─ doorbell allocation
       │                                     │
       └──────────┬──────────────────────────┘
                  │
                  ▼
amdgpu hardware abstraction layer
├─ MMIO register access
├─ VRAM Management (TTM)
├─ Interrupt processing (IH Ring)
└─ Firmware Interface (PSP/SMU)
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
            caption: 'The amdgpu driver provides kernel interfaces for both graphics rendering and GPU computing. The two paths enter the kernel through /dev/dri/renderD128 and /dev/kfd in user space respectively, and share the hardware access layer at the bottom. Compute Queue can be scheduled directly by the GPU independently of the GFX Ring.',
          },
          codeWalk: {
            title: 'kfd_open — The process opens the entry to /dev/kfd for the first time',
            file: 'drivers/gpu/drm/amd/amdkfd/kfd_chardev.c',
            language: 'c',
            code: `/*kfd_chardev.c — File operation implementation of /dev/kfd */

static const struct file_operations kfd_fops = {
    .owner   = THIS_MODULE,
    .unlocked_ioctl = kfd_ioctl,  /*Entrance to all KFD ioctls*/
    .compat_ioctl   = compat_ptr_ioctl,
    .open    = kfd_open,           /*Process opens /dev/kfd*/
    .release = kfd_release,        /*Process shutdown /dev/kfd*/
    .mmap    = kfd_mmap,           /* mmap doorbell / events */
};

static int kfd_open(struct inode *inode, struct file *filep)
{
    struct kfd_process *process;
    bool is_32bit_user_mode;

    /*Check if the current process is 32-bit - KFD does not support 32-bit processes */
    is_32bit_user_mode = in_compat_syscall();
    if (is_32bit_user_mode) {
        dev_warn(kfd_device,
            "Process %d (32-bit) rejected\\n", current->pid);
        return -EPERM;
    }

    /*Core: Get or create kfd_process of the current process
     *If the process has already opened /dev/kfd, return the existing kfd_process
     *Otherwise create a new kfd_process and initialize it:
     *- Assign PASID (Process Address Space ID)
     *- Create kfd_process_device for each GPU
     *- Register MMU notifier (monitor process page table changes)
     */
    process = kfd_create_process(current);
    if (IS_ERR(process))
        return PTR_ERR(process);

    /*Save kfd_process to private_data of file
     *All subsequent ioctl calls obtain the process context through it
     */
    if (kfd_is_locked()) {
        kfd_unref_process(process);
        return -EAGAIN;
    }

    /*kfd_process reference count +1 */
    filep->private_data = process;

    dev_dbg(kfd_device, "Opened /dev/kfd for pid %d\\n",
            process->lead_thread->pid);
    return 0;
}`,
            annotations: [
              'kfd_fops is the file operation table of the /dev/kfd device node, kfd_ioctl handles all HSA ioctl requests',
              'KFD does not support 32-bit processes - HSA requires 64-bit virtual address space for CPU-GPU unified addressing',
              'kfd_create_process() is the core function: assign PASID, create kfd_process_device, register MMU notifier',
              'PASID is the process address space ID. The GPU uses it to distinguish the page tables of different processes and achieve process isolation.',
              'MMU notifier allows KFD to sense process page table changes (such as munmap) and update the GPU page table in a timely manner to maintain consistency.',
              'filep->private_data saves the kfd_process pointer, and subsequent ioctl uses it to find the GPU resources of the process.',
            ],
            explanation: 'This code is the first step for the userspace ROCm runtime to access GPU computing power. When libhsa-runtime64.so calls open("/dev/kfd", ...), the kernel executes kfd_open, creating a complete HSA execution environment for the process. kfd_create_process internally traverses all KFD devices (GPUs) in the system and creates a kfd_process_device for each GPU, which means that a ROCm process can access all registered GPUs from the beginning. Understanding this entry point is the starting point for reading all KFD code.',
          },
          miniLab: {
            title: 'Explore the /dev/kfd device node and KFD source code structure',
            objective: 'Check the KFD device nodes and kernel module parameters on the system, and understand the KFD source code directory structure.',
            steps: [
              'Check if /dev/kfd exists: ls -la /dev/kfd (requires amdgpu kernel module and ROCm support)',
              'View KFD initialization information in dmesg: dmesg | grep -i "kfd\\|hsa"',
              'If ROCm is installed: Run /opt/rocm/bin/rocminfo to view the HSA Agent list',
              'Statistics KFD source code size: find drivers/gpu/drm/amd/amdkfd/ -name "*.c" -o -name "*.h" | xargs wc -l | tail -1',
              'Check the KFD ioctl definition: grep -n "AMDKFD_IOC_" include/uapi/linux/kfd_ioctl.h | head -20',
              'Check if KFD is enabled in the kernel: zgrep HSA_AMD /proc/config.gz or grep HSA_AMD /boot/config-$(uname -r)',
            ],
            expectedOutput: `$ ls -la /dev/kfd
crw-rw---- 1 root render 234, 0  /dev/kfd   ←major 234 character device

$ dmesg | grep -i kfd
[  2.65] kfd kfd: Initialized module
[  2.66] kfd kfd: added device 1002:7480   ←Your Navi33

$ rocminfo | grep -A2 "Agent"
Agent 1: CPU (gfx000)
Agent 2: GPU (gfx1102)          ←Your GPU as HSA Agent

$ grep HSA_AMD /boot/config-$(uname -r)
CONFIG_HSA_AMD=y                ←KFD is compiled into the kernel`,
            hint: 'If /dev/kfd does not exist, check whether CONFIG_HSA_AMD is enabled in the kernel configuration. Most modern distributions enable this option by default if using a distribution kernel. ROCm installation is not required - /dev/kfd is created by the kernel amdgpu module.',
          },
          debugExercise: {
            title: 'Diagnosing KFD device open failure',
            language: 'c',
            description: 'A ROCm application returns an error when calling open("/dev/kfd", O_RDWR). Below is the relevant strace output and dmesg log. Find out why it failed.',
            question: 'Why can\'t the process open /dev/kfd? Give the root cause and solution.',
            buggyCode: `/*strace output */
openat(AT_FDCWD, "/dev/kfd", O_RDWR) = -1 EACCES (Permission denied)

/*dmesg log */
[  2.65] kfd kfd: Initialized module
[  2.66] kfd kfd: added device 1002:7480

/*Device node permissions */
$ ls -la /dev/kfd
crw-rw---- 1 root render 234, 0 /dev/kfd

/*Current user's group */
$ groups
myuser adm sudo audio

/*Another possible failure scenario */
$ /opt/rocm/bin/rocminfo
HSA_STATUS_ERROR_OUT_OF_RESOURCES: PASID allocation failed`,
            hint: 'First scenario: Check if the user belongs to the render group. Second scenario: PASID allocation failure is usually related to IOMMU configuration.',
            answer: 'Scenario 1 (EACCES): The permissions of /dev/kfd are controlled by device-node group ownership. In practice, ROCm documentation commonly expects the user to be in the render and video groups, and on many systems /dev/kfd is owned by root:render. If the current user lacks the required group membership, opening /dev/kfd fails with EACCES. Solution: add the user to the relevant groups for the distribution, typically sudo usermod -aG render,video myuser, then log in again. Scenario 2 (PASID allocation failure): PASID (Process Address Space ID) is managed through the IOMMU path used by KFD. If the platform or kernel boot configuration does not provide the required IOMMU support, KFD may fail to assign a PASID. Solution: verify the ROCm prerequisites for the target platform, confirm IOMMU support is enabled, and then reboot with the required kernel parameters for that system. The exact parameter set is platform-specific, so it is better to follow the current ROCm installation guidance than hard-code one universal boot line.',
          },
          interviewQ: {
            question: 'Explain the role of KFD in amdgpu driver. How does it differ from traditional DRM rendering interfaces? Why do we need two separate interfaces?',
            difficulty: 'medium',
            hint: 'Comparison from four dimensions: design goals (graphics vs computing), command format (PM4 vs AQL), ​​queue model (kernel scheduling vs user mode scheduling) and memory model (GEM/TTM vs SVM).',
            answer: 'KFD (Kernel Fusion Driver) is a submodule in the amdgpu driver that implements the HSA computing interface. It exposes GPU computing capabilities to the ROCm runtime through /dev/kfd. The core differences between it and the DRM rendering interface: (1) Design goals: DRM is oriented to graphics rendering (Mesa\'s OpenGL/Vulkan), KFD is oriented to general computing (ROCm\'s HIP/OpenCL); (2) Command format: DRM uses the PM4 command package (GPU command processor native format), KFD uses the AQL (Architected Queuing Language) package (platform-independent format defined by the HSA standard); (3) Queue model: DRM Command submission needs to be verified by the kernel (amdgpu_cs_ioctl). KFD allows user space to directly write to the queue and notify the GPU through doorbell, bypassing the kernel hot path (reducing latency); (4) Memory model: DRM uses GEM/TTM to explicitly manage GPU memory. KFD also additionally supports SVM (Shared Virtual Memory), and the CPU and GPU share the same virtual address space. The reason for needing two interfaces is that compute workloads have different performance requirements - GPU compute requires extremely low-latency queue submissions and unified memory access, which are not a priority in traditional graphics APIs.',
            amdContext: 'This is a classic AMD ROCm team interview question. The key is to show that you understand that KFD is not a replacement for DRM, but a dedicated interface for computing scenarios, and the two share amdgpu\'s hardware abstraction layer under the hood.',
          },
        },

        // ── Lesson 7.1.2 ──────────────────────────────────────
        {
          id: '7-1-2',
          number: '7.1.2',
          title: 'KFD queue management and AQL command package',
          titleEn: 'KFD Queue Management & AQL Packets',
          duration: 20,
          difficulty: 'advanced',
          tags: ['AQL', 'compute-queue', 'HQD', 'MQD', 'doorbell', 'user-mode-queue'],
          concept: {
            summary: 'Computation queues are the core abstraction of KFD. Unlike the graphics ring buffer, KFD\'s compute queue allows user space to write AQL command packets directly and notify GPU execution through the doorbell register, without the need for the kernel to participate in the hot path. HQD (Hardware Queue Descriptor) and MQD (Memory Queue Descriptor) are key data structures that map software queues to GPU hardware.',
            explanation: [
              'In the traditional graphics rendering path, each command submission goes through the kernel (ioctl → amdgpu_cs_ioctl → verify → write ring buffer), which introduces system call overhead. For high-throughput GPU computing scenarios (such as thousands of kernel launches per second in AI training), this overhead is unacceptable. KFD\'s solution is User-Mode Queue: the memory of the queue is directly mapped to user space. User space can directly write the AQL package, and then write the doorbell register to notify the GPU. The whole process does not require system calls.',
              'AQL (Architected Queuing Language) is the command packet format defined by the HSA standard. Each AQL package is a fixed 64 bytes, including: type (Kernel Dispatch, Barrier, Agent Dispatch), dimension information (grid_size_x/y/z, workgroup_size_x/y/z), kernel code entry address (kernel_object), kernel parameter address (kernarg_address), completion signal (completion_signal). The key difference from the PM4 format is that AQL is HSA standardized and portable across platforms; PM4 is proprietary to AMD GPU hardware and may have higher performance but is not portable.',
              'HQD (Hardware Queue Descriptor) is a fixed number of queue slots in GPU hardware. Each HQD corresponds to a queue that can be directly scheduled by the hardware. Each Compute Engine of Navi33 has multiple HQDs, and the total number is limited. MQD (Memory Queue Descriptor) is a queue description data structure created by KFD in memory, including all status of the queue: base address, size, read and write pointers, doorbell offset, etc. When the queue is mapped to HQD, the GPU\'s CP (Command Processor) loads the queue parameters from MQD; when the queue is preempted, CP saves the current state back to MQD. This MQD-HQD mapping mechanism allows the number of software queues to far exceed the number of hardware HQDs - dynamically mapped via a queue scheduler (HWS, Hardware Scheduler or SWS, Software Scheduler).',
              'The complete process of user mode queue submission: (1) User space writes the AQL package in the queue memory; (2) Updates the queue\'s write_dispatch_id (write pointer); (3) Writes the doorbell register - this is a memory-mapped MMIO address. A 4-byte write can notify the GPU\'s CP that there is a new command; (4) The GPU\'s CP detects the doorbell write, obtains the read pointer from the MQD of the corresponding queue, and reads the AQL package; (5) CP parses the AQL package and starts the calculation shader (dispatch); (6) After the calculation is completed, the GPU updates the completion signal (completion_signal). The entire hot path—from writing the AQL package to the start of execution on the GPU—requires only a userspace memory write and a doorbell MMIO write, with microsecond latency.',
            ],
            keyPoints: [
              'User mode queue allows direct writing of AQL packages + doorbell MMIO, bypassing the kernel hot path, and the delay is at the microsecond level',
              'AQL package is fixed at 64 bytes, including dispatch dimension, kernel_object address, kernarg address and completion_signal',
              'HQD is the GPU hardware queue slot (limited number), MQD is the queue descriptor in memory (can be many)',
              'MQD ↔ HQD dynamic mapping is managed by HWS (Hardware Scheduler) or KFD software scheduler',
              'Doorbell is a 4-byte MMIO write. After the GPU CP detects it, it reads the new command from the corresponding queue.',
              'Queue preemption: CP saves the current state back to MQD and releases HQD for use by other queues',
            ],
          },
          diagram: {
            title: 'AQL user mode queue submission process',
            content: `User mode AQL queue submission path (zero kernel intervention)

User space (ROCm Runtime)
─────────────────────────────────────────────────────────
1) Write AQL package to queue memory
  ┌──────────────────────────────────────────────┐
  │  AQL Queue (mmap'd to userspace)             │
  │  ┌────────┬────────┬────────┬────────┐       │
│ │AQL pkt │AQL pkt │AQL pkt │ (empty) │ │
  │  │dispatch│dispatch│barrier │        │       │
  │  │grid:   │grid:   │signal  │        │       │
  │  │256x1x1 │1024x1  │wait    │        │       │
  │  └────────┴────────┴────────┴────────┘       │
  │   read_ptr ──────────────▲  ▲── write_ptr    │
  └──────────────────────────┼──┼────────────────┘
                             │  │
2) Update write_dispatch_id │ │
3) Write doorbell register ─────┼──┘
     *(uint32_t*)doorbell_mmap = new_wptr;
                             │
═══════════════ No system call ══╪════════════════════════
                             │
GPU Hardware │
─────────────────────────────┼───────────────────────
4) Command Processor detects doorbell writing
     ┌───────────────────────┐
     │    CP (MEC/HPD)       │
│ Detect doorbell │──→ Read MQD
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
5) Read AQL package from queue memory │
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
6) Start Compute Shader
Shader Engines execute kernel
Update completion_signal after completion`,
            caption: 'Submission process of user mode AQL queue. The entire hot path involves no system calls: userspace directly writes the AQL packet in mmap\'s queue memory, and then writes doorbell MMIO to notify the GPU. The GPU\'s Command Processor (MEC) reads and executes the command after detecting the doorbell.',
          },
          codeWalk: {
            title: 'kfd_ioctl_create_queue — Create a calculation queue',
            file: 'drivers/gpu/drm/amd/amdkfd/kfd_chardev.c',
            language: 'c',
            code: `/*kfd_chardev.c — Create an ioctl handler function for the KFD calculation queue */

static int kfd_ioctl_create_queue(struct file *filep,
                struct kfd_process *p, void *data)
{
    struct kfd_ioctl_create_queue_args *args = data;
    struct kfd_dev *dev;
    struct kfd_process_device *pdd;
    struct queue_properties properties;
    int err;

    /*Find target GPU device */
    dev = kfd_device_by_id(args->gpu_id);
    if (!dev)
        return -EINVAL;

    /*Get the process_device of the process on the GPU */
    pdd = kfd_get_process_device_data(dev, p);
    if (!pdd)
        return -ENOMEM;

    /*Convert userspace parameters to kernel queue_properties
     *Including: queue type, queue size, priority
     *ring_base_address (queue memory base address, user mode allocation)
     *write_ptr / read_ptr address
     *       doorbell_offset
     */
    memset(&properties, 0, sizeof(properties));
    properties.type = args->queue_type;
    properties.queue_address = args->ring_base_address;
    properties.queue_size = args->ring_size;
    properties.queue_percent = args->queue_percentage;
    properties.priority = args->queue_priority;

    /*Allocate doorbell page and set offset */
    err = kfd_queue_acquire_buffers(pdd, &properties);
    if (err)
        return err;

    /*Core: Create queues and map to GPU hardware
     *1. Allocate MQD (Memory Queue Descriptor)
     *2. Initialize queue parameters in MQD
     *3. Activate the queue through HWS or directly writing to the HQD register
     */
    err = pqm_create_queue(&p->pqm, dev, filep, &properties,
                           &args->queue_id,
                           NULL, NULL, NULL, &args->doorbell_offset);
    if (err)
        goto err_create;

    /*Return to user space:
     *args->queue_id — Queue ID (referenced by subsequent operations)
     *args->doorbell_offset — The offset of the doorbell in the mmap area
     *After the doorbell page of userspace mmap /dev/kfd
     *Doing a 32-bit write to (mmap_base + doorbell_offset) triggers the GPU
     */
    return 0;

err_create:
    kfd_queue_release_buffers(pdd, &properties);
    return err;
}`,
            annotations: [
              'args->ring_base_address is the queue ring buffer address pre-allocated by user space - the AQL package is written directly here',
              'kfd_queue_acquire_buffers allocates doorbell pages - a doorbell is a small area of ​​GPU MMIO space',
              'pqm_create_queue is the core call chain: allocate MQD → initialize → map to HQD or join the scheduler',
              'After args->doorbell_offset is returned to user space, the user can mmap the doorbell page and write directly to trigger the GPU',
              'queue_type can be KFD_IOC_QUEUE_TYPE_COMPUTE (compute) or KFD_IOC_QUEUE_TYPE_SDMA (DMA)',
              'After the queue is created, all command submissions to the queue from user space no longer need to go through the kernel (zero ioctl hot path)',
            ],
            explanation: 'This function is a key step in establishing a user-mode GPU computing channel. The user space sets the queue once through this ioctl, and all subsequent command submissions (writing AQL packages + writing doorbell) are completed directly in the user space. pqm_create_queue internally calls the GPU-specific MQD initialization function (such as gfx_v11_0\'s MQD initialization), sets the HQD register, and finally causes the GPU\'s MEC (Micro Engine Compute) to start polling the doorbell of this queue.',
          },
          miniLab: {
            title: 'Tracing ioctl calls for ROCm queue creation',
            objective: 'Use strace to observe how the ROCm runtime creates calculation queues and submits tasks through the /dev/kfd ioctl.',
            setup: `#Requires installation of ROCm and a simple HIP program
#If ROCm is installed, you can use vectorAdd from rocm-examples
sudo apt install rocm-hip-sdk  #If you haven't installed it yet`,
            steps: [
              'Write or obtain a simple HIP vector addition program (vectorAdd)',
              'Use strace to trace KFD ioctl: strace -e ioctl -f ./vectorAdd 2>&1 | grep kfd',
              'Look for the AMDKFD_IOC_CREATE_QUEUE ioctl call and observe the queue creation parameters',
              'Find AMDKFD_IOC_ALLOC_MEMORY_OF_GPU ioctl and observe GPU memory allocation',
              'Count the number of calls of various KFD ioctl: strace -e ioctl -c -f ./vectorAdd 2>&1',
              'Compare DRM ioctl: strace -e ioctl -f glxgears 2>&1 | head -30 (observe the difference in DRM paths)',
            ],
            expectedOutput: `$ strace -e ioctl -f ./vectorAdd 2>&1 | grep -c CREATE_QUEUE
2        ←Created 2 calculation queues (one compute, one SDMA)

$ strace -e ioctl -f ./vectorAdd 2>&1 | grep ALLOC_MEMORY
ioctl(4, AMDKFD_IOC_ALLOC_MEMORY_OF_GPU, ...)   ←Allocate GPU memory
ioctl(4, AMDKFD_IOC_ALLOC_MEMORY_OF_GPU, ...)   ←kernarg memory

Note: Command submission (write AQL + doorbell) will not appear in strace,
Because they are done directly in user space via mmap, no system calls!`,
            hint: 'If ROCm is not installed, you can use ftrace to trace KFD function calls from the kernel side: echo kfd_ioctl_create_queue > /sys/kernel/debug/tracing/set_ftrace_filter.',
          },
          debugExercise: {
            title: 'Diagnostic queue creation failed',
            language: 'c',
            description: 'A HIP program crashes on hipLaunchKernelGGL. strace shows AMDKFD_IOC_CREATE_QUEUE returns -ENOMEM. The following are possible reasons.',
            question: 'What are the possible reasons why queue creation returns -ENOMEM? How to diagnose and resolve?',
            buggyCode: `/*strace output */
ioctl(4, AMDKFD_IOC_CREATE_QUEUE, {queue_type=COMPUTE,
    ring_size=0x400000,    /*4MB queue size*/
    ring_base=0x0,         /*BUG! User space does not pre-allocate queue memory*/
    ...}) = -1 ENOMEM

/*Another situation: doorbell resources are exhausted */
/*After the process creates more than 1024 queues */
ioctl(4, AMDKFD_IOC_CREATE_QUEUE, ...) = -1 ENOMEM

/*dmesg log */
[  45.2] kfd: Failed to allocate MQD for queue
[  45.2] kfd: Can't create queue: doorbell allocation failed`,
            hint: 'There are two common reasons: (1) User space passes in an invalid ring_base_address; (2) The GPU\'s doorbell resources or MQD memory is exhausted.',
            answer: 'Two common reasons: (1) ring_base_address = 0x0: User space must first allocate queue ring buffer memory (usually via AMDKFD_IOC_ALLOC_MEMORY_OF_GPU) before calling the CREATE_QUEUE ioctl. A ring_base of 0 means that the memory allocation step of ROCm runtime failed and you need to check whether the GPU memory is sufficient (cat /sys/class/drm/card0/device/mem_info_vram_used). (2) Doorbell resource exhaustion: Each queue requires a doorbell slot, the GPU doorbell BAR size is limited (usually 2MB), 4 bytes per slot, up to about 512K doorbells. But the actual limit is smaller - KFD allocates doorbell pages (4KB/page) to each process, and each page can accommodate 1024 32-bit doorbells. If a process creates too many queues, doorbell pages can be exhausted. Solution: Destroy the queue that is no longer used (DESTROY_QUEUE ioctl), or reuse the queue in the application design. Production environments typically require only a few to dozens of queues per GPU.',
          },
          interviewQ: {
            question: 'Explain the difference between AQL packages and PM4 packages. Why does KFD use AQL instead of PM4 directly? What are the performance advantages of user-mode queues compared to kernel-mode command submission?',
            difficulty: 'hard',
            hint: 'Answer from three aspects: standardization (HSA vs hardware private), submission delay (user mode doorbell vs kernel ioctl), and security (user mode queue isolation).',
            answer: 'AQL vs PM4: (1) AQL is a format defined by the HSA standard (64 bytes fixed size), cross-platform portable - the same AQL package can theoretically run on AMD and other HSA-compatible hardware. PM4 is a proprietary command format for AMD GPUs that maps directly to CP microcode instructions. The format varies by GPU generation. (2) AQL is calculation-oriented - contains grid/workgroup dimension information and is suitable for kernel dispatch. PM4 is graphics oriented/general purpose - includes state settings, draw calls, DMA operations, etc. (3) The MEC (Micro Engine Compute) of the GPU natively supports parsing AQL packages without requiring additional command conversion. Performance advantages of user-mode queues: Each time a command is submitted via the traditional DRM path, an ioctl system call (~2μs overhead) + kernel-mode command verification + copying to the Ring Buffer is required. The KFD user-mode queue only requires user space memory writing + one doorbell MMIO writing (~100ns), reducing latency by more than an order of magnitude. For small kernel launches of tens of thousands per second in AI training, this difference directly affects GPU utilization. Security: Each user-space queue has an independent PASID and GPUVM page table. The GPU hardware ensures memory isolation between processes. Even if the user space directly operates the queue, it will not affect other processes.',
            amdContext: 'If you can clearly explain the latency advantages of AQL user-space queues and the PASID isolation mechanism during the AMD interview, it means that you understand the core motivation of KFD design - this is much more useful than remembering API parameters.',
          },
        },
      ],
    },

    // ════════════════════════════════════════════════════════════
    // Group 7.2: GPU Memory and Synchronization
    // ════════════════════════════════════════════════════════════
    {
      id: '7-2',
      number: '7.2',
      title: 'GPU memory and synchronization',
      titleEn: 'GPU Memory & Synchronization',
      icon: 'Link',
      description: 'The SVM unified virtual address space allows the CPU and GPU to share pointers, and GPU page faults and page migrations enable on-demand data movement. HSA semaphores and KFD event mechanisms enable efficient CPU-GPU synchronization.',
      lessons: [
        // ── Lesson 7.2.1 ──────────────────────────────────────
        {
          id: '7-2-1',
          number: '7.2.1',
          title: 'SVM unified virtual address space',
          titleEn: 'SVM Unified Virtual Address Space',
          duration: 20,
          difficulty: 'advanced',
          tags: ['SVM', 'GPUVM', 'PASID', 'page-fault', 'page-migration', 'coherency'],
          concept: {
            summary: 'SVM (Shared Virtual Memory) allows the CPU and GPU to share the same virtual address space - pointers on the CPU can be used directly in the GPU kernel without explicit copying. KFD implements this mechanism through GPUVM page tables, PASID process isolation and GPU page fault handling. The svm_migrate_to_vram/ram function is responsible for on-demand migration of pages between CPU and GPU memory.',
            explanation: [
              'Traditional GPU programming (an early model of CUDA) requires programmers to explicitly manage data transfers: cudaMalloc allocates memory on the GPU, and cudaMemcpy copies data between the CPU and GPU. Not only is this tedious, it\'s also error-prone—forgetting to synchronize, duplicating copies, memory leaks. The goal of SVM is to eliminate these manual steps: memory allocated with malloc or mmap on the CPU can be directly accessed by the GPU through the same virtual address; and vice versa.',
              'The implementation of SVM relies on several key mechanisms: (1) GPUVM page table - each process has an independent page table on the GPU (similar to the CPU\'s MMU page table), which maps virtual addresses to physical pages (VRAM or system memory). KFD manages these page tables through amdgpu\'s VM subsystem. (2) PASID (Process Address Space ID) - Each process is assigned a unique PASID. The GPU carries the PASID when issuing memory access. IOMMU and GPUVM use it to select the correct page table. This enables process-level GPU memory isolation. (3) GPU page fault - When the virtual address accessed by the GPU is not effectively mapped in the GPUVM page table, the GPU generates a page fault interrupt. KFD\'s fault handler captures this interrupt and establishes mappings as needed (possibly triggering page migration).',
              'Page migration is key to the performance of SVM. When the GPU frequently accesses pages in system memory, KFD can migrate the pages to VRAM for higher bandwidth. svm_migrate_to_vram() performs RAM → VRAM migration: (a) allocates the target page in VRAM; (b) copies the data through the SDMA engine; (c) updates the CPU and GPU page tables; (d) installs a migration entry in the CPU page table. If the CPU later accesses this page, it triggers a CPU page fault to move the page back to RAM. svm_migrate_to_ram() is a migration in the opposite direction. This on-demand migration mechanism is similar to the operating system\'s swap, but occurs between CPU and GPU memory.',
              'CPU-GPU memory coherency is the most complex part of SVM. RDNA3\'s Navi33 supports cache coherency protocols over PCIe (like CCIX\'s predecessor or CXL-related mechanisms), but in practice, KFD provides different levels of consistency guarantees: (a) Coarse-grained: The GPU sees consistent snapshots during kernel execution, but no real-time consistency is guaranteed - suitable for most computing scenarios. (b) Fine-grained: CPU and GPU read and write to the same address follow a certain order guarantee - hardware-level cache snoop is required and the performance overhead is greater. ROCm users can select the consistency level through the flags of hsa_amd_memory_pool_allocate.',
            ],
            keyPoints: [
              'SVM allows CPU/GPU to share virtual address space - CPU pointers can be used directly in the GPU kernel, eliminating explicit data copying',
              'The GPUVM page table maintains an independent GPU address mapping for each process, and PASID implements process isolation.',
              'GPU page fault triggers on-demand page mapping - similar to CPU\'s demand paging mechanism',
              'svm_migrate_to_vram() Migrate hot pages to VRAM to improve GPU access bandwidth (SDMA engine performs the actual copy)',
              'svm_migrate_to_ram() triggers a fetch when the CPU needs to access a migrated page',
              'KFD monitors process page table changes through MMU notifier and keeps the GPUVM page table synchronized with the CPU page table.',
            ],
          },
          diagram: {
            title: 'SVM unifies virtual address space and page migration',
            content: `SVM unified virtual address space: CPU and GPU shared pointers

Process virtual address space (64-bit)
┌────────────────────────────────────────────────────────┐
│  0x0000'7f00'0000'0000   ←Buffer allocated by malloc │
│  0x0000'7f00'0001'0000   ←GPU kernel parameters │
│  0x0000'7f00'0002'0000   ←Calculation results │
│  ...                                                   │
│CPU and GPU use the same virtual address to access this data│
└──────────┬────────────────────────────┬────────────────┘
           │                            │
CPU MMU page table GPUVM page table
     (per-process)                (per-PASID)
           │                            │
           ▼                            ▼
┌──────────────────┐          ┌──────────────────┐
│ CPU physical memory │ │ GPU VRAM │
│  (DDR5 RAM)      │          │  (GDDR6 8GB)     │
│                  │          │                  │
│ Page A [Hot Data] │ ──Migration──→│ Page A (Copy) │
│ (migration │ │ High-bandwidth GPU access │
│ entry tag) │ │ │
│                  │          │                  │
│  Page B          │←──Relocation── │ Page B │
│ (CPU access trigger) │ │ (evicted) │
└──────────────────┘          └──────────────────┘

Page migration process (svm_migrate_to_vram):
──────────────────────────────────────
1. GPU frequently accesses Page A → triggers migration decision
2. VRAM allocation target page
3. SDMA engine: memcpy(vram_page, ram_page)
4. Update GPUVM page table: VA → VRAM physical address
5. Update CPU page table: install migration entry
(fault triggered when CPU accesses again → svm_migrate_to_ram)

GPU Page Fault processing:
──────────────────────────────────────
GPU access virtual address 0x7f0000010000
       │
▼ (GPUVM page table has no mapping)
GPU generates page fault interrupt
       │
       ▼
  KFD fault handler (kfd_svm_page_fault)
       │
├─ Does the address belong to a registered SVM range?
│ Yes → Establish GPUVM mapping (may trigger migration)
│ No → Report GPU fault error
       │
       ▼
Resume GPU execution`,
            caption: 'SVM lets the CPU and GPU access data through the same virtual address. Pages can be migrated between system memory and VRAM on demand - GPU hot data is automatically moved into VRAM for high bandwidth, and CPU access is automatically moved back. This is transparent to the application and is managed automatically by KFD and hardware page fault mechanisms.',
          },
          codeWalk: {
            title: 'svm_range_add — Register SVM virtual address range',
            file: 'drivers/gpu/drm/amd/amdkfd/kfd_svm.c',
            language: 'c',
            code: `/*kfd_svm.c — SVM range management core function */

/*svm_range represents a virtual address range managed by SVM */
struct svm_range {
    struct interval_tree_node it_node; /*Interval tree node, indexed by VA*/
    struct list_head list;             /*SVM range linked list of process*/
    uint64_t start;                    /*Starting page number (VA >> PAGE_SHIFT)*/
    uint64_t last;                     /*end page number*/
    uint64_t npages;                   /*Number of pages*/
    uint32_t flags;                    /*access flag*/
    uint32_t preferred_loc;            /*Preferred location: CPU or GPU_ID*/
    uint32_t actual_loc;               /*Current actual location*/
    uint32_t granularity;              /*Migration granularity*/
    struct list_head deferred_list;    /*Delayed update list*/
    struct mutex migrate_mutex;        /*Migration operation mutex lock*/
    atomic_t queue_refcount;           /*The number of queues referencing this range*/
    /*... more fields */
};

/*Register a virtual address as the SVM management area */
int svm_range_add(struct kfd_process *p,
                  uint64_t start, uint64_t size,
                  uint32_t nattr,
                  struct kfd_ioctl_svm_attribute *attrs)
{
    struct svm_range_list *svms = &p->svms;
    struct svm_range *prange;
    uint64_t last = start + size - 1;
    int r;

    /*Lock SVM range list */
    mutex_lock(&svms->lock);

    /*Check whether it overlaps with existing SVM range
     *Use interval_tree to efficiently find overlapping intervals
     */
    prange = svm_range_find(svms, start, last);
    if (prange) {
        /*There is already a range covering this area: update attributes */
        r = svm_range_split_adjust(svms, prange,
                                   start, last, nattr, attrs);
        goto out;
    }

    /*Allocate new svm_range structure */
    prange = svm_range_new(svms, start, size, true);
    if (!prange) {
        r = -ENOMEM;
        goto out;
    }

    /*Set SVM properties (preferred_loc, flags, etc.)
     *preferred_loc determines the preferred storage location of the page:
     *KFD_IOCTL_SVM_LOCATION_SYSMEM — System memory
     *KFD_IOCTL_SVM_LOCATION_VRAM — GPU memory
     */
    svm_range_set_attr(p, start, size, nattr, attrs);

    /*Add the new range to the interval tree and linked list */
    svm_range_add_to_svms(prange);
    svm_range_add_notifier_locked(svms, prange);

    r = 0;
out:
    mutex_unlock(&svms->lock);
    return r;
}`,
            annotations: [
              'svm_range is the core data structure of SVM. Each instance represents a managed virtual address range.',
              'interval_tree allows efficient finding of SVM ranges that overlap a given address range (O(log n) complexity)',
              'preferred_loc indicates whether the page should be placed first in CPU or GPU memory - affecting migration strategy',
              'actual_loc records the current actual location of the page, which may trigger migration if it is different from preferred_loc',
              'migrate_mutex protects migration operations - only one migration operation is allowed at a time',
              'svm_range_add_notifier_locked registers MMU notifier and notifies KFD to update GPUVM when the CPU page table changes.',
            ],
            explanation: 'svm_range_add is the entry point for ROCm runtime to register the SVM management area with KFD. This function is ultimately called via ioctl when userspace calls hsaKmtSetMemoryPolicy or hipMallocManaged. It creates a svm_range structure in KFD to track this virtual address. When the GPU accesses an address within this range, KFD\'s page fault handler can find the corresponding svm_range and establish mapping or trigger migration as needed. This is the starting point of SVM\'s "allocate on demand, migrate on demand" mechanism.',
          },
          miniLab: {
            title: 'Observe SVM page migration and GPU page fault',
            objective: 'Observe KFD\'s SVM page migration behavior through ftrace and sysfs to understand how on-demand migration works.',
            setup: `#Requires root privileges to use ftrace
#Requires installation of ROCm and a HIP program using managed memory
sudo su`,
            steps: [
              'Enable KFD SVM related ftrace tracing points: echo 1 > /sys/kernel/debug/tracing/events/amdgpu/svm_migrate_start/enable',
              'Also enable GPU fault events: echo 1 > /sys/kernel/debug/tracing/events/amdgpu/amdgpu_vm_bo_cs/enable',
              'Running a HIP program using hipMallocManaged',
              'View the ftrace log: cat /sys/kernel/debug/tracing/trace | grep svm',
              'Observe migration statistics: cat /sys/class/drm/card0/device/kfd/proc/*/svm_stats (if available)',
              'Clean ftrace: echo 0 > /sys/kernel/debug/tracing/events/amdgpu/svm_migrate_start/enable',
            ],
            expectedOutput: `$ cat /sys/kernel/debug/tracing/trace | grep svm
vectorAdd-12345 [003]  svm_migrate_start: pid=12345
  src=RAM dst=VRAM start=0x7f0000010000 npages=64
vectorAdd-12345 [003]  svm_migrate_end: pid=12345
  src=RAM dst=VRAM migrated=64 failed=0

Description: Migrate 64 pages (256KB) from RAM to VRAM
This happens when the GPU kernel first accesses managed memory`,
            hint: 'If the ftrace event point does not exist, the kernel version may be older. You can use dmesg to observe instead: echo 0x40 > /sys/module/amdgpu/parameters/debug_mask Enable KFD debug logging.',
          },
          debugExercise: {
            title: 'Diagnosing kernel crashes caused by GPU page faults',
            language: 'c',
            description: 'A HIP program crashes during GPU kernel execution and dmesg shows GPU VM fault. Analyze the error message and determine the root cause.',
            question: 'What is the root cause of GPU VM fault? How to avoid this kind of problem in HIP code?',
            buggyCode: `/*dmesg output */
[  89.3] amdgpu 0000:03:00.0: [gfxhub0]
  GPU fault detected: src_id:0, ring:0, vmid:3, pasid:32769
[  89.3] amdgpu 0000:03:00.0:
  VM_L2_PROTECTION_FAULT_STATUS: 0x00301050
[  89.3] amdgpu 0000:03:00.0:
  addr: 0x00007f0000DEAD00  ←The virtual address being accessed
  status: read, protection fault
  client: TCP (Texture Cache Per Pipe)
[  89.3] kfd: Process 12345 GPU fault on gpu 1002:7480

/*Corresponding problematic HIP code */
__global__ void kernel(int *data, int n) {
    int idx = blockIdx.x * blockDim.x + threadIdx.x;
    /*BUG: Access data[idx] without checking idx < n */
    data[idx] = data[idx] * 2;  /*Cross-border access!*/
}

int main() {
    int *d_data;
    int n = 1024;
    hipMalloc(&d_data, n * sizeof(int));
    /*Too many threads started: 2048 > 1024 */
    kernel<<<4, 512>>>(d_data, n);
    hipDeviceSynchronize();
}`,
            hint: 'Note the 0xDEAD00 pattern in addr, and the mismatch in the number of threads (4 * 512 = 2048) and data size (1024 ints).',
            answer: 'Root cause: GPU kernel out-of-bounds memory access. The program allocates 1024 ints (4KB), but starts 4 * 512 = 2048 threads. Threads 1024-2047 access data[1024]-data[2047], which exceeds the allocated memory range. The GPU\'s GPUVM does not have a valid mapping on these out-of-bounds addresses, resulting in VM_L2_PROTECTION_FAULT. Key information in dmesg: (1) pasid:32769 identifies the error process; (2) addr: 0x7f0000DEAD00 is the virtual address of out-of-bounds access (0xDEAD mode indicates that this may be an uninitialized or released memory area); (3) client: TCP indicates a read operation initiated by Texture Cache (the memory read of the calculation shader is also through TCP); (4) protection fault Indicates that there is no mapping for this address in the page table. Fix: Add bounds check if (idx < n) in the kernel, or adjust the grid size to match the amount of data: kernel<<<(n+255)/256, 256>>>(d_data, n). This is one of the most common types of bugs in GPU programming.',
          },
          interviewQ: {
            question: 'Explain how KFD\'s SVM (Shared Virtual Memory) is implemented. Including the working mechanism of GPUVM page table, PASID, GPU page fault and page migration.',
            difficulty: 'hard',
            hint: 'Answer in sequence from data structure (svm_range) → hardware mechanism (GPUVM, PASID, page fault) → migration process (svm_migrate_to_vram/ram) → consistency guarantee (MMU notifier).',
            answer: 'KFD SVM implementation: (1) Data structure: Each virtual address range managed by SVM is represented by svm_range and stored in the interval tree for efficient search. svm_range records the address range, preferred location (CPU/GPU), actual location, and migration status. (2) GPUVM page table: The GPU of each process has an independent page table (similar to the CPU\'s 4-level page table), which maps virtual addresses to physical addresses in VRAM or system memory. PASID is the address space identifier of the process. The GPU carries PASID when accessing memory, and the hardware uses it to select the correct page table. (3) GPU page fault: When the GPU accesses an unmapped virtual address, the GPU generates a page fault interrupt. KFD\'s kfd_svm_page_fault handler finds the corresponding svm_range. If the page is in system memory and needs to be migrated to VRAM, trigger svm_migrate_to_vram(): allocate the page in VRAM → copy data to SDMA → update the GPU page table → install migration entry in the CPU page table. (4) Reverse migration: When the CPU accesses a page that has been migrated to VRAM, the CPU page fault handler triggers svm_migrate_to_ram() to migrate the page back. (5) Consistency: KFD registers the MMU notifier. When the CPU side page table changes (such as munmap, mremap), KFD synchronously updates or invalidates the corresponding GPUVM mapping to ensure that the CPU and GPU see the same address space. The entire mechanism is transparent to user space - memory allocated by hipMallocManaged is automatically migrated to the correct location when needed.',
            amdContext: 'This is an advanced question in AMD ROCm interview. Show that you understand that SVM is more than just "shared addresses". Behind it is a complex system of GPUVM page tables, PASID hardware support, page fault handling, and bidirectional migration. The mention of the MMU notifier is a plus - it reflects your understanding of the key mechanism of CPU and GPU page table synchronization.',
          },
        },

        // ── Lesson 7.2.2 ──────────────────────────────────────
        {
          id: '7-2-2',
          number: '7.2.2',
          title: 'Semaphores and events: CPU-GPU synchronization',
          titleEn: 'Signals & Events: CPU-GPU Synchronization',
          duration: 18,
          difficulty: 'advanced',
          tags: ['HSA-signal', 'KFD-event', 'doorbell', 'interrupt', 'polling', 'synchronization'],
          concept: {
            summary: 'CPU-GPU synchronization is a core challenge in heterogeneous computing. KFD provides two mechanisms: HSA semaphores (64-bit atomic counters that support direct GPU updates) and KFD events (interrupt-driven wake-up mechanisms). Semaphores are used for fine-grained synchronization between GPU-GPU and CPU-GPU, and events are used for efficient blocking of the CPU waiting for the GPU to complete.',
            explanation: [
              'The HSA Signal is a 64-bit atomic value stored in a memory location accessible to both the CPU and GPU. The GPU can update the semaphore\'s value through atomic operations (such as decrementing it to 0 after completing a kernel), and the CPU can poll or wait for the semaphore to reach a specific value. The essence of a semaphore is a shared atomic counter, but its special feature is that it is associated with a KFD event. When the value of the semaphore meets the condition, an interrupt can be triggered to wake up the waiting CPU thread instead of wasting CPU cycles for polling.',
              'In the AQL package, each kernel dispatch contains a completion_signal field. When the GPU completes this dispatch, it performs an atomic decrement operation on the 64-bit value pointed to by completion_signal. If the decremented value equals 0, the GPU also sends an interrupt to the CPU (by writing to the IH Ring). After receiving the interrupt, the KFD interrupt handler looks for the corresponding KFD event and wakes up the CPU thread waiting for the event. This is the underlying implementation of hipDeviceSynchronize() or hipStreamSynchronize().',
              'KFD Event is a synchronization primitive on the kernel side. User space creates events through AMDKFD_IOC_CREATE_EVENT ioctl and waits for event triggers through AMDKFD_IOC_WAIT_EVENTS. There are many types of events: SIGNAL event (associated with the HSA semaphore, triggered after the GPU completes the operation), HW_EXCEPTION (GPU hardware exception, such as page fault), DEBUG (debugging event). The kfd_wait_on_event function implements waiting logic: adds the current thread to the waiting queue, sets the timeout, and wakes up the thread when the event is triggered.',
              'There are two options for synchronous mode: polling and interrupt. In polling mode, the CPU continues to read the value of the semaphore until the condition is met - minimal latency (~100ns level), but a waste of CPU cycles. In interrupt mode, the CPU thread sleeps and wakes up via interrupt when the GPU is finished - no CPU waste, but there is an additional delay in interrupt processing (~1-10μs). The ROCm runtime usually adopts a mixed strategy: poll for a short period of time (~1000 cycles), and if the semaphore is not ready yet, switch to interrupt waiting. This achieves low latency for polling in short kernels (completion in microseconds) and avoids wasting CPU in long kernels (milliseconds or more).',
              'Doorbell also plays an important role in the synchronization mechanism. In addition to being used to notify the GPU of new AQL packets (queue doorbell), doorbell is also used as a fast path to the HSA semaphore - userspace can trigger the GPU to check the semaphore value by writing doorbell. This doorbell-based signaling mechanism minimizes the latency of semaphore operations. KFD allocates a doorbell page to each process, and the user space obtains the virtual address of the doorbell through mmap /dev/kfd.',
            ],
            keyPoints: [
              'HSA Signal is a 64-bit atomic counter that the GPU updates through atomic operations and the CPU polls or interrupts to wait.',
              'The completion_signal field of the AQL package—decrements after the GPU completes dispatch, and triggers an interrupt when the value is 0',
              'KFD Event is a kernel synchronization primitive - SIGNAL, HW_EXCEPTION, DEBUG and other types',
              'kfd_wait_on_event implements blocking waiting: thread sleep → GPU interrupt → kfd_signal_event_handler wake up',
              'Hybrid synchronization strategy: poll first (low latency) → switch to interrupt waiting after timeout (save CPU)',
              'doorbell for queue notifications and semaphore fast path - single 4-byte MMIO write',
            ],
          },
          diagram: {
            title: 'CPU-GPU synchronization: semaphore and event mechanism',
            content: `Three paths for CPU-GPU synchronization

Path 1: Polling mode (lowest latency, CPU consumption)
══════════════════════════════════════════════
  CPU                                GPU
  ────                               ────
  dispatch kernel (write AQL + doorbell)
──→ Execute kernel
  while (*signal != 0)               ...
    pause();         ←CPU busy waiting...
Finish
                                     atomic_dec(signal)
  *signal == 0  ✓                    ──→ signal = 0
Latency: ~100ns (fastest)

Path 2: Interrupt mode (saves CPU, has latency)
══════════════════════════════════════════════
  CPU                                GPU
  ────                               ────
  dispatch kernel
kfd_wait_on_event() ──→ execute kernel
    │                                ...
    ▼                                ...
  thread_sleep()    ←CPU sleep...
zzz... Done
                                     atomic_dec(signal)
                                     if signal == 0:
  ┌────────────────────────────────    write IH Ring ←─┐
│ (interrupt) │
  ▼                                                    │
IH Ring Processing │
  kfd_signal_event_handler()                           │
    │                                                  │
├─ Find events: event_id → kfd_event │
├─ Set event->signaled = true │
    └─ wake_up(&event->wq)  ←Wake up the waiting thread │
                                                       │
thread is awakened ✓ │
Delay: ~1-10μs │
                                                       │
Path 3: Mixed Mode (ROCm Default) │
══════════════════════════════════════════════          │
  CPU                                                  │
  ────                                                 │
  for (i = 0; i < 1000; i++)    ←Poll first │
    if (*signal == 0) goto done;                       │
  kfd_wait_on_event()           ←Then interrupt and wait │
                                                       │
                                                       │
IH Ring (Interrupt Handler Ring):                      │
┌────────────────────────────────────────┐             │
│ GPU generated interrupt event ring buffer │ │
│  ┌──────┬──────┬──────┬──────┐         │             │
│  │ src  │ src  │ src  │      │         │             │
│  │ =146 │ =146 │ =0   │      │         │             │
│  │signal│signal│fault │      │         │             │
│  │event1│event2│      │      │  ←──────┘
│  └──────┴──────┴──────┴──────┘
│ kfd_interrupt_isr() Process one by one
└────────────────────────────────────────┘`,
            caption: 'Three modes of CPU-GPU synchronization. Polling has the lowest latency but wastes CPU; interrupt waiting saves CPU but has interrupt processing latency; mixed mode combines the advantages of both - ROCm is used by default. The GPU notifies the CPU of semaphore changes through the IH Ring (interrupt handling ring buffer).',
          },
          codeWalk: {
            title: 'kfd_signal_event_handler — GPU interrupt trigger event wake-up',
            file: 'drivers/gpu/drm/amd/amdkfd/kfd_events.c',
            language: 'c',
            code: `/*kfd_events.c — KFD event signal processing */

/*This function is called when the GPU completes the operation and generates an interrupt
 *Distributed by the IH Ring handler (kfd_interrupt_isr)
 *
 *data: interrupt source information (signal event ID)
 */
void kfd_signal_event_handler(unsigned int client_id,
                              uint32_t event_id,
                              void *data)
{
    struct kfd_process *p;
    struct kfd_event *ev;

    /*Find the corresponding process by client_id (PASID) */
    p = kfd_lookup_process_by_pasid(client_id);
    if (!p)
        return;

    rcu_read_lock();

    /*Find events in a process's event table
     *The event table is IDR (ID Radix tree), O(1) lookup
     */
    ev = idr_find(&p->event_idr, event_id);
    if (!ev) {
        rcu_read_unlock();
        kfd_unref_process(p);
        return;
    }

    spin_lock(&ev->lock);

    /*Mark event as triggered */
    ev->signaled = true;
    ev->event_age++;

    /*Wake up all threads waiting on this event
     *wait_event_interruptible_timeout in kfd_wait_on_event()
     *will check ev->signaled and return
     */
    wake_up_all(&ev->wq);

    spin_unlock(&ev->lock);
    rcu_read_unlock();
    kfd_unref_process(p);
}

/*Core function of CPU side waiting event */
static int kfd_wait_on_event(struct kfd_process *p,
                             struct kfd_event *ev,
                             uint64_t timeout_ms)
{
    long timeout_jiffies;
    int ret;

    timeout_jiffies = msecs_to_jiffies(timeout_ms);

    /*Wait until event is triggered or times out
     *wait_event_interruptible_timeout Internal:
     *1. Add the current thread to the ev->wq waiting queue
     *2. Set the thread status to TASK_INTERRUPTIBLE
     *3. Call schedule() to release the CPU
     *4. Check conditions after being woken up by wake_up_all
     */
    ret = wait_event_interruptible_timeout(
        ev->wq,
        ev->signaled,    /*Wake-up condition: event has been triggered*/
        timeout_jiffies);

    if (ret == 0)
        return -ETIME;   /*time out*/
    if (ret < 0)
        return ret;       /*interrupted by signal*/

    /*Reset event state (one-shot semantics) */
    spin_lock(&ev->lock);
    ev->signaled = false;
    spin_unlock(&ev->lock);

    return 0;
}`,
            annotations: [
              'kfd_signal_event_handler is dispatched by the IH Ring handler - when the GPU writes to the IH Ring indicating that the operation is complete',
              'client_id is PASID - GPU carries PASID in interrupt data to identify which process the event is from',
              'idr_find is an O(1) ID search, and the event table is implemented using IDR (ID Radix tree) to support fast search.',
              'wake_up_all wakes up all waiting threads - multiple CPU threads can wait for the same event',
              'wait_event_interruptible_timeout is the kernel\'s standard conditional waiting primitive - the thread sleeps until the condition is met',
              'One-shot semantics: reset signaled=false after the event is triggered, and wait for a new GPU completion signal next time',
            ],
            explanation: 'The interrupt processing chain after the GPU completes kernel execution: GPU writes the interrupt information to the IH Ring → amdgpu\'s IH Ring handler reads the interrupt → recognizes that it is a KFD signal event → calls kfd_signal_event_handler → finds the process and event → wakes up the waiting thread. kfd_wait_on_event corresponds to the underlying implementation of hsaKmtWaitOnEvent or hipDeviceSynchronize in user space. Understanding this interrupt-wake path is key to understanding CPU-GPU synchronization latency.',
          },
          miniLab: {
            title: 'Measuring CPU-GPU synchronization latency',
            objective: 'Write a simple HIP program to measure the latency from when the GPU kernel completes to when the CPU wakes up, comparing polling and interrupt modes.',
            setup: `#Requires ROCm and HIP compilers
#If there is no ROCm, you can observe kfd_signal_event_handler through ftrace`,
            steps: [
              'Write a HIP program: start an empty kernel, and then use hipEventElapsedTime to measure the synchronization delay',
              'Run 100 times and average: record the time taken by hipDeviceSynchronize',
              'Use ftrace to trace kfd_signal_event_handler: echo kfd_signal_event_handler > /sys/kernel/debug/tracing/set_ftrace_filter',
              'Enable function tracing: echo function > /sys/kernel/debug/tracing/current_tracer',
              'Check the trace after running the HIP program: cat /sys/kernel/debug/tracing/trace | grep kfd_signal',
              'Observe the time difference from interrupt to wake-up (timestamp column)',
            ],
            expectedOutput: `#HIP sync delay measurement
hipDeviceSynchronize average latency: ~5-15 μs (interrupt mode)

#ftrace output
$ cat /sys/kernel/debug/tracing/trace | grep kfd_signal
 amdgpu-12345  [002] 89.123456: kfd_signal_event_handler
               ←From interrupt occurrence to handler execution ~2-5μs

Compare hipStreamQuery (polling mode):
average latency: ~1-3 μs (lower latency but consumes CPU)`,
            hint: 'If you cannot install ROCm, you can understand the synchronization mechanism by reading the usage of wait_event_interruptible_timeout in the kfd_events.c source code. Pay attention to the setting and checking timing of ev->signaled.',
          },
          debugExercise: {
            title: 'Diagnosing CPU-GPU synchronization deadlock',
            language: 'c',
            description: 'A multi-stream HIP program hangs - hipDeviceSynchronize never returns. Analyze the following scenarios to find out why.',
            question: 'Why does hipDeviceSynchronize never return? Is this a deadlock? How to fix it?',
            buggyCode: `/*Problematic multi-stream HIP program */
hipStream_t stream1, stream2;
hipStreamCreate(&stream1);
hipStreamCreate(&stream2);

/*Start kernel A on stream1 */
kernelA<<<grid, block, 0, stream1>>>(data);

/*Wait for stream1 to complete on CPU (blocking!) */
hipStreamSynchronize(stream1);

/*BUG: kernelA is internally waiting for kernelB on stream2 to complete
 *But kernelB has not been started yet!
 */

/*This line of code will never be executed until */
kernelB<<<grid, block, 0, stream2>>>(data);
hipStreamSynchronize(stream2);

/*----- dmesg output ----- */
/* [120.5] [drm:amdgpu_job_timedout] *ERROR*
 *   ring comp_1.0.0 timeout,
 *   signaled seq=100, emitted seq=101
 * [120.5] amdgpu: GPU reset begin!
 */`,
            hint: 'kernelA is waiting for a signal that will never fire - because kernelB, which generates the signal, is blocked on the CPU side (CPU is waiting for kernelA in hipStreamSynchronize).',
            answer: 'This is a classic CPU-GPU deadlock scenario: (1) The CPU waits for kernelA to complete in hipStreamSynchronize(stream1); (2) When kernelA is executed on the GPU, it internally waits for kernelB on stream2 to complete through the HSA semaphore; (3) But the startup code of kernelB is on the CPU, located after hipStreamSynchronize - the CPU is blocked causing kernelB to never be submitted to the GPU. Forming a circular wait: CPU waits for kernelA → kernelA and waits for kernelB → kernelB, which requires CPU submission. Finally, the amdgpu_job_timedout of the GPU detects a timeout and triggers a GPU reset. Repair method: (a) First submit all kernels to their respective streams, and then synchronize: kernelA<<<...stream1>>>; kernelB<<<...stream2>>>; hipStreamSynchronize(stream1); hipStreamSynchronize(stream2); (b) Use hipStreamWaitEvent to implement inter-stream dependency on the GPU side instead of synchronization on the CPU side; (c) Avoid waiting for signals from other streams inside the GPU kernel - this mode can easily lead to deadlocks.',
          },
          interviewQ: {
            question: 'Describes the complete path of CPU-GPU synchronization in KFD: from when the GPU completes a kernel to when the CPU thread wakes up. Including HSA semaphore, IH Ring, KFD event mechanism and wake-up process.',
            difficulty: 'hard',
            hint: 'According to the event chain: GPU atomic write signal → GPU write IH Ring → CPU interrupt → IH handler → kfd_signal_event_handler → wake_up_all → user thread returns.',
            answer: 'Complete synchronization path: (1) The GPU\'s Shader Engine finishes executing the last workgroup of the kernel; (2) The GPU\'s CP performs an atomic_dec operation (64-bit atomic decrement) on the completion_signal address in the AQL package, decrementing the semaphore from 1 to 0; (3) If the decremented value is 0 and the semaphore is associated with an interrupt event, the GPU sends a message to the IH Ring (Interrupt Handler) Ring) writes an interrupt entry, including source_id (146 = signal completion), PASID (process identification) and event_id; (4) amdgpu\'s IH Ring handler (amdgpu_irq_handler) reads the IH Ring in the IRQ context, recognizes that this is a KFD signal event, and calls kfd_interrupt_isr to add the event to KFD\'s interrupt work queue; (5) KFD\'s interrupt worker thread calls kfd_signal_event_handler, find the kfd_process of the process through PASID, and find kfd_event in the IDR through event_id; (6) Set ev->signaled = true, call wake_up_all(&ev->wq) to wake up all threads on the waiting queue; (7) The user thread returns from wait_event_interruptible_timeout, kfd_wait_on_event returns 0 Indicates success; (8) hipDeviceSynchronize in user space returns. The entire path delay is about 5-15μs, and the main overhead is interrupt processing and thread scheduling. Compare polling mode: the CPU directly reads the semaphore memory location, with a latency of ~100ns-1μs, but consumes CPU cores. ROCm uses a mixed strategy by default - polling briefly, then switching to interrupt waiting.',
            amdContext: 'Being able to describe this interrupt-wakeup path in detail shows that you have a deep understanding of the implementation details of KFD. Mentioning specific mechanisms like IH Ring, PASID lookup, and wake_up_all in AMD interviews will demonstrate that you not only understand the concepts but have also read actual code. Bonus points: Mention that ROCm\'s hybrid polling/interrupt strategy demonstrates a sense of engineering practice.',
          },
        },
      ],
    },
  ],
  completionChecklist: [
    'Understand the core concept of HSA architecture - CPU/GPU share virtual address space as equal computing agents',
    'Can explain the difference between KFD and DRM interfaces (command format, queue model, memory model)',
    'Understand the 64-byte structure of AQL packets and the zero-kernel submission path for user-mode queues',
    'Can describe MQD/HQD mapping mechanism and doorbell driver queue notification',
    'Understand the implementation of SVM: GPUVM page table, PASID, GPU page fault, page migration',
    'Can explain the svm_range data structure and the migration process of svm_migrate_to_vram/ram',
    'Understand how HSA semaphores (64-bit atomic counters) and KFD events (interrupt-driven wake-up) work',
    'Can describe the complete interrupt path from GPU kernel completion to CPU thread wake-up',
  ],
};
