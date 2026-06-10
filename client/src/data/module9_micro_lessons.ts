// ============================================================
// AMD Linux Driver Learning Platform - Module 9 Micro-Lessons
// Module 9: GPU Toolchain & LLVM (GPU 工具链与 LLVM)
// 5 lessons in 2 groups, ~15 min each, total ~75 min
// ============================================================
import type { MicroLessonModule } from './micro_lesson_types';

export const module9MicroLessons: MicroLessonModule = {
  moduleId: 'llvm',
  groups: [
    // ════════════════════════════════════════════════════════════
    // Group 9.1: LLVM 编译器框架
    // ════════════════════════════════════════════════════════════
    {
      id: '9-1',
      number: '9.1',
      title: 'LLVM 编译器框架',
      titleEn: 'LLVM Compiler Framework',
      icon: '🏗️',
      description: '理解 LLVM 的三段式架构——前端、中端优化、后端——以及 LLVM IR 作为通用中间表示的核心设计思想。掌握 SSA 形式和 IR 语法是阅读 GPU 编译器输出的基础。',
      lessons: [
        // ── Lesson 9.1.1 ──────────────────────────────────────
        {
          id: '9-1-1',
          number: '9.1.1',
          title: 'LLVM 三段式架构：前端→中端→后端',
          titleEn: 'LLVM Three-Phase Architecture: Frontend → Optimizer → Backend',
          duration: 15,
          difficulty: 'advanced',
          tags: ['LLVM', 'compiler', 'Clang', 'HIP', 'pass-pipeline'],
          concept: {
            summary: 'LLVM 采用经典的三段式编译器架构：前端（Frontend）将不同语言翻译为统一的 LLVM IR；中端（Middle-end）对 IR 执行数百个优化 Pass；后端（Backend）将优化后的 IR 编译为目标平台的机器码。AMDGPU 后端是 LLVM 中最复杂的后端之一，负责将 LLVM IR 编译为 GCN/RDNA ISA。',
            explanation: [
              '传统编译器（如早期 GCC）把前端解析、优化和代码生成紧密耦合在一起。如果你想支持 M 种语言和 N 种目标平台，理论上需要 M×N 个编译器。LLVM 的核心创新在于引入了一层通用的中间表示——LLVM IR。前端只需将源语言翻译为 LLVM IR（M 个前端），后端只需将 LLVM IR 翻译为目标机器码（N 个后端），所有优化都在 LLVM IR 层面进行并被共享。这将 M×N 问题降低为 M+N。',
              '对 AMD GPU 编译来说，前端是 Clang。HIP 代码（__global__ void kernel(...)）首先被 Clang 解析为 AST（抽象语法树），然后 Clang CodeGen 将 AST 降低为 LLVM IR。Clang 需要识别 GPU 特有的语义——比如 __global__ 属性变为 amdgpu_kernel 调用约定，threadIdx.x 变为对内置函数 llvm.amdgcn.workitem.id.x 的调用。OpenCL 的编译路径类似，只是前端的语法处理不同。',
              '中端是 LLVM 的 Pass Manager，它按顺序执行数百个 Pass 对 IR 进行优化。通用 Pass 包括 mem2reg（将内存中的变量提升为 SSA 寄存器）、instcombine（代数化简）、loop-unroll（循环展开）、inline（函数内联）等。此外还有 AMDGPU 专用的 Pass，如 amdgpu-promote-alloca（将栈分配提升到 LDS 或寄存器）、amdgpu-lower-kernel-arguments（降低内核参数传递）。这些 Pass 的执行顺序由 PassBuilder 控制，错误的顺序可能导致优化失效甚至产生错误代码。',
              '后端是 AMDGPU Target，它将优化后的 LLVM IR 编译为 AMDGPU ISA 机器码。后端的流程：SelectionDAG（将 IR 转换为 DAG 并做指令选择）→ MachineInstr（机器指令表示）→ Register Allocation（寄存器分配）→ Instruction Scheduling（指令调度）→ MC Layer（编码为二进制机器码）。最终输出 .hsaco 文件（ELF 格式的 GPU 可执行文件），包含 GPU 机器码、元数据和资源使用信息。',
              'hipcc 是 HIP 编译工具链的入口。执行 hipcc vector_add.hip 时，实际发生的步骤是：(1) hipcc 调用 Clang 前端编译设备代码，target triple 设为 amdgcn-amd-amdhsa；(2) Clang 生成 LLVM IR，带有 amdgpu_kernel 标注；(3) LLVM 中端执行优化 Pass 序列；(4) AMDGPU 后端将 IR 编译为目标 GPU（如 gfx1102 对应 RX 7600 XT，gfx1100 对应 RX 7900 XTX，gfx1030 对应 RX 6800 XT）的机器码；(5) Clang 前端同时编译主机代码（target triple 为 x86_64）；(6) clang-offload-bundler 将设备代码和主机代码打包为 fat binary。理解这个完整流程是调试编译器问题和做性能优化的基础。',
            ],
            keyPoints: [
              'LLVM 三段式：前端（Clang）→ 中端（Pass Manager）→ 后端（AMDGPU Target），通过 LLVM IR 解耦',
              '前端负责语言特定解析：HIP __global__ → amdgpu_kernel，threadIdx.x → llvm.amdgcn.workitem.id.x',
              '中端执行数百个优化 Pass：通用（mem2reg/inline/loop-unroll）+ AMDGPU 专用（promote-alloca）',
              '后端流程：SelectionDAG → MachineInstr → RegAlloc → Scheduling → MC emit',
              'hipcc 完整链：HIP → Clang → LLVM IR → AMDGPU 后端 → .hsaco（ELF GPU binary）',
              'M+N 设计：M 种语言前端 + N 种后端共享同一套 IR 和优化，消除 M×N 问题',
            ],
          },
          diagram: {
            title: 'hipcc 编译流程：从 HIP 源码到 GPU 可执行文件',
            content: `hipcc 编译流程全景图

 HIP 源码 (vector_add.hip)
 ┌──────────────────────────────────────────────────────────────┐
 │ __global__ void vector_add(float *a, float *b, float *c) {  │
 │   int i = blockIdx.x * blockDim.x + threadIdx.x;            │
 │   c[i] = a[i] + b[i];                                       │
 │ }                                                            │
 └────────────────────────┬─────────────────────────────────────┘
                          │
          ┌───────────────┼──────────────────┐
          │               │                  │
          ▼               ▼                  │
   设备代码编译      主机代码编译             │
   target:           target:                 │
   amdgcn-amd-       x86_64-linux-           │
   amdhsa            gnu                     │
          │               │                  │
          ▼               │                  │
   ┌─────────────┐        │                  │
   │ Clang 前端   │        │                  │
   │ AST → IR     │        │                  │
   │ __global__ → │        │                  │
   │ amdgpu_kernel│        │                  │
   └──────┬──────┘        │                  │
          ▼               │                  │
   ┌─────────────┐        │                  │
   │ LLVM 中端    │        │                  │
   │ 优化 Passes  │        │                  │
   │ mem2reg      │        │                  │
   │ instcombine  │        │                  │
   │ loop-unroll  │        │                  │
   │ promote-     │        │                  │
   │   alloca     │        │                  │
   └──────┬──────┘        │                  │
          ▼               │                  │
   ┌─────────────┐        │                  │
   │ AMDGPU 后端  │        │                  │
   │ ISel → RA →  │        │                  │
   │ Sched → MC   │        │                  │
   │              │        │                  │
   │ gfx1102 ISA  │        │                  │
   └──────┬──────┘        │                  │
          │               │                  │
          ▼               ▼                  │
   ┌─────────────┐ ┌─────────────┐           │
   │ .hsaco       │ │ host .o     │           │
   │ (GPU ELF)    │ │ (x86 obj)   │           │
   └──────┬──────┘ └──────┬──────┘           │
          │               │                  │
          └───────┬───────┘                  │
                  ▼                          │
          clang-offload-bundler              │
                  │                          │
                  ▼                          │
           fat binary (.out)                 │
           ┌─────────────────┐               │
           │ host code (x86) │               │
           │ device code     │               │
           │  (gfx1102 ISA)  │               │
           └─────────────────┘

查看每一步的输出：
  hipcc -E  vector_add.hip   → 预处理
  hipcc -S -emit-llvm ...    → LLVM IR (.ll)
  hipcc -S  ...              → AMDGPU 汇编 (.s)
  hipcc     vector_add.hip   → fat binary`,
            caption: 'hipcc 将 HIP 源码同时编译为设备代码（AMDGPU ISA）和主机代码（x86），最终通过 offload-bundler 打包为 fat binary。整个过程对用户透明，但理解每一步对于调试编译器问题至关重要。',
          },
          codeWalk: {
            title: 'hipcc 编译管线：从 HIP 到 LLVM IR 到 AMDGPU ISA',
            file: 'terminal — hipcc compilation pipeline',
            language: 'bash',
            code: `# ── Step 1: 编写一个最简单的 HIP kernel ──
cat > vector_add.hip << 'EOF'
#include <hip/hip_runtime.h>

__global__ void vector_add(const float *a,
                           const float *b,
                           float *c, int n) {
    int i = blockIdx.x * blockDim.x + threadIdx.x;
    if (i < n) c[i] = a[i] + b[i];
}
EOF

# ── Step 2: 查看 hipcc 实际调用的 Clang 命令 ──
hipcc -v vector_add.hip -c 2>&1 | grep "clang.*amdgcn"
# 输出类似：
# "/opt/rocm/llvm/bin/clang" -cc1 -triple amdgcn-amd-amdhsa
#   -target-cpu gfx1102 -emit-llvm-bc ...

# ── Step 3: 生成 LLVM IR（人类可读的 .ll 格式）──
hipcc -S -emit-llvm --offload-arch=gfx1102 \\
      vector_add.hip -o vector_add.ll
# 查看关键部分：
grep -A 5 "define amdgpu_kernel" vector_add.ll
# define amdgpu_kernel void @_Z10vector_addPKfS0_Pfi(
#   ptr addrspace(1) %a,       ← addrspace(1) = global memory
#   ptr addrspace(1) %b,
#   ptr addrspace(1) %c,
#   i32 %n) #0 {

# ── Step 4: 生成 AMDGPU 汇编（.s 格式）──
hipcc -S --offload-arch=gfx1102 \\
      vector_add.hip -o vector_add.s
# 查看 ISA 指令：
grep -E "v_add|s_load|global_load|s_waitcnt" vector_add.s
# global_load_b32 v1, v0, s[4:5]   ← 从全局内存加载 a[i]
# global_load_b32 v2, v0, s[6:7]   ← 从全局内存加载 b[i]
# v_add_f32_e32 v1, v1, v2         ← VALU: v1 = a[i] + b[i]
# global_store_b32 v0, v1, s[8:9]  ← 写回 c[i]

# ── Step 5: 查看编译器使用了多少寄存器 ──
grep -E "NumSgprs|NumVgprs|ScratchSize" vector_add.s
# .amdhsa_next_free_vgpr 3    ← 使用 3 个 VGPR
# .amdhsa_next_free_sgpr 16   ← 使用 16 个 SGPR
# .amdhsa_private_segment_fixed_size 0  ← 无栈溢出`,
            annotations: [
              'hipcc -v 显示实际的 clang 命令行，-triple amdgcn-amd-amdhsa 指定 GPU 目标',
              '-target-cpu gfx1102 对应 RX 7600 XT (RDNA3 Navi33)；其他 GPU 使用对应 gfx 版本号（可通过 rocminfo 查看）',
              'LLVM IR 中的 amdgpu_kernel 调用约定告诉后端这是 GPU kernel 入口',
              'addrspace(1) 是 AMDGPU 的全局内存地址空间编号，0=private，3=LDS，4=constant',
              'v_add_f32_e32 是 RDNA3 的向量浮点加法指令，_e32 表示 32 位编码格式',
              'NumVgprs/NumSgprs 是编译器的寄存器使用报告，直接影响 GPU 占用率（Occupancy）',
            ],
            explanation: '这个完整的编译管线展示了 hipcc 如何将 HIP 源码逐步降低为 GPU 机器码。关键观察：一个简单的 c[i]=a[i]+b[i] 操作，在 LLVM IR 层面是 load→load→fadd→store 的 SSA 指令序列，在 ISA 层面变成 global_load→global_load→v_add_f32→global_store。理解这种对应关系是性能优化的基础——你能看到编译器做了什么、没做什么。',
          },
          miniLab: {
            title: '追踪 HIP 程序的完整编译流程',
            objective: '动手执行 hipcc 的每一个编译阶段，观察 HIP 代码如何逐步变为 GPU 机器码。',
            setup: `# 确保已安装 ROCm 和 hipcc
which hipcc || echo "请先安装 ROCm: https://rocm.docs.amd.com"
hipcc --version`,
            steps: [
              '编写 vector_add.hip（上述 Code Walk 中的代码），保存到工作目录',
              '生成预处理后的代码：hipcc -E vector_add.hip -o vector_add.i，搜索 vector_add 函数看 HIP 宏被展开后的样子',
              '生成 LLVM IR：hipcc -S -emit-llvm --offload-arch=gfx1102 vector_add.hip -o vector_add.ll，阅读 define amdgpu_kernel 开头的函数',
              '生成优化后的 IR：hipcc -S -emit-llvm -O3 --offload-arch=gfx1102 vector_add.hip -o vector_add_opt.ll，对比 -O0 和 -O3 的 IR 差异',
              '生成 AMDGPU 汇编：hipcc -S -O3 --offload-arch=gfx1102 vector_add.hip -o vector_add.s，统计使用的 VGPR/SGPR 数量',
              '编译为可执行文件：hipcc vector_add.hip -o vector_add --offload-arch=gfx1102，用 llvm-objdump --disassemble-all vector_add 查看嵌入的 GPU 代码',
            ],
            expectedOutput: `$ wc -l vector_add.ll vector_add_opt.ll vector_add.s
  45 vector_add.ll       ← 未优化 IR（约 45 行）
  28 vector_add_opt.ll   ← 优化后 IR 更短（优化器消除了冗余指令）
  85 vector_add.s        ← AMDGPU 汇编（含元数据和指令）

$ grep "amdhsa_next_free" vector_add.s
.amdhsa_next_free_vgpr 3
.amdhsa_next_free_sgpr 16`,
            hint: '如果没有 AMD GPU，可以用 --offload-arch=gfx900 (Vega) 或 gfx1030 (RDNA2) 交叉编译。编译不需要物理 GPU，只有运行才需要。也可以使用 godbolt.org (Compiler Explorer) 在线查看 AMDGPU 编译输出。',
          },
          debugExercise: {
            title: '诊断 hipcc 编译错误',
            language: 'c',
            description: '以下 HIP 代码编译时出错。找出错误原因并修复。',
            question: '这段代码在 hipcc 编译时为什么会失败？错误来自编译管线的哪个阶段？',
            buggyCode: `#include <hip/hip_runtime.h>

__global__ void broken_kernel(float *out, int n) {
    int tid = threadIdx.x;
    /* 尝试在 GPU kernel 中使用 printf 打印所有线程的值 */
    float local_array[1024];  /* BUG: 巨大的栈分配 */
    for (int i = 0; i < 1024; i++)
        local_array[i] = tid * i;
    float sum = 0;
    for (int i = 0; i < 1024; i++)
        sum += local_array[i];
    out[tid] = sum;
}

/* 编译报告：
 * warning: register pressure too high;
 * NumVgprs: 258 (exceeds 256 limit)
 * ScratchSize: 4096  ← spill to scratch memory
 */`,
            hint: '每个 CU 的 VGPR 总数有限，如果每个 Wavefront 使用太多 VGPR，GPU 只能同时运行很少的 Wavefront（低 Occupancy）。1024 个 float 的栈分配对 GPU 来说意味着什么？',
            answer: '问题：在 GPU kernel 中分配了 1024 个 float 的本地数组（4KB），远超单个线程可用的寄存器空间。在 RDNA3 上，单个 wave 最多只能寻址 256 个 VGPR（每个 VGPR 是 32 位）。一个 1024 元素的私有数组意味着每条 lane 需要约 1024 个 VGPR，远超 256 个/wave 的寻址上限。编译器被迫将大部分数据 spill 到 scratch memory（GPU 的栈内存，位于 VRAM），导致：(1) ScratchSize 非零，表示发生了寄存器溢出；(2) 性能急剧下降——scratch 访问延迟是寄存器的 100 倍以上；(3) Occupancy 降至最低，因为 scratch buffer 也占用资源。这个问题在 LLVM AMDGPU 后端的 register allocation 阶段暴露。修复方法：用 __shared__（LDS）替代大数组，或用循环分块处理避免一次性分配大数组。在 GPU 编程中，私有数组应尽量小（<16 元素）以确保编译器能将其完全放入寄存器。',
          },
          interviewQ: {
            question: '描述 LLVM 的三段式架构和其核心设计理念。为什么 AMD GPU 编译器选择基于 LLVM？',
            difficulty: 'medium',
            hint: '从 M×N 问题、IR 作为通用中间表示、Pass 复用的角度回答。对 AMD 来说，LLVM 生态系统的优势是什么？',
            answer: 'LLVM 的三段式架构将编译器分为前端、中端和后端，通过统一的 LLVM IR（Intermediate Representation）解耦。前端将不同语言（C/C++/HIP/OpenCL/GLSL）编译为 LLVM IR，中端在 IR 上执行数百个优化 Pass（通用优化如 inline/GVN/LICM + 目标特定优化如 amdgpu-promote-alloca），后端将优化后的 IR 降低为目标机器码。这种设计将 M 种语言 × N 种后端的 M×N 问题降为 M+N。AMD 选择 LLVM 的原因：(1) 成熟的优化框架——数百个经过验证的优化 Pass 可以直接复用，AMD 只需开发 AMDGPU-specific 后端和少量特定 Pass；(2) 多语言支持——同一个 AMDGPU 后端同时服务于 HIP、OpenCL、Vulkan SPIR-V、ROCm 等多种前端；(3) 社区和生态——LLVM 社区活跃，AMD Toolchain 团队的工程师（如 Matt Arsenault、Jay Foad）是 LLVM 核心贡献者，代码审核和维护成本由社区分担；(4) 与 ROCm 生态的一致性——ROCm 全栈基于 LLVM/Clang，从编译器到调试器（LLDB）到分析器（rocprof）都在同一个框架下。',
            amdContext: 'AMD Markham 的 Toolchain 团队是 LLVM AMDGPU 后端的核心维护者。面试时展示你理解 LLVM 架构和 AMDGPU 后端的设计，以及 AMD 选择 LLVM 的战略意义，会显示出你对这个团队工作的深刻理解。',
          },
        },

        // ── Lesson 9.1.2 ──────────────────────────────────────
        {
          id: '9-1-2',
          number: '9.1.2',
          title: 'LLVM IR 与 SSA 形式',
          titleEn: 'LLVM IR and SSA Form',
          duration: 15,
          difficulty: 'advanced',
          tags: ['LLVM-IR', 'SSA', 'phi-node', 'basic-block', 'amdgpu_kernel'],
          concept: {
            summary: 'LLVM IR 是一种强类型、SSA（Static Single Assignment）形式的中间表示。每个变量只被赋值一次，控制流合并点使用 phi 节点选择值。AMDGPU 特有的 IR 特征包括 amdgpu_kernel 调用约定和地址空间标注（addrspace）。',
            explanation: [
              'LLVM IR 是编译器中端和后端之间的通用语言。它有三种等价的表现形式：人类可读的文本格式（.ll 文件）、紧凑的二进制格式（.bc 文件，即 bitcode）、以及内存中的 C++ 对象（llvm::Module/Function/Instruction 等）。三种形式是完全等价的，可以互相转换。对于学习和调试，我们主要使用 .ll 文本格式。',
              'SSA（Static Single Assignment）是 LLVM IR 最核心的性质：每个虚拟寄存器（以 % 开头）只被定义（赋值）一次。例如 %sum = fadd float %a, %b 定义了 %sum，之后不能再给 %sum 赋新值。如果源代码中有变量被多次赋值（如 x = x + 1），SSA 形式会创建新的版本（%x.1 = add i32 %x.0, 1）。SSA 的好处是极大简化了数据流分析——每个值的定义点唯一，使用-定义链（use-def chain）可以直接建立。',
              '当两个控制流路径合并时，SSA 需要 phi 节点来选择使用哪个路径的值。例如 if-else 语句中 x 在两个分支中被赋不同的值，合并点需要 %x.merge = phi i32 [%x.then, %bb.then], [%x.else, %bb.else]。phi 指令根据控制流来源选择值——如果从 %bb.then 到达则选 %x.then，从 %bb.else 到达则选 %x.else。phi 节点是 SSA 的核心机制，它允许在保持"每个变量只赋值一次"的同时表达控制流依赖的值。',
              'LLVM IR 的基本结构单位是 Basic Block（基本块）：一段顺序执行的指令序列，以 label 开头、以 terminator 指令（br/ret/switch）结尾。函数是 Basic Block 的集合，模块（Module）是函数的集合。关键指令类型：算术（add/fadd/mul）、内存（load/store/alloca）、控制流（br/ret/phi）、类型转换（bitcast/zext/trunc）、调用（call）、GEP（getelementptr——数组/结构体地址计算）。',
              '对于 AMDGPU，IR 有几个重要的特殊标注：(1) amdgpu_kernel 调用约定——标记这是一个 GPU kernel 入口函数，后端会为其生成特殊的 prolog（加载 kernel arguments、设置 workgroup info 等）；(2) addrspace 地址空间标注——addrspace(0)=private（每线程栈）、addrspace(1)=global（全局内存/VRAM）、addrspace(3)=local（LDS，workgroup 共享）、addrspace(4)=constant（只读常量内存）；(3) llvm.amdgcn.* 内置函数——如 llvm.amdgcn.workitem.id.x（获取线程 ID）、llvm.amdgcn.s.barrier（同步屏障）。这些标注让后端知道如何生成正确的内存访问指令和地址计算。',
              '理解 LLVM IR 是阅读编译器输出和诊断优化问题的基础。当你发现 GPU kernel 性能不佳时，第一步通常是 hipcc -S -emit-llvm 查看 IR——看优化器是否成功消除冗余计算、是否正确展开循环、是否将内存操作转化为更高效的形式。IR 层面的问题比 ISA 层面更容易理解和定位。',
            ],
            keyPoints: [
              'LLVM IR 三种形式：.ll（文本）、.bc（bitcode 二进制）、内存对象——完全等价可互转',
              'SSA 形式：每个 %变量只被定义一次，简化数据流分析和优化',
              'phi 节点在控制流合并点选择值：phi i32 [%val.then, %bb.then], [%val.else, %bb.else]',
              'Basic Block：以 label 开头、terminator 结尾的线性指令序列',
              'AMDGPU 特有：amdgpu_kernel 调用约定、addrspace(0/1/3/4) 地址空间、llvm.amdgcn.* intrinsics',
              '关键指令：load/store（内存）、getelementptr（地址计算）、fadd/fmul（算术）、br/phi（控制流）',
            ],
          },
          diagram: {
            title: 'LLVM IR 中的 SSA 形式与 phi 节点',
            content: `从 C 代码到 LLVM IR SSA 形式

── 源代码（HIP kernel 中的条件分支）──

  float result;
  if (tid < n) {
      result = a[tid] + b[tid];    // then 分支
  } else {
      result = 0.0f;               // else 分支
  }
  out[tid] = result;               // 使用合并后的值


── 编译为 LLVM IR (SSA 形式) ──

  define amdgpu_kernel void @kernel(
      ptr addrspace(1) %a,         ; addrspace(1) = global memory
      ptr addrspace(1) %b,
      ptr addrspace(1) %out,
      i32 %n) {

  entry:                            ; ← Basic Block: entry
    %tid = call i32 @llvm.amdgcn.workitem.id.x()
    %cmp = icmp slt i32 %tid, %n   ; tid < n ?
    br i1 %cmp, label %bb.then,    ; ← terminator: conditional branch
              label %bb.else

  bb.then:                          ; ← Basic Block: then
    %ptr.a = getelementptr float,   ; 计算 &a[tid]
              ptr addrspace(1) %a, i32 %tid
    %val.a = load float,            ; 加载 a[tid]
              ptr addrspace(1) %ptr.a
    %ptr.b = getelementptr float,   ; 计算 &b[tid]
              ptr addrspace(1) %b, i32 %tid
    %val.b = load float,            ; 加载 b[tid]
              ptr addrspace(1) %ptr.b
    %sum = fadd float %val.a, %val.b  ; a[tid] + b[tid]
    br label %bb.merge              ; ← terminator: unconditional branch

  bb.else:                          ; ← Basic Block: else
    br label %bb.merge

  bb.merge:                         ; ← Basic Block: merge (合并点)
    %result = phi float             ; ★ PHI 节点 ★
      [ %sum,  %bb.then ],         ; 从 then 来 → 用 %sum
      [ 0.0,   %bb.else ]          ; 从 else 来 → 用 0.0
    %ptr.out = getelementptr float,
              ptr addrspace(1) %out, i32 %tid
    store float %result,            ; out[tid] = result
              ptr addrspace(1) %ptr.out
    ret void
  }

注意 SSA 性质：每个 %变量只被赋值一次
  %tid    = call ...    (定义一次)
  %val.a  = load ...    (定义一次)
  %sum    = fadd ...    (定义一次)
  %result = phi ...     (定义一次，但值取决于来源路径)`,
            caption: 'SSA 形式中每个变量只被定义一次。phi 节点是 SSA 处理控制流合并的核心机制——它不生成任何机器指令，而是告诉寄存器分配器在合并点选择正确的值。注意 AMDGPU 特有的 amdgpu_kernel 和 addrspace(1) 标注。',
          },
          codeWalk: {
            title: 'vector_add 编译为 LLVM IR：完整标注',
            file: 'vector_add.ll — hipcc -S -emit-llvm -O2 output',
            language: 'llvm',
            code: `; ModuleID = 'vector_add.hip'
target datalayout = "e-p:64:64-p1:64:64-p2:32:32-p3:32:32-p4:64:64-p5:32:32-p6:32:32-p7:160:256:256:32-p8:128:128-i64:64-v16:16-v24:32-v32:32-v48:64-v96:128-v192:256-v256:256-v512:512-v1024:1024-v2048:2048-n32:64-S32-A5-G1-ni:7:8"
target triple = "amdgcn-amd-amdhsa"

; 函数定义：amdgpu_kernel 标记这是 GPU kernel 入口
define amdgpu_kernel void @_Z10vector_addPKfS0_Pfi(
    ptr addrspace(1) nocapture readonly %a,   ; const float* (global)
    ptr addrspace(1) nocapture readonly %b,   ; const float* (global)
    ptr addrspace(1) nocapture writeonly %c,  ; float*       (global)
    i32 %n                                    ; int n
) #0 {
entry:
  ; 获取线程索引：blockIdx.x * blockDim.x + threadIdx.x
  %tid.x = tail call i32 @llvm.amdgcn.workitem.id.x()
  %bid.x = tail call i32 @llvm.amdgcn.workgroup.id.x()
  %bsz.x = tail call i32 @llvm.amdgcn.dispatch.ptr.load.i32(i32 4)
  %tmp0 = mul i32 %bid.x, %bsz.x
  %i = add i32 %tmp0, %tid.x

  ; 边界检查：if (i < n)
  %cmp = icmp slt i32 %i, %n
  br i1 %cmp, label %if.then, label %if.end

if.then:
  ; GEP: 计算数组元素地址  &a[i] = a + i*sizeof(float)
  %idx = sext i32 %i to i64
  %ptr.a = getelementptr inbounds float, ptr addrspace(1) %a, i64 %idx
  %ptr.b = getelementptr inbounds float, ptr addrspace(1) %b, i64 %idx
  %ptr.c = getelementptr inbounds float, ptr addrspace(1) %c, i64 %idx

  ; load: 从全局内存加载值
  %val.a = load float, ptr addrspace(1) %ptr.a, align 4
  %val.b = load float, ptr addrspace(1) %ptr.b, align 4

  ; fadd: 浮点加法  c[i] = a[i] + b[i]
  %sum = fadd float %val.a, %val.b

  ; store: 写回全局内存
  store float %sum, ptr addrspace(1) %ptr.c, align 4
  br label %if.end

if.end:
  ret void
}

; AMDGPU intrinsics 声明
declare i32 @llvm.amdgcn.workitem.id.x()
declare i32 @llvm.amdgcn.workgroup.id.x()

; 函数属性
attributes #0 = {
  "amdgpu-flat-work-group-size"="1,1024"
  "uniform-work-group-size"="true"
}`,
            annotations: [
              'target triple "amdgcn-amd-amdhsa"——amdgcn 是 AMD GCN/RDNA ISA 架构名，amdhsa 是 HSA 运行时 ABI',
              'amdgpu_kernel 调用约定：后端会生成特殊 prolog 从 SGPRs 加载 kernel arguments',
              'addrspace(1) 标注所有全局内存指针——后端据此选择 global_load/global_store 指令',
              'getelementptr (GEP) 不执行任何内存操作，只计算地址偏移——它是 LLVM IR 的地址运算指令',
              'sext i32 %i to i64：将 32 位索引符号扩展为 64 位——AMDGPU 的全局地址是 64 位',
              'llvm.amdgcn.workitem.id.x() 对应 RDNA3 的 v0 寄存器——硬件在 kernel 启动时自动填充线程 ID',
            ],
            explanation: '这段 LLVM IR 是 vector_add kernel 在 -O2 优化后的输出。对比 HIP 源码和 IR：blockIdx.x*blockDim.x+threadIdx.x 变为 AMDGCN intrinsic 调用和算术指令；c[i]=a[i]+b[i] 变为 GEP→load→load→fadd→store 的 SSA 指令序列。注意每个 % 变量只被赋值一次（SSA 性质），addrspace(1) 标注确保后端生成正确的全局内存访问指令。',
          },
          miniLab: {
            title: '手动分析 LLVM IR 的 SSA 和 phi 节点',
            objective: '通过编写包含条件分支的 HIP 代码，观察编译器生成的 phi 节点和 SSA 形式。',
            steps: [
              '编写包含 if-else 的 HIP kernel（如上述 diagram 中的代码），保存为 phi_test.hip',
              '生成未优化的 IR：hipcc -S -emit-llvm -O0 --offload-arch=gfx1102 phi_test.hip -o phi_O0.ll',
              '在 phi_O0.ll 中搜索 alloca——-O0 不做 mem2reg，所以变量在栈上',
              '生成优化后的 IR：hipcc -S -emit-llvm -O2 --offload-arch=gfx1102 phi_test.hip -o phi_O2.ll',
              '在 phi_O2.ll 中搜索 phi——O2 执行了 mem2reg，alloca 变为 phi 节点',
              '画出 phi_O2.ll 的控制流图：每个 label 是一个节点，br 指令是边，标注 phi 节点的数据流',
            ],
            expectedOutput: `$ grep "alloca" phi_O0.ll
  %result = alloca float, align 4, addrspace(5)  ← -O0: 变量在栈上
  %tid.addr = alloca i32, align 4, addrspace(5)

$ grep "phi" phi_O2.ll
  %result = phi float [ %sum, %if.then ], [ 0.000000e+00, %if.else ]
  ← -O2: alloca 被消除，变为 phi 节点`,
            hint: 'mem2reg Pass 是将非 SSA 代码（带 alloca/load/store）转化为 SSA 代码（带 phi 节点）的关键 Pass。使用 opt -passes=mem2reg 可以单独运行这个 Pass。',
          },
          debugExercise: {
            title: '修复不合法的 LLVM IR',
            language: 'llvm',
            description: '以下 LLVM IR 片段有两个违反 SSA 规则的错误。找出并修正它们。',
            question: '哪两条指令违反了 LLVM IR 的 SSA 规则？如何修正？',
            buggyCode: `define amdgpu_kernel void @bad_ssa(ptr addrspace(1) %out, i32 %n) {
entry:
  %i = add i32 0, 1          ; %i = 1
  %i = add i32 %i, 1         ; BUG #1: %i 被赋值两次！
  br i1 true, label %bb1, label %bb2

bb1:
  %val = fadd float 1.0, 2.0
  br label %merge

bb2:
  %val = fadd float 3.0, 4.0 ; BUG #2: %val 在另一个 BB 中也被定义！
  br label %merge

merge:
  store float %val, ptr addrspace(1) %out
  ret void
}`,
            hint: 'SSA 的核心规则：每个虚拟寄存器（%name）在整个函数中只能被定义（赋值）一次。控制流合并点需要使用什么特殊指令？',
            answer: 'BUG #1：%i 在 entry 块中被定义了两次。SSA 要求每个 %变量只能有一个定义点。修正：将第二次赋值改为 %i2 = add i32 %i, 1。BUG #2：%val 在 bb1 和 bb2 中都被定义。即使两个定义在不同的基本块中，SSA 仍然要求全局唯一。修正：bb1 中用 %val.1 = fadd float 1.0, 2.0，bb2 中用 %val.2 = fadd float 3.0, 4.0，然后在 merge 块中添加 phi 节点：%val = phi float [%val.1, %bb1], [%val.2, %bb2]。这正是 phi 节点存在的意义——在保持 SSA 唯一定义规则的同时表达控制流合并。LLVM 的 verifier pass（opt -verify）会自动检测这些违规。',
          },
          interviewQ: {
            question: '什么是 SSA 形式？LLVM IR 中的 phi 节点是什么？它如何帮助编译器优化？',
            difficulty: 'medium',
            hint: '从定义唯一性、use-def chain、数据流分析简化的角度回答。phi 节点解决了什么问题？',
            answer: 'SSA（Static Single Assignment）是一种 IR 表示形式，其核心规则是每个变量只被定义（赋值）一次。例如源码中的 x=1; x=x+1; 在 SSA 中变为 %x.0=1; %x.1=add %x.0, 1。这使得 use-def chain（使用-定义链）是平凡的——每个使用直接指向唯一的定义，不需要数据流分析来消歧。这极大简化了常量传播、死代码消除、公共子表达式消除等优化。phi 节点是 SSA 处理控制流合并的机制。当两个分支对同一变量赋不同的值时，合并点需要 phi float [%v1, %bb1], [%v2, %bb2] 来表达"值取决于从哪个路径到达"。phi 节点不生成任何实际机器指令——在寄存器分配阶段，它会被消解为寄存器复制或直接利用寄存器命名。phi 节点帮助优化器进行更精确的数据流分析：例如 GVN（Global Value Numbering）可以通过 phi 节点发现冗余计算，LICM（Loop Invariant Code Motion）可以通过 phi 节点确定循环中的不变量。',
            amdContext: 'AMD Toolchain 团队日常工作直接操作 LLVM IR。面试中展示你能读懂 IR、理解 SSA 形式和 phi 节点，说明你有能力参与编译器开发工作。提到 AMDGPU-specific 的 IR 特征（amdgpu_kernel, addrspace）是加分项。',
          },
        },
      ],
    },

    // ════════════════════════════════════════════════════════════
    // Group 9.2: AMDGPU 后端
    // ════════════════════════════════════════════════════════════
    {
      id: '9-2',
      number: '9.2',
      title: 'AMDGPU 后端',
      titleEn: 'AMDGPU Backend',
      icon: '⚙️',
      description: '深入 LLVM AMDGPU 后端：指令选择、寄存器分配、ISA 汇编。这是 AMD Markham Toolchain 团队的核心工作——将 LLVM IR 高效编译为 AMD GPU 机器码。',
      lessons: [
        // ── Lesson 9.2.1 ──────────────────────────────────────
        {
          id: '9-2-1',
          number: '9.2.1',
          title: 'AMDGPU 后端架构',
          titleEn: 'AMDGPU Backend Architecture',
          duration: 15,
          difficulty: 'expert',
          tags: ['AMDGPU-backend', 'SelectionDAG', 'MachineInstr', 'instruction-selection', 'pass-pipeline'],
          concept: {
            summary: 'AMDGPU 后端是 LLVM 中最复杂的后端之一。它通过 SelectionDAG 将 LLVM IR 转换为 GPU 机器指令（MachineInstr），然后经过寄存器分配和指令调度，最终生成 AMDGPU ISA 二进制。后端还包含多个 GPU 专用 Pass，如 promote-alloca 和 lower-kernel-arguments。',
            explanation: [
              'AMDGPU 后端的入口是 AMDGPUTargetMachine 类（llvm/lib/Target/AMDGPU/AMDGPUTargetMachine.cpp）。它注册了 AMDGPU 的所有后端组件：指令定义（AMDGPUInstrInfo）、寄存器文件（SIRegisterInfo）、子目标信息（GCNSubtarget）、调用约定、合法化规则等。通过 --mcpu=gfx1102 参数，后端选择 RDNA3 的子目标配置，包括可用指令集、寄存器限制、流水线特征。',
              '指令选择（Instruction Selection）是后端最关键的阶段。它将 LLVM IR 的抽象操作转换为目标机器的具体指令。AMDGPU 使用 SelectionDAG-based ISel：首先将 LLVM IR 构建为 DAG（有向无环图），然后通过 pattern matching 将 DAG 节点匹配到 AMDGPU 指令。例如 LLVM IR 的 fadd float → DAG 的 ISD::FADD → AMDGPU 的 V_ADD_F32_e32（VALU 浮点加法）。这些匹配规则定义在 .td（TableGen）文件中，如 SIInstructions.td。',
              '指令选择后，IR 从 LLVM IR 降低为 MachineInstr——一种接近最终机器码但仍使用虚拟寄存器的表示。此时的代码已经使用了具体的 AMDGPU 指令（V_ADD_F32、S_LOAD_DWORDX4、GLOBAL_LOAD_DWORD 等），但寄存器还是虚拟的（如 %vreg0、%vreg1）。后续的寄存器分配阶段会将虚拟寄存器映射到物理寄存器（v0、v1、s0、s1 等）。',
              'AMDGPU 后端包含多个 GPU 专用 Pass，它们处理 GPU 硬件的特殊需求：(1) AMDGPUPromoteAlloca——将 alloca（栈上的私有数组）提升到 LDS（Local Data Share）或向量寄存器，避免昂贵的 scratch 内存访问；(2) AMDGPULowerKernelArguments——将 kernel 参数从内核参数段（kern_arg_segment）加载到寄存器；(3) SIFixSGPRCopies——修复 SGPR↔VGPR 之间非法的复制操作；(4) SIInsertWaitcnts——在必要位置插入 s_waitcnt 指令，确保内存操作完成后再使用结果；(5) SIOptimizeExecMaskingPreRA——优化 exec mask 操作以减少控制流开销。这些 Pass 是 AMDGPU 后端区别于通用后端的核心所在。',
              '完整的 AMDGPU 后端 Pass 管线（从 LLVM IR 到机器码）大致为：LLVM IR → AMDGPULowerIntrinsics → AMDGPUPromoteAlloca → AMDGPULowerKernelArguments → SelectionDAG ISel → SIFixSGPRCopies → SIOptimizeExecMasking → Register Allocation → SIInsertWaitcnts → Post-RA Scheduling → MC Code Emission。可以用 llc -mtriple=amdgcn -mcpu=gfx1102 -debug-pass=Structure 查看完整的 Pass 列表。',
              'Two AMDGPU-specific passes deserve special attention. SIInsertWaitcnts inserts s_waitcnt instructions to handle the GPU\'s asynchronous memory model — without these wait instructions, a shader might read data before the previous store completes, causing silent corruption. The pass analyzes data dependencies and inserts the minimum necessary waits (vmcnt for vector memory, lgkmcnt for LDS/GDS/scalar, expcnt for exports). The second critical pass is SIShrinkInstructions, which converts 64-bit VOP3 encoding to 32-bit VOP1/VOP2 where possible, saving instruction cache space. When VGPR pressure exceeds available registers, the compiler spills to scratch memory (private per-thread VRAM space accessed via MUBUF instructions), which is 100x slower than register access — this is why minimizing VGPR usage is critical for performance.',
            ],
            keyPoints: [
              'AMDGPUTargetMachine 是后端入口，通过 --mcpu=gfx1102 选择 RDNA3 子目标配置',
              '指令选择：SelectionDAG ISel 通过 .td 文件中的 pattern matching 将 IR 节点匹配到 AMDGPU 指令',
              'MachineInstr 是后端的核心表示——具体的 AMDGPU 指令 + 虚拟寄存器',
              'GPU 专用 Pass：promote-alloca（避免 scratch）、lower-kernel-arguments、fix-sgpr-copies、insert-waitcnts',
              'Pass 管线：IR → Lower → Promote → ISel → RegAlloc → Scheduling → MC Emit',
              '用 llc -debug-pass=Structure 查看完整的 Pass 列表和执行顺序',
              'SIInsertWaitcnts pass prevents data corruption by inserting s_waitcnt for async memory ops',
              'Scratch memory spill (VGPR overflow → VRAM) is 100x slower than register access',
            ],
          },
          diagram: {
            title: 'AMDGPU 后端 Pass 管线',
            content: `AMDGPU 后端：从 LLVM IR 到 GPU 机器码的完整 Pass 管线

LLVM IR (SSA form, target-independent)
 │
 ▼ ═══════ AMDGPU Pre-ISel Passes ═══════
 │
 ├─ AMDGPULowerIntrinsics
 │    将通用 LLVM intrinsic 降低为 AMDGPU 特定操作
 │
 ├─ AMDGPUPromoteAlloca        ★ GPU 关键优化
 │    alloca (私有栈) → LDS 或向量寄存器
 │    避免 scratch memory 的巨大延迟开销
 │
 ├─ AMDGPULowerKernelArguments
 │    kernel 参数从 kernarg segment 加载到寄存器
 │    s_load_dwordx4 s[0:3], s[4:5], 0x0
 │
 ▼ ═══════ Instruction Selection ═══════
 │
 ├─ SelectionDAG Builder
 │    LLVM IR → DAG (有向无环图)
 │    fadd float %a, %b → (fadd f32 $a, $b)
 │
 ├─ DAG Legalization
 │    确保所有操作在 AMDGPU 上合法
 │    不支持的操作被扩展为支持的序列
 │
 ├─ DAG-to-DAG ISel (SIInstrInfo.td patterns)
 │    (fadd f32 $src0, $src1) → V_ADD_F32_e32
 │    (load global addr) → GLOBAL_LOAD_DWORD
 │
 ▼ ═══════ MachineInstr Level ═══════
 │
 │  此时代码使用 AMDGPU 指令 + 虚拟寄存器：
 │  %vreg3:vgpr_32 = V_ADD_F32_e32 %vreg1, %vreg2
 │
 ├─ SIFixSGPRCopies
 │    修复 SGPR↔VGPR 非法复制
 │    (SGPR 不能直接写入 VGPR 在某些上下文中)
 │
 ├─ Register Allocation          ★ 核心阶段
 │    虚拟寄存器 → 物理寄存器 (v0-v255, s0-s105)
 │    决定 VGPR/SGPR 使用量 → 影响 Occupancy
 │
 ├─ SIInsertWaitcnts             ★ 正确性关键
 │    插入 s_waitcnt vmcnt(0) / lgkmcnt(0)
 │    确保内存操作完成后再使用结果
 │
 ├─ Post-RA Instruction Scheduling
 │    重排指令以隐藏延迟、优化吞吐
 │
 ▼ ═══════ MC Layer (Code Emission) ═══════
 │
 └─ AMDGPUMCCodeEmitter
      MachineInstr → 二进制编码
      V_ADD_F32_e32 v1, v2, v3 → 0x02020503
      输出 .text section (GPU ISA bytes)
      输出 .note section (metadata)
      → .hsaco (ELF 格式 GPU 可执行文件)`,
            caption: 'AMDGPU 后端的完整 Pass 管线。每个 Pass 都可以用 -debug-only=<pass-name> 单独查看其输出。GPU 专用 Pass（promote-alloca、insert-waitcnts 等）是 AMDGPU 后端与通用后端的核心区别。',
          },
          codeWalk: {
            title: '关键 AMDGPU 后端 Pass：从 IR 到机器指令',
            file: 'llvm/lib/Target/AMDGPU/ — key passes overview',
            language: 'c',
            code: `/* ═══ AMDGPUTargetMachine.cpp — 后端入口 ═══ */
/* 注册所有 AMDGPU 后端 Pass */
void GCNPassConfig::addPreISel() {
  /* GPU 特定的 Pre-ISel Pass */
  addPass(createAMDGPULowerIntrinsicsPass());
  addPass(createAMDGPUPromoteAllocaPass());
  /* ↑ 将 alloca 提升为 LDS 或寄存器
   * 例：float arr[4] → 4 个 VGPR
   * 例：__shared__ float smem[256] → LDS */
  addPass(createAMDGPULowerKernelArgumentsPass());
}

void GCNPassConfig::addInstSelector() {
  /* SelectionDAG 指令选择 */
  addPass(createAMDGPUISelDag(getAMDGPUTargetMachine()));
}

void GCNPassConfig::addPreRegAlloc() {
  addPass(&SIFixSGPRCopiesID);
  /* ↑ 修复 SGPR-VGPR 复制问题
   * SGPR (标量) 和 VGPR (向量) 有不同的使用规则
   * 某些操作只能用 VGPR，某些只能用 SGPR */
  addPass(&SIOptimizeExecMaskingPreRAID);
}

void GCNPassConfig::addPostRegAlloc() {
  addPass(&SIInsertWaitcntsID);
  /* ↑ 在内存操作后插入 s_waitcnt
   * global_load_b32 v1, v0, s[0:1]
   * s_waitcnt vmcnt(0)    ← 等待 load 完成
   * v_add_f32 v2, v1, v3  ← 现在可以安全使用 v1 */
}

/* ═══ SIInstructions.td — 指令选择模式（TableGen）═══ */
/* DAG pattern matching 规则示例 */

/* fadd f32 → V_ADD_F32_e32 */
// def : GCNPat<
//   (fadd f32:$src0, f32:$src1),
//   (V_ADD_F32_e32 $src0, $src1)
// >;

/* global load float → GLOBAL_LOAD_DWORD */
// def : GCNPat<
//   (f32 (load (global_addr i64:$addr))),
//   (GLOBAL_LOAD_DWORD $addr, 0, 0)
// >;

/* 这些 .td 规则由 TableGen 工具在编译期生成
 * C++ 匹配代码，ISel 运行时执行匹配 */`,
            annotations: [
              'GCNPassConfig 继承自 LLVM 的 TargetPassConfig，为 GCN/RDNA 架构定制 Pass 管线',
              'addPreISel() 中的 Pass 在指令选择之前运行——处理 GPU 特有的 IR 转换',
              'PromoteAlloca 是性能关键 Pass——将栈分配提升到寄存器/LDS 避免 scratch 内存',
              'SIFixSGPRCopies 确保标量/向量寄存器使用规则正确——AMDGPU 双寄存器文件的特殊需求',
              'SIInsertWaitcnts 是正确性关键——没有正确的 waitcnt，GPU 会使用未就绪的数据',
              '.td 文件中的 Pattern matching 规则在编译 LLVM 本身时由 TableGen 处理为 C++ 代码',
            ],
            explanation: '这段代码展示了 AMDGPU 后端的 Pass 管线组织方式。GCNPassConfig 类控制 Pass 的注册和执行顺序。关键理解：(1) GPU 后端比 CPU 后端复杂得多，因为需要处理 SGPR/VGPR 双寄存器文件、LDS 内存、wavefront 执行模型等 GPU 特有概念；(2) 很多 AMDGPU Pass（如 InsertWaitcnts）是正确性 Pass 而非优化 Pass——没有它们程序会产生错误结果。',
          },
          miniLab: {
            title: '查看 AMDGPU 后端的完整 Pass 列表',
            objective: '使用 llc 的调试选项查看 AMDGPU 后端执行了哪些 Pass，理解编译管线的复杂度。',
            setup: `# 准备一个 LLVM IR 输入文件
hipcc -S -emit-llvm -O2 --offload-arch=gfx1102 vector_add.hip -o vector_add.ll
# 或手动创建最简 IR：
cat > simple.ll << 'EOF'
define amdgpu_kernel void @k(ptr addrspace(1) %p) {
  %v = load float, ptr addrspace(1) %p
  %r = fadd float %v, 1.0
  store float %r, ptr addrspace(1) %p
  ret void
}
EOF`,
            steps: [
              '查看 Pass 列表：llc -mtriple=amdgcn-amd-amdhsa -mcpu=gfx1102 -debug-pass=Structure simple.ll -o /dev/null 2>&1 | head -80',
              '统计 Pass 数量：上述命令 | wc -l（通常超过 100 个 Pass）',
              '查看指令选择输出：llc -mtriple=amdgcn-amd-amdhsa -mcpu=gfx1102 -debug-only=isel simple.ll -o /dev/null 2>&1 | head -40',
              '查看寄存器分配：llc -mtriple=amdgcn-amd-amdhsa -mcpu=gfx1102 -debug-only=regalloc simple.ll -o /dev/null 2>&1 | head -40',
              '查看 waitcnt 插入：llc -mtriple=amdgcn-amd-amdhsa -mcpu=gfx1102 -debug-only=si-insert-waitcnts simple.ll -o /dev/null 2>&1',
              '对比最终汇编输出：llc -mtriple=amdgcn-amd-amdhsa -mcpu=gfx1102 simple.ll -o simple.s && cat simple.s',
            ],
            expectedOutput: `$ llc ... -debug-pass=Structure 2>&1 | grep -c "Pass"
120+    ← AMDGPU 后端执行超过 120 个 Pass

$ cat simple.s | grep -v "^[;.]"
  s_load_b32 s0, s[4:5], 0x0     ; load *p
  s_waitcnt lgkmcnt(0)            ; wait for load
  v_add_f32_e64 v0, s0, 1.0      ; *p + 1.0
  global_store_b32 v[0:1], v0, off ; store result
  s_endpgm                         ; end kernel`,
            hint: '如果没有安装 ROCm，可以从 LLVM 源码编译 llc 并启用 AMDGPU target：cmake -DLLVM_TARGETS_TO_BUILD="AMDGPU" ../llvm。或者使用 godbolt.org 在线选择 AMDGPU llc 查看输出。',
          },
          debugExercise: {
            title: '诊断缺失的 s_waitcnt 导致的数据竞争',
            language: 'asm',
            description: '以下 AMDGPU 汇编片段有一个正确性 Bug——缺失了必要的等待指令。',
            question: '这段代码在什么情况下会产生错误结果？需要在哪里插入什么指令？',
            buggyCode: `; 从全局内存加载两个值并相加
global_load_b32 v1, v0, s[0:1]    ; v1 = memory[addr1]
global_load_b32 v2, v0, s[2:3]    ; v2 = memory[addr2]
; BUG: 没有等待 load 完成就使用结果！
v_add_f32_e32 v3, v1, v2          ; v3 = v1 + v2  (v1, v2 可能还没准备好)
global_store_b32 v0, v3, s[4:5]   ; 写回结果
s_endpgm`,
            hint: 'AMDGPU 的 global_load 是异步操作——发出 load 请求后 GPU 继续执行后续指令，不会自动等待。需要什么指令来确保 load 完成？',
            answer: '问题：global_load_b32 是异步内存操作。在 RDNA3 上，global_load 发出后 GPU 会继续执行后续指令，load 的结果可能在数十到数百个周期后才到达寄存器。如果在 load 完成前使用 v1/v2，会读到未定义的旧值。修正：在两条 load 和 v_add 之间插入 s_waitcnt vmcnt(0)。vmcnt 是 Vector Memory Count，跟踪未完成的向量内存操作数量。vmcnt(0) 表示等待所有未完成的向量内存操作完成。正确代码：global_load_b32 v1, ...; global_load_b32 v2, ...; s_waitcnt vmcnt(0); v_add_f32_e32 v3, v1, v2; ...。在 LLVM AMDGPU 后端中，SIInsertWaitcnts Pass 负责自动插入这些等待指令。如果这个 Pass 有 Bug，就会出现这种难以调试的数据竞争问题——结果有时正确有时错误，取决于内存延迟。',
          },
          interviewQ: {
            question: '描述 LLVM AMDGPU 后端的 Pass 管线。哪些是 GPU 特有的 Pass？为什么需要它们？',
            difficulty: 'hard',
            hint: '从 ISel → RegAlloc → Scheduling → Emit 的主干线出发，提及 promote-alloca、fix-sgpr-copies、insert-waitcnts 等 GPU 特有 Pass。',
            answer: 'AMDGPU 后端 Pass 管线：(1) Pre-ISel 阶段：AMDGPULowerIntrinsics（降低通用 intrinsic）、AMDGPUPromoteAlloca（将栈分配提升到 LDS/寄存器——GPU 没有高效的栈，scratch memory 延迟是寄存器的 100 倍以上）、AMDGPULowerKernelArguments（将 kernel 参数从 kernarg segment 加载到寄存器）。(2) ISel 阶段：SelectionDAG 指令选择，通过 .td 定义的 pattern matching 将 IR 节点匹配到 AMDGPU 指令。(3) Pre-RegAlloc：SIFixSGPRCopies（修复 SGPR/VGPR 非法复制——GPU 有两个不同的寄存器文件，某些操作对寄存器类型有要求）、SIOptimizeExecMasking（优化 exec mask 操作减少控制流开销——GPU 使用 exec mask 实现分支，不是条件跳转）。(4) RegAlloc：分配 VGPR 和 SGPR，这直接决定 Occupancy。(5) Post-RegAlloc：SIInsertWaitcnts（插入内存同步指令——GPU 内存操作是异步的，必须显式等待）、Post-RA Scheduling（重排指令隐藏延迟）。(6) MC Emit：编码为二进制机器码。GPU 特有 Pass 的存在是因为 GPU 的执行模型与 CPU 根本不同：SIMD 执行（exec mask）、异步内存（waitcnt）、双寄存器文件（SGPR/VGPR）、无高效栈（scratch）。',
            amdContext: 'AMDGPU 后端的 Pass 管线是 AMD Toolchain 团队的核心工作。面试中能详细描述这个管线，并解释每个 GPU 特有 Pass 的存在理由，说明你不只是会用编译器，而是理解编译器的内部工作机制。',
          },
        },

        // ── Lesson 9.2.2 ──────────────────────────────────────
        {
          id: '9-2-2',
          number: '9.2.2',
          title: 'VGPR 与 SGPR：GPU 寄存器分配',
          titleEn: 'VGPR and SGPR: GPU Register Allocation',
          duration: 15,
          difficulty: 'expert',
          tags: ['VGPR', 'SGPR', 'register-allocation', 'occupancy', 'spilling', 'uniformity'],
          concept: {
            summary: 'AMD GPU 有两类寄存器：VGPR（Vector GPR，每线程独立）和 SGPR（Scalar GPR，整个 Wavefront 共享）。编译器通过 Uniformity Analysis 决定数据放在哪种寄存器中。VGPR 使用量直接决定 Occupancy（GPU 并发 Wavefront 数），过多的 VGPR 使用会导致寄存器 spill 到 scratch memory，严重影响性能。',
            explanation: [
              'VGPR（Vector General Purpose Register）是每个线程私有的寄存器。在 RDNA3 架构中，每个 CU（Compute Unit）有 1536 个 32 位 VGPR（以 wave32 为单位分配，实际是 1536 × 32 lanes）。VGPR 用于存储线程私有数据：线程 ID、数组索引、加载的数据值、计算中间结果等。VALU（Vector ALU）指令操作 VGPR——一条 v_add_f32 指令同时对 Wavefront 中所有 32 个线程的 VGPR 执行加法。',
              'SGPR（Scalar General Purpose Register）是整个 Wavefront 共享的寄存器。每个 CU 有 512 个 32 位 SGPR。SGPR 用于存储所有线程相同的数据（uniform data）：循环计数器、常量指针、kernel 参数、条件分支的统一条件等。SALU（Scalar ALU）指令操作 SGPR——能耗远低于 VALU。编译器将尽可能多的计算放在 SGPR/SALU 上是重要的优化。',
              'Uniformity Analysis 是编译器决定数据放 VGPR 还是 SGPR 的关键分析。如果一个值在 Wavefront 的所有线程中相同（uniform），它应该放在 SGPR 中。例如 kernel 参数、循环变量、blockDim.x 都是 uniform 的。如果一个值在不同线程中不同（divergent），它必须放在 VGPR 中。例如 threadIdx.x、a[threadIdx.x] 的加载结果都是 divergent 的。编译器的 Uniformity Analysis Pass 追踪每个值的 uniform/divergent 属性，并将结果传递给寄存器分配器。',
              'VGPR 使用量与 Occupancy（占用率）直接相关。Occupancy 是指 CU 上同时活跃的 Wavefront 数量与最大值的比率。RDNA3 每个 CU 最多同时运行 16 个 wave32。如果 kernel 使用 48 个 VGPR，那么 1536÷48=32 个 wave 可以共存，但由于上限是 16，所以 Occupancy=16/16=100%。如果使用 128 个 VGPR，则 1536÷128=12 个 wave，Occupancy=12/16=75%。如果使用 256 个 VGPR，只有 6 个 wave，Occupancy=6/16=37.5%。更低的 Occupancy 意味着更少的 Wavefront 可以隐藏内存延迟，通常导致性能下降。',
              '当 kernel 需要的寄存器超过可用量时，编译器被迫将部分寄存器值 spill（溢出）到 scratch memory。Scratch memory 是 VRAM 中为每个线程预留的栈空间，访问延迟比寄存器高 100 倍以上。Spill 的表现：编译输出中 .amdhsa_private_segment_fixed_size > 0（表示需要 scratch 空间）、汇编中出现 scratch_load/scratch_store 指令（将 VGPR 值保存到 scratch 并在需要时恢复）。寄存器压力是 GPU 编程中最重要的性能因素之一——减少 VGPR 使用（通过减少活跃变量、重组计算、使用 LDS 替代私有数组）是 GPU 性能优化的核心技巧。',
              'AMDGPU 后端的 wave size 选择由 amdgpu-waves-per-eu 属性和 target features 控制。对于 RDNA GPU（gfx10+），编译器对 pixel shader 默认使用 Wave32（更适合高发散度的小三角形），对 compute shader 默认使用 Wave64（对均匀负载有更好的吞吐）。这一选择在 AMDGPUSubtarget::getWavesPerEU() 中配置，并影响寄存器分配压力——在相同活跃 wave 数量下，Wave32 相比 Wave64 将 VGPR 文件消耗减半。游戏开发者在 RDNA 上常常强制所有 shader 使用 Wave32，而 HPC 开发者则更偏好 Wave64 以获得最大的 ALU 吞吐。',
            ],
            keyPoints: [
              'VGPR：每线程私有，RDNA3 每 CU 有 1536 个（wave32 分配单位），存储 divergent 数据',
              'SGPR：Wavefront 共享，每 CU 有 512 个，存储 uniform 数据（参数、常量、循环变量）',
              'Uniformity Analysis：编译器分析每个值是 uniform（→SGPR）还是 divergent（→VGPR）',
              'Occupancy = 并发 Wavefront 数 / 最大值；VGPR 使用量越少 → Occupancy 越高 → 延迟隐藏越好',
              'Spill：VGPR 不够时溢出到 scratch memory（VRAM），延迟增加 100 倍以上',
              '编译器输出中 .amdhsa_next_free_vgpr/sgpr 报告寄存器使用量，ScratchSize 报告 spill 大小',
              'Wave32 default for pixel shaders (less divergence waste), Wave64 for compute (more throughput)',
            ],
          },
          diagram: {
            title: 'VGPR/SGPR 与 Occupancy 的关系',
            content: `RDNA3 (gfx1102) CU 寄存器资源与 Occupancy

┌──────────────────── Compute Unit (CU) ────────────────────┐
│                                                            │
│  VGPR File: 1536 × 32-bit registers (wave32 mode)         │
│  ┌────────────────────────────────────────────────────┐    │
│  │ Wave 0: v0-v47  │ Wave 1: v0-v47  │ Wave 2: ...   │    │
│  │ (48 VGPRs)      │ (48 VGPRs)      │               │    │
│  │ ...              │ ...              │               │    │
│  │ Wave 15 (最多)                                     │    │
│  └────────────────────────────────────────────────────┘    │
│                                                            │
│  SGPR File: 512 × 32-bit registers                         │
│  ┌────────────────────────────────────────────────────┐    │
│  │ 每个 Wavefront 最多 106 个 SGPR                     │    │
│  └────────────────────────────────────────────────────┘    │
│                                                            │
└────────────────────────────────────────────────────────────┘

VGPR 使用量 vs Occupancy (RDNA3 wave32, 1536 VGPRs/CU)：

  VGPRs/wave    Max Waves    Occupancy    延迟隐藏能力
  ──────────    ─────────    ─────────    ──────────
     24            16         100.0%      ★★★★★ 极佳
     48            16         100.0%      ★★★★★ 极佳
     64            16         100.0%      ★★★★★ 极佳
     96            16         100.0%      ★★★★★ 极佳
     128           12          75.0%      ★★★★☆ 良好
     192            8          50.0%      ★★★☆☆ 中等
     256            6          37.5%      ★★☆☆☆ 较差
    >256         spill!        ——          ★☆☆☆☆ 极差

Uniform vs Divergent 值的寄存器分配：

  HIP 代码                    属性          寄存器
  ─────────                   ────          ──────
  kernel 参数 (*a, *b, n)     uniform  →    SGPR
  blockDim.x                  uniform  →    SGPR
  blockIdx.x                  uniform  →    SGPR
  threadIdx.x                 divergent →   VGPR
  a[threadIdx.x]              divergent →   VGPR
  循环计数器 (uniform loop)   uniform  →    SGPR

  SGPR 操作能耗 ≈ VGPR 操作的 1/32（标量 vs 32 路 SIMD）`,
            caption: 'VGPR 使用量直接决定 Occupancy。编译器的 Uniformity Analysis 将 uniform 值分配到 SGPR（廉价），divergent 值分配到 VGPR（昂贵）。保持低 VGPR 使用量是 GPU 性能优化的核心。',
          },
          codeWalk: {
            title: '编译器输出中的 VGPR/SGPR 分配报告',
            file: 'hipcc -S output — register allocation report',
            language: 'asm',
            code: `; ═══ vector_add kernel 的编译输出（gfx1102, -O2）═══

; --- 汇编指令部分 ---
_Z10vector_addPKfS0_Pfi:
  ; kernel 参数通过 SGPR 传入（uniform）
  s_load_b64 s[0:1], s[4:5], 0x0    ; s[0:1] = &a (SGPR: 指针是 uniform)
  s_load_b64 s[2:3], s[4:5], 0x8    ; s[2:3] = &b
  s_load_b64 s[6:7], s[4:5], 0x10   ; s[6:7] = &c
  s_load_b32 s8, s[4:5], 0x18       ; s8 = n

  ; 计算线程全局 ID（divergent → VGPR）
  v_mov_b32_e32 v1, s8               ; 暂存 n 到 VGPR (为了 v_cmp)
  v_mad_u32_u24 v0, s12, v0, s13     ; v0 = blockIdx.x * blockDim.x + threadIdx.x
  ;                ^^^       ^^^
  ;              uniform   divergent → 结果 divergent → VGPR

  ; 边界检查
  v_cmp_lt_i32_e32 vcc_lo, v0, v1   ; v0 < n ?  (逐线程比较)
  s_and_saveexec_b32 s9, vcc_lo      ; exec mask = vcc (禁用越界线程)

  ; 加载和计算（只有边界内的线程执行）
  s_waitcnt lgkmcnt(0)               ; 等待 s_load 完成
  v_lshlrev_b32_e32 v1, 2, v0       ; v1 = i * 4 (byte offset)
  global_load_b32 v2, v1, s[0:1]    ; v2 = a[i]  (VGPR: divergent)
  global_load_b32 v3, v1, s[2:3]    ; v3 = b[i]  (VGPR: divergent)
  s_waitcnt vmcnt(0)                 ; 等待 global_load 完成
  v_add_f32_e32 v2, v2, v3          ; v2 = a[i] + b[i]
  global_store_b32 v1, v2, s[6:7]   ; c[i] = v2

  s_endpgm                           ; 结束 kernel

; --- 资源使用报告 ---
; .amdhsa_next_free_vgpr 4          ← 使用 4 个 VGPR (v0-v3)
; .amdhsa_next_free_sgpr 14         ← 使用 14 个 SGPR (s0-s13)
; .amdhsa_private_segment_fixed_size 0  ← 无 spill!

; Occupancy 计算：
; VGPR: 4 → 1536/4 = 384 waves (capped at 16) → 100%
; SGPR: 14 → 512/14 = 36 waves (capped at 16) → 100%
; → 总 Occupancy = min(100%, 100%) = 100%  ★ 最优`,
            annotations: [
              's_load_b64 使用 SGPR 存储指针——kernel 参数对所有线程相同（uniform）',
              'v_mad_u32_u24 的输入混合 SGPR (s12=blockIdx) 和 VGPR (v0=threadIdx)，结果是 divergent → VGPR',
              'v_cmp_lt_i32 逐线程比较 → 设置 vcc（向量条件码），只有满足条件的线程继续执行',
              's_and_saveexec_b32 修改 exec mask 实现分支——GPU 不用条件跳转，用 mask 禁用线程',
              '只用 4 个 VGPR 和 14 个 SGPR，Occupancy=100%——simple kernel 的寄存器使用非常少',
              '.amdhsa_private_segment_fixed_size 0 表示没有 spill，所有数据在寄存器中',
            ],
            explanation: '这段编译输出展示了编译器如何将 uniform 数据放入 SGPR（指针、参数、blockIdx），将 divergent 数据放入 VGPR（threadIdx、加载的数据、计算结果）。vector_add 只使用 4 个 VGPR，远低于 Occupancy 降级的阈值。这是一个理想的 kernel——没有 spill，100% Occupancy。复杂 kernel 的 VGPR 使用可以超过 100 个，此时你需要关注 Occupancy 是否可接受。',
          },
          miniLab: {
            title: '观察 VGPR 压力对 Occupancy 的影响',
            objective: '通过编写 VGPR 使用量不同的 kernel，观察编译器报告的寄存器使用量和 Occupancy 变化。',
            steps: [
              '编写 simple kernel（vector_add）和 complex kernel（使用大量局部变量），分别编译为汇编',
              '对 simple kernel：grep "amdhsa_next_free_vgpr" simple.s，记录 VGPR 数量',
              '对 complex kernel：故意创建 30+ 个局部 float 变量的 kernel，编译并查看 VGPR 使用量',
              '计算 Occupancy：从编译器的 VGPR/SGPR 资源报告获取（.kd / ISA 元数据，或编译时加 --save-temps 查看），或用 profiler（rocprof / Omniperf），或手动计算 1536÷VGPR_count 得到每个 SIMD 的最大 wave 数',
              '编译时添加 -Rpass-analysis=regalloc 查看寄存器分配详情',
              '观察 .amdhsa_private_segment_fixed_size 是否 > 0（表示发生了 spill）',
            ],
            expectedOutput: `$ grep "amdhsa_next_free" simple.s
.amdhsa_next_free_vgpr 4     ← 简单 kernel: 4 VGPR, Occupancy=100%
.amdhsa_next_free_sgpr 14

$ grep "amdhsa_next_free" complex.s
.amdhsa_next_free_vgpr 168   ← 复杂 kernel: 168 VGPR, Occupancy=56%
.amdhsa_next_free_sgpr 42

$ grep "private_segment_fixed_size" very_complex.s
.amdhsa_private_segment_fixed_size 256  ← 发生了 spill!`,
            hint: '可以用 #pragma unroll 和大量局部变量来人为增加寄存器压力。godbolt.org (Compiler Explorer) 可以在线实验不同代码对 VGPR 使用的影响，选择 AMDGPU 后端即可。',
          },
          debugExercise: {
            title: '诊断由寄存器溢出导致的性能问题',
            language: 'c',
            description: '以下 HIP kernel 的执行速度远低于预期。编译报告显示了问题线索。',
            question: '为什么这个 kernel 这么慢？如何优化寄存器使用？',
            buggyCode: `__global__ void slow_kernel(float *data, int n) {
    int tid = threadIdx.x + blockIdx.x * blockDim.x;
    /* 大量局部变量导致高寄存器压力 */
    float t0, t1, t2, t3, t4, t5, t6, t7;
    float t8, t9, t10, t11, t12, t13, t14, t15;
    float t16, t17, t18, t19, t20, t21, t22, t23;
    float t24, t25, t26, t27, t28, t29, t30, t31;

    t0 = data[tid]; t1 = t0*1.1; t2 = t1*1.2; t3 = t2*1.3;
    t4 = t0*2.1; t5 = t1*2.2; t6 = t2*2.3; t7 = t3*2.4;
    /* ... 类似的 chain 对 t8-t31 赋值 ... */
    t31 = t0 + t1 + t2 + t3 + t4 + t5 + t6 + t7;
    /* 注意：所有 t 变量同时活跃！ */

    data[tid] = t0+t1+t2+t3+t4+t5+t6+t7+t8+t9+t10+t11
               +t12+t13+t14+t15+t16+t17+t18+t19+t20+t21
               +t22+t23+t24+t25+t26+t27+t28+t29+t30+t31;
}
/* 编译器报告：
 * .amdhsa_next_free_vgpr 196
 * .amdhsa_private_segment_fixed_size 128  ← spill!
 * Occupancy: 50% (8/16 waves)
 */`,
            hint: '问题在于所有 32 个 float 局部变量在最终求和时同时活跃（live），编译器无法复用寄存器。如何重构代码减少同时活跃的变量数？',
            answer: '问题分析：32 个 float 变量（需要至少 32 个 VGPR）在最终求和点同时活跃，加上地址计算和中间值，总 VGPR 使用量达到 196 个。private_segment_fixed_size=128 表示部分 VGPR 被 spill 到 scratch memory。Occupancy 只有 50%（8 waves），而且 spill 的 scratch 访问严重增加延迟。优化方法：(1) 累加器模式——不保留所有中间值，用一个运行的累加器：float acc = 0; acc += data[tid]*1.1; acc += prev*1.2; ... 这样每次只需 2-3 个活跃 VGPR；(2) 分组处理——将 32 个值分为 4 组，每组 8 个，先组内求和再组间求和；(3) 使用 LDS——如果多个线程协作处理相关数据，将中间结果放在 __shared__ 而非私有变量中。核心原则：减少同时活跃的变量数（live range），让编译器复用寄存器。目标是将 VGPR 控制在 96 以内以保持 100% Occupancy。',
          },
          interviewQ: {
            question: '解释 AMD GPU 中 VGPR 和 SGPR 的区别。编译器如何决定使用哪种寄存器？VGPR 使用量如何影响性能？',
            difficulty: 'medium',
            hint: '从 uniform/divergent 分析、Occupancy 计算、spill 机制三个方面回答。给出具体数字（RDNA3 每 CU 的寄存器数量）。',
            answer: 'VGPR（Vector GPR）是每个线程私有的寄存器，每个 RDNA3 CU 有 1536 个 32-bit VGPR（wave32 模式）。VGPR 存储 divergent 数据——不同线程有不同值的数据（如 threadIdx.x、加载的数据）。SGPR（Scalar GPR）是整个 Wavefront 共享的寄存器，每 CU 有 512 个。SGPR 存储 uniform 数据——所有线程相同的值（如 kernel 参数、blockDim、循环计数器）。使用 SGPR 比 VGPR 高效 32 倍（标量操作 vs 32-lane SIMD 操作）。编译器通过 Uniformity Analysis 确定每个值的属性：从 kernel 参数（uniform）和 threadIdx（divergent）出发，沿着数据流图传播——任何依赖 divergent 值的计算结果也是 divergent。VGPR 使用量直接影响 Occupancy：每个 CU 最多 16 个 wave32，使用 96 VGPR 时 1536/96=16 waves → 100%；使用 192 VGPR 时 1536/192=8 waves → 50%。低 Occupancy 减少了隐藏内存延迟的能力。如果 VGPR 超过 256 个，必须 spill 到 scratch memory（VRAM），延迟增加 100 倍以上。因此寄存器优化是 GPU 性能优化的核心。',
            amdContext: 'VGPR/SGPR 和 Occupancy 是 AMD GPU 编程的基础概念，也是面试必问题。展示你知道具体的寄存器数量（1536 VGPR/CU for RDNA3）、Occupancy 计算方法和 spill 的性能影响，证明你有实际的 GPU 性能分析经验。',
          },
        },

        // ── Lesson 9.2.3 ──────────────────────────────────────
        {
          id: '9-2-3',
          number: '9.2.3',
          title: '阅读 AMDGPU ISA 汇编',
          titleEn: 'Reading AMDGPU ISA Assembly',
          duration: 15,
          difficulty: 'expert',
          tags: ['ISA', 'RDNA3', 'VOP', 'SOP', 'SMEM', 'MUBUF', 's_waitcnt', 'exec-mask'],
          concept: {
            summary: 'RDNA3 ISA 指令分为多个格式：VOP（向量运算）、SOP（标量运算）、SMEM（标量内存）、MUBUF/GLOBAL（全局内存）、LDS（共享内存）等。理解 s_waitcnt 同步语义和 v_cmp + exec mask 的分支机制，是阅读 GPU 汇编和调试编译器输出的基础。',
            explanation: [
              'RDNA3（gfx1102）的指令集按操作类型和编码格式分为多个类别。VOP（Vector Operation）指令操作 VGPR：VOP1（单操作数，如 v_mov_b32）、VOP2（双操作数，如 v_add_f32_e32）、VOP3（三操作数 + 修饰符，如 v_fma_f32）、VOPC（比较操作，如 v_cmp_lt_f32，结果写入 vcc）。VOP 指令名称格式统一：v_<op>_<type>_e<encoding>，如 v_add_f32_e32 表示向量浮点加法、32 位编码。',
              'SOP（Scalar Operation）指令操作 SGPR：SOP1（如 s_mov_b32）、SOP2（如 s_add_u32）、SOPC（比较，如 s_cmp_lt_i32）、SOPP（程序控制，如 s_branch、s_endpgm、s_waitcnt）。标量指令在 SALU 上执行，每个周期一条。重要的标量指令包括 s_and_saveexec_b32（exec mask 操作，用于分支）、s_cbranch_execz（如果 exec=0 则跳转）、s_barrier（workgroup 同步屏障）。',
              'SMEM（Scalar Memory）指令用 SGPR 存储的地址做标量内存访问：s_load_b32/b64/b128 从内存加载到 SGPR，主要用于加载 kernel 参数和常量。SMEM 使用 lgkmcnt（LDS/GDS/Const/Msg counter）跟踪未完成的操作。GLOBAL_LOAD/GLOBAL_STORE 是全局内存访问指令，用 VGPR 做地址，结果写入 VGPR——这是 kernel 中最常见的内存操作。全局内存操作使用 vmcnt（Vector Memory counter）跟踪。',
              's_waitcnt 是 AMDGPU ISA 中最重要的同步指令。GPU 的内存操作是异步的——发出 load 后不会自动等待结果。s_waitcnt vmcnt(N) 等待直到未完成的向量内存操作数量 ≤ N（vmcnt(0) = 等待全部完成）。s_waitcnt lgkmcnt(N) 等待标量内存操作。s_waitcnt expcnt(N) 等待 export/GDS 操作。编译器的 SIInsertWaitcnts Pass 负责在正确位置插入 waitcnt。错误的 waitcnt 会导致使用未就绪数据（功能错误）或过度等待（性能问题）。',
              'GPU 的分支机制与 CPU 完全不同。CPU 使用条件跳转（if-else）；GPU 使用 exec mask 做谓词执行（predication）。流程：(1) v_cmp_lt_i32 vcc, v0, v1 逐线程比较，结果存入 vcc（向量条件码，32 位 bitmask）；(2) s_and_saveexec_b32 s0, vcc 保存旧 exec mask 到 s0，新 exec = exec & vcc（只有满足条件的线程继续）；(3) 执行 then 分支的指令（只有 exec=1 的线程生效）；(4) s_xor_b32 exec, exec, s0 翻转 mask 执行 else 分支；(5) s_or_b32 exec, exec, s0 恢复原始 mask。如果 Wavefront 中所有线程走同一路径（uniform branch），exec 不变，无额外开销。',
              's_endpgm 是 kernel 的结束指令——告诉硬件这个 Wavefront 执行完毕，释放其占用的寄存器和资源。每个 kernel 的最后一条指令必须是 s_endpgm。',
            ],
            keyPoints: [
              'VOP 指令（v_）操作 VGPR：VOP1（单操作数）、VOP2（双操作数）、VOP3（三操作数+修饰符）、VOPC（比较→vcc）',
              'SOP 指令（s_）操作 SGPR：SOP1/SOP2（算术）、SOPP（控制流/s_waitcnt/s_endpgm/s_barrier）',
              'SMEM（s_load_*）：标量内存加载→SGPR，用 lgkmcnt 跟踪；GLOBAL_LOAD：全局内存→VGPR，用 vmcnt 跟踪',
              's_waitcnt vmcnt(N)/lgkmcnt(N)：等待异步内存操作完成，N=0 表示全部等待',
              'exec mask 分支：v_cmp→vcc + s_and_saveexec→exec mask + 执行 then/else + 恢复 exec',
              's_endpgm：kernel 结束，释放 Wavefront 资源（寄存器、调度槽位）',
            ],
          },
          diagram: {
            title: 'RDNA3 ISA 指令格式分类',
            content: `RDNA3 (gfx1102) ISA 指令格式总览

┌──────────────────────────────────────────────────────────────┐
│  Vector Instructions (v_*) — 操作 VGPR, 在 VALU 上执行       │
│                                                               │
│  VOP1    v_<op>_e32 dst, src0        单操作数                 │
│          v_mov_b32_e32 v0, v1        复制                     │
│          v_cvt_f32_i32_e32 v0, v1    类型转换                 │
│                                                               │
│  VOP2    v_<op>_e32 dst, src0, src1  双操作数                 │
│          v_add_f32_e32 v0, v1, v2    浮点加                   │
│          v_mul_f32_e32 v0, v1, v2    浮点乘                   │
│                                                               │
│  VOP3    v_<op>_e64 dst, src0, src1, src2  三操作数+修饰符   │
│          v_fma_f32 v0, v1, v2, v3    融合乘加 (FMA)          │
│          v_add_f32_e64 v0, |v1|, -v2 支持 abs/neg 修饰符    │
│                                                               │
│  VOPC    v_cmp_<cc>_<type> vcc, src0, src1  比较→vcc         │
│          v_cmp_lt_f32_e32 vcc_lo, v0, v1  逐线程比较         │
│                                                               │
│  VINTERP v_interp_p1/p2_f32         像素插值（图形）         │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│  Scalar Instructions (s_*) — 操作 SGPR, 在 SALU 上执行       │
│                                                               │
│  SOP1    s_mov_b32 s0, s1            标量复制                 │
│  SOP2    s_add_u32 s0, s1, s2        标量加法                 │
│  SOPP    s_waitcnt vmcnt(0)          等待内存操作             │
│          s_barrier                   workgroup 同步           │
│          s_branch <label>            无条件跳转               │
│          s_cbranch_execz <label>     exec=0 时跳转            │
│          s_endpgm                    kernel 结束              │
│  SOPK    s_movk_i32 s0, 0x100       16-bit 立即数            │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│  Memory Instructions — 全局/标量/本地内存访问                 │
│                                                               │
│  SMEM    s_load_b32 s0, s[2:3], off  标量内存加载→SGPR       │
│          s_load_b128 s[0:3], ...     加载 128-bit (4 dword)  │
│          → 使用 lgkmcnt 跟踪                                 │
│                                                               │
│  GLOBAL  global_load_b32 v0, v1, s[0:1]   全局加载→VGPR     │
│          global_store_b32 v0, v1, s[0:1]  全局存储            │
│          → 使用 vmcnt 跟踪                                   │
│                                                               │
│  LDS     ds_read_b32 v0, v1          LDS 读取                │
│          ds_write_b32 v0, v1         LDS 写入                │
│          → 使用 lgkmcnt 跟踪                                 │
│                                                               │
│  SCRATCH scratch_load_b32 v0, off    scratch (spill) 读取    │
│          scratch_store_b32 off, v0   scratch (spill) 写入    │
└──────────────────────────────────────────────────────────────┘

s_waitcnt 同步语义：
  vmcnt   — 跟踪 global_load/store（向量内存）
  lgkmcnt — 跟踪 s_load/ds_read/ds_write（标量内存/LDS）
  expcnt  — 跟踪 export/GDS`,
            caption: 'RDNA3 ISA 指令按执行单元和功能分类。v_ 前缀是向量指令（VALU），s_ 前缀是标量指令（SALU），global_/ds_/scratch_ 是内存指令。理解这些分类是阅读 GPU 汇编的基础。',
          },
          codeWalk: {
            title: '标注的 vector_add ISA 汇编（gfx1102 RDNA3）',
            file: 'vector_add.s — hipcc -S -O2 --offload-arch=gfx1102 output',
            language: 'asm',
            code: `; ═══ vector_add kernel: c[i] = a[i] + b[i] ═══
; Target: gfx1102 (RDNA3, Navi33, RX 7600 XT)

        .text
        .globl  _Z10vector_addPKfS0_Pfi
        .p2align 8                          ; 256-byte 对齐 (硬件要求)
_Z10vector_addPKfS0_Pfi:

; ── Kernel Prolog: 加载参数和计算线程 ID ──

        ; SGPR 初始状态 (硬件填充):
        ;   s[4:5] = kernarg_segment 基地址 (指向 kernel 参数)
        ;   s12 = workgroup_id_x (= blockIdx.x)

        ; 加载 kernel 参数: *a, *b, *c, n (从 kernarg segment)
        s_load_b64  s[0:1], s[4:5], 0x0    ; s[0:1] = a  (64-bit ptr)
        s_load_b64  s[2:3], s[4:5], 0x8    ; s[2:3] = b
        s_load_b64  s[6:7], s[4:5], 0x10   ; s[6:7] = c
        s_load_b32  s8, s[4:5], 0x18       ; s8 = n
        ;           ↑ SMEM 指令，异步执行，使用 lgkmcnt 跟踪

        ; 计算 i = blockIdx.x * blockDim.x + threadIdx.x
        ; v0 = threadIdx.x (硬件填充，每线程不同 → VGPR)
        ; s12 = blockIdx.x (硬件填充，整个 workgroup 相同 → SGPR)
        s_lshl_b32  s9, s12, 8             ; s9 = blockIdx.x << 8
        ;           假设 blockDim.x=256, 即 blockIdx.x * 256
        v_add_nc_u32 v0, s9, v0            ; v0 = s9 + threadIdx.x = 全局 i
        ;            ↑ VGPR + SGPR 混合操作，结果放 VGPR (divergent)

; ── 边界检查: if (i < n) ──

        s_waitcnt   lgkmcnt(0)             ; 等待 s_load 全部完成
        ;           ↑ 必须等 s8(n) 加载完才能比较
        v_cmp_lt_i32_e32 vcc_lo, v0, s8    ; 逐线程: v0 < n ?
        ;                ↑ 每个线程独立比较，结果汇聚到 vcc (32-bit mask)
        s_and_saveexec_b32 s9, vcc_lo      ; 保存旧 exec→s9
        ;                                    新 exec = exec & vcc
        ;                                    越界线程被禁用 (mask=0)
        s_cbranch_execz .Lexit             ; 如果所有线程都越界→跳到结束

; ── 核心计算: c[i] = a[i] + b[i] ──

        ; 计算字节偏移: byte_offset = i * 4
        v_lshlrev_b32_e32 v3, 2, v0       ; v3 = v0 << 2 = i * 4

        ; 加载 a[i] 和 b[i]
        global_load_b32 v1, v3, s[0:1]    ; v1 = *(a + byte_offset)
        global_load_b32 v2, v3, s[2:3]    ; v2 = *(b + byte_offset)
        ;               ↑ 异步全局内存读取，使用 vmcnt 跟踪

        ; 等待两个 load 完成
        s_waitcnt   vmcnt(0)               ; vmcnt=0: 等待所有 global_load
        ;           ↑ 没有这条指令，v1/v2 可能是垃圾值！

        ; 浮点加法
        v_add_f32_e32 v1, v1, v2           ; v1 = a[i] + b[i]
        ;             ↑ VALU 指令，32 个线程同时执行

        ; 存储 c[i]
        global_store_b32 v3, v1, s[6:7]   ; *(c + byte_offset) = v1

.Lexit:
        s_endpgm                            ; kernel 结束，释放 wave 资源

; ── 元数据 ──
.amdhsa_kernel _Z10vector_addPKfS0_Pfi
  .amdhsa_next_free_vgpr 4                 ; 使用 4 个 VGPR (v0-v3)
  .amdhsa_next_free_sgpr 14                ; 使用 14 个 SGPR
  .amdhsa_private_segment_fixed_size 0     ; 无 scratch/spill
  .amdhsa_group_segment_fixed_size 0       ; 无 LDS 使用
  .amdhsa_float_denorm_mode_32 3           ; FP32 denorm 启用
  .amdhsa_wavefront_size32 1               ; wave32 模式
.end_amdhsa_kernel`,
            annotations: [
              's_load_b64 从 kernarg segment 加载参数——所有参数对所有线程相同，放在 SGPR 中',
              'v0 在 kernel 入口由硬件自动填充为 threadIdx.x——每个线程不同，天然在 VGPR 中',
              's_waitcnt lgkmcnt(0) 等待 s_load 完成；s_waitcnt vmcnt(0) 等待 global_load 完成——两种不同的计数器',
              'v_cmp → vcc → s_and_saveexec 是 GPU 实现 if 分支的标准模式（exec mask predication）',
              's_cbranch_execz 优化：如果整个 wave 都越界，直接跳到结束，不执行 load/compute',
              '.amdhsa_kernel 元数据段告诉运行时如何分配资源——VGPR/SGPR 数量决定 Occupancy',
            ],
            explanation: '这段标注汇编是 vector_add 在 gfx1102 上的完整编译输出。每条指令都有明确的目的：s_load 加载参数、v_cmp+exec mask 做边界检查、global_load 取数据、v_add_f32 做计算、global_store 写结果、s_endpgm 结束。关键同步点是两个 s_waitcnt——分别等待标量和向量内存操作。读懂这样的汇编是做 GPU 性能优化和编译器调试的核心技能。',
          },
          miniLab: {
            title: '手动标注 AMDGPU ISA 汇编',
            objective: '编译一个稍复杂的 kernel，独立阅读并标注每条汇编指令的功能，验证你对 ISA 的理解。',
            steps: [
              '编写一个包含条件分支和乘法的 kernel：if (i < n) c[i] = a[i] * b[i] + a[i]',
              '编译为汇编：hipcc -S -O2 --offload-arch=gfx1102 kernel.hip -o kernel.s',
              '在 kernel.s 中找到 kernel 函数，逐行标注每条指令的功能',
              '标记所有 s_waitcnt 指令，解释为什么需要在那个位置等待',
              '找到 exec mask 操作（s_and_saveexec、s_cbranch_execz 等），画出控制流图',
              '记录 VGPR/SGPR 使用报告，计算理论 Occupancy',
            ],
            expectedOutput: `标注示例：
  s_load_b64 s[0:1], s[4:5], 0x0   ; [SMEM] 加载 kernel arg: ptr a
  s_waitcnt lgkmcnt(0)              ; [SYNC] 等待所有 scalar loads
  v_cmp_lt_i32 vcc_lo, v0, s8      ; [VOPC] 边界检查: tid < n?
  v_fma_f32 v1, v2, v3, v2         ; [VOP3] fused multiply-add: a*b+a

VGPR: 5, SGPR: 16 → Occupancy: 100%`,
            hint: '查阅 AMD "RDNA3 Instruction Set Architecture" 官方文档（在 GPUOpen 网站可下载）获取每条指令的精确语义。搜索 "RDNA3 ISA Reference Guide" 即可找到。',
          },
          debugExercise: {
            title: '找出 ISA 汇编中的 exec mask 错误',
            language: 'asm',
            description: '以下汇编实现了一个 if-else 分支，但 exec mask 操作有错误，导致 else 分支的线程没有正确执行。',
            question: '哪条 exec mask 操作是错误的？正确的应该是什么？',
            buggyCode: `; if (v0 < v1) { v2 = 1.0; } else { v2 = 0.0; }
v_cmp_lt_f32_e32 vcc_lo, v0, v1     ; 比较 v0 < v1 → vcc
s_and_saveexec_b32 s0, vcc_lo       ; exec = exec & vcc (then branch)
                                     ; s0 = 旧 exec (保存)
; ── then branch: 满足条件的线程 ──
v_mov_b32_e32 v2, 1.0               ; v2 = 1.0

; ── else branch: 不满足条件的线程 ──
s_or_b32 exec_lo, exec_lo, s0       ; BUG! 这里应该翻转 mask
v_mov_b32_e32 v2, 0.0               ; v2 = 0.0  (但所有线程都执行了!)

; ── 恢复 exec ──
s_or_b32 exec_lo, exec_lo, s0       ; 恢复完整 exec`,
            hint: '进入 else 分支前，需要将 exec mask 翻转为 "then 没有执行的线程"。s_or_b32 是合并操作，不是翻转。应该用什么操作？',
            answer: 'BUG：else 分支入口应该用 s_xor_b32 exec_lo, exec_lo, s0 而不是 s_or_b32。s_or_b32 将 s0（旧的完整 exec）与当前 exec OR，结果是所有线程都启用——这导致 then 和 else 的代码都被所有线程执行。正确的模式：(1) s_and_saveexec_b32 s0, vcc → then 线程执行，s0=原始 exec；(2) 执行 then 分支；(3) s_xor_b32 exec_lo, exec_lo, s0 → exec = 原始exec XOR 当前exec = else 线程；(4) 执行 else 分支；(5) s_or_b32 exec_lo, exec_lo, s0 → 恢复原始 exec（合并 then 和 else 线程）。XOR 操作将 mask 翻转为"then 中没有执行的线程"，这正是 else 分支需要的线程集合。这是 AMDGPU 实现 if-else 的标准 exec mask 协议。',
          },
          interviewQ: {
            question: '解释 AMDGPU ISA 中 s_waitcnt 指令的作用。vmcnt 和 lgkmcnt 分别跟踪什么？如果省略 s_waitcnt 会发生什么？',
            difficulty: 'hard',
            hint: '从 GPU 内存操作的异步特性出发。解释两种计数器跟踪的操作类型，以及省略 waitcnt 的功能性和性能影响。',
            answer: 's_waitcnt 是 AMDGPU 的内存同步指令，确保异步内存操作在使用结果前完成。GPU 的内存操作是异步的——发出 load 请求后 GPU 继续执行后续指令，不会自动等待结果。vmcnt（Vector Memory Count）跟踪未完成的向量内存操作（global_load、global_store、buffer_load 等），这些操作访问 VRAM 或系统内存。lgkmcnt（LDS/GDS/Const/Msg Count）跟踪未完成的标量内存操作（s_load）和 LDS 操作（ds_read/ds_write）。s_waitcnt vmcnt(N) 等待直到未完成的向量内存操作数 ≤ N；vmcnt(0) 等全部完成。s_waitcnt lgkmcnt(0) 等全部标量/LDS 操作完成。省略 s_waitcnt 的后果：(1) 功能错误——使用未就绪的寄存器值，得到随机旧数据；(2) 难以调试——错误是非确定性的，取决于内存延迟（有时正确有时错误）；(3) 可能间歇性正确——如果恰好其他指令提供了足够延迟让 load 完成。性能优化角度：精确的 waitcnt 比 waitcnt(0) 好——例如连续两个 load 后只需等第一个结果，可以用 vmcnt(1) 而非 vmcnt(0)，让第二个 load 继续传输。LLVM 的 SIInsertWaitcnts Pass 负责插入最优的 waitcnt 值。',
            amdContext: 's_waitcnt 是 AMDGPU 硬件工程师和编译器工程师都必须深刻理解的机制。面试中能解释 vmcnt 和 lgkmcnt 的区别、精确 waitcnt 的性能影响，说明你理解 GPU 异步内存模型的深层机制。',
          },
        },
      ],
    },
  ],
  completionChecklist: [
    '理解 LLVM 三段式架构（前端→中端→后端）和 LLVM IR 作为通用中间表示的核心设计',
    '能使用 hipcc 生成 LLVM IR (.ll) 和 AMDGPU 汇编 (.s)，理解每一步的编译流程',
    '掌握 SSA 形式和 phi 节点的概念，能阅读和分析 LLVM IR 代码',
    '了解 AMDGPU 后端的 Pass 管线：ISel → RegAlloc → Scheduling → MC Emit',
    '理解 VGPR/SGPR 的区别、Uniformity Analysis、以及 VGPR 使用量对 Occupancy 的影响',
    '能阅读 RDNA3 ISA 汇编：VOP/SOP/SMEM/GLOBAL 指令格式、s_waitcnt 同步、exec mask 分支',
    '能够把一次 HIP 源码修改与 LLVM IR、最终 ISA 的变化对应起来，并解释其性能后果',
  ],
};
