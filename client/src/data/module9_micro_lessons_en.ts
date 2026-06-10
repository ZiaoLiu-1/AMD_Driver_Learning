// ============================================================
// AMD Linux Driver Learning Platform - Module 9 Micro-Lessons (English)
// Module 9: GPU Toolchain & LLVM
// 5 lessons in 2 groups, ~15 min each, total ~75 min
// ============================================================
import type { MicroLessonModule } from './micro_lesson_types';

export const module9MicroLessonsEn: MicroLessonModule = {
  moduleId: 'llvm',
  groups: [
    // ════════════════════════════════════════════════════════════
    // Group 9.1: LLVM Compiler Framework
    // ════════════════════════════════════════════════════════════
    {
      id: '9-1',
      number: '9.1',
      title: 'LLVM compiler framework',
      titleEn: 'LLVM Compiler Framework',
      icon: '🏗️',
      description: 'Understand LLVM\'s three-stage architecture - front-end, mid-end optimization, back-end - and the core design idea of ​​LLVM IR as a universal intermediate representation. Understanding the SSA form and IR syntax is fundamental to reading GPU compiler output.',
      lessons: [
        // ── Lesson 9.1.1 ──────────────────────────────────────
        {
          id: '9-1-1',
          number: '9.1.1',
          title: 'LLVM three-stage architecture: front-end → mid-end → back-end',
          titleEn: 'LLVM Three-Phase Architecture: Frontend → Optimizer → Backend',
          duration: 15,
          difficulty: 'advanced',
          tags: ['LLVM', 'compiler', 'Clang', 'HIP', 'pass-pipeline'],
          concept: {
            summary: 'LLVM adopts a classic three-stage compiler architecture: the front-end (Frontend) translates different languages ​​into a unified LLVM IR; the middle-end (Middle-end) performs hundreds of optimization passes on the IR; the back-end (Backend) compiles the optimized IR into machine code for the target platform. The AMDGPU backend is one of the most complex backends in LLVM and is responsible for compiling LLVM IR to GCN/RDNA ISA.',
            explanation: [
              'Traditional compilers (such as early GCC) tightly coupled front-end parsing, optimization and code generation. If you want to support M languages ​​and N target platforms, theoretically you need M×N compilers. The core innovation of LLVM is the introduction of a general-purpose intermediate representation - LLVM IR. The front-end only needs to translate the source language into LLVM IR (M front-ends), and the back-end only needs to translate LLVM IR into target machine code (N back-ends). All optimizations are performed at the LLVM IR level and are shared. This reduces the M×N problem to M+N.',
              'For AMD GPU compilation, the front end is Clang. The HIP code (__global__ void kernel(...)) is first parsed by Clang into an AST (Abstract Syntax Tree), and then Clang CodeGen reduces the AST to an LLVM IR. Clang needs to recognize GPU-specific semantics—for example, the __global__ attribute becomes the amdgpu_kernel calling convention, and threadIdx.x becomes a call to the built-in function llvm.amdgcn.workitem.id.x. The compilation path of OpenCL is similar, but the front-end syntax processing is different.',
              'At the mid-range is LLVM\'s Pass Manager, which optimizes IR by executing hundreds of passes in sequence. Common Passes include mem2reg (promote variables in memory to SSA registers), instcombine (algebraic simplification), loop-unroll (loop unrolling), inline (function inlining), etc. There are also AMDGPU-specific Passes, such as amdgpu-promote-alloca (promotes stack allocation to LDS or registers), amdgpu-lower-kernel-arguments (lowers kernel parameter passing). The execution order of these passes is controlled by PassBuilder. Wrong order may cause optimization failure or even generate error code.',
              'The backend is AMDGPU Target, which compiles optimized LLVM IR to AMDGPU ISA machine code. Back-end process: SelectionDAG (convert IR to DAG and perform instruction selection) → MachineInstr (machine instruction representation) → Register Allocation (register allocation) → Instruction Scheduling (instruction scheduling) → MC Layer (encoded into binary machine code). The final output is a .hsaco file (a GPU executable in ELF format) containing GPU machine code, metadata, and resource usage information.',
              'hipcc is the entrance to the HIP compilation tool chain. When hipcc vector_add.hip is executed, the actual steps that occur are: (1) hipcc calls the Clang front-end to compile the device code, and the target triple is set to amdgcn-amd-amdhsa; (2) Clang generates the LLVM IR with the amdgpu_kernel annotation; (3) the LLVM mid-end executes the optimized Pass sequence; (4) the AMDGPU backend compiles the IR to the target GPU (such as gfx1102 Corresponding to RX 7600 XT, gfx1100 corresponds to RX 7900 XTX, gfx1030 corresponds to RX 6800 XT) machine code; (5) Clang front-end compiles host code at the same time (target triple is x86_64); (6) clang-offload-bundler packages device code and host code into fat binary. Understanding this complete process is the basis for debugging compiler problems and performing performance optimization.',
            ],
            keyPoints: [
              'LLVM three-stage: front-end (Clang) → middle-end (Pass Manager) → back-end (AMDGPU Target), decoupled through LLVM IR',
              'The front end is responsible for language specific parsing: HIP __global__ → amdgpu_kernel, threadIdx.x → llvm.amdgcn.workitem.id.x',
              'Mid-range performs hundreds of optimizations Pass: Universal (mem2reg/inline/loop-unroll) + AMDGPU-specific (promote-alloca)',
              'Back-end process: SelectionDAG → MachineInstr → RegAlloc → Scheduling → MC emit',
              'hipcc complete chain: HIP → Clang → LLVM IR → AMDGPU backend → .hsaco (ELF GPU binary)',
              'M+N design: M language front-ends + N back-ends share the same set of IR and optimization, eliminating the M×N problem',
            ],
          },
          diagram: {
            title: 'hipcc compilation process: from HIP source code to GPU executable file',
            content: `hipcc compilation process panorama

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
Device code compilation Host code compilation │
   target:           target:                 │
   amdgcn-amd-       x86_64-linux-           │
   amdhsa            gnu                     │
          │               │                  │
          ▼               │                  │
   ┌─────────────┐        │                  │
│ Clang front-end │ │ │
   │ AST → IR     │        │                  │
   │ __global__ → │        │                  │
   │ amdgpu_kernel│        │                  │
   └──────┬──────┘        │                  │
          ▼               │                  │
   ┌─────────────┐        │                  │
│ LLVM Midrange │ │ │
│ Optimization Passes │ │ │
   │ mem2reg      │        │                  │
   │ instcombine  │        │                  │
   │ loop-unroll  │        │                  │
   │ promote-     │        │                  │
   │   alloca     │        │                  │
   └──────┬──────┘        │                  │
          ▼               │                  │
   ┌─────────────┐        │                  │
│ AMDGPU backend │ │ │
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

View the output of each step:
hipcc -E vector_add.hip → preprocessing
  hipcc -S -emit-llvm ...    → LLVM IR (.ll)
hipcc -S ... → AMDGPU assembly (.s)
  hipcc     vector_add.hip   → fat binary`,
            caption: 'hipcc compiles the HIP source code into device code (AMDGPU ISA) and host code (x86) at the same time, and finally packages it into fat binary through offload-bundler. The entire process is transparent to the user, but understanding each step is critical to debugging compiler issues.',
          },
          codeWalk: {
            title: 'hipcc compilation pipeline: from HIP to LLVM IR to AMDGPU ISA',
            file: 'terminal — hipcc compilation pipeline',
            language: 'bash',
            code: `#── Step 1: Write the simplest HIP kernel ──
cat > vector_add.hip << 'EOF'
#include <hip/hip_runtime.h>

__global__ void vector_add(const float *a,
                           const float *b,
                           float *c, int n) {
    int i = blockIdx.x * blockDim.x + threadIdx.x;
    if (i < n) c[i] = a[i] + b[i];
}
EOF

#── Step 2: View the Clang command actually called by hipcc ──
hipcc -v vector_add.hip -c 2>&1 | grep "clang.*amdgcn"
#The output is similar to:
# "/opt/rocm/llvm/bin/clang" -cc1 -triple amdgcn-amd-amdhsa
#   -target-cpu gfx1102 -emit-llvm-bc ...

#── Step 3: Generate LLVM IR (human-readable .ll format)──
hipcc -S -emit-llvm --offload-arch=gfx1102 \\
      vector_add.hip -o vector_add.ll
#Check out the key sections:
grep -A 5 "define amdgpu_kernel" vector_add.ll
# define amdgpu_kernel void @_Z10vector_addPKfS0_Pfi(
#   ptr addrspace(1) %a,       ← addrspace(1) = global memory
#   ptr addrspace(1) %b,
#   ptr addrspace(1) %c,
#   i32 %n) #0 {

#── Step 4: Generate AMDGPU assembly (.s format)──
hipcc -S --offload-arch=gfx1102 \\
      vector_add.hip -o vector_add.s
#View ISA instructions:
grep -E "v_add|s_load|global_load|s_waitcnt" vector_add.s
#global_load_b32 v1, v0, s[4:5] ← Load a[i] from global memory
#global_load_b32 v2, v0, s[6:7] ← Load b[i] from global memory
# v_add_f32_e32 v1, v1, v2         ← VALU: v1 = a[i] + b[i]
#global_store_b32 v0, v1, s[8:9] ← write back c[i]

#── Step 5: Check how many registers the compiler uses ──
grep -E "NumSgprs|NumVgprs|ScratchSize" vector_add.s
#.amdhsa_next_free_vgpr 3 ← Use 3 VGPRs
#.amdhsa_next_free_sgpr 16 ← Use 16 SGPRs
#.amdhsa_private_segment_fixed_size 0 ← No stack overflow`,
            annotations: [
              'hipcc -v displays the actual clang command line, -triple amdgcn-amd-amdhsa specifies the GPU target',
              '-target-cpu gfx1102 corresponds to RX 7600 XT (RDNA3 Navi33); other GPUs use the corresponding gfx version number (can be viewed through rocminfo)',
              'The amdgpu_kernel calling convention in LLVM IR tells the backend that this is the GPU kernel entry',
              'addrspace(1) is the global memory address space number of AMDGPU, 0=private, 3=LDS, 4=constant',
              'v_add_f32_e32 is the vector floating point addition instruction of RDNA3, _e32 represents the 32-bit encoding format',
              'NumVgprs/NumSgprs is the compiler\'s register usage report, which directly affects GPU occupancy (Occupancy)',
            ],
            explanation: 'This complete compilation pipeline shows how hipcc gradually reduces HIP source code to GPU machine code. Key observation: A simple c[i]=a[i]+b[i] operation, which is the SSA instruction sequence load→load→fadd→store at the LLVM IR level, becomes global_load→global_load→v_add_f32→global_store at the ISA level. Understanding this correspondence is fundamental to performance optimization - you can see what the compiler does and doesn\'t do.',
          },
          miniLab: {
            title: 'Track the complete compilation process of the HIP program',
            objective: 'Hands-on each compilation stage of hipcc and observe how the HIP code is gradually transformed into GPU machine code.',
            setup: `#Make sure ROCm and hipcc are installed
which hipcc || echo "Please install ROCm first: https://rocm.docs.amd.com"
hipcc --version`,
            steps: [
              'Write vector_add.hip (the code in the above Code Walk) and save it to the working directory',
              'Generate the preprocessed code: hipcc -E vector_add.hip -o vector_add.i, search for the vector_add function to see what the HIP macro looks like after it is expanded',
              'Generate LLVM IR: hipcc -S -emit-llvm --offload-arch=gfx1102 vector_add.hip -o vector_add.ll, read the functions starting with define amdgpu_kernel',
              'Generate optimized IR: hipcc -S -emit-llvm -O3 --offload-arch=gfx1102 vector_add.hip -o vector_add_opt.ll, compare the IR difference between -O0 and -O3',
              'Generate AMDGPU assembly: hipcc -S -O3 --offload-arch=gfx1102 vector_add.hip -o vector_add.s, count the number of VGPR/SGPR used',
              'Compile into an executable file: hipcc vector_add.hip -o vector_add --offload-arch=gfx1102, use llvm-objdump --disassemble-all vector_add to view the embedded GPU code',
            ],
            expectedOutput: `$ wc -l vector_add.ll vector_add_opt.ll vector_add.s
  45 vector_add.ll       ←Unoptimized IR (~45 lines)
  28 vector_add_opt.ll   ←Optimized IR is shorter (optimizer eliminates redundant instructions)
  85 vector_add.s        ←AMDGPU assembly (including metadata and instructions)

$ grep "amdhsa_next_free" vector_add.s
.amdhsa_next_free_vgpr 3
.amdhsa_next_free_sgpr 16`,
            hint: 'If you don\'t have an AMD GPU, you can cross-compile with --offload-arch=gfx900 (Vega) or gfx1030 (RDNA2). No physical GPU is required for compilation, only for running. AMDGPU compilation output can also be viewed online using godbolt.org (Compiler Explorer).',
          },
          debugExercise: {
            title: 'Diagnosing hipcc compilation errors',
            language: 'c',
            description: 'The following HIP code compiles with an error. Find out the cause of the error and fix it.',
            question: 'Why does this code fail when compiled with hipcc? From which stage of the compilation pipeline does the error come?',
            buggyCode: `#include <hip/hip_runtime.h>

__global__ void broken_kernel(float *out, int n) {
    int tid = threadIdx.x;
    /*Try using printf in the GPU kernel to print the values ​​of all threads */
    float local_array[1024];  /*BUG: Huge stack allocation*/
    for (int i = 0; i < 1024; i++)
        local_array[i] = tid * i;
    float sum = 0;
    for (int i = 0; i < 1024; i++)
        sum += local_array[i];
    out[tid] = sum;
}

/*Compile report:
 * warning: register pressure too high;
 * NumVgprs: 258 (exceeds 256 limit)
 * ScratchSize: 4096  ← spill to scratch memory
 */`,
            hint: 'The total number of VGPRs per CU is limited, and if too many VGPRs are used per Wavefront, the GPU can only run few Wavefronts simultaneously (low Occupancy). What does a stack allocation of 1024 floats mean to the GPU?',
            answer: 'Problem: A local array of 1024 floats (4KB) is allocated in the GPU kernel, which is far more than the register space available to a single thread. On RDNA3, a single wave can address at most 256 VGPRs (each VGPR is 32 bits). A 1024-element private array means each lane needs about 1024 VGPRs, far exceeding the 256-per-wave addressing limit. The compiler is forced to spill most of the data to scratch memory (GPU\'s stack memory, located in VRAM), resulting in: (1) ScratchSize is non-zero, indicating that a register overflow has occurred; (2) performance drops sharply - scratch access latency is more than 100 times that of registers; (3) Occupancy is reduced to a minimum because the scratch buffer also takes up resources. This issue is exposed in the register allocation phase of the LLVM AMDGPU backend. Fix: Use __shared__ (LDS) instead of large arrays, or use loop block processing to avoid allocating large arrays at once. In GPU programming, private arrays should be kept small (<16 elements) to ensure that the compiler can fit it entirely into a register.',
          },
          interviewQ: {
            question: 'Describe LLVM\'s three-stage architecture and its core design philosophy. Why AMD GPU compiler chooses to be based on LLVM?',
            difficulty: 'medium',
            hint: 'Answered from the perspective of M×N problem, IR as universal intermediate representation, Pass reuse. What are the benefits of the LLVM ecosystem for AMD?',
            answer: 'LLVM\'s three-stage architecture divides the compiler into front-end, middle-end and back-end, which are decoupled through a unified LLVM IR (Intermediate Representation). The front-end compiles different languages ​​(C/C++/HIP/OpenCL/GLSL) into LLVM IR, the mid-end performs hundreds of optimization passes on the IR (generic optimizations like inline/GVN/LICM + target-specific optimizations like amdgpu-promote-alloca), and the back-end reduces the optimized IR to target machine code. This design reduces the M×N problem of M languages ​​× N backends to M+N. The reasons why AMD chose LLVM: (1) Mature optimization framework - hundreds of proven optimization passes can be reused directly, and AMD only needs to develop AMDGPU-specific backends and a small number of specific passes; (2) Multi-language support - the same AMDGPU backend serves multiple front-ends such as HIP, OpenCL, Vulkan SPIR-V, ROCm, etc.; (3) Community and ecology - the LLVM community is active, and engineers from the AMD Toolchain team (such as Matt Arsenault, Jay Foad) are LLVM core contributors, and code review and maintenance costs are shared by the community; (4) Consistency with the ROCm ecosystem - the ROCm full stack is based on LLVM/Clang, from the compiler to the debugger (LLDB) to the profiler (rocprof), all under the same framework.',
            amdContext: 'AMD Markham\'s Toolchain team is the core maintainer of the LLVM AMDGPU backend. Demonstrating during the interview that you understand the LLVM architecture and the design of the AMD GPU backend, as well as the strategic significance of AMD\'s choice of LLVM, will show a deep understanding of the work of this team.',
          },
        },

        // ── Lesson 9.1.2 ──────────────────────────────────────
        {
          id: '9-1-2',
          number: '9.1.2',
          title: 'LLVM IR and SSA forms',
          titleEn: 'LLVM IR and SSA Form',
          duration: 15,
          difficulty: 'advanced',
          tags: ['LLVM-IR', 'SSA', 'phi-node', 'basic-block', 'amdgpu_kernel'],
          concept: {
            summary: 'LLVM IR is a strongly typed, SSA (Static Single Assignment) form of intermediate representation. Each variable is assigned a value only once, and the control flow merge point uses the phi node to select the value. AMDGPU-specific IR features include amdgpu_kernel calling convention and address space annotation (addrspace).',
            explanation: [
              'LLVM IR is a common language between the compiler mid-end and back-end. It has three equivalent representations: human-readable text format (.ll file), compact binary format (.bc file, i.e. bitcode), and in-memory C++ objects (llvm::Module/Function/Instruction, etc.). The three forms are completely equivalent and can be converted into each other. For learning and debugging, we mainly use the .ll text format.',
              'SSA (Static Single Assignment) is the core feature of LLVM IR: each virtual register (starting with %) is defined (assigned) only once. For example, %sum = fadd float %a, %b defines %sum, and no new value can be assigned to %sum later. If a variable in the source code is assigned multiple times (such as x = x + 1), the SSA form will create a new version (%x.1 = add i32 %x.0, 1). The advantage of SSA is that it greatly simplifies data flow analysis - the definition point of each value is unique, and the use-def chain can be established directly.',
              'When two control flow paths are merged, SSA requires the value of the phi node to choose which path to use. For example, in the if-else statement, x is assigned different values ​​in the two branches, and the merge point requires %x.merge = phi i32 [%x.then, %bb.then], [%x.else, %bb.else]. The phi directive selects a value based on the control flow source - %x.then if arrived from %bb.then, or %x.else if arrived from %bb.else. The phi node is the core mechanism of SSA, which allows expressing control flow dependent values ​​while maintaining "each variable is assigned a value only once".',
              'The basic structural unit of LLVM IR is Basic Block: a sequence of instructions that are executed sequentially, starting with label and ending with terminator instructions (br/ret/switch). Functions are a collection of Basic Blocks, and modules are a collection of functions. Key instruction types: arithmetic (add/fadd/mul), memory (load/store/alloca), control flow (br/ret/phi), type conversion (bitcast/zext/trunc), call (call), GEP (getelementptr - array/structure address calculation).',
              'For AMDGPU, IR has several important special annotations: (1) amdgpu_kernel calling convention - marks this as a GPU kernel entry function, and the backend will generate a special prolog for it (loading kernel arguments, setting workgroup info, etc.); (2) addrspace address space annotation - addrspace(0)=private (per-thread stack), addrspace(1)=global (global memory/VRAM), addrspace(3)=local (LDS, workgroup) shared), addrspace(4)=constant (read-only constant memory); (3) llvm.amdgcn.* built-in functions - such as llvm.amdgcn.workitem.id.x (get thread ID), llvm.amdgcn.s.barrier (synchronization barrier). These annotations let the backend know how to generate correct memory access instructions and address calculations.',
              'Understanding LLVM IR is fundamental to reading compiler output and diagnosing optimization problems. When you notice poor GPU kernel performance, the first step is usually hipcc -S -emit-llvm to look at the IR - to see if the optimizer successfully eliminated redundant calculations, unrolled loops correctly, and transformed memory operations into more efficient forms. Issues at the IR level are easier to understand and address than at the ISA level.',
            ],
            keyPoints: [
              'LLVM IR has three forms: .ll (text), .bc (bitcode binary), memory object - completely equivalent and mutually convertible',
              'SSA form: each % variable is defined only once, simplifying data flow analysis and optimization',
              'The phi node selects values ​​at the control flow merge point: phi i32 [%val.then, %bb.then], [%val.else, %bb.else]',
              'Basic Block: a linear sequence of instructions starting with label and ending with terminator',
              'AMDGPU specific: amdgpu_kernel calling convention, addrspace(0/1/3/4) address space, llvm.amdgcn.* intrinsics',
              'Key instructions: load/store (memory), getelementptr (address calculation), fadd/fmul (arithmetic), br/phi (control flow)',
            ],
          },
          diagram: {
            title: 'SSA form and phi node in LLVM IR',
            content: `From C code to LLVM IR SSA form

── Source code (conditional branch in HIP kernel)──

  float result;
  if (tid < n) {
      result = a[tid] + b[tid];    //then branch
  } else {
      result = 0.0f;               //else branch
  }
  out[tid] = result;               //Use merged value


── Compile to LLVM IR (SSA form) ──

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
%ptr.a = getelementptr float, ; calculate &a[tid]
              ptr addrspace(1) %a, i32 %tid
%val.a = load float, ; load a[tid]
              ptr addrspace(1) %ptr.a
%ptr.b = getelementptr float, ; calculate &b[tid]
              ptr addrspace(1) %b, i32 %tid
%val.b = load float, ; load b[tid]
              ptr addrspace(1) %ptr.b
    %sum = fadd float %val.a, %val.b  ; a[tid] + b[tid]
    br label %bb.merge              ; ← terminator: unconditional branch

  bb.else:                          ; ← Basic Block: else
    br label %bb.merge

  bb.merge:                         ; ←Basic Block: merge (merge point)
%result = phi float ; ★ PHI node ★
[ %sum, %bb.then ], ; from then → use %sum
[ 0.0, %bb.else ] ; from else → use 0.0
    %ptr.out = getelementptr float,
              ptr addrspace(1) %out, i32 %tid
    store float %result,            ; out[tid] = result
              ptr addrspace(1) %ptr.out
    ret void
  }

Note the SSA property: each % variable is assigned only once
%tid = call ... (defined once)
%val.a = load ... (defined once)
%sum = fadd ... (defined once)
%result = phi ... (defined once, but value depends on source path)`,
            caption: 'Each variable in the SSA form is defined only once. The phi node is the core mechanism by which SSA handles control flow merging - it does not generate any machine instructions, but rather tells the register allocator to choose the correct value at the merge point. Note the AMDGPU-specific amdgpu_kernel and addrspace(1) annotations.',
          },
          codeWalk: {
            title: 'vector_add compiled to LLVM IR: fully annotated',
            file: 'vector_add.ll — hipcc -S -emit-llvm -O2 output',
            language: 'llvm',
            code: `; ModuleID = 'vector_add.hip'
target datalayout = "e-p:64:64-p1:64:64-p2:32:32-p3:32:32-p4:64:64-p5:32:32-p6:32:32-p7:160:256:256:32-p8:128:128-i64:64-v16:16-v24:32-v32:32-v48:64-v96:128-v192:256-v256:256-v512:512-v1024:1024-v2048:2048-n32:64-S32-A5-G1-ni:7:8"
target triple = "amdgcn-amd-amdhsa"

; Function definition: amdgpu_kernel marks this as the GPU kernel entry
define amdgpu_kernel void @_Z10vector_addPKfS0_Pfi(
    ptr addrspace(1) nocapture readonly %a,   ; const float* (global)
    ptr addrspace(1) nocapture readonly %b,   ; const float* (global)
    ptr addrspace(1) nocapture writeonly %c,  ; float*       (global)
    i32 %n                                    ; int n
) #0 {
entry:
; Get thread index: blockIdx.x * blockDim.x + threadIdx.x
  %tid.x = tail call i32 @llvm.amdgcn.workitem.id.x()
  %bid.x = tail call i32 @llvm.amdgcn.workgroup.id.x()
  %bsz.x = tail call i32 @llvm.amdgcn.dispatch.ptr.load.i32(i32 4)
  %tmp0 = mul i32 %bid.x, %bsz.x
  %i = add i32 %tmp0, %tid.x

; Bounds check: if (i < n)
  %cmp = icmp slt i32 %i, %n
  br i1 %cmp, label %if.then, label %if.end

if.then:
; GEP: Calculate array element address &a[i] = a + i*sizeof(float)
  %idx = sext i32 %i to i64
  %ptr.a = getelementptr inbounds float, ptr addrspace(1) %a, i64 %idx
  %ptr.b = getelementptr inbounds float, ptr addrspace(1) %b, i64 %idx
  %ptr.c = getelementptr inbounds float, ptr addrspace(1) %c, i64 %idx

; load: Load value from global memory
  %val.a = load float, ptr addrspace(1) %ptr.a, align 4
  %val.b = load float, ptr addrspace(1) %ptr.b, align 4

; fadd: floating point addition c[i] = a[i] + b[i]
  %sum = fadd float %val.a, %val.b

; store: write back to global memory
  store float %sum, ptr addrspace(1) %ptr.c, align 4
  br label %if.end

if.end:
  ret void
}

; AMDGPU intrinsics declaration
declare i32 @llvm.amdgcn.workitem.id.x()
declare i32 @llvm.amdgcn.workgroup.id.x()

; function attribute
attributes #0 = {
  "amdgpu-flat-work-group-size"="1,1024"
  "uniform-work-group-size"="true"
}`,
            annotations: [
              'target triple "amdgcn-amd-amdhsa" - amdgcn is the AMD GCN/RDNA ISA architecture name, amdhsa is the HSA runtime ABI',
              'amdgpu_kernel calling convention: the backend generates a special prolog that loads kernel arguments from SGPRs',
              'addrspace(1) marks all global memory pointers - the backend selects global_load/global_store instructions accordingly',
              'getelementptr (GEP) does not perform any memory operations, only calculates the address offset - it is the address operation instruction of LLVM IR',
              'sext i32 %i to i64: Sign-extend 32-bit index to 64-bit - the global address of AMDGPU is 64-bit',
              'llvm.amdgcn.workitem.id.x() corresponds to the v0 register of RDNA3 - the hardware automatically fills in the thread ID when the kernel starts',
            ],
            explanation: 'This LLVM IR is the output of vector_add kernel after -O2 optimization. Compare HIP source code and IR: blockIdx.x*blockDim.x+threadIdx.x becomes AMDGCN intrinsic calls and arithmetic instructions; c[i]=a[i]+b[i] becomes the SSA instruction sequence of GEP→load→load→fadd→store. Note that each % variable is assigned only once (SSA nature), and the addrspace(1) annotation ensures that the backend generates correct global memory access instructions.',
          },
          miniLab: {
            title: 'Manual analysis of LLVM IR\'s SSA and phi nodes',
            objective: 'Observe the compiler-generated phi nodes and SSA forms by writing HIP code that contains conditional branches.',
            steps: [
              'Write a HIP kernel containing if-else (such as the code in the above diagram) and save it as phi_test.hip',
              'Generate unoptimized IR: hipcc -S -emit-llvm -O0 --offload-arch=gfx1102 phi_test.hip -o phi_O0.ll',
              'Search for alloca in phi_O0.ll ---O0 does not do mem2reg, so the variable is on the stack',
              'Generate optimized IR: hipcc -S -emit-llvm -O2 --offload-arch=gfx1102 phi_test.hip -o phi_O2.ll',
              'Search for phi in phi_O2.ll - O2 executes mem2reg, alloca becomes phi node',
              'Draw the control flow graph of phi_O2.ll: each label is a node, the br instruction is an edge, and the data flow of the phi node is marked.',
            ],
            expectedOutput: `$ grep "alloca" phi_O0.ll
  %result = alloca float, align 4, addrspace(5)  ←-O0: variable is on the stack
  %tid.addr = alloca i32, align 4, addrspace(5)

$ grep "phi" phi_O2.ll
  %result = phi float [ %sum, %if.then ], [ 0.000000e+00, %if.else ]
  ←-O2: alloca is eliminated and becomes a phi node`,
            hint: 'The mem2reg Pass is the key Pass to convert non-SSA code (with alloca/load/store) into SSA code (with phi nodes). Use opt -passes=mem2reg to run this Pass alone.',
          },
          debugExercise: {
            title: 'Fix illegal LLVM IR',
            language: 'llvm',
            description: 'The following LLVM IR snippet has two errors that violate SSA rules. Find them and fix them.',
            question: 'Which two instructions violate the SSA rules of LLVM IR? How to fix it?',
            buggyCode: `define amdgpu_kernel void @bad_ssa(ptr addrspace(1) %out, i32 %n) {
entry:
  %i = add i32 0, 1          ; %i = 1
  %i = add i32 %i, 1         ; BUG #1: %i is assigned twice!
  br i1 true, label %bb1, label %bb2

bb1:
  %val = fadd float 1.0, 2.0
  br label %merge

bb2:
  %val = fadd float 3.0, 4.0 ; BUG #2: %val is also defined in another BB!
  br label %merge

merge:
  store float %val, ptr addrspace(1) %out
  ret void
}`,
            hint: 'Core rule of SSA: Each virtual register (%name) can only be defined (assigned) once in the entire function. What special instructions are needed for control flow merge points?',
            answer: 'BUG #1: %i is defined twice in the entry block. SSA requires that each % variable can only have one definition point. Correction: Change the second assignment to %i2 = add i32 %i, 1. BUG #2: %val is defined in both bb1 and bb2. Even if the two definitions are in different basic blocks, SSA still requires global uniqueness. Correction: Use %val.1 = fadd float 1.0, 2.0 in bb1, use %val.2 = fadd float 3.0, 4.0 in bb2, and then add phi nodes in the merge block: %val = phi float [%val.1, %bb1], [%val.2, %bb2]. This is exactly what phi nodes exist for - to express control flow merging while maintaining the uniquely defined rules of SSA. LLVM\'s verifier pass (opt -verify) automatically detects these violations.',
          },
          interviewQ: {
            question: 'What is the SSA form? What is the phi node in LLVM IR? How does it help compiler optimization?',
            difficulty: 'medium',
            hint: 'Answer from the perspective of definition uniqueness, use-def chain, and data flow analysis simplification. What problem does the phi node solve?',
            answer: 'SSA (Static Single Assignment) is an IR representation whose core rule is that each variable is defined (assigned) only once. For example, x=1; x=x+1; in the source code becomes %x.0=1; %x.1=add %x.0, 1 in SSA. This makes the use-def chain trivial - each use points directly to a unique definition, requiring no data flow analysis for disambiguation. This greatly simplifies optimizations such as constant propagation, dead code elimination, and common subexpression elimination. The phi node is SSA\'s mechanism for handling control flow merging. When two branches assign different values ​​to the same variable, the merge point requires phi float [%v1, %bb1], [%v2, %bb2] to express "the value depends on which path it was reached from". The phi node does not generate any actual machine instructions - during the register allocation phase, it is resolved into a register copy or directly utilizing register naming. The phi node helps the optimizer perform more precise data flow analysis: for example, GVN (Global Value Numbering) can discover redundant calculations through the phi node, and LICM (Loop Invariant Code Motion) can determine the invariants in the loop through the phi node.',
            amdContext: 'The AMD Toolchain team directly operates LLVM IR on a daily basis. Showing during the interview that you can read IR, understand SSA forms, and phi nodes demonstrates your ability to participate in compiler development. Bonus points for mentioning AMDGPU-specific IR features (amdgpu_kernel, addrspace).',
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
      description: 'Deep dive into the LLVM AMDGPU backend: instruction selection, register allocation, ISA assembly. This is the core work of the AMD Markham Toolchain team - efficiently compiling LLVM IR into AMD GPU machine code.',
      lessons: [
        // ── Lesson 9.2.1 ──────────────────────────────────────
        {
          id: '9-2-1',
          number: '9.2.1',
          title: 'AMDGPU backend architecture',
          titleEn: 'AMDGPU Backend Architecture',
          duration: 15,
          difficulty: 'expert',
          tags: ['AMDGPU-backend', 'SelectionDAG', 'MachineInstr', 'instruction-selection', 'pass-pipeline'],
          concept: {
            summary: 'The AMDGPU backend is one of the most complex backends in LLVM. It converts LLVM IR into GPU machine instructions (MachineInstr) through SelectionDAG, then goes through register allocation and instruction scheduling, and finally generates AMDGPU ISA binary. The backend also contains several GPU-specific passes, such as promote-alloca and lower-kernel-arguments.',
            explanation: [
              'The entrance to the AMDGPU backend is the AMDGPUTargetMachine class (llvm/lib/Target/AMDGPU/AMDGPUTargetMachine.cpp). It registers all back-end components of AMDGPU: instruction definition (AMDGPUInstrInfo), register file (SIRegisterInfo), subtarget information (GCNSubtarget), calling convention, legalization rules, etc. Through the --mcpu=gfx1102 parameter, the backend selects the sub-target configuration of RDNA3, including available instruction sets, register limits, and pipeline characteristics.',
              'Instruction Selection is the most critical stage of the backend. It converts the abstract operations of LLVM IR into concrete instructions for the target machine. AMDGPU uses SelectionDAG-based ISel: LLVM IR is first built as a DAG (directed acyclic graph), and then DAG nodes are matched to AMDGPU instructions through pattern matching. For example, LLVM IR\'s fadd float → DAG\'s ISD::FADD → AMDGPU\'s V_ADD_F32_e32 (VALU floating point addition). These matching rules are defined in .td (TableGen) files, such as SIInstructions.td.',
              'After instruction selection, the IR is reduced from LLVM IR to MachineInstr - a representation that is close to the final machine code but still uses virtual registers. The code at this point already uses specific AMDGPU instructions (V_ADD_F32, S_LOAD_DWORDX4, GLOBAL_LOAD_DWORD, etc.), but the registers are still virtual (such as %vreg0, %vreg1). Subsequent register allocation stages map virtual registers to physical registers (v0, v1, s0, s1, etc.).',
              'The AMDGPU backend contains multiple GPU-specific Passes, which handle the special needs of GPU hardware: (1) AMDGPUPromoteAlloca - promotes alloca (private array on the stack) to LDS (Local Data Share) or vector registers, avoiding expensive scratch memory access; (2) AMDGPULowerKernelArguments - loads kernel parameters from the kernel parameter segment (kern_arg_segment) to registers; (3) SIFixSGPRCopies - Fix illegal copy operations between SGPR↔VGPR; (4) SIInsertWaitcnts - Insert s_waitcnt instructions at necessary locations to ensure that the results are used after the memory operation is completed; (5) SIOptimizeExecMaskingPreRA - Optimize the exec mask operation to reduce control flow overhead. These Passes are the core difference between the AMDGPU backend and the general backend.',
              'The complete AMDGPU backend Pass pipeline (from LLVM IR to machine code) is roughly: LLVM IR → AMDGPULowerIntrinsics → AMDGPUPromoteAlloca → AMDGPULowerKernelArguments → SelectionDAG ISel → SIFixSGPRCopies → SIOptimizeExecMasking → Register Allocation → SIInsertWaitcnts → Post-RA Scheduling → MC Code Emission. You can use llc -mtriple=amdgcn -mcpu=gfx1102 -debug-pass=Structure to view the complete Pass list.',
              'Two AMDGPU-specific passes deserve special attention. SIInsertWaitcnts inserts s_waitcnt instructions to handle the GPU\'s asynchronous memory model — without these wait instructions, a shader might read data before the previous store completes, causing silent corruption. The pass analyzes data dependencies and inserts the minimum necessary waits (vmcnt for vector memory, lgkmcnt for LDS/GDS/scalar, expcnt for exports). The second critical pass is SIShrinkInstructions, which converts 64-bit VOP3 encoding to 32-bit VOP1/VOP2 where possible, saving instruction cache space. When VGPR pressure exceeds available registers, the compiler spills to scratch memory (private per-thread VRAM space accessed via MUBUF instructions), which is 100x slower than register access — this is why minimizing VGPR usage is critical for performance.',
            ],
            keyPoints: [
              'AMDGPUTargetMachine is the backend entry, select RDNA3 sub-target configuration through --mcpu=gfx1102',
              'Instruction selection: SelectionDAG ISel matches IR nodes to AMDGPU instructions through pattern matching in .td files',
              'MachineInstr is the core representation of the backend - specific AMDGPU instructions + virtual registers',
              'GPU-specific Pass: promote-alloca (avoid scratch), lower-kernel-arguments, fix-sgpr-copies, insert-waitcnts',
              'Pass pipeline: IR → Lower → Promote → ISel → RegAlloc → Scheduling → MC Emit',
              'Use llc -debug-pass=Structure to view the complete Pass list and execution order',
              'SIInsertWaitcnts pass prevents data corruption by inserting s_waitcnt for async memory ops',
              'Scratch memory spill (VGPR overflow → VRAM) is 100x slower than register access',
            ],
          },
          diagram: {
            title: 'AMDGPU backend Pass pipeline',
            content: `AMDGPU backend: Complete Pass pipeline from LLVM IR to GPU machine code

LLVM IR (SSA form, target-independent)
 │
 ▼ ═══════ AMDGPU Pre-ISel Passes ═══════
 │
 ├─ AMDGPULowerIntrinsics
│ Reduce generic LLVM intrinsics to AMDGPU specific operations
 │
├─ AMDGPUPromoteAlloca ★ GPU key optimization
│ alloca (private stack) → LDS or vector register
│ Avoid the huge latency overhead of scratch memory
 │
 ├─ AMDGPULowerKernelArguments
│ Kernel parameters are loaded into registers from kernarg segment
 │    s_load_dwordx4 s[0:3], s[4:5], 0x0
 │
 ▼ ═══════ Instruction Selection ═══════
 │
 ├─ SelectionDAG Builder
│ LLVM IR → DAG (directed acyclic graph)
 │    fadd float %a, %b → (fadd f32 $a, $b)
 │
 ├─ DAG Legalization
│ Make sure all operations are legal on AMDGPU
│ Unsupported operations are extended to supported sequences
 │
 ├─ DAG-to-DAG ISel (SIInstrInfo.td patterns)
 │    (fadd f32 $src0, $src1) → V_ADD_F32_e32
 │    (load global addr) → GLOBAL_LOAD_DWORD
 │
 ▼ ═══════ MachineInstr Level ═══════
 │
│ At this time, the code uses AMDGPU instructions + virtual registers:
 │  %vreg3:vgpr_32 = V_ADD_F32_e32 %vreg1, %vreg2
 │
 ├─ SIFixSGPRCopies
│ Repair SGPR↔VGPR illegal copy
│ (SGPR cannot be written directly to VGPR in some contexts)
 │
├─ Register Allocation ★ Core stage
│ virtual register → physical register (v0-v255, s0-s105)
│ Determine VGPR/SGPR usage → Impact Occupancy
 │
├─ SIInsertWaitcnts ★ Correctness key
│ Insert s_waitcnt vmcnt(0) / lgkmcnt(0)
│ Make sure the memory operation is complete before using the result
 │
 ├─ Post-RA Instruction Scheduling
│ Rearrange instructions to hide latency and optimize throughput
 │
 ▼ ═══════ MC Layer (Code Emission) ═══════
 │
 └─ AMDGPUMCCodeEmitter
MachineInstr → binary encoding
      V_ADD_F32_e32 v1, v2, v3 → 0x02020503
Output .text section (GPU ISA bytes)
Output .note section (metadata)
→ .hsaco (ELF format GPU executable file)`,
            caption: 'Complete Pass pipeline for AMDGPU backend. The output of each Pass can be viewed individually with -debug-only=<pass-name>. GPU-specific Passes (promote-alloca, insert-waitcnts, etc.) are the core difference between AMDGPU backends and general-purpose backends.',
          },
          codeWalk: {
            title: 'Key AMDGPU Backend Pass: From IR to Machine Instructions',
            file: 'llvm/lib/Target/AMDGPU/ — key passes overview',
            language: 'c',
            code: `/*═══ AMDGPUTargetMachine.cpp — backend entry ═══ */
/*Register all AMDGPU backend Pass */
void GCNPassConfig::addPreISel() {
  /*GPU-specific Pre-ISel Pass */
  addPass(createAMDGPULowerIntrinsicsPass());
  addPass(createAMDGPUPromoteAllocaPass());
  /*↑ Promote alloca to LDS or register
   *Example: float arr[4] → 4 VGPR
   *Example: __shared__ float smem[256] → LDS */
  addPass(createAMDGPULowerKernelArgumentsPass());
}

void GCNPassConfig::addInstSelector() {
  /*SelectionDAG command selection */
  addPass(createAMDGPUISelDag(getAMDGPUTargetMachine()));
}

void GCNPassConfig::addPreRegAlloc() {
  addPass(&SIFixSGPRCopiesID);
  /*↑ Fix SGPR-VGPR replication problem
   *SGPR (scalar) and VGPR (vector) have different usage rules
   *Some operations can only use VGPR, some can only use SGPR */
  addPass(&SIOptimizeExecMaskingPreRAID);
}

void GCNPassConfig::addPostRegAlloc() {
  addPass(&SIInsertWaitcntsID);
  /*↑ Insert s_waitcnt after memory operation
   * global_load_b32 v1, v0, s[0:1]
   *s_waitcnt vmcnt(0) ← Wait for load to complete
   *v_add_f32 v2, v1, v3 ← now safe to use v1 */
}

/*═══ SIInstructions.td — Instruction selection mode (TableGen) ═══ */
/*DAG pattern matching rule example */

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

/*These .td rules are generated at compile time by the TableGen tool
 *C++ matching code, ISel performs matching at runtime */`,
            annotations: [
              'GCNPassConfig inherits from LLVM\'s TargetPassConfig and customizes the Pass pipeline for the GCN/RDNA architecture.',
              'Pass in addPreISel() runs before instruction selection - handles GPU-specific IR conversions',
              'PromoteAlloca is performance critical Pass - promote stack allocation to registers/LDS to avoid scratch memory',
              'SIFixSGPRCopies ensure correct scalar/vector register usage rules - special requirements for AMDGPU dual register files',
              'SIInsertWaitcnts is correctness critical - without correct waitcnt, the GPU will use data that is not ready',
              'Pattern matching rules in .td files are processed into C++ code by TableGen when compiling LLVM itself',
            ],
            explanation: 'This code shows the Pass pipeline organization of AMDGPU backend. The GCNPassConfig class controls the registration and execution order of Pass. Key things to understand: (1) GPU backends are much more complex than CPU backends because of the need to deal with GPU-specific concepts such as SGPR/VGPR dual register files, LDS memory, wavefront execution models, etc.; (2) Many AMDGPU Passes (such as InsertWaitcnts) are correctness Passes rather than optimization Passes - without them the program will produce incorrect results.',
          },
          miniLab: {
            title: 'View the full list of Passes for AMDGPU backends',
            objective: 'Use the debugging options of llc to see which passes are executed by the AMDGPU backend and understand the complexity of the compilation pipeline.',
            setup: `#Prepare an LLVM IR input file
hipcc -S -emit-llvm -O2 --offload-arch=gfx1102 vector_add.hip -o vector_add.ll
#Or create a minimalist IR manually:
cat > simple.ll << 'EOF'
define amdgpu_kernel void @k(ptr addrspace(1) %p) {
  %v = load float, ptr addrspace(1) %p
  %r = fadd float %v, 1.0
  store float %r, ptr addrspace(1) %p
  ret void
}
EOF`,
            steps: [
              'View the Pass list: llc -mtriple=amdgcn-amd-amdhsa -mcpu=gfx1102 -debug-pass=Structure simple.ll -o /dev/null 2>&1 | head -80',
              'Count the number of Passes: the above command | wc -l (usually more than 100 Passes)',
              'View the command selection output: llc -mtriple=amdgcn-amd-amdhsa -mcpu=gfx1102 -debug-only=isel simple.ll -o /dev/null 2>&1 | head -40',
              'View register allocation: llc -mtriple=amdgcn-amd-amdhsa -mcpu=gfx1102 -debug-only=regalloc simple.ll -o /dev/null 2>&1 | head -40',
              'View waitcnt insert: llc -mtriple=amdgcn-amd-amdhsa -mcpu=gfx1102 -debug-only=si-insert-waitcnts simple.ll -o /dev/null 2>&1',
              'Compare the final assembly output: llc -mtriple=amdgcn-amd-amdhsa -mcpu=gfx1102 simple.ll -o simple.s && cat simple.s',
            ],
            expectedOutput: `$ llc ... -debug-pass=Structure 2>&1 | grep -c "Pass"
120+    ←AMDGPU backend executes over 120 passes

$ cat simple.s | grep -v "^[;.]"
  s_load_b32 s0, s[4:5], 0x0     ; load *p
  s_waitcnt lgkmcnt(0)            ; wait for load
  v_add_f32_e64 v0, s0, 1.0      ; *p + 1.0
  global_store_b32 v[0:1], v0, off ; store result
  s_endpgm                         ; end kernel`,
            hint: 'If ROCm is not installed, you can compile llc from LLVM source and enable the AMDGPU target: cmake -DLLVM_TARGETS_TO_BUILD="AMDGPU" ../llvm. Or use godbolt.org to select AMDGPU llc online to view the output.',
          },
          debugExercise: {
            title: 'Diagnosing data races caused by missing s_waitcnt',
            language: 'asm',
            description: 'The following AMDGPU assembly snippet has a correctness bug - a necessary wait instruction is missing.',
            question: 'Under what circumstances would this code produce incorrect results? What instructions need to be inserted where?',
            buggyCode: `; Load two values ​​from global memory and add them
global_load_b32 v1, v0, s[0:1]    ; v1 = memory[addr1]
global_load_b32 v2, v0, s[2:3]    ; v2 = memory[addr2]
; BUG: Using the result without waiting for load to complete!
v_add_f32_e32 v3, v1, v2 ; v3 = v1 + v2 (v1, v2 may not be ready yet)
global_store_b32 v0, v3, s[4:5] ; write back the result
s_endpgm`,
            hint: 'AMDGPU\'s global_load is an asynchronous operation - after issuing the load request, the GPU continues to execute subsequent instructions and will not wait automatically. What instructions are needed to ensure the load completes?',
            answer: 'Problem: global_load_b32 is an asynchronous memory operation. On RDNA3, after global_load is issued, the GPU will continue to execute subsequent instructions, and the result of the load may not arrive in the register until tens to hundreds of cycles. If v1/v2 is used before load completes, an undefined old value will be read. Bugfix: insert s_waitcnt vmcnt(0) between two loads and v_add. vmcnt is the Vector Memory Count, tracking the number of outstanding vector memory operations. vmcnt(0) means wait for all outstanding vector memory operations to complete. Correct code: global_load_b32 v1, ...; global_load_b32 v2, ...; s_waitcnt vmcnt(0); v_add_f32_e32 v3, v1, v2; .... In the LLVM AMDGPU backend, the SIInsertWaitcnts Pass is responsible for automatically inserting these wait instructions. If this Pass is buggy, there will be this kind of data race problem that is difficult to debug - the result is sometimes correct and sometimes wrong, depending on the memory latency.',
          },
          interviewQ: {
            question: 'Describes the Pass pipeline of the LLVM AMDGPU backend. What are GPU-specific passes? Why are they needed?',
            difficulty: 'hard',
            hint: 'Starting from the main line of ISel → RegAlloc → Scheduling → Emit, mention GPU-specific Passes such as promote-alloca, fix-sgpr-copies, insert-waitcnts, etc.',
            answer: 'AMDGPU backend Pass pipeline: (1) Pre-ISel stage: AMDGPULowerIntrinsics (reduce general intrinsic), AMDGPUPromoteAlloca (promote stack allocation to LDS/register - GPU does not have an efficient stack, scratch memory latency is more than 100 times that of register), AMDGPULowerKernelArguments (load kernel parameters from kernarg segment to register). (2) ISel stage: SelectionDAG instruction selection, matching IR nodes to AMDGPU instructions through pattern matching defined in .td. (3) Pre-RegAlloc: SIFixSGPRCopies (fixes SGPR/VGPR illegal copying - GPU has two different register files, and some operations have requirements for register types), SIOptimizeExecMasking (optimizes exec mask operations to reduce control flow overhead - GPU uses exec mask to implement branches, not conditional jumps). (4) RegAlloc: Allocate VGPR and SGPR, which directly determines Occupancy. (5) Post-RegAlloc: SIInsertWaitcnts (insert memory synchronization instructions - GPU memory operations are asynchronous and must be explicitly waited), Post-RA Scheduling (rearrange instructions to hide delays). (6) MC Emit: Encoded as binary machine code. The GPU-specific Pass exists because the execution model of the GPU is fundamentally different from that of the CPU: SIMD execution (exec mask), asynchronous memory (waitcnt), dual register files (SGPR/VGPR), and no efficient stack (scratch).',
            amdContext: 'The Pass pipeline of the AMDGPU backend is the core work of the AMD Toolchain team. Being able to describe this pipeline in detail during the interview and explain the reason for the existence of each GPU-specific Pass shows that you not only know how to use the compiler, but also understand the internal working mechanism of the compiler.',
          },
        },

        // ── Lesson 9.2.2 ──────────────────────────────────────
        {
          id: '9-2-2',
          number: '9.2.2',
          title: 'VGPR vs. SGPR: GPU register allocation',
          titleEn: 'VGPR and SGPR: GPU Register Allocation',
          duration: 15,
          difficulty: 'expert',
          tags: ['VGPR', 'SGPR', 'register-allocation', 'occupancy', 'spilling', 'uniformity'],
          concept: {
            summary: 'AMD GPU has two types of registers: VGPR (Vector GPR, independent per thread) and SGPR (Scalar GPR, shared throughout Wavefront). The compiler uses Uniformity Analysis to determine which register the data should be placed in. The amount of VGPR usage directly determines Occupancy (the number of concurrent Wavefronts on the GPU). Excessive VGPR usage will cause registers to spill into scratch memory, seriously affecting performance.',
            explanation: [
              'VGPR (Vector General Purpose Register) is a register private to each thread. In the RDNA3 architecture, each CU (Compute Unit) has 1536 32-bit VGPRs (allocated in wave32 units, actually 1536 × 32 lanes). VGPR is used to store thread private data: thread ID, array index, loaded data value, calculation intermediate results, etc. VALU (Vector ALU) instructions operate on VGPRs - a v_add_f32 instruction performs an addition to the VGPRs of all 32 threads in Wavefront simultaneously.',
              'SGPR (Scalar General Purpose Register) is a register shared by the entire Wavefront. Each CU has 512 32-bit SGPRs. SGPR is used to store the same data (uniform data) for all threads: loop counters, constant pointers, kernel parameters, uniform conditions for conditional branches, etc. SALU (Scalar ALU) instruction operates SGPR - energy consumption is much lower than VALU. It is an important optimization for the compiler to put as much computation as possible on SGPR/SALU.',
              'Uniformity Analysis is the key analysis for the compiler to decide whether to put data in VGPR or SGPR. If a value is uniform across all threads in Wavefront, it should be placed in SGPR. For example, kernel parameters, loop variables, and blockDim.x are all uniform. If a value is divergent in different threads, it must be placed in VGPR. For example, the loading results of threadIdx.x and a[threadIdx.x] are all divergent. The compiler\'s Uniformity Analysis Pass tracks the uniform/divergent properties of each value and passes the results to the register allocator.',
              'VGPR usage is directly related to Occupancy. Occupancy is the ratio of the number of concurrently active Wavefronts on a CU to the maximum. RDNA3 can run up to 16 wave32s simultaneously per CU. If the kernel uses 48 VGPRs, then 1536÷48=32 waves can coexist, but since the upper limit is 16, Occupancy=16/16=100%. If 128 VGPRs are used, then 1536÷128=12 waves, Occupancy=12/16=75%. If using 256 VGPR and only 6 waves, Occupancy=6/16=37.5%. Lower Occupancy means less Wavefront can hide memory latency, often resulting in slower performance.',
              'When the kernel requires more registers than are available, the compiler is forced to spill some of the register values ​​into scratch memory. Scratch memory is the stack space reserved for each thread in VRAM, and the access latency is more than 100 times higher than that of registers. Performance of Spill: .amdhsa_private_segment_fixed_size > 0 in the compilation output (indicating that scratch space is required), scratch_load/scratch_store instructions appear in assembly (save the VGPR value to scratch and restore it when needed). Register pressure is one of the most important performance factors in GPU programming - reducing VGPR usage (by reducing active variables, reorganizing calculations, using LDS instead of private arrays) is a core trick for GPU performance optimization.',
              'The AMDGPU backend\'s wave size selection is controlled by the amdgpu-waves-per-eu attribute and target features. For RDNA GPUs (gfx10+), the compiler defaults to Wave32 for pixel shaders (better for small triangles with high divergence) and Wave64 for compute shaders (better throughput for uniform workloads). This is configured in AMDGPUSubtarget::getWavesPerEU() and affects register allocation pressure — Wave32 halves the VGPR file consumption compared to Wave64 for the same number of active waves. Game developers often force Wave32 for all shaders on RDNA, while HPC developers prefer Wave64 for maximum ALU throughput.',
            ],
            keyPoints: [
              'VGPR: private per thread, RDNA3 1536 per CU (wave32 allocation units), stores divergent data',
              'SGPR: Wavefront sharing, 512 per CU, stores uniform data (parameters, constants, loop variables)',
              'Uniformity Analysis: The compiler analyzes whether each value is uniform (→SGPR) or divergent (→VGPR)',
              'Occupancy = number of concurrent Wavefronts / maximum value; the less VGPR usage → the higher the Occupancy → the better the latency hiding',
              'Spill: When VGPR is not enough, it overflows to scratch memory (VRAM), and the delay increases by more than 100 times.',
              'In compiler output .amdhsa_next_free_vgpr/sgpr reports register usage and ScratchSize reports spill size',
              'Wave32 default for pixel shaders (less divergence waste), Wave64 for compute (more throughput)',
            ],
          },
          diagram: {
            title: 'The relationship between VGPR/SGPR and Occupancy',
            content: `RDNA3 (gfx1102) CU register resources and Occupancy

┌──────────────────── Compute Unit (CU) ────────────────────┐
│                                                            │
│  VGPR File: 1536 × 32-bit registers (wave32 mode)         │
│  ┌────────────────────────────────────────────────────┐    │
│  │ Wave 0: v0-v47  │ Wave 1: v0-v47  │ Wave 2: ...   │    │
│  │ (48 VGPRs)      │ (48 VGPRs)      │               │    │
│  │ ...              │ ...              │               │    │
│ │ Wave 15 (maximum) │ │
│  └────────────────────────────────────────────────────┘    │
│                                                            │
│  SGPR File: 512 × 32-bit registers                         │
│  ┌────────────────────────────────────────────────────┐    │
│ │ Maximum 106 SGPR per Wavefront │ │
│  └────────────────────────────────────────────────────┘    │
│                                                            │
└────────────────────────────────────────────────────────────┘

VGPR usage vs Occupancy (RDNA3 wave32, 1536 VGPRs/CU):

VGPRs/wave Max Waves Occupancy delay hiding ability
  ──────────    ─────────    ─────────    ──────────
24 16 100.0% ★★★★★ Excellent
48 16 100.0% ★★★★★ Excellent
64 16 100.0% ★★★★★ Excellent
96 16 100.0% ★★★★★ Excellent
128 12 75.0% ★★★★☆ Good
192 8 50.0% ★★★☆☆ Moderate
256 6 37.5% ★★☆☆☆ Poor
>256 spill! —— ★☆☆☆☆ Extremely bad

Register allocation of Uniform vs Divergent values:

HIP code attribute register
  ─────────                   ────          ──────
kernel parameters (*a, *b, n) uniform → SGPR
  blockDim.x                  uniform  →    SGPR
  blockIdx.x                  uniform  →    SGPR
  threadIdx.x                 divergent →   VGPR
  a[threadIdx.x]              divergent →   VGPR
loop counter (uniform loop) uniform → SGPR

SGPR operation energy consumption ≈ 1/32 of VGPR operation (scalar vs 32-way SIMD)`,
            caption: 'VGPR usage directly determines Occupancy. The compiler\'s Uniformity Analysis assigns uniform values ​​to SGPR (cheap) and divergent values ​​to VGPR (expensive). Keeping VGPR usage low is at the core of GPU performance optimization.',
          },
          codeWalk: {
            title: 'VGPR/SGPR allocation reporting in compiler output',
            file: 'hipcc -S output — register allocation report',
            language: 'asm',
            code: `; ═══ Compilation output of vector_add kernel (gfx1102, -O2) ═══

; --- Assembly instruction part ---
_Z10vector_addPKfS0_Pfi:
; Kernel parameters are passed in through SGPR (uniform)
s_load_b64 s[0:1], s[4:5], 0x0; s[0:1] = &a (SGPR: pointer is uniform)
  s_load_b64 s[2:3], s[4:5], 0x8    ; s[2:3] = &b
  s_load_b64 s[6:7], s[4:5], 0x10   ; s[6:7] = &c
  s_load_b32 s8, s[4:5], 0x18       ; s8 = n

; Calculate thread global ID (divergent → VGPR)
v_mov_b32_e32 v1, s8 ; stage n to VGPR (for v_cmp)
  v_mad_u32_u24 v0, s12, v0, s13     ; v0 = blockIdx.x * blockDim.x + threadIdx.x
  ;                ^^^       ^^^
; uniform divergent → result divergent → VGPR

; Boundary check
v_cmp_lt_i32_e32 vcc_lo, v0, v1 ; v0 < n ? (thread-by-thread comparison)
s_and_saveexec_b32 s9, vcc_lo ; exec mask = vcc (disable out-of-bounds threads)

; Loading and calculation (only threads within bounds execute)
s_waitcnt lgkmcnt(0) ; Wait for s_load to complete
  v_lshlrev_b32_e32 v1, 2, v0       ; v1 = i * 4 (byte offset)
  global_load_b32 v2, v1, s[0:1]    ; v2 = a[i]  (VGPR: divergent)
  global_load_b32 v3, v1, s[2:3]    ; v3 = b[i]  (VGPR: divergent)
s_waitcnt vmcnt(0) ; Wait for global_load to complete
  v_add_f32_e32 v2, v2, v3          ; v2 = a[i] + b[i]
  global_store_b32 v1, v2, s[6:7]   ; c[i] = v2

s_endpgm; end kernel

; --- Resource usage report ---
; .amdhsa_next_free_vgpr 4          ←Use 4 VGPRs (v0-v3)
; .amdhsa_next_free_sgpr 14         ←Use 14 SGPRs (s0-s13)
; .amdhsa_private_segment_fixed_size 0  ←No spill!

; Occupancy calculation:
; VGPR: 4 → 1536/4 = 384 waves (capped at 16) → 100%
; SGPR: 14 → 512/14 = 36 waves (capped at 16) → 100%
; → Total Occupancy = min(100%, 100%) = 100% ★ Optimal`,
            annotations: [
              's_load_b64 uses SGPR storage pointer - kernel parameters are the same for all threads (uniform)',
              'The input to v_mad_u32_u24 mixes SGPR (s12=blockIdx) and VGPR (v0=threadIdx), resulting in divergent → VGPR',
              'v_cmp_lt_i32 Thread-by-thread comparison → Set vcc (vector condition code), only threads that meet the conditions continue to execute',
              's_and_saveexec_b32 Modifies the exec mask implementation branch - GPU does not use conditional jumps and uses mask to disable threads',
              'Only 4 VGPRs and 14 SGPRs are used, Occupancy=100% - the register usage of the simple kernel is very small',
              '.amdhsa_private_segment_fixed_size 0 means no spill, all data in registers',
            ],
            explanation: 'This compilation output shows how the compiler puts uniform data into SGPR (pointer, parameters, blockIdx) and divergent data into VGPR (threadIdx, loaded data, calculation result). vector_add only uses 4 VGPRs, which is well below the threshold for Occupancy degradation. This is an ideal kernel - no spills, 100% Occupancy. The use of VGPR for complex kernels can exceed 100. At this time, you need to pay attention to whether Occupancy is acceptable.',
          },
          miniLab: {
            title: 'Observe the impact of VGPR pressure on Occupancy',
            objective: 'By writing kernels with different VGPR usage, observe the register usage and Occupancy changes reported by the compiler.',
            steps: [
              'Write a simple kernel (vector_add) and a complex kernel (using a large number of local variables) and compile them into assembly respectively',
              'For simple kernel: grep "amdhsa_next_free_vgpr" simple.s, record the number of VGPR',
              'For complex kernels: intentionally create a kernel with 30+ local float variables, compile and see VGPR usage',
              'Calculate Occupancy from the compiler VGPR/SGPR resource report (.kd / ISA metadata, or compile with --save-temps), from a profiler (rocprof / Omniperf), or manually calculate 1536÷VGPR_count for max waves per SIMD',
              'Add -Rpass-analysis=regalloc when compiling to view register allocation details',
              'Observe whether .amdhsa_private_segment_fixed_size > 0 (indicating that a spill has occurred)',
            ],
            expectedOutput: `$ grep "amdhsa_next_free" simple.s
.amdhsa_next_free_vgpr 4     ←Simple kernel: 4 VGPR, Occupancy=100%
.amdhsa_next_free_sgpr 14

$ grep "amdhsa_next_free" complex.s
.amdhsa_next_free_vgpr 168   ←Complex kernel: 168 VGPR, Occupancy=56%
.amdhsa_next_free_sgpr 42

$ grep "private_segment_fixed_size" very_complex.s
.amdhsa_private_segment_fixed_size 256  ←A spill occurred!`,
            hint: 'You can use #pragma unroll and a large number of local variables to artificially increase register pressure. godbolt.org (Compiler Explorer) allows you to experiment online with the impact of different codes on the use of VGPR, just select the AMDGPU backend.',
          },
          debugExercise: {
            title: 'Diagnosing performance issues caused by register overflows',
            language: 'c',
            description: 'The following HIP kernel executes much slower than expected. The compile report shows clues to the problem.',
            question: 'Why is this kernel so slow? How to optimize register usage?',
            buggyCode: `__global__ void slow_kernel(float *data, int n) {
    int tid = threadIdx.x + blockIdx.x * blockDim.x;
    /*Large number of local variables leads to high register pressure */
    float t0, t1, t2, t3, t4, t5, t6, t7;
    float t8, t9, t10, t11, t12, t13, t14, t15;
    float t16, t17, t18, t19, t20, t21, t22, t23;
    float t24, t25, t26, t27, t28, t29, t30, t31;

    t0 = data[tid]; t1 = t0*1.1; t2 = t1*1.2; t3 = t2*1.3;
    t4 = t0*2.1; t5 = t1*2.2; t6 = t2*2.3; t7 = t3*2.4;
    /*...Similar chain assignment to t8-t31... */
    t31 = t0 + t1 + t2 + t3 + t4 + t5 + t6 + t7;
    /*Note: all t variables are active at the same time! */

    data[tid] = t0+t1+t2+t3+t4+t5+t6+t7+t8+t9+t10+t11
               +t12+t13+t14+t15+t16+t17+t18+t19+t20+t21
               +t22+t23+t24+t25+t26+t27+t28+t29+t30+t31;
}
/*The compiler reports:
 * .amdhsa_next_free_vgpr 196
 * .amdhsa_private_segment_fixed_size 128  ← spill!
 * Occupancy: 50% (8/16 waves)
 */`,
            hint: 'The problem is that all 32 float local variables are live at the same time during the final sum, and the compiler cannot reuse registers. How can I refactor my code to reduce the number of variables that are active at the same time?',
            answer: 'Problem analysis: 32 float variables (requiring at least 32 VGPR) are active simultaneously at the final summation point, plus address calculation and intermediate values, the total VGPR usage reaches 196. private_segment_fixed_size=128 means that part of VGPR is spilled to scratch memory. Occupancy is only 50% (8 waves), and scratch access to spill seriously increases latency. Optimization method: (1) Accumulator mode - do not retain all intermediate values, use a running accumulator: float acc = 0; acc += data[tid]*1.1; acc += prev*1.2; ... so that only 2-3 active VGPRs are needed each time; (2) Group processing - divide the 32 values into 4 groups of 8, first sum within the group and then sum between groups; (3) Use LDS - If multiple threads are collaborating on related data, place intermediate results in __shared__ instead of private variables. Core principle: Reduce the number of variables that are active at the same time (live range) and let the compiler reuse registers. The goal is to keep VGPR below 96 to maintain 100% Occupancy.',
          },
          interviewQ: {
            question: 'Explain the difference between VGPR and SGPR in AMD GPUs. How does the compiler decide which register to use? How does VGPR usage affect performance?',
            difficulty: 'medium',
            hint: 'Answer from three aspects: uniform/divergent analysis, Occupancy calculation, and spill mechanism. Give specific numbers (number of registers per CU for RDNA3).',
            answer: 'VGPR (Vector GPR) is a private register for each thread, and each RDNA3 CU has 1536 32-bit VGPR (wave32 mode). VGPR stores divergent data - data that has different values ​​for different threads (e.g. threadIdx.x, loaded data). SGPR (Scalar GPR) is a register shared by the entire Wavefront, with 512 per CU. SGPR stores uniform data - values ​​that are the same for all threads (such as kernel parameters, blockDim, loop counters). Using SGPR is 32x more efficient than VGPR (scalar operations vs 32-lane SIMD operations). The compiler determines the properties of each value through Uniformity Analysis: starting from the kernel parameter (uniform) and threadIdx (divergent), propagating along the data flow graph - any calculation that depends on the divergent value is also divergent. VGPR usage directly affects Occupancy: with a maximum of 16 waves32 per CU, 1536/96=16 waves → 100% when using 96 VGPR; 1536/192=8 waves → 50% when using 192 VGPR. Low Occupancy reduces the ability to hide memory latency. If the number of VGPR exceeds 256, it must be spilled to scratch memory (VRAM), and the delay increases by more than 100 times. Therefore register optimization is the core of GPU performance optimization.',
            amdContext: 'VGPR/SGPR and Occupancy are the basic concepts of AMD GPU programming and are also must-have interview questions. Demonstrate that you know the specific register count (1536 VGPR/CU for RDNA3), the Occupancy calculation method and the performance impact of spills, and demonstrate that you have actual GPU performance analysis experience.',
          },
        },

        // ── Lesson 9.2.3 ──────────────────────────────────────
        {
          id: '9-2-3',
          number: '9.2.3',
          title: 'Read the AMDGPU ISA Compilation',
          titleEn: 'Reading AMDGPU ISA Assembly',
          duration: 15,
          difficulty: 'expert',
          tags: ['ISA', 'RDNA3', 'VOP', 'SOP', 'SMEM', 'MUBUF', 's_waitcnt', 'exec-mask'],
          concept: {
            summary: 'RDNA3 ISA instructions are divided into multiple formats: VOP (vector operation), SOP (scalar operation), SMEM (scalar memory), MUBUF/GLOBAL (global memory), LDS (shared memory), etc. Understanding the synchronization semantics of s_waitcnt and the branching mechanism of v_cmp + exec mask is fundamental to reading GPU assembly and debugging compiler output.',
            explanation: [
              'The instruction set of RDNA3 (gfx1102) is divided into categories by operation type and encoding format. VOP (Vector Operation) instruction operation VGPR: VOP1 (single operand, such as v_mov_b32), VOP2 (double operand, such as v_add_f32_e32), VOP3 (three operands + modifier, such as v_fma_f32), VOPC (comparison operation, such as v_cmp_lt_f32, the result is written to vcc). The VOP instruction name format is unified: v_<op>_<type>_e<encoding>, for example, v_add_f32_e32 represents vector floating point addition and 32-bit encoding.',
              'SOP (Scalar Operation) instructions operate SGPR: SOP1 (such as s_mov_b32), SOP2 (such as s_add_u32), SOPC (comparison, such as s_cmp_lt_i32), SOPP (program control, such as s_branch, s_endpgm, s_waitcnt). Scalar instructions are executed on SALU, one per cycle. Important scalar instructions include s_and_saveexec_b32 (exec mask operation, used for branches), s_cbranch_execz (jump if exec=0), s_barrier (workgroup synchronization barrier).',
              'The SMEM (Scalar Memory) instruction uses the address stored in SGPR for scalar memory access: s_load_b32/b64/b128 is loaded from memory to SGPR, mainly used to load kernel parameters and constants. SMEM uses lgkmcnt (LDS/GDS/Const/Msg counter) to track outstanding operations. GLOBAL_LOAD/GLOBAL_STORE are global memory access instructions, using VGPR as the address, and writing the result to VGPR - this is the most common memory operation in the kernel. Global memory operations are tracked using vmcnt (Vector Memory counter).',
              's_waitcnt is the most important synchronization instruction in AMDGPU ISA. GPU memory operations are asynchronous - issuing a load does not automatically wait for the result. s_waitcnt vmcnt(N) Wait until the number of outstanding vector memory operations ≤ N (vmcnt(0) = wait for all to complete). s_waitcnt lgkmcnt(N) Waits for a scalar memory operation. s_waitcnt expcnt(N) Wait for export/GDS operation. The compiler\'s SIInsertWaitcnts Pass is responsible for inserting the waitcnt at the correct location. A bad waitcnt can result in using unready data (functional bug) or excessive waiting (performance issues).',
              'The branching mechanism of GPU is completely different from that of CPU. CPU uses conditional jump (if-else); GPU uses exec mask for predication. Process: (1) v_cmp_lt_i32 vcc, v0, v1 are compared thread by thread, and the result is stored in vcc (vector condition code, 32-bit bitmask); (2) s_and_saveexec_b32 s0, vcc saves the old exec mask to s0, new exec = exec & vcc (only threads that meet the conditions continue); (3) Execute the instructions of the then branch (only exec=1 thread takes effect); (4) s_xor_b32 exec, exec, s0 flips the mask and executes the else branch; (5) s_or_b32 exec, exec, s0 restores the original mask. If all threads in Wavefront take the same path (uniform branch), exec will remain unchanged and there will be no additional overhead.',
              's_endpgm is the end instruction of the kernel - telling the hardware that the Wavefront has finished executing and releases the registers and resources it occupied. The last instruction in each kernel must be s_endpgm.',
            ],
            keyPoints: [
              'VOP instruction (v_) operation VGPR: VOP1 (single operand), VOP2 (double operand), VOP3 (three operands + modifier), VOPC (compare → vcc)',
              'SOP instruction (s_) operation SGPR: SOP1/SOP2 (arithmetic), SOPP (control flow/s_waitcnt/s_endpgm/s_barrier)',
              'SMEM (s_load_*): scalar memory load → SGPR, tracked with lgkmcnt; GLOBAL_LOAD: global memory → VGPR, tracked with vmcnt',
              's_waitcnt vmcnt(N)/lgkmcnt(N): Wait for the asynchronous memory operation to complete, N=0 means waiting for all',
              'exec mask branch: v_cmp→vcc + s_and_saveexec→exec mask + execute then/else + resume exec',
              's_endpgm: Kernel ends, releasing Wavefront resources (registers, scheduling slots)',
            ],
          },
          diagram: {
            title: 'RDNA3 ISA instruction format classification',
            content: `RDNA3 (gfx1102) ISA instruction format overview

┌──────────────────────────────────────────────────────────────┐
│ Vector Instructions (v_*) — Operation VGPR, executed on VALU │
│                                                               │
│ VOP1 v_<op>_e32 dst, src0 single operand │
│ v_mov_b32_e32 v0, v1 copy │
│ v_cvt_f32_i32_e32 v0, v1 type conversion │
│                                                               │
│ VOP2 v_<op>_e32 dst, src0, src1 double operand │
│ v_add_f32_e32 v0, v1, v2 floating point addition │
│ v_mul_f32_e32 v0, v1, v2 floating point multiplication │
│                                                               │
│ VOP3 v_<op>_e64 dst, src0, src1, src2 three operands + modifier │
│ v_fma_f32 v0, v1, v2, v3 Fusion Multiply and Add (FMA) │
│ v_add_f32_e64 v0, |v1|, -v2 support abs/neg modifier │
│                                                               │
│ VOPC v_cmp_<cc>_<type> vcc, src0, src1 compare→vcc │
│ v_cmp_lt_f32_e32 vcc_lo, v0, v1 thread-by-thread comparison │
│                                                               │
│ VINTERP v_interp_p1/p2_f32 Pixel Interpolation (Graphics) │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│ Scalar Instructions (s_*) — Operation SGPR, executed on SALU │
│                                                               │
│ SOP1 s_mov_b32 s0, s1 scalar copy │
│ SOP2 s_add_u32 s0, s1, s2 scalar addition │
│ SOPP s_waitcnt vmcnt(0) Wait for memory operation │
│ s_barrier workgroup synchronization │
│ s_branch <label> Unconditional jump │
│ s_cbranch_execz <label> Jump when exec=0 │
│ s_endpgm kernel end │
│ SOPK s_movk_i32 s0, 0x100 16-bit immediate │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│ Memory Instructions — Global/scalar/local memory access │
│                                                               │
│ SMEM s_load_b32 s0, s[2:3], off scalar memory load→SGPR │
│ s_load_b128 s[0:3], ... load 128-bit (4 dword) │
│ → Trace using lgkmcnt │
│                                                               │
│ GLOBAL global_load_b32 v0, v1, s[0:1] Global load→VGPR │
│ global_store_b32 v0, v1, s[0:1] global storage │
│ → Trace using vmcnt │
│                                                               │
│ LDS ds_read_b32 v0, v1 LDS read │
│ ds_write_b32 v0, v1 LDS write │
│ → Trace using lgkmcnt │
│                                                               │
│ SCRATCH scratch_load_b32 v0, off scratch (spill) read │
│ scratch_store_b32 off, v0 scratch (spill) write │
└──────────────────────────────────────────────────────────────┘

s_waitcnt synchronization semantics:
vmcnt — trace global_load/store (vector memory)
lgkmcnt — trace s_load/ds_read/ds_write (scalar memory/LDS)
expcnt — trace export/GDS`,
            caption: 'RDNA3 ISA instructions are classified by execution unit and function. The v_ prefix is ​​a vector instruction (VALU), the s_ prefix is ​​a scalar instruction (SALU), and global_/ds_/scratch_ is a memory instruction. Understanding these categories is fundamental to reading GPU assembly.',
          },
          codeWalk: {
            title: 'Annotated vector_add ISA assembly (gfx1102 RDNA3)',
            file: 'vector_add.s — hipcc -S -O2 --offload-arch=gfx1102 output',
            language: 'asm',
            code: `; ═══ vector_add kernel: c[i] = a[i] + b[i] ═══
; Target: gfx1102 (RDNA3, Navi33, RX 7600 XT)

        .text
        .globl  _Z10vector_addPKfS0_Pfi
.p2align 8 ; 256-byte alignment (hardware requirement)
_Z10vector_addPKfS0_Pfi:

; ── Kernel Prolog: Load parameters and calculate thread ID ──

; SGPR initial state (hardware population):
; s[4:5] = kernarg_segment base address (pointing to kernel parameter)
        ;   s12 = workgroup_id_x (= blockIdx.x)

; Load kernel parameters: *a, *b, *c, n (from kernarg segment)
        s_load_b64  s[0:1], s[4:5], 0x0    ; s[0:1] = a  (64-bit ptr)
        s_load_b64  s[2:3], s[4:5], 0x8    ; s[2:3] = b
        s_load_b64  s[6:7], s[4:5], 0x10   ; s[6:7] = c
        s_load_b32  s8, s[4:5], 0x18       ; s8 = n
; ↑ SMEM instructions, asynchronous execution, use lgkmcnt tracking

; Calculate i = blockIdx.x * blockDim.x + threadIdx.x
; v0 = threadIdx.x (hardware padding, different per thread → VGPR)
; s12 = blockIdx.x (hardware padding, same for entire workgroup → SGPR)
        s_lshl_b32  s9, s12, 8             ; s9 = blockIdx.x << 8
; Assume blockDim.x=256, that is blockIdx.x * 256
v_add_nc_u32 v0, s9, v0; v0 = s9 + threadIdx.x = global i
; ↑ VGPR + SGPR mixed operation, the result is put in VGPR (divergent)

; ── Bounds check: if (i < n) ──

s_waitcnt lgkmcnt(0); Wait for s_load to complete
; ↑ You must wait until s8(n) is loaded before comparing
v_cmp_lt_i32_e32 vcc_lo, v0, s8 ; Thread by thread: v0 < n ?
; ↑ Each thread compares independently, and the results are aggregated into vcc (32-bit mask)
s_and_saveexec_b32 s9, vcc_lo ; save old exec→s9
; new exec = exec & vcc
; Out-of-bounds threads are disabled (mask=0)
s_cbranch_execz .Lexit ; If all threads are out of bounds → jump to end

; ── Core calculation: c[i] = a[i] + b[i] ──

; Calculate byte offset: byte_offset = i * 4
        v_lshlrev_b32_e32 v3, 2, v0       ; v3 = v0 << 2 = i * 4

; Load a[i] and b[i]
        global_load_b32 v1, v3, s[0:1]    ; v1 = *(a + byte_offset)
        global_load_b32 v2, v3, s[2:3]    ; v2 = *(b + byte_offset)
; ↑ Asynchronous global memory reading, using vmcnt tracing

; Wait for both loads to complete
s_waitcnt vmcnt(0) ; vmcnt=0: wait for all global_load
; ↑ Without this instruction, v1/v2 may be garbage values!

; Floating point addition
        v_add_f32_e32 v1, v1, v2           ; v1 = a[i] + b[i]
; ↑ VALU instruction, 32 threads execute simultaneously

; store c[i]
        global_store_b32 v3, v1, s[6:7]   ; *(c + byte_offset) = v1

.Lexit:
s_endpgm; Kernel ends, releasing wave resources

; ── metadata ──
.amdhsa_kernel _Z10vector_addPKfS0_Pfi
.amdhsa_next_free_vgpr 4 ; use 4 VGPRs (v0-v3)
.amdhsa_next_free_sgpr 14 ; Use 14 SGPRs
.amdhsa_private_segment_fixed_size 0 ; no scratch/spill
.amdhsa_group_segment_fixed_size 0 ; no LDS use
.amdhsa_float_denorm_mode_32 3 ; FP32 denorm enabled
.amdhsa_wavefront_size32 1 ; wave32 mode
.end_amdhsa_kernel`,
            annotations: [
              's_load_b64 loads parameters from kernarg segment - all parameters are the same for all threads, placed in SGPR',
              'v0 is automatically filled in by hardware as threadIdx.x at the kernel entry - each thread is different, naturally in VGPR',
              's_waitcnt lgkmcnt(0) waits for s_load to complete; s_waitcnt vmcnt(0) waits for global_load to complete - two different counters',
              'v_cmp → vcc → s_and_saveexec is the standard mode for GPU to implement if branch (exec mask predication)',
              's_cbranch_execz optimization: if the entire wave is out of bounds, jump directly to the end without executing load/compute',
              'The .amdhsa_kernel metadata section tells the runtime how to allocate resources - the number of VGPR/SGPR determines Occupancy',
            ],
            explanation: 'This annotated assembly is the complete compiled output of vector_add on gfx1102. Each instruction has a clear purpose: s_load loads parameters, v_cmp+exec mask does boundary checking, global_load fetches data, v_add_f32 does calculations, global_store writes results, and s_endpgm ends. The key synchronization points are the two s_waitcnts - waiting for scalar and vector memory operations respectively. Understanding such assembly is a core skill for GPU performance optimization and compiler debugging.',
          },
          miniLab: {
            title: 'Manually annotating AMDGPU ISA assembly',
            objective: 'Compile a slightly more complex kernel, read and mark the function of each assembly instruction independently, and verify your understanding of the ISA.',
            steps: [
              'Write a kernel containing conditional branches and multiplication: if (i < n) c[i] = a[i] * b[i] + a[i]',
              'Compile to assembly: hipcc -S -O2 --offload-arch=gfx1102 kernel.hip -o kernel.s',
              'Find the kernel function in kernel.s and mark the function of each instruction line by line.',
              'Mark all s_waitcnt instructions and explain why you need to wait at that location',
              'Find the exec mask operations (s_and_saveexec, s_cbranch_execz, etc.) and draw the control flow graph',
              'Record VGPR/SGPR usage report, calculate theoretical Occupancy',
            ],
            expectedOutput: `Annotation example:
s_load_b64 s[0:1], s[4:5], 0x0; [SMEM] Load kernel arg: ptr a
s_waitcnt lgkmcnt(0) ; [SYNC] Wait for all scalar loads
v_cmp_lt_i32 vcc_lo, v0, s8; [VOPC] Bounds check: tid < n?
  v_fma_f32 v1, v2, v3, v2         ; [VOP3] fused multiply-add: a*b+a

VGPR: 5, SGPR: 16 → Occupancy: 100%`,
            hint: 'Consult AMD\'s "RDNA3 Instruction Set Architecture" official documentation (downloadable on the GPUOpen website) to get the precise semantics of each instruction. Search for "RDNA3 ISA Reference Guide" to find it.',
          },
          debugExercise: {
            title: 'Finding exec mask errors in ISA assembly',
            language: 'asm',
            description: 'The following assembly implements an if-else branch, but there is an error in the exec mask operation, causing the thread of the else branch to not execute correctly.',
            question: 'Which exec mask operation is incorrect? What should be the correct one?',
            buggyCode: `; if (v0 < v1) { v2 = 1.0; } else { v2 = 0.0; }
v_cmp_lt_f32_e32 vcc_lo, v0, v1 ; compare v0 < v1 → vcc
s_and_saveexec_b32 s0, vcc_lo       ; exec = exec & vcc (then branch)
; s0 = old exec (save)
; ── then branch: thread that meets the conditions ──
v_mov_b32_e32 v2, 1.0               ; v2 = 1.0

; ── else branch: Threads that do not meet the conditions ──
s_or_b32 exec_lo, exec_lo, s0; BUG! The mask should be flipped here
v_mov_b32_e32 v2, 0.0 ; v2 = 0.0 (but all threads executed!)

; ── resume exec ──
s_or_b32 exec_lo, exec_lo, s0 ; restore full exec`,
            hint: 'Before entering the else branch, you need to flip the exec mask to "then no executing thread". s_or_b32 is a merge operation, not a flip. What operation should be used?',
            answer: 'BUG: The else branch entry should use s_xor_b32 exec_lo, exec_lo, s0 instead of s_or_b32. s_or_b32 ORs s0 (the old full exec) with the current exec, resulting in all threads being enabled - this causes the then and else code to be executed by all threads. Correct pattern: (1) s_and_saveexec_b32 s0, vcc → then thread execution, s0 = original exec; (2) execute then branch; (3) s_xor_b32 exec_lo, exec_lo, s0 → exec = original exec XOR current exec = else thread; (4) execute else branch; (5) s_or_b32 exec_lo, exec_lo, s0 → restore original exec (merging then and else threads). The XOR operation flips the mask to "threads not executing in then", which is exactly the set of threads needed for the else branch. This is the standard exec mask protocol for AMDGPU to implement if-else.',
          },
          interviewQ: {
            question: 'Explain the role of the s_waitcnt instruction in AMDGPU ISA. What do vmcnt and lgkmcnt track respectively? What happens if s_waitcnt is omitted?',
            difficulty: 'hard',
            hint: 'Starting from the asynchronous nature of GPU memory operations. Explain the two types of operations tracked by counters, and the functional and performance implications of omitting waitcnt.',
            answer: 's_waitcnt is the memory synchronization instruction of AMDGPU, ensuring that asynchronous memory operations complete before using the results. GPU memory operations are asynchronous - after issuing a load request, the GPU continues to execute subsequent instructions and does not automatically wait for the result. vmcnt (Vector Memory Count) tracks outstanding vector memory operations (global_load, global_store, buffer_load, etc.) that access VRAM or system memory. lgkmcnt (LDS/GDS/Const/Msg Count) tracks outstanding scalar memory operations (s_load) and LDS operations (ds_read/ds_write). s_waitcnt vmcnt(N) waits until the number of outstanding vector memory operations ≤ N; vmcnt(0) and so on are all completed. s_waitcnt lgkmcnt(0) Wait for all scalar/LDS operations to complete. Consequences of omitting s_waitcnt: (1) Functional error - use a register value that is not ready, you get random old data; (2) Difficult to debug - the error is non-deterministic and depends on memory latency (sometimes correct and sometimes wrong); (3) May be intermittently correct - if other instructions happen to provide enough delay for the load to complete. Performance optimization perspective: Accurate waitcnt is better than waitcnt(0) - for example, after two consecutive loads, you only need to wait for the first result. You can use vmcnt(1) instead of vmcnt(0) to allow the second load to continue transmitting. LLVM\'s SIInsertWaitcnts Pass is responsible for inserting the optimal waitcnt value.',
            amdContext: 's_waitcnt is a mechanism that both AMDGPU hardware engineers and compiler engineers must deeply understand. Being able to explain the difference between vmcnt and lgkmcnt and the performance impact of precise waitcnt during the interview shows that you understand the deep mechanism of the GPU asynchronous memory model.',
          },
        },
      ],
    },
  ],
  completionChecklist: [
    'Understand LLVM three-stage architecture (front-end→middle-end→back-end) and LLVM IR as the core design of universal intermediate representation',
    'Able to use hipcc to generate LLVM IR (.ll) and AMDGPU assembly (.s), and understand the compilation process at each step',
    'Understand the concepts of SSA forms and phi nodes, and be able to read and analyze LLVM IR code',
    'Understand the Pass pipeline of AMDGPU backend: ISel → RegAlloc → Scheduling → MC Emit',
    'Understand the difference between VGPR/SGPR, Uniformity Analysis, and the impact of VGPR usage on Occupancy',
    'Able to read RDNA3 ISA assembly: VOP/SOP/SMEM/GLOBAL instruction format, s_waitcnt synchronization, exec mask branch',
    'Can connect one HIP source-level change to the resulting LLVM IR and ISA differences and explain the performance consequence',
  ],
};
