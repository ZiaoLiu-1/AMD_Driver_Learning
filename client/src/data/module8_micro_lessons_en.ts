// ============================================================
// AMD Linux Driver Learning Platform - Module 8 Micro-Lessons (English)
// Module 8: ROCm User Compute (ROCm user-spacecompute)
// 5 lessons in 2 groups, ~15 min each, total ~75 min
// ============================================================
import type { MicroLessonModule } from './micro_lesson_types';

export const module8MicroLessonsEn: MicroLessonModule = {
  moduleId: 'rocm-compute',
  groups: [
    // ════════════════════════════════════════════════════════════
    // Group 8.1: HIP programming模型
    // ════════════════════════════════════════════════════════════
    {
      id: '8-1',
      number: '8.1',
      title: 'HIP programming模型',
      titleEn: 'HIP Programming Model',
      icon: 'Rocket',
      description: 'learn HIP programmingcore概念: Grid/Block/Thread layer次structure, kernelfunctionwriteandstartup, devicememory management, and GPU memorylayer次and高效allocationstrategy. ',
      lessons: [
        // ── Lesson 8.1.1 ──────────────────────────────────────
        {
          id: '8-1-1',
          number: '8.1.1',
          title: 'HIP programmingbasics: Grid, Block and Thread',
          titleEn: 'HIP Basics: Grid, Block & Thread',
          duration: 15,
          difficulty: 'intermediate',
          tags: ['HIP', 'kernel', 'grid', 'block', 'thread', 'hipLaunchKernelGGL'],
          concept: {
            summary: 'HIP(Heterogeneous-compute Interface for Portability)is AMD  GPU programming API, 语法and CUDA 几乎same. HIP programthrough __global__ 核function(kernel)in GPU onstartup大scaleparallelcompute, compute任务by组织as Grid → Block → Thread 三layerlayer次structure. ',
            explanation: [
              'GPU programmingcore思想is SIMT(Single Instruction, Multiple Threads) — 用成千on万个threadmeanwhileexecute同一段code, 但eachthreadhandledifferentdata. HIP is AMD 对这一模型implementation, 它 API 几乎is CUDA 镜像, 这使得from CUDA migrationto HIP 非常simple(AMD 甚至provide hipify toolautomaticconvertcode). ',
              'HIP threadlayer次structure分三级: Thread(thread)is最小execute单元, eachthreadhasunique threadIdx(block内索引); Block(thread block)is一组thread集合, 同a Block 内threadcanthrough LDS(Local Data Share, i.e.shared memory)通信andsynchronization(__syncthreads()), Block sizeusuallyas 64/128/256 个thread; Grid(grid)isall Block 集合, through blockIdx 区分different Block. globalthread ID compute公式is: globalId = blockIdx.x * blockDim.x + threadIdx.x. ',
              '核function(kernel)用 __global__ 修饰符声明, 只canreturn void. startup核functionhas两种语法: hipLaunchKernelGGL(kernel, gridDim, blockDim, sharedMem, stream, args...) is HIP recommendedapproach; kernel<<<gridDim, blockDim, sharedMem, stream>>>(args...) is CUDA 兼容语法. gridDim and blockDim use dim3 type指定三维size, 但一维issueusually只用 x 分量. ',
              'devicememory managementis HIP programmingbasics. hipMalloc() in GPU VRAM onallocationmemory, hipMemcpy() in CPU and GPU 之betweentransferdata(方向由 hipMemcpyHostToDevice / hipMemcpyDeviceToHost 指定), hipFree() release GPU memory. entireprocessis: allocation GPU memory → copyinputdatato GPU → startup核function → copyresult回 CPU → release GPU memory. hipDeviceSynchronize() used forwait GPU onalloperatecomplete. ',
              'in底layer, when你call hipLaunchKernelGGL 时, HIP run时will核functioncompilation好 GPU 二进制code(through LLVM AMDGPU backendgenerate)andparameterencapsulation成 AQL(Architected Queuing Language)包, write KFD create HSA queue. GPU commandhandle器fromqueuein取出 AQL 包, will Block allocationtoavailable Compute Unit(CU)onexecute. CU count因型号而异(如 RX 7600 XT as 32 CU, RX 7900 XTX as 96 CU), 理论on均canmeanwhileexecute数千个thread. ',
            ],
            keyPoints: [
              'HIP threadlayer次: Grid(all Block)→ Block(shared LDS thread组)→ Thread(最小execute单元)',
              'globalthread ID = blockIdx.x * blockDim.x + threadIdx.x',
              '__global__ 修饰核function, hipLaunchKernelGGL() startupexecute',
              'hipMalloc / hipMemcpy / hipFree managementdevicememoryanddatatransfer',
              'hipDeviceSynchronize() wait GPU completeall任务',
              'HIP 语法and CUDA 几乎same, hipify toolcanautomaticconvert CUDA code',
            ],
          },
          diagram: {
            title: 'HIP Grid/Block/Thread layer次structure',
            content: `HIP thread组织layer次structure

Grid (gridDim = 4×2)                   a Block internal
┌─────────┬─────────┬─────────┬─────────┐   ┌─────────────────────────────┐
│ Block   │ Block   │ Block   │ Block   │   │  Block (1,0)                │
│ (0,0)   │ (1,0)   │ (2,0)   │ (3,0)   │   │  blockDim = 8×4 = 32 threads│
├─────────┼─────────┼─────────┼─────────┤   │                             │
│ Block   │ Block   │ Block   │ Block   │   │  ┌─┬─┬─┬─┬─┬─┬─┬─┐       │
│ (0,1)   │ (1,1)   │ (2,1)   │ (3,1)   │   │  │0│1│2│3│4│5│6│7│ tid.y=0│
└─────────┴─────────┴─────────┴─────────┘   │  ├─┼─┼─┼─┼─┼─┼─┼─┤       │
                                              │  │0│1│2│3│4│5│6│7│ tid.y=1│
global ID compute(一维example):                      │  ├─┼─┼─┼─┼─┼─┼─┼─┤       │
                                              │  │0│1│2│3│4│5│6│7│ tid.y=2│
gridDim.x = 4 blocks                         │  ├─┼─┼─┼─┼─┼─┼─┼─┤       │
blockDim.x = 256 threads/block                │  │0│1│2│3│4│5│6│7│ tid.y=3│
total threads = 4 × 256 = 1024               │  └─┴─┴─┴─┴─┴─┴─┴─┘       │
                                              │  ↑ threadIdx.x              │
Block 0       Block 1       Block 2           │                             │
[0..255]     [256..511]    [512..767]  ...    │  shared LDS (64KB max)        │
     │              │             │            │  can __syncthreads() synchronization    │
     └──────────────┴─────────────┘            └─────────────────────────────┘
globalIdx = blockIdx.x * blockDim.x + threadIdx.x

mappingto AMD hardware: 
┌─────────────────────────────────────────────────────────┐
│  RX 7600 XT (Navi33, 32 CU)                            │
│                                                          │
│  Block → allocationtoa CU (Compute Unit)                   │
│  Thread → 以 Wavefront (32/64 threads) as单位execute       │
│  LDS → CU 内localdatashared (64KB/CU)                   │
│  a CU canmeanwhilerunmultiple Block(受register/LDS limit)      │
└─────────────────────────────────────────────────────────┘`,
            caption: 'HIP 三级threadlayer次structure. Grid containmultiple Block, each Block containmultiple Thread. Block mappingto CU execute, Thread 以 Wavefront as粒度in SIMD 单元onrun. ',
          },
          codeWalk: {
            title: 'vector_add.hip — complete HIP 向量加法example',
            file: 'vector_add.hip',
            language: 'cpp',
            code: `#include <hip/hip_runtime.h>
#include <stdio.h>

/* __global__ mark此functionas GPU 核function
 * in GPU onby数千个threadparallelexecute */
__global__ void vector_add(const float *a, const float *b,
                           float *c, int n)
{
    /* eachthreadcomputeselfglobal索引 */
    int idx = blockIdx.x * blockDim.x + threadIdx.x;

    /* boundarycheck: thread总数mayexceed数组长度 */
    if (idx < n) {
        c[idx] = a[idx] + b[idx];
    }
}

int main()
{
    const int N = 1 << 20;  /* 1M elements */
    size_t bytes = N * sizeof(float);

    /* 1. allocation host(CPU)memory */
    float *h_a = (float *)malloc(bytes);
    float *h_b = (float *)malloc(bytes);
    float *h_c = (float *)malloc(bytes);

    for (int i = 0; i < N; i++) {
        h_a[i] = 1.0f;
        h_b[i] = 2.0f;
    }

    /* 2. allocation device(GPU)memory */
    float *d_a, *d_b, *d_c;
    hipMalloc(&d_a, bytes);
    hipMalloc(&d_b, bytes);
    hipMalloc(&d_c, bytes);

    /* 3. willinputdatafrom CPU copyto GPU */
    hipMemcpy(d_a, h_a, bytes, hipMemcpyHostToDevice);
    hipMemcpy(d_b, h_b, bytes, hipMemcpyHostToDevice);

    /* 4. startup核function
     * each Block 256 个thread
     * Grid size = ceil(N / 256) 个 Block */
    int blockSize = 256;
    int gridSize = (N + blockSize - 1) / blockSize;

    hipLaunchKernelGGL(vector_add,
                       dim3(gridSize),   /* Grid 维度 */
                       dim3(blockSize),  /* Block 维度 */
                       0,                /* dynamicshared memorysize */
                       0,                /* HIP stream (0=default) */
                       d_a, d_b, d_c, N);

    /* 5. wait GPU complete */
    hipDeviceSynchronize();

    /* 6. willresultfrom GPU 拷回 CPU */
    hipMemcpy(h_c, d_c, bytes, hipMemcpyDeviceToHost);

    /* 7. verifyresult */
    for (int i = 0; i < N; i++) {
        if (h_c[i] != 3.0f) {
            printf("Error at index %d: %f != 3.0\\n", i, h_c[i]);
            return 1;
        }
    }
    printf("PASSED: %d elements computed correctly\\n", N);

    /* 8. releasememory */
    hipFree(d_a); hipFree(d_b); hipFree(d_c);
    free(h_a); free(h_b); free(h_c);
    return 0;
}
/* compilation: hipcc vector_add.hip -o vector_add
 * run: ./vector_add
 * output: PASSED: 1048576 elements computed correctly */`,
            annotations: [
              '__global__ 修饰符告诉compiler此functionin GPU onexecute, from CPU 端call',
              'blockIdx.x * blockDim.x + threadIdx.x is最basicglobal索引compute — 几乎each kernel all以此开头',
              'if (idx < n) boundarycheck必notcan少: gridSize * blockSize usually大于actualdata量',
              'hipMalloc in GPU VRAM onallocationmemory, returnpointer只canin GPU codein解引用',
              'hipMemcpy issynchronizationoperate — 它willblock CPU 直totransfercomplete, isperformancebottleneck之一',
              'hipLaunchKernelGGL isasynchronous — CPU not等 GPU completecontinueexecutebelow一条语句',
              'hipDeviceSynchronize wait GPU onalloperatecomplete, in此beforenotcanreadresult',
            ],
            explanation: 'this vector_add programdemonstrate HIP programmingcompletepattern: allocation → copy → startup → synchronization → 拷回 → release. althoughforsimple向量加法说 GPU not比 CPU 快(datatransfer开销太大), 但whencompute密集度提高(如矩阵乘法, 神经网络推理), GPU 大scaleparallel优势will显现出. in底layer, hipcc call LLVM AMDGPU backendwill __global__ functioncompilationas GPU ISA(GFX11 instruction set), hipLaunchKernelGGL through HSA run时will AQL 包write KFD queue. ',
          },
          miniLab: {
            title: 'compilationrunyour第a HIP program',
            objective: 'in RX 7600 XT oncompilation并run vector_add.hip, measuredifferent Block size对performanceimpact. ',
            setup: `# install ROCm(if尚not yetinstall)
# 参考 https://rocm.docs.amd.com/en/latest/deploy/linux/installer/install.html
sudo apt install rocm-hip-sdk

# verify HIP environment
hipcc --version
hipconfig --full`,
            steps: [
              'willthe above vector_add.hip savetofile, 用 hipcc vector_add.hip -o vector_add compilation',
              'run ./vector_add verifyoutputas PASSED',
              'modify N as 1<<24(16M 元素), re-compilationrun, observewhetherstillcorrect',
              '分别用 blockSize = 64, 128, 256, 512 testing, in核functionbeforeafter加 hipEventRecord 计时',
              'run rocm-smi observe GPU 负载andfrequency变化',
              'will hipMemcpy 改as hipMemcpyAsync 并use stream, observewhetherhasperformance提升',
            ],
            expectedOutput: `$ hipcc vector_add.hip -o vector_add && ./vector_add
PASSED: 1048576 elements computed correctly

$ rocm-smi
========================= ROCm SMI ==========================
GPU  Temp   AvgPwr  SCLK    MCLK     Fan   Perf  ...
0    45c    25.0W   2100Mhz 2000Mhz  0%    auto  ...`,
            hint: 'if hipcc 找notto, confirm ROCm  bin directoryin PATH in: export PATH=$PATH:/opt/rocm/bin. ifrun时报 "no device" error, check /dev/kfd whetherexistandcurrentuserwhetherin video and render 组in. ',
          },
          debugExercise: {
            title: 'find HIP 核functioninout of boundsaccess',
            language: 'cpp',
            description: 'below HIP 核functionhasacommonerror, willcauseout of boundsmemoryaccessandnotcanpredictionresult. ',
            question: 'thiscodehaswhatissue? inwhatconditionbelowwill出错? ',
            buggyCode: `__global__ void scale_array(float *data, float factor, int n)
{
    int idx = blockIdx.x * blockDim.x + threadIdx.x;
    /* BUG: 缺少boundarycheck! */
    data[idx] = data[idx] * factor;
}

int main()
{
    int N = 1000;
    int blockSize = 256;
    int gridSize = (N + blockSize - 1) / blockSize;  /* = 4 */
    /* 4 blocks × 256 threads = 1024 threads
     * 但数组only 1000 个元素! */

    float *d_data;
    hipMalloc(&d_data, N * sizeof(float));
    hipLaunchKernelGGL(scale_array, dim3(gridSize),
                       dim3(blockSize), 0, 0, d_data, 2.0f, N);
}`,
            hint: 'gridSize * blockSize = 1024, 但数组only 1000 个元素. thread 1000-1023 willaccesswhat? ',
            answer: 'error: 缺少boundarycheck. gridSize = ceil(1000/256) = 4, total threads = 4×256 = 1024, 但数组only 1000 个元素. thread idx=1000 to idx=1023 willout of boundsaccess data[1000]..data[1023], 这isnot yetallocation GPU memory. after果: (1)readto垃圾data; (2)writetoother GPU allocationmemoryregion(data corruption); (3)maytrigger GPU page fault(in dmesg in看to "GPU fault detected: vmid:X"). fixmethod: in核function开头加 if (idx < n) return; orwilloperate包in if (idx < n) { ... } in. 这is HIP/CUDA programmingin最common bug — 几乎each核functionallneedboundarycheck. AMD  rocm-gdb debugging器and ASAN for GPU can帮助detect此类issue. ',
          },
          interviewQ: {
            question: 'describe HIP threadlayer次structure(Grid/Block/Thread), and它howmappingto AMD GPU hardware. ',
            difficulty: 'medium',
            hint: 'from软件abstraction(Grid→Block→Thread)tohardwaremapping(GPU→CU→Wavefront), indicate Block howbyschedulingto CU, Thread how组成 Wavefront. ',
            answer: 'HIP threadlayer次structure: Grid is最顶layer, containalltoexecutethread, 由 gridDim define维度(最多 3D); Block(thread block)isschedulingbasic单位, 由 blockDim definesize(usually 64-1024 thread), 同一 Block 内threadshared LDS 并canthrough __syncthreads() synchronization; Thread is最小execute单元, through threadIdx identifierblock内location. hardwaremapping: Grid correspondingentire GPU(如 RX 7600 XT  32 CU), Block byschedulingtoa Compute Unit(CU)on — 一旦allocationwill notmigrationtoother CU. Block 内threadby分成 Wavefront(AMD 术语, 等价于 NVIDIA  Warp) — RDNA architecturesupport 32 thread/wavefront(Wave32)or 64 thread/wavefront(Wave64). a CU canmeanwhile容纳multiple Block, 受限于registerfileand LDS 总量. GPU hardwarescheduler(SPI)responsible forwill Block allocationtohas足够resource CU on. whenall CU allby占满时, 剩余 Block queuedwait. ',
            amdContext: 'AMD interviewin必考basics题. key区分点is AMD use Wavefront(32/64)rather than NVIDIA  Warp(32), and RDNA  Wave32 pattern对branchperformanceimpact. ',
          },
        },

        // ── Lesson 8.1.2 ──────────────────────────────────────
        {
          id: '8-1-2',
          number: '8.1.2',
          title: 'GPU memorylayer次andallocationstrategy',
          titleEn: 'GPU Memory Hierarchy & Allocation Strategies',
          duration: 15,
          difficulty: 'intermediate',
          tags: ['memory-hierarchy', 'VRAM', 'LDS', 'hipMalloc', 'pinned-memory', 'streams'],
          concept: {
            summary: 'GPU 拥has深layermemorylayer次structure — from最快registerto最慢system memory — 每一layerlatencyandbandwidth相差数十倍. understandthislayer次structure并selectcorrectmemory allocationstrategy(hipMalloc vs hipHostMalloc vs hipMallocManaged), is写出高performance HIP programkey. ',
            explanation: [
              'GPU memorylayer次structurefrom快to慢依次as: (1)register(Register): eachthread私has, accesslatency ~1 cycle, RDNA3 each CU has 192KB VGPR(向量generalregister); (2)LDS(Local Data Share): Block 内shared, latency ~4-10 cycles, each CU 64KB, 等价于 CUDA  shared memory; (3)L1 cache: each CU 独has, 16-32KB, automaticcacheglobal memoryaccess; (4)L2/Infinity Cache: L2 本体约 2MB, outside加 32MB Infinity Cache(作as末级cache), 二者共同减少对 VRAM access(RDNA3  Infinity Cache isbandwidthkey); (5)VRAM(VRAM): GPU local高bandwidthmemory, 8GB GDDR6, bandwidth ~288 GB/s; (6)system memory(System RAM): through PCIe 总线access, bandwidth仅 ~32 GB/s(PCIe 4.0 x16). ',
              'selectcorrect HIP memory allocationfunction至关important: hipMalloc() in GPU VRAM onallocationmemory, is最常用approach, GPU access速度最快但 CPU unable todirectlyaccess; hipHostMalloc() in CPU 端allocation pinned(page-locked)memory, canthrough hipHostMallocMapped flag使其meanwhileby GPU through PCIe directlyaccess — 这avoidexplicit hipMemcpy, 但 GPU access速度受 PCIe bandwidthlimit; hipMallocManaged() allocation统一virtual address(Managed Memory), CPU and GPU can用同apointeraccess, run时automaticin CPU/GPU 之betweenmigrationdata(through page fault), developmentsimple但performancemaynot如手动management. ',
              'Pinned memory(页锁定memory)对 DMA transfer至关important. 普通 malloc allocationmemorymaybyoperatesystem swap to磁盘, GPU  DMA engineunable todirectlyaccess这种memory. hipHostMalloc allocationmemoryby锁定inphysical RAM in(mlock), DMA enginecandirectlyin PCIe ontransfer, avoidoperatesystemoncememorycopy. this is why hipMemcpy inuse pinned memory时比普通memory快 2-3 倍. ',
              'HIP Stream isimplementationasynchronousexecuteanddatatransfer重叠coremechanism. a Stream 代表ahas序operate序列(copy/核function), different Stream 之betweenoperatecanparallelexecute. typical双缓冲pattern: Stream 0 executecurrent批次核function时, Stream 1 meanwhiletransferbelow一批次data. hipMemcpyAsync() 发起asynchronousdatatransfer(need pinned memory), hipStreamCreate/hipStreamSynchronize management Stream lifecycle. in底layer, each Stream corresponding KFD createa HSA queue. ',
            ],
            keyPoints: [
              'memorylayer次: Register (~1cy) > LDS (~10cy) > L1 > L2 (32MB) > VRAM (288GB/s) > System (32GB/s)',
              'hipMalloc → GPU VRAM, GPU 快速access, CPU notcandirectlyaccess',
              'hipHostMalloc → CPU pinned memory, canby GPU through PCIe access, DMA transfer效率最高',
              'hipMallocManaged → 统一virtual address, automaticmigration, 方便但performance开销较大',
              'Pinned memory 对asynchronoustransfer必notcan少 — 非 pinned  hipMemcpyAsync will退化assynchronizationoperate',
              'HIP Stream implementationcomputeandtransfer重叠, typical提升 30-50% throughput',
            ],
          },
          diagram: {
            title: 'GPU memorylayer次structureandlatencycompare',
            content: `AMD RDNA3 GPU memorylayer次structure(RX 7600 XT / Navi33)

                    latency          bandwidth           size      作用域
                    ────          ────           ────      ──────
┌─────────┐
│ Register│    ~1 cycle      ~无限(CU内)      192KB/CU   thread私has
│ (VGPR)  │    最快                            (向量register)
└────┬────┘
     │
┌────▼────┐
│   LDS   │    ~4-10 cy     ~3.3 TB/s(CU内)   64KB/CU   Block shared
│(Shared) │    = CUDA shared memory            canprogrammingmanagement
└────┬────┘
     │
┌────▼────┐
│ L1 Cache│    ~20 cy       ~1.5 TB/s          32KB/CU   CU 私has
│         │    automaticcacheglobal memoryaccess              (hardwaremanagement)
└────┬────┘
     │
┌────▼────┐
│ L2 Cache│    ~100 cy      ~800 GB/s          32MB      全 GPU shared
│ (RDNA3) │    ← RDNA3 大 L2 isperformancekey!       (大cache!)
└────┬────┘
     │
┌────▼────┐
│  VRAM   │    ~300 cy      ~288 GB/s          8GB       GPU global
│ (GDDR6) │    hipMalloc allocationin此              GDDR6
└────┬────┘
     │  PCIe 4.0 x16 (~32 GB/s)  ← transferbottleneck!
┌────▼────┐
│ System  │    ~1000+ cy    ~32 GB/s           ≥16GB     CPU global
│  RAM    │    hipHostMalloc (pinned)          DDR5
└─────────┘

memory allocationstrategyselect: 
┌──────────────────┬─────────────────────┬──────────────┐
│ hipMalloc        │ GPU VRAM allocation       │ GPU computedata │
│ hipHostMalloc    │ CPU pinned allocation     │ DMA transfer缓冲│
│ hipMallocManaged │ 统一address(automaticmigration)  │ 原型development     │
└──────────────────┴─────────────────────┴──────────────┘`,
            caption: 'GPU memorylayer次structurefromregistertosystem memory, latency跨越 3 个count级. PCIe bandwidthis CPU-GPU datatransfermainbottleneck, 这is alsowhy减少datatransferis GPU performanceoptimization首to原则. ',
          },
          codeWalk: {
            title: '矩阵乘法 + LDS Tiling optimization',
            file: 'matmul_tiled.hip',
            language: 'cpp',
            code: `#include <hip/hip_runtime.h>

#define TILE_SIZE 16

/* use LDS tiling 矩阵乘法
 * C[M×N] = A[M×K] × B[K×N]
 * each Block compute C a TILE_SIZE×TILE_SIZE 子矩阵 */
__global__ void matmul_tiled(const float *A, const float *B,
                              float *C, int M, int N, int K)
{
    /* LDS inallocationtwo tile used forcache A and B 子block */
    __shared__ float tileA[TILE_SIZE][TILE_SIZE];
    __shared__ float tileB[TILE_SIZE][TILE_SIZE];

    int row = blockIdx.y * TILE_SIZE + threadIdx.y;
    int col = blockIdx.x * TILE_SIZE + threadIdx.x;
    float sum = 0.0f;

    /* 沿 K 维度分段loading tile */
    for (int t = 0; t < (K + TILE_SIZE - 1) / TILE_SIZE; t++) {
        /* 协作loading: Block 内eachthreadresponsible forloadinga元素to LDS */
        int aCol = t * TILE_SIZE + threadIdx.x;
        int bRow = t * TILE_SIZE + threadIdx.y;

        tileA[threadIdx.y][threadIdx.x] =
            (row < M && aCol < K) ? A[row * K + aCol] : 0.0f;
        tileB[threadIdx.y][threadIdx.x] =
            (bRow < K && col < N) ? B[bRow * N + col] : 0.0f;

        /* ensure tile completelyloadingafteragaincompute */
        __syncthreads();

        /* from LDS readdata做乘加 — 比from VRAM 快 30 倍 */
        for (int k = 0; k < TILE_SIZE; k++) {
            sum += tileA[threadIdx.y][k] * tileB[k][threadIdx.x];
        }

        __syncthreads();
    }

    if (row < M && col < N) {
        C[row * N + col] = sum;
    }
}

/* startup:
 * dim3 grid((N+15)/16, (M+15)/16);
 * dim3 block(16, 16);  // 256 threads per block
 * hipLaunchKernelGGL(matmul_tiled, grid, block,
 *                    0, 0, d_A, d_B, d_C, M, N, K); */`,
            annotations: [
              '__shared__ in LDS inallocationmemory — accesslatency仅 ~10 cycles, 而global memoryneed ~300 cycles',
              'TILE_SIZE=16 → each tile 16×16=256 float = 1KB, two tile 共 2KB, 远小于 64KB LDS limit',
              '__syncthreads() is Block 级 barrier — ensureallthreadcomplete LDS writeafteronly thenstartread',
              'boundarycheck (row<M && aCol<K) handle矩阵维度is not TILE_SIZE 倍数情况',
              'eachthreadfrom VRAM loading 2 个元素, 但in内layer循环infrom LDS read 2×16 = 32 次 — data复用率 16:1',
              '无 tiling version对 VRAM access量 = 2MNK, has tiling version = 2MNK/TILE_SIZE, 减少 16 倍',
            ],
            explanation: 'LDS tiling is GPU 矩阵乘法optimization经典technology. core思想islet Block 内thread协作地will A, B 小blockfrom VRAM loadingto LDS, thenfrom LDS(快 30 倍)进行actual乘加运算. TILE_SIZE=16 时each tile 2KB, LDS 总用量 4KB, 远小于 64KB  CU limit, soeach CU can容纳multiple Block meanwhileexecute. actual生产inwilluse更大 tile(如 32×32)and更complexregister tiling 进一步提高performance. ',
          },
          miniLab: {
            title: 'comparedifferentmemory allocationstrategytransferperformance',
            objective: '分别use hipMalloc+hipMemcpy, hipHostMalloc, hipMallocManaged transfer 256MB data, measure CPU→GPU transferbandwidth. ',
            steps: [
              'writetestingprogram: allocation 256MB  float 数组(64M 个元素)',
              'plan 1: malloc + hipMalloc + hipMemcpy(H2D), 用 hipEventElapsedTime 计时',
              'plan 2: hipHostMalloc(flagDefault) + hipMalloc + hipMemcpy(H2D)',
              'plan 3: hipMallocManaged, directlyin核functioninaccess(triggerautomaticmigration), measure核function首次execute时between',
              'compute每种planvalidbandwidth(GB/s)并and PCIe 4.0 x16 理论bandwidth (~32 GB/s) compare',
              'inplan 2 basicsonuse hipMemcpyAsync + 双 Stream implementationcomputeandtransfer重叠',
            ],
            expectedOutput: `预期result(RX 7600 XT, PCIe 4.0 x16): 
plan 1 (普通 malloc):  ~12 GB/s   ← has额outside staging copy
plan 2 (pinned):       ~25 GB/s   ← 接近 PCIe 理论bandwidth
plan 3 (managed):      首次 ~8 GB/s ← page fault + migration 开销大
双 Stream 重叠:        吞吐提升 30-40%`,
            hint: '用 hipEventCreate/Record/ElapsedTime 计时比 clock() 更准确, because它measureis GPU 端时between. hipMallocManaged performance很dependencyaccesspattern — if CPU and GPU 交替access同一页, performancewill严重below降(ping-pong migration). ',
          },
          debugExercise: {
            title: 'findasynchronoustransferinerror',
            language: 'cpp',
            description: 'belowcode试图用 hipMemcpyAsync implementationasynchronousdatatransfer, 但resultdata全is零. ',
            question: 'why GPU 端收todata全is零? asynchronoustransferhaswhatbefore提condition? ',
            buggyCode: `float *h_data = (float *)malloc(N * sizeof(float));  /* BUG! */
float *d_data;
hipMalloc(&d_data, N * sizeof(float));

for (int i = 0; i < N; i++) h_data[i] = 1.0f;

hipStream_t stream;
hipStreamCreate(&stream);

/* asynchronoustransfer */
hipMemcpyAsync(d_data, h_data, N * sizeof(float),
               hipMemcpyHostToDevice, stream);

/* startup核function */
hipLaunchKernelGGL(my_kernel, grid, block, 0, stream,
                   d_data, N);

hipStreamSynchronize(stream);
/* result: d_data indata全is零or垃圾! */`,
            hint: 'hipMemcpyAsync 对 host 端memoryhas特殊to求. 普通 malloc allocationmemorycanused forasynchronoustransfer吗? ',
            answer: 'error: use普通 malloc allocationmemory进行 hipMemcpyAsync. asynchronoustransferto求 host 端memorymustis pinned(页锁定)memory, through hipHostMalloc allocation. cause: hipMemcpyAsync willtransfer任务交给 GPU  DMA engine(SDMA), DMA enginethroughphysical addressdirectlyaccessmemory. 普通 malloc memorymayby OS 换出to磁盘(swap), physical addressmayintransferprocessin改变. HIP run时detectto host memory非 pinned 时, hipMemcpyAsync will退化assynchronizationoperate(先copytointernal staging buffer), 但thisprocess时序maycause核function先于datato达而execute. fix: will malloc 改as hipHostMalloc(&h_data, N * sizeof(float), hipHostMallocDefault). 教训: async API not等于 async behavior — must满足before提conditiononly thencan真正asynchronousexecute. ',
          },
          interviewQ: {
            question: 'describe GPU memorylayer次structure, andhowselect hipMalloc, hipHostMalloc and hipMallocManaged. ',
            difficulty: 'medium',
            hint: 'fromlatency/bandwidth/size/作用域describe每layermemory, thenaccording tousescenariorecommendedallocationstrategy. ',
            answer: 'GPU memorylayer次(from快to慢): (1)Register: thread私has, ~1 cycle, compilerautomaticallocationlocalvariable; (2)LDS/Shared Memory: Block shared, ~10 cycles, 64KB/CU, __shared__ explicitmanagement, used forthreadbetweendata复用(如 tiled matmul); (3)L1 Cache: CU 私has, ~20 cycles, hardwareautomaticcache; (4)L2 Cache: 全 GPU shared, ~100 cycles, RDNA3 on 32MB, isglobal memoryaccess缓冲; (5)VRAM: ~300 cycles, GPU localVRAM; (6)System RAM: ~1000+ cycles, through PCIe access. allocationstrategyselect: hipMalloc allocation VRAM — 适used for GPU 密集computedata, access最快, isdefaultselect; hipHostMalloc allocation pinned host memory — 适used for DMA transferbufferand CPU-GPU 频繁交换小data, stillavailable hipHostMallocMapped 使 GPU through PCIe 零copyaccess; hipMallocManaged allocation统一address spacememory — 适used for快速原型developmentordataaccesspatternnot规则scenario, run时through page fault automaticmigration, 但hasmigrationlatency开销. 生产codeinrecommended hipMalloc + hipHostMalloc 组合, 用 stream implementationtransferandcompute重叠. ',
            amdContext: '这道题testing你对 GPU memorysystem全面understand. interview时特别to提to RDNA3 大 L2(32MB), 这is AMD 相for NVIDIA design差异之一. ',
          },
        },
      ],
    },

    // ════════════════════════════════════════════════════════════
    // Group 8.2: performanceoptimization
    // ════════════════════════════════════════════════════════════
    {
      id: '8-2',
      number: '8.2',
      title: 'performanceoptimization',
      titleEn: 'Performance Optimization',
      icon: 'Zap',
      description: '深入understand AMD GPU  Wavefront execute模型, memory coalescingaccess规则and LDS optimizationtechnology, 并master rocprof performanceanalyzetool. ',
      lessons: [
        // ── Lesson 8.2.1 ──────────────────────────────────────
        {
          id: '8-2-1',
          number: '8.2.1',
          title: 'Wavefront execute模型andbranch divergence',
          titleEn: 'Wavefront Execution Model & Branch Divergence',
          duration: 15,
          difficulty: 'advanced',
          tags: ['wavefront', 'SIMT', 'divergence', 'occupancy', 'RDNA'],
          concept: {
            summary: 'AMD GPU 以 Wavefront as最小execute粒度 — a Wavefront in 32(Wave32)or 64(Wave64)个threadin同a SIMD 单元on锁步executesameinstruction. when if/else cause Wavefront 内thread走differentbranch时, 两条branchallmustexecute(branch divergence), 严重impactperformance. ',
            explanation: [
              'SIMT(Single Instruction, Multiple Threads)is GPU basicexecute模型. in AMD 术语in, Wavefront is一组threadinhardware SIMD 单元onsynchronizationexecute组. RDNA architecture引入双pattern: Wave32(32 thread/wavefront)and Wave64(64 thread/wavefront). Wave32 is RDNA defaultpattern, each SIMD 单元has 32 条 lane, 一条instructionina cycle 内handle 32 个threaddata; Wave64 patternbelow同一instructionneedtwo cycle complete, 但减少scheduling开销, 适合高latency容忍compute. ',
              'branch divergence(Branch Divergence)is SIMT 模型coreperformance陷阱. when Wavefront 内threadexecuteto if-else 时, if部分thread走 if branch, 其余走 else branch, GPU handleapproachis: 先execute if branch(else threadby mask 掉), againexecute else branch(if threadby mask 掉). this means Wavefront execute时betweenis两条branch总and, rather than较长branch时between. in最坏情况below(eachthread走differentbranch), SIMD 效率降至 1/32(Wave32)or 1/64(Wave64). ',
              'AMD  RDNA architectureuse EXEC mask registercontrolbranchexecute. EXEC isa 32 位(Wave32)or 64 位(Wave64)位mask, 每一位correspondinga lane. whenexecute v_cmp_gt_f32(浮点compare)等instruction时, resultwrite VCC(Vector Condition Code)register, thenthrough s_and_b32 等标量instructionupdate EXEC mask. by mask 掉 lane althoughnotgenerateactual效果(writeby抑制), 但still消耗execute cycle. forsimplecondition赋值, compilerwilluse v_cndmask instruction(predication)代替branch — 这will notgenerate分歧, becauseall lane allexecute同一条instruction. ',
              'occupancy(Occupancy)衡量 CU onactive Wavefront 数and最大may值比率. each CU resourcehas限: RDNA3 each CU 最多 16 个 Wave32(or 8 个 Wave64), 受限于 VGPR(192KB/CU, each Wave32 最多 256 个 VGPR × 32 lane × 4 bytes = 32KB), LDS(64KB/CU, Block betweenshared)and Block counton限. occupancy越高, GPU 越canthrough切换 Wavefront 隐藏memorylatency. use rocm_agent_enumerator and hipOccupancyMaxPotentialBlockSize cancompute给定核function最优 Block size. ',
            ],
            keyPoints: [
              'Wavefront = SIMD execute组: Wave32(RDNA default, 32 thread/cycle)or Wave64(64 thread/2 cycle)',
              'branch divergence使 Wavefront serialexecuteallbranchpath, EXEC mask controlwhich lane active',
              'simplecondition用 v_cndmask(predication)无分歧, complexbranch用 s_cbranch has分歧',
              'occupancy = active Wavefront / 最大 Wavefront, 受 VGPR, LDS, Block countlimit',
              '高occupancyhas助于隐藏latency, 但is not越高越好 — register压力also很important',
              '用 __builtin_amdgcn_wave_reduce_add 等内置functionimplementation Wavefront 级通信',
            ],
          },
          diagram: {
            title: 'Wavefront branch divergenceexecuteprocess',
            content: `Wavefront branch divergence示意(Wave32, 32 lanes)

code:  if (threadIdx.x < 16) { A(); } else { B(); }

Step 1: all 32 个 lane to达 if 语句
EXEC mask: 1111 1111 1111 1111 1111 1111 1111 1111
                                           ↓ compare

Step 2: execute A() branch(before 16 lane active)
EXEC mask: 0000 0000 0000 0000 1111 1111 1111 1111
           lane 31..16 by mask  lane 15..0 execute A()
           (notwriteresult)        (正常execute)
           ⏱️ 消耗时between!          ⏱️ execute A

Step 3: execute B() branch(after 16 lane active)
EXEC mask: 1111 1111 1111 1111 0000 0000 0000 0000
           lane 31..16 execute B()  lane 15..0 by mask
           ⏱️ execute B              (notwriteresult)

Step 4: branchmerge, recovercomplete EXEC mask
EXEC mask: 1111 1111 1111 1111 1111 1111 1111 1111
           all lane recoveractive

总耗时 = Time(A) + Time(B) ← rather than max(A, B)!

compare: 无分歧情况
if (blockIdx.x < gridDim.x / 2) { A(); } else { B(); }
→ 同一 Block 内allthread走同一branch → 无分歧 → 耗时 = max(A,B)

Predication optimization(compilerautomaticgenerate): 
// 源code: x = (cond) ? a : b;
// compilationas:
v_cmp_gt_f32  vcc, v0, v1       // compare, resultto VCC
v_cndmask_b32 v2, v4, v3, vcc   // according to VCC select值
// 无branch, 无分歧, 1 条instructioncomplete!`,
            caption: 'branch divergencecause Wavefront serialexecute两条path. keyoptimization: let Wavefront 内thread走samebranch, or用 predication 替代branch. ',
          },
          codeWalk: {
            title: '分歧 vs 非分歧核functionperformancecompare',
            file: 'divergence_test.hip',
            language: 'cpp',
            code: `#include <hip/hip_runtime.h>

/* hasbranch divergence核function
 * Wavefront 内奇偶thread走differentpath */
__global__ void divergent_kernel(float *out, const float *in, int n)
{
    int idx = blockIdx.x * blockDim.x + threadIdx.x;
    if (idx >= n) return;

    /* threadIdx.x in Wavefront 内iscontiguous
     * 奇数偶数thread交替 → each Wavefront all分歧! */
    if (threadIdx.x % 2 == 0) {
        out[idx] = sinf(in[idx]) * cosf(in[idx]);
        out[idx] += sqrtf(fabsf(in[idx]));
    } else {
        out[idx] = expf(in[idx]) * logf(fabsf(in[idx]) + 1.0f);
        out[idx] += rsqrtf(fabsf(in[idx]) + 1.0f);
    }
}

/* 无branch divergence核function
 * 同一 Wavefront 内allthread走samepath */
__global__ void nondivergent_kernel(float *out, const float *in,
                                     int n)
{
    int idx = blockIdx.x * blockDim.x + threadIdx.x;
    if (idx >= n) return;

    /* 用 blockIdx.x rather than threadIdx.x branch
     * 同一 Block thread走samepath → 无分歧 */
    if (blockIdx.x % 2 == 0) {
        out[idx] = sinf(in[idx]) * cosf(in[idx]);
        out[idx] += sqrtf(fabsf(in[idx]));
    } else {
        out[idx] = expf(in[idx]) * logf(fabsf(in[idx]) + 1.0f);
        out[idx] += rsqrtf(fabsf(in[idx]) + 1.0f);
    }
}

/* use predication(无branch)核function */
__global__ void predicated_kernel(float *out, const float *in,
                                   int n)
{
    int idx = blockIdx.x * blockDim.x + threadIdx.x;
    if (idx >= n) return;

    float val = in[idx];
    float r1 = sinf(val) * cosf(val) + sqrtf(fabsf(val));
    float r2 = expf(val) * logf(fabsf(val) + 1.0f)
               + rsqrtf(fabsf(val) + 1.0f);

    /* 三元运算符usuallycompilationas v_cndmask → 无分歧 */
    out[idx] = (threadIdx.x % 2 == 0) ? r1 : r2;
}

/* compilation: hipcc -O2 divergence_test.hip -o divergence_test
 * 预期: divergent 比 nondivergent 慢 ~40-80% */`,
            annotations: [
              'threadIdx.x % 2 in Wavefront 内交替 0/1 → 保证each Wavefront all分歧',
              'blockIdx.x % 2 letentire Block 走同一branch → Wavefront internalnot分歧',
              '分歧versionneedexecute sinf+cosf+sqrtf and expf+logf+rsqrtf 两套compute, 非分歧version只execute其一',
              'predication version两套allcompute, 但用 v_cndmask selectresult — 无branch开销, 适合两路work量接近情况',
              '-O2 optimizationlevelbelowcompilerwilltryautomaticconvertsimplebranchas predication',
              'sinf/expf 等超越functionin RDNA3 on由 SFU(特殊function单元)execute, latency较高',
            ],
            explanation: '这三个核functiondemonstratebranch divergenceperformanceimpactandoptimizationstrategy. divergent_kernel ineach Wavefront allhas一半thread空转; nondivergent_kernel throughwillbranch粒度提升to Block 级消除分歧; predicated_kernel 则computetworesultafterselect, avoidbranch. actualdevelopmentin应优先考虑重组dataor算法使 Wavefront 内thread走samepath, second考虑 predication. ',
          },
          miniLab: {
            title: 'measurebranch divergenceperformance代价',
            objective: 'compilationrunthe above三个核function, 用 hipEvent measure耗时差异, 用 rocprof observe SIMD 利用率. ',
            steps: [
              'compilation divergence_test.hip: hipcc -O2 divergence_test.hip -o divergence_test',
              '对 N=16M 分别run三个核function, each重复 100 次取平均, 用 hipEvent 计时',
              'record三者execute时betweenand相对差异',
              '用 rocprof --stats ./divergence_test view核functionlevel耗时statistics',
              '用 rocprof -i counters.txt ./divergence_test collect SQ_WAVES and SQ_INSTS_VALU count器',
              'computeeach Wavefront 平均 VALU instruction数, compare分歧and非分歧version',
            ],
            expectedOutput: `预期result (N=16M, RX 7600 XT):
divergent_kernel:    ~2.8 ms  (100%)
nondivergent_kernel: ~1.6 ms  (~57%, 快 43%)
predicated_kernel:   ~2.2 ms  (~79%)

SQ_INSTS_VALU (per wavefront):
divergent:    ~48 instructions (execute两条path)
nondivergent: ~28 instructions (只execute一条path)`,
            hint: 'create counters.txt 内容as "pmc: SQ_WAVES SQ_INSTS_VALU SQ_INSTS_SALU", thenrun rocprof -i counters.txt ./divergence_test. if rocprof 报错, ensure ROCm install rocprofiler component. ',
          },
          debugExercise: {
            title: '识别隐藏branch divergence',
            language: 'cpp',
            description: 'below核function看起no if-else, 但actualonexist严重branch divergence. ',
            question: 'thiscodeinbranch divergencein哪inside? whynot容易find? ',
            buggyCode: `__global__ void hidden_divergence(float *out, const float *in,
                                  int n)
{
    int idx = blockIdx.x * blockDim.x + threadIdx.x;
    if (idx >= n) return;

    float val = in[idx];

    /* 看起no if-else, 但... */
    for (int i = 0; i < (int)val; i++) {  /* BUG: 循环次数dependencydata! */
        val = sqrtf(val);
    }

    out[idx] = val;
}
/* if in[] = {1.0, 100.0, 2.0, 50.0, ...}
 * differentthread循环次数差异巨大! */`,
            hint: '循环is also一种branch — 循环conditionnot满足时跳出, 满足时continue. if Wavefront 内thread循环次数differentwill怎样? ',
            answer: '分歧in for 循环in. 循环本质is "if (condition) goto loop_body; else goto loop_exit;" — each time迭代end时checkconditionisoncebranch决策. when Wavefront 内differentthread循环次数different时(because val different), 先endthreadmustwait最慢threadcompleteall迭代. if in[] 值range很大(如 1 to 100), entire Wavefront execute时between取决于最大值thread循环次数, otherthread空转wait. 这种"隐藏分歧"比explicit if-else 更难find, becausecode表面onnoconditionbranch. fixstrategy: (1)预handledata使同一 Wavefront 内值range接近(排序afteragainhandle); (2)set最大迭代次数limit; (3)用parse公式替代迭代(如 val = pow(val, 1.0/pow(2,n))). 这is GPU programmingin最隐蔽performance杀手之一. ',
          },
          interviewQ: {
            question: 'explain AMD GPU  Wavefront execute模型, Wave32 and Wave64 difference, andbranch divergencehowimpactperformance. ',
            difficulty: 'hard',
            hint: 'from SIMT 模型入手, explain EXEC mask mechanism, compare Wave32/64 优劣, 给出avoid分歧actualstrategy. ',
            answer: 'AMD GPU use SIMT 模型, 以 Wavefront as最小schedulingandexecute单位. RDNA architecturesupport两种pattern: Wave32(32 thread/wavefront, a SIMD cycle handle完)and Wave64(64 thread, need 2 cycles 但scheduling开销减半). Wave32 优势: branch divergenceimpact更小(最坏 1/32 vs 1/64 效率), latency更低(一条instructionhandle完canemitbelow一条); Wave64 优势: scheduling开销更低(每 CU management wavefront 更少), 对高latency容忍memory密集型任务更has利. branch divergencemechanism: when if-else cause Wavefront 内thread走differentpath时, GPU use EXEC register(32/64 位mask)依次 mask execute两条path, 总时between = Time(if) + Time(else). EXEC mask 由标量compareinstruction(s_cmp)and向量compareinstruction(v_cmp)set, VCC registersavecompareresult. avoid分歧strategy: (1)letbranch粒度alignmentto Wavefront size(用 blockIdx rather than threadIdx branch); (2)对data排序使相邻threadhandle相似data; (3)use predication(v_cndmask)替代branch; (4)willdifferentwork负载拆分todifferent核function. ',
            amdContext: 'Wave32/Wave64 is AMD 特hasinterview考点. NVIDIA 固定use 32 thread/warp, 而 AMD 灵活性意味着development者needaccording towork负载featureselectpattern(hipcc -mwavefrontsize64 ordefault Wave32). ',
          },
        },

        // ── Lesson 8.2.2 ──────────────────────────────────────
        {
          id: '8-2-2',
          number: '8.2.2',
          title: 'memory coalescingaccessand LDS optimization',
          titleEn: 'Memory Coalescing & LDS Optimization',
          duration: 15,
          difficulty: 'advanced',
          tags: ['coalescing', 'memory-access', 'LDS', 'bank-conflict', 'AoS-SoA'],
          concept: {
            summary: 'GPU global memory(VRAM)accessperformance严重dependencyaccesspattern — contiguousaddressmergeaccess(coalesced access)can达to接近峰值bandwidth, 而随机or跨步accessperformancemaybelow降 10 倍above. LDS 同样exist bank conflict issue. mastermemory coalescing规则and LDS optimizationis GPU performance调优core. ',
            explanation: [
              'globalmemory coalescing(Memory Coalescing)is GPU memorysystemcoreoptimizationmechanism. when Wavefront inthreadaccessaddressiscontiguous且alignment时, GPU canwilltheserequestmerge(coalesce)as少量 128 bytescache行request. for example, 32 个thread各reada 4 bytes float, ifaddresscontiguous(thread 0 读 addr, thread 1 读 addr+4, ...), 只need 1 个 128 bytescache行request. 反之, if 32 个thread各readnotcontiguousaddress, mayneed 32 个independentcache行request — bandwidth利用率only 1/32. ',
              'common非mergeaccesspattern: (1)跨步access(Strided Access): eachthreadread stride>1 address(如二维数组按列traverse), stride 越大performance越差; (2)随机access(Random Access): through索引数组between接access, completelyunable toprediction; (3)AoS(Array of Structures)布局: structure体数组in, 同一字段datainmemoryinnotcontiguous. and AoS 相对is SoA(Structure of Arrays)布局: each字段单独存a数组, 同一字段datacontiguous存放, 天然适合mergeaccess. ',
              'LDS(Local Data Share)iseach CU 内高速canprogrammingmemory(RDNA3 每 CU 64KB), accesslatency约 10 cycles. LDS by组织as 32 个 bank, each bank 4 bytes宽. when同a cycle 内multiplethreadaccess同a bank differentaddress时, 发生 bank conflict — theseaccessmustserial化. for example, 32 个threadallaccess bank 0 different行, is 32-way bank conflict, latency增加 32 倍. avoid bank conflict key: ensure同一 Wavefront 内相邻threadaccessdifferent bank. ',
              'actualoptimizationin LDS tiling + padding technology: in矩阵转置or tiled 矩阵乘法in, fromglobal memory按行loadingto LDS tile after, if按列read LDS willgenerate bank conflict(because矩阵一行corresponding bank 编号same). resolvemethodis给 LDS 数组行末尾add padding(如 __shared__ float tile[TILE][TILE+1]), 使每行offseta bank, from而let列access跨越different bank. this +1 padding 技巧is GPU programmingin经典optimization. ',
              '归约(Reduction)is GPU programminginbasicparallelpattern — will数组all元素through某个operate(加法, 最大值等)缩减asa值. LDS 归约最佳实践: in Block 内use LDS save部分result, through __syncthreads() synchronizationafter逐步merge. keyoptimization: (1)avoid bank conflict: in每一步inletdifferentthreadaccessdifferent bank; (2)avoid分歧: activethreadshouldcontiguous(用 tid < stride rather than tid % (2*stride) == 0); (3)use warp-level 原语(如 __shfl_down)in Wavefront 内notneed LDS can归约. ',
            ],
            keyPoints: [
              'mergeaccess: 相邻threadaccesscontiguousaddress → 少量cache行request → 接近峰值bandwidth',
              '跨步/随机access: multiplecache行request → bandwidth利用率maybelow降 10-32 倍',
              'AoS → SoA convertis最simplevalidmergeoptimization — GPU code优先use SoA 布局',
              'LDS bank conflict: 同一 cycle access同一 bank differentaddress → serial化',
              'Padding 技巧(tile[N][N+1])消除列access bank conflict',
              '归约optimization: contiguousthreadactive + LDS 无 conflict + Wavefront 级 shuffle',
            ],
          },
          diagram: {
            title: 'mergeaccess vs 跨步accessmemory事务compare',
            content: `memory coalescingaccess vs 跨步access

scenario: 32 个thread(Wave32)各read 1 个 float (4 bytes)

═══ mergeaccess (Coalesced) ═══
Thread:   0    1    2    3    4   ...   31
Address: [0]  [4]  [8]  [12] [16] ... [124]
          └────────────────────────────┘
          contiguous 128 bytes → 1 个cache行request
          bandwidth效率: 128/128 = 100%

═══ Stride-2 跨步access ═══
Thread:   0    1    2    3    4   ...   31
Address: [0]  [8]  [16] [24] [32] ... [248]
          └─────────┘└─────────┘
          2 个cache行, each只用一半
          bandwidth效率: 128/256 = 50%

═══ Stride-32 跨步access (列access) ═══
Thread:   0      1      2     ...   31
Address: [0]   [128]  [256]  ... [3968]
          ↓      ↓      ↓           ↓
         行0    行1    行2   ...  行31  (各自independentcache行!)
          32 个cache行request!
          bandwidth效率: 128/4096 ≈ 3%

═══ AoS vs SoA ═══

AoS (Array of Structures):          SoA (Structure of Arrays):
struct { float x,y,z,w; } p[N];     struct { float x[N]; float y[N];
                                              float z[N]; float w[N]; } p;
memory: [x0 y0 z0 w0 x1 y1 z1 w1..]  memory: [x0 x1 x2 ... | y0 y1 y2 ...]

readall x:                          readall x:
Thread 0: p[0].x → addr 0           Thread 0: p.x[0] → addr 0
Thread 1: p[1].x → addr 16  (跳4)   Thread 1: p.x[1] → addr 4  (contiguous!)
→ stride-4 跨步, 效率 ~25%           → mergeaccess, 效率 100%`,
            caption: 'memory coalescing规则core: 相邻threadaccess相邻address. AoS 布局天然is跨步access, SoA 布局天然ismergeaccess. GPU codeshould优先use SoA data布局. ',
          },
          codeWalk: {
            title: 'mergeaccess vs 跨步accessperformancecompare',
            file: 'coalescing_test.hip',
            language: 'cpp',
            code: `#include <hip/hip_runtime.h>

/* mergeaccess: 相邻threadaccess相邻address */
__global__ void coalesced_read(float *out, const float *in, int n)
{
    int idx = blockIdx.x * blockDim.x + threadIdx.x;
    if (idx < n)
        out[idx] = in[idx] * 2.0f;  /* in[0], in[1], in[2], ... */
}

/* 跨步access: 相邻threadaccess隔 STRIDE 个元素address */
__global__ void strided_read(float *out, const float *in,
                              int n, int stride)
{
    int idx = blockIdx.x * blockDim.x + threadIdx.x;
    /* willthreadmappingto跨步location */
    int mapped = (idx % stride) * (n / stride) + (idx / stride);
    if (mapped < n)
        out[mapped] = in[mapped] * 2.0f;
}

/* 用 LDS implementation矩阵转置(带 padding 消除 bank conflict) */
#define TILE 32
__global__ void transpose_optimized(float *out, const float *in,
                                     int width, int height)
{
    /* +1 padding avoid列read时 bank conflict! */
    __shared__ float tile[TILE][TILE + 1];

    int xIdx = blockIdx.x * TILE + threadIdx.x;
    int yIdx = blockIdx.y * TILE + threadIdx.y;

    /* 按行readinput → mergeaccess */
    if (xIdx < width && yIdx < height)
        tile[threadIdx.y][threadIdx.x] = in[yIdx * width + xIdx];

    __syncthreads();

    /* 按列read LDS(because padding, 无 bank conflict)
     * 按行writeoutput → mergeaccess */
    xIdx = blockIdx.y * TILE + threadIdx.x;
    yIdx = blockIdx.x * TILE + threadIdx.y;

    if (xIdx < height && yIdx < width)
        out[yIdx * height + xIdx] = tile[threadIdx.x][threadIdx.y];
}

/* 无 padding version (has bank conflict):
 * __shared__ float tile[TILE][TILE];  // 无 +1
 * tile[threadIdx.x][threadIdx.y] 时:
 *   thread 0 access bank 0 (addr 0)
 *   thread 1 access bank 0 (addr 32*4=128)  ← 同一 bank!
 *   → 32-way bank conflict! */`,
            annotations: [
              'coalesced_read: in[idx] in idx in Wavefront 内contiguous → 1 次 128B request → 最高效',
              'strided_read: mapped addressin Wavefront 内notcontiguous → 多次cache行request → 低效',
              'TILE+1 padding: tile[32][33] rather than tile[32][32], 使每行offset 1 个 bank',
              'not加 padding 时列read tile[threadIdx.x][threadIdx.y]: thread 0,1,2.. 读 bank 0,0,0.. → 32-way conflict',
              '加 padding after: thread 0 读 bank 0, thread 1 读 bank 1, ... → 无 conflict',
              '转置global memory读写allismerge(按行), 非merge列变换in LDS incomplete',
            ],
            explanation: '矩阵转置ismemory coalescingoptimization经典案例. directly转置(in[j*W+i] → out[i*H+j])to么读notmergeto么写notmerge. use LDS tile 作asinbetween缓冲: 先按行mergereadto LDS, againfrom LDS 按列read并merge写出. +1 padding is消除 LDS bank conflict standard技巧 — 多付出 1/32  LDS 空between, 换 32 倍 bank conflict 消除. ',
          },
          miniLab: {
            title: '量化memory coalescing对bandwidthimpact',
            objective: 'comparedifferent stride 值belowglobal memoryreadvalidbandwidth, 绘制 stride-bandwidth 曲线. ',
            steps: [
              'writetestingprogram: N=64M floats, 分别用 stride=1,2,4,8,16,32 read',
              '用 hipEventElapsedTime 计时, computevalidbandwidth = data量 / 耗时 (GB/s)',
              '绘制 stride vs bandwidth 曲线(or打印表格)',
              'comparemergereadbandwidthand理论 VRAM bandwidth(RX 7600 XT ~288 GB/s)',
              'implementation带 padding andnot带 padding  LDS 矩阵转置, compare 4096×4096 矩阵performance',
              '用 rocprof collect TCC_HIT(L2 cache命in率)count器verifymerge效果',
            ],
            expectedOutput: `预期validbandwidth (RX 7600 XT):
Stride 1:   ~250 GB/s (87% 峰值)
Stride 2:   ~150 GB/s (52%)
Stride 4:   ~80 GB/s  (28%)
Stride 8:   ~45 GB/s  (16%)
Stride 16:  ~25 GB/s  (9%)
Stride 32:  ~15 GB/s  (5%)  ← eachthreadacache行!

LDS 转置 (4096×4096):
无 padding: ~150 GB/s
has padding: ~240 GB/s  ← ~60% 提升!`,
            hint: 'ensuredata量足够大(>64MB)以消除startup开销impact. use hipDeviceSynchronize ensure计时准确. L2 cache效果will掩盖部分 stride impact — can用远大于 L2 data集observe纯 VRAM accessperformance. ',
          },
          debugExercise: {
            title: 'find LDS in bank conflict',
            language: 'cpp',
            description: 'below矩阵转置codeuse LDS, 但performance远低于预期. ',
            question: 'thiscodehaswhat LDS accessperformanceissue? howfix? ',
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
        /* 按列read LDS → 32-way bank conflict! */
        out[y * H + x] = tile[threadIdx.x][threadIdx.y];
}`,
            hint: 'LDS has 32 个 bank, 每 4 bytesa bank. tile[32][32] in, 同一列all元素mappingto同a bank. ',
            answer: 'issue: tile[threadIdx.x][threadIdx.y] 按列read LDS generate 32-way bank conflict. LDS  32 个 bank 按address addr%128/4(i.e. addr/4 % 32)allocation. tile[32][32] in一行is 32×4=128 bytes, 恰好is 32 个 bank complete周期. therefore tile[0][j], tile[1][j], ...tile[31][j] allmappingto同a bank(bank j). when threadIdx.x=0..31 meanwhileaccess tile[0..31][threadIdx.y] 时, all 32 个requestallto同a bank → mustserial化, latency增加 32 倍. fix: will声明改as __shared__ float tile[TILE][TILE+1], i.e. tile[32][33]. 这样一行is 33×4=132 bytes, tile[i][j] and tile[i+1][j] notagainin同a bank(offset 1 个 bank). 额outside空between开销only 32×4=128 bytes(+3%), 但performance提升can达 30-60%. ',
          },
          interviewQ: {
            question: 'explain GPU memory coalescing(coalescing)规则, and AoS vs SoA data布局对 GPU performanceimpact. ',
            difficulty: 'hard',
            hint: 'fromcache行size, Wavefront accesspattern, bandwidth利用率角度explainmerge规则, thencompare AoS/SoA accesspattern. ',
            answer: 'memory coalescing规则: GPU global memorycontroller以cache行(usually 128 bytes, RDNA on按 64 bytes sector handle)as粒度access VRAM. whena Wavefront  32 个threadmeanwhile发起memoryrequest时, memory controllerwillchecktheseaddresswhether落in少量contiguouscache行in. if 32 个thread各读 4 bytes float, addresscontiguousalignment, 则只need 1 个 128 bytescache行事务 — 这is完美merge, bandwidth利用率 100%. ifaddressscatterto N 个cache行in, need N 次事务, each timeonly部分datahas用 — bandwidth利用率降至 1/N. AoS vs SoA: AoS(struct{float x,y,z;} arr[N])inmemoryin布局is [x0,y0,z0,x1,y1,z1,...]. when GPU threadparallelreadall粒子 x 坐标时, stride=3(每隔 12 bytes), bandwidth利用率only ~33%. SoA(struct{float x[N]; float y[N]; float z[N];})布局is [x0,x1,x2,...|y0,y1,y2,...], readall x 时addresscontiguous, 完美merge. GPU code应始终优先use SoA orblending布局(AoSoA: 小组 SoA then组between AoS, 兼顾cachelocal性andmerge). ',
            amdContext: '这is GPU performanceoptimizationcore知识. AMD interviewinwill结合specificscenario(如粒子simulate, 图像handle)问howoptimizationmemoryaccesspattern. can提to RDNA  64 bytes sector and L2 cache行asis加分项. ',
          },
        },

        // ── Lesson 8.2.3 ──────────────────────────────────────
        {
          id: '8-2-3',
          number: '8.2.3',
          title: 'rocprof performanceanalyze实战',
          titleEn: 'rocprof Performance Profiling in Practice',
          duration: 15,
          difficulty: 'advanced',
          tags: ['rocprof', 'profiling', 'hardware-counters', 'hsa-trace', 'performance'],
          concept: {
            summary: 'rocprof is AMD ROCm 官方 GPU performanceanalyzetool — 它cancollect核functionexecutestatistics, hardwareperformancecount器(如 SIMD 利用率, cache命in率, memorybandwidth)and HSA API tracing. master rocprof isdiagnoseandoptimization HIP programperformancekeyskill. ',
            explanation: [
              'rocprof has三种mainusepattern: (1)--stats pattern: outputeach核functioncall次数, 总耗时, 平均耗时, 最大/最小耗时. 这isperformanceanalyze起点 — 先find最耗时核function, again深入analyze; (2)-i input.txt pattern: throughinputfile指定tocollecthardwareperformancecount器(Hardware Performance Counters), GPU 内置数百个count器监控各个hardware单元活动; (3)--hsa-trace pattern: tracing HSA Runtime API call(memory allocation, 核functionstartup, datatransfer), generate时between线can视化data. ',
              'AMD GPU hardwarecount器overwriteallkeyperformance指标: SQ_WAVES(Shader Sequencer 分发 Wavefront count) — 反映 GPU compute利用率; SQ_INSTS_VALU(execute向量 ALU instruction数) — 反映compute密度; TCC_HIT / TCC_MISS(L2 cache命in/not yet命in数) — 反映memoryaccess效率; TA_FLAT_READ_WAVEFRONTS / TA_FLAT_WRITE_WAVEFRONTS(global memory读写事务数) — 反映memorybandwidth利用; SQ_WAIT_INST_ANY(waitinstruction cycle 数) — 反映memorylatencyimpact. ',
              'use rocprof standardwork流: 第一步, run rocprof --stats ./my_program get核functionlevel耗时分布; 第二步, 针对最耗时核function, write input.txt 指定count器(如 pmc: SQ_WAVES TCC_HIT TCC_MISS), run rocprof -i input.txt ./my_program; 第三步, analyzecount器datacomputekey指标: L2 命in率 = TCC_HIT / (TCC_HIT + TCC_MISS), VALU 利用率 = SQ_INSTS_VALU / (SQ_WAVES × 理论每 wavefront instruction数), validmemorybandwidth = (读写bytes数) / 核function耗时; 第四步, according tobottlenecktypeselectoptimization方向: if VALU 利用率高但 TCC_MISS 多 → optimizationmemoryaccesspattern; if VALU 利用率低但 SQ_WAIT 高 → 提高occupancyoruseprefetch. ',
              '--hsa-trace generatetracingdatacan导出as Chrome Tracing format(JSON), 用 chrome://tracing or Perfetto 打开, can视化 CPU-GPU 时between线: 看to核function之betweenbetween隔(launch overhead), datatransferandcompute重叠情况, 多 Stream parallel度. 这对diagnose"GPU 利用率低"issue非常valid — usuallyis CPU 端准备data太慢or核function launch 太频繁cause GPU idle. ',
              'rocprof advancedfunction: --timestamp on inoutputincontain纳秒级时between戳; --basenames on displayfunction名rather than mangled 符号; canthrough ROCP_METRICS environmentvariable查询allavailablecount器(rocprof --list-basic and rocprof --list-derived). notehardwarecount器hascollectlimit — each timerun最多meanwhilecollect 4-8 个basicscount器(受 SPM hardwarelimit), if input.txt in指定更多, rocprof willautomatic分多次run(multi-pass), 总时betweenwill增加. ',
            ],
            keyPoints: [
              'rocprof --stats: 核function级耗时statistics, findhotspotfunction',
              'rocprof -i input.txt: collecthardwarecount器(SQ_WAVES, TCC_HIT, SQ_INSTS_VALU 等)',
              'rocprof --hsa-trace: HSA API tracing, generate时between线data',
              'L2 命in率 = TCC_HIT / (TCC_HIT + TCC_MISS), 低命in率 → optimizationmemoryaccesspattern',
              'count器each time最多meanwhilecollect 4-8 个(hardwarelimit), exceedwill multi-pass',
              'rocprof --list-basic viewallavailablebasicscount器, --list-derived view派生指标',
            ],
          },
          diagram: {
            title: 'rocprof performanceanalyzework流',
            content: `rocprof performanceanalyzecompletework流

Step 1: findhotspot核function
─────────────────────
$ rocprof --stats ./my_program

output results.stats.csv:
┌──────────────────┬───────┬──────────┬──────────┐
│ KernelName       │ Calls │ TotalNs  │ AvgNs    │
├──────────────────┼───────┼──────────┼──────────┤
│ matmul_tiled     │  100  │ 85000000 │  850000  │ ← 85% 时between!
│ vector_add       │  100  │  5000000 │   50000  │
│ reduce_sum       │  100  │ 10000000 │  100000  │
└──────────────────┴───────┴──────────┴──────────┘

Step 2: 针对hotspotcollectcount器
─────────────────────────
input.txt:
  pmc: SQ_WAVES SQ_INSTS_VALU TCC_HIT TCC_MISS

$ rocprof -i input.txt ./my_program

output input.csv:
┌──────────────┬──────────┬────────────┬─────────┬──────────┐
│ KernelName   │ SQ_WAVES │SQ_INSTS_VALU│TCC_HIT │TCC_MISS │
├──────────────┼──────────┼────────────┼─────────┼──────────┤
│ matmul_tiled │  32768   │  4194304   │ 1200000 │  800000  │
└──────────────┴──────────┴────────────┴─────────┴──────────┘

Step 3: analyze指标
───────────────
L2 命in率 = 1200000 / (1200000+800000) = 60%  ← 偏低!
VALU/Wave = 4194304 / 32768 = 128 instruction/wave   ← compute密度
→ bottleneck: memoryaccess效率 → optimization: 增大 tile, 改善merge

Step 4: HSA 时between线analyze
────────────────────
$ rocprof --hsa-trace ./my_program
→ output results.json, 用 chrome://tracing 打开

CPU Timeline: ──launch──wait──launch──wait──launch──
GPU Timeline: ─────────[kernel]────[kernel]─────────
                       ↑                   ↑
                       GPU idle!           GPU idle!
→ issue: launch between隔太大 → optimization: use stream, 减少synchronization`,
            caption: 'rocprof standardwork流: 先找hotspot(--stats), againcollectcount器(-i), thenanalyzebottleneck, finally用时between线(--hsa-trace)check CPU-GPU 协作效率. ',
          },
          codeWalk: {
            title: 'rocprof input.txt count器configurationfile详解',
            file: 'rocprof_configs/input.txt',
            language: 'text',
            code: `# rocprof hardwarecount器configurationfile
# usemethod: rocprof -i input.txt ./my_program
# output: input.csv (each核function一行, 列as指定count器值)

# ────────────────────────────────────────────────
# basicscount器组 1: compute利用率
# note: 每行 pmc notexceed 4-8 个count器 (hardwarelimit)
# ────────────────────────────────────────────────
pmc: SQ_WAVES SQ_INSTS_VALU SQ_INSTS_SALU SQ_WAIT_INST_ANY
# SQ_WAVES:          分发 Wavefront 总数
# SQ_INSTS_VALU:     execute向量 ALU instruction数
# SQ_INSTS_SALU:     execute标量 ALU instruction数
# SQ_WAIT_INST_ANY:  wait(stall) cycle 数

# ────────────────────────────────────────────────
# basicscount器组 2: cache效率
# ────────────────────────────────────────────────
pmc: TCC_HIT TCC_MISS TCC_EA_RDREQ TCC_EA_WRREQ
# TCC_HIT:       L2 cache命in次数
# TCC_MISS:      L2 cachenot yet命in次数
# TCC_EA_RDREQ:  sendto VRAM 读request数
# TCC_EA_WRREQ:  sendto VRAM 写request数

# ────────────────────────────────────────────────
# basicscount器组 3: memorybandwidth
# ────────────────────────────────────────────────
pmc: TA_FLAT_READ_WAVEFRONTS TA_FLAT_WRITE_WAVEFRONTS
# TA_FLAT_READ_WAVEFRONTS:  global memory读事务(per wavefront)
# TA_FLAT_WRITE_WAVEFRONTS: global memory写事务(per wavefront)

# ────────────────────────────────────────────────
# use range 过滤specific核function (can选)
# ────────────────────────────────────────────────
# range: 0:1
# 只analyze第 0 to第 1 次核functioncall

# ────────────────────────────────────────────────
# 派生指标 (rocprof --list-derived viewcompletelist)
# ────────────────────────────────────────────────
# pmc: VALUUtilization VALUBusy L2CacheHit MemUnitBusy
# theseis rocprof frombasicscount器compute得to百分比指标

# ────────────────────────────────────────────────
# completeanalyzecommandexample:
# ────────────────────────────────────────────────
# 1) 核functionstatistics:
#    rocprof --stats ./my_program
#
# 2) hardwarecount器:
#    rocprof -i input.txt ./my_program
#
# 3) HSA API tracing:
#    rocprof --hsa-trace ./my_program
#
# 4) generate Chrome Tracing format:
#    rocprof --hsa-trace --timestamp on ./my_program
#    → 用 chrome://tracing 打开 results.json
#
# 5) viewallavailablecount器:
#    rocprof --list-basic    (basicshardwarecount器)
#    rocprof --list-derived  (派生指标)`,
            annotations: [
              'each pmc: 行define一组tomeanwhilecollectcount器, multiple pmc: 行willcause multi-pass(programrun多次)',
              'SQ(Shader Sequencer)count器反映compute pipelinestate — SQ_WAVES is最basicactive度指标',
              'TCC(Texture Cache Controller, i.e. L2)count器反映cache效率 — 命in率低意味着memoryaccesspattern差',
              'TA(Texture Addresser)count器反映global memory事务数 — andmergeaccess效率directlyrelated',
              'range: 过滤器can只analyzespecific核functioncall, 减少噪声',
              '派生指标(如 VALUUtilization)is rocprof frombasicscount器automaticcompute百分比, 更直观',
            ],
            explanation: 'this input.txt demonstrate rocprof count器configurationcompleteformat. inactualperformanceanalyzein, 你usuallyneed分三组collectcount器(compute, cache, memory), then综合analyzebottleneck. key指标: L2 命in率 = TCC_HIT/(TCC_HIT+TCC_MISS) 反映memoryaccesslocal性; VALU instruction数/Wavefront 数 反映compute密度; SQ_WAIT 比例反映 stall 程度. AMD  GPU has数百个hardwarecount器, rocprof --list-basic can列出your GPU supportallcount器. ',
          },
          miniLab: {
            title: '用 rocprof analyze matrix multiply performance',
            objective: '对beforeimplementation tiled and naive 矩阵乘法分别run rocprof, comparekeyperformance指标. ',
            setup: `# ensure rocprof available
which rocprof  # shouldin /opt/rocm/bin/rocprof

# createcount器configurationfile
cat > counters.txt << 'EOF'
pmc: SQ_WAVES SQ_INSTS_VALU TCC_HIT TCC_MISS
EOF`,
            steps: [
              'writemeanwhilecontain naive and tiled 矩阵乘法program, 矩阵size 2048×2048',
              'run rocprof --stats ./matmul get核function耗时compare',
              'run rocprof -i counters.txt ./matmul collecthardwarecount器',
              'compute naive and tiled version L2 命in率and VALU 效率',
              'run rocprof --hsa-trace --timestamp on ./matmul generate时between线',
              '打开 chrome://tracing 导入 results.json, observe核functionexecute时between线',
            ],
            expectedOutput: `$ rocprof --stats ./matmul
Name            Calls   TotalDurationNs   AverageNs
matmul_naive    1       45000000          45000000   ← 45ms
matmul_tiled    1       8500000           8500000    ← 8.5ms (5.3x faster!)

$ rocprof -i counters.txt ./matmul (简化):
               SQ_WAVES  SQ_INSTS_VALU  TCC_HIT   TCC_MISS
matmul_naive   131072    67108864       500000    1500000   ← L2命in率 25%
matmul_tiled   131072    67108864       1600000   400000    ← L2命in率 80%!`,
            hint: 'if rocprof 报 "permission denied", need sudo orwilluseradd video 组. ifcount器值全is 0, confirm GPU whethersupport该count器(rocprof --list-basic | grep SQ_WAVES). different GPU architecturesupportcount器名may略hasdifferent. ',
          },
          debugExercise: {
            title: 'analyze rocprof outputdiagnoseperformancebottleneck',
            language: 'text',
            description: 'belowis rocprof 对a核functioncount器output. diagnose该核functionperformancebottleneck. ',
            question: 'according tothesecount器data, 该核functionmainbottleneckiswhat? howoptimization? ',
            buggyCode: `rocprof output (核function: particle_update, N=1M 粒子):

Duration:         12.5 ms
SQ_WAVES:         32768
SQ_INSTS_VALU:    524288    (16 VALU insts/wave)
SQ_INSTS_SALU:    65536     (2 SALU insts/wave)
SQ_WAIT_INST_ANY: 98304000  (3000 wait cycles/wave!)
TCC_HIT:          50000
TCC_MISS:         950000    (L2 命in率仅 5%!)
TA_FLAT_READ_WAVEFRONTS:  512000

/* 核functioncode (简化): */
struct Particle { float x, y, z, vx, vy, vz, mass, temp; };

__global__ void particle_update(Particle *particles, int n) {
    int idx = blockIdx.x * blockDim.x + threadIdx.x;
    if (idx < n) {
        particles[idx].x += particles[idx].vx * dt;
        particles[idx].y += particles[idx].vy * dt;
        particles[idx].z += particles[idx].vz * dt;
    }
}`,
            hint: 'observetwokey指标: L2 命in率(5%)and SQ_WAIT_INST_ANY(3000 cycles/wave). again看data布局 — Particle is AoS structure体. ',
            answer: 'bottleneckdiagnose: 该核functionis严重memorybottleneck(memory-bound). 证据: (1)SQ_WAIT_INST_ANY = 3000 cycles/wave 极高, indicate大量时betweeninwaitmemory; (2)TCC_MISS 命in率仅 5%(50000/(50000+950000)), L2 cache几乎invalid; (3)VALU instructiononly 16/wave, compute量很小. 根本causeis AoS data布局 — Particle structure体 8 个 float = 32 bytes, 但核function只读写 x/y/z/vx/vy/vz 这 6 个字段. 相邻threadaccess相邻 Particle 时, stride=32 bytes, each timecache行loadingonly 6/8=75% datahas用, 且 stride>4 causenot完美merge. 更keyis L2 cache命in率极低 — each Particle 只byaccessonce, unable to复用. optimizationplan: (1)will AoS 改as SoA: float x[N], y[N], z[N], vx[N], vy[N], vz[N] — mergeaccess且只loadingneed字段; (2)预期效果: bandwidth利用率from ~25% 提升to接近 100%, SQ_WAIT 大幅below降, 整体提速 3-4 倍. ',
          },
          interviewQ: {
            question: 'describe你use rocprof analyzeandoptimization HIP 核functionperformanceworkprocess. ',
            difficulty: 'hard',
            hint: 'from --stats 找hotspotstart, tocount器collect, 指标analyze, bottlenecklocate, optimizationstrategycompleteprocess. 提tospecificcount器名称andcompute公式. ',
            answer: '我 rocprof performanceanalyzeprocess: (1)locatehotspot: rocprof --stats getall核function耗时分布, find占总时between最多核function(usually 80/20 法则 — 20% 核function占 80% 时between). (2)分类bottleneck: collect两组count器 — compute组(SQ_WAVES, SQ_INSTS_VALU, SQ_WAIT_INST_ANY)andcache组(TCC_HIT, TCC_MISS, TA_FLAT_READ/WRITE_WAVEFRONTS). computekey指标: L2 命in率=TCC_HIT/(HIT+MISS), VALU 利用率=SQ_INSTS_VALU/(SQ_WAVES×理论instruction数), stall 比例=SQ_WAIT/(总 cycles). if stall 高 + L2 miss 高 → memorybottleneck; if VALU 利用率高 + stall 低 → computebottleneck; if SQ_WAVES 低 → occupancyissue. (3)optimizationstrategy: memorybottleneck → checkmerge(AoS→SoA), 增加 LDS tiling, 调整 block size提高cache复用; computebottleneck → 降低instruction数(用内置function, 减少冗余compute), use半精度(__half2); occupancyissue → 减少每threadregisteruse, 减小 LDS allocation. (4)verify: modifyafterre-collectcount器, confirmkey指标改善. (5)globaloptimization: rocprof --hsa-trace check CPU-GPU 协作 — 核functionbetween隔, transferandcompute重叠, use多 stream 减少 GPU idle时between. ',
            amdContext: '这道题directly考察your实战experience. AMD interviewer期望你can说出specificcount器名称(SQ_WAVES, TCC_HIT 等), 而not只is泛泛地说"用 profiler analyze". candescribecompleteanalyze-optimization-verify闭环will大大加分. ',
          },
        },
      ],
    },
  ],
  completionChecklist: [
    'canwritecomplete HIP program: 核functiondefine → memory allocation → datatransfer → startupexecute → synchronizationreclaim',
    'understand Grid/Block/Thread layer次structure及其to AMD hardware(GPU/CU/Wavefront)mapping',
    'master三种memory allocationstrategy(hipMalloc/hipHostMalloc/hipMallocManaged)适用scenario',
    'understand Wavefront execute模型andbranch divergenceperformanceimpact, can识别and消除分歧',
    'mastermemory coalescingaccess规则and AoS→SoA optimization, canresolve LDS bank conflict',
    'canuse rocprof --stats / -i / --hsa-trace completecompleteperformanceanalyzework流',
  ],
};
