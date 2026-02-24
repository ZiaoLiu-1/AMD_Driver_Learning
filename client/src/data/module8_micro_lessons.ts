// ============================================================
// AMD Linux Driver Learning Platform - Module 8 Micro-Lessons
// Module 8: ROCm User Compute (ROCm 用户态计算)
// 5 lessons in 2 groups, ~15 min each, total ~75 min
// ============================================================
import type { MicroLessonModule } from './micro_lesson_types';

export const module8MicroLessons: MicroLessonModule = {
  moduleId: 'rocm-compute',
  groups: [
    // ════════════════════════════════════════════════════════════
    // Group 8.1: HIP 编程模型
    // ════════════════════════════════════════════════════════════
    {
      id: '8-1',
      number: '8.1',
      title: 'HIP 编程模型',
      titleEn: 'HIP Programming Model',
      icon: 'Rocket',
      description: '学习 HIP 编程的核心概念：Grid/Block/Thread 层次结构、内核函数的编写与启动、设备内存管理，以及 GPU 内存层次与高效分配策略。',
      lessons: [
        // ── Lesson 8.1.1 ──────────────────────────────────────
        {
          id: '8-1-1',
          number: '8.1.1',
          title: 'HIP 编程基础：Grid、Block 与 Thread',
          titleEn: 'HIP Basics: Grid, Block & Thread',
          duration: 15,
          difficulty: 'intermediate',
          tags: ['HIP', 'kernel', 'grid', 'block', 'thread', 'hipLaunchKernelGGL'],
          concept: {
            summary: 'HIP（Heterogeneous-compute Interface for Portability）是 AMD 的 GPU 编程 API，语法与 CUDA 几乎相同。HIP 程序通过 __global__ 核函数（kernel）在 GPU 上启动大规模并行计算，计算任务被组织为 Grid → Block → Thread 三层层次结构。',
            explanation: [
              'GPU 编程的核心思想是 SIMT（Single Instruction, Multiple Threads）——用成千上万个线程同时执行同一段代码，但每个线程处理不同的数据。HIP 是 AMD 对这一模型的实现，它的 API 几乎是 CUDA 的镜像，这使得从 CUDA 迁移到 HIP 非常简单（AMD 甚至提供了 hipify 工具来自动转换代码）。',
              'HIP 的线程层次结构分三级：Thread（线程）是最小执行单元，每个线程有唯一的 threadIdx（块内索引）；Block（线程块）是一组线程的集合，同一个 Block 内的线程可以通过 LDS（Local Data Share，即共享内存）通信和同步（__syncthreads()），Block 大小通常为 64/128/256 个线程；Grid（网格）是所有 Block 的集合，通过 blockIdx 区分不同 Block。全局线程 ID 的计算公式是：globalId = blockIdx.x * blockDim.x + threadIdx.x。',
              '核函数（kernel）用 __global__ 修饰符声明，只能返回 void。启动核函数有两种语法：hipLaunchKernelGGL(kernel, gridDim, blockDim, sharedMem, stream, args...) 是 HIP 推荐的方式；kernel<<<gridDim, blockDim, sharedMem, stream>>>(args...) 是 CUDA 兼容语法。gridDim 和 blockDim 使用 dim3 类型指定三维大小，但一维问题通常只用 x 分量。',
              '设备内存管理是 HIP 编程的基础。hipMalloc() 在 GPU VRAM 上分配内存，hipMemcpy() 在 CPU 和 GPU 之间传输数据（方向由 hipMemcpyHostToDevice / hipMemcpyDeviceToHost 指定），hipFree() 释放 GPU 内存。整个流程是：分配 GPU 内存 → 拷贝输入数据到 GPU → 启动核函数 → 拷贝结果回 CPU → 释放 GPU 内存。hipDeviceSynchronize() 用于等待 GPU 上所有操作完成。',
              '在底层，当你调用 hipLaunchKernelGGL 时，HIP 运行时将核函数编译好的 GPU 二进制代码（通过 LLVM AMDGPU 后端生成）和参数封装成 AQL（Architected Queuing Language）包，写入 KFD 创建的 HSA 队列。GPU 的命令处理器从队列中取出 AQL 包，将 Block 分配到可用的 Compute Unit（CU）上执行。CU 数量因型号而异（如 RX 7600 XT 为 32 CU，RX 7900 XTX 为 96 CU），理论上均可同时执行数千个线程。',
            ],
            keyPoints: [
              'HIP 线程层次：Grid（所有 Block）→ Block（共享 LDS 的线程组）→ Thread（最小执行单元）',
              '全局线程 ID = blockIdx.x * blockDim.x + threadIdx.x',
              '__global__ 修饰核函数，hipLaunchKernelGGL() 启动执行',
              'hipMalloc / hipMemcpy / hipFree 管理设备内存和数据传输',
              'hipDeviceSynchronize() 等待 GPU 完成所有任务',
              'HIP 语法与 CUDA 几乎相同，hipify 工具可自动转换 CUDA 代码',
            ],
          },
          diagram: {
            title: 'HIP Grid/Block/Thread 层次结构',
            content: `HIP 线程组织层次结构

Grid (gridDim = 4×2)                   一个 Block 内部
┌─────────┬─────────┬─────────┬─────────┐   ┌─────────────────────────────┐
│ Block   │ Block   │ Block   │ Block   │   │  Block (1,0)                │
│ (0,0)   │ (1,0)   │ (2,0)   │ (3,0)   │   │  blockDim = 8×4 = 32 threads│
├─────────┼─────────┼─────────┼─────────┤   │                             │
│ Block   │ Block   │ Block   │ Block   │   │  ┌─┬─┬─┬─┬─┬─┬─┬─┐       │
│ (0,1)   │ (1,1)   │ (2,1)   │ (3,1)   │   │  │0│1│2│3│4│5│6│7│ tid.y=0│
└─────────┴─────────┴─────────┴─────────┘   │  ├─┼─┼─┼─┼─┼─┼─┼─┤       │
                                              │  │0│1│2│3│4│5│6│7│ tid.y=1│
全局 ID 计算（一维示例）：                     │  ├─┼─┼─┼─┼─┼─┼─┼─┤       │
                                              │  │0│1│2│3│4│5│6│7│ tid.y=2│
gridDim.x = 4 blocks                         │  ├─┼─┼─┼─┼─┼─┼─┼─┤       │
blockDim.x = 256 threads/block                │  │0│1│2│3│4│5│6│7│ tid.y=3│
total threads = 4 × 256 = 1024               │  └─┴─┴─┴─┴─┴─┴─┴─┘       │
                                              │  ↑ threadIdx.x              │
Block 0       Block 1       Block 2           │                             │
[0..255]     [256..511]    [512..767]  ...    │  共享 LDS (64KB max)        │
     │              │             │            │  可 __syncthreads() 同步    │
     └──────────────┴─────────────┘            └─────────────────────────────┘
globalIdx = blockIdx.x * blockDim.x + threadIdx.x

映射到 AMD 硬件：
┌─────────────────────────────────────────────────────────┐
│  RX 7600 XT (Navi33, 32 CU)                            │
│                                                          │
│  Block → 分配到一个 CU (Compute Unit)                   │
│  Thread → 以 Wavefront (32/64 threads) 为单位执行       │
│  LDS → CU 内的本地数据共享 (64KB/CU)                   │
│  一个 CU 可同时运行多个 Block（受寄存器/LDS 限制）      │
└─────────────────────────────────────────────────────────┘`,
            caption: 'HIP 的三级线程层次结构。Grid 包含多个 Block，每个 Block 包含多个 Thread。Block 映射到 CU 执行，Thread 以 Wavefront 为粒度在 SIMD 单元上运行。',
          },
          codeWalk: {
            title: 'vector_add.hip — 完整的 HIP 向量加法示例',
            file: 'vector_add.hip',
            language: 'cpp',
            code: `#include <hip/hip_runtime.h>
#include <stdio.h>

/* __global__ 标记此函数为 GPU 核函数
 * 在 GPU 上被数千个线程并行执行 */
__global__ void vector_add(const float *a, const float *b,
                           float *c, int n)
{
    /* 每个线程计算自己的全局索引 */
    int idx = blockIdx.x * blockDim.x + threadIdx.x;

    /* 边界检查：线程总数可能超过数组长度 */
    if (idx < n) {
        c[idx] = a[idx] + b[idx];
    }
}

int main()
{
    const int N = 1 << 20;  /* 1M elements */
    size_t bytes = N * sizeof(float);

    /* 1. 分配 host（CPU）内存 */
    float *h_a = (float *)malloc(bytes);
    float *h_b = (float *)malloc(bytes);
    float *h_c = (float *)malloc(bytes);

    for (int i = 0; i < N; i++) {
        h_a[i] = 1.0f;
        h_b[i] = 2.0f;
    }

    /* 2. 分配 device（GPU）内存 */
    float *d_a, *d_b, *d_c;
    hipMalloc(&d_a, bytes);
    hipMalloc(&d_b, bytes);
    hipMalloc(&d_c, bytes);

    /* 3. 将输入数据从 CPU 拷贝到 GPU */
    hipMemcpy(d_a, h_a, bytes, hipMemcpyHostToDevice);
    hipMemcpy(d_b, h_b, bytes, hipMemcpyHostToDevice);

    /* 4. 启动核函数
     * 每个 Block 256 个线程
     * Grid 大小 = ceil(N / 256) 个 Block */
    int blockSize = 256;
    int gridSize = (N + blockSize - 1) / blockSize;

    hipLaunchKernelGGL(vector_add,
                       dim3(gridSize),   /* Grid 维度 */
                       dim3(blockSize),  /* Block 维度 */
                       0,                /* 动态共享内存大小 */
                       0,                /* HIP stream (0=默认) */
                       d_a, d_b, d_c, N);

    /* 5. 等待 GPU 完成 */
    hipDeviceSynchronize();

    /* 6. 将结果从 GPU 拷回 CPU */
    hipMemcpy(h_c, d_c, bytes, hipMemcpyDeviceToHost);

    /* 7. 验证结果 */
    for (int i = 0; i < N; i++) {
        if (h_c[i] != 3.0f) {
            printf("Error at index %d: %f != 3.0\\n", i, h_c[i]);
            return 1;
        }
    }
    printf("PASSED: %d elements computed correctly\\n", N);

    /* 8. 释放内存 */
    hipFree(d_a); hipFree(d_b); hipFree(d_c);
    free(h_a); free(h_b); free(h_c);
    return 0;
}
/* 编译: hipcc vector_add.hip -o vector_add
 * 运行: ./vector_add
 * 输出: PASSED: 1048576 elements computed correctly */`,
            annotations: [
              '__global__ 修饰符告诉编译器此函数在 GPU 上执行，从 CPU 端调用',
              'blockIdx.x * blockDim.x + threadIdx.x 是最基本的全局索引计算——几乎每个 kernel 都以此开头',
              'if (idx < n) 边界检查必不可少：gridSize * blockSize 通常大于实际数据量',
              'hipMalloc 在 GPU VRAM 上分配内存，返回的指针只能在 GPU 代码中解引用',
              'hipMemcpy 是同步操作——它会阻塞 CPU 直到传输完成，是性能瓶颈之一',
              'hipLaunchKernelGGL 是异步的——CPU 不等 GPU 完成就继续执行下一条语句',
              'hipDeviceSynchronize 等待 GPU 上所有操作完成，在此之前不能读取结果',
            ],
            explanation: '这个 vector_add 程序展示了 HIP 编程的完整模式：分配 → 拷贝 → 启动 → 同步 → 拷回 → 释放。虽然对于简单的向量加法来说 GPU 不比 CPU 快（数据传输开销太大），但当计算密集度提高（如矩阵乘法、神经网络推理），GPU 的大规模并行优势就会显现出来。在底层，hipcc 调用 LLVM AMDGPU 后端将 __global__ 函数编译为 GPU ISA（GFX11 指令集），hipLaunchKernelGGL 通过 HSA 运行时将 AQL 包写入 KFD 队列。',
          },
          miniLab: {
            title: '编译运行你的第一个 HIP 程序',
            objective: '在 RX 7600 XT 上编译并运行 vector_add.hip，测量不同 Block 大小对性能的影响。',
            setup: `# 安装 ROCm（如果尚未安装）
# 参考 https://rocm.docs.amd.com/en/latest/deploy/linux/installer/install.html
sudo apt install rocm-hip-sdk

# 验证 HIP 环境
hipcc --version
hipconfig --full`,
            steps: [
              '将上面的 vector_add.hip 保存到文件，用 hipcc vector_add.hip -o vector_add 编译',
              '运行 ./vector_add 验证输出为 PASSED',
              '修改 N 为 1<<24（16M 元素），重新编译运行，观察是否仍然正确',
              '分别用 blockSize = 64, 128, 256, 512 测试，在核函数前后加 hipEventRecord 计时',
              '运行 rocm-smi 观察 GPU 负载和频率变化',
              '将 hipMemcpy 改为 hipMemcpyAsync 并使用 stream，观察是否有性能提升',
            ],
            expectedOutput: `$ hipcc vector_add.hip -o vector_add && ./vector_add
PASSED: 1048576 elements computed correctly

$ rocm-smi
========================= ROCm SMI ==========================
GPU  Temp   AvgPwr  SCLK    MCLK     Fan   Perf  ...
0    45c    25.0W   2100Mhz 2000Mhz  0%    auto  ...`,
            hint: '如果 hipcc 找不到，确认 ROCm 的 bin 目录在 PATH 中：export PATH=$PATH:/opt/rocm/bin。如果运行时报 "no device" 错误，检查 /dev/kfd 是否存在以及当前用户是否在 video 和 render 组中。',
          },
          debugExercise: {
            title: '找出 HIP 核函数中的越界访问',
            language: 'cpp',
            description: '以下 HIP 核函数有一个常见的错误，会导致越界内存访问和不可预测的结果。',
            question: '这段代码有什么问题？在什么条件下会出错？',
            buggyCode: `__global__ void scale_array(float *data, float factor, int n)
{
    int idx = blockIdx.x * blockDim.x + threadIdx.x;
    /* BUG: 缺少边界检查! */
    data[idx] = data[idx] * factor;
}

int main()
{
    int N = 1000;
    int blockSize = 256;
    int gridSize = (N + blockSize - 1) / blockSize;  /* = 4 */
    /* 4 blocks × 256 threads = 1024 threads
     * 但数组只有 1000 个元素! */

    float *d_data;
    hipMalloc(&d_data, N * sizeof(float));
    hipLaunchKernelGGL(scale_array, dim3(gridSize),
                       dim3(blockSize), 0, 0, d_data, 2.0f, N);
}`,
            hint: 'gridSize * blockSize = 1024，但数组只有 1000 个元素。线程 1000-1023 会访问什么？',
            answer: '错误：缺少边界检查。gridSize = ceil(1000/256) = 4，total threads = 4×256 = 1024，但数组只有 1000 个元素。线程 idx=1000 到 idx=1023 会越界访问 data[1000]..data[1023]，这是未分配的 GPU 内存。后果：（1）读取到垃圾数据；（2）写入到其他 GPU 分配的内存区域（data corruption）；（3）可能触发 GPU page fault（在 dmesg 中看到 "GPU fault detected: vmid:X"）。修复方法：在核函数开头加 if (idx < n) return; 或将操作包在 if (idx < n) { ... } 中。这是 HIP/CUDA 编程中最常见的 bug——几乎每个核函数都需要边界检查。AMD 的 rocm-gdb 调试器和 ASAN for GPU 可以帮助检测此类问题。',
          },
          interviewQ: {
            question: '描述 HIP 的线程层次结构（Grid/Block/Thread），以及它如何映射到 AMD GPU 硬件。',
            difficulty: 'medium',
            hint: '从软件抽象（Grid→Block→Thread）到硬件映射（GPU→CU→Wavefront），说明 Block 如何被调度到 CU，Thread 如何组成 Wavefront。',
            answer: 'HIP 线程层次结构：Grid 是最顶层，包含所有要执行的线程，由 gridDim 定义维度（最多 3D）；Block（线程块）是调度的基本单位，由 blockDim 定义大小（通常 64-1024 线程），同一 Block 内的线程共享 LDS 并可通过 __syncthreads() 同步；Thread 是最小执行单元，通过 threadIdx 标识块内位置。硬件映射：Grid 对应整个 GPU（如 RX 7600 XT 的 32 CU），Block 被调度到一个 Compute Unit（CU）上——一旦分配就不会迁移到其他 CU。Block 内的线程被分成 Wavefront（AMD 术语，等价于 NVIDIA 的 Warp）——RDNA 架构支持 32 线程/wavefront（Wave32）或 64 线程/wavefront（Wave64）。一个 CU 可以同时容纳多个 Block，受限于寄存器文件和 LDS 的总量。GPU 的硬件调度器（SPI）负责将 Block 分配到有足够资源的 CU 上。当所有 CU 都被占满时，剩余的 Block 排队等待。',
            amdContext: 'AMD 面试中必考的基础题。关键区分点是 AMD 使用 Wavefront（32/64）而非 NVIDIA 的 Warp（32），以及 RDNA 的 Wave32 模式对分支性能的影响。',
          },
        },

        // ── Lesson 8.1.2 ──────────────────────────────────────
        {
          id: '8-1-2',
          number: '8.1.2',
          title: 'GPU 内存层次与分配策略',
          titleEn: 'GPU Memory Hierarchy & Allocation Strategies',
          duration: 15,
          difficulty: 'intermediate',
          tags: ['memory-hierarchy', 'VRAM', 'LDS', 'hipMalloc', 'pinned-memory', 'streams'],
          concept: {
            summary: 'GPU 拥有深层的内存层次结构——从最快的寄存器到最慢的系统内存——每一层的延迟和带宽相差数十倍。理解这个层次结构并选择正确的内存分配策略（hipMalloc vs hipHostMalloc vs hipMallocManaged），是写出高性能 HIP 程序的关键。',
            explanation: [
              'GPU 的内存层次结构从快到慢依次为：（1）寄存器（Register）：每个线程私有，访问延迟 ~1 cycle，RDNA3 每个 CU 有 192KB VGPR（向量通用寄存器）；（2）LDS（Local Data Share）：Block 内共享，延迟 ~4-10 cycles，每个 CU 64KB，等价于 CUDA 的 shared memory；（3）L1 缓存：每个 CU 独有，16-32KB，自动缓存全局内存访问；（4）L2/Infinity Cache：L2 本体约 2MB，外加 32MB Infinity Cache（作为末级缓存），二者共同减少对 VRAM 的访问（RDNA3 的 Infinity Cache 是带宽关键）；（5）VRAM（显存）：GPU 本地高带宽内存，8GB GDDR6，带宽 ~288 GB/s；（6）系统内存（System RAM）：通过 PCIe 总线访问，带宽仅 ~32 GB/s（PCIe 4.0 x16）。',
              '选择正确的 HIP 内存分配函数至关重要：hipMalloc() 在 GPU VRAM 上分配内存，是最常用的方式，GPU 访问速度最快但 CPU 无法直接访问；hipHostMalloc() 在 CPU 端分配 pinned（page-locked）内存，可通过 hipHostMallocMapped 标志使其同时被 GPU 通过 PCIe 直接访问——这避免了显式的 hipMemcpy，但 GPU 访问速度受 PCIe 带宽限制；hipMallocManaged() 分配统一虚拟地址（Managed Memory），CPU 和 GPU 可以用同一个指针访问，运行时自动在 CPU/GPU 之间迁移数据（通过 page fault），开发简单但性能可能不如手动管理。',
              'Pinned memory（页锁定内存）对 DMA 传输至关重要。普通的 malloc 分配的内存可能被操作系统 swap 到磁盘，GPU 的 DMA 引擎无法直接访问这种内存。hipHostMalloc 分配的内存被锁定在物理 RAM 中（mlock），DMA 引擎可以直接在 PCIe 上传输，避免了操作系统的一次内存拷贝。这就是为什么 hipMemcpy 在使用 pinned 内存时比普通内存快 2-3 倍。',
              'HIP Stream 是实现异步执行和数据传输重叠的核心机制。一个 Stream 代表一个有序的操作序列（拷贝/核函数），不同 Stream 之间的操作可以并行执行。典型的双缓冲模式：Stream 0 执行当前批次的核函数时，Stream 1 同时传输下一批次的数据。hipMemcpyAsync() 发起异步数据传输（需要 pinned memory），hipStreamCreate/hipStreamSynchronize 管理 Stream 的生命周期。在底层，每个 Stream 对应 KFD 创建的一个 HSA 队列。',
            ],
            keyPoints: [
              '内存层次：Register (~1cy) > LDS (~10cy) > L1 > L2 (32MB) > VRAM (288GB/s) > System (32GB/s)',
              'hipMalloc → GPU VRAM，GPU 快速访问，CPU 不可直接访问',
              'hipHostMalloc → CPU pinned memory，可被 GPU 通过 PCIe 访问，DMA 传输效率最高',
              'hipMallocManaged → 统一虚拟地址，自动迁移，方便但性能开销较大',
              'Pinned memory 对异步传输必不可少——非 pinned 的 hipMemcpyAsync 会退化为同步操作',
              'HIP Stream 实现计算与传输重叠，典型提升 30-50% 吞吐量',
            ],
          },
          diagram: {
            title: 'GPU 内存层次结构与延迟对比',
            content: `AMD RDNA3 GPU 内存层次结构（RX 7600 XT / Navi33）

                    延迟          带宽           大小      作用域
                    ────          ────           ────      ──────
┌─────────┐
│ Register│    ~1 cycle      ~无限(CU内)      192KB/CU   线程私有
│ (VGPR)  │    最快                            (向量寄存器)
└────┬────┘
     │
┌────▼────┐
│   LDS   │    ~4-10 cy     ~3.3 TB/s(CU内)   64KB/CU   Block 共享
│(Shared) │    = CUDA shared memory            可编程管理
└────┬────┘
     │
┌────▼────┐
│ L1 Cache│    ~20 cy       ~1.5 TB/s          32KB/CU   CU 私有
│         │    自动缓存全局内存访问              (硬件管理)
└────┬────┘
     │
┌────▼────┐
│ L2 Cache│    ~100 cy      ~800 GB/s          32MB      全 GPU 共享
│ (RDNA3) │    ← RDNA3 大 L2 是性能关键!       (大缓存!)
└────┬────┘
     │
┌────▼────┐
│  VRAM   │    ~300 cy      ~288 GB/s          8GB       GPU 全局
│ (GDDR6) │    hipMalloc 分配在此              GDDR6
└────┬────┘
     │  PCIe 4.0 x16 (~32 GB/s)  ← 传输瓶颈!
┌────▼────┐
│ System  │    ~1000+ cy    ~32 GB/s           ≥16GB     CPU 全局
│  RAM    │    hipHostMalloc (pinned)          DDR5
└─────────┘

内存分配策略选择：
┌──────────────────┬─────────────────────┬──────────────┐
│ hipMalloc        │ GPU VRAM 分配       │ GPU 计算数据 │
│ hipHostMalloc    │ CPU pinned 分配     │ DMA 传输缓冲│
│ hipMallocManaged │ 统一地址(自动迁移)  │ 原型开发     │
└──────────────────┴─────────────────────┴──────────────┘`,
            caption: 'GPU 内存层次结构从寄存器到系统内存，延迟跨越 3 个数量级。PCIe 带宽是 CPU-GPU 数据传输的主要瓶颈，这也是为什么减少数据传输是 GPU 性能优化的首要原则。',
          },
          codeWalk: {
            title: '矩阵乘法 + LDS Tiling 优化',
            file: 'matmul_tiled.hip',
            language: 'cpp',
            code: `#include <hip/hip_runtime.h>

#define TILE_SIZE 16

/* 使用 LDS tiling 的矩阵乘法
 * C[M×N] = A[M×K] × B[K×N]
 * 每个 Block 计算 C 的一个 TILE_SIZE×TILE_SIZE 子矩阵 */
__global__ void matmul_tiled(const float *A, const float *B,
                              float *C, int M, int N, int K)
{
    /* LDS 中分配两个 tile 用于缓存 A 和 B 的子块 */
    __shared__ float tileA[TILE_SIZE][TILE_SIZE];
    __shared__ float tileB[TILE_SIZE][TILE_SIZE];

    int row = blockIdx.y * TILE_SIZE + threadIdx.y;
    int col = blockIdx.x * TILE_SIZE + threadIdx.x;
    float sum = 0.0f;

    /* 沿 K 维度分段加载 tile */
    for (int t = 0; t < (K + TILE_SIZE - 1) / TILE_SIZE; t++) {
        /* 协作加载：Block 内每个线程负责加载一个元素到 LDS */
        int aCol = t * TILE_SIZE + threadIdx.x;
        int bRow = t * TILE_SIZE + threadIdx.y;

        tileA[threadIdx.y][threadIdx.x] =
            (row < M && aCol < K) ? A[row * K + aCol] : 0.0f;
        tileB[threadIdx.y][threadIdx.x] =
            (bRow < K && col < N) ? B[bRow * N + col] : 0.0f;

        /* 确保 tile 完全加载后再计算 */
        __syncthreads();

        /* 从 LDS 读取数据做乘加——比从 VRAM 快 30 倍 */
        for (int k = 0; k < TILE_SIZE; k++) {
            sum += tileA[threadIdx.y][k] * tileB[k][threadIdx.x];
        }

        __syncthreads();
    }

    if (row < M && col < N) {
        C[row * N + col] = sum;
    }
}

/* 启动:
 * dim3 grid((N+15)/16, (M+15)/16);
 * dim3 block(16, 16);  // 256 threads per block
 * hipLaunchKernelGGL(matmul_tiled, grid, block,
 *                    0, 0, d_A, d_B, d_C, M, N, K); */`,
            annotations: [
              '__shared__ 在 LDS 中分配内存——访问延迟仅 ~10 cycles，而全局内存需要 ~300 cycles',
              'TILE_SIZE=16 → 每个 tile 16×16=256 float = 1KB，两个 tile 共 2KB，远小于 64KB LDS 限制',
              '__syncthreads() 是 Block 级 barrier——确保所有线程完成 LDS 写入后才开始读取',
              '边界检查 (row<M && aCol<K) 处理矩阵维度不是 TILE_SIZE 倍数的情况',
              '每个线程从 VRAM 加载 2 个元素，但在内层循环中从 LDS 读取 2×16 = 32 次——数据复用率 16:1',
              '无 tiling 版本对 VRAM 的访问量 = 2MNK，有 tiling 版本 = 2MNK/TILE_SIZE，减少 16 倍',
            ],
            explanation: 'LDS tiling 是 GPU 矩阵乘法优化的经典技术。核心思想是让 Block 内的线程协作地将 A、B 的小块从 VRAM 加载到 LDS，然后从 LDS（快 30 倍）进行实际的乘加运算。TILE_SIZE=16 时每个 tile 2KB，LDS 总用量 4KB，远小于 64KB 的 CU 限制，所以每个 CU 可以容纳多个 Block 同时执行。实际生产中会使用更大的 tile（如 32×32）和更复杂的寄存器 tiling 来进一步提高性能。',
          },
          miniLab: {
            title: '对比不同内存分配策略的传输性能',
            objective: '分别使用 hipMalloc+hipMemcpy、hipHostMalloc、hipMallocManaged 传输 256MB 数据，测量 CPU→GPU 传输带宽。',
            steps: [
              '编写测试程序：分配 256MB 的 float 数组（64M 个元素）',
              '方案 1: malloc + hipMalloc + hipMemcpy(H2D)，用 hipEventElapsedTime 计时',
              '方案 2: hipHostMalloc(flagDefault) + hipMalloc + hipMemcpy(H2D)',
              '方案 3: hipMallocManaged，直接在核函数中访问（触发自动迁移），测量核函数首次执行时间',
              '计算每种方案的有效带宽（GB/s）并与 PCIe 4.0 x16 理论带宽 (~32 GB/s) 对比',
              '在方案 2 基础上使用 hipMemcpyAsync + 双 Stream 实现计算与传输重叠',
            ],
            expectedOutput: `预期结果（RX 7600 XT, PCIe 4.0 x16）：
方案 1 (普通 malloc):  ~12 GB/s   ← 有额外的 staging copy
方案 2 (pinned):       ~25 GB/s   ← 接近 PCIe 理论带宽
方案 3 (managed):      首次 ~8 GB/s ← page fault + migration 开销大
双 Stream 重叠:        吞吐提升 30-40%`,
            hint: '用 hipEventCreate/Record/ElapsedTime 计时比 clock() 更准确，因为它测量的是 GPU 端时间。hipMallocManaged 的性能很依赖访问模式——如果 CPU 和 GPU 交替访问同一页，性能会严重下降（ping-pong migration）。',
          },
          debugExercise: {
            title: '找出异步传输中的错误',
            language: 'cpp',
            description: '以下代码试图用 hipMemcpyAsync 实现异步数据传输，但结果数据全是零。',
            question: '为什么 GPU 端收到的数据全是零？异步传输有什么前提条件？',
            buggyCode: `float *h_data = (float *)malloc(N * sizeof(float));  /* BUG! */
float *d_data;
hipMalloc(&d_data, N * sizeof(float));

for (int i = 0; i < N; i++) h_data[i] = 1.0f;

hipStream_t stream;
hipStreamCreate(&stream);

/* 异步传输 */
hipMemcpyAsync(d_data, h_data, N * sizeof(float),
               hipMemcpyHostToDevice, stream);

/* 启动核函数 */
hipLaunchKernelGGL(my_kernel, grid, block, 0, stream,
                   d_data, N);

hipStreamSynchronize(stream);
/* 结果: d_data 中数据全是零或垃圾! */`,
            hint: 'hipMemcpyAsync 对 host 端内存有特殊要求。普通 malloc 分配的内存能用于异步传输吗？',
            answer: '错误：使用普通 malloc 分配的内存进行 hipMemcpyAsync。异步传输要求 host 端内存必须是 pinned（页锁定）内存，通过 hipHostMalloc 分配。原因：hipMemcpyAsync 将传输任务交给 GPU 的 DMA 引擎（SDMA），DMA 引擎通过物理地址直接访问内存。普通 malloc 的内存可能被 OS 换出到磁盘（swap），物理地址可能在传输过程中改变。HIP 运行时检测到 host 内存非 pinned 时，hipMemcpyAsync 会退化为同步操作（先拷贝到内部 staging buffer），但这个过程的时序可能导致核函数先于数据到达而执行。修复：将 malloc 改为 hipHostMalloc(&h_data, N * sizeof(float), hipHostMallocDefault)。教训：async API 不等于 async behavior——必须满足前提条件才能真正异步执行。',
          },
          interviewQ: {
            question: '描述 GPU 的内存层次结构，以及如何选择 hipMalloc、hipHostMalloc 和 hipMallocManaged。',
            difficulty: 'medium',
            hint: '从延迟/带宽/大小/作用域描述每层内存，然后根据使用场景推荐分配策略。',
            answer: 'GPU 内存层次（从快到慢）：（1）Register：线程私有，~1 cycle，编译器自动分配局部变量；（2）LDS/Shared Memory：Block 共享，~10 cycles，64KB/CU，__shared__ 显式管理，用于线程间数据复用（如 tiled matmul）；（3）L1 Cache：CU 私有，~20 cycles，硬件自动缓存；（4）L2 Cache：全 GPU 共享，~100 cycles，RDNA3 上 32MB，是全局内存访问的缓冲；（5）VRAM：~300 cycles，GPU 本地显存；（6）System RAM：~1000+ cycles，通过 PCIe 访问。分配策略选择：hipMalloc 分配 VRAM——适用于 GPU 密集计算的数据，访问最快，是默认选择；hipHostMalloc 分配 pinned host memory——适用于 DMA 传输缓冲区和 CPU-GPU 频繁交换的小数据，还可用 hipHostMallocMapped 使 GPU 通过 PCIe 零拷贝访问；hipMallocManaged 分配统一地址空间内存——适用于快速原型开发或数据访问模式不规则的场景，运行时通过 page fault 自动迁移，但有迁移延迟开销。生产代码中推荐 hipMalloc + hipHostMalloc 组合，用 stream 实现传输与计算重叠。',
            amdContext: '这道题测试你对 GPU 内存系统的全面理解。面试时特别要提到 RDNA3 的大 L2（32MB），这是 AMD 相对于 NVIDIA 的设计差异之一。',
          },
        },
      ],
    },

    // ════════════════════════════════════════════════════════════
    // Group 8.2: 性能优化
    // ════════════════════════════════════════════════════════════
    {
      id: '8-2',
      number: '8.2',
      title: '性能优化',
      titleEn: 'Performance Optimization',
      icon: 'Zap',
      description: '深入理解 AMD GPU 的 Wavefront 执行模型、内存合并访问规则和 LDS 优化技术，并掌握 rocprof 性能分析工具。',
      lessons: [
        // ── Lesson 8.2.1 ──────────────────────────────────────
        {
          id: '8-2-1',
          number: '8.2.1',
          title: 'Wavefront 执行模型与分支分歧',
          titleEn: 'Wavefront Execution Model & Branch Divergence',
          duration: 15,
          difficulty: 'advanced',
          tags: ['wavefront', 'SIMT', 'divergence', 'occupancy', 'RDNA'],
          concept: {
            summary: 'AMD GPU 以 Wavefront 为最小执行粒度——一个 Wavefront 中的 32（Wave32）或 64（Wave64）个线程在同一个 SIMD 单元上锁步执行相同的指令。当 if/else 导致 Wavefront 内的线程走不同分支时，两条分支都必须执行（分支分歧），严重影响性能。',
            explanation: [
              'SIMT（Single Instruction, Multiple Threads）是 GPU 的基本执行模型。在 AMD 术语中，Wavefront 是一组线程在硬件 SIMD 单元上的同步执行组。RDNA 架构引入了双模式：Wave32（32 线程/wavefront）和 Wave64（64 线程/wavefront）。Wave32 是 RDNA 的默认模式，每个 SIMD 单元有 32 条 lane，一条指令在一个 cycle 内处理 32 个线程的数据；Wave64 模式下同一指令需要两个 cycle 完成，但减少了调度开销，适合高延迟容忍的计算。',
              '分支分歧（Branch Divergence）是 SIMT 模型的核心性能陷阱。当 Wavefront 内的线程执行到 if-else 时，如果部分线程走 if 分支、其余走 else 分支，GPU 的处理方式是：先执行 if 分支（else 线程被 mask 掉），再执行 else 分支（if 线程被 mask 掉）。这意味着 Wavefront 的执行时间是两条分支的总和，而非较长分支的时间。在最坏情况下（每个线程走不同分支），SIMD 效率降至 1/32（Wave32）或 1/64（Wave64）。',
              'AMD 的 RDNA 架构使用 EXEC mask 寄存器来控制分支执行。EXEC 是一个 32 位（Wave32）或 64 位（Wave64）的位掩码，每一位对应一个 lane。当执行 v_cmp_gt_f32（浮点比较）等指令时，结果写入 VCC（Vector Condition Code）寄存器，然后通过 s_and_b32 等标量指令更新 EXEC mask。被 mask 掉的 lane 虽然不产生实际效果（写入被抑制），但仍然消耗执行 cycle。对于简单的条件赋值，编译器会使用 v_cndmask 指令（predication）代替分支——这不会产生分歧，因为所有 lane 都执行同一条指令。',
              '占用率（Occupancy）衡量 CU 上活跃 Wavefront 数与最大可能值的比率。每个 CU 的资源有限：RDNA3 每个 CU 最多 16 个 Wave32（或 8 个 Wave64），受限于 VGPR（192KB/CU，每个 Wave32 最多 256 个 VGPR × 32 lane × 4 bytes = 32KB）、LDS（64KB/CU，Block 间共享）和 Block 数量上限。占用率越高，GPU 越能通过切换 Wavefront 来隐藏内存延迟。使用 rocm_agent_enumerator 和 hipOccupancyMaxPotentialBlockSize 可以计算给定核函数的最优 Block 大小。',
            ],
            keyPoints: [
              'Wavefront = SIMD 执行组：Wave32（RDNA 默认，32 线程/cycle）或 Wave64（64 线程/2 cycle）',
              '分支分歧使 Wavefront 串行执行所有分支路径，EXEC mask 控制哪些 lane 活跃',
              '简单条件用 v_cndmask（predication）无分歧，复杂分支用 s_cbranch 有分歧',
              '占用率 = 活跃 Wavefront / 最大 Wavefront，受 VGPR、LDS、Block 数量限制',
              '高占用率有助于隐藏延迟，但不是越高越好——寄存器压力也很重要',
              '用 __builtin_amdgcn_wave_reduce_add 等内置函数实现 Wavefront 级通信',
            ],
          },
          diagram: {
            title: 'Wavefront 分支分歧执行过程',
            content: `Wavefront 分支分歧示意（Wave32, 32 lanes）

代码:  if (threadIdx.x < 16) { A(); } else { B(); }

Step 1: 所有 32 个 lane 到达 if 语句
EXEC mask: 1111 1111 1111 1111 1111 1111 1111 1111
                                           ↓ 比较

Step 2: 执行 A() 分支（前 16 lane 活跃）
EXEC mask: 0000 0000 0000 0000 1111 1111 1111 1111
           lane 31..16 被 mask  lane 15..0 执行 A()
           （不写入结果）        （正常执行）
           ⏱️ 消耗时间!          ⏱️ 执行 A

Step 3: 执行 B() 分支（后 16 lane 活跃）
EXEC mask: 1111 1111 1111 1111 0000 0000 0000 0000
           lane 31..16 执行 B()  lane 15..0 被 mask
           ⏱️ 执行 B              （不写入结果）

Step 4: 分支合并，恢复完整 EXEC mask
EXEC mask: 1111 1111 1111 1111 1111 1111 1111 1111
           所有 lane 恢复活跃

总耗时 = Time(A) + Time(B) ← 而非 max(A, B)!

对比：无分歧的情况
if (blockIdx.x < gridDim.x / 2) { A(); } else { B(); }
→ 同一 Block 内的所有线程走同一分支 → 无分歧 → 耗时 = max(A,B)

Predication 优化（编译器自动生成）：
// 源代码: x = (cond) ? a : b;
// 编译为:
v_cmp_gt_f32  vcc, v0, v1       // 比较, 结果到 VCC
v_cndmask_b32 v2, v4, v3, vcc   // 根据 VCC 选择值
// 无分支, 无分歧, 1 条指令完成!`,
            caption: '分支分歧导致 Wavefront 串行执行两条路径。关键优化：让 Wavefront 内的线程走相同分支，或用 predication 替代分支。',
          },
          codeWalk: {
            title: '分歧 vs 非分歧核函数性能对比',
            file: 'divergence_test.hip',
            language: 'cpp',
            code: `#include <hip/hip_runtime.h>

/* 有分支分歧的核函数
 * Wavefront 内奇偶线程走不同路径 */
__global__ void divergent_kernel(float *out, const float *in, int n)
{
    int idx = blockIdx.x * blockDim.x + threadIdx.x;
    if (idx >= n) return;

    /* threadIdx.x 在 Wavefront 内是连续的
     * 奇数偶数线程交替 → 每个 Wavefront 都分歧! */
    if (threadIdx.x % 2 == 0) {
        out[idx] = sinf(in[idx]) * cosf(in[idx]);
        out[idx] += sqrtf(fabsf(in[idx]));
    } else {
        out[idx] = expf(in[idx]) * logf(fabsf(in[idx]) + 1.0f);
        out[idx] += rsqrtf(fabsf(in[idx]) + 1.0f);
    }
}

/* 无分支分歧的核函数
 * 同一 Wavefront 内所有线程走相同路径 */
__global__ void nondivergent_kernel(float *out, const float *in,
                                     int n)
{
    int idx = blockIdx.x * blockDim.x + threadIdx.x;
    if (idx >= n) return;

    /* 用 blockIdx.x 而非 threadIdx.x 分支
     * 同一 Block 的线程走相同路径 → 无分歧 */
    if (blockIdx.x % 2 == 0) {
        out[idx] = sinf(in[idx]) * cosf(in[idx]);
        out[idx] += sqrtf(fabsf(in[idx]));
    } else {
        out[idx] = expf(in[idx]) * logf(fabsf(in[idx]) + 1.0f);
        out[idx] += rsqrtf(fabsf(in[idx]) + 1.0f);
    }
}

/* 使用 predication（无分支）的核函数 */
__global__ void predicated_kernel(float *out, const float *in,
                                   int n)
{
    int idx = blockIdx.x * blockDim.x + threadIdx.x;
    if (idx >= n) return;

    float val = in[idx];
    float r1 = sinf(val) * cosf(val) + sqrtf(fabsf(val));
    float r2 = expf(val) * logf(fabsf(val) + 1.0f)
               + rsqrtf(fabsf(val) + 1.0f);

    /* 三元运算符通常编译为 v_cndmask → 无分歧 */
    out[idx] = (threadIdx.x % 2 == 0) ? r1 : r2;
}

/* 编译: hipcc -O2 divergence_test.hip -o divergence_test
 * 预期: divergent 比 nondivergent 慢 ~40-80% */`,
            annotations: [
              'threadIdx.x % 2 在 Wavefront 内交替 0/1 → 保证每个 Wavefront 都分歧',
              'blockIdx.x % 2 让整个 Block 走同一分支 → Wavefront 内部不分歧',
              '分歧版本需要执行 sinf+cosf+sqrtf 和 expf+logf+rsqrtf 两套计算，非分歧版本只执行其一',
              'predication 版本两套都计算，但用 v_cndmask 选择结果——无分支开销，适合两路工作量接近的情况',
              '-O2 优化级别下编译器会尝试自动转换简单分支为 predication',
              'sinf/expf 等超越函数在 RDNA3 上由 SFU（特殊函数单元）执行，延迟较高',
            ],
            explanation: '这三个核函数展示了分支分歧的性能影响和优化策略。divergent_kernel 中每个 Wavefront 都有一半线程空转；nondivergent_kernel 通过将分支粒度提升到 Block 级消除了分歧；predicated_kernel 则计算两个结果后选择，避免了分支。实际开发中应优先考虑重组数据或算法使 Wavefront 内线程走相同路径，其次考虑 predication。',
          },
          miniLab: {
            title: '测量分支分歧的性能代价',
            objective: '编译运行上面的三个核函数，用 hipEvent 测量耗时差异，用 rocprof 观察 SIMD 利用率。',
            steps: [
              '编译 divergence_test.hip：hipcc -O2 divergence_test.hip -o divergence_test',
              '对 N=16M 分别运行三个核函数，每个重复 100 次取平均，用 hipEvent 计时',
              '记录三者的执行时间和相对差异',
              '用 rocprof --stats ./divergence_test 查看核函数级别的耗时统计',
              '用 rocprof -i counters.txt ./divergence_test 采集 SQ_WAVES 和 SQ_INSTS_VALU 计数器',
              '计算每个 Wavefront 的平均 VALU 指令数，对比分歧和非分歧版本',
            ],
            expectedOutput: `预期结果 (N=16M, RX 7600 XT):
divergent_kernel:    ~2.8 ms  (100%)
nondivergent_kernel: ~1.6 ms  (~57%, 快 43%)
predicated_kernel:   ~2.2 ms  (~79%)

SQ_INSTS_VALU (per wavefront):
divergent:    ~48 instructions (执行了两条路径)
nondivergent: ~28 instructions (只执行一条路径)`,
            hint: '创建 counters.txt 内容为 "pmc: SQ_WAVES SQ_INSTS_VALU SQ_INSTS_SALU"，然后运行 rocprof -i counters.txt ./divergence_test。如果 rocprof 报错，确保 ROCm 安装了 rocprofiler 组件。',
          },
          debugExercise: {
            title: '识别隐藏的分支分歧',
            language: 'cpp',
            description: '以下核函数看起来没有 if-else，但实际上存在严重的分支分歧。',
            question: '这段代码中的分支分歧在哪里？为什么不容易发现？',
            buggyCode: `__global__ void hidden_divergence(float *out, const float *in,
                                  int n)
{
    int idx = blockIdx.x * blockDim.x + threadIdx.x;
    if (idx >= n) return;

    float val = in[idx];

    /* 看起来没有 if-else，但... */
    for (int i = 0; i < (int)val; i++) {  /* BUG: 循环次数依赖数据! */
        val = sqrtf(val);
    }

    out[idx] = val;
}
/* 如果 in[] = {1.0, 100.0, 2.0, 50.0, ...}
 * 不同线程的循环次数差异巨大! */`,
            hint: '循环也是一种分支——循环条件不满足时跳出，满足时继续。如果 Wavefront 内线程的循环次数不同会怎样？',
            answer: '分歧在 for 循环中。循环的本质是 "if (条件) goto loop_body; else goto loop_exit;"——每次迭代结束时检查条件就是一次分支决策。当 Wavefront 内不同线程的循环次数不同时（因为 val 不同），先结束的线程必须等待最慢的线程完成所有迭代。如果 in[] 的值范围很大（如 1 到 100），整个 Wavefront 的执行时间取决于最大值线程的循环次数，其他线程空转等待。这种"隐藏分歧"比显式 if-else 更难发现，因为代码表面上没有条件分支。修复策略：（1）预处理数据使同一 Wavefront 内的值范围接近（排序后再处理）；（2）设置最大迭代次数限制；（3）用解析公式替代迭代（如 val = pow(val, 1.0/pow(2,n))）。这是 GPU 编程中最隐蔽的性能杀手之一。',
          },
          interviewQ: {
            question: '解释 AMD GPU 的 Wavefront 执行模型，Wave32 和 Wave64 的区别，以及分支分歧如何影响性能。',
            difficulty: 'hard',
            hint: '从 SIMT 模型入手，解释 EXEC mask 机制，对比 Wave32/64 的优劣，给出避免分歧的实际策略。',
            answer: 'AMD GPU 使用 SIMT 模型，以 Wavefront 为最小调度和执行单位。RDNA 架构支持两种模式：Wave32（32 线程/wavefront，一个 SIMD cycle 处理完）和 Wave64（64 线程，需要 2 cycles 但调度开销减半）。Wave32 优势：分支分歧影响更小（最坏 1/32 vs 1/64 效率），延迟更低（一条指令处理完就能发射下一条）；Wave64 优势：调度开销更低（每 CU 管理的 wavefront 更少），对高延迟容忍的内存密集型任务更有利。分支分歧机制：当 if-else 导致 Wavefront 内线程走不同路径时，GPU 使用 EXEC 寄存器（32/64 位掩码）依次 mask 执行两条路径，总时间 = Time(if) + Time(else)。EXEC mask 由标量比较指令（s_cmp）和向量比较指令（v_cmp）设置，VCC 寄存器保存比较结果。避免分歧的策略：（1）让分支粒度对齐到 Wavefront 大小（用 blockIdx 而非 threadIdx 分支）；（2）对数据排序使相邻线程处理相似数据；（3）使用 predication（v_cndmask）替代分支；（4）将不同工作负载拆分到不同核函数。',
            amdContext: 'Wave32/Wave64 是 AMD 特有的面试考点。NVIDIA 固定使用 32 线程/warp，而 AMD 的灵活性意味着开发者需要根据工作负载特性选择模式（hipcc -mwavefrontsize64 或默认 Wave32）。',
          },
        },

        // ── Lesson 8.2.2 ──────────────────────────────────────
        {
          id: '8-2-2',
          number: '8.2.2',
          title: '内存合并访问与 LDS 优化',
          titleEn: 'Memory Coalescing & LDS Optimization',
          duration: 15,
          difficulty: 'advanced',
          tags: ['coalescing', 'memory-access', 'LDS', 'bank-conflict', 'AoS-SoA'],
          concept: {
            summary: 'GPU 全局内存（VRAM）的访问性能严重依赖访问模式——连续地址的合并访问（coalesced access）可以达到接近峰值的带宽，而随机或跨步访问的性能可能下降 10 倍以上。LDS 同样存在 bank conflict 问题。掌握内存合并规则和 LDS 优化是 GPU 性能调优的核心。',
            explanation: [
              '全局内存合并（Memory Coalescing）是 GPU 内存系统的核心优化机制。当 Wavefront 中的线程访问的地址是连续且对齐的时，GPU 可以将这些请求合并（coalesce）为少量的 128 字节缓存行请求。例如，32 个线程各读取一个 4 字节 float，如果地址连续（thread 0 读 addr, thread 1 读 addr+4, ...），只需要 1 个 128 字节的缓存行请求。反之，如果 32 个线程各读取不连续的地址，可能需要 32 个独立的缓存行请求——带宽利用率只有 1/32。',
              '常见的非合并访问模式：（1）跨步访问（Strided Access）：每个线程读取 stride>1 的地址（如二维数组按列遍历），stride 越大性能越差；（2）随机访问（Random Access）：通过索引数组间接访问，完全无法预测；（3）AoS（Array of Structures）布局：结构体数组中，同一字段的数据在内存中不连续。与 AoS 相对的是 SoA（Structure of Arrays）布局：每个字段单独存一个数组，同一字段的数据连续存放，天然适合合并访问。',
              'LDS（Local Data Share）是每个 CU 内的高速可编程内存（RDNA3 每 CU 64KB），访问延迟约 10 cycles。LDS 被组织为 32 个 bank，每个 bank 4 字节宽。当同一个 cycle 内多个线程访问同一个 bank 的不同地址时，就发生 bank conflict——这些访问必须串行化。例如，32 个线程都访问 bank 0 的不同行，就是 32-way bank conflict，延迟增加 32 倍。避免 bank conflict 的关键：确保同一 Wavefront 内相邻线程访问不同的 bank。',
              '实际优化中的 LDS tiling + padding 技术：在矩阵转置或 tiled 矩阵乘法中，从全局内存按行加载到 LDS tile 后，如果按列读取 LDS 就会产生 bank conflict（因为矩阵一行对应的 bank 编号相同）。解决方法是给 LDS 数组的行末尾添加 padding（如 __shared__ float tile[TILE][TILE+1]），使每行偏移一个 bank，从而让列访问跨越不同 bank。这个 +1 padding 技巧是 GPU 编程中的经典优化。',
              '归约（Reduction）是 GPU 编程中的基本并行模式——将数组的所有元素通过某个操作（加法、最大值等）缩减为一个值。LDS 归约的最佳实践：在 Block 内使用 LDS 保存部分结果，通过 __syncthreads() 同步后逐步合并。关键优化：（1）避免 bank conflict：在每一步中让不同线程访问不同的 bank；（2）避免分歧：活跃线程应该连续（用 tid < stride 而非 tid % (2*stride) == 0）；（3）使用 warp-level 原语（如 __shfl_down）在 Wavefront 内不需要 LDS 就能归约。',
            ],
            keyPoints: [
              '合并访问：相邻线程访问连续地址 → 少量缓存行请求 → 接近峰值带宽',
              '跨步/随机访问：多个缓存行请求 → 带宽利用率可能下降 10-32 倍',
              'AoS → SoA 转换是最简单有效的合并优化——GPU 代码优先使用 SoA 布局',
              'LDS bank conflict：同一 cycle 访问同一 bank 的不同地址 → 串行化',
              'Padding 技巧（tile[N][N+1]）消除列访问的 bank conflict',
              '归约优化：连续线程活跃 + LDS 无 conflict + Wavefront 级 shuffle',
            ],
          },
          diagram: {
            title: '合并访问 vs 跨步访问的内存事务对比',
            content: `内存合并访问 vs 跨步访问

场景: 32 个线程（Wave32）各读取 1 个 float (4 bytes)

═══ 合并访问 (Coalesced) ═══
Thread:   0    1    2    3    4   ...   31
Address: [0]  [4]  [8]  [12] [16] ... [124]
          └────────────────────────────┘
          连续 128 bytes → 1 个缓存行请求
          带宽效率: 128/128 = 100%

═══ Stride-2 跨步访问 ═══
Thread:   0    1    2    3    4   ...   31
Address: [0]  [8]  [16] [24] [32] ... [248]
          └─────────┘└─────────┘
          2 个缓存行, 每个只用一半
          带宽效率: 128/256 = 50%

═══ Stride-32 跨步访问 (列访问) ═══
Thread:   0      1      2     ...   31
Address: [0]   [128]  [256]  ... [3968]
          ↓      ↓      ↓           ↓
         行0    行1    行2   ...  行31  (各自独立的缓存行!)
          32 个缓存行请求!
          带宽效率: 128/4096 ≈ 3%

═══ AoS vs SoA ═══

AoS (Array of Structures):          SoA (Structure of Arrays):
struct { float x,y,z,w; } p[N];     struct { float x[N]; float y[N];
                                              float z[N]; float w[N]; } p;
内存: [x0 y0 z0 w0 x1 y1 z1 w1..]  内存: [x0 x1 x2 ... | y0 y1 y2 ...]

读取所有 x:                          读取所有 x:
Thread 0: p[0].x → addr 0           Thread 0: p.x[0] → addr 0
Thread 1: p[1].x → addr 16  (跳4)   Thread 1: p.x[1] → addr 4  (连续!)
→ stride-4 跨步, 效率 ~25%           → 合并访问, 效率 100%`,
            caption: '内存合并规则的核心：相邻线程访问相邻地址。AoS 布局天然是跨步访问，SoA 布局天然是合并访问。GPU 代码应该优先使用 SoA 数据布局。',
          },
          codeWalk: {
            title: '合并访问 vs 跨步访问性能对比',
            file: 'coalescing_test.hip',
            language: 'cpp',
            code: `#include <hip/hip_runtime.h>

/* 合并访问：相邻线程访问相邻地址 */
__global__ void coalesced_read(float *out, const float *in, int n)
{
    int idx = blockIdx.x * blockDim.x + threadIdx.x;
    if (idx < n)
        out[idx] = in[idx] * 2.0f;  /* in[0], in[1], in[2], ... */
}

/* 跨步访问：相邻线程访问隔 STRIDE 个元素的地址 */
__global__ void strided_read(float *out, const float *in,
                              int n, int stride)
{
    int idx = blockIdx.x * blockDim.x + threadIdx.x;
    /* 将线程映射到跨步位置 */
    int mapped = (idx % stride) * (n / stride) + (idx / stride);
    if (mapped < n)
        out[mapped] = in[mapped] * 2.0f;
}

/* 用 LDS 实现矩阵转置（带 padding 消除 bank conflict） */
#define TILE 32
__global__ void transpose_optimized(float *out, const float *in,
                                     int width, int height)
{
    /* +1 padding 避免列读取时的 bank conflict! */
    __shared__ float tile[TILE][TILE + 1];

    int xIdx = blockIdx.x * TILE + threadIdx.x;
    int yIdx = blockIdx.y * TILE + threadIdx.y;

    /* 按行读取输入 → 合并访问 */
    if (xIdx < width && yIdx < height)
        tile[threadIdx.y][threadIdx.x] = in[yIdx * width + xIdx];

    __syncthreads();

    /* 按列读取 LDS（因为 padding，无 bank conflict）
     * 按行写入输出 → 合并访问 */
    xIdx = blockIdx.y * TILE + threadIdx.x;
    yIdx = blockIdx.x * TILE + threadIdx.y;

    if (xIdx < height && yIdx < width)
        out[yIdx * height + xIdx] = tile[threadIdx.x][threadIdx.y];
}

/* 无 padding 版本 (有 bank conflict):
 * __shared__ float tile[TILE][TILE];  // 无 +1
 * tile[threadIdx.x][threadIdx.y] 时:
 *   thread 0 访问 bank 0 (addr 0)
 *   thread 1 访问 bank 0 (addr 32*4=128)  ← 同一 bank!
 *   → 32-way bank conflict! */`,
            annotations: [
              'coalesced_read: in[idx] 中 idx 在 Wavefront 内连续 → 1 次 128B 请求 → 最高效',
              'strided_read: mapped 地址在 Wavefront 内不连续 → 多次缓存行请求 → 低效',
              'TILE+1 padding：tile[32][33] 而非 tile[32][32]，使每行偏移 1 个 bank',
              '不加 padding 时列读取 tile[threadIdx.x][threadIdx.y]：thread 0,1,2.. 读 bank 0,0,0.. → 32-way conflict',
              '加 padding 后：thread 0 读 bank 0, thread 1 读 bank 1, ... → 无 conflict',
              '转置的全局内存读写都是合并的（按行），非合并的列变换在 LDS 中完成',
            ],
            explanation: '矩阵转置是内存合并优化的经典案例。直接转置（in[j*W+i] → out[i*H+j]）要么读不合并要么写不合并。使用 LDS tile 作为中间缓冲：先按行合并读取到 LDS，再从 LDS 按列读取并合并写出。+1 padding 是消除 LDS bank conflict 的标准技巧——多付出 1/32 的 LDS 空间，换来 32 倍的 bank conflict 消除。',
          },
          miniLab: {
            title: '量化内存合并对带宽的影响',
            objective: '对比不同 stride 值下全局内存读取的有效带宽，绘制 stride-bandwidth 曲线。',
            steps: [
              '编写测试程序：N=64M floats，分别用 stride=1,2,4,8,16,32 读取',
              '用 hipEventElapsedTime 计时，计算有效带宽 = 数据量 / 耗时 (GB/s)',
              '绘制 stride vs bandwidth 曲线（或打印表格）',
              '对比合并读取的带宽与理论 VRAM 带宽（RX 7600 XT ~288 GB/s）',
              '实现带 padding 和不带 padding 的 LDS 矩阵转置，对比 4096×4096 矩阵的性能',
              '用 rocprof 采集 TCC_HIT（L2 缓存命中率）计数器验证合并效果',
            ],
            expectedOutput: `预期有效带宽 (RX 7600 XT):
Stride 1:   ~250 GB/s (87% 峰值)
Stride 2:   ~150 GB/s (52%)
Stride 4:   ~80 GB/s  (28%)
Stride 8:   ~45 GB/s  (16%)
Stride 16:  ~25 GB/s  (9%)
Stride 32:  ~15 GB/s  (5%)  ← 每个线程一个缓存行!

LDS 转置 (4096×4096):
无 padding: ~150 GB/s
有 padding: ~240 GB/s  ← ~60% 提升!`,
            hint: '确保数据量足够大（>64MB）以消除启动开销的影响。使用 hipDeviceSynchronize 确保计时准确。L2 缓存效果会掩盖部分 stride 影响——可以用远大于 L2 的数据集来观察纯 VRAM 访问性能。',
          },
          debugExercise: {
            title: '找出 LDS 中的 bank conflict',
            language: 'cpp',
            description: '以下矩阵转置代码使用了 LDS，但性能远低于预期。',
            question: '这段代码有什么 LDS 访问性能问题？如何修复？',
            buggyCode: `#define TILE 32
__global__ void transpose_naive(float *out, const float *in,
                                 int W, int H)
{
    __shared__ float tile[TILE][TILE];  /* BUG: 无 padding! */

    int x = blockIdx.x * TILE + threadIdx.x;
    int y = blockIdx.y * TILE + threadIdx.y;

    if (x < W && y < H)
        tile[threadIdx.y][threadIdx.x] = in[y * W + x];

    __syncthreads();

    x = blockIdx.y * TILE + threadIdx.x;
    y = blockIdx.x * TILE + threadIdx.y;

    if (x < H && y < W)
        /* 按列读取 LDS → 32-way bank conflict! */
        out[y * H + x] = tile[threadIdx.x][threadIdx.y];
}`,
            hint: 'LDS 有 32 个 bank，每 4 字节一个 bank。tile[32][32] 中，同一列的所有元素映射到同一个 bank。',
            answer: '问题：tile[threadIdx.x][threadIdx.y] 按列读取 LDS 产生 32-way bank conflict。LDS 的 32 个 bank 按地址 addr%128/4（即 addr/4 % 32）分配。tile[32][32] 中一行是 32×4=128 字节，恰好是 32 个 bank 的完整周期。因此 tile[0][j]、tile[1][j]、...tile[31][j] 都映射到同一个 bank（bank j）。当 threadIdx.x=0..31 同时访问 tile[0..31][threadIdx.y] 时，所有 32 个请求都到同一个 bank → 必须串行化，延迟增加 32 倍。修复：将声明改为 __shared__ float tile[TILE][TILE+1]，即 tile[32][33]。这样一行是 33×4=132 字节，tile[i][j] 和 tile[i+1][j] 不再在同一个 bank（偏移了 1 个 bank）。额外的空间开销只有 32×4=128 字节（+3%），但性能提升可达 30-60%。',
          },
          interviewQ: {
            question: '解释 GPU 的内存合并（coalescing）规则，以及 AoS vs SoA 数据布局对 GPU 性能的影响。',
            difficulty: 'hard',
            hint: '从缓存行大小、Wavefront 访问模式、带宽利用率的角度解释合并规则，然后对比 AoS/SoA 的访问模式。',
            answer: '内存合并规则：GPU 的全局内存控制器以缓存行（通常 128 字节，RDNA 上按 64 字节 sector 处理）为粒度访问 VRAM。当一个 Wavefront 的 32 个线程同时发起内存请求时，内存控制器会检查这些地址是否落在少量连续的缓存行中。如果 32 个线程各读 4 字节 float，地址连续对齐，则只需要 1 个 128 字节的缓存行事务——这就是完美合并，带宽利用率 100%。如果地址分散到 N 个缓存行中，就需要 N 次事务，每次只有部分数据有用——带宽利用率降至 1/N。AoS vs SoA：AoS（struct{float x,y,z;} arr[N]）在内存中的布局是 [x0,y0,z0,x1,y1,z1,...]。当 GPU 线程并行读取所有粒子的 x 坐标时，stride=3（每隔 12 字节），带宽利用率只有 ~33%。SoA（struct{float x[N]; float y[N]; float z[N];}）布局是 [x0,x1,x2,...|y0,y1,y2,...]，读取所有 x 时地址连续，完美合并。GPU 代码应始终优先使用 SoA 或混合布局（AoSoA：小组 SoA 然后组间 AoS，兼顾缓存局部性和合并）。',
            amdContext: '这是 GPU 性能优化的核心知识。AMD 面试中会结合具体场景（如粒子模拟、图像处理）问如何优化内存访问模式。能提到 RDNA 的 64 字节 sector 和 L2 缓存行为是加分项。',
          },
        },

        // ── Lesson 8.2.3 ──────────────────────────────────────
        {
          id: '8-2-3',
          number: '8.2.3',
          title: 'rocprof 性能分析实战',
          titleEn: 'rocprof Performance Profiling in Practice',
          duration: 15,
          difficulty: 'advanced',
          tags: ['rocprof', 'profiling', 'hardware-counters', 'hsa-trace', 'performance'],
          concept: {
            summary: 'rocprof 是 AMD ROCm 官方的 GPU 性能分析工具——它可以采集核函数执行统计、硬件性能计数器（如 SIMD 利用率、缓存命中率、内存带宽）和 HSA API 追踪。掌握 rocprof 是诊断和优化 HIP 程序性能的关键技能。',
            explanation: [
              'rocprof 有三种主要使用模式：（1）--stats 模式：输出每个核函数的调用次数、总耗时、平均耗时、最大/最小耗时。这是性能分析的起点——先找到最耗时的核函数，再深入分析；（2）-i input.txt 模式：通过输入文件指定要采集的硬件性能计数器（Hardware Performance Counters），GPU 内置了数百个计数器来监控各个硬件单元的活动；（3）--hsa-trace 模式：追踪 HSA Runtime API 调用（内存分配、核函数启动、数据传输），生成时间线可视化数据。',
              'AMD GPU 的硬件计数器覆盖了所有关键性能指标：SQ_WAVES（Shader Sequencer 分发的 Wavefront 数量）——反映 GPU 的计算利用率；SQ_INSTS_VALU（执行的向量 ALU 指令数）——反映计算密度；TCC_HIT / TCC_MISS（L2 缓存命中/未命中数）——反映内存访问效率；TA_FLAT_READ_WAVEFRONTS / TA_FLAT_WRITE_WAVEFRONTS（全局内存读写事务数）——反映内存带宽利用；SQ_WAIT_INST_ANY（等待指令的 cycle 数）——反映内存延迟的影响。',
              '使用 rocprof 的标准工作流：第一步，运行 rocprof --stats ./my_program 获取核函数级别的耗时分布；第二步，针对最耗时的核函数，编写 input.txt 指定计数器（如 pmc: SQ_WAVES TCC_HIT TCC_MISS），运行 rocprof -i input.txt ./my_program；第三步，分析计数器数据计算关键指标：L2 命中率 = TCC_HIT / (TCC_HIT + TCC_MISS)，VALU 利用率 = SQ_INSTS_VALU / (SQ_WAVES × 理论每 wavefront 指令数)，有效内存带宽 = (读写字节数) / 核函数耗时；第四步，根据瓶颈类型选择优化方向：如果 VALU 利用率高但 TCC_MISS 多 → 优化内存访问模式；如果 VALU 利用率低但 SQ_WAIT 高 → 提高占用率或使用预取。',
              '--hsa-trace 生成的追踪数据可以导出为 Chrome Tracing 格式（JSON），用 chrome://tracing 或 Perfetto 打开，可视化 CPU-GPU 时间线：看到核函数之间的间隔（launch overhead）、数据传输与计算的重叠情况、多 Stream 的并行度。这对诊断"GPU 利用率低"的问题非常有效——通常是 CPU 端准备数据太慢或核函数 launch 太频繁导致 GPU 空闲。',
              'rocprof 的高级功能：--timestamp on 在输出中包含纳秒级时间戳；--basenames on 显示函数名而非 mangled 符号；可以通过 ROCP_METRICS 环境变量查询所有可用计数器（rocprof --list-basic 和 rocprof --list-derived）。注意硬件计数器有采集限制——每次运行最多同时采集 4-8 个基础计数器（受 SPM 硬件限制），如果 input.txt 中指定了更多，rocprof 会自动分多次运行（multi-pass），总时间会增加。',
            ],
            keyPoints: [
              'rocprof --stats：核函数级耗时统计，找到热点函数',
              'rocprof -i input.txt：采集硬件计数器（SQ_WAVES, TCC_HIT, SQ_INSTS_VALU 等）',
              'rocprof --hsa-trace：HSA API 追踪，生成时间线数据',
              'L2 命中率 = TCC_HIT / (TCC_HIT + TCC_MISS)，低命中率 → 优化内存访问模式',
              '计数器每次最多同时采集 4-8 个（硬件限制），超过会 multi-pass',
              'rocprof --list-basic 查看所有可用基础计数器，--list-derived 查看派生指标',
            ],
          },
          diagram: {
            title: 'rocprof 性能分析工作流',
            content: `rocprof 性能分析完整工作流

Step 1: 找到热点核函数
─────────────────────
$ rocprof --stats ./my_program

输出 results.stats.csv:
┌──────────────────┬───────┬──────────┬──────────┐
│ KernelName       │ Calls │ TotalNs  │ AvgNs    │
├──────────────────┼───────┼──────────┼──────────┤
│ matmul_tiled     │  100  │ 85000000 │  850000  │ ← 85% 时间!
│ vector_add       │  100  │  5000000 │   50000  │
│ reduce_sum       │  100  │ 10000000 │  100000  │
└──────────────────┴───────┴──────────┴──────────┘

Step 2: 针对热点采集计数器
─────────────────────────
input.txt:
  pmc: SQ_WAVES SQ_INSTS_VALU TCC_HIT TCC_MISS

$ rocprof -i input.txt ./my_program

输出 input.csv:
┌──────────────┬──────────┬────────────┬─────────┬──────────┐
│ KernelName   │ SQ_WAVES │SQ_INSTS_VALU│TCC_HIT │TCC_MISS │
├──────────────┼──────────┼────────────┼─────────┼──────────┤
│ matmul_tiled │  32768   │  4194304   │ 1200000 │  800000  │
└──────────────┴──────────┴────────────┴─────────┴──────────┘

Step 3: 分析指标
───────────────
L2 命中率 = 1200000 / (1200000+800000) = 60%  ← 偏低!
VALU/Wave = 4194304 / 32768 = 128 指令/wave   ← 计算密度
→ 瓶颈: 内存访问效率 → 优化: 增大 tile, 改善合并

Step 4: HSA 时间线分析
────────────────────
$ rocprof --hsa-trace ./my_program
→ 输出 results.json, 用 chrome://tracing 打开

CPU Timeline: ──launch──wait──launch──wait──launch──
GPU Timeline: ─────────[kernel]────[kernel]─────────
                       ↑                   ↑
                       GPU idle!           GPU idle!
→ 问题: launch 间隔太大 → 优化: 使用 stream, 减少同步`,
            caption: 'rocprof 的标准工作流：先找热点（--stats），再采集计数器（-i），然后分析瓶颈，最后用时间线（--hsa-trace）检查 CPU-GPU 协作效率。',
          },
          codeWalk: {
            title: 'rocprof input.txt 计数器配置文件详解',
            file: 'rocprof_configs/input.txt',
            language: 'text',
            code: `# rocprof 硬件计数器配置文件
# 使用方法: rocprof -i input.txt ./my_program
# 输出: input.csv (每个核函数一行，列为指定的计数器值)

# ────────────────────────────────────────────────
# 基础计数器组 1: 计算利用率
# 注意: 每行 pmc 不超过 4-8 个计数器 (硬件限制)
# ────────────────────────────────────────────────
pmc: SQ_WAVES SQ_INSTS_VALU SQ_INSTS_SALU SQ_WAIT_INST_ANY
# SQ_WAVES:          分发的 Wavefront 总数
# SQ_INSTS_VALU:     执行的向量 ALU 指令数
# SQ_INSTS_SALU:     执行的标量 ALU 指令数
# SQ_WAIT_INST_ANY:  等待(stall)的 cycle 数

# ────────────────────────────────────────────────
# 基础计数器组 2: 缓存效率
# ────────────────────────────────────────────────
pmc: TCC_HIT TCC_MISS TCC_EA_RDREQ TCC_EA_WRREQ
# TCC_HIT:       L2 缓存命中次数
# TCC_MISS:      L2 缓存未命中次数
# TCC_EA_RDREQ:  发送到 VRAM 的读请求数
# TCC_EA_WRREQ:  发送到 VRAM 的写请求数

# ────────────────────────────────────────────────
# 基础计数器组 3: 内存带宽
# ────────────────────────────────────────────────
pmc: TA_FLAT_READ_WAVEFRONTS TA_FLAT_WRITE_WAVEFRONTS
# TA_FLAT_READ_WAVEFRONTS:  全局内存读事务(per wavefront)
# TA_FLAT_WRITE_WAVEFRONTS: 全局内存写事务(per wavefront)

# ────────────────────────────────────────────────
# 使用 range 过滤特定核函数 (可选)
# ────────────────────────────────────────────────
# range: 0:1
# 只分析第 0 到第 1 次核函数调用

# ────────────────────────────────────────────────
# 派生指标 (rocprof --list-derived 查看完整列表)
# ────────────────────────────────────────────────
# pmc: VALUUtilization VALUBusy L2CacheHit MemUnitBusy
# 这些是 rocprof 从基础计数器计算得到的百分比指标

# ────────────────────────────────────────────────
# 完整分析命令示例:
# ────────────────────────────────────────────────
# 1) 核函数统计:
#    rocprof --stats ./my_program
#
# 2) 硬件计数器:
#    rocprof -i input.txt ./my_program
#
# 3) HSA API 追踪:
#    rocprof --hsa-trace ./my_program
#
# 4) 生成 Chrome Tracing 格式:
#    rocprof --hsa-trace --timestamp on ./my_program
#    → 用 chrome://tracing 打开 results.json
#
# 5) 查看所有可用计数器:
#    rocprof --list-basic    (基础硬件计数器)
#    rocprof --list-derived  (派生指标)`,
            annotations: [
              '每个 pmc: 行定义一组要同时采集的计数器，多个 pmc: 行会导致 multi-pass（程序运行多次）',
              'SQ（Shader Sequencer）计数器反映计算管线状态——SQ_WAVES 是最基本的活跃度指标',
              'TCC（Texture Cache Controller，即 L2）计数器反映缓存效率——命中率低意味着内存访问模式差',
              'TA（Texture Addresser）计数器反映全局内存事务数——与合并访问效率直接相关',
              'range: 过滤器可以只分析特定的核函数调用，减少噪声',
              '派生指标（如 VALUUtilization）是 rocprof 从基础计数器自动计算的百分比，更直观',
            ],
            explanation: '这个 input.txt 展示了 rocprof 计数器配置的完整格式。在实际性能分析中，你通常需要分三组采集计数器（计算、缓存、内存），然后综合分析瓶颈。关键指标：L2 命中率 = TCC_HIT/(TCC_HIT+TCC_MISS) 反映内存访问的局部性；VALU 指令数/Wavefront 数 反映计算密度；SQ_WAIT 比例反映 stall 程度。AMD 的 GPU 有数百个硬件计数器，rocprof --list-basic 可以列出你的 GPU 支持的所有计数器。',
          },
          miniLab: {
            title: '用 rocprof 分析 matrix multiply 性能',
            objective: '对之前实现的 tiled 和 naive 矩阵乘法分别运行 rocprof，对比关键性能指标。',
            setup: `# 确保 rocprof 可用
which rocprof  # 应该在 /opt/rocm/bin/rocprof

# 创建计数器配置文件
cat > counters.txt << 'EOF'
pmc: SQ_WAVES SQ_INSTS_VALU TCC_HIT TCC_MISS
EOF`,
            steps: [
              '编写同时包含 naive 和 tiled 矩阵乘法的程序，矩阵大小 2048×2048',
              '运行 rocprof --stats ./matmul 获取核函数耗时对比',
              '运行 rocprof -i counters.txt ./matmul 采集硬件计数器',
              '计算 naive 和 tiled 版本的 L2 命中率和 VALU 效率',
              '运行 rocprof --hsa-trace --timestamp on ./matmul 生成时间线',
              '打开 chrome://tracing 导入 results.json，观察核函数执行时间线',
            ],
            expectedOutput: `$ rocprof --stats ./matmul
Name            Calls   TotalDurationNs   AverageNs
matmul_naive    1       45000000          45000000   ← 45ms
matmul_tiled    1       8500000           8500000    ← 8.5ms (5.3x faster!)

$ rocprof -i counters.txt ./matmul (简化):
               SQ_WAVES  SQ_INSTS_VALU  TCC_HIT   TCC_MISS
matmul_naive   131072    67108864       500000    1500000   ← L2命中率 25%
matmul_tiled   131072    67108864       1600000   400000    ← L2命中率 80%!`,
            hint: '如果 rocprof 报 "permission denied"，需要 sudo 或者将用户加入 video 组。如果计数器值全是 0，确认 GPU 是否支持该计数器（rocprof --list-basic | grep SQ_WAVES）。不同 GPU 架构支持的计数器名可能略有不同。',
          },
          debugExercise: {
            title: '分析 rocprof 输出诊断性能瓶颈',
            language: 'text',
            description: '以下是 rocprof 对一个核函数的计数器输出。诊断该核函数的性能瓶颈。',
            question: '根据这些计数器数据，该核函数的主要瓶颈是什么？如何优化？',
            buggyCode: `rocprof 输出 (核函数: particle_update, N=1M 粒子):

Duration:         12.5 ms
SQ_WAVES:         32768
SQ_INSTS_VALU:    524288    (16 VALU insts/wave)
SQ_INSTS_SALU:    65536     (2 SALU insts/wave)
SQ_WAIT_INST_ANY: 98304000  (3000 wait cycles/wave!)
TCC_HIT:          50000
TCC_MISS:         950000    (L2 命中率仅 5%!)
TA_FLAT_READ_WAVEFRONTS:  512000

/* 核函数代码 (简化): */
struct Particle { float x, y, z, vx, vy, vz, mass, temp; };

__global__ void particle_update(Particle *particles, int n) {
    int idx = blockIdx.x * blockDim.x + threadIdx.x;
    if (idx < n) {
        particles[idx].x += particles[idx].vx * dt;
        particles[idx].y += particles[idx].vy * dt;
        particles[idx].z += particles[idx].vz * dt;
    }
}`,
            hint: '观察两个关键指标：L2 命中率（5%）和 SQ_WAIT_INST_ANY（3000 cycles/wave）。再看数据布局——Particle 是 AoS 结构体。',
            answer: '瓶颈诊断：该核函数是严重的内存瓶颈（memory-bound）。证据：（1）SQ_WAIT_INST_ANY = 3000 cycles/wave 极高，说明大量时间在等待内存；（2）TCC_MISS 命中率仅 5%（50000/(50000+950000)），L2 缓存几乎无效；（3）VALU 指令只有 16/wave，计算量很小。根本原因是 AoS 数据布局——Particle 结构体 8 个 float = 32 字节，但核函数只读写 x/y/z/vx/vy/vz 这 6 个字段。相邻线程访问相邻 Particle 时，stride=32 字节，每次缓存行加载只有 6/8=75% 的数据有用，且 stride>4 导致不完美合并。更关键的是 L2 缓存命中率极低——每个 Particle 只被访问一次，无法复用。优化方案：（1）将 AoS 改为 SoA：float x[N], y[N], z[N], vx[N], vy[N], vz[N]——合并访问且只加载需要的字段；（2）预期效果：带宽利用率从 ~25% 提升到接近 100%，SQ_WAIT 大幅下降，整体提速 3-4 倍。',
          },
          interviewQ: {
            question: '描述你使用 rocprof 分析和优化 HIP 核函数性能的工作流程。',
            difficulty: 'hard',
            hint: '从 --stats 找热点开始，到计数器采集、指标分析、瓶颈定位、优化策略的完整流程。提到具体的计数器名称和计算公式。',
            answer: '我的 rocprof 性能分析流程：（1）定位热点：rocprof --stats 获取所有核函数的耗时分布，找到占总时间最多的核函数（通常 80/20 法则——20% 的核函数占 80% 的时间）。（2）分类瓶颈：采集两组计数器——计算组（SQ_WAVES, SQ_INSTS_VALU, SQ_WAIT_INST_ANY）和缓存组（TCC_HIT, TCC_MISS, TA_FLAT_READ/WRITE_WAVEFRONTS）。计算关键指标：L2 命中率=TCC_HIT/(HIT+MISS)，VALU 利用率=SQ_INSTS_VALU/(SQ_WAVES×理论指令数)，stall 比例=SQ_WAIT/(总 cycles)。如果 stall 高 + L2 miss 高 → 内存瓶颈；如果 VALU 利用率高 + stall 低 → 计算瓶颈；如果 SQ_WAVES 低 → 占用率问题。（3）优化策略：内存瓶颈 → 检查合并（AoS→SoA）、增加 LDS tiling、调整 block 大小提高缓存复用；计算瓶颈 → 降低指令数（用内置函数、减少冗余计算）、使用半精度（__half2）；占用率问题 → 减少每线程寄存器使用、减小 LDS 分配。（4）验证：修改后重新采集计数器，确认关键指标改善。（5）全局优化：rocprof --hsa-trace 检查 CPU-GPU 协作——核函数间隔、传输与计算重叠，使用多 stream 减少 GPU 空闲时间。',
            amdContext: '这道题直接考察你的实战经验。AMD 面试官期望你能说出具体的计数器名称（SQ_WAVES, TCC_HIT 等），而不只是泛泛地说"用 profiler 分析"。能描述完整的分析-优化-验证闭环会大大加分。',
          },
        },
      ],
    },
  ],
  completionChecklist: [
    '能编写完整的 HIP 程序：核函数定义 → 内存分配 → 数据传输 → 启动执行 → 同步回收',
    '理解 Grid/Block/Thread 层次结构及其到 AMD 硬件（GPU/CU/Wavefront）的映射',
    '掌握三种内存分配策略（hipMalloc/hipHostMalloc/hipMallocManaged）的适用场景',
    '理解 Wavefront 执行模型和分支分歧的性能影响，能识别和消除分歧',
    '掌握内存合并访问规则和 AoS→SoA 优化，能解决 LDS bank conflict',
    '能使用 rocprof --stats / -i / --hsa-trace 完成完整的性能分析工作流',
  ],
};
