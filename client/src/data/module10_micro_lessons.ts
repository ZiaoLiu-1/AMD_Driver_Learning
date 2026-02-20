// ============================================================
// AMD Linux Driver Learning Platform - Module 10 Micro-Lessons
// Module 10: Testing & CI (测试与 CI)
// 4 lessons in 2 groups, ~15 min each, total ~60 min
// ============================================================
import type { MicroLessonModule } from './micro_lesson_types';

export const module10MicroLessons: MicroLessonModule = {
  moduleId: 'testing',
  groups: [
    // ════════════════════════════════════════════════════════════
    // Group 10.1: 测试框架
    // ════════════════════════════════════════════════════════════
    {
      id: '10-1',
      number: '10.1',
      title: '测试框架',
      titleEn: 'Testing Frameworks',
      icon: '🧪',
      description: '深入理解 IGT GPU Tools 测试框架的架构和用法，学会编写 amdgpu 专用的 IGT 测试用例，从读懂现有测试到独立编写新测试。',
      lessons: [
        // ── Lesson 10.1.1 ──────────────────────────────────────
        {
          id: '10-1-1',
          number: '10.1.1',
          title: 'IGT GPU 测试框架详解',
          titleEn: 'IGT GPU Tools Framework Deep Dive',
          duration: 15,
          difficulty: 'intermediate',
          tags: ['IGT', 'testing', 'GPU', 'framework', 'amdgpu'],
          concept: {
            summary: 'IGT GPU Tools 是 Linux GPU 驱动的标准测试框架。它提供了一套丰富的 C 宏和辅助库，让你可以编写结构化的 GPU 测试——从简单的 GEM buffer 分配到复杂的多显示器原子提交。理解 IGT 的架构是编写高质量驱动测试的基础。',
            explanation: [
              'IGT（Intel GPU Tools，现在已经是供应商无关的）是所有主流 Linux GPU 驱动共用的测试框架。它的源码在 https://gitlab.freedesktop.org/drm/igt-gpu-tools，包含超过 1000 个测试用例。对于 amdgpu 开发，IGT 是验证驱动修改是否引入回归的主要工具。',
              'IGT 的核心架构围绕三个概念：测试（test）、子测试（subtest）和 fixture。一个 IGT 测试文件通常包含一个 igt_main 块（或 igt_simple_main 用于单一测试），内部通过 igt_subtest 定义多个子测试。fixture 通过 igt_fixture 块定义，用于在子测试之间共享的初始化和清理代码。这种结构让你可以在一个文件中组织多个相关但独立的测试。',
              'IGT 提供了丰富的断言宏：igt_assert(cond) 是最基本的断言，失败时终止当前子测试并报告 FAIL；igt_assert_eq(a, b) 比较两个值，失败时打印两个值方便调试；igt_assert_fd(fd) 断言文件描述符有效；igt_assert_lte(a, b) 断言 a <= b。这些宏内部使用 longjmp 实现跳转，确保测试失败后能正确清理资源。',
              'igt_require(cond) 是另一个关键宏——当条件不满足时，它跳过（SKIP）当前子测试而不是标记为 FAIL。这用于处理硬件能力差异：例如某个测试需要 VCN 视频引擎，但测试机器可能没有，此时 igt_require 会优雅地跳过而不是报错。这对于在不同硬件上运行同一套测试非常重要。',
              'amdgpu 的 IGT 测试集中在 tests/amdgpu/ 目录下，包括：amd_basic（基础功能测试：打开设备、查询信息）、amd_cs_nop（命令提交空操作测试）、amd_deadlock（死锁检测测试）、amd_pci_unplug（热插拔测试）等。每个文件测试 amdgpu 驱动的一个特定方面。此外 tests/ 根目录下的通用 DRM 测试（如 kms_flip、kms_cursor_crc、gem_create）也会在 amdgpu 上运行。',
            ],
            keyPoints: [
              'IGT 是 Linux GPU 驱动的标准测试框架，1000+ 测试用例覆盖所有 DRM 功能',
              'igt_main / igt_subtest / igt_fixture 三层结构组织测试、子测试和共享初始化',
              'igt_assert 系列宏用于断言，失败标记 FAIL；igt_require 用于前置条件检查，不满足标记 SKIP',
              'amdgpu 专用测试在 tests/amdgpu/ 目录，通用 DRM 测试也在 amdgpu 上运行',
              'IGT 测试结果有四种状态：PASS / FAIL / SKIP / TIMEOUT',
              '运行单个测试：./build/tests/amdgpu/amd_basic；运行子测试：--run-subtest "subtest-name"',
            ],
          },
          diagram: {
            title: 'IGT 测试框架架构与执行流程',
            content: `IGT GPU Tools 架构概览

IGT 测试文件结构                          执行流程
─────────────────                          ────────

tests/amdgpu/amd_basic.c                  $ ./build/tests/amd_basic
┌──────────────────────────┐                     │
│ #include "igt.h"         │                     ▼
│ #include "lib/amdgpu/    │              igt_main 入口
│          amd_ip_blocks.h"│                     │
│                          │              ┌──────┴──────┐
│ igt_main {               │              │             │
│                          │              ▼             ▼
│   igt_fixture {          │         igt_fixture   igt_fixture
│     fd = drm_open_...(); │         (setup)       (teardown)
│     amdgpu_device_init();│              │
│   }                      │              ▼
│                          │    ┌─────────┴─────────┐
│   igt_subtest("query") { │    ▼                   ▼
│     igt_assert(...);     │  subtest "query"    subtest "memory"
│   }                      │    │                   │
│                          │    ├─ igt_assert()     ├─ igt_require()
│   igt_subtest("memory") {│    │  PASS / FAIL      │  SKIP if N/A
│     igt_require(has_vram);│   │                   ├─ igt_assert()
│     igt_assert_eq(...);  │    │                   │  PASS / FAIL
│   }                      │    ▼                   ▼
│                          │  ┌──────────────────────┐
│   igt_fixture {          │  │  Results Summary     │
│     amdgpu_device_deinit │  │  query:    PASS      │
│     close(fd);           │  │  memory:   PASS      │
│   }                      │  │  Total: 2/2 PASS     │
│ }                        │  └──────────────────────┘
└──────────────────────────┘

IGT 测试结果状态：
  PASS    ✓  所有断言通过
  FAIL    ✗  某个 igt_assert 失败
  SKIP    ○  igt_require 条件不满足（硬件不支持等）
  TIMEOUT ⏰ 测试超过最大运行时间（默认 120s）`,
            caption: 'IGT 测试由 igt_main 入口、igt_fixture 共享初始化/清理、igt_subtest 独立子测试三部分组成。每个子测试独立运行，互不影响。',
          },
          codeWalk: {
            title: '解析一个真实的 IGT amdgpu GEM BO 测试',
            file: 'tests/amdgpu/amd_basic.c',
            language: 'c',
            code: `/* IGT amdgpu 基础测试 — GEM Buffer Object 分配与信息查询
 * 文件: tests/amdgpu/amd_basic.c (简化版)
 */
#include "igt.h"
#include <amdgpu.h>
#include <amdgpu_drm.h>

static int fd;                    /* DRM 设备文件描述符 */
static amdgpu_device_handle dev;  /* libdrm amdgpu 设备句柄 */
static uint32_t major_ver, minor_ver;

igt_main
{
    /* igt_fixture 在所有子测试之前执行一次
     * 用于打开设备和初始化共享资源 */
    igt_fixture {
        fd = drm_open_driver(DRIVER_AMDGPU);
        /* drm_open_driver 打开 /dev/dri/card* 并验证是 amdgpu */
        igt_require(fd >= 0);

        int r = amdgpu_device_initialize(fd, &major_ver,
                                         &minor_ver, &dev);
        igt_assert_eq(r, 0);
        /* 此时 dev 可以调用所有 libdrm/amdgpu API */
    }

    igt_subtest("query-info") {
        struct amdgpu_gpu_info gpu_info = {};
        int r = amdgpu_query_gpu_info(dev, &gpu_info);
        igt_assert_eq(r, 0);
        /* Navi33 应该有非零的 VRAM 大小 */
        igt_assert(gpu_info.vram_size > 0);
        igt_info("GPU VRAM: %llu MB\\n",
                 gpu_info.vram_size / (1024 * 1024));
    }

    igt_subtest("gem-create") {
        struct amdgpu_bo_alloc_request req = {};
        amdgpu_bo_handle bo;
        /* 分配 4KB VRAM buffer */
        req.alloc_size = 4096;
        req.phys_alignment = 4096;
        req.preferred_heap = AMDGPU_GEM_DOMAIN_VRAM;

        int r = amdgpu_bo_alloc(dev, &req, &bo);
        igt_assert_eq(r, 0);
        /* 断言 bo 句柄有效 */
        igt_assert(bo != NULL);

        /* 清理: 释放 buffer object */
        r = amdgpu_bo_free(bo);
        igt_assert_eq(r, 0);
    }

    igt_subtest("vram-gtt-migration") {
        /* 此测试需要 GPU 同时支持 VRAM 和 GTT */
        struct drm_amdgpu_info_vram_gtt vram_gtt = {};
        igt_require(amdgpu_query_heap_info(dev,
            AMDGPU_GEM_DOMAIN_VRAM, 0, &vram_gtt) == 0);
        igt_require(vram_gtt.vram_size > 0);

        /* ... 实际的迁移测试代码 ... */
        igt_info("VRAM→GTT migration test passed\\n");
    }

    /* igt_fixture 在所有子测试之后执行一次
     * 用于释放共享资源 */
    igt_fixture {
        amdgpu_device_deinitialize(dev);
        drm_close_driver(fd);
    }
}`,
            annotations: [
              'igt_main 是 IGT 的入口宏，展开为 main() + 测试框架初始化代码',
              'drm_open_driver(DRIVER_AMDGPU) 遍历 /dev/dri/card* 直到找到 amdgpu 驱动的设备',
              'amdgpu_device_initialize() 是 libdrm/amdgpu 的初始化函数，返回设备句柄',
              'igt_assert_eq(r, 0) 断言返回值为 0，失败时会打印实际值方便调试',
              'igt_require(vram_gtt.vram_size > 0) 跳过不支持 VRAM 的设备（如 APU 无独立 VRAM）',
              'igt_info() 打印信息到测试输出，不影响 PASS/FAIL 状态',
            ],
            explanation: '这个测试展示了 IGT 的典型结构：igt_fixture 打开设备，多个 igt_subtest 各测试一个功能点，最后 igt_fixture 清理资源。注意 igt_require 的使用——"vram-gtt-migration" 子测试在无 VRAM 的设备上会优雅地 SKIP 而不是 FAIL。这种模式让同一套测试能在不同硬件上正确运行。',
          },
          miniLab: {
            title: '编译和运行 IGT amdgpu 测试',
            objective: '从源码编译 IGT GPU Tools，运行 amdgpu 基础测试，学会解读测试输出。',
            steps: [
              '克隆 IGT 源码：git clone https://gitlab.freedesktop.org/drm/igt-gpu-tools.git && cd igt-gpu-tools',
              '安装依赖：sudo apt install meson ninja-build libdrm-dev libcairo2-dev libpixman-1-dev libudev-dev libprocps-dev libjson-c-dev libdw-dev flex bison',
              '编译：meson build && ninja -C build',
              '列出所有 amdgpu 测试：ls build/tests/amdgpu/',
              '运行基础测试：sudo ./build/tests/amdgpu/amd_basic（需要 root 访问 GPU）',
              '运行单个子测试：sudo ./build/tests/amdgpu/amd_basic --run-subtest "query-info"',
              '查看所有子测试列表：./build/tests/amdgpu/amd_basic --list-subtests',
              '运行通用 GEM 创建测试：sudo ./build/tests/gem_create --device /dev/dri/card0',
            ],
            expectedOutput: `$ sudo ./build/tests/amdgpu/amd_basic
IGT-Version: 1.28 (x86_64)
Starting subtest: query-info
Subtest query-info: SUCCESS (0.003s)
Starting subtest: gem-create
Subtest gem-create: SUCCESS (0.001s)
Starting subtest: vram-gtt-migration
Subtest vram-gtt-migration: SUCCESS (0.012s)

$ ./build/tests/amdgpu/amd_basic --list-subtests
query-info
gem-create
vram-gtt-migration
semaphore
...`,
            hint: '如果测试报 "Permission denied"，确保使用 sudo。如果报 "No amdgpu device found"，检查 amdgpu 驱动是否已加载：lsmod | grep amdgpu。某些测试可能需要空闲的 GPU（没有桌面环境运行）。',
          },
          debugExercise: {
            title: '修复错误的 IGT 测试代码',
            language: 'c',
            description: '以下 IGT 测试代码有多个问题导致它不能正确运行。找出所有问题。',
            question: '这段 IGT 测试有哪些问题？为什么测试可能会误报 PASS 或泄漏资源？',
            buggyCode: `#include "igt.h"
#include <amdgpu.h>

igt_main
{
    int fd;
    amdgpu_device_handle dev;

    /* BUG 1: fixture 中没有错误检查 */
    igt_fixture {
        fd = drm_open_driver(DRIVER_AMDGPU);
        amdgpu_device_initialize(fd, NULL, NULL, &dev);
    }

    igt_subtest("alloc-test") {
        struct amdgpu_bo_alloc_request req = {};
        amdgpu_bo_handle bo;
        req.alloc_size = 4096;
        req.preferred_heap = AMDGPU_GEM_DOMAIN_VRAM;
        amdgpu_bo_alloc(dev, &req, &bo);
        /* BUG 2: 没有断言分配结果 */
        /* BUG 3: 没有释放 bo — 资源泄漏 */
    }

    /* BUG 4: 没有 teardown fixture */
}`,
            hint: '检查四个方面：初始化错误处理、断言缺失、资源泄漏、cleanup fixture。',
            answer: '四个问题：（1）fixture 中 amdgpu_device_initialize 的返回值没有检查——如果初始化失败，dev 是无效句柄，后续所有子测试都会用无效句柄操作，可能导致 segfault 而非有意义的测试失败。修复：int r = amdgpu_device_initialize(...); igt_assert_eq(r, 0);（2）amdgpu_bo_alloc 的返回值没有断言——即使分配失败（返回非零错误码），测试也不会报 FAIL，这是误报 PASS 的典型原因。修复：igt_assert_eq(amdgpu_bo_alloc(dev, &req, &bo), 0);（3）分配的 bo 没有调用 amdgpu_bo_free(bo) 释放——在大量子测试运行时会导致 GPU 内存泄漏，可能让后续测试因内存不足而失败。修复：在子测试末尾添加 amdgpu_bo_free(bo);（4）缺少 teardown igt_fixture——fd 和 dev 没有关闭和反初始化。修复：添加 igt_fixture { amdgpu_device_deinitialize(dev); drm_close_driver(fd); }。这四类问题在 Code Review 中是最常被指出的。',
          },
          interviewQ: {
            question: '描述你如何为一个新的 amdgpu 功能编写 IGT 测试。从测试设计到最终提交，你的流程是什么？',
            difficulty: 'medium',
            hint: '从理解被测功能的 UAPI 接口开始，设计正面和负面测试用例，使用 igt_require 处理硬件差异，并确保资源正确清理。',
            answer: '编写 IGT 测试的完整流程：（1）理解功能：阅读 UAPI 头文件（include/uapi/drm/amdgpu_drm.h）了解新功能暴露的 ioctl 接口和参数范围，阅读内核端实现了解边界条件。（2）测试设计：设计正面测试（valid parameters → expected results）和负面测试（invalid parameters → expected errors）。例如对 BO 分配：正面测试验证 VRAM/GTT/GDS 各 heap 分配成功，负面测试验证 size=0 或超大 size 返回 -EINVAL/-ENOMEM。（3）编写代码：创建 tests/amdgpu/amd_new_feature.c，使用 igt_main + igt_fixture + igt_subtest 结构，每个子测试覆盖一个场景。用 igt_require 检查硬件是否支持该功能。（4）构建集成：在 tests/amdgpu/meson.build 中添加新测试文件。（5）本地验证：在真实 GPU 上运行测试确认全部 PASS，在不支持该功能的旧 GPU 上确认相关子测试正确 SKIP。（6）提交：生成补丁发送到 igt-dev@lists.freedesktop.org 邮件列表。',
            amdContext: 'AMD 面试中可能会让你现场设计一个 IGT 测试用例。关键是展示你理解正面/负面测试的区别、igt_require 的使用、以及资源管理的重要性。',
          },
        },

        // ── Lesson 10.1.2 ──────────────────────────────────────
        {
          id: '10-1-2',
          number: '10.1.2',
          title: '编写 amdgpu IGT 测试',
          titleEn: 'Writing amdgpu IGT Tests',
          duration: 15,
          difficulty: 'intermediate',
          tags: ['IGT', 'amdgpu', 'libdrm', 'VRAM', 'test-writing'],
          concept: {
            summary: '本节从零开始编写一个完整的 amdgpu IGT 测试——VRAM 分配压力测试。你将使用 libdrm/amdgpu API（amdgpu_device_initialize、amdgpu_bo_alloc、amdgpu_cs_submit）编写正面和负面测试，并集成到 meson 构建系统中。',
            explanation: [
              '编写 amdgpu IGT 测试的第一步是理解 libdrm/amdgpu API。libdrm 为 amdgpu 提供了完整的用户态 API：amdgpu_device_initialize() 初始化设备并获取句柄；amdgpu_bo_alloc() 分配 GPU buffer object（BO）；amdgpu_bo_va_op() 管理 GPU 虚拟地址映射；amdgpu_cs_submit() 提交命令到 GPU 执行。这些 API 在 <amdgpu.h> 中声明，内部通过 ioctl 与内核 amdgpu 驱动通信。',
              '一个好的测试应该同时包含正面测试（positive test）和负面测试（negative test）。正面测试验证"正确的输入产生正确的结果"——例如分配一个 4KB VRAM buffer 应该成功。负面测试验证"错误的输入被正确拒绝"——例如分配 size=0 的 buffer 应该返回 -EINVAL，分配超过 VRAM 总量的 buffer 应该返回 -ENOMEM。负面测试在内核代码中尤为重要，因为它们验证了驱动的错误处理路径。',
              '将新测试集成到 IGT 的 meson 构建系统非常简单：在 tests/amdgpu/meson.build 中将你的测试文件名添加到测试列表中。meson 会自动编译并将其注册为可运行的测试。运行 ninja -C build 重新编译，然后用 sudo ./build/tests/amdgpu/amd_your_test 执行。',
              '在编写涉及命令提交（CS）的测试时，你需要：创建一个 IB（Indirect Buffer）来存放 GPU 命令；使用 amdgpu_bo_alloc 分配 IB 用的内存；使用 amdgpu_bo_va_op 将 IB 映射到 GPU 虚拟地址空间；使用 amdgpu_cs_submit 将 IB 提交到特定的 ring（GFX、SDMA 等）；使用 amdgpu_cs_query_fence_status 等待命令完成。对于简单的功能性测试，提交一个 NOP（空操作）包就足够了。',
              '测试命名和组织也很重要。IGT 的惯例是：文件名描述被测功能（如 amd_vram_alloc）、子测试名用连字符分隔的描述性名称（如 "basic-alloc"、"oversize-alloc-negative"、"multi-bo-stress"）。良好的命名让 CI 报告中可以快速识别哪个功能出了问题。',
            ],
            keyPoints: [
              'libdrm/amdgpu API: amdgpu_device_initialize → amdgpu_bo_alloc → amdgpu_cs_submit',
              '正面测试验证正确行为（分配成功）、负面测试验证错误处理（无效参数被拒绝）',
              '集成到 meson 构建：在 tests/amdgpu/meson.build 中添加文件名即可',
              '命令提交测试流程：alloc IB → va_op map → cs_submit → query_fence',
              '子测试命名惯例：描述性连字符名称，如 "basic-alloc"、"oversize-negative"',
              'igt_require 检查硬件能力，确保测试在不同 GPU 上都能正确 PASS 或 SKIP',
            ],
          },
          diagram: {
            title: '编写 amdgpu IGT 测试的完整工作流',
            content: `从零编写一个 amdgpu IGT 测试

Step 1: 创建测试文件
─────────────────────
tests/amdgpu/
├── amd_basic.c            ← 已有的基础测试
├── amd_cs_nop.c           ← 已有的 CS NOP 测试
├── amd_deadlock.c         ← 已有的死锁测试
├── amd_vram_stress.c      ← 你的新测试 ★
└── meson.build            ← 在此注册新测试

Step 2: 测试文件结构
─────────────────────
amd_vram_stress.c
┌──────────────────────────────────────────────┐
│ #include "igt.h"                              │
│ #include <amdgpu.h>                           │
│                                               │
│ igt_main {                                    │
│   igt_fixture { /* 打开设备 */ }              │
│                                               │
│   /* 正面测试 */                               │
│   igt_subtest("basic-alloc")      → PASS ✓    │
│   igt_subtest("multi-size-alloc") → PASS ✓    │
│   igt_subtest("vram-gtt-both")    → PASS ✓    │
│                                               │
│   /* 负面测试 */                               │
│   igt_subtest("zero-size-negative")  → PASS ✓ │
│   igt_subtest("oversize-negative")   → PASS ✓ │
│                                               │
│   /* 压力测试 */                               │
│   igt_subtest("stress-1000-allocs")  → PASS ✓ │
│                                               │
│   igt_fixture { /* 关闭设备 */ }              │
│ }                                             │
└──────────────────────────────────────────────┘

Step 3: 注册到构建系统
─────────────────────
# tests/amdgpu/meson.build
amdgpu_tests = [
    'amd_basic',
    'amd_cs_nop',
    'amd_deadlock',
    'amd_vram_stress',    ← 添加新测试
]

Step 4: 编译 & 运行
─────────────────────
$ ninja -C build
$ sudo ./build/tests/amdgpu/amd_vram_stress
  Subtest basic-alloc:          SUCCESS (0.001s)
  Subtest multi-size-alloc:     SUCCESS (0.003s)
  Subtest zero-size-negative:   SUCCESS (0.001s)
  Subtest oversize-negative:    SUCCESS (0.002s)
  Subtest stress-1000-allocs:   SUCCESS (0.234s)`,
            caption: '编写 IGT 测试的四步流程：创建文件 → 编写测试 → 注册构建 → 编译运行。正面和负面测试缺一不可。',
          },
          codeWalk: {
            title: '完整的 VRAM 分配 IGT 测试',
            file: 'tests/amdgpu/amd_vram_stress.c',
            language: 'c',
            code: `/* amd_vram_stress.c — VRAM 分配压力测试
 * 验证 amdgpu 的 GEM BO 分配和释放路径
 */
#include "igt.h"
#include <amdgpu.h>
#include <amdgpu_drm.h>

static int fd;
static amdgpu_device_handle dev;
static struct amdgpu_gpu_info gpu_info;

static amdgpu_bo_handle
alloc_bo(uint64_t size, uint32_t domain)
{
    struct amdgpu_bo_alloc_request req = {
        .alloc_size = size,
        .phys_alignment = 4096,
        .preferred_heap = domain,
    };
    amdgpu_bo_handle bo;
    int r = amdgpu_bo_alloc(dev, &req, &bo);
    return r == 0 ? bo : NULL;
}

igt_main
{
    igt_fixture {
        uint32_t major, minor;
        fd = drm_open_driver(DRIVER_AMDGPU);
        igt_require(fd >= 0);
        igt_assert_eq(amdgpu_device_initialize(fd,
            &major, &minor, &dev), 0);
        igt_assert_eq(amdgpu_query_gpu_info(dev,
            &gpu_info), 0);
    }

    /* === 正面测试 === */
    igt_subtest("basic-vram-alloc") {
        amdgpu_bo_handle bo = alloc_bo(4096,
            AMDGPU_GEM_DOMAIN_VRAM);
        igt_assert(bo != NULL);
        igt_assert_eq(amdgpu_bo_free(bo), 0);
    }

    igt_subtest("basic-gtt-alloc") {
        amdgpu_bo_handle bo = alloc_bo(4096,
            AMDGPU_GEM_DOMAIN_GTT);
        igt_assert(bo != NULL);
        igt_assert_eq(amdgpu_bo_free(bo), 0);
    }

    igt_subtest("multi-size-alloc") {
        uint64_t sizes[] = {4096, 64*1024, 1*1024*1024,
                            16*1024*1024};
        for (int i = 0; i < ARRAY_SIZE(sizes); i++) {
            amdgpu_bo_handle bo = alloc_bo(sizes[i],
                AMDGPU_GEM_DOMAIN_VRAM);
            igt_assert(bo != NULL);
            igt_assert_eq(amdgpu_bo_free(bo), 0);
        }
    }

    /* === 负面测试 === */
    igt_subtest("zero-size-negative") {
        /* size=0 应该被驱动拒绝 */
        amdgpu_bo_handle bo = alloc_bo(0,
            AMDGPU_GEM_DOMAIN_VRAM);
        igt_assert(bo == NULL);
    }

    igt_subtest("oversize-negative") {
        /* 分配超过 VRAM 总量的内存应该失败 */
        igt_require(gpu_info.vram_size > 0);
        uint64_t oversize = gpu_info.vram_size * 2;
        amdgpu_bo_handle bo = alloc_bo(oversize,
            AMDGPU_GEM_DOMAIN_VRAM);
        igt_assert(bo == NULL);
    }

    /* === 压力测试 === */
    igt_subtest("stress-alloc-free-cycle") {
        const int count = 1000;
        for (int i = 0; i < count; i++) {
            amdgpu_bo_handle bo = alloc_bo(4096,
                AMDGPU_GEM_DOMAIN_VRAM);
            igt_assert(bo != NULL);
            igt_assert_eq(amdgpu_bo_free(bo), 0);
        }
    }

    igt_fixture {
        amdgpu_device_deinitialize(dev);
        drm_close_driver(fd);
    }
}`,
            annotations: [
              'alloc_bo 辅助函数封装了 amdgpu_bo_alloc，简化子测试中的代码',
              'AMDGPU_GEM_DOMAIN_VRAM 在 GPU 显存分配，AMDGPU_GEM_DOMAIN_GTT 在系统内存（GPU 可访问）分配',
              '"zero-size-negative" 是负面测试——验证驱动正确拒绝无效输入',
              '"oversize-negative" 用 igt_require 确保设备有 VRAM 信息，然后测试过量分配',
              '"stress-alloc-free-cycle" 循环 1000 次分配/释放，检测内存泄漏和竞态条件',
              '每个 igt_subtest 独立运行——一个子测试的 FAIL 不影响其他子测试',
            ],
            explanation: '这个完整的测试文件展示了 IGT 测试编写的最佳实践：辅助函数减少重复代码、正面测试覆盖正常路径、负面测试覆盖错误处理、压力测试检测资源泄漏。特别注意负面测试——内核驱动必须正确处理所有无效输入，否则可能导致内核崩溃或安全漏洞。',
          },
          miniLab: {
            title: '编写你的第一个 amdgpu IGT 测试',
            objective: '基于上面的代码模板，编写一个测试 GPU 信息查询的 IGT 测试，并在真实 GPU 上运行。',
            steps: [
              '在 igt-gpu-tools/tests/amdgpu/ 下创建 amd_query_test.c',
              '实现 igt_main，在 fixture 中初始化 amdgpu 设备',
              '添加 igt_subtest("query-vram-size") 验证 VRAM 大小 > 0',
              '添加 igt_subtest("query-fw-version") 查询 GFX 固件版本并验证非零',
              '在 tests/amdgpu/meson.build 中添加 "amd_query_test" 到测试列表',
              '编译：ninja -C build',
              '运行测试：sudo ./build/tests/amdgpu/amd_query_test',
              '验证所有子测试 PASS：--list-subtests 然后逐个运行',
            ],
            expectedOutput: `$ sudo ./build/tests/amdgpu/amd_query_test
IGT-Version: 1.28 (x86_64)
Starting subtest: query-vram-size
GPU VRAM: 8176 MB
Subtest query-vram-size: SUCCESS (0.001s)
Starting subtest: query-fw-version
GFX FW version: 0x006d
Subtest query-fw-version: SUCCESS (0.001s)`,
            hint: '使用 amdgpu_query_firmware_version() 查询固件版本。参考 tests/amdgpu/amd_basic.c 中已有的查询测试。如果编译报错找不到头文件，确保 libdrm-dev 和 libdrm-amdgpu1 已安装。',
          },
          debugExercise: {
            title: '找出 IGT 测试中的逻辑错误',
            language: 'c',
            description: '以下测试声称验证了 VRAM 分配的上限，但实际上有逻辑漏洞导致它永远不会发现真正的 bug。',
            question: '为什么这个测试不能有效检测 VRAM 分配的边界问题？',
            buggyCode: `igt_subtest("vram-boundary-test") {
    uint64_t total_vram = gpu_info.vram_size;
    uint64_t alloc_size = total_vram / 2;

    /* 分配 50% VRAM — 应该成功 */
    amdgpu_bo_handle bo1 = alloc_bo(alloc_size,
        AMDGPU_GEM_DOMAIN_VRAM);
    igt_assert(bo1 != NULL);

    /* 再分配 50% — 也应该成功 */
    amdgpu_bo_handle bo2 = alloc_bo(alloc_size,
        AMDGPU_GEM_DOMAIN_VRAM);
    igt_assert(bo2 != NULL);

    /* 再分配 50% — 应该失败 */
    amdgpu_bo_handle bo3 = alloc_bo(alloc_size,
        AMDGPU_GEM_DOMAIN_VRAM);
    igt_assert(bo3 == NULL);  /* 期望失败 */

    /* 清理 */
    amdgpu_bo_free(bo1);
    amdgpu_bo_free(bo2);
}`,
            hint: '思考 VRAM 的实际使用情况——桌面环境、固件、其他进程已经占用了一部分 VRAM。另外 amdgpu 驱动支持 VRAM 到 GTT 的自动迁移。',
            answer: '这个测试有两个根本问题：（1）VRAM 不是空的：系统启动后，桌面环境的 framebuffer、GPU 固件保留区、其他进程已经占用了部分 VRAM。total_vram / 2 的假设没有考虑已使用的 VRAM。bo1 和 bo2 的分配可能因为可用 VRAM 不足 total_vram 而失败，导致 assert 失败——这是假阳性（false positive）。修复：用 amdgpu_query_heap_info 获取 max_allocation 和当前可用量，而不是假设全部 VRAM 可用。（2）驱动可能自动迁移：当 VRAM 不足时，amdgpu 驱动的 TTM 内存管理器可能将旧的 BO 从 VRAM 迁移到 GTT（系统内存），腾出空间给新分配。所以 bo3 的分配可能成功（bo1 或 bo2 被迁移到 GTT），导致 igt_assert(bo3 == NULL) 失败——这也是假阳性。要正确测试 VRAM 边界，需要使用 AMDGPU_GEM_CREATE_NO_EVICT 标志阻止迁移。',
          },
          interviewQ: {
            question: '你如何为 amdgpu 驱动新增的一个 ioctl 编写完整的测试用例？设计正面和负面测试。',
            difficulty: 'hard',
            hint: '以一个假设的新 ioctl（如设置 GPU 优先级）为例，设计覆盖正常流程、边界条件、错误参数、权限检查的测试矩阵。',
            answer: '假设新增 DRM_IOCTL_AMDGPU_SET_PRIORITY（设置进程的 GPU 调度优先级），我的测试设计：正面测试：（1）set-default-priority：设置默认优先级 NORMAL → 验证 ioctl 返回 0；（2）set-high-priority：以 root 设置 HIGH 优先级 → 验证返回 0 且通过 GET_PRIORITY 确认生效；（3）set-low-priority：设置 LOW → 验证生效；（4）priority-affects-scheduling：创建 HIGH 和 LOW 两个进程，提交相同工作量，HIGH 应该更快完成。负面测试：（5）invalid-priority-value：传入 priority=9999（超出范围）→ 验证返回 -EINVAL；（6）invalid-fd：传入不是 amdgpu 的 fd → 验证返回 -ENODEV；（7）no-permission-high：以非 root 用户设置 HIGH → 验证返回 -EPERM（需要 CAP_SYS_NICE）；（8）double-set：连续设置两次不同优先级 → 验证最后一次生效。边界测试：（9）set-after-close：关闭 fd 后设置 → 验证不崩溃。每个子测试用 igt_subtest 包裹，权限相关测试用 igt_require(getuid() == 0) 或 igt_require(getuid() != 0) 做前置检查。',
            amdContext: 'AMD 面试中让你设计测试用例是考察你的系统思维——不只是"能不能工作"，还要思考"在什么情况下会出问题"。覆盖正面、负面、边界和权限测试展示了你对驱动安全性的理解。',
          },
        },
      ],
    },

    // ════════════════════════════════════════════════════════════
    // Group 10.2: CI 与内核测试
    // ════════════════════════════════════════════════════════════
    {
      id: '10-2',
      number: '10.2',
      title: 'CI 与内核测试',
      titleEn: 'CI & Kernel Testing',
      icon: '🔄',
      description: '掌握内核自测试框架（kselftest 和 KUnit）的使用方法，理解 AMD CI 基础设施的架构，学会解读 CI 管线结果并处理回归测试。',
      lessons: [
        // ── Lesson 10.2.1 ──────────────────────────────────────
        {
          id: '10-2-1',
          number: '10.2.1',
          title: 'Kernel Selftests 与 KUnit',
          titleEn: 'Kernel Selftests & KUnit',
          duration: 15,
          difficulty: 'intermediate',
          tags: ['kselftest', 'KUnit', 'TAP', 'drm_buddy', 'unit-test'],
          concept: {
            summary: 'Linux 内核有两套互补的测试框架：kselftest 用于从用户空间运行的功能测试（tools/testing/selftests/），KUnit 用于在内核空间运行的单元测试（通过 kunit_test 模块）。DRM 子系统广泛使用两者——kselftest/drm/ 测试 UAPI 接口，KUnit 测试内部算法如 drm_buddy 内存分配器。',
            explanation: [
              'Kernel Selftests（kselftest）是 Linux 内核的用户态测试框架。测试代码在 tools/testing/selftests/ 下，每个子系统有自己的目录。对于 DRM/GPU，相关测试在 tools/testing/selftests/drm/。这些测试编译为用户空间程序，通过 ioctl 与内核交互。运行方式：make -C tools/testing/selftests/drm run_tests。kselftest 输出 TAP（Test Anything Protocol）格式的结果，易于被 CI 系统解析。',
              'KUnit 是 Linux 内核的内建单元测试框架（Kernel Unit Testing Framework），从 Linux 5.5 开始引入。与 kselftest 不同，KUnit 测试运行在内核空间——你可以直接测试内核内部的函数和数据结构，无需通过 ioctl 接口。KUnit 测试通常编译为内核模块，加载时自动运行所有测试用例。',
              'KUnit 的核心宏：KUNIT_ASSERT_EQ(test, a, b) 断言 a == b，失败时立即停止当前测试（类似 assert）；KUNIT_EXPECT_EQ(test, a, b) 也断言 a == b，但失败时继续运行后续断言（类似 soft assert）。ASSERT 用于致命错误（继续运行没有意义），EXPECT 用于非致命错误（想看到所有失败项）。',
              'drm_buddy_test.c 是 DRM 子系统中最典型的 KUnit 测试之一。drm_buddy 是 DRM 的伙伴分配器（buddy allocator），用于管理 GPU VRAM 的物理地址空间。这个 KUnit 测试验证了分配、释放、合并、对齐等核心算法的正确性。因为这些算法是纯内核态的内部实现（不暴露给用户空间），所以只能用 KUnit 测试，不能用 kselftest。',
              'KUnit 的输出也是 TAP 格式。你可以通过两种方式运行 KUnit 测试：（1）编译为模块后 insmod：insmod drm_buddy_test.ko，然后 dmesg 查看结果；（2）使用 KUnit 的 Python 运行器：python3 tools/testing/kunit/kunit.py run --kconfig_add CONFIG_DRM_BUDDY_SELFTEST=m。后者更方便，因为它自动配置、编译、运行并解析结果。',
            ],
            keyPoints: [
              'kselftest 在用户态运行，通过 ioctl 测试 UAPI 接口；KUnit 在内核态运行，直接测试内部函数',
              'KUnit 双层断言：KUNIT_ASSERT（致命）停止测试 vs KUNIT_EXPECT（非致命）继续运行',
              'drm_buddy_test.c 测试 DRM 伙伴分配器——纯内核内部算法只能用 KUnit 测试',
              '两者都输出 TAP 格式结果，可被 CI 系统自动解析',
              'kselftest 运行：make -C tools/testing/selftests/drm run_tests',
              'KUnit 运行：python3 tools/testing/kunit/kunit.py run 或 insmod + dmesg',
            ],
          },
          diagram: {
            title: 'kselftest vs KUnit 对比与应用场景',
            content: `Linux 内核两套测试框架对比

                    kselftest                          KUnit
                    ─────────                          ─────
运行空间          用户空间 (Ring 3)                内核空间 (Ring 0)
代码位置          tools/testing/selftests/          drivers/gpu/drm/tests/
测试目标          UAPI 接口 (ioctl, sysfs)         内部函数/算法
硬件依赖          需要真实硬件                      可在 UML/QEMU 中运行
测试粒度          功能/集成测试                     单元测试
输出格式          TAP                               TAP

DRM 子系统的使用
─────────────────

kselftest (tools/testing/selftests/drm/)
┌──────────────────────────────────────┐
│  drm_mm.c     → 测试 DRM 内存管理器  │  ← 通过 ioctl
│  drm_buddy.c  → 测试伙伴分配器 API   │  ← 通过 ioctl
│  ...                                  │
│  编译: make -C tools/testing/         │
│        selftests/drm                  │
│  运行: sudo ./drm_mm                  │
└──────────────────────────────────────┘

KUnit (drivers/gpu/drm/tests/)
┌──────────────────────────────────────┐
│  drm_buddy_test.c  → 内部分配算法    │  ← 直接调用
│  drm_format_test.c → 像素格式转换    │    内核函数
│  drm_rect_test.c   → 矩形裁剪算法   │
│  drm_mm_test.c     → 内存管理器      │
│                                       │
│  运行方式 1: insmod drm_buddy_test.ko │
│             dmesg | grep "TAP"        │
│                                       │
│  运行方式 2: python3 tools/testing/   │
│    kunit/kunit.py run                 │
│    --kconfig_add CONFIG_DRM_BUDDY=y   │
└──────────────────────────────────────┘

TAP 输出格式示例：
┌────────────────────────────────────┐
│ TAP version 14                     │
│ 1..4                               │
│ ok 1 drm_buddy_test_alloc_simple   │
│ ok 2 drm_buddy_test_alloc_aligned  │
│ not ok 3 drm_buddy_test_oversize   │
│ ok 4 drm_buddy_test_free_merge     │
│ # 3 passed, 1 failed               │
└────────────────────────────────────┘`,
            caption: 'kselftest 从用户态测试 UAPI 接口，KUnit 从内核态测试内部算法。两者互补，TAP 输出格式统一便于 CI 解析。',
          },
          codeWalk: {
            title: 'drm_buddy 分配器 KUnit 测试分析',
            file: 'drivers/gpu/drm/tests/drm_buddy_test.c',
            language: 'c',
            code: `/* drm_buddy_test.c — DRM 伙伴分配器的 KUnit 单元测试
 * 文件: drivers/gpu/drm/tests/drm_buddy_test.c (简化版)
 *
 * drm_buddy 是 DRM 的伙伴分配器，用于 GPU VRAM 地址管理
 * amdgpu 使用它来管理 VRAM 的物理地址空间分配
 */
#include <kunit/test.h>
#include <drm/drm_buddy.h>

/* 测试基本分配功能 */
static void drm_buddy_test_alloc_simple(struct kunit *test)
{
    struct drm_buddy mm;
    struct drm_buddy_block *block;
    LIST_HEAD(allocated);
    /* 初始化 64KB 的伙伴分配器，最小块 4KB */
    int ret = drm_buddy_init(&mm, SZ_64K, SZ_4K);
    KUNIT_ASSERT_EQ(test, ret, 0);

    /* 分配一个 4KB 块 */
    ret = drm_buddy_alloc_blocks(&mm, 0, mm.size,
                                  SZ_4K, &allocated,
                                  DRM_BUDDY_TOPDOWN_ALLOCATION);
    KUNIT_EXPECT_EQ(test, ret, 0);
    KUNIT_EXPECT_EQ(test, !list_empty(&allocated), true);

    /* 验证分配的块大小 */
    block = list_first_entry(&allocated,
                              struct drm_buddy_block, link);
    KUNIT_EXPECT_EQ(test,
        drm_buddy_block_size(&mm, block), (u64)SZ_4K);

    /* 清理 */
    drm_buddy_free_list(&mm, &allocated);
    drm_buddy_fini(&mm);
}

/* 测试对齐分配 */
static void drm_buddy_test_alloc_aligned(struct kunit *test)
{
    struct drm_buddy mm;
    struct drm_buddy_block *block;
    LIST_HEAD(allocated);
    int ret = drm_buddy_init(&mm, SZ_1M, SZ_4K);
    KUNIT_ASSERT_EQ(test, ret, 0);

    /* 分配 64KB 对齐的块 */
    ret = drm_buddy_alloc_blocks(&mm, 0, mm.size,
                                  SZ_64K, &allocated,
                                  DRM_BUDDY_TOPDOWN_ALLOCATION);
    KUNIT_EXPECT_EQ(test, ret, 0);

    block = list_first_entry(&allocated,
                              struct drm_buddy_block, link);
    /* 验证地址是 64KB 对齐的 */
    KUNIT_EXPECT_EQ(test,
        drm_buddy_block_offset(block) & (SZ_64K - 1), 0ULL);

    drm_buddy_free_list(&mm, &allocated);
    drm_buddy_fini(&mm);
}

/* 测试分配失败场景 */
static void drm_buddy_test_alloc_oversize(struct kunit *test)
{
    struct drm_buddy mm;
    LIST_HEAD(allocated);
    int ret = drm_buddy_init(&mm, SZ_64K, SZ_4K);
    KUNIT_ASSERT_EQ(test, ret, 0);

    /* 尝试分配超过总大小的内存 — 应该失败 */
    ret = drm_buddy_alloc_blocks(&mm, 0, mm.size,
                                  SZ_128K, &allocated,
                                  DRM_BUDDY_TOPDOWN_ALLOCATION);
    KUNIT_EXPECT_EQ(test, ret, -ENOSPC);

    drm_buddy_fini(&mm);
}

/* 注册测试套件 */
static struct kunit_case drm_buddy_tests[] = {
    KUNIT_CASE(drm_buddy_test_alloc_simple),
    KUNIT_CASE(drm_buddy_test_alloc_aligned),
    KUNIT_CASE(drm_buddy_test_alloc_oversize),
    {}
};

static struct kunit_suite drm_buddy_test_suite = {
    .name = "drm_buddy",
    .test_cases = drm_buddy_tests,
};
kunit_test_suite(drm_buddy_test_suite);

MODULE_LICENSE("GPL");`,
            annotations: [
              'KUNIT_ASSERT_EQ 用于致命错误（如初始化失败）——失败后立即停止当前测试',
              'KUNIT_EXPECT_EQ 用于非致命断言——失败后继续运行，报告所有失败项',
              'drm_buddy_init(&mm, SZ_64K, SZ_4K) 创建 64KB 总容量、4KB 最小粒度的分配器',
              'DRM_BUDDY_TOPDOWN_ALLOCATION 从高地址向低地址分配，减少碎片',
              'drm_buddy_block_offset() 获取分配块的物理偏移，用于验证对齐',
              'kunit_test_suite() 宏注册测试套件，模块加载时自动运行',
            ],
            explanation: '这个 KUnit 测试直接在内核空间调用 drm_buddy 分配器的内部 API——这是 kselftest 无法做到的，因为 drm_buddy 不暴露给用户空间。注意 ASSERT 和 EXPECT 的不同使用场景：init 用 ASSERT（失败后无法继续），分配结果用 EXPECT（想看到所有失败）。amdgpu 的 VRAM 管理底层就使用 drm_buddy，所以这些测试直接保证了 VRAM 分配的正确性。',
          },
          miniLab: {
            title: '运行 DRM KUnit 测试',
            objective: '编译并运行 DRM 子系统的 KUnit 测试，学会解读 TAP 格式输出。',
            steps: [
              '进入内核源码目录：cd ~/kernel-src',
              '使用 KUnit 运行器执行 drm_buddy 测试：python3 tools/testing/kunit/kunit.py run --kconfig_add CONFIG_DRM=y --kconfig_add CONFIG_DRM_BUDDY=y drm_buddy',
              '或者手动编译为模块：make defconfig && scripts/config --enable DRM --enable DRM_BUDDY --module DRM_BUDDY_SELFTEST && make M=drivers/gpu/drm/tests -j$(nproc)',
              '加载测试模块：sudo insmod drivers/gpu/drm/tests/drm_buddy_test.ko',
              '查看 TAP 输出：dmesg | tail -30（找到 TAP version 开头的行）',
              '统计结果：dmesg | grep -c "ok " && dmesg | grep -c "not ok"',
              '卸载模块：sudo rmmod drm_buddy_test',
              '也可以运行其他 DRM KUnit 测试：ls drivers/gpu/drm/tests/（查看所有可用测试）',
            ],
            expectedOutput: `$ python3 tools/testing/kunit/kunit.py run drm_buddy
[09:32:15] Starting KUnit Kernel ...
[09:32:17] ===================== drm_buddy =====================
[09:32:17] [PASSED] drm_buddy_test_alloc_simple
[09:32:17] [PASSED] drm_buddy_test_alloc_aligned
[09:32:17] [PASSED] drm_buddy_test_alloc_oversize
[09:32:17] [PASSED] drm_buddy_test_free_merge
[09:32:17] ================ [PASSED] drm_buddy =================
[09:32:17] Testing complete. Passed: 4, Failed: 0, Skipped: 0

# 或者通过 dmesg 查看 TAP 输出:
$ dmesg | grep -A 20 "TAP version"
TAP version 14
1..4
ok 1 drm_buddy_test_alloc_simple
ok 2 drm_buddy_test_alloc_aligned
ok 3 drm_buddy_test_alloc_oversize
ok 4 drm_buddy_test_free_merge`,
            hint: 'KUnit 运行器需要内核源码中的 tools/testing/kunit/kunit.py 脚本。如果你遇到 Python 依赖问题，pip3 install junitparser。手动 insmod 方式在任何环境都能工作。',
          },
          debugExercise: {
            title: '修复 KUnit 测试中的 ASSERT/EXPECT 误用',
            language: 'c',
            description: '以下 KUnit 测试混淆了 ASSERT 和 EXPECT 的使用场景，导致测试行为不符合预期。',
            question: '为什么这个测试在某些情况下会 segfault 而不是正常报告 FAIL？',
            buggyCode: `static void test_alloc_and_check(struct kunit *test)
{
    struct drm_buddy mm;
    struct drm_buddy_block *block;
    LIST_HEAD(allocated);

    /* BUG: 用 EXPECT 而非 ASSERT 检查初始化 */
    int ret = drm_buddy_init(&mm, SZ_64K, SZ_4K);
    KUNIT_EXPECT_EQ(test, ret, 0);

    /* 如果 init 失败，mm 未初始化
     * 继续使用 mm 会导致 segfault */
    ret = drm_buddy_alloc_blocks(&mm, 0, mm.size,
                                  SZ_4K, &allocated, 0);

    /* BUG: 用 ASSERT 检查非致命的结果 */
    KUNIT_ASSERT_EQ(test, ret, 0);
    /* 如果 alloc 失败，后续断言永远不执行
     * 我们无法知道 block 验证是否也有问题 */

    block = list_first_entry(&allocated,
                              struct drm_buddy_block, link);
    KUNIT_ASSERT_EQ(test,
        drm_buddy_block_size(&mm, block), (u64)SZ_4K);

    drm_buddy_free_list(&mm, &allocated);
    drm_buddy_fini(&mm);
}`,
            hint: 'KUNIT_ASSERT 失败后立即停止，KUNIT_EXPECT 失败后继续运行。想想哪些失败是"无法继续"的，哪些是"可以继续看看"的。',
            answer: '两个 ASSERT/EXPECT 混淆：（1）drm_buddy_init 的返回值应该用 KUNIT_ASSERT_EQ 而非 KUNIT_EXPECT_EQ。如果 init 失败（ret != 0），mm 结构体未正确初始化，后续使用 mm 调用 drm_buddy_alloc_blocks 会访问未初始化的内存，导致内核 segfault 或 oops。ASSERT 在失败时立即停止测试，防止这种级联崩溃。（2）drm_buddy_alloc_blocks 的返回值应该用 KUNIT_EXPECT_EQ 而非 KUNIT_ASSERT_EQ。分配失败是非致命的——我们可能还想继续检查其他断言来收集更多调试信息。但需要注意：如果 alloc 失败（allocated 列表为空），后续的 list_first_entry 也会出问题，所以实际上这里的 ASSERT 也是合理的——取决于后续代码是否依赖于分配成功。最佳实践：对"后续代码依赖的前置条件"用 ASSERT，对"独立的检查项"用 EXPECT。',
          },
          interviewQ: {
            question: '解释 kselftest 和 KUnit 的区别，各自适用什么场景？为什么 DRM 子系统两者都需要？',
            difficulty: 'medium',
            hint: '从运行空间、测试粒度、硬件依赖、适用场景四个维度对比。',
            answer: 'kselftest vs KUnit 核心区别：（1）运行空间：kselftest 在用户态运行（独立可执行程序），通过系统调用/ioctl 与内核交互；KUnit 在内核态运行（内核模块），直接调用内核内部函数。（2）测试粒度：kselftest 是功能/集成测试——测试 UAPI 接口是否正确（如 GEM ioctl 是否返回正确结果）；KUnit 是单元测试——测试单个函数或算法（如 drm_buddy 分配器的对齐逻辑）。（3）硬件依赖：kselftest 通常需要真实硬件（因为要通过 ioctl 与驱动交互）；KUnit 可以在 UML（User Mode Linux）或 QEMU 中运行，不需要 GPU 硬件。（4）DRM 两者都需要的原因：用户可见的行为（模式设置、buffer 分配/释放、命令提交）需要 kselftest 从用户角度验证；内部算法（buddy 分配器、矩形裁剪、格式转换）需要 KUnit 做细粒度验证。两层测试互补：KUnit 确保算法正确，kselftest 确保接口正确。如果只有 kselftest，内部算法的 bug 难以精确定位；如果只有 KUnit，接口层的问题（参数解析、权限检查）会被遗漏。',
            amdContext: '理解测试策略是 AMD 工程师的核心能力。面试中展示你知道"什么用什么框架测试"说明你对软件质量有系统性思考，而非只会写代码。',
          },
        },

        // ── Lesson 10.2.2 ──────────────────────────────────────
        {
          id: '10-2-2',
          number: '10.2.2',
          title: 'CI 管线与回归测试',
          titleEn: 'CI Pipelines & Regression Testing',
          duration: 15,
          difficulty: 'intermediate',
          tags: ['CI', 'GitLab', 'regression', 'pipeline', 'freedesktop'],
          concept: {
            summary: 'AMD 的 GPU 驱动 CI 基础设施运行在 freedesktop.org 的 GitLab 实例上，包含编译检查、静态分析和真实 GPU 硬件测试三个阶段。理解 CI 管线的工作方式——特别是如何区分真正的回归和已知的不稳定测试——是参与上游开发的必备技能。',
            explanation: [
              'AMD amdgpu 驱动的 CI 运行在 https://gitlab.freedesktop.org/。当一个 Merge Request（MR）被提交到 drm-next 或 amd-staging-drm-next 分支时，GitLab CI 自动触发一系列 pipeline 作业。这些作业在 AMD 提供的硬件测试农场上运行，覆盖从 GCN 到 RDNA3 的多代 GPU。CI 是防止回归（regression）进入主线的最后一道防线。',
              'CI 管线分为三个主要阶段：（1）Build Stage — 在多种配置下编译内核：x86_64 + gcc、x86_64 + clang、arm64 + cross-compile。编译必须零错误零警告（-Werror）。这个阶段在几分钟内完成。（2）Static Analysis Stage — 运行 sparse（类型检查工具，检测 __user/__iomem 指针滥用）、smatch（bug 模式检测）和 checkpatch.pl（代码风格检查）。这个阶段帮助发现不通过运行时测试就能发现的问题。（3）Hardware Test Stage — 在真实 GPU 上运行 IGT 测试套件。每个支持的 GPU 型号有一台或多台测试机，运行完整的 IGT 测试集。这个阶段最耗时（30-60 分钟），但也是最有价值的。',
              '处理 flaky test（不稳定测试）是 CI 维护的核心挑战。flaky test 是指在没有代码变更的情况下，有时 PASS 有时 FAIL 的测试。原因包括：硬件时序差异（不同温度下 GPU 行为微妙不同）、竞态条件（测试中的线程调度不确定性）、环境依赖（测试假设特定的显示器连接状态）。CI 系统使用重试策略（retry 2-3 次，任何一次 PASS 即认为通过）来缓解 flaky test 的影响。',
              'CI 使用 expected-failures 文件（也叫 baseline 或 flakes 文件）来记录已知的失败测试。这个文件列出了在特定硬件上已知会失败的测试用例及其预期的失败状态。CI 在报告结果时，将实际失败与 expected-failures 对比：如果失败在列表中，标记为 "known failure"（不阻塞合并）；如果是新的失败（不在列表中），标记为 "regression"（阻塞合并，必须调查）。这种机制确保了 CI 的可操作性——避免因已知问题不断阻塞新补丁合并。',
              '当你提交的补丁引入了 CI 回归时，你会收到 CI 系统的自动报告，包含：失败的测试名称、失败的具体子测试、测试的输出日志（stdout + dmesg）、以及该测试在 baseline 上的历史表现。你需要分析失败是你的补丁引入的真正回归还是 pre-existing flake。如果是真正的回归，你需要修复或撤回补丁。',
            ],
            keyPoints: [
              'AMD CI 在 freedesktop.org GitLab 上运行：Build → Static Analysis → Hardware Test',
              'Build Stage: gcc/clang 多配置编译，-Werror 零容忍',
              'Static Analysis: sparse（类型检查）+ smatch（Bug 模式）+ checkpatch（代码风格）',
              'Hardware Test: 真实 GPU 运行 IGT 测试套件，覆盖多代硬件',
              'expected-failures 文件区分 "已知失败" 和 "新回归"——只有新回归阻塞合并',
              'Flaky test 策略：重试机制 + known-flaky 标记 + issue 追踪修复',
            ],
          },
          diagram: {
            title: 'AMD CI 管线完整架构',
            content: `AMD amdgpu CI 管线 (freedesktop.org GitLab)

开发者提交 MR (Merge Request)
         │
         ▼
┌─────────────────────────────────────────────────────────┐
│  Stage 1: Build （编译检查）                ~5 min       │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ x86_64-gcc   │  │ x86_64-clang │  │ arm64-cross  │  │
│  │ -Werror      │  │ -Werror      │  │ -Werror      │  │
│  │  PASS ✓      │  │  PASS ✓      │  │  PASS ✓      │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└──────────────────────────┬──────────────────────────────┘
                           │ 全部 PASS 才继续
                           ▼
┌─────────────────────────────────────────────────────────┐
│  Stage 2: Static Analysis （静态分析）      ~10 min      │
│                                                          │
│  ┌──────────────────┐  ┌─────────────┐  ┌────────────┐ │
│  │ sparse           │  │ smatch      │  │ checkpatch │ │
│  │ __user/__iomem   │  │ Bug patterns│  │ Code style │ │
│  │ 类型检查         │  │ NULL deref  │  │ 格式/命名  │ │
│  │  PASS ✓          │  │  PASS ✓     │  │ 1 WARNING  │ │
│  └──────────────────┘  └─────────────┘  └────────────┘ │
└──────────────────────────┬──────────────────────────────┘
                           │ 无 ERROR 才继续
                           ▼
┌─────────────────────────────────────────────────────────┐
│  Stage 3: Hardware Testing （硬件测试）     ~30-60 min   │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ RDNA3 Farm   │  │ RDNA2 Farm   │  │ GCN5 Farm    │  │
│  │ (RX 7600)    │  │ (RX 6800)    │  │ (Vega 56)    │  │
│  │              │  │              │  │              │  │
│  │ IGT tests:   │  │ IGT tests:   │  │ IGT tests:   │  │
│  │ 245 PASS     │  │ 238 PASS     │  │ 210 PASS     │  │
│  │   3 SKIP     │  │  10 SKIP     │  │  38 SKIP     │  │
│  │   1 FAIL *   │  │   1 FAIL *   │  │   1 FAIL *   │  │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  │
│         └──────────────────┼──────────────────┘          │
│                            ▼                             │
│         ┌─────────────────────────────────┐              │
│         │   Baseline Comparison           │              │
│         │                                 │              │
│         │ expected-failures.txt:          │              │
│         │   kms_cursor@pipe-A  FAIL       │              │
│         │   gem_exec@hang      FLAKE      │              │
│         │                                 │              │
│         │ 实际 FAIL vs expected:          │              │
│         │   kms_cursor@pipe-A → KNOWN ✓   │              │
│         │   amd_basic@query   → NEW!! ✗   │              │
│         └─────────────────────────────────┘              │
└──────────────────────────┬──────────────────────────────┘
                           │
                           ▼
              ┌─────────────────────────┐
              │  CI Result              │
              │  ● 新回归: 1            │
              │    amd_basic@query      │
              │  ● 已知失败: 1 (忽略)   │
              │  ● 状态: BLOCKED ⛔      │
              │  → 修复后重新提交       │
              └─────────────────────────┘`,
            caption: 'CI 管线三阶段流程。关键是 baseline comparison——将实际 FAIL 与 expected-failures 文件对比，只有新出现的回归才阻塞合并。这确保了 CI 的实用性。',
          },
          codeWalk: {
            title: '解读 CI Pipeline 结果和 expected-failures 文件',
            file: 'CI pipeline output + expected-failures.txt',
            language: 'text',
            code: `# ========================================
# CI Pipeline 结果示例（GitLab CI 输出）
# ========================================

# Job: igt-amdgpu-rdna3-rx7600
# Status: FAILED (1 new regression)
# Duration: 34m 12s
# Hardware: AMD RX 7600 XT (Navi33)

# --- Test Results Summary ---
# Total:  249
# Pass:   245
# Fail:   3
# Skip:   1

# --- Failures Detail ---
# FAIL: amd_basic@query-info
#   Expected: gpu_info.vram_size > 0
#   Actual:   gpu_info.vram_size == 0
#   Log: https://ci.freedesktop.org/logs/...
#   dmesg: [drm] VRAM: 0M 0b (warning: VRAM not detected)
#
# FAIL: kms_cursor_crc@cursor-128x128-onscreen (KNOWN)
#   Baseline: This test is listed in expected-failures
#   Tracking: https://gitlab.freedesktop.org/drm/amd/-/issues/2847
#
# FAIL: gem_exec_whisper@basic-queues (FLAKE)
#   Baseline: Intermittent failure, 87% pass rate
#   Last 10 runs: PPPPPPFPPP (P=pass, F=fail)

# ========================================
# expected-failures.txt 文件格式
# ========================================
# 格式: <hardware> <test>@<subtest> <expected-status> [optional-note]

# Known hardware limitations
rdna3-rx7600  kms_cursor_crc@cursor-128x128-onscreen  FAIL  # Issue #2847
rdna3-rx7600  kms_writeback@writeback-fb-id            SKIP  # No writeback support

# Known flaky tests (intermittent)
rdna3-rx7600  gem_exec_whisper@basic-queues             FLAKE  # Race condition
rdna3-rx7600  kms_flip@flip-vs-expired-vblank           FLAKE  # Timing sensitive

# GCN specific known failures
gcn5-vega56   amd_cs_nop@compute-ring                   FAIL  # FW bug, won't fix

# ========================================
# 如何分析一个 CI 回归
# ========================================
# Step 1: 确认是否在 expected-failures 中
$ grep "amd_basic@query-info" expected-failures.txt
(no output — 不在列表中 → 是新回归!)

# Step 2: 查看失败的 dmesg 日志
# 关键信息: "VRAM: 0M" — VRAM 检测失败
# 可能原因: 你的补丁影响了 amdgpu_gmc 的 VRAM 检测逻辑

# Step 3: 复现
$ git log --oneline -1   # 确认当前是有问题的提交
$ sudo ./build/tests/amdgpu/amd_basic --run-subtest query-info

# Step 4: bisect（如果需要）
$ git bisect start HEAD known-good-commit
$ git bisect run sudo ./build/tests/amdgpu/amd_basic \\
    --run-subtest query-info`,
            annotations: [
              'CI 结果区分三种状态：新回归（必须修复）、已知失败（KNOWN，有 issue 追踪）、不稳定测试（FLAKE）',
              'expected-failures.txt 按硬件平台分组，记录已知的失败和不稳定测试',
              'FLAKE 标记的测试在 CI 中自动重试 2-3 次，任何一次 PASS 即认为通过',
              'dmesg 日志是诊断回归的关键信息——CI 系统会保存每次运行的完整 dmesg',
              'git bisect run 可以自动化二分查找引入回归的具体提交',
              '回归必须在下一个合并窗口之前修复，否则相关补丁会被 revert',
            ],
            explanation: '这段输出展示了如何解读真实的 CI 管线结果。核心技能是区分"新回归"和"已知失败"——前者是你的补丁引入的问题需要修复，后者是已经存在的问题不应该阻塞你的工作。expected-failures 文件是团队协作的产物——每个人都有责任保持它的准确性。当一个已知问题被修复时，需要从列表中移除对应条目。',
          },
          miniLab: {
            title: '模拟 CI 结果分析流程',
            objective: '练习分析 CI 管线输出，学会区分真正的回归和已知失败，并掌握回归调查步骤。',
            steps: [
              '浏览 AMD 的 GitLab CI 页面：https://gitlab.freedesktop.org/agd5f/linux/-/pipelines（查看真实的 CI 管线）',
              '点击一个最近的 pipeline，查看各个 stage 的状态',
              '找到一个 Hardware Test stage 的作业，查看测试结果和日志',
              '在日志中搜索 "FAIL" 和 "regression" 关键词',
              '查看项目的 expected-failures 文件（如果有的话）：在仓库中搜索 "expected" 或 "flakes"',
              '练习 git bisect：在你自己的内核仓库中，故意引入一个会让某个测试失败的修改，然后用 git bisect 定位它',
              '创建一个示例 expected-failures.txt 文件，记录你在本模块中遇到的测试失败',
            ],
            expectedOutput: `$ git bisect start HEAD HEAD~5
Bisecting: 2 revisions left to test after this (roughly 2 steps)

$ git bisect run ./test_script.sh
running ./test_script.sh
...
abc1234 is the first bad commit
commit abc1234
Author: You <you@example.com>
    drm/amdgpu: accidentally break VRAM query

$ git bisect reset
Previous HEAD position was abc1234
Switched to branch 'main'`,
            hint: 'freedesktop.org 的 GitLab 需要注册账号才能看到部分 CI 详情。git bisect run 需要一个返回 0（good）或非 0（bad）的测试脚本。',
          },
          debugExercise: {
            title: '判断 CI 失败是回归还是已知问题',
            language: 'text',
            description: '你的补丁在 CI 中触发了 3 个测试失败。根据以下信息判断哪些是真正的回归。',
            question: '哪些失败是你需要修复的真正回归？哪些可以忽略？给出理由。',
            buggyCode: `你的补丁: "drm/amdgpu: optimize VRAM allocation path"

CI 失败列表:
1. amd_basic@gem-create
   Failure: igt_assert_eq(r, 0) failed: r = -12 (ENOMEM)
   Baseline history: 100% PASS in last 30 runs
   In expected-failures.txt: NO

2. kms_cursor_crc@cursor-256x256-rapid-movement
   Failure: CRC mismatch (expected vs actual differ by 2 pixels)
   Baseline history: 73% PASS in last 30 runs (flaky)
   In expected-failures.txt: YES (marked as FLAKE)

3. gem_exec_whisper@basic-fds
   Failure: Timeout after 120s
   Baseline history: 98% PASS in last 30 runs
   In expected-failures.txt: NO
   Note: This test occasionally times out on loaded CI machines`,
            hint: '分析每个失败：看 baseline 历史（之前是否一直 PASS）、是否在 expected-failures 中、以及失败模式是否与你的修改相关。',
            answer: '判断：（1）amd_basic@gem-create — 真正的回归，必须修复。理由：baseline 是 100% PASS（从未失败过），不在 expected-failures 中，且失败原因 ENOMEM（内存不足）与你的补丁"optimize VRAM allocation path"直接相关。你的优化可能改变了分配逻辑导致某种情况下分配失败。（2）kms_cursor_crc@cursor-256x256-rapid-movement — 已知的不稳定测试，可以忽略。理由：已在 expected-failures 中标记为 FLAKE，baseline 只有 73% 通过率，失败原因（像素级 CRC 不匹配）与你的 VRAM 修改无关。（3）gem_exec_whisper@basic-fds — 需要调查但可能不是回归。理由：虽然不在 expected-failures 中，但 98% pass rate 说明它偶尔会失败，且失败原因是 timeout（而非逻辑错误），可能是 CI 机器负载高导致。建议：重试 CI 一次，如果第二次 PASS 则确认是 flake，应该将其添加到 expected-failures 中。你的核心工作是修复 #1。',
          },
          interviewQ: {
            question: '描述 GPU 驱动 CI 管线的主要阶段，以及如何处理 CI 中的 flaky test（不稳定测试）。',
            difficulty: 'hard',
            hint: '从 CI 架构、测试分类、flaky test 的识别和处理策略角度回答。',
            answer: 'CI 管线阶段：（1）Build Stage：在多个架构和配置上编译内核（x86_64-gcc、x86_64-clang、arm64-cross），检查编译警告和错误，使用 -Werror 确保零警告；（2）Static Analysis：sparse 检查 __user/__iomem 类型标注、smatch 检测潜在 bug 模式（如 NULL 解引用、整数溢出）、checkpatch 检查代码风格；（3）Hardware Testing：在 RDNA3、RDNA2、GCN 等多代 GPU 的测试机上运行 IGT 测试套件，覆盖 GEM、KMS、CS、电源管理等各功能模块；（4）Regression Analysis：将实际结果与 baseline 对比，将新出现的 FAIL 标记为 regression。Flaky test 处理策略：（1）识别：统计测试在最近 N 次运行中的 PASS/FAIL 比例，pass rate < 95% 标记为 flaky；（2）分类：时序敏感（增加超时/重试次数）、硬件不稳定（温度/功耗波动）、竞态条件（加锁/串行化）、环境依赖（增加 igt_require 检查）；（3）缓解：CI 重试机制（任何一次 PASS 即认为通过），expected-failures 文件记录已知 flaky，不阻塞 MR 合并；（4）修复：创建 issue 追踪每个 flaky test，在下个 release cycle 中修复根本原因并从 expected-failures 中移除。',
            amdContext: 'AMD CI 团队和驱动团队密切协作。面试中展示你理解 CI 不仅是"跑测试"——还涉及 baseline 管理、flaky test 策略、hardware farm 维护——说明你有成熟的工程实践认知。这在 AMD 的 Toolchain/Infra 团队面试中尤为重要。',
          },
        },
      ],
    },
  ],
  completionChecklist: [
    '理解 IGT GPU Tools 的架构：igt_main / igt_subtest / igt_fixture 三层结构',
    '能编写完整的 amdgpu IGT 测试，包括正面测试、负面测试和压力测试',
    '理解 kselftest 和 KUnit 的区别及各自适用场景',
    '能运行 DRM KUnit 测试并解读 TAP 格式输出',
    '理解 AMD CI 管线的三个阶段：Build → Static Analysis → Hardware Test',
    '能分析 CI 结果，区分真正的回归和已知失败（expected-failures）',
    '掌握 git bisect 定位引入回归的提交',
    '理解 flaky test 的处理策略：重试、标记、追踪修复',
  ],
};
