// ============================================================
// AMD Linux Driver Learning Platform - Glossary Data
// 每个模块的术语词典：缩写、英文全称、中文翻译、用途说明
// ============================================================
import type { GlossaryTerm } from './curriculum';

export const glossaryByModule: Record<string, GlossaryTerm[]> = {

  // ── Module 0: 引言 ──────────────────────────────────────
  intro: [
    { abbr: 'GPU', fullEn: 'Graphics Processing Unit', zhName: '图形处理器', description: '专门用于并行图形渲染和通用计算的处理器，AMD Radeon 系列的核心芯片。', category: 'hardware' },
    { abbr: 'LKML', fullEn: 'Linux Kernel Mailing List', zhName: 'Linux 内核邮件列表', description: 'Linux 内核开发者通过邮件讨论代码、提交补丁的主要协作平台。', category: 'kernel' },
    { abbr: 'KMS', fullEn: 'Kernel Mode Setting', zhName: '内核模式设置', description: '在内核空间完成显示分辨率和颜色深度设置的机制，取代了旧的用户空间模式设置。', category: 'graphics' },
    { abbr: 'DRM', fullEn: 'Direct Rendering Manager', zhName: '直接渲染管理器', description: 'Linux 内核中管理 GPU 资源、协调多进程 GPU 访问的子系统框架。', category: 'graphics' },
    { abbr: 'ROCm', fullEn: 'Radeon Open Compute platform', zhName: 'Radeon 开放计算平台', description: 'AMD 的开源 GPU 计算平台，对标 NVIDIA CUDA，用于 AI/HPC 工作负载。', category: 'compute' },
    { abbr: 'LLVM', fullEn: 'Low Level Virtual Machine', zhName: '底层虚拟机', description: '模块化、可重用的编译器和工具链基础设施，AMD GPU 着色器编译的核心工具。', category: 'toolchain' },
    { abbr: 'API', fullEn: 'Application Programming Interface', zhName: '应用程序编程接口', description: '软件组件之间交互的规范接口，如 Vulkan、OpenGL 是图形 API。', category: 'general' },
    { abbr: 'KVM', fullEn: 'Kernel-based Virtual Machine', zhName: '基于内核的虚拟机', description: 'Linux 内核内置的虚拟化技术，可用于安全地进行内核实验而不损坏主机。', category: 'kernel' },
  ],

  // ── Module 0.5: AMD 生态系统概览 ────────────────────────
  ecosystem: [
    { abbr: 'RDNA', fullEn: 'Radeon DNA', zhName: 'Radeon DNA 架构', description: 'AMD 自 2019 年起用于消费级 GPU 的现代图形架构，当前最新为 RDNA3（RX 7000 系列）。', category: 'hardware' },
    { abbr: 'GCN', fullEn: 'Graphics Core Next', zhName: '图形核心下一代', description: 'AMD 2012-2019 年使用的 GPU 架构，奠定了现代 amdgpu 驱动的基础，大量 legacy 代码来自此架构。', category: 'hardware' },
    { abbr: 'CDNA', fullEn: 'Compute DNA', zhName: '计算 DNA 架构', description: 'AMD 专为数据中心 AI/HPC 设计的 GPU 架构，用于 Instinct MI 系列，与 RDNA 分离演进。', category: 'hardware' },
    { abbr: 'APU', fullEn: 'Accelerated Processing Unit', zhName: '加速处理器', description: 'AMD 将 CPU 和 GPU 集成在同一芯片上的产品，如 Ryzen 7000 系列中的集显部分。', category: 'hardware' },
    { abbr: 'HBM', fullEn: 'High Bandwidth Memory', zhName: '高带宽内存', description: '堆叠式 DRAM 内存技术，带宽远高于 GDDR，用于 Instinct MI 系列数据中心 GPU。', category: 'hardware' },
    { abbr: 'GDDR', fullEn: 'Graphics Double Data Rate', zhName: '图形双倍数据速率内存', description: '专为 GPU 设计的高速显存，RX 7600 XT 使用 GDDR6，是消费级 GPU 的标准显存类型。', category: 'hardware' },
    { abbr: 'CU', fullEn: 'Compute Unit', zhName: '计算单元', description: 'AMD GPU 的基本计算模块，包含多个 SIMD 执行单元，RX 7600 XT 有 32 个 CU。', category: 'hardware' },
    { abbr: 'IP', fullEn: 'Intellectual Property (block)', zhName: 'IP 模块', description: 'GPU 内部的功能模块，如 GFX IP（图形）、DCN IP（显示）、VCN IP（视频），amdgpu 驱动按 IP 组织代码。', category: 'hardware' },
    { abbr: 'gfx1102', fullEn: 'Graphics IP version 11.0.2', zhName: '图形 IP 11.0.2 版本', description: 'RX 7600 XT（Navi33）的内核代码标识符，amdgpu 驱动通过此 IP 版本号加载对应的固件和初始化代码。', category: 'hardware' },
    { abbr: 'Mesa', fullEn: 'Mesa 3D Graphics Library', zhName: 'Mesa 3D 图形库', description: 'Linux 上实现 OpenGL/Vulkan 等图形 API 的开源用户态库，AMD GPU 对应 radeonsi（OpenGL）和 radv（Vulkan）驱动。', category: 'graphics' },
  ],

  // ── Module 1: 基础准备 ──────────────────────────────────
  prerequisites: [
    { abbr: 'MMU', fullEn: 'Memory Management Unit', zhName: '内存管理单元', description: 'CPU 内部负责将虚拟地址翻译成物理地址的硬件单元，是虚拟内存机制的基础。', category: 'hardware' },
    { abbr: 'TLB', fullEn: 'Translation Lookaside Buffer', zhName: '转译后备缓冲器', description: 'MMU 内部的高速缓存，存储最近使用的虚拟-物理地址映射，加速地址翻译。', category: 'hardware' },
    { abbr: 'MESI', fullEn: 'Modified Exclusive Shared Invalid', zhName: '修改-独占-共享-无效协议', description: 'CPU 多核 Cache 一致性协议，定义了 Cache 行的四种状态，防止多核读写同一内存时数据不一致。', category: 'hardware' },
    { abbr: 'ISA', fullEn: 'Instruction Set Architecture', zhName: '指令集架构', description: '处理器支持的指令集合，如 x86-64（Intel/AMD CPU）、GCN/RDNA（AMD GPU）。', category: 'hardware' },
    { abbr: 'ABI', fullEn: 'Application Binary Interface', zhName: '应用程序二进制接口', description: '定义函数调用约定、数据类型大小和对齐方式的规范，内核模块与内核之间必须遵守相同的 ABI。', category: 'kernel' },
    { abbr: 'GFP', fullEn: 'Get Free Pages', zhName: '获取空闲页', description: 'Linux 内核内存分配函数（如 kmalloc）的标志前缀，如 GFP_KERNEL（可睡眠）、GFP_ATOMIC（不可睡眠）。', category: 'kernel' },
    { abbr: 'IRQ', fullEn: 'Interrupt Request', zhName: '中断请求', description: '硬件设备向 CPU 发出的信号，请求 CPU 暂停当前任务处理紧急事件，如 GPU 完成命令后发出 IRQ。', category: 'hardware' },
    { abbr: 'NUMA', fullEn: 'Non-Uniform Memory Access', zhName: '非统一内存访问', description: '多处理器系统中，不同 CPU 访问不同内存区域的延迟不同，驱动需要感知 NUMA 拓扑以优化性能。', category: 'hardware' },
  ],

  // ── Module 2: 硬件接口基础 ──────────────────────────────
  hardware: [
    { abbr: 'PCIe', fullEn: 'Peripheral Component Interconnect Express', zhName: '高速外设互联总线', description: '现代 GPU 连接到 CPU/主板的高速串行总线标准，RX 7600 XT 使用 PCIe 4.0 x16。', category: 'hardware' },
    { abbr: 'BAR', fullEn: 'Base Address Register', zhName: '基地址寄存器', description: 'PCIe 配置空间中的寄存器，定义设备的 MMIO 和 I/O 空间的物理地址范围，GPU 通过 BAR0 暴露寄存器空间。', category: 'hardware' },
    { abbr: 'MMIO', fullEn: 'Memory-Mapped I/O', zhName: '内存映射 I/O', description: '将硬件寄存器映射到内存地址空间的技术，CPU 通过普通内存读写指令即可操控 GPU 寄存器。', category: 'hardware' },
    { abbr: 'DMA', fullEn: 'Direct Memory Access', zhName: '直接内存访问', description: '允许 GPU 等外设不经过 CPU 直接读写系统内存的技术，大幅降低 CPU 开销，是 GPU 数据传输的核心机制。', category: 'hardware' },
    { abbr: 'IOMMU', fullEn: 'Input-Output Memory Management Unit', zhName: 'I/O 内存管理单元', description: '为 PCIe 设备提供虚拟地址翻译的硬件单元，AMD 平台称为 AMD-Vi，可隔离设备的内存访问，增强安全性。', category: 'hardware' },
    { abbr: 'MSI', fullEn: 'Message Signaled Interrupts', zhName: '消息信号中断', description: '通过向特定内存地址写入数据来触发中断的机制，比传统 PIN 中断更高效，GPU 大量使用 MSI-X（多向量版本）。', category: 'hardware' },
    { abbr: 'GART', fullEn: 'Graphics Address Remapping Table', zhName: '图形地址重映射表', description: 'GPU 内部的地址翻译表，将 GPU 的虚拟地址映射到系统物理内存，是 GPU 访问系统内存的关键机制。', category: 'hardware' },
    { abbr: 'TLP', fullEn: 'Transaction Layer Packet', zhName: '事务层数据包', description: 'PCIe 协议的基本数据传输单元，包含请求（读/写）和完成（Completion）两种类型。', category: 'hardware' },
  ],

  // ── Module 3: Linux 内核与驱动入门 ──────────────────────
  kernel: [
    { abbr: 'VFS', fullEn: 'Virtual File System', zhName: '虚拟文件系统', description: 'Linux 内核中抽象不同文件系统（ext4、btrfs 等）的中间层，提供统一的文件操作接口。', category: 'kernel' },
    { abbr: 'LKM', fullEn: 'Loadable Kernel Module', zhName: '可加载内核模块', description: '可以在运行时动态加载/卸载的内核代码，amdgpu 驱动就是一个 LKM，通过 insmod/modprobe 加载。', category: 'kernel' },
    { abbr: 'PCI', fullEn: 'Peripheral Component Interconnect', zhName: '外设互联总线', description: 'PCIe 的前身，Linux 内核中 pci_driver 结构体用于注册 PCI/PCIe 设备驱动，amdgpu 通过它与内核绑定。', category: 'hardware' },
    { abbr: 'sysfs', fullEn: 'System Filesystem', zhName: '系统文件系统', description: 'Linux 内核将设备、驱动、总线信息以文件形式暴露给用户空间的虚拟文件系统，挂载于 /sys。', category: 'kernel' },
    { abbr: 'udev', fullEn: 'Userspace Device Manager', zhName: '用户空间设备管理器', description: 'Linux 的设备管理守护进程，监听内核的 uevent 事件，自动创建 /dev 下的设备节点。', category: 'kernel' },
    { abbr: 'kobject', fullEn: 'Kernel Object', zhName: '内核对象', description: 'Linux 内核设备模型的基础数据结构，提供引用计数、sysfs 表示和 uevent 通知功能。', category: 'kernel' },
    { abbr: 'RCU', fullEn: 'Read-Copy-Update', zhName: '读-复制-更新', description: 'Linux 内核中一种高效的同步机制，允许读操作无锁进行，写操作通过复制-修改-替换来避免竞争。', category: 'kernel' },
    { abbr: 'spinlock', fullEn: 'Spin Lock', zhName: '自旋锁', description: '内核中的一种忙等待锁，适用于持锁时间极短的场景（如中断上下文），持锁期间不能睡眠。', category: 'kernel' },
  ],

  // ── Module 4: 图形驱动与 DRM ────────────────────────────
  drm: [
    { abbr: 'DRM', fullEn: 'Direct Rendering Manager', zhName: '直接渲染管理器', description: 'Linux 内核中管理 GPU 的子系统，提供内存管理（GEM/TTM）、命令提交、显示输出（KMS）等功能。', category: 'graphics' },
    { abbr: 'KMS', fullEn: 'Kernel Mode Setting', zhName: '内核模式设置', description: '在内核空间完成显示配置（分辨率、刷新率、色深）的机制，避免了用户空间模式设置的竞争问题。', category: 'graphics' },
    { abbr: 'GEM', fullEn: 'Graphics Execution Manager', zhName: '图形执行管理器', description: 'DRM 中管理 GPU 内存对象（Buffer Object）的框架，提供内存分配、映射和共享功能。', category: 'graphics' },
    { abbr: 'TTM', fullEn: 'Translation Table Manager', zhName: '转换表管理器', description: 'DRM 中更底层的内存管理器，负责在 VRAM、GTT（系统内存的 GPU 可见区域）之间移动 Buffer。', category: 'graphics' },
    { abbr: 'BO', fullEn: 'Buffer Object', zhName: '缓冲区对象', description: 'GPU 内存的基本分配单元，代表一块 GPU 可访问的内存区域，可以位于 VRAM 或系统内存中。', category: 'graphics' },
    { abbr: 'CRTC', fullEn: 'Cathode Ray Tube Controller', zhName: '显示控制器', description: 'KMS 中代表一个独立显示扫描输出的抽象，控制 Framebuffer 到显示器的扫描输出时序。', category: 'graphics' },
    { abbr: 'DPMS', fullEn: 'Display Power Management Signaling', zhName: '显示电源管理信号', description: '控制显示器电源状态（开/待机/挂起/关闭）的标准，KMS 通过 connector 的 dpms 属性实现。', category: 'graphics' },
    { abbr: 'DMA-BUF', fullEn: 'DMA Buffer Sharing', zhName: 'DMA 缓冲区共享', description: 'Linux 内核中在不同设备驱动之间零拷贝共享 DMA 缓冲区的机制，如 GPU 与摄像头之间共享帧缓冲。', category: 'graphics' },
    { abbr: 'PRIME', fullEn: 'PRIME Buffer Sharing', zhName: 'PRIME 缓冲区共享', description: '基于 DMA-BUF 的 GPU 间缓冲区共享机制，用于双 GPU 系统（如集显+独显）之间的零拷贝渲染。', category: 'graphics' },
    { abbr: 'GTT', fullEn: 'Graphics Translation Table', zhName: '图形转换表', description: 'GPU 可以访问的系统内存区域，通过 GART/IOMMU 映射，当 VRAM 不足时 Buffer 会被换出到 GTT。', category: 'graphics' },
  ],

  // ── Module 5: AMDGPU 深度解析 ───────────────────────────
  amdgpu: [
    { abbr: 'IB', fullEn: 'Indirect Buffer', zhName: '间接缓冲区', description: 'GPU 命令列表的存储区域，CPU 将 GPU 命令写入 IB，然后通知 GPU 执行，是 GPU 命令提交的核心机制。', category: 'graphics' },
    { abbr: 'CS', fullEn: 'Command Submission', zhName: '命令提交', description: '用户空间应用程序将 GPU 命令（渲染、计算）提交给内核驱动执行的过程，通过 DRM_IOCTL_AMDGPU_CS 实现。', category: 'graphics' },
    { abbr: 'VM', fullEn: 'Virtual Memory (GPU)', zhName: 'GPU 虚拟内存', description: 'GPU 自身的虚拟地址空间，每个进程有独立的 GPU VM，通过页表映射到 VRAM 或系统内存。', category: 'graphics' },
    { abbr: 'VMID', fullEn: 'Virtual Memory ID', zhName: '虚拟内存 ID', description: 'GPU 硬件中标识不同 GPU VM 的编号，类似 CPU 的进程 ID，用于 GPU 的内存访问隔离。', category: 'graphics' },
    { abbr: 'VRAM', fullEn: 'Video Random Access Memory', zhName: '显存', description: 'GPU 板载的高速内存，RX 7600 XT 有 16GB GDDR6 显存，是 GPU 纹理、帧缓冲等数据的主要存储位置。', category: 'hardware' },
    { abbr: 'DC', fullEn: 'Display Core', zhName: '显示核心', description: 'amdgpu 驱动中负责显示输出的子模块（drivers/gpu/drm/amd/display/），实现 KMS 接口，控制 CRTC/Encoder/Connector。', category: 'graphics' },
    { abbr: 'GC', fullEn: 'Graphics and Compute', zhName: '图形与计算核心', description: 'amdgpu 驱动中负责 3D 渲染和 GPU 计算的 IP 模块，包含 GFX Ring、Compute Ring 等命令处理队列。', category: 'graphics' },
    { abbr: 'SDMA', fullEn: 'System DMA', zhName: '系统 DMA 引擎', description: 'AMD GPU 内置的专用 DMA 引擎，负责 VRAM 与系统内存之间的高效数据传输，独立于 GFX 引擎运行。', category: 'hardware' },
    { abbr: 'PSP', fullEn: 'Platform Security Processor', zhName: '平台安全处理器', description: 'AMD GPU 内置的安全处理器，负责固件加载、安全启动和 GPU 资源的安全隔离。', category: 'hardware' },
    { abbr: 'SMU', fullEn: 'System Management Unit', zhName: '系统管理单元', description: 'AMD GPU 内置的电源管理处理器，负责动态电压频率调节（DVFS）、温度监控和功耗控制。', category: 'hardware' },
    { abbr: 'RLC', fullEn: 'RunList Controller', zhName: '运行列表控制器', description: 'AMD GPU 内部的微处理器，负责管理 GPU 的上下文切换、电源门控和 GFX 引擎的调度。', category: 'hardware' },
    { abbr: 'UVD', fullEn: 'Unified Video Decoder', zhName: '统一视频解码器', description: 'AMD GPU 内置的硬件视频解码引擎（旧称），在新架构中被 VCN 取代。', category: 'hardware' },
    { abbr: 'VCN', fullEn: 'Video Core Next', zhName: '视频核心下一代', description: 'AMD GPU 内置的统一视频编解码引擎，支持 H.264/H.265/AV1 等格式的硬件加速编解码。', category: 'hardware' },
  ],

  // ── Module 6: 调试与性能分析 ────────────────────────────
  debugging: [
    { abbr: 'ftrace', fullEn: 'Function Tracer', zhName: '函数追踪器', description: 'Linux 内核内置的追踪框架，可以记录内核函数调用、延迟、中断等事件，是驱动调试的利器。', category: 'kernel' },
    { abbr: 'perf', fullEn: 'Performance Analysis Tools', zhName: '性能分析工具', description: 'Linux 内核性能分析工具套件，可以采样 CPU/GPU 性能计数器，生成火焰图，定位性能瓶颈。', category: 'toolchain' },
    { abbr: 'KGDB', fullEn: 'Kernel GNU Debugger', zhName: '内核 GNU 调试器', description: '允许使用 GDB 远程调试运行中的 Linux 内核的工具，可以设置断点、查看内核变量。', category: 'toolchain' },
    { abbr: 'UBSAN', fullEn: 'Undefined Behavior Sanitizer', zhName: '未定义行为检测器', description: '编译器插桩工具，在运行时检测整数溢出、空指针解引用等未定义行为，内核支持 CONFIG_UBSAN。', category: 'toolchain' },
    { abbr: 'KASAN', fullEn: 'Kernel Address Sanitizer', zhName: '内核地址检测器', description: '动态内存错误检测工具，可以发现内核中的堆越界访问、使用已释放内存等 bug，通过 CONFIG_KASAN 启用。', category: 'toolchain' },
    { abbr: 'GPU Hang', fullEn: 'GPU Hang / GPU Reset', zhName: 'GPU 挂起/重置', description: 'GPU 停止响应命令的故障状态，amdgpu 驱动有自动检测和重置机制，分析 Hang 是驱动调试的核心技能。', category: 'graphics' },
    { abbr: 'rocprof', fullEn: 'ROCm Profiler', zhName: 'ROCm 性能分析器', description: 'AMD ROCm 平台的 GPU 性能分析工具，可以采集 GPU 硬件性能计数器，分析 HIP 程序的瓶颈。', category: 'compute' },
    { abbr: 'umr', fullEn: 'AMDGPU Micro Register Debugger', zhName: 'AMDGPU 微寄存器调试器', description: 'AMD 开源的 GPU 寄存器读写和调试工具，可以在不重启的情况下读取 GPU 内部寄存器状态。', category: 'toolchain' },
  ],

  // ── Module 7: ROCm 内核接口 (KFD) ───────────────────────
  'rocm-kernel': [
    { abbr: 'KFD', fullEn: 'Kernel Fusion Driver', zhName: '内核融合驱动', description: 'amdgpu 驱动中专为 GPU 计算（ROCm/HSA）提供服务的内核组件，通过 /dev/kfd 向用户空间暴露接口。', category: 'compute' },
    { abbr: 'HSA', fullEn: 'Heterogeneous System Architecture', zhName: '异构系统架构', description: 'AMD 推动的 CPU-GPU 统一内存和统一编程模型标准，ROCm 是其在 Linux 上的实现。', category: 'compute' },
    { abbr: 'HMM', fullEn: 'Heterogeneous Memory Management', zhName: '异构内存管理', description: 'Linux 内核中支持 CPU 和 GPU 共享同一虚拟地址空间的内存管理框架，是 HSA 统一内存的基础。', category: 'kernel' },
    { abbr: 'SVM', fullEn: 'Shared Virtual Memory', zhName: '共享虚拟内存', description: 'CPU 和 GPU 使用相同虚拟地址访问同一块内存的技术，消除了显式的 CPU-GPU 数据拷贝。', category: 'compute' },
    { abbr: 'AQL', fullEn: 'Architected Queuing Language', zhName: '架构化队列语言', description: 'HSA 标准定义的 GPU 命令队列格式，ROCm 使用 AQL 包（Packet）向 GPU 提交计算任务。', category: 'compute' },
    { abbr: 'MQD', fullEn: 'Memory Queue Descriptor', zhName: '内存队列描述符', description: 'GPU 硬件中描述计算队列状态（队列地址、读写指针、优先级等）的数据结构。', category: 'compute' },
    { abbr: 'PASID', fullEn: 'Process Address Space ID', zhName: '进程地址空间 ID', description: 'IOMMU 中标识不同进程地址空间的 ID，KFD 使用 PASID 实现多进程 GPU 内存隔离。', category: 'compute' },
  ],

  // ── Module 8: ROCm 用户态计算 ───────────────────────────
  'rocm-compute': [
    { abbr: 'HIP', fullEn: 'Heterogeneous-Compute Interface for Portability', zhName: '异构计算可移植接口', description: 'AMD 的 GPU 计算编程模型，语法与 CUDA 高度相似，可以在 AMD 和 NVIDIA GPU 上运行。', category: 'compute' },
    { abbr: 'CUDA', fullEn: 'Compute Unified Device Architecture', zhName: '计算统一设备架构', description: 'NVIDIA 的 GPU 计算平台，HIP 是其在 AMD GPU 上的对应物，hipcc 可以将 CUDA 代码转换为 HIP。', category: 'compute' },
    { abbr: 'wavefront', fullEn: 'Wavefront (AMD) / Warp (NVIDIA)', zhName: '波前/线程束', description: 'AMD GPU 的基本执行单元，一个 wavefront 包含 64 个线程（RDNA 架构支持 32 线程模式），所有线程同步执行相同指令。', category: 'compute' },
    { abbr: 'LDS', fullEn: 'Local Data Share', zhName: '本地数据共享', description: 'AMD GPU 中工作组（Workgroup）内部的高速共享内存，类似 CUDA 的 shared memory，延迟远低于 VRAM。', category: 'compute' },
    { abbr: 'SIMD', fullEn: 'Single Instruction Multiple Data', zhName: '单指令多数据', description: 'GPU 的核心执行模型，一条指令同时对多个数据执行相同操作，是 GPU 并行计算高效的根本原因。', category: 'hardware' },
    { abbr: 'ROCr', fullEn: 'ROCm Runtime', zhName: 'ROCm 运行时', description: 'ROCm 的用户态运行时库，实现 HSA 运行时规范，负责 GPU 队列管理、内存分配和信号同步。', category: 'compute' },
    { abbr: 'hipcc', fullEn: 'HIP C Compiler', zhName: 'HIP C 编译器', description: 'AMD 的 HIP 代码编译器驱动程序，将 HIP 源码编译为 AMD GPU 可执行的 AMDGPU ISA 代码。', category: 'toolchain' },
  ],

  // ── Module 9: GPU 工具链与 LLVM ─────────────────────────
  llvm: [
    { abbr: 'IR', fullEn: 'Intermediate Representation', zhName: '中间表示', description: 'LLVM 编译器的中间语言，介于高级语言（C/HIP）和机器码之间，是所有优化 Pass 的操作对象。', category: 'toolchain' },
    { abbr: 'ISA', fullEn: 'Instruction Set Architecture', zhName: '指令集架构', description: 'GPU 的机器指令集，AMD GPU 使用 GCN/RDNA ISA，LLVM AMDGPU 后端负责将 IR 编译为对应的 ISA。', category: 'hardware' },
    { abbr: 'SPIR-V', fullEn: 'Standard Portable Intermediate Representation - V', zhName: '标准可移植中间表示 V', description: 'Khronos 定义的 GPU 着色器和计算内核的标准中间语言，Vulkan 和 OpenCL 使用 SPIR-V 作为着色器格式。', category: 'toolchain' },
    { abbr: 'GLSL', fullEn: 'OpenGL Shading Language', zhName: 'OpenGL 着色语言', description: 'OpenGL 的着色器编程语言，由 Mesa 的 GLSL 编译器编译为 SPIR-V，再由 LLVM 编译为 GPU ISA。', category: 'toolchain' },
    { abbr: 'HLSL', fullEn: 'High-Level Shading Language', zhName: '高级着色语言', description: 'DirectX 的着色器编程语言，通过 DirectXShaderCompiler 可以编译为 SPIR-V，进而在 AMD GPU 上运行。', category: 'toolchain' },
    { abbr: 'ACO', fullEn: 'AMD Compiler (Mesa)', zhName: 'AMD 编译器（Mesa）', description: 'Mesa radv（Vulkan 驱动）中的 AMD 专用着色器编译后端，相比 LLVM 后端有更快的编译速度和更好的代码质量。', category: 'toolchain' },
    { abbr: 'NIR', fullEn: 'New Intermediate Representation', zhName: '新中间表示', description: 'Mesa 图形驱动内部使用的着色器中间表示，是 GLSL/SPIR-V 到 GPU ISA 编译流程中的关键中间层。', category: 'toolchain' },
    { abbr: 'AMDGPU-PRO', fullEn: 'AMD GPU Professional Driver', zhName: 'AMD GPU 专业驱动', description: 'AMD 提供的混合驱动方案，内核部分使用开源 amdgpu，用户态部分使用闭源专业版库，主要面向专业工作站。', category: 'graphics' },
  ],

  // ── Module 10: 测试与 CI ─────────────────────────────────
  testing: [
    { abbr: 'IGT', fullEn: 'Intel GPU Tools', zhName: 'Intel GPU 测试工具', description: '由 Intel 开发、现为 GPU 驱动社区共用的测试套件，包含大量 DRM/KMS 和 GPU 功能测试，amdgpu 开发必用。', category: 'toolchain' },
    { abbr: 'CI', fullEn: 'Continuous Integration', zhName: '持续集成', description: '自动化构建和测试流程，Linux 内核使用 KernelCI 和 0-day 机器人对每个补丁进行自动测试。', category: 'toolchain' },
    { abbr: 'KernelCI', fullEn: 'Kernel Continuous Integration', zhName: '内核持续集成', description: '专为 Linux 内核设计的 CI 平台，在多种硬件上自动运行内核测试，帮助发现补丁引入的回归问题。', category: 'toolchain' },
    { abbr: 'CTS', fullEn: 'Conformance Test Suite', zhName: '一致性测试套件', description: '验证 GPU 驱动是否符合 OpenGL/Vulkan/OpenCL 规范的官方测试集，如 dEQP（drawElements Quality Program）。', category: 'toolchain' },
    { abbr: 'dEQP', fullEn: 'drawElements Quality Program', zhName: 'drawElements 质量程序', description: 'Khronos 官方的 OpenGL ES/Vulkan/OpenCL 一致性测试套件，是 GPU 驱动质量的黄金标准测试。', category: 'toolchain' },
    { abbr: 'bisect', fullEn: 'Git Bisect', zhName: 'Git 二分查找', description: '通过二分法在 Git 提交历史中快速定位引入 bug 的提交，是内核回归问题调试的标准方法。', category: 'toolchain' },
  ],

  // ── Module 11: 社区贡献与职业发展 ───────────────────────
  career: [
    { abbr: 'RFC', fullEn: 'Request for Comments', zhName: '征求意见稿', description: '在正式提交补丁前，向社区征求意见的草稿版本，通常在主题中标注 "[RFC]"，用于讨论设计方案。', category: 'kernel' },
    { abbr: 'ACK', fullEn: 'Acknowledged', zhName: '已确认', description: '内核维护者在邮件列表中对补丁表示认可的回复，表示补丁可以被合并，但通常还需要 Reviewed-by 标签。', category: 'kernel' },
    { abbr: 'NAK', fullEn: 'Not Acknowledged', zhName: '不认可', description: '内核维护者对补丁表示反对的回复，通常附有反对理由，提交者需要修改后重新提交。', category: 'kernel' },
    { abbr: 'SoB', fullEn: 'Signed-off-by', zhName: '签署人', description: '内核补丁中的标准标签，表示签署人对补丁的合法性和质量负责，是补丁合并的必要条件。', category: 'kernel' },
    { abbr: 'Rb', fullEn: 'Reviewed-by', zhName: '审查人', description: '内核补丁中表示某人已仔细审查代码并认为其正确的标签，是补丁质量的重要背书。', category: 'kernel' },
    { abbr: 'Tb', fullEn: 'Tested-by', zhName: '测试人', description: '内核补丁中表示某人已在真实硬件上测试补丁功能正常的标签，对于硬件相关的驱动补丁尤为重要。', category: 'kernel' },
    { abbr: 'drm-next', fullEn: 'DRM Next Branch', zhName: 'DRM 下一版本分支', description: 'DRM 子系统维护者（Dave Airlie/Daniel Vetter）用于收集下一个内核版本新功能补丁的 Git 分支。', category: 'kernel' },
    { abbr: 'amd-gfx', fullEn: 'AMD Graphics Mailing List', zhName: 'AMD 图形邮件列表', description: 'amdgpu 驱动开发的主要邮件列表（amd-gfx@lists.freedesktop.org），所有 amdgpu 补丁都应抄送此列表。', category: 'kernel' },
  ],
};
