// ============================================================
// AMD Linux Driver Learning Platform - Module 1.5 Micro-Lessons
// Module 1.5: GPU 架构基础 (GPU Architecture Fundamentals)
// 12 lessons in 4 groups, ~20 min each
// 事实依据: AMD RDNA3/RDNA4 ISA Guide, ROCm gpu-arch-specs,
// GPUOpen "Occupancy explained", Linux 内核 amdgpu 文档。
// 图示: diagram.svgId → components/shared/LessonFigure.tsx
// ============================================================
import type { MicroLessonModule } from './micro_lesson_types';

export const gpuArchMicroLessons: MicroLessonModule = {
  moduleId: 'gpu-arch',
  groups: [
    // ════════════════════════════════════════════════════════════
    // Group 1.5.1: GPU 到底是什么
    // ════════════════════════════════════════════════════════════
    {
      id: '15-1',
      number: '1.5.1',
      title: 'GPU 到底是什么',
      titleEn: 'What a GPU Really Is',
      icon: 'Cpu',
      description: '别急着背术语。先理解 GPU 与 CPU 的根本分工——延迟机器 vs 吞吐机器，再把一块真实的 AMD GPU 拆成驱动眼中的样子：一组各司其职的 IP block。',
      lessons: [
        // ── Lesson 1.5.1.1 ────────────────────────────────────
        {
          id: '15-1-1',
          number: '1.5.1.1',
          title: 'CPU vs GPU：延迟机器与吞吐机器',
          titleEn: 'CPU vs GPU: Latency vs Throughput Machines',
          duration: 20,
          difficulty: 'beginner',
          tags: ['GPU', 'throughput', 'latency-hiding', 'SIMT'],
          concept: {
            summary:
              'CPU 用大缓存、乱序执行和分支预测让单个线程尽快跑完（延迟优化）；GPU 砍掉这些机制，把芯片面积换成上千条 ALU lane，再靠"随时切换 wavefront"来隐藏内存延迟（吞吐优化）。理解这一个取舍，后面所有 GPU 概念都有了因果。',
            explanation: [
              '想象两种送快递的方式：CPU 像一辆 F1 赛车，一次送一件但极快——为了这个"快"，它花大价钱建缓存（少跑远路）、做乱序执行和分支预测（不空等）。GPU 像一支万人自行车队，单个骑手不快，但一次出发就是几万件包裹，总吞吐量碾压赛车。',
              '但自行车队有个致命问题：访问显存要几百个时钟周期，如果每个骑手都停下来等，整支队伍就瘫痪了。GPU 的解法不是加大缓存，而是超额订阅（oversubscription）：每个执行单元上驻扎远多于它一次能算的 wavefront，某个 wave 等内存时，硬件在下一个周期就切到另一个就绪的 wave 继续算。切换是零成本的，因为每个 wave 的寄存器都常驻在超大的寄存器堆里——这也解释了为什么 GPU 的寄存器堆比缓存还大（RDNA3 每个 WGP 有 768 KiB VGPR，比它的 L0 缓存大一个数量级）。',
              '这个设计对软件提出了两个要求：第一，必须有海量并行的工作可切换——几千个线程只是起步，这就是为什么 GPU 程序总是"一次算一整个数组"；第二，工作要成批提交——CPU 一条条喂指令太慢，所以 CPU 只负责把命令写进内存里的环形缓冲区，GPU 自己去取（模块后面的命令前端课会展开）。',
              '从驱动开发者视角：你以后调试的很多"性能问题"本质都是延迟隐藏失败——wave 不够多（occupancy 低）、访存模式差（合并失败）、或者 CPU 提交端成了瓶颈。先把这个因果链焊在脑子里，后面每一课都在给它补细节。',
            ],
            keyPoints: [
              'CPU 优化"单线程多快"（延迟），GPU 优化"单位时间总量"（吞吐）——两者不是快慢关系，是分工不同。',
              'GPU 隐藏内存延迟的手段是切换 wavefront，不是大缓存；寄存器常驻使切换零成本。',
              'GPU 的寄存器堆大于缓存是设计结果，不是设计失误。',
              'GPU 需要远超 ALU 数量的线程才能吃饱：RX 7600 XT 有 2048 条 lane，但要几万个 work-item 才能隐藏延迟。',
              '驱动视角的伏笔：批量提交命令（ring buffer）正是"吞吐机器"哲学在 CPU↔GPU 接口上的延伸。',
            ],
          },
          diagram: {
            title: '两种设计哲学 + 延迟隐藏',
            svgId: 'cpu-vs-gpu',
            content: `CPU（延迟优化）              GPU（吞吐优化）
┌────────────────────┐        ┌──────────────────────────┐
│ 4-16 个大核心　　　│        │ 数千条 ALU lane　　　　　│
│ 大缓存/乱序/预测   │        │ 小缓存+大寄存器堆        │
└────────────────────┘        └──────────────────────────┘
延迟隐藏:
wave A ─算─┤ 等显存 ~600 周期 ├─算─
wave B ────┘ 硬件立即切换 ─────┘`,
            caption: '左：CPU 把面积花在"让一个线程不等"；右：GPU 把面积花在 ALU 上，用切换 wave 来"假装不等"。下方时间线是全模块最重要的一张图。',
          },
          codeWalk: {
            title: '同一个任务的两种写法：串行循环 vs 数据并行',
            language: 'cpp',
            file: 'saxpy 对比（用户态示例）',
            code: `/* CPU 思维: 一个线程, 依次处理, 靠缓存和流水线提速 */
void saxpy_cpu(int n, float a, const float *x, float *y)
{
    for (int i = 0; i < n; i++)     /* 一次一个 i */
        y[i] = a * x[i] + y[i];
}

/* GPU 思维: 为每个 i 生成一个 work-item, 同时展开 */
__global__ void saxpy_gpu(int n, float a,
                          const float *x, float *y)
{
    int i = blockIdx.x * blockDim.x + threadIdx.x;
    if (i < n)
        y[i] = a * x[i] + y[i];     /* 上万个 i 并行 */
}
/* 启动: saxpy_gpu<<<(n+255)/256, 256>>>(n, a, x, y);
 * n=1M 时 → 4096 个 workgroup → 3 万多个 wave32,
 * RX 7600 XT 的 128 个 SIMD 轮流消化它们 */`,
            explanation:
              '注意 GPU 版本没有循环——循环被"展开"成了几万个 work-item，由硬件负责把它们打包成 wavefront 塞进 SIMD。CPU 版本的性能取决于缓存命中和单核频率；GPU 版本的性能取决于有没有足够多的 wave 在飞、访存是否合并。这个"把循环变成索引"的转换是所有 GPU 编程的起手式。',
          },
          miniLab: {
            title: '算一算：你的 CPU 和 GPU 差几个数量级',
            objective: '用真实数字建立"吞吐 vs 延迟"的量感。',
            steps: [
              '在任意 Linux 机器上运行 lscpu，记下核心数、线程数和 L3 缓存大小',
              '打开 ROCm 官方规格表 (rocm.docs.amd.com → GPU hardware specifications)，找到 RX 7600 XT 一行，记下 CU 数（32）',
              '计算 ALU lane 数：32 CU × 64 lane/CU = 2048 条 lane；和你 CPU 的线程数做个比值',
              '再比缓存：你 CPU 的 L3（通常 16-64 MiB）vs RX 7600 XT 的 L2（2 MiB）——GPU 缓存更小，但它的 VGPR 总量 = 16 WGP × 512 KiB = 8 MiB，比 L2 还大',
              '把四个数字写进学习日志：lane 比值、缓存比值、以及你对"为什么 GPU 敢用小缓存"的一句话回答',
            ],
            expectedOutput:
              '典型结果：8 核 16 线程 CPU vs 2048 lane GPU ≈ 128 倍并行度差距；CPU L3 32 MiB vs GPU L2 2 MiB。结论一句话：GPU 用"寄存器驻留 + wave 切换"替代了大缓存的延迟对抗功能。',
            hint: '找不到规格表就用 lspci -nn 先确认你机器上有没有 AMD GPU；没有也不影响本课，数字都可以从官方表查。',
          },
          debugExercise: {
            title: '为什么这个 GPU 程序比 CPU 还慢？',
            language: 'cpp',
            question: '同事把 CPU 代码"移植"到了 GPU，结果比单线程 CPU 还慢 10 倍。指出两个致命问题。',
            buggyCode: `/* 目标: 对 100 万个元素做 y[i] = a*x[i] + y[i] */
__global__ void saxpy_slow(int n, float a,
                           const float *x, float *y)
{
    /* "GPU 有 32 个 CU, 那就开 32 个线程!" */
    int tid = threadIdx.x;            /* 0..31 */
    int chunk = n / 32;
    for (int i = tid * chunk; i < (tid + 1) * chunk; i++)
        y[i] = a * x[i] + y[i];
}
/* 启动配置: saxpy_slow<<<1, 32>>>(n, a, x, y); */`,
            hint: '数一数这个启动配置下总共有几个 wavefront？它们能分布到几个 CU 上？每个线程的访存模式是连续的吗？',
            answer:
              '问题一：并行度灾难。<<<1, 32>>> 只有 1 个 workgroup、共 32 个 work-item = 1 个 wave32。一个 workgroup 只能落在一个 WGP 上，所以整颗 GPU 的 32 个 CU 里只有半个在干活，而且只有 1 个 wave——任何内存等待都无法被切换隐藏，延迟全部裸露。问题二：访存无法合并。每个线程处理连续的 chunk（线程 0 访问 [0, 31250)，线程 1 访问 [31250, ...)），同一个 wave 的 32 条 lane 在同一拍访问的地址相距 31250×4 字节，硬件无法合并成一次宽加载，每条 lane 都是独立的内存事务。正确写法：i = blockIdx.x*blockDim.x + threadIdx.x，让相邻 lane 访问相邻地址，并启动 (n+255)/256 ≈ 4096 个 workgroup 喂饱所有 CU。教训：GPU 编程的第一直觉是"线程要多到过剩、相邻线程摸相邻数据"。',
          },
          interviewQ: {
            question: '为什么 GPU 的缓存比 CPU 小得多却不影响它的定位？GPU 靠什么对抗内存延迟？',
            difficulty: 'easy',
            hint: '答案就是本课标题：吞吐机器的延迟隐藏。',
            answer:
              'CPU 靠缓存把延迟"降下来"，GPU 靠并行把延迟"藏起来"。GPU 在每个 SIMD 上驻扎多个 wavefront（RDNA3 每个 SIMD32 有 16 个 wave slot），某个 wave 等内存时硬件零成本切换到就绪 wave，只要在飞的 wave 足够多，ALU 就永远有活干，内存延迟就不体现在总吞吐上。支撑这套机制的是巨大的寄存器堆（wave 的上下文常驻，不换入换出）。所以 GPU 的缓存目标不是"避免访存"而是"节省带宽"（合并、过滤重复请求），这也是 Infinity Cache 出现的原因——带宽比延迟更贵。',
            amdContext: 'AMD 面试中这道题常以"为什么 occupancy 重要"或"寄存器用多了会怎样"的形式出现，考察的是同一条因果链：寄存器压力 → 驻留 wave 数下降 → 延迟隐藏失败 → 吞吐崩塌。',
          },
        },
        // ── Lesson 1.5.1.2 ────────────────────────────────────
        {
          id: '15-1-2',
          number: '1.5.1.2',
          title: '解剖一块 AMD GPU：驱动眼中的 IP block',
          titleEn: 'Anatomy of an AMD GPU: IP Blocks',
          duration: 20,
          difficulty: 'beginner',
          tags: ['IP-block', 'GC', 'SDMA', 'VCN', 'amdgpu'],
          concept: {
            summary:
              '一块 AMD GPU 不是铁板一块，而是一组带版本号、可混搭的功能模块（IP block）：GC 负责图形和计算，SDMA 负责搬运，VCN 负责视频编解码，DCN 负责显示，PSP 负责固件安全，SMU 负责电源时钟。amdgpu 驱动的源码就按这个结构组织——理解了 IP block，你就拿到了读驱动代码的地图。',
            explanation: [
              '打开 drivers/gpu/drm/amd/amdgpu/ 你会看到几百个文件，但命名极有规律：gfx_v11_0.c、sdma_v6_0.c、vcn_v4_0.c、psp_v13_0.c……每个文件对应"某个 IP block 的某个版本"。IP（Intellectual Property）block 是芯片设计行业的说法：一个可复用的功能单元设计。AMD 把 GPU 拆成十来个 IP，各自独立演进版本，一颗具体芯片就是"一组特定版本 IP 的组合"。',
              '主要成员认一遍：GC（Graphics & Compute，含所有 CU、命令处理器和缓存，本课程 80% 的内容都住在这里）；SDMA（System DMA，搬运数据和更新 GPU 页表的专用引擎，驱动做换页、迁移全靠它）；VCN（视频编解码）；DCN（显示控制器，输出到 DP/HDMI，代码量巨大的 display/ 目录归它）；GMC/VM hub（显存控制器与地址翻译）；IH（中断集线器）；PSP（安全处理器，负责验证并加载其他 IP 的固件——GPU 上电时 PSP 先醒）；SMU（时钟、电压、风扇的管家）。',
              '现代 AMD GPU 的 VBIOS 里有一张 IP discovery 表，列出这颗芯片装了哪些 IP、各是什么版本。驱动初始化时读表，按版本号挑选对应实现挂载（amdgpu_discovery.c）。这就是一份 amdgpu 驱动能同时支持从 Vega 到 RDNA4 十几代产品的机制：新芯片来了，多数 IP 版本没变的代码直接复用。',
              '换算规则记住一条：LLVM/ROCm 说的 gfx1102，等于内核说的 GC 11.0.2（IP_VERSION(11, 0, 2)），等于市场说的 RX 7600 XT（Navi33）。三套名字指向同一个东西，驱动邮件列表里三种混用，你都要能瞬间反应。',
            ],
            keyPoints: [
              'GPU = 一组带版本号的 IP block；amdgpu 源码文件名 = IP 名 + 版本号。',
              'GC 是图形+计算主体；SDMA 是驱动的搬运工；PSP 先于一切启动（固件安全链）。',
              'IP discovery：VBIOS 自带"配置清单"，驱动按表组装——一份驱动吃下十几代 GPU 的秘密。',
              'gfx1102 = GC 11.0.2 = Navi33 = RX 7600 XT，三套命名要能互译。',
              '读驱动代码前先问"这属于哪个 IP"，比按文件夹乱翻效率高一个量级。',
            ],
          },
          diagram: {
            title: '一颗 ASIC 里的 IP block 与驱动文件的对应',
            svgId: 'amd-gpu-ip-blocks',
            content: `┌─────────────── AMD GPU ASIC ───────────────┐
│ ┌────────────────────┐ ┌─────────────────┐　　　　　　　　 │
│ │ GC 图形+计算        │ │ GMC/VM 显存控制  │               │
│ │ (CU/CP/缓存)       │ │                 │ │──VRAM
│ ├─────────┬──────────┤ ├────────┬────────┤　　　　　　 │
│ │ SDMA    │ VCN 视频 │ │ IH 中断 │ SMU 电源│           │
│ ├─────────┼──────────┤ └────────┴────────┘　　　　　　 │
│ │ DCN 显示 │ PSP 安全 │　　                            │
│ └─────────┴──────────┘　　　　　　                     │
└────────────────┬───────────────────────────────────────┘
              PCIe ↔ CPU
驱动映射: gfx_v11_0.c / sdma_v6_0.c / vcn_v4_0.c ...`,
            caption: '左侧每个块在 amdgpu 里都有对应的 <ip>_v<版本>.c 文件族。GC 是本课程主角，SDMA/GMC 在内存课再见，DCN 自成体系。',
          },
          codeWalk: {
            title: 'IP discovery：驱动怎么知道芯片里有什么',
            language: 'c',
            file: 'drivers/gpu/drm/amd/amdgpu/amdgpu_discovery.c（节选简化）',
            code: `/* 每个 IP block 版本注册一份 ip_block_version:
 * 同一个 GC 11.0.x 家族共享 gfx_v11_0 实现 */
static int amdgpu_discovery_set_gc_ip_blocks(
        struct amdgpu_device *adev)
{
	switch (amdgpu_ip_version(adev, GC_HWIP, 0)) {
	case IP_VERSION(11, 0, 0):   /* Navi31 */
	case IP_VERSION(11, 0, 1):
	case IP_VERSION(11, 0, 2):   /* Navi33 = gfx1102 */
	case IP_VERSION(11, 0, 3):
		amdgpu_device_ip_block_add(adev,
				&gfx_v11_0_ip_block);
		break;
	case IP_VERSION(12, 0, 0):   /* RDNA4 */
	case IP_VERSION(12, 0, 1):
		amdgpu_device_ip_block_add(adev,
				&gfx_v12_0_ip_block);
		break;
	}
	return 0;
}
/* 所有 IP 版本号来自 VBIOS 的 discovery 表,
 * 启动日志: dmesg | grep "amdgpu.*HWIP" 可见 */`,
            explanation:
              '注意 switch 的判据是 IP 版本而不是芯片名——Navi31/32/33 三颗芯片共用一套 gfx_v11_0 代码，只在少数 case 里按小版本微调。这是 amdgpu 最重要的代码组织惯例：能按 IP 版本分支就不按芯片名分支。后面 C/C++ 补强课会回到这个函数看 ops 结构体如何实现"一个接口、多代硬件"。',
          },
          miniLab: {
            title: '不装任何东西，画出你（或示例 GPU）的 IP 清单',
            objective: '学会从 dmesg 或源码两条路径读出一颗 GPU 的 IP 组成。',
            steps: [
              '有 AMD GPU 的机器：运行 sudo dmesg | grep -iE "amdgpu.*(hwip|ip block|fw)" ，找出 GC/SDMA/VCN/PSP/SMU 的版本行',
              '没有硬件：打开 elixir.bootlin.com，进入 drivers/gpu/drm/amd/amdgpu/，用文件名反推——ls 出 gfx_v*.c、sdma_v*.c、vcn_v*.c 各有哪些版本',
              '在 amdgpu_discovery.c 里搜 IP_VERSION(11, 0, 2)，数一数 Navi33 出现在几个 set_xxx_ip_blocks 函数里',
              '画一张你的 GPU 的 IP 表：IP 名 | 版本 | 对应源文件 | 一句话职责',
              '思考题写进日志：为什么 PSP 必须最先初始化？（提示：别的 IP 的固件谁来验签加载？）',
            ],
            expectedOutput:
              'RX 7600 XT 的典型清单：GC 11.0.2（gfx_v11_0.c）、SDMA 6.0.2（sdma_v6_0.c）、VCN 4.0.4、DCN 3.1.4、PSP 13.0.8、SMU 13.0.8、GMC 11.0.2、IH 6.0.2。思考题答案：所有 IP 的固件都由 PSP 验证并加载，所以 PSP 是信任链的根，必须最先起来。',
            hint: '看不懂 dmesg 里哪行是 IP 版本？找形如 "detected ip block number ..." 或各 IP 固件版本打印的行。',
          },
          debugExercise: {
            title: '新 GPU 插上后驱动为什么全线崩溃？',
            language: 'c',
            question: '有人给驱动加新芯片支持时这样写。上游 review 会直接打回，为什么？',
            buggyCode: `/* 想给新的 Navi3x 变体启用 GFX11 */
static int broken_set_gc_ip(struct amdgpu_device *adev)
{
	/* "反正都是 Navi3x, 按芯片名判断多直观" */
	if (adev->asic_type == CHIP_NAVI33 ||
	    adev->flags & AMD_IS_APU) {
		amdgpu_device_ip_block_add(adev,
				&gfx_v11_0_ip_block);
	} else {
		/* 其他一律当老架构处理 */
		amdgpu_device_ip_block_add(adev,
				&gfx_v10_0_ip_block);
	}
	return 0;
}`,
            hint: 'APU 都是 GFX11 吗？下一颗 Navi3x 变体出来时这段代码会发生什么？对照正确版本的 switch 判据。',
            answer:
              '两处根本错误。其一，判据用错了维度：asic_type（芯片名）和 IP 版本不是一一对应——AMD_IS_APU 的机器里既有 GFX9 的老 APU 也有 GFX11.5 的 Strix，把它们全塞给 gfx_v11_0 会在老 APU 上撞非法寄存器。其二，else 兜底是定时炸弹：任何未列出的新芯片（比如后来的 RDNA4）会被静默当成 GFX10 初始化，表现为启动时一串固件加载失败或直接页错误，极难定位。正确做法就是上一节 codeWalk 的样子：switch (amdgpu_ip_version(adev, GC_HWIP, 0))，按 IP 版本枚举，未知版本明确返回 -EINVAL 让探测失败并打日志。教训：amdgpu 世界里"这是哪颗芯片"几乎永远是错误的问题，"这是哪个版本的 IP"才是对的。',
          },
          interviewQ: {
            question: '为什么一份 amdgpu 驱动能同时支持从 Vega 到 RDNA4 的所有 GPU？说说 IP discovery 机制。',
            difficulty: 'medium',
            hint: '关键词：IP block 版本化、VBIOS 中的 discovery 表、按版本选择实现。',
            answer:
              'AMD 把 GPU 设计成一组独立版本化的 IP block（GC、SDMA、VCN、DCN、PSP、SMU 等），芯片 = IP 版本组合。VBIOS 里内置一张 IP discovery 表，驱动初始化时读出本芯片每个 IP 的版本号，amdgpu_discovery.c 按版本号把对应实现（如 gfx_v11_0）注册进设备的 ip_block 列表，之后统一按 sw_init→hw_init→late_init 的生命周期驱动它们。新芯片如果大多数 IP 版本不变，就只需为变化的 IP 添加新 case 或新文件，其余代码直接复用；这比"每代 GPU 一份驱动"的维护成本低得多。加分点：这套机制也解释了内核日志里的 IP 版本打印、以及为什么上游 review 拒绝按芯片名做行为分支。',
            amdContext: '这是 amdgpu 组新人面试的高频题，往往接着追问"如果一个 IP 的 hw_init 失败会怎样"（按序回滚已初始化的 IP）——留意模块 5 会实战这个问题。',
          },
        },
      ],
    },
    // ════════════════════════════════════════════════════════════
    // Group 1.5.2: 执行模型
    // ════════════════════════════════════════════════════════════
    {
      id: '15-2',
      number: '1.5.2',
      title: '执行模型：wave、CU 与 WGP',
      titleEn: 'Execution Model: Waves, CUs & WGPs',
      icon: 'Layers',
      description: 'AMD GPU 术语的核心区。四节课建立完整执行模型：软件层级（work-item→grid）、硬件层级（SIMD→WGP）、资源与并行度的关系（occupancy），最后用一个 HIP kernel 把全部概念串起来。',
      lessons: [
        // ── Lesson 1.5.2.1 ────────────────────────────────────
        {
          id: '15-2-1',
          number: '1.5.2.1',
          title: 'work-item、wavefront、workgroup、grid',
          titleEn: 'Work-items, Wavefronts, Workgroups, Grids',
          duration: 20,
          difficulty: 'beginner',
          tags: ['wavefront', 'wave32', 'workgroup', 'EXEC-mask'],
          concept: {
            summary:
              '软件层级四件套：work-item 是一个逻辑线程；wavefront 是硬件真正的调度单位——32 或 64 个 work-item 锁步执行同一条指令流；workgroup 是能共享 LDS、能 barrier 同步的一组 wave；grid 是一次 kernel 启动的全部。AMD 的 wavefront 就是 NVIDIA 的 warp。',
            explanation: [
              '你写 kernel 时面对的是单个 work-item 的视角（"我这个线程算 c[i]"），但硬件从不单独执行一个 work-item。硬件把 32 个（RDNA）或 64 个（GCN/CDNA）work-item 捆成一个 wavefront，共用一个程序计数器：同一拍里，wave 的所有 lane 执行同一条指令，只是操作各自的数据——这就是 SIMT（单指令多线程）。',
              '分支怎么办？wave 里有人走 if、有人走 else 时，硬件用 EXEC 掩码逐路执行：先关掉 else 组的 lane 跑完 if 分支，再反转掩码跑 else 分支。两个分支的时间是叠加的，这叫分支发散（divergence）——GPU 代码要尽量让同一个 wave 内的线程走同一条路。EXEC 掩码是 RDNA ISA 里最重要的寄存器之一，读任何 AMD 汇编都会撞到它。',
              'wave 大小是 AMD 两条产品线的分水岭：GCN 时代固定 wave64（在 SIMD16 上分 4 拍发完）；RDNA 把 SIMD 加宽到 32 lane，原生 wave32 一拍一条指令，但保留 wave64 模式（一条指令自动分两拍）。注意这是"每个着色器二选一"而不是"每代产品二选一"——RDNA 上编译器按着色器类型和寄存器压力选模式，比如像素着色器常用 wave64、计算常用 wave32。CDNA 则永远 wave64。写工具链或内核 trap 处理时两种都得支持。',
              'workgroup 的本质是"共享资源的边界"：同组的 wave 可以用 LDS 交换数据、用 s_barrier 对齐进度，所以整个 workgroup 必须落在同一个 WGP（LDS 所在地，下一课拆开看）。上限 1024 个 work-item。grid 则没有共享语义——不同 workgroup 之间不保证执行顺序、不保证并发，这是 GPU 编程模型可伸缩的根基：硬件想怎么撒就怎么撒。',
            ],
            keyPoints: [
              'wavefront = AMD 的 warp：32/64 个 work-item 共享指令流锁步执行。',
              'RDNA wave32 原生 + wave64 两拍模式，按着色器选择；GCN/CDNA 固定 wave64——"RDNA=wave32" 是不完整的说法。',
              '分支发散靠 EXEC 掩码实现，代价是两个分支串行执行。',
              'workgroup = 共享 LDS + barrier 的边界，≤1024 work-item，整组必须进同一个 WGP。',
              'workgroup 之间无顺序保证——这是 GPU 可伸缩性的根基，也是很多并发 bug 的来源。',
            ],
          },
          diagram: {
            title: '四级层级与 EXEC 掩码',
            svgId: 'thread-hierarchy',
            content: `grid ─▶ workgroup(≤1024) ─▶ wavefront(32/64) ─▶ work-item
                │                  │
            共享 LDS+barrier    共享指令流(锁步)
EXEC 掩码: [11111111 11110000 00001111 11111111]
            ↑ 分支发散时部分 lane 被关闭`,
            caption: '左→右逐级放大。底部一排是 wave32 的 32 条 lane：EXEC 掩码为 0 的 lane 这一拍"陪跑"不写结果。表格对照 AMD/HIP/硬件三套叫法。',
          },
          codeWalk: {
            title: '一段真实的 RDNA3 汇编：看见 wave 和 EXEC',
            language: 'asm',
            file: 'vecAdd 编译产物（RDNA3, 简化注释版）',
            code: `; c[i] = a[i] + b[i] 的核心 (hipcc --offload-arch=gfx1102)
; s_ 开头 = 标量指令(每 wave 一份), v_ = 矢量(每 lane 一份)
        s_load_b128  s[0:3], s[4:5], 0x0   ; 读 a,b 指针(整个wave共享)
        s_load_b64   s[6:7], s[4:5], 0x10  ; 读 c 指针
        v_lshlrev_b32 v1, 2, v0            ; 每条lane: 偏移 = i*4
        s_waitcnt    lgkmcnt(0)            ; 等标量加载完成
        global_load_b32 v2, v1, s[0:1]     ; 32条lane一拍发出合并加载
        global_load_b32 v3, v1, s[2:3]
        s_waitcnt    vmcnt(0)              ; 等显存数据回来
        v_add_f32    v2, v2, v3            ; 32个加法同时完成
        global_store_b32 v1, v2, s[6:7]
        s_endpgm
; if(i<n) 会编译成: v_cmp_lt → s_and_saveexec_b32
;   = 把比较结果写进 EXEC, 越界 lane 被关闭`,
            explanation:
              's_ 与 v_ 的分工是 AMD ISA 的第一眼特征：指针、循环计数这类"全 wave 相同"的值放标量寄存器（一份），每 lane 不同的值放矢量寄存器（32 份）。s_waitcnt 暴露了另一个真相：访存是异步的，编译器负责在用数据前插入等待——这就是"延迟隐藏"在指令层的样子。想亲眼看：Compiler Explorer 选 HIP 语言即可复现。',
          },
          miniLab: {
            title: '在浏览器里编译出你的第一段 GPU 汇编',
            objective: '不装任何工具，亲眼确认 wave32/wave64 的编译差异。',
            steps: [
              '打开 godbolt.org，语言选 HIP，编译器选新版 clang（HIP/AMDGPU）',
              '粘贴一个最小 kernel：__global__ void k(float*a){ int i=threadIdx.x+blockIdx.x*blockDim.x; a[i]*=2.f; }',
              '编译参数填 --offload-arch=gfx1102 -O3，在输出里找 v_、s_、global_load/store 和 s_endpgm',
              '加上 -mwavefrontsize64 再编译一次，对比：注意 EXEC 相关指令从 _b32 变成 _b64（如 s_and_saveexec_b64）',
              '把两次输出里代表 wave 模式的那一行截图/摘抄进学习日志',
            ],
            expectedOutput:
              '两个版本主体几乎一样，但 wave64 版的 EXEC/掩码操作用 64 位形式（s_..._b64、v_cmp 结果占一对 SGPR）。结论写一句：wave 模式是编译期选择，同一硬件两种都能跑。',
            hint: '找不到 HIP 语言入口就直接选 C++ + clang trunk，加 -x hip --offload-arch=gfx1102 -nogpulib -S 也能出汇编。',
          },
          debugExercise: {
            title: '这个 kernel 在 MI300 上算错，在 RX 7600 XT 上却是对的',
            language: 'cpp',
            question: '同一段归约代码在消费卡上结果正确，搬到 Instinct 上结果错误。找出隐藏假设。',
            buggyCode: `__global__ void reduce_sum(float *data, float *out)
{
    __shared__ float buf[256];
    int t = threadIdx.x;
    buf[t] = data[blockIdx.x * 256 + t];
    __syncthreads();
    for (int s = 128; s > 32; s >>= 1) {
        if (t < s) buf[t] += buf[t + s];
        __syncthreads();
    }
    /* "最后 32 个线程在同一个 wave 里,
        天然同步, 不需要 barrier" */
    if (t < 32) {
        buf[t] += buf[t + 32];
        buf[t] += buf[t + 16];
        buf[t] += buf[t + 8];
        buf[t] += buf[t + 4];
        buf[t] += buf[t + 2];
        buf[t] += buf[t + 1];
    }
    if (t == 0) *out = buf[0];
}`,
            hint: '"32 个线程天然同步"这句话在哪种硬件上成立？MI300 的 wave 是多大？',
            answer:
              '代码假设 wave 大小是 32：当 s<=32 时省掉 __syncthreads()，赌"这 32 个线程属于同一个 wave、锁步执行不需要同步"。在 RDNA 消费卡上该 kernel 以 wave32 编译，赌赢了；MI300 是 CDNA、固定 wave64——t<32 的线程和 t 在 32..63 的线程确实同 wave，但循环上一轮 s=64 时 if(t<64) 的写入分布在整个 wave64 里，靠掩码分批执行的写读顺序并无跨迭代保证，且省 barrier 的推理只对"wave 内锁步"成立、边界划在 64 而不是 32——各线程读到 stale 数据，结果错误。正确做法：不要硬编码 32，用编译器内置的 warpSize（HIP 里运行时为 32 或 64），或干脆全程 __syncthreads()，性能敏感时用 __builtin_amdgcn_wave_barrier/wave 内置归约。教训：任何写死 32/64 的 wave 假设都是可移植性炸弹——这正是 RDNA/CDNA 双线并存强加给所有 AMD 软件的纪律。',
          },
          interviewQ: {
            question: '什么是分支发散？EXEC 掩码在其中扮演什么角色？给一个降低发散代价的实际手法。',
            difficulty: 'medium',
            hint: '从"wave 共享一个 PC"推出"两个分支只能串行"，EXEC 决定谁写结果。',
            answer:
              '一个 wavefront 只有一个程序计数器，wave 内线程按条件走向不同分支时，硬件只能把两条路径都执行一遍：先置 EXEC 掩码为"走 if 的 lane"执行 if 路径（被关掉的 lane 不写回结果），再反转掩码执行 else 路径，最后合流恢复掩码。总耗时≈两条路径之和，这就是发散代价。降低手法举例：按条件重排数据/线程（让同 wave 的线程条件相同，比如按材质分桶再派发）、把分支改写为无分支的 select/掩码运算（v_cndmask）、或者在 wave 边界对齐工作划分（每 32/64 个一组同质任务）。加分点：发散只影响 wave 内部；不同 wave 走不同分支毫无代价——所以"发散优化"的粒度永远是 wave 大小。',
            amdContext: 'AMD 着色器编译器组和性能组都爱问这题；驱动组的变体是"为什么 trap handler 必须保存/恢复 EXEC"——因为它是 wave 执行状态的一部分。',
          },
        },
        // ── Lesson 1.5.2.2 ────────────────────────────────────
        {
          id: '15-2-2',
          number: '1.5.2.2',
          title: 'CU 与 WGP：SIMD32、标量单元与寄存器',
          titleEn: 'CU & WGP: SIMD32, Scalar Unit, Registers',
          duration: 20,
          difficulty: 'intermediate',
          tags: ['CU', 'WGP', 'SIMD32', 'SGPR', 'VGPR'],
          concept: {
            summary:
              'CU（Compute Unit）是 AMD GPU 的"核心"：2 个 SIMD32 矢量单元 + 标量单元 + L0 缓存。RDNA 把两个 CU 组成一个 WGP，共享 128 KiB LDS 和指令缓存。SGPR 存"全 wave 一份"的值，VGPR 存"每 lane 一份"的值——这对分工是 AMD ISA 的灵魂。',
            explanation: [
              '自上而下再走一遍硬件层级：整颗 GPU 分成若干 Shader Engine（SE，带几何/光栅化等图形硬件），每个 SE 含 2 个 Shader Array（SA，内核代码里叫 SH），SA 里排着 WGP。RX 7600 XT：2 SE × 2 SA × 4 WGP = 16 WGP = 32 CU。旗舰 Navi31 则是 6 SE × 2 SA × 4 WGP = 96 CU。市场页写的"2048 个流处理器"就是 32 CU × 64 lane，数"核心"请数 CU。',
              '钻进一个 CU：两个 SIMD32，各自带一大块 VGPR（矢量寄存器堆，Navi33 上每 SIMD 1024 个 32 位×32 lane 的寄存器 = 128 KiB；Navi31/32 加大到 1536 个）；一个标量单元（SALU）带 SGPR，处理全 wave 共享的活——地址计算、循环控制、条件掩码；还有一个 L0 矢量数据缓存（32 KiB）。wave 被派到某个 SIMD 的 wave slot 上驻留（RDNA2/3 每 SIMD 16 个 slot），它的 VGPR/SGPR 分配也钉在那个 SIMD 上直到退役。',
              'WGP（Workgroup Processor）是 RDNA 的新组织：2 个 CU 捆一起，共享 128 KiB LDS、L0 指令缓存和标量缓存。为什么这样设计？因为 workgroup 的共享语义（LDS + barrier）需要一个硬件"家"，把家建在 2 个 CU 之上意味着一个 workgroup 的 wave 可以铺满 4 个 SIMD32 并行推进。CDNA 没有 WGP——它保留 GCN 布局：每 CU 4 个 SIMD16 + 自己的 64 KiB LDS（CDNA4 提到 160 KiB）。所以"LDS 多大"这种问题永远要先问哪条架构线。',
              '这一层还有个高频陷阱：内核代码全用 GCN 时代的名字。SH = Shader Array；active_cu_number 数的是 CU；TCP（Texture Cache per Pipe）指的其实是 L0 数据缓存路径；连 LLVM 三元组都叫 amdgcn。在 RDNA4 上跑的代码，说着 2012 年的方言——读驱动时别试图把这些名字和营销图一一对应，先查内核自己的 amdgpu-glossary。',
            ],
            keyPoints: [
              '层级：GPU → SE → SA(内核叫SH) → WGP → CU → SIMD32 → lane；RX 7600 XT = 2/2/4 = 32 CU。',
              'CU = 2×SIMD32 + SALU + L0；wave 驻留在 SIMD 的 wave slot 上（RDNA2/3 每 SIMD 16 个）。',
              'SGPR：全 wave 一份（指针/条件/循环）；VGPR：每 lane 一份（数据）——s_/v_ 指令前缀由此而来。',
              'WGP = 2 CU 共享 128 KiB LDS + 指令缓存，是 workgroup 的硬件"家"；CDNA 无 WGP（CU 各带 64 KiB LDS）。',
              '内核代码讲 GCN 方言：SH、TCP、active_cu_number、amdgcn——名字老但硬件新。',
            ],
          },
          diagram: {
            title: '从整颗芯片钻到 WGP 内部',
            svgId: 'wgp-cu-internals',
            content: `GPU → SE ×2 → SA ×2 → WGP ×4        (RX 7600 XT)
┌──────────────── WGP ────────────────┐
│ ┌── CU0 ──────────┐ ┌── CU1 ───────┐　　　　　　　　 │
│ │ SIMD32 + VGPR　　　　│ │ SIMD32 + VGPR　　　　│    │
│ │ SIMD32 + VGPR　　　　│ │ SIMD32 + VGPR　　　　│    │
│ │ SALU + SGPR　　　　  │ │ SALU + SGPR　　　　  │    │
│ │ L0 数据缓存 32K      │ │ L0 数据缓存          │    │
│ └─────────────────┘ └───────────────┘　　　　　　　　│
│      共享: LDS 128 KiB + L0 指令缓存　　             │
└──────────────────────────────────────────────────────┘`,
            caption: '顶部面包屑：本图聚焦一个 WGP。一个 workgroup 的 8 个 wave 可以铺满这 4 个 SIMD32；LDS 在 WGP 级共享解释了"workgroup 不能跨 WGP"。',
          },
          codeWalk: {
            title: '驱动怎么数 CU：gfx_config 与 sysfs',
            language: 'c',
            file: 'drivers/gpu/drm/amd/amdgpu/amdgpu_gfx.c（节选简化）',
            code: `/* 驱动初始化时从寄存器读出 CU 拓扑并缓存: */
struct amdgpu_gfx_config {
	unsigned max_shader_engines;      /* SE 数: Navi33=2  */
	unsigned max_sh_per_se;           /* 每SE的SA数: 2    */
	unsigned max_cu_per_sh;           /* 每SA的CU数: 8    */
	/* harvest 后实际可用的 CU 位图: */
	uint32_t cu_bitmap[4][4];
};

/* 用户态看到的 CU 数就来自这里: */
static ssize_t amdgpu_get_cu_number(...)
{
	return sysfs_emit(buf, "%d\\n",
		adev->gfx.cu_info.number);
	/* $ cat /sys/class/drm/card0/device/... */
}
/* 注意: 全程没有 "WGP" 这个词 ——
 * 内核按 GCN 口径数 CU, RDNA 的 WGP=CU/2 自己换算 */`,
            explanation:
              'cu_bitmap 暴露了一个工业事实：同一颗芯片会因良率关闭部分 CU（harvest），RX 7600 与 7600 XT 就是这么分出来的。驱动必须读位图而不是查表硬编码。另一个观察点：结构体字段名 max_sh_per_se——SH 就是 Shader Array，GCN 方言实锤。',
          },
          miniLab: {
            title: '三块 GPU 的拓扑口算 + 实测对照',
            objective: '把 SE/SA/WGP/CU 层级变成肌肉记忆。',
            steps: [
              '打开 ROCm gpu-arch-specs 表，抄下三块卡的 CU 数：RX 7600 XT（32）、RX 7900 XTX（96）、MI300X（304）',
              '口算 WGP 数：前两块 RDNA 卡 ÷2（16、48）；MI300X 是 CDNA——写"无 WGP"并说明为什么',
              '有 AMD GPU 的机器：cat /sys/class/drm/card*/device/current_compute_partition 2>/dev/null; grep . /sys/class/drm/card*/device/*cu* 2>/dev/null，或用 rocminfo | grep -i "compute unit" 实测 CU 数',
              '对照 dmesg | grep -i "se.*sh\\|cu_info" 能否找到 SE/SA 结构打印',
              '在日志里画出你这块卡（或 RX 7600 XT）的完整树：SE→SA→WGP→CU→SIMD，每层标数量',
            ],
            expectedOutput:
              'RX 7600 XT 树：2 SE × 2 SA × 4 WGP × 2 CU × 2 SIMD32 = 128 个 SIMD32。MI300X 一行注明：CDNA3 无 WGP，304 CU 分布在 8 个 XCD 芯粒上（38 CU/XCD）。',
            hint: 'rocminfo 需要 ROCm；没有就纯查表，训练目标是换算而不是命令。',
          },
          debugExercise: {
            title: '为什么这个 workgroup 永远启动失败？',
            language: 'cpp',
            question: '这个 kernel 在 RDNA3 上 hipLaunchKernel 直接报错。资源哪里超了？',
            buggyCode: `__global__ void big_tile(float *out)
{
    /* 一个 workgroup 想缓存 48KB×4 = 192KB 的瓦片 */
    __shared__ float tileA[48 * 1024 / 4];
    __shared__ float tileB[48 * 1024 / 4];
    __shared__ float tileC[48 * 1024 / 4];
    __shared__ float tileD[48 * 1024 / 4];
    int t = threadIdx.x;
    /* ... 用 1024 个线程协作填充和计算 ... */
    out[t] = tileA[t] + tileB[t] + tileC[t] + tileD[t];
}
/* 启动: big_tile<<<1024, 1024>>>(d_out); */`,
            hint: '__shared__ 落在哪块硬件上？那块硬件属于 CU 还是 WGP？总共多大？',
            answer:
              '__shared__ 就是 LDS，而 LDS 是 WGP 级资源，RDNA 整个 WGP 只有 128 KiB。这个 kernel 要 4 × 48 KiB = 192 KiB，超过任何一个 WGP 能给的量，硬件无法调度这个 workgroup，启动直接失败（hipErrorLaunchOutOfResources 之类）。就算压到 128 KiB 以内，比如 96 KiB，也要付出代价：一个 WGP 同时只能驻留 1 个这样的 workgroup，occupancy 掉到谷底（下一课展开）。修法：把瓦片切小分批处理（tiling+循环），或者评估哪些数组真需要共享——tileC/tileD 若只被本线程使用，改成寄存器/局部变量。顺带记住口径差异：同样的代码在 MI300（CDNA，64 KiB per CU）上限制更紧，跨线移植时 LDS 预算必须重算。',
          },
          interviewQ: {
            question: '为什么 AMD ISA 要把寄存器分成 SGPR 和 VGPR 两类？各存什么？这个设计省了什么？',
            difficulty: 'medium',
            hint: '想一想：一个 wave 里 32 条 lane 有多少数据其实是完全一样的？',
            answer:
              'wave 内大量值对所有 lane 相同：基地址指针、循环计数、uniform 常量、分支条件的汇总结果。若这些也放矢量寄存器，就要复制 32/64 份，浪费最贵的片上资源。AMD 把它们放 SGPR（每 wave 一份，由 SALU 处理），每 lane 各异的数据才放 VGPR（每 lane 一份，由 VALU 处理）。收益：VGPR 压力显著下降（直接换成更高 occupancy）、标量访存可以走独立的 scalar cache、地址计算等公共活只算一次。代价是编译器要做"标量化分析"判断哪些值是 wave-uniform 的。加分点：RDNA 上 SGPR 是固定配额、永远不限制 occupancy，真正的战场在 VGPR——这就是性能调优先看 VGPR 用量的原因。',
            amdContext: '编译器组（LLVM AMDGPU 后端）必问题：s_ 与 v_ 指令的选择就是后端 uniformity analysis 的输出。驱动组则考它的运维版：trap/异常时要保存多少 wave 状态。',
          },
        },
        // ── Lesson 1.5.2.3 ────────────────────────────────────
        {
          id: '15-2-3',
          number: '1.5.2.3',
          title: 'LDS 与 occupancy：延迟隐藏的预算表',
          titleEn: 'LDS & Occupancy: The Latency-Hiding Budget',
          duration: 20,
          difficulty: 'intermediate',
          tags: ['LDS', 'occupancy', 'VGPR', 'wave-slot'],
          concept: {
            summary:
              'occupancy = 实际驻留的 wave 数 ÷ wave slot 上限，它是延迟隐藏能力的直接度量。每个 wave 要占 VGPR 和 LDS，用得越多、同时驻留的 wave 越少。RDNA 上 SGPR 固定配额不参与竞争，决定性因素是 VGPR、LDS 和 workgroup 大小。',
            explanation: [
              '把一个 SIMD32 想成一间有 16 个床位的宿舍（RDNA2/3 每 SIMD 16 个 wave slot，RDNA1 是 20）。床位住满时，任何一个 wave 去等显存，调度器都能立刻找到别的 wave 发指令；床位只住两三个时，大家一起等——ALU 空转，吞吐崩塌。occupancy 就是入住率。',
              '什么决定入住率？每个 wave 入住要带三样行李：VGPR（最大件）、LDS（跟整个 workgroup 合用）、wave slot 本身。以 GPUOpen 官方例子算一遍：RDNA3 大核心每 SIMD 有 1536 个 VGPR，某着色器每 wave 用 128 个 VGPR → ⌊1536/128⌋ = 12 个 wave，入住率 12/16 = 75%。如果优化寄存器用量到 96 个 → 16 个 wave，满员。反过来 LDS 也一样：workgroup 用 32 KiB LDS 时，一个 WGP 的 128 KiB 只够住 4 个 workgroup，它们携带的 wave 数就是上限。',
              '两个必须打破的误区。误区一："occupancy 越高越好"——错，它是预算不是分数。访存少、ALU 密集的 kernel 低 occupancy 也能跑满；有的 kernel 多给寄存器（低 occupancy）反而免掉溢出（spill 到显存的 scratch），净赚。误区二："寄存器不够会报错"——不会，编译器会默默把变量溢出到 scratch 内存，性能悄悄掉一截。所以性能分析第一步永远是让编译器交代资源账单（-Rpass-analysis=kernel-resource-usage）。',
              '给未来驱动工作的连接点：KFD/ROCm 报告的 max_waves_per_cu、驱动给固件设置的 CU 屏蔽、以及调 GPU hang 时 umr 打印的"哪些 wave 卡在哪条指令"，全都建立在这套 wave slot 模型上。现在打好地基，模块 8/9 会直接用。',
            ],
            keyPoints: [
              'occupancy = 驻留 wave 数 / slot 上限（RDNA2/3 每 SIMD 16），衡量的是延迟隐藏预算。',
              '三大限制因子：VGPR 用量、LDS 用量、workgroup 大小；RDNA 的 SGPR 固定配额不限 occupancy。',
              '官方算例：1536 VGPR ÷ 128/wave = 12 waves = 75%（Navi33 每 SIMD 是 1024 VGPR，算法相同）。',
              '高 occupancy ≠ 高性能：它只在延迟是瓶颈时起作用；避免 spill 有时比多住 wave 更赚。',
              '寄存器超用不报错、只溢出（scratch）——让编译器输出资源报告是第一诊断步骤。',
            ],
          },
          diagram: {
            title: 'wave slot 宿舍与 VGPR 预算',
            svgId: 'occupancy-waves',
            content: `SIMD32 的 16 个 wave slot:
[w0][w1][w2][w3][w4][w5][w6][w7][w8][w9][w10][w11][··][··][··][··]
 └── 12 个入住 (75%) ──┘              └── 空床位 ──┘
原因: VGPR 预算 1536 ÷ 每wave 128 = 12
把每wave降到 96 → 16 waves → 100%`,
            caption: '左：wave slot 入住图。右：VGPR 就是房租。下方对比多 wave（等待可切换）与少 wave（集体罚站）的时间线。',
          },
          codeWalk: {
            title: '让编译器交出资源账单',
            language: 'bash',
            file: 'kernel-resource-usage 报告（hipcc 输出示例）',
            code: `$ hipcc -O3 --offload-arch=gfx1102 \\
       -Rpass-analysis=kernel-resource-usage saxpy.cpp

saxpy.cpp:12:1: remark: Function Name: _Z5saxpyifPfS_
    SGPRs: 18                 # 标量寄存器(固定配额,不愁)
    VGPRs: 10                 # ← 关键数字
    AGPRs: 0                  # CDNA 的矩阵累加寄存器
    ScratchSize [bytes/lane]: 0   # ← 0 = 没有溢出, 健康
    Occupancy [waves/SIMD]: 16    # ← 满员!
    LDS Size [bytes/block]: 0

# 反面教材: 某复杂 kernel 的报告
#   VGPRs: 196  → 1536/196 = 7 waves (44%)
#   ScratchSize: 288 → 每 lane 288B 溢出到显存, 危险信号`,
            explanation:
              '这份报告是 GPU 性能工作的体检单：VGPRs 决定 occupancy 上限，ScratchSize 非零说明寄存器溢出（隐性十倍延迟），LDS Size 参与 WGP 级预算。养成习惯：kernel 一写完先看账单，再谈优化。此输出格式来自 ROCm 官方博客 "Register pressure" 一文。',
          },
          miniLab: {
            title: '手算 + 实算三个 kernel 的 occupancy',
            objective: '独立完成 VGPR/LDS 双约束的 occupancy 计算。',
            steps: [
              '手算题（RDNA3 大核心，1536 VGPR/SIMD、16 slot、128 KiB LDS/WGP）：A) 64 VGPR、0 LDS；B) 200 VGPR、0 LDS；C) 80 VGPR、workgroup 256 线程用 64 KiB LDS',
              'A/B 直接除；C 要双线算：VGPR 线 ⌊1536/80⌋=19→封顶16；LDS 线 128/64=2 个 workgroup/WGP = 2×(256/32)=16 waves/WGP = 每 SIMD 4 waves——取小者',
              '在 godbolt 或本机 hipcc 上给任意 kernel 加 -Rpass-analysis=kernel-resource-usage，核对你的手算方法和编译器报告一致',
              '把 C 题的 LDS 减半（32 KiB）重算，体会"LDS 是 workgroup 级房租"',
              '日志里写下你的 occupancy 计算模板（两条线取 min）',
            ],
            expectedOutput:
              'A: 16/16 满员。B: ⌊1536/200⌋=7 waves ≈44%。C: VGPR 线 16，LDS 线 4 waves/SIMD——被 LDS 卡死在 25%；LDS 减半后翻倍到 8 waves/SIMD (50%)。模板：occupancy = min(slot 上限, VGPR 预算线, LDS 预算线, workgroup 尺寸线)。',
            hint: 'C 题换算容易糊：LDS 限制的是"WGP 上能住几个 workgroup"，再乘每组 wave 数（256/32=8），除以 WGP 里的 4 个 SIMD。',
          },
          debugExercise: {
            title: '加了缓存反而慢了三倍',
            language: 'cpp',
            question: '有人给矩阵 kernel 加了"性能优化"，结果吞吐掉到原来的 1/3。资源账单如下，找出原因链。',
            buggyCode: `/* 优化前: 简单版, 报告显示
 *   VGPRs: 48, LDS: 0, Occupancy: 16 waves/SIMD */

/* "优化"后: 每线程缓存一整行到私有数组 */
__global__ void matmul_opt(const float *A,
                           const float *B, float *C, int N)
{
    float rowA[128];               /* 每线程 512 字节 */
    int r = blockIdx.y * blockDim.y + threadIdx.y;
    for (int k = 0; k < 128; k++)
        rowA[k] = A[r * N + k];    /* 先全读进来 */
    /* ... 用 rowA 做累加 ... */
}
/* 新报告:
 *   VGPRs: 256, ScratchSize: 512,
 *   Occupancy: 4 waves/SIMD  */`,
            hint: '128 个 float 想住在哪？VGPR 总共多少个？装不下的部分去了哪里、那里有多慢？',
            answer:
              '因果链：rowA[128] 是每 lane 私有数据，编译器只能用 VGPR 装——128 个 float 就要 128 个 VGPR，加上原有开销直接顶到 256 上限，还是不够，于是 512 字节/lane 溢出到 scratch（显存里的私有区，报告的 ScratchSize:512 就是证据）。两记重拳同时落下：occupancy 从 16 掉到 4（1536/256=6 再被其他因素压到 4），延迟隐藏预算没了；同时每次"命中缓存"实际是访问显存 scratch，比它想替代的全局加载还慢。修法：私有大数组是 GPU 反模式——改用 LDS 让整个 workgroup 共享一份瓦片（每线程摊 4 字节），或者直接依赖 L0/L2 缓存重复加载。判断口诀：报告里 ScratchSize > 0 几乎永远是 bug 级信号。',
          },
          interviewQ: {
            question: 'occupancy 是什么？它由哪些因素决定？为什么说"100% occupancy 不是优化目标"？',
            difficulty: 'hard',
            hint: '定义（wave/slot）→ 三个限制因子 → 它只在延迟受限时是瓶颈。',
            answer:
              'occupancy 是每个 SIMD 实际驻留 wave 数与 slot 上限（RDNA2/3 为 16）之比，度量调度器可用于隐藏延迟的候选 wave 池。限制因子：每 wave 的 VGPR 用量（寄存器堆 ÷ 每 wave 用量）、workgroup 的 LDS 用量（WGP 的 128 KiB ÷ 每组用量，再折算 wave）、workgroup 大小与 slot 数的整除关系；RDNA 上 SGPR 固定分配不参与。它不是目标而是手段：如果 kernel 是算术密集或已被带宽打满，4 个 wave 和 16 个 wave 吞吐相同；而为了拉高 occupancy 压寄存器导致 spill，反而净亏。正确姿势：先看资源报告和 profiler 的停顿原因（等内存？等 ALU？），只有"延迟受限 + occupancy 低"同时成立时才优化它。',
            amdContext: 'GPUOpen 的 "Occupancy explained" 是 AMD 官方处理这题的满分答案模板，面试引用它的 1536/128=12 例子会非常加分。',
          },
        },
        // ── Lesson 1.5.2.4 ────────────────────────────────────
        {
          id: '15-2-4',
          number: '1.5.2.4',
          title: '实践课：一个 HIP kernel 的完整旅程',
          titleEn: 'Hands-on: A HIP Kernel End to End',
          duration: 25,
          difficulty: 'intermediate',
          tags: ['HIP', 'kernel-launch', 'coalescing', 'hands-on'],
          concept: {
            summary:
              '把前三课拼成一条完整因果链：<<<grid, block>>> 里的数字如何变成 WGP 上的 wave、索引数学如何决定访存合并、以及这一切在 rocminfo/资源报告里的可观测痕迹。这节课以动手为主。',
            explanation: [
              '复盘 vecAdd<<<4096, 256>>> 的完整旅程。编译期：hipcc 把 kernel 编译成 gfx1102 的 ISA，选定 wave32，输出资源账单（VGPR/LDS 用量）。启动期：runtime 把"4096 个 workgroup、每组 256 线程"写进一个 dispatch 命令包提交给 GPU（具体怎么提交是下一组课的主线）。硬件调度期：每个 workgroup 被整体分配到某个有空位的 WGP——256 线程切成 8 个 wave32，铺在 WGP 的 4 个 SIMD 上各驻 2 个；4096 个组在全卡 16 个 WGP 间流水轮转，先完成先腾位。',
              '执行期的关键在访存合并（coalescing）：i = blockIdx.x*blockDim.x + threadIdx.x 保证同一 wave 的 32 条 lane 拿到连续的 i，global_load_b32 时 32 个地址正好组成一段连续 128 字节——硬件合并成一次宽事务。要是索引写反（i = threadIdx.x*gridDim.x + blockIdx.x），每条 lane 的地址相距 4096×4 字节，一拍变 32 次独立事务，带宽利用率崩到 1/32。这是 GPU 性能 bug 的第一大户。',
              '边界处理也值得看一眼：n 不是 256 的倍数时，最后一个 workgroup 里有些 lane 的 i ≥ n，if (i < n) 编译成 EXEC 掩码操作把它们关掉。没有这个 if 就是越界写——GPU 上的越界不一定立刻崩，可能默默踩坏隔壁 buffer，等浮出来已经面目全非（模块 6 调试课的常客）。',
              '最后建立可观测性习惯：rocminfo 告诉你硬件参数（CU 数、wave 大小、LDS 上限），资源报告告诉你 kernel 的资源脚印，rocprofv3 一类工具告诉你运行时行为。驱动工程师比应用工程师更需要这条链，因为你将来要解释的是"为什么这个 dispatch 没跑起来"。',
            ],
            keyPoints: [
              '<<<4096, 256>>> → 每组 8 个 wave32 → 落在一个 WGP 的 4 个 SIMD 上各 2 个。',
              'workgroup 是调度原子：整组进同一个 WGP，组间无顺序保证。',
              '相邻 lane 摸相邻地址 = 合并访存；索引转置是第一大性能杀手。',
              '尾部越界靠 if(i<n)→EXEC 掩码兜底；漏写不一定崩但必留隐患。',
              '三件可观测工具：rocminfo（硬件）、资源报告（编译期）、profiler（运行期）。',
            ],
          },
          diagram: {
            title: '从启动配置到 SIMD 的映射全图',
            svgId: 'hip-kernel-mapping',
            content: `vecAdd<<<dim3(4096), dim3(256)>>>(a,b,c)
   grid: 4096 组 ──硬件撒到──▶ 16 个 WGP 轮转
   一个组(256线程) = 8 × wave32
        └──▶ WGP 的 4 个 SIMD32, 各驻 2 wave
索引: i = blockIdx.x*256 + threadIdx.x
   wave 内 32 条 lane → 连续 i → 一次合并加载 128B`,
            caption: '左上代码 → 右侧硬件的完整映射。最下方的索引公式是"合并访存"的根——这张图值得反复回看。',
          },
          codeWalk: {
            title: '可运行的完整程序（含计时与校验）',
            language: 'cpp',
            file: 'vecadd_full.hip.cpp',
            code: `#include <hip/hip_runtime.h>
#include <cstdio>
#define CHECK(x) do { hipError_t e = (x); if (e) { \\
    printf("HIP err %s @%d\\n", hipGetErrorName(e), \\
           __LINE__); return 1; } } while (0)

__global__ void vecAdd(const float *a, const float *b,
                       float *c, int n)
{
    int i = blockIdx.x * blockDim.x + threadIdx.x;
    if (i < n) c[i] = a[i] + b[i];
}

int main()
{
    const int n = 1 << 24;                 /* 16M 元素 */
    float *a, *b, *c;
    CHECK(hipMallocManaged(&a, n * 4));
    CHECK(hipMallocManaged(&b, n * 4));
    CHECK(hipMallocManaged(&c, n * 4));
    for (int i = 0; i < n; i++) { a[i] = 1.f; b[i] = 2.f; }

    dim3 block(256), grid((n + 255) / 256);
    vecAdd<<<grid, block>>>(a, b, c, n);   /* 异步! */
    CHECK(hipGetLastError());              /* 启动错误 */
    CHECK(hipDeviceSynchronize());         /* 等完成   */

    for (int i = 0; i < n; i += n / 7)
        if (c[i] != 3.f) { printf("BAD @%d\\n", i); return 1; }
    printf("OK: %d elements, grid=%d block=%d\\n",
           n, grid.x, block.x);
}`,
            explanation:
              '三个驱动视角的细节：kernel 启动是异步的（<<<>>> 立即返回，错误要用 hipGetLastError 抓）；hipDeviceSynchronize 的底层就是等 fence——下一组课会看到它穿过 ioctl 到达内核；hipMallocManaged 的页迁移行为则是模块 8 KFD 内容的伏笔。',
          },
          miniLab: {
            title: '跑通 + 改坏 + 修好',
            objective: '亲手触发本组课讲过的三类问题并确认症状。',
            steps: [
              '有 ROCm 环境：保存上面的程序，hipcc vecadd_full.hip.cpp -o vecadd && ./vecadd，确认输出 OK；没有环境就在 godbolt 上做编译期部分（第 3、4 步照做）',
              '实验一（并行度）：把 grid 改成 dim3(1)，重跑并计时（time ./vecadd）——体感"只用一个 WGP"的慢',
              '实验二（合并）：把索引改成 int i = threadIdx.x * gridDim.x + blockIdx.x; 观察结果仍"正确"但耗时上升——转置索引覆盖同一集合却毁掉合并',
              '实验三（资源）：加 -Rpass-analysis=kernel-resource-usage 重新编译，记录 VGPR 数和 Occupancy 行',
              '把三个实验的数字对比写进日志，各配一句原因解释',
            ],
            expectedOutput:
              '实验一慢几十倍（4096 组挤一个 WGP 排队）；实验二慢数倍（事务数 ×32）；实验三典型值 VGPR≈8-12、occupancy 16/16。三句解释分别指向：并行度不足、合并失败、资源无压力。',
            hint: '实验二里结果仍正确是因为 threadIdx/blockIdx 的组合仍覆盖 [0,n) ——性能 bug 恰恰经常"结果正确"，这是它可怕的地方。',
          },
          debugExercise: {
            title: '为什么数组尾巴永远是垃圾值？',
            language: 'cpp',
            question: 'n = 1000000 时程序偶尔崩、不崩时 c 的最后几十个元素是垃圾。找出两个 bug。',
            buggyCode: `__global__ void scale(float *c, const float *a, int n)
{
    int i = blockIdx.x * blockDim.x + threadIdx.x;
    c[i] = a[i] * 2.0f;          /* bug 1: 没有边界检查 */
}

int main()
{
    int n = 1000000;
    /* ... 分配并初始化 a, c ... */
    dim3 block(256);
    dim3 grid(n / 256);          /* bug 2: 整除截断 */
    scale<<<grid, block>>>(c, a, n);
    hipDeviceSynchronize();
}`,
            hint: '1000000 / 256 = 3906 余 64。余数去哪了？没有 if(i<n) 时越过的 lane 又写到了哪？',
            answer:
              'bug 2：grid = n/256 = 3906（整除截断），只覆盖 3906×256 = 999936 个元素——最后 64 个元素根本没人算，读出来自然是垃圾。正确写法 grid = (n+255)/256 向上取整。bug 1：修完 bug 2 后 grid 变 3907，总线程 1000192 > n，若无 if (i < n)，多出的 192 条 lane 会写 c[1000000..1000191]——越界写。GPU 上越界后果随机：分配器给的 slack 可能吞掉它（"偶尔不崩"），也可能踩坏相邻 BO 触发 VM fault（dmesg 里的 page fault，模块 6 会教你认）。两个 bug 合起来是 GPU 入门第一坑套餐：向上取整 + 边界 if 永远成对出现。',
          },
          interviewQ: {
            question: '解释什么是访存合并（memory coalescing）。为什么 i = blockIdx.x*blockDim.x + threadIdx.x 是"正确"的索引写法？',
            difficulty: 'medium',
            hint: '主角是 wave 内 32 条 lane 同一拍发出的 32 个地址。',
            answer:
              '一条访存指令执行时，wave 的 32 条 lane 各自给出一个地址。若这 32 个地址落在连续、对齐的一段内存里（如 32 × 4B = 128B），硬件把它们合并成极少数宽事务；若地址分散，就退化成最多 32 次独立事务，有效带宽除以 32。标准索引让 threadIdx.x 相邻的 lane（即 wave 内相邻 lane）拿到相邻的 i，从而访问相邻地址——天然合并。转置写法（threadIdx.x 乘大步长）覆盖相同的索引集合、结果正确，但每拍的 32 个地址相距上千字节，性能崩塌。引申：结构体数组（AoS）会造成天然的跨步访问，GPU 上常改成数组结构体（SoA）；这也是 Vulkan/图形侧 buffer 布局设计的底层原因。',
            amdContext: 'AMD 性能/驱动面试的常青题，常配一段代码让你现场判断合并性；答题时主动画出"lane → 地址"映射图会显著加分。',
          },
        },
      ],
    },
    // ════════════════════════════════════════════════════════════
    // Group 1.5.3: 内存与命令前端
    // ════════════════════════════════════════════════════════════
    {
      id: '15-3',
      number: '1.5.3',
      title: '内存体系与命令前端',
      titleEn: 'Memory System & Command Front-End',
      icon: 'Database',
      description: '驱动工作的主战场。两节内存课（片上层级、VRAM/GTT/GPUVM）+ 两节命令课（ring/PM4/IB、doorbell/队列调度），学完你就理解了 amdgpu 驱动一半的存在意义。',
      lessons: [
        // ── Lesson 1.5.3.1 ────────────────────────────────────
        {
          id: '15-3-1',
          number: '1.5.3.1',
          title: '显存层级：从 VGPR 到 Infinity Cache',
          titleEn: 'Memory Hierarchy: VGPR to Infinity Cache',
          duration: 20,
          difficulty: 'intermediate',
          tags: ['cache', 'Infinity-Cache', 'GDDR', 'HBM'],
          concept: {
            summary:
              '一次访存请求从 CU 出发依次可能命中：L0（每 CU）→ 图形 L1（每 SA，RDNA4 已取消）→ L2（全芯片）→ Infinity Cache（末级大缓存）→ VRAM。GPU 缓存的使命不是像 CPU 那样降延迟，而是省带宽——理解这一点，Infinity Cache 的出现就顺理成章。',
            explanation: [
              '把 RX 7600 XT 的数字排成一列走一遍：每个 SIMD 的 VGPR（128 KiB×4/WGP）是最快的"内存"，零延迟因为它就是寄存器；LDS 128 KiB/WGP 是程序员手动管理的共享便签（~20-40 周期）；L0 矢量缓存 32 KiB/CU 是第一级真缓存；L2 是全芯片共享的 2 MiB（旗舰 Navi31 为 6 MiB）；再往下是 RDNA2 引入的 Infinity Cache——Navi33 32 MiB、Navi31 96 MiB，AMD 文档叫它 MALL（Memory Attached Last Level）；最后才是 GDDR6 显存（Navi33 128-bit @ 18 Gbps ≈ 288 GB/s）。',
              'Infinity Cache 解决的是经济学问题：显存带宽贵（更宽的总线 = 更多引脚 = 更贵的板卡和功耗），而 GPU 是带宽饕餮。加一块几十 MiB 的片上末级缓存，让帧缓冲、常用纹理这类热数据留在片上，等效带宽翻几倍，总线宽度就可以砍——Navi33 用 128-bit 总线打出远超其带宽的有效吞吐，靠的就是它。数据中心的 MI300X 同样配了 256 MiB Infinity Cache，配合 5.3 TB/s 的 HBM3。',
              'GDDR vs HBM 一句话分工：GDDR 是"高频窄车道"，便宜、适合消费卡；HBM 是"堆叠宽车道"，同容量下带宽数倍但封装昂贵，是 Instinct 系列的标配。带宽（而非容量）通常才是 GPU 的粮食——记这个结论比记参数有用。',
              '驱动视角的重点不在容量数字，而在一致性（coherence）：哪些缓存对 CPU 的写可见？GPU 写完什么时候 CPU 能读？答案随代际和访问路径变化，所以 PM4 里有整族缓存刷新/失效包（ACQUIRE_MEM、RELEASE_MEM），驱动在命令流关键点插入它们。你未来会调的一类经典 bug——"数据明明写了但另一侧读到旧值"——根源就在这里。另外注意 RDNA4 取消了每 SA 的图形 L1，缓存拓扑是会动的，写代码别硬编码层级假设。',
            ],
            keyPoints: [
              '层级链：VGPR → LDS → L0(每CU) → [L1 每SA，RDNA4 已删] → L2(全芯片) → Infinity Cache → VRAM。',
              'GPU 缓存为省带宽而生，不为降延迟——延迟靠 wave 切换扛。',
              'Infinity Cache = 片上末级大缓存（Navi33 32 MiB / Navi31 96 MiB / MI300X 256 MiB），换来更窄更省的显存总线。',
              'GDDR＝高频窄车道（消费卡），HBM＝堆叠宽车道（Instinct）；带宽是 GPU 的粮食。',
              '驱动真正的考点是一致性：PM4 的 ACQUIRE_MEM/RELEASE_MEM 在命令流里管理缓存刷新。',
            ],
          },
          diagram: {
            title: '容量与距离：七级阶梯',
            svgId: 'memory-hierarchy',
            content: `VGPR    每SIMD   ~1 cy    128-192 KiB
LDS     每WGP    ~30 cy   128 KiB
L0      每CU     ~30 cy   32 KiB
L1      每SA     ~60 cy   256 KiB (RDNA4 取消)
L2      全芯片   ~100 cy  2-8 MiB
Inf$    全芯片   ~150 cy  32-96 MiB (MALL)
VRAM    板载     ~500 cy  16-24 GB GDDR6`,
            caption: '越往下越大越慢。图中数字为 Navi31 旗舰示例；你的 RX 7600 XT 对应 L2 2 MiB、Infinity Cache 32 MiB。延迟为量级示意，非精确值。',
          },
          codeWalk: {
            title: '一致性长什么样：PM4 里的缓存控制包',
            language: 'c',
            file: 'drivers/gpu/drm/amd/amdgpu/gfx_v11_0.c（节选简化）',
            code: `/* 每次 fence 写回前, 驱动在 ring 里发 RELEASE_MEM:
 * 让 GPU 把脏数据刷出到内存并使相关缓存失效,
 * CPU 才能读到新鲜结果 */
static void gfx_v11_0_ring_emit_fence(
        struct amdgpu_ring *ring, u64 addr,
        u64 seq, unsigned flags)
{
	amdgpu_ring_write(ring,
		PACKET3(PACKET3_RELEASE_MEM, 6));
	amdgpu_ring_write(ring,
		PACKET3_RELEASE_MEM_GCR_GLM_INV |  /* 失效 GL2 元数据 */
		PACKET3_RELEASE_MEM_GCR_GL2_WB  |  /* 回写 L2 脏行    */
		PACKET3_RELEASE_MEM_GCR_GLV_INV |  /* 失效 L0 矢量    */
		PACKET3_RELEASE_MEM_CACHE_POLICY(3) |
		PACKET3_RELEASE_MEM_EVENT_TYPE(
			CACHE_FLUSH_AND_INV_TS_EVENT));
	/* ... 随后写 fence 地址与序号 ... */
}`,
            explanation:
              '每个 GCR_ 标志对应层级图上的一层：GL2_WB 回写 L2，GLV_INV 失效 L0 矢量缓存。这段代码回答了"CPU 怎么知道 GPU 算完并且数据可见"——fence 不只是一个数字，它捆绑着一整套缓存刷新动作。记住这个函数名，模块 5 讲 fence 时你会第三次遇到它。',
          },
          miniLab: {
            title: '给两块卡画缓存名片',
            objective: '用官方数据源独立完成缓存拓扑对照。',
            steps: [
              '打开 ROCm gpu-arch-specs 表，找 RX 7600 XT 和 MI300X 两行',
              '抄录并排表：L0/LDS/L1/L2/Infinity Cache/显存类型与带宽（MI300X 注意按 XCD 口径：4 MiB L2 × 8）',
              '有 ROCm 机器可运行 rocminfo | grep -iA2 cache 对照实测',
              '标出两处结构性差异：MI300X 无图形 L1、LDS 是 64 KiB per CU（CDNA 布局）',
              '日志写一句话：为什么 Navi33 敢用 128-bit 显存总线？',
            ],
            expectedOutput:
              '并排名片完成；结构差异两条标出；一句话答案：32 MiB Infinity Cache 拦截了大部分显存流量，等效带宽远超 288 GB/s 的裸值，总线得以收窄降本。',
            hint: 'specs 表里 Infinity Cache 在 "L3" 列——AMD 文档把 MALL 记作 L3。',
          },
          debugExercise: {
            title: 'GPU 明明写了，CPU 却读到旧值',
            language: 'c',
            question: '内核开发者写了个测试：让 GPU 往一块 BO 写标记，CPU 轮询等待。偶发超时，dump 出来发现内存里其实已经是新值。哪里错了？',
            buggyCode: `/* 简化的内核测试逻辑 */
u32 *cpu_ptr = amdgpu_bo_kptr(bo);   /* CPU 映射 */
*cpu_ptr = 0;

/* 提交一个只有 WRITE_DATA 包的 IB:
 * 让 GPU 把 0xCAFE 写到 bo 的 GPU 地址 */
submit_ib_write_data(ring, gpu_addr, 0xCAFE);
amdgpu_ring_commit(ring);

/* CPU 侧自旋等待 GPU 写入 */
while (READ_ONCE(*cpu_ptr) != 0xCAFE)
        cpu_relax();                 /* 偶发卡死在这 */`,
            hint: 'WRITE_DATA 包写的数据默认停在 GPU 的哪一级？谁负责把它推到 CPU 可见的地方？对照上一节 codeWalk。',
            answer:
              'GPU 的写默认可以停留在其缓存层级里（如 L2），WRITE_DATA 包本身不保证推到内存——CPU 从 DRAM 读，自然可能长时间看到旧值；"偶发成功"只是缓存行恰好被挤出去了。正确做法是像正式的 fence 路径那样：让写操作携带缓存回写语义（RELEASE_MEM 带 GL2_WB，或 WRITE_DATA 包选择写到 memory 且带一致性策略位），或在写后发显式的缓存刷新包，再让 CPU 等待。更工程化的答案：不要手搓轮询协议，用驱动现成的 fence 机制（amdgpu_fence_emit + wait），它把"写入 + 缓存刷新 + 中断唤醒"打包成了正确的整体。教训：跨 CPU/GPU 的每一次"共享内存握手"都必须显式回答缓存一致性问题。',
          },
          interviewQ: {
            question: 'Infinity Cache 是什么？它解决什么问题？和普通 L2 有什么区别？',
            difficulty: 'medium',
            hint: '从"带宽的成本"出发：总线宽度、功耗、命中率。',
            answer:
              'Infinity Cache 是 AMD 自 RDNA2 起加入的片上末级缓存（官方术语 MALL，Memory Attached Last Level），容量几十到几百 MiB（Navi33 32、Navi31 96、MI300X 256），位于 L2 之后、显存控制器之前，全芯片共享。它解决带宽经济学问题：GPU 吞吐随代际暴涨，但加宽 GDDR 总线的成本（引脚/功耗/板级布线）不成比例，于是用大容量片上缓存拦截帧缓冲与热点数据的反复访问，把有效带宽放大数倍，显存总线反而可以收窄（Navi33 仅 128-bit）。与 L2 的区别：L2 是传统意义的一致性缓存、容量小、服务所有客户端的常规缓存协议；Infinity Cache 更靠近显存侧、以命中带宽为目标，两者是串联关系（L2 miss → IC → DRAM）而非替代。注意缓存几何随代际变动（RDNA4 删了每 SA 的图形 L1），回答时点明"以该代 ISA 手册为准"更显专业。',
            amdContext: '硬件常识题，驱动岗常接一问："驱动需要为 Infinity Cache 做什么？"——大体透明，但拓扑报告、部分刷新语义和调试计数器读取都要驱动配合暴露。',
          },
        },
        // ── Lesson 1.5.3.2 ────────────────────────────────────
        {
          id: '15-3-2',
          number: '1.5.3.2',
          title: 'VRAM、GTT 与 GPUVM：驱动眼中的内存',
          titleEn: 'VRAM, GTT & GPUVM: Memory as the Driver Sees It',
          duration: 25,
          difficulty: 'intermediate',
          tags: ['VRAM', 'GTT', 'GART', 'GPUVM', 'TTM'],
          concept: {
            summary:
              'GPU 可用的内存分两类：VRAM（板载显存）和 GTT（借来的系统内存，经 GART 页表映射给 GPU）。GPUVM 再给每个进程一套独立 GPU 页表，让 buffer 无论物理上在哪，GPU 虚拟地址都稳定。amdgpu 用 TTM 管理 BO 的放置与驱逐——这是驱动最核心也最容易出 bug 的地带。',
            explanation: [
              '先立三个名词。VRAM：焊在卡上的 GDDR/HBM，GPU 本地访问、带宽全额（RX 7600 XT：16 GB，驱动报告约 16368 MB）。GTT（Graphics Translation Table domain）：一段普通系统内存，被 GART 页表映射成 GPU 可访问，GPU 走 PCIe 去读写——容量大（默认约系统内存一半）但带宽低一个量级。APU 没有独立显存，"VRAM"是 BIOS 从系统内存划的 carve-out，其余部分照样走 GTT。',
              'GPUVM 是第三个关键角色：GPU 自己的 MMU。每个使用 GPU 的进程拥有独立的 GPU 页表（页表本身通常放在 VRAM 里），着色器发出的地址是 GPU 虚拟地址，逐级页表翻译后落到 VRAM 页或 GTT 页。价值和 CPU 虚拟内存一模一样：进程隔离（你的着色器摸不到别人的 buffer）、地址稳定（buffer 物理搬家，GPU VA 不变，命令里嵌的地址不作废）。页表更新这个脏活由 SDMA 引擎代劳。',
              '内存的基本管理单位是 BO（buffer object，GEM 对象）。用户态创建 BO 时声明首选放置域：扫描输出的帧缓冲必须 VRAM、CPU 频繁写的上传 buffer 适合 GTT。显存吃紧时 TTM（内核的显存管理框架）启动驱逐：挑选受害者 BO，用 SDMA 把它搬到 GTT，腾出 VRAM——被驱逐的 BO 下次被 GPU 用到时再搬回来。整个过程用户态无感知，除了性能。',
              '为什么说这里是 bug 高发区？驱逐涉及"移动一块正被引用的内存"：要等它上面的 fence（谁还在用？）、要更新 GPUVM 页表（别让旧映射悬空）、要处理和新分配的死锁（腾 A 需要先腾 B…）。amdgpu 邮件列表上常年有驱逐相关补丁。另一条线索是 CPU 访问 VRAM 的通道：BAR0 把 VRAM 露给 CPU 直接读写，没开 Resizable BAR 时窗口只有 256 MB，驱动得管理这个小窗口的换入换出。这些机制的代码实现在模块 5（amdgpu 内存管理）全面展开，本课先把地图画对。',
            ],
            keyPoints: [
              'VRAM=本地全速；GTT=GART 映射的系统内存，走 PCIe 慢一个量级；APU 的 VRAM 是 carve-out。',
              'GPUVM=GPU 的 MMU：每进程独立页表，隔离 + 地址稳定；页表更新由 SDMA 执行。',
              'BO 是管理单位：创建时选域，TTM 在压力下驱逐（VRAM→GTT），SDMA 搬运。',
              '驱逐 = 等 fence + 改页表 + 防死锁——驱动 bug 的富矿。',
              'CPU 直读 VRAM 走 BAR0 窗口（Resizable BAR 决定大小）；doorbell 在 BAR2、寄存器在 BAR5。',
            ],
          },
          diagram: {
            title: '两类物理内存 + 一套虚拟地址',
            svgId: 'vram-gtt-gpuvm',
            content: `CPU 侧                      GPU 侧
┌─系统内存─────┐            ┌─VRAM 16GB────┐
│ GTT 页(GPU可见)│◀─PCIe────▶│ BO / 页表     │
│ 普通进程内存  │            └──────────────┘
└──────────────┘                  ▲
        ▲                         │
        └────── GPUVM 页表 ───────┘
   GPU VA ──▶ 翻译 ──▶ VRAM 页 或 GTT 页
TTM: 显存吃紧时 BO 从 VRAM 驱逐到 GTT (SDMA 搬)`,
            caption: '中间的 GPUVM 是关键：着色器只见虚拟地址，物理页在 VRAM/GTT 间搬家对它透明。CPU 直写 VRAM 的 BAR0 窗口在左下角。',
          },
          codeWalk: {
            title: 'BO 放置：域是怎么变成 TTM placement 的',
            language: 'c',
            file: 'drivers/gpu/drm/amd/amdgpu/amdgpu_object.c（节选简化）',
            code: `void amdgpu_bo_placement_from_domain(
        struct amdgpu_bo *abo, u32 domain)
{
	struct ttm_placement *p = &abo->placement;
	unsigned int c = 0;

	if (domain & AMDGPU_GEM_DOMAIN_VRAM) {
		p->places[c].mem_type = TTM_PL_VRAM;
		/* 需要 CPU 访问的 BO 限制在 BAR 可见段 */
		if (abo->flags &
		    AMDGPU_GEM_CREATE_CPU_ACCESS_REQUIRED)
			p->places[c].lpfn =
				visible_pfn_limit(adev);
		c++;
	}
	if (domain & AMDGPU_GEM_DOMAIN_GTT) {
		p->places[c].mem_type = TTM_PL_TT;
		c++;
	}
	/* 顺序即优先级: VRAM 在前 = 首选,
	 * 驱逐时 TTM 会按这个列表找退路 */
	p->num_placement = c;
}`,
            explanation:
              '一个 BO 的 domain 可以同时含 VRAM|GTT——意思是"最好 VRAM，不行 GTT 也能过"，TTM 按列表顺序尝试，这正是驱逐能自动工作的前提。CPU_ACCESS_REQUIRED 那几行是 BAR 窗口管理的入口：CPU 要摸的 VRAM BO 必须落在 BAR0 照得到的物理段里。',
          },
          miniLab: {
            title: '实测你的 VRAM/GTT 家底与住户',
            objective: '把三个抽象名词落到 sysfs/debugfs 的真实数字上。',
            steps: [
              '读总量：cat /sys/class/drm/card0/device/mem_info_vram_total mem_info_gtt_total（除以 1024³ 换算 GB）',
              '读用量：cat mem_info_vram_used mem_info_gtt_used，开一个游戏/视频再读一次，观察变化',
              '看住户明细：sudo cat /sys/kernel/debug/dri/0/amdgpu_gem_info | head -40，每行是一个 BO：大小、当前域（VRAM/GTT/CPU）、标志',
              '找证据：在输出里各找一个住 VRAM 和住 GTT 的 BO，猜测它们的用途（提示：巨大的 VRAM BO 常是帧缓冲或纹理堆）',
              '无 AMD 硬件替代路径：在 elixir 上读 amdgpu_object.c 的 amdgpu_bo_create + 本课 codeWalk 函数，写 100 字流程摘要',
            ],
            expectedOutput:
              '典型输出：vram_total ≈ 17163091968 字节量级（16 GB 卡），gtt_total ≈ 系统内存一半；gem_info 里能看到几十到几百个 BO，扫描输出 BO 固定在 VRAM。日志记录：VRAM/GTT 总量、各一个典型 BO 行的抄录与解读。',
            hint: 'debugfs 需要 root；卡编号可能不是 0，用 ls /sys/kernel/debug/dri/ 先看。',
          },
          debugExercise: {
            title: '性能雪崩：帧率从 120 掉到 9',
            language: 'text',
            question: '用户报告：显存 16 GB 的卡，游戏加载新关卡后帧率从 120 崩到 9，dmesg 无报错。以下是采集到的证据，写出诊断结论和依据。',
            buggyCode: `# 采集 1: 内存水位
mem_info_vram_used : 16.1 GB / 16.0 GB   (爆了)
mem_info_gtt_used  :  6.8 GB

# 采集 2: amdgpu_gem_info 摘要
- 纹理类 BO 总计 13.9 GB, 其中 4.2 GB 域显示为 GTT
- 多个大 BO 的域在两次采样间 VRAM ↔ GTT 反复变化

# 采集 3: GPU 利用率高, 但 SDMA 引擎利用率异常地
#         持续 > 60%`,
            hint: '正常情况下 SDMA 在游戏运行时应该多忙？BO 的域反复横跳意味着什么？',
            answer:
              '诊断：显存超卖引发驱逐抖动（eviction thrashing）。依据链：VRAM 用量顶格 + 4.2 GB 纹理被挤到 GTT——工作集超过了 16 GB 物理显存；BO 域在采样间反复 VRAM↔GTT 横跳，说明"刚被驱逐的 BO 马上又被 GPU 用到、被搬回来，又挤走别人"，形成循环搬运；SDMA 持续 60%+ 是搬运循环的直接证据（正常游戏里 SDMA 只在加载时忙）。每帧都在等 PCIe 搬纹理，帧率自然崩到个位数。这不是驱动 bug 而是资源境况，但驱动工程师要能一眼读出这组体征。缓解路径：游戏降纹理档位；驱动侧的长期工作是更聪明的驱逐策略（LRU 改进、优先级、把只读纹理留 GTT 直读）。此病例的所有观测手段都来自上一节 miniLab——这就是为什么要先学会读表。',
          },
          interviewQ: {
            question: '一个 BO 从"在 VRAM 里被 GPU 使用"到"被驱逐到 GTT"，驱动必须保证哪些事情按什么顺序发生？',
            difficulty: 'hard',
            hint: '想三个问题：谁还在用它？搬运谁来做？地址怎么不失效？',
            answer:
              '顺序大致是：(1) 选中受害者后，先等它身上的 fence——GPU 可能还有在飞的命令引用这块内存，搬早了就是 use-after-free 的 GPU 版本；(2) 在 GTT 侧分配好目标页并 pin 住，用 SDMA 把内容拷过去（CPU memcpy 太慢且要占 BAR 窗口）；(3) 更新 GPUVM 页表，把该 BO 的 GPU 虚拟地址指到新的物理页——注意页表更新本身也是提交给 SDMA 的命令，也有自己的 fence；(4) 页表切换生效（TLB 失效）之后，旧 VRAM 页才能真正释放给新的分配。全程 GPU VA 不变，用户态命令里嵌的地址依然有效——这正是 GPUVM 存在的意义。加分点：驱逐路径要防死锁（为腾空间而驱逐时不能再递归等待需要空间的操作），TTM 用预留（reservation/dma-resv）锁序协议处理，这是模块 5 的重头戏。',
            amdContext: '这是 amdgpu 内存管理岗的核心面试题，答案里的每个环节（fence、SDMA、页表、dma-resv）都对应一个真实源文件；能按顺序讲清楚基本等于通过硬性门槛。',
          },
        },
        // ── Lesson 1.5.3.3 ────────────────────────────────────
        {
          id: '15-3-3',
          number: '1.5.3.3',
          title: '命令处理器：ring、PM4 与 IB',
          titleEn: 'The Command Processor: Rings, PM4 & IBs',
          duration: 25,
          difficulty: 'intermediate',
          tags: ['ring-buffer', 'PM4', 'IB', 'CP'],
          concept: {
            summary:
              'CPU 从不"调用"GPU；它把命令写进内存里的环形缓冲区（ring），GPU 的命令处理器（CP）异步地取出、解析、执行。命令使用 PM4 包格式，大块命令放在 IB（间接缓冲区）里由 ring 引用。这套生产者-消费者模型是 CPU↔GPU 接口的全部真相。',
            explanation: [
              'ring buffer 是一段共享内存加两个指针：WPTR（写指针，生产者=驱动推进）和 RPTR（读指针，消费者=GPU 推进）。驱动把命令写到 WPTR 处、推进 WPTR；GPU 从 RPTR 追赶。环形意味着写到尾部就绕回头，只要 WPTR 别追尾 RPTR（满）就能持续流动。这个结构完美体现第 1 课的吞吐哲学：CPU 批量倾倒工作，GPU 按自己的节奏消化，两者解耦。',
              '命令长什么样？PM4 包：一个 32 位头部（包类型 + 操作码 + 长度）跟若干数据字。最常用的是 type-3 包，操作码告诉 CP 干什么：WRITE_DATA（写内存）、DISPATCH_DIRECT（发起计算）、DRAW_INDEX（绘制）、INDIRECT_BUFFER（跳去执行一个 IB）、RELEASE_MEM（刷缓存+写 fence）。SDMA 引擎有自己的另一套包格式——PM4 是 GC 的方言。',
              'IB（Indirect Buffer）解决"ring 太小"的问题：真实一帧的命令有几百 KB，直接塞 ring 会立刻挤爆。于是用户态（Mesa/ROCm）把命令写进自己的 BO 里，内核只往 ring 放一个 INDIRECT_BUFFER 包（含 IB 的 GPU 地址和长度），CP 解析到它就跳过去执行，完了跳回来。ring 里流动的主要就是这种"跳转指令"加上驱动自己的管理包——这个分工还有安全含义：用户命令永远不直接进 ring，内核有机会校验。',
              '消费端的 CP 不是一个铁疙瘩，而是几颗跑固件的微控制器：图形队列由 PFP（预取解析）+ ME（主执行）流水处理，计算队列归 MEC（每个 MEC 提供多条 pipe，每 pipe 多个队列槽——ACE 就是这些计算队列引擎的名字）。解析到 dispatch/draw 后，工作被交给 SPI 去创建 wavefront、塞进各 CU 的 wave slot——从这里接上第二组课的执行模型。RX 7600 XT 上 dmesg 能看到这些 ring 的名字：gfx_0.0.0、comp_1.0.0…、sdma_0.0.0，每条 ring 背后就是一个硬件队列。',
            ],
            keyPoints: [
              'ring = 共享内存 + WPTR(驱动写) + RPTR(GPU 读)的生产者-消费者环。',
              'PM4 包 = 头部(类型/操作码/长度) + 数据；type-3 是主力（DISPATCH/DRAW/WRITE_DATA/INDIRECT_BUFFER/RELEASE_MEM）。',
              'IB 装大块用户命令，ring 只放跳转引用——容量和安全双赢。',
              'CP 内部：PFP+ME 管图形，MEC(=ACE 们)管计算，都是跑固件的微控制器；SPI 负责生成 wave。',
              'dmesg 里的 gfx_0.0.0 / comp_* / sdma_* 每条 ring 对应一个硬件队列。',
            ],
          },
          diagram: {
            title: '一次提交的全程：用户态 → ring → CP → CU',
            svgId: 'command-submission',
            content: `用户态: Mesa/ROCm ──写 PM4──▶ IB (自己的 BO)
                └── ioctl(CS) ──▶ 内核
内核:  校验+调度 ──▶ ring[WPTR++] = INDIRECT_BUFFER(ib)
                └──▶ 写 doorbell (下一课)
GPU:   CP: PFP→ME (gfx) / MEC (compute)
        └─解析 PM4─▶ SPI 生成 wave ─▶ CU 执行
完成:  RELEASE_MEM ─▶ fence 值+中断 ─▶ 唤醒等待者`,
            caption: '三条泳道自上而下。留意 ring 里那格 INDIRECT_BUFFER——用户命令在 IB 里，ring 只放引用。fence 回边闭合了整个循环。',
          },
          codeWalk: {
            title: '往 ring 里写包：amdgpu_ring 的核心三步',
            language: 'c',
            file: 'drivers/gpu/drm/amd/amdgpu/amdgpu_ring.c（节选简化）',
            code: `/* 第一步: 申请 ring 空间(检查别追尾 RPTR) */
int amdgpu_ring_alloc(struct amdgpu_ring *ring,
                      unsigned int ndw)
{
	if (WARN_ON_ONCE(ndw > ring->max_dw))
		return -ENOMEM;
	ring->count_dw = ndw;
	ring->wptr_old = ring->wptr;
	return 0;
}

/* 第二步: 逐字写入 PM4 (环形回绕用掩码实现) */
static inline void amdgpu_ring_write(
        struct amdgpu_ring *ring, uint32_t v)
{
	ring->ring[ring->wptr++ & ring->buf_mask] = v;
	ring->count_dw--;
}

/* 第三步: 提交 = 把新 WPTR 告诉硬件 */
void amdgpu_ring_commit(struct amdgpu_ring *ring)
{
	/* 补 NOP 对齐到硬件要求的粒度 */
	while (ring->wptr & ring->funcs->align_mask)
		amdgpu_ring_write(ring, ring->funcs->nop);
	ring->funcs->set_wptr(ring);  /* ← 写 doorbell! */
}`,
            explanation:
              'wptr & buf_mask 就是环形回绕（ring 大小取 2 的幂，掩码代替取模）。真正让 GPU 动起来的是最后一行 set_wptr——它写 doorbell 寄存器，下一课的主角。这三个函数是 amdgpu 里被调用最频繁的路径之一，值得背下来。',
          },
          miniLab: {
            title: '数一数你的 GPU 有几条 ring',
            objective: '把"抽象的队列"落到 dmesg 和 debugfs 里可枚举的实体。',
            steps: [
              '运行 sudo dmesg | grep -iE "ring .* uses|ring .* test" ，抄录所有 ring 名字',
              '分类计数：gfx_*（图形）、comp_*（计算，注意编号里的 MEC.pipe.queue 结构）、sdma_*、vcn_*、jpeg_*',
              '交叉验证：ls /sys/kernel/debug/dri/0/ | grep ring，debugfs 里每条 ring 有一个可 dump 的文件',
              '进阶观察：sudo cat /sys/kernel/debug/dri/0/amdgpu_fence_info | head -30，每条 ring 的 fence 序号独立推进——这是"每条 ring 一个有序世界"的直接证据',
              '无硬件路径：在内核源码 gfx_v11_0.c 里搜 num_compute_rings 与 ring 初始化代码，数出理论值',
            ],
            expectedOutput:
              'RX 7600 XT 典型清单：1 条 gfx、若干条 comp_1.x.y（MEC1 的多 pipe/queue）、2 条 sdma、vcn/jpeg 各若干。fence_info 里每条 ring 的 signaled/emitted 序号独立。结论一句：GPU 不是一个队列，是一把队列。',
            hint: 'comp_1.2.0 的三段编号 = MEC.pipe.queue —— 对照下一课的 HQD 概念，这个编号会突然变得有意义。',
          },
          debugExercise: {
            title: 'GPU 收到了一半的命令？',
            language: 'c',
            question: '有人绕过 amdgpu_ring_commit 手写了提交逻辑（教学示意）。GPU 偶尔执行了半个包就 hang。指出两处顺序错误。',
            buggyCode: `/* 教学示意: 手动往 ring 提交一个 3 词的包 */
void broken_submit(struct amdgpu_ring *ring,
                   u32 w0, u32 w1, u32 w2)
{
	u32 *r = ring->ring;

	/* 先告诉硬件"有 3 个新词" */
	ring->wptr += 3;
	ring->funcs->set_wptr(ring);      /* doorbell */

	/* 再把包内容写进去 */
	r[(ring->wptr - 3) & ring->buf_mask] = w0;
	r[(ring->wptr - 2) & ring->buf_mask] = w1;
	r[(ring->wptr - 1) & ring->buf_mask] = w2;
	/* (另外: 谁保证这些写在 doorbell 之前
	    对 GPU 可见?) */
}`,
            hint: 'GPU 看到新 WPTR 的那一刻会做什么？此刻 ring 里躺着什么？还有一个更隐蔽的问题藏在括号里——想想 CPU 的写缓冲。',
            answer:
              '错误一（顺序颠倒）：先推 WPTR/敲 doorbell、后写内容。GPU 在 doorbell 到达的瞬间就可能开始取包，此刻 ring 里那 3 个位置还是旧数据/垃圾——CP 解析到非法包头就是未定义行为，hang 只是最温和的结局。必须先写完内容、再发布 WPTR。错误二（缺内存屏障）：就算调对顺序，CPU 的写缓冲/重排也可能让 doorbell 的 MMIO 写先于 ring 内容的普通内存写到达。正式代码路径里在 set_wptr 前有写屏障（wmb() 或带屏障的 writel 语义）保证"内容先于发布可见"。这是经典的"发布-订阅"内存序问题：数据写 → 屏障 → 发布指针。C/C++ 补强组的并发课会把这个模式泛化——先记住口诀：先数据，后屏障，再发布。',
          },
          interviewQ: {
            question: '为什么 CPU→GPU 用 ring buffer 而不是"CPU 直接写寄存器发命令"？IB 又解决了什么问题？',
            difficulty: 'medium',
            hint: '回到吞吐哲学：解耦、批量、异步；IB 想想容量和安全。',
            answer:
              '逐命令写寄存器意味着 CPU 与 GPU 锁步：每条命令一次 MMIO 往返（微秒级、不可缓存），GPU 快时 CPU 喂不上、CPU 忙时 GPU 饿死，双方互相拖累。ring buffer 把接口变成内存里的生产者-消费者队列：CPU 批量写入后只需一次 doorbell 通知，GPU 按自身节奏异步消费，天然支持流水线和批处理，MMIO 从"每命令一次"降到"每批一次"。IB 再解决两个问题：容量——一帧几百 KB 的命令放进用户自己的 BO，ring 只存跳转引用，小 ring 也能引用海量工作；安全与分工——用户态生成的命令不直接进内核 ring，内核在提交点统一校验/打补丁（如重定位、权限检查）。加分点：这套模型也是理解"GPU hang 时驱动怎么定位卡在哪个包"的前提——RPTR 停在哪，就是嫌疑现场。',
            amdContext: '驱动岗必考。常见追问是"ring 满了怎么办"（等待/扩容策略）和"为什么每个引擎一条或多条 ring"（并行与优先级）——都能从生产者-消费者模型直接推出。',
          },
        },
        // ── Lesson 1.5.3.4 ────────────────────────────────────
        {
          id: '15-3-4',
          number: '1.5.3.4',
          title: 'doorbell、MQD/HQD 与 MES：队列的调度',
          titleEn: 'Doorbells, MQD/HQD & MES: Queue Scheduling',
          duration: 25,
          difficulty: 'advanced',
          tags: ['doorbell', 'MQD', 'HQD', 'MES', 'ACE'],
          concept: {
            summary:
              'doorbell 是一页特殊的 MMIO：往里写一个值，GPU 就知道"某个队列有新活"。硬件能同时活跃的队列有限（HQD 槽位），但系统里的队列可以成百上千（MQD 常驻内存）——MES/HWS 调度固件负责把 MQD 动态装载进 HQD。这套机制是用户态队列（绕过内核提交）的地基。',
            explanation: [
              '先补上一课留的尾巴：set_wptr 到底写了什么？写的是 doorbell——GPU 在 BAR2 上暴露的一整段 MMIO 页。每个队列分到自己的 doorbell 偏移，写入的值就是新 WPTR。妙处在于"写内存地址"这个动作本身携带了两条信息：哪个队列（地址）、进度到哪（值）。GPU 侧硬件监听这段地址，无需中断、无需轮询就被唤醒。这就是全部——被名字唬住的人很多，它真的只是一页会触发硬件动作的 MMIO。',
              '接下来是本课核心矛盾：硬件队列槽（HQD，Hardware Queue Descriptor——一套描述"活跃队列"的寄存器：ring 基址、RPTR/WPTR、doorbell 偏移等）数量有限，GFX11 图形前端是 2 pipe × 2 队列，每个 MEC 也就几十个槽；但一个跑着几十个进程的系统想要的队列多得多——尤其是 ROCm 时代每个进程都想要自己的计算队列。解法是经典的虚拟化思路：队列的完整状态存在内存里一个结构体中，叫 MQD（Memory Queue Descriptor）；要让哪个队列跑，就把它的 MQD 装载进一个 HQD 槽（map），要换人就卸载（unmap）保存回内存。HQD:MQD 的关系 = CPU 核:线程的关系。',
              '谁来做装载/卸载决策？调度固件。GFX11+ 上是 MES（MicroEngine Scheduler，取代了老的 KIQ——内核专用的管理队列）；Instinct/KFD 一侧的对应机制叫 HWS（跑在 MEC 固件里）。MES 支持超额订阅：队列比槽多时时间片轮转，还负责队列优先级和抢占。内核驱动与 MES 的交互本身也走一条 ring（mes ring）——用包告诉它"请把这个 MQD 映射到某 pipe"。',
              '这套机制的战略意义是用户态队列（user-mode queues）：进程创建队列后，拿到自己 ring 的映射和自己的 doorbell 页，提交工作 = 写自己的 ring + 敲自己的 doorbell，全程不进内核！ioctl 只在建队列时发生一次。ROCm/KFD 多年来就这么工作，图形栈也在走向这个模型。代价是调试与安全模型更复杂（内核看不到每次提交了）——这也是为什么 MES 固件的质量直接决定新硬件的启动体验，dmesg 里 MES 相关报错是 GFX11+ 排障的高频关键词。',
            ],
            keyPoints: [
              'doorbell = BAR2 上的 MMIO 页：写入新 WPTR，地址即队列身份——GPU 的唤醒机制就这么简单。',
              'MQD=内存里的队列全状态；HQD=硬件槽位寄存器；map/unmap 如同线程调度上下文切换。',
              'MES（GFX11+，取代 KIQ）/HWS（KFD/MEC）是做 map 决策的调度固件，支持超订、优先级、抢占。',
              '用户态队列 = 自己的 ring + 自己的 doorbell，提交零 ioctl——KFD/ROCm 的既有现实，图形的方向。',
              'ACE = MEC 提供的异步计算队列引擎；MI300 每个 XCD 带 4 个 ACE。',
            ],
          },
          diagram: {
            title: '多队列 vs 少槽位：MES 的活',
            svgId: 'doorbell-queues',
            content: `内存里: MQD0 MQD1 MQD2 ... MQD99   (队列想要多少有多少)
                 │  MES/HWS 挑选并装载
                 ▼
硬件槽: [HQD gfx p0][HQD gfx p1][HQD ace0]...(就这么几个)
提交路径(用户态队列):
  进程写自己的 ring → 写自己的 doorbell 页(BAR2)
  → GPU 发现队列 N 就绪 → CP 取包执行   (全程无 ioctl)`,
            caption: '左边内存里的 MQD 军团，右边稀缺的 HQD 槽位，中间 MES 做装载决策。下条流程注意"无 ioctl"——用户态队列的全部意义。',
          },
          codeWalk: {
            title: 'MQD 里装了什么 + 驱动怎么请求 MES 映射',
            language: 'c',
            file: 'drivers/gpu/drm/amd/amdgpu/amdgpu_mes.c（节选简化）',
            code: `/* MQD 的核心字段(v11 计算队列, 大幅节选):
 * 一个队列被完整描述, 才能被随时装载/卸载 */
struct v11_compute_mqd {
	uint32_t cp_hqd_pq_base_lo;      /* ring 基址   */
	uint32_t cp_hqd_pq_base_hi;
	uint32_t cp_hqd_pq_rptr;         /* 读指针      */
	uint32_t cp_hqd_pq_wptr_poll_addr_lo;
	uint32_t cp_hqd_pq_doorbell_control; /* 门铃偏移 */
	uint32_t cp_hqd_pq_control;      /* 大小/格式   */
	/* ... 百余个字段: 优先级/抢占状态/保护位 ... */
};

/* 内核请求 MES 把队列装进硬件: 也是发包! */
static int mes_v11_0_add_hw_queue(
        struct amdgpu_mes *mes,
        struct mes_add_queue_input *in)
{
	union MESAPI__ADD_QUEUE q = {0};
	q.header.opcode   = MES_SCH_API_ADD_QUEUE;
	q.mqd_addr        = in->mqd_addr;   /* MQD 在哪 */
	q.page_table_base_addr = in->page_table_base_addr;
	q.doorbell_offset = in->doorbell_offset;
	/* 通过 mes ring 提交给调度固件 */
	return mes_v11_0_submit_pkt_and_poll_completion(
			mes, &q, sizeof(q));
}`,
            explanation:
              '两个观察：MQD 字段名全带 cp_hqd_ 前缀——它就是 HQD 寄存器组的内存镜像，装载 = 把这些值灌进寄存器；驱动跟 MES 说话的方式还是"往 ring 里发包"——整个体系自相似：连调度器本身也用队列驱动。',
          },
          miniLab: {
            title: '找到 doorbell 与 MES 的物理证据',
            objective: '把本课三个抽象概念（doorbell/BAR2、MES 固件、队列）逐一实证。',
            steps: [
              '看 BAR：sudo lspci -v -d 1002: | grep -A8 VGA，找 Region 0（VRAM，大）、Region 2（doorbell）、Region 5（寄存器）三行，记下各自大小',
              '看 MES 固件：sudo dmesg | grep -iE "mes" ，找到 MES 固件版本加载行（GFX11+ 才有）；再 ls /lib/firmware/amdgpu/ | grep mes 看固件文件本体',
              '看队列在用谁：sudo cat /sys/kernel/debug/dri/0/amdgpu_fence_info | grep -iA2 mes；跑一个 ROCm/Vulkan 程序前后对比 comp ring 的 fence 变化',
              '把 doorbell 大小和 BAR0 大小抄进日志：doorbell 通常 2 MB，按 4 KB 一页隔离分配，估算它能服务多少队列群',
              '无硬件路径：读内核文档 docs.kernel.org/gpu/amdgpu/gc/mes.html（本课事实来源），摘录 MES 三大职责',
            ],
            expectedOutput:
              '典型 lspci：Region 0 = 16 GB（Resizable BAR 开）或 256 MB；Region 2 = 2 MB doorbell；Region 5 = 1 MB 寄存器。dmesg 有 MES 固件版本行。日志含三个 Region 大小 + MES 职责三条（map/unmap、超订轮转、优先级抢占）。',
            hint: 'lspci 里 doorbell 不会写名字，认准 Region 2 + 2MB 尺寸的组合（本站硬件课会再讲 BAR 布局：0=VRAM、2=doorbell、5=MMIO）。',
          },
          debugExercise: {
            title: '新队列建好了，GPU 却装聋作哑',
            language: 'c',
            question: '有人给驱动加"快速建队列"路径（教学示意），队列建完 doorbell 敲烂了 GPU 也不理。漏了哪一步？还有一个更隐蔽的资源错误。',
            buggyCode: `/* 教学示意: 创建一个新计算队列 */
int broken_create_queue(struct amdgpu_device *adev,
                        struct my_queue *q)
{
	/* 1. 分配 ring buffer 的 BO */
	q->ring_bo = alloc_bo(adev, RING_SIZE);

	/* 2. 在内存里填好 MQD */
	q->mqd = alloc_bo(adev, sizeof(struct v11_compute_mqd));
	fill_mqd(q->mqd, q->ring_bo, q->doorbell_off);

	/* 3. 把 doorbell 偏移给用户态 */
	q->doorbell_off = 0x40;   /* "随便挑一个没用过的" */

	/* 4. 完事! 用户可以写 ring + 敲 doorbell 了 */
	return 0;
}`,
            hint: 'MQD 填好后躺在内存里，谁知道它的存在？doorbell 偏移能"随便挑"吗——两个进程挑了同一个会怎样？',
            answer:
              '致命缺失：没人把 MQD 装载进硬件。填好 MQD 只是把队列状态写在了内存里，GPU 对它一无所知——必须通过 MES（add_hw_queue 包）或 KIQ 把 MQD map 到某个 HQD 槽，doorbell 才有监听者。敲一个没人监听的 doorbell 就是往空房子按门铃。隐蔽错误：doorbell 偏移是全局稀缺资源，必须经分配器统一管理（内核里有专门的 doorbell 分配层）；硬编码 0x40 迟早和别的队列撞车，两个队列共享一个门铃 = WPTR 互相踩踏 = 随机 hang，且极难复现。顺带一提代码还有个顺序 bug：第 2 步 fill_mqd 用了 q->doorbell_off，而它第 3 步才赋值——填进 MQD 的是垃圾。三个错合起来正好是队列生命周期的完整检查单：分配 doorbell → 填 MQD → 请求调度固件 map → 才轮到用户敲门。',
          },
          interviewQ: {
            question: '什么是用户态队列（user-mode queues）？它相比每次提交走 ioctl 的模型有什么优劣？内核和硬件各要提供什么支撑？',
            difficulty: 'hard',
            hint: '快在省了什么？险在内核失去了什么？支撑：MQD/HQD、doorbell 隔离、MES、GPUVM。',
            answer:
              '用户态队列指进程直接拥有自己的 ring 和 doorbell 映射：提交 = 写 ring + 写 doorbell，无需任何系统调用；内核只在创建/销毁队列时介入。优势：提交延迟从微秒级 syscall 降到纳秒级内存写，高频小提交的负载（AI 推理、细粒度计算）收益巨大；CPU 开销和抖动同步下降。代价：内核失去逐提交的校验点——安全必须下沉到硬件层（GPUVM 页表隔离进程地址空间、doorbell 按页隔离归属、队列级权限位），调试也更难（内核日志里看不到每次提交，需要 GPU 侧 trace）。支撑组件缺一不可：MQD/HQD 机制让队列可虚拟化，MES/HWS 做超订调度和抢占，doorbell 页按进程映射防冒名，GPUVM 保证乱写地址只会 fault 自己。KFD/ROCm 已经全面这么跑，图形栈（amdgpu 的 userq 工作）正在跟进——这是近年 amdgpu 邮件列表的热点方向之一。',
            amdContext: '前沿题，面向核心驱动岗。能主动提到"内核校验点消失→安全下沉到 GPUVM/doorbell 隔离"这层权衡的候选人非常少，务必准备。',
          },
        },
      ],
    },
    // ════════════════════════════════════════════════════════════
    // Group 1.5.4: 架构地图与图形管线速览
    // ════════════════════════════════════════════════════════════
    {
      id: '15-4',
      number: '1.5.4',
      title: '架构地图与图形管线速览',
      titleEn: 'Architecture Map & Pipeline Tour',
      icon: 'Map',
      description: '收尾两课：一张 2026 年的 AMD 架构全家福（GCN→RDNA4/CDNA4 + 名字换算），一次图形管线固定功能块的快速巡礼——按驱动开发的需要浅尝辄止，并集中扫清十大常见误区。',
      lessons: [
        // ── Lesson 1.5.4.1 ────────────────────────────────────
        {
          id: '15-4-1',
          number: '1.5.4.1',
          title: 'GCN、RDNA、CDNA：家谱与名字换算',
          titleEn: 'GCN, RDNA, CDNA: Family Tree & Name Decoding',
          duration: 20,
          difficulty: 'beginner',
          tags: ['RDNA4', 'CDNA4', 'GCN', 'gfx-version'],
          concept: {
            summary:
              '2019 年 AMD 把一套 GCN 拆成两条线：RDNA 服务游戏（wave32、WGP、Infinity Cache），CDNA 服务数据中心（wave64、矩阵核心、HBM）。截至 2026 年中：RDNA4（RX 9000）与 CDNA4（MI350）是当前世代，MI400/CDNA5 在路上，"UDNA"是已宣布的重新统一方向。学驱动的硬技能是四层名字换算。',
            explanation: [
              '家谱主干：GCN（2012-2019，gfx6 到 gfx9）一套架构通吃游戏和计算，Vega（gfx900/906）是最后一代主力。2019 年分家：RDNA1（Navi1x, gfx101x）开启 wave32 与 WGP；RDNA2（Navi2x, gfx103x）加 Infinity Cache 和光追单元；RDNA3（Navi3x, gfx110x）首次消费级 chiplet（GCD+MCD 分离）；RDNA3.5（gfx115x）进 Strix APU；RDNA4（Navi4x, gfx120x，2025 年 3 月发布）当前世代——注意这代 AMD 只做到中高端（RX 9070 XT / Navi48 / 64 CU），没有旗舰。',
              '计算线：CDNA1（MI100, gfx908）引入 MFMA 矩阵指令；CDNA2（MI200, gfx90a）双芯 GCD；CDNA3（MI300, gfx942，2023）转向 XCD chiplet 堆叠 + 统一内存 APU 形态（MI300A 是 6 XCD + 3 个 Zen4 CCD 共享 128 GB HBM3）；CDNA4（MI350/MI355X, gfx950，2025 年 6 月发布，256 CU、288 GB HBM3E）。前瞻：MI400 系列（CDNA5，HBM4）官方口径 2026 下半年，配套 Helios 整机柜方案；再往后 AMD 宣布的"UDNA"要把两条线重新统一——记住它目前是战略方向而非在售产品，别在面试里说"UDNA 已经发布"。',
              '四层名字换算是日常刚需，练到条件反射：市场名 ↔ 芯片代号 ↔ LLVM 目标 ↔ 内核 GC IP 版本。三个锚点例子背下来：RX 7600 XT = Navi33 = gfx1102 = GC 11.0.2；RX 9070 XT = Navi48 = gfx1201 = GC 12.0.1；MI300X = Aqua Vanjaram = gfx942 = GC 9.4.3。规律：RDNA1-4 对应 gfx10.1/10.3/11/12，CDNA 系一直挂在 gfx9 大版本下（9.0.8/9.0.a/9.4.x/9.5.x）——所以别按数字大小猜新旧，CDNA4 的 gfx950 比 RDNA4 的 gfx1201 "小"却更新。',
              '最后一个心理准备：内核代码是"GCN 方言 + IP 版本"的混合体。LLVM 三元组永远叫 amdgcn；驱动文件按 GC 大版本分（gfx_v9_0.c 服务 Vega、gfx_v9_4_3.c 服务 MI300、gfx_v11_0.c 服务 Navi3x、gfx_v12_0.c 服务 Navi4x）；同一个函数里 RDNA 和 CDNA 的路径靠 IP 版本 switch 分流。上游邮件列表讨论新硬件时只说 gfx 版本和代号，市场名基本不出现——这就是要练换算的原因。',
            ],
            keyPoints: [
              '2019 分家：RDNA 游戏线（wave32/WGP/InfCache）vs CDNA 计算线（wave64/MFMA/HBM/无显示）。',
              '2026 年中现状：RDNA4（RX 9000, gfx120x）+ CDNA4（MI350, gfx950）在售；MI400/CDNA5 2026H2；UDNA=已宣布的方向。',
              '三个换算锚点：RX 7600 XT=Navi33=gfx1102=GC 11.0.2；RX 9070 XT=Navi48=gfx1201；MI300X=gfx942=GC 9.4.3。',
              'CDNA 挂在 gfx9 谱系下——gfx 数字大小 ≠ 新旧。',
              '内核讲 GCN 方言：amdgcn 三元组、gfx_v9/v11/v12 文件、IP 版本 switch——市场名在上游不存在。',
            ],
          },
          diagram: {
            title: '2012→2026 家谱与换算锚点',
            svgId: 'arch-timeline',
            content: `GCN(2012, gfx6-9) ──2019 分家──┐
  ├─ RDNA1→2→3→3.5→4 (游戏)     │
  │   gfx101x→103x→110x→115x→120x
  └─ CDNA1→2→3→4 (计算)         │
      gfx908→90a→942→950 ─→ MI400/CDNA5(2H26)
            └───"UDNA"(统一方向, 未发售)───┘
锚点: RX7600XT=Navi33=gfx1102=GC11.0.2
      MI300X=gfx942=GC9.4.3`,
            caption: '上下两条泳道从同一个 GCN 分出。虚线的 MI400 与 UDNA 注明状态——引用现状时说"截至 2026 年中"。',
          },
          codeWalk: {
            title: '同一个驱动里的两个世界：IP 版本分流',
            language: 'c',
            file: 'drivers/gpu/drm/amd/amdgpu/amdgpu_gfx.c（节选简化）',
            code: `/* 一个函数同时服务 RDNA 和 CDNA:
 * 靠 GC IP 版本分流, 而不是芯片名 */
bool amdgpu_gfx_is_high_priority_supported(
        struct amdgpu_device *adev)
{
	switch (amdgpu_ip_version(adev, GC_HWIP, 0)) {
	case IP_VERSION(9, 4, 3):   /* MI300 (CDNA3)  */
	case IP_VERSION(9, 5, 0):   /* MI350 (CDNA4)  */
		return true;        /* 计算队列优先级 */
	case IP_VERSION(11, 0, 2):  /* Navi33 (RDNA3) */
	case IP_VERSION(12, 0, 1):  /* Navi48 (RDNA4) */
		return adev->gfx.mec_fw_version >= REQUIRED;
	default:
		return false;
	}
}
/* LLVM 侧的同一颗芯片:
 * $ clang -target amdgcn-amd-amdhsa -mcpu=gfx1102 ...
 *          ^^^^^^ 三元组永远是 amdgcn, 2012 年的名字 */`,
            explanation:
              '注意 9.4.3（MI300）和 11.0.2（Navi33）出现在同一个 switch 里——CDNA 挂 gfx9 谱系的直接证据。底部注释是另一半故事：编译器侧无论多新的卡，target 都叫 amdgcn。两套编号一套方言，这就是 AMD 驱动世界的日常。',
          },
          miniLab: {
            title: '换算表默写 + 上游邮件实战',
            objective: '把四层换算练成条件反射，并在真实邮件列表里验证。',
            steps: [
              '不看资料，默写三行换算：RX 7600 XT、RX 9070 XT、MI300X 各自的 代号/gfx/GC IP',
              '对照 ROCm gpu-arch-specs 表批改（LLVM 名列 + GFXIP 列）',
              '打开 lore.kernel.org/amd-gfx/，搜索 "gfx12" 和 "gfx950" 各找一封 2025-2026 年的补丁邮件，确认上游只用 gfx 语言',
              '在那封 gfx950 邮件里找一个你已学过的概念（ring/MQD/doorbell/CU 任意），截一句话进日志',
              '加餐：跑 clang --print-supported-cpus --target=amdgcn-amd-amdhsa 2>/dev/null | grep gfx | tail -5（有 LLVM 环境时），看看最新的 gfx 目标排到哪了',
            ],
            expectedOutput:
              '默写三行全对（或改错后订正）；两封邮件链接 + 摘句进日志。体感结论：上游世界只有 gfx 编号和代号，市场名是零售层的皮肤。',
            hint: 'lore 搜索用 s:gfx950 语法限定主题行更准。',
          },
          debugExercise: {
            title: '这个补丁为什么在新卡上悄悄失效？',
            language: 'c',
            question: '有人 2024 年提交了这个 workaround，2025 年 RDNA4 上市后 bug 复发。找出写法层面的根因，并给出上游会接受的修法。',
            buggyCode: `/* workaround: 某型号上 SDMA 需要额外的刷新 */
static bool sdma_needs_extra_flush(
        struct amdgpu_device *adev)
{
	/* "Navi3x 全系都有这问题" */
	if (adev->asic_type == CHIP_NAVI31 ||
	    adev->asic_type == CHIP_NAVI32 ||
	    adev->asic_type == CHIP_NAVI33)
		return true;
	return false;
}`,
            hint: '问题真的属于"这三颗芯片"吗？还是属于它们共有的某个 IP 版本？RDNA4 的 SDMA 是全新版本还是延续？',
            answer:
              '根因：把"IP 的问题"写成了"芯片的问题"。这个 flush 需求属于某版本的 SDMA IP（比如 SDMA 6.x 的某个 erratum），Navi3x 只是恰好都带这个 IP。枚举芯片名的写法在两个方向上都会烂：新芯片若继续用同版本 SDMA（如某些 RDNA3.5 APU），列表漏了它→bug 复发（本题情形）；反过来若某新芯片虽叫 Navi 但换了修复过的 SDMA，列表又会给它套上不必要的慢路径。上游会接受的修法：switch (amdgpu_ip_version(adev, SDMA0_HWIP, 0)) 按 IP 版本区间返回，必要时配合固件版本下限（adev->sdma.instance[0].fw_version）。这也是 review 的常见退回意见原话："do not check asic_type, check the IP version"。本模块第 2 课的原则在这里第三次出现——它真的是 amdgpu 的第一戒律。',
          },
          interviewQ: {
            question: 'RDNA 和 CDNA 的核心区别是什么？为什么 AMD 要维护两条架构线？（截至 2026 年）它们各自的最新状态如何？',
            difficulty: 'medium',
            hint: '负载特征决定设计：游戏=分支多/延迟敏感/要显示，HPC/AI=矩阵稠密/带宽饥渴。',
            answer:
              '定位分工：RDNA 面向图形/游戏——wave32 原生（分支发散代价低）、WGP 组织、含完整图形固定功能（几何/光栅化/RB/显示）、Infinity Cache 补带宽、GDDR 控成本；CDNA 面向 HPC/AI——wave64、保留 GCN 式 CU、砍掉图形与显示硬件、加 MFMA 矩阵核心与 AccVGPR、HBM 大带宽、XCD chiplet 堆算力、强化 FP64 与 ECC。分线的原因是负载分化到单一设计难以兼顾：游戏要每美元帧率，AI 要每瓦 TFLOPS，两者在 wave 宽度、缓存策略、内存制式上的最优解相反。截至 2026 年中：RDNA4（RX 9000 系，gfx120x，无旗舰策略）与 CDNA4（MI350 系，gfx950，288 GB HBM3E）为当前世代，MI400/CDNA5 官方计划 2026 下半年；AMD 已宣布 UDNA 统一方向但尚无在售产品。加分点：分线的软件代价正是驱动/编译器要同时伺候两套 ISA——这也是 UDNA 想收回的成本。',
            amdContext: '面试开场高频题，用于探底你对产品线的真实熟悉度。答案带上 gfx 编号和"截至何时"的时间戳，会立刻和背营销页的候选人拉开差距。',
          },
        },
        // ── Lesson 1.5.4.2 ────────────────────────────────────
        {
          id: '15-4-2',
          number: '1.5.4.2',
          title: '图形管线速览与十大误区扫除',
          titleEn: 'Graphics Pipeline Tour & Top-10 Misconceptions',
          duration: 20,
          difficulty: 'beginner',
          tags: ['graphics-pipeline', 'rasterizer', 'RB', 'misconceptions'],
          concept: {
            summary:
              '图形管线的固定功能块（几何引擎、光栅化、RB）对内核驱动来说是"要认识名字但不必精通内脏"的邻居——初始化它们、给它们喂命令的是你，编排它们干活的是 Mesa。本课快速巡礼一遍数据流，然后集中拆掉十个最常见的认知陷阱，为整个模块收尾。',
            explanation: [
              '一个三角形的旅程（每个 Shader Engine 里都有一套）：CP 解析到 DRAW 包 → GE/PA（几何引擎/图元装配）取顶点、装配三角形，RDNA 内部走 NGG/primitive shader 路径 → 光栅化器（SC，Scan Converter）把三角形切成屏幕瓦片上的像素四元组（quad）→ SPI 为这些像素批量启动像素着色器 wave（回到你熟悉的 CU 世界）→ 算出的颜色进 RB（Render Backend，内核代码里 CB=颜色块 / DB=深度块）做深度测试和混合 → 结果经 L2 写回显存的帧缓冲 → DCN 按刷新率扫描输出到显示器。注意中段永远是 CU：管线里"可编程"的部分就是往 CU 上派 wave，固定功能块负责派发前后的体力活。',
              '内核驱动跟这些块的关系是"物业"而非"住户"：初始化时配置它们的寄存器（数量/分区/时钟）、复位时把它们拉回可用状态、崩溃时 dump 它们的状态寄存器帮定位——但每一帧画什么、管线状态怎么设，全是 Mesa 在 IB 里用 PM4 写好的。所以驱动工程师的知识边界画在：认识每个块的名字缩写（GE/PA/SC/SPI/CB/DB）、知道数据流顺序、能在 hang dump 里认出"卡在光栅化"或"卡在 RB"——内脏留给 Mesa 工程师。',
              '十大误区集中扫除（前九课都铺垫过，这里合订）：①"GPU 核心=CPU 核心"——流处理器是 lane，CU 才是核。②"RDNA 只有 wave32"——wave64 模式仍在，编译器按需选。③"CU 和 WGP 是一回事"——WGP=2CU 共享 LDS，计数口径是 CU。④"内核驱动负责画画"——驱动管内存和调度，Mesa 管渲染。⑤"显存就是 VRAM"——还有 GTT/GART 这半壁江山。⑥"Infinity Cache 是大号 L2"——它是 L2 之后的 MALL。⑦"occupancy 越高越好"——它是预算不是分数。⑧"doorbell 很神秘"——一页 MMIO 而已。⑨"gfx 数字越大越新"——CDNA 挂在 gfx9 下。⑩"UDNA 已经取代 RDNA/CDNA"——截至 2026 年中仍是方向不是产品。',
              '模块收官：你现在拥有的心智模型——吞吐机器（第1课）由 IP block 组装（第2课），执行靠 wave/CU/WGP（第3-6课），吃内存分层（第7-8课），听命令于 ring/doorbell/CP（第9-10课），家族分 RDNA/CDNA 两支（第11课），图形管线是 CU 的固定功能邻居（本课）。下一个模块（1.7 图形 API）会从 OpenGL/Vulkan 的视角重新走一遍这条管线——这次你会认出每一站。',
            ],
            keyPoints: [
              '三角形旅程：CP→GE/PA→光栅化(SC)→像素 wave(CU)→RB(CB/DB)→L2→显存→DCN 扫描输出。',
              '管线的可编程段=往 CU 派 wave；固定功能块做派发前后的体力活。',
              '内核驱动是物业（初始化/复位/dump），Mesa 是住户（每帧的渲染编排）——知识边界画在块名和数据流。',
              '十大误区合订本——面试和 review 里最容易露怯的十句话，逐条能反驳。',
              '至此心智模型闭环；模块 1.7 将以 API 视角重走管线。',
            ],
          },
          diagram: {
            title: '固定功能块巡礼 + 分工边界',
            svgId: 'graphics-pipeline',
            content: `CP ─▶ GE/PA ─▶ 光栅化(SC) ─▶ CU 跑像素着色器 ─▶ RB(CB/DB)
 │      装配三角形   切成quad      (可编程段)      深度/混合
 └── PM4 由 Mesa 写好, 内核只递送                    │
                                              L2 ─▶ VRAM
                                                     │
                                          DCN 扫描输出到显示器
分工: Mesa=编排每一帧 | 内核=初始化/内存/调度/复位`,
            caption: '横向数据流 + 底部分工注解。记块名和顺序即可——RB 内部的深度压缩算法之类，交给 Mesa 课程（不在本站范围）。',
          },
          codeWalk: {
            title: '"物业"的日常：驱动初始化 RB 的样子',
            language: 'c',
            file: 'drivers/gpu/drm/amd/amdgpu/gfx_v11_0.c（节选简化）',
            code: `/* 初始化时驱动配置固定功能块的"户型",
 * 之后每帧的使用全由 Mesa 的 PM4 指挥 */
static void gfx_v11_0_setup_rb(struct amdgpu_device *adev)
{
	u32 active_rb_bitmap = 0;

	/* 读 harvest 熔断信息: 哪些 RB 被良率屏蔽 */
	active_rb_bitmap = gfx_v11_0_get_rb_active_bitmap(adev);

	adev->gfx.config.backend_enable_mask =
			active_rb_bitmap;
	adev->gfx.config.num_rbs =
			hweight32(active_rb_bitmap);
	/* 之后: 写 PA_SC/CB 相关寄存器完成分区配置
	 * (每个 SE 的光栅化器怎么分屏幕瓦片) */
}

/* hang 调试时"物业"的另一职责: 报告谁卡住了
 * $ sudo cat /sys/kernel/debug/dri/0/amdgpu_gpu_recover
 * dump 里 GRBM_STATUS 的 PA_BUSY/SC_BUSY/CB_BUSY 位
 * 直接告诉你管线堵在哪一段 */`,
            explanation:
              'setup 一次、dump 无数次——这就是内核与固定功能块的全部交情。GRBM_STATUS 那行注释值得高亮：它是模块 6 调试课的预告，PA_BUSY/SC_BUSY/CB_BUSY 这些位能把"GPU hang 了"细化成"光栅化器卡住了"，而你现在已经认识这些缩写了。',
          },
          miniLab: {
            title: '看一场官方管线电影 + 误区自测',
            objective: '用 AMD 官方视频固化管线数据流，并检验十大误区是否真的拆干净了。',
            steps: [
              '观看 GPUOpen 视频 "All the Pipelines – Journey through the GPU"（gpuopen.com/videos/graphics-pipeline/，约 30 分钟）',
              '边看边在纸上画数据流，每出现一个本课讲过的块（GE/SC/SPI/CB/DB）打一个勾',
              '视频里出现而本课没细讲的名词（如 HiZ、DCC）列成"Mesa 侧概念"清单——知道它们存在即可',
              '自测：把十大误区遮住"正确答案"半边，逐条向自己解释为什么是错的；卡壳的回到对应课程复习',
              '收官仪式：在学习日志写下模块 1.5 的一页纸总结（心智模型七句话 + 三个你最意外的知识点）',
            ],
            expectedOutput:
              '手绘管线图与视频一致（顺序对即可）；十条误区全部能独立反驳；一页纸总结完成——这页纸是你后续模块的随身地图。',
            hint: '视频看不了就用 Fabian Giesen 系列的 Part 6（光栅化）做替代阅读，块名对照本课 keyPoints。',
          },
          debugExercise: {
            title: '用户态在等一个永远不来的值',
            language: 'cpp',
            question: '这段用户态代码想"高性能地"等 GPU 画完一帧。它综合犯了本模块讲过的三个错。全部找出来。',
            buggyCode: `/* 用户态: 等待 GPU 完成渲染 (伪代码) */
volatile uint32_t *reg =
    mmap_bar5_register(GRBM_STATUS);   /* 映射寄存器 */

void wait_frame_done(void)
{
    /* "寄存器比 fence 快, 轮询它!" */
    while (*reg & GUI_ACTIVE_BIT)
        ;   /* 自旋直到 GPU 空闲 */

    /* "空闲了, 帧缓冲肯定能读了" */
    read_framebuffer();
}`,
            hint: '错误一关于"谁有权摸寄存器"；错误二关于"GPU 空闲 ≠ ？"；错误三关于本组内存课的主题。',
            answer:
              '错误一（权限/架构）：用户态直接映射并轮询 BAR5 寄存器从根上就不该发生——寄存器是内核的领地，正确的完成通知是 fence（提交时拿到，wait 时走 ioctl/信号量），这正是第 9 课 fence 回边存在的意义；就算真能映射，自旋轮询也烧掉一整个 CPU 核。错误二（语义错位）：GRBM 的"GUI_ACTIVE 清零"表示引擎此刻没活，不等于"你那一帧完成了"——GPU 可能还没开始你的帧（在排队）就短暂空闲过，出现"等到了但画面是上一帧"的竞态；完成语义必须绑定到你那次提交的 fence 序号。错误三（一致性）：即便时机对了，GPU 写进帧缓冲的数据可能还停在 L2/未刷出（第 7 课），CPU 直读会拿到旧数据——正规路径上 fence 的 RELEASE_MEM 已捆绑缓存回写，这层保障轮询寄存器根本享受不到。三个错共同的病根：绕过驱动设计好的同步原语。模块 4（DRM）会正式介绍 fence/syncobj 这些原语的用户态接口。',
          },
          interviewQ: {
            question: '内核 amdgpu 驱动和 Mesa 用户态驱动的分工边界在哪里？为什么说"内核驱动不画三角形"？',
            difficulty: 'medium',
            hint: '从一帧的生命周期数：谁编译着色器？谁写 PM4？谁管内存和队列？谁碰寄存器？',
            answer:
              '分工以"策略/机制"切开。Mesa（RadeonSI/RADV）负责渲染策略：实现 OpenGL/Vulkan API、编译着色器（经 LLVM 出 ISA）、设置管线状态、把每帧的绘制编码成 PM4 写进 IB——"画什么、怎么画"全在用户态决定。内核 amdgpu 提供机制：显存管理（BO/VRAM/GTT/GPUVM）、命令递送（校验 IB、排进 ring、敲 doorbell）、同步（fence/syncobj）、硬件生命周期（IP 初始化、时钟电源、复位恢复）、以及多进程隔离与仲裁。"不画三角形"的字面证据：内核代码里没有任何三角形/顶点/纹理采样的处理逻辑，DRAW 包是 Mesa 写的，内核只保证它安全到达 CP。这个边界也是安全模型：用户态只能通过 ioctl 语义和 GPUVM 隔离间接使用硬件，寄存器与固件接口是内核专属。加分点：显示（KMS/DCN）是内核深度参与渲染结果的唯一例外——扫描输出的配置真的在内核里。',
            amdContext: '用于判断候选人是否理解自己应聘的是"栈的哪一层"。答不清边界的人容易在内核岗面试里大谈着色器优化——这是经典减分项。',
          },
        },
      ],
    },
  ],
  completionChecklist: [
    '能画出 CPU vs GPU 的设计取舍，并解释延迟隐藏的机制',
    '能说出 GC/SDMA/VCN/DCN/PSP/SMU 各自职责，并做 gfx↔GC IP↔市场名三向换算',
    '能默写 work-item → wavefront → workgroup → grid 层级及其到 SIMD/WGP 的映射',
    '能用 VGPR/LDS 数字手算一个 kernel 的 occupancy',
    '能解释 VRAM/GTT/GPUVM 的区别和 BO 驱逐的代价',
    '能完整叙述 ring buffer → doorbell → CP → wave 派发 → fence 的命令旅程',
    '能区分 RDNA 与 CDNA 的定位、wave 模式和产品线（截至 2026）',
    '知道图形管线各固定功能块的名字，以及内核驱动与 Mesa 的分工边界',
  ],
};
