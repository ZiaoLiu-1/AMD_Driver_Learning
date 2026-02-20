// ============================================================
// AMD Linux Driver Learning Platform - Module 0 Micro-Lessons
// Module 0: Introduction & Learning Path (引言与学习路径概览)
// 7 lessons in 3 groups, ~15 min each, total ~105 min
// ============================================================
import type { MicroLessonModule } from './micro_lesson_types';

export const module0MicroLessons: MicroLessonModule = {
  moduleId: 'intro',
  groups: [
    // ════════════════════════════════════════════════════════════
    // Group 0.1: Understanding GPU Drivers
    // ════════════════════════════════════════════════════════════
    {
      id: '0-1',
      number: '0.1',
      title: '理解 GPU 驱动',
      titleEn: 'Understanding GPU Drivers',
      icon: '🧠',
      description: '从零开始理解 GPU 驱动到底做什么，Linux 图形栈的每一层是如何工作的，以及为什么 AMD 的开源策略让学习成为可能。',
      lessons: [
        // ── Lesson 0.1.1 ──────────────────────────────────────
        {
          id: '0-1-1',
          number: '0.1.1',
          title: '什么是 GPU 驱动？从像素到寄存器',
          titleEn: 'What is a GPU Driver? From Pixels to Registers',
          duration: 15,
          difficulty: 'beginner',
          tags: ['GPU', 'driver', 'hardware', 'register'],
          concept: {
            summary: 'GPU 驱动是操作系统与 GPU 硬件之间的翻译官——它将应用程序的高层请求（"画一个三角形"）翻译成 GPU 硬件能理解的低层操作（"向寄存器 0x28000 写入 0x00000001"）。',
            explanation: [
              '想象你在玩一个游戏。当游戏引擎调用 OpenGL 的 glDrawArrays() 来渲染一个三角形时，这个调用需要经过多层软件才能最终让 GPU 的着色器核心开始工作。GPU 驱动就是这个链条中最关键的一环——它是唯一真正与 GPU 硬件对话的软件。',
              '在最底层，GPU 驱动做的事情非常原始：通过 MMIO（Memory-Mapped I/O）向 GPU 的寄存器写入特定的值。GPU 有成千上万个寄存器，每个寄存器控制硬件的一个具体行为。例如，写入 CP_RB_WPTR（Command Processor Ring Buffer Write Pointer）寄存器会通知 GPU "有新的命令等待执行"。驱动需要知道每个寄存器的地址、格式和语义。',
              '但驱动不只是写寄存器这么简单。一个现代 GPU 驱动（如 amdgpu）还需要：管理 GPU 的内存（VRAM 分配和回收）、调度 GPU 任务（多个应用共享同一个 GPU）、处理中断（GPU 完成任务后通知 CPU）、管理电源（调整 GPU 频率和电压以平衡性能和功耗）、控制显示输出（设置分辨率、刷新率）。这就是为什么 amdgpu 驱动有超过 400 万行代码。',
              '理解这一点很重要：GPU 驱动不只是"让 GPU 工作"，它是一个复杂的系统软件，需要同时处理性能、安全、稳定性和功耗等多个维度的问题。这也是为什么 GPU 驱动工程师是高需求岗位——这个领域需要同时理解操作系统内核、硬件架构和图形学。',
            ],
            keyPoints: [
              'GPU 驱动是 OS 与 GPU 硬件之间的翻译层，通过 MMIO 寄存器写入与硬件通信',
              '驱动的核心职责：内存管理、任务调度、中断处理、电源管理、显示控制',
              'amdgpu 驱动位于 drivers/gpu/drm/amd/，超过 400 万行代码',
              '驱动运行在内核空间（Ring 0），错误会导致整个系统崩溃',
              'GPU 有成千上万个寄存器，每个控制一个硬件行为——驱动需要精确操作它们',
            ],
          },
          diagram: {
            title: '从应用程序到 GPU 硬件的完整路径',
            content: `一个 OpenGL 三角形的完整渲染路径

用户空间                                    内核空间                     硬件
─────────                                    ─────────                     ────

  游戏调用                                                               
  glDrawArrays()                                                          
       │                                                                  
       ▼                                                                  
  Mesa radeonsi                                                           
  (OpenGL → GPU 命令)                                                     
  构建 PM4 命令包:                                                        
  [设置顶点缓冲]                                                          
  [设置着色器]                                                            
  [绘制三角形]                                                            
       │                                                                  
       ▼                                                                  
  libdrm                                                                  
  ioctl(fd, DRM_IOCTL_                                                    
        AMDGPU_CS, &cs)                                                   
       │                                                                  
───────┼──── 系统调用边界 (Ring 3 → Ring 0) ────────                      
       │                                                                  
       ▼                                                                  
  DRM 核心                                                                
  drm_ioctl() 分发                                                        
       │                                                                  
       ▼                                                                  
  amdgpu 驱动                                                             
  amdgpu_cs_ioctl()                                                       
  ├─ 验证命令缓冲区                                                       
  ├─ 映射 GPU 内存                                                        
  ├─ 写入 Ring Buffer                                                     
  └─ writel(wptr,               ──→   GPU Ring Buffer                     
     doorbell_reg)                     ┌──────────┐                       
                                       │ PM4 cmd  │ ──→  Command          
                                       │ PM4 cmd  │      Processor        
                                       │ PM4 cmd  │         │             
                                       └──────────┘         ▼             
                                                        着色器核心         
                                                        执行渲染           
                                                            │             
                                                            ▼             
                                                        Framebuffer       
                                                        (像素数据)         
                                                            │             
                                                            ▼             
                                                        显示控制器         
                                                        → 你的屏幕 🖥️`,
            caption: '一个三角形从 OpenGL 调用到最终显示在屏幕上的完整路径。amdgpu 驱动是连接用户空间和 GPU 硬件的核心桥梁。writel() 写入 doorbell 寄存器是驱动与硬件通信的最后一步。',
          },
          codeWalk: {
            title: 'writel() — 驱动与硬件通信的最基本操作',
            file: 'drivers/gpu/drm/amd/amdgpu/amdgpu_device.c',
            language: 'c',
            code: `/* amdgpu 驱动中最基本的硬件访问操作 */

/* 写入 GPU 寄存器（MMIO） */
void amdgpu_device_wreg(struct amdgpu_device *adev,
                         uint32_t reg, uint32_t v,
                         uint32_t acc_flags)
{
    /* adev->rmmio 是 GPU 寄存器空间映射到内核的虚拟地址
     * 由 pci_ioremap_bar() 在驱动初始化时创建
     * reg 是寄存器的偏移量（如 0x28000 = GRBM_STATUS）
     */
    if (!(acc_flags & AMDGPU_REGS_NO_KIQ) &&
        amdgpu_sriov_runtime(adev))
        /* SR-IOV 虚拟化环境：通过 KIQ 间接访问 */
        return amdgpu_kiq_wreg(adev, reg, v);

    /* 直接 MMIO 写入 — 最常见的路径 */
    writel(v, ((void __iomem *)adev->rmmio) + (reg * 4));
    /* ↑ writel 是内核提供的 MMIO 写入函数
     * 它等价于 *(volatile uint32_t *)(addr) = value
     * 但额外保证了内存屏障（memory barrier）和字节序 */
}

/* 读取 GPU 寄存器 */
uint32_t amdgpu_device_rreg(struct amdgpu_device *adev,
                             uint32_t reg, uint32_t acc_flags)
{
    if (!(acc_flags & AMDGPU_REGS_NO_KIQ) &&
        amdgpu_sriov_runtime(adev))
        return amdgpu_kiq_rreg(adev, reg);

    return readl(((void __iomem *)adev->rmmio) + (reg * 4));
}

/* 在代码中的典型使用方式 */
/* WREG32(mmGRBM_STATUS) 和 RREG32(mmGRBM_STATUS) 是宏
 * 展开后调用 amdgpu_device_wreg/rreg */`,
            annotations: [
              'adev->rmmio 是 GPU 寄存器 BAR 映射到内核虚拟地址空间的基地址，由 pci_ioremap_bar() 创建',
              'reg * 4：每个寄存器是 32 位（4 字节），reg 是寄存器编号，乘以 4 得到字节偏移',
              'writel/readl 是内核的 MMIO 访问函数，保证了 memory barrier 和字节序正确',
              '__iomem 是内核的类型标注，表示这是一个 I/O 内存指针，不能直接解引用',
              'AMDGPU_REGS_NO_KIQ 标志跳过 KIQ（Kernel Interface Queue），用于虚拟化环境',
              'WREG32/RREG32 宏是 amdgpu 驱动中最常用的寄存器访问方式，你会在代码中看到数千次',
            ],
            explanation: '这段代码展示了 GPU 驱动最底层的操作——读写 GPU 寄存器。当你在 amdgpu 源码中看到 WREG32(mmSOME_REG, value) 时，它最终调用的就是这个函数。理解这个机制是阅读所有 amdgpu 代码的基础，因为驱动对 GPU 的每一个控制操作——设置显示模式、启动 GPU 命令、调整频率——最终都归结为寄存器读写。',
          },
          miniLab: {
            title: '通过 sysfs 读取你的 GPU 信息',
            objective: '使用 Linux sysfs 接口读取你手头 AMD GPU 的硬件信息（以 RX 7600 XT 为示例），理解内核是如何将 GPU 状态暴露给用户空间的。',
            steps: [
              '打开终端，运行 lspci -v | grep -A 10 "VGA\\|3D\\|Display"，找到你的 AMD GPU',
              '查看 GPU 的 PCI 设备 ID：cat /sys/class/drm/card0/device/device（应该输出 0x7480）',
              '查看 GPU 供应商 ID：cat /sys/class/drm/card0/device/vendor（应该输出 0x1002 = AMD）',
              '查看 amdgpu 驱动的内存使用：cat /sys/class/drm/card0/device/mem_info_vram_used（VRAM 使用量，单位字节）',
              '查看 GPU 当前频率：cat /sys/class/drm/card0/device/pp_dpm_sclk（显示可用频率和当前频率）',
              '查看 GPU 温度：cat /sys/class/drm/card0/device/hwmon/hwmon*/temp1_input（温度，单位毫摄氏度，除以 1000 得到摄氏度）',
            ],
            expectedOutput: `$ cat /sys/class/drm/card0/device/device
0x7480     ← Navi33 (RX 7600 XT) 的 Device ID

$ cat /sys/class/drm/card0/device/vendor
0x1002     ← AMD 的 PCI Vendor ID

$ cat /sys/class/drm/card0/device/mem_info_vram_used
285212672  ← ~272MB VRAM 使用中（桌面环境）

$ cat /sys/class/drm/card0/device/pp_dpm_sclk
0: 300Mhz
1: 800Mhz
2: 2100Mhz
3: 2595Mhz *   ← * 表示当前频率`,
            hint: '如果你看到 "Permission denied"，尝试使用 sudo。如果 /sys/class/drm/card0 不存在，检查 amdgpu 模块是否已加载：lsmod | grep amdgpu。',
          },
          debugExercise: {
            title: '找出错误的寄存器访问',
            language: 'c',
            description: '以下代码尝试读取 GPU 寄存器，但有一个常见的错误。找出问题并解释为什么它是危险的。',
            question: '这段代码有什么问题？为什么在内核中这样做是危险的？',
            buggyCode: `/* 错误的 GPU 寄存器读取代码 */
#include <linux/io.h>

uint32_t read_gpu_status(struct amdgpu_device *adev)
{
    uint32_t *reg_ptr;

    /* 直接解引用 MMIO 指针 */
    reg_ptr = (uint32_t *)adev->rmmio + 0xA000;
    return *reg_ptr;  /* BUG: 直接解引用 __iomem 指针! */
}`,
            hint: 'MMIO 内存不是普通内存——编译器可能会优化掉对它的读取，而且不同架构的字节序不同。',
            answer: '错误：直接解引用 __iomem 指针（*reg_ptr）而不是使用 readl()。问题有三个：（1）编译器可能将这个读取优化掉（认为地址没有变化所以缓存上次的值），但 MMIO 寄存器的值随时可能被硬件改变；（2）readl() 包含内存屏障（memory barrier），确保寄存器读取不会被 CPU 乱序执行；（3）readl() 处理字节序转换（GPU 寄存器是 little-endian，在 big-endian CPU 上需要转换）。正确写法：return readl(((void __iomem *)adev->rmmio) + (0xA000 * 4)); 或使用 RREG32(0xA000) 宏。内核的 sparse 工具（make C=1）会标记这种错误。',
          },
          interviewQ: {
            question: 'GPU 驱动在操作系统中的角色是什么？为什么它特别复杂？',
            difficulty: 'easy',
            hint: '从驱动的多重职责（内存管理、任务调度、中断处理、显示控制、电源管理）和同时服务多个用户空间客户端的角度回答。',
            answer: 'GPU 驱动是操作系统与 GPU 硬件之间的接口层，将用户空间的高层请求（渲染命令、计算任务、视频编解码）翻译成 GPU 硬件能理解的寄存器操作和命令包。它特别复杂的原因：（1）多重职责：一个驱动同时负责内存管理（VRAM 分配/回收/迁移）、任务调度（多个应用共享 GPU）、中断处理（GPU 完成通知）、显示控制（KMS 模式设置）、电源管理（DVFS 动态调频调压）；（2）多客户端：多个应用同时使用 GPU，驱动必须确保隔离和公平调度；（3）硬件多样性：amdgpu 驱动支持从 2012 年的 GCN 到最新的 RDNA4 等多代架构，代码中有大量的条件逻辑处理不同硬件；（4）实时性要求：显示输出必须在每个 VBlank 间隔（约 16.7ms @60Hz）内完成，延迟会导致可见的画面撕裂。',
            amdContext: 'AMD 面试中经常以此开场，测试你对 GPU 驱动整体角色的理解深度。回答时要展示你理解的是完整的系统，而不只是"让 GPU 工作"。',
          },
        },

        // ── Lesson 0.1.2 ──────────────────────────────────────
        {
          id: '0-1-2',
          number: '0.1.2',
          title: 'Linux 图形栈从上到下',
          titleEn: 'The Linux Graphics Stack Top-to-Bottom',
          duration: 20,
          difficulty: 'beginner',
          tags: ['Linux', 'graphics-stack', 'DRM', 'Mesa', 'libdrm'],
          concept: {
            summary: 'Linux 图形栈是一个多层软件系统：从用户空间的 OpenGL/Vulkan 应用，经过 Mesa 3D 库、libdrm、DRM 内核子系统，最终到达 amdgpu 驱动和 GPU 硬件。理解每一层的职责和接口是学习驱动开发的第一步。',
            explanation: [
              '如果把 Linux 图形栈比作一栋建筑，那么用户空间的应用程序在顶层，GPU 硬件在地基，中间的每一层都有明确的职责分工。理解这个分层是理解整个驱动开发的基础——你需要知道每一层做什么、不做什么、以及层与层之间如何通信。',
              '顶层是图形 API（OpenGL、Vulkan、HIP）。应用程序不直接与 GPU 通信，而是通过这些标准化的 API 描述它想做什么。例如 glDrawArrays(GL_TRIANGLES, 0, 3) 表示"用当前状态画 3 个顶点组成的三角形"。这些 API 是跨平台的——同样的代码在 AMD、NVIDIA、Intel GPU 上都应该工作。',
              '中间是 Mesa 3D 库。Mesa 是 Linux 上开源的 OpenGL/Vulkan 实现。对于 AMD GPU，Mesa 包含两个关键驱动：radeonsi（OpenGL）和 radv（Vulkan）。Mesa 的工作是将高层的 API 调用编译成 GPU 能执行的命令——包括编译着色器（GLSL → GPU ISA）、构建 PM4 命令包、管理用户态的 Buffer 分配。Mesa 通过 libdrm 库与内核通信。',
              'libdrm 是一个用户空间的 C 库，封装了 DRM 的 ioctl 调用。它提供了更友好的 API（如 amdgpu_bo_alloc、amdgpu_cs_submit），让 Mesa 不需要直接构造 ioctl 参数。libdrm 的 amdgpu 特定部分在 libdrm/amdgpu/ 下。',
              '内核空间的 DRM（Direct Rendering Manager）子系统是所有 GPU 驱动的框架。它提供通用功能：设备文件管理（/dev/dri/card0）、ioctl 分发、KMS 显示管理、GEM 内存管理。amdgpu 驱动是 DRM 的一个具体实现——它注册到 DRM 框架，提供 AMD GPU 特定的功能。',
              '最底层是 amdgpu 驱动本身和 GPU 硬件。amdgpu 驱动通过 MMIO 读写 GPU 寄存器，通过 DMA 传输数据，通过中断接收 GPU 通知。它的代码在 drivers/gpu/drm/amd/ 下，包含数十个子模块（GFX、SDMA、DC、VCN、KFD 等），每个负责 GPU 的一个功能模块。',
            ],
            keyPoints: [
              '图形 API（OpenGL/Vulkan）→ Mesa 3D（radeonsi/radv）→ libdrm → ioctl → DRM → amdgpu → GPU',
              'Mesa 在用户空间编译着色器和构建命令包，减少内核的工作量',
              'libdrm 封装 ioctl 调用，提供 C API（amdgpu_bo_alloc、amdgpu_cs_submit 等）',
              'DRM 是通用框架，amdgpu 是具体实现——同一个 DRM API 支持 AMD/Intel/NVIDIA GPU',
              'ioctl 是用户空间与内核通信的核心机制，每个 DRM 操作对应一个 ioctl 编号',
              'amdgpu 驱动分为多个 IP Block：GFX（图形）、SDMA（DMA）、DC（显示）、VCN（视频）',
            ],
          },
          diagram: {
            title: 'Linux 图形栈完整分层图',
            content: `Linux 图形栈分层架构（以 AMD GPU 为例）

┌─────────────────────────────────────────────────────────────────┐
│  Layer 5: Applications （应用层）                                │
│  游戏 (Cyberpunk 2077)  │  AI (PyTorch)  │  桌面 (GNOME/KDE)  │
│  OpenGL / Vulkan API      HIP API           EGL / Wayland       │
└───────────────┬──────────────┬─────────────────┬────────────────┘
                │              │                 │
┌───────────────▼──────────────▼─────────────────▼────────────────┐
│  Layer 4: User-Space Drivers （用户态驱动）                      │
│                                                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────────────┐    │
│  │ Mesa radeonsi│  │ ROCm / HIP  │  │ Mesa radv (Vulkan)   │    │
│  │ (OpenGL)    │  │ 运行时       │  │                      │    │
│  └──────┬──────┘  └──────┬──────┘  └──────────┬───────────┘    │
│         │                │                     │                 │
│  ┌──────▼────────────────▼─────────────────────▼──────────┐     │
│  │                    libdrm                               │     │
│  │  amdgpu_bo_alloc()  amdgpu_cs_submit()  drmModeSetCrtc()│    │
│  └────────────────────────┬───────────────────────────────┘     │
└───────────────────────────┼─────────────────────────────────────┘
                            │
        ═══════════════ ioctl() 系统调用 ═══════════════
                            │
┌───────────────────────────▼─────────────────────────────────────┐
│  Layer 3: DRM Core （DRM 内核框架）                              │
│  drivers/gpu/drm/drm_*.c                                        │
│                                                                  │
│  drm_ioctl()  →  根据 ioctl 编号分发到驱动特定的处理函数        │
│  drm_gem_*    →  通用 GPU 内存管理框架                          │
│  drm_atomic_* →  KMS Atomic Mode Setting（显示管理）            │
└───────────────────────────┬─────────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────────┐
│  Layer 2: amdgpu Driver （amdgpu 驱动）                         │
│  drivers/gpu/drm/amd/                                            │
│                                                                  │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐       │
│  │  GFX   │ │  SDMA  │ │   DC   │ │  VCN   │ │  KFD   │       │
│  │ 图形   │ │ DMA引擎│ │ 显示   │ │ 视频   │ │ 计算   │       │
│  │gfx1102 │ │sdma6.0 │ │ DCN3.2 │ │VCN 4.0 │ │ ROCm   │       │
│  └───┬────┘ └───┬────┘ └───┬────┘ └───┬────┘ └───┬────┘       │
│      └──────────┴──────────┴──────────┴──────────┘              │
│                            │                                     │
│            MMIO writel/readl + DMA + Interrupt                   │
└───────────────────────────┬─────────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────────┐
│  Layer 1: GPU Hardware （GPU 硬件）                              │
│  RX 7600 XT  ·  Navi33  ·  gfx1102  ·  RDNA3                  │
│                                                                  │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐       │
│  │Shader  │ │ SDMA   │ │Display │ │ Video  │ │ VRAM   │       │
│  │Engines │ │Engines │ │Engine  │ │Engine  │ │ 8GB    │       │
│  │(32 CU) │ │ (×2)   │ │(DCN3.2)│ │(VCN4.0)│ │GDDR6   │       │
│  └────────┘ └────────┘ └────────┘ └────────┘ └────────┘       │
└─────────────────────────────────────────────────────────────────┘`,
            caption: '完整的 Linux 图形栈分层图。学习路径中的每个模块对应图中的一层或几层：Module 4 对应 DRM Core，Module 5 对应 amdgpu Driver，Module 8 对应 ROCm/HIP。',
          },
          codeWalk: {
            title: '用 strace 追踪一个 GL 程序的 ioctl 调用',
            file: 'terminal + drm_ioctl.c',
            language: 'bash',
            code: `# 使用 strace 追踪 glxgears（一个简单的 OpenGL 程序）
# 只显示 ioctl 系统调用
$ strace -e ioctl -f glxgears 2>&1 | head -40

# 输出示例（简化）：
# ioctl(8, DRM_IOCTL_VERSION, ...) = 0              ← 查询驱动版本
# ioctl(8, DRM_IOCTL_AMDGPU_INFO, ...) = 0          ← 查询 GPU 信息
# ioctl(8, DRM_IOCTL_AMDGPU_GEM_CREATE, ...) = 0    ← 分配 GPU 内存
# ioctl(8, DRM_IOCTL_AMDGPU_GEM_CREATE, ...) = 0    ← 分配顶点缓冲
# ioctl(8, DRM_IOCTL_AMDGPU_CS, ...) = 0            ← 提交渲染命令
# ioctl(8, DRM_IOCTL_AMDGPU_WAIT_CS, ...) = 0       ← 等待 GPU 完成
# ioctl(8, DRM_IOCTL_AMDGPU_CS, ...) = 0            ← 提交下一帧
# ... (每秒约 300 次 ioctl 调用)

# 对应的内核代码（drm_ioctl.c）：
# static const struct drm_ioctl_desc amdgpu_ioctls_kms[] = {
#     DRM_IOCTL_DEF_DRV(AMDGPU_GEM_CREATE, amdgpu_gem_create_ioctl, ...),
#     DRM_IOCTL_DEF_DRV(AMDGPU_CS, amdgpu_cs_ioctl, ...),
#     DRM_IOCTL_DEF_DRV(AMDGPU_INFO, amdgpu_info_ioctl, ...),
#     DRM_IOCTL_DEF_DRV(AMDGPU_WAIT_CS, amdgpu_cs_wait_ioctl, ...),
# };`,
            annotations: [
              'strace 追踪进程的系统调用——ioctl 是用户空间与 DRM 驱动通信的唯一方式',
              'fd=8 是 /dev/dri/card0 的文件描述符，由 Mesa 在初始化时打开',
              'DRM_IOCTL_AMDGPU_CS 是最关键的 ioctl——它提交 GPU 渲染命令',
              '每帧渲染包含：分配内存 → 提交命令 → 等待完成 的循环',
              '在内核中，每个 ioctl 编号对应一个处理函数（如 amdgpu_cs_ioctl）',
            ],
            explanation: '通过 strace 你可以直接观察到用户空间程序是如何通过 ioctl 与内核 amdgpu 驱动交互的。这是理解图形栈分层最直观的方式——你能看到每一次跨层调用。当你学到 Module 5 时，你将深入分析 amdgpu_cs_ioctl 的每一行代码。',
          },
          miniLab: {
            title: '用 strace 追踪你的第一个 GPU 程序',
            objective: '安装 glxgears 并用 strace 追踪它的 ioctl 调用，亲眼看到 Mesa → libdrm → DRM → amdgpu 的调用链。',
            setup: `# 安装 glxgears（包含在 mesa-utils 中）
sudo apt install mesa-utils strace

# 确认 GPU 正常工作
glxinfo | grep "OpenGL renderer"
# 应该输出类似：OpenGL renderer string: AMD Radeon RX 7600 XT`,
            steps: [
              '运行 strace -e ioctl glxgears 2>&1 | head -100 > /tmp/gpu_trace.txt',
              '打开 /tmp/gpu_trace.txt，搜索 DRM_IOCTL_AMDGPU 开头的行',
              '统计不同类型的 ioctl 调用：grep -c "AMDGPU_CS" /tmp/gpu_trace.txt',
              '统计每秒调用次数：strace -e ioctl -c glxgears（运行几秒后按 Ctrl+C）',
              '对比：运行 strace -e ioctl -c vkcube（Vulkan 程序）看看 Vulkan 的 ioctl 模式是否不同',
            ],
            expectedOutput: `$ strace -e ioctl -c glxgears
% time     seconds  usecs/call     calls    errors syscall
------ ----------- ----------- --------- --------- -------
 52.34    0.008234         2.1      3820           ioctl
 ...
可以看到每秒有数百次 ioctl 调用，绝大多数是 AMDGPU_CS（命令提交）`,
            hint: '如果 glxgears 输出 "Error: couldn\'t get an RGB visual"，确保你使用的是 AMD GPU 而非集成显卡。运行 DRI_PRIME=1 glxgears 来强制使用独立 GPU。',
          },
          debugExercise: {
            title: '匹配错误信息到正确的栈层',
            language: 'text',
            description: '以下是 4 条真实的错误信息。你的任务是判断每条信息来自图形栈的哪一层。',
            question: '将每条错误信息匹配到正确的栈层（Mesa / libdrm / DRM Core / amdgpu）',
            buggyCode: `错误信息 A:
"radeonsi: Failed to create a context."

错误信息 B:
"[drm:amdgpu_job_timedout] *ERROR* ring gfx_0.0.0 timeout"

错误信息 C:
"amdgpu_cs_submit_raw: Invalid argument"

错误信息 D:
"[drm] GPU fault detected: src_id:0, ring:0, vmid:1"`,
            hint: '注意每条信息的前缀——radeonsi 是 Mesa 的 AMD OpenGL 驱动，amdgpu_cs_submit_raw 是 libdrm 函数，[drm] 前缀来自内核。',
            answer: '答案：A → Mesa（radeonsi 是 Mesa 中 AMD 的 OpenGL 驱动，创建 GL 上下文失败通常是用户态问题）。B → amdgpu 驱动（ring timeout 是 GPU hang 的内核错误，来自 amdgpu_job_timedout 函数）。C → libdrm（amdgpu_cs_submit_raw 是 libdrm 中的函数，"Invalid argument" 表示 ioctl 参数错误）。D → DRM/amdgpu（[drm] 前缀是内核 DRM 子系统的日志，GPU fault 是地址翻译失败，由 amdgpu 的 VM 子系统报告）。在实际调试中，快速判断错误来自哪一层是定位问题的第一步。',
          },
          interviewQ: {
            question: '从一个 OpenGL glDrawArrays() 调用开始，描述数据如何从 CPU 到达 GPU 并最终显示在屏幕上。',
            difficulty: 'medium',
            hint: '按照图形栈的分层：应用 → Mesa（着色器编译 + 命令包构建）→ libdrm（ioctl 封装）→ DRM（ioctl 分发）→ amdgpu（命令提交到 Ring Buffer）→ GPU（执行渲染）→ 显示控制器 → 屏幕。',
            answer: '完整路径：（1）应用调用 glDrawArrays(GL_TRIANGLES, 0, 3)；（2）Mesa radeonsi 将此调用翻译为 GPU 命令：编译顶点/片段着色器为 GPU ISA（如果还没编译），构建 PM4 命令包（设置管线状态、绑定着色器、绑定顶点缓冲、发起 draw call），将命令包写入 CS（Command Submission）缓冲区；（3）当缓冲区满或应用调用 SwapBuffers 时，Mesa 调用 libdrm 的 amdgpu_cs_submit()；（4）libdrm 封装参数调用 ioctl(fd, DRM_IOCTL_AMDGPU_CS, &cs)；（5）内核 DRM 层的 drm_ioctl() 分发到 amdgpu_cs_ioctl()；（6）amdgpu 驱动验证命令缓冲区，将其写入 GPU 的 GFX Ring Buffer，写入 Doorbell 寄存器通知 GPU；（7）GPU 的 Command Processor（CP）从 Ring Buffer 读取 PM4 命令，驱动 Shader Engine 执行渲染；（8）渲染结果写入 Framebuffer（一块 VRAM 内存）；（9）显示控制器（DCN）在下一个 VBlank 读取 Framebuffer 并发送到 HDMI/DP 输出；（10）显示器显示画面。整个过程在 16.7ms（60Hz）内完成。',
            amdContext: '这是 AMD 面试中最经典的问题之一。回答的关键是展示你理解每一层的职责和数据如何在层间传递，而不只是模糊地说"调用驱动然后 GPU 画"。',
          },
        },

        // ── Lesson 0.1.3 ──────────────────────────────────────
        {
          id: '0-1-3',
          number: '0.1.3',
          title: 'AMD 的开源优势与职业机会',
          titleEn: "AMD's Open Source Advantage & Career Opportunities",
          duration: 15,
          difficulty: 'beginner',
          tags: ['AMD', 'open-source', 'career', 'NVIDIA', 'Intel'],
          concept: {
            summary: 'AMD 的 GPU 驱动栈（amdgpu + Mesa + ROCm）是完全开源的，这在 GPU 行业中独一无二。这不仅让学习成为可能，还意味着你可以通过提交补丁直接证明自己的能力——这是进入 AMD 最有力的简历素材。',
            explanation: [
              '在 GPU 驱动领域，AMD、NVIDIA 和 Intel 的策略截然不同。AMD 的 amdgpu 驱动完全开源并合并入 Linux 内核主线，用户态驱动 Mesa radeonsi/radv 也完全开源，甚至 ROCm 计算框架也是开源的。这意味着你可以阅读每一行代码、理解每一个设计决策、甚至直接贡献代码。',
              'NVIDIA 的情况完全不同。直到 2022 年，NVIDIA 的 Linux 驱动是完全闭源的。现在 NVIDIA 开源了 nvidia-open 内核模块，但核心的 GPU 固件和用户态驱动仍然是闭源的。这意味着你无法阅读 NVIDIA 驱动的大部分代码，也几乎不可能为其贡献补丁。社区维护的 nouveau 驱动功能有限，因为缺少硬件文档。',
              'Intel 的 GPU 驱动（i915/xe）也是完全开源的，但 Intel 在独立 GPU 市场的份额很小（Arc 系列），在高性能计算领域几乎没有存在感。Intel 的驱动工程师岗位也相对少于 AMD。',
              '对于你的职业发展，AMD 的开源策略意味着：（1）你可以通过提交被接受的内核补丁来建立公开的贡献记录——这比任何面试技巧都有说服力；（2）你可以在学习过程中阅读真实的驱动代码，而不是依赖二手文档；（3）AMD Markham（加拿大）和上海办公室持续招聘 GPU 驱动工程师，特别是有实际内核贡献经验的候选人。',
              'amd-gfx 邮件列表（amd-gfx@lists.freedesktop.org）每天有 30-50 个补丁提交，你可以看到 AMD 工程师在实际工作中遇到什么问题、如何解决。订阅这个邮件列表，就像拥有了一个免费的 AMD 内部培训资源。',
            ],
            keyPoints: [
              'AMD: 完全开源（amdgpu + Mesa + ROCm），代码在 Linux 主线',
              'NVIDIA: 核心闭源，nvidia-open 只是部分开源，学习和贡献受限',
              'Intel: 开源（i915/xe），但独立 GPU 市场份额小，岗位相对少',
              '提交被接受的内核补丁是最有力的 AMD 求职证明',
              'amd-gfx 邮件列表是免费的"内部培训"资源，每天 30-50 个补丁',
              'AMD Markham / Shanghai 持续招聘 GPU 驱动工程师',
            ],
          },
          diagram: {
            title: 'AMD vs NVIDIA vs Intel 开源策略对比',
            content: `GPU 驱动开源程度对比

                AMD                   NVIDIA                Intel
            ─────────              ──────────             ─────────
内核驱动     ████████████          ██████░░░░            ████████████
             amdgpu (开源)         nvidia-open(部分)     i915/xe (开源)
             Linux 主线            树外模块               Linux 主线

用户态驱动   ████████████          ░░░░░░░░░░            ████████████
             Mesa radeonsi         闭源                   Mesa iris
             Mesa radv             (libGL/libcuda)        Mesa anv
             完全开源               无法阅读               完全开源

计算框架     ████████████          ░░░░░░░░░░            ████████████
             ROCm (开源)           CUDA (闭源)            oneAPI (开源)
             HIP API                行业标准               SYCL

固件         ████████░░            ░░░░░░░░░░            ████████░░
             大部分公开             完全闭源               大部分公开
             (binary blobs)         (签名验证)

硬件文档     ████████░░            ░░░░░░░░░░            ██████████
             Radeon ISA 文档       几乎无公开文档         开放文档
             GPUOpen 资源

学习驱动的   ★★★★★                ★☆☆☆☆               ★★★★☆
可行性       最佳选择               几乎不可能             可行但岗位少

█ = 开源    ░ = 闭源

结论：AMD 是学习 GPU 驱动开发的唯一实际选择
  ✓ 所有代码可读  ✓ 所有补丁可提交  ✓ 活跃的公开讨论`,
            caption: '三大 GPU 厂商的开源策略对比。AMD 在所有维度上的开放程度都是最高的，这使得独立学习和贡献成为可能。',
          },
          codeWalk: {
            title: '阅读一个真实的 amd-gfx 邮件列表补丁',
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
              '这是一个来自 AMD 显示团队的真实补丁格式——Subject 以 "drm/amd/display:" 开头',
              'Commit message 解释了 What（修复什么）和 Why（为什么需要修复），而非 How（如何修复）',
              'Fixes: 标签引用引入 Bug 的原始提交，帮助维护者判断是否需要 backport',
              'Signed-off-by 是法律声明，Reviewed-by 表示已有人审查',
              'diff 显示只修改了 3 行代码——大多数内核补丁都是这种小而精确的修改',
              'Alex Deucher 是 AMD amdgpu 驱动的首席维护者，看到他的 Reviewed-by 意味着补丁质量被认可',
            ],
            explanation: '这就是你将来提交补丁时使用的格式。注意补丁很小（3 行修改），但 commit message 写得很清楚。内核社区重视的是代码的正确性和 commit message 的清晰度，而非代码量。你的第一个补丁可能也只有几行改动。',
          },
          miniLab: {
            title: '探索 amd-gfx 邮件列表和 amdgpu 源码规模',
            objective: '亲自浏览 amd-gfx 邮件列表和内核源码，感受 amdgpu 驱动的规模和社区活跃度。',
            steps: [
              '打开 https://lists.freedesktop.org/archives/amd-gfx/ 浏览最近的邮件列表归档',
              '找到一个标题以 [PATCH] drm/amd 开头的邮件，阅读 commit message',
              '克隆 Linux 内核源码（浅克隆节省空间）：git clone --depth=1 https://github.com/torvalds/linux.git',
              '统计 amdgpu 驱动代码行数：find linux/drivers/gpu/drm/amd/ -name "*.c" -o -name "*.h" | xargs wc -l | tail -1',
              '统计文件数量：find linux/drivers/gpu/drm/amd/ -name "*.c" -o -name "*.h" | wc -l',
              '查看最近的 amdgpu 提交：cd linux && git log --oneline --since="1 week ago" -- drivers/gpu/drm/amd/ | head -20',
            ],
            expectedOutput: `$ find linux/drivers/gpu/drm/amd/ -name "*.c" -o -name "*.h" | xargs wc -l | tail -1
 4200000+ total   ← 超过 400 万行代码！

$ find linux/drivers/gpu/drm/amd/ -name "*.c" -o -name "*.h" | wc -l
 3500+            ← 超过 3500 个源文件

$ git log --oneline --since="1 week ago" -- drivers/gpu/drm/amd/ | wc -l
 50+              ← 每周约 50+ 次提交（非常活跃）`,
            hint: 'git clone --depth=1 只下载最新版本，约 200MB（完整历史 > 3GB）。如果网速慢，可以用 GitHub 网页版直接浏览 drivers/gpu/drm/amd/ 目录。',
          },
          debugExercise: {
            title: '判断组件的开源/闭源状态',
            language: 'text',
            description: '以下列出了 AMD GPU 驱动栈中的 8 个组件。判断每个组件是开源还是闭源。',
            question: '标记每个组件为 "开源" 或 "闭源"',
            buggyCode: `1. amdgpu 内核驱动 (drivers/gpu/drm/amd/)      → ???
2. AMD GPU 固件 (amdgpu firmware blobs)          → ???
3. Mesa radeonsi (OpenGL 驱动)                    → ???
4. Mesa radv (Vulkan 驱动)                        → ???
5. ROCm HIP 运行时                                → ???
6. AMD Display Core (DC) 模块                     → ???
7. LLVM AMDGPU 后端                               → ???
8. AMD SMU 固件 (System Management Unit)          → ???`,
            hint: '大部分组件是开源的，但固件（firmware）是一个特殊情况——虽然作为 binary blob 发布，但不是源码级开源。',
            answer: '答案：1. 开源（GPL，合并入 Linux 内核主线）。2. 闭源（作为 binary blob 在 linux-firmware 仓库中发布，必须接受 AMD 许可协议，但不提供源码）。3. 开源（MIT 许可，在 Mesa 仓库中）。4. 开源（MIT 许可，在 Mesa 仓库中）。5. 开源（MIT 许可，在 ROCm GitHub 组织下）。6. 开源（GPL，是 amdgpu 驱动的一部分，但 DC 模块的代码风格与内核其他部分略有不同，因为它最初是 Windows 驱动的移植）。7. 开源（Apache 2.0 许可，在 LLVM 项目中）。8. 闭源（SMU 固件控制 GPU 的电源管理，以 binary blob 形式提供，驱动通过 SMU 消息接口与其通信）。关键理解：虽然固件不是源码开源，但驱动与固件交互的接口是完全开源的，所以你仍然可以理解驱动如何控制 GPU 的电源管理。',
          },
          interviewQ: {
            question: '为什么 AMD 选择开源其 GPU 驱动？这对 AMD 和 Linux 社区分别有什么好处？',
            difficulty: 'easy',
            hint: '从商业策略（吸引 Linux 用户和开发者）、工程效率（社区贡献和 bug 发现）和生态建设（ROCm 对抗 CUDA）的角度回答。',
            answer: '对 AMD 的好处：（1）降低维护成本——驱动合并入 Linux 主线后，由内核社区共同维护，不需要为每个 Linux 发行版单独打包驱动；（2）提高质量——数千名内核开发者可以发现和修复 Bug，提交性能优化；（3）吸引 Linux 用户——Linux 服务器市场和 AI 计算市场巨大，开源驱动让 AMD GPU 成为 Linux 用户的首选；（4）ROCm 生态——开源 ROCm 是与 NVIDIA CUDA 竞争的策略，需要开源的内核驱动作为基础。对 Linux 社区的好处：（1）硬件支持——AMD GPU 在新 Linux 内核发布时就能开箱即用，无需安装闭源驱动；（2）学习资源——完整的驱动源码是学习 GPU 架构和驱动开发的宝贵教材；（3）安全审计——开源代码可以被安全研究人员审查，减少安全漏洞。',
            amdContext: 'AMD 面试官可能会问这个问题来评估你对 AMD 企业战略的理解。展示你不只是一个写代码的人，还理解技术决策背后的商业逻辑。',
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
      title: '认识你的 GPU 硬件',
      titleEn: 'Know Your Hardware',
      icon: '🔌',
      description: '通过实际操作认识你手头的 AMD GPU（本节以 RX 7600 XT / Navi33 为示例）——从 PCI 总线发现到 dmesg 日志分析，再到理解 amdgpu 驱动的完整启动序列。',
      lessons: [
        // ── Lesson 0.2.1 ──────────────────────────────────────
        {
          id: '0-2-1',
          number: '0.2.1',
            title: '识别你的 AMD GPU（以 RX 7600 XT 为例）',
          titleEn: 'Identifying Your RX 7600 XT',
          duration: 15,
          difficulty: 'beginner',
          tags: ['PCI', 'lspci', 'sysfs', 'device-id'],
          concept: {
            summary: 'Linux 通过 PCI 总线发现 GPU。每个 PCI 设备有唯一的 Vendor ID + Device ID 组合，amdgpu 驱动通过匹配这些 ID 来认领硬件。本节以 RX 7600 XT（Device ID 0x7480 / CHIP_NAVI33）为示例，相同方法适用于所有 AMD GPU。',
            explanation: [
              'Throughout this platform, we use the RX 7600 XT (Navi33 / gfx1102) as our running example because it\'s a widely available, affordable RDNA3 GPU. If you have a different AMD GPU, the same concepts apply — just substitute your GPU\'s Device ID, chip codename, and IP version. You can find your GPU\'s specifics using: lspci -nn | grep AMD. 当电脑启动时，CPU 首先做的事情之一就是扫描 PCI 总线上的所有设备。每个 PCI 设备（GPU、网卡、声卡等）有一组标准的标识信息存储在其 PCI 配置空间（Configuration Space）中。最重要的两个是 Vendor ID（制造商标识）和 Device ID（设备型号标识）。AMD 的 Vendor ID 统一为 0x1002，不同 GPU 型号有各自的 Device ID（如 RX 7600 XT 为 0x7480，RX 7900 XTX 为 0x744C）。',
              '内核启动后，PCI 子系统会枚举所有设备，并尝试为每个设备找到匹配的驱动。amdgpu 驱动在 amdgpu_drv.c 中维护了一个 PCI 设备 ID 表（pciidlist[]），列出了所有支持的 AMD GPU 的 Device ID。当 PCI 子系统发现一个 Vendor ID=0x1002、Device ID=0x7480 的设备时，它知道 amdgpu 驱动可以处理这个设备，于是调用 amdgpu_pci_probe() 函数来初始化。',
              '每个 PCI 设备还有一个 BDF 地址（Bus:Device.Function），如 03:00.0，表示 PCI 总线 3、设备 0、功能 0。这个地址在 lspci 输出和 /sys/bus/pci/devices/ 下都能看到。对于调试来说，BDF 地址是定位特定设备的关键。',
              '除了 Vendor/Device ID，PCI 配置空间还包含 Class Code（设备类型，GPU 是 0x0300 "VGA controller"）、Subsystem Vendor/Device ID（子系统标识，区分同一芯片的不同品牌显卡）、BAR（Base Address Register，GPU 暴露的内存窗口地址）等信息。这些信息在 lspci -v 的输出中都能看到。',
            ],
            keyPoints: [
              'PCI 设备通过 Vendor ID (0x1002=AMD) + Device ID (0x7480=Navi33) 唯一标识',
              'amdgpu 驱动的 pciidlist[] 表将 Device ID 映射到 CHIP_NAVI33 等内部枚举值',
              'BDF 地址 (Bus:Device.Function) 如 03:00.0 用于在系统中定位特定 PCI 设备',
              'PCI 配置空间 = 256 字节的标准头（Vendor/Device ID、BAR、Class Code 等）',
              'BAR 寄存器定义了 GPU 暴露给 CPU 的内存窗口（VRAM BAR、寄存器 BAR、Doorbell BAR）',
              '/sys/bus/pci/devices/ 和 /sys/class/drm/ 是内核暴露 PCI 信息的 sysfs 接口',
            ],
          },
          diagram: {
            title: 'PCI 设备发现与驱动匹配流程',
            content: `PCI 设备发现 → 驱动匹配 → 初始化流程

系统启动
   │
   ▼
PCI 子系统扫描总线
   │
   ├─ Bus 00: 主桥
   ├─ Bus 01: NVMe SSD [8086:xxxx] → nvme 驱动
   ├─ Bus 02: 网卡     [8086:xxxx] → e1000e 驱动
   └─ Bus 03: GPU      [1002:7480] → ???
                            │
                            ▼
              查找匹配的驱动（搜索所有注册的 pci_driver）
                            │
              amdgpu 的 pciidlist 匹配成功：
              ┌─────────────────────────────────────────┐
              │ {0x1002, 0x7480, ..., CHIP_NAVI33}      │
              │  ↑ AMD    ↑ Navi33         ↑ 内部芯片类型 │
              └─────────────────────────────────────────┘
                            │
                            ▼
              调用 amdgpu_pci_probe(pdev, ent)
              │
              ├─ pci_enable_device(pdev)     → 启用 PCI 设备
              ├─ pci_set_master(pdev)        → 允许 GPU 做 DMA
              ├─ pci_ioremap_bar(pdev, 0)    → 映射 VRAM BAR
              ├─ pci_ioremap_bar(pdev, 2)    → 映射寄存器 BAR
              └─ amdgpu_device_init(adev)    → 初始化所有 IP Block

lspci 输出示例：
03:00.0 VGA compatible controller [0300]:
  Advanced Micro Devices [AMD/ATI] Navi33 [Radeon RX 7600/7600 XT] [1002:7480]
  │           │                                                      │    │
  └─ BDF     └─ Class Code                                          │    └─ Device ID
              0300 = VGA                              Vendor ID ─────┘`,
            caption: 'PCI 设备发现和驱动匹配的完整流程。内核通过 Vendor:Device ID 匹配找到 amdgpu 驱动，然后调用 probe 函数初始化 GPU。',
          },
          codeWalk: {
            title: 'amdgpu 的 PCI 设备 ID 表',
            file: 'drivers/gpu/drm/amd/amdgpu/amdgpu_drv.c',
            language: 'c',
            code: `/* amdgpu_drv.c — PCI 设备 ID 表（简化版）
 * 完整表有数百个条目，覆盖 GCN 到 RDNA4 所有 AMD GPU
 */
static const struct pci_device_id pciidlist[] = {
    /* GCN 5.0 - Vega */
    {0x1002, 0x6860, PCI_ANY_ID, PCI_ANY_ID, 0, 0, CHIP_VEGA10},

    /* RDNA 2 - Navi 21 (RX 6800 XT / 6900 XT) */
    {0x1002, 0x73BF, PCI_ANY_ID, PCI_ANY_ID, 0, 0, CHIP_NAVI21},

    /* RDNA 3 - Navi 31 (RX 7900 XTX) */
    {0x1002, 0x744C, PCI_ANY_ID, PCI_ANY_ID, 0, 0, CHIP_NAVI31},

    /* RDNA 3 - Navi 33 (RX 7600 XT) ← 你的 GPU! */
    {0x1002, 0x7480, PCI_ANY_ID, PCI_ANY_ID, 0, 0, CHIP_NAVI33},
    {0x1002, 0x7483, PCI_ANY_ID, PCI_ANY_ID, 0, 0, CHIP_NAVI33},
    /*  ↑         ↑        ↑          ↑              ↑
     * Vendor  Device  Subvendor  Subdevice      ASIC 类型
     * 0x1002  0x7480  不限制     不限制        CHIP_NAVI33
     * = AMD   = Navi33                         → 选择 gfx_v11_0
     *                                           → 选择 sdma_v6_0
     *                                           → 选择 dcn_3_2
     */

    {0, 0, 0}  /* 终止符 */
};
MODULE_DEVICE_TABLE(pci, pciidlist);

/* CHIP_NAVI33 这个枚举值决定了驱动加载哪些 IP Block：
 *   GFX → gfx_v11_0.c (RDNA3 图形引擎)
 *   SDMA → sdma_v6_0.c (DMA 引擎)
 *   DC → dcn32 (显示控制器)
 *   VCN → vcn_v4_0.c (视频编解码)
 *   SMU → smu_v13_0.c (电源管理)
 */`,
            annotations: [
              '每行定义一个支持的 GPU：Vendor ID + Device ID + ASIC 类型',
              'PCI_ANY_ID 表示不限制 Subsystem Vendor/Device，任何使用该芯片的显卡都匹配',
              'CHIP_NAVI33 是内部枚举值，在 amdgpu_device_init 中决定加载哪些 IP Block 实现',
              'MODULE_DEVICE_TABLE 导出此表，让 modprobe 和 udev 能自动加载正确的驱动',
              '同一个芯片（Navi33）可能有多个 Device ID（0x7480、0x7483），对应不同的 SKU',
            ],
            explanation: '这个设备 ID 表是 amdgpu 驱动的入口点——它告诉内核"我能处理哪些 GPU"。当内核在 PCI 总线上发现你的 RX 7600 XT (0x1002:0x7480) 时，它查找这个表并匹配到 CHIP_NAVI33。这个信息随后被传递给 amdgpu_device_init()，后者根据 CHIP_NAVI33 加载 RDNA3 的 IP Block 实现（gfx_v11_0、sdma_v6_0 等）。',
          },
          miniLab: {
            title: '完整识别你的 GPU 硬件信息',
            objective: '使用多种工具获取 RX 7600 XT 的完整硬件信息，并在内核源码中找到对应的条目。',
            steps: [
              '运行 lspci -nn | grep -i "vga\\|3d\\|display"，记录 BDF 地址和 [Vendor:Device] ID',
              '查看详细信息：lspci -v -s <BDF> （替换 <BDF> 为上一步得到的地址，如 03:00.0）',
              '在输出中找到 "Memory at" 开头的行——这些是 BAR 地址',
              '查看 sysfs 信息：ls /sys/class/drm/card0/device/（列出所有可读的属性文件）',
              '读取关键属性：cat /sys/class/drm/card0/device/uevent（驱动名、PCI ID 等）',
              '如果已克隆内核源码：grep -n "0x7480" drivers/gpu/drm/amd/amdgpu/amdgpu_drv.c',
            ],
            expectedOutput: `$ lspci -nn | grep -i "vga\\|3d"
03:00.0 VGA compatible controller [0300]: ... [1002:7480] (rev c7)

$ lspci -v -s 03:00.0 | grep "Memory at"
  Memory at d0000000 (64-bit, prefetchable) [size=256M]  ← BAR 0: VRAM
  Memory at e0000000 (64-bit, non-prefetchable) [size=2M] ← BAR 2: 寄存器
  Memory at e0200000 (64-bit, non-prefetchable) [size=2M] ← BAR 4: Doorbell

$ cat /sys/class/drm/card0/device/uevent
DRIVER=amdgpu
PCI_ID=1002:7480
PCI_SUBSYS_ID=...`,
            hint: '如果你的系统有多个 GPU（如集成显卡 + 独显），确保查看的是正确的设备。card0 可能是集显，card1 才是你的独立 AMD GPU。',
          },
          debugExercise: {
            title: '修复错误的 PCI 设备 ID 条目',
            language: 'c',
            description: '以下代码在 pciidlist 中为一个新的 AMD GPU 添加了条目，但有一个错误导致驱动无法匹配到该 GPU。',
            question: '找出为什么这个新 GPU 无法被 amdgpu 驱动识别。',
            buggyCode: `/* 为新的 GPU "Navi99" 添加设备 ID 支持 */
static const struct pci_device_id pciidlist[] = {
    /* ... 其他条目 ... */

    /* 新增：Navi99 (假设 Device ID 0x9900) */
    {0x1002, 0x9900, PCI_ANY_ID, PCI_ANY_ID, 0, 0, CHIP_NAVI33},

    {0, 0, 0}  /* 终止符 */

    /* 忘记重新编译就 insmod 了！ */
    /* 而且 CHIP 类型应该是 CHIP_NAVI99 不是 CHIP_NAVI33 */
};`,
            hint: '这个题有两层问题：一个是数据层面的（CHIP 类型错误），一个是流程层面的（修改内核代码后需要做什么？）。',
            answer: '两个问题：（1）CHIP 类型错误：使用了 CHIP_NAVI33 而不是 CHIP_NAVI99（假设已定义）。这会导致驱动为新 GPU 加载 Navi33 的 IP Block 实现（gfx_v11_0 等），但新 GPU 可能需要不同的 IP 版本，导致初始化失败或硬件行为异常。（2）流程问题：修改内核源码后必须重新编译内核（或至少重新编译 amdgpu 模块：make M=drivers/gpu/drm/amd），然后重新加载模块（sudo rmmod amdgpu && sudo modprobe amdgpu）或重启系统。直接 insmod 旧的 .ko 文件不会包含你的修改。此外，还需要运行 MODULE_DEVICE_TABLE 宏来更新设备表，让 modprobe 知道新的 Device ID。',
          },
          interviewQ: {
            question: '解释 Linux 内核如何发现 PCI 设备并将其与正确的驱动匹配。以 amdgpu 为例。',
            difficulty: 'medium',
            hint: '描述 PCI 枚举 → 设备 ID 匹配 → probe 调用的流程，提及 pciidlist、MODULE_DEVICE_TABLE 和 pci_register_driver。',
            answer: '流程：（1）BIOS/UEFI 完成 PCI 总线枚举，将设备信息写入 PCI 配置空间；（2）Linux 内核的 PCI 子系统（drivers/pci/）扫描所有总线，为每个设备创建 struct pci_dev 结构体，包含 Vendor ID、Device ID 等信息；（3）amdgpu 驱动在 module_init 中调用 pci_register_driver(&amdgpu_kms_pci_driver)，注册自己和它的 id_table（pciidlist）；（4）PCI 子系统将每个设备的 Vendor:Device ID 与所有注册驱动的 id_table 匹配；（5）当找到匹配（如 0x1002:0x7480 匹配 CHIP_NAVI33）时，调用驱动的 probe 函数（amdgpu_pci_probe）；（6）probe 函数接收 pci_dev 和匹配的 pci_device_id，从中获取 CHIP 类型，然后初始化 GPU。MODULE_DEVICE_TABLE 宏将 pciidlist 导出到模块的 ELF section，让 depmod 和 modprobe 能在不加载模块的情况下知道它支持哪些设备，实现自动加载。',
            amdContext: '这个问题测试你对 Linux 驱动模型的理解。在 AMD 面试中，展示你知道从 PCI 枚举到 amdgpu_pci_probe 的完整路径会给面试官留下深刻印象。',
          },
        },

        // ── Lesson 0.2.2 ──────────────────────────────────────
        {
          id: '0-2-2',
          number: '0.2.2',
          title: '读懂 dmesg — 你的第一个调试工具',
          titleEn: 'Reading dmesg — Your First Debugging Tool',
          duration: 15,
          difficulty: 'beginner',
          tags: ['dmesg', 'debugging', 'printk', 'kernel-log'],
          concept: {
            summary: 'dmesg 是内核的环形日志缓冲区，记录了从系统启动到现在内核发出的所有消息。对于 GPU 驱动开发，dmesg 是最基本也是最重要的调试工具——GPU 初始化状态、错误信息、Hang 诊断信息都在这里。',
            explanation: [
              '内核中没有 printf，但有 printk——它的功能类似 printf，但输出到内核的环形缓冲区（ring buffer）而非终端。dmesg 命令就是用来读取这个缓冲区的。缓冲区大小通常为 128KB-1MB，当缓冲区满时，旧消息会被新消息覆盖。',
              '每条内核消息有一个日志级别（0-7）：KERN_EMERG(0) 到 KERN_DEBUG(7)。amdgpu 驱动使用多种日志宏：DRM_INFO（普通信息，如驱动加载成功）、DRM_WARN（警告，如性能下降）、DRM_ERROR（错误，如 GPU Hang）、DRM_DEBUG_DRIVER（调试信息，默认关闭）。',
              '当 amdgpu 驱动加载时（系统启动或 modprobe amdgpu），它会在 dmesg 中打印大量初始化信息：检测到的 GPU 型号、固件版本、VRAM 大小、IP Block 初始化状态、显示器连接情况等。这些信息是诊断驱动问题的第一手资料。',
              '如果 GPU 出现问题（如 Hang、显示异常），dmesg 中通常会有相关的错误信息。学会快速在 dmesg 中定位关键信息——搜索 "amdgpu"、"error"、"hang"、"timeout"、"fault" 等关键词——是 GPU 驱动开发者最基本的技能。',
            ],
            keyPoints: [
              'dmesg 读取内核的环形日志缓冲区，包含从启动到现在的所有内核消息',
              '日志级别 0-7：EMERG > ALERT > CRIT > ERR > WARN > NOTICE > INFO > DEBUG',
              'amdgpu 使用 DRM_INFO/WARN/ERROR/DEBUG_DRIVER 宏输出日志',
              'dmesg | grep -i amdgpu 是诊断 GPU 问题的第一步',
              'GPU Hang 时 dmesg 会包含寄存器 dump（GRBM_STATUS、CP_RB_RPTR/WPTR）',
              '动态调试：echo "module amdgpu +p" > /sys/kernel/debug/dynamic_debug/control',
            ],
          },
          diagram: {
            title: 'amdgpu 初始化时的 dmesg 日志流程',
            content: `amdgpu 驱动加载时的 dmesg 日志（标注来源函数）

时间           日志内容                                    来源
──────         ────────                                    ────
[  2.301]  amdgpu 0000:03:00.0: enabling device          pci_enable_device
[  2.301]  [drm] amdgpu kernel modesetting enabled.       amdgpu_drv.c
[  2.302]  [drm] initializing kernel modesetting          amdgpu_device_init
                   (NAVI33, 0x1002:0x7480, ...)

[  2.350]  amdgpu: Fetched ucodes:                        amdgpu_ucode.c
           amdgpu:   GFX CP RS64 fw version...            ← GPU 固件加载
           amdgpu:   SDMA firmware version...
           amdgpu:   VCN firmware version...

[  2.400]  [drm] VRAM: 8176M                              amdgpu_gmc.c
           [drm] VRAM width 128bits GDDR6                 ← VRAM 信息
           [drm] GTT: 8176M

[  2.450]  [drm] PSP is alive!                            psp_v13_0.c
           [drm] Loading GFX firmware...                   ← IP Block 初始化
           [drm] Loading SDMA firmware...

[  2.600]  [drm] Display Core initialized                 dc/dc.c
           [drm] Connector 0: DP-1 (connected)            ← 显示器检测
           [drm] Connector 1: HDMI-A-1 (disconnected)

[  2.700]  [drm] fb0: amdgpudrmfb frame buffer            ← 帧缓冲就绪
           [drm] Initialized amdgpu ...                    ← 驱动加载完成 ✓

如果出错会看到：
[  2.500]  [drm:amdgpu_device_init] *ERROR* ...           ← 初始化失败
[  2.500]  amdgpu: probe of 0000:03:00.0 failed           ← probe 失败`,
            caption: 'amdgpu 驱动加载时的完整 dmesg 日志流程。每条日志都对应驱动代码中的一个 printk 调用。学会阅读这些日志是调试的基础。',
          },
          codeWalk: {
            title: '解析你自己的 amdgpu dmesg 输出',
            file: 'terminal',
            language: 'bash',
            code: `# 查看 amdgpu 驱动的所有启动消息
dmesg | grep -i amdgpu

# 只看错误和警告
dmesg --level=err,warn | grep -i amdgpu

# 查看固件加载信息
dmesg | grep -i "firmware\\|ucode\\|fw version"

# 查看 VRAM 和内存配置
dmesg | grep -i "vram\\|gtt\\|memory"

# 查看显示器连接状态
dmesg | grep -i "connector\\|display\\|hdmi\\|dp-"

# 查看 IP Block 初始化
dmesg | grep -i "psp\\|gfx\\|sdma\\|vcn\\|dcn\\|smu"

# 实时监控新的 amdgpu 消息
sudo dmesg -w | grep -i amdgpu

# 将完整的 amdgpu 日志保存到文件（调试时必备）
dmesg | grep -i amdgpu > ~/amdgpu_dmesg.log`,
            annotations: [
              'dmesg --level=err,warn 只显示错误和警告级别，快速定位问题',
              '"firmware" 和 "ucode" 关键词对应 GPU 固件加载——固件加载失败是常见问题',
              '"VRAM: 8176M" 中的数字不是 8192 因为一部分 VRAM 被固件和系统保留',
              'dmesg -w 是 watch 模式，实时显示新消息——在测试时非常有用',
              '保存到文件在提交 Bug 报告时必须附带完整的 dmesg 输出',
            ],
            explanation: '这些命令是你作为 GPU 驱动开发者每天都会用到的。当用户报告一个 GPU 问题时，你的第一反应应该是"dmesg 里有什么？"。学会从 dmesg 中快速提取关键信息是高效调试的基础。',
          },
          miniLab: {
            title: '创建你的 GPU 硬件档案',
            objective: '收集 RX 7600 XT 的完整硬件信息并保存为结构化档案。这些信息在后续模块的学习中会反复用到。',
            steps: [
              '创建目录：mkdir -p ~/amd-driver-journey/hardware-info',
              '保存 PCI 信息：lspci -v -s $(lspci | grep -i amd | cut -d " " -f1) > ~/amd-driver-journey/hardware-info/lspci.txt',
              '保存 dmesg：dmesg | grep -i amdgpu > ~/amd-driver-journey/hardware-info/dmesg_amdgpu.txt',
              '保存 sysfs 信息：cat /sys/class/drm/card0/device/uevent > ~/amd-driver-journey/hardware-info/sysfs_uevent.txt',
              '保存 GPU 状态：cat /sys/class/drm/card0/device/pp_dpm_sclk > ~/amd-driver-journey/hardware-info/gpu_clocks.txt',
              '检查所有文件：ls -la ~/amd-driver-journey/hardware-info/',
            ],
            expectedOutput: `$ ls -la ~/amd-driver-journey/hardware-info/
-rw-r--r-- 1 user user 2048  lspci.txt
-rw-r--r-- 1 user user 4096  dmesg_amdgpu.txt
-rw-r--r-- 1 user user  256  sysfs_uevent.txt
-rw-r--r-- 1 user user  128  gpu_clocks.txt`,
            hint: '如果你使用的是没有 AMD GPU 的机器（如笔记本），可以在虚拟机中加载 amdgpu 驱动来模拟部分输出。但最好的学习方式是使用真实硬件。',
          },
          debugExercise: {
            title: '从 dmesg 诊断驱动加载失败',
            language: 'text',
            description: '以下是一段 amdgpu 驱动加载失败的 dmesg 输出。找出失败的原因。',
            question: 'GPU 驱动为什么加载失败？提示：关注固件相关的行。',
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
            hint: 'error -2 在 Linux 中是 -ENOENT（文件不存在）。Direct firmware load 失败意味着什么？',
            answer: '问题：GPU 固件文件缺失。dmesg 显示 "Direct firmware load for amdgpu/psp_13_0_7_sos.bin failed with error -2"，错误码 -2 = -ENOENT（No such file or directory）。这表示内核在 /lib/firmware/amdgpu/ 目录下找不到 PSP（Platform Security Processor）固件文件 psp_13_0_7_sos.bin。PSP 是 GPU 的安全处理器，必须先加载 PSP 固件才能初始化其他 IP Block。解决方法：安装正确版本的 linux-firmware 包（sudo apt install linux-firmware）。如果使用的是最新的内核但 firmware 包较旧，可能需要从 linux-firmware git 仓库手动下载最新固件。这是新硬件上运行 Linux 时最常见的问题之一。',
          },
          interviewQ: {
            question: '当用户报告 GPU 驱动无法加载时，你会如何开始调试？描述你的前 5 个步骤。',
            difficulty: 'medium',
            hint: '从信息收集（dmesg、系统信息）到问题分类（固件、硬件、配置）的系统化调试流程。',
            answer: '前 5 个调试步骤：（1）收集 dmesg：dmesg | grep -i "amdgpu\\|drm\\|error\\|fail" > /tmp/gpu_debug.log。首先看有没有明显的错误信息（如 firmware load failed、probe failed）。（2）确认硬件被发现：lspci -nn | grep AMD。如果 lspci 看不到 GPU，问题在 PCI 层（BIOS 设置、物理连接、PCIe 槽位）。（3）确认驱动已加载：lsmod | grep amdgpu。如果没有，检查内核是否编译了 amdgpu（zgrep AMDGPU /proc/config.gz 或 modinfo amdgpu）。（4）检查固件：ls /lib/firmware/amdgpu/ | wc -l。固件缺失是最常见的加载失败原因，特别是在使用新硬件或自编译内核时。（5）查看内核版本：uname -r。新 GPU 往往需要较新的内核和 linux-firmware 组合支持（建议优先参考当前发行版/官方支持矩阵，而不是记固定版本号）。如果前 5 步没有定位问题，接下来会启用动态调试（echo "module amdgpu +p" > dynamic_debug/control）获取更详细的日志。',
            amdContext: '这种系统化的调试思路是 AMD 面试中非常看重的。面试官想看到的不是"我会 Google 错误信息"，而是一个结构化的诊断流程。',
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
      title: '开发环境搭建',
      titleEn: 'Development Environment Setup',
      icon: '🛠️',
      description: '搭建完整的内核开发环境：工具安装、内核源码获取、代码导航配置。这是所有后续模块的基础。',
      lessons: [
        // ── Lesson 0.3.1 ──────────────────────────────────────
        {
          id: '0-3-1',
          number: '0.3.1',
          title: '搭建内核开发工作区',
          titleEn: 'Building Your Kernel Dev Workspace',
          duration: 20,
          difficulty: 'beginner',
          tags: ['kernel', 'build', 'toolchain', 'git'],
          concept: {
            summary: '一个完整的内核开发环境需要：编译工具链（gcc/clang、make）、内核源码（git clone）、代码导航工具（cscope/ctags 或 clangd）、以及安全测试环境（KVM 虚拟机或独立测试机）。本节将手把手搭建这个环境。',
            explanation: [
              '内核开发与普通应用开发有一个根本区别：你写的代码在内核空间运行，一个空指针解引用就会导致整个系统崩溃（Kernel Panic）。因此，安全的测试环境至关重要。推荐的方案是使用 KVM/QEMU 虚拟机进行危险的内核实验，在虚拟机中加载你修改的内核或模块，即使崩溃也只需要重启虚拟机。',
              '编译内核需要的工具链：gcc 或 clang（编译器）、make（构建系统）、flex 和 bison（词法/语法分析器，内核配置系统需要）、libelf-dev 和 libssl-dev（ELF 处理和签名验证）、bc（构建脚本中的数学计算）。对于 amdgpu 开发，还需要 libdrm-dev 和 xserver-xorg-dev（如果你要运行 IGT 测试）。',
              '内核源码的获取有几种方式：（1）Linus Torvalds 的主线仓库（最新稳定版）：git clone https://github.com/torvalds/linux.git；（2）AMD 的 drm-next 分支（amdgpu 最新开发版）：git clone https://gitlab.freedesktop.org/agd5f/linux.git --branch amd-staging-drm-next；（3）浅克隆（节省空间）：加 --depth=1 参数。AMD 的 drm-next 分支包含了还未合并到 Linus 主线的最新 amdgpu 补丁，对于 amdgpu 开发来说这是最推荐的源码基。',
              '代码导航是高效阅读内核代码的关键。推荐两种方案：（1）cscope + ctags（经典方案）：在内核源码根目录运行 make cscope && make tags，然后在 vim/emacs 中可以跳转到函数定义、查找引用；（2）clangd（现代方案）：运行 scripts/clang-tools/gen_compile_commands.py 生成 compile_commands.json，然后 VS Code 的 clangd 扩展可以提供智能补全和跳转。',
            ],
            keyPoints: [
              '安全第一：使用 KVM 虚拟机测试修改过的内核，避免破坏主机',
              '必需工具：gcc/clang, make, flex, bison, libelf-dev, libssl-dev, bc, git',
              '推荐源码：AMD drm-next 分支（包含最新 amdgpu 补丁）',
              '代码导航：cscope+ctags（vim/emacs）或 clangd（VS Code）',
              '内核编译：make defconfig → make -j$(nproc) → 约 10-30 分钟',
              '模块单独编译：make M=drivers/gpu/drm/amd 只编译 amdgpu 模块',
            ],
          },
          diagram: {
            title: '内核开发工作流',
            content: `内核开发日常工作流

┌─────────────────────────────────────────────────────────────┐
│  1. 获取源码                                                 │
│  git clone --depth=1                                        │
│    https://gitlab.freedesktop.org/agd5f/linux.git           │
│    --branch amd-staging-drm-next                            │
│                                                              │
│  目录结构：                                                  │
│  linux/                                                      │
│  ├── drivers/gpu/drm/amd/    ← amdgpu 驱动代码（主战场）    │
│  ├── include/drm/             ← DRM 头文件                  │
│  ├── include/uapi/drm/        ← 用户空间 API 头文件         │
│  └── Makefile, Kconfig, ...   ← 构建系统                    │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│  2. 配置 & 编译                                              │
│                                                              │
│  make defconfig                 ← 使用默认配置              │
│  scripts/config --enable DRM_AMDGPU  ← 确保启用 amdgpu     │
│  make -j$(nproc)                ← 全量编译（首次，~30min）  │
│                                                              │
│  --- 修改代码后 ---                                          │
│  make M=drivers/gpu/drm/amd    ← 只编译 amdgpu（~1min）    │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│  3. 测试                                                     │
│                                                              │
│  方案 A: 虚拟机（安全）                                      │
│  sudo insmod amdgpu.ko         ← 在 KVM 虚拟机中加载       │
│  dmesg | grep amdgpu           ← 检查是否正常加载           │
│                                                              │
│  方案 B: 真机（日常开发，已验证的修改）                      │
│  sudo rmmod amdgpu && sudo modprobe amdgpu                  │
│  sudo ./build/tests/amdgpu_test  ← 运行 IGT 测试           │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│  4. 提交补丁（Module 11 详细讲解）                           │
│                                                              │
│  git add -p && git commit -s                                │
│  scripts/checkpatch.pl HEAD~1..HEAD                         │
│  git format-patch HEAD~1 && git send-email ...              │
└─────────────────────────────────────────────────────────────┘`,
            caption: '内核开发的完整工作流：获取源码 → 配置编译 → 测试 → 提交补丁。模块单独编译（make M=...）是日常开发中最常用的命令。',
          },
          codeWalk: {
            title: '完整的开发环境搭建命令',
            file: 'terminal',
            language: 'bash',
            code: `#!/bin/bash
# AMD GPU 驱动开发环境搭建脚本（Ubuntu 22.04 / 24.04）

# 1. 安装编译工具链
sudo apt update
sudo apt install -y \\
    build-essential gcc clang llvm \\
    flex bison bc \\
    libelf-dev libssl-dev libncurses-dev \\
    git cscope ctags \\
    python3 python3-pip

# 2. 安装 amdgpu 开发额外依赖
sudo apt install -y \\
    libdrm-dev libkmod-dev \\
    libcairo2-dev libpixman-1-dev \\
    libudev-dev libjson-c-dev \\
    trace-cmd linux-tools-common

# 3. 克隆 AMD drm-next 内核源码（浅克隆节省空间）
git clone --depth=1 \\
    https://gitlab.freedesktop.org/agd5f/linux.git \\
    --branch amd-staging-drm-next \\
    ~/kernel-src
cd ~/kernel-src

# 4. 配置内核（使用当前运行的内核配置作为基础）
cp /boot/config-$(uname -r) .config
make olddefconfig

# 确保 amdgpu 相关选项已启用
scripts/config --enable DRM_AMDGPU
scripts/config --enable DRM_AMDGPU_SI    # GCN 1.0 支持
scripts/config --enable DRM_AMDGPU_CIK   # GCN 2.0 支持
scripts/config --enable HSA_AMD           # KFD/ROCm 支持

# 5. 生成代码导航数据库
make cscope    # 生成 cscope 数据库（vim: :cs find g function_name）
make tags      # 生成 ctags 数据库（vim: Ctrl+]）
# 或者用 clangd（VS Code 推荐）：
# scripts/clang-tools/gen_compile_commands.py

# 6. 编译内核（首次，约 10-30 分钟）
make -j$(nproc)

# 7. 后续开发：只编译 amdgpu 模块（约 1 分钟）
make M=drivers/gpu/drm/amd -j$(nproc)

echo "开发环境搭建完成！"`,
            annotations: [
              'build-essential 包含 gcc、make 等基本编译工具',
              'flex/bison 是内核配置系统（Kconfig）需要的词法/语法分析器',
              'libelf-dev 处理 ELF 格式（内核和模块都是 ELF 文件）',
              'amd-staging-drm-next 分支包含最新的 amdgpu 补丁，比 Linus 主线超前数周',
              'cp /boot/config-$(uname -r) 复用当前内核的配置，避免从零配置的麻烦',
              'make M=drivers/gpu/drm/amd 是日常开发最常用的命令——只编译修改的模块',
            ],
            explanation: '这个脚本涵盖了从零搭建内核开发环境的所有步骤。保存这个脚本，在新机器上只需运行一次就能搭建好环境。重点记住 make M=... 命令——在 amdgpu 开发中，你不需要每次都编译整个内核，只编译修改的模块就够了。',
          },
          miniLab: {
            title: '搭建你的内核开发环境',
            objective: '实际执行开发环境搭建，确认所有工具已安装，内核可以编译。',
            setup: '# 确保你有至少 20GB 可用磁盘空间和 8GB+ 内存',
            steps: [
              '安装编译依赖：sudo apt install -y build-essential gcc flex bison bc libelf-dev libssl-dev libncurses-dev git',
              '克隆内核源码：git clone --depth=1 https://github.com/torvalds/linux.git ~/kernel-src && cd ~/kernel-src',
              '配置内核：make defconfig && scripts/config --enable DRM_AMDGPU',
              '只编译 amdgpu 模块：make M=drivers/gpu/drm/amd -j$(nproc)',
              '验证编译成功：ls -la drivers/gpu/drm/amd/amdgpu/amdgpu.ko（应该能看到 .ko 文件）',
              '生成代码导航：make cscope && make tags',
              '验证 cscope：cscope -d -L -0 amdgpu_device_init（应该显示函数定义位置）',
            ],
            expectedOutput: `$ ls -la drivers/gpu/drm/amd/amdgpu/amdgpu.ko
-rw-r--r-- 1 user user 45M amdgpu.ko    ← 编译成功

$ cscope -d -L -0 amdgpu_device_init
drivers/gpu/drm/amd/amdgpu/amdgpu_device.c amdgpu_device_init ...
← cscope 可以定位到函数定义`,
            hint: '如果编译失败提示缺少头文件，通常是某个 -dev 包没有安装。错误信息中一般会说明缺少的是什么。使用 apt-file search <header.h> 可以找到需要安装的包。',
          },
          debugExercise: {
            title: '修复内核编译错误',
            language: 'text',
            description: '你尝试编译 amdgpu 模块，但遇到了以下编译错误。找出问题并给出解决方法。',
            question: '这个编译错误的原因是什么？如何解决？',
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
            hint: '这个错误表示内核头文件缺失。但问题不一定是包没装——也可能是 make 的执行位置不对。',
            answer: '这个错误有两种常见原因：（1）没有在内核源码根目录执行 make：make M=... 必须在包含 Makefile 的内核源码根目录运行，否则找不到内核头文件。解决：cd ~/kernel-src && make M=drivers/gpu/drm/amd -j$(nproc)。（2）没有先运行配置步骤：如果直接 make M=... 但之前没有执行 make defconfig（或 make menuconfig），内核的构建系统不知道配置信息，可能导致头文件路径不正确。解决：先运行 make defconfig 生成 .config 文件，然后再编译模块。这类编译环境问题是新手最常遇到的——关键是确保你在正确的目录、用正确的配置来执行编译。',
          },
          interviewQ: {
            question: '描述你的内核开发工作流：从修改代码到测试到提交补丁。',
            difficulty: 'easy',
            hint: '展示你对完整开发周期的理解：编辑 → 编译（make M=...）→ 测试（insmod/IGT）→ 检查（checkpatch）→ 提交（git format-patch + send-email）。',
            answer: '我的内核开发工作流：（1）准备：git checkout -b fix/my-bugfix 创建工作分支，基于 AMD drm-next 分支。（2）编辑：使用 VS Code + clangd（或 vim + cscope）定位并修改代码。（3）编译：make M=drivers/gpu/drm/amd -j$(nproc) 只编译修改的模块（~1 分钟），确保没有编译错误和警告（make W=1 开启额外警告）。（4）测试：先在 KVM 虚拟机中 insmod amdgpu.ko 验证模块加载正常，然后在真机上 sudo rmmod amdgpu && sudo modprobe amdgpu 重新加载，运行相关的 IGT 测试（sudo ./build/tests/amdgpu/amdgpu_test）。（5）检查代码风格：scripts/checkpatch.pl --strict HEAD~1..HEAD，确保 0 errors, 0 warnings。（6）提交：git commit -s 添加 Signed-off-by，使用规范的 commit message 格式（drm/amdgpu: fix xxx）。（7）发送补丁：git format-patch HEAD~1 生成补丁文件，git send-email 发送到 amd-gfx@lists.freedesktop.org。（8）回应 Review：认真回应每条 Review 评论，修改后发送 v2。',
            amdContext: '这个问题测试你是否有实际的内核开发经验。即使你还没有提交过补丁，展示你知道完整的流程（包括 checkpatch 和 send-email）也会给面试官留下好印象。',
          },
        },
      ],
    },
  ],
  completionChecklist: [
    '理解 GPU 驱动的核心职责：内存管理、任务调度、中断处理、显示控制、电源管理',
    '能画出 Linux 图形栈的完整分层图（应用 → Mesa → libdrm → DRM → amdgpu → GPU）',
    '知道 RX 7600 XT 的 PCI Device ID (0x7480) 并能在内核源码中找到对应条目',
    '能使用 dmesg 诊断 amdgpu 驱动加载问题',
    '搭建了完整的内核开发环境，能编译 amdgpu 模块',
    '使用 cscope/ctags 或 clangd 导航内核源码',
    '理解 AMD 开源策略的优势，以及 amd-gfx 邮件列表的作用',
  ],
};
