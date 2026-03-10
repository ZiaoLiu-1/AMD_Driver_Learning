// ============================================================
// AMD Linux Driver Learning Platform - Module 0 Micro-Lessons (English)
// Module 0: Introduction & Learning Path
// 7 lessons in 3 groups, ~15 min each, total ~105 min
// ============================================================
import type { MicroLessonModule } from './micro_lesson_types';

export const module0MicroLessonsEn: MicroLessonModule = {
  moduleId: 'intro',
  groups: [
    // ════════════════════════════════════════════════════════════
    // Group 0.1: Understanding GPU Drivers
    // ════════════════════════════════════════════════════════════
    {
      id: '0-1',
      number: '0.1',
      title: 'Understanding GPU Drivers',
      titleEn: 'Understanding GPU Drivers',
      icon: 'Brain',
      description: 'Understand from scratch what GPU drivers really do, how each layer of the Linux graphics stack works, and why AMD\'s open-source strategy makes learning possible.',
      lessons: [
        // ── Lesson 0.1.1 ──────────────────────────────────────
        {
          id: '0-1-1',
          number: '0.1.1',
          title: 'What is a GPU Driver? From Pixels to Registers',
          titleEn: 'What is a GPU Driver? From Pixels to Registers',
          duration: 15,
          difficulty: 'beginner',
          tags: ['GPU', 'driver', 'hardware', 'register'],
          concept: {
            summary: 'A GPU driver is the translator between the operating system and GPU hardware — it converts high-level application requests ("draw a triangle") into low-level operations the GPU hardware understands ("write 0x00000001 to register 0x28000").',
            explanation: [
              'Imagine you\'re playing a game. When the game engine calls OpenGL\'s glDrawArrays() to render a triangle, that call must pass through multiple software layers before the GPU\'s shader cores can begin working. The GPU driver is the most critical link in this chain — it is the only software that truly communicates with the GPU hardware.',
              'At the lowest level, what a GPU driver does is quite raw: it writes specific values to GPU registers through MMIO (Memory-Mapped I/O). A GPU has tens of thousands of registers, each controlling a specific hardware behavior. For example, writing to the CP_RB_WPTR (Command Processor Ring Buffer Write Pointer) register notifies the GPU that "new commands are waiting to be executed." The driver must know the address, format, and semantics of each register.',
              'But a driver does far more than just write registers. A modern GPU driver (like amdgpu) must also: manage GPU memory (VRAM allocation and reclamation), schedule GPU tasks (multiple applications sharing a single GPU), handle interrupts (GPU notifying the CPU after completing tasks), manage power (adjusting GPU frequency and voltage to balance performance and power consumption), and control display output (setting resolution, refresh rate). This is why the amdgpu driver has over 4 million lines of code.',
              'An important point to understand: a GPU driver isn\'t just about "making the GPU work" — it\'s a complex system software that must simultaneously handle performance, security, stability, and power consumption across multiple dimensions. This is also why GPU driver engineers are in high demand — this field requires simultaneous understanding of operating system kernels, hardware architecture, and graphics.',
            ],
            keyPoints: [
              'GPU driver is the translation layer between OS and GPU hardware, communicating with hardware via MMIO register writes',
              'Core driver responsibilities: memory management, task scheduling, interrupt handling, power management, display control',
              'amdgpu driver is located at drivers/gpu/drm/amd/, with over 4 million lines of code',
              'Driver runs in kernel space (Ring 0); errors can crash the entire system',
              'GPU has tens of thousands of registers, each controlling a hardware behavior — the driver must operate them precisely',
            ],
          },
          diagram: {
            title: 'Complete Path from Application to GPU Hardware',
            content: `Complete rendering path of an OpenGL triangle

User Space                                    Kernel Space                     Hardware
─────────                                    ─────────                     ────

  Game calls                                                               
  glDrawArrays()                                                          
       │                                                                  
       ▼                                                                  
  Mesa radeonsi                                                           
  (OpenGL → GPU commands)                                                     
  Build PM4 command packets:                                                        
  [Set vertex buffer]                                                          
  [Set shader]                                                            
  [Draw triangle]                                                            
       │                                                                  
       ▼                                                                  
  libdrm                                                                  
  ioctl(fd, DRM_IOCTL_                                                    
        AMDGPU_CS, &cs)                                                   
       │                                                                  
───────┼──── Syscall Boundary (Ring 3 → Ring 0) ────────                      
       │                                                                  
       ▼                                                                  
  DRM Core                                                                
  drm_ioctl() dispatch                                                        
       │                                                                  
       ▼                                                                  
  amdgpu driver                                                             
  amdgpu_cs_ioctl()                                                       
  ├─ Validate command buffer                                                       
  ├─ Map GPU memory                                                        
  ├─ Write to Ring Buffer                                                     
  └─ writel(wptr,               ──→   GPU Ring Buffer                     
     doorbell_reg)                     ┌──────────┐                       
                                       │ PM4 cmd  │ ──→  Command          
                                       │ PM4 cmd  │      Processor        
                                       │ PM4 cmd  │         │             
                                       └──────────┘         ▼             
                                                        Shader Cores         
                                                        Execute Rendering           
                                                            │             
                                                            ▼             
                                                        Framebuffer       
                                                        (Pixel Data)         
                                                            │             
                                                            ▼             
                                                        Display Controller         
                                                        → Your Screen 🖥️`,
            caption: 'The complete path of a triangle from OpenGL call to final display on screen. The amdgpu driver is the core bridge connecting user space and GPU hardware. The writel() to the doorbell register is the final step of driver-to-hardware communication.',
          },
          codeWalk: {
            title: 'writel() — The Most Basic Driver-Hardware Communication',
            file: 'drivers/gpu/drm/amd/amdgpu/amdgpu_device.c',
            language: 'c',
            code: `/* The most basic hardware access operations in the amdgpu driver */

/* Write to a GPU register (MMIO) */
void amdgpu_device_wreg(struct amdgpu_device *adev,
                         uint32_t reg, uint32_t v,
                         uint32_t acc_flags)
{
    /* adev->rmmio is the GPU register space mapped to a kernel virtual address
     * Created by pci_ioremap_bar() during driver initialization
     * reg is the register offset (e.g., 0x28000 = GRBM_STATUS)
     */
    if (!(acc_flags & AMDGPU_REGS_NO_KIQ) &&
        amdgpu_sriov_runtime(adev))
        /* SR-IOV virtualized environment: access indirectly via KIQ */
        return amdgpu_kiq_wreg(adev, reg, v);

    /* Direct MMIO write — the most common path */
    writel(v, ((void __iomem *)adev->rmmio) + (reg * 4));
    /* ↑ writel is a kernel-provided MMIO write function
     * It's equivalent to *(volatile uint32_t *)(addr) = value
     * but additionally guarantees memory barriers and byte ordering */
}

/* Read a GPU register */
uint32_t amdgpu_device_rreg(struct amdgpu_device *adev,
                             uint32_t reg, uint32_t acc_flags)
{
    if (!(acc_flags & AMDGPU_REGS_NO_KIQ) &&
        amdgpu_sriov_runtime(adev))
        return amdgpu_kiq_rreg(adev, reg);

    return readl(((void __iomem *)adev->rmmio) + (reg * 4));
}

/* Typical usage in code */
/* WREG32(mmGRBM_STATUS) and RREG32(mmGRBM_STATUS) are macros
 * that expand to call amdgpu_device_wreg/rreg */`,
            annotations: [
              'adev->rmmio is the base address of the GPU register BAR mapped into kernel virtual address space, created by pci_ioremap_bar()',
              'reg * 4: each register is 32-bit (4 bytes), reg is the register number, multiply by 4 to get the byte offset',
              'writel/readl are kernel MMIO access functions that guarantee memory barriers and correct byte ordering',
              '__iomem is a kernel type annotation indicating this is an I/O memory pointer that cannot be directly dereferenced',
              'AMDGPU_REGS_NO_KIQ flag bypasses KIQ (Kernel Interface Queue), used in virtualized environments',
              'WREG32/RREG32 macros are the most commonly used register access method in the amdgpu driver — you\'ll see them thousands of times in the code',
            ],
            explanation: 'This code demonstrates the lowest-level operation of a GPU driver — reading and writing GPU registers. When you see WREG32(mmSOME_REG, value) in the amdgpu source code, this is the function it ultimately calls. Understanding this mechanism is fundamental to reading all amdgpu code, because every control operation the driver performs on the GPU — setting display modes, starting GPU commands, adjusting frequencies — ultimately boils down to register reads and writes.',
          },
          miniLab: {
            title: 'Read Your GPU Information via sysfs',
            objective: 'Use the Linux sysfs interface to read hardware information about your AMD GPU (using RX 7600 XT as an example), and understand how the kernel exposes GPU state to user space.',
            steps: [
              'Open a terminal and run lspci -v | grep -A 10 "VGA\\\\|3D\\\\|Display" to find your AMD GPU',
              'View the GPU\'s PCI Device ID: cat /sys/class/drm/card0/device/device (should output 0x7480)',
              'View the GPU vendor ID: cat /sys/class/drm/card0/device/vendor (should output 0x1002 = AMD)',
              'View amdgpu driver memory usage: cat /sys/class/drm/card0/device/mem_info_vram_used (VRAM usage in bytes)',
              'View GPU current frequency: cat /sys/class/drm/card0/device/pp_dpm_sclk (shows available frequencies and current frequency)',
              'View GPU temperature: cat /sys/class/drm/card0/device/hwmon/hwmon*/temp1_input (temperature in millidegrees Celsius, divide by 1000 for degrees Celsius)',
            ],
            expectedOutput: `$ cat /sys/class/drm/card0/device/device
0x7480     ← Navi33 (RX 7600 XT) Device ID

$ cat /sys/class/drm/card0/device/vendor
0x1002     ← AMD PCI Vendor ID

$ cat /sys/class/drm/card0/device/mem_info_vram_used
285212672  ← ~272MB VRAM in use (desktop environment)

$ cat /sys/class/drm/card0/device/pp_dpm_sclk
0: 300Mhz
1: 800Mhz
2: 2100Mhz
3: 2595Mhz *   ← * indicates current frequency`,
            hint: 'If you see "Permission denied", try using sudo. If /sys/class/drm/card0 doesn\'t exist, check if the amdgpu module is loaded: lsmod | grep amdgpu.',
          },
          debugExercise: {
            title: 'Find the Incorrect Register Access',
            language: 'c',
            description: 'The following code attempts to read a GPU register, but contains a common error. Find the problem and explain why it is dangerous.',
            question: 'What is wrong with this code? Why is doing this in the kernel dangerous?',
            buggyCode: `/* Incorrect GPU register read code */
#include <linux/io.h>

uint32_t read_gpu_status(struct amdgpu_device *adev)
{
    uint32_t *reg_ptr;

    /* Directly dereference MMIO pointer */
    reg_ptr = (uint32_t *)adev->rmmio + 0xA000;
    return *reg_ptr;  /* BUG: directly dereferencing __iomem pointer! */
}`,
            hint: 'MMIO memory is not ordinary memory — the compiler may optimize away reads to it, and different architectures have different byte orderings.',
            answer: 'Error: directly dereferencing an __iomem pointer (*reg_ptr) instead of using readl(). There are three problems: (1) The compiler may optimize away this read (assuming the address hasn\'t changed and caching the previous value), but MMIO register values can change at any time due to hardware; (2) readl() contains a memory barrier, ensuring the register read won\'t be reordered by the CPU; (3) readl() handles byte-order conversion (GPU registers are little-endian; on big-endian CPUs, conversion is needed). Correct approach: return readl(((void __iomem *)adev->rmmio) + (0xA000 * 4)); or use the RREG32(0xA000) macro. The kernel sparse tool (make C=1) will flag this type of error.',
          },
          interviewQ: {
            question: 'What is the role of a GPU driver in the operating system? Why is it particularly complex?',
            difficulty: 'easy',
            hint: 'Answer from the perspective of the driver\'s multiple responsibilities (memory management, task scheduling, interrupt handling, display control, power management) and simultaneously serving multiple user-space clients.',
            answer: 'A GPU driver is the interface layer between the operating system and GPU hardware, translating high-level user-space requests (rendering commands, compute tasks, video encode/decode) into register operations and command packets that GPU hardware can understand. It is particularly complex because: (1) Multiple responsibilities: a single driver simultaneously handles memory management (VRAM allocation/reclamation/migration), task scheduling (multiple applications sharing the GPU), interrupt handling (GPU completion notifications), display control (KMS mode setting), and power management (DVFS dynamic frequency/voltage scaling); (2) Multiple clients: multiple applications use the GPU simultaneously, and the driver must ensure isolation and fair scheduling; (3) Hardware diversity: the amdgpu driver supports multiple generations of architectures from 2012 GCN to the latest RDNA4, with extensive conditional logic handling different hardware; (4) Real-time requirements: display output must complete within each VBlank interval (~16.7ms at 60Hz), or visible screen tearing occurs.',
            amdContext: 'AMD interviews often open with this question to test the depth of your understanding of the GPU driver\'s overall role. When answering, demonstrate that you understand it as a complete system, not just "making the GPU work."',
          },
        },

        // ── Lesson 0.1.2 ──────────────────────────────────────
        {
          id: '0-1-2',
          number: '0.1.2',
          title: 'The Linux Graphics Stack Top-to-Bottom',
          titleEn: 'The Linux Graphics Stack Top-to-Bottom',
          duration: 20,
          difficulty: 'beginner',
          tags: ['Linux', 'graphics-stack', 'DRM', 'Mesa', 'libdrm'],
          concept: {
            summary: 'The Linux graphics stack is a multi-layered software system: from user-space OpenGL/Vulkan applications, through the Mesa 3D library, libdrm, the DRM kernel subsystem, and finally reaching the amdgpu driver and GPU hardware. Understanding each layer\'s responsibilities and interfaces is the first step to learning driver development.',
            explanation: [
              'If you think of the Linux graphics stack as a building, user-space applications are on the top floor, GPU hardware is the foundation, and each layer in between has clear division of responsibilities. Understanding this layering is fundamental to understanding all of driver development — you need to know what each layer does, what it doesn\'t do, and how layers communicate with each other.',
              'The top layer is the graphics API (OpenGL, Vulkan, HIP). Applications don\'t communicate directly with the GPU; instead, they describe what they want to do through these standardized APIs. For example, glDrawArrays(GL_TRIANGLES, 0, 3) means "draw a triangle from 3 vertices using the current state." These APIs are cross-platform — the same code should work on AMD, NVIDIA, and Intel GPUs.',
              'The middle layer is the Mesa 3D library. Mesa is the open-source OpenGL/Vulkan implementation on Linux. For AMD GPUs, Mesa contains two key drivers: radeonsi (OpenGL) and radv (Vulkan). Mesa\'s job is to compile high-level API calls into commands the GPU can execute — including compiling shaders (GLSL → GPU ISA), building PM4 command packets, and managing user-space buffer allocation. Mesa communicates with the kernel through the libdrm library.',
              'libdrm is a user-space C library that wraps DRM ioctl calls. It provides a friendlier API (such as amdgpu_bo_alloc, amdgpu_cs_submit), so Mesa doesn\'t need to directly construct ioctl parameters. The amdgpu-specific part of libdrm is under libdrm/amdgpu/.',
              'The kernel-space DRM (Direct Rendering Manager) subsystem is the framework for all GPU drivers. It provides common functionality: device file management (/dev/dri/card0), ioctl dispatch, KMS display management, and GEM memory management. The amdgpu driver is a specific implementation of DRM — it registers with the DRM framework and provides AMD GPU-specific functionality.',
              'The bottom layer is the amdgpu driver itself and the GPU hardware. The amdgpu driver reads and writes GPU registers via MMIO, transfers data via DMA, and receives GPU notifications via interrupts. Its code is under drivers/gpu/drm/amd/, containing dozens of submodules (GFX, SDMA, DC, VCN, KFD, etc.), each responsible for one functional module of the GPU.',
            ],
            keyPoints: [
              'Graphics API (OpenGL/Vulkan) → Mesa 3D (radeonsi/radv) → libdrm → ioctl → DRM → amdgpu → GPU',
              'Mesa compiles shaders and builds command packets in user space, reducing kernel workload',
              'libdrm wraps ioctl calls, providing C APIs (amdgpu_bo_alloc, amdgpu_cs_submit, etc.)',
              'DRM is the generic framework, amdgpu is the specific implementation — the same DRM API supports AMD/Intel/NVIDIA GPUs',
              'ioctl is the core mechanism for user-space to kernel communication; each DRM operation corresponds to an ioctl number',
              'amdgpu driver is divided into multiple IP Blocks: GFX (graphics), SDMA (DMA), DC (display), VCN (video)',
            ],
          },
          diagram: {
            title: 'Complete Linux Graphics Stack Layer Diagram',
            content: `Linux Graphics Stack Layered Architecture (AMD GPU example)

┌─────────────────────────────────────────────────────────────────┐
│  Layer 5: Applications                                          │
│  Games (Cyberpunk 2077)  │  AI (PyTorch)  │  Desktop (GNOME/KDE)│
│  OpenGL / Vulkan API       HIP API          EGL / Wayland       │
└───────────────┬──────────────┬─────────────────┬────────────────┘
                │              │                 │
┌───────────────▼──────────────▼─────────────────▼────────────────┐
│  Layer 4: User-Space Drivers                                     │
│                                                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────────────┐    │
│  │ Mesa radeonsi│  │ ROCm / HIP  │  │ Mesa radv (Vulkan)   │    │
│  │ (OpenGL)    │  │ Runtime     │  │                      │    │
│  └──────┬──────┘  └──────┬──────┘  └──────────┬───────────┘    │
│         │                │                     │                 │
│  ┌──────▼────────────────▼─────────────────────▼──────────┐     │
│  │                    libdrm                               │     │
│  │  amdgpu_bo_alloc()  amdgpu_cs_submit()  drmModeSetCrtc()│    │
│  └────────────────────────┬───────────────────────────────┘     │
└───────────────────────────┼─────────────────────────────────────┘
                            │
        ═══════════════ ioctl() System Call ═══════════════
                            │
┌───────────────────────────▼─────────────────────────────────────┐
│  Layer 3: DRM Core (DRM Kernel Framework)                        │
│  drivers/gpu/drm/drm_*.c                                        │
│                                                                  │
│  drm_ioctl()  →  Dispatch to driver-specific handler by ioctl #  │
│  drm_gem_*    →  Generic GPU memory management framework         │
│  drm_atomic_* →  KMS Atomic Mode Setting (display management)    │
└───────────────────────────┬─────────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────────┐
│  Layer 2: amdgpu Driver                                          │
│  drivers/gpu/drm/amd/                                            │
│                                                                  │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐       │
│  │  GFX   │ │  SDMA  │ │   DC   │ │  VCN   │ │  KFD   │       │
│  │Graphics│ │DMA Eng.│ │Display │ │ Video  │ │Compute │       │
│  │gfx1102 │ │sdma6.0 │ │ DCN3.2 │ │VCN 4.0 │ │ ROCm   │       │
│  └───┬────┘ └───┬────┘ └───┬────┘ └───┬────┘ └───┬────┘       │
│      └──────────┴──────────┴──────────┴──────────┘              │
│                            │                                     │
│            MMIO writel/readl + DMA + Interrupt                   │
└───────────────────────────┬─────────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────────┐
│  Layer 1: GPU Hardware                                           │
│  RX 7600 XT  ·  Navi33  ·  gfx1102  ·  RDNA3                  │
│                                                                  │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐       │
│  │Shader  │ │ SDMA   │ │Display │ │ Video  │ │ VRAM   │       │
│  │Engines │ │Engines │ │Engine  │ │Engine  │ │ 8GB    │       │
│  │(32 CU) │ │ (×2)   │ │(DCN3.2)│ │(VCN4.0)│ │GDDR6   │       │
│  └────────┘ └────────┘ └────────┘ └────────┘ └────────┘       │
└─────────────────────────────────────────────────────────────────┘`,
            caption: 'Complete Linux graphics stack layer diagram. Each module in the learning path corresponds to one or more layers in this diagram: Module 4 corresponds to DRM Core, Module 5 corresponds to the amdgpu Driver, Module 8 corresponds to ROCm/HIP.',
          },
          codeWalk: {
            title: 'Tracing a GL Program\'s ioctl Calls with strace',
            file: 'terminal + drm_ioctl.c',
            language: 'bash',
            code: `# Use strace to trace glxgears (a simple OpenGL program)
# Show only ioctl system calls
$ strace -e ioctl -f glxgears 2>&1 | head -40

# Example output (simplified):
# ioctl(8, DRM_IOCTL_VERSION, ...) = 0              ← Query driver version
# ioctl(8, DRM_IOCTL_AMDGPU_INFO, ...) = 0          ← Query GPU info
# ioctl(8, DRM_IOCTL_AMDGPU_GEM_CREATE, ...) = 0    ← Allocate GPU memory
# ioctl(8, DRM_IOCTL_AMDGPU_GEM_CREATE, ...) = 0    ← Allocate vertex buffer
# ioctl(8, DRM_IOCTL_AMDGPU_CS, ...) = 0            ← Submit rendering commands
# ioctl(8, DRM_IOCTL_AMDGPU_WAIT_CS, ...) = 0       ← Wait for GPU completion
# ioctl(8, DRM_IOCTL_AMDGPU_CS, ...) = 0            ← Submit next frame
# ... (~300 ioctl calls per second)

# Corresponding kernel code (drm_ioctl.c):
# static const struct drm_ioctl_desc amdgpu_ioctls_kms[] = {
#     DRM_IOCTL_DEF_DRV(AMDGPU_GEM_CREATE, amdgpu_gem_create_ioctl, ...),
#     DRM_IOCTL_DEF_DRV(AMDGPU_CS, amdgpu_cs_ioctl, ...),
#     DRM_IOCTL_DEF_DRV(AMDGPU_INFO, amdgpu_info_ioctl, ...),
#     DRM_IOCTL_DEF_DRV(AMDGPU_WAIT_CS, amdgpu_cs_wait_ioctl, ...),
# };`,
            annotations: [
              'strace traces a process\'s system calls — ioctl is the only way for user space to communicate with the DRM driver',
              'fd=8 is the file descriptor for /dev/dri/card0, opened by Mesa during initialization',
              'DRM_IOCTL_AMDGPU_CS is the most critical ioctl — it submits GPU rendering commands',
              'Each frame rendering cycle involves: allocate memory → submit commands → wait for completion',
              'In the kernel, each ioctl number corresponds to a handler function (e.g., amdgpu_cs_ioctl)',
            ],
            explanation: 'Through strace you can directly observe how user-space programs interact with the kernel amdgpu driver via ioctl. This is the most intuitive way to understand the graphics stack layering — you can see every cross-layer call. When you reach Module 5, you\'ll dive deep into analyzing every line of amdgpu_cs_ioctl.',
          },
          miniLab: {
            title: 'Trace Your First GPU Program with strace',
            objective: 'Install glxgears and use strace to trace its ioctl calls, seeing firsthand the Mesa → libdrm → DRM → amdgpu call chain.',
            setup: `# Install glxgears (included in mesa-utils)
sudo apt install mesa-utils strace

# Confirm GPU is working properly
glxinfo | grep "OpenGL renderer"
# Should output something like: OpenGL renderer string: AMD Radeon RX 7600 XT`,
            steps: [
              'Run strace -e ioctl glxgears 2>&1 | head -100 > /tmp/gpu_trace.txt',
              'Open /tmp/gpu_trace.txt and search for lines starting with DRM_IOCTL_AMDGPU',
              'Count different types of ioctl calls: grep -c "AMDGPU_CS" /tmp/gpu_trace.txt',
              'Count calls per second: strace -e ioctl -c glxgears (run for a few seconds then press Ctrl+C)',
              'Compare: run strace -e ioctl -c vkcube (a Vulkan program) to see if Vulkan\'s ioctl pattern differs',
            ],
            expectedOutput: `$ strace -e ioctl -c glxgears
% time     seconds  usecs/call     calls    errors syscall
------ ----------- ----------- --------- --------- -------
 52.34    0.008234         2.1      3820           ioctl
 ...
You can see hundreds of ioctl calls per second, the vast majority being AMDGPU_CS (command submission)`,
            hint: 'If glxgears outputs "Error: couldn\'t get an RGB visual", make sure you\'re using the AMD GPU and not integrated graphics. Run DRI_PRIME=1 glxgears to force using the discrete GPU.',
          },
          debugExercise: {
            title: 'Match Error Messages to the Correct Stack Layer',
            language: 'text',
            description: 'Below are 4 real error messages. Your task is to determine which layer of the graphics stack each message comes from.',
            question: 'Match each error message to the correct stack layer (Mesa / libdrm / DRM Core / amdgpu)',
            buggyCode: `Error message A:
"radeonsi: Failed to create a context."

Error message B:
"[drm:amdgpu_job_timedout] *ERROR* ring gfx_0.0.0 timeout"

Error message C:
"amdgpu_cs_submit_raw: Invalid argument"

Error message D:
"[drm] GPU fault detected: src_id:0, ring:0, vmid:1"`,
            hint: 'Notice each message\'s prefix — radeonsi is Mesa\'s AMD OpenGL driver, amdgpu_cs_submit_raw is a libdrm function, and the [drm] prefix comes from the kernel.',
            answer: 'Answers: A → Mesa (radeonsi is Mesa\'s AMD OpenGL driver; GL context creation failure is typically a user-space issue). B → amdgpu driver (ring timeout is a GPU hang kernel error, from the amdgpu_job_timedout function). C → libdrm (amdgpu_cs_submit_raw is a libdrm function; "Invalid argument" indicates an ioctl parameter error). D → DRM/amdgpu (the [drm] prefix is kernel DRM subsystem logging; GPU fault is an address translation failure reported by amdgpu\'s VM subsystem). In real-world debugging, quickly determining which layer an error comes from is the first step in locating the problem.',
          },
          interviewQ: {
            question: 'Starting from an OpenGL glDrawArrays() call, describe how data travels from the CPU to the GPU and is finally displayed on screen.',
            difficulty: 'medium',
            hint: 'Follow the graphics stack layers: application → Mesa (shader compilation + command packet building) → libdrm (ioctl wrapping) → DRM (ioctl dispatch) → amdgpu (command submission to Ring Buffer) → GPU (execute rendering) → display controller → screen.',
            answer: 'Complete path: (1) Application calls glDrawArrays(GL_TRIANGLES, 0, 3); (2) Mesa radeonsi translates this call into GPU commands: compiles vertex/fragment shaders to GPU ISA (if not already compiled), builds PM4 command packets (set pipeline state, bind shaders, bind vertex buffers, issue draw call), writes command packets to the CS (Command Submission) buffer; (3) When the buffer is full or the application calls SwapBuffers, Mesa calls libdrm\'s amdgpu_cs_submit(); (4) libdrm wraps the parameters and calls ioctl(fd, DRM_IOCTL_AMDGPU_CS, &cs); (5) The kernel DRM layer\'s drm_ioctl() dispatches to amdgpu_cs_ioctl(); (6) The amdgpu driver validates the command buffer, writes it to the GPU\'s GFX Ring Buffer, and writes the Doorbell register to notify the GPU; (7) The GPU\'s Command Processor (CP) reads PM4 commands from the Ring Buffer and drives the Shader Engine to execute rendering; (8) Rendering results are written to the Framebuffer (a block of VRAM); (9) The Display Controller (DCN) reads the Framebuffer during the next VBlank and sends it to the HDMI/DP output; (10) The display shows the image. The entire process completes within 16.7ms (at 60Hz).',
            amdContext: 'This is one of the most classic AMD interview questions. The key to answering is demonstrating you understand each layer\'s responsibilities and how data passes between layers, rather than vaguely saying "it calls the driver and then the GPU draws."',
          },
        },

        // ── Lesson 0.1.3 ──────────────────────────────────────
        {
          id: '0-1-3',
          number: '0.1.3',
          title: "AMD's Open Source Advantage & Career Opportunities",
          titleEn: "AMD's Open Source Advantage & Career Opportunities",
          duration: 15,
          difficulty: 'beginner',
          tags: ['AMD', 'open-source', 'career', 'NVIDIA', 'Intel'],
          concept: {
            summary: 'AMD\'s GPU driver stack (amdgpu + Mesa + ROCm) is fully open source — unique in the GPU industry. This not only makes learning possible, but means you can directly prove your abilities by submitting patches — the most powerful resume material for getting into AMD.',
            explanation: [
              'In the GPU driver space, AMD, NVIDIA, and Intel have vastly different strategies. AMD\'s amdgpu driver is fully open source and merged into the Linux kernel mainline, user-space drivers Mesa radeonsi/radv are also fully open source, and even the ROCm compute framework is open source. This means you can read every line of code, understand every design decision, and even contribute code directly.',
              'NVIDIA\'s situation is completely different. Until 2022, NVIDIA\'s Linux driver was entirely closed source. NVIDIA has now open-sourced the nvidia-open kernel module, but the core GPU firmware and user-space drivers remain closed source. This means you can\'t read most of NVIDIA\'s driver code, and it\'s nearly impossible to contribute patches. The community-maintained nouveau driver has limited functionality due to lack of hardware documentation.',
              'Intel\'s GPU drivers (i915/xe) are also fully open source, but Intel has a small market share in discrete GPUs (Arc series) and almost no presence in high-performance computing. Intel driver engineering positions are also relatively fewer than AMD\'s.',
              'For your career development, AMD\'s open-source strategy means: (1) You can build a public contribution record by submitting accepted kernel patches — more convincing than any interview technique; (2) You can read real driver code during your learning process, rather than relying on second-hand documentation; (3) AMD\'s Markham (Canada) and Shanghai offices continuously hire GPU driver engineers, especially candidates with actual kernel contribution experience.',
              'The amd-gfx mailing list (amd-gfx@lists.freedesktop.org) has 30-50 patch submissions daily, where you can see what problems AMD engineers encounter in their actual work and how they solve them. Subscribing to this mailing list is like having a free AMD internal training resource.',
            ],
            keyPoints: [
              'AMD: Fully open source (amdgpu + Mesa + ROCm), code in Linux mainline',
              'NVIDIA: Core is closed source, nvidia-open is only partial, learning and contribution are limited',
              'Intel: Open source (i915/xe), but small discrete GPU market share, relatively fewer positions',
              'Accepted kernel patches are the strongest proof for AMD job applications',
              'amd-gfx mailing list is a free "internal training" resource, 30-50 patches daily',
              'AMD Markham / Shanghai continuously hiring GPU driver engineers',
            ],
          },
          diagram: {
            title: 'AMD vs NVIDIA vs Intel Open Source Strategy Comparison',
            content: `GPU Driver Open Source Comparison

                AMD                   NVIDIA                Intel
            ─────────              ──────────             ─────────
Kernel Driver   ████████████          ██████░░░░            ████████████
             amdgpu (open)         nvidia-open(partial)  i915/xe (open)
             Linux mainline        Out-of-tree module     Linux mainline

User Drivers    ████████████          ░░░░░░░░░░            ████████████
             Mesa radeonsi         Closed source          Mesa iris
             Mesa radv             (libGL/libcuda)        Mesa anv
             Fully open source     Cannot read            Fully open source

Compute         ████████████          ░░░░░░░░░░            ████████████
             ROCm (open)           CUDA (closed)          oneAPI (open)
             HIP API               Industry standard      SYCL

Firmware        ████████░░            ░░░░░░░░░░            ████████░░
             Mostly public         Completely closed      Mostly public
             (binary blobs)        (signed verification)

HW Docs         ████████░░            ░░░░░░░░░░            ██████████
             Radeon ISA docs       Almost no public docs  Open docs
             GPUOpen resources

Driver          ★★★★★                ★☆☆☆☆               ★★★★☆
Learning        Best choice          Nearly impossible      Feasible but fewer jobs

█ = Open Source    ░ = Closed Source

Conclusion: AMD is the only practical choice for learning GPU driver development
  ✓ All code readable  ✓ All patches submittable  ✓ Active public discussion`,
            caption: 'Open source strategy comparison of the three major GPU vendors. AMD has the highest degree of openness across all dimensions, making independent learning and contribution possible.',
          },
          codeWalk: {
            title: 'Reading a Real amd-gfx Mailing List Patch',
            file: 'amd-gfx mailing list',
            language: 'text',
            code: `From: Harry Wentland <harry.wentland@amd.com>
Subject: [PATCH] drm/amd/display: fix cursor position calculation

When the cursor is on an overlay plane that has been
scaled, the cursor position needs to be adjusted by the
scaling factor. Without this fix, the cursor appears at
the wrong position on scaled overlays.

The issue was introduced in commit abc123 which added
overlay scaling support but forgot to update the cursor
position calculation.

Fixes: abc123def456 ("drm/amd/display: add overlay scaling")
Signed-off-by: Harry Wentland <harry.wentland@amd.com>
Reviewed-by: Alex Deucher <alexander.deucher@amd.com>
---
 drivers/gpu/drm/amd/display/dc/core/dc.c | 5 +++--
 1 file changed, 3 insertions(+), 2 deletions(-)

diff --git a/drivers/gpu/drm/amd/display/dc/core/dc.c
--- a/drivers/gpu/drm/amd/display/dc/core/dc.c
+++ b/drivers/gpu/drm/amd/display/dc/core/dc.c
@@ -1234,8 +1234,9 @@ void dc_update_cursor(...)
     if (overlay->scaling_enabled) {
-        pos_x = cursor->x;
-        pos_y = cursor->y;
+        /* Adjust cursor position for overlay scaling */
+        pos_x = cursor->x * overlay->h_scale;
+        pos_y = cursor->y * overlay->v_scale;
     }`,
            annotations: [
              'This is a real patch format from the AMD display team — the Subject starts with "drm/amd/display:"',
              'The commit message explains What (what it fixes) and Why (why the fix is needed), not How (how it was fixed)',
              'The Fixes: tag references the original commit that introduced the bug, helping maintainers decide whether to backport',
              'Signed-off-by is a legal declaration; Reviewed-by indicates someone has already reviewed the patch',
              'The diff shows only 3 lines of code changed — most kernel patches are small, precise modifications like this',
              'Alex Deucher is AMD\'s chief amdgpu driver maintainer; seeing his Reviewed-by means the patch quality is approved',
            ],
            explanation: 'This is the format you\'ll use when submitting patches in the future. Notice the patch is small (3 lines changed), but the commit message is written very clearly. The kernel community values code correctness and commit message clarity over code volume. Your first patch might also be just a few lines.',
          },
          miniLab: {
            title: 'Explore the amd-gfx Mailing List and amdgpu Source Scale',
            objective: 'Browse the amd-gfx mailing list and kernel source code firsthand to feel the scale of the amdgpu driver and the community\'s activity level.',
            steps: [
              'Visit https://lists.freedesktop.org/archives/amd-gfx/ to browse recent mailing list archives',
              'Find an email with a subject starting with [PATCH] drm/amd and read the commit message',
              'Clone the Linux kernel source (shallow clone to save space): git clone --depth=1 https://github.com/torvalds/linux.git',
              'Count amdgpu driver lines of code: find linux/drivers/gpu/drm/amd/ -name "*.c" -o -name "*.h" | xargs wc -l | tail -1',
              'Count file count: find linux/drivers/gpu/drm/amd/ -name "*.c" -o -name "*.h" | wc -l',
              'View recent amdgpu commits: cd linux && git log --oneline --since="1 week ago" -- drivers/gpu/drm/amd/ | head -20',
            ],
            expectedOutput: `$ find linux/drivers/gpu/drm/amd/ -name "*.c" -o -name "*.h" | xargs wc -l | tail -1
 4200000+ total   ← Over 4 million lines of code!

$ find linux/drivers/gpu/drm/amd/ -name "*.c" -o -name "*.h" | wc -l
 3500+            ← Over 3500 source files

$ git log --oneline --since="1 week ago" -- drivers/gpu/drm/amd/ | wc -l
 50+              ← ~50+ commits per week (very active)`,
            hint: 'git clone --depth=1 downloads only the latest version, ~200MB (full history > 3GB). If your connection is slow, you can browse the drivers/gpu/drm/amd/ directory directly on GitHub\'s web interface.',
          },
          debugExercise: {
            title: 'Determine Component Open/Closed Source Status',
            language: 'text',
            description: 'Below are 8 components from the AMD GPU driver stack. Determine whether each component is open source or closed source.',
            question: 'Mark each component as "Open Source" or "Closed Source"',
            buggyCode: `1. amdgpu kernel driver (drivers/gpu/drm/amd/)      → ???
2. AMD GPU firmware (amdgpu firmware blobs)          → ???
3. Mesa radeonsi (OpenGL driver)                    → ???
4. Mesa radv (Vulkan driver)                        → ???
5. ROCm HIP runtime                                → ???
6. AMD Display Core (DC) module                     → ???
7. LLVM AMDGPU backend                               → ???
8. AMD SMU firmware (System Management Unit)          → ???`,
            hint: 'Most components are open source, but firmware is a special case — although published as binary blobs, it is not source-code-level open source.',
            answer: 'Answers: 1. Open Source (GPL, merged into Linux kernel mainline). 2. Closed Source (published as binary blobs in the linux-firmware repository; you must accept AMD\'s license agreement, but source code is not provided). 3. Open Source (MIT license, in the Mesa repository). 4. Open Source (MIT license, in the Mesa repository). 5. Open Source (MIT license, under the ROCm GitHub organization). 6. Open Source (GPL, part of the amdgpu driver, though the DC module\'s code style differs slightly from the rest of the kernel because it was originally ported from the Windows driver). 7. Open Source (Apache 2.0 license, in the LLVM project). 8. Closed Source (SMU firmware controls GPU power management, provided as binary blobs; the driver communicates with it through the SMU message interface). Key understanding: although firmware is not source-code open source, the interface between the driver and firmware is fully open source, so you can still understand how the driver controls GPU power management.',
          },
          interviewQ: {
            question: 'Why did AMD choose to open source its GPU drivers? What benefits does this bring to AMD and the Linux community respectively?',
            difficulty: 'easy',
            hint: 'Answer from the perspectives of business strategy (attracting Linux users and developers), engineering efficiency (community contributions and bug discovery), and ecosystem building (ROCm competing with CUDA).',
            answer: 'Benefits for AMD: (1) Reduced maintenance costs — after the driver is merged into the Linux mainline, it\'s maintained by the kernel community collectively, eliminating the need to package drivers separately for each Linux distribution; (2) Improved quality — thousands of kernel developers can discover and fix bugs, and submit performance optimizations; (3) Attracting Linux users — the Linux server market and AI compute market are huge, and open source drivers make AMD GPUs the preferred choice for Linux users; (4) ROCm ecosystem — open source ROCm is the strategy for competing with NVIDIA\'s CUDA, requiring an open source kernel driver as the foundation. Benefits for the Linux community: (1) Hardware support — AMD GPUs work out of the box when new Linux kernels are released, without needing closed source driver installation; (2) Learning resources — complete driver source code is a valuable textbook for learning GPU architecture and driver development; (3) Security auditing — open source code can be reviewed by security researchers, reducing security vulnerabilities.',
            amdContext: 'AMD interviewers may ask this question to evaluate your understanding of AMD\'s corporate strategy. Demonstrate that you\'re not just a coder, but also understand the business logic behind technology decisions.',
          },
        },
      ],
    },

    // ════════════════════════════════════════════════════════════
    // Group 0.2: Know Your Hardware
    // ════════════════════════════════════════════════════════════
    {
      id: '0-2',
      number: '0.2',
      title: 'Know Your Hardware',
      titleEn: 'Know Your Hardware',
      icon: 'Plug',
      description: 'Get hands-on with your AMD GPU (using the RX 7600 XT / Navi33 as an example) — from PCI bus discovery to dmesg log analysis, to understanding the complete amdgpu driver startup sequence.',
      lessons: [
        // ── Lesson 0.2.1 ──────────────────────────────────────
        {
          id: '0-2-1',
          number: '0.2.1',
          title: 'Identifying Your RX 7600 XT',
          titleEn: 'Identifying Your RX 7600 XT',
          duration: 15,
          difficulty: 'beginner',
          tags: ['PCI', 'lspci', 'sysfs', 'device-id'],
          concept: {
            summary: 'Linux discovers GPUs through the PCI bus. Each PCI device has a unique Vendor ID + Device ID combination, and the amdgpu driver claims hardware by matching these IDs. This section uses the RX 7600 XT (Device ID 0x7480 / CHIP_NAVI33) as an example; the same method applies to all AMD GPUs.',
            explanation: [
              'Throughout this platform, we use the RX 7600 XT (Navi33 / gfx1102) as our running example because it\'s a widely available, affordable RDNA3 GPU. If you have a different AMD GPU, the same concepts apply — just substitute your GPU\'s Device ID, chip codename, and IP version. You can find your GPU\'s specifics using: lspci -nn | grep AMD. When a computer starts up, one of the first things the CPU does is scan all devices on the PCI bus. Each PCI device (GPU, network card, sound card, etc.) has a set of standard identification information stored in its PCI Configuration Space. The two most important are the Vendor ID (manufacturer identifier) and Device ID (device model identifier). AMD\'s Vendor ID is uniformly 0x1002; different GPU models have their own Device IDs (e.g., RX 7600 XT is 0x7480, RX 7900 XTX is 0x744C).',
              'After the kernel boots, the PCI subsystem enumerates all devices and attempts to find a matching driver for each one. The amdgpu driver maintains a PCI device ID table (pciidlist[]) in amdgpu_drv.c, listing all supported AMD GPU Device IDs. When the PCI subsystem discovers a device with Vendor ID=0x1002 and Device ID=0x7480, it knows the amdgpu driver can handle this device, and calls the amdgpu_pci_probe() function to initialize it.',
              'Each PCI device also has a BDF address (Bus:Device.Function), such as 03:00.0, representing PCI bus 3, device 0, function 0. This address is visible in lspci output and under /sys/bus/pci/devices/. For debugging purposes, the BDF address is key to locating a specific device.',
              'Beyond the Vendor/Device ID, the PCI Configuration Space also contains the Class Code (device type; GPU is 0x0300 "VGA controller"), Subsystem Vendor/Device ID (subsystem identifier, distinguishing different brand cards using the same chip), BAR (Base Address Register, the memory window addresses the GPU exposes), and more. All of this information is visible in lspci -v output.',
            ],
            keyPoints: [
              'PCI devices are uniquely identified by Vendor ID (0x1002=AMD) + Device ID (0x7480=Navi33)',
              'The amdgpu driver\'s pciidlist[] table maps Device IDs to internal enum values like CHIP_NAVI33',
              'BDF address (Bus:Device.Function) such as 03:00.0 is used to locate specific PCI devices in the system',
              'PCI Configuration Space = 256-byte standard header (Vendor/Device ID, BAR, Class Code, etc.)',
              'BAR registers define the memory windows the GPU exposes to the CPU (VRAM BAR, Register BAR, Doorbell BAR)',
              '/sys/bus/pci/devices/ and /sys/class/drm/ are the sysfs interfaces through which the kernel exposes PCI information',
            ],
          },
          diagram: {
            title: 'PCI Device Discovery and Driver Matching Flow',
            content: `PCI Device Discovery → Driver Matching → Initialization Flow

System Boot
   │
   ▼
PCI Subsystem Scans Bus
   │
   ├─ Bus 00: Host Bridge
   ├─ Bus 01: NVMe SSD [8086:xxxx] → nvme driver
   ├─ Bus 02: NIC       [8086:xxxx] → e1000e driver
   └─ Bus 03: GPU       [1002:7480] → ???
                            │
                            ▼
              Search for matching driver (search all registered pci_drivers)
                            │
              amdgpu's pciidlist matches:
              ┌─────────────────────────────────────────┐
              │ {0x1002, 0x7480, ..., CHIP_NAVI33}      │
              │  ↑ AMD    ↑ Navi33         ↑ Internal   │
              │                              chip type   │
              └─────────────────────────────────────────┘
                            │
                            ▼
              Call amdgpu_pci_probe(pdev, ent)
              │
              ├─ pci_enable_device(pdev)     → Enable PCI device
              ├─ pci_set_master(pdev)        → Allow GPU to do DMA
              ├─ pci_ioremap_bar(pdev, 0)    → Map VRAM BAR
              ├─ pci_ioremap_bar(pdev, 2)    → Map Register BAR
              └─ amdgpu_device_init(adev)    → Initialize all IP Blocks

lspci output example:
03:00.0 VGA compatible controller [0300]:
  Advanced Micro Devices [AMD/ATI] Navi33 [Radeon RX 7600/7600 XT] [1002:7480]
  │           │                                                      │    │
  └─ BDF     └─ Class Code                                          │    └─ Device ID
              0300 = VGA                              Vendor ID ─────┘`,
            caption: 'The complete PCI device discovery and driver matching flow. The kernel finds the amdgpu driver through Vendor:Device ID matching, then calls the probe function to initialize the GPU.',
          },
          codeWalk: {
            title: 'The amdgpu PCI Device ID Table',
            file: 'drivers/gpu/drm/amd/amdgpu/amdgpu_drv.c',
            language: 'c',
            code: `/* amdgpu_drv.c — PCI Device ID Table (simplified)
 * The full table has hundreds of entries, covering GCN through RDNA4
 */
static const struct pci_device_id pciidlist[] = {
    /* GCN 5.0 - Vega */
    {0x1002, 0x6860, PCI_ANY_ID, PCI_ANY_ID, 0, 0, CHIP_VEGA10},

    /* RDNA 2 - Navi 21 (RX 6800 XT / 6900 XT) */
    {0x1002, 0x73BF, PCI_ANY_ID, PCI_ANY_ID, 0, 0, CHIP_NAVI21},

    /* RDNA 3 - Navi 31 (RX 7900 XTX) */
    {0x1002, 0x744C, PCI_ANY_ID, PCI_ANY_ID, 0, 0, CHIP_NAVI31},

    /* RDNA 3 - Navi 33 (RX 7600 XT) ← Your GPU! */
    {0x1002, 0x7480, PCI_ANY_ID, PCI_ANY_ID, 0, 0, CHIP_NAVI33},
    {0x1002, 0x7483, PCI_ANY_ID, PCI_ANY_ID, 0, 0, CHIP_NAVI33},
    /*  ↑         ↑        ↑          ↑              ↑
     * Vendor  Device  Subvendor  Subdevice      ASIC type
     * 0x1002  0x7480  any        any            CHIP_NAVI33
     * = AMD   = Navi33                         → selects gfx_v11_0
     *                                           → selects sdma_v6_0
     *                                           → selects dcn_3_2
     */

    {0, 0, 0}  /* Terminator */
};
MODULE_DEVICE_TABLE(pci, pciidlist);

/* The CHIP_NAVI33 enum value determines which IP Blocks the driver loads:
 *   GFX → gfx_v11_0.c (RDNA3 graphics engine)
 *   SDMA → sdma_v6_0.c (DMA engine)
 *   DC → dcn32 (display controller)
 *   VCN → vcn_v4_0.c (video encode/decode)
 *   SMU → smu_v13_0.c (power management)
 */`,
            annotations: [
              'Each row defines a supported GPU: Vendor ID + Device ID + ASIC type',
              'PCI_ANY_ID means no restriction on Subsystem Vendor/Device; any card using that chip will match',
              'CHIP_NAVI33 is an internal enum value; in amdgpu_device_init it determines which IP Block implementations to load',
              'MODULE_DEVICE_TABLE exports this table so that modprobe and udev can automatically load the correct driver',
              'The same chip (Navi33) may have multiple Device IDs (0x7480, 0x7483), corresponding to different SKUs',
            ],
            explanation: 'This device ID table is the entry point of the amdgpu driver — it tells the kernel "which GPUs I can handle." When the kernel finds your RX 7600 XT (0x1002:0x7480) on the PCI bus, it looks up this table and matches CHIP_NAVI33. This information is then passed to amdgpu_device_init(), which loads the RDNA3 IP Block implementations (gfx_v11_0, sdma_v6_0, etc.) based on CHIP_NAVI33.',
          },
          miniLab: {
            title: 'Fully Identify Your GPU Hardware Information',
            objective: 'Use multiple tools to get complete hardware information for the RX 7600 XT, and find the corresponding entry in the kernel source code.',
            steps: [
              'Run lspci -nn | grep -i "vga\\\\|3d\\\\|display", note the BDF address and [Vendor:Device] ID',
              'View detailed information: lspci -v -s <BDF> (replace <BDF> with the address from the previous step, e.g., 03:00.0)',
              'Find lines starting with "Memory at" in the output — these are BAR addresses',
              'View sysfs information: ls /sys/class/drm/card0/device/ (list all readable attribute files)',
              'Read key attributes: cat /sys/class/drm/card0/device/uevent (driver name, PCI ID, etc.)',
              'If you\'ve already cloned the kernel source: grep -n "0x7480" drivers/gpu/drm/amd/amdgpu/amdgpu_drv.c',
            ],
            expectedOutput: `$ lspci -nn | grep -i "vga\\\\|3d"
03:00.0 VGA compatible controller [0300]: ... [1002:7480] (rev c7)

$ lspci -v -s 03:00.0 | grep "Memory at"
  Memory at d0000000 (64-bit, prefetchable) [size=256M]  ← BAR 0: VRAM
  Memory at e0000000 (64-bit, non-prefetchable) [size=2M] ← BAR 2: Registers
  Memory at e0200000 (64-bit, non-prefetchable) [size=2M] ← BAR 4: Doorbell

$ cat /sys/class/drm/card0/device/uevent
DRIVER=amdgpu
PCI_ID=1002:7480
PCI_SUBSYS_ID=...`,
            hint: 'If your system has multiple GPUs (e.g., integrated + discrete), make sure you\'re viewing the correct device. card0 might be the integrated GPU; card1 may be your discrete AMD GPU.',
          },
          debugExercise: {
            title: 'Fix the Incorrect PCI Device ID Entry',
            language: 'c',
            description: 'The following code adds an entry to pciidlist for a new AMD GPU, but contains an error that prevents the driver from matching the GPU.',
            question: 'Find out why this new GPU cannot be recognized by the amdgpu driver.',
            buggyCode: `/* Add device ID support for a new GPU "Navi99" */
static const struct pci_device_id pciidlist[] = {
    /* ... other entries ... */

    /* New: Navi99 (hypothetical Device ID 0x9900) */
    {0x1002, 0x9900, PCI_ANY_ID, PCI_ANY_ID, 0, 0, CHIP_NAVI33},

    {0, 0, 0}  /* Terminator */

    /* Forgot to recompile before insmod! */
    /* Also CHIP type should be CHIP_NAVI99 not CHIP_NAVI33 */
};`,
            hint: 'This problem has two layers: one is at the data level (wrong CHIP type), and one is at the process level (what do you need to do after modifying kernel code?).',
            answer: 'Two issues: (1) Wrong CHIP type: CHIP_NAVI33 is used instead of CHIP_NAVI99 (assuming it\'s been defined). This would cause the driver to load the Navi33 IP Block implementations (gfx_v11_0, etc.) for the new GPU, but the new GPU may need different IP versions, causing initialization failure or abnormal hardware behavior. (2) Process issue: after modifying kernel source code, you must recompile the kernel (or at least recompile the amdgpu module: make M=drivers/gpu/drm/amd), then reload the module (sudo rmmod amdgpu && sudo modprobe amdgpu) or restart the system. Running insmod with the old .ko file won\'t include your changes. Additionally, the MODULE_DEVICE_TABLE macro needs to run to update the device table so modprobe knows about the new Device ID.',
          },
          interviewQ: {
            question: 'Explain how the Linux kernel discovers PCI devices and matches them with the correct driver. Use amdgpu as an example.',
            difficulty: 'medium',
            hint: 'Describe the PCI enumeration → device ID matching → probe call flow, mentioning pciidlist, MODULE_DEVICE_TABLE, and pci_register_driver.',
            answer: 'The flow: (1) BIOS/UEFI completes PCI bus enumeration, writing device information into PCI Configuration Space; (2) The Linux kernel\'s PCI subsystem (drivers/pci/) scans all buses, creating a struct pci_dev for each device containing Vendor ID, Device ID, and other information; (3) The amdgpu driver calls pci_register_driver(&amdgpu_kms_pci_driver) in module_init, registering itself and its id_table (pciidlist); (4) The PCI subsystem matches each device\'s Vendor:Device ID against all registered drivers\' id_tables; (5) When a match is found (e.g., 0x1002:0x7480 matches CHIP_NAVI33), the driver\'s probe function (amdgpu_pci_probe) is called; (6) The probe function receives the pci_dev and matching pci_device_id, extracts the CHIP type, and initializes the GPU. The MODULE_DEVICE_TABLE macro exports pciidlist to the module\'s ELF section, allowing depmod and modprobe to know which devices the module supports without loading it, enabling automatic driver loading.',
            amdContext: 'This question tests your understanding of the Linux driver model. In AMD interviews, demonstrating that you know the complete path from PCI enumeration to amdgpu_pci_probe will impress the interviewer.',
          },
        },

        // ── Lesson 0.2.2 ──────────────────────────────────────
        {
          id: '0-2-2',
          number: '0.2.2',
          title: 'Reading dmesg — Your First Debugging Tool',
          titleEn: 'Reading dmesg — Your First Debugging Tool',
          duration: 15,
          difficulty: 'beginner',
          tags: ['dmesg', 'debugging', 'printk', 'kernel-log'],
          concept: {
            summary: 'dmesg is the kernel\'s ring log buffer, recording all messages the kernel has emitted from system boot to now. For GPU driver development, dmesg is both the most basic and the most important debugging tool — GPU initialization status, error messages, and hang diagnostic information are all found here.',
            explanation: [
              'The kernel doesn\'t have printf, but it has printk — it works similarly to printf, but outputs to the kernel\'s ring buffer rather than the terminal. The dmesg command reads this buffer. Buffer size is typically 128KB-1MB; when the buffer is full, old messages are overwritten by new ones.',
              'Each kernel message has a log level (0-7): KERN_EMERG(0) through KERN_DEBUG(7). The amdgpu driver uses various log macros: DRM_INFO (general information, e.g., driver loaded successfully), DRM_WARN (warnings, e.g., performance degradation), DRM_ERROR (errors, e.g., GPU hang), DRM_DEBUG_DRIVER (debug information, disabled by default).',
              'When the amdgpu driver loads (at system boot or via modprobe amdgpu), it prints extensive initialization information in dmesg: detected GPU model, firmware versions, VRAM size, IP Block initialization status, display connector states, etc. This information is the primary source for diagnosing driver issues.',
              'If the GPU encounters problems (such as hangs or display anomalies), dmesg will typically contain related error messages. Learning to quickly locate key information in dmesg — searching for "amdgpu", "error", "hang", "timeout", "fault" — is the most fundamental skill for a GPU driver developer.',
            ],
            keyPoints: [
              'dmesg reads the kernel\'s ring log buffer, containing all kernel messages from boot to present',
              'Log levels 0-7: EMERG > ALERT > CRIT > ERR > WARN > NOTICE > INFO > DEBUG',
              'amdgpu uses DRM_INFO/WARN/ERROR/DEBUG_DRIVER macros for log output',
              'dmesg | grep -i amdgpu is the first step in diagnosing GPU issues',
              'During GPU hangs, dmesg will contain register dumps (GRBM_STATUS, CP_RB_RPTR/WPTR)',
              'Dynamic debugging: echo "module amdgpu +p" > /sys/kernel/debug/dynamic_debug/control',
            ],
          },
          diagram: {
            title: 'amdgpu Initialization dmesg Log Flow',
            content: `amdgpu Driver Loading dmesg Log (annotated with source functions)

Time           Log Content                                    Source
──────         ────────                                    ────
[  2.301]  amdgpu 0000:03:00.0: enabling device          pci_enable_device
[  2.301]  [drm] amdgpu kernel modesetting enabled.       amdgpu_drv.c
[  2.302]  [drm] initializing kernel modesetting          amdgpu_device_init
                   (NAVI33, 0x1002:0x7480, ...)

[  2.350]  amdgpu: Fetched ucodes:                        amdgpu_ucode.c
           amdgpu:   GFX CP RS64 fw version...            ← GPU firmware loading
           amdgpu:   SDMA firmware version...
           amdgpu:   VCN firmware version...

[  2.400]  [drm] VRAM: 8176M                              amdgpu_gmc.c
           [drm] VRAM width 128bits GDDR6                 ← VRAM info
           [drm] GTT: 8176M

[  2.450]  [drm] PSP is alive!                            psp_v13_0.c
           [drm] Loading GFX firmware...                   ← IP Block init
           [drm] Loading SDMA firmware...

[  2.600]  [drm] Display Core initialized                 dc/dc.c
           [drm] Connector 0: DP-1 (connected)            ← Display detection
           [drm] Connector 1: HDMI-A-1 (disconnected)

[  2.700]  [drm] fb0: amdgpudrmfb frame buffer            ← Framebuffer ready
           [drm] Initialized amdgpu ...                    ← Driver loaded ✓

On error you'll see:
[  2.500]  [drm:amdgpu_device_init] *ERROR* ...           ← Init failure
[  2.500]  amdgpu: probe of 0000:03:00.0 failed           ← Probe failure`,
            caption: 'Complete dmesg log flow during amdgpu driver loading. Each log entry corresponds to a printk call in the driver code. Learning to read these logs is fundamental to debugging.',
          },
          codeWalk: {
            title: 'Parse Your Own amdgpu dmesg Output',
            file: 'terminal',
            language: 'bash',
            code: `# View all amdgpu driver startup messages
dmesg | grep -i amdgpu

# Show only errors and warnings
dmesg --level=err,warn | grep -i amdgpu

# View firmware loading information
dmesg | grep -i "firmware\\\\|ucode\\\\|fw version"

# View VRAM and memory configuration
dmesg | grep -i "vram\\\\|gtt\\\\|memory"

# View display connector status
dmesg | grep -i "connector\\\\|display\\\\|hdmi\\\\|dp-"

# View IP Block initialization
dmesg | grep -i "psp\\\\|gfx\\\\|sdma\\\\|vcn\\\\|dcn\\\\|smu"

# Monitor new amdgpu messages in real-time
sudo dmesg -w | grep -i amdgpu

# Save complete amdgpu log to file (essential for debugging)
dmesg | grep -i amdgpu > ~/amdgpu_dmesg.log`,
            annotations: [
              'dmesg --level=err,warn shows only error and warning levels, quickly pinpointing problems',
              '"firmware" and "ucode" keywords correspond to GPU firmware loading — firmware load failures are a common issue',
              'The number in "VRAM: 8176M" isn\'t 8192 because a portion of VRAM is reserved by firmware and system',
              'dmesg -w is watch mode, showing new messages in real-time — very useful during testing',
              'Saving to a file is essential when submitting bug reports, which must include complete dmesg output',
            ],
            explanation: 'These commands are ones you\'ll use daily as a GPU driver developer. When a user reports a GPU issue, your first reaction should be "what does dmesg say?" Learning to quickly extract key information from dmesg is the foundation of efficient debugging.',
          },
          miniLab: {
            title: 'Create Your GPU Hardware Profile',
            objective: 'Collect complete hardware information for the RX 7600 XT and save it as a structured profile. This information will be used repeatedly in subsequent modules.',
            steps: [
              'Create directory: mkdir -p ~/amd-driver-journey/hardware-info',
              'Save PCI info: lspci -v -s $(lspci | grep -i amd | cut -d " " -f1) > ~/amd-driver-journey/hardware-info/lspci.txt',
              'Save dmesg: dmesg | grep -i amdgpu > ~/amd-driver-journey/hardware-info/dmesg_amdgpu.txt',
              'Save sysfs info: cat /sys/class/drm/card0/device/uevent > ~/amd-driver-journey/hardware-info/sysfs_uevent.txt',
              'Save GPU state: cat /sys/class/drm/card0/device/pp_dpm_sclk > ~/amd-driver-journey/hardware-info/gpu_clocks.txt',
              'Check all files: ls -la ~/amd-driver-journey/hardware-info/',
            ],
            expectedOutput: `$ ls -la ~/amd-driver-journey/hardware-info/
-rw-r--r-- 1 user user 2048  lspci.txt
-rw-r--r-- 1 user user 4096  dmesg_amdgpu.txt
-rw-r--r-- 1 user user  256  sysfs_uevent.txt
-rw-r--r-- 1 user user  128  gpu_clocks.txt`,
            hint: 'If you\'re using a machine without an AMD GPU (e.g., a laptop), you can load the amdgpu driver in a VM to simulate partial output. But the best way to learn is with real hardware.',
          },
          debugExercise: {
            title: 'Diagnose Driver Load Failure from dmesg',
            language: 'text',
            description: 'Below is a dmesg output from a failed amdgpu driver load. Find the cause of the failure.',
            question: 'Why did the GPU driver fail to load? Hint: focus on the firmware-related lines.',
            buggyCode: `[  2.301] amdgpu 0000:03:00.0: enabling device (0000 -> 0003)
[  2.301] [drm] amdgpu kernel modesetting enabled.
[  2.302] [drm] initializing kernel modesetting (NAVI33 0x1002:0x7480)
[  2.350] amdgpu 0000:03:00.0: Direct firmware load for
          amdgpu/psp_13_0_7_sos.bin failed with error -2
[  2.350] amdgpu 0000:03:00.0: amdgpu: PSP software on
          loading failed!
[  2.351] [drm:amdgpu_device_init [amdgpu]] *ERROR*
          hw_init of IP block <psp> failed -2
[  2.351] amdgpu 0000:03:00.0: amdgpu: amdgpu_device_ip_init failed
[  2.352] amdgpu: probe of 0000:03:00.0 failed with error -2`,
            hint: 'Error -2 in Linux is -ENOENT (file not found). What does "Direct firmware load failed" mean?',
            answer: 'Problem: Missing GPU firmware file. dmesg shows "Direct firmware load for amdgpu/psp_13_0_7_sos.bin failed with error -2"; error code -2 = -ENOENT (No such file or directory). This indicates the kernel cannot find the PSP (Platform Security Processor) firmware file psp_13_0_7_sos.bin under /lib/firmware/amdgpu/. The PSP is the GPU\'s security processor; PSP firmware must be loaded before other IP Blocks can initialize. Solution: install the correct version of the linux-firmware package (sudo apt install linux-firmware). If you\'re using the latest kernel but the firmware package is older, you may need to manually download the latest firmware from the linux-firmware git repository. This is one of the most common issues when running Linux on new hardware.',
          },
          interviewQ: {
            question: 'When a user reports that the GPU driver won\'t load, how would you begin debugging? Describe your first 5 steps.',
            difficulty: 'medium',
            hint: 'A systematic debugging flow from information gathering (dmesg, system info) to problem classification (firmware, hardware, configuration).',
            answer: 'First 5 debugging steps: (1) Collect dmesg: dmesg | grep -i "amdgpu\\\\|drm\\\\|error\\\\|fail" > /tmp/gpu_debug.log. First look for obvious error messages (e.g., firmware load failed, probe failed). (2) Confirm hardware is detected: lspci -nn | grep AMD. If lspci doesn\'t show the GPU, the problem is at the PCI layer (BIOS settings, physical connection, PCIe slot). (3) Confirm driver is loaded: lsmod | grep amdgpu. If not, check if the kernel was compiled with amdgpu (zgrep AMDGPU /proc/config.gz or modinfo amdgpu). (4) Check firmware: ls /lib/firmware/amdgpu/ | wc -l. Missing firmware is the most common cause of load failure, especially with new hardware or self-compiled kernels. (5) Check kernel version: uname -r. New GPUs often require a newer kernel and linux-firmware combination for support (refer to your distro\'s support matrix for recommended versions). If the first 5 steps don\'t locate the problem, enable dynamic debugging (echo "module amdgpu +p" > dynamic_debug/control) for more detailed logs.',
            amdContext: 'This kind of systematic debugging approach is highly valued in AMD interviews. Interviewers want to see not "I\'ll Google the error message," but a structured diagnostic process.',
          },
        },
      ],
    },

    // ════════════════════════════════════════════════════════════
    // Group 0.3: Development Environment
    // ════════════════════════════════════════════════════════════
    {
      id: '0-3',
      number: '0.3',
      title: 'Development Environment Setup',
      titleEn: 'Development Environment Setup',
      icon: '🛠️',
      description: 'Set up a complete kernel development environment: tool installation, kernel source acquisition, and code navigation configuration. This is the foundation for all subsequent modules.',
      lessons: [
        // ── Lesson 0.3.1 ──────────────────────────────────────
        {
          id: '0-3-1',
          number: '0.3.1',
          title: 'Building Your Kernel Dev Workspace',
          titleEn: 'Building Your Kernel Dev Workspace',
          duration: 20,
          difficulty: 'beginner',
          tags: ['kernel', 'build', 'toolchain', 'git'],
          concept: {
            summary: 'A complete kernel development environment requires: a compilation toolchain (gcc/clang, make), kernel source code (git clone), code navigation tools (cscope/ctags or clangd), and a safe testing environment (KVM virtual machine or dedicated test machine). This section guides you through setting up this environment step by step.',
            explanation: [
              'Kernel development has one fundamental difference from regular application development: your code runs in kernel space, and a single null pointer dereference can crash the entire system (Kernel Panic). Therefore, a safe testing environment is crucial. The recommended approach is to use KVM/QEMU virtual machines for risky kernel experiments — load your modified kernel or modules in the VM, and even if it crashes, you just need to restart the VM.',
              'The toolchain required for kernel compilation includes: gcc or clang (compiler), make (build system), flex and bison (lexer/parser generators needed by the kernel configuration system), libelf-dev and libssl-dev (ELF processing and signature verification), and bc (math calculations in build scripts). For amdgpu development, you also need libdrm-dev and xserver-xorg-dev (if you\'re running IGT tests).',
              'There are several ways to obtain kernel source code: (1) Linus Torvalds\' mainline repository (latest stable): git clone https://github.com/torvalds/linux.git; (2) AMD\'s drm-next branch (latest amdgpu development): git clone https://gitlab.freedesktop.org/agd5f/linux.git --branch amd-staging-drm-next; (3) Shallow clone (saves space): add the --depth=1 parameter. AMD\'s drm-next branch contains the latest amdgpu patches not yet merged into Linus\' mainline — this is the recommended source base for amdgpu development.',
              'Code navigation is key to efficiently reading kernel code. Two recommended approaches: (1) cscope + ctags (classic): run make cscope && make tags at the kernel source root, then jump to function definitions and find references in vim/emacs; (2) clangd (modern): run scripts/clang-tools/gen_compile_commands.py to generate compile_commands.json, then VS Code\'s clangd extension provides intelligent completion and navigation.',
            ],
            keyPoints: [
              'Safety first: use KVM virtual machines to test modified kernels, avoid breaking your host',
              'Required tools: gcc/clang, make, flex, bison, libelf-dev, libssl-dev, bc, git',
              'Recommended source: AMD drm-next branch (contains latest amdgpu patches)',
              'Code navigation: cscope+ctags (vim/emacs) or clangd (VS Code)',
              'Kernel compilation: make defconfig → make -j$(nproc) → about 10-30 minutes',
              'Module-only compilation: make M=drivers/gpu/drm/amd compiles only the amdgpu module',
            ],
          },
          diagram: {
            title: 'Kernel Development Workflow',
            content: `Kernel Development Daily Workflow

┌─────────────────────────────────────────────────────────────┐
│  1. Obtain Source Code                                       │
│  git clone --depth=1                                        │
│    https://gitlab.freedesktop.org/agd5f/linux.git           │
│    --branch amd-staging-drm-next                            │
│                                                              │
│  Directory Structure:                                        │
│  linux/                                                      │
│  ├── drivers/gpu/drm/amd/    ← amdgpu driver code (main)   │
│  ├── include/drm/             ← DRM header files            │
│  ├── include/uapi/drm/        ← User-space API headers      │
│  └── Makefile, Kconfig, ...   ← Build system                │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│  2. Configure & Compile                                      │
│                                                              │
│  make defconfig                 ← Use default config        │
│  scripts/config --enable DRM_AMDGPU  ← Ensure amdgpu on    │
│  make -j$(nproc)                ← Full build (first, ~30min)│
│                                                              │
│  --- After code changes ---                                  │
│  make M=drivers/gpu/drm/amd    ← Build only amdgpu (~1min) │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│  3. Test                                                     │
│                                                              │
│  Option A: Virtual Machine (safe)                            │
│  sudo insmod amdgpu.ko         ← Load in KVM VM            │
│  dmesg | grep amdgpu           ← Check if loaded properly  │
│                                                              │
│  Option B: Real Machine (daily dev, verified changes)        │
│  sudo rmmod amdgpu && sudo modprobe amdgpu                  │
│  sudo ./build/tests/amdgpu_test  ← Run IGT tests           │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│  4. Submit Patches (covered in detail in Module 11)          │
│                                                              │
│  git add -p && git commit -s                                │
│  scripts/checkpatch.pl HEAD~1..HEAD                         │
│  git format-patch HEAD~1 && git send-email ...              │
└─────────────────────────────────────────────────────────────┘`,
            caption: 'Complete kernel development workflow: obtain source → configure and compile → test → submit patches. Module-only compilation (make M=...) is the most frequently used command in daily development.',
          },
          codeWalk: {
            title: 'Complete Development Environment Setup Commands',
            file: 'terminal',
            language: 'bash',
            code: `#!/bin/bash
# AMD GPU Driver Development Environment Setup Script (Ubuntu 22.04 / 24.04)

# 1. Install compilation toolchain
sudo apt update
sudo apt install -y \\
    build-essential gcc clang llvm \\
    flex bison bc \\
    libelf-dev libssl-dev libncurses-dev \\
    git cscope ctags \\
    python3 python3-pip

# 2. Install amdgpu development dependencies
sudo apt install -y \\
    libdrm-dev libkmod-dev \\
    libcairo2-dev libpixman-1-dev \\
    libudev-dev libjson-c-dev \\
    trace-cmd linux-tools-common

# 3. Clone AMD drm-next kernel source (shallow clone saves space)
git clone --depth=1 \\
    https://gitlab.freedesktop.org/agd5f/linux.git \\
    --branch amd-staging-drm-next \\
    ~/kernel-src
cd ~/kernel-src

# 4. Configure kernel (use current running kernel config as base)
cp /boot/config-$(uname -r) .config
make olddefconfig

# Ensure amdgpu-related options are enabled
scripts/config --enable DRM_AMDGPU
scripts/config --enable DRM_AMDGPU_SI    # GCN 1.0 support
scripts/config --enable DRM_AMDGPU_CIK   # GCN 2.0 support
scripts/config --enable HSA_AMD           # KFD/ROCm support

# 5. Generate code navigation database
make cscope    # Generate cscope database (vim: :cs find g function_name)
make tags      # Generate ctags database (vim: Ctrl+])
# Or use clangd (recommended for VS Code):
# scripts/clang-tools/gen_compile_commands.py

# 6. Compile kernel (first time, ~10-30 minutes)
make -j$(nproc)

# 7. Subsequent development: compile only amdgpu module (~1 minute)
make M=drivers/gpu/drm/amd -j$(nproc)

echo "Development environment setup complete!"`,
            annotations: [
              'build-essential includes gcc, make, and other basic compilation tools',
              'flex/bison are lexer/parser generators required by the kernel configuration system (Kconfig)',
              'libelf-dev handles the ELF format (kernel and modules are both ELF files)',
              'amd-staging-drm-next branch contains the latest amdgpu patches, weeks ahead of Linus\' mainline',
              'cp /boot/config-$(uname -r) reuses the current kernel\'s config, avoiding the hassle of configuring from scratch',
              'make M=drivers/gpu/drm/amd is the most commonly used command in daily development — compile only the modified module',
            ],
            explanation: 'This script covers all steps for setting up a kernel development environment from scratch. Save this script and you only need to run it once on a new machine to set up your environment. The key command to remember is make M=... — in amdgpu development, you don\'t need to compile the entire kernel each time; compiling just the modified module is sufficient.',
          },
          miniLab: {
            title: 'Set Up Your Kernel Development Environment',
            objective: 'Actually execute the development environment setup, confirming all tools are installed and the kernel can compile.',
            setup: '# Ensure you have at least 20GB free disk space and 8GB+ RAM',
            steps: [
              'Install build dependencies: sudo apt install -y build-essential gcc flex bison bc libelf-dev libssl-dev libncurses-dev git',
              'Clone kernel source: git clone --depth=1 https://github.com/torvalds/linux.git ~/kernel-src && cd ~/kernel-src',
              'Configure kernel: make defconfig && scripts/config --enable DRM_AMDGPU',
              'Compile amdgpu module only: make M=drivers/gpu/drm/amd -j$(nproc)',
              'Verify compilation succeeded: ls -la drivers/gpu/drm/amd/amdgpu/amdgpu.ko (you should see the .ko file)',
              'Generate code navigation: make cscope && make tags',
              'Verify cscope: cscope -d -L -0 amdgpu_device_init (should show the function definition location)',
            ],
            expectedOutput: `$ ls -la drivers/gpu/drm/amd/amdgpu/amdgpu.ko
-rw-r--r-- 1 user user 45M amdgpu.ko    ← Compilation successful

$ cscope -d -L -0 amdgpu_device_init
drivers/gpu/drm/amd/amdgpu/amdgpu_device.c amdgpu_device_init ...
← cscope can locate the function definition`,
            hint: 'If compilation fails with a missing header file error, it usually means a -dev package isn\'t installed. The error message typically indicates what\'s missing. Use apt-file search <header.h> to find the package you need to install.',
          },
          debugExercise: {
            title: 'Fix a Kernel Compilation Error',
            language: 'text',
            description: 'You try to compile the amdgpu module but encounter the following compilation error. Find the problem and provide a solution.',
            question: 'What causes this compilation error? How do you fix it?',
            buggyCode: `$ make M=drivers/gpu/drm/amd -j$(nproc)

  CC [M]  drivers/gpu/drm/amd/amdgpu/amdgpu_drv.o
In file included from drivers/gpu/drm/amd/amdgpu/amdgpu_drv.c:28:
./include/linux/module.h:13:10: fatal error: linux/moduleparam.h:
  No such file or directory
   13 | #include <linux/moduleparam.h>
      |          ^~~~~~~~~~~~~~~~~~~~~
compilation terminated.

make[4]: *** [scripts/Makefile.build:257:
  drivers/gpu/drm/amd/amdgpu/amdgpu_drv.o] Error 1`,
            hint: 'This error indicates missing kernel headers. But the issue might not be a missing package — it could also be about where make is being executed.',
            answer: 'This error has two common causes: (1) Not executing make from the kernel source root directory: make M=... must be run in the kernel source root directory containing the Makefile, otherwise it can\'t find kernel headers. Solution: cd ~/kernel-src && make M=drivers/gpu/drm/amd -j$(nproc). (2) Skipping the configuration step: if you run make M=... directly without first running make defconfig (or make menuconfig), the kernel build system doesn\'t have configuration information, which may result in incorrect header file paths. Solution: first run make defconfig to generate the .config file, then compile the module. These build environment issues are the most common obstacles for beginners — the key is to ensure you\'re in the right directory with the right configuration when compiling.',
          },
          interviewQ: {
            question: 'Describe your kernel development workflow: from modifying code to testing to submitting patches.',
            difficulty: 'easy',
            hint: 'Demonstrate your understanding of the complete development cycle: edit → compile (make M=...) → test (insmod/IGT) → check (checkpatch) → submit (git format-patch + send-email).',
            answer: 'My kernel development workflow: (1) Prepare: git checkout -b fix/my-bugfix to create a working branch based on AMD\'s drm-next branch. (2) Edit: use VS Code + clangd (or vim + cscope) to locate and modify code. (3) Compile: make M=drivers/gpu/drm/amd -j$(nproc) to compile only the modified module (~1 minute), ensuring no compilation errors or warnings (make W=1 enables extra warnings). (4) Test: first load amdgpu.ko in a KVM VM via insmod to verify the module loads properly, then on the real machine run sudo rmmod amdgpu && sudo modprobe amdgpu to reload, and run relevant IGT tests (sudo ./build/tests/amdgpu/amdgpu_test). (5) Check code style: scripts/checkpatch.pl --strict HEAD~1..HEAD, ensuring 0 errors, 0 warnings. (6) Commit: git commit -s to add Signed-off-by, using the standard commit message format (drm/amdgpu: fix xxx). (7) Send patch: git format-patch HEAD~1 to generate the patch file, git send-email to send to amd-gfx@lists.freedesktop.org. (8) Respond to reviews: carefully address each review comment, send v2 after revisions.',
            amdContext: 'This question tests whether you have actual kernel development experience. Even if you haven\'t submitted a patch yet, demonstrating that you know the complete workflow (including checkpatch and send-email) will impress the interviewer.',
          },
        },
      ],
    },
  ],
  completionChecklist: [
    'Understand the GPU driver\'s core responsibilities: memory management, task scheduling, interrupt handling, display control, power management',
    'Can draw the complete Linux graphics stack layer diagram (App → Mesa → libdrm → DRM → amdgpu → GPU)',
    'Know the RX 7600 XT\'s PCI Device ID (0x7480) and can find the corresponding entry in kernel source code',
    'Can use dmesg to diagnose amdgpu driver loading issues',
    'Have set up a complete kernel development environment and can compile the amdgpu module',
    'Can navigate kernel source code using cscope/ctags or clangd',
    'Understand AMD\'s open source strategy advantages and the role of the amd-gfx mailing list',
  ],
};
