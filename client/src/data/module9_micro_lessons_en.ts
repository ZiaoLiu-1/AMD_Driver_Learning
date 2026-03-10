// ============================================================
// AMD Linux Driver Learning Platform - Module 9 Micro-Lessons (English)
// Module 9: GPU Toolchain & LLVM (GPU toolchainand LLVM)
// 5 lessons in 2 groups, ~15 min each, total ~75 min
// ============================================================
import type { MicroLessonModule } from './micro_lesson_types';

export const module9MicroLessonsEn: MicroLessonModule = {
  moduleId: 'llvm',
  groups: [
    // ════════════════════════════════════════════════════════════
    // Group 9.1: LLVM compilerframework
    // ════════════════════════════════════════════════════════════
    {
      id: '9-1',
      number: '9.1',
      title: 'LLVM compilerframework',
      titleEn: 'LLVM Compiler Framework',
      icon: '🏗️',
      description: 'understand LLVM 三段式architecture — frontend, in端optimization, backend — and LLVM IR 作asgeneralintermediate representationcoredesign思想. master SSA 形式and IR 语法isread GPU compileroutputbasics. ',
      lessons: [
        // ── Lesson 9.1.1 ──────────────────────────────────────
        {
          id: '9-1-1',
          number: '9.1.1',
          title: 'LLVM 三段式architecture: frontend→in端→backend',
          titleEn: 'LLVM Three-Phase Architecture: Frontend → Optimizer → Backend',
          duration: 15,
          difficulty: 'advanced',
          tags: ['LLVM', 'compiler', 'Clang', 'HIP', 'pass-pipeline'],
          concept: {
            summary: 'LLVM 采用经典三段式compilerarchitecture: frontend(Frontend)willdifferent语言翻译as统一 LLVM IR; in端(Middle-end)对 IR execute数百个optimization Pass; backend(Backend)willoptimizationafter IR compilationasgoal平台机器码. AMDGPU backendis LLVM in最complexbackend之一, responsible forwill LLVM IR compilationas GCN/RDNA ISA. ',
            explanation: [
              '传统compiler(如早期 GCC)thefrontendparse, optimizationandcodegenerate紧密耦合in一起. if你想support M 种语言and N 种goal平台, 理论onneed M×N 个compiler. LLVM core创新in于引入一layergeneralintermediate representation — LLVM IR. frontend只需will源语言翻译as LLVM IR(M 个frontend), backend只需will LLVM IR 翻译asgoal机器码(N 个backend), alloptimizationallin LLVM IR layer面进行并byshared. 这will M×N issue降低as M+N. ',
              '对 AMD GPU compilation说, frontendis Clang. HIP code(__global__ void kernel(...))firstby Clang parseas AST(abstraction语法树), then Clang CodeGen will AST 降低as LLVM IR. Clang need识别 GPU 特has语义 — e.g. __global__ property变as amdgpu_kernel call约定, threadIdx.x 变as对内置function llvm.amdgcn.workitem.id.x call. OpenCL compilationpathsimilar, 只isfrontend语法handledifferent. ',
              'in端is LLVM  Pass Manager, 它按orderexecute数百个 Pass 对 IR 进行optimization. general Pass include mem2reg(willmemoryinvariable提升as SSA register), instcombine(代数化简), loop-unroll(循环展开), inline(function内联)等. furthermorestillhas AMDGPU 专用 Pass, 如 amdgpu-promote-alloca(willstackallocation提升to LDS orregister), amdgpu-lower-kernel-arguments(降低kernelparameterpass). these Pass executeorder由 PassBuilder control, errorordermaycauseoptimizationinvalidate甚至generateerrorcode. ',
              'backendis AMDGPU Target, 它willoptimizationafter LLVM IR compilationas AMDGPU ISA 机器码. backendprocess: SelectionDAG(will IR convertas DAG 并做instruction selection)→ MachineInstr(机器instructionrepresent)→ Register Allocation(register allocation)→ Instruction Scheduling(instruction scheduling)→ MC Layer(编码as二进制机器码). finaloutput .hsaco file(ELF format GPU canexecutefile), contain GPU 机器码, 元dataandresourceuseinformation. ',
              'hipcc is HIP compilationtoolchainentry point. execute hipcc vector_add.hip 时, actual发生stepis: (1) hipcc call Clang frontendcompilationdevicecode, target triple 设as amdgcn-amd-amdhsa; (2) Clang generate LLVM IR, 带has amdgpu_kernel 标注; (3) LLVM in端executeoptimization Pass 序列; (4) AMDGPU backendwill IR compilationasgoal GPU(如 gfx1102 corresponding RX 7600 XT, gfx1100 corresponding RX 7900 XTX, gfx1030 corresponding RX 6800 XT)机器码; (5) Clang frontendmeanwhilecompilationhostcode(target triple as x86_64); (6) clang-offload-bundler willdevicecodeandhostcode打包as fat binary. understandthiscompleteprocessisdebuggingcompilerissueand做performanceoptimizationbasics. ',
            ],
            keyPoints: [
              'LLVM 三段式: frontend(Clang)→ in端(Pass Manager)→ backend(AMDGPU Target), through LLVM IR 解耦',
              'frontendresponsible for语言specificparse: HIP __global__ → amdgpu_kernel, threadIdx.x → llvm.amdgcn.workitem.id.x',
              'in端execute数百个optimization Pass: general(mem2reg/inline/loop-unroll)+ AMDGPU 专用(promote-alloca)',
              'backendprocess: SelectionDAG → MachineInstr → RegAlloc → Scheduling → MC emit',
              'hipcc complete链: HIP → Clang → LLVM IR → AMDGPU backend → .hsaco(ELF GPU binary)',
              'M+N design: M 种语言frontend + N 种backendshared同一套 IR andoptimization, 消除 M×N issue',
            ],
          },
          diagram: {
            title: 'hipcc compilationprocess: from HIP source codeto GPU canexecutefile',
            content: `hipcc compilationprocess全景图

 HIP source code (vector_add.hip)
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
   devicecodecompilation      hostcodecompilation             │
   target:           target:                 │
   amdgcn-amd-       x86_64-linux-           │
   amdhsa            gnu                     │
          │               │                  │
          ▼               │                  │
   ┌─────────────┐        │                  │
   │ Clang frontend   │        │                  │
   │ AST → IR     │        │                  │
   │ __global__ → │        │                  │
   │ amdgpu_kernel│        │                  │
   └──────┬──────┘        │                  │
          ▼               │                  │
   ┌─────────────┐        │                  │
   │ LLVM in端    │        │                  │
   │ optimization Passes  │        │                  │
   │ mem2reg      │        │                  │
   │ instcombine  │        │                  │
   │ loop-unroll  │        │                  │
   │ promote-     │        │                  │
   │   alloca     │        │                  │
   └──────┬──────┘        │                  │
          ▼               │                  │
   ┌─────────────┐        │                  │
   │ AMDGPU backend  │        │                  │
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

view每一步output: 
  hipcc -E  vector_add.hip   → 预handle
  hipcc -S -emit-llvm ...    → LLVM IR (.ll)
  hipcc -S  ...              → AMDGPU 汇编 (.s)
  hipcc     vector_add.hip   → fat binary`,
            caption: 'hipcc will HIP source codemeanwhilecompilationasdevicecode(AMDGPU ISA)andhostcode(x86), finalthrough offload-bundler 打包as fat binary. entireprocess对user透明, 但understand每一步fordebuggingcompilerissue至关important. ',
          },
          codeWalk: {
            title: 'hipcc compilationpipeline: from HIP to LLVM IR to AMDGPU ISA',
            file: 'terminal — hipcc compilation pipeline',
            language: 'bash',
            code: `# ── Step 1: writea最simple HIP kernel ──
cat > vector_add.hip << 'EOF'
#include <hip/hip_runtime.h>

__global__ void vector_add(const float *a,
                           const float *b,
                           float *c, int n) {
    int i = blockIdx.x * blockDim.x + threadIdx.x;
    if (i < n) c[i] = a[i] + b[i];
}
EOF

# ── Step 2: view hipcc actualcall Clang command ──
hipcc -v vector_add.hip -c 2>&1 | grep "clang.*amdgcn"
# outputsimilar: 
# "/opt/rocm/llvm/bin/clang" -cc1 -triple amdgcn-amd-amdhsa
#   -target-cpu gfx1102 -emit-llvm-bc ...

# ── Step 3: generate LLVM IR(人类can读 .ll format)──
hipcc -S -emit-llvm --offload-arch=gfx1102 \\
      vector_add.hip -o vector_add.ll
# viewkey部分: 
grep -A 5 "define amdgpu_kernel" vector_add.ll
# define amdgpu_kernel void @_Z10vector_addPKfS0_Pfi(
#   ptr addrspace(1) %a,       ← addrspace(1) = global memory
#   ptr addrspace(1) %b,
#   ptr addrspace(1) %c,
#   i32 %n) #0 {

# ── Step 4: generate AMDGPU 汇编(.s format)──
hipcc -S --offload-arch=gfx1102 \\
      vector_add.hip -o vector_add.s
# view ISA instruction: 
grep -E "v_add|s_load|global_load|s_waitcnt" vector_add.s
# global_load_b32 v1, v0, s[4:5]   ← fromglobal memoryloading a[i]
# global_load_b32 v2, v0, s[6:7]   ← fromglobal memoryloading b[i]
# v_add_f32_e32 v1, v1, v2         ← VALU: v1 = a[i] + b[i]
# global_store_b32 v0, v1, s[8:9]  ← 写回 c[i]

# ── Step 5: viewcompilerusehow muchregister ──
grep -E "NumSgprs|NumVgprs|ScratchSize" vector_add.s
# .amdhsa_next_free_vgpr 3    ← use 3 个 VGPR
# .amdhsa_next_free_sgpr 16   ← use 16 个 SGPR
# .amdhsa_private_segment_fixed_size 0  ← 无stackoverflow`,
            annotations: [
              'hipcc -v displayactual clang command行, -triple amdgcn-amd-amdhsa 指定 GPU goal',
              '-target-cpu gfx1102 corresponding RX 7600 XT (RDNA3 Navi33); other GPU usecorresponding gfx version号(canthrough rocminfo view)',
              'LLVM IR in amdgpu_kernel call约定告诉backend这is GPU kernel entry point',
              'addrspace(1) is AMDGPU global memoryaddress space编号, 0=private, 3=LDS, 4=constant',
              'v_add_f32_e32 is RDNA3 向量浮点加法instruction, _e32 represent 32 位编码format',
              'NumVgprs/NumSgprs iscompilerregisterusereport, directlyimpact GPU occupancy(Occupancy)',
            ],
            explanation: 'thiscompletecompilationpipelinedemonstrate hipcc howwill HIP source code逐步降低as GPU 机器码. keyobserve: asimple c[i]=a[i]+b[i] operate, in LLVM IR layer面is load→load→fadd→store  SSA instruction序列, in ISA layer面变成 global_load→global_load→v_add_f32→global_store. understand这种correspondingrelationshipisperformanceoptimizationbasics — 你can看tocompiler做what, 没做what. ',
          },
          miniLab: {
            title: 'tracing HIP programcompletecompilationprocess',
            objective: '动手execute hipcc 每acompilationstage, observe HIP codehow逐步变as GPU 机器码. ',
            setup: `# ensurealreadyinstall ROCm and hipcc
which hipcc || echo "请先install ROCm: https://rocm.docs.amd.com"
hipcc --version`,
            steps: [
              'write vector_add.hip(on述 Code Walk incode), savetoworkdirectory',
              'generate预handleaftercode: hipcc -E vector_add.hip -o vector_add.i, 搜索 vector_add function看 HIP macroby展开after样子',
              'generate LLVM IR: hipcc -S -emit-llvm --offload-arch=gfx1102 vector_add.hip -o vector_add.ll, read define amdgpu_kernel 开头function',
              'generateoptimizationafter IR: hipcc -S -emit-llvm -O3 --offload-arch=gfx1102 vector_add.hip -o vector_add_opt.ll, compare -O0 and -O3  IR 差异',
              'generate AMDGPU 汇编: hipcc -S -O3 --offload-arch=gfx1102 vector_add.hip -o vector_add.s, statisticsuse VGPR/SGPR count',
              'compilationascanexecutefile: hipcc vector_add.hip -o vector_add --offload-arch=gfx1102, 用 llvm-objdump --disassemble-all vector_add view嵌入 GPU code',
            ],
            expectedOutput: `$ wc -l vector_add.ll vector_add_opt.ll vector_add.s
  45 vector_add.ll       ← not yetoptimization IR(约 45 行)
  28 vector_add_opt.ll   ← optimizationafter IR 更短(optimization器消除冗余instruction)
  85 vector_add.s        ← AMDGPU 汇编(含元dataandinstruction)

$ grep "amdhsa_next_free" vector_add.s
.amdhsa_next_free_vgpr 3
.amdhsa_next_free_sgpr 16`,
            hint: 'ifno AMD GPU, can用 --offload-arch=gfx900 (Vega) or gfx1030 (RDNA2) 交叉compilation. compilationnotneedphysical GPU, onlyrunonly thenneed. alsocanuse godbolt.org (Compiler Explorer) in线view AMDGPU compilationoutput. ',
          },
          debugExercise: {
            title: 'diagnose hipcc compilationerror',
            language: 'c',
            description: 'below HIP codecompilation时出错. finderrorcause并fix. ',
            question: 'thiscodein hipcc compilation时whywillfailure? error自compilationpipeline哪个stage? ',
            buggyCode: `#include <hip/hip_runtime.h>

__global__ void broken_kernel(float *out, int n) {
    int tid = threadIdx.x;
    /* tryin GPU kernel inuse printf 打印allthread值 */
    float local_array[1024];  /* BUG: 巨大stackallocation */
    for (int i = 0; i < 1024; i++)
        local_array[i] = tid * i;
    float sum = 0;
    for (int i = 0; i < 1024; i++)
        sum += local_array[i];
    out[tid] = sum;
}

/* compilationreport: 
 * warning: register pressure too high;
 * NumVgprs: 258 (exceeds 256 limit)
 * ScratchSize: 4096  ← spill to scratch memory
 */`,
            hint: 'each CU  VGPR 总数has限, ifeach Wavefront use太多 VGPR, GPU 只canmeanwhilerun很少 Wavefront(低 Occupancy). 1024 个 float stackallocation对 GPU 说意味着what? ',
            answer: 'issue: in GPU kernel inallocation 1024 个 float local数组(4KB), 远超单个threadavailableregister空between. AMDGPU each CU has 256 个 VGPR(RDNA3), each VGPR is 32 位. 1024 个 float need 1024 个 VGPR, 远超on限. compilerby迫will大部分data spill to scratch memory(GPU stackmemory, 位于 VRAM), cause: (1) ScratchSize 非零, represent发生registeroverflow; (2) performance急剧below降 — scratch accesslatencyisregister 100 倍above; (3) Occupancy 降至最低, because scratch buffer also占用resource. thisissuein LLVM AMDGPU backend register allocation stage暴露. fixmethod: 用 __shared__(LDS)替代大数组, or用循环分blockhandleavoidonce性allocation大数组. in GPU programmingin, 私has数组应尽量小(<16 元素)以ensurecompilercanwill其completely放入register. ',
          },
          interviewQ: {
            question: 'describe LLVM 三段式architectureand其coredesign理念. why AMD GPU compilerselectbased on LLVM? ',
            difficulty: 'medium',
            hint: 'from M×N issue, IR 作asgeneralintermediate representation, Pass 复用角度answer. 对 AMD 说, LLVM 生态system优势iswhat? ',
            answer: 'LLVM 三段式architecturewillcompiler分asfrontend, in端andbackend, through统一 LLVM IR(Intermediate Representation)解耦. frontendwilldifferent语言(C/C++/HIP/OpenCL/GLSL)compilationas LLVM IR, in端in IR onexecute数百个optimization Pass(generaloptimization如 inline/GVN/LICM + goalspecificoptimization如 amdgpu-promote-alloca), backendwilloptimizationafter IR 降低asgoal机器码. 这种designwill M 种语言 × N 种backend M×N issue降as M+N. AMD select LLVM cause: (1) 成熟optimizationframework — 数百个经过verifyoptimization Pass candirectly复用, AMD 只需development AMDGPU-specific backendand少量specific Pass; (2) 多语言support — 同a AMDGPU backendmeanwhile服务于 HIP, OpenCL, Vulkan SPIR-V, ROCm 等多种frontend; (3) 社区and生态 — LLVM 社区active, AMD Toolchain teamengineer(如 Matt Arsenault, Jay Foad)is LLVM corecontributor, code审核and维护成本由社区分担; (4) and ROCm 生态coherence — ROCm 全stackbased on LLVM/Clang, fromcompilertodebugging器(LLDB)toanalyze器(rocprof)allin同aframeworkbelow. ',
            amdContext: 'AMD Markham  Toolchain teamis LLVM AMDGPU backendcoremaintainer. interview时demonstrate你understand LLVM architectureand AMDGPU backenddesign, and AMD select LLVM 战略意义, willdisplay出你对thisteamwork深刻understand. ',
          },
        },

        // ── Lesson 9.1.2 ──────────────────────────────────────
        {
          id: '9-1-2',
          number: '9.1.2',
          title: 'LLVM IR and SSA 形式',
          titleEn: 'LLVM IR and SSA Form',
          duration: 15,
          difficulty: 'advanced',
          tags: ['LLVM-IR', 'SSA', 'phi-node', 'basic-block', 'amdgpu_kernel'],
          concept: {
            summary: 'LLVM IR is一种强type, SSA(Static Single Assignment)形式intermediate representation. eachvariable只by赋值once, control流merge点use phi nodeselect值. AMDGPU 特has IR 特征include amdgpu_kernel call约定andaddress space标注(addrspace). ',
            explanation: [
              'LLVM IR iscompilerin端andbackend之betweengeneral语言. 它has三种等价表现形式: 人类can读文本format(.ll file), compact二进制format(.bc file, i.e. bitcode), andmemoryin C++ object(llvm::Module/Function/Instruction 等). 三种形式iscompletely等价, can互相convert. forlearnanddebugging, wemainuse .ll 文本format. ',
              'SSA(Static Single Assignment)is LLVM IR 最core性质: eachvirtualregister(以 % 开头)只bydefine(赋值)once. for example %sum = fadd float %a, %b define %sum, afternotcanagain给 %sum 赋新值. if源codeinhasvariableby多次赋值(如 x = x + 1), SSA 形式willcreate新version(%x.1 = add i32 %x.0, 1). SSA 好处is极大简化data流analyze — each值define点unique, use-define链(use-def chain)candirectly建立. ',
              'whentwocontrol流pathmerge时, SSA need phi nodeselectuse哪个path值. for example if-else 语句in x intwobranchinby赋different值, merge点need %x.merge = phi i32 [%x.then, %bb.then], [%x.else, %bb.else]. phi instructionaccording tocontrol流源select值 — iffrom %bb.then to达则选 %x.then, from %bb.else to达则选 %x.else. phi nodeis SSA coremechanism, 它allowin保持"eachvariable只赋值once"meanwhile表达control流dependency值. ',
              'LLVM IR basicstructure单位is Basic Block(basicblock): 一段orderexecuteinstruction序列, 以 label 开头, 以 terminator instruction(br/ret/switch)结尾. functionis Basic Block 集合, module(Module)isfunction集合. keyinstructiontype: 算术(add/fadd/mul), memory(load/store/alloca), control流(br/ret/phi), typeconvert(bitcast/zext/trunc), call(call), GEP(getelementptr — 数组/structure体addresscompute). ',
              'for AMDGPU, IR hasseveralimportant特殊标注: (1) amdgpu_kernel call约定 — mark这isa GPU kernel entry pointfunction, backendwillas其generate特殊 prolog(loading kernel arguments, set workgroup info 等); (2) addrspace address space标注 — addrspace(0)=private(每threadstack), addrspace(1)=global(global memory/VRAM), addrspace(3)=local(LDS, workgroup shared), addrspace(4)=constant(只读constant memory); (3) llvm.amdgcn.* 内置function — 如 llvm.amdgcn.workitem.id.x(getthread ID), llvm.amdgcn.s.barrier(synchronization屏障). these标注letbackendknowhowgeneratecorrectmemoryaccessinstructionandaddresscompute. ',
              'understand LLVM IR isreadcompileroutputanddiagnoseoptimizationissuebasics. when你find GPU kernel performancenot佳时, 第一步usuallyis hipcc -S -emit-llvm view IR — 看optimization器whethersuccess消除冗余compute, whethercorrect展开循环, whetherwillmemoryoperate转化as更高效形式. IR layer面issue比 ISA layer面更容易understandandlocate. ',
            ],
            keyPoints: [
              'LLVM IR 三种形式: .ll(文本), .bc(bitcode 二进制), memoryobject — completely等价can互转',
              'SSA 形式: each %variable只bydefineonce, 简化data流analyzeandoptimization',
              'phi nodeincontrol流merge点select值: phi i32 [%val.then, %bb.then], [%val.else, %bb.else]',
              'Basic Block: 以 label 开头, terminator 结尾线性instruction序列',
              'AMDGPU 特has: amdgpu_kernel call约定, addrspace(0/1/3/4) address space, llvm.amdgcn.* intrinsics',
              'keyinstruction: load/store(memory), getelementptr(addresscompute), fadd/fmul(算术), br/phi(control流)',
            ],
          },
          diagram: {
            title: 'LLVM IR in SSA 形式and phi node',
            content: `from C codeto LLVM IR SSA 形式

── 源code(HIP kernel inconditionbranch)──

  float result;
  if (tid < n) {
      result = a[tid] + b[tid];    // then branch
  } else {
      result = 0.0f;               // else branch
  }
  out[tid] = result;               // usemergeafter值


── compilationas LLVM IR (SSA 形式) ──

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
    %ptr.a = getelementptr float,   ; compute &a[tid]
              ptr addrspace(1) %a, i32 %tid
    %val.a = load float,            ; loading a[tid]
              ptr addrspace(1) %ptr.a
    %ptr.b = getelementptr float,   ; compute &b[tid]
              ptr addrspace(1) %b, i32 %tid
    %val.b = load float,            ; loading b[tid]
              ptr addrspace(1) %ptr.b
    %sum = fadd float %val.a, %val.b  ; a[tid] + b[tid]
    br label %bb.merge              ; ← terminator: unconditional branch

  bb.else:                          ; ← Basic Block: else
    br label %bb.merge

  bb.merge:                         ; ← Basic Block: merge (merge点)
    %result = phi float             ; ★ PHI node ★
      [ %sum,  %bb.then ],         ; from then  → 用 %sum
      [ 0.0,   %bb.else ]          ; from else  → 用 0.0
    %ptr.out = getelementptr float,
              ptr addrspace(1) %out, i32 %tid
    store float %result,            ; out[tid] = result
              ptr addrspace(1) %ptr.out
    ret void
  }

note SSA 性质: each %variable只by赋值once
  %tid    = call ...    (defineonce)
  %val.a  = load ...    (defineonce)
  %sum    = fadd ...    (defineonce)
  %result = phi ...     (defineonce, 但值取决于源path)`,
            caption: 'SSA 形式ineachvariable只bydefineonce. phi nodeis SSA handlecontrol流mergecoremechanism — 它notgenerate任何机器instruction, but rather告诉register allocation器inmerge点selectcorrect值. note AMDGPU 特has amdgpu_kernel and addrspace(1) 标注. ',
          },
          codeWalk: {
            title: 'vector_add compilationas LLVM IR: complete标注',
            file: 'vector_add.ll — hipcc -S -emit-llvm -O2 output',
            language: 'llvm',
            code: `; ModuleID = 'vector_add.hip'
target datalayout = "e-p:64:64-p1:64:64-p2:32:32-p3:32:32-p4:64:64-p5:32:32-p6:32:32-p7:160:256:256:32-p8:128:128-i64:64-v16:16-v24:32-v32:32-v48:64-v96:128-v192:256-v256:256-v512:512-v1024:1024-v2048:2048-n32:64-S32-A5-G1-ni:7:8"
target triple = "amdgcn-amd-amdhsa"

; functiondefine: amdgpu_kernel mark这is GPU kernel entry point
define amdgpu_kernel void @_Z10vector_addPKfS0_Pfi(
    ptr addrspace(1) nocapture readonly %a,   ; const float* (global)
    ptr addrspace(1) nocapture readonly %b,   ; const float* (global)
    ptr addrspace(1) nocapture writeonly %c,  ; float*       (global)
    i32 %n                                    ; int n
) #0 {
entry:
  ; getthread索引: blockIdx.x * blockDim.x + threadIdx.x
  %tid.x = tail call i32 @llvm.amdgcn.workitem.id.x()
  %bid.x = tail call i32 @llvm.amdgcn.workgroup.id.x()
  %bsz.x = tail call i32 @llvm.amdgcn.dispatch.ptr.load.i32(i32 4)
  %tmp0 = mul i32 %bid.x, %bsz.x
  %i = add i32 %tmp0, %tid.x

  ; boundarycheck: if (i < n)
  %cmp = icmp slt i32 %i, %n
  br i1 %cmp, label %if.then, label %if.end

if.then:
  ; GEP: compute数组元素address  &a[i] = a + i*sizeof(float)
  %idx = sext i32 %i to i64
  %ptr.a = getelementptr inbounds float, ptr addrspace(1) %a, i64 %idx
  %ptr.b = getelementptr inbounds float, ptr addrspace(1) %b, i64 %idx
  %ptr.c = getelementptr inbounds float, ptr addrspace(1) %c, i64 %idx

  ; load: fromglobal memoryloading值
  %val.a = load float, ptr addrspace(1) %ptr.a, align 4
  %val.b = load float, ptr addrspace(1) %ptr.b, align 4

  ; fadd: 浮点加法  c[i] = a[i] + b[i]
  %sum = fadd float %val.a, %val.b

  ; store: 写回global memory
  store float %sum, ptr addrspace(1) %ptr.c, align 4
  br label %if.end

if.end:
  ret void
}

; AMDGPU intrinsics 声明
declare i32 @llvm.amdgcn.workitem.id.x()
declare i32 @llvm.amdgcn.workgroup.id.x()

; functionproperty
attributes #0 = {
  "amdgpu-flat-work-group-size"="1,1024"
  "uniform-work-group-size"="true"
}`,
            annotations: [
              'target triple "amdgcn-amd-amdhsa" — amdgcn is AMD GCN/RDNA ISA architecture名, amdhsa is HSA run时 ABI',
              'amdgpu_kernel call约定: backendwillgenerate特殊 prolog from SGPRs loading kernel arguments',
              'addrspace(1) 标注allglobal memorypointer — backend据此select global_load/global_store instruction',
              'getelementptr (GEP) notexecute任何memoryoperate, 只computeaddressoffset — 它is LLVM IR address运算instruction',
              'sext i32 %i to i64: will 32 位索引符号扩展as 64 位 — AMDGPU globaladdressis 64 位',
              'llvm.amdgcn.workitem.id.x() corresponding RDNA3  v0 register — hardwarein kernel startup时automatic填充thread ID',
            ],
            explanation: 'this LLVM IR is vector_add kernel in -O2 optimizationafteroutput. compare HIP source codeand IR: blockIdx.x*blockDim.x+threadIdx.x 变as AMDGCN intrinsic calland算术instruction; c[i]=a[i]+b[i] 变as GEP→load→load→fadd→store  SSA instruction序列. noteeach % variable只by赋值once(SSA 性质), addrspace(1) 标注ensurebackendgeneratecorrectglobal memoryaccessinstruction. ',
          },
          miniLab: {
            title: '手动analyze LLVM IR  SSA and phi node',
            objective: 'throughwritecontainconditionbranch HIP code, observecompilergenerate phi nodeand SSA 形式. ',
            steps: [
              'writecontain if-else  HIP kernel(如on述 diagram incode), saveas phi_test.hip',
              'generatenot yetoptimization IR: hipcc -S -emit-llvm -O0 --offload-arch=gfx1102 phi_test.hip -o phi_O0.ll',
              'in phi_O0.ll in搜索 alloca — -O0 not做 mem2reg, sovariableinstackon',
              'generateoptimizationafter IR: hipcc -S -emit-llvm -O2 --offload-arch=gfx1102 phi_test.hip -o phi_O2.ll',
              'in phi_O2.ll in搜索 phi — O2 execute mem2reg, alloca 变as phi node',
              '画出 phi_O2.ll control流图: each label isanode, br instructionis边, 标注 phi nodedata流',
            ],
            expectedOutput: `$ grep "alloca" phi_O0.ll
  %result = alloca float, align 4, addrspace(5)  ← -O0: variableinstackon
  %tid.addr = alloca i32, align 4, addrspace(5)

$ grep "phi" phi_O2.ll
  %result = phi float [ %sum, %if.then ], [ 0.000000e+00, %if.else ]
  ← -O2: alloca by消除, 变as phi node`,
            hint: 'mem2reg Pass iswill非 SSA code(带 alloca/load/store)转化as SSA code(带 phi node)key Pass. use opt -passes=mem2reg can单独runthis Pass. ',
          },
          debugExercise: {
            title: 'fixnot合法 LLVM IR',
            language: 'llvm',
            description: 'below LLVM IR 片段hastwo违反 SSA 规则error. find并修正they. ',
            question: '哪两条instruction违反 LLVM IR  SSA 规则? how修正? ',
            buggyCode: `define amdgpu_kernel void @bad_ssa(ptr addrspace(1) %out, i32 %n) {
entry:
  %i = add i32 0, 1          ; %i = 1
  %i = add i32 %i, 1         ; BUG #1: %i by赋值两次! 
  br i1 true, label %bb1, label %bb2

bb1:
  %val = fadd float 1.0, 2.0
  br label %merge

bb2:
  %val = fadd float 3.0, 4.0 ; BUG #2: %val in另a BB inalsobydefine! 
  br label %merge

merge:
  store float %val, ptr addrspace(1) %out
  ret void
}`,
            hint: 'SSA core规则: eachvirtualregister(%name)inentirefunctionin只canbydefine(赋值)once. control流merge点needusewhat特殊instruction? ',
            answer: 'BUG #1: %i in entry blockinbydefine两次. SSA to求each %variable只canhasadefine点. 修正: will第二次赋值改as %i2 = add i32 %i, 1. BUG #2: %val in bb1 and bb2 inallbydefine. even iftwodefineindifferentbasicblockin, SSA stillto求globalunique. 修正: bb1 in用 %val.1 = fadd float 1.0, 2.0, bb2 in用 %val.2 = fadd float 3.0, 4.0, thenin merge blockinadd phi node: %val = phi float [%val.1, %bb1], [%val.2, %bb2]. 这正is phi nodeexist意义 — in保持 SSA uniquedefine规则meanwhile表达control流merge. LLVM  verifier pass(opt -verify)willautomaticdetectthese违规. ',
          },
          interviewQ: {
            question: 'whatis SSA 形式? LLVM IR in phi nodeiswhat? 它how帮助compileroptimization? ',
            difficulty: 'medium',
            hint: 'fromdefineunique性, use-def chain, data流analyze简化角度answer. phi noderesolvewhatissue? ',
            answer: 'SSA(Static Single Assignment)is一种 IR represent形式, 其core规则iseachvariable只bydefine(赋值)once. for examplesource codein x=1; x=x+1; in SSA in变as %x.0=1; %x.1=add %x.0, 1. 这使得 use-def chain(use-define链)is平凡 — eachusedirectly指向uniquedefine, notneeddata流analyze消歧. 这极大简化constant传播, 死code消除, 公共子表达式消除等optimization. phi nodeis SSA handlecontrol流mergemechanism. whentwobranch对同一variable赋different值时, merge点need phi float [%v1, %bb1], [%v2, %bb2] 表达"值取决于from哪个pathto达". phi nodenotgenerate任何actual机器instruction — inregister allocationstage, 它willby消解asregistercopyordirectly利用register命名. phi node帮助optimization器进行更精确data流analyze: for example GVN(Global Value Numbering)canthrough phi nodefind冗余compute, LICM(Loop Invariant Code Motion)canthrough phi node确定循环innotvariable. ',
            amdContext: 'AMD Toolchain team日常workdirectlyoperate LLVM IR. interviewindemonstrate你can读懂 IR, understand SSA 形式and phi node, indicate你hasability参andcompilerdevelopmentwork. 提to AMDGPU-specific  IR 特征(amdgpu_kernel, addrspace)is加分项. ',
          },
        },
      ],
    },

    // ════════════════════════════════════════════════════════════
    // Group 9.2: AMDGPU backend
    // ════════════════════════════════════════════════════════════
    {
      id: '9-2',
      number: '9.2',
      title: 'AMDGPU backend',
      titleEn: 'AMDGPU Backend',
      icon: '⚙️',
      description: '深入 LLVM AMDGPU backend: instruction selection, register allocation, ISA 汇编. 这is AMD Markham Toolchain teamcorework — will LLVM IR 高效compilationas AMD GPU 机器码. ',
      lessons: [
        // ── Lesson 9.2.1 ──────────────────────────────────────
        {
          id: '9-2-1',
          number: '9.2.1',
          title: 'AMDGPU backendarchitecture',
          titleEn: 'AMDGPU Backend Architecture',
          duration: 15,
          difficulty: 'expert',
          tags: ['AMDGPU-backend', 'SelectionDAG', 'MachineInstr', 'instruction-selection', 'pass-pipeline'],
          concept: {
            summary: 'AMDGPU backendis LLVM in最complexbackend之一. 它through SelectionDAG will LLVM IR convertas GPU 机器instruction(MachineInstr), then经过register allocationandinstruction scheduling, finalgenerate AMDGPU ISA 二进制. backendstillcontainmultiple GPU 专用 Pass, 如 promote-alloca and lower-kernel-arguments. ',
            explanation: [
              'AMDGPU backendentry pointis AMDGPUTargetMachine 类(llvm/lib/Target/AMDGPU/AMDGPUTargetMachine.cpp). 它registration AMDGPU allbackendcomponent: instructiondefine(AMDGPUInstrInfo), registerfile(SIRegisterInfo), 子goalinformation(GCNSubtarget), call约定, 合法化规则等. through --mcpu=gfx1102 parameter, backendselect RDNA3 子goalconfiguration, includeavailableinstruction set, registerlimit, pipeline特征. ',
              'instruction selection(Instruction Selection)isbackend最keystage. 它will LLVM IR abstractionoperateconvertasgoal机器specificinstruction. AMDGPU use SelectionDAG-based ISel: firstwill LLVM IR buildas DAG(has向无环图), thenthrough pattern matching will DAG nodematchto AMDGPU instruction. for example LLVM IR  fadd float → DAG  ISD::FADD → AMDGPU  V_ADD_F32_e32(VALU 浮点加法). thesematch规则definein .td(TableGen)filein, 如 SIInstructions.td. ',
              'instruction selectionafter, IR from LLVM IR 降低as MachineInstr — 一种接近final机器码但仍usevirtualregisterrepresent. 此时codealreadyusespecific AMDGPU instruction(V_ADD_F32, S_LOAD_DWORDX4, GLOBAL_LOAD_DWORD 等), 但registerstillisvirtual(如 %vreg0, %vreg1). after续register allocationstagewillwillvirtualregistermappingtophysicalregister(v0, v1, s0, s1 等). ',
              'AMDGPU backendcontainmultiple GPU 专用 Pass, theyhandle GPU hardware特殊需求: (1) AMDGPUPromoteAlloca — will alloca(stackon私has数组)提升to LDS(Local Data Share)or向量register, avoid昂贵 scratch memoryaccess; (2) AMDGPULowerKernelArguments — will kernel parameterfromkernelparameter段(kern_arg_segment)loadingtoregister; (3) SIFixSGPRCopies — fix SGPR↔VGPR 之between非法copyoperate; (4) SIInsertWaitcnts — in必tolocationinsert s_waitcnt instruction, ensurememoryoperatecompleteafteragainuseresult; (5) SIOptimizeExecMaskingPreRA — optimization exec mask operate以减少control流开销. these Pass is AMDGPU backenddifference于generalbackendcore所in. ',
              'complete AMDGPU backend Pass pipeline(from LLVM IR to机器码)大致as: LLVM IR → AMDGPULowerIntrinsics → AMDGPUPromoteAlloca → AMDGPULowerKernelArguments → SelectionDAG ISel → SIFixSGPRCopies → SIOptimizeExecMasking → Register Allocation → SIInsertWaitcnts → Post-RA Scheduling → MC Code Emission. can用 llc -mtriple=amdgcn -mcpu=gfx1102 -debug-pass=Structure viewcomplete Pass list. ',
              'Two AMDGPU-specific passes deserve special attention. SIInsertWaitcnts inserts s_waitcnt instructions to handle the GPU\'s asynchronous memory model — without these wait instructions, a shader might read data before the previous store completes, causing silent corruption. The pass analyzes data dependencies and inserts the minimum necessary waits (vmcnt for vector memory, lgkmcnt for LDS/GDS/scalar, expcnt for exports). The second critical pass is SIShrinkInstructions, which converts 64-bit VOP3 encoding to 32-bit VOP1/VOP2 where possible, saving instruction cache space. When VGPR pressure exceeds available registers, the compiler spills to scratch memory (private per-thread VRAM space accessed via MUBUF instructions), which is 100x slower than register access — this is why minimizing VGPR usage is critical for performance.',
            ],
            keyPoints: [
              'AMDGPUTargetMachine isbackendentry point, through --mcpu=gfx1102 select RDNA3 子goalconfiguration',
              'instruction selection: SelectionDAG ISel through .td filein pattern matching will IR nodematchto AMDGPU instruction',
              'MachineInstr isbackendcorerepresent — specific AMDGPU instruction + virtualregister',
              'GPU 专用 Pass: promote-alloca(avoid scratch), lower-kernel-arguments, fix-sgpr-copies, insert-waitcnts',
              'Pass pipeline: IR → Lower → Promote → ISel → RegAlloc → Scheduling → MC Emit',
              '用 llc -debug-pass=Structure viewcomplete Pass listandexecuteorder',
              'SIInsertWaitcnts pass prevents data corruption by inserting s_waitcnt for async memory ops',
              'Scratch memory spill (VGPR overflow → VRAM) is 100x slower than register access',
            ],
          },
          diagram: {
            title: 'AMDGPU backend Pass pipeline',
            content: `AMDGPU backend: from LLVM IR to GPU 机器码complete Pass pipeline

LLVM IR (SSA form, target-independent)
 │
 ▼ ═══════ AMDGPU Pre-ISel Passes ═══════
 │
 ├─ AMDGPULowerIntrinsics
 │    willgeneral LLVM intrinsic 降低as AMDGPU specificoperate
 │
 ├─ AMDGPUPromoteAlloca        ★ GPU keyoptimization
 │    alloca (私hasstack) → LDS or向量register
 │    avoid scratch memory 巨大latency开销
 │
 ├─ AMDGPULowerKernelArguments
 │    kernel parameterfrom kernarg segment loadingtoregister
 │    s_load_dwordx4 s[0:3], s[4:5], 0x0
 │
 ▼ ═══════ Instruction Selection ═══════
 │
 ├─ SelectionDAG Builder
 │    LLVM IR → DAG (has向无环图)
 │    fadd float %a, %b → (fadd f32 $a, $b)
 │
 ├─ DAG Legalization
 │    ensurealloperatein AMDGPU on合法
 │    notsupportoperateby扩展assupport序列
 │
 ├─ DAG-to-DAG ISel (SIInstrInfo.td patterns)
 │    (fadd f32 $src0, $src1) → V_ADD_F32_e32
 │    (load global addr) → GLOBAL_LOAD_DWORD
 │
 ▼ ═══════ MachineInstr Level ═══════
 │
 │  此时codeuse AMDGPU instruction + virtualregister: 
 │  %vreg3:vgpr_32 = V_ADD_F32_e32 %vreg1, %vreg2
 │
 ├─ SIFixSGPRCopies
 │    fix SGPR↔VGPR 非法copy
 │    (SGPR notcandirectlywrite VGPR incertaincontextin)
 │
 ├─ Register Allocation          ★ corestage
 │    virtualregister → physicalregister (v0-v255, s0-s105)
 │    决定 VGPR/SGPR use量 → impact Occupancy
 │
 ├─ SIInsertWaitcnts             ★ correct性key
 │    insert s_waitcnt vmcnt(0) / lgkmcnt(0)
 │    ensurememoryoperatecompleteafteragainuseresult
 │
 ├─ Post-RA Instruction Scheduling
 │    重排instruction以隐藏latency, optimization吞吐
 │
 ▼ ═══════ MC Layer (Code Emission) ═══════
 │
 └─ AMDGPUMCCodeEmitter
      MachineInstr → 二进制编码
      V_ADD_F32_e32 v1, v2, v3 → 0x02020503
      output .text section (GPU ISA bytes)
      output .note section (metadata)
      → .hsaco (ELF format GPU canexecutefile)`,
            caption: 'AMDGPU backendcomplete Pass pipeline. each Pass allcan用 -debug-only=<pass-name> 单独view其output. GPU 专用 Pass(promote-alloca, insert-waitcnts 等)is AMDGPU backendandgeneralbackendcoredifference. ',
          },
          codeWalk: {
            title: 'key AMDGPU backend Pass: from IR to机器instruction',
            file: 'llvm/lib/Target/AMDGPU/ — key passes overview',
            language: 'c',
            code: `/* ═══ AMDGPUTargetMachine.cpp — backendentry point ═══ */
/* registrationall AMDGPU backend Pass */
void GCNPassConfig::addPreISel() {
  /* GPU specific Pre-ISel Pass */
  addPass(createAMDGPULowerIntrinsicsPass());
  addPass(createAMDGPUPromoteAllocaPass());
  /* ↑ will alloca 提升as LDS orregister
   * 例: float arr[4] → 4 个 VGPR
   * 例: __shared__ float smem[256] → LDS */
  addPass(createAMDGPULowerKernelArgumentsPass());
}

void GCNPassConfig::addInstSelector() {
  /* SelectionDAG instruction selection */
  addPass(createAMDGPUISelDag(getAMDGPUTargetMachine()));
}

void GCNPassConfig::addPreRegAlloc() {
  addPass(&SIFixSGPRCopiesID);
  /* ↑ fix SGPR-VGPR copyissue
   * SGPR (标量) and VGPR (向量) hasdifferentuse规则
   * certainoperate只can用 VGPR, certain只can用 SGPR */
  addPass(&SIOptimizeExecMaskingPreRAID);
}

void GCNPassConfig::addPostRegAlloc() {
  addPass(&SIInsertWaitcntsID);
  /* ↑ inmemoryoperateafterinsert s_waitcnt
   * global_load_b32 v1, v0, s[0:1]
   * s_waitcnt vmcnt(0)    ← wait load complete
   * v_add_f32 v2, v1, v3  ← 现incansecurityuse v1 */
}

/* ═══ SIInstructions.td — instruction selectionpattern(TableGen)═══ */
/* DAG pattern matching 规则example */

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

/* these .td 规则由 TableGen toolincompilation期generate
 * C++ matchcode, ISel run时executematch */`,
            annotations: [
              'GCNPassConfig inheritance自 LLVM  TargetPassConfig, as GCN/RDNA architecture定制 Pass pipeline',
              'addPreISel() in Pass ininstruction selectionbeforerun — handle GPU 特has IR convert',
              'PromoteAlloca isperformancekey Pass — willstackallocation提升toregister/LDS avoid scratch memory',
              'SIFixSGPRCopies ensure标量/向量registeruse规则correct — AMDGPU 双registerfile特殊需求',
              'SIInsertWaitcnts iscorrect性key — nocorrect waitcnt, GPU willusenot yetreadydata',
              '.td filein Pattern matching 规则incompilation LLVM 本身时由 TableGen handleas C++ code',
            ],
            explanation: 'thiscodedemonstrate AMDGPU backend Pass pipeline组织approach. GCNPassConfig 类control Pass registrationandexecuteorder. keyunderstand: (1) GPU backend比 CPU backendcomplex得多, becauseneedhandle SGPR/VGPR 双registerfile, LDS memory, wavefront execute模型等 GPU 特has概念; (2) 很多 AMDGPU Pass(如 InsertWaitcnts)iscorrect性 Pass rather thanoptimization Pass — notheyprogramwillgenerateerrorresult. ',
          },
          miniLab: {
            title: 'view AMDGPU backendcomplete Pass list',
            objective: 'use llc debugging选项view AMDGPU backendexecutewhich Pass, understandcompilationpipelinecomplex度. ',
            setup: `# 准备a LLVM IR inputfile
hipcc -S -emit-llvm -O2 --offload-arch=gfx1102 vector_add.hip -o vector_add.ll
# or手动create最简 IR: 
cat > simple.ll << 'EOF'
define amdgpu_kernel void @k(ptr addrspace(1) %p) {
  %v = load float, ptr addrspace(1) %p
  %r = fadd float %v, 1.0
  store float %r, ptr addrspace(1) %p
  ret void
}
EOF`,
            steps: [
              'view Pass list: llc -mtriple=amdgcn-amd-amdhsa -mcpu=gfx1102 -debug-pass=Structure simple.ll -o /dev/null 2>&1 | head -80',
              'statistics Pass count: on述command | wc -l(usuallyexceed 100 个 Pass)',
              'viewinstruction selectionoutput: llc -mtriple=amdgcn-amd-amdhsa -mcpu=gfx1102 -debug-only=isel simple.ll -o /dev/null 2>&1 | head -40',
              'viewregister allocation: llc -mtriple=amdgcn-amd-amdhsa -mcpu=gfx1102 -debug-only=regalloc simple.ll -o /dev/null 2>&1 | head -40',
              'view waitcnt insert: llc -mtriple=amdgcn-amd-amdhsa -mcpu=gfx1102 -debug-only=si-insert-waitcnts simple.ll -o /dev/null 2>&1',
              'comparefinal汇编output: llc -mtriple=amdgcn-amd-amdhsa -mcpu=gfx1102 simple.ll -o simple.s && cat simple.s',
            ],
            expectedOutput: `$ llc ... -debug-pass=Structure 2>&1 | grep -c "Pass"
120+    ← AMDGPU backendexecuteexceed 120 个 Pass

$ cat simple.s | grep -v "^[;.]"
  s_load_b32 s0, s[4:5], 0x0     ; load *p
  s_waitcnt lgkmcnt(0)            ; wait for load
  v_add_f32_e64 v0, s0, 1.0      ; *p + 1.0
  global_store_b32 v[0:1], v0, off ; store result
  s_endpgm                         ; end kernel`,
            hint: 'ifnoinstall ROCm, canfrom LLVM source codecompilation llc 并enable AMDGPU target: cmake -DLLVM_TARGETS_TO_BUILD="AMDGPU" ../llvm. oruse godbolt.org in线select AMDGPU llc viewoutput. ',
          },
          debugExercise: {
            title: 'diagnose缺失 s_waitcnt causedata竞争',
            language: 'asm',
            description: 'below AMDGPU 汇编片段hasacorrect性 Bug — 缺失必towaitinstruction. ',
            question: 'thiscodeinwhat情况belowwillgenerateerrorresult? needin哪insideinsertwhatinstruction? ',
            buggyCode: `; fromglobal memoryloadingtwo值并相加
global_load_b32 v1, v0, s[0:1]    ; v1 = memory[addr1]
global_load_b32 v2, v0, s[2:3]    ; v2 = memory[addr2]
; BUG: nowait load completeuseresult! 
v_add_f32_e32 v3, v1, v2          ; v3 = v1 + v2  (v1, v2 maystill没准备好)
global_store_b32 v0, v3, s[4:5]   ; 写回result
s_endpgm`,
            hint: 'AMDGPU  global_load isasynchronousoperate — 发出 load requestafter GPU continueexecuteafter续instruction, will notautomaticwait. needwhatinstructionensure load complete? ',
            answer: 'issue: global_load_b32 isasynchronousmemoryoperate. in RDNA3 on, global_load 发出after GPU willcontinueexecuteafter续instruction, load resultmayin数十to数百个周期afteronly thento达register. ifin load completebeforeuse v1/v2, will读tonot yetdefine旧值. 修正: in两条 load and v_add 之betweeninsert s_waitcnt vmcnt(0). vmcnt is Vector Memory Count, 跟踪not yetcomplete向量memoryoperatecount. vmcnt(0) representwaitallnot yetcomplete向量memoryoperatecomplete. correctcode: global_load_b32 v1, ...; global_load_b32 v2, ...; s_waitcnt vmcnt(0); v_add_f32_e32 v3, v1, v2; .... in LLVM AMDGPU backendin, SIInsertWaitcnts Pass responsible forautomaticinsertthesewaitinstruction. ifthis Pass has Bug, will出现这种难以debuggingdata竞争issue — resulthas时correcthas时error, 取决于memorylatency. ',
          },
          interviewQ: {
            question: 'describe LLVM AMDGPU backend Pass pipeline. whichis GPU 特has Pass? whyneedthey? ',
            difficulty: 'hard',
            hint: 'from ISel → RegAlloc → Scheduling → Emit 主干线出发, 提及 promote-alloca, fix-sgpr-copies, insert-waitcnts 等 GPU 特has Pass. ',
            answer: 'AMDGPU backend Pass pipeline: (1) Pre-ISel stage: AMDGPULowerIntrinsics(降低general intrinsic), AMDGPUPromoteAlloca(willstackallocation提升to LDS/register — GPU no高效stack, scratch memory latencyisregister 100 倍above), AMDGPULowerKernelArguments(will kernel parameterfrom kernarg segment loadingtoregister). (2) ISel stage: SelectionDAG instruction selection, through .td define pattern matching will IR nodematchto AMDGPU instruction. (3) Pre-RegAlloc: SIFixSGPRCopies(fix SGPR/VGPR 非法copy — GPU hastwodifferentregisterfile, certainoperate对registertypehasto求), SIOptimizeExecMasking(optimization exec mask operate减少control流开销 — GPU use exec mask implementationbranch, is notcondition跳转). (4) RegAlloc: allocation VGPR and SGPR, 这directly决定 Occupancy. (5) Post-RegAlloc: SIInsertWaitcnts(insertmemorysynchronizationinstruction — GPU memoryoperateisasynchronous, mustexplicitwait), Post-RA Scheduling(重排instruction隐藏latency). (6) MC Emit: 编码as二进制机器码. GPU 特has Pass existisbecause GPU execute模型and CPU 根本different: SIMD execute(exec mask), asynchronousmemory(waitcnt), 双registerfile(SGPR/VGPR), 无高效stack(scratch). ',
            amdContext: 'AMDGPU backend Pass pipelineis AMD Toolchain teamcorework. interviewincandetaileddescribethispipeline, 并explaineach GPU 特has Pass exist理由, indicate你not只iswill用compiler, but ratherunderstandcompilerinternalworkmechanism. ',
          },
        },

        // ── Lesson 9.2.2 ──────────────────────────────────────
        {
          id: '9-2-2',
          number: '9.2.2',
          title: 'VGPR and SGPR: GPU register allocation',
          titleEn: 'VGPR and SGPR: GPU Register Allocation',
          duration: 15,
          difficulty: 'expert',
          tags: ['VGPR', 'SGPR', 'register-allocation', 'occupancy', 'spilling', 'uniformity'],
          concept: {
            summary: 'AMD GPU has两类register: VGPR(Vector GPR, 每threadindependent)and SGPR(Scalar GPR, entire Wavefront shared). compilerthrough Uniformity Analysis 决定data放in哪种registerin. VGPR use量directly决定 Occupancy(GPU 并发 Wavefront 数), 过多 VGPR usewillcauseregister spill to scratch memory, 严重impactperformance. ',
            explanation: [
              'VGPR(Vector General Purpose Register)iseachthread私hasregister. in RDNA3 architecturein, each CU(Compute Unit)has 1536 个 32 位 VGPR(以 wave32 as单位allocation, actualis 1536 × 32 lanes). VGPR used forstoragethread私hasdata: thread ID, 数组索引, loadingdata值, computeinbetweenresult等. VALU(Vector ALU)instructionoperate VGPR — 一条 v_add_f32 instructionmeanwhile对 Wavefront inall 32 个thread VGPR execute加法. ',
              'SGPR(Scalar General Purpose Register)isentire Wavefront sharedregister. each CU has 512 个 32 位 SGPR. SGPR used forstorageallthreadsamedata(uniform data): 循环count器, constantpointer, kernel parameter, conditionbranch统一condition等. SALU(Scalar ALU)instructionoperate SGPR — can耗远低于 VALU. compilerwill尽may多compute放in SGPR/SALU onisimportantoptimization. ',
              'Uniformity Analysis iscompiler决定data放 VGPR stillis SGPR keyanalyze. ifa值in Wavefront allthreadinsame(uniform), 它should放in SGPR in. for example kernel parameter, 循环variable, blockDim.x allis uniform . ifa值indifferentthreadindifferent(divergent), 它must放in VGPR in. for example threadIdx.x, a[threadIdx.x] loadingresultallis divergent . compiler Uniformity Analysis Pass tracingeach值 uniform/divergent property, 并willresultpass给register allocation器. ',
              'VGPR use量and Occupancy(occupancy)directlyrelated. Occupancy is指 CU onmeanwhileactive Wavefront countand最大值比率. RDNA3 each CU 最多meanwhilerun 16 个 wave32. if kernel use 48 个 VGPR, 那么 1536÷48=32 个 wave can共存, 但due toon限is 16, so Occupancy=16/16=100%. ifuse 128 个 VGPR, 则 1536÷128=12 个 wave, Occupancy=12/16=75%. ifuse 256 个 VGPR, only 6 个 wave, Occupancy=6/16=37.5%. 更低 Occupancy 意味着更少 Wavefront can隐藏memorylatency, usuallycauseperformancebelow降. ',
              'when kernel needregisterexceedavailable量时, compilerby迫will部分register值 spill(overflow)to scratch memory. Scratch memory is VRAM inaseachthreadreservestack空between, accesslatency比register高 100 倍above. Spill 表现: compilationoutputin .amdhsa_private_segment_fixed_size > 0(representneed scratch 空between), 汇编in出现 scratch_load/scratch_store instruction(will VGPR 值saveto scratch 并inneed时recover). register压力is GPU programmingin最importantperformance因素之一 — 减少 VGPR use(through减少activevariable, 重组compute, use LDS 替代私has数组)is GPU performanceoptimizationcore技巧. ',
              'The AMDGPU backend\'s wave size selection is controlled by the amdgpu-waves-per-eu attribute and target features. For RDNA GPUs (gfx10+), the compiler defaults to Wave32 for pixel shaders (better for small triangles with high divergence) and Wave64 for compute shaders (better throughput for uniform workloads). This is configured in AMDGPUSubtarget::getWavesPerEU() and affects register allocation pressure — Wave32 halves the VGPR file consumption compared to Wave64 for the same number of active waves. Game developers often force Wave32 for all shaders on RDNA, while HPC developers prefer Wave64 for maximum ALU throughput.',
            ],
            keyPoints: [
              'VGPR: 每thread私has, RDNA3 每 CU has 1536 个(wave32 allocation单位), storage divergent data',
              'SGPR: Wavefront shared, 每 CU has 512 个, storage uniform data(parameter, constant, 循环variable)',
              'Uniformity Analysis: compileranalyzeeach值is uniform(→SGPR)stillis divergent(→VGPR)',
              'Occupancy = 并发 Wavefront 数 / 最大值; VGPR use量越少 → Occupancy 越高 → latency隐藏越好',
              'Spill: VGPR not够时overflowto scratch memory(VRAM), latency增加 100 倍above',
              'compileroutputin .amdhsa_next_free_vgpr/sgpr reportregisteruse量, ScratchSize report spill size',
              'Wave32 default for pixel shaders (less divergence waste), Wave64 for compute (more throughput)',
            ],
          },
          diagram: {
            title: 'VGPR/SGPR and Occupancy relationship',
            content: `RDNA3 (gfx1102) CU registerresourceand Occupancy

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
│  │ each Wavefront 最多 106 个 SGPR                     │    │
│  └────────────────────────────────────────────────────┘    │
│                                                            │
└────────────────────────────────────────────────────────────┘

VGPR use量 vs Occupancy (RDNA3 wave32, 1536 VGPRs/CU): 

  VGPRs/wave    Max Waves    Occupancy    latency隐藏ability
  ──────────    ─────────    ─────────    ──────────
     24            16         100.0%      ★★★★★ 极佳
     48            16         100.0%      ★★★★★ 极佳
     64            16         100.0%      ★★★★★ 极佳
     96            16         100.0%      ★★★★★ 极佳
     128           12          75.0%      ★★★★☆ 良好
     192            8          50.0%      ★★★☆☆ in等
     256            6          37.5%      ★★☆☆☆ 较差
    >256         spill!         —           ★☆☆☆☆ 极差

Uniform vs Divergent 值register allocation: 

  HIP code                    property          register
  ─────────                   ────          ──────
  kernel parameter (*a, *b, n)     uniform  →    SGPR
  blockDim.x                  uniform  →    SGPR
  blockIdx.x                  uniform  →    SGPR
  threadIdx.x                 divergent →   VGPR
  a[threadIdx.x]              divergent →   VGPR
  循环count器 (uniform loop)   uniform  →    SGPR

  SGPR operatecan耗 ≈ VGPR operate 1/32(标量 vs 32 路 SIMD)`,
            caption: 'VGPR use量directly决定 Occupancy. compiler Uniformity Analysis will uniform 值allocationto SGPR(廉价), divergent 值allocationto VGPR(昂贵). 保持低 VGPR use量is GPU performanceoptimizationcore. ',
          },
          codeWalk: {
            title: 'compileroutputin VGPR/SGPR allocationreport',
            file: 'hipcc -S output — register allocation report',
            language: 'asm',
            code: `; ═══ vector_add kernel compilationoutput(gfx1102, -O2)═══

; --- 汇编instruction部分 ---
_Z10vector_addPKfS0_Pfi:
  ; kernel parameterthrough SGPR 传入(uniform)
  s_load_b64 s[0:1], s[4:5], 0x0    ; s[0:1] = &a (SGPR: pointeris uniform)
  s_load_b64 s[2:3], s[4:5], 0x8    ; s[2:3] = &b
  s_load_b64 s[6:7], s[4:5], 0x10   ; s[6:7] = &c
  s_load_b32 s8, s[4:5], 0x18       ; s8 = n

  ; computethreadglobal ID(divergent → VGPR)
  v_mov_b32_e32 v1, s8               ; 暂存 n to VGPR (in order to v_cmp)
  v_mad_u32_u24 v0, s12, v0, s13     ; v0 = blockIdx.x * blockDim.x + threadIdx.x
  ;                ^^^       ^^^
  ;              uniform   divergent → result divergent → VGPR

  ; boundarycheck
  v_cmp_lt_i32_e32 vcc_lo, v0, v1   ; v0 < n ?  (逐threadcompare)
  s_and_saveexec_b32 s9, vcc_lo      ; exec mask = vcc (disableout of boundsthread)

  ; loadingandcompute(onlyboundary内threadexecute)
  s_waitcnt lgkmcnt(0)               ; wait s_load complete
  v_lshlrev_b32_e32 v1, 2, v0       ; v1 = i * 4 (byte offset)
  global_load_b32 v2, v1, s[0:1]    ; v2 = a[i]  (VGPR: divergent)
  global_load_b32 v3, v1, s[2:3]    ; v3 = b[i]  (VGPR: divergent)
  s_waitcnt vmcnt(0)                 ; wait global_load complete
  v_add_f32_e32 v2, v2, v3          ; v2 = a[i] + b[i]
  global_store_b32 v1, v2, s[6:7]   ; c[i] = v2

  s_endpgm                           ; end kernel

; --- resourceusereport ---
; .amdhsa_next_free_vgpr 4          ← use 4 个 VGPR (v0-v3)
; .amdhsa_next_free_sgpr 14         ← use 14 个 SGPR (s0-s13)
; .amdhsa_private_segment_fixed_size 0  ← 无 spill!

; Occupancy compute: 
; VGPR: 4 → 1536/4 = 384 waves (capped at 16) → 100%
; SGPR: 14 → 512/14 = 36 waves (capped at 16) → 100%
; → 总 Occupancy = min(100%, 100%) = 100%  ★ 最优`,
            annotations: [
              's_load_b64 use SGPR storagepointer — kernel parameter对allthreadsame(uniform)',
              'v_mad_u32_u24 inputblending SGPR (s12=blockIdx) and VGPR (v0=threadIdx), resultis divergent → VGPR',
              'v_cmp_lt_i32 逐threadcompare → set vcc(向量condition码), only满足conditionthreadcontinueexecute',
              's_and_saveexec_b32 modify exec mask implementationbranch — GPU not用condition跳转, 用 mask disablethread',
              '只用 4 个 VGPR and 14 个 SGPR, Occupancy=100% — simple kernel registeruse非常少',
              '.amdhsa_private_segment_fixed_size 0 representno spill, alldatainregisterin',
            ],
            explanation: 'thiscompilationoutputdemonstratecompilerhowwill uniform data放入 SGPR(pointer, parameter, blockIdx), will divergent data放入 VGPR(threadIdx, loadingdata, computeresult). vector_add 只use 4 个 VGPR, 远低于 Occupancy 降级阈值. 这isa理想 kernel — no spill, 100% Occupancy. complex kernel  VGPR usecanexceed 100 个, 此时你need关注 Occupancy whethercan接受. ',
          },
          miniLab: {
            title: 'observe VGPR 压力对 Occupancy impact',
            objective: 'throughwrite VGPR use量different kernel, observecompilerreportregisteruse量and Occupancy 变化. ',
            steps: [
              'write simple kernel(vector_add)and complex kernel(use大量localvariable), 分别compilationas汇编',
              '对 simple kernel: grep "amdhsa_next_free_vgpr" simple.s, record VGPR count',
              '对 complex kernel: 故意create 30+ 个local float variable kernel, compilation并view VGPR use量',
              'use ROCm toolcompute Occupancy: rocm-smi --showoccupancy or手动compute 1536÷VGPR_count',
              'compilation时add -Rpass-analysis=regalloc viewregister allocation详情',
              'observe .amdhsa_private_segment_fixed_size whether > 0(represent发生 spill)',
            ],
            expectedOutput: `$ grep "amdhsa_next_free" simple.s
.amdhsa_next_free_vgpr 4     ← simple kernel: 4 VGPR, Occupancy=100%
.amdhsa_next_free_sgpr 14

$ grep "amdhsa_next_free" complex.s
.amdhsa_next_free_vgpr 168   ← complex kernel: 168 VGPR, Occupancy=56%
.amdhsa_next_free_sgpr 42

$ grep "private_segment_fixed_size" very_complex.s
.amdhsa_private_segment_fixed_size 256  ← 发生 spill!`,
            hint: 'can用 #pragma unroll and大量localvariable人as增加register压力. godbolt.org (Compiler Explorer) canin线experimentdifferentcode对 VGPR useimpact, select AMDGPU backendi.e.can. ',
          },
          debugExercise: {
            title: 'diagnose由registeroverflowcauseperformanceissue',
            language: 'c',
            description: 'below HIP kernel execute速度远低于预期. compilationreportdisplayissue线索. ',
            question: 'whythis kernel 这么慢? howoptimizationregisteruse? ',
            buggyCode: `__global__ void slow_kernel(float *data, int n) {
    int tid = threadIdx.x + blockIdx.x * blockDim.x;
    /* 大量localvariablecause高register压力 */
    float t0, t1, t2, t3, t4, t5, t6, t7;
    float t8, t9, t10, t11, t12, t13, t14, t15;
    float t16, t17, t18, t19, t20, t21, t22, t23;
    float t24, t25, t26, t27, t28, t29, t30, t31;

    t0 = data[tid]; t1 = t0*1.1; t2 = t1*1.2; t3 = t2*1.3;
    t4 = t0*2.1; t5 = t1*2.2; t6 = t2*2.3; t7 = t3*2.4;
    /* ... similar chain 对 t8-t31 赋值 ... */
    t31 = t0 + t1 + t2 + t3 + t4 + t5 + t6 + t7;
    /* note: all t variablemeanwhileactive!  */

    data[tid] = t0+t1+t2+t3+t4+t5+t6+t7+t8+t9+t10+t11
               +t12+t13+t14+t15+t16+t17+t18+t19+t20+t21
               +t22+t23+t24+t25+t26+t27+t28+t29+t30+t31;
}
/* compilerreport: 
 * .amdhsa_next_free_vgpr 196
 * .amdhsa_private_segment_fixed_size 128  ← spill!
 * Occupancy: 50% (8/16 waves)
 */`,
            hint: 'issuein于all 32 个 float localvariableinfinal求and时meanwhileactive(live), compilerunable to复用register. how重构code减少meanwhileactivevariable数? ',
            answer: 'issueanalyze: 32 个 float variable(needat least 32 个 VGPR)infinal求and点meanwhileactive, 加onaddresscomputeandinbetween值, 总 VGPR use量达to 196 个. private_segment_fixed_size=128 represent部分 VGPR by spill to scratch memory. Occupancy only 50%(8 waves), moreover spill  scratch access严重增加latency. optimizationmethod: (1) 累加器pattern — notreserveallinbetween值, 用arun累加器: float acc = 0; acc += data[tid]*1.1; acc += prev*1.2; ... 这样each time只需 2-3 个active VGPR; (2) 分组handle — will 32 个值分as 4 组, 每组 8 个, 先组内求andagain组between求and; (3) use LDS — ifmultiplethread协作handlerelateddata, willinbetweenresult放in __shared__ rather than私hasvariablein. core原则: 减少meanwhileactivevariable数(live range), letcompiler复用register. goaliswill VGPR controlin 96 以内以保持 100% Occupancy. ',
          },
          interviewQ: {
            question: 'explain AMD GPU in VGPR and SGPR difference. compilerhow决定use哪种register? VGPR use量howimpactperformance? ',
            difficulty: 'medium',
            hint: 'from uniform/divergent analyze, Occupancy compute, spill mechanism三个方面answer. 给出specific数字(RDNA3 每 CU registercount). ',
            answer: 'VGPR(Vector GPR)iseachthread私hasregister, each RDNA3 CU has 1536 个 32-bit VGPR(wave32 pattern). VGPR storage divergent data — differentthreadhasdifferent值data(如 threadIdx.x, loadingdata). SGPR(Scalar GPR)isentire Wavefront sharedregister, 每 CU has 512 个. SGPR storage uniform data — allthreadsame值(如 kernel parameter, blockDim, 循环count器). use SGPR 比 VGPR 高效 32 倍(标量operate vs 32-lane SIMD operate). compilerthrough Uniformity Analysis 确定each值property: from kernel parameter(uniform)and threadIdx(divergent)出发, 沿着data流图传播 — 任何dependency divergent 值computeresultis also divergent. VGPR use量directlyimpact Occupancy: each CU 最多 16 个 wave32, use 96 VGPR 时 1536/96=16 waves → 100%; use 192 VGPR 时 1536/192=8 waves → 50%. 低 Occupancy 减少隐藏memorylatencyability. if VGPR exceed 256 个, must spill to scratch memory(VRAM), latency增加 100 倍above. thereforeregisteroptimizationis GPU performanceoptimizationcore. ',
            amdContext: 'VGPR/SGPR and Occupancy is AMD GPU programmingbasics概念, is alsointerview必issue. demonstratedo you knowspecificregistercount(1536 VGPR/CU for RDNA3), Occupancy computemethodand spill performanceimpact, proof你hasactual GPU performanceanalyzeexperience. ',
          },
        },

        // ── Lesson 9.2.3 ──────────────────────────────────────
        {
          id: '9-2-3',
          number: '9.2.3',
          title: 'read AMDGPU ISA 汇编',
          titleEn: 'Reading AMDGPU ISA Assembly',
          duration: 15,
          difficulty: 'expert',
          tags: ['ISA', 'RDNA3', 'VOP', 'SOP', 'SMEM', 'MUBUF', 's_waitcnt', 'exec-mask'],
          concept: {
            summary: 'RDNA3 ISA instruction分asmultipleformat: VOP(向量运算), SOP(标量运算), SMEM(标量memory), MUBUF/GLOBAL(global memory), LDS(shared memory)等. understand s_waitcnt synchronization语义and v_cmp + exec mask branchmechanism, isread GPU 汇编anddebuggingcompileroutputbasics. ',
            explanation: [
              'RDNA3(gfx1102)instruction set按operatetypeand编码format分asmultiple类别. VOP(Vector Operation)instructionoperate VGPR: VOP1(单operate数, 如 v_mov_b32), VOP2(双operate数, 如 v_add_f32_e32), VOP3(三operate数 + 修饰符, 如 v_fma_f32), VOPC(compareoperate, 如 v_cmp_lt_f32, resultwrite vcc). VOP instruction名称format统一: v_<op>_<type>_e<encoding>, 如 v_add_f32_e32 represent向量浮点加法, 32 位编码. ',
              'SOP(Scalar Operation)instructionoperate SGPR: SOP1(如 s_mov_b32), SOP2(如 s_add_u32), SOPC(compare, 如 s_cmp_lt_i32), SOPP(programcontrol, 如 s_branch, s_endpgm, s_waitcnt). 标量instructionin SALU onexecute, each周期一条. important标量instructioninclude s_and_saveexec_b32(exec mask operate, used forbranch), s_cbranch_execz(if exec=0 则跳转), s_barrier(workgroup synchronization屏障). ',
              'SMEM(Scalar Memory)instruction用 SGPR storageaddress做标量memoryaccess: s_load_b32/b64/b128 frommemoryloadingto SGPR, mainused forloading kernel parameterandconstant. SMEM use lgkmcnt(LDS/GDS/Const/Msg counter)跟踪not yetcompleteoperate. GLOBAL_LOAD/GLOBAL_STORE isglobal memoryaccessinstruction, 用 VGPR 做address, resultwrite VGPR — 这is kernel in最commonmemoryoperate. global memoryoperateuse vmcnt(Vector Memory counter)跟踪. ',
              's_waitcnt is AMDGPU ISA in最importantsynchronizationinstruction. GPU memoryoperateisasynchronous — 发出 load afterwill notautomaticwaitresult. s_waitcnt vmcnt(N) wait直tonot yetcomplete向量memoryoperatecount ≤ N(vmcnt(0) = waitentirecomplete). s_waitcnt lgkmcnt(N) wait标量memoryoperate. s_waitcnt expcnt(N) wait export/GDS operate. compiler SIInsertWaitcnts Pass responsible forincorrectlocationinsert waitcnt. error waitcnt willcauseusenot yetreadydata(functionerror)or过度wait(performanceissue). ',
              'GPU branchmechanismand CPU completelydifferent. CPU usecondition跳转(if-else); GPU use exec mask 做谓词execute(predication). process: (1) v_cmp_lt_i32 vcc, v0, v1 逐threadcompare, result存入 vcc(向量condition码, 32 位 bitmask); (2) s_and_saveexec_b32 s0, vcc save旧 exec mask to s0, 新 exec = exec & vcc(only满足conditionthreadcontinue); (3) execute then branchinstruction(only exec=1 thread生效); (4) s_xor_b32 exec, exec, s0 翻转 mask execute else branch; (5) s_or_b32 exec, exec, s0 recoverraw mask. if Wavefront inallthread走同一path(uniform branch), exec not变, 无额outside开销. ',
              's_endpgm is kernel endinstruction — 告诉hardwarethis Wavefront execute完毕, release其占用registerandresource. each kernel finally一条instructionmustis s_endpgm. ',
            ],
            keyPoints: [
              'VOP instruction(v_)operate VGPR: VOP1(单operate数), VOP2(双operate数), VOP3(三operate数+修饰符), VOPC(compare→vcc)',
              'SOP instruction(s_)operate SGPR: SOP1/SOP2(算术), SOPP(control流/s_waitcnt/s_endpgm/s_barrier)',
              'SMEM(s_load_*): 标量memoryloading→SGPR, 用 lgkmcnt 跟踪; GLOBAL_LOAD: global memory→VGPR, 用 vmcnt 跟踪',
              's_waitcnt vmcnt(N)/lgkmcnt(N): waitasynchronousmemoryoperatecomplete, N=0 represententirewait',
              'exec mask branch: v_cmp→vcc + s_and_saveexec→exec mask + execute then/else + recover exec',
              's_endpgm: kernel end, release Wavefront resource(register, scheduling槽位)',
            ],
          },
          diagram: {
            title: 'RDNA3 ISA instructionformat分类',
            content: `RDNA3 (gfx1102) ISA instructionformat总览

┌──────────────────────────────────────────────────────────────┐
│  Vector Instructions (v_*) — operate VGPR, in VALU onexecute       │
│                                                               │
│  VOP1    v_<op>_e32 dst, src0        单operate数                 │
│          v_mov_b32_e32 v0, v1        copy                     │
│          v_cvt_f32_i32_e32 v0, v1    typeconvert                 │
│                                                               │
│  VOP2    v_<op>_e32 dst, src0, src1  双operate数                 │
│          v_add_f32_e32 v0, v1, v2    浮点加                   │
│          v_mul_f32_e32 v0, v1, v2    浮点乘                   │
│                                                               │
│  VOP3    v_<op>_e64 dst, src0, src1, src2  三operate数+修饰符   │
│          v_fma_f32 v0, v1, v2, v3    融合乘加 (FMA)          │
│          v_add_f32_e64 v0, |v1|, -v2 support abs/neg 修饰符    │
│                                                               │
│  VOPC    v_cmp_<cc>_<type> vcc, src0, src1  compare→vcc         │
│          v_cmp_lt_f32_e32 vcc_lo, v0, v1  逐threadcompare         │
│                                                               │
│  VINTERP v_interp_p1/p2_f32         像素插值(graphics)         │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│  Scalar Instructions (s_*) — operate SGPR, in SALU onexecute       │
│                                                               │
│  SOP1    s_mov_b32 s0, s1            标量copy                 │
│  SOP2    s_add_u32 s0, s1, s2        标量加法                 │
│  SOPP    s_waitcnt vmcnt(0)          waitmemoryoperate             │
│          s_barrier                   workgroup synchronization           │
│          s_branch <label>            无condition跳转               │
│          s_cbranch_execz <label>     exec=0 时跳转            │
│          s_endpgm                    kernel end              │
│  SOPK    s_movk_i32 s0, 0x100       16-bit 立i.e.数            │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│  Memory Instructions — global/标量/local memoryaccess                 │
│                                                               │
│  SMEM    s_load_b32 s0, s[2:3], off  标量memoryloading→SGPR       │
│          s_load_b128 s[0:3], ...     loading 128-bit (4 dword)  │
│          → use lgkmcnt 跟踪                                 │
│                                                               │
│  GLOBAL  global_load_b32 v0, v1, s[0:1]   globalloading→VGPR     │
│          global_store_b32 v0, v1, s[0:1]  globalstorage            │
│          → use vmcnt 跟踪                                   │
│                                                               │
│  LDS     ds_read_b32 v0, v1          LDS read                │
│          ds_write_b32 v0, v1         LDS write                │
│          → use lgkmcnt 跟踪                                 │
│                                                               │
│  SCRATCH scratch_load_b32 v0, off    scratch (spill) read    │
│          scratch_store_b32 off, v0   scratch (spill) write    │
└──────────────────────────────────────────────────────────────┘

s_waitcnt synchronization语义: 
  vmcnt   — 跟踪 global_load/store(向量memory)
  lgkmcnt — 跟踪 s_load/ds_read/ds_write(标量memory/LDS)
  expcnt  — 跟踪 export/GDS`,
            caption: 'RDNA3 ISA instruction按execute单元andfunction分类. v_ before缀is向量instruction(VALU), s_ before缀is标量instruction(SALU), global_/ds_/scratch_ ismemoryinstruction. understandthese分类isread GPU 汇编basics. ',
          },
          codeWalk: {
            title: '标注 vector_add ISA 汇编(gfx1102 RDNA3)',
            file: 'vector_add.s — hipcc -S -O2 --offload-arch=gfx1102 output',
            language: 'asm',
            code: `; ═══ vector_add kernel: c[i] = a[i] + b[i] ═══
; Target: gfx1102 (RDNA3, Navi33, RX 7600 XT)

        .text
        .globl  _Z10vector_addPKfS0_Pfi
        .p2align 8                          ; 256-byte alignment (hardwareto求)
_Z10vector_addPKfS0_Pfi:

; ── Kernel Prolog: loadingparameterandcomputethread ID ──

        ; SGPR 初始state (hardware填充):
        ;   s[4:5] = kernarg_segment 基address (指向 kernel parameter)
        ;   s12 = workgroup_id_x (= blockIdx.x)

        ; loading kernel parameter: *a, *b, *c, n (from kernarg segment)
        s_load_b64  s[0:1], s[4:5], 0x0    ; s[0:1] = a  (64-bit ptr)
        s_load_b64  s[2:3], s[4:5], 0x8    ; s[2:3] = b
        s_load_b64  s[6:7], s[4:5], 0x10   ; s[6:7] = c
        s_load_b32  s8, s[4:5], 0x18       ; s8 = n
        ;           ↑ SMEM instruction, asynchronousexecute, use lgkmcnt 跟踪

        ; compute i = blockIdx.x * blockDim.x + threadIdx.x
        ; v0 = threadIdx.x (hardware填充, 每threaddifferent → VGPR)
        ; s12 = blockIdx.x (hardware填充, entire workgroup same → SGPR)
        s_lshl_b32  s9, s12, 8             ; s9 = blockIdx.x << 8
        ;           假设 blockDim.x=256, i.e. blockIdx.x * 256
        v_add_nc_u32 v0, s9, v0            ; v0 = s9 + threadIdx.x = global i
        ;            ↑ VGPR + SGPR blendingoperate, result放 VGPR (divergent)

; ── boundarycheck: if (i < n) ──

        s_waitcnt   lgkmcnt(0)             ; wait s_load entirecomplete
        ;           ↑ must等 s8(n) loading完only thencancompare
        v_cmp_lt_i32_e32 vcc_lo, v0, s8    ; 逐thread: v0 < n ?
        ;                ↑ eachthreadindependentcompare, result汇聚to vcc (32-bit mask)
        s_and_saveexec_b32 s9, vcc_lo      ; save旧 exec→s9
        ;                                    新 exec = exec & vcc
        ;                                    out of boundsthreadbydisable (mask=0)
        s_cbranch_execz .Lexit             ; ifallthreadallout of bounds→跳toend

; ── corecompute: c[i] = a[i] + b[i] ──

        ; computebytesoffset: byte_offset = i * 4
        v_lshlrev_b32_e32 v3, 2, v0       ; v3 = v0 << 2 = i * 4

        ; loading a[i] and b[i]
        global_load_b32 v1, v3, s[0:1]    ; v1 = *(a + byte_offset)
        global_load_b32 v2, v3, s[2:3]    ; v2 = *(b + byte_offset)
        ;               ↑ asynchronousglobal memoryread, use vmcnt 跟踪

        ; waittwo load complete
        s_waitcnt   vmcnt(0)               ; vmcnt=0: waitall global_load
        ;           ↑ no这条instruction, v1/v2 mayis垃圾值! 

        ; 浮点加法
        v_add_f32_e32 v1, v1, v2           ; v1 = a[i] + b[i]
        ;             ↑ VALU instruction, 32 个threadmeanwhileexecute

        ; storage c[i]
        global_store_b32 v3, v1, s[6:7]   ; *(c + byte_offset) = v1

.Lexit:
        s_endpgm                            ; kernel end, release wave resource

; ── 元data ──
.amdhsa_kernel _Z10vector_addPKfS0_Pfi
  .amdhsa_next_free_vgpr 4                 ; use 4 个 VGPR (v0-v3)
  .amdhsa_next_free_sgpr 14                ; use 14 个 SGPR
  .amdhsa_private_segment_fixed_size 0     ; 无 scratch/spill
  .amdhsa_group_segment_fixed_size 0       ; 无 LDS use
  .amdhsa_float_denorm_mode_32 3           ; FP32 denorm enable
  .amdhsa_wavefront_size32 1               ; wave32 pattern
.end_amdhsa_kernel`,
            annotations: [
              's_load_b64 from kernarg segment loadingparameter — allparameter对allthreadsame, 放in SGPR in',
              'v0 in kernel entry point由hardwareautomatic填充as threadIdx.x — eachthreaddifferent, 天然in VGPR in',
              's_waitcnt lgkmcnt(0) wait s_load complete; s_waitcnt vmcnt(0) wait global_load complete — 两种differentcount器',
              'v_cmp → vcc → s_and_saveexec is GPU implementation if branchstandardpattern(exec mask predication)',
              's_cbranch_execz optimization: ifentire wave allout of bounds, directly跳toend, notexecute load/compute',
              '.amdhsa_kernel 元data段告诉run时howallocationresource — VGPR/SGPR count决定 Occupancy',
            ],
            explanation: 'this标注汇编is vector_add in gfx1102 oncompletecompilationoutput. 每条instructionallhas明确目: s_load loadingparameter, v_cmp+exec mask 做boundarycheck, global_load 取data, v_add_f32 做compute, global_store 写result, s_endpgm end. keysynchronization点istwo s_waitcnt — 分别wait标量and向量memoryoperate. 读懂这样汇编is做 GPU performanceoptimizationandcompilerdebuggingcoreskill. ',
          },
          miniLab: {
            title: '手动标注 AMDGPU ISA 汇编',
            objective: 'compilationa稍complex kernel, independentread并标注每条汇编instructionfunction, verify你对 ISA understand. ',
            steps: [
              'writeacontainconditionbranchand乘法 kernel: if (i < n) c[i] = a[i] * b[i] + a[i]',
              'compilationas汇编: hipcc -S -O2 --offload-arch=gfx1102 kernel.hip -o kernel.s',
              'in kernel.s infind kernel function, 逐行标注每条instructionfunction',
              'markall s_waitcnt instruction, explainwhyneedinthatlocationwait',
              'find exec mask operate(s_and_saveexec, s_cbranch_execz 等), 画出control流图',
              'record VGPR/SGPR usereport, compute理论 Occupancy',
            ],
            expectedOutput: `标注example: 
  s_load_b64 s[0:1], s[4:5], 0x0   ; [SMEM] loading kernel arg: ptr a
  s_waitcnt lgkmcnt(0)              ; [SYNC] waitall scalar loads
  v_cmp_lt_i32 vcc_lo, v0, s8      ; [VOPC] boundarycheck: tid < n?
  v_fma_f32 v1, v2, v3, v2         ; [VOP3] fused multiply-add: a*b+a

VGPR: 5, SGPR: 16 → Occupancy: 100%`,
            hint: '查阅 AMD "RDNA3 Instruction Set Architecture" 官方文档(in GPUOpen 网站canbelow载)get每条instruction精确语义. 搜索 "RDNA3 ISA Reference Guide" i.e.canfind. ',
          },
          debugExercise: {
            title: 'find ISA 汇编in exec mask error',
            language: 'asm',
            description: 'below汇编implementationa if-else branch, 但 exec mask operatehaserror, cause else branchthreadnocorrectexecute. ',
            question: '哪条 exec mask operateiserror? correctshouldiswhat? ',
            buggyCode: `; if (v0 < v1) { v2 = 1.0; } else { v2 = 0.0; }
v_cmp_lt_f32_e32 vcc_lo, v0, v1     ; compare v0 < v1 → vcc
s_and_saveexec_b32 s0, vcc_lo       ; exec = exec & vcc (then branch)
                                     ; s0 = 旧 exec (save)
; ── then branch: 满足conditionthread ──
v_mov_b32_e32 v2, 1.0               ; v2 = 1.0

; ── else branch: not满足conditionthread ──
s_or_b32 exec_lo, exec_lo, s0       ; BUG! 这insideshould翻转 mask
v_mov_b32_e32 v2, 0.0               ; v2 = 0.0  (但allthreadallexecute!)

; ── recover exec ──
s_or_b32 exec_lo, exec_lo, s0       ; recovercomplete exec`,
            hint: '进入 else branchbefore, needwill exec mask 翻转as "then noexecutethread". s_or_b32 ismergeoperate, is not翻转. should用whatoperate? ',
            answer: 'BUG: else branchentry pointshould用 s_xor_b32 exec_lo, exec_lo, s0 而is not s_or_b32. s_or_b32 will s0(旧complete exec)andcurrent exec OR, resultisallthreadallenable — 这cause then and else codeallbyallthreadexecute. correctpattern: (1) s_and_saveexec_b32 s0, vcc → then threadexecute, s0=raw exec; (2) execute then branch; (3) s_xor_b32 exec_lo, exec_lo, s0 → exec = rawexec XOR currentexec = else thread; (4) execute else branch; (5) s_or_b32 exec_lo, exec_lo, s0 → recoverraw exec(merge then and else thread). XOR operatewill mask 翻转as"then innoexecutethread", 这正is else branchneedthread集合. 这is AMDGPU implementation if-else standard exec mask protocol. ',
          },
          interviewQ: {
            question: 'explain AMDGPU ISA in s_waitcnt instruction作用. vmcnt and lgkmcnt 分别跟踪what? if省略 s_waitcnt will发生what? ',
            difficulty: 'hard',
            hint: 'from GPU memoryoperateasynchronousfeature出发. explain两种count器跟踪operatetype, and省略 waitcnt function性andperformanceimpact. ',
            answer: 's_waitcnt is AMDGPU memorysynchronizationinstruction, ensureasynchronousmemoryoperateinuseresultbeforecomplete. GPU memoryoperateisasynchronous — 发出 load requestafter GPU continueexecuteafter续instruction, will notautomaticwaitresult. vmcnt(Vector Memory Count)跟踪not yetcomplete向量memoryoperate(global_load, global_store, buffer_load 等), theseoperateaccess VRAM orsystem memory. lgkmcnt(LDS/GDS/Const/Msg Count)跟踪not yetcomplete标量memoryoperate(s_load)and LDS operate(ds_read/ds_write). s_waitcnt vmcnt(N) wait直tonot yetcomplete向量memoryoperate数 ≤ N; vmcnt(0) 等entirecomplete. s_waitcnt lgkmcnt(0) 等entire标量/LDS operatecomplete. 省略 s_waitcnt after果: (1) functionerror — usenot yetreadyregister值, 得to随机旧data; (2) 难以debugging — erroris非确定性, 取决于memorylatency(has时correcthas时error); (3) maybetween歇性correct — if恰好otherinstructionprovide足够latencylet load complete. performanceoptimization角度: 精确 waitcnt 比 waitcnt(0) 好 — for examplecontiguoustwo load after只需等第aresult, can用 vmcnt(1) rather than vmcnt(0), let第二个 load continuetransfer. LLVM  SIInsertWaitcnts Pass responsible forinsert最优 waitcnt 值. ',
            amdContext: 's_waitcnt is AMDGPU hardwareengineerandcompilerengineerallmust深刻understandmechanism. interviewincanexplain vmcnt and lgkmcnt difference, 精确 waitcnt performanceimpact, indicate你understand GPU asynchronousmemory模型深layermechanism. ',
          },
        },
      ],
    },
  ],
  completionChecklist: [
    'understand LLVM 三段式architecture(frontend→in端→backend)and LLVM IR 作asgeneralintermediate representationcoredesign',
    'canuse hipcc generate LLVM IR (.ll) and AMDGPU 汇编 (.s), understand每一步compilationprocess',
    'master SSA 形式and phi node概念, canreadandanalyze LLVM IR code',
    '解 AMDGPU backend Pass pipeline: ISel → RegAlloc → Scheduling → MC Emit',
    'understand VGPR/SGPR difference, Uniformity Analysis, and VGPR use量对 Occupancy impact',
    'canread RDNA3 ISA 汇编: VOP/SOP/SMEM/GLOBAL instructionformat, s_waitcnt synchronization, exec mask branch',
  ],
};
