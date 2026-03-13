// ============================================================
// AMD Linux Driver Learning Platform - Module 8 Micro-Lessons (English)
// Module 8: ROCm User Compute
// 5 lessons in 2 groups, ~15 min each, total ~75 min
// ============================================================
import type { MicroLessonModule } from './micro_lesson_types';

export const module8MicroLessonsEn: MicroLessonModule = {
  moduleId: 'rocm-compute',
  groups: [
    // ════════════════════════════════════════════════════════════
    // Group 8.1: HIP Programming Model
    // ════════════════════════════════════════════════════════════
    {
      id: '8-1',
      number: '8.1',
      title: 'HIP programming model',
      titleEn: 'HIP Programming Model',
      icon: 'Rocket',
      description: 'Learn the core concepts of HIP programming: Grid/Block/Thread hierarchy, writing and launching kernel functions, device memory management, and GPU memory hierarchy and efficient allocation strategies.',
      lessons: [
        // ── Lesson 8.1.1 ──────────────────────────────────────
        {
          id: '8-1-1',
          number: '8.1.1',
          title: 'HIP programming basics: Grid, Block and Thread',
          titleEn: 'HIP Basics: Grid, Block & Thread',
          duration: 15,
          difficulty: 'intermediate',
          tags: ['HIP', 'kernel', 'grid', 'block', 'thread', 'hipLaunchKernelGGL'],
          concept: {
            summary: 'HIP (Heterogeneous-compute Interface for Portability) is AMD\'s GPU programming API, and the syntax is almost the same as CUDA. The HIP program starts large-scale parallel computing on the GPU through the __global__ kernel function (kernel), and the computing tasks are organized into a three-layer hierarchy of Grid → Block → Thread.',
            explanation: [
              'The core idea of ​​GPU programming is SIMT (Single Instruction, Multiple Threads) - using thousands of threads to execute the same piece of code at the same time, but each thread processes different data. HIP is AMD\'s implementation of this model, and its API is almost a mirror of CUDA, which makes migrating from CUDA to HIP very simple (AMD even provides the hipify tool to automatically convert the code).',
              'HIP\'s thread hierarchy is divided into three levels: Thread (thread) is the smallest execution unit, and each thread has a unique threadIdx (index within the block); Block (thread block) is a collection of a group of threads. Threads in the same block can communicate and synchronize (__syncthreads()) through LDS (Local Data Share, shared memory). The block size is usually 64/128/256 threads; Grid (grid) is a collection of all blocks, through blockIdx distinguishes different Blocks. The calculation formula of global thread ID is: globalId = blockIdx.x * blockDim.x + threadIdx.x.',
              'Kernel functions are declared with the __global__ modifier and can only return void. There are two syntaxes for starting the kernel function: hipLaunchKernelGGL(kernel, gridDim, blockDim, sharedMem, stream, args...) is the recommended way of HIP; kernel<<<gridDim, blockDim, sharedMem, stream>>>(args...) is the CUDA compatible syntax. gridDim and blockDim use the dim3 type to specify three-dimensional sizes, but one-dimensional problems usually only use the x component.',
              'Device memory management is fundamental to HIP programming. hipMalloc() allocates memory on GPU VRAM, hipMemcpy() transfers data between CPU and GPU (direction specified by hipMemcpyHostToDevice / hipMemcpyDeviceToHost), and hipFree() frees GPU memory. The whole process is: allocate GPU memory → copy input data to GPU → start kernel function → copy results back to CPU → release GPU memory. hipDeviceSynchronize() is used to wait for all operations on the GPU to complete.',
              'At the bottom level, when you call hipLaunchKernelGGL, the HIP runtime encapsulates the compiled GPU binary code of the kernel function (generated through the LLVM AMDGPU backend) and parameters into an AQL (Architected Queuing Language) package, and writes it to the HSA queue created by KFD. The GPU\'s command processor takes out the AQL package from the queue and allocates the Block to the available Compute Unit (CU) for execution. The number of CUs varies by model (e.g. 32 CUs for RX 7600 XT and 96 CUs for RX 7900 XTX), both of which can theoretically execute thousands of threads simultaneously.',
            ],
            keyPoints: [
              'HIP thread hierarchy: Grid (all Blocks) → Block (thread group sharing LDS) → Thread (minimum execution unit)',
              'Global thread ID = blockIdx.x * blockDim.x + threadIdx.x',
              '__global__ modifies the kernel function, hipLaunchKernelGGL() starts execution',
              'hipMalloc / hipMemcpy / hipFree manage device memory and data transfer',
              'hipDeviceSynchronize() waits for the GPU to complete all tasks',
              'HIP syntax is almost the same as CUDA, and the hipify tool can automatically convert CUDA code',
            ],
          },
          diagram: {
            title: 'HIP Grid/Block/Thread hierarchy',
            content: `HIP thread organization hierarchy

Grid (gridDim = 4×2) inside a Block
┌─────────┬─────────┬─────────┬─────────┐   ┌─────────────────────────────┐
│ Block   │ Block   │ Block   │ Block   │   │  Block (1,0)                │
│ (0,0)   │ (1,0)   │ (2,0)   │ (3,0)   │   │  blockDim = 8×4 = 32 threads│
├─────────┼─────────┼─────────┼─────────┤   │                             │
│ Block   │ Block   │ Block   │ Block   │   │  ┌─┬─┬─┬─┬─┬─┬─┬─┐       │
│ (0,1)   │ (1,1)   │ (2,1)   │ (3,1)   │   │  │0│1│2│3│4│5│6│7│ tid.y=0│
└─────────┴─────────┴─────────┴─────────┘   │  ├─┼─┼─┼─┼─┼─┼─┼─┤       │
                                              │  │0│1│2│3│4│5│6│7│ tid.y=1│
Global ID calculation (1D example): │ ├─┼─┼─┼─┼─┼─┼─┼─┤ │
                                              │  │0│1│2│3│4│5│6│7│ tid.y=2│
gridDim.x = 4 blocks                         │  ├─┼─┼─┼─┼─┼─┼─┼─┤       │
blockDim.x = 256 threads/block                │  │0│1│2│3│4│5│6│7│ tid.y=3│
total threads = 4 × 256 = 1024               │  └─┴─┴─┴─┴─┴─┴─┴─┘       │
                                              │  ↑ threadIdx.x              │
Block 0       Block 1       Block 2           │                             │
[0..255] [256..511] [512..767] ... │ Shared LDS (64KB max) │
│ │ │ │ Can be synchronized with __syncthreads() │
     └──────────────┴─────────────┘            └─────────────────────────────┘
globalIdx = blockIdx.x * blockDim.x + threadIdx.x

Mapping to AMD hardware:
┌─────────────────────────────────────────────────────────┐
│  RX 7600 XT (Navi33, 32 CU)                            │
│                                                          │
│ Block → Assigned to a CU (Compute Unit) │
│ Thread → Executed in units of Wavefront (32/64 threads) │
│ LDS → Local data sharing within CU (64KB/CU) │
│ A CU can run multiple Blocks at the same time (limited by registers/LDS) │
└─────────────────────────────────────────────────────────┘`,
            caption: 'HIP\'s three-level thread hierarchy. Grid contains multiple Blocks, and each Block contains multiple Threads. Blocks are mapped to CU execution, and Threads run on SIMD units with Wavefront granularity.',
          },
          codeWalk: {
            title: 'vector_add.hip — Complete HIP vector addition example',
            file: 'vector_add.hip',
            language: 'cpp',
            code: `#include <hip/hip_runtime.h>
#include <stdio.h>

/*__global__ marks this function as a GPU kernel function
 *Executed in parallel by thousands of threads on GPU */
__global__ void vector_add(const float *a, const float *b,
                           float *c, int n)
{
    /*Each thread calculates its own global index */
    int idx = blockIdx.x * blockDim.x + threadIdx.x;

    /*Bounds check: The total number of threads may exceed the array length */
    if (idx < n) {
        c[idx] = a[idx] + b[idx];
    }
}

int main()
{
    const int N = 1 << 20;  /* 1M elements */
    size_t bytes = N * sizeof(float);

    /*1. Allocate host (CPU) memory */
    float *h_a = (float *)malloc(bytes);
    float *h_b = (float *)malloc(bytes);
    float *h_c = (float *)malloc(bytes);

    for (int i = 0; i < N; i++) {
        h_a[i] = 1.0f;
        h_b[i] = 2.0f;
    }

    /*2. Allocate device (GPU) memory */
    float *d_a, *d_b, *d_c;
    hipMalloc(&d_a, bytes);
    hipMalloc(&d_b, bytes);
    hipMalloc(&d_c, bytes);

    /*3. Copy input data from CPU to GPU */
    hipMemcpy(d_a, h_a, bytes, hipMemcpyHostToDevice);
    hipMemcpy(d_b, h_b, bytes, hipMemcpyHostToDevice);

    /*4. Start the kernel function
     *256 threads per block
     *Grid size = ceil(N / 256) Blocks */
    int blockSize = 256;
    int gridSize = (N + blockSize - 1) / blockSize;

    hipLaunchKernelGGL(vector_add,
                       dim3(gridSize),   /*Grid Dimension*/
                       dim3(blockSize),  /*Block dimension*/
                       0,                /*Dynamic shared memory size*/
                       0,                /*HIP stream (0=default)*/
                       d_a, d_b, d_c, N);

    /*5. Wait for GPU to complete */
    hipDeviceSynchronize();

    /*6. Copy the results from GPU back to CPU */
    hipMemcpy(h_c, d_c, bytes, hipMemcpyDeviceToHost);

    /*7. Verification results */
    for (int i = 0; i < N; i++) {
        if (h_c[i] != 3.0f) {
            printf("Error at index %d: %f != 3.0\\n", i, h_c[i]);
            return 1;
        }
    }
    printf("PASSED: %d elements computed correctly\\n", N);

    /*8. Release memory */
    hipFree(d_a); hipFree(d_b); hipFree(d_c);
    free(h_a); free(h_b); free(h_c);
    return 0;
}
/*Compile: hipcc vector_add.hip -o vector_add
 *Run: ./vector_add
 *Output: PASSED: 1048576 elements computed correctly */`,
            annotations: [
              'The __global__ modifier tells the compiler that this function is executed on the GPU and called from the CPU side',
              'blockIdx.x * blockDim.x + threadIdx.x is the most basic global index calculation - almost every kernel starts with this',
              'if (idx < n) bounds checking is essential: gridSize * blockSize is usually larger than the actual amount of data',
              'hipMalloc allocates memory on GPU VRAM and the returned pointer can only be dereferenced in GPU code',
              'hipMemcpy is a synchronous operation - it blocks the CPU until the transfer is completed and is one of the performance bottlenecks',
              'hipLaunchKernelGGL is asynchronous - the CPU does not wait for the GPU to finish before continuing to the next statement',
              'hipDeviceSynchronize waits for all operations on the GPU to complete, and the results cannot be read until then',
            ],
            explanation: 'This vector_add program shows the complete pattern of HIP programming: allocate → copy → start → synchronize → copyback → release. Although the GPU is not faster than the CPU for simple vector addition (the data transmission overhead is too large), when the computational intensity increases (such as matrix multiplication, neural network reasoning), the massive parallel advantages of the GPU will become apparent. Under the hood, hipcc calls the LLVM AMDGPU backend to compile __global__ functions to the GPU ISA (GFX11 instruction set), and hipLaunchKernelGGL writes AQL packets to the KFD queue via the HSA runtime.',
          },
          miniLab: {
            title: 'Compile and run your first HIP program',
            objective: 'Compile and run vector_add.hip on RX 7600 XT to measure the performance impact of different block sizes.',
            setup: `#Install ROCm if not already installed
#Reference https://rocm.docs.amd.com/en/latest/deploy/linux/installer/install.html
sudo apt install rocm-hip-sdk

#Verify HIP environment
hipcc --version
hipconfig --full`,
            steps: [
              'Save the above vector_add.hip to a file and compile it with hipcc vector_add.hip -o vector_add',
              'Run ./vector_add to verify the output is PASSED',
              'Modify N to 1<<24 (16M elements), recompile and run, and observe whether it is still correct',
              'Use blockSize = 64, 128, 256, 512 to test respectively, and add hipEventRecord timing before and after the kernel function.',
              'Run rocm-smi to observe GPU load and frequency changes',
              'Change hipMemcpy to hipMemcpyAsync and use stream to see if there is a performance improvement',
            ],
            expectedOutput: `$ hipcc vector_add.hip -o vector_add && ./vector_add
PASSED: 1048576 elements computed correctly

$ rocm-smi
========================= ROCm SMI ==========================
GPU  Temp   AvgPwr  SCLK    MCLK     Fan   Perf  ...
0    45c    25.0W   2100Mhz 2000Mhz  0%    auto  ...`,
            hint: 'If hipcc cannot be found, confirm that the bin directory of ROCm is in PATH: export PATH=$PATH:/opt/rocm/bin. If you get a "no device" error when running, check whether /dev/kfd exists and whether the current user is in the video and render groups.',
          },
          debugExercise: {
            title: 'Find out-of-bounds accesses in HIP kernel functions',
            language: 'cpp',
            description: 'The following HIP kernel function has a common bug that causes out-of-bounds memory accesses and unpredictable results.',
            question: 'What\'s wrong with this code? Under what conditions does an error occur?',
            buggyCode: `__global__ void scale_array(float *data, float factor, int n)
{
    int idx = blockIdx.x * blockDim.x + threadIdx.x;
    /*BUG: Missing bounds check! */
    data[idx] = data[idx] * factor;
}

int main()
{
    int N = 1000;
    int blockSize = 256;
    int gridSize = (N + blockSize - 1) / blockSize;  /* = 4 */
    /* 4 blocks × 256 threads = 1024 threads
     *But the array only has 1000 elements! */

    float *d_data;
    hipMalloc(&d_data, N * sizeof(float));
    hipLaunchKernelGGL(scale_array, dim3(gridSize),
                       dim3(blockSize), 0, 0, d_data, 2.0f, N);
}`,
            hint: 'gridSize * blockSize = 1024, but the array only has 1000 elements. What will threads 1000-1023 access?',
            answer: 'Error: Missing bounds check. gridSize = ceil(1000/256) = 4, total threads = 4×256 = 1024, but the array only has 1000 elements. Threads idx=1000 to idx=1023 will access data[1000]..data[1023] out of bounds, which is unallocated GPU memory. Consequences: (1) Read garbage data; (2) Write to memory areas allocated by other GPUs (data corruption); (3) May trigger GPU page fault (see "GPU fault detected: vmid:X" in dmesg). Repair method: add if (idx < n) return; at the beginning of the kernel function or wrap the operation in if (idx < n) { ... }. This is the most common bug in HIP/CUDA programming - almost every kernel function requires bounds checking. AMD\'s rocm-gdb debugger and ASAN for GPU can help detect such issues.',
          },
          interviewQ: {
            question: 'Describe HIP\'s thread hierarchy (Grid/Block/Thread) and how it maps to AMD GPU hardware.',
            difficulty: 'medium',
            hint: 'From software abstraction (Grid→Block→Thread) to hardware mapping (GPU→CU→Wavefront), explain how Block is scheduled to CU and how Thread composes Wavefront.',
            answer: 'HIP thread hierarchy: Grid is the top level, containing all threads to be executed, and the dimensions are defined by gridDim (up to 3D); Block (thread block) is the basic unit of scheduling, and the size is defined by blockDim (usually 64-1024 threads). Threads in the same Block share LDS and can be synchronized through __syncthreads(); Thread is the smallest execution unit, and the location within the block is identified by threadIdx. Hardware mapping: Grid corresponds to the entire GPU (such as RX 7600 XT\'s 32 CU), and Block is scheduled to a Compute Unit (CU) - once allocated, it will not be migrated to other CUs. Threads within a Block are divided into Wavefronts (AMD terminology, equivalent to NVIDIA\'s Warp) - the RDNA architecture supports 32 threads/wavefront (Wave32) or 64 threads/wavefront (Wave64). A CU can accommodate multiple Blocks at the same time, which is limited by the total size of the register file and LDS. The GPU hardware scheduler (SPI) is responsible for allocating blocks to CUs with sufficient resources. When all CUs are occupied, the remaining blocks are queued.',
            amdContext: 'Basic questions that must be asked in AMD interviews. The key differentiators are AMD\'s use of Wavefront (32/64) instead of NVIDIA\'s Warp (32), and the impact RDNA\'s Wave32 mode has on branch performance.',
          },
        },

        // ── Lesson 8.1.2 ──────────────────────────────────────
        {
          id: '8-1-2',
          number: '8.1.2',
          title: 'GPU memory hierarchy and allocation strategy',
          titleEn: 'GPU Memory Hierarchy & Allocation Strategies',
          duration: 15,
          difficulty: 'intermediate',
          tags: ['memory-hierarchy', 'VRAM', 'LDS', 'hipMalloc', 'pinned-memory', 'streams'],
          concept: {
            summary: 'GPUs have deep memory hierarchies—from the fastest registers to the slowest system memory—with latency and bandwidth varying by dozens of times at each layer. Understanding this hierarchy and choosing the correct memory allocation strategy (hipMalloc vs hipHostMalloc vs hipMallocManaged) is the key to writing high-performance HIP programs.',
            explanation: [
              'The memory hierarchy of the GPU from fast to slow is: (1) Registers: private to each thread and the fastest storage. (2) LDS (Local Data Share): shared within a block/workgroup and far faster than external memory. (3) Cache hierarchy: per-CU caches plus larger GPU-shared cache levels reduce pressure on external memory. (4) VRAM: the GPU\'s local high-bandwidth memory; for the RX 7600 XT example, AMD lists 16GB of GDDR6 at roughly 288 GB/s board memory bandwidth. (5) System RAM: host memory reached over the PCIe link, which is much slower than on-board VRAM and depends on the actual PCIe generation and lane width of the platform.',
              'Choosing the correct HIP memory allocation function is crucial: hipMalloc() allocates memory on the GPU VRAM, which is the most common way, with the fastest GPU access but not direct access by the CPU; hipHostMalloc() allocates pinned (page-locked) memory on the CPU side, which can be simultaneously directly accessed by the GPU over PCIe through the hipHostMallocMapped flag - this avoids explicit hipMemcpy, but GPU access speed is limited by PCIe Bandwidth limitation; hipMallocManaged() allocates a unified virtual address (Managed Memory). The CPU and GPU can access it with the same pointer. Data is automatically migrated between CPU/GPU during runtime (through page fault). Development is simple but the performance may not be as good as manual management.',
              'Pinned memory (page-locked memory) is critical for DMA transfers. The memory allocated by ordinary malloc may be swapped to disk by the operating system, and the GPU\'s DMA engine cannot directly access this memory. The memory allocated by hipHostMalloc is locked in physical RAM (mlock), and the DMA engine can transfer directly on PCIe, avoiding a memory copy by the operating system. That\'s why hipMemcpy is 2-3 times faster than normal memory when using pinned memory.',
              'HIP Stream is the core mechanism for overlapping asynchronous execution and data transmission. A Stream represents an ordered sequence of operations (copy/kernel function), and operations between different Streams can be executed in parallel. Typical double buffering mode: When Stream 0 executes the kernel function of the current batch, Stream 1 simultaneously transmits the next batch of data. hipMemcpyAsync() initiates asynchronous data transfer (requires pinned memory), and hipStreamCreate/hipStreamSynchronize manages the life cycle of Stream. Under the hood, each Stream corresponds to an HSA queue created by KFD.',
            ],
            keyPoints: [
              'Memory level: Register (~1cy) > LDS (~10cy) > L1 > L2 (32MB) > VRAM (288GB/s) > System (32GB/s)',
              'hipMalloc → GPU VRAM, GPU fast access, CPU not directly accessible',
              'hipHostMalloc → CPU pinned memory, which can be accessed by the GPU through PCIe, and has the highest DMA transfer efficiency',
              'hipMallocManaged → unified virtual address, automatic migration, convenient but high performance overhead',
              'Pinned memory is essential for asynchronous transfers - non-pinned hipMemcpyAsync will degenerate into synchronous operations',
              'HIP Stream implements overlapping calculation and transmission, typically increasing throughput by 30-50%',
            ],
          },
          diagram: {
            title: 'GPU memory hierarchy and latency comparison',
            content: `AMD RDNA3 GPU memory hierarchy (RX 7600 XT / Navi33)

Delay Bandwidth Size Scope
                    ────          ────           ────      ──────
┌─────────┐
│ Register│ ~1 cycle ~Unlimited (within CU) 192KB/CU Thread private
│ (VGPR) │ Fastest (Vector Register)
└────┬────┘
     │
┌────▼────┐
│ LDS │ ~4-10 cy ~3.3 TB/s (within CU) 64KB/CU Block Sharing
│(Shared) │ = CUDA shared memory programmable management
└────┬────┘
     │
┌────▼────┐
│ L1 Cache│ ~20 cy ~1.5 TB/s 32KB/CU CU Private
│ │ Automatically cache global memory access (hardware management)
└────┬────┘
     │
┌────▼────┐
│ L2 Cache│ ~100 cy ~800 GB/s 32MB Full GPU Shared
│ (RDNA3) │    ←RDNA3 big L2 is performance critical! (big cache!)
└────┬────┘
     │
┌────▼────┐
│ VRAM │ ~300 cy ~288 GB/s 16GB GPU Global
│ (GDDR6) │ hipMalloc allocated here GDDR6
└────┬────┘
     │  PCIe link (platform dependent)  ←Transmission bottleneck!
┌────▼────┐
│ System │ ~1000+ cy host DRAM over PCIe CPU Global
│  RAM    │    hipHostMalloc (pinned)          DDR5
└─────────┘

Memory allocation strategy selection:
┌──────────────────┬─────────────────────┬──────────────┐
│ hipMalloc │ GPU VRAM allocation │ GPU compute data │
│ hipHostMalloc │ CPU pinned allocation │ DMA transfer buffer │
│ hipMallocManaged │ Unified address (automatic migration) │ Prototype development │
└──────────────────┴─────────────────────┴──────────────┘`,
            caption: 'The GPU memory hierarchy spans 3 orders of magnitude in latency from registers to system memory. PCIe bandwidth is the main bottleneck for CPU-GPU data transfer, which is why reducing data transfer is the first principle of GPU performance optimization.',
          },
          codeWalk: {
            title: 'Matrix multiplication + LDS Tiling optimization',
            file: 'matmul_tiled.hip',
            language: 'cpp',
            code: `#include <hip/hip_runtime.h>

#define TILE_SIZE 16

/*Matrix multiplication using LDS tiling
 * C[M×N] = A[M×K] × B[K×N]
 *Each Block calculates a TILE_SIZE×TILE_SIZE submatrix of C */
__global__ void matmul_tiled(const float *A, const float *B,
                              float *C, int M, int N, int K)
{
    /*Two tiles are allocated in LDS for caching sub-blocks of A and B */
    __shared__ float tileA[TILE_SIZE][TILE_SIZE];
    __shared__ float tileB[TILE_SIZE][TILE_SIZE];

    int row = blockIdx.y * TILE_SIZE + threadIdx.y;
    int col = blockIdx.x * TILE_SIZE + threadIdx.x;
    float sum = 0.0f;

    /*Load tiles in sections along K dimensions */
    for (int t = 0; t < (K + TILE_SIZE - 1) / TILE_SIZE; t++) {
        /*Cooperative loading: Each thread in the Block is responsible for loading an element into LDS */
        int aCol = t * TILE_SIZE + threadIdx.x;
        int bRow = t * TILE_SIZE + threadIdx.y;

        tileA[threadIdx.y][threadIdx.x] =
            (row < M && aCol < K) ? A[row * K + aCol] : 0.0f;
        tileB[threadIdx.y][threadIdx.x] =
            (bRow < K && col < N) ? B[bRow * N + col] : 0.0f;

        /*Make sure the tile is fully loaded before calculating */
        __syncthreads();

        /*Read data from LDS and do multiply and add - 30 times faster than from VRAM */
        for (int k = 0; k < TILE_SIZE; k++) {
            sum += tileA[threadIdx.y][k] * tileB[k][threadIdx.x];
        }

        __syncthreads();
    }

    if (row < M && col < N) {
        C[row * N + col] = sum;
    }
}

/*start up:
 * dim3 grid((N+15)/16, (M+15)/16);
 * dim3 block(16, 16);  // 256 threads per block
 * hipLaunchKernelGGL(matmul_tiled, grid, block,
 *                    0, 0, d_A, d_B, d_C, M, N, K); */`,
            annotations: [
              '__shared__ allocates memory in LDS - access latency is only ~10 cycles compared to ~300 cycles for global memory',
              'TILE_SIZE=16 → Each tile 16×16=256 float = 1KB, two tiles total 2KB, far less than the 64KB LDS limit',
              '__syncthreads() is a Block-level barrier - ensuring that all threads complete LDS writing before starting to read',
              'Bounds checking (row<M && aCol<K) handles cases where matrix dimensions are not multiples of TILE_SIZE',
              'Each thread loads 2 elements from VRAM, but reads from LDS 2×16 = 32 times in the inner loop - data reuse ratio 16:1',
              'VRAM access for version without tiling = 2MNK, version with tiling = 2MNK/TILE_SIZE, 16 times less',
            ],
            explanation: 'LDS tiling is a classic technique for GPU matrix multiplication optimization. The core idea is to let the threads within the Block cooperate to load the small blocks of A and B from VRAM to LDS, and then perform the actual multiply-accumulate operations from LDS (30 times faster). When TILE_SIZE=16, each tile is 2KB, and the total LDS usage is 4KB, which is far less than the CU limit of 64KB, so each CU can accommodate multiple blocks to be executed simultaneously. In actual production, larger tiles (such as 32×32) and more complex register tiling will be used to further improve performance.',
          },
          miniLab: {
            title: 'Compare the transmission performance of different memory allocation strategies',
            objective: 'Use hipMalloc+hipMemcpy, hipHostMalloc, hipMallocManaged to transmit 256MB data respectively, and measure the CPU→GPU transmission bandwidth.',
            steps: [
              'Write a test program: allocate 256MB float array (64M elements)',
              'Solution 1: malloc + hipMalloc + hipMemcpy(H2D), use hipEventElapsedTime for timing',
              'Solution 2: hipHostMalloc(flagDefault) + hipMalloc + hipMemcpy(H2D)',
              'Solution 3: hipMallocManaged, access directly in the kernel function (trigger automatic migration), measure the first execution time of the kernel function',
              'Calculate effective bandwidth (GB/s) for each option and compare to the theoretical bandwidth of your actual PCIe link',
              'Based on solution 2, use hipMemcpyAsync + dual Stream to achieve overlapping calculation and transmission',
            ],
            expectedOutput: `Expected results (example platform):
Option 1 (plain malloc):  lower than pinned memory due to staging overhead
Option 2 (pinned):        closer to your platform's PCIe bandwidth limit
Option 3 (managed):       first run is usually slower because migration/page faults are expensive
Dual Stream overlap: throughput increased by 30-40%`,
            hint: 'Timing with hipEventCreate/Record/ElapsedTime is more accurate than clock() because it measures GPU-side time. The performance of hipMallocManaged is very dependent on the access pattern - if the CPU and GPU access the same page alternately, performance will severely degrade (ping-pong migration).',
          },
          debugExercise: {
            title: 'Find errors in asynchronous transfers',
            language: 'cpp',
            description: 'The following code attempts to use hipMemcpyAsync to implement asynchronous data transfer, but the resulting data is all zeros.',
            question: 'Why is the data received by the GPU side all zero? What are the prerequisites for asynchronous transmission?',
            buggyCode: `float *h_data = (float *)malloc(N * sizeof(float));  /* BUG! */
float *d_data;
hipMalloc(&d_data, N * sizeof(float));

for (int i = 0; i < N; i++) h_data[i] = 1.0f;

hipStream_t stream;
hipStreamCreate(&stream);

/*Asynchronous transmission */
hipMemcpyAsync(d_data, h_data, N * sizeof(float),
               hipMemcpyHostToDevice, stream);

/*Start kernel function */
hipLaunchKernelGGL(my_kernel, grid, block, 0, stream,
                   d_data, N);

hipStreamSynchronize(stream);
/*Result: The data in d_data are all zeros or garbage! */`,
            hint: 'hipMemcpyAsync has special requirements for host-side memory. Can memory allocated by ordinary malloc be used for asynchronous transmission?',
            answer: 'Error: using plain malloc allocated memory for hipMemcpyAsync. Asynchronous transmission requires that the host-side memory must be pinned (page-locked) memory, allocated through hipHostMalloc. Reason: hipMemcpyAsync hands over the transfer task to the GPU\'s DMA engine (SDMA), which directly accesses the memory through physical addresses. The memory of ordinary malloc may be swapped out to disk by the OS, and the physical address may change during the transfer process. When the HIP runtime detects that the host memory is not pinned, hipMemcpyAsync will degenerate into a synchronous operation (first copy to the internal staging buffer), but the timing of this process may cause the kernel function to be executed before the data arrives. Fix: Change malloc to hipHostMalloc(&h_data, N * sizeof(float), hipHostMallocDefault). Lesson: async API does not equal async behavior - prerequisites must be met for truly asynchronous execution.',
          },
          interviewQ: {
            question: 'Describes the GPU memory hierarchy and how to choose between hipMalloc, hipHostMalloc, and hipMallocManaged.',
            difficulty: 'medium',
            hint: 'Describe each layer of memory in terms of latency/bandwidth/size/scope, and then recommend allocation strategies based on usage scenarios.',
            answer: 'GPU memory hierarchy (from fast to slow): (1) Register: thread private, ~1 cycle, compiler automatically allocates local variables; (2) LDS/Shared Memory: Block shared, ~10 cycles, 64KB/CU, __shared__ explicit management, used for inter-thread data reuse (such as tiled matmul); (3) L1 Cache: CU private, ~20 cycles, hardware automatic caching; (4) L2 Cache: full GPU Shared, ~100 cycles, 32MB on RDNA3, is a buffer for global memory access; (5) VRAM: ~300 cycles, GPU local memory; (6) System RAM: ~1000+ cycles, accessed through PCIe. Allocation strategy selection: hipMalloc allocates VRAM - suitable for GPU-intensive computing data, the fastest access, is the default choice; hipHostMalloc allocates pinned host memory - suitable for DMA transfer buffers and small data frequently exchanged by CPU-GPU, hipHostMallocMapped can also be used to enable GPU zero-copy access through PCIe; hipMallocManaged allocates unified address space memory - suitable for rapid prototyping or scenarios with irregular data access patterns, and runs through page faults Automatic migration, but with migration delay overhead. The combination of hipMalloc + hipHostMalloc is recommended in production code, and stream is used to implement overlapping transmission and calculation.',
            amdContext: 'This question tests your overall understanding of the GPU memory system. Special mention was made during the interview of RDNA3\'s large L2 (32MB), which is one of AMD\'s design differences over NVIDIA.',
          },
        },
      ],
    },

    // ════════════════════════════════════════════════════════════
    // Group 8.2: Performance optimization
    // ════════════════════════════════════════════════════════════
    {
      id: '8-2',
      number: '8.2',
      title: 'Performance optimization',
      titleEn: 'Performance Optimization',
      icon: 'Zap',
      description: 'Gain a deep understanding of AMD GPU\'s Wavefront execution model, memory coalesced access rules, and LDS optimization techniques, and master the rocprof performance analysis tool.',
      lessons: [
        // ── Lesson 8.2.1 ──────────────────────────────────────
        {
          id: '8-2-1',
          number: '8.2.1',
          title: 'Wavefront execution model differs from branching',
          titleEn: 'Wavefront Execution Model & Branch Divergence',
          duration: 15,
          difficulty: 'advanced',
          tags: ['wavefront', 'SIMT', 'divergence', 'occupancy', 'RDNA'],
          concept: {
            summary: 'AMD GPUs use Wavefront as the minimum execution granularity - 32 (Wave32) or 64 (Wave64) threads in a Wavefront execute the same instructions in lock-step on the same SIMD unit. When if/else causes threads in Wavefront to take different branches, both branches must be executed (branch divergence), seriously affecting performance.',
            explanation: [
              'SIMT (Single Instruction, Multiple Threads) is the basic execution model of GPU. In AMD terminology, Wavefront is a synchronized execution group of a set of threads on a hardware SIMD unit. The RDNA architecture introduces dual modes: Wave32 (32 threads/wavefront) and Wave64 (64 threads/wavefront). Wave32 is the default mode of RDNA. Each SIMD unit has 32 lanes, and one instruction processes the data of 32 threads in one cycle. In Wave64 mode, the same instruction requires two cycles to complete, but it reduces scheduling overhead and is suitable for calculations with high delay tolerance.',
              'Branch divergence is a core performance trap of the SIMT model. When the threads in Wavefront execute if-else, if some threads take the if branch and the rest take the else branch, the GPU\'s processing method is: first execute the if branch (the else thread is masked), and then execute the else branch (the if thread is masked). This means that the execution time of Wavefront is the sum of the two branches, not the time of the longer branch. In the worst case (each thread takes a different branch), SIMD efficiency drops to 1/32 (Wave32) or 1/64 (Wave64).',
              'AMD\'s RDNA architecture uses the EXEC mask register to control branch execution. EXEC is a 32-bit (Wave32) or 64-bit (Wave64) bitmask, each bit corresponding to a lane. When instructions such as v_cmp_gt_f32 (floating point comparison) are executed, the result is written to the VCC (Vector Condition Code) register, and then the EXEC mask is updated through scalar instructions such as s_and_b32. Although the masked lane has no actual effect (writes are suppressed), it still consumes execution cycles. For simple conditional assignments, the compiler uses the v_cndmask instruction (predication) instead of branching - this does not cause divergence because all lanes execute the same instruction.',
              'Occupancy measures the ratio of the number of active Wavefronts on a CU to the maximum possible value. Each CU has limited resources: RDNA3 has a maximum of 16 Wave32 (or 8 Wave64) per CU, which is limited by VGPR (192KB/CU, each Wave32 has a maximum of 256 VGPR × 32 lane × 4 bytes = 32KB), LDS (64KB/CU, shared between blocks) and the upper limit of the number of blocks. The higher the occupancy, the more the GPU can hide memory latency by switching Wavefront. Use rocm_agent_enumerator and hipOccupancyMaxPotentialBlockSize to calculate the optimal block size for a given kernel function.',
            ],
            keyPoints: [
              'Wavefront = SIMD execution group: Wave32 (RDNA default, 32 threads/cycle) or Wave64 (64 threads/2 cycle)',
              'Branch divergence causes Wavefront to execute all branch paths serially, and the EXEC mask controls which lanes are active',
              'Use v_cndmask (predication) for simple conditions without divergence, and use s_cbranch for complex branches with divergence.',
              'Occupancy = Active Wavefront / Maximum Wavefront, limited by the number of VGPR, LDS, and Blocks',
              'High occupancy helps hide latency, but higher is not always better - register pressure also matters',
              'Use built-in functions such as __builtin_amdgcn_wave_reduce_add to implement Wavefront-level communication',
            ],
          },
          diagram: {
            title: 'Wavefront branch divergence execution process',
            content: `Wavefront branch divergence indication (Wave32, 32 lanes)

Code: if (threadIdx.x < 16) { A(); } else { B(); }

Step 1: All 32 lanes reach the if statement
EXEC mask: 1111 1111 1111 1111 1111 1111 1111 1111
↓ Compare

Step 2: Execute branch A() (the first 16 lanes are active)
EXEC mask: 0000 0000 0000 0000 1111 1111 1111 1111
lane 31..16 is masked by lane 15..0 and executes A()
(No result written) (Normal execution)
⏱️ Time consuming! ⏱️ Execute A

Step 3: Execute B() branch (the last 16 lanes are active)
EXEC mask: 1111 1111 1111 1111 0000 0000 0000 0000
lane 31..16 executes B() lane 15..0 is masked
⏱️Execute B (do not write the result)

Step 4: Merge branches and restore complete EXEC mask
EXEC mask: 1111 1111 1111 1111 1111 1111 1111 1111
All lanes are back active

Total time = Time(A) + Time(B) ←Instead of max(A, B)!

Comparison: No disagreement situation
if (blockIdx.x < gridDim.x / 2) { A(); } else { B(); }
→ All threads in the same Block take the same branch → No divergence → Time consumption = max(A,B)

Predication optimization (automatically generated by the compiler):
//Source code: x = (cond) ? a : b;
//Compiles to:
v_cmp_gt_f32  vcc, v0, v1       //Compare, result to VCC
v_cndmask_b32 v2, v4, v3, vcc   //Select value based on VCC
//No branches, no divergences, 1 instruction complete!`,
            caption: 'Branch divergence causes Wavefront to execute two paths serially. Key optimization: Let threads in Wavefront take the same branch, or use prediction instead of branch.',
          },
          codeWalk: {
            title: 'Performance comparison of divergent vs non-divergent kernel functions',
            file: 'divergence_test.hip',
            language: 'cpp',
            code: `#include <hip/hip_runtime.h>

/*Kernel function with branch divergence
 *Odd and even threads in Wavefront take different paths */
__global__ void divergent_kernel(float *out, const float *in, int n)
{
    int idx = blockIdx.x * blockDim.x + threadIdx.x;
    if (idx >= n) return;

    /*threadIdx.x is contiguous within Wavefront
     *Odd and even threads alternate → each Wavefront diverges! */
    if (threadIdx.x % 2 == 0) {
        out[idx] = sinf(in[idx]) * cosf(in[idx]);
        out[idx] += sqrtf(fabsf(in[idx]));
    } else {
        out[idx] = expf(in[idx]) * logf(fabsf(in[idx]) + 1.0f);
        out[idx] += rsqrtf(fabsf(in[idx]) + 1.0f);
    }
}

/*Kernel function without branch divergence
 *All threads in the same Wavefront take the same path */
__global__ void nondivergent_kernel(float *out, const float *in,
                                     int n)
{
    int idx = blockIdx.x * blockDim.x + threadIdx.x;
    if (idx >= n) return;

    /*Branch with blockIdx.x instead of threadIdx.x
     *Threads in the same Block take the same path → no divergence */
    if (blockIdx.x % 2 == 0) {
        out[idx] = sinf(in[idx]) * cosf(in[idx]);
        out[idx] += sqrtf(fabsf(in[idx]));
    } else {
        out[idx] = expf(in[idx]) * logf(fabsf(in[idx]) + 1.0f);
        out[idx] += rsqrtf(fabsf(in[idx]) + 1.0f);
    }
}

/*Use predication (no branch) kernel function */
__global__ void predicated_kernel(float *out, const float *in,
                                   int n)
{
    int idx = blockIdx.x * blockDim.x + threadIdx.x;
    if (idx >= n) return;

    float val = in[idx];
    float r1 = sinf(val) * cosf(val) + sqrtf(fabsf(val));
    float r2 = expf(val) * logf(fabsf(val) + 1.0f)
               + rsqrtf(fabsf(val) + 1.0f);

    /*The ternary operator usually compiles to v_cndmask → no divergence */
    out[idx] = (threadIdx.x % 2 == 0) ? r1 : r2;
}

/*Compile: hipcc -O2 divergence_test.hip -o divergence_test
 *Expectation: divergent is ~40-80% slower than nondivergent */`,
            annotations: [
              'threadIdx.x % 2 alternates 0/1 within Wavefront → ensures that each Wavefront is different',
              'blockIdx.x % 2 allows the entire Block to take the same branch → there is no internal divergence in Wavefront',
              'The divergent version needs to perform two sets of calculations, sinf+cosf+sqrtf and expf+logf+rsqrtf, while the non-divergent version only performs one of them.',
              'Both prediction versions are calculated, but v_cndmask is used to select the result - no branch overhead, suitable for situations where the workload of the two paths is close.',
              'At -O2 optimization level, the compiler will try to automatically convert simple branches to prediction',
              'Transcendental functions such as sinf/expf are executed by SFU (Special Function Unit) on RDNA3, with higher latency',
            ],
            explanation: 'These three kernel functions demonstrate the performance impact and optimization strategies of branch divergence. Half of the threads in each Wavefront in divergent_kernel are idle; nondivergent_kernel eliminates differences by increasing the branch granularity to Block level; predicated_kernel calculates two results and then selects, avoiding branches. In actual development, priority should be given to reorganizing data or algorithms so that threads within Wavefront follow the same path, followed by prediction.',
          },
          miniLab: {
            title: 'Measuring the performance cost of branch divergence',
            objective: 'Compile and run the three kernel functions above, use hipEvent to measure the time-consuming difference, and use rocprof to observe SIMD utilization.',
            steps: [
              'Compile divergence_test.hip: hipcc -O2 divergence_test.hip -o divergence_test',
              'Run three kernel functions for N=16M, repeat each 100 times, average, and use hipEvent to time',
              'Record the execution time and relative difference of the three',
              'Use rocprof --stats ./divergence_test to view the time-consuming statistics at the kernel function level',
              'Use rocprof -i counters.txt ./divergence_test to collect SQ_WAVES and SQ_INSTS_VALU counters',
              'Calculate the average number of VALU instructions per Wavefront, comparing divergent and non-divergent versions',
            ],
            expectedOutput: `Expected results (N=16M, RX 7600 XT):
divergent_kernel:    ~2.8 ms  (100%)
nondivergent_kernel: ~1.6 ms (~57%, 43% faster)
predicated_kernel:   ~2.2 ms  (~79%)

SQ_INSTS_VALU (per wavefront):
divergent: ~48 instructions (two paths executed)
nondivergent: ~28 instructions (only execute one path)`,
            hint: 'Create counters.txt with the content "pmc: SQ_WAVES SQ_INSTS_VALU SQ_INSTS_SALU" and then run rocprof -i counters.txt ./divergence_test. If rocprof reports an error, make sure ROCm has the rocprofiler component installed.',
          },
          debugExercise: {
            title: 'Identify hidden branch divergences',
            language: 'cpp',
            description: 'The following kernel function looks like it has no if-else, but actually has serious branch divergence.',
            question: 'Where do the branches diverge in this code? Why is it not easy to find?',
            buggyCode: `__global__ void hidden_divergence(float *out, const float *in,
                                  int n)
{
    int idx = blockIdx.x * blockDim.x + threadIdx.x;
    if (idx >= n) return;

    float val = in[idx];

    /*It looks like there is no if-else, but... */
    for (int i = 0; i < (int)val; i++) {  /*BUG: The number of loops depends on the data!*/
        val = sqrtf(val);
    }

    out[idx] = val;
}
/*if in[] = {1.0, 100.0, 2.0, 50.0, ...}
 *The number of loops in different threads varies greatly! */`,
            hint: 'A loop is also a branch - it jumps out when the loop condition is not met and continues when it is. What happens if threads within Wavefront have different loop counts?',
            answer: 'The divergence is in the for loop. The essence of a loop is "if (condition) goto loop_body; else goto loop_exit;" - checking the condition at the end of each iteration is a branch decision. When different threads within Wavefront have different loop times (because val is different), the thread that ends first must wait for the slowest thread to complete all iterations. If the value range of in[] is very large (such as 1 to 100), the execution time of the entire Wavefront depends on the number of cycles of the maximum value thread, and other threads idle waiting. This "hidden divergence" is harder to spot than an explicit if-else because there are no conditional branches on the surface of the code. Repair strategy: (1) Preprocess the data to make the value range within the same Wavefront close (process after sorting); (2) Set a limit on the maximum number of iterations; (3) Replace iterations with analytical formulas (such as val = pow(val, 1.0/pow(2,n))). This is one of the most insidious performance killers in GPU programming.',
          },
          interviewQ: {
            question: 'Explains the Wavefront execution model for AMD GPUs, the difference between Wave32 and Wave64, and how branch divergence affects performance.',
            difficulty: 'hard',
            hint: 'Starting from the SIMT model, we explain the EXEC mask mechanism, compare the advantages and disadvantages of Wave32/64, and give practical strategies to avoid differences.',
            answer: 'AMD GPUs use the SIMT model, with Wavefront as the minimum scheduling and execution unit. The RDNA architecture supports two modes: Wave32 (32 threads/wavefront, processed in one SIMD cycle) and Wave64 (64 threads, requiring 2 cycles but with half the scheduling overhead). Advantages of Wave32: smaller impact of branch divergence (worst 1/32 vs 1/64 efficiency), lower latency (one instruction can be issued before the next one is processed); Advantages of Wave64: lower scheduling overhead (less wavefronts managed per CU), more beneficial to memory-intensive tasks with high latency tolerance. Branch divergence mechanism: When if-else causes threads in Wavefront to take different paths, the GPU uses the EXEC register (32/64-bit mask) to mask the execution of the two paths in sequence, and the total time = Time(if) + Time(else). The EXEC mask is set by the scalar comparison instruction (s_cmp) and the vector comparison instruction (v_cmp), and the VCC register holds the comparison result. Strategies to avoid divergence: (1) Align branch granularity to Wavefront size (use blockIdx instead of threadIdx branch); (2) Order data so that adjacent threads process similar data; (3) Use predication (v_cndmask) instead of branches; (4) Split different workloads into different kernel functions.',
            amdContext: 'Wave32/Wave64 is AMD\'s unique interview test site. NVIDIA is stuck with 32 threads/warp, while AMD\'s flexibility means developers need to choose the mode (hipcc -mwavefrontsize64 or default Wave32) based on workload characteristics.',
          },
        },

        // ── Lesson 8.2.2 ──────────────────────────────────────
        {
          id: '8-2-2',
          number: '8.2.2',
          title: 'Memory merge access and LDS optimization',
          titleEn: 'Memory Coalescing & LDS Optimization',
          duration: 15,
          difficulty: 'advanced',
          tags: ['coalescing', 'memory-access', 'LDS', 'bank-conflict', 'AoS-SoA'],
          concept: {
            summary: 'GPU global memory (VRAM) access performance relies heavily on access patterns - coalesced access to contiguous addresses can achieve near-peak bandwidth, while performance for random or strided access can drop by more than 10x. LDS also has bank conflict problems. Mastering memory merging rules and LDS optimization are core to GPU performance tuning.',
            explanation: [
              'Global memory coalescing is the core optimization mechanism of the GPU memory system. When the addresses accessed by threads in Wavefront are contiguous and aligned, the GPU can coalesce these requests into a small number of 128-byte cache line requests. For example, if 32 threads each read a 4-byte float, if the addresses are consecutive (thread 0 reads addr, thread 1 reads addr+4, ...), only one 128-byte cache line request is required. Conversely, if 32 threads each read non-contiguous addresses, 32 independent cache line requests may be required - a bandwidth utilization of only 1/32.',
              'Common non-merged access modes: (1) Strided Access: Each thread reads an address with stride>1 (such as traversing a two-dimensional array by column). The larger the stride, the worse the performance; (2) Random Access (Random Access): Indirect access through index arrays, completely unpredictable; (3) AoS (Array of Structures) layout: In a structure array, the data of the same field is not continuous in the memory. Opposite to AoS is the SoA (Structure of Arrays) layout: each field is stored in a separate array, and data in the same field is stored continuously, which is naturally suitable for combined access.',
              'LDS (Local Data Share) is a high-speed programmable memory within each CU (RDNA3 64KB per CU) with an access latency of approximately 10 cycles. LDS is organized into 32 banks, each bank 4 bytes wide. A bank conflict occurs when multiple threads access different addresses in the same bank in the same cycle - these accesses must be serialized. For example, 32 threads all access different rows of bank 0, which is a 32-way bank conflict and the latency increases by 32 times. The key to avoiding bank conflicts: ensure that adjacent threads within the same Wavefront access different banks.',
              'LDS tiling + padding technology in actual optimization: In matrix transposition or tiled matrix multiplication, after loading rows from global memory to the LDS tile, if LDS is read column-wise, a bank conflict will occur (because the bank numbers corresponding to one row of the matrix are the same). The solution is to add padding (such as __shared__ float tile[TILE][TILE+1]) to the end of the rows of the LDS array to offset each row by one bank, so that column accesses span different banks. This +1 padding trick is a classic optimization in GPU programming.',
              'Reduction is a basic parallel pattern in GPU programming - reducing all elements of an array to a single value through some operation (addition, maximum, etc.). Best practice for LDS reduction: Use LDS to save partial results in a Block, and gradually merge them after synchronization through __syncthreads(). Key optimizations: (1) Avoid bank conflict: let different threads access different banks at each step; (2) Avoid divergence: active threads should be continuous (use tid < stride instead of tid % (2*stride) == 0); (3) Use warp-level primitives (such as __shfl_down) to reduce without LDS within Wavefront.',
            ],
            keyPoints: [
              'Coalesced accesses: adjacent threads access contiguous addresses → small number of cache line requests → near peak bandwidth',
              'Striding/Random Access: Multiple cache line requests → Bandwidth utilization may drop by 10-32x',
              'AoS → SoA conversion is the simplest and most effective merge optimization - GPU code uses SoA layout first',
              'LDS bank conflict: The same cycle accesses different addresses of the same bank → serialization',
              'Padding technique (tile[N][N+1]) eliminates bank conflicts for column accesses',
              'Reduction optimization: continuous thread active + LDS conflict-free + Wavefront-level shuffle',
            ],
          },
          diagram: {
            title: 'Memory transaction comparison of merged access vs strided access',
            content: `Memory coalesced access vs strided access

Scenario: 32 threads (Wave32) each read 1 float (4 bytes)

═══ Coalesced ═══
Thread:   0    1    2    3    4   ...   31
Address: [0]  [4]  [8]  [12] [16] ... [124]
          └────────────────────────────┘
128 consecutive bytes → 1 cache line request
Bandwidth efficiency: 128/128 = 100%

═══ Stride-2 Step access ═══
Thread:   0    1    2    3    4   ...   31
Address: [0]  [8]  [16] [24] [32] ... [248]
          └─────────┘└─────────┘
2 cache lines, only half used each
Bandwidth efficiency: 128/256 = 50%

═══ Stride-32 Stride access (column access) ═══
Thread:   0      1      2     ...   31
Address: [0]   [128]  [256]  ... [3968]
          ↓      ↓      ↓           ↓
Line 0 Line 1 Line 2 ... Line 31 (separate cache lines!)
32 cache lines requested!
Bandwidth efficiency: 128/4096 ≈ 3%

═══ AoS vs SoA ═══

AoS (Array of Structures):          SoA (Structure of Arrays):
struct { float x,y,z,w; } p[N];     struct { float x[N]; float y[N];
                                              float z[N]; float w[N]; } p;
Memory: [x0 y0 z0 w0 x1 y1 z1 w1..] Memory: [x0 x1 x2 ... | y0 y1 y2 ...]

Read all x: Read all x:
Thread 0: p[0].x → addr 0           Thread 0: p.x[0] → addr 0
Thread 1: p[1].x → addr 16 (jump 4) Thread 1: p.x[1] → addr 4 (continuous!)
→ stride-4 stride, efficiency ~25% → combined access, efficiency 100%`,
            caption: 'The core of the memory merging rule: adjacent threads access adjacent addresses. The AoS structure is naturally stepped access, and the SoA structure is naturally merged access. GPU code should prefer SoA data layout.',
          },
          codeWalk: {
            title: 'Merge access vs stride access performance comparison',
            file: 'coalescing_test.hip',
            language: 'cpp',
            code: `#include <hip/hip_runtime.h>

/*Merge access: adjacent threads access adjacent addresses */
__global__ void coalesced_read(float *out, const float *in, int n)
{
    int idx = blockIdx.x * blockDim.x + threadIdx.x;
    if (idx < n)
        out[idx] = in[idx] * 2.0f;  /* in[0], in[1], in[2], ... */
}

/*Stride access: adjacent threads access the address of every STRIDE element */
__global__ void strided_read(float *out, const float *in,
                              int n, int stride)
{
    int idx = blockIdx.x * blockDim.x + threadIdx.x;
    /*Map threads to stride positions */
    int mapped = (idx % stride) * (n / stride) + (idx / stride);
    if (mapped < n)
        out[mapped] = in[mapped] * 2.0f;
}

/*Use LDS to implement matrix transposition (with padding to eliminate bank conflicts) */
#define TILE 32
__global__ void transpose_optimized(float *out, const float *in,
                                     int width, int height)
{
    /*+1 padding to avoid bank conflict when reading columns! */
    __shared__ float tile[TILE][TILE + 1];

    int xIdx = blockIdx.x * TILE + threadIdx.x;
    int yIdx = blockIdx.y * TILE + threadIdx.y;

    /*Read input line by line → merge access */
    if (xIdx < width && yIdx < height)
        tile[threadIdx.y][threadIdx.x] = in[yIdx * width + xIdx];

    __syncthreads();

    /*Read LDS column-wise (no bank conflict because of padding)
     *Write output line by line → merge access */
    xIdx = blockIdx.y * TILE + threadIdx.x;
    yIdx = blockIdx.x * TILE + threadIdx.y;

    if (xIdx < height && yIdx < width)
        out[yIdx * height + xIdx] = tile[threadIdx.x][threadIdx.y];
}

/*No padding version (with bank conflict):
 *__shared__ float tile[TILE][TILE]; // None +1
 *When tile[threadIdx.x][threadIdx.y]:
 *thread 0 accesses bank 0 (addr 0)
 *Thread 1 accesses bank 0 (addr 32*4=128) ← same bank!
 *   → 32-way bank conflict! */`,
            annotations: [
              'coalesced_read: idx in [idx] continuously in Wavefront → 1 128B request → most efficient',
              'strided_read: mapped addresses are not consecutive within Wavefront → multiple cache line requests → inefficient',
              'TILE+1 padding: tile[32][33] instead of tile[32][32], making each row offset by 1 bank',
              'Without padding, the column reads tile[threadIdx.x][threadIdx.y]: thread 0,1,2.. reads bank 0,0,0.. → 32-way conflict',
              'After adding padding: thread 0 reads bank 0, thread 1 reads bank 1, ... → no conflict',
              'Transposed global memory reads and writes are merged (row-wise), uncolumn column transformations are done in LDS',
            ],
            explanation: 'Matrix transposition is a classic case of memory merging optimization. Direct transposition (in[j*W+i] → out[i*H+j]) either reads without merging or writes without merging. Use LDS tiles as intermediate buffers: first merge reads into LDS row by row, then read from LDS by columns and merge writes out. +1 padding is a standard technique for eliminating LDS bank conflicts - paying 1/32 more LDS space in exchange for 32 times the elimination of bank conflicts.',
          },
          miniLab: {
            title: 'Quantifying the impact of memory merging on bandwidth',
            objective: 'Compare the effective bandwidth of global memory reads under different stride values ​​and draw the stride-bandwidth curve.',
            steps: [
              'Write a test program: N=64M floats, read with stride=1,2,4,8,16,32 respectively',
              'Use hipEventElapsedTime to time and calculate the effective bandwidth = data volume / time consumption (GB/s)',
              'Plot stride vs bandwidth curve (or print the table)',
              'Comparing merged read bandwidth to theoretical VRAM bandwidth (RX 7600 XT ~288 GB/s)',
              'Implement LDS matrix transpose with padding and without padding, and compare the performance of 4096×4096 matrix',
              'Use rocprof to collect TCC_HIT (L2 cache hit rate) counter to verify the merge effect',
            ],
            expectedOutput: `Expected effective bandwidth (RX 7600 XT):
Stride 1: ~250 GB/s (87% peak)
Stride 2:   ~150 GB/s (52%)
Stride 4:   ~80 GB/s  (28%)
Stride 8:   ~45 GB/s  (16%)
Stride 16:  ~25 GB/s  (9%)
Stride 32:  ~15 GB/s  (5%)  ←One cache line per thread!

LDS transpose (4096×4096):
No padding: ~150 GB/s
With padding: ~240 GB/s  ←~60% improvement!`,
            hint: 'Make sure the data size is large enough (>64MB) to eliminate the impact of startup overhead. Use hipDeviceSynchronize to ensure accurate timing. L2 cache effects will mask some of the stride effects - pure VRAM access performance can be observed with much larger L2 data sets.',
          },
          debugExercise: {
            title: 'Find bank conflict in LDS',
            language: 'cpp',
            description: 'The following matrix transpose code uses LDS, but the performance is much lower than expected.',
            question: 'Are there any LDS access performance issues with this code? How to fix it?',
            buggyCode: `#define TILE 32
__global__ void transpose_naive(float *out, const float *in,
                                 int W, int H)
{
    __shared__ float tile[TILE][TILE];  /*BUG: No padding!*/

    int x = blockIdx.x * TILE + threadIdx.x;
    int y = blockIdx.y * TILE + threadIdx.y;

    if (x < W && y < H)
        tile[threadIdx.y][threadIdx.x] = in[y * W + x];

    __syncthreads();

    x = blockIdx.y * TILE + threadIdx.x;
    y = blockIdx.x * TILE + threadIdx.y;

    if (x < H && y < W)
        /*Read LDS by column → 32-way bank conflict! */
        out[y * H + x] = tile[threadIdx.x][threadIdx.y];
}`,
            hint: 'LDS has 32 banks, one bank every 4 bytes. In tile[32][32], all elements of the same column are mapped to the same bank.',
            answer: 'Problem: Reading LDS column-wise on tile[threadIdx.x][threadIdx.y] produces a 32-way bank conflict. The 32 banks of LDS are allocated at address addr%128/4 (that is, addr/4 % 32). A row in tile[32][32] is 32×4=128 bytes, which is exactly 32 full cycles of the bank. Therefore tile[0][j], tile[1][j],...tile[31][j] are all mapped to the same bank (bank j). When threadIdx.x=0..31 accesses tile[0..31][threadIdx.y] simultaneously, all 32 requests go to the same bank → must be serialized, increasing latency by a factor of 32. Fix: Change declaration to __shared__ float tile[TILE][TILE+1], i.e. tile[32][33]. Such a row is 33×4=132 bytes, and tile[i][j] and tile[i+1][j] are no longer in the same bank (offset by 1 bank). The additional space overhead is only 32×4=128 bytes (+3%), but the performance improvement can reach 30-60%.',
          },
          interviewQ: {
            question: 'Explain GPU memory coalescing rules and the impact of AoS vs SoA data layout on GPU performance.',
            difficulty: 'hard',
            hint: 'Explain the merge rules in terms of cache line size, Wavefront access patterns, bandwidth utilization, and then compare the access patterns of AoS/SoA.',
            answer: 'Memory coalescing rules: The GPU\'s global memory controller accesses VRAM at the granularity of cache lines (usually 128 bytes, processed as 64-byte sectors on RDNA). When a Wavefront\'s 32 threads initiate memory requests simultaneously, the memory controller checks whether the addresses fall within a small number of contiguous cache lines. If 32 threads each read 4 bytes of float, and the addresses are contiguously aligned, only one cache line transaction of 128 bytes is required - this is a perfect merge, with 100% bandwidth utilization. If the address is spread across N cache lines, N transactions are required, and only part of the data is useful each time - bandwidth utilization drops to 1/N. AoS vs SoA: The layout of AoS (struct{float x,y,z;} arr[N]) in memory is [x0,y0,z0,x1,y1,z1,...]. When the GPU thread reads the x-coordinates of all particles in parallel with stride=3 (every 12 bytes), the bandwidth utilization is only ~33%. SoA (struct{float x[N]; float y[N]; float z[N];}) layout is [x0,x1,x2,...|y0,y1,y2,...], the addresses are continuous when reading all x, and they are perfectly merged. GPU code should always prefer SoA or hybrid layout (AoSoA: group SoA then inter-group AoS, taking into account cache locality and coalescing).',
            amdContext: 'This is the core knowledge of GPU performance optimization. AMD interviews will ask how to optimize memory access patterns based on specific scenarios (such as particle simulation, image processing). Mentioning RDNA\'s 64-byte sector and L2 cache behavior is a plus.',
          },
        },

        // ── Lesson 8.2.3 ──────────────────────────────────────
        {
          id: '8-2-3',
          number: '8.2.3',
          title: 'rocprof performance analysis practice',
          titleEn: 'rocprof Performance Profiling in Practice',
          duration: 15,
          difficulty: 'advanced',
          tags: ['rocprof', 'profiling', 'hardware-counters', 'hsa-trace', 'performance'],
          concept: {
            summary: 'rocprof is the official AMD ROCm GPU performance profiling tool - it collects kernel execution statistics, hardware performance counters (such as SIMD utilization, cache hit ratio, memory bandwidth) and HSA API traces. Mastering rocprof is a critical skill for diagnosing and optimizing the performance of HIP programs.',
            explanation: [
              'rocprof has three main usage modes: (1) --stats mode: Output the number of calls, total time consumption, average time consumption, and maximum/minimum time consumption of each kernel function. This is the starting point of performance analysis - first find the most time-consuming kernel function, and then analyze in depth; (2) -i input.txt mode: Specify the hardware performance counters to be collected (Hardware Performance Counters) through the input file. The GPU has hundreds of built-in counters to monitor the activities of each hardware unit; (3) --hsa-trace mode: Track HSA Runtime API calls (memory allocation, kernel function startup, data transfer) and generate timeline visualization data.',
              'AMD GPU\'s hardware counters cover all key performance indicators: SQ_WAVES (number of Wavefronts distributed by Shader Sequencer) - reflects the computing utilization of the GPU; SQ_INSTS_VALU (number of vector ALU instructions executed) - reflects the computing density; TCC_HIT / TCC_MISS (number of L2 cache hits/misses) - reflects memory access efficiency; TA_FLAT_READ_WAVEFRONTS / TA_FLAT_WRITE_WAVEFRONTS (number of global memory read and write transactions) - reflects memory bandwidth utilization; SQ_WAIT_INST_ANY (number of cycles waiting for instructions) - reflects the impact of memory latency.',
              'Use the standard workflow of rocprof: first step, run rocprof --stats ./my_program to obtain the time-consuming distribution at the kernel function level; second step, write input.txt to specify the counter (such as pmc: SQ_WAVES TCC_HIT TCC_MISS) for the most time-consuming kernel function, and run rocprof -i input.txt ./my_program; third step, analyze the counter data to calculate the key indicator: L2 hit rate = TCC_HIT / (TCC_HIT + TCC_MISS), VALU utilization = SQ_INSTS_VALU / (SQ_WAVES × theoretical number of instructions per wavefront), effective memory bandwidth = (number of bytes read and written) / kernel function time consumption; the fourth step, select the optimization direction according to the bottleneck type: if VALU utilization is high but TCC_MISS is high → optimize the memory access mode; if VALU utilization is low but SQ_WAIT is high → Increase occupancy or use prefetching.',
              'The trace data generated by --hsa-trace can be exported to Chrome Tracing format (JSON) and opened with chrome://tracing or Perfetto to visualize the CPU-GPU timeline: see the interval between kernel functions (launch overhead), the overlap of data transmission and calculation, and the parallelism of multiple streams. This is very useful for diagnosing "low GPU utilization" problems - usually the CPU side is preparing data too slowly or the kernel function is launched too frequently, causing the GPU to be idle.',
              'Advanced features of rocprof: --timestamp on includes nanosecond timestamps in output; --basenames on displays function names instead of mangled symbols; all available counters can be queried via the ROCP_METRICS environment variable (rocprof --list-basic and rocprof --list-derived). Note that hardware counters have collection limitations - each run can collect up to 4-8 basic counters simultaneously (limited by SPM hardware). If more are specified in input.txt, rocprof will automatically run in multiple passes (multi-pass), and the total time will increase.',
            ],
            keyPoints: [
              'rocprof --stats: Kernel function-level time-consuming statistics, find hot functions',
              'rocprof -i input.txt: Collect hardware counters (SQ_WAVES, TCC_HIT, SQ_INSTS_VALU, etc.)',
              'rocprof --hsa-trace: HSA API trace, generate timeline data',
              'L2 hit rate = TCC_HIT / (TCC_HIT + TCC_MISS), low hit rate → optimize memory access pattern',
              'The counter can collect up to 4-8 items at the same time each time (hardware limit). If it exceeds the limit, it will be multi-pass.',
              'rocprof --list-basic to view all available base counters, --list-derived to view derived metrics',
            ],
          },
          diagram: {
            title: 'rocprof performance analysis workflow',
            content: `Rocprof performance analysis complete workflow

Step 1: Find the hotspot kernel function
─────────────────────
$ rocprof --stats ./my_program

Output results.stats.csv:
┌──────────────────┬───────┬──────────┬──────────┐
│ KernelName       │ Calls │ TotalNs  │ AvgNs    │
├──────────────────┼───────┼──────────┼──────────┤
│ matmul_tiled     │  100  │ 85000000 │  850000  │ ←85% of the time!
│ vector_add       │  100  │  5000000 │   50000  │
│ reduce_sum       │  100  │ 10000000 │  100000  │
└──────────────────┴───────┴──────────┴──────────┘

Step 2: Collect counters for hot spots
─────────────────────────
input.txt:
  pmc: SQ_WAVES SQ_INSTS_VALU TCC_HIT TCC_MISS

$ rocprof -i input.txt ./my_program

Output input.csv:
┌──────────────┬──────────┬────────────┬─────────┬──────────┐
│ KernelName   │ SQ_WAVES │SQ_INSTS_VALU│TCC_HIT │TCC_MISS │
├──────────────┼──────────┼────────────┼─────────┼──────────┤
│ matmul_tiled │  32768   │  4194304   │ 1200000 │  800000  │
└──────────────┴──────────┴────────────┴─────────┴──────────┘

Step 3: Analyze indicators
───────────────
L2 hit rate = 1200000 / (1200000+800000) = 60%  ←On the low side!
VALU/Wave = 4194304 / 32768 = 128 instructions/wave   ←Calculate density
→ Bottleneck: Memory access efficiency → Optimization: Increase tiles, improve merging

Step 4: HSA Timeline Analysis
────────────────────
$ rocprof --hsa-trace ./my_program
→ Output results.json, then open it in chrome://tracing

CPU Timeline: ──launch──wait──launch──wait──launch──
GPU Timeline: ─────────[kernel]────[kernel]─────────
                       ↑                   ↑
                       GPU idle!           GPU idle!
→ Problem: launch interval is too large → Optimization: use stream to reduce synchronization`,
            caption: 'The standard workflow of rocprof: first find hot spots (--stats), then collect counters (-i), then analyze bottlenecks, and finally use timeline (--hsa-trace) to check CPU-GPU collaboration efficiency.',
          },
          codeWalk: {
            title: 'Detailed explanation of rocprof input.txt counter configuration file',
            file: 'rocprof_configs/input.txt',
            language: 'text',
            code: `#rocprof hardware counter configuration file
#Usage: rocprof -i input.txt ./my_program
#Output: input.csv (one row for each kernel function, columns specifying counter values)

# ────────────────────────────────────────────────
#Basic Counter Group 1: Calculate Utilization
#NOTE: No more than 4-8 counters per line of pmc (hardware limit)
# ────────────────────────────────────────────────
pmc: SQ_WAVES SQ_INSTS_VALU SQ_INSTS_SALU SQ_WAIT_INST_ANY
#SQ_WAVES: Total number of Wavefronts distributed
#SQ_INSTS_VALU: Number of vector ALU instructions executed
#SQ_INSTS_SALU: Number of scalar ALU instructions executed
#SQ_WAIT_INST_ANY: Number of cycles to wait for (stall)

# ────────────────────────────────────────────────
#Basic Counter Group 2: Cache Efficiency
# ────────────────────────────────────────────────
pmc: TCC_HIT TCC_MISS TCC_EA_RDREQ TCC_EA_WRREQ
#TCC_HIT: Number of L2 cache hits
#TCC_MISS: Number of L2 cache misses
#TCC_EA_RDREQ: Number of read requests sent to VRAM
#TCC_EA_WRREQ: Number of write requests sent to VRAM

# ────────────────────────────────────────────────
#Basic Counter Group 3: Memory Bandwidth
# ────────────────────────────────────────────────
pmc: TA_FLAT_READ_WAVEFRONTS TA_FLAT_WRITE_WAVEFRONTS
#TA_FLAT_READ_WAVEFRONTS: Global memory read transaction (per wavefront)
#TA_FLAT_WRITE_WAVEFRONTS: Global memory write transactions (per wavefront)

# ────────────────────────────────────────────────
#Use range to filter specific kernel functions (optional)
# ────────────────────────────────────────────────
# range: 0:1
#Only analyze the 0th to 1st kernel function calls

# ────────────────────────────────────────────────
#Derived metrics (rocprof --list-derived see full list)
# ────────────────────────────────────────────────
# pmc: VALUUtilization VALUBusy L2CacheHit MemUnitBusy
#These are the percentage metrics calculated by rocprof from the underlying counters

# ────────────────────────────────────────────────
#Complete analysis command example:
# ────────────────────────────────────────────────
#1) Kernel function statistics:
#    rocprof --stats ./my_program
#
#2) Hardware counter:
#    rocprof -i input.txt ./my_program
#
#3) HSA API tracking:
#    rocprof --hsa-trace ./my_program
#
#4) Generate Chrome Tracing format:
#    rocprof --hsa-trace --timestamp on ./my_program
#→ Open results.json with chrome://tracing
#
#5) View all available counters:
#rocprof --list-basic (basic hardware counters)
#rocprof --list-derived (derived indicators)`,
            annotations: [
              'Each pmc: line defines a set of counters to be collected simultaneously, multiple pmc: lines will result in multi-pass (the program is run multiple times)',
              'The SQ (Shader Sequencer) counter reflects the status of the computing pipeline - SQ_WAVES is the most basic activity indicator',
              'TCC (Texture Cache Controller, L2) counter reflects cache efficiency - low hit rate means poor memory access pattern',
              'The TA (Texture Addresser) counter reflects the number of global memory transactions—directly related to merged access efficiency',
              'range: The filter can only analyze specific kernel function calls to reduce noise.',
              'Derived metrics (such as VALUUtilization) are percentages automatically calculated by rocprof from the underlying counters, which are more intuitive',
            ],
            explanation: 'This input.txt shows the complete format of rocprof counter configuration. In actual performance analysis, you usually need to collect counters in three groups (computing, cache, memory), and then comprehensively analyze bottlenecks. Key indicators: L2 hit rate = TCC_HIT/(TCC_HIT+TCC_MISS) reflects the locality of memory access; the number of VALU instructions/the number of Wavefronts reflects the computing density; the SQ_WAIT ratio reflects the degree of stall. AMD\'s GPUs have hundreds of hardware counters, and rocprof --list-basic can list all counters supported by your GPU.',
          },
          miniLab: {
            title: 'Use rocprof to analyze matrix multiply performance',
            objective: 'Run rocprof on the previously implemented tiled and naive matrix multiplications to compare key performance metrics.',
            setup: `#Make sure rocprof is available
which rocprof  #Should be in /opt/rocm/bin/rocprof

#Create counter configuration file
cat > counters.txt << 'EOF'
pmc: SQ_WAVES SQ_INSTS_VALU TCC_HIT TCC_MISS
EOF`,
            steps: [
              'Write a program that contains both naive and tiled matrix multiplication, matrix size 2048×2048',
              'Run rocprof --stats ./matmul to obtain kernel function time-consuming comparison',
              'Run rocprof -i counters.txt ./matmul to collect hardware counters',
              'Calculate L2 hit rate and VALU efficiency for naive and tiled versions',
              'Run rocprof --hsa-trace --timestamp on ./matmul to generate a timeline',
              'Open chrome://tracing and import results.json to observe the kernel function execution timeline',
            ],
            expectedOutput: `$ rocprof --stats ./matmul
Name            Calls   TotalDurationNs   AverageNs
matmul_naive    1       45000000          45000000   ← 45ms
matmul_tiled    1       8500000           8500000    ← 8.5ms (5.3x faster!)

$ rocprof -i counters.txt ./matmul (simplified):
               SQ_WAVES  SQ_INSTS_VALU  TCC_HIT   TCC_MISS
matmul_naive   131072    67108864       500000    1500000   ←L2 hit rate 25%
matmul_tiled   131072    67108864       1600000   400000    ←L2 hit rate 80%!`,
            hint: 'If rocprof reports "permission denied", you need to sudo or add the user to the video group. If the counter values ​​are all 0, confirm whether the GPU supports the counter (rocprof --list-basic | grep SQ_WAVES). Counter names supported by different GPU architectures may vary slightly.',
          },
          debugExercise: {
            title: 'Analyzing rocprof output to diagnose performance bottlenecks',
            language: 'text',
            description: 'The following is the counter output of rocprof for a kernel function. Diagnose the performance bottleneck of the kernel function.',
            question: 'Based on these counter data, what is the main bottleneck of this kernel function? How to optimize?',
            buggyCode: `rocprof output (kernel function: particle_update, N=1M particles):

Duration:         12.5 ms
SQ_WAVES:         32768
SQ_INSTS_VALU:    524288    (16 VALU insts/wave)
SQ_INSTS_SALU:    65536     (2 SALU insts/wave)
SQ_WAIT_INST_ANY: 98304000  (3000 wait cycles/wave!)
TCC_HIT:          50000
TCC_MISS: 950000 (L2 hit rate only 5%!)
TA_FLAT_READ_WAVEFRONTS:  512000

/*Kernel function code (simplified): */
struct Particle { float x, y, z, vx, vy, vz, mass, temp; };

__global__ void particle_update(Particle *particles, int n) {
    int idx = blockIdx.x * blockDim.x + threadIdx.x;
    if (idx < n) {
        particles[idx].x += particles[idx].vx * dt;
        particles[idx].y += particles[idx].vy * dt;
        particles[idx].z += particles[idx].vz * dt;
    }
}`,
            hint: 'Observe two key metrics: L2 hit rate (5%) and SQ_WAIT_INST_ANY (3000 cycles/wave). Let\'s look at the data layout again—Particle is an AoS structure.',
            answer: 'Bottleneck diagnosis: This kernel function is a serious memory bottleneck (memory-bound). Evidence: (1) SQ_WAIT_INST_ANY = 3000 cycles/wave is extremely high, indicating that a lot of time is spent waiting for memory; (2) TCC_MISS hit rate is only 5% (50000/(50000+950000)), and the L2 cache is almost invalid; (3) VALU instructions are only 16/wave, and the amount of calculation is very small. The root cause is the AoS data layout - the Particle structure has 8 floats = 32 bytes, but the kernel function can only read and write the 6 fields x/y/z/vx/vy/vz. When adjacent threads access adjacent Particles, stride=32 bytes, only 6/8=75% of the data is useful for each cache line load, and stride>4 results in imperfect merging. More importantly, the L2 cache hit rate is extremely low - each Particle is only accessed once and cannot be reused. Optimization plan: (1) Change AoS to SoA: float x[N], y[N], z[N], vx[N], vy[N], vz[N] - merge access and load only required fields; (2) Expected effect: Bandwidth utilization increases from ~25% to nearly 100%, SQ_WAIT drops significantly, and the overall speed is increased by 3-4 times.',
          },
          interviewQ: {
            question: 'Describe your workflow for using rocprof to analyze and optimize HIP kernel performance.',
            difficulty: 'hard',
            hint: 'The complete process starts from finding hot spots with --stats, to counter collection, indicator analysis, bottleneck location, and optimization strategy. Mention the specific counter name and calculation formula.',
            answer: 'My rocprof performance analysis process: (1) Locate hot spots: rocprof --stats gets the time-consuming distribution of all kernel functions and finds the kernel function that accounts for the most time (usually the 80/20 rule - 20% of the kernel functions account for 80% of the time). (2) Classification bottleneck: collect two sets of counters - calculation group (SQ_WAVES, SQ_INSTS_VALU, SQ_WAIT_INST_ANY) and cache group (TCC_HIT, TCC_MISS, TA_FLAT_READ/WRITE_WAVEFRONTS). Calculate key indicators: L2 hit rate=TCC_HIT/(HIT+MISS), VALU utilization=SQ_INSTS_VALU/(SQ_WAVES×theoretical number of instructions), stall ratio=SQ_WAIT/(total cycles). If stall is high + L2 miss is high → memory bottleneck; if VALU utilization is high + stall is low → computing bottleneck; if SQ_WAVES is low → occupancy issue. (3) Optimization strategy: memory bottleneck → check merging (AoS→SoA), increase LDS tiling, adjust block size to improve cache reuse; computing bottleneck → reduce the number of instructions (use built-in functions, reduce redundant calculations), use half precision (__half2); occupancy issues → reduce per-thread register usage and LDS allocation. (4) Verification: Collect counters again after modification to confirm improvements in key indicators. (5) Global optimization: rocprof --hsa-trace checks CPU-GPU cooperation - kernel function interval, transmission and calculation overlap, and uses multiple streams to reduce GPU idle time.',
            amdContext: 'This question directly tests your practical experience. AMD interviewers expect you to be able to name specific counter names (SQ_WAVES, TCC_HIT, etc.), not just generally say "analyze using profiler". Being able to describe the complete analysis-optimization-validation closed loop will be a big plus.',
          },
        },
      ],
    },
  ],
  completionChecklist: [
    'Able to write complete HIP programs: kernel function definition → memory allocation → data transmission → startup execution → synchronous recycling',
    'Understand the Grid/Block/Thread hierarchy and its mapping to AMD hardware (GPU/CU/Wavefront)',
    'Master the applicable scenarios of three memory allocation strategies (hipMalloc/hipHostMalloc/hipMallocManaged)',
    'Understand the Wavefront execution model and the performance impact of branch divergences, and be able to identify and resolve divergences',
    'Master memory merged access rules and AoS→SoA optimization to solve LDS bank conflict',
    'A complete performance analysis workflow can be completed using rocprof --stats / -i / --hsa-trace',
    'Can propose a small HIP optimization plan and justify block size, memory placement, and measurement method before coding it',
  ],
};
