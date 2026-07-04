// Module 0.7 - C/C++ Foundations (C/C++ 基础速成)
// Standalone module data, inserted into curriculum.ts (mirrors ecosystem_module.ts).
import type { Module } from './curriculum';

export const cCppModule: Module = {
  id: 'c-cpp',
  number: '0.7',
  title: 'C/C++ 基础速成',
  titleEn: 'C/C++ Foundations',
  icon: 'Braces',
  description: '在啃内核代码之前，先把驱动开发真正用得上的 C 系统性过一遍，再循序学习与 GPU 软件栈相关的 C++ 核心。以基础为主、深度优先、配套 lab 实战，并把每个概念关联到真实的 amdgpu / Mesa / ROCm / LLVM 代码。',
  estimatedHours: 42,
  difficulty: 'beginner',
  subModules: [
    { id: 'cc-compile', title: '编译、链接与翻译单元', titleEn: 'Compilation, Linking & Translation Units' },
    { id: 'cc-types', title: '类型、整数与定宽类型', titleEn: 'Types, Integers & Fixed-Width' },
    { id: 'cc-pointer', title: '指针、字符串与内存模型', titleEn: 'Pointers, Strings & Memory Model' },
    { id: 'cc-struct', title: '结构体、对齐与内存生命周期', titleEn: 'Structs, Alignment & Lifetime' },
    { id: 'cc-ops', title: '函数指针与 ops 多态', titleEn: 'Function Pointers & ops Polymorphism' },
    { id: 'cc-cpp-core', title: 'C++ 核心：RAII、多态、模板、STL', titleEn: 'C++ Core: RAII, Polymorphism, Templates, STL' },
    { id: 'cc-kernel', title: '内核 C 惯用法实战', titleEn: 'Kernel C Idioms in Practice' },
  ],
  theory: {
    overview: '这条学习路径后续的模块会大量直接阅读内核源码，而读懂代码的前提是扎实的语言基础。这个模块的定位是“语言地基”：先用 7 节课系统复习驱动开发真正需要的 C（编译链接、类型与整数、指针、字符串、结构体与对齐、内存生命周期、函数指针与 ops 多态），再用 6 节课循序训练与 GPU 软件栈相关的 C++ 核心（引用与重载、类与 RAII、拷贝/移动、继承与虚函数、模板、STL 与智能指针）。一条重要的认知主线贯穿全程：内核态的 amdgpu 驱动是纯 C，用手写的 ops 结构体实现多态、用 goto 阶梯做资源清理；而用户态的 Mesa、ROCm/HIP 运行时、LLVM 编译器栈是 C++，把这两件事变成了语言原生的虚函数与 RAII。学完本模块，你既能读懂内核 C 的惯用法，也能读懂用户态 C++ 的资源管理与多态，为后续所有模块打好语言底子。',
    sections: [
      {
        title: '为什么驱动开发要同时懂 C 和 C++',
        content: 'AMD 的 GPU 软件栈横跨内核态与用户态，两边用的语言不同。内核态：Linux 内核与 amdgpu 驱动是纯 C（内核不使用 C++ 运行时），所以读写驱动代码必须精通 C —— 指针、结构体内存布局、位操作、函数指针 ops 结构体、goto 资源清理都是日常。用户态：Mesa（OpenGL/Vulkan 驱动）、ROCm/HIP 计算运行时、以及 LLVM（把着色器/计算核函数编译成 GPU 指令的编译器）都是 C++ 代码库，大量使用引用、类与 RAII、虚函数多态、模板与 STL。因此一个完整的 AMD GPU 工程师需要“C 为主、C++ 为辅”：C 是读懂内核驱动的硬通货，C++ 是读懂用户态栈与编译器的钥匙。本模块按这个分工来安排——C 部分更厚、更贴近内核惯用法，C++ 部分聚焦真正会用到的核心，不铺开整门语言。',
        diagram: {
          type: 'ascii',
          content: `AMD GPU 软件栈：哪一层是什么语言

  用户态 (User Space) ─────────────────────────────
    应用 / 游戏 / 计算程序
        │
    ┌───────────────┬────────────────┬──────────────┐
    │ Mesa          │ ROCm / HIP     │ LLVM 编译器   │
    │ OpenGL/Vulkan │ 计算运行时     │ 着色器/核函数 │
    │   ▲ C / C++   │   ▲ C++        │   ▲ C++       │
    └───────────────┴────────────────┴──────────────┘
        │ libdrm (C)
  ════════════ ioctl 系统调用边界 (extern "C") ════════════
  内核态 (Kernel Space) ───────────────────────────
    DRM 核心 + amdgpu 驱动     ▲ 纯 C（无 C++ 运行时）
        │
    GPU 硬件 (RDNA/GCN)

  规律：跨过系统调用边界向下是 C；向上的用户态栈与编译器是 C++。`,
          caption: '内核驱动（amdgpu）是纯 C；用户态的 Mesa、ROCm/HIP、LLVM 是 C++。学 C 为读内核，学 C++ 为读用户态与编译器栈。',
        },
      },
      {
        title: 'C 复习覆盖什么，以及与后续模块的衔接',
        content: 'C 部分（0.7.1，共 7 节）不是语法扫盲，而是“以基础为主、关联驱动”的系统复习：(1) 翻译单元、编译与链接——理解 .c 如何变成 amdgpu.ko，声明 vs 定义、extern/static 的链接语义；(2) 类型、整数提升与定宽整数——为什么寄存器用 u32 而非 int，整数提升与有符号/无符号陷阱；(3) 指针与内存模型——取地址/解引用、数组退化、内核 errno 风格的输出参数；(4) 数组、字符串与缓冲区安全——\\0 终止、strscpy/snprintf 与缓冲区溢出防护；(5) 结构体、联合体、位域与对齐——padding 的来源、用掩码+移位还是位域映射寄存器；(6) 栈、堆与内存生命周期——malloc/free、所有权、内核 goto 清理模式；(7) 函数指针、回调与 ops 结构体——在没有类的 C 里实现多态。这些内容与模块 1《基础准备》直接衔接：模块 1 的 container_of、寄存器位域、原子操作与锁是“进阶应用”，本模块负责把它们之下的语言基础打牢。',
      },
      {
        title: 'C++ 训练覆盖什么，以及与用户态栈的关联',
        content: 'C++ 部分（0.7.2，共 6 节）从最基础讲到驱动相关核心，不旁逸到用不上的语言角落：(1) 从 C 到 C++——引用、函数重载、命名空间、bool/nullptr/auto，以及 extern "C" 边界；(2) 类、构造/析构与 RAII——把资源获取/释放绑定到对象生命周期，替代 C 的 goto 清理；(3) 拷贝、移动与资源管理——浅拷贝二次释放、Rule of Three/Five、移动语义转移所有权；(4) 继承、虚函数与多态——vtable/vptr 机制，并与 C 的 ops 结构体一一对应；(5) 模板与泛型编程——编译期实例化、类型安全，STL 的基石；(6) STL 容器、算法与智能指针——vector/map/string、sort/lambda、unique_ptr/shared_ptr。这些正是 Mesa、ROCm/HIP、LLVM 里管理 GPU 资源、命令缓冲、编译器 Pass 的日常写法。学完后你会清晰地看到：C++ 的虚函数就是内核 ops 结构体的语言内建版，C++ 的 RAII 就是内核 goto 清理的自动化版——两种范式互为镜像。',
      },
    ],
    keyBooks: [
      {
        title: 'The C Programming Language (K&R, 2nd Edition)',
        author: 'Brian W. Kernighan, Dennis M. Ritchie',
        isbn: '978-0131103627',
        relevance: 'C 语言的经典权威，简洁而精确。读内核 C 之前打基础的首选，尤其是指针与数组、结构体两章。',
      },
      {
        title: 'C Programming: A Modern Approach (2nd Edition)',
        author: 'K. N. King',
        isbn: '978-0393979503',
        relevance: '比 K&R 更适合自学的现代 C 教材，对类型、整数提升、未定义行为、内存模型讲解充分，配套练习多。',
      },
      {
        title: 'A Tour of C++ (3rd Edition)',
        author: 'Bjarne Stroustrup',
        isbn: '978-0136816485',
        relevance: 'C++ 之父写的精炼现代 C++ 导览，几百页覆盖 RAII、移动语义、模板、STL，正好对应本模块 C++ 部分的范围。',
      },
    ],
    onlineResources: [
      {
        title: 'cppreference.com — C/C++ 标准库与语言参考',
        url: 'https://en.cppreference.com/',
        type: 'doc',
        description: '最权威的 C/C++ 在线参考。查任何函数、容器、语言特性的精确语义都应以它为准。',
      },
      {
        title: 'Compiler Explorer (godbolt.org)',
        url: 'https://godbolt.org/',
        type: 'doc',
        description: '在线查看 C/C++ 代码编译出的汇编与名字改写，验证整数提升、内联、模板实例化等行为的利器。',
      },
      {
        title: 'Linux kernel coding style',
        url: 'https://www.kernel.org/doc/html/latest/process/coding-style.html',
        type: 'doc',
        description: '内核 C 代码风格规范，理解为什么内核偏好 goto 清理、固定宽度类型、特定命名约定。',
      },
      {
        title: 'learncpp.com — 系统化 C++ 教程',
        url: 'https://www.learncpp.com/',
        type: 'doc',
        description: '免费、循序渐进的现代 C++ 教程，作为本模块 C++ 部分的扩展阅读非常合适。',
      },
    ],
  },
  codeReading: [
    {
      title: '内核 C：amdgpu 的 ops 结构体多态',
      description: '内核用一组函数指针（ops 结构体）实现“一个接口、多种实现”。这是 amdgpu 初始化的骨架，也是 cc-c-7 那节课的真实对应。',
      file: 'drivers/gpu/drm/amd/include/amd_shared.h (简化示意)',
      language: 'c',
      code: `/* 每个 IP block（GFX/SDMA/DC/VCN...）都提供一份 amd_ip_funcs 实现 */
struct amd_ip_funcs {
    const char *name;
    int  (*early_init)(void *handle);
    int  (*sw_init)(void *handle);     /* 软件初始化 */
    int  (*hw_init)(void *handle);     /* 硬件初始化 */
    int  (*hw_fini)(void *handle);
    int  (*suspend)(void *handle);
    int  (*resume)(void *handle);
    /* ... 还有一长串函数指针 ... */
};

/* 初始化时统一遍历、判空、分发（极简示意）：
   for (i = 0; i < adev->num_ip_blocks; i++) {
       const struct amd_ip_funcs *f = adev->ip_blocks[i].version->funcs;
       if (f->hw_init) {            // 判空：该 op 可选
           r = f->hw_init(adev);    // 分发：各 IP block 执行各自实现
           if (r) goto init_failed; // 失败：goto 逆序清理
       }
   } */`,
      annotations: [
        'struct amd_ip_funcs 是一组函数指针——这就是 C 的“接口”',
        '每个 IP block 填入自己的实现，调用方只依赖这个接口（多态）',
        '调用前 if (f->hw_init) 判空，支持“可选操作”并避免空指针崩溃',
        '失败路径 goto init_failed 逆序清理已初始化的 block——内核标志性写法',
      ],
    },
    {
      title: '用户态 C++：用 RAII + unique_ptr 管理资源',
      description: 'Mesa/HIP/LLVM 用 RAII 与智能指针管理 GPU 资源，离开作用域自动释放，无需手写清理。这是 cc-cpp-2/6 的真实对应。',
      file: '示意：用户态 GPU 栈的资源管理风格',
      language: 'cpp',
      code: `#include <memory>
#include <vector>

struct GpuBuffer {                 // RAII 包装一块 GPU 资源
    explicit GpuBuffer(size_t bytes) { /* 分配 GPU 内存 */ }
    ~GpuBuffer() { /* 释放 GPU 内存（自动） */ }
};

void submit_commands() {
    auto cmd = std::make_unique<GpuBuffer>(4096);   // 独占所有权
    std::vector<std::unique_ptr<GpuBuffer>> pool;   // 容器持有并自动管理
    pool.push_back(std::make_unique<GpuBuffer>(8192));
    // ... 使用 cmd 与 pool ...
    if (/* 出错 */ false) return;   // 提前返回也安全：析构自动发生
}                                   // 作用域结束：所有 GpuBuffer 逆序自动析构`,
      annotations: [
        'GpuBuffer 用构造/析构包住资源的获取与释放（RAII）',
        'unique_ptr 表达独占所有权，离开作用域自动释放，零手写 free',
        'vector<unique_ptr<...>> 持有一组资源并自动管理生命周期',
        '即便中途 return（或抛异常），所有对象也会逆序析构——对照内核 goto 清理',
      ],
    },
  ],
  miniProject: {
    title: '同一个 IP block 分发器：C 版 vs C++ 版',
    description: '把“一个接口、多种实现”的分发器用 C（ops 结构体）和 C++（虚函数）各实现一遍，并写一份对比笔记。这个项目把整个模块串起来，直观展示 ops 结构体与 vtable 是同一思想的两种表达。',
    objectives: [
      '用 C 的函数指针 + ops 结构体实现一个 IP block 分发器（init/fini）',
      '用 C++ 的抽象基类 + 虚函数实现等价功能，并用 vector<unique_ptr<Base>> 管理生命周期',
      '对比两种实现的资源清理方式：C 的 goto 逆序 vs C++ 的 RAII 自动析构',
      '用 ASan 验证两个版本都无内存泄漏',
    ],
    steps: [
      '创建 ip_dispatch_c/，用 cc-c-7 的 ops 结构体实现 gfx/sdma 两个 block，主循环判空后分发，并加上 goto 错误清理',
      '创建 ip_dispatch_cpp/，用 cc-cpp-4 的抽象基类 IpBlock + 派生类 + 虚析构实现等价分发，用 vector<unique_ptr<IpBlock>> 持有',
      '分别用 gcc -fsanitize=address 和 g++ -std=c++17 -fsanitize=address 编译运行，确认输出一致且无泄漏',
      '写 notes/c_vs_cpp.md：列出“ops 指针 ⇄ vptr、ops 表 ⇄ vtable、goto 清理 ⇄ RAII”的对应关系，并谈谈内核为何选 C',
      '把两份代码与对比笔记整理进个人作品集（portfolio），作为可展示的产出物',
    ],
    expectedOutput: `# 两个版本运行输出一致：
GFX hw_init
SDMA hw_init
GFX fini
# ASan 对两个版本均报告：无内存泄漏
# 并产出一份 notes/c_vs_cpp.md 对比笔记（portfolio 产出物）`,
    githubTemplate: 'https://github.com/torvalds/linux/blob/master/drivers/gpu/drm/amd/include/amd_shared.h',
  },
  interviewQuestions: [
    {
      question: '声明（declaration）和定义（definition）有什么区别？把一个全局变量的定义放进头文件会发生什么？',
      difficulty: 'easy',
      hint: '从“分配实体 vs 仅告知存在”切入，再想头文件被多个 .c 包含时各得到什么。',
      answer: '声明只告诉编译器“某个名字存在、类型是什么”，不分配实体；定义才真正分配存储或给出函数体。把全局变量的定义放进头文件，会让每个 #include 它的 .c 都得到一份定义，链接时报 multiple definition。正确做法：头文件放 extern 声明，定义放且只放一个 .c。这是 ODR（一处定义原则）在工程上的落地，也是内核共享全局符号的标准方式。',
    },
    {
      question: '为什么内核用 u32/u64 而不是 int/long？整数提升会怎样引发 bug？',
      difficulty: 'medium',
      hint: '从硬件位宽确定性 + 跨架构 ABI 讲定宽类型；从“窄整数提升到 int”讲陷阱。',
      answer: '寄存器、命令包、固件结构体要求确定的位宽，u32 在任何平台都是 32 位，而 int/long 大小随 ABI 变化，用裸类型会字段错位；同时内核跨多架构，定宽类型保证布局一致。整数提升的陷阱：比 int 窄的整数（u8/u16）运算前会提升为 int，例如 u8 相加不会按 8 位回绕；有符号与无符号混合时通常转无符号，导致 unsigned 的 a-1 变成巨大正数、size_t 倒序循环死循环等。所以位运算、掩码、寄存器一律用无符号定宽类型。',
    },
    {
      question: '什么是 RAII？它如何替代 C 的 goto 清理，又为什么对异常安全重要？',
      difficulty: 'medium',
      hint: '把“资源释放绑定析构”和“栈展开必触发析构”讲清楚。',
      answer: 'RAII 让构造函数获取资源、析构函数释放资源，资源生命周期绑定对象生命周期。栈对象离开作用域一定按逆序析构，于是资源释放被语言保证，不必像 C 那样在每个失败/返回点手工 goto 清理。对异常安全尤其关键：抛异常时栈展开会析构沿途所有已构造对象，自动释放锁/内存/文件，不会因异常跳过手写清理而泄漏。标准库的 lock_guard、unique_ptr、vector 都是 RAII 的体现。',
    },
    {
      question: 'C 没有类，如何实现多态？它与 C++ 虚函数（vtable）是什么关系？',
      difficulty: 'hard',
      hint: '从“ops 结构体 = 手写 vtable”切入，对照 vptr/vtable。',
      answer: 'C 用“函数指针 + ops 结构体”手写多态：把一组操作声明为函数指针字段，不同对象填入不同实现，调用方通过 obj->ops->method(obj) 统一分发。这本质就是手写的虚函数表。C++ 的虚函数由编译器自动为每个含虚函数的类生成 vtable，对象头部藏一个 vptr 指向它，obj->method() 经 vptr 间接跳转——与 C 手写 ops 一一对应，只是 C++ 把建表、填表、间接调用自动化，并加上类型检查与 this 隐式传递。内核选手写 ops 是为了精确控制 ABI、内存布局与零隐藏开销。',
    },
  ],
};
