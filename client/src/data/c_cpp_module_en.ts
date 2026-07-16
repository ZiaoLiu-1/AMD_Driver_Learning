// Module 0.7 - C/C++ Foundations (EN)
// Standalone module data, inserted into curriculum_en.ts (mirrors ecosystem_module_en.ts).
import type { Module } from './curriculum';

export const cCppModuleEn: Module = {
  id: 'c-cpp',
  number: '0.7',
  title: 'C/C++ Foundations',
  titleEn: 'C/C++ Foundations',
  icon: 'Braces',
  description: 'Before diving into kernel code, systematically review the C you actually need for driver work, then progressively learn the C++ core relevant to the GPU software stack, capped by a kernel-idioms practicum. Foundations-first and depth-oriented: 19 micro-lessons paired with 40 Code Lab drills you can compile and run right in the browser (zero setup), with every concept tied to real amdgpu / Mesa / ROCm / LLVM code.',
  estimatedHours: 56,
  difficulty: 'beginner',
  subModules: [
    { id: 'cc-compile', title: 'Compilation, Linking & Translation Units', titleEn: 'Compilation, Linking & Translation Units' },
    { id: 'cc-types', title: 'Types, Integers & Fixed-Width', titleEn: 'Types, Integers & Fixed-Width' },
    { id: 'cc-pointer', title: 'Pointers, Strings & Memory Model', titleEn: 'Pointers, Strings & Memory Model' },
    { id: 'cc-struct', title: 'Structs, Alignment & Lifetime', titleEn: 'Structs, Alignment & Lifetime' },
    { id: 'cc-ops', title: 'Function Pointers & ops Polymorphism', titleEn: 'Function Pointers & ops Polymorphism' },
    { id: 'cc-cpp-core', title: 'C++ Core: RAII, Polymorphism, Templates, STL', titleEn: 'C++ Core: RAII, Polymorphism, Templates, STL' },
    { id: 'cc-kernel', title: 'Kernel C Idioms in Practice', titleEn: 'Kernel C Idioms in Practice' },
  ],
  theory: {
    overview: 'The later modules in this path read kernel source heavily, and reading code well requires a solid language foundation. This module is that "language bedrock": first a 7-lesson systematic review of the C driver work truly needs (compilation & linking, types & integers, pointers, strings, structs & alignment, memory lifetime, function pointers & ops polymorphism), then a 6-lesson progressive training of the C++ core relevant to the GPU software stack (references & overloading, classes & RAII, copy/move, inheritance & virtual functions, templates, STL & smart pointers). One important mental thread runs throughout: the kernel-side amdgpu driver is pure C, implementing polymorphism with hand-written ops structs and resource cleanup with goto staircases; while userspace — Mesa, the ROCm/HIP runtime, the LLVM compiler stack — is C++, turning those two things into language-native virtual functions and RAII. After this module you can read both kernel C idioms and userspace C++ resource management and polymorphism, laying the language groundwork for every module that follows. The group closes with a 6-lesson kernel-idioms practicum (bit-op macros, intrusive lists, macro hygiene, the error-handling trio, kref & devm, concurrency contexts) that lands the language skills onto the dialect of real driver code. Every lesson pairs with Code Lab drills (/code-lab): 40 kernel-flavored LeetCode-style problems compiled and run with real gcc/g++ right in the browser — no local setup. Solving the matching problems right after each lesson is strongly recommended: let your fingers memorize the syntax.',
    sections: [
      {
        title: 'Why driver work needs both C and C++',
        content: 'AMD\'s GPU software stack spans kernel and user space, and the two sides use different languages. Kernel side: the Linux kernel and the amdgpu driver are pure C (the kernel uses no C++ runtime), so reading and writing driver code requires fluency in C — pointers, struct memory layout, bit operations, function-pointer ops structs, and goto resource cleanup are daily fare. User side: Mesa (the OpenGL/Vulkan drivers), the ROCm/HIP compute runtime, and LLVM (the compiler that turns shaders/compute kernels into GPU instructions) are all C++ codebases using references, classes & RAII, virtual-function polymorphism, templates and the STL extensively. So a complete AMD GPU engineer needs "C primarily, C++ secondarily": C is the hard currency for reading the kernel driver, and C++ is the key to reading the userspace stack and the compiler. This module follows that split — the C part is thicker and closer to kernel idioms, while the C++ part focuses on the core you will actually use rather than spreading across the whole language.',
        diagram: {
          type: 'ascii',
          content: `The AMD GPU software stack: which layer is which language

  User Space ──────────────────────────────────────
    apps / games / compute programs
        │
    ┌───────────────┬────────────────┬──────────────┐
    │ Mesa          │ ROCm / HIP     │ LLVM compiler │
    │ OpenGL/Vulkan │ compute runtime│ shader/kernel │
    │   ▲ C / C++   │   ▲ C++        │   ▲ C++       │
    └───────────────┴────────────────┴──────────────┘
        │ libdrm (C)
  ════════════ ioctl syscall boundary (extern "C") ════════════
  Kernel Space ────────────────────────────────────
    DRM core + amdgpu driver     ▲ pure C (no C++ runtime)
        │
    GPU hardware (RDNA/GCN)

  Pattern: below the syscall boundary is C; the userspace stack and compiler above are C++.`,
          caption: 'The kernel driver (amdgpu) is pure C; userspace Mesa, ROCm/HIP and LLVM are C++. Learn C to read the kernel, C++ to read the userspace stack and the compiler.',
        },
      },
      {
        title: 'What the C review covers, and how it connects to later modules',
        content: 'The C part (0.7.1, 7 lessons) is not a syntax crash course but a "foundations-first, driver-connected" systematic review: (1) translation units, compilation & linking — understand how a .c becomes amdgpu.ko, declaration vs definition, the linkage semantics of extern/static; (2) types, integer promotion & fixed-width integers — why registers use u32 not int, and the integer-promotion and signed/unsigned traps; (3) pointers & the memory model — address-of/dereference, array decay, the kernel errno-style output parameter; (4) arrays, strings & buffer safety — \\0 termination, strscpy/snprintf and overflow protection; (5) structs, unions, bitfields & alignment — where padding comes from, masks+shifts vs bitfields for mapping registers; (6) stack, heap & memory lifetime — malloc/free, ownership, the kernel goto cleanup pattern; (7) function pointers, callbacks & ops structs — polymorphism in classless C. This connects directly to Module 1 (Prerequisites): Module 1\'s container_of, register bitfields, atomics and locks are the "advanced applications", and this module makes solid the language foundation beneath them.',
      },
      {
        title: 'What the C++ training covers, and how it connects to the userspace stack',
        content: 'The C++ part (0.7.2, 6 lessons) goes from the most basic to the driver-relevant core, without straying into unused corners of the language: (1) from C to C++ — references, function overloading, namespaces, bool/nullptr/auto, and the extern "C" boundary; (2) classes, constructors/destructors & RAII — binding resource acquisition/release to object lifetime, replacing C\'s goto cleanup; (3) copy, move & resource management — shallow-copy double frees, the Rule of Three/Five, move semantics transferring ownership; (4) inheritance, virtual functions & polymorphism — the vtable/vptr mechanism, mapped one-to-one to C\'s ops struct; (5) templates & generic programming — compile-time instantiation, type safety, the STL\'s foundation; (6) STL containers, algorithms & smart pointers — vector/map/string, sort/lambda, unique_ptr/shared_ptr. These are exactly how Mesa, ROCm/HIP and LLVM manage GPU resources, command buffers and compiler passes day to day. By the end you will clearly see that C++ virtual functions are the language-native version of the kernel ops struct, and C++ RAII is the automated version of the kernel goto cleanup — two paradigms mirroring each other.',
      },
    ],
    keyBooks: [
      {
        title: 'The C Programming Language (K&R, 2nd Edition)',
        author: 'Brian W. Kernighan, Dennis M. Ritchie',
        isbn: '978-0131103627',
        relevance: 'The classic, authoritative C reference — concise and precise. The first choice for building a foundation before reading kernel C, especially the pointers/arrays and structs chapters.',
      },
      {
        title: 'C Programming: A Modern Approach (2nd Edition)',
        author: 'K. N. King',
        isbn: '978-0393979503',
        relevance: 'A more self-study-friendly modern C textbook than K&R, with thorough treatment of types, integer promotion, undefined behavior and the memory model, plus many exercises.',
      },
      {
        title: 'A Tour of C++ (3rd Edition)',
        author: 'Bjarne Stroustrup',
        isbn: '978-0136816485',
        relevance: 'A concise modern-C++ tour by the language\'s creator, covering RAII, move semantics, templates and the STL in a few hundred pages — matching this module\'s C++ scope exactly.',
      },
    ],
    onlineResources: [
      {
        title: 'cppreference.com — C/C++ standard library & language reference',
        url: 'https://en.cppreference.com/',
        type: 'doc',
        description: 'The most authoritative online C/C++ reference. Treat it as the source of truth for the precise semantics of any function, container or language feature.',
      },
      {
        title: 'Compiler Explorer (godbolt.org)',
        url: 'https://godbolt.org/',
        type: 'doc',
        description: 'View the assembly and name mangling produced by your C/C++ code online — a great tool to verify integer promotion, inlining and template instantiation behavior.',
      },
      {
        title: 'Linux kernel coding style',
        url: 'https://www.kernel.org/doc/html/latest/process/coding-style.html',
        type: 'doc',
        description: 'The kernel C coding style guide — understand why the kernel prefers goto cleanup, fixed-width types and specific naming conventions.',
      },
      {
        title: 'learncpp.com — a systematic C++ tutorial',
        url: 'https://www.learncpp.com/',
        type: 'doc',
        description: 'A free, step-by-step modern C++ tutorial, a great companion read for this module\'s C++ part.',
      },
    ],
  },
  codeReading: [
    {
      title: 'Kernel C: amdgpu\'s ops-struct polymorphism',
      description: 'The kernel implements "one interface, many implementations" with a group of function pointers (an ops struct). This is the skeleton of amdgpu initialization and the real counterpart of lesson cc-c-7.',
      file: 'drivers/gpu/drm/amd/include/amd_shared.h (simplified)',
      language: 'c',
      code: `/* Each IP block (GFX/SDMA/DC/VCN...) provides one amd_ip_funcs implementation */
struct amd_ip_funcs {
    const char *name;
    int  (*early_init)(void *handle);
    int  (*sw_init)(void *handle);     /* software init */
    int  (*hw_init)(void *handle);     /* hardware init */
    int  (*hw_fini)(void *handle);
    int  (*suspend)(void *handle);
    int  (*resume)(void *handle);
    /* ... a long list of more function pointers ... */
};

/* At init, iterate, null-check and dispatch uniformly (minimal sketch):
   for (i = 0; i < adev->num_ip_blocks; i++) {
       const struct amd_ip_funcs *f = adev->ip_blocks[i].version->funcs;
       if (f->hw_init) {            // null-check: the op is optional
           r = f->hw_init(adev);    // dispatch: each IP block runs its own impl
           if (r) goto init_failed; // on failure: goto reverse cleanup
       }
   } */`,
      annotations: [
        'struct amd_ip_funcs is a group of function pointers — this is C\'s "interface"',
        'Each IP block fills in its own implementation; the caller depends only on this interface (polymorphism)',
        'if (f->hw_init) null-checks before calling, supporting optional ops and avoiding NULL crashes',
        'The failure path goto init_failed cleans up already-initialized blocks in reverse — a kernel signature style',
      ],
    },
    {
      title: 'Userspace C++: managing resources with RAII + unique_ptr',
      description: 'Mesa/HIP/LLVM manage GPU resources with RAII and smart pointers, releasing automatically at scope exit with no hand-written cleanup. This is the real counterpart of lessons cc-cpp-2/6.',
      file: 'illustrative: the userspace GPU stack\'s resource-management style',
      language: 'cpp',
      code: `#include <memory>
#include <vector>

struct GpuBuffer {                 // RAII-wrap a GPU resource
    explicit GpuBuffer(size_t bytes) { /* allocate GPU memory */ }
    ~GpuBuffer() { /* free GPU memory (automatic) */ }
};

void submit_commands() {
    auto cmd = std::make_unique<GpuBuffer>(4096);   // exclusive ownership
    std::vector<std::unique_ptr<GpuBuffer>> pool;   // container holds and auto-manages
    pool.push_back(std::make_unique<GpuBuffer>(8192));
    // ... use cmd and pool ...
    if (/* error */ false) return;  // early return is also safe: destruction is automatic
}                                   // scope ends: all GpuBuffers destruct automatically in reverse`,
      annotations: [
        'GpuBuffer wraps resource acquisition/release in its constructor/destructor (RAII)',
        'unique_ptr expresses exclusive ownership and auto-releases at scope exit, zero hand-written free',
        'vector<unique_ptr<...>> holds a set of resources and manages their lifetimes automatically',
        'Even with an early return (or a thrown exception), all objects destruct in reverse — contrast kernel goto cleanup',
      ],
    },
  ],
  miniProject: {
    title: 'The same IP block dispatcher: C version vs C++ version',
    description: 'Implement a "one interface, many implementations" dispatcher twice — once in C (ops struct) and once in C++ (virtual functions) — and write a comparison note. This project threads the whole module together and shows vividly that the ops struct and the vtable are two expressions of the same idea.',
    objectives: [
      'Implement an IP block dispatcher (init/fini) in C with function pointers + an ops struct',
      'Implement the equivalent in C++ with an abstract base + virtual functions, managing lifetime with vector<unique_ptr<Base>>',
      'Compare the two cleanup styles: C\'s goto reverse cleanup vs C++\'s automatic RAII destruction',
      'Use ASan to verify both versions are leak-free',
    ],
    steps: [
      'Create ip_dispatch_c/: use cc-c-7\'s ops struct to implement two blocks (gfx/sdma), null-check then dispatch in the main loop, and add goto error cleanup',
      'Create ip_dispatch_cpp/: use cc-cpp-4\'s abstract base IpBlock + derived classes + a virtual destructor for equivalent dispatch, held in vector<unique_ptr<IpBlock>>',
      'Build/run each with gcc -fsanitize=address and g++ -std=c++17 -fsanitize=address, confirming identical output and no leaks',
      'Write notes/c_vs_cpp.md: list the correspondence "ops pointer ⇄ vptr, ops table ⇄ vtable, goto cleanup ⇄ RAII", and discuss why the kernel chooses C',
      'Collect both code versions and the comparison note into a personal portfolio as a showable artifact',
    ],
    expectedOutput: `# Both versions produce identical output:
GFX hw_init
SDMA hw_init
GFX fini
# ASan reports no memory leaks for either version
# and produces a notes/c_vs_cpp.md comparison (a portfolio artifact)`,
    githubTemplate: 'https://github.com/torvalds/linux/blob/master/drivers/gpu/drm/amd/include/amd_shared.h',
  },
  interviewQuestions: [
    {
      question: 'What is the difference between a declaration and a definition? What happens if you put a global variable\'s definition in a header?',
      difficulty: 'easy',
      hint: 'Start from "allocate an entity vs merely announce existence", then think about what each .c gets when the header is included by several files.',
      answer: 'A declaration only tells the compiler "a name exists and has this type", allocating no entity; a definition actually allocates storage or provides the function body. Putting a global variable\'s definition in a header gives every .c that #includes it a copy of the definition, causing multiple definition at link time. The right approach: put an extern declaration in the header and the definition in exactly one .c. This is the engineering form of the ODR (One Definition Rule), and the standard way the kernel shares global symbols.',
    },
    {
      question: 'Why does the kernel use u32/u64 instead of int/long? How does integer promotion cause bugs?',
      difficulty: 'medium',
      hint: 'Explain fixed-width types via deterministic hardware widths + cross-architecture ABI; explain the trap via "narrow integers promote to int".',
      answer: 'Registers, command packets and firmware structs require exact bit widths; u32 is 32 bits on every platform, whereas int/long sizes vary by ABI, so bare types misalign fields; also the kernel spans many architectures, and fixed-width types keep layout consistent. The integer-promotion trap: integers narrower than int (u8/u16) are promoted to int before arithmetic, so e.g. adding two u8s does not wrap at 8 bits; when signed and unsigned mix the result is usually unsigned, making unsigned a-1 a huge positive value, a reverse size_t loop infinite, and so on. So use unsigned fixed-width types for bit operations, masks and registers.',
    },
    {
      question: 'What is RAII? How does it replace C\'s goto cleanup, and why is it crucial for exception safety?',
      difficulty: 'medium',
      hint: 'Make "resource release bound to destruction" and "stack unwinding always triggers destruction" clear.',
      answer: 'RAII has the constructor acquire a resource and the destructor release it, binding the resource\'s lifetime to the object\'s. A stack object is always destroyed in reverse order when it leaves scope, so resource release is guaranteed by the language, with no need to hand-write goto cleanup at every failure/return point as in C. It is especially crucial for exception safety: when an exception is thrown, stack unwinding destroys all already-constructed objects along the way, automatically releasing locks/memory/files, so nothing leaks because an exception skipped hand-written cleanup. The standard library\'s lock_guard, unique_ptr and vector all embody RAII.',
    },
    {
      question: 'C has no classes — how do you achieve polymorphism? How does it relate to C++ virtual functions (the vtable)?',
      difficulty: 'hard',
      hint: 'Start from "ops struct = hand-written vtable", and compare with vptr/vtable.',
      answer: 'C achieves polymorphism with "function pointers + an ops struct": declare a group of operations as function-pointer fields, have different objects fill in different implementations, and let the caller dispatch uniformly via obj->ops->method(obj). This is essentially a hand-written virtual function table. C++ virtual functions have the compiler auto-generate a vtable for each class with virtual functions, hide a vptr at the object\'s head pointing to it, and route obj->method() indirectly through the vptr — a one-to-one match with the hand-written C ops, only that C++ automates building the table, filling it, and the indirect call, and adds type checking and an implicit this. The kernel chooses hand-written ops for precise control over ABI, memory layout and zero hidden overhead.',
    },
  ],
};
