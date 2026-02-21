// ============================================================
// AMD Linux Driver Learning Platform - Module 0.5 Micro-Lessons
// Module 0.5: AMD Ecosystem Overview (AMD 生态系统概览)
// 5 lessons in 2 groups, ~20 min each, total ~100 min
// ============================================================
import type { MicroLessonModule } from './micro_lesson_types';

export const module05MicroLessons: MicroLessonModule = {
  moduleId: 'ecosystem',
  groups: [
    // ════════════════════════════════════════════════════════════
    // Group 0.5.1: AMD Products & Naming
    // ════════════════════════════════════════════════════════════
    {
      id: '05-1',
      number: '0.5.1',
      title: 'AMD 产品线与命名规则',
      titleEn: 'AMD Products & Naming',
      icon: 'Building',
      description: '理解 AMD 的公司结构、GPU 产品层次、命名规则，以及如何从一个型号推断出它在内核代码中对应的芯片代号和 IP 版本。',
      lessons: [
        // ── Lesson 0.5.1.1 ────────────────────────────────────
        {
          id: '05-1-1',
          number: '0.5.1.1',
          title: 'AMD GPU 产品线层次：从 Radeon RX 到 Instinct MI',
          titleEn: 'AMD GPU Product Hierarchy',
          duration: 20,
          difficulty: 'beginner',
          tags: ['AMD', 'Radeon', 'Instinct', 'product-line'],
          concept: {
            summary: 'AMD GPU 产品分三个层次：消费级 Radeon RX（游戏）、专业级 Radeon Pro（工作站）、数据中心级 Instinct MI（AI/HPC）。它们共享同一个 amdgpu 内核驱动，但固件和用户态配置不同。',
            explanation: [
              'AMD 的 GPU 业务由 Radeon Technologies Group (RTG) 负责，产品线分为三个明确的层次。理解这个分层对驱动开发者至关重要——因为同一个 amdgpu 内核驱动需要支持所有三个层次的产品，而每个层次的优化目标和功能需求截然不同。',
              '消费级 Radeon RX：面向游戏玩家和创意工作者的产品线（本教程以 RX 7600 XT 为示例）。主要面向游戏玩家和创意工作者。驱动优化的重点是 OpenGL/Vulkan 渲染性能、低延迟显示输出（FreeSync）、视频编解码（VCN 引擎）。在内核代码中，Radeon RX 系列通过标准的 /dev/dri/card0 DRM 接口暴露功能。价格范围：$200-$1200。',
              '专业级 Radeon Pro：面向 CAD 设计师、影视后期、科学可视化等专业场景。与消费级使用相同的 GPU 芯片（如 Pro W7900 使用 Navi31，和 RX 7900 XTX 同芯片），但固件配置不同：（1）驱动经过专业应用认证（如 SolidWorks、Maya）；（2）ECC 显存支持（错误校正，防止数据损坏）；（3）更保守的频率设置以确保长期稳定性。在 amdgpu 驱动中，Pro 和 RX 系列共享同一套代码，差异主要在固件层。',
              'Instinct MI 数据中心级：这是 AMD 用来与 NVIDIA A100/H100 竞争的产品线。MI300X 拥有 192GB HBM3 显存，专为 AI 训练和 HPC 设计。关键区别：（1）没有显示输出——Instinct GPU 是纯计算卡，没有 HDMI/DP 接口，amdgpu 驱动中的 DC（Display Core）模块不加载；（2）通过 ROCm/KFD 接口暴露计算能力；（3）支持 GPU-GPU 直连（AMD Infinity Fabric），多卡可以像一个大 GPU 一样工作。在内核代码中，Instinct 使用独立的 Device ID 范围，KFD 模块为其提供 HSA 接口。',
              '对驱动开发者的意义：你修改 amdgpu 代码中的任何一行，都可能影响这三个产品层次。一个 GEM 内存分配的 Bug 可能在 RX 上导致游戏崩溃，在 Pro 上导致 CAD 渲染错误，在 Instinct 上导致 AI 训练数据损坏。这就是为什么 amdgpu 的 CI 需要在多代、多层次的硬件上测试。',
            ],
            keyPoints: [
              'Radeon RX（消费级）：游戏和创意，优化 Vulkan/OpenGL 性能，价格 $200-$1200',
              'Radeon Pro（专业级）：CAD/影视，相同芯片但经过专业认证和 ECC 配置',
              'Instinct MI（数据中心）：AI/HPC 纯计算卡，无显示输出，HBM 显存，ROCm 接口',
              '三个层次共享同一个 amdgpu 内核驱动，差异在固件和用户态配置',
              'Pro 和 RX 通常使用相同的 GPU 芯片（Navi31 等），只是固件和认证不同',
              'Instinct MI300X 有 192GB HBM3，是当前最大的 AMD GPU 产品',
            ],
          },
          diagram: {
            title: 'AMD GPU 产品线三层结构',
            content: `AMD GPU 产品线层次（2024-2025）

性能/价格
    ↑
    │  ┌─────────────────────────────────────────────────────────┐
    │  │  Instinct MI 系列 （数据中心）                          │
    │  │                                                         │
    │  │  MI300X  │ 192GB HBM3 │ 1.3TB/s  │ 纯计算（无显示）   │
    │  │  MI250X  │ 128GB HBM2e│ 3.2TB/s  │ CDNA2 架构         │
    │  │  MI100   │  32GB HBM2 │ 1.2TB/s  │ CDNA1 架构         │
    │  │                                                         │
    │  │  → ROCm / KFD 接口                                     │
    │  │  → 竞争对手: NVIDIA H100/A100, Intel Gaudi             │
    │  └─────────────────────────────────────────────────────────┘
    │  ┌─────────────────────────────────────────────────────────┐
    │  │  Radeon Pro 系列 （专业工作站）                         │
    │  │                                                         │
    │  │  W7900  │ Navi31 │ 48GB │ 专业认证 + ECC               │
    │  │  W7800  │ Navi31 │ 32GB │ 与 RX 7900 同芯片            │
    │  │  W7600  │ Navi33 │ 8GB  │ 与你的 RX 7600 XT 同芯片！   │
    │  │                                                         │
    │  │  → OpenGL/Vulkan + 专业应用认证                        │
    │  │  → 竞争对手: NVIDIA RTX A 系列                         │
    │  └─────────────────────────────────────────────────────────┘
    │  ┌─────────────────────────────────────────────────────────┐
    │  │  Radeon RX 系列 （消费级游戏）                          │
    │  │                                                         │
    │  │  RX 9070 XT  │ Navi48  │ RDNA4 │ $549  │ 最新         │
    │  │  RX 7900 XTX │ Navi31  │ RDNA3 │ $999  │ 旗舰         │
    │  │  RX 7800 XT  │ Navi32  │ RDNA3 │ $499  │ 高端         │
    │  │  RX 7600 XT  │ Navi33  │ RDNA3 │ $329  │ ← 你的卡    │
    │  │  RX 6800 XT  │ Navi21  │ RDNA2 │ (上代)               │
    │  │                                                         │
    │  │  → 游戏 / 创意工作 / 轻度计算                          │
    │  │  → 竞争对手: NVIDIA GeForce RTX 系列                   │
    │  └─────────────────────────────────────────────────────────┘
    └──────────────────────────────────────────────────────────→ 时间

内核驱动视角：
  所有产品 → 同一个 amdgpu.ko → 通过 Device ID 区分
  RX/Pro   → 加载 DC (显示) + GFX + SDMA + VCN
  Instinct → 不加载 DC, 加载 KFD + GFX + SDMA`,
            caption: 'AMD GPU 三层产品线。RX 7600 XT (Navi33) 与 Radeon Pro W7600 使用完全相同的芯片。amdgpu 驱动通过 PCI Device ID 区分不同产品，但共享绝大部分代码——这一规律适用于整个 AMD 产品系列。',
          },
          codeWalk: {
            title: '在内核代码中区分消费级和数据中心 GPU',
            file: 'drivers/gpu/drm/amd/amdgpu/amdgpu_device.c',
            language: 'c',
            code: `/* amdgpu 驱动如何区分不同产品层次的 GPU */

/* 1. 通过 PCI Device ID 识别 GPU 型号 */
/* amdgpu_drv.c — 设备 ID 表（部分） */
static const struct pci_device_id pciidlist[] = {
    /* 消费级 RX 7600 XT (Navi33) */
    {0x1002, 0x7480, PCI_ANY_ID, PCI_ANY_ID, 0, 0, CHIP_NAVI33},

    /* 专业级 Pro W7600 (同一个 Navi33 芯片！) */
    {0x1002, 0x7481, PCI_ANY_ID, PCI_ANY_ID, 0, 0, CHIP_NAVI33},

    /* 数据中心 Instinct MI300X (不同架构: CDNA3) */
    {0x1002, 0x740C, PCI_ANY_ID, PCI_ANY_ID, 0, 0, CHIP_AQUA_VANJARAM},
};

/* 2. 判断是否有显示输出 */
/* amdgpu_device.c — 初始化时检查 */
static int amdgpu_device_ip_early_init(struct amdgpu_device *adev)
{
    /* Instinct GPU 没有显示引擎 */
    if (adev->flags & AMD_IS_APU) {
        /* APU: CPU+GPU 集成，有显示 */
    }

    /* 根据 IP discovery 检查是否有 DCN (Display) */
    if (!adev->ip_versions[DCE_HWIP][0]) {
        /* 没有 DCN IP → 纯计算卡 (Instinct) */
        /* 不加载 DC 模块，不创建 /dev/dri/card0 的 KMS 接口 */
        adev->mode_info.num_crtc = 0;
    }
}

/* 3. KFD 对不同产品的优先级 */
/* amdkfd/kfd_device.c */
/* Instinct GPU 的 KFD 获得更多计算队列资源
 * 消费级 GPU 的 KFD 队列数量受限 */`,
            annotations: [
              'RX 7600 XT (0x7480) 和 Pro W7600 (0x7481) 是不同的 Device ID 但 CHIP 类型相同 (CHIP_NAVI33)',
              'CHIP_AQUA_VANJARAM 是 MI300X 的内部代号，使用 CDNA3 架构而非 RDNA3',
              'AMD_IS_APU 标志区分 APU（集成 GPU）和独立 GPU',
              'IP discovery 机制自动检测 GPU 有哪些功能模块（IP Block），Instinct 没有 DCE_HWIP',
              '同一个 amdgpu.ko 通过条件逻辑处理所有产品层次的差异',
              'KFD 为 Instinct GPU 分配更多计算资源——这是纯计算卡的优化',
            ],
            explanation: '这段代码展示了 amdgpu 驱动如何用一套代码支持三个完全不同的产品层次。关键洞察：硬件差异不是靠 if/else 硬编码的，而是通过 IP discovery 机制动态检测——驱动启动时读取 GPU 的 IP 描述表，根据有哪些 IP Block 来决定加载哪些模块。这种设计让一个驱动支持数十种不同的 GPU 成为可能。',
          },
          miniLab: {
            title: '识别你的 GPU 所属的产品层次',
            objective: '通过系统工具确认你的 GPU 的产品层次、芯片代号和支持的功能模块。',
            steps: [
              '查看 GPU 型号和 Device ID：lspci -nn | grep -i "vga\\|3d\\|display"',
              '确认是消费级还是专业级：如果输出包含 "Radeon RX" 就是消费级，"Radeon Pro" 是专业级',
              '查看 GPU 支持的 IP Block：cat /sys/class/drm/card0/device/ip_discovery/die/0/*/ip_discovery（如果存在）',
              '验证是否有显示输出：ls /sys/class/drm/card0-*（应该列出 HDMI-A-1、DP-1 等连接器）',
              '查看 KFD 是否可用：ls /dev/kfd（如果存在，说明 ROCm 计算接口可用）',
              '对比：在 amdgpu 源码中搜索你的 Device ID：grep -n "0x7480" drivers/gpu/drm/amd/amdgpu/amdgpu_drv.c',
            ],
            expectedOutput: `$ lspci -nn | grep -i "vga"
03:00.0 VGA compatible controller [0300]: ... Navi33 [Radeon RX 7600/7600 XT] [1002:7480]
→ 消费级 RX 系列，Device ID 0x7480

$ ls /sys/class/drm/card0-*
/sys/class/drm/card0-DP-1
/sys/class/drm/card0-HDMI-A-1
→ 有显示输出连接器（不是 Instinct 纯计算卡）

$ ls /dev/kfd
/dev/kfd
→ KFD 接口可用，可以运行 ROCm 程序`,
            hint: '如果 /dev/kfd 不存在，可能是 KFD 模块没有加载。尝试 sudo modprobe amdkfd 或检查内核配置中 HSA_AMD 是否启用。',
          },
          debugExercise: {
            title: '判断 GPU 类型对驱动行为的影响',
            language: 'c',
            description: '以下代码尝试在一个 Instinct MI300X GPU 上设置显示模式，但会失败。找出原因。',
            question: '为什么这段代码在 Instinct GPU 上会返回错误？',
            buggyCode: `/* 尝试在 GPU 上设置 1920x1080 显示模式 */
int setup_display(struct amdgpu_device *adev)
{
    struct drm_display_mode mode;

    mode.hdisplay = 1920;
    mode.vdisplay = 1080;
    mode.clock = 148500;  /* 148.5 MHz pixel clock */

    /* 调用 DC 模块设置显示模式 */
    return dc_commit_state(adev->dm.dc, &mode);
    /* 在 Instinct MI300X 上返回 -ENODEV */
}`,
            hint: 'Instinct MI300X 是一张纯计算卡。想想它有哪些 IP Block，没有哪些。',
            answer: 'Instinct MI300X 是纯计算 GPU，没有显示引擎（DCN IP）。在驱动初始化时，amdgpu 通过 IP discovery 检测到没有 DCE_HWIP，因此不会加载 DC（Display Core）模块。adev->dm.dc 为 NULL，调用 dc_commit_state 会返回 -ENODEV（设备不存在）。Instinct 卡没有 HDMI/DP 接口，物理上就不支持显示输出。这不是 Bug，而是硬件设计如此——Instinct 把所有晶体管面积都用于计算单元和 HBM 控制器，不浪费在显示功能上。正确做法：在调用 DC 函数前检查 adev->mode_info.num_crtc > 0。',
          },
          interviewQ: {
            question: 'AMD GPU 的三个产品层次（Radeon RX、Radeon Pro、Instinct MI）有什么区别？amdgpu 驱动如何处理它们的差异？',
            difficulty: 'easy',
            hint: '从硬件功能（显示/计算）、驱动模块加载（DC/KFD）、目标用户群三个维度对比。',
            answer: '三层区别：（1）Radeon RX（消费级）：面向游戏/创意用户，有完整的图形和显示功能，驱动加载 GFX + DC + VCN + SDMA + KFD（如果启用 ROCm）；优化目标是渲染性能和低延迟。（2）Radeon Pro（专业级）：面向 CAD/影视专业用户，与 RX 使用相同芯片但固件不同——经过专业应用认证，支持 ECC 显存，频率更保守；驱动代码完全共享，差异在固件层。（3）Instinct MI（数据中心）：面向 AI/HPC，纯计算卡无显示输出，使用 CDNA 架构（不是 RDNA），驱动不加载 DC 模块，通过 KFD 暴露 HSA 计算接口；拥有 HBM 大显存和 GPU-GPU 直连。驱动处理差异的方式：amdgpu 使用 IP discovery 机制——驱动启动时读取 GPU 的 IP 描述表，根据检测到的 IP Block（DCN/GFX/SDMA/VCN/KFD）动态决定加载哪些模块。这种设计让一个 .ko 文件支持所有 AMD GPU 成为可能。',
            amdContext: '理解产品线层次是 AMD 面试的基础问题。面试官期望你知道 RX、Pro、Instinct 的区别，以及它们如何共享驱动代码。',
          },
        },

        // ── Lesson 0.5.1.2 ────────────────────────────────────
        {
          id: '05-1-2',
          number: '0.5.1.2',
          title: 'GPU 命名规则完全解析：从型号到内核代号',
          titleEn: 'GPU Naming Decoded: From Model to Kernel Codename',
          duration: 20,
          difficulty: 'beginner',
          tags: ['naming', 'Navi', 'RDNA', 'gfx1102', 'device-id'],
          concept: {
            summary: '每个 AMD GPU 有四层命名：市场名、芯片代号、IP 版本、PCI Device ID。掌握这四层映射关系，你就能从任何一层推断出其他三层，在驱动代码中快速定位。本节以 RX 7600 XT（Navi33 / gfx1102 / 0x7480）为贯穿示例，方法适用于所有 AMD GPU。',
            explanation: [
              '当你在 amdgpu 源码中看到 "gfx1102" 时，你需要立刻知道这对应的是 RDNA3 架构的 Navi33 芯片，市场上以 RX 7600 系列销售。这种快速映射能力是高效阅读驱动代码的关键。让我们拆解 AMD GPU 的完整命名体系。',
              '第一层：市场名（RX 7600 XT）。这是消费者看到的名称。RX = Radeon eXperience（消费级标识）；第一个数字 7 = 架构代数（7=RDNA3，6=RDNA2，5=RDNA1）；第二个数字 6 = 性能等级（9=旗舰，8=高端，7=中高端，6=中端，5=入门）；后两位 00 = 具体 SKU；后缀 XT = 增强版（更高频率或更多计算单元），XTX = 旗舰增强版。所以 RX 7600 XT = RDNA3 架构、中端性能、增强版。',
              '第二层：芯片代号（Navi33）。这是内部工程代号。Navi = RDNA 架构系列的代号（前代是 Vega/Polaris）。数字的十位表示代数（3x = RDNA3，2x = RDNA2，1x = RDNA1），个位从大到小表示芯片面积：Navi31 是旗舰大芯片（RX 7900 XTX），Navi32 是高端中芯片（RX 7800 XT），Navi33 是中端小芯片（RX 7600 XT）。在内核代码中，CHIP_NAVI33 是枚举值，用于选择 IP Block 实现。',
              '第三层：IP 版本（gfx1102）。这是最接近硬件的命名。gfx = Graphics IP 前缀；11 = 主版本号（对应 RDNA3）；0 = 次版本号；2 = 修订号。gfx1100 = Navi31（旗舰），gfx1102 = Navi33（中端）。不同修订号意味着同代架构中的微小差异（如时钟域、CU 数量）。在 LLVM 中编译 GPU 程序时，-mcpu=gfx1102 指定目标 GPU。在驱动代码中，gfx_v11_0.c 是 gfx11xx 系列的实现文件。',
              '第四层：PCI Device ID（0x7480）。这是 PCI 总线上的唯一标识符。内核通过匹配 Vendor ID（0x1002）+ Device ID（0x7480）找到 amdgpu 驱动。同一个芯片可能有多个 Device ID（不同 SKU），但映射到同一个 CHIP 类型。在 amdgpu_drv.c 的 pciidlist 中，0x7480 和 0x7483 都映射到 CHIP_NAVI33。',
            ],
            keyPoints: [
              '市场名 RX 7600 XT → 第一位 7=RDNA3，第二位 6=中端，XT=增强版',
              '芯片代号 Navi33 → 3x=RDNA3 代，3=中端芯片（最小的 RDNA3 die）',
              'IP 版本 gfx1102 → 11=RDNA3，02=Navi33 修订（00=Navi31，02=Navi33）',
              'PCI Device ID 0x7480 → 内核匹配驱动的唯一标识符',
              '完整映射链：RX 7600 XT ↔ Navi33 ↔ gfx1102 ↔ 0x7480 ↔ CHIP_NAVI33',
              '在 LLVM 中 -mcpu=gfx1102，在驱动中 gfx_v11_0.c，在 PCI 表中 CHIP_NAVI33',
            ],
          },
          diagram: {
            title: 'AMD GPU 四层命名映射表',
            content: `AMD GPU 命名四层映射（RDNA 系列）

市场名             芯片代号      IP 版本      Device ID    内核枚举
─────────────────  ──────────  ──────────  ──────────  ──────────────

RDNA4 (2025):
RX 9070 XT         Navi48       gfx1201     0x7550      CHIP_NAVI48

RDNA3 (2022):
RX 7900 XTX        Navi31       gfx1100     0x744C      CHIP_NAVI31
RX 7900 XT         Navi31       gfx1100     0x744C      CHIP_NAVI31
RX 7800 XT         Navi32       gfx1101     0x7470      CHIP_NAVI32
RX 7700 XT         Navi32       gfx1101     0x7470      CHIP_NAVI32
RX 7600 XT ← 你   Navi33       gfx1102     0x7480      CHIP_NAVI33
RX 7600            Navi33       gfx1102     0x7480      CHIP_NAVI33

RDNA2 (2020):
RX 6900 XT         Navi21       gfx1030     0x73BF      CHIP_NAVI21
RX 6800 XT         Navi21       gfx1030     0x73BF      CHIP_NAVI21
RX 6700 XT         Navi22       gfx1031     0x73DF      CHIP_NAVI22
RX 6600 XT         Navi23       gfx1032     0x73FF      CHIP_NAVI23

RDNA1 (2019):
RX 5700 XT         Navi10       gfx1010     0x731F      CHIP_NAVI10
RX 5600 XT         Navi10       gfx1010     0x7340      CHIP_NAVI10

代码中的对应关系：
  gfx1102 → gfx_v11_0.c（共享 RDNA3 GFX 实现）
  gfx1030 → gfx_v10_3.c（RDNA2 GFX 实现）
  gfx1010 → gfx_v10_0.c（RDNA1 GFX 实现）`,
            caption: 'AMD GPU 四层命名映射示例。理解这套映射规则后，遇到任何 AMD GPU 型号都能立即推断出其他三层（如 RX 7600 XT ↔ Navi33 ↔ gfx1102 ↔ 0x7480）。',
          },
          codeWalk: {
            title: '从 Device ID 到 IP 版本的完整映射链',
            file: 'drivers/gpu/drm/amd/amdgpu/amdgpu_discovery.c',
            language: 'c',
            code: `/* 驱动如何从 PCI Device ID 推导出 IP 版本 */

/* 步骤 1: PCI 匹配 → CHIP 枚举 (amdgpu_drv.c) */
/* {0x1002, 0x7480, ..., CHIP_NAVI33} */

/* 步骤 2: CHIP 枚举 → IP discovery (amdgpu_discovery.c) */
/* GPU 内部有一个 IP discovery 表，固化在硬件中
 * 驱动在初始化时读取这个表，获取所有 IP Block 的版本 */
static int amdgpu_discovery_set_ip_blocks(struct amdgpu_device *adev)
{
    /* 读取 GPU 内部的 IP discovery 数据 */
    /* 返回类似：
     * GFX IP version: 11.0.2  → gfx1102 (你的 RX 7600 XT)
     * SDMA IP version: 6.0.2  → sdma_v6_0
     * DCN IP version: 3.2.1   → dcn32
     * VCN IP version: 4.0.2   → vcn_v4_0
     */

    switch (adev->ip_versions[GC_HWIP][0]) {
    case IP_VERSION(11, 0, 0):  /* gfx1100 = Navi31 */
    case IP_VERSION(11, 0, 2):  /* gfx1102 = Navi33 (你的!) */
        amdgpu_device_ip_block_add(adev, &gfx_v11_0_ip_block);
        amdgpu_device_ip_block_add(adev, &sdma_v6_0_ip_block);
        break;
    case IP_VERSION(10, 3, 0):  /* gfx1030 = Navi21 (RDNA2) */
        amdgpu_device_ip_block_add(adev, &gfx_v10_0_ip_block);
        break;
    }
}

/* 步骤 3: 使用 IP 版本编译着色器 (LLVM) */
/* hipcc --offload-arch=gfx1102 my_kernel.hip
 * LLVM 根据 gfx1102 选择正确的指令集和寄存器配置 */`,
            annotations: [
              'IP discovery 是 AMD GPU 的硬件特性——GPU 内部存储了一张描述自身功能的表',
              'IP_VERSION(11, 0, 2) 对应 gfx1102，11=主版本，0=次版本，2=修订号',
              'Navi31 (gfx1100) 和 Navi33 (gfx1102) 共享 gfx_v11_0_ip_block，因为它们是同代架构',
              'SDMA、DCN、VCN 等 IP Block 也有各自的版本号，独立于 GFX IP 版本',
              '这种动态发现机制让驱动不需要为每个 GPU 硬编码功能列表',
            ],
            explanation: 'IP discovery 是理解 amdgpu 驱动架构的关键。驱动不是通过 if (chip == NAVI33) 来决定行为的，而是读取 GPU 自身的 IP 描述表。这样即使 AMD 发布新 GPU，只要 IP 版本在已支持的范围内（如 gfx11xx），现有驱动代码就能直接支持——这就是为什么有时候新 GPU 在旧内核上也能基本工作。',
          },
          miniLab: {
            title: '建立你的 GPU 命名映射卡',
            objective: '查找你手头 AMD GPU 的四层命名（以 RX 7600 XT 为参考示例），并在内核源码中验证每一层的对应关系。',
            steps: [
              '记录市场名：RX 7600 XT',
              '查找 Device ID：lspci -nn | grep AMD（记录 [1002:xxxx] 中的 xxxx）',
              '在内核源码中找到映射：grep -n "0x7480" drivers/gpu/drm/amd/amdgpu/amdgpu_drv.c',
              '确认 CHIP 类型：找到的行应该包含 CHIP_NAVI33',
              '查找 IP 版本：dmesg | grep -i "gfx.*version\\|ip version"（应该显示 11.0.2 = gfx1102）',
              '验证 LLVM 目标名：llc --version 2>&1 | grep gfx1102（如果安装了 LLVM）',
              '在学习日志中记录完整映射：RX 7600 XT ↔ Navi33 ↔ gfx1102 ↔ 0x7480 ↔ CHIP_NAVI33',
            ],
            expectedOutput: `你的 GPU 命名映射卡：
┌─────────────┬──────────────────────────────┐
│ 市场名      │ RX 7600 XT                   │
│ 芯片代号    │ Navi33                       │
│ IP 版本     │ gfx1102 (GFX 11.0.2)        │
│ PCI ID      │ 1002:7480                    │
│ 内核枚举    │ CHIP_NAVI33                  │
│ GFX 实现    │ gfx_v11_0.c                  │
│ SDMA 实现   │ sdma_v6_0.c                  │
│ 显示实现    │ dcn32                        │
│ 架构        │ RDNA3                        │
│ 制程        │ TSMC 6nm                     │
│ CU 数量     │ 32 CU                        │
│ VRAM        │ 8GB GDDR6                    │
└─────────────┴──────────────────────────────┘`,
            hint: '如果 dmesg 中没有显示 IP version，尝试 dmesg | grep -i "gfx\\|gc.*version" 或 cat /sys/class/drm/card0/device/gpu_metrics。',
          },
          debugExercise: {
            title: '识别错误的 LLVM 目标名',
            language: 'bash',
            description: '你在编译一个 HIP 程序时指定了错误的 GPU 目标。分析错误并找出正确的目标名。',
            question: '为什么这个编译命令会在 RX 7600 XT（gfx1102）上产生错误的代码？（同样适用于其他 gfx 目标不匹配的情况）',
            buggyCode: `# 编译 HIP 程序，指定 GPU 目标
hipcc --offload-arch=gfx1100 my_kernel.hip -o my_kernel

# 运行时出错：
# HSA Error: Incompatible device architecture
# Expected: gfx1102, Got: gfx1100`,
            hint: 'gfx1100 和 gfx1102 虽然都是 RDNA3（gfx11xx），但它们是不同的芯片。想想 Navi31 和 Navi33 的区别。',
            answer: '错误：指定了 gfx1100（Navi31 = RX 7900 XTX）而不是 gfx1102（Navi33 = RX 7600 XT）。虽然 gfx1100 和 gfx1102 都属于 RDNA3 系列，但 LLVM 为它们生成的指令有微小差异（如可用的 VGPR 数量、CU 配置、缓存大小）。HSA Runtime 在加载 GPU 程序时会检查 ELF header 中的目标架构是否匹配当前 GPU，不匹配则拒绝加载。正确命令：hipcc --offload-arch=gfx1102 my_kernel.hip -o my_kernel。可以用 rocminfo | grep gfx 查看你的 GPU 的确切 target name。如果你想同时支持多个 GPU：hipcc --offload-arch=gfx1100 --offload-arch=gfx1102 （会生成 fat binary）。',
          },
          interviewQ: {
            question: '解释 AMD GPU 的命名体系。给定一个 IP 版本 gfx1032，你能推断出什么信息？',
            difficulty: 'medium',
            hint: '从 IP 版本号的三个部分（主版本.次版本.修订号）推导架构代数、芯片大小和对应的市场产品。',
            answer: 'gfx1032 的解析：（1）主版本 10 = RDNA 系列（gfx9=GCN5/Vega，gfx10=RDNA1/2，gfx11=RDNA3）。具体来说，gfx103x = RDNA2（gfx101x=RDNA1，gfx110x=RDNA3）。（2）次版本 3 = RDNA2 的第三代修订。（3）修订号 2 = 该代中的第三个芯片变体。查映射表：gfx1030=Navi21（大芯片，RX 6900/6800 XT），gfx1031=Navi22（RX 6700 XT），gfx1032=Navi23（RX 6600 XT）。所以 gfx1032 = Navi23 = RX 6600 XT = RDNA2 中端芯片。在驱动代码中：CHIP_NAVI23，GFX 实现文件是 gfx_v10_3.c。在 LLVM 中：-mcpu=gfx1032。这种推导能力在阅读 amdgpu 源码时非常有用——你看到任何 IP 版本号都能立即知道它对应哪个 GPU 和哪个架构。',
            amdContext: 'AMD 面试中经常给你一个 IP 版本号或芯片代号，测试你能否快速反推出完整的产品信息。这体现了你对 AMD 产品线的熟悉程度。',
          },
        },
      ],
    },

    // ════════════════════════════════════════════════════════════
    // Group 0.5.2: Architecture & Driver Stack
    // ════════════════════════════════════════════════════════════
    {
      id: '05-2',
      number: '0.5.2',
      title: 'GPU 架构演进与驱动技术栈',
      titleEn: 'Architecture Evolution & Driver Stack',
      icon: '⚙️',
      description: '从 GCN 到 RDNA 的架构演进历史，以及 AMD Linux 驱动技术栈每一层的职责和代码位置。',
      lessons: [
        // ── Lesson 0.5.2.1 ────────────────────────────────────
        {
          id: '05-2-1',
          number: '0.5.2.1',
          title: 'GCN 到 RDNA：AMD GPU 架构演进史',
          titleEn: 'GCN to RDNA: AMD GPU Architecture History',
          duration: 20,
          difficulty: 'beginner',
          tags: ['GCN', 'RDNA', 'architecture', 'history'],
          concept: {
            summary: 'AMD GPU 架构经历了 GCN（2012-2019）到 RDNA（2019-至今）的重大转变。GCN 注重计算吞吐量，RDNA 重新设计了着色器引擎以提升游戏性能。理解这段历史有助于理解 amdgpu 代码中大量 legacy code 的存在原因。',
            explanation: [
              'GCN（Graphics Core Next，2012-2019）是 AMD GPU 的第一个统一着色器架构，奠定了现代 AMD GPU 的基础。GCN 的设计理念是"计算优先"——它的 Compute Unit（CU）结构非常适合 GPGPU 计算（这也是为什么 AMD 在 HPC 领域有竞争力），但在纯游戏渲染效率上不如 NVIDIA 的同代架构。GCN 从 1.0 到 5.0（Vega）共 5 代，在 amdgpu 驱动中对应 gfx6 到 gfx9。',
              'GCN 的关键设计：（1）64-wide Wavefront——每个 Wavefront 包含 64 个线程，在 4 个 SIMD16 单元上执行 4 个周期。这个设计在计算密集型任务中效率很高，但在图形渲染中（通常有大量小三角形和分支）会导致资源浪费。（2）统一的 CU 结构——每个 CU 包含 4 个 SIMD16、1 个标量单元和 64KB LDS。（3）固定的 L1/L2 缓存层次。在驱动代码中，GCN 的实现位于 gfx_v6_0.c（GCN1）到 gfx_v9_0.c（Vega）。',
              'RDNA（Radeon DNA，2019-至今）是一次从头设计的架构革命。核心改变：（1）引入 Workgroup Processor（WGP）结构——两个 CU 组成一个 WGP，共享指令缓存和 LDS 带宽，减少硬件冗余；（2）支持 Wave32 模式——Wavefront 可以是 32 或 64 线程，32 线程模式在图形渲染中更高效（更少的分支浪费）；（3）完全重新设计的缓存层次——增加了 L0 缓存（每个 CU 16KB），L1 缓存从 16KB 增加到 128KB，以及 Infinity Cache（RDNA2/3 的大容量 L3 缓存）。',
              'RDNA 的三个代际：RDNA1（2019，gfx10，RX 5700 XT）引入了 WGP 和 Wave32；RDNA2（2020，gfx103x，RX 6800 XT）添加了硬件光线追踪和 Infinity Cache；RDNA3（2022，gfx110x）引入了 WMMA（Wave Matrix Multiply Accumulate）等新能力。RDNA3 家族中既有采用 Chiplet 的型号（如 Navi31/32），也有单晶粒型号（如你的 RX 7600 XT / Navi33）。',
              '对驱动代码的影响：amdgpu 需要同时支持 GCN 和 RDNA 所有架构，这导致大量条件编译和 IP 版本检查。gfx_v11_0.c（你的 GPU）和 gfx_v9_0.c（Vega）的代码结构相似但细节完全不同——寄存器地址、命令格式、中断处理都有差异。理解这个历史演进，能帮助你在看到 "if (adev->ip_versions[GC_HWIP][0] >= IP_VERSION(10, 0, 0))" 这类代码时理解它在区分 GCN 和 RDNA。',
            ],
            keyPoints: [
              'GCN (2012-2019): gfx6-gfx9, 64-wide Wavefront, 计算优先设计',
              'RDNA1 (2019): gfx10, 引入 WGP 和 Wave32, 每瓦性能大幅提升',
              'RDNA2 (2020): gfx103x, 硬件光线追踪 + Infinity Cache',
              'RDNA3 (2022): gfx110x, WMMA AI 指令（部分型号为 Chiplet，Navi33 为单晶粒）',
              'RDNA4 (2025): gfx120x, 增强光追 + AI 性能, RX 9070 XT',
              'amdgpu 驱动中 GCN 代码仍然存在（legacy support）——理解历史有助于理解代码结构',
            ],
          },
          diagram: {
            title: 'AMD GPU 架构演进时间线',
            content: `AMD GPU 架构演进（2012-2025）

2012 ─── GCN 1.0 (Southern Islands) ─── gfx6 ── HD 7970
         │ 首个统一着色器架构, 64-wide Wavefront
         │
2013 ─── GCN 2.0 (Sea Islands) ──────── gfx7 ── R9 290X
         │ 改进 compute, 增加 ACE (异步计算引擎)
         │
2015 ─── GCN 3.0 (Volcanic Islands) ─── gfx8 ── R9 Fury X
         │ 首次 HBM 显存, 改进 geometry pipeline
         │
2017 ─── GCN 5.0 (Vega) ────────────── gfx9 ── Vega 64
         │ HBM2, 改进 HBCC (高带宽缓存控制器)
         │                                          │
  ═══════╪══════════════ 架构革命 ══════════════════╪═══
         │                                          │
2019 ─── RDNA 1.0 (Navi) ──────────── gfx10 ── RX 5700 XT
         │ WGP 结构, Wave32 模式
         │ 每瓦性能比 GCN5 提升 50%
         │
2020 ─── RDNA 2.0 ─────────────────── gfx103x ── RX 6800 XT
         │ 硬件光线追踪 (RA), Infinity Cache (128MB)
         │ 也用于 PS5 和 Xbox Series X
         │
2022 ─── RDNA 3.0 ─────────────────── gfx110x ── RX 7600 XT ← 你
         │ RDNA3 家族：Navi31/32 为 Chiplet，Navi33 为单晶粒
         │ WMMA AI 加速指令, AV1 硬件编码
         │
2025 ─── RDNA 4.0 ─────────────────── gfx120x ── RX 9070 XT
           增强光追, AI 性能大幅提升

驱动代码对应：
  gfx6  → si_*.c (不在 amdgpu, 在旧的 radeon 驱动)
  gfx7  → cik_*.c
  gfx8  → vi_*.c
  gfx9  → gfx_v9_0.c, sdma_v4_0.c
  gfx10 → gfx_v10_0.c, sdma_v5_0.c
  gfx11 → gfx_v11_0.c, sdma_v6_0.c ← 你的 GPU
  gfx12 → gfx_v12_0.c (最新)`,
            caption: 'AMD GPU 从 GCN 到 RDNA 的完整演进。2019 年的 RDNA1 是一次架构革命，性能/瓦提升了 50%。图中以 RX 7600 XT (gfx1102 / Navi33) 作为示例 GPU 标注，其他 AMD GPU 可参照此图定位自己的位置。',
          },
          codeWalk: {
            title: '驱动代码中的架构区分',
            file: 'drivers/gpu/drm/amd/amdgpu/amdgpu_gfx.c',
            language: 'c',
            code: `/* 驱动如何根据架构版本选择不同的行为 */

/* 1. 根据 IP 版本选择 Wave 大小 */
static unsigned int amdgpu_gfx_get_wave_size(struct amdgpu_device *adev)
{
    /* RDNA (gfx10+) 支持 Wave32 和 Wave64 */
    if (adev->ip_versions[GC_HWIP][0] >= IP_VERSION(10, 0, 0))
        return 32;  /* RDNA 默认 Wave32（更高效） */

    /* GCN (gfx6-gfx9) 只支持 Wave64 */
    return 64;  /* GCN 固定 64-wide Wavefront */
}

/* 2. RDNA3 特有的 WMMA (Wave Matrix Multiply) 检查 */
bool amdgpu_gfx_has_wmma(struct amdgpu_device *adev)
{
    /* 只有 gfx11+ (RDNA3) 支持 WMMA AI 加速指令 */
    return adev->ip_versions[GC_HWIP][0] >= IP_VERSION(11, 0, 0);
}

/* 3. 根据架构选择寄存器偏移 */
/* 同一个逻辑功能（如 GRBM_STATUS），在不同架构上的
 * 寄存器地址可能不同：
 *   GCN:  mmGRBM_STATUS = 0x8010
 *   RDNA: mmGRBM_STATUS = 0xD040
 * 每个 gfx_vXX_0.c 文件定义自己的寄存器映射 */

/* 4. RDNA3 家族中的实现差异 */
/* RDNA3 既包含 Chiplet 实现（如 Navi31/32）
 * 也包含单晶粒实现（如 Navi33）。
 * 驱动需要根据具体 IP/ASIC 处理差异化寄存器与性能特征。 */`,
            annotations: [
              'IP_VERSION(10, 0, 0) 是 RDNA1 的起点——这个检查区分了 GCN 和 RDNA 两个世代',
              'Wave32 是 RDNA 的关键创新——在图形渲染中减少了 50% 的分支浪费',
              'WMMA 指令是 RDNA3 独有的——用于 AI 推理中的矩阵乘法加速',
              '寄存器地址在不同架构之间不兼容——每代有自己的寄存器定义头文件',
              'RDNA3 在不同芯片上有不同物理实现——Navi31/32 为 Chiplet，Navi33 为单晶粒',
            ],
            explanation: '这段代码展示了 amdgpu 驱动如何在一套代码中处理跨越 13 年、多个架构世代的 GPU。IP 版本检查（IP_VERSION 宏）是最常用的架构区分方法。当你在代码中看到这种检查时，你可以根据版本号判断这段代码针对的是哪个架构。',
          },
          miniLab: {
            title: '对比不同架构的 GPU 信息',
            objective: '查看你的 RDNA3 GPU 的架构特性，理解它与前代架构的差异。',
            steps: [
              '查看 GPU 架构信息：cat /sys/class/drm/card0/device/gpu_metrics（如果可用）',
              '查看 CU 数量：dmesg | grep -i "compute unit\\|shader engine\\|cu per"',
              '查看缓存信息：dmesg | grep -i "cache\\|L1\\|L2"',
              '查看 Wave 大小支持：dmesg | grep -i "wave"',
              '查看 IP 版本列表：dmesg | grep -i "ip block"（列出所有加载的 IP Block 及版本）',
              '在学习日志中记录你的 GPU 的架构特性：CU 数量、Wave 大小、缓存层次',
            ],
            expectedOutput: `RDNA3 (RX 7600 XT) 架构特性：
- 32 Compute Units (16 WGP)
- Wave32/Wave64 双模式
- L0 Cache: 16KB per CU
- L1 Cache: 128KB per Shader Array
- L2 Cache: 32MB (Infinity Cache)
- VRAM: 8GB GDDR6 @ 288 GB/s
- 支持 WMMA AI 指令
- Navi33（RX 7600 XT）为单晶粒实现（非 Chiplet）`,
            hint: '如果 dmesg 信息不够详细，可以安装 rocminfo（ROCm 工具）：rocminfo 会输出非常详细的 GPU 架构信息。',
          },
          debugExercise: {
            title: '识别架构相关的代码错误',
            language: 'c',
            description: '以下代码尝试在所有 AMD GPU 上使用 WMMA 指令，但只有 RDNA3+ 支持。',
            question: '这段代码在 RDNA2 GPU (RX 6800 XT) 上会发生什么？',
            buggyCode: `/* 使用 WMMA 指令加速矩阵乘法 */
void setup_wmma_compute(struct amdgpu_device *adev)
{
    /* 没有检查 GPU 是否支持 WMMA! */
    WREG32(mmWMMA_CONFIG, WMMA_ENABLE);
    /* 在 RDNA2 GPU 上: mmWMMA_CONFIG 寄存器不存在! */
}`,
            hint: 'WMMA 是 RDNA3 (gfx11+) 才有的功能。在旧架构上访问不存在的寄存器会怎样？',
            answer: '在 RDNA2 GPU (gfx1030) 上，WMMA 寄存器不存在。写入不存在的 MMIO 地址会导致两种可能：（1）写入被 PCIe 总线忽略（no-op），但后续依赖 WMMA 的代码会产生错误结果；（2）触发 GPU 的 illegal register access 中断，导致 GPU hang。正确做法：在使用 WMMA 前检查架构版本：if (adev->ip_versions[GC_HWIP][0] >= IP_VERSION(11, 0, 0)) { WREG32(mmWMMA_CONFIG, WMMA_ENABLE); }。更好的做法是使用 amdgpu_gfx_has_wmma(adev) 这样的辅助函数，避免在每个调用点重复版本检查。这种"先检查能力再使用功能"的模式在驱动代码中无处不在。',
          },
          interviewQ: {
            question: '解释 AMD GPU 从 GCN 到 RDNA 的架构转变，以及这对 amdgpu 驱动代码的影响。',
            difficulty: 'medium',
            hint: '从 Wave 大小、CU/WGP 结构、缓存层次的变化，以及驱动中多代架构共存的代码管理挑战来回答。',
            answer: '架构转变的核心：（1）执行模型：GCN 固定 64-wide Wavefront → RDNA 支持 Wave32/64 双模式。Wave32 在图形渲染中更高效（减少分支浪费），Wave64 在计算中保持吞吐量。驱动需要根据工作负载选择模式。（2）CU 结构：GCN 的 CU 是独立单元 → RDNA 的 WGP（两个 CU 共享资源）提高了硬件利用率。驱动的调度逻辑需要适配 WGP 结构。（3）缓存层次：GCN 简单的 L1/L2 → RDNA 增加了 L0、扩大 L1、引入 Infinity Cache。驱动的内存管理策略需要考虑不同的缓存行为。对驱动代码的影响：amdgpu 使用 IP Block 架构管理多代 GPU——每代架构有自己的 gfx_vXX_0.c 实现文件，但共享通用框架（amdgpu_gfx.c）。IP 版本检查（IP_VERSION 宏）是区分架构行为的主要机制。挑战：GCN 和 RDNA 的寄存器地址、命令格式、中断处理完全不同，驱动需要维护数百个这样的差异点。',
            amdContext: '这是 AMD 面试的核心技术问题之一。展示你不仅知道架构名称，还理解具体的技术差异和对驱动的影响。',
          },
        },

        // ── Lesson 0.5.2.2 ────────────────────────────────────
        {
          id: '05-2-2',
          number: '0.5.2.2',
          title: 'AMD Linux 驱动技术栈每一层详解',
          titleEn: 'AMD Linux Driver Stack Layer by Layer',
          duration: 20,
          difficulty: 'beginner',
          tags: ['driver-stack', 'Mesa', 'libdrm', 'DRM', 'amdgpu', 'ROCm'],
          concept: {
            summary: 'AMD 的 Linux 驱动技术栈从上到下分为 6 层：应用 API → Mesa/ROCm → libdrm → DRM Core → amdgpu → GPU 硬件。每一层都是独立的代码仓库，有不同的开发团队、不同的许可证和不同的发布节奏。',
            explanation: [
              '理解 AMD 驱动技术栈的每一层是驱动开发的基础。当你遇到一个 GPU 问题时，第一步是判断问题出在哪一层——这决定了你应该看哪个代码仓库、联系哪个开发团队。让我们从上到下逐层分析。',
              '第一层：图形/计算 API。图形应用使用 OpenGL（传统）或 Vulkan（现代）API，AI/HPC 应用使用 HIP API。这些是标准化的接口，不直接与 AMD 硬件交互。开发者不需要关心底层是 AMD 还是 NVIDIA GPU，API 保证了可移植性。',
              '第二层：Mesa 3D / ROCm 运行时。Mesa（https://mesa3d.org/）是开源的 OpenGL/Vulkan 实现。AMD 的 Mesa 驱动包括 radeonsi（OpenGL）和 radv（Vulkan）。Mesa 的工作是编译着色器（GLSL/SPIR-V → AMD ISA）、构建 GPU 命令缓冲区（PM4 格式）、管理用户态的 Buffer 分配。ROCm 的 HIP Runtime 做类似的事但面向计算——通过 HSA Runtime 与 KFD 通信。Mesa 和 ROCm 都在用户空间运行。',
              '第三层：libdrm。这是用户空间的 C 库（https://gitlab.freedesktop.org/mesa/drm），封装了 DRM 的 ioctl 调用。libdrm 的 amdgpu 子库（libdrm_amdgpu）提供了 amdgpu_bo_alloc（分配 GPU 内存）、amdgpu_cs_submit（提交命令）等 API。Mesa 和 ROCm 都依赖 libdrm。',
              '第四层：DRM 内核框架。位于 Linux 内核的 drivers/gpu/drm/drm_*.c。DRM 提供通用的 GPU 管理框架：设备文件（/dev/dri/card0）、ioctl 接口、KMS（显示模式设置）、GEM/TTM（内存管理）。DRM 是所有 Linux GPU 驱动的公共代码——AMD、Intel、NVIDIA 都使用同一个 DRM 框架。',
              '第五层：amdgpu 内核驱动。位于 drivers/gpu/drm/amd/，超过 400 万行代码。这是 AMD GPU 特定的实现，包含：GFX（图形引擎控制）、SDMA（DMA 传输）、DC（Display Core，显示控制）、VCN（视频编解码）、KFD（ROCm 计算接口）、PM/SMU（电源管理）。amdgpu 是你学习的核心对象。',
            ],
            keyPoints: [
              'OpenGL/Vulkan/HIP API → 应用层标准接口，跨平台',
              'Mesa radeonsi/radv → 用户态驱动，编译着色器和构建命令包',
              'libdrm (libdrm_amdgpu) → 封装 ioctl，提供 C API',
              'DRM Core → 内核通用 GPU 框架，所有 GPU 驱动共享',
              'amdgpu → AMD 特定内核驱动，IP Block 架构，400 万行代码',
              '每层有独立的代码仓库、团队和发布周期',
            ],
          },
          diagram: {
            title: 'AMD Linux 驱动技术栈完整分层',
            content: `AMD Linux 驱动技术栈：代码仓库 × 开发团队

Layer 6: 应用 (Games / AI / Video)
   代码: 应用开发者
   ↓ OpenGL / Vulkan / HIP / VA-API

Layer 5: 用户态驱动
   ┌─────────────────────┬─────────────────────┐
   │     Mesa 3D         │     ROCm            │
   │  radeonsi (GL)      │  HIP Runtime        │
   │  radv (Vulkan)      │  HSA Runtime        │
   │                     │                     │
   │  仓库: mesa/mesa    │  仓库: ROCm/*       │
   │  许可: MIT          │  许可: MIT          │
   │  团队: AMD + 社区   │  团队: AMD Compute  │
   └──────────┬──────────┴──────────┬──────────┘
              ↓ libdrm API                     ↓ KFD ioctl

Layer 4: libdrm
   ┌─────────────────────────────────────────────┐
   │  libdrm_amdgpu                              │
   │  amdgpu_bo_alloc / amdgpu_cs_submit / ...   │
   │                                              │
   │  仓库: mesa/drm                              │
   │  许可: MIT                                    │
   └──────────────────┬──────────────────────────┘
                      ↓ ioctl() 系统调用

Layer 3: DRM Core (内核空间)
   ┌─────────────────────────────────────────────┐
   │  drm_ioctl.c / drm_gem.c / drm_atomic.c    │
   │  通用 GPU 管理框架                           │
   │                                              │
   │  仓库: torvalds/linux (drivers/gpu/drm/)     │
   │  许可: GPL-2.0                                │
   │  团队: DRM 维护者 (Daniel Vetter 等)         │
   └──────────────────┬──────────────────────────┘
                      ↓

Layer 2: amdgpu 驱动 (内核空间)
   ┌─────────────────────────────────────────────┐
   │  drivers/gpu/drm/amd/                       │
   │  ┌─────┐ ┌──────┐ ┌────┐ ┌─────┐ ┌─────┐ │
   │  │ GFX │ │ SDMA │ │ DC │ │ VCN │ │ KFD │ │
   │  └─────┘ └──────┘ └────┘ └─────┘ └─────┘ │
   │                                              │
   │  仓库: torvalds/linux + agd5f/linux          │
   │  许可: GPL-2.0                                │
   │  团队: AMD Markham + Shanghai                │
   │  维护者: Alex Deucher (agd5f)                │
   └──────────────────┬──────────────────────────┘
                      ↓ MMIO / DMA / Interrupt

Layer 1: GPU 硬件 (RX 7600 XT / Navi33 / gfx1102)`,
            caption: '完整的 AMD Linux 驱动技术栈，标注了每一层的代码仓库、许可证和开发团队。当你提交一个 amdgpu 补丁时，它走的路径是：你 → amd-gfx 邮件列表 → Alex Deucher Review → drm-next 分支 → Linus Torvalds 的 Linux 主线。',
          },
          codeWalk: {
            title: '追踪一个 GPU 内存分配请求穿越所有层',
            file: '多层代码追踪',
            language: 'c',
            code: `/* 追踪一个 BO (Buffer Object) 分配请求穿越驱动栈 */

/* Layer 5: Mesa (用户空间) */
/* mesa/src/gallium/winsys/amdgpu/drm/amdgpu_bo.c */
struct pb_buffer *amdgpu_bo_create(...)
{
    /* Mesa 需要一块 GPU 内存来存储顶点数据 */
    amdgpu_bo_alloc(ws->dev, &request, &buf_handle);
    /* ↓ 调用 libdrm */
}

/* Layer 4: libdrm (用户空间) */
/* libdrm/amdgpu/amdgpu_bo.c */
int amdgpu_bo_alloc(amdgpu_device_handle dev,
                     struct amdgpu_bo_alloc_request *alloc,
                     amdgpu_bo_handle *buf_handle)
{
    struct drm_amdgpu_gem_create args = {0};
    args.in.bo_size = alloc->alloc_size;
    args.in.domains = alloc->preferred_heap;

    /* 调用 ioctl — 跨越用户/内核边界 */
    r = drmIoctl(dev->fd, DRM_IOCTL_AMDGPU_GEM_CREATE, &args);
    /* ↓ 系统调用进入内核 */
}

/* Layer 3: DRM Core (内核空间) */
/* drivers/gpu/drm/drm_ioctl.c */
/* drm_ioctl() → 查找 DRM_IOCTL_AMDGPU_GEM_CREATE
 * → 调用 amdgpu_gem_create_ioctl() */

/* Layer 2: amdgpu (内核空间) */
/* drivers/gpu/drm/amd/amdgpu/amdgpu_gem.c */
int amdgpu_gem_create_ioctl(struct drm_device *dev, void *data,
                             struct drm_file *filp)
{
    /* 最终调用 TTM 分配 VRAM 或 GTT 内存 */
    r = amdgpu_gem_object_create(adev, size, alignment,
                                  domain, flags, type, resv, &gobj);
    /* Layer 1: 硬件 → TTM 更新 GPU 页表，内存可用 */
}`,
            annotations: [
              'Mesa 的 amdgpu_bo_create 是用户态的入口——当游戏需要 GPU 内存时从这里开始',
              'libdrm 的 amdgpu_bo_alloc 封装了 ioctl 调用的细节',
              'drmIoctl 是 libdrm 的系统调用封装——这是用户/内核边界的跨越点',
              'drm_ioctl.c 的分发表将 AMDGPU_GEM_CREATE 路由到 amdgpu 的处理函数',
              'amdgpu_gem_object_create 是实际的内存分配——通过 TTM 管理 VRAM/GTT',
              '整个路径：Mesa → libdrm → ioctl → DRM → amdgpu → TTM → GPU 页表',
            ],
            explanation: '这个例子展示了一个简单的 GPU 内存分配如何穿越整个驱动栈的 5 个层次。从用户空间的 Mesa 到内核的 amdgpu，中间经过 libdrm 的 ioctl 封装和 DRM 的分发机制。当你调试 GPU 内存问题时，你需要判断问题出在哪一层——是 Mesa 的请求参数错误，还是 libdrm 的 ioctl 封装有 Bug，还是 amdgpu 的内存管理有问题。',
          },
          miniLab: {
            title: '查看驱动栈每一层的版本信息',
            objective: '查看你系统上 AMD 驱动栈每一层的版本，建立完整的版本档案。',
            steps: [
              'Mesa 版本：glxinfo | grep "OpenGL version"',
              'Vulkan 驱动版本：vulkaninfo | grep "driverInfo" | head -1（如果安装了 vulkan-tools）',
              'libdrm 版本：pkg-config --modversion libdrm_amdgpu',
              '内核 DRM 版本：cat /sys/module/drm/version',
              'amdgpu 驱动版本：modinfo amdgpu | grep "^version"',
              '内核版本：uname -r',
            ],
            expectedOutput: `你的驱动栈版本档案（示例，实际以本机输出为准）：
┌──────────────┬───────────────────────────────┐
│ Mesa         │ <your-mesa-version>           │
│ Vulkan (radv)│ <your-radv-driver-info>       │
│ libdrm       │ <your-libdrm-version>         │
│ DRM Core     │ <your-drm-core-version>       │
│ amdgpu       │ (随内核版本)                   │
│ 内核         │ <your-kernel-version>          │
└──────────────┴───────────────────────────────┘`,
            hint: '如果 vulkaninfo 不可用，安装 vulkan-tools（sudo apt install vulkan-tools）。如果 glxinfo 不可用，安装 mesa-utils。',
          },
          debugExercise: {
            title: '判断错误来自驱动栈的哪一层',
            language: 'text',
            description: '以下 3 个错误信息来自驱动栈的不同层。判断每个错误的来源层。',
            question: '将每个错误匹配到正确的层：Mesa / libdrm / DRM Core / amdgpu',
            buggyCode: `错误 1:
"radv: Failed to create pipeline cache"

错误 2:
"[drm:amdgpu_cs_ioctl [amdgpu]] *ERROR* Failed to initialize parser"

错误 3:
"amdgpu_bo_alloc: Cannot allocate memory"`,
            hint: '注意每个错误信息的前缀——radv 是 Mesa 的 Vulkan 驱动，[drm:amdgpu_cs_ioctl] 是内核 amdgpu 的日志格式，amdgpu_bo_alloc 是 libdrm 的函数。',
            answer: '错误 1 → Mesa（radv 是 Mesa 中 AMD 的 Vulkan 驱动，pipeline cache 创建失败通常是用户态问题——磁盘空间不足或 shader cache 目录权限问题）。错误 2 → amdgpu 内核驱动（[drm:amdgpu_cs_ioctl [amdgpu]] 格式表明这是内核 printk 输出，amdgpu_cs_ioctl 是内核的命令提交处理函数，parser 初始化失败通常是命令缓冲区格式错误）。错误 3 → libdrm（amdgpu_bo_alloc 是 libdrm 的函数名，"Cannot allocate memory" 是 ioctl 返回 -ENOMEM 的用户态错误信息，原因是 GPU VRAM 或 GTT 内存已满）。快速定位层次的技巧：内核层错误有 [drm] 或 [drm:func] 前缀；Mesa 层有 radeonsi/radv 前缀；libdrm 层有 amdgpu_ 函数名前缀。',
          },
          interviewQ: {
            question: '描述 AMD Linux 驱动栈的每一层，以及当一个 GPU 渲染 Bug 出现时，你如何判断问题出在哪一层。',
            difficulty: 'medium',
            hint: '从各层职责入手，然后描述分层调试策略：先用 dmesg 排除内核层，再用 apitrace 排除 Mesa 层。',
            answer: '驱动栈分层：（1）应用层：OpenGL/Vulkan API 调用；（2）Mesa（radeonsi/radv）：着色器编译、命令包构建；（3）libdrm（libdrm_amdgpu）：ioctl 封装；（4）DRM Core：ioctl 分发、GEM 管理；（5）amdgpu：GPU 特定操作、硬件控制；（6）GPU 硬件。分层调试策略：（1）先检查 dmesg——有 "[drm] *ERROR*" 说明问题在内核层（amdgpu/DRM）；（2）用 apitrace 录制 GL/VK 调用——如果 replay 能复现，问题在 Mesa 或更底层；如果不能，问题在应用层；（3）运行 valgrind 检查 Mesa 的用户态内存错误；（4）用 RADV_DEBUG=info 或 AMD_DEBUG=info 获取 Mesa 的详细日志；（5）用 ftrace 追踪内核函数调用链，确认 amdgpu ioctl 的返回值；（6）最终用 umr 读取 GPU 寄存器状态确认硬件行为。这种自上而下的排除法是最高效的调试策略。',
            amdContext: 'AMD 面试中经常以"如何调试一个渲染 Bug"为题，测试你对整个栈的理解和系统化的调试思维。',
          },
        },

        // ── Lesson 0.5.2.3 ────────────────────────────────────
        {
          id: '05-2-3',
          number: '0.5.2.3',
          title: 'AMD 开源社区与竞争格局',
          titleEn: 'AMD Open Source Community & Competitive Landscape',
          duration: 15,
          difficulty: 'beginner',
          tags: ['open-source', 'community', 'amd-gfx', 'NVIDIA', 'Intel'],
          concept: {
            summary: 'AMD 的 amd-gfx 邮件列表是驱动开发的核心协作平台，每天 30-50 个补丁。理解社区工作流程和竞争格局，是职业发展的重要背景知识。',
            explanation: [
              'AMD 的 GPU 驱动开发以 amd-gfx@lists.freedesktop.org 邮件列表为中心。这个邮件列表是公开的——任何人都可以订阅和发送补丁。每天有 30-50 个补丁提交，涵盖 Bug 修复、新硬件支持、性能优化、代码清理等。Alex Deucher（agd5f）是 amdgpu 的首席维护者，几乎每个补丁都经过他的 Review。',
              'AMD 的驱动开发流程：开发者（AMD 内部或外部社区）在 amd-gfx 列表发送补丁 → Alex Deucher 和其他维护者 Review → 通过的补丁进入 AMD 的 drm-next 分支（agd5f/linux on gitlab.freedesktop.org）→ drm-next 定期合并到 Dave Airlie 的 drm-next → 最终合并到 Linus 的 Linux 主线。从补丁发送到合并进主线通常需要 1-3 个内核 release cycle（3-9 个月）。',
              'AMD vs NVIDIA 的开源战略对比：AMD 的完全开源策略让社区可以自由贡献——目前有数百名非 AMD 员工为 amdgpu 提交过补丁。NVIDIA 在 2022 年开源了 nvidia-open 内核模块，但核心固件和用户态驱动仍然闭源。这意味着社区对 NVIDIA 驱动的影响力极为有限——你不能为 NVIDIA 的核心驱动提交补丁。Intel 的策略类似 AMD（完全开源），但其独立 GPU 市场份额小得多。',
              'AMD 在中国的开发中心：AMD 上海办公室也有 GPU 驱动团队，参与 amdgpu 驱动的开发。在 amd-gfx 邮件列表中经常可以看到 @amd.com 邮箱中来自中国开发者的补丁。如果你在中国求职 AMD GPU 驱动岗位，上海是主要的工作地点。',
            ],
            keyPoints: [
              'amd-gfx 邮件列表是公开的，每天 30-50 个补丁，任何人可以参与',
              'Alex Deucher (agd5f) 是 amdgpu 首席维护者，几乎 Review 所有补丁',
              '补丁路径：amd-gfx → drm-next (AMD) → drm-next (Dave Airlie) → Linux 主线',
              'AMD 完全开源 vs NVIDIA 核心闭源 vs Intel 完全开源但市场份额小',
              'AMD 上海办公室有 GPU 驱动团队，与 Markham 协作',
              '提交一个被接受的补丁是进入 AMD 最有力的简历证明',
            ],
          },
          diagram: {
            title: 'AMD 驱动补丁从开发者到 Linux 主线的路径',
            content: `AMD 驱动补丁的生命周期

你 (开发者)
  │
  │ git send-email patch.mbox
  ▼
amd-gfx@lists.freedesktop.org       ← 公开邮件列表
  │
  │ Alex Deucher Review
  │ (通常 1-2 周)
  ▼
AMD drm-next 分支                    ← agd5f/linux on GitLab
  │ (gitlab.freedesktop.org/agd5f/linux)
  │
  │ 每 2-4 周 pull request
  ▼
DRM drm-next 分支                    ← Dave Airlie 维护
  │ (drm/drm on GitLab)
  │
  │ 每个 merge window
  ▼
Linus Torvalds / Linux 主线          ← torvalds/linux
  │
  │ 发布 rc1 → rc2 → ... → release
  ▼
Linux 6.X 正式发布                   ← 你的补丁在这里！

时间线：
  补丁发送 ──→ Review (1-2周) ──→ drm-next (2-4周)
  ──→ 主线 merge window (2-3月) ──→ 正式发布

并行路径（AMD 内部）：
  AMD 工程师 → 内部 Review → amd-gfx → 同样的流程`,
            caption: '一个 amdgpu 补丁从开发者键盘到 Linux 正式发布的完整路径。整个过程公开透明——你可以在邮件列表中看到每一步。',
          },
          codeWalk: {
            title: '阅读一个真实的 amd-gfx 补丁 Review 对话',
            file: 'amd-gfx mailing list (示例)',
            language: 'text',
            code: `Subject: [PATCH v2] drm/amdgpu: fix use-after-free in amdgpu_ctx_fini
From: Developer <dev@company.com>

[v2: address Alex's review comments - add null check before kfree]

When a context is destroyed while a job is still pending,
amdgpu_ctx_fini() may access the context structure after
it has been freed by the job completion handler.

Add a reference count check before accessing the context
to prevent use-after-free.

Fixes: abc123 ("drm/amdgpu: add context reference counting")
Cc: stable@vger.kernel.org
Signed-off-by: Developer <dev@company.com>
---
 .../gpu/drm/amd/amdgpu/amdgpu_ctx.c | 5 ++++-
 1 file changed, 4 insertions(+), 1 deletion(-)

---
# Review 对话（补丁下面的邮件回复）：

> Alex Deucher <alexander.deucher@amd.com>:
> 
> On Mon, Jan 20, 2025, Developer wrote:
> > +  if (!kref_get_unless_zero(&ctx->refcount))
> > +      return;
>
> Reviewed-by: Alex Deucher <alexander.deucher@amd.com>
> 
> Thanks for fixing this. I'll pick this up for 6.9.

# 补丁被接受！进入 drm-next。`,
            annotations: [
              '[PATCH v2] 表示这是第二版——第一版收到 Review 意见后修改了',
              'Fixes: 标签引用引入 Bug 的原始提交，帮助自动 backport 到稳定分支',
              'Cc: stable@vger.kernel.org 请求将修复 backport 到 LTS 内核',
              'Reviewed-by: Alex Deucher 表示首席维护者已审查并同意',
              '"I\'ll pick this up for 6.9" 表示补丁将进入下一个内核版本',
              '整个对话是公开的——任何人都能在邮件列表归档中查看',
            ],
            explanation: '这就是 AMD 驱动开发的真实工作流程。注意几个关键点：（1）补丁的 commit message 清楚地解释了 what 和 why；（2）v2 说明开发者认真回应了 Review 意见；（3）Alex Deucher 的 Reviewed-by 是补丁被接受的最终确认。当你准备提交你的第一个补丁时，参考这个格式。',
          },
          miniLab: {
            title: '探索 amd-gfx 邮件列表',
            objective: '订阅 amd-gfx 邮件列表，浏览最近的补丁，感受 AMD 驱动开发社区的活跃度。',
            steps: [
              '打开 https://lists.freedesktop.org/mailman/listinfo/amd-gfx',
              '浏览最近一个月的归档：https://lists.freedesktop.org/archives/amd-gfx/',
              '找到一个 [PATCH] 开头的邮件，阅读 commit message',
              '找到一个有 Review 回复的补丁线程，观察 Review 过程',
              '统计今天的补丁数量：浏览今天的归档，数数有多少 [PATCH] 邮件',
              '（可选）订阅邮件列表：在上面的链接中填写你的邮箱地址',
            ],
            expectedOutput: `观察到的活跃度：
- 每天约 30-50 封邮件（补丁 + Review 回复）
- 补丁主题前缀格式：drm/amd/display:, drm/amdgpu:, drm/amdkfd:
- 常见 Reviewer：Alex Deucher, Harry Wentland, Mario Limonciello
- 补丁大小：大部分是 10-100 行的小改动`,
            hint: '如果不想被邮件淹没，可以选择 Digest 模式（每天收到一封汇总邮件而不是每封单独发送）。',
          },
          debugExercise: {
            title: '判断 GPU 驱动的开源/闭源组件',
            language: 'text',
            description: '以下列出了 AMD 和 NVIDIA 驱动栈的 6 个组件。标记每个为开源或闭源。',
            question: '标记每个组件的开源状态',
            buggyCode: `AMD 侧：
1. amdgpu 内核驱动                          → ???
2. Mesa radv (Vulkan 驱动)                  → ???
3. AMD GPU 固件 (amdgpu firmware blobs)     → ???

NVIDIA 侧：
4. nvidia 内核驱动 (传统闭源版)             → ???
5. nvidia-open 内核模块                     → ???
6. NVIDIA 用户态驱动 (libGL/libcuda)        → ???`,
            hint: 'AMD 几乎全部开源（固件除外），NVIDIA 的核心仍然闭源。',
            answer: '1. amdgpu → 开源 (GPL-2.0)，合并入 Linux 主线。2. Mesa radv → 开源 (MIT)，在 Mesa 仓库中。3. AMD GPU 固件 → 闭源（作为 binary blob 在 linux-firmware 中发布，接受 AMD 许可协议）。4. nvidia 传统驱动 → 闭源（NVIDIA 自行发布的 .run 安装包）。5. nvidia-open → 部分开源（2022 年开源的内核模块，但仅包含 GPU System Processor 代码，核心计算/图形逻辑仍在闭源的 GPU System Processor 固件中）。6. NVIDIA 用户态驱动 → 闭源（libGL.so、libcuda.so 完全闭源）。关键区别：AMD 的整个软件栈（驱动+Mesa+ROCm）都是开源的，只有固件是 binary blob。NVIDIA 的核心驱动（无论内核态还是用户态）都是闭源的，nvidia-open 只是一个薄壳。',
          },
          interviewQ: {
            question: 'AMD 的 amdgpu 驱动是如何合并到 Linux 内核主线的？描述从补丁提交到最终发布的完整流程。',
            difficulty: 'easy',
            hint: '描述邮件列表 → Review → drm-next → merge window → release 的路径。',
            answer: '完整流程：（1）开发者（AMD 工程师或社区贡献者）在本地开发并测试补丁；（2）使用 git send-email 将补丁发送到 amd-gfx@lists.freedesktop.org 邮件列表；（3）AMD 维护者（主要是 Alex Deucher）和其他社区成员 Review 补丁，给出 Reviewed-by 或修改意见；（4）通过 Review 的补丁进入 Alex Deucher 维护的 amd-staging-drm-next 分支（Git 仓库在 gitlab.freedesktop.org/agd5f/linux）；（5）Alex 定期向 Dave Airlie（DRM 子系统维护者）发送 pull request，将补丁合并到 drm-next 分支；（6）在 Linux 内核的 merge window（每个 release cycle 的前两周）期间，Dave Airlie 向 Linus Torvalds 发送 pull request；（7）补丁进入 Linus 的 Linux 主线，经过 rc1-rc7 的测试周期后正式发布。紧急 Bug 修复可以通过 Cc: stable@vger.kernel.org 标签请求 backport 到 LTS 内核。',
            amdContext: '理解这个流程展示了你对 Linux 内核社区工作方式的理解——这是 AMD 面试的加分项。',
          },
        },
      ],
    },
  ],
  completionChecklist: [
    '能区分 AMD 三个 GPU 产品层次（Radeon RX / Pro / Instinct）及其驱动差异',
    '能从市场名推导出芯片代号、IP 版本和 Device ID（RX 7600 XT ↔ Navi33 ↔ gfx1102 ↔ 0x7480）',
    '能解释 GCN 到 RDNA 的架构转变及其对驱动代码的影响',
    '能描述 AMD 驱动栈的每一层及其代码仓库位置',
    '能快速判断一个错误信息来自驱动栈的哪一层',
    '了解 amd-gfx 邮件列表的工作流程和补丁合并路径',
  ],
};
