// ============================================================
// AMD Linux Driver Learning Platform - Module 1.5
// GPU 架构基础 (GPU Architecture Fundamentals)
// 在接触图形 API 和驱动代码之前，先真正理解 GPU 是什么。
// 事实核对依据：AMD RDNA3/RDNA4 ISA Reference Guide、ROCm
// 官方文档 (gpu-arch-specs / device-hardware glossary)、
// Linux 内核 amdgpu 文档 (driver-core / GC / MES)。
// ============================================================
import type { Module } from './curriculum';

export const gpuArchModule: Module = {
  id: 'gpu-arch',
  number: '1.5',
  title: 'GPU 架构基础',
  titleEn: 'GPU Architecture Fundamentals',
  icon: 'Cpu',
  description:
    '在写任何驱动代码之前，先回答三个问题：GPU 和 CPU 到底哪里不同？wavefront、CU、WGP 这些 AMD 术语指什么？CPU 是怎么把活派给 GPU 的？本模块用 12 节微课 + 真实架构图，把执行模型、显存体系和命令前端一次讲透——这三块正是 amdgpu 驱动每天打交道的东西。',
  estimatedHours: 35,
  difficulty: 'beginner',
  subModules: [
    { id: 'ga-what', title: '1.5.1 GPU 到底是什么', titleEn: 'What a GPU Really Is' },
    { id: 'ga-exec', title: '1.5.2 执行模型：wave、CU 与 WGP', titleEn: 'Execution Model: Waves, CUs & WGPs' },
    { id: 'ga-mem-cmd', title: '1.5.3 内存体系与命令前端', titleEn: 'Memory System & Command Front-End' },
    { id: 'ga-map', title: '1.5.4 架构地图与图形管线速览', titleEn: 'Architecture Map & Pipeline Tour' },
  ],
  theory: {
    overview:
      '很多学习者从"基础准备"直接跳进图形 API 或内核代码，结果第一次见到 wavefront、SIMD32、doorbell 时完全没有画面感。这个模块是缺失的那块地基：先从"吞吐机器 vs 延迟机器"的设计哲学讲起，再拆开一块真实的 AMD GPU（贯穿示例仍是 RX 7600 XT / Navi33 / gfx1102），按"执行模型 → 显存体系 → 命令前端 → 架构地图"的顺序建立完整心智模型。深度按驱动开发的重要性分级：命令提交路径、VRAM/GTT、IP block 组织这些驱动核心概念讲到能读代码的程度；光栅化、纹理采样这些 Mesa 负责的内容只做速览。所有数字都来自 AMD 官方 ISA 手册和 ROCm 文档，并给出出处链接。',
    sections: [
      {
        title: '为什么 GPU 长成这样：吞吐 vs 延迟',
        content:
          'CPU 是延迟优化的机器：大缓存、乱序执行、分支预测，都是为了让"一个线程"尽快跑完。GPU 反其道而行：砍掉这些昂贵的机制，把面积全部换成 ALU，然后用"海量并行 + 随时切换 wavefront"来隐藏内存延迟——某个 wave 在等显存（几百个周期）时，SIMD 立刻切到另一个就绪的 wave 继续算，硬件永远不闲着。这一个设计选择解释了后面几乎所有概念：为什么寄存器用量会限制并行度（occupancy）、为什么 GPU 需要成千上万个线程才能吃饱、为什么驱动要一次提交一大批命令而不是一条条喂。',
        diagram: {
          type: 'ascii',
          content: `CPU（延迟优化）                GPU（吞吐优化）
┌────────────────────┐        ┌────────────────────┐
│ 少量大核心          │        │ 上千条 ALU lane     │
│ 大缓存/乱序/预测    │        │ 小缓存 + 大寄存器堆 │
│ 目标：单线程最快    │        │ 目标：总量最大      │
└────────────────────┘        └────────────────────┘
延迟隐藏：
wave A ──算──┐等显存(~600周期)┌──算──
wave B ──────┘立即切换 ────────┘        ALU 不空转`,
          caption: 'GPU 用"切换 wavefront"而不是"大缓存"来对抗内存延迟——这是理解 GPU 一切行为的钥匙。',
        },
      },
      {
        title: 'AMD 的术语体系：从 work-item 到 Shader Engine',
        content:
          'AMD 的执行层级自下而上是：work-item（一个线程，对应 SIMD 的一条 lane）→ wavefront（32 或 64 个 work-item 共享一条指令流，RDNA 原生 wave32、CDNA 固定 wave64）→ workgroup（若干 wave，共享 LDS、可以 barrier 同步，必须落在同一个 WGP 上）→ grid（一次 kernel 启动的全部 workgroup）。硬件层级则是：SIMD32（真正执行指令的 32 宽向量单元，带自己的 VGPR 堆）→ CU（2 个 SIMD32 + 标量单元 + L0 缓存）→ WGP（RDNA 特有，2 个 CU 共享 128 KiB LDS）→ Shader Array → Shader Engine → 整颗 GPU。RX 7600 XT 是 32 CU = 16 WGP、2 个 Shader Engine。记住一个对照：CU 才是"核心"，营销页上的"流处理器数"只是 lane 数（CU × 64）。',
        diagram: {
          type: 'ascii',
          content: `软件视角                     硬件视角
grid (整个 kernel)           GPU
 └─ workgroup (≤1024)         └─ Shader Engine ×2 (Navi33)
     └─ wavefront (32/64)         └─ Shader Array ×2
         └─ work-item                 └─ WGP ×4 (= 2 CU)
                                          └─ SIMD32 ×4/WGP
映射规则:
  1 workgroup → 1 个 WGP (LDS 在这里)
  1 wavefront → 1 个 SIMD32 的一个 wave slot`,
          caption: '软件层级（左）如何落到硬件层级（右）。RDNA 每 WGP 有 4 个 SIMD32；CDNA 没有 WGP，保留 GCN 的 CU 布局。',
        },
      },
      {
        title: '驱动的主战场：显存与命令前端',
        content:
          '对内核驱动来说，最重要的不是着色器怎么算，而是两件事：内存和命令。内存侧：GPU 能访问两类内存——VRAM（板载显存）和 GTT（通过 GART 页表映射给 GPU 的系统内存），GPUVM 再给每个进程一套独立的 GPU 页表；amdgpu 用 TTM 管理 buffer 在 VRAM/GTT 之间的放置与驱逐，这是真实驱动 bug 的高发区。命令侧：CPU 不直接控制 GPU 干活，而是把 PM4 命令包写进环形缓冲区（ring buffer），敲一下 doorbell（一个 MMIO 写），GPU 的命令处理器（CP：PFP/ME 处理图形队列、MEC/ACE 处理计算队列）自己去取包、解析、派发 wavefront。GFX11 之后 MES 固件负责把大量用户队列（MQD）动态映射到有限的硬件队列槽（HQD）上——这就是用户态队列的基础。',
        diagram: {
          type: 'ascii',
          content: `命令提交路径（简化）
用户态: app/Mesa ──构建 IB(PM4)──> ioctl(CS)
内核态: amdgpu ──写 ring + WPTR──> 写 doorbell (MMIO)
GPU:    CP(PFP→ME / MEC) ──解析 PM4──> 派发 wave 到 CU
完成:   EOP 事件 ──fence 值──> 中断 ──> 唤醒等待者

内存域: VRAM | GTT(GART 映射的系统内存) | DOORBELL ...
        └── GPUVM: 每进程独立 GPU 页表`,
          caption: '驱动每天打交道的两条主线：BO 在 VRAM/GTT 间的放置，以及 ring→doorbell→CP 的命令流。',
        },
      },
      {
        title: '架构地图：GCN、RDNA、CDNA 与内核代号',
        content:
          '2019 年起 AMD 把一套 GCN 拆成两条线：RDNA 面向游戏（Radeon RX，wave32 原生、WGP、Infinity Cache），CDNA 面向数据中心（Instinct MI，wave64、矩阵核心、HBM、无显示输出）。截至 2026 年中：游戏侧最新是 RDNA4（RX 9000，gfx120x，2025 年发布），计算侧最新是 CDNA4（MI350，gfx950，2025 年发布），MI400/CDNA5 计划 2026 下半年；"UDNA" 是 AMD 宣布的重新统一方向，还不是能买到的产品。学驱动必须会做名字换算：市场名（RX 7600 XT）→ 芯片代号（Navi33）→ LLVM 目标（gfx1102）→ 内核 GC IP 版本（11.0.2，对应 gfx_v11_0.c）。注意内核代码到今天仍讲"GCN 方言"：amdgcn 三元组、SE/SH/CU 计数、TCP 这类老名字在 RDNA4 上照用。',
        diagram: {
          type: 'ascii',
          content: `            GCN (2012-2019, gfx6-9)
                    │ 2019 分家
        ┌───────────┴───────────┐
      RDNA (游戏)             CDNA (计算)
  RDNA1/2/3/3.5/4          CDNA1/2/3/4 → MI400(2H26)
  gfx101x→gfx120x          gfx908→gfx950
  wave32·WGP·InfCache      wave64·矩阵核·HBM
        └───────"UDNA"(已宣布的统一方向)───────┘
名字换算: RX 7600 XT = Navi33 = gfx1102 = GC 11.0.2`,
          caption: '两条架构线 + 一套名字换算。内核文件名跟 GC IP 版本走：gfx_v11_0.c、gfx_v12_0.c。',
        },
      },
    ],
    keyBooks: [
      {
        title: 'Programming Massively Parallel Processors, 4th Edition',
        author: 'Wen-mei Hwu, David Kirk, Izzat El Hajj',
        relevance: 'GPU 通用计算的标准教材：线程层级、内存合并、occupancy 的系统讲解。虽以 CUDA 行文，概念与 HIP/AMD 一一对应（warp↔wavefront、SM↔CU），读时做术语替换即可。',
      },
      {
        title: 'General-Purpose Graphics Processor Architectures',
        author: 'Tor M. Aamodt, Wilson W. L. Fung, Timothy G. Rogers',
        relevance: '从体系结构研究视角讲 SIMT 执行、分支发散和内存系统的小册子，适合想知道"硬件为什么这样设计"的读者，是 ISA 手册之外最好的原理补充。',
      },
    ],
    onlineResources: [
      {
        title: '"RDNA3" Instruction Set Architecture Reference Guide',
        url: 'https://www.amd.com/content/dam/amd/en/documents/radeon-tech-docs/instruction-set-architectures/rdna3-shader-instruction-set-architecture-feb-2023_0.pdf',
        type: 'doc',
        description: 'AMD 官方 ISA 手册：wave、EXEC 掩码、SGPR/VGPR、LDS 的最终权威定义。本模块的执行模型部分全部以它为准。',
      },
      {
        title: '"RDNA4" Instruction Set Architecture Reference Guide',
        url: 'https://docs.amd.com/v/u/en-US/rdna4-instruction-set-architecture',
        type: 'doc',
        description: '2025 年发布的最新一代游戏架构 ISA 手册，可对照 RDNA3 版看架构演进（如取消 per-SA 图形 L1）。',
      },
      {
        title: 'AMD Instinct MI300/CDNA3 Instruction Set Architecture',
        url: 'https://www.amd.com/content/dam/amd/en/documents/instinct-tech-docs/instruction-set-architectures/amd-instinct-mi300-cdna3-instruction-set-architecture.pdf',
        type: 'doc',
        description: '计算侧对应手册：wave64、MFMA 矩阵指令、AccVGPR。与 RDNA 手册对读能真正理解两条线的分野。',
      },
      {
        title: 'ROCm: GPU hardware specifications 总表',
        url: 'https://rocm.docs.amd.com/en/latest/reference/gpu-arch-specs.html',
        type: 'doc',
        description: '一页查全所有 AMD GPU 的 CU 数、wave 大小、LDS、各级缓存容量、LLVM 目标名和 GFXIP 版本。本模块所有数字的出处。',
      },
      {
        title: 'ROCm: device hardware glossary（官方术语表）',
        url: 'https://rocm.docs.amd.com/en/latest/reference/glossary/device-hardware.html',
        type: 'doc',
        description: 'AMD 官方对 WGP、wavefront、SALU/VALU、Infinity Cache、XCD 等术语的入门级定义，本站双语术语表的对照基准。',
      },
      {
        title: 'AMD Instinct MI300 microarchitecture（ROCm 文档）',
        url: 'https://rocm.docs.amd.com/en/latest/conceptual/gpu-arch/mi300.html',
        type: 'doc',
        description: 'XCD/ACE/HWS/HBM 的官方框图与峰值算力表，理解 chiplet 时代数据中心 GPU 的最佳入口。',
      },
      {
        title: 'GPUOpen: Occupancy explained',
        url: 'https://gpuopen.com/learn/occupancy-explained/',
        type: 'doc',
        description: '用真实 RDNA3 数字讲透 wave slot、VGPR/LDS 限制和 wave32 vs wave64 的最佳单篇文章，本模块 occupancy 课的主参考。',
      },
      {
        title: 'Linux 内核 amdgpu 官方文档（driver-core / GC / MES）',
        url: 'https://docs.kernel.org/gpu/amdgpu/driver-core.html',
        type: 'doc',
        description: '驱动维护者亲笔写的 IP block、ring/IB、MQD/HQD、doorbell、内存域说明——后续所有驱动模块假设你有的心智模型就来自这里。',
      },
      {
        title: 'AMD 视频: All the Pipelines — Journey through the GPU',
        url: 'https://gpuopen.com/videos/graphics-pipeline/',
        type: 'video',
        description: 'AMD 官方出品的图形管线之旅：从 API 调用到几何/光栅化/RB 各固定功能块，适合在第四组课程前观看。',
      },
      {
        title: 'AMD 视频: Optimizing for the Radeon RDNA Architecture',
        url: 'https://gpuopen.com/videos/optimizing-for-the-radeon-rdna-architecture/',
        type: 'video',
        description: 'AMD 工程师 Lou Kramer 用真实着色器例子讲 RDNA vs GCN、WGP 和 wave 模式，是 ISA 手册的"有声版"。',
      },
      {
        title: 'Branch Education: How do Graphics Cards Work?',
        url: 'https://www.youtube.com/watch?v=h9Z4oGN89MU',
        type: 'video',
        description: '公认最好的 GPU 入门视频（28 分钟真实感 3D 动画）。注意它解剖的是 NVIDIA GA102，观看时用本模块的术语对照表换算（SM↔CU、warp↔wave）。',
      },
      {
        title: 'Fabian Giesen: A trip through the Graphics Pipeline 2011',
        url: 'https://fgiesen.wordpress.com/2011/07/09/a-trip-through-the-graphics-pipeline-2011-index/',
        type: 'doc',
        description: '社区经典 13 篇长文：从 API 一路走到像素，其中命令处理器与光栅化章节至今仍是理解 AMD CP/PM4 世界的最好读物。',
      },
    ],
  },
  codeReading: [
    {
      title: 'amdgpu 的世界观：GPU = 一组 IP block',
      description:
        '这段真实驱动代码展示第 2 课的核心结论：amdgpu 不把 GPU 当一个整体，而是按 IP block 逐个注册。soc21.c 是 GFX11 世代（含 RX 7600 XT）的 SoC 层，它把 GC、SDMA、VCN 等 IP 的 ip_block 依次挂进设备。你现在就能读懂这个函数在"组装"什么。',
      file: 'drivers/gpu/drm/amd/amdgpu/soc21.c',
      language: 'c',
      code: `/* GFX11 世代按 IP 版本组装 GPU（节选，v6.x 内核） */
static int soc21_common_early_init(struct amdgpu_ip_block *ip_block)
{
	/* ... 判定 chip family、harvest 配置 ... */
}

/* amdgpu_discovery.c 依据 VBIOS 中的 IP discovery 表，
 * 为每个 IP 版本挑对应实现并注册: */
int amdgpu_discovery_set_ip_blocks(struct amdgpu_device *adev)
{
	/* GC (图形+计算) —— gfx1102 → GC 11.0.2 */
	amdgpu_discovery_set_gc_ip_blocks(adev);
	/* SDMA —— 搬运/换页引擎 */
	amdgpu_discovery_set_sdma_ip_blocks(adev);
	/* VCN/JPEG —— 视频编解码 */
	amdgpu_discovery_set_mm_ip_blocks(adev);
	/* DCN —— 显示; PSP —— 固件安全; SMU —— 电源 ... */
	return 0;
}`,
      annotations: [
        'IP discovery：现代 AMD GPU 在 VBIOS 里带一张"我由哪些 IP 版本组成"的表，驱动读表后按版本号选实现——这就是一份 amdgpu 能同时驱动十几代 GPU 的原因。',
        'GC 11.0.2 就是 gfx1102（RX 7600 XT）：LLVM 名字 gfxNNNN 与内核 GC IP 版本可以互相换算。',
        '每个 IP block 都实现同一组回调（sw_init/hw_init/suspend/resume...），后面模块 5 会专门讲这个 ops 模式。',
      ],
    },
    {
      title: '从 HIP kernel 看执行层级',
      description:
        '第 6 课的实践对象：一个最小的 HIP 向量加法。注释标出每一行对应的硬件概念——写完这 20 行，grid/workgroup/wavefront 就不再是名词背诵。',
      file: 'vecadd.hip.cpp（用户态示例）',
      language: 'cpp',
      code: `#include <hip/hip_runtime.h>

/* __global__ = 在 GPU 上跑的函数（kernel） */
__global__ void vecAdd(const float *a, const float *b,
                       float *c, int n)
{
    /* 每个 work-item 用索引数学找到自己那一份数据 */
    int i = blockIdx.x * blockDim.x + threadIdx.x;
    if (i < n)               /* 尾部 wave 部分 lane 会被 EXEC 掩码关掉 */
        c[i] = a[i] + b[i];  /* 相邻 lane 访问相邻地址 → 合并访存 */
}

int main() {
    /* ... hipMalloc / hipMemcpy 省略 ... */
    int n = 1 << 20;
    dim3 block(256);                 /* workgroup: 256 个 work-item  */
    dim3 grid((n + 255) / 256);      /* grid: 4096 个 workgroup      */
    /* RDNA (wave32): 每个 workgroup = 8 个 wavefront，
       落在同一个 WGP 上，硬件把 4096 个组撒到所有 CU 上 */
    vecAdd<<<grid, block>>>(d_a, d_b, d_c, n);
    hipDeviceSynchronize();
}`,
      annotations: [
        'block(256) 在 RDNA 上会被编译成 8 个 wave32（或 4 个 wave64，编译器按 shader 选择模式）。',
        '一个 workgroup 必须整体落在一个 WGP：因为它要用的 LDS 和 barrier 硬件都在 WGP 里。',
        'if (i < n) 就是分支发散的最小例子：最后一个 wave 里超界的 lane 被 EXEC 掩码禁用，硬件不会越界访问。',
      ],
    },
  ],
  miniProject: {
    title: '给你的 GPU 建一张"架构档案卡"',
    description:
      '综合运用本模块所有概念：用工具实测 + 官方表格对照，为你手头（或任选一块）的 AMD GPU 建立一张完整档案卡，并解释每个数字意味着什么。',
    objectives: [
      '掌握市场名 → 代号 → gfx 目标 → GC IP 版本的四层换算',
      '能实测并解释 CU/WGP 数、wave 大小、LDS、各级缓存与显存参数',
      '能从 dmesg 的 IP discovery 输出读出这块 GPU 的 IP block 清单',
    ],
    steps: [
      '用 lspci -nn 和 /sys/class/drm/card*/device/ 找到 device id，对照 ROCm gpu-arch-specs 表确定代号与 gfx 版本（如 RX 7600 XT → Navi33 → gfx1102）',
      '有 ROCm 环境则运行 rocminfo，摘录 Compute Unit 数、Wavefront Size、LDS 大小、最大 workgroup 尺寸四项',
      '读 dmesg | grep -i "amdgpu.*ip" 的 IP discovery 输出，列出 GC/SDMA/VCN/DCN/PSP/SMU 的版本号',
      '从 sysfs 读 mem_info_vram_total 和 mem_info_gtt_total，解释两者分别对应哪类内存、为什么 GTT 大小接近系统内存的一半',
      '把以上信息整理成一张档案卡（CU/WGP、SE 数、wave 模式、LDS、L2/Infinity Cache、VRAM 类型与带宽、gfx 与 GC 版本、IP 清单），每项标注数据来源',
    ],
    expectedOutput:
      '一张可分享的 GPU 架案卡。以 RX 7600 XT 为例应包含：32 CU / 16 WGP / 2 SE；wave32 原生（支持 wave64）；LDS 128 KiB per WGP；L2 2 MiB + Infinity Cache 32 MiB；16 GB GDDR6（驱动报告约 16368 MB）；gfx1102 = GC 11.0.2；IP 清单含 GC 11.0.2 / SDMA 6.0.2 / VCN 4.0.4 / DCN 3.1.4 / PSP 13.0.8 / SMU 13.0.8（不同 VBIOS 略有差异）。',
  },
  interviewQuestions: [
    {
      question: '解释 wavefront 是什么。RDNA 的 wave32 和 GCN/CDNA 的 wave64 有什么区别？驱动和编译器为什么两种都要支持？',
      difficulty: 'medium',
      hint: '从"共享一条指令流的 lane 组"说起，再讲 RDNA 原生 32、wave64 分两拍执行，CDNA 固定 64。',
      answer:
        'wavefront 是 AMD GPU 上共享同一指令流、锁步执行的一组 work-item（NVIDIA 叫 warp）。GCN 和 CDNA 的 wave 固定 64 个 lane（GCN 在 SIMD16 上分 4 拍发射）；RDNA 的 SIMD 加宽到 32 lane，wave32 一拍一条指令，同时保留 wave64 模式（一条指令分两拍执行）。RDNA 上具体某个着色器用 wave32 还是 wave64 由编译器/驱动按 shader 类型和寄存器压力选择，所以工具链、内核里管理 wave 状态的代码（如 debug/trap 处理）必须两种模式都正确处理；而 CDNA 只有 wave64。面试加分点：wave 大小影响分支发散代价和 occupancy 计算，wave32 是 RDNA 为游戏负载（分支多、延迟敏感）做的核心取舍。',
    },
    {
      question: 'CU 和 WGP 是什么关系？为什么说"一个 workgroup 必须落在一个 WGP 上"？内核代码里数的是 CU 还是 WGP？',
      difficulty: 'medium',
      hint: 'WGP = 2 CU + 共享 LDS/L0 指令缓存；想想 LDS 和 barrier 硬件在哪里。',
      answer:
        'RDNA 把两个 CU 打包成一个 WGP（Workgroup Processor），LDS（128 KiB）和 L0 指令/标量缓存放在 WGP 级共享；每个 CU 内是 2 个 SIMD32 + 标量单元 + L0 向量缓存。workgroup 的定义就是"共享 LDS、能 barrier 同步的一组 wave"，而这两样硬件都在 WGP 里，所以一个 workgroup 必须整体调度进一个 WGP（wave 可以分布在它的 4 个 SIMD 上）。计数口径上，内核、ROCm 和市场宣传都数 CU（RX 7600 XT：32 CU = 16 WGP），sysfs/debugfs 里是 active_cu_number；CDNA 则根本没有 WGP，保留 GCN 的 CU 布局（4×SIMD16 + 64 KiB LDS per CU）。',
    },
    {
      question: 'VRAM 和 GTT 有什么区别？GPU 怎么用到系统内存？什么时候 buffer 会在两者之间搬家？',
      difficulty: 'hard',
      hint: '关键词：GART 页表、GPUVM、TTM 放置与驱逐、PCIe 带宽差距。',
      answer:
        'VRAM 是 GPU 板载显存（RX 7600 XT：16 GB GDDR6，本地带宽 ~288 GB/s）；GTT 是通过 GART 页表映射给 GPU 的系统内存——GPU 经 PCIe 访问它，带宽低一个数量级但容量大。GPUVM 给每个进程一套独立的 GPU 页表，一个 GPU 虚拟地址背后可以是 VRAM 页也可以是 GTT 页，对着色器透明。amdgpu 用 TTM 管理 buffer object 的放置：创建 BO 时用户态给出首选域（如扫描输出 buffer 必须 VRAM），显存吃紧时 TTM 会把不常用的 BO 驱逐到 GTT，需要时再搬回来，搬运由 SDMA 引擎完成。驱逐路径是真实驱动 bug 的高发区（性能骤降、悬挂引用），也是面试常问的"显存超卖怎么办"的答案。另外 CPU 侧通过 BAR0 窗口直写 VRAM（Resizable BAR 决定窗口大小），这与 GTT 是两个方向的访问。',
    },
    {
      question: '从应用调用一次绘制/计算，到 GPU 真正开始执行，中间经历了什么？请按用户态 → 内核 → GPU 三段描述。',
      difficulty: 'hard',
      hint: '顺序：Mesa/ROCm 构建 IB(PM4) → ioctl(CS) → ring buffer + WPTR → doorbell → CP(PFP/ME 或 MEC/ACE) → 派发 wave → fence 回报。',
      answer:
        '用户态：Mesa（或 ROCm）把状态设置和绘制/派发命令编码成 PM4 包，写进一块 GPU 可见的 Indirect Buffer（IB），然后调用 amdgpu 的 CS ioctl 提交，附上依赖的 fence。内核：amdgpu 校验并调度这次提交（drm_sched），在对应引擎的 ring buffer 里写入指向 IB 的 INDIRECT_BUFFER 包，更新 WPTR，最后写该队列的 doorbell（BAR2 上的一个 MMIO 页）——这是唯一的"叫醒"动作。GPU：命令处理器从 ring 取包，图形队列由 PFP→ME 流水解析，计算队列由 MEC（ACE）处理；解析到 dispatch/draw 后由 SPI 创建 wavefront 分配到各 CU 的 SIMD wave slot 上执行。完成时 CP 写回 fence 值并发 EOP 中断，内核唤醒等待该 fence 的进程。GFX11+ 上还有 MES：它把众多用户队列的 MQD 动态装载进有限的 HQD 槽，使用户态可以绕过 per-submit ioctl 直接敲 doorbell（用户态队列）。',
    },
  ],
};
